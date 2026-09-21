import { useCallback, useEffect, useState } from 'react'

export interface FeedMsg {
  id: string
  coachId: string
  text: string
  at: number
  read: boolean
}

const key = (personId: string) => `haugaards-training:feed:${personId}`
const load = (personId: string): FeedMsg[] => {
  try {
    const v = JSON.parse(localStorage.getItem(key(personId)) ?? '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

// Peppmeddelanden som visas som vanliga chattmeddelanden och räknas som olästa tills chatten öppnas
export const useFeed = (personId: string) => {
  const [feed, setFeed] = useState<FeedMsg[]>(() => load(personId))
  useEffect(() => setFeed(load(personId)), [personId])
  const save = (next: FeedMsg[]) => {
    try {
      localStorage.setItem(key(personId), JSON.stringify(next.slice(-60)))
    } catch {
      /* ignorera */
    }
    return next.slice(-60)
  }
  const add = useCallback(
    (m: Omit<FeedMsg, 'id' | 'at'>) => {
      const msg: FeedMsg = { ...m, id: Math.random().toString(36).slice(2), at: Date.now() }
      setFeed((cur) => save([...cur, msg]))
      return msg
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [personId],
  )
  const markRead = useCallback(
    (coachId: string) => setFeed((cur) => (cur.some((m) => m.coachId === coachId && !m.read) ? save(cur.map((m) => (m.coachId === coachId ? { ...m, read: true } : m))) : cur)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [personId],
  )
  return { feed, add, markRead }
}
