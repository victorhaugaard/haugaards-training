import { useMemo, useState } from 'react'
import type { RunMode } from '../types'
import { addDays, startOfWeek, today } from '../lib/dates'
import { generatePlan } from '../lib/generator'
import { Modal } from './Modal'
import { PlanGuide } from './PlanGuide'
import { Segmented } from './Segmented'

export interface GenerateChoice {
  start: string
  end: string
  hours: number
  runMode: RunMode
}

interface Props {
  name: string
  initialRunMode: RunMode
  onGenerate: (o: GenerateChoice) => void
  onClose: () => void
}

export function GenerateModal({ name, initialRunMode, onGenerate, onClose }: Props) {
  const [start, setStart] = useState(startOfWeek(today()))
  const [end, setEnd] = useState('2026-12-31')
  const [hours, setHours] = useState(12)
  const [runMode, setRunMode] = useState<RunMode>(initialRunMode)

  const preview = useMemo(() => generatePlan({ personId: 'preview', start, end, hoursPerWeek: hours, runMode }), [start, end, hours, runMode])

  return (
    <Modal
      wide
      title={`Autogenerera plan · ${name}`}
      onClose={onClose}
      footer={
        <>
          <span className="muted small">Genomförda pass behålls. Övriga pass från startdatumet ersätts.</span>
          <span className="spacer" />
          <button className="btn primary" onClick={() => (onGenerate({ start, end, hours, runMode }), onClose())}>
            Generera
          </button>
        </>
      }
    >
      <div className="row">
        <label className="field">
          <span>Från</span>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label className="field">
          <span>Till</span>
          <input type="date" value={end} min={addDays(start, 7)} onChange={(e) => setEnd(e.target.value)} />
        </label>
      </div>
      <label className="field">
        <span>Timmar per vecka i snitt: {hours} h</span>
        <input type="range" min={8} max={15} step={0.5} value={hours} onChange={(e) => setHours(+e.target.value)} />
      </label>
      <div className="field">
        <span>Löpning</span>
        <Segmented
          value={runMode}
          onChange={setRunMode}
          options={[
            ['none', 'Ingen (skonsamt)'],
            ['little', 'Lite då och då'],
          ]}
        />
      </div>
      <PlanGuide sessions={preview} runMode={runMode} />
    </Modal>
  )
}
