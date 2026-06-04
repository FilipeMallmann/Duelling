import { useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import SetupScreen from '@/components/overlay/SetupScreen'
import GameBoard from '@/components/layout/GameBoard'
import VictoryScreen from '@/components/overlay/VictoryScreen'

export default function App() {
  const store = useGameStore()

  useEffect(() => {
    if (store.phase === 'SETUP_DRAFT' && store.players.p1.hand.length === 0) {
      store.initGame()
    }
  }, [])

  if (store.phase === 'SETUP_DRAFT') return <SetupScreen />

  return (
    <>
      <GameBoard />
      {store.phase === 'GAME_OVER' && store.winner && (
        <VictoryScreen winner={store.winner} />
      )}
    </>
  )
}
