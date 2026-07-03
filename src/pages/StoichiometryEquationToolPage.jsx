import { ArrowLeft, GitBranch } from 'lucide-react'
import StoichiometryEquationSolver from '../tools/StoichiometryEquationSolver.jsx'

export default function StoichiometryEquationToolPage({ navigate }) {
  return (
    <div className="page tool-page-wide stoich-standalone-page">
      <div className="standalone-tool-header">
        <button className="secondary-action" type="button" onClick={() => navigate('tools')}>
          <ArrowLeft size={18} /> Back to tools
        </button>
        <div>
          <p className="eyebrow"><GitBranch size={18} /> Equation Stoichiometry</p>
          <h1>Use balanced equations to calculate unknown amounts</h1>
          <p>
            Choose a known substance, convert it to moles, apply the balanced-equation ratio,
            then convert the answer into the unit the question asks for.
          </p>
        </div>
      </div>

      <StoichiometryEquationSolver standalone />
    </div>
  )
}
