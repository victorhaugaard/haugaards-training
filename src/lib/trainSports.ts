import type { Person, PlanType, Sport, TrainSport } from '../types'

// Sportkorten man väljer bland när man skapar sin plan. label är svensk källtext (översätts med tr()).
export const TRAIN_SPORTS: { id: TrainSport; label: string; hint: string; icon: Sport }[] = [
  { id: 'ski', label: 'Längdskidor', hint: 'Skidor, rullskidor och stakmaskin mot loppen', icon: 'Skidor' },
  { id: 'run', label: 'Löpning', hint: 'Lugna rundor, intervaller och långpass', icon: 'Löpning' },
  { id: 'strength', label: 'Styrketräning', hint: 'Gym eller hemma, hela kroppen', icon: 'Styrka' },
  { id: 'hiit', label: 'HIIT & kondition', hint: 'Cirkelträning, intervaller och kondition på gym', icon: 'Kondition' },
  { id: 'bike', label: 'Cykel', hint: 'Ute eller inomhus på Zwift/Tacx', icon: 'Cykel' },
]

// Längdskidor bygger skidplanen. Alla andra kombinationer blir Styrka & kondition.
export const planTypeOf = (sports: TrainSport[] | undefined): PlanType => (!sports || sports.length === 0 || sports.includes('ski') ? 'ski' : 'fitness')

// Äldre personer saknar sports och har alltid haft skidplanen
export const personPlanType = (p: Pick<Person, 'sports'>): PlanType => planTypeOf(p.sports)
export const personSports = (p: Pick<Person, 'sports'>): TrainSport[] => (p.sports && p.sports.length ? p.sports : ['ski'])
