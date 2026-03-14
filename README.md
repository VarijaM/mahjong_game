# Mahjong Game

A playable mahjong game with your custom rules: 11-tile win, back-wall joker, flowers, and more.

## Rules

- **Tile Set:** Full 144 tiles (Dots, Bamboos, Characters, Winds, Dragons, Flowers)
- **Starting Hand:** 13 tiles each
- **Dealer:** Draws 14th tile first, then discards to begin
- **Back-Wall Joker:** One tile from the back of the wall becomes the joker; its 3 duplicates are wild cards
- **Flowers:** Draw a Flower → place aside, draw replacement from back of wall (repeat if needed)
- **11-Tile Win:** 3 sets of three (Pungs/Chows) + 1 pair = 11 tiles; remaining 2–3 are surplus

## Quick Start

```bash
# Install all dependencies
npm install
cd client
npm install

# Run vs Computer (client only) - from project root:
cd client
npm run dev
# (On Windows PowerShell, use: cd client; npm run dev)
```

```bash
# Run multiplayer (client + server)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to play.

## Modes

1. **vs Computer** – Play against a basic AI
2. **Join with Code** – Create a game (get a 6-digit code) or join with a code (requires server)

## Features

- Pick tiles (draw from wall) and discard
- Hint mode – suggests a tile to discard
- Win detection
- Flower handling
- Joker / wild cards

## Project Structure

```
mahjong/
├── client/          # React + Vite frontend
│   └── src/
│       ├── game/    # Tiles, engine, win detection, AI
│       └── components/
├── server/          # Express + Socket.io (multiplayer)
└── DESIGN.md        # Full design document
```
