import { useState } from 'react'
import type { Session } from '../types'
import { CATEGORY_COLOR, cardById, cardExercises } from '../lib/cards'
import { cap, fullDate } from '../lib/dates'
import { fmtDuration, sessionMinutes } from '../lib/stats'
import { CoachNote } from './CoachNote'
import { EditModal } from './EditModal'
import { Modal } from './Modal'
import { tr } from '../i18n/core'
import { SportIcon } from './SportIcon'
import { ZoneRows } from './ZoneRows'
import { ExerciseEditor, ExerciseRunner } from './ExerciseList'
import { StravaMark } from './StravaMark'
import { techniqueSuffix } from '../lib/technique'

interface Props {
  session: Session
  onPatch: (patch: Partial<Session>) => void
  onToggle: () => void
  onDelete: () => void
  onDuplicate: () => void
  readOnly?: boolean // bara information (t.ex. exempelvecka på landningssidan)
  onClose: () => void
}

// Träningsinformation som kort. Redigering öppnas med knappen uppe till höger.
export function SessionModal({ session: s, onPatch, onToggle, onDelete, onDuplicate, readOnly, onClose }: Props) {
  const [editing, setEditing] = useState(false)
  const [editEx, setEditEx] = useState(false)
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
  // Äldre pass saknar egen lista: visa kortets, och spara den på passet först när något ändras
  const exercises = s.exercises ?? (card ? cardExercises(card, s.location) : undefined)
  const canHaveExercises = !isRest && (s.sport === 'Styrka' || s.sport === 'Kondition' || s.sport === 'Rörlighet' || Boolean(exercises?.length))
  const changeLocation = (l: 'gym' | 'home') => {
    const ids = (x?: { id: string }[]) => (x ?? []).map((e) => e.id).join()
    const untouched = card && ids(exercises) === ids(cardExercises(card, s.location)) && !exercises?.some((e) => e.done)
    onPatch({ location: l, ...(untouched && cardExercises(card, l) ? { exercises: cardExercises(card, l) } : {}) })
  }
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
        {techniqueSuffix(s)}
        {s.category !== 'rest' && <> · {fmtDuration(total)}</>}
        {s.stravaId && (
          <span className="sc-strava" title={tr('Importerat från Strava')}>
            <StravaMark size={13} /> Strava
          </span>
        )}
      </div>

      <ZoneRows zones={s.zones} nonZone={s.nonZone} sport={s.sport} />

      {card && card.id !== 'other' && <CoachNote card={card} location={s.location} onLocation={readOnly ? undefined : changeLocation} />}

      {editEx && !readOnly ? (
        <div className="field">
          <ExerciseEditor items={exercises ?? []} onChange={(ex) => onPatch({ exercises: ex })} homeOnly={s.location === 'home'} openPicker />
          <button className="btn small" style={{ alignSelf: 'flex-start' }} onClick={() => setEditEx(false)}>
            {tr('Klar')}
          </button>
        </div>
      ) : (
        exercises &&
        exercises.length > 0 && <ExerciseRunner items={exercises} onChange={readOnly ? undefined : (ex) => onPatch({ exercises: ex })} />
      )}
      {!readOnly && !editEx && canHaveExercises && (
        <button className="btn small" style={{ alignSelf: 'flex-start' }} onClick={() => setEditEx(true)}>
          {tr(exercises?.length ? 'Redigera övningar' : '+ Lägg till övningar')}
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
