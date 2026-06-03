import { useGameStore } from '@/store/gameStore'
import CardFront from '@/components/cards/CardFront'
import NobleCard from '@/components/nobles/NobleCard'

export default function DuelArena() {
  const store = useGameStore()
  const duelState = store.duelState
  if (!duelState) return null

  const attackerNoble = store.players[duelState.attackerId].courtyard.find(
    (n) => n.id === duelState.attackerNobleId,
  )
  const defenderNoble = store.players[duelState.defenderId].courtyard.find(
    (n) => n.id === duelState.defenderNobleId,
  )
  if (!attackerNoble || !defenderNoble) return null

  const showResult = duelState.result !== null

  return (
    <div className="flex items-center justify-center gap-6 p-4 bg-gray-800/80 rounded-xl border border-gray-600">
      {/* Attacker side */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-blue-300 font-bold">ATTACKER</span>
        <NobleCard noble={attackerNoble} />
        {showResult && (
          <div className="text-center">
            <div className="text-xs text-gray-400">Roll: {duelState.attackerRoll.join(', ')}</div>
            <div className="text-sm font-bold text-white">Total: {duelState.attackerTotal}</div>
          </div>
        )}
        <div className="flex gap-1">
          {duelState.attackerCards.map((card) => (
            <CardFront
              key={card.id}
              card={card}
              small
              bonus={card.suit === attackerNoble.suit ? '+2' : undefined}
            />
          ))}
        </div>
      </div>

      {/* VS divider */}
      <div className="flex flex-col items-center">
        <span className="text-2xl font-black text-noble-gold">⚔</span>
        {showResult && (
          <span className={[
            'text-sm font-bold mt-1',
            duelState.result === 'attacker_wins' ? 'text-blue-400' :
            duelState.result === 'defender_wins' ? 'text-orange-400' : 'text-gray-400',
          ].join(' ')}>
            {duelState.result === 'tie' ? 'TIE' :
             duelState.result === 'attacker_wins' ? 'ATK ▶' : '◀ DEF'}
          </span>
        )}
      </div>

      {/* Defender side */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-orange-300 font-bold">DEFENDER</span>
        <NobleCard noble={defenderNoble} />
        {showResult && (
          <div className="text-center">
            <div className="text-xs text-gray-400">Roll: {duelState.defenderRoll.join(', ')}</div>
            <div className="text-sm font-bold text-white">Total: {duelState.defenderTotal}</div>
          </div>
        )}
        {duelState.defenderCard && (
          <CardFront
            card={duelState.defenderCard}
            small
            bonus={duelState.defenderCard.suit === defenderNoble.suit ? '+2' : undefined}
          />
        )}
      </div>
    </div>
  )
}
