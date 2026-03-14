/**
 * Mahjong Game Engine
 * Handles deck, dealing, joker reveal, draw, discard, flowers, win
 */

import { createDeck, shuffle, SUITS } from './tiles.js'
import { canWin } from './winDetection.js'

const TILES_PER_PLAYER = 13
const DEALER_EXTRA = 1

export function createGame(numPlayers = 2) {
  const deck = shuffle(createDeck())
  const wall = deck
  const players = Array.from({ length: numPlayers }, () => ({
    hand: [],
    discards: [],
    flowers: [],
    melds: []
  }))

  // Deal 13 to each: 3 rounds of 4 tiles + 1 extra
  for (let round = 0; round < 3; round++) {
    for (let p = 0; p < numPlayers; p++) {
      for (let i = 0; i < 4; i++) {
        if (wall.length) players[p].hand.push(wall.pop())
      }
    }
  }
  for (let p = 0; p < numPlayers; p++) {
    if (wall.length) players[p].hand.push(wall.pop())
  }

  const dealerIndex = 0
  // Reveal joker from BACK of wall (opposite end of draw pile - index 0)
  const jokerTile = wall.shift()

  // Mark the 3 remaining identical tiles as wild (the 4th is joker itself, revealed)
  const markWilds = (tiles, joker) => {
    if (!joker || joker.suit === SUITS.FLOWER) return
    for (const t of tiles) {
      if (t.suit === joker.suit && String(t.value) === String(joker.value)) {
        t.isWild = true
      }
    }
  }
  markWilds(wall, jokerTile)
  for (const p of players) {
    markWilds(p.hand, jokerTile)
    markWilds(p.discards, jokerTile)
  }

  return {
    wall,
    players,
    dealerIndex,
    currentPlayerIndex: dealerIndex,
    jokerTile,
    phase: 'playing',
    winner: null,
    lastDrawn: null,
    lastDiscard: null,
    numPlayers
  }
}

/** Dealer picks up 14th tile to start */
export function dealerDraw(game) {
  if (game.phase !== 'playing' || game.currentPlayerIndex !== game.dealerIndex)
    return { ok: false, message: 'Not dealer turn' }
  if (game.players[game.dealerIndex].hand.length !== 13)
    return { ok: false, message: 'Dealer already drew' }

  const tile = game.wall.pop()
  if (!tile) return { ok: false, message: 'Wall empty' }

  const player = game.players[game.dealerIndex]
  const { toFlowers, toHand } = processDrawnTile(tile, game.wall)
  toFlowers.forEach(f => player.flowers.push(f))
  const drawn = toHand || tile
  if (drawn) player.hand.push(drawn)
  game.lastDrawn = drawn

  const allTiles = [...player.hand, ...(player.melds || []).flatMap(m => m.tiles)]
  if (allTiles.length >= 11 && canWin(allTiles, game.jokerTile).canWin) {
    game.phase = 'won'
    game.winner = game.dealerIndex
  }
  // Dealer stays as current player - must discard before next player's turn

  return { ok: true }
}

/** Process flower: place aside, draw replacement from back of wall (repeat if more flowers) */
function processDrawnTile(tile, wall) {
  const toFlowers = []
  let toHand = null
  if (tile.suit === SUITS.FLOWER) {
    toFlowers.push(tile)
    while (wall.length) {
      const next = wall.shift() || wall.pop()
      if (!next) break
      if (next.suit === SUITS.FLOWER) toFlowers.push(next)
      else { toHand = next; break }
    }
  } else {
    toHand = tile
  }
  return { toFlowers, toHand }
}

/** Draw from wall (front) - normal turn */
export function draw(game) {
  if (game.phase !== 'playing') return { ok: false, message: 'Game not in play' }

  const tile = game.wall.pop()
  if (!tile) return { ok: false, message: 'Wall empty' }

  game.lastDiscard = null
  const player = game.players[game.currentPlayerIndex]
  let actual = tile
  let placed = null

  if (tile.suit === SUITS.FLOWER) {
    player.flowers.push(tile)
    actual = null
    while (game.wall.length) {
      const next = game.wall.shift() || game.wall.pop()
      if (!next) break
      if (next.suit === SUITS.FLOWER) {
        player.flowers.push(next)
      } else {
        actual = next
        player.hand.push(next)
        break
      }
    }
  } else {
    player.hand.push(tile)
  }

  game.lastDrawn = (tile.suit === SUITS.FLOWER ? actual : tile) || tile

  const allTiles = [...player.hand, ...(player.melds || []).flatMap(m => m.tiles)]
  if (allTiles.length >= 11 && canWin(allTiles, game.jokerTile).canWin) {
    game.phase = 'won'
    game.winner = game.currentPlayerIndex
  }

  return { ok: true }
}

/** Discard a tile */
export function discard(game, tileId) {
  if (game.phase !== 'playing') return { ok: false, message: 'Game not in play' }
  const player = game.players[game.currentPlayerIndex]
  const idx = player.hand.findIndex(t => t.id === tileId)
  if (idx < 0) return { ok: false, message: 'Tile not in hand' }

  const [tile] = player.hand.splice(idx, 1)
  player.discards.push(tile)
  game.lastDrawn = null
  game.lastDiscard = { tile, fromPlayerIndex: game.currentPlayerIndex }

  game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.numPlayers
  return { ok: true, tile }
}

/** Find 2 tiles in hand that match discarded (for Pung) */
function findPungPair(hand, discard, jokerTile) {
  const same = []
  let wilds = []
  for (const t of hand) {
    if (t.isWild || (jokerTile && t.suit === jokerTile.suit && String(t.value) === String(jokerTile.value)))
      wilds.push(t)
    else if (t.suit === discard.suit && String(t.value) === String(discard.value)) same.push(t)
  }
  if (same.length >= 2) return same.slice(0, 2)
  if (same.length >= 1 && wilds.length >= 1) return [same[0], wilds[0]]
  if (wilds.length >= 2) return wilds.slice(0, 2)
  return null
}

/** Find 2 tiles in hand that complete chow with discard */
function findChowPair(hand, discard, jokerTile) {
  if (discard.suit === SUITS.WIND || discard.suit === SUITS.DRAGON || discard.suit === SUITS.FLOWER) return null
  const val = discard.value
  const sameSuit = hand.filter(t => t.suit === discard.suit)
  const wilds = hand.filter(t => t.isWild || (jokerTile && t.suit === jokerTile.suit && String(t.value) === String(jokerTile.value)))

  for (const [a, b] of [[val - 2, val - 1], [val - 1, val + 1], [val + 1, val + 2]]) {
    if (a < 1 || b > 9) continue
    const haveA = sameSuit.filter(t => t.value === a)
    const haveB = sameSuit.filter(t => t.value === b)
    if (haveA.length >= 1 && haveB.length >= 1) return [haveA[0], haveB[0]]
    if (haveA.length >= 1 && wilds.length >= 1) return [haveA[0], wilds[0]]
    if (haveB.length >= 1 && wilds.length >= 1) return [haveB[0], wilds[0]]
    if (wilds.length >= 2) return [wilds[0], wilds[1]]
  }
  return null
}

export function claimPung(game, claimingPlayerIndex, fromPlayerIndex) {
  if (game.phase !== 'playing' || !game.lastDiscard) return { ok: false }
  const { tile } = game.lastDiscard
  const fromPlayer = game.players[fromPlayerIndex]
  const idx = fromPlayer.discards.findIndex(d => d.id === tile.id)
  if (idx < 0) return { ok: false }

  const claimer = game.players[claimingPlayerIndex]
  const pair = findPungPair(claimer.hand, tile, game.jokerTile)
  if (!pair) return { ok: false }

  for (const t of pair) {
    const i = claimer.hand.indexOf(t)
    if (i >= 0) claimer.hand.splice(i, 1)
  }
  fromPlayer.discards.splice(idx, 1)
  if (!claimer.melds) claimer.melds = []
  claimer.melds.push({ type: 'pung', tiles: [pair[0], pair[1], tile] })
  game.lastDiscard = null
  game.currentPlayerIndex = claimingPlayerIndex
  game.lastDrawn = tile
  const allTiles = [...claimer.hand, ...(claimer.melds || []).flatMap(m => m.tiles)]
  if (allTiles.length >= 11 && canWin(allTiles, game.jokerTile).canWin) {
    game.phase = 'won'
    game.winner = claimingPlayerIndex
  }
  return { ok: true }
}

export function claimChow(game, claimingPlayerIndex, fromPlayerIndex) {
  if (game.phase !== 'playing' || !game.lastDiscard) return { ok: false }
  const { tile } = game.lastDiscard
  const fromPlayer = game.players[fromPlayerIndex]
  const idx = fromPlayer.discards.findIndex(d => d.id === tile.id)
  if (idx < 0) return { ok: false }

  const claimer = game.players[claimingPlayerIndex]
  const pair = findChowPair(claimer.hand, tile, game.jokerTile)
  if (!pair) return { ok: false }

  for (const t of pair) {
    const i = claimer.hand.indexOf(t)
    if (i >= 0) claimer.hand.splice(i, 1)
  }
  fromPlayer.discards.splice(idx, 1)
  if (!claimer.melds) claimer.melds = []
  const chowTiles = [pair[0], pair[1], tile].sort((a, b) => (a.value ?? 0) - (b.value ?? 0))
  claimer.melds.push({ type: 'chow', tiles: chowTiles })
  game.lastDiscard = null
  game.currentPlayerIndex = claimingPlayerIndex
  game.lastDrawn = tile
  const allTiles = [...claimer.hand, ...(claimer.melds || []).flatMap(m => m.tiles)]
  if (allTiles.length >= 11 && canWin(allTiles, game.jokerTile).canWin) {
    game.phase = 'won'
    game.winner = claimingPlayerIndex
  }
  return { ok: true }
}
