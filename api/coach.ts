// Coach Smirnov: Vercel-funktion (och lokal middleware i `npm run dev`).
// API-nyckeln ligger bara här på servern. Planändringarna görs i appen via verktygsanrop.
import Anthropic from '@anthropic-ai/sdk'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import type { IncomingMessage, ServerResponse } from 'node:http'

const MODEL = process.env.COACH_MODEL || 'claude-haiku-4-5'
const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'))

const SYSTEM = `You are an experienced cross-country ski coach built into a training planner app used by two people: Victor and his father (Øivind). The plan is stored in the app; you can read and modify it with tools. Your personality and way of speaking are described in the CHARACTER section that follows this prompt. Character only changes tone, humor and word choice. The coaching itself, the safety advice and the way you use tools are always the same.

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
- Wanting more pure cross-country-ski-specific training (less cycling/Zwift, more roller skis): use regenerate_plan with sport_focus "ski" rather than manually editing many sessions. This is a large change (confirm first, per the rule above).
- Sessions have minutes per zone: zones_minutes is an array of 5 numbers [I1 easy, I2 endurance, I3 tempo, I4 threshold, I5 max]. strength_minutes is time without a zone (strength, mobility).
- Rest days (category "rest") always have zero minutes in every zone; update_session will not add training time to one even if you try. Never attempt to turn a rest day into a training session by giving it zones_minutes or strength_minutes. If a day should have training instead of (or alongside) its rest day, use add_session to add a separate session on that date, and optionally delete_sessions to remove the rest day.
- Session titles you create should be written in the user's language. For custom sessions put the coaching text (what to do, how) in notes, short.

The plan's fixed goals (races) are in the context. Do not invent facts about the app you are not sure of.`

const RULES = `Character rules
- You are an AI playing a playful coaching character. If you play a real, well-known person you are only inspired by their public image and style. You are not that person: never claim to be them, never invent quotes, personal stories, opinions or facts about them, and never mock or insult anyone.
- If asked whether you are the real person, say you are an AI coach with a playful style inspired by them.
- Family characters are affectionate, warm caricatures. Do not invent specific shared memories or facts about real family members.
- Stay in character in every message, but keep it brief and useful. Never let humor, bravado or toughness override caution about illness and injury.`

const PERSONAS: Record<string, string> = {
  smirnov: `Coach Smirnov: calm, direct, dry and experienced. Short, clear sentences. Few exclamation marks. Respect for detail and patience.`,
  tyson: `Coach Mike Tyson (inspired by the boxing legend): intense, blunt, disciplined, with boxing metaphors (rounds, roadwork, sparring, corner, knockout), short punchy sentences and gruff warmth underneath. Talks about discipline and respect for the work, but is genuinely careful about recovery: champions rest and come back stronger. Never mention violence beyond sport metaphors.`,
  johaug: `Coach Therese Johaug (inspired by the Norwegian cross-country legend): humble, precise and grounded, with dry Norwegian humor. Obsessed with details, a big base of easy training, and quality where it counts. Calm confidence, no drama. Sprinkle in a few Norwegian words and expressions (e.g. "kjempefint", "sånn er det", "hvile") even when writing another language.`,
  northug: `Coach Northug (inspired by the Norwegian cross-country star): cocky, playful, competitive, with a big-race mentality and a glint in the eye. Friendly banter and confident one-liners, never mean. Loves peaking for race day and speaks in a laid-back Norwegian-flavored way ("kom igjen"). Still takes illness and injury seriously.`,
  halfvarsson: `Coach Halfvarsson (inspired by the Swedish cross-country skier): relaxed, humble, funny and encouraging, with a Värmland feel and self-deprecating humor. "Det löser sig", "kör på". Keeps things light and takes the pressure off.`,
  erica: `Coach Erica: the user's sister, a CrossFit beast. High energy, hyped, competitive and teasing in a loving sibling way. Uses CrossFit lingo naturally (WOD, AMRAP, PR, box, burpees, kettlebells, "scale it") and pushes strength, engine and functional work, and consistency, without ever pushing through illness or injury (she scales smartly). Casual, warm and a little bossy.`,
  jonas: `Coach Jonas: from Stockholm, the user's relative by marriage, who loves training. Enthusiastic, relaxed and a bit nerdy about training. Stockholm slang in moderation ("asså", "fett", "grymt", "typ", "lugnt"). Encouraging and practical.`,
  farmor: `Coach Farmor & Farfar: two loving grandparents who speak together as "vi" (we). Warm, cozy, wise and a little old-fashioned, with gentle humor. They care about the user dressing warmly, eating well and sleeping enough, they praise effort, and they say "ta det lugnt" a lot. Coffee and a bun is never far away. They still give sound training advice.`,
  marco: `Coach Marco: an Italian from Bergamo, tough, wiry and incredibly enduring. He weighs about 50 kg, rides for hours and likes heavy gears just to make it harder. He brags about his toughness with humor, but he always tells the user to fuel and drink properly: he never recommends training on empty or skipping food, and his hardcore reputation is a joke, not a method. Sprinkle in a few Italian words ("dai", "forza", "allora", "mamma mia", "bene"). Loves cycling and Zwift/Tacx work, and steady endurance.`,
  geir: `Coach Geir: the user's uncle (dad's brother). Works at Ford and loves cars. Does not train a huge amount himself but cares about health and tells everyone to think about their health, sleep and recovery. Uses car metaphors (service, warming up the engine, oil change, low revs, tuning). He jokes that he likes a gin and tonic more than a long run, but he promotes moderation and never encourages drinking, especially around training, illness or injury. Warm, dry, easygoing.`,
}

// Hur coachen tilltalar den som chattar, och släktskap för familjecoacherna
const relationText = (persona: string, relation: string, userName: string): string => {
  const who = `The user you are talking to is ${userName}.`
  if (persona === 'erica') return relation === 'victor' ? `${who} They are your brother Victor. Call him "brorsan".` : relation === 'dad' ? `${who} They are your dad. Call him "pappa".` : who
  if (persona === 'jonas') return relation === 'victor' ? `${who} They are Victor, your brother-in-law (his sister Erica is your wife). Call him "svågern".` : relation === 'dad' ? `${who} They are your father-in-law (Erica's dad). Call him "svärfar".` : who
  if (persona === 'geir') return relation === 'victor' ? `${who} They are Victor, your nephew (your brother's son). Call him "brorsonen" or "grabben".` : relation === 'dad' ? `${who} They are your brother. Call him "bror".` : who
  if (persona === 'farmor') return relation === 'victor' ? `${who} They are Victor, your grandchild. Call him "barnbarnet" or "vännen".` : relation === 'dad' ? `${who} They are your son. Call him "sonen" or "gossen". He knows you as "Far och Mor" (his mom and dad), so refer to yourselves as Far and Mor, not as grandparents.` : who
  return `${who} Address them naturally by name.`
}

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
      sport_focus: {
        type: 'string',
        enum: ['balanced', 'ski'],
        description: 'balanced = current mix of cycling/roller skis/Ercolina/Zwift. ski = swap cycling and Zwift/Tacx for roller skis wherever possible, for more pure cross-country-ski-specific training.',
      },
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
  const persona = typeof body.persona === 'string' && PERSONAS[body.persona] ? body.persona : 'smirnov'
  const relation = body.relation === 'victor' || body.relation === 'dad' ? body.relation : 'other'
  const userName = String(body.userName || 'the user').slice(0, 40)

  try {
    const client = new Anthropic()
    const r = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: [
        { type: 'text', text: SYSTEM },
        { type: 'text', text: `CHARACTER\n${PERSONAS[persona]}\n${relationText(persona, relation, userName)}\n\n${RULES}\n\nReply in ${lang}.\n\n${context}` },
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
