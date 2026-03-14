import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import './MultiplayerLobby.css'

const SOCKET_URL = import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin

export function MultiplayerLobby({ onBack, onStartGame }) {
  const [screen, setScreen] = useState('choose')
  const [code, setCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const s = io(SOCKET_URL)
    s.on('connect', () => setConnected(true))
    s.on('disconnect', () => setConnected(false))
    setSocket(s)
    return () => s.disconnect()
  }, [])

  // Host: when second player joins, we get game-update; transition to game
  const onStartRef = useRef(onStartGame)
  onStartRef.current = onStartGame
  useEffect(() => {
    if (screen !== 'waiting' || !code || !socket) return
    let started = false
    const onUpdate = (game) => {
      const joined = game.players.filter(p => p.socketId).length
      if (joined >= 2 && !started) {
        started = true
        onStartRef.current?.({ game, code, socket })
      }
    }
    socket.on('game-update', onUpdate)
    return () => socket.off('game-update', onUpdate)
  }, [screen, code, socket])

  const handleCreate = () => {
    setError('')
    if (!socket?.connected) {
      setError('Server not connected. Start with: npm run dev (from project root)')
      return
    }
    socket.emit('create-game')
    socket.once('game-created', ({ code: c }) => {
      setCode(c)
      setScreen('waiting')
    })
  }

  const handleJoin = () => {
    setError('')
    if (!joinCode.trim()) return setError('Enter a code')
    socket.emit('join-game', joinCode.trim())
    socket.once('join-error', (msg) => setError(msg))
    socket.once('game-update', (game) => {
      onStartGame?.({ game, code: joinCode.trim(), socket })
    })
  }

  const handleStart = () => {
    socket.emit('start-game')
    socket.once('game-update', (game) => onStartGame?.({ game, code, socket }))
  }

  return (
    <div className="multiplayer-lobby">
      <button type="button" className="back-btn" onClick={onBack}>← Back</button>
      <h1>Multiplayer</h1>

      {screen === 'choose' && (
        <div className="lobby-choose">
          {!connected && (
            <p className="connection-warn">Server not connected. Multiplayer needs the backend running.</p>
          )}
          <button type="button" onClick={handleCreate} disabled={!connected}>
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

      {screen === 'waiting' ? (
        <div className="lobby-waiting">
          <p>Share this code:</p>
          <p className="game-code">{code || 'Creating…'}</p>
          <p className="hint">Waiting for players to join...</p>
          <p className="server-hint">Make sure the server is running: npm run dev</p>
        </div>
      ) : null}

      {screen === 'join' && (
        <div className="lobby-join">
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          />
          <button type="button" onClick={handleJoin}>Join</button>
          {error && <p className="error">{error}</p>}
          <p className="server-hint">Server must be running: npm run dev</p>
        </div>
      )}

      {error && screen !== 'join' && <p className="error">{error}</p>}
    </div>
  )
}
