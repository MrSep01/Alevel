import { useMemo, useState } from 'react'

const atomicMasses = {
  H: 1.0,
  C: 12.0,
  N: 14.0,
  O: 16.0,
  Na: 23.0,
  Mg: 24.3,
  Al: 27.0,
  S: 32.1,
  Cl: 35.5,
  K: 39.1,
  Ca: 40.1,
  Fe: 55.8,
  Cu: 63.5
}

function parseSimpleFormula(formula) {
  const matches = formula.match(/([A-Z][a-z]?)(\d*)/g)
  if (!matches) return null

  let total = 0
  const parts = []

  for (const match of matches) {
    const [, symbol, countText] = match.match(/([A-Z][a-z]?)(\d*)/)
    const count = countText ? Number(countText) : 1
    const mass = atomicMasses[symbol]

    if (!mass) {
      return { error: `Element ${symbol} is not in the starter mass table yet.` }
    }

    total += mass * count
    parts.push(`${symbol}${count > 1 ? count : ''}: ${mass} × ${count}`)
  }

  return { total, parts }
}

export default function FormulaMassCalculator() {
  const [formula, setFormula] = useState('CaCO3')

  const result = useMemo(() => parseSimpleFormula(formula.trim()), [formula])

  return (
    <section className="tool-card">
      <p className="eyebrow">Calculator</p>
      <h3>Formula Mass Calculator</h3>
      <p>Starter parser for simple formulae without brackets, hydrates, or charges.</p>

      <div className="field">
        <label>Formula</label>
        <input value={formula} onChange={event => setFormula(event.target.value)} />
      </div>

      <div className="result-box">
        {!result ? 'Enter a formula.' : result.error ? result.error : `Mr = ${result.total.toPrecision(3)}`}
      </div>

      {result?.parts && (
        <ul className="clean-list">
          {result.parts.map(part => <li key={part}>{part}</li>)}
        </ul>
      )}
    </section>
  )
}
