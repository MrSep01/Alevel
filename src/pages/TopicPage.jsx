import PriorKnowledgeCheck from '../components/PriorKnowledgeCheck.jsx'
import VocabularyList from '../components/VocabularyList.jsx'
import LessonBlock from '../components/LessonBlock.jsx'
import Flashcards from '../components/Flashcards.jsx'
import QuizBlock from '../components/QuizBlock.jsx'
import AmountOfSubstanceTopic from '../components/AmountOfSubstanceTopic.jsx'
import LessonTemplate from '../components/LessonTemplate.jsx'
import { lessonContent } from '../data/lessons.js'
import { lessonTemplates } from '../data/lessonTemplates.js'
import { quizzes } from '../data/quizzes.js'

export default function TopicPage({ topic, navigate, currentUser }) {
  const lesson = lessonContent[topic.id]
  const lessonTemplate = lessonTemplates[topic.id]
  const pathwayPage = topic.pathway || (topic.level === 'A2' || topic.level === 'A Level' ? 'a2' : topic.level === 'IGCSE' ? 'igcse' : 'as')
  const displayTitle = topic.syllabusNumber ? `${topic.syllabusNumber} ${topic.title}` : topic.title

  if (lessonTemplate) {
    return (
      <div className="page lesson-template-page">
        <div className="topic-page-action-row">
          <button className="btn" type="button" onClick={() => navigate(pathwayPage)}>Back to pathway</button>
          {lessonTemplate.topicAssessments && (
            <>
              <button className="btn primary" type="button" onClick={() => navigate('topic-exam-practice', topic.id)}>Exam Practice</button>
              <button className="btn" type="button" onClick={() => navigate('topic-past-papers', topic.id)}>Past Papers</button>
            </>
          )}
        </div>
        <LessonTemplate topic={topic} template={lessonTemplate} currentUser={currentUser} />
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="page">
        <button className="btn" onClick={() => navigate(pathwayPage)}>Back</button>
        <section className="hero">
          <p className="eyebrow">{topic.level} • {topic.unit}</p>
          <h1>{displayTitle}</h1>
          <p>This topic page is ready for content. Add the lesson data in <code>src/data/lessons.js</code>.</p>
        </section>
      </div>
    )
  }

  return (
    <div className="page">
      <button className="btn" onClick={() => navigate(pathwayPage)}>Back to pathway</button>

      <section className="section hero">
        <p className="eyebrow">{topic.level} • {topic.unit}</p>
        <h1>{displayTitle}</h1>
        <p>{topic.description}</p>
      </section>

      <section className="section topic-layout">
        <aside className="topic-sidebar">
          <PriorKnowledgeCheck topicId={topic.id} checks={lesson.priorKnowledge} />
          <VocabularyList terms={lesson.vocabulary} />
        </aside>

        {topic.id === 'amount-of-substance' ? (
          <AmountOfSubstanceTopic lesson={lesson} />
        ) : (
          <div className="lesson-block">
            <LessonBlock lesson={lesson} />

            <Flashcards cards={lesson.flashcards} />
            <QuizBlock quizId={topic.id} questions={quizzes[topic.id] || []} />
          </div>
        )}
      </section>
    </div>
  )
}
