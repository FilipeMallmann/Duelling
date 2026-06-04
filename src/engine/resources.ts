import type { Card, Player, Suit } from '@/types'

export const MAX_CARDS_PER_TURN = 3
export const NOBLE_RECRUIT_COST = 5

export function canDrawCard(player: Player): boolean {
  return player.resources >= 1 && player.cardsDrewThisTurn < MAX_CARDS_PER_TURN
}

export function canRecruitNoble(player: Player, nobleDeckEmpty: boolean): boolean {
  return player.resources >= NOBLE_RECRUIT_COST && player.courtyard.length < 3 && !nobleDeckEmpty
}

export function generateResourcesAuto(player: Player): Player {
  return { ...player, resources: player.resources + 1 }
}

export function generateResourcesDiscard3(player: Player, cards: Card[]): Player {
  if (cards.length !== 3) throw new Error('Must discard exactly 3 cards')
  const suit = cards[0].suit
  if (!cards.every((c) => c.suit === suit)) {
    throw new Error('All 3 discarded cards must share the same suit')
  }
  const handIds = new Set(player.hand.map((c) => c.id))
  if (!cards.every((c) => handIds.has(c.id))) {
    throw new Error('Discarded cards must be in player hand')
  }
  const newHand = player.hand.filter((c) => !cards.some((d) => d.id === c.id))
  return { ...player, hand: newHand, resources: player.resources + 3, hasUsedDiscard3ThisTurn: true }
}

export function spendResourceDraw(player: Player): Player {
  return { ...player, resources: player.resources - 1, cardsDrewThisTurn: player.cardsDrewThisTurn + 1 }
}

export function spendResourceRecruit(player: Player): Player {
  return { ...player, resources: player.resources - NOBLE_RECRUIT_COST }
}

export function groupBySuit(cards: Card[]): Record<Suit, Card[]> {
  return cards.reduce(
    (acc, card) => {
      acc[card.suit].push(card)
      return acc
    },
    { hearts: [], diamonds: [], clubs: [], spades: [] } as Record<Suit, Card[]>,
  )
}
