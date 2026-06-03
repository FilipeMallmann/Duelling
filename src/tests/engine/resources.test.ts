import { describe, it, expect } from 'vitest'
import {
  canDrawCard,
  canRecruitNoble,
  generateResourcesAuto,
  generateResourcesDiscard3,
  spendResourceDraw,
  spendResourceRecruit,
  MAX_CARDS_PER_TURN,
  NOBLE_RECRUIT_COST,
} from '@/engine/resources'
import type { Card, Player } from '@/types'

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1',
    hand: [],
    courtyard: [],
    resources: 0,
    suitAbilitiesUsed: [],
    cardsDrewThisTurn: 0,
    hasUsedDiscard3ThisTurn: false,
    kingAbilityUsedThisTurn: false,
    ...overrides,
  }
}

const heartsCards: Card[] = [
  { id: 'hearts-4', suit: 'hearts', rank: '4', deckType: 'number' },
  { id: 'hearts-5', suit: 'hearts', rank: '5', deckType: 'number' },
  { id: 'hearts-6', suit: 'hearts', rank: '6', deckType: 'number' },
]

describe('canDrawCard', () => {
  it('returns true when resources >= 1 and draws < 3', () => {
    expect(canDrawCard(makePlayer({ resources: 1 }))).toBe(true)
  })

  it('returns false when resources = 0', () => {
    expect(canDrawCard(makePlayer({ resources: 0 }))).toBe(false)
  })

  it('returns false when draws >= MAX_CARDS_PER_TURN', () => {
    expect(canDrawCard(makePlayer({ resources: 5, cardsDrewThisTurn: MAX_CARDS_PER_TURN }))).toBe(false)
  })
})

describe('canRecruitNoble', () => {
  it('returns true when resources >= 5 and courtyard < 3 and deck not empty', () => {
    expect(canRecruitNoble(makePlayer({ resources: 5 }), false)).toBe(true)
  })

  it('returns false when resources < 5', () => {
    expect(canRecruitNoble(makePlayer({ resources: 4 }), false)).toBe(false)
  })

  it('returns false when noble deck is empty', () => {
    expect(canRecruitNoble(makePlayer({ resources: 5 }), true)).toBe(false)
  })

  it('returns false when courtyard is full (3 nobles)', () => {
    const nobles = [
      { id: 'n1' } as never,
      { id: 'n2' } as never,
      { id: 'n3' } as never,
    ]
    expect(canRecruitNoble(makePlayer({ resources: 5, courtyard: nobles }), false)).toBe(false)
  })
})

describe('generateResourcesAuto', () => {
  it('adds exactly 1 resource', () => {
    const player = makePlayer({ resources: 3 })
    expect(generateResourcesAuto(player).resources).toBe(4)
  })
})

describe('generateResourcesDiscard3', () => {
  it('adds 3 resources and removes the 3 cards from hand', () => {
    const player = makePlayer({ resources: 0, hand: heartsCards })
    const result = generateResourcesDiscard3(player, heartsCards)
    expect(result.resources).toBe(3)
    expect(result.hand).toHaveLength(0)
  })

  it('throws when fewer than 3 cards', () => {
    expect(() => generateResourcesDiscard3(makePlayer(), [heartsCards[0]])).toThrow()
  })

  it('throws when cards are mixed suits', () => {
    const mixed: Card[] = [
      heartsCards[0],
      heartsCards[1],
      { id: 'clubs-2', suit: 'clubs', rank: '2', deckType: 'number' },
    ]
    const player = makePlayer({ hand: mixed })
    expect(() => generateResourcesDiscard3(player, mixed)).toThrow()
  })

  it('throws when cards not in hand', () => {
    const player = makePlayer({ hand: [] })
    expect(() => generateResourcesDiscard3(player, heartsCards)).toThrow()
  })
})

describe('spendResourceDraw', () => {
  it('decrements resources by 1 and increments cardsDrewThisTurn', () => {
    const player = makePlayer({ resources: 3, cardsDrewThisTurn: 1 })
    const result = spendResourceDraw(player)
    expect(result.resources).toBe(2)
    expect(result.cardsDrewThisTurn).toBe(2)
  })
})

describe('spendResourceRecruit', () => {
  it('decrements resources by NOBLE_RECRUIT_COST', () => {
    const player = makePlayer({ resources: 7 })
    expect(spendResourceRecruit(player).resources).toBe(7 - NOBLE_RECRUIT_COST)
  })
})
