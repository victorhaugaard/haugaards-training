import { useEffect, useMemo, useState } from 'react'
import type { Exercise, Location } from '../types'
import { EXERCISES, EX_GROUPS, estimateMinutes, exerciseById, type ExGroup } from '../lib/exercises'
import { tr } from '../i18n/core'
import { Modal } from './Modal'
import { Segmented } from './Segmented'

export interface StrengthValue {
  title: string
  exercises: Exercise[]
  minutes: number
  location: Location
  date: string
}

interface Props {
  date: string
  initial?: Partial<Omit<StrengthValue, 'date'>>
  editing?: boolean // redigerar ett befintligt pass, datumet ändras inte här
  onSave: (v: StrengthValue) => void
  onClose: () => void
  onBack?: () => void
}

// Bygg ett eget styrkepass genom att välja övningar, med gym eller hemma
export function StrengthBuilder({ date: initialDate, initial, editing, onSave, onClose, onBack }: Props) {
  const [title, setTitle] = useState(initial?.title ?? tr('Eget styrkepass'))
  const [location, setLocation] = useState<Location>(initial?.location ?? 'gym')
  const [chosen, setChosen] = useState<Exercise[]>(initial?.exercises ?? [])
  const [group, setGroup] = useState<ExGroup | 'all'>('all')
  const [date, setDate] = useState(initialDate)
  const [minutes, setMinutes] = useState(initial?.minutes ?? 45)
  const [manual, setManual] = useState(Boolean(initial?.minutes))

  // Tiden följer övningarna tills du ändrar den själv
  useEffect(() => {
    if (!manual && chosen.length) setMinutes(estimateMinutes(chosen))
  }, [chosen, manual])

  const list = useMemo(() => EXERCISES.filter((e) => (group === 'all' || e.group === group) && (location === 'gym' || e.home)), [group, location])

  const toggle = (id: string) => {
    const def = exerciseById(id)!
    setChosen((cur) => (cur.some((c) => c.id === id) ? cur.filter((c) => c.id !== id) : [...cur, { id, sets: def.sets, reps: def.reps }]))
  }
  const patch = (id: string, p: Partial<Exercise>) => setChosen((cur) => cur.map((c) => (c.id === id ? { ...c, ...p } : c)))
  const changeLocation = (l: Location) => {
    setLocation(l)
    // hemma: ta bort övningar som kräver gym
    if (l === 'home') setChosen((cur) => cur.filter((c) => exerciseById(c.id)?.home))
  }

  return (
    <Modal
      wide
      title={tr('Bygg styrkepass')}
      onClose={onClose}
      actions={
        onBack && (
          <button className="btn small" onClick={onBack}>
            ‹ {tr('Tillbaka')}
          </button>
        )
      }
      footer={
        <>
          {!editing && <input className="date-input" type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} aria-label={tr('Datum')} />}
          <span className="muted small">{chosen.length ? tr('{n} övningar · ca {min} min', { n: chosen.length, min: minutes }) : tr('Välj minst en övning')}</span>
          <span className="spacer" />
          <button className="btn primary" disabled={!chosen.length} onClick={() => (onSave({ title: title.trim() || tr('Eget styrkepass'), exercises: chosen, minutes, location, date }), onClose())}>
            {editing ? tr('Spara') : tr('Lägg till i kalendern')}
          </button>
        </>
      }
    >
      <div className="row">
        <label className="field">
          <span>{tr('Namn')}</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="field" style={{ maxWidth: 120 }}>
          <span>{tr('Tid (min)')}</span>
          <input
            type="number"
            min={10}
            step={5}
            value={minutes}
            onChange={(e) => {
              setManual(true)
              setMinutes(Math.max(5, +e.target.value || 5))
            }}
          />
        </label>
      </div>
      <div className="field">
        <span>{tr('Plats')}</span>
        <Segmented
          value={location}
          onChange={changeLocation}
          options={[
            ['gym', tr('Gym')],
            ['home', tr('Hemma')],
          ]}
        />
      </div>

      <div className="pf-filter">
        <button className={group === 'all' ? 'on' : ''} onClick={() => setGroup('all')}>
          {tr('Alla')}
        </button>
        {EX_GROUPS.map((g) => (
          <button key={g} className={group === g ? 'on' : ''} onClick={() => setGroup(g)}>
            {tr(g)}
          </button>
        ))}
      </div>

      <div className="ex-list">
        {list.map((e) => {
          const c = chosen.find((x) => x.id === e.id)
          return (
            <div key={e.id} className={'ex-row' + (c ? ' on' : '')}>
              <label className="ex-name">
                <input type="checkbox" checked={Boolean(c)} onChange={() => toggle(e.id)} />
                <span>{tr(e.name)}</span>
                <em>{tr(e.group)}</em>
              </label>
              {c && (
                <div className="ex-sets">
                  <input type="number" min={1} max={10} value={c.sets} onChange={(ev) => patch(e.id, { sets: Math.max(1, +ev.target.value || 1) })} aria-label={tr('Set')} />
                  <span>×</span>
                  <input value={c.reps} onChange={(ev) => patch(e.id, { reps: ev.target.value })} aria-label={tr('Reps')} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Modal>
  )
}
