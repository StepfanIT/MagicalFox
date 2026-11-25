import { useState, type FormEvent } from 'react'
import { useBrief } from '../brief'
import { contacts } from '../config'
import { serviceName } from '../content'
import { directToTelegram, telegramLink } from '../lead'
import { track } from '../track'

type Status = 'idle' | 'sending' | 'sent' | 'failed' | 'handed'

export default function Contact() {
  const { selected, toggleService } = useBrief()
  const [status, setStatus] = useState<Status>('idle')
  const [invalid, setInvalid] = useState(false)
  const [copied, setCopied] = useState(false)
  const [leadText, setLeadText] = useState('')
  const services = [...selected]

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>
    if (data.contact.trim().length < 4) {
      setInvalid(true)
      form.querySelector<HTMLInputElement>('#lead-contact')?.focus()
      return
    }
    setInvalid(false)
    setCopied(false)
    const brief = services.map(serviceName).join(', ')
    const text = [
      data.name && `Імʼя: ${data.name}`,
      `Контакт: ${data.contact}`,
      brief && `Схема: ${brief}`,
      data.message && `Задача: ${data.message}`,
    ]
      .filter(Boolean)
      .join('\n')
    setLeadText(text)
    if (data.company) return setStatus('sent')
    if (directToTelegram) {
      window.open(telegramLink(text), '_blank', 'noopener')
      setStatus('handed')
      track('lead_telegram', { services: services.length })
      return
    }
    setStatus('sending')
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...data, brief }),
      })
      const result = await response.json()
      if (!response.ok || result.ok !== true) throw new Error(`lead ${response.status}`)
      setStatus('sent')
      track('lead_sent', { services: services.length })
    } catch {
      setStatus('failed')
      track('lead_failed')
    }
  }

  return (
    <section id="contact" className="on-light relative -mt-px bg-gold" aria-labelledby="contact-title">
      <div className="wrap grid gap-x-16 gap-y-10 py-20 lg:grid-cols-12 lg:py-28">
        <div className="lg:col-span-5">
          <h2 id="contact-title" className="h-title">
            Розкажіть, що має запрацювати
          </h2>
          <p className="mt-5 max-w-[42ch] text-lg">
            Достатньо кількох слів. Поставимо уточнювальні питання та запропонуємо перший крок.
          </p>
          <ContactLinks className="mt-8" />
        </div>

        <div data-leads={directToTelegram ? 'telegram' : 'server'} className="corner on-dark bg-ink p-5 sm:p-9 lg:col-span-7" style={{ '--cut': '2.25rem' } as React.CSSProperties}>
          {status === 'sent' ? (
            <div className="py-10" role="status">
              <p className="font-display text-3xl leading-tight">Заявку надіслано</p>
              <p className="mt-3 text-lg text-muted">Ми прочитаємо її та напишемо на вказаний контакт.</p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <p className="pr-10">
                  {services.length ? 'У вашій схемі' : 'Схему ще не зібрано. Можна надіслати й без неї.'}
                </p>
                {services.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {services.map((id) => (
                      <li key={id}>
                        <button
                          type="button"
                          onClick={() => toggleService(id)}
                          aria-label={`Прибрати: ${serviceName(id)}`}
                          className="inline-flex min-h-10 items-center gap-2.5 border border-gold px-3 text-[0.95rem] text-gold transition-colors hover:bg-gold hover:text-ink"
                        >
                          {serviceName(id)}
                          <svg viewBox="0 0 10 10" className="size-2.5" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                            <path d="M1 1l8 8M9 1 1 9" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <label htmlFor="lead-name" className="mb-1.5 block text-[0.95rem]">Як до вас звертатися</label>
                <input id="lead-name" name="name" className="field" autoComplete="name" maxLength={80} />
              </div>
              <div>
                <label htmlFor="lead-contact" className="mb-1.5 block text-[0.95rem]">Телефон, Telegram або email</label>
                <input
                  id="lead-contact"
                  name="contact"
                  className="field"
                  required
                  maxLength={120}
                  aria-invalid={invalid}
                  aria-describedby={invalid ? 'lead-contact-error' : undefined}
                  onChange={() => invalid && setInvalid(false)}
                />
                {invalid && (
                  <p id="lead-contact-error" className="mt-1.5 text-[0.95rem] text-danger">
                    Залиште контакт, щоб ми могли відповісти.
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="lead-message" className="mb-1.5 block text-[0.95rem]">Що відбувається зараз і що має змінитися</label>
                <textarea
                  id="lead-message"
                  name="message"
                  className="field min-h-32 resize-y"
                  maxLength={2000}
                  placeholder="Наприклад: 40 заявок на день з Instagram, менеджери переносять їх у таблицю вручну"
                />
              </div>
              <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px]" />
              <div className="flex flex-wrap items-center gap-x-6 gap-y-4 sm:col-span-2">
                <button type="submit" className="btn" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Надсилаємо…' : directToTelegram ? 'Надіслати в Telegram' : 'Надіслати заявку'}
                </button>
                <p className="max-w-[34ch] text-[0.9rem] leading-snug text-muted">
                  Дані використаємо лише для відповіді на цю заявку.
                </p>
              </div>
              {(status === 'failed' || status === 'handed') && (
                <div className={`border p-4 sm:col-span-2 ${status === 'failed' ? 'border-danger' : 'border-gold'}`} role="alert">
                  <p>
                    {status === 'failed'
                      ? 'Заявка не надіслалася. Спробуйте ще раз або надішліть цей текст нам напряму.'
                      : 'Лишився один крок: натисніть «Надіслати» в Telegram. Якщо він не відкрився, скористайтеся посиланням нижче.'}
                  </p>
                  <pre className="mt-3 font-sans text-[0.95rem] whitespace-pre-wrap text-muted">{leadText}</pre>
                  <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                    <button
                      type="button"
                      className="link min-h-11"
                      onClick={() =>
                        navigator.clipboard.writeText(leadText).then(() => setCopied(true), () => setCopied(false))
                      }
                    >
                      {copied ? 'Скопійовано' : 'Скопіювати текст'}
                    </button>
                    <ContactLinks text={leadText} />
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

export function ContactLinks({ className = '', text }: { className?: string; text?: string }) {
  const { selected } = useBrief()
  const draft = text ?? (selected.size ? `Доброго дня! Цікавить: ${[...selected].map(serviceName).join(', ')}` : '')
  const items = [
    contacts.telegram && [telegramLink(draft), `Telegram: @${contacts.telegram}`],
    contacts.phone && [`tel:${contacts.phone}`, contacts.phone],
    contacts.email && [`mailto:${contacts.email}`, contacts.email],
  ].filter((x): x is string[] => Boolean(x))
  if (!items.length) return null
  return (
    <ul className={`flex flex-wrap gap-x-7 gap-y-2 ${className}`}>
      {items.map(([href, label]) => (
        <li key={href}>
          <a href={href} className="link inline-block py-2" {...(href.startsWith('http') && { target: '_blank', rel: 'noopener' })} onClick={() => track('contact_click', { to: label })}>
            {label}
          </a>
        </li>
      ))}
    </ul>
  )
}
