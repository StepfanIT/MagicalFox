import { ContactLinks } from './Contact'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="on-dark wrap flex flex-wrap items-center justify-between gap-x-12 gap-y-6 pt-12 pb-28 lg:pb-12">
      <Logo />
      <p className="max-w-[52ch] text-[0.95rem] text-muted">
        Лендінги, інтернет-магазини, боти, парсери, CRM, автоматизація та кібербезпека для бізнесу.
      </p>
      <ContactLinks />
    </footer>
  )
}
