import { useState } from 'react'
import type { Session } from '../types'
import { CATEGORY_COLOR, cardById } from '../lib/cards'
import { cap, fullDate } from '../lib/dates'
import { fmtDuration, sessionMinutes } from '../lib/stats'
import { CoachNote } from './CoachNote'
import { EditModal } from './EditModal'
import { Modal } from './Modal'
import { tr } from '../i18n/core'
import { SportIcon } from './SportIcon'
import { ZoneRows } from './ZoneRows'
import { exerciseById } from '../lib/exercises'
import { StravaMark } from './StravaMark'

interface Props {
  session: Session
  onPatch: (patch: Partial<Session>) => void
  onToggle: () => void
  onDelete: () => void
  onDuplicate: () => void
  onEditExercises?: () => void
  readOnly?: boolean // bara information (t.ex. exempelvecka på landningssidan)
  onClose: () => void
}

// Träningsinformation som kort. Redigering öppnas med knappen uppe till höger.
export function SessionModal({ session: s, onPatch, onToggle, onDelete, onDuplicate, onEditExercises, readOnly, onClose }: Props) {
  const [editing, setEditing] = useState(false)
  const card = cardById(s.cardId)
  const isRest = s.category === 'rest'

  if (editing && !isRest && !readOnly)
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
  return (
    <Modal
      title={tr(s.title)}
      onClose={onClose}
      actions={
        isRest || readOnly ? undefined : (
          <button className="btn small" onClick={() => setEditing(true)} aria-label={tr('Redigera pass')}>
            {tr('✎ Redigera')}
          </button>
        )
      }
      footer={
        <>
          {!readOnly && (
            <button className="btn danger" onClick={() => (onDelete(), onClose())}>
              {tr('Ta bort')}
            </button>
          )}
          <span className="spacer" />
          {!isRest && (
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
        {s.stravaId && (
          <span className="sc-strava" title={tr('Importerat från Strava')}>
            <StravaMark size={13} /> Strava
          </span>
        )}
      </div>

      <ZoneRows zones={s.zones} nonZone={s.nonZone} sport={s.sport} />

      {card && card.id !== 'other' && <CoachNote card={card} location={s.location} onLocation={(l) => onPatch({ location: l })} />}

      {s.exercises && s.exercises.length > 0 && (
        <div className="sc-ex">
          <div className="stat-label">{tr('Övningar')}</div>
          {s.exercises.map((e, i) => (
            <div key={i} className="sc-ex-row">
              <span>{tr(exerciseById(e.id)?.name ?? e.id)}</span>
              <em>
                {e.sets} × {e.reps}
              </em>
            </div>
          ))}
        </div>
      )}
      {!readOnly && onEditExercises && s.cardId === 'strength-custom' && (
        <button className="btn small" style={{ alignSelf: 'flex-start' }} onClick={onEditExercises}>
          {tr('Redigera övningar')}
        </button>
      )}

      {s.notes && (
        <div className="sc-notes">
          <span className="stat-label">{tr('Anteckningar')}</span>
          <p>{tr(s.notes)}</p>
        </div>
      )}
    </Modal>
  )
}
