/**
 * 11-Tile Win Detection
 * Winning hand: 3 sets of three (Pungs or Chows) + 1 pair = 11 tiles
 * Remaining 2-3 tiles are surplus
 */

import { SUITS } from './tiles.js'

/** Check if tile is a number suit (can form Chows) */
function isNumberSuit(suit) {
  return [SUITS.DOTS, SUITS.BAMBOO, SUITS.CHARACTERS].includes(suit)
}

/** Count occurrences of each tile type in hand (keyed by suit+value, excluding flowers) */
function getTileCounts(hand, jokerTile) {
  const counts = {}
  let wildCount = 0
  for (const t of hand) {
    if (t.suit === SUITS.FLOWER) continue
    if (t.isWild) {
      wildCount++
      continue
    }
    if (jokerTile && t.suit === jokerTile.suit && String(t.value) === String(jokerTile.value)) {
      wildCount++
      continue
    }
    const key = `${t.suit}|${t.value}`
    counts[key] = (counts[key] || 0) + 1
  }
  return { counts, wildCount }
}

/** Try to form melds: 3 Pungs + 1 pair from hand using wilds */
export function canWin(hand, jokerTile) {
  const playing = hand.filter(t => t.suit !== SUITS.FLOWER)
  if (playing.length < 11) return { canWin: false }

  const { counts, wildCount } = getTileCounts(playing, jokerTile)
  const keys = Object.keys(counts)

  // Try all ways to pick 1 pair
  for (const pairKey of keys) {
    const pairCount = counts[pairKey] || 0
    const needForPair = Math.max(0, 2 - pairCount)
    if (needForPair > wildCount) continue

    let remainingWild = wildCount - needForPair
    const remain = { ...counts }
    remain[pairKey] = (remain[pairKey] || 0) - 2
    if (remain[pairKey] <= 0) delete remain[pairKey]

    // Try to form 3 melds from remaining
    if (canFormThreeMelds(remain, remainingWild, jokerTile)) {
      return { canWin: true }
    }
  }

  // Pair could be from wilds
  if (wildCount >= 2) {
    if (canFormThreeMelds({ ...counts }, wildCount - 2, jokerTile)) {
      return { canWin: true }
    }
  }

  return { canWin: false }
}

function canFormThreeMelds(counts, wildCount, jokerTile) {
  const melds = []
  const c = { ...counts }

  // Extract Pungs (3 of a kind)
  for (const key of Object.keys(c)) {
    while ((c[key] || 0) >= 3) {
      melds.push({ type: 'pung', key })
      c[key] = (c[key] || 0) - 3
    }
    if (c[key] <= 0) delete c[key]
  }

  // Use wilds for Pungs
  const keys = Object.keys(c)
  for (const key of keys) {
    const need = 3 - (c[key] || 0)
    if (need > 0 && need <= wildCount) {
      melds.push({ type: 'pung', key })
      c[key] = (c[key] || 0) - 3
      if (c[key] <= 0) delete c[key]
      wildCount -= need
    }
  }

  // Extract Chows (only for number suits)
  const chowCandidates = Object.keys(c).filter(k => {
    const [suit, val] = k.split('|')
    return isNumberSuit(suit) && val >= '1' && val <= '9'
  })

  for (const key of chowCandidates) {
    const [suit, val] = key.split('|')
    const v = parseInt(val, 10)
    const key2 = `${suit}|${v + 1}`
    const key3 = `${suit}|${v + 2}`
    const have1 = c[key] || 0
    const have2 = c[key2] || 0
    const have3 = c[key3] || 0
    if (v + 2 > 9) continue

    const need = Math.max(0, 1 - have1) + Math.max(0, 1 - have2) + Math.max(0, 1 - have3)
    if (need <= wildCount) {
      melds.push({ type: 'chow', key })
      c[key] = (c[key] || 0) - 1
      c[key2] = (c[key2] || 0) - 1
      c[key3] = (c[key3] || 0) - 1
      for (const k of [key, key2, key3]) {
        if ((c[k] || 0) <= 0) delete c[k]
      }
      wildCount -= need
    }
  }

  // Remaining can form more melds with wilds
  const totalRemain = Object.values(c).reduce((a, b) => a + b, 0) + wildCount
  return melds.length >= 3 && totalRemain <= 3
}

/**
 * Get hint: which tile is best to discard + strategy explanation.
 * Returns { tile, reason } - prefer discarding tiles that are harder to form triplets/pairs with.
 */
export function getDiscardHint(hand, jokerTile) {
  const playing = hand.filter(t => t.suit !== SUITS.FLOWER)
  if (playing.length === 0) return null

  const sorted = [...playing].sort((a, b) => {
    const s = (x) => (x.suit + String(x.value))
    return s(a).localeCompare(s(b))
  })

  let bestDiscard = sorted[0]
  let bestScore = -1

  for (const tile of sorted) {
    const without = playing.filter(t => t.id !== tile.id)
    const { canWin: stillCanWin } = canWin(without, jokerTile)
    const isLonely = isLonelyTile(tile, playing, jokerTile)
    const score = (stillCanWin ? 10 : 0) + (isLonely ? 5 : 0) + Math.random()
    if (score > bestScore) {
      bestScore = score
      bestDiscard = tile
    }
  }

  const reason = getHintReason(bestDiscard, playing, jokerTile)
  return { tile: bestDiscard, reason }
}

function getHintReason(tile, hand, jokerTile) {
  if (tile.suit === SUITS.WIND || tile.suit === SUITS.DRAGON) {
    return 'Winds and Dragons: Only 4 of each exist in the deck, making them rarer and harder to complete a triplet (Pung). Safer to discard.'
  }
  if (tile.suit === SUITS.FLOWER) return ''
  if (isLonelyTile(tile, hand, jokerTile)) {
    return 'Isolated tile: No matching pair or adjacent tiles for a Chow. Discarding it won\'t break any potential melds.'
  }
  if (tile.value === 1 || tile.value === 9) {
    return 'Terminal tile (1 or 9): Less flexible for Chows since they can only form sequences at one end (e.g. 1-2-3 or 7-8-9).'
  }
  return 'This tile has limited meld potential in your current hand. Discarding it keeps your options open.'
}

function isLonelyTile(tile, hand, jokerTile) {
  if (tile.isWild) return false
  if (jokerTile && tile.suit === jokerTile.suit && String(tile.value) === String(jokerTile.value))
    return false // joker tile has 3 wild siblings
  const matches = hand.filter(t =>
    t.id !== tile.id &&
    t.suit === tile.suit &&
    String(t.value) === String(tile.value)
  )
  // Also check for chow potential (adjacent numbers)
  if (isNumberSuit(tile.suit) && tile.value >= 2 && tile.value <= 8) {
    const hasPrev = hand.some(t => t.suit === tile.suit && t.value === tile.value - 1)
    const hasNext = hand.some(t => t.suit === tile.suit && t.value === tile.value + 1)
    if (hasPrev || hasNext) return false
  }
  return matches.length === 0
}
