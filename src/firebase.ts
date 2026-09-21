import { initializeApp } from 'firebase/app'
import { browserLocalPersistence, browserPopupRedirectResolver, getAuth, indexedDBLocalPersistence, initializeAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const env = import.meta.env
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  // Nyare projekt har <projekt>.firebasestorage.app, äldre <projekt>.appspot.com (sätt VITE_FIREBASE_STORAGE_BUCKET då)
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || (env.VITE_FIREBASE_PROJECT_ID ? `${env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app` : undefined),
}

// Utan Firebase-nycklar körs appen lokalt (localStorage)
export const cloudEnabled = Boolean(config.apiKey && config.projectId)

const app = cloudEnabled ? initializeApp(config) : undefined

// Inloggningen sparas i webbläsaren (IndexedDB, med localStorage som reserv) och består när fliken eller webbläsaren stängs
const makeAuth = () => {
  if (!app) return undefined
  try {
    // initializeAuth (till skillnad från getAuth) behöver få popup-hanteraren angiven, annars ger inloggningen auth/argument-error
    return initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
      popupRedirectResolver: browserPopupRedirectResolver,
    })
  } catch {
    return getAuth(app) // redan initierad (t.ex. vid hot reload)
  }
}
export const auth = makeAuth()
export const db = app ? getFirestore(app) : undefined
export const storage = app ? getStorage(app) : undefined

// Be webbläsaren att inte rensa sparad data (tema, inloggning, inställningar) när det blir ont om utrymme
void navigator.storage?.persist?.().catch(() => {})
