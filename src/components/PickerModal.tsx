import type { TrainingCard } from '../types'
import { fullDate, cap } from '../lib/dates'
import { CardLibrary } from './CardLibrary'
import { Modal } from './Modal'

export function PickerModal({ date, onPick, onClose }: { date: string; onPick: (c: TrainingCard) => void; onClose: () => void }) {
  return (
    <Modal title={`Lägg till · ${cap(fullDate(date))}`} onClose={onClose}>
      <CardLibrary
        onPick={(c) => {
          onPick(c)
          onClose()
        }}
      />
    </Modal>
  )
}
