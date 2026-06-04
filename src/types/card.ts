export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'

export interface Card {
  id: string
  suit: Suit
  rank: Rank
  deckType: 'number' | 'noble'
}

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
export const NUMBER_RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10']
export const NOBLE_RANKS: Rank[] = ['J', 'Q', 'K']
export const RED_SUITS: Suit[] = ['hearts', 'diamonds']
