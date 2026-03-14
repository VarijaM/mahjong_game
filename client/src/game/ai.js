/**
 * Simple Mahjong AI
 * Draws, discards, optionally claims
 */

import { canWin, getDiscardHint } from './winDetection.js'
import { canPung, canChow } from './claiming.js'
import { claimPung, claimChow } from './gameEngine.js'

export function aiChooseDiscard(hand, jokerTile) {
  const hint = getDiscardHint(hand, jokerTile)
  return (hint?.tile) || hand[0]
}

export function aiTakeTurn(game) {
  const player = game.players[game.currentPlayerIndex]
  const toDiscard = aiChooseDiscard(player.hand, game.jokerTile)
  return toDiscard?.id
}

/** Try to claim before drawing - returns true if claimed. Handles any AI player index. */
export function aiTryClaim(game) {
  if (!game.lastDiscard) return false
  const aiIndex = game.currentPlayerIndex
  const { tile, fromPlayerIndex } = game.lastDiscard
  const aiHand = game.players[aiIndex].hand
  const numPlayers = game.numPlayers || 4

  if (canPung(aiHand, tile, game.jokerTile)) {
    return claimPung(game, aiIndex, fromPlayerIndex).ok
  }
  if (canChow(aiHand, tile, game.jokerTile, { fromPlayerIndex, claimingPlayerIndex: aiIndex, numPlayers })) {
    return claimChow(game, aiIndex, fromPlayerIndex).ok
  }
  return false
}
