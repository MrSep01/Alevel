import { useMemo, useState } from 'react'
import CalculatedValue from './CalculatedValue.jsx'
import FormulaStrip from './FormulaStrip.jsx'
import { fewestSigFigs, formatToSigFigs } from './significantFigures.js'

const molarGasVolume = 24.0

const unitOptions = [
  { id: 'mol', label: 'mol', name: 'Moles / mol' },
  { id: 'g', label: 'g', name: 'Mass / g' },
  { id: 'gas', label: 'dm³', name: 'Gas volume at RTP / dm³' },
  { id: 'solution', label: 'c,V', name: 'Solution concentration / mol dm⁻³' },
]

const examples = {
  magnesiumAcid: {
    label: 'Magnesium with hydrochloric acid',
    equation: 'Mg(s) + 2HCl(aq) → MgCl₂(aq) + H₂(g)',
    defaultProduct: 'h2',
    defaultProductUnit: 'gas',
    reactants: [
      { id: 'mg', name: 'Magnesium', formula: 'Mg(s)', coefficient: 1, molarMass: 24.3, gas: false, defaultValue: '0.600', defaultUnit: 'g', defaultConcentration: '0.100', defaultVolume: '25.0' },
      { id: 'hcl', name: 'Hydrochloric acid', formula: 'HCl(aq)', coefficient: 2, molarMass: 36.5, gas: false, defaultValue: '0.0500', defaultUnit: 'solution', defaultConcentration: '0.500', defaultVolume: '100' },
    ],
    products: [
      { id: 'mgcl2', name: 'Magnesium chloride', formula: 'MgCl₂(aq)', coefficient: 1, molarMass: 95.3, gas: false },
      { id: 'h2', name: 'Hydrogen', formula: 'H₂(g)', coefficient: 1, molarMass: 2.0, gas: true },
    ],
  },
  ammonia: {
    label: 'Ammonia synthesis',
    equation: 'N₂(g) + 3H₂(g) → 2NH₃(g)',
    defaultProduct: 'nh3',
    defaultProductUnit: 'g',
    reactants: [
      { id: 'n2', name: 'Nitrogen', formula: 'N₂(g)', coefficient: 1, molarMass: 28.0, gas: true, defaultValue: '12.0', defaultUnit: 'dm3', defaultConcentration: '0.100', defaultVolume: '25.0' },
      { id: 'h2', name: 'Hydrogen', formula: 'H₂(g)', coefficient: 3, molarMass: 2.0, gas: true, defaultValue: '24.0', defaultUnit: 'dm3', defaultConcentration: '0.100', defaultVolume: '25.0' },
    ],
    products: [
      { id: 'nh3', name: 'Ammonia', formula: 'NH₃(g)', coefficient: 2, molarMass: 17.0, gas: true },
    ],
  },
  thermite: {
    label: 'Thermite reaction',
    equation: '2Al(s) + Fe₂O₃(s) → Al₂O₃(s) + 2Fe(s)',
    defaultProduct: 'fe',
    defaultProductUnit: 'g',
    reactants: [
      { id: 'al', name: 'Aluminium', formula: 'Al(s)', coefficient: 2, molarMass: 27.0, gas: false, defaultValue: '5.40', defaultUnit: 'g', defaultConcentration: '0.100', defaultVolume: '25.0' },
      { id: 'fe2o3', name: 'Iron(III) oxide', formula: 'Fe₂O₃(s)', coefficient: 1, molarMass: 159.6, gas: false, defaultValue: '20.0', defaultUnit: 'g', defaultConcentration: '0.100', defaultVolume: '25.0' },
    ],
    products: [
      { id: 'al2o3', name: 'Aluminium oxide', formula: 'Al₂O₃(s)', coefficient: 1, molarMass: 102.0, gas: false },
      { id: 'fe', name: 'Iron', formula: 'Fe(s)', coefficient: 2, molarMass: 55.8, gas: false },
    ],
  },
}

const exampleIds = Object.keys(examples)

function normalizeUnit(unit) {
  return unit === 'dm3' ? 'gas' : unit
}

function readPositiveNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : null
}

function toMoles(input, unit, substance) {
  const number = readPositiveNumber(input.value)
  const normalizedUnit = normalizeUnit(unit)
  if (normalizedUnit === 'mol') return number
  if (normalizedUnit === 'g') return number === null ? null : number / substance.molarMass
  if (normalizedUnit === 'gas') return number === null ? null : number / molarGasVolume
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

function getInitialReactants(example) {
  return Object.fromEntries(example.reactants.map(reactant => [
    reactant.id,
    {
      value: reactant.defaultValue,
      unit: normalizeUnit(reactant.defaultUnit),
      concentration: reactant.defaultConcentration,
      volume: reactant.defaultVolume,
    },
  ]))
}

function conversionText(unit, substance) {
  if (unit === 'mol') return 'Use moles directly'
  if (unit === 'g') return `n = mass ÷ Mᵣ (${substance.molarMass} g mol⁻¹)`
  if (unit === 'gas') return 'n = gas volume ÷ 24.0'
  return 'n = concentration × volume(cm³) × 10⁻³'
}

function outputText(unit, substance) {
  if (unit === 'mol') return 'Keep product moles'
  if (unit === 'g') return `mass = n × Mᵣ (${substance.molarMass} g mol⁻¹)`
  if (unit === 'gas') return 'gas volume = n × 24.0'
  return 'concentration = n ÷ (volume(cm³) × 10⁻³)'
}

function isSolutionSubstance(substance) {
  return substance.formula.includes('(aq)')
}

export default function LimitingReagentTool({ standalone = false }) {
  const [exampleId, setExampleId] = useState('magnesiumAcid')
  const activeExample = examples[exampleId]
  const [reactantInputs, setReactantInputs] = useState(() => getInitialReactants(examples.magnesiumAcid))
  const [productId, setProductId] = useState(activeExample.defaultProduct)
  const [productUnit, setProductUnit] = useState(activeExample.defaultProductUnit)
  const [productVolume, setProductVolume] = useState('250')
  const product = activeExample.products.find(item => item.id === productId) || activeExample.products[0]

  const result = useMemo(() => {
    const rows = activeExample.reactants.map(reactant => {
      const input = reactantInputs[reactant.id] || {}
      const moles = toMoles(input, input.unit, reactant)
      const reactionExtent = moles === null ? null : moles / reactant.coefficient
      return { ...reactant, input, moles, reactionExtent }
    })

    if (rows.some(row => row.moles === null || row.reactionExtent === null)) return { rows, limiting: null }

    const limiting = rows.reduce((smallest, row) => row.reactionExtent < smallest.reactionExtent ? row : smallest, rows[0])
    const productMoles = limiting.reactionExtent * product.coefficient
    const productValue = fromMoles(productMoles, productUnit, product, productVolume)
    const excessRows = rows.map(row => {
      const usedMoles = limiting.reactionExtent * row.coefficient
      const leftoverMoles = Math.max(0, row.moles - usedMoles)
      return { ...row, usedMoles, leftoverMoles }
    })

    return { rows: excessRows, limiting, productMoles, productValue }
  }, [activeExample, product, productUnit, productVolume, reactantInputs])

  const sigFigInputs = activeExample.reactants.flatMap(reactant => {
    const input = reactantInputs[reactant.id]
    return input?.unit === 'solution' ? [input.concentration, input.volume] : [input?.value]
  })
  const sigFigs = Math.max(2, fewestSigFigs(...sigFigInputs) || 3)
  const gasWarning = [
    ...activeExample.reactants.map(reactant => ({ substance: reactant, unit: reactantInputs[reactant.id]?.unit })),
    { substance: product, unit: productUnit },
  ].some(item => item.unit === 'gas' && !item.substance.gas)
  const solutionWarning = [
    ...activeExample.reactants.map(reactant => ({ substance: reactant, unit: reactantInputs[reactant.id]?.unit })),
    { substance: product, unit: productUnit },
  ].some(item => item.unit === 'solution' && !isSolutionSubstance(item.substance))

  function changeExample(nextExampleId) {
    const nextExample = examples[nextExampleId]
    setExampleId(nextExampleId)
    setReactantInputs(getInitialReactants(nextExample))
    setProductId(nextExample.defaultProduct)
    setProductUnit(nextExample.defaultProductUnit)
    setProductVolume('250')
  }

  function updateReactant(reactantId, key, value) {
    setReactantInputs(previous => ({
      ...previous,
      [reactantId]: {
        ...previous[reactantId],
        [key]: value,
      },
    }))
  }

  return (
    <section className={`calculator-app limiting-reagent-tool-app ${standalone ? 'standalone-tool' : ''}`}>
      <div className="calculator-topline">
        <div>
          <p className="eyebrow">Limiting reagent tool</p>
          <h2>Compare available moles against the balanced equation ratio</h2>
        </div>
        <span className="calculator-badge">smallest moles ÷ coefficient limits the reaction</span>
      </div>

      <div className="calculator-mode-grid">
        {exampleIds.map(id => (
          <button className={exampleId === id ? 'active' : ''} key={id} type="button" onClick={() => changeExample(id)}>
            {examples[id].label}
          </button>
        ))}
      </div>

      <FormulaStrip items={[
        { label: 'Limiting check', value: 'reaction capacity = reactant moles ÷ coefficient', tone: 'formula' },
        { label: 'Reactant conversion', value: activeExample.reactants.map(reactant => conversionText(reactantInputs[reactant.id]?.unit || 'mol', reactant)).join('  |  '), tone: 'conversion' },
        { label: 'Product moles', value: result.limiting ? `${formatValue(result.limiting.reactionExtent, sigFigs)} × ${product.coefficient} = ${formatValue(result.productMoles, sigFigs)} mol` : 'Enter valid reactant measurements', tone: 'substitution' },
      ]} />

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

          <div className="limiting-reactant-list">
            {activeExample.reactants.map(reactant => {
              const input = reactantInputs[reactant.id] || {}
              return (
                <div className="limiting-reactant-card" key={reactant.id}>
                  <span>{reactant.coefficient}{reactant.formula}</span>
                  <strong>{reactant.name}</strong>
                  <div className="stoich-two-column">
                    <label className="calculator-field">
                      <span>Measurement type</span>
                      <div>
                        <select aria-label={`${reactant.name} unit`} value={input.unit || 'mol'} onChange={event => updateReactant(reactant.id, 'unit', event.target.value)}>
                          {unitOptions.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}
                        </select>
                        <b>input</b>
                      </div>
                    </label>
                    <div className="stoich-mini-result">
                      <span>Reaction capacity</span>
                      <strong>
                        {result.rows.find(row => row.id === reactant.id)?.reactionExtent === null
                          ? 'Check values'
                          : `${formatValue(result.rows.find(row => row.id === reactant.id)?.reactionExtent, sigFigs)} reaction units`}
                      </strong>
                    </div>
                  </div>
                  {input.unit === 'solution' ? (
                    <div className="stoich-two-column">
                      <label className="calculator-field">
                        <span>Concentration</span>
                        <div>
                          <input type="number" step="any" value={input.concentration || ''} onChange={event => updateReactant(reactant.id, 'concentration', event.target.value)} />
                          <b>mol dm⁻³</b>
                        </div>
                      </label>
                      <label className="calculator-field">
                        <span>Volume</span>
                        <div>
                          <input type="number" step="any" value={input.volume || ''} onChange={event => updateReactant(reactant.id, 'volume', event.target.value)} />
                          <b>cm³</b>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <label className="calculator-field">
                      <span>Available measurement</span>
                      <div>
                        <input type="number" step="any" value={input.value || ''} onChange={event => updateReactant(reactant.id, 'value', event.target.value)} />
                        <b>{unitLabel(input.unit || 'mol')}</b>
                      </div>
                    </label>
                  )}
                </div>
              )
            })}
          </div>

          <div className="stoich-two-column">
            <label className="calculator-field">
              <span>Product to calculate</span>
              <div>
                <select value={productId} onChange={event => setProductId(event.target.value)}>
                  {activeExample.products.map(item => <option key={item.id} value={item.id}>{item.formula}</option>)}
                </select>
                <b>{product.coefficient}</b>
              </div>
            </label>
            <label className="calculator-field">
              <span>Product unit</span>
              <div>
                <select value={productUnit} onChange={event => setProductUnit(event.target.value)}>
                  {unitOptions.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}
                </select>
                <b>unit</b>
              </div>
            </label>
          </div>

          {productUnit === 'solution' && (
            <label className="calculator-field">
              <span>Final solution volume</span>
              <div>
                <input type="number" step="any" value={productVolume} onChange={event => setProductVolume(event.target.value)} />
                <b>cm³</b>
              </div>
            </label>
          )}

          {gasWarning && (
            <div className="stoich-warning">
              Gas volume at RTP should only be used for substances shown as gases.
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
            <small>Divide each reactant moles by its coefficient. The smallest value is the limiting reagent.</small>
          </div>

          <div className="calculator-display compact-display">
            <span>Limiting reagent</span>
            <strong>{result.limiting ? result.limiting.formula : 'Check values'}</strong>
            <small>{result.limiting ? `${result.limiting.name} controls the maximum product from ${product.formula}.` : 'Enter valid reactant measurements.'}</small>
          </div>

          <div className="stoich-yield-card">
            <span>Theoretical yield</span>
            <CalculatedValue value={result.productValue} sigFigs={sigFigs} unit={`${unitLabel(productUnit)} ${product.formula}`} />
            <small>{result.productMoles === undefined ? 'Product moles will appear here.' : `${formatValue(result.productMoles, sigFigs)} mol before final unit conversion.`}</small>
          </div>
        </div>
      </div>

      <div className="stoich-flowchart limiting-flowchart" aria-label="Limiting reagent flowchart">
        <div className="stoich-flow-step wide">
          <span>Balanced reaction</span>
          <strong>{activeExample.equation}</strong>
          <small>Everything starts from the coefficients in this equation.</small>
        </div>
        <div className="stoich-flow-step">
          <span>Convert reactants to moles</span>
          <div className="stoich-flow-list">
            {result.rows.map(row => (
              <small key={row.id}><b>{row.formula}</b> {conversionText(row.input?.unit || 'mol', row)}</small>
            ))}
          </div>
        </div>
        <div className="stoich-flow-step">
          <span>Divide by coefficient</span>
          <div className="stoich-flow-list">
            {result.rows.map(row => (
              <small key={row.id}>
                <b>{row.formula}</b> {row.reactionExtent === null ? 'Check values' : `${formatValue(row.reactionExtent, sigFigs)} reaction units`}
              </small>
            ))}
          </div>
        </div>
        <div className="stoich-flow-step compare">
          <span>Compare</span>
          <strong>{result.limiting ? result.limiting.formula : 'Check values'}</strong>
          <small>The smallest reaction capacity is the limiting reagent.</small>
        </div>
        <div className="stoich-flow-step">
          <span>Product moles</span>
          <strong>{product.formula}</strong>
          <small>Use limiting reaction units × product coefficient.</small>
          <b>{result.productMoles === undefined ? 'Check values' : `${formatValue(result.productMoles, sigFigs)} mol`}</b>
        </div>
        <div className="stoich-flow-step final">
          <span>Final answer</span>
          <strong>{outputText(productUnit, product)}</strong>
          <small>{productUnit === 'solution' ? `using ${productVolume} cm³ final volume` : `in ${unitLabel(productUnit)}`}</small>
          <b>{result.productValue === undefined ? 'Check values' : `${formatValue(result.productValue, sigFigs)} ${unitLabel(productUnit)}`}</b>
        </div>
      </div>

      <div className="calculator-working stoich-working-grid">
        {result.rows.map(row => (
          <div className={result.limiting?.id === row.id ? 'limiting-winner' : ''} key={row.id}>
            <span>{row.formula}</span>
            <strong>
              {row.moles === null
                ? 'Check values'
                : `${formatValue(row.moles, sigFigs)} mol ÷ ${row.coefficient} = ${formatValue(row.reactionExtent, sigFigs)} reaction units`}
            </strong>
            <small>
              {row.leftoverMoles === undefined
                ? 'Excess will be calculated after valid inputs.'
                : `${formatValue(row.leftoverMoles, sigFigs)} mol left over`}
            </small>
          </div>
        ))}
        <div>
          <span>Product ratio</span>
          <strong>{result.limiting ? `${formatValue(result.limiting.reactionExtent, sigFigs)} × ${product.coefficient} = ${formatValue(result.productMoles, sigFigs)} mol ${product.formula}` : 'Check values'}</strong>
        </div>
      </div>
    </section>
  )
}
