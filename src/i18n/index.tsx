import { createContext, useContext, useState, type ReactNode } from 'react'
import { getLang, setCurrentLang, type Lang } from './core'
import './translations'

interface Ctx {
  lang: Lang
  setLang: (l: Lang) => void
}

const LangContext = createContext<Ctx>({ lang: 'sv', setLang: () => {} })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, set] = useState<Lang>(getLang())
  const setLang = (l: Lang) => {
    setCurrentLang(l)
    set(l)
  }
  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

// Komponenter som använder hooken renderas om när språket byts, och därmed hela trädet under dem
export const useLang = () => useContext(LangContext)

// **fet** text i översättningar
export const rich = (s: string) =>
  s.split('**').map((part, i) => (i % 2 ? <b key={i}>{part}</b> : part))
