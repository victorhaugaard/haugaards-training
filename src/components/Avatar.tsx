import type { Person } from '../types'

// Profilbild eller initial
export function Avatar({ person, size = 30, className = '' }: { person: Pick<Person, 'name' | 'photoUrl'>; size?: number; className?: string }) {
  return (
    <span className={'avatar ' + className} style={{ width: size, height: size, fontSize: size * 0.42 }}>
      {person.photoUrl ? <img src={person.photoUrl} alt="" draggable={false} /> : person.name.slice(0, 1).toUpperCase()}
    </span>
  )
}
