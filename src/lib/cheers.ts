import type { PlanRecord, Session } from '../types'
import { startOfWeek } from './dates'
import { planStats } from './plans'
import { sessionMinutes } from './stats'

export type CheerKind = 'session' | 'hard' | 'milestone' | 'week'

// Peppmeddelanden per coach (svenska, översätts). {who} = tilltal, {title} = passet, {pct} = procent av planen.
export const CHEERS: Record<string, Record<CheerKind, string[]>> = {
  smirnov: {
    session: ['Bra jobbat, {who}. {title} är avklarat. Jämnt och ordentligt, så bygger man form.', 'Avklarat: {title}. Tålamod och konsekvens, så fungerar det.'],
    hard: ['Hårt pass genomfört, {who}. Nu är det viktigt att du vilar och äter ordentligt.'],
    milestone: ['{pct} % av planen är klar. Det är stadig utveckling, {who}. Fortsätt i samma lugna takt.'],
    week: ['En hel vecka utan missade pass. Det är så form byggs, {who}. Ta hand om återhämtningen nu.'],
  },
  tyson: {
    session: ['Ding ding! {title} är i bokstäverna, {who}. Ännu en runda vunnen.', 'Roadwork gjort. {title} avklarat. Så tränar mästare.'],
    hard: ['Det där var en riktig knockout av ett pass, {who}. Nu vilar du. Även mästare gör det.'],
    milestone: ['{pct} % av planen avklarad. Du står fortfarande på fötterna, {who}. Nästa runda!'],
    week: ['Hela veckan avklarad. Det är disciplin, {who}. Det är den som vinner.'],
  },
  johaug: {
    session: ['Fint, {who}! {title} avklarat. Steg för steg, så funkar det.', 'Kjempefint jobbat med {title}. Grunden bygger vi pass för pass.'],
    hard: ['Bra kvalitet i dag, {who}. Nu handlar det om att vila och äta rätt.'],
    milestone: ['{pct} % av planen är klar. Sånt lönar sig, {who}. Fortsätt lugnt och noggrant.'],
    week: ['En hel vecka som planerat, {who}. Kjempefint. Ta hand om vilan nu.'],
  },
  northug: {
    session: ['Där satt den, {who}! {title} avklarat. Så gör mästare.', 'Bam! {title} i lådan. Formen kommer.'],
    hard: ['Det där var ett riktigt pass, {who}. Du är farlig nu. Vila och ladda inför nästa.'],
    milestone: ['{pct} % av planen klar. Startfältet ska vara nervöst, {who}. Kom igen!'],
    week: ['Full vecka, {who}! Ingen annan tränar så här noggrant. Dags för en välförtjänt vilodag.'],
  },
  halfvarsson: {
    session: ['Nice, {who}! {title} avklarat. Det bara rullar på.', 'Gött, {who}. {title} är klart. Inga konstigheter.'],
    hard: ['Asså, bra körning på det där hårda passet, {who}. Nu tar vi det lugnt en stund.'],
    milestone: ['{pct} % av planen är klar. Det löser sig ju, som jag sa, {who}!'],
    week: ['Hela veckan avklarad, {who}. Grymt jobbat, ta en fika nu.'],
  },
  erica: {
    session: ['BOOM, {who}! {title} avklarat. Det där är ett PR i konsekvens.', 'Yes {who}! {title} klart. Nästa WOD väntar, men först vatten.'],
    hard: ['Beast mode, {who}!! Hårt pass klart. Skala upp senare, vila nu.'],
    milestone: ['{pct} % av planen klar! Det är typ en AMRAP i uthållighet, {who}. Fortsätt köra!'],
    week: ['Full vecka, {who}! Inga missade pass, det är ren beast mode. Jag är stolt över dig.'],
  },
  jonas: {
    session: ['Grymt, {who}! {title} avklarat, fett bra jobbat.', 'Asså sjukt bra, {who}. {title} är klart.'],
    hard: ['Fett hårt pass, {who}! Lugnt nu, ät något gott och vila.'],
    milestone: ['{pct} % av planen klar, asså det är typ sjukt bra, {who}!'],
    week: ['Hela veckan avklarad, {who}! Fett bra grejer. Ta det lugnt en stund nu.'],
  },
  farmor: {
    session: ['Vad duktig du är, {who}! {title} avklarat. Nu får du en kopp kaffe och något gott.', 'Så bra, {who}. Vi är stolta. Ta det lugnt nu och klä dig varmt.'],
    hard: ['Hårt pass, {who}! Nu ska du vila och äta ordentligt, hjärtat.'],
    milestone: ['{pct} % av planen klar! Vad stolta vi är, {who}. Fortsätt i din egen takt.'],
    week: ['Hela veckan avklarad, {who}! Vad duktig du är. Nu ska du unna dig en bulle.'],
  },
  marco: {
    session: ['Bene, {who}! {title} avklarat. Dai, fortsätt!', 'Forza, {who}! {title} klart. Ät och drick ordentligt nu!'],
    hard: ['Mamma mia, tufft pass klart, {who}! Äta, dricka, vila. Det är inte valfritt!'],
    milestone: ['{pct} % av planen klar. Forza, {who}! Tunga växlar, sakta men säkert.'],
    week: ['En hel vecka, {who}! Bravissimo! Nu en riktig middag och sömn.'],
  },
  geir: {
    session: ['Bra jobbat, {who}! {title} avklarat. Kroppen är som en bil, den mår bra av att gå.', 'Snyggt, {who}. {title} klart. Glöm inte att tanka med vatten.'],
    hard: ['Hårt pass, {who}. Full gas. Kom ihåg service: vila och ät bra nu.'],
    milestone: ['{pct} % av planen klar, {who}. Motorn går på högvarv! Ta hand om hälsan.'],
    week: ['Full vecka, {who}! Bra körning. Nu har du förtjänat en Gin Tonic, men vatten först.'],
  },
}

export interface Cheer {
  kind: CheerKind
  key: string // unik nyckel så att samma sak inte firas två gånger
  title?: string
  pct?: number
  priority: number
}

const counted = (s: Session) => s.category !== 'rest' && s.category !== 'race'

// Vad ska firas när passen i `newly` precis blivit avklarade?
export const findCheers = (sessions: Session[], newly: Session[], plan: PlanRecord | undefined, awarded: Set<string>): { cheers: Cheer[]; silent: string[] } => {
  const cheers: Cheer[] = []
  const silent: string[] = []

  // Enskilt pass
  const first = newly.find((s) => s.category !== 'rest' && !awarded.has('s:' + s.id))
  if (first) {
    const hard = first.category === 'hard' || first.category === 'quality' || first.category === 'race' || sessionMinutes(first) >= 120
    cheers.push({ kind: hard ? 'hard' : 'session', key: 's:' + first.id, title: first.title, priority: 1 })
  }

  // Hel vecka avklarad (minst tre pass)
  for (const wk of new Set(newly.map((s) => startOfWeek(s.date)))) {
    const inWeek = sessions.filter((s) => counted(s) && startOfWeek(s.date) === wk)
    if (inWeek.length >= 3 && inWeek.every((s) => s.done) && !awarded.has('w:' + wk)) cheers.push({ kind: 'week', key: 'w:' + wk, priority: 2 })
  }

  // Milstolpar var 10:e procent av planen
  if (plan && !plan.endedAt) {
    const st = planStats(sessions, plan)
    const pct = st.plannedTotal ? Math.min(100, Math.floor((st.done / st.plannedTotal) * 10) * 10) : 0
    const due: number[] = []
    for (let p = 10; p <= pct; p += 10) if (!awarded.has(`p:${plan.id}:${p}`)) due.push(p)
    if (due.length) {
      const top = due[due.length - 1]
      cheers.push({ kind: 'milestone', key: `p:${plan.id}:${top}`, pct: top, priority: 3 })
      for (const p of due.slice(0, -1)) silent.push(`p:${plan.id}:${p}`)
    }
  }
  return { cheers: cheers.sort((a, b) => b.priority - a.priority), silent }
}

export const pickCheer = (coachId: string, kind: CheerKind): string => {
  const list = (CHEERS[coachId] ?? CHEERS.smirnov)[kind]
  return list[Math.floor(Math.random() * list.length)]
}
