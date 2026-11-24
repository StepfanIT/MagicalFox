import { useState } from 'react'
import { plural, useBrief } from '../brief'

const WEEKS = 48
const format = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+$)/g, ' ')

const fields = [
  { key: 'people', label: 'Скільки людей роблять рутину', min: 1, max: 30, step: 1, show: (n: number) => `${n}` },
  { key: 'hours', label: 'Годин рутини на тиждень у кожного', min: 1, max: 40, step: 1, show: (n: number) => `${n} год` },
  { key: 'rate', label: 'Вартість години працівника', min: 80, max: 1500, step: 10, show: (n: number) => `${format(n)} грн` },
  { key: 'share', label: 'Яку частину можна автоматизувати', min: 10, max: 90, step: 5, show: (n: number) => `${n} %` },
] as const

export default function Calculator() {
  const [v, setV] = useState({ people: 3, hours: 10, rate: 250, share: 60 })
  const { selected, toggleService } = useBrief()

  const hours = v.people * v.hours * WEEKS
  const cost = hours * v.rate
  const savedHours = Math.round((hours * v.share) / 100)

  return (
    <section id="calculator" className="on-dark wrap py-20 lg:py-28" aria-labelledby="calc-title">
      <h2 id="calc-title" className="h-title max-w-[18ch]">
        Скільки коштує ручна робота
      </h2>
      <div className="mt-12 grid gap-x-20 gap-y-12 lg:grid-cols-2">
        <div className="grid content-start gap-5">
          {fields.map((f) => (
            <div key={f.key}>
              <div className="flex items-baseline justify-between gap-4">
                <label htmlFor={`calc-${f.key}`} className="text-muted">
                  {f.label}
                </label>
                <output htmlFor={`calc-${f.key}`} className="font-display text-xl whitespace-nowrap tabular-nums">
                  {f.show(v[f.key])}
                </output>
              </div>
              <input
                id={`calc-${f.key}`}
                type="range"
                className="range"
                min={f.min}
                max={f.max}
                step={f.step}
                value={v[f.key]}
                aria-valuetext={f.show(v[f.key])}
                style={{ '--p': `${((v[f.key] - f.min) / (f.max - f.min)) * 100}%` } as React.CSSProperties}
                onChange={(e) => setV({ ...v, [f.key]: Number(e.target.value) })}
              />
            </div>
          ))}
        </div>

        <div>
          <p className="text-muted">За рік рутина коштує</p>
          <p className="mt-1 font-display text-[clamp(2.4rem,1.2rem+5vw,4.75rem)] leading-none font-light tracking-tight whitespace-nowrap tabular-nums">
            {format(cost)} <span className="text-[0.45em] text-muted">грн</span>
          </p>
          <div className="mx-1.5 mt-8 h-3 -skew-x-45 bg-[#45423b]" aria-hidden="true">
            <div className="h-full origin-left bg-gold" style={{ width: `${v.share}%` }} />
          </div>
          <p className="mt-6 max-w-[46ch] text-lg">
            Якщо автоматизувати {v.share}&nbsp;%, повернеться{' '}
            <strong className="font-semibold text-gold">{format((cost * v.share) / 100)}&nbsp;грн</strong> і{' '}
            <strong className="font-semibold text-gold">
              {format(savedHours)}&nbsp;{plural(savedHours, 'година', 'години', 'годин')}
            </strong>{' '}
            на рік.
          </p>
          <p className="mt-3 max-w-[52ch] text-[0.95rem] text-muted">
            Рахуємо за вашими цифрами, 48 робочих тижнів. Вартість розробки сюди не входить, її дамо в кошторисі.
          </p>
          <a
            href="#contact"
            className="btn mt-7"
            onClick={() => {
              if (!selected.has('automation')) toggleService('automation')
            }}
          >
            Дізнатися, що автоматизувати
          </a>
        </div>
      </div>
    </section>
  )
}
