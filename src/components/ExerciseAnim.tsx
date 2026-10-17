import { useMemo } from 'react'
import { sample, type Anim, type Frame, type Pt } from '../lib/anim'
import { animFor } from '../lib/exerciseAnims'

const f = (n: number) => n.toFixed(1)
const pts = (p: Pt[]) => p.map(([x, y]) => `${f(x)},${f(y)}`).join(' ')

const reduced = () => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

const cache = new Map<string, Frame[]>()
const framesFor = (key: string, an: Anim) => {
  let fr = cache.get(key)
  if (!fr) cache.set(key, (fr = sample(an)))
  return fr
}

// Animerad figur som visar övningen. still = visa bara första läget.
export function ExerciseAnim({ id, size = 48, still }: { id: string; size?: number; still?: boolean }) {
  const an = animFor(id)
  const frames = useMemo(() => (an ? framesFor(id, an) : null), [id, an])
  if (!an || !frames) return <GenericAnim size={size} />
  const play = !still && frames.length > 2 && !reduced()
  const dur = `${an.dur ?? 2.4}s`
  const first = frames[0]

  // Polyline vars punkter animeras genom alla bildrutor
  // Vanliga funktioner (inte komponenter), så att animationerna inte startar om när föräldern renderar om
  const poly = (key: string, className: string, get: (fr: Frame) => Pt[]) => (
    <polyline key={key} className={className} points={pts(get(first))}>
      {play && <animate attributeName="points" values={frames.map((fr) => pts(get(fr))).join(';')} dur={dur} repeatCount="indefinite" />}
    </polyline>
  )
  const dot = (key: string, className: string, r: number, get: (fr: Frame) => Pt) => (
    <circle key={key} className={className} r={r} cx={f(get(first)[0])} cy={f(get(first)[1])}>
      {play && (
        <>
          <animate attributeName="cx" values={frames.map((fr) => f(get(fr)[0])).join(';')} dur={dur} repeatCount="indefinite" />
          <animate attributeName="cy" values={frames.map((fr) => f(get(fr)[1])).join(';')} dur={dur} repeatCount="indefinite" />
        </>
      )}
    </circle>
  )
  const at = (k: 'hand' | 'hand2' | 'sh' | 'hip') => (fr: Frame) => fr[k]

  return (
    <svg className="xa" width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <line className="xa-floor" x1="4" y1="92.5" x2="96" y2="92.5" />
      {an.eq?.map((e, i) =>
        e.t === 'rect' ? (
          <rect key={i} className="xa-fix" x={e.x} y={e.y} width={e.w} height={e.h} rx="2" />
        ) : e.t === 'line' ? (
          <line key={i} className="xa-rail" x1={e.a[0]} y1={e.a[1]} x2={e.b[0]} y2={e.b[1]} />
        ) : null,
      )}
      {an.eq?.map((e, i) =>
        e.t === 'cable' || e.t === 'band' ? poly('c' + i, 'xa-cable' + (e.t === 'band' ? ' band' : ''), (fr) => [e.from, fr[e.at]]) : null,
      )}
      {poly('leg2', an.view === 'front' ? 'xa-body' : 'xa-far', (fr) => fr.leg2)}
      {poly('arm2', an.view === 'front' ? 'xa-body' : 'xa-far', (fr) => fr.arm2)}
      {poly('torso', 'xa-body', (fr) => fr.torso)}
      {poly('leg', 'xa-body', (fr) => fr.leg)}
      {dot('head', 'xa-head', 5.5, (fr) => fr.head)}
      {poly('arm', 'xa-body', (fr) => fr.arm)}
      {an.eq?.map((e, i) => {
        if (e.t === 'bar') return dot('e' + i, 'xa-plate', 7, at(e.at))
        if (e.t === 'ball') return dot('e' + i, 'xa-plate', 6, at(e.at))
        if (e.t === 'wheel') return dot('e' + i, 'xa-plate', 5, at(e.at))
        if (e.t === 'kb') return dot('e' + i, 'xa-weight', 4.5, (fr) => [fr[e.at][0], fr[e.at][1] + 5])
        if (e.t === 'db') return poly('e' + i, 'xa-db', (fr) => [[fr[e.at][0] - 4, fr[e.at][1]], [fr[e.at][0] + 4, fr[e.at][1]]])
        if (e.t === 'pad') return poly('e' + i, 'xa-pad', (fr) => [[fr.foot[0] + 3, fr.foot[1] - 9], [fr.foot[0] + 3, fr.foot[1] + 9]])
        return null
      })}
    </svg>
  )
}

// Egna övningar utan animation
function GenericAnim({ size }: { size: number }) {
  return (
    <svg className="xa" width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <line className="xa-floor" x1="4" y1="92.5" x2="96" y2="92.5" />
      <polyline className="xa-db" points="30,50 70,50" />
      <polyline className="xa-body" points="38,50 62,50" />
      <circle className="xa-weight" cx="26" cy="50" r="9" />
      <circle className="xa-weight" cx="74" cy="50" r="9" />
    </svg>
  )
}
