import { useState, useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import type { Noble, PlayerID } from '@/types'
import NobleCard from '@/components/nobles/NobleCard'

export default function SetupScreen() {
  const store = useGameStore()
  const [currentDraftPlayer, setCurrentDraftPlayer] = useState<PlayerID>('p1')

  const p1Pool: Noble[] = (store as unknown as { _p1DraftPool?: Noble[] })._p1DraftPool ?? []
  const p2Pool: Noble[] = (store as unknown as { _p2DraftPool?: Noble[] })._p2DraftPool ?? []
  const draftSelections = (store as unknown as { _draftSelections?: Record<PlayerID, string[]> })._draftSelections ?? { p1: [], p2: [] }
  const draftConfirmed = (store as unknown as { _draftConfirmed?: Record<PlayerID, boolean> })._draftConfirmed ?? { p1: false, p2: false }

  useEffect(() => {
    if (draftConfirmed.p1 && !draftConfirmed.p2) setCurrentDraftPlayer('p2')
  }, [draftConfirmed.p1, draftConfirmed.p2])

  const currentPool = currentDraftPlayer === 'p1' ? p1Pool : p2Pool
  const currentSelections = draftSelections[currentDraftPlayer]
  const canConfirm = currentSelections.length === 3

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-[var(--color-noble-gold)] mb-2 tracking-wide">Dueling Nobles</h1>
      <h2 className="text-xl text-gray-300 mb-8">
        Player {currentDraftPlayer === 'p1' ? '1' : '2'} — Choose Your Court (3 of 6)
      </h2>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {currentPool.map((noble) => (
          <NobleCard
            key={noble.id}
            noble={noble}
            variant="draft"
            selectable={!draftConfirmed[currentDraftPlayer]}
            selected={currentSelections.includes(noble.id)}
            onClick={() => store.draftNoble(currentDraftPlayer, noble.id)}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-gray-400">
          {currentSelections.length}/3 selected
        </p>
        <button
          disabled={!canConfirm}
          onClick={() => store.confirmDraft(currentDraftPlayer)}
          className={[
            'px-8 py-3 rounded-lg font-bold text-lg transition-all',
            canConfirm
              ? 'bg-[var(--color-noble-gold)] text-gray-900 hover:brightness-110 cursor-pointer'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed',
          ].join(' ')}
        >
          Confirm Court
        </button>
      </div>

      {currentDraftPlayer === 'p2' && (
        <p className="mt-4 text-sm text-gray-500">
          Player 1 chose: {store.players.p1.courtyard.map((n) => `${n.rank}${n.suit[0].toUpperCase()}`).join(', ')}
        </p>
      )}
    </div>
  )
}
