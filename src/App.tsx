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
import { tr, LANGS, DEFAULT_LANG_BY_EMAIL, WELCOME_NAME_BY_EMAIL, VIEWER_BY_EMAIL, hasSavedLang, type Lang } from './i18n/core'
import { useLang } from './i18n'
import { useTheme } from './lib/theme'
import { CoachChat } from './components/CoachChat'
import { CardInfoModal } from './components/CardInfoModal'
import { ProfileView } from './components/ProfileView'
import { SessionMenu } from './components/SessionMenu'
import { Toast, type ToastData } from './components/Toast'
import { withTotal } from './lib/sessionOps'
import { Avatar } from './components/Avatar'
import { PlanModal } from './components/PlanModal'
import { scaleUpcoming } from './lib/sessionOps'
import { COACHES, coachById, coachLabel, readCoach, relationOf, saveCoach, whoFor, type Relation } from './lib/coaches'
import { CoachAvatar } from './components/CoachAvatar'
import { NoticeToast, type Notice } from './components/NoticeToast'
import { useFeed } from './lib/feed'
import { findCheers, pickCheer } from './lib/cheers'
import { StrengthBuilder, type StrengthValue } from './components/StrengthBuilder'
import { sessionMinutes } from './lib/stats'
import { TabBar } from './components/TabBar'
import { LegalPage } from './components/LegalPage'

const VIEWS: [View, string][] = [
  ['day', 'Dag'],
  ['week', 'Vecka'],
  ['month', 'Månad'],
  ['overview', 'Översikt'],
]

const ENTERED = 'haugaards-training:entered'
const VIEW_KEY = 'haugaards-training:view'
const LIB_KEY = 'haugaards-training:lib-panel'
const saveSetting = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v)
  } catch {
    /* ignorera */
  }
}
// Vy och sidopanel kommer ihåg hur du hade dem
const readView = (): View => {
  try {
    const v = localStorage.getItem(VIEW_KEY)
    if (v === 'day' || v === 'week' || v === 'month' || v === 'overview' || v === 'profile') return v
  } catch {
    /* ignorera */
  }
  return 'week'
}
const SIDE_KEY = 'haugaards-training:side-width'
const readSideW = () => {
  try {
    const n = Number(localStorage.getItem(SIDE_KEY))
    if (n >= 220 && n <= 560) return n
  } catch {
    /* ignorera */
  }
  return 288
}
const readLibOpen = () => {
  try {
    return localStorage.getItem(LIB_KEY) !== '0'
  } catch {
    return true
  }
}
type Page = 'landing' | 'app' | 'privacy' | 'terms'
// Allt efter ett ? i hashen (t.ex. #/plan?strava=connected) hör till frågeparametrarna, inte routen
const hashPath = () => location.hash.split('?')[0]
export const hashQuery = () => new URLSearchParams(location.hash.split('?')[1] ?? '')
const pageFromHash = (): Page => (hashPath() === '#/plan' ? 'app' : hashPath() === '#/privacy' ? 'privacy' : hashPath() === '#/terms' ? 'terms' : 'landing')
const readPage = (): Page => {
  if (hashPath() === '#/privacy' || hashPath() === '#/terms') return pageFromHash()
  let entered = false
  try {
    entered = localStorage.getItem(ENTERED) === '1'
  } catch {
    /* ignorera */
  }
  return hashPath() === '#/plan' || (!location.hash && entered) ? 'app' : 'landing'
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
  const [page, setPage] = useState<Page>(readPage)
  useEffect(() => {
    const on = () => setPage(pageFromHash())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  if (page === 'privacy' || page === 'terms') return <LegalPage kind={page} />
  if (page === 'landing')
    return (
      <Landing
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
        <img className="login-logo" src="/haugaards_training_logo.png" alt="Haugaards training" draggable={false} />
        <p className="muted">{tr('Logga in för att se och planera träningen.')}</p>
        <button className="btn primary big" onClick={() => onSignIn().catch((e: Error) => setErr(e.message))}>
          {tr('Fortsätt med Google')}
        </button>
        {err && <p className="error">{err}</p>}
        <p className="muted small">
          <a href="#/privacy">{tr('Integritetspolicy')}</a> · <a href="#/terms">{tr('Användarvillkor')}</a>
        </p>
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
  const [view, setView] = useState<View>(readView)
  const [cursor, setCursor] = useState(today())
  const [editId, setEditId] = useState<string | null>(null)
  const [pickDate, setPickDate] = useState<string | null>(null)
  const [dialog, setDialog] = useState<null | 'person' | 'generate' | 'menu' | 'guide'>(null)
  const [libOpen, setLibOpen] = useState(readLibOpen)
  const [sideW, setSideW] = useState(readSideW)
  const [resizing, setResizing] = useState(false)
  useEffect(() => saveSetting(VIEW_KEY, view), [view])
  useEffect(() => saveSetting(LIB_KEY, libOpen ? '1' : '0'), [libOpen])
  const [infoCard, setInfoCard] = useState<TrainingCard | null>(null)
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null)
  const [swapId, setSwapId] = useState<string | null>(null)
  const [planOpen, setPlanOpen] = useState<string | null>(null)
  const [editExId, setEditExId] = useState<string | null>(null)
  const [backView, setBackView] = useState<View>('week')
  const [toast, setToast] = useState<ToastData | null>(null)

  // Meddelande efter att man kommer tillbaka från Strava-anslutningen
  useEffect(() => {
    const status = hashQuery().get('strava')
    if (!status) return
    location.hash = '#/plan' // städa bort frågeparametern
    const text = {
      connected: tr('Strava är nu ihopkopplat.'),
      denied: tr('Anslutningen till Strava avbröts.'),
      error: tr('Kunde inte koppla ihop Strava. Försök igen.'),
    }[status]
    if (text) setToast({ id: Date.now(), text })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Första gången vissa konton loggar in pulserar + för att visa var man lägger till sin egen person
  const email = auth.user?.email?.toLowerCase()
  const welcomeName = email ? WELCOME_NAME_BY_EMAIL[email] : undefined
  const welcomeKey = 'haugaards-training:welcomed:' + email
  const [nudge, setNudge] = useState(() => {
    if (!welcomeName) return false
    try {
      return !localStorage.getItem(welcomeKey)
    } catch {
      return false
    }
  })
  const [coachId, setCoachId] = useState(readCoach)
  const [chatOpen, setChatOpen] = useState(false)
  // Den som chattar: inloggad pappa har eget tilltal, annars går det på den valda personen
  const viewerInfo = email ? VIEWER_BY_EMAIL[email] : undefined
  const viewer: { name: string; relation: Relation } = viewerInfo ?? { name: person.name, relation: relationOf(person.name) }
  // Första gången ett känt konto loggar in väljs kontots egen person direkt (t.ex. pappa), om den finns
  useEffect(() => {
    if (!viewerInfo || !email) return
    const key = 'haugaards-training:own-person:' + email
    try {
      if (localStorage.getItem(key)) return
    } catch {
      /* ignorera */
    }
    const own = state.people.find((p) => relationOf(p.name) === viewerInfo.relation)
    if (!own) return
    saveSetting(key, '1')
    if (own.id !== person.id) dispatch({ type: 'setPerson', id: own.id })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.people, email])
  const [notice, setNotice] = useState<Notice | null>(null)
  const { feed, add: addFeed, markRead } = useFeed(person.id)
  const changeCoach = (id: string) => (setCoachId(id), saveCoach(id))
  const [newName, setNewName] = useState<string | undefined>()

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
    view === 'profile'
      ? tr('Profil')
      : view === 'overview'
      ? tr('Översikt')
      : view === 'day'
      ? cap(fullDate(cursor))
      : view === 'week'
        ? tr('Vecka {n}', { n: weekNumber(cursor) })
        : cap(monthYear(cursor))
  const subtitle =
    view === 'profile' ? person.name : view === 'overview' ? tr('Alla månader') : view === 'week' ? `${dayMonth(range[0])} – ${dayMonth(range[1])} · ${tr(PHASE_LABEL[phaseFor(addDays(range[0], 3))])}` : view === 'day' ? tr(PHASE_LABEL[phaseFor(cursor)]) : ''

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

  const showSide = view !== 'overview' && view !== 'profile'
  const stepping = showSide
  const noUpcoming = !mine.some((s) => s.date >= today() && s.category !== 'rest')
  // Peppmeddelanden när pass, veckor och milstolpar avklaras
  const prevDone = useRef<Set<string> | null>(null)
  const prevPerson = useRef('')
  useEffect(() => {
    const now = new Set(mine.filter((s) => s.done).map((s) => s.id))
    if (prevPerson.current !== person.id || !prevDone.current) {
      prevPerson.current = person.id
      prevDone.current = now
      return
    }
    const newly = mine.filter((s) => s.done && !prevDone.current!.has(s.id))
    prevDone.current = now
    if (!newly.length) return

    const key = 'haugaards-training:awards:' + person.id
    let awarded = new Set<string>()
    try {
      awarded = new Set(JSON.parse(localStorage.getItem(key) ?? '[]'))
    } catch {
      /* ignorera */
    }
    const activePlan = state.plans.find((p) => p.personId === person.id && !p.endedAt)
    const { cheers, silent } = findCheers(mine, newly, activePlan, awarded)
    for (const k of [...silent, ...cheers.map((c) => c.key)]) awarded.add(k)
    saveSetting(key, JSON.stringify([...awarded].slice(-400)))
    if (!cheers.length) return

    const coach = coachById(coachId)
    const who = whoFor(coach, viewer.relation, viewer.name, tr)
    const seen = chatOpen // är chatten redan öppen läser man meddelandet direkt
    let top = ''
    for (const c of [...cheers].reverse()) {
      top = tr(pickCheer(coach.id, c.kind), { who, title: c.title ? tr(c.title) : '', pct: c.pct ?? '' })
      addFeed({ coachId: coach.id, text: top, read: seen })
    }
    if (!seen) setNotice({ id: String(Date.now()), coachId: coach.id, text: top })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mine, person.id])

  const menuSession = menu ? mine.find((s) => s.id === menu.id) : undefined
  const swapSession = swapId ? mine.find((s) => s.id === swapId) : undefined

  // Ta bort med möjlighet att ångra en stund
  const deleteWithUndo = (s: Session) => {
    dispatch({ type: 'delete', id: s.id })
    setToast({ id: Date.now(), text: tr('Passet togs bort'), undo: () => dispatch({ type: 'addSession', session: s }) })
  }

  // Eget styrkepass från byggaren
  const buildStrength = (v: StrengthValue) => {
    const session: Session = {
      id: uid(),
      personId: person.id,
      date: v.date,
      order: 0,
      cardId: 'strength-custom',
      title: v.title,
      sport: 'Styrka',
      category: 'strength',
      zones: [0, 0, 0, 0, 0],
      nonZone: v.minutes,
      notes: '',
      done: false,
      location: v.location,
      exercises: v.exercises,
    }
    dispatch({ type: 'addSession', session })
  }

  const createPerson = (n: NewPerson) => {
    const id = uid()
    let sessions: Session[] = []
    if (n.mode === 'copy') sessions = copyPlan(state.sessions.filter((s) => s.personId === n.basedOn), id, n.scale, n.runMode)
    if (n.mode === 'generate')
      sessions = generatePlan({ personId: id, start: n.start, end: n.end, hoursPerWeek: n.hours, runMode: n.runMode, restDay: n.restDay })
    const first = sessions.map((s) => s.date).sort()[0] ?? startOfWeek(today())
    dispatch({
      type: 'addPerson',
      person: { id, name: n.name, createdAt: Date.now(), runMode: n.runMode, restDay: n.restDay },
      sessions,
      plan: {
        start: n.mode === 'copy' ? first : n.start,
        end: n.mode === 'copy' ? PLAN_END : n.end,
        runMode: n.runMode,
        restDay: n.restDay,
        source: n.mode === 'copy' ? 'copied' : 'generated',
        ...(n.mode === 'generate' ? { hours: n.hours } : {}),
      },
    })
  }

  const regenerate = (o: GenerateChoice) => {
    dispatch({ type: 'updatePerson', id: person.id, patch: { runMode: o.runMode, restDay: o.restDay } })
    const doneDays = new Set(o.fresh ? [] : mine.filter((s) => s.done).map((s) => s.date))
    const sessions = generatePlan({ personId: person.id, start: o.start, end: o.end, hoursPerWeek: o.hours, runMode: o.runMode, restDay: o.restDay }).filter(
      (s) => !doneDays.has(s.date),
    )
    dispatch({
      type: 'regenerate',
      personId: person.id,
      from: o.start,
      sessions,
      fresh: o.fresh,
      plan: { start: o.start, end: o.end, hours: o.hours, runMode: o.runMode, restDay: o.restDay, source: 'generated' },
    })
  }

  return (
    <DragProvider>
    <div className="app">
      <CoachChat person={person} sessions={mine} plans={state.plans.filter((p) => p.personId === person.id)} dispatch={dispatch} getToken={auth.user ? () => auth.user!.getIdToken() : undefined} viewer={viewer} coachId={coachId} onCoachChange={changeCoach} open={chatOpen} onOpenChange={setChatOpen} feed={feed} onRead={markRead} />
      <div className="aurora" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <header className="topbar">
        <div className="people">
          <a className="brand" href="#/" title={tr('Startsida')}>
            <img src="/haugaards_icon.png" alt="H" draggable={false} />
          </a>
          {state.people.map((p) => (
            <button
              key={p.id}
              className={'pill' + (p.id === person.id ? ' on' : '')}
              onClick={() => dispatch({ type: 'setPerson', id: p.id })}
            >
              {p.photoUrl && <Avatar person={p} size={18} />}
              {p.name}
            </button>
          ))}
          <button className={'pill ghost' + (nudge ? ' pulse' : '')} onClick={() => {
              if (nudge && welcomeName) setNewName(welcomeName)
              if (nudge) {
                saveSetting(welcomeKey, '1')
                setNudge(false)
              }
              setDialog('person')
            }} aria-label={tr('Lägg till person')}>
            +
          </button>
        </div>
        <div className="nav">
          {stepping && (
            <button className="today-btn" onClick={() => setCursor(today())}>
              {tr('Idag')}
            </button>
          )}
          <div className={'pager' + (stepping ? '' : ' plain')}>
            {stepping && (
              <button className="pager-arrow" onClick={() => step(-1)} aria-label={tr('Föregående')}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M15 5l-7 7 7 7" />
                </svg>
              </button>
            )}
            <div className="nav-title">
              <strong>{title}</strong>
              {subtitle && <span>{subtitle}</span>}
            </div>
            {stepping && (
              <button className="pager-arrow" onClick={() => step(1)} aria-label={tr('Nästa')}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className="right">
          <Segmented value={view} options={VIEWS.map(([v, l]) => [v, tr(l)] as [View, string])} onChange={setView} />
          <button className={'avatar-btn' + (view === 'profile' ? ' on' : '')} onClick={() => (view === 'profile' ? setView(backView) : (setBackView(view), setView('profile')))} title={tr('Profil')} aria-label={tr('Profil')}>
            <Avatar person={person} size={30} />
          </button>
          <button className="icon-btn" onClick={() => setDialog('menu')} aria-label={tr('Meny')}>
            ⋯
          </button>
        </div>
      </header>

      <div className={'layout' + (libOpen ? ' with-lib' : '')}>
        <div className="content">
        {showSide && <StatsBar sessions={inRange} label={tr(view === 'day' ? 'Dag' : view === 'week' ? 'Vecka' : 'Månad')} />}
        <main className="main" key={view + (view === 'overview' || view === 'profile' ? '' : cursor)}>
          {view === 'profile' ? (
            <ProfileView
              person={person}
              sessions={mine}
              plans={state.plans.filter((p) => p.personId === person.id)}
              onUpdatePerson={(patch) => dispatch({ type: 'updatePerson', id: person.id, patch })}
              onBack={() => setView(backView)}
              onOpenPlan={(pl) => setPlanOpen(pl.id)}
              onGuide={() => setDialog('guide')}
              onGenerate={() => setDialog('generate')}
              getToken={auth.user ? () => auth.user!.getIdToken() : undefined}
            />
          ) : view === 'overview' ? (
            <Overview sessions={mine} onOpenMonth={(d) => (setCursor(d), setView('month'))} />
          ) : (
          <>
          {noUpcoming && (
            <div className="empty-plan">
              <div>
                <strong>{tr(mine.length ? 'Inga kommande pass' : 'Ingen träningsplan ännu')}</strong>
                <span>{tr('Autogenerera en plan efter dina timmar och din vilodag.')}</span>
              </div>
              <button className="btn primary" onClick={() => setDialog('generate')}>
                {tr('Autogenerera plan')}
              </button>
            </div>
          )}
          <Board
            view={view}
            cursor={cursor}
            sessions={mine}
            onOpen={(s) => setEditId(s.id)}
            onToggle={(id) => dispatch({ type: 'toggleDone', id })}
            onPatch={(id, patch) => dispatch({ type: 'update', id, patch })}
            onContext={(s, x, y) => setMenu({ id: s.id, x, y })}
            onAdd={setPickDate}
            onDropTo={handleDrop}
            onOpenDay={(d) => (setCursor(d), setView('day'))}
          />
          </>
          )}
        </main>
        </div>
        {!libOpen && showSide && (
          <button className="side-tab" onClick={() => setLibOpen(true)} aria-label={tr('Visa träningskort')}>
            ‹ {tr('Träningskort')}
          </button>
        )}
        {libOpen && showSide && (
          <aside className="side" style={{ width: sideW }}>
            <div
              className={'side-resize' + (resizing ? ' dragging' : '')}
              role="separator"
              aria-orientation="vertical"
              onPointerDown={(e) => {
                e.preventDefault()
                setResizing(true)
                let w = sideW
                const move = (ev: PointerEvent) => {
                  w = Math.max(220, Math.min(560, window.innerWidth - ev.clientX))
                  setSideW(w)
                }
                const up = () => {
                  setResizing(false)
                  saveSetting(SIDE_KEY, String(Math.round(w)))
                  window.removeEventListener('pointermove', move)
                  window.removeEventListener('pointerup', up)
                }
                window.addEventListener('pointermove', move)
                window.addEventListener('pointerup', up)
              }}
            />
            <div className="side-head">
              <h3>{tr('Träningskort')}</h3>
              <button className="icon-btn" onClick={() => setLibOpen(false)} aria-label={tr('Dölj träningskort')} title={tr('Dölj träningskort')}>
                ›
              </button>
            </div>
            <p className="muted small">{tr('Dra till en dag, eller tryck på ett kort för att se detaljerna.')}</p>
            <CardLibrary onPick={setInfoCard} />
          </aside>
        )}
      </div>

      <TabBar view={view} onChange={(v) => (v === 'profile' && view !== 'profile' && setBackView(view), setView(v))} />

      {editing && (
        <SessionModal
          key={editing.id}
          session={editing}
          onClose={() => setEditId(null)}
          onPatch={(patch) => dispatch({ type: 'update', id: editing.id, patch })}
          onToggle={() => dispatch({ type: 'toggleDone', id: editing.id })}
          onDelete={() => deleteWithUndo(editing)}
          onDuplicate={() => dispatch({ type: 'duplicate', id: editing.id })}
          onEditExercises={() => (setEditId(null), setEditExId(editing.id))}
        />
      )}
      {infoCard?.id === 'strength-custom' && (
        <StrengthBuilder date={cursor} onSave={buildStrength} onClose={() => setInfoCard(null)} />
      )}
      {editExId && mine.find((s) => s.id === editExId) && (
        <StrengthBuilder
          editing
          date={mine.find((s) => s.id === editExId)!.date}
          initial={{
            title: mine.find((s) => s.id === editExId)!.title,
            exercises: mine.find((s) => s.id === editExId)!.exercises,
            minutes: sessionMinutes(mine.find((s) => s.id === editExId)!),
            location: mine.find((s) => s.id === editExId)!.location,
          }}
          onSave={(v) => dispatch({ type: 'update', id: editExId, patch: { title: v.title, exercises: v.exercises, nonZone: v.minutes, location: v.location } })}
          onClose={() => setEditExId(null)}
        />
      )}
      {infoCard && infoCard.id !== 'strength-custom' && (
        <CardInfoModal
          card={infoCard}
          defaultDate={cursor}
          onClose={() => setInfoCard(null)}
          onAdd={(card, date, location, technique) => dispatch({ type: 'addFromCard', card, date, location, technique })}
        />
      )}
      {planOpen && state.plans.find((p) => p.id === planOpen) && (
        <PlanModal
          plan={state.plans.find((p) => p.id === planOpen)!}
          person={person}
          sessions={mine}
          onClose={() => setPlanOpen(null)}
          onRegenerate={() => setDialog('generate')}
          onApplyHours={(hours, factor) => {
            dispatch({ type: 'setPersonSessions', personId: person.id, sessions: scaleUpcoming(mine, today(), factor) })
            dispatch({ type: 'updatePlan', id: planOpen, patch: { hours } })
          }}
        />
      )}
      {menu && menuSession && (
        <SessionMenu
          session={menuSession}
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          onOpen={() => setEditId(menuSession.id)}
          onToggleDone={() => dispatch({ type: 'toggleDone', id: menuSession.id })}
          onSetTotal={(total) => dispatch({ type: 'update', id: menuSession.id, patch: withTotal(menuSession, total) })}
          onMove={(date) => dispatch({ type: 'update', id: menuSession.id, patch: { date } })}
          onSwap={() => setSwapId(menuSession.id)}
          onDuplicate={() => dispatch({ type: 'duplicate', id: menuSession.id })}
          onDelete={() => deleteWithUndo(menuSession)}
        />
      )}
      {swapSession && (
        <PickerModal
          swap
          date={swapSession.date}
          onClose={() => setSwapId(null)}
          onPick={(card, _date, location, technique) => dispatch({ type: 'replaceWithCard', id: swapSession.id, card, location, technique })}
        />
      )}
      {notice && !chatOpen && <NoticeToast notice={notice} relation={viewer.relation} onOpen={() => (setChatOpen(true), setNotice(null))} onClose={() => setNotice(null)} />}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
      {pickDate && (
        <PickerModal
          date={pickDate}
          onClose={() => setPickDate(null)}
          onPick={(card: TrainingCard, date, location, technique) => dispatch({ type: 'addFromCard', card, date, location, technique })}
          onBuild={buildStrength}
        />
      )}
      {dialog === 'person' && (
        <PersonModal people={state.people} activeId={person.id} initialName={newName} onCreate={createPerson} onClose={() => (setDialog(null), setNewName(undefined))} />
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
          coachId={coachId}
          relation={viewer.relation}
          onCoach={changeCoach}
          state={state}
          personName={person.name}
          canDelete={state.people.length > 1}
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
  relation: Relation
  coachId: string
  onCoach: (id: string) => void
  auth: AuthState
  state: AppState
  personName: string
  canDelete: boolean
  planCount: number
  onClearPlan: () => void
  onDeletePerson: () => void
  onLoad: (s: AppState) => void
  onClose: () => void
}

function MenuModal({ relation, coachId, onCoach, auth, state, personName, canDelete, planCount, onClearPlan, onDeletePerson, onLoad, onClose }: MenuProps) {
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
            : tr('Engelska (puls, som Garmin/Polar): Z2 = lugn jogg, Z3 = aerob, Z4 = tempo, Z4+ = tröskel, Z5 = max. I3 och I4 ligger båda i Z4.')}
        </span>
      </div>
      <div className="field">
        <span>{tr('Språk')}</span>
        <Segmented value={lang} onChange={(l: Lang) => setLang(l)} options={LANGS} />
      </div>
      <div className="field">
        <span>{tr('Coach')}</span>
        <div className="coach-grid" role="listbox" aria-label={tr('Välj coach')}>
          {COACHES.map((c) => (
            <button key={c.id} role="option" aria-selected={c.id === coachId} className={c.id === coachId ? 'on' : ''} onClick={() => onCoach(c.id)} title={c.name}>
              <CoachAvatar coach={c} size={44} />
              <span>{coachLabel(c, relation).replace('Coach ', '')}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <span>{tr('Färgtema')}</span>
        <div className="theme-grid" role="listbox" aria-label={tr('Färgtema')}>
          {(['blue', 'mono'] as const).map((t) => (
            <button key={t} role="option" aria-selected={theme === t} className={'theme-btn ' + t + (theme === t ? ' on' : '')} onClick={() => setTheme(t)}>
              <span>{tr(t === 'blue' ? 'Blå' : 'Svartvit')}</span>
              {theme === t && <b>✓</b>}
            </button>
          ))}
        </div>
      </div>
      <div className="menu">
        <div className="menu-row">
          <button className="btn small" onClick={exportJson} title={tr('Exportera allt (JSON)')}>
            {tr('Exportera')}
          </button>
          <button className="btn small" onClick={() => file.current?.click()} title={tr('Importera (JSON)')}>
            {tr('Importera')}
          </button>
        </div>
        <input ref={file} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
        <div className="menu-row">
          {auth.enabled ? (
            <button className="btn small" onClick={() => auth.signOut()} title={auth.user?.email ?? undefined}>
              {tr('Logga ut')}
            </button>
          ) : (
            <span />
          )}
          <button className="btn small danger" disabled={!planCount} onClick={onClearPlan} title={tr('Radera hela planen för {name}', { name: personName })}>
            {tr('Radera planen')}
          </button>
        </div>
        {canDelete && (
          <button className="btn small danger" onClick={onDeletePerson}>
            {tr('Ta bort {name}', { name: personName })}
          </button>
        )}
      </div>
      {auth.enabled && auth.user?.email && <p className="muted small">{tr('Inloggad som {email}', { email: auth.user.email })}</p>}
      <p className="muted small">
        <a href="#/privacy">{tr('Integritetspolicy')}</a> · <a href="#/terms">{tr('Användarvillkor')}</a>
      </p>
      <p className="muted small">{tr(auth.enabled ? 'Datan synkas via Firebase och delas med alla som är inloggade.' : 'Data sparas i den här webbläsaren (Firebase är inte kopplat). Använd export/import för att flytta mellan enheter.')}</p>
    </Modal>
  )
}
