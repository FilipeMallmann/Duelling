import type { Card, Noble, Player, Suit } from '@/types'
import { healNoble, attachBoost, removeBoost } from './nobles'

export function canUseHearts(player: Player): boolean {
  return (
    !player.suitAbilitiesUsed.includes('hearts') &&
    player.hand.some((c) => c.suit === 'hearts')
  )
}

export function heartsAbility(player: Player, targetNoble: Noble, discardCard: Card): { player: Player; noble: Noble } {
  const newHand = player.hand.filter((c) => c.id !== discardCard.id)
  return {
    player: { ...player, hand: newHand, suitAbilitiesUsed: [...player.suitAbilitiesUsed, 'hearts'] },
    noble: healNoble(targetNoble),
  }
}

export function canUseDiamonds(player: Player, opponentCourtyardLength: number): boolean {
  return (
    !player.suitAbilitiesUsed.includes('diamonds') &&
    player.hand.some((c) => c.suit === 'diamonds') &&
    opponentCourtyardLength > player.courtyard.length
  )
}

export function diamondsAbility(player: Player, discardCard: Card, drawnCards: Card[]): Player {
  const newHand = player.hand.filter((c) => c.id !== discardCard.id)
  return {
    ...player,
    hand: [...newHand, ...drawnCards],
    suitAbilitiesUsed: [...player.suitAbilitiesUsed, 'diamonds'],
  }
}

export function canUseClubs(player: Player): boolean {
  return (
    !player.suitAbilitiesUsed.includes('clubs') &&
    player.hand.some((c) => c.suit === 'clubs')
  )
}

export function clubsAbility(player: Player, discardCard: Card, pickedCard: Card): Player {
  const newHand = player.hand.filter((c) => c.id !== discardCard.id)
  return {
    ...player,
    hand: [...newHand, pickedCard],
    suitAbilitiesUsed: [...player.suitAbilitiesUsed, 'clubs'],
  }
}

export function canUseSpades(player: Player): boolean {
  return (
    !player.suitAbilitiesUsed.includes('spades') &&
    player.hand.some((c) => c.suit === 'spades')
  )
}

export function spadesAbility(player: Player, discardCard: Card): Player {
  const newHand = player.hand.filter((c) => c.id !== discardCard.id)
  return { ...player, hand: newHand, suitAbilitiesUsed: [...player.suitAbilitiesUsed, 'spades'] }
}

export function canUseKingAbility(player: Player): boolean {
  if (player.kingAbilityUsedThisTurn) return false
  return player.courtyard.some((n) => n.rank === 'K' && n.wounds > 0)
}

export function kingBeginningAbility(player: Player, kingId: string): { player: Player; noble: Noble } {
  const king = player.courtyard.find((n) => n.id === kingId)
  if (!king || king.rank !== 'K') throw new Error('Noble is not a King')
  if (king.wounds === 0) throw new Error('King must have wounds to use this ability')
  return {
    player: { ...player, resources: player.resources + 1, kingAbilityUsedThisTurn: true },
    noble: { ...king, wounds: king.wounds + 1 },
  }
}

export function applyPermanentBoost(noble: Noble, card: Card): Noble {
  if (card.rank !== '2' && card.rank !== '3') throw new Error('Only 2s and 3s can be permanent boosts')
  return attachBoost(noble, card)
}

export function removePermanentBoost(noble: Noble): Noble {
  return removeBoost(noble)
}

export function getSuitAbilityName(suit: Suit): string {
  const names: Record<Suit, string> = {
    hearts: 'Heal',
    diamonds: 'Draw 3',
    clubs: 'Salvage',
    spades: 'Spy',
  }
  return names[suit]
}
