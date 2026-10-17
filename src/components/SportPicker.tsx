import type { TrainSport } from '../types'
import { TRAIN_SPORTS, planTypeOf } from '../lib/trainSports'
import { tr } from '../i18n/core'
import { SportIcon } from './SportIcon'

// Sportkort att välja bland innan planen skapas. Med längdskidor blir det skidplanen, annars Styrka & kondition.
export function SportPicker({ value, onChange }: { value: TrainSport[]; onChange: (v: TrainSport[]) => void }) {
  const toggle = (id: TrainSport) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id])
  const type = planTypeOf(value)
  return (
    <div className="sport-picker">
      <div className="sp-grid">
        {TRAIN_SPORTS.map((s) => {
          const on = value.includes(s.id)
          return (
            <button key={s.id} type="button" className={`sp-card${on ? ' on' : ''}`} aria-pressed={on} onClick={() => toggle(s.id)}>
              <span className="sp-icon">
                <SportIcon sport={s.icon} size={26} />
              </span>
              <b>{tr(s.label)}</b>
              <span>{tr(s.hint)}</span>
              <i className="sp-check" aria-hidden />
            </button>
          )
        })}
      </div>
      {value.length > 0 && (
        <p className="sp-result">
          <b>{tr(type === 'ski' ? 'Skidplan' : 'Styrka & kondition')}</b>{' '}
          {tr(
            type === 'ski'
              ? 'Planen bygger mot loppen i vinter, med löpning, cykel och styrka som en del av upplägget.'
              : 'En jämn plan utan lopp: dina valda sporter varvas i veckan och byggs upp i fyraveckorscykler.',
          )}
        </p>
      )}
    </div>
  )
}
