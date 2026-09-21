// Övningsbibliotek för egna styrkepass. Namnen är svenska nycklar som översätts vid visning.
export type ExGroup = 'Ben' | 'Rygg' | 'Bål' | 'Överkropp' | 'Explosivt' | 'Stabilitet'
export const EX_GROUPS: ExGroup[] = ['Ben', 'Rygg', 'Bål', 'Överkropp', 'Explosivt', 'Stabilitet']

export interface ExerciseDef {
  id: string
  name: string
  group: ExGroup
  home: boolean // går att göra hemma med lätta redskap eller kroppsvikt
  sets: number
  reps: string
}

const ex = (id: string, name: string, group: ExGroup, home: boolean, sets: number, reps: string): ExerciseDef => ({ id, name, group, home, sets, reps })

export const EXERCISES: ExerciseDef[] = [
  ex('squat', 'Knäböj', 'Ben', true, 4, '6–8'),
  ex('deadlift', 'Marklyft', 'Ben', false, 4, '5'),
  ex('lunge', 'Utfall', 'Ben', true, 3, '10'),
  ex('bulgarian', 'Bulgarisk split squat', 'Ben', true, 3, '8'),
  ex('single-squat', 'Enbensböj', 'Ben', true, 3, '8'),
  ex('rdl', 'Rumänsk marklyft (enben)', 'Ben', true, 3, '8'),
  ex('calf', 'Vadhöjningar', 'Ben', true, 3, '15'),
  ex('leg-press', 'Benpress', 'Ben', false, 3, '10'),
  ex('bridge', 'Höftlyft', 'Ben', true, 3, '12'),
  ex('step-up', 'Step-ups', 'Ben', true, 3, '10'),

  ex('barbell-row', 'Rodd med skivstång', 'Rygg', false, 4, '8'),
  ex('db-row', 'Hantelrodd', 'Rygg', true, 3, '10'),
  ex('pullup', 'Chins', 'Rygg', false, 4, '6'),
  ex('lat', 'Latsdrag', 'Rygg', false, 3, '10'),
  ex('back-ext', 'Ryggresningar', 'Rygg', true, 3, '12'),
  ex('good-morning', 'Good morning', 'Rygg', false, 3, '8'),
  ex('face-pull', 'Face pulls', 'Rygg', true, 3, '15'),
  ex('superman', 'Superman', 'Rygg', true, 3, '12'),

  ex('plank', 'Planka', 'Bål', true, 3, '45 s'),
  ex('side-plank', 'Sidoplanka', 'Bål', true, 3, '30 s'),
  ex('dead-bug', 'Dead bug', 'Bål', true, 3, '10'),
  ex('pallof', 'Pallof press', 'Bål', true, 3, '10'),
  ex('russian', 'Rysk twist', 'Bål', true, 3, '20'),
  ex('hanging-leg', 'Hängande benlyft', 'Bål', false, 3, '10'),
  ex('core-rot', 'Bålrotation med gummiband', 'Bål', true, 3, '12'),
  ex('hollow', 'Hollow hold', 'Bål', true, 3, '30 s'),

  ex('band-pole', 'Stakdrag med gummiband', 'Överkropp', true, 4, '15'),
  ex('pushup', 'Armhävningar', 'Överkropp', true, 3, '12'),
  ex('shoulder-press', 'Axelpress', 'Överkropp', true, 3, '10'),
  ex('pushdown', 'Triceps pushdown', 'Överkropp', false, 3, '12'),
  ex('dips', 'Dips', 'Överkropp', false, 3, '8'),

  ex('box-jump', 'Boxhopp', 'Explosivt', false, 3, '6'),
  ex('lateral-hop', 'Sidohopp', 'Explosivt', true, 3, '10'),
  ex('kb-swing', 'Kettlebell swing', 'Explosivt', true, 3, '15'),
  ex('med-ball', 'Medicinbollskast', 'Explosivt', false, 3, '8'),
  ex('burpee', 'Burpees', 'Explosivt', true, 3, '10'),
  ex('squat-jump', 'Hopp upp från knäböj', 'Explosivt', true, 3, '8'),

  ex('step-down', 'Step-down', 'Stabilitet', true, 3, '10'),
  ex('balance', 'Enbensbalans', 'Stabilitet', true, 3, '30 s'),
  ex('hip-abd', 'Höftabduktion med band', 'Stabilitet', true, 3, '15'),
  ex('monster', 'Monster walk', 'Stabilitet', true, 3, '12'),
  ex('nordic', 'Nordic hamstring', 'Stabilitet', true, 3, '5'),
  ex('copenhagen', 'Copenhagen plank', 'Stabilitet', true, 3, '20 s'),
]

export const exerciseById = (id: string) => EXERCISES.find((e) => e.id === id)

// Grov tidsuppskattning: uppvärmning plus ungefär 2,5 minuter per set inklusive vila
export const estimateMinutes = (list: { sets: number }[]) => Math.max(15, Math.round((5 + list.reduce((a, e) => a + e.sets * 2.5, 0)) / 5) * 5)
