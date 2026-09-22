// Firebase Admin SDK: används bara av Strava-synken (webhook, OAuth-utbyte) för att skriva
// direkt till Firestore utan en inloggad klient. Skiljer sig från src/firebase.ts, som är
// klient-SDK:t appen använder i webbläsaren.
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

let app: App | undefined
let db: Firestore | undefined

// Läs in service-account-nyckeln (JSON, eventuellt base64-kodad) från miljövariabeln
const readServiceAccount = () => {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) return undefined
  const text = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8')
  return JSON.parse(text) as { project_id: string; client_email: string; private_key: string }
}

export const adminEnabled = Boolean(process.env.FIREBASE_SERVICE_ACCOUNT)

export const getAdminDb = (): Firestore => {
  if (db) return db
  const sa = readServiceAccount()
  if (!sa) throw new Error('missing_service_account')
  app = getApps()[0] ?? initializeApp({ credential: cert({ projectId: sa.project_id, clientEmail: sa.client_email, privateKey: sa.private_key.replace(/\\n/g, '\n') }) })
  db = getFirestore(app)
  return db
}
