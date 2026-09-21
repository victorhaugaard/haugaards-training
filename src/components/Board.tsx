import { useRef, useState, type DragEvent } from 'react'
import type { Session, View } from '../types'
import { cap, dayMonth, fullDate, monthGrid, parse, today, weekdayLong, weekdayShort, weekDays } from '../lib/dates'
import { useDrag } from '../lib/drag'
import { fmtHours } from '../lib/stats'
import { SessionChip } from './SessionChip'
import { tr } from '../i18n/core'
import { MOBILE, useMedia } from '../lib/useMedia'
import { CATEGORY_COLOR } from '../lib/cards'

interface Props {
  view: View
  cursor: string
  sessions: Session[]
  onOpen: (s: Session) => void
  onToggle: (id: string) => void
  onPatch: (id: string, patch: Partial<Session>) => void
  onContext: (s: Session, x: number, y: number) => void
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

function Column({ view, date, list, compact, muted, onOpen, onToggle, onPatch, onContext, onAdd, onDropTo, onOpenDay }: ColProps) {
  const [hover, setHover] = useState(false)
  const mobile = useMedia(MOBILE)
  const listRef = useRef<HTMLDivElement>(null)
  const { drag, over, setOver, end } = useDrag()

  const total = list.reduce((a, s) => a + s.zones.reduce((x, y) => x + y, 0) + s.nonZone, 0)
  const isToday = date === today()

  // Kortet som dras döljs på sin ursprungsplats, resten glider ihop
  const visible = drag?.kind === 'session' ? list.filter((s) => s.id !== drag.id) : list
  const gapIndex = over?.date === date ? Math.min(over.index, visible.length) : -1
  const gapHeight = compact ? 30 : Math.max(48, drag?.h ?? 56)

  // Var i listan musen är, räknat på ursprungslayouten så att luckan inte fladdrar
  const indexAt = (clientY: number) => {
    const wrap = listRef.current
    if (!wrap) return visible.length
    let y = wrap.getBoundingClientRect().top
    let idx = 0
    for (const el of Array.from(wrap.querySelectorAll<HTMLElement>('.chip-wrap:not(.src)'))) {
      const pad = el.querySelector<HTMLElement>('.chip-pad')
      const chip = el.querySelector<HTMLElement>('.chip')
      if (!pad || !chip) continue
      if (clientY > y + chip.offsetHeight / 2) idx++
      y += pad.offsetHeight
    }
    return idx
  }

  // Månadsvyn på mobil: bara datum och prickar, tryck öppnar dagen
  if (compact && mobile)
    return (
      <button className={'col cell m-cell' + (isToday ? ' today' : '') + (muted ? ' muted' : '')} onClick={() => onOpenDay(date)} aria-label={dayMonth(date)}>
        <span className="m-num">{parse(date).getDate()}</span>
        <span className="m-dots">
          {list.slice(0, 4).map((s) => (
            <i key={s.id} className={s.done ? 'done' : ''} style={{ background: CATEGORY_COLOR[s.category] }} />
          ))}
        </span>
        {total > 0 && <span className="m-hours">{fmtHours(total).replace(' h', '')}</span>}
      </button>
    )

  return (
    <div
      className={'col' + (compact ? ' cell' : '') + (hover ? ' over' : '') + (isToday ? ' today' : '') + (muted ? ' muted' : '')}
      onDragOver={(e) => {
        e.preventDefault()
        setHover(true)
        setOver({ date, index: indexAt(e.clientY) })
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return
        setHover(false)
        if (over?.date === date) setOver(null)
      }}
      onDoubleClick={(e) => {
        // Dubbelklick på en dag öppnar dagvyn (men inte när man klickar på ett pass eller en knapp)
        if (view !== 'day' && !(e.target as HTMLElement).closest('.chip-wrap, button, input')) onOpenDay(date)
      }}
      onDrop={(e) => {
        setHover(false)
        const before = visible[indexAt(e.clientY)]?.id
        end()
        onDropTo(e, date, before)
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
      <div
        ref={listRef}
        className={'col-list' + (gapIndex === visible.length && gapIndex >= 0 ? ' gap-end' : '')}
        style={{ '--gh': `${gapHeight}px` } as React.CSSProperties}
      >
        {list.map((s) => {
          const src = drag?.kind === 'session' && drag.id === s.id
          const before = !src && gapIndex >= 0 && visible[gapIndex]?.id === s.id
          return (
            <div
              key={s.id}
              className={'chip-wrap' + (src ? ' src' : '') + (before ? ' gap-before' : '')}
              style={src ? ({ '--h': `${(drag?.h ?? 60) + 6}px` } as React.CSSProperties) : undefined}
            >
              <div className="chip-inner">
                <div className="chip-pad">
                  <SessionChip session={s} compact={compact} detail={view === 'day'} onPatch={onPatch} onOpen={onOpen} onToggle={onToggle} onContext={onContext} />
                </div>
              </div>
            </div>
          )
        })}
        {visible.length === 0 && gapIndex < 0 && (
          <div className={'rest-ghost' + (compact ? ' compact' : '')}>
            <span className="stripe" style={{ background: 'var(--c-rest)' }} />
            {tr(compact ? 'Vila' : 'Vilodag')}
          </div>
        )}
      </div>
      <button className="add" onClick={() => onAdd(date)} aria-label={tr('Lägg till pass')}>
        {compact ? '+' : tr('+ Lägg till pass')}
      </button>
    </div>
  )
}
