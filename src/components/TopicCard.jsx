import ProgressBar from './ProgressBar.jsx'

export default function TopicCard({ topic, navigate }) {
  return (
    <article className="topic-card">
      <p className="eyebrow">{topic.level} • {topic.unit}</p>
      <h3>{topic.title}</h3>

      <div className="topic-meta">
        <span className="badge">{topic.difficulty}</span>
        <span className="badge">{topic.lessons} lessons</span>
        <span className="badge">{topic.vocabulary.length} key terms</span>
      </div>

      <p>{topic.description}</p>
      <ProgressBar label="Topic progress" value={topic.progress} />
      <button className="btn primary" onClick={() => navigate('topic', topic.id)}>
        Open topic
      </button>
    </article>
  )
}
