import type { GameState, PlayerID } from '@/types'
import { canDrawCard, canRecruitNoble } from '@/engine/resources'
import { canUseHearts, canUseDiamonds, canUseClubs, canUseSpades, canUseKingAbility } from '@/engine/abilities'

export function selectActivePlayer(state: GameState) {
  return state.players[state.activePlayerId]
}

export function selectOpponentPlayer(state: GameState) {
  const opponentId: PlayerID = state.activePlayerId === 'p1' ? 'p2' : 'p1'
  return state.players[opponentId]
}

export function selectCanDraw(state: GameState) {
  return canDrawCard(selectActivePlayer(state))
}

export function selectCanRecruit(state: GameState) {
  return canRecruitNoble(selectActivePlayer(state), state.nobleDeck.length === 0)
}

export function selectAllowedActions(state: GameState) {
  const player = selectActivePlayer(state)
  const opponent = selectOpponentPlayer(state)
  return {
    canUseHearts: canUseHearts(player),
    canUseDiamonds: canUseDiamonds(player, opponent.courtyard.length),
    canUseClubs: canUseClubs(player),
    canUseSpades: canUseSpades(player),
    canUseKingAbility: canUseKingAbility(player),
    canDrawCard: canDrawCard(player),
    canRecruitNoble: canRecruitNoble(player, state.nobleDeck.length === 0),
  }
}
