import { useState } from 'react'
import { Tile } from './Tile'
import { createTile } from '../game/tiles'
import './FlowCarousel.css'

const STEPS = [
  {
    title: '1. Start with 13 tiles',
    desc: 'Each player is dealt 13 tiles. The dealer will draw a 14th tile first.',
    tiles: [
      createTile('dots', 2, 1), createTile('dots', 3, 2), createTile('dots', 4, 3),
      createTile('bamboo', 5, 4), createTile('bamboo', 6, 5), createTile('bamboo', 7, 6),
      createTile('characters', 1, 7), createTile('characters', 1, 8), createTile('characters', 1, 9),
      createTile('wind', 'E', 10), createTile('wind', 'E', 11),
      createTile('dots', 8, 12), createTile('dots', 9, 13)
    ],
    highlight: null
  },
  {
    title: '2. Draw from the wall',
    desc: 'On your turn, draw one tile from the wall (or claim a discard). You now have 14 tiles.',
    tiles: [
      createTile('dots', 2, 1), createTile('dots', 3, 2), createTile('dots', 4, 3),
      createTile('bamboo', 5, 4), createTile('bamboo', 6, 5), createTile('bamboo', 7, 6),
      createTile('characters', 1, 7), createTile('characters', 1, 8), createTile('characters', 1, 9),
      createTile('wind', 'E', 10), createTile('wind', 'E', 11),
      createTile('dots', 8, 12), createTile('dots', 9, 13),
      createTile('bamboo', 4, 14)
    ],
    highlight: 14
  },
  {
    title: '3. Choose a tile to discard',
    desc: 'Select one tile from your hand to discard. You must discard after every draw.',
    tiles: [
      createTile('dots', 2, 1), createTile('dots', 3, 2), createTile('dots', 4, 3),
      createTile('bamboo', 5, 4), createTile('bamboo', 6, 5), createTile('bamboo', 7, 6),
      createTile('characters', 1, 7), createTile('characters', 1, 8), createTile('characters', 1, 9),
      createTile('wind', 'E', 10), createTile('wind', 'E', 11),
      createTile('dots', 8, 12), createTile('dots', 9, 13),
      createTile('bamboo', 4, 14)
    ],
    highlight: 12,
    selectedLabel: 'Discarding 8 Dots'
  },
  {
    title: '4. Discard goes to the pile',
    desc: 'Your discard joins your discard pile. Play passes to the next player.',
    tiles: [
      createTile('dots', 2, 1), createTile('dots', 3, 2), createTile('dots', 4, 3),
      createTile('bamboo', 5, 4), createTile('bamboo', 6, 5), createTile('bamboo', 7, 6),
      createTile('characters', 1, 7), createTile('characters', 1, 8), createTile('characters', 1, 9),
      createTile('wind', 'E', 10), createTile('wind', 'E', 11),
      createTile('bamboo', 4, 14), createTile('dots', 8, 15), createTile('dots', 9, 13)
    ],
    discards: [createTile('dots', 8, 99)],
    highlight: null
  },
  {
    title: '5. Repeat until someone wins',
    desc: 'Keep drawing and discarding. Win by forming 3 melds + 1 pair!',
    tiles: [
      createTile('dots', 2, 1), createTile('dots', 3, 2), createTile('dots', 4, 3),
      createTile('bamboo', 5, 4), createTile('bamboo', 6, 5), createTile('bamboo', 7, 6),
      createTile('characters', 1, 7), createTile('characters', 1, 8), createTile('characters', 1, 9),
      createTile('wind', 'E', 10), createTile('wind', 'E', 11),
      createTile('bamboo', 4, 14)
    ],
    discards: [createTile('dots', 8, 99), createTile('dots', 9, 98)],
    highlight: null
  }
]

export function FlowCarousel() {
  const [index, setIndex] = useState(0)
  const step = STEPS[index]

  return (
    <div className="flow-carousel">
      <h3>Game Flow</h3>
      <div className="carousel-container">
        <button
          type="button"
          className="carousel-arrow carousel-prev"
          onClick={() => setIndex(i => (i - 1 + STEPS.length) % STEPS.length)}
          aria-label="Previous step"
        >
          ‹
        </button>
        <div className="carousel-content">
          <h4>{step.title}</h4>
          <p>{step.desc}</p>
          <div className="carousel-visual">
            <div className="carousel-hand">
              {step.tiles.map((t, i) => (
                <Tile
                  key={t.id}
                  tile={t}
                  hinted={step.highlight === t.id}
                  selected={step.highlight === t.id}
                />
              ))}
            </div>
            {step.discards && step.discards.length > 0 && (
              <div className="carousel-discards">
                <span className="discard-label">Discards:</span>
                {step.discards.map(t => (
                  <Tile key={t.id} tile={t} />
                ))}
              </div>
            )}
            {step.selectedLabel && (
              <p className="carousel-hint">{step.selectedLabel}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          className="carousel-arrow carousel-next"
          onClick={() => setIndex(i => (i + 1) % STEPS.length)}
          aria-label="Next step"
        >
          ›
        </button>
      </div>
      <div className="carousel-dots">
        {STEPS.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`carousel-dot ${i === index ? 'active' : ''}`}
            onClick={() => setIndex(i)}
            aria-label={`Go to step ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
