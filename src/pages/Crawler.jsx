import React, { useState, useRef, useEffect, useMemo } from 'react'
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

export default function CrawlerDashboard() {
  const { setCurrentUser } = useStore()
  const [status, setStatus] = useState('IDLE')
  const [progress, setProgress] = useState({ role: '', page: '', tested: 0, broken: 0 })
  const [actionLog, setActionLog] = useState([])
  const [results, setResults] = useState(null)
  const [slowMotionMs, setSlowMotionMs] = useState(500)
  const [isPaused, setIsPaused] = useState(false)
  const [pageSnapshot, setPageSnapshot] = useState('')
  const [currentPageUrl, setCurrentPageUrl] = useState('')
  const [elapsedTime, setElapsedTime] = useState(0)

  const logRef = useRef(null)
  const crawlRef = useRef({ active: false, paused: false })
  const timerRef = useRef(null)

  const log = (type, message, details = '') => {
    setActionLog(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), type, message, details, id: Math.random() }])
  }

  const waitWithPause = async (ms) => {
    const start = Date.now()
    while (Date.now() - start < ms) {
      if (crawlRef.current.paused) {
        await new Promise(resolve => setTimeout(resolve, 100))
      } else {
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    }
  }

  const startCrawl = async () => {
    setStatus('RUNNING')
    setActionLog([])
    setResults(null)
    setElapsedTime(0)
    crawlRef.current = { active: true, paused: false }

    const crawlResults = { timestamp: new Date().toISOString(), roles: {}, summary: { total: 0, issues: 0, blackPages: 0 } }

    try {
      for (const role of Object.keys(DEMO_ACCOUNTS)) {
        if (!crawlRef.current.active) break
        log('ROLE_START', `Testing ${role}`)
        setProgress(prev => ({ ...prev, role }))
        setCurrentUser(DEMO_ACCOUNTS[role])
        await waitWithPause(800)
        const roleReport = await crawlSingleRole(role)
        crawlResults.roles[role] = roleReport
        crawlResults.summary.total += roleReport.pagesVisited || 0
        crawlResults.summary.issues += roleReport.brokenButtons?.length || 0
        crawlResults.summary.blackPages += roleReport.blackPages?.length || 0
        log('ROLE_END', `Finished ${role}`)
      }
      setResults(crawlResults)
      setStatus('COMPLETE')
      log('SUCCESS', '✅ Crawl completed!')
    } catch (err) {
      log('ERROR', '❌ Crawl failed', err.message)
      setStatus('COMPLETE')
      setResults(crawlResults)
    }
  }

  const crawlSingleRole = async (role) => {
    const routes = ROLE_ROUTES[role]
    const report = { role, pagesVisited: 0, totalClickables: 0, brokenButtons: [], blackPages: [], deadEnds: [] }

    for (const route of routes) {
      if (!crawlRef.current.active) break
      setProgress(prev => ({ ...prev, page: route, tested: report.pagesVisited }))
      log('FETCH', `Loading ${route}`)

      try {
        // Fetch page HTML without navigating
        const pageUrl = `${window.location.origin}${route}`
        setCurrentPageUrl(pageUrl)

        await waitWithPause(500 + slowMotionMs)

        const response = await fetch(pageUrl)
        const html = await response.text()
        setPageSnapshot(html.slice(0, 3000))

        // Check page health
        const isBlank = html.length < 200 || (!html.includes('<main') && !html.includes('content'))
        const isBlack = html.includes('rgb(0, 0, 0)') && isBlank

        if (isBlack) {
          log('BUG', `⬛ Black page`, route)
          report.blackPages.push(route)
        } else if (isBlank) {
          log('WARN', `⚠️ No content`, route)
          report.deadEnds.push(route)
        } else {
          log('OK', `✓ Loaded (${html.length} chars)`)
        }

        report.pagesVisited += 1
        setProgress(prev => ({ ...prev, broken: report.brokenButtons.length }))
      } catch (err) {
        log('ERROR', `Fetch failed`, err.message)
      }
    }

    return report
  }

  const togglePause = () => {
    crawlRef.current.paused = !crawlRef.current.paused
    setIsPaused(!isPaused)
    log('ACTION', isPaused ? '▶️ Resumed' : '⏸️ Paused')
  }

  const stopCrawl = () => {
    crawlRef.current.active = false
    setStatus('COMPLETE')
    log('ACTION', '⏹️ Stopped')
  }

  const downloadReport = () => {
    if (!results) return
    const json = JSON.stringify(results, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `crawler-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (status === 'RUNNING' && !isPaused) {
      timerRef.current = setInterval(() => setElapsedTime(prev => prev + 1), 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [status, isPaused])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [actionLog])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e27', color: '#eef0f8', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #2a3d66', background: '#0f1629' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0' }}>🕷️ Crawler</h1>
        <p style={{ fontSize: '13px', color: '#7b8cb1', margin: 0 }}>Real-time navigation testing with visual preview</p>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: '16px', gap: '16px' }}>
        {/* Left: Page Preview */}
        <div style={{ flex: '45%', display: 'flex', flexDirection: 'column', background: '#0f1629', border: '1px solid #2a3d66', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '12px', borderBottom: '1px solid #2a3d66', fontSize: '12px', fontWeight: 'bold', color: '#5865f2' }}>📱 Page Preview</div>
          <div style={{ padding: '8px 12px', background: '#1a2140', fontSize: '10px', color: '#8fa3c4', fontFamily: 'monospace', wordBreak: 'break-all', borderBottom: '1px solid #2a3d66' }}>
            {currentPageUrl || 'Waiting...'}
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '12px', fontSize: '11px', fontFamily: 'monospace', color: '#8fa3c4', lineHeight: '1.4' }}>
            {pageSnapshot ? (
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{pageSnapshot}</pre>
            ) : (
              <div style={{ color: '#4a5680' }}>Click Start to begin testing...</div>
            )}
          </div>
        </div>

        {/* Right: Control + Log */}
        <div style={{ flex: '55%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Control Panel */}
          <div style={{ background: '#0f1629', border: '1px solid #2a3d66', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#5865f2', fontWeight: 'bold', marginBottom: '4px' }}>{status}</div>
                {progress.role && (
                  <div style={{ fontSize: '12px', color: '#8fa3c4', lineHeight: '1.6' }}>
                    <div>{progress.role.toUpperCase()}</div>
                    <div style={{ color: '#7289da', fontSize: '11px' }}>{progress.page}</div>
                    <div style={{ marginTop: '4px', fontSize: '11px' }}>
                      <span>Pages: {progress.tested}</span> | <span style={{ color: '#f04747' }}>Issues: {progress.broken}</span>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#5865f2' }}>{formatTime(elapsedTime)}</div>
                <div style={{ fontSize: '11px', color: '#7289da', marginTop: '4px' }}>elapsed</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button
                onClick={startCrawl}
                disabled={status === 'RUNNING'}
                style={{ flex: 1, background: status === 'RUNNING' ? '#4a5680' : '#5865f2', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: status === 'RUNNING' ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '600' }}>
                ▶️ Start
              </button>
              <button
                onClick={togglePause}
                disabled={status !== 'RUNNING'}
                style={{ flex: 1, background: status !== 'RUNNING' ? '#4a5680' : isPaused ? '#2a7f62' : '#5865f2', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: status !== 'RUNNING' ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '600' }}>
                {isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </button>
              <button
                onClick={stopCrawl}
                disabled={status !== 'RUNNING'}
                style={{ flex: 1, background: status !== 'RUNNING' ? '#4a5680' : '#f04747', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: status !== 'RUNNING' ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '600' }}>
                ⏹️ Stop
              </button>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#7289da', marginBottom: '6px' }}>🐢 Slow-Motion: {slowMotionMs}ms</div>
              <input type="range" min="0" max="3000" step="250" value={slowMotionMs} onChange={e => setSlowMotionMs(Number(e.target.value))} disabled={status === 'RUNNING'} style={{ width: '100%', cursor: status === 'RUNNING' ? 'not-allowed' : 'pointer' }} />
              <div style={{ fontSize: '10px', color: '#4a5680', marginTop: '4px' }}>Extra delay per page</div>
            </div>
          </div>

          {/* Action Log */}
          <div style={{ flex: 1, background: '#0f1629', border: '1px solid #2a3d66', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '12px', borderBottom: '1px solid #2a3d66', fontSize: '12px', fontWeight: 'bold', color: '#5865f2' }}>📋 Action Log</div>
            <div ref={logRef} style={{ flex: 1, overflow: 'auto', padding: '12px', fontSize: '11px', fontFamily: 'monospace', lineHeight: '1.5' }}>
              {actionLog.length === 0 ? (
                <div style={{ color: '#4a5680' }}>Waiting for test to start...</div>
              ) : (
                actionLog.map(entry => (
                  <div key={entry.id} style={{ marginBottom: '4px', color: entry.type === 'ERROR' ? '#f04747' : entry.type === 'BUG' ? '#faa61a' : entry.type === 'WARN' ? '#faa61a' : entry.type === 'OK' ? '#43b581' : '#7289da' }}>
                    <span style={{ color: '#5865f2' }}>[{entry.timestamp}]</span> <span style={{ fontWeight: 'bold' }}>{entry.type}</span> {entry.message}
                    {entry.details && <span style={{ color: '#4a5680' }}> ({entry.details})</span>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {results && (
        <div style={{ padding: '16px 20px', borderTop: '1px solid #2a3d66', background: '#0f1629', maxHeight: '180px', overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#5865f2' }}>✅ Test Results</h3>
            <button onClick={downloadReport} style={{ background: '#5865f2', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
              📥 Download JSON
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', fontSize: '12px' }}>
            <div style={{ background: '#1a2140', padding: '12px', borderRadius: '6px' }}>
              <div style={{ color: '#7289da', marginBottom: '4px', fontSize: '11px' }}>Pages Tested</div>
              <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#5865f2' }}>{results.summary.total}</div>
            </div>
            <div style={{ background: '#1a2140', padding: '12px', borderRadius: '6px' }}>
              <div style={{ color: '#7289da', marginBottom: '4px', fontSize: '11px' }}>Issues Found</div>
              <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#f04747' }}>{results.summary.issues}</div>
            </div>
            <div style={{ background: '#1a2140', padding: '12px', borderRadius: '6px' }}>
              <div style={{ color: '#7289da', marginBottom: '4px', fontSize: '11px' }}>Black Pages</div>
              <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#faa61a' }}>{results.summary.blackPages}</div>
            </div>
            <div style={{ background: '#1a2140', padding: '12px', borderRadius: '6px' }}>
              <div style={{ color: '#7289da', marginBottom: '4px', fontSize: '11px' }}>Elapsed Time</div>
              <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#43b581' }}>{formatTime(elapsedTime)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
