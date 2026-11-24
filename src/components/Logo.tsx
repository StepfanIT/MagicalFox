export const markM = 'M0 0 416 416V516L71 171V687L0 618Z'
export const markF =
  'M416 416 781 51H1101L1025 127H805L416 516ZM473 545 633 385H980L908 457H657L545 569V917L473 989Z'

export default function Logo() {
  return (
    <span className="flex items-center gap-3.5">
      <svg viewBox="0 0 1101 989" className="h-9 w-auto flex-none" aria-hidden="true">
        <path d={markM} fill="#fff" />
        <path d={markF} className="fill-gold" />
      </svg>
      <span className="font-display leading-none whitespace-nowrap">
        <span className="block text-[0.82rem] font-medium tracking-[0.26em]">MAGICAL FOX</span>
        <span className="mt-1.5 block text-[0.6rem] tracking-[0.34em] text-gold">STUDIO</span>
      </span>
    </span>
  )
}
