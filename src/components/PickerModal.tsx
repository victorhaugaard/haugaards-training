import { useState } from 'react'
import type { Location, TrainingCard } from '../types'
import { fullDate, cap } from '../lib/dates'
import { tr } from '../i18n/core'
import { CardInfoModal } from './CardInfoModal'
import { CardLibrary } from './CardLibrary'
import { Modal } from './Modal'

interface Props {
  date: string
  onPick: (c: TrainingCard, date: string, location?: Location) => void
  onClose: () => void
}

export function PickerModal({ date, onPick, onClose }: Props) {
  const [picked, setPicked] = useState<TrainingCard | null>(null)
  if (picked) return <CardInfoModal card={picked} defaultDate={date} onAdd={onPick} onClose={onClose} onBack={() => setPicked(null)} />
  return (
    <Modal title={tr('Lägg till · {date}', { date: cap(fullDate(date)) })} onClose={onClose}>
      <CardLibrary onPick={setPicked} />
    </Modal>
  )
}
