import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const env = import.meta.env
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  appId: env.VITE_FIREBASE_APP_ID,
}

// Utan Firebase-nycklar körs appen lokalt (localStorage)
export const cloudEnabled = Boolean(config.apiKey && config.projectId)

const app = cloudEnabled ? initializeApp(config) : undefined
export const auth = app ? getAuth(app) : undefined
export const db = app ? getFirestore(app) : undefined
