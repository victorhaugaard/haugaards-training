// Delad Strava-logik: OAuth-utbyte, hämta aktivitet, och matcha den mot planerade pass.
// Körs bara på servern (webhook och anslutningsflödet). Typerna är samma som i appen (src/types),
// men importen är type-only så inget av klientkoden bakas in här.
import type { Category, Session, Sport, Zones } from '../src/types'

export const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID || ''
export const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET || ''
export const STRAVA_VERIFY_TOKEN = process.env.STRAVA_VERIFY_TOKEN || ''
export const stravaEnabled = Boolean(STRAVA_CLIENT_ID && STRAVA_CLIENT_SECRET)

export interface StravaTokens {
  access_token: string
  refresh_token: string
  expires_at: number // unix-sekunder
}

interface TokenResponse extends StravaTokens {
  athlete?: { id: number }
}

export const exchangeCode = async (code: string): Promise<TokenResponse> => {
  const r = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ client_id: STRAVA_CLIENT_ID, client_secret: STRAVA_CLIENT_SECRET, code, grant_type: 'authorization_code' }),
  })
  if (!r.ok) throw new Error(`strava_token_exchange_${r.status}`)
  return r.json()
}

export const refreshTokens = async (refresh_token: string): Promise<StravaTokens> => {
  const r = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ client_id: STRAVA_CLIENT_ID, client_secret: STRAVA_CLIENT_SECRET, refresh_token, grant_type: 'refresh_token' }),
  })
  if (!r.ok) throw new Error(`strava_refresh_${r.status}`)
  return r.json()
}

// Ger giltiga tokens, uppdaterar dem först om de går ut inom 2 minuter
export const ensureFreshTokens = async (tokens: StravaTokens): Promise<{ tokens: StravaTokens; refreshed: boolean }> => {
  if (tokens.expires_at - 120 > Date.now() / 1000) return { tokens, refreshed: false }
  return { tokens: await refreshTokens(tokens.refresh_token), refreshed: true }
}

export interface StravaActivity {
  id: number
  name: string
  sport_type: string
  type: string
  start_date_local: string // t.ex. 2026-09-22T07:15:00Z (lokal tid utan zonoffset)
  moving_time: number // sekunder
  elapsed_time: number
  distance: number // meter
  average_heartrate?: number
  workout_type?: number
  trainer?: boolean
}

export const fetchActivity = async (accessToken: string, activityId: number | string): Promise<StravaActivity> => {
  const r = await fetch(`https://www.strava.com/api/v3/activities/${activityId}`, { headers: { authorization: `Bearer ${accessToken}` } })
  if (!r.ok) throw new Error(`strava_activity_${r.status}`)
  return r.json()
}

const SPORT_MAP: Record<string, Sport> = {
  Run: 'Löpning',
  TrailRun: 'Löpning',
  Treadmill: 'Löpning',
  Ride: 'Cykel',
  MountainBikeRide: 'Cykel',
  GravelRide: 'Cykel',
  EBikeRide: 'Cykel',
  VirtualRide: 'Cykel',
  Handcycle: 'Cykel',
  NordicSki: 'Skidor',
  BackcountrySki: 'Skidor',
  AlpineSki: 'Skidor',
  RollerSki: 'Rullskidor',
  WeightTraining: 'Styrka',
  Workout: 'Styrka',
  Crossfit: 'Styrka',
  Yoga: 'Rörlighet',
  Pilates: 'Rörlighet',
}

export const mapSport = (a: StravaActivity): Sport => SPORT_MAP[a.sport_type] ?? SPORT_MAP[a.type] ?? 'Övrigt'

// Strava sätter workout_type 1 (löpning) eller 11 (cykel) för tävling
const isRaceEffort = (a: StravaActivity) => a.workout_type === 1 || a.workout_type === 11

export const guessCategory = (a: StravaActivity): Category => (isRaceEffort(a) ? 'race' : 'easy')

const round5 = (n: number) => Math.max(5, Math.round(n / 5) * 5)
export const activityMinutes = (a: StravaActivity) => round5(a.moving_time / 60)

const km = (m: number) => (m / 1000).toFixed(1).replace('.', ',')
const pace = (a: StravaActivity) => {
  if (!a.moving_time || !a.distance) return ''
  const minPerKm = a.moving_time / 60 / (a.distance / 1000)
  const m = Math.floor(minPerKm)
  const s = Math.round((minPerKm - m) * 60)
  return `${m}:${String(s).padStart(2, '0')} min/km`
}

// Kort sammanfattning av passet, läggs i anteckningarna
export const activitySummary = (a: StravaActivity) => {
  const parts = [`${km(a.distance)} km`, pace(a)]
  if (a.average_heartrate) parts.push(`${Math.round(a.average_heartrate)} sl/min snitt`)
  return `Från Strava: ${parts.filter(Boolean).join(' · ')}`
}

// Skalar ett planerat pass zoner proportionellt till den faktiska tiden
export const scaleZonesTo = (zones: Zones, nonZone: number, minutes: number): { zones: Zones; nonZone: number } => {
  const cur = zones.reduce((a, b) => a + b, 0) + nonZone
  if (!cur) return { zones: [minutes, 0, 0, 0, 0] as Zones, nonZone: 0 }
  const f = minutes / cur
  return { zones: zones.map((z) => Math.max(0, round5(z * f))) as Zones, nonZone: Math.max(0, round5(nonZone * f)) }
}

export interface MatchResult {
  kind: 'matched' | 'new'
  sessionId?: string // vid matchning: id på det befintliga passet
  date: string
}

const sameOrNearDate = (target: string, date: string) => {
  const t = new Date(target + 'T12:00:00Z').getTime()
  const d = new Date(date + 'T12:00:00Z').getTime()
  return Math.abs(t - d) <= 86_400_000 // samma dag eller ±1 dag (sent pass, tidszon)
}

// Hittar bästa planerade, ej avklarade pass med samma idrott och rimligt lik längd
export const findMatch = (candidates: Session[], activity: StravaActivity): Session | undefined => {
  const date = activity.start_date_local.slice(0, 10)
  const sport = mapSport(activity)
  const minutes = activityMinutes(activity)
  const pool = candidates.filter((s) => !s.done && !s.stravaId && s.category !== 'rest' && s.sport === sport && sameOrNearDate(date, s.date))
  if (!pool.length) return undefined
  return pool.reduce((best, s) => {
    const plannedBest = best.zones.reduce((a, b) => a + b, 0) + best.nonZone
    const plannedS = s.zones.reduce((a, b) => a + b, 0) + s.nonZone
    return Math.abs(plannedS - minutes) < Math.abs(plannedBest - minutes) ? s : best
  })
}
