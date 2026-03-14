import { Tile } from './Tile'
import { SUITS, WIND_VALUES, DRAGON_VALUES, createTile } from '../game/tiles'
import './TileGlossary.css'

const SUIT_LABELS = {
  dots: 'Dots (Circles)',
  bamboo: 'Bamboos',
  characters: 'Characters',
  wind: 'Winds',
  dragon: 'Dragons',
  flower: 'Flowers & Seasons'
}

export function TileGlossary() {
  const sections = [
    { suit: SUITS.DOTS, tiles: Array.from({ length: 9 }, (_, i) => createTile(SUITS.DOTS, i + 1, i)), count: 4 },
    { suit: SUITS.BAMBOO, tiles: Array.from({ length: 9 }, (_, i) => createTile(SUITS.BAMBOO, i + 1, 100 + i)), count: 4 },
    { suit: SUITS.CHARACTERS, tiles: Array.from({ length: 9 }, (_, i) => createTile(SUITS.CHARACTERS, i + 1, 200 + i)), count: 4 },
    { suit: SUITS.WIND, tiles: WIND_VALUES.map((v, i) => createTile(SUITS.WIND, v, 300 + i)), count: 4 },
    { suit: SUITS.DRAGON, tiles: DRAGON_VALUES.map((v, i) => createTile(SUITS.DRAGON, v, 400 + i)), count: 4 },
    { suit: SUITS.FLOWER, tiles: [...Array.from({ length: 4 }, (_, i) => createTile(SUITS.FLOWER, `F${i + 1}`, 500 + i)), ...Array.from({ length: 4 }, (_, i) => createTile(SUITS.FLOWER, `S${i + 1}`, 600 + i))], count: 2 }
  ]

  return (
    <div className="tile-glossary">
      <h3>Tile Glossary</h3>
      <p className="glossary-intro">The full deck has 144 tiles. Each tile type appears 4 times in the deck (except Flowers/Seasons: 2 each).</p>
      {sections.map(({ suit, tiles, count }) => (
        <div key={String(suit)} className="glossary-section">
          <h4>{SUIT_LABELS[suit]}</h4>
          <p className="tile-count">× {count} of each</p>
          <div className="glossary-tiles">
            {tiles.map(t => (
              <div key={t.id} className="glossary-tile-item">
                <Tile tile={t} />
                <span className="tile-sublabel">{t.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
