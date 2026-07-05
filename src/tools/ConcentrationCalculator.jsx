import { useMemo, useState } from 'react'
import { fewestSigFigs, formatToSigFigs } from './significantFigures.js'

const modes = [
  {
    id: 'concentration',
    label: 'Find concentration',
    equation: 'c = n / V',
    resultLabel: 'Concentration',
    unit: 'mol dm⁻³',
    fields: [
      { id: 'moles', label: 'Moles', unit: 'mol', defaultValue: '0.0250' },
      { id: 'volumeCm3', label: 'Volume', unit: 'cm³', defaultValue: '250' },
    ],
    calculate: values => Number(values.moles) / (Number(values.volumeCm3) / 1000),
    working: values => `${values.moles} mol / (${values.volumeCm3} ÷ 1000) dm³`,
  },
  {
    id: 'moles',
    label: 'Find moles',
    equation: 'n = c × V',
    resultLabel: 'Moles',
    unit: 'mol',
    fields: [
      { id: 'concentration', label: 'Concentration', unit: 'mol dm⁻³', defaultValue: '0.100' },
      { id: 'volumeCm3', label: 'Volume', unit: 'cm³', defaultValue: '25.0' },
    ],
    calculate: values => Number(values.concentration) * (Number(values.volumeCm3) / 1000),
    working: values => `${values.concentration} mol dm⁻³ × (${values.volumeCm3} ÷ 1000) dm³`,
  },
  {
    id: 'volume',
    label: 'Find volume',
    equation: 'V = n / c',
    resultLabel: 'Volume',
    unit: 'cm³',
    fields: [
      { id: 'moles', label: 'Moles', unit: 'mol', defaultValue: '0.00250' },
      { id: 'concentration', label: 'Concentration', unit: 'mol dm⁻³', defaultValue: '0.100' },
    ],
    calculate: values => (Number(values.moles) / Number(values.concentration)) * 1000,
    working: values => `(${values.moles} mol / ${values.concentration} mol dm⁻³) × 1000`,
  },
  {
    id: 'dilution',
    label: 'Dilution',
    equation: 'c₁V₁ = c₂V₂',
    resultLabel: 'Final concentration',
    unit: 'mol dm⁻³',
    fields: [
      { id: 'initialConcentration', label: 'Initial concentration', unit: 'mol dm⁻³', defaultValue: '1.00' },
      { id: 'initialVolume', label: 'Initial volume', unit: 'cm³', defaultValue: '25.0' },
      { id: 'finalVolume', label: 'Final volume', unit: 'cm³', defaultValue: '250' },
    ],
    calculate: values => (Number(values.initialConcentration) * Number(values.initialVolume)) / Number(values.finalVolume),
    working: values => `(${values.initialConcentration} × ${values.initialVolume}) / ${values.finalVolume}`,
  },
  {
    id: 'titration',
    label: 'Titre to moles',
    equation: 'n = c × V',
    resultLabel: 'Reactant moles',
    unit: 'mol',
    fields: [
      { id: 'titre', label: 'Titre', unit: 'cm³', defaultValue: '24.80' },
      { id: 'concentration', label: 'Concentration', unit: 'mol dm⁻³', defaultValue: '0.100' },
    ],
    calculate: values => Number(values.concentration) * (Number(values.titre) / 1000),
    working: values => `${values.concentration} mol dm⁻³ × (${values.titre} ÷ 1000) dm³`,
  },
]

function getInitialValues(mode) {
  return Object.fromEntries(mode.fields.map(field => [field.id, field.defaultValue]))
}

export default function ConcentrationCalculator() {
  const [modeId, setModeId] = useState('concentration')
  const mode = modes.find(item => item.id === modeId) || modes[0]
  const [valuesByMode, setValuesByMode] = useState(() => (
    Object.fromEntries(modes.map(item => [item.id, getInitialValues(item)]))
  ))
  const values = valuesByMode[mode.id]

  const result = useMemo(() => {
    const numericValues = mode.fields.map(field => Number(values[field.id]))
    if (numericValues.some(value => !Number.isFinite(value) || value <= 0)) return null
    return mode.calculate(values)
  }, [mode, values])

  const resultSigFigs = useMemo(() => fewestSigFigs(...mode.fields.map(field => values[field.id])), [mode, values])

  function updateValue(fieldId, value) {
    setValuesByMode(previous => ({
      ...previous,
      [mode.id]: {
        ...previous[mode.id],
        [fieldId]: value,
      },
    }))
  }

  return (
    <section className="calculator-app">
      <div className="calculator-topline">
        <div>
          <p className="eyebrow">Concentration calculator</p>
        </div>
        <span className="calculator-badge">{mode.equation}</span>
      </div>

      <div className="calculator-mode-grid">
        {modes.map(item => (
          <button
            className={item.id === mode.id ? 'active' : ''}
            key={item.id}
            type="button"
            onClick={() => setModeId(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="calculator-body">
        <div className="calculator-input-panel">
          {mode.fields.map(field => (
            <label className="calculator-field" key={field.id}>
              <span>{field.label}</span>
              <div>
                <input
                  type="number"
                  step="any"
                  value={values[field.id]}
                  onChange={event => updateValue(field.id, event.target.value)}
                />
                <b>{field.unit}</b>
              </div>
            </label>
          ))}
        </div>

        <div className="calculator-display">
          <span>{mode.resultLabel}</span>
          <strong>{result === null ? 'Check values' : `${formatToSigFigs(result, resultSigFigs)} ${mode.unit}`}</strong>
          <small>{result === null ? mode.equation : `${resultSigFigs} significant figures`}</small>
        </div>
      </div>

      <div className="calculator-working">
        <div>
          <span>Formula</span>
          <strong>{mode.equation}</strong>
        </div>
        <div>
          <span>Substitution</span>
          <strong>{mode.working(values)}</strong>
        </div>
      </div>
    </section>
  )
}
