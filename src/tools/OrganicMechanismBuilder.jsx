import { useMemo, useState } from 'react'

const scenarios = [
  {
    id: 'nucleophilic-substitution',
    title: 'Nucleophilic substitution',
    substrate: 'bromoethane',
    reagent: 'OH⁻ in aqueous ethanol',
    correct: {
      nucleophile: 'OH⁻',
      electrophile: 'δ⁺ carbon bonded to Br',
      leavingGroup: 'Br⁻',
      product: 'ethanol',
    },
    options: {
      nucleophile: ['OH⁻', 'Br⁻', 'H⁺', 'CH₃CH₂Br'],
      electrophile: ['δ⁺ carbon bonded to Br', 'oxygen in OH⁻', 'hydrogen in ethanol', 'bromide ion'],
      leavingGroup: ['Br⁻', 'OH⁻', 'H⁺', 'ethanol'],
      product: ['ethanol', 'ethene', 'ethanoic acid', 'bromoethane'],
    },
    steps: [
      'Curly arrow from the lone pair on OH⁻ to the δ⁺ carbon.',
      'Curly arrow from the C-Br bond to Br.',
      'A C-O bond forms and Br⁻ leaves.',
    ],
  },
  {
    id: 'electrophilic-addition',
    title: 'Electrophilic addition',
    substrate: 'ethene',
    reagent: 'HBr',
    correct: {
      nucleophile: 'Br⁻',
      electrophile: 'Hδ⁺ in HBr',
      leavingGroup: 'none',
      product: 'bromoethane',
    },
    options: {
      nucleophile: ['Br⁻', 'H⁺', 'ethene π bond', 'HBr'],
      electrophile: ['Hδ⁺ in HBr', 'Br⁻', 'C-Br bond', 'bromoethane'],
      leavingGroup: ['none', 'H⁻', 'Br₂', 'ethene'],
      product: ['bromoethane', 'ethanol', 'ethane', 'ethanoic acid'],
    },
    steps: [
      'Curly arrow from the alkene π bond to Hδ⁺.',
      'Curly arrow from the H-Br bond to Br.',
      'Br⁻ attacks the carbocation to form bromoethane.',
    ],
  },
  {
    id: 'esterification',
    title: 'Ester formation',
    substrate: 'ethanoic acid and ethanol',
    reagent: 'concentrated H₂SO₄ catalyst',
    correct: {
      nucleophile: 'ethanol oxygen',
      electrophile: 'carbonyl carbon',
      leavingGroup: 'water',
      product: 'ethyl ethanoate',
    },
    options: {
      nucleophile: ['ethanol oxygen', 'methyl group', 'sulfate ion', 'carbonyl oxygen'],
      electrophile: ['carbonyl carbon', 'ethanol carbon', 'acid proton', 'water oxygen'],
      leavingGroup: ['water', 'ethanol', 'carbon dioxide', 'hydrogen gas'],
      product: ['ethyl ethanoate', 'ethanal', 'ethene', 'sodium ethanoate'],
    },
    steps: [
      'The alcohol oxygen attacks the protonated carbonyl carbon.',
      'Proton transfers make water a leaving group.',
      'Water leaves and the ester carbonyl reforms.',
    ],
  },
]

const fieldLabels = {
  nucleophile: 'Nucleophile',
  electrophile: 'Electrophile',
  leavingGroup: 'Leaving group',
  product: 'Major product',
}

export default function OrganicMechanismBuilder() {
  const [scenarioId, setScenarioId] = useState('nucleophilic-substitution')
  const scenario = scenarios.find(item => item.id === scenarioId) || scenarios[0]
  const [answersByScenario, setAnswersByScenario] = useState(() => (
    Object.fromEntries(scenarios.map(item => [
      item.id,
      {
        nucleophile: item.options.nucleophile[0],
        electrophile: item.options.electrophile[0],
        leavingGroup: item.options.leavingGroup[0],
        product: item.options.product[0],
      },
    ]))
  ))
  const answers = answersByScenario[scenario.id]

  const score = useMemo(() => {
    return Object.entries(scenario.correct).filter(([key, value]) => answers[key] === value).length
  }, [answers, scenario])

  function updateAnswer(field, value) {
    setAnswersByScenario(previous => ({
      ...previous,
      [scenario.id]: {
        ...previous[scenario.id],
        [field]: value,
      },
    }))
  }

  return (
    <section className="calculator-app">
      <div className="calculator-topline">
        <div>
          <p className="eyebrow">Organic mechanism builder</p>
        </div>
        <span className="calculator-badge">{score}/4 correct</span>
      </div>

      <div className="calculator-mode-grid">
        {scenarios.map(item => (
          <button
            className={item.id === scenario.id ? 'active' : ''}
            key={item.id}
            type="button"
            onClick={() => setScenarioId(item.id)}
          >
            {item.title}
          </button>
        ))}
      </div>

      <div className="mechanism-scene">
        <article>
          <span>Substrate</span>
          <strong>{scenario.substrate}</strong>
        </article>
        <article>
          <span>Reagent or conditions</span>
          <strong>{scenario.reagent}</strong>
        </article>
      </div>

      <div className="mechanism-grid">
        {Object.keys(scenario.correct).map(field => (
          <label className={`mechanism-choice ${answers[field] === scenario.correct[field] ? 'correct' : 'needs-work'}`} key={field}>
            <span>{fieldLabels[field]}</span>
            <select value={answers[field]} onChange={event => updateAnswer(field, event.target.value)}>
              {scenario.options[field].map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <small>{answers[field] === scenario.correct[field] ? 'Correct choice' : `Expected: ${scenario.correct[field]}`}</small>
          </label>
        ))}
      </div>

      <div className="calculator-working">
        {scenario.steps.map((step, index) => (
          <div key={step}>
            <span>Step {index + 1}</span>
            <strong>{step}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}
