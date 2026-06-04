import type { Card } from '@/types'
import CardFront from './CardFront'
import CardBack from './CardBack'

interface Props {
  cards: Card[]
  faceDown?: boolean
  selectableIds?: string[]
  selectedIds?: string[]
  onCardClick?: (card: Card) => void
  label?: string
}

export default function Hand({ cards, faceDown, selectableIds, selectedIds, onCardClick, label }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-xs text-gray-400">{label} ({cards.length})</span>}
      <div className="flex flex-wrap gap-1">
        {faceDown
          ? cards.map((_, i) => <CardBack key={i} small />)
          : cards.map((card) => (
              <CardFront
                key={card.id}
                card={card}
                small
                selectable={selectableIds?.includes(card.id)}
                selected={selectedIds?.includes(card.id)}
                onClick={onCardClick ? () => onCardClick(card) : undefined}
              />
            ))}
      </div>
    </div>
  )
}
