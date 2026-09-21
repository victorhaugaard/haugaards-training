import { useState, type DragEvent } from 'react'
import type { Session, View } from '../types'
import { cap, dayMonth, fullDate, monthGrid, parse, today, weekdayLong, weekdayShort, weekDays } from '../lib/dates'
import { fmtHours } from '../lib/stats'
import { SessionChip } from './SessionChip'

interface Props {
  view: View
  cursor: string
  sessions: Session[]
  onOpen: (s: Session) => void
  onToggle: (id: string) => void
  onPatch: (id: string, patch: Partial<Session>) => void
  onAdd: (date: string) => void
  onDropTo: (e: DragEvent, date: string, beforeId?: string) => void
  onOpenDay: (date: string) => void
}

export function Board(p: Props) {
  const byDate = new Map<string, Session[]>()
  for (const s of p.sessions) {
    const l = byDate.get(s.date) ?? []
    l.push(s)
    byDate.set(s.date, l)
  }
  for (const l of byDate.values()) l.sort((a, b) => a.order - b.order)

  if (p.view === 'day') {
    return (
      <div className="board day">
        <Column {...p} date={p.cursor} list={byDate.get(p.cursor) ?? []} />
      </div>
    )
  }

  if (p.view === 'week') {
    return (
      <div className="board week">
        {weekDays(p.cursor).map((d) => (
          <Column key={d} {...p} date={d} list={byDate.get(d) ?? []} />
        ))}
      </div>
    )
  }

  const month = parse(p.cursor).getMonth()
  return (
    <div className="board month-wrap">
      <div className="month-head">
        {weekDays(p.cursor).map((d) => (
          <div key={d}>{cap(weekdayShort(d).replace('.', ''))}</div>
        ))}
      </div>
      <div className="board month">
        {monthGrid(p.cursor).map((d) => (
          <Column key={d} {...p} date={d} list={byDate.get(d) ?? []} compact muted={parse(d).getMonth() !== month} />
        ))}
      </div>
    </div>
  )
}

interface ColProps extends Props {
  date: string
  list: Session[]
  compact?: boolean
  muted?: boolean
}

function Column({ view, date, list, compact, muted, onOpen, onToggle, onPatch, onAdd, onDropTo, onOpenDay }: ColProps) {
  const [over, setOver] = useState(false)
  const total = list.reduce((a, s) => a + s.zones.reduce((x, y) => x + y, 0) + s.nonZone, 0)
  const isToday = date === today()

  return (
    <div
      className={'col' + (compact ? ' cell' : '') + (over ? ' over' : '') + (isToday ? ' today' : '') + (muted ? ' muted' : '')}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(false)
      }}
      onDrop={(e) => {
        setOver(false)
        onDropTo(e, date)
      }}
    >
      <header className="col-head">
        {compact ? (
          <button className="daynum" onClick={() => onOpenDay(date)}>
            {parse(date).getDate() === 1 ? dayMonth(date) : parse(date).getDate()}
          </button>
        ) : view === 'day' ? (
          <span className="col-title">{cap(fullDate(date))}</span>
        ) : (
          <button className="col-title" onClick={() => onOpenDay(date)}>
            {cap(weekdayLong(date))} <span className="col-date">{dayMonth(date)}</span>
          </button>
        )}
        <span className="col-total">{total ? fmtHours(total) : ''}</span>
      </header>
      <div className="col-list">
        {list.map((s) => (
          <SessionChip
            key={s.id}
            session={s}
            compact={compact}
            detail={view === 'day'}
            onPatch={onPatch}
            onOpen={onOpen}
            onToggle={onToggle}
            onDropOn={(e, beforeId) => {
              setOver(false)
              onDropTo(e, date, beforeId)
            }}
          />
        ))}
      </div>
      <button className="add" onClick={() => onAdd(date)} aria-label="Lägg till pass">
        {compact ? '+' : '+ Lägg till pass'}
      </button>
    </div>
  )
}
