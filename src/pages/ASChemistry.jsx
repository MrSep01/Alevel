import TopicCard from '../components/TopicCard.jsx'
import { asTopics } from '../data/topics.js'

export default function ASChemistry({ navigate }) {
  return (
    <div className="page">
      <div className="section-header">
        <div>
          <p className="eyebrow">AS Chemistry</p>
          <h1>AS Chemistry Topic Pathway</h1>
          <p>Foundation and core AS topics organised as interactive topic cards.</p>
        </div>
      </div>

      <section className="grid-3">
        {asTopics.map(topic => (
          <TopicCard key={topic.id} topic={topic} navigate={navigate} />
        ))}
      </section>
    </div>
  )
}
