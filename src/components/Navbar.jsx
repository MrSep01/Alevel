import { Atom, Cog, FlaskConical, UserRound, Zap } from 'lucide-react'

const links = [
  { id: 'home', label: 'Home' },
  { id: 'igcse', label: 'IGCSE CIE' },
  { id: 'as', label: 'AS Chemistry' },
  { id: 'a2', label: 'A2 Chemistry' },
  { id: 'tools', label: 'Tools' },
  { id: 'exam', label: 'Exam Practice' },
  { id: 'past-papers', label: 'Past Papers' },
  { id: 'practicals', label: 'Practicals' },
  { id: 'teacher', label: 'Teacher', teacherOnly: true },
  { id: 'admin', label: 'Admin', adminOnly: true },
]

export default function Navbar({ currentPage, currentUser, navigate, onLogout, onOpenProfile }) {
  const isTeacher = currentUser?.role === 'teacher'
  const isAdmin = currentUser?.role === 'admin'
  const chemCredits = currentUser?.chemCredits ?? 0
  const labRhythm = currentUser?.labRhythm ?? 0
  const visibleLinks = links.filter(link => (
    (!link.teacherOnly || isTeacher) && (!link.adminOnly || isAdmin)
  ))

  function isActiveLink(linkId) {
    if (currentPage === linkId) return true
    if (currentPage === 'topic-exam-practice' && linkId === 'exam') return true
    if (currentPage === 'topic-past-papers' && linkId === 'past-papers') return true
    if ([
      'stoich-flow-tool',
      'mole-relationship-tool',
      'stoich-equation-tool',
      'limiting-reagent-tool',
      'hess-tool',
      'born-haber-tool',
    ].includes(currentPage) && linkId === 'tools') return true
    return false
  }

  return (
    <header className="navbar">
      <div className="nav-inner">
        <div className="nav-main">
          <button className="brand nav-link" onClick={() => navigate('home')}>
            <span className="brand-icon"><Cog size={27} /></span>
            <span>Sep Chem Academy</span>
          </button>

          <div className="nav-navigation">
            <nav className="nav-links">
              {visibleLinks.map(link => (
                <button
                  key={link.id}
                  className={`nav-link ${isActiveLink(link.id) ? 'active' : ''}`}
                  onClick={() => navigate(link.id)}
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="nav-actions" aria-label="Account and dashboard stats">
          <span className="nav-stat stat-with-tooltip credit-stat" tabIndex="0">
            <Atom size={24} /> {chemCredits} CC
            <span className="stat-tooltip" role="tooltip">
              Chem Credits: earn CC by starting assigned work, completing activities, checking criteria, using class resources, asking for help, and reviewing teacher feedback.
            </span>
          </span>
          {!isTeacher && !isAdmin && (
            <span className="nav-stat stat-with-tooltip rhythm-stat" tabIndex="0">
              <FlaskConical size={24} /> Lab {labRhythm}
              <span className="stat-tooltip" role="tooltip">
                Lab Rhythm: grows when you are active on different study days by completing work, updating progress, asking for help, or reviewing feedback.
              </span>
            </span>
          )}
          {isTeacher && (
            <button className="upgrade-button" type="button" onClick={() => navigate('teacher')}>
              <Zap size={16} /> Classroom
            </button>
          )}
          {isAdmin && (
            <button className="upgrade-button" type="button" onClick={() => navigate('admin')}>
              <Zap size={16} /> Course Admin
            </button>
          )}
          <button className="profile-button" type="button" onClick={onOpenProfile}>
            {currentUser?.photoUrl ? (
              <img className="nav-profile-photo" src={currentUser.photoUrl} alt="" />
            ) : (
              <UserRound size={17} />
            )}
            {currentUser?.username || currentUser?.name || 'Profile'}
          </button>
          <button className="logout-button" type="button" onClick={onLogout}>Log out</button>
        </div>
      </div>
    </header>
  )
}
