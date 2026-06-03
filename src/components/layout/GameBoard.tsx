import { useGameStore } from '@/store/gameStore'
import type { PlayerID } from '@/types'
import PlayerZone from './PlayerZone'
import StatusBar from './StatusBar'
import DuelArena from '@/components/duel/DuelArena'
import EventLog from '@/components/hud/EventLog'

export default function GameBoard() {
  const store = useGameStore()
  const active = store.activePlayerId
  const opponent: PlayerID = active === 'p1' ? 'p2' : 'p1'

  const isDuelVisible = store.duelState !== null && [
    'DUEL_DEFENDER_REDIRECT', 'DUEL_ATTACKER_PLAY_CARD',
    'DUEL_DEFENDER_PLAY_CARD', 'DUEL_RESULT',
  ].includes(store.turnPhase)

  return (
    <div className="min-h-screen flex flex-col bg-noble-dark">
      {/* Opponent zone */}
      <div className="flex-1 p-3">
        <PlayerZone
          player={store.players[opponent]}
          playerId={opponent}
          isActive={false}
          isOpponent={true}
          opponentNobles={store.players[active].courtyard}
        />
      </div>

      {/* Status bar */}
      <StatusBar
        turnPhase={store.turnPhase}
        activePlayerId={active}
        turnNumber={store.turnNumber}
      />

      {/* Duel arena (shown during duel phases) */}
      {isDuelVisible && (
        <div className="px-4 py-2">
          <DuelArena />
        </div>
      )}

      {/* Event log */}
      <div className="px-4 py-1">
        <EventLog log={store.log} />
      </div>

      {/* Active player zone */}
      <div className="flex-1 p-3">
        <PlayerZone
          player={store.players[active]}
          playerId={active}
          isActive={true}
          isOpponent={false}
          opponentNobles={store.players[opponent].courtyard}
        />
      </div>
    </div>
  )
}
