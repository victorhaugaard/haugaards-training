import type { Person, Session } from '../types'
import { CARDS } from './cards'
import { addDays, parse, today, weekdayShort } from './dates'
import { sessionMinutes } from './stats'
import { getLang } from '../i18n/core'

// Sammanfattning som Coach Smirnov får med varje fråga
export const buildContext = (person: Person, sessions: Session[], zoneLabels: string[]) => {
  const t = today()
  const line = (s: Session) =>
    `${s.id} | ${s.date} ${weekdayShort(s.date)} | ${s.title} | ${s.sport} | ${s.category} | ${sessionMinutes(s)}min | ${s.zones.join('/')}${s.nonZone ? ` +${s.nonZone}str` : ''} | ${s.done ? 'done' : 'todo'}`
  const window = (from: string, to: string) =>
    sessions
      .filter((s) => s.date >= from && s.date <= to)
      .sort((a, b) => a.date.localeCompare(b.date) || a.order - b.order)
      .map(line)
      .join('\n') || '(none)'
  const races = sessions
    .filter((s) => s.category === 'race' && s.date >= t)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((s) => `${s.date} ${s.title}`)
    .join('; ')
  const weekdayLong = parse(t).toLocaleDateString('en-GB', { weekday: 'long' })
  return [
    `Today: ${t} (${weekdayLong}). Active person: ${person.name}. App language: ${getLang()}.`,
    `Running: ${person.runMode === 'none' ? 'none (knee-friendly)' : 'a little now and then'}. Rest day: ${person.restDay === undefined || person.restDay === 0 ? 'Monday' : person.restDay === -1 ? 'none fixed' : 'weekday index ' + person.restDay}.`,
    `Zone labels shown to the user: ${zoneLabels.join(', ')} (data is always [I1..I5]).`,
    `Upcoming races: ${races || 'none'}.`,
    `Last 7 days (id | date | title | sport | category | minutes | zones | status):\n${window(addDays(t, -7), addDays(t, -1))}`,
    `Next 14 days:\n${window(t, addDays(t, 13))}`,
    `Card library (id | name | sport | category | default minutes):\n${CARDS.map((c) => `${c.id} | ${c.name} | ${c.sport} | ${c.category} | ${sessionMinutes(c)}`).join('\n')}`,
  ].join('\n\n')
}
