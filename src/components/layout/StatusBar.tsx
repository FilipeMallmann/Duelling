import type { GameState } from '@/types'

const PHASE_LABELS: Record<GameState['turnPhase'], string> = {
  BEGINNING_OF_TURN: 'Beginning of Turn',
  GENERATE_RESOURCES: 'Generate Resources',
  SPEND_RESOURCES: 'Spend Resources',
  ANNOUNCE_DUEL: 'Announce Duel',
  DUEL_DEFENDER_REDIRECT: 'Defender: Redirect?',
  DUEL_ATTACKER_PLAY_CARD: 'Attacker: Play Card',
  DUEL_DEFENDER_PLAY_CARD: 'Defender: Play Card',
  DUEL_RESOLVE: 'Resolving Duel…',
  DUEL_RESULT: 'Duel Result',
}

interface Props {
  turnPhase: GameState['turnPhase']
  activePlayerId: 'p1' | 'p2'
  turnNumber: number
}

export default function StatusBar({ turnPhase, activePlayerId, turnNumber }: Props) {
  return (
    <div
      aria-live="polite"
      className="flex items-center justify-between px-4 py-2 bg-gray-900 border-y border-gray-700"
    >
      <span className="text-xs text-gray-400">Turn {turnNumber}</span>
      <span className="text-sm font-semibold text-white">{PHASE_LABELS[turnPhase]}</span>
      <span className={`text-xs font-bold ${activePlayerId === 'p1' ? 'text-blue-400' : 'text-orange-400'}`}>
        {activePlayerId === 'p1' ? 'Player 1' : 'Player 2'}
        <span aria-current="step"> ▶</span>
      </span>
    </div>
  )
}
