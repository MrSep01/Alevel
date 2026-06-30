import MoleCalculator from '../tools/MoleCalculator.jsx'
import ConcentrationCalculator from '../tools/ConcentrationCalculator.jsx'
import FormulaMassCalculator from '../tools/FormulaMassCalculator.jsx'

export default function InteractiveTools() {
  return (
    <div className="page">
      <div className="section-header">
        <div>
          <p className="eyebrow">Interactive Tools</p>
          <h1>Chemistry Calculators and Simulations</h1>
          <p>Version 1 includes calculation tools. Later versions can add graphing and simulations.</p>
        </div>
      </div>

      <section className="grid-3">
        <MoleCalculator />
        <ConcentrationCalculator />
        <FormulaMassCalculator />
      </section>

      <section className="section grid-3">
        <article className="card">
          <p className="eyebrow">Next Tool</p>
          <h3>Titration Curve Simulator</h3>
          <p>Plot pH against volume added and show equivalence point, buffer region, and indicator range.</p>
        </article>
        <article className="card">
          <p className="eyebrow">Next Tool</p>
          <h3>Rate Equation Builder</h3>
          <p>Students compare initial-rate data and construct the experimental rate equation.</p>
        </article>
        <article className="card">
          <p className="eyebrow">Next Tool</p>
          <h3>Organic Mechanism Builder</h3>
          <p>Students choose nucleophiles, electrophiles, and curly arrows to build valid mechanisms.</p>
        </article>
      </section>
    </div>
  )
}
