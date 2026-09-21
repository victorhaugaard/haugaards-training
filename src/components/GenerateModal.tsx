import { useState } from 'react'
import { addDays, startOfWeek, today } from '../lib/dates'
import { Modal } from './Modal'

interface Props {
  name: string
  onGenerate: (o: { start: string; end: string; hours: number }) => void
  onClose: () => void
}

export function GenerateModal({ name, onGenerate, onClose }: Props) {
  const [start, setStart] = useState(startOfWeek(today()))
  const [end, setEnd] = useState('2026-12-31')
  const [hours, setHours] = useState(12)

  return (
    <Modal
      title={`Autogenerera plan · ${name}`}
      onClose={onClose}
      footer={
        <>
          <span className="spacer" />
          <button className="btn primary" onClick={() => (onGenerate({ start, end, hours }), onClose())}>
            Generera
          </button>
        </>
      }
    >
      <p className="muted">
        Periodiserad plan efter längdskidelitens modell: cirka 85–90 % lågintensivt, 2–3 kvalitetspass per vecka, tre
        veckor upp och en vecka ned. Grund → uppbyggnad → snö/specifikt → säsongsstart. Genomförda pass behålls, alla
        andra pass från startdatumet ersätts.
      </p>
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
    </Modal>
  )
}
