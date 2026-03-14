import { useState, useCallback, useEffect, useRef } from 'react'
import { Tile } from './Tile'
import { createGame, dealerDraw, draw, discard, claimPung, claimChow } from '../game/gameEngine'
import { getDiscardHint, canWin } from '../game/winDetection'
import { canPung, canChow } from '../game/claiming'
import { aiTakeTurn, aiTryClaim } from '../game/ai'
import { getTileLabel } from '../game/tiles'
import { calculateScore } from '../game/scoring'
import './GameBoard.css'

export function GameBoard({ mode = 'computer', onBack, multiplayerData }) {
  const isMultiplayer = mode === 'multiplayer' && multiplayerData?.game && multiplayerData?.socket
  const [game, setGame] = useState(() => (multiplayerData?.game && multiplayerData?.socket ? multiplayerData.game : createGame(2)))
  const [selectedTileId, setSelectedTileId] = useState(null)
  const [hintTileId, setHintTileId] = useState(null)
  const [isDealerStart, setIsDealerStart] = useState(true)
  const [message, setMessage] = useState('Dealer draws first tile.')
  const [scores, setScores] = useState({ human: 0, ai: 0 })
  const [roundNumber, setRoundNumber] = useState(1)
  const gameRef = useRef(game)
  gameRef.current = game

  // Multiplayer: sync game state from server
  useEffect(() => {
    if (!isMultiplayer || !multiplayerData?.socket) return
    const onUpdate = (g) => {
      setGame(g)
      const myIdx = g.players.findIndex(p => p.socketId === multiplayerData.socket.id)
      if (myIdx < 0) return
      const isMyTurn = g.currentPlayerIndex === myIdx
      if (g.phase === 'won') setMessage('')
      else if (isMyTurn && g.players[myIdx].hand.length + (g.players[myIdx].melds?.flatMap(m => m.tiles).length || 0) === 14)
        setMessage('Click a tile below, then click "Discard Selected"')
      else if (isMyTurn) setMessage('Draw a tile or claim the last discard.')
      else setMessage('Waiting for opponent...')
    }
    multiplayerData.socket.on('game-update', onUpdate)
    return () => multiplayerData.socket.off('game-update', onUpdate)
  }, [isMultiplayer, multiplayerData?.socket])

  const humanIndex = isMultiplayer && game.players?.length
    ? Math.max(0, game.players.findIndex(p => p.socketId === multiplayerData?.socket?.id))
    : 0
  const isHumanTurn = game.currentPlayerIndex === humanIndex
  const humanPlayer = game.players[humanIndex]
  const opponentIndex = humanIndex === 0 ? 1 : 0
  const opponentPlayer = game.players[opponentIndex]

  const sortHand = (hand) => {
    const order = { flower: 0, dots: 1, bamboo: 2, characters: 3, wind: 4, dragon: 5 }
    const num = (t) => (typeof t.value === 'number' ? t.value : parseInt(String(t.value).replace(/\D/g, '') || '0', 10))
    return [...hand].sort((a, b) => {
      const sa = (order[a.suit] ?? 6) * 100 + num(a)
      const sb = (order[b.suit] ?? 6) * 100 + num(b)
      return sa - sb
    })
  }

  const cloneGame = (g) => ({
    ...g,
    players: g.players.map((p) => ({
      ...p,
      hand: [...p.hand],
      discards: [...p.discards],
      flowers: [...(p.flowers || [])],
      melds: (p.melds || []).map(m => ({ ...m, tiles: [...m.tiles] }))
    })),
    wall: [...g.wall]
  })

  const handleDealerDraw = useCallback(() => {
    const g = gameRef.current
    if (g.phase !== 'playing' || g.currentPlayerIndex !== humanIndex) return
    const dealer = g.players[humanIndex]
    if (dealer.hand.length !== 13) return
    if (isMultiplayer) {
      multiplayerData.socket.emit('dealer-draw')
      setMessage('Waiting...')
      return
    }
    const gameCopy = cloneGame(g)
    const result = dealerDraw(gameCopy)
    if (result.ok) {
      setGame(gameCopy)
      setMessage(gameCopy.phase === 'won' ? '' : 'Click a tile below, then click "Discard Selected"')
    }
  }, [isMultiplayer, humanIndex, multiplayerData?.socket])

  const handleDraw = useCallback(() => {
    const g = gameRef.current
    if (g.phase !== 'playing' || g.currentPlayerIndex !== humanIndex || g.lastDrawn) return
    const p = g.players[humanIndex]
    const meldCount = p.melds?.flatMap(m => m.tiles).length || 0
    const totalTiles = p.hand.length + meldCount
    if (totalTiles !== 13 || g.wall.length === 0) return
    if (isMultiplayer) {
      multiplayerData.socket.emit('draw')
      setMessage('Waiting...')
      return
    }
    const gameCopy = cloneGame(g)
    const result = draw(gameCopy)
    if (!result.ok) return
    setGame(gameCopy)
    setMessage('Click a tile below, then click "Discard Selected"')
  }, [isMultiplayer, humanIndex, multiplayerData?.socket])

  const handleDiscard = useCallback((tile) => {
    const g = gameRef.current
    if (g.currentPlayerIndex !== humanIndex || !g.lastDrawn) return
    if (isMultiplayer) {
      multiplayerData.socket.emit('discard', tile.id)
      setSelectedTileId(null)
      setHintTileId(null)
      setIsDealerStart(false)
      setMessage('Waiting for opponent...')
      return
    }
    const gameCopy = cloneGame(g)
    const result = discard(gameCopy, tile.id)
    if (result.ok) {
      setGame(gameCopy)
      setSelectedTileId(null)
      setHintTileId(null)
      setIsDealerStart(false)
      if (gameCopy.phase !== 'won') {
        setMessage('AI thinking...')
        setTimeout(() => runAITurn(gameCopy), 800)
      }
    }
  }, [isMultiplayer, humanIndex, multiplayerData?.socket])

  const runAITurn = useCallback((gameState) => {
    const g = gameState ?? gameRef.current
    const gameCopy = cloneGame(g)
    if (gameCopy.phase === 'won') return

    const ai = gameCopy.players[1]
    const aiTotalTiles = ai.hand.length + (ai.melds?.flatMap(m => m.tiles).length || 0)

    const claimed = aiTryClaim(gameCopy)
    if (claimed) {
      setGame(cloneGame(gameCopy))
      if (gameCopy.phase === 'won') return
      setMessage('AI claimed! AI discards...')
      const toDiscardId = aiTakeTurn(gameCopy)
      if (toDiscardId) discard(gameCopy, toDiscardId)
      setGame(cloneGame(gameCopy))
      setMessage('Your turn: draw a tile.')
      return
    }

    if (aiTotalTiles === 13) {
      const drawResult = draw(gameCopy)
      if (drawResult.ok) {
        if (gameCopy.phase === 'won') {
          setGame(cloneGame(gameCopy))
          return
        }
      }
    }

    const toDiscardId = aiTakeTurn(gameCopy)
    if (toDiscardId) discard(gameCopy, toDiscardId)
    setGame(cloneGame(gameCopy))
    setMessage('Your turn: draw a tile.')
  }, [])

  const handleClaimPung = useCallback(() => {
    if (!game.lastDiscard) return
    if (isMultiplayer) {
      multiplayerData.socket.emit('claim-pung')
      setMessage('Waiting...')
      return
    }
    const gameCopy = cloneGame(game)
    const result = claimPung(gameCopy, humanIndex, game.lastDiscard.fromPlayerIndex)
    if (result.ok) {
      setGame(gameCopy)
      setMessage('Click a tile to discard.')
    }
  }, [game, isMultiplayer, humanIndex, multiplayerData?.socket])

  const handleClaimChow = useCallback(() => {
    if (!game.lastDiscard) return
    if (isMultiplayer) {
      multiplayerData.socket.emit('claim-chow')
      setMessage('Waiting...')
      return
    }
    const gameCopy = cloneGame(game)
    const result = claimChow(gameCopy, humanIndex, game.lastDiscard.fromPlayerIndex)
    if (result.ok) {
      setGame(gameCopy)
      setMessage('Click a tile to discard.')
    }
  }, [game, isMultiplayer, humanIndex, multiplayerData?.socket])

  const handleHint = useCallback(() => {
    const hand = humanPlayer.hand
    const hint = getDiscardHint(hand, game.jokerTile)
    if (!hint) {
      setHintTileId(null)
      setMessage('No hint available.')
      return
    }
    setHintTileId(hint.tile?.id ?? null)
    const label = getTileLabel(hint.tile)
    setMessage(hint.reason ? `Hint: Discard ${label}. ${hint.reason}` : `Hint: consider discarding ${label}`)
  }, [humanPlayer.hand, game.jokerTile])

  const handleNextRound = useCallback(() => {
    const winner = game.winner
    if (winner === 0) {
      const allTiles = [...(humanPlayer.hand || []), ...(humanPlayer.melds?.flatMap(m => m.tiles) || [])]
      const score = calculateScore(allTiles, game.jokerTile, { selfDraw: !!game.lastDrawn, flowers: humanPlayer.flowers || [] })
      setScores(prev => ({ ...prev, human: prev.human + score }))
    } else if (winner === 1) {
      setScores(prev => ({ ...prev, ai: prev.ai + 50 }))
    }
    setRoundNumber(prev => prev + 1)
    setGame(createGame(2))
    setSelectedTileId(null)
    setHintTileId(null)
    setIsDealerStart(true)
    setMessage('Dealer draws first tile.')
  }, [game])

  const handleResetGame = useCallback(() => {
    setScores({ human: 0, ai: 0 })
    setRoundNumber(1)
    setGame(createGame(2))
    setSelectedTileId(null)
    setHintTileId(null)
    setIsDealerStart(true)
    setMessage('Dealer draws first tile.')
  }, [])

  const humanCanPung = game.lastDiscard && canPung(humanPlayer.hand, game.lastDiscard.tile, game.jokerTile)
  const humanCanChow = game.lastDiscard && canChow(humanPlayer.hand, game.lastDiscard.tile, game.jokerTile)
  const meldTiles = humanPlayer.melds?.flatMap(m => m.tiles).length || 0
  const totalTiles = humanPlayer.hand.length + meldTiles
  const showDrawButton = !isDealerStart && isHumanTurn && !game.lastDrawn && totalTiles === 13 && game.wall.length > 0


  if (game.phase === 'won') {
    const isHumanWinner = game.winner === humanIndex
    const winningHand = isHumanWinner ? humanPlayer : opponentPlayer
    const allWinningTiles = [
      ...(winningHand.melds || []).flatMap(m =>
        m.type === 'chow' ? [...m.tiles].sort((a, b) => (a.value ?? 0) - (b.value ?? 0)) : m.tiles
      ),
      ...sortHand(winningHand.hand)
    ]
    return (
      <div className="game-board">
        <div className="win-overlay">
          <h2>{isHumanWinner ? '🎉 You Win!' : 'Opponent Wins!'}</h2>
          <p>{isHumanWinner ? 'Mahjong!' : 'Better luck next round.'}</p>
          <div className="winning-hand-reveal">
            <h4>{isHumanWinner ? 'Your winning hand:' : "Opponent's hand:"}</h4>
            <div className="tile-row">
              {allWinningTiles.map(t => (
                <Tile key={t.id} tile={t} />
              ))}
            </div>
          </div>
          <div className="win-actions">
            {!isMultiplayer && (
              <>
                <button type="button" onClick={handleNextRound}>Next Round (Keep Points)</button>
                <button type="button" onClick={handleResetGame}>Reset Game</button>
              </>
            )}
            <button type="button" onClick={onBack}>Back to Menu</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="game-board">
      <header className="game-header">
        <button type="button" onClick={onBack}>← Menu</button>
        <span className="joker-info">Joker: {game.jokerTile ? getTileLabel(game.jokerTile) : '—'}</span>
        <button
          type="button"
          className="wall-count-btn"
          onClick={showDrawButton ? handleDraw : undefined}
          title={showDrawButton ? 'Click to draw a tile' : undefined}
          disabled={!showDrawButton}
        >
          Wall: {game.wall.length}
        </button>
      </header>

      <div className="points-tracker">
        <h4>Points</h4>
        <p>You: {scores.human} | {isMultiplayer ? 'Opponent' : 'AI'}: {scores.ai}</p>
        <p className="round">Round {roundNumber}</p>
        <details className="scoring-help">
          <summary>How points work</summary>
          <ul>
            <li>Mahjong: 20 base</li>
            <li>Pungs: +4 (terminals +8)</li>
            <li>Flowers: +2 each</li>
            <li>Self-draw: +2</li>
            <li>Jokerless win: ×2</li>
          </ul>
        </details>
      </div>

      <p className="game-message">{message}</p>

      <section className="opponent-section">
        <h3>{isMultiplayer ? 'Opponent' : 'AI'} ({opponentPlayer.hand.length + (opponentPlayer.melds?.flatMap(m => m.tiles).length || 0)} tiles)</h3>
        <div className="tile-row">
          {opponentPlayer.hand.map((_, i) => (
            <div key={`ai-${i}`} className="tile tile-back" />
          ))}
        </div>
      </section>

      <section className="discards-section">
        <h3>Discards</h3>
        <div className="discards-human">
          {humanPlayer.discards.map(t => (
            <Tile key={t.id} tile={t} />
          ))}
        </div>
        <div className="discards-ai">
          {opponentPlayer.discards.map(t => (
            <Tile key={t.id} tile={t} />
          ))}
        </div>
        {game.lastDiscard && isHumanTurn && (
          <div className="last-discard-claims">
            <span className="claim-label">Claim last discard:</span>
            {humanCanPung && (
              <button type="button" className="btn-claim" onClick={handleClaimPung}>Pung!</button>
            )}
            {humanCanChow && (
              <button type="button" className="btn-claim" onClick={handleClaimChow}>Chow!</button>
            )}
            <button type="button" className="btn-draw-alt" onClick={handleDraw}>
              Draw from wall instead
            </button>
          </div>
        )}
      </section>

      <section className="hand-section">
        <h3>Your hand ({humanPlayer.hand.length} tiles)</h3>
        {humanPlayer.flowers?.length > 0 && (
          <div className="flowers">
            {humanPlayer.flowers.map(t => (
              <Tile key={t.id} tile={t} />
            ))}
          </div>
        )}
        {humanPlayer.melds?.length > 0 && (
          <div className="melds">
            {humanPlayer.melds.map((m, i) => {
              const sortedTiles = m.type === 'chow'
                ? [...m.tiles].sort((a, b) => (a.value ?? 0) - (b.value ?? 0))
                : m.tiles
              return (
              <div key={i} className="meld">
                {sortedTiles.map(t => (
                  <Tile key={t.id} tile={t} />
                ))}
              </div>
              )
            })}
          </div>
        )}
        <div className="tile-row">
          {sortHand(humanPlayer.hand).map(t => (
            <Tile
              key={t.id}
              tile={t}
              selected={selectedTileId === t.id}
              hinted={hintTileId === t.id}
              onClick={(tile) => {
                if (game.lastDrawn && isHumanTurn) setSelectedTileId(tile.id)
                else if (!game.lastDrawn && isHumanTurn && totalTiles === 13)
                  setMessage('Draw a tile first.')
                else if (isHumanTurn && (totalTiles === 14 || (game.lastDrawn && totalTiles >= 13)))
                  setSelectedTileId(tile.id)
              }}
            />
          ))}
        </div>
      </section>

      <section className="actions">
        {isDealerStart && humanIndex === game.dealerIndex && humanPlayer.hand.length === 13 && (
          <button type="button" className="btn-primary" onClick={handleDealerDraw}>
            Dealer: Draw 14th Tile
          </button>
        )}

        {showDrawButton && (
          <button
            type="button"
            className="btn-primary"
            onClick={handleDraw}
            title="Click to draw a tile from the wall"
          >
            Draw Tile
          </button>
        )}

        {isHumanTurn && game.lastDrawn && (
          <>
            <span className="action-hint">
              {selectedTileId ? 'Click below to discard' : 'Select a tile first →'}
            </span>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                const tile = humanPlayer.hand.find(t => t.id === selectedTileId)
                if (tile) handleDiscard(tile)
              }}
              disabled={!selectedTileId}
            >
              Discard Selected
            </button>
            <button type="button" className="btn-hint" onClick={handleHint}>💡 Hint</button>
          </>
        )}
      </section>
    </div>
  )
}
