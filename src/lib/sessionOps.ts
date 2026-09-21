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
