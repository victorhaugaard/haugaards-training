import { useEffect, useRef, useState, type Dispatch, type FormEvent } from 'react'
import type { Person, Session } from '../types'
import type { Action } from '../store'
import { buildContext } from '../lib/coachContext'
import { runTool } from '../lib/coachTools'
import { useZones } from '../lib/zones'
import { getLang, tr } from '../i18n/core'
import { rich } from '../i18n'

interface Props {
  person: Person
  sessions: Session[]
  dispatch: Dispatch<Action>
  getToken?: () => Promise<string | undefined>
}

interface Ui {
  id: number
  role: 'user' | 'coach' | 'error'
  text: string
  actions?: string[]
  undo?: Session[]
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
    missing_key: 'Coach Smirnov är inte kopplad ännu. ANTHROPIC_API_KEY saknas på servern.',
    unauthorized: 'Du behöver logga in igen för att prata med Coach Smirnov.',
    forbidden: 'Ditt konto har inte tillgång till Coach Smirnov.',
    allowlist_missing: 'Coach Smirnov saknar en lista över tillåtna konton (COACH_ALLOWED_EMAILS).',
    rate_limited: 'Coach Smirnov har för många frågor just nu. Försök igen om en stund.',
  })[code] ?? 'Något gick fel med Coach Smirnov. Försök igen.'

function Text({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n{2,}/).map((para, i) => {
        const lines = para.split('\n')
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

export function CoachChat({ person, sessions, dispatch, getToken }: Props) {
  const [open, setOpen] = useState(false)
  const [ui, setUi] = useState<Ui[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const history = useRef<ApiMsg[]>([])
  const pendingNote = useRef('')
  const nextId = useRef(1)
  const scroller = useRef<HTMLDivElement>(null)
  const { labels } = useZones()
  const latest = useRef({ person, sessions })
  latest.current = { person, sessions }

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [ui, busy, open])

  // Nytt samtal när man byter person
  useEffect(() => {
    history.current = []
    setUi([])
  }, [person.id])

  const push = (m: Omit<Ui, 'id'>) => setUi((l) => [...l, { ...m, id: nextId.current++ }])

  const call = async (messages: ApiMsg[], context: string) => {
    const headers: Record<string, string> = { 'content-type': 'application/json' }
    const token = await getToken?.()
    if (token) headers.authorization = `Bearer ${token}`
    const r = await fetch('/api/coach', { method: 'POST', headers, body: JSON.stringify({ messages, context, lang: getLang() }) })
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
            return { type: 'tool_result', tool_use_id: b.id, content: out.result, ...(out.error ? { is_error: true } : {}) }
          })
          messages.push({ role: 'user', content: results })
          dispatch({ type: 'setPersonSessions', personId: person.id, sessions: working })
          if (personPatch) dispatch({ type: 'updatePerson', id: person.id, patch: personPatch })
          continue
        }
        reply = res.content.filter((b) => b.type === 'text').map((b) => b.text ?? '').join('\n').trim()
        break
      }
      history.current = trim(messages)
      const changed = working !== startSessions
      push({ role: 'coach', text: reply || tr('Klart.'), actions, undo: changed ? startSessions : undefined })
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
        <section className="coach-panel" aria-label="Coach Smirnov">
          <header className="coach-head">
            <span className="coach-avatar">S</span>
            <div>
              <strong>Coach Smirnov</strong>
              <span>{tr('Din tränare, kan ändra planen')}</span>
            </div>
            <div className="coach-head-actions">
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
              <button className="icon-btn" aria-label={tr('Stäng')} onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>
          </header>

          <div className="coach-msgs" ref={scroller}>
            <div className="coach-msg coach">
              <Text text={tr('Hej, jag är Coach Smirnov. Fråga mig om träningen, eller be mig ändra planen: flytta pass, lägga till, ta bort eller öka mängden. Vid sjukdom eller skada hjälper jag dig att anpassa den.')} />
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
            {ui.map((m) => (
              <div key={m.id} className={'coach-msg ' + m.role}>
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
              <div className="coach-msg coach typing" aria-label={tr('Coach Smirnov skriver')}>
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
              placeholder={tr('Skriv till Coach Smirnov')}
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
      <button className={'coach-launcher' + (open ? ' open' : '')} onClick={() => setOpen((o) => !o)} aria-label="Coach Smirnov">
        <span className="coach-avatar">S</span>
        <span className="coach-label">Coach Smirnov</span>
      </button>
    </div>
  )
}
