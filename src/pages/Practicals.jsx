import { ArrowLeft, ClipboardCheck, FlaskConical, Microscope, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { practicalCurricula, practicalSkillReadiness } from '../data/practicals.js'

const curriculumOrder = ['igcse', 'as', 'a2']

export default function Practicals({ initialLevel = null }) {
  const [selectedLevel, setSelectedLevel] = useState(initialLevel)

  useEffect(() => {
    setSelectedLevel(initialLevel)
  }, [initialLevel])

  const selectedCurriculum = selectedLevel ? practicalCurricula[selectedLevel] : null

  if (selectedCurriculum) {
    return (
      <div className="page">
        <button className="back-button" type="button" onClick={() => setSelectedLevel(null)}>
          <ArrowLeft size={18} /> All practicals
        </button>

        <section className="hero">
          <p className="eyebrow">{selectedCurriculum.label} Practicals</p>
          <h1>{selectedCurriculum.title}</h1>
          <p>{selectedCurriculum.subtitle}</p>
        </section>

        <section className="section">
          <div className="section-header">
            <div>
              <p className="eyebrow">Required practicals</p>
              <h2>Practical routines students should be ready to perform</h2>
            </div>
          </div>
          <div className="grid-3">
            {selectedCurriculum.required.map(practical => (
              <article className="card practical-card" key={practical.title}>
                <p className="eyebrow"><Microscope size={18} /> Required skill</p>
                <h3>{practical.title}</h3>
                <p>{practical.focus}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section panel">
          <p className="eyebrow"><FlaskConical size={18} /> Optional extensions</p>
          <h2>Good next practicals after the core skills</h2>
          <div className="practical-chip-list">
            {selectedCurriculum.optional.map(item => (
              <span className="practical-chip" key={item}>{item}</span>
            ))}
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="page">
      <section className="hero">
        <p className="eyebrow">Practicals</p>
        <h1>Choose a practical pathway before entering the lab.</h1>
        <p>
          Start with the curriculum you are studying, then review the practical skills,
          required routines, optional extensions, and evaluation habits you need for success.
        </p>
      </section>

      <section className="section grid-3">
        {curriculumOrder.map(level => {
          const curriculum = practicalCurricula[level]
          return (
            <button
              className="card practical-pathway-card"
              key={level}
              type="button"
              onClick={() => setSelectedLevel(level)}
            >
              <p className="eyebrow"><Microscope size={18} /> Practical pathway</p>
              <h3>{curriculum.label}</h3>
              <p>{curriculum.subtitle}</p>
              <span>{curriculum.required.length} required skill practicals</span>
            </button>
          )
        })}
      </section>

      <section className="section panel">
        <p className="eyebrow"><ClipboardCheck size={18} /> Required skills before practicals</p>
        <h2>What students need before choosing a specific practical</h2>
        <ol className="clean-list">
          {practicalSkillReadiness.map(skill => (
            <li key={skill}>{skill}</li>
          ))}
        </ol>
      </section>

      <section className="section grid-3">
        <article className="card">
          <p className="eyebrow"><ShieldCheck size={18} /> Safety</p>
          <h3>Risk assessment first</h3>
          <p>Know hazards, exposure routes, precautions, emergency actions, and disposal before touching apparatus.</p>
        </article>
        <article className="card">
          <p className="eyebrow"><FlaskConical size={18} /> Evidence</p>
          <h3>Observations and data</h3>
          <p>Record exact colours, temperatures, volumes, times, masses, units, repeats, and anomalies as you work.</p>
        </article>
        <article className="card">
          <p className="eyebrow"><ClipboardCheck size={18} /> Evaluation</p>
          <h3>Improve the method</h3>
          <p>Connect limitations to specific improvements: precision, control variables, repeats, range, and reliability.</p>
        </article>
      </section>
    </div>
  )
}
