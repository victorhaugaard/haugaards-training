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
import { EditModal } from './components/EditModal'
import { PickerModal } from './components/PickerModal'
import { PersonModal, type NewPerson } from './components/PersonModal'
import { GenerateModal } from './components/GenerateModal'
import { Modal } from './components/Modal'

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
  const auth = useAuth()
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
        <h1>Träning</h1>
        <p className="muted">Logga in för att se och planera träningen.</p>
        <button className="btn primary big" onClick={() => onSignIn().catch((e: Error) => setErr(e.message))}>
          Fortsätt med Google
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
          <h1>Ingen åtkomst</h1>
          <p className="muted">{status.error}</p>
          <button className="btn" onClick={() => auth.signOut()}>
            Logga ut
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
      ? 'Översikt'
      : view === 'day'
      ? cap(fullDate(cursor))
      : view === 'week'
        ? `Vecka ${weekNumber(cursor)}`
        : cap(monthYear(cursor))
  const subtitle =
    view === 'overview' ? 'Alla månader' : view === 'week' ? `${dayMonth(range[0])} – ${dayMonth(range[1])} · ${PHASE_LABEL[phaseFor(addDays(range[0], 3))]}` : view === 'day' ? PHASE_LABEL[phaseFor(cursor)] : ''

  const handleDrop = (e: DragEvent, date: string, beforeId?: string) => {
    e.preventDefault()
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain')) as { kind: 'session' | 'card'; id: string }
      if (data.kind === 'session') {
        if (data.id !== beforeId) dispatch({ type: 'move', id: data.id, date, beforeId })
      } else {
        const card = cardById(data.id)
        if (card) dispatch({ type: 'addFromCard', card, date })
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
      sessions = generatePlan({ personId: id, start: startOfWeek(today()), end: PLAN_END, hoursPerWeek: n.hours, runMode: n.runMode })
    dispatch({ type: 'addPerson', person: { id, name: n.name, createdAt: Date.now(), runMode: n.runMode }, sessions })
  }

  const regenerate = (o: GenerateChoice) => {
    dispatch({ type: 'updatePerson', id: person.id, patch: { runMode: o.runMode } })
    const doneDays = new Set(mine.filter((s) => s.done).map((s) => s.date))
    const sessions = generatePlan({ personId: person.id, start: o.start, end: o.end, hoursPerWeek: o.hours, runMode: o.runMode }).filter(
      (s) => !doneDays.has(s.date),
    )
    dispatch({ type: 'regenerate', personId: person.id, from: o.start, sessions })
  }

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#/" title="Startsida">
          H
        </a>
        <div className="people">
          {state.people.map((p) => (
            <button
              key={p.id}
              className={'pill' + (p.id === person.id ? ' on' : '')}
              onClick={() => dispatch({ type: 'setPerson', id: p.id })}
            >
              {p.name}
            </button>
          ))}
          <button className="pill ghost" onClick={() => setDialog('person')} aria-label="Lägg till person">
            +
          </button>
        </div>
        <div className="nav">
          {view !== 'overview' && (
            <>
              <button className="icon-btn" onClick={() => step(-1)} aria-label="Föregående">
                ‹
              </button>
              <button className="btn small" onClick={() => setCursor(today())}>
                Idag
              </button>
              <button className="icon-btn" onClick={() => step(1)} aria-label="Nästa">
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
          <Segmented value={view} options={VIEWS} onChange={setView} />
          {view !== 'overview' && (
            <button className="icon-btn" onClick={() => setLibOpen((o) => !o)} aria-label="Visa/dölj träningskort" title="Träningskort">
              ▤
            </button>
          )}
          <button className="icon-btn" onClick={() => setDialog('menu')} aria-label="Meny">
            ⋯
          </button>
        </div>
      </header>

      {view !== 'overview' && <StatsBar sessions={inRange} label={view === 'day' ? 'Dag' : view === 'week' ? 'Vecka' : 'Månad'} />}

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
            <h3>Träningskort</h3>
            <p className="muted small">Dra till en dag – eller tryck på + i en dag.</p>
            <CardLibrary />
          </aside>
        )}
      </div>

      {editing && (
        <EditModal
          key={editing.id}
          session={editing}
          onClose={() => setEditId(null)}
          onSave={(patch) => dispatch({ type: 'update', id: editing.id, patch })}
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
      {dialog === 'generate' && <GenerateModal name={person.name} initialRunMode={person.runMode ?? 'little'} onGenerate={regenerate} onClose={() => setDialog(null)} />}
      {dialog === 'guide' && (
        <Modal wide title={`Om planen · ${person.name}`} onClose={() => setDialog(null)}>
          <PlanGuide sessions={mine} runMode={person.runMode ?? 'little'} />
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
          onDeletePerson={() => {
            if (confirm(`Ta bort ${person.name} och hela planen?`)) dispatch({ type: 'deletePerson', id: person.id })
            setDialog(null)
          }}
          onLoad={(s) => dispatch({ type: 'load', state: s })}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  )
}

interface MenuProps {
  auth: AuthState
  state: AppState
  personName: string
  canDelete: boolean
  onGenerate: () => void
  onGuide: () => void
  onDeletePerson: () => void
  onLoad: (s: AppState) => void
  onClose: () => void
}

function MenuModal({ auth, state, personName, canDelete, onGenerate, onGuide, onDeletePerson, onLoad, onClose }: MenuProps) {
  const file = useRef<HTMLInputElement>(null)
  const zones = useZones()

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
      alert('Filen kunde inte läsas.')
    }
  }

  return (
    <Modal title="Meny" onClose={onClose}>
      <div className="field">
        <span>Intensitetszoner</span>
        <Segmented
          value={zones.system}
          onChange={(v: ZoneSystem) => zones.setSystem(v)}
          options={(Object.keys(ZONE_SYSTEMS) as ZoneSystem[]).map((k) => [k, ZONE_SYSTEMS[k].title])}
        />
        <span className="hint">
          {zones.system === 'no'
            ? 'Norska Olympiatoppen-skalan: I1 lugn, I2 distans, I3 tempo, I4 tröskel, I5 max.'
            : 'Engelska: Z2 = lugn jogg, Z2+ = övre aerob/steady, sedan Z3 tempo, Z4 tröskel, Z5 VO₂max.'}
        </span>
      </div>
      <div className="menu">
        <button className="btn" onClick={onGuide}>
          Om planen för {personName}
        </button>
        <button className="btn" onClick={onGenerate}>
          Autogenerera plan för {personName}
        </button>
        <button className="btn" onClick={exportJson}>
          Exportera allt (JSON)
        </button>
        <button className="btn" onClick={() => file.current?.click()}>
          Importera (JSON)
        </button>
        <input ref={file} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
        {auth.enabled && (
          <button className="btn" onClick={() => auth.signOut()}>
            Logga ut{auth.user?.email ? ` (${auth.user.email})` : ''}
          </button>
        )}
        {canDelete && (
          <button className="btn danger" onClick={onDeletePerson}>
            Ta bort {personName}
          </button>
        )}
      </div>
      <p className="muted small">{auth.enabled ? 'Datan synkas via Firebase och delas med alla som är inloggade.' : 'Data sparas i den här webbläsaren (Firebase är inte kopplat). Använd export/import för att flytta mellan enheter.'}</p>
    </Modal>
  )
}
