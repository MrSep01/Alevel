import { Atom } from 'lucide-react'

const links = [
  { id: 'home', label: 'Home' },
  { id: 'as', label: 'AS Chemistry' },
  { id: 'a2', label: 'A2 Chemistry' },
  { id: 'tools', label: 'Tools' },
  { id: 'exam', label: 'Exam Practice' },
  { id: 'teacher', label: 'Teacher' },
]

export default function Navbar({ currentPage, navigate }) {
  return (
    <header className="navbar">
      <div className="nav-inner">
        <button className="brand nav-link" onClick={() => navigate('home')}>
          <span className="brand-icon"><Atom size={22} /></span>
          <span>A Level Chemistry Lab</span>
        </button>

        <nav className="nav-links">
          {links.map(link => (
            <button
              key={link.id}
              className={`nav-link ${currentPage === link.id ? 'active' : ''}`}
              onClick={() => navigate(link.id)}
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
