import { useGameStore } from '@/store/gameStore'
import { useUIStore } from '@/store/uiStore'
import type { Card, Noble } from '@/types'

export function useGameActions() {
  const store = useGameStore()
  const ui = useUIStore()

  return {
    handleNobleClick: (noble: Noble) => {
      ui.setSelectedNoble(ui.selectedNobleId === noble.id ? null : noble.id)
    },

    handleCardClick: (card: Card) => {
      ui.toggleSelectedCard(card.id)
    },

    handleDeclare: (attackerNobleId: string, targetNobleId: string) => {
      store.announceDuel(attackerNobleId, targetNobleId)
      ui.clearSelections()
    },

    handleRedirect: (newTargetNobleId: string) => {
      store.redirectDuel(newTargetNobleId)
      ui.clearSelections()
    },

    handlePlayAttackerCards: () => {
      store.playAttackerCard(ui.selectedCardIds)
      ui.clearSelections()
    },

    handlePlayDefenderCard: () => {
      store.playDefenderCard(ui.selectedCardIds[0])
      ui.clearSelections()
    },

    handleBoostAttach: (cardId: string, nobleId: string) => {
      store.usePermanentBoost(cardId, nobleId)
      ui.clearSelections()
    },
  }
}
