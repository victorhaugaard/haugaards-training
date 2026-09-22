// Delad inloggningskontroll för serverfunktionerna (coach, Strava-anslutning).
// Verifierar Firebase ID-token och kollar mot en lista över tillåtna e-postadresser.
import { createRemoteJWKSet, jwtVerify } from 'jose'
import type { IncomingMessage } from 'node:http'

const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'))

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
    if (!allowed.length) return { ok: false, status: 403, error: 'allowlist_missing' }
    const email = String(payload.email || '').toLowerCase()
    if (!payload.email_verified || !allowed.includes(email)) return { ok: false, status: 403, error: 'forbidden' }
    return { ok: true, email }
  } catch {
    return { ok: false, status: 401, error: 'unauthorized' }
  }
}
