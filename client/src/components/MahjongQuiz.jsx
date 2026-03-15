import { useState } from 'react'
import { Tile } from './Tile'
import { createTile } from '../game/tiles'
import './MahjongQuiz.css'

const QUIZ_QUESTIONS = [
  {
    id: 1,
    type: 'pung-or-chow',
    tiles: [
      createTile('dots', 5, 1),
      createTile('dots', 5, 2),
      createTile('dots', 5, 3)
    ],
    correct: 'pung',
    prompt: 'What type of meld is this?'
  },
  {
    id: 2,
    type: 'pung-or-chow',
    tiles: [
      createTile('bamboo', 3, 4),
      createTile('bamboo', 4, 5),
      createTile('bamboo', 5, 6)
    ],
    correct: 'chow',
    prompt: 'What type of meld is this?'
  },
  {
    id: 3,
    type: 'pung-or-chow',
    tiles: [
      createTile('wind', 'E', 7),
      createTile('wind', 'E', 8),
      createTile('wind', 'E', 9)
    ],
    correct: 'pung',
    prompt: 'What type of meld is this?'
  },
  {
    id: 4,
    type: 'pung-or-chow',
    tiles: [
      createTile('characters', 7, 10),
      createTile('characters', 8, 11),
      createTile('characters', 9, 12)
    ],
    correct: 'chow',
    prompt: 'What type of meld is this?'
  },
  {
    id: 5,
    type: 'claim-source',
    correct: 'any',
    prompt: 'For a Pung, you can claim a discarded tile from:'
  },
  {
    id: 6,
    type: 'claim-source',
    correct: 'left',
    prompt: 'For a Chow, you can only claim a discarded tile from:'
  },
  {
    id: 7,
    type: 'pung-or-chow',
    tiles: [
      createTile('dragon', 'R', 13),
      createTile('dragon', 'R', 14),
      createTile('dragon', 'R', 15)
    ],
    correct: 'pung',
    prompt: 'What type of meld is this?'
  },
  {
    id: 8,
    type: 'pung-or-chow',
    tiles: [
      createTile('dots', 2, 16),
      createTile('dots', 3, 17),
      createTile('dots', 4, 18)
    ],
    correct: 'chow',
    prompt: 'What type of meld is this?'
  },
  {
    id: 9,
    type: 'pung-or-chow',
    tiles: [
      createTile('characters', 1, 19),
      createTile('characters', 1, 20),
      createTile('characters', 1, 21)
    ],
    correct: 'pung',
    prompt: 'What type of meld is this?'
  },
  {
    id: 10,
    type: 'pung-or-chow',
    tiles: [
      createTile('bamboo', 6, 22),
      createTile('bamboo', 7, 23),
      createTile('bamboo', 8, 24)
    ],
    correct: 'chow',
    prompt: 'What type of meld is this?'
  }
]

export function MahjongQuiz() {
  const [current, setCurrent] = useState(0)
  const [answer, setAnswer] = useState(null)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)

  const q = QUIZ_QUESTIONS[current]
  const isLast = current === QUIZ_QUESTIONS.length - 1

  const handleAnswer = (choice) => {
    if (answer !== null) return
    setAnswer(choice)
    setShowResult(true)
    if (q.type === 'pung-or-chow' && choice === q.correct) setScore(s => s + 1)
    if (q.type === 'claim-source' && choice === q.correct) setScore(s => s + 1)
  }

  const handleNext = () => {
    setAnswer(null)
    setShowResult(false)
    if (isLast) {
      setCurrent(0)
      setScore(0)
    } else {
      setCurrent(c => c + 1)
    }
  }

  return (
    <div className="mahjong-quiz">
      <h3>Practice Quiz</h3>
      <p className="quiz-intro">Test your knowledge of Pung vs Chow before playing.</p>
      <div className="quiz-progress">Question {current + 1} of {QUIZ_QUESTIONS.length}</div>
      <div className="quiz-card">
        <p className="quiz-prompt">{q.prompt}</p>
        {q.tiles && (
          <div className="quiz-tiles">
            {q.tiles.map(t => (
              <Tile key={t.id} tile={t} />
            ))}
          </div>
        )}
        <div className="quiz-choices">
          {q.type === 'pung-or-chow' && (
            <>
              <button type="button" className={answer === 'pung' ? (q.correct === 'pung' ? 'correct' : 'wrong') : ''} onClick={() => handleAnswer('pung')} disabled={answer !== null}>Pung</button>
              <button type="button" className={answer === 'chow' ? (q.correct === 'chow' ? 'correct' : 'wrong') : ''} onClick={() => handleAnswer('chow')} disabled={answer !== null}>Chow</button>
            </>
          )}
          {q.type === 'claim-source' && (
            <>
              <button type="button" className={answer === 'any' ? (q.correct === 'any' ? 'correct' : 'wrong') : ''} onClick={() => handleAnswer('any')} disabled={answer !== null}>Any player</button>
              <button type="button" className={answer === 'left' ? (q.correct === 'left' ? 'correct' : 'wrong') : ''} onClick={() => handleAnswer('left')} disabled={answer !== null}>Only the player to your left</button>
            </>
          )}
        </div>
        {showResult && (
          <div className={`quiz-feedback ${answer === q.correct ? 'correct' : 'incorrect'}`}>
            {answer === q.correct ? '✓ Correct!' : `✗ The answer is ${q.correct === 'pung' ? 'Pung' : q.correct === 'chow' ? 'Chow' : q.correct === 'any' ? 'Any player' : 'Only the player to your left'}.`}
          </div>
        )}
        {showResult && (
          <button type="button" className="btn-next" onClick={handleNext}>
            {isLast ? 'Restart Quiz' : 'Next'}
          </button>
        )}
      </div>
      <div className="quiz-score">Score: {score} / {QUIZ_QUESTIONS.length}</div>
    </div>
  )
}
