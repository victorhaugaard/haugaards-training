// Startar Strava-anslutningen för en person. Anropas med fetch (inte navigation) så att
// Firebase-token kan skickas som header; svaret är en URL som klienten sedan navigerar till.
import { createHmac } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { verifyUser } from './_auth'
import { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, stravaEnabled } from './_strava'

type Req = IncomingMessage & { body?: unknown }

const send = (res: ServerResponse, status: number, body: unknown) => {
  res.statusCode = status
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify(body))
}

const readBody = async (req: Req): Promise<any> => {
  if (req.body && typeof req.body === 'object') return req.body
  const chunks: Buffer[] = []
  for await (const c of req) chunks.push(c as Buffer)
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
}

// Signerat state-värde: förhindrar att någon annan startar en anslutning åt en annan person
export const signState = (personId: string) => `${personId}.${createHmac('sha256', STRAVA_CLIENT_SECRET).update(personId).digest('hex').slice(0, 24)}`

export const verifyState = (state: string): string | undefined => {
  const i = state.lastIndexOf('.')
  if (i < 0) return undefined
  const personId = state.slice(0, i)
  return signState(personId) === state ? personId : undefined
}

const originOf = (req: Req) => {
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https'
  const host = req.headers['x-forwarded-host'] || req.headers.host
  return `${proto}://${host}`
}

export default async function handler(req: Req, res: ServerResponse) {
  if (req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' })
  if (!stravaEnabled) return send(res, 500, { error: 'missing_config' })

  const auth = await verifyUser(req, 'COACH_ALLOWED_EMAILS')
  if (!auth.ok) return send(res, auth.status, { error: auth.error })

  let body: any
  try {
    body = await readBody(req)
  } catch {
    return send(res, 400, { error: 'bad_request' })
  }
  const personId = typeof body.personId === 'string' && body.personId.trim() ? body.personId.trim() : ''
  if (!personId) return send(res, 400, { error: 'missing_person' })

  const redirectUri = `${originOf(req)}/api/strava-callback`
  const url = new URL('https://www.strava.com/oauth/authorize')
  url.searchParams.set('client_id', STRAVA_CLIENT_ID)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('approval_prompt', 'auto')
  url.searchParams.set('scope', 'read,activity:read_all')
  url.searchParams.set('state', signState(personId))
  return send(res, 200, { url: url.toString() })
}
