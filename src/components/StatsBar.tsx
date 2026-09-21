import type { Session } from '../types'
import { useZones } from '../lib/zones'
import { computeStats, fmtDuration, fmtHours } from '../lib/stats'
import { Num } from './Num'

export function StatsBar({ sessions, label }: { sessions: Session[]; label: string }) {
  const { labels, names } = useZones()
  const st = computeStats(sessions)
  const zoneTotal = st.zones.reduce((a, b) => a + b, 0)
  const pct = st.total ? Math.round((st.done / st.total) * 100) : 0
  const max = Math.max(...st.zones, st.nonZone, 1)

  return (
    <section className="stats">
      <div className="stat-block">
        <div className="stat-label">{label}</div>
        <div className="stat-big">
          <Num value={st.total} format={fmtHours} />
        </div>
        <div className="stat-sub">{st.count} pass</div>
      </div>
      <div className="stat-block">
        <div className="stat-label">Genomfört</div>
        <div className="stat-big">
          <Num value={st.done} format={fmtHours} />
        </div>
        <div className="progress">
          <span style={{ width: `${pct}%` }} />
        </div>
        <div className="stat-sub">
          {st.doneCount}/{st.count} pass · {pct}%
        </div>
      </div>
      <div className="zones">
        {st.zones.map((z, i) => (
          <div className="zone-col" key={i} title={`${labels[i]} ${names[i]}: ${fmtDuration(z)}`}>
            <div className="zone-track">
              <span style={{ height: `${(z / max) * 100}%`, background: `var(--z${i + 1})` }} />
            </div>
            <div className="zone-name">{labels[i]}</div>
            <div className="zone-val">{z ? fmtHours(z) : '–'}</div>
            <div className="zone-pct">{zoneTotal ? Math.round((z / zoneTotal) * 100) + '%' : ''}</div>
          </div>
        ))}
        <div className="zone-col" title={`Styrka/rörlighet: ${fmtDuration(st.nonZone)}`}>
          <div className="zone-track">
            <span style={{ height: `${(st.nonZone / max) * 100}%`, background: 'var(--c-strength)' }} />
          </div>
          <div className="zone-name">Styrka</div>
          <div className="zone-val">{st.nonZone ? fmtHours(st.nonZone) : '–'}</div>
          <div className="zone-pct" />
        </div>
      </div>
    </section>
  )
}
