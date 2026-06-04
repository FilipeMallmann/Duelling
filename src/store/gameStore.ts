import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Card, GameState, Noble, NobleRank, PlayerID, Suit } from '@/types'
import { createNumberDeck, createNobleDeck, shuffle, deal } from '@/engine/deck'
import { createNoble, woundNoble, isEliminated } from '@/engine/nobles'
import { resolveDuel } from '@/engine/duel'
import {
  canDrawCard, canRecruitNoble,
  generateResourcesAuto, generateResourcesDiscard3,
  spendResourceDraw, spendResourceRecruit,
} from '@/engine/resources'
import {
  heartsAbility, diamondsAbility, clubsAbility, spadesAbility,
  kingBeginningAbility, applyPermanentBoost, removePermanentBoost,
} from '@/engine/abilities'
import { checkVictory, reshuffleIfNeeded } from '@/engine/victory'

interface GameStore extends GameState {
  initGame: () => void
  draftNoble: (playerId: PlayerID, nobleId: string) => void
  confirmDraft: (playerId: PlayerID) => void
  endBeginningOfTurn: () => void
  useKingAbility: (nobleId: string) => void
  usePermanentBoost: (cardId: string, nobleId: string) => void
  clearPermanentBoost: (nobleId: string) => void
  useSuitAbility: (suit: Suit, discardCardId: string, extra?: string) => void
  generateResourcesAuto: () => void
  generateResourcesDiscard3: (cardIds: string[]) => void
  endGenerateResources: () => void
  drawCard: () => void
  recruitNoble: (nobleId: string) => void
  endSpend: () => void
  announceDuel: (attackerNobleId: string, targetNobleId: string) => void
  skipDuel: () => void
  redirectDuel: (newTargetNobleId: string) => void
  acceptTarget: () => void
  playAttackerCard: (cardIds: string[]) => void
  playDefenderCard: (cardId?: string) => void
  confirmDuelResult: () => void
  resetGame: () => void
}

const INITIAL_DRAFT: Record<PlayerID, string[]> = { p1: [], p2: [] }

function buildInitialState(): Partial<GameStore> {
  return {
    phase: 'SETUP_DRAFT',
    turnPhase: 'BEGINNING_OF_TURN',
    activePlayerId: 'p1',
    players: {
      p1: { id: 'p1', hand: [], courtyard: [], resources: 0, suitAbilitiesUsed: [], cardsDrewThisTurn: 0, hasUsedDiscard3ThisTurn: false, kingAbilityUsedThisTurn: false },
      p2: { id: 'p2', hand: [], courtyard: [], resources: 0, suitAbilitiesUsed: [], cardsDrewThisTurn: 0, hasUsedDiscard3ThisTurn: false, kingAbilityUsedThisTurn: false },
    },
    numberDeck: [],
    discardPile: [],
    nobleDeck: [],
    duelState: null,
    turnNumber: 1,
    winner: null,
    log: [],
  }
}

export const useGameStore = create<GameStore>()(
  immer((set) => ({
    ...(buildInitialState() as GameState),
    _draftSelections: INITIAL_DRAFT as Record<PlayerID, string[]>,
    _draftConfirmed: { p1: false, p2: false } as Record<PlayerID, boolean>,

    initGame: () => {
      set((state) => {
        const allNobles = shuffle(createNobleDeck())
        const numberDeck = shuffle(createNumberDeck())

        const p1NoblesRaw = allNobles.slice(0, 6)
        const p2NoblesRaw = allNobles.slice(6, 12)

        state.players.p1.hand = []
        state.players.p2.hand = []
        state.players.p1.courtyard = []
        state.players.p2.courtyard = []
        state.players.p1.resources = 0
        state.players.p2.resources = 0
        state.players.p1.suitAbilitiesUsed = []
        state.players.p2.suitAbilitiesUsed = []
        state.players.p1.cardsDrewThisTurn = 0
        state.players.p2.cardsDrewThisTurn = 0
        state.players.p1.hasUsedDiscard3ThisTurn = false
        state.players.p2.hasUsedDiscard3ThisTurn = false
        state.players.p1.kingAbilityUsedThisTurn = false
        state.players.p2.kingAbilityUsedThisTurn = false

        // Convert noble cards to Noble objects and store them on players for draft
        ;(state as unknown as { _p1DraftPool: Noble[] })._p1DraftPool = p1NoblesRaw.map((c) =>
          createNoble(c.suit, c.rank as NobleRank, 'p1'),
        )
        ;(state as unknown as { _p2DraftPool: Noble[] })._p2DraftPool = p2NoblesRaw.map((c) =>
          createNoble(c.suit, c.rank as NobleRank, 'p2'),
        )
        ;(state as unknown as { _draftSelections: Record<PlayerID, string[]> })._draftSelections = { p1: [], p2: [] }
        ;(state as unknown as { _draftConfirmed: Record<PlayerID, boolean> })._draftConfirmed = { p1: false, p2: false }

        state.numberDeck = numberDeck
        state.nobleDeck = []
        state.discardPile = []
        state.phase = 'SETUP_DRAFT'
        state.turnPhase = 'BEGINNING_OF_TURN'
        state.activePlayerId = 'p1'
        state.turnNumber = 1
        state.winner = null
        state.duelState = null
        state.log = ['Game started. Player 1 drafts first.']
      })
    },

    draftNoble: (playerId, nobleId) => {
      set((state) => {
        const store = state as unknown as { _draftSelections: Record<PlayerID, string[]>; _draftConfirmed: Record<PlayerID, boolean> }
        if (store._draftConfirmed[playerId]) return
        const selections = store._draftSelections[playerId]
        if (selections.includes(nobleId)) {
          store._draftSelections[playerId] = selections.filter((id) => id !== nobleId)
        } else if (selections.length < 3) {
          store._draftSelections[playerId] = [...selections, nobleId]
        }
      })
    },

    confirmDraft: (playerId) => {
      set((state) => {
        const store = state as unknown as {
          _draftSelections: Record<PlayerID, string[]>
          _draftConfirmed: Record<PlayerID, boolean>
          _p1DraftPool: Noble[]
          _p2DraftPool: Noble[]
        }
        if (store._draftSelections[playerId].length !== 3) return
        store._draftConfirmed[playerId] = true

        const pool = playerId === 'p1' ? store._p1DraftPool : store._p2DraftPool
        const selected = store._draftSelections[playerId]
        const courtyard = pool.filter((n) => selected.includes(n.id))
        const bench = pool.filter((n) => !selected.includes(n.id))

        state.players[playerId].courtyard = courtyard

        // Add bench nobles to shared nobleDeck
        const nobleDeckCards = bench.map((n): Card => ({
          id: `${n.suit}-${n.rank}`,
          suit: n.suit,
          rank: n.rank,
          deckType: 'noble',
        }))
        state.nobleDeck = [...state.nobleDeck, ...nobleDeckCards]

        if (store._draftConfirmed.p1 && store._draftConfirmed.p2) {
          // Deal 6 number cards to each player
          const { dealt: p1Hand, remaining: afterP1 } = deal(state.numberDeck, 6)
          const { dealt: p2Hand, remaining: afterDeal } = deal(afterP1, 6)
          state.players.p1.hand = p1Hand
          state.players.p2.hand = p2Hand
          state.numberDeck = afterDeal
          state.phase = 'IN_GAME'
          state.log.push('Draft complete. Game begins!')
        } else {
          state.log.push(`Player ${playerId === 'p1' ? '1' : '2'} confirmed draft.`)
        }
      })
    },

    endBeginningOfTurn: () => {
      set((state) => {
        if (state.turnPhase !== 'BEGINNING_OF_TURN') return
        state.turnPhase = 'GENERATE_RESOURCES'
      })
    },

    useKingAbility: (nobleId) => {
      set((state) => {
        if (state.turnPhase !== 'BEGINNING_OF_TURN') return
        const player = state.players[state.activePlayerId]
        const { player: updated, noble } = kingBeginningAbility(player, nobleId)
        state.players[state.activePlayerId] = updated
        const nobleIdx = state.players[state.activePlayerId].courtyard.findIndex((n) => n.id === nobleId)
        if (nobleIdx >= 0) state.players[state.activePlayerId].courtyard[nobleIdx] = noble
        state.log.push(`${state.activePlayerId} used King ability (+1 resource).`)
      })
    },

    usePermanentBoost: (cardId, nobleId) => {
      set((state) => {
        if (state.turnPhase !== 'BEGINNING_OF_TURN') return
        const player = state.players[state.activePlayerId]
        const card = player.hand.find((c) => c.id === cardId)
        const nobleIdx = player.courtyard.findIndex((n) => n.id === nobleId)
        if (!card || nobleIdx < 0) return
        player.courtyard[nobleIdx] = applyPermanentBoost(player.courtyard[nobleIdx], card)
        player.hand = player.hand.filter((c) => c.id !== cardId)
        state.log.push(`${state.activePlayerId} attached ${card.rank} as boost to noble.`)
      })
    },

    clearPermanentBoost: (nobleId) => {
      set((state) => {
        if (state.turnPhase !== 'BEGINNING_OF_TURN') return
        const player = state.players[state.activePlayerId]
        const nobleIdx = player.courtyard.findIndex((n) => n.id === nobleId)
        if (nobleIdx < 0) return
        const boostedCard = player.courtyard[nobleIdx].permanentBoostCard
        if (boostedCard) {
          player.hand.push(boostedCard)
          player.courtyard[nobleIdx] = removePermanentBoost(player.courtyard[nobleIdx])
        }
      })
    },

    useSuitAbility: (suit, discardCardId, extra) => {
      set((state) => {
        if (state.turnPhase !== 'BEGINNING_OF_TURN') return
        const player = state.players[state.activePlayerId]
        const discardCard = player.hand.find((c) => c.id === discardCardId)
        if (!discardCard) return

        if (suit === 'hearts' && extra) {
          const opponentId: PlayerID = state.activePlayerId === 'p1' ? 'p2' : 'p1'
          const nobleIdx = state.players[state.activePlayerId].courtyard.findIndex((n) => n.id === extra)
          // Also check opponent nobles
          const opponentNobleIdx = state.players[opponentId].courtyard.findIndex((n) => n.id === extra)
          if (nobleIdx >= 0) {
            const { player: updated, noble } = heartsAbility(player, player.courtyard[nobleIdx], discardCard)
            state.players[state.activePlayerId] = updated
            state.players[state.activePlayerId].courtyard[nobleIdx] = noble
          } else if (opponentNobleIdx >= 0) {
            const targetNoble = state.players[opponentId].courtyard[opponentNobleIdx]
            const { player: updated, noble } = heartsAbility(player, targetNoble, discardCard)
            state.players[state.activePlayerId] = updated
            state.players[opponentId].courtyard[opponentNobleIdx] = noble
          }
        } else if (suit === 'diamonds') {
          const drawn = state.numberDeck.slice(0, 3)
          state.numberDeck = state.numberDeck.slice(3)
          state.players[state.activePlayerId] = diamondsAbility(player, discardCard, drawn)
        } else if (suit === 'clubs' && extra) {
          const pickedCard = state.discardPile.find((c) => c.id === extra)
          if (!pickedCard) return
          state.discardPile = state.discardPile.filter((c) => c.id !== extra)
          state.players[state.activePlayerId] = clubsAbility(player, discardCard, pickedCard)
        } else if (suit === 'spades') {
          state.players[state.activePlayerId] = spadesAbility(player, discardCard)
        }
        state.log.push(`${state.activePlayerId} used ${suit} suit ability.`)
      })
    },

    generateResourcesAuto: () => {
      set((state) => {
        if (state.turnPhase !== 'GENERATE_RESOURCES') return
        const player = state.players[state.activePlayerId]
        state.players[state.activePlayerId] = generateResourcesAuto(player)
        state.turnPhase = 'SPEND_RESOURCES'
        state.log.push(`${state.activePlayerId} gained 1 resource (auto).`)
      })
    },

    generateResourcesDiscard3: (cardIds) => {
      set((state) => {
        if (state.turnPhase !== 'GENERATE_RESOURCES') return
        const player = state.players[state.activePlayerId]
        const cards = cardIds.map((id) => player.hand.find((c) => c.id === id)).filter(Boolean) as Card[]
        const updated = generateResourcesDiscard3(player, cards)
        state.players[state.activePlayerId] = updated
        state.discardPile.push(...cards)
        state.turnPhase = 'SPEND_RESOURCES'
        state.log.push(`${state.activePlayerId} discarded 3 cards for 3 resources.`)
      })
    },

    endGenerateResources: () => {
      set((state) => {
        if (state.turnPhase !== 'GENERATE_RESOURCES') return
        state.turnPhase = 'SPEND_RESOURCES'
      })
    },

    drawCard: () => {
      set((state) => {
        if (state.turnPhase !== 'SPEND_RESOURCES') return
        const player = state.players[state.activePlayerId]
        if (!canDrawCard(player)) return
        const { numberDeck, discardPile } = reshuffleIfNeeded(state.numberDeck, state.discardPile)
        state.numberDeck = numberDeck
        state.discardPile = discardPile
        if (state.numberDeck.length === 0) return
        const [card, ...rest] = state.numberDeck
        state.numberDeck = rest
        state.players[state.activePlayerId] = spendResourceDraw({ ...player, hand: [...player.hand, card] })
        state.log.push(`${state.activePlayerId} drew a card.`)
      })
    },

    recruitNoble: (nobleId) => {
      set((state) => {
        if (state.turnPhase !== 'SPEND_RESOURCES') return
        const player = state.players[state.activePlayerId]
        if (!canRecruitNoble(player, state.nobleDeck.length === 0)) return
        const nobleCardIdx = state.nobleDeck.findIndex((c) => c.id === nobleId)
        if (nobleCardIdx < 0) return
        const nobleCard = state.nobleDeck[nobleCardIdx]
        state.nobleDeck.splice(nobleCardIdx, 1)
        const noble = createNoble(nobleCard.suit, nobleCard.rank as NobleRank, state.activePlayerId)
        state.players[state.activePlayerId] = spendResourceRecruit(player)
        state.players[state.activePlayerId].courtyard.push(noble)
        state.log.push(`${state.activePlayerId} recruited ${noble.rank} of ${noble.suit}.`)
      })
    },

    endSpend: () => {
      set((state) => {
        if (state.turnPhase !== 'SPEND_RESOURCES') return
        state.turnPhase = 'ANNOUNCE_DUEL'
      })
    },

    announceDuel: (attackerNobleId, targetNobleId) => {
      set((state) => {
        if (state.turnPhase !== 'ANNOUNCE_DUEL') return
        const attackerId = state.activePlayerId
        const defenderId: PlayerID = attackerId === 'p1' ? 'p2' : 'p1'
        state.duelState = {
          attackerNobleId,
          defenderNobleId: targetNobleId,
          attackerId,
          defenderId,
          attackerCards: [],
          defenderCard: null,
          attackerRoll: [],
          defenderRoll: [],
          attackerTotal: 0,
          defenderTotal: 0,
          result: null,
        }
        state.turnPhase = 'DUEL_DEFENDER_REDIRECT'
        state.log.push(`${attackerId} declared a duel!`)
      })
    },

    skipDuel: () => {
      set((state) => {
        if (state.turnPhase !== 'ANNOUNCE_DUEL') return
        endTurn(state)
      })
    },

    redirectDuel: (newTargetNobleId) => {
      set((state) => {
        if (state.turnPhase !== 'DUEL_DEFENDER_REDIRECT' || !state.duelState) return
        const defender = state.players[state.duelState.defenderId]
        if (defender.resources < 2) return
        defender.resources -= 2
        state.duelState.defenderNobleId = newTargetNobleId
        state.turnPhase = 'DUEL_ATTACKER_PLAY_CARD'
        state.log.push(`${state.duelState.defenderId} redirected the duel.`)
      })
    },

    acceptTarget: () => {
      set((state) => {
        if (state.turnPhase !== 'DUEL_DEFENDER_REDIRECT') return
        state.turnPhase = 'DUEL_ATTACKER_PLAY_CARD'
      })
    },

    playAttackerCard: (cardIds) => {
      set((state) => {
        if (state.turnPhase !== 'DUEL_ATTACKER_PLAY_CARD' || !state.duelState) return
        const player = state.players[state.duelState.attackerId]
        const cards = cardIds.map((id) => player.hand.find((c) => c.id === id)).filter(Boolean) as Card[]
        state.duelState.attackerCards = cards
        player.hand = player.hand.filter((c) => !cardIds.includes(c.id))
        state.turnPhase = 'DUEL_DEFENDER_PLAY_CARD'
      })
    },

    playDefenderCard: (cardId) => {
      set((state) => {
        if (state.turnPhase !== 'DUEL_DEFENDER_PLAY_CARD' || !state.duelState) return
        const player = state.players[state.duelState.defenderId]
        if (cardId) {
          const card = player.hand.find((c) => c.id === cardId)
          if (card) {
            state.duelState.defenderCard = card
            player.hand = player.hand.filter((c) => c.id !== cardId)
          }
        }
        // Resolve
        const attackerId = state.duelState.attackerId
        const defenderId = state.duelState.defenderId
        const attackerNoble = state.players[attackerId].courtyard.find((n) => n.id === state.duelState!.attackerNobleId)!
        const defenderNoble = state.players[defenderId].courtyard.find((n) => n.id === state.duelState!.defenderNobleId)!
        const attackerAllies = state.players[attackerId].courtyard.filter((n) => n.id !== attackerNoble.id && !isEliminated(n))
        const defenderAllies = state.players[defenderId].courtyard.filter((n) => n.id !== defenderNoble.id && !isEliminated(n))

        const outcome = resolveDuel(
          attackerNoble,
          defenderNoble,
          state.duelState.attackerCards,
          state.duelState.defenderCard,
          attackerAllies,
          defenderAllies,
        )

        state.duelState.attackerRoll = outcome.attackerRoll
        state.duelState.defenderRoll = outcome.defenderRoll
        state.duelState.attackerTotal = outcome.attackerTotal
        state.duelState.defenderTotal = outcome.defenderTotal
        state.duelState.result = outcome.result

        // Apply wounds and resources
        if (outcome.result === 'attacker_wins') {
          const defNobleIdx = state.players[defenderId].courtyard.findIndex((n) => n.id === defenderNoble.id)
          state.players[defenderId].courtyard[defNobleIdx] = woundNoble(defenderNoble)
          state.players[attackerId].resources += 1
        } else if (outcome.result === 'defender_wins') {
          const atkNobleIdx = state.players[attackerId].courtyard.findIndex((n) => n.id === attackerNoble.id)
          state.players[attackerId].courtyard[atkNobleIdx] = woundNoble(attackerNoble)
          state.players[defenderId].resources += 1
        } else {
          const atkNobleIdx = state.players[attackerId].courtyard.findIndex((n) => n.id === attackerNoble.id)
          const defNobleIdx = state.players[defenderId].courtyard.findIndex((n) => n.id === defenderNoble.id)
          state.players[attackerId].courtyard[atkNobleIdx] = woundNoble(attackerNoble)
          state.players[defenderId].courtyard[defNobleIdx] = woundNoble(defenderNoble)
        }

        // Discard played cards
        if (state.duelState.attackerCards.length > 0) {
          state.discardPile.push(...state.duelState.attackerCards)
        }
        if (state.duelState.defenderCard) {
          state.discardPile.push(state.duelState.defenderCard)
        }

        state.turnPhase = 'DUEL_RESULT'
        state.log.push(
          `Duel result: ${outcome.result} (${outcome.attackerTotal} vs ${outcome.defenderTotal}).`,
        )
      })
    },

    confirmDuelResult: () => {
      set((state) => {
        if (state.turnPhase !== 'DUEL_RESULT') return
        // Check victory
        const winner = checkVictory(state)
        if (winner) {
          state.winner = winner
          state.phase = 'GAME_OVER'
          state.log.push(`Game over! Player ${winner === 'p1' ? '1' : '2'} wins!`)
          return
        }
        endTurn(state)
      })
    },

    resetGame: () => {
      set((state) => {
        Object.assign(state, buildInitialState())
        state.log = []
      })
    },
  })),
)

function endTurn(state: GameState & Record<string, unknown>) {
  const nextPlayer: PlayerID = state.activePlayerId === 'p1' ? 'p2' : 'p1'
  state.players[state.activePlayerId].cardsDrewThisTurn = 0
  state.players[state.activePlayerId].hasUsedDiscard3ThisTurn = false
  state.players[state.activePlayerId].kingAbilityUsedThisTurn = false
  state.activePlayerId = nextPlayer
  state.duelState = null
  state.turnPhase = 'BEGINNING_OF_TURN'
  state.turnNumber += 1
  // Reshuffle if needed
  const { numberDeck, discardPile } = reshuffleIfNeeded(state.numberDeck as Card[], state.discardPile as Card[])
  state.numberDeck = numberDeck
  state.discardPile = discardPile
}
