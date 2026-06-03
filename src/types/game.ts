import type { Card } from './card'
import type { Player, PlayerID } from './player'

export type TurnPhase =
  | 'BEGINNING_OF_TURN'
  | 'GENERATE_RESOURCES'
  | 'SPEND_RESOURCES'
  | 'ANNOUNCE_DUEL'
  | 'DUEL_DEFENDER_REDIRECT'
  | 'DUEL_ATTACKER_PLAY_CARD'
  | 'DUEL_DEFENDER_PLAY_CARD'
  | 'DUEL_RESOLVE'
  | 'DUEL_RESULT'

export type GamePhase = 'SETUP_DRAFT' | 'IN_GAME' | 'GAME_OVER'

export type DuelResult = 'attacker_wins' | 'defender_wins' | 'tie'

export interface DuelState {
  attackerNobleId: string
  defenderNobleId: string
  attackerId: PlayerID
  defenderId: PlayerID
  attackerCards: Card[]
  defenderCard: Card | null
  attackerRoll: number[]
  defenderRoll: number[]
  attackerTotal: number
  defenderTotal: number
  result: DuelResult | null
}

export interface GameState {
  phase: GamePhase
  turnPhase: TurnPhase
  activePlayerId: PlayerID
  players: Record<PlayerID, Player>
  numberDeck: Card[]
  discardPile: Card[]
  nobleDeck: Card[]
  duelState: DuelState | null
  turnNumber: number
  winner: PlayerID | null
  log: string[]
}
