import { useState } from 'react'
import { GameBoard } from './components/GameBoard'
import { MultiplayerLobby } from './components/MultiplayerLobby'
import { HowToPlay } from './components/HowToPlay'
import './App.css'

function App() {
  const [screen, setScreen] = useState('menu') // 'menu' | 'game' | 'multiplayer' | 'howto'
  const [mode, setMode] = useState(null)
  const [multiplayerData, setMultiplayerData] = useState(null) // { game, code, socket }

  return (
    <div className="app">
      {screen === 'menu' && (
        <div className="menu">
          <div className="menu-decor top">
            <span className="tile-decor">🀇🀈🀉🀊🀋🀌🀍🀎🀏</span>
            <span className="flower-decor">🀢🀣🀤🀥🀦🀧🀨🀩</span>
          </div>
          <h1>🀄 Mahjong</h1>
          <p className="menu-subtitle">11-Tile Win • Joker • Flowers</p>
          <div className="menu-buttons">
            <button type="button" onClick={() => { setMode('computer'); setScreen('game') }}>
              vs Computer
            </button>
            <button type="button" onClick={() => setScreen('multiplayer')} title="Create or join a game with a code">
              Join with Code
            </button>
            <button type="button" className="btn-howto" onClick={() => setScreen('howto')}>
              How to Play
            </button>
          </div>
          <div className="menu-rules">
            <h3>Quick Rules</h3>
            <ul>
              <li>Win with 3 sets of three (Pungs/Chows) + 1 pair = 11 tiles</li>
              <li>Joker tile (from back of wall) + 3 copies = wild cards</li>
              <li>Flowers go aside; draw replacement from back of wall</li>
              <li>Dealer draws 14th tile first, then discards to start</li>
            </ul>
          </div>
          <div className="menu-decor bottom">
            <span className="tile-decor">🀐🀑🀒🀓🀔🀕🀖🀗🀘</span>
            <span className="flower-decor">🀢🀣🀤🀥</span>
          </div>
        </div>
      )}

      {screen === 'howto' && <HowToPlay onBack={() => setScreen('menu')} />}

      {screen === 'game' && (
        <GameBoard
          mode={mode || 'computer'}
          onBack={() => { setScreen('menu'); setMultiplayerData(null) }}
          multiplayerData={multiplayerData}
        />
      )}

      {screen === 'multiplayer' && (
        <MultiplayerLobby
          onBack={() => setScreen('menu')}
          onStartGame={(data) => {
            if (data?.fallback) { setMode('computer'); setScreen('game') }
            else { setMode('multiplayer'); setMultiplayerData({ game: data.game, code: data.code, socket: data.socket }); setScreen('game') }
          }}
        />
      )}
    </div>
  )
}

export default App
