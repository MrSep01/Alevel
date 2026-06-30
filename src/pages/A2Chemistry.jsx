import TopicCard from '../components/TopicCard.jsx'
import { a2Topics } from '../data/topics.js'

export default function A2Chemistry({ navigate }) {
  return (
    <div className="page">
      <div className="section-header">
        <div>
          <p className="eyebrow">A2 Chemistry</p>
          <h1>A2 Chemistry Topic Pathway</h1>
          <p>Advanced A Level chemistry topics with space for calculations, simulations, and exam practice.</p>
        </div>
      </div>

      <section className="grid-3">
        {a2Topics.map(topic => (
          <TopicCard key={topic.id} topic={topic} navigate={navigate} />
        ))}
      </section>
    </div>
  )
}
