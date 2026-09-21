import type { Location, TrainingCard } from '../types'
import { fillZones } from '../lib/cards'
import { useZones } from '../lib/zones'
import { Segmented } from './Segmented'
import { tr } from '../i18n/core'

interface Props {
  card: TrainingCard
  location?: Location
  onLocation?: (l: Location) => void
}

export function CoachNote({ card, location, onLocation }: Props) {
  const { labels } = useZones()
  const c = location === 'home' && card.home ? card.home : card.coach
  const f = (t: string) => fillZones(tr(t), labels)
  return (
    <div className="cnote">
      <div className="cnote-head">
        <span className="stat-label">{tr('Coach')}</span>
        {card.home && onLocation && (
          <Segmented
            value={location ?? 'gym'}
            onChange={onLocation}
            options={[
              ['gym', tr('Gym')],
              ['home', tr('Hemma')],
            ]}
          />
        )}
      </div>
      <p className="cnote-purpose">{f(c.purpose)}</p>
      <ol>
        {c.how.map((h, i) => (
          <li key={i}>{f(h)}</li>
        ))}
      </ol>
      <p className="cnote-tip">
        <b>{tr('Tips:')}</b> {f(tr(c.tip))}
      </p>
    </div>
  )
}
