# Mahjong Game - Design Document

## Game Rules Summary

### Tile Set (144 tiles total)
| Suit | Count | Description |
|------|-------|-------------|
| Dots | 36 | 1–9, 4 of each |
| Bamboos | 36 | 1–9, 4 of each |
| Characters | 36 | 1–9, 4 of each |
| Winds | 16 | East, South, West, North, 4 of each |
| Dragons | 12 | Red, Green, White, 4 of each |
| Flowers | 8 | 4 Flowers + 4 Seasons (bonus tiles) |

### Special Rules
- **Starting Hand:** 13 tiles per player
- **Dealer:** Gets 14th tile first to start
- **Back-Wall Joker:** One tile flipped from the back of the wall → that tile + its 3 duplicates become wild cards
- **Flower Rule:** Draw a Flower → place aside, draw replacement from back of wall
- **11-Tile Win:** 3 × Pungs/Chows + 1 pair = 11 tiles (remaining 2–3 are surplus)

---

## Architecture

### Tech Stack
- **Frontend:** React + Vite (fast, modern, component-based)
- **Backend:** Node.js + Express (for multiplayer)
- **Real-time:** Socket.io (join codes, live play)
- **Styling:** CSS with a distinctive mahjong aesthetic

### Project Structure
```
mahjong/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Tile, Hand, Board, etc.
│   │   ├── game/          # Game state, logic, AI
│   │   ├── hooks/         # useGame, useMultiplayer
│   │   └── App.jsx
│   └── package.json
├── server/                 # Node backend (multiplayer)
│   ├── index.js
│   └── package.json
├── DESIGN.md
└── README.md
```

---

## Core Features

### 1. Single Player vs Computer
- Opponent AI that draws, discards, and declares wins
- Configurable AI difficulty (basic → strategic)
- Practice without time pressure

### 2. Multiplayer (Join Code)
- Host creates game → gets 6-digit join code
- Players enter code to join
- 2–4 players (or fixed at 4 with empty seats as AI)
- Turn-based with real-time sync

### 3. Hint Mode
- Highlights tiles that are safe to discard
- Suggests which tile to discard based on hand progression
- Can show "distance to win" (how many tiles away from winning)

### 4. Game Flow UI
- Draw pile (wall) visualization
- Hand display (13–14 tiles, organized by suit)
- Discard area (all players’ discards visible)
- Flowers/Joker area
- Win declaration button + celebration

---

## Game State Model

```js
// Core types
Tile = { id, suit, value, isJoker, isWild }
// suits: 'dots'|'bamboo'|'characters'|'wind'|'dragon'|'flower'
// wind values: 'E'|'S'|'W'|'N'
// dragon values: 'R'|'G'|'W'

GameState = {
  players: [{ id, hand: Tile[], discards: Tile[], flowers: Tile[] }],
  wall: Tile[],           // Draw pile
  jokerTile: Tile,        // The revealed back-wall tile
  dealerIndex: number,
  currentPlayerIndex: number,
  phase: 'dealing'|'joker_reveal'|'playing'|'won',
  winner: number | null,
  gameId: string,         // For multiplayer join code
}
```

---

## AI Strategy (Basic)
1. Count melds (existing Pungs/Chows) and pairs
2. Prefer discarding tiles that don’t complete or extend melds
3. Prioritize forming pairs (needed for win)
4. Use wild cards strategically (save for hard-to-get tiles)
5. *Future:* Monte Carlo or hand-evaluation for stronger play

---

## Clarifying Questions & Suggestions

### Questions
1. **Number of players:** Always 4, or support 2–3 as well?
2. **Chows:** Can Chows only be formed from Dots/Bamboos/Characters (number sequences)?
3. **Robots:** In multiplayer, can empty seats be filled by AI?
4. **Scoring:** Any scoring system, or just "first to win"?

### Suggested Additions
- **Undo:** Allow undo of last discard (vs computer, or with opponent agreement)
- **Tutorial:** Step-by-step first game
- **Sound:** Tile clicks, win fanfare
- **Themes:** Light/dark, different tile styles
- **Statistics:** Games played, win rate
- **Auto-sort hand:** Group by suit for readability

---

## Implementation Phases

| Phase | Scope |
|-------|-------|
| **1** | Tile data, deck, basic UI, draw/discard (single player) |
| **2** | Win detection, hint mode, vs computer |
| **3** | Backend + multiplayer with join codes |
| **4** | Polish: sounds, themes, undo, stats |
