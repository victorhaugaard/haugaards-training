import { useEffect, useState } from 'react'
import { GoogleAuthProvider, getRedirectResult, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut, type User } from 'firebase/auth'
import { auth, cloudEnabled } from './firebase'

export interface AuthState {
  enabled: boolean
  ready: boolean
  user: User | null
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(!cloudEnabled)

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
    signOut: async () => {
      if (auth) await signOut(auth)
    },
  }
}
