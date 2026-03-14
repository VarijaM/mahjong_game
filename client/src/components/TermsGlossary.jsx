import { Tile } from './Tile'
import { createTile } from '../game/tiles'
import './TermsGlossary.css'

export function TermsGlossary() {
  const pungExample = [
    createTile('dots', 5, 1),
    createTile('dots', 5, 2),
    createTile('dots', 5, 3)
  ]
  const chowExample = [
    createTile('bamboo', 4, 4),
    createTile('bamboo', 5, 5),
    createTile('bamboo', 6, 6)
  ]

  return (
    <div className="terms-glossary">
      <h3>Glossary of Terms</h3>
      <div className="term-card">
        <h4>Pung</h4>
        <p>A move where you take a discarded tile from <strong>any player</strong> at the table if it completes a set of 3 identical tiles.</p>
        <div className="term-example">
          <span>Example:</span>
          <div className="example-tiles">
            {pungExample.map(t => (
              <Tile key={t.id} tile={t} />
            ))}
          </div>
          <p className="example-caption">Three 5 Dots</p>
        </div>
      </div>
      <div className="term-card">
        <h4>Chow</h4>
        <p>A move where you take a discarded tile <strong>only from the player who moved directly before you</strong> (to your left) if it completes a set of 3 tiles in consecutive order (same suit).</p>
        <div className="term-example">
          <span>Example:</span>
          <div className="example-tiles">
            {chowExample.map(t => (
              <Tile key={t.id} tile={t} />
            ))}
          </div>
          <p className="example-caption">Bamboo 4-5-6 sequence</p>
        </div>
      </div>
      <div className="term-card">
        <h4>Pair</h4>
        <p>Two identical tiles. You need exactly one pair to win (along with 3 melds of Pungs or Chows).</p>
      </div>
      <div className="term-card">
        <h4>Joker / Wild</h4>
        <p>A tile revealed from the back of the wall. That tile + its 3 duplicates become wild cards that can represent any tile.</p>
      </div>
    </div>
  )
}
