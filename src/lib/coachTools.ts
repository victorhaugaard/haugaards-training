// Verktygen Coach Smirnov kan använda. De körs i appen mot personens pass och returnerar en ny lista.
import type { Category, Person, PlanParams, RunMode, Session, Sport, Zones } from '../types'
import { CARDS, SPORTS, cardById } from './cards'
import { addDays, parse, startOfWeek, today, weekdayShort } from './dates'
import { PLAN_END, generatePlan } from './generator'
import { uid } from './id'
import { sessionMinutes } from './stats'
import { tr } from '../i18n/core'

export interface ToolCtx {
  personId: string
  person: Person
  sessions: Session[] // personens pass
}

export interface ToolOut {
  sessions: Session[]
  result: string
  error?: boolean
  summary?: string
  personPatch?: Partial<Person>
  newPlan?: PlanParams
}

const round5 = (n: number) => Math.round(n / 5) * 5
const isDate = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(parse(s).getTime())
const num = (v: unknown, d = 0) => (typeof v === 'number' && isFinite(v) ? v : d)
const clampMin = (n: number) => Math.max(0, Math.min(720, round5(n)))
const isZones = (z: unknown): z is number[] => Array.isArray(z) && z.length === 5 && z.every((x) => typeof x === 'number' && isFinite(x))
const err = (ctx: ToolCtx, msg: string): ToolOut => ({ sessions: ctx.sessions, result: `Error: ${msg}`, error: true })

const protectedSession = (s: Session) => s.done || s.category === 'race'
const nextOrder = (list: Session[], date: string) => list.filter((s) => s.date === date).length

const describe = (s: Session) =>
  `${s.id} | ${s.date} ${weekdayShort(s.date)} | ${s.title} | ${s.sport} | ${s.category} | ${sessionMinutes(s)}min | zones ${s.zones.join('/')}${s.nonZone ? ` +${s.nonZone} strength` : ''} | ${s.done ? 'done' : 'todo'}${s.notes ? ' | ' + s.notes.slice(0, 60) : ''}`

const scaleZones = (z: Zones, f: number): Zones => z.map((v) => clampMin(v * f)) as Zones

export const runTool = (name: string, input: Record<string, unknown>, ctx: ToolCtx): ToolOut => {
  const { sessions } = ctx
  const find = (id: unknown) => sessions.find((s) => s.id === id)

  switch (name) {
    case 'get_plan': {
      const from = isDate(input.from) ? input.from : today()
      const to = isDate(input.to) ? input.to : addDays(from, 27)
      const list = sessions.filter((s) => s.date >= from && s.date <= to).sort((a, b) => a.date.localeCompare(b.date) || a.order - b.order)
      return { sessions, result: list.slice(0, 90).map(describe).join('\n') || 'No sessions in that range.' }
    }

    case 'move_session': {
      const s = find(input.session_id)
      if (!s) return err(ctx, 'unknown session_id')
      if (!isDate(input.date)) return err(ctx, 'invalid date')
      if (protectedSession(s)) return err(ctx, 'race and completed sessions are protected; ask the user')
      const date = input.date
      const out = sessions.map((x) => (x.id === s.id ? { ...x, date, order: nextOrder(sessions, date) } : x))
      return { sessions: out, result: `Moved "${s.title}" to ${date}.`, summary: tr('Flyttade {title} till {date}', { title: tr(s.title), date }) }
    }

    case 'add_session': {
      if (!isDate(input.date)) return err(ctx, 'invalid date')
      const date = input.date
      const total = input.total_minutes !== undefined ? clampMin(num(input.total_minutes)) : undefined
      let base: Omit<Session, 'id' | 'personId' | 'date' | 'order'>
      if (typeof input.card_id === 'string' && input.card_id) {
        const c = cardById(input.card_id)
        if (!c) return err(ctx, `unknown card_id. Valid ids: ${CARDS.map((x) => x.id).join(', ')}`)
        const f = total ? total / Math.max(1, sessionMinutes(c)) : 1
        base = {
          cardId: c.id,
          title: c.name,
          sport: c.sport,
          category: c.category,
          zones: f === 1 ? ([...c.zones] as Zones) : scaleZones(c.zones, f),
          nonZone: f === 1 ? c.nonZone : clampMin(c.nonZone * f),
          notes: typeof input.notes === 'string' ? input.notes : '',
          done: false,
          ...(c.home ? { location: 'gym' as const } : {}),
        }
      } else {
        const title = typeof input.title === 'string' ? input.title.trim() : ''
        if (!title) return err(ctx, 'title is required for a custom session (or give card_id)')
        const sport = (SPORTS as readonly string[]).includes(String(input.sport)) ? (input.sport as Sport) : 'Övrigt'
        const strengthy = sport === 'Styrka' || sport === 'Rörlighet'
        let zones: Zones = isZones(input.zones_minutes) ? (input.zones_minutes.map(clampMin) as Zones) : [0, 0, 0, 0, 0]
        let nonZone = input.strength_minutes !== undefined ? clampMin(num(input.strength_minutes)) : 0
        if (total && !zones.some(Boolean) && !nonZone) {
          if (strengthy) nonZone = total
          else zones = [total, 0, 0, 0, 0]
        }
        if (!zones.some(Boolean) && !nonZone) nonZone = strengthy ? 30 : 0
        const cat = ['easy', 'quality', 'hard', 'strength', 'other'].includes(String(input.category)) ? (input.category as Category) : strengthy ? 'strength' : 'other'
        base = { cardId: 'other', title, sport, category: cat, zones, nonZone, notes: typeof input.notes === 'string' ? input.notes : '', done: false }
      }
      const s: Session = { id: uid(), personId: ctx.personId, date, order: nextOrder(sessions, date), ...base }
      return { sessions: [...sessions, s], result: `Added "${s.title}" on ${date} (id ${s.id}, ${sessionMinutes(s)} min).`, summary: tr('Lade till {title} {date}', { title: tr(s.title), date }) }
    }

    case 'update_session': {
      const s = find(input.session_id)
      if (!s) return err(ctx, 'unknown session_id')
      if (protectedSession(s)) return err(ctx, 'race and completed sessions are protected; ask the user')
      let next: Session = { ...s }
      if (typeof input.title === 'string' && input.title.trim()) next.title = input.title.trim()
      if (typeof input.notes === 'string') next.notes = input.notes
      if ((SPORTS as readonly string[]).includes(String(input.sport))) next.sport = input.sport as Sport
      if (isZones(input.zones_minutes)) next.zones = input.zones_minutes.map(clampMin) as Zones
      if (input.strength_minutes !== undefined) next.nonZone = clampMin(num(input.strength_minutes))
      if (typeof input.scale === 'number' && input.scale > 0.1 && input.scale < 3) {
        next = { ...next, zones: scaleZones(next.zones, input.scale), nonZone: clampMin(next.nonZone * input.scale) }
      }
      if (isDate(input.date) && input.date !== s.date) next = { ...next, date: input.date, order: nextOrder(sessions, input.date) }
      return {
        sessions: sessions.map((x) => (x.id === s.id ? next : x)),
        result: `Updated. Now: ${describe(next)}`,
        summary: tr('Ändrade {title}', { title: tr(next.title) }),
      }
    }

    case 'delete_sessions': {
      const ids = Array.isArray(input.session_ids) ? (input.session_ids as unknown[]).map(String) : []
      const gone: Session[] = []
      const skipped: string[] = []
      for (const id of ids) {
        const s = find(id)
        if (!s) skipped.push(`${id} (unknown)`)
        else if (protectedSession(s)) skipped.push(`${id} (protected: race or completed)`)
        else gone.push(s)
      }
      const drop = new Set(gone.map((s) => s.id))
      return {
        sessions: sessions.filter((s) => !drop.has(s.id)),
        result: `Deleted ${gone.length}.${skipped.length ? ` Skipped: ${skipped.join(', ')}.` : ''}`,
        summary: gone.length ? tr('Tog bort {n} pass', { n: gone.length }) : undefined,
      }
    }

    case 'scale_volume': {
      if (!isDate(input.from) || !isDate(input.to)) return err(ctx, 'invalid dates')
      const f = Math.max(0.3, Math.min(2, num(input.factor, 1)))
      let n = 0
      const from = input.from
      const to = input.to
      const out = sessions.map((s) => {
        if (s.date < from || s.date > to || protectedSession(s) || s.category === 'rest') return s
        n++
        return { ...s, zones: scaleZones(s.zones, f), nonZone: clampMin(s.nonZone * f) }
      })
      return {
        sessions: out,
        result: `Scaled ${n} sessions by ${f}.`,
        summary: n ? tr('Justerade volymen {pct}% för {n} pass', { pct: Math.round(f * 100), n }) : undefined,
      }
    }

    case 'shift_sessions': {
      if (!isDate(input.from) || !isDate(input.to)) return err(ctx, 'invalid dates')
      const days = Math.max(-14, Math.min(14, Math.round(num(input.days))))
      if (!days) return err(ctx, 'days must not be 0')
      const from = input.from
      const to = input.to
      let out = [...sessions]
      let n = 0
      const moving = sessions.filter((s) => s.date >= from && s.date <= to && !protectedSession(s)).sort((a, b) => a.date.localeCompare(b.date) || a.order - b.order)
      const ids = new Set(moving.map((s) => s.id))
      out = out.filter((s) => !ids.has(s.id))
      for (const s of moving) {
        const date = addDays(s.date, days)
        out.push({ ...s, date, order: nextOrder(out, date) })
        n++
      }
      return { sessions: out, result: `Shifted ${n} sessions by ${days} days.`, summary: n ? tr('Flyttade {n} pass {days} dagar', { n, days }) : undefined }
    }

    case 'regenerate_plan': {
      const start = isDate(input.start) ? input.start : startOfWeek(today())
      const end = isDate(input.end) ? input.end : PLAN_END
      const hours = Math.max(6, Math.min(20, num(input.hours_per_week, 12)))
      const runMode: RunMode = input.run_mode === 'none' || input.run_mode === 'little' ? input.run_mode : (ctx.person.runMode ?? 'little')
      const restDay = typeof input.rest_day === 'number' ? Math.max(-1, Math.min(6, Math.round(input.rest_day))) : (ctx.person.restDay ?? 0)
      const doneDays = new Set(sessions.filter((s) => s.done).map((s) => s.date))
      const generated = generatePlan({ personId: ctx.personId, start, end, hoursPerWeek: hours, runMode, restDay }).filter((s) => !doneDays.has(s.date))
      const kept = sessions.filter((s) => !(s.date >= start && !s.done && !(s.category === 'race' && !s.raceId)))
      return {
        sessions: [...kept, ...generated],
        result: `Regenerated plan from ${start} to ${end}: ${hours} h/week, run_mode ${runMode}, rest_day ${restDay}. ${generated.length} sessions created.`,
        summary: tr('Byggde om planen från {date}', { date: start }),
        personPatch: { runMode, restDay },
        newPlan: { start, end, hours, runMode, restDay, source: 'coach' },
      }
    }

    default:
      return err(ctx, `unknown tool ${name}`)
  }
}
