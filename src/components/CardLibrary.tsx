import { CARDS, CATEGORY_COLOR } from '../lib/cards'
import { fmtDuration, sessionMinutes } from '../lib/stats'
import type { TrainingCard } from '../types'
import { ZoneBar } from './ZoneBar'

interface Props {
  onPick?: (c: TrainingCard) => void
}

export function CardLibrary({ onPick }: Props) {
  return (
    <div className="library">
      {CARDS.map((c) => (
        <div
          key={c.id}
          className="tcard"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify({ kind: 'card', id: c.id }))
            e.dataTransfer.effectAllowed = 'copy'
          }}
          onClick={() => onPick?.(c)}
        >
          <span className="stripe" style={{ background: CATEGORY_COLOR[c.category] }} />
          <div className="tcard-main">
            <div className="chip-title">{c.name}</div>
            <div className="chip-meta">
              {fmtDuration(sessionMinutes(c))} · {c.hint}
            </div>
            <ZoneBar zones={c.zones} nonZone={c.nonZone} thin />
          </div>
        </div>
      ))}
    </div>
  )
}
