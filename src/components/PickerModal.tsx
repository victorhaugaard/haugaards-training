import { useState } from 'react'
import type { Location, Technique, TrainingCard } from '../types'
import { fullDate, cap } from '../lib/dates'
import { tr } from '../i18n/core'
import { CardInfoModal } from './CardInfoModal'
import { CardLibrary } from './CardLibrary'
import { Modal } from './Modal'
import { StrengthBuilder, type StrengthValue } from './StrengthBuilder'

interface Props {
  date: string
  onPick: (c: TrainingCard, date: string, location?: Location, technique?: Technique | '') => void
  onClose: () => void
  swap?: boolean // byt ut ett befintligt pass i stället för att lägga till
  onBuild?: (v: StrengthValue) => void // eget styrkepass
}

export function PickerModal({ date, onPick, onClose, swap, onBuild }: Props) {
  const [picked, setPicked] = useState<TrainingCard | null>(null)
  if (picked?.id === 'strength-custom' && onBuild) return <StrengthBuilder date={date} onSave={onBuild} onClose={onClose} onBack={() => setPicked(null)} />
  if (picked) return <CardInfoModal card={picked} defaultDate={date} onAdd={onPick} onClose={onClose} onBack={() => setPicked(null)} hideDate={swap} actionLabel={swap ? tr('Byt ut passet') : undefined} />
  return (
    <Modal title={swap ? tr('Byt mot annat pass') : tr('Lägg till · {date}', { date: cap(fullDate(date)) })} onClose={onClose}>
      <CardLibrary onPick={setPicked} />
    </Modal>
  )
}
