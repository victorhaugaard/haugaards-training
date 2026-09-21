import type { Category, TrainingCard } from '../types'

export const CARDS: TrainingCard[] = [
  { id: 'easy-run', name: 'Lugn löpning', sport: 'Löpning', category: 'easy', zones: [60, 0, 0, 0, 0], nonZone: 0, flex: true, hint: 'Rent lugnt, samtalstempo' },
  { id: 'easy-bike', name: 'Lugn cykel', sport: 'Cykel', category: 'easy', zones: [90, 0, 0, 0, 0], nonZone: 0, flex: true, hint: 'Rent lugnt, låg belastning' },
  { id: 'rs-easy', name: 'Rullskidor distans', sport: 'Rullskidor', category: 'easy', zones: [45, 45, 0, 0, 0], nonZone: 0, flex: true, hint: 'Teknikfokus, lugn–distans' },
  { id: 'rs-long', name: 'Långpass rullskidor', sport: 'Rullskidor', category: 'easy', zones: [110, 40, 0, 0, 0], nonZone: 0, flex: true, hint: 'Veckans längsta pass' },
  { id: 'long-run', name: 'Långpass löpning', sport: 'Löpning', category: 'easy', zones: [100, 20, 0, 0, 0], nonZone: 0, flex: true, hint: 'Terräng, stavgång i backar' },
  { id: 'ski-easy', name: 'Skidor distans', sport: 'Skidor', category: 'easy', zones: [60, 30, 0, 0, 0], nonZone: 0, flex: true, hint: 'På snö, lugn–distans' },
  { id: 'ski-long', name: 'Långpass skidor', sport: 'Skidor', category: 'easy', zones: [110, 40, 0, 0, 0], nonZone: 0, flex: true, hint: 'På snö, långt och lugnt' },
  { id: 'int-4x8', name: 'Intervaller 4×8 min', sport: 'Löpning', category: 'quality', zones: [44, 0, 0, 32, 0], nonZone: 0, hint: 'Tröskel, 3 min vila. Kärnpass' },
  { id: 'int-rs', name: 'Rullskidintervaller 5×6', sport: 'Rullskidor', category: 'quality', zones: [44, 0, 0, 30, 0], nonZone: 0, hint: 'Tröskel, stakning/diagonal' },
  { id: 'tempo', name: 'Tempo 3×15 min', sport: 'Löpning', category: 'quality', zones: [35, 0, 45, 0, 0], nonZone: 0, hint: 'Tempo, jämnt och kontrollerat' },
  { id: 'fartlek', name: 'Fartlek', sport: 'Löpning', category: 'quality', zones: [45, 15, 10, 10, 0], nonZone: 0, hint: 'Lekfull växling upp till tröskel' },
  { id: 'int-short', name: 'Korta intervaller 6×3', sport: 'Löpning', category: 'hard', zones: [45, 0, 0, 0, 18], nonZone: 0, hint: 'Max, full återhämtning' },
  { id: 'int-hill', name: 'Backintervaller 6×4', sport: 'Löpning', category: 'hard', zones: [50, 0, 0, 8, 16], nonZone: 0, hint: 'Stavgång/löpning uppför' },
  { id: 'strength', name: 'Styrka', sport: 'Styrka', category: 'strength', zones: [0, 0, 0, 0, 0], nonZone: 60, hint: 'Överkropp, core, ben' },
  { id: 'mobility', name: 'Rörlighet & core', sport: 'Rörlighet', category: 'strength', zones: [0, 0, 0, 0, 0], nonZone: 30, hint: 'Kort och lätt' },
  { id: 'race', name: 'Tävling', sport: 'Tävling', category: 'race', zones: [30, 0, 0, 40, 20], nonZone: 0, hint: 'Skriv själv, t.ex. Vasaloppet' },
  { id: 'other', name: 'Övrigt', sport: 'Övrigt', category: 'other', zones: [60, 0, 0, 0, 0], nonZone: 0, hint: 'Valfritt pass och zoner' },
]

export const cardById = (id: string) => CARDS.find((c) => c.id === id)

export type ZoneSystem = 'no' | 'us'

// Data lagras alltid i fem nivåer (lugn → max). Systemet styr bara namnen.
// Norska (Olympiatoppen): I1 lugn, I2 distans, I3 tempo, I4 tröskel, I5 max.
// Engelska/amerikanska: I1 ≈ Z2 (lugn jogg), I2 ≈ övre Z2, I3 ≈ Z3, I4 ≈ Z4, I5 ≈ Z5.
export const ZONE_SYSTEMS: Record<ZoneSystem, { title: string; labels: string[]; names: string[] }> = {
  no: { title: 'Norska I1–I5', labels: ['I1', 'I2', 'I3', 'I4', 'I5'], names: ['Lugn', 'Distans', 'Tempo', 'Tröskel', 'Max'] },
  us: { title: 'Engelska Z1–Z5', labels: ['Z2', 'Z2+', 'Z3', 'Z4', 'Z5'], names: ['Lugn jogg', 'Steady', 'Tempo', 'Tröskel', 'VO₂max'] },
}
export const SPORTS = ['Löpning', 'Rullskidor', 'Cykel', 'Skidor', 'Styrka', 'Rörlighet', 'Tävling', 'Övrigt'] as const

export const CATEGORY_COLOR: Record<Category, string> = {
  easy: 'var(--c-easy)',
  quality: 'var(--c-quality)',
  hard: 'var(--c-hard)',
  strength: 'var(--c-strength)',
  race: 'var(--c-race)',
  other: 'var(--c-other)',
}
