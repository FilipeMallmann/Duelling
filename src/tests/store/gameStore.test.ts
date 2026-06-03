import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '@/store/gameStore'

function getStore() {
  return useGameStore.getState()
}

function initAndDraft() {
  const store = useGameStore.getState()
  store.initGame()

  const s = useGameStore.getState()
  // Get draft pools (private store fields)
  const p1Pool = (s as unknown as { _p1DraftPool: { id: string }[] })._p1DraftPool
  const p2Pool = (s as unknown as { _p2DraftPool: { id: string }[] })._p2DraftPool

  // Each player drafts first 3 from their pool
  const p1Picks = p1Pool.slice(0, 3).map((n) => n.id)
  const p2Picks = p2Pool.slice(0, 3).map((n) => n.id)

  p1Picks.forEach((id) => store.draftNoble('p1', id))
  store.confirmDraft('p1')
  p2Picks.forEach((id) => store.draftNoble('p2', id))
  store.confirmDraft('p2')
}

describe('initGame', () => {
  beforeEach(() => {
    useGameStore.getState().initGame()
  })

  it('sets phase to SETUP_DRAFT', () => {
    expect(getStore().phase).toBe('SETUP_DRAFT')
  })

  it('creates draft pools of 6 nobles per player', () => {
    const s = getStore() as unknown as { _p1DraftPool: unknown[]; _p2DraftPool: unknown[] }
    expect(s._p1DraftPool).toHaveLength(6)
    expect(s._p2DraftPool).toHaveLength(6)
  })

  it('creates a number deck of 40 cards', () => {
    expect(getStore().numberDeck).toHaveLength(40)
  })
})

describe('draft flow', () => {
  beforeEach(() => {
    useGameStore.getState().initGame()
  })

  it('allows selecting up to 3 nobles', () => {
    const store = useGameStore.getState()
    const p1Pool = (store as unknown as { _p1DraftPool: { id: string }[] })._p1DraftPool
    store.draftNoble('p1', p1Pool[0].id)
    store.draftNoble('p1', p1Pool[1].id)
    store.draftNoble('p1', p1Pool[2].id)
    // 4th should be ignored (already 3 selected)
    store.draftNoble('p1', p1Pool[3].id)
    const selections = (useGameStore.getState() as unknown as { _draftSelections: { p1: string[] } })._draftSelections.p1
    expect(selections).toHaveLength(3)
  })

  it('deselects when clicking already selected noble', () => {
    const store = useGameStore.getState()
    const p1Pool = (store as unknown as { _p1DraftPool: { id: string }[] })._p1DraftPool
    store.draftNoble('p1', p1Pool[0].id)
    store.draftNoble('p1', p1Pool[0].id) // deselect
    const selections = (useGameStore.getState() as unknown as { _draftSelections: { p1: string[] } })._draftSelections.p1
    expect(selections).toHaveLength(0)
  })

  it('confirmDraft with less than 3 is a no-op', () => {
    const store = useGameStore.getState()
    const p1Pool = (store as unknown as { _p1DraftPool: { id: string }[] })._p1DraftPool
    store.draftNoble('p1', p1Pool[0].id)
    store.confirmDraft('p1')
    expect(getStore().phase).toBe('SETUP_DRAFT')
  })

  it('transitions to IN_GAME when both players confirm', () => {
    initAndDraft()
    expect(getStore().phase).toBe('IN_GAME')
  })

  it('each player has 3 courtyard nobles after draft', () => {
    initAndDraft()
    const s = getStore()
    expect(s.players.p1.courtyard).toHaveLength(3)
    expect(s.players.p2.courtyard).toHaveLength(3)
  })

  it('nobleDeck has 6 cards after draft (remaining 3+3)', () => {
    initAndDraft()
    expect(getStore().nobleDeck).toHaveLength(6)
  })

  it('each player has 6 hand cards after draft', () => {
    initAndDraft()
    const s = getStore()
    expect(s.players.p1.hand).toHaveLength(6)
    expect(s.players.p2.hand).toHaveLength(6)
  })
})

describe('turn phases', () => {
  beforeEach(() => {
    initAndDraft()
  })

  it('starts at BEGINNING_OF_TURN', () => {
    expect(getStore().turnPhase).toBe('BEGINNING_OF_TURN')
  })

  it('endBeginningOfTurn advances to GENERATE_RESOURCES', () => {
    useGameStore.getState().endBeginningOfTurn()
    expect(getStore().turnPhase).toBe('GENERATE_RESOURCES')
  })

  it('endBeginningOfTurn is a no-op in wrong phase', () => {
    useGameStore.getState().endBeginningOfTurn()
    useGameStore.getState().endBeginningOfTurn() // now in GENERATE_RESOURCES, should no-op
    expect(getStore().turnPhase).toBe('GENERATE_RESOURCES')
  })

  it('generateResourcesAuto advances to SPEND_RESOURCES and adds 1 resource', () => {
    useGameStore.getState().endBeginningOfTurn()
    const before = getStore().players[getStore().activePlayerId].resources
    useGameStore.getState().generateResourcesAuto()
    const after = getStore().players[getStore().activePlayerId].resources
    expect(after).toBe(before + 1)
    expect(getStore().turnPhase).toBe('SPEND_RESOURCES')
  })

  it('endSpend advances to ANNOUNCE_DUEL', () => {
    useGameStore.getState().endBeginningOfTurn()
    useGameStore.getState().generateResourcesAuto()
    useGameStore.getState().endSpend()
    expect(getStore().turnPhase).toBe('ANNOUNCE_DUEL')
  })

  it('skipDuel ends turn and switches active player', () => {
    const initial = getStore().activePlayerId
    useGameStore.getState().endBeginningOfTurn()
    useGameStore.getState().generateResourcesAuto()
    useGameStore.getState().endSpend()
    useGameStore.getState().skipDuel()
    expect(getStore().activePlayerId).not.toBe(initial)
    expect(getStore().turnPhase).toBe('BEGINNING_OF_TURN')
  })
})

describe('full duel cycle', () => {
  beforeEach(() => {
    initAndDraft()
    // Add resources to make duel possible
    useGameStore.setState((s) => {
      s.players.p1.resources = 5
      s.players.p2.resources = 5
    })
  })

  function runToAnnounce() {
    useGameStore.getState().endBeginningOfTurn()
    useGameStore.getState().generateResourcesAuto()
    useGameStore.getState().endSpend()
  }

  it('announces a duel and sets duelState', () => {
    runToAnnounce()
    const s = getStore()
    const attacker = s.players.p1.courtyard[0]
    const defender = s.players.p2.courtyard[0]
    useGameStore.getState().announceDuel(attacker.id, defender.id)
    expect(getStore().duelState).not.toBeNull()
    expect(getStore().turnPhase).toBe('DUEL_DEFENDER_REDIRECT')
  })

  it('acceptTarget advances to DUEL_ATTACKER_PLAY_CARD', () => {
    runToAnnounce()
    const s = getStore()
    useGameStore.getState().announceDuel(s.players.p1.courtyard[0].id, s.players.p2.courtyard[0].id)
    useGameStore.getState().acceptTarget()
    expect(getStore().turnPhase).toBe('DUEL_ATTACKER_PLAY_CARD')
  })

  it('full duel resolves and reaches DUEL_RESULT', () => {
    runToAnnounce()
    const s = getStore()
    useGameStore.getState().announceDuel(s.players.p1.courtyard[0].id, s.players.p2.courtyard[0].id)
    useGameStore.getState().acceptTarget()
    useGameStore.getState().playAttackerCard([])
    useGameStore.getState().playDefenderCard()
    expect(getStore().turnPhase).toBe('DUEL_RESULT')
    expect(getStore().duelState?.result).not.toBeNull()
  })

  it('confirmDuelResult advances to next player BEGINNING_OF_TURN', () => {
    runToAnnounce()
    const s = getStore()
    useGameStore.getState().announceDuel(s.players.p1.courtyard[0].id, s.players.p2.courtyard[0].id)
    useGameStore.getState().acceptTarget()
    useGameStore.getState().playAttackerCard([])
    useGameStore.getState().playDefenderCard()
    useGameStore.getState().confirmDuelResult()
    const after = getStore()
    // If game not over, we should be in next turn
    if (after.phase === 'IN_GAME') {
      expect(after.turnPhase).toBe('BEGINNING_OF_TURN')
      expect(after.activePlayerId).toBe('p2')
    }
  })
})

describe('victory detection', () => {
  it('sets GAME_OVER when all opponent nobles are eliminated', () => {
    initAndDraft()
    // Force p2 to have only 1 noble with max wounds
    useGameStore.setState((s) => {
      const noble = s.players.p2.courtyard[0]
      s.players.p2.courtyard = [{ ...noble, wounds: noble.woundLimit }]
    })
    // Trigger victory check via confirmDuelResult cycle
    useGameStore.setState((s) => {
      s.turnPhase = 'DUEL_RESULT'
      s.duelState = {
        attackerNobleId: s.players.p1.courtyard[0].id,
        defenderNobleId: s.players.p2.courtyard[0].id,
        attackerId: 'p1',
        defenderId: 'p2',
        attackerCards: [],
        defenderCard: null,
        attackerRoll: [4],
        defenderRoll: [3],
        attackerTotal: 15,
        defenderTotal: 14,
        result: 'attacker_wins',
      }
    })
    useGameStore.getState().confirmDuelResult()
    expect(getStore().phase).toBe('GAME_OVER')
    expect(getStore().winner).toBe('p1')
  })
})

describe('resetGame', () => {
  it('resets back to initial state', () => {
    initAndDraft()
    useGameStore.getState().resetGame()
    expect(getStore().phase).toBe('SETUP_DRAFT')
    expect(getStore().winner).toBeNull()
    expect(getStore().turnNumber).toBe(1)
  })
})
