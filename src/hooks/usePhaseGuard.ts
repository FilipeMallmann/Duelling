import { useGameStore } from '@/store/gameStore'
import { selectAllowedActions } from '@/store/selectors'

export function usePhaseGuard() {
  const state = useGameStore()
  const turnPhase = state.turnPhase

  return {
    isBeginning: turnPhase === 'BEGINNING_OF_TURN',
    isGenerating: turnPhase === 'GENERATE_RESOURCES',
    isSpending: turnPhase === 'SPEND_RESOURCES',
    isAnnounceDuel: turnPhase === 'ANNOUNCE_DUEL',
    isDefenderRedirect: turnPhase === 'DUEL_DEFENDER_REDIRECT',
    isAttackerPlay: turnPhase === 'DUEL_ATTACKER_PLAY_CARD',
    isDefenderPlay: turnPhase === 'DUEL_DEFENDER_PLAY_CARD',
    isDuelResult: turnPhase === 'DUEL_RESULT',
    allowedActions: selectAllowedActions(state),
  }
}
