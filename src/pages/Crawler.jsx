import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useStore } from '@lib/store'

const DEMO_ACCOUNTS = {
  teacher: { name: 'Ms. Johnson', role: 'teacher' },
  student: { name: 'Marcus Houston', role: 'student' },
  parent: { name: 'Sarah Parent', role: 'parent' },
  admin: { name: 'Principal Admin', role: 'admin' },
  supportStaff: { name: 'Support Coordinator', role: 'supportStaff' }
}

const STARTING_ROUTES = {
  teacher: '/teacher',
  student: '/student',
  parent: '/parent',
  admin: '/admin',
  supportStaff: '/supportStaff'
}

export default function CrawlerDashboard() {
  const { setCurrentUser } = useStore()

  const [isRecording, setIsRecording] = useState(false)
  const [isPlayback, setIsPlayback] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordings, setRecordings] = useState([])
  const [playbackIndex, setPlaybackIndex] = useState(0)
  const [slowMotionMs, setSlowMotionMs] = useState(2000)
  const [actionLog, setActionLog] = useState([])
  const [results, setResults] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [cursorPos, setCursorPos] = useState(null)

  const logRef = useRef(null)
  const iframeRef = useRef(null)
  const crawlRef = useRef({ active: false })

  const log = (type, message, details = '') => {
    setActionLog(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), type, message, details, id: Math.random() }])
  }

  const currentRecording = useMemo(() => recordings[playbackIndex], [recordings, playbackIndex])

  // Wait with pause support
  const waitWithPause = async (ms) => {
    const start = Date.now()
    while (Date.now() - start < ms) {
      if (!crawlRef.current.active || isPaused) {
        await new Promise(resolve => setTimeout(resolve, 100))
      } else {
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    }
  }

  // Track clicks for cursor indicator
  useEffect(() => {
    const handleClick = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY })
      setTimeout(() => setCursorPos(null), 400)
    }
    if (isRecording || isPlayback) {
      window.addEventListener('click', handleClick)
    }
    return () => window.removeEventListener('click', handleClick)
  }, [isRecording, isPlayback])

  const startCrawl = async () => {
    setIsRecording(true)
    setIsPlayback(false)
    setRecordings([])
    setActionLog([])
    setResults(null)
    setElapsedTime(0)
    crawlRef.current.active = true

    const crawlResults = { timestamp: new Date().toISOString(), roles: {}, summary: { total: 0, blackPages: 0 } }
    let totalPages = 0

    try {
      for (const role of Object.keys(DEMO_ACCOUNTS)) {
        if (!crawlRef.current.active) break

        log('ROLE_START', `Testing ${role}`)
        setCurrentUser(DEMO_ACCOUNTS[role])
        await waitWithPause(1500)

        const roleReport = await crawlRole(role)
        crawlResults.roles[role] = roleReport
        totalPages += roleReport.pagesVisited || 0
        crawlResults.summary.total = totalPages
        crawlResults.summary.blackPages += roleReport.blackPages?.length || 0

        log('ROLE_END', `Finished ${role}`)
      }

      setResults(crawlResults)
      setIsRecording(false)
      setIsPlayback(true)
      setPlaybackIndex(0)
      log('SUCCESS', `✅ Recording complete! ${recordings.length} pages.`)
    } catch (err) {
      log('ERROR', 'Recording failed', err.message)
      setIsRecording(false)
    }
  }

  const crawlRole = async (role) => {
    const report = { role, pagesVisited: 0, blackPages: [] }
    const visited = new Set()
    const queue = [STARTING_ROUTES[role]]

    while (queue.length > 0 && crawlRef.current.active) {
      const route = queue.shift()
      if (visited.has(route)) continue
      visited.add(route)

      const pageUrl = `${window.location.origin}${route}`
      log('FETCH', `Loading ${route}`)

      try {
        // Wait with pause support
        await waitWithPause(slowMotionMs)

        // Add to recordings
        setRecordings(prev => [...prev, { url: pageUrl, role, route, timestamp: new Date().toLocaleTimeString() }])

        // Check page health
        const response = await fetch(pageUrl)
        const html = await response.text()

        const isBlank = html.length < 200
        const isBlack = html.includes('rgb(0, 0, 0)') && isBlank

        if (isBlack) {
          log('BUG', `⬛ Black page`, route)
          report.blackPages.push(route)
        } else if (isBlank) {
          log('WARN', `⚠️ No content`, route)
        } else {
          log('OK', `✓ Recorded`)
          
          // Find clickables (buttons/links) to follow
          const parser = new DOMParser()
          const doc = parser.parseFromString(html, 'text/html')
          
          doc.querySelectorAll('a[href]').forEach(a => {
            const href = a.getAttribute('href')
            if (href && !href.startsWith('#') && !href.startsWith('javascript:') && !visited.has(href)) {
              try {
                const url = new URL(href, pageUrl)
                if (url.origin === new URL(pageUrl).origin && !visited.has(url.pathname)) {
                  queue.push(url.pathname)
                }
              } catch (e) {}
            }
          })
        }

        report.pagesVisited += 1
      } catch (err) {
        log('ERROR', `Fetch failed`, err.message)
      }
    }

    return report
  }

  const togglePlayPause = () => {
    setIsPaused(!isPaused)
    log('ACTION', isPaused ? '▶️ Resumed' : '⏸️ Paused')
  }

  const rewind = () => {
    setPlaybackIndex(0)
    setIsPaused(true)
    log('ACTION', '⏮️ Rewound to start')
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

  // Auto-playback
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

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: '16px', gap: '16px', position: 'relative' }}>
        {/* Left: Page Preview */}
        <div style={{ flex: '45%', display: 'flex', flexDirection: 'column', background: '#0f1629', border: '1px solid #2a3d66', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '12px', borderBottom: '1px solid #2a3d66', fontSize: '12px', fontWeight: 'bold', color: '#5865f2' }}>📱 Preview</div>
          <div style={{ padding: '8px 12px', background: '#1a2140', fontSize: '10px', color: '#8fa3c4', fontFamily: 'monospace', wordBreak: 'break-all', borderBottom: '1px solid #2a3d66' }}>
            {currentRecording?.url || 'Start recording...'}
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
        </div>

        {/* Large Cursor Indicator */}
        {cursorPos && (
          <>
            {/* Outer ring */}
            <div
              style={{
                position: 'fixed',
                left: cursorPos.x - 24,
                top: cursorPos.y - 24,
                width: '48px',
                height: '48px',
                border: '4px solid #ff6b35',
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: 99999,
                boxShadow: '0 0 30px #ff6b35, 0 0 60px rgba(255, 107, 53, 0.6)',
                animation: 'fadeOutCursor 0.4s ease-out forwards'
              }}>
              <style>{`
                @keyframes fadeOutCursor {
                  0% { opacity: 1; transform: scale(1); }
                  100% { opacity: 0; transform: scale(0.3); }
                }
              `}</style>
            </div>
            {/* Center dot */}
            <div
              style={{
                position: 'fixed',
                left: cursorPos.x - 6,
                top: cursorPos.y - 6,
                width: '12px',
                height: '12px',
                background: '#ff6b35',
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: 100000,
                boxShadow: '0 0 20px #ff6b35',
                animation: 'fadeOutCursor 0.4s ease-out forwards'
              }}
            />
          </>
        )}

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
                      Step {playbackIndex + 1} / {recordings.length}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#5865f2' }}>{formatTime(elapsedTime)}</div>
                <div style={{ fontSize: '11px', color: '#7289da', marginTop: '4px' }}>elapsed</div>
              </div>
            </div>

            {!isPlayback && (
              <button
                onClick={startCrawl}
                disabled={isRecording}
                style={{ width: '100%', background: isRecording ? '#4a5680' : '#5865f2', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: isRecording ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
                ⏺️ {isRecording ? 'Recording...' : 'Start Recording'}
              </button>
            )}

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

                <div style={{ marginBottom: '12px' }}>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(0, recordings.length - 1)}
                    value={playbackIndex}
                    onChange={e => setPlaybackIndex(Number(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer', marginBottom: '6px' }}
                  />
                  <div style={{ fontSize: '10px', color: '#7289da' }}>
                    Step {playbackIndex + 1} / {recordings.length}
                  </div>
                </div>
              </>
            )}

            <div>
              <div style={{ fontSize: '11px', color: '#7289da', marginBottom: '6px' }}>🐢 Speed: {slowMotionMs}ms</div>
              <input
                type="range"
                min="500"
                max="5000"
                step="250"
                value={slowMotionMs}
                onChange={e => setSlowMotionMs(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
              <div style={{ fontSize: '10px', color: '#4a5680', marginTop: '4px' }}>Adjust in real-time</div>
            </div>
          </div>

          {/* Action Log */}
          <div style={{ flex: 1, background: '#0f1629', border: '1px solid #2a3d66', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '12px', borderBottom: '1px solid #2a3d66', fontSize: '12px', fontWeight: 'bold', color: '#5865f2' }}>📋 Log</div>
            <div ref={logRef} style={{ flex: 1, overflow: 'auto', padding: '12px', fontSize: '11px', fontFamily: 'monospace', lineHeight: '1.5' }}>
              {actionLog.length === 0 ? (
                <div style={{ color: '#4a5680' }}>Click "Start Recording"...</div>
              ) : (
                actionLog.map(entry => (
                  <div key={entry.id} style={{ marginBottom: '4px', color: entry.type === 'ERROR' ? '#f04747' : entry.type === 'BUG' ? '#faa61a' : entry.type === 'OK' ? '#43b581' : '#7289da' }}>
                    <span style={{ color: '#5865f2' }}>[{entry.timestamp}]</span> {entry.type} {entry.message}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {results && (
        <div style={{ padding: '16px 20px', borderTop: '1px solid #2a3d66', background: '#0f1629' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div style={{ background: '#1a2140', padding: '12px', borderRadius: '6px' }}>
              <div style={{ color: '#7289da', fontSize: '11px', marginBottom: '4px' }}>Pages</div>
              <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#5865f2' }}>{results.summary.total}</div>
            </div>
            <div style={{ background: '#1a2140', padding: '12px', borderRadius: '6px' }}>
              <div style={{ color: '#7289da', fontSize: '11px', marginBottom: '4px' }}>Black Pages</div>
              <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#faa61a' }}>{results.summary.blackPages}</div>
            </div>
            <div style={{ background: '#1a2140', padding: '12px', borderRadius: '6px' }}>
              <div style={{ color: '#7289da', fontSize: '11px', marginBottom: '4px' }}>Duration</div>
              <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#43b581' }}>{formatTime(elapsedTime)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
