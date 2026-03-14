import { getTileLabel, getTileUnicode } from '../game/tiles'
import './Tile.css'

export function Tile({ tile, selected, hinted, onClick }) {
  if (!tile) return null

  const label = getTileLabel(tile)
  const unicodeChar = getTileUnicode(tile)
  const suitClass = (tile.suit || '').toLowerCase().replace(' ', '-')

  return (
    <button
      type="button"
      className={`tile ${suitClass} ${selected ? 'selected' : ''} ${hinted ? 'hinted' : ''} ${tile.isWild ? 'wild' : ''}`}
      onClick={() => onClick?.(tile)}
      title={label}
      aria-label={label}
    >
      <span className="tile-char">{unicodeChar}</span>
      {tile.isWild && <span className="tile-wild">★</span>}
    </button>
  )
}
