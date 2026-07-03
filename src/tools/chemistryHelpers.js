export const atomicMasses = {
  H: 1.0,
  C: 12.0,
  N: 14.0,
  O: 16.0,
  Na: 23.0,
  Mg: 24.3,
  Al: 27.0,
  Si: 28.1,
  P: 31.0,
  S: 32.1,
  Cl: 35.5,
  K: 39.1,
  Ca: 40.1,
  Fe: 55.8,
  Cu: 63.5,
  Zn: 65.4,
  Br: 79.9,
  Ag: 107.9,
  I: 126.9,
  Ba: 137.3,
  Pb: 207.2,
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

export function formatFormula(formula) {
  return String(formula || '').replace(/\d/g, digit => subscriptCharacters[digit])
}

export function toSuperscript(value) {
  return String(value).split('').map(character => superscriptCharacters[character] || character).join('')
}

export function formatScientific(value, places = 3) {
  if (!Number.isFinite(Number(value))) return 'Check values'
  const [coefficient, exponent] = Number(value).toExponential(places - 1).split('e')
  return `${Number(coefficient).toPrecision(places)} × 10${toSuperscript(Number(exponent))}`
}

export function gcd(first, second) {
  let a = Math.abs(Math.round(first))
  let b = Math.abs(Math.round(second))
  while (b) {
    const next = b
    b = a % b
    a = next
  }
  return a || 1
}

export function parseSimpleFormula(formula) {
  const matches = String(formula || '').replace(/\s+/g, '').match(/([A-Z][a-z]?)(\d*)/g)
  if (!matches) return null

  const counts = {}
  for (const match of matches) {
    const [, symbol, countText] = match.match(/([A-Z][a-z]?)(\d*)/)
    if (!atomicMasses[symbol]) return { error: `${symbol} is not in the mass table yet.` }
    counts[symbol] = (counts[symbol] || 0) + (countText ? Number(countText) : 1)
  }

  const mr = Object.entries(counts).reduce((total, [symbol, count]) => total + atomicMasses[symbol] * count, 0)
  return { counts, mr }
}
