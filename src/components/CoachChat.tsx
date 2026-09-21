import { useEffect, useRef, useState, type Dispatch, type FormEvent } from 'react'
import type { Person, PlanParams, PlanRecord, Session } from '../types'
import type { Action } from '../store'
import { buildContext } from '../lib/coachContext'
import { runTool } from '../lib/coachTools'
import { useZones } from '../lib/zones'
import { getLang, tr } from '../i18n/core'
import { rich } from '../i18n'
import { CoachAvatar } from './CoachAvatar'
import { COACHES, coachById, relationOf } from '../lib/coaches'
import type { FeedMsg } from '../lib/feed'

interface Props {
  person: Person
  sessions: Session[]
  plans: PlanRecord[]
  dispatch: Dispatch<Action>
  getToken?: () => Promise<string | undefined>
  coachId: string
  onCoachChange: (id: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  feed: FeedMsg[] // peppmeddelanden
  onRead: (coachId: string) => void
}

interface Ui {
  id: number
  at: number
  cheer?: boolean
  role: 'user' | 'coach' | 'error'
  text: string
  actions?: string[]
  undo?: Session[]
  undoPlans?: PlanRecord[]
  undone?: boolean
}

// Färdiga knappar som visar vad Coach Smirnov kan hjälpa till med: [knapptext, fråga som skickas]
const QUICK: [string, string][] = [
  ['Jag har en skada', 'Jag har en skada och behöver anpassa träningen.'],
  ['Jag vill öka antal träningstimmar', 'Jag vill öka antalet träningstimmar. Hjälp mig att göra det på ett bra sätt.'],
  ['Jag är sjuk – ändra min plan', 'Jag är sjuk. Hjälp mig att ändra planen.'],
  ['Jag har inte tid den här veckan', 'Jag har inte tid att träna som planerat den här veckan. Hjälp mig att skära ner eller flytta passen.'],
  ['Förklara veckans pass', 'Förklara veckans pass för mig och vad som är viktigast.'],
]

type ApiMsg = { role: 'user' | 'assistant'; content: unknown }

// Korta historiken men börja alltid på ett vanligt användarmeddelande (verktygssvar måste följa sitt verktygsanrop)
const trim = (m: ApiMsg[]) => {
  let s = Math.max(0, m.length - 30)
  while (s < m.length && !(m[s].role === 'user' && typeof m[s].content === 'string')) s++
  return m.slice(s)
}

const errorText = (code: string) =>
  ({
    missing_key: 'Coachen är inte kopplad ännu. ANTHROPIC_API_KEY saknas på servern.',
    unauthorized: 'Du behöver logga in igen för att prata med coachen.',
    forbidden: 'Ditt konto har inte tillgång till coachen.',
    allowlist_missing: 'Coachen saknar en lista över tillåtna konton (COACH_ALLOWED_EMAILS).',
    rate_limited: 'Coachen har för många frågor just nu. Försök igen om en stund.',
  })[code] ?? 'Något gick fel med coachen. Försök igen.'

function Text({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n{2,}/).map((para, i) => {
        const lines = para.split('\n')
        if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l)))
          return (
            <ol key={i}>
              {lines.map((l, j) => (
                <li key={j}>{rich(l.replace(/^\s*\d+[.)]\s+/, ''))}</li>
              ))}
            </ol>
          )
        if (lines.every((l) => /^\s*[-•]\s+/.test(l)))
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{rich(l.replace(/^\s*[-•]\s+/, ''))}</li>
              ))}
            </ul>
          )
        return <p key={i}>{rich(para)}</p>
      })}
    </>
  )
}

export function CoachChat({ person, sessions, plans, dispatch, getToken, coachId, onCoachChange, open, onOpenChange, feed, onRead }: Props) {
  const [pick, setPick] = useState(false)
  const coach = coachById(coachId)
  const relation = relationOf(person.name)
  // Hur coachen tilltalar dig: släktnamn för familjecoacherna, annars ditt namn
  const who = coach.call && relation !== 'other' ? tr(coach.call[relation]) : person.name
  const [ui, setUi] = useState<Ui[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const history = useRef<ApiMsg[]>([])
  const pendingNote = useRef('')
  const nextId = useRef(1)
  const scroller = useRef<HTMLDivElement>(null)
  const { labels } = useZones()
  const latest = useRef({ person, sessions, plans })
  latest.current = { person, sessions, plans }

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [ui, busy, open, feed.length])

  // Peppmeddelanden från den valda coachen visas som vanliga meddelanden i samtalet
  const mineFeed = feed.filter((m) => m.coachId === coach.id)
  const unread = mineFeed.filter((m) => !m.read).length
  useEffect(() => {
    if (open && unread) onRead(coach.id)
  }, [open, unread, coach.id, onRead])
  const all: Ui[] = [...ui, ...mineFeed.map((m, i) => ({ id: -(i + 1), at: m.at, role: 'coach' as const, text: m.text, cheer: true }))].sort((a, b) => a.at - b.at)

  // Samtalet sparas per person och coach och finns kvar när man stänger sidan och kommer tillbaka
  const chatKey = `haugaards-training:chat:${person.id}:${coachId}`
  const [loadedKey, setLoadedKey] = useState('')
  useEffect(() => {
    let saved: { ui: Ui[]; api: ApiMsg[] } = { ui: [], api: [] }
    try {
      saved = JSON.parse(localStorage.getItem(chatKey) ?? '') as typeof saved
    } catch {
      /* ingen sparad historik */
    }
    history.current = Array.isArray(saved.api) ? saved.api : []
    const list = Array.isArray(saved.ui) ? saved.ui : []
    nextId.current = list.reduce((m, x) => Math.max(m, x.id), 0) + 1
    setUi(list)
    setLoadedKey(chatKey)
  }, [chatKey])
  useEffect(() => {
    if (loadedKey !== chatKey) return // vänta tills rätt historik lästs in
    try {
      // ångra-data (hela planer) sparas inte
      const lite = ui.slice(-80).map(({ undo: _u, undoPlans: _p, ...rest }) => rest)
      localStorage.setItem(chatKey, JSON.stringify({ ui: lite, api: history.current }))
    } catch {
      /* ignorera */
    }
  }, [ui, chatKey, loadedKey])

  const push = (m: Omit<Ui, 'id' | 'at'>) => setUi((l) => [...l, { ...m, id: nextId.current++, at: Date.now() }])

  const call = async (messages: ApiMsg[], context: string) => {
    const headers: Record<string, string> = { 'content-type': 'application/json' }
    const token = await getToken?.()
    if (token) headers.authorization = `Bearer ${token}`
    const r = await fetch('/api/coach', { method: 'POST', headers, body: JSON.stringify({ messages, context, lang: getLang(), persona: coach.id, userName: person.name, relation }) })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(data.error ?? 'error')
    return data as { content: { type: string; text?: string; id?: string; name?: string; input?: Record<string, unknown> }[]; stop_reason: string }
  }

  const send = async (raw: string) => {
    const text = raw.trim()
    if (!text || busy) return
    setInput('')
    push({ role: 'user', text })
    setBusy(true)

    const startSessions = latest.current.sessions
    const startPlans = latest.current.plans
    let newPlan: PlanParams | undefined
    let working = startSessions
    let personPatch: Partial<Person> | undefined
    const actions: string[] = []
    const context = buildContext(latest.current.person, working, labels)
    const messages: ApiMsg[] = [...history.current, { role: 'user', content: pendingNote.current + text }]
    pendingNote.current = ''

    try {
      let reply = ''
      for (let i = 0; i < 6; i++) {
        const res = await call(messages, context)
        messages.push({ role: 'assistant', content: res.content })
        const uses = res.content.filter((b) => b.type === 'tool_use')
        if (res.stop_reason === 'tool_use' && uses.length) {
          const results = uses.map((b) => {
            const out = runTool(b.name ?? '', b.input ?? {}, { personId: person.id, person: latest.current.person, sessions: working })
            if (!out.error && out.sessions !== working) {
              working = out.sessions
              if (out.summary) actions.push(out.summary)
            }
            if (out.personPatch) personPatch = { ...personPatch, ...out.personPatch }
            if (out.newPlan) newPlan = out.newPlan
            return { type: 'tool_result', tool_use_id: b.id, content: out.result, ...(out.error ? { is_error: true } : {}) }
          })
          messages.push({ role: 'user', content: results })
          // Planen arkiveras innan passen byts ut
          if (newPlan) (dispatch({ type: 'newPlan', personId: person.id, plan: newPlan }), (newPlan = undefined))
          dispatch({ type: 'setPersonSessions', personId: person.id, sessions: working })
          if (personPatch) dispatch({ type: 'updatePerson', id: person.id, patch: personPatch })
          continue
        }
        reply = res.content.filter((b) => b.type === 'text').map((b) => b.text ?? '').join('\n').trim()
        break
      }
      history.current = trim(messages)
      const changed = working !== startSessions
      push({ role: 'coach', text: reply || tr('Klart.'), actions, undo: changed ? startSessions : undefined, undoPlans: changed ? startPlans : undefined })
    } catch (e) {
      if (working !== startSessions) dispatch({ type: 'setPersonSessions', personId: person.id, sessions: working })
      push({ role: 'error', text: tr(errorText((e as Error).message)) })
    } finally {
      setBusy(false)
    }
  }

  const undo = (m: Ui) => {
    if (!m.undo || m.undone) return
    dispatch({ type: 'setPersonSessions', personId: person.id, sessions: m.undo })
    if (m.undoPlans) dispatch({ type: 'setPersonPlans', personId: person.id, plans: m.undoPlans })
    setUi((l) => l.map((x) => (x.id === m.id ? { ...x, undone: true } : x)))
    pendingNote.current = '[The user undid your last plan changes in the app; the plan is back to how it was before them.]\n'
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    void send(input)
  }

  return (
    <div className="coach">
      {open && (
        <section className="coach-panel" aria-label={coach.name}>
          <header className="coach-head">
            <button className="coach-who" onClick={() => setPick((p) => !p)} aria-expanded={pick}>
              <CoachAvatar coach={coach} />
              <div>
              <strong>
                {coach.name} <i className="caret">▾</i>
              </strong>
              <span>{tr(coach.tagline)}</span>
              </div>
            </button>
            <div className="coach-head-actions">
              <button className="icon-btn" aria-label={tr('Stäng')} onClick={() => onOpenChange(false)}>
                ✕
              </button>
              {ui.length > 0 && (
                <button
                  className="icon-btn"
                  title={tr('Nytt samtal')}
                  aria-label={tr('Nytt samtal')}
                  onClick={() => {
                    history.current = []
                    setUi([])
                  }}
                >
                  ↺
                </button>
              )}
            </div>
          </header>

          {pick && (
            <div className="coach-picker" role="listbox" aria-label={tr('Välj coach')}>
              {COACHES.map((c) => (
                <button
                  key={c.id}
                  role="option"
                  aria-selected={c.id === coach.id}
                  className={c.id === coach.id ? 'on' : ''}
                  onClick={() => {
                    setPick(false)
                    if (c.id === coach.id) return
                    onCoachChange(c.id)
                  }}
                >
                  <CoachAvatar coach={c} size={34} />
                  <span className="cp-text">
                    <strong>{c.name}</strong>
                    <em>{tr(c.tagline)}</em>
                  </span>
                  {c.id === coach.id && <b>✓</b>}
                </button>
              ))}
              <p className="cp-note">{tr('Coacherna är AI-karaktärer. De kända är bara inspirerade av personernas stil, det är inte de riktiga personerna.')}</p>
            </div>
          )}

          <div className="coach-msgs" ref={scroller}>
            <div className="coach-msg from-coach">
              <Text text={tr(coach.greeting, { who, name: person.name })} />
            </div>
            {ui.length === 0 && (
              <div className="coach-quick">
                {QUICK.map(([label, prompt]) => (
                  <button key={label} onClick={() => send(tr(prompt))}>
                    {tr(label)}
                  </button>
                ))}
              </div>
            )}
            {all.map((m) => (
              <div key={m.id} className={'coach-msg ' + (m.role === 'coach' ? 'from-coach' : m.role) + (m.cheer ? ' cheer' : '')}>
                <Text text={m.text} />
                {m.actions && m.actions.length > 0 && (
                  <ul className="coach-actions">
                    {m.actions.map((a, i) => (
                      <li key={i}>✓ {a}</li>
                    ))}
                  </ul>
                )}
                {m.undo && (
                  <button className="coach-undo" disabled={m.undone} onClick={() => undo(m)}>
                    {m.undone ? tr('Ändringarna är ångrade') : tr('Ångra ändringarna')}
                  </button>
                )}
              </div>
            ))}
            {busy && (
              <div className="coach-msg from-coach typing" aria-label={tr('{coach} skriver', { coach: coach.name })}>
                <i />
                <i />
                <i />
              </div>
            )}
          </div>

          <form className="coach-input" onSubmit={submit}>
            <textarea
              value={input}
              rows={1}
              placeholder={tr('Skriv till {coach}', { coach: coach.name })}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void send(input)
                }
              }}
            />
            <button className="btn primary" type="submit" disabled={busy || !input.trim()} aria-label={tr('Skicka')}>
              ↑
            </button>
          </form>
        </section>
      )}
      <button className={'coach-launcher' + (open ? ' open' : '')} onClick={() => onOpenChange(!open)} aria-label={coach.name}>
        <CoachAvatar coach={coach} />
        <span className="coach-label">{coach.name}</span>
        {unread > 0 && !open && <span className="coach-badge">{unread}</span>}
      </button>
    </div>
  )
}
