import { useState } from 'react'
import { useLocalStorage } from '../utils/useLocalStorage.js'

export default function QuizBlock({ quizId, questions = [] }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [bestScore, setBestScore] = useLocalStorage(`quiz-best-${quizId}`, 0)

  function selectAnswer(questionId, optionId) {
    setAnswers({ ...answers, [questionId]: optionId })
  }

  function submitQuiz(event) {
    event.preventDefault()
    const score = questions.reduce((total, question) => {
      return total + (answers[question.id] === question.answer ? 1 : 0)
    }, 0)

    const percent = Math.round((score / questions.length) * 100)
    if (percent > bestScore) setBestScore(percent)
    setSubmitted(true)
  }

  const score = questions.reduce((total, question) => {
    return total + (answers[question.id] === question.answer ? 1 : 0)
  }, 0)

  return (
    <section className="panel">
      <p className="eyebrow">Assessment</p>
      <h3>Topic Quiz</h3>
      <p>Best score saved in this browser: <strong>{bestScore}%</strong></p>

      <form onSubmit={submitQuiz}>
        {questions.map(question => (
          <div className="quiz-question" key={question.id}>
            <strong>{question.prompt}</strong>

            {question.options.map(option => (
              <label className="quiz-option" key={option.id}>
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={answers[question.id] === option.id}
                  onChange={() => selectAnswer(question.id, option.id)}
                />
                <span>{option.text}</span>
              </label>
            ))}

            {submitted && (
              <p className={answers[question.id] === question.answer ? 'feedback good' : 'feedback needs-work'}>
                {answers[question.id] === question.answer ? 'Correct.' : `Review: ${question.explanation}`}
              </p>
            )}
          </div>
        ))}

        <button className="btn primary" type="submit">Check answers</button>

        {submitted && (
          <p className={score === questions.length ? 'feedback good' : 'feedback needs-work'}>
            Score: {score}/{questions.length}. {score === questions.length ? 'Excellent.' : 'Try again after reviewing the worked example.'}
          </p>
        )}
      </form>
    </section>
  )
}
