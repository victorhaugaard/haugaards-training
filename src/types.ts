export type Zones = [number, number, number, number, number] // minuter i de fem intensitetsnivåerna

export type Sport =
  | 'Löpning'
  | 'Rullskidor'
  | 'Cykel'
  | 'Skidor'
  | 'Vila'
  | 'Stakmaskin'
  | 'Styrka'
  | 'Rörlighet'
  | 'Tävling'
  | 'Övrigt'

export type Category = 'easy' | 'quality' | 'hard' | 'strength' | 'race' | 'other' | 'rest'

export type Location = 'gym' | 'home'
export type Technique = 'classic' | 'skate' | 'pole' // klassiskt, fristil, ren stakning (rullskidor/skidor)
export type RunMode = 'none' | 'little' // löpning: ingen (skonsamt för knän) eller lite då och då

export type Group = 'Distans' | 'Kvalitet' | 'Stakmaskin' | 'Zwift & Tacx' | 'Styrka' | 'Tävling & övrigt'

// Coachens beskrivning av ett pass. {z1}–{z5} ersätts med aktuellt zonsystem.
export interface Coach {
  purpose: string
  how: string[]
  tip: string
}

export interface TrainingCard {
  id: string
  name: string
  sport: Sport
  category: Category
  zones: Zones
  nonZone: number // minuter utan zon (styrka, rörlighet)
  flex?: boolean // kan skalas i längd av generatorn
  hint: string
  group: Group
  coach: Coach
  home?: Coach // alternativ version hemma med lätta redskap
}

// En vald övning i ett eget styrkepass
export interface Exercise {
  id: string
  sets: number
  reps: string
}

export interface Session {
  id: string
  personId: string
  date: string // YYYY-MM-DD
  order: number
  cardId: string
  title: string
  sport: Sport
  category: Category
  zones: Zones
  nonZone: number
  notes: string
  done: boolean
  location?: Location
  raceId?: string // sätts på tävlingen och passen i nedtrappningen runt den
  exercises?: Exercise[] // övningar i ett eget styrkepass
  stravaId?: string // Strava-aktivitetens id, för att undvika dubbletter
  stravaAuto?: boolean // true om passet skapades av synken (inget planerat pass matchade), annars en ihopkopplad matchning
  technique?: Technique | '' // teknik för rullskidor/skidor. '' = ospecificerad (skiljs från "inte satt" så att fältet går att nollställa)
}

export interface Person {
  id: string
  name: string
  createdAt?: number
  runMode?: RunMode
  restDay?: number // 0 = måndag … 6 = söndag, -1 = ingen fast vilodag
  photoUrl?: string // profilbild
  stravaAthleteId?: number // satt när personen kopplat sitt Strava-konto (själva token ligger bara på servern)
}

// Ett avklarat pass i kompakt form, sparas i historiken när en plan avslutas
export interface DoneSession {
  id: string
  date: string
  title: string
  sport: Sport
  category: Category
  minutes: number
  zones: Zones
  nonZone: number
}

export interface PlanArchive {
  plannedTotal: number // alla pass i planen
  due: number // pass som skulle ha varit gjorda när planen avslutades
  dueDone: number
  done: number
  dueMinutes: number
  doneMinutes: number
  completed: DoneSession[]
}

export interface PlanRecord {
  id: string
  personId: string
  seq: number // Plan 1, Plan 2 ...
  start: string
  end: string
  createdAt: number
  endedAt?: number // saknas för den plan som körs just nu
  hours?: number
  runMode?: RunMode
  restDay?: number
  source: 'generated' | 'copied' | 'coach' | 'earlier'
  archive?: PlanArchive
}

export interface PlanParams {
  start: string
  end: string
  hours?: number
  runMode?: RunMode
  restDay?: number
  source: PlanRecord['source']
}

export interface AppState {
  people: Person[]
  sessions: Session[]
  plans: PlanRecord[]
  activePersonId: string
}

export type View = 'day' | 'week' | 'month' | 'overview' | 'profile'
