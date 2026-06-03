import type { Card, Noble, DuelResult } from '@/types'
import { nobleStrength } from './nobles'

export interface DuelOutcome {
  result: DuelResult
  attackerTotal: number
  defenderTotal: number
  attackerRoll: number[]
  defenderRoll: number[]
}

export function rollDice(count: number): number[] {
  return Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1)
}

function diceCount(noble: Noble): number {
  return noble.rank === 'K' ? 2 : 1
}

function cardBonus(card: Card, noble: Noble): number {
  return card.suit === noble.suit ? 2 : 0
}

function sumCards(cards: Card[], noble: Noble): number {
  return cards.reduce((sum, card) => {
    const value = parseInt(card.rank, 10) || 0
    return sum + value + cardBonus(card, noble)
  }, 0)
}

export function resolveDuel(
  attackerNoble: Noble,
  defenderNoble: Noble,
  attackerCards: Card[],
  defenderCard: Card | null,
  attackerAllies: Noble[],
  defenderAllies: Noble[],
): DuelOutcome {
  const hasAttackerAce = attackerCards.some((c) => c.rank === 'A')
  const hasDefenderAce = defenderCard?.rank === 'A'

  const attackerRoll = rollDice(diceCount(attackerNoble))
  const defenderRoll = rollDice(diceCount(defenderNoble))

  const attackerBase = nobleStrength(attackerNoble, attackerAllies) + attackerRoll.reduce((a, b) => a + b, 0)
  const defenderBase = nobleStrength(defenderNoble, defenderAllies) + defenderRoll.reduce((a, b) => a + b, 0)

  const attackerCardBonus = sumCards(attackerCards, attackerNoble)
  const defenderCardBonus = defenderCard ? parseInt(defenderCard.rank, 10) || 0 + cardBonus(defenderCard, defenderNoble) : 0

  const attackerTotal = attackerBase + attackerCardBonus
  const defenderTotal = defenderBase + defenderCardBonus

  let result: DuelResult

  if (hasAttackerAce && hasDefenderAce) {
    result = 'tie'
  } else if (hasAttackerAce) {
    result = 'attacker_wins'
  } else if (hasDefenderAce) {
    result = 'defender_wins'
  } else if (attackerTotal > defenderTotal) {
    result = 'attacker_wins'
  } else if (defenderTotal > attackerTotal) {
    result = 'defender_wins'
  } else {
    result = 'tie'
  }

  return { result, attackerTotal, defenderTotal, attackerRoll, defenderRoll }
}
