import type { Card, Suit } from './card'
import type { Noble } from './noble'

export type PlayerID = 'p1' | 'p2'

export interface Player {
  id: PlayerID
  hand: Card[]
  courtyard: Noble[]
  resources: number
  suitAbilitiesUsed: Suit[]
  cardsDrewThisTurn: number
  hasUsedDiscard3ThisTurn: boolean
  kingAbilityUsedThisTurn: boolean
}
