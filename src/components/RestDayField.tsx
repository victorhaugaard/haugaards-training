import { addDays } from '../lib/dates'
import { weekdayLong, cap } from '../lib/dates'
import { tr } from '../i18n/core'

// Vilodag: en veckodag eller ingen fast vilodag
export function RestDayField({ value, onChange }: { value: number; onChange: (d: number) => void }) {
  const monday = '2026-09-21'
  return (
    <label className="field">
      <span>{tr('Vilodag i veckan')}</span>
      <select value={value} onChange={(e) => onChange(+e.target.value)}>
        {Array.from({ length: 7 }, (_, i) => (
          <option key={i} value={i}>
            {cap(weekdayLong(addDays(monday, i)))}
            {i === 0 ? ` · ${tr('rekommenderas')}` : ''}
          </option>
        ))}
        <option value={-1}>{tr('Ingen fast vilodag')}</option>
      </select>
      <span className="hint">{tr('Vilodag är oftast dagen efter långpasset. Passen som annars ligger på vilodagen flyttas till måndagen.')}</span>
    </label>
  )
}
