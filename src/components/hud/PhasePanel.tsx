import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { useUIStore } from '@/store/uiStore'
import { usePhaseGuard } from '@/hooks/usePhaseGuard'
import ActionButton from './ActionButton'
import type { Noble, Card } from '@/types'

interface Props {
  activeNobles: Noble[]
  opponentNobles: Noble[]
  hand: Card[]
}

export default function PhasePanel({ activeNobles, opponentNobles, hand }: Props) {
  const store = useGameStore()
  const ui = useUIStore()
  const phase = usePhaseGuard()
  const [discardMode, setDiscardMode] = useState(false)

  const nonEliminated = (nobles: Noble[]) => nobles.filter((n) => n.wounds < n.woundLimit)

  if (phase.isBeginning) {
    return (
      <div className="flex flex-wrap gap-2 p-3 bg-gray-900 rounded-lg">
        <span className="text-xs text-gray-400 w-full">Beginning of Turn:</span>
        {phase.allowedActions.canUseKingAbility && (
          <ActionButton
            label="King: Self-Wound (+1 resource)"
            onClick={() => {
              const king = activeNobles.find((n) => n.rank === 'K' && n.wounds > 0)
              if (king) store.useKingAbility(king.id)
            }}
            variant="secondary"
            small
          />
        )}
        <ActionButton
          label="End Beginning"
          onClick={() => store.endBeginningOfTurn()}
          variant="primary"
          small
        />
      </div>
    )
  }

  if (phase.isGenerating) {
    return (
      <div className="flex flex-wrap gap-2 p-3 bg-gray-900 rounded-lg">
        <span className="text-xs text-gray-400 w-full">Generate Resources:</span>
        {!discardMode ? (
          <>
            <ActionButton label="+1 Resource (auto)" onClick={() => store.generateResourcesAuto()} variant="primary" small />
            <ActionButton
              label="Discard 3 same-suit → +3"
              onClick={() => setDiscardMode(true)}
              variant="secondary"
              small
            />
          </>
        ) : (
          <>
            <span className="text-xs text-yellow-300">Select 3 cards of the same suit from your hand:</span>
            <ActionButton
              label={`Confirm Discard (${ui.selectedCardIds.length}/3)`}
              disabled={ui.selectedCardIds.length !== 3}
              onClick={() => {
                store.generateResourcesDiscard3(ui.selectedCardIds)
                ui.clearSelections()
                setDiscardMode(false)
              }}
              variant="primary"
              small
            />
            <ActionButton label="Cancel" onClick={() => { setDiscardMode(false); ui.clearSelections() }} variant="secondary" small />
          </>
        )}
      </div>
    )
  }

  if (phase.isSpending) {
    return (
      <div className="flex flex-wrap gap-2 p-3 bg-gray-900 rounded-lg">
        <span className="text-xs text-gray-400 w-full">Spend Resources:</span>
        <ActionButton
          label="Draw Card (1 resource)"
          disabled={!phase.allowedActions.canDrawCard}
          onClick={() => store.drawCard()}
          variant="secondary"
          small
        />
        <ActionButton
          label="Recruit Noble (5 resources)"
          disabled={!phase.allowedActions.canRecruitNoble}
          onClick={() => {}} // Opens modal — handled by parent
          variant="secondary"
          small
        />
        <ActionButton label="End Spending →" onClick={() => store.endSpend()} variant="primary" small />
      </div>
    )
  }

  if (phase.isAnnounceDuel) {
    const [attackerSelected, setAttackerSelected] = useState<string | null>(null)

    return (
      <div className="flex flex-wrap gap-2 p-3 bg-gray-900 rounded-lg">
        <span className="text-xs text-gray-400 w-full">
          {!attackerSelected ? 'Select YOUR noble to attack with:' : 'Select opponent noble to target:'}
        </span>
        {!attackerSelected && activeNobles.filter((n) => n.wounds < n.woundLimit).map((n) => (
          <ActionButton key={n.id} label={`${n.rank} of ${n.suit}`} onClick={() => setAttackerSelected(n.id)} variant="secondary" small />
        ))}
        {attackerSelected && nonEliminated(opponentNobles).map((n) => (
          <ActionButton
            key={n.id}
            label={`Target: ${n.rank} of ${n.suit}`}
            onClick={() => { store.announceDuel(attackerSelected, n.id); setAttackerSelected(null); ui.clearSelections() }}
            variant="danger"
            small
          />
        ))}
        {attackerSelected && <ActionButton label="← Back" onClick={() => setAttackerSelected(null)} variant="secondary" small />}
        <ActionButton label="Skip Duel" onClick={() => store.skipDuel()} variant="secondary" small />
        <div className="text-xs text-gray-500 w-full">{hand.length} cards in hand</div>
      </div>
    )
  }

  if (phase.isDefenderRedirect) {
    const duelState = store.duelState
    if (!duelState) return null
    const defenderPlayer = store.players[duelState.defenderId]
    return (
      <div className="flex flex-wrap gap-2 p-3 bg-gray-900 rounded-lg border border-orange-700">
        <span className="text-xs text-orange-300 w-full font-bold">
          Player {duelState.defenderId === 'p1' ? '1' : '2'}: You are being attacked!
        </span>
        <ActionButton label="Accept Target" onClick={() => store.acceptTarget()} variant="secondary" small />
        {defenderPlayer.resources >= 2 && store.players[duelState.defenderId].courtyard
          .filter((n) => n.id !== duelState.defenderNobleId && n.wounds < n.woundLimit)
          .map((n) => (
            <ActionButton
              key={n.id}
              label={`Redirect to ${n.rank} of ${n.suit} (2 resources)`}
              onClick={() => store.redirectDuel(n.id)}
              variant="danger"
              small
            />
          ))}
      </div>
    )
  }

  if (phase.isAttackerPlay || phase.isDefenderPlay) {
    const duelState = store.duelState
    if (!duelState) return null
    const isAttacker = phase.isAttackerPlay
    const actor = isAttacker ? duelState.attackerId : duelState.defenderId
    const actorNoble = store.players[actor].courtyard.find(
      (n) => n.id === (isAttacker ? duelState.attackerNobleId : duelState.defenderNobleId),
    )
    const maxCards = actorNoble?.rank === 'J' && isAttacker ? 2 : 1

    return (
      <div className="flex flex-wrap gap-2 p-3 bg-gray-900 rounded-lg border border-blue-700">
        <span className="text-xs text-blue-300 w-full font-bold">
          Player {actor === 'p1' ? '1' : '2'}: {isAttacker ? 'Play attack card(s)' : 'Play defense card'} (max {maxCards})
        </span>
        <span className="text-xs text-gray-400">Select from hand, then confirm. Or play no card.</span>
        <ActionButton
          label={`Confirm (${ui.selectedCardIds.length} card${ui.selectedCardIds.length !== 1 ? 's' : ''})`}
          onClick={() => isAttacker
            ? store.playAttackerCard(ui.selectedCardIds.slice(0, maxCards))
            : store.playDefenderCard(ui.selectedCardIds[0])
          }
          variant="primary"
          small
        />
        <ActionButton
          label="Play No Card"
          onClick={() => isAttacker ? store.playAttackerCard([]) : store.playDefenderCard(undefined)}
          variant="secondary"
          small
        />
        {ui.selectedCardIds.length > 0 && (
          <ActionButton label="Clear Selection" onClick={() => ui.clearSelections()} variant="secondary" small />
        )}
      </div>
    )
  }

  if (phase.isDuelResult) {
    const duelState = store.duelState
    if (!duelState) return null
    const resultLabel = duelState.result === 'attacker_wins'
      ? `Attacker wins! (${duelState.attackerTotal} vs ${duelState.defenderTotal})`
      : duelState.result === 'defender_wins'
      ? `Defender wins! (${duelState.defenderTotal} vs ${duelState.attackerTotal})`
      : `Tie! (${duelState.attackerTotal} vs ${duelState.defenderTotal})`

    return (
      <div className="flex flex-col gap-2 p-3 bg-gray-900 rounded-lg border border-yellow-600">
        <span className="text-sm font-bold text-yellow-300 text-center">{resultLabel}</span>
        <ActionButton label="Continue →" onClick={() => store.confirmDuelResult()} variant="primary" />
      </div>
    )
  }

  return null
}
