import type { Zones } from '../types'

export function ZoneBar({ zones, nonZone = 0, thin }: { zones: Zones; nonZone?: number; thin?: boolean }) {
  const total = zones.reduce((a, b) => a + b, 0) + nonZone
  if (!total) return <div className={'zonebar empty' + (thin ? ' thin' : '')} />
  return (
    <div className={'zonebar' + (thin ? ' thin' : '')}>
      {zones.map((z, i) =>
        z ? <span key={i} style={{ flex: z, background: `var(--z${i + 1})` }} /> : null,
      )}
      {nonZone > 0 && <span style={{ flex: nonZone, background: 'var(--c-strength)' }} />}
    </div>
  )
}
