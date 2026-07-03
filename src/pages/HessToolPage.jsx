import { ArrowLeft, Route } from 'lucide-react'
import HessCycleBuilder from '../tools/HessCycleBuilder.jsx'

export default function HessToolPage({ navigate }) {
  return (
    <div className="page tool-page-wide hess-standalone-page">
      <div className="standalone-tool-header">
        <button className="secondary-action" type="button" onClick={() => navigate('tools')}>
          <ArrowLeft size={18} /> Back to tools
        </button>
        <div>
          <p className="eyebrow"><Route size={18} /> Hess's Law Cycle</p>
          <h1>Compare direct and indirect enthalpy routes clearly</h1>
          <p>
            Use the full-page workspace to follow a direct reaction route against two or more
            indirect reactions, including reversed equations, multipliers, and sign changes.
          </p>
        </div>
      </div>

      <HessCycleBuilder standalone />
    </div>
  )
}
