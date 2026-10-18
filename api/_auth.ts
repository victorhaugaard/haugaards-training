// Delad inloggningskontroll för serverfunktionerna (coach, Strava-anslutning).
// Verifierar Firebase ID-token och kollar mot listan i miljövariabeln eller åtkomstlistan i Firestore (access/{e-post}).
import { createRemoteJWKSet, jwtVerify } from 'jose'
import type { IncomingMessage } from 'node:http'
import { adminEnabled, getAdminDb } from './_admin.js'

const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'))

// Samma admin-konton som i src/lib/access.ts och firestore.rules. De står inte i åtkomstlistan.
const ADMIN_EMAILS = ['victortomashaugaard@gmail.com', 'ohaug01@gmail.com']

export type AuthResult = { ok: true; email: string } | { ok: false; status: number; error: string }

// allowedEnv: namnet på miljövariabeln med kommaseparerade e-postadresser (t.ex. COACH_ALLOWED_EMAILS)
export const verifyUser = async (req: IncomingMessage, allowedEnv: string, tokenOverride?: string): Promise<AuthResult> => {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID
  if (!projectId) return { ok: false, status: 500, error: 'firebase_not_configured' }
  const header = String(req.headers['authorization'] || '')
  const token = tokenOverride || (header.startsWith('Bearer ') ? header.slice(7) : '')
  if (!token) return { ok: false, status: 401, error: 'unauthorized' }
  try {
    const { payload } = await jwtVerify(token, JWKS, { issuer: `https://securetoken.google.com/${projectId}`, audience: projectId })
    const allowed = (process.env[allowedEnv] || '').toLowerCase().split(',').map((s) => s.trim()).filter(Boolean)
    const email = String(payload.email || '').toLowerCase()
    if (!payload.email_verified || !email) return { ok: false, status: 403, error: 'forbidden' }
    if (ADMIN_EMAILS.includes(email) || allowed.includes(email) || (await inAccessList(email, token, projectId))) return { ok: true, email }
    return { ok: false, status: 403, error: 'forbidden' }
  } catch {
    return { ok: false, status: 401, error: 'unauthorized' }
  }
}

// Finns kontot i åtkomstlistan (Hantera åtkomst)? Läses med användarens egen token via Firestore REST,
// eftersom reglerna låter varje konto läsa sin egen rad. Då behövs inget tjänstkonto. Admin SDK som reserv.
const inAccessList = async (email: string, idToken: string, projectId: string) => {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/access/${encodeURIComponent(email)}`
    const r = await fetch(url, { headers: { authorization: `Bearer ${idToken}` } })
    if (r.ok) return true
  } catch {
    /* prova Admin SDK nedan */
  }
  if (!adminEnabled) return false
  try {
    return (await getAdminDb().collection('access').doc(email).get()).exists
  } catch {
    return false
  }
}
