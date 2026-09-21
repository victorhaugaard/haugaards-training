import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Session } from '../types'
import { addDays } from '../lib/dates'
import { sessionMinutes } from '../lib/stats'
import { tr } from '../i18n/core'

interface Props {
  session: Session
  x: number
  y: number
  onClose: () => void
  onOpen: () => void
  onToggleDone: () => void
  onSetTotal: (total: number) => void
  onMove: (date: string) => void
  onSwap: () => void
  onDuplicate: () => void
  onDelete: () => void
}

// Snabbmeny som visas vid högerklick på ett pass
export function SessionMenu({ session: s, x, y, onClose, onOpen, onToggleDone, onSetTotal, onMove, onSwap, onDuplicate, onDelete }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const openedAt = useRef(Date.now())
  const [pos, setPos] = useState({ x, y })
  const [picking, setPicking] = useState(false)
  const minutes = sessionMinutes(s)
  const [draft, setDraft] = useState(String(minutes))
  const isRest = s.category === 'rest'

  useLayoutEffect(() => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    setPos({ x: Math.max(8, Math.min(x, window.innerWidth - r.width - 8)), y: Math.max(8, Math.min(y, window.innerHeight - r.height - 8)) })
  }, [x, y, picking])

  useEffect(() => {
    setDraft(String(minutes))
  }, [minutes])

  useEffect(() => {
    const close = (e: Event) => {
      if (Date.now() - openedAt.current < 450) return // släppet efter ett långtryck ska inte stänga menyn
      if (e instanceof KeyboardEvent && e.key !== 'Escape') return
      if (e.type !== 'keydown' && ref.current?.contains(e.target as Node)) return
      onClose()
    }
    window.addEventListener('keydown', close)
    window.addEventListener('mousedown', close)
    window.addEventListener('touchstart', close)
    window.addEventListener('scroll', onClose, true)
    window.addEventListener('resize', onClose)
    return () => {
      window.removeEventListener('keydown', close)
      window.removeEventListener('mousedown', close)
      window.removeEventListener('touchstart', close)
      window.removeEventListener('scroll', onClose, true)
      window.removeEventListener('resize', onClose)
    }
  }, [onClose])

  const run = (fn: () => void) => () => {
    fn()
    onClose()
  }
  const commit = (n: number) => n > 0 && onSetTotal(n)

  return (
    <div ref={ref} className="ctx" style={{ left: pos.x, top: pos.y }} onContextMenu={(e) => e.preventDefault()}>
      <div className="ctx-head">
        <strong>{tr(s.title)}</strong>
        {!isRest && <span>{minutes} min</span>}
      </div>
      <button onClick={run(onOpen)}>{tr('Öppna')}</button>
      {!isRest && <button onClick={run(onToggleDone)}>{tr(s.done ? 'Ångra genomfört' : 'Markera som genomfört')}</button>}
      {!isRest && (
        <div className="ctx-time">
          <span>{tr('Totaltid')}</span>
          <button aria-label="−15 min" onClick={() => commit(minutes - 15)}>
            −15
          </button>
          <input
            type="number"
            min={5}
            step={5}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => Number(draft) !== minutes && commit(Number(draft))}
            onKeyDown={(e) => e.key === 'Enter' && (commit(Number(draft)), e.currentTarget.blur())}
          />
          <button aria-label="+15 min" onClick={() => commit(minutes + 15)}>
            +15
          </button>
        </div>
      )}
      <button onClick={run(() => onMove(addDays(s.date, 1)))}>{tr('Skjut upp en dag')}</button>
      {picking ? (
        <input
          className="ctx-date"
          type="date"
          defaultValue={s.date}
          autoFocus
          onChange={(e) => e.target.value && (onMove(e.target.value), onClose())}
        />
      ) : (
        <button onClick={() => setPicking(true)}>{tr('Flytta till datum…')}</button>
      )}
      {!isRest && <button onClick={run(onSwap)}>{tr('Byt mot annat pass…')}</button>}
      <button onClick={run(onDuplicate)}>{tr('Duplicera')}</button>
      <div className="ctx-sep" />
      <button className="danger" onClick={run(onDelete)}>
        {tr('Ta bort')}
      </button>
    </div>
  )
}
