import { Atom, Beaker, Calculator, FlaskConical, GitBranch, LineChart, Percent, Workflow, Gauge, FlaskRound, Scale, RefreshCw, BatteryCharging, Route, Pyramid } from 'lucide-react'
import { useState } from 'react'
import ConcentrationCalculator from '../tools/ConcentrationCalculator.jsx'
import FormulaMassCalculator from '../tools/FormulaMassCalculator.jsx'
import TitrationCurveSimulator from '../tools/TitrationCurveSimulator.jsx'
import RateEquationBuilder from '../tools/RateEquationBuilder.jsx'
import OrganicMechanismBuilder from '../tools/OrganicMechanismBuilder.jsx'
import EmpiricalFormulaBuilder from '../tools/EmpiricalFormulaBuilder.jsx'
import MolecularFormulaCalculator from '../tools/MolecularFormulaCalculator.jsx'
import TitrationSolver from '../tools/TitrationSolver.jsx'
import PHCalculator from '../tools/PHCalculator.jsx'
import EquilibriumKcCalculator from '../tools/EquilibriumKcCalculator.jsx'
import GasVolumeCalculator from '../tools/GasVolumeCalculator.jsx'
import YieldEconomyCalculator from '../tools/YieldEconomyCalculator.jsx'
import UnitConverter from '../tools/UnitConverter.jsx'
import ElectrochemicalCellCalculator from '../tools/ElectrochemicalCellCalculator.jsx'

const calculatorApps = [
  {
    id: 'stoich-flow',
    group: 'stoichiometry',
    title: 'Stoichiometry Flow Simulator',
    subtitle: 'Open the animated map from mass, cV, gas volume, or particles to product answer',
    icon: Route,
    page: 'stoich-flow-tool',
  },
  {
    id: 'moles',
    group: 'stoichiometry',
    title: 'Mole Relationship Calculator',
    subtitle: 'Open the full-page mass, moles, particles, and gas-volume converter',
    icon: Calculator,
    page: 'mole-relationship-tool',
  },
  {
    id: 'concentration',
    group: 'core',
    title: 'Concentration Calculator',
    subtitle: 'Concentration, amount, volume, dilution, and titration links',
    icon: FlaskConical,
  },
  {
    id: 'formula',
    group: 'formula',
    title: 'Formula Mass Calculator',
    subtitle: 'Relative formula mass with clear element breakdown',
    icon: Atom,
  },
  {
    id: 'empirical',
    group: 'formula',
    title: 'Empirical Formula Builder',
    subtitle: 'Mass or percentage data to mole ratio and formula',
    icon: Scale,
  },
  {
    id: 'molecular',
    group: 'formula',
    title: 'Molecular Formula Calculator',
    subtitle: 'Empirical formula and Mᵣ to molecular formula',
    icon: Atom,
  },
  {
    id: 'gas',
    group: 'stoichiometry',
    title: 'Gas Volume Calculator',
    subtitle: 'Moles, molar gas volume, and reacting gas ratios',
    icon: Gauge,
  },
  {
    id: 'stoich-equation',
    group: 'stoichiometry',
    title: 'Equation Stoichiometry Solver',
    subtitle: 'Open the full-page mole-ratio workflow from known to unknown',
    icon: GitBranch,
    page: 'stoich-equation-tool',
  },
  {
    id: 'limiting-reagent',
    group: 'stoichiometry',
    title: 'Limiting Reagent Tool',
    subtitle: 'Open the full-page limiting reagent and theoretical yield workflow',
    icon: Scale,
    page: 'limiting-reagent-tool',
  },
  {
    id: 'titration',
    group: 'stoichiometry',
    title: 'Titration Curve Simulator',
    subtitle: 'pH curve, equivalence point, buffer region, and indicators',
    icon: LineChart,
  },
  {
    id: 'titration-solver',
    group: 'stoichiometry',
    title: 'Titration Calculation Solver',
    subtitle: 'Unknown concentration from titre and equation ratio',
    icon: FlaskRound,
  },
  {
    id: 'ph',
    group: 'equilibrium',
    title: 'pH Calculator',
    subtitle: 'Strong acids, bases, weak acids, and buffers',
    icon: FlaskConical,
  },
  {
    id: 'kc',
    group: 'equilibrium',
    title: 'Kc Calculator',
    subtitle: 'Equilibrium concentrations and expression powers',
    icon: RefreshCw,
  },
  {
    id: 'rate',
    group: 'equilibrium',
    title: 'Rate Equation Builder',
    subtitle: 'Compare initial-rate data and construct the rate law',
    icon: GitBranch,
  },
  {
    id: 'mechanism',
    group: 'organic',
    title: 'Organic Mechanism Builder',
    subtitle: 'Choose reagents, electron-pair moves, and products',
    icon: Workflow,
  },
  {
    id: 'yield',
    group: 'stoichiometry',
    title: 'Yield and Atom Economy',
    subtitle: 'Percentage yield and atom economy checks',
    icon: Percent,
  },
  {
    id: 'electrochemical',
    group: 'energetics',
    title: 'Electrochemical Cell Simulator',
    subtitle: 'Animated half-cells, electron flow, salt bridge, and Eᶿcell',
    icon: BatteryCharging,
  },
  {
    id: 'hess',
    group: 'energetics',
    title: 'Hess Cycle Builder',
    subtitle: 'Open the full-page direct and indirect enthalpy route builder',
    icon: Route,
    page: 'hess-tool',
  },
  {
    id: 'born-haber',
    group: 'energetics',
    title: 'Born-Haber Cycle Builder',
    subtitle: 'Open the full-page ionic lattice enthalpy cycle',
    icon: Pyramid,
    page: 'born-haber-tool',
  },
  {
    id: 'units',
    group: 'core',
    title: 'Unit Converter',
    subtitle: 'Common chemistry unit conversions',
    icon: Calculator,
  },
]

const calculatorGroups = [
  { id: 'core', label: 'Core calculations' },
  { id: 'formula', label: 'Formula work' },
  { id: 'stoichiometry', label: 'Stoichiometry' },
  { id: 'equilibrium', label: 'Rates, pH, equilibrium' },
  { id: 'organic', label: 'Organic chemistry' },
  { id: 'energetics', label: 'Energetics and redox' },
]

const toolGuidance = {
  moles: {
    bestFor: 'Moving between mass, amount, particles, and gas volume.',
    examHabit: 'Write the equation triangle first, then substitute with units.',
    watchFor: 'Use dm³ for gases and solutions unless the question gives cm³.',
  },
  'stoich-flow': {
    bestFor: 'Seeing the whole stoichiometry route as an animated conversion map.',
    examHabit: 'Convert the given measurement to moles before using the balanced equation.',
    watchFor: 'Mass, cV, gas volume, particles, and density all enter the same mole bridge.',
  },
  'stoich-equation': {
    bestFor: 'Using a balanced equation to calculate an unknown mass, mole amount, or gas volume.',
    examHabit: 'Convert the known substance to moles before using the coefficient ratio.',
    watchFor: 'Never use grams directly in the ratio step.',
  },
  'limiting-reagent': {
    bestFor: 'Finding which reactant runs out first and how much product can form.',
    examHabit: 'Divide each reactant moles by its coefficient before comparing.',
    watchFor: 'The reactant with the smallest reaction capacity is limiting.',
  },
  concentration: {
    bestFor: 'Solution concentration, dilution, and titration amount links.',
    examHabit: 'Convert cm³ to dm³ before using concentration equations.',
    watchFor: 'Keep concentration units consistent: mol dm⁻³ or g dm⁻³.',
  },
  formula: {
    bestFor: 'Checking Mᵣ, ionic formula units, and percentage composition.',
    examHabit: 'Balance brackets and charges before calculating the formula mass.',
    watchFor: 'Subscripts multiply everything inside brackets.',
  },
  empirical: {
    bestFor: 'Turning mass or percentage composition into a simplest formula.',
    examHabit: 'Divide by Aᵣ, then divide every mole value by the smallest.',
    watchFor: 'Ratios near 1.5, 1.33, or 1.25 usually need multiplying.',
  },
  molecular: {
    bestFor: 'Using empirical formula and Mᵣ to find the molecular formula.',
    examHabit: 'Find the empirical formula mass before scaling the subscripts.',
    watchFor: 'The multiplier should be a whole number in exam questions.',
  },
  gas: {
    bestFor: 'Gas volume questions and reacting gas ratios.',
    examHabit: 'Use the mole ratio from the balanced equation.',
    watchFor: 'Molar gas volume depends on conditions, usually 24.0 dm³ mol⁻¹ at RTP.',
  },
  titration: {
    bestFor: 'Visualising equivalence point, buffer region, and indicator choice.',
    examHabit: 'Match the steep section of the curve to the indicator range.',
    watchFor: 'Weak acid or weak base curves do not start/end like strong acid-base curves.',
  },
  'titration-solver': {
    bestFor: 'Finding an unknown concentration from titre and equation ratio.',
    examHabit: 'Average concordant titres before doing the stoichiometry.',
    watchFor: 'Do not use all titres automatically if one is clearly rough.',
  },
  ph: {
    bestFor: 'Strong acids, strong bases, weak acids, and buffer pH.',
    examHabit: 'Identify the acid/base type before choosing the equation.',
    watchFor: 'pH and [H⁺] use powers of ten, so keep calculator notation clean.',
  },
  kc: {
    bestFor: 'Building Kc expressions and calculating equilibrium values.',
    examHabit: 'Use equilibrium concentrations, not starting concentrations.',
    watchFor: 'Solids and liquids are left out of Kc expressions.',
  },
  rate: {
    bestFor: 'Finding orders from initial-rate data.',
    examHabit: 'Compare experiments where only one concentration changes.',
    watchFor: 'If doubling concentration doubles rate, the order is 1.',
  },
  mechanism: {
    bestFor: 'Practising organic mechanism choices and electron-pair movement.',
    examHabit: 'Start every curly arrow from a lone pair or bond.',
    watchFor: 'Nucleophiles attack electron-poor atoms, not the whole molecule.',
  },
  yield: {
    bestFor: 'Percentage yield and atom economy questions.',
    examHabit: 'Separate practical yield from theoretical yield before substituting.',
    watchFor: 'Atom economy uses formula masses from the balanced equation.',
  },
  electrochemical: {
    bestFor: 'Seeing which half-cell oxidises, which reduces, and where electrons move.',
    examHabit: 'Choose the higher Eᶿ reduction potential as the cathode before calculating.',
    watchFor: 'Electrons travel through the wire; ions move through the salt bridge to balance charge.',
  },
  hess: {
    bestFor: 'Finding ΔH reaction from formation or combustion data.',
    examHabit: 'Draw the cycle first so the formula sign makes sense.',
    watchFor: 'Formation and combustion cycles use opposite subtraction patterns.',
  },
  'born-haber': {
    bestFor: 'Guided lattice enthalpy and formation enthalpy questions.',
    examHabit: 'Label each arrow with sign and state symbols before calculating.',
    watchFor: 'Atomisation and ionisation are usually positive; lattice formation is negative.',
  },
  units: {
    bestFor: 'Quick chemistry unit conversions before calculations.',
    examHabit: 'Convert units at the start and carry units through working.',
    watchFor: 'cm³ to dm³ means divide by 1000.',
  },
}

export default function InteractiveTools({ navigate }) {
  const [activeCalculator, setActiveCalculator] = useState('concentration')
  const selectedApp = calculatorApps.find(app => app.id === activeCalculator) || calculatorApps[0]
  const selectedGuidance = toolGuidance[selectedApp.id]
  const ActiveTool = {
    concentration: ConcentrationCalculator,
    formula: FormulaMassCalculator,
    empirical: EmpiricalFormulaBuilder,
    molecular: MolecularFormulaCalculator,
    gas: GasVolumeCalculator,
    titration: TitrationCurveSimulator,
    'titration-solver': TitrationSolver,
    ph: PHCalculator,
    kc: EquilibriumKcCalculator,
    rate: RateEquationBuilder,
    mechanism: OrganicMechanismBuilder,
    yield: YieldEconomyCalculator,
    electrochemical: ElectrochemicalCellCalculator,
    units: UnitConverter,
  }[activeCalculator] || ConcentrationCalculator

  return (
    <div className="page">
      <div className="section-header calculator-suite-header">
        <div>
          <p className="eyebrow"><Beaker size={18} /> Interactive Tools</p>
          <h1>Chemistry calculator suite</h1>
          <p>Choose one calculator, enter your own values, and see the equation, working, answer, units, and significant-figure logic.</p>
        </div>
      </div>

      <section className="calculator-suite">
        <aside className="calculator-menu" aria-label="Calculator apps">
          {calculatorGroups.map(group => (
            <div className="calculator-menu-group" key={group.id}>
              <span className="calculator-menu-label">{group.label}</span>
              {calculatorApps.filter(app => app.group === group.id).map(app => {
                const Icon = app.icon
                return (
                  <button
                    className={`${activeCalculator === app.id ? 'active' : ''} ${app.page ? 'launch-tool' : ''}`}
                    key={app.id}
                    type="button"
                    onClick={() => app.page ? navigate(app.page) : setActiveCalculator(app.id)}
                  >
                    <Icon size={22} />
                    <span>
                      <strong>{app.title}</strong>
                      <small>{app.subtitle}{app.page ? ' →' : ''}</small>
                    </span>
                  </button>
                )
              })}
            </div>
          ))}
        </aside>

        <main className="calculator-workspace">
          <section className="tool-guidance-panel">
            <div>
              <p className="eyebrow">Selected tool</p>
              <h2>{selectedApp.title}</h2>
              <p>{selectedApp.subtitle}</p>
            </div>
            <div className="tool-guidance-grid">
              <div>
                <span>Best for</span>
                <strong>{selectedGuidance.bestFor}</strong>
              </div>
              <div>
                <span>Exam habit</span>
                <strong>{selectedGuidance.examHabit}</strong>
              </div>
              <div>
                <span>Watch out</span>
                <strong>{selectedGuidance.watchFor}</strong>
              </div>
            </div>
          </section>

          <ActiveTool />
        </main>
      </section>
    </div>
  )
}
