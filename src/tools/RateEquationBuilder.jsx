import { useMemo, useState } from 'react'
import FormulaStrip from './FormulaStrip.jsx'

const defaultRows = [
  { id: '1', a: '0.100', b: '0.100', rate: '2.40e-4' },
  { id: '2', a: '0.200', b: '0.100', rate: '9.60e-4' },
  { id: '3', a: '0.100', b: '0.200', rate: '4.80e-4' },
]

function toSuperscript(value) {
  const map = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }
  return String(value).split('').map(character => map[character] || character).join('')
}

function formatScientific(value, places = 3) {
  if (!Number.isFinite(value)) return 'Check data'
  const text = value.toExponential(places - 1)
  const [coefficient, exponent] = text.split('e')
  return `${Number(coefficient).toPrecision(places)} × 10${toSuperscript(Number(exponent))}`
}

function inferOrder(first, second, fixedKey, changingKey) {
  const firstFixed = Number(first[fixedKey])
  const secondFixed = Number(second[fixedKey])
  const firstChanging = Number(first[changingKey])
  const secondChanging = Number(second[changingKey])
  const firstRate = Number(first.rate)
  const secondRate = Number(second.rate)

  if ([firstFixed, secondFixed, firstChanging, secondChanging, firstRate, secondRate].some(value => !Number.isFinite(value) || value <= 0)) return null
  if (Math.abs(firstFixed - secondFixed) > 1e-9) return null
  if (Math.abs(firstChanging - secondChanging) < 1e-9) return null

  const rawOrder = Math.log(secondRate / firstRate) / Math.log(secondChanging / firstChanging)
  const rounded = Math.round(rawOrder)

  return {
    raw: rawOrder,
    order: Math.abs(rawOrder - rounded) < 0.08 ? rounded : Number(rawOrder.toFixed(2)),
    comparison: `${secondRate / firstRate} rate change ÷ ${secondChanging / firstChanging} concentration change`,
  }
}

function findOrder(rows, targetKey, fixedKey) {
  for (let firstIndex = 0; firstIndex < rows.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < rows.length; secondIndex += 1) {
      const order = inferOrder(rows[firstIndex], rows[secondIndex], fixedKey, targetKey)
      if (order) return order
    }
  }
  return null
}

export default function RateEquationBuilder() {
  const [rows, setRows] = useState(defaultRows)
  const [predictA, setPredictA] = useState('0.150')
  const [predictB, setPredictB] = useState('0.120')

  const analysis = useMemo(() => {
    const orderA = findOrder(rows, 'a', 'b')
    const orderB = findOrder(rows, 'b', 'a')

    if (!orderA || !orderB) {
      return { error: 'Enter experiments where only one concentration changes at a time.' }
    }

    const firstValidRow = rows.find(row => Number(row.a) > 0 && Number(row.b) > 0 && Number(row.rate) > 0)
    if (!firstValidRow) return { error: 'Enter positive concentrations and rates.' }

    const k = Number(firstValidRow.rate) / ((Number(firstValidRow.a) ** orderA.order) * (Number(firstValidRow.b) ** orderB.order))
    const predictedRate = k * (Number(predictA) ** orderA.order) * (Number(predictB) ** orderB.order)

    return { orderA, orderB, k, predictedRate }
  }, [predictA, predictB, rows])

  function updateRow(rowId, field, value) {
    setRows(previous => previous.map(row => row.id === rowId ? { ...row, [field]: value } : row))
  }

  return (
    <section className="calculator-app">
      <div className="calculator-topline">
        <div>
          <p className="eyebrow">Rate equation builder</p>
        </div>
        <span className="calculator-badge">rate = k[A]ᵐ[B]ⁿ</span>
      </div>

      <FormulaStrip items={[
        { label: 'Rate equation', value: analysis.error ? 'rate = k[A]ᵐ[B]ⁿ' : `rate = k[A]${toSuperscript(analysis.orderA.order)}[B]${toSuperscript(analysis.orderB.order)}`, tone: 'formula' },
        { label: 'Order logic', value: 'order = log(rate change) ÷ log(concentration change)', tone: 'conversion' },
        { label: 'Prediction', value: analysis.error ? analysis.error : `${formatScientific(analysis.k)} × ${predictA}${toSuperscript(analysis.orderA.order)} × ${predictB}${toSuperscript(analysis.orderB.order)}`, tone: 'substitution' },
      ]} />

      <div className="rate-table">
        <div className="rate-row header">
          <span>Experiment</span>
          <span>[A] / mol dm⁻³</span>
          <span>[B] / mol dm⁻³</span>
          <span>Initial rate / mol dm⁻³ s⁻¹</span>
        </div>
        {rows.map((row, index) => (
          <div className="rate-row" key={row.id}>
            <strong>{index + 1}</strong>
            <input type="number" step="any" value={row.a} onChange={event => updateRow(row.id, 'a', event.target.value)} />
            <input type="number" step="any" value={row.b} onChange={event => updateRow(row.id, 'b', event.target.value)} />
            <input type="text" value={row.rate} onChange={event => updateRow(row.id, 'rate', event.target.value)} />
          </div>
        ))}
      </div>

      <div className="tool-summary-grid">
        <article>
          <span>Order with respect to A</span>
          <strong>{analysis.error ? 'Check data' : analysis.orderA.order}</strong>
          {!analysis.error && <small>{analysis.orderA.comparison}</small>}
        </article>
        <article>
          <span>Order with respect to B</span>
          <strong>{analysis.error ? 'Check data' : analysis.orderB.order}</strong>
          {!analysis.error && <small>{analysis.orderB.comparison}</small>}
        </article>
        <article>
          <span>Rate constant</span>
          <strong>{analysis.error ? analysis.error : formatScientific(analysis.k)}</strong>
        </article>
      </div>

      {!analysis.error && (
        <>
          <div className="calculator-display compact-display">
            <span>Rate equation</span>
            <strong>rate = k[A]{toSuperscript(analysis.orderA.order)}[B]{toSuperscript(analysis.orderB.order)}</strong>
            <small>Use k = {formatScientific(analysis.k)} with consistent units.</small>
          </div>

          <div className="calculator-body">
            <div className="calculator-input-panel">
              <label className="calculator-field">
                <span>Predict [A]</span>
                <div>
                  <input type="number" step="any" value={predictA} onChange={event => setPredictA(event.target.value)} />
                  <b>mol dm⁻³</b>
                </div>
              </label>
              <label className="calculator-field">
                <span>Predict [B]</span>
                <div>
                  <input type="number" step="any" value={predictB} onChange={event => setPredictB(event.target.value)} />
                  <b>mol dm⁻³</b>
                </div>
              </label>
            </div>
            <div className="calculator-display">
              <span>Predicted rate</span>
              <strong>{formatScientific(analysis.predictedRate)}</strong>
              <small>Calculated from the derived rate equation.</small>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
