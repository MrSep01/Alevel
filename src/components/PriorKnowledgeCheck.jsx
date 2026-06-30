import { useLocalStorage } from '../utils/useLocalStorage.js'

export default function PriorKnowledgeCheck({ topicId, checks = [] }) {
  const [completed, setCompleted] = useLocalStorage(`prior-${topicId}`, {})

  function toggle(index) {
    setCompleted({ ...completed, [index]: !completed[index] })
  }

  const completeCount = checks.filter((_, index) => completed[index]).length

  return (
    <section className="panel">
      <p className="eyebrow">Start Here</p>
      <h3>Prior Knowledge Check</h3>
      <p>{completeCount}/{checks.length} checks completed.</p>

      <ul className="check-list">
        {checks.map((item, index) => (
          <li key={item} className="check-item">
            <input
              type="checkbox"
              checked={Boolean(completed[index])}
              onChange={() => toggle(index)}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
