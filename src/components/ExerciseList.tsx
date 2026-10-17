import { useMemo, useState } from 'react'
import type { Exercise } from '../types'
import { EXERCISES, EX_GROUPS, exerciseById, exerciseName, newExercise, type ExGroup } from '../lib/exercises'
import { tr } from '../i18n/core'
import { ExerciseAnim } from './ExerciseAnim'

const fmtRest = (s?: number) => (s === undefined ? '' : s === 0 ? tr('ingen vila') : s < 120 ? tr('vila {n} s', { n: s }) : tr('vila {n} min', { n: +(s / 60).toFixed(1) }))

// Övningarna i ett pass, för att köra passet: animation, set × reps, vila och avbockning per set
export function ExerciseRunner({ items, onChange }: { items: Exercise[]; onChange?: (items: Exercise[]) => void }) {
  const [open, setOpen] = useState<number | null>(null)
  const total = items.reduce((a, e) => a + e.sets, 0)
  const done = items.reduce((a, e) => a + Math.min(e.sets, e.done ?? 0), 0)
  const tick = (i: number, n: number) => onChange?.(items.map((e, j) => (j === i ? { ...e, done: (e.done ?? 0) === n ? n - 1 : n } : e)))

  return (
    <div className="xr">
      <div className="xr-head">
        <span className="stat-label">{tr('Övningar')}</span>
        {onChange && total > 0 && (
          <span className="xr-progress">
            <i style={{ width: `${(done / total) * 100}%` }} />
            <b>{tr('{a} av {b} set', { a: done, b: total })}</b>
          </span>
        )}
      </div>
      <ol className="xr-list">
        {items.map((e, i) => {
          const def = exerciseById(e.id)
          const isOpen = open === i
          const allDone = (e.done ?? 0) >= e.sets
          return (
            <li key={i} className={'xr-row' + (isOpen ? ' open' : '') + (allDone ? ' done' : '')}>
              <button className="xr-main" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}>
                <span className="xr-anim">
                  <ExerciseAnim id={e.id} size={isOpen ? 132 : 52} />
                </span>
                <span className="xr-text">
                  <b>{exerciseName(e, tr)}</b>
                  <span>
                    {e.sets} × {tr(e.reps)}
                    {e.rest !== undefined && ` · ${fmtRest(e.rest)}`}
                  </span>
                  {isOpen && def && <em>{tr(def.cue)}</em>}
                </span>
              </button>
              {onChange && (
                <span className="xr-sets" role="group" aria-label={tr('Set')}>
                  {Array.from({ length: Math.min(e.sets, 12) }, (_, k) => (
                    <button
                      key={k}
                      className={k < (e.done ?? 0) ? 'on' : ''}
                      onClick={() => tick(i, k + 1)}
                      aria-label={tr('Set {n}', { n: k + 1 })}
                      aria-pressed={k < (e.done ?? 0)}
                    >
                      {k + 1}
                    </button>
                  ))}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

const RESTS = [0, 20, 30, 45, 60, 75, 90, 120, 150, 180]

// Redigera en övningslista: ändra set, reps och vila, flytta och ta bort, och lägg till via +
export function ExerciseEditor({ items, onChange, homeOnly, openPicker }: { items: Exercise[]; onChange: (items: Exercise[]) => void; homeOnly?: boolean; openPicker?: boolean }) {
  const [picking, setPicking] = useState(Boolean(openPicker) && items.length === 0)
  const patch = (i: number, p: Partial<Exercise>) => onChange(items.map((e, j) => (j === i ? { ...e, ...p } : e)))
  const move = (i: number, d: -1 | 1) => {
    const next = [...items]
    ;[next[i], next[i + d]] = [next[i + d], next[i]]
    onChange(next)
  }
  return (
    <div className="xe">
      {items.length > 0 && (
        <ol className="xe-list">
          {items.map((e, i) => (
            <li key={i} className="xe-row">
              <ExerciseAnim id={e.id} size={40} />
              <div className="xe-main">
                {e.name !== undefined ? (
                  <input className="xe-name" value={e.name} onChange={(ev) => patch(i, { name: ev.target.value })} aria-label={tr('Namn')} />
                ) : (
                  <b>{exerciseName(e, tr)}</b>
                )}
                <div className="xe-fields">
                  <input type="number" min={1} max={20} value={e.sets} onChange={(ev) => patch(i, { sets: Math.max(1, Math.min(20, +ev.target.value || 1)) })} aria-label={tr('Set')} />
                  <span>×</span>
                  <input className="xe-reps" value={e.reps} onChange={(ev) => patch(i, { reps: ev.target.value })} aria-label={tr('Reps')} />
                  <select value={e.rest ?? 90} onChange={(ev) => patch(i, { rest: +ev.target.value })} aria-label={tr('Vila')}>
                    {RESTS.map((r) => (
                      <option key={r} value={r}>
                        {fmtRest(r)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="xe-tools">
                <button className="icon-btn" disabled={i === 0} onClick={() => move(i, -1)} aria-label={tr('Flytta upp')}>
                  ↑
                </button>
                <button className="icon-btn" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label={tr('Flytta ner')}>
                  ↓
                </button>
                <button className="icon-btn" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label={tr('Ta bort')}>
                  ×
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
      <button className={'xe-add' + (picking ? ' on' : '')} onClick={() => setPicking((p) => !p)} aria-expanded={picking}>
        <span>+</span> {tr(picking ? 'Stäng övningslistan' : 'Lägg till övning')}
      </button>
      {picking && <ExercisePicker homeOnly={homeOnly} chosen={items} onAdd={(e) => onChange([...items, e])} />}
    </div>
  )
}

// Rullgardinen med alla övningar per kategori, med animationer
function ExercisePicker({ onAdd, chosen, homeOnly }: { onAdd: (e: Exercise) => void; chosen: Exercise[]; homeOnly?: boolean }) {
  const [group, setGroup] = useState<ExGroup | 'all'>('all')
  const [q, setQ] = useState('')
  const query = q.trim().toLowerCase()
  const shown = useMemo(
    () => EXERCISES.filter((e) => (!homeOnly || e.home) && (group === 'all' || e.group === group) && (!query || tr(e.name).toLowerCase().includes(query) || e.name.toLowerCase().includes(query))),
    [group, query, homeOnly],
  )
  const groups = group === 'all' ? EX_GROUPS.filter((g) => shown.some((e) => e.group === g)) : [group]
  const count = (id: string) => chosen.filter((c) => c.id === id).length

  return (
    <div className="xp">
      <input className="xp-search" placeholder={tr('Sök övning')} value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="pf-filter">
        <button className={group === 'all' ? 'on' : ''} onClick={() => setGroup('all')}>
          {tr('Alla')}
        </button>
        {EX_GROUPS.map((g) => (
          <button key={g} className={group === g ? 'on' : ''} onClick={() => setGroup(g)}>
            {tr(g)}
          </button>
        ))}
      </div>
      <div className="xp-body">
        {groups.map((g) => (
          <section key={g}>
            {group === 'all' && <h5>{tr(g)}</h5>}
            <div className="xp-grid">
              {shown
                .filter((e) => e.group === g)
                .map((e) => (
                  <button key={e.id} className={'xp-tile' + (count(e.id) ? ' on' : '')} onClick={() => onAdd(newExercise(e.id))} title={tr(e.cue)}>
                    <ExerciseAnim id={e.id} size={64} />
                    <span>{tr(e.name)}</span>
                    {count(e.id) > 0 && <i>{count(e.id)}</i>}
                  </button>
                ))}
            </div>
          </section>
        ))}
        {query && (
          <button className="xp-custom" onClick={() => (onAdd({ id: 'custom', name: q.trim(), sets: 3, reps: '10', rest: 90 }), setQ(''))}>
            + {tr('Egen övning: {name}', { name: q.trim() })}
          </button>
        )}
        {!shown.length && !query && <p className="muted small">{tr('Inga övningar här.')}</p>}
      </div>
    </div>
  )
}
