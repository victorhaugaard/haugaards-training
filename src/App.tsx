import { useEffect, useMemo, useRef, useState, type DragEvent, type Dispatch } from 'react'
import type { AppState, Person, Session, TrainingCard, View } from './types'
import { useStore, type Action } from './store'
import { useAuth, type AuthState } from './auth'
import { useZones } from './lib/zones'
import { ZONE_SYSTEMS, type ZoneSystem } from './lib/cards'
import { Segmented } from './components/Segmented'
import { Landing } from './components/Landing'
import { PlanGuide } from './components/PlanGuide'
import type { GenerateChoice } from './components/GenerateModal'
import { Overview } from './components/Overview'
import { addDays, addMonths, cap, dayMonth, fullDate, iso, monthYear, parse, startOfWeek, today, weekNumber } from './lib/dates'
import { cardById } from './lib/cards'
import { PLAN_END, copyPlan, generatePlan, phaseFor, PHASE_LABEL } from './lib/generator'
import { uid } from './lib/id'
import { Board } from './components/Board'
import { CardLibrary } from './components/CardLibrary'
import { StatsBar } from './components/StatsBar'
import { SessionModal } from './components/SessionModal'
import { DragProvider } from './lib/drag'
import { PickerModal } from './components/PickerModal'
import { PersonModal, type NewPerson } from './components/PersonModal'
import { GenerateModal } from './components/GenerateModal'
import { Modal } from './components/Modal'
import { tr, LANGS, DEFAULT_LANG_BY_EMAIL, hasSavedLang, type Lang } from './i18n/core'
import { useLang } from './i18n'
import { useTheme } from './lib/theme'
import { CoachChat } from './components/CoachChat'

const VIEWS: [View, string][] = [
  ['day', 'Dag'],
  ['week', 'Vecka'],
  ['month', 'Månad'],
  ['overview', 'Översikt'],
]

const ENTERED = 'haugaards-training:entered'
const readPage = () => {
  let entered = false
  try {
    entered = localStorage.getItem(ENTERED) === '1'
  } catch {
    /* ignorera */
  }
  return location.hash === '#/plan' || (!location.hash && entered) ? 'app' : 'landing'
}

export function App() {
  const { setLang } = useLang() // renderar också om hela appen när språket byts
  const auth = useAuth()
  const email = auth.user?.email?.toLowerCase()
  useEffect(() => {
    // Vissa konton startar på ett eget språk, tills man själv valt ett
    const l = email ? DEFAULT_LANG_BY_EMAIL[email] : undefined
    if (l && !hasSavedLang()) setLang(l)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email])
  const [page, setPage] = useState<'landing' | 'app'>(readPage)
  useEffect(() => {
    const on = () => setPage(location.hash === '#/plan' ? 'app' : 'landing')
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  if (page === 'landing')
    return (
      <Landing
        signedIn={!auth.enabled || !!auth.user}
        onEnter={() => {
          try {
            localStorage.setItem(ENTERED, '1')
          } catch {
            /* ignorera */
          }
          location.hash = '#/plan'
        }}
      />
    )
  if (auth.enabled && !auth.ready) return <div className="splash" />
  if (auth.enabled && !auth.user) return <Login onSignIn={auth.signIn} />
  return <Planner auth={auth} />
}

function Login({ onSignIn }: { onSignIn: () => Promise<void> }) {
  const [err, setErr] = useState('')
  return (
    <div className="splash">
      <div className="login">
        <div className="logo" />
        <h1>{tr('Träning')}</h1>
        <p className="muted">{tr('Logga in för att se och planera träningen.')}</p>
        <button className="btn primary big" onClick={() => onSignIn().catch((e: Error) => setErr(e.message))}>
          {tr('Fortsätt med Google')}
        </button>
        {err && <p className="error">{err}</p>}
      </div>
    </div>
  )
}

function Planner({ auth }: { auth: AuthState }) {
  const [state, dispatch, status] = useStore(auth.enabled)
  const person = state.people.find((p) => p.id === state.activePersonId) ?? state.people[0]
  if (status.error) {
    return (
      <div className="splash">
        <div className="login">
          <h1>{tr('Ingen åtkomst')}</h1>
          <p className="muted">{status.error}</p>
          <button className="btn" onClick={() => auth.signOut()}>
            {tr('Logga ut')}
          </button>
        </div>
      </div>
    )
  }
  if (!status.ready || !person) return <div className="splash" />
  return <Workspace state={state} dispatch={dispatch} person={person} auth={auth} />
}

function Workspace({
  state,
  dispatch,
  person,
  auth,
}: {
  state: AppState
  dispatch: Dispatch<Action>
  person: Person
  auth: AuthState
}) {
  const [view, setView] = useState<View>('week')
  const [cursor, setCursor] = useState(today())
  const [editId, setEditId] = useState<string | null>(null)
  const [pickDate, setPickDate] = useState<string | null>(null)
  const [dialog, setDialog] = useState<null | 'person' | 'generate' | 'menu' | 'guide'>(null)
  const [libOpen, setLibOpen] = useState(true)

  const mine = useMemo(() => state.sessions.filter((s) => s.personId === person.id), [state.sessions, person.id])
  const editing = mine.find((s) => s.id === editId)

  const step = (dir: 1 | -1) =>
    setCursor((c) => (view === 'day' ? addDays(c, dir) : view === 'week' ? addDays(c, 7 * dir) : addMonths(c, dir)))

  const range = useMemo(() => {
    if (view === 'day') return [cursor, cursor]
    if (view === 'week') return [startOfWeek(cursor), addDays(startOfWeek(cursor), 6)]
    const d = parse(cursor)
    return [iso(new Date(d.getFullYear(), d.getMonth(), 1, 12)), iso(new Date(d.getFullYear(), d.getMonth() + 1, 0, 12))]
  }, [view, cursor])
  const inRange = mine.filter((s) => s.date >= range[0] && s.date <= range[1])

  const title =
    view === 'overview'
      ? tr('Översikt')
      : view === 'day'
      ? cap(fullDate(cursor))
      : view === 'week'
        ? tr('Vecka {n}', { n: weekNumber(cursor) })
        : cap(monthYear(cursor))
  const subtitle =
    view === 'overview' ? tr('Alla månader') : view === 'week' ? `${dayMonth(range[0])} – ${dayMonth(range[1])} · ${tr(PHASE_LABEL[phaseFor(addDays(range[0], 3))])}` : view === 'day' ? tr(PHASE_LABEL[phaseFor(cursor)]) : ''

  const handleDrop = (e: DragEvent, date: string, beforeId?: string) => {
    e.preventDefault()
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain')) as { kind: 'session' | 'card'; id: string }
      if (data.kind === 'session') {
        if (data.id !== beforeId) dispatch({ type: 'move', id: data.id, date, beforeId })
      } else {
        const card = cardById(data.id)
        if (card) dispatch({ type: 'addFromCard', card, date, beforeId })
      }
    } catch {
      /* ogiltig drop */
    }
  }

  const createPerson = (n: NewPerson) => {
    const id = uid()
    let sessions: Session[] = []
    if (n.mode === 'copy') sessions = copyPlan(state.sessions.filter((s) => s.personId === n.basedOn), id, n.scale, n.runMode)
    if (n.mode === 'generate')
      sessions = generatePlan({ personId: id, start: startOfWeek(today()), end: PLAN_END, hoursPerWeek: n.hours, runMode: n.runMode, restDay: n.restDay })
    dispatch({ type: 'addPerson', person: { id, name: n.name, createdAt: Date.now(), runMode: n.runMode, restDay: n.restDay }, sessions })
  }

  const regenerate = (o: GenerateChoice) => {
    dispatch({ type: 'updatePerson', id: person.id, patch: { runMode: o.runMode, restDay: o.restDay } })
    const doneDays = new Set(o.fresh ? [] : mine.filter((s) => s.done).map((s) => s.date))
    const sessions = generatePlan({ personId: person.id, start: o.start, end: o.end, hoursPerWeek: o.hours, runMode: o.runMode, restDay: o.restDay }).filter(
      (s) => !doneDays.has(s.date),
    )
    dispatch({ type: 'regenerate', personId: person.id, from: o.start, sessions, fresh: o.fresh })
  }

  return (
    <DragProvider>
    <div className="app">
      <CoachChat person={person} sessions={mine} dispatch={dispatch} getToken={auth.user ? () => auth.user!.getIdToken() : undefined} />
      <div className="aurora" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <header className="topbar">
        <div className="people">
          <a className="brand" href="#/" title={tr('Startsida')}>
            H
          </a>
          {state.people.map((p) => (
            <button
              key={p.id}
              className={'pill' + (p.id === person.id ? ' on' : '')}
              onClick={() => dispatch({ type: 'setPerson', id: p.id })}
            >
              {p.name}
            </button>
          ))}
          <button className="pill ghost" onClick={() => setDialog('person')} aria-label={tr('Lägg till person')}>
            +
          </button>
        </div>
        <div className="nav">
          {view !== 'overview' && (
            <>
              <button className="icon-btn" onClick={() => step(-1)} aria-label={tr('Föregående')}>
                ‹
              </button>
              <button className="btn small" onClick={() => setCursor(today())}>
                {tr('Idag')}
              </button>
              <button className="icon-btn" onClick={() => step(1)} aria-label={tr('Nästa')}>
                ›
              </button>
            </>
          )}
          <div className="nav-title">
            <strong>{title}</strong>
            {subtitle && <span>{subtitle}</span>}
          </div>
        </div>
        <div className="right">
          <Segmented value={view} options={VIEWS.map(([v, l]) => [v, tr(l)] as [View, string])} onChange={setView} />
          {view !== 'overview' && (
            <button className="icon-btn" onClick={() => setLibOpen((o) => !o)} aria-label={tr('Visa/dölj träningskort')} title={tr('Träningskort')}>
              ▤
            </button>
          )}
          <button className="icon-btn" onClick={() => setDialog('menu')} aria-label={tr('Meny')}>
            ⋯
          </button>
        </div>
      </header>

      {view !== 'overview' && <StatsBar sessions={inRange} label={tr(view === 'day' ? 'Dag' : view === 'week' ? 'Vecka' : 'Månad')} />}

      <div className={'layout' + (libOpen ? ' with-lib' : '')}>
        <main className="main" key={view + (view === 'overview' ? '' : cursor)}>
          {view === 'overview' ? (
            <Overview sessions={mine} onOpenMonth={(d) => (setCursor(d), setView('month'))} />
          ) : (
          <Board
            view={view}
            cursor={cursor}
            sessions={mine}
            onOpen={(s) => setEditId(s.id)}
            onToggle={(id) => dispatch({ type: 'toggleDone', id })}
            onPatch={(id, patch) => dispatch({ type: 'update', id, patch })}
            onAdd={setPickDate}
            onDropTo={handleDrop}
            onOpenDay={(d) => (setCursor(d), setView('day'))}
          />
          )}
        </main>
        {libOpen && view !== 'overview' && (
          <aside className="side">
            <h3>{tr('Träningskort')}</h3>
            <p className="muted small">{tr('Dra till en dag – eller tryck på + i en dag.')}</p>
            <CardLibrary />
          </aside>
        )}
      </div>

      {editing && (
        <SessionModal
          key={editing.id}
          session={editing}
          onClose={() => setEditId(null)}
          onPatch={(patch) => dispatch({ type: 'update', id: editing.id, patch })}
          onToggle={() => dispatch({ type: 'toggleDone', id: editing.id })}
          onDelete={() => dispatch({ type: 'delete', id: editing.id })}
          onDuplicate={() => dispatch({ type: 'duplicate', id: editing.id })}
        />
      )}
      {pickDate && (
        <PickerModal
          date={pickDate}
          onClose={() => setPickDate(null)}
          onPick={(card: TrainingCard) => dispatch({ type: 'addFromCard', card, date: pickDate })}
        />
      )}
      {dialog === 'person' && (
        <PersonModal people={state.people} activeId={person.id} onCreate={createPerson} onClose={() => setDialog(null)} />
      )}
      {dialog === 'generate' && <GenerateModal name={person.name} initialRunMode={person.runMode ?? 'little'} initialRestDay={person.restDay ?? 0} onGenerate={regenerate} onClose={() => setDialog(null)} />}
      {dialog === 'guide' && (
        <Modal wide title={tr('Om planen · {name}', { name: person.name })} onClose={() => setDialog(null)}>
          <PlanGuide sessions={mine} runMode={person.runMode ?? 'little'} restDay={person.restDay ?? 0} />
        </Modal>
      )}
      {dialog === 'menu' && (
        <MenuModal
          auth={auth}
          state={state}
          personName={person.name}
          canDelete={state.people.length > 1}
          onGenerate={() => setDialog('generate')}
          onGuide={() => setDialog('guide')}
          planCount={mine.length}
          onClearPlan={() => {
            if (confirm(tr('Radera hela planen för {name}? {n} pass tas bort, även genomförda. Det går inte att ångra.', { name: person.name, n: mine.length }))) {
              dispatch({ type: 'clearPlan', personId: person.id })
              setDialog(null)
            }
          }}
          onDeletePerson={() => {
            if (confirm(tr('Ta bort {name} och hela planen?', { name: person.name }))) dispatch({ type: 'deletePerson', id: person.id })
            setDialog(null)
          }}
          onLoad={(s) => dispatch({ type: 'load', state: s })}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
    </DragProvider>
  )
}

interface MenuProps {
  auth: AuthState
  state: AppState
  personName: string
  canDelete: boolean
  onGenerate: () => void
  onGuide: () => void
  planCount: number
  onClearPlan: () => void
  onDeletePerson: () => void
  onLoad: (s: AppState) => void
  onClose: () => void
}

function MenuModal({ auth, state, personName, canDelete, onGenerate, onGuide, planCount, onClearPlan, onDeletePerson, onLoad, onClose }: MenuProps) {
  const file = useRef<HTMLInputElement>(null)
  const zones = useZones()
  const { lang, setLang } = useLang()
  const { theme, setTheme } = useTheme()

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `traning-${today()}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importJson = async (f: File) => {
    try {
      const s = JSON.parse(await f.text()) as AppState
      if (!s.people?.length || !Array.isArray(s.sessions)) throw new Error()
      onLoad(s)
      onClose()
    } catch {
      alert(tr('Filen kunde inte läsas.'))
    }
  }

  return (
    <Modal title={tr('Meny')} onClose={onClose}>
      <div className="field">
        <span>{tr('Intensitetszoner')}</span>
        <Segmented
          value={zones.system}
          onChange={(v: ZoneSystem) => zones.setSystem(v)}
          options={(Object.keys(ZONE_SYSTEMS) as ZoneSystem[]).map((k) => [k, tr(ZONE_SYSTEMS[k].title)])}
        />
        <span className="hint">
          {zones.system === 'no'
            ? tr('Norska Olympiatoppen-skalan: I1 lugn, I2 distans, I3 tempo, I4 tröskel, I5 max.')
            : tr('Engelska: Z2 = lugn jogg, Z2+ = övre aerob/steady, sedan Z3 tempo, Z4 tröskel, Z5 VO₂max.')}
        </span>
      </div>
      <div className="field">
        <span>{tr('Språk')}</span>
        <Segmented value={lang} onChange={(l: Lang) => setLang(l)} options={LANGS} />
      </div>
      <div className="field">
        <span>{tr('Färgtema')}</span>
        <Segmented
          value={theme}
          onChange={setTheme}
          options={[
            ['blue', tr('Blå')],
            ['mono', tr('Svartvit')],
          ]}
        />
      </div>
      <div className="menu">
        <button className="btn" onClick={onGuide}>
          {tr('Om planen för {name}', { name: personName })}
        </button>
        <button className="btn" onClick={onGenerate}>
          {tr('Autogenerera plan för {name}', { name: personName })}
        </button>
        <button className="btn danger" disabled={!planCount} onClick={onClearPlan}>
          {tr('Radera hela planen för {name}', { name: personName })}
        </button>
        <button className="btn" onClick={exportJson}>
          {tr('Exportera allt (JSON)')}
        </button>
        <button className="btn" onClick={() => file.current?.click()}>
          {tr('Importera (JSON)')}
        </button>
        <input ref={file} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
        {auth.enabled && (
          <button className="btn" onClick={() => auth.signOut()}>
            {tr('Logga ut')}{auth.user?.email ? ` (${auth.user.email})` : ''}
          </button>
        )}
        {canDelete && (
          <button className="btn danger" onClick={onDeletePerson}>
            {tr('Ta bort {name}', { name: personName })}
          </button>
        )}
      </div>
      <p className="muted small">{tr(auth.enabled ? 'Datan synkas via Firebase och delas med alla som är inloggade.' : 'Data sparas i den här webbläsaren (Firebase är inte kopplat). Använd export/import för att flytta mellan enheter.')}</p>
    </Modal>
  )
}
