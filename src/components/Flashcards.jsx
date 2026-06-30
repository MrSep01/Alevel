import { useState } from 'react'

export default function Flashcards({ cards = [] }) {
  const [index, setIndex] = useState(0)
  const [showBack, setShowBack] = useState(false)

  if (!cards.length) return null

  const card = cards[index]

  function nextCard() {
    setShowBack(false)
    setIndex((index + 1) % cards.length)
  }

  function previousCard() {
    setShowBack(false)
    setIndex((index - 1 + cards.length) % cards.length)
  }

  return (
    <section className="panel">
      <p className="eyebrow">Revision</p>
      <h3>Flashcards</h3>

      <button className="flashcard" onClick={() => setShowBack(!showBack)}>
        {showBack ? (
          <span>{card.back}</span>
        ) : (
          <span>
            <strong>{card.front}</strong>
            Click to reveal
          </span>
        )}
      </button>

      <div className="action-row">
        <button className="btn" onClick={previousCard}>Previous</button>
        <button className="btn primary" onClick={nextCard}>Next</button>
      </div>
    </section>
  )
}
