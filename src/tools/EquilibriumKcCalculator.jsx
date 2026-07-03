import { useMemo, useState } from 'react'

export default function EquilibriumKcCalculator() {
  const [a, setA] = useState('0.20')
  const [b, setB] = useState('0.20')
  const [c, setC] = useState('0.40')
  const [d, setD] = useState('0.10')
  const [aPower, setAPower] = useState('1')
  const [bPower, setBPower] = useState('1')
  const [cPower, setCPower] = useState('1')
  const [dPower, setDPower] = useState('1')

  const kc = useMemo(() => {
    const values = [a, b, c, d, aPower, bPower, cPower, dPower].map(Number)
    if (values.some(value => !Number.isFinite(value) || value <= 0)) return null
    return (Number(c) ** Number(cPower) * Number(d) ** Number(dPower)) / (Number(a) ** Number(aPower) * Number(b) ** Number(bPower))
  }, [a, aPower, b, bPower, c, cPower, d, dPower])

  return (
    <section className="calculator-app">
      <div className="calculator-topline"><p className="eyebrow">Kc calculator</p><span className="calculator-badge">products / reactants</span></div>
      <div className="tool-summary-grid">
        {[
          ['[A]', a, setA, aPower, setAPower],
          ['[B]', b, setB, bPower, setBPower],
          ['[C]', c, setC, cPower, setCPower],
          ['[D]', d, setD, dPower, setDPower],
        ].map(([label, value, setValue, power, setPower]) => (
          <article key={label}>
            <span>{label}</span>
            <label className="calculator-field"><span>Concentration</span><div><input type="number" step="any" value={value} onChange={event => setValue(event.target.value)} /><b>mol dm⁻³</b></div></label>
            <label className="calculator-field"><span>Power</span><div><input type="number" step="any" value={power} onChange={event => setPower(event.target.value)} /><b>coeff.</b></div></label>
          </article>
        ))}
      </div>
      <div className="calculator-display compact-display"><span>Kc</span><strong>{kc ? kc.toPrecision(3) : 'Check values'}</strong><small>Kc = [C]ᶜ[D]ᵈ / [A]ᵃ[B]ᵇ</small></div>
    </section>
  )
}
