import { useMemo, useState } from 'react'

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

  return (
    <section className="calculator-app">
      <div className="calculator-topline"><p className="eyebrow">Percentage yield and atom economy</p><span className="calculator-badge">green chemistry</span></div>
      <div className="tool-summary-grid">
        <article><span>Actual yield</span><label className="calculator-field"><div><input type="number" step="any" value={actualYield} onChange={event => setActualYield(event.target.value)} /><b>g</b></div></label></article>
        <article><span>Theoretical yield</span><label className="calculator-field"><div><input type="number" step="any" value={theoreticalYield} onChange={event => setTheoreticalYield(event.target.value)} /><b>g</b></div></label></article>
        <article><span>Desired product Mᵣ</span><label className="calculator-field"><div><input type="number" step="any" value={desiredMr} onChange={event => setDesiredMr(event.target.value)} /><b>Mᵣ</b></div></label></article>
        <article><span>Total reactant Mᵣ</span><label className="calculator-field"><div><input type="number" step="any" value={totalReactantMr} onChange={event => setTotalReactantMr(event.target.value)} /><b>Mᵣ</b></div></label></article>
      </div>
      <div className="tool-summary-grid">
        <article><span>Percentage yield</span><strong>{result.percentageYield ? `${result.percentageYield.toFixed(1)}%` : 'Check values'}</strong></article>
        <article><span>Atom economy</span><strong>{result.atomEconomy ? `${result.atomEconomy.toFixed(1)}%` : 'Check values'}</strong></article>
      </div>
    </section>
  )
}
