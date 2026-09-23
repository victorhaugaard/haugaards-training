import type { AppState, DoneSession, PlanArchive, PlanParams, PlanRecord, Session } from '../types'
import { today } from './dates'
import { sessionMinutes } from './stats'
import { uid } from './id'

const counts = (s: Session) => s.category !== 'rest' && s.category !== 'race'

export const toDone = (s: Session): DoneSession => ({
  id: s.id,
  date: s.date,
  title: s.title,
  sport: s.sport,
  category: s.category,
  minutes: sessionMinutes(s),
  zones: s.zones,
  nonZone: s.nonZone,
})

export interface PlanStats {
  plannedTotal: number
  due: number
  dueDone: number
  done: number
  dueMinutes: number
  doneMinutes: number
  pct: number
}

// Hur mycket av planen som är klart. "Due" är pass som skulle vara gjorda till och med idag.
export const planStats = (sessions: Session[], plan: Pick<PlanRecord, 'personId' | 'start'>, upTo = today()): PlanStats => {
  const mine = sessions.filter((s) => s.personId === plan.personId && s.date >= plan.start && counts(s))
  const due = mine.filter((s) => s.date <= upTo)
  const dueDone = due.filter((s) => s.done)
  return {
    plannedTotal: mine.length,
    due: due.length,
    dueDone: dueDone.length,
    done: mine.filter((s) => s.done).length,
    dueMinutes: due.reduce((a, s) => a + sessionMinutes(s), 0),
    doneMinutes: dueDone.reduce((a, s) => a + sessionMinutes(s), 0),
    pct: due.length ? dueDone.length / due.length : 0,
  }
}

export const archivePlan = (plan: PlanRecord, sessions: Session[]): PlanRecord => {
  const st = planStats(sessions, plan)
  const completed = sessions.filter((s) => s.personId === plan.personId && s.date >= plan.start && s.done && counts(s)).map(toDone)
  const { pct: _pct, ...rest } = st
  void _pct
  const archive: PlanArchive = { ...rest, completed }
  return { ...plan, endedAt: Date.now(), archive }
}

export const endActivePlan = (plans: PlanRecord[], personId: string, sessions: Session[]) =>
  plans.map((pl) => (pl.personId === personId && !pl.endedAt ? archivePlan(pl, sessions) : pl))

export const nextSeq = (plans: PlanRecord[], personId: string) => plans.filter((p) => p.personId === personId).reduce((m, p) => Math.max(m, p.seq), 0) + 1

export const newPlanRecord = (plans: PlanRecord[], personId: string, params: PlanParams): PlanRecord => ({
  id: uid(),
  personId,
  seq: nextSeq(plans, personId),
  start: params.start,
  end: params.end,
  createdAt: Date.now(),
  source: params.source,
  ...(params.hours !== undefined ? { hours: params.hours } : {}),
  ...(params.runMode ? { runMode: params.runMode } : {}),
  ...(params.restDay !== undefined ? { restDay: params.restDay } : {}),
  ...(params.focus ? { focus: params.focus } : {}),
})

// Äldre data saknar planposter. Skapa en pågående plan per person som har pass.
// Id:t är förutsägbart så att två klienter inte skapar varsin.
export const ensurePlans = (state: AppState): AppState => {
  let plans = state.plans ?? []
  for (const p of state.people) {
    const mine = state.sessions.filter((s) => s.personId === p.id)
    if (!mine.length || plans.some((pl) => pl.personId === p.id && !pl.endedAt)) continue
    const dates = mine.map((s) => s.date).sort()
    const seq = nextSeq(plans, p.id)
    plans = [
      ...plans,
      {
        id: `plan-${p.id}-${seq}`,
        personId: p.id,
        seq,
        start: dates[0],
        end: dates[dates.length - 1],
        createdAt: p.createdAt ?? 0,
        source: 'earlier',
        ...(p.runMode ? { runMode: p.runMode } : {}),
        ...(p.restDay !== undefined ? { restDay: p.restDay } : {}),
      },
    ]
  }
  return plans === state.plans ? state : { ...state, plans }
}

export const planLabel = (seq: number) => `Plan ${seq}`
