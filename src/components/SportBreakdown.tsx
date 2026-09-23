import { useState } from 'react'
import type { DoneSession, Sport } from '../types'
import { sportColor, SPORT_ORDER } from '../lib/sportColors'
import { fmtHours } from '../lib/stats'
import { tr } from '../i18n/core'
import { Segmented } from './Segmented'
import { SportIcon } from './SportIcon'

type ViewMode = 'donut' | 'bar'

interface Row {
  sport: Sport
  minutes: number
  pct: number
  color: string
}

// Timmar per idrott bland avklarade pass, som ring eller stapeldiagram (samma färg per idrott i båda).
export function SportBreakdown({ sessions }: { sessions: DoneSession[] }) {
  const [view, setView] = useState<ViewMode>('donut')

  const bySport = new Map<Sport, number>()
  let total = 0
  for (const s of sessions) {
    if (s.sport === 'Vila') continue
    const m = s.minutes
    bySport.set(s.sport, (bySport.get(s.sport) ?? 0) + m)
    total += m
  }
  if (!total) return null

  const rows: Row[] = SPORT_ORDER.filter((sp) => bySport.get(sp))
    .map((sp) => ({ sport: sp, minutes: bySport.get(sp)!, pct: bySport.get(sp)! / total, color: sportColor(sp) }))
    .sort((a, b) => b.minutes - a.minutes)
  const max = Math.max(...rows.map((r) => r.minutes))

  return (
    <section className="ov-card sport-breakdown">
      <div className="sb-head">
        <div className="stat-label">{tr('Timmar per idrott')}</div>
        <Segmented
          value={view}
          onChange={setView}
          options={[
            ['donut', tr('Ring')],
            ['bar', tr('Stapel')],
          ]}
        />
      </div>

      {view === 'donut' ? <Donut rows={rows} total={total} /> : <Bars rows={rows} max={max} />}

      <ul className="sb-legend">
        {rows.map((r) => (
          <li key={r.sport} title={`${tr(r.sport)}: ${fmtHours(r.minutes)} (${Math.round(r.pct * 100)}%)`}>
            <i style={{ background: r.color }} />
            <SportIcon sport={r.sport} size={13} />
            <span>{tr(r.sport)}</span>
            <b>{fmtHours(r.minutes)}</b>
            <em>{Math.round(r.pct * 100)}%</em>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Donut({ rows, total }: { rows: Row[]; total: number }) {
  const size = 168
  const stroke = 22
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const gap = rows.length > 1 ? 3 : 0 // synlig lucka mellan varje segment
  let offset = 0
  return (
    <div className="sb-donut">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={tr('Timmar per idrott, ring')}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
        {rows.map((row) => {
          const len = Math.max(0, row.pct * c - gap)
          const el = (
            <circle
              key={row.sport}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={row.color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            >
              <title>{`${tr(row.sport)}: ${fmtHours(row.minutes)} (${Math.round(row.pct * 100)}%)`}</title>
            </circle>
          )
          offset += row.pct * c
          return el
        })}
      </svg>
      <div className="sb-donut-label">
        <b>{fmtHours(total)}</b>
        <span>{tr('totalt')}</span>
      </div>
    </div>
  )
}

function Bars({ rows, max }: { rows: Row[]; max: number }) {
  return (
    <div className="sb-bars">
      {rows.map((r) => (
        <div key={r.sport} className="sb-bar-row">
          <span className="sb-bar-label">{tr(r.sport)}</span>
          <div className="sb-bar-track">
            <i style={{ width: `${(r.minutes / max) * 100}%`, background: r.color }} />
          </div>
          <b>{fmtHours(r.minutes)}</b>
        </div>
      ))}
    </div>
  )
}
