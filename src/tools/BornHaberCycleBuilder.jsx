import { useEffect, useMemo, useState } from 'react'
import { formatFormula, toSuperscript } from './chemistryHelpers.js'

const stepSequence = ['formation', 'atom-metal', 'atom-nonmetal', 'ionisation', 'affinity', 'lattice']

const defaultSteps = [
  { id: 'atom-metal', label: 'Metal atomisation', value: '108' },
  { id: 'atom-nonmetal', label: 'Non-metal atomisation', value: '122' },
  { id: 'ionisation', label: 'Ionisation energy', value: '496' },
  { id: 'electron-affinity', label: 'Electron affinity', value: '-349' },
]

const cationCharges = { Li: 1, Na: 1, K: 1, Mg: 2, Ca: 2, Ba: 2, Al: 3, Zn: 2, Ag: 1, Fe: 2, Cu: 2, Pb: 2 }
const anionCharges = { F: 1, Cl: 1, Br: 1, I: 1, O: 2, S: 2, N: 3 }
const diatomicNonmetals = new Set(['F', 'Cl', 'Br', 'I', 'O', 'N', 'H'])

function readNumber(value) {
  if (String(value).trim() === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function formatEnergy(value) {
  if (!Number.isFinite(value)) return 'Check values'
  return `${value > 0 ? '+' : ''}${value.toFixed(1)} kJ mol⁻¹`
}

function formatShortEnergy(value) {
  if (!Number.isFinite(value)) return '?'
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}`
}

function parseFormulaParts(formula) {
  const clean = String(formula || '').replace(/\s+/g, '')
  const tokens = [...clean.matchAll(/([A-Z][a-z]?)(\d*)/g)].map(match => ({
    symbol: match[1],
    count: match[2] ? Number(match[2]) : 1,
  }))
  const metalToken = tokens.find(token => cationCharges[token.symbol]) || { symbol: 'Na', count: 1 }
  const nonmetalToken = tokens.find(token => token.symbol !== metalToken.symbol && anionCharges[token.symbol]) || { symbol: 'Cl', count: 1 }
  const metalCount = metalToken.count || 1
  const nonmetalCount = nonmetalToken.count || 1
  const metalCharge = cationCharges[metalToken.symbol] || 1
  const nonmetalCharge = anionCharges[nonmetalToken.symbol] || 1

  return {
    formula: clean || 'NaCl',
    metal: metalToken.symbol,
    nonmetal: nonmetalToken.symbol,
    metalCount,
    nonmetalCount,
    metalCharge,
    nonmetalCharge,
  }
}

function ionText(symbol, charge, sign) {
  return `${symbol}${charge === 1 ? (sign === '+' ? '⁺' : '⁻') : toSuperscript(`${charge}${sign}`)}`
}

function amountPrefix(amount) {
  if (amount === 1) return ''
  if (amount === 0.5) return '½'
  if (Number.isInteger(amount)) return String(amount)
  return `${amount}`
}

function coefficientPrefix(amount) {
  return amount === 1 ? '' : String(amount)
}

function electronText(count) {
  return count === 1 ? 'e⁻' : `${count}e⁻`
}

function buildSpecies(compound) {
  const parts = parseFormulaParts(compound)
  const formula = formatFormula(parts.formula)
  const metalCoefficient = coefficientPrefix(parts.metalCount)
  const nonmetalCoefficient = coefficientPrefix(parts.nonmetalCount)
  const cation = ionText(parts.metal, parts.metalCharge, '+')
  const anion = ionText(parts.nonmetal, parts.nonmetalCharge, '-')
  const electronCount = parts.metalCount * parts.metalCharge
  const nonmetalStandard = diatomicNonmetals.has(parts.nonmetal)
    ? `${amountPrefix(parts.nonmetalCount / 2)}${formatFormula(`${parts.nonmetal}2`)}(g)`
    : `${nonmetalCoefficient}${parts.nonmetal}(s)`

  return {
    formula,
    start: `${metalCoefficient}${parts.metal}(s) + ${nonmetalStandard}`,
    metalAtomised: `${metalCoefficient}${parts.metal}(g) + ${nonmetalStandard}`,
    atoms: `${metalCoefficient}${parts.metal}(g) + ${nonmetalCoefficient}${parts.nonmetal}(g)`,
    ionised: `${metalCoefficient}${cation}(g) + ${electronText(electronCount)} + ${nonmetalCoefficient}${parts.nonmetal}(g)`,
    ions: `${metalCoefficient}${cation}(g) + ${nonmetalCoefficient}${anion}(g)`,
    crystal: `${formula}(s)`,
    formationEquation: `${metalCoefficient}${parts.metal}(s) + ${nonmetalStandard} → ${formula}(s)`,
    metalAtomEquation: `${metalCoefficient}${parts.metal}(s) → ${metalCoefficient}${parts.metal}(g)`,
    nonmetalAtomEquation: `${nonmetalStandard} → ${nonmetalCoefficient}${parts.nonmetal}(g)`,
    ionisationEquation: `${metalCoefficient}${parts.metal}(g) → ${metalCoefficient}${cation}(g) + ${electronText(electronCount)}`,
    affinityEquation: `${nonmetalCoefficient}${parts.nonmetal}(g) + ${electronText(electronCount)} → ${nonmetalCoefficient}${anion}(g)`,
    latticeEquation: `${metalCoefficient}${cation}(g) + ${nonmetalCoefficient}${anion}(g) → ${formula}(s)`,
    metalAtomLabel: `Atomisation of ${parts.metal}`,
    nonmetalAtomLabel: `Atomisation of ${parts.nonmetal}`,
    ionisationLabel: `Ionisation of ${parts.metal}`,
    affinityLabel: `Electron affinity of ${parts.nonmetal}`,
  }
}

export default function BornHaberCycleBuilder({ standalone = false }) {
  const [compound, setCompound] = useState('NaCl')
  const [formation, setFormation] = useState('-411')
  const [lattice, setLattice] = useState('-788')
  const [solveFor, setSolveFor] = useState('lattice')
  const [activeStep, setActiveStep] = useState('lattice')
  const [openStep, setOpenStep] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [steps, setSteps] = useState(defaultSteps)
  const species = useMemo(() => buildSpecies(compound), [compound])

  const model = useMemo(() => {
    const formationValue = readNumber(formation)
    const latticeValue = readNumber(lattice)
    const numericSteps = steps.map(step => ({ ...step, numericValue: readNumber(step.value) }))
    if (numericSteps.some(step => step.numericValue === null)) return null

    const atomMetal = numericSteps.find(step => step.id === 'atom-metal').numericValue
    const atomNonmetal = numericSteps.find(step => step.id === 'atom-nonmetal').numericValue
    const ionisation = numericSteps.find(step => step.id === 'ionisation').numericValue
    const electronAffinity = numericSteps.find(step => step.id === 'electron-affinity').numericValue
    const metalAtomsLevel = atomMetal
    const atomsLevel = atomMetal + atomNonmetal
    const ionisedLevel = atomsLevel + ionisation
    const ionsLevel = ionisedLevel + electronAffinity

    const resolvedFormation = solveFor === 'formation'
      ? latticeValue === null ? null : ionsLevel + latticeValue
      : formationValue
    const resolvedLattice = solveFor === 'lattice'
      ? formationValue === null ? null : formationValue - ionsLevel
      : latticeValue

    if (resolvedFormation === null || resolvedLattice === null) return null

    const states = [
      { id: 'elements', label: 'Elements in standard states', species: species.start, energy: 0 },
      { id: 'metal-atoms', label: 'Metal atoms formed', species: species.metalAtomised, energy: metalAtomsLevel },
      { id: 'atoms', label: 'Gaseous atoms', species: species.atoms, energy: atomsLevel },
      { id: 'ionised', label: 'After ionisation', species: species.ionised, energy: ionisedLevel },
      { id: 'ions', label: 'Gaseous ions', species: species.ions, energy: ionsLevel },
      { id: 'crystal', label: 'Ionic solid', species: species.crystal, energy: resolvedFormation },
    ]

    const transitions = [
      {
        id: 'atom-metal',
        number: 2,
        from: 'elements',
        to: 'metal-atoms',
        fromSpecies: species.start,
        toSpecies: species.metalAtomised,
        route: 'Born-Haber route',
        label: species.metalAtomLabel,
        equation: species.metalAtomEquation,
        value: atomMetal,
        explanation: 'Convert the metal from its standard state into gaseous atoms.',
      },
      {
        id: 'atom-nonmetal',
        number: 3,
        from: 'metal-atoms',
        to: 'atoms',
        fromSpecies: species.metalAtomised,
        toSpecies: species.atoms,
        route: 'Born-Haber route',
        label: species.nonmetalAtomLabel,
        equation: species.nonmetalAtomEquation,
        value: atomNonmetal,
        explanation: 'Atomise the non-metal so both substances are gaseous atoms.',
      },
      {
        id: 'ionisation',
        number: 4,
        from: 'atoms',
        to: 'ionised',
        fromSpecies: species.atoms,
        toSpecies: species.ionised,
        route: 'Born-Haber route',
        label: species.ionisationLabel,
        equation: species.ionisationEquation,
        value: ionisation,
        explanation: 'Remove electron(s) from the gaseous metal atom(s).',
      },
      {
        id: 'affinity',
        number: 5,
        from: 'ionised',
        to: 'ions',
        fromSpecies: species.ionised,
        toSpecies: species.ions,
        route: 'Born-Haber route',
        label: species.affinityLabel,
        equation: species.affinityEquation,
        value: electronAffinity,
        explanation: 'Add electron(s) to the gaseous non-metal atom(s).',
      },
      {
        id: 'lattice',
        number: 6,
        from: 'ions',
        to: 'crystal',
        fromSpecies: species.ions,
        toSpecies: species.crystal,
        route: 'Born-Haber route',
        label: 'Lattice enthalpy',
        equation: species.latticeEquation,
        value: resolvedLattice,
        explanation: 'Bring the gaseous ions together to form the ionic lattice.',
      },
    ]

    const formationStep = {
      id: 'formation',
      number: 1,
      route: 'Direct route',
      label: 'Formation enthalpy',
      equation: species.formationEquation,
      value: resolvedFormation,
      explanation: 'This is the direct route from the elements to the ionic solid.',
      from: 'elements',
      to: 'crystal',
      fromSpecies: species.start,
      toSpecies: species.crystal,
    }

    return {
      values: {
        atomMetal,
        atomNonmetal,
        atomisation: atomsLevel,
        ionisation,
        electronAffinity,
        ionsLevel,
        formation: resolvedFormation,
        lattice: resolvedLattice,
      },
      states,
      transitions,
      processSteps: [formationStep, ...transitions],
    }
  }, [formation, lattice, solveFor, species, steps])

  const result = model
    ? solveFor === 'lattice'
      ? model.values.lattice
      : model.values.formation
    : null

  const formulaLine = model
    ? solveFor === 'lattice'
      ? `lattice = ΔHᶠ - (atomisation + IE + EA) = ${formatShortEnergy(model.values.formation)} - (${formatShortEnergy(model.values.atomisation)} + ${formatShortEnergy(model.values.ionisation)} + ${formatShortEnergy(model.values.electronAffinity)})`
      : `ΔHᶠ = atomisation + IE + EA + lattice = ${formatShortEnergy(model.values.atomisation)} + ${formatShortEnergy(model.values.ionisation)} + ${formatShortEnergy(model.values.electronAffinity)} + ${formatShortEnergy(model.values.lattice)}`
    : 'Enter valid values to build the cycle.'

  const selectedStep = model?.processSteps.find(step => step.id === activeStep) || model?.processSteps.find(step => step.id === 'lattice')
  const selectedTransition = model?.processSteps.find(step => step.id === activeStep)

  useEffect(() => {
    if (!isPlaying) return undefined
    const timer = window.setInterval(() => {
      setActiveStep(previous => {
        const currentIndex = stepSequence.indexOf(previous)
        return stepSequence[(currentIndex + 1) % stepSequence.length]
      })
    }, 1700)
    return () => window.clearInterval(timer)
  }, [isPlaying])

  useEffect(() => {
    function closeStepPopover(event) {
      const target = event.target
      if (!(target instanceof Element)) return
      if (target.closest('.born-popover') || target.closest('[data-born-step-trigger="true"]')) return
      setOpenStep(null)
    }

    window.addEventListener('click', closeStepPopover)
    return () => window.removeEventListener('click', closeStepPopover)
  }, [])

  function updateStep(stepId, value) {
    setSteps(previous => previous.map(step => step.id === stepId ? { ...step, value } : step))
  }

  function inputLabel(step) {
    if (step.id === 'atom-metal') return species.metalAtomLabel
    if (step.id === 'atom-nonmetal') return species.nonmetalAtomLabel
    if (step.id === 'ionisation') return `${species.ionisationLabel} total`
    if (step.id === 'electron-affinity') return `${species.affinityLabel} total`
    return step.label
  }

  function nextStep() {
    setIsPlaying(false)
    setOpenStep(null)
    setActiveStep(previous => {
      const currentIndex = stepSequence.indexOf(previous)
      return stepSequence[(currentIndex + 1) % stepSequence.length]
    })
  }

  function selectDiagramStep(stepId) {
    setIsPlaying(false)
    setActiveStep(stepId)
    setOpenStep(previous => previous === stepId ? null : stepId)
  }

  function handleStepKeyDown(event, stepId) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    selectDiagramStep(stepId)
  }

  function isStateActive(stateId) {
    return selectedTransition && (selectedTransition.from === stateId || selectedTransition.to === stateId)
  }

  return (
    <section className={`calculator-app born-haber-tool-app ${standalone ? 'standalone-tool' : ''}`}>
      <div className="calculator-topline">
        <p className="eyebrow">Born-Haber cycle builder</p>
        <span className="calculator-badge">ΔHᶠ = atomisation + IE + EA + lattice</span>
      </div>

      <div className="calculator-mode-grid">
        <button className={solveFor === 'lattice' ? 'active' : ''} type="button" onClick={() => { setSolveFor('lattice'); setActiveStep('lattice'); setOpenStep(null) }}>Find lattice enthalpy</button>
        <button className={solveFor === 'formation' ? 'active' : ''} type="button" onClick={() => { setSolveFor('formation'); setActiveStep('formation'); setOpenStep(null) }}>Find formation enthalpy</button>
      </div>

      <div className="born-animation-controls">
        <button type="button" onClick={() => { setOpenStep(null); setActiveStep('formation'); setIsPlaying(previous => !previous) }}>
          {isPlaying ? 'Pause animated route' : 'Play animated route'}
        </button>
        <button type="button" onClick={nextStep}>Next arrow</button>
      </div>

      <div className="enthalpy-tool-layout born-haber-layout">
        <div className="calculator-input-panel">
          <label className="calculator-field">
            <span>Ionic compound</span>
            <div>
              <input value={compound} onChange={event => setCompound(event.target.value)} />
              <b>formula</b>
            </div>
          </label>
          <label className="calculator-field">
            <span>{solveFor === 'formation' ? 'Formation enthalpy target' : 'Known ΔHᶠ of compound'}</span>
            <div>
              <input type="number" step="any" value={formation} onChange={event => setFormation(event.target.value)} />
              <b>kJ mol⁻¹</b>
            </div>
          </label>
          <label className="calculator-field">
            <span>{solveFor === 'lattice' ? 'Lattice enthalpy target' : 'Known lattice enthalpy'}</span>
            <div>
              <input type="number" step="any" value={lattice} onChange={event => setLattice(event.target.value)} />
              <b>kJ mol⁻¹</b>
            </div>
          </label>
          {steps.map(step => (
            <label className="calculator-field" key={step.id}>
              <span>{inputLabel(step)}</span>
              <div>
                <input type="number" step="any" value={step.value} onChange={event => updateStep(step.id, event.target.value)} />
                <b>kJ mol⁻¹</b>
              </div>
            </label>
          ))}
        </div>

        <div className="born-haber-panel">
          <div className="born-diagram-workspace">
            <div className="born-route-diagram" aria-label="Born-Haber step-by-step reaction diagram">
              <div
                className={`born-direct-route ${activeStep === 'formation' ? 'active' : ''}`}
                data-born-step-trigger="true"
                role="button"
                tabIndex="0"
                aria-expanded={openStep === 'formation'}
                onClick={() => selectDiagramStep('formation')}
                onKeyDown={event => handleStepKeyDown(event, 'formation')}
              >
                <span>1. Direct route</span>
                <strong>{species.formationEquation}</strong>
                <b>{model ? formatEnergy(model.values.formation) : 'Check values'}</b>
                <small>Hess law says this equals the total Born-Haber route.</small>
              </div>

              <div className="born-route-map">
                <button
                  className={`born-long-direct-route ${activeStep === 'formation' ? 'active' : ''}`}
                  data-born-step-trigger="true"
                  type="button"
                  aria-expanded={openStep === 'formation'}
                  aria-controls="born-step-popover-formation"
                  onClick={() => selectDiagramStep('formation')}
                >
                  <span className="born-long-route-line">
                    <i>1</i>
                    <b />
                  </span>
                  {openStep === 'formation' && (
                    <span className="born-long-route-copy born-popover" id="born-step-popover-formation" onClick={event => event.stopPropagation()}>
                      <strong>Direct formation route</strong>
                      <small>{species.start} → {species.crystal}</small>
                      <em>{model ? formatEnergy(model.values.formation) : 'Check values'}</em>
                      <small>Click outside this box to hide it.</small>
                    </span>
                  )}
                </button>
                {model?.states.map((state, index) => (
                  <div className="born-route-block" key={state.id}>
                    <div className={`born-route-state ${state.id} ${isStateActive(state.id) ? 'active' : ''}`}>
                      <span>{state.label}</span>
                      <strong>{state.species}</strong>
                      <b>{formatEnergy(state.energy)}</b>
                    </div>
                    {index < model.transitions.length && (
                      <button
                        className={`born-route-transition ${activeStep === model.transitions[index].id ? 'active' : ''}`}
                        data-born-step-trigger="true"
                        type="button"
                        aria-expanded={openStep === model.transitions[index].id}
                        aria-controls={`born-step-popover-${model.transitions[index].id}`}
                        onClick={() => selectDiagramStep(model.transitions[index].id)}
                      >
                        <span className={`born-transition-track ${model.transitions[index].value >= 0 ? 'up' : 'down'}`}>
                          <i>{model.transitions[index].number}</i>
                          <b />
                        </span>
                        {openStep === model.transitions[index].id && (
                          <span className="born-transition-card born-popover" id={`born-step-popover-${model.transitions[index].id}`} onClick={event => event.stopPropagation()}>
                            <span>{model.transitions[index].label}</span>
                            <strong>{model.transitions[index].equation}</strong>
                            <b>{formatEnergy(model.transitions[index].value)}</b>
                            <small>{model.transitions[index].value >= 0 ? 'Energy increases' : 'Energy decreases'}</small>
                            <small>Click outside this box to hide it.</small>
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="born-process-panel" aria-label="Born-Haber process steps">
              <p className="eyebrow">Process steps</p>
              {model?.processSteps.map(step => (
                <button
                  className={`born-process-step ${activeStep === step.id ? 'active' : ''}`}
                  data-born-step-trigger="true"
                  key={step.id}
                  type="button"
                  aria-expanded={openStep === step.id}
                  onClick={() => selectDiagramStep(step.id)}
                >
                  <span>{step.number}. {step.route}</span>
                  <strong>{step.label}</strong>
                  <small>{step.equation}</small>
                  <b>{formatEnergy(step.value)}</b>
                </button>
              ))}
            </div>
          </div>

          <div className="born-step-inspector">
            <div>
              <span>Selected step</span>
              <strong>{selectedStep?.label || 'Check values'}</strong>
              <small>{selectedStep?.equation || 'Enter values to build the cycle.'}</small>
            </div>
            <div className="born-movement-readout">
              <span>Moving from</span>
              <strong>{selectedStep?.fromSpecies || 'Start species'}</strong>
              <span>to</span>
              <strong>{selectedStep?.toSpecies || 'Product species'}</strong>
            </div>
            <p>{selectedStep?.explanation || 'The diagram will animate through the Born-Haber route once the values are valid.'}</p>
          </div>
        </div>
      </div>

      <div className="calculator-display compact-display">
        <span>{solveFor === 'lattice' ? 'Lattice enthalpy' : 'Formation enthalpy'}</span>
        <strong>{result === null ? 'Check values' : formatEnergy(result)}</strong>
        <small>{formulaLine}</small>
      </div>

      <div className="calculator-working born-cycle-working">
        <div><span>Cycle logic</span><strong>The direct formation route equals the total Born-Haber route.</strong></div>
        <div><span>Diagram habit</span><strong>Read from top to bottom through the reaction map; each arrow connects the two adjacent species cards.</strong></div>
        <div><span>Sign check</span><strong>Positive steps add energy; negative steps release energy.</strong></div>
      </div>
    </section>
  )
}
