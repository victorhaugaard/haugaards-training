// Motor för övningsanimationerna: en enkel figur (sidovy eller framifrån) i en 100×100-ruta.
// Varje övning beskrivs av några nyckelpositioner. Mellan dem interpoleras punkterna och armar/ben
// räknas fram med tvåleds-IK, så att lemmarna behåller sin längd. Resultatet blir SMIL-värden.

export type Pt = [number, number]

// Sidovy, figuren tittar åt höger. Mål för händer och fötter, armbågar/knän räknas fram.
export interface SidePose {
  hip: Pt
  sh: Pt // riktning från höften till axeln (längden normaliseras)
  hand: Pt
  foot: Pt
  hand2?: Pt // bortre armen/benet, annars samma som den närmre
  foot2?: Pt
  toe?: Pt
  toe2?: Pt
}

// Framifrån: x = kroppens mitt
export interface FrontPose {
  x: number
  hipY: number
  shY: number
  hands: [Pt, Pt]
  feet: [Pt, Pt]
}

export type Equip =
  | { t: 'bar' | 'db' | 'kb' | 'ball' | 'wheel'; at: 'hand' | 'hand2' | 'sh' | 'hip' }
  | { t: 'cable' | 'band'; from: Pt; at: 'hand' | 'hand2' }
  | { t: 'pad'; at: 'foot' }
  | { t: 'rect'; x: number; y: number; w: number; h: number }
  | { t: 'line'; a: Pt; b: Pt }

export interface Anim {
  view?: 'side' | 'front'
  frames: (SidePose | FrontPose)[]
  dur?: number // sekunder för ett helt varv
  eq?: Equip[]
  elbow?: Pt // önskad riktning för armbågen (sidovy)
  knee?: Pt // önskad riktning för knät (sidovy)
  knee2?: Pt
}

const UA = 14
const FA = 13
const TH = 18.5
const SH = 18.5
const TORSO = 26

const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]]
const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]]
const mul = (a: Pt, k: number): Pt => [a[0] * k, a[1] * k]
const len = (a: Pt) => Math.hypot(a[0], a[1])
const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
const norm = (a: Pt): Pt => {
  const l = len(a) || 1
  return [a[0] / l, a[1] / l]
}

// Tvåleds-IK: led (armbåge/knä) och ände. pole väljer vilken sida leden böjer åt.
const ik = (root: Pt, target: Pt, a: number, b: number, pole: Pt): [Pt, Pt] => {
  const v = sub(target, root)
  let d = len(v)
  const u = norm(v)
  if (d >= a + b - 0.01) return [add(root, mul(u, a)), add(root, mul(u, a + b))]
  d = Math.max(d, Math.abs(a - b) + 0.5)
  const ang = Math.acos(Math.min(1, Math.max(-1, (a * a + d * d - b * b) / (2 * a * d))))
  const base = Math.atan2(u[1], u[0])
  const j1: Pt = add(root, [a * Math.cos(base + ang), a * Math.sin(base + ang)])
  const j2: Pt = add(root, [a * Math.cos(base - ang), a * Math.sin(base - ang)])
  const mid = lerp(root, target, 0.5)
  const dot = (j: Pt) => sub(j, mid)[0] * pole[0] + sub(j, mid)[1] * pole[1]
  const j = dot(j1) >= dot(j2) ? j1 : j2
  return [j, add(j, mul(norm(sub(target, j)), b))]
}

const isFront = (p: SidePose | FrontPose): p is FrontPose => 'hipY' in p

const lerpSide = (a: SidePose, b: SidePose, t: number): SidePose => ({
  hip: lerp(a.hip, b.hip, t),
  sh: lerp(a.sh, b.sh, t),
  hand: lerp(a.hand, b.hand, t),
  foot: lerp(a.foot, b.foot, t),
  hand2: lerp(a.hand2 ?? a.hand, b.hand2 ?? b.hand, t),
  foot2: lerp(a.foot2 ?? a.foot, b.foot2 ?? b.foot, t),
  ...(a.toe || b.toe ? { toe: lerp(a.toe ?? add(a.foot, [6, 1]), b.toe ?? add(b.foot, [6, 1]), t) } : {}),
  ...(a.toe2 || b.toe2 ? { toe2: lerp(a.toe2 ?? add(a.foot2 ?? a.foot, [6, 1]), b.toe2 ?? add(b.foot2 ?? b.foot, [6, 1]), t) } : {}),
})

const lerpFront = (a: FrontPose, b: FrontPose, t: number): FrontPose => ({
  x: a.x + (b.x - a.x) * t,
  hipY: a.hipY + (b.hipY - a.hipY) * t,
  shY: a.shY + (b.shY - a.shY) * t,
  hands: [lerp(a.hands[0], b.hands[0], t), lerp(a.hands[1], b.hands[1], t)],
  feet: [lerp(a.feet[0], b.feet[0], t), lerp(a.feet[1], b.feet[1], t)],
})

// En bildruta som färdiga punkter, redo att ritas
export interface Frame {
  head: Pt
  torso: Pt[]
  arm: Pt[]
  arm2: Pt[]
  leg: Pt[]
  leg2: Pt[]
  hand: Pt
  hand2: Pt
  sh: Pt
  hip: Pt
  foot: Pt
}

const solveSide = (p: SidePose, an: Anim): Frame => {
  const sh = add(p.hip, mul(norm(sub(p.sh, p.hip)), TORSO))
  const dirT = norm(sub(sh, p.hip))
  const head = add(sh, mul(dirT, 8))
  const elbowPole = an.elbow ?? [-1, 0.3]
  const [e1, h1] = ik(sh, p.hand, UA, FA, elbowPole)
  const [e2, h2] = ik(sh, p.hand2 ?? p.hand, UA, FA, elbowPole)
  const [k1, a1] = ik(p.hip, p.foot, TH, SH, an.knee ?? [1, 0])
  const [k2, a2] = ik(p.hip, p.foot2 ?? p.foot, TH, SH, an.knee2 ?? an.knee ?? [1, 0])
  const t1 = p.toe ?? add(a1, [6, 1])
  const t2 = p.toe2 ?? add(a2, [6, 1])
  return {
    head,
    torso: [p.hip, sh],
    arm: [sh, e1, h1],
    arm2: [sh, e2, h2],
    leg: [p.hip, k1, a1, t1],
    leg2: [p.hip, k2, a2, t2],
    hand: h1,
    hand2: h2,
    sh,
    hip: p.hip,
    foot: a1,
  }
}

const solveFront = (p: FrontPose): Frame => {
  const neck: Pt = [p.x, p.shY]
  const hipC: Pt = [p.x, p.hipY]
  const shL: Pt = [p.x - 7, p.shY + 2]
  const shR: Pt = [p.x + 7, p.shY + 2]
  const hpL: Pt = [p.x - 4.5, p.hipY]
  const hpR: Pt = [p.x + 4.5, p.hipY]
  const [eL, hL] = ik(shL, p.hands[0], 13, 12, [-1, 0])
  const [eR, hR] = ik(shR, p.hands[1], 13, 12, [1, 0])
  const [kL, aL] = ik(hpL, p.feet[0], 18, 18, [-1, 0])
  const [kR, aR] = ik(hpR, p.feet[1], 18, 18, [1, 0])
  return {
    head: [p.x, p.shY - 8],
    torso: [hipC, neck, shL, shR, neck],
    arm: [shR, eR, hR],
    arm2: [shL, eL, hL],
    leg: [hpR, kR, aR, add(aR, [3, 0])],
    leg2: [hpL, kL, aL, add(aL, [-3, 0])],
    hand: hR,
    hand2: hL,
    sh: neck,
    hip: hipC,
    foot: aR,
  }
}

const ease = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2

// Samplar hela varvet (nyckelpositionerna i ordning och tillbaka till den första)
export const sample = (an: Anim, steps = 10): Frame[] => {
  const fs = an.frames
  const out: Frame[] = []
  const n = fs.length
  for (let i = 0; i < n; i++) {
    const a = fs[i]
    const b = fs[(i + 1) % n]
    const k = n === 1 ? 1 : steps
    for (let s = 0; s < k; s++) {
      const t = ease(s / k)
      out.push(isFront(a) && isFront(b) ? solveFront(lerpFront(a, b, t)) : solveSide(lerpSide(a as SidePose, b as SidePose, t), an))
    }
  }
  out.push(out[0])
  return out
}
