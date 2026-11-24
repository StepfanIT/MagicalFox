import { useState } from 'react'
import { useBrief } from '../brief'
import Logo from './Logo'

const links = [
  ['#services', 'Послуги'],
  ['#security', 'Кібербезпека'],
  ['#process', 'Як працюємо'],
  ['#faq', 'Питання'],
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const count = useBrief().selected.size

  return (
    <header className="on-dark sticky top-0 z-40 border-b border-rule bg-ink">
      <div className="wrap flex min-h-18 items-center justify-between gap-6">
        <a href="#top" aria-label="Magical Fox Studio, на початок">
          <Logo />
        </a>
        <nav aria-label="Головне меню" className="hidden gap-8 lg:flex">
          {links.map(([href, label]) => (
            <a key={href} href={href} className="py-2 text-muted transition-colors hover:text-fg">
              {label}
            </a>
          ))}
        </nav>
        <a href="#contact" className="btn btn-sm hidden! lg:inline-flex!">
          Обговорити проєкт
          {count > 0 && <span className="tabular-nums">({count})</span>}
        </a>
        <button
          type="button"
          className="-mr-2 flex size-11 items-center justify-center lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Закрити меню' : 'Відкрити меню'}
          onClick={() => setOpen(!open)}
        >
          <svg viewBox="0 0 28 20" className="w-7" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M5 1 23 19M23 1 5 19" /> : <path d="M0 2h28M6 10h22M12 18h16" />}
          </svg>
        </button>
      </div>
      <nav id="mobile-menu" aria-label="Мобільне меню" hidden={!open} className="border-t border-rule lg:hidden">
        <div className="wrap flex flex-col pt-2 pb-5">
          {[...links, ['#contact', 'Обговорити проєкт']].map(([href, label]) => (
            <a key={href} href={href} className="border-b border-rule py-3.5" onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  )
}
