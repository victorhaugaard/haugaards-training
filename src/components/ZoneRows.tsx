import type { Sport, Zones } from '../types'
import { fmtDuration } from '../lib/stats'
import { useZones } from '../lib/zones'
import { tr } from '../i18n/core'

// Minuter per zon som staplar, används på pass- och kortinformation
export function ZoneRows({ zones, nonZone, sport }: { zones: Zones; nonZone: number; sport: Sport }) {
  const { labels, names } = useZones()
  const total = zones.reduce((a, b) => a + b, 0) + nonZone
  const rows = [
    ...zones.map((m, i) => ({ label: labels[i], name: names[i], m, color: `var(--z${i + 1})` })),
    ...(nonZone > 0 ? [{ label: '', name: tr(sport === 'Rörlighet' ? 'Rörlighet' : 'Styrka'), m: nonZone, color: 'var(--c-nonzone)' }] : []),
  ].filter((r) => r.m > 0)
  if (!rows.length) return null
  return (
    <div className="sc-zones">
      {rows.map((r, i) => (
        <div key={i} className="sc-zone">
          <i style={{ background: r.color }} />
          <span>{r.label ? `${r.label} ${r.name}` : r.name}</span>
          <div className="sc-track">
            <b style={{ width: `${(r.m / total) * 100}%`, background: r.color }} />
          </div>
          <em>{fmtDuration(r.m)}</em>
        </div>
      ))}
    </div>
  )
}
