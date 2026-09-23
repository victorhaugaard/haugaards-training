import type { RunMode, Session, SportFocus, Zones } from '../types'
import { cardById } from './cards'
import { RACES, type RaceDef } from './races'
import { addDays, parse, startOfWeek } from './dates'
import { uid } from './id'
import { sessionMinutes } from './stats'

export const PLAN_END = '2027-03-20'

export type Phase = 'base' | 'build' | 'specific' | 'sharpen' | 'winter' | 'season'

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
    span: '14 dec – 31 dec',
    text: 'Lite lägre volym och mer skärpa. Kvalitetspassen finns kvar och du går in i januari utvilad.',
  },
  {
    id: 'winter',
    label: 'Vinterblock',
    span: '1 jan – 7 feb',
    text: 'Årets största volym på snö, tre veckor upp och en ner. Långpassen är veckans viktigaste och här övar du matintaget. Kvalitet: tröskel, fartlek och korta intervaller.',
  },
  {
    id: 'season',
    label: 'Tävlingssäsong',
    span: '8 feb – 20 mars',
    text: 'Loppen varvas med återhämtning. Före varje lopp trappar du ner, efter varje lopp vilar du. Mellan loppen håller du formen med kvalitet och lugna pass. Nordenskiöldsloppet är huvudmålet.',
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
    { day: 0, card: 'rest' },
    { day: 1, card: 'int-bike', odd: 'zw-cad' },
    { day: 1, card: 'erg-tech', odd: 'erg-single' },
    { day: 2, card: 'rs-easy', w: 1.2 },
    { day: 2, card: 'strength' },
    { day: 3, card: 'easy-run', keepRun: true, w: 1 },
    { day: 3, card: 'strength-upper' },
    { day: 4, card: 'erg-long', w: 0.8 },
    { day: 4, card: 'mobility' },
    { day: 5, card: 'int-rs', drop: true },
    { day: 6, card: 'rs-long', odd: 'long-bike', w: 1.9 },
  ],
  build: [
    { day: 0, card: 'rest' },
    { day: 1, card: 'zw-sst', odd: 'zw-tempo' },
    { day: 1, card: 'erg-tech', odd: 'erg-single' },
    { day: 2, card: 'rs-easy', w: 1.2 },
    { day: 2, card: 'strength' },
    { day: 3, card: 'zw-ou', odd: 'zw-pyr', drop: true },
    { day: 3, card: 'strength-upper' },
    { day: 4, card: 'easy-run', keepRun: true, w: 0.9 },
    { day: 4, card: 'mobility' },
    { day: 5, card: 'int-rs', odd: 'erg-int' },
    { day: 6, card: 'rs-long', odd: 'long-bike', w: 1.9 },
  ],
  specific: [
    { day: 0, card: 'rest' },
    { day: 1, card: 'int-4x8', sport: 'Skidor' },
    { day: 1, card: 'ski-easy', w: 0.6 },
    { day: 2, card: 'ski-easy', w: 1.1 },
    { day: 2, card: 'strength' },
    { day: 3, card: 'fartlek', sport: 'Skidor', drop: true },
    { day: 3, card: 'ski-easy', w: 0.6 },
    { day: 4, card: 'ski-easy', odd: 'erg-long', w: 0.9 },
    { day: 4, card: 'mobility' },
    { day: 5, card: 'int-short', sport: 'Skidor' },
    { day: 6, card: 'ski-long', w: 2 },
  ],
  winter: [
    { day: 0, card: 'rest' },
    { day: 1, card: 'int-4x8', sport: 'Skidor' },
    { day: 1, card: 'ski-easy', w: 0.6 },
    { day: 2, card: 'ski-easy', w: 1.1 },
    { day: 2, card: 'strength' },
    { day: 3, card: 'fartlek', sport: 'Skidor', drop: true },
    { day: 3, card: 'ski-easy', w: 0.6 },
    { day: 4, card: 'ski-easy', odd: 'erg-long', w: 0.9 },
    { day: 4, card: 'mobility' },
    { day: 5, card: 'int-short', sport: 'Skidor' },
    { day: 6, card: 'ski-long', w: 2.2 },
  ],
  season: [
    { day: 0, card: 'rest' },
    { day: 1, card: 'int-4x8', sport: 'Skidor' },
    { day: 1, card: 'ski-easy', w: 0.6 },
    { day: 2, card: 'ski-easy', w: 1.1 },
    { day: 2, card: 'strength' },
    { day: 3, card: 'fartlek', sport: 'Skidor', drop: true },
    { day: 3, card: 'ski-easy', w: 0.6 },
    { day: 4, card: 'ski-easy', w: 0.8 },
    { day: 4, card: 'mobility' },
    { day: 5, card: 'int-short', sport: 'Skidor', drop: true },
    { day: 6, card: 'ski-long', w: 1.8 },
  ],
  sharpen: [
    { day: 0, card: 'rest' },
    { day: 1, card: 'int-4x8', sport: 'Skidor' },
    { day: 1, card: 'ski-easy', w: 0.6 },
    { day: 2, card: 'ski-easy', w: 1.1 },
    { day: 2, card: 'strength' },
    { day: 3, card: 'fartlek', sport: 'Skidor', drop: true },
    { day: 3, card: 'ski-easy', w: 0.6 },
    { day: 4, card: 'ski-easy', w: 0.8 },
    { day: 4, card: 'mobility' },
    { day: 5, card: 'int-short', sport: 'Skidor' },
    { day: 6, card: 'ski-long', w: 1.8 },
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

// Fokus "ren längdskidåkning": cykel- och Zwift/Tacx-pass byts mot sin rullskidmotsvarighet.
// Stakmaskinen (Ercolina, på rullskidor) är redan skidspecifik och rörs inte.
const SKI_FOCUS_SWAP: Record<string, string> = {
  'easy-bike': 'rs-easy',
  'long-bike': 'rs-long',
  'int-bike': 'int-rs',
  'zw-endu': 'rs-easy',
  'zw-cad': 'rs-easy',
  'zw-group': 'rs-easy',
  'zw-sst': 'int-rs',
  'zw-tempo': 'int-rs',
  'zw-ou': 'int-rs',
  'zw-pyr': 'int-rs',
  'zw-3030': 'int-rs',
  'zw-vo2': 'int-rs',
}

const PHASE_VOLUME: Record<Phase, number> = { base: 0.97, build: 1.03, specific: 1.0, sharpen: 0.9, winter: 1.05, season: 0.95 }
// 3 veckor upp, 1 vecka ned
export const CYCLE = [0.98, 1.08, 1.14, 0.75]

export const phaseFor = (date: string): Phase => {
  const d = parse(date)
  const m = d.getMonth() + 1
  const k = (m >= 8 ? m : m + 12) * 100 + d.getDate()
  if (k < 1019) return 'base'
  if (k < 1116) return 'build'
  if (k < 1214) return 'specific'
  if (k < 1301) return 'sharpen'
  if (k < 1408) return 'winter'
  return 'season'
}

const round5 = (n: number) => Math.round(n / 5) * 5
const scaleZones = (z: Zones, f: number): Zones => z.map((v) => round5(v * f)) as Zones

export interface GenerateOptions {
  personId: string
  start: string
  end: string
  hoursPerWeek: number
  runMode: RunMode
  restDay?: number // 0 = måndag … 6 = söndag, -1 = ingen fast vilodag
  focus?: SportFocus // 'ski' byter cykel/Zwift mot rullskidor där det går
}

export const generatePlan = ({ personId, start, end, hoursPerWeek, runMode, restDay = 0, focus = 'balanced' }: GenerateOptions): Session[] => {
  const out: Session[] = []
  let weekStart = startOfWeek(start)
  let w = 0

  // Tävlingar och nedtrappning styr sina dagar. Efter ett lopp tas kvalitetspassen bort en stund.
  const races = raceSessions(personId, start, end)
  const blocked = new Set(races.map((r) => r.date))
  const recovering = new Set<string>()
  for (const r of RACES) for (let i = 1; i <= (r.long ? 7 : 4); i++) recovering.add(addDays(r.date, i))

  const resolve = (s: Slot, odd: boolean) => {
    let id = odd && s.odd ? s.odd : s.card
    const c = cardById(id)!
    // löppass byts mot cykel om löpning inte önskas (eller fokus är ren skidåkning), eller om passet inte är veckans enda löptur
    if (c.sport === 'Löpning' && !s.sport && (runMode === 'none' || focus === 'ski' || !s.keepRun) && LOW_IMPACT[id]) id = LOW_IMPACT[id]
    // fokus "ren längdskidåkning": cykel/Zwift blir rullskidor
    if (focus === 'ski' && SKI_FOCUS_SWAP[id]) id = SKI_FOCUS_SWAP[id]
    return cardById(id)!
  }

  while (weekStart <= end) {
    const phase = phaseFor(addDays(weekStart, 3))
    const recovery = w % 4 === 3
    const odd = w % 2 === 1
    const target = hoursPerWeek * 60 * CYCLE[w % 4] * PHASE_VOLUME[phase]
    // Vilodagen byter plats med måndagen så att resten av veckans rytm ligger kvar
    const swap = (d: number) => (restDay > 0 ? (d === 0 ? restDay : d === restDay ? 0 : d) : d)
    const slots = TEMPLATES[phase]
      .filter((s) => !(recovery && s.drop) && (restDay >= 0 || s.card !== 'rest'))
      .map((s) => ({ ...s, day: swap(s.day) }))
    const qScale = recovery ? 0.75 : 1
    const isQ = (cat: string) => cat === 'quality' || cat === 'hard'

    // Storleken räknas på hela veckan så att pass inte blåses upp när dagar tas av tävling eller nedtrappning
    const cards = slots.map((s) => ({ s, c: resolve(s, odd) }))
    const fixedMin = cards.filter(({ c }) => !c.flex).reduce((a, { c }) => a + sessionMinutes(c) * (isQ(c.category) ? qScale : 1), 0)
    const flexCards = cards.filter(({ c }) => c.flex)
    const flexWeight = flexCards.reduce((a, { s, c }) => a + (s.w ?? 1) * sessionMinutes(c), 0)
    const flexScale = Math.max(target - fixedMin, flexCards.length * 30) / flexWeight
    const kept = cards.filter(
      ({ s, c }) => !blocked.has(addDays(weekStart, s.day)) && !(recovering.has(addDays(weekStart, s.day)) && isQ(c.category)),
    )

    const orderByDay = [0, 0, 0, 0, 0, 0, 0]
    for (const { s, c } of kept) {
      const date = addDays(weekStart, s.day)
      if (date < start || date > end) continue
      const soft = recovering.has(date) ? 0.8 : 1
      const f = (c.flex ? flexScale * (s.w ?? 1) : isQ(c.category) ? qScale : 1) * soft
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
  return [...out, ...races]
}

const mk = (personId: string, date: string, cardId: string, extra: Partial<Session> = {}, minutes?: number): Session => {
  const c = cardById(cardId)!
  const f = minutes && c.flex ? minutes / sessionMinutes(c) : 1
  return {
    id: uid(),
    personId,
    date,
    order: 0,
    cardId: c.id,
    title: c.name,
    sport: c.sport,
    category: c.category,
    zones: f === 1 ? ([...c.zones] as Zones) : scaleZones(c.zones, f),
    nonZone: c.nonZone,
    notes: '',
    done: false,
    ...extra,
  }
}

// Nedtrappning före och återhämtning efter tävling. Huvudmålet trappas ner i åtta dagar, övriga lopp i tre.
type Step = [number, string, number?]
const taperFor = (r: RaceDef): Step[] => [
  ...(r.taper === 'full'
    ? ([[-8, 'ski-easy', 90], [-7, 'rest'], [-6, 'ski-easy', 60], [-5, 'opener'], [-4, 'ski-easy', 60], [-3, 'ski-easy', 45]] as Step[])
    : ([[-3, 'ski-easy', 60]] as Step[])),
  [-2, 'opener'],
  [-1, 'rest'],
  [1, 'rest'],
  ...(r.long ? ([[2, 'rest'], [3, 'ski-easy', 45]] as Step[]) : ([[2, 'ski-easy', 45]] as Step[])),
]

// Tävlingarna med nedtrappning. Samma dag delar nedtrappning (huvudmålet vinner).
export const raceSessions = (personId: string, start: string, end: string = PLAN_END): Session[] => {
  const out: Session[] = []
  const taken = new Set<string>()
  const races = RACES.filter((r) => r.date >= start && r.date <= end)
  for (const r of races) {
    const race = mk(personId, r.date, 'race', { title: r.name, sport: 'Tävling', zones: r.zones, notes: `${r.km} km, ${r.place}. ${r.note}`, raceId: r.id })
    out.push({ ...race, order: out.filter((o) => o.date === r.date).length })
  }
  const byDate = new Map<string, RaceDef>()
  for (const r of races) if (!byDate.get(r.date) || r.taper === 'full') byDate.set(r.date, r)
  for (const r of byDate.values())
    for (const [off, card, min] of taperFor(r)) {
      const date = addDays(r.date, off)
      if (date < start || RACES.some((x) => x.date === date) || taken.has(date)) continue
      taken.add(date)
      out.push(mk(personId, date, card, { raceId: r.id }, min))
    }
  return out
}

// Kopiera en annan persons plan (t.ex. pappa baserat på mig) med volymskalning.
// Med runMode 'none' byts löppass mot cykel/rullskidor. Med focus 'ski' byts cykel/Zwift mot rullskidor.
export const copyPlan = (source: Session[], personId: string, scale: number, runMode: RunMode, focus: SportFocus = 'balanced'): Session[] =>
  source.map((s) => {
    let base: Session = s
    const swapId = runMode === 'none' && s.sport === 'Löpning' ? (LOW_IMPACT[s.cardId] ?? '') : focus === 'ski' ? (SKI_FOCUS_SWAP[s.cardId] ?? '') : ''
    const swap = swapId ? cardById(swapId) : undefined
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
    const f = base.category === 'race' ? 1 : scale
    return {
      ...base,
      id: uid(),
      personId,
      done: false,
      zones: f === 1 ? base.zones : scaleZones(base.zones, f),
      nonZone: round5(base.nonZone * f),
    }
  })
