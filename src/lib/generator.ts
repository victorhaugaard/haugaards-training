import type { Session, Zones } from '../types'
import { cardById } from './cards'
import { addDays, parse, startOfWeek } from './dates'
import { uid } from './id'
import { sessionMinutes } from './stats'

type Phase = 'base' | 'build' | 'specific' | 'sharpen'

export const PHASE_LABEL: Record<Phase, string> = {
  base: 'Grundperiod',
  build: 'Uppbyggnad',
  specific: 'Snö & specifikt',
  sharpen: 'Säsongsstart',
}

interface Slot {
  day: number // 0 = måndag
  card: string
  w?: number // vikt för flexibla pass
  sport?: Session['sport']
  drop?: boolean // hoppas över i vilovecka
}

const TEMPLATES: Record<Phase, Slot[]> = {
  base: [
    { day: 0, card: 'easy-run', w: 1 },
    { day: 1, card: 'int-4x8' },
    { day: 1, card: 'easy-bike', w: 0.8 },
    { day: 2, card: 'rs-easy', w: 1.2 },
    { day: 2, card: 'strength' },
    { day: 3, card: 'easy-run', w: 1 },
    { day: 3, card: 'mobility' },
    { day: 4, card: 'rs-easy', w: 0.9 },
    { day: 4, card: 'strength' },
    { day: 5, card: 'int-hill', drop: true },
    { day: 6, card: 'rs-long', w: 2.2 },
  ],
  build: [
    { day: 0, card: 'easy-run', w: 1 },
    { day: 1, card: 'int-rs' },
    { day: 1, card: 'easy-bike', w: 0.8 },
    { day: 2, card: 'rs-easy', w: 1.2 },
    { day: 2, card: 'strength' },
    { day: 3, card: 'tempo', drop: true },
    { day: 4, card: 'easy-run', w: 0.9 },
    { day: 4, card: 'mobility' },
    { day: 5, card: 'int-hill' },
    { day: 6, card: 'rs-long', w: 2.2 },
  ],
  specific: [
    { day: 0, card: 'ski-easy', w: 1 },
    { day: 1, card: 'int-4x8', sport: 'Skidor' },
    { day: 1, card: 'ski-easy', w: 0.7 },
    { day: 2, card: 'ski-easy', w: 1.2 },
    { day: 2, card: 'strength' },
    { day: 3, card: 'fartlek', sport: 'Skidor', drop: true },
    { day: 4, card: 'ski-easy', w: 0.9 },
    { day: 4, card: 'mobility' },
    { day: 5, card: 'int-short', sport: 'Skidor' },
    { day: 6, card: 'ski-long', w: 2.2 },
  ],
  sharpen: [
    { day: 0, card: 'ski-easy', w: 1 },
    { day: 1, card: 'int-4x8', sport: 'Skidor' },
    { day: 2, card: 'ski-easy', w: 1.2 },
    { day: 2, card: 'strength' },
    { day: 3, card: 'fartlek', sport: 'Skidor', drop: true },
    { day: 3, card: 'ski-easy', w: 0.6 },
    { day: 4, card: 'ski-easy', w: 0.8 },
    { day: 4, card: 'mobility' },
    { day: 5, card: 'int-short', sport: 'Skidor' },
    { day: 6, card: 'ski-long', w: 2 },
  ],
}

const PHASE_VOLUME: Record<Phase, number> = { base: 0.97, build: 1.03, specific: 1.0, sharpen: 0.9 }
// 3 veckor upp, 1 vecka ned
const CYCLE = [0.98, 1.08, 1.14, 0.75]

export const phaseFor = (date: string): Phase => {
  const d = parse(date)
  const m = d.getMonth() + 1
  const k = (m >= 8 ? m : m + 12) * 100 + d.getDate()
  if (k < 1019) return 'base'
  if (k < 1116) return 'build'
  if (k < 1214) return 'specific'
  return 'sharpen'
}

const round5 = (n: number) => Math.round(n / 5) * 5

const scaleZones = (z: Zones, f: number): Zones => z.map((v) => round5(v * f)) as Zones

export interface GenerateOptions {
  personId: string
  start: string
  end: string
  hoursPerWeek: number
}

export const generatePlan = ({ personId, start, end, hoursPerWeek }: GenerateOptions): Session[] => {
  const out: Session[] = []
  let weekStart = startOfWeek(start)
  let w = 0
  while (weekStart <= end) {
    const phase = phaseFor(addDays(weekStart, 3))
    const recovery = w % 4 === 3
    const target = hoursPerWeek * 60 * CYCLE[w % 4] * PHASE_VOLUME[phase]
    const slots = TEMPLATES[phase].filter((s) => !(recovery && s.drop))
    const qScale = recovery ? 0.75 : 1

    const fixedMin = slots
      .filter((s) => !cardById(s.card)!.flex)
      .reduce((a, s) => {
        const c = cardById(s.card)!
        const isQ = c.category === 'quality' || c.category === 'hard'
        return a + sessionMinutes(c) * (isQ ? qScale : 1)
      }, 0)
    const flexSlots = slots.filter((s) => cardById(s.card)!.flex)
    const flexWeight = flexSlots.reduce((a, s) => a + (s.w ?? 1) * sessionMinutes(cardById(s.card)!), 0)
    const flexTarget = Math.max(target - fixedMin, flexSlots.length * 30)
    const flexScale = flexTarget / flexWeight

    const orderByDay: number[] = [0, 0, 0, 0, 0, 0, 0]
    for (const s of slots) {
      const date = addDays(weekStart, s.day)
      if (date >= start && date <= end) {
        const c = cardById(s.card)!
        const isQ = c.category === 'quality' || c.category === 'hard'
        const f = c.flex ? flexScale * (s.w ?? 1) : isQ ? qScale : 1
        out.push({
          id: uid(),
          personId,
          date,
          order: orderByDay[s.day]++,
          cardId: c.id,
          title: c.name,
          sport: s.sport ?? c.sport,
          category: c.category,
          zones: f === 1 ? [...c.zones] as Zones : scaleZones(c.zones, f),
          nonZone: c.nonZone,
          notes: '',
          done: false,
        })
      }
    }
    weekStart = addDays(weekStart, 7)
    w++
  }
  return out
}

// Kopiera en annan persons plan (t.ex. pappa baserat på mig) med volymskalning
export const copyPlan = (source: Session[], personId: string, scale: number): Session[] =>
  source.map((s) => ({
    ...s,
    id: uid(),
    personId,
    done: false,
    zones: scaleZones(s.zones, scale),
    nonZone: round5(s.nonZone * scale),
  }))
