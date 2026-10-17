// Övningsbiblioteket. Namn och tips är svenska nycklar som översätts vid visning.
// Förvalen följer vanliga rekommendationer från styrketräningsforskningen: flerledsövningar 3–4 set
// med 6–10 reps och 2–3 minuters vila, isoleringsövningar 2–3 set med 10–15 reps och 60–90 s vila.
// Man stannar 1–3 reps före failure (RIR).
import type { Exercise } from '../types'

export type ExGroup = 'Ben' | 'Rygg' | 'Bröst' | 'Axlar' | 'Armar' | 'Bål' | 'Explosivt' | 'CrossFit' | 'Stabilitet' | 'Kondition'
export const EX_GROUPS: ExGroup[] = ['Ben', 'Rygg', 'Bröst', 'Axlar', 'Armar', 'Bål', 'Explosivt', 'CrossFit', 'Stabilitet', 'Kondition']

export interface ExerciseDef {
  id: string
  name: string
  group: ExGroup
  home: boolean // går att göra hemma med lätta redskap eller kroppsvikt
  sets: number
  reps: string
  rest: number // sekunder
  cue: string // kort teknikråd
}

const ex = (id: string, name: string, group: ExGroup, home: boolean, sets: number, reps: string, rest: number, cue: string): ExerciseDef => ({
  id,
  name,
  group,
  home,
  sets,
  reps,
  rest,
  cue,
})

export const EXERCISES: ExerciseDef[] = [
  ex('squat', 'Knäböj', 'Ben', true, 4, '6–8', 150, 'Bröstet upp, knäna följer tårna och gå ner tills låren är parallella.'),
  ex('goblet-squat', 'Goblet squat', 'Ben', true, 3, '10–12', 90, 'Håll vikten mot bröstet och sitt rakt ner mellan hälarna.'),
  ex('deadlift', 'Marklyft', 'Ben', false, 4, '5', 180, 'Stången nära benen, rak rygg och tryck ifrån med hela foten.'),
  ex('rdl2', 'Rumänsk marklyft', 'Ben', false, 3, '8–10', 120, 'Fäll i höften med lätt böjda knän tills du känner baksidan av låren.'),
  ex('lunge', 'Utfall', 'Ben', true, 3, '10 per ben', 90, 'Långt steg, bakre knät mot golvet och överkroppen upprätt.'),
  ex('bulgarian', 'Bulgarisk split squat', 'Ben', true, 3, '8 per ben', 90, 'Bakre foten på bänk, sjunk rakt ner och tryck ifrån med främre hälen.'),
  ex('single-squat', 'Enbensböj', 'Ben', true, 3, '6–8 per ben', 90, 'Långsamt ner på ett ben, knät i linje med tårna.'),
  ex('rdl', 'Rumänsk marklyft (enben)', 'Ben', true, 3, '8 per ben', 90, 'Fäll framåt på ett ben med höfterna i våg.'),
  ex('step-up', 'Step-ups', 'Ben', true, 3, '10 per ben', 90, 'Kliv upp med hela foten på lådan och tryck ifrån med det övre benet.'),
  ex('hip-thrust', 'Höftlyft med skivstång', 'Ben', false, 3, '8–10', 120, 'Övre ryggen mot bänken, pressa höften upp och spänn sätet i toppen.'),
  ex('bridge', 'Höftlyft', 'Ben', true, 3, '12–15', 60, 'Pressa genom hälarna och håll en sekund i toppen.'),
  ex('leg-press', 'Benpress', 'Ben', false, 3, '10–12', 120, 'Hela foten på plattan, gå djupt utan att ländryggen lyfter.'),
  ex('leg-curl', 'Lårcurl', 'Ben', false, 3, '10–12', 75, 'Kontrollerad rörelse, sänk långsamt.'),
  ex('leg-ext', 'Benspark', 'Ben', false, 3, '12–15', 75, 'Sträck ut helt och sänk långsamt.'),
  ex('calf', 'Vadhöjningar', 'Ben', true, 3, '12–15', 60, 'Hela vägen upp på tå och långsamt ner.'),

  ex('pullup', 'Chins', 'Rygg', false, 4, '5–8', 150, 'Från raka armar upp tills hakan är över stången, utan att gunga.'),
  ex('lat', 'Latsdrag', 'Rygg', false, 3, '8–12', 90, 'Dra stången mot bröstet med armbågarna ner och bak.'),
  ex('barbell-row', 'Rodd med skivstång', 'Rygg', false, 4, '6–8', 120, 'Fäll fram, rak rygg, dra stången mot naveln.'),
  ex('db-row', 'Hantelrodd', 'Rygg', true, 3, '10 per arm', 75, 'Dra armbågen bakåt mot höften, inte rakt upp.'),
  ex('cable-row', 'Sittande kabelrodd', 'Rygg', false, 3, '10–12', 90, 'Sitt upprätt och klämm ihop skulderbladen i slutet.'),
  ex('inverted-row', 'Inverterad rodd', 'Rygg', true, 3, '8–12', 90, 'Kroppen rak som en planka, dra bröstet mot stången (eller bordskanten).'),
  ex('face-pull', 'Face pulls', 'Rygg', true, 3, '12–15', 60, 'Dra mot pannan med armbågarna högt och vrid ut händerna.'),
  ex('back-ext', 'Ryggresningar', 'Rygg', true, 3, '12', 60, 'Res dig till rak linje, inte längre.'),
  ex('good-morning', 'Good morning', 'Rygg', false, 3, '8', 90, 'Lätt böjda knän, fäll i höften med rak rygg.'),
  ex('superman', 'Superman', 'Rygg', true, 3, '12', 45, 'Lyft armar och ben samtidigt och håll två sekunder.'),
  ex('band-pole', 'Stakdrag med gummiband', 'Rygg', true, 4, '15', 60, 'Fäll i höften och dra ner som i en stakning.'),

  ex('bench', 'Bänkpress', 'Bröst', false, 4, '6–8', 150, 'Skulderbladen ihop, sänk stången till bröstet och pressa upp.'),
  ex('incline-press', 'Lutande hantelpress', 'Bröst', false, 3, '8–10', 120, 'Bänken på 30°, sänk hantlarna mot övre bröstet.'),
  ex('pushup', 'Armhävningar', 'Bröst', true, 3, '8–15', 75, 'Kroppen rak, bröstet ner mot golvet och armbågarna 45° ut.'),
  ex('dips', 'Dips', 'Bröst', false, 3, '6–10', 120, 'Luta lätt framåt och gå ner tills överarmen är vågrät.'),
  ex('bench-dip', 'Dips mot bänk', 'Bröst', true, 3, '10–12', 75, 'Händerna på bänken bakom dig, sänk tills armbågen är 90°.'),

  ex('shoulder-press', 'Axelpress', 'Axlar', true, 3, '8–10', 120, 'Spänn bålen och pressa rakt upp utan att svanka.'),
  ex('lateral-raise', 'Sidolyft', 'Axlar', true, 3, '12–15', 60, 'Lyft ut åt sidorna till axelhöjd med lätt böjda armbågar.'),
  ex('rear-fly', 'Omvända flyes', 'Axlar', true, 3, '12–15', 60, 'Framåtlutad, lyft ut åt sidorna och klämm ihop skulderbladen.'),
  ex('pike-pushup', 'Pike push-ups', 'Axlar', true, 3, '6–10', 90, 'Höften högt, sänk huvudet mot golvet mellan händerna.'),

  ex('curl', 'Bicepscurl', 'Armar', true, 3, '10–12', 60, 'Armbågarna stilla mot sidan, sänk långsamt.'),
  ex('hammer-curl', 'Hammercurl', 'Armar', true, 2, '10–12', 60, 'Tummarna uppåt hela vägen.'),
  ex('pushdown', 'Triceps pushdown', 'Armar', false, 3, '10–12', 60, 'Armbågarna låsta vid sidan, sträck ut helt.'),
  ex('overhead-ext', 'Tricepspress över huvudet', 'Armar', true, 2, '10–12', 60, 'Armbågarna pekar framåt, sänk vikten bakom huvudet.'),
  ex('close-pushup', 'Smala armhävningar', 'Armar', true, 3, '8–12', 75, 'Händerna under axlarna och armbågarna tätt intill kroppen.'),

  ex('plank', 'Planka', 'Bål', true, 3, '45 s', 45, 'Rak linje från huvud till hälar, spänn magen och sätet.'),
  ex('side-plank', 'Sidoplanka', 'Bål', true, 3, '30 s per sida', 45, 'Höften högt och kroppen rak.'),
  ex('dead-bug', 'Dead bug', 'Bål', true, 3, '10 per sida', 45, 'Ländryggen i golvet medan motsatt arm och ben sträcks ut.'),
  ex('pallof', 'Pallof press', 'Bål', true, 3, '10 per sida', 45, 'Pressa ut och låt inte bandet vrida dig.'),
  ex('russian', 'Rysk twist', 'Bål', true, 3, '20', 45, 'Luta bakåt med rak rygg och vrid från bålen.'),
  ex('hanging-leg', 'Hängande benlyft', 'Bål', false, 3, '8–12', 60, 'Lyft benen utan att gunga, sänk långsamt.'),
  ex('core-rot', 'Bålrotation med gummiband', 'Bål', true, 3, '12 per sida', 45, 'Rotera från bålen med raka armar.'),
  ex('hollow', 'Hollow hold', 'Bål', true, 3, '30 s', 45, 'Ländryggen i golvet, armar och ben sträckta strax ovanför.'),
  ex('ab-wheel', 'Ab wheel', 'Bål', true, 3, '8–10', 60, 'Rulla ut så långt du kan med rak rygg och dra tillbaka med magen.'),
  ex('crunch', 'Crunches', 'Bål', true, 3, '15', 45, 'Rulla upp skulderbladen från golvet, inte hela ryggen.'),
  ex('bicycle-crunch', 'Cykelcrunch', 'Bål', true, 3, '20', 45, 'Motsatt armbåge mot knät, långsamt och kontrollerat.'),
  ex('farmer-carry', 'Farmer walk', 'Bål', true, 3, '40 m', 75, 'Tunga vikter, rak hållning och korta, stadiga steg.'),

  ex('box-jump', 'Boxhopp', 'Explosivt', false, 3, '5–6', 90, 'Hoppa upp och landa mjukt, kliv ner.'),
  ex('lateral-hop', 'Sidohopp', 'Explosivt', true, 3, '10', 60, 'Snabba hopp åt sidan och landa mjukt på framfoten.'),
  ex('kb-swing', 'Kettlebell swing', 'Explosivt', true, 3, '15', 75, 'Kraften kommer från höften, armarna bara håller i.'),
  ex('med-ball', 'Medicinbollskast', 'Explosivt', false, 3, '8', 75, 'Från knäböj, kasta bollen högt med hela kroppen.'),
  ex('burpee', 'Burpees', 'Explosivt', true, 3, '10', 75, 'Ner i planka, upp och hoppa med armarna över huvudet.'),
  ex('squat-jump', 'Hopp upp från knäböj', 'Explosivt', true, 3, '8', 75, 'Explosivt upp, landa mjukt och gå direkt ner igen.'),

  ex('thruster', 'Thrusters', 'CrossFit', true, 3, '10', 90, 'Frontböj ner och pressa stången över huvudet i samma rörelse när du reser dig.'),
  ex('clean', 'Frivändning', 'CrossFit', false, 5, '3', 120, 'Lyft från golvet, sträck explosivt i höften och ta emot stången på axlarna.'),
  ex('push-press', 'Push press', 'CrossFit', true, 3, '8', 90, 'En kort dipp i knäna och driv vikten upp över huvudet med benen.'),
  ex('wall-ball', 'Wall balls', 'CrossFit', false, 3, '15', 75, 'Knäböj med bollen mot bröstet och kasta den mot målet på väggen när du reser dig.'),
  ex('sit-up', 'Sit-ups', 'CrossFit', true, 3, '15', 45, 'Rulla upp hela vägen till sittande och rör tårna, ner kontrollerat.'),
  ex('toes-to-bar', 'Toes to bar', 'CrossFit', false, 3, '8–12', 75, 'Häng i stången och lyft fötterna upp till stången med spänd mage.'),
  ex('double-under', 'Double unders', 'CrossFit', true, 3, '30', 45, 'Lite högre hopp och snabba handleder, repet passerar två gånger per hopp.'),

  ex('step-down', 'Step-down', 'Stabilitet', true, 3, '10 per ben', 60, 'Sänk långsamt det fria benet mot golvet, knät rakt fram.'),
  ex('balance', 'Enbensbalans', 'Stabilitet', true, 3, '30 s per ben', 30, 'Stå stilla på ett ben, blunda för mer utmaning.'),
  ex('hip-abd', 'Höftabduktion med band', 'Stabilitet', true, 3, '15 per ben', 45, 'För benet ut åt sidan utan att luta överkroppen.'),
  ex('monster', 'Monster walk', 'Stabilitet', true, 3, '12 steg per håll', 45, 'Halvböj och band runt knäna, gå i sidled med spänt band.'),
  ex('nordic', 'Nordic hamstring', 'Stabilitet', true, 3, '5', 120, 'Fötterna fasthållna, fall framåt så långsamt du kan.'),
  ex('copenhagen', 'Copenhagen plank', 'Stabilitet', true, 3, '20 s per sida', 45, 'Övre foten på bänken, lyft höften och håll.'),

  ex('jumping-jack', 'Jumping jacks', 'Kondition', true, 3, '40 s', 20, 'Lätta, snabba hopp med armarna över huvudet.'),
  ex('high-knees', 'Höga knän', 'Kondition', true, 3, '30 s', 30, 'Snabba steg och knäna upp till höfthöjd.'),
  ex('mountain-climber', 'Mountain climbers', 'Kondition', true, 3, '30 s', 30, 'Rak planka och dra knäna växelvis mot bröstet.'),
  ex('rower', 'Roddmaskin', 'Kondition', false, 4, '500 m', 90, 'Ben, sedan rygg, sedan armar. Tillbaka i omvänd ordning.'),
  ex('jump-rope', 'Hopprep', 'Kondition', true, 4, '1 min', 30, 'Små hopp på framfoten, rotera repet med handlederna.'),
]

export const exerciseById = (id: string) => EXERCISES.find((e) => e.id === id)

// Visningsnamn: egna övningar har sitt eget namn, övriga översätts från biblioteket
export const exerciseName = (e: Exercise, t: (s: string) => string) => (e.name ? e.name : t(exerciseById(e.id)?.name ?? e.id))

// Ny övning med bibliotekets förval
export const newExercise = (id: string): Exercise => {
  const d = exerciseById(id)!
  return { id, sets: d.sets, reps: d.reps, rest: d.rest }
}

// Färdig lista från [id, set, reps]
export const list = (...items: [string, number, string][]): Exercise[] =>
  items.map(([id, sets, reps]) => ({ id, sets, reps, rest: exerciseById(id)?.rest ?? 90 }))

// Grov tidsuppskattning: uppvärmning plus arbete och vila per set
export const estimateMinutes = (items: { sets: number; rest?: number }[]) =>
  Math.max(15, Math.round((8 + items.reduce((a, e) => a + e.sets * (0.75 + (e.rest ?? 90) / 60), 0)) / 5) * 5)
