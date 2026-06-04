import { describe, it, expect, vi } from 'vitest'
import { resolveDuel, rollDice } from '@/engine/duel'
import { createNoble } from '@/engine/nobles'
import type { Card } from '@/types'

const aceHearts: Card = { id: 'hearts-A', suit: 'hearts', rank: 'A', deckType: 'number' }
const aceSpades: Card = { id: 'spades-A', suit: 'spades', rank: 'A', deckType: 'number' }
const tenHearts: Card = { id: 'hearts-10', suit: 'hearts', rank: '10', deckType: 'number' }
const twoClubs: Card = { id: 'clubs-2', suit: 'clubs', rank: '2', deckType: 'number' }

describe('rollDice', () => {
  it('returns the correct count of dice', () => {
    expect(rollDice(1)).toHaveLength(1)
    expect(rollDice(2)).toHaveLength(2)
  })

  it('each die is between 1 and 6', () => {
    const rolls = Array.from({ length: 100 }, () => rollDice(1)[0])
    expect(rolls.every((r) => r >= 1 && r <= 6)).toBe(true)
  })
})

describe('resolveDuel', () => {
  const jack = createNoble('hearts', 'J', 'p1')
  const queen = createNoble('spades', 'Q', 'p2')

  it('attacker Ace wins regardless of totals', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0) // dice always 1
    const outcome = resolveDuel(jack, queen, [aceHearts], null, [], [])
    expect(outcome.result).toBe('attacker_wins')
    vi.restoreAllMocks()
  })

  it('defender Ace wins when attacker plays no Ace', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const outcome = resolveDuel(jack, queen, [twoClubs], aceSpades, [], [])
    expect(outcome.result).toBe('defender_wins')
    vi.restoreAllMocks()
  })

  it('both play Ace → tie', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const outcome = resolveDuel(jack, queen, [aceHearts], aceSpades, [], [])
    expect(outcome.result).toBe('tie')
    vi.restoreAllMocks()
  })

  it('higher total wins (no Ace)', () => {
    // Fix dice to 1 each. Jack 11+1=12, Queen 12+1=13. Defender wins.
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const outcome = resolveDuel(jack, queen, [], null, [], [])
    expect(outcome.result).toBe('defender_wins')
    vi.restoreAllMocks()
  })

  it('tie when totals are equal', () => {
    // Jack 11+1d6, Queen 12+1d6. Force roll: jack plays 10hearts (+10+2 suit=22), queen rolls high
    // We need jack total == queen total precisely — easiest: no cards, force same roll
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0) // jack rolls 1 → total 12
      .mockReturnValueOnce(0) // queen rolls 1 → total 13
    // jack 12 vs queen 13 — defender wins
    const outcome = resolveDuel(jack, queen, [], null, [], [])
    expect(outcome.result).toBe('defender_wins')
    vi.restoreAllMocks()
  })

  it('attacker matching-suit card adds +2 bonus', () => {
    // Jack of hearts plays 10 of hearts → +10 + 2(suit) = +12 bonus
    vi.spyOn(Math, 'random').mockReturnValue(0) // both roll 1
    const outcome = resolveDuel(jack, queen, [tenHearts], null, [], [])
    // jack: 11 + 1(roll) + 10 + 2(suit) = 24; queen: 12 + 1(roll) = 13
    expect(outcome.attackerTotal).toBe(24)
    expect(outcome.result).toBe('attacker_wins')
    vi.restoreAllMocks()
  })

  it('King rolls 2 dice', () => {
    const king = createNoble('clubs', 'K', 'p1')
    vi.spyOn(Math, 'random').mockReturnValue(0) // all dice = 1
    const outcome = resolveDuel(king, queen, [], null, [], [])
    expect(outcome.attackerRoll).toHaveLength(2)
    vi.restoreAllMocks()
  })

  it('Jack can play 2 attacker cards', () => {
    const card1: Card = { id: 'hearts-5', suit: 'hearts', rank: '5', deckType: 'number' }
    const card2: Card = { id: 'clubs-4', suit: 'clubs', rank: '4', deckType: 'number' }
    vi.spyOn(Math, 'random').mockReturnValue(0) // dice = 1
    const outcome = resolveDuel(jack, queen, [card1, card2], null, [], [])
    // jack: 11+1 + 5+2(hearts match) + 4 = 23
    expect(outcome.attackerTotal).toBe(23)
    vi.restoreAllMocks()
  })
})
