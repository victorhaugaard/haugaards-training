import { useMemo, useState } from 'react'
import type { Goal, Person, Session } from '../types'
import { TESTS, bestOf, fmtResult, goalLabel, goalProgress, parseResult, resultsByTest, testById, unitHint, type ResultPoint, type TestDef } from '../lib/tests'
import { dayMonth, today } from '../lib/dates'
import { tr } from '../i18n/core'
import { ExerciseAnim } from './ExerciseAnim'
import { Modal } from './Modal'

const daysLeft = (date: string) => Math.round((new Date(date + 'T12:00').getTime() - new Date(today() + 'T12:00').getTime()) / 86400000)

// Personens mål med nedräkning och, om det mäts med ett test, hur långt man kommit
export function GoalCard({ goal, sessions, onEdit }: { goal?: Goal; sessions: Session[]; onEdit: () => void }) {
  if (!goal)
    return (
      <section className="ov-card goal-card empty">
        <div>
          <div className="stat-label">{tr('Mål')}</div>
          <p className="muted small">{tr('Sätt ett mål, så visar vi hur nära du är och planen räknar ner mot det.')}</p>
        </div>
        <button className="btn small primary" onClick={onEdit}>
          {tr('Sätt ett mål')}
        </button>
      </section>
    )
  const test = goal.testId ? testById(goal.testId) : undefined
  const list = test ? (resultsByTest(sessions).get(test.id) ?? []) : []
  const latest = list[list.length - 1]
  const pct = test && goal.target ? goalProgress(test, list, goal.target) : 0
  const left = goal.date ? daysLeft(goal.date) : undefined
  return (
    <section className="ov-card goal-card">
      <div className="goal-head">
        <div>
          <div className="stat-label">{tr('Mål')}</div>
          <div className="goal-title">{goalLabel(goal, tr)}</div>
          {left !== undefined && (
            <div className="muted small">
              {left > 0 ? tr('{n} dagar kvar · {date}', { n: left, date: dayMonth(goal.date!) }) : left === 0 ? tr('Idag!') : tr('Måldatum passerat {date}', { date: dayMonth(goal.date!) })}
            </div>
          )}
        </div>
        <button className="btn small" onClick={onEdit}>
          {tr('Ändra')}
        </button>
      </div>
      {test && goal.target && (
        <div className="goal-progress">
          <div className="goal-bar">
            <i style={{ width: `${Math.round(pct * 100)}%` }} />
          </div>
          <span>
            {latest ? tr('Senast {v} · mål {t}', { v: fmtResult(test, latest.value), t: fmtResult(test, goal.target) }) : tr('Inget testresultat än · mål {t}', { t: fmtResult(test, goal.target) })}
            {pct >= 1 && ` · ${tr('Uppnått!')}`}
          </span>
        </div>
      )}
    </section>
  )
}

export function GoalModal({ goal, onSave, onClose, children }: { goal?: Goal; onSave: (g: Goal | undefined) => void; onClose: () => void; children: (value: Goal | undefined, set: (g: Goal | undefined) => void) => React.ReactNode }) {
  const [g, setG] = useState<Goal | undefined>(goal)
  return (
    <Modal
      title={tr('Träningsmål')}
      onClose={onClose}
      footer={
        <>
          {goal && (
            <button className="btn danger" onClick={() => (onSave(undefined), onClose())}>
              {tr('Ta bort målet')}
            </button>
          )}
          <span className="spacer" />
          <button className="btn primary" onClick={() => (onSave(g), onClose())}>
            {tr('Spara')}
          </button>
        </>
      }
    >
      {children(g, setG)}
    </Modal>
  )
}

// Linjediagram för ett test över tid, med mållinje
function TestChart({ test, list, target }: { test: TestDef; list: ResultPoint[]; target?: number }) {
  const W = 320
  const H = 120
  const pad = { l: 8, r: 8, t: 14, b: 18 }
  const values = list.map((p) => p.value).concat(target ? [target] : [])
  let lo = Math.min(...values)
  let hi = Math.max(...values)
  if (lo === hi) (lo -= 1), (hi += 1)
  const span = hi - lo
  lo -= span * 0.12
  hi += span * 0.12
  // Tider: lägre är bättre, så snabbare tider ritas högre upp
  const y = (v: number) => {
    const f = (v - lo) / (hi - lo)
    return pad.t + (test.better === 'lower' ? f : 1 - f) * (H - pad.t - pad.b)
  }
  const x = (i: number) => (list.length === 1 ? W / 2 : pad.l + (i / (list.length - 1)) * (W - pad.l - pad.r))
  const path = list.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ')
  const best = bestOf(test, list)
  return (
    <svg className="rv-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={tr('{name} över tid', { name: tr(test.name) })}>
      <line className="rv-base" x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} />
      {target && (
        <g className="rv-target">
          <line x1={pad.l} x2={W - pad.r} y1={y(target)} y2={y(target)} />
          <text x={W - pad.r} y={y(target) - 4} textAnchor="end">
            {tr('Mål')} {fmtResult(test, target)}
          </text>
        </g>
      )}
      {list.length > 1 && <path className="rv-line" d={path} />}
      {list.map((p, i) => (
        <g key={p.sessionId + i} className={'rv-pt' + (p === best && list.length > 1 ? ' best' : '')}>
          <circle className="rv-hit" cx={x(i)} cy={y(p.value)} r={12} />
          <circle className="rv-dot" cx={x(i)} cy={y(p.value)} r={4.5} />
          <title>{`${dayMonth(p.date)}: ${fmtResult(test, p.value)}`}</title>
        </g>
      ))}
      <text className="rv-axis" x={pad.l} y={H - 4}>
        {dayMonth(list[0].date)}
      </text>
      {list.length > 1 && (
        <text className="rv-axis" x={W - pad.r} y={H - 4} textAnchor="end">
          {dayMonth(list[list.length - 1].date)}
        </text>
      )}
    </svg>
  )
}

interface Props {
  person: Person
  sessions: Session[]
  onEditGoal: () => void
  onAddResult: (testId: string, value: number, date: string) => void
  onOpenSession: (id: string) => void
}

// Fliken Resultat: mål, och utvecklingen i varje test man gjort
export function ResultsView({ person, sessions, onEditGoal, onAddResult, onOpenSession }: Props) {
  const byTest = useMemo(() => resultsByTest(sessions), [sessions])
  const [adding, setAdding] = useState(false)
  const order = TESTS.filter((t) => byTest.has(t.id))
  const upcoming = sessions.filter((s) => s.date >= today() && !s.done && s.cardId.startsWith('test-')).sort((a, b) => a.date.localeCompare(b.date))[0]

  return (
    <div className="results">
      <div className="pf-sec">
        <h3 className="pf-h">{tr('Resultat')}</h3>
        <button className="btn small" onClick={() => setAdding(true)}>
          + {tr('Logga resultat')}
        </button>
      </div>
      <GoalCard goal={person.goal} sessions={sessions} onEdit={onEditGoal} />
      {upcoming && (
        <button className="ov-card rv-next" onClick={() => onOpenSession(upcoming.id)}>
          <span className="stat-label">{tr('Nästa test')}</span>
          <b>{tr(upcoming.title)}</b>
          <span className="muted small">{dayMonth(upcoming.date)}</span>
        </button>
      )}
      {!order.length && (
        <p className="muted">
          {tr('Inga testresultat än. Testpassen dyker upp i planen enligt det intervall du valt, eller lägg till ett test från passbiblioteket under Tester. Skriv in resultatet i testpasset, så samlas det här.')}
        </p>
      )}
      <div className="rv-grid">
        {order.map((t) => {
          const list = byTest.get(t.id)!
          const latest = list[list.length - 1]
          const best = bestOf(t, list)!
          const first = list[0]
          const diff = latest.value - first.value
          const better = t.better === 'higher' ? diff > 0 : diff < 0
          const target = person.goal?.testId === t.id ? person.goal.target : undefined
          return (
            <section key={t.id} className="ov-card rv-card">
              <div className="rv-head">
                {t.exercise && <ExerciseAnim id={t.exercise} size={40} still />}
                <div>
                  <div className="rv-name">{tr(t.name)}</div>
                  <div className="rv-latest">
                    <b>{fmtResult(t, latest.value)}</b>
                    {list.length > 1 && diff !== 0 && (
                      <em className={better ? 'up' : 'down'}>
                        {better ? '▲' : '▼'} {fmtResult(t, Math.abs(diff))} {tr('sedan första')}
                      </em>
                    )}
                  </div>
                </div>
              </div>
              <TestChart test={t} list={list} target={target} />
              {list.length === 1 && <p className="rv-one">{tr('Gör testet igen, så syns utvecklingen här.')}</p>}
              <table className="rv-table">
                <tbody>
                  {[...list].reverse().map((p, i) => (
                    <tr key={p.sessionId + i} onClick={() => onOpenSession(p.sessionId)}>
                      <td>{dayMonth(p.date)}</td>
                      <td>
                        {fmtResult(t, p.value)}
                        {p === best && list.length > 1 && <span className="rv-pb">{tr('Personbästa')}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )
        })}
      </div>
      {adding && <AddResult onAdd={onAddResult} onClose={() => setAdding(false)} />}
    </div>
  )
}

// Logga ett resultat från ett test som gjorts utanför planen
function AddResult({ onAdd, onClose }: { onAdd: (testId: string, value: number, date: string) => void; onClose: () => void }) {
  const [id, setId] = useState(TESTS[0].id)
  const [raw, setRaw] = useState('')
  const [date, setDate] = useState(today())
  const t = testById(id)!
  const v = parseResult(t, raw)
  return (
    <Modal
      title={tr('Logga resultat')}
      onClose={onClose}
      footer={
        <>
          <span className="spacer" />
          <button className="btn primary" disabled={!v} onClick={() => (onAdd(id, v!, date), onClose())}>
            {tr('Spara')}
          </button>
        </>
      }
    >
      <label className="field">
        <span>{tr('Test')}</span>
        <select value={id} onChange={(e) => (setId(e.target.value), setRaw(''))}>
          {TESTS.map((x) => (
            <option key={x.id} value={x.id}>
              {tr(x.name)}
            </option>
          ))}
        </select>
        <span className="hint">{tr(t.how)}</span>
      </label>
      <div className="row">
        <label className="field">
          <span>
            {tr('Resultat')} ({tr(unitHint(t))})
          </span>
          <input inputMode={t.unit === 'time' ? 'text' : 'decimal'} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder={t.unit === 'time' ? '22:30' : ''} autoFocus />
        </label>
        <label className="field">
          <span>{tr('Datum')}</span>
          <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
        </label>
      </div>
    </Modal>
  )
}

// Skriv in resultat i ett testpass
export function TestResultsForm({ tests, results, onChange }: { tests: string[]; results?: Record<string, number>; onChange: (r: Record<string, number>) => void }) {
  const [raw, setRaw] = useState<Record<string, string>>(() =>
    Object.fromEntries(tests.map((id) => [id, results?.[id] ? fmtResult(testById(id)!, results[id]).replace(/ (kg|m|W)$/, '') : ''])),
  )
  return (
    <div className="tr-form">
      <div className="stat-label">{tr('Dina resultat')}</div>
      {tests.map((id) => {
        const t = testById(id)
        if (!t) return null
        return (
          <label key={id} className="tr-row">
            {t.exercise && <ExerciseAnim id={t.exercise} size={40} />}
            <span className="tr-text">
              <b>{tr(t.name)}</b>
              <em>{tr(t.how)}</em>
            </span>
            <input
              inputMode={t.unit === 'time' ? 'text' : 'decimal'}
              placeholder={tr(unitHint(t))}
              value={raw[id] ?? ''}
              onChange={(e) => {
                setRaw((r) => ({ ...r, [id]: e.target.value }))
                const v = parseResult(t, e.target.value)
                const next = { ...(results ?? {}) }
                if (v) next[id] = v
                else delete next[id]
                onChange(next)
              }}
            />
          </label>
        )
      })}
    </div>
  )
}
