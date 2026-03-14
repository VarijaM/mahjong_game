import { useState } from 'react'
import { TileGlossary } from './TileGlossary'
import { TermsGlossary } from './TermsGlossary'
import { MahjongQuiz } from './MahjongQuiz'
import { ScoringSection } from './ScoringSection'
import { WinningHandExample } from './WinningHandExample'
import { FlowCarousel } from './FlowCarousel'
import './HowToPlay.css'

export function HowToPlay({ onBack }) {
  const [section, setSection] = useState('overview') // overview | tiles | terms | scoring | quiz

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
        <button type="button" className={section === 'scoring' ? 'active' : ''} onClick={() => setSection('scoring')}>Scoring</button>
        <button type="button" className={section === 'quiz' ? 'active' : ''} onClick={() => setSection('quiz')}>Practice Quiz</button>
      </nav>
      <main className="htp-content">
        {section === 'overview' && (
          <div className="htp-overview">
            <h2>Goal</h2>
            <p>Win by forming 11 tiles: <strong>3 melds</strong> (Pungs or Chows) + <strong>1 pair</strong>.</p>
            <WinningHandExample />

            <h2>Flow</h2>
            <ul>
              <li>Each player gets 13 tiles. Dealer draws a 14th tile first.</li>
              <li>One tile is revealed from the back of the wall → that tile + its 3 copies become <strong>wild cards</strong>.</li>
              <li>Flowers go aside; draw a replacement from the back of the wall.</li>
              <li>On your turn: draw from the wall or claim a discard (Pung/Chow), then discard one tile.</li>
            </ul>
            <FlowCarousel />

            <h2>History</h2>
            <p>Mahjong originated in <strong>19th-century China</strong>, evolving from Ming Dynasty card games (Ma Diao) into its modern tile form around the 1870s–1880s. It likely emerged in provinces along the Yangtze River.</p>
            <p>The game spread globally in the early 20th century—reaching Japan and Korea in the 1920s, and the United States when Joseph Babcock brought it over in 1920. It quickly became popular in New York and across Western countries.</p>
            <p>Today, mahjong is one of the world&apos;s most played games. Estimates suggest <strong>~345 million players in Asia alone</strong>, with a global player base many times larger than poker. American-style mah-jongg (NMJL) has grown to hundreds of thousands of players, with online play attracting new players each year.</p>
            <p className="htp-sources">Sources: <a href="https://en.wikipedia.org/wiki/Mahjong" target="_blank" rel="noopener noreferrer">Wikipedia</a>, <a href="https://sloperama.com/mjfaq/mjfaq23.html" target="_blank" rel="noopener noreferrer">MahJong FAQ</a></p>

            <h2>Next</h2>
            <p>Check the <strong>Tile Glossary</strong> to see all tiles, <strong>Terms</strong> for Pung, Chow, and more, and <strong>Scoring</strong> for how points and payouts work. Try the <strong>Practice Quiz</strong> before playing!</p>
          </div>
        )}
        {section === 'tiles' && <TileGlossary />}
        {section === 'terms' && <TermsGlossary />}
        {section === 'scoring' && <ScoringSection />}
        {section === 'quiz' && <MahjongQuiz />}
      </main>
    </div>
  )
}
