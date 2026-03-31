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

  // Recording/Playback state
  const [isRecording, setIsRecording] = useState(false)
  const [isPlayback, setIsPlayback] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordings, setRecordings] = useState([])
  const [playbackIndex, setPlaybackIndex] = useState(0)
  const [slowMotionMs, setSlowMotionMs] = useState(500)
  const [actionLog, setActionLog] = useState([])
  const [results, setResults] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [cursorPos, setCursorPos] = useState(null)

  const logRef = useRef(null)
  const iframeRef = useRef(null)
  const timerRef = useRef(null)
  const crawlRef = useRef({ active: false })

  const log = (type, message, details = '') => {
    setActionLog(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), type, message, details, id: Math.random() }])
  }

  // Get current page being shown
  const currentRecording = useMemo(() => recordings[playbackIndex], [recordings, playbackIndex])

  // Start recording crawl
  const startCrawl = async () => {
    setIsRecording(true)
    setIsPlayback(false)
    setRecordings([])
    setActionLog([])
    setResults(null)
    setElapsedTime(0)
    crawlRef.current = { active: true }

    const crawlResults = { timestamp: new Date().toISOString(), roles: {}, summary: { total: 0, issues: 0, blackPages: 0 } }

    try {
      for (const role of Object.keys(DEMO_ACCOUNTS)) {
        if (!crawlRef.current.active) break
        log('ROLE_START', `Testing ${role}`)
        setCurrentUser(DEMO_ACCOUNTS[role])
        await new Promise(resolve => setTimeout(resolve, 800))
        const roleReport = await recordSingleRole(role)
        crawlResults.roles[role] = roleReport
        crawlResults.summary.total += roleReport.pagesVisited || 0
        crawlResults.summary.issues += roleReport.brokenButtons?.length || 0
        crawlResults.summary.blackPages += roleReport.blackPages?.length || 0
        log('ROLE_END', `Finished ${role}`)
      }
      setResults(crawlResults)
      setIsRecording(false)
      setIsPlayback(true)
      setPlaybackIndex(0)
      log('SUCCESS', '✅ Recording complete! Use playback controls to review.')
    } catch (err) {
      log('ERROR', 'Recording failed', err.message)
      setIsRecording(false)
    }
  }

  // Record single role
  const recordSingleRole = async (role) => {
    const routes = ROLE_ROUTES[role]
    const report = { role, pagesVisited: 0, totalClickables: 0, brokenButtons: [], blackPages: [], deadEnds: [] }

    for (const route of routes) {
      if (!crawlRef.current.active) break
      log('FETCH', `Recording ${route}`)

      try {
        const pageUrl = `${window.location.origin}${route}`
        const response = await fetch(pageUrl)
        const html = await response.text()

        // Store page snapshot (URL only, iframe will load it)
        setRecordings(prev => [...prev, { url: pageUrl, role, route, timestamp: new Date().toLocaleTimeString() }])

        // Check health
        const isBlank = html.length < 200
        const isBlack = html.includes('rgb(0, 0, 0)') && isBlank

        if (isBlack) {
          log('BUG', `⬛ Black page`, route)
          report.blackPages.push(route)
        } else if (isBlank) {
          log('WARN', `⚠️ No content`, route)
          report.deadEnds.push(route)
        } else {
          log('OK', `✓ Recorded`)
        }

        report.pagesVisited += 1
      } catch (err) {
        log('ERROR', `Record failed`, err.message)
      }
    }

    return report
  }

  // Playback controls
  const goToStep = (index) => {
    if (index >= 0 && index < recordings.length) {
      setPlaybackIndex(index)
      setIsPaused(true)
    }
  }

  const togglePlayPause = () => {
    setIsPaused(!isPaused)
  }

  const rewind = () => {
    setPlaybackIndex(0)
    setIsPaused(true)
  }

  const nextStep = () => {
    if (playbackIndex < recordings.length - 1) {
      setPlaybackIndex(playbackIndex + 1)
    }
  }

  const prevStep = () => {
    if (playbackIndex > 0) {
      setPlaybackIndex(playbackIndex - 1)
    }
  }

  // Auto-playback timer
  useEffect(() => {
    if (isPlayback && !isPaused && recordings.length > 0) {
      const timer = setTimeout(() => {
        if (playbackIndex < recordings.length - 1) {
          setPlaybackIndex(playbackIndex + 1)
        }
        setElapsedTime(prev => prev + 1)
      }, slowMotionMs)
      return () => clearTimeout(timer)
    }
  }, [isPlayback, isPaused, playbackIndex, recordings.length, slowMotionMs])

  // Show cursor on click
  useEffect(() => {
    const handleClick = (e) => {
      if (isRecording || isPlayback) {
        setCursorPos({ x: e.clientX, y: e.clientY })
        setTimeout(() => setCursorPos(null), 200)
      }
    }
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [isRecording, isPlayback])

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
        <p style={{ fontSize: '13px', color: '#7b8cb1', margin: 0 }}>Record & playback navigation tests with visual inspection</p>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: '16px', gap: '16px' }}>
        {/* Left: Page Preview */}
        <div style={{ flex: '45%', display: 'flex', flexDirection: 'column', background: '#0f1629', border: '1px solid #2a3d66', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
          <div style={{ padding: '12px', borderBottom: '1px solid #2a3d66', fontSize: '12px', fontWeight: 'bold', color: '#5865f2' }}>📱 Preview</div>
          <div style={{ padding: '8px 12px', background: '#1a2140', fontSize: '10px', color: '#8fa3c4', fontFamily: 'monospace', wordBreak: 'break-all', borderBottom: '1px solid #2a3d66' }}>
            {currentRecording?.url || 'Start recording to begin...'}
          </div>
          
          <iframe
            ref={iframeRef}
            key={currentRecording?.url}
            src={currentRecording?.url || 'about:blank'}
            style={{
              flex: 1,
              border: 'none',
              background: '#fff'
            }}
            sandbox="allow-same-origin allow-scripts allow-stylesheets allow-forms allow-popups"
            title="Page Preview"
          />

          {/* Click Indicator */}
          {cursorPos && (
            <div
              style={{
                position: 'fixed',
                left: cursorPos.x - 12,
                top: cursorPos.y - 12,
                width: '24px',
                height: '24px',
                border: '2px solid #f97316',
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: 9999,
                animation: 'fadeOut 0.3s ease-out'
              }}>
              <style>{`@keyframes fadeOut { to { opacity: 0; } }`}</style>
            </div>
          )}
        </div>

        {/* Right: Control + Log */}
        <div style={{ flex: '55%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Control Panel */}
          <div style={{ background: '#0f1629', border: '1px solid #2a3d66', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#5865f2', fontWeight: 'bold', marginBottom: '4px' }}>
                  {isRecording ? 'RECORDING' : isPlayback ? 'PLAYBACK' : 'IDLE'}
                </div>
                {currentRecording && (
                  <div style={{ fontSize: '12px', color: '#8fa3c4' }}>
                    <div>{currentRecording.role.toUpperCase()}</div>
                    <div style={{ color: '#7289da', fontSize: '11px' }}>{currentRecording.route}</div>
                    <div style={{ marginTop: '4px', fontSize: '11px' }}>
                      Step {playbackIndex + 1} of {recordings.length}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#5865f2' }}>{formatTime(elapsedTime)}</div>
                <div style={{ fontSize: '11px', color: '#7289da', marginTop: '4px' }}>elapsed</div>
              </div>
            </div>

            {/* Record Button */}
            {!isPlayback && (
              <button
                onClick={startCrawl}
                disabled={isRecording}
                style={{ width: '100%', background: isRecording ? '#4a5680' : '#5865f2', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: isRecording ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
                ⏺️ {isRecording ? 'Recording...' : 'Start Recording'}
              </button>
            )}

            {/* Playback Controls */}
            {isPlayback && (
              <>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <button onClick={rewind} style={{ flex: 1, background: '#5865f2', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                    ⏮️ Rewind
                  </button>
                  <button onClick={prevStep} style={{ flex: 1, background: '#5865f2', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                    ⬅️ Prev
                  </button>
                  <button onClick={togglePlayPause} style={{ flex: 1, background: isPaused ? '#2a7f62' : '#5865f2', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                    {isPaused ? '▶️ Play' : '⏸️ Pause'}
                  </button>
                  <button onClick={nextStep} style={{ flex: 1, background: '#5865f2', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                    Next ➡️
                  </button>
                </div>

                {/* Timeline Slider */}
                <div style={{ marginBottom: '12px' }}>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(0, recordings.length - 1)}
                    value={playbackIndex}
                    onChange={e => goToStep(Number(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer', marginBottom: '6px' }}
                  />
                  <div style={{ fontSize: '10px', color: '#7289da' }}>
                    Step {playbackIndex + 1} / {recordings.length}
                  </div>
                </div>
              </>
            )}

            {/* Real-time Slow-Motion Slider */}
            <div>
              <div style={{ fontSize: '11px', color: '#7289da', marginBottom: '6px' }}>🐢 Playback Speed: {slowMotionMs}ms</div>
              <input
                type="range"
                min="100"
                max="3000"
                step="100"
                value={slowMotionMs}
                onChange={e => setSlowMotionMs(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
              <div style={{ fontSize: '10px', color: '#4a5680', marginTop: '4px' }}>Adjust in real-time while playing</div>
            </div>
          </div>

          {/* Action Log */}
          <div style={{ flex: 1, background: '#0f1629', border: '1px solid #2a3d66', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '12px', borderBottom: '1px solid #2a3d66', fontSize: '12px', fontWeight: 'bold', color: '#5865f2' }}>📋 Action Log</div>
            <div ref={logRef} style={{ flex: 1, overflow: 'auto', padding: '12px', fontSize: '11px', fontFamily: 'monospace', lineHeight: '1.5' }}>
              {actionLog.length === 0 ? (
                <div style={{ color: '#4a5680' }}>Click "Start Recording" to begin...</div>
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
        <div style={{ padding: '16px 20px', borderTop: '1px solid #2a3d66', background: '#0f1629', maxHeight: '120px', overflow: 'auto' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold', color: '#5865f2' }}>✅ Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '12px' }}>
            <div style={{ background: '#1a2140', padding: '12px', borderRadius: '6px' }}>
              <div style={{ color: '#7289da', marginBottom: '4px', fontSize: '11px' }}>Pages Recorded</div>
              <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#5865f2' }}>{results.summary.total}</div>
            </div>
            <div style={{ background: '#1a2140', padding: '12px', borderRadius: '6px' }}>
              <div style={{ color: '#7289da', marginBottom: '4px', fontSize: '11px' }}>Black Pages</div>
              <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#faa61a' }}>{results.summary.blackPages}</div>
            </div>
            <div style={{ background: '#1a2140', padding: '12px', borderRadius: '6px' }}>
              <div style={{ color: '#7289da', marginBottom: '4px', fontSize: '11px' }}>Issues</div>
              <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#f04747' }}>{results.summary.issues}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
