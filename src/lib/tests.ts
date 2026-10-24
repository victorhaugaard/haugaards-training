// Tester som återkommer i planen, så att man kan följa utvecklingen över tid.
// Resultat sparas på passet (Session.results) i testets enhet. Tider i sekunder.
import type { Session, TrainSport } from '../types'
import { getLang } from '../i18n/core'

export type Unit = 'kg' | 'reps' | 'time' | 'm' | 'rounds' | 'watt'

export interface TestDef {
  id: string
  name: string
  unit: Unit
  better: 'higher' | 'lower'
  exercise?: string // animation i övningsbiblioteket
  how: string // kort instruktion
  sports: TrainSport[] // sporterna testet passar för (styr förslagen för mål)
}

export const TESTS: TestDef[] = [
  { id: 'squat-3rm', name: 'Knäböj 3RM', unit: 'kg', better: 'higher', exercise: 'squat', how: 'Den tyngsta vikten du klarar 3 reps med god teknik.', sports: ['strength', 'crossfit'] },
  { id: 'bench-3rm', name: 'Bänkpress 3RM', unit: 'kg', better: 'higher', exercise: 'bench', how: 'Den tyngsta vikten du klarar 3 reps med, ha gärna en passare.', sports: ['strength', 'crossfit'] },
  { id: 'deadlift-3rm', name: 'Marklyft 3RM', unit: 'kg', better: 'higher', exercise: 'deadlift', how: 'Den tyngsta vikten du klarar 3 reps med rak rygg.', sports: ['strength', 'crossfit'] },
  { id: 'pullups-max', name: 'Max chins', unit: 'reps', better: 'higher', exercise: 'pullup', how: 'Så många chins du klarar i ett set, från raka armar.', sports: ['strength', 'crossfit'] },
  { id: 'pushups-max', name: 'Max armhävningar', unit: 'reps', better: 'higher', exercise: 'pushup', how: 'Så många armhävningar du klarar i ett set med rak kropp.', sports: ['strength', 'crossfit', 'hiit'] },
  { id: 'squats-2min', name: 'Knäböj på 2 minuter', unit: 'reps', better: 'higher', exercise: 'squat', how: 'Så många knäböj du hinner på 2 minuter, låren till parallellt.', sports: ['strength', 'hiit'] },
  { id: 'plank-max', name: 'Planka, max tid', unit: 'time', better: 'higher', exercise: 'plank', how: 'Håll plankan så länge du kan med rak kropp.', sports: ['strength', 'hiit', 'crossfit'] },
  { id: 'run-5k', name: '5 km löpning', unit: 'time', better: 'lower', how: 'Spring 5 km så snabbt du kan, på samma bana varje gång.', sports: ['run', 'hiit', 'crossfit'] },
  { id: 'cooper', name: 'Coopertest 12 min', unit: 'm', better: 'higher', how: 'Spring så långt du kan på 12 minuter.', sports: ['run'] },
  { id: 'row-2k', name: '2 km rodd', unit: 'time', better: 'lower', exercise: 'rower', how: 'Ro 2000 m på roddmaskin så snabbt du kan.', sports: ['hiit', 'crossfit'] },
  { id: 'burpees-5min', name: 'Burpees på 5 minuter', unit: 'reps', better: 'higher', exercise: 'burpee', how: 'Så många burpees du hinner på 5 minuter.', sports: ['hiit', 'crossfit'] },
  { id: 'wod-amrap20', name: 'Benchmark-WOD (AMRAP 20)', unit: 'rounds', better: 'higher', exercise: 'burpee', how: '20 minuter: 5 chins, 10 armhävningar, 15 knäböj. Antal hela varv.', sports: ['crossfit'] },
  { id: 'ftp-20', name: '20 min-test cykel', unit: 'watt', better: 'higher', how: 'Snittwatt på 20 minuter så hårt du kan hålla jämnt.', sports: ['bike'] },
]

export const testById = (id: string) => TESTS.find((t) => t.id === id)

// Visning av ett värde i testets enhet
export const fmtResult = (t: TestDef, v: number) => {
  if (t.unit === 'time') {
    const s = Math.round(v)
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = String(s % 60).padStart(2, '0')
    return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`
  }
  const n = Number.isInteger(v) ? String(v) : getLang() === 'en' ? v.toFixed(1) : v.toFixed(1).replace('.', ',')
  return t.unit === 'kg' ? `${n} kg` : t.unit === 'm' ? `${n} m` : t.unit === 'watt' ? `${n} W` : n
}

// Tolkar inmatning: tider som m:ss eller h:mm:ss, annars ett tal (komma eller punkt)
export const parseResult = (t: TestDef, raw: string): number | undefined => {
  const s = raw.trim().replace(',', '.')
  if (!s) return undefined
  if (t.unit === 'time') {
    const parts = s.split(':').map(Number)
    if (parts.some((x) => isNaN(x))) return undefined
    const v = parts.reduce((a, x) => a * 60 + x, 0)
    return v > 0 ? v : undefined
  }
  const v = Number(s)
  return isFinite(v) && v > 0 ? v : undefined
}

export const unitHint = (t: TestDef) =>
  t.unit === 'time' ? 'mm:ss' : t.unit === 'kg' ? 'kg' : t.unit === 'm' ? 'meter' : t.unit === 'watt' ? 'watt' : t.unit === 'rounds' ? 'varv' : 'antal'

export interface ResultPoint {
  date: string
  value: number
  sessionId: string
}

// Alla resultat per test, äldst först
export const resultsByTest = (sessions: Session[]) => {
  const out = new Map<string, ResultPoint[]>()
  for (const s of sessions)
    for (const [id, value] of Object.entries(s.results ?? {})) {
      if (!testById(id) || !(value > 0)) continue
      const list = out.get(id) ?? []
      list.push({ date: s.date, value, sessionId: s.id })
      out.set(id, list)
    }
  for (const list of out.values()) list.sort((a, b) => a.date.localeCompare(b.date))
  return out
}

export const bestOf = (t: TestDef, list: ResultPoint[]) =>
  list.reduce<ResultPoint | undefined>((b, p) => (!b || (t.better === 'higher' ? p.value > b.value : p.value < b.value) ? p : b), undefined)

// Hur nära målet: 0–1, från första resultatet mot målvärdet
export const goalProgress = (t: TestDef, list: ResultPoint[], target: number) => {
  if (!list.length) return 0
  const first = list[0].value
  const latest = list[list.length - 1].value
  const reached = t.better === 'higher' ? latest >= target : latest <= target
  if (reached) return 1
  const span = target - first
  if (!span) return 0
  return Math.max(0, Math.min(1, (latest - first) / span))
}

// Målets text, eller en text byggd från testet om man bara valt test och värde
export const goalLabel = (g: { text: string; testId?: string; target?: number }, t: (s: string) => string) => {
  if (g.text.trim()) return g.text.trim()
  const test = g.testId ? testById(g.testId) : undefined
  return test ? `${t(test.name)}${g.target ? ' ' + fmtResult(test, g.target) : ''}` : ''
}
