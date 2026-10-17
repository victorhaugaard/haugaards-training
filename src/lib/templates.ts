import type { CustomTemplate, TrainingCard } from '../types'

// Ett eget pass som träningskort, så att det kan dras till kalendern och läggas till som vilket kort som helst
export const templateCard = (t: CustomTemplate): TrainingCard => ({
  id: t.id,
  name: t.name,
  sport: t.sport,
  category: t.category,
  zones: [...t.zones],
  nonZone: t.nonZone,
  hint: '',
  group: 'Mina pass',
  coach: { purpose: t.notes, how: [], tip: '' },
  exercises: t.exercises,
  notes: t.notes,
})

export const upsertTemplate = (list: CustomTemplate[] | undefined, t: CustomTemplate) =>
  (list ?? []).some((x) => x.id === t.id) ? (list ?? []).map((x) => (x.id === t.id ? t : x)) : [...(list ?? []), t]
