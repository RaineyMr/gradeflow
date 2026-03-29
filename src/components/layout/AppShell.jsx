import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useStore } from '../../lib/store'
import { useT } from '../../lib/i18n'
import { GradebookSyncButton } from '../GradebookSyncButton.jsx'

const ROLE_LABELS = {
  teacher: 'Teacher',
  student: 'Student',
  parent:  'Parent',
  admin:   'Admin',
}

// Pages available per role in the hamburger dropdown
const PAGES_BY_ROLE = {
  teacher: [
    { icon: '📚', label: 'Gradebook',     path: '/teacher/gradebook'    },
    { icon: '📋', label: 'Lesson Plans',  path: '/teacher/lessons'      },
    { icon: '💬', label: 'Messages',      path: '/teacher/messages'     },
    { icon: '📊', label: 'Reports',       path: '/teacher/reports'      },
    { icon: '🧪', label: 'Testing Suite', path: '/teacher/testing'      },
    { icon: '📢', label: 'Class Feed',    path: '/teacher/feed'         },
    { icon: '🔗', label: 'Integrations',  path: '/teacher/integrations' },
  ],
  student: [
    { icon: '💬', label: 'Messages',  path: '/student/messages' },
    { icon: '📢', label: 'Class Feed', path: '/student/feed'    },
  ],
  parent: [
    { icon: '💬', label: 'Messages', path: '/parent/messages' },
  ],
  admin: [
    { icon: '📊', label: 'Reports',    path: '/admin/reports'   },
    { icon: '💬', label: 'Messages',   path: '/admin/messages'  },
    { icon: '📢', label: 'Class Feed', path: '/admin/feed'      },
  ],
}

export default function AppShell() {
  const navigate = useNavigate()
  const t = useT()
  const { currentUser, setCurrentUser, setLang } = useStore()

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  // Derive theme; fall back to GradeFlow orange/blue if no school theme
  const theme = useMemo(() => currentUser?.theme ?? {
    primary:   '#f97316',
    secondary: '#2563EB',
    border:    '#1e2231',
    muted:     '#6b7494',
    soft:      'rgba(249,115,22,0.14)',
  }, [currentUser])

  if (!currentUser) return null

  const isEs       = (currentUser.lang || 'en') === 'es'
  const roleLabel  = ROLE_LABELS[currentUser.role] ?? 'User'
  const rolePages  = PAGES_BY_ROLE[currentUser.role] ?? []
  const roleHomePath = currentUser.role === 'admin' ? '/admin' : `/${currentUser.role}`

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleLogout() {
    localStorage.removeItem('gradeflow_user')
    setCurrentUser(null)
    setMenuOpen(false)
    navigate('/login', { replace: true })
  }

  function handleToggleLang() {
    const newLang = isEs ? 'en' : 'es'
    const updated = { ...currentUser, lang: newLang }
    setCurrentUser(updated)
    setLang(newLang)
    localStorage.setItem('gradeflow_user', JSON.stringify(updated))
    document.documentElement.lang = newLang
  }

  function goTo(path) {
    navigate(path)
    setMenuOpen(false)
  }

  function homeClick() {
    const role = currentUser?.role || 'teacher'
    const homePath = role === 'admin' ? '/admin' : `/${role}`
    setMenuOpen(false)

    if (window.location.pathname === homePath) {
      // already at home path: trigger app-level home reset rather than full reload
      window.dispatchEvent(new Event('gradeflow-home'))
      return
    }

    navigate(homePath)
  }

  // ── Dropdown sections ─────────────────────────────────────────────────────

  const dropdownSections = [
    {
      label: t('account_section'),
      items: [
        { icon: '👤', label: t('profile_settings'),                          action: () => goTo('/profile') },
        { icon: '🔄', label: t('switch_account'),                            action: handleLogout },
        { icon: isEs ? '🇺🇸' : '🇲🇽',
          label: isEs ? 'Switch to English' : 'Cambiar a Español',
          action: handleToggleLang },
      ],
    },
    {
      label: t('app_section'),
      items: [
        { icon: '🎥', label: t('tutorials_menu'), action: () => goTo('/tutorials') },
        { icon: '🧩', label: 'Widgets', action: () => goTo(`/${currentUser.role}/widgets`) },
        { icon: '🏠', label: t('dashboard_menu'), action: () => goTo(`/${currentUser.role}`) },
      ],
    },
    {
      label: t('pages_section'),
      items: rolePages.map(({ icon, label, path }) => ({
        icon, label, action: () => goTo(path),
      })),
    },
    {
      label: '',
      items: [{ icon: '🚪', label: t('sign_out'), action: handleLogout, danger: true }],
    },
  ]

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: '#060810', color: '#eef0f8', overflowX: 'hidden' }}>

      {/* ── Sticky header ────────────────────────────────────────────────── */}
      <header style={{
        position:       'fixed',
        top:            0,
        left:           0,
        right:          0,
        zIndex:         1000,
        height:         64,
        background:     'rgba(6,8,16,0.96)',
        borderBottom:   `1px solid ${theme.border ?? '#1e2231'}`,
        backdropFilter: 'blur(12px)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '0 16px',
        fontFamily:     'Inter, Arial, sans-serif',
      }}>

        {/* Left: GradeFlow home + school name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={homeClick}
            title="Go to home dashboard"
            type="button"
            style={{
              fontSize: 13,
              fontWeight: 900,
              color: '#eef0f8',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 6px',
              borderRadius: 8,
              textAlign: 'left',
            }}
          >
            ⚡ GradeFlow
          </button>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 800, fontSize: 13, color: '#eef0f8', lineHeight: 1.2 }}>
              {currentUser.schoolName}
            </span>
            <span style={{ fontSize: 10, color: theme.muted ?? '#6b7494' }}>
              {currentUser.userName} · {roleLabel}
            </span>
          </div>
        </div>

        {/* Right: lang toggle + camera + hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* Language pill */}
          <button
            onClick={handleToggleLang}
            title={isEs ? 'Switch to English' : 'Cambiar a Español'}
            style={{
              padding:      '5px 10px',
              borderRadius: 999,
              background:   isEs ? 'rgba(249,115,22,0.18)' : 'rgba(37,99,235,0.18)',
              color:        isEs ? theme.primary : '#2563EB',
              border:       `1px solid ${isEs ? (theme.primary + '50') : '#2563EB50'}`,
              fontSize:     11,
              fontWeight:   800,
              cursor:       'pointer',
              letterSpacing:'0.03em',
            }}
          >
            {isEs ? '🇺🇸 EN' : '🇲🇽 ES'}
          </button>

          {/* Camera button */}
          <button
            onClick={homeClick}
            title="Go to home dashboard"
            type="button"
            style={{
              width:        38,
              height:       38,
              borderRadius: '50%',
              background:   theme.soft ?? 'rgba(249,115,22,0.14)',
              border:       'none',
              cursor:       'pointer',
              display:      'flex',
              alignItems:   'center',
              justifyContent:'center',
              fontSize:     18,
            }}
          >
            📷
          </button>

          {/* Sync button */}
          <GradebookSyncButton />

          {/* Hamburger menu */}
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Open menu"
              style={{
                width:        38,
                height:       38,
                borderRadius: 10,
                background:   menuOpen ? (theme.soft ?? 'rgba(249,115,22,0.14)') : '#1e2231',
                border:       'none',
                cursor:       'pointer',
                display:      'flex',
                flexDirection:'column',
                alignItems:   'center',
                justifyContent:'center',
                gap:          4,
              }}
            >
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  display:      'block',
                  width:        16,
                  height:       2,
                  background:   menuOpen ? theme.primary : '#eef0f8',
                  borderRadius: 2,
                }} />
              ))}
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <>
                {/* Click-away backdrop */}
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 998 }}
                  onClick={() => setMenuOpen(false)}
                />

                <div style={{
                  position:   'absolute',
                  top:        44,
                  right:      0,
                  width:      224,
                  background: '#161923',
                  border:     `1px solid ${theme.border ?? '#1e2231'}`,
                  borderRadius: 16,
                  boxShadow:  '0 16px 40px rgba(0,0,0,0.5)',
                  zIndex:     999,
                  maxHeight:  '62vh',
                  overflow:   'auto',
                  WebkitOverflowScrolling: 'touch',
                }}>

                  {/* User info */}
                  <div style={{
                    padding:      '14px 16px',
                    borderBottom: '1px solid #1e2231',
                    background:   theme.soft ?? '#1e2231',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#eef0f8' }}>
                      {currentUser.userName}
                    </div>
                    <div style={{ fontSize: 11, color: theme.muted ?? '#6b7494' }}>
                      {currentUser.schoolName} · {roleLabel}
                    </div>
                    <div style={{
                      marginTop:   6,
                      display:     'inline-flex',
                      alignItems:  'center',
                      gap:         4,
                      background:  isEs ? 'rgba(249,115,22,0.12)' : 'rgba(37,99,235,0.12)',
                      borderRadius:999,
                      padding:     '2px 8px',
                    }}>
                      <span style={{ fontSize: 11 }}>{isEs ? '🇲🇽' : '🇺🇸'}</span>
                      <span style={{
                        fontSize:   10,
                        fontWeight: 700,
                        color:      isEs ? theme.primary : '#2563EB',
                      }}>
                        {isEs ? 'Español activo' : 'English active'}
                      </span>
                    </div>
                  </div>

                  {/* Menu sections */}
                  {dropdownSections.map((section, si) => (
                    <div key={si}>
                      {section.label && (
                        <div style={{
                          padding:       '8px 16px 4px',
                          fontSize:      9,
                          fontWeight:    700,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color:         '#3d4460',
                        }}>
                          {section.label}
                        </div>
                      )}

                      {section.items.map((item, ii) => (
                        <button
                          key={ii}
                          onClick={item.action}
                          style={{
                            width:      '100%',
                            textAlign:  'left',
                            padding:    '10px 16px',
                            background: 'transparent',
                            border:     'none',
                            cursor:     'pointer',
                            display:    'flex',
                            alignItems: 'center',
                            gap:        10,
                            fontSize:   13,
                            color:      item.danger ? '#f04a4a' : '#eef0f8',
                            fontFamily: 'Inter, Arial, sans-serif',
                            transition: 'background 0.1s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#1e2231' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
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

      {/* ── Page content ─────────────────────────────────────────────────── */}
      <main style={{ paddingTop: 64 }}>
        <Outlet />
      </main>
    </div>
  )
}
