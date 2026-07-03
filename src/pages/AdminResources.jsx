import { BookOpen, FlaskConical, LockKeyhole, Settings2, UsersRound } from 'lucide-react'
import { useLocalStorage } from '../utils/useLocalStorage.js'

const managedCourses = [
  {
    title: 'IGCSE Chemistry CIE',
    description: 'Core and Extended syllabus resources, topic order, flashcards, and exam question banks.',
    status: 'Active',
  },
  {
    title: 'AS Chemistry',
    description: 'International AS Chemistry course structure, lessons, calculators, and topic practice.',
    status: 'Active',
  },
  {
    title: 'A2 Chemistry',
    description: 'International A2 Chemistry course structure, advanced topics, and exam preparation resources.',
    status: 'Active',
  },
]

export default function AdminResources({ currentUser, navigate }) {
  const [classes] = useLocalStorage('sep-chem-classes', [])
  const [enrollments] = useLocalStorage('sep-chem-enrollments', [])

  if (currentUser?.role !== 'admin') {
    return (
      <div className="page">
        <section className="hero">
          <p className="eyebrow">Admin Area</p>
          <h1>Course management is restricted to admin accounts.</h1>
          <p>
            Students can learn from courses. Teachers can create classrooms and assign resources.
            Only admins manage the platform course catalogue.
          </p>
          <div className="action-row">
            <button className="btn primary" onClick={() => navigate('home')}>Back to dashboard</button>
            <button className="btn" onClick={() => navigate('teacher')}>Open classroom</button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="page">
      <section className="hero admin-hero">
        <p className="eyebrow">Admin Course Management</p>
        <h1>Manage the Sep Chem Academy course catalogue.</h1>
        <p>
          Admins control course structure and platform resources. Teachers use these resources
          inside classrooms but do not manage the course catalogue itself.
        </p>
      </section>

      <section className="section admin-grid">
        <article className="panel admin-policy-card">
          <LockKeyhole size={30} />
          <div>
            <p className="eyebrow">Permissions</p>
            <h2>Clear role boundaries</h2>
            <p>Students learn. Teachers build classrooms and assign resources. Admins manage courses.</p>
          </div>
        </article>

        <article className="panel admin-policy-card">
          <Settings2 size={30} />
          <div>
            <p className="eyebrow">Next Admin Tools</p>
            <h2>Course editor placeholder</h2>
            <p>This page is ready for syllabus editing, resource publishing, and version control.</p>
          </div>
        </article>
      </section>

      <section className="section panel">
        <div className="section-header compact">
          <div>
            <p className="eyebrow">Course Catalogue</p>
            <h2>Platform-managed courses</h2>
          </div>
        </div>
        <div className="admin-course-list">
          {managedCourses.map(course => (
            <article className="admin-course-card" key={course.title}>
              <span className="course-icon mint"><FlaskConical size={28} /></span>
              <div>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <small>{course.status}</small>
              </div>
              <button className="mini-action" type="button">
                <BookOpen size={15} /> Edit course
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="section panel">
        <div className="section-header compact">
          <div>
            <p className="eyebrow">Classrooms</p>
            <h2>All teacher-created classes</h2>
          </div>
        </div>
        <div className="admin-course-list">
          {classes.length === 0 && <p>No classes have been created yet.</p>}
          {classes.map(classroom => {
            const classEnrollments = enrollments.filter(enrollment => enrollment.classCode === classroom.classCode)
            return (
              <article className="admin-course-card" key={classroom.id}>
                <span className="course-icon blue"><UsersRound size={28} /></span>
                <div>
                  <h3>{classroom.name}</h3>
                  <p>{classroom.course} • Code {classroom.classCode}</p>
                  <small>{classEnrollments.length} student{classEnrollments.length === 1 ? '' : 's'} • {classroom.createdBy || 'Teacher'}</small>
                </div>
                <button className="mini-action" type="button">
                  Audit class
                </button>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
