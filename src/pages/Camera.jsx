import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useStore } from '../lib/store'
import { scanGradedDocument } from '../lib/ai'

export default function Camera({ onBack }) {
  const { classes, activeClass, students, addGrade } = useStore()
  const [mode, setMode] = useState('menu')
  const [assignType, setAssignType] = useState('quiz')
  const [capturedImage, setCapturedImage] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [scanError, setScanError] = useState(null)
  const [selectedClass, setSelectedClass] = useState(activeClass?.id || classes[0]?.id)

  // Review form state (editable after scan)
  const [formData, setFormData] = useState({
    studentName: '',
    assignmentName: '',
    earnedPoints: '',
    totalPoints: '100',
  })
  const [isProcessing, setIsProcessing] = useState(false)

  const streamRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileRef = useRef(null)

  const typeConfig = [
    { id: 'test', label: 'Test', weight: 40, color: '#f04a4a' },
    { id: 'quiz', label: 'Quiz', weight: 30, color: '#f5a623' },
    { id: 'participation', label: 'Part.', weight: 10, color: '#9b6ef5' },
    { id: 'homework', label: 'Other', weight: 20, color: '#22c97a' },
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
    setCameraError(null)
    setCameraReady(false)

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        location.protocol === 'http:' && location.hostname !== 'localhost'
          ? 'Camera requires HTTPS. Use Vercel URL.'
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
      
      // Populate form with extracted data
      setFormData({
        studentName: result.studentName || '',
        assignmentName: result.assignmentTitle || '',
        earnedPoints: result.earnedPoints != null ? String(result.earnedPoints) : '',
        totalPoints: result.totalPoints != null ? String(result.totalPoints) : '100',
      })
      
      // Update assignment type if detected
      if (result.documentType) {
        const map = { quiz: 'quiz', test: 'test', homework: 'homework', worksheet: 'homework', participation: 'participation' }
        setAssignType(map[result.documentType] || 'quiz')
      }
      
      setMode('review')
    } catch (err) {
      setScanError(err.message || 'Scan failed')
      setMode('review')
    }
  }

  function calculateGrade() {
    const score = parseFloat(formData.earnedPoints)
    const total = parseFloat(formData.totalPoints)
    if (isNaN(score) || isNaN(total) || total === 0) return { pct: null, letter: null, color: '#6b7494' }
    const pct = Math.round((score / total) * 100)
    const letter = pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F'
    const color = pct >= 90 ? '#22c97a' : pct >= 80 ? '#f5a623' : pct >= 70 ? '#3b7ef4' : '#f04a4a'
    return { pct, letter, color }
  }

  async function acceptAndPost() {
    const { pct } = calculateGrade()
    if (pct == null) return
    if (!formData.studentName.trim()) {
      setScanError('Student name is required')
      return
    }
    if (!formData.assignmentName.trim()) {
      setScanError('Assignment name is required')
      return
    }

    setIsProcessing(true)
    try {
      // Add grade to store (which syncs to Supabase)
      await addGrade({
        studentName: formData.studentName.trim(),
        assignmentName: formData.assignmentName.trim(),
        assignmentType: assignType,
        earnedPoints: parseFloat(formData.earnedPoints),
        totalPoints: parseFloat(formData.totalPoints),
        classId: selectedClass,
        percentage: pct,
        date: new Date().toISOString(),
      })

      // Reset and return to menu
      setFormData({ studentName: '', assignmentName: '', earnedPoints: '', totalPoints: '100' })
      setScanResult(null)
      setCapturedImage(null)
      setMode('menu')
    } catch (err) {
      setScanError('Failed to post grade: ' + err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  function handleFormChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  function goBackToMenu() {
    setMode('menu')
    setScanResult(null)
    setCapturedImage(null)
    setScanError(null)
    setFormData({ studentName: '', assignmentName: '', earnedPoints: '', totalPoints: '100' })
  }

  // ─────────────────────────────────────────────────────────────────────────
  // REVIEW MODE: Show extracted data, allow edits, accept/post to gradebook
  // ─────────────────────────────────────────────────────────────────────────
  if (mode === 'review') {
    const sr = scanResult
    const { pct, letter, color } = calculateGrade()
    const isValid = pct != null && formData.studentName.trim() && formData.assignmentName.trim()

    return (
      <div style={{ padding: '0 16px 20px' }}>
        <button onClick={goBackToMenu}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#3b7ef4', 
            cursor: 'pointer', 
            fontSize: 14, 
            fontWeight: 700, 
            marginBottom: 16,
            padding: 0
          }}>
          ← Back
        </button>

        {/* Captured Image */}
        {capturedImage && (
          <img src={capturedImage} alt="Captured"
            style={{ width: '100%', borderRadius: 12, marginBottom: 16, maxHeight: 300, objectFit: 'cover' }} />
        )}

        {/* AI Extraction Summary */}
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
            <p style={{ fontSize: 13, color: '#eef0f8', margin: 0 }}>
              {sr.rawText}
            </p>
          </div>
        )}

        {scanError && (
          <div style={{ background: '#1c1012', border: '1px solid #f04a4a30', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <p style={{ fontWeight: 700, marginBottom: 4, color: '#f04a4a', margin: 0 }}>Extraction error</p>
            <p style={{ fontSize: 12, color: '#f04a4a', opacity: 0.85, margin: '4px 0' }}>{scanError}</p>
          </div>
        )}

        {/* EDITABLE FORM */}
        <div style={{ background: '#161923', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#eef0f8', marginBottom: 16, margin: '0 0 16px 0' }}>Review & Edit</h2>

          {/* Student Name */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7494', marginBottom: 6 }}>Student name</label>
            <input 
              type="text"
              value={formData.studentName} 
              onChange={e => handleFormChange('studentName', e.target.value)}
              placeholder="e.g. John Smith"
              style={{ 
                width: '100%', 
                padding: '10px 12px', 
                borderRadius: 8, 
                fontSize: 13, 
                color: '#eef0f8', 
                background: '#1e2231', 
                border: '1px solid ' + (formData.studentName.trim() ? '#3b7ef4' : '#2a2f42'),
                boxSizing: 'border-box',
              }} 
            />
          </div>

          {/* Assignment Name */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7494', marginBottom: 6 }}>Assignment name</label>
            <input 
              type="text"
              value={formData.assignmentName} 
              onChange={e => handleFormChange('assignmentName', e.target.value)}
              placeholder="e.g. Ch.4 Quiz"
              style={{ 
                width: '100%', 
                padding: '10px 12px', 
                borderRadius: 8, 
                fontSize: 13, 
                color: '#eef0f8', 
                background: '#1e2231', 
                border: '1px solid ' + (formData.assignmentName.trim() ? '#3b7ef4' : '#2a2f42'),
                boxSizing: 'border-box',
              }} 
            />
          </div>

          {/* Points Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7494', marginBottom: 6 }}>Points earned</label>
              <input 
                type="number"
                value={formData.earnedPoints} 
                onChange={e => handleFormChange('earnedPoints', e.target.value)}
                placeholder="82"
                style={{ 
                  width: '100%', 
                  padding: '10px 12px', 
                  borderRadius: 8, 
                  fontSize: 13, 
                  color: '#eef0f8', 
                  background: '#1e2231', 
                  border: '1px solid #2a2f42',
                  boxSizing: 'border-box',
                }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7494', marginBottom: 6 }}>Total points</label>
              <input 
                type="number"
                value={formData.totalPoints} 
                onChange={e => handleFormChange('totalPoints', e.target.value)}
                placeholder="100"
                style={{ 
                  width: '100%', 
                  padding: '10px 12px', 
                  borderRadius: 8, 
                  fontSize: 13, 
                  color: '#eef0f8', 
                  background: '#1e2231', 
                  border: '1px solid #2a2f42',
                  boxSizing: 'border-box',
                }} 
              />
            </div>
          </div>

          {/* Assignment Type */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7494', marginBottom: 6 }}>Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
              {typeConfig.map(t => (
                <button key={t.id} onClick={() => setAssignType(t.id)}
                  style={{
                    padding: '8px 6px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: assignType === t.id ? t.color + '30' : '#1e2231',
                    color: assignType === t.id ? t.color : '#6b7494',
                    border: '1px solid ' + (assignType === t.id ? t.color + '60' : 'transparent'),
                    transition: 'all 0.15s'
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calculated Grade Display */}
          <div style={{ background: '#0d1520', border: '1px solid ' + (pct != null ? color + '40' : '#2a2f42'), borderRadius: 8, padding: 12 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#6b7494', marginBottom: 8, margin: '0 0 8px 0' }}>Calculated grade</p>
            {pct != null ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color }}>{pct}%</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#6b7494' }}>{letter}</span>
              </div>
            ) : (
              <p style={{ color: '#6b7494', fontSize: 12, margin: 0 }}>Enter points to calculate</p>
            )}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button onClick={goBackToMenu} disabled={isProcessing}
            style={{
              padding: '12px 16px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
              color: '#6b7494',
              border: '1px solid #2a2f42',
              background: '#1e2231',
              cursor: 'pointer',
              opacity: isProcessing ? 0.5 : 1,
            }}>
            Cancel
          </button>
          <button onClick={acceptAndPost} disabled={!isValid || isProcessing}
            style={{
              padding: '12px 16px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
              color: '#fff',
              border: 'none',
              background: isValid ? 'linear-gradient(135deg, var(--school-color), #5c9ef8)' : '#1e2231',
              cursor: isValid ? 'pointer' : 'not-allowed',
              opacity: isValid ? 1 : 0.4,
            }}>
            {isProcessing ? 'Posting...' : `Post ${pct ? pct + '% (' + letter + ')' : '—'}`}
          </button>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CAMERA MODE
  // ─────────────────────────────────────────────────────────────────────────
  if (mode === 'camera') {
    return (
      <div style={{ padding: '0 16px 20px' }}>
        <button onClick={() => { setMode('menu'); stopStream() }}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#3b7ef4', 
            cursor: 'pointer', 
            fontSize: 14, 
            fontWeight: 700, 
            marginBottom: 16,
            padding: 0
          }}>
          ← Back
        </button>

        <video ref={videoCallbackRef}
          style={{ width: '100%', borderRadius: 12, marginBottom: 16, background: '#000' }}
          autoPlay playsInline muted />

        <button onClick={capturePhoto} disabled={!cameraReady}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 700,
            color: '#fff',
            background: cameraReady ? 'linear-gradient(135deg, var(--school-color), #5c9ef8)' : '#1e2231',
            border: 'none',
            cursor: cameraReady ? 'pointer' : 'not-allowed',
            opacity: cameraReady ? 1 : 0.4,
          }}>
          📸 Capture
        </button>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MENU MODE (default)
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '0 16px 20px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#eef0f8', marginBottom: 4 }}>Scan and Grade</h1>
      <p style={{ color: '#6b7494', fontSize: 12, marginBottom: 20 }}>
        AI reads graded papers: student name, score (82/100, -8 missed, 17/20, letter grades, %)
      </p>

      {cameraError && (
        <div style={{ background: '#1c1012', border: '1px solid #f04a4a30', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <p style={{ fontWeight: 700, marginBottom: 4, color: '#f04a4a', margin: '0 0 4px 0' }}>Camera unavailable</p>
          <p style={{ fontSize: 12, color: '#f04a4a', opacity: 0.85, margin: 0 }}>{cameraError}</p>
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
          <p style={{ color: '#6b7494', fontSize: 12, textAlign: 'center', margin: 0 }}>Point at a graded paper</p>
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
          <p style={{ color: '#6b7494', fontSize: 12, textAlign: 'center', margin: 0 }}>From camera roll, gallery, or desktop</p>
        </button>
      </div>

      <div style={{ background: '#161923', borderRadius: 12, padding: 12, marginBottom: 16 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: '#6b7494', textAlign: 'center', marginBottom: 8, margin: '0 0 8px 0' }}>AI handles all scoring formats</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {['82/100', '-8 missed', '17/20', '94%', 'A-F', 'Rubric', 'Raw'].map(f => (
            <span key={f} style={{ background: '#1e2231', color: '#6b7494', fontSize: 10, padding: '4px 10px', borderRadius: 6 }}>{f}</span>
          ))}
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={handleFileSelect} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}
