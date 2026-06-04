import { describe, it, expect } from 'vitest'
import {
  canUseHearts, heartsAbility,
  canUseDiamonds, diamondsAbility,
  canUseClubs, clubsAbility,
  canUseSpades, spadesAbility,
  canUseKingAbility, kingBeginningAbility,
  applyPermanentBoost, removePermanentBoost,
} from '@/engine/abilities'
import { createNoble, woundNoble } from '@/engine/nobles'
import type { Card, Player } from '@/types'

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1', hand: [], courtyard: [], resources: 0,
    suitAbilitiesUsed: [], cardsDrewThisTurn: 0,
    hasUsedDiscard3ThisTurn: false, kingAbilityUsedThisTurn: false,
    ...overrides,
  }
}

const heartCard: Card = { id: 'hearts-7', suit: 'hearts', rank: '7', deckType: 'number' }
const diamondCard: Card = { id: 'diamonds-5', suit: 'diamonds', rank: '5', deckType: 'number' }
const clubCard: Card = { id: 'clubs-9', suit: 'clubs', rank: '9', deckType: 'number' }
const spadeCard: Card = { id: 'spades-8', suit: 'spades', rank: '8', deckType: 'number' }
const extraCard: Card = { id: 'hearts-3', suit: 'hearts', rank: '3', deckType: 'number' }

describe('heartsAbility', () => {
  it('canUseHearts returns true when not used and has hearts card', () => {
    expect(canUseHearts(makePlayer({ hand: [heartCard] }))).toBe(true)
  })

  it('canUseHearts returns false when already used', () => {
    expect(canUseHearts(makePlayer({ hand: [heartCard], suitAbilitiesUsed: ['hearts'] }))).toBe(false)
  })

  it('heals 1 wound from target noble', () => {
    const noble = woundNoble(createNoble('spades', 'J', 'p1'))
    const player = makePlayer({ hand: [heartCard] })
    const { noble: healed } = heartsAbility(player, noble, heartCard)
    expect(healed.wounds).toBe(0)
  })

  it('removes the hearts card from hand', () => {
    const player = makePlayer({ hand: [heartCard] })
    const noble = createNoble('clubs', 'Q', 'p1')
    const { player: updated } = heartsAbility(player, noble, heartCard)
    expect(updated.hand).toHaveLength(0)
    expect(updated.suitAbilitiesUsed).toContain('hearts')
  })
})

describe('diamondsAbility', () => {
  it('canUseDiamonds returns false when opponent has same or fewer nobles', () => {
    // player courtyard = 0, opponent = 0 → not more → false
    const player = makePlayer({ hand: [diamondCard] })
    expect(canUseDiamonds(player, 0)).toBe(false)
  })

  it('canUseDiamonds returns true when opponent has strictly more nobles', () => {
    // player courtyard = 0, opponent = 1 → opponent has more → true
    const player = makePlayer({ hand: [diamondCard] })
    expect(canUseDiamonds(player, 1)).toBe(true)
  })

  it('canUseDiamonds returns false when already used', () => {
    const player = makePlayer({ hand: [diamondCard], suitAbilitiesUsed: ['diamonds'] })
    expect(canUseDiamonds(player, 3)).toBe(false)
  })

  it('draws 3 cards and removes diamonds card', () => {
    const player = makePlayer({ hand: [diamondCard] })
    const drawn: Card[] = [extraCard, heartCard, clubCard]
    const result = diamondsAbility(player, diamondCard, drawn)
    expect(result.hand).toHaveLength(3)
    expect(result.suitAbilitiesUsed).toContain('diamonds')
  })
})

describe('clubsAbility', () => {
  it('takes a card from discard and removes clubs card from hand', () => {
    const player = makePlayer({ hand: [clubCard] })
    const picked: Card = { id: 'hearts-K', suit: 'hearts', rank: 'K', deckType: 'noble' }
    const result = clubsAbility(player, clubCard, picked)
    expect(result.hand).toContain(picked)
    expect(result.hand).not.toContain(clubCard)
    expect(result.suitAbilitiesUsed).toContain('clubs')
  })

  it('canUseClubs returns false after use', () => {
    expect(canUseClubs(makePlayer({ hand: [clubCard], suitAbilitiesUsed: ['clubs'] }))).toBe(false)
  })
})

describe('spadesAbility', () => {
  it('removes spades card from hand and marks ability used', () => {
    const player = makePlayer({ hand: [spadeCard] })
    const result = spadesAbility(player, spadeCard)
    expect(result.hand).toHaveLength(0)
    expect(result.suitAbilitiesUsed).toContain('spades')
  })

  it('canUseSpades returns false when no spades in hand', () => {
    expect(canUseSpades(makePlayer({ hand: [heartCard] }))).toBe(false)
  })
})

describe('kingBeginningAbility', () => {
  it('grants +1 resource and adds a wound to King', () => {
    const king = woundNoble(createNoble('clubs', 'K', 'p1'))
    const player = makePlayer({ resources: 2, courtyard: [king] })
    const { player: updated, noble } = kingBeginningAbility(player, king.id)
    expect(updated.resources).toBe(3)
    expect(noble.wounds).toBe(2)
    expect(updated.kingAbilityUsedThisTurn).toBe(true)
  })

  it('throws when King has no wounds', () => {
    const king = createNoble('clubs', 'K', 'p1')
    const player = makePlayer({ courtyard: [king] })
    expect(() => kingBeginningAbility(player, king.id)).toThrow()
  })

  it('canUseKingAbility returns false when already used this turn', () => {
    const king = woundNoble(createNoble('clubs', 'K', 'p1'))
    const player = makePlayer({ courtyard: [king], kingAbilityUsedThisTurn: true })
    expect(canUseKingAbility(player)).toBe(false)
  })
})

describe('permanentBoost', () => {
  it('applyPermanentBoost attaches a 2 or 3 card to noble', () => {
    const noble = createNoble('hearts', 'J', 'p1')
    const card2: Card = { id: 'clubs-2', suit: 'clubs', rank: '2', deckType: 'number' }
    expect(applyPermanentBoost(noble, card2).permanentBoostCard).toEqual(card2)
  })

  it('throws when card is not a 2 or 3', () => {
    const noble = createNoble('hearts', 'J', 'p1')
    const card5: Card = { id: 'clubs-5', suit: 'clubs', rank: '5', deckType: 'number' }
    expect(() => applyPermanentBoost(noble, card5)).toThrow()
  })

  it('removePermanentBoost clears the boost', () => {
    const noble = createNoble('hearts', 'J', 'p1')
    const card3: Card = { id: 'clubs-3', suit: 'clubs', rank: '3', deckType: 'number' }
    const boosted = applyPermanentBoost(noble, card3)
    expect(removePermanentBoost(boosted).permanentBoostCard).toBeNull()
  })
})
