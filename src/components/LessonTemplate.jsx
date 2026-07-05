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
