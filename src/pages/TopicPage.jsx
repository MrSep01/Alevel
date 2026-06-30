import PriorKnowledgeCheck from '../components/PriorKnowledgeCheck.jsx'
import VocabularyList from '../components/VocabularyList.jsx'
import LessonBlock from '../components/LessonBlock.jsx'
import Flashcards from '../components/Flashcards.jsx'
import QuizBlock from '../components/QuizBlock.jsx'
import AmountOfSubstanceTopic from '../components/AmountOfSubstanceTopic.jsx'
import { lessonContent } from '../data/lessons.js'
import { quizzes } from '../data/quizzes.js'

export default function TopicPage({ topic, navigate }) {
  const lesson = lessonContent[topic.id]

  if (!lesson) {
    return (
      <div className="page">
        <button className="btn" onClick={() => navigate(topic.level === 'A2' ? 'a2' : 'as')}>Back</button>
        <section className="hero">
          <p className="eyebrow">{topic.level} • {topic.unit}</p>
          <h1>{topic.title}</h1>
          <p>This topic page is ready for content. Add the lesson data in <code>src/data/lessons.js</code>.</p>
        </section>
      </div>
    )
  }

  return (
    <div className="page">
      <button className="btn" onClick={() => navigate(topic.level === 'A2' ? 'a2' : 'as')}>Back to pathway</button>

      <section className="section hero">
        <p className="eyebrow">{topic.level} • {topic.unit}</p>
        <h1>{topic.title}</h1>
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
