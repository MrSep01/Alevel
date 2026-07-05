import { useMemo, useState } from 'react'
import CalculatedValue from './CalculatedValue.jsx'
import ConcentrationVisual from './ConcentrationVisual.jsx'
import FormulaStrip from './FormulaStrip.jsx'
import { fewestSigFigs } from './significantFigures.js'

const modes = [
  {
    id: 'concentration',
    label: 'Find concentration',
    equation: 'c = n ÷ V(solution)',
    resultLabel: 'Solution concentration',
    unit: 'mol dm⁻³',
    fields: [
      { id: 'moles', label: 'Moles', unit: 'mol', defaultValue: '0.0250' },
      { id: 'volumeCm3', label: 'Solution volume', unit: 'cm³', defaultValue: '250' },
    ],
    calculate: values => Number(values.moles) / (Number(values.volumeCm3) / 1000),
    formulaItems: values => [
      { label: 'Formula', value: 'c = n ÷ V(solution)', tone: 'formula' },
      { label: 'Volume meaning', value: 'V is the volume of the whole solution, not just the solvent', tone: 'conversion' },
      { label: 'Substitution', value: `${values.moles} mol ÷ (${values.volumeCm3} cm³ solution × 10⁻³)`, tone: 'substitution' },
    ],
  },
  {
    id: 'moles',
    label: 'Find moles',
    equation: 'n = c × V(solution)',
    resultLabel: 'Moles',
    unit: 'mol',
    fields: [
      { id: 'concentration', label: 'Concentration', unit: 'mol dm⁻³', defaultValue: '0.100' },
      { id: 'volumeCm3', label: 'Solution volume', unit: 'cm³', defaultValue: '25.0' },
    ],
    calculate: values => Number(values.concentration) * (Number(values.volumeCm3) / 1000),
    formulaItems: values => [
      { label: 'Formula', value: 'n = c × V(solution)', tone: 'formula' },
      { label: 'Volume meaning', value: 'V is the measured volume of solution used', tone: 'conversion' },
      { label: 'Substitution', value: `${values.concentration} mol dm⁻³ × (${values.volumeCm3} cm³ solution × 10⁻³)`, tone: 'substitution' },
    ],
  },
  {
    id: 'volume',
    label: 'Find solution volume',
    equation: 'V(solution) = n ÷ c',
    resultLabel: 'Solution volume',
    unit: 'cm³',
    fields: [
      { id: 'moles', label: 'Moles', unit: 'mol', defaultValue: '0.00250' },
      { id: 'concentration', label: 'Concentration', unit: 'mol dm⁻³', defaultValue: '0.100' },
    ],
    calculate: values => (Number(values.moles) / Number(values.concentration)) * 1000,
    formulaItems: values => [
      { label: 'Formula', value: 'V(solution, dm³) = n ÷ c', tone: 'formula' },
      { label: 'Volume meaning', value: 'The answer is final solution volume, not solvent volume', tone: 'conversion' },
      { label: 'Substitution', value: `(${values.moles} mol ÷ ${values.concentration} mol dm⁻³) × 10³`, tone: 'substitution' },
    ],
  },
  {
    id: 'dilution',
    label: 'Dilution',
    equation: 'c₁V₁ = c₂V₂',
    resultLabel: 'Final concentration',
    unit: 'mol dm⁻³',
    fields: [
      { id: 'initialConcentration', label: 'Initial concentration', unit: 'mol dm⁻³', defaultValue: '1.00' },
      { id: 'initialVolume', label: 'Stock solution volume', unit: 'cm³', defaultValue: '25.0' },
      { id: 'finalVolume', label: 'Final solution volume', unit: 'cm³', defaultValue: '250' },
    ],
    calculate: values => (Number(values.initialConcentration) * Number(values.initialVolume)) / Number(values.finalVolume),
    formulaItems: values => [
      { label: 'Formula', value: 'c₂ = c₁ × V₁(stock solution) ÷ V₂(final solution)', tone: 'formula' },
      { label: 'Volume meaning', value: 'V₂ is the final solution volume after solvent is added', tone: 'conversion' },
      { label: 'Substitution', value: `${values.initialConcentration} × ${values.initialVolume} cm³ ÷ ${values.finalVolume} cm³`, tone: 'substitution' },
    ],
  },
  {
    id: 'titration',
    label: 'Titre to moles',
    equation: 'n = c × V(titre)',
    resultLabel: 'Reactant moles',
    unit: 'mol',
    fields: [
      { id: 'titre', label: 'Titre volume delivered', unit: 'cm³', defaultValue: '24.80' },
      { id: 'concentration', label: 'Concentration', unit: 'mol dm⁻³', defaultValue: '0.100' },
    ],
    calculate: values => Number(values.concentration) * (Number(values.titre) / 1000),
    formulaItems: values => [
      { label: 'Formula', value: 'n = c × V(titre)', tone: 'formula' },
      { label: 'Volume meaning', value: 'V is the volume of solution delivered from the burette', tone: 'conversion' },
      { label: 'Substitution', value: `${values.concentration} mol dm⁻³ × (${values.titre} cm³ × 10⁻³)`, tone: 'substitution' },
    ],
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

      <FormulaStrip items={mode.formulaItems?.(values)} />

      <ConcentrationVisual modeId={mode.id} result={result} resultUnit={mode.unit} values={values} />

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
          <CalculatedValue value={result} sigFigs={resultSigFigs || 3} unit={mode.unit} />
        </div>
      </div>

    </section>
  )
}
