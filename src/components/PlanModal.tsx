import { useState } from 'react'
import type { Person, PlanRecord, Session } from '../types'
import { addDays, cap, dayMonth, today, weekdayLong } from '../lib/dates'
import { upcomingHoursPerWeek } from '../lib/sessionOps'
import { tr } from '../i18n/core'
import { Modal } from './Modal'
import { PlanGuide } from './PlanGuide'

interface Props {
  plan: PlanRecord
  person: Person
  sessions: Session[]
  onApplyHours: (hours: number, factor: number) => void
  onRegenerate: () => void
  onClose: () => void
}

const SOURCE: Record<PlanRecord['source'], string> = {
  generated: 'Autogenererad',
  copied: 'Kopia av en annan plan',
  coach: 'Ombyggd av Coach Smirnov',
  earlier: 'Tidigare plan',
}

// Detaljer om nuvarande plan, med möjlighet att ändra intensiteten (timmar per vecka)
export function PlanModal({ plan, person, sessions, onApplyHours, onRegenerate, onClose }: Props) {
  const now = upcomingHoursPerWeek(sessions, today()) || plan.hours || 10
  const clamp = (n: number) => Math.max(4, Math.min(20, n))
  const [hours, setHours] = useState(clamp(Math.round(now * 2) / 2))
  const factor = hours / now
  const changed = Math.abs(hours - Math.round(now * 2) / 2) >= 0.5
  const runMode = plan.runMode ?? person.runMode ?? 'little'
  const restDay = plan.restDay ?? person.restDay ?? 0
  const facts = [
    `${dayMonth(plan.start)} – ${dayMonth(plan.end)}`,
    tr(SOURCE[plan.source]),
    tr(runMode === 'none' ? 'Ingen (skonsamt)' : 'Lite då och då'),
    restDay < 0 ? tr('Ingen fast vilodag') : `${tr('Vilodag')}: ${cap(weekdayLong(addDays('2026-09-21', restDay)))}`,
  ]

  return (
    <Modal
      wide
      title={tr('Plan {n}', { n: plan.seq })}
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={() => (onRegenerate(), onClose())}>
            {tr('Generera om planen…')}
          </button>
          <span className="spacer" />
          <button className="btn primary" disabled={!changed} onClick={() => (onApplyHours(hours, factor), onClose())}>
            {tr('Använd ny intensitet')}
          </button>
        </>
      }
    >
      <div className="plan-facts">
        {facts.map((f, i) => (
          <span key={i}>{f}</span>
        ))}
      </div>

      <div className="ov-card plan-intensity">
        <div className="stat-label">{tr('Intensitet')}</div>
        <label className="field">
          <span>
            {tr('Timmar per vecka i snitt: {h} h', { h: hours })} · {tr('nu ca {h} h', { h: (Math.round(now * 10) / 10).toString().replace('.', ',') })}
          </span>
          <input type="range" min={4} max={18} step={0.5} value={hours} onChange={(e) => setHours(+e.target.value)} />
        </label>
        <p className="muted small">
          {changed
            ? tr('Alla kommande pass blir {pct}% {dir}. Genomförda pass, lopp och vilodagar ändras inte.', { pct: Math.round(Math.abs(factor - 1) * 100), dir: tr(factor > 1 ? 'längre' : 'kortare') })
            : tr('Dra reglaget för att göra kommande pass längre eller kortare.')}
        </p>
      </div>

      <PlanGuide sessions={sessions.filter((s) => s.date >= plan.start)} runMode={runMode} restDay={restDay} />
    </Modal>
  )
}
