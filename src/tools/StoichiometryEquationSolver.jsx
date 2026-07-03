import { useMemo, useState } from 'react'
import { fewestSigFigs, formatToSigFigs } from './significantFigures.js'

const molarGasVolume = 24.0

const unitOptions = [
  { id: 'mol', label: 'mol', name: 'Amount / mol' },
  { id: 'g', label: 'g', name: 'Mass / g' },
  { id: 'gas', label: 'dm³', name: 'Gas volume at RTP / dm³' },
  { id: 'solution', label: 'c,V', name: 'Solution concentration / mol dm⁻³' },
]

const examples = {
  water: {
    label: 'Hydrogen burns in oxygen',
    equation: '2H₂(g) + O₂(g) → 2H₂O(l)',
    examHint: 'Use the coefficient ratio from the balanced equation: H₂ : O₂ : H₂O = 2 : 1 : 2.',
    defaultKnown: 'h2',
    defaultTarget: 'h2o',
    defaultKnownUnit: 'g',
    defaultTargetUnit: 'g',
    defaultValue: '4.00',
    defaultKnownConcentration: '0.100',
    defaultKnownVolume: '25.0',
    defaultTargetVolume: '250',
    substances: [
      { id: 'h2', name: 'Hydrogen', formula: 'H₂(g)', coefficient: 2, molarMass: 2.0, gas: true },
      { id: 'o2', name: 'Oxygen', formula: 'O₂(g)', coefficient: 1, molarMass: 32.0, gas: true },
      { id: 'h2o', name: 'Water', formula: 'H₂O(l)', coefficient: 2, molarMass: 18.0, gas: false },
    ],
  },
  carbonate: {
    label: 'Thermal decomposition of calcium carbonate',
    equation: 'CaCO₃(s) → CaO(s) + CO₂(g)',
    examHint: 'The ratio is 1 : 1 : 1, but you still need to convert mass to moles first.',
    defaultKnown: 'caco3',
    defaultTarget: 'co2',
    defaultKnownUnit: 'g',
    defaultTargetUnit: 'gas',
    defaultValue: '25.0',
    defaultKnownConcentration: '0.100',
    defaultKnownVolume: '25.0',
    defaultTargetVolume: '250',
    substances: [
      { id: 'caco3', name: 'Calcium carbonate', formula: 'CaCO₃(s)', coefficient: 1, molarMass: 100.1, gas: false },
      { id: 'cao', name: 'Calcium oxide', formula: 'CaO(s)', coefficient: 1, molarMass: 56.1, gas: false },
      { id: 'co2', name: 'Carbon dioxide', formula: 'CO₂(g)', coefficient: 1, molarMass: 44.0, gas: true },
    ],
  },
  neutralisation: {
    label: 'Sulfuric acid neutralises sodium hydroxide',
    equation: 'H₂SO₄(aq) + 2NaOH(aq) → Na₂SO₄(aq) + 2H₂O(l)',
    examHint: 'Notice the 1 : 2 ratio between sulfuric acid and sodium hydroxide.',
    defaultKnown: 'h2so4',
    defaultTarget: 'naoh',
    defaultKnownUnit: 'solution',
    defaultTargetUnit: 'mol',
    defaultValue: '0.125',
    defaultKnownConcentration: '0.100',
    defaultKnownVolume: '25.0',
    defaultTargetVolume: '250',
    substances: [
      { id: 'h2so4', name: 'Sulfuric acid', formula: 'H₂SO₄(aq)', coefficient: 1, molarMass: 98.1, gas: false },
      { id: 'naoh', name: 'Sodium hydroxide', formula: 'NaOH(aq)', coefficient: 2, molarMass: 40.0, gas: false },
      { id: 'na2so4', name: 'Sodium sulfate', formula: 'Na₂SO₄(aq)', coefficient: 1, molarMass: 142.1, gas: false },
      { id: 'h2o', name: 'Water', formula: 'H₂O(l)', coefficient: 2, molarMass: 18.0, gas: false },
    ],
  },
}

const exampleIds = Object.keys(examples)

function readPositiveNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : null
}

function toMoles(input, unit, substance) {
  const number = readPositiveNumber(input.value)
  if (unit === 'mol') return number
  if (unit === 'g') return number === null ? null : number / substance.molarMass
  if (unit === 'gas') return number === null ? null : number / molarGasVolume
  const concentration = readPositiveNumber(input.concentration)
  const volume = readPositiveNumber(input.volume)
  if (concentration === null || volume === null) return null
  return concentration * volume / 1000
}

function fromMoles(moles, unit, substance, solutionVolume) {
  if (!Number.isFinite(moles)) return null
  if (unit === 'mol') return moles
  if (unit === 'g') return moles * substance.molarMass
  if (unit === 'gas') return moles * molarGasVolume
  const volume = readPositiveNumber(solutionVolume)
  if (volume === null) return null
  return moles / (volume / 1000)
}

function unitLabel(unit) {
  if (unit === 'solution') return 'mol dm⁻³'
  return unitOptions.find(option => option.id === unit)?.label || unit
}

function formatValue(value, sigFigs = 3) {
  if (!Number.isFinite(value)) return 'Check values'
  return formatToSigFigs(value, sigFigs)
}

function conversionText(unit, substance) {
  if (unit === 'mol') return 'Use amount directly'
  if (unit === 'g') return `n = mass ÷ Mᵣ (${substance.molarMass} g mol⁻¹)`
  if (unit === 'gas') return 'n = gas volume ÷ 24.0'
  return 'n = concentration × volume in dm³'
}

function outputText(unit, substance) {
  if (unit === 'mol') return 'Keep product moles'
  if (unit === 'g') return `mass = n × Mᵣ (${substance.molarMass} g mol⁻¹)`
  if (unit === 'gas') return 'gas volume = n × 24.0'
  return 'concentration = n ÷ volume in dm³'
}

function isSolutionSubstance(substance) {
  return substance.formula.includes('(aq)')
}

export default function StoichiometryEquationSolver({ standalone = false }) {
  const [exampleId, setExampleId] = useState('water')
  const activeExample = examples[exampleId]
  const [knownId, setKnownId] = useState(activeExample.defaultKnown)
  const [targetId, setTargetId] = useState(activeExample.defaultTarget)
  const [knownUnit, setKnownUnit] = useState(activeExample.defaultKnownUnit)
  const [targetUnit, setTargetUnit] = useState(activeExample.defaultTargetUnit)
  const [knownValue, setKnownValue] = useState(activeExample.defaultValue)
  const [knownConcentration, setKnownConcentration] = useState(activeExample.defaultKnownConcentration)
  const [knownVolume, setKnownVolume] = useState(activeExample.defaultKnownVolume)
  const [targetVolume, setTargetVolume] = useState(activeExample.defaultTargetVolume)

  const knownSubstance = activeExample.substances.find(substance => substance.id === knownId) || activeExample.substances[0]
  const targetSubstance = activeExample.substances.find(substance => substance.id === targetId) || activeExample.substances[1]

  const result = useMemo(() => {
    const knownMoles = toMoles({ value: knownValue, concentration: knownConcentration, volume: knownVolume }, knownUnit, knownSubstance)
    if (knownMoles === null || !knownSubstance || !targetSubstance || knownSubstance.id === targetSubstance.id) return null
    const targetMoles = knownMoles * (targetSubstance.coefficient / knownSubstance.coefficient)
    const targetValue = fromMoles(targetMoles, targetUnit, targetSubstance, targetVolume)
    if (targetValue === null) return null
    return { knownMoles, targetMoles, targetValue }
  }, [knownConcentration, knownSubstance, knownUnit, knownValue, knownVolume, targetSubstance, targetUnit, targetVolume])

  const sigFigInputs = knownUnit === 'solution' ? [knownConcentration, knownVolume] : [knownValue]
  const sigFigs = Math.max(2, fewestSigFigs(...sigFigInputs) || 3)
  const gasWarning = (knownUnit === 'gas' && !knownSubstance.gas) || (targetUnit === 'gas' && !targetSubstance.gas)
  const solutionWarning = (knownUnit === 'solution' && !isSolutionSubstance(knownSubstance)) || (targetUnit === 'solution' && !isSolutionSubstance(targetSubstance))

  function changeExample(nextExampleId) {
    const nextExample = examples[nextExampleId]
    setExampleId(nextExampleId)
    setKnownId(nextExample.defaultKnown)
    setTargetId(nextExample.defaultTarget)
    setKnownUnit(nextExample.defaultKnownUnit)
    setTargetUnit(nextExample.defaultTargetUnit)
    setKnownValue(nextExample.defaultValue)
    setKnownConcentration(nextExample.defaultKnownConcentration)
    setKnownVolume(nextExample.defaultKnownVolume)
    setTargetVolume(nextExample.defaultTargetVolume)
  }

  return (
    <section className={`calculator-app stoich-equation-tool-app ${standalone ? 'standalone-tool' : ''}`}>
      <div className="calculator-topline">
        <div>
          <p className="eyebrow">Balanced equation stoichiometry</p>
          <h2>Use a mole ratio to move from one substance to another</h2>
        </div>
        <span className="calculator-badge">known moles × target coefficient / known coefficient</span>
      </div>

      <div className="calculator-mode-grid">
        {exampleIds.map(id => (
          <button className={exampleId === id ? 'active' : ''} key={id} type="button" onClick={() => changeExample(id)}>
            {examples[id].label}
          </button>
        ))}
      </div>

      <div className="stoich-tool-layout">
        <div className="calculator-input-panel">
          <label className="calculator-field">
            <span>Balanced equation</span>
            <div>
              <select value={exampleId} onChange={event => changeExample(event.target.value)}>
                {exampleIds.map(id => <option key={id} value={id}>{examples[id].equation}</option>)}
              </select>
              <b>preset</b>
            </div>
          </label>

          <div className="stoich-two-column">
            <label className="calculator-field">
              <span>Known substance</span>
              <div>
                <select value={knownId} onChange={event => setKnownId(event.target.value)}>
                  {activeExample.substances.map(substance => (
                    <option key={substance.id} value={substance.id}>{substance.formula}</option>
                  ))}
                </select>
                <b>{knownSubstance.coefficient}</b>
              </div>
            </label>
            <label className="calculator-field">
              <span>Find substance</span>
              <div>
                <select value={targetId} onChange={event => setTargetId(event.target.value)}>
                  {activeExample.substances.map(substance => (
                    <option key={substance.id} value={substance.id}>{substance.formula}</option>
                  ))}
                </select>
                <b>{targetSubstance.coefficient}</b>
              </div>
            </label>
          </div>

          <div className="stoich-two-column">
            <label className="calculator-field">
              <span>Known measurement type</span>
              <div>
                <select aria-label="Known unit" value={knownUnit} onChange={event => setKnownUnit(event.target.value)}>
                  {unitOptions.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}
                </select>
                <b>type</b>
              </div>
            </label>
            <label className="calculator-field">
              <span>Answer unit</span>
              <div>
                <select value={targetUnit} onChange={event => setTargetUnit(event.target.value)}>
                  {unitOptions.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}
                </select>
                <b>unit</b>
              </div>
            </label>
          </div>

          {knownUnit === 'solution' ? (
            <div className="stoich-two-column">
              <label className="calculator-field">
                <span>Known concentration</span>
                <div>
                  <input type="number" step="any" value={knownConcentration} onChange={event => setKnownConcentration(event.target.value)} />
                  <b>mol dm⁻³</b>
                </div>
              </label>
              <label className="calculator-field">
                <span>Known volume</span>
                <div>
                  <input type="number" step="any" value={knownVolume} onChange={event => setKnownVolume(event.target.value)} />
                  <b>cm³</b>
                </div>
              </label>
            </div>
          ) : (
            <label className="calculator-field">
              <span>Known measurement</span>
              <div>
                <input type="number" step="any" value={knownValue} onChange={event => setKnownValue(event.target.value)} />
                <b>{unitLabel(knownUnit)}</b>
              </div>
            </label>
          )}

          {targetUnit === 'solution' && (
            <label className="calculator-field">
              <span>Final solution volume</span>
              <div>
                <input type="number" step="any" value={targetVolume} onChange={event => setTargetVolume(event.target.value)} />
                <b>cm³</b>
              </div>
            </label>
          )}

          {gasWarning && (
            <div className="stoich-warning">
              Gas volume at RTP only makes chemical sense for substances shown as gases.
            </div>
          )}
          {solutionWarning && (
            <div className="stoich-warning">
              Concentration calculations should normally be used for aqueous substances.
            </div>
          )}
        </div>

        <div className="stoich-answer-panel">
          <div className="stoich-equation-card">
            <span>Balanced equation</span>
            <strong>{activeExample.equation}</strong>
            <small>{activeExample.examHint}</small>
          </div>

          <div className="calculator-display compact-display">
            <span>{targetSubstance.name}</span>
            <strong>{result === null ? 'Check values' : `${formatValue(result.targetValue, sigFigs)} ${unitLabel(targetUnit)}`}</strong>
            <small>{knownSubstance.formula} : {targetSubstance.formula} = {knownSubstance.coefficient} : {targetSubstance.coefficient}</small>
          </div>
        </div>
      </div>

      <div className="stoich-flowchart" aria-label="Stoichiometry flowchart from known measurement to product answer">
        <div className="stoich-flow-step">
          <span>Balanced reaction</span>
          <strong>{activeExample.equation}</strong>
          <small>Read coefficients before doing any calculation.</small>
        </div>
        <div className="stoich-flow-step">
          <span>Known to moles</span>
          <strong>{knownSubstance.formula}</strong>
          <small>{conversionText(knownUnit, knownSubstance)}</small>
          <b>{result === null ? 'Check values' : `${formatValue(result.knownMoles, sigFigs)} mol`}</b>
        </div>
        <div className="stoich-flow-step">
          <span>Mole ratio</span>
          <strong>{knownSubstance.coefficient} : {targetSubstance.coefficient}</strong>
          <small>Multiply by target coefficient ÷ known coefficient.</small>
          <b>× {targetSubstance.coefficient} / {knownSubstance.coefficient}</b>
        </div>
        <div className="stoich-flow-step">
          <span>Product moles</span>
          <strong>{targetSubstance.formula}</strong>
          <small>Now the chemical ratio step is complete.</small>
          <b>{result === null ? 'Check values' : `${formatValue(result.targetMoles, sigFigs)} mol`}</b>
        </div>
        <div className="stoich-flow-step final">
          <span>Final answer</span>
          <strong>{outputText(targetUnit, targetSubstance)}</strong>
          <small>{targetUnit === 'solution' ? `using ${targetVolume} cm³ final volume` : `in ${unitLabel(targetUnit)}`}</small>
          <b>{result === null ? 'Check values' : `${formatValue(result.targetValue, sigFigs)} ${unitLabel(targetUnit)}`}</b>
        </div>
      </div>

      <div className="calculator-working stoich-working-grid">
        <div>
          <span>1. Convert known to moles</span>
          <strong>{result === null ? 'Enter a valid known value.' : `${formatValue(result.knownMoles, sigFigs)} mol of ${knownSubstance.formula}`}</strong>
        </div>
        <div>
          <span>2. Apply mole ratio</span>
          <strong>× {targetSubstance.coefficient} / {knownSubstance.coefficient}</strong>
        </div>
        <div>
          <span>3. Target moles</span>
          <strong>{result === null ? 'Check values' : `${formatValue(result.targetMoles, sigFigs)} mol of ${targetSubstance.formula}`}</strong>
        </div>
        <div>
          <span>4. Convert to answer unit</span>
          <strong>{result === null ? 'Check values' : `${formatValue(result.targetValue, sigFigs)} ${unitLabel(targetUnit)}`}</strong>
        </div>
      </div>
    </section>
  )
}
