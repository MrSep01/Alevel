import { ArrowLeft, Calculator } from 'lucide-react'
import MoleCalculator from '../tools/MoleCalculator.jsx'

export default function MoleRelationshipToolPage({ navigate }) {
  return (
    <div className="page tool-page-wide stoich-standalone-page">
      <div className="standalone-tool-header">
        <button className="secondary-action" type="button" onClick={() => navigate('tools')}>
          <ArrowLeft size={18} /> Back to tools
        </button>
        <div>
          <p className="eyebrow"><Calculator size={18} /> Mole Relationships</p>
          <h1>Convert between mass, moles, particles, and gas volume</h1>
          <p>
            Start every stoichiometry question by getting into moles. This tool shows the formula,
            substitution, answer, units, and significant-figure logic.
          </p>
        </div>
      </div>

      <MoleCalculator standalone />
    </div>
  )
}
