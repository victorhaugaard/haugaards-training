import { useState } from 'react'
import type { RunMode, SportFocus } from '../types'
import { today } from '../lib/dates'
import { PLAN_END } from '../lib/generator'
import { GenerateForm, type GenValue } from './GenerateForm'
import { Modal } from './Modal'
import { tr } from '../i18n/core'

export type GenerateChoice = GenValue

interface Props {
  name: string
  initialRunMode: RunMode
  initialRestDay: number
  initialFocus: SportFocus
  onGenerate: (o: GenerateChoice) => void
  onClose: () => void
}

export function GenerateModal({ name, initialRunMode, initialRestDay, initialFocus, onGenerate, onClose }: Props) {
  // Från idag som förval: allt före det och redan genomförda pass rör vi inte
  const [v, setV] = useState<GenValue>({ start: today(), end: PLAN_END, hours: 12, runMode: initialRunMode, restDay: initialRestDay, focus: initialFocus, fresh: false })

  return (
    <Modal
      wide
      title={tr('Autogenerera plan · {name}', { name })}
      onClose={onClose}
      footer={
        <>
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
