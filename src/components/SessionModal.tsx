import { useState } from 'react'
import type { Session } from '../types'
import { CATEGORY_COLOR, cardById } from '../lib/cards'
import { cap, fullDate } from '../lib/dates'
import { fmtDuration, sessionMinutes } from '../lib/stats'
import { useZones } from '../lib/zones'
import { CoachNote } from './CoachNote'
import { EditModal } from './EditModal'
import { Modal } from './Modal'
import { tr } from '../i18n/core'
import { SportIcon } from './SportIcon'

interface Props {
  session: Session
  onPatch: (patch: Partial<Session>) => void
  onToggle: () => void
  onDelete: () => void
  onDuplicate: () => void
  onClose: () => void
}

// Träningsinformation som kort. Redigering öppnas med knappen uppe till höger.
export function SessionModal({ session: s, onPatch, onToggle, onDelete, onDuplicate, onClose }: Props) {
  const [editing, setEditing] = useState(false)
  const { labels, names } = useZones()
  const card = cardById(s.cardId)
  const isRest = s.category === 'rest'

  if (editing && !isRest)
    return (
      <EditModal
        session={s}
        onSave={onPatch}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onClose={onClose}
        onBack={() => setEditing(false)}
      />
    )

  const total = sessionMinutes(s)
  const zoneTotal = s.zones.reduce((a, b) => a + b, 0)
  const rows = [
    ...s.zones.map((m, i) => ({ label: labels[i], name: names[i], m, color: `var(--z${i + 1})` })),
    ...(s.nonZone > 0 ? [{ label: '', name: tr(s.sport === 'Rörlighet' ? 'Rörlighet' : 'Styrka'), m: s.nonZone, color: 'var(--c-nonzone)' }] : []),
  ].filter((r) => r.m > 0)

  return (
    <Modal
      title={tr(s.title)}
      onClose={onClose}
      actions={
        isRest ? undefined : (
          <button className="btn small" onClick={() => setEditing(true)} aria-label={tr('Redigera pass')}>
            {tr('✎ Redigera')}
          </button>
        )
      }
      footer={
        <>
          {isRest ? (
            <button className="btn danger" onClick={() => (onDelete(), onClose())}>
              {tr('Ta bort')}
            </button>
          ) : (
            <button className={'btn ' + (s.done ? '' : 'primary')} onClick={onToggle}>
              {tr(s.done ? '✓ Genomfört · ångra' : 'Markera som genomfört')}
            </button>
          )}
        </>
      }
    >
      <div className="sc-meta">
        <span className="sc-icon" style={{ color: CATEGORY_COLOR[s.category] }}>
          <SportIcon sport={s.sport} size={18} />
        </span>
        {cap(fullDate(s.date))} · {tr(s.sport)}
        {s.category !== 'rest' && <> · {fmtDuration(total)}</>}
      </div>

      {rows.length > 0 && (
        <div className="sc-zones">
          {rows.map((r, i) => (
            <div key={i} className="sc-zone">
              <i style={{ background: r.color }} />
              <span>{r.label ? `${r.label} ${r.name}` : r.name}</span>
              <div className="sc-track">
                <b style={{ width: `${(r.m / total) * 100}%`, background: r.color }} />
              </div>
              <em>{fmtDuration(r.m)}</em>
            </div>
          ))}
          {zoneTotal > 0 && s.nonZone === 0 && <div className="sc-note">{tr('Totalt {d}', { d: fmtDuration(total) })}</div>}
        </div>
      )}

      {card && card.id !== 'other' && <CoachNote card={card} location={s.location} onLocation={(l) => onPatch({ location: l })} />}

      {s.notes && (
        <div className="sc-notes">
          <span className="stat-label">{tr('Anteckningar')}</span>
          <p>{tr(s.notes)}</p>
        </div>
      )}
    </Modal>
  )
}
