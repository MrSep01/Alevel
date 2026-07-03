import { ArrowLeft, Scale } from 'lucide-react'
import LimitingReagentTool from '../tools/LimitingReagentTool.jsx'

export default function LimitingReagentToolPage({ navigate }) {
  return (
    <div className="page tool-page-wide stoich-standalone-page">
      <div className="standalone-tool-header">
        <button className="secondary-action" type="button" onClick={() => navigate('tools')}>
          <ArrowLeft size={18} /> Back to tools
        </button>
        <div>
          <p className="eyebrow"><Scale size={18} /> Limiting Reagent</p>
          <h1>Find the reactant that limits product formation</h1>
          <p>
            Compare available moles divided by coefficients, identify the limiting reagent,
            calculate excess left over, and find the theoretical yield.
          </p>
        </div>
      </div>

      <LimitingReagentTool standalone />
    </div>
  )
}
