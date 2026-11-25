import { contacts } from './config'

/** На статичному хостингу (GitHub Pages) сервера немає, тому форма відкриває Telegram із готовим текстом. */
export const directToTelegram = import.meta.env.VITE_LEADS === 'telegram' && contacts.telegram !== ''

export const telegramLink = (text: string) =>
  `https://t.me/${contacts.telegram}${text ? `?text=${encodeURIComponent(text.slice(0, 1500))}` : ''}`
