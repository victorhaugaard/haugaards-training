import { useEffect, useReducer, useRef, useState } from 'react'
import { collection, doc, onSnapshot, writeBatch } from 'firebase/firestore'
import type { AppState, Person, Session, TrainingCard } from './types'
import { db } from './firebase'
import { generatePlan } from './lib/generator'
import { uid } from './lib/id'

const KEY = 'haugaards-training:v1'
const ACTIVE_KEY = 'haugaards-training:active'

export type Action =
  | { type: 'addFromCard'; card: TrainingCard; date: string }
  | { type: 'update'; id: string; patch: Partial<Session> }
  | { type: 'move'; id: string; date: string; beforeId?: string }
  | { type: 'delete'; id: string }
  | { type: 'duplicate'; id: string }
  | { type: 'toggleDone'; id: string }
  | { type: 'setPerson'; id: string }
  | { type: 'updatePerson'; id: string; patch: Partial<Person> }
  | { type: 'addPerson'; person: Person; sessions: Session[] }
  | { type: 'deletePerson'; id: string }
  | { type: 'regenerate'; personId: string; from: string; sessions: Session[] }
  | { type: 'load'; state: AppState }
  | { type: 'remote'; people: Person[]; sessions: Session[] }

const initial = (): AppState => {
  const me: Person = { id: uid(), name: 'Victor', createdAt: 0, runMode: 'little' }
  return {
    people: [me],
    activePersonId: me.id,
    sessions: generatePlan({ personId: me.id, start: '2026-09-21', end: '2026-12-31', hoursPerWeek: 12, runMode: 'little' }),
  }
}

const load = (): AppState => {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const s = JSON.parse(raw) as AppState
      if (s.people?.length && Array.isArray(s.sessions)) return s
    }
  } catch {
    /* ignorera */
  }
  return initial()
}

const renumber = (sessions: Session[], personId: string, date: string) => {
  const day = sessions.filter((s) => s.personId === personId && s.date === date).sort((a, b) => a.order - b.order)
  const orders = new Map(day.map((s, i) => [s.id, i]))
  return sessions.map((s) => (orders.has(s.id) ? { ...s, order: orders.get(s.id)! } : s))
}

const reducer = (state: AppState, a: Action): AppState => {
  switch (a.type) {
    case 'addFromCard': {
      const order = state.sessions.filter((s) => s.personId === state.activePersonId && s.date === a.date).length
      const c = a.card
      const s: Session = {
        id: uid(),
        personId: state.activePersonId,
        date: a.date,
        order,
        cardId: c.id,
        title: c.name,
        sport: c.sport,
        category: c.category,
        zones: [...c.zones],
        nonZone: c.nonZone,
        notes: '',
        done: false,
        ...(c.home ? { location: 'gym' as const } : {}),
      }
      return { ...state, sessions: [...state.sessions, s] }
    }
    case 'update': {
      const old = state.sessions.find((s) => s.id === a.id)
      if (!old) return state
      let sessions = state.sessions.map((s) => (s.id === a.id ? { ...s, ...a.patch } : s))
      if (a.patch.date && a.patch.date !== old.date) {
        sessions = sessions.map((s) => (s.id === a.id ? { ...s, order: 999 } : s))
        sessions = renumber(renumber(sessions, old.personId, a.patch.date), old.personId, old.date)
      }
      return { ...state, sessions }
    }
    case 'move': {
      const cur = state.sessions.find((s) => s.id === a.id)
      if (!cur) return state
      const before = a.beforeId ? state.sessions.find((s) => s.id === a.beforeId) : undefined
      const rest = state.sessions.filter((s) => s.id !== a.id)
      const day = rest.filter((s) => s.personId === cur.personId && s.date === a.date).sort((x, y) => x.order - y.order)
      const idx = before ? day.findIndex((s) => s.id === before.id) : day.length
      const moved = { ...cur, date: a.date }
      day.splice(idx < 0 ? day.length : idx, 0, moved)
      const orders = new Map(day.map((s, i) => [s.id, i]))
      let sessions = [...rest, moved].map((s) => (orders.has(s.id) ? { ...s, order: orders.get(s.id)! } : s))
      if (cur.date !== a.date) sessions = renumber(sessions, cur.personId, cur.date)
      return { ...state, sessions }
    }
    case 'delete':
      return { ...state, sessions: state.sessions.filter((s) => s.id !== a.id) }
    case 'duplicate': {
      const s = state.sessions.find((x) => x.id === a.id)
      if (!s) return state
      const order = state.sessions.filter((x) => x.personId === s.personId && x.date === s.date).length
      return { ...state, sessions: [...state.sessions, { ...s, id: uid(), order, done: false }] }
    }
    case 'toggleDone':
      return { ...state, sessions: state.sessions.map((s) => (s.id === a.id ? { ...s, done: !s.done } : s)) }
    case 'setPerson':
      return { ...state, activePersonId: a.id }
    case 'updatePerson':
      return { ...state, people: state.people.map((p) => (p.id === a.id ? { ...p, ...a.patch } : p)) }
    case 'addPerson':
      return {
        people: [...state.people, a.person],
        activePersonId: a.person.id,
        sessions: [...state.sessions, ...a.sessions],
      }
    case 'deletePerson': {
      if (state.people.length <= 1) return state
      const people = state.people.filter((p) => p.id !== a.id)
      return {
        people,
        sessions: state.sessions.filter((s) => s.personId !== a.id),
        activePersonId: state.activePersonId === a.id ? people[0].id : state.activePersonId,
      }
    }
    case 'regenerate':
      return {
        ...state,
        sessions: [
          ...state.sessions.filter((s) => !(s.personId === a.personId && s.date >= a.from && !s.done && !(s.category === 'race' && !s.raceId))),
          ...a.sessions,
        ],
      }
    case 'load':
      return a.state
    case 'remote': {
      const people = [...a.people].sort((x, y) => (x.createdAt ?? 0) - (y.createdAt ?? 0))
      let saved = ''
      try {
        saved = localStorage.getItem(ACTIVE_KEY) ?? ''
      } catch {
        /* ignorera */
      }
      const keep = [state.activePersonId, saved].find((id) => people.some((p) => p.id === id))
      return { people, sessions: a.sessions, activePersonId: keep ?? people[0]?.id ?? '' }
    }
  }
}

const EMPTY: AppState = { people: [], sessions: [], activePersonId: '' }
const stable = (o: object) => JSON.stringify(o, Object.keys(o).sort())

export interface StoreStatus {
  ready: boolean
  error: string | null
}

// cloud = true: Firestore är sanningen och delas mellan användarna. Annars localStorage.
export const useStore = (cloud: boolean) => {
  const [state, dispatch] = useReducer(reducer, undefined, () => (cloud ? EMPTY : load()))
  const [ready, setReady] = useState(!cloud)
  const [error, setError] = useState<string | null>(null)
  const synced = useRef(new Map<string, string>())

  // lokalt läge
  useEffect(() => {
    if (cloud) return
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* ignorera */
    }
  }, [state, cloud])

  useEffect(() => {
    try {
      if (state.activePersonId) localStorage.setItem(ACTIVE_KEY, state.activePersonId)
    } catch {
      /* ignorera */
    }
  }, [state.activePersonId])

  // Firestore → state
  useEffect(() => {
    if (!cloud || !db) return
    let people: Person[] | null = null
    let sessions: Session[] | null = null
    const push = () => {
      if (!people || !sessions) return
      synced.current = new Map([
        ...people.map((p) => ['p:' + p.id, stable(p)] as const),
        ...sessions.map((s) => ['s:' + s.id, stable(s)] as const),
      ])
      if (!people.length) dispatch({ type: 'load', state: initial() }) // första start: seeda
      else dispatch({ type: 'remote', people, sessions })
      setReady(true)
    }
    const fail = (e: Error) => setError(e.message)
    const u1 = onSnapshot(collection(db, 'people'), (snap) => ((people = snap.docs.map((d) => d.data() as Person)), push()), fail)
    const u2 = onSnapshot(collection(db, 'sessions'), (snap) => ((sessions = snap.docs.map((d) => d.data() as Session)), push()), fail)
    return () => {
      u1()
      u2()
    }
  }, [cloud])

  // state → Firestore (endast ändrade dokument)
  useEffect(() => {
    if (!cloud || !db || !ready) return
    const next = new Map<string, { path: string; id: string; data: object }>()
    state.people.forEach((p) => next.set('p:' + p.id, { path: 'people', id: p.id, data: p }))
    state.sessions.forEach((s) => next.set('s:' + s.id, { path: 'sessions', id: s.id, data: s }))

    const batches: ReturnType<typeof writeBatch>[] = []
    let batch = writeBatch(db)
    let n = 0
    const add = (fn: (b: typeof batch) => void) => {
      fn(batch)
      if (++n === 400) (batches.push(batch), (batch = writeBatch(db!)), (n = 0))
    }
    for (const [k, v] of next) {
      const str = stable(v.data)
      if (synced.current.get(k) !== str) {
        synced.current.set(k, str)
        add((b) => b.set(doc(db!, v.path, v.id), v.data))
      }
    }
    for (const k of [...synced.current.keys()]) {
      if (!next.has(k)) {
        synced.current.delete(k)
        const [t, id] = [k[0], k.slice(2)]
        add((b) => b.delete(doc(db!, t === 'p' ? 'people' : 'sessions', id)))
      }
    }
    if (n) batches.push(batch)
    batches.forEach((b) => b.commit().catch((e: Error) => setError(e.message)))
  }, [state.people, state.sessions, ready, cloud])

  return [state, dispatch, { ready, error } as StoreStatus] as const
}
