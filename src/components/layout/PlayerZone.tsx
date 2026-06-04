import type { Player, PlayerID } from '@/types'
import { useUIStore } from '@/store/uiStore'
import { useGameStore } from '@/store/gameStore'
import { usePhaseGuard } from '@/hooks/usePhaseGuard'
import Courtyard from '@/components/nobles/Courtyard'
import Hand from '@/components/cards/Hand'
import ResourceTracker from '@/components/hud/ResourceTracker'
import PhasePanel from '@/components/hud/PhasePanel'
import type { Noble } from '@/types'

interface Props {
  player: Player
  playerId: PlayerID
  isActive: boolean
  isOpponent: boolean
  opponentNobles: Noble[]
}

export default function PlayerZone({ player, playerId, isActive, isOpponent, opponentNobles }: Props) {
  const ui = useUIStore()
  const store = useGameStore()
  const phase = usePhaseGuard()

  const isDuelPhase = [
    'DUEL_DEFENDER_REDIRECT', 'DUEL_ATTACKER_PLAY_CARD',
    'DUEL_DEFENDER_PLAY_CARD', 'DUEL_RESULT',
  ].includes(store.turnPhase)

  // Determine which cards are selectable
  let selectableCardIds: string[] = []
  if (isActive && !isOpponent) {
    if (phase.isGenerating) {
      // Allow card selection for discard-3
      selectableCardIds = player.hand.map((c) => c.id)
    } else if (phase.isAttackerPlay && store.duelState?.attackerId === playerId) {
      selectableCardIds = player.hand.map((c) => c.id)
    } else if (phase.isDefenderPlay && store.duelState?.defenderId === playerId) {
      selectableCardIds = player.hand.map((c) => c.id)
    } else if (!isDuelPhase && phase.isDefenderPlay) {
      // noop
    }
  }

  // Defender can also interact during redirect
  if (!isActive && phase.isDefenderRedirect && store.duelState?.defenderId === playerId) {
    // No card selection for redirect, handled in PhasePanel
  }

  const playerLabel = playerId === 'p1' ? 'Player 1' : 'Player 2'
  const playerColor = playerId === 'p1' ? 'border-blue-800' : 'border-orange-800'

  return (
    <div className={`flex flex-col gap-3 p-3 rounded-xl border ${playerColor} ${isOpponent ? 'opacity-90' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className={`text-sm font-bold ${playerId === 'p1' ? 'text-blue-300' : 'text-orange-300'}`}>
          {playerLabel} {isActive ? '(Active)' : ''}
        </span>
        <ResourceTracker resources={player.resources} />
      </div>

      {/* Courtyard */}
      <Courtyard
        nobles={player.courtyard}
        label="Courtyard"
      />

      {/* Hand */}
      <Hand
        cards={player.hand}
        faceDown={isOpponent}
        selectableIds={selectableCardIds}
        selectedIds={isActive && !isOpponent ? ui.selectedCardIds : []}
        onCardClick={selectableCardIds.length > 0 ? (card) => ui.toggleSelectedCard(card.id) : undefined}
        label={isOpponent ? 'Hand' : 'Your Hand'}
      />

      {/* Phase panel — only for active player */}
      {isActive && !isOpponent && (
        <PhasePanel
          activeNobles={player.courtyard}
          opponentNobles={opponentNobles}
          hand={player.hand}
        />
      )}
    </div>
  )
}
