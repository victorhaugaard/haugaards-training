// Plan-typen "Styrka & kondition": inga lopp eller skidfaser, bara en jämn vecka med valda sporter
// som byggs upp i fyraveckorscykler (tre veckor uppåt, en lättare).
import type { Session, TrainSport, Zones } from '../types'
import { cardById, cardExercises } from './cards'
import { addDays, startOfWeek } from './dates'
import { CYCLE } from './generator'
import { uid } from './id'
import { sessionMinutes } from './stats'
import { TRAIN_SPORTS } from './trainSports'

export const FITNESS_DEFAULT_HOURS = 5

// Passen varje sport bidrar med, i prioritetsordning. En lista = varianter som roterar vecka för vecka.
type Item = string | string[]
const POOL: Record<Exclude<TrainSport, 'ski'>, Item[]> = {
  strength: ['S', 'S', 'S', 'mobility', 'strength-stability'], // S byts mot helkropp eller Push/Pull/Ben nedan
  run: ['easy-run', ['int-4x8', 'fartlek', 'tempo', 'int-short'], 'long-run', 'easy-run'],
  hiit: [['hiit-circuit', 'hiit-amrap'], 'cond-steady', ['hiit-tabata', 'cond-threshold', 'cond-intervals'], 'cond-steady'],
  // '' = hoppa över varvet när styrka också är vald, så att den hinner få tre pass (Push/Pull/Ben) innan CrossFit får sitt andra
  crossfit: [['cf-amrap', 'cf-emom', 'cf-fortime'], '', ['cf-chipper', 'cf-intervals', 'cf-strength-wod'], '', ['cf-emom', 'cf-fortime', 'cf-amrap'], 'cond-steady'],
  bike: ['easy-bike', ['zw-sst', 'zw-vo2'], 'long-bike', 'zw-endu'],
}

const MAX_HARD = 3
const round5 = (n: number) => Math.round(n / 5) * 5
const scaleZones = (z: Zones, f: number): Zones => z.map((v) => round5(v * f)) as Zones
const isQ = (cat: string) => cat === 'quality' || cat === 'hard'
const sessionsFor = (hours: number) => (hours <= 3 ? 3 : hours <= 5 ? 4 : hours <= 8 ? 5 : 6)

export interface FitnessOptions {
  personId: string
  start: string
  end: string
  hoursPerWeek: number
  restDay?: number
  sports: TrainSport[]
}

// Veckans pass: sporterna turas om (så att alla valda får plats), med tak för antalet hårda pass.
const pickWeek = (sports: TrainSport[], n: number, w: number) => {
  const order = TRAIN_SPORTS.map((t) => t.id)
  const chosen = sports.filter((s): s is Exclude<TrainSport, 'ski'> => s !== 'ski').sort((a, b) => order.indexOf(a) - order.indexOf(b))
  const list = chosen.length ? chosen : (['strength'] as const)
  const ids: string[] = []
  let hard = 0
  for (let round = 0; ids.length < n && round < 6; round++) {
    for (const sp of list) {
      if (ids.length >= n) break
      const pool = sp === 'crossfit' && !list.includes('strength') ? POOL.crossfit.filter(Boolean) : POOL[sp]
      const item = pool[round]
      if (!item) continue
      const id = Array.isArray(item) ? item[w % item.length] : item
      if (id === 'S') {
        ids.push(id)
        continue
      }
      const c = cardById(id)!
      if (isQ(c.category) && hard >= MAX_HARD) continue
      if (isQ(c.category)) hard++
      ids.push(id)
    }
  }
  // Två styrkepass: helkropp A och B (varje muskel två gånger i veckan). Tre eller fler: Push, Pull och Ben + bål.
  const k = ids.filter((id) => id === 'S').length
  const split = k >= 3 ? ['strength-push', 'strength-pull', 'strength-legs-core'] : k === 2 ? ['strength', 'strength-fb2'] : ['strength']
  let i = 0
  return ids.map((id) => cardById(id === 'S' ? split[i++ % split.length] : id)!)
}

export const generateFitnessPlan = ({ personId, start, end, hoursPerWeek, restDay = 0, sports }: FitnessOptions): Session[] => {
  const out: Session[] = []
  let weekStart = startOfWeek(start)
  let w = 0
  const freeDays = [0, 1, 2, 3, 4, 5, 6].filter((d) => d !== restDay)

  while (weekStart <= end) {
    const recovery = w % 4 === 3
    const target = hoursPerWeek * 60 * CYCLE[w % 4]
    const n = Math.max(2, sessionsFor(hoursPerWeek) - (recovery && hoursPerWeek > 3 ? 1 : 0))
    const cards = pickWeek(sports, n, w)

    // Hårda pass sprids ut med lugnare pass emellan, veckans längsta pass hamnar på helgen
    const longest = cards.filter((c) => c.flex).sort((a, b) => sessionMinutes(b) - sessionMinutes(a))[0]
    const rest = cards.filter((c) => c !== longest)
    const hard = rest.filter((c) => isQ(c.category))
    const soft = rest.filter((c) => !isQ(c.category))
    const ordered: typeof cards = []
    while (hard.length || soft.length) {
      if (hard.length) ordered.push(hard.shift()!)
      if (soft.length) ordered.push(soft.shift()!)
    }
    const slots = n >= freeDays.length ? freeDays : Array.from({ length: n }, (_, i) => freeDays[Math.floor((i * freeDays.length) / n)])
    const weekend = slots.includes(5) ? 5 : slots.includes(6) ? 6 : slots[slots.length - 1]
    const placed: { day: number; c: (typeof cards)[number] }[] = []
    const days = slots.filter((d) => !longest || d !== weekend)
    ordered.forEach((c, i) => placed.push({ day: days[i % days.length], c }))
    if (longest) placed.push({ day: weekend, c: longest })

    const qScale = recovery ? 0.75 : 1
    const fixedMin = placed.filter(({ c }) => !c.flex).reduce((a, { c }) => a + sessionMinutes(c) * (isQ(c.category) ? qScale : 1), 0)
    const flex = placed.filter(({ c }) => c.flex)
    const flexMin = flex.reduce((a, { c }) => a + sessionMinutes(c), 0)
    const flexScale = flexMin ? Math.min(2, Math.max(0.5, (target - fixedMin) / flexMin)) : 1

    const orderByDay = [0, 0, 0, 0, 0, 0, 0]
    const add = (day: number, c: (typeof cards)[number], f: number) => {
      const date = addDays(weekStart, day)
      if (date < start || date > end) return
      out.push({
        id: uid(),
        personId,
        date,
        order: orderByDay[day]++,
        cardId: c.id,
        title: c.name,
        sport: c.sport,
        category: c.category,
        zones: f === 1 ? ([...c.zones] as Zones) : scaleZones(c.zones, f),
        nonZone: c.nonZone,
        notes: '',
        done: false,
        ...(c.home ? { location: 'gym' as const } : {}),
        ...(cardExercises(c, 'gym') ? { exercises: cardExercises(c, 'gym') } : {}),
      })
    }
    for (const { day, c } of placed.sort((a, b) => a.day - b.day)) add(day, c, c.flex ? flexScale : isQ(c.category) ? qScale : 1)
    if (restDay >= 0) add(restDay, cardById('rest')!, 1)

    weekStart = addDays(weekStart, 7)
    w++
  }
  return out
}
