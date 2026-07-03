import {
  BookOpen,
  CalendarClock,
  ClipboardList,
  FlaskConical,
  Layers3,
  Megaphone,
  Paperclip,
  Plus,
  UsersRound,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { allTopics } from '../data/topics.js'
import { useLocalStorage } from '../utils/useLocalStorage.js'

const starterActivities = [
  { id: 'starter-template', title: 'Starter Activity Template', type: 'Prior knowledge check', course: 'Teaching Routine' },
  { id: 'vocabulary-routine', title: 'Vocabulary Routine', type: 'ELL support', course: 'Teaching Routine' },
  { id: 'command-word-frame', title: 'Exam Command Word Frame', type: 'Assessment support', course: 'Exam Practice' },
  { id: 'practical-checklist', title: 'Practical Skills Checklist', type: 'Lab preparation', course: 'Practicals' },
]

const courseOptions = ['IGCSE Chemistry CIE', 'AS Chemistry', 'A2 Chemistry']

function createClassCode(name) {
  const seed = name.replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase() || 'CHEM'
  return `${seed}${Math.floor(100 + Math.random() * 900)}`
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

function createStudentKey(name) {
  return (name || 'student').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function getDueStatus(dueDate) {
  if (!dueDate) return { label: 'No due date', tone: 'muted' }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(`${dueDate}T00:00:00`)
  const diffDays = Math.ceil((due - today) / 86400000)

  if (diffDays < 0) return { label: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`, tone: 'overdue' }
  if (diffDays === 0) return { label: 'Due today', tone: 'urgent' }
  if (diffDays <= 3) return { label: `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`, tone: 'soon' }
  return { label: `Due ${dueDate}`, tone: 'muted' }
}

export default function TeacherResources({ currentUser, navigate }) {
  const [classes, setClasses] = useLocalStorage('sep-chem-classes', [])
  const [enrollments, setEnrollments] = useLocalStorage('sep-chem-enrollments', [])
  const [assignmentProgress, setAssignmentProgress] = useLocalStorage('sep-chem-assignment-progress', [])
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '')
  const [classForm, setClassForm] = useState({ name: '', course: 'IGCSE Chemistry CIE' })
  const [assignmentForm, setAssignmentForm] = useState({
    sourceId: 'igcse-atomic-structure',
    dueDate: '',
    instructions: '',
    criteriaText: '',
    materialTitle: '',
    materialUrl: '',
    materialNote: '',
  })
  const [moduleForm, setModuleForm] = useState({
    title: '',
    lessonTitle: '',
    lessonsText: '',
    status: 'Draft',
    description: '',
  })
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
  })
  const [resourceForm, setResourceForm] = useState({
    title: '',
    url: '',
    type: 'External resource',
    note: '',
  })
  const [studentForm, setStudentForm] = useState({
    name: '',
    course: 'IGCSE Chemistry CIE',
  })

  const assignableItems = useMemo(() => [
    ...allTopics.map(topic => ({
      id: topic.id,
      title: topic.title,
      type: `${topic.level} topic`,
      course: topic.level === 'IGCSE' ? 'IGCSE Chemistry CIE' : `${topic.level} Chemistry`,
    })),
    ...starterActivities,
  ], [])

  const teacherClasses = classes.filter(classroom => (
    classroom.createdById === currentUser?.id || (!classroom.createdById && classroom.createdBy === currentUser?.name)
  ))
  const selectedClass = teacherClasses.find(classroom => classroom.id === selectedClassId) || teacherClasses[0]
  const selectedClassEnrollments = enrollments.filter(enrollment => enrollment.classCode === selectedClass?.classCode)
  const selectedClassProgress = assignmentProgress.filter(entry => entry.classCode === selectedClass?.classCode)
  const completedCount = selectedClassProgress.filter(entry => entry.status === 'Done').length
  const inProgressCount = selectedClassProgress.filter(entry => entry.status === 'In progress').length
  const reviewedCount = selectedClassProgress.filter(entry => entry.reviewed).length
  const needsReviewCount = selectedClassProgress.filter(entry => entry.status === 'Done' && !entry.reviewed).length
  const openHelpCount = selectedClassProgress.filter(entry => entry.helpRequested && !entry.helpResolved).length
  const scoredEntries = selectedClassProgress.filter(entry => entry.score !== undefined && entry.score !== '' && !Number.isNaN(Number(entry.score)))
  const averageScore = scoredEntries.length
    ? Math.round(scoredEntries.reduce((total, entry) => total + Number(entry.score), 0) / scoredEntries.length)
    : null
  const overdueCount = selectedClass?.assignments?.filter(assignment => getDueStatus(assignment.dueDate).tone === 'overdue').length || 0
  const dueSoonCount = selectedClass?.assignments?.filter(assignment => ['urgent', 'soon'].includes(getDueStatus(assignment.dueDate).tone)).length || 0
  const assignmentAnalytics = selectedClass?.assignments?.map(assignment => {
    const updates = selectedClassProgress.filter(entry => entry.assignmentId === assignment.id)
    const done = updates.filter(entry => entry.status === 'Done').length
    const reviewed = updates.filter(entry => entry.reviewed).length
    const scored = updates.filter(entry => entry.score !== undefined && entry.score !== '' && !Number.isNaN(Number(entry.score)))
    return {
      ...assignment,
      done,
      reviewed,
      totalUpdates: updates.length,
      averageScore: scored.length
        ? Math.round(scored.reduce((total, entry) => total + Number(entry.score), 0) / scored.length)
        : null,
    }
  }) || []
  const studentAnalytics = selectedClassEnrollments.map(enrollment => {
    const updates = selectedClassProgress.filter(entry => entry.studentId === enrollment.studentId)
    const done = updates.filter(entry => entry.status === 'Done').length
    const reviewed = updates.filter(entry => entry.reviewed).length
    const scored = updates.filter(entry => entry.score !== undefined && entry.score !== '' && !Number.isNaN(Number(entry.score)))
    return {
      ...enrollment,
      done,
      reviewed,
      totalUpdates: updates.length,
      needsReview: updates.filter(entry => entry.status === 'Done' && !entry.reviewed).length,
      completionRate: selectedClass?.assignments?.length
        ? Math.round((done / selectedClass.assignments.length) * 100)
        : 0,
      averageScore: scored.length
        ? Math.round(scored.reduce((total, entry) => total + Number(entry.score), 0) / scored.length)
        : null,
    }
  })
  const studentsNeedingNudge = studentAnalytics
    .filter(student => selectedClass?.assignments?.length > 0 && student.totalUpdates < selectedClass.assignments.length)
    .slice(0, 5)
  const reviewQueue = selectedClassProgress
    .filter(entry => entry.status === 'Done' && !entry.reviewed)
    .map(entry => ({
      ...entry,
      assignmentTitle: selectedClass?.assignments?.find(assignment => assignment.id === entry.assignmentId)?.title || 'Assignment',
    }))
    .slice(0, 5)
  const helpQueue = selectedClassProgress
    .filter(entry => entry.helpRequested && !entry.helpResolved)
    .map(entry => ({
      ...entry,
      assignmentTitle: selectedClass?.assignments?.find(assignment => assignment.id === entry.assignmentId)?.title || 'Assignment',
    }))
    .slice(0, 5)
  const strongStudents = studentAnalytics
    .filter(student => student.completionRate >= 80 && (student.averageScore === null || student.averageScore >= 80))
    .slice(0, 5)

  function updateClass(classId, updater) {
    setClasses(classes.map(classroom => (
      classroom.id === classId ? updater(classroom) : classroom
    )))
  }

  function handleCreateClass(event) {
    event.preventDefault()
    const name = classForm.name.trim()
    if (!name) return

    const classroom = {
      id: createId('class'),
      name,
      course: classForm.course,
      classCode: createClassCode(name),
      createdBy: currentUser?.name || 'Mr. Sep',
      createdById: currentUser?.id,
      assignments: [],
      modules: [],
      announcements: [],
      resources: [],
    }

    setClasses([classroom, ...classes])
    setSelectedClassId(classroom.id)
    setClassForm({ name: '', course: 'IGCSE Chemistry CIE' })
  }

  function handleCreateAssignment(event) {
    event.preventDefault()
    if (!selectedClass) return
    const source = assignableItems.find(item => item.id === assignmentForm.sourceId) || assignableItems[0]

    updateClass(selectedClass.id, classroom => ({
      ...classroom,
      assignments: [
        {
          id: createId('assignment'),
          title: source.title,
          type: source.type,
          course: source.course,
          sourceId: source.id,
          dueDate: assignmentForm.dueDate,
          instructions: assignmentForm.instructions.trim(),
          successCriteria: assignmentForm.criteriaText
            .split('\n')
            .map(item => item.trim())
            .filter(Boolean),
          materials: assignmentForm.materialTitle.trim() || assignmentForm.materialUrl.trim() || assignmentForm.materialNote.trim()
            ? [{
              id: createId('material'),
              title: assignmentForm.materialTitle.trim() || 'Assignment material',
              url: assignmentForm.materialUrl.trim(),
              note: assignmentForm.materialNote.trim(),
            }]
            : [],
          createdAt: new Date().toISOString(),
        },
        ...classroom.assignments,
      ],
    }))
    setAssignmentForm({
      sourceId: assignmentForm.sourceId,
      dueDate: '',
      instructions: '',
      criteriaText: '',
      materialTitle: '',
      materialUrl: '',
      materialNote: '',
    })
  }

  function handleAddResource(event) {
    event.preventDefault()
    if (!selectedClass || !resourceForm.title.trim()) return

    updateClass(selectedClass.id, classroom => ({
      ...classroom,
      resources: [
        {
          id: createId('resource'),
          title: resourceForm.title.trim(),
          url: resourceForm.url.trim(),
          type: resourceForm.type,
          note: resourceForm.note.trim(),
          addedAt: new Date().toISOString(),
        },
        ...(classroom.resources || []),
      ],
    }))
    setResourceForm({ title: '', url: '', type: 'External resource', note: '' })
  }

  function handleAddStudent(event) {
    event.preventDefault()
    if (!selectedClass || !studentForm.name.trim()) return
    const studentName = studentForm.name.trim()
    const studentKey = createStudentKey(studentName)
    const nextEnrollment = {
      classId: selectedClass.id,
      classCode: selectedClass.classCode,
      studentId: `student-${studentKey}`,
      studentKey,
      studentName,
      course: studentForm.course,
      joinedAt: new Date().toISOString(),
      addedByTeacher: true,
    }
    const alreadyEnrolled = enrollments.some(enrollment => (
      enrollment.classCode === selectedClass.classCode && enrollment.studentKey === studentKey
    ))

    setEnrollments(alreadyEnrolled
      ? enrollments.map(enrollment => (
        enrollment.classCode === selectedClass.classCode && enrollment.studentKey === studentKey
          ? { ...enrollment, ...nextEnrollment }
          : enrollment
      ))
      : [nextEnrollment, ...enrollments]
    )
    setStudentForm({ name: '', course: selectedClass.course })
  }

  function handleCreateModule(event) {
    event.preventDefault()
    if (!selectedClass || !moduleForm.title.trim() || !moduleForm.lessonTitle.trim()) return
    const additionalLessons = moduleForm.lessonsText
      .split('\n')
      .map(item => item.trim())
      .filter(Boolean)
    const lessons = [moduleForm.lessonTitle.trim(), ...additionalLessons].map((title, index) => ({
      id: createId('lesson'),
      title,
      status: index === 0 ? moduleForm.status : 'Draft',
    }))

    updateClass(selectedClass.id, classroom => ({
      ...classroom,
      modules: [
        {
          id: createId('module'),
          title: moduleForm.title.trim(),
          description: moduleForm.description.trim(),
          lessons,
          createdAt: new Date().toISOString(),
        },
        ...classroom.modules,
      ],
    }))
    setModuleForm({ title: '', lessonTitle: '', lessonsText: '', status: 'Draft', description: '' })
  }

  function assignModuleLesson(module, lesson) {
    if (!selectedClass) return

    updateClass(selectedClass.id, classroom => ({
      ...classroom,
      assignments: [
        {
          id: createId('assignment'),
          title: `${module.title}: ${lesson.title}`,
          type: 'Custom lesson',
          course: classroom.course,
          sourceId: lesson.id,
          moduleId: module.id,
          lessonId: lesson.id,
          dueDate: '',
          instructions: module.description || `Complete ${lesson.title} from ${module.title}.`,
          successCriteria: [],
          materials: [],
          createdAt: new Date().toISOString(),
        },
        ...classroom.assignments,
      ],
    }))
  }

  function updateFeedback(assignmentId, studentId, feedback) {
    setAssignmentProgress(assignmentProgress.map(entry => (
      entry.assignmentId === assignmentId && entry.studentId === studentId
        ? { ...entry, feedback, feedbackUpdatedAt: new Date().toISOString() }
        : entry
    )))
  }

  function updateReview(assignmentId, studentId, updates) {
    setAssignmentProgress(assignmentProgress.map(entry => (
      entry.assignmentId === assignmentId && entry.studentId === studentId
        ? {
          ...entry,
          ...updates,
          reviewedAt: updates.reviewed ? new Date().toISOString() : entry.reviewedAt,
        }
        : entry
    )))
  }

  function resolveHelpRequest(assignmentId, studentId) {
    setAssignmentProgress(assignmentProgress.map(entry => (
      entry.assignmentId === assignmentId && entry.studentId === studentId
        ? {
          ...entry,
          helpResolved: true,
          helpResolvedAt: new Date().toISOString(),
        }
        : entry
    )))
  }

  function handlePostAnnouncement(event) {
    event.preventDefault()
    if (!selectedClass || !announcementForm.title.trim() || !announcementForm.message.trim()) return

    updateClass(selectedClass.id, classroom => ({
      ...classroom,
      announcements: [
        {
          id: createId('announcement'),
          title: announcementForm.title.trim(),
          message: announcementForm.message.trim(),
          author: currentUser?.name || 'Mr. Sep',
          createdAt: new Date().toISOString(),
        },
        ...(classroom.announcements || []),
      ],
    }))
    setAnnouncementForm({ title: '', message: '' })
  }

  function postQuickAnnouncement(title, message) {
    if (!selectedClass) return

    updateClass(selectedClass.id, classroom => ({
      ...classroom,
      announcements: [
        {
          id: createId('announcement'),
          title,
          message,
          author: currentUser?.name || 'Mr. Sep',
          createdAt: new Date().toISOString(),
        },
        ...(classroom.announcements || []),
      ],
    }))
  }

  if (currentUser?.role !== 'teacher') {
    return (
      <div className="page">
        <section className="hero">
          <p className="eyebrow">Teacher Area</p>
          <h1>Teacher resources are locked for student accounts.</h1>
          <p>
            Student dashboards can still use courses, tools, exam practice, past papers,
            and practical skills checklists.
          </p>

          <div className="action-row">
            <button className="btn primary" onClick={() => navigate('home')}>Back to dashboard</button>
            <button className="btn" onClick={() => navigate('tools')}>Open tools</button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="page">
      <section className="hero classroom-hero">
        <p className="eyebrow">Teacher Classroom</p>
          <h1>Create classes, assign course resources, and add classroom materials.</h1>
        <p>
          A first classroom workspace for Sep Chem Academy. Create a class, share its code,
          assign course resources or external activities, and add your own modules for the
          students in that classroom.
        </p>

        <div className="action-row">
          <button className="btn primary" onClick={() => navigate('topic', 'amount-of-substance')}>
            Open sample topic
          </button>
          <button className="btn" onClick={() => navigate('tools')}>
            Open tools
          </button>
        </div>
      </section>

      <section className="section classroom-layout">
        <aside className="panel classroom-sidebar">
          <div className="section-header compact">
            <div>
              <p className="eyebrow">Teacher Classes</p>
              <h2>Create a class</h2>
              <p>Classes are teacher-created spaces. Courses remain shared learning content.</p>
            </div>
          </div>

          <form className="classroom-form" onSubmit={handleCreateClass}>
            <label className="field">
              <span>Class name</span>
              <input
                value={classForm.name}
                onChange={event => setClassForm({ ...classForm, name: event.target.value })}
                placeholder="M5 Chemistry"
              />
            </label>
            <label className="field">
              <span>Course resource set</span>
              <select
                value={classForm.course}
                onChange={event => setClassForm({ ...classForm, course: event.target.value })}
              >
                {courseOptions.map(course => <option key={course}>{course}</option>)}
              </select>
            </label>
            <button className="btn primary" type="submit"><Plus size={17} /> Create class</button>
          </form>

          <div className="class-list">
            {teacherClasses.length === 0 && <p>No classes yet. Create your first class to start assigning work.</p>}
            {teacherClasses.map(classroom => (
              <button
                className={`class-list-item ${selectedClass?.id === classroom.id ? 'active' : ''}`}
                key={classroom.id}
                type="button"
                onClick={() => setSelectedClassId(classroom.id)}
              >
                <strong>{classroom.name}</strong>
                <span>{classroom.course}</span>
                <small>Code: {classroom.classCode}</small>
              </button>
            ))}
          </div>
        </aside>

        <div className="classroom-main">
          {!selectedClass ? (
            <section className="panel empty-classroom">
              <UsersRound size={38} />
              <h2>No class selected</h2>
              <p>Create a class to unlock assignments, modules, and student class-code access.</p>
            </section>
          ) : (
            <>
              <section className="panel class-summary">
                <div>
                  <p className="eyebrow">{selectedClass.course}</p>
                  <h2>{selectedClass.name}</h2>
                  <p>Share class code <strong>{selectedClass.classCode}</strong> with students. This classroom can use course resources, but course management stays admin-only.</p>
                </div>
                <div className="class-code-card">
                  <img
                    alt={`QR code for class code ${selectedClass.classCode}`}
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(selectedClass.classCode)}`}
                  />
                  <div>
                    <span>Join code</span>
                    <strong>{selectedClass.classCode}</strong>
                  </div>
                </div>
                <div className="class-stats">
                  <span><strong>{selectedClassEnrollments.length}</strong> students</span>
                  <span><strong>{selectedClass.assignments.length}</strong> assignments</span>
                  <span><strong>{dueSoonCount}</strong> due soon</span>
                  <span><strong>{overdueCount}</strong> overdue</span>
                  <span><strong>{selectedClass.resources?.length || 0}</strong> resources</span>
                  <span><strong>{selectedClass.modules.length}</strong> custom modules</span>
                  <span><strong>{completedCount}</strong> done</span>
                </div>
              </section>

              <section className="grid-2 classroom-builder-grid">
                <form className="panel classroom-form" onSubmit={handlePostAnnouncement}>
                  <p className="eyebrow">Class Stream</p>
                  <h2>Post announcement</h2>
                  <label className="field">
                    <span>Title</span>
                    <input
                      value={announcementForm.title}
                      onChange={event => setAnnouncementForm({ ...announcementForm, title: event.target.value })}
                      placeholder="Reminder for tomorrow"
                    />
                  </label>
                  <label className="field">
                    <span>Message</span>
                    <textarea
                      value={announcementForm.message}
                      onChange={event => setAnnouncementForm({ ...announcementForm, message: event.target.value })}
                      placeholder="Bring your practical notebook and complete the assigned mole calculations before class."
                    />
                  </label>
                  <button className="btn primary" type="submit"><Megaphone size={17} /> Post to class</button>
                </form>

                <form className="panel classroom-form" onSubmit={handleCreateAssignment}>
                  <p className="eyebrow">Assign Work</p>
                  <h2>Course resource or activity</h2>
                  <label className="field">
                    <span>Choose item</span>
                    <select
                      value={assignmentForm.sourceId}
                      onChange={event => setAssignmentForm({ ...assignmentForm, sourceId: event.target.value })}
                    >
                      {assignableItems.map(item => (
                        <option key={item.id} value={item.id}>{item.course} - {item.title}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span>Due date</span>
                    <input
                      type="date"
                      value={assignmentForm.dueDate}
                      onChange={event => setAssignmentForm({ ...assignmentForm, dueDate: event.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Instructions</span>
                    <textarea
                      value={assignmentForm.instructions}
                      onChange={event => setAssignmentForm({ ...assignmentForm, instructions: event.target.value })}
                      placeholder="Complete the lesson, answer the quiz, and write down two questions."
                    />
                  </label>
                  <label className="field">
                    <span>Success criteria</span>
                    <textarea
                      value={assignmentForm.criteriaText}
                      onChange={event => setAssignmentForm({ ...assignmentForm, criteriaText: event.target.value })}
                      placeholder={'One criterion per line\nShow full working\nUse correct units\nCorrect key vocabulary'}
                    />
                  </label>
                  <div className="material-fields">
                    <p className="eyebrow">Optional Material</p>
                    <label className="field">
                      <span>Material title</span>
                      <input
                        value={assignmentForm.materialTitle}
                        onChange={event => setAssignmentForm({ ...assignmentForm, materialTitle: event.target.value })}
                        placeholder="Worksheet, video, data booklet, or notes"
                      />
                    </label>
                    <label className="field">
                      <span>Material URL</span>
                      <input
                        value={assignmentForm.materialUrl}
                        onChange={event => setAssignmentForm({ ...assignmentForm, materialUrl: event.target.value })}
                        placeholder="https://..."
                      />
                    </label>
                    <label className="field">
                      <span>Material note</span>
                      <textarea
                        value={assignmentForm.materialNote}
                        onChange={event => setAssignmentForm({ ...assignmentForm, materialNote: event.target.value })}
                        placeholder="Read pages 1-2 before attempting the questions."
                      />
                    </label>
                  </div>
                  <button className="btn primary" type="submit"><ClipboardList size={17} /> Assign to class</button>
                </form>

                <form className="panel classroom-form" onSubmit={handleAddResource}>
                  <p className="eyebrow">Class Resources</p>
                  <h2>Add resource</h2>
                  <label className="field">
                    <span>Resource title</span>
                    <input
                      value={resourceForm.title}
                      onChange={event => setResourceForm({ ...resourceForm, title: event.target.value })}
                      placeholder="Topic summary, video, worksheet, or data booklet"
                    />
                  </label>
                  <label className="field">
                    <span>Resource type</span>
                    <select
                      value={resourceForm.type}
                      onChange={event => setResourceForm({ ...resourceForm, type: event.target.value })}
                    >
                      <option>External resource</option>
                      <option>Worksheet</option>
                      <option>Video</option>
                      <option>Course resource</option>
                      <option>Practical support</option>
                    </select>
                  </label>
                  <label className="field">
                    <span>URL</span>
                    <input
                      value={resourceForm.url}
                      onChange={event => setResourceForm({ ...resourceForm, url: event.target.value })}
                      placeholder="https://..."
                    />
                  </label>
                  <label className="field">
                    <span>Teacher note</span>
                    <textarea
                      value={resourceForm.note}
                      onChange={event => setResourceForm({ ...resourceForm, note: event.target.value })}
                      placeholder="Tell students when and how to use this resource."
                    />
                  </label>
                  <button className="btn primary" type="submit"><Paperclip size={17} /> Add to class</button>
                </form>

                <form className="panel classroom-form" onSubmit={handleCreateModule}>
                  <p className="eyebrow">Custom Content</p>
                  <h2>Add your own module</h2>
                  <label className="field">
                    <span>Module title</span>
                    <input
                      value={moduleForm.title}
                      onChange={event => setModuleForm({ ...moduleForm, title: event.target.value })}
                      placeholder="Redox extra support"
                    />
                  </label>
                  <label className="field">
                    <span>First lesson</span>
                    <input
                      value={moduleForm.lessonTitle}
                      onChange={event => setModuleForm({ ...moduleForm, lessonTitle: event.target.value })}
                      placeholder="Balancing half equations"
                    />
                  </label>
                  <label className="field">
                    <span>Additional lessons</span>
                    <textarea
                      value={moduleForm.lessonsText}
                      onChange={event => setModuleForm({ ...moduleForm, lessonsText: event.target.value })}
                      placeholder={'One lesson per line\nOxidation number practice\nExam-style redox questions'}
                    />
                  </label>
                  <label className="field">
                    <span>Module status</span>
                    <select
                      value={moduleForm.status}
                      onChange={event => setModuleForm({ ...moduleForm, status: event.target.value })}
                    >
                      <option>Draft</option>
                      <option>Ready</option>
                      <option>Live</option>
                    </select>
                  </label>
                  <label className="field">
                    <span>Description</span>
                    <textarea
                      value={moduleForm.description}
                      onChange={event => setModuleForm({ ...moduleForm, description: event.target.value })}
                      placeholder="Add teacher notes, links, worksheet aims, or class instructions."
                    />
                  </label>
                  <button className="btn primary" type="submit"><Layers3 size={17} /> Add module</button>
                </form>
              </section>

              <section className="panel">
                <p className="eyebrow">Class Stream</p>
                <h2>Announcements</h2>
                <div className="announcement-list">
                  {(!selectedClass.announcements || selectedClass.announcements.length === 0) && <p>No announcements yet.</p>}
                  {(selectedClass.announcements || []).map(announcement => (
                    <article className="announcement-card" key={announcement.id}>
                      <div className="announcement-icon"><Megaphone size={20} /></div>
                      <div>
                        <h3>{announcement.title}</h3>
                        <p>{announcement.message}</p>
                        <small>{announcement.author} • {new Date(announcement.createdAt).toLocaleString()}</small>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="grid-2 classroom-overview-grid">
                <article className="panel">
                  <p className="eyebrow">Roster</p>
                  <h2>Enrolled students</h2>
                  <form className="add-student-form" onSubmit={handleAddStudent}>
                    <label className="field">
                      <span>Student name</span>
                      <input
                        value={studentForm.name}
                        onChange={event => setStudentForm({ ...studentForm, name: event.target.value })}
                        placeholder="Student name"
                      />
                    </label>
                    <label className="field">
                      <span>Course</span>
                      <select
                        value={studentForm.course}
                        onChange={event => setStudentForm({ ...studentForm, course: event.target.value })}
                      >
                        {courseOptions.map(course => <option key={course}>{course}</option>)}
                      </select>
                    </label>
                    <button className="btn primary" type="submit"><Plus size={17} /> Add student</button>
                  </form>
                  <div className="classroom-item-list">
                    {selectedClassEnrollments.length === 0 && <p>No students have joined with this class code yet.</p>}
                    {selectedClassEnrollments.map(enrollment => {
                      const studentUpdates = selectedClassProgress.filter(entry => entry.studentId === enrollment.studentId)
                      return (
                        <div className="classroom-item roster-item" key={`${enrollment.classCode}-${enrollment.studentId}`}>
                          <UsersRound size={20} />
                          <div>
                            <h3>{enrollment.studentName}</h3>
                            <p>{enrollment.course}</p>
                            <small>{studentUpdates.length} assignment update{studentUpdates.length === 1 ? '' : 's'}</small>
                          </div>
                          <span>{new Date(enrollment.joinedAt).toLocaleDateString()}</span>
                        </div>
                      )
                    })}
                  </div>
                </article>

                <article className="panel">
                  <p className="eyebrow">Assigned Work</p>
                  <h2>Class assignments</h2>
                  <div className="classroom-item-list">
                    {selectedClass.assignments.length === 0 && <p>No assignments yet.</p>}
                    {selectedClass.assignments.map(assignment => {
                      const dueStatus = getDueStatus(assignment.dueDate)
                      return (
                        <div className={`classroom-item ${dueStatus.tone}`} key={assignment.id}>
                          <BookOpen size={20} />
                          <div>
                            <h3>{assignment.title}</h3>
                            <p>{assignment.type} • {assignment.course}</p>
                            {assignment.instructions && <small>{assignment.instructions}</small>}
                            {assignment.successCriteria?.length > 0 && (
                              <small>{assignment.successCriteria.length} success criteria</small>
                            )}
                            {assignment.materials?.length > 0 && (
                              <div className="material-list compact">
                                {assignment.materials.map(material => (
                                  <span className="material-chip" key={material.id}>
                                    <Paperclip size={14} /> {material.title}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <span className={`due-badge ${dueStatus.tone}`}>{dueStatus.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </article>

                <article className="panel">
                  <p className="eyebrow">Class Resources</p>
                  <h2>Shared with students</h2>
                  <div className="classroom-item-list">
                    {(!selectedClass.resources || selectedClass.resources.length === 0) && <p>No class resources yet.</p>}
                    {(selectedClass.resources || []).map(resource => (
                      <div className="classroom-item" key={resource.id}>
                        <Paperclip size={20} />
                        <div>
                          <h3>{resource.title}</h3>
                          <p>{resource.type}</p>
                          {resource.note && <small>{resource.note}</small>}
                          {resource.url && (
                            <small>
                              <a href={resource.url} target="_blank" rel="noreferrer">{resource.url}</a>
                            </small>
                          )}
                        </div>
                        <span>{new Date(resource.addedAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="panel">
                  <p className="eyebrow">Custom Modules</p>
                  <h2>Teacher-created content</h2>
                  <div className="classroom-item-list">
                    {selectedClass.modules.length === 0 && <p>No custom modules yet.</p>}
                    {selectedClass.modules.map(module => (
                      <div className="classroom-item" key={module.id}>
                        <FlaskConical size={20} />
                        <div>
                          <h3>{module.title}</h3>
                          <p>{module.description || 'Custom module'}</p>
                          <small>{module.lessons.length} lesson{module.lessons.length === 1 ? '' : 's'} in this sequence</small>
                          <div className="module-lesson-list">
                            {module.lessons.map((lesson, index) => (
                              <div className="module-lesson-row" key={lesson.id}>
                                <span>{index + 1}</span>
                                <div>
                                  <strong>{lesson.title}</strong>
                                  <small>{lesson.status || 'Draft'}</small>
                                </div>
                                <button
                                  className="mini-action"
                                  type="button"
                                  onClick={() => assignModuleLesson(module, lesson)}
                                >
                                  Assign
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                        <span>{module.lessons.some(lesson => lesson.status === 'Live') ? 'Live' : module.lessons.some(lesson => lesson.status === 'Ready') ? 'Ready' : 'Draft'}</span>
                      </div>
                    ))}
                  </div>
                </article>
              </section>

              <section className="panel">
                <p className="eyebrow">Student Progress</p>
                <h2>Assignment status overview</h2>
                <div className="progress-summary-row">
                  <span><strong>{selectedClassProgress.length}</strong> total status updates</span>
                  <span><strong>{inProgressCount}</strong> in progress</span>
                  <span><strong>{completedCount}</strong> done</span>
                  <span><strong>{needsReviewCount}</strong> need review</span>
                  <span><strong>{openHelpCount}</strong> need help</span>
                  <span><strong>{averageScore ?? '-'}</strong> avg score</span>
                </div>

                <div className="analytics-grid">
                  <article className="analytics-panel">
                    <div className="analytics-heading">
                      <div>
                        <p className="eyebrow">Assignment Health</p>
                        <h3>What needs attention</h3>
                      </div>
                      <strong>{reviewedCount} reviewed</strong>
                    </div>
                    <div className="analytics-list">
                      {assignmentAnalytics.length === 0 && <p>No assignment analytics yet.</p>}
                      {assignmentAnalytics.slice(0, 4).map(assignment => {
                        const completion = selectedClassEnrollments.length
                          ? Math.round((assignment.done / selectedClassEnrollments.length) * 100)
                          : 0
                        return (
                          <div className="analytics-row" key={assignment.id}>
                            <div>
                              <strong>{assignment.title}</strong>
                              <small>{assignment.done} done • {assignment.reviewed} reviewed • {assignment.totalUpdates} updates</small>
                            </div>
                            <div className="analytics-meter" aria-label={`${completion}% completed`}>
                              <span style={{ width: `${completion}%` }} />
                            </div>
                            <b>{assignment.averageScore ?? '-'}</b>
                          </div>
                        )
                      })}
                    </div>
                  </article>

                  <article className="analytics-panel">
                    <div className="analytics-heading">
                      <div>
                        <p className="eyebrow">Student Health</p>
                        <h3>Who needs support</h3>
                      </div>
                      <strong>{selectedClassEnrollments.length} students</strong>
                    </div>
                    <div className="analytics-list">
                      {studentAnalytics.length === 0 && <p>No student analytics yet.</p>}
                      {studentAnalytics.slice(0, 5).map(student => (
                        <div className={`analytics-row ${student.needsReview ? 'attention' : ''}`} key={student.studentId}>
                          <div>
                            <strong>{student.studentName}</strong>
                            <small>{student.done} done • {student.needsReview} waiting for review</small>
                          </div>
                          <div className="analytics-meter" aria-label={`${student.completionRate}% completed`}>
                            <span style={{ width: `${student.completionRate}%` }} />
                          </div>
                          <b>{student.averageScore ?? '-'}</b>
                        </div>
                      ))}
                    </div>
                  </article>
                </div>

                <div className="support-queue-grid">
                  <article className="support-card">
                    <div className="support-card-heading">
                      <div>
                        <p className="eyebrow">Needs Nudge</p>
                        <h3>Missing updates</h3>
                      </div>
                      <span>{studentsNeedingNudge.length}</span>
                    </div>
                    <div className="support-list">
                      {studentsNeedingNudge.length === 0 && <p>Everyone is caught up with assignment updates.</p>}
                      {studentsNeedingNudge.map(student => (
                        <div className="support-pill" key={student.studentId}>
                          <strong>{student.studentName}</strong>
                          <small>{student.totalUpdates} / {selectedClass.assignments.length} updates</small>
                        </div>
                      ))}
                    </div>
                    <button
                      className="mini-action"
                      type="button"
                      onClick={() => postQuickAnnouncement(
                        'Assignment reminder',
                        'Please check your Sep Chem Academy dashboard and update any assignments you have not started before the next lesson.'
                      )}
                    >
                      Post reminder
                    </button>
                  </article>

                  <article className="support-card">
                    <div className="support-card-heading">
                      <div>
                        <p className="eyebrow">Help Requests</p>
                        <h3>Students are stuck</h3>
                      </div>
                      <span>{helpQueue.length}</span>
                    </div>
                    <div className="support-list">
                      {helpQueue.length === 0 && <p>No open help requests right now.</p>}
                      {helpQueue.map(entry => (
                        <div className="support-pill help" key={`${entry.assignmentId}-${entry.studentId}`}>
                          <strong>{entry.studentName}</strong>
                          <small>{entry.assignmentTitle}</small>
                          {entry.helpNote && <p>{entry.helpNote}</p>}
                          <button
                            className="mini-action"
                            type="button"
                            onClick={() => resolveHelpRequest(entry.assignmentId, entry.studentId)}
                          >
                            Mark resolved
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      className="mini-action"
                      type="button"
                      onClick={() => postQuickAnnouncement(
                        'Help session',
                        'If you are stuck, add a help note on your assignment card. I will use these to plan support and mini-explanations.'
                      )}
                    >
                      Post help note
                    </button>
                  </article>

                  <article className="support-card">
                    <div className="support-card-heading">
                      <div>
                        <p className="eyebrow">Ready For Review</p>
                        <h3>Completed work</h3>
                      </div>
                      <span>{reviewQueue.length}</span>
                    </div>
                    <div className="support-list">
                      {reviewQueue.length === 0 && <p>No completed work is waiting for review.</p>}
                      {reviewQueue.map(entry => (
                        <div className="support-pill" key={`${entry.assignmentId}-${entry.studentId}`}>
                          <strong>{entry.studentName}</strong>
                          <small>{entry.assignmentTitle}</small>
                        </div>
                      ))}
                    </div>
                    <button
                      className="mini-action"
                      type="button"
                      onClick={() => postQuickAnnouncement(
                        'Feedback update',
                        'I am reviewing recent submissions. Please open your assignment cards, read feedback carefully, and improve your responses where needed.'
                      )}
                    >
                      Post feedback note
                    </button>
                  </article>

                  <article className="support-card">
                    <div className="support-card-heading">
                      <div>
                        <p className="eyebrow">Strong Progress</p>
                        <h3>Celebrate momentum</h3>
                      </div>
                      <span>{strongStudents.length}</span>
                    </div>
                    <div className="support-list">
                      {strongStudents.length === 0 && <p>Strong progress will appear once students complete more tasks.</p>}
                      {strongStudents.map(student => (
                        <div className="support-pill positive" key={student.studentId}>
                          <strong>{student.studentName}</strong>
                          <small>{student.completionRate}% complete{student.averageScore !== null ? ` • ${student.averageScore}/100 avg` : ''}</small>
                        </div>
                      ))}
                    </div>
                    <button
                      className="mini-action"
                      type="button"
                      onClick={() => postQuickAnnouncement(
                        'Class progress',
                        'Great work on recent chemistry tasks. Keep using success criteria and reflections to strengthen your exam answers.'
                      )}
                    >
                      Post encouragement
                    </button>
                  </article>
                </div>

                <div className="classroom-item-list">
                  {selectedClass.assignments.length === 0 && <p>Create assignments to start seeing student progress.</p>}
                  {selectedClass.assignments.map(assignment => {
                    const updates = selectedClassProgress.filter(entry => entry.assignmentId === assignment.id)
                    const dueStatus = getDueStatus(assignment.dueDate)
                    return (
                      <div className={`progress-assignment ${dueStatus.tone}`} key={assignment.id}>
                        <div>
                          <h3>{assignment.title}</h3>
                          <p>{updates.length} student update{updates.length === 1 ? '' : 's'}</p>
                          <span className={`due-badge ${dueStatus.tone}`}><CalendarClock size={14} /> {dueStatus.label}</span>
                          {assignment.successCriteria?.length > 0 && (
                            <small>{assignment.successCriteria.length} criteria assigned</small>
                          )}
                          {assignment.materials?.length > 0 && (
                            <small>{assignment.materials.length} material attached</small>
                          )}
                        </div>
                        <div className="student-status-list">
                          {updates.length === 0 && <span className="status-pill muted">No updates yet</span>}
                          {updates.map(update => (
                            <div className="student-update-card" key={`${update.assignmentId}-${update.studentId}`}>
                              <span className={`status-pill ${update.status.toLowerCase().replaceAll(' ', '-')}`}>
                                {update.studentName}: {update.status}
                              </span>
                              {update.response && (
                                <p><strong>Response:</strong> {update.response}</p>
                              )}
                              {assignment.successCriteria?.length > 0 && (
                                <p>
                                  <strong>Criteria checked:</strong>{' '}
                                  {(update.criteriaChecks || []).filter(Boolean).length} / {assignment.successCriteria.length}
                                </p>
                              )}
                              {update.helpRequested && !update.helpResolved && (
                                <div className="teacher-help-note">
                                  <strong>Help requested</strong>
                                  <p>{update.helpNote || 'No note added yet.'}</p>
                                  <button
                                    className="mini-action"
                                    type="button"
                                    onClick={() => resolveHelpRequest(update.assignmentId, update.studentId)}
                                  >
                                    Mark resolved
                                  </button>
                                </div>
                              )}
                              <label className="field compact-field">
                                <span>Feedback</span>
                                <textarea
                                  value={update.feedback || ''}
                                  onChange={event => updateFeedback(update.assignmentId, update.studentId, event.target.value)}
                                  placeholder="Leave a short comment for this student."
                                />
                              </label>
                              <div className="review-controls">
                                <label className="field compact-field review-score-field">
                                  <span>Score</span>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={update.score ?? ''}
                                    onChange={event => updateReview(update.assignmentId, update.studentId, { score: event.target.value })}
                                    placeholder="0-100"
                                  />
                                </label>
                                <button
                                  className={`review-toggle ${update.reviewed ? 'active' : ''}`}
                                  type="button"
                                  onClick={() => updateReview(update.assignmentId, update.studentId, { reviewed: !update.reviewed })}
                                >
                                  {update.reviewed ? 'Reviewed' : 'Mark reviewed'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            </>
          )}
        </div>
      </section>

      <section className="section grid-3">
        <article className="card">
          <h3>Next iteration</h3>
          <p>Add richer analytics, batch assignment controls, and reusable lesson sequences for each class.</p>
        </article>
        <article className="card">
          <h3>Better than generic classroom tools</h3>
          <p>Assignments can connect directly to chemistry topics, practical routines, exam frames, and calculators.</p>
        </article>
        <article className="card">
          <h3>Backend later</h3>
          <p>This local version defines the workflow before we connect accounts, classes, and analytics to a database.</p>
        </article>
      </section>
    </div>
  )
}
