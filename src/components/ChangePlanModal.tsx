import { useState, type ReactNode } from 'react'
import type { Person } from '../types'
import { tr } from '../i18n/core'
import { Modal } from './Modal'
import { RestDayField } from './RestDayField'
import { Segmented } from './Segmented'

export type ChangeAction =
  | { kind: 'scale'; factor: number }
  | { kind: 'restDay'; restDay: number }
  | { kind: 'pause'; mode: 'shift' | 'easy' }

interface Props {
  person: Person
  coachName: string
  onApply: (a: ChangeAction) => void
  onRebuild: () => void // byt sporter, dagar, utrustning eller tester
  onGoal: () => void
  onAskCoach: (text: string) => void
  onClose: () => void
}

type Open = null | 'scale' | 'restDay' | 'pause'

function Row({ isOpen, icon, title, sub, onClick, children }: { isOpen?: boolean; icon: ReactNode; title: string; sub: string; onClick: () => void; children?: ReactNode }) {
  return (
    <div className={'cp-row' + (isOpen ? ' open' : '')}>
      <button className="cp-head" onClick={onClick} aria-expanded={children ? isOpen : undefined}>
        <span className="cp-icon" aria-hidden>
          {icon}
        </span>
        <span className="cp-text">
          <b>{title}</b>
          <span>{sub}</span>
        </span>
        <span className="cp-chev" aria-hidden>
          ›
        </span>
      </button>
      {isOpen && children && <div className="cp-body">{children}</div>}
    </div>
  )
}

// Snabbval för att ändra planen från idag. Genomförda pass och tävlingar rörs inte.
export function ChangePlanModal({ person, coachName, onApply, onRebuild, onGoal, onAskCoach, onClose }: Props) {
  const [open, setOpen] = useState<Open>(null)
  const [pct, setPct] = useState('10')
  const [restDay, setRestDay] = useState(person.restDay ?? 0)
  const [pause, setPause] = useState<'shift' | 'easy'>('easy')
  const [text, setText] = useState('')
  const apply = (a: ChangeAction) => (onApply(a), onClose())
  const toggle = (id: Open) => setOpen((o) => (o === id ? null : id))

  return (
    <Modal title={tr('Ändra plan')} onClose={onClose}>
      <p className="muted small">{tr('Ändringarna gäller från idag. Genomförda pass och tävlingar ligger kvar.')}</p>
      <div className="cp-list">
        <Row isOpen={open === 'scale'} onClick={() => toggle('scale')} icon="↕" title={tr('Mer eller mindre träning')} sub={tr('Justera längden på kommande pass')}>
          <Segmented
            value={pct}
            onChange={setPct}
            options={[
              ['-20', '−20 %'],
              ['-10', '−10 %'],
              ['10', '+10 %'],
              ['20', '+20 %'],
            ]}
          />
          <button className="btn primary small" onClick={() => apply({ kind: 'scale', factor: 1 + +pct / 100 })}>
            {tr('Använd')}
          </button>
        </Row>
        <Row isOpen={open === 'restDay'} onClick={() => toggle('restDay')} icon="☾" title={tr('Byt vilodag')} sub={tr('Planen byggs om från idag med ny vilodag')}>
          <RestDayField value={restDay} onChange={setRestDay} />
          <button className="btn primary small" onClick={() => apply({ kind: 'restDay', restDay })}>
            {tr('Använd')}
          </button>
        </Row>
        <Row isOpen={open === 'pause'} onClick={() => toggle('pause')} icon="⏸" title={tr('Sjuk, resa eller behöver vila')} sub={tr('Ta det lugnt en vecka')}>
          <Segmented
            value={pause}
            onChange={setPause}
            options={[
              ['easy', tr('Lätt vecka')],
              ['shift', tr('Pausa en vecka')],
            ]}
          />
          <p className="muted small">
            {tr(pause === 'easy' ? 'De kommande sju dagarna blir hälften så långa och de hårda passen tas bort.' : 'Alla kommande pass flyttas fram en vecka, så att planen fortsätter där du var.')}
          </p>
          <button className="btn primary small" onClick={() => apply({ kind: 'pause', mode: pause })}>
            {tr('Använd')}
          </button>
        </Row>
        <Row icon="⚑" title={tr(person.goal ? 'Ändra mål' : 'Sätt ett mål')} sub={tr('Ett mål med datum, gärna kopplat till ett test')} onClick={() => (onClose(), onGoal())} />
        <Row icon="↻" title={tr('Bygg om planen')} sub={tr('Byt sporter, dagar, passlängd, utrustning eller tester')} onClick={() => (onClose(), onRebuild())} />
      </div>
      <form
        className="cp-coach"
        onSubmit={(e) => {
          e.preventDefault()
          if (text.trim()) (onAskCoach(text.trim()), onClose())
        }}
      >
        <span className="stat-label">{tr('Eller beskriv för {coach}', { coach: coachName })}</span>
        <div className="cp-coach-row">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder={tr('T.ex. jag har ont i knät, eller jag reser bort på torsdag')} />
          <button className="btn primary" disabled={!text.trim()}>
            {tr('Skicka')}
          </button>
        </div>
        <div className="pf-filter">
          {['Jag är förkyld', 'Jag har mindre tid den här veckan', 'Jag vill ha fler styrkepass', 'Gör planen tuffare'].map((q) => (
            <button key={q} type="button" onClick={() => (onAskCoach(tr(q)), onClose())}>
              {tr(q)}
            </button>
          ))}
        </div>
      </form>
    </Modal>
  )
}
