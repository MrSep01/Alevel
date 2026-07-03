import {
  Atom,
  Beaker,
  BookOpen,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  FlaskConical,
  Leaf,
  Megaphone,
  Microscope,
  Paperclip,
  ScrollText,
  SlidersHorizontal,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { a2Topics, asTopics, igcseTopics } from '../data/topics.js'
import { useLocalStorage } from '../utils/useLocalStorage.js'

function getDueStatus(dueDate, status = 'Not started') {
  if (!dueDate) return { label: 'No due date', tone: 'muted' }
  if (status === 'Done') return { label: 'Done', tone: 'done' }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(`${dueDate}T00:00:00`)
  const diffDays = Math.ceil((due - today) / 86400000)

  if (diffDays < 0) return { label: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`, tone: 'overdue' }
  if (diffDays === 0) return { label: 'Due today', tone: 'urgent' }
  if (diffDays <= 3) return { label: `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`, tone: 'soon' }
  return { label: `Due ${dueDate}`, tone: 'muted' }
}

function getPriorityRank(item) {
  if (item.progress.helpRequested && !item.progress.helpResolved) return 0
  if (item.progress.status !== 'Done' && item.dueStatus.tone === 'overdue') return 1
  if (item.progress.status !== 'Done' && item.dueStatus.tone === 'urgent') return 2
  if (item.progress.status !== 'Done' && item.dueStatus.tone === 'soon') return 3
  if (item.progress.feedback || item.progress.reviewed || (item.progress.score !== undefined && item.progress.score !== '')) return 4
  if (item.progress.status === 'In progress') return 5
  if (item.progress.status === 'Not started' || !item.progress.status) return 6
  return 7
}

function createStudentKey(name) {
  return (name || 'student').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function getChemCredits(progressItems, resourceCount = 0) {
  return progressItems.reduce((total, entry) => {
    const started = entry.status === 'In progress' ? 12 : 0
    const done = entry.status === 'Done' ? 35 : 0
    const reviewed = entry.reviewed ? 18 : 0
    const feedback = entry.feedback ? 8 : 0
    const criteria = (entry.criteriaChecks || []).filter(Boolean).length * 3
    const help = entry.helpRequested ? 5 : 0
    return total + started + done + reviewed + feedback + criteria + help
  }, resourceCount * 4)
}

function getLabRhythm(progressItems) {
  const activeDates = new Set(progressItems
    .map(entry => entry.updatedAt || entry.helpRequestedAt || entry.reviewedAt)
    .filter(Boolean)
    .map(date => new Date(date).toDateString()))
  return activeDates.size
}

export default function Home({ currentUser, navigate, onUserStatsChange }) {
  const isTeacher = currentUser?.role === 'teacher'
  const isAdmin = currentUser?.role === 'admin'
  const isStudent = currentUser?.role === 'student'
  const [classes] = useLocalStorage('sep-chem-classes', [])
  const [enrollments, setEnrollments] = useLocalStorage('sep-chem-enrollments', [])
  const [assignmentProgress, setAssignmentProgress] = useLocalStorage('sep-chem-assignment-progress', [])
  const [activeClassByStudent, setActiveClassByStudent] = useLocalStorage('sep-chem-active-class', {})
  const [joinCode, setJoinCode] = useState('')
  const [joinMessage, setJoinMessage] = useState('')
  const currentStudentKey = createStudentKey(currentUser?.name)
  const studentEnrollments = enrollments.filter(enrollment => (
    enrollment.studentId === currentUser?.id || enrollment.studentKey === currentStudentKey
  ))
  const activeStudentClassCode = activeClassByStudent[currentUser?.id] || activeClassByStudent[currentStudentKey]
  const currentEnrollment = studentEnrollments.find(enrollment => enrollment.classCode === activeStudentClassCode) || studentEnrollments[0]
  const activeClassCode = activeStudentClassCode || currentUser?.classCode || currentEnrollment?.classCode
  const joinedClass = classes.find(classroom => classroom.classCode === activeClassCode)
  const studentClasses = studentEnrollments
    .map(enrollment => ({
      enrollment,
      classroom: classes.find(classroom => classroom.classCode === enrollment.classCode),
    }))
    .filter(item => item.classroom)
  const studentProgress = assignmentProgress.filter(entry => entry.studentId === currentUser?.id)
  const displayName = currentUser?.name || 'Sepehr'
  const roleLabel = isTeacher ? 'Teacher' : isAdmin ? 'Admin' : 'Student'
  const studentAssignments = joinedClass?.assignments || []
  const classResourceCount = joinedClass?.resources?.length || 0
  const studentAssignmentSummaries = studentAssignments.map(assignment => {
    const progress = getAssignmentProgress(assignment.id)
    const dueStatus = getDueStatus(assignment.dueDate, progress.status)
    return { assignment, progress, dueStatus }
  })
  const dueFocus = studentAssignmentSummaries.filter(item => (
    item.progress.status !== 'Done' && ['overdue', 'urgent', 'soon'].includes(item.dueStatus.tone)
  ))
  const feedbackFocus = studentAssignmentSummaries.filter(item => (
    item.progress.feedback || item.progress.reviewed || (item.progress.score !== undefined && item.progress.score !== '')
  ))
  const helpFocus = studentAssignmentSummaries.filter(item => item.progress.helpRequested && !item.progress.helpResolved)
  const completedFocusCount = studentAssignmentSummaries.filter(item => item.progress.status === 'Done').length
  const inProgressFocusCount = studentAssignmentSummaries.filter(item => item.progress.status === 'In progress').length
  const notStartedFocusCount = studentAssignmentSummaries.filter(item => !item.progress.status || item.progress.status === 'Not started').length
  const reviewedFocusCount = studentAssignmentSummaries.filter(item => item.progress.reviewed).length
  const dashboardCompletion = studentAssignments.length
    ? Math.round((completedFocusCount / studentAssignments.length) * 100)
    : 0
  const chemCredits = getChemCredits(studentProgress, classResourceCount)
  const labRhythm = getLabRhythm(studentProgress)
  const dailyCreditTarget = 90
  const dailyCreditProgress = Math.min(100, Math.round((chemCredits / dailyCreditTarget) * 100))
  const priorityAssignments = [...studentAssignmentSummaries]
    .sort((first, second) => getPriorityRank(first) - getPriorityRank(second))
    .slice(0, 3)
  const dashboardCards = isAdmin ? [
    {
      title: 'Platform courses',
      value: '3 active',
      detail: 'Admin-only catalogue management for IGCSE, AS, and A2 Chemistry.',
    },
    {
      title: 'Role boundaries',
      value: 'Clear',
      detail: 'Teachers manage classrooms; students learn; admins manage courses.',
    },
    {
      title: 'Next action',
      value: 'Review',
      detail: 'Open course admin to plan syllabus and resource controls.',
    },
  ] : isTeacher ? [
    {
      title: 'Class overview',
      value: '3 courses',
      detail: 'IGCSE, AS, and A2 pathways ready for planning.',
    },
    {
      title: 'Teaching focus',
      value: 'Practicals',
      detail: 'Use checklists, tools, and sample topic routines in class.',
    },
    {
      title: 'Next action',
      value: 'Teach',
      detail: 'Create classrooms, assign resources, and review learner progress.',
    },
  ] : [
    {
      title: 'Current course',
      value: currentUser?.course || 'IGCSE Chemistry CIE',
      detail: 'Continue from your active chemistry pathway.',
    },
    {
      title: 'Chem credits',
      value: `${chemCredits} CC`,
      detail: 'Earn credits from class work, feedback, criteria checks, and resources.',
    },
    {
      title: 'Next action',
      value: 'Practice',
      detail: 'Open a topic, answer questions, then review errors.',
    },
  ]

  const courses = [
    {
      id: 'igcse',
      title: 'IGCSE Chemistry CIE',
      subtitle: 'Cambridge IGCSE · Core and Extended',
      icon: Beaker,
      className: 'amber',
      questions: '0 / 720',
      score: 'New',
      flashcards: '0 / 540',
      confidence: '0%',
      action: () => navigate('igcse'),
    },
    {
      id: 'as',
      title: 'AS Chemistry',
      subtitle: 'International A-Level · CIE',
      icon: FlaskConical,
      className: 'mint',
      questions: '34 / 920',
      score: '82%',
      flashcards: '18 / 420',
      confidence: '35%',
      action: () => navigate('as'),
    },
    {
      id: 'a2',
      title: 'A2 Chemistry',
      subtitle: 'International A-Level · CIE',
      icon: Atom,
      className: 'blue',
      questions: '6 / 840',
      score: '64%',
      flashcards: '0 / 390',
      confidence: '0%',
      action: () => navigate('a2'),
    },
  ]

  const tools = [
    {
      title: 'Mole and mass calculators',
      description: 'Fast checks for moles, formula mass, concentration, and solution work.',
      icon: Beaker,
      className: 'amber',
      action: () => navigate('tools'),
    },
    {
      title: 'Interactive chemistry tools',
      description: 'Use guided calculators and visual supports while practising topic questions.',
      icon: FlaskConical,
      className: 'mint',
      action: () => navigate('tools'),
    },
  ]

  const examPractice = [
    {
      title: 'Exam practice',
      description: 'Build structured answers with mark-scheme language and feedback prompts.',
      icon: BookOpen,
      className: 'violet',
      action: () => navigate('exam'),
    },
    {
      title: 'Past papers',
      description: 'Organise paper practice by topic, command word, and confidence level.',
      icon: ScrollText,
      className: 'blue',
      action: () => navigate('exam'),
    },
  ]

  const practicals = [
    {
      title: 'Required practicals',
      description: 'Plan methods, variables, risk assessment, data tables, and evaluation points.',
      icon: Microscope,
      className: 'mint',
      action: () => navigate('practicals'),
    },
    {
      title: 'Practical skills checklist',
      description: 'Track apparatus, uncertainty, graphing, errors, and conclusion writing.',
      icon: ClipboardCheck,
      className: 'amber',
      action: () => navigate('practicals'),
    },
  ]

  const independentStudyCards = [
    {
      label: 'Course content',
      title: 'IGCSE Chemistry CIE',
      detail: 'Use the structured syllabus resources when you want to revise independently.',
      action: () => navigate('igcse'),
    },
    {
      label: 'Exam readiness',
      title: 'Exam Practice and Past Papers',
      detail: 'Practise questions, past-paper routines, and mark-scheme style answers.',
      action: () => navigate('exam'),
    },
    {
      label: 'Problem solving',
      title: 'Chemistry Tools',
      detail: 'Use calculators and guided tools for moles, concentration, and formula work.',
      action: () => navigate('tools'),
    },
    {
      label: 'Skills',
      title: 'Practicals',
      detail: 'Review methods, variables, uncertainty, graphing, and evaluation skills.',
      action: () => navigate('practicals'),
    },
  ]

  useEffect(() => {
    if (!isStudent) return
    onUserStatsChange?.({ chemCredits, labRhythm })
  }, [chemCredits, isStudent, labRhythm, onUserStatsChange])

  function getAssignmentStatus(assignmentId) {
    return studentProgress.find(entry => entry.assignmentId === assignmentId)?.status || 'Not started'
  }

  function getAssignmentProgress(assignmentId) {
    return studentProgress.find(entry => entry.assignmentId === assignmentId) || {}
  }

  function updateAssignmentProgress(assignmentId, updates) {
    const existingEntry = assignmentProgress.find(entry => (
      entry.assignmentId === assignmentId && entry.studentId === currentUser?.id
    ))

    const nextEntry = {
      ...existingEntry,
      assignmentId,
      classCode: joinedClass?.classCode,
      studentId: currentUser?.id,
      studentName: currentUser?.name || 'Student',
      status: existingEntry?.status || 'Not started',
      response: existingEntry?.response || '',
      criteriaChecks: existingEntry?.criteriaChecks || [],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    const exists = assignmentProgress.some(entry => (
      entry.assignmentId === assignmentId && entry.studentId === currentUser?.id
    ))

    setAssignmentProgress(exists
      ? assignmentProgress.map(entry => (
        entry.assignmentId === assignmentId && entry.studentId === currentUser?.id ? nextEntry : entry
      ))
      : [nextEntry, ...assignmentProgress]
    )
  }

  function updateAssignmentStatus(assignmentId, status) {
    updateAssignmentProgress(assignmentId, { status })
  }

  function toggleCriterion(assignmentId, criterionIndex) {
    const currentProgress = getAssignmentProgress(assignmentId)
    const currentChecks = currentProgress.criteriaChecks || []
    const nextChecks = [...currentChecks]
    nextChecks[criterionIndex] = !nextChecks[criterionIndex]
    updateAssignmentProgress(assignmentId, { criteriaChecks: nextChecks })
  }

  function toggleHelpRequest(assignmentId) {
    const currentProgress = getAssignmentProgress(assignmentId)
    const isRequested = currentProgress.helpRequested && !currentProgress.helpResolved
    updateAssignmentProgress(assignmentId, {
      helpRequested: !isRequested,
      helpResolved: false,
      helpRequestedAt: !isRequested ? new Date().toISOString() : currentProgress.helpRequestedAt,
    })
  }

  function handleJoinClass(event) {
    event.preventDefault()
    const normalizedCode = joinCode.trim().toUpperCase()
    const matchedClass = classes.find(classroom => classroom.classCode === normalizedCode)

    if (!matchedClass) {
      setJoinMessage('No class found with that code yet.')
      return
    }

    const nextEnrollment = {
      classId: matchedClass.id,
      classCode: matchedClass.classCode,
      studentId: currentUser?.id,
      studentKey: currentStudentKey,
      studentName: currentUser?.name || 'Student',
      course: currentUser?.course || matchedClass.course,
      joinedAt: new Date().toISOString(),
    }
    const alreadyEnrolled = enrollments.some(enrollment => (
      enrollment.classCode === matchedClass.classCode
      && (enrollment.studentId === currentUser?.id || enrollment.studentKey === currentStudentKey)
    ))

    setEnrollments(alreadyEnrolled
      ? enrollments.map(enrollment => (
        enrollment.classCode === matchedClass.classCode
        && (enrollment.studentId === currentUser?.id || enrollment.studentKey === currentStudentKey)
          ? { ...enrollment, ...nextEnrollment }
          : enrollment
      ))
      : [nextEnrollment, ...enrollments]
    )
    setActiveClassByStudent({
      ...activeClassByStudent,
      [currentUser?.id]: matchedClass.classCode,
      [currentStudentKey]: matchedClass.classCode,
    })
    setJoinCode('')
    setJoinMessage(`Joined ${matchedClass.name}.`)
  }

  function switchActiveClass(classCode) {
    setActiveClassByStudent({
      ...activeClassByStudent,
      [currentUser?.id]: classCode,
      [currentStudentKey]: classCode,
    })
  }

  return (
    <div className="page dashboard-page">
      <section className="cognito-hero">
        <div className="welcome-panel">
          <div className="mascot-orbit" aria-hidden="true">
            <div className="mascot-flask">
              <FlaskConical size={54} />
              <Leaf size={28} />
            </div>
          </div>
          <div>
            <h1>Hi {displayName}</h1>
            <span className="role-pill">{roleLabel}</span>
          </div>
        </div>

        <aside className="daily-goal-card">
          <div className="goal-heading">
            <h2><Atom size={21} /> Chem Credit Lab</h2>
            <button className="icon-button" type="button" aria-label="Adjust daily goal">
              <SlidersHorizontal size={23} />
            </button>
          </div>
          <div className="goal-divider" />
          <div className="goal-score">
            <strong>{chemCredits} CC</strong>
            <span>{chemCredits} / {dailyCreditTarget}</span>
          </div>
          <div className="goal-track" aria-label={`Chem credits: ${chemCredits} out of ${dailyCreditTarget}`}>
            <span style={{ width: `${dailyCreditProgress}%` }} />
          </div>
          <div className="week-streak">
            <div className="week-days" aria-label="Weekly activity">
              {['Plan', 'Try', 'Check', 'Fix'].map((step, index) => (
                <span className={index < Math.min(labRhythm, 4) ? 'active' : ''} key={step}>{step.slice(0, 1)}</span>
              ))}
            </div>
            <strong><FlaskConical size={31} /> Lab rhythm {labRhythm}</strong>
          </div>
        </aside>
      </section>

      <section className="account-dashboard">
        {dashboardCards.map(card => (
          <article className="account-card" key={card.title}>
            <span>{card.title}</span>
            <strong>{card.value}</strong>
            <p>{card.detail}</p>
          </article>
        ))}
      </section>

      {isStudent && (
        <section className="section panel student-work-panel">
          <div className="section-header compact">
            <div>
              <p className="eyebrow">Classes</p>
              <h2>{joinedClass ? joinedClass.name : 'No class joined'}</h2>
              <p>
                {joinedClass
                  ? `Class code ${joinedClass.classCode} • ${joinedClass.course}${currentEnrollment ? ' • joined' : ''}`
                  : 'Join a class with a code from your teacher, or wait for your teacher to add you by name.'}
              </p>
            </div>
          </div>
          {studentClasses.length > 0 && (
            <div className="student-class-switcher">
              <div className="student-class-switcher-head">
                <div>
                  <p className="eyebrow">My Classes</p>
                  <h3>Choose active class</h3>
                </div>
                <span>{studentClasses.length} joined</span>
              </div>
              <div className="student-class-list">
                {studentClasses.map(({ classroom, enrollment }) => (
                  <button
                    className={`student-class-chip ${joinedClass?.classCode === classroom.classCode ? 'active' : ''}`}
                    key={`${classroom.classCode}-${enrollment.studentKey || enrollment.studentId}`}
                    type="button"
                    onClick={() => switchActiveClass(classroom.classCode)}
                  >
                    <strong>{classroom.name}</strong>
                    <small>{classroom.course} • {classroom.classCode}</small>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="join-class-panel">
            <div>
              <p className="eyebrow">Join Class</p>
              <h3>{joinedClass ? 'Join another class' : 'Enter your class code'}</h3>
              <p>Use a code from your teacher. You can switch between joined classes from this dashboard.</p>
            </div>
            <form className="join-class-form" onSubmit={handleJoinClass}>
              <label className="field">
                <span>Class code</span>
                <input
                  value={joinCode}
                  onChange={event => setJoinCode(event.target.value.toUpperCase())}
                  placeholder="M5CH123"
                />
              </label>
              <button className="btn primary" type="submit">Join class</button>
              {joinMessage && <small className="join-class-message">{joinMessage}</small>}
            </form>
          </div>
          {joinedClass && (
            <>
              <div className="student-class-overview">
                <div className="student-progress-card">
                  <p className="eyebrow">Class Progress</p>
                  <strong>{dashboardCompletion}%</strong>
                  <div className="student-focus-meter" aria-label={`${dashboardCompletion}% complete`}>
                    <span style={{ width: `${dashboardCompletion}%` }} />
                  </div>
                  <small>{completedFocusCount} / {studentAssignments.length} assignments done</small>
                </div>
                <div className="student-stat-grid">
                  <span><strong>{notStartedFocusCount}</strong> not started</span>
                  <span><strong>{inProgressFocusCount}</strong> in progress</span>
                  <span><strong>{dueFocus.length}</strong> due soon</span>
                  <span><strong>{reviewedFocusCount}</strong> reviewed</span>
                  <span><strong>{joinedClass.resources?.length || 0}</strong> resources</span>
                  <span><strong>{helpFocus.length}</strong> help requests</span>
                </div>
              </div>

              <div className="student-focus-panel">
                <div className="student-focus-main">
                  <p className="eyebrow">Today's Focus</p>
                  <h3>{dueFocus[0]?.assignment.title || helpFocus[0]?.assignment.title || feedbackFocus[0]?.assignment.title || 'Keep your chemistry momentum going'}</h3>
                  <p>
                    {dueFocus.length > 0
                      ? `${dueFocus.length} assignment${dueFocus.length === 1 ? '' : 's'} need attention soon.`
                      : helpFocus.length > 0
                        ? `${helpFocus.length} help request${helpFocus.length === 1 ? '' : 's'} sent to Mr. Sep.`
                        : feedbackFocus.length > 0
                          ? `${feedbackFocus.length} reviewed item${feedbackFocus.length === 1 ? '' : 's'} ready to revisit.`
                          : studentAssignments.length > 0
                            ? 'No urgent work right now. Choose a course task or improve a previous response.'
                            : 'Your teacher has not assigned class work yet.'}
                  </p>
                  <div className="student-focus-item">
                    <Megaphone size={18} />
                    <div>
                      <strong>{joinedClass.announcements?.[0]?.title || 'No new announcement'}</strong>
                      <small>{joinedClass.announcements?.[0]?.message || 'Class updates from Mr. Sep will appear here.'}</small>
                    </div>
                  </div>
                </div>
                <div className="student-priority-list">
                  <div className="student-priority-heading">
                    <strong>Next up</strong>
                    <span>{priorityAssignments.length} item{priorityAssignments.length === 1 ? '' : 's'}</span>
                  </div>
                  {priorityAssignments.length === 0 && <p>No assignments yet.</p>}
                  {priorityAssignments.map(({ assignment, progress, dueStatus }) => (
                    <div className={`student-priority-row ${dueStatus.tone}`} key={assignment.id}>
                      <div>
                        <strong>{assignment.title}</strong>
                        <small>{progress.helpRequested && !progress.helpResolved ? 'Help requested' : progress.feedback ? 'Feedback ready' : dueStatus.label}</small>
                      </div>
                      <b className={`due-badge ${dueStatus.tone}`}>{progress.status || 'Not started'}</b>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          {joinedClass?.resources?.length > 0 && (
            <div className="student-resource-panel">
              <div className="student-resource-heading">
                <div>
                  <p className="eyebrow">Class Resources</p>
                  <h3>Shared by your teacher</h3>
                </div>
                <span>{joinedClass.resources.length} item{joinedClass.resources.length === 1 ? '' : 's'}</span>
              </div>
              <div className="student-resource-grid">
                {joinedClass.resources.map(resource => (
                  <article className="student-resource-card" key={resource.id}>
                    <Paperclip size={18} />
                    <div>
                      <strong>{resource.title}</strong>
                      <small>{resource.type}</small>
                      {resource.note && <p>{resource.note}</p>}
                      {resource.url && (
                        <a href={resource.url} target="_blank" rel="noreferrer">
                          Open resource
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
          {joinedClass?.announcements?.length > 0 && (
            <div className="student-announcement-strip">
              <div className="student-announcement-heading">
                <Megaphone size={20} />
                <strong>Class announcements</strong>
              </div>
              <div className="announcement-list compact">
                {joinedClass.announcements.slice(0, 3).map(announcement => (
                  <article className="announcement-card" key={announcement.id}>
                    <div className="announcement-icon"><Megaphone size={18} /></div>
                    <div>
                      <h3>{announcement.title}</h3>
                      <p>{announcement.message}</p>
                      <small>{announcement.author} • {new Date(announcement.createdAt).toLocaleString()}</small>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
          {joinedClass && (
            <>
              <div className="student-assignment-heading">
                <div>
                  <p className="eyebrow">Assignment Workspace</p>
                  <h3>Update your work</h3>
                </div>
                {studentAssignments.length > 0 && <span>{studentAssignments.length} total</span>}
              </div>
              <div className="student-assignment-grid">
                {studentAssignmentSummaries.length > 0 ? studentAssignmentSummaries.map(({ assignment, progress, dueStatus }) => {
                return (
                  <article className={`student-assignment-card ${dueStatus.tone}`} key={assignment.id}>
                    <div className="assignment-card-topline">
                      <span>{assignment.type}</span>
                      <b className={`due-badge ${dueStatus.tone}`}>{dueStatus.label}</b>
                    </div>
                    <h3>{assignment.title}</h3>
                    <p>{assignment.instructions || assignment.course}</p>
                    {assignment.materials?.length > 0 && (
                      <div className="material-list">
                        <strong>Materials</strong>
                        {assignment.materials.map(material => (
                          <div className="material-card" key={material.id}>
                            <Paperclip size={16} />
                            <div>
                              {material.url ? (
                                <a href={material.url} target="_blank" rel="noreferrer">{material.title}</a>
                              ) : (
                                <span>{material.title}</span>
                              )}
                              {material.note && <small>{material.note}</small>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {progress.feedback && (
                      <div className="teacher-feedback-note">
                        <strong>Teacher feedback</strong>
                        <p>{progress.feedback}</p>
                      </div>
                    )}
                    {(progress.reviewed || (progress.score !== undefined && progress.score !== '')) && (
                      <div className="review-summary">
                        <div>
                          <strong>{progress.reviewed ? 'Reviewed by teacher' : 'Teacher score'}</strong>
                          {progress.reviewedAt && <small>{new Date(progress.reviewedAt).toLocaleDateString()}</small>}
                        </div>
                        {progress.score !== undefined && progress.score !== '' && <b>{progress.score}/100</b>}
                      </div>
                    )}
                    <label className="student-response-box">
                      <span>Response or reflection</span>
                      <textarea
                        value={progress.response || ''}
                        onChange={event => updateAssignmentProgress(assignment.id, { response: event.target.value })}
                        placeholder="Add your answer, notes, or reflection for Mr. Sep."
                      />
                    </label>
                    <div className={`help-request-box ${progress.helpRequested && !progress.helpResolved ? 'active' : ''}`}>
                      <div className="help-request-heading">
                        <CircleHelp size={18} />
                        <strong>{progress.helpRequested && !progress.helpResolved ? 'Help requested' : 'Need help?'}</strong>
                      </div>
                      <textarea
                        value={progress.helpNote || ''}
                        onChange={event => updateAssignmentProgress(assignment.id, {
                          helpNote: event.target.value,
                          helpResolved: false,
                        })}
                        placeholder="Tell Mr. Sep where you are stuck."
                      />
                      <button
                        className="mini-action"
                        type="button"
                        onClick={() => toggleHelpRequest(assignment.id)}
                      >
                        {progress.helpRequested && !progress.helpResolved ? 'Cancel request' : 'Ask for help'}
                      </button>
                    </div>
                    {assignment.successCriteria?.length > 0 && (
                      <div className="success-criteria-box">
                        <strong>Success criteria</strong>
                        {assignment.successCriteria.map((criterion, index) => (
                          <label className="criterion-check" key={`${assignment.id}-${criterion}`}>
                            <input
                              type="checkbox"
                              checked={Boolean(progress.criteriaChecks?.[index])}
                              onChange={() => toggleCriterion(assignment.id, index)}
                            />
                            <span>{criterion}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    <div className="assignment-status-control" aria-label={`Status for ${assignment.title}`}>
                      {['Not started', 'In progress', 'Done'].map(status => (
                        <button
                          className={getAssignmentStatus(assignment.id) === status ? 'active' : ''}
                          key={status}
                          type="button"
                          onClick={() => updateAssignmentStatus(assignment.id, status)}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </article>
                )
                }) : (
                  <article className="student-assignment-card empty">
                    <span>Classroom</span>
                    <h3>No assigned work yet</h3>
                    <p>Your teacher has not assigned anything yet.</p>
                  </article>
                )}
              </div>
            </>
          )}
        </section>
      )}

      <section className="courses-section">
        <div className="courses-header">
          <h2><CircleHelp size={22} /> Courses</h2>
          {isAdmin && (
            <button className="manage-button" type="button" onClick={() => navigate('admin')}>
              Manage courses
            </button>
          )}
        </div>

        <div className="course-table">
          <div className="course-table-head">
            <span>Course</span>
            <span><CircleHelp size={18} /> Questions / Avg score</span>
            <span><CircleHelp size={18} /> Flashcards / Confidence</span>
            <span aria-hidden="true" />
          </div>

          {courses.map(course => {
            const Icon = course.icon
            return (
              <button className="course-row" key={course.id} type="button" onClick={course.action}>
                <span className="course-subject">
                  <span className={`course-icon ${course.className}`}><Icon size={30} /></span>
                  <span>
                    <strong>{course.title}</strong>
                    <small>{course.subtitle}</small>
                  </span>
                </span>
                <span className="course-metric">
                  <span>{course.questions}</span>
                  <b>{course.score}</b>
                </span>
                <span className="course-metric">
                  <span>{course.flashcards}</span>
                  <b>{course.confidence}</b>
                </span>
                <ChevronRight className="course-arrow" size={24} />
              </button>
            )
          })}
        </div>
      </section>

      <section className="support-sections">
        <ResourceSection
          title="Tools"
          icon={Beaker}
          items={tools}
        />
        <ResourceSection
          title="Exam Practice and Past Papers"
          icon={ScrollText}
          items={examPractice}
        />
        <ResourceSection
          title="Practicals"
          icon={Microscope}
          items={practicals}
        />
      </section>

      <section className="section topic-strip">
        <div className="section-header">
          <div>
            <p className="eyebrow">Independent study</p>
            <h2>Choose what to work on next</h2>
          </div>
        </div>
        <div className="topic-pill-grid">
          {independentStudyCards.map(card => (
            <button className="topic-pill-card" key={card.title} onClick={card.action}>
              <span>{card.label}</span>
              <strong>{card.title}</strong>
              <small>{card.detail}</small>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

function ResourceSection({ title, icon: Icon, items }) {
  return (
    <section className="resource-section">
      <div className="resource-section-header">
        <h2><Icon size={22} /> {title}</h2>
      </div>
      <div className="resource-card-grid">
        {items.map(item => {
          const ItemIcon = item.icon
          return (
            <button className="resource-card" key={item.title} type="button" onClick={item.action}>
              <span className={`course-icon ${item.className}`}><ItemIcon size={28} /></span>
              <span>
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </span>
              <ChevronRight className="resource-arrow" size={22} />
            </button>
          )
        })}
      </div>
    </section>
  )
}
