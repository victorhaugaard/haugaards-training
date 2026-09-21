import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Kör samma funktion som på Vercel (api/coach.ts) under `npm run dev`
function coachApi(): Plugin {
  return {
    name: 'coach-api',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '')
      for (const k in env) if (process.env[k] === undefined) process.env[k] = env[k]
      server.middlewares.use('/api/coach', async (req, res) => {
        try {
          const mod = await server.ssrLoadModule('/api/coach.ts')
          await mod.default(req, res)
        } catch (e) {
          res.statusCode = 500
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify({ error: 'server', detail: String(e) }))
        }
      })
    },
  }
}

export default defineConfig({ plugins: [react(), coachApi()] })
