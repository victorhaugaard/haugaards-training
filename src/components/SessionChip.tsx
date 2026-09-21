import type { Session } from '../types'
import { CATEGORY_COLOR, cardById, fillZones } from '../lib/cards'
import { useDrag } from '../lib/drag'
import { fmtDuration, sessionMinutes } from '../lib/stats'
import { useZones } from '../lib/zones'
import { ZoneBar } from './ZoneBar'
import { tr } from '../i18n/core'
import { SportIcon } from './SportIcon'

interface Props {
  session: Session
  compact?: boolean
  detail?: boolean
  onPatch: (id: string, patch: Partial<Session>) => void
  onOpen: (s: Session) => void
  onToggle: (id: string) => void
}

export function SessionChip({ session: s, compact, detail, onPatch, onOpen, onToggle }: Props) {
  const minutes = sessionMinutes(s)
  const { labels } = useZones()
  const { start, end } = useDrag()
  const card = cardById(s.cardId)
  const loc = s.location ?? 'gym'
  return (
    <div
      className={'chip' + (s.done ? ' done' : '') + (compact ? ' compact' : '')}
      style={{ '--cc': CATEGORY_COLOR[s.category] } as React.CSSProperties}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ kind: 'session', id: s.id }))
        e.dataTransfer.effectAllowed = 'move'
        start({ kind: 'session', id: s.id, h: e.currentTarget.offsetHeight })
      }}
      onDragEnd={end}
      onClick={() => onOpen(s)}
      title={`${tr(s.title)} · ${fmtDuration(minutes)}`}
    >
      <span className="stripe" style={{ background: CATEGORY_COLOR[s.category] }} />
      {/* Bocken glider in vid hover och knuffar texten åt höger (som Trello) */}
      <span className="check-slot">
        <button
          className={'check' + (s.done ? ' on' : '')}
          aria-label={tr(s.done ? 'Markera som ogjort' : 'Markera som gjort')}
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
      <span className="chip-icon" title={tr(s.sport)}>
        <SportIcon sport={s.sport} size={compact ? 12 : 16} />
      </span>
      <div className="chip-main">
        <div className="chip-title">{tr(s.title)}</div>
        {!compact && (
          <>
            <div className="chip-meta">
              {s.category === 'rest' ? tr('Vila') : `${fmtDuration(minutes)} · ${tr(s.sport)}`}
              {card?.home && (
                <button
                  className="loc"
                  title={tr('Växla mellan gym och hemma')}
                  onClick={(e) => {
                    e.stopPropagation()
                    onPatch(s.id, { location: loc === 'gym' ? 'home' : 'gym' })
                  }}
                >
                  {tr(loc === 'gym' ? 'Gym' : 'Hemma')}
                </button>
              )}
            </div>
            {detail && card && <div className="chip-detail">{fillZones(tr((loc === 'home' && card.home ? card.home : card.coach).purpose), labels)}</div>}
            <ZoneBar zones={s.zones} nonZone={s.nonZone} thin />
          </>
        )}
      </div>
      {compact && minutes > 0 && <span className="chip-time">{Math.round(minutes / 6) / 10}h</span>}
    </div>
  )
}
