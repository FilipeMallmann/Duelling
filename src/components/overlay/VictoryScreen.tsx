import { useGameStore } from '@/store/gameStore'
import type { PlayerID } from '@/types'
import ActionButton from '@/components/hud/ActionButton'

interface Props {
  winner: PlayerID
}

export default function VictoryScreen({ winner }: Props) {
  const store = useGameStore()
  const winnerPlayer = store.players[winner]

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/80 z-50">
      <div className="bg-gray-900 rounded-2xl border-2 border-noble-gold p-10 text-center max-w-md">
        <div className="text-5xl mb-4">⚔</div>
        <h2 className="text-3xl font-black text-noble-gold mb-2">
          Player {winner === 'p1' ? '1' : '2'} Wins!
        </h2>
        <p className="text-gray-400 mb-6">
          Survived with {winnerPlayer.courtyard.filter((n) => n.wounds < n.woundLimit).length} noble(s)
          after {store.turnNumber} turns
        </p>
        <ActionButton
          label="Play Again"
          onClick={() => { store.resetGame(); store.initGame() }}
          variant="primary"
        />
      </div>
    </div>
  )
}
