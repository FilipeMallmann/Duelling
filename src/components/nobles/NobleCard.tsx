import type { Noble } from '@/types'
import CardPip from '@/components/cards/CardPip'

interface Props {
  noble: Noble
  variant?: 'draft' | 'courtyard' | 'hand'
  selectable?: boolean
  selected?: boolean
  targeted?: boolean
  eliminated?: boolean
  onClick?: () => void
}

const RANK_LABELS: Record<string, string> = { J: 'Jack', Q: 'Queen', K: 'King' }
const ABILITY_DESCRIPTIONS: Record<string, string> = {
  J: 'May play 2 number cards in a duel',
  Q: '+3 strength per ally in courtyard',
  K: 'Rolls 2d6 · May self-wound for +1 resource',
}

export default function NobleCard({
  noble,
  variant = 'courtyard',
  selectable = false,
  selected = false,
  targeted = false,
  eliminated = false,
  onClick,
}: Props) {
  const woundPips = Array.from({ length: noble.woundLimit })
  const isSmall = variant === 'courtyard'

  let borderColor = 'border-noble-gold/40'
  if (selected) borderColor = 'border-yellow-400 ring-2 ring-yellow-400'
  else if (targeted) borderColor = 'border-red-500 ring-2 ring-red-500'
  else if (selectable) borderColor = 'border-blue-400 ring-1 ring-blue-400'

  return (
    <div
      role={selectable || onClick ? 'button' : undefined}
      tabIndex={selectable || onClick ? 0 : undefined}
      aria-pressed={selected}
      aria-label={`${RANK_LABELS[noble.rank]} of ${noble.suit}, ${noble.wounds} wounds`}
      onClick={onClick}
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && onClick) onClick() }}
      className={[
        'relative flex flex-col rounded-lg border-2 bg-noble-dark transition-all select-none',
        isSmall ? 'w-24 p-2' : 'w-36 p-3',
        borderColor,
        eliminated ? 'opacity-40 grayscale' : '',
        selectable && !selected ? 'cursor-pointer hover:border-blue-300' : '',
        selected ? 'cursor-pointer' : '',
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xl font-bold text-noble-cream">{noble.rank}</span>
        <CardPip suit={noble.suit} className="text-lg" />
      </div>

      {/* Stats */}
      {variant === 'draft' && (
        <div className="text-xs text-gray-400 mb-2 leading-tight">
          <div>STR: {noble.baseStrength}</div>
          <div>WND: {noble.woundLimit}</div>
          <div className="mt-1 text-gray-500">{ABILITY_DESCRIPTIONS[noble.rank]}</div>
        </div>
      )}

      {/* Wound pips */}
      <div className="flex gap-1 mt-auto pt-1">
        {woundPips.map((_, i) => (
          <div
            key={i}
            className={[
              'w-3 h-3 rounded-full border',
              i < noble.wounds ? 'bg-red-600 border-red-400' : 'bg-transparent border-gray-500',
            ].join(' ')}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Boost card indicator */}
      {noble.permanentBoostCard && (
        <div className="absolute top-1 right-1 text-xs bg-yellow-800 rounded px-1 text-yellow-200">
          +{noble.permanentBoostCard.rank}
        </div>
      )}

      {eliminated && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg">
          <span className="text-xs text-red-400 font-bold rotate-[-20deg]">SLAIN</span>
        </div>
      )}
    </div>
  )
}
