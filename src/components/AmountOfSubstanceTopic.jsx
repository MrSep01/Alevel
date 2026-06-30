import { useMemo, useState } from 'react'
import { Atom, Beaker, BookOpen, CheckCircle2, FlaskConical, GraduationCap, Lock, Scale, Wind } from 'lucide-react'
import Flashcards from './Flashcards.jsx'
import QuizBlock from './QuizBlock.jsx'
import MoleCalculator from '../tools/MoleCalculator.jsx'
import ConcentrationCalculator from '../tools/ConcentrationCalculator.jsx'
import FormulaMassCalculator from '../tools/FormulaMassCalculator.jsx'
import { quizzes } from '../data/quizzes.js'
import { useLocalStorage } from '../utils/useLocalStorage.js'

const PASS_MARK = 80

const amountLessons = [
  {
    id: 'lesson-1',
    label: 'Lesson 1',
    title: 'Mole Concept',
    icon: Atom,
    nextLessonId: 'lesson-2',
    summary: 'Define the mole, connect it to Avogadro constant, and calculate amount of substance from a number of particles.',
    objectives: [
      'Define one mole as 6.02 x 10^23 particles.',
      'Identify what the counted particles are in atoms, molecules, ions, and formula units.',
      'Use n = N / L to calculate moles from number of particles.',
      'Use N = n x L to calculate number of particles from moles.'
    ],
    priorKnowledge: [
      'I can use standard form such as 3.01 x 10^22.',
      'I know atoms, molecules, and ions are particles.',
      'I can rearrange a simple equation.',
      'I understand that chemists often measure mass instead of counting particles directly.'
    ],
    teachingSections: [
      {
        title: 'Why chemists use the mole',
        body: 'Atoms and molecules are far too small to count one by one in the laboratory. The mole is a counting unit, like a dozen, but much larger. One mole always contains 6.02 x 10^23 particles.'
      },
      {
        title: 'Particle identity matters',
        body: 'The word particles must be interpreted from the formula. One mole of Mg contains one mole of Mg atoms. One mole of CO2 contains one mole of CO2 molecules, but three moles of atoms in total because each molecule contains one carbon atom and two oxygen atoms.'
      },
      {
        title: 'The key equations',
        body: 'Use n = N / L when a question gives the number of particles. Use N = n x L when the question asks for particles. L is the Avogadro constant, 6.02 x 10^23 mol-1.'
      }
    ],
    workedExamples: [
      {
        title: 'Particles to moles',
        question: 'Calculate the amount of Mg atoms in 3.01 x 10^22 atoms of Mg.',
        steps: [
          'Write the relationship: n = N / L.',
          'Substitute: n = (3.01 x 10^22) / (6.02 x 10^23).',
          'Calculate: n = 0.0500 mol.'
        ],
        answer: '0.0500 mol of Mg atoms'
      },
      {
        title: 'Moles to particles',
        question: 'How many CO2 molecules are present in 0.250 mol of CO2?',
        steps: [
          'Write the relationship: N = n x L.',
          'Substitute: N = 0.250 x 6.02 x 10^23.',
          'Calculate: N = 1.51 x 10^23 molecules.'
        ],
        answer: '1.51 x 10^23 CO2 molecules'
      }
    ],
    guidedQuestions: [
      {
        prompt: 'A sample contains 1.204 x 10^24 atoms of helium. Which equation should you use first?',
        answer: 'Use n = N / L because the question gives a number of particles and asks for amount in moles.'
      },
      {
        prompt: 'In 2.00 mol of water molecules, how many moles of hydrogen atoms are present?',
        answer: 'Each H2O molecule contains two H atoms, so 2.00 mol H2O contains 4.00 mol of H atoms.'
      }
    ],
    checkpoints: [
      {
        prompt: 'What is the Avogadro constant?',
        expected: '6.02 x 10^23 mol-1.'
      },
      {
        prompt: 'One mole of sodium chloride contains what kind of particles?',
        expected: 'Formula units of NaCl, made from Na+ and Cl- ions.'
      }
    ],
    exitTicket: [
      {
        id: 'l1-q1',
        prompt: 'One mole contains:',
        options: [
          { id: 'a', text: '6.02 x 10^23 particles' },
          { id: 'b', text: '6.02 x 10^-23 particles' },
          { id: 'c', text: '24.0 particles' }
        ],
        answer: 'a',
        explanation: 'One mole is defined as 6.02 x 10^23 particles.'
      },
      {
        id: 'l1-q2',
        prompt: 'Which equation calculates moles from number of particles?',
        options: [
          { id: 'a', text: 'n = N x L' },
          { id: 'b', text: 'n = N / L' },
          { id: 'c', text: 'n = L / N' }
        ],
        answer: 'b',
        explanation: 'Amount in moles equals number of particles divided by the Avogadro constant.'
      },
      {
        id: 'l1-q3',
        prompt: 'How many moles are in 3.01 x 10^23 molecules?',
        options: [
          { id: 'a', text: '0.500 mol' },
          { id: 'b', text: '1.00 mol' },
          { id: 'c', text: '2.00 mol' }
        ],
        answer: 'a',
        explanation: '3.01 x 10^23 is half of 6.02 x 10^23, so it is 0.500 mol.'
      },
      {
        id: 'l1-q4',
        prompt: 'How many molecules are present in 2.00 mol of oxygen molecules?',
        options: [
          { id: 'a', text: '3.01 x 10^23' },
          { id: 'b', text: '6.02 x 10^23' },
          { id: 'c', text: '1.204 x 10^24' }
        ],
        answer: 'c',
        explanation: 'N = n x L = 2.00 x 6.02 x 10^23 = 1.204 x 10^24 molecules.'
      },
      {
        id: 'l1-q5',
        prompt: 'One mole of CO2 contains:',
        options: [
          { id: 'a', text: 'one mole of CO2 molecules' },
          { id: 'b', text: 'one mole of carbon atoms only' },
          { id: 'c', text: 'three molecules in total' }
        ],
        answer: 'a',
        explanation: 'The formula CO2 identifies the counted particle as a molecule of carbon dioxide.'
      }
    ],
    teacherNotes: [
      'Students often say one mole is a mass. Keep returning to one mole as a number of particles.',
      'Ask students to name the counted particle every time: atoms, molecules, ions, or formula units.'
    ]
  },
  {
    id: 'lesson-2',
    label: 'Lesson 2',
    title: 'Moles and Mass',
    icon: Scale,
    nextLessonId: 'lesson-3',
    summary: 'Use relative formula mass to convert between mass and amount of substance.',
    objectives: ['Calculate Mr from a formula.', 'Use n = m / Mr.', 'Use m = n x Mr.'],
    priorKnowledge: ['I can read chemical formulae.', 'I can add relative atomic masses.'],
    teachingSections: [],
    workedExamples: [],
    guidedQuestions: [],
    checkpoints: [],
    exitTicket: [],
    teacherNotes: ['Full lesson content will be built in the next content phase.']
  },
  {
    id: 'lesson-3',
    label: 'Lesson 3',
    title: 'Moles and Solutions',
    icon: Beaker,
    nextLessonId: 'lesson-4',
    summary: 'Connect concentration, amount, and solution volume using dm3.',
    objectives: ['Convert cm3 to dm3.', 'Use c = n / V.', 'Calculate moles in a solution.'],
    priorKnowledge: ['I can convert cm3 to dm3.', 'I can rearrange equations.'],
    teachingSections: [],
    workedExamples: [],
    guidedQuestions: [],
    checkpoints: [],
    exitTicket: [],
    teacherNotes: ['Full lesson content will be built in the next content phase.']
  },
  {
    id: 'lesson-4',
    label: 'Lesson 4',
    title: 'Moles and Gases',
    icon: Wind,
    nextLessonId: 'lesson-5',
    summary: 'Use molar gas volume and reacting gas ratios.',
    objectives: ['Use molar gas volume at room temperature and pressure.', 'Convert cm3 to dm3.', 'Use gas volume ratios.'],
    priorKnowledge: ['I can interpret balanced equations.', 'I can convert volume units.'],
    teachingSections: [],
    workedExamples: [],
    guidedQuestions: [],
    checkpoints: [],
    exitTicket: [],
    teacherNotes: ['Full lesson content will be built in the next content phase.']
  },
  {
    id: 'lesson-5',
    label: 'Lesson 5',
    title: 'Empirical Formula',
    icon: BookOpen,
    nextLessonId: 'lesson-6',
    summary: 'Turn composition data into the simplest whole-number formula.',
    objectives: ['Convert masses to moles.', 'Find simplest ratios.', 'Scale ratios to whole numbers.'],
    priorKnowledge: ['I can calculate moles from mass.', 'I can simplify number ratios.'],
    teachingSections: [],
    workedExamples: [],
    guidedQuestions: [],
    checkpoints: [],
    exitTicket: [],
    teacherNotes: ['Full lesson content will be built in the next content phase.']
  },
  {
    id: 'lesson-6',
    label: 'Lesson 6',
    title: 'Limiting Reagents',
    icon: FlaskConical,
    nextLessonId: null,
    summary: 'Identify the reactant used up first and calculate maximum product.',
    objectives: ['Use mole ratios from equations.', 'Compare possible product amounts.', 'Identify excess reagent.'],
    priorKnowledge: ['I can calculate moles.', 'I can use balanced equation ratios.'],
    teachingSections: [],
    workedExamples: [],
    guidedQuestions: [],
    checkpoints: [],
    exitTicket: [],
    teacherNotes: ['Full lesson content will be built in the next content phase.']
  }
]

const pageTabs = [
  { id: 'overview', label: 'Overview' },
  ...amountLessons.map(lesson => ({ id: lesson.id, label: lesson.label })),
  { id: 'practice', label: 'Practice' },
  { id: 'exam', label: 'Exam Questions' },
  { id: 'flashcards', label: 'Flashcards' },
  { id: 'quiz', label: 'Quiz' }
]

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

function createInitialProgress() {
  return amountLessons.reduce((progress, lesson, index) => {
    progress[lesson.id] = {
      bestScore: 0,
      completed: false,
      unlocked: index === 0
    }
    return progress
  }, {})
}

function normaliseProgress(progress) {
  const initial = createInitialProgress()
  return amountLessons.reduce((nextProgress, lesson, index) => {
    const stored = progress?.[lesson.id] || {}
    const previousLesson = amountLessons[index - 1]
    const previousCompleted = index === 0 || Boolean(nextProgress[previousLesson.id]?.completed)
    nextProgress[lesson.id] = {
      bestScore: Number(stored.bestScore) || 0,
      completed: Boolean(stored.completed),
      unlocked: index === 0 || previousCompleted || Boolean(stored.unlocked)
    }
    return nextProgress
  }, initial)
}

function getLessonStatus(lessonId, progress, mode) {
  if (mode === 'teacher') return { unlocked: true, completed: progress[lessonId]?.completed || false }
  return {
    unlocked: progress[lessonId]?.unlocked || false,
    completed: progress[lessonId]?.completed || false
  }
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

function PriorKnowledgeChecklist({ checks }) {
  const [checked, setChecked] = useState({})

  function toggleCheck(check) {
    setChecked({ ...checked, [check]: !checked[check] })
  }

  return (
    <section className="lesson-section">
      <p className="eyebrow">Checking Prior Knowledge</p>
      <h3>Before You Start</h3>
      <ul className="check-list">
        {checks.map(check => (
          <li className="check-item" key={check}>
            <input type="checkbox" checked={Boolean(checked[check])} onChange={() => toggleCheck(check)} />
            <span>{check}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function GuidedQuestions({ questions }) {
  return (
    <section className="lesson-section">
      <p className="eyebrow">Guided Questions</p>
      <h3>Think It Through</h3>
      <div className="guided-question-list">
        {questions.map((question, index) => (
          <details className="exam-question" key={question.prompt}>
            <summary>
              <span>Guided Question {index + 1}</span>
              <strong>Reveal support</strong>
            </summary>
            <p>{question.prompt}</p>
            <div className="mark-scheme">
              <h4>Suggested reasoning</h4>
              <p>{question.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}

function ExitTicket({ lesson, progress, setProgress, setActivePageTab, mode }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const questions = lesson.exitTicket || []

  const score = questions.reduce((total, question) => {
    return total + (answers[question.id] === question.answer ? 1 : 0)
  }, 0)
  const percent = questions.length ? Math.round((score / questions.length) * 100) : 0
  const passed = percent >= PASS_MARK
  const nextLesson = amountLessons.find(item => item.id === lesson.nextLessonId)

  function selectAnswer(questionId, optionId) {
    setAnswers({ ...answers, [questionId]: optionId })
  }

  function submitExitTicket(event) {
    event.preventDefault()
    setSubmitted(true)

    setProgress(current => {
      const nextProgress = normaliseProgress(current)
      const existing = nextProgress[lesson.id] || { bestScore: 0, completed: false, unlocked: true }
      nextProgress[lesson.id] = {
        ...existing,
        bestScore: Math.max(existing.bestScore || 0, percent),
        completed: existing.completed || passed,
        unlocked: true
      }

      if (passed && lesson.nextLessonId) {
        nextProgress[lesson.nextLessonId] = {
          ...(nextProgress[lesson.nextLessonId] || {}),
          unlocked: true
        }
      }

      return nextProgress
    })
  }

  if (!questions.length) {
    return (
      <section className="lesson-section exit-ticket-panel">
        <p className="eyebrow">Exit Ticket Quiz</p>
        <h3>Coming Next</h3>
        <p>This lesson is part of the Phase 1 data model. Its full exit ticket will be added when this lesson is built out.</p>
      </section>
    )
  }

  return (
    <section className="lesson-section exit-ticket-panel">
      <p className="eyebrow">Exit Ticket Quiz</p>
      <h3>Score {PASS_MARK}% to Unlock the Next Lesson</h3>
      <p>Best saved score for this lesson: <strong>{progress[lesson.id]?.bestScore || 0}%</strong></p>

      <form onSubmit={submitExitTicket}>
        {questions.map(question => (
          <div className="quiz-question" key={question.id}>
            <strong>{question.prompt}</strong>
            {question.options.map(option => (
              <label className="quiz-option" key={option.id}>
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={answers[question.id] === option.id}
                  onChange={() => selectAnswer(question.id, option.id)}
                />
                <span>{option.text}</span>
              </label>
            ))}

            {submitted && (
              <p className={answers[question.id] === question.answer ? 'feedback good' : 'feedback needs-work'}>
                {answers[question.id] === question.answer ? 'Correct.' : `Review: ${question.explanation}`}
              </p>
            )}
          </div>
        ))}

        <button className="btn primary" type="submit">Submit exit ticket</button>

        {submitted && (
          <p className={passed ? 'feedback good' : 'feedback needs-work'}>
            Score: {score}/{questions.length} ({percent}%). {passed ? 'Lesson passed. The next lesson is unlocked.' : `You need at least ${PASS_MARK}%. Review the examples and try again.`}
          </p>
        )}
      </form>

      <div className="lesson-next-row">
        {nextLesson ? (
          <button
            className="btn primary"
            disabled={mode !== 'teacher' && !getLessonStatus(nextLesson.id, progress, mode).unlocked && !passed}
            onClick={() => setActivePageTab(nextLesson.id)}
          >
            Go to {nextLesson.label}: {nextLesson.title}
          </button>
        ) : (
          <span className="badge">Final lesson</span>
        )}
      </div>
    </section>
  )
}

function LessonPanel({ lesson, progress, setProgress, mode, setActivePageTab }) {
  const Icon = lesson.icon
  const lessonStatus = getLessonStatus(lesson.id, progress, mode)

  if (!lessonStatus.unlocked) {
    const index = amountLessons.findIndex(item => item.id === lesson.id)
    const previousLesson = amountLessons[index - 1]

    return (
      <section className="panel locked-lesson">
        <div className="lesson-feature compact-card">
          <div className="lesson-feature-icon locked">
            <Lock size={26} />
          </div>
          <div>
            <p className="eyebrow">Locked Lesson</p>
            <h3>{lesson.label}: {lesson.title}</h3>
            <p>Score {PASS_MARK}% or higher on {previousLesson.label} to unlock this lesson.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="panel lesson-panel">
      <div className="lesson-feature compact-card">
        <div className="lesson-feature-icon">
          <Icon size={28} />
        </div>
        <div>
          <p className="eyebrow">{lesson.label}</p>
          <h2>{lesson.title}</h2>
          <p>{lesson.summary}</p>
          <div className="topic-meta">
            <span className="badge">Best score: {progress[lesson.id]?.bestScore || 0}%</span>
            <span className="badge">{lessonStatus.completed ? 'Completed' : `Pass mark ${PASS_MARK}%`}</span>
          </div>
        </div>
      </div>

      <section className="lesson-section">
        <p className="eyebrow">Objectives</p>
        <h3>By the End of This Lesson</h3>
        <ul className="clean-list">
          {lesson.objectives.map(objective => <li key={objective}>{objective}</li>)}
        </ul>
      </section>

      <PriorKnowledgeChecklist checks={lesson.priorKnowledge} />

      <section className="lesson-section">
        <p className="eyebrow">Core Teaching</p>
        <h3>Lesson Notes</h3>
        <div className="calc-walkthroughs">
          {lesson.teachingSections.length ? lesson.teachingSections.map(section => (
            <article className="mini-panel" key={section.title}>
              <h3>{section.title}</h3>
              <p>{section.body}</p>
            </article>
          )) : (
            <article className="mini-panel">
              <h3>Content phase placeholder</h3>
              <p>This lesson has its objectives and lock position set. Its full teaching sequence will be written in the next phase.</p>
            </article>
          )}
        </div>
      </section>

      {lesson.workedExamples.length > 0 && (
        <section className="lesson-section">
          <p className="eyebrow">Sample Examples</p>
          <h3>Worked Examples</h3>
          <div className="calc-walkthroughs">
            {lesson.workedExamples.map(example => (
              <article className="mini-panel worked-example" key={example.title}>
                <h3>{example.title}</h3>
                <p><strong>{example.question}</strong></p>
                <ol className="step-list">
                  {example.steps.map(step => <li key={step}>{step}</li>)}
                </ol>
                <div className="result-box">{example.answer}</div>
              </article>
            ))}
          </div>
        </section>
      )}

      {lesson.guidedQuestions.length > 0 && <GuidedQuestions questions={lesson.guidedQuestions} />}

      <section className="lesson-section">
        <p className="eyebrow">Checkpoints</p>
        <h3>Quick Checks</h3>
        <div className="checkpoint-grid">
          {lesson.checkpoints.length ? lesson.checkpoints.map(checkpoint => (
            <article className="mini-panel" key={checkpoint.prompt}>
              <h3>{checkpoint.prompt}</h3>
              <p>{checkpoint.expected}</p>
            </article>
          )) : (
            <article className="mini-panel">
              <h3>Checkpoint questions pending</h3>
              <p>These will be added with the full lesson content.</p>
            </article>
          )}
        </div>
      </section>

      {mode === 'teacher' && (
        <section className="teacher-note">
          <strong>Teacher mode notes:</strong>
          <ul>
            {lesson.teacherNotes.map(note => <li key={note}>{note}</li>)}
          </ul>
        </section>
      )}

      <ExitTicket
        lesson={lesson}
        progress={progress}
        setProgress={setProgress}
        setActivePageTab={setActivePageTab}
        mode={mode}
      />
    </section>
  )
}

function OverviewPanel({ lesson, progress, mode, setActivePageTab }) {
  return (
    <section className="panel amount-overview">
      <p className="eyebrow">Model Topic</p>
      <h2>{lesson.title}</h2>
      <p>{lesson.overview}</p>

      <div className="topic-map">
        {amountLessons.map(item => {
          const Icon = item.icon
          const status = getLessonStatus(item.id, progress, mode)
          return (
            <button
              className={`metric-card topic-map-card ${status.unlocked ? '' : 'locked-card'}`}
              key={item.id}
              onClick={() => status.unlocked && setActivePageTab(item.id)}
            >
              {status.unlocked ? <Icon size={22} /> : <Lock size={22} />}
              <span>{item.label}: {item.title}</span>
              <strong>{item.summary}</strong>
              <small>{status.completed ? 'Completed' : status.unlocked ? `Best score ${progress[item.id]?.bestScore || 0}%` : 'Locked'}</small>
            </button>
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
  const [storedProgress, setStoredProgress] = useLocalStorage('amount-substance-lesson-progress', createInitialProgress())
  const progress = normaliseProgress(storedProgress)

  function updateProgress(updater) {
    setStoredProgress(current => normaliseProgress(updater(current)))
  }

  function selectTab(tabId) {
    const lessonTab = amountLessons.find(item => item.id === tabId)
    if (lessonTab && !getLessonStatus(lessonTab.id, progress, mode).unlocked) return
    setActivePageTab(tabId)
  }

  function renderActiveTab() {
    if (activePageTab === 'overview') {
      return <OverviewPanel lesson={lesson} progress={progress} mode={mode} setActivePageTab={setActivePageTab} />
    }

    const activeLesson = amountLessons.find(item => item.id === activePageTab)
    if (activeLesson) {
      return (
        <LessonPanel
          lesson={activeLesson}
          progress={progress}
          setProgress={updateProgress}
          mode={mode}
          setActivePageTab={setActivePageTab}
        />
      )
    }

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
            <p>Lessons unlock one at a time. Score {PASS_MARK}% or higher on each exit ticket to continue.</p>
          </div>
          <ModeToggle mode={mode} setMode={setMode} />
        </div>

        <div className="topic-page-tabs lesson-gate-tabs" role="tablist" aria-label="Amount of Substance topic sections">
          {pageTabs.map(tab => {
            const lessonTab = amountLessons.find(item => item.id === tab.id)
            const status = lessonTab ? getLessonStatus(lessonTab.id, progress, mode) : { unlocked: true, completed: false }
            return (
              <button
                key={tab.id}
                className={`${tab.id === activePageTab ? 'active' : ''} ${!status.unlocked ? 'locked' : ''}`}
                onClick={() => selectTab(tab.id)}
                role="tab"
                aria-selected={tab.id === activePageTab}
                disabled={!status.unlocked}
              >
                {lessonTab && !status.unlocked && <Lock size={15} />}
                {lessonTab && status.completed && <CheckCircle2 size={15} />}
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {renderActiveTab()}
    </div>
  )
}
