import TopicCard from '../components/TopicCard.jsx'
import { asTopics } from '../data/topics.js'

export default function ASChemistry({ navigate }) {
  return (
    <div className="page">
      <div className="section-header">
        <div>
          <p className="eyebrow">AS Chemistry</p>
          <h1>AS Chemistry Topics 1-22</h1>
          <p>Cambridge International AS Level Chemistry 9701 topics organised by syllabus number, teaching time, and teaching order.</p>
        </div>
      </div>

      <section className="grid-3">
        {asTopics.map(topic => (
          <TopicCard key={topic.id} topic={topic} navigate={navigate} />
        ))}
      </section>

      <section className="section panel course-practical-panel">
        <p className="eyebrow">Practicals</p>
        <h2>AS practical skills</h2>
        <p>Review titrations, calorimetry, rates, qualitative analysis, organic tests, and uncertainty handling.</p>
        <button className="btn primary" type="button" onClick={() => navigate('practicals', 'as')}>
          Open AS practicals
        </button>
      </section>
    </div>
  )
}
