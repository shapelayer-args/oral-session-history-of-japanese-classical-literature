import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { loadPresets, presetIndex, PRESET_DIR, SCHEMA_DIR } from './scripts/presets.ts'

/**
 * Ships the quizzes in GENERATED/QUIZ with the viewer as presets/index.json
 * plus presets/<file>.json, and the JSON Schemas under schema/. The dev server
 * serves them live from the repository; the build emits them as assets. A
 * preset that fails validation fails the build.
 */
function quizPresets(): Plugin {
  const schemas = ['quiz.schema.json', 'presets.schema.json']
  return {
    name: 'quiz-presets',
    configureServer(server) {
      server.watcher.add(PRESET_DIR)
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? '').split('?')[0]!.replace(/^.*?\/(presets|schema)\//, '$1/')
        const send = (body: string) => {
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.setHeader('Cache-Control', 'no-store')
          res.end(body)
        }
        try {
          if (path === 'presets/index.json') return send(JSON.stringify(presetIndex(loadPresets()), null, 2))
          const preset = /^presets\/([^/]+\.json)$/.exec(path)
          if (preset) {
            const found = loadPresets().find((p) => p.file === decodeURIComponent(preset[1]!))
            if (found) return send(found.source)
          }
          const schema = /^schema\/([^/]+\.json)$/.exec(path)
          if (schema && schemas.includes(schema[1]!)) return send(readFileSync(join(SCHEMA_DIR, schema[1]!), 'utf8'))
        } catch (error) {
          res.statusCode = 500
          return send(JSON.stringify({ error: (error as Error).message }))
        }
        next()
      })
    },
    generateBundle() {
      const presets = loadPresets()
      this.emitFile({ type: 'asset', fileName: 'presets/index.json', source: JSON.stringify(presetIndex(presets), null, 2) })
      for (const p of presets) this.emitFile({ type: 'asset', fileName: `presets/${p.file}`, source: p.source })
      for (const s of schemas) this.emitFile({ type: 'asset', fileName: `schema/${s}`, source: readFileSync(join(SCHEMA_DIR, s), 'utf8') })
    },
  }
}

// Relative asset paths: the same build works at a domain root and under
// /<repo>/quiz-viewer/ on GitHub Pages. VITE_BASE overrides it.
export default defineConfig({
  base: process.env.VITE_BASE ?? './',
  plugins: [react(), quizPresets()],
  resolve: { dedupe: ['react', 'react-dom'] },
  build: { outDir: 'dist', target: 'es2022', sourcemap: false },
  server: { port: 5173, host: '127.0.0.1' },
})
