// Заявки: перевірка вхідних даних і збереження у файл, щоб жодна не загубилася, навіть якщо Telegram недоступний.
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

export type Status = 'new' | 'work' | 'done'

export type Lead = {
  id: number
  at: string
  source: 'site' | 'bot'
  name: string
  contact: string
  brief: string
  message: string
  status: Status
  /** Чат клієнта, якщо він написав боту. Сюди йдуть відповіді адміністратора. */
  chatId?: number
  /** Повідомлення в чаті адміністратора. Поки його немає, заявка чекає на відправку. */
  messageId?: number
}

export const clean = (value: unknown, max: number) =>
  typeof value === 'string'
    ? value.replace(/\p{Cc}/gu, (c) => (c === '\n' ? c : ' ')).trim().slice(0, max).toWellFormed()
    : ''

export class LeadStore {
  readonly file: string
  private leads: Lead[]

  constructor(file: string) {
    this.file = file
    mkdirSync(dirname(file), { recursive: true })
    // Пошкоджений файл має зупинити запуск, а не бути тихо перезаписаним.
    this.leads = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : []
  }

  add(data: Pick<Lead, 'source' | 'name' | 'contact' | 'brief' | 'message' | 'chatId'>): Lead {
    const lead: Lead = {
      id: (this.leads.at(-1)?.id ?? 0) + 1,
      at: new Date().toISOString(),
      status: 'new',
      ...data,
    }
    this.leads.push(lead)
    try {
      this.save()
    } catch (error) {
      this.leads.pop()
      throw error
    }
    return lead
  }

  update(lead: Lead, patch: Partial<Pick<Lead, 'status' | 'messageId'>>) {
    Object.assign(lead, patch)
    this.save()
  }

  get = (id: number) => this.leads.find((l) => l.id === id)
  byMessage = (messageId: number) => this.leads.find((l) => l.messageId === messageId)
  unsent = () => this.leads.filter((l) => l.messageId === undefined)
  open = () => this.leads.filter((l) => l.status !== 'done')

  private save() {
    writeFileSync(`${this.file}.tmp`, JSON.stringify(this.leads, null, 1), { mode: 0o600 })
    renameSync(`${this.file}.tmp`, this.file)
  }
}

/** Не більше limit звернень за вікно від одного джерела. */
export function rateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, number[]>()
  return (key: string) => {
    const now = Date.now()
    if (hits.size > 5000) for (const [k, v] of hits) if (now - v.at(-1)! > windowMs) hits.delete(k)
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
    if (recent.length >= limit) return false
    recent.push(now)
    hits.set(key, recent)
    return true
  }
}
