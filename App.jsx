import React from 'react'
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
  const { activeScreen, teacher, setScreen, notifications } = useStore()

  const navItems = [
    { id: 'dashboard', icon: '🏠', label: 'Home' },
    { id: 'camera', icon: '📷', label: 'Scan' },
    { id: 'gradebook', icon: '📚', label: 'Classes' },
    { id: 'parentMessages', icon: '💬', label: 'Messages' },
    { id: 'classFeed', icon: '📢', label: 'Feed' },
  ]

  const screens = {
    dashboard: <Dashboard />,
    gradebook: <Gradebook />,
    studentProfile: <StudentProfile />,
    lessonPlan: <LessonPlan />,
    testingSuite: <TestingSuite />,
    reports: <Reports />,
    parentMessages: <ParentMessages />,
    camera: <Camera />,
    classFeed: <ClassFeed />,
  }

  return (
    <div className="min-h-screen bg-app flex flex-col" style={{ '--school-color': teacher.schoolColor }}>
      {/* Top header */}
      <header className="sticky top-0 z-40 border-b border-elevated" style={{ background: '#0c0e14ee', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-xl" style={{ color: 'var(--school-color)' }}>GradeFlow</span>
            <span className="text-text-muted text-xs hidden sm:block">{teacher.school}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="relative p-2 rounded-full hover:bg-elevated transition-colors"
              onClick={() => setScreen('parentMessages')}
            >
              <span className="text-lg">🔔</span>
              {notifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-danger text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {notifications}
                </span>
              )}
            </button>
            <button className="flex items-center gap-2 hover:bg-elevated rounded-full px-3 py-1.5 transition-colors">
              <span className="text-lg">{teacher.avatar}</span>
              <span className="text-sm font-medium text-text-primary hidden sm:block">{teacher.name}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 pb-24">
        <div className="animate-slide-up" key={activeScreen}>
          {screens[activeScreen] || <Dashboard />}
        </div>
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-elevated" style={{ background: '#0c0e14f0', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-6xl mx-auto flex">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              className="flex-1 flex flex-col items-center py-3 gap-1 transition-colors"
              style={{ color: activeScreen === item.id ? 'var(--school-color)' : '#6b7494' }}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
              {activeScreen === item.id && (
                <div className="w-1 h-1 rounded-full" style={{ background: 'var(--school-color)' }} />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
