import ProgressBar from '../components/ProgressBar.jsx'
import TopicCard from '../components/TopicCard.jsx'
import { asTopics } from '../data/topics.js'

export default function Home({ navigate }) {
  const featuredTopics = asTopics.slice(0, 3)

  return (
    <div className="page">
      <section className="hero-grid">
        <div className="hero">
          <p className="eyebrow">Interactive Chemistry Learning App</p>
          <h1>A Level Chemistry that students can explore, practise, and master.</h1>
          <p>
            A React starter for a chemistry learning platform with topic pathways,
            quizzes, flashcards, calculators, prior knowledge checks, and exam-focused learning.
          </p>

          <div className="action-row">
            <button className="btn primary" onClick={() => navigate('as')}>Start AS Chemistry</button>
            <button className="btn" onClick={() => navigate('tools')}>Open Interactive Tools</button>
          </div>
        </div>

        <aside className="dashboard-card">
          <p className="eyebrow">Dashboard Preview</p>
          <h3>Student Progress</h3>
          <div className="stat-list">
            <ProgressBar label="Physical Chemistry" value={38} />
            <ProgressBar label="Inorganic Chemistry" value={22} />
            <ProgressBar label="Organic Chemistry" value={18} />
            <ProgressBar label="Practical Skills" value={30} />
          </div>
        </aside>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Continue Learning</p>
            <h2>Featured topics</h2>
          </div>
          <button className="btn" onClick={() => navigate('as')}>View all AS topics</button>
        </div>

        <div className="grid-3">
          {featuredTopics.map(topic => (
            <TopicCard key={topic.id} topic={topic} navigate={navigate} />
          ))}
        </div>
      </section>

      <section className="section grid-3">
        <article className="card">
          <p className="eyebrow">For Students</p>
          <h3>Guided learning</h3>
          <p>Each topic uses prior knowledge, vocabulary, worked examples, practice, and instant feedback.</p>
        </article>
        <article className="card">
          <p className="eyebrow">For Teachers</p>
          <h3>Class-ready structure</h3>
          <p>Use the app for starter tasks, live modelling, revision stations, and practical skill preparation.</p>
        </article>
        <article className="card">
          <p className="eyebrow">For Development</p>
          <h3>Expandable codebase</h3>
          <p>Data-driven topics and reusable React components make it easier to add more content later.</p>
        </article>
      </section>
    </div>
  )
}
