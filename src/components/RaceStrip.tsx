import { dayMonth } from '../lib/dates'
import type { Upcoming } from '../lib/races'
import { tr } from '../i18n/core'

export function RaceStrip({ races }: { races: Upcoming[] }) {
  if (!races.length) return null
  return (
    <section className="racestrip" aria-label={tr('Kommande tävlingar')}>
      {races.map((r) => (
        <div key={r.id} className={'race' + (r.clash ? ' clash' : '')}>
          <div className="race-days">
            <b>{r.days}</b>
            <span>{tr(r.days === 0 ? 'idag' : r.days === 1 ? 'dag' : 'dagar')}</span>
          </div>
          <div className="race-name">{tr(r.title)}</div>
          <div className="race-date">
            {dayMonth(r.date)} {r.date.slice(0, 4)}
            {r.clash && <em title={tr('Två tävlingar samma dag')}> · {tr('samma dag')}</em>}
          </div>
        </div>
      ))}
    </section>
  )
}
