import { useEffect, useState } from 'react'
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
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
      if (auth) await signInWithPopup(auth, new GoogleAuthProvider())
    },
    signOut: async () => {
      if (auth) await signOut(auth)
    },
  }
}
