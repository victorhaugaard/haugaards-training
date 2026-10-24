import { dayMonth, today } from '../lib/dates'
import type { Goal, Session } from '../types'
import { bestOf, fmtResult, goalLabel, goalProgress, resultsByTest, testById } from '../lib/tests'
import type { Upcoming } from '../lib/races'
import { tr } from '../i18n/core'

export function RaceStrip({ races }: { races: Upcoming[] }) {
  if (!races.length) return null
  return (
    <section className="racestrip" aria-label={tr('Kommande tävlingar')}>
      {races.map((r) => (
        <div key={r.id} className={'race' + (r.clash ? ' clash' : '')}>
          <div className="race-days">
            <b>{r.days}</b>
            <span>{tr(r.days === 0 ? 'idag' : r.days === 1 ? 'dag' : 'dagar')}</span>
          </div>
          <div className="race-name">{tr(r.title)}</div>
          <div className="race-date">
            {dayMonth(r.date)} {r.date.slice(0, 4)}
            {r.clash && <em title={tr('Två tävlingar samma dag')}> · {tr('samma dag')}</em>}
          </div>
        </div>
      ))}
    </section>
  )
}

const daysTo = (date: string) => Math.round((new Date(date + 'T12:00').getTime() - new Date(today() + 'T12:00').getTime()) / 86400000)

// Målkort i samma stil som tävlingarna: målet, nästa test och största förbättringen
export function GoalStrip({ goal, sessions, onGoal, onResults }: { goal?: Goal; sessions: Session[]; onGoal: () => void; onResults: () => void }) {
  const byTest = resultsByTest(sessions)
  const test = goal?.testId ? testById(goal.testId) : undefined
  const list = test ? (byTest.get(test.id) ?? []) : []
  const pct = test && goal?.target ? goalProgress(test, list, goal.target) : undefined
  const next = sessions.filter((s) => s.date >= today() && !s.done && s.cardId.startsWith('test-')).sort((a, b) => a.date.localeCompare(b.date))[0]
  // Testet med störst förbättring sedan första mätningen
  const gains = [...byTest]
    .map(([id, l]) => {
      const t = testById(id)!
      const diff = l[l.length - 1].value - l[0].value
      const rel = l.length > 1 && l[0].value ? (t.better === 'higher' ? diff : -diff) / l[0].value : 0
      return { t, l, rel, best: bestOf(t, l)! }
    })
    .filter((x) => x.rel > 0)
    .sort((a, b) => b.rel - a.rel)
  const top = gains[0]

  return (
    <section className="racestrip" aria-label={tr('Mål')}>
      {goal ? (
        <button className="race goal" onClick={onGoal}>
          <div className="race-days">
            {goal.date && daysTo(goal.date) >= 0 ? (
              <>
                <b>{daysTo(goal.date)}</b>
                <span>{tr(daysTo(goal.date) === 1 ? 'dag' : 'dagar')}</span>
              </>
            ) : pct !== undefined ? (
              <>
                <b>{Math.round(pct * 100)}</b>
                <span>%</span>
              </>
            ) : (
              <b>⚑</b>
            )}
          </div>
          <div className="race-name">{goalLabel(goal, tr)}</div>
          <div className="race-date">
            {test && goal.target
              ? list.length
                ? tr('Senast {v} · mål {t}', { v: fmtResult(test, list[list.length - 1].value), t: fmtResult(test, goal.target) })
                : tr('Inget testresultat än · mål {t}', { t: fmtResult(test, goal.target) })
              : goal.date
                ? `${dayMonth(goal.date)} ${goal.date.slice(0, 4)}`
                : tr('Ditt mål')}
          </div>
          {pct !== undefined && (
            <div className="goal-bar race-bar">
              <i style={{ width: `${Math.round(pct * 100)}%` }} />
            </div>
          )}
        </button>
      ) : (
        <button className="race goal empty" onClick={onGoal}>
          <div className="race-days">
            <b>⚑</b>
          </div>
          <div className="race-name">{tr('Sätt ett mål')}</div>
          <div className="race-date">{tr('Till exempel en vikt, en tid eller ett antal')}</div>
        </button>
      )}
      {next && (
        <button className="race" onClick={onResults}>
          <div className="race-days">
            <b>{daysTo(next.date)}</b>
            <span>{tr(daysTo(next.date) === 0 ? 'idag' : daysTo(next.date) === 1 ? 'dag' : 'dagar')}</span>
          </div>
          <div className="race-name">{tr(next.title)}</div>
          <div className="race-date">
            {tr('Nästa test')} · {dayMonth(next.date)}
          </div>
        </button>
      )}
      {top && (
        <button className="race" onClick={onResults}>
          <div className="race-days">
            <b>+{Math.round(top.rel * 100)}</b>
            <span>%</span>
          </div>
          <div className="race-name">{tr(top.t.name)}</div>
          <div className="race-date">{tr('Personbästa {v}', { v: fmtResult(top.t, top.best.value) })}</div>
        </button>
      )}
    </section>
  )
}
