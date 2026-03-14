/**
 * Mahjong Tile Definitions
 * Full deck: 144 tiles (Dots, Bamboos, Characters, Winds, Dragons, Flowers)
 */

export const SUITS = {
  DOTS: 'dots',
  BAMBOO: 'bamboo',
  CHARACTERS: 'characters',
  WIND: 'wind',
  DRAGON: 'dragon',
  FLOWER: 'flower'
}

export const WIND_VALUES = ['E', 'S', 'W', 'N'] // East, South, West, North
export const DRAGON_VALUES = ['R', 'G', 'W']     // Red, Green, White

/** Create a tile object. id must be unique. */
export function createTile(suit, value, id) {
  return { id, suit, value, isJoker: false, isWild: false }
}

/** Build the full 144-tile deck */
export function createDeck() {
  const tiles = []
  let id = 0

  // Dots 1-9 (4 each) = 36
  for (let v = 1; v <= 9; v++) {
    for (let i = 0; i < 4; i++) {
      tiles.push(createTile(SUITS.DOTS, v, id++))
    }
  }

  // Bamboos 1-9 (4 each) = 36
  for (let v = 1; v <= 9; v++) {
    for (let i = 0; i < 4; i++) {
      tiles.push(createTile(SUITS.BAMBOO, v, id++))
    }
  }

  // Characters 1-9 (4 each) = 36
  for (let v = 1; v <= 9; v++) {
    for (let i = 0; i < 4; i++) {
      tiles.push(createTile(SUITS.CHARACTERS, v, id++))
    }
  }

  // Winds (4 each) = 16
  for (const v of WIND_VALUES) {
    for (let i = 0; i < 4; i++) {
      tiles.push(createTile(SUITS.WIND, v, id++))
    }
  }

  // Dragons (4 each) = 12
  for (const v of DRAGON_VALUES) {
    for (let i = 0; i < 4; i++) {
      tiles.push(createTile(SUITS.DRAGON, v, id++))
    }
  }

  // Flowers 1-4 (2 each) + Seasons 1-4 (2 each) = 8
  for (let v = 1; v <= 4; v++) {
    tiles.push(createTile(SUITS.FLOWER, `F${v}`, id++))
    tiles.push(createTile(SUITS.FLOWER, `S${v}`, id++))
  }

  return tiles
}

/** Fisher-Yates shuffle */
export function shuffle(tiles) {
  const arr = [...tiles]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** Check if two tiles are the same (for joker/wild matching) */
export function sameTile(a, b, jokerTile) {
  if (!a || !b) return false
  if (a.isWild) return true
  if (b.isWild) return true
  if (jokerTile && a.suit === jokerTile.suit && String(a.value) === String(jokerTile.value))
    return true
  if (jokerTile && b.suit === jokerTile.suit && String(b.value) === String(jokerTile.value))
    return true
  return a.suit === b.suit && String(a.value) === String(b.value)
}

/** Get Unicode mahjong character for a tile (proper tile imagery) */
export function getTileUnicode(tile) {
  if (!tile) return ''
  if (tile.suit === SUITS.CHARACTERS && tile.value >= 1 && tile.value <= 9)
    return String.fromCodePoint(0x1F006 + tile.value) // U+1F007 = 1, U+1F00F = 9
  if (tile.suit === SUITS.BAMBOO && tile.value >= 1 && tile.value <= 9)
    return String.fromCodePoint(0x1F00F + tile.value) // U+1F010 = 1 bamboo
  if (tile.suit === SUITS.DOTS && tile.value >= 1 && tile.value <= 9)
    return String.fromCodePoint(0x1F018 + tile.value) // U+1F019 = 1 circle
  if (tile.suit === SUITS.WIND)
    return String.fromCodePoint(0x1F000 + { E: 0, S: 1, W: 2, N: 3 }[tile.value])
  if (tile.suit === SUITS.DRAGON)
    return String.fromCodePoint(0x1F004 + { R: 0, G: 1, W: 2 }[tile.value])
  if (tile.suit === SUITS.FLOWER) {
    const n = parseInt(String(tile.value).replace(/\D/g, ''), 10)
    const offset = tile.value.startsWith('F') ? 0 : 4 // Flowers 0-3, Seasons 4-7
    return String.fromCodePoint(0x1F022 + offset + (n - 1))
  }
  return ''
}

/** Get display label for a tile */
export function getTileLabel(tile) {
  if (!tile) return ''
  if (tile.suit === SUITS.FLOWER) return tile.value.startsWith('F') ? `Flower ${tile.value[1]}` : `Season ${tile.value[1]}`
  if (tile.suit === SUITS.WIND) return { E: 'East', S: 'South', W: 'West', N: 'North' }[tile.value] || tile.value
  if (tile.suit === SUITS.DRAGON) return { R: 'Red', G: 'Green', W: 'White' }[tile.value] || tile.value
  return `${tile.suit} ${tile.value}`
}
