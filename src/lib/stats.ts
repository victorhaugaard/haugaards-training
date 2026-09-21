import type { Session, Zones } from '../types'

export const sessionMinutes = (s: Pick<Session, 'zones' | 'nonZone'>) =>
  s.zones.reduce((a, b) => a + b, 0) + s.nonZone

export interface Stats {
  total: number
  done: number
  count: number
  doneCount: number
  zones: Zones
  nonZone: number
}

export const computeStats = (sessions: Session[]): Stats => {
  const counted = sessions.filter((s) => s.category !== 'rest')
  const st: Stats = { total: 0, done: 0, count: counted.length, doneCount: 0, zones: [0, 0, 0, 0, 0], nonZone: 0 }
  for (const s of sessions) {
    const m = sessionMinutes(s)
    st.total += m
    if (s.done) {
      st.done += m
      if (s.category !== 'rest') st.doneCount++
    }
    s.zones.forEach((z, i) => (st.zones[i] += z))
    st.nonZone += s.nonZone
  }
  return st
}

export const fmtDuration = (min: number) => {
  if (!min) return '0 min'
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  if (!h) return `${m} min`
  return m ? `${h} h ${m} min` : `${h} h`
}

export const fmtHours = (min: number) => `${(min / 60).toFixed(1).replace('.', ',')} h`
