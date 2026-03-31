import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '@lib/store'

// Demo accounts for each role
const DEMO_ACCOUNTS = {
  teacher: {
    id: 'demo-teacher-1',
    name: 'Demo Teacher',
    email: 'teacher@demo.com',
    role: 'teacher',
    lang: 'en',
    theme: { primary: '#3b82f6', secondary: '#1d4ed8' }
  },
  student: {
    id: 'demo-student-1',
    name: 'Demo Student',
    email: 'student@demo.com',
    role: 'student',
    lang: 'en',
    theme: { primary: '#10b981', secondary: '#059669' }
  },
  parent: {
    id: 'demo-parent-1',
    name: 'Demo Parent',
    email: 'parent@demo.com',
    role: 'parent',
    lang: 'en',
    theme: { primary: '#f59e0b', secondary: '#d97706' }
  },
  admin: {
    id: 'demo-admin-1',
    name: 'Demo Admin',
    email: 'admin@demo.com',
    role: 'admin',
    lang: 'en',
    theme: { primary: '#ef4444', secondary: '#dc2626' }
  },
  supportStaff: {
    id: 'demo-support-1',
    name: 'Demo Support Staff',
    email: 'support@demo.com',
    role: 'supportStaff',
    lang: 'en',
    theme: { primary: '#8b5cf6', secondary: '#7c3aed' }
  }
}

// All routes extracted from App.jsx
const ALL_ROUTES = {
  teacher: [
    '/teacher',
    '/teacher/gradebook',
    '/teacher/lessons',
    '/teacher/reports',
    '/teacher/messages',
    '/teacher/testing',
    '/teacher/feed',
    '/teacher/widgets',
    '/teacher/integrations'
  ],
  student: [
    '/student',
    '/student/widgets',
    '/student/messages',
    '/student/feed'
  ],
  parent: [
    '/parent',
    '/parent/widgets',
    '/parent/messages'
  ],
  admin: [
    '/admin',
    '/admin/widgets',
    '/admin/messages',
    '/admin/feed',
    '/admin/reports'
  ],
  supportStaff: [
    '/supportStaff',
    '/supportStaff/ai',
    '/supportStaff/insights',
    '/supportStaff/collaboration',
    '/supportStaff/reports',
    '/supportStaff/groups',
    '/support/groups',
    '/supportStaff/trends',
    '/supportStaff/messages',
    '/support/messages',
    '/supportStaff/notes',
    '/supportStaff/studentProfile',
    '/support/logs',
    '/support/caseload'
  ],
  shared: [
    '/tutorials',
    '/profile',
    '/camera'
  ]
}

export default function Crawler() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setCurrentUser, currentUser } = useStore()
  
  const [isRunning, setIsRunning] = useState(false)
  const [currentRole, setCurrentRole] = useState('')
  const [currentPath, setCurrentPath] = useState('')
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState({
    testedRoles: [],
    totalPagesVisited: 0,
    brokenButtons: [],
    blackPages: [],
    deadEndPages: [],
    errorPages: []
  })
  
  const timeoutRef = useRef(null)
  const resultsRef = useRef(results)

  useEffect(() => {
    resultsRef.current = results
  }, [results])

  const sleep = (ms) => new Promise(resolve => {
    timeoutRef.current = setTimeout(resolve, ms)
  })

  const isClickableElement = (element) => {
    if (!element) return false
    
    const computedStyle = window.getComputedStyle(element)
    const hasPointerCursor = computedStyle.cursor === 'pointer'
    const isInteractive = [
      'button', 'a', 'input', 'select', 'textarea', 
      '[role="button"]', '[role="link"]', '[onclick]',
      '[onClick]', '.clickable', '.btn', '.button'
    ].some(selector => {
      try {
        return element.matches && element.matches(selector)
      } catch {
        return false
      }
    })
    
    return hasPointerCursor || isInteractive
  }

  const hasClickHandler = (element) => {
    if (!element) return false
    
    return !!(
      element.onclick ||
      element.getAttribute('onclick') ||
      element.getAttribute('onClick') ||
      element.href ||
      element.tagName === 'BUTTON' ||
      element.tagName === 'A' ||
      element.getAttribute('role') === 'button' ||
      element.getAttribute('role') === 'link'
    )
  }

  const analyzePage = async (path, role) => {
    try {
      // Wait for page to render
      await sleep(800)
      
      const body = document.body
      if (!body) {
        return {
          path,
          role,
          isBlackPage: true,
          isDeadEnd: true,
          hasError: false,
          brokenButtons: []
        }
      }

      // Check if page is black/blank
      const computedStyle = window.getComputedStyle(body)
      const isBlackPage = computedStyle.backgroundColor === 'rgba(0, 0, 0, 0)' || 
                         computedStyle.backgroundColor === 'transparent' ||
                         body.innerText.trim().length < 10

      // Find all clickable elements
      const allElements = document.querySelectorAll('*')
      const clickableElements = Array.from(allElements).filter(isClickableElement)
      
      // Check for broken buttons (cursor: pointer but no click handler)
      const brokenButtons = []
      clickableElements.forEach(element => {
        if (!hasClickHandler(element)) {
          const text = element.innerText.trim() || element.getAttribute('aria-label') || element.tagName
          brokenButtons.push({
            element: text,
            tagName: element.tagName,
            className: element.className,
            id: element.id
          })
        }
      })

      // Check if dead end (no clickable elements)
      const isDeadEnd = clickableElements.length === 0

      // Check for error messages
      const hasError = body.innerText.includes('Error') || 
                      body.innerText.includes('404') || 
                      body.innerText.includes('Page not found')

      return {
        path,
        role,
        isBlackPage,
        isDeadEnd,
        hasError,
        brokenButtons,
        totalClickable: clickableElements.length
      }

    } catch (error) {
      return {
        path,
        role,
        isBlackPage: false,
        isDeadEnd: true,
        hasError: true,
        brokenButtons: [],
        error: error.message
      }
    }
  }

  const testRole = async (role) => {
    console.log(`🔐 Logging in as ${role}...`)
    setCurrentUser(DEMO_ACCOUNTS[role])
    await sleep(500)

    const routes = [...ALL_ROUTES[role], ...ALL_ROUTES.shared]
    let roleResults = {
      brokenButtons: [],
      blackPages: [],
      deadEndPages: [],
      errorPages: []
    }

    for (let i = 0; i < routes.length; i++) {
      const path = routes[i]
      setCurrentPath(path)
      console.log(`📄 Visiting ${path} as ${role}...`)
      
      navigate(path)
      const analysis = await analyzePage(path, role)
      
      if (analysis.isBlackPage) {
        roleResults.blackPages.push({ path, role })
      }
      if (analysis.isDeadEnd) {
        roleResults.deadEndPages.push({ path, role })
      }
      if (analysis.hasError) {
        roleResults.errorPages.push({ path, role, error: analysis.error })
      }
      if (analysis.brokenButtons.length > 0) {
        analysis.brokenButtons.forEach(btn => {
          roleResults.brokenButtons.push({
            ...btn,
            path,
            role
          })
        })
      }

      setProgress(Math.round(((i + 1) / routes.length) * 100))
    }

    return roleResults
  }

  const startFullCrawl = async () => {
    setIsRunning(true)
    setProgress(0)
    setCurrentRole('')
    setCurrentPath('')
    
    const allResults = {
      testedRoles: [],
      totalPagesVisited: 0,
      brokenButtons: [],
      blackPages: [],
      deadEndPages: [],
      errorPages: []
    }

    try {
      for (const role of Object.keys(DEMO_ACCOUNTS)) {
        setCurrentRole(role)
        const roleResults = await testRole(role)
        
        allResults.testedRoles.push(role)
        allResults.brokenButtons.push(...roleResults.brokenButtons)
        allResults.blackPages.push(...roleResults.blackPages)
        allResults.deadEndPages.push(...roleResults.deadEndPages)
        allResults.errorPages.push(...roleResults.errorPages)
        allResults.totalPagesVisited += ALL_ROUTES[role].length + ALL_ROUTES.shared.length
      }

      setResults(allResults)
      console.log('✅ Crawl completed!', allResults)
      
    } catch (error) {
      console.error('❌ Crawl failed:', error)
    } finally {
      setIsRunning(false)
      setCurrentRole('')
      setCurrentPath('')
      setProgress(0)
    }
  }

  const downloadReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        rolesTested: results.testedRoles,
        totalPagesVisited: results.totalPagesVisited,
        brokenButtonsCount: results.brokenButtons.length,
        blackPagesCount: results.blackPages.length,
        deadEndPagesCount: results.deadEndPages.length,
        errorPagesCount: results.errorPages.length
      },
      details: results
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gradeflow-crawler-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const stopCrawl = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsRunning(false)
    setCurrentRole('')
    setCurrentPath('')
    setProgress(0)
  }

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      fontFamily: 'Inter, Arial, sans-serif'
    }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '10px' }}>
          🕷️ GradeFlow Crawler
        </h1>
        <p style={{ color: '#6b7494', fontSize: '16px' }}>
          Automated testing for broken buttons, black pages, and dead ends across all user roles
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <div style={{ 
          background: '#f8fafc', 
          padding: '20px', 
          borderRadius: '12px', 
          border: '1px solid #e2e8f0' 
        }}>
          <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '5px' }}>
            {results.testedRoles.length}
          </div>
          <div style={{ color: '#64748b', fontSize: '14px' }}>Roles Tested</div>
        </div>
        
        <div style={{ 
          background: '#f8fafc', 
          padding: '20px', 
          borderRadius: '12px', 
          border: '1px solid #e2e8f0' 
        }}>
          <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '5px' }}>
            {results.totalPagesVisited}
          </div>
          <div style={{ color: '#64748b', fontSize: '14px' }}>Pages Visited</div>
        </div>
        
        <div style={{ 
          background: '#fef2f2', 
          padding: '20px', 
          borderRadius: '12px', 
          border: '1px solid #fecaca' 
        }}>
          <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '5px', color: '#dc2626' }}>
            {results.brokenButtons.length}
          </div>
          <div style={{ color: '#7f1d1d', fontSize: '14px' }}>Broken Buttons</div>
        </div>
        
        <div style={{ 
          background: '#f3f4f6', 
          padding: '20px', 
          borderRadius: '12px', 
          border: '1px solid #d1d5db' 
        }}>
          <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '5px', color: '#374151' }}>
            {results.blackPages.length}
          </div>
          <div style={{ color: '#4b5563', fontSize: '14px' }}>Black Pages</div>
        </div>
        
        <div style={{ 
          background: '#fef3c7', 
          padding: '20px', 
          borderRadius: '12px', 
          border: '1px solid #fde68a' 
        }}>
          <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '5px', color: '#d97706' }}>
            {results.deadEndPages.length}
          </div>
          <div style={{ color: '#78350f', fontSize: '14px' }}>Dead Ends</div>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        {!isRunning ? (
          <button
            onClick={startFullCrawl}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            🚀 Start Full Crawl (All 5 Roles)
          </button>
        ) : (
          <div>
            <button
              onClick={stopCrawl}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '15px'
              }}
            >
              ⏹️ Stop Crawl
            </button>
            
            {currentRole && (
              <div style={{ marginBottom: '10px' }}>
                <strong>Current Role:</strong> {currentRole}
              </div>
            )}
            
            {currentPath && (
              <div style={{ marginBottom: '10px' }}>
                <strong>Current Path:</strong> {currentPath}
              </div>
            )}
            
            <div style={{ 
              width: '100%', 
              height: '8px', 
              background: '#e5e7eb', 
              borderRadius: '4px', 
              overflow: 'hidden' 
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: '#3b82f6',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <div style={{ marginTop: '5px', fontSize: '14px', color: '#6b7494' }}>
              {progress}% Complete
            </div>
          </div>
        )}
      </div>

      {results.testedRoles.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <button
            onClick={downloadReport}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            📥 Download JSON Report
          </button>
        </div>
      )}

      {results.brokenButtons.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px', color: '#dc2626' }}>
            🔴 Broken Buttons
          </h3>
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '15px' }}>
            {results.brokenButtons.map((btn, index) => (
              <div key={index} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: index < results.brokenButtons.length - 1 ? '1px solid #fecaca' : 'none' }}>
                <div><strong>Element:</strong> {btn.element}</div>
                <div><strong>Role:</strong> {btn.role}</div>
                <div><strong>Path:</strong> {btn.path}</div>
                <div><strong>Tag:</strong> {btn.tagName}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.blackPages.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px', color: '#374151' }}>
            ⬛ Black Pages
          </h3>
          <div style={{ background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px', padding: '15px' }}>
            {results.blackPages.map((page, index) => (
              <div key={index} style={{ marginBottom: '5px' }}>
                <strong>{page.role}:</strong> {page.path}
              </div>
            ))}
          </div>
        </div>
      )}

      {results.deadEndPages.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px', color: '#d97706' }}>
            ⚠️ Dead End Pages
          </h3>
          <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', padding: '15px' }}>
            {results.deadEndPages.map((page, index) => (
              <div key={index} style={{ marginBottom: '5px' }}>
                <strong>{page.role}:</strong> {page.path}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
