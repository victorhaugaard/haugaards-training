import { useEffect, useState } from 'react'
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { auth, cloudEnabled } from './firebase'

export interface AuthState {
  enabled: boolean
  ready: boolean
  user: User | null
  signIn: () => Promise<void>
  signInEmail: (email: string, password: string) => Promise<void>
  signUpEmail: (email: string, password: string, name: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  resendVerification: () => Promise<void>
  refresh: () => Promise<boolean> // läser om kontot, true om e-posten nu är bekräftad
  signOut: () => Promise<void>
}

// Länken i mejlen leder tillbaka till appen
const continueUrl = () => ({ url: location.origin + '/#/plan' })

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(!cloudEnabled)
  const [, setVersion] = useState(0) // samma User-objekt uppdateras på plats vid reload, så rendera om manuellt

  useEffect(() => {
    if (!auth) return
    void getRedirectResult(auth).catch(() => {}) // efter inloggning via omdirigering på mobil
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setReady(true)
    })
  }, [])

  return {
    enabled: cloudEnabled,
    ready,
    user,
    signIn: async () => {
      if (!auth) return
      const provider = new GoogleAuthProvider()
      try {
        await signInWithPopup(auth, provider)
      } catch (e) {
        // På mobil och i hemskärmsappar blockeras ofta popup-fönster, då går vi via omdirigering
        const code = (e as { code?: string }).code ?? ''
        if (['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment', 'auth/cancelled-popup-request'].includes(code)) await signInWithRedirect(auth, provider)
        else throw e
      }
    },
    signInEmail: async (email, password) => {
      if (auth) await signInWithEmailAndPassword(auth, email.trim(), password)
    },
    signUpEmail: async (email, password, name) => {
      if (!auth) return
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
      if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() })
      await sendEmailVerification(cred.user, continueUrl())
      setVersion((v) => v + 1)
    },
    resetPassword: async (email) => {
      if (auth) await sendPasswordResetEmail(auth, email.trim(), continueUrl())
    },
    resendVerification: async () => {
      if (auth?.currentUser) await sendEmailVerification(auth.currentUser, continueUrl())
    },
    refresh: async () => {
      const u = auth?.currentUser
      if (!u) return false
      await u.reload()
      if (u.emailVerified) await u.getIdToken(true) // ny token med email_verified = true, som Firestore-reglerna kräver
      setUser(auth!.currentUser)
      setVersion((v) => v + 1)
      return u.emailVerified
    },
    signOut: async () => {
      if (auth) await signOut(auth)
    },
  }
}
