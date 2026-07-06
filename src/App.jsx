import { useCallback, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ASChemistry from './pages/ASChemistry.jsx'
import A2Chemistry from './pages/A2Chemistry.jsx'
import IGCSEChemistry from './pages/IGCSEChemistry.jsx'
import TopicPage from './pages/TopicPage.jsx'
import InteractiveTools from './pages/InteractiveTools.jsx'
import StoichiometryFlowToolPage from './pages/StoichiometryFlowToolPage.jsx'
import MoleRelationshipToolPage from './pages/MoleRelationshipToolPage.jsx'
import StoichiometryEquationToolPage from './pages/StoichiometryEquationToolPage.jsx'
import LimitingReagentToolPage from './pages/LimitingReagentToolPage.jsx'
import BornHaberToolPage from './pages/BornHaberToolPage.jsx'
import HessToolPage from './pages/HessToolPage.jsx'
import ExamPractice from './pages/ExamPractice.jsx'
import TopicAssessmentPage from './pages/TopicAssessmentPage.jsx'
import Practicals from './pages/Practicals.jsx'
import TeacherResources from './pages/TeacherResources.jsx'
import AdminResources from './pages/AdminResources.jsx'
import { allTopics } from './data/topics.js'
import { useLocalStorage } from './utils/useLocalStorage.js'

export default function App() {
  const [currentUser, setCurrentUser] = useLocalStorage('sep-chem-session', null)
  const [accounts, setAccounts] = useLocalStorage('sep-chem-accounts', [])
  const [currentPage, setCurrentPage] = useState(currentUser ? 'home' : 'login')
  const [selectedTopicId, setSelectedTopicId] = useState('amount-of-substance')
  const [selectedPracticalLevel, setSelectedPracticalLevel] = useState(null)
  const [profileOpen, setProfileOpen] = useState(false)

  function navigate(page, payload = null) {
    if (['topic', 'topic-exam-practice', 'topic-past-papers'].includes(page) && payload) setSelectedTopicId(payload)
    if (page === 'practicals') setSelectedPracticalLevel(payload)
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const selectedTopic = allTopics.find(topic => topic.id === selectedTopicId) || allTopics[0]

  function handleLogin(user) {
    setCurrentUser(user)
    setProfileOpen(Boolean(user.needsOnboarding))
    setCurrentPage('home')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleUpdateProfile(profile) {
    const updatedUser = {
      ...currentUser,
      ...profile,
      name: profile.username || currentUser.name,
      profileComplete: true,
      needsOnboarding: false,
    }
    setCurrentUser(updatedUser)
    setAccounts(accounts.map(account => (
      account.id === currentUser.id
        ? {
          ...account,
          ...profile,
          name: profile.username || account.name,
          profileComplete: true,
          updatedAt: new Date().toISOString(),
        }
        : account
    )))
    setProfileOpen(false)
  }

  function handleLogout() {
    setCurrentUser(null)
    setCurrentPage('login')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleUserStatsChange = useCallback((stats) => {
    setCurrentUser(previousUser => {
      if (!previousUser) return previousUser
      if (
        previousUser.chemCredits === stats.chemCredits &&
        previousUser.labRhythm === stats.labRhythm
      ) {
        return previousUser
      }
      return { ...previousUser, ...stats }
    })
  }, [setCurrentUser])

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div className="app-shell">
      <Navbar
        currentPage={currentPage}
        currentUser={currentUser}
        navigate={navigate}
        onLogout={handleLogout}
        onOpenProfile={() => setProfileOpen(true)}
      />
      <main>
        {currentPage === 'home' && <Home currentUser={currentUser} navigate={navigate} onUserStatsChange={handleUserStatsChange} />}
        {currentPage === 'as' && <ASChemistry navigate={navigate} />}
        {currentPage === 'a2' && <A2Chemistry navigate={navigate} />}
        {currentPage === 'igcse' && <IGCSEChemistry navigate={navigate} />}
        {currentPage === 'topic' && <TopicPage topic={selectedTopic} navigate={navigate} currentUser={currentUser} />}
        {currentPage === 'tools' && <InteractiveTools navigate={navigate} />}
        {currentPage === 'stoich-flow-tool' && <StoichiometryFlowToolPage navigate={navigate} />}
        {currentPage === 'mole-relationship-tool' && <MoleRelationshipToolPage navigate={navigate} />}
        {currentPage === 'stoich-equation-tool' && <StoichiometryEquationToolPage navigate={navigate} />}
        {currentPage === 'limiting-reagent-tool' && <LimitingReagentToolPage navigate={navigate} />}
        {currentPage === 'hess-tool' && <HessToolPage navigate={navigate} />}
        {currentPage === 'born-haber-tool' && <BornHaberToolPage navigate={navigate} />}
        {currentPage === 'exam' && <ExamPractice navigate={navigate} mode="exam" />}
        {currentPage === 'past-papers' && <ExamPractice navigate={navigate} mode="past" />}
        {currentPage === 'topic-exam-practice' && <TopicAssessmentPage topic={selectedTopic} navigate={navigate} mode="exam" />}
        {currentPage === 'topic-past-papers' && <TopicAssessmentPage topic={selectedTopic} navigate={navigate} mode="past" />}
        {currentPage === 'practicals' && <Practicals initialLevel={selectedPracticalLevel} />}
        {currentPage === 'teacher' && <TeacherResources currentUser={currentUser} navigate={navigate} />}
        {currentPage === 'admin' && <AdminResources currentUser={currentUser} navigate={navigate} />}
      </main>
      {profileOpen && (
        <ProfileModal
          currentUser={currentUser}
          onClose={() => {
            if (!currentUser?.needsOnboarding) setProfileOpen(false)
          }}
          onSave={handleUpdateProfile}
        />
      )}
    </div>
  )
}

function ProfileModal({ currentUser, onClose, onSave }) {
  const [username, setUsername] = useState(currentUser?.username || currentUser?.name || '')
  const [bio, setBio] = useState(currentUser?.bio || '')
  const [photoUrl, setPhotoUrl] = useState(currentUser?.photoUrl || '')

  function handlePhotoUpload(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhotoUrl(reader.result)
    reader.readAsDataURL(file)
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSave({
      username: username.trim() || currentUser?.name || 'User',
      bio: bio.trim(),
      photoUrl,
    })
  }

  return (
    <div className="profile-modal-backdrop" role="presentation">
      <form className="profile-modal" onSubmit={handleSubmit}>
        <div className="profile-modal-header">
          <div>
            <p className="eyebrow">{currentUser?.needsOnboarding ? 'Complete profile' : 'Profile settings'}</p>
            <h2>{currentUser?.role === 'teacher' ? 'Teacher profile' : 'Student profile'}</h2>
            <p>Your email is verified and cannot be edited from this profile screen.</p>
          </div>
          {!currentUser?.needsOnboarding && (
            <button className="icon-button" type="button" onClick={onClose} aria-label="Close profile">×</button>
          )}
        </div>

        <div className="profile-photo-row">
          <div className="profile-photo-preview">
            {photoUrl ? <img src={photoUrl} alt="" /> : <span>{(username || currentUser?.name || 'U').slice(0, 1).toUpperCase()}</span>}
          </div>
          <label className="profile-upload-button">
            Change photo
            <input type="file" accept="image/*" onChange={handlePhotoUpload} />
          </label>
        </div>

        <div className="input-grid login-fields">
          <label className="field">
            <span>Username</span>
            <input value={username} onChange={event => setUsername(event.target.value)} placeholder="Choose a display name" />
          </label>
          <label className="field locked-field">
            <span>Verified email</span>
            <input value={currentUser?.email || ''} disabled />
          </label>
        </div>

        <label className="field">
          <span>About</span>
          <textarea
            value={bio}
            onChange={event => setBio(event.target.value)}
            placeholder={currentUser?.role === 'teacher' ? 'Tell students about your teaching style or subjects.' : 'Add your year group, goals, or chemistry focus.'}
          />
        </label>

        <button className="btn primary login-submit" type="submit">
          Save profile
        </button>
      </form>
    </div>
  )
}
