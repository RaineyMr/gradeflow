import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useStore } from '../lib/store'
import { scanGradedDocument } from '../lib/ai'

export default function Camera({ onBack }) {
  const { classes, activeClass, addAssignment } = useStore()
  const [mode, setMode] = useState('menu')
  const [assignType, setAssignType] = useState('quiz')
  const [capturedImage, setCapturedImage] = useState(null)
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
    { id: 'test',          label: 'Test',  weight: 40, color: '#f04a4a' },
    { id: 'quiz',          label: 'Quiz',  weight: 30, color: '#f5a623' },
    { id: 'participation', label: 'Part.', weight: 10, color: '#9b6ef5' },
    { id: 'homework',      label: 'Other', weight: 20, color: '#22c97a' },
  ]

  function stopStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setCameraReady(false)
  }

  useEffect(() => () => stopStream(), [])

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

    if (video.isConnected) {
      tryPlay()
    } else {
      requestAnimationFrame(() => { if (videoRef.current) tryPlay() })
    }
  }, [])

  const videoCallbackRef = useCallback((node) => {
    videoRef.current = node
    if (node && streamRef.current) attachStream(streamRef.current)
  }, [attachStream])

  async function openCamera() {
    console.log('openCamera called')
    setCameraError(null)
    setCameraReady(false)

    if (!navigator.mediaDevices?.getUserMedia) {
      console.error('getUserMedia not supported')
      setCameraError(
        location.protocol === 'http:' && location.hostname !== 'localhost'
          ? 'Camera requires HTTPS. Use Vercel URL.'
          : 'Browser does not support camera. Try Chrome or Safari, or upload instead.'
      )
      return
    }

    console.log('Requesting camera access...')
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
        console.log('Trying camera config:', c)
        stream = await navigator.mediaDevices.getUserMedia(c)
        console.log('Camera access granted')
        break 
      }
      catch (err) { 
        console.error('Camera error:', err)
        lastErr = err
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') break 
      }
    }

    if (!stream) {
      const n = lastErr?.name
      setCameraError(
        n === 'NotAllowedError' || n === 'PermissionDeniedError'
          ? 'Camera permission denied. Tap the lock icon in your address bar, allow camera, then retry.'
          : n === 'NotFoundError' ? 'No camera found. Use Upload instead.'
          : n === 'NotReadableError' ? 'Camera in use by another app. Close it and retry.'
          : 'Camera error (' + (n || 'unknown') + '). Use Upload instead.'
      )
      return
    }

    streamRef.current = stream
    setMode('camera')
  }

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

  function resetAll() {
    setMode('menu')
    setCapturedImage(null)
    setScanResult(null)
    setScanError(null)
    setAssignName('')
    setManualScore('')
    setManualTotal('100')
  }

  function calcPercentage() {
    const score = parseFloat(manualScore)
    const total = parseFloat(manualTotal)
    if (isNaN(score) || isNaN(total) || total <= 0) return null
    return Math.round((score / total) * 100)
  }

  function letterFromPct(pct) {
    if (pct == null) return ''
    if (pct >= 90) return 'A'
    if (pct >= 80) return 'B'
    if (pct >= 70) return 'C'
    if (pct >= 60) return 'D'
    return 'F'
  }

  async function postToGradebook() {
    const pct = calcPercentage()
    if (pct == null || !assignName.trim()) return

    try {
      addAssignment({
        classId: selectedClass,
        name: assignName.trim(),
        type: assignType,
        earnedPoints: parseFloat(manualScore),
        totalPoints: parseFloat(manualTotal),
        percentage: pct,
      })
      resetAll()
      // Show success feedback
      alert(`Posted to gradebook: ${assignName} - ${pct}%`)
    } catch (err) {
      setScanError(err.message || 'Failed to post')
    }
  }

  // Processing spinner
  if (mode === 'processing') {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔄</div>
        <p style={{ color: '#c8cce0', fontSize: 14, marginBottom: 8 }}>AI is scanning your document...</p>
        <p style={{ color: '#6b7494', fontSize: 12 }}>Reading grading format, extracting points</p>
      </div>
    )
  }

  // Camera mode
  if (mode === 'camera') {
    return (
      <div style={{ padding: '0 16px 20px' }}>
        <button onClick={resetAll} style={{ background: 'none', border: 'none', color: '#0fb8a0', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 16, padding: 0 }}>
          ← Back
        </button>
        <video ref={videoCallbackRef} 
          style={{ width: '100%', borderRadius: 12, marginBottom: 16, backgroundColor: '#000', display: 'block' }}
          autoPlay={true}
          playsInline={true}
          muted={true}
        />
        {!cameraReady && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 12 }}>Starting camera...</p>
          </div>
        )}
        {cameraReady && (
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', border: '2px solid #0fb8a0', borderRadius: 12, backgroundColor: 'transparent' }}>
              <div style={{ position: 'absolute', top: 8, left: 8, width: 16, height: 16, border: '2px solid white', borderRight: 'none', borderBottom: 'none' }} />
              <div style={{ position: 'absolute', top: 8, right: 8, width: 16, height: 16, border: '2px solid white', borderLeft: 'none', borderBottom: 'none' }} />
              <div style={{ position: 'absolute', bottom: 8, left: 8, width: 16, height: 16, border: '2px solid white', borderRight: 'none', borderTop: 'none' }} />
              <div style={{ position: 'absolute', bottom: 8, right: 8, width: 16, height: 16, border: '2px solid white', borderLeft: 'none', borderTop: 'none' }} />
            </div>
          </div>
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <p style={{ textAlign: 'center', color: '#6b7494', fontSize: 12, marginBottom: 12 }}>Fill the frame with the graded paper</p>
        <button
          onClick={capturePhoto}
          disabled={!cameraReady}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 14,
            color: '#fff',
            border: 'none',
            cursor: cameraReady ? 'pointer' : 'not-allowed',
            background: cameraReady ? 'linear-gradient(135deg, var(--school-color), #5c9ef8)' : '#1e2436',
            opacity: cameraReady ? 1 : 0.5,
          }}>
          {cameraReady ? 'Capture and Scan' : 'Starting camera...'}
        </button>
      </div>
    )
  }

  // Review mode
  if (mode === 'review') {
    const pct = calcPercentage()
    const letter = letterFromPct(pct)
    const sr = scanResult
    const scoreColor = pct >= 90 ? '#22c97a' : pct >= 70 ? '#f5a623' : '#f04a4a'

    return (
      <div style={{ padding: '0 16px 20px' }}>
        <button onClick={resetAll} style={{ background: 'none', border: 'none', color: '#0fb8a0', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 12, padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Scan Again
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#eef0f8', marginBottom: 16 }}>Review and Post</h1>

        {sr && !scanError && (
          <div style={{ background: '#0d1520', border: '1px solid #3b7ef430', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ background: '#9b6ef520', color: '#9b6ef5', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>
                Claude Vision
              </span>
              <span style={{
                background: sr.confidence === 'high' ? '#22c97a20' : '#f5a62320',
                color: sr.confidence === 'high' ? '#22c97a' : '#f5a623',
                fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999
              }}>
                {sr.confidence === 'high' ? 'High confidence' : 'Low confidence - verify'}
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#eef0f8' }}>{sr.rawText}</p>
          </div>
        )}

        {scanError && (
          <div style={{ background: '#1c1012', border: '1px solid #f04a4a30', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <p style={{ fontWeight: 700, marginBottom: 4, color: '#f04a4a' }}>Scan error</p>
            <p style={{ fontSize: 12, color: '#f04a4a', opacity: 0.85, marginBottom: 8 }}>{scanError}</p>
            <p style={{ fontSize: 11, color: '#6b7494' }}>Enter score manually below.</p>
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7494', marginBottom: 8 }}>Assignment name</label>
          <input value={assignName} onChange={e => setAssignName(e.target.value)}
            placeholder="e.g. Ch.4 Quiz"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 12, fontSize: 13, color: '#eef0f8', background: '#1e2231', border: '1px solid #2a2f42', boxSizing: 'border-box' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7494', marginBottom: 8 }}>Points earned</label>
            <input value={manualScore} onChange={e => setManualScore(e.target.value)}
              placeholder="e.g. 82" type="number"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 12, fontSize: 13, color: '#eef0f8', background: '#1e2231', border: '1px solid #2a2f42', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7494', marginBottom: 8 }}>Total points</label>
            <input value={manualTotal} onChange={e => setManualTotal(e.target.value)}
              placeholder="e.g. 100" type="number"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 12, fontSize: 13, color: '#eef0f8', background: '#1e2231', border: '1px solid #2a2f42', boxSizing: 'border-box' }} />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7494', marginBottom: 8 }}>Assignment type</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {typeConfig.map(t => (
              <button key={t.id} onClick={() => setAssignType(t.id)}
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: assignType === t.id ? t.color + '30' : '#1e2231',
                  color: assignType === t.id ? t.color : '#6b7494',
                  border: '1px solid ' + (assignType === t.id ? t.color + '60' : 'transparent')
                }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7494', marginBottom: 8 }}>Class</label>
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 12, fontSize: 13, color: '#eef0f8', background: '#1e2231', border: '1px solid #2a2f42', boxSizing: 'border-box' }}>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.period} - {c.subject}</option>
            ))}
          </select>
        </div>

        <div style={{ background: '#0d1520', border: '1px solid ' + (pct != null ? scoreColor + '40' : '#2a2f42'), borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#6b7494', marginBottom: 8 }}>Calculated Grade</p>
          {pct != null ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: scoreColor }}>{pct}%</span>
              <span style={{ fontWeight: 700, fontSize: 16, color: '#6b7494' }}>{letter}</span>
            </div>
          ) : (
            <p style={{ color: '#6b7494', fontSize: 12 }}>Enter points above to calculate</p>
          )}
        </div>

        <button onClick={postToGradebook} disabled={pct == null || !assignName.trim()}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 14,
            color: '#fff',
            border: 'none',
            cursor: pct != null && assignName.trim() ? 'pointer' : 'not-allowed',
            background: pct != null ? 'linear-gradient(135deg, var(--school-color), #5c9ef8)' : '#1e2231',
            opacity: pct != null && assignName.trim() ? 1 : 0.4,
          }}>
          {pct != null ? `Post ${pct}% (${letter}) to Gradebook` : 'Enter score above'}
        </button>
      </div>
    )
  }

  // Menu mode (default)
  return (
    <div style={{ padding: '0 16px 20px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#eef0f8', marginBottom: 4 }}>Scan and Grade</h1>
      <p style={{ color: '#6b7494', fontSize: 12, marginBottom: 20 }}>AI reads any scoring format: 82/100, -8 missed, 17/20, letter grades, percentages</p>

      {cameraError && (
        <div style={{ background: '#1c1012', border: '1px solid #f04a4a30', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <p style={{ fontWeight: 700, marginBottom: 4, color: '#f04a4a' }}>Camera unavailable</p>
          <p style={{ fontSize: 12, color: '#f04a4a', opacity: 0.85 }}>{cameraError}</p>
        </div>
      )}

      <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
        <button onClick={openCamera}
          style={{ 
            padding: '32px 16px',
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            background: 'linear-gradient(135deg, #1a2a4a, #0f1a2e)',
            border: '1px solid #3b7ef440',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.01)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}>
          <span style={{ fontSize: 40 }}>📷</span>
          <p style={{ fontWeight: 800, fontSize: 16, color: '#eef0f8', margin: 0 }}>Use Camera</p>
          <p style={{ color: '#6b7494', fontSize: 12, textAlign: 'center', margin: 0 }}>Point at the graded paper - AI reads the score</p>
        </button>

        <button onClick={() => fileRef.current?.click()}
          style={{
            padding: '24px 16px',
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            background: '#161923',
            border: '1px solid #2a2f42',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.01)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}>
          <span style={{ fontSize: 32 }}>📁</span>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#eef0f8', margin: 0 }}>Upload Photo or File</p>
          <p style={{ color: '#6b7494', fontSize: 12, textAlign: 'center', margin: 0 }}>Photo from camera roll - PDF - Any image</p>
        </button>
      </div>

      <div style={{ background: '#161923', borderRadius: 12, padding: 12, marginBottom: 16 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: '#6b7494', textAlign: 'center', marginBottom: 8, margin: 0 }}>Scoring formats AI understands</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {['82 / 100', '-8 missed', '17 / 20', '94%', 'Letter A-F', 'Rubric score', 'Raw points'].map(f => (
            <span key={f} style={{ background: '#1e2231', color: '#6b7494', fontSize: 10, padding: '4px 10px', borderRadius: 8 }}>{f}</span>
          ))}
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={handleFileSelect} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}
