import { useMemo, useState } from 'react'

const modes = [
  { id: 'strong-acid', label: 'Strong acid' },
  { id: 'strong-base', label: 'Strong base' },
  { id: 'weak-acid', label: 'Weak acid' },
  { id: 'buffer', label: 'Buffer' },
]

export default function PHCalculator() {
  const [mode, setMode] = useState('strong-acid')
  const [concentration, setConcentration] = useState('0.100')
  const [ka, setKa] = useState('1.8e-5')
  const [acidMoles, setAcidMoles] = useState('0.0100')
  const [saltMoles, setSaltMoles] = useState('0.0100')

  const result = useMemo(() => {
    const c = Number(concentration)
    if (mode === 'strong-acid' && c > 0) return { pH: -Math.log10(c), working: 'pH = -log₁₀[H⁺]', substitution: `-log₁₀(${concentration})` }
    if (mode === 'strong-base' && c > 0) return { pH: 14 + Math.log10(c), working: 'pOH = -log₁₀[OH⁻], pH = 14 - pOH', substitution: `14 + log₁₀(${concentration})` }
    if (mode === 'weak-acid' && c > 0 && Number(ka) > 0) return { pH: -Math.log10(Math.sqrt(Number(ka) * c)), working: '[H⁺] ≈ √(Kₐ × c)', substitution: `-log₁₀√(${ka} × ${concentration})` }
    if (mode === 'buffer' && Number(ka) > 0 && Number(acidMoles) > 0 && Number(saltMoles) > 0) {
      const pKa = -Math.log10(Number(ka))
      return { pH: pKa + Math.log10(Number(saltMoles) / Number(acidMoles)), working: 'pH = pKₐ + log₁₀(salt / acid)', substitution: `${pKa.toFixed(2)} + log₁₀(${saltMoles} ÷ ${acidMoles})` }
    }
    return null
  }, [acidMoles, concentration, ka, mode, saltMoles])

  return (
    <section className="calculator-app">
      <div className="calculator-topline">
        <p className="eyebrow">pH calculator</p>
        <span className="calculator-badge">acid-base pH</span>
      </div>

      <div className="calculator-mode-grid">
        {modes.map(item => <button className={mode === item.id ? 'active' : ''} key={item.id} onClick={() => setMode(item.id)} type="button">{item.label}</button>)}
      </div>

      <div className="calculator-body">
        <div className="calculator-input-panel">
          {mode !== 'buffer' && <label className="calculator-field"><span>Concentration</span><div><input type="number" step="any" value={concentration} onChange={event => setConcentration(event.target.value)} /><b>mol dm⁻³</b></div></label>}
          {(mode === 'weak-acid' || mode === 'buffer') && <label className="calculator-field"><span>Kₐ</span><div><input type="text" value={ka} onChange={event => setKa(event.target.value)} /><b>Kₐ</b></div></label>}
          {mode === 'buffer' && (
            <>
              <label className="calculator-field"><span>Acid moles</span><div><input type="number" step="any" value={acidMoles} onChange={event => setAcidMoles(event.target.value)} /><b>mol</b></div></label>
              <label className="calculator-field"><span>Salt moles</span><div><input type="number" step="any" value={saltMoles} onChange={event => setSaltMoles(event.target.value)} /><b>mol</b></div></label>
            </>
          )}
        </div>
        <div className="calculator-display">
          <span>pH</span>
          <strong>{result ? result.pH.toFixed(2) : 'Check values'}</strong>
          <small>{result?.working || 'Enter valid positive values.'}</small>
        </div>
      </div>

      <div className="tool-logic-grid">
        <article className="tool-logic-card">
          <span>Model</span>
          <strong>{modes.find(item => item.id === mode)?.label}</strong>
          <small>{result?.working || 'Choose the correct acid-base model first.'}</small>
        </article>
        <article className="tool-logic-card">
          <span>Substitution</span>
          <strong>{result?.substitution || 'Check values'}</strong>
          <small>Keep calculator notation exact before rounding pH.</small>
        </article>
      </div>
    </section>
  )
}
