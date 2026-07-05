export default function FormulaStrip({ items = [] }) {
  const visibleItems = items.filter(item => item?.value)

  if (!visibleItems.length) return null

  return (
    <div className="formula-strip" aria-label="Formula and substitution">
      {visibleItems.map(item => (
        <article className={`formula-strip-card ${item.tone || 'formula'}`} key={`${item.label}-${item.value}`}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </article>
      ))}
    </div>
  )
}
