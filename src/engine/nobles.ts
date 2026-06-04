import type { Card, Suit } from '@/types'
import type { Noble, NobleRank } from '@/types'
import type { PlayerID } from '@/types'

const NOBLE_BASE_STRENGTH: Record<NobleRank, 11 | 12 | 13> = { J: 11, Q: 12, K: 13 }
const NOBLE_WOUND_LIMIT: Record<NobleRank, 2 | 3> = { J: 2, Q: 2, K: 3 }

export function createNoble(suit: Suit, rank: NobleRank, ownerId: PlayerID): Noble {
  return {
    id: `${ownerId}-${suit}-${rank}`,
    suit,
    rank,
    baseStrength: NOBLE_BASE_STRENGTH[rank],
    woundLimit: NOBLE_WOUND_LIMIT[rank],
    wounds: 0,
    permanentBoostCard: null,
    ownerId,
  }
}

export function nobleStrength(noble: Noble, alliedNobles: Noble[]): number {
  const boostValue =
    noble.permanentBoostCard !== null
      ? parseInt(noble.permanentBoostCard.rank, 10)
      : 0

  const queenBonus = noble.rank === 'Q' ? alliedNobles.length * 3 : 0

  return noble.baseStrength + boostValue + queenBonus
}

export function woundNoble(noble: Noble): Noble {
  return { ...noble, wounds: noble.wounds + 1 }
}

export function healNoble(noble: Noble): Noble {
  if (noble.wounds === 0) return noble
  return { ...noble, wounds: noble.wounds - 1 }
}

export function isEliminated(noble: Noble): boolean {
  return noble.wounds >= noble.woundLimit
}

export function attachBoost(noble: Noble, card: Card): Noble {
  return { ...noble, permanentBoostCard: card }
}

export function removeBoost(noble: Noble): Noble {
  return { ...noble, permanentBoostCard: null }
}
