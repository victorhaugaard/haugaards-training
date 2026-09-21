import type { Location, TrainingCard } from '../types'
import { fillZones } from '../lib/cards'
import { useZones } from '../lib/zones'
import { Segmented } from './Segmented'

interface Props {
  card: TrainingCard
  location?: Location
  onLocation?: (l: Location) => void
}

export function CoachNote({ card, location, onLocation }: Props) {
  const { labels } = useZones()
  const c = location === 'home' && card.home ? card.home : card.coach
  const f = (t: string) => fillZones(t, labels)
  return (
    <div className="coach">
      <div className="coach-head">
        <span className="stat-label">Coach</span>
        {card.home && onLocation && (
          <Segmented
            value={location ?? 'gym'}
            onChange={onLocation}
            options={[
              ['gym', 'Gym'],
              ['home', 'Hemma'],
            ]}
          />
        )}
      </div>
      <p className="coach-purpose">{f(c.purpose)}</p>
      <ol>
        {c.how.map((h, i) => (
          <li key={i}>{f(h)}</li>
        ))}
      </ol>
      <p className="coach-tip">
        <b>Tips:</b> {f(c.tip)}
      </p>
    </div>
  )
}
