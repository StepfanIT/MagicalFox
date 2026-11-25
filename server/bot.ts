// Telegram-бот: надсилає заявки адміністратору, веде їх статус і приймає звернення клієнтів у чаті.
import { clean, rateLimiter, type Lead, type LeadStore, type Status } from './leads.ts'

type User = { id: number; first_name?: string; username?: string }
type Message = {
  message_id: number
  chat: { id: number; type: string }
  from?: User
  text?: string
  reply_to_message?: { message_id: number }
}
type Update = {
  update_id: number
  message?: Message
  callback_query?: { id: string; from: User; data?: string }
}

type Options = { token: string; adminId: number; store: LeadStore; contact: string; siteUrl: string; apiUrl: string }

const statusLabel: Record<Status, string> = { new: '🟡 Нова', work: '🔵 У роботі', done: '✅ Закрита' }

const help =
  'Сюди приходять заявки із сайту та від людей, які пишуть боту.\n\n' +
  '/leads: відкриті заявки\n\n' +
  'Щоб відповісти людині, яка написала боту, дайте відповідь (Reply) на її заявку.'

const when = (iso: string) =>
  new Date(iso).toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv', dateStyle: 'short', timeStyle: 'short' })

export function leadText(lead: Lead) {
  return [
    `Заявка №${lead.id} · ${statusLabel[lead.status]}`,
    `${lead.source === 'site' ? 'Сайт' : 'Бот'}, ${when(lead.at)}`,
    `\nІмʼя: ${lead.name || 'не вказано'}`,
    `Контакт: ${lead.contact}`,
    lead.brief && `Схема: ${lead.brief}`,
    lead.message && `\n${lead.message}`,
  ]
    .filter(Boolean)
    .join('\n')
}

function leadButtons(lead: Lead) {
  const button = (text: string, status: Status) => ({ text, callback_data: `${status}:${lead.id}` })
  const row =
    lead.status === 'new'
      ? [button('Взяти в роботу', 'work'), button('Закрити', 'done')]
      : lead.status === 'work'
        ? [button('Закрити', 'done')]
        : [button('Відкрити знову', 'work')]
  return { inline_keyboard: [row] }
}

export function createBot({ token, adminId, store, contact, siteUrl, apiUrl }: Options) {
  const allow = rateLimiter(5, 10 * 60_000)
  const stop = new AbortController()
  let flushing = false

  async function call<T>(method: string, body: object, timeout = 10_000): Promise<T> {
    let response: Response
    try {
      response = await fetch(`${apiUrl}/bot${token}/${method}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.any([AbortSignal.timeout(timeout), stop.signal]),
      })
    } catch {
      // Текст мережевої помилки може містити адресу з токеном, тому в журнал він не йде.
      throw new Error(`${method}: немає звʼязку з Telegram`)
    }
    const result = (await response.json().catch(() => ({}))) as { ok?: boolean; result?: T; description?: string }
    if (!result.ok) throw new Error(`${method}: ${result.description ?? response.status}`)
    return result.result as T
  }

  const send = (chatId: number, text: string, extra: object = {}) =>
    call<Message>('sendMessage', { chat_id: chatId, text, link_preview_options: { is_disabled: true }, ...extra })

  /** Надсилає все, що ще не дійшло. Викликається після кожної заявки та за розкладом. */
  async function flush() {
    if (flushing) return
    flushing = true
    const tried = new Set<number>()
    const next = () => store.unsent().find((l) => !tried.has(l.id))
    try {
      for (let lead = next(); lead; lead = next()) {
        tried.add(lead.id)
        try {
          const sent = await send(adminId, leadText(lead), { reply_markup: leadButtons(lead) })
          store.update(lead, { messageId: sent.message_id })
        } catch (error) {
          console.error(`Заявка №${lead.id} чекає в черзі. ${(error as Error).message}`)
          // Одна відхилена заявка не тримає решту, але без звʼязку пробувати далі немає сенсу.
          if (!(error as Error).message.includes('Bad Request')) break
        }
      }
    } finally {
      flushing = false
    }
  }

  async function onAdmin(message: Message) {
    const text = message.text ?? ''
    if (text.startsWith('/start') || text.startsWith('/help')) {
      await send(adminId, help)
      return flush()
    }
    if (text.startsWith('/leads')) {
      const open = store.open()
      if (!open.length) return void (await send(adminId, 'Відкритих заявок немає.'))
      const lines = open
        .slice(-15)
        .reverse()
        .map((l) => `№${l.id} · ${statusLabel[l.status]} · ${l.name || l.contact}\n${l.contact}${l.brief ? `, ${l.brief}` : ''}`.slice(0, 240))
      return void (await send(adminId, `Відкриті заявки: ${open.length}\n\n${lines.join('\n\n')}`))
    }
    if (message.reply_to_message) {
      const lead = store.byMessage(message.reply_to_message.message_id)
      if (!lead) return void (await send(adminId, 'Не знайшов заявку. Дайте відповідь саме на повідомлення із заявкою.'))
      if (!lead.chatId) return void (await send(adminId, `Ця заявка із сайту, напишіть напряму: ${lead.contact}`))
      if (!text) return void (await send(adminId, 'Поки передаю лише текст.'))
      await send(lead.chatId, text)
      if (lead.status === 'new') await setStatus(lead, 'work')
      return void (await send(adminId, `Надіслано (заявка №${lead.id}).`))
    }
    await send(adminId, help)
  }

  async function onClient(message: Message) {
    const { chat, from } = message
    const text = clean(message.text, 2000)
    if (text.startsWith('/')) {
      const links = [
        siteUrl && { text: 'Відкрити сайт', url: siteUrl },
        contact && { text: 'Написати людині', url: `https://t.me/${contact}` },
      ].filter(Boolean)
      return void (await send(
        chat.id,
        'Вітаємо в Magical Fox Studio. Опишіть одним повідомленням, що має запрацювати, і ми відповімо тут.',
        links.length ? { reply_markup: { inline_keyboard: [links] } } : {},
      ))
    }
    if (!allow(String(chat.id))) return
    if (!text) return void (await send(chat.id, 'Напишіть, будь ласка, текстом.'))
    store.add({
      source: 'bot',
      name: clean(from?.first_name, 80),
      contact: from?.username ? `@${from.username}` : 'відповідь через Reply',
      brief: '',
      message: text,
      chatId: chat.id,
    })
    await send(chat.id, 'Дякуємо, передали. Відповімо тут.')
    await flush()
  }

  async function setStatus(lead: Lead, status: Status) {
    store.update(lead, { status })
    await call('editMessageText', {
      chat_id: adminId,
      message_id: lead.messageId,
      text: leadText(lead),
      reply_markup: leadButtons(lead),
      link_preview_options: { is_disabled: true },
    })
  }

  async function onUpdate(update: Update) {
    const query = update.callback_query
    if (query) {
      const [status, id] = (query.data ?? '').split(':')
      const lead = store.get(Number(id))
      const known = status === 'work' || status === 'done'
      if (query.from.id === adminId && lead && known && lead.status !== status) await setStatus(lead, status)
      await call('answerCallbackQuery', { callback_query_id: query.id })
      return
    }
    const message = update.message
    if (message?.chat.type !== 'private') return
    await (message.from?.id === adminId ? onAdmin(message) : onClient(message))
  }

  async function poll() {
    let offset = 0
    while (!stop.signal.aborted) {
      try {
        const updates = await call<Update[]>(
          'getUpdates',
          { offset, timeout: 50, allowed_updates: ['message', 'callback_query'] },
          60_000,
        )
        for (const update of updates) {
          offset = update.update_id + 1
          await onUpdate(update).catch((error: Error) => console.error(error.message))
        }
      } catch (error) {
        if (stop.signal.aborted) return
        console.error((error as Error).message)
        await new Promise((resolve) => setTimeout(resolve, 5000))
      }
    }
  }

  return {
    flush,
    start() {
      call('setMyCommands', { commands: [{ command: 'start', description: 'Почати' }] }).catch((e: Error) =>
        console.error(e.message),
      )
      call('setMyCommands', {
        commands: [{ command: 'leads', description: 'Відкриті заявки' }],
        scope: { type: 'chat', chat_id: adminId },
      }).catch(() => {}) // Не спрацює, доки адміністратор не натисне Start. Це не помилка.
      void poll()
      void flush()
      setInterval(flush, 30_000).unref()
    },
    stop: () => stop.abort(),
  }
}
