import { useState } from 'react'
import { plural, useBrief } from '../brief'
import { pains, serviceName } from '../content'
import SystemMap from './SystemMap'

export default function Hero() {
  const { selected, shown, isExample, isPainActive, togglePain } = useBrief()
  const [lastId, setLastId] = useState(pains[0].id)

  const active = pains.filter(isPainActive)
  const scenario = active.find((p) => p.id === lastId) ?? active[0]
  const names = [...shown].map(serviceName)

  return (
    <section id="top" className="on-dark wrap pt-9 pb-20 sm:pt-11 lg:pb-28">
      <div className="grid items-end gap-x-12 gap-y-7 lg:grid-cols-12">
        <h1 className="h-hero lg:col-span-8">
          Сайти, боти й CRM, які працюють на&nbsp;бізнес <span className="text-gold">і&nbsp;захищені від зламу</span>
        </h1>
        <div className="lg:col-span-4">
          <p className="max-w-[46ch] text-lg text-muted">
            Розробка, автоматизація та кібербезпека від однієї команди. Почніть із того, що болить, а ми складемо
            систему.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-4">
            <a href="#contact" className="btn">
              Обговорити проєкт
            </a>
            <a href="#services" className="link py-2">
              Усі послуги
            </a>
          </div>
        </div>
      </div>

      <div className="corner mt-10 bg-rule p-px lg:mt-11" style={{ '--cut': '2.25rem' } as React.CSSProperties}>
        <div className="corner grid bg-ink-2 xl:grid-cols-[20rem_minmax(0,1fr)]">
          <div className="flex flex-col border-rule xl:border-r">
            <div className="px-4 pt-6 pb-4 sm:px-6 xl:px-4">
              <h2 className="text-xl leading-tight">Що заважає бізнесу?</h2>
              <p className="mt-1.5 text-[0.95rem] text-muted">Оберіть одне або кілька, і схема збереться сама.</p>
            </div>
            <div className="grid grow content-start border-t border-rule sm:grid-cols-2 xl:grid-cols-1" role="group" aria-label="Проблеми бізнесу">
              {pains.map((pain) => (
                <button
                  key={pain.id}
                  type="button"
                  className="pain sm:px-6 sm:last:col-span-2 xl:px-4 xl:last:col-span-1"
                  aria-pressed={isPainActive(pain)}
                  onClick={() => {
                    setLastId(pain.id)
                    togglePain(pain)
                  }}
                >
                  <span className="pain-mark" aria-hidden="true" />
                  {pain.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex min-w-0 items-center justify-center p-3 sm:p-5">
            <SystemMap shown={shown} />
          </div>
          <div
            className="grid gap-6 border-t border-rule p-4 sm:p-6 xl:col-span-2 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center"
            aria-live="polite"
          >
              <div className="min-h-[9.5rem] sm:min-h-[5.5rem]">
                {scenario ? (
                  <>
                    <p className="text-[0.95rem] text-muted">
                      {isExample ? 'Приклад: ' : ''}«{scenario.label}». Як це працюватиме:
                    </p>
                    <ol className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-3">
                      {scenario.steps.map((step, i) => (
                        <li key={step} className="flex gap-3 text-[0.95rem] leading-snug">
                          <span className="font-display text-gold tabular-nums">{i + 1}</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </>
                ) : names.length ? (
                  <p className="text-muted">
                    У вашій схемі: <span className="text-fg">{names.join(', ')}</span>.
                  </p>
                ) : (
                  <p className="text-muted">Схема порожня. Оберіть хоча б одну проблему зі списку.</p>
                )}
              </div>
              {selected.size > 0 && (
                <a href="#contact" className="btn justify-self-start">
                  Обговорити схему: {selected.size} {plural(selected.size, 'модуль', 'модулі', 'модулів')}
                </a>
              )}
          </div>
        </div>
      </div>
    </section>
  )
}
