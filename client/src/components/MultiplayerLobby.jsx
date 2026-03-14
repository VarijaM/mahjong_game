import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import './MultiplayerLobby.css'

// Backend URL: dev uses localhost; production uses VITE_API_URL if set (e.g. Railway)
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin)
const SOCKET_URL = API_BASE
const REQUIRED_PLAYERS = 4

export function MultiplayerLobby({ onBack, onStartGame }) {
  const [screen, setScreen] = useState('choose')
  const [code, setCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [game, setGame] = useState(null)

  useEffect(() => {
    const s = io(SOCKET_URL)
    s.on('connect', () => setConnected(true))
    s.on('disconnect', () => setConnected(false))
    setSocket(s)
    return () => s.disconnect()
  }, [])

  const onStartRef = useRef(onStartGame)
  onStartRef.current = onStartGame

  useEffect(() => {
    if (screen !== 'lobby' || !code || !socket || !game) return
    const onUpdate = (g) => {
      setGame(g)
      const joined = g.players.filter(p => p.socketId).length
      if (joined >= REQUIRED_PLAYERS) {
        onStartRef.current?.({ game: g, code, socket })
      }
    }
    socket.on('game-update', onUpdate)
    return () => socket.off('game-update', onUpdate)
  }, [screen, code, socket, game])

  const handleCreate = () => {
    setError('')
    if (!username.trim()) return setError('Enter a username')
    if (!socket?.connected) {
      setError(import.meta.env.DEV
        ? 'Server not connected. Run "npm run dev" from project root.'
        : 'Multiplayer backend not configured. Set VITE_API_URL in Vercel to your deployed server URL.')
      return
    }
    socket.emit('create-game', { username: username.trim() })
    socket.once('game-created', ({ code: c, game: g }) => {
      setCode(c)
      setGame(g)
      setScreen('lobby')
    })
  }

  const handleJoin = async () => {
    setError('')
    if (!joinCode.trim()) return setError('Enter a code')
    if (!username.trim()) return setError('Enter a username')
    if (!socket?.connected) {
      setError('Not connected to server. Wait a moment and try again.')
      return
    }
    const codeToJoin = joinCode.trim()

    // Verify server is reachable and game exists (helps debug connection issues)
    try {
      const res = await fetch(`${API_BASE}/api/games`)
      const data = await res.json()
      if (!data.active.includes(codeToJoin)) {
        setError(`Game ${codeToJoin} not found. Server has: ${data.active.length ? data.active.join(', ') : 'no games'}. Is the host still in the lobby?`)
        return
      }
    } catch (err) {
      setError(import.meta.env.DEV
        ? 'Cannot reach server. Run "npm run dev" from project root.'
        : 'Cannot reach multiplayer backend. Ensure VITE_API_URL points to your deployed server.')
      return
    }

    socket.emit('join-game', { code: codeToJoin, username: username.trim() })
    socket.once('join-error', (msg) => setError(msg))
    socket.once('game-update', (g) => {
      setGame(g)
      setCode(codeToJoin)
      setScreen('lobby')
      const joined = g.players.filter(p => p.socketId).length
      if (joined >= REQUIRED_PLAYERS) {
        onStartGame?.({ game: g, code: codeToJoin, socket })
      }
    })
  }

  const displayGame = game || { players: [] }
  const joinedCount = displayGame.players?.filter(p => p.socketId).length || 0
  const isHost = screen === 'lobby' && code && displayGame.players?.[0]?.socketId === socket?.id

  return (
    <div className="multiplayer-lobby">
      <button type="button" className="back-btn" onClick={onBack}>← Back</button>
      <h1>Multiplayer</h1>

      {screen === 'choose' && (
        <div className="lobby-choose">
          {!connected && (
            <p className="connection-warn">Server not connected. Multiplayer needs the backend running.</p>
          )}
          <div className="username-row">
            <input
              type="text"
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value.slice(0, 20))}
              maxLength={20}
            />
          </div>
          <button type="button" onClick={handleCreate} disabled={!connected || !username.trim()}>
            Create Game
          </button>
          <button type="button" onClick={() => setScreen('join')} disabled={!connected}>
            Join with Code
          </button>
          <button type="button" className="btn-alt" onClick={() => onStartGame?.({ fallback: true })}>
            Play vs Computer instead
          </button>
        </div>
      )}

      {screen === 'join' && (
        <div className="lobby-join">
          <div className="username-row">
            <input
              type="text"
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value.slice(0, 20))}
              maxLength={20}
            />
          </div>
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          />
          <button type="button" onClick={handleJoin}>Join</button>
          <button type="button" className="btn-back-inline" onClick={() => setScreen('choose')}>← Back</button>
          {error && <p className="error">{error}</p>}
          <p className="server-hint">Server must be running: npm run dev</p>
        </div>
      )}

      {screen === 'lobby' && (
        <div className="lobby-waiting">
          <p className="game-code-label">Game code: <strong>{code}</strong></p>
          <p className="lobby-hint">Share this code with friends. Game starts when 4 players join.</p>
          <div className="lobby-players">
            <h3>Players ({joinedCount}/{REQUIRED_PLAYERS})</h3>
            {[0, 1, 2, 3].map(i => {
              const p = displayGame.players?.[i]
              const name = p?.username || (p?.socketId ? `Player ${i + 1}` : '—')
              const isYou = p?.socketId === socket?.id
              return (
                <div key={i} className={`lobby-player-slot ${p?.socketId ? 'filled' : ''}`}>
                  <span className="slot-num">{i + 1}.</span>
                  <span className="slot-name">{name}{isYou ? ' (you)' : ''}</span>
                  {!p?.socketId && <span className="slot-waiting">Waiting...</span>}
                </div>
              )
            })}
          </div>
          <p className="server-hint">Make sure the server is running: npm run dev</p>
        </div>
      )}

      {error && screen === 'choose' && <p className="error">{error}</p>}
    </div>
  )
}
