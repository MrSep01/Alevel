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

  return (
    <section className="calculator-app">
      <div className="calculator-topline"><p className="eyebrow">Gas volume calculator</p><span className="calculator-badge">V = n × molar volume</span></div>
      <div className="calculator-body">
        <div className="calculator-input-panel">
          <label className="calculator-field"><span>Amount</span><div><input type="number" step="any" value={moles} onChange={event => setMoles(event.target.value)} /><b>mol</b></div></label>
          <label className="calculator-field"><span>Molar gas volume</span><div><input type="number" step="any" value={molarVolume} onChange={event => setMolarVolume(event.target.value)} /><b>dm³ mol⁻¹</b></div></label>
          <label className="calculator-field"><span>Equation ratio multiplier</span><div><input type="number" step="any" value={ratio} onChange={event => setRatio(event.target.value)} /><b>ratio</b></div></label>
        </div>
        <div className="calculator-display"><span>Gas volume</span><strong>{volume ? volume.toPrecision(3) : 'Check values'}</strong><small>dm³</small></div>
      </div>
    </section>
  )
}
