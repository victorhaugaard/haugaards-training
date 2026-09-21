import { CARDS, CARD_GROUPS, CATEGORY_COLOR } from '../lib/cards'
import { fmtDuration, sessionMinutes } from '../lib/stats'
import { useDrag } from '../lib/drag'
import type { TrainingCard } from '../types'
import { ZoneBar } from './ZoneBar'
import { tr } from '../i18n/core'

interface Props {
  onPick?: (c: TrainingCard) => void
}

export function CardLibrary({ onPick }: Props) {
  const { start, end } = useDrag()
  return (
    <div className="library">
      {CARD_GROUPS.map((g) => (
        <section key={g} className="lib-group">
          <h4>{tr(g)}</h4>
          {CARDS.filter((c) => c.group === g).map((c) => (
            <div
              key={c.id}
              className="tcard"
              style={{ '--cc': CATEGORY_COLOR[c.category] } as React.CSSProperties}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify({ kind: 'card', id: c.id }))
                e.dataTransfer.effectAllowed = 'copy'
                start({ kind: 'card', id: c.id, h: e.currentTarget.offsetHeight })
              }}
              onDragEnd={end}
              onClick={() => onPick?.(c)}
            >
              <span className="stripe" style={{ background: CATEGORY_COLOR[c.category] }} />
              <div className="tcard-main">
                <div className="chip-title">{tr(c.name)}</div>
                <div className="chip-meta">
                  {fmtDuration(sessionMinutes(c))} · {tr(c.hint)}
                </div>
                <ZoneBar zones={c.zones} nonZone={c.nonZone} thin />
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}
