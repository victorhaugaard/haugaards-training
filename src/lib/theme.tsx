import { createContext, useContext, useState, type ReactNode } from 'react'

export type Theme = 'blue' | 'mono'
const KEY = 'haugaards-training:theme'

const read = (): Theme => {
  try {
    return localStorage.getItem(KEY) === 'mono' ? 'mono' : 'blue'
  } catch {
    return 'blue'
  }
}
const apply = (t: Theme) => {
  document.documentElement.dataset.theme = t
}
apply(read()) // direkt vid start så att sidan inte blinkar

const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({ theme: 'blue', setTheme: () => {} })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, set] = useState<Theme>(read)
  const setTheme = (t: Theme) => {
    set(t)
    apply(t)
    try {
      localStorage.setItem(KEY, t)
    } catch {
      /* ignorera */
    }
  }
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
