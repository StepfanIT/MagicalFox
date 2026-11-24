// Приймає заявку з форми й пересилає її в Telegram. Формат Vercel Functions (Web API Request/Response).

const reply = (status: number, body: object) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

const text = (value: unknown, max: number) =>
  typeof value === 'string'
    ? value.replace(/\p{Cc}/gu, (c) => (c === '\n' ? c : ' ')).trim().slice(0, max)
    : ''

export async function POST(request: Request): Promise<Response> {
  const origin = request.headers.get('origin')
  if (origin && (!URL.canParse(origin) || new URL(origin).host !== request.headers.get('host'))) {
    return reply(403, { ok: false })
  }

  const raw = await request.text()
  if (raw.length > 8000) return reply(413, { ok: false })

  let data: Record<string, unknown>
  try {
    data = JSON.parse(raw)
  } catch {
    return reply(400, { ok: false })
  }
  if (!data || typeof data !== 'object') return reply(400, { ok: false })

  // Поле-пастка: людина його не бачить, тож заповнює лише спам-бот.
  if (text(data.company, 100)) return reply(200, { ok: true })

  const contact = text(data.contact, 120)
  if (contact.length < 4) return reply(422, { ok: false })

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return reply(503, { ok: false })

  const message = [
    'Нова заявка з сайту',
    `Імʼя: ${text(data.name, 80) || 'не вказано'}`,
    `Контакт: ${contact}`,
    `Схема: ${text(data.brief, 600) || 'не зібрано'}`,
    `Задача: ${text(data.message, 2000) || 'не описано'}`,
  ].join('\n')

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, link_preview_options: { is_disabled: true } }),
      signal: AbortSignal.timeout(8000),
    })
    return response.ok ? reply(200, { ok: true }) : reply(502, { ok: false })
  } catch {
    return reply(502, { ok: false })
  }
}
