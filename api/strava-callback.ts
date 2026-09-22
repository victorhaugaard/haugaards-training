// Strava skickar hit efter att man godkänt (eller nekat) anslutningen. Ingen inloggning krävs
// här (det är Strava som anropar), säkerheten ligger i det signerade state-värdet.
import type { IncomingMessage, ServerResponse } from 'node:http'
import { getAdminDb } from './_admin'
import { verifyState } from './strava-connect'
import { exchangeCode, stravaEnabled } from './_strava'

const originOf = (req: IncomingMessage) => {
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https'
  const host = req.headers['x-forwarded-host'] || req.headers.host
  return `${proto}://${host}`
}

const redirect = (res: ServerResponse, url: string) => {
  res.statusCode = 302
  res.setHeader('location', url)
  res.end()
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url || '', 'http://x')
  const appUrl = `${originOf(req)}/#/plan`
  if (!stravaEnabled) return redirect(res, `${appUrl}?strava=error`)

  if (url.searchParams.get('error')) return redirect(res, `${appUrl}?strava=denied`)
  const code = url.searchParams.get('code') || ''
  const state = url.searchParams.get('state') || ''
  const personId = code && state ? verifyState(state) : undefined
  if (!personId) return redirect(res, `${appUrl}?strava=error`)

  try {
    const token = await exchangeCode(code)
    const athleteId = token.athlete?.id
    if (!athleteId) throw new Error('no_athlete')
    const db = getAdminDb()
    await db.collection('stravaTokens').doc(String(athleteId)).set({
      personId,
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      expires_at: token.expires_at,
    })
    await db.collection('people').doc(personId).set({ stravaAthleteId: athleteId }, { merge: true })
    return redirect(res, `${appUrl}?strava=connected`)
  } catch {
    return redirect(res, `${appUrl}?strava=error`)
  }
}
