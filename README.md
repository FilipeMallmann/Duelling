# Dueling Nobles

A 2-player local card game built with React + TypeScript + Vite, based on the Dueling Nobles rules by 3J Games.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher (comes with Node.js)

Verify your versions:

```bash
node -v
npm -v
```

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/FilipeMallmann/Duelling.git
cd Duelling
npm install
```

## Running Locally

Start the development server:

```bash
npm run dev
```

Open your browser at **http://localhost:5173**

Both players share the same screen and take turns on the same device.

## Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Type-check + production build (outputs to `dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run all tests once (CI mode) |
| `npm run lint` | Run ESLint |
| `npm run format:check` | Check formatting with Prettier |

## How to Play

### Setup
1. **Player 1** is shown 6 random nobles — select 3 to form your court, then click **Confirm Court**
2. **Player 2** repeats the same draft
3. The remaining 6 nobles become the shared recruit pool

### Turn Phases (in order)
1. **Beginning of Turn** — optionally use King ability, attach permanent boosts (2s/3s), or use a suit ability (once per game each)
2. **Generate Resources** — take +1 resource automatically, or discard 3 cards of the same suit for +3 resources
3. **Spend Resources** — spend 1 resource to draw a card (max 3/turn), or 5 resources to recruit a noble from the pool
4. **Announce Duel** — pick your noble and an opponent noble to challenge, or skip
5. **Resolve Duel** — optionally play a number card, then dice are rolled; higher total wins

### Winning
Eliminate all of your opponent's nobles.

### Noble Stats

| Noble | Strength | Wounds | Special |
|---|---|---|---|
| Jack | 11 | 2 | May play 2 number cards as attacker |
| Queen | 12 | 2 | +3 strength per other noble in your courtyard |
| King | 13 | 3 | Rolls 2d6 · Beginning of turn: self-wound for +1 resource |

### Card Abilities
- **Ace** — auto-wins a duel (both play Ace → tie, both wounded)
- **2s / 3s** — can be permanently attached to a noble as a strength boost (1 per noble)
- **Matching suit** — playing a card that matches your noble's suit gives +2 to your duel total

### Suit Abilities (once per game, beginning of turn only)
| Suit | Effect |
|---|---|
| ♥ Hearts | Discard a hearts card → heal 1 wound from any noble |
| ♦ Diamonds | Discard a diamonds card → draw 3 cards (only if opponent has more nobles) |
| ♣ Clubs | Discard a clubs card → take any card from the discard pile |
| ♠ Spades | Discard a spades card → look at your opponent's hand |

## Project Structure

```
src/
├── types/          # TypeScript interfaces (Card, Noble, Player, GameState)
├── engine/         # Pure game logic — no React (deck, nobles, duel, resources, abilities, victory)
├── store/          # Zustand state store + selectors
├── components/
│   ├── layout/     # GameBoard, PlayerZone, StatusBar
│   ├── cards/      # CardFront, CardBack, Hand, CardPip
│   ├── nobles/     # NobleCard, Courtyard, NobleRecruitModal
│   ├── duel/       # DuelArena, DiceRoll, DuelResult
│   ├── hud/        # PhasePanel, ResourceTracker, ActionButton, EventLog
│   └── overlay/    # SetupScreen, VictoryScreen, SpadesPeek
├── hooks/          # useGameActions, usePhaseGuard
└── tests/          # Unit, store, and integration tests
```

## Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — build tool
- [Zustand](https://github.com/pmndrs/zustand) + [Immer](https://immerjs.github.io/immer/) — state management
- [Tailwind CSS v4](https://tailwindcss.com/) — styling
- [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/) — testing
