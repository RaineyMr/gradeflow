import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useStore } from '@lib/store'
import { SchoolThemeProvider } from '@components/SchoolThemeProvider_Enhanced'

// Layout & guards
import AppShell from '@components/layout/AppShell'
import SupportStaffLayoutWrapper from '@components/layout/SupportStaffLayoutWrapper'
import ProtectedRoute from './router/ProtectedRoute'

// Pages
import Login from '@pages/Login'
import TeacherOnboarding from '@pages/TeacherOnboarding'
import CurriculumOnboarding from '@pages/CurriculumOnboarding'
import WorkingDashboard from '@pages/Dashboard_Working'
import AdminDashboard from '@pages/AdminDashboard'
import Dashboard from '@pages/Dashboard'
import Gradebook from '@pages/Gradebook'
import LessonPlan from '@pages/LessonPlan'
import LessonPlanTemplate from '@pages/LessonPlanTemplate'
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
import Camera from '@pages/Camera'
import ClassCreation from '@pages/ClassCreation'
import Tutorials from '@pages/Tutorials'
import { HomeFeed } from '@pages/Dashboard'
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

// Helpers

/**
 * Wraps a page component and injects onBack handler
 */
function Page({ Component, backTo, extraProps = {} }) {
  const navigate = useNavigate()
  return <Component {...extraProps} onBack={() => navigate(backTo ?? -1)} />
}

/**
 * Extract role dashboards from store, pass currentUser as prop
 */
function TeacherHome() {
  const currentUser = useStore(s => s.currentUser)
  const navigate = useNavigate()
  
  // Check if new teacher needs onboarding
  if (currentUser?.needsOnboarding && currentUser?.isNewAccount) {
    navigate('/teacher/onboarding', { replace: true })
    return null
  }
  
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
  const DashboardComponent = isDemoAccount ? Dashboard : WorkingDashboard
  
  return <DashboardComponent currentUser={currentUser} /> 
}

function StudentHome() { 
  const u = useStore(s => s.currentUser); 
  return <StudentDashboard currentUser={u} /> 
}

function ParentHome()   { 
  const u = useStore(s => s.currentUser); 
  return <ParentDashboard  currentUser={u} /> 
}

function AdminHome()    { 
  const u = useStore(s => s.currentUser); 
  return <AdminDashboard   currentUser={u} /> 
}

function SupportStaffHome() { 
  const u = useStore(s => s.currentUser); 
  return <SupportStaffDashboard currentUser={u} /> 
}

// Public routes

/**
 * Root -> always redirect to login
 */
function RootRedirect() {
  return <Navigate to="/login" replace />
}

/**
 * Login page: handles both demo and real account login
 */
function LoginRoute() {
  const navigate = useNavigate()
  const { isHydrated, setCurrentUser, setLang, loadTeacherData } = useStore()

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

  /**
   * Handle login: mark as not needing onboarding, navigate to dashboard or onboarding
   */
  function handleLogin(account) {
    console.log('=== DEBUG: handleLogin called ===')
    console.log('DEBUG: account:', account)
    console.log('DEBUG: account.role:', account?.role)
    console.log('DEBUG: account.id:', account?.id)
    console.log('DEBUG: account.email:', account?.email)
    
    if (!account?.role || !account?.id) {
      console.log('DEBUG: No role or ID, returning')
      return
    }

    // Determine if this is a demo account
    const isDemoAccount = account.isDemoAccount === true ||
      account.email?.includes('@demo') ||
      account.id?.startsWith('demo-') ||
      // Known demo account domains
      account.email?.includes('@kippneworleans.org') ||
      account.email?.includes('@houstonisd.org') ||
      account.email?.includes('@bellaire.org') ||
      account.email?.includes('@lamarhs.org')

    console.log('DEBUG: isDemoAccount:', isDemoAccount)

    // Set account with onboarding cleared
    const finalAccount = {
      ...account,
      isDemoAccount,
      needsOnboarding: false,
      isNewAccount: false,
    }

    console.log('DEBUG: finalAccount:', finalAccount)

    setCurrentUser(finalAccount)
    setLang(finalAccount.lang ?? 'en')
    localStorage.setItem('gradeflow_user', JSON.stringify(finalAccount))
    document.documentElement.lang = finalAccount.lang ?? 'en'

    // Apply school branding if available
    const { primary, secondary } = finalAccount.theme ?? {}
    if (primary) {
      document.documentElement.style.setProperty('--school-color', primary)
      document.documentElement.style.setProperty('--school-secondary', secondary ?? primary)
    }

    // Load real teacher data from Supabase
    if (finalAccount.role === 'teacher' && !isDemoAccount) {
      console.log('DEBUG: Loading teacher data for real account')
      loadTeacherData()
    }

    // Navigate to role-specific dashboard
    const homePath = finalAccount.role === 'admin' ? '/admin' : `/${finalAccount.role}`
    console.log('DEBUG: Navigating to:', homePath)
    navigate(homePath, { replace: true })
  }

  return <Login onLogin={handleLogin} onDemoLogin={handleLogin} currentUser={null} />
}

// Loading component

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

// Main App

export default function App() {
  const { loadFromDB, setCurrentUser, setLang, isHydrated, currentUser, loadTeacherData } = useStore()

  // Hydrate auth state on mount
  useEffect(() => {
    const raw = localStorage.getItem('gradeflow_user')
    if (raw) {
      try {
        const user = JSON.parse(raw)
        if (user?.role && user?.id) {
          setCurrentUser(user)  // Set user immediately
          try {
            setLang(user.lang ?? 'en')
            document.documentElement.lang = user.lang ?? 'en'

            const { primary, secondary } = user.theme ?? {}
            if (primary) {
              document.documentElement.style.setProperty('--school-color', primary)
              document.documentElement.style.setProperty('--school-secondary', secondary ?? primary)
            }

            // Load demo or real data
            if (user.isDemoAccount) {
              loadFromDB()
            } else if (user.role === 'teacher') {
              loadTeacherData()
            }
          } catch {
            // Ignore theme errors
          }
        } else {
          // No valid user, hydrate store without data
          setTimeout(() => loadFromDB(), 100)
        }
      } catch {
        localStorage.removeItem('gradeflow_user')
      }
    } else {
      const savedLang = localStorage.getItem('gradeflow_lang')
      if (savedLang) {
        setLang(savedLang)
        document.documentElement.lang = savedLang
      }
    }

    // Always hydrate (marks store as ready)
    setTimeout(() => {
      loadFromDB()
    }, 100)
  }, [setCurrentUser, setLang, loadFromDB, loadTeacherData])

  if (!isHydrated) {
    return <Loading />
  }

  return (
    <SchoolThemeProvider>
      <Routes>

        {/* Public */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginRoute />} />

        {/* Onboarding (protected, outside AppShell) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
            <Route path="/teacher/onboarding" element={<TeacherOnboarding />} />
            <Route path="/teacher/curriculum-onboarding" element={<CurriculumOnboarding />} />
          </Route>
        </Route>

        {/* Protected Routes (with AppShell) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>

            {/* Shared */}
            <Route path="/tutorials" element={<Tutorials />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/debug/crawler" element={<Crawler />} />

            {/* Teacher */}
            <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
              <Route path="/teacher" element={<TeacherHome />} />
              <Route path="/teacher/lessons" element={<LessonPlan />} />
              <Route path="/teacher/gradebook" element={<Gradebook />} />
              <Route path="/teacher/lesson-plan-template" element={<LessonPlanTemplate />} />
              <Route path="/teacher/reports" element={<Reports />} />
              <Route path="/teacher/messages" element={<ParentMessages viewerRole="teacher" />} />
              <Route path="/teacher/testing" element={<TestingSuite />} />
              <Route path="/teacher/app" element={<AppRouter />} />
              <Route path="/teacher/feed" element={<ClassFeed viewerRole="teacher" />} />
              <Route path="/teacher/widgets" element={<Widgets />} />
              <Route path="/teacher/integrations" element={<Integrations />} />
              <Route path="/teacher/camera" element={<Camera />} />
              <Route path="/teacher/classes/create" element={<ClassCreation />} />
              <Route path="/teacher/classes/upload" element={<div style={{ padding: 20, color: '#fff' }}>Upload Classes - Coming Soon</div>} />
            </Route>

            {/* Student */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student" element={<StudentHome />} />
              <Route path="/student/widgets" element={<Page Component={Widgets} backTo="/student" />} />
              <Route path="/student/messages" element={<Page Component={ParentMessages} backTo="/student" extraProps={{ viewerRole: 'student' }} />} />
              <Route path="/student/feed" element={<Page Component={ClassFeed} backTo="/student" extraProps={{ viewerRole: 'student' }} />} />
            </Route>

            {/* Parent */}
            <Route element={<ProtectedRoute allowedRoles={['parent']} />}>
              <Route path="/parent" element={<ParentHome />} />
              <Route path="/parent/widgets" element={<Page Component={Widgets} backTo="/parent" />} />
              <Route path="/parent/messages" element={<Page Component={ParentMessages} backTo="/parent" extraProps={{ viewerRole: 'parent' }} />} />
            </Route>

            {/* Admin */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminHome />} />
              <Route path="/admin/widgets" element={<Page Component={Widgets} backTo="/admin" />} />
              <Route path="/admin/messages" element={<Page Component={ParentMessages} backTo="/admin" extraProps={{ viewerRole: 'admin' }} />} />
              <Route path="/admin/feed" element={<Page Component={ClassFeed} backTo="/admin" extraProps={{ viewerRole: 'admin' }} />} />
              <Route path="/admin/reports" element={<Page Component={Reports} backTo="/admin" />} />
            </Route>

            {/* Support Staff */}
            <Route element={<ProtectedRoute allowedRoles={['supportStaff']} />}>
              <Route element={<SupportStaffLayoutWrapper />}>
                <Route path="/supportStaff" element={<SupportStaffHome />} />
                <Route path="/supportStaff/ai" element={<SupportStaffAI />} />
                <Route path="/supportStaff/insights" element={<SupportStaffInsights />} />
                <Route path="/supportStaff/collaboration" element={<SupportCollaborationFeed />} />
                <Route path="/supportStaff/reports" element={<SupportReports />} />
                <Route path="/supportStaff/groups" element={<Page Component={SupportStaffGroups} backTo="/supportStaff" />} />
                <Route path="/support/groups" element={<Page Component={SupportStaffGroups} backTo="/supportStaff" />} />
                <Route path="/supportStaff/trends" element={<Page Component={StudentTrends} backTo="/supportStaff" />} />
                <Route path="/supportStaff/messages" element={<Page Component={ParentMessages} backTo="/supportStaff" extraProps={{ viewerRole: 'supportStaff' }} />} />
                <Route path="/support/messages" element={<SupportStaffMessaging />} />
                <Route path="/support/student/:studentId" element={<SupportStaffStudentProfile />} />
                <Route path="/support/case/:studentId" element={<CaseConference />} />
                <Route path="/support/logs" element={<Page Component={SupportStaffNotes} backTo="/supportStaff" />} />
                <Route path="/support/caseload" element={<Page Component={SupportStaffCaseload} backTo="/supportStaff" />} />
                <Route path="/supportStaff/notes" element={<Page Component={SupportStaffDashboard} backTo="/supportStaff" subPage="notes" />} />
                <Route path="/supportStaff/studentProfile" element={<Page Component={StudentProfile} backTo="/supportStaff" extraProps={{ readOnly: true }} />} />
              </Route>
            </Route>

          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </SchoolThemeProvider>
  )
}
