import type { GameState, PlayerID } from '@/types'
import { isEliminated } from './nobles'

export function checkVictory(state: GameState): PlayerID | null {
  for (const [id, player] of Object.entries(state.players) as [PlayerID, typeof state.players.p1][]) {
    const hasLivingNoble = player.courtyard.some((n) => !isEliminated(n))
    if (!hasLivingNoble) {
      return id === 'p1' ? 'p2' : 'p1'
    }
  }
  return null
}

export function reshuffleIfNeeded(
  numberDeck: GameState['numberDeck'],
  discardPile: GameState['discardPile'],
): { numberDeck: GameState['numberDeck']; discardPile: GameState['discardPile'] } {
  if (numberDeck.length > 0) return { numberDeck, discardPile }
  if (discardPile.length === 0) return { numberDeck: [], discardPile: [] }

  const shuffled = [...discardPile].sort(() => Math.random() - 0.5)
  return { numberDeck: shuffled, discardPile: [] }
}
