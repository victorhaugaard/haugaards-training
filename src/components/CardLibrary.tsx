import { useState } from 'react'
import { CARDS, CARD_GROUPS, CATEGORY_COLOR } from '../lib/cards'
import { fmtDuration, sessionMinutes } from '../lib/stats'
import { useDrag } from '../lib/drag'
import type { CustomTemplate, TrainingCard } from '../types'
import { templateCard } from '../lib/templates'
import { ZoneBar } from './ZoneBar'
import { tr } from '../i18n/core'
import { SportIcon } from './SportIcon'

interface Props {
  onPick?: (c: TrainingCard) => void
  templates?: CustomTemplate[] // personens egna pass
  onNewTemplate?: () => void
  onPickTemplate?: (t: CustomTemplate) => void // annars öppnas det som ett vanligt kort
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
  return ['Mina pass', CARD_GROUPS[0]]
}

export function CardLibrary({ onPick, templates, onNewTemplate, onPickTemplate }: Props) {
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
  const mine = (templates ?? []).map(templateCard)
  const groups = [...(onNewTemplate || mine.length ? (['Mina pass'] as const) : []), ...CARD_GROUPS]
  const inGroup = (g: string) => (g === 'Mina pass' ? mine : CARDS.filter((c) => c.group === g))
  const pick = (c: TrainingCard) => {
    const t = templates?.find((x) => x.id === c.id)
    if (t && onPickTemplate) onPickTemplate(t)
    else onPick?.(c)
  }
  return (
    <div className="library">
      {groups.map((g) => (
        <section key={g} className={'lib-group' + (open.includes(g) ? '' : ' closed')}>
          <button className="lib-toggle" aria-expanded={open.includes(g)} onClick={() => toggle(g)}>
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path d="M4 2.5 7.5 6 4 9.5" />
            </svg>
            <span>{tr(g)}</span>
            <em>{inGroup(g).length}</em>
          </button>
          <div className="lib-body">
            <div className="lib-inner">
          {g === 'Mina pass' && onNewTemplate && (
            <button className="lib-new" onClick={onNewTemplate}>
              <span>+</span> {tr('Skapa eget pass')}
            </button>
          )}
          {g === 'Mina pass' && !mine.length && <p className="lib-empty">{tr('Egna pass sparas här och hör till den valda personen.')}</p>}
          {inGroup(g).map((c) => (
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
              onClick={() => pick(c)}
            >
              <span className="stripe" style={{ background: CATEGORY_COLOR[c.category] }} />
              <span className="chip-icon">
                <SportIcon sport={c.sport} size={16} />
              </span>
              <div className="tcard-main">
                <div className="chip-title">{tr(c.name)}</div>
                <div className="chip-meta">
                  {fmtDuration(sessionMinutes(c))}
                  {c.group === 'Mina pass'
                    ? c.exercises?.length
                      ? ` · ${c.exercises.length === 1 ? tr('1 övning') : tr('{n} övningar', { n: c.exercises.length })}`
                      : c.notes
                        ? ` · ${c.notes}`
                        : ''
                    : ` · ${tr(c.hint)}`}
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
