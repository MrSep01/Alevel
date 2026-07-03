export default function VocabularyList({ terms = [] }) {
  return (
    <section className="panel">
      <p className="eyebrow">Language</p>
      <h3>Vocabulary List</h3>
      <ul className="clean-list">
        {terms.map(term => (
          <li key={term.term}>
            <strong>{term.term}</strong>
            <p>{term.definition}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
