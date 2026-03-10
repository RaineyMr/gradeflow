import React, { useEffect, useRef, useState } from 'react'
import { useStore } from './lib/store'
import Dashboard from './pages/Dashboard'
import Gradebook from './pages/Gradebook'
import StudentProfile from './pages/StudentProfile'
import LessonPlan from './pages/LessonPlan'
import TestingSuite from './pages/TestingSuite'
import Reports from './pages/Reports'
import ParentMessages from './pages/ParentMessages'
import Camera from './pages/Camera'
import ClassFeed from './pages/ClassFeed'

export default function App() {
  const { activeScreen, teacher, setScreen, notifications, setActiveClass, setActiveStudent, startQuickCreateAssignment } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  function goHome() {
    setMenuOpen(false)
    setActiveClass(null)
    setActiveStudent(null)
    setScreen('dashboard')
  }

  function goTo(screen) {
    setMenuOpen(false)
    setScreen(screen)
  }

  useEffect(() => {
    function handleOutsideClick(e) {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [menuOpen])

  const navItems = [
    { id: 'dashboard', icon: '🏠', label: 'Home', action: goHome },
    { id: 'camera', icon: '📷', label: 'Scan', action: () => goTo('camera') },
    { id: 'gradebook', icon: '📚', label: 'Classes', action: () => goTo('gradebook') },
    { id: 'parentMessages', icon: '💬', label: 'Messages', action: () => goTo('parentMessages') },
    { id: 'lessonPlan', icon: '📋', label: 'Lesson Plans', action: () => goTo('lessonPlan') },
    { id: 'reports', icon: '📊', label: 'Reports', action: () => goTo('reports') },
    { id: 'newAssignment', icon: '➕', label: 'New', action: () => startQuickCreateAssignment('quiz') },
  ]

  const { lessonPlanMode } = useStore()

  const screens = {
    dashboard: <Dashboard />,
    gradebook: <Gradebook />,
    studentProfile: <StudentProfile />,
    lessonPlan: <LessonPlan initialMode={lessonPlanMode || 'menu'} />,
    testingSuite: <TestingSuite />,
    reports: <Reports />,
    parentMessages: <ParentMessages />,
    camera: <Camera />,
    classFeed: <ClassFeed />,
  }

  const activeNav = ['gradebook', 'studentProfile'].includes(activeScreen) ? 'gradebook' : activeScreen

  return (
    <div className="min-h-screen bg-app flex flex-col" style={{ '--school-color': teacher.schoolColor }}>

      <header className="sticky top-0 border-b border-elevated" style={{ background: "#0c0e14ee", backdropFilter: "blur(12px)", zIndex: 100 }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeScreen !== 'dashboard' && (
              <button onClick={goHome} className="text-text-muted hover:text-text-primary transition-colors text-sm">←</button>
            )}
            <button onClick={goHome} className="font-display font-bold text-xl hover:opacity-80 transition-opacity" style={{ color: 'var(--school-color)' }}>
              GradeFlow
            </button>
            <span className="text-text-muted text-xs hidden sm:block">{teacher.school}</span>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-full hover:bg-elevated transition-colors" onClick={() => goTo('parentMessages')}>
              <span className="text-lg">🔔</span>
              {notifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-danger text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {notifications}
                </span>
              )}
            </button>

            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen(m => !m)} className="flex items-center gap-2 hover:bg-elevated rounded-full px-3 py-1.5 transition-colors">
                <span className="text-lg">{teacher.avatar}</span>
                <span className="text-sm font-medium text-text-primary hidden sm:block">{teacher.name}</span>
                <span className="text-text-muted text-xs ml-1">▾</span>
              </button>

              {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-card border border-elevated overflow-hidden animate-slide-up" style={{ background: "#161923", zIndex: 210 }}>
                    {[
                      { icon: '🏠', label: 'Dashboard', action: () => setMenuOpen(false) },
                      { icon: '📚', label: 'Gradebook', action: () => goTo('gradebook') },
                      { icon: '📋', label: 'Lesson Plans', action: () => goTo('lessonPlan') },
                      { icon: '🧪', label: 'Testing Suite', action: () => goTo('testingSuite') },
                      { icon: '📊', label: 'Reports', action: () => goTo('reports') },
                      { icon: '💬', label: 'Messages', action: () => goTo('parentMessages') },
                      { icon: '📢', label: 'Class Feed', action: () => goTo('classFeed') },
                      { icon: '⚙️', label: 'Settings', action: () => { setMenuOpen(false); alert('Settings — coming in onboarding build') } },
                      { icon: '🚪', label: 'Sign Out', action: () => { setMenuOpen(false); alert('Sign out — auth coming in onboarding build') } },
                    ].map(item => (
                      <button key={item.label} onClick={item.action} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-primary hover:bg-elevated transition-colors text-left border-b border-elevated last:border-0">
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 pb-24">
        <div key={activeScreen}>
          {screens[activeScreen] || <Dashboard />}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-elevated" style={{ background: '#0c0e14f0', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-6xl mx-auto flex">
          {navItems.map(item => (
            <button key={item.id} onClick={item.action} className="flex-1 flex flex-col items-center py-3 gap-1 transition-colors" style={{ color: activeNav === item.id ? 'var(--school-color)' : '#6b7494' }}>
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
              {activeNav === item.id && <div className="w-1 h-1 rounded-full" style={{ background: 'var(--school-color)' }} />}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
