import { useState } from 'react'
import type { Session, Sport, Zones } from '../types'
import { SPORTS } from '../lib/cards'
import { useZones } from '../lib/zones'
import { fmtDuration, sessionMinutes } from '../lib/stats'
import { Modal } from './Modal'
import { ZoneBar } from './ZoneBar'

interface Props {
  session: Session
  onSave: (patch: Partial<Session>) => void
  onDelete: () => void
  onDuplicate: () => void
  onClose: () => void
}

export function EditModal({ session, onSave, onDelete, onDuplicate, onClose }: Props) {
  const [s, setS] = useState(session)
  const { labels, names } = useZones()
  const set = <K extends keyof Session>(k: K, v: Session[K]) => setS((x) => ({ ...x, [k]: v }))
  const setZone = (i: number, v: number) => {
    const z = [...s.zones] as Zones
    z[i] = Math.max(0, v || 0)
    set('zones', z)
  }

  return (
    <Modal
      title="Redigera pass"
      onClose={onClose}
      footer={
        <>
          <button className="btn danger" onClick={() => (onDelete(), onClose())}>
            Ta bort
          </button>
          <button className="btn" onClick={() => (onDuplicate(), onClose())}>
            Duplicera
          </button>
          <span className="spacer" />
          <button
            className="btn primary"
            onClick={() => {
              onSave({
                title: s.title.trim() || 'Pass',
                sport: s.sport,
                date: s.date,
                zones: s.zones,
                nonZone: s.nonZone,
                notes: s.notes,
                done: s.done,
              })
              onClose()
            }}
          >
            Spara
          </button>
        </>
      }
    >
      <label className="field">
        <span>Namn</span>
        <input value={s.title} onChange={(e) => set('title', e.target.value)} autoFocus />
      </label>
      <div className="row">
        <label className="field">
          <span>Typ</span>
          <select value={s.sport} onChange={(e) => set('sport', e.target.value as Sport)}>
            {SPORTS.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Datum</span>
          <input type="date" value={s.date} onChange={(e) => e.target.value && set('date', e.target.value)} />
        </label>
      </div>

      <div className="field">
        <span>
          Minuter per zon · totalt <b>{fmtDuration(sessionMinutes(s))}</b>
        </span>
        <div className="zone-inputs">
          {labels.map((l, i) => (
            <label key={l} title={names[i]}>
              <i style={{ background: `var(--z${i + 1})` }} />
              {l}
              <input type="number" min={0} step={5} value={s.zones[i]} onChange={(e) => setZone(i, +e.target.value)} />
            </label>
          ))}
          <label title="Styrka, rörlighet – ingen zon">
            <i style={{ background: 'var(--c-strength)' }} />
            Ö
            <input
              type="number"
              min={0}
              step={5}
              value={s.nonZone}
              onChange={(e) => set('nonZone', Math.max(0, +e.target.value || 0))}
            />
          </label>
        </div>
        <ZoneBar zones={s.zones} nonZone={s.nonZone} />
      </div>

      <label className="field">
        <span>Anteckningar</span>
        <textarea rows={3} value={s.notes} onChange={(e) => set('notes', e.target.value)} />
      </label>
      <label className="inline">
        <input type="checkbox" checked={s.done} onChange={(e) => set('done', e.target.checked)} /> Genomfört
      </label>
    </Modal>
  )
}
