/**
 * Mahjong scoring: Base (Fu) + Bonuses + Multipliers (Doubles/Fan)
 */
import { SUITS } from './tiles.js'

export function calculateScore(hand, jokerTile, meta = {}) {
  const { selfDraw = false, replacementWin = false, flowers = [] } = meta

  let basePoints = 20 // Going Mahjong
  const multipliers = []

  // Pungs: 2-4 base, 8 if terminal (1,9,Winds,Dragons)
  // Chows: 0
  // Pair: 2 if Dragons or own Wind
  // For simplicity we use: Pung 4, Terminal Pung 8, Chow 0, Special pair 2

  const isTerminal = (t) =>
    t.suit === SUITS.WIND || t.suit === SUITS.DRAGON ||
    (t.suit !== SUITS.FLOWER && (t.value === 1 || t.value === 9))

  // Count sets (simplified - we'd need to parse the winning hand structure)
  const counts = {}
  for (const t of hand.filter(h => h.suit !== SUITS.FLOWER)) {
    const k = `${t.suit}|${t.value}`
    counts[k] = (counts[k] || 0) + 1
  }

  let pungs = 0
  let terminalPungs = 0
  for (const c of Object.values(counts)) {
    if (c >= 3) {
      pungs++
      // Simplified: assume mixed for terminal check
    }
  }

  basePoints += pungs * 4 // Assume 4 per pung for simplicity
  basePoints += flowers.length * 2 // Flowers: 2 each
  if (selfDraw) basePoints += 2
  if (replacementWin) basePoints += 1

  // Multipliers
  const usedJokers = hand.some(t => t.isWild) ? 1 : 0
  if (usedJokers === 0 && hand.length >= 11) multipliers.push(2) // Jokerless

  let total = basePoints
  for (const m of multipliers) total *= m

  return Math.max(20, total)
}
