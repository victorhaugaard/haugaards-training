import { useState } from 'react'
import type { Person, RunMode } from '../types'
import { Modal } from './Modal'
import { Segmented } from './Segmented'
import { tr } from '../i18n/core'
import { RestDayField } from './RestDayField'

export type NewPerson = { name: string; mode: 'copy' | 'generate' | 'empty'; basedOn: string; scale: number; hours: number; runMode: RunMode; restDay: number }

interface Props {
  people: Person[]
  activeId: string
  onCreate: (p: NewPerson) => void
  onClose: () => void
}

export function PersonModal({ people, activeId, onCreate, onClose }: Props) {
  const [name, setName] = useState(tr('Pappa'))
  const [mode, setMode] = useState<NewPerson['mode']>('copy')
  const [basedOn, setBasedOn] = useState(activeId)
  const [scale, setScale] = useState(80)
  const [hours, setHours] = useState(10)
  const [runMode, setRunMode] = useState<RunMode>('none')
  const [restDay, setRestDay] = useState(0)

  return (
    <Modal
      title={tr('Lägg till person')}
      onClose={onClose}
      footer={
        <>
          <span className="spacer" />
          <button
            className="btn primary"
            disabled={!name.trim()}
            onClick={() => (onCreate({ name: name.trim(), mode, basedOn, scale: scale / 100, hours, runMode, restDay }), onClose())}
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
      {mode !== 'empty' && (
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
      )}
      {mode === 'copy' && (
        <>
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
      {mode === 'generate' && <RestDayField value={restDay} onChange={setRestDay} />}
      {mode === 'generate' && (
        <label className="field">
          <span>{tr('Timmar per vecka i snitt: {h} h', { h: hours })}</span>
          <input type="range" min={4} max={15} step={0.5} value={hours} onChange={(e) => setHours(+e.target.value)} />
        </label>
      )}
    </Modal>
  )
}
