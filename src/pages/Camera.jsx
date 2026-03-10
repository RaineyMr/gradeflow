import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useStore } from '../lib/store'
import { AssignmentOptions } from '../components/ui'
import { scanGradedDocument } from '../lib/ai'

export default function Camera() {
  const { classes, activeClass, addAssignment } = useStore()
  const [mode, setMode] = useState('menu')
  const [assignType, setAssignType] = useState('quiz')
  const [options, setOptions] = useState({ lockdown: false, timer: false, shuffle: false, schedule: false, monitor: false })
  const [capturedImage, setCapturedImage] = useState(null)
  const [capturedBase64, setCapturedBase64] = useState(null)
  const [assignName, setAssignName] = useState('')
  const [selectedClass, setSelectedClass] = useState(activeClass?.id || classes[0]?.id)
  const [cameraError, setCameraError] = useState(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [scanError, setScanError] = useState(null)
  const [manualScore, setManualScore] = useState('')
  const [manualTotal, setManualTotal] = useState('100')

  const streamRef = useRef(null)
  const canvasRef = useRef(null)
  const fileRef   = useRef(null)

  const typeConfig = [
    { id: 'test',          label: 'Test',  weight: '40%', color: '#f04a4a' },
    { id: 'quiz',          label: 'Quiz',  weight: '30%', color: '#f5a623' },
    { id: 'participation', label: 'Part.', weight: '10%', color: '#9b6ef5' },
    { id: 'homework',      label: 'Other', weight: '20%', color: '#22c97a' },
  ]

  function stopStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setCameraReady(false)
  }

  // Clean up stream when component unmounts
  useEffect(() => () => stopStream(), [])

  // â”€â”€ Callback ref for video element â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // This fires immediately when the <video> DOM node mounts, attaching the
  // stream before any browser-specific timing quirks can interfere.
  const videoCallbackRef = useCallback((node) => {
    if (!node) return
    const stream = streamRef.current
    if (!stream) return

    node.srcObject = stream
    node.muted     = true

    // Listen for the video to be ready before showing the capture button
    node.addEventListener('canplay', () => setCameraReady(true), { once: true })
    node.addEventListener('loadedmetadata', () => {
      node.play().catch(() => {
        // autoplay blocked â€” try muted play (already muted) then retry once
        node.muted = true
        node.play().catch(err => {
          setCameraError('Camera started but video could not play: ' + err.message)
        })
      })
    }, { once: true })

    node.load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function openCamera() {
    setCameraError(null)
    setCameraReady(false)

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        location.protocol === 'http:' && location.hostname !== 'localhost'
          ? 'Camera requires HTTPS. Use the Vercel URL (https://â€¦)'
          : 'This browser does not support camera access. Try Chrome or Safari.'
      )
      return
    }

    // Try progressively simpler constraints until one works
    const attempts = [
      { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } } },
      { video: { facingMode: 'environment' } },
      { video: { facingMode: 'user' } },
      { video: true },
    ]

    let stream = null
    let lastErr = null
    for (const c of attempts) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(c)
        break
      } catch (err) {
        lastErr = err
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') break
      }
    }

    if (!stream) {
      const n = lastErr?.name
      setCameraError(
        n === 'NotAllowedError' || n === 'PermissionDeniedError'
          ? 'Camera permission denied. Tap the lock icon in your address bar, allow camera, then retry.'
          : n === 'NotFoundError'
          ? 'No camera found on this device. Use Upload instead.'
          : n === 'NotReadableError'
          ? 'Camera is in use by another app. Close it and retry.'
          : `Camera error (${n || 'unknown'}). Use Upload instead.`
      )
      return
    }

    streamRef.current = stream
    setMode('camera') // triggers re-render â†’ videoCallbackRef fires on the new <video> element
  }

  function capturePhoto() {
    const canvas = canvasRef.current
    if (!canvas || !streamRef.current) return

    // Find the live video element in the DOM
    const video = document.querySelector('video[data-gradeflow-camera]')
    if (!video) return

    const w = video.videoWidth  || 1280
    const h = video.videoHeight || 720
    canvas.width  = w
    canvas.height = h
    canvas.getContext('2d').drawImage(video, 0, 0, w, h)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
    stopStream()
    processImage(dataUrl, dataUrl.split(',')[1], 'image/jpeg')
  }

  function handleFileSelect(e) {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''
    const reader = new FileReader()
    reader.onload = ev => {
      const dataUrl = ev.target.result
      processImage(dataUrl, dataUrl.split(',')[1], file.type || 'image/jpeg')
    }
    reader.readAsDataURL(file)
  }

  function processImage(dataUrl, base64, mime) {
    setCapturedImage(dataUrl)
    setCapturedBase64(base64)
    setScanResult(null)
    setScanError(null)
    setMode('processing')
    runAI(base64, mime)
  }

  async function runAI(base64, mime) {
    try {
      const result = await scanGradedDocument(base64, mime)
      setScanResult(result)
      if (result.assignmentTitle) setAssignName(result.assignmentTitle)
      if (result.documentType) {
        const map = { quiz: 'quiz', test: 'test', homework: 'homework', worksheet: 'homework' }
        setAssignType(map[result.documentType] || 'quiz')
      }
      if (result.earnedPoints != null) setManualScore(String(result.earnedPoints))
      if (result.totalPoints  != null) setManualTotal(String(result.totalPoints))
    } catch (err) {
      setScanError(err.message)
    }
    setMode('review')
  }

  function calcPercentage() {
    const s = parseFloat(manualScore), t = parseFloat(manualTotal)
    if (!isNaN(s) && !isNaN(t) && t > 0) return Math.round((s / t) * 100)
    if (scanResult?.percentage != null) return Math.round(scanResult.percentage)
    return null
  }

  function letterFromPct(pct) {
    if (pct == null) return null
    if (pct >= 90) return 'A'
    if (pct >= 80) return 'B'
    if (pct >= 70) return 'C'
    if (pct >= 60) return 'D'
    return 'F'
  }

  function handlePost() {
    const pct = calcPercentage()
    addAssignment({
      name:    assignName || 'Scanned Assignment',
      type:    assignType,
      classId: selectedClass,
      date:    new Date().toISOString().split('T')[0],
      weight:  typeConfig.find(t => t.id === assignType)?.weight?.replace('%', '') || 30,
      options,
      scannedScore:  pct,
      scannedEarned: parseFloat(manualScore) || null,
      scannedTotal:  parseFloat(manualTotal) || null,
    })
    setMode('done')
  }

  function resetAll() {
    stopStream()
    setCapturedImage(null);  setCapturedBase64(null)
    setScanResult(null);     setScanError(null)
    setAssignName('');       setManualScore('');  setManualTotal('100')
    setCameraError(null);    setMode('menu')
  }

  // â”€â”€ Done â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (mode === 'done') return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-6xl mb-4">âœ…</div>
      <h2 className="font-display font-bold text-xl text-text-primary mb-2">Posted to Gradebook</h2>
      <p className="text-text-muted text-sm mb-6">Assignment added Â· Students will be notified</p>
      <button onClick={resetAll} className="px-6 py-2.5 rounded-pill font-bold text-white" style={{ background: 'var(--school-color)' }}>
        Scan Another
      </button>
    </div>
  )

  // â”€â”€ Processing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (mode === 'processing') return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {capturedImage && (
        <div className="w-28 h-28 rounded-card overflow-hidden mb-6 border border-elevated opacity-70">
          <img src={capturedImage} alt="Scanning" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="font-semibold text-text-primary mb-1">Claude Vision is reading this paper</p>
      <p className="text-text-muted text-sm">Detecting score format Â· Calculating grade...</p>
    </div>
  )

  // â”€â”€ Live camera viewfinder â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (mode === 'camera') return (
    <div>
      <button
        onClick={() => { stopStream(); setMode('menu') }}
        className="flex items-center gap-2 text-text-muted text-sm mb-4 hover:text-text-primary"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        âœ• Cancel
      </button>

      <div className="relative rounded-widget overflow-hidden bg-black mb-4" style={{ aspectRatio: '4/3', maxHeight: '60vh' }}>
        {/* data attribute used by capturePhoto() to find this element */}
        <video
          ref={videoCallbackRef}
          data-gradeflow-camera="1"
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />

        {!cameraReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-white text-sm opacity-60">Starting camera...</p>
            </div>
          </div>
        )}

        {cameraReady && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative" style={{ width: '80%', height: '80%' }}>
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white" />
            </div>
          </div>
        )}
      </div>

      {/* Hidden canvas used by capturePhoto() */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <p className="text-center text-text-muted text-xs mb-4">Fill the frame with the graded paper</p>
      <button
        onClick={capturePhoto}
        disabled={!cameraReady}
        className="w-full py-4 rounded-widget font-display font-bold text-lg text-white disabled:opacity-40"
        style={{ background: cameraReady ? 'linear-gradient(135deg, var(--school-color), #5c9ef8)' : '#1e2231', border: 'none', cursor: cameraReady ? 'pointer' : 'default' }}>
        {cameraReady ? 'ðŸ“¸ Capture & Scan' : 'Starting camera...'}
      </button>
    </div>
  )

  // â”€â”€ Review & Post â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (mode === 'review') {
    const pct = calcPercentage()
    const letter = letterFromPct(pct)
    const sr = scanResult
    const scoreColor = pct >= 90 ? '#22c97a' : pct >= 70 ? '#f5a623' : '#f04a4a'

    return (
      <div>
        <button onClick={resetAll} className="flex items-center gap-2 text-text-muted text-sm mb-4 hover:text-text-primary" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>â† Scan Again</button>
        <h1 className="font-display font-bold text-xl text-text-primary mb-4">Review & Post</h1>

        {sr && !scanError && (
          <div className="p-4 rounded-card mb-4" style={{ background: '#0d1520', border: '1px solid #3b7ef430' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2 py-0.5 rounded-pill font-bold" style={{ background: '#9b6ef520', color: '#9b6ef5' }}>ðŸ¤– Claude Vision</span>
              <span className="text-xs px-2 py-0.5 rounded-pill font-bold"
                style={{ background: sr.confidence === 'high' ? '#22c97a20' : '#f5a62320', color: sr.confidence === 'high' ? '#22c97a' : '#f5a623' }}>
                {sr.confidence} confidence
              </span>
            </div>
            <div className="p-3 rounded-card mb-3" style={{ background: '#161923', border: '1px solid #2a2f42' }}>
              <p className="tag-label mb-1">Scoring system detected</p>
              <p className="font-semibold text-text-primary text-sm">{sr.scoringSystemLabel}</p>
              <p className="text-text-muted mt-0.5" style={{ fontSize: '11px' }}>{sr.scoringExplanation}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="p-2 rounded-card text-center" style={{ background: '#161923' }}>
                <p className="tag-label mb-1">Earned</p>
                <p className="font-display font-bold text-lg text-white">{sr.earnedPoints ?? 'â€”'}</p>
              </div>
              <div className="p-2 rounded-card text-center" style={{ background: '#161923' }}>
                <p className="tag-label mb-1">Out of</p>
                <p className="font-display font-bold text-lg text-white">{sr.totalPoints ?? 'â€”'}</p>
              </div>
              <div className="p-2 rounded-card text-center" style={{ background: pct >= 70 ? '#0f2a1a' : '#1c1012' }}>
                <p className="tag-label mb-1">Grade</p>
                <p className="font-display font-bold text-lg" style={{ color: scoreColor }}>{pct != null ? `${pct}%` : 'â€”'}</p>
              </div>
            </div>
            {sr.studentName   && <p className="text-xs text-text-muted mb-1">ðŸ‘¤ <span className="text-text-primary font-medium">{sr.studentName}</span></p>}
            {sr.missedPoints  != null && <p className="text-xs text-text-muted mb-1">Missed: <span className="text-text-primary font-medium">-{sr.missedPoints}</span>{sr.totalPoints != null ? ` / ${sr.totalPoints}` : ''}</p>}
            {sr.questionsFound?.length > 0 && <p className="text-xs text-text-muted mb-1">{sr.questionsFound.filter(q => q.correct).length}/{sr.questionsFound.length} questions correct</p>}
            {sr.teacherComments && <p className="text-xs text-text-muted mt-1">ðŸ“ "{sr.teacherComments}"</p>}
            {sr.issues && <p className="mt-2 text-xs" style={{ color: '#f5a623' }}>âš  {sr.issues}</p>}
          </div>
        )}

        {scanError && (
          <div className="p-3 rounded-card mb-4" style={{ background: '#1c1012', border: '1px solid #f04a4a30' }}>
            <p className="font-semibold text-sm mb-1" style={{ color: '#f04a4a' }}>âš  Couldn't read automatically</p>
            <p className="text-xs opacity-80" style={{ color: '#f04a4a' }}>{scanError}</p>
            <p className="text-xs text-text-muted mt-1">Enter the score manually below.</p>
          </div>
        )}

        <div className="p-4 rounded-card mb-4" style={{ background: '#161923', border: '1px solid #2a2f42' }}>
          <p className="tag-label mb-3">{sr ? 'Verify or correct the score' : 'Enter score manually'}</p>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1">
              <label className="tag-label block mb-1">Points earned</label>
              <input type="number" min="0"
                className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm text-center font-bold"
                placeholder="e.g. 82" value={manualScore} onChange={e => setManualScore(e.target.value)} />
            </div>
            <span className="text-text-muted font-bold text-lg mt-5">/</span>
            <div className="flex-1">
              <label className="tag-label block mb-1">Total points</label>
              <input type="number" min="1"
                className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm text-center font-bold"
                placeholder="e.g. 100" value={manualTotal} onChange={e => setManualTotal(e.target.value)} />
            </div>
            <div className="flex-1 mt-5">
              <div className="p-2 rounded-card text-center" style={{ background: pct != null ? (pct >= 70 ? '#0f2a1a' : '#1c1012') : '#1e2231' }}>
                <p className="font-display font-bold text-xl" style={{ color: pct != null ? scoreColor : '#6b7494' }}>{pct != null ? `${pct}%` : 'â€”'}</p>
                {letter && <p className="text-xs font-bold" style={{ color: '#6b7494' }}>{letter}</p>}
              </div>
            </div>
          </div>
          <p className="tag-label mb-2">Common totals</p>
          <div className="flex gap-2 mb-3">
            {['100', '50', '25', '20', '10'].map(t => (
              <button key={t} onClick={() => setManualTotal(t)}
                className="flex-1 py-1 rounded-pill text-xs font-semibold"
                style={{ background: manualTotal === t ? 'var(--school-color)' : '#1e2231', color: manualTotal === t ? 'white' : '#6b7494', border: 'none', cursor: 'pointer' }}>
                /{t}
              </button>
            ))}
          </div>
          <div className="p-2 rounded-card text-xs text-text-muted" style={{ background: '#0d1520' }}>
            <span className="font-semibold text-text-primary">Tip: </span>
            If teacher wrote âˆ’8 on a 100pt test, enter 92/100. If 17/20, enter 17/20 = 85%.
          </div>
        </div>

        {capturedImage && (
          <div className="mb-4 rounded-card overflow-hidden border border-elevated" style={{ maxHeight: 160 }}>
            <img src={capturedImage} alt="Captured" className="w-full object-contain" />
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="tag-label block mb-1">Assignment Name</label>
            <input className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm"
              placeholder="e.g. Chapter 4 Quiz" value={assignName} onChange={e => setAssignName(e.target.value)} />
          </div>
          <div>
            <label className="tag-label block mb-2">Class</label>
            <div className="flex flex-wrap gap-2">
              {classes.map(c => (
                <button key={c.id} onClick={() => setSelectedClass(c.id)}
                  className="px-3 py-1.5 rounded-pill text-xs font-semibold"
                  style={{ background: selectedClass === c.id ? 'var(--school-color)' : '#1e2231', color: selectedClass === c.id ? 'white' : '#6b7494', border: 'none', cursor: 'pointer' }}>
                  {c.period} Â· {c.subject}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="tag-label block mb-2">Assignment Type</label>
            <div className="grid grid-cols-4 gap-2">
              {typeConfig.map(t => (
                <button key={t.id} onClick={() => setAssignType(t.id)}
                  className="py-2 rounded-card text-xs font-bold"
                  style={{ background: assignType === t.id ? `${t.color}22` : '#1e2231', color: assignType === t.id ? t.color : '#6b7494', border: `1px solid ${assignType === t.id ? t.color + '40' : 'transparent'}`, cursor: 'pointer' }}>
                  <div>{t.label}</div>
                  <div style={{ fontSize: '9px', opacity: 0.7 }}>{t.weight}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="p-3 rounded-card" style={{ background: '#161923' }}>
            <AssignmentOptions options={options} onChange={setOptions} />
          </div>
          {pct == null && (
            <p className="text-center text-xs mb-2" style={{ color: '#f5a623' }}>
              âš  Enter points earned and total above to calculate grade
            </p>
          )}
          <button onClick={handlePost} disabled={pct == null}
            className="w-full py-3 rounded-pill font-bold text-white disabled:opacity-40"
            style={{ background: 'var(--school-color)', border: 'none', cursor: pct != null ? 'pointer' : 'default' }}>
            Post {pct != null ? `${pct}% (${letter})` : 'â€” enter score above'} to Gradebook â†’
          </button>
        </div>
      </div>
    )
  }

  // â”€â”€ Main menu â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-text-primary mb-1">Scan & Grade</h1>
      <p className="text-text-muted text-sm mb-6">AI reads any scoring format â€” 82/100, âˆ’8 missed, 17/20, letter grades, percentages</p>

      {cameraError && (
        <div className="p-4 rounded-card mb-4" style={{ background: '#1c1012', border: '1px solid #f04a4a30' }}>
          <p className="font-semibold mb-1" style={{ color: '#f04a4a' }}>âš  Camera unavailable</p>
          <p className="text-sm" style={{ color: '#f04a4a', opacity: 0.85 }}>{cameraError}</p>
        </div>
      )}

      <div className="grid gap-4 mb-6">
        <button onClick={openCamera}
          className="p-8 rounded-widget flex flex-col items-center gap-3"
          style={{ background: 'linear-gradient(135deg, #1a2a4a, #0f1a2e)', border: '1px solid #3b7ef440', cursor: 'pointer', transition: 'opacity .15s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          <span className="text-6xl">ðŸ“·</span>
          <p className="font-display font-bold text-lg text-text-primary">Use Camera</p>
          <p className="text-text-muted text-sm text-center">Point at the graded paper Â· AI reads the score</p>
        </button>

        <button onClick={() => fileRef.current?.click()}
          className="p-6 rounded-widget flex flex-col items-center gap-3"
          style={{ background: '#161923', border: '1px solid #2a2f42', cursor: 'pointer', transition: 'opacity .15s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          <span className="text-4xl">ðŸ–¼</span>
          <p className="font-bold text-text-primary">Upload Photo or File</p>
          <p className="text-text-muted text-sm">Photo from camera roll Â· PDF Â· Any image</p>
        </button>
      </div>

      <div className="p-3 rounded-card" style={{ background: '#161923' }}>
        <p className="tag-label mb-2 text-center">Scoring formats AI understands</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {['82 / 100', 'âˆ’8 missed', '17 / 20', '94%', 'Letter Aâ€“F', 'Rubric score', 'Raw points'].map(f => (
            <span key={f} className="px-2 py-0.5 rounded-pill text-xs" style={{ background: '#1e2231', color: '#6b7494' }}>{f}</span>
          ))}
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileSelect} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}
