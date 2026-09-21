import { useMemo } from 'react'
import type { Session, Zones } from '../types'
import { addDays, cap, monthYear, startOfWeek, today, weekNumber } from '../lib/dates'
import { upcomingRaces } from '../lib/races'
import { RaceStrip } from './RaceStrip'
import { computeStats, fmtDuration, fmtHours, type Stats } from '../lib/stats'
import { useZones } from '../lib/zones'
import { Num } from './Num'
import { ZoneBar } from './ZoneBar'
import { tr } from '../i18n/core'

interface Props {
  sessions: Session[]
  onOpenMonth: (date: string) => void
}

const monthKey = (d: string) => d.slice(0, 7)

function ZoneLegend({ st }: { st: Stats }) {
  const { labels, names } = useZones()
  const total = st.zones.reduce((a, b) => a + b, 0)
  return (
    <div className="legend">
      {st.zones.map((z, i) => (
        <div key={i} title={`${labels[i]} ${names[i]}`}>
          <i style={{ background: `var(--z${i + 1})` }} />
          <span>{labels[i]}</span>
          <b>{z ? fmtHours(z) : '–'}</b>
          <em>{total ? Math.round((z / total) * 100) + '%' : ''}</em>
        </div>
      ))}
      <div title={tr('Styrka & rörlighet')}>
        <i style={{ background: 'var(--c-nonzone)' }} />
        <span>{tr('Styrka')}</span>
        <b>{st.nonZone ? fmtHours(st.nonZone) : '–'}</b>
        <em />
      </div>
    </div>
  )
}

export function Overview({ sessions, onOpenMonth }: Props) {
  const { labels } = useZones()

  const { months, weeks, all, weekMax } = useMemo(() => {
    const byMonth = new Map<string, Session[]>()
    const byWeek = new Map<string, Session[]>()
    const training = sessions.filter((s) => s.category !== 'race')
    for (const s of sessions) {
      const m = byMonth.get(monthKey(s.date)) ?? []
      m.push(s)
      byMonth.set(monthKey(s.date), m)
    }
    for (const s of training) {
      const w = startOfWeek(s.date)
      const l = byWeek.get(w) ?? []
      l.push(s)
      byWeek.set(w, l)
    }
    const months = [...byMonth.entries()].sort().map(([k, list]) => ({ key: k, date: k + '-01', st: computeStats(list) }))
    const keys = [...byWeek.keys()].sort()
    const weeks: { date: string; st: Stats }[] = []
    if (keys.length) for (let d = keys[0]; d <= keys[keys.length - 1]; d = addDays(d, 7)) weeks.push({ date: d, st: computeStats(byWeek.get(d) ?? []) })
    return {
      months,
      weeks,
      all: computeStats(training),
      weekMax: Math.max(60, ...weeks.map((w) => w.st.total)),
    }
  }, [sessions])

  if (!sessions.length) return <p className="muted">{tr('Inga pass ännu. Generera en plan i menyn.')}</p>

  const races = upcomingRaces(sessions)
  const nowWeek = startOfWeek(today())
  const nowMonth = monthKey(today())
  const weekCount = Math.max(1, weeks.length)

  return (
    <div className="overview">
      <RaceStrip races={races} />
      <section className="ov-card total">
        <div className="ov-head">
          <div>
            <div className="stat-label">{tr('Träningsperioden')}</div>
            <div className="ov-big">
              <Num value={all.total} format={fmtHours} />
            </div>
            <div className="stat-sub">
              {tr('{n} pass · snitt {h} per vecka', { n: all.count, h: fmtHours(all.total / weekCount) })}
            </div>
          </div>
          <div className="ov-done">
            <div className="stat-label">{tr('Genomfört')}</div>
            <div className="ov-mid">
              <Num value={all.done} format={fmtHours} />
            </div>
            <div className="progress">
              <span style={{ width: `${all.total ? (all.done / all.total) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
        <ZoneBar zones={all.zones} nonZone={all.nonZone} />
        <ZoneLegend st={all} />
      </section>

      <section className="ov-card">
        <div className="stat-label">{tr('Timmar per vecka')}</div>
        <div className="weekchart">
          {weeks.map((w) => {
            const parts: [number, string][] = [...w.st.zones.map((z, i) => [z, `var(--z${i + 1})`] as [number, string]), [w.st.nonZone, 'var(--c-nonzone)']]
            return (
              <div
                key={w.date}
                className={'wk' + (w.date === nowWeek ? ' now' : '')}
                title={tr('Vecka {n} · {dur}', { n: weekNumber(w.date), dur: fmtDuration(w.st.total) }) + '\n' + w.st.zones.map((z, i) => `${labels[i]} ${fmtDuration(z)}`).join(' · ')}
              >
                <div className="wk-bar" style={{ height: `${(w.st.total / weekMax) * 100}%` }}>
                  {parts.map(([v, c], i) => (v ? <span key={i} style={{ flex: v, background: c }} /> : null)).reverse()}
                </div>
                <div className="wk-label">{weekNumber(w.date)}</div>
              </div>
            )
          })}
        </div>
        <div className="stat-sub">{tr('Veckonummer längs x-axeln. Färgerna är intensitetszoner.')}</div>
      </section>

      <div className="months">
        {months.map((m) => {
          const weeksIn = Math.max(1, new Set(sessions.filter((s) => monthKey(s.date) === m.key).map((s) => startOfWeek(s.date))).size)
          const zones = m.st.zones as Zones
          return (
            <button key={m.key} className={'ov-card month-card' + (m.key === nowMonth ? ' now' : '')} onClick={() => onOpenMonth(m.date)}>
              <div className="stat-label">{cap(monthYear(m.date))}</div>
              <div className="ov-big">
                <Num value={m.st.total} format={fmtHours} />
              </div>
              <div className="stat-sub">
                {tr('{n} pass · {h}/vecka', { n: m.st.count, h: fmtHours(m.st.total / weeksIn) })}
              </div>
              <ZoneBar zones={zones} nonZone={m.st.nonZone} />
              <ZoneLegend st={m.st} />
              <div className="progress">
                <span style={{ width: `${m.st.total ? (m.st.done / m.st.total) * 100 : 0}%` }} />
              </div>
              <div className="stat-sub">
                {tr('{h} genomfört', { h: fmtHours(m.st.done) })}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
