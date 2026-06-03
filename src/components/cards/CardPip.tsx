import type { Suit } from '@/types'

interface Props {
  suit: Suit
  className?: string
}

export default function CardPip({ suit, className = '' }: Props) {
  const color = suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-gray-900'
  const symbols: Record<Suit, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  }
  return <span className={`${color} ${className}`}>{symbols[suit]}</span>
}
