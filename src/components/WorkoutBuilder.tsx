import { useEffect, useState } from 'react'
import type { Category, CustomTemplate, Sport, Zones } from '../types'
import { SPORTS } from '../lib/cards'
import { estimateMinutes } from '../lib/exercises'
import { uid } from '../lib/id'
import { useZones } from '../lib/zones'
import { fmtDuration } from '../lib/stats'
import { tr } from '../i18n/core'
import { ExerciseEditor } from './ExerciseList'
import { Modal } from './Modal'
import { Segmented } from './Segmented'
import { SportIcon } from './SportIcon'
import { ZoneBar } from './ZoneBar'

const PICKABLE = SPORTS.filter((s) => s !== 'Vila' && s !== 'Tävling') as Sport[]
const CATS: [Category, string][] = [
  ['easy', 'Lugnt'],
  ['quality', 'Kvalitet'],
  ['hard', 'Hårt'],
  ['strength', 'Styrka'],
  ['other', 'Övrigt'],
]
const sum = (z: Zones) => z.reduce((a, b) => a + b, 0)

interface Props {
  initial?: CustomTemplate
  date: string
  onSave: (t: CustomTemplate) => void
  onAddToDay: (t: CustomTemplate, date: string) => void
  onDelete?: () => void
  onClose: () => void
}

// Skapa eller redigera ett eget pass. Sparas under Mina pass i sidovyn och kan läggas i kalendern.
export function WorkoutBuilder({ initial, date: initialDate, onSave, onAddToDay, onDelete, onClose }: Props) {
  const { labels, names } = useZones()
  const [t, setT] = useState<CustomTemplate>(
    () =>
      initial ?? {
        id: 'tpl-' + uid(),
        name: '',
        sport: 'Styrka',
        category: 'strength',
        zones: [0, 0, 0, 0, 0],
        nonZone: 45,
        notes: '',
        exercises: [],
        createdAt: Date.now(),
      },
  )
  const [date, setDate] = useState(initialDate)
  const [split, setSplit] = useState(() => (initial ? initial.zones.filter(Boolean).length + (initial.nonZone ? 1 : 0) > 1 : false))
  const [manualTime, setManualTime] = useState(Boolean(initial))
  const set = (p: Partial<CustomTemplate>) => setT((x) => ({ ...x, ...p }))

  // Enkelt läge: all tid i en zon (eller utan zon för styrka)
  const minutes = sum(t.zones) + t.nonZone
  const mainZone = t.nonZone >= sum(t.zones) ? -1 : t.zones.indexOf(Math.max(...t.zones))
  const setSimple = (m: number, z: number) => {
    const zones = [0, 0, 0, 0, 0] as Zones
    if (z >= 0) zones[z] = m
    set({ zones, nonZone: z < 0 ? m : 0 })
  }

  // Tiden följer övningarna tills man ändrar den själv
  useEffect(() => {
    if (!manualTime && !split && t.exercises.length && mainZone < 0) setSimple(estimateMinutes(t.exercises), -1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.exercises, manualTime, split])

  const chooseCategory = (category: Category) => {
    set({ category })
    if (!split) setSimple(minutes, category === 'strength' || category === 'other' ? -1 : category === 'easy' ? 0 : category === 'quality' ? 3 : 4)
  }

  const valid = t.name.trim().length > 0 && minutes > 0
  const done = (): CustomTemplate => ({ ...t, name: t.name.trim() })

  return (
    <Modal
      wide
      title={tr(initial ? 'Redigera eget pass' : 'Nytt eget pass')}
      onClose={onClose}
      footer={
        <>
          {onDelete && (
            <button className="btn danger" onClick={() => confirm(tr('Ta bort {name} från Mina pass? Pass som redan ligger i kalendern finns kvar.', { name: t.name })) && (onDelete(), onClose())}>
              {tr('Ta bort')}
            </button>
          )}
          <span className="spacer" />
          <input className="date-input" type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} aria-label={tr('Datum')} />
          <button className="btn" disabled={!valid} onClick={() => (onSave(done()), onAddToDay(done(), date), onClose())}>
            {tr('Spara och lägg i kalendern')}
          </button>
          <button className="btn primary" disabled={!valid} onClick={() => (onSave(done()), onClose())}>
            {tr('Spara')}
          </button>
        </>
      }
    >
      <label className="field">
        <span>{tr('Namn')}</span>
        <input value={t.name} onChange={(e) => set({ name: e.target.value })} placeholder={tr('t.ex. Överkropp tisdag')} autoFocus={!initial} />
      </label>

      <div className="field">
        <span>{tr('Sport')}</span>
        <div className="wb-sports">
          {PICKABLE.map((s) => (
            <button key={s} className={t.sport === s ? 'on' : ''} onClick={() => set({ sport: s })} aria-pressed={t.sport === s}>
              <SportIcon sport={s} size={16} />
              {tr(s)}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <span>{tr('Typ av pass')}</span>
        <Segmented value={t.category} onChange={chooseCategory} options={CATS.map(([k, l]) => [k, tr(l)])} />
      </div>

      <div className="field">
        <span>
          {tr('Tid och intensitet')} · <b>{fmtDuration(minutes)}</b>
        </span>
        {!split ? (
          <div className="wb-simple">
            <input
              type="number"
              min={5}
              step={5}
              value={minutes}
              onChange={(e) => (setManualTime(true), setSimple(Math.max(0, +e.target.value || 0), mainZone))}
              aria-label={tr('Minuter')}
            />
            <span className="muted small">{tr('min i')}</span>
            <div className="pf-filter">
              <button className={mainZone < 0 ? 'on' : ''} onClick={() => setSimple(minutes, -1)}>
                {tr('Utan zon')}
              </button>
              {labels.map((l, i) => (
                <button key={l} className={mainZone === i ? 'on' : ''} onClick={() => setSimple(minutes, i)} title={names[i]}>
                  <i className="wb-dot" style={{ background: `var(--z${i + 1})` }} />
                  {l}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="zone-inputs">
            {labels.map((l, i) => (
              <label key={l} title={names[i]}>
                <i style={{ background: `var(--z${i + 1})` }} />
                {l}
                <input
                  type="number"
                  min={0}
                  step={5}
                  value={t.zones[i]}
                  onChange={(e) => set({ zones: t.zones.map((v, j) => (j === i ? Math.max(0, +e.target.value || 0) : v)) as Zones })}
                />
              </label>
            ))}
            <label title={tr('Styrka, rörlighet och annat utan pulszon')}>
              <i style={{ background: 'var(--c-nonzone)' }} />
              {tr('Utan zon')}
              <input type="number" min={0} step={5} value={t.nonZone} onChange={(e) => set({ nonZone: Math.max(0, +e.target.value || 0) })} />
            </label>
          </div>
        )}
        <ZoneBar zones={t.zones} nonZone={t.nonZone} />
        <button className="link-btn" onClick={() => (setSplit((s) => !s), setManualTime(true))}>
          {tr(split ? 'Enkelt läge' : 'Fördela själv på flera zoner')}
        </button>
      </div>

      <div className="field">
        <span>{tr('Övningar (valfritt)')}</span>
        <ExerciseEditor items={t.exercises} onChange={(exercises) => set({ exercises })} />
      </div>

      <label className="field">
        <span>{tr('Anteckningar')}</span>
        <textarea rows={3} value={t.notes} onChange={(e) => set({ notes: e.target.value })} placeholder={tr('Upplägg, mål eller vad du vill komma ihåg')} />
      </label>
    </Modal>
  )
}
