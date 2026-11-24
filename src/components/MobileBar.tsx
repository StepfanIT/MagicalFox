import { useEffect, useState } from 'react'
import { plural, useBrief } from '../brief'

// Нижня панель на телефоні: зʼявляється, коли перший екран прокручено, і ховається біля форми.
export default function MobileBar() {
  const count = useBrief().selected.size
  const [hidden, setHidden] = useState(true)

  useEffect(() => {
    const inView = new Set<Element>()
    const observer = new IntersectionObserver((entries) => {
      for (const e of entries) e.isIntersecting ? inView.add(e.target) : inView.delete(e.target)
      setHidden(inView.size > 0)
    })
    for (const id of ['top', 'contact']) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <div
      className={`on-dark fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-ink px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-200 lg:hidden ${
        hidden ? 'invisible translate-y-full' : ''
      }`}
    >
      <a href="#contact" className="btn w-full">
        {count ? `Надіслати схему: ${count} ${plural(count, 'модуль', 'модулі', 'модулів')}` : 'Обговорити проєкт'}
      </a>
    </div>
  )
}
