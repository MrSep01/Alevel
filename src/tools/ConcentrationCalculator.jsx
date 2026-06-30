import { useMemo, useState } from 'react'

export default function ConcentrationCalculator() {
  const [moles, setMoles] = useState('0.0250')
  const [volumeCm3, setVolumeCm3] = useState('250')

  const concentration = useMemo(() => {
    const n = Number(moles)
    const vCm3 = Number(volumeCm3)
    const vDm3 = vCm3 / 1000
    if (!n || !vCm3 || vDm3 <= 0) return null
    return n / vDm3
  }, [moles, volumeCm3])

  return (
    <section className="tool-card">
      <p className="eyebrow">Calculator</p>
      <h3>Concentration Calculator</h3>
      <p>Calculate concentration in mol dm⁻³. Volume entered in cm³ is converted to dm³.</p>

      <div className="input-grid">
        <div className="field">
          <label>Amount / mol</label>
          <input type="number" step="any" value={moles} onChange={event => setMoles(event.target.value)} />
        </div>
        <div className="field">
          <label>Volume / cm³</label>
          <input type="number" step="any" value={volumeCm3} onChange={event => setVolumeCm3(event.target.value)} />
        </div>
      </div>

      <div className="result-box">
        {concentration === null ? 'Enter valid values.' : `Concentration = ${concentration.toPrecision(3)} mol dm⁻³`}
      </div>
    </section>
  )
}
