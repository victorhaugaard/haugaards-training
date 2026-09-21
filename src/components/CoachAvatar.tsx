import { useState } from 'react'

// Coach Smirnovs bild (public/coach.jpg). Faller tillbaka på bokstaven S om bilden saknas.
export function CoachAvatar({ size = 34 }: { size?: number }) {
  const [ok, setOk] = useState(true)
  return (
    <span className="coach-avatar" style={{ width: size, height: size, fontSize: size * 0.42 }}>
      {ok ? <img src="/coach.jpg" alt="Coach Smirnov" draggable={false} onError={() => setOk(false)} /> : 'S'}
    </span>
  )
}
