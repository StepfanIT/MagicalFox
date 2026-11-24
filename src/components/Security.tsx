import { useState } from 'react'
import { attackLost, attackSteps, reportRows, securityServices } from '../content'
import AddButton from './AddButton'

export default function Security() {
  const [on, setOn] = useState<boolean[]>(attackSteps.map(() => false))
  const stop = on.indexOf(true)
  const reached = stop === -1 ? attackSteps.length - 1 : stop

  return (
    <section id="security" className="on-dark border-t border-rule bg-ink-2" aria-labelledby="security-title">
      <div className="wrap py-20 lg:py-28">
        <div className="grid gap-x-12 gap-y-5 lg:grid-cols-12">
          <h2 id="security-title" className="h-title lg:col-span-7">
            Кібербезпека: де зупиниться атака на вашу компанію
          </h2>
          <p className="max-w-[46ch] text-lg text-muted lg:col-span-5 lg:self-end">
            Ось типовий шлях від одного листа до зупинки роботи. Увімкніть захист, який у вас уже є, і подивіться, чим
            усе закінчиться.
          </p>
        </div>

        <ol className="mt-14 grid [--seg:1,0] xl:grid-cols-5 xl:[--seg:0,1]">
          {attackSteps.map((step, i) => {
            const hit = i <= reached
            const stoppedHere = i === stop
            const color = stoppedHere ? 'var(--color-gold)' : hit ? 'var(--color-danger)' : '#4a463f'
            return (
              <li key={step.title} className="relative flex gap-5 pb-9 xl:flex-col xl:gap-6 xl:pb-0">
                <div className="relative w-6 flex-none xl:h-6 xl:w-auto" aria-hidden="true">
                  {i < attackSteps.length - 1 && (
                    <span className="absolute top-6 -bottom-9 left-[11px] w-0.5 bg-[#3a3731] xl:top-[11px] xl:right-0 xl:bottom-auto xl:left-6 xl:h-0.5 xl:w-auto">
                      <span
                        className="absolute inset-0 origin-top bg-danger transition-transform duration-300 xl:origin-left"
                        style={{
                          transitionDelay: `${i < reached ? i * 110 : 0}ms`,
                          transform: i < reached ? 'none' : 'scale(var(--seg))',
                        }}
                      />
                    </span>
                  )}
                  <span
                    className="absolute top-0 left-0 block size-6 rotate-45 scale-[0.62] border-2 transition-colors duration-300"
                    style={{
                      borderColor: color,
                      background: hit ? color : 'transparent',
                      transitionDelay: `${hit ? i * 110 : 0}ms`,
                    }}
                  />
                </div>
                <div className="flex min-w-0 grow flex-col xl:pr-6">
                  <h3 className={`text-xl leading-tight transition-colors ${hit ? '' : 'text-muted'}`}>{step.title}</h3>
                  <p className="mt-2 text-[0.95rem] leading-snug text-muted xl:min-h-[4.2em]">{step.text}</p>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on[i]}
                    onClick={() => setOn(on.map((x, j) => (j === i ? !x : x)))}
                    className={`mt-4 flex min-h-14 w-full items-center justify-between gap-3 border px-3.5 py-2 text-left text-[0.95rem] leading-tight transition-colors ${
                      on[i] ? 'border-gold text-gold' : 'border-[#4a463f] text-fg hover:border-muted'
                    }`}
                  >
                    {step.defence}
                    <span
                      aria-hidden="true"
                      className={`relative mr-1.5 h-4 w-9 flex-none -skew-x-45 border transition-colors ${on[i] ? 'border-gold' : 'border-[#8f8a7f]'}`}
                    >
                      <span
                        className={`absolute top-0.5 bottom-0.5 w-3.5 transition-all duration-200 ${on[i] ? 'left-4.5 bg-gold' : 'left-0.5 bg-[#8f8a7f]'}`}
                      />
                    </span>
                  </button>
                </div>
              </li>
            )
          })}
        </ol>

        <div className="mt-4 flex min-h-28 flex-wrap items-center gap-x-8 gap-y-2 border-y border-rule py-6 xl:mt-12" role="status">
          <p className={`font-display text-2xl leading-tight ${stop === -1 ? 'text-danger' : 'text-gold'}`}>
            {stop === -1 ? 'Атаку не зупинено' : `Зупинено на кроці ${stop + 1} з ${attackSteps.length}`}
          </p>
          <p className="max-w-[62ch] text-lg">{stop === -1 ? attackLost : attackSteps[stop].stopped}</p>
        </div>
        <p className="mt-4 max-w-[70ch] text-[0.95rem] text-muted">
          Це спрощений сценарій. Окремий захист може не спрацювати, тому їх ставлять кілька поспіль.
        </p>

        <div className="mt-20 grid gap-x-16 gap-y-16 lg:mt-28 xl:grid-cols-2">
          <div>
            <h3 className="text-[1.9rem] leading-tight font-normal tracking-tight">Що ми робимо</h3>
            <ul className="mt-6">
              {securityServices.map((s) => (
                <li
                  key={s.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-2 border-t border-rule py-5"
                >
                  <div className="col-span-2 sm:col-span-1">
                    <h4 className="font-display text-xl leading-tight">{s.name}</h4>
                    <p className="mt-1.5 text-muted">{s.text}</p>
                  </div>
                  <AddButton id={s.id} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[1.9rem] leading-tight font-normal tracking-tight">Що ви отримаєте після аудиту</h3>
            <p className="mt-3 max-w-[52ch] text-muted">
              Звіт, який зрозуміє власник, а не лише адміністратор. Нижче вигаданий приклад фрагмента.
            </p>
            <div className="corner mt-6 bg-paper p-6 sm:p-8 on-light" style={{ '--cut': '2rem' } as React.CSSProperties}>
              {reportRows.map((r) => (
                <div key={r.found} className="border-b border-rule py-5 first:pt-0 last:border-0 last:pb-0">
                  <div className="flex items-start gap-4">
                    <span className="mt-0.5 w-24 flex-none text-[0.95rem] font-semibold text-accent">{r.risk}</span>
                    <p className="font-display text-lg leading-snug">{r.found}</p>
                  </div>
                  <dl className="mt-3 grid gap-x-4 gap-y-1.5 text-[0.95rem] sm:grid-cols-[6rem_minmax(0,1fr)]">
                    <dt className="text-muted">Для бізнесу</dt>
                    <dd>{r.means}</dd>
                    <dt className="text-muted">Що робити</dt>
                    <dd>{r.fix}</dd>
                  </dl>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
