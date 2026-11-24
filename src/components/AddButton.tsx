import { useBrief } from '../brief'
import { serviceName, type ServiceId } from '../content'

export default function AddButton({ id }: { id: ServiceId }) {
  const { selected, toggleService } = useBrief()
  const on = selected.has(id)
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={`${serviceName(id)}: ${on ? 'прибрати із заявки' : 'додати в заявку'}`}
      onClick={() => toggleService(id)}
      className={`inline-flex min-h-11 w-32 flex-none items-center justify-center gap-2 border text-[0.95rem] transition-colors ${
        on ? 'border-accent bg-accent text-(--on-accent)' : 'border-(--ctl) text-fg hover:border-accent'
      }`}
    >
      <svg viewBox="0 0 14 14" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path d={on ? 'M1 7.5 5 11.5 13 2.5' : 'M7 1v12M1 7h12'} />
      </svg>
      {on ? 'У заявці' : 'Додати'}
    </button>
  )
}
