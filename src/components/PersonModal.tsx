import { useState } from 'react'
import type { Person } from '../types'
import { Modal } from './Modal'
import { Segmented } from './Segmented'

export type NewPerson = { name: string; mode: 'copy' | 'generate' | 'empty'; basedOn: string; scale: number; hours: number }

interface Props {
  people: Person[]
  activeId: string
  onCreate: (p: NewPerson) => void
  onClose: () => void
}

export function PersonModal({ people, activeId, onCreate, onClose }: Props) {
  const [name, setName] = useState('Pappa')
  const [mode, setMode] = useState<NewPerson['mode']>('copy')
  const [basedOn, setBasedOn] = useState(activeId)
  const [scale, setScale] = useState(80)
  const [hours, setHours] = useState(10)

  return (
    <Modal
      title="Lägg till person"
      onClose={onClose}
      footer={
        <>
          <span className="spacer" />
          <button
            className="btn primary"
            disabled={!name.trim()}
            onClick={() => (onCreate({ name: name.trim(), mode, basedOn, scale: scale / 100, hours }), onClose())}
          >
            Skapa
          </button>
        </>
      }
    >
      <label className="field">
        <span>Namn</span>
        <input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </label>
      <div className="field">
        <span>Startplan</span>
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            ['copy', 'Baserad på annan'],
            ['generate', 'Autogenerera'],
            ['empty', 'Tom'],
          ]}
        />
      </div>
      {mode === 'copy' && (
        <>
          <label className="field">
            <span>Baserad på</span>
            <select value={basedOn} onChange={(e) => setBasedOn(e.target.value)}>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Volym relativt förlagan: {scale}%</span>
            <input type="range" min={40} max={120} step={5} value={scale} onChange={(e) => setScale(+e.target.value)} />
          </label>
        </>
      )}
      {mode === 'generate' && (
        <label className="field">
          <span>Timmar per vecka i snitt: {hours} h</span>
          <input type="range" min={4} max={15} step={0.5} value={hours} onChange={(e) => setHours(+e.target.value)} />
        </label>
      )}
    </Modal>
  )
}
