import { useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import ASChemistry from './pages/ASChemistry.jsx'
import A2Chemistry from './pages/A2Chemistry.jsx'
import TopicPage from './pages/TopicPage.jsx'
import InteractiveTools from './pages/InteractiveTools.jsx'
import ExamPractice from './pages/ExamPractice.jsx'
import TeacherResources from './pages/TeacherResources.jsx'
import { allTopics } from './data/topics.js'

export default function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedTopicId, setSelectedTopicId] = useState('amount-of-substance')

  function navigate(page, topicId = null) {
    if (topicId) setSelectedTopicId(topicId)
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const selectedTopic = allTopics.find(topic => topic.id === selectedTopicId) || allTopics[0]

  return (
    <div className="app-shell">
      <Navbar currentPage={currentPage} navigate={navigate} />
      <main>
        {currentPage === 'home' && <Home navigate={navigate} />}
        {currentPage === 'as' && <ASChemistry navigate={navigate} />}
        {currentPage === 'a2' && <A2Chemistry navigate={navigate} />}
        {currentPage === 'topic' && <TopicPage topic={selectedTopic} navigate={navigate} />}
        {currentPage === 'tools' && <InteractiveTools />}
        {currentPage === 'exam' && <ExamPractice />}
        {currentPage === 'teacher' && <TeacherResources navigate={navigate} />}
      </main>
    </div>
  )
}
