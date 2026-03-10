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
  const videoRef  = useRef(null)
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

  useEffect(() => () => stopStream(), [])

  // FIX: attachStream is called explicitly after we know both the stream
  // and the video element are ready, eliminating the race condition.
  const attachStream = useCallback((stream) => {
    const video = videoRef.current
    if (!video) return

    video.srcObject = stream
    if (typeof video.load === 'function') video.load()

    const tryPlay = () => {
      const p = video.play()
      if (p !== undefined) {
        p.then(() => setCameraReady(true)).catch(() => {
          video.muted = true
          video.play()
            .then(() => setCameraReady(true))
            .catch(err => {
              setCameraError('Could not start camera: ' + err.message)
              stopStream()
              setMode('menu')
            })
        })
      } else {
        video.addEventListener('canplay', () => setCameraReady(true), { once: true })
      }
    }

    // If the video element is already in the DOM, play immediately.
    // Otherwise wait one frame for React to commit the camera view.
    if (video.isConnected) {
      tryPlay()
    } else {
      requestAnimationFrame(() => {
        if (videoRef.current) tryPlay()
      })
    }
  }, [])

  async function openCamera() {
    setCameraError(null)
    setCameraReady(false)

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        location.protocol === 'http:' && location.hostname !== 'localhost'
          ? 'Camera requires HTTPS. Use the Vercel URL (https://â€¦)'
          : 'Browser does not support camera. Try Chrome or Safari, or upload instead.'
      )
      return
    }

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
          ? 'No camera found. Use Upload instead.'
          : n === 'NotReadableError'
          ? 'Camera in use by another app. Close it and retry.'
          : `Camera error (${n || 'unknown'}). Use Upload instead.`
      )
      return
    }

    // Store the stream FIRST, then switch mode.
    // The camera view renders, then we attach via a callback ref on the video element.
    streamRef.current = stream
    setMode('camera')
  }

  // FIX: Use a callback ref on <video> so we attach the stream the moment
  // the video element mounts into the DOM â€” no timing issues.
  const videoCallbackRef = useCallback((node) => {
    videoRef.current = node
    if (node && streamRef.current) {
      attachStream(streamRef.current)
    }
  }, [attachStream])

  function capturePhoto() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    const w = video.videoWidth || 1280
    const h = video.videoHeight || 720
    canvas.width = w
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
      if (result.totalPoints != null)  setManualTotal(String(result.totalPoints))
      setMode('review')
    } catch (err) {
      setScanError(err.message || 'Scan failed')
      setMode('review')
    }
  }

  function calcPercentage() {
    const earned = parseFloat(manualScore)
    const total  = parseFloat(manualTotal)
    if (isNaN(earned) || isNaN(total) || total === 0) return null
    return Math.round((earned / total) * 100)
  }

  function letterFromPct(pct) {
    if (pct == null) return 'â€”'
    if (pct >= 90) return 'A'
    if (pct >= 80) return 'B'
    if (pct >= 70) return 'C'
    if (pct >= 60) return 'D'
    return 'F'
  }

  function resetAll() {
    stopStream()
    setCapturedImage(null)
    setCapturedBase64(null)
    setScanResult(null)
    setScanError(null)
    setManualScore('')
    setManualTotal('100')
    setAssignName('')
    setMode('menu')
  }

  function postToGradebook() {
    const pct = calcPercentage()
    if (pct == null) return
    const cls = classes.find(c => c.id === Number(selectedClass))
    addAssignment({
      classId: Number(selectedClass),
      name: assignName || `Scanned ${assignType}`,
      type: assignType,
      weight: typeConfig.find(t => t.id === assignType)?.weight?.replace('%','') || 30,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      hasKey: true,
      scannedScore: pct,
      aiGraded: !!scanResult,
      aiConfidence: scanResult?.confidence || 'low',
    })
    setMode('posted')
  }

  // â”€â”€ Screens â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  if (mode === 'posted') return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-6xl mb-4">âœ…</div>
      <h2 className="font-display font-bold text-xl text-text-primary mb-2">Posted to Gradebook</h2>
      <p className="text-text-muted text-sm mb-6">Assignment added Â· Students will be notified</p>
      <button onClick={resetAll} className="px-6 py-2.5 rounded-pill font-bold text-white" style={{ background: 'var(--school-color)' }}>Scan Another</button>
    </div>
  )

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

  if (mode === 'camera') return (
    <div>
      <button onClick={() => { stopStream(); setMode('menu') }} className="flex items-center gap-2 text-text-muted text-sm mb-4 hover:text-text-primary">âœ• Cancel</button>
      <div className="relative rounded-widget overflow-hidden bg-black mb-4" style={{ aspectRatio: '4/3', maxHeight: '60vh' }}>
        {/* FIX: use callback ref instead of plain ref */}
        <video ref={videoCallbackRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ display: 'block' }} />
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
            <div className="relative w-4/5 h-4/5">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white" />
            </div>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <p className="text-center text-text-muted text-xs mb-4">Fill the frame with the graded paper</p>
      <button onClick={capturePhoto} disabled={!cameraReady}
        className="w-full py-4 rounded-widget font-display font-bold text-lg text-white disabled:opacity-40"
        style={{ background: cameraReady ? 'linear-gradient(135deg, var(--school-color), #5c9ef8)' : '#1e2231' }}>
        {cameraReady ? 'ðŸ“¸ Capture & Scan' : 'Starting camera...'}
      </button>
    </div>
  )

  if (mode === 'review') {
    const pct = calcPercentage()
    const letter = letterFromPct(pct)
    const sr = scanResult
    const scoreColor = pct >= 90 ? '#22c97a' : pct >= 70 ? '#f5a623' : '#f04a4a'

    return (
      <div>
        <button onClick={resetAll} className="flex items-center gap-2 text-text-muted text-sm mb-4 hover:text-text-primary">â† Scan Again</button>
        <h1 className="font-display font-bold text-xl text-text-primary mb-4">Review & Post</h1>

        {sr && !scanError && (
          <div className="p-4 rounded-card mb-4" style={{ background: '#0d1520', border: '1px solid #3b7ef430' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2 py-0.5 rounded-pill font-bold" style={{ background: '#9b6ef520', color: '#9b6ef5' }}>ðŸ¤– Claude Vision</span>
              <span className="text-xs px-2 py-0.5 rounded-pill font-bold"
                style={{
                  background: sr.confidence === 'high' ? '#22c97a20' : '#f5a62320',
                  color: sr.confidence === 'high' ? '#22c97a' : '#f5a623'
                }}>
                {sr.confidence === 'high' ? 'âœ“ High confidence' : 'âš  Low confidence â€” verify'}
              </span>
            </div>
            <p className="text-sm text-text-primary">{sr.rawText}</p>
          </div>
        )}

        {scanError && (
          <div className="p-4 rounded-card mb-4" style={{ background: '#1c1012', border: '1px solid #f04a4a30' }}>
            <p className="font-semibold mb-1" style={{ color: '#f04a4a' }}>âš  Scan error</p>
            <p className="text-sm" style={{ color: '#f04a4a', opacity: 0.85 }}>{scanError}</p>
            <p className="text-text-muted text-sm mt-2">Enter score manually below.</p>
          </div>
        )}

        <div className="space-y-3 mb-4">
          <div>
            <label className="tag-label block mb-1">Assignment name</label>
            <input value={assignName} onChange={e => setAssignName(e.target.value)}
              placeholder="e.g. Ch.4 Quiz"
              className="w-full px-3 py-2 rounded-card text-sm text-text-primary"
              style={{ background: '#1e2231', border: '1px solid #2a2f42' }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="tag-label block mb-1">Points earned</label>
              <input value={manualScore} onChange={e => setManualScore(e.target.value)}
                placeholder="e.g. 82" type="number"
                className="w-full px-3 py-2 rounded-card text-sm text-text-primary"
                style={{ background: '#1e2231', border: '1px solid #2a2f42' }} />
            </div>
            <div>
              <label className="tag-label block mb-1">Total points</label>
              <input value={manualTotal} onChange={e => setManualTotal(e.target.value)}
                placeholder="e.g. 100" type="number"
                className="w-full px-3 py-2 rounded-card text-sm text-text-primary"
                style={{ background: '#1e2231', border: '1px solid #2a2f42' }} />
            </div>
          </div>
          <div>
            <label className="tag-label block mb-1">Assignment type</label>
            <div className="flex gap-2">
              {typeConfig.map(t => (
                <button key={t.id} onClick={() => setAssignType(t.id)}
                  className="flex-1 py-1.5 rounded-pill text-xs font-bold transition-all"
                  style={{
                    background: assignType === t.id ? t.color + '30' : '#1e2231',
                    color: assignType === t.id ? t.color : '#6b7494',
                    border: `1px solid ${assignType === t.id ? t.color + '60' : 'transparent'}`
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="tag-label block mb-1">Class</label>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 rounded-card text-sm text-text-primary"
              style={{ background: '#1e2231', border: '1px solid #2a2f42' }}>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.period} Â· {c.subject}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-4 rounded-card mb-4" style={{ background: '#0d1520', border: `1px solid ${pct != null ? scoreColor + '40' : '#2a2f42'}` }}>
          <p className="tag-label mb-1">Calculated Grade</p>
          {pct != null ? (
            <div className="flex items-center gap-3">
              <span className="font-display font-bold text-3xl" style={{ color: scoreColor }}>{pct}%</span>
              <span className="font-bold text-lg text-text-muted">{letter}</span>
            </div>
          ) : (
            <p className="text-text-muted text-sm">Enter points above to calculate</p>
          )}
        </div>

        <button onClick={postToGradebook} disabled={pct == null || !assignName.trim()}
          className="w-full py-3 rounded-widget font-bold text-white disabled:opacity-40 transition-all"
          style={{ background: pct != null ? 'linear-gradient(135deg, var(--school-color), #5c9ef8)' : '#1e2231' }}>
          {pct != null ? `Post ${pct}% (${letter})` : 'â€” enter score above'} to Gradebook â†’
        </button>
      </div>
    )
  }

  // â”€â”€ Menu (default) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
          className="p-8 rounded-widget flex flex-col items-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{ background: 'linear-gradient(135deg, #1a2a4a, #0f1a2e)', border: '1px solid #3b7ef440' }}>
          <span className="text-6xl">ðŸ“·</span>
          <p className="font-display font-bold text-lg text-text-primary">Use Camera</p>
          <p className="text-text-muted text-sm text-center">Point at the graded paper Â· AI reads the score</p>
        </button>
        <button onClick={() => fileRef.current?.click()}
          className="p-6 rounded-widget flex flex-col items-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{ background: '#161923', border: '1px solid #2a2f42' }}>
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
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
