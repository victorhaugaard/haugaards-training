import { useState } from 'react'
import type { Coach } from '../lib/coaches'

// Coachens bild (public/coaches/<id>.jpg), annars initialer på en färgad bakgrund
export function CoachAvatar({ coach, size = 34 }: { coach: Coach; size?: number }) {
  const [ok, setOk] = useState(true)
  const photo = coach.photo && ok
  return (
    <span
      className="coach-avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * (coach.initials.length > 1 ? 0.34 : 0.42),
        ...(photo ? {} : { background: `linear-gradient(145deg, hsl(${coach.hue} 70% 55%), hsl(${coach.hue} 65% 28%))` }),
      }}
    >
      {photo ? <img src={`/coaches/${coach.id}.jpg`} alt={coach.name} draggable={false} onError={() => setOk(false)} /> : coach.initials}
    </span>
  )
}
