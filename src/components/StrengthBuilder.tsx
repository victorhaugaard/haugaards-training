import { useEffect, useState } from 'react'
import type { Exercise, Location } from '../types'
import { estimateMinutes, exerciseById } from '../lib/exercises'
import { ExerciseEditor } from './ExerciseList'
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
  const [date, setDate] = useState(initialDate)
  const [minutes, setMinutes] = useState(initial?.minutes ?? 45)
  const [manual, setManual] = useState(Boolean(initial?.minutes))

  // Tiden följer övningarna tills du ändrar den själv
  useEffect(() => {
    if (!manual && chosen.length) setMinutes(estimateMinutes(chosen))
  }, [chosen, manual])

  const changeLocation = (l: Location) => {
    setLocation(l)
    // hemma: ta bort övningar som kräver gym
    if (l === 'home') setChosen((cur) => cur.filter((c) => c.name !== undefined || exerciseById(c.id)?.home))
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

      <div className="field">
        <span>{tr('Övningar')}</span>
        <ExerciseEditor items={chosen} onChange={setChosen} homeOnly={location === 'home'} openPicker />
      </div>
    </Modal>
  )
}
