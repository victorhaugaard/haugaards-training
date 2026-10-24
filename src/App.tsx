import { useEffect, useMemo, useRef, useState, type DragEvent, type Dispatch } from 'react'
import type { AppState, CustomTemplate, Person, Session, TrainingCard, View } from './types'
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
import { PLAN_END, copyPlan, phaseFor, PHASE_LABEL } from './lib/generator'
import { buildPlan } from './lib/buildPlan'
import { personPlanType, personSports, planTypeOf } from './lib/trainSports'
import { isAdmin } from './lib/access'
import { AccessModal } from './components/AccessModal'
import { Login, VerifyEmail } from './components/Login'
import { WorkoutBuilder } from './components/WorkoutBuilder'
import { ChangePlanModal, type ChangeAction } from './components/ChangePlanModal'
import { GoalModal, ResultsView } from './components/ResultsView'
import { GoalField } from './components/GoalField'
import { goalLabel, testById } from './lib/tests'
import { CARDS } from './lib/cards'
import { DEFAULT_PREFS, prefsHours } from './lib/fitnessGenerator'
import { templateCard, upsertTemplate } from './lib/templates'
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
import { TabBar } from './components/TabBar'
import { LegalPage } from './components/LegalPage'

const VIEWS: [View, string][] = [
  ['day', 'Dag'],
  ['week', 'Vecka'],
  ['month', 'Månad'],
  ['overview', 'Översikt'],
  ['results', 'Resultat'],
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
    if (v === 'day' || v === 'week' || v === 'month' || v === 'overview' || v === 'results' || v === 'profile') return v
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
  if (auth.enabled && !auth.user) return <Login auth={auth} />
  if (auth.enabled && auth.user && !auth.user.emailVerified) return <VerifyEmail auth={auth} />
  return <Planner auth={auth} />
}

function Planner({ auth }: { auth: AuthState }) {
  const [state, dispatch, status] = useStore(auth.enabled)
  const person = state.people.find((p) => p.id === state.activePersonId) ?? state.people[0]
  if (status.error) {
    const denied = /permission|insufficient/i.test(status.error)
    const who = auth.user?.email ?? ''
    return (
      <div className="splash">
        <div className="login">
          <h1>{tr(denied ? 'Ingen åtkomst än' : 'Något gick fel')}</h1>
          <p className="muted">
            {denied
              ? tr('Kontot {email} har inte fått åtkomst. Be Victor lägga till det under Meny → Hantera åtkomst, och logga sedan in igen.', { email: who })
              : status.error}
          </p>
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
  const [dialog, setDialog] = useState<null | 'person' | 'onboard' | 'generate' | 'menu' | 'guide' | 'access' | 'change' | 'goal'>(null)
  const [genStep, setGenStep] = useState<'sports' | 'plan'>('sports')
  const [coachPrompt, setCoachPrompt] = useState<{ id: number; text: string } | undefined>()
  const [libOpen, setLibOpen] = useState(readLibOpen)
  const [sideW, setSideW] = useState(readSideW)
  const [resizing, setResizing] = useState(false)
  useEffect(() => saveSetting(VIEW_KEY, view), [view])
  useEffect(() => saveSetting(LIB_KEY, libOpen ? '1' : '0'), [libOpen])
  const [infoCard, setInfoCard] = useState<TrainingCard | null>(null)
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null)
  const [swapId, setSwapId] = useState<string | null>(null)
  const [planOpen, setPlanOpen] = useState<string | null>(null)
  const [tpl, setTpl] = useState<{ t?: CustomTemplate; date: string } | null>(null)
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
  // Familjemedlemmar som lagts till via Hantera åtkomst: välj deras egen person, eller låt dem skapa en första gången
  const ownPerson = email ? state.people.find((p) => p.ownerEmail === email) : undefined
  useEffect(() => {
    if (!ownPerson) return
    const key = 'haugaards-training:own-person:' + email
    try {
      if (localStorage.getItem(key) === ownPerson.id) return
    } catch {
      /* ignorera */
    }
    saveSetting(key, ownPerson.id)
    if (ownPerson.id !== person.id) dispatch({ type: 'setPerson', id: ownPerson.id })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownPerson?.id])
  const needsOnboarding = auth.enabled && !!email && !isAdmin(email) && !viewerInfo && !ownPerson
  useEffect(() => {
    if (needsOnboarding) setDialog((d) => d ?? 'onboard')
  }, [needsOnboarding])
  const fitness = personPlanType(person) === 'fitness'
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
      : view === 'results'
      ? tr('Resultat')
      : view === 'overview'
      ? tr('Översikt')
      : view === 'day'
      ? cap(fullDate(cursor))
      : view === 'week'
        ? tr('Vecka {n}', { n: weekNumber(cursor) })
        : cap(monthYear(cursor))
  // Med ett mål visas det (och nedräkningen) i stället för träningsfasen
  const goalText = person.goal ? goalLabel(person.goal, tr) + (person.goal.date && person.goal.date >= today() ? ` · ${tr('{n} dagar kvar', { n: Math.round((new Date(person.goal.date + 'T12:00').getTime() - new Date(today() + 'T12:00').getTime()) / 86400000) })}` : '') : ''
  const phaseText = (d: string) => (goalText ? `${tr('Mål')}: ${goalText}` : fitness ? '' : tr(PHASE_LABEL[phaseFor(d)]))
  const subtitle =
    view === 'profile' || view === 'results' ? person.name : view === 'overview' ? tr('Alla månader') : view === 'week' ? `${dayMonth(range[0])} – ${dayMonth(range[1])}${phaseText(addDays(range[0], 3)) ? ' · ' + phaseText(addDays(range[0], 3)) : ''}` : view === 'day' ? phaseText(cursor) : ''

  // Egna pass (Mina pass) hör till personen
  const templates = person.templates ?? []
  const findCard = (id: string) => {
    const t = templates.find((x) => x.id === id)
    return t ? templateCard(t) : cardById(id)
  }
  const saveTemplate = (t: CustomTemplate) => dispatch({ type: 'updatePerson', id: person.id, patch: { templates: upsertTemplate(person.templates, t) } })
  const deleteTemplate = (id: string) => dispatch({ type: 'updatePerson', id: person.id, patch: { templates: templates.filter((x) => x.id !== id) } })

  const handleDrop = (e: DragEvent, date: string, beforeId?: string) => {
    e.preventDefault()
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain')) as { kind: 'session' | 'card'; id: string }
      if (data.kind === 'session') {
        if (data.id !== beforeId) dispatch({ type: 'move', id: data.id, date, beforeId })
      } else {
        const card = findCard(data.id)
        if (card) dispatch({ type: 'addFromCard', card, date, beforeId })
      }
    } catch {
      /* ogiltig drop */
    }
  }

  const showSide = view !== 'overview' && view !== 'profile' && view !== 'results'
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
    // Loggade testresultat (utan träningstid) ger ingen pepp
    const newly = mine.filter((s) => s.done && !prevDone.current!.has(s.id) && (s.zones.some(Boolean) || s.nonZone > 0))
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

  const createPerson = (n: NewPerson, ownerEmail?: string) => {
    const id = uid()
    let sessions: Session[] = []
    if (n.mode === 'copy') sessions = copyPlan(state.sessions.filter((s) => s.personId === n.basedOn), id, n.scale, n.runMode, n.focus)
    if (n.mode === 'generate') sessions = buildPlan(id, n)
    const first = sessions.map((s) => s.date).sort()[0] ?? startOfWeek(today())
    dispatch({
      type: 'addPerson',
      person: { id, name: n.name, createdAt: Date.now(), runMode: n.runMode, restDay: n.restDay, focus: n.focus, sports: n.sports, ...(planTypeOf(n.sports) === 'fitness' ? { fitness: n.fitness } : {}), ...(n.goal ? { goal: n.goal } : {}), ...(ownerEmail ? { ownerEmail } : {}) },
      sessions,
      plan: {
        start: n.mode === 'copy' ? first : n.start,
        end: n.mode === 'copy' ? PLAN_END : n.end,
        runMode: n.runMode,
        restDay: n.restDay,
        focus: n.focus,
        sports: n.sports,
        ...(planTypeOf(n.sports) === 'fitness' ? { fitness: n.fitness } : {}),
        source: n.mode === 'copy' ? 'copied' : 'generated',
        ...(n.mode === 'generate' ? { hours: n.hours } : {}),
      },
    })
  }

  const regenerate = (o: GenerateChoice) => {
    const isFit = planTypeOf(o.sports) === 'fitness'
    dispatch({ type: 'updatePerson', id: person.id, patch: { runMode: o.runMode, restDay: o.restDay, focus: o.focus, sports: o.sports, fitness: isFit ? o.fitness : undefined, goal: o.goal } })
    const doneDays = new Set(o.fresh ? [] : mine.filter((s) => s.done).map((s) => s.date))
    const sessions = buildPlan(person.id, o).filter((s) => !doneDays.has(s.date))
    dispatch({
      type: 'regenerate',
      personId: person.id,
      from: o.start,
      sessions,
      fresh: o.fresh,
      plan: { start: o.start, end: o.end, hours: o.hours, runMode: o.runMode, restDay: o.restDay, focus: o.focus, sports: o.sports, ...(isFit ? { fitness: o.fitness } : {}), source: 'generated' },
    })
  }

  // Personens nuvarande planval, som utgångspunkt för ändringar från idag
  const activePlan = state.plans.find((p) => p.personId === person.id && !p.endedAt)
  const currentChoice = (): GenerateChoice => {
    const prefs = person.fitness ?? DEFAULT_PREFS
    return {
      start: today(),
      end: activePlan?.end && activePlan.end > today() ? activePlan.end : PLAN_END,
      hours: fitness ? prefsHours(prefs) : (activePlan?.hours ?? 12),
      runMode: person.runMode ?? 'little',
      restDay: person.restDay ?? 0,
      focus: person.focus ?? 'balanced',
      sports: personSports(person),
      fitness: prefs,
      ...(person.goal ? { goal: person.goal } : {}),
      fresh: false,
    }
  }

  const changePlan = (a: ChangeAction) => {
    const t = today()
    const movable = (s: Session) => s.date >= t && !s.done && s.category !== 'race' && !s.raceId
    if (a.kind === 'scale') {
      dispatch({ type: 'setPersonSessions', personId: person.id, sessions: scaleUpcoming(mine, t, a.factor) })
      if (activePlan?.hours) dispatch({ type: 'updatePlan', id: activePlan.id, patch: { hours: Math.round(activePlan.hours * a.factor * 2) / 2 } })
      setToast({ id: Date.now(), text: tr('Kommande pass justerade {pct}%', { pct: Math.round(a.factor * 100) }) })
    } else if (a.kind === 'restDay') {
      regenerate({ ...currentChoice(), restDay: a.restDay })
      setToast({ id: Date.now(), text: tr('Planen är ombyggd med ny vilodag') })
    } else if (a.mode === 'shift') {
      dispatch({ type: 'setPersonSessions', personId: person.id, sessions: mine.map((s) => (movable(s) ? { ...s, date: addDays(s.date, 7) } : s)) })
      setToast({ id: Date.now(), text: tr('Kommande pass flyttade en vecka framåt') })
    } else {
      const end = addDays(t, 6)
      const week = (s: Session) => movable(s) && s.date <= end && s.category !== 'rest'
      const next = mine
        .filter((s) => !(week(s) && (s.category === 'quality' || s.category === 'hard')))
        .map((s) => (week(s) ? { ...s, zones: s.zones.map((z) => Math.round(z / 10) * 5) as Session['zones'], nonZone: Math.round(s.nonZone / 10) * 5 } : s))
      dispatch({ type: 'setPersonSessions', personId: person.id, sessions: next })
      setToast({ id: Date.now(), text: tr('Veckan är lättare: hårda pass borttagna, övriga halverade') })
    }
  }

  // Ett resultat från ett test som gjorts utanför planen sparas som ett avklarat testpass
  const addResult = (testId: string, value: number, date: string) => {
    const card = CARDS.find((c) => c.tests?.includes(testId) || c.homeTests?.includes(testId))
    const home = !card?.tests?.includes(testId)
    dispatch({
      type: 'addSession',
      session: {
        id: uid(),
        personId: person.id,
        date,
        order: 0,
        cardId: card?.id ?? 'other',
        title: testById(testId)?.name ?? card?.name ?? 'Test',
        sport: card?.sport ?? 'Övrigt',
        category: 'quality',
        zones: [0, 0, 0, 0, 0],
        nonZone: 0,
        notes: '',
        done: true,
        ...(card?.home ? { location: home ? ('home' as const) : ('gym' as const) } : {}),
        results: { [testId]: value },
      },
    })
  }

  return (
    <DragProvider>
    <div className="app">
      <CoachChat person={person} sessions={mine} plans={state.plans.filter((p) => p.personId === person.id)} dispatch={dispatch} getToken={auth.user ? () => auth.user!.getIdToken() : undefined} viewer={viewer} coachId={coachId} onCoachChange={changeCoach} open={chatOpen} onOpenChange={setChatOpen} feed={feed} onRead={markRead} prompt={coachPrompt} />
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
        <main className="main" key={view + (view === 'overview' || view === 'profile' || view === 'results' ? '' : cursor)}>
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
              onChangePlan={() => setDialog('change')}
              onEditGoal={() => setDialog('goal')}
              getToken={auth.user ? () => auth.user!.getIdToken() : undefined}
            />
          ) : view === 'results' ? (
            <ResultsView person={person} sessions={mine} onEditGoal={() => setDialog('goal')} onAddResult={addResult} onOpenSession={(id) => setEditId(id)} />
          ) : view === 'overview' ? (
            <Overview sessions={mine} onOpenMonth={(d) => (setCursor(d), setView('month'))} />
          ) : (
          <>
          {!noUpcoming && (
            <div className="plan-bar">
              {person.goal ? (
                <button className="plan-goal" onClick={() => setView('results')} title={tr('Visa resultat')}>
                  <span aria-hidden>⚑</span> {goalText}
                </button>
              ) : (
                <button className="plan-goal muted" onClick={() => setDialog('goal')}>
                  <span aria-hidden>⚑</span> {tr('Sätt ett mål')}
                </button>
              )}
              <button className="btn small primary plan-change" onClick={() => setDialog('change')}>
                {tr('Ändra plan')}
              </button>
            </div>
          )}
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
          <button className="side-tab" onClick={() => setLibOpen(true)} aria-label={tr('Visa träningspass')}>
            ‹ {tr('Träningspass')}
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
              <h3>{tr('Träningspass')}</h3>
              <button className="icon-btn" onClick={() => setLibOpen(false)} aria-label={tr('Dölj träningspass')} title={tr('Dölj träningspass')}>
                ›
              </button>
            </div>
            <p className="muted small">{tr('Dra till en dag, eller tryck på ett kort för att se detaljerna.')}</p>
            <CardLibrary onPick={setInfoCard} templates={templates} onNewTemplate={() => setTpl({ date: cursor })} onPickTemplate={(t) => setTpl({ t, date: cursor })} />
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
        />
      )}
      {infoCard?.id === 'strength-custom' && (
        <StrengthBuilder date={cursor} onSave={buildStrength} onClose={() => setInfoCard(null)} />
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
          templates={templates}
          onNewTemplate={() => setTpl({ date: pickDate })}
        />
      )}
      {tpl && (
        <WorkoutBuilder
          key={tpl.t?.id ?? 'new'}
          initial={tpl.t}
          date={tpl.date}
          onSave={saveTemplate}
          onAddToDay={(t, date) => dispatch({ type: 'addFromCard', card: templateCard(t), date })}
          onDelete={tpl.t ? () => deleteTemplate(tpl.t!.id) : undefined}
          onClose={() => setTpl(null)}
        />
      )}
      {dialog === 'person' && (
        <PersonModal people={state.people} activeId={person.id} initialName={newName} onCreate={(n) => createPerson(n, needsOnboarding ? email : undefined)} onClose={() => (setDialog(null), setNewName(undefined))} />
      )}
      {dialog === 'onboard' && (
        <PersonModal
          people={state.people}
          activeId={person.id}
          onboarding
          initialName={auth.user?.displayName?.split(' ')[0] ?? ''}
          onCreate={(n) => createPerson(n, email)}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === 'access' && email && <AccessModal me={email} onClose={() => setDialog(null)} />}
      {dialog === 'generate' && (
        <GenerateModal person={person} startStep={genStep} onGenerate={regenerate} onClose={() => (setDialog(null), setGenStep('sports'))} />
      )}
      {dialog === 'change' && (
        <ChangePlanModal
          person={person}
          coachName={coachLabel(coachById(coachId), viewer.relation)}
          onApply={changePlan}
          onRebuild={() => setDialog('generate')}
          onGoal={() => setDialog('goal')}
          onAskCoach={(text) => (setChatOpen(true), setCoachPrompt({ id: Date.now(), text }))}
          onClose={() => setDialog((d) => (d === 'change' ? null : d))}
        />
      )}
      {dialog === 'goal' && (
        <GoalModal goal={person.goal} onSave={(goal) => dispatch({ type: 'updatePerson', id: person.id, patch: { goal } })} onClose={() => setDialog(null)}>
          {(g, set) => <GoalField value={g} sports={personSports(person)} onChange={set} />}
        </GoalModal>
      )}
      {dialog === 'guide' && (
        <Modal wide title={tr('Om planen · {name}', { name: person.name })} onClose={() => setDialog(null)}>
          <PlanGuide sessions={mine} runMode={person.runMode ?? 'little'} restDay={person.restDay ?? 0} fitness={fitness} />
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
          onAccess={isAdmin(email) ? () => setDialog('access') : undefined}
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
  onAccess?: () => void
  onClose: () => void
}

function MenuModal({ relation, coachId, onCoach, auth, state, personName, canDelete, planCount, onClearPlan, onDeletePerson, onLoad, onAccess, onClose }: MenuProps) {
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
        {onAccess && (
          <button className="btn small" onClick={onAccess}>
            {tr('Hantera åtkomst')}
          </button>
        )}
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
