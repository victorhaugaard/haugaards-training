// Animationer per övning (id i övningsbiblioteket). Koordinater i en 100×100-ruta, golvet på y = 92.
// Sidovy: figuren tittar åt höger. Se lib/anim.ts för hur nyckelpositionerna tolkas.
import type { Anim, Equip, FrontPose, Pt, SidePose } from './anim'

type O = Omit<Anim, 'frames'>
const side = (frames: SidePose[], o: O = {}): Anim => ({ view: 'side', frames, ...o })
const front = (frames: FrontPose[], o: O = {}): Anim => ({ view: 'front', frames, ...o })

// Stående grundläge med händerna längs sidan
const stand = (p: Partial<SidePose> = {}): SidePose => ({ hip: [50, 54], sh: [50, 28], hand: [50, 56], foot: [50, 91], ...p })
const fstand = (p: Partial<FrontPose> = {}): FrontPose => ({
  x: 50,
  hipY: 54,
  shY: 26,
  hands: [
    [41, 54],
    [59, 54],
  ],
  feet: [
    [45, 91],
    [55, 91],
  ],
  ...p,
})

const bench: Equip = { t: 'rect', x: 22, y: 72, w: 50, h: 6 }
const legs = (x: number): Equip => ({ t: 'line', a: [x, 78], b: [x, 92] })

const A: Record<string, Anim> = {
  // ——— Ben ———
  squat: side([
    stand({ hand: [76, 30] }),
    { hip: [38, 73], sh: [56, 54], hand: [82, 55], foot: [52, 91] },
  ]),
  'goblet-squat': side(
    [
      stand({ hand: [60, 40] }),
      { hip: [38, 73], sh: [56, 54], hand: [64, 62], foot: [52, 91] },
    ],
    { eq: [{ t: 'kb', at: 'hand' }], elbow: [0, 1] },
  ),
  deadlift: side(
    [
      stand({ hip: [48, 54], sh: [49, 28], hand: [50, 57] }),
      { hip: [35, 66], sh: [60, 55], hand: [56, 82], foot: [50, 91] },
    ],
    { eq: [{ t: 'bar', at: 'hand' }], dur: 2.8 },
  ),
  rdl2: side(
    [
      stand({ hand: [51, 57] }),
      { hip: [40, 56], sh: [65, 50], hand: [62, 76], foot: [50, 91] },
    ],
    { eq: [{ t: 'bar', at: 'hand' }], dur: 2.8 },
  ),
  lunge: side(
    [
      stand({ foot: [54, 91], foot2: [46, 91] }),
      { hip: [46, 70], sh: [47, 44], hand: [47, 71], foot: [64, 91], foot2: [26, 91] },
    ],
    { eq: [{ t: 'db', at: 'hand' }] },
  ),
  bulgarian: side(
    [
      { hip: [52, 56], sh: [52, 30], hand: [52, 58], foot: [62, 91], foot2: [20, 75], toe2: [14, 76] },
      { hip: [48, 71], sh: [51, 45], hand: [51, 72], foot: [64, 91], foot2: [20, 75], toe2: [14, 76] },
    ],
    { eq: [{ t: 'rect', x: 4, y: 76, w: 24, h: 6 }, legs(16), { t: 'db', at: 'hand' }] },
  ),
  'single-squat': side(
    [
      { hip: [50, 54], sh: [50, 28], hand: [74, 34], foot: [52, 91], foot2: [62, 84] },
      { hip: [38, 74], sh: [55, 54], hand: [80, 56], foot: [52, 91], foot2: [80, 79] },
    ],
    { knee2: [1, -1] },
  ),
  rdl: side(
    [
      stand({ foot2: [48, 91] }),
      { hip: [48, 58], sh: [74, 55], hand: [73, 82], foot: [52, 91], foot2: [12, 56], toe2: [10, 50] },
    ],
    { eq: [{ t: 'db', at: 'hand' }], knee2: [0, 1], dur: 3 },
  ),
  calf: side(
    [
      stand({ toe: [56, 92] }),
      stand({ hip: [50, 48], sh: [50, 22], hand: [50, 50], foot: [50, 85], toe: [56, 92] }),
    ],
    { dur: 1.8 },
  ),
  'leg-press': side(
    [
      { hip: [36, 76], sh: [22, 54], hand: [46, 78], foot: [56, 54] },
      { hip: [36, 76], sh: [22, 54], hand: [46, 78], foot: [68, 44] },
    ],
    { eq: [{ t: 'line', a: [14, 52], b: [32, 82] }, { t: 'line', a: [28, 82], b: [48, 82] }, { t: 'pad', at: 'foot' }], knee: [0, -1], elbow: [0, 1], dur: 2.6 },
  ),
  bridge: side(
    [
      { hip: [50, 86], sh: [24, 86], hand: [50, 90], foot: [68, 91] },
      { hip: [50, 72], sh: [26, 86], hand: [50, 90], foot: [68, 91] },
    ],
    { knee: [0, -1] },
  ),
  'hip-thrust': side(
    [
      { hip: [50, 84], sh: [26, 70], hand: [50, 82], foot: [68, 91] },
      { hip: [50, 66], sh: [26, 70], hand: [50, 64], foot: [68, 91] },
    ],
    { eq: [{ t: 'rect', x: 4, y: 72, w: 24, h: 6 }, legs(16), { t: 'bar', at: 'hand' }], knee: [0, -1] },
  ),
  'step-up': side(
    [
      { hip: [40, 54], sh: [40, 28], hand: [40, 56], foot: [58, 73], foot2: [40, 91] },
      { hip: [58, 38], sh: [58, 12], hand: [58, 40], foot: [60, 73], foot2: [62, 60] },
    ],
    { eq: [{ t: 'rect', x: 50, y: 74, w: 28, h: 18 }], knee2: [1, -1], dur: 2.6 },
  ),
  'leg-curl': side(
    [
      { hip: [44, 68], sh: [70, 66], hand: [84, 72], foot: [8, 66], toe: [6, 72] },
      { hip: [44, 68], sh: [70, 66], hand: [84, 72], foot: [34, 44], toe: [38, 40] },
    ],
    { eq: [{ t: 'rect', x: 8, y: 72, w: 78, h: 5 }, legs(20), legs(74)], knee: [0, 1] },
  ),
  'leg-ext': side(
    [
      { hip: [40, 62], sh: [36, 36], hand: [42, 66], foot: [60, 82] },
      { hip: [40, 62], sh: [36, 36], hand: [42, 66], foot: [77, 58] },
    ],
    { eq: [{ t: 'line', a: [28, 66], b: [56, 66] }, { t: 'line', a: [30, 40], b: [32, 66] }, { t: 'pad', at: 'foot' }], knee: [1, -1] },
  ),

  // ——— Rygg ———
  'barbell-row': side(
    [
      { hip: [40, 60], sh: [65, 48], hand: [63, 76], foot: [48, 91] },
      { hip: [40, 60], sh: [65, 48], hand: [58, 62], foot: [48, 91] },
    ],
    { eq: [{ t: 'bar', at: 'hand' }], elbow: [-1, -0.6] },
  ),
  'db-row': side(
    [
      { hip: [34, 60], sh: [60, 54], hand: [60, 80], hand2: [74, 70], foot: [42, 91], foot2: [26, 91] },
      { hip: [34, 60], sh: [60, 54], hand: [54, 62], hand2: [74, 70], foot: [42, 91], foot2: [26, 91] },
    ],
    { eq: [{ t: 'rect', x: 66, y: 71, w: 26, h: 5 }, legs(84), { t: 'db', at: 'hand' }], elbow: [-1, -0.6] },
  ),
  pullup: side(
    [
      { hip: [50, 64], sh: [51, 38], hand: [53, 12], foot: [38, 86] },
      { hip: [48, 46], sh: [50, 21], hand: [53, 12], foot: [36, 70] },
    ],
    { eq: [{ t: 'line', a: [34, 12], b: [72, 12] }], elbow: [1, 1], knee: [1, 0.5], dur: 2.6 },
  ),
  lat: side(
    [
      { hip: [46, 70], sh: [44, 44], hand: [52, 16], foot: [70, 91] },
      { hip: [46, 70], sh: [42, 44], hand: [52, 42], foot: [70, 91] },
    ],
    { eq: [{ t: 'cable', from: [52, 2], at: 'hand' }, { t: 'line', a: [34, 72], b: [56, 72] }], elbow: [-0.5, 1], knee: [1, -1] },
  ),
  'cable-row': side(
    [
      { hip: [36, 82], sh: [48, 57], hand: [70, 64], foot: [70, 82], toe: [70, 76] },
      { hip: [36, 82], sh: [32, 56], hand: [44, 66], foot: [70, 82], toe: [70, 76] },
    ],
    { eq: [{ t: 'cable', from: [96, 72], at: 'hand' }, { t: 'line', a: [24, 85], b: [50, 85] }, { t: 'line', a: [73, 74], b: [73, 90] }], knee: [0, -1], elbow: [-1, 0] },
  ),
  'inverted-row': side(
    [
      { hip: [50, 82], sh: [75, 76], hand: [74, 50], foot: [14, 90] },
      { hip: [47, 73], sh: [70, 59], hand: [74, 50], foot: [14, 90] },
    ],
    { eq: [{ t: 'line', a: [62, 50], b: [86, 50] }, { t: 'line', a: [84, 50], b: [84, 92] }], elbow: [-1, 0.6], knee: [0, -1] },
  ),
  'back-ext': side(
    [
      { hip: [50, 58], sh: [64, 80], hand: [60, 72], foot: [24, 80] },
      { hip: [50, 58], sh: [76, 56], hand: [70, 50], foot: [24, 80] },
    ],
    { eq: [{ t: 'line', a: [44, 63], b: [56, 63] }, { t: 'line', a: [48, 63], b: [40, 92] }, { t: 'line', a: [20, 85], b: [30, 78] }], elbow: [1, 1], knee: [0, 1], dur: 2.8 },
  ),
  'good-morning': side(
    [
      stand({ hand: [46, 30] }),
      { hip: [44, 56], sh: [69, 48], hand: [64, 47], foot: [50, 91] },
    ],
    { eq: [{ t: 'bar', at: 'hand' }], elbow: [-0.3, 1], dur: 2.8 },
  ),
  'face-pull': side(
    [
      { hip: [42, 54], sh: [42, 28], hand: [68, 32], foot: [44, 91], foot2: [36, 91] },
      { hip: [42, 54], sh: [42, 28], hand: [48, 24], foot: [44, 91], foot2: [36, 91] },
    ],
    { eq: [{ t: 'cable', from: [96, 28], at: 'hand' }], elbow: [-0.3, -1] },
  ),
  superman: side(
    [
      { hip: [48, 88], sh: [74, 88], hand: [96, 88], foot: [12, 90] },
      { hip: [48, 88], sh: [73, 81], hand: [95, 73], foot: [13, 81] },
    ],
    { knee: [0, 1] },
  ),
  'band-pole': side(
    [
      { hip: [44, 54], sh: [46, 28], hand: [70, 16], foot: [48, 91] },
      { hip: [40, 58], sh: [58, 40], hand: [44, 72], foot: [48, 91] },
    ],
    { eq: [{ t: 'band', from: [96, 6], at: 'hand' }], elbow: [1, 0] },
  ),

  // ——— Bröst ———
  bench: side(
    [
      { hip: [36, 70], sh: [62, 70], hand: [63, 42], foot: [22, 91] },
      { hip: [36, 70], sh: [62, 70], hand: [62, 63], foot: [22, 91] },
    ],
    { eq: [bench, legs(30), legs(66), { t: 'bar', at: 'hand' }], elbow: [-1, 1], knee: [-1, -1] },
  ),
  'incline-press': side(
    [
      { hip: [34, 80], sh: [48, 58], hand: [62, 32], foot: [54, 91] },
      { hip: [34, 80], sh: [48, 58], hand: [57, 52], foot: [54, 91] },
    ],
    { eq: [{ t: 'line', a: [24, 86], b: [44, 52] }, { t: 'line', a: [30, 84], b: [30, 92] }, { t: 'db', at: 'hand' }], elbow: [-1, 1], knee: [0, -1] },
  ),
  pushup: side(
    [
      { hip: [54, 77], sh: [78, 66], hand: [77, 91], foot: [20, 91] },
      { hip: [56, 84], sh: [81, 80], hand: [77, 91], foot: [20, 91] },
    ],
    { elbow: [-1, -0.4], knee: [0, -1] },
  ),
  'close-pushup': side(
    [
      { hip: [54, 77], sh: [78, 66], hand: [75, 91], foot: [20, 91] },
      { hip: [56, 84], sh: [81, 80], hand: [75, 91], foot: [20, 91] },
    ],
    { elbow: [-1, -0.1], knee: [0, -1] },
  ),
  dips: side(
    [
      { hip: [48, 57], sh: [50, 31], hand: [52, 56], foot: [34, 78] },
      { hip: [45, 68], sh: [54, 44], hand: [52, 56], foot: [30, 88] },
    ],
    { eq: [{ t: 'line', a: [40, 57], b: [64, 57] }, { t: 'line', a: [62, 57], b: [62, 92] }], elbow: [-1, -0.3], knee: [1, 1] },
  ),
  'bench-dip': side(
    [
      { hip: [36, 62], sh: [34, 36], hand: [28, 62], foot: [74, 91] },
      { hip: [36, 76], sh: [36, 50], hand: [28, 62], foot: [74, 91] },
    ],
    { eq: [{ t: 'rect', x: 10, y: 63, w: 22, h: 5 }, legs(16)], elbow: [-1, -1], knee: [0, -1] },
  ),

  // ——— Axlar ———
  'shoulder-press': side(
    [
      stand({ hand: [54, 26] }),
      stand({ hand: [52, 2] }),
    ],
    { eq: [{ t: 'db', at: 'hand' }], elbow: [0.6, 1] },
  ),
  'lateral-raise': front(
    [
      fstand(),
      fstand({
        hands: [
          [20, 30],
          [80, 30],
        ],
      }),
    ],
    { eq: [{ t: 'db', at: 'hand' }, { t: 'db', at: 'hand2' }] },
  ),
  'rear-fly': side(
    [
      { hip: [42, 58], sh: [66, 50], hand: [64, 76], foot: [48, 91] },
      { hip: [42, 58], sh: [66, 50], hand: [60, 52], foot: [48, 91] },
    ],
    { eq: [{ t: 'db', at: 'hand' }], elbow: [0, 1] },
  ),
  'pike-pushup': side(
    [
      { hip: [46, 52], sh: [64, 70], hand: [72, 91], foot: [28, 91] },
      { hip: [46, 55], sh: [64, 76], hand: [72, 91], foot: [28, 91] },
    ],
    { elbow: [-1, -0.5], knee: [-1, 0] },
  ),

  // ——— Armar ———
  curl: side(
    [
      stand({ hand: [51, 57] }),
      stand({ hand: [60, 33] }),
    ],
    { eq: [{ t: 'db', at: 'hand' }], elbow: [-1, 0.3] },
  ),
  pushdown: side(
    [
      stand({ hand: [62, 40] }),
      stand({ hand: [52, 57] }),
    ],
    { eq: [{ t: 'cable', from: [62, 2], at: 'hand' }], elbow: [-1, 0] },
  ),
  'overhead-ext': side(
    [
      stand({ hand: [42, 22] }),
      stand({ hand: [53, 1] }),
    ],
    { eq: [{ t: 'db', at: 'hand' }], elbow: [1, -1] },
  ),

  // ——— Bål ———
  plank: side(
    [
      { hip: [54, 81], sh: [79, 78], hand: [90, 90], foot: [18, 91] },
      { hip: [54, 79], sh: [79, 78], hand: [90, 90], foot: [18, 91] },
    ],
    { elbow: [0, 1], knee: [0, -1], dur: 3.2 },
  ),
  'side-plank': side(
    [
      { hip: [48, 77], sh: [72, 68], hand: [74, 91], hand2: [76, 44], foot: [16, 91] },
      { hip: [48, 74], sh: [72, 67], hand: [74, 91], hand2: [76, 42], foot: [16, 91] },
    ],
    { knee: [0, -1], dur: 3.2 },
  ),
  'dead-bug': side(
    [
      { hip: [40, 86], sh: [66, 86], hand: [66, 60], hand2: [66, 60], foot: [58, 68], foot2: [58, 68] },
      { hip: [40, 86], sh: [66, 86], hand: [90, 84], hand2: [66, 60], foot: [4, 82], foot2: [58, 68] },
    ],
    { knee: [-0.5, -1], elbow: [0, -1], dur: 2.8 },
  ),
  pallof: side(
    [
      { hip: [46, 56], sh: [46, 30], hand: [56, 40], foot: [50, 91], foot2: [40, 91] },
      { hip: [46, 56], sh: [46, 30], hand: [74, 38], foot: [50, 91], foot2: [40, 91] },
    ],
    { eq: [{ t: 'band', from: [96, 46], at: 'hand' }], elbow: [0, 1] },
  ),
  'core-rot': front(
    [
      fstand({
        hands: [
          [34, 40],
          [38, 40],
        ],
        feet: [
          [40, 91],
          [60, 91],
        ],
      }),
      fstand({
        hands: [
          [62, 40],
          [66, 40],
        ],
        feet: [
          [40, 91],
          [60, 91],
        ],
      }),
    ],
    { eq: [{ t: 'band', from: [2, 40], at: 'hand2' }] },
  ),
  russian: side(
    [
      { hip: [46, 86], sh: [32, 64], hand: [56, 72], foot: [70, 74] },
      { hip: [46, 86], sh: [32, 64], hand: [42, 84], foot: [70, 74] },
    ],
    { eq: [{ t: 'ball', at: 'hand' }], knee: [0, -1], elbow: [0, 1], dur: 1.8 },
  ),
  'hanging-leg': side(
    [
      { hip: [50, 54], sh: [51, 28], hand: [52, 2], foot: [50, 90] },
      { hip: [53, 54], sh: [49, 28], hand: [52, 2], foot: [90, 52] },
    ],
    { eq: [{ t: 'line', a: [36, 2], b: [68, 2] }], dur: 2.8 },
  ),
  hollow: side(
    [
      { hip: [48, 86], sh: [71, 80], hand: [93, 73], foot: [10, 79] },
      { hip: [48, 87], sh: [71, 81], hand: [93, 75], foot: [10, 81] },
    ],
    { knee: [0, 1], dur: 3.2 },
  ),
  'ab-wheel': side(
    [
      { hip: [40, 72], sh: [60, 56], hand: [64, 85], foot: [22, 90] },
      { hip: [50, 80], sh: [75, 76], hand: [90, 85], foot: [22, 90] },
    ],
    { eq: [{ t: 'wheel', at: 'hand' }], knee: [0, 1], dur: 3 },
  ),
  crunch: side(
    [
      { hip: [44, 86], sh: [18, 86], hand: [12, 80], foot: [62, 91] },
      { hip: [44, 86], sh: [24, 72], hand: [18, 66], foot: [62, 91] },
    ],
    { knee: [0, -1], elbow: [1, -1] },
  ),
  'bicycle-crunch': side(
    [
      { hip: [44, 86], sh: [22, 78], hand: [16, 72], foot: [66, 70], foot2: [80, 82] },
      { hip: [44, 86], sh: [22, 78], hand: [16, 72], foot: [80, 82], foot2: [66, 70] },
    ],
    { knee: [0, -1], elbow: [1, -1], dur: 1.6 },
  ),
  'mountain-climber': side(
    [
      { hip: [50, 76], sh: [74, 66], hand: [76, 91], foot: [56, 86], foot2: [20, 91] },
      { hip: [50, 76], sh: [74, 66], hand: [76, 91], foot: [20, 91], foot2: [56, 86] },
    ],
    { knee: [1, 0], dur: 0.9 },
  ),
  'farmer-carry': side(
    [
      stand({ hand: [50, 58], foot: [60, 91], foot2: [42, 91] }),
      stand({ hip: [50, 52], sh: [50, 26], hand: [50, 56], foot: [50, 91], foot2: [54, 86] }),
      stand({ hand: [50, 58], foot: [42, 91], foot2: [60, 91] }),
      stand({ hip: [50, 52], sh: [50, 26], hand: [50, 56], foot: [54, 86], foot2: [50, 91] }),
    ],
    { eq: [{ t: 'kb', at: 'hand' }], dur: 1.6 },
  ),

  // ——— Explosivt ———
  'box-jump': side(
    [
      { hip: [36, 72], sh: [50, 52], hand: [30, 70], foot: [44, 91] },
      { hip: [54, 40], sh: [60, 15], hand: [72, 6], foot: [58, 62] },
      { hip: [68, 54], sh: [80, 32], hand: [92, 40], foot: [74, 69] },
      { hip: [54, 40], sh: [60, 15], hand: [72, 6], foot: [58, 62] },
    ],
    { eq: [{ t: 'rect', x: 62, y: 70, w: 26, h: 22 }], dur: 2.6 },
  ),
  'lateral-hop': front(
    [
      fstand({ x: 36, hipY: 60, shY: 33, hands: [[28, 58], [44, 58]], feet: [[32, 91], [40, 91]] }),
      fstand({ x: 50, hipY: 46, shY: 18, hands: [[40, 40], [60, 40]], feet: [[46, 82], [54, 82]] }),
      fstand({ x: 64, hipY: 60, shY: 33, hands: [[56, 58], [72, 58]], feet: [[60, 91], [68, 91]] }),
      fstand({ x: 50, hipY: 46, shY: 18, hands: [[40, 40], [60, 40]], feet: [[46, 82], [54, 82]] }),
    ],
    { dur: 1.6 },
  ),
  'kb-swing': side(
    [
      { hip: [40, 60], sh: [63, 50], hand: [48, 82], foot: [50, 91] },
      stand({ hip: [48, 54], sh: [48, 28], hand: [74, 30] }),
    ],
    { eq: [{ t: 'kb', at: 'hand' }], dur: 1.8 },
  ),
  'med-ball': side(
    [
      { hip: [40, 71], sh: [54, 50], hand: [62, 52], foot: [52, 91] },
      stand({ hip: [50, 52], sh: [51, 26], hand: [56, 0], foot: [52, 89] }),
    ],
    { eq: [{ t: 'ball', at: 'hand' }], elbow: [0, 1], dur: 2 },
  ),
  burpee: side(
    [
      stand(),
      { hip: [44, 74], sh: [62, 63], hand: [66, 91], foot: [50, 91] },
      { hip: [44, 79], sh: [69, 70], hand: [68, 91], foot: [16, 91] },
      { hip: [44, 74], sh: [62, 63], hand: [66, 91], foot: [50, 91] },
      stand({ hip: [50, 44], sh: [50, 18], hand: [54, -4], foot: [50, 82] }),
    ],
    { knee: [1, 0], dur: 3.2 },
  ),
  'squat-jump': side(
    [
      { hip: [38, 73], sh: [56, 54], hand: [32, 70], foot: [52, 91] },
      stand({ hip: [50, 42], sh: [51, 16], hand: [56, -4], foot: [50, 80], toe: [52, 86] }),
    ],
    { dur: 1.6 },
  ),

  // ——— CrossFit ———
  thruster: side(
    [
      { hip: [38, 73], sh: [55, 53], hand: [62, 52], foot: [52, 91] },
      stand({ hand: [52, 1] }),
    ],
    { eq: [{ t: 'bar', at: 'hand' }], elbow: [1, 1], dur: 2 },
  ),
  clean: side(
    [
      { hip: [35, 66], sh: [60, 55], hand: [57, 82], foot: [50, 91] },
      stand({ hip: [50, 52], sh: [52, 26], hand: [52, 54], foot: [50, 89], toe: [56, 92] }),
      { hip: [44, 62], sh: [50, 37], hand: [57, 36], foot: [52, 91] },
    ],
    { eq: [{ t: 'bar', at: 'hand' }], elbow: [1, 0.6], dur: 2.6 },
  ),
  'sit-up': side(
    [
      { hip: [44, 86], sh: [18, 86], hand: [10, 82], foot: [64, 91] },
      { hip: [44, 86], sh: [56, 62], hand: [68, 80], foot: [64, 91] },
    ],
    { knee: [0, -1], elbow: [0, 1], dur: 2 },
  ),

  // ——— Stabilitet ———
  'step-down': side(
    [
      { hip: [46, 40], sh: [46, 14], hand: [70, 20], foot: [46, 77], foot2: [56, 74] },
      { hip: [40, 54], sh: [54, 30], hand: [76, 34], foot: [44, 77], foot2: [64, 91] },
    ],
    { eq: [{ t: 'rect', x: 28, y: 78, w: 28, h: 14 }], knee2: [1, -0.3], dur: 2.6 },
  ),
  balance: side(
    [
      { hip: [50, 54], sh: [50, 28], hand: [72, 36], hand2: [28, 36], foot: [50, 91], foot2: [44, 72] },
      { hip: [51, 54], sh: [52, 28], hand: [73, 34], hand2: [30, 38], foot: [50, 91], foot2: [46, 70] },
    ],
    { knee2: [1, 0], dur: 3 },
  ),
  'hip-abd': front(
    [
      fstand({ hands: [[42, 52], [58, 52]] }),
      fstand({ hands: [[42, 52], [58, 52]], feet: [[45, 91], [74, 84]] }),
    ],
    { eq: [{ t: 'band', from: [45, 84], at: 'hand' }] },
  ),
  monster: front(
    [
      fstand({ x: 46, hipY: 60, shY: 33, hands: [[38, 58], [54, 58]], feet: [[34, 91], [58, 91]] }),
      fstand({ x: 52, hipY: 60, shY: 33, hands: [[44, 58], [60, 58]], feet: [[34, 91], [70, 91]] }),
      fstand({ x: 58, hipY: 60, shY: 33, hands: [[50, 58], [66, 58]], feet: [[46, 91], [70, 91]] }),
      fstand({ x: 52, hipY: 60, shY: 33, hands: [[44, 58], [60, 58]], feet: [[34, 91], [70, 91]] }),
    ],
    { dur: 2.4 },
  ),
  nordic: side(
    [
      { hip: [50, 71], sh: [50, 45], hand: [58, 55], foot: [31, 90], toe: [27, 92] },
      { hip: [64, 78], sh: [84, 61], hand: [88, 80], foot: [31, 90], toe: [27, 92] },
    ],
    { knee: [0, 1], elbow: [0, 1], dur: 3 },
  ),
  copenhagen: side(
    [
      { hip: [46, 77], sh: [70, 68], hand: [72, 91], hand2: [72, 50], foot: [16, 68] },
      { hip: [46, 72], sh: [70, 66], hand: [72, 91], hand2: [72, 48], foot: [16, 68] },
    ],
    { eq: [{ t: 'rect', x: 4, y: 70, w: 22, h: 6 }, legs(14)], knee: [0, -1], dur: 3 },
  ),

  // ——— Kondition ———
  'jumping-jack': front(
    [
      fstand(),
      fstand({ hipY: 52, shY: 24, hands: [[24, 6], [76, 6]], feet: [[32, 89], [68, 89]] }),
    ],
    { dur: 1 },
  ),
  'high-knees': side(
    [
      { hip: [50, 54], sh: [52, 28], hand: [62, 40], hand2: [40, 50], foot: [50, 91], foot2: [62, 70] },
      { hip: [50, 54], sh: [52, 28], hand: [40, 50], hand2: [62, 40], foot: [62, 70], foot2: [50, 91] },
    ],
    { knee: [1, -0.5], elbow: [0, 1], dur: 0.8 },
  ),
  rower: side(
    [
      { hip: [32, 82], sh: [46, 59], hand: [64, 70], foot: [62, 82], toe: [64, 76] },
      { hip: [14, 82], sh: [6, 58], hand: [24, 68], foot: [62, 82], toe: [64, 76] },
    ],
    { eq: [{ t: 'line', a: [4, 87], b: [72, 87] }, { t: 'cable', from: [76, 72], at: 'hand' }], knee: [0, -1], elbow: [-1, 0.5], dur: 2.2 },
  ),
  'jump-rope': front(
    [
      fstand({ hipY: 54, shY: 26, hands: [[36, 56], [64, 56]], feet: [[46, 91], [54, 91]] }),
      fstand({ hipY: 49, shY: 21, hands: [[36, 51], [64, 51]], feet: [[46, 85], [54, 85]] }),
    ],
    { dur: 0.6 },
  ),
}

// Övningar som delar animation med en annan
const ALIAS: Record<string, string> = {
  'hammer-curl': 'curl',
  'ohp': 'shoulder-press',
  'push-press': 'shoulder-press',
  'wall-ball': 'med-ball',
  'toes-to-bar': 'hanging-leg',
  'double-under': 'jump-rope',
}

export const animFor = (id: string): Anim | undefined => A[id] ?? A[ALIAS[id] ?? '']

export type { Pt }
