export function countSignificantFigures(input) {
  const text = String(input).trim().toLowerCase()
  if (!text || Number(text) === 0 || Number.isNaN(Number(text))) return null

  const usesScientificNotation = text.includes('e')
  const [coefficient] = text.split('e')
  const normalized = coefficient.replace(/^[-+]/, '')

  if (normalized.includes('.')) {
    const digits = normalized.replace('.', '')
    const significant = digits.replace(/^0+/, '')
    return significant.length || null
  }

  if (usesScientificNotation) {
    const significant = normalized.replace(/^0+/, '')
    return significant.length || null
  }

  if (!usesScientificNotation && /0$/.test(normalized)) {
    return null
  }

  const significant = normalized.replace(/^0+/, '')
  return significant.length || null
}

export function formatToSigFigs(value, sigFigs) {
  if (value === null || value === undefined || !Number.isFinite(Number(value)) || !sigFigs) {
    return ''
  }
  return formatScientificNotation(Number(value).toPrecision(sigFigs))
}

export function formatToScientificSigFigs(value, sigFigs) {
  if (value === null || value === undefined || !Number.isFinite(Number(value)) || !sigFigs) {
    return ''
  }
  const exponentPlaces = Math.max(0, Number(sigFigs) - 1)
  return formatScientificNotation(Number(value).toExponential(exponentPlaces))
}

export function fewestSigFigs(...inputs) {
  const counts = inputs.map(countSignificantFigures).filter(Boolean)
  return counts.length ? Math.min(...counts) : null
}

function toSuperscript(value) {
  const superscriptCharacters = {
    '-': '⁻',
    '+': '⁺',
    0: '⁰',
    1: '¹',
    2: '²',
    3: '³',
    4: '⁴',
    5: '⁵',
    6: '⁶',
    7: '⁷',
    8: '⁸',
    9: '⁹',
  }
  return String(value).split('').map(character => superscriptCharacters[character] || character).join('')
}

function formatScientificNotation(value) {
  if (!String(value).includes('e')) return value
  const [coefficient, exponent] = String(value).split('e')
  return `${coefficient} × 10${toSuperscript(Number(exponent))}`
}
