// Події для Google Tag Manager або GA4. Без підключеного лічильника просто накопичуються в масиві.
declare global {
  interface Window {
    dataLayer?: unknown[]
  }
}

export function track(event: string, params: Record<string, string | number> = {}) {
  ;(window.dataLayer ??= []).push({ event, ...params })
}
