import { useMemo, useState } from 'react'

export default function MoleCalculator() {
  const [mass, setMass] = useState('10.0')
  const [molarMass, setMolarMass] = useState('40.0')

  const moles = useMemo(() => {
    const m = Number(mass)
    const mr = Number(molarMass)
    if (!m || !mr || mr <= 0) return null
    return m / mr
  }, [mass, molarMass])

  return (
    <section className="tool-card">
      <p className="eyebrow">Calculator</p>
      <h3>Mole Calculator</h3>
      <p>Use mass and molar mass to calculate amount of substance.</p>

      <div className="input-grid">
        <div className="field">
          <label>Mass / g</label>
          <input type="number" step="any" value={mass} onChange={event => setMass(event.target.value)} />
        </div>
        <div className="field">
          <label>Molar mass / g mol⁻¹</label>
          <input type="number" step="any" value={molarMass} onChange={event => setMolarMass(event.target.value)} />
        </div>
      </div>

      <div className="result-box">
        {moles === null ? 'Enter valid values.' : `Amount of substance = ${moles.toPrecision(3)} mol`}
      </div>
    </section>
  )
}
