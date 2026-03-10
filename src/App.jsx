import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
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

function NewAssignmentModal({ onClose, defaultType = 'quiz' }) {
  const classes = useStore((state) => state.classes || [])
  const addAssignment = useStore((state) => state.addAssignment)
  const clearQuickCreateAssignment = useStore((state) => state.clearQuickCreateAssignment)

  const [form, setForm] = useState({
    name: '',
    type: defaultType,
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    weight: 30,
    classId: classes[0]?.id || '',
  })
  const [applyAll, setApplyAll] = useState(true)

  const types = [
    { id: 'test', label: 'Test', weight: 40, color: '#f04a4a', icon: '📝' },
    { id: 'quiz', label: 'Quiz', weight: 30, color: '#f5a623', icon: '📋' },
    { id: 'homework', label: 'Homework', weight: 20, color: '#22c97a', icon: '📚' },
    { id: 'participation', label: 'Participation', weight: 10, color: '#9b6ef5', icon: '✋' },
  ]

  useEffect(() => {
    const selectedType = types.find((item) => item.id === defaultType)
    if (selectedType) {
      setForm((current) => ({
        ...current,
        type: selectedType.id,
        weight: selectedType.weight,
      }))
    }
  }, [defaultType])

  function handleTypeChange(type) {
    const selectedType = types.find((item) => item.id === type)
    if (!selectedType) return

    setForm((current) => ({
      ...current,
      type,
      weight: selectedType.weight,
    }))
  }

  function handleSave() {
    const payload = {
      ...form,
      applyAll,
      classId: applyAll ? null : form.classId || classes[0]?.id || null,
    }

    const store = useStore.getState()

    if (typeof addAssignment === 'function') {
      addAssignment(payload)
    } else if (typeof store.quickCreateAssignment === 'function') {
      store.quickCreateAssignment(payload)
    } else {
      console.error('No assignment creation action found in store.')
    }

    if (typeof clearQuickCreateAssignment === 'function') {
      clearQuickCreateAssignment()
    }

    onClose()
  }

  const modal = (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg mx-4 rounded-widget border border-elevated animate-slide-up overflow-hidden"
        style={{ background: '#161923', maxHeight: '90vh', zIndex: 10000 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-elevated">
          <h3 className="font-bold text-text-primary">➕ New Assignment</h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary text-xl leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div
          className="overflow-y-auto p-5 space-y-4"
          style={{ maxHeight: 'calc(90vh - 64px)' }}
        >
          <div>
            <label className="tag-label block mb-2">Assignment Type</label>
            <div className="grid grid-cols-2 gap-2">
              {types.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleTypeChange(type.id)}
                  className="py-3 rounded-card text-sm font-bold transition-all flex items-center gap-2 px-3"
                  style={{
                    background: form.type === type.id ? `${type.color}22` : '#1e2231',
                    color: form.type === type.id ? type.color : '#6b7494',
                    border: `1px solid ${form.type === type.id ? `${type.color}50` : 'transparent'}`,
                  }}
                >
                  <span className="text-lg">{type.icon}</span>
                  <div className="text-left">
                    <div>{type.label}</div>
                    <div style={{ fontSize: '9px', opacity: 0.7 }}>
                      {type.weight}% weight
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="tag-label block mb-1">Assignment Name</label>
            <input
              className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm"
              placeholder="e.g. Chapter 4 Quiz"
              value={form.name}
              onChange={(e) =>
                setForm((current) => ({ ...current, name: e.target.value }))
              }
              autoFocus
            />
          </div>

          {!applyAll && classes.length > 0 && (
            <div>
              <label className="tag-label block mb-1">Class</label>
              <select
                className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm"
                value={form.classId}
                onChange={(e) =>
                  setForm((current) => ({ ...current, classId: e.target.value }))
                }
              >
                {classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.period} · {classItem.subject}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="tag-label block mb-1">Assign Date</label>
              <input
                type="date"
                className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm"
                value={form.date}
                onChange={(e) =>
                  setForm((current) => ({ ...current, date: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="tag-label block mb-1">Due Date</label>
              <input
                type="date"
                className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((current) => ({ ...current, dueDate: e.target.value }))
                }
              />
            </div>
          </div>

          <div
            className="flex items-center gap-2 p-3 rounded-card"
            style={{ background: '#1e2231' }}
          >
            <input
              type="checkbox"
              id="applyAllGlobal"
              checked={applyAll}
              onChange={(e) => setApplyAll(e.target.checked)}
              className="rounded"
            />
            <label
              htmlFor="applyAllGlobal"
              className="text-sm text-text-muted cursor-pointer"
            >
              Apply to all my classes
            </label>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-pill text-sm font-semibold"
              style={{ background: '#1e2231', color: '#6b7494' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!form.name.trim()}
              className="flex-1 py-2.5 rounded-pill text-sm font-bold text-white disabled:opacity-40"
              style={{ background: 'var(--school-color)' }}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return ReactDOM.createPortal(modal, document.body)
}

export default function App() {
  const activeScreen = useStore((state) => state.activeScreen)
  const teacher = useStore((state) => state.teacher)
  const setScreen = useStore((state) => state.setScreen)
  const notifications = useStore((state) => state.notifications)
  const setActiveClass = useStore((state) => state.setActiveClass)
  const setActiveStudent = useStore((state) => state.setActiveStudent)
  const lessonPlanMode = useStore((state) => state.lessonPlanMode)
  const quickCreateAssignmentState = useStore((state) => state.quickCreateAssignment)
  const startQuickCreateAssignment = useStore((state) => state.startQuickCreateAssignment)
  const clearQuickCreateAssignment = useStore((state) => state.clearQuickCreateAssignment)

  const [menuOpen, setMenuOpen] = useState(false)
  const [showNewAssignment, setShowNewAssignment] = useState(false)

  const menuRef = useRef(null)
  const menuButtonRef = useRef(null)

  function closeMenu() {
    setMenuOpen(false)
  }

  function goHome() {
    closeMenu()
    setActiveClass(null)
    setActiveStudent(null)
    setScreen('dashboard')
  }

  function goTo(screen) {
    closeMenu()
    setScreen(screen)
  }

  function openQuickCreate(defaultType = 'quiz') {
    closeMenu()

    if (typeof startQuickCreateAssignment === 'function') {
      startQuickCreateAssignment(defaultType)
    }

    setShowNewAssignment(true)
  }

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!menuOpen) return

      const target = event.target

      const clickedInsideMenu =
        menuRef.current && menuRef.current.contains(target)
      const clickedMenuButton =
        menuButtonRef.current && menuButtonRef.current.contains(target)

      if (!clickedInsideMenu && !clickedMenuButton) {
        setMenuOpen(false)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [menuOpen])

  useEffect(() => {
    if (quickCreateAssignmentState) {
      setShowNewAssignment(true)
    }
  }, [quickCreateAssignmentState])

  function closeNewAssignmentModal() {
    setShowNewAssignment(false)

    if (typeof clearQuickCreateAssignment === 'function') {
      clearQuickCreateAssignment()
    }
  }

  const navItems = [
    { id: 'dashboard', icon: '🏠', label: 'Home', action: goHome },
    { id: 'gradebook', icon: '📚', label: 'Classes', action: () => goTo('gradebook') },
    { id: 'lessonPlan', icon: '📋', label: 'Plans', action: () => goTo('lessonPlan') },
    { id: 'reports', icon: '📊', label: 'Reports', action: () => goTo('reports') },
    { id: 'newAssign', icon: '➕', label: 'New', action: () => openQuickCreate('quiz'), special: true },
    { id: 'parentMessages', icon: '💬', label: 'Messages', action: () => goTo('parentMessages') },
  ]

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

  const activeNav =
    ['gradebook', 'studentProfile'].includes(activeScreen)
      ? 'gradebook'
      : activeScreen

  const notificationCount = Array.isArray(notifications)
    ? notifications.length
    : Number(notifications || 0)

  const quickCreateDefaultType =
    quickCreateAssignmentState && typeof quickCreateAssignmentState === 'object'
      ? quickCreateAssignmentState.defaultType || 'quiz'
      : 'quiz'

  return (
    <div
      className="min-h-screen bg-app flex flex-col"
      style={{ '--school-color': teacher.schoolColor }}
    >
      <header
        className="sticky top-0 z-40 border-b border-elevated"
        style={{ background: '#0c0e14ee', backdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeScreen !== 'dashboard' && (
              <button
                onClick={goHome}
                className="text-text-muted hover:text-text-primary transition-colors text-sm"
              >
                ←
              </button>
            )}

            <button
              onClick={goHome}
              className="font-display font-bold text-xl hover:opacity-80 transition-opacity"
              style={{ color: 'var(--school-color)' }}
            >
              GradeFlow
            </button>

            <span className="text-text-muted text-xs hidden sm:block">
              {teacher.school}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="relative p-2 rounded-full hover:bg-elevated transition-colors"
              onClick={() => goTo('parentMessages')}
            >
              <span className="text-lg">🔔</span>
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-danger text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {notificationCount}
                </span>
              )}
            </button>

            <div className="relative">
              <button
                ref={menuButtonRef}
                onClick={() => setMenuOpen((open) => !open)}
                className="flex items-center gap-2 hover:bg-elevated rounded-full px-3 py-1.5 transition-colors"
              >
                <span className="text-lg">{teacher.avatar}</span>
                <span className="text-sm font-medium text-text-primary hidden sm:block">
                  {teacher.name}
                </span>
                <span className="text-text-muted text-xs ml-1">▾</span>
              </button>

              {menuOpen && (
                <div
                  ref={menuRef}
                  className="absolute right-0 top-full mt-2 w-52 rounded-card border border-elevated overflow-hidden animate-slide-up"
                  style={{ background: '#161923', zIndex: 9981 }}
                >
                  {[
                    { icon: '🏠', label: 'Dashboard', action: goHome },
                    { icon: '📚', label: 'Gradebook', action: () => goTo('gradebook') },
                    { icon: '📋', label: 'Lesson Plans', action: () => goTo('lessonPlan') },
                    { icon: '🧪', label: 'Testing Suite', action: () => goTo('testingSuite') },
                    { icon: '📊', label: 'Reports', action: () => goTo('reports') },
                    { icon: '💬', label: 'Messages', action: () => goTo('parentMessages') },
                    { icon: '📢', label: 'Class Feed', action: () => goTo('classFeed') },
                    {
                      icon: '⚙️',
                      label: 'Settings',
                      action: () => {
                        closeMenu()
                        alert('Settings — coming in onboarding build')
                      },
                    },
                    {
                      icon: '🚪',
                      label: 'Sign Out',
                      action: () => {
                        closeMenu()
                        alert('Sign out — auth coming in onboarding build')
                      },
                    },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-primary hover:bg-elevated transition-colors text-left border-b border-elevated last:border-0"
                    >
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
        <div className="animate-slide-up" key={activeScreen}>
          {screens[activeScreen] || <Dashboard />}
        </div>
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-elevated"
        style={{ background: '#0c0e14f0', backdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-6xl mx-auto flex">
          {navItems.map((item) => {
            const isActive = activeNav === item.id

            return (
              <button
                key={item.id}
                onClick={item.action}
                className="flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors relative"
                style={{ color: isActive ? 'var(--school-color)' : '#6b7494' }}
              >
                {item.special ? (
                  <span
                    className="flex items-center justify-center w-7 h-7 rounded-full text-base font-bold"
                    style={{ background: 'var(--school-color)', color: 'white' }}
                  >
                    +
                  </span>
                ) : (
                  <span className="text-xl">{item.icon}</span>
                )}

                <span style={{ fontSize: '9px', fontWeight: 600 }}>{item.label}</span>

                {isActive && !item.special && (
                  <div
                    className="w-1 h-1 rounded-full"
                    style={{ background: 'var(--school-color)' }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {showNewAssignment && (
        <NewAssignmentModal
          onClose={closeNewAssignmentModal}
          defaultType={quickCreateDefaultType}
        />
      )}
    </div>
  )
}
