import type { Session, Zones } from '../types'
import { sessionMinutes } from './stats'

const round5 = (n: number) => Math.round(n / 5) * 5

// Ny totaltid för ett pass: alla zoner skalas i samma proportion
export const withTotal = (s: Pick<Session, 'zones' | 'nonZone'>, total: number): { zones: Zones; nonZone: number } => {
  const cur = sessionMinutes(s)
  if (!cur) return { zones: s.zones, nonZone: s.nonZone }
  const f = Math.max(5, Math.min(720, total)) / cur
  return { zones: s.zones.map((z) => Math.max(0, round5(z * f))) as Zones, nonZone: Math.max(0, round5(s.nonZone * f)) }
}

// Skala alla kommande, ej genomförda pass (utom lopp, vila och nedtrappning) med en faktor
export const scaleUpcoming = (sessions: Session[], from: string, factor: number): Session[] =>
  sessions.map((s) => {
    if (s.date < from || s.done || s.category === 'race' || s.category === 'rest' || s.raceId) return s
    return { ...s, zones: s.zones.map((z) => Math.max(0, round5(z * factor))) as Zones, nonZone: Math.max(0, round5(s.nonZone * factor)) }
  })

// Snitt timmar per vecka för kommande pass
export const upcomingHoursPerWeek = (sessions: Session[], from: string): number => {
  const list = sessions.filter((s) => s.date >= from && !s.done && s.category !== 'race' && s.category !== 'rest' && !s.raceId)
  if (!list.length) return 0
  const weeks = new Set(list.map((s) => s.date.slice(0, 7) + Math.floor(new Date(s.date + 'T12:00').getTime() / 604800000)))
  return list.reduce((a, s) => a + sessionMinutes(s), 0) / 60 / weeks.size
}
