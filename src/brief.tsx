import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { pains, type Pain, type ServiceId } from './content'
import { track } from './track'

// Єдиний вибір на всю сторінку: схема в першому екрані, кнопки в послугах і заявка читають його звідси.
type Brief = {
  selected: ReadonlySet<ServiceId>
  /** Те, що показує схема. До першого кліку це приклад, який не потрапляє в заявку. */
  shown: ReadonlySet<ServiceId>
  isExample: boolean
  isPainActive: (pain: Pain) => boolean
  togglePain: (pain: Pain) => void
  toggleService: (id: ServiceId) => void
}

const example: ReadonlySet<ServiceId> = new Set(pains[0].services)
const covers = (set: ReadonlySet<ServiceId>, pain: Pain) => pain.services.every((s) => set.has(s))

const BriefContext = createContext<Brief | null>(null)

export function BriefProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<ReadonlySet<ServiceId>>(new Set())
  const [touched, setTouched] = useState(false)

  const value = useMemo<Brief>(() => {
    const shown = touched ? selected : example
    return {
      selected,
      shown,
      isExample: !touched,
      isPainActive: (pain) => covers(shown, pain),
      togglePain(pain) {
        const next = new Set(selected)
        if (covers(selected, pain)) {
          // Лишаємо послуги, які потрібні іншим обраним проблемам.
          const keep = new Set(
            pains.filter((p) => p.id !== pain.id && covers(selected, p)).flatMap((p) => p.services),
          )
          const removable = pain.services.filter((s) => !keep.has(s))
          ;(removable.length ? removable : pain.services).forEach((s) => next.delete(s))
        } else {
          pain.services.forEach((s) => next.add(s))
          track('pain_selected', { pain: pain.id })
        }
        setTouched(true)
        setSelected(next)
      },
      toggleService(id) {
        const next = new Set(selected)
        if (!next.delete(id)) {
          next.add(id)
          track('service_added', { service: id })
        }
        setTouched(true)
        setSelected(next)
      },
    }
  }, [selected, touched])

  return <BriefContext value={value}>{children}</BriefContext>
}

export function useBrief() {
  const brief = useContext(BriefContext)
  if (!brief) throw new Error('useBrief поза BriefProvider')
  return brief
}

export function plural(n: number, one: string, few: string, many: string) {
  const d = n % 10
  const dd = n % 100
  if (d === 1 && dd !== 11) return one
  if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return few
  return many
}
