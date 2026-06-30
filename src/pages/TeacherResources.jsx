export default function TeacherResources({ navigate }) {
  const resources = [
    { title: 'Starter Activity Template', type: 'Prior knowledge check' },
    { title: 'Vocabulary Routine', type: 'ELL support' },
    { title: 'Exam Command Word Frame', type: 'Assessment support' },
    { title: 'Practical Skills Checklist', type: 'Lab preparation' }
  ]

  return (
    <div className="page">
      <section className="hero">
        <p className="eyebrow">Teacher Resources</p>
        <h1>Classroom-ready routines and resources.</h1>
        <p>
          This page is designed for lesson launch, revision stations, worksheet links,
          practical checklists, vocabulary routines, and teacher modelling.
        </p>

        <div className="action-row">
          <button className="btn primary" onClick={() => navigate('topic', 'amount-of-substance')}>
            Open sample topic
          </button>
          <button className="btn" onClick={() => navigate('tools')}>
            Open tools
          </button>
        </div>
      </section>

      <section className="section panel">
        <p className="eyebrow">Resource Library</p>
        <h2>Starter resource list</h2>

        <div className="lesson-block">
          {resources.map(resource => (
            <div className="resource-row" key={resource.title}>
              <div>
                <h3>{resource.title}</h3>
                <p>{resource.type}</p>
              </div>
              <button className="btn">Add file later</button>
            </div>
          ))}
        </div>
      </section>

      <section className="section grid-3">
        <article className="card">
          <h3>Design rule</h3>
          <p>Every lesson should include vocabulary, prior knowledge, worked examples, practice, misconception, and exam application.</p>
        </article>
        <article className="card">
          <h3>Student support</h3>
          <p>Use sentence stems, visual models, labelled diagrams, and command-word response frames.</p>
        </article>
        <article className="card">
          <h3>Expansion</h3>
          <p>Later, connect the app to Supabase for accounts, class groups, assignments, and saved analytics.</p>
        </article>
      </section>
    </div>
  )
}
