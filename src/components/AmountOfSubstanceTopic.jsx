import { useMemo, useState } from 'react'
import { Atom, Beaker, BookOpen, CheckCircle2, FlaskConical, GraduationCap, Scale, Wind } from 'lucide-react'
import Flashcards from './Flashcards.jsx'
import QuizBlock from './QuizBlock.jsx'
import MoleCalculator from '../tools/MoleCalculator.jsx'
import ConcentrationCalculator from '../tools/ConcentrationCalculator.jsx'
import FormulaMassCalculator from '../tools/FormulaMassCalculator.jsx'
import { quizzes } from '../data/quizzes.js'

const lessonTabs = [
  {
    id: 'mole-basics',
    icon: Atom,
    title: '1. Mole Concept',
    focus: 'Particles, Avogadro constant, and why chemists count by weighing.',
    core: [
      'One mole contains 6.02 x 10^23 particles.',
      'The particles can be atoms, molecules, ions, electrons, or formula units.',
      'Use n = N / L when a question gives a number of particles.'
    ],
    workedExample: {
      title: 'Particles to moles',
      question: 'Calculate the amount of Mg atoms in 3.01 x 10^22 atoms of Mg.',
      steps: [
        'Write the relationship: n = N / L.',
        'Substitute: n = (3.01 x 10^22) / (6.02 x 10^23).',
        'Calculate: n = 0.0500 mol.'
      ],
      answer: '0.0500 mol of Mg atoms'
    },
    teacherNotes: 'Pause on particle identity: one mole of O atoms and one mole of O2 molecules are different particle counts in formulas.'
  },
  {
    id: 'mass-moles',
    icon: Scale,
    title: '2. Moles and Mass',
    focus: 'Using relative formula mass to move between grams and moles.',
    core: [
      'Use n = m / Mr when mass is in grams.',
      'Use m = n x Mr when the question asks for mass.',
      'Calculate Mr by adding the relative atomic masses in the formula.'
    ],
    workedExample: {
      title: 'Mass to moles',
      question: 'Calculate the moles in 5.30 g of Na2CO3. Mr = 106.0.',
      steps: [
        'Choose the formula: n = m / Mr.',
        'Substitute: n = 5.30 / 106.0.',
        'Calculate: n = 0.0500 mol.'
      ],
      answer: '0.0500 mol of Na2CO3'
    },
    teacherNotes: 'Insist on units in every line. Most early errors are formula choice errors or missing the 2 in Na2.'
  },
  {
    id: 'solutions',
    icon: Beaker,
    title: '3. Moles and Solutions',
    focus: 'Concentration, volume conversion, and titration-ready thinking.',
    core: [
      'Use c = n / V, where V is in dm3.',
      'Convert cm3 to dm3 by dividing by 1000.',
      'Use n = c x V when calculating moles in a known volume.'
    ],
    workedExample: {
      title: 'Concentration to moles',
      question: 'Find moles of HCl in 25.0 cm3 of 0.200 mol dm-3 HCl.',
      steps: [
        'Convert volume: 25.0 cm3 = 0.0250 dm3.',
        'Choose the formula: n = c x V.',
        'Substitute: n = 0.200 x 0.0250 = 0.00500 mol.'
      ],
      answer: '0.00500 mol of HCl'
    },
    teacherNotes: 'Make students say "dm3" before they calculate. The volume conversion is the classic avoidable mark loss.'
  },
  {
    id: 'gases',
    icon: Wind,
    title: '4. Moles and Gases',
    focus: 'Gas volume, molar gas volume, and reacting gas calculations.',
    core: [
      'At room temperature and pressure, 1 mol of gas occupies 24.0 dm3.',
      'Use n = V / 24.0 when gas volume is in dm3 at room temperature and pressure.',
      'Use balanced equation ratios after converting gas volume to moles.'
    ],
    workedExample: {
      title: 'Gas volume to moles',
      question: 'Calculate the amount of CO2 in 600 cm3 of CO2 at room temperature and pressure.',
      steps: [
        'Convert volume: 600 cm3 = 0.600 dm3.',
        'Use molar gas volume: n = V / 24.0.',
        'Calculate: n = 0.600 / 24.0 = 0.0250 mol.'
      ],
      answer: '0.0250 mol of CO2'
    },
    teacherNotes: 'Keep conditions explicit. The 24.0 dm3 mol-1 shortcut applies at room temperature and pressure, not all gas questions.'
  },
  {
    id: 'formulae',
    icon: BookOpen,
    title: '5. Empirical Formula',
    focus: 'Turning composition data into simplest whole-number formulae.',
    core: [
      'Convert masses or percentages into moles.',
      'Divide all mole values by the smallest value.',
      'Scale to whole numbers if needed.'
    ],
    workedExample: {
      title: 'Empirical formula from mass',
      question: 'A compound contains 2.4 g C and 0.6 g H. Find its empirical formula.',
      steps: [
        'Moles C = 2.4 / 12.0 = 0.200 mol.',
        'Moles H = 0.6 / 1.0 = 0.600 mol.',
        'Divide by smallest: C = 1, H = 3, so formula is CH3.'
      ],
      answer: 'CH3'
    },
    teacherNotes: 'When ratios are near x.5 or x.33, multiply every ratio by 2 or 3. Keep rounding disciplined.'
  },
  {
    id: 'limiting',
    icon: FlaskConical,
    title: '6. Limiting Reagents',
    focus: 'Deciding which reactant runs out first and predicting product amount.',
    core: [
      'Convert each reactant amount into the moles of product it could make.',
      'The smaller possible product amount identifies the limiting reagent.',
      'Excess reagent remains after the limiting reagent has been used up.'
    ],
    workedExample: {
      title: 'Identify the limiting reagent',
      question: '2.00 mol H2 reacts with 1.20 mol O2. Equation: 2H2 + O2 -> 2H2O.',
      steps: [
        'From H2: 2.00 mol H2 can form 2.00 mol H2O.',
        'From O2: 1.20 mol O2 can form 2.40 mol H2O.',
        'The smaller product amount is from H2, so H2 is limiting.'
      ],
      answer: 'H2 is limiting; maximum H2O = 2.00 mol'
    },
    teacherNotes: 'The simulator below uses the same logic: compare possible product, not just starting moles.'
  }
]

const pageTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'lesson-1', label: 'Lesson 1' },
  { id: 'lesson-2', label: 'Lesson 2' },
  { id: 'lesson-3', label: 'Lesson 3' },
  { id: 'practice', label: 'Practice' },
  { id: 'exam', label: 'Exam Questions' },
  { id: 'flashcards', label: 'Flashcards' },
  { id: 'quiz', label: 'Quiz' }
]

const lessonGroups = {
  'lesson-1': {
    title: 'Lesson 1: Counting Particles and Weighing Substances',
    description: 'Build the mole concept first, then connect amount of substance to mass and relative formula mass.',
    subtopics: ['mole-basics', 'mass-moles']
  },
  'lesson-2': {
    title: 'Lesson 2: Solutions and Gases',
    description: 'Use volume carefully: dm3 for solutions, molar gas volume for gases at room temperature and pressure.',
    subtopics: ['solutions', 'gases']
  },
  'lesson-3': {
    title: 'Lesson 3: Formulae and Limiting Reagents',
    description: 'Use mole ratios to find empirical formulae and decide which reactant limits product formation.',
    subtopics: ['formulae', 'limiting']
  }
}

const calculationWalkthroughs = [
  {
    title: 'Mass -> moles -> product mass',
    prompt: '4.80 g Mg reacts with oxygen. Calculate mass of MgO formed. Equation: 2Mg + O2 -> 2MgO.',
    steps: [
      'Moles Mg = 4.80 / 24.3 = 0.1975 mol.',
      'Ratio Mg:MgO is 2:2, so moles MgO = 0.1975 mol.',
      'Mr(MgO) = 24.3 + 16.0 = 40.3.',
      'Mass MgO = 0.1975 x 40.3 = 7.96 g.'
    ]
  },
  {
    title: 'Solution -> moles -> concentration',
    prompt: '25.0 cm3 NaOH neutralises 20.0 cm3 of 0.150 mol dm-3 H2SO4. Equation: 2NaOH + H2SO4 -> Na2SO4 + 2H2O.',
    steps: [
      'Moles H2SO4 = 0.150 x 0.0200 = 0.00300 mol.',
      'Ratio H2SO4:NaOH is 1:2, so moles NaOH = 0.00600 mol.',
      'Volume NaOH = 25.0 cm3 = 0.0250 dm3.',
      'Concentration NaOH = 0.00600 / 0.0250 = 0.240 mol dm-3.'
    ]
  },
  {
    title: 'Gas volume -> moles -> reacting volume',
    prompt: '120 cm3 of methane burns completely. Calculate the volume of oxygen needed at the same temperature and pressure. Equation: CH4 + 2O2 -> CO2 + 2H2O.',
    steps: [
      'For gases at the same temperature and pressure, volume ratio follows mole ratio.',
      'Ratio CH4:O2 is 1:2.',
      'Oxygen volume = 120 x 2 = 240 cm3.',
      'This shortcut works because both substances are gases under the stated conditions.'
    ]
  }
]

const examQuestions = [
  {
    marks: 4,
    question: 'Calcium carbonate reacts with hydrochloric acid: CaCO3 + 2HCl -> CaCl2 + CO2 + H2O. Calculate the volume of 0.500 mol dm-3 HCl needed to react exactly with 2.50 g of CaCO3.',
    markScheme: [
      'Mr(CaCO3) = 100.1.',
      'n(CaCO3) = 2.50 / 100.1 = 0.02498 mol.',
      'n(HCl) = 2 x 0.02498 = 0.04996 mol.',
      'V = n / c = 0.04996 / 0.500 = 0.0999 dm3 = 99.9 cm3.'
    ]
  },
  {
    marks: 5,
    question: 'At room temperature and pressure, 96.0 cm3 of carbon dioxide is produced. Calculate the amount, in moles, of carbon dioxide and the mass of carbon dioxide produced.',
    markScheme: [
      'Convert volume: 96.0 cm3 = 0.0960 dm3.',
      'Use n = V / 24.0.',
      'n(CO2) = 0.0960 / 24.0 = 0.00400 mol.',
      'Mr(CO2) = 44.0.',
      'mass = 0.00400 x 44.0 = 0.176 g.'
    ]
  },
  {
    marks: 5,
    question: 'A student burns 0.720 g of Mg in oxygen and obtains 1.194 g of magnesium oxide. Determine the empirical formula of the oxide.',
    markScheme: [
      'Mass O = 1.194 - 0.720 = 0.474 g.',
      'n(Mg) = 0.720 / 24.3 = 0.0296 mol.',
      'n(O) = 0.474 / 16.0 = 0.0296 mol.',
      'Ratio Mg:O = 1:1.',
      'Empirical formula = MgO.'
    ]
  },
  {
    marks: 6,
    question: '5.00 g of Zn reacts with 50.0 cm3 of 1.20 mol dm-3 HCl. Equation: Zn + 2HCl -> ZnCl2 + H2. Identify the limiting reagent and calculate moles of H2 formed.',
    markScheme: [
      'n(Zn) = 5.00 / 65.4 = 0.0765 mol.',
      'n(HCl) = 1.20 x 0.0500 = 0.0600 mol.',
      '0.0600 mol HCl reacts with 0.0300 mol Zn.',
      'HCl is limiting.',
      'Ratio HCl:H2 is 2:1.',
      'n(H2) = 0.0300 mol.'
    ]
  }
]

function format(value, places = 3) {
  if (!Number.isFinite(value)) return '0'
  return value.toPrecision(places)
}

function LimitingReagentSimulator() {
  const [h2, setH2] = useState('2.00')
  const [o2, setO2] = useState('1.20')

  const result = useMemo(() => {
    const h2Moles = Number(h2)
    const o2Moles = Number(o2)
    if (h2Moles <= 0 || o2Moles <= 0) return null

    const waterFromH2 = h2Moles
    const waterFromO2 = o2Moles * 2
    const h2IsLimiting = waterFromH2 < waterFromO2
    const equal = Math.abs(waterFromH2 - waterFromO2) < 0.000001
    const water = Math.min(waterFromH2, waterFromO2)
    const h2Used = water
    const o2Used = water / 2

    return {
      limiting: equal ? 'Neither: exact reacting amounts' : h2IsLimiting ? 'H2' : 'O2',
      water,
      h2Left: Math.max(0, h2Moles - h2Used),
      o2Left: Math.max(0, o2Moles - o2Used),
      waterFromH2,
      waterFromO2
    }
  }, [h2, o2])

  return (
    <section className="panel simulator-panel">
      <div className="section-header compact">
        <div>
          <p className="eyebrow">Interactive</p>
          <h3>Limiting Reagent Simulator</h3>
          <p>Equation: 2H2 + O2 {'->'} 2H2O. Change the starting moles and compare possible water formed.</p>
        </div>
      </div>

      <div className="input-grid">
        <div className="field">
          <label>Starting H2 / mol</label>
          <input type="number" min="0" step="0.01" value={h2} onChange={event => setH2(event.target.value)} />
        </div>
        <div className="field">
          <label>Starting O2 / mol</label>
          <input type="number" min="0" step="0.01" value={o2} onChange={event => setO2(event.target.value)} />
        </div>
      </div>

      {result ? (
        <div className="simulator-grid">
          <div className="result-box">
            Limiting reagent: <strong>{result.limiting}</strong>
          </div>
          <div className="metric-card">
            <span>H2 could make</span>
            <strong>{format(result.waterFromH2)} mol H2O</strong>
          </div>
          <div className="metric-card">
            <span>O2 could make</span>
            <strong>{format(result.waterFromO2)} mol H2O</strong>
          </div>
          <div className="metric-card">
            <span>Maximum product</span>
            <strong>{format(result.water)} mol H2O</strong>
          </div>
          <div className="metric-card">
            <span>H2 left over</span>
            <strong>{format(result.h2Left)} mol</strong>
          </div>
          <div className="metric-card">
            <span>O2 left over</span>
            <strong>{format(result.o2Left)} mol</strong>
          </div>
        </div>
      ) : (
        <p className="feedback needs-work">Enter positive starting amounts for both reactants.</p>
      )}
    </section>
  )
}

function ModeToggle({ mode, setMode }) {
  return (
    <div className="mode-toggle" aria-label="Teacher or student mode">
      <button className={mode === 'student' ? 'active' : ''} onClick={() => setMode('student')}>
        <GraduationCap size={18} />
        Student
      </button>
      <button className={mode === 'teacher' ? 'active' : ''} onClick={() => setMode('teacher')}>
        <CheckCircle2 size={18} />
        Teacher
      </button>
    </div>
  )
}

function SubtopicCard({ subtopic, mode }) {
  const Icon = subtopic.icon

  return (
    <article className="subtopic-card">
      <div className="lesson-feature compact-card">
        <div className="lesson-feature-icon">
          <Icon size={26} />
        </div>
        <div>
          <p className="eyebrow">Model Subtopic</p>
          <h3>{subtopic.title}</h3>
          <p>{subtopic.focus}</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="mini-panel">
          <h3>Core Ideas</h3>
          <ul className="clean-list">
            {subtopic.core.map(item => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div className="mini-panel worked-example">
          <p className="eyebrow">Worked Example</p>
          <h3>{subtopic.workedExample.title}</h3>
          <p><strong>{subtopic.workedExample.question}</strong></p>
          <ol className="step-list">
            {subtopic.workedExample.steps.map(step => <li key={step}>{step}</li>)}
          </ol>
          <div className="result-box">{subtopic.workedExample.answer}</div>
        </div>
      </div>

      {mode === 'teacher' && (
        <article className="teacher-note">
          <strong>Teacher mode note:</strong> {subtopic.teacherNotes}
        </article>
      )}
    </article>
  )
}

function LessonPanel({ groupId, mode }) {
  const group = lessonGroups[groupId]
  const subtopics = group.subtopics.map(id => lessonTabs.find(tab => tab.id === id)).filter(Boolean)

  return (
    <section className="panel">
      <p className="eyebrow">Guided Lesson</p>
      <h3>{group.title}</h3>
      <p>{group.description}</p>
      <div className="subtopic-stack">
        {subtopics.map(subtopic => (
          <SubtopicCard key={subtopic.id} subtopic={subtopic} mode={mode} />
        ))}
      </div>
    </section>
  )
}

function OverviewPanel({ lesson }) {
  return (
    <section className="panel amount-overview">
      <p className="eyebrow">Model Topic</p>
      <h2>{lesson.title}</h2>
      <p>{lesson.overview}</p>

      <div className="topic-map">
        {lessonTabs.map(subtopic => {
          const Icon = subtopic.icon
          return (
            <article className="metric-card topic-map-card" key={subtopic.id}>
              <Icon size={22} />
              <span>{subtopic.title}</span>
              <strong>{subtopic.focus}</strong>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function PracticePanel() {
  return (
    <>
      <section className="panel">
        <p className="eyebrow">Practice</p>
        <h3>Step-by-Step Mole Calculations</h3>
        <div className="calc-walkthroughs">
          {calculationWalkthroughs.map(example => (
            <article className="mini-panel" key={example.title}>
              <h3>{example.title}</h3>
              <p><strong>{example.prompt}</strong></p>
              <ol className="step-list">
                {example.steps.map(step => <li key={step}>{step}</li>)}
              </ol>
            </article>
          ))}
        </div>
      </section>

      <LimitingReagentSimulator />

      <section className="grid-2">
        <MoleCalculator />
        <ConcentrationCalculator />
        <FormulaMassCalculator />
      </section>
    </>
  )
}

function ExamQuestionsPanel() {
  return (
    <section className="panel">
      <p className="eyebrow">Exam Practice</p>
      <h3>Exam-Style Questions</h3>
      <div className="exam-question-list">
        {examQuestions.map((item, index) => (
          <details className="exam-question" key={item.question}>
            <summary>
              <span>Question {index + 1}</span>
              <strong>{item.marks} marks</strong>
            </summary>
            <p>{item.question}</p>
            <div className="mark-scheme">
              <h4>Mark scheme</h4>
              <ol className="step-list">
                {item.markScheme.map(point => <li key={point}>{point}</li>)}
              </ol>
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}

export default function AmountOfSubstanceTopic({ lesson }) {
  const [activePageTab, setActivePageTab] = useState('overview')
  const [mode, setMode] = useState('student')

  function renderActiveTab() {
    if (activePageTab === 'overview') return <OverviewPanel lesson={lesson} />
    if (activePageTab === 'lesson-1') return <LessonPanel groupId="lesson-1" mode={mode} />
    if (activePageTab === 'lesson-2') return <LessonPanel groupId="lesson-2" mode={mode} />
    if (activePageTab === 'lesson-3') return <LessonPanel groupId="lesson-3" mode={mode} />
    if (activePageTab === 'practice') return <PracticePanel />
    if (activePageTab === 'exam') return <ExamQuestionsPanel />
    if (activePageTab === 'flashcards') return <Flashcards cards={lesson.flashcards} />
    if (activePageTab === 'quiz') return <QuizBlock quizId="amount-of-substance" questions={quizzes['amount-of-substance'] || []} />
    return null
  }

  return (
    <div className="lesson-block amount-topic">
      <section className="panel topic-tab-shell">
        <div className="section-header compact">
          <div>
            <p className="eyebrow">Topic Workspace</p>
            <h2>Amount of Substance</h2>
            <p>Move through the topic using the lesson, practice, exam, and revision tabs.</p>
          </div>
          <ModeToggle mode={mode} setMode={setMode} />
        </div>

        <div className="topic-page-tabs" role="tablist" aria-label="Amount of Substance topic sections">
          {pageTabs.map(tab => (
            <button
              key={tab.id}
              className={tab.id === activePageTab ? 'active' : ''}
              onClick={() => setActivePageTab(tab.id)}
              role="tab"
              aria-selected={tab.id === activePageTab}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {renderActiveTab()}
    </div>
  )
}
