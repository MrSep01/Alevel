import { useMemo, useState } from 'react'
import { fewestSigFigs, formatToSigFigs } from './significantFigures.js'

const avogadroConstant = 6.022e23
const molarGasVolumeDm3 = 24.0

const modes = [
  {
    id: 'moles-from-mass',
    label: 'Mass to moles',
    equation: 'n = m / Mᵣ',
    resultLabel: 'Amount of substance',
    unit: 'mol',
    fields: [
      { id: 'mass', label: 'Mass', unit: 'g', defaultValue: '10.0' },
      { id: 'molarMass', label: 'Molar mass', unit: 'g mol⁻¹', defaultValue: '40.0' },
    ],
    calculate: values => Number(values.mass) / Number(values.molarMass),
    working: values => `${values.mass} g / ${values.molarMass} g mol⁻¹`,
  },
  {
    id: 'mass-from-moles',
    label: 'Moles to mass',
    equation: 'm = n × Mᵣ',
    resultLabel: 'Mass',
    unit: 'g',
    fields: [
      { id: 'moles', label: 'Amount', unit: 'mol', defaultValue: '0.250' },
      { id: 'molarMass', label: 'Molar mass', unit: 'g mol⁻¹', defaultValue: '40.0' },
    ],
    calculate: values => Number(values.moles) * Number(values.molarMass),
    working: values => `${values.moles} mol × ${values.molarMass} g mol⁻¹`,
  },
  {
    id: 'molar-mass',
    label: 'Find molar mass',
    equation: 'Mᵣ = m / n',
    resultLabel: 'Molar mass',
    unit: 'g mol⁻¹',
    fields: [
      { id: 'mass', label: 'Mass', unit: 'g', defaultValue: '5.00' },
      { id: 'moles', label: 'Amount', unit: 'mol', defaultValue: '0.125' },
    ],
    calculate: values => Number(values.mass) / Number(values.moles),
    working: values => `${values.mass} g / ${values.moles} mol`,
  },
  {
    id: 'particles',
    label: 'Moles to particles',
    equation: 'particles = n × Nₐ',
    resultLabel: 'Number of particles',
    unit: 'particles',
    fields: [
      { id: 'moles', label: 'Amount', unit: 'mol', defaultValue: '0.250' },
    ],
    calculate: values => Number(values.moles) * avogadroConstant,
    working: values => `${values.moles} mol × 6.022 × 10²³ mol⁻¹`,
  },
  {
    id: 'moles-from-particles',
    label: 'Particles to moles',
    equation: 'n = particles / Nₐ',
    resultLabel: 'Amount of substance',
    unit: 'mol',
    fields: [
      { id: 'particles', label: 'Number of particles', unit: 'particles', defaultValue: '3.011e23' },
    ],
    calculate: values => Number(values.particles) / avogadroConstant,
    working: values => `${values.particles} particles / 6.022 × 10²³ mol⁻¹`,
  },
  {
    id: 'gas-volume',
    label: 'Moles to gas volume',
    equation: 'V = n × 24.0',
    resultLabel: 'Gas volume at RTP',
    unit: 'dm³',
    fields: [
      { id: 'moles', label: 'Amount', unit: 'mol', defaultValue: '0.250' },
    ],
    calculate: values => Number(values.moles) * molarGasVolumeDm3,
    working: values => `${values.moles} mol × 24.0 dm³ mol⁻¹`,
  },
  {
    id: 'moles-from-gas-volume',
    label: 'Gas volume to moles',
    equation: 'n = V / 24.0',
    resultLabel: 'Amount of gas at RTP',
    unit: 'mol',
    fields: [
      { id: 'volume', label: 'Gas volume at RTP', unit: 'dm³', defaultValue: '6.00' },
    ],
    calculate: values => Number(values.volume) / molarGasVolumeDm3,
    working: values => `${values.volume} dm³ / 24.0 dm³ mol⁻¹`,
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
          <strong>{result === null ? 'Check values' : formatToSigFigs(result, displaySigFigs)}</strong>
          <small>{result === null ? mode.equation : `${mode.unit} · ${displaySigFigs} significant figures`}</small>
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
