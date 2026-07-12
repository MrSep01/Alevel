import { ArrowLeft, ArrowRight, BookOpenCheck, CheckCircle2, Clapperboard, Clock3, Compass, ExternalLink, FileText, Layers3, ListChecks, MonitorPlay, Plus, Presentation, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

function getSavedAssets(topicId) {
  if (typeof window === 'undefined') return { slides: [], videos: [] }
  try {
    return JSON.parse(window.localStorage.getItem(`sep-chem-lesson-assets:${topicId}`)) || { slides: [], videos: [] }
  } catch {
    return { slides: [], videos: [] }
  }
}

function normaliseAssets(assets) {
  return {
    slides: Array.isArray(assets?.slides) ? assets.slides : [],
    videos: Array.isArray(assets?.videos) ? assets.videos : [],
  }
}

function youtubeEmbedUrl(url) {
  if (!url) return ''
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.split('/').filter(Boolean)[0]
      return id ? `https://www.youtube.com/embed/${id}` : ''
    }
    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v') || parsed.pathname.split('/').filter(Boolean).at(-1)
      return id ? `https://www.youtube.com/embed/${id}` : ''
    }
  } catch {
    const match = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/)
    return match ? `https://www.youtube.com/embed/${match[1]}` : ''
  }
  return ''
}

function safeEmbedUrl(url) {
  if (!url) return ''
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : ''
  } catch {
    return ''
  }
}

function resourceIcon(type) {
  if (type === 'video') return Clapperboard
  if (type === 'simulation') return MonitorPlay
  return FileText
}

function ResourceLink({ resource }) {
  const Icon = resourceIcon(resource.type)
  return (
    <a className={`lesson-resource-link ${resource.type || 'reference'}`} href={resource.url} target="_blank" rel="noreferrer">
      <Icon size={18} />
      <span>
        <strong>{resource.title}</strong>
        <small>{resource.type || 'reference'}</small>
      </span>
      <ExternalLink size={16} />
    </a>
  )
}

function EmbeddedVideo({ video, onRemove }) {
  const src = youtubeEmbedUrl(video.url)

  return (
    <article className="lesson-embed-card video">
      <div className="lesson-embed-heading">
        <span><Clapperboard size={17} /> YouTube</span>
        {onRemove && (
          <button type="button" onClick={() => onRemove(video.id)} aria-label={`Remove ${video.title}`}>
            <Trash2 size={16} />
          </button>
        )}
      </div>
      {src ? (
        <iframe
          src={src}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <div className="lesson-embed-fallback">Add a valid YouTube link to preview this video.</div>
      )}
      <strong>{video.title}</strong>
    </article>
  )
}

function EmbeddedSlide({ slide, onRemove }) {
  const src = safeEmbedUrl(slide.url)

  return (
    <article className="lesson-embed-card slides">
      <div className="lesson-embed-heading">
        <span><Presentation size={17} /> Slides</span>
        {onRemove && (
          <button type="button" onClick={() => onRemove(slide.id)} aria-label={`Remove ${slide.title}`}>
            <Trash2 size={16} />
          </button>
        )}
      </div>
      {src ? (
        <iframe src={src} title={slide.title} allowFullScreen />
      ) : (
        <div className="lesson-embed-fallback">Add a Google Slides, Canva, or Microsoft embed link.</div>
      )}
      <strong>{slide.title}</strong>
    </article>
  )
}

function OutcomeTags({ codes = [] }) {
  if (!codes.length) return null
  return (
    <div className="outcome-tag-row" aria-label="Linked learning outcomes">
      {codes.map(code => <span key={code}>{code}</span>)}
    </div>
  )
}

function LearningOutcomesPanel({ outcomes }) {
  return (
    <section className="lesson-template-section learning-outcomes-panel" id="lesson-outcomes">
      <div className="lesson-section-heading">
        <p className="eyebrow">Learning outcomes first</p>
        <h3>This lesson is built around these syllabus statements.</h3>
      </div>
      <div className="lesson-outcome-grid">
        {outcomes.map(outcome => (
          <article className="lesson-outcome-card" key={outcome.code}>
            <span>{outcome.code}</span>
            <p>{outcome.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function WorkbookInteractive({ type }) {
  if (type === 'particle-counter') return <ParticleCounter />
  if (type === 'beam-deflection') return <BeamDeflectionExplorer />
  if (type === 'radius-trends') return <RadiusTrendExplorer />
  if (type === 'subshell-capacity') return <SubshellCapacityExplorer />
  if (type === 'electron-configuration') return <ElectronConfigurationLab />
  if (type === 'orbital-boxes') return <OrbitalBoxLab />
  if (type === 'orbital-shapes') return <OrbitalShapeExplorer />
  if (type === 'ionisation-equations') return <IonisationEquationExplorer />
  if (type === 'ionisation-trends') return <IonisationTrendExplorer />
  if (type === 'successive-ionisation') return <SuccessiveIonisationExplorer />
  return null
}

function WorkbookChoiceQuestions({ questions = [], mode = 'practice' }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const isExit = mode === 'exit'
  const score = questions.reduce((total, question) => total + (answers[question.id] === question.answer ? 1 : 0), 0)
  const showFeedback = !isExit || submitted

  function choose(questionId, option) {
    setAnswers(previous => ({ ...previous, [questionId]: option }))
    if (isExit) setSubmitted(false)
  }

  return (
    <div className={`workbook-choice-list ${mode}`}>
      {questions.map((question, index) => {
        const selected = answers[question.id]
        const isCorrect = selected === question.answer

        return (
          <div className="workbook-choice-row" key={question.id}>
            <strong>{index + 1}. {question.prompt}</strong>
            <div className="workbook-option-row">
              {question.options.map(option => (
                <button
                  className={`${selected === option ? 'selected' : ''} ${showFeedback && selected === option ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
                  key={option}
                  type="button"
                  onClick={() => choose(question.id, option)}
                >
                  {option}
                </button>
              ))}
            </div>
            {showFeedback && selected && (
              <p className={isCorrect ? 'feedback good' : 'feedback needs-work'}>
                {isCorrect ? 'Correct.' : `Review: ${question.feedback || question.explanation}`}
              </p>
            )}
          </div>
        )
      })}

      {isExit && (
        <div className="exit-ticket-actions">
          <button className="btn primary" type="button" onClick={() => setSubmitted(true)}>Submit exit ticket</button>
          {submitted && (
            <p className={score >= Math.ceil(questions.length * 0.8) ? 'feedback good' : 'feedback needs-work'}>
              Score: {score}/{questions.length}. {score >= Math.ceil(questions.length * 0.8) ? 'Ready to move on.' : 'Review the workbook lesson and try again.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function normaliseWorkbookAnswer(value) {
  return String(value || '').trim().toLowerCase().replace(/[.,]/g, '')
}

function WorkbookFillBlanks({ wordBank = [], blanks = [] }) {
  const [answers, setAnswers] = useState({})

  function updateAnswer(id, value) {
    setAnswers(previous => ({ ...previous, [id]: value }))
  }

  return (
    <div className="workbook-fill-area">
      {wordBank.length > 0 && (
        <div className="workbook-word-bank" aria-label="Word bank">
          {wordBank.map(word => <span key={word}>{word}</span>)}
        </div>
      )}
      <div className="workbook-fill-list">
        {blanks.map((blank, index) => {
          const response = answers[blank.id] || ''
          const accepted = Array.isArray(blank.answer) ? blank.answer : [blank.answer]
          const isCorrect = response && accepted.some(answer => normaliseWorkbookAnswer(answer) === normaliseWorkbookAnswer(response))

          return (
            <label className="workbook-fill-row" key={blank.id}>
              <span>{index + 1}. {blank.prompt}</span>
              <input value={response} onChange={event => updateAnswer(blank.id, event.target.value)} placeholder="Type the missing word" />
              {response && <small className={isCorrect ? 'correct' : 'incorrect'}>{isCorrect ? 'Correct' : `Try again. Answer: ${accepted[0]}`}</small>}
            </label>
          )
        })}
      </div>
    </div>
  )
}

function WorkbookMatchingTask({ options = [], items = [] }) {
  const [matches, setMatches] = useState({})

  function updateMatch(id, value) {
    setMatches(previous => ({ ...previous, [id]: value }))
  }

  return (
    <div className="workbook-match-area">
      <div className="workbook-match-options">
        {options.map(option => (
          <article key={option.id}>
            <span>{option.id}</span>
            <p>{option.text}</p>
          </article>
        ))}
      </div>
      <div className="workbook-match-list">
        {items.map(item => {
          const selected = matches[item.id] || ''
          const isCorrect = selected && selected === item.answer

          return (
            <label className="workbook-match-row" key={item.id}>
              <span>{item.term}</span>
              <select value={selected} onChange={event => updateMatch(item.id, event.target.value)}>
                <option value="">Choose</option>
                {options.map(option => <option key={option.id} value={option.id}>{option.id}</option>)}
              </select>
              {selected && <small className={isCorrect ? 'correct' : 'incorrect'}>{isCorrect ? 'Correct' : `Answer: ${item.answer}`}</small>}
            </label>
          )
        })}
      </div>
    </div>
  )
}

function WorkbookDataTable({ table }) {
  if (!table) return null

  return (
    <div className="workbook-data-table">
      <table>
        <thead>
          <tr>{table.headers.map(header => <th key={header}>{header}</th>)}</tr>
        </thead>
        <tbody>
          {table.rows.map(row => (
            <tr key={row.join('-')}>
              {row.map(cell => <td key={cell}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function WorkbookWrittenTask({ task, index }) {
  const [response, setResponse] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)

  return (
    <div className="workbook-written-row">
      <label>
        <span>{index + 1}. {task.prompt}</span>
        <textarea value={response} onChange={event => setResponse(event.target.value)} rows="3" placeholder={task.placeholder || 'Write your answer here.'} />
      </label>
      {task.answer && (
        <button className="btn" type="button" onClick={() => setShowAnswer(previous => !previous)}>
          {showAnswer ? 'Hide model answer' : 'Show model answer'}
        </button>
      )}
      {showAnswer && <p className="feedback good">{task.answer}</p>}
    </div>
  )
}

function WorkbookSection({ section, index, sectionId }) {
  const eyebrow = section.type === 'exit' ? 'Lesson exit ticket' : section.phase

  return (
    <section className={`workbook-section-card ${section.type || 'task'}`} id={sectionId}>
      <div className="workbook-section-time">
        <span>{String(index + 1).padStart(2, '0')}</span>
        <strong>{section.minutes} min</strong>
      </div>
      <div className="workbook-section-body">
        <p className="eyebrow">{eyebrow}</p>
        <h3>{section.title}</h3>
        {section.body && <p className="workbook-section-intro">{section.body}</p>}
        {section.visual && <ConceptVisual type={section.visual} />}
        {section.table && <WorkbookDataTable table={section.table} />}
        {section.keyPoints && (
          <ul className="workbook-key-list">
            {section.keyPoints.map(point => <li key={point}>{point}</li>)}
          </ul>
        )}
        {section.fillBlanks && <WorkbookFillBlanks wordBank={section.wordBank} blanks={section.fillBlanks} />}
        {section.matching && <WorkbookMatchingTask options={section.matching.options} items={section.matching.items} />}
        {section.interactive && <WorkbookInteractive type={section.interactive} />}
        {section.questions && <WorkbookChoiceQuestions questions={section.questions} mode={section.type === 'exit' ? 'exit' : 'practice'} />}
        {section.prompts && (
          <div className="workbook-written-list">
            {section.prompts.map((task, taskIndex) => <WorkbookWrittenTask task={task} index={taskIndex} key={task.id} />)}
          </div>
        )}
      </div>
    </section>
  )
}

function WorkbookLessonExperience({ subtopic }) {
  const lessons = subtopic.workbookLessons || []
  const [activeLessonId, setActiveLessonId] = useState(lessons[0]?.id || '')

  useEffect(() => {
    setActiveLessonId(lessons[0]?.id || '')
  }, [subtopic.ref, lessons])

  if (!lessons.length) return null

  const activeLesson = lessons.find(lesson => lesson.id === activeLessonId) || lessons[0]
  const activeLessonIndex = lessons.findIndex(lesson => lesson.id === activeLesson.id)
  const totalMinutes = activeLesson.sections.reduce((sum, section) => sum + section.minutes, 0)

  function selectLesson(lessonId, moveToTop = false) {
    setActiveLessonId(lessonId)
    if (moveToTop && typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        document.getElementById('lesson-work')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }

  function jumpToLessonSection(index) {
    document.getElementById(`${activeLesson.id}-section-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="workbook-experience" id="lesson-work">
      <div className="workbook-picker-heading">
        <div>
          <p className="eyebrow">Choose a lesson</p>
          <h3>{subtopic.ref} learning sequence</h3>
        </div>
        <span>{lessons.length} × 40-minute lessons</span>
      </div>

      <div className="workbook-lesson-picker" aria-label="Workbook lessons">
        {lessons.map(lesson => (
          <button
            className={lesson.id === activeLesson.id ? 'active' : ''}
            key={lesson.id}
            type="button"
            aria-current={lesson.id === activeLesson.id ? 'step' : undefined}
            onClick={() => selectLesson(lesson.id)}
          >
            <span className="workbook-lesson-number">{lesson.lessonNumber}</span>
            <span className="workbook-lesson-copy">
              <small>Lesson {lesson.lessonNumber}</small>
              <strong>{lesson.title}</strong>
              <em>{lesson.duration}</em>
            </span>
          </button>
        ))}
      </div>

      <section className="workbook-hero-card">
        <div>
          <p className="eyebrow">Lesson {activeLesson.lessonNumber} • Interactive web lesson</p>
          <h3>{activeLesson.title}</h3>
          <p>{activeLesson.question}</p>
          <div className="workbook-lesson-meta">
            <span><Clock3 size={17} /> {activeLesson.duration}</span>
            <OutcomeTags codes={activeLesson.outcomeCodes} />
          </div>
          <div className="workbook-lesson-goal">
            <span>By the end</span>
            <strong>{activeLesson.goal}</strong>
          </div>
        </div>
        <div className="workbook-duration">
          <span>{totalMinutes}</span>
          <strong>minutes</strong>
        </div>
      </section>

      <nav className="workbook-route-strip" aria-label="Lesson stages">
        {activeLesson.sections.map((section, index) => (
          <button type="button" key={`${activeLesson.id}-${section.phase}`} onClick={() => jumpToLessonSection(index)}>
            <span>{index + 1}</span>
            <strong>{section.phase}</strong>
            <small>{section.minutes} min</small>
          </button>
        ))}
      </nav>

      <div className="workbook-section-list">
        {activeLesson.sections.map((section, index) => (
          <WorkbookSection
            section={section}
            index={index}
            sectionId={`${activeLesson.id}-section-${index}`}
            key={`${activeLesson.id}-${section.phase}-${section.title}`}
          />
        ))}
      </div>

      {lessons.length > 1 && (
        <nav className="workbook-lesson-footer" aria-label="Previous or next lesson">
          {activeLessonIndex > 0 ? (
            <button type="button" onClick={() => selectLesson(lessons[activeLessonIndex - 1].id, true)}>
              <ArrowLeft size={18} />
              <span><small>Previous lesson</small><strong>{lessons[activeLessonIndex - 1].title}</strong></span>
            </button>
          ) : <span />}
          {activeLessonIndex < lessons.length - 1 && (
            <button type="button" onClick={() => selectLesson(lessons[activeLessonIndex + 1].id, true)}>
              <span><small>Next lesson</small><strong>{lessons[activeLessonIndex + 1].title}</strong></span>
              <ArrowRight size={18} />
            </button>
          )}
        </nav>
      )}
    </section>
  )
}

function ChoiceCheck({ title, subtitle, items, mode = 'practice' }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const answeredCount = items.filter(item => answers[item.id]).length
  const score = items.reduce((total, item) => total + (answers[item.id] === item.answer ? 1 : 0), 0)
  const showFeedback = mode === 'practice' || submitted

  function selectAnswer(itemId, option) {
    setAnswers(previous => ({ ...previous, [itemId]: option }))
    if (mode === 'practice') setSubmitted(false)
  }

  return (
    <section className={`web-lesson-card choice-check ${mode}`}>
      <div className="lesson-section-heading">
        <p className="eyebrow">{mode === 'exit' ? 'Exit ticket quiz' : 'Checking prior knowledge'}</p>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>

      <div className="choice-question-list">
        {items.map((item, index) => {
          const selected = answers[item.id]
          const isCorrect = selected === item.answer
          return (
            <article className="choice-question" key={item.id}>
              <span>{index + 1}</span>
              <OutcomeTags codes={item.outcomeCodes} />
              <strong>{item.prompt}</strong>
              <div className="choice-option-grid">
                {item.options.map(option => (
                  <button
                    className={`${selected === option ? 'selected' : ''} ${showFeedback && selected === option ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
                    key={option}
                    type="button"
                    onClick={() => selectAnswer(item.id, option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {showFeedback && selected && (
                <p className={isCorrect ? 'feedback good' : 'feedback needs-work'}>
                  {isCorrect ? 'Correct.' : `Review: ${item.feedback || item.explanation}`}
                </p>
              )}
            </article>
          )
        })}
      </div>

      {mode === 'exit' ? (
        <div className="exit-ticket-actions">
          <button className="btn primary" type="button" onClick={() => setSubmitted(true)}>Submit exit ticket</button>
          {submitted && (
            <p className={score >= Math.ceil(items.length * 0.8) ? 'feedback good' : 'feedback needs-work'}>
              Score: {score}/{items.length}. {score >= Math.ceil(items.length * 0.8) ? 'Secure enough to move on.' : 'Review the lesson cards and try again.'}
            </p>
          )}
        </div>
      ) : (
        <p className="lesson-progress-note">{answeredCount}/{items.length} checks answered</p>
      )}
    </section>
  )
}

function NuclearModelVisual() {
  return (
    <div className="atom-visual nuclear-model" aria-label="Nuclear atom model">
      <div className="atom-orbit one" />
      <div className="atom-orbit two" />
      <div className="atom-nucleus">
        <span>p⁺</span>
        <span>n⁰</span>
      </div>
      <span className="electron-dot e1">e⁻</span>
      <span className="electron-dot e2">e⁻</span>
      <span className="atom-caption empty">mostly empty space</span>
      <span className="atom-caption mass">mass concentrated in nucleus</span>
    </div>
  )
}

function ParticleTableVisual() {
  return (
    <div className="particle-table-visual">
      {[
        ['Particle', 'Relative charge', 'Relative mass', 'Location'],
        ['proton', '+1', '1', 'nucleus'],
        ['neutron', '0', '1', 'nucleus'],
        ['electron', '-1', '1/1836', 'shells'],
      ].map((row, index) => (
        <div className={index === 0 ? 'header' : ''} key={row.join('-')}>
          {row.map(cell => <span key={cell}>{cell}</span>)}
        </div>
      ))}
    </div>
  )
}

function ElectricFieldVisual() {
  return (
    <div className="field-visual" aria-label="Particle deflection in an electric field">
      <span className="plate negative">negative plate</span>
      <svg viewBox="0 0 420 190" role="img" aria-label="Protons curve upward, electrons curve downward more, neutrons go straight">
        <path className="beam proton" d="M25 95 C155 92 245 58 392 35" />
        <path className="beam neutron" d="M25 95 L392 95" />
        <path className="beam electron" d="M25 95 C135 105 230 148 392 168" />
      </svg>
      <span className="plate positive">positive plate</span>
    </div>
  )
}

function AlphaScatteringVisual() {
  return (
    <div className="alpha-scattering-visual" aria-label="Alpha particles fired at gold foil">
      <svg viewBox="0 0 640 260" role="img" aria-label="Alpha-particle paths A, B and C through gold foil">
        <defs>
          <marker id="arrowHead" markerHeight="8" markerWidth="8" orient="auto" refX="6" refY="4">
            <path d="M0,0 L8,4 L0,8 Z" />
          </marker>
        </defs>
        <g className="gold-atoms">
          {[130, 180, 230].map((y, row) => (
            [410, 460, 510].map((x, column) => (
              <g key={`${row}-${column}`} transform={`translate(${x + (row % 2) * 26} ${y})`}>
                <circle r="22" />
                <circle r="7" />
              </g>
            ))
          ))}
        </g>
        <line className="alpha-path straight" x1="42" y1="92" x2="590" y2="92" markerEnd="url(#arrowHead)" />
        <path className="alpha-path slight" d="M42 132 C210 132 360 128 590 78" markerEnd="url(#arrowHead)" />
        <path className="alpha-path back" d="M42 176 C230 176 360 205 302 224 C260 236 196 212 152 192" markerEnd="url(#arrowHead)" />
        <text x="100" y="82">A</text>
        <text x="100" y="122">B</text>
        <text x="100" y="166">C</text>
        <text x="410" y="40">gold foil</text>
      </svg>
      <div>
        <span>A mostly passes straight through</span>
        <span>B deflects slightly</span>
        <span>C rarely deflects backwards</span>
      </div>
    </div>
  )
}

function LithiumAtomVisual() {
  const nucleus = ['p⁺', 'n⁰', 'p⁺', 'n⁰', 'n⁰', 'p⁺', 'n⁰']

  return (
    <div className="lithium-atom-visual" aria-label="Lithium-7 atom with three protons, four neutrons and three electrons">
      <div className="lithium-ring inner" />
      <div className="lithium-ring outer" />
      <div className="lithium-nucleus">
        {nucleus.map((particle, index) => <span key={`${particle}-${index}`}>{particle}</span>)}
      </div>
      <span className="lithium-electron e1">e⁻</span>
      <span className="lithium-electron e2">e⁻</span>
      <span className="lithium-electron e3">e⁻</span>
      <strong>⁷₃Li</strong>
    </div>
  )
}

function IsotopeNotationVisual() {
  return (
    <div className="isotope-notation-visual" aria-label="Isotope notation">
      <div className="isotope-symbol">
        <span className="mass-number">A</span>
        <span className="atomic-number">Z</span>
        <strong>X</strong>
      </div>
      <ul>
        <li>A = mass number = protons + neutrons</li>
        <li>Z = atomic number = proton number</li>
        <li>For a neutral atom, electrons = protons</li>
      </ul>
    </div>
  )
}

function RadiusTrendVisual() {
  return (
    <div className="radius-visual" aria-label="Atomic radius trends">
      <div>
        <span>Across a period</span>
        <b className="radius-dot large">Na</b>
        <b className="radius-dot medium">Mg</b>
        <b className="radius-dot small">Cl</b>
      </div>
      <div>
        <span>Down a group</span>
        <b className="radius-dot small">Li</b>
        <b className="radius-dot medium">Na</b>
        <b className="radius-dot large">K</b>
      </div>
    </div>
  )
}

function ConceptVisual({ type }) {
  if (type === 'nuclear-model') return <NuclearModelVisual />
  if (type === 'particle-table') return <ParticleTableVisual />
  if (type === 'electric-field') return <ElectricFieldVisual />
  if (type === 'alpha-scattering') return <AlphaScatteringVisual />
  if (type === 'lithium-atom') return <LithiumAtomVisual />
  if (type === 'isotope-notation') return <IsotopeNotationVisual />
  if (type === 'radius-trends') return <RadiusTrendVisual />
  return null
}

const atomPresets = [
  { label: 'Carbon-12 atom', z: 6, mass: 12, charge: 0 },
  { label: 'Magnesium-24 ion', z: 12, mass: 24, charge: 2 },
  { label: 'Chloride-35 ion', z: 17, mass: 35, charge: -1 },
  { label: 'Oxygen-16 ion', z: 8, mass: 16, charge: -2 },
]

function formatIonCharge(charge) {
  if (charge === 0) return '0'
  return charge > 0 ? `${charge}+` : `${Math.abs(charge)}-`
}

function ParticleCounter() {
  const [values, setValues] = useState({ z: 12, mass: 24, charge: 2 })
  const protons = Number(values.z)
  const massNumber = Number(values.mass)
  const charge = Number(values.charge)
  const neutrons = massNumber - protons
  const electrons = protons - charge
  const valid = Number.isFinite(protons) && Number.isFinite(massNumber) && Number.isFinite(charge) && protons > 0 && massNumber >= protons && electrons >= 0

  function updateValue(key, value) {
    setValues(previous => ({ ...previous, [key]: value }))
  }

  return (
    <div className="lesson-interactive particle-counter">
      <div className="interactive-inputs">
        <div className="preset-row">
          {atomPresets.map(preset => (
            <button key={preset.label} type="button" onClick={() => setValues({ z: preset.z, mass: preset.mass, charge: preset.charge })}>
              {preset.label}
            </button>
          ))}
        </div>
        <label>
          <span>Atomic number, Z</span>
          <input type="number" value={values.z} onChange={event => updateValue('z', event.target.value)} />
        </label>
        <label>
          <span>Mass number, A</span>
          <input type="number" value={values.mass} onChange={event => updateValue('mass', event.target.value)} />
        </label>
        <label>
          <span>Ion charge</span>
          <input type="number" value={values.charge} onChange={event => updateValue('charge', event.target.value)} />
        </label>
      </div>
      <div className="particle-results">
        <article><span>Protons</span><strong>{valid ? protons : '?'}</strong><small>same as atomic number</small></article>
        <article><span>Neutrons</span><strong>{valid ? neutrons : '?'}</strong><small>A - Z</small></article>
        <article><span>Electrons</span><strong>{valid ? electrons : '?'}</strong><small>Z - charge</small></article>
        <article><span>Overall charge</span><strong>{valid ? formatIonCharge(charge) : '?'}</strong><small>protons minus electrons</small></article>
      </div>
      <p className={valid ? 'feedback good' : 'feedback needs-work'}>
        {valid
          ? `This species has ${protons} protons, ${neutrons} neutrons and ${electrons} electrons.`
          : 'Check that mass number is at least the atomic number and electron number is not negative.'}
      </p>
    </div>
  )
}

const beamParticles = {
  proton: {
    name: 'Proton',
    charge: '+1',
    mass: '1',
    path: 'M25 95 C155 92 245 58 392 35',
    explanation: 'A proton is positive, so it bends towards the negative plate. It is much heavier than an electron, so the deflection is smaller.',
  },
  neutron: {
    name: 'Neutron',
    charge: '0',
    mass: '1',
    path: 'M25 95 L392 95',
    explanation: 'A neutron has no charge, so the electric field does not deflect it.',
  },
  electron: {
    name: 'Electron',
    charge: '-1',
    mass: '1/1836',
    path: 'M25 95 C135 105 230 148 392 168',
    explanation: 'An electron is negative, so it bends towards the positive plate. Its very small mass means a much larger deflection.',
  },
}

function BeamDeflectionExplorer() {
  const [particleKey, setParticleKey] = useState('electron')
  const particle = beamParticles[particleKey]

  return (
    <div className="lesson-interactive beam-explorer">
      <div className="preset-row">
        {Object.entries(beamParticles).map(([key, item]) => (
          <button className={key === particleKey ? 'active' : ''} key={key} type="button" onClick={() => setParticleKey(key)}>
            {item.name}
          </button>
        ))}
      </div>
      <div className="field-visual interactive-field">
        <span className="plate negative">negative plate</span>
        <svg viewBox="0 0 420 190" role="img" aria-label={`${particle.name} beam path`}>
          <path className={`beam ${particleKey} active`} d={particle.path} />
        </svg>
        <span className="plate positive">positive plate</span>
      </div>
      <div className="beam-readout">
        <article><span>Particle</span><strong>{particle.name}</strong></article>
        <article><span>Relative charge</span><strong>{particle.charge}</strong></article>
        <article><span>Relative mass</span><strong>{particle.mass}</strong></article>
      </div>
      <p className="feedback good">{particle.explanation}</p>
    </div>
  )
}

const radiusModes = {
  period: {
    title: 'Across a period',
    summary: 'Atomic radius decreases from left to right.',
    reason: 'Proton number increases, so nuclear charge increases. Electrons are added to the same principal shell, so shielding changes little. The outer shell is pulled closer.',
  },
  group: {
    title: 'Down a group',
    summary: 'Atomic radius increases down the group.',
    reason: 'Each step down adds another occupied shell. The outer electron is further from the nucleus and more shielded.',
  },
  ions: {
    title: 'Atoms and ions',
    summary: 'Cations are smaller than their atoms; anions are larger.',
    reason: 'Cations lose electrons and may lose a whole outer shell. Anions gain electrons, increasing electron-electron repulsion.',
  },
}

function RadiusTrendExplorer() {
  const [mode, setMode] = useState('period')
  const active = radiusModes[mode]

  return (
    <div className="lesson-interactive radius-explorer">
      <div className="preset-row">
        {Object.entries(radiusModes).map(([key, item]) => (
          <button className={key === mode ? 'active' : ''} key={key} type="button" onClick={() => setMode(key)}>
            {item.title}
          </button>
        ))}
      </div>
      <RadiusTrendVisual />
      <div className="radius-explanation">
        <strong>{active.summary}</strong>
        <p>{active.reason}</p>
      </div>
    </div>
  )
}

const subshellModels = {
  s: {
    label: 's sub-shell',
    orbitals: 1,
    capacity: 2,
    shape: 'One spherical orbital',
    examples: '1s, 2s, 3s, 4s',
  },
  p: {
    label: 'p sub-shell',
    orbitals: 3,
    capacity: 6,
    shape: 'Three dumbbell-shaped orbitals at right angles',
    examples: '2p, 3p, 4p',
  },
  d: {
    label: 'd sub-shell',
    orbitals: 5,
    capacity: 10,
    shape: 'Five orbitals; their shapes are not required here',
    examples: '3d',
  },
}

function FilledOrbitalBoxes({ orbitalCount, electronCount }) {
  const occupancies = Array.from({ length: orbitalCount }, () => 0)
  for (let index = 0; index < Math.min(electronCount, orbitalCount); index += 1) occupancies[index] = 1
  for (let index = orbitalCount; index < electronCount; index += 1) occupancies[index - orbitalCount] = 2

  return (
    <div className="orbital-box-row" aria-label={`${electronCount} electrons in ${orbitalCount} orbitals`}>
      {occupancies.map((occupancy, index) => (
        <span className="orbital-box" key={`${orbitalCount}-${index}`}>
          {occupancy > 0 && <i>↑</i>}
          {occupancy > 1 && <i>↓</i>}
        </span>
      ))}
    </div>
  )
}

function SubshellCapacityExplorer() {
  const [subshellKey, setSubshellKey] = useState('p')
  const model = subshellModels[subshellKey]

  return (
    <div className="lesson-interactive subshell-explorer">
      <div className="preset-row" role="group" aria-label="Choose a sub-shell">
        {Object.keys(subshellModels).map(key => (
          <button className={key === subshellKey ? 'active' : ''} key={key} type="button" onClick={() => setSubshellKey(key)}>
            {key} sub-shell
          </button>
        ))}
      </div>
      <div className="subshell-stage">
        <div>
          <p className="eyebrow">Maximum occupancy</p>
          <h4>{model.label}</h4>
          <FilledOrbitalBoxes orbitalCount={model.orbitals} electronCount={model.capacity} />
          <p>Each box represents one orbital. Each orbital holds no more than two electrons with opposite spins.</p>
        </div>
        <dl>
          <div><dt>Orbitals</dt><dd>{model.orbitals}</dd></div>
          <div><dt>Maximum electrons</dt><dd>{model.capacity}</dd></div>
          <div><dt>Model</dt><dd>{model.shape}</dd></div>
          <div><dt>Examples</dt><dd>{model.examples}</dd></div>
        </dl>
      </div>
    </div>
  )
}

const electronSpecies = [
  {
    id: 'na',
    label: 'Na',
    name: 'sodium atom',
    protonNumber: 11,
    charge: 0,
    shellArrangement: '2, 8, 1',
    configuration: [['1s', 2], ['2s', 2], ['2p', 6], ['3s', 1]],
    note: 'The final electron occupies 3s, so sodium has one outer-shell electron.',
  },
  {
    id: 'al3',
    label: 'Al³⁺',
    name: 'aluminium ion',
    protonNumber: 13,
    charge: 3,
    shellArrangement: '2, 8',
    configuration: [['1s', 2], ['2s', 2], ['2p', 6]],
    note: 'Aluminium loses its three n = 3 electrons to form Al³⁺.',
  },
  {
    id: 'cl1',
    label: 'Cl⁻',
    name: 'chloride ion',
    protonNumber: 17,
    charge: -1,
    shellArrangement: '2, 8, 8',
    configuration: [['1s', 2], ['2s', 2], ['2p', 6], ['3s', 2], ['3p', 6]],
    note: 'Chlorine gains one electron to complete the 3p sub-shell.',
  },
  {
    id: 'cr',
    label: 'Cr',
    name: 'chromium atom',
    protonNumber: 24,
    charge: 0,
    shellArrangement: '2, 8, 13, 1',
    configuration: [['1s', 2], ['2s', 2], ['2p', 6], ['3s', 2], ['3p', 6], ['4s', 1], ['3d', 5]],
    note: 'Chromium is an exception to the simplest filling pattern: it has a half-filled 3d sub-shell and one 4s electron.',
  },
  {
    id: 'fe2',
    label: 'Fe²⁺',
    name: 'iron(II) ion',
    protonNumber: 26,
    charge: 2,
    shellArrangement: '2, 8, 14',
    configuration: [['1s', 2], ['2s', 2], ['2p', 6], ['3s', 2], ['3p', 6], ['3d', 6]],
    note: 'Although 4s fills before 3d, transition-metal ions lose 4s electrons first.',
  },
]

function ConfigurationNotation({ configuration }) {
  return (
    <span className="configuration-notation">
      {configuration.map(([subshell, electrons]) => <span key={subshell}>{subshell}<sup>{electrons}</sup></span>)}
    </span>
  )
}

function ElectronConfigurationLab() {
  const [speciesId, setSpeciesId] = useState('na')
  const species = electronSpecies.find(item => item.id === speciesId) || electronSpecies[0]
  const electronCount = species.protonNumber - species.charge
  const electronCalculation = species.charge < 0
    ? `${species.protonNumber} + ${Math.abs(species.charge)} = ${electronCount}`
    : `${species.protonNumber} - ${species.charge} = ${electronCount}`

  return (
    <div className="lesson-interactive configuration-lab">
      <div className="preset-row" role="group" aria-label="Choose an atom or ion">
        {electronSpecies.map(item => (
          <button className={item.id === species.id ? 'active' : ''} key={item.id} type="button" onClick={() => setSpeciesId(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="configuration-stage">
        <div className="species-identity">
          <span>{species.label}</span>
          <div><strong>{species.name}</strong><small>{species.protonNumber} protons • {electronCount} electrons</small></div>
        </div>
        <div className="configuration-calculation">
          <span>Electron count</span>
          <strong>{electronCalculation}</strong>
          <small>subtract positive charge; add the magnitude of negative charge</small>
        </div>
        <div className="configuration-result">
          <span>Sub-shell notation</span>
          <ConfigurationNotation configuration={species.configuration} />
        </div>
        <div className="configuration-result">
          <span>Shell arrangement</span>
          <strong>{species.shellArrangement}</strong>
        </div>
      </div>
      <p className="feedback good">{species.note}</p>
    </div>
  )
}

const orbitalBoxSpecies = [
  { id: 'c', label: 'C', name: 'carbon', configuration: [['1s', 2], ['2s', 2], ['2p', 2]], unpaired: 2, note: 'The two 2p electrons occupy separate orbitals with parallel spins.' },
  { id: 'n', label: 'N', name: 'nitrogen', configuration: [['1s', 2], ['2s', 2], ['2p', 3]], unpaired: 3, note: 'Each 2p orbital is singly occupied before pairing begins.' },
  { id: 'o', label: 'O', name: 'oxygen', configuration: [['1s', 2], ['2s', 2], ['2p', 4]], unpaired: 2, note: 'The fourth 2p electron pairs in one orbital; two 2p electrons remain unpaired.' },
  { id: 's', label: 'S', name: 'sulfur', configuration: [['1s', 2], ['2s', 2], ['2p', 6], ['3s', 2], ['3p', 4]], unpaired: 2, note: 'A paired 3p electron experiences spin-pair repulsion, which matters when comparing ionisation energies.' },
  { id: 'cl-radical', label: 'Cl•', name: 'chlorine radical', configuration: [['1s', 2], ['2s', 2], ['2p', 6], ['3s', 2], ['3p', 5]], unpaired: 1, note: 'One unpaired electron makes this chlorine species a free radical.' },
]

function orbitalCountForSubshell(subshell) {
  if (subshell.endsWith('s')) return 1
  if (subshell.endsWith('p')) return 3
  return 5
}

function OrbitalBoxLab() {
  const [speciesId, setSpeciesId] = useState('c')
  const species = orbitalBoxSpecies.find(item => item.id === speciesId) || orbitalBoxSpecies[0]

  return (
    <div className="lesson-interactive orbital-box-lab">
      <div className="preset-row" role="group" aria-label="Choose a species">
        {orbitalBoxSpecies.map(item => (
          <button className={item.id === species.id ? 'active' : ''} key={item.id} type="button" onClick={() => setSpeciesId(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="orbital-energy-board">
        <div className="orbital-energy-axis"><span>higher energy</span><i /><span>lower energy</span></div>
        <div className="orbital-configuration-rows">
          {[...species.configuration].reverse().map(([subshell, electrons]) => (
            <div className="orbital-configuration-row" key={subshell}>
              <strong>{subshell}<sup>{electrons}</sup></strong>
              <FilledOrbitalBoxes orbitalCount={orbitalCountForSubshell(subshell)} electronCount={electrons} />
            </div>
          ))}
        </div>
      </div>
      <div className="orbital-box-summary">
        <span>{species.label}</span>
        <p><strong>{species.unpaired} unpaired electron{species.unpaired === 1 ? '' : 's'}.</strong> {species.note}</p>
      </div>
    </div>
  )
}

const orbitalShapeModels = {
  s: { label: 's orbital', description: 'Spherical electron-density region centred on the nucleus.', axis: 'No preferred direction' },
  px: { label: 'pₓ orbital', description: 'Two lobes on opposite sides of the nucleus with a nodal plane through the nucleus.', axis: 'Aligned with the x-axis' },
  py: { label: 'pᵧ orbital', description: 'The same p-orbital shape rotated to a different orientation.', axis: 'Aligned with the y-axis' },
  pz: { label: 'p orbital (z-axis)', description: 'A third p orbital at right angles to pₓ and pᵧ.', axis: 'Aligned with the z-axis' },
}

function OrbitalShapeExplorer() {
  const [shapeKey, setShapeKey] = useState('s')
  const shape = orbitalShapeModels[shapeKey]
  const isS = shapeKey === 's'

  return (
    <div className="lesson-interactive orbital-shape-explorer">
      <div className="preset-row" role="group" aria-label="Choose an orbital">
        {Object.entries(orbitalShapeModels).map(([key, item]) => (
          <button className={key === shapeKey ? 'active' : ''} key={key} type="button" onClick={() => setShapeKey(key)}>
            {item.label}
          </button>
        ))}
      </div>
      <div className={`orbital-shape-stage ${shapeKey}`}>
        <span className="orbital-axis horizontal">x</span>
        <span className="orbital-axis vertical">y</span>
        {isS ? (
          <div className="s-orbital-cloud"><span>nucleus</span></div>
        ) : (
          <div className="p-orbital-model">
            <span className="p-lobe first" />
            <i>nucleus</i>
            <span className="p-lobe second" />
          </div>
        )}
      </div>
      <div className="orbital-shape-copy"><strong>{shape.label}</strong><p>{shape.description}</p><span>{shape.axis}</span></div>
    </div>
  )
}

const ionisationElements = [
  { symbol: 'Mg', name: 'magnesium', maxOrder: 4 },
  { symbol: 'Ca', name: 'calcium', maxOrder: 4 },
  { symbol: 'P', name: 'phosphorus', maxOrder: 4 },
  { symbol: 'F', name: 'fluorine', maxOrder: 4 },
]

function chargeText(charge) {
  if (charge === 0) return ''
  return charge === 1 ? '+' : `${charge}+`
}

function IonSpecies({ symbol, charge = 0 }) {
  return <span className="ion-species">{symbol}{charge > 0 && <sup>{chargeText(charge)}</sup>}<small>(g)</small></span>
}

function ordinal(value) {
  if (value === 1) return 'first'
  if (value === 2) return 'second'
  if (value === 3) return 'third'
  return `${value}th`
}

function IonisationEquationExplorer() {
  const [elementSymbol, setElementSymbol] = useState('Mg')
  const [order, setOrder] = useState(1)
  const element = ionisationElements.find(item => item.symbol === elementSymbol) || ionisationElements[0]
  const reactantCharge = order - 1
  const productCharge = order

  return (
    <div className="lesson-interactive ionisation-equation-explorer">
      <div className="ionisation-equation-controls">
        <div className="preset-row" role="group" aria-label="Choose an element">
          {ionisationElements.map(item => (
            <button className={item.symbol === element.symbol ? 'active' : ''} key={item.symbol} type="button" onClick={() => setElementSymbol(item.symbol)}>
              {item.symbol}
            </button>
          ))}
        </div>
        <div className="preset-row" role="group" aria-label="Choose an ionisation number">
          {[1, 2, 3, 4].map(value => (
            <button className={value === order ? 'active' : ''} key={value} type="button" onClick={() => setOrder(value)}>
              IE<sub>{value}</sub>
            </button>
          ))}
        </div>
      </div>
      <div className="ionisation-equation-stage">
        <span className="equation-caption">{ordinal(order)} ionisation energy of {element.name}</span>
        <div className="ionisation-equation">
          <IonSpecies symbol={element.symbol} charge={reactantCharge} />
          <ArrowRight size={32} />
          <IonSpecies symbol={element.symbol} charge={productCharge} />
          <b>+</b>
          <span className="electron-symbol">e⁻</span>
        </div>
      </div>
      <p className="feedback good">The {ordinal(order)} ionisation removes one electron from one mole of gaseous {reactantCharge ? `${element.symbol}${chargeText(reactantCharge)} ions` : `${element.symbol} atoms`}.</p>
    </div>
  )
}

const ionisationTrendSets = {
  period3: {
    label: 'Across Period 3',
    summary: 'The overall rise comes from increasing nuclear charge while electrons enter the same principal shell.',
    data: [
      { element: 'Na', value: 496, note: 'One 3s electron starts the period.' },
      { element: 'Mg', value: 738, note: 'The 3s sub-shell is filled.' },
      { element: 'Al', value: 578, note: 'The electron removed is from higher-energy 3p, so the value falls below Mg.' },
      { element: 'Si', value: 787, note: 'Increasing nuclear charge strengthens attraction.' },
      { element: 'P', value: 1012, note: 'Three unpaired 3p electrons form a relatively stable arrangement.' },
      { element: 'S', value: 1000, note: 'A paired 3p electron experiences extra repulsion, so the value falls slightly below P.' },
      { element: 'Cl', value: 1251, note: 'Greater nuclear charge raises the attraction.' },
      { element: 'Ar', value: 1521, note: 'A filled outer shell gives the highest value in the period.' },
    ],
  },
  group2: {
    label: 'Down Group 2',
    summary: 'Values decrease because the outer electron is further from the nucleus and more shielded by inner shells.',
    data: [
      { element: 'Be', value: 900, note: 'The outer electron is in the n = 2 shell.' },
      { element: 'Mg', value: 738, note: 'An extra occupied shell increases distance and shielding.' },
      { element: 'Ca', value: 590, note: 'The 4s electron is further from the nucleus.' },
      { element: 'Sr', value: 550, note: 'Further distance and shielding weaken attraction.' },
      { element: 'Ba', value: 503, note: 'The outer electron is most shielded in this set.' },
    ],
  },
}

function IonisationTrendExplorer() {
  const [setKey, setSetKey] = useState('period3')
  const [selectedElement, setSelectedElement] = useState('Al')
  const trendSet = ionisationTrendSets[setKey]
  const selected = trendSet.data.find(item => item.element === selectedElement) || trendSet.data[0]
  const maximum = Math.max(...trendSet.data.map(item => item.value))

  function selectSet(key) {
    setSetKey(key)
    setSelectedElement(ionisationTrendSets[key].data[0].element)
  }

  return (
    <div className="lesson-interactive ionisation-trend-explorer">
      <div className="preset-row" role="group" aria-label="Choose a trend">
        {Object.entries(ionisationTrendSets).map(([key, item]) => (
          <button className={key === setKey ? 'active' : ''} key={key} type="button" onClick={() => selectSet(key)}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="ie-chart-shell">
        <span className="ie-y-axis">First ionisation energy / kJ mol⁻¹</span>
        <div className="ie-bar-chart" style={{ gridTemplateColumns: `repeat(${trendSet.data.length}, minmax(68px, 1fr))` }}>
          {trendSet.data.map(item => (
            <button className={item.element === selected.element ? 'active' : ''} key={item.element} type="button" onClick={() => setSelectedElement(item.element)} aria-label={`${item.element}: ${item.value} kilojoules per mole`}>
              <span className="ie-bar-value">{item.value}</span>
              <i style={{ height: `${Math.max(18, (item.value / maximum) * 100)}%` }} />
              <strong>{item.element}</strong>
            </button>
          ))}
        </div>
      </div>
      <div className="ie-trend-explanation">
        <div><span>{selected.element}</span><strong>{selected.value} kJ mol⁻¹</strong></div>
        <p>{selected.note}</p>
        <small>{trendSet.summary}</small>
      </div>
    </div>
  )
}

const successiveIonisationSets = [
  { id: 'na', element: 'Na', group: 'Group 1', outer: '3s¹', values: [496, 4563, 6913, 9544, 13352], jumpAfter: 1, note: 'The large jump after IE₁ shows that sodium has one outer-shell electron.' },
  { id: 'mg', element: 'Mg', group: 'Group 2', outer: '3s²', values: [738, 1451, 7733, 10542, 13630], jumpAfter: 2, note: 'The large jump after IE₂ shows that magnesium has two outer-shell electrons.' },
  { id: 'al', element: 'Al', group: 'Group 13', outer: '3s² 3p¹', values: [578, 1817, 2745, 11578, 14831], jumpAfter: 3, note: 'The large jump after IE₃ shows that aluminium has three outer-shell electrons.' },
  { id: 'si', element: 'Si', group: 'Group 14', outer: '3s² 3p²', values: [787, 1577, 3232, 4356, 16091], jumpAfter: 4, note: 'The large jump after IE₄ shows that silicon has four outer-shell electrons.' },
]

function SuccessiveIonisationExplorer() {
  const [elementId, setElementId] = useState('mg')
  const [selectedIndex, setSelectedIndex] = useState(2)
  const element = successiveIonisationSets.find(item => item.id === elementId) || successiveIonisationSets[0]
  const logValues = element.values.map(value => Math.log10(value))
  const minimum = Math.min(...logValues)
  const maximum = Math.max(...logValues)

  function selectElement(id) {
    const next = successiveIonisationSets.find(item => item.id === id) || successiveIonisationSets[0]
    setElementId(id)
    setSelectedIndex(Math.min(next.jumpAfter, next.values.length - 1))
  }

  return (
    <div className="lesson-interactive successive-ie-explorer">
      <div className="preset-row" role="group" aria-label="Choose an element">
        {successiveIonisationSets.map(item => (
          <button className={item.id === element.id ? 'active' : ''} key={item.id} type="button" onClick={() => selectElement(item.id)}>
            {item.element}
          </button>
        ))}
      </div>
      <div className="successive-chart-shell">
        <span className="ie-y-axis">Successive ionisation energy / kJ mol⁻¹</span>
        <div className="successive-bar-chart">
          {element.values.map((value, index) => {
            const height = 24 + ((logValues[index] - minimum) / Math.max(0.1, maximum - minimum)) * 76
            const isJump = index === element.jumpAfter
            return (
              <button className={`${index === selectedIndex ? 'active' : ''} ${isJump ? 'jump' : ''}`} key={`${element.id}-${index}`} type="button" onClick={() => setSelectedIndex(index)}>
                <span>{value.toLocaleString()}</span>
                <i style={{ height: `${height}%` }} />
                <strong>IE<sub>{index + 1}</sub></strong>
              </button>
            )
          })}
        </div>
        <small>Logarithmic display scale; labels show the actual values.</small>
      </div>
      <div className="successive-deduction">
        <div><span>Selected</span><strong>IE<sub>{selectedIndex + 1}</sub> = {element.values[selectedIndex].toLocaleString()} kJ mol⁻¹</strong></div>
        <div><span>Largest jump</span><strong>after IE<sub>{element.jumpAfter}</sub></strong></div>
        <div><span>Deduction</span><strong>{element.group} • outer configuration {element.outer}</strong></div>
      </div>
      <p className="feedback good">{element.note}</p>
    </div>
  )
}

function InteractiveBlock({ item }) {
  return (
    <article className="interactive-block">
      <div className="lesson-section-heading">
        <p className="eyebrow">Interactive</p>
        <OutcomeTags codes={item.outcomeCodes} />
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
      {item.type === 'particle-counter' && <ParticleCounter />}
      {item.type === 'beam-deflection' && <BeamDeflectionExplorer />}
      {item.type === 'radius-trends' && <RadiusTrendExplorer />}
      {item.type === 'subshell-capacity' && <SubshellCapacityExplorer />}
      {item.type === 'electron-configuration' && <ElectronConfigurationLab />}
      {item.type === 'orbital-boxes' && <OrbitalBoxLab />}
      {item.type === 'orbital-shapes' && <OrbitalShapeExplorer />}
      {item.type === 'ionisation-equations' && <IonisationEquationExplorer />}
      {item.type === 'ionisation-trends' && <IonisationTrendExplorer />}
      {item.type === 'successive-ionisation' && <SuccessiveIonisationExplorer />}
    </article>
  )
}

function CheckpointQuestion({ question, index }) {
  const [response, setResponse] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  return (
    <article className="checkpoint-question-card">
      <span>Checkpoint {index + 1}</span>
      <OutcomeTags codes={question.outcomeCodes} />
      <strong>{question.prompt}</strong>
      <textarea value={response} onChange={event => setResponse(event.target.value)} placeholder="Write your explanation or calculation here." rows="4" />
      <div className="checkpoint-actions">
        <button className="btn" type="button" onClick={() => setShowHint(true)}>Hint</button>
        <button className="btn primary" type="button" onClick={() => setShowAnswer(true)}>Reveal answer</button>
      </div>
      {showHint && <p className="feedback needs-work">Hint: {question.hint}</p>}
      {showAnswer && <p className="feedback good">Answer: {question.answer}</p>}
    </article>
  )
}

function SubtopicExitQuestionCard({ question, index }) {
  const [response, setResponse] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  return (
    <article className="subtopic-exit-question-card">
      <div className="subtopic-exit-question-meta">
        <span>Question {index + 1}</span>
        {question.marks && <strong>{question.marks} marks</strong>}
      </div>
      <OutcomeTags codes={question.outcomeCodes} />
      <h4>{question.prompt}</h4>
      <textarea value={response} onChange={event => setResponse(event.target.value)} placeholder="Write an exam-style answer here." rows="4" />
      <div className="checkpoint-actions">
        {question.hint && <button className="btn" type="button" onClick={() => setShowHint(previous => !previous)}>{showHint ? 'Hide hint' : 'Hint'}</button>}
        {question.answer && <button className="btn primary" type="button" onClick={() => setShowAnswer(previous => !previous)}>{showAnswer ? 'Hide answer' : 'Reveal answer'}</button>}
      </div>
      {showHint && <p className="feedback needs-work">Hint: {question.hint}</p>}
      {showAnswer && <p className="feedback good">Answer: {question.answer}</p>}
    </article>
  )
}

function SubtopicExitTicketPanel({ subtopic }) {
  const questions = subtopic.examStyleExitTicket || []
  if (!questions.length) return null

  return (
    <section className="lesson-template-section subtopic-exit-ticket-panel" id="lesson-exit">
      <div className="lesson-section-heading">
        <p className="eyebrow">Exam-style exit ticket</p>
        <h3>{subtopic.ref} {subtopic.title}: final check</h3>
        <p>Short exam-style questions for this subtopic only. Full exam practice and past papers are separate topic pages.</p>
      </div>
      <div className="subtopic-exit-question-grid">
        {questions.map((question, index) => (
          <SubtopicExitQuestionCard question={question} index={index} key={question.id} />
        ))}
      </div>
    </section>
  )
}

function WebLessonExperience({ lesson, activities = [] }) {
  return (
    <section className="web-lesson-experience" id="lesson-work">
      <div className="web-lesson-title">
        <p className="eyebrow">Web lesson</p>
        <h3>{lesson.title}</h3>
        <p>{lesson.subtitle}</p>
      </div>

      <ChoiceCheck
        title="Warm-up check"
        subtitle="Answer these before starting the new content. Feedback appears immediately."
        items={lesson.priorKnowledge}
      />

      <section className="web-lesson-card">
        <div className="lesson-section-heading">
          <p className="eyebrow">Content</p>
          <h3>Core ideas students must be able to explain</h3>
        </div>
        <div className="concept-card-grid">
          {lesson.teachingSections.map(section => (
            <article className="concept-card" key={section.title}>
              <div>
                <span>{section.tag}</span>
                <OutcomeTags codes={section.outcomeCodes} />
                <h4>{section.title}</h4>
                <p>{section.body}</p>
              </div>
              <ConceptVisual type={section.visual} />
              <ul>
                {section.keyPoints.map(point => <li key={point}>{point}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="web-lesson-card">
        <div className="lesson-section-heading">
          <p className="eyebrow">Outcome-aligned activities</p>
          <h3>Each activity has a clear syllabus purpose.</h3>
        </div>
        <div className="lesson-activity-timeline web-activity-plan">
          {activities.map(activity => (
            <article className="lesson-activity-card" key={`${activity.phase}-${activity.title}`}>
              <OutcomeTags codes={activity.outcomeCodes} />
              <span>{activity.phase}</span>
              <strong>{activity.title}</strong>
              <p>{activity.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="web-lesson-card">
        <div className="lesson-section-heading">
          <p className="eyebrow">Activities</p>
          <h3>Use the models, then explain the chemistry.</h3>
        </div>
        <div className="interactive-grid">
          {lesson.interactives.map(item => <InteractiveBlock item={item} key={item.type} />)}
        </div>
      </section>

      <section className="web-lesson-card">
        <div className="lesson-section-heading">
          <p className="eyebrow">Checkpoints</p>
          <h3>Try these before the exit ticket.</h3>
        </div>
        <div className="checkpoint-question-grid">
          {lesson.checkpointQuestions.map((question, index) => (
            <CheckpointQuestion question={question} index={index} key={question.id} />
          ))}
        </div>
      </section>

      <ChoiceCheck
        title="Exit ticket"
        subtitle="Submit when you are ready. Aim for at least 4 out of 5 before moving on."
        items={lesson.exitTicket}
        mode="exit"
      />
    </section>
  )
}

export default function LessonTemplate({ topic, template, currentUser }) {
  const [activeSubtopicId, setActiveSubtopicId] = useState(template.subtopics[0]?.ref || '')
  const [assets, setAssets] = useState(() => normaliseAssets(getSavedAssets(topic.id)))
  const [slideDraft, setSlideDraft] = useState({ title: '', url: '' })
  const [videoDraft, setVideoDraft] = useState({ title: '', url: '' })
  const canEdit = ['teacher', 'admin'].includes(currentUser?.role)

  const activeSubtopic = template.subtopics.find(subtopic => subtopic.ref === activeSubtopicId) || template.subtopics[0]
  const activeSubtopicIndex = template.subtopics.findIndex(subtopic => subtopic.ref === activeSubtopic.ref)
  const activeLessonCount = activeSubtopic.workbookLessons?.length || (activeSubtopic.webLesson ? 1 : 0)
  const activeSlides = assets.slides.filter(slide => !slide.subtopicRef || slide.subtopicRef === activeSubtopic.ref)
  const activeVideos = assets.videos.filter(video => !video.subtopicRef || video.subtopicRef === activeSubtopic.ref)
  const activeSeedVideos = useMemo(
    () => activeSubtopic.resources.filter(resource => resource.type === 'video').map(resource => ({
      id: `${activeSubtopic.ref}-${resource.url}`,
      title: resource.title,
      url: resource.url,
    })),
    [activeSubtopic],
  )
  const hasAttachedMedia = activeSlides.length + activeSeedVideos.length + activeVideos.length > 0

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(`sep-chem-lesson-assets:${topic.id}`, JSON.stringify(assets))
  }, [assets, topic.id])

  function addSlide(event) {
    event.preventDefault()
    if (!slideDraft.title.trim() || !safeEmbedUrl(slideDraft.url)) return
    setAssets(previous => ({
      ...previous,
      slides: [...previous.slides, { id: `slide-${Date.now()}`, subtopicRef: activeSubtopic.ref, title: slideDraft.title.trim(), url: slideDraft.url.trim() }],
    }))
    setSlideDraft({ title: '', url: '' })
  }

  function addVideo(event) {
    event.preventDefault()
    if (!videoDraft.title.trim() || !youtubeEmbedUrl(videoDraft.url)) return
    setAssets(previous => ({
      ...previous,
      videos: [...previous.videos, { id: `video-${Date.now()}`, subtopicRef: activeSubtopic.ref, title: videoDraft.title.trim(), url: videoDraft.url.trim() }],
    }))
    setVideoDraft({ title: '', url: '' })
  }

  function removeSlide(id) {
    setAssets(previous => ({ ...previous, slides: previous.slides.filter(slide => slide.id !== id) }))
  }

  function removeVideo(id) {
    setAssets(previous => ({ ...previous, videos: previous.videos.filter(video => video.id !== id) }))
  }

  function selectSubtopic(ref) {
    setActiveSubtopicId(ref)
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        document.getElementById('lesson-subtopic-start')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }

  function jumpToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="lesson-template">
      <section className="lesson-template-hero">
        <div>
          <p className="eyebrow">Cambridge AS Chemistry • Topic {template.syllabusNumber}</p>
          <h2>{template.title}</h2>
          <p>{template.lessonGoal}</p>
        </div>
        <div className="lesson-template-stats" aria-label="Lesson summary">
          <span><Layers3 size={18} /><strong>{template.subtopics.length}</strong><small>subtopics</small></span>
          <span><ListChecks size={18} /><strong>{template.subtopics.reduce((sum, subtopic) => sum + subtopic.outcomes.length, 0)}</strong><small>outcomes</small></span>
          <span><Clock3 size={18} /><strong>{template.teachingTime}</strong><small>guided time</small></span>
        </div>
      </section>

      <section className="lesson-template-layout">
        <aside className="lesson-subtopic-nav">
          <div className="lesson-nav-progress">
            <span className="lesson-nav-label">Topic route</span>
            <strong>Section {activeSubtopicIndex + 1} of {template.subtopics.length}</strong>
            <div role="progressbar" aria-valuemin="1" aria-valuemax={template.subtopics.length} aria-valuenow={activeSubtopicIndex + 1}>
              <i style={{ width: `${((activeSubtopicIndex + 1) / template.subtopics.length) * 100}%` }} />
            </div>
          </div>
          {template.subtopics.map(subtopic => (
            <button
              className={subtopic.ref === activeSubtopic.ref ? 'active' : ''}
              key={subtopic.ref}
              type="button"
              aria-current={subtopic.ref === activeSubtopic.ref ? 'step' : undefined}
              onClick={() => selectSubtopic(subtopic.ref)}
            >
              <span className="lesson-subtopic-number">{subtopic.ref}</span>
              <span className="lesson-subtopic-copy">
                <strong>{subtopic.title}</strong>
                <small>
                  {subtopic.workbookLessons?.length
                    ? `${subtopic.workbookLessons.length} web lesson${subtopic.workbookLessons.length > 1 ? 's' : ''}`
                    : `${subtopic.outcomes.length} learning outcomes`}
                </small>
              </span>
            </button>
          ))}
        </aside>

        <div className="lesson-template-main">
          <section className="lesson-subtopic-header" id="lesson-subtopic-start">
            <div>
              <p className="eyebrow">Subtopic {activeSubtopicIndex + 1} of {template.subtopics.length} • {activeSubtopic.ref} • {activeSubtopic.keyConcept}</p>
              <h3>{activeSubtopic.title}</h3>
              <p>{activeSubtopic.lessonQuestion}</p>
            </div>
            <div className="lesson-subtopic-summary" aria-label="Current subtopic summary">
              <span><BookOpenCheck size={18} /><strong>{activeLessonCount || activeSubtopic.activities.length}</strong><small>{activeLessonCount ? `lesson${activeLessonCount > 1 ? 's' : ''}` : 'activities'}</small></span>
              <span><CheckCircle2 size={18} /><strong>{activeSubtopic.outcomes.length}</strong><small>outcomes</small></span>
            </div>
          </section>

          <nav className="lesson-jump-nav" aria-label="Jump within this subtopic">
            <span><Compass size={17} /> Student route</span>
            <button type="button" onClick={() => jumpToSection('lesson-outcomes')}>Outcomes</button>
            <button type="button" onClick={() => jumpToSection('lesson-work')}>Lesson</button>
            <button type="button" onClick={() => jumpToSection('lesson-exit')}>Exam check</button>
            <button type="button" onClick={() => jumpToSection('lesson-resources')}>Resources</button>
          </nav>

          <LearningOutcomesPanel outcomes={activeSubtopic.outcomes} />

          {activeSubtopic.workbookLessons ? (
            <WorkbookLessonExperience subtopic={activeSubtopic} />
          ) : (
            <>
              {activeSubtopic.webLesson && <WebLessonExperience lesson={activeSubtopic.webLesson} activities={activeSubtopic.activities} />}
            </>
          )}

          {!activeSubtopic.workbookLessons && !activeSubtopic.webLesson && (
            <section className="lesson-template-section" id="lesson-work">
              <div className="lesson-section-heading">
                <p className="eyebrow">Suggested teaching activities</p>
                <h3>Turn the Scheme of Work into a classroom sequence.</h3>
              </div>
              <div className="lesson-activity-timeline">
                {activeSubtopic.activities.map(activity => (
                  <article className="lesson-activity-card" key={`${activity.phase}-${activity.title}`}>
                    <OutcomeTags codes={activity.outcomeCodes} />
                    <span>{activity.phase}</span>
                    <strong>{activity.title}</strong>
                    <p>{activity.detail}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          <SubtopicExitTicketPanel subtopic={activeSubtopic} />

          {(hasAttachedMedia || canEdit) && <section className="lesson-template-section lesson-media-section" id="lesson-media">
            <div className="lesson-section-heading">
              <p className="eyebrow">Lesson media</p>
              <h3>{canEdit ? 'Slides and video for this subtopic' : 'Watch and review'}</h3>
            </div>

            <div className="lesson-embed-grid">
              {activeSlides.map(slide => <EmbeddedSlide key={slide.id} slide={slide} onRemove={canEdit ? removeSlide : null} />)}
              {[...activeSeedVideos, ...activeVideos].map(video => (
                <EmbeddedVideo
                  key={video.id}
                  video={video}
                  onRemove={canEdit && String(video.id).startsWith('video-') ? removeVideo : null}
                />
              ))}
            </div>

            {!hasAttachedMedia && canEdit && (
              <div className="lesson-empty-media">
                <Presentation size={24} />
                <strong>No media attached yet</strong>
                <p>Add a published slide deck or YouTube video for this lesson.</p>
              </div>
            )}

            {canEdit && (
              <div className="lesson-media-builder">
                <form onSubmit={addSlide}>
                  <span><Presentation size={18} /> Add slides</span>
                  <input value={slideDraft.title} onChange={event => setSlideDraft({ ...slideDraft, title: event.target.value })} placeholder="Slide deck title" />
                  <input value={slideDraft.url} onChange={event => setSlideDraft({ ...slideDraft, url: event.target.value })} placeholder="Published slide or embed URL" />
                  <button className="btn primary" type="submit"><Plus size={17} /> Add</button>
                </form>
                <form onSubmit={addVideo}>
                  <span><Clapperboard size={18} /> Add YouTube</span>
                  <input value={videoDraft.title} onChange={event => setVideoDraft({ ...videoDraft, title: event.target.value })} placeholder="Video title" />
                  <input value={videoDraft.url} onChange={event => setVideoDraft({ ...videoDraft, url: event.target.value })} placeholder="YouTube URL" />
                  <button className="btn primary" type="submit"><Plus size={17} /> Add</button>
                </form>
              </div>
            )}
          </section>}

          <section className="lesson-template-section lesson-readiness-panel">
            <div>
              <div className="lesson-section-heading">
                <p className="eyebrow">Ready to move on?</p>
                <h3>Use these statements for a final self-check.</h3>
              </div>
              <ul className="lesson-check-list">
                {activeSubtopic.checkpoints.map(check => <li key={check}>{check}</li>)}
              </ul>
            </div>
          </section>

          {canEdit && (
            <section className="lesson-template-section teacher-planning-panel">
              <div className="lesson-section-heading">
                <p className="eyebrow">Teacher planning</p>
                <h3>Notes for teaching this topic</h3>
              </div>
              <ul className="lesson-check-list">
                {template.teacherFocus.map(note => <li key={note}>{note}</li>)}
              </ul>
            </section>
          )}

          <section className="lesson-template-section" id="lesson-resources">
            <div className="lesson-section-heading">
              <p className="eyebrow">Resource links</p>
              <h3>Useful references and simulations</h3>
            </div>
            <div className="lesson-resource-grid">
              {activeSubtopic.resources.map(resource => <ResourceLink key={`${resource.type}-${resource.url}`} resource={resource} />)}
            </div>
          </section>

          <nav className="lesson-subtopic-footer" aria-label="Previous or next subtopic">
            {activeSubtopicIndex > 0 ? (
              <button type="button" onClick={() => selectSubtopic(template.subtopics[activeSubtopicIndex - 1].ref)}>
                <ArrowLeft size={19} />
                <span><small>Previous subtopic</small><strong>{template.subtopics[activeSubtopicIndex - 1].title}</strong></span>
              </button>
            ) : <span />}
            {activeSubtopicIndex < template.subtopics.length - 1 && (
              <button type="button" onClick={() => selectSubtopic(template.subtopics[activeSubtopicIndex + 1].ref)}>
                <span><small>Next subtopic</small><strong>{template.subtopics[activeSubtopicIndex + 1].title}</strong></span>
                <ArrowRight size={19} />
              </button>
            )}
          </nav>
        </div>
      </section>

    </div>
  )
}
