import { useState } from 'react'
import type { Location, TrainingCard } from '../types'
import { CATEGORY_COLOR } from '../lib/cards'
import { fmtDuration, sessionMinutes } from '../lib/stats'
import { tr } from '../i18n/core'
import { CoachNote } from './CoachNote'
import { Modal } from './Modal'
import { SportIcon } from './SportIcon'
import { ZoneRows } from './ZoneRows'

interface Props {
  card: TrainingCard
  defaultDate: string
  onAdd: (card: TrainingCard, date: string, location?: Location) => void
  onClose: () => void
  onBack?: () => void
}

// Information om ett träningskort, med möjlighet att lägga till det i kalendern
export function CardInfoModal({ card, defaultDate, onAdd, onClose, onBack }: Props) {
  const [date, setDate] = useState(defaultDate)
  const [location, setLocation] = useState<Location>('gym')

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
          <input className="date-input" type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} aria-label={tr('Datum')} />
          <span className="spacer" />
          <button
            className="btn primary"
            onClick={() => {
              onAdd(card, date, card.home ? location : undefined)
              onClose()
            }}
          >
            {tr('Lägg till i kalendern')}
          </button>
        </>
      }
    >
      <div className="sc-meta">
        <span className="sc-icon" style={{ color: CATEGORY_COLOR[card.category] }}>
          <SportIcon sport={card.sport} size={18} />
        </span>
        {tr(card.sport)}
        {card.category !== 'rest' && <> · {fmtDuration(sessionMinutes(card))}</>} · {tr(card.hint)}
      </div>
      <ZoneRows zones={card.zones} nonZone={card.nonZone} sport={card.sport} />
      <CoachNote card={card} location={location} onLocation={setLocation} />
    </Modal>
  )
}
