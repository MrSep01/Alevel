import { useMemo, useState } from 'react'
import CalculatedValue from './CalculatedValue.jsx'
import FormulaStrip from './FormulaStrip.jsx'

export default function YieldEconomyCalculator() {
  const [actualYield, setActualYield] = useState('8.20')
  const [theoreticalYield, setTheoreticalYield] = useState('10.0')
  const [desiredMr, setDesiredMr] = useState('46.0')
  const [totalReactantMr, setTotalReactantMr] = useState('74.0')

  const result = useMemo(() => {
    const actual = Number(actualYield)
    const theoretical = Number(theoreticalYield)
    const desired = Number(desiredMr)
    const total = Number(totalReactantMr)
    return {
      percentageYield: theoretical > 0 ? (actual / theoretical) * 100 : null,
      atomEconomy: total > 0 ? (desired / total) * 100 : null,
    }
  }, [actualYield, desiredMr, theoreticalYield, totalReactantMr])

  const percentageYield = result.percentageYield ? `${result.percentageYield.toFixed(1)}%` : 'Check values'
  const atomEconomy = result.atomEconomy ? `${result.atomEconomy.toFixed(1)}%` : 'Check values'

  return (
    <section className="calculator-app">
      <div className="calculator-topline"><p className="eyebrow">Percentage yield and atom economy</p><span className="calculator-badge">green chemistry</span></div>
      <FormulaStrip items={[
        { label: 'Percentage yield', value: 'actual yield ÷ theoretical yield × 100', tone: 'formula' },
        { label: 'Atom economy', value: 'desired product Mᵣ ÷ total reactant Mᵣ × 100', tone: 'conversion' },
        { label: 'Substitution', value: `${actualYield} ÷ ${theoreticalYield} × 100 and ${desiredMr} ÷ ${totalReactantMr} × 100`, tone: 'substitution' },
      ]} />
      <div className="tool-summary-grid">
        <article><span>Actual yield</span><label className="calculator-field"><div><input type="number" step="any" value={actualYield} onChange={event => setActualYield(event.target.value)} /><b>g</b></div></label></article>
        <article><span>Theoretical yield</span><label className="calculator-field"><div><input type="number" step="any" value={theoreticalYield} onChange={event => setTheoreticalYield(event.target.value)} /><b>g</b></div></label></article>
        <article><span>Desired product Mᵣ</span><label className="calculator-field"><div><input type="number" step="any" value={desiredMr} onChange={event => setDesiredMr(event.target.value)} /><b>Mᵣ</b></div></label></article>
        <article><span>Total reactant Mᵣ</span><label className="calculator-field"><div><input type="number" step="any" value={totalReactantMr} onChange={event => setTotalReactantMr(event.target.value)} /><b>Mᵣ</b></div></label></article>
      </div>
      <div className="tool-summary-grid">
        <article><span>Percentage yield</span><CalculatedValue value={result.percentageYield} sigFigs={3} unit="%" /></article>
        <article><span>Atom economy</span><CalculatedValue value={result.atomEconomy} sigFigs={3} unit="%" /></article>
      </div>
      <div className="tool-logic-grid">
        <article className="tool-logic-card">
          <span>Percentage yield route</span>
          <strong>{actualYield} ÷ {theoreticalYield} × 100 = {percentageYield}</strong>
          <small>Compares practical yield with theoretical yield.</small>
        </article>
        <article className="tool-logic-card">
          <span>Atom economy route</span>
          <strong>{desiredMr} ÷ {totalReactantMr} × 100 = {atomEconomy}</strong>
          <small>Compares useful product mass with total reactant mass.</small>
        </article>
      </div>
    </section>
  )
}
