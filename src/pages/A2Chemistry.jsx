import TopicCard from '../components/TopicCard.jsx'
import { a2Topics } from '../data/topics.js'

export default function A2Chemistry({ navigate }) {
  return (
    <div className="page">
      <div className="section-header">
        <div>
          <p className="eyebrow">A2 Chemistry</p>
          <h1>A Level Chemistry Topics 23-37</h1>
          <p>Cambridge International A Level Chemistry 9701 extension topics organised by syllabus number, teaching time, and teaching order.</p>
        </div>
      </div>

      <section className="grid-3">
        {a2Topics.map(topic => (
          <TopicCard key={topic.id} topic={topic} navigate={navigate} />
        ))}
      </section>

      <section className="section panel course-practical-panel">
        <p className="eyebrow">Practicals</p>
        <h2>A2 practical skills</h2>
        <p>Review redox titrations, equilibrium, transition metal tests, organic synthesis, and advanced data work.</p>
        <button className="btn primary" type="button" onClick={() => navigate('practicals', 'a2')}>
          Open A2 practicals
        </button>
      </section>
    </div>
  )
}
