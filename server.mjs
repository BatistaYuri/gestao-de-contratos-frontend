import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'

const port = Number(process.env.PORT ?? 3000)
const distDirectory = join(import.meta.dirname, 'dist')
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

async function resolveFile(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, 'http://localhost').pathname)
  const relativePath = normalize(pathname).replace(/^(\.\.[/\\])+/, '').replace(/^[/\\]+/, '')
  const candidate = join(distDirectory, relativePath)

  try {
    if ((await stat(candidate)).isFile()) return candidate
  } catch {
    // Client-side routes are served by the SPA entry point.
  }

  return join(distDirectory, 'index.html')
}

const server = createServer(async (request, response) => {
  try {
    const file = await resolveFile(request.url ?? '/')
    response.writeHead(200, {
      'Content-Type': contentTypes[extname(file)] ?? 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
    })

    if (request.method === 'HEAD') return response.end()
    createReadStream(file).pipe(response)
  } catch {
    response.writeHead(500).end('Internal Server Error')
  }
})

server.listen(port, '0.0.0.0', () => {
  console.log(`Frontend listening on port ${port}`)
})
