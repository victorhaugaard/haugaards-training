import { useState } from 'react'
import type { RunMode } from '../types'
import { startOfWeek, today } from '../lib/dates'
import { PLAN_END } from '../lib/generator'
import { GenerateForm, type GenValue } from './GenerateForm'
import { Modal } from './Modal'
import { tr } from '../i18n/core'

export type GenerateChoice = GenValue

interface Props {
  name: string
  initialRunMode: RunMode
  initialRestDay: number
  onGenerate: (o: GenerateChoice) => void
  onClose: () => void
}

export function GenerateModal({ name, initialRunMode, initialRestDay, onGenerate, onClose }: Props) {
  const [v, setV] = useState<GenValue>({ start: startOfWeek(today()), end: PLAN_END, hours: 12, runMode: initialRunMode, restDay: initialRestDay, fresh: false })

  return (
    <Modal
      wide
      title={tr('Autogenerera plan · {name}', { name })}
      onClose={onClose}
      footer={
        <>
          <span className="muted small">
            {tr(v.fresh ? 'Hela den gamla planen raderas, även genomförda pass.' : 'Genomförda pass behålls. Övriga pass från startdatumet ersätts.')}
          </span>
          <span className="spacer" />
          <button className="btn primary" onClick={() => (onGenerate(v), onClose())}>
            {tr('Generera')}
          </button>
        </>
      }
    >
      <GenerateForm value={v} onChange={(p) => setV((x) => ({ ...x, ...p }))} showFresh />
    </Modal>
  )
}
