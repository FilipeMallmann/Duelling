import type { Card } from '@/types'
import { RED_SUITS } from '@/types'
import CardPip from './CardPip'

interface Props {
  card: Card
  selectable?: boolean
  selected?: boolean
  onClick?: () => void
  small?: boolean
  bonus?: string
}

export default function CardFront({ card, selectable, selected, onClick, small, bonus }: Props) {
  const isRed = RED_SUITS.includes(card.suit)
  const textColor = isRed ? 'text-red-600' : 'text-gray-900'

  return (
    <div
      role={selectable || onClick ? 'button' : undefined}
      tabIndex={selectable || onClick ? 0 : undefined}
      aria-label={`${card.rank} of ${card.suit}`}
      aria-pressed={selected}
      onClick={onClick}
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && onClick) onClick() }}
      className={[
        'relative flex flex-col justify-between rounded border-2 bg-white select-none',
        small ? 'w-12 h-16 p-0.5 text-xs' : 'w-16 h-24 p-1',
        selected ? 'border-yellow-400 ring-2 ring-yellow-400 -translate-y-2' : 'border-gray-200',
        selectable ? 'cursor-pointer hover:border-blue-300 hover:-translate-y-1 transition-transform' : '',
        textColor,
      ].join(' ')}
    >
      <div className="font-bold leading-none">{card.rank}</div>
      <CardPip suit={card.suit} className="text-center text-lg" />
      <div className="font-bold leading-none self-end rotate-180">{card.rank}</div>
      {bonus && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs bg-green-600 text-white rounded px-1">
          {bonus}
        </div>
      )}
    </div>
  )
}
