import { useMemo, useState } from 'react'
import CalculatedValue from './CalculatedValue.jsx'
import FormulaStrip from './FormulaStrip.jsx'

function toSuperscript(value) {
  const map = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '.': '·' }
  return String(value).split('').map(character => map[character] || character).join('')
}

function formatPowerTerm(value, power) {
  return `${value}${power === '1' ? '' : toSuperscript(power)}`
}

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

  const numerator = Number(c) ** Number(cPower) * Number(d) ** Number(dPower)
  const denominator = Number(a) ** Number(aPower) * Number(b) ** Number(bPower)
  const hasValidValues = kc !== null && Number.isFinite(numerator) && Number.isFinite(denominator)

  return (
    <section className="calculator-app">
      <div className="calculator-topline"><p className="eyebrow">Kc calculator</p><span className="calculator-badge">products ÷ reactants</span></div>
      <FormulaStrip items={[
        { label: 'Formula', value: 'Kc = [C]ᶜ[D]ᵈ ÷ [A]ᵃ[B]ᵇ', tone: 'formula' },
        { label: 'Products', value: `[C]${cPower === '1' ? '' : toSuperscript(cPower)} × [D]${dPower === '1' ? '' : toSuperscript(dPower)}`, tone: 'conversion' },
        { label: 'Reactants', value: `[A]${aPower === '1' ? '' : toSuperscript(aPower)} × [B]${bPower === '1' ? '' : toSuperscript(bPower)}`, tone: 'substitution' },
      ]} />
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
      <div className="calculator-display compact-display">
        <span>Kc</span>
        <CalculatedValue value={kc} sigFigs={3} />
      </div>
      <div className="tool-logic-grid">
        <article className="tool-logic-card">
          <span>Products</span>
          <strong>[C]{cPower === '1' ? '' : toSuperscript(cPower)} × [D]{dPower === '1' ? '' : toSuperscript(dPower)}</strong>
          <small>{hasValidValues ? `${formatPowerTerm(c, cPower)} × ${formatPowerTerm(d, dPower)} = ${numerator.toPrecision(3)}` : 'Use equilibrium concentrations.'}</small>
        </article>
        <article className="tool-logic-card">
          <span>Reactants</span>
          <strong>[A]{aPower === '1' ? '' : toSuperscript(aPower)} × [B]{bPower === '1' ? '' : toSuperscript(bPower)}</strong>
          <small>{hasValidValues ? `${formatPowerTerm(a, aPower)} × ${formatPowerTerm(b, bPower)} = ${denominator.toPrecision(3)}` : 'Solids and liquids are omitted.'}</small>
        </article>
        <article className="tool-logic-card">
          <span>Ratio</span>
          <strong>{hasValidValues ? `${numerator.toPrecision(3)} ÷ ${denominator.toPrecision(3)}` : 'Check values'}</strong>
          <small>Use the powers from the balanced equation.</small>
        </article>
      </div>
    </section>
  )
}
