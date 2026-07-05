import { useMemo, useState } from 'react'
import CalculatedValue from './CalculatedValue.jsx'
import FormulaStrip from './FormulaStrip.jsx'
import { formatFormula } from './chemistryHelpers.js'

const exampleReaction = {
  reactants: [
    { name: 'Ethanoic acid', formula: 'CH3COOH', mr: '60.0' },
    { name: 'Ethanol', formula: 'C2H5OH', mr: '46.0' },
  ],
  usefulProduct: { name: 'Ethyl ethanoate', formula: 'CH3COOC2H5', mr: '88.0' },
  byProduct: { name: 'Water', formula: 'H2O', mr: '18.0' },
}

function readNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function formatPercent(value) {
  return Number.isFinite(Number(value)) ? `${Number(value).toPrecision(3)}%` : 'Check values'
}

function FormulaPill({ label, formula, tone = 'neutral', mr }) {
  return (
    <article className={`yield-formula-pill ${tone}`}>
      <span>{label}</span>
      <strong>{formatFormula(formula)}</strong>
      {mr && <small>Mᵣ {mr}</small>}
    </article>
  )
}

export default function YieldEconomyCalculator() {
  const [actualYield, setActualYield] = useState('9.80')
  const [theoreticalYield, setTheoreticalYield] = useState('12.5')
  const [desiredMr, setDesiredMr] = useState('88.0')
  const [totalReactantMr, setTotalReactantMr] = useState('106.0')

  const result = useMemo(() => {
    const actual = readNumber(actualYield)
    const theoretical = readNumber(theoreticalYield)
    const desired = readNumber(desiredMr)
    const total = readNumber(totalReactantMr)

    return {
      percentageYield: actual !== null && actual >= 0 && theoretical > 0 ? (actual / theoretical) * 100 : null,
      atomEconomy: desired > 0 && total > 0 ? (desired / total) * 100 : null,
      atomEconomyTooHigh: desired > total,
    }
  }, [actualYield, desiredMr, theoreticalYield, totalReactantMr])

  const reactionText = `${formatFormula('CH3COOH')} + ${formatFormula('C2H5OH')} → ${formatFormula('CH3COOC2H5')} + ${formatFormula('H2O')}`

  return (
    <section className="calculator-app yield-economy-tool-app">
      <div className="calculator-topline">
        <div>
          <p className="eyebrow">Percentage yield and atom economy</p>
          <h2>Compare practical yield with green chemistry efficiency.</h2>
        </div>
        <span className="calculator-badge">Worked example: esterification</span>
      </div>

      <FormulaStrip items={[
        { label: 'Percentage yield', value: 'actual yield ÷ theoretical yield × 100', tone: 'formula' },
        { label: 'Atom economy', value: 'useful product Mᵣ ÷ total reactants Mᵣ × 100', tone: 'conversion' },
        { label: 'Example reaction', value: reactionText, tone: 'substitution yield-reaction-formula' },
      ]} />

      <div className="yield-reaction-panel" aria-label="Example reaction">
        <div className="yield-reaction-heading">
          <span>Balanced reaction</span>
          <strong>{reactionText}</strong>
        </div>
        <div className="yield-reaction-flow">
          <div className="yield-reaction-group">
            <FormulaPill label="Reactant" formula={exampleReaction.reactants[0].formula} mr={exampleReaction.reactants[0].mr} tone="reactant" />
            <FormulaPill label="Reactant" formula={exampleReaction.reactants[1].formula} mr={exampleReaction.reactants[1].mr} tone="reactant" />
          </div>
          <span className="yield-arrow">→</span>
          <div className="yield-reaction-group">
            <FormulaPill label="Useful product" formula={exampleReaction.usefulProduct.formula} mr={exampleReaction.usefulProduct.mr} tone="useful" />
            <FormulaPill label="By-product" formula={exampleReaction.byProduct.formula} mr={exampleReaction.byProduct.mr} tone="waste" />
          </div>
        </div>
      </div>

      <div className="yield-two-lane">
        <section className="yield-work-card practical">
          <div className="yield-card-heading">
            <span>1. Percentage yield</span>
            <strong>How much product did the student actually collect?</strong>
          </div>
          <div className="yield-input-grid">
            <label className="calculator-field">
              <span>Actual yield collected</span>
              <div>
                <input type="number" step="any" value={actualYield} onChange={event => setActualYield(event.target.value)} />
                <b>g</b>
              </div>
            </label>
            <label className="calculator-field">
              <span>Theoretical yield</span>
              <div>
                <input type="number" step="any" value={theoreticalYield} onChange={event => setTheoreticalYield(event.target.value)} />
                <b>g</b>
              </div>
            </label>
          </div>
          <div className="yield-route-card">
            <span>Route</span>
            <strong>{actualYield} g ÷ {theoreticalYield} g × 100 = {formatPercent(result.percentageYield)}</strong>
            <small>Use masses of the same product. This tells you how successful the practical preparation was.</small>
          </div>
          <div className="yield-answer-card practical">
            <span>Percentage yield</span>
            <CalculatedValue value={result.percentageYield} sigFigs={3} unit="%" />
          </div>
        </section>

        <section className="yield-work-card economy">
          <div className="yield-card-heading">
            <span>2. Atom economy</span>
            <strong>How much of the reactant mass becomes the useful product?</strong>
          </div>
          <div className="yield-input-grid">
            <label className="calculator-field">
              <span>Useful product Mᵣ</span>
              <div>
                <input type="number" step="any" value={desiredMr} onChange={event => setDesiredMr(event.target.value)} />
                <b>Mᵣ</b>
              </div>
            </label>
            <label className="calculator-field">
              <span>Total reactants Mᵣ</span>
              <div>
                <input type="number" step="any" value={totalReactantMr} onChange={event => setTotalReactantMr(event.target.value)} />
                <b>Mᵣ</b>
              </div>
            </label>
          </div>
          <div className="yield-route-card">
            <span>Route</span>
            <strong>{desiredMr} ÷ {totalReactantMr} × 100 = {formatPercent(result.atomEconomy)}</strong>
            <small>Use formula masses from the balanced equation. By-products lower the atom economy.</small>
          </div>
          {result.atomEconomyTooHigh && (
            <div className="yield-warning">Useful product Mᵣ should not be greater than the total reactants Mᵣ.</div>
          )}
          <div className="yield-answer-card economy">
            <span>Atom economy</span>
            <CalculatedValue value={result.atomEconomy} sigFigs={3} unit="%" />
          </div>
        </section>
      </div>
    </section>
  )
}
