import { useMemo, useState } from 'react'
import type { Session } from '../types'
import { CARDS } from '../lib/cards'
import { addDays, startOfWeek, today } from '../lib/dates'
import { uid } from '../lib/id'
import { tr } from '../i18n/core'
import { Board } from './Board'
import { StatsBar } from './StatsBar'

// Exempelvecka: [dag 0–6, kort, avklarat]
const TEMPLATE: [number, string, boolean][] = [
  [0, 'rest', true],
  [1, 'int-bike', true],
  [1, 'erg-tech', true],
  [2, 'rs-easy', true],
  [2, 'strength', true],
  [3, 'easy-bike', true],
  [3, 'strength-upper', false],
  [4, 'erg-long', false],
  [4, 'mobility', false],
  [5, 'int-rs', false],
  [6, 'rs-long', false],
]

const noop = () => {}

// Visar hur en vecka ser ut i appen, med statistik. Cirklarna går att trycka på.
export function WeekDemo() {
  const monday = startOfWeek(today())
  const initial = useMemo<Session[]>(() => {
    const perDay: Record<number, number> = {}
    return TEMPLATE.map(([day, cardId, done]) => {
      const c = CARDS.find((x) => x.id === cardId)!
      const order = (perDay[day] = (perDay[day] ?? -1) + 1)
      return {
        id: uid(),
        personId: 'demo',
        date: addDays(monday, day),
        order,
        cardId: c.id,
        title: c.name,
        sport: c.sport,
        category: c.category,
        zones: [...c.zones] as Session['zones'],
        nonZone: c.nonZone,
        notes: '',
        done,
        ...(c.home ? { location: 'gym' as const } : {}),
      }
    })
  }, [monday])
  const [sessions, setSessions] = useState(initial)
  const toggle = (id: string) => setSessions((l) => l.map((s) => (s.id === id ? { ...s, done: !s.done } : s)))

  return (
    <section className="l-demo">
      <div className="l-demo-head">
        <div className="l-label">{tr('Så ser en vecka ut')}</div>
        <h2>{tr('Planera, checka av och följ upp')}</h2>
        <p>{tr('Här är en exempelvecka. Tryck på cirklarna för att checka av pass och se statistiken uppdateras.')}</p>
      </div>
      <div className="l-demo-app">
        <StatsBar sessions={sessions} label={tr('Vecka')} />
        <div className="l-demo-board">
          <Board
            view="week"
            cursor={monday}
            sessions={sessions}
            onOpen={noop}
            onToggle={toggle}
            onPatch={noop}
            onContext={noop}
            onAdd={noop}
            onDropTo={noop}
            onOpenDay={noop}
          />
        </div>
      </div>
    </section>
  )
}
