import { useMemo, useState, type DragEvent } from 'react'
import type { Session } from '../types'
import { CARDS } from '../lib/cards'
import { addDays, startOfWeek, today } from '../lib/dates'
import { uid } from '../lib/id'
import { tr } from '../i18n/core'
import { DragProvider } from '../lib/drag'
import { Board } from './Board'
import { SessionModal } from './SessionModal'
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
  const [openId, setOpenId] = useState<string | null>(null)
  const open = sessions.find((s) => s.id === openId)
  const toggle = (id: string) => setSessions((l) => l.map((s) => (s.id === id ? { ...s, done: !s.done } : s)))
  const patch = (id: string, p: Partial<Session>) => setSessions((l) => l.map((s) => (s.id === id ? { ...s, ...p } : s)))

  // Flytta pass mellan dagar, precis som i appen
  const drop = (e: DragEvent, date: string, beforeId?: string) => {
    e.preventDefault()
    let data: { kind: string; id: string }
    try {
      data = JSON.parse(e.dataTransfer.getData('text/plain'))
    } catch {
      return
    }
    if (data.kind !== 'session' || data.id === beforeId) return
    setSessions((list) => {
      const cur = list.find((s) => s.id === data.id)
      if (!cur) return list
      const rest = list.filter((s) => s.id !== cur.id)
      const day = rest.filter((s) => s.date === date).sort((a, b) => a.order - b.order)
      const idx = beforeId ? day.findIndex((s) => s.id === beforeId) : day.length
      const moved = { ...cur, date }
      day.splice(idx < 0 ? day.length : idx, 0, moved)
      const orders = new Map(day.map((s, i) => [s.id, i]))
      let next = [...rest, moved].map((s) => (orders.has(s.id) ? { ...s, order: orders.get(s.id)! } : s))
      if (cur.date !== date) {
        const old = next.filter((s) => s.date === cur.date).sort((a, b) => a.order - b.order)
        const o2 = new Map(old.map((s, i) => [s.id, i]))
        next = next.map((s) => (o2.has(s.id) ? { ...s, order: o2.get(s.id)! } : s))
      }
      return next
    })
  }

  return (
    <DragProvider>
    <section className="l-demo">
      <div className="l-demo-head">
        <div className="l-label">{tr('Så ser en vecka ut')}</div>
        <h2>{tr('Planera, checka av och följ upp')}</h2>
        <p>{tr('Här är en exempelvecka. Checka av pass, flytta dem mellan dagar eller tryck på ett pass för mer information.')}</p>
      </div>
      <div className="l-demo-app">
        <StatsBar sessions={sessions} label={tr('Vecka')} />
        <div className="l-demo-board">
          <Board
            view="week"
            cursor={monday}
            sessions={sessions}
            onOpen={(x) => setOpenId(x.id)}
            onToggle={toggle}
            onPatch={patch}
            onContext={noop}
            onAdd={noop}
            onDropTo={drop}
            onOpenDay={noop}
          />
        </div>
      </div>
      {open && (
        <SessionModal
          readOnly
          session={open}
          onClose={() => setOpenId(null)}
          onPatch={(p) => patch(open.id, p)}
          onToggle={() => toggle(open.id)}
          onDelete={noop}
          onDuplicate={noop}
        />
      )}
    </section>
    </DragProvider>
  )
}
