import { useState } from 'react'
import type { Goal, TrainSport } from '../types'
import { TESTS, fmtResult, parseResult, testById, unitHint } from '../lib/tests'
import { tr } from '../i18n/core'

// Färdiga förslag på mätbara mål, per sport
const SUGGESTIONS: { sports: TrainSport[]; text: string; testId: string; target: number }[] = [
  { sports: ['strength', 'crossfit'], text: 'Marklyft 100 kg', testId: 'deadlift-3rm', target: 100 },
  { sports: ['strength', 'crossfit'], text: '10 chins i rad', testId: 'pullups-max', target: 10 },
  { sports: ['strength'], text: 'Bänkpress 60 kg', testId: 'bench-3rm', target: 60 },
  { sports: ['run', 'hiit'], text: '5 km under 25 minuter', testId: 'run-5k', target: 1500 },
  { sports: ['hiit', 'crossfit'], text: '2 km rodd under 8 minuter', testId: 'row-2k', target: 480 },
  { sports: ['crossfit'], text: '12 varv på benchmark-WOD:en', testId: 'wod-amrap20', target: 12 },
  { sports: ['bike'], text: '250 watt på 20 minuter', testId: 'ftp-20', target: 250 },
]

// Valfritt träningsmål: fritext, eller kopplat till ett test med målvärde, och ett datum
export function GoalField({ value, sports, onChange }: { value?: Goal; sports: TrainSport[]; onChange: (g: Goal | undefined) => void }) {
  const test = value?.testId ? testById(value.testId) : undefined
  const [raw, setRaw] = useState(() => (test && value?.target ? fmtResult(test, value.target).replace(/ (kg|m|W)$/, '') : ''))
  const set = (p: Partial<Goal>) => {
    const g: Goal = { text: '', ...value, ...p }
    const clean: Goal = { text: g.text, ...(g.date ? { date: g.date } : {}), ...(g.testId ? { testId: g.testId } : {}), ...(g.testId && g.target ? { target: g.target } : {}) }
    onChange(clean.text.trim() || clean.testId ? clean : undefined)
  }
  const relevant = (ids: TrainSport[]) => ids.some((s) => sports.includes(s))
  const tests = [...TESTS].sort((a, b) => Number(relevant(b.sports)) - Number(relevant(a.sports)))
  const ideas = SUGGESTIONS.filter((x) => relevant(x.sports)).slice(0, 4)

  return (
    <div className="field goal-field">
      <span>{tr('Träningsmål (valfritt)')}</span>
      <input value={value?.text ?? ''} onChange={(e) => set({ text: e.target.value })} placeholder={tr('Vad vill du uppnå? T.ex. springa 5 km under 25 min')} />
      {ideas.length > 0 && !value?.text && (
        <div className="pf-filter">
          {ideas.map((x) => (
            <button
              key={x.text}
              onClick={() => {
                const t = testById(x.testId)!
                setRaw(fmtResult(t, x.target).replace(/ (kg|m|W)$/, ''))
                set({ text: tr(x.text), testId: x.testId, target: x.target })
              }}
            >
              + {tr(x.text)}
            </button>
          ))}
        </div>
      )}
      <div className="goal-row">
        <label>
          <em>{tr('Mät med test')}</em>
          <select value={value?.testId ?? ''} onChange={(e) => (setRaw(''), set({ testId: e.target.value || undefined, target: undefined }))}>
            <option value="">{tr('Inget test')}</option>
            {tests.map((t) => (
              <option key={t.id} value={t.id}>
                {tr(t.name)}
              </option>
            ))}
          </select>
        </label>
        {test && (
          <label>
            <em>
              {tr('Målvärde')} ({tr(unitHint(test))})
            </em>
            <input
              inputMode={test.unit === 'time' ? 'text' : 'decimal'}
              value={raw}
              placeholder={test.unit === 'time' ? '25:00' : ''}
              onChange={(e) => (setRaw(e.target.value), set({ target: parseResult(test, e.target.value) }))}
            />
          </label>
        )}
        <label>
          <em>{tr('Senast (valfritt)')}</em>
          <input type="date" value={value?.date ?? ''} onChange={(e) => set({ date: e.target.value || undefined })} />
        </label>
      </div>
    </div>
  )
}
