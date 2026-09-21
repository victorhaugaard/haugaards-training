import { createContext, useContext, useState, type ReactNode } from 'react'
import { ZONE_SYSTEMS, type ZoneSystem } from './cards'
import { tr } from '../i18n/core'
import { useLang } from '../i18n'

const KEY = 'haugaards-training:zones'

interface Ctx {
  system: ZoneSystem
  setSystem: (s: ZoneSystem) => void
  labels: string[]
  names: string[]
}

const ZoneContext = createContext<Ctx>({ system: 'no', setSystem: () => {}, ...ZONE_SYSTEMS.no })

export function ZoneProvider({ children }: { children: ReactNode }) {
  useLang() // renderas om när språket byts så att zonnamnen översätts
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
  return <ZoneContext.Provider value={{ system, setSystem, labels: ZONE_SYSTEMS[system].labels, names: ZONE_SYSTEMS[system].names.map((n) => tr(n)) }}>{children}</ZoneContext.Provider>
}

export const useZones = () => useContext(ZoneContext)
