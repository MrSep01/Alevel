import { useMemo, useState } from 'react'
import CalculatedValue from './CalculatedValue.jsx'
import { formatToSigFigs } from './significantFigures.js'

export default function TitrationSolver() {
  const [knownConcentration, setKnownConcentration] = useState('0.100')
  const [knownVolume, setKnownVolume] = useState('25.00')
  const [unknownVolume, setUnknownVolume] = useState('24.80')
  const [knownRatio, setKnownRatio] = useState('1')
  const [unknownRatio, setUnknownRatio] = useState('1')

  const result = useMemo(() => {
    const cKnown = Number(knownConcentration)
    const vKnown = Number(knownVolume) / 1000
    const vUnknown = Number(unknownVolume) / 1000
    const rKnown = Number(knownRatio)
    const rUnknown = Number(unknownRatio)
    if ([cKnown, vKnown, vUnknown, rKnown, rUnknown].some(value => !Number.isFinite(value) || value <= 0)) return null
    const knownMoles = cKnown * vKnown
    const unknownMoles = knownMoles * (rUnknown / rKnown)
    return { knownMoles, unknownMoles, concentration: unknownMoles / vUnknown }
  }, [knownConcentration, knownRatio, knownVolume, unknownRatio, unknownVolume])

  const answer = result ? `${formatToSigFigs(result.concentration, 3)} mol dm⁻³` : 'Check values'

  return (
    <section className="calculator-app">
      <div className="calculator-topline">
        <p className="eyebrow">Titration calculation solver</p>
        <span className="calculator-badge">cV ratio</span>
      </div>

      <div className="calculator-body">
        <div className="calculator-input-panel">
          <label className="calculator-field"><span>Known concentration</span><div><input type="number" step="any" value={knownConcentration} onChange={event => setKnownConcentration(event.target.value)} /><b>mol dm⁻³</b></div></label>
          <label className="calculator-field"><span>Known volume</span><div><input type="number" step="any" value={knownVolume} onChange={event => setKnownVolume(event.target.value)} /><b>cm³</b></div></label>
          <label className="calculator-field"><span>Unknown titre / volume</span><div><input type="number" step="any" value={unknownVolume} onChange={event => setUnknownVolume(event.target.value)} /><b>cm³</b></div></label>
          <label className="calculator-field"><span>Equation ratio known : unknown</span><div><input type="number" step="any" value={knownRatio} onChange={event => setKnownRatio(event.target.value)} /><b>known</b></div></label>
          <label className="calculator-field"><span>Equation ratio unknown</span><div><input type="number" step="any" value={unknownRatio} onChange={event => setUnknownRatio(event.target.value)} /><b>unknown</b></div></label>
        </div>

        <div className="calculator-display">
          <span>Unknown concentration</span>
          <CalculatedValue value={result?.concentration} sigFigs={3} unit="mol dm⁻³" />
        </div>
      </div>

      {result && (
        <div className="tool-logic-grid">
          <article className="tool-logic-card">
            <span>1. Known moles</span>
            <strong>{knownConcentration} × {knownVolume} ÷ 1000 = {result.knownMoles.toPrecision(3)} mol</strong>
            <small>Convert cm³ to dm³ before using cV.</small>
          </article>
          <article className="tool-logic-card">
            <span>2. Mole ratio</span>
            <strong>{result.knownMoles.toPrecision(3)} × {unknownRatio} ÷ {knownRatio} = {result.unknownMoles.toPrecision(3)} mol</strong>
            <small>Use the balanced equation ratio.</small>
          </article>
          <article className="tool-logic-card">
            <span>3. Unknown concentration</span>
            <strong>{result.unknownMoles.toPrecision(3)} ÷ ({unknownVolume} ÷ 1000) = {answer}</strong>
            <small>Final concentration includes the unit.</small>
          </article>
        </div>
      )}
    </section>
  )
}
