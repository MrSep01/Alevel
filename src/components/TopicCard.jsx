import ProgressBar from './ProgressBar.jsx'

export default function TopicCard({ topic, navigate }) {
  const displayTitle = topic.syllabusNumber ? `${topic.syllabusNumber} ${topic.title}` : topic.title
  const timeLabel = topic.teachingTimeLabel || `${topic.lessons} lessons`
  const orderLabel = topic.teachingOrderLabel || `${topic.vocabulary.length} key terms`

  return (
    <article className="topic-card">
      <p className="eyebrow">{topic.level} • {topic.unit}</p>
      <h3>{displayTitle}</h3>

      <div className="topic-meta">
        <span className="badge">{topic.difficulty}</span>
        <span className="badge">{timeLabel}</span>
        <span className="badge">{orderLabel}</span>
      </div>

      <p>{topic.description}</p>
      <ProgressBar label="Topic progress" value={topic.progress} />
      <button className="btn primary" onClick={() => navigate('topic', topic.id)}>
        Open topic
      </button>
    </article>
  )
}
