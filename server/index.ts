// Один процес: віддає зібраний сайт із dist, приймає заявки на /api/lead і тримає Telegram-бота.
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { extname, join, resolve, sep } from 'node:path'
import { contacts } from '../src/config.ts'
import { createBot } from './bot.ts'
import { clean, LeadStore, rateLimiter } from './leads.ts'

const root = resolve(import.meta.dirname, '..')
if (existsSync(join(root, '.env'))) process.loadEnvFile(join(root, '.env'))

const { TELEGRAM_BOT_TOKEN: token = '', TELEGRAM_CHAT_ID = '' } = process.env
const adminId = Number(TELEGRAM_CHAT_ID)
if (!token || !Number.isSafeInteger(adminId) || adminId === 0) {
  console.error('Задайте TELEGRAM_BOT_TOKEN і TELEGRAM_CHAT_ID у файлі .env')
  process.exit(1)
}

const siteUrl = process.env.VITE_SITE_URL ?? ''
const siteHost = URL.canParse(siteUrl) ? new URL(siteUrl).host : ''
const dist = join(root, 'dist')
const port = Number(process.env.PORT) || 3000
const host = process.env.HOST || '127.0.0.1'

const store = new LeadStore(process.env.LEADS_FILE || join(root, 'data', 'leads.json'))
const bot = createBot({
  token,
  adminId,
  store,
  contact: contacts.telegram,
  siteUrl,
  apiUrl: process.env.TELEGRAM_API_URL || 'https://api.telegram.org',
})
const allow = rateLimiter(5, 10 * 60_000)

const securityHeaders = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
  'Strict-Transport-Security': 'max-age=63072000',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

const types: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
}

function json(res: ServerResponse, status: number, ok: boolean) {
  res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' })
  res.end(JSON.stringify({ ok }))
}

// X-Forwarded-For беремо лише від проксі на цій самій машині, інакше його можна підробити.
function clientIp(req: IncomingMessage) {
  const address = req.socket.remoteAddress ?? ''
  const local = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(address)
  const forwarded = String(req.headers['x-forwarded-for'] ?? '').split(',').at(-1)!.trim()
  return local && forwarded ? forwarded : address
}

async function readBody(req: IncomingMessage, max: number) {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req as AsyncIterable<Buffer>) {
    size += chunk.length
    if (size > max) return null
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

async function handleLead(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') return json(res, 405, false)
  if (!req.headers['content-type']?.startsWith('application/json')) return json(res, 415, false)

  const origin = req.headers.origin
  if (origin) {
    const from = URL.canParse(origin) ? new URL(origin).host : ''
    if (!from || (from !== req.headers.host && from !== siteHost)) return json(res, 403, false)
  }

  const raw = await readBody(req, 16_000)
  if (raw === null) return json(res, 413, false)

  let data: Record<string, unknown>
  try {
    data = JSON.parse(raw)
  } catch {
    return json(res, 400, false)
  }
  if (!data || typeof data !== 'object') return json(res, 400, false)

  // Поле-пастка: людина його не бачить, тож заповнює лише спам-бот.
  if (clean(data.company, 100)) return json(res, 200, true)

  const contact = clean(data.contact, 120)
  if (contact.length < 4) return json(res, 422, false)
  if (!allow(clientIp(req))) return json(res, 429, false)

  store.add({
    source: 'site',
    name: clean(data.name, 80),
    contact,
    brief: clean(data.brief, 600),
    message: clean(data.message, 2000),
  })
  // Заявка вже на диску, тому відповідь не чекає на Telegram.
  json(res, 200, true)
  void bot.flush()
}

function serveFile(req: IncomingMessage, res: ServerResponse, pathname: string) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405).end()
    return
  }
  let path: string
  try {
    path = decodeURIComponent(pathname)
  } catch {
    res.writeHead(400).end()
    return
  }
  const file = resolve(dist, `.${path.endsWith('/') ? `${path}index.html` : path}`)
  const inside = file.startsWith(dist + sep) && !path.includes('\0')
  if (!inside || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Сторінку не знайдено')
    return
  }
  res.writeHead(200, {
    'content-type': types[extname(file)] ?? 'application/octet-stream',
    'content-length': statSync(file).size,
    'cache-control': path.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
  })
  if (req.method === 'HEAD') res.end()
  else createReadStream(file).on('error', () => res.destroy()).pipe(res)
}

const server = createServer((req, res) => {
  for (const [name, value] of Object.entries(securityHeaders)) res.setHeader(name, value)
  const pathname = (req.url ?? '/').split('?')[0]
  if (pathname !== '/api/lead') return serveFile(req, res, pathname)
  handleLead(req, res).catch((error: Error) => {
    console.error('Заявку не збережено:', error.message)
    if (!res.headersSent) json(res, 500, false)
  })
})
server.requestTimeout = 15_000

// Старий dist без заявок на сервер не підходить, тож попереджаємо одразу.
if (!existsSync(join(dist, 'index.html'))) console.warn('Немає dist. Спершу виконайте npm run build')
else if (readFileSync(join(dist, 'index.html'), 'utf8').includes('data-leads="telegram"'))
  console.warn('dist зібрано для GitHub Pages: форма відкриває Telegram. Виконайте npm run build без VITE_LEADS')

server.listen(port, host, () => {
  console.log(`Сайт: http://${host}:${port}`)
  bot.start()
})

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    bot.stop()
    server.close(() => process.exit(0))
    server.closeAllConnections()
  })
}
