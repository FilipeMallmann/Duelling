import type { Card, Rank } from '@/types'
import { SUITS, NUMBER_RANKS, NOBLE_RANKS } from '@/types'

export function createNumberDeck(): Card[] {
  const cards: Card[] = []
  for (const suit of SUITS) {
    for (const rank of NUMBER_RANKS) {
      cards.push({ id: `${suit}-${rank}`, suit, rank: rank as Rank, deckType: 'number' })
    }
  }
  return cards
}

export function createNobleDeck(): Card[] {
  const cards: Card[] = []
  for (const suit of SUITS) {
    for (const rank of NOBLE_RANKS) {
      cards.push({ id: `${suit}-${rank}`, suit, rank: rank as Rank, deckType: 'noble' })
    }
  }
  return cards
}

export function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export interface DealResult<T> {
  dealt: T[]
  remaining: T[]
}

export function deal<T>(items: T[], count: number): DealResult<T> {
  return {
    dealt: items.slice(0, count),
    remaining: items.slice(count),
  }
}
