import { describe, it, expect } from 'vitest'
import { createNumberDeck, createNobleDeck, shuffle, deal } from '@/engine/deck'

describe('createNumberDeck', () => {
  it('returns exactly 40 cards', () => {
    expect(createNumberDeck()).toHaveLength(40)
  })

  it('has no duplicate ids', () => {
    const deck = createNumberDeck()
    const ids = deck.map((c) => c.id)
    expect(new Set(ids).size).toBe(40)
  })

  it('contains only number deckType cards', () => {
    const deck = createNumberDeck()
    expect(deck.every((c) => c.deckType === 'number')).toBe(true)
  })

  it('covers all 4 suits × 10 ranks', () => {
    const deck = createNumberDeck()
    const suits = new Set(deck.map((c) => c.suit))
    expect(suits.size).toBe(4)
    const ranks = new Set(deck.map((c) => c.rank))
    expect(ranks.size).toBe(10)
  })

  it('does not include J, Q, or K', () => {
    const deck = createNumberDeck()
    const nobleRanks = new Set(['J', 'Q', 'K'])
    expect(deck.some((c) => nobleRanks.has(c.rank))).toBe(false)
  })
})

describe('createNobleDeck', () => {
  it('returns exactly 12 cards', () => {
    expect(createNobleDeck()).toHaveLength(12)
  })

  it('has no duplicate ids', () => {
    const deck = createNobleDeck()
    const ids = deck.map((c) => c.id)
    expect(new Set(ids).size).toBe(12)
  })

  it('contains only noble deckType cards', () => {
    const deck = createNobleDeck()
    expect(deck.every((c) => c.deckType === 'noble')).toBe(true)
  })

  it('covers all 4 suits × J/Q/K', () => {
    const deck = createNobleDeck()
    const suits = new Set(deck.map((c) => c.suit))
    expect(suits.size).toBe(4)
    const ranks = new Set(deck.map((c) => c.rank))
    expect(ranks).toEqual(new Set(['J', 'Q', 'K']))
  })
})

describe('shuffle', () => {
  it('returns an array of the same length', () => {
    const deck = createNumberDeck()
    expect(shuffle(deck)).toHaveLength(40)
  })

  it('does not mutate the original array', () => {
    const deck = createNumberDeck()
    const original = [...deck]
    shuffle(deck)
    expect(deck.map((c) => c.id)).toEqual(original.map((c) => c.id))
  })

  it('contains the same cards in a different order (statistically)', () => {
    const deck = createNumberDeck()
    const shuffled = shuffle(deck)
    const originalIds = deck.map((c) => c.id).join(',')
    const shuffledIds = shuffled.map((c) => c.id).join(',')
    // Probability of same order is 1/40! ≈ 0, safe to assert different
    expect(originalIds).not.toBe(shuffledIds)
  })
})

describe('deal', () => {
  it('returns the correct number of dealt cards', () => {
    const deck = createNumberDeck()
    const { dealt } = deal(deck, 6)
    expect(dealt).toHaveLength(6)
  })

  it('remaining has the right count', () => {
    const deck = createNumberDeck()
    const { remaining } = deal(deck, 6)
    expect(remaining).toHaveLength(34)
  })

  it('dealt + remaining equals the full deck', () => {
    const deck = createNumberDeck()
    const { dealt, remaining } = deal(deck, 6)
    expect([...dealt, ...remaining].map((c) => c.id)).toEqual(deck.map((c) => c.id))
  })
})
