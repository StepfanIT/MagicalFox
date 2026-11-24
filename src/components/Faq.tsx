import { faq } from '../content'

export default function Faq() {
  return (
    <section id="faq" className="on-light relative -mt-px bg-paper" aria-labelledby="faq-title">
      <div className="wrap grid gap-x-12 gap-y-10 pb-20 lg:grid-cols-12 lg:pb-28">
        <h2 id="faq-title" className="h-title lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
          Питання перед стартом
        </h2>
        <div className="border-t-2 border-ink lg:col-span-8">
          {faq.map((item) => (
            <details key={item.q} className="border-b border-rule">
              <summary className="flex min-h-16 items-center justify-between gap-6 py-4">
                <h3 className="text-lg leading-snug sm:text-xl">{item.q}</h3>
                <svg viewBox="0 0 16 16" className="faq-sign size-4 flex-none" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                  <path d="M8 0v16M0 8h16" />
                </svg>
              </summary>
              <p className="max-w-[64ch] pb-6 text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
