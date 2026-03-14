import { useState } from 'react'
import { TileGlossary } from './TileGlossary'
import { TermsGlossary } from './TermsGlossary'
import { MahjongQuiz } from './MahjongQuiz'
import './HowToPlay.css'

export function HowToPlay({ onBack }) {
  const [section, setSection] = useState('overview') // overview | tiles | terms | quiz

  return (
    <div className="how-to-play">
      <header className="htp-header">
        <button type="button" className="btn-back" onClick={onBack}>← Back</button>
        <h1>How to Play</h1>
      </header>
      <nav className="htp-nav">
        <button type="button" className={section === 'overview' ? 'active' : ''} onClick={() => setSection('overview')}>Overview</button>
        <button type="button" className={section === 'tiles' ? 'active' : ''} onClick={() => setSection('tiles')}>Tile Glossary</button>
        <button type="button" className={section === 'terms' ? 'active' : ''} onClick={() => setSection('terms')}>Terms</button>
        <button type="button" className={section === 'quiz' ? 'active' : ''} onClick={() => setSection('quiz')}>Practice Quiz</button>
      </nav>
      <main className="htp-content">
        {section === 'overview' && (
          <div className="htp-overview">
            <h2>Goal</h2>
            <p>Win by forming 11 tiles: <strong>3 melds</strong> (Pungs or Chows) + <strong>1 pair</strong>.</p>
            <h2>Flow</h2>
            <ul>
              <li>Each player gets 13 tiles. Dealer draws a 14th tile first.</li>
              <li>One tile is revealed from the back of the wall → that tile + its 3 copies become <strong>wild cards</strong>.</li>
              <li>Flowers go aside; draw a replacement from the back of the wall.</li>
              <li>On your turn: draw from the wall or claim a discard (Pung/Chow), then discard one tile.</li>
            </ul>
            <h2>Next</h2>
            <p>Check the <strong>Tile Glossary</strong> to see all tiles, and <strong>Terms</strong> for Pung, Chow, and more. Try the <strong>Practice Quiz</strong> before playing!</p>
          </div>
        )}
        {section === 'tiles' && <TileGlossary />}
        {section === 'terms' && <TermsGlossary />}
        {section === 'quiz' && <MahjongQuiz />}
      </main>
    </div>
  )
}
