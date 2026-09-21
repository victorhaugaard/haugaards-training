// Coach Smirnov: Vercel-funktion (och lokal middleware i `npm run dev`).
// API-nyckeln ligger bara här på servern. Planändringarna görs i appen via verktygsanrop.
import Anthropic from '@anthropic-ai/sdk'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import type { IncomingMessage, ServerResponse } from 'node:http'

const MODEL = process.env.COACH_MODEL || 'claude-haiku-4-5'
const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'))

const SYSTEM = `You are Coach Smirnov, an experienced, calm and direct cross-country ski coach. You are built into a training planner app used by two people: Victor and his father. The plan is stored in the app; you can read and modify it with tools.

Your job
- Answer training questions briefly and concretely.
- Restructure the plan when asked, or when the user's situation clearly calls for it (illness, injury, travel, lack of time, wanting more or less training).
- Speak the user's language (given in the context). Keep answers short: a few sentences, plain text, no headings. Use "- " bullets only when listing.

How you act
- Act with tools when the intent is clear. For large or hard-to-reverse changes (regenerate_plan, deleting several sessions, changing volume by more than 30%), first say what you propose in 1-3 sentences and ask for a yes, unless the user has already clearly asked for exactly that.
- If key facts are missing, ask ONE or TWO short questions first. Injury: what and where, since when, pain level, does it hurt when walking. Illness: symptoms, fever, how many days. More training: how many hours, how many days, current load.
- After you change the plan, summarize in 1-3 sentences what you changed and why. Do not repeat every detail.
- Session ids and the next weeks are in the context. Use get_plan for other dates. Dates are ISO YYYY-MM-DD, weeks start on Monday.
- Never move, delete or change race sessions (category "race") or completed sessions, unless the user explicitly asks. The tools protect them.

Coaching principles
- About 80-90% of training time should be easy. Do not put hard sessions on consecutive days. Keep one rest day a week and a lighter week about every fourth week.
- Illness: symptoms only above the neck (mild cold) can allow easy training. Fever, chest symptoms, aching body or feeling really unwell means full rest until fever-free, then 1-2 easy days before returning at 50-70% of normal volume and ramping up over about a week. Postpone or remove sessions instead of cramming them in. Never postpone completed sessions.
- Injury: you are not a doctor and never diagnose. If the pain is sharp, getting worse, swelling, or it lasts more than a few days, recommend seeing a physiotherapist or doctor. Adapt the plan meanwhile: swap impact for low-impact (cycling, roller skis, Ercolina), lower the load on the injured area, and add short rehab sessions as custom sessions (mobility and strength with sport "Rörlighet" or "Styrka", 15-30 minutes, with concrete exercises in notes, e.g. knee: single-leg squats, step-downs, hip strength; achilles: slow calf raises; shoulder: band external rotation; back: core and hip mobility).
- More training: increase gradually, at most about 10% per week on volume, add easy volume (long easy sessions, extra easy bike) before adding intensity.
- Sessions have minutes per zone: zones_minutes is an array of 5 numbers [I1 easy, I2 endurance, I3 tempo, I4 threshold, I5 max]. strength_minutes is time without a zone (strength, mobility).
- Session titles you create should be written in the user's language. For custom sessions put the coaching text (what to do, how) in notes, short.

The plan's fixed goals (races) are in the context. Do not invent facts about the app you are not sure of.`

const S = (props: Record<string, unknown>, required: string[] = []) => ({ type: 'object' as const, properties: props, required })
const ID = { type: 'string', description: 'Session id from the context or get_plan' }
const DATE = { type: 'string', description: 'ISO date YYYY-MM-DD' }
const ZONES = { type: 'array', items: { type: 'number' }, minItems: 5, maxItems: 5, description: 'Minutes in [I1, I2, I3, I4, I5]' }

const TOOLS: Anthropic.Tool[] = [
  { name: 'get_plan', description: 'List the sessions of the active person between two dates (default: today and 4 weeks ahead).', input_schema: S({ from: DATE, to: DATE }) },
  { name: 'move_session', description: 'Move one session to another date.', input_schema: S({ session_id: ID, date: DATE }, ['session_id', 'date']) },
  {
    name: 'add_session',
    description:
      'Add a session. Either use card_id from the card library for a standard session (optionally with total_minutes to scale it), or make a custom session with title, sport and minutes (e.g. rehab). Custom sessions use notes for the coaching text.',
    input_schema: S(
      {
        date: DATE,
        card_id: { type: 'string', description: 'Card id from the library, e.g. easy-bike' },
        title: { type: 'string', description: 'Title for a custom session' },
        sport: { type: 'string', enum: ['Löpning', 'Rullskidor', 'Cykel', 'Skidor', 'Stakmaskin', 'Styrka', 'Rörlighet', 'Övrigt'] },
        category: { type: 'string', enum: ['easy', 'quality', 'hard', 'strength', 'other'] },
        zones_minutes: ZONES,
        strength_minutes: { type: 'number', description: 'Minutes without zone (strength, mobility)' },
        total_minutes: { type: 'number', description: 'Total minutes; scales a card, or fills I1 (or strength minutes) for custom sessions' },
        notes: { type: 'string', description: 'Short coaching text or instructions' },
      },
      ['date'],
    ),
  },
  {
    name: 'update_session',
    description: 'Change fields of a session: title, notes, sport, date, minutes, or scale its duration.',
    input_schema: S(
      {
        session_id: ID,
        title: { type: 'string' },
        notes: { type: 'string' },
        sport: { type: 'string', enum: ['Löpning', 'Rullskidor', 'Cykel', 'Skidor', 'Stakmaskin', 'Styrka', 'Rörlighet', 'Övrigt'] },
        date: DATE,
        zones_minutes: ZONES,
        strength_minutes: { type: 'number' },
        scale: { type: 'number', description: 'Multiply all minutes, e.g. 0.7 for 30% shorter' },
      },
      ['session_id'],
    ),
  },
  { name: 'delete_sessions', description: 'Delete sessions. Race sessions and completed sessions are protected and skipped.', input_schema: S({ session_ids: { type: 'array', items: { type: 'string' } } }, ['session_ids']) },
  {
    name: 'scale_volume',
    description: 'Multiply the minutes of all not-completed, non-race sessions in a date range (factor 0.3 to 2.0). Use to reduce or increase training volume.',
    input_schema: S({ from: DATE, to: DATE, factor: { type: 'number' } }, ['from', 'to', 'factor']),
  },
  {
    name: 'shift_sessions',
    description: 'Move all not-completed, non-race sessions in a date range by a number of days (positive = later). Use to postpone sessions, e.g. after illness.',
    input_schema: S({ from: DATE, to: DATE, days: { type: 'integer', description: '-14 to 14' } }, ['from', 'to', 'days']),
  },
  {
    name: 'regenerate_plan',
    description:
      'Rebuild the whole plan from a start date with the app generator. Keeps completed sessions and races the user added, replaces the rest. Large change: confirm with the user first.',
    input_schema: S({
      start: DATE,
      end: DATE,
      hours_per_week: { type: 'number', description: 'Average hours per week, 6 to 20' },
      run_mode: { type: 'string', enum: ['none', 'little'], description: 'none = no running (gentle on knees)' },
      rest_day: { type: 'integer', description: '0=Monday ... 6=Sunday, -1 = no fixed rest day' },
    }),
  },
]

type Req = IncomingMessage & { body?: unknown }

const send = (res: ServerResponse, status: number, body: unknown) => {
  res.statusCode = status
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify(body))
}

const readBody = async (req: Req): Promise<any> => {
  if (req.body && typeof req.body === 'object') return req.body
  const chunks: Buffer[] = []
  let size = 0
  for await (const c of req) {
    size += (c as Buffer).length
    if (size > 400_000) throw new Error('too_large')
    chunks.push(c as Buffer)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
}

// Endast inloggade och tillåtna konton får använda coachen
const authorize = async (req: Req): Promise<{ ok: true } | { ok: false; status: number; error: string }> => {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID
  if (!projectId) return { ok: true } // lokalt utan Firebase
  const header = String(req.headers['authorization'] || '')
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return { ok: false, status: 401, error: 'unauthorized' }
  try {
    const { payload } = await jwtVerify(token, JWKS, { issuer: `https://securetoken.google.com/${projectId}`, audience: projectId })
    const allowed = (process.env.COACH_ALLOWED_EMAILS || '').toLowerCase().split(',').map((s) => s.trim()).filter(Boolean)
    if (!allowed.length) return { ok: false, status: 403, error: 'allowlist_missing' }
    const email = String(payload.email || '').toLowerCase()
    if (!payload.email_verified || !allowed.includes(email)) return { ok: false, status: 403, error: 'forbidden' }
    return { ok: true }
  } catch {
    return { ok: false, status: 401, error: 'unauthorized' }
  }
}

export default async function handler(req: Req, res: ServerResponse) {
  if (req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' })
  if (!process.env.ANTHROPIC_API_KEY) return send(res, 500, { error: 'missing_key' })

  const auth = await authorize(req)
  if (!auth.ok) return send(res, auth.status, { error: auth.error })

  let body: any
  try {
    body = await readBody(req)
  } catch {
    return send(res, 400, { error: 'bad_request' })
  }
  const messages = Array.isArray(body.messages) && body.messages.length <= 60 ? body.messages : null
  if (!messages || !messages.length || messages[0].role !== 'user') return send(res, 400, { error: 'bad_request' })
  const lang = body.lang === 'no' ? 'Norwegian (bokmål)' : body.lang === 'en' ? 'English' : 'Swedish'
  const context = String(body.context || '').slice(0, 30_000)

  try {
    const client = new Anthropic()
    const r = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: [
        { type: 'text', text: SYSTEM },
        { type: 'text', text: `Reply in ${lang}.\n\n${context}` },
      ],
      tools: TOOLS,
      messages,
    })
    // Skicka bara de fält klienten behöver skicka tillbaka
    const content = r.content.flatMap<Record<string, unknown>>((b) =>
      b.type === 'text' ? [{ type: 'text', text: b.text }] : b.type === 'tool_use' ? [{ type: 'tool_use', id: b.id, name: b.name, input: b.input }] : [],
    )
    return send(res, 200, { content, stop_reason: r.stop_reason })
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return send(res, 429, { error: 'rate_limited' })
    if (e instanceof Anthropic.AuthenticationError) return send(res, 500, { error: 'missing_key' })
    if (e instanceof Anthropic.BadRequestError) return send(res, 400, { error: 'bad_request', detail: e.message.slice(0, 300) })
    return send(res, 502, { error: 'upstream' })
  }
}
