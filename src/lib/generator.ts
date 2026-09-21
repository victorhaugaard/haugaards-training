import type { RunMode, Session, Zones } from '../types'
import { cardById } from './cards'
import { addDays, parse, startOfWeek } from './dates'
import { uid } from './id'
import { sessionMinutes } from './stats'

export const RACE = { name: 'Nordenskiöldsloppet', date: '2027-03-20', km: 220, place: 'Jokkmokk' }

export type Phase = 'base' | 'build' | 'specific' | 'sharpen'

export const PHASES: { id: Phase; label: string; span: string; text: string }[] = [
  {
    id: 'base',
    label: 'Grundperiod',
    span: 'till 18 okt',
    text: 'Bygger den stora basen som 220 km kräver. Mycket lugn cykling och rullskidor, stakmaskin för teknik och stakstyrka. Få hårda pass, bara tröskel.',
  },
  {
    id: 'build',
    label: 'Uppbyggnad',
    span: '19 okt – 15 nov',
    text: 'Mer kvalitet. Två tröskelpass på cykel (Zwift/Tacx) och en hård rullskid- eller stakmaskinsdag. Volymen är fortsatt hög. Långpassen blir längre och du börjar träna på matintaget.',
  },
  {
    id: 'specific',
    label: 'Snö & specifikt',
    span: '16 nov – 13 dec',
    text: 'Nästan allt görs på skidor, i spår eller tunnel. Långpassen är veckans viktigaste, och kvalitetspassen ger fart och ekonomi. Styrkan trappas ner till ett pass per vecka.',
  },
  {
    id: 'sharpen',
    label: 'Säsongsstart',
    span: '14 dec – nyår',
    text: 'Lite lägre volym, mer skärpa. Kvalitetspassen finns kvar och du går in i januari utvilad. Därefter tar nästa etapp mot loppet vid.',
  },
]

export const PHASE_LABEL: Record<Phase, string> = Object.fromEntries(PHASES.map((p) => [p.id, p.label])) as Record<Phase, string>

interface Slot {
  day: number // 0 = måndag
  card: string
  odd?: string // annat kort i udda veckor
  w?: number // vikt för flexibla pass
  sport?: Session['sport']
  drop?: boolean // hoppas över i vilovecka
  keepRun?: boolean // löppass som behålls om man vill ha lite löpning
}

const TEMPLATES: Record<Phase, Slot[]> = {
  base: [
    { day: 0, card: 'easy-bike', w: 1 },
    { day: 0, card: 'strength-upper' },
    { day: 1, card: 'int-bike', odd: 'zw-cad' },
    { day: 1, card: 'erg-tech', odd: 'erg-single' },
    { day: 2, card: 'rs-easy', w: 1.2 },
    { day: 2, card: 'strength' },
    { day: 3, card: 'easy-run', keepRun: true, w: 1 },
    { day: 4, card: 'erg-long', w: 0.7 },
    { day: 4, card: 'mobility' },
    { day: 5, card: 'int-rs', drop: true },
    { day: 6, card: 'rs-long', odd: 'long-bike', w: 2.2 },
  ],
  build: [
    { day: 0, card: 'easy-bike', w: 1 },
    { day: 0, card: 'strength-upper' },
    { day: 1, card: 'zw-sst', odd: 'zw-tempo' },
    { day: 1, card: 'erg-tech', odd: 'erg-single' },
    { day: 2, card: 'rs-easy', w: 1.2 },
    { day: 2, card: 'strength' },
    { day: 3, card: 'zw-ou', odd: 'zw-pyr', drop: true },
    { day: 4, card: 'easy-run', keepRun: true, w: 0.9 },
    { day: 4, card: 'mobility' },
    { day: 5, card: 'int-rs', odd: 'erg-int' },
    { day: 6, card: 'rs-long', odd: 'long-bike', w: 2.2 },
  ],
  specific: [
    { day: 0, card: 'ski-easy', odd: 'zw-endu', w: 1 },
    { day: 1, card: 'int-4x8', sport: 'Skidor' },
    { day: 1, card: 'ski-easy', w: 0.7 },
    { day: 2, card: 'ski-easy', w: 1.2 },
    { day: 2, card: 'strength' },
    { day: 3, card: 'fartlek', sport: 'Skidor', drop: true },
    { day: 4, card: 'ski-easy', odd: 'erg-long', w: 0.9 },
    { day: 4, card: 'mobility' },
    { day: 5, card: 'int-short', sport: 'Skidor' },
    { day: 6, card: 'ski-long', w: 2.2 },
  ],
  sharpen: [
    { day: 0, card: 'ski-easy', w: 1 },
    { day: 1, card: 'int-4x8', sport: 'Skidor' },
    { day: 2, card: 'ski-easy', odd: 'zw-endu', w: 1.2 },
    { day: 2, card: 'strength' },
    { day: 3, card: 'fartlek', sport: 'Skidor', drop: true },
    { day: 3, card: 'ski-easy', w: 0.6 },
    { day: 4, card: 'ski-easy', w: 0.8 },
    { day: 4, card: 'mobility' },
    { day: 5, card: 'int-short', sport: 'Skidor' },
    { day: 6, card: 'ski-long', w: 2 },
  ],
}

// Löppass → skonsam ersättning
const LOW_IMPACT: Record<string, string> = {
  'easy-run': 'easy-bike',
  'long-run': 'long-bike',
  'int-4x8': 'int-bike',
  tempo: 'zw-sst',
  fartlek: 'zw-ou',
  'int-short': 'zw-vo2',
  'int-hill': 'int-rs',
}

const PHASE_VOLUME: Record<Phase, number> = { base: 0.97, build: 1.03, specific: 1.0, sharpen: 0.9 }
// 3 veckor upp, 1 vecka ned
export const CYCLE = [0.98, 1.08, 1.14, 0.75]

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
  runMode: RunMode
}

export const generatePlan = ({ personId, start, end, hoursPerWeek, runMode }: GenerateOptions): Session[] => {
  const out: Session[] = []
  let weekStart = startOfWeek(start)
  let w = 0

  const resolve = (s: Slot, odd: boolean) => {
    let id = odd && s.odd ? s.odd : s.card
    const c = cardById(id)!
    // löppass byts mot cykel om löpning inte önskas, eller om passet inte är veckans enda löptur
    if (c.sport === 'Löpning' && !s.sport && (runMode === 'none' || !s.keepRun) && LOW_IMPACT[id]) id = LOW_IMPACT[id]
    return cardById(id)!
  }

  while (weekStart <= end) {
    const phase = phaseFor(addDays(weekStart, 3))
    const recovery = w % 4 === 3
    const odd = w % 2 === 1
    const target = hoursPerWeek * 60 * CYCLE[w % 4] * PHASE_VOLUME[phase]
    const slots = TEMPLATES[phase].filter((s) => !(recovery && s.drop))
    const qScale = recovery ? 0.75 : 1
    const isQ = (cat: string) => cat === 'quality' || cat === 'hard'

    const cards = slots.map((s) => ({ s, c: resolve(s, odd) }))
    const fixedMin = cards.filter(({ c }) => !c.flex).reduce((a, { c }) => a + sessionMinutes(c) * (isQ(c.category) ? qScale : 1), 0)
    const flexCards = cards.filter(({ c }) => c.flex)
    const flexWeight = flexCards.reduce((a, { s, c }) => a + (s.w ?? 1) * sessionMinutes(c), 0)
    const flexScale = Math.max(target - fixedMin, flexCards.length * 30) / flexWeight

    const orderByDay = [0, 0, 0, 0, 0, 0, 0]
    for (const { s, c } of cards) {
      const date = addDays(weekStart, s.day)
      if (date < start || date > end) continue
      const f = c.flex ? flexScale * (s.w ?? 1) : isQ(c.category) ? qScale : 1
      out.push({
        id: uid(),
        personId,
        date,
        order: orderByDay[s.day]++,
        cardId: c.id,
        title: c.name,
        sport: s.sport ?? c.sport,
        category: c.category,
        zones: f === 1 ? ([...c.zones] as Zones) : scaleZones(c.zones, f),
        nonZone: c.nonZone,
        notes: '',
        done: false,
        ...(c.home ? { location: 'gym' as const } : {}),
      })
    }
    weekStart = addDays(weekStart, 7)
    w++
  }
  if (RACE.date >= start) out.push(raceSession(personId))
  return out
}

// Målet på kalendern. Justera minuterna efter din egen måltid.
export const raceSession = (personId: string): Session => ({
  id: uid(),
  personId,
  date: RACE.date,
  order: 0,
  cardId: 'race',
  title: RACE.name,
  sport: 'Tävling',
  category: 'race',
  zones: [540, 120, 0, 0, 0],
  nonZone: 0,
  notes: `${RACE.km} km, ${RACE.place}. Justera minuterna efter din måltid.`,
  done: false,
})

// Kopiera en annan persons plan (t.ex. pappa baserat på mig) med volymskalning.
// Med runMode 'none' byts löppass mot cykel/rullskidor.
export const copyPlan = (source: Session[], personId: string, scale: number, runMode: RunMode): Session[] =>
  source.map((s) => {
    let base: Session = s
    const swap = runMode === 'none' && s.sport === 'Löpning' ? cardById(LOW_IMPACT[s.cardId] ?? '') : undefined
    if (swap) {
      const f = swap.flex ? sessionMinutes(s) / sessionMinutes(swap) : 1
      base = {
        ...s,
        cardId: swap.id,
        title: swap.name,
        sport: swap.sport,
        category: swap.category,
        zones: f === 1 ? ([...swap.zones] as Zones) : scaleZones(swap.zones, f),
        nonZone: swap.nonZone,
      }
    }
    return {
      ...base,
      id: uid(),
      personId,
      done: false,
      zones: scaleZones(base.zones, scale),
      nonZone: round5(base.nonZone * scale),
    }
  })
