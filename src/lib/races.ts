import type { Session, Zones } from '../types'
import { daysUntil } from './dates'

export interface RaceDef {
  id: string
  name: string
  short: string
  date: string
  km: string
  place: string
  note: string
  zones: Zones // förslag på minuter per zon, justera efter din måltid
  long?: boolean // längre nedtrappning och återhämtning
}

// La Sgambeda finns inte med: arrangören har meddelat att loppet läggs ner efter 35 upplagor.
export const RACES: RaceDef[] = [
  {
    id: 'gsieser',
    name: 'Gsieser Tal Lauf',
    short: 'Gsieser',
    date: '2027-02-20',
    km: '30/42',
    place: 'Gsiesertal, Sydtyrolen',
    note: 'Klassiskt på lördagen, fristil på söndagen. Flytta passet till söndagen om du kör fristil.',
    zones: [20, 10, 30, 70, 10],
  },
  {
    id: 'vasaloppet',
    name: 'Vasaloppet',
    short: 'Vasaloppet',
    date: '2027-03-07',
    km: '90',
    place: 'Sälen–Mora',
    note: 'Klassiskt. Justera minuterna efter din måltid.',
    zones: [30, 120, 150, 60, 0],
    long: true,
  },
  {
    id: 'birken',
    name: 'Birkebeinerrennet',
    short: 'Birken',
    date: '2027-03-20',
    km: '53',
    place: 'Rena–Lillehammer',
    note: 'Klassiskt. Går samma dag som Nordenskiöldsloppet, så du behöver välja ett av dem.',
    zones: [25, 45, 80, 60, 0],
  },
  {
    id: 'nordenskiold',
    name: 'Nordenskiöldsloppet',
    short: 'Nordenskiöld',
    date: '2027-03-20',
    km: '220',
    place: 'Jokkmokk',
    note: 'Går samma dag som Birkebeinerrennet, så du behöver välja ett av dem. Justera minuterna efter din måltid.',
    zones: [540, 120, 0, 0, 0],
    long: true,
  },
]

export interface Upcoming {
  id: string
  title: string
  date: string
  days: number
  clash: boolean
}

// Kommande tävlingar från träningsschemat, inklusive sådana man lagt till själv
export const upcomingRaces = (sessions: Session[]): Upcoming[] => {
  const list = sessions.filter((s) => s.category === 'race' && !s.done && daysUntil(s.date) >= 0).sort((a, b) => a.date.localeCompare(b.date))
  return list.map((s) => ({
    id: s.id,
    title: s.title,
    date: s.date,
    days: daysUntil(s.date),
    clash: list.some((o) => o.id !== s.id && o.date === s.date),
  }))
}
