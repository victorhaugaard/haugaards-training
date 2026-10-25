import type { FitnessPrefs, RunMode, Session, SportFocus, TrainSport } from '../types'
import { generateFitnessPlan } from './fitnessGenerator'
import { generatePlan } from './generator'
import { planTypeOf } from './trainSports'

export interface BuildOptions {
  start: string
  end: string
  hours: number
  runMode: RunMode
  restDay: number
  focus: SportFocus
  sports?: TrainSport[]
  fitness?: FitnessPrefs
  anchor?: string // pågående planens start, så att en ombyggnad fortsätter i samma rytm
}

// Väljer generator efter plan-typ: skidplanen eller Styrka & kondition
export const buildPlan = (personId: string, o: BuildOptions): Session[] =>
  planTypeOf(o.sports) === 'fitness'
    ? generateFitnessPlan({ personId, start: o.start, end: o.end, hoursPerWeek: o.hours, restDay: o.restDay, sports: o.sports ?? [], prefs: o.fitness, anchor: o.anchor })
    : generatePlan({ personId, start: o.start, end: o.end, hoursPerWeek: o.hours, runMode: o.runMode, restDay: o.restDay, focus: o.focus, anchor: o.anchor })
