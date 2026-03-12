import React, { useEffect, useRef, useState, useMemo } from 'react'
import Login from './pages/Login'
import Tutorials from './pages/Tutorials'
import Dashboard from './pages/Dashboard'
import StudentDashboard from './pages/StudentDashboard'
import ParentDashboard from './pages/ParentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Camera from './pages/Camera'
import { demoAccounts } from './lib/demoAccounts'

// ─── App Shell ────────────────────────────────────────────────────────────────
export default function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [activePage, setActivePage]   = useState('login')
  const [menuOpen, setMenuOpen]       = useState(false)
  const menuRef = useRef(null)
  const scrollRef = useRef(null)

  // Always start on login — no session restore
  // (remove the saved session if one exists from a prior visit)
  useEffect(() => {
    localStorage.removeItem('gradeflow_user')
  }, [])

  // Scroll-to-top on every page/user change
  useEffect(() => {
    window.scrollTo(0, 0)
    if (scrollRef.current) scrollRef.current.scrollTo(0, 0)
  }, [activePage, currentUser])

  // Close menu on outside click
  useEffect(() => {
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Auth handlers ────────────────────────────────────────────────────────────
  const handleLogin = (account) => {
    if (!account?.role) return
    setCurrentUser(account)
    setActivePage(account.role)
    localStorage.setItem('gradeflow_user', JSON.stringify(account))
  }

  const handleLogout = () => {
    localStorage.removeItem('gradeflow_user')
    setCurrentUser(null)
    setActivePage('login')
    setMenuOpen(false)
  }

  // ── Theme from current user ──────────────────────────────────────────────────
  const theme = useMemo(() => {
    if (!currentUser?.theme) return {
      primary: '#f97316', secondary: '#2563EB', heroGradient: 'linear-gradient(135deg,#f97316,#2563EB)',
      headerGradient: 'linear-gradient(135deg,#f97316,#2563EB)', border: '#1e2231', card: '#161923',
      muted: '#6b7494', soft: 'rgba(249,115,22,0.14)', navActive: '#f97316',
    }
    return currentUser.theme
  }, [currentUser])

  // Apply school color CSS var
  useEffect(() => {
    document.documentElement.style.setProperty('--school-color', theme.primary)
    document.documentElement.style.setProperty('--school-secondary', theme.secondary || theme.primary)
  }, [theme])

  // ── Login screen ─────────────────────────────────────────────────────────────
  if (!currentUser || activePage === 'login') {
    return <Login onLogin={handleLogin} onDemoLogin={handleLogin} />
  }

  // ── Nav items for dropdown ───────────────────────────────────────────────────
  const dropdownSections = [
    {
      label: 'Account',
      items: [
        { icon: '👤', label: 'Profile & Settings', action: () => { setMenuOpen(false); alert('Profile settings — coming soon') } },
        { icon: '🔄', label: 'Switch Account',     action: handleLogout },
      ],
    },
    {
      label: 'App',
      items: [
        { icon: '🎥', label: 'Tutorials',           action: () => { setActivePage('tutorials'); setMenuOpen(false) } },
        { icon: '🏠', label: 'Dashboard',           action: () => { setActivePage(currentUser.role); setMenuOpen(false) } },
      ],
    },
    {
      label: 'Pages',
      items: currentUser.role === 'teacher' ? [
        { icon: '📚', label: 'Gradebook',       action: () => { setMenuOpen(false) } },
        { icon: '📋', label: 'Lesson Plans',    action: () => { setMenuOpen(false) } },
        { icon: '💬', label: 'Messages',        action: () => { setMenuOpen(false) } },
        { icon: '📊', label: 'Reports',         action: () => { setMenuOpen(false) } },
        { icon: '🧪', label: 'Testing Suite',   action: () => { setMenuOpen(false) } },
        { icon: '📢', label: 'Class Feed',      action: () => { setMenuOpen(false) } },
      ] : [],
    },
    {
      label: '',
      items: [
        { icon: '🚪', label: 'Sign Out', action: handleLogout, danger: true },
      ],
    },
  ]

  // ── Role label ───────────────────────────────────────────────────────────────
  const roleLabel = { teacher: 'Teacher', student: 'Student', parent: 'Parent', admin: 'Admin' }[currentUser.role] || 'User'

  // ── Camera icon click ────────────────────────────────────────────────────────
  const handleCameraClick = () => {
    setActivePage('camera')
    setMenuOpen(false)
  }

  // ── Tutorials ────────────────────────────────────────────────────────────────
  if (activePage === 'tutorials') {
    return (
      <div style={{ minHeight: '100vh', background: '#060810' }}>
        <StickyHeader
          currentUser={currentUser}
          theme={theme}
          roleLabel={roleLabel}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          menuRef={menuRef}
          dropdownSections={dropdownSections}
          onCameraClick={handleCameraClick}
        />
        <div style={{ paddingTop: 64 }}>
          <Tutorials />
        </div>
      </div>
    )
  }

  // ── Camera ───────────────────────────────────────────────────────────────────
  if (activePage === 'camera') {
    return (
      <div style={{ minHeight: '100vh', background: '#060810' }}>
        <StickyHeader
          currentUser={currentUser}
          theme={theme}
          roleLabel={roleLabel}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          menuRef={menuRef}
          dropdownSections={dropdownSections}
          onCameraClick={handleCameraClick}
        />
        <div style={{ paddingTop: 64 }}>
          <Camera onBack={() => setActivePage(currentUser.role)} />
        </div>
      </div>
    )
  }

  // ── Role dashboards ──────────────────────────────────────────────────────────
  const dashboardMap = {
    teacher: <Dashboard currentUser={currentUser} onCameraClick={handleCameraClick} />,
    student: <StudentDashboard currentUser={currentUser} />,
    parent:  <ParentDashboard currentUser={currentUser} />,
    admin:   <AdminDashboard currentUser={currentUser} />,
  }

  const DashboardComponent = dashboardMap[currentUser.role]

  return (
    <div
      data-app-scroll
      ref={scrollRef}
      style={{
        minHeight: '100vh',
        background: '#060810',
        color: '#eef0f8',
        overflowX: 'hidden',
      }}
    >
      <StickyHeader
        currentUser={currentUser}
        theme={theme}
        roleLabel={roleLabel}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        menuRef={menuRef}
        dropdownSections={dropdownSections}
        onCameraClick={handleCameraClick}
      />
      <div style={{ paddingTop: 64 }}>
        {DashboardComponent || (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: '#6b7494' }}>
            <p>No dashboard found for role: {currentUser.role}</p>
            <button onClick={handleLogout} style={{ marginTop: 16, padding: '10px 24px', borderRadius: 12, background: theme.primary, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sticky Header ────────────────────────────────────────────────────────────
function StickyHeader({ currentUser, theme, roleLabel, menuOpen, setMenuOpen, menuRef, dropdownSections, onCameraClick }) {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 1000,
        height: 64,
        background: `rgba(6,8,16,0.96)`,
        borderBottom: `1px solid ${theme.border || '#1e2231'}`,
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        fontFamily: 'Inter, Arial, sans-serif',
      }}
    >
      {/* Left: school badge + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          padding: '6px 12px',
          borderRadius: 12,
          background: theme.soft || 'rgba(249,115,22,0.14)',
          color: theme.primary,
          fontWeight: 800,
          fontSize: 14,
        }}>
          ⚡ GradeFlow
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 800, fontSize: 13, color: '#eef0f8', lineHeight: 1.2 }}>
            {currentUser.schoolName}
          </span>
          <span style={{ fontSize: 10, color: theme.muted || '#6b7494' }}>
            {currentUser.userName} · {roleLabel}
          </span>
        </div>
      </div>

      {/* Right: camera + hamburger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Camera icon */}
        <button
          onClick={onCameraClick}
          style={{
            width: 38, height: 38, borderRadius: '50%',
            background: theme.soft || 'rgba(249,115,22,0.14)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}
          title="Camera"
        >
          📷
        </button>

        {/* Hamburger */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{
              width: 38, height: 38, borderRadius: 10,
              background: menuOpen ? (theme.soft || 'rgba(249,115,22,0.14)') : '#1e2231',
              border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}
            title="Menu"
            aria-label="Open menu"
          >
            {[0,1,2].map(i => (
              <span key={i} style={{ display: 'block', width: 16, height: 2, background: menuOpen ? theme.primary : '#eef0f8', borderRadius: 2 }} />
            ))}
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 998 }}
                onClick={() => setMenuOpen(false)}
              />
              <div
                style={{
                  position: 'absolute', top: 44, right: 0,
                  width: 220,
                  background: '#161923',
                  border: `1px solid ${theme.border || '#1e2231'}`,
                  borderRadius: 16,
                  boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                  zIndex: 999,
                  overflow: 'hidden',
                }}
              >
                {/* User info */}
                <div style={{ padding: '14px 16px', borderBottom: `1px solid #1e2231`, background: theme.soft || '#1e2231' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#eef0f8' }}>{currentUser.userName}</div>
                  <div style={{ fontSize: 11, color: theme.muted || '#6b7494' }}>{currentUser.schoolName} · {roleLabel}</div>
                </div>

                {dropdownSections.map((section, si) => (
                  <div key={si}>
                    {section.label && (
                      <div style={{ padding: '8px 16px 4px', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3d4460' }}>
                        {section.label}
                      </div>
                    )}
                    {section.items.map((item, ii) => (
                      <button
                        key={ii}
                        onClick={item.action}
                        style={{
                          width: '100%', textAlign: 'left',
                          padding: '10px 16px',
                          background: 'transparent',
                          border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 10,
                          fontSize: 13, color: item.danger ? '#f04a4a' : '#eef0f8',
                          fontFamily: 'Inter, Arial, sans-serif',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#1e2231'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                    {si < dropdownSections.length - 1 && (
                      <div style={{ height: 1, background: '#1e2231', margin: '4px 0' }} />
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
