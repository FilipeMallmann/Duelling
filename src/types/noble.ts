import type { Card, Suit } from './card'
import type { PlayerID } from './player'

export type NobleRank = 'J' | 'Q' | 'K'

export interface Noble {
  id: string
  suit: Suit
  rank: NobleRank
  baseStrength: 11 | 12 | 13
  woundLimit: 2 | 3
  wounds: number
  permanentBoostCard: Card | null
  ownerId: PlayerID
}
