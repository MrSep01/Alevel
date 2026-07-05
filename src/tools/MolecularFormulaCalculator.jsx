import { useMemo, useState } from 'react'
import { formatFormula, parseSimpleFormula } from './chemistryHelpers.js'

export default function MolecularFormulaCalculator() {
  const [empiricalFormula, setEmpiricalFormula] = useState('CH2O')
  const [molecularMass, setMolecularMass] = useState('180')

  const result = useMemo(() => {
    const empirical = parseSimpleFormula(empiricalFormula)
    if (!empirical || empirical.error || Number(molecularMass) <= 0) return { error: empirical?.error || 'Enter valid values.' }
    const multiplier = Math.round(Number(molecularMass) / empirical.mr)
    const molecularFormula = Object.entries(empirical.counts)
      .map(([symbol, count]) => `${symbol}${count * multiplier > 1 ? count * multiplier : ''}`)
      .join('')
    return { empiricalMr: empirical.mr, multiplier, molecularFormula }
  }, [empiricalFormula, molecularMass])

  return (
    <section className="calculator-app">
      <div className="calculator-topline">
        <p className="eyebrow">Molecular formula calculator</p>
        <span className="calculator-badge">Mᵣ ÷ empirical Mᵣ</span>
      </div>

      <div className="calculator-body">
        <div className="calculator-input-panel">
          <label className="calculator-field">
            <span>Empirical formula</span>
            <div>
              <input value={empiricalFormula} onChange={event => setEmpiricalFormula(event.target.value)} />
              <b>EF</b>
            </div>
          </label>
          <label className="calculator-field">
            <span>Relative molecular mass</span>
            <div>
              <input type="number" step="any" value={molecularMass} onChange={event => setMolecularMass(event.target.value)} />
              <b>Mᵣ</b>
            </div>
          </label>
        </div>

        <div className="calculator-display">
          <span>Molecular formula</span>
          <strong>{result.error ? 'Check values' : formatFormula(result.molecularFormula)}</strong>
          <small>{result.error || `Empirical Mᵣ = ${result.empiricalMr.toFixed(1)}, multiplier = ${result.multiplier}`}</small>
        </div>
      </div>

      <div className="tool-logic-grid">
        <article className="tool-logic-card">
          <span>1. Empirical Mᵣ</span>
          <strong>{result.error ? 'Check formula' : result.empiricalMr.toFixed(1)}</strong>
          <small>Add the relative atomic masses in the empirical formula.</small>
        </article>
        <article className="tool-logic-card">
          <span>2. Multiplier</span>
          <strong>{result.error ? 'Check values' : `${molecularMass} ÷ ${result.empiricalMr.toFixed(1)} = ${result.multiplier}`}</strong>
          <small>The multiplier should be a whole number.</small>
        </article>
        <article className="tool-logic-card">
          <span>3. Molecular formula</span>
          <strong>{result.error ? 'Check values' : formatFormula(result.molecularFormula)}</strong>
          <small>Multiply every empirical subscript by the multiplier.</small>
        </article>
      </div>
    </section>
  )
}
