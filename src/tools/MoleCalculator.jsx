import { useMemo, useState } from 'react'
import CalculatedValue from './CalculatedValue.jsx'
import FormulaStrip from './FormulaStrip.jsx'
import { fewestSigFigs } from './significantFigures.js'

const avogadroConstant = 6.022e23
const molarGasVolumeDm3 = 24.0

const modes = [
  {
    id: 'moles-from-mass',
    label: 'Mass to moles',
    equation: 'n = m ÷ Mᵣ',
    resultLabel: 'Moles',
    unit: 'mol',
    fields: [
      { id: 'mass', label: 'Mass', unit: 'g', defaultValue: '10.0' },
      { id: 'molarMass', label: 'Molar mass', unit: 'g mol⁻¹', defaultValue: '40.0' },
    ],
    calculate: values => Number(values.mass) / Number(values.molarMass),
    formulaItems: values => [
      { label: 'Formula', value: 'n = m ÷ Mᵣ', tone: 'formula' },
      { label: 'Units', value: 'mass in g, Mᵣ in g mol⁻¹', tone: 'conversion' },
      { label: 'Substitution', value: `${values.mass} g ÷ ${values.molarMass} g mol⁻¹`, tone: 'substitution' },
    ],
  },
  {
    id: 'mass-from-moles',
    label: 'Moles to mass',
    equation: 'm = n × Mᵣ',
    resultLabel: 'Mass',
    unit: 'g',
    fields: [
      { id: 'moles', label: 'Moles', unit: 'mol', defaultValue: '0.250' },
      { id: 'molarMass', label: 'Molar mass', unit: 'g mol⁻¹', defaultValue: '40.0' },
    ],
    calculate: values => Number(values.moles) * Number(values.molarMass),
    formulaItems: values => [
      { label: 'Formula', value: 'm = n × Mᵣ', tone: 'formula' },
      { label: 'Units', value: 'mol × g mol⁻¹ gives g', tone: 'conversion' },
      { label: 'Substitution', value: `${values.moles} mol × ${values.molarMass} g mol⁻¹`, tone: 'substitution' },
    ],
  },
  {
    id: 'molar-mass',
    label: 'Find molar mass',
    equation: 'Mᵣ = m ÷ n',
    resultLabel: 'Molar mass',
    unit: 'g mol⁻¹',
    fields: [
      { id: 'mass', label: 'Mass', unit: 'g', defaultValue: '5.00' },
      { id: 'moles', label: 'Moles', unit: 'mol', defaultValue: '0.125' },
    ],
    calculate: values => Number(values.mass) / Number(values.moles),
    formulaItems: values => [
      { label: 'Formula', value: 'Mᵣ = m ÷ n', tone: 'formula' },
      { label: 'Units', value: 'g ÷ mol gives g mol⁻¹', tone: 'conversion' },
      { label: 'Substitution', value: `${values.mass} g ÷ ${values.moles} mol`, tone: 'substitution' },
    ],
  },
  {
    id: 'particles',
    label: 'Moles to particles',
    equation: 'particles = n × Nₐ',
    resultLabel: 'Number of particles',
    unit: 'particles',
    fields: [
      { id: 'moles', label: 'Moles', unit: 'mol', defaultValue: '0.250' },
    ],
    calculate: values => Number(values.moles) * avogadroConstant,
    formulaItems: values => [
      { label: 'Formula', value: 'N = n × Nₐ', tone: 'formula' },
      { label: 'Constant', value: 'Nₐ = 6.022 × 10²³ mol⁻¹', tone: 'conversion' },
      { label: 'Substitution', value: `${values.moles} mol × 6.022 × 10²³ mol⁻¹`, tone: 'substitution' },
    ],
  },
  {
    id: 'moles-from-particles',
    label: 'Particles to moles',
    equation: 'n = N ÷ Nₐ',
    resultLabel: 'Moles',
    unit: 'mol',
    fields: [
      { id: 'particles', label: 'Number of particles', unit: 'particles', defaultValue: '3.011e23' },
    ],
    calculate: values => Number(values.particles) / avogadroConstant,
    formulaItems: values => [
      { label: 'Formula', value: 'n = N ÷ Nₐ', tone: 'formula' },
      { label: 'Constant', value: 'Nₐ = 6.022 × 10²³ mol⁻¹', tone: 'conversion' },
      { label: 'Substitution', value: `${values.particles} particles ÷ 6.022 × 10²³ mol⁻¹`, tone: 'substitution' },
    ],
  },
  {
    id: 'gas-volume',
    label: 'Moles to gas volume',
    equation: 'V = n × 24.0',
    resultLabel: 'Gas volume at RTP',
    unit: 'dm³',
    fields: [
      { id: 'moles', label: 'Moles', unit: 'mol', defaultValue: '0.250' },
    ],
    calculate: values => Number(values.moles) * molarGasVolumeDm3,
    formulaItems: values => [
      { label: 'Formula', value: 'V = n × Vₘ', tone: 'formula' },
      { label: 'Constant', value: 'Vₘ = 24.0 dm³ mol⁻¹ at RTP', tone: 'conversion' },
      { label: 'Substitution', value: `${values.moles} mol × 24.0 dm³ mol⁻¹`, tone: 'substitution' },
    ],
  },
  {
    id: 'moles-from-gas-volume',
    label: 'Gas volume to moles',
    equation: 'n = V ÷ Vₘ',
    resultLabel: 'Moles of gas at RTP',
    unit: 'mol',
    fields: [
      { id: 'volume', label: 'Gas volume at RTP', unit: 'dm³', defaultValue: '6.00' },
    ],
    calculate: values => Number(values.volume) / molarGasVolumeDm3,
    formulaItems: values => [
      { label: 'Formula', value: 'n = V ÷ Vₘ', tone: 'formula' },
      { label: 'Constant', value: 'Vₘ = 24.0 dm³ mol⁻¹ at RTP', tone: 'conversion' },
      { label: 'Substitution', value: `${values.volume} dm³ ÷ 24.0 dm³ mol⁻¹`, tone: 'substitution' },
    ],
  },
]

function getInitialValues(mode) {
  return Object.fromEntries(mode.fields.map(field => [field.id, field.defaultValue]))
}

export default function MoleCalculator({ standalone = false }) {
  const [modeId, setModeId] = useState('moles-from-mass')
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
  const displaySigFigs = resultSigFigs || 3

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
    <section className={`calculator-app mole-relationship-tool-app ${standalone ? 'standalone-tool' : ''}`}>
      <div className="calculator-topline">
        <div>
          <p className="eyebrow">Mole calculator</p>
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
          <CalculatedValue value={result} sigFigs={displaySigFigs} unit={mode.unit} />
        </div>
      </div>

    </section>
  )
}
