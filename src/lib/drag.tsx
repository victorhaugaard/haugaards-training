import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

export interface DragState {
  kind: 'session' | 'card'
  id: string
  h: number // höjd på kortet som dras, används för luckan
}
export interface Over {
  date: string
  index: number
}

interface Ctx {
  drag: DragState | null
  over: Over | null
  start: (d: DragState) => void
  end: () => void
  setOver: (o: Over | null) => void
}

const DragContext = createContext<Ctx>({ drag: null, over: null, start: () => {}, end: () => {}, setOver: () => {} })

export function DragProvider({ children }: { children: ReactNode }) {
  const [drag, setDrag] = useState<DragState | null>(null)
  const [over, setOverState] = useState<Over | null>(null)

  // Vänta en bildruta så att webbläsaren hinner ta "drag-bilden" innan originalet fälls ihop
  const start = useCallback((d: DragState) => {
    requestAnimationFrame(() => setDrag(d))
  }, [])
  const end = useCallback(() => {
    setDrag(null)
    setOverState(null)
  }, [])
  const setOver = useCallback((o: Over | null) => {
    setOverState((prev) => (prev?.date === o?.date && prev?.index === o?.index ? prev : o))
  }, [])

  const value = useMemo(() => ({ drag, over, start, end, setOver }), [drag, over, start, end, setOver])
  return <DragContext.Provider value={value}>{children}</DragContext.Provider>
}

export const useDrag = () => useContext(DragContext)
