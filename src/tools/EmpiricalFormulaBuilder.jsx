import { useMemo, useState } from 'react'
import { atomicMasses, formatFormula, gcd } from './chemistryHelpers.js'

const defaultRows = [
  { id: 'C', symbol: 'C', mass: '40.0' },
  { id: 'H', symbol: 'H', mass: '6.7' },
  { id: 'O', symbol: 'O', mass: '53.3' },
]

function simplifyRatio(values) {
  const smallest = Math.min(...values.filter(value => value > 0))
  const raw = values.map(value => value / smallest)
  const rounded = raw.map(value => {
    const candidates = [1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6]
    return candidates.find(candidate => Math.abs(value - candidate) < 0.08) || Number(value.toFixed(2))
  })
  const multiplier = rounded.some(value => Math.abs(value % 1) > 0.05) ? 2 : 1
  const whole = rounded.map(value => Math.round(value * multiplier))
  const divisor = whole.reduce((current, value) => gcd(current, value))
  return whole.map(value => value / divisor)
}

export default function EmpiricalFormulaBuilder() {
  const [rows, setRows] = useState(defaultRows)

  const result = useMemo(() => {
    const usableRows = rows.filter(row => row.symbol && Number(row.mass) > 0 && atomicMasses[row.symbol])
    if (usableRows.length === 0) return null
    const moles = usableRows.map(row => Number(row.mass) / atomicMasses[row.symbol])
    const ratio = simplifyRatio(moles)
    const formula = usableRows.map((row, index) => `${row.symbol}${ratio[index] > 1 ? ratio[index] : ''}`).join('')
    return { usableRows, moles, ratio, formula }
  }, [rows])

  function updateRow(id, field, value) {
    setRows(previous => previous.map(row => row.id === id ? { ...row, [field]: value } : row))
  }

  return (
    <section className="calculator-app">
      <div className="calculator-topline">
        <p className="eyebrow">Empirical formula builder</p>
        <span className="calculator-badge">mass → mol → ratio</span>
      </div>

      <div className="rate-table">
        <div className="rate-row empirical-row header">
          <span>Element</span>
          <span>Mass or %</span>
          <span>Aᵣ</span>
        </div>
        {rows.map(row => (
          <div className="rate-row empirical-row" key={row.id}>
            <input value={row.symbol} onChange={event => updateRow(row.id, 'symbol', event.target.value.trim())} />
            <input type="number" step="any" value={row.mass} onChange={event => updateRow(row.id, 'mass', event.target.value)} />
            <strong>{atomicMasses[row.symbol] || 'Unknown'}</strong>
          </div>
        ))}
      </div>

      <div className="calculator-display compact-display">
        <span>Empirical formula</span>
        <strong>{result ? formatFormula(result.formula) : 'Enter data'}</strong>
        <small>{result ? 'Ratio: ' + result.ratio.join(' : ') : 'Use masses or percentages. Percentages work as a 100 g sample.'}</small>
      </div>

      {result && (
        <div className="tool-logic-grid">
          {result.usableRows.map((row, index) => (
            <article className="tool-logic-card" key={row.symbol}>
              <span>{row.symbol}</span>
              <strong>{Number(result.moles[index]).toPrecision(3)} mol</strong>
              <small>{row.mass} ÷ {atomicMasses[row.symbol]}</small>
            </article>
          ))}
          <article className="tool-logic-card">
            <span>Simplest ratio</span>
            <strong>{result.ratio.join(' : ')}</strong>
            <small>Divide every mole value by the smallest mole value.</small>
          </article>
        </div>
      )}
    </section>
  )
}
