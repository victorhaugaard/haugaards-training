import { useState } from 'react'
import type { Location, Technique, TrainingCard } from '../types'
import { CATEGORY_COLOR, cardExercises } from '../lib/cards'
import { fmtDuration, sessionMinutes } from '../lib/stats'
import { tr } from '../i18n/core'
import { hasTechnique, techniqueOptions } from '../lib/technique'
import { CoachNote } from './CoachNote'
import { ExerciseRunner } from './ExerciseList'
import { Modal } from './Modal'
import { Segmented } from './Segmented'
import { SportIcon } from './SportIcon'
import { ZoneRows } from './ZoneRows'

interface Props {
  card: TrainingCard
  defaultDate: string
  onAdd: (card: TrainingCard, date: string, location?: Location, technique?: Technique | '') => void
  onClose: () => void
  onBack?: () => void
  actionLabel?: string // t.ex. vid byte av pass
  hideDate?: boolean
}

// Information om ett träningskort, med möjlighet att lägga till det i kalendern
export function CardInfoModal({ card, defaultDate, onAdd, onClose, onBack, actionLabel, hideDate }: Props) {
  const [date, setDate] = useState(defaultDate)
  const [location, setLocation] = useState<Location>('gym')
  const [technique, setTechnique] = useState<Technique | ''>('')
  const exercises = cardExercises(card, card.home ? location : undefined)

  return (
    <Modal
      title={tr(card.name)}
      onClose={onClose}
      actions={
        onBack && (
          <button className="btn small" onClick={onBack}>
            ‹ {tr('Tillbaka')}
          </button>
        )
      }
      footer={
        <>
          {!hideDate && <input className="date-input" type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} aria-label={tr('Datum')} />}
          <span className="spacer" />
          <button
            className="btn primary"
            onClick={() => {
              onAdd(card, date, card.home ? location : undefined, hasTechnique(card.sport) ? technique : undefined)
              onClose()
            }}
          >
            {actionLabel ?? tr('Lägg till i kalendern')}
          </button>
        </>
      }
    >
      <div className="sc-meta">
        <span className="sc-icon" style={{ color: CATEGORY_COLOR[card.category] }}>
          <SportIcon sport={card.sport} size={18} />
        </span>
        {tr(card.sport)}
        {card.category !== 'rest' && <> · {fmtDuration(sessionMinutes(card))}</>}
        {card.hint && <> · {tr(card.hint)}</>}
      </div>
      {hasTechnique(card.sport) && (
        <div className="field">
          <span>{tr('Teknik')}</span>
          <Segmented value={technique} onChange={setTechnique} options={techniqueOptions()} />
        </div>
      )}
      <ZoneRows zones={card.zones} nonZone={card.nonZone} sport={card.sport} />
      {card.group === 'Mina pass' ? (
        card.notes && (
          <div className="sc-notes">
            <span className="stat-label">{tr('Anteckningar')}</span>
            <p>{card.notes}</p>
          </div>
        )
      ) : (
        <CoachNote card={card} location={location} onLocation={setLocation} />
      )}
      {exercises && <ExerciseRunner items={exercises} />}
    </Modal>
  )
}
