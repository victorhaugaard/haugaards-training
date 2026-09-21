import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { ZoneProvider } from './lib/zones'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ZoneProvider>
      <App />
    </ZoneProvider>
  </StrictMode>,
)
