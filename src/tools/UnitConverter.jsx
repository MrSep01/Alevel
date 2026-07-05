import { useMemo, useState } from 'react'

const conversions = {
  cm3ToDm3: { label: 'cm³ to dm³', from: 'cm³', to: 'dm³', convert: value => value / 1000 },
  dm3ToCm3: { label: 'dm³ to cm³', from: 'dm³', to: 'cm³', convert: value => value * 1000 },
  kjToJ: { label: 'kJ to J', from: 'kJ', to: 'J', convert: value => value * 1000 },
  jToKj: { label: 'J to kJ', from: 'J', to: 'kJ', convert: value => value / 1000 },
  gToKg: { label: 'g to kg', from: 'g', to: 'kg', convert: value => value / 1000 },
  kgToG: { label: 'kg to g', from: 'kg', to: 'g', convert: value => value * 1000 },
}

export default function UnitConverter() {
  const [mode, setMode] = useState('cm3ToDm3')
  const [value, setValue] = useState('250')
  const conversion = conversions[mode]
  const result = useMemo(() => Number.isFinite(Number(value)) ? conversion.convert(Number(value)) : null, [conversion, value])
  const answer = result === null ? 'Check value' : `${result.toPrecision(4)} ${conversion.to}`

  return (
    <section className="calculator-app">
      <div className="calculator-topline"><p className="eyebrow">Unit converter</p><span className="calculator-badge">chemistry units</span></div>
      <div className="calculator-body">
        <div className="calculator-input-panel">
          <label className="calculator-field"><span>Conversion</span><div><select value={mode} onChange={event => setMode(event.target.value)}>{Object.entries(conversions).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}</select><b>type</b></div></label>
          <label className="calculator-field"><span>Value</span><div><input type="number" step="any" value={value} onChange={event => setValue(event.target.value)} /><b>{conversion.from}</b></div></label>
        </div>
        <div className="calculator-display"><span>Converted value</span><strong>{answer}</strong><small>{conversion.label}</small></div>
      </div>

      <div className="tool-logic-grid">
        <article className="tool-logic-card">
          <span>Start unit</span>
          <strong>{value} {conversion.from}</strong>
          <small>{conversion.label}</small>
        </article>
        <article className="tool-logic-card">
          <span>Converted unit</span>
          <strong>{answer}</strong>
          <small>Check whether the question wants cm³, dm³, J, kJ, g, or kg.</small>
        </article>
      </div>
    </section>
  )
}
