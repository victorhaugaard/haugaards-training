import { useState } from 'react'
import type { FitnessPrefs, Goal, Person, RunMode, SportFocus, TrainSport } from '../types'
import { DEFAULT_PREFS } from '../lib/fitnessGenerator'
import { startOfWeek, today } from '../lib/dates'
import { PLAN_END } from '../lib/generator'
import { planTypeOf } from '../lib/trainSports'
import { GenerateForm, sportsPatch, type GenValue } from './GenerateForm'
import { SportPicker } from './SportPicker'
import { Modal } from './Modal'
import { Segmented } from './Segmented'
import { tr } from '../i18n/core'

export type NewPerson = {
  name: string
  mode: 'copy' | 'generate' | 'empty'
  basedOn: string
  scale: number
  hours: number
  runMode: RunMode
  restDay: number
  focus: SportFocus
  sports: TrainSport[]
  fitness: FitnessPrefs
  goal?: Goal
  start: string
  end: string
}

interface Props {
  people: Person[]
  activeId: string
  initialName?: string
  onboarding?: boolean // ny familjemedlem som loggar in för första gången
  onCreate: (p: NewPerson) => void
  onClose: () => void
}

export function PersonModal({ people, activeId, initialName, onboarding, onCreate, onClose }: Props) {
  const [step, setStep] = useState<'sports' | 'plan'>('sports')
  const [name, setName] = useState(initialName ?? (onboarding ? '' : 'Øivind'))
  const [mode, setMode] = useState<NewPerson['mode']>(initialName || onboarding ? 'generate' : 'copy')
  const [basedOn, setBasedOn] = useState(activeId)
  const [scale, setScale] = useState(80)
  // Skonsamt som förval för nya personer
  const [gen, setGen] = useState<GenValue>({ start: startOfWeek(today()), end: PLAN_END, hours: 10, runMode: 'none', restDay: 0, focus: 'balanced', sports: [], fitness: DEFAULT_PREFS, fresh: false })
  const fitness = planTypeOf(gen.sports) === 'fitness'
  const effMode = fitness && mode === 'copy' ? 'generate' : mode // en skidplan går inte att kopiera till en annan plan-typ

  return (
    <Modal
      wide={step === 'sports' || effMode === 'generate'}
      title={tr(onboarding ? 'Välkommen! Skapa din plan' : 'Lägg till person')}
      onClose={onClose}
      footer={
        <>
          <span className="step-dots" aria-hidden>
            <i className={step === 'sports' ? 'on' : ''} />
            <i className={step === 'plan' ? 'on' : ''} />
          </span>
          <span className="spacer" />
          {step === 'sports' ? (
            <button className="btn primary" disabled={!name.trim() || !gen.sports.length} onClick={() => setStep('plan')}>
              {tr('Nästa')}
            </button>
          ) : (
            <>
              <button className="btn" onClick={() => setStep('sports')}>
                {tr('Tillbaka')}
              </button>
              <button
                className="btn primary"
                onClick={() =>
                  (onCreate({ name: name.trim(), mode: effMode, basedOn, scale: scale / 100, hours: gen.hours, runMode: gen.runMode, restDay: gen.restDay, focus: gen.focus, sports: gen.sports, fitness: gen.fitness, ...(gen.goal ? { goal: gen.goal } : {}), start: gen.start, end: gen.end }), onClose())
                }
              >
                {tr('Skapa')}
              </button>
            </>
          )}
        </>
      }
    >
      {step === 'sports' && (
        <>
          <label className="field">
            <span>{tr('Namn')}</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </label>
          <div className="field">
            <span>{tr('Vilka sporter håller du på med? Välj en eller flera.')}</span>
            <SportPicker value={gen.sports} onChange={(sports) => setGen((g) => ({ ...g, ...sportsPatch(g, sports, 10) }))} />
          </div>
        </>
      )}
      {step === 'plan' && (
      <div className="field">
        <span>{tr('Startplan')}</span>
        <Segmented
          value={effMode}
          onChange={setMode}
          options={[
            ...(fitness ? [] : ([['copy', tr('Baserad på annan')]] as [NewPerson['mode'], string][])),
            ['generate', tr('Autogenerera')],
            ['empty', tr('Tom')],
          ]}
        />
      </div>
      )}
      {step === 'plan' && effMode === 'copy' && (
        <>
          <div className="field">
            <span>{tr('Löpning')}</span>
            <Segmented
              value={gen.runMode}
              onChange={(runMode) => setGen((g) => ({ ...g, runMode }))}
              options={[
                ['none', tr('Ingen (skonsamt)')],
                ['little', tr('Lite då och då')],
              ]}
            />
          </div>
          <div className="field">
            <span>{tr('Fokus')}</span>
            <Segmented
              value={gen.focus}
              onChange={(focus) => setGen((g) => ({ ...g, focus }))}
              options={[
                ['balanced', tr('Blandat')],
                ['ski', tr('Ren längdskidåkning')],
              ]}
            />
          </div>
          <label className="field">
            <span>{tr('Baserad på')}</span>
            <select value={basedOn} onChange={(e) => setBasedOn(e.target.value)}>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{tr('Volym relativt förlagan: {n}%', { n: scale })}</span>
            <input type="range" min={40} max={120} step={5} value={scale} onChange={(e) => setScale(+e.target.value)} />
          </label>
        </>
      )}
      {step === 'plan' && effMode === 'generate' && <GenerateForm value={gen} onChange={(p) => setGen((g) => ({ ...g, ...p }))} />}
    </Modal>
  )
}
