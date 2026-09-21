import { createContext, useContext, useState, type ReactNode } from 'react'
import { ZONE_SYSTEMS, type ZoneSystem } from './cards'

const KEY = 'haugaards-training:zones'

interface Ctx {
  system: ZoneSystem
  setSystem: (s: ZoneSystem) => void
  labels: string[]
  names: string[]
}

const ZoneContext = createContext<Ctx>({ system: 'no', setSystem: () => {}, ...ZONE_SYSTEMS.no })

export function ZoneProvider({ children }: { children: ReactNode }) {
  const [system, set] = useState<ZoneSystem>(() => {
    try {
      return localStorage.getItem(KEY) === 'us' ? 'us' : 'no'
    } catch {
      return 'no'
    }
  })
  const setSystem = (s: ZoneSystem) => {
    set(s)
    try {
      localStorage.setItem(KEY, s)
    } catch {
      /* ignorera */
    }
  }
  return <ZoneContext.Provider value={{ system, setSystem, ...ZONE_SYSTEMS[system] }}>{children}</ZoneContext.Provider>
}

export const useZones = () => useContext(ZoneContext)
