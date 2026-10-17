import { useState } from 'react'
import type { RunMode, SportFocus, TrainSport } from '../types'
import { today } from '../lib/dates'
import { PLAN_END } from '../lib/generator'
import { FITNESS_DEFAULT_HOURS } from '../lib/fitnessGenerator'
import { planTypeOf } from '../lib/trainSports'
import { GenerateForm, sportsPatch, type GenValue } from './GenerateForm'
import { Modal } from './Modal'
import { SportPicker } from './SportPicker'
import { tr } from '../i18n/core'

export type GenerateChoice = GenValue

interface Props {
  name: string
  initialRunMode: RunMode
  initialRestDay: number
  initialFocus: SportFocus
  initialSports: TrainSport[]
  onGenerate: (o: GenerateChoice) => void
  onClose: () => void
}

export function GenerateModal({ name, initialRunMode, initialRestDay, initialFocus, initialSports, onGenerate, onClose }: Props) {
  const [step, setStep] = useState<'sports' | 'plan'>('sports')
  // Från idag som förval: allt före det och redan genomförda pass rör vi inte
  const [v, setV] = useState<GenValue>({
    start: today(),
    end: PLAN_END,
    hours: planTypeOf(initialSports) === 'fitness' ? FITNESS_DEFAULT_HOURS : 12,
    runMode: initialRunMode,
    restDay: initialRestDay,
    focus: initialFocus,
    sports: initialSports,
    fresh: false,
  })

  return (
    <Modal
      wide
      title={tr('Autogenerera plan · {name}', { name })}
      onClose={onClose}
      footer={
        <>
          <span className="step-dots" aria-hidden>
            <i className={step === 'sports' ? 'on' : ''} />
            <i className={step === 'plan' ? 'on' : ''} />
          </span>
          <span className="spacer" />
          {step === 'sports' ? (
            <button className="btn primary" disabled={!v.sports.length} onClick={() => setStep('plan')}>
              {tr('Nästa')}
            </button>
          ) : (
            <>
              <button className="btn" onClick={() => setStep('sports')}>
                {tr('Tillbaka')}
              </button>
              <button className="btn primary" onClick={() => (onGenerate(v), onClose())}>
                {tr('Generera')}
              </button>
            </>
          )}
        </>
      }
    >
      {step === 'sports' ? (
        <>
          <p className="muted">{tr('Vilka sporter håller du på med? Välj en eller flera.')}</p>
          <SportPicker value={v.sports} onChange={(sports) => setV((x) => ({ ...x, ...sportsPatch(x, sports) }))} />
        </>
      ) : (
        <GenerateForm value={v} onChange={(p) => setV((x) => ({ ...x, ...p }))} showFresh />
      )}
    </Modal>
  )
}
