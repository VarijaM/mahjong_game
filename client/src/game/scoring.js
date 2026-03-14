/**
 * Mahjong scoring (family house rules style)
 * Based on: https://www.themahjongproject.com/how-to-play/scoring/
 *
 * Step 1: Count base score
 * Step 2: Add doubles (fans)
 * Step 3: Round up to nearest 10
 */
import { SUITS } from './tiles.js'

const MAX_PAYOUT = 500

/** Get representative tile from a meld (for value check). Uses first non-wild. */
function getMeldRepresentative(tiles, jokerTile) {
  if (!tiles || !tiles.length) return null
  for (const t of tiles) {
    if (!t.isWild && (!jokerTile || t.suit !== jokerTile.suit || String(t.value) !== String(jokerTile.value)))
      return t
  }
  return tiles[0]
}

/** Parse melds from explicit melds array, or infer from hand if concealed */
function getMeldsAndPair(melds, hand, jokerTile) {
  const playing = (hand || []).filter(t => t.suit !== SUITS.FLOWER)
  if (melds && melds.length > 0) {
    const byKey = {}
    for (const t of playing) {
      const k = `${t.suit}|${t.value}`
      if (!byKey[k]) byKey[k] = []
      byKey[k].push(t)
    }
    const pair = Object.values(byKey).find(arr => arr.length >= 2)?.slice(0, 2) || []
    return { melds, pair }
  }
  return inferMeldsFromHand(playing, jokerTile)
}

/** Infer 3 melds + 1 pair from concealed hand */
function inferMeldsFromHand(hand, jokerTile) {
  const counts = {}
  let wildCount = 0
  for (const t of hand) {
    if (t.isWild || (jokerTile && t.suit === jokerTile.suit && String(t.value) === String(jokerTile.value))) {
      wildCount++
      continue
    }
    const k = `${t.suit}|${t.value}`
    counts[k] = (counts[k] || 0) + 1
  }

  const melds = []
  const used = { ...counts }
  let w = wildCount

  for (const key of Object.keys(used)) {
    while ((used[key] || 0) >= 3) {
      const [suit, val] = key.split('|')
      melds.push({ type: 'pung', tiles: [{ suit, value: parseInt(val, 10) }] })
      used[key] = (used[key] || 0) - 3
    }
    if ((used[key] || 0) <= 0) delete used[key]
  }

  for (const key of Object.keys(used)) {
    const need = 3 - (used[key] || 0)
    if (need > 0 && need <= w) {
      const [suit, val] = key.split('|')
      melds.push({ type: 'pung', tiles: [{ suit, value: parseInt(val, 10) }] })
      used[key] = (used[key] || 0) - 3
      w -= need
    }
  }

  const numSuits = [SUITS.DOTS, SUITS.BAMBOO, SUITS.CHARACTERS]
  for (const suit of numSuits) {
    for (let v = 1; v <= 7; v++) {
      const k1 = `${suit}|${v}`
      const k2 = `${suit}|${v + 1}`
      const k3 = `${suit}|${v + 2}`
      const h1 = used[k1] || 0
      const h2 = used[k2] || 0
      const h3 = used[k3] || 0
      const need = Math.max(0, 1 - h1) + Math.max(0, 1 - h2) + Math.max(0, 1 - h3)
      if (need <= w) {
        melds.push({ type: 'chow', tiles: [{ suit, value: v }, { suit, value: v + 1 }, { suit, value: v + 2 }] })
        used[k1] = (used[k1] || 0) - 1
        used[k2] = (used[k2] || 0) - 1
        used[k3] = (used[k3] || 0) - 1
        for (const k of [k1, k2, k3]) { if ((used[k] || 0) <= 0) delete used[k] }
        w -= need
      }
    }
  }

  const pairKeys = Object.keys(used).filter(k => (used[k] || 0) >= 2)
  const pair = pairKeys.length ? [{ suit: pairKeys[0].split('|')[0], value: parseInt(pairKeys[0].split('|')[1], 10) }] : []

  return { melds, pair }
}

/**
 * Calculate winner's score.
 * @param {Object} params
 * @param {Array} params.melds - Laid-down melds { type, tiles }
 * @param {Array} params.hand - Tiles in hand (includes pair)
 * @param {Array} params.flowers - Flower tiles
 * @param {Object} params.jokerTile - Joker tile
 * @param {boolean} params.selfDraw - Winner drew the winning tile from wall
 * @param {boolean} params.concealed - No melds laid down before winning
 * @param {boolean} params.drewFromBack - Winning tile from back of wall (optional)
 * @returns {{ baseScore: number, fans: number, roundedScore: number, breakdown: string[] }}
 */
export function calculateScore({ melds = [], hand = [], flowers = [], jokerTile, selfDraw = false, concealed = false, drewFromBack = false }) {
  const breakdown = []
  let baseScore = 0

  const { melds: resolvedMelds, pair } = getMeldsAndPair(melds, hand, jokerTile)

  if (resolvedMelds.length === 0) {
    return { baseScore: 0, fans: 0, roundedScore: 0, breakdown: ['No sets'] }
  }

  baseScore += 30
  breakdown.push('Win: +30')

  let setPoints = 0
  let valueSetCount = 0
  let allRuns = true
  let allSets = true
  let suits = new Set()

  for (const m of resolvedMelds) {
    const rep = (m.tiles && m.tiles[0]) ? m.tiles[0] : getMeldRepresentative(m.tiles, jokerTile)
    if (!rep) continue
    const val = typeof rep.value === 'number' ? rep.value : parseInt(String(rep.value).replace(/\D/g, ''), 10)
    const isValue = rep.suit === SUITS.DRAGON || rep.suit === SUITS.WIND || (rep.suit !== SUITS.FLOWER && (val === 1 || val === 9))

    if (m.type === 'pung') {
      allRuns = false
      setPoints += isValue ? 8 : 4
      if (isValue) valueSetCount++
    } else {
      allSets = false
      setPoints += 0
      if (rep.suit && rep.suit !== SUITS.FLOWER) suits.add(rep.suit)
    }
    if (rep.suit && rep.suit !== SUITS.FLOWER) suits.add(rep.suit)
  }

  baseScore += setPoints
  breakdown.push(`Sets: +${setPoints}`)

  const pairTile = Array.isArray(pair) ? pair[0] : pair
  const valuePair = pairTile && (pairTile.suit === SUITS.DRAGON || pairTile.suit === SUITS.WIND)
  if (valuePair) {
    baseScore += 2
    breakdown.push('Value pair: +2')
  }

  if (selfDraw) {
    baseScore += 2
    breakdown.push('Self-draw (gee maw): +2')
  }

  let fans = 0
  if (valueSetCount > 0) {
    fans += valueSetCount
    breakdown.push(`Value sets: ${valueSetCount} fan(s)`)
  }
  if (allRuns && resolvedMelds.length >= 3) {
    fans += 1
    breakdown.push('All runs: +1 fan')
  }
  if (allSets && resolvedMelds.length >= 3) {
    fans += 1
    breakdown.push('All sets: +1 fan')
  }
  if (suits.size === 1 && valueSetCount > 0) {
    fans += 1
    breakdown.push('One suit + value: +1 fan')
  }
  if (concealed) {
    fans += 1
    breakdown.push('All concealed: +1 fan')
  }
  if (selfDraw) {
    fans += 1
    breakdown.push('Self-draw: +1 fan')
  }
  if (drewFromBack) {
    fans += 1
    breakdown.push('Draw from back: +1 fan')
  }

  let total = baseScore
  for (let i = 0; i < fans; i++) total *= 2

  const roundedScore = Math.min(MAX_PAYOUT, Math.ceil(total / 10) * 10)
  breakdown.push(`Base: ${baseScore} × 2^${fans} = ${total} → ${roundedScore}`)

  return { baseScore, fans, total, roundedScore, breakdown }
}

/**
 * Calculate payout from loser to winner.
 * @param {number} roundedScore - Winner's rounded score
 * @param {Object} options
 * @param {boolean} options.loserDiscarded - Loser discarded the winning tile
 * @param {boolean} options.selfDraw - Winner drew from wall
 * @param {boolean} options.loserIsBanker - Loser was the dealer
 */
export function calculatePayout(roundedScore, { loserDiscarded = false, selfDraw = false, loserIsBanker = false }) {
  let mult = 1
  if (loserDiscarded) mult *= 2
  if (selfDraw) mult *= 2
  if (loserIsBanker) mult *= 2
  return Math.min(MAX_PAYOUT, roundedScore * mult)
}
