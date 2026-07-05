import { useMemo, useState } from 'react'

export default function GasVolumeCalculator() {
  const [moles, setMoles] = useState('0.250')
  const [molarVolume, setMolarVolume] = useState('24.0')
  const [ratio, setRatio] = useState('1')

  const volume = useMemo(() => {
    const values = [moles, molarVolume, ratio].map(Number)
    if (values.some(value => !Number.isFinite(value) || value <= 0)) return null
    return Number(moles) * Number(molarVolume) * Number(ratio)
  }, [molarVolume, moles, ratio])

  const answer = volume ? `${volume.toPrecision(3)} dm³` : 'Check values'

  return (
    <section className="calculator-app">
      <div className="calculator-topline"><p className="eyebrow">Gas volume calculator</p><span className="calculator-badge">V = n × molar volume</span></div>
      <div className="calculator-body">
        <div className="calculator-input-panel">
          <label className="calculator-field"><span>Moles</span><div><input type="number" step="any" value={moles} onChange={event => setMoles(event.target.value)} /><b>mol</b></div></label>
          <label className="calculator-field"><span>Molar gas volume</span><div><input type="number" step="any" value={molarVolume} onChange={event => setMolarVolume(event.target.value)} /><b>dm³ mol⁻¹</b></div></label>
          <label className="calculator-field"><span>Equation ratio multiplier</span><div><input type="number" step="any" value={ratio} onChange={event => setRatio(event.target.value)} /><b>ratio</b></div></label>
        </div>
        <div className="calculator-display"><span>Gas volume</span><strong>{answer}</strong><small>at selected molar gas volume</small></div>
      </div>

      <div className="tool-logic-grid">
        <article className="tool-logic-card">
          <span>Given</span>
          <strong>{moles} mol, {molarVolume} dm³ mol⁻¹</strong>
          <small>Ratio multiplier: {ratio}</small>
        </article>
        <article className="tool-logic-card">
          <span>Substitution</span>
          <strong>{moles} × {molarVolume} × {ratio}</strong>
          <small>Keep gas volume in dm³ unless asked otherwise.</small>
        </article>
        <article className="tool-logic-card">
          <span>Answer</span>
          <strong>{answer}</strong>
          <small>At the stated molar gas volume.</small>
        </article>
      </div>
    </section>
  )
}
