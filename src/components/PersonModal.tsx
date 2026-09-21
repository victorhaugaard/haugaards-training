import { useState } from 'react'
import type { Person, RunMode } from '../types'
import { startOfWeek, today } from '../lib/dates'
import { PLAN_END } from '../lib/generator'
import { GenerateForm, type GenValue } from './GenerateForm'
import { Modal } from './Modal'
import { Segmented } from './Segmented'
import { tr } from '../i18n/core'

export type NewPerson = {
  name: string
  mode: 'copy' | 'generate' | 'empty'
  basedOn: string
  scale: number
  hours: number
  runMode: RunMode
  restDay: number
  start: string
  end: string
}

interface Props {
  people: Person[]
  activeId: string
  initialName?: string
  onCreate: (p: NewPerson) => void
  onClose: () => void
}

export function PersonModal({ people, activeId, initialName, onCreate, onClose }: Props) {
  const [name, setName] = useState(initialName ?? tr('Pappa'))
  const [mode, setMode] = useState<NewPerson['mode']>(initialName ? 'generate' : 'copy')
  const [basedOn, setBasedOn] = useState(activeId)
  const [scale, setScale] = useState(80)
  // Skonsamt som förval för nya personer
  const [gen, setGen] = useState<GenValue>({ start: startOfWeek(today()), end: PLAN_END, hours: 10, runMode: 'none', restDay: 0, fresh: false })

  return (
    <Modal
      wide={mode === 'generate'}
      title={tr('Lägg till person')}
      onClose={onClose}
      footer={
        <>
          <span className="spacer" />
          <button
            className="btn primary"
            disabled={!name.trim()}
            onClick={() =>
              (onCreate({ name: name.trim(), mode, basedOn, scale: scale / 100, hours: gen.hours, runMode: gen.runMode, restDay: gen.restDay, start: gen.start, end: gen.end }), onClose())
            }
          >
            {tr('Skapa')}
          </button>
        </>
      }
    >
      <label className="field">
        <span>{tr('Namn')}</span>
        <input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </label>
      <div className="field">
        <span>{tr('Startplan')}</span>
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            ['copy', tr('Baserad på annan')],
            ['generate', tr('Autogenerera')],
            ['empty', tr('Tom')],
          ]}
        />
      </div>
      {mode === 'copy' && (
        <>
          <div className="field">
            <span>{tr('Löpning')}</span>
            <Segmented
              value={gen.runMode}
              onChange={(runMode) => setGen((g) => ({ ...g, runMode }))}
              options={[
                ['none', tr('Ingen (skonsamt)')],
                ['little', tr('Lite då och då')],
              ]}
            />
          </div>
          <label className="field">
            <span>{tr('Baserad på')}</span>
            <select value={basedOn} onChange={(e) => setBasedOn(e.target.value)}>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{tr('Volym relativt förlagan: {n}%', { n: scale })}</span>
            <input type="range" min={40} max={120} step={5} value={scale} onChange={(e) => setScale(+e.target.value)} />
          </label>
        </>
      )}
      {mode === 'generate' && <GenerateForm value={gen} onChange={(p) => setGen((g) => ({ ...g, ...p }))} />}
    </Modal>
  )
}
