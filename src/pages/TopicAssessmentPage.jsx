import { useState } from 'react'
import { lessonTemplates } from '../data/lessonTemplates.js'

function AssessmentDataTable({ table }) {
  if (!table) return null

  return (
    <div className="workbook-data-table">
      <table>
        <thead>
          <tr>{table.headers.map(header => <th key={header}>{header}</th>)}</tr>
        </thead>
        <tbody>
          {table.rows.map(row => (
            <tr key={row.join('-')}>
              {row.map(cell => <td key={cell}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AssessmentQuestionCard({ question, index, type }) {
  const [showScheme, setShowScheme] = useState(false)
  const label = type === 'past' ? 'Past paper slot' : `Question ${index + 1}`

  return (
    <article className={`assessment-question-card ${type === 'past' ? 'past-paper' : 'mock'}`}>
      <div className="assessment-question-meta">
        <span>{label}</span>
        {question.marks && <strong>{question.marks} marks</strong>}
      </div>
      <h4>{question.title}</h4>
      {question.source && <p className="assessment-source">{question.source}</p>}
      <p>{question.prompt}</p>
      {question.table && <AssessmentDataTable table={question.table} />}
      {question.parts && (
        <div className="assessment-part-list">
          {question.parts.map(part => (
            <div className="assessment-part-row" key={part.label}>
              <span>{part.label}</span>
              <p>{part.text}</p>
              {part.marks && <strong>[{part.marks}]</strong>}
            </div>
          ))}
        </div>
      )}
      {(question.answer || question.markScheme) && (
        <>
          <button className="btn" type="button" onClick={() => setShowScheme(previous => !previous)}>
            {showScheme ? 'Hide mark scheme' : 'Show mark scheme'}
          </button>
          {showScheme && (
            <div className="assessment-mark-scheme">
              {(question.markScheme || [question.answer]).map(point => <p key={point}>{point}</p>)}
            </div>
          )}
        </>
      )}
    </article>
  )
}

export default function TopicAssessmentPage({ topic, navigate, mode = 'exam' }) {
  const template = lessonTemplates[topic.id]
  const assessments = template?.topicAssessments
  const isPastPaperPage = mode === 'past'
  const assessment = isPastPaperPage ? assessments?.pastPaper : assessments?.mockExam
  const pathwayPage = topic.pathway || (topic.level === 'A2' || topic.level === 'A Level' ? 'a2' : topic.level === 'IGCSE' ? 'igcse' : 'as')
  const displayTitle = topic.syllabusNumber ? `${topic.syllabusNumber} ${topic.title}` : topic.title
  const pageTitle = isPastPaperPage ? 'Past Papers' : 'Exam Practice'
  const pageIntro = isPastPaperPage
    ? 'Official past-paper question slots for this topic. These stay separate from the web lesson so students can practise papers deliberately.'
    : 'A topic-level mock exam and exam-style practice area. This page is separate from the teaching lesson so the lesson stays focused.'

  if (!assessment) {
    return (
      <div className="page topic-assessment-page">
        <div className="topic-page-action-row">
          <button className="btn" type="button" onClick={() => navigate('topic', topic.id)}>Back to lesson</button>
          <button className="btn" type="button" onClick={() => navigate(pathwayPage)}>Back to pathway</button>
        </div>
        <section className="hero">
          <p className="eyebrow">{pageTitle}</p>
          <h1>{displayTitle}</h1>
          <p>This topic does not have {isPastPaperPage ? 'past-paper' : 'exam-practice'} content yet.</p>
        </section>
      </div>
    )
  }

  return (
    <div className="page topic-assessment-page">
      <div className="topic-page-action-row">
        <button className="btn" type="button" onClick={() => navigate('topic', topic.id)}>Back to lesson</button>
        <button className="btn" type="button" onClick={() => navigate(pathwayPage)}>Back to pathway</button>
        <button
          className={`btn ${!isPastPaperPage ? 'primary' : ''}`}
          type="button"
          onClick={() => navigate('topic-exam-practice', topic.id)}
        >
          Exam Practice
        </button>
        <button
          className={`btn ${isPastPaperPage ? 'primary' : ''}`}
          type="button"
          onClick={() => navigate('topic-past-papers', topic.id)}
        >
          Past Papers
        </button>
      </div>

      <section className={`hero topic-assessment-hero ${isPastPaperPage ? 'past' : 'exam'}`}>
        <p className="eyebrow">{topic.course} • Topic {topic.syllabusNumber}</p>
        <h1>{displayTitle}: {pageTitle}</h1>
        <p>{pageIntro}</p>
      </section>

      <section className={`topic-assessment-panel dedicated ${isPastPaperPage ? 'past' : 'exam'}`} aria-label={pageTitle}>
        <div className="topic-assessment-heading">
          <p className="eyebrow">{isPastPaperPage ? 'Past paper questions' : 'Mock exam'}</p>
          <h3>{assessment.title}</h3>
          <p>{assessment.description || `${assessment.duration} • ${assessment.totalMarks} marks`}</p>
        </div>

        {assessment.instructions && (
          <ul className="lesson-check-list assessment-instructions">
            {assessment.instructions.map(instruction => <li key={instruction}>{instruction}</li>)}
          </ul>
        )}

        <div className="assessment-question-list dedicated">
          {assessment.questions.map((question, index) => (
            <AssessmentQuestionCard question={question} index={index} type={isPastPaperPage ? 'past' : 'exam'} key={question.id} />
          ))}
        </div>
      </section>
    </div>
  )
}
