import { useState } from 'react'
import { CARDS, CARD_GROUPS, CATEGORY_COLOR } from '../lib/cards'
import { fmtDuration, sessionMinutes } from '../lib/stats'
import { useDrag } from '../lib/drag'
import type { TrainingCard } from '../types'
import { ZoneBar } from './ZoneBar'
import { tr } from '../i18n/core'
import { SportIcon } from './SportIcon'

interface Props {
  onPick?: (c: TrainingCard) => void
}

const KEY = 'haugaards-training:lib-open'

// Vilka sektioner som är öppna sparas i webbläsaren. Första gången är bara den första öppen.
const readOpen = (): string[] => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    if (Array.isArray(v)) return v
  } catch {
    /* ignorera */
  }
  return [CARD_GROUPS[0]]
}

export function CardLibrary({ onPick }: Props) {
  const { start, end } = useDrag()
  const [open, setOpen] = useState<string[]>(readOpen)
  const toggle = (g: string) =>
    setOpen((cur) => {
      const next = cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g]
      try {
        localStorage.setItem(KEY, JSON.stringify(next))
      } catch {
        /* ignorera */
      }
      return next
    })
  return (
    <div className="library">
      {CARD_GROUPS.map((g) => (
        <section key={g} className={'lib-group' + (open.includes(g) ? '' : ' closed')}>
          <button className="lib-toggle" aria-expanded={open.includes(g)} onClick={() => toggle(g)}>
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path d="M4 2.5 7.5 6 4 9.5" />
            </svg>
            <span>{tr(g)}</span>
            <em>{CARDS.filter((c) => c.group === g).length}</em>
          </button>
          <div className="lib-body">
            <div className="lib-inner">
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
              <span className="chip-icon">
                <SportIcon sport={c.sport} size={16} />
              </span>
              <div className="tcard-main">
                <div className="chip-title">{tr(c.name)}</div>
                <div className="chip-meta">
                  {fmtDuration(sessionMinutes(c))} · {tr(c.hint)}
                </div>
                <ZoneBar zones={c.zones} nonZone={c.nonZone} thin />
              </div>
            </div>
          ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}
