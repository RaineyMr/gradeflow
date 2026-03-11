import React, { useEffect, useMemo, useState } from 'react'
import Login from './pages/Login'
import Tutorials from './pages/Tutorials'
import Dashboard from './pages/Dashboard'
import StudentDashboard from './pages/StudentDashboard'
import ParentDashboard from './pages/ParentDashboard'
import AdminDashboard from './pages/AdminDashboard'

const defaultTheme = {
  primary: '#f97316',
  heroGradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
  border: '#1e2231',
  card: '#161923',
  muted: '#6b7494',
  soft: 'rgba(249,115,22,0.14)',
}

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [activePage, setActivePage] = useState('login')

  useEffect(() => {
    const savedUser = localStorage.getItem('gradeflow_user')
    if (!savedUser) return

    try {
      const parsed = JSON.parse(savedUser)
      if (parsed?.role) {
        setCurrentUser(parsed)
        setActivePage(parsed.role)
      }
    } catch (error) {
      localStorage.removeItem('gradeflow_user')
    }
  }, [])

  const roleTitle = useMemo(() => {
    if (!currentUser?.role) return 'Guest'
    return currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)
  }, [currentUser])

  const handleLogin = (account) => {
    if (!account?.role) {
      setCurrentUser(null)
      setActivePage('login')
      return
    }

    setCurrentUser(account)
    setActivePage(account.role)
    localStorage.setItem('gradeflow_user', JSON.stringify(account))
  }

  const handleLogout = () => {
    localStorage.removeItem('gradeflow_user')
    setCurrentUser(null)
    setActivePage('login')
  }

  const openTutorials = () => {
    setActivePage('tutorials')
  }

  const goToDashboard = () => {
    if (!currentUser?.role) {
      setActivePage('login')
      return
    }

    setActivePage(currentUser.role)
  }

  if (!currentUser || activePage === 'login') {
    return <Login onLogin={handleLogin} onDemoLogin={handleLogin} />
  }

  const theme = currentUser?.theme || defaultTheme

  return (
    <div style={{ minHeight: '100vh', background: '#060810', color: '#eef0f8' }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: 'rgba(6,8,16,0.92)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '14px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            fontFamily: 'Inter, Arial, sans-serif',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '14px',
                background: theme.soft,
                color: theme.primary,
                fontWeight: 800,
              }}
            >
              GradeFlow
            </div>

            <div>
              <div style={{ fontWeight: 800 }}>{currentUser.schoolName || 'GradeFlow Demo School'}</div>
              <div style={{ fontSize: '12px', color: theme.muted }}>
                {currentUser.userName || 'Demo User'} · {roleTitle}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={goToDashboard}
              style={{
                background: theme.soft,
                color: theme.primary,
                border: `1px solid ${theme.border}`,
                borderRadius: '12px',
                padding: '10px 14px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Dashboard
            </button>

            <button
              type="button"
              onClick={openTutorials}
              style={{
                background: '#161923',
                color: '#eef0f8',
                border: `1px solid ${theme.border}`,
                borderRadius: '12px',
                padding: '10px 14px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Tutorials
            </button>

            <button
              type="button"
              onClick={handleLogout}
              style={{
                background: theme.primary,
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 14px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {activePage === 'tutorials' && <Tutorials />}

      {activePage === 'teacher' && <Dashboard currentUser={currentUser} />}

      {activePage === 'student' && <StudentDashboard currentUser={currentUser} />}

      {activePage === 'parent' && <ParentDashboard currentUser={currentUser} />}

      {activePage === 'admin' && <AdminDashboard currentUser={currentUser} />}

      {!['tutorials', 'teacher', 'student', 'parent', 'admin'].includes(activePage) && (
        <div style={{ padding: '40px 24px', fontFamily: 'Inter, Arial, sans-serif' }}>
          <div
            style={{
              maxWidth: '900px',
              margin: '0 auto',
              background: '#161923',
              border: `1px solid ${theme.border}`,
              borderRadius: '20px',
              padding: '24px',
            }}
          >
            <h2 style={{ marginTop: 0 }}>Dashboard route not found</h2>
            <p style={{ color: theme.muted }}>
              The selected demo account did not map to a valid dashboard. Returning to login will fix it.
            </p>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                background: theme.primary,
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 14px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Return to Login
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
