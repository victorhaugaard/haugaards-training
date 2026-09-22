// Ett enkelt, eget märke i Stravas orange, för att visa var data kommer ifrån.
// Ingen kopia av Stravas logotyp (den kräver Stravas egna brand-assets, se README).
export function StravaMark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="strava-mark">
      <path d="M13 2 5.5 15h5L9 22l9.5-13.5H13.5z" fill="#fc5200" />
    </svg>
  )
}
