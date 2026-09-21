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
      <circle cx="12.5" cy="3.6" r="2.2" fill="currentColor" stroke="none" />
      <path d="M12.2 7.8 11.2 13.4" strokeWidth="3.8" />
      <path d="M12.4 9 8.6 11.6 3.6 19M12.8 9 17 10.8 20.6 19" strokeWidth="1.4" />
      <path d="M11.2 13.4l3.6 3.4.2 2.6M11.2 13.4 8.6 16.6 8.2 18.6" strokeWidth="2.8" />
      <path d="M12.8 20.8h8M4 19.4l4.8 1.4" strokeWidth="1.2" />
      <circle cx="12.8" cy="20.8" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="20.8" cy="20.8" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="4" cy="19.4" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="8.8" cy="20.8" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  Skidor: (
    <>
      <circle cx="16.5" cy="3.6" r="2.2" fill="currentColor" stroke="none" />
      <path d="M14.8 8 10.6 13" strokeWidth="3.8" />
      <path d="M14.4 9.4l4.4 1.6L21.4 20" strokeWidth="1.4" />
      <path d="M10.6 13 6.6 13.4 3.4 12.2" strokeWidth="2.8" />
      <path d="M10.6 13 13.6 16.4 12.6 19.6" strokeWidth="2.8" />
      <path d="M2 15.2l5.6 4.6h2" strokeWidth="1.3" />
      <path d="M8.4 21h13q1.4 0 1.9-1.2" strokeWidth="1.3" />
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
