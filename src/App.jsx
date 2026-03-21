import React, { useEffect, useRef, useState, useMemo } from 'react'
import Login from './pages/Login'
import Tutorials from './pages/Tutorials'
import Dashboard from './pages/Dashboard'
import StudentDashboard from './pages/StudentDashboard'
import ParentDashboard from './pages/ParentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Camera from './pages/Camera'
import Gradebook from './pages/Gradebook'
import LessonPlan from './pages/LessonPlan'
import Reports from './pages/Reports'
import { demoAccounts } from './lib/demoAccounts'

// ─── App Shell ────────────────────────────────────────────────────────────────
export default function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [activePage, setActivePage]   = useState('login')
  const [menuOpen, setMenuOpen]       = useState(false)
  const menuRef  = useRef(null)
  const scrollRef = useRef(null)

  // Always start on login — no session restore
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
      primary: '#f97316', secondary: '#2563EB',
      heroGradient: 'linear-gradient(135deg,#f97316,#2563EB)',
      headerGradient: 'linear-gradient(135deg,#f97316,#2563EB)',
      border: '#1e2231', card: '#161923',
      muted: '#6b7494', soft: 'rgba(249,115,22,0.14)', navActive: '#f97316',
    }
    return currentUser.theme
  }, [currentUser])

  // Apply school color CSS vars
  useEffect(() => {
    document.documentElement.style.setProperty('--school-color', theme.primary)
    document.documentElement.style.setProperty('--school-secondary', theme.secondary || theme.primary)
  }, [theme])

  // ── Login screen ─────────────────────────────────────────────────────────────
  if (!currentUser || activePage === 'login') {
    return <Login onLogin={handleLogin} onDemoLogin={handleLogin} />
  }

  // ── Navigate helper (passed to dashboards) ───────────────────────────────────
  const navigate = (page) => setActivePage(page)
  const goBack   = () => setActivePage(currentUser.role)

  // ── Role label ───────────────────────────────────────────────────────────────
  const roleLabel = {
    teacher: 'Teacher', student: 'Student', parent: 'Parent', admin: 'Admin',
  }[currentUser.role] || 'User'

  // ── Camera click ─────────────────────────────────────────────────────────────
  const handleCameraClick = () => {
    setActivePage('camera')
    setMenuOpen(false)
  }

  // ── Pages nav items by role ──────────────────────────────────────────────────
  const pagesByRole = {
    teacher: [
      { icon: '📚', label: 'Gradebook',     page: 'gradebook'    },
      { icon: '📋', label: 'Lesson Plans',  page: 'lessonplan'   },
      { icon: '💬', label: 'Messages',      page: 'messages'     },
      { icon: '📊', label: 'Reports',       page: 'reports'      },
      { icon: '🧪', label: 'Testing Suite', page: 'testingsuite' },
      { icon: '📢', label: 'Class Feed',    page: 'classfeed'    },
    ],
    student: [
      { icon: '📚', label: 'Grades',        page: 'grades'       },
      { icon: '📋', label: 'Assignments',   page: 'assignments'  },
      { icon: '💬', label: 'Messages',      page: 'messages'     },
      { icon: '📢', label: 'Class Feed',    page: 'classfeed'    },
    ],
    parent: [
      { icon: '📊', label: 'Progress',      page: 'progress'     },
      { icon: '💬', label: 'Messages',      page: 'messages'     },
      { icon: '🔔', label: 'Alerts',        page: 'alerts'       },
    ],
    admin: [
      { icon: '📊', label: 'Reports',       page: 'reports'      },
      { icon: '👥', label: 'Staff',         page: 'staff'        },
      { icon: '🏫', label: 'Class Feed',    page: 'classfeed'    },
    ],
  }

  // ── Dropdown sections ────────────────────────────────────────────────────────
  const dropdownSections = [
    {
      label: 'Account',
      items: [
        {
          icon: '👤',
          label: 'Profile & Settings',
          action: () => { setActivePage('profile'); setMenuOpen(false) },
        },
        {
          icon: '🔄',
          label: 'Switch Account',
          action: handleLogout,
        },
      ],
    },
    {
      label: 'App',
      items: [
        {
          icon: '🎥',
          label: 'Tutorials',
          action: () => { setActivePage('tutorials'); setMenuOpen(false) },
        },
        {
          icon: '🏠',
          label: 'Dashboard',
          action: () => { setActivePage(currentUser.role); setMenuOpen(false) },
        },
      ],
    },
    {
      label: 'Pages',
      items: (pagesByRole[currentUser.role] || []).map(({ icon, label, page }) => ({
        icon,
        label,
        action: () => { setActivePage(page); setMenuOpen(false) },
      })),
    },
    {
      label: '',
      items: [
        { icon: '🚪', label: 'Sign Out', action: handleLogout, danger: true },
      ],
    },
  ]

  // ── Shared header props ───────────────────────────────────────────────────────
  const headerProps = {
    currentUser,
    theme,
    roleLabel,
    menuOpen,
    setMenuOpen,
    menuRef,
    dropdownSections,
    onCameraClick: handleCameraClick,
  }

  // ── Tutorials ────────────────────────────────────────────────────────────────
  if (activePage === 'tutorials') {
    return (
      <div style={{ minHeight: '100vh', background: '#060810' }}>
        <StickyHeader {...headerProps} />
        <div style={{ paddingTop: 64 }}>
          <Tutorials onBack={goBack} />
        </div>
      </div>
    )
  }

  // ── Camera ───────────────────────────────────────────────────────────────────
  if (activePage === 'camera') {
    return (
      <div style={{ minHeight: '100vh', background: '#060810' }}>
        <StickyHeader {...headerProps} />
        <div style={{ paddingTop: 64 }}>
          <Camera currentUser={currentUser} onBack={goBack} />
        </div>
      </div>
    )
  }

  // ── Profile & Settings ───────────────────────────────────────────────────────
  if (activePage === 'profile') {
    return (
      <div style={{ minHeight: '100vh', background: '#060810', color: '#eef0f8' }}>
        <StickyHeader {...headerProps} />
        <div style={{ paddingTop: 64 }}>
          <ProfileSettings currentUser={currentUser} theme={theme} onBack={goBack} />
        </div>
      </div>
    )
  }

  // ── Gradebook ────────────────────────────────────────────────────────────────
  if (activePage === 'gradebook') {
    return (
      <div style={{ minHeight: '100vh', background: '#060810' }}>
        <StickyHeader {...headerProps} />
        <div style={{ paddingTop: 64 }}>
          <Gradebook currentUser={currentUser} onBack={goBack} />
        </div>
      </div>
    )
  }

  // ── Lesson Plan ──────────────────────────────────────────────────────────────
  if (activePage === 'lessonplan') {
    return (
      <div style={{ minHeight: '100vh', background: '#060810' }}>
        <StickyHeader {...headerProps} />
        <div style={{ paddingTop: 64 }}>
          <LessonPlan currentUser={currentUser} onBack={goBack} />
        </div>
      </div>
    )
  }

  // ── Reports ──────────────────────────────────────────────────────────────────
  if (activePage === 'reports') {
    return (
      <div style={{ minHeight: '100vh', background: '#060810' }}>
        <StickyHeader {...headerProps} />
        <div style={{ paddingTop: 64 }}>
          <Reports currentUser={currentUser} onBack={goBack} />
        </div>
      </div>
    )
  }

  // ── Generic sub-pages (Messages, Feed, Testing, Alerts, Profile pages etc.) ──
  // These render a placeholder if the full page component isn't imported yet.
  // Replace each placeholder with the real import as pages are built.
  const genericSubPages = [
    'messages', 'testingsuite', 'classfeed', 'grades',
    'assignments', 'progress', 'alerts', 'staff',
  ]

  if (genericSubPages.includes(activePage)) {
    return (
      <div style={{ minHeight: '100vh', background: '#060810', color: '#eef0f8' }}>
        <StickyHeader {...headerProps} />
        <div style={{ paddingTop: 64 }}>
          <SubPagePlaceholder
            page={activePage}
            theme={theme}
            currentUser={currentUser}
            onBack={goBack}
            onNavigate={navigate}
          />
        </div>
      </div>
    )
  }

  // ── Role dashboards ──────────────────────────────────────────────────────────
  const dashboardMap = {
    teacher: <Dashboard     currentUser={currentUser} onCameraClick={handleCameraClick} onNavigate={navigate} />,
    student: <StudentDashboard currentUser={currentUser} onNavigate={navigate} />,
    parent:  <ParentDashboard  currentUser={currentUser} onNavigate={navigate} />,
    admin:   <AdminDashboard   currentUser={currentUser} onNavigate={navigate} />,
  }

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
      <StickyHeader {...headerProps} />
      <div style={{ paddingTop: 64 }}>
        {dashboardMap[currentUser.role] || (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: '#6b7494' }}>
            <p>No dashboard found for role: {currentUser.role}</p>
            <button
              onClick={handleLogout}
              style={{
                marginTop: 16, padding: '10px 24px', borderRadius: 12,
                background: theme.primary, color: '#fff', border: 'none',
                cursor: 'pointer', fontWeight: 700,
              }}
            >
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
        background: 'rgba(6,8,16,0.96)',
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
            {[0, 1, 2].map(i => (
              <span
                key={i}
                style={{
                  display: 'block', width: 16, height: 2,
                  background: menuOpen ? theme.primary : '#eef0f8',
                  borderRadius: 2,
                }}
              />
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
                <div style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid #1e2231',
                  background: theme.soft || '#1e2231',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#eef0f8' }}>{currentUser.userName}</div>
                  <div style={{ fontSize: 11, color: theme.muted || '#6b7494' }}>{currentUser.schoolName} · {roleLabel}</div>
                </div>

                {dropdownSections.map((section, si) => (
                  <div key={si}>
                    {section.label && (
                      <div style={{
                        padding: '8px 16px 4px',
                        fontSize: 9, fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: '#3d4460',
                      }}>
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
                          fontSize: 13,
                          color: item.danger ? '#f04a4a' : '#eef0f8',
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

// ─── Profile & Settings Page ──────────────────────────────────────────────────
function ProfileSettings({ currentUser, theme, onBack }) {
  return (
    <div style={{ padding: '32px 20px', maxWidth: 520, margin: '0 auto', fontFamily: 'Inter, Arial, sans-serif' }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'none', border: 'none', cursor: 'pointer',
          color: theme.muted || '#6b7494', fontSize: 13, marginBottom: 24, padding: 0,
        }}
      >
        ← Back to Dashboard
      </button>

      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#eef0f8', marginBottom: 6 }}>
        Profile & Settings
      </h1>
      <p style={{ fontSize: 13, color: theme.muted || '#6b7494', marginBottom: 32 }}>
        Manage your account and preferences
      </p>

      {/* Profile card */}
      <div style={{
        background: '#161923',
        border: `1px solid ${theme.border || '#1e2231'}`,
        borderRadius: 16, padding: 24, marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: theme.soft || 'rgba(249,115,22,0.14)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24,
          }}>
            👤
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#eef0f8' }}>{currentUser.userName}</div>
            <div style={{ fontSize: 12, color: theme.muted || '#6b7494' }}>
              {currentUser.schoolName} · {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
            </div>
          </div>
        </div>

        {[
          { label: 'Name',   value: currentUser.userName   },
          { label: 'School', value: currentUser.schoolName },
          { label: 'Role',   value: currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) },
          { label: 'Email',  value: currentUser.email || 'Not set' },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 0',
              borderBottom: `1px solid ${theme.border || '#1e2231'}`,
            }}
          >
            <span style={{ fontSize: 13, color: theme.muted || '#6b7494' }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#eef0f8' }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Coming soon notice */}
      <div style={{
        background: theme.soft || 'rgba(249,115,22,0.08)',
        border: `1px solid ${theme.primary}33`,
        borderRadius: 12, padding: '14px 18px',
        fontSize: 13, color: theme.muted || '#6b7494',
        textAlign: 'center',
      }}>
        ✏️ Full profile editing coming soon
      </div>
    </div>
  )
}

// ─── Sub-page Placeholder ─────────────────────────────────────────────────────
// Shown for pages that exist in the nav but don't have a full component yet.
// Replace with the real import once the page is built.
function SubPagePlaceholder({ page, theme, currentUser, onBack, onNavigate }) {
  const pageLabels = {
    messages:    { icon: '💬', label: 'Messages'     },
    testingsuite:{ icon: '🧪', label: 'Testing Suite'},
    classfeed:   { icon: '📢', label: 'Class Feed'   },
    grades:      { icon: '📚', label: 'Grades'       },
    assignments: { icon: '📋', label: 'Assignments'  },
    progress:    { icon: '📊', label: 'Progress'     },
    alerts:      { icon: '🔔', label: 'Alerts'       },
    staff:       { icon: '👥', label: 'Staff'        },
  }

  const info = pageLabels[page] || { icon: '📄', label: page }

  return (
    <div style={{
      padding: '32px 20px', maxWidth: 520, margin: '0 auto',
      fontFamily: 'Inter, Arial, sans-serif',
    }}>
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'none', border: 'none', cursor: 'pointer',
          color: theme.muted || '#6b7494', fontSize: 13, marginBottom: 24, padding: 0,
        }}
      >
        ← Back to Dashboard
      </button>

      <div style={{
        background: '#161923',
        border: `1px solid ${theme.border || '#1e2231'}`,
        borderRadius: 20, padding: '48px 32px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{info.icon}</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#eef0f8', marginBottom: 8 }}>
          {info.label}
        </h2>
        <p style={{ fontSize: 13, color: theme.muted || '#6b7494', marginBottom: 0 }}>
          This page is being built. Check back soon.
        </p>
      </div>
    </div>
  )
}
