import type { TrainingCard } from '../types'
import { fullDate, cap } from '../lib/dates'
import { CardLibrary } from './CardLibrary'
import { Modal } from './Modal'
import { tr } from '../i18n/core'

export function PickerModal({ date, onPick, onClose }: { date: string; onPick: (c: TrainingCard) => void; onClose: () => void }) {
  return (
    <Modal title={tr('Lägg till · {date}', { date: cap(fullDate(date)) })} onClose={onClose}>
      <CardLibrary
        onPick={(c) => {
          onPick(c)
          onClose()
        }}
      />
    </Modal>
  )
}
