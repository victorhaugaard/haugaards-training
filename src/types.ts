export type Zones = [number, number, number, number, number] // minuter i de fem intensitetsnivåerna

export type Sport =
  | 'Löpning'
  | 'Rullskidor'
  | 'Cykel'
  | 'Skidor'
  | 'Styrka'
  | 'Rörlighet'
  | 'Tävling'
  | 'Övrigt'

export type Category = 'easy' | 'quality' | 'hard' | 'strength' | 'race' | 'other'

export interface TrainingCard {
  id: string
  name: string
  sport: Sport
  category: Category
  zones: Zones
  nonZone: number // minuter utan zon (styrka, rörlighet)
  flex?: boolean // kan skalas i längd av generatorn
  hint: string
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
}

export interface Person {
  id: string
  name: string
  createdAt?: number
}

export interface AppState {
  people: Person[]
  sessions: Session[]
  activePersonId: string
}

export type View = 'day' | 'week' | 'month' | 'overview'
