// Vem som får använda appen. Admins är fasta (samma lista i firestore.rules och storage.rules),
// övriga konton läggs till i appen under Meny → Hantera åtkomst och sparas i Firestore-samlingen access.
import { useEffect, useState } from 'react'
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

export const ADMIN_EMAILS = ['victortomashaugaard@gmail.com', 'ohaug01@gmail.com']
export const isAdmin = (email?: string | null) => !!email && ADMIN_EMAILS.includes(email.toLowerCase())

export interface AccessEntry {
  email: string
  addedBy: string
  addedAt: number
}

export const normEmail = (s: string) => s.trim().toLowerCase()
export const validEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)

export const useAccessList = (enabled: boolean) => {
  const [list, setList] = useState<AccessEntry[] | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    if (!enabled || !db) return
    return onSnapshot(
      collection(db, 'access'),
      (snap) => setList(snap.docs.map((d) => d.data() as AccessEntry).sort((a, b) => a.email.localeCompare(b.email))),
      (e) => setError(e.message),
    )
  }, [enabled])
  return { list, error }
}

// Dokument-id = e-postadressen i gemener, så att reglerna kan slå upp den direkt
export const grantAccess = (email: string, by: string) => setDoc(doc(db!, 'access', normEmail(email)), { email: normEmail(email), addedBy: by, addedAt: Date.now() })
export const revokeAccess = (email: string) => deleteDoc(doc(db!, 'access', normEmail(email)))
