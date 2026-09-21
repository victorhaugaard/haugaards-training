import type { View } from '../types'
import { tr } from '../i18n/core'

const ICONS: Record<View, React.ReactNode> = {
  day: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="3" />
      <path d="M4 10h16M9 3v4M15 3v4" />
    </>
  ),
  week: <path d="M4 7h16M4 12h16M4 17h16" />,
  month: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M4 10h16M4 15h16M10 4v16M15 4v16" />
    </>
  ),
  overview: <path d="M6 20V12M12 20V5M18 20v-6" />,
  profile: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c.8-3.6 3.4-5.5 7-5.5s6.2 1.9 7 5.5" />
    </>
  ),
}

const TABS: [View, string][] = [
  ['day', 'Dag'],
  ['week', 'Vecka'],
  ['month', 'Månad'],
  ['overview', 'Översikt'],
  ['profile', 'Profil'],
]

// Flikrad längst ner på mobil
export function TabBar({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return (
    <nav className="tabbar" aria-label="Vyer">
      {TABS.map(([v, l]) => (
        <button key={v} className={view === v ? 'on' : ''} onClick={() => onChange(v)} aria-current={view === v ? 'page' : undefined}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {ICONS[v]}
          </svg>
          <span>{tr(l)}</span>
        </button>
      ))}
    </nav>
  )
}
