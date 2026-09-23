import { useMemo } from 'react'
import type { RunMode } from '../types'
import { addDays, dayMonth } from '../lib/dates'
import { generatePlan } from '../lib/generator'
import { tr } from '../i18n/core'
import { PlanGuide } from './PlanGuide'
import { RestDayField } from './RestDayField'
import { Segmented } from './Segmented'

export interface GenValue {
  start: string
  end: string
  hours: number
  runMode: RunMode
  restDay: number
  fresh: boolean // radera hela den gamla planen först
}

interface Props {
  value: GenValue
  onChange: (patch: Partial<GenValue>) => void
  showFresh?: boolean
}

// Samma autogenerera-skärm används för ny plan och när man lägger till en person:
// datum, timmar, löpning, vilodag och en förklaring av planen som uppdateras direkt.
export function GenerateForm({ value: v, onChange, showFresh }: Props) {
  const preview = useMemo(
    () => generatePlan({ personId: 'preview', start: v.start, end: v.end, hoursPerWeek: v.hours, runMode: v.runMode, restDay: v.restDay }),
    [v.start, v.end, v.hours, v.runMode, v.restDay],
  )
  return (
    <>
      <div className="row">
        <label className="field">
          <span>{tr('Från')}</span>
          <input type="date" value={v.start} onChange={(e) => e.target.value && onChange({ start: e.target.value })} />
        </label>
        <label className="field">
          <span>{tr('Till')}</span>
          <input type="date" value={v.end} min={addDays(v.start, 7)} onChange={(e) => e.target.value && onChange({ end: e.target.value })} />
        </label>
      </div>
      {showFresh && (
        <p className="muted small">
          {v.fresh
            ? tr('Hela den gamla planen raderas, även genomförda pass.')
            : tr('Pass innan {date} och redan genomförda pass ändras inte. Övriga pass ersätts.', { date: dayMonth(v.start) })}
        </p>
      )}
      <label className="field">
        <span>{tr('Timmar per vecka i snitt: {h} h', { h: v.hours })}</span>
        <input type="range" min={6} max={15} step={0.5} value={v.hours} onChange={(e) => onChange({ hours: +e.target.value })} />
      </label>
      <div className="field">
        <span>{tr('Löpning')}</span>
        <Segmented
          value={v.runMode}
          onChange={(runMode) => onChange({ runMode })}
          options={[
            ['none', tr('Ingen (skonsamt)')],
            ['little', tr('Lite då och då')],
          ]}
        />
      </div>
      <RestDayField value={v.restDay} onChange={(restDay) => onChange({ restDay })} />
      {showFresh && (
        <label className="inline">
          <input type="checkbox" checked={v.fresh} onChange={(e) => onChange({ fresh: e.target.checked })} /> {tr('Börja om: radera hela den gamla planen först')}
        </label>
      )}
      <PlanGuide sessions={preview} runMode={v.runMode} restDay={v.restDay} />
    </>
  )
}
