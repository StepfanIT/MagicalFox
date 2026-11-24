import { processSteps } from '../content'

export default function Process() {
  return (
    <section id="process" className="on-light bg-ink-2" aria-labelledby="process-title">
      <div className="corner bg-paper">
      <div className="wrap py-20 lg:py-28">
        <h2 id="process-title" className="h-title max-w-[22ch]">
          Як іде робота і що ви маєте на кожному кроці
        </h2>
        <div className="relative mt-14">
          <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-rule lg:right-0 lg:bottom-auto lg:h-0.5 lg:w-auto" aria-hidden="true">
            <div className="progress-line h-full w-full bg-ink [--from:1_0] lg:[--from:0_1]" />
          </div>
          <ol className="grid gap-y-10 pl-7 lg:grid-cols-5 lg:gap-x-8 lg:pt-8 lg:pl-0">
            {processSteps.map((s, i) => (
              <li key={s.title} className="lg:grid lg:row-span-3 lg:grid-rows-subgrid lg:gap-y-5">
                <h3 className="text-xl leading-tight">
                  <span className="mb-2 block text-accent tabular-nums">{i + 1}</span>
                  {s.title}
                </h3>
                <p className="mt-3 text-muted lg:mt-0">
                  <span className="block text-[0.95rem] font-semibold text-fg">Ви</span>
                  {s.you}
                </p>
                <p className="mt-3 text-muted lg:mt-0">
                  <span className="block text-[0.95rem] font-semibold text-accent">Отримуєте</span>
                  {s.get}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
      </div>
    </section>
  )
}
