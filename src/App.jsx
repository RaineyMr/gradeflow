import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
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
import ClassFeed from './pages/ClassFeed'
import { useStore } from './lib/store'
import { useT } from './lib/i18n'

export default function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [activePage, setActivePage] = useState('login')
  const [menuOpen, setMenuOpen] = useState(false)

  const menuRef = useRef(null)
  const scrollRef = useRef(null)

  const loadFromDB = useStore(s => s.loadFromDB)
  const setLang = useStore(s => s.setLang)
  const storeSetUser = useStore(s => s.setCurrentUser)

  useEffect(() => { localStorage.removeItem('gradeflow_user') }, [])
  useEffect(() => { loadFromDB() }, [loadFromDB])

  useEffect(() => {
    window.scrollTo(0, 0)
    scrollRef.current?.scrollTo(0, 0)
  }, [activePage, currentUser])

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const navigate = useCallback((page) => setActivePage(page), [])
  const goBack = useCallback(() => setActivePage(currentUser?.role), [currentUser])

  const handleLogin = (account) => {
    if (!account?.role) return
    setCurrentUser(account)
    storeSetUser(account)
    setLang(account.lang || 'en')
    setActivePage(account.role)
    localStorage.setItem('gradeflow_user', JSON.stringify(account))
    document.documentElement.lang = account.lang || 'en'
  }

  const handleLogout = () => {
    localStorage.removeItem('gradeflow_user')
    setCurrentUser(null)
    setActivePage('login')
    setMenuOpen(false)
  }

  const toggleLang = () => {
    const newLang = (currentUser?.lang || 'en') === 'en' ? 'es' : 'en'
    const updated = { ...currentUser, lang: newLang }
    setCurrentUser(updated)
    storeSetUser(updated)
    setLang(newLang)
    localStorage.setItem('gradeflow_user', JSON.stringify(updated))
    document.documentElement.lang = newLang
  }

  const theme = useMemo(() => {
    if (!currentUser?.theme) {
      return {
        primary: '#f97316',
        secondary: '#2563EB',
        border: '#1e2231',
        card: '#161923',
        muted: '#6b7494',
        soft: 'rgba(249,115,22,0.14)',
      }
    }
    return currentUser.theme
  }, [currentUser])

  useEffect(() => {
    document.documentElement.style.setProperty('--school-color', theme.primary)
    document.documentElement.style.setProperty('--school-secondary', theme.secondary || theme.primary)
  }, [theme])

  const dashboard = useMemo(() => {
    if (!currentUser) return null

    const dashboards = {
      teacher: <Dashboard currentUser={currentUser} onNavigate={navigate} />,
      student: <StudentDashboard currentUser={currentUser} onNavigate={navigate} />,
      parent: <ParentDashboard currentUser={currentUser} onNavigate={navigate} />,
      admin: <AdminDashboard currentUser={currentUser} onNavigate={navigate} />,
    }

    return dashboards[currentUser.role] || null
  }, [currentUser, navigate])

  const headerProps = {
    currentUser,
    theme,
    menuOpen,
    setMenuOpen,
    menuRef,
    onLogout: handleLogout,
    onToggleLang: toggleLang,
    onNavigate: navigate,
  }

  const routes = {
    tutorials: <Tutorials onBack={goBack} />,
    camera: <Camera currentUser={currentUser} onBack={goBack} />,
    gradebook: <Gradebook currentUser={currentUser} onBack={goBack} />,
    lessonplan: <LessonPlan currentUser={currentUser} onBack={goBack} />,
    reports: <Reports currentUser={currentUser} onBack={goBack} />,
    classfeed: <ClassFeed onBack={goBack} viewerRole={currentUser?.role} />,
  }

  if (!currentUser || activePage === 'login') {
    return <Login onLogin={handleLogin} onDemoLogin={handleLogin} />
  }

  if (routes[activePage]) {
    return (
      <PageWrapper headerProps={headerProps}>
        {routes[activePage]}
      </PageWrapper>
    )
  }

  return (
    <PageWrapper headerProps={headerProps}>
      {dashboard}
    </PageWrapper>
  )
}

function PageWrapper({ children, headerProps }) {
  return (
    <div style={{ minHeight: '100vh', background: '#060810', color: '#eef0f8' }}>
      <StickyHeader {...headerProps} />
      <div style={{ paddingTop: 64 }}>{children}</div>
    </div>
  )
}
