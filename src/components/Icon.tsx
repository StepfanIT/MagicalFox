// Іконки в геометрії знака: лише прямі та злами під 45°.
const paths = {
  leads: 'M2 3H18V13H9L5 17V13H2Z',
  manual: 'M7 2H13L18 7V13L13 18H7L2 13V7ZM10 5.5V10L13 13',
  ads: 'M2 3H18L12 9.5V14L8 18V9.5Z',
  shop: 'M3 7H17V18H3ZM7 10V5L9.5 2.5H10.5L13 5V10',
  market: 'M2 16L7 11L10 14L18 6M12.5 6H18V11.5',
  tables: 'M2 3H18V17H2ZM2 8H18M8 3V17',
  security: 'M10 2L17 5V11L10 18L3 11V5Z',
  team: 'M10 2L13 5L10 8L7 5ZM3 18V14L6 11H14L17 14V18',
  phone: 'M5 2H13L15 4V18H5ZM9 15H11',
  roles: 'M3 9H17V18H3ZM6.5 9V5L9.5 2H10.5L13.5 5V9M10 12V15',
  eye: 'M1 10L6 5H14L19 10L14 15H6ZM10 7.5L12.5 10L10 12.5L7.5 10Z',
  backup: 'M3 3H15L17 5V8.5H3ZM3 11.5H17V15L15 17H3ZM6 5.75H8M6 14.25H8',
}

export type IconName = keyof typeof paths

export default function Icon({ name, className = 'size-5' }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  )
}
