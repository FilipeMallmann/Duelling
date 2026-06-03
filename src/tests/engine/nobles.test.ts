import { describe, it, expect } from 'vitest'
import { createNoble, nobleStrength, woundNoble, healNoble, isEliminated, attachBoost, removeBoost } from '@/engine/nobles'
import type { Card, Noble } from '@/types'

const boostCard2: Card = { id: 'hearts-2', suit: 'hearts', rank: '2', deckType: 'number' }
const boostCard3: Card = { id: 'clubs-3', suit: 'clubs', rank: '3', deckType: 'number' }

describe('createNoble', () => {
  it('creates a Jack with strength 11 and 2 wound limit', () => {
    const noble = createNoble('hearts', 'J', 'p1')
    expect(noble.baseStrength).toBe(11)
    expect(noble.woundLimit).toBe(2)
    expect(noble.wounds).toBe(0)
    expect(noble.rank).toBe('J')
  })

  it('creates a Queen with strength 12 and 2 wound limit', () => {
    const noble = createNoble('diamonds', 'Q', 'p1')
    expect(noble.baseStrength).toBe(12)
    expect(noble.woundLimit).toBe(2)
  })

  it('creates a King with strength 13 and 3 wound limit', () => {
    const noble = createNoble('spades', 'K', 'p1')
    expect(noble.baseStrength).toBe(13)
    expect(noble.woundLimit).toBe(3)
  })

  it('sets permanentBoostCard to null', () => {
    expect(createNoble('clubs', 'J', 'p2').permanentBoostCard).toBeNull()
  })

  it('id includes ownerId, suit, and rank', () => {
    const noble = createNoble('hearts', 'K', 'p2')
    expect(noble.id).toBe('p2-hearts-K')
  })
})

describe('nobleStrength', () => {
  it('Jack alone returns 11', () => {
    const jack = createNoble('hearts', 'J', 'p1')
    expect(nobleStrength(jack, [])).toBe(11)
  })

  it('Queen alone (no allies) returns 12', () => {
    const queen = createNoble('hearts', 'Q', 'p1')
    expect(nobleStrength(queen, [])).toBe(12)
  })

  it('Queen with 1 allied noble returns 15', () => {
    const queen = createNoble('hearts', 'Q', 'p1')
    const ally = createNoble('clubs', 'J', 'p1')
    expect(nobleStrength(queen, [ally])).toBe(15)
  })

  it('Queen with 2 allied nobles returns 18', () => {
    const queen = createNoble('hearts', 'Q', 'p1')
    const ally1 = createNoble('clubs', 'J', 'p1')
    const ally2 = createNoble('spades', 'K', 'p1')
    expect(nobleStrength(queen, [ally1, ally2])).toBe(18)
  })

  it('Jack with a 2-card boost returns 13', () => {
    const jack = attachBoost(createNoble('hearts', 'J', 'p1'), boostCard2)
    expect(nobleStrength(jack, [])).toBe(13)
  })

  it('Queen with 3-card boost and 1 ally returns 18', () => {
    const queen = attachBoost(createNoble('hearts', 'Q', 'p1'), boostCard3)
    const ally = createNoble('clubs', 'J', 'p1')
    expect(nobleStrength(queen, [ally])).toBe(12 + 3 + 3)
  })
})

describe('woundNoble and isEliminated', () => {
  it('woundNoble increments wounds', () => {
    const noble = createNoble('hearts', 'J', 'p1')
    expect(woundNoble(noble).wounds).toBe(1)
  })

  it('does not mutate original', () => {
    const noble = createNoble('hearts', 'J', 'p1')
    woundNoble(noble)
    expect(noble.wounds).toBe(0)
  })

  it('Jack is eliminated at 2 wounds', () => {
    let jack = createNoble('hearts', 'J', 'p1')
    jack = woundNoble(jack)
    expect(isEliminated(jack)).toBe(false)
    jack = woundNoble(jack)
    expect(isEliminated(jack)).toBe(true)
  })

  it('King is eliminated at 3 wounds', () => {
    let king = createNoble('clubs', 'K', 'p1')
    king = woundNoble(king)
    king = woundNoble(king)
    expect(isEliminated(king)).toBe(false)
    king = woundNoble(king)
    expect(isEliminated(king)).toBe(true)
  })
})

describe('healNoble', () => {
  it('reduces wounds by 1', () => {
    const wounded = woundNoble(createNoble('hearts', 'J', 'p1'))
    expect(healNoble(wounded).wounds).toBe(0)
  })

  it('does not go below 0 wounds', () => {
    const noble = createNoble('hearts', 'J', 'p1')
    expect(healNoble(noble).wounds).toBe(0)
  })
})

describe('attachBoost / removeBoost', () => {
  it('attaches a card as permanent boost', () => {
    const jack = createNoble('hearts', 'J', 'p1')
    const boosted = attachBoost(jack, boostCard2)
    expect(boosted.permanentBoostCard).toEqual(boostCard2)
  })

  it('removeBoost clears the boost card', () => {
    const noble: Noble = { ...createNoble('hearts', 'J', 'p1'), permanentBoostCard: boostCard2 }
    expect(removeBoost(noble).permanentBoostCard).toBeNull()
  })
})
