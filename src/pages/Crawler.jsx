import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@lib/store'

const DEMO_ACCOUNTS = {
  teacher: { name: 'Ms. Johnson', role: 'teacher', school: 'KIPP New Orleans', theme: { primary: '#BA0C2F', secondary: '#8a0a23' }, lang: 'en' },
  student: { name: 'Marcus Houston', role: 'student', school: 'Houston ISD', theme: { primary: '#003057', secondary: '#001f3f' }, lang: 'en' },
  parent: { name: 'Sarah Parent', role: 'parent', school: 'Bellaire High School', theme: { primary: '#C8102E', secondary: '#8a0a23' }, lang: 'en' },
  admin: { name: 'Principal Admin', role: 'admin', school: 'Lamar High School', theme: { primary: '#461D7C', secondary: '#2a0e4e' }, lang: 'en' },
  supportStaff: { name: 'Support Coordinator', role: 'supportStaff', school: 'District Office', theme: { primary: '#2a7f62', secondary: '#1a5a45' }, lang: 'en' }
}

const ROLE_ROUTES = {
  teacher: ['/teacher', '/teacher/gradebook', '/teacher/lessons', '/teacher/reports', '/teacher/messages', '/teacher/testing', '/teacher/feed', '/teacher/widgets', '/teacher/integrations'],
  student: ['/student', '/student/widgets', '/student/messages', '/student/feed'],
  parent: ['/parent', '/parent/widgets', '/parent/messages'],
  admin: ['/admin', '/admin/widgets', '/admin/messages', '/admin/feed', '/admin/reports'],
  supportStaff: ['/supportStaff', '/supportStaff/ai', '/supportStaff/insights', '/supportStaff/collaboration', '/supportStaff/reports', '/supportStaff/groups', '/supportStaff/trends', '/supportStaff/messages', '/supportStaff/notes']
}

function checkPageHealth() {
  const bodyText = document.body.innerText
  const hasContent = bodyText.length > 100
  const isBlack = window.getComputedStyle(document.body).backgroundColor === 'rgb(0, 0, 0)' && !hasContent
  return { hasContent, isBlack }
}

function SummaryCard({ label, value, color }) {
  return (
    <div style={{ background: '#1a2140', padding: '12px', borderRadius: '8px', border: `1px solid ${color}30`, textAlign: 'center' }}>
      <div style={{ fontSize: '11px', color: '#7289da', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 'bold', color }}>{value}</div>
    </div>
  )
}

export default function CrawlerDashboard() {
  const navigate = useNavigate()
  const { setCurrentUser } = useStore()

  const [status, setStatus] = useState('IDLE')
  const [progress, setProgress] = useState({ role: '', page: '', tested: 0 })
  const [actionLog, setActionLog] = useState([])
  const [results, setResults] = useState(null)
  const [slowMotionMs, setSlowMotionMs] = useState(500)
  const [isPaused, setIsPaused] = useState(false)
  const [pageSnapshot, setPageSnapshot] = useState('')
  const [currentPageUrl, setCurrentPageUrl] = useState('')
  const [timeoutSeconds, setTimeoutSeconds] = useState(10)
  const [elapsedTime, setElapsedTime] = useState(0)

  const logRef = useRef(null)
  const crawlRef = useRef(null)
  const timerRef = useRef(null)

  const log = (type, message, details = '') => {
    setActionLog(prev => {
      const updated = [...prev, { timestamp: new Date().toLocaleTimeString(), type, message, details }]
      setTimeout(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight }, 0)
      return updated
    })
  }

  const capturePageContent = () => {
    const html = document.documentElement.outerHTML.slice(0, 2000)
    setPageSnapshot(html)
    setCurrentPageUrl(window.location.href)
  }

  const waitWithPause = async (ms) => {
    let remaining = ms
    while (remaining > 0) {
      if (!crawlRef.current) break
      if (isPaused) {
        await new Promise(resolve => setTimeout(resolve, 100))
        continue
      }
      await new Promise(resolve => setTimeout(resolve, 100))
      remaining -= 100
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const crawlSingleRole = async (role) => {
    const routes = ROLE_ROUTES[role]
    const report = { role, pagesVisited: 0, totalClickables: 0, brokenButtons: [], blackPages: [], deadEnds: [], errorPages: [] }

    for (const route of routes) {
      if (!crawlRef.current) break
      if (elapsedTime > timeoutSeconds * 60) {
        log('TIMEOUT', `Exceeded ${timeoutSeconds} minute limit`)
        break
      }

      setProgress(prev => ({ ...prev, page: route, tested: report.pagesVisited }))
      log('NAVIGATE', route)

      try {
        navigate(route)
        await waitWithPause(500 + slowMotionMs)
        capturePageContent()

        const { hasContent, isBlack } = checkPageHealth()

        if (isBlack) {
          log('BUG', `Black page: ${route}`)
          report.blackPages.push(route)
        } else if (!hasContent) {
          log('WARN', `No content: ${route}`)
          report.deadEnds.push(route)
        } else {
          log('SUCCESS', `Loaded: ${document.body.innerText.length} chars`)
        }

        report.pagesVisited += 1
      } catch (err) {
        log('ERROR', `Navigation failed: ${route}`, err.message)
        report.errorPages.push(route)
      }
    }

    return report
  }

  const startCrawl = async () => {
    setStatus('RUNNING')
    setActionLog([])
    setResults(null)
    setElapsedTime(0)
    crawlRef.current = true

    const crawlResults = { timestamp: new Date().toISOString(), roles: {} }

    try {
      for (const role of Object.keys(DEMO_ACCOUNTS)) {
        if (!crawlRef.current) break
        setProgress(prev => ({ ...prev, role }))
        log('ROLE', `Starting ${role}`)
        setCurrentUser(DEMO_ACCOUNTS[role])
        await waitWithPause(800)
        const roleReport = await crawlSingleRole(role)
        crawlResults.roles[role] = roleReport
      }

      setResults(crawlResults)
      setStatus('COMPLETE')
      log('SUCCESS', 'Crawl completed!')
    } catch (err) {
      log('ERROR', 'Crawl failed', err.message)
      setStatus('ERROR')
      setResults(crawlResults)
    }
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
    log('ACTION', isPaused ? 'Resumed' : 'Paused')
  }

  const stopCrawl = () => {
    crawlRef.current = false
    setStatus('COMPLETE')
    log('ACTION', 'Crawl stopped by user')
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
  }

  useEffect(() => {
    if (status === 'RUNNING' && !isPaused) {
      timerRef.current = setInterval(() => { setElapsedTime(prev => prev + 1) }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [status, isPaused])

  if (status === 'COMPLETE' && results) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0e27', color: '#eef0f8', padding: '40px 20px', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>✅ Crawl Report</h1>
              <p style={{ fontSize: '13px', color: '#7b8cb1', margin: 0 }}>
                Completed at {new Date(results.timestamp).toLocaleString()} • Total time: {formatTime(elapsedTime)}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => { setStatus('IDLE'); setActionLog([]); }}
                style={{ background: '#5865f2', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                🔄 New Crawl
              </button>
              <button
                onClick={downloadReport}
                style={{ background: '#2a7f62', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                📥 Download JSON
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '30px' }}>
            <SummaryCard label="Roles Tested" value={Object.keys(results.roles).length} color="#5865f2" />
            <SummaryCard label="Total Pages" value={Object.values(results.roles).reduce((sum, r) => sum + r.pagesVisited, 0)} color="#5865f2" />
            <SummaryCard label="Broken Buttons" value={Object.values(results.roles).reduce((sum, r) => sum + r.brokenButtons.length, 0)} color="#f04747" />
            <SummaryCard label="Black Pages" value={Object.values(results.roles).reduce((sum, r) => sum + r.blackPages.length, 0)} color="#f04747" />
          </div>

          {Object.entries(results.roles).map(([role, roleReport]) => (
            <div key={role} style={{ background: '#0f1629', border: '1px solid #2a3d66', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#5865f2', marginBottom: '12px' }}>{role.toUpperCase()}</h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
                <SummaryCard label="Pages" value={roleReport.pagesVisited} color="#7289da" />
                <SummaryCard label="Broken" value={roleReport.brokenButtons.length} color="#f04747" />
                <SummaryCard label="Black Pages" value={roleReport.blackPages.length} color="#f04747" />
                <SummaryCard label="Dead Ends" value={roleReport.deadEnds.length} color="#faa61a" />
              </div>

              {roleReport.brokenButtons.length > 0 && (
                <div style={{ marginTop: '16px', padding: '12px', background: '#1a1f3a', borderLeft: '3px solid #f04747', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#f04747', marginBottom: '8px' }}>🔴 Broken Buttons ({roleReport.brokenButtons.length})</div>
                  {roleReport.brokenButtons.slice(0, 5).map((btn, idx) => (
                    <div key={idx} style={{ fontSize: '11px', color: '#8fa3c4', marginBottom: '4px' }}>• {btn.route} → "{btn.button}"</div>
                  ))}
                </div>
              )}

              {roleReport.blackPages.length > 0 && (
                <div style={{ marginTop: '12px', padding: '12px', background: '#1a1f3a', borderLeft: '3px solid #f04747', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#f04747', marginBottom: '8px' }}>⬛ Black Pages ({roleReport.blackPages.length})</div>
                  {roleReport.blackPages.map((page, idx) => (
                    <div key={idx} style={{ fontSize: '11px', color: '#8fa3c4', marginBottom: '4px' }}>• {page}</div>
                  ))}
                </div>
              )}

              {roleReport.deadEnds.length > 0 && (
                <div style={{ marginTop: '12px', padding: '12px', background: '#1a1f3a', borderLeft: '3px solid #faa61a', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#faa61a', marginBottom: '8px' }}>⚠️ Dead Ends ({roleReport.deadEnds.length})</div>
                  {roleReport.deadEnds.map((page, idx) => (
                    <div key={idx} style={{ fontSize: '11px', color: '#8fa3c4', marginBottom: '4px' }}>• {page}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e27', color: '#eef0f8', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #2a3d66', background: '#0f1629' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>🕷️ GradeFlow Navigation Crawler</h1>
        <p style={{ fontSize: '13px', color: '#7b8cb1', margin: 0 }}>Real-time testing — watch each navigation and log issues</p>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ flex: '0 0 45%', display: 'flex', flexDirection: 'column', background: '#0f1629', borderRight: '1px solid #2a3d66', padding: '16px', overflow: 'hidden' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#5865f2', marginBottom: '8px' }}>📱 LIVE PAGE PREVIEW</div>
          <div style={{ background: '#1a2140', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', color: '#8fa3c4', marginBottom: '8px', wordBreak: 'break-all', fontFamily: 'monospace', maxHeight: '40px', overflowY: 'auto' }}>
            {currentPageUrl || 'Waiting...'}
          </div>
          <div style={{ flex: 1, background: '#1a2140', border: '1px solid #2a3d66', borderRadius: '8px', overflow: 'auto', padding: '12px', fontSize: '11px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#8fa3c4' }}>
            {pageSnapshot || <div style={{ color: '#4a5680' }}>Page content will appear here...</div>}
          </div>
        </div>

        <div style={{ flex: '0 0 55%', display: 'flex', flexDirection: 'column', padding: '16px', overflow: 'hidden' }}>
          <div style={{ background: '#0f1629', border: '1px solid #2a3d66', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#5865f2', fontWeight: 'bold', marginBottom: '4px' }}>Status: {status}</div>
                {progress.role && (
                  <>
                    <div style={{ fontSize: '13px', color: '#8fa3c4', marginTop: '4px' }}>{progress.role.toUpperCase()}</div>
                    <div style={{ fontSize: '12px', color: '#7289da' }}>{progress.page}</div>
                    <div style={{ fontSize: '11px', color: '#7289da', marginTop: '2px' }}>Pages: {progress.tested}</div>
                  </>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#5865f2' }}>{formatTime(elapsedTime)}</div>
                <div style={{ fontSize: '11px', color: '#7289da' }}>Timeout: {timeoutSeconds}m</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
              <button onClick={startCrawl} disabled={status === 'RUNNING'} style={{ background: status === 'RUNNING' ? '#4a5680' : '#5865f2', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: status === 'RUNNING' ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: '600' }}>🚀 Start</button>
              <button onClick={togglePause} disabled={status !== 'RUNNING'} style={{ background: status !== 'RUNNING' ? '#4a5680' : isPaused ? '#2a7f62' : '#5865f2', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: status !== 'RUNNING' ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: '600' }}>{isPaused ? '▶️ Resume' : '⏸️ Pause'}</button>
              <button onClick={stopCrawl} disabled={status !== 'RUNNING'} style={{ background: status !== 'RUNNING' ? '#4a5680' : '#f04747', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: status !== 'RUNNING' ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: '600' }}>⏹️ Stop</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#7289da', display: 'block', marginBottom: '4px' }}>Slow-Motion (ms)</label>
                <input type="range" min="0" max="3000" step="250" value={slowMotionMs} onChange={e => setSlowMotionMs(Number(e.target.value))} disabled={status === 'RUNNING'} style={{ width: '100%' }} />
                <div style={{ fontSize: '10px', color: '#4a5680', marginTop: '2px' }}>+{slowMotionMs}ms per page</div>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#7289da', display: 'block', marginBottom: '4px' }}>Timeout (min)</label>
                <input type="number" min="1" max="60" value={timeoutSeconds} onChange={e => setTimeoutSeconds(Number(e.target.value))} disabled={status === 'RUNNING'} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #2a3d66', background: '#1a2140', color: '#eef0f8' }} />
              </div>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#5865f2', marginBottom: '8px' }}>📋 ACTION LOG</div>
            <div ref={logRef} style={{ flex: 1, background: '#0f1629', border: '1px solid #2a3d66', borderRadius: '8px', padding: '12px', overflowY: 'auto', fontSize: '11px', fontFamily: 'monospace' }}>
              {actionLog.length === 0 ? (
                <div style={{ color: '#4a5680' }}>Click "Start" to begin...</div>
              ) : (
                actionLog.map((entry, idx) => (
                  <div key={idx} style={{ marginBottom: '6px', paddingBottom: '6px', borderBottom: '1px solid #1a2140' }}>
                    <span style={{ color: '#5865f2' }}>[{entry.timestamp}]</span>
                    <span style={{ color: entry.type === 'ERROR' ? '#f04747' : entry.type === 'BUG' ? '#faa61a' : entry.type === 'WARN' ? '#faa61a' : entry.type === 'SUCCESS' ? '#43b581' : '#7289da', fontWeight: 'bold', marginLeft: '8px', marginRight: '8px' }}>{entry.type}</span>
                    <span style={{ color: '#8fa3c4' }}>{entry.message}</span>
                    {entry.details && <span style={{ color: '#4a5680', marginLeft: '8px' }}>({entry.details})</span>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
