import { useMemo, useState } from 'react'
import CalculatedValue from './CalculatedValue.jsx'
import FormulaStrip from './FormulaStrip.jsx'
import { countSignificantFigures, formatToSigFigs } from './significantFigures.js'

const atomicMasses = {
  H: 1.0,
  He: 4.0,
  Li: 6.9,
  Be: 9.0,
  B: 10.8,
  C: 12.0,
  N: 14.0,
  O: 16.0,
  F: 19.0,
  Ne: 20.2,
  Na: 23.0,
  Mg: 24.3,
  Al: 27.0,
  Si: 28.1,
  P: 31.0,
  S: 32.1,
  Cl: 35.5,
  Ar: 39.9,
  K: 39.1,
  Ca: 40.1,
  Cr: 52.0,
  Mn: 54.9,
  Fe: 55.8,
  Ni: 58.7,
  Cu: 63.5,
  Zn: 65.4,
  Br: 79.9,
  Ag: 107.9,
  Sn: 118.7,
  I: 126.9,
  Ba: 137.3,
  Pb: 207.2,
}

const cations = [
  { formula: 'NH4', name: 'ammonium', charges: [1] },
  { formula: 'Li', name: 'lithium', charges: [1] },
  { formula: 'Na', name: 'sodium', charges: [1] },
  { formula: 'K', name: 'potassium', charges: [1] },
  { formula: 'Ag', name: 'silver', charges: [1] },
  { formula: 'Mg', name: 'magnesium', charges: [2] },
  { formula: 'Ca', name: 'calcium', charges: [2] },
  { formula: 'Ba', name: 'barium', charges: [2] },
  { formula: 'Zn', name: 'zinc', charges: [2] },
  { formula: 'Al', name: 'aluminium', charges: [3] },
  { formula: 'Fe', name: 'iron', charges: [2, 3] },
  { formula: 'Cu', name: 'copper', charges: [1, 2] },
  { formula: 'Sn', name: 'tin', charges: [2, 4] },
  { formula: 'Pb', name: 'lead', charges: [2, 4] },
]

const anions = [
  { formula: 'NO3', name: 'nitrate', charge: -1 },
  { formula: 'OH', name: 'hydroxide', charge: -1 },
  { formula: 'HCO3', name: 'hydrogencarbonate', charge: -1 },
  { formula: 'Cl', name: 'chloride', charge: -1 },
  { formula: 'Br', name: 'bromide', charge: -1 },
  { formula: 'I', name: 'iodide', charge: -1 },
  { formula: 'F', name: 'fluoride', charge: -1 },
  { formula: 'SO4', name: 'sulfate', charge: -2 },
  { formula: 'CO3', name: 'carbonate', charge: -2 },
  { formula: 'SO3', name: 'sulfite', charge: -2 },
  { formula: 'O', name: 'oxide', charge: -2 },
  { formula: 'S', name: 'sulfide', charge: -2 },
  { formula: 'PO4', name: 'phosphate', charge: -3 },
  { formula: 'N', name: 'nitride', charge: -3 },
]

function mergeCounts(target, source, multiplier = 1) {
  Object.entries(source).forEach(([symbol, count]) => {
    target[symbol] = (target[symbol] || 0) + count * multiplier
  })
}

const subscriptCharacters = {
  0: '₀',
  1: '₁',
  2: '₂',
  3: '₃',
  4: '₄',
  5: '₅',
  6: '₆',
  7: '₇',
  8: '₈',
  9: '₉',
}

const normalCharacters = Object.fromEntries(
  Object.entries(subscriptCharacters).map(([number, subscript]) => [subscript, number])
)

function normalizeFormulaInput(value) {
  return String(value).split('').map(character => normalCharacters[character] || character).join('')
}

function parseFormula(formula) {
  const cleanFormula = normalizeFormulaInput(formula).replace(/\s+/g, '')
  if (!cleanFormula) return null

  const stack = [{}]
  let index = 0

  while (index < cleanFormula.length) {
    const character = cleanFormula[index]

    if (character === '(') {
      stack.push({})
      index += 1
      continue
    }

    if (character === ')') {
      if (stack.length === 1) return { error: 'Check brackets: there is a closing bracket without an opening bracket.' }
      index += 1
      let multiplierText = ''
      while (/\d/.test(cleanFormula[index] || '')) {
        multiplierText += cleanFormula[index]
        index += 1
      }
      const group = stack.pop()
      mergeCounts(stack[stack.length - 1], group, multiplierText ? Number(multiplierText) : 1)
      continue
    }

    if (/[A-Z]/.test(character)) {
      let symbol = character
      index += 1
      if (/[a-z]/.test(cleanFormula[index] || '')) {
        symbol += cleanFormula[index]
        index += 1
      }

      if (!atomicMasses[symbol]) {
        return { error: `Element ${symbol} is not in the mass table yet.` }
      }

      let countText = ''
      while (/\d/.test(cleanFormula[index] || '')) {
        countText += cleanFormula[index]
        index += 1
      }
      stack[stack.length - 1][symbol] = (stack[stack.length - 1][symbol] || 0) + (countText ? Number(countText) : 1)
      continue
    }

    return { error: `The formula contains an unsupported character: ${character}` }
  }

  if (stack.length !== 1) return { error: 'Check brackets: at least one bracket is not closed.' }

  const counts = stack[0]
  const parts = Object.entries(counts).map(([symbol, count]) => {
    const mass = atomicMasses[symbol]
    const contribution = mass * count
    return { symbol, count, mass, contribution }
  })
  const total = parts.reduce((sum, part) => sum + part.contribution, 0)

  return { counts, parts, total }
}

function formatFormula(formula) {
  const cleanFormula = normalizeFormulaInput(formula).replace(/\s+/g, '')
  if (!cleanFormula) return ''
  return cleanFormula.split('').map(character => subscriptCharacters[character] || character).join('')
}

function greatestCommonDivisor(first, second) {
  let a = Math.abs(first)
  let b = Math.abs(second)
  while (b) {
    const next = b
    b = a % b
    a = next
  }
  return a || 1
}

function formatCharge(value) {
  const sign = value > 0 ? '⁺' : '⁻'
  const magnitude = Math.abs(value)
  return magnitude === 1 ? sign : `${magnitude}${sign}`.replace(/\d/g, digit => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(digit)])
}

function buildIonicFormula(cation, cationCount, anion, anionCount) {
  const cationFormula = cationCount > 1 ? `${cation.formula}${cationCount}` : cation.formula
  const needsAnionBrackets = anionCount > 1 && anion.formula.length > 1
  const anionFormula = needsAnionBrackets
    ? `(${anion.formula})${anionCount}`
    : `${anion.formula}${anionCount > 1 ? anionCount : ''}`
  return formatFormula(`${cationFormula}${anionFormula}`)
}

function expectedIonicOptions(cation, anion) {
  return cation.charges.map(charge => {
    const ratio = greatestCommonDivisor(charge, Math.abs(anion.charge))
    const cationCount = Math.abs(anion.charge) / ratio
    const anionCount = charge / ratio
    return {
      charge,
      cationCount,
      anionCount,
      formula: buildIonicFormula(cation, cationCount, anion, anionCount),
    }
  })
}

function readNumber(text, startIndex) {
  let index = startIndex
  let digits = ''
  while (/\d/.test(text[index] || '')) {
    digits += text[index]
    index += 1
  }
  return { value: digits ? Number(digits) : 1, index }
}

function parseAnionRemainder(remainder) {
  if (!remainder) return null

  if (remainder.startsWith('(')) {
    const closingIndex = remainder.lastIndexOf(')')
    if (closingIndex <= 1) return null
    const anionFormula = remainder.slice(1, closingIndex)
    const countText = remainder.slice(closingIndex + 1)
    if (countText && !/^\d+$/.test(countText)) return null
    const anion = anions.find(item => item.formula === anionFormula)
    return anion ? { anion, anionCount: countText ? Number(countText) : 1 } : null
  }

  const sortedAnions = [...anions].sort((first, second) => second.formula.length - first.formula.length)
  for (const anion of sortedAnions) {
    if (!remainder.startsWith(anion.formula)) continue
    const countText = remainder.slice(anion.formula.length)
    if (countText && !/^\d+$/.test(countText)) continue
    return { anion, anionCount: countText ? Number(countText) : 1 }
  }

  return null
}

function validateIonicFormula(formula) {
  const cleanFormula = normalizeFormulaInput(formula).replace(/\s+/g, '')
  if (!cleanFormula) return null

  const sortedCations = [...cations].sort((first, second) => second.formula.length - first.formula.length)

  for (const cation of sortedCations) {
    if (!cleanFormula.startsWith(cation.formula)) continue
    const cationNumber = readNumber(cleanFormula, cation.formula.length)
    const parsedAnion = parseAnionRemainder(cleanFormula.slice(cationNumber.index))
    if (!parsedAnion) {
      return {
        status: 'invalid',
        message: `${formatFormula(cleanFormula)} starts with ${cation.name}, but the anion is not recognised yet.`,
      }
    }

    const options = expectedIonicOptions(cation, parsedAnion.anion)
    const matchedOption = options.find(option => (
      option.cationCount === cationNumber.value && option.anionCount === parsedAnion.anionCount
    ))

    if (matchedOption) {
      return {
        status: 'valid',
        message: `Valid formula unit: ${cation.formula}${formatCharge(matchedOption.charge)} balances ${parsedAnion.anion.formula}${formatCharge(parsedAnion.anion.charge)}.`,
      }
    }

    return {
      status: 'invalid',
      message: `This formula unit is not charge-balanced in the lowest ratio. Expected ${options.map(option => option.formula).join(' or ')}.`,
    }
  }

  return null
}

export default function FormulaMassCalculator() {
  const [formula, setFormula] = useState('Ca(OH)2')
  const [sampleMass, setSampleMass] = useState('2.50')
  const result = useMemo(() => parseFormula(formula), [formula])
  const displayedFormula = formatFormula(formula)
  const ionicValidation = useMemo(() => validateIonicFormula(formula), [formula])
  const hasIonicError = ionicValidation?.status === 'invalid'
  const moles = result?.total && Number(sampleMass) > 0 ? Number(sampleMass) / result.total : null
  const sampleSigFigs = countSignificantFigures(sampleMass) || 3

  return (
    <section className="calculator-app">
      <div className="calculator-topline">
        <div>
          <p className="eyebrow">Formula mass calculator</p>
        </div>
        <span className="calculator-badge">Mᵣ = Σ Aᵣ</span>
      </div>

      <FormulaStrip items={[
        { label: 'Formula mass', value: 'Mᵣ = Σ(Aᵣ × subscript)', tone: 'formula' },
        { label: 'Sample moles', value: 'n = mass ÷ Mᵣ', tone: 'conversion' },
        { label: 'Substitution', value: result?.total ? `${sampleMass} g ÷ ${result.total.toFixed(1)} g mol⁻¹` : 'Enter a valid formula first', tone: 'substitution' },
      ]} />

      <div className="calculator-body">
        <div className="calculator-input-panel">
          <label className="calculator-field">
            <span>Formula</span>
            <div>
              <input value={displayedFormula} onChange={event => setFormula(normalizeFormulaInput(event.target.value))} />
              <b>formula</b>
            </div>
            <small className="formula-preview">Type normal numbers; the calculator displays formula numbers as subscripts.</small>
          </label>
          <label className="calculator-field">
            <span>Sample mass</span>
            <div>
              <input type="number" step="any" value={sampleMass} onChange={event => setSampleMass(event.target.value)} />
              <b>g</b>
            </div>
          </label>
        </div>

        <div className="calculator-display">
          <span>Relative formula mass</span>
          <b className="displayed-formula">{displayedFormula || 'Formula'}</b>
          {result && !result.error && !hasIonicError ? (
            <CalculatedValue value={result.total} sigFigs={3} scientificLabel="Scientific form of Mᵣ" />
          ) : (
            <strong className="calculated-value unavailable">{!result ? 'Enter formula' : 'Check formula'}</strong>
          )}
          <small>{result?.error || ionicValidation?.message || (moles ? `${formatToSigFigs(moles, sampleSigFigs)} mol in ${sampleMass} g` : 'Add sample mass to calculate moles')}</small>
        </div>
      </div>

      {ionicValidation && (
        <div className={`ionic-validation ${ionicValidation.status}`}>
          <strong>{ionicValidation.status === 'valid' ? 'Ionic formula accepted' : 'Ionic formula not accepted'}</strong>
          <span>{ionicValidation.message}</span>
        </div>
      )}

      {result?.parts && !hasIonicError && (
        <>
          <div className="formula-breakdown">
            {result.parts.map(part => (
              <article key={part.symbol}>
                <span>{part.symbol}</span>
                <strong>{part.count > 1 ? `${part.mass.toFixed(1)} × ${part.count}` : part.mass.toFixed(1)}</strong>
                <small>{part.contribution.toFixed(1)} of Mᵣ · {((part.contribution / result.total) * 100).toFixed(1)}%</small>
              </article>
            ))}
          </div>

          <div className="calculator-working">
            <div>
              <span>Formula mass working</span>
              <strong>{result.parts.map(part => `${part.symbol}: ${part.count > 1 ? `${part.mass.toFixed(1)} × ${part.count}` : part.mass.toFixed(1)}`).join(' + ')}</strong>
            </div>
            <div>
              <span>Sample moles</span>
              <strong>{sampleMass} g ÷ {result.total.toFixed(1)} g mol⁻¹</strong>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
