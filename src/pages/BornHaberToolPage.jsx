import { ArrowLeft, Pyramid } from 'lucide-react'
import BornHaberCycleBuilder from '../tools/BornHaberCycleBuilder.jsx'

export default function BornHaberToolPage({ navigate }) {
  return (
    <div className="page tool-page-wide born-haber-standalone-page">
      <div className="standalone-tool-header">
        <button className="secondary-action" type="button" onClick={() => navigate('tools')}>
          <ArrowLeft size={18} /> Back to tools
        </button>
        <div>
          <p className="eyebrow"><Pyramid size={18} /> Born-Haber Cycle</p>
          <h1>Build the ionic enthalpy cycle step by step</h1>
          <p>
            Use the full-page diagram to connect the direct formation route with atomisation,
            ionisation, electron affinity, and lattice enthalpy.
          </p>
        </div>
      </div>

      <BornHaberCycleBuilder standalone />
    </div>
  )
}
