import type { DragEvent } from 'react'
import type { Session } from '../types'
import { CATEGORY_COLOR, cardById, fillZones } from '../lib/cards'
import { useZones } from '../lib/zones'
import { fmtDuration, sessionMinutes } from '../lib/stats'
import { ZoneBar } from './ZoneBar'

interface Props {
  session: Session
  compact?: boolean
  detail?: boolean
  onPatch: (id: string, patch: Partial<Session>) => void
  onOpen: (s: Session) => void
  onToggle: (id: string) => void
  onDropOn: (e: DragEvent, beforeId: string) => void
}

export function SessionChip({ session: s, compact, detail, onPatch, onOpen, onToggle, onDropOn }: Props) {
  const minutes = sessionMinutes(s)
  const { labels } = useZones()
  const card = cardById(s.cardId)
  const loc = s.location ?? 'gym'
  return (
    <div
      className={'chip' + (s.done ? ' done' : '') + (compact ? ' compact' : '')}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ kind: 'session', id: s.id }))
        e.dataTransfer.effectAllowed = 'move'
        e.currentTarget.classList.add('dragging')
      }}
      onDragEnd={(e) => e.currentTarget.classList.remove('dragging')}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.stopPropagation()
        onDropOn(e, s.id)
      }}
      onClick={() => onOpen(s)}
      title={`${s.title} · ${fmtDuration(minutes)}`}
    >
      <span className="stripe" style={{ background: CATEGORY_COLOR[s.category] }} />
      {/* Bocken glider in vid hover och knuffar texten åt höger (som Trello) */}
      <span className="check-slot">
        <button
          className={'check' + (s.done ? ' on' : '')}
          aria-label={s.done ? 'Markera som ogjort' : 'Markera som gjort'}
          onClick={(e) => {
            e.stopPropagation()
            onToggle(s.id)
          }}
        >
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2.5 6.4l2.3 2.3 4.7-5" />
          </svg>
        </button>
      </span>
      <div className="chip-main">
        <div className="chip-title">{s.title}</div>
        {!compact && (
          <>
            <div className="chip-meta">
              {fmtDuration(minutes)} · {s.sport}
              {card?.home && (
                <button
                  className="loc"
                  title="Växla mellan gym och hemma"
                  onClick={(e) => {
                    e.stopPropagation()
                    onPatch(s.id, { location: loc === 'gym' ? 'home' : 'gym' })
                  }}
                >
                  {loc === 'gym' ? 'Gym' : 'Hemma'}
                </button>
              )}
            </div>
            {detail && card && <div className="chip-detail">{fillZones((loc === 'home' && card.home ? card.home : card.coach).purpose, labels)}</div>}
            <ZoneBar zones={s.zones} nonZone={s.nonZone} thin />
          </>
        )}
      </div>
      {compact && <span className="chip-time">{Math.round(minutes / 6) / 10}h</span>}
    </div>
  )
}
