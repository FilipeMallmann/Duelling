# Dueling Nobles

A 2-player local card game built with React + TypeScript + Vite.

## Dev Commands

```bash
npm run dev        # start dev server (http://localhost:5173)
npm test           # run tests in watch mode
npm run test:run   # run tests once (CI mode)
npm run build      # type-check + production build
npm run lint       # ESLint
npm run format:check  # Prettier check
```

## Project Structure

- `src/types/` — TypeScript interfaces (Card, Noble, Player, GameState)
- `src/engine/` — Pure game logic functions (no React)
- `src/store/` — Zustand state stores
- `src/components/` — React components
- `src/hooks/` — Custom React hooks
- `src/tests/` — Unit, component, and integration tests

## Game Rules Summary

See `duelingnobles.PDF` for full rules. Key points:
- 52-card deck split into Noble deck (J/Q/K) and Number deck (A–10)
- Each player drafts 3 nobles; remaining 6 form a shared recruit pool
- Turn phases: Beginning → Generate Resources → Spend → Announce Duel → Resolve
- Win by eliminating all opponent nobles
