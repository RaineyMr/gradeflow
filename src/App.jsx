import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useStore } from '@lib/store'
import { useHashRouter } from '@hooks/useHashRouter'
import { initializeRouter, pageToHash } from '@lib/hashRouter'
import { SchoolThemeProvider } from '@components/SchoolThemeProvider_Enhanced'

// ── Layout & guards ───────────────────────────────────────────────────────────
import AppShell      from '@components/layout/AppShell'
import MobileLayout  from '@layouts/MobileLayout'
import SupportStaffLayoutWrapper from '@components/layout/SupportStaffLayoutWrapper'
import ProtectedRoute from './router/ProtectedRoute'

// ── Pages ─────────────────────────────────────────────────────────────────────
import Login from '@pages/Login'
import TeacherOnboarding from '@pages/TeacherOnboarding'
import CurriculumOnboarding from '@pages/CurriculumOnboarding'
import WorkingDashboard from '@pages/Dashboard_Working'
import AdminDashboard from '@pages/AdminDashboard'
import Dashboard from '@pages/Dashboard'
import Gradebook from '@pages/Gradebook'
import LessonPlan from '@pages/LessonPlan'
import ParentDashboard from '@pages/ParentDashboard'
import ParentMessages from '@pages/ParentMessages'
import Reports from '@pages/Reports'
import StudentDashboard from '@pages/StudentDashboard'
import StudentProfile from '@pages/StudentProfile'
import StudentTrends from '@pages/StudentTrends'
import SupportStaffDashboard from '@pages/SupportStaffDashboard'
import TestingSuite from '@pages/TestingSuite'
import Widgets from '@pages/Widgets'
import ClassFeed from '@pages/ClassFeed'
import Integrations from '@pages/Integrations'
import Camera          from '@pages/Camera'
import ClassCreation   from '@pages/ClassCreation'
import Tutorials       from '@pages/Tutorials'
import ProfileSettings from '@components/ProfileSettings'
import SupportStaffGroupScreen from '@pages/SupportStaffGroupScreen'
import SupportStaffMessaging from '@components/support/SupportStaffMessaging'
import SupportStaffStudentProfile from '@components/support/SupportStaffStudentProfile'
import SupportStaffHomeFeed from '@components/support/SupportStaffHomeFeed'
import SupportStaffGroups from '@components/support/SupportStaffGroups'
import SupportStaffNotes from '@components/support/SupportStaffNotes'
import SupportStaffCaseload from '@components/support/SupportStaffCaseload'
import SupportStaffAI from '@pages/SupportStaffAI'
import SupportStaffInsights from '@pages/SupportStaffInsights'
import SupportCollaborationFeed from '@pages/SupportCollaborationFeed'
import SupportReports from '@pages/SupportReports'
import CaseConference from '@pages/CaseConference'
import Crawler from '@pages/Crawler'
import AppRouter from './appRouter'

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
function TeacherHome()  { 
  const currentUser = useStore(s => s.currentUser)
  const navigate = useNavigate()
  
  console.log('TeacherHome - currentUser:', currentUser)
  console.log('TeacherHome - needsOnboarding:', currentUser?.needsOnboarding)
  console.log('TeacherHome - isNewAccount:', currentUser?.isNewAccount)
  
  // Check if new teacher needs onboarding
  if (currentUser?.needsOnboarding && currentUser?.isNewAccount) {
    console.log('Redirecting to onboarding')
    // Use React Router navigate instead of window.location.hash
    navigate('/teacher/onboarding', { replace: true })
    return null
  }
  
  console.log('Rendering dashboard')
  console.log('Teacher account info:', {
    email: currentUser?.email,
    id: currentUser?.id,
    isRealAccount: currentUser?.id?.startsWith('new-'),
    isDemoAccount: currentUser?.email?.includes('@demo') || 
                   currentUser?.id?.startsWith('demo-') ||
                   currentUser?.email?.includes('@kippneworleans.org') ||
                   currentUser?.email?.includes('@houstonisd.org') ||
                   currentUser?.email?.includes('@bellaire.org') ||
                   currentUser?.email?.includes('@lamarhs.org')
  })
  
  // Use working dashboard for real users, demo dashboard for demo accounts
  // Demo accounts: predefined demo emails OR demo- prefix IDs
  // Real accounts: newly created accounts with timestamp IDs
  const isDemoAccount = currentUser?.email?.includes('@demo') || 
                        currentUser?.id?.startsWith('demo-') ||
                        // Known demo account domains
                        currentUser?.email?.includes('@kippneworleans.org') ||
                        currentUser?.email?.includes('@houstonisd.org') ||
                        currentUser?.email?.includes('@bellaire.org') ||
                        currentUser?.email?.includes('@lamarhs.org')
  // Real accounts have timestamp-based IDs from registration
  const isRealAccount = currentUser?.id?.startsWith('new-')
  const DashboardComponent = isRealAccount ? WorkingDashboard : Dashboard
  
  console.log('Dashboard component selected:', isRealAccount ? 'WorkingDashboard' : 'Dashboard')
  
  return <DashboardComponent currentUser={currentUser} /> 
}
function StudentHome()  { const u = useStore(s => s.currentUser); return <StudentDashboard currentUser={u} /> }
function ParentHome()   { const u = useStore(s => s.currentUser); return <ParentDashboard  currentUser={u} /> }
function AdminHome()    { const u = useStore(s => s.currentUser); return <AdminDashboard   currentUser={u} /> }
function SupportStaffHome() { const u = useStore(s => s.currentUser); return <SupportStaffDashboard currentUser={u} /> }

// ─────────────────────────────────────────────────────────────────────────────
// Public routes
// ─────────────────────────────────────────────────────────────────────────────

/** / → dashboard if authed, login if not */
function RootRedirect() {
  // Always open landing/login first, regardless of persisted session.
  // Authenticated users can still be redirected via /login route behavior.
  return <Navigate to="/login" replace />
}

/** /login → always show Login page */
function LoginRoute() {
  const navigate  = useNavigate()
  const { navigateToPage } = useHashRouter()
  const { isHydrated } = useStore(s => ({ isHydrated: s.isHydrated }))
  const { setCurrentUser, setLang } = useStore()

  if (!isHydrated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#060810',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#eef0f8',
        fontFamily: 'Inter, Arial, sans-serif',
      }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>⚡</div>
          <div style={{ fontSize: 18, marginBottom: 32 }}>Loading GradeFlow...</div>
          <div style={{ width: 40, height: 40, border: '3px solid #1e2231', borderTop: '3px solid #f97316', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  // Invalid persisted user → clear
  useEffect(() => {
    const raw = localStorage.getItem('gradeflow_user')
    if (raw) {
      try {
        const user = JSON.parse(raw)
        if (!user?.role) {
          localStorage.removeItem('gradeflow_user')
          setCurrentUser(null)
        }
      } catch {
        localStorage.removeItem('gradeflow_user')
        setCurrentUser(null)
      }
    }
  }, [setCurrentUser])

  function handleLogin(account) {
    if (!account?.role) return
    setCurrentUser(account)
    setLang(account.lang ?? 'en')
    localStorage.setItem('gradeflow_user', JSON.stringify(account))
    document.documentElement.lang = account.lang ?? 'en'
    
    // Reset browser history and navigate to role-specific dashboard
    useStore.getState().resetToHome()
    
    // Check if new account needs onboarding
    if (account.isNewAccount && account.needsOnboarding && account.role === 'teacher') {
      // Navigate to onboarding for new teachers
      navigate('/teacher/onboarding')
    } else {
      // Navigate to the correct role-specific home path
      const homePath = account.role === 'admin' ? '/admin' : `/${account.role}`
      navigate(homePath)
    }
  }

  return <Login onLogin={handleLogin} onDemoLogin={handleLogin} currentUser={null} />
}

// ─────────────────────────────────────────────────────────────────────────────
// App — route tree
// ─────────────────────────────────────────────────────────────────────────────

function Loading() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #060810 0%, #0a0f1e 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#eef0f8',
      fontFamily: 'Inter, Arial, sans-serif',
    }}>
      <div style={{ fontSize: 48, marginBottom: 24 }}>⚡</div>
      <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>GradeFlow</div>
      <div style={{ fontSize: 14, color: '#6b7494', marginBottom: 32 }}>Loading your dashboard...</div>
      <div style={{
        width: 40,
        height: 40,
        border: '3px solid rgba(249,115,22,0.2)',
        borderTop: '3px solid #f97316',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function App() {
  const { loadFromDB, setCurrentUser, setLang, isHydrated, page, currentUser } = useStore()

  // Rehydrate auth session + apply school CSS vars on first load
  useEffect(() => {
    const raw = localStorage.getItem('gradeflow_user')
    console.log('App useEffect - loading user from localStorage:', raw)
    if (raw) {
      try {
        const user = JSON.parse(raw)
        console.log('App useEffect - parsed user:', user)
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
        console.log('Cleared invalid localStorage user')
      }
    } else {
      // No saved user, but check for saved language preference
      const savedLang = localStorage.getItem('gradeflow_lang')
      if (savedLang) {
        setLang(savedLang)
        document.documentElement.lang = savedLang
      }
    }
    
    // Load database after user state is set
    setTimeout(() => {
      loadFromDB()
    }, 100)
  }, [setCurrentUser, setLang])

  // Initialize hash router on app mount
  useEffect(() => {
    const cleanup = initializeRouter(useStore)
    return cleanup
  }, [])

  // Sync page state changes back to hash (only if authenticated)
  useEffect(() => {
    if (!currentUser) return // Don't sync hash if not authenticated
    
    const role = currentUser?.role || null
    const hash = pageToHash(page, role)

    if (window.location.hash !== hash) {
      window.history.replaceState({ page, role }, '', hash)
    }
  }, [page, currentUser])

  if (!isHydrated) {
    return <Loading />
  }

  return (
    <SchoolThemeProvider>
      <Routes>

      {/* ── Public ─────────────────────────────────────────────────────── */}
      <Route path="/"      element={<RootRedirect />} />
      <Route path="/login" element={<LoginRoute />} />

      {/* ── Onboarding Routes (outside AppShell, but protected) ───────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
          <Route path="/teacher/onboarding" element={<TeacherOnboarding />} />
          <Route path="/teacher/curriculum-onboarding" element={<CurriculumOnboarding />} />
        </Route>
      </Route>

      {/* ── Protected (requires auth) ───────────────────────────────────
           All protected routes share the AppShell layout (sticky header).
           Role-scoped subtrees add a second ProtectedRoute layer that
           redirects to the user's own dashboard if the role doesn't match.
      ──────────────────────────────────────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        {/* ── Main App Routes (with AppShell) ─────────────────────────── */}
        <Route element={<AppShell />}>

          {/* Shared across all roles */}
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/profile"   element={<ProfileSettings />} />
          <Route path="/camera"    element={<Page Component={Camera} backTo={-1} />} />

          {/* ── Debug Tools ─────────────────────────────────────────────── */}
          <Route path="/debug/crawler" element={<Crawler />} />

          {/* ── Teacher ─────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
            <Route path="/teacher"              element={<TeacherHome />} />
            <Route path="/teacher/gradebook"    element={<Page Component={Gradebook}      backTo="/teacher" />} />
            <Route path="/teacher/lessons"      element={<Page Component={LessonPlan}     backTo="/teacher" />} />
            <Route path="/teacher/reports"      element={<Page Component={Reports}        backTo="/teacher" />} />
            <Route path="/teacher/messages"     element={<Page Component={ParentMessages} backTo="/teacher" extraProps={{ viewerRole: 'teacher' }} />} />
            <Route path="/teacher/testing"      element={<Page Component={TestingSuite}   backTo="/teacher" />} />
            <Route path="/teacher/app"          element={<AppRouter />} />
            <Route path="/teacher/feed"         element={<Page Component={ClassFeed}      backTo="/teacher" extraProps={{ viewerRole: 'teacher' }} />} />
            <Route path="/teacher/widgets"      element={<Page Component={Widgets}        backTo="/teacher" />} />
            <Route path="/teacher/integrations" element={<Page Component={Integrations}   backTo="/teacher" />} />
            
            {/* Class Management Routes */}
            <Route path="/teacher/classes/create" element={<ClassCreation />} />
            <Route path="/teacher/classes/upload" element={<div style={{padding: 20, color: '#fff'}}>Upload Classes - Coming Soon</div>} />

          </Route>

          {/* ── Student ─────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student"            element={<StudentHome />} />
            <Route path="/student/widgets"    element={<Page Component={Widgets}       backTo="/student" />} />
            <Route path="/student/messages"   element={<Page Component={ParentMessages} backTo="/student" extraProps={{ viewerRole: 'student' }} />} />
            <Route path="/student/feed"       element={<Page Component={ClassFeed}      backTo="/student" extraProps={{ viewerRole: 'student' }} />} />
          </Route>

          {/* ── Parent ──────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['parent']} />}>
            <Route path="/parent"            element={<ParentHome />} />
            <Route path="/parent/widgets"    element={<Page Component={Widgets}       backTo="/parent" />} />
            <Route path="/parent/messages"   element={<Page Component={ParentMessages} backTo="/parent" extraProps={{ viewerRole: 'parent' }} />} />
          </Route>

          {/* ── Admin ───────────────────────────────────────────────── */ }
          <Route element={<ProtectedRoute allowedRoles={['admin']} />} >
            <Route path="/admin"            element={<AdminHome />} />
            <Route path="/admin/widgets"    element={<Page Component={Widgets}       backTo="/admin" />} />
            <Route path="/admin/messages"   element={<Page Component={ParentMessages} backTo="/admin" extraProps={{ viewerRole: 'admin' }} />} />
            <Route path="/admin/feed"       element={<Page Component={ClassFeed}      backTo="/admin" extraProps={{ viewerRole: 'admin' }} />} />
            <Route path="/admin/reports"    element={<Page Component={Reports}        backTo="/admin" />} />
          </Route>

          {/* ── Support Staff ───────────────────────────────────────────────────── */ }
          <Route element={<ProtectedRoute allowedRoles={['supportStaff']} />} >
            <Route element={<SupportStaffLayoutWrapper />}>
              <Route path="/supportStaff"           element={<SupportStaffHome />} />
              <Route path="/supportStaff/ai"        element={<SupportStaffAI />} />
              <Route path="/supportStaff/insights"   element={<SupportStaffInsights />} />
              <Route path="/supportStaff/collaboration" element={<SupportCollaborationFeed />} />
              <Route path="/supportStaff/reports"    element={<SupportReports />} />
              <Route path="/supportStaff/groups"    element={<Page Component={SupportStaffGroups} backTo="/supportStaff" />} />
              <Route path="/support/groups"         element={<Page Component={SupportStaffGroups} backTo="/supportStaff" />} />
              <Route path="/supportStaff/trends"    element={<Page Component={StudentTrends} backTo="/supportStaff" />} />
              <Route path="/supportStaff/messages"  element={<Page Component={ParentMessages} backTo="/supportStaff" extraProps={{ viewerRole: 'supportStaff' }} />} />
              <Route path="/support/messages"       element={<SupportStaffMessaging />} />
              <Route path="/support/student/:studentId" element={<SupportStaffStudentProfile />} />
              <Route path="/support/case/:studentId" element={<CaseConference />} />
              <Route path="/support/logs"           element={<Page Component={SupportStaffNotes} backTo="/supportStaff" />} />
              <Route path="/support/caseload"       element={<Page Component={SupportStaffCaseload} backTo="/supportStaff" />} />
              <Route path="/supportStaff/notes"     element={<Page Component={SupportStaffDashboard} backTo="/supportStaff" subPage="notes" />} />
              <Route path="/supportStaff/studentProfile" element={<Page Component={StudentProfile} backTo="/supportStaff" extraProps={{ readOnly: true }} />} />
            </Route>
          </Route>

        </Route>
      </Route>

      {/* ── 404 ────────────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
    </SchoolThemeProvider>
  )
}
