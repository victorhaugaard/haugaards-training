import { useMemo } from 'react'
import type { Aim, Equipment, FitnessPrefs, Goal, Level, RunMode, SportFocus, TrainSport } from '../types'
import { addDays, dayMonth } from '../lib/dates'
import { buildPlan } from '../lib/buildPlan'
import { planTypeOf } from '../lib/trainSports'
import { DEFAULT_PREFS, FITNESS_DEFAULT_HOURS, prefsHours } from '../lib/fitnessGenerator'
import { GoalField } from './GoalField'
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
  focus: SportFocus
  sports: TrainSport[]
  fitness: FitnessPrefs
  goal?: Goal
  fresh: boolean // radera hela den gamla planen först
}

// Byter sporter och, om plan-typen ändras, ett rimligt förval för timmar
export const sportsPatch = (v: GenValue, sports: TrainSport[], skiHours = 12): Partial<GenValue> =>
  planTypeOf(sports) === planTypeOf(v.sports) ? { sports } : { sports, hours: planTypeOf(sports) === 'fitness' ? prefsHours(v.fitness ?? DEFAULT_PREFS) || FITNESS_DEFAULT_HOURS : skiHours }

interface Props {
  value: GenValue
  onChange: (patch: Partial<GenValue>) => void
  showFresh?: boolean
}

// Samma autogenerera-skärm används för ny plan och när man lägger till en person:
// datum, timmar, löpning, vilodag och en förklaring av planen som uppdateras direkt.
export function GenerateForm({ value: v, onChange, showFresh }: Props) {
  const fitness = planTypeOf(v.sports) === 'fitness'
  const preview = useMemo(() => buildPlan('preview', v), [v.start, v.end, v.hours, v.runMode, v.restDay, v.focus, v.sports, v.fitness]) // eslint-disable-line react-hooks/exhaustive-deps
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
      {fitness ? (
        <FitnessFields value={v.fitness} onChange={(p) => onChange({ fitness: { ...v.fitness, ...p }, hours: prefsHours({ ...v.fitness, ...p }) })} />
      ) : (
        <label className="field">
          <span>{tr('Timmar per vecka i snitt: {h} h', { h: v.hours })}</span>
          <input type="range" min={6} max={15} step={0.5} value={v.hours} onChange={(e) => onChange({ hours: +e.target.value })} />
        </label>
      )}
      <GoalField value={v.goal} sports={v.sports} onChange={(goal) => onChange({ goal })} />
      {!fitness && (
        <>
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
          <div className="field">
            <span>{tr('Fokus')}</span>
            <Segmented
              value={v.focus}
              onChange={(focus) => onChange({ focus })}
              options={[
                ['balanced', tr('Blandat')],
                ['ski', tr('Ren längdskidåkning')],
              ]}
            />
            <span className="hint">
              {tr(
                v.focus === 'ski'
                  ? 'Cykel och Zwift/Tacx byts mot rullskidor där det går. Stakmaskinen är redan skidspecifik.'
                  : 'Blandar cykel, rullskidor, stakmaskin och Zwift/Tacx, som idag.',
              )}
            </span>
          </div>
        </>
      )}
      <RestDayField value={v.restDay} onChange={(restDay) => onChange({ restDay })} />
      {showFresh && (
        <label className="inline">
          <input type="checkbox" checked={v.fresh} onChange={(e) => onChange({ fresh: e.target.checked })} /> {tr('Börja om: radera hela den gamla planen först')}
        </label>
      )}
      <PlanGuide sessions={preview} runMode={v.runMode} restDay={v.restDay} fitness={fitness} />
    </>
  )
}

const opts = <T extends string | number>(list: [T, string][]) => list.map(([k, l]) => [k, tr(l)] as [T, string])

// Val för Styrka & kondition: dagar, passlängd, nivå, fokus, utrustning och hur ofta testerna kommer
function FitnessFields({ value: p, onChange }: { value: FitnessPrefs; onChange: (p: Partial<FitnessPrefs>) => void }) {
  return (
    <>
      <div className="row">
        <div className="field">
          <span>{tr('Träningsdagar per vecka')}</span>
          <Segmented value={String(p.days)} onChange={(d) => onChange({ days: +d })} options={['2', '3', '4', '5', '6'].map((d) => [d, d] as [string, string])} />
        </div>
        <div className="field">
          <span>{tr('Passlängd')}</span>
          <Segmented value={String(p.length)} onChange={(l) => onChange({ length: +l })} options={['30', '45', '60', '75'].map((l) => [l, `${l} min`] as [string, string])} />
        </div>
      </div>
      <div className="field">
        <span>{tr('Nivå')}</span>
        <Segmented<Level>
          value={p.level}
          onChange={(level) => onChange({ level })}
          options={opts<Level>([
            ['beginner', 'Nybörjare'],
            ['intermediate', 'Van'],
            ['advanced', 'Avancerad'],
          ])}
        />
        <span className="hint">
          {tr(
            p.level === 'beginner'
              ? 'Färre set och högst två hårda pass i veckan, så att kroppen hinner vänja sig.'
              : p.level === 'advanced'
                ? 'Fler set på de tunga övningarna och upp till tre hårda pass i veckan.'
                : 'Vanlig volym och upp till tre hårda pass i veckan.',
          )}
        </span>
      </div>
      <div className="field">
        <span>{tr('Fokus')}</span>
        <Segmented<Aim>
          value={p.aim}
          onChange={(aim) => onChange({ aim })}
          options={opts<Aim>([
            ['strength', 'Bli starkare'],
            ['muscle', 'Bygga muskler'],
            ['conditioning', 'Kondition'],
            ['general', 'Allmän form'],
          ])}
        />
        <span className="hint">
          {tr(
            p.aim === 'strength'
              ? 'Tunga övningar med 3–5 reps och 3 minuters vila.'
              : p.aim === 'muscle'
                ? '8–12 reps på de tunga övningarna och 12–15 på de lättare, kortare vila.'
                : p.aim === 'conditioning'
                  ? 'Kortare vila mellan seten så att pulsen hålls uppe.'
                  : 'En balanserad mix av styrka och kondition.',
          )}
        </span>
      </div>
      <div className="row">
        <div className="field">
          <span>{tr('Utrustning')}</span>
          <Segmented<Equipment>
            value={p.equipment}
            onChange={(equipment) => onChange({ equipment })}
            options={opts<Equipment>([
              ['gym', 'Gym'],
              ['home', 'Hemma'],
              ['both', 'Båda'],
            ])}
          />
        </div>
        <label className="field">
          <span>{tr('Tester')}</span>
          <select value={p.testEvery} onChange={(e) => onChange({ testEvery: +e.target.value })}>
            <option value={4}>{tr('Varje månad')}</option>
            <option value={8}>{tr('Varannan månad')}</option>
            <option value={12}>{tr('Var tredje månad')}</option>
            <option value={0}>{tr('Inga tester')}</option>
          </select>
        </label>
      </div>
      <p className="muted small">{tr('Ungefär {h} h i veckan. Testveckan byter ut ett pass per sport mot ett test, och resultaten samlas under Resultat.', { h: prefsHours(p) })}</p>
    </>
  )
}
