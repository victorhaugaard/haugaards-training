import { useState } from 'react'
import type { Session, Sport, Zones } from '../types'
import { SPORTS, cardById } from '../lib/cards'
import { useZones } from '../lib/zones'
import { fmtDuration, sessionMinutes } from '../lib/stats'
import { Segmented } from './Segmented'
import { Modal } from './Modal'
import { ZoneBar } from './ZoneBar'
import { tr } from '../i18n/core'
import { hasTechnique, techniqueOptions } from '../lib/technique'

interface Props {
  session: Session
  onSave: (patch: Partial<Session>) => void
  onDelete: () => void
  onDuplicate: () => void
  onClose: () => void
  onBack: () => void
}

export function EditModal({ session, onSave, onDelete, onDuplicate, onClose, onBack }: Props) {
  const [s, setS] = useState({ ...session, title: tr(session.title) })
  const { labels, names } = useZones()
  const card = cardById(session.cardId)
  const set = <K extends keyof Session>(k: K, v: Session[K]) => setS((x) => ({ ...x, [k]: v }))
  const setZone = (i: number, v: number) => {
    const z = [...s.zones] as Zones
    z[i] = Math.max(0, v || 0)
    set('zones', z)
  }

  return (
    <Modal
      title={tr('Redigera pass')}
      onClose={onClose}
      footer={
        <>
          <button className="btn danger" onClick={() => (onDelete(), onClose())}>
            {tr('Ta bort')}
          </button>
          <button className="btn" onClick={() => (onDuplicate(), onClose())}>
            {tr('Duplicera')}
          </button>
          <span className="spacer" />
          <button className="btn" onClick={onBack}>
            {tr('Avbryt')}
          </button>
          <button
            className="btn primary"
            onClick={() => {
              onSave({
                title: (() => {
                  const t = s.title.trim() || tr('Pass')
                  return card && t === tr(card.name) ? card.name : t // behåll svenska grundnamnet så att det kan översättas
                })(),
                sport: s.sport,
                date: s.date,
                zones: s.zones,
                nonZone: s.nonZone,
                notes: s.notes,
                done: s.done,
                ...(s.location ? { location: s.location } : {}),
                ...(hasTechnique(s.sport) ? { technique: s.technique ?? '' } : {}),
              })
              onBack()
            }}
          >
            {tr('Spara')}
          </button>
        </>
      }
    >
      <label className="field">
        <span>{tr('Namn')}</span>
        <input value={s.title} onChange={(e) => set('title', e.target.value)} />
      </label>
      <div className="row">
        <label className="field">
          <span>{tr('Typ')}</span>
          <select value={s.sport} onChange={(e) => set('sport', e.target.value as Sport)}>
            {SPORTS.map((x) => (
              <option key={x} value={x}>
                {tr(x)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{tr('Datum')}</span>
          <input type="date" value={s.date} onChange={(e) => e.target.value && set('date', e.target.value)} />
        </label>
      </div>

      <div className="field">
        <span>
          {tr('Minuter per zon · totalt')} <b>{fmtDuration(sessionMinutes(s))}</b>
        </span>
        <div className="zone-inputs">
          {labels.map((l, i) => (
            <label key={l} title={names[i]}>
              <i style={{ background: `var(--z${i + 1})` }} />
              {l}
              <input type="number" min={0} step={5} value={s.zones[i]} onChange={(e) => setZone(i, +e.target.value)} />
            </label>
          ))}
        </div>
        <ZoneBar zones={s.zones} nonZone={s.nonZone} />
      </div>
      {card?.home && (
        <div className="field">
          <span>{tr('Plats')}</span>
          <Segmented
            value={s.location ?? 'gym'}
            onChange={(l) => set('location', l)}
            options={[
              ['gym', tr('Gym')],
              ['home', tr('Hemma')],
            ]}
          />
        </div>
      )}
      {hasTechnique(s.sport) && (
        <div className="field">
          <span>{tr('Teknik')}</span>
          <Segmented value={s.technique ?? ''} onChange={(t) => set('technique', t)} options={techniqueOptions()} />
        </div>
      )}
      {(s.nonZone > 0 || s.sport === 'Styrka' || s.sport === 'Rörlighet') && (
        <label className="field">
          <span>{tr('Tid för styrka och rörlighet (minuter)')}</span>
          <input type="number" min={0} step={5} value={s.nonZone} onChange={(e) => set('nonZone', Math.max(0, +e.target.value || 0))} />
        </label>
      )}

      <label className="field">
        <span>{tr('Anteckningar')}</span>
        <textarea rows={3} value={s.notes} onChange={(e) => set('notes', e.target.value)} />
      </label>
      <label className="inline">
        <input type="checkbox" checked={s.done} onChange={(e) => set('done', e.target.checked)} /> {tr('Genomfört')}
      </label>
    </Modal>
  )
}
