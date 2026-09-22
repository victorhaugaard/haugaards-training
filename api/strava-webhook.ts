// Tar emot Strava-händelser (nya/borttagna aktiviteter) och synkar dem mot planen.
// Prenumerationen skapas en gång manuellt, se README ("Koppla Strava").
import { randomUUID } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from './_admin'
import {
  activityMinutes,
  activitySummary,
  ensureFreshTokens,
  fetchActivity,
  findMatch,
  guessCategory,
  mapSport,
  scaleZonesTo,
  STRAVA_VERIFY_TOKEN,
  stravaEnabled,
  type StravaTokens,
} from './_strava'
import type { Session } from '../src/types'

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

interface StravaEvent {
  object_type: 'activity' | 'athlete'
  object_id: number
  aspect_type: 'create' | 'update' | 'delete'
  owner_id: number
}

const processDelete = async (personId: string, activityId: number) => {
  const db = getAdminDb()
  const snap = await db.collection('sessions').where('personId', '==', personId).where('stravaId', '==', String(activityId)).get()
  for (const doc of snap.docs) {
    const s = doc.data() as Session
    if (s.stravaAuto) await doc.ref.delete()
    else await doc.ref.update({ done: false, stravaId: FieldValue.delete(), stravaAuto: FieldValue.delete() })
  }
}

const processCreate = async (personId: string, tokenRef: FirebaseFirestore.DocumentReference, tokens: StravaTokens, activityId: number) => {
  const db = getAdminDb()
  const already = await db.collection('sessions').where('personId', '==', personId).where('stravaId', '==', String(activityId)).limit(1).get()
  if (!already.empty) return // redan synkat (t.ex. ett omskickat webhook-anrop)

  const { tokens: fresh, refreshed } = await ensureFreshTokens(tokens)
  if (refreshed) await tokenRef.update(fresh)

  const activity = await fetchActivity(fresh.access_token, activityId)
  const date = activity.start_date_local.slice(0, 10)
  const sport = mapSport(activity)
  const minutes = activityMinutes(activity)
  const summary = activitySummary(activity)

  const daySnap = await db.collection('sessions').where('personId', '==', personId).get()
  const sessions = daySnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Session, 'id'>) }))
  const match = findMatch(sessions, activity)

  if (match) {
    const scaled = scaleZonesTo(match.zones, match.nonZone, minutes)
    await db
      .collection('sessions')
      .doc(match.id)
      .update({
        done: true,
        stravaId: String(activity.id),
        zones: scaled.zones,
        nonZone: scaled.nonZone,
        notes: [match.notes, summary].filter(Boolean).join('\n'),
      })
    return
  }

  const category = guessCategory(activity)
  const isStrength = sport === 'Styrka' || sport === 'Rörlighet'
  const order = sessions.filter((s) => s.date === date).length
  const id = randomUUID()
  const session: Session = {
    id,
    personId,
    date,
    order,
    cardId: category === 'race' ? 'race' : 'other',
    title: activity.name || sport,
    sport,
    category,
    zones: isStrength ? [0, 0, 0, 0, 0] : [minutes, 0, 0, 0, 0],
    nonZone: isStrength ? minutes : 0,
    notes: summary,
    done: true,
    stravaId: String(activity.id),
    stravaAuto: true,
  }
  await db.collection('sessions').doc(id).set(session)
}

export default async function handler(req: Req, res: ServerResponse) {
  if (req.method === 'GET') {
    const url = new URL(req.url || '', 'http://x')
    const challenge = url.searchParams.get('hub.challenge')
    if (url.searchParams.get('hub.mode') === 'subscribe' && url.searchParams.get('hub.verify_token') === STRAVA_VERIFY_TOKEN && challenge) {
      return send(res, 200, { 'hub.challenge': challenge })
    }
    return send(res, 403, { error: 'forbidden' })
  }
  if (req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' })
  // Strava svartlistar prenumerationen efter upprepade fel, så vi svarar alltid 200 och loggar internt i stället
  if (!stravaEnabled) return send(res, 200, { ok: false })

  let body: StravaEvent
  try {
    body = await readBody(req)
  } catch {
    return send(res, 200, { ok: false })
  }

  try {
    if (body.object_type === 'activity') {
      const db = getAdminDb()
      const tokenRef = db.collection('stravaTokens').doc(String(body.owner_id))
      const tokenDoc = await tokenRef.get()
      const data = tokenDoc.data() as ({ personId: string } & StravaTokens) | undefined
      if (data) {
        if (body.aspect_type === 'delete') await processDelete(data.personId, body.object_id)
        else if (body.aspect_type === 'create') await processCreate(data.personId, tokenRef, data, body.object_id)
        // 'update' hoppas över i den här versionen
      }
    }
  } catch (e) {
    console.error('strava-webhook', e)
  }
  return send(res, 200, { ok: true })
}
