import { ArrowLeft, Route } from 'lucide-react'
import StoichiometryFlowSimulator from '../tools/StoichiometryFlowSimulator.jsx'

export default function StoichiometryFlowToolPage({ navigate }) {
  return (
    <div className="page tool-page-wide stoich-standalone-page">
      <div className="standalone-tool-header">
        <button className="secondary-action" type="button" onClick={() => navigate('tools')}>
          <ArrowLeft size={18} /> Back to tools
        </button>
        <div>
          <p className="eyebrow"><Route size={18} /> Stoichiometry Flow</p>
          <h1>Animate the route from measurement to product answer</h1>
          <p>
            Follow the full stoichiometry map from mass, concentration and volume, gas volume,
            particles, or density through moles of A, moles of B, and the final required unit.
          </p>
        </div>
      </div>

      <StoichiometryFlowSimulator standalone />
    </div>
  )
}
