import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { ZoneProvider } from './lib/zones'
import { LangProvider } from './i18n'
import { ThemeProvider } from './lib/theme'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider>
      <ThemeProvider>
        <ZoneProvider>
          <App />
        </ZoneProvider>
      </ThemeProvider>
    </LangProvider>
  </StrictMode>,
)
