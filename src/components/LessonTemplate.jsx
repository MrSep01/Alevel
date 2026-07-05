import { BookOpenCheck, CheckCircle2, Clapperboard, ExternalLink, FileText, MonitorPlay, Plus, Presentation, Trash2 } from 'lucide-react'
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

function InteractiveBlock({ item }) {
  return (
    <article className="interactive-block">
      <div className="lesson-section-heading">
        <p className="eyebrow">Interactive</p>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
      {item.type === 'particle-counter' && <ParticleCounter />}
      {item.type === 'beam-deflection' && <BeamDeflectionExplorer />}
      {item.type === 'radius-trends' && <RadiusTrendExplorer />}
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

function WebLessonExperience({ lesson }) {
  return (
    <section className="web-lesson-experience">
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

  return (
    <div className="lesson-template">
      <section className="lesson-template-hero">
        <div>
          <p className="eyebrow">Lesson template • Topic {template.syllabusNumber}</p>
          <h2>{template.title}</h2>
          <p>{template.lessonGoal}</p>
        </div>
        <div className="lesson-template-stats" aria-label="Lesson summary">
          <span><BookOpenCheck size={18} /> {template.subtopics.length} subtopics</span>
          <span><CheckCircle2 size={18} /> {template.subtopics.reduce((sum, subtopic) => sum + subtopic.outcomes.length, 0)} outcomes</span>
          <span><Clapperboard size={18} /> {template.teachingTime}</span>
        </div>
      </section>

      <section className="lesson-template-layout">
        <aside className="lesson-subtopic-nav">
          <span className="lesson-nav-label">Syllabus route</span>
          {template.subtopics.map(subtopic => (
            <button
              className={subtopic.ref === activeSubtopic.ref ? 'active' : ''}
              key={subtopic.ref}
              type="button"
              onClick={() => setActiveSubtopicId(subtopic.ref)}
            >
              <span>{subtopic.ref}</span>
              <strong>{subtopic.title}</strong>
              <small>{subtopic.outcomes.length} learning outcomes</small>
            </button>
          ))}
        </aside>

        <div className="lesson-template-main">
          <section className="lesson-subtopic-header">
            <div>
              <p className="eyebrow">{activeSubtopic.ref} • {activeSubtopic.keyConcept}</p>
              <h3>{activeSubtopic.title}</h3>
              <p>{activeSubtopic.lessonQuestion}</p>
            </div>
            <div className="lesson-flow-strip">
              <span>Starter</span>
              <span>Explore</span>
              <span>Explain</span>
              <span>Practice</span>
              <span>Check</span>
            </div>
          </section>

          {activeSubtopic.webLesson && <WebLessonExperience lesson={activeSubtopic.webLesson} />}

          <section className="lesson-template-section">
            <div className="lesson-section-heading">
              <p className="eyebrow">Learning outcomes</p>
              <h3>Build the lesson around these statements.</h3>
            </div>
            <div className="lesson-outcome-grid">
              {activeSubtopic.outcomes.map(outcome => (
                <article className="lesson-outcome-card" key={outcome.code}>
                  <span>{outcome.code}</span>
                  <p>{outcome.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="lesson-template-section">
            <div className="lesson-section-heading">
              <p className="eyebrow">Suggested teaching activities</p>
              <h3>Turn the Scheme of Work into a classroom sequence.</h3>
            </div>
            <div className="lesson-activity-timeline">
              {activeSubtopic.activities.map(activity => (
                <article className="lesson-activity-card" key={`${activity.phase}-${activity.title}`}>
                  <span>{activity.phase}</span>
                  <strong>{activity.title}</strong>
                  <p>{activity.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="lesson-template-section">
            <div className="lesson-section-heading">
              <p className="eyebrow">Slides and video</p>
              <h3>Attach lesson media directly to this subtopic.</h3>
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

            {activeSlides.length === 0 && activeSeedVideos.length + activeVideos.length === 0 && (
              <div className="lesson-empty-media">
                <Presentation size={24} />
                <strong>No media attached yet</strong>
                <p>Teachers can add slide decks and YouTube videos for this lesson.</p>
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
          </section>

          <section className="lesson-template-section lesson-template-two-col">
            <div>
              <div className="lesson-section-heading">
                <p className="eyebrow">Teacher focus</p>
                <h3>Planning notes</h3>
              </div>
              <ul className="lesson-check-list">
                {template.teacherFocus.map(note => <li key={note}>{note}</li>)}
              </ul>
            </div>
            <div>
              <div className="lesson-section-heading">
                <p className="eyebrow">Exit checks</p>
                <h3>Evidence of understanding</h3>
              </div>
              <ul className="lesson-check-list">
                {activeSubtopic.checkpoints.map(check => <li key={check}>{check}</li>)}
              </ul>
            </div>
          </section>

          <section className="lesson-template-section">
            <div className="lesson-section-heading">
              <p className="eyebrow">Resource links</p>
              <h3>Useful references and simulations</h3>
            </div>
            <div className="lesson-resource-grid">
              {activeSubtopic.resources.map(resource => <ResourceLink key={`${resource.type}-${resource.url}`} resource={resource} />)}
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}
