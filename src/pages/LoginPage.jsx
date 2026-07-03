import { BookOpen, GraduationCap, KeyRound, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useLocalStorage } from '../utils/useLocalStorage.js'

const accountTypes = [
  {
    id: 'student',
    label: 'Student',
    icon: GraduationCap,
    description: 'Join classes, use course resources, complete assignments, and review teacher feedback.',
  },
  {
    id: 'teacher',
    label: 'Teacher',
    icon: BookOpen,
    description: 'Create classes, enroll students, assign resources, and review learner progress.',
  },
]

const providerOptions = [
  { id: 'google', label: 'Google', mark: 'G' },
  { id: 'apple', label: 'Apple', mark: '' },
  { id: 'microsoft', label: 'Microsoft', mark: 'M' },
]

function createStableUserId({ email, role }) {
  const seed = `${role}-${email || 'user'}`
  return seed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function nameFromEmail(email, fallback) {
  const localPart = email.split('@')[0]?.replace(/[._-]+/g, ' ').trim()
  if (!localPart) return fallback
  return localPart.replace(/\b\w/g, letter => letter.toUpperCase())
}

export default function LoginPage({ onLogin }) {
  const [accounts, setAccounts] = useLocalStorage('sep-chem-accounts', [])
  const [authMode, setAuthMode] = useState('sign-in')
  const [role, setRole] = useState('student')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [authMessage, setAuthMessage] = useState('')
  const [adminMessage, setAdminMessage] = useState('')

  function findAccount(nextEmail, nextRole) {
    return accounts.find(account => (
      account.email.toLowerCase() === nextEmail.toLowerCase() && account.role === nextRole
    ))
  }

  function finishAuth({ nextRole, nextEmail, nextName, provider = 'email', account = null }) {
    const fallbackName = nextRole === 'teacher' ? 'Mr. Sep' : 'Student'
    const displayName = account?.name || nextName.trim() || nameFromEmail(nextEmail, fallbackName)

    onLogin({
      id: account?.id || createStableUserId({ email: nextEmail || displayName, role: nextRole }),
      name: displayName,
      email: nextEmail,
      role: nextRole,
      authProvider: provider,
      username: account?.username || '',
      bio: account?.bio || '',
      photoUrl: account?.photoUrl || '',
      profileComplete: Boolean(account?.profileComplete),
      needsOnboarding: !account?.profileComplete,
      course: 'IGCSE Chemistry CIE',
      signedInAt: new Date().toISOString(),
    })
  }

  function handleEmailAuth(event) {
    event.preventDefault()
    const nextEmail = email.trim().toLowerCase()
    const nextName = authMode === 'sign-up' ? name.trim() : ''
    const existingAccount = findAccount(nextEmail, role)

    if (!nextEmail || !password) {
      setAuthMessage('Enter your email and password.')
      return
    }

    if (authMode === 'sign-up') {
      if (existingAccount) {
        setAuthMessage('An account already exists for this email and role. Use sign in instead.')
        return
      }
      if (password.length < 6) {
        setAuthMessage('Use at least 6 characters for the password.')
        return
      }
      const createdAccount = {
        id: createStableUserId({ email: nextEmail, role }),
        name: nextName || nameFromEmail(nextEmail, role === 'teacher' ? 'Mr. Sep' : 'Student'),
        email: nextEmail,
        role,
        password,
        provider: 'email',
        username: '',
        bio: '',
        photoUrl: '',
        profileComplete: false,
        createdAt: new Date().toISOString(),
      }
      setAccounts([createdAccount, ...accounts])
      finishAuth({ nextRole: role, nextEmail, nextName, provider: 'email', account: createdAccount })
      return
    }

    if (!existingAccount || existingAccount.password !== password) {
      setAuthMessage('No matching account found. Check details or create an account.')
      return
    }

    finishAuth({ nextRole: role, nextEmail, nextName: '', provider: 'email', account: existingAccount })
  }

  function handleProviderAuth(provider) {
    const providerEmail = email.trim() || `${role}.${provider}@sepchem.local`
    const existingAccount = findAccount(providerEmail, role)
    const providerAccount = existingAccount || {
      id: createStableUserId({ email: providerEmail, role }),
      name: name.trim() || nameFromEmail(providerEmail, role === 'teacher' ? 'Mr. Sep' : 'Student'),
      email: providerEmail,
      role,
      password: '',
      provider,
      username: '',
      bio: '',
      photoUrl: '',
      profileComplete: false,
      createdAt: new Date().toISOString(),
    }

    if (!existingAccount) setAccounts([providerAccount, ...accounts])
    finishAuth({
      nextRole: role,
      nextEmail: providerEmail,
      nextName: name,
      provider,
      account: providerAccount,
    })
  }

  function handleAdminSignIn(event) {
    event.preventDefault()
    const nextEmail = adminEmail.trim().toLowerCase()
    if (!nextEmail || !adminPassword) {
      setAdminMessage('Enter admin email and password.')
      return
    }
    onLogin({
      id: createStableUserId({ email: nextEmail, role: 'admin' }),
      name: nameFromEmail(nextEmail, 'Admin'),
      email: nextEmail,
      role: 'admin',
      authProvider: 'admin-email',
      course: 'IGCSE Chemistry CIE',
      signedInAt: new Date().toISOString(),
    })
  }

  if (showAdminLogin) {
    return (
      <main className="login-page admin-auth-page">
        <section className="admin-auth-shell">
          <form className="login-card admin-login-card admin-login-full" onSubmit={handleAdminSignIn}>
            <div className="login-card-title">
              <span className="brand-icon"><ShieldCheck size={24} /></span>
              <div>
                <p className="eyebrow">Sep Chem Academy</p>
                <h2>Admin sign in</h2>
                <p>Restricted platform access for course catalogue and classroom oversight.</p>
              </div>
            </div>
            <div className="admin-security-note">
              <LockKeyhole size={19} />
              <span>Admin access is separate from student and teacher accounts.</span>
            </div>
            <div className="input-grid login-fields">
              <label className="field">
                <span>Admin email</span>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={event => setAdminEmail(event.target.value)}
                  placeholder="admin@sepchemacademy.com"
                />
              </label>
              <label className="field">
                <span>Admin password</span>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={event => setAdminPassword(event.target.value)}
                  placeholder="Admin password"
                />
              </label>
            </div>
            <button className="btn primary login-submit" type="submit">
              <KeyRound size={18} /> Sign in as admin
            </button>
            {adminMessage && <div className="auth-message">{adminMessage}</div>}
            <button className="auth-link-button" type="button" onClick={() => setShowAdminLogin(false)}>
              Back to student and teacher sign in
            </button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <main className="login-page">
      <section className="login-hero auth-hero">
        <div className="auth-intro">
          <div className="auth-brand-mark">
            <span className="brand-icon"><BookOpen size={26} /></span>
            <strong>Sep Chem Academy</strong>
          </div>
          <p className="eyebrow">Built for chemistry classrooms</p>
          <h1>One calm place for classes, resources, and exam progress.</h1>
          <p>
            Teachers create classes and share resources. Students join with class codes,
            complete assignments, ask for help, and track feedback without course and class
            workflows getting mixed together.
          </p>
          <div className="auth-marketing-grid">
            <div>
              <strong>Course resources</strong>
              <span>IGCSE, AS, and A2 Chemistry content stays available as shared learning material.</span>
            </div>
            <div>
              <strong>Teacher classrooms</strong>
              <span>Create classes, enroll learners, assign work, and add external resources.</span>
            </div>
            <div>
              <strong>Student focus</strong>
              <span>See joined classes, priorities, feedback, help requests, and class resources.</span>
            </div>
          </div>
          <div className="auth-proof-strip">
            <span>IGCSE CIE</span>
            <span>AS Chemistry</span>
            <span>A2 Chemistry</span>
          </div>
        </div>

        <div className="auth-card-stack">
          <form className="login-card" onSubmit={handleEmailAuth}>
            <div className="login-card-title">
              <span className="brand-icon"><LockKeyhole size={24} /></span>
              <div>
                <h2>Student and teacher access</h2>
                <p>{authMode === 'sign-in' ? 'Sign in to your dashboard' : 'Create a new learning account'}</p>
              </div>
            </div>

            <div className="auth-mode-toggle" aria-label="Sign in or sign up">
              <button
                className={authMode === 'sign-in' ? 'active' : ''}
                type="button"
                onClick={() => setAuthMode('sign-in')}
              >
                Sign in
              </button>
              <button
                className={authMode === 'sign-up' ? 'active' : ''}
                type="button"
                onClick={() => setAuthMode('sign-up')}
              >
                Sign up
              </button>
            </div>

            <div className="role-choice-grid account-type-grid">
              {accountTypes.map(option => {
                const Icon = option.icon
                return (
                  <button
                    className={`role-choice ${role === option.id ? 'active' : ''}`}
                    key={option.id}
                    type="button"
                    onClick={() => setRole(option.id)}
                  >
                    <Icon size={24} />
                    <strong>{option.label}</strong>
                    <small>{option.description}</small>
                  </button>
                )
              })}
            </div>

            <div className="auth-provider-grid">
              {providerOptions.map(provider => {
                return (
                  <button
                    className={`provider-button ${provider.id}`}
                    key={provider.id}
                    type="button"
                    onClick={() => handleProviderAuth(provider.id)}
                  >
                    <span className="provider-mark">{provider.mark}</span> Continue with {provider.label}
                  </button>
                )
              })}
            </div>

            <div className="auth-divider"><span>or use email</span></div>

            <div className="input-grid login-fields">
              {authMode === 'sign-up' && (
                <label className="field">
                  <span>Name</span>
                  <input
                    value={name}
                    onChange={event => setName(event.target.value)}
                    placeholder={role === 'teacher' ? 'Mr. Sep' : 'Student name'}
                  />
                </label>
              )}
              <label className="field">
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  placeholder={role === 'teacher' ? 'teacher@example.com' : 'student@example.com'}
                />
              </label>
              <label className="field">
                <span>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  placeholder="Password"
                />
              </label>
            </div>

            <button className="btn primary login-submit" type="submit">
              <Mail size={18} /> {authMode === 'sign-in' ? 'Sign in with email' : 'Create account'}
            </button>
            {authMessage && <div className="auth-message">{authMessage}</div>}
            <button className="auth-link-button" type="button" onClick={() => setShowAdminLogin(true)}>
              Admin access
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
