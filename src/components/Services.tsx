import { serviceGroups } from '../content'
import AddButton from './AddButton'

export default function Services() {
  return (
    <section id="services" className="on-light corner bg-paper" aria-labelledby="services-title">
      <div className="wrap py-20 lg:py-28">
        <h2 id="services-title" className="h-title max-w-[20ch]">
          Послуги за тим, що вони дають бізнесу
        </h2>
        <p className="mt-5 max-w-[58ch] text-lg text-muted">
          Позначте потрібне, і воно одразу зʼявиться у вашій схемі та заявці. Якщо не впевнені, просто напишіть, ми
          підкажемо.
        </p>

        <div className="mt-14 lg:mt-20">
          {serviceGroups.map((group) => (
            <div key={group.id} className="grid gap-x-12 gap-y-6 border-t-2 border-ink py-9 lg:grid-cols-12 lg:py-12">
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-28">
                  <h3 className="text-[1.9rem] leading-tight font-normal tracking-tight">{group.verb}</h3>
                  <p className="mt-3 max-w-[34ch] text-muted">{group.text}</p>
                </div>
              </div>
              <ul className="lg:col-span-8">
                {group.services.map((s) => (
                  <li
                    key={s.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-2 border-b border-rule py-5 first:pt-0 last:border-0 last:pb-0 xl:grid-cols-[13rem_minmax(0,1fr)_auto]"
                  >
                    <h4 className="font-display text-xl leading-tight">{s.name}</h4>
                    <p className="col-span-2 row-start-2 text-muted xl:col-span-1 xl:row-start-auto">{s.text}</p>
                    <div className="col-start-2 row-start-1 xl:col-start-3">
                      <AddButton id={s.id} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="grid gap-x-12 gap-y-6 border-t-2 border-ink pt-9 lg:grid-cols-12 lg:pt-12">
            <h3 className="text-[1.9rem] leading-tight font-normal tracking-tight lg:col-span-4">Захищати</h3>
            <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-6 lg:col-span-8">
              <p className="max-w-[48ch] text-muted">
                Аудит, тестування на проникнення, захист серверів, моніторинг і навчання команди. Це окремий напрям, тож
                покажемо його на прикладі атаки.
              </p>
              <a href="#security" className="btn btn-dark">
                До кібербезпеки
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
