import TopicCard from '../components/TopicCard.jsx'
import { igcseTopics } from '../data/topics.js'

export default function IGCSEChemistry({ navigate }) {
  return (
    <div className="page">
      <div className="section-header">
        <div>
          <p className="eyebrow">IGCSE Chemistry CIE</p>
          <h1>IGCSE Chemistry CIE Topic Pathway</h1>
          <p>Core and Extended CIE IGCSE chemistry topics organised for structured revision and classroom use.</p>
        </div>
      </div>

      <section className="grid-3">
        {igcseTopics.map(topic => (
          <TopicCard key={topic.id} topic={topic} navigate={navigate} />
        ))}
      </section>

      <section className="section panel course-practical-panel">
        <p className="eyebrow">Practicals</p>
        <h2>IGCSE practical skills</h2>
        <p>Review separation, rates, salts, qualitative analysis, electrolysis observations, and core lab skills.</p>
        <button className="btn primary" type="button" onClick={() => navigate('practicals', 'igcse')}>
          Open IGCSE practicals
        </button>
      </section>
    </div>
  )
}
