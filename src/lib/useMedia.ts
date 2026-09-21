import { useEffect, useState } from 'react'

// Följer en media query (t.ex. mobilbredd eller beröringsskärm)
export const useMedia = (query: string) => {
  const [match, setMatch] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false))
  useEffect(() => {
    const m = window.matchMedia(query)
    const on = () => setMatch(m.matches)
    on()
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [query])
  return match
}

export const MOBILE = '(max-width: 800px)'
export const TOUCH = '(hover: none) and (pointer: coarse)'
