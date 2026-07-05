import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import CalculatedValue from './CalculatedValue.jsx'
import FormulaStrip from './FormulaStrip.jsx'

const titrationTypes = [
  { id: 'strong-acid-strong-base', label: 'Strong acid with strong base' },
  { id: 'weak-acid-strong-base', label: 'Weak acid with strong base' },
]

const indicators = [
  { id: 'methyl-orange', label: 'Methyl orange', low: 3.1, high: 4.4 },
  { id: 'bromothymol-blue', label: 'Bromothymol blue', low: 6.0, high: 7.6 },
  { id: 'phenolphthalein', label: 'Phenolphthalein', low: 8.2, high: 10.0 },
]

function clampPh(value) {
  return Math.max(0, Math.min(14, value))
}

function formatValue(value, places = 2) {
  return Number(value).toFixed(places)
}

function calculateStrongAcidStrongBase({ acidConcentration, acidVolume, baseConcentration, baseVolume }) {
  const acidMoles = acidConcentration * acidVolume / 1000
  const baseMoles = baseConcentration * baseVolume / 1000
  const totalVolume = (acidVolume + baseVolume) / 1000

  if (baseMoles < acidMoles) {
    return -Math.log10((acidMoles - baseMoles) / totalVolume)
  }
  if (baseMoles > acidMoles) {
    const pOH = -Math.log10((baseMoles - acidMoles) / totalVolume)
    return 14 - pOH
  }
  return 7
}

function calculateWeakAcidStrongBase({ acidConcentration, acidVolume, baseConcentration, baseVolume, pKa }) {
  const acidMoles = acidConcentration * acidVolume / 1000
  const baseMoles = baseConcentration * baseVolume / 1000
  const totalVolume = (acidVolume + baseVolume) / 1000
  const Ka = 10 ** (-pKa)

  if (baseMoles === 0) {
    const h = Math.sqrt(Ka * acidConcentration)
    return -Math.log10(h)
  }
  if (baseMoles < acidMoles) {
    return pKa + Math.log10(baseMoles / (acidMoles - baseMoles))
  }
  if (baseMoles === acidMoles) {
    const conjugateBaseConcentration = acidMoles / totalVolume
    const Kb = 1e-14 / Ka
    const oh = Math.sqrt(Kb * conjugateBaseConcentration)
    return 14 + Math.log10(oh)
  }
  const pOH = -Math.log10((baseMoles - acidMoles) / totalVolume)
  return 14 - pOH
}

export default function TitrationCurveSimulator() {
  const [type, setType] = useState('weak-acid-strong-base')
  const [indicatorId, setIndicatorId] = useState('phenolphthalein')
  const [acidConcentration, setAcidConcentration] = useState('0.100')
  const [acidVolume, setAcidVolume] = useState('25.0')
  const [baseConcentration, setBaseConcentration] = useState('0.100')
  const [pKa, setPka] = useState('4.76')

  const selectedIndicator = indicators.find(indicator => indicator.id === indicatorId) || indicators[0]
  const acidC = Number(acidConcentration)
  const acidV = Number(acidVolume)
  const baseC = Number(baseConcentration)
  const pKaValue = Number(pKa)
  const equivalenceVolume = acidC > 0 && acidV > 0 && baseC > 0 ? (acidC * acidV) / baseC : 0

  const curveData = useMemo(() => {
    if (!equivalenceVolume || equivalenceVolume <= 0) return []
    const maxVolume = Math.max(equivalenceVolume * 2, equivalenceVolume + 25)
    const step = maxVolume / 80
    return Array.from({ length: 81 }, (_, index) => {
      const baseVolume = index * step
      const shared = {
        acidConcentration: acidC,
        acidVolume: acidV,
        baseConcentration: baseC,
        baseVolume,
        pKa: pKaValue,
      }
      const pH = type === 'weak-acid-strong-base'
        ? calculateWeakAcidStrongBase(shared)
        : calculateStrongAcidStrongBase(shared)
      return {
        volume: Number(baseVolume.toFixed(2)),
        pH: Number(clampPh(pH).toFixed(2)),
      }
    })
  }, [acidC, acidV, baseC, equivalenceVolume, pKaValue, type])

  const halfEquivalenceVolume = equivalenceVolume / 2

  return (
    <section className="calculator-app">
      <div className="calculator-topline">
        <div>
          <p className="eyebrow">Titration curve simulator</p>
        </div>
        <span className="calculator-badge">pH vs volume</span>
      </div>

      <FormulaStrip items={[
        { label: 'Moles from solution', value: 'n = c × V(cm³) × 10⁻³', tone: 'formula' },
        { label: 'Equivalence point', value: 'n(acid) = n(base) after ratio correction', tone: 'conversion' },
        { label: 'Substitution', value: `${acidConcentration} × ${acidVolume} × 10⁻³ and ${baseConcentration} × V(base) × 10⁻³`, tone: 'substitution' },
      ]} />

      <div className="calculator-body titration-layout">
        <div className="calculator-input-panel">
          <label className="calculator-field">
            <span>Titration type</span>
            <div>
              <select value={type} onChange={event => setType(event.target.value)}>
                {titrationTypes.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
              <b>type</b>
            </div>
          </label>
          <label className="calculator-field">
            <span>Acid concentration</span>
            <div>
              <input type="number" step="any" value={acidConcentration} onChange={event => setAcidConcentration(event.target.value)} />
              <b>mol dm⁻³</b>
            </div>
          </label>
          <label className="calculator-field">
            <span>Acid volume</span>
            <div>
              <input type="number" step="any" value={acidVolume} onChange={event => setAcidVolume(event.target.value)} />
              <b>cm³</b>
            </div>
          </label>
          <label className="calculator-field">
            <span>Base concentration</span>
            <div>
              <input type="number" step="any" value={baseConcentration} onChange={event => setBaseConcentration(event.target.value)} />
              <b>mol dm⁻³</b>
            </div>
          </label>
          {type === 'weak-acid-strong-base' && (
            <label className="calculator-field">
              <span>Weak acid pKₐ</span>
              <div>
                <input type="number" step="any" value={pKa} onChange={event => setPka(event.target.value)} />
                <b>pKₐ</b>
              </div>
            </label>
          )}
          <label className="calculator-field">
            <span>Indicator</span>
            <div>
              <select value={indicatorId} onChange={event => setIndicatorId(event.target.value)}>
                {indicators.map(indicator => (
                  <option key={indicator.id} value={indicator.id}>{indicator.label}</option>
                ))}
              </select>
              <b>range</b>
            </div>
          </label>
        </div>

        <div className="tool-chart-panel">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={curveData} margin={{ top: 12, right: 12, bottom: 8, left: 0 }}>
              <CartesianGrid stroke="#e8eef6" strokeDasharray="3 3" />
              <XAxis dataKey="volume" type="number" domain={[0, 'dataMax']} tick={{ fontSize: 12 }} label={{ value: 'Volume of base / cm³', position: 'insideBottom', offset: -2 }} />
              <YAxis domain={[0, 14]} tick={{ fontSize: 12 }} label={{ value: 'pH', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={value => [value, 'pH']} labelFormatter={value => `${value} cm³ base`} />
              <ReferenceArea y1={selectedIndicator.low} y2={selectedIndicator.high} fill="#fdb022" fillOpacity={0.16} />
              <ReferenceLine x={equivalenceVolume} stroke="#1a96f3" strokeWidth={2} label="Equivalence" />
              {type === 'weak-acid-strong-base' && <ReferenceLine x={halfEquivalenceVolume} stroke="#53d7aa" strokeDasharray="4 4" label="pH = pKₐ" />}
              <Line type="monotone" dataKey="pH" stroke="#26745e" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="tool-summary-grid">
        <article>
          <span>Equivalence volume</span>
          <CalculatedValue value={equivalenceVolume} sigFigs={3} unit="cm³" />
        </article>
        <article>
          <span>Indicator range</span>
          <strong>{selectedIndicator.label}: pH {selectedIndicator.low} to {selectedIndicator.high}</strong>
        </article>
        <article>
          <span>Buffer region</span>
          <strong>{type === 'weak-acid-strong-base' ? `Near ${formatValue(halfEquivalenceVolume)} cm³, pH ≈ pKₐ` : 'No buffer region for strong acid strong base'}</strong>
        </article>
      </div>
    </section>
  )
}
