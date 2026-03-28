import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useStore } from './lib/store'

// ── Layout & guards ───────────────────────────────────────────────────────────
import AppShell      from './components/layout/AppShell'
import ProtectedRoute from './router/ProtectedRoute'

// ── Pages ─────────────────────────────────────────────────────────────────────
import Login           from './pages/Login'
import Dashboard       from './pages/Dashboard'
import StudentDashboard from './pages/StudentDashboard'
import ParentDashboard  from './pages/ParentDashboard'
import AdminDashboard   from './pages/AdminDashboard'
import Gradebook       from './pages/Gradebook'
import LessonPlan      from './pages/LessonPlan'
import Reports         from './pages/Reports'
import TestingSuite    from './pages/TestingSuite'
import ClassFeed       from './pages/ClassFeed'
import ParentMessages  from './pages/ParentMessages'
import Camera          from './pages/Camera'
import Integrations    from './pages/Integrations'
import Tutorials       from './pages/Tutorials'
import ProfileSettings from './components/ProfileSettings'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wraps a page component and injects:
 *   onBack    →  navigate(backTo)   (falls back to browser history -1)
 *   + any extraProps you pass in
 *
 * Keeps all page components free from direct router imports.
 */
function Page({ Component, backTo, extraProps = {} }) {
  const navigate = useNavigate()
  return <Component {...extraProps} onBack={() => navigate(backTo ?? -1)} />
}

/**
 * Tiny wrappers that pull currentUser from the store and pass it
 * to role dashboards that still expect it as a prop.
 */
function TeacherHome()  { return <Dashboard /> }
function StudentHome()  { const u = useStore(s => s.currentUser); return <StudentDashboard currentUser={u} /> }
function ParentHome()   { const u = useStore(s => s.currentUser); return <ParentDashboard  currentUser={u} /> }
function AdminHome()    { const u = useStore(s => s.currentUser); return <AdminDashboard   currentUser={u} /> }

// ─────────────────────────────────────────────────────────────────────────────
// Public routes
// ─────────────────────────────────────────────────────────────────────────────

/** / → dashboard if authed, login if not */
function RootRedirect() {
  // Always open landing/login first, regardless of persisted session.
  // Authenticated users can still be redirected via /login route behavior.
  return <Navigate to="/login" replace />
}

/** /login → dashboard if already authed, otherwise show Login */
function LoginRoute() {
  const navigate  = useNavigate()
  const currentUser = useStore(s => s.currentUser)
  const { setCurrentUser, setLang } = useStore()

  // Allow landing to remain accessible even when a session exists.
  // Do not auto-redirect from /login to dashboard.

  function handleLogin(account) {
    if (!account?.role) return
    setCurrentUser(account)
    setLang(account.lang ?? 'en')
    localStorage.setItem('gradeflow_user', JSON.stringify(account))
    document.documentElement.lang = account.lang ?? 'en'
    navigate(`/${account.role}`, { replace: true })
  }

  return <Login onLogin={handleLogin} onDemoLogin={handleLogin} currentUser={currentUser} />
}

// ─────────────────────────────────────────────────────────────────────────────
// App — route tree
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const { loadFromDB, setCurrentUser, setLang } = useStore()

  // Rehydrate auth session + apply school CSS vars on first load
  useEffect(() => {
    const raw = localStorage.getItem('gradeflow_user')
    if (raw) {
      try {
        const user = JSON.parse(raw)
        setCurrentUser(user)
        setLang(user.lang ?? 'en')
        document.documentElement.lang = user.lang ?? 'en'

        const { primary, secondary } = user.theme ?? {}
        if (primary) {
          document.documentElement.style.setProperty('--school-color',     primary)
          document.documentElement.style.setProperty('--school-secondary', secondary ?? primary)
        }
      } catch {
        localStorage.removeItem('gradeflow_user')
      }
    }
    loadFromDB()
  }, [loadFromDB, setCurrentUser, setLang])

  return (
    <Routes>

      {/* ── Public ─────────────────────────────────────────────────────── */}
      <Route path="/"      element={<RootRedirect />} />
      <Route path="/login" element={<LoginRoute />} />

      {/* ── Protected (requires auth) ───────────────────────────────────
           All protected routes share the AppShell layout (sticky header).
           Role-scoped subtrees add a second ProtectedRoute layer that
           redirects to the user's own dashboard if the role doesn't match.
      ──────────────────────────────────────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>

          {/* Shared across all roles */}
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/profile"   element={<ProfileSettings />} />
          <Route path="/camera"    element={<Page Component={Camera} backTo={-1} />} />

          {/* ── Teacher ─────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
            <Route path="/teacher"              element={<TeacherHome />} />
            <Route path="/teacher/gradebook"    element={<Page Component={Gradebook}      backTo="/teacher" />} />
            <Route path="/teacher/lessons"      element={<Page Component={LessonPlan}     backTo="/teacher" />} />
            <Route path="/teacher/reports"      element={<Page Component={Reports}        backTo="/teacher" />} />
            <Route path="/teacher/messages"     element={<Page Component={ParentMessages} backTo="/teacher" extraProps={{ viewerRole: 'teacher' }} />} />
            <Route path="/teacher/testing"      element={<Page Component={TestingSuite}   backTo="/teacher" />} />
            <Route path="/teacher/feed"         element={<Page Component={ClassFeed}      backTo="/teacher" extraProps={{ viewerRole: 'teacher' }} />} />
            <Route path="/teacher/integrations" element={<Page Component={Integrations}   backTo="/teacher" />} />
          </Route>

          {/* ── Student ─────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student"           element={<StudentHome />} />
            <Route path="/student/messages"  element={<Page Component={ParentMessages} backTo="/student" extraProps={{ viewerRole: 'student' }} />} />
            <Route path="/student/feed"      element={<Page Component={ClassFeed}      backTo="/student" extraProps={{ viewerRole: 'student' }} />} />
          </Route>

          {/* ── Parent ──────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['parent']} />}>
            <Route path="/parent"           element={<ParentHome />} />
            <Route path="/parent/messages"  element={<Page Component={ParentMessages} backTo="/parent" extraProps={{ viewerRole: 'parent' }} />} />
          </Route>

          {/* ── Admin ───────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin"           element={<AdminHome />} />
            <Route path="/admin/messages"  element={<Page Component={ParentMessages} backTo="/admin" extraProps={{ viewerRole: 'admin' }} />} />
            <Route path="/admin/feed"      element={<Page Component={ClassFeed}      backTo="/admin" extraProps={{ viewerRole: 'admin' }} />} />
            <Route path="/admin/reports"   element={<Page Component={Reports}        backTo="/admin" />} />
          </Route>

        </Route>
      </Route>

      {/* ── 404 ────────────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}
