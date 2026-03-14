/**
 * Pung / Chow claiming from discards
 */
import { SUITS } from './tiles.js'

function isNumberSuit(suit) {
  return [SUITS.DOTS, SUITS.BAMBOO, SUITS.CHARACTERS].includes(suit)
}

function matchesTile(a, b, jokerTile) {
  if (!a || !b) return false
  if (a.isWild || b.isWild) return true
  if (jokerTile && a.suit === jokerTile.suit && String(a.value) === String(jokerTile.value)) return true
  if (jokerTile && b.suit === jokerTile.suit && String(b.value) === String(jokerTile.value)) return true
  return a.suit === b.suit && String(a.value) === String(b.value)
}

/** Can player Pung (claim 3 of a kind) this discarded tile? */
export function canPung(hand, discardedTile, jokerTile) {
  const playing = hand.filter(t => t.suit !== SUITS.FLOWER)
  let matches = 0
  let wilds = 0
  for (const t of playing) {
    if (t.isWild || (jokerTile && t.suit === jokerTile.suit && String(t.value) === String(jokerTile.value)))
      wilds++
    else if (matchesTile(t, discardedTile, jokerTile)) matches++
  }
  return matches >= 2 || (matches >= 1 && wilds >= 1) || wilds >= 2
}

/** Can player Chow (claim run) this discarded tile? Need 2 tiles to complete sequence.
 * In 4-player, Chow can only be claimed from the player to your left (who discarded before you). */
export function canChow(hand, discardedTile, jokerTile, { fromPlayerIndex, claimingPlayerIndex, numPlayers } = {}) {
  if (!isNumberSuit(discardedTile.suit)) return false
  if (numPlayers === 4 && fromPlayerIndex != null && claimingPlayerIndex != null) {
    const leftOfClaimer = (claimingPlayerIndex + numPlayers - 1) % numPlayers
    if (fromPlayerIndex !== leftOfClaimer) return false
  }
  const val = discardedTile.value
  if (typeof val !== 'number') return false

  const sameSuit = hand.filter(t => t.suit === discardedTile.suit && t.suit !== SUITS.FLOWER)
  const wildCount = hand.filter(t =>
    t.isWild || (jokerTile && t.suit === jokerTile.suit && String(t.value) === String(jokerTile.value))
  ).length

  // Discard completes one of: (v-2,v-1,v), (v-1,v,v+1), (v,v+1,v+2)
  const seqs = [[val - 2, val - 1], [val - 1, val + 1], [val + 1, val + 2]]
  for (const [a, b] of seqs) {
    if (a < 1 || b > 9) continue
    const haveA = sameSuit.filter(t => t.value === a).length
    const haveB = sameSuit.filter(t => t.value === b).length
    const need = 2 - Math.min(haveA, 1) - Math.min(haveB, 1)
    if (need <= wildCount) return true
  }
  return false
}
