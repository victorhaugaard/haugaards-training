// Plan-typen "Styrka & kondition": inga lopp eller skidfaser, bara en jämn vecka med valda sporter
// som byggs upp i fyraveckorscykler (tre veckor uppåt, en lättare).
import type { Exercise, FitnessPrefs, Session, TrainSport, TrainingCard, Zones } from '../types'
import { cardById, cardExercises } from './cards'
import { estimateMinutes } from './exercises'
import { addDays, startOfWeek } from './dates'
import { CYCLE, weeksSince } from './generator'
import { uid } from './id'
import { sessionMinutes } from './stats'
import { TRAIN_SPORTS } from './trainSports'

export const FITNESS_DEFAULT_HOURS = 5
export const DEFAULT_PREFS: FitnessPrefs = { days: 4, length: 60, level: 'intermediate', aim: 'general', equipment: 'gym', testEvery: 4 }
export const prefsHours = (p: FitnessPrefs) => Math.round((p.days * p.length) / 30) / 2

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
  prefs?: FitnessPrefs // dagar, passlängd, nivå, fokus, utrustning och tester (annars styr timmarna)
  anchor?: string // den pågående planens start: en ombyggnad fortsätter i samma cykel och testrytm
}

// Testpasset som ersätter en sports första pass i en testvecka
const testFor = (c: TrainingCard): string | undefined =>
  c.sport === 'Styrka' && c.category === 'strength'
    ? 'test-strength'
    : c.sport === 'Löpning'
      ? 'test-run'
      : c.sport === 'Kondition'
        ? 'test-conditioning'
        : c.sport === 'CrossFit'
          ? 'test-crossfit'
          : c.sport === 'Cykel'
            ? 'test-bike'
            : undefined

const plainReps = (r: string) => /^\d+(–\d+)?$/.test(r.trim())

// Set, reps och vila efter fokus och nivå, och färre övningar om passet ska vara kort
export const adjustExercises = (list: Exercise[], p: FitnessPrefs): Exercise[] => {
  let out = list.map((e) => {
    const compound = (e.rest ?? 90) >= 120
    let { sets, reps, rest } = e
    if (p.aim === 'strength' && compound && plainReps(reps)) (reps = '3–5'), (rest = 180)
    if (p.aim === 'muscle' && plainReps(reps)) (reps = compound ? '8–12' : '12–15'), (rest = compound ? 120 : 75)
    if (p.aim === 'conditioning' && rest !== undefined) rest = Math.max(30, rest - 30)
    if (p.level === 'beginner') sets = Math.max(2, sets - 1)
    if (p.level === 'advanced' && compound) sets = Math.min(5, sets + 1)
    return { ...e, sets, reps, ...(rest !== undefined ? { rest } : {}) }
  })
  while (out.length > 3 && estimateMinutes(out) > p.length + 5) out = out.slice(0, -1)
  return out
}

// Veckans pass: sporterna turas om (så att alla valda får plats), med tak för antalet hårda pass.
const pickWeek = (sports: TrainSport[], n: number, w: number, maxHard = MAX_HARD) => {
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
      if (isQ(c.category) && hard >= maxHard) continue
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

export const generateFitnessPlan = ({ personId, start, end, hoursPerWeek, restDay = 0, sports, prefs, anchor }: FitnessOptions): Session[] => {
  const out: Session[] = []
  let weekStart = startOfWeek(start)
  let w = weeksSince(anchor, start)
  const freeDays = [0, 1, 2, 3, 4, 5, 6].filter((d) => d !== restDay)

  while (weekStart <= end) {
    const recovery = w % 4 === 3
    const target = hoursPerWeek * 60 * CYCLE[w % 4]
    const perWeek = prefs ? prefs.days : sessionsFor(hoursPerWeek)
    const n = Math.max(2, perWeek - (recovery && perWeek > 3 ? 1 : 0))
    let cards = pickWeek(sports, n, w, prefs?.level === 'beginner' ? 2 : MAX_HARD)
    // Testvecka (första veckan och sedan med valt intervall): varje sports första pass blir ett test
    if (prefs && prefs.testEvery > 0 && w % prefs.testEvery === 0) {
      const used = new Set<string>()
      cards = cards.map((c) => {
        const t = testFor(c)
        if (!t || used.has(t)) return c
        used.add(t)
        return cardById(t)!
      })
    }

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

    const location = prefs?.equipment === 'home' ? ('home' as const) : ('gym' as const)
    const orderByDay = [0, 0, 0, 0, 0, 0, 0]
    const add = (day: number, c: (typeof cards)[number], f: number) => {
      const date = addDays(weekStart, day)
      if (date < start || date > end) return
      let exercises = cardExercises(c, location)
      let nonZone = c.nonZone
      if (prefs && exercises && c.category === 'strength') exercises = adjustExercises(exercises, prefs)
      if (prefs && c.category === 'strength' && c.sport === 'Styrka' && c.nonZone) nonZone = Math.max(20, round5(prefs.length * (recovery ? 0.85 : 1)))
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
        nonZone,
        notes: '',
        done: false,
        ...(c.home ? { location } : {}),
        ...(exercises ? { exercises } : {}),
      })
    }
    // Med inställningar: flexibla pass blir lika långa som valt (helgpasset lite längre), övriga skalas måttligt
    const sizeFor = (c: TrainingCard, isWeekend: boolean) => {
      if (!prefs) return c.flex ? flexScale : isQ(c.category) ? qScale : 1
      const m = sessionMinutes(c) || 1
      if (c.flex) return Math.max(0.4, (prefs.length * CYCLE[w % 4] * (isWeekend ? 1.4 : 1)) / m)
      if (c.category === 'strength' || c.group === 'Tester') return 1
      return Math.max(0.75, Math.min(1.3, prefs.length / m)) * (isQ(c.category) ? qScale : 1)
    }
    for (const { day, c } of placed.sort((a, b) => a.day - b.day)) add(day, c, sizeFor(c, c === longest))
    if (restDay >= 0) add(restDay, cardById('rest')!, 1)

    weekStart = addDays(weekStart, 7)
    w++
  }
  return out
}
