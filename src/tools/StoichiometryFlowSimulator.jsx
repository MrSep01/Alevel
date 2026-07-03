import { useEffect, useMemo, useState } from 'react'
import { fewestSigFigs, formatToSigFigs } from './significantFigures.js'

const avogadro = 6.022e23
const gasMolarVolume = 24.0

const inputTypeOptions = [
  { value: 'mass', label: 'Mass' },
  { value: 'solution', label: 'Concentration and volume' },
  { value: 'gas', label: 'Gas volume at RTP' },
  { value: 'particles', label: 'Particles' },
  { value: 'pure-volume', label: 'Pure liquid volume' },
  { value: 'moles', label: 'Moles' },
]

const productOutputOptions = [
  { value: 'mass', label: 'Mass' },
  { value: 'gas', label: 'Gas volume at RTP' },
  { value: 'solution', label: 'Final concentration' },
  { value: 'particles', label: 'Particles' },
  { value: 'pure-volume', label: 'Pure liquid volume' },
  { value: 'moles', label: 'Moles' },
]

const scenarioLibrary = {
  massToMass: {
    label: 'Mass to mass',
    shortLabel: 'Mass to mass',
    description: 'Two measured reactant masses decide the product mass.',
    equation: '2Mg(s) + O₂(g) → 2MgO(s)',
    product: {
      formula: 'MgO(s)',
      coefficient: 2,
      molarMass: 40.3,
      outputType: 'mass',
      availableOutputs: ['mass', 'moles', 'particles'],
    },
    reactants: [
      {
        id: 'a',
        label: 'Reactant A',
        formula: 'Mg(s)',
        coefficient: 2,
        molarMass: 24.3,
        inputType: 'mass',
        availableInputs: ['mass', 'moles', 'particles'],
        defaults: { mass: '4.86', moles: '0.200' },
      },
      {
        id: 'b',
        label: 'Reactant B',
        formula: 'O₂(g)',
        coefficient: 1,
        molarMass: 32.0,
        inputType: 'mass',
        availableInputs: ['mass', 'gas', 'moles', 'particles'],
        defaults: { mass: '2.00', gasVolume: '1.50', moles: '0.0625' },
      },
    ],
  },
  precipitate: {
    label: 'Solutions to precipitate',
    shortLabel: 'Precipitate',
    description: 'Mix two aqueous reactants, find the limiting ion pair, then mass of precipitate.',
    equation: 'AgNO₃(aq) + NaCl(aq) → AgCl(s) + NaNO₃(aq)',
    product: {
      formula: 'AgCl(s)',
      coefficient: 1,
      molarMass: 143.3,
      outputType: 'mass',
      availableOutputs: ['mass', 'moles'],
    },
    reactants: [
      {
        id: 'a',
        label: 'Reactant A',
        formula: 'AgNO₃(aq)',
        coefficient: 1,
        molarMass: 169.9,
        inputType: 'solution',
        availableInputs: ['solution', 'moles', 'mass'],
        defaults: { concentration: '0.100', solutionVolume: '25.0', mass: '0.425' },
      },
      {
        id: 'b',
        label: 'Reactant B',
        formula: 'NaCl(aq)',
        coefficient: 1,
        molarMass: 58.5,
        inputType: 'solution',
        availableInputs: ['solution', 'moles', 'mass'],
        defaults: { concentration: '0.0800', solutionVolume: '50.0', mass: '0.234' },
      },
    ],
  },
  solutionGas: {
    label: 'Solution and solid to gas',
    shortLabel: 'Solution to gas',
    description: 'Acid reacts with a carbonate; limiting reactant controls the gas volume.',
    equation: 'CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g)',
    product: {
      formula: 'CO₂(g)',
      coefficient: 1,
      molarMass: 44.0,
      outputType: 'gas',
      availableOutputs: ['gas', 'mass', 'moles'],
    },
    reactants: [
      {
        id: 'a',
        label: 'Reactant A',
        formula: 'CaCO₃(s)',
        coefficient: 1,
        molarMass: 100.1,
        inputType: 'mass',
        availableInputs: ['mass', 'moles', 'particles'],
        defaults: { mass: '2.50', moles: '0.0250' },
      },
      {
        id: 'b',
        label: 'Reactant B',
        formula: 'HCl(aq)',
        coefficient: 2,
        molarMass: 36.5,
        inputType: 'solution',
        availableInputs: ['solution', 'moles', 'mass'],
        defaults: { concentration: '0.500', solutionVolume: '40.0', mass: '1.46' },
      },
    ],
  },
  gasReaction: {
    label: 'Gas volumes',
    shortLabel: 'Gas reaction',
    description: 'Use gas volumes as mole ratios, then show which gas remains in excess.',
    equation: 'N₂(g) + 3H₂(g) → 2NH₃(g)',
    product: {
      formula: 'NH₃(g)',
      coefficient: 2,
      molarMass: 17.0,
      outputType: 'gas',
      availableOutputs: ['gas', 'mass', 'moles'],
    },
    reactants: [
      {
        id: 'a',
        label: 'Reactant A',
        formula: 'N₂(g)',
        coefficient: 1,
        molarMass: 28.0,
        inputType: 'gas',
        availableInputs: ['gas', 'moles', 'mass'],
        defaults: { gasVolume: '12.0', mass: '14.0', moles: '0.500' },
      },
      {
        id: 'b',
        label: 'Reactant B',
        formula: 'H₂(g)',
        coefficient: 3,
        molarMass: 2.0,
        inputType: 'gas',
        availableInputs: ['gas', 'moles', 'mass'],
        defaults: { gasVolume: '24.0', mass: '2.00', moles: '1.00' },
      },
    ],
  },
  finalConcentration: {
    label: 'Final concentration after mixing',
    shortLabel: 'Final concentration',
    description: 'Compare reacting solutions, then use total mixture volume for concentration.',
    equation: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)',
    product: {
      formula: 'NaCl(aq)',
      coefficient: 1,
      molarMass: 58.5,
      outputType: 'solution',
      availableOutputs: ['solution', 'moles', 'mass'],
    },
    reactants: [
      {
        id: 'a',
        label: 'Reactant A',
        formula: 'HCl(aq)',
        coefficient: 1,
        molarMass: 36.5,
        inputType: 'solution',
        availableInputs: ['solution', 'moles', 'mass'],
        defaults: { concentration: '0.100', solutionVolume: '25.0', mass: '0.0913' },
      },
      {
        id: 'b',
        label: 'Reactant B',
        formula: 'NaOH(aq)',
        coefficient: 1,
        molarMass: 40.0,
        inputType: 'solution',
        availableInputs: ['solution', 'moles', 'mass'],
        defaults: { concentration: '0.0800', solutionVolume: '50.0', mass: '0.160' },
      },
    ],
  },
}

const stageOrder = ['equation', 'moles-a', 'moles-b', 'compare', 'product', 'answer', 'excess']

const reactantMapNodes = [
  { type: 'gas', label: 'Gas volume', kind: 'volume', a: { x: 8, y: 16 }, b: { x: 92, y: 16 } },
  { type: 'mass', label: 'Mass', kind: 'mass', a: { x: 27, y: 16 }, b: { x: 73, y: 16 } },
  { type: 'solution', label: 'Solution volume', kind: 'volume', a: { x: 8, y: 48 }, b: { x: 92, y: 48 } },
  { type: 'pure-volume', label: 'Pure volume', kind: 'volume', a: { x: 8, y: 77 }, b: { x: 92, y: 77 } },
  { type: 'particles', label: 'Particles', kind: 'particles', a: { x: 27, y: 82 }, b: { x: 73, y: 82 } },
]

const productMapNodes = [
  { type: 'mass', label: 'Mass', kind: 'mass', x: 28, y: 91 },
  { type: 'gas', label: 'Gas volume', kind: 'volume', x: 39, y: 91 },
  { type: 'solution', label: 'Final concentration', kind: 'volume', x: 50, y: 91 },
  { type: 'particles', label: 'Particles', kind: 'particles', x: 61, y: 91 },
  { type: 'pure-volume', label: 'Pure volume', kind: 'volume', x: 72, y: 91 },
]

const visualLines = [
  { id: 'a-gas', prefix: 'a', type: 'gas', stage: 'moles-a', x1: 15, y1: 22, x2: 28, y2: 42, label: 'V ÷ 24.0', lx: 21, ly: 29 },
  { id: 'a-mass', prefix: 'a', type: 'mass', stage: 'moles-a', x1: 27, y1: 24, x2: 32, y2: 39, label: '÷ Mᵣ', lx: 31, ly: 31 },
  { id: 'a-solution', prefix: 'a', type: 'solution', stage: 'moles-a', x1: 15, y1: 48, x2: 26, y2: 48, label: 'c × V', lx: 21, ly: 43 },
  { id: 'a-pure-volume', prefix: 'a', type: 'pure-volume', stage: 'moles-a', x1: 15, y1: 75, x2: 27, y2: 58, label: 'density then Mᵣ', lx: 20, ly: 65 },
  { id: 'a-particles', prefix: 'a', type: 'particles', stage: 'moles-a', x1: 27, y1: 75, x2: 31, y2: 60, label: '÷ Nₐ', lx: 31, ly: 68 },
  { id: 'b-gas', prefix: 'b', type: 'gas', stage: 'moles-b', x1: 85, y1: 22, x2: 72, y2: 42, label: 'V ÷ 24.0', lx: 79, ly: 29 },
  { id: 'b-mass', prefix: 'b', type: 'mass', stage: 'moles-b', x1: 73, y1: 24, x2: 68, y2: 39, label: '÷ Mᵣ', lx: 69, ly: 31 },
  { id: 'b-solution', prefix: 'b', type: 'solution', stage: 'moles-b', x1: 85, y1: 48, x2: 74, y2: 48, label: 'c × V', lx: 79, ly: 43 },
  { id: 'b-pure-volume', prefix: 'b', type: 'pure-volume', stage: 'moles-b', x1: 85, y1: 75, x2: 73, y2: 58, label: 'density then Mᵣ', lx: 80, ly: 65 },
  { id: 'b-particles', prefix: 'b', type: 'particles', stage: 'moles-b', x1: 73, y1: 75, x2: 69, y2: 60, label: '÷ Nₐ', lx: 69, ly: 68 },
  { id: 'a-compare', stage: 'compare', x1: 38, y1: 48, x2: 43, y2: 36, label: 'n ÷ coefficient', lx: 40, ly: 38 },
  { id: 'b-compare', stage: 'compare', x1: 62, y1: 48, x2: 57, y2: 36, label: 'n ÷ coefficient', lx: 60, ly: 38 },
  { id: 'compare-product', stage: 'product', x1: 50, y1: 39, x2: 50, y2: 58, label: 'limiting × product ratio', lx: 50, ly: 49 },
  { id: 'product-mass', outputType: 'mass', stage: 'answer', x1: 48, y1: 68, x2: 28, y2: 84, label: '× Mᵣ', lx: 35, ly: 76 },
  { id: 'product-gas', outputType: 'gas', stage: 'answer', x1: 49, y1: 69, x2: 39, y2: 84, label: '× 24.0', lx: 42, ly: 77 },
  { id: 'product-solution', outputType: 'solution', stage: 'answer', x1: 50, y1: 69, x2: 50, y2: 84, label: '÷ total V', lx: 54, ly: 77 },
  { id: 'product-particles', outputType: 'particles', stage: 'answer', x1: 51, y1: 69, x2: 61, y2: 84, label: '× Nₐ', lx: 58, ly: 77 },
  { id: 'product-pure-volume', outputType: 'pure-volume', stage: 'answer', x1: 52, y1: 68, x2: 72, y2: 84, label: 'density', lx: 66, ly: 76 },
]

function readPositive(value) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : null
}

function formatValue(value, sigFigs = 3) {
  if (!Number.isFinite(value)) return 'Check values'
  return formatToSigFigs(value, sigFigs) || 'Check values'
}

function getInputTypeLabel(type) {
  return inputTypeOptions.find(option => option.value === type)?.label || 'Measurement'
}

function getOutputTypeLabel(type) {
  return productOutputOptions.find(option => option.value === type)?.label || 'Answer'
}

function createScenarioValues(scenarioId) {
  const scenario = scenarioLibrary[scenarioId]
  const values = {
    equation: scenario.equation,
    productFormula: scenario.product.formula,
    productCoefficient: String(scenario.product.coefficient),
    productMolarMass: String(scenario.product.molarMass),
    productOutputType: scenario.product.outputType,
    productDensity: scenario.product.density ? String(scenario.product.density) : '1.00',
    productFinalVolume: '',
  }

  scenario.reactants.forEach(reactant => {
    const prefix = reactant.id
    values[`${prefix}Formula`] = reactant.formula
    values[`${prefix}Coefficient`] = String(reactant.coefficient)
    values[`${prefix}MolarMass`] = String(reactant.molarMass)
    values[`${prefix}InputType`] = reactant.inputType
    values[`${prefix}Mass`] = reactant.defaults.mass || '1.00'
    values[`${prefix}GasVolume`] = reactant.defaults.gasVolume || '24.0'
    values[`${prefix}Concentration`] = reactant.defaults.concentration || '0.100'
    values[`${prefix}SolutionVolume`] = reactant.defaults.solutionVolume || '25.0'
    values[`${prefix}Particles`] = reactant.defaults.particles || '6.022e23'
    values[`${prefix}PureVolume`] = reactant.defaults.pureVolume || '10.0'
    values[`${prefix}Density`] = reactant.defaults.density || '1.00'
    values[`${prefix}Moles`] = reactant.defaults.moles || '0.100'
  })

  return values
}

function getReactant(values, prefix) {
  return {
    prefix,
    formula: values[`${prefix}Formula`],
    coefficient: readPositive(values[`${prefix}Coefficient`]),
    molarMass: readPositive(values[`${prefix}MolarMass`]),
    inputType: values[`${prefix}InputType`],
    mass: readPositive(values[`${prefix}Mass`]),
    gasVolume: readPositive(values[`${prefix}GasVolume`]),
    concentration: readPositive(values[`${prefix}Concentration`]),
    solutionVolume: readPositive(values[`${prefix}SolutionVolume`]),
    particles: readPositive(values[`${prefix}Particles`]),
    pureVolume: readPositive(values[`${prefix}PureVolume`]),
    density: readPositive(values[`${prefix}Density`]),
    directMoles: readPositive(values[`${prefix}Moles`]),
  }
}

function reactantToMoles(reactant) {
  if (reactant.inputType === 'mass') {
    return reactant.mass && reactant.molarMass ? reactant.mass / reactant.molarMass : null
  }
  if (reactant.inputType === 'solution') {
    return reactant.concentration && reactant.solutionVolume ? reactant.concentration * reactant.solutionVolume / 1000 : null
  }
  if (reactant.inputType === 'gas') {
    return reactant.gasVolume ? reactant.gasVolume / gasMolarVolume : null
  }
  if (reactant.inputType === 'particles') {
    return reactant.particles ? reactant.particles / avogadro : null
  }
  if (reactant.inputType === 'pure-volume') {
    return reactant.pureVolume && reactant.density && reactant.molarMass
      ? reactant.pureVolume * reactant.density / reactant.molarMass
      : null
  }
  return reactant.directMoles
}

function inputCalculationLine(reactant) {
  if (reactant.inputType === 'mass') return `n = mass ÷ Mᵣ`
  if (reactant.inputType === 'solution') return `n = c × V ÷ 1000`
  if (reactant.inputType === 'gas') return `n = V ÷ 24.0`
  if (reactant.inputType === 'particles') return `n = particles ÷ Nₐ`
  if (reactant.inputType === 'pure-volume') return `mass = volume × density, then n = mass ÷ Mᵣ`
  return `n is given directly`
}

function inputDetailLine(reactant) {
  if (reactant.inputType === 'mass') return `${reactant.mass ?? '?'} g ÷ ${reactant.molarMass ?? '?'} g mol⁻¹`
  if (reactant.inputType === 'solution') return `${reactant.concentration ?? '?'} mol dm⁻³ × ${reactant.solutionVolume ?? '?'} cm³ ÷ 1000`
  if (reactant.inputType === 'gas') return `${reactant.gasVolume ?? '?'} dm³ ÷ 24.0 dm³ mol⁻¹`
  if (reactant.inputType === 'particles') return `${reactant.particles ?? '?'} ÷ 6.022 × 10²³`
  if (reactant.inputType === 'pure-volume') return `${reactant.pureVolume ?? '?'} cm³ × ${reactant.density ?? '?'} g cm⁻³ ÷ ${reactant.molarMass ?? '?'} g mol⁻¹`
  return `${reactant.directMoles ?? '?'} mol`
}

function measuredInputs(values) {
  const inputs = []
  ;['a', 'b'].forEach(prefix => {
    const type = values[`${prefix}InputType`]
    if (type === 'mass') inputs.push(values[`${prefix}Mass`])
    if (type === 'solution') inputs.push(values[`${prefix}Concentration`], values[`${prefix}SolutionVolume`])
    if (type === 'gas') inputs.push(values[`${prefix}GasVolume`])
    if (type === 'particles') inputs.push(values[`${prefix}Particles`])
    if (type === 'pure-volume') inputs.push(values[`${prefix}PureVolume`], values[`${prefix}Density`])
    if (type === 'moles') inputs.push(values[`${prefix}Moles`])
  })
  if (values.productOutputType === 'solution') inputs.push(values.productFinalVolume)
  return inputs
}

function automaticSolutionVolume(values) {
  const total = ['a', 'b'].reduce((sum, prefix) => {
    if (values[`${prefix}InputType`] !== 'solution') return sum
    const volume = readPositive(values[`${prefix}SolutionVolume`])
    return volume ? sum + volume : sum
  }, 0)
  return total > 0 ? total : null
}

function productToAnswer(productMoles, values) {
  const molarMass = readPositive(values.productMolarMass)
  const outputType = values.productOutputType
  if (!Number.isFinite(productMoles) || !molarMass) return null

  if (outputType === 'mass') {
    return {
      value: productMoles * molarMass,
      unit: 'g',
      line: `mass = n × Mᵣ`,
      detail: `${productMoles} mol × ${molarMass} g mol⁻¹`,
    }
  }

  if (outputType === 'gas') {
    return {
      value: productMoles * gasMolarVolume,
      unit: 'dm³',
      line: `V = n × 24.0 at RTP`,
      detail: `${productMoles} mol × 24.0 dm³ mol⁻¹`,
    }
  }

  if (outputType === 'solution') {
    const finalVolume = readPositive(values.productFinalVolume) || automaticSolutionVolume(values)
    return finalVolume
      ? {
          value: productMoles / (finalVolume / 1000),
          unit: 'mol dm⁻³',
          line: `c = n ÷ Vtotal`,
          detail: `${productMoles} mol ÷ (${finalVolume} cm³ ÷ 1000)`,
          finalVolume,
        }
      : null
  }

  if (outputType === 'particles') {
    return {
      value: productMoles * avogadro,
      unit: 'particles',
      line: `particles = n × Nₐ`,
      detail: `${productMoles} mol × 6.022 × 10²³`,
    }
  }

  if (outputType === 'pure-volume') {
    const density = readPositive(values.productDensity)
    return density
      ? {
          value: productMoles * molarMass / density,
          unit: 'cm³',
          line: `volume = mass ÷ density`,
          detail: `${productMoles} mol × ${molarMass} g mol⁻¹ ÷ ${density} g cm⁻³`,
        }
      : null
  }

  return {
    value: productMoles,
    unit: 'mol',
    line: `amount is already in moles`,
    detail: `${productMoles} mol`,
  }
}

function convertExcessMolesToStartingUnit(reactant, excessMoles, finalVolume) {
  if (!Number.isFinite(excessMoles)) return null
  if (reactant.inputType === 'mass' && reactant.molarMass) {
    return { value: excessMoles * reactant.molarMass, unit: 'g' }
  }
  if (reactant.inputType === 'solution' && finalVolume) {
    return { value: excessMoles / (finalVolume / 1000), unit: 'mol dm⁻³', note: 'in final mixture' }
  }
  if (reactant.inputType === 'gas') {
    return { value: excessMoles * gasMolarVolume, unit: 'dm³', note: 'at RTP' }
  }
  if (reactant.inputType === 'particles') {
    return { value: excessMoles * avogadro, unit: 'particles' }
  }
  if (reactant.inputType === 'pure-volume' && reactant.molarMass && reactant.density) {
    return { value: excessMoles * reactant.molarMass / reactant.density, unit: 'cm³' }
  }
  return { value: excessMoles, unit: 'mol' }
}

function formatConvertedValue(item, sigFigs) {
  if (!item || !Number.isFinite(item.value)) return ''
  return `${formatValue(item.value, sigFigs)} ${item.unit}${item.note ? ` ${item.note}` : ''}`
}

function measurementDisplay(values, prefix) {
  const type = values[`${prefix}InputType`]
  if (type === 'mass') return `${values[`${prefix}Mass`]} g`
  if (type === 'solution') return `${values[`${prefix}Concentration`]} mol dm⁻³, ${values[`${prefix}SolutionVolume`]} cm³`
  if (type === 'gas') return `${values[`${prefix}GasVolume`]} dm³ at RTP`
  if (type === 'particles') return `${values[`${prefix}Particles`]} particles`
  if (type === 'pure-volume') return `${values[`${prefix}PureVolume`]} cm³, ${values[`${prefix}Density`]} g cm⁻³`
  return `${values[`${prefix}Moles`]} mol`
}

function outputDisplay(result, values, sigFigs) {
  if (values.productOutputType === 'moles') {
    return result === null ? 'Check values' : `${formatValue(result.productMoles, sigFigs)} mol`
  }
  return result?.answer ? `${formatValue(result.answer.value, sigFigs)} ${result.answer.unit}` : 'Check values'
}

function renderInputFields(prefix, values, updateValue) {
  const inputType = values[`${prefix}InputType`]

  if (inputType === 'mass') {
    return (
      <label className="calculator-field">
        <span>Mass</span>
        <div>
          <input type="number" step="any" value={values[`${prefix}Mass`]} onChange={event => updateValue(`${prefix}Mass`, event.target.value)} />
          <b>g</b>
        </div>
      </label>
    )
  }

  if (inputType === 'solution') {
    return (
      <div className="stoich-mini-field-grid">
        <label className="calculator-field">
          <span>Concentration</span>
          <div>
            <input type="number" step="any" value={values[`${prefix}Concentration`]} onChange={event => updateValue(`${prefix}Concentration`, event.target.value)} />
            <b>mol dm⁻³</b>
          </div>
        </label>
        <label className="calculator-field">
          <span>Volume</span>
          <div>
            <input type="number" step="any" value={values[`${prefix}SolutionVolume`]} onChange={event => updateValue(`${prefix}SolutionVolume`, event.target.value)} />
            <b>cm³</b>
          </div>
        </label>
      </div>
    )
  }

  if (inputType === 'gas') {
    return (
      <label className="calculator-field">
        <span>Gas volume at RTP</span>
        <div>
          <input type="number" step="any" value={values[`${prefix}GasVolume`]} onChange={event => updateValue(`${prefix}GasVolume`, event.target.value)} />
          <b>dm³</b>
        </div>
      </label>
    )
  }

  if (inputType === 'particles') {
    return (
      <label className="calculator-field">
        <span>Particles</span>
        <div>
          <input type="text" value={values[`${prefix}Particles`]} onChange={event => updateValue(`${prefix}Particles`, event.target.value)} />
          <b>particles</b>
        </div>
      </label>
    )
  }

  if (inputType === 'pure-volume') {
    return (
      <div className="stoich-mini-field-grid">
        <label className="calculator-field">
          <span>Pure volume</span>
          <div>
            <input type="number" step="any" value={values[`${prefix}PureVolume`]} onChange={event => updateValue(`${prefix}PureVolume`, event.target.value)} />
            <b>cm³</b>
          </div>
        </label>
        <label className="calculator-field">
          <span>Density</span>
          <div>
            <input type="number" step="any" value={values[`${prefix}Density`]} onChange={event => updateValue(`${prefix}Density`, event.target.value)} />
            <b>g cm⁻³</b>
          </div>
        </label>
      </div>
    )
  }

  return (
    <label className="calculator-field">
      <span>Amount</span>
      <div>
        <input type="number" step="any" value={values[`${prefix}Moles`]} onChange={event => updateValue(`${prefix}Moles`, event.target.value)} />
        <b>mol</b>
      </div>
    </label>
  )
}

export default function StoichiometryFlowSimulator({ standalone = false }) {
  const [scenarioId, setScenarioId] = useState('massToMass')
  const [isPlaying, setIsPlaying] = useState(true)
  const [activeStageIndex, setActiveStageIndex] = useState(0)
  const [values, setValues] = useState(() => createScenarioValues('massToMass'))

  const scenario = scenarioLibrary[scenarioId]
  const sigFigs = fewestSigFigs(...measuredInputs(values)) || 3

  const result = useMemo(() => {
    const reactantA = getReactant(values, 'a')
    const reactantB = getReactant(values, 'b')
    const molesA = reactantToMoles(reactantA)
    const molesB = reactantToMoles(reactantB)
    const productCoefficient = readPositive(values.productCoefficient)

    if (
      molesA === null ||
      molesB === null ||
      !reactantA.coefficient ||
      !reactantB.coefficient ||
      !productCoefficient
    ) {
      return null
    }

    const capacityA = molesA / reactantA.coefficient
    const capacityB = molesB / reactantB.coefficient
    const extent = Math.min(capacityA, capacityB)
    const nearEqual = Math.abs(capacityA - capacityB) <= Math.max(capacityA, capacityB) * 1e-9
    const limitingKey = nearEqual ? 'both' : capacityA < capacityB ? 'a' : 'b'
    const productMoles = extent * productCoefficient
    const answer = productToAnswer(productMoles, values)
    const finalVolume = answer?.finalVolume || automaticSolutionVolume(values)

    const usedA = extent * reactantA.coefficient
    const usedB = extent * reactantB.coefficient
    const excessA = Math.max(0, molesA - usedA)
    const excessB = Math.max(0, molesB - usedB)

    return {
      reactantA,
      reactantB,
      molesA,
      molesB,
      capacityA,
      capacityB,
      extent,
      limitingKey,
      productMoles,
      answer,
      usedA,
      usedB,
      excessA,
      excessB,
      excessADisplay: convertExcessMolesToStartingUnit(reactantA, excessA, finalVolume),
      excessBDisplay: convertExcessMolesToStartingUnit(reactantB, excessB, finalVolume),
    }
  }, [values])

  const activeStage = stageOrder[activeStageIndex]

  useEffect(() => {
    setActiveStageIndex(0)
  }, [scenarioId])

  useEffect(() => {
    if (!isPlaying) return undefined
    const timer = window.setInterval(() => {
      setActiveStageIndex(previous => (previous + 1) % stageOrder.length)
    }, 1500)
    return () => window.clearInterval(timer)
  }, [isPlaying])

  function updateValue(key, value) {
    setValues(previous => ({ ...previous, [key]: value }))
  }

  function selectScenario(nextScenarioId) {
    setScenarioId(nextScenarioId)
    setValues(createScenarioValues(nextScenarioId))
    setIsPlaying(true)
    setActiveStageIndex(0)
  }

  function selectInputType(prefix, type) {
    const reactantDefinition = scenario.reactants.find(reactant => reactant.id === prefix)
    if (!reactantDefinition?.availableInputs.includes(type)) return
    updateValue(`${prefix}InputType`, type)
    setIsPlaying(false)
    setActiveStageIndex(prefix === 'a' ? 1 : 2)
  }

  function selectProductOutput(type) {
    if (!scenario.product.availableOutputs.includes(type)) return
    updateValue('productOutputType', type)
    setIsPlaying(false)
    setActiveStageIndex(type === 'moles' ? 4 : 5)
  }

  function visualLineClass(line) {
    let selected = true
    let available = true
    if (line.prefix) selected = values[`${line.prefix}InputType`] === line.type
    if (line.outputType) {
      available = scenario.product.availableOutputs.includes(line.outputType)
      selected = values.productOutputType === line.outputType
    }
    return `stoich-visual-line ${selected && available ? 'selected' : ''} ${selected && available && activeStage === line.stage ? 'active' : ''} ${available ? '' : 'disabled'}`
  }

  function visualLineLabelClass(line) {
    let selected = true
    let available = true
    if (line.prefix) selected = values[`${line.prefix}InputType`] === line.type
    if (line.outputType) {
      available = scenario.product.availableOutputs.includes(line.outputType)
      selected = values.productOutputType === line.outputType
    }
    return `stoich-visual-link-label ${selected && available ? 'selected' : ''} ${available ? '' : 'disabled'}`
  }

  function renderReactantMapNode(prefix, node) {
    const reactantDefinition = scenario.reactants.find(reactant => reactant.id === prefix)
    const available = reactantDefinition?.availableInputs.includes(node.type)
    const selected = values[`${prefix}InputType`] === node.type
    const active = selected && activeStage === `moles-${prefix}`
    const coords = node[prefix]

    return (
      <button
        className={`stoich-visual-node reactant-node ${node.kind} ${selected ? 'selected' : ''} ${active ? 'active' : ''} ${available ? '' : 'disabled'}`}
        disabled={!available}
        key={`${prefix}-${node.type}`}
        onClick={() => selectInputType(prefix, node.type)}
        style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
        type="button"
      >
        <span>{node.label} of {prefix.toUpperCase()}</span>
        <strong>{values[`${prefix}Formula`]}</strong>
        <small>{selected ? measurementDisplay(values, prefix) : getInputTypeLabel(node.type)}</small>
      </button>
    )
  }

  function renderMolesMapNode(prefix) {
    const reactantDefinition = scenario.reactants.find(reactant => reactant.id === prefix)
    const canUseDirectMoles = reactantDefinition?.availableInputs.includes('moles')
    const selected = values[`${prefix}InputType`] === 'moles'
    const active = activeStage === `moles-${prefix}`
    const left = prefix === 'a' ? 32 : 68

    return (
      <button
        className={`stoich-visual-node moles-node ${selected ? 'selected' : ''} ${active ? 'active' : ''}`}
        disabled={!canUseDirectMoles}
        onClick={() => selectInputType(prefix, 'moles')}
        style={{ left: `${left}%`, top: '48%' }}
        type="button"
      >
        <span>Moles of {prefix.toUpperCase()}</span>
        <strong>{result === null ? 'Check values' : `${formatValue(prefix === 'a' ? result.molesA : result.molesB, sigFigs)} mol`}</strong>
        <small>{selected ? 'Given directly' : inputCalculationLine(result?.[`reactant${prefix.toUpperCase()}`] || getReactant(values, prefix))}</small>
      </button>
    )
  }

  function renderProductMapNode(node) {
    const available = scenario.product.availableOutputs.includes(node.type)
    const selected = values.productOutputType === node.type
    const active = selected && activeStage === 'answer'

    return (
      <button
        className={`stoich-visual-node product-output-node ${node.kind} ${selected ? 'selected' : ''} ${active ? 'active' : ''} ${available ? '' : 'disabled'}`}
        disabled={!available}
        key={node.type}
        onClick={() => selectProductOutput(node.type)}
        style={{ left: `${node.x}%`, top: `${node.y}%` }}
        type="button"
      >
        <span>{node.label}</span>
        <strong>{available && selected ? outputDisplay(result, values, sigFigs) : getOutputTypeLabel(node.type)}</strong>
        <small>{available ? values.productFormula : 'Not used here'}</small>
      </button>
    )
  }

  function renderReactantCard(reactantDefinition) {
    const prefix = reactantDefinition.id
    const activeInputOptions = inputTypeOptions.filter(option => reactantDefinition.availableInputs.includes(option.value))

    return (
      <article className="stoich-reactant-input-card" key={prefix}>
        <div className="stoich-card-heading">
          <span>{reactantDefinition.label}</span>
          <strong>{values[`${prefix}Formula`]}</strong>
        </div>

        <div className="stoich-mini-field-grid">
          <label className="calculator-field">
            <span>Formula</span>
            <div>
              <input value={values[`${prefix}Formula`]} onChange={event => updateValue(`${prefix}Formula`, event.target.value)} />
              <b>species</b>
            </div>
          </label>
          <label className="calculator-field">
            <span>Coefficient</span>
            <div>
              <input type="number" step="any" value={values[`${prefix}Coefficient`]} onChange={event => updateValue(`${prefix}Coefficient`, event.target.value)} />
              <b>ratio</b>
            </div>
          </label>
        </div>

        <div className="stoich-mini-field-grid">
          <label className="calculator-field">
            <span>Mᵣ</span>
            <div>
              <input type="number" step="any" value={values[`${prefix}MolarMass`]} onChange={event => updateValue(`${prefix}MolarMass`, event.target.value)} />
              <b>g mol⁻¹</b>
            </div>
          </label>
          <label className="calculator-field">
            <span>Start from</span>
            <div>
              <select value={values[`${prefix}InputType`]} onChange={event => updateValue(`${prefix}InputType`, event.target.value)}>
                {activeInputOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </label>
        </div>

        {renderInputFields(prefix, values, updateValue)}
      </article>
    )
  }

  return (
    <section className={`calculator-app stoich-flow-simulator-app ${standalone ? 'standalone-tool' : ''}`}>
      <div className="calculator-topline">
        <div>
          <p className="eyebrow">Stoichiometry flow simulator</p>
          <h2>Limiting reactant first, answer second</h2>
        </div>
        <span className="calculator-badge">{scenario.label}</span>
      </div>

      <div className="calculator-mode-grid">
        {Object.entries(scenarioLibrary).map(([id, item]) => (
          <button className={id === scenarioId ? 'active' : ''} key={id} type="button" onClick={() => selectScenario(id)}>
            {item.shortLabel}
          </button>
        ))}
      </div>

      <div className="stoich-sim-controls">
        <button type="button" onClick={() => setIsPlaying(previous => !previous)}>
          {isPlaying ? 'Pause animation' : 'Play animation'}
        </button>
        <button type="button" onClick={() => { setIsPlaying(false); setActiveStageIndex(previous => (previous + 1) % stageOrder.length) }}>
          Next step
        </button>
      </div>

      <div className="stoich-visual-map-shell">
        <div className="stoich-visual-map-header">
          <div>
            <span>Balanced reaction</span>
            <strong>{values.equation}</strong>
          </div>
          <p>{scenario.description}</p>
        </div>

        <div className="stoich-visual-map" aria-label="Visual stoichiometry map with limiting reactant and excess">
          <svg className="stoich-visual-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <marker id="stoichVisualArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" />
              </marker>
            </defs>
            {visualLines.map(line => (
              <line
                className={visualLineClass(line)}
                key={line.id}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
              />
            ))}
          </svg>

          {visualLines.map(line => (
            <span
              className={visualLineLabelClass(line)}
              key={`${line.id}-label`}
              style={{ left: `${line.lx}%`, top: `${line.ly}%` }}
            >
              {line.label}
            </span>
          ))}

          {reactantMapNodes.map(node => renderReactantMapNode('a', node))}
          {reactantMapNodes.map(node => renderReactantMapNode('b', node))}
          {renderMolesMapNode('a')}
          {renderMolesMapNode('b')}

          <button
            className={`stoich-visual-node limiting-node ${activeStage === 'compare' ? 'active' : ''}`}
            onClick={() => { setIsPlaying(false); setActiveStageIndex(3) }}
            style={{ left: '50%', top: '32%' }}
            type="button"
          >
            <span>Limiting check</span>
            <strong>{result === null ? 'Check values' : result.limitingKey === 'both' ? 'Exact ratio' : `${result.limitingKey.toUpperCase()} limits`}</strong>
            <small>
              {result === null
                ? 'Compare n ÷ coefficient'
                : `A: ${formatValue(result.capacityA, sigFigs)} | B: ${formatValue(result.capacityB, sigFigs)}`}
            </small>
          </button>

          <button
            className={`stoich-visual-node product-moles-node ${values.productOutputType === 'moles' ? 'selected' : ''} ${activeStage === 'product' ? 'active' : ''}`}
            disabled={!scenario.product.availableOutputs.includes('moles')}
            onClick={() => selectProductOutput('moles')}
            style={{ left: '50%', top: '64%' }}
            type="button"
          >
            <span>Moles of product</span>
            <strong>{result === null ? 'Check values' : `${formatValue(result.productMoles, sigFigs)} mol`}</strong>
            <small>{values.productFormula}</small>
          </button>

          {productMapNodes.map(renderProductMapNode)}

          <div className={`stoich-leftover-badge a ${activeStage === 'excess' ? 'active' : ''}`} style={{ left: '32%', top: '65%' }}>
            <span>A left</span>
            <strong>{result === null ? '?' : `${formatValue(result.excessA, sigFigs)} mol`}</strong>
            <small>{result === null ? '' : formatConvertedValue(result.excessADisplay, sigFigs)}</small>
          </div>

          <div className={`stoich-leftover-badge b ${activeStage === 'excess' ? 'active' : ''}`} style={{ left: '68%', top: '65%' }}>
            <span>B left</span>
            <strong>{result === null ? '?' : `${formatValue(result.excessB, sigFigs)} mol`}</strong>
            <small>{result === null ? '' : formatConvertedValue(result.excessBDisplay, sigFigs)}</small>
          </div>
        </div>
      </div>

      <div className="stoich-sim-card-grid">
        <article className="stoich-equation-input-card">
          <div className="stoich-card-heading">
            <span>Balanced equation</span>
            <strong>{scenario.shortLabel}</strong>
          </div>
          <label className="calculator-field">
            <span>Equation</span>
            <div>
              <input value={values.equation} onChange={event => updateValue('equation', event.target.value)} />
              <b>ratio</b>
            </div>
          </label>
          <p>{scenario.description}</p>
        </article>

        {scenario.reactants.map(renderReactantCard)}

        <article className="stoich-product-input-card">
          <div className="stoich-card-heading">
            <span>Product target</span>
            <strong>{values.productFormula}</strong>
          </div>
          <div className="stoich-mini-field-grid">
            <label className="calculator-field">
              <span>Formula</span>
              <div>
                <input value={values.productFormula} onChange={event => updateValue('productFormula', event.target.value)} />
                <b>species</b>
              </div>
            </label>
            <label className="calculator-field">
              <span>Coefficient</span>
              <div>
                <input type="number" step="any" value={values.productCoefficient} onChange={event => updateValue('productCoefficient', event.target.value)} />
                <b>ratio</b>
              </div>
            </label>
          </div>
          <div className="stoich-mini-field-grid">
            <label className="calculator-field">
              <span>Mᵣ</span>
              <div>
                <input type="number" step="any" value={values.productMolarMass} onChange={event => updateValue('productMolarMass', event.target.value)} />
                <b>g mol⁻¹</b>
              </div>
            </label>
            <label className="calculator-field">
              <span>Answer as</span>
              <div>
                <select value={values.productOutputType} onChange={event => updateValue('productOutputType', event.target.value)}>
                  {productOutputOptions
                    .filter(option => scenario.product.availableOutputs.includes(option.value))
                    .map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
              </div>
            </label>
          </div>

          {values.productOutputType === 'solution' && (
            <label className="calculator-field">
              <span>Final mixture volume</span>
              <div>
                <input
                  type="number"
                  step="any"
                  placeholder="auto"
                  value={values.productFinalVolume}
                  onChange={event => updateValue('productFinalVolume', event.target.value)}
                />
                <b>cm³</b>
              </div>
            </label>
          )}

          {values.productOutputType === 'pure-volume' && (
            <label className="calculator-field">
              <span>Product density</span>
              <div>
                <input type="number" step="any" value={values.productDensity} onChange={event => updateValue('productDensity', event.target.value)} />
                <b>g cm⁻³</b>
              </div>
            </label>
          )}
        </article>
      </div>

      <div className="calculator-working stoich-working-grid">
        <div>
          <span>Limiting reactant</span>
          <strong>{result === null ? 'Check values' : result.limitingKey === 'both' ? 'Neither, exact reacting ratio' : result.limitingKey === 'a' ? values.aFormula : values.bFormula}</strong>
        </div>
        <div>
          <span>Reactant A used</span>
          <strong>{result === null ? 'Check values' : `${formatValue(result.usedA, sigFigs)} mol of ${values.aFormula}`}</strong>
        </div>
        <div>
          <span>Reactant B used</span>
          <strong>{result === null ? 'Check values' : `${formatValue(result.usedB, sigFigs)} mol of ${values.bFormula}`}</strong>
        </div>
        <div>
          <span>Product formed</span>
          <strong>{result === null ? 'Check values' : `${formatValue(result.productMoles, sigFigs)} mol of ${values.productFormula}`}</strong>
        </div>
        <div>
          <span>Final answer</span>
          <strong>{result?.answer ? `${formatValue(result.answer.value, sigFigs)} ${result.answer.unit}` : 'Check values'}</strong>
        </div>
      </div>
    </section>
  )
}
