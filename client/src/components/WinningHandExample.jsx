import { Tile } from './Tile'
import { createTile } from '../game/tiles'
import './WinningHandExample.css'

/** Example winning hands: 3 melds + 1 pair = 11 tiles */
const EXAMPLES = [
  {
    label: 'Example 1: Pung + Chow + Chow + Pair',
    melds: [
      { type: 'pung', tiles: [createTile('dots', 5, 1), createTile('dots', 5, 2), createTile('dots', 5, 3)] },
      { type: 'chow', tiles: [createTile('bamboo', 2, 4), createTile('bamboo', 3, 5), createTile('bamboo', 4, 6)] },
      { type: 'chow', tiles: [createTile('characters', 6, 7), createTile('characters', 7, 8), createTile('characters', 8, 9)] }
    ],
    pair: [createTile('wind', 'E', 10), createTile('wind', 'E', 11)]
  },
  {
    label: 'Example 2: All Pungs + Pair',
    melds: [
      { type: 'pung', tiles: [createTile('dots', 1, 1), createTile('dots', 1, 2), createTile('dots', 1, 3)] },
      { type: 'pung', tiles: [createTile('bamboo', 7, 4), createTile('bamboo', 7, 5), createTile('bamboo', 7, 6)] },
      { type: 'pung', tiles: [createTile('dragon', 'R', 7), createTile('dragon', 'R', 8), createTile('dragon', 'R', 9)] }
    ],
    pair: [createTile('wind', 'N', 10), createTile('wind', 'N', 11)]
  },
  {
    label: 'Example 3: All Chows (same suit) + Pair',
    melds: [
      { type: 'chow', tiles: [createTile('bamboo', 1, 1), createTile('bamboo', 2, 2), createTile('bamboo', 3, 3)] },
      { type: 'chow', tiles: [createTile('bamboo', 4, 4), createTile('bamboo', 5, 5), createTile('bamboo', 6, 6)] },
      { type: 'chow', tiles: [createTile('bamboo', 7, 7), createTile('bamboo', 8, 8), createTile('bamboo', 9, 9)] }
    ],
    pair: [createTile('dots', 3, 10), createTile('dots', 3, 11)]
  }
]

export function WinningHandExample() {
  return (
    <div className="winning-hand-examples">
      <h3>Winning Hand Examples</h3>
      <p className="examples-intro">Each winning hand has exactly 3 melds (Pungs or Chows) + 1 pair = 11 tiles.</p>
      {EXAMPLES.map((ex, i) => (
        <div key={i} className="winning-example">
          <p className="example-label">{ex.label}</p>
          <div className="example-melds">
            {ex.melds.map((m, j) => (
              <div key={j} className="example-meld">
                {m.tiles.map(t => (
                  <Tile key={t.id} tile={t} />
                ))}
              </div>
            ))}
          </div>
          <div className="example-pair">
            <span className="pair-label">Pair:</span>
            {ex.pair.map(t => (
              <Tile key={t.id} tile={t} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
