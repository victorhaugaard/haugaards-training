// Coacherna man kan välja mellan. Tonläget för varje coach ligger på servern (api/coach.ts).
export interface Coach {
  id: string
  name: string
  tagline: string // svensk text, översätts vid visning
  greeting: string // svensk text med {who} (hur coachen tilltalar dig) och {name}
  initials: string
  hue: number // färg på reservavataren
  photo?: boolean // finns bild i public/coaches/<id>.jpg
  call?: { victor: string; dad: string } // hur coachen tilltalar Victor respektive pappa (svenska, översätts)
}

export const COACHES: Coach[] = [
  {
    id: 'smirnov',
    name: 'Coach Smirnov',
    tagline: 'Lugn, rak och erfaren',
    greeting: 'Hej {who}, jag är Coach Smirnov. Fråga mig om träningen, eller be mig ändra planen: flytta pass, lägga till, ta bort eller öka mängden. Vid sjukdom eller skada hjälper jag dig att anpassa den.',
    initials: 'S',
    hue: 222,
    photo: true,
  },
  {
    id: 'tyson',
    name: 'Coach Mike Tyson',
    tagline: 'Hård disciplin, mjukt hjärta',
    greeting: 'Lyssna, {who}. Coach Mike Tyson här. Disciplin och roadwork, det är receptet. Berätta vad som är fel så fixar vi planen. Sjuk eller skadad? Då tar vi det smart, för även mästare vilar.',
    initials: 'MT',
    hue: 8,
    photo: true,
  },
  {
    id: 'johaug',
    name: 'Coach Therese Johaug',
    tagline: 'Detaljer, grund och torr humor',
    greeting: 'Hej {who}! Coach Therese Johaug här. Vi tar det steg för steg: grunden först, kvaliteten sen. Säg till om något skaver, så justerar vi planen.',
    initials: 'TJ',
    hue: 190,
    photo: true,
  },
  {
    id: 'northug',
    name: 'Coach Northug',
    tagline: 'Tävlingsinstinkt och glimten i ögat',
    greeting: 'Tja {who}! Coach Northug här. Formen ska sitta när det gäller, och vi ska ha kul på vägen. Vill du flytta, lägga till eller skruva upp mängden? Skjut iväg. Är du sjuk eller skadad tar vi det lugnt först.',
    initials: 'N',
    hue: 268,
    photo: true,
  },
  {
    id: 'halfvarsson',
    name: 'Coach Halfvarsson',
    tagline: 'Avslappnad och peppande',
    greeting: 'Hej {who}, Coach Halfvarsson här. Ingen stress, det löser sig. Berätta hur det känns så fixar vi planen tillsammans. Kör på!',
    initials: 'H',
    hue: 145,
    photo: true,
  },
  {
    id: 'erica',
    name: 'Coach Erica',
    tagline: 'CrossFit-monster, kör hårt',
    greeting: 'Läget {who}?! Coach Erica här. Tänk WOD, fast för skidor: mer styrka, mer drag, mindre gnäll. Vill du ha fler pass, tyngre pass eller flytta något? Sjuk eller skadad? Då skalar vi smart.',
    initials: 'E',
    hue: 330,
    photo: true,
    call: { victor: 'brorsan', dad: 'pappa' },
  },
  {
    id: 'jonas',
    name: 'Coach Jonas',
    tagline: 'Stockholmare som älskar träning',
    greeting: 'Tjena {who}! Coach Jonas här. Asså, träning är typ det bästa som finns. Berätta vad du vill ändra så fixar vi det, fett enkelt. Är du sjuk eller skadad tar vi det lugnt och smart.',
    initials: 'J',
    hue: 30,
    photo: true,
    call: { victor: 'svågern', dad: 'svärfar' },
  },
  {
    id: 'farmor',
    name: 'Coach Farmor & Farfar',
    tagline: 'Värme, mat och goda råd',
    greeting: 'Hej {who}! Det är Farmor och Farfar. Vi finns här om du vill ha hjälp med träningen. Ta det lugnt, klä dig varmt och ät ordentligt. Säg vad som behöver ändras, så hjälper vi till.',
    initials: 'FF',
    hue: 45,
    photo: true,
    call: { victor: 'kära barnbarn', dad: 'käre son' },
  },
  {
    id: 'marco',
    name: 'Coach Marco',
    tagline: 'Seg italienare från Bergamo',
    greeting: 'Ciao {who}! Coach Marco här, från Bergamo. Jag cyklar i timmar på tung växel bara för att det ska göra ont, men du ska äta och dricka ordentligt! Berätta vad du behöver, så fixar vi planen. Dai!',
    initials: 'M',
    hue: 160,
    photo: true,
  },
  {
    id: 'geir',
    name: 'Coach Geir',
    tagline: 'Bilar, hälsa och en Gin Tonic',
    greeting: 'Tjena {who}! Coach Geir här. Jag är väl ingen maratonmänniska, men en kropp behöver service precis som en bil. Berätta vad som behöver justeras så tar vi det lugnt och smart. Hälsan först, sen kanske en Gin Tonic.',
    initials: 'G',
    hue: 210,
    photo: true,
    call: { victor: 'brorsonen', dad: 'bror' },
  },
]

const KEY = 'haugaards-training:coach'
export const coachById = (id: string) => COACHES.find((c) => c.id === id) ?? COACHES[0]
export const readCoach = (): string => {
  try {
    return coachById(localStorage.getItem(KEY) ?? '').id
  } catch {
    return COACHES[0].id
  }
}
export const saveCoach = (id: string) => {
  try {
    localStorage.setItem(KEY, id)
  } catch {
    /* ignorera */
  }
}

// Vem pratar coachen med? Används för tilltal och för släktskap i familjecoacherna.
export type Relation = 'victor' | 'dad' | 'other'
export const relationOf = (name: string): Relation => (/victor/i.test(name) ? 'victor' : /^(ø|o)ivind|pappa|^dad$|^far$/i.test(name.trim()) ? 'dad' : 'other')

// Hur coachen tilltalar den som är vald: släktnamn för familjecoacherna, annars namnet
export const whoFor = (coach: Coach, personName: string, translate: (s: string) => string): string => {
  const r = relationOf(personName)
  return coach.call && r !== 'other' ? translate(coach.call[r]) : personName
}
