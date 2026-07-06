import { lessonTemplates } from '../data/lessonTemplates.js'
import { allTopics } from '../data/topics.js'

const topicsWithAssessments = allTopics
  .map(topic => ({ topic, assessments: lessonTemplates[topic.id]?.topicAssessments }))
  .filter(item => item.assessments)

export default function ExamPractice({ navigate, mode = 'exam' }) {
  const isPastPaperPage = mode === 'past'
  const pageTitle = isPastPaperPage ? 'Past Papers' : 'Exam Practice'
  const pageIntro = isPastPaperPage
    ? 'Open official past-paper question sets by topic. Past papers live on their own pages, separate from the teaching lessons.'
    : 'Open topic mock exams and exam-style practice. Exam practice lives on its own pages, separate from the teaching lessons.'
  const route = isPastPaperPage ? 'topic-past-papers' : 'topic-exam-practice'

  return (
    <div className="page assessment-hub-page">
      <section className="hero">
        <p className="eyebrow">{pageTitle}</p>
        <h1>{isPastPaperPage ? 'Past-paper practice by topic.' : 'Exam practice by topic.'}</h1>
        <p>{pageIntro}</p>
      </section>

      <section className="section grid-3">
        <article className="card">
          <h3>{isPastPaperPage ? 'Attempt first' : 'Try without support'}</h3>
          <p>{isPastPaperPage ? 'Use the official question before opening the mark scheme or teacher notes.' : 'Treat the mock like a timed paper and write full answers before revealing the mark scheme.'}</p>
        </article>
        <article className="card">
          <h3>Mark carefully</h3>
          <p>Compare against each marking point, then rewrite the answer with missing chemistry added in a different colour.</p>
        </article>
        <article className="card">
          <h3>Review patterns</h3>
          <p>Track repeated command words, common missing units, weak explanations, and calculations that need more practice.</p>
        </article>
      </section>

      <section className="section panel assessment-topic-browser">
        <div className="section-header">
          <div>
            <p className="eyebrow">{isPastPaperPage ? 'Past paper pages' : 'Exam practice pages'}</p>
            <h2>Choose a topic</h2>
          </div>
        </div>

        <div className="assessment-topic-grid">
          {topicsWithAssessments.map(({ topic, assessments }) => {
            const assessment = isPastPaperPage ? assessments.pastPaper : assessments.mockExam
            return (
              <article className="assessment-topic-card" key={topic.id}>
                <span>{topic.course} • Topic {topic.syllabusNumber}</span>
                <h3>{topic.title}</h3>
                <p>{assessment.title}</p>
                <small>{isPastPaperPage ? `${assessment.questions.length} past-paper slots` : `${assessment.questions.length} questions • ${assessment.totalMarks} marks`}</small>
                <button className="btn primary" type="button" onClick={() => navigate(route, topic.id)}>
                  Open {isPastPaperPage ? 'Past Papers' : 'Exam Practice'}
                </button>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
