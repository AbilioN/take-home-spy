/**
 * Serves the Vite production build (`dist/`) on a separate port from the Nest API.
 * Use base path `/` (default). For builds embedded under `/dashboard` on the API, use Nest static instead.
 *
 *   npm run build && npm run start
 *   ADMIN_STATIC_PORT=3001 npm run start
 */

import http from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dist = path.resolve(__dirname, 'dist')
const PORT = Number(process.env.ADMIN_STATIC_PORT ?? 3001)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
}

function isInsideDist(candidateAbs) {
  const rel = path.relative(dist, candidateAbs)
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel))
}

const server = http.createServer(async (req, res) => {
  try {
    const host = req.headers.host ?? 'localhost'
    const url = new URL(req.url ?? '/', `http://${host}`)
    let pathname = decodeURIComponent(url.pathname).replace(/\0/g, '')
    if (pathname === '/' || pathname === '') pathname = 'index.html'
    else pathname = pathname.replace(/^\/+/, '')
    if (pathname.includes('..')) {
      res.writeHead(403).end('Forbidden')
      return
    }

    const candidate = path.resolve(dist, pathname)
    if (!isInsideDist(candidate)) {
      res.writeHead(403).end('Forbidden')
      return
    }

    try {
      const stat = await fs.stat(candidate)
      if (!stat.isFile()) throw new Error('not a file')
      const ext = path.extname(candidate)
      const body = await fs.readFile(candidate)
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
      res.end(body)
      return
    } catch {
      // SPA fallback
      const indexFile = path.join(dist, 'index.html')
      const body = await fs.readFile(indexFile)
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(body)
    }
  } catch {
    res
      .writeHead(500)
      .end('Admin build missing or unreadable. Run `npm run build` in abilio-solution/admin first.')
  }
})

server.listen(PORT, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`Admin UI (static) → http://localhost:${PORT}/ (dist from ${dist})`)
})
