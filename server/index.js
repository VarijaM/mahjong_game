/**
 * Mahjong Multiplayer Server
 * Join codes, real-time sync via Socket.io
 */

import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { createGame, dealerDraw, draw, discard, claimPung, claimChow } from '../client/src/game/gameEngine.js'

const app = express()
const games = new Map() // code -> game state

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  next()
})

// Debug endpoint: verify server is reachable and list active game codes
app.get('/api/games', (req, res) => {
  res.json({ active: Array.from(games.keys()) })
})

app.get('/', (req, res) => {
  res.send('Mahjong server running')
})

const http = createServer(app)
const io = new Server(http, { cors: { origin: '*' } })

function generateCode() {
  let code = ''
  for (let i = 0; i < 6; i++) code += Math.floor(Math.random() * 10)
  return code
}

io.on('connection', (socket) => {
  socket.on('create-game', (payload = {}) => {
    const username = (payload && payload.username) || 'Host'
    let code = generateCode()
    while (games.has(code)) code = generateCode()
    const game = createGame(4)
    game.code = code
    game.players[0].socketId = socket.id
    game.players[0].username = username
    games.set(code, game)
    socket.join(`game-${code}`)
    console.log(`[Mahjong] Game created: ${code} (${games.size} active)`)
    socket.emit('game-created', { code, game })
  })

  socket.on('join-game', (payload) => {
    const code = (payload && (typeof payload === 'object' ? payload.code : payload)) ?? ''
    const username = (payload && typeof payload === 'object' && payload.username) || 'Player'
    const codeStr = String(code).trim()
    const game = games.get(codeStr)
    if (!game) {
      console.log(`[Mahjong] Join failed: code "${codeStr}" not found. Active codes: ${[...games.keys()].join(', ') || 'none'}`)
      return socket.emit('join-error', 'Invalid code')
    }
    const emptySlot = game.players.findIndex(p => !p.socketId)
    if (emptySlot < 0) return socket.emit('join-error', 'Game full')
    game.players[emptySlot].socketId = socket.id
    game.players[emptySlot].username = username || `Player ${emptySlot + 1}`
    socket.join(`game-${codeStr}`)
    console.log(`[Mahjong] Player joined: ${username} -> game ${codeStr}`)
    io.to(`game-${codeStr}`).emit('game-update', game)
  })

  socket.on('dealer-draw', () => {
    const g = [...games.entries()].find(([, game]) =>
      game.players.some(p => p.socketId === socket.id)
    )
    if (!g) return
    const [code, game] = g
    const idx = game.players.findIndex(p => p.socketId === socket.id)
    if (idx !== game.currentPlayerIndex || game.currentPlayerIndex !== game.dealerIndex) return
    dealerDraw(game)
    io.to(`game-${code}`).emit('game-update', game)
  })

  socket.on('draw', () => {
    const g = [...games.entries()].find(([, game]) =>
      game.players.some(p => p.socketId === socket.id)
    )
    if (!g) return
    const [code, game] = g
    const idx = game.players.findIndex(p => p.socketId === socket.id)
    if (idx !== game.currentPlayerIndex) return
    draw(game)
    io.to(`game-${code}`).emit('game-update', game)
  })

  socket.on('discard', (tileId) => {
    const g = [...games.entries()].find(([, game]) =>
      game.players.some(p => p.socketId === socket.id)
    )
    if (!g) return
    const [code, game] = g
    const idx = game.players.findIndex(p => p.socketId === socket.id)
    if (idx !== game.currentPlayerIndex) return
    discard(game, tileId)
    io.to(`game-${code}`).emit('game-update', game)
  })

  socket.on('claim-pung', () => {
    const g = [...games.entries()].find(([, game]) =>
      game.players.some(p => p.socketId === socket.id)
    )
    if (!g) return
    const [code, game] = g
    const idx = game.players.findIndex(p => p.socketId === socket.id)
    if (!game.lastDiscard) return
    const result = claimPung(game, idx, game.lastDiscard.fromPlayerIndex)
    if (result.ok) io.to(`game-${code}`).emit('game-update', game)
  })

  socket.on('claim-chow', () => {
    const g = [...games.entries()].find(([, game]) =>
      game.players.some(p => p.socketId === socket.id)
    )
    if (!g) return
    const [code, game] = g
    const idx = game.players.findIndex(p => p.socketId === socket.id)
    if (!game.lastDiscard) return
    const result = claimChow(game, idx, game.lastDiscard.fromPlayerIndex)
    if (result.ok) io.to(`game-${code}`).emit('game-update', game)
  })
})

const PORT = process.env.PORT || 3001
http.listen(PORT, () => {
  console.log(`Mahjong server on http://localhost:${PORT}`)
})
