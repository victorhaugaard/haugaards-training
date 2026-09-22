// Kopplar bort Strava för en person: tar bort de sparade tokens och märket på personen.
import type { IncomingMessage, ServerResponse } from 'node:http'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from './_admin'
import { verifyUser } from './_auth'

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

export default async function handler(req: Req, res: ServerResponse) {
  if (req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' })
  const auth = await verifyUser(req, 'COACH_ALLOWED_EMAILS')
  if (!auth.ok) return send(res, auth.status, { error: auth.error })

  let body: any
  try {
    body = await readBody(req)
  } catch {
    return send(res, 400, { error: 'bad_request' })
  }
  const personId = typeof body.personId === 'string' ? body.personId.trim() : ''
  if (!personId) return send(res, 400, { error: 'missing_person' })

  try {
    const db = getAdminDb()
    const person = await db.collection('people').doc(personId).get()
    const athleteId = person.data()?.stravaAthleteId
    if (athleteId) await db.collection('stravaTokens').doc(String(athleteId)).delete()
    await db.collection('people').doc(personId).update({ stravaAthleteId: FieldValue.delete() })
    return send(res, 200, { ok: true })
  } catch {
    return send(res, 500, { error: 'server' })
  }
}
