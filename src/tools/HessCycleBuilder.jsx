import { useEffect, useMemo, useState } from 'react'

const examples = {
  etheneHydrogenation: {
    label: 'Hydrogenation of ethene',
    method: 'Combustion cycle',
    badge: 'Indirect route uses combustion data, then reverses the product combustion',
    targetLabel: 'Find ΔHᵣ for hydrogenation',
    reactantsLabel: 'Reactants',
    reactants: 'C₂H₄(g) + H₂(g)',
    productsLabel: 'Products',
    products: 'C₂H₆(g)',
    directEquation: 'C₂H₄(g) + H₂(g) → C₂H₆(g)',
    hubLabel: 'Common combustion products',
    hubSpecies: '2CO₂(g) + 3H₂O(l)',
    hubNote: 'Both sides can reach the same combustion products.',
    resultNote: 'A negative answer means the hydrogenation is exothermic.',
    steps: [
      {
        id: 'combust-ethene',
        side: 'reactants',
        number: 1,
        label: 'Combust ethene',
        baseEquation: 'C₂H₄(g) + 3O₂(g) → 2CO₂(g) + 2H₂O(l)',
        reverseEquation: '2CO₂(g) + 2H₂O(l) → C₂H₄(g) + 3O₂(g)',
        defaultValue: '-1411',
        defaultMultiplier: '1',
        defaultDirection: 'forward',
        explanation: 'This takes one reactant to the shared combustion products.',
      },
      {
        id: 'combust-hydrogen',
        side: 'reactants',
        number: 2,
        label: 'Combust hydrogen',
        baseEquation: 'H₂(g) + ½O₂(g) → H₂O(l)',
        reverseEquation: 'H₂O(l) → H₂(g) + ½O₂(g)',
        defaultValue: '-286',
        defaultMultiplier: '1',
        defaultDirection: 'forward',
        explanation: 'Hydrogen must also be combusted because it is part of the reactant side.',
      },
      {
        id: 'reverse-ethane',
        side: 'products',
        number: 3,
        label: 'Reverse ethane combustion',
        baseEquation: 'C₂H₆(g) + 3½O₂(g) → 2CO₂(g) + 3H₂O(l)',
        reverseEquation: '2CO₂(g) + 3H₂O(l) → C₂H₆(g) + 3½O₂(g)',
        defaultValue: '-1560',
        defaultMultiplier: '1',
        defaultDirection: 'reverse',
        explanation: 'The product combustion equation is reversed so the indirect path ends at ethane.',
      },
    ],
  },
  coNo2Formation: {
    label: 'CO and NO₂ reaction',
    method: 'Formation cycle',
    badge: 'Indirect route reverses reactant formations and uses product formations forward',
    targetLabel: 'Find ΔHᵣ from formation data',
    reactantsLabel: 'Reactants',
    reactants: 'CO(g) + NO₂(g)',
    productsLabel: 'Products',
    products: 'CO₂(g) + NO(g)',
    directEquation: 'CO(g) + NO₂(g) → CO₂(g) + NO(g)',
    hubLabel: 'Elements in standard states',
    hubSpecies: 'C(s) + ½O₂(g) + ½N₂(g) + O₂(g)',
    hubNote: 'Formation cycles meet at the elements in their standard states.',
    resultNote: 'This example uses four formation equations, two reversed and two forward.',
    steps: [
      {
        id: 'reverse-co',
        side: 'reactants',
        number: 1,
        label: 'Reverse formation of CO',
        baseEquation: 'C(s) + ½O₂(g) → CO(g)',
        reverseEquation: 'CO(g) → C(s) + ½O₂(g)',
        defaultValue: '-110.5',
        defaultMultiplier: '1',
        defaultDirection: 'reverse',
        explanation: 'Reactant formation equations are reversed because the path moves from reactants back to elements.',
      },
      {
        id: 'reverse-no2',
        side: 'reactants',
        number: 2,
        label: 'Reverse formation of NO₂',
        baseEquation: '½N₂(g) + O₂(g) → NO₂(g)',
        reverseEquation: 'NO₂(g) → ½N₂(g) + O₂(g)',
        defaultValue: '+33.2',
        defaultMultiplier: '1',
        defaultDirection: 'reverse',
        explanation: 'Because ΔHᶠ for NO₂ is positive, reversing it gives a negative contribution.',
      },
      {
        id: 'form-co2',
        side: 'products',
        number: 3,
        label: 'Form CO₂',
        baseEquation: 'C(s) + O₂(g) → CO₂(g)',
        reverseEquation: 'CO₂(g) → C(s) + O₂(g)',
        defaultValue: '-393.5',
        defaultMultiplier: '1',
        defaultDirection: 'forward',
        explanation: 'Now move from elements towards the product side.',
      },
      {
        id: 'form-no',
        side: 'products',
        number: 4,
        label: 'Form NO',
        baseEquation: '½N₂(g) + ½O₂(g) → NO(g)',
        reverseEquation: 'NO(g) → ½N₂(g) + ½O₂(g)',
        defaultValue: '+90.3',
        defaultMultiplier: '1',
        defaultDirection: 'forward',
        explanation: 'This product has a positive formation enthalpy, so it raises the indirect-route total.',
      },
    ],
  },
  methaneFormation: {
    label: 'Formation of methane',
    method: 'Combustion cycle',
    badge: 'Indirect route combines element combustion and reversed methane combustion',
    targetLabel: 'Find ΔHᶠ for methane',
    reactantsLabel: 'Elements',
    reactants: 'C(s) + 2H₂(g)',
    productsLabel: 'Compound',
    products: 'CH₄(g)',
    directEquation: 'C(s) + 2H₂(g) → CH₄(g)',
    hubLabel: 'Common combustion products',
    hubSpecies: 'CO₂(g) + 2H₂O(l)',
    hubNote: 'The elements and methane both burn to the same final substances.',
    resultNote: 'The product combustion step must be reversed to end at methane.',
    steps: [
      {
        id: 'combust-carbon',
        side: 'reactants',
        number: 1,
        label: 'Combust carbon',
        baseEquation: 'C(s) + O₂(g) → CO₂(g)',
        reverseEquation: 'CO₂(g) → C(s) + O₂(g)',
        defaultValue: '-394',
        defaultMultiplier: '1',
        defaultDirection: 'forward',
        explanation: 'Carbon is part of the element side, so its combustion is used forward.',
      },
      {
        id: 'combust-hydrogen-twice',
        side: 'reactants',
        number: 2,
        label: 'Combust 2 mol of hydrogen',
        baseEquation: 'H₂(g) + ½O₂(g) → H₂O(l)',
        reverseEquation: 'H₂O(l) → H₂(g) + ½O₂(g)',
        defaultValue: '-286',
        defaultMultiplier: '2',
        defaultDirection: 'forward',
        explanation: 'The target equation contains 2 mol of H₂, so the combustion enthalpy is doubled.',
      },
      {
        id: 'reverse-methane',
        side: 'products',
        number: 3,
        label: 'Reverse methane combustion',
        baseEquation: 'CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(l)',
        reverseEquation: 'CO₂(g) + 2H₂O(l) → CH₄(g) + 2O₂(g)',
        defaultValue: '-890',
        defaultMultiplier: '1',
        defaultDirection: 'reverse',
        explanation: 'Methane combustion is written from methane to products, so reverse it for the final leg.',
      },
    ],
  },
}

const exampleIds = Object.keys(examples)

function readNumber(value) {
  if (String(value).trim() === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function formatEnthalpy(value) {
  if (!Number.isFinite(value)) return 'Check values'
  return `${value > 0 ? '+' : ''}${value.toFixed(1)} kJ mol⁻¹`
}

function formatContribution(value) {
  if (!Number.isFinite(value)) return '?'
  return value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1)
}

function createStepSettings(example) {
  return Object.fromEntries(
    example.steps.map(step => [
      step.id,
      {
        value: step.defaultValue,
        multiplier: step.defaultMultiplier,
        direction: step.defaultDirection,
      },
    ])
  )
}

export default function HessCycleBuilder({ standalone = false }) {
  const [exampleId, setExampleId] = useState('etheneHydrogenation')
  const [activeStep, setActiveStep] = useState('direct')
  const [openStep, setOpenStep] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [stepSettings, setStepSettings] = useState(() => createStepSettings(examples.etheneHydrogenation))
  const activeExample = examples[exampleId]

  const model = useMemo(() => {
    const usedSteps = activeExample.steps.map(step => {
      const settings = stepSettings[step.id] || {}
      const value = readNumber(settings.value)
      const multiplier = readNumber(settings.multiplier)
      const valid = value !== null && multiplier !== null
      const direction = settings.direction || step.defaultDirection
      const directionSign = direction === 'reverse' ? -1 : 1
      const contribution = valid ? value * multiplier * directionSign : null

      return {
        ...step,
        value,
        multiplier,
        direction,
        contribution,
        usedEquation: direction === 'reverse' ? step.reverseEquation : step.baseEquation,
        directionLabel: direction === 'reverse' ? 'Reverse direction' : 'Forward direction',
      }
    })

    if (usedSteps.some(step => step.contribution === null)) {
      return {
        usedSteps,
        result: null,
        expression: 'Enter valid values to build the Hess route.',
      }
    }

    const result = usedSteps.reduce((sum, step) => sum + step.contribution, 0)
    const expression = usedSteps.map(step => formatContribution(step.contribution)).join(' + ')
    return { usedSteps, result, expression }
  }, [activeExample, stepSettings])

  const routeSequence = useMemo(() => ['direct', ...activeExample.steps.map(step => step.id)], [activeExample])
  const selectedStep = activeStep === 'direct'
    ? {
        id: 'direct',
        label: 'Direct route',
        equation: activeExample.directEquation,
        contribution: model.result,
        explanation: 'This is the target reaction. Hess law lets us reach the same change by taking an indirect route through a shared reference state.',
        directionLabel: 'Target direction',
      }
    : model.usedSteps.find(step => step.id === activeStep)

  const reactantSteps = model.usedSteps.filter(step => step.side === 'reactants')
  const productSteps = model.usedSteps.filter(step => step.side === 'products')

  useEffect(() => {
    function closeStepPopover(event) {
      const target = event.target
      if (!(target instanceof Element)) return
      if (target.closest('.hess-popover') || target.closest('[data-hess-step-trigger="true"]')) return
      setOpenStep(null)
    }

    window.addEventListener('click', closeStepPopover)
    return () => window.removeEventListener('click', closeStepPopover)
  }, [])

  useEffect(() => {
    if (!isPlaying) return undefined
    const timer = window.setInterval(() => {
      setActiveStep(previous => {
        const currentIndex = routeSequence.indexOf(previous)
        return routeSequence[(currentIndex + 1) % routeSequence.length]
      })
    }, 1700)
    return () => window.clearInterval(timer)
  }, [isPlaying, routeSequence])

  function changeExample(nextExampleId) {
    setExampleId(nextExampleId)
    setActiveStep('direct')
    setOpenStep(null)
    setIsPlaying(false)
    setStepSettings(createStepSettings(examples[nextExampleId]))
  }

  function updateStep(stepId, key, value) {
    setStepSettings(previous => ({
      ...previous,
      [stepId]: {
        ...previous[stepId],
        [key]: value,
      },
    }))
  }

  function selectStep(stepId) {
    setIsPlaying(false)
    setActiveStep(stepId)
    setOpenStep(previous => previous === stepId ? null : stepId)
  }

  function handleStepKeyDown(event, stepId) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    selectStep(stepId)
  }

  function nextStep() {
    setIsPlaying(false)
    setOpenStep(null)
    setActiveStep(previous => {
      const currentIndex = routeSequence.indexOf(previous)
      return routeSequence[(currentIndex + 1) % routeSequence.length]
    })
  }

  return (
    <section className={`calculator-app hess-law-tool-app ${standalone ? 'standalone-tool' : ''}`}>
      <div className="calculator-topline">
        <p className="eyebrow">Hess law route builder</p>
        <span className="calculator-badge">{activeExample.badge}</span>
      </div>

      <div className="calculator-mode-grid hess-example-grid">
        {exampleIds.map(id => (
          <button className={exampleId === id ? 'active' : ''} key={id} type="button" onClick={() => changeExample(id)}>
            {examples[id].label}
          </button>
        ))}
      </div>

      <div className="hess-animation-controls">
        <button type="button" onClick={() => { setOpenStep(null); setActiveStep('direct'); setIsPlaying(previous => !previous) }}>
          {isPlaying ? 'Pause route animation' : 'Play indirect route'}
        </button>
        <button type="button" onClick={nextStep}>Next reaction</button>
      </div>

      <div className="enthalpy-tool-layout hess-law-layout">
        <div className="calculator-input-panel hess-input-panel">
          <label className="calculator-field">
            <span>Worked example</span>
            <div>
              <select value={exampleId} onChange={event => changeExample(event.target.value)}>
                {exampleIds.map(id => (
                  <option key={id} value={id}>{examples[id].label}</option>
                ))}
              </select>
              <b>{activeExample.method}</b>
            </div>
          </label>

          {activeExample.steps.map(step => {
            const settings = stepSettings[step.id] || {}
            const usedStep = model.usedSteps.find(item => item.id === step.id)
            return (
              <div className="hess-reaction-editor" key={step.id}>
                <span>{step.number}. {step.label}</span>
                <strong>{step.baseEquation}</strong>
                <div className="hess-reaction-controls">
                  <label>
                    <small>ΔH as written</small>
                    <input type="number" step="any" value={settings.value || ''} onChange={event => updateStep(step.id, 'value', event.target.value)} />
                  </label>
                  <label>
                    <small>Multiplier</small>
                    <input type="number" step="any" value={settings.multiplier || ''} onChange={event => updateStep(step.id, 'multiplier', event.target.value)} />
                  </label>
                  <label>
                    <small>Direction used</small>
                    <select value={settings.direction || step.defaultDirection} onChange={event => updateStep(step.id, 'direction', event.target.value)}>
                      <option value="forward">Forward</option>
                      <option value="reverse">Reverse</option>
                    </select>
                  </label>
                </div>
                <em>{usedStep?.usedEquation || step.baseEquation}</em>
                <b>{usedStep?.contribution === null ? 'Check values' : formatEnthalpy(usedStep.contribution)}</b>
              </div>
            )
          })}

          <div className="enthalpy-formula-card">
            <span>Indirect route sum</span>
            <strong>ΔHᵣ = {model.expression}</strong>
            <small>{model.result === null ? 'Enter valid enthalpies and multipliers.' : `ΔHᵣ = ${formatEnthalpy(model.result)}`}</small>
          </div>
        </div>

        <div className="hess-law-panel">
          <div className="hess-route-diagram" aria-label="Hess law direct and indirect route diagram">
            <div className={`hess-route-node reactants ${activeStep === 'direct' || reactantSteps.some(step => step.id === activeStep) ? 'active' : ''}`}>
              <span>{activeExample.reactantsLabel}</span>
              <strong>{activeExample.reactants}</strong>
            </div>

            <button
              className={`hess-direct-route ${activeStep === 'direct' ? 'active' : ''}`}
              data-hess-step-trigger="true"
              type="button"
              aria-expanded={openStep === 'direct'}
              aria-controls="hess-step-popover-direct"
              onClick={() => selectStep('direct')}
            >
              <span className="hess-direct-line">
                <i>Direct route</i>
                <b />
              </span>
              {openStep === 'direct' && (
                <span className="hess-route-popover hess-popover" id="hess-step-popover-direct" onClick={event => event.stopPropagation()}>
                  <strong>{activeExample.targetLabel}</strong>
                  <small>{activeExample.directEquation}</small>
                  <em>{model.result === null ? 'Check values' : formatEnthalpy(model.result)}</em>
                  <small>Click outside this box to hide it.</small>
                </span>
              )}
            </button>

            <div className={`hess-route-node products ${activeStep === 'direct' || productSteps.some(step => step.id === activeStep) ? 'active' : ''}`}>
              <span>{activeExample.productsLabel}</span>
              <strong>{activeExample.products}</strong>
            </div>

            <div className="hess-branch reactant-branch">
              <span className="hess-branch-rail down" aria-hidden="true" />
              <div className="hess-branch-steps">
                <div className="hess-branch-heading">
                  <span>Indirect route</span>
                  <strong>{activeExample.reactantsLabel} to reference state</strong>
                </div>
                {reactantSteps.map(step => (
                  <button
                    className={`hess-path-step ${activeStep === step.id ? 'active' : ''}`}
                    data-hess-step-trigger="true"
                    key={step.id}
                    type="button"
                    aria-expanded={openStep === step.id}
                    aria-controls={`hess-step-popover-${step.id}`}
                    onClick={() => selectStep(step.id)}
                    onKeyDown={event => handleStepKeyDown(event, step.id)}
                  >
                    <span className="hess-step-number">{step.number}</span>
                    <span className="hess-step-copy">
                      <strong>{step.label}</strong>
                      <small>{step.directionLabel}</small>
                    </span>
                    <b className="hess-step-energy">{step.contribution === null ? 'Check values' : formatEnthalpy(step.contribution)}</b>
                    {openStep === step.id && (
                      <em className="hess-step-popover hess-popover" id={`hess-step-popover-${step.id}`} onClick={event => event.stopPropagation()}>
                        <small>{step.directionLabel}</small>
                        <strong>{step.usedEquation}</strong>
                        <small>{step.explanation}</small>
                        <small>Click outside this box to hide it.</small>
                      </em>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="hess-hub-card">
              <span>{activeExample.hubLabel}</span>
              <strong>{activeExample.hubSpecies}</strong>
              <small>{activeExample.hubNote}</small>
            </div>

            <div className="hess-branch product-branch">
              <div className="hess-branch-steps">
                <div className="hess-branch-heading">
                  <span>Indirect route</span>
                  <strong>Reference state to {activeExample.productsLabel.toLowerCase()}</strong>
                </div>
                {productSteps.map(step => (
                  <button
                    className={`hess-path-step ${activeStep === step.id ? 'active' : ''}`}
                    data-hess-step-trigger="true"
                    key={step.id}
                    type="button"
                    aria-expanded={openStep === step.id}
                    aria-controls={`hess-step-popover-${step.id}`}
                    onClick={() => selectStep(step.id)}
                    onKeyDown={event => handleStepKeyDown(event, step.id)}
                  >
                    <span className="hess-step-number">{step.number}</span>
                    <span className="hess-step-copy">
                      <strong>{step.label}</strong>
                      <small>{step.directionLabel}</small>
                    </span>
                    <b className="hess-step-energy">{step.contribution === null ? 'Check values' : formatEnthalpy(step.contribution)}</b>
                    {openStep === step.id && (
                      <em className="hess-step-popover hess-popover" id={`hess-step-popover-${step.id}`} onClick={event => event.stopPropagation()}>
                        <small>{step.directionLabel}</small>
                        <strong>{step.usedEquation}</strong>
                        <small>{step.explanation}</small>
                        <small>Click outside this box to hide it.</small>
                      </em>
                    )}
                  </button>
                ))}
              </div>
              <span className="hess-branch-rail up" aria-hidden="true" />
            </div>
          </div>

          <div className="hess-process-panel" aria-label="Hess law route steps">
            <button
              className={`hess-process-step ${activeStep === 'direct' ? 'active' : ''}`}
              data-hess-step-trigger="true"
              type="button"
              onClick={() => selectStep('direct')}
            >
              <span>Direct route</span>
              <strong>{activeExample.directEquation}</strong>
              <b>{model.result === null ? 'Check values' : formatEnthalpy(model.result)}</b>
            </button>
            {model.usedSteps.map(step => (
              <button
                className={`hess-process-step ${activeStep === step.id ? 'active' : ''}`}
                data-hess-step-trigger="true"
                key={step.id}
                type="button"
                onClick={() => selectStep(step.id)}
              >
                <span>{step.number}. {step.directionLabel}</span>
                <strong>{step.usedEquation}</strong>
                <b>{step.contribution === null ? 'Check values' : formatEnthalpy(step.contribution)}</b>
              </button>
            ))}
          </div>

          <div className="hess-step-inspector">
            <div>
              <span>Selected route</span>
              <strong>{selectedStep?.label || 'Check values'}</strong>
              <small>{selectedStep?.equation || selectedStep?.usedEquation || activeExample.directEquation}</small>
            </div>
            <div>
              <span>Direction</span>
              <strong>{selectedStep?.directionLabel || 'Route direction'}</strong>
              <small>{selectedStep?.contribution === null ? 'Check values' : formatEnthalpy(selectedStep?.contribution ?? model.result)}</small>
            </div>
            <p>{selectedStep?.explanation || activeExample.resultNote}</p>
          </div>
        </div>
      </div>

      <div className="calculator-display compact-display">
        <span>Reaction enthalpy</span>
        <strong>{model.result === null ? 'Check values' : formatEnthalpy(model.result)}</strong>
        <small>{model.result !== null && model.result < 0 ? 'Exothermic overall reaction.' : model.result !== null ? 'Endothermic overall reaction.' : 'Enter enthalpy values.'}</small>
      </div>

      <div className="calculator-working hess-working-grid">
        <div><span>Direct route</span><strong>{activeExample.directEquation}</strong></div>
        <div><span>Indirect route</span><strong>{model.expression}</strong></div>
        <div><span>Direction rule</span><strong>Forward keeps the sign; reverse changes the sign; multipliers scale ΔH.</strong></div>
      </div>
    </section>
  )
}
