import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@lib/store'

// Demo accounts from your system
const DEMO_ACCOUNTS = {
  teacher: {
    name: 'Ms. Johnson',
    role: 'teacher',
    school: 'KIPP New Orleans',
    theme: { primary: '#BA0C2F', secondary: '#8a0a23' },
    lang: 'en'
  },
  student: {
    name: 'Marcus Houston',
    role: 'student',
    school: 'Houston ISD',
    theme: { primary: '#003057', secondary: '#001f3f' },
    lang: 'en'
  },
  parent: {
    name: 'Sarah Parent',
    role: 'parent',
    school: 'Bellaire High School',
    theme: { primary: '#C8102E', secondary: '#8a0a23' },
    lang: 'en'
  },
  admin: {
    name: 'Principal Admin',
    role: 'admin',
    school: 'Lamar High School',
    theme: { primary: '#461D7C', secondary: '#2a0e4e' },
    lang: 'en'
  },
  supportStaff: {
    name: 'Support Coordinator',
    role: 'supportStaff',
    school: 'District Office',
    theme: { primary: '#2a7f62', secondary: '#1a5a45' },
    lang: 'en'
  }
}

// Route map per role (from App.jsx)
const ROLE_ROUTES = {
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
    '/supportStaff/trends',
    '/supportStaff/messages',
    '/supportStaff/notes'
  ]
}

// ────────────────────────────────────────────────────────────────────────────
// Helper: Detect if page is blank/black
// ────────────────────────────────────────────────────────────────────────────
function checkPageHealth() {
  // Wait for content to render
  const main = document.querySelector('main')
  const body = document.body

  // Visible content check
  const mainHasContent = main && main.offsetHeight > 100 && main.innerHTML.trim().length > 50
  const bodyHasContent = body.innerHTML.trim().length > 200

  // Black background check
  const bodyBg = window.getComputedStyle(body).backgroundColor
  const isBlackBg = bodyBg === 'rgb(0, 0, 0)' || bodyBg === 'black'

  // Error state check
  const bodyText = document.body.innerText
  const hasError = bodyText.includes('Error') && bodyText.length < 500
  const hasException = bodyText.includes('Exception')

  return {
    hasContent: mainHasContent || bodyHasContent,
    isBlack: isBlackBg && !mainHasContent && !bodyHasContent,
    hasError: hasError || hasException,
    contentLength: main?.innerHTML?.length || 0
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Helper: Find all interactive elements
// ────────────────────────────────────────────────────────────────────────────
function findAllClickables() {
  const clickables = []
  const seen = new WeakSet()

  // Selectors for interactive elements
  const selectors = [
    'button',
    'a[href]',
    '[role="button"]',
    '[role="tab"]',
    '[role="link"]',
    '[onclick]',
    'input[type="submit"]',
    'input[type="button"]'
  ]

  selectors.forEach(selector => {
    try {
      document.querySelectorAll(selector).forEach(el => {
        if (seen.has(el)) return
        if (!el.offsetParent) return // Not visible

        const rect = el.getBoundingClientRect()
        const isInViewport = rect.top >= -100 && rect.left >= -100 && rect.top < window.innerHeight + 100

        if (!isInViewport) return

        const style = window.getComputedStyle(el)
        const cursor = style.cursor
        const hasClickListener = !!el.onclick || !!el.__reactEventHandlers?.onClick
        const role = el.getAttribute('role')

        // Only include if cursor=pointer OR is standard interactive element
        const isCursorClickable = cursor === 'pointer'
        const isStandardInteractive = ['button', 'a'].includes(el.tagName.toLowerCase())
        const hasRole = ['button', 'tab', 'link'].includes(role || '')

        if (isCursorClickable || isStandardInteractive || hasRole || hasClickListener) {
          const text = (el.innerText || el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 40)
          const href = el.getAttribute('href') || ''
          const dataTestId = el.getAttribute('data-testid') || ''

          clickables.push({
            text,
            tag: el.tagName,
            href,
            cursor: cursor,
            hasClickListener,
            role,
            dataTestId,
            element: el
          })

          seen.add(el)
        }
      })
    } catch (e) {
      // Skip broken selectors
    }
  })

  return clickables
}

// ────────────────────────────────────────────────────────────────────────────
// Main Crawler Component
// ────────────────────────────────────────────────────────────────────────────
export default function Crawler() {
  const navigate = useNavigate()
  const { setCurrentUser, currentUser } = useStore()

  const [status, setStatus] = useState('Ready to crawl')
  const [progress, setProgress] = useState({ role: '', page: '', tested: 0, broken: 0 })
  const [results, setResults] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [showDebug, setShowDebug] = useState(true)
  const [actionLog, setActionLog] = useState([])
  const [slowMotionMs, setSlowMotionMs] = useState(0)
  const [currentPageContent, setCurrentPageContent] = useState('')

  const resultsRef = useRef(null)
  const logRef = useRef(null)

  // Auto-scroll action log to bottom
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [actionLog])

  // Helper: Log actions with timestamp
  const log = (type, message, details = '') => {
    const timestamp = new Date().toLocaleTimeString()
    setActionLog(prev => [...prev, { timestamp, type, message, details }])
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Core crawl logic for a single role
  // ────────────────────────────────────────────────────────────────────────────
  const crawlRole = async (role) => {
    const account = DEMO_ACCOUNTS[role]
    const routes = ROLE_ROUTES[role]

    log('ROLE', `Starting crawl for ${role}`, account.name)

    const report = {
      role,
      account: account.name,
      pages: {},
      summary: {
        pagesVisited: 0,
        totalClickables: 0,
        brokenButtons: [],
        blackPages: [],
        deadEnds: [],
        errorPages: []
      }
    }

    // Set user in store
    setCurrentUser(account)
    log('AUTH', `Logged in as ${account.name}`)

    for (const route of routes) {
      setProgress(prev => ({
        ...prev,
        page: route,
        tested: report.summary.pagesVisited
      }))

      log('NAVIGATE', `Opening route: ${route}`)

      try {
        // Navigate to the route
        navigate(route)

        // Wait for page to render with slow-motion delay
        const waitTime = 800 + slowMotionMs
        await new Promise(resolve => setTimeout(resolve, waitTime))

        // Capture page content for debug view
        setCurrentPageContent(document.body.innerHTML.slice(0, 500))

        // Check page health
        const health = checkPageHealth()

        const pageReport = {
          route,
          timestamp: new Date().toISOString(),
          health,
          clickables: [],
          issues: []
        }

        // If page is black or broken, skip deep dive
        if (health.isBlack) {
          log('ERROR', `Black/blank page detected`, route)
          pageReport.issues.push({
            type: 'BLACK_PAGE',
            severity: 'critical',
            message: 'Page rendered black/blank'
          })
          report.summary.blackPages.push(route)
        } else if (health.hasError) {
          log('ERROR', `Error state detected`, route)
          pageReport.issues.push({
            type: 'ERROR_STATE',
            severity: 'critical',
            message: 'Page shows error message'
          })
          report.summary.errorPages.push(route)
        } else if (!health.hasContent) {
          log('WARN', `No content found`, route)
          pageReport.issues.push({
            type: 'NO_CONTENT',
            severity: 'medium',
            message: 'Page has minimal content'
          })
          report.summary.deadEnds.push(route)
        } else {
          log('SUCCESS', `Page loaded: ${health.contentLength} bytes`)
          // Page is healthy — find clickables
          const clickables = findAllClickables()
          log('SCAN', `Found ${clickables.length} clickable elements`)
          
          pageReport.clickables = clickables.map(c => ({
            text: c.text,
            tag: c.tag,
            href: c.href,
            cursor: c.cursor,
            hasListener: c.hasClickListener,
            role: c.role
          }))

          // Check for cursor-change without real click behavior
          clickables.forEach(clickable => {
            const { cursor, hasClickListener, href, tag, role } = clickable

            // Cursor=pointer but no href and no click listener = likely broken
            if (cursor === 'pointer' && !href && !hasClickListener && tag !== 'BUTTON') {
              log('BUG', `Broken button found: "${clickable.text}"`, `cursor=pointer, no handler`)
              pageReport.issues.push({
                type: 'CURSOR_NO_ACTION',
                severity: 'high',
                button: clickable.text,
                message: `Cursor changes but element has no click handler or href`
              })
              report.summary.brokenButtons.push({
                route,
                button: clickable.text
              })
            }

            // Button tag with no onclick or role=button without handler
            if ((tag === 'BUTTON' || role === 'button') && !hasClickListener && !href) {
              log('BUG', `Button without handler: "${clickable.text}"`, route)
              pageReport.issues.push({
                type: 'BUTTON_NO_HANDLER',
                severity: 'high',
                button: clickable.text,
                message: `Button exists but has no click handler`
              })
              report.summary.brokenButtons.push({
                route,
                button: clickable.text
              })
            }
          })

          // If no clickables found, it's a dead end
          if (clickables.length === 0 && route !== `/${role}` && route !== `/${role}/widgets`) {
            log('WARN', `Dead end (no navigation)`, route)
            pageReport.issues.push({
              type: 'NO_NAVIGATION',
              severity: 'medium',
              message: 'Page has no interactive elements'
            })
            report.summary.deadEnds.push(route)
          }

          report.summary.totalClickables += clickables.length
        }

        report.pages[route] = pageReport
        report.summary.pagesVisited += 1

        setProgress(prev => ({
          ...prev,
          broken: report.summary.brokenButtons.length
        }))
      } catch (err) {
        // Route failed to render
        log('ERROR', `Navigation failed`, err.message)
        report.pages[route] = {
          route,
          issues: [
            {
              type: 'RENDER_ERROR',
              severity: 'critical',
              message: err.message
            }
          ]
        }
        report.summary.errorPages.push(route)
      }
    }

    log('COMPLETE', `Finished ${role} (${report.summary.pagesVisited} pages)`)
    return report
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Start the full crawl
  // ────────────────────────────────────────────────────────────────────────────
  const startCrawl = async () => {
    setIsRunning(true)
    setStatus('Starting crawler...')
    setResults(null)

    const crawlResults = {
      timestamp: new Date().toISOString(),
      roles: {}
    }

    for (const role of Object.keys(DEMO_ACCOUNTS)) {
      setStatus(`Crawling ${role}...`)
      const roleReport = await crawlRole(role)
      crawlResults.roles[role] = roleReport
    }

    // Compute summary
    const summary = {
      totalRoles: Object.keys(DEMO_ACCOUNTS).length,
      totalPages: Object.values(crawlResults.roles).reduce((sum, r) => sum + r.summary.pagesVisited, 0),
      totalClickables: Object.values(crawlResults.roles).reduce((sum, r) => sum + r.summary.totalClickables, 0),
      totalIssues: Object.values(crawlResults.roles).reduce((sum, r) => sum + r.summary.brokenButtons.length, 0),
      totalBlackPages: Object.values(crawlResults.roles).reduce((sum, r) => sum + r.summary.blackPages.length, 0),
      totalDeadEnds: Object.values(crawlResults.roles).reduce((sum, r) => sum + r.summary.deadEnds.length, 0)
    }

    crawlResults.summary = summary
    setResults(crawlResults)
    setStatus('Crawl complete!')
    setIsRunning(false)
  }

  const downloadReport = () => {
    if (!results) return
    const json = JSON.stringify(results, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gradeflow-crawler-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0e27',
      color: '#eef0f8',
      padding: '20px',
      fontFamily: "'Inter', 'Arial', sans-serif"
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
            🕷️ GradeFlow Navigation Crawler
          </h1>
          <p style={{ color: '#7b8cb1', fontSize: '14px' }}>
            Systematically tests all 5 roles, finds broken buttons (cursor changes but not clickable),
            detects black pages, and maps your entire navigation graph.
          </p>
        </div>

        {/* Control Panel */}
        <div style={{
          background: '#0f1629',
          border: '1px solid #2a3d66',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <button
            onClick={startCrawl}
            disabled={isRunning}
            style={{
              background: isRunning ? '#4a5680' : '#5865f2',
              color: '#fff',
              border: 'none',
              padding: '12px 32px',
              borderRadius: '6px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'background 0.2s'
            }}>
            {isRunning ? '⏳ Crawling...' : '🚀 Start Full Crawl (All 5 Roles)'}
          </button>

          {/* Slow-motion toggle */}
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontSize: '13px', color: '#8fa3c4' }}>
              <input
                type="checkbox"
                checked={showDebug}
                onChange={(e) => setShowDebug(e.target.checked)}
                style={{ marginRight: '6px' }}
              />
              Show Debug Log
            </label>
            <label style={{ fontSize: '13px', color: '#8fa3c4' }}>
              Slow-Motion:
              <input
                type="range"
                min="0"
                max="3000"
                step="500"
                value={slowMotionMs}
                onChange={(e) => setSlowMotionMs(Number(e.target.value))}
                disabled={isRunning}
                style={{ marginLeft: '6px', cursor: isRunning ? 'not-allowed' : 'pointer' }}
              />
              {slowMotionMs}ms
            </label>
          </div>

          {/* Live Status */}
          <div style={{ marginTop: '16px', fontSize: '13px', color: '#8fa3c4' }}>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#5865f2', fontWeight: '600' }}>Status:</span> {status}
            </div>
            {progress.role && (
              <>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ color: '#7289da' }}>Current Role:</span> {progress.role}
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ color: '#7289da' }}>Current Page:</span> {progress.page}
                </div>
                <div>
                  <span style={{ color: '#7289da' }}>Pages Tested:</span> {progress.tested} | <span style={{ color: '#f04747' }}>Issues Found:</span> {progress.broken}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Debug Log Panel */}
        {showDebug && (
          <div style={{
            background: '#0f1629',
            border: '1px solid #2a3d66',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#5865f2', marginBottom: '12px' }}>
              📋 Real-Time Action Log
            </div>
            <div
              ref={logRef}
              style={{
                background: '#0a0e27',
                border: '1px solid #1a2140',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '11px',
                fontFamily: 'monospace',
                maxHeight: '300px',
                overflowY: 'auto',
                color: '#7289da'
              }}>
              {actionLog.length === 0 ? (
                <div style={{ color: '#4a5680' }}>Waiting for crawl to start...</div>
              ) : (
                actionLog.map((entry, idx) => (
                  <div key={idx} style={{ marginBottom: '4px', paddingBottom: '4px', borderBottom: '1px solid #1a2140' }}>
                    <span style={{ color: '#5865f2' }}>[{entry.timestamp}]</span>
                    <span style={{
                      color: entry.type === 'ERROR' ? '#f04747' :
                        entry.type === 'BUG' ? '#faa61a' :
                        entry.type === 'WARN' ? '#faa61a' :
                        entry.type === 'SUCCESS' ? '#43b581' :
                        entry.type === 'COMPLETE' ? '#43b581' :
                        '#7289da',
                      fontWeight: 'bold',
                      marginLeft: '8px'
                    }}>
                      {entry.type}
                    </span>
                    <span style={{ marginLeft: '8px', color: '#8fa3c4' }}>{entry.message}</span>
                    {entry.details && <span style={{ color: '#4a5680', marginLeft: '8px' }}>({entry.details})</span>}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div ref={resultsRef} style={{ background: '#0f1629', border: '1px solid #2a3d66', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>
                ✅ Crawl Results
              </h2>
              <button
                onClick={downloadReport}
                style={{
                  background: '#5865f2',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600'
                }}>
                📥 Download JSON
              </button>
            </div>

            {/* Global Summary */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              marginBottom: '24px'
            }}>
              <div style={{ background: '#1a2140', padding: '16px', borderRadius: '8px', border: '1px solid #2a3d66' }}>
                <div style={{ fontSize: '12px', color: '#7289da', marginBottom: '6px' }}>Roles Tested</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#5865f2' }}>
                  {results.summary.totalRoles}
                </div>
              </div>
              <div style={{ background: '#1a2140', padding: '16px', borderRadius: '8px', border: '1px solid #2a3d66' }}>
                <div style={{ fontSize: '12px', color: '#7289da', marginBottom: '6px' }}>Total Pages</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#5865f2' }}>
                  {results.summary.totalPages}
                </div>
              </div>
              <div style={{ background: '#1a2140', padding: '16px', borderRadius: '8px', border: '1px solid #2a3d66' }}>
                <div style={{ fontSize: '12px', color: '#7289da', marginBottom: '6px' }}>Total Clickables</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#5865f2' }}>
                  {results.summary.totalClickables}
                </div>
              </div>
              <div style={{ background: '#1a2140', padding: '16px', borderRadius: '8px', border: '1px solid #f04747' }}>
                <div style={{ fontSize: '12px', color: '#f04747', marginBottom: '6px' }}>❌ Broken Buttons</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f04747' }}>
                  {results.summary.totalIssues}
                </div>
              </div>
              <div style={{ background: '#1a2140', padding: '16px', borderRadius: '8px', border: '1px solid #f04747' }}>
                <div style={{ fontSize: '12px', color: '#f04747', marginBottom: '6px' }}>Black Pages</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f04747' }}>
                  {results.summary.totalBlackPages}
                </div>
              </div>
              <div style={{ background: '#1a2140', padding: '16px', borderRadius: '8px', border: '1px solid #faa61a' }}>
                <div style={{ fontSize: '12px', color: '#faa61a', marginBottom: '6px' }}>Dead Ends</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faa61a' }}>
                  {results.summary.totalDeadEnds}
                </div>
              </div>
            </div>

            {/* Per-Role Reports */}
            {Object.entries(results.roles).map(([role, roleReport]) => (
              <div key={role} style={{ marginBottom: '24px', borderBottom: '1px solid #2a3d66', paddingBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#5865f2', marginBottom: '12px' }}>
                  {role.toUpperCase()} — {roleReport.account}
                </h3>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '10px',
                  marginBottom: '16px'
                }}>
                  <div style={{ background: '#1a2140', padding: '10px', borderRadius: '6px', fontSize: '12px' }}>
                    <div style={{ color: '#7289da', marginBottom: '2px' }}>Pages</div>
                    <div style={{ fontWeight: 'bold' }}>{roleReport.summary.pagesVisited}</div>
                  </div>
                  <div style={{ background: '#1a2140', padding: '10px', borderRadius: '6px', fontSize: '12px' }}>
                    <div style={{ color: '#7289da', marginBottom: '2px' }}>Clickables</div>
                    <div style={{ fontWeight: 'bold' }}>{roleReport.summary.totalClickables}</div>
                  </div>
                  <div style={{ background: '#1a2140', padding: '10px', borderRadius: '6px', fontSize: '12px', border: '1px solid #f04747' }}>
                    <div style={{ color: '#f04747', marginBottom: '2px' }}>Broken</div>
                    <div style={{ fontWeight: 'bold', color: '#f04747' }}>{roleReport.summary.brokenButtons.length}</div>
                  </div>
                  <div style={{ background: '#1a2140', padding: '10px', borderRadius: '6px', fontSize: '12px', border: '1px solid #f04747' }}>
                    <div style={{ color: '#f04747', marginBottom: '2px' }}>Black Pages</div>
                    <div style={{ fontWeight: 'bold', color: '#f04747' }}>{roleReport.summary.blackPages.length}</div>
                  </div>
                </div>

                {/* Broken Buttons for this role */}
                {roleReport.summary.brokenButtons.length > 0 && (
                  <div style={{ marginTop: '12px', padding: '12px', background: '#1a1f3a', borderLeft: '3px solid #f04747', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#f04747', marginBottom: '8px' }}>
                      🔴 Broken Buttons:
                    </div>
                    {roleReport.summary.brokenButtons.slice(0, 8).map((item, idx) => (
                      <div key={idx} style={{ fontSize: '11px', color: '#8fa3c4', marginBottom: '4px' }}>
                        <span style={{ color: '#faa61a' }}>•</span> {item.route} → "<strong>{item.button}</strong>"
                      </div>
                    ))}
                    {roleReport.summary.brokenButtons.length > 8 && (
                      <div style={{ fontSize: '11px', color: '#7289da', marginTop: '6px' }}>
                        +{roleReport.summary.brokenButtons.length - 8} more
                      </div>
                    )}
                  </div>
                )}

                {/* Black Pages for this role */}
                {roleReport.summary.blackPages.length > 0 && (
                  <div style={{ marginTop: '12px', padding: '12px', background: '#1a1f3a', borderLeft: '3px solid #f04747', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#f04747', marginBottom: '8px' }}>
                      ⬛ Black Pages:
                    </div>
                    {roleReport.summary.blackPages.slice(0, 5).map((page, idx) => (
                      <div key={idx} style={{ fontSize: '11px', color: '#8fa3c4', marginBottom: '4px' }}>
                        • {page}
                      </div>
                    ))}
                  </div>
                )}

                {/* Dead Ends for this role */}
                {roleReport.summary.deadEnds.length > 0 && (
                  <div style={{ marginTop: '12px', padding: '12px', background: '#1a1f3a', borderLeft: '3px solid #faa61a', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#faa61a', marginBottom: '8px' }}>
                      ⚠️ Dead Ends (no navigation):
                    </div>
                    {roleReport.summary.deadEnds.slice(0, 5).map((page, idx) => (
                      <div key={idx} style={{ fontSize: '11px', color: '#8fa3c4', marginBottom: '4px' }}>
                        • {page}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
