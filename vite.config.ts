import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Kör api/*.ts-funktionerna lokalt under `npm run dev`, precis som de körs på Vercel
function apiRoutes(): Plugin {
  const names = ['coach', 'strava-connect', 'strava-callback', 'strava-disconnect', 'strava-webhook']
  return {
    name: 'api-routes',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '')
      for (const k in env) if (process.env[k] === undefined) process.env[k] = env[k]
      for (const name of names) {
        server.middlewares.use(`/api/${name}`, async (req, res) => {
          try {
            const mod = await server.ssrLoadModule(`/api/${name}.ts`)
            await mod.default(req, res)
          } catch (e) {
            res.statusCode = 500
            res.setHeader('content-type', 'application/json')
            res.end(JSON.stringify({ error: 'server', detail: String(e) }))
          }
        })
      }
    },
  }
}

export default defineConfig({ plugins: [react(), apiRoutes()] })
