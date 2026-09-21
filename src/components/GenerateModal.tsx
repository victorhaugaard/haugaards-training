import { useMemo, useState } from 'react'
import type { RunMode } from '../types'
import { addDays, startOfWeek, today } from '../lib/dates'
import { PLAN_END, generatePlan } from '../lib/generator'
import { Modal } from './Modal'
import { PlanGuide } from './PlanGuide'
import { Segmented } from './Segmented'
import { tr } from '../i18n/core'
import { RestDayField } from './RestDayField'

export interface GenerateChoice {
  start: string
  end: string
  hours: number
  runMode: RunMode
  restDay: number
  fresh: boolean // radera hela den gamla planen först
}

interface Props {
  name: string
  initialRunMode: RunMode
  initialRestDay: number
  onGenerate: (o: GenerateChoice) => void
  onClose: () => void
}

export function GenerateModal({ name, initialRunMode, initialRestDay, onGenerate, onClose }: Props) {
  const [start, setStart] = useState(startOfWeek(today()))
  const [end, setEnd] = useState(PLAN_END)
  const [hours, setHours] = useState(12)
  const [runMode, setRunMode] = useState<RunMode>(initialRunMode)
  const [fresh, setFresh] = useState(false)
  const [restDay, setRestDay] = useState(initialRestDay)

  const preview = useMemo(() => generatePlan({ personId: 'preview', start, end, hoursPerWeek: hours, runMode, restDay }), [start, end, hours, runMode, restDay])

  return (
    <Modal
      wide
      title={tr('Autogenerera plan · {name}', { name })}
      onClose={onClose}
      footer={
        <>
          <span className="muted small">
            {tr(fresh ? 'Hela den gamla planen raderas, även genomförda pass.' : 'Genomförda pass behålls. Övriga pass från startdatumet ersätts.')}
          </span>
          <span className="spacer" />
          <button className="btn primary" onClick={() => (onGenerate({ start, end, hours, runMode, restDay, fresh }), onClose())}>
            {tr('Generera')}
          </button>
        </>
      }
    >
      <div className="row">
        <label className="field">
          <span>{tr('Från')}</span>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label className="field">
          <span>{tr('Till')}</span>
          <input type="date" value={end} min={addDays(start, 7)} onChange={(e) => setEnd(e.target.value)} />
        </label>
      </div>
      <label className="field">
        <span>{tr('Timmar per vecka i snitt: {h} h', { h: hours })}</span>
        <input type="range" min={8} max={15} step={0.5} value={hours} onChange={(e) => setHours(+e.target.value)} />
      </label>
      <div className="field">
        <span>{tr('Löpning')}</span>
        <Segmented
          value={runMode}
          onChange={setRunMode}
          options={[
            ['none', tr('Ingen (skonsamt)')],
            ['little', tr('Lite då och då')],
          ]}
        />
      </div>
      <RestDayField value={restDay} onChange={setRestDay} />
      <label className="inline">
        <input type="checkbox" checked={fresh} onChange={(e) => setFresh(e.target.checked)} /> {tr('Börja om: radera hela den gamla planen först')}
      </label>
      <PlanGuide sessions={preview} runMode={runMode} restDay={restDay} />
    </Modal>
  )
}
