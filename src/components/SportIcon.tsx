import type { Sport } from '../types'

// Enkla linjeikoner (24×24) som visar passets typ
const PATHS: Record<Sport, React.ReactNode> = {
  Löpning: (
    <>
      <circle cx="15" cy="4.5" r="1.8" />
      <path d="M13.5 8.5 10.5 13l3.5 2.2 1 4.8" />
      <path d="M10.5 13 8 16.5H4.5" />
      <path d="M13 10.5l3.5 1.5M12.5 10 9 9.5" />
    </>
  ),
  Cykel: (
    <>
      <circle cx="6" cy="16.5" r="3.5" />
      <circle cx="18" cy="16.5" r="3.5" />
      <path d="M6 16.5 10 9h5l3 7.5M10 9 12.5 16.5H6M8.5 7H11M14.5 9l-1.2-2.5H16" />
    </>
  ),
  Rullskidor: (
    <>
      <path d="M2.5 12.5h15.5q2.8 0 3.5-2.3" />
      <path d="M9 12.5V10h4v2.5" />
      <circle cx="6" cy="16.5" r="2.3" />
      <circle cx="17" cy="16.5" r="2.3" />
    </>
  ),
  Skidor: (
    <>
      <path d="M4 21.5 14.5 5q1-1.6 2.7-1.4" />
      <path d="M9 21.5 19.5 5" />
      <path d="M7 15.5h4M12 15.5h4" />
    </>
  ),
  Stakmaskin: (
    <>
      <path d="M17 3v18M14 21h6M17 5.5h-5.9" />
      <circle cx="9" cy="5.5" r="2.1" />
      <path d="M9 7.1V15M6 15h6" />
    </>
  ),
  Styrka: <path d="M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11" />,
  Rörlighet: (
    <>
      <circle cx="12" cy="4.5" r="1.8" />
      <path d="M12 8v6M7.5 11l4.5-2 4.5 2M12 14l-3.5 6M12 14l3.5 6" />
    </>
  ),
  Tävling: <path d="M6 21V4M6 5h11l-2.5 3.5L17 12H6" />,
  Vila: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
  Övrigt: <path d="M5 12h.01M12 12h.01M19 12h.01" strokeWidth="3" />,
}

export function SportIcon({ sport, size = 16 }: { sport: Sport; size?: number }) {
  return (
    <svg
      className="sport-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[sport] ?? PATHS.Övrigt}
    </svg>
  )
}
