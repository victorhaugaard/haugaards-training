import { useEffect, useMemo, useRef, useState } from 'react'
import type { DoneSession, Person, PlanRecord, Session, Sport } from '../types'
import { addDays, cap, dayMonth, monthYear, weekdayLong } from '../lib/dates'
import { planStats, toDone } from '../lib/plans'
import { fmtDuration, fmtHours } from '../lib/stats'
import { tr } from '../i18n/core'
import { Ring } from './Ring'
import { SportIcon } from './SportIcon'
import { ZoneBar } from './ZoneBar'
import { ZoneLegend } from './Overview'
import { Avatar } from './Avatar'
import { resizeToSquare, uploadAvatar } from '../lib/avatar'

interface Props {
  person: Person
  sessions: Session[]
  plans: PlanRecord[]
  onUpdatePerson: (patch: Partial<Person>) => void
  onBack: () => void
  onOpenPlan: (plan: PlanRecord) => void
}

const SOURCE: Record<PlanRecord['source'], string> = {
  generated: 'Autogenererad',
  copied: 'Kopia av en annan plan',
  coach: 'Ombyggd av Coach Smirnov',
  earlier: 'Tidigare plan',
}

const restName = (d: number) => (d < 0 ? tr('Ingen fast vilodag') : cap(weekdayLong(addDays('2026-09-21', d))))

function Row({ s, plan }: { s: DoneSession; plan?: number }) {
  return (
    <div className="pf-row">
      <span className="pf-date">{dayMonth(s.date)}</span>
      <span className="pf-icon">
        <SportIcon sport={s.sport} size={16} />
      </span>
      <span className="pf-title">{tr(s.title)}</span>
      <span className="pf-min">{fmtDuration(s.minutes)}</span>
      {plan !== undefined && <span className="pf-plan">{tr('Plan {n}', { n: plan })}</span>}
    </div>
  )
}

function PlanCard({ plan, stats, active, onOpen }: { plan: PlanRecord; stats: ReturnType<typeof planStats>; active?: boolean; onOpen?: () => void }) {
  const runText = plan.runMode ? tr(plan.runMode === 'none' ? 'Ingen (skonsamt)' : 'Lite då och då') : ''
  return (
    <div
      className={'ov-card plan-card' + (active ? ' active' : '') + (onOpen ? ' clickable' : '')}
      onClick={onOpen}
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onKeyDown={(e) => onOpen && (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onOpen())}
    >
      <Ring value={stats.pct} size={64} stroke={6}>
        <span>{Math.round(stats.pct * 100)}%</span>
      </Ring>
      <div className="plan-main">
        <div className="stat-label">
          {tr('Plan {n}', { n: plan.seq })} · {tr(SOURCE[plan.source])}
        </div>
        <div className="plan-title">
          {dayMonth(plan.start)} – {dayMonth(plan.end)}
        </div>
        <div className="stat-sub">
          {active
            ? tr('{a} av {b} planerade pass klara hittills', { a: stats.dueDone, b: stats.due })
            : tr('{a} av {b} pass klara när planen avslutades', { a: stats.dueDone, b: stats.due })}
          {' · '}
          {fmtHours(stats.doneMinutes)} / {fmtHours(stats.dueMinutes)}
        </div>
        <div className="stat-sub">
          {[plan.hours ? tr('{h} h/vecka', { h: plan.hours }) : '', runText && `${tr('Löpning')}: ${runText}`, plan.restDay !== undefined ? `${tr('Vilodag')}: ${restName(plan.restDay)}` : '']
            .filter(Boolean)
            .join(' · ')}
        </div>
        {onOpen && <div className="plan-open">{tr('Visa detaljer och ändra intensitet')} ›</div>}
        {!active && plan.endedAt && (
          <div className="stat-sub">{tr('Avslutad {date}', { date: dayMonth(new Date(plan.endedAt).toISOString().slice(0, 10)) })}</div>
        )}
      </div>
    </div>
  )
}

export function ProfileView({ person, sessions, plans, onUpdatePerson, onBack, onOpenPlan }: Props) {
  const [menu, setMenu] = useState(false)
  useEffect(() => {
    if (!menu) return
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key !== 'Escape') return
      if (e instanceof MouseEvent && (e.target as HTMLElement).closest('.pf-photo-wrap')) return
      setMenu(false)
    }
    window.addEventListener('mousedown', close)
    window.addEventListener('keydown', close)
    return () => {
      window.removeEventListener('mousedown', close)
      window.removeEventListener('keydown', close)
    }
  }, [menu])
  const [busy, setBusy] = useState(false)
  const [photoError, setPhotoError] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const pickPhoto = async (file: File) => {
    setBusy(true)
    setPhotoError(false)
    try {
      const blob = await resizeToSquare(file)
      onUpdatePerson({ photoUrl: await uploadAvatar(person.id, blob) })
    } catch {
      setPhotoError(true)
    } finally {
      setBusy(false)
    }
  }
  const [sport, setSport] = useState<Sport | 'all'>('all')
  const [limit, setLimit] = useState(40)

  const active = plans.find((p) => !p.endedAt)
  const archived = plans.filter((p) => p.endedAt).sort((a, b) => b.seq - a.seq)

  // Alla avklarade pass: pågående plan + arkiverade planer, utan dubbletter
  const { list, planOf } = useMemo(() => {
    const planOf = new Map<string, number>()
    const byId = new Map<string, DoneSession>()
    for (const pl of archived) for (const d of pl.archive?.completed ?? []) (byId.set(d.id, d), planOf.set(d.id, pl.seq))
    for (const s of sessions)
      if (s.done && s.category !== 'rest') {
        byId.set(s.id, toDone(s))
        if (!planOf.has(s.id) && active) planOf.set(s.id, active.seq)
      }
    return { list: [...byId.values()].sort((a, b) => b.date.localeCompare(a.date)), planOf }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions, plans])

  const totals = useMemo(() => {
    const zones: [number, number, number, number, number] = [0, 0, 0, 0, 0]
    let minutes = 0
    let nonZone = 0
    let longest = 0
    for (const d of list) {
      minutes += d.minutes
      nonZone += d.nonZone
      longest = Math.max(longest, d.minutes)
      d.zones.forEach((z, i) => (zones[i] += z))
    }
    return { zones, minutes, nonZone, longest }
  }, [list])

  const sports = [...new Set(list.map((d) => d.sport))]
  const shown = list.filter((d) => sport === 'all' || d.sport === sport)
  let lastMonth = ''

  return (
    <div className="profile">
      <button className="back-btn" onClick={onBack}>
        ‹ {tr('Tillbaka till träningsplanen')}
      </button>
      <header className="pf-head">
        <div className="pf-photo-wrap">
          <button className={'pf-photo' + (busy ? ' busy' : '')} onClick={() => setMenu((m) => !m)} aria-label={tr('Redigera profilbild')} aria-expanded={menu} title={tr('Redigera profilbild')}>
            <Avatar person={person} size={72} />
            <span className="pf-photo-cta">{busy ? '…' : '✎'}</span>
          </button>
          {menu && (
            <div className="pf-menu">
              <button
                onClick={() => {
                  setMenu(false)
                  fileInput.current?.click()
                }}
              >
                {tr(person.photoUrl ? 'Byt profilbild' : 'Lägg till profilbild')}
              </button>
              {person.photoUrl && (
                <button
                  className="danger"
                  onClick={() => {
                    setMenu(false)
                    onUpdatePerson({ photoUrl: '' })
                  }}
                >
                  {tr('Ta bort bilden')}
                </button>
              )}
            </div>
          )}
        </div>
        <input ref={fileInput} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && pickPhoto(e.target.files[0])} />
        <div>
          <h2>{person.name}</h2>
          <span className="muted">{tr('Profil och träningshistorik')}</span>
          {photoError && <p className="error">{tr('Kunde inte ladda upp bilden. Kontrollera att Firebase Storage är aktiverat och att reglerna är publicerade.')}</p>}
        </div>
      </header>

      <div className="tiles">
        <div>
          <b>{list.length}</b>
          <span>{tr('Avklarade pass')}</span>
        </div>
        <div>
          <b>{fmtHours(totals.minutes)}</b>
          <span>{tr('Total träningstid')}</span>
        </div>
        <div>
          <b>{fmtDuration(totals.longest)}</b>
          <span>{tr('Längsta passet')}</span>
        </div>
        <div>
          <b>{plans.length}</b>
          <span>{tr('Planer')}</span>
        </div>
      </div>

      {totals.minutes > 0 && (
        <section className="ov-card">
          <div className="stat-label">{tr('Intensitet i avklarade pass')}</div>
          <ZoneBar zones={totals.zones} nonZone={totals.nonZone} />
          <ZoneLegend st={{ zones: totals.zones, nonZone: totals.nonZone }} />
        </section>
      )}

      <h3 className="pf-h">{tr('Nuvarande plan')}</h3>
      {active ? (
        <PlanCard plan={active} stats={planStats(sessions, active)} active onOpen={() => onOpenPlan(active)} />
      ) : (
        <p className="muted">{tr('Ingen pågående plan. Generera en i menyn.')}</p>
      )}

      <h3 className="pf-h">{tr('Tidigare planer')}</h3>
      {archived.length === 0 ? (
        <p className="muted">{tr('Ingen tidigare plan ännu. När du genererar om planen sparas den gamla här, med hur mycket du klarade av.')}</p>
      ) : (
        archived.map((pl) => {
          const a = pl.archive
          const stats = {
            plannedTotal: a?.plannedTotal ?? 0,
            due: a?.due ?? 0,
            dueDone: a?.dueDone ?? 0,
            done: a?.done ?? 0,
            dueMinutes: a?.dueMinutes ?? 0,
            doneMinutes: a?.doneMinutes ?? 0,
            pct: a?.due ? a.dueDone / a.due : 0,
          }
          return (
            <div key={pl.id}>
              <PlanCard plan={pl} stats={stats} />
              {a && a.completed.length > 0 && (
                <details className="pf-details">
                  <summary>{tr('Visa avklarade pass ({n})', { n: a.completed.length })}</summary>
                  <div className="pf-list">
                    {[...a.completed].sort((x, y) => y.date.localeCompare(x.date)).map((d) => (
                      <Row key={d.id} s={d} />
                    ))}
                  </div>
                </details>
              )}
            </div>
          )
        })
      )}

      <h3 className="pf-h">{tr('Alla avklarade pass')}</h3>
      {list.length === 0 ? (
        <p className="muted">{tr('Inga avklarade pass ännu. Bocka av ett pass så hamnar det här.')}</p>
      ) : (
        <>
          <div className="pf-filter">
            <button className={sport === 'all' ? 'on' : ''} onClick={() => setSport('all')}>
              {tr('Alla')}
            </button>
            {sports.map((sp) => (
              <button key={sp} className={sport === sp ? 'on' : ''} onClick={() => setSport(sp)}>
                <SportIcon sport={sp} size={13} /> {tr(sp)}
              </button>
            ))}
          </div>
          <div className="pf-list">
            {shown.slice(0, limit).map((d) => {
              const m = d.date.slice(0, 7)
              const head = m !== lastMonth ? cap(monthYear(d.date)) : null
              lastMonth = m
              return (
                <div key={d.id}>
                  {head && <div className="pf-month">{head}</div>}
                  <Row s={d} plan={planOf.get(d.id)} />
                </div>
              )
            })}
          </div>
          {shown.length > limit && (
            <button className="btn" onClick={() => setLimit((l) => l + 40)}>
              {tr('Visa fler')}
            </button>
          )}
        </>
      )}
    </div>
  )
}
