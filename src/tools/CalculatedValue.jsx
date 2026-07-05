import { formatToScientificSigFigs, formatToSigFigs } from './significantFigures.js'

export default function CalculatedValue({
  value,
  sigFigs = 3,
  unit = '',
  fallback = 'Check values',
  scientificLabel = 'Scientific form',
}) {
  const numericValue = Number(value)

  if (!Number.isFinite(numericValue)) {
    return <strong className="calculated-value unavailable">{fallback}</strong>
  }

  const primary = formatToSigFigs(numericValue, sigFigs)
  const scientific = formatToScientificSigFigs(numericValue, sigFigs)
  const unitText = unit ? `${unit === '%' ? '' : ' '}${unit}` : ''

  return (
    <>
      <strong className="calculated-value">
        {primary}
        {unit && <span className="calculated-unit">{unitText}</span>}
      </strong>
      <small className="scientific-value">
        {scientificLabel}: {scientific}{unitText} · {sigFigs} s.f.
      </small>
    </>
  )
}
