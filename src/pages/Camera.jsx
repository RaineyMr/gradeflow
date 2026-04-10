import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useStore } from '../lib/store'
import { scanGradedDocument } from '../lib/ai'

export default function Camera({ onBack }) {
  const { classes, activeClass, addGrade } = useStore()
  const [mode, setMode] = useState('menu')
  const [assignType, setAssignType] = useState('quiz')
  const [capturedImage, setCapturedImage] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [scanError, setScanError] = useState(null)
  const [selectedClass, setSelectedClass] = useState(activeClass?.id || classes[0]?.id)
  const [isProcessing, setIsProcessing] = useState(false)
  const [canvasReady, setCanvasReady] = useState(false)

  // Review form state (editable after scan)
  const [formData, setFormData] = useState({
    studentName: '',
    assignmentName: '',
    earnedPoints: '',
    totalPoints: '100',
  })

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

  // Initialize canvas ref on mount
  useEffect(() => {
    console.log('Camera component mounted, setting up canvas')
    if (canvasRef.current) {
      setCanvasReady(true)
      console.log('Canvas ref is ready')
    }
  }, [])

  function stopStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setCameraReady(false)
  }

  useEffect(() => () => stopStream(), [])

  const attachStream = useCallback((stream) => {
    console.log('Attaching stream to video element')
    const video = videoRef.current
    if (!video) {
      console.error('Video ref not available')
      return
    }
    
    video.srcObject = stream
    
    const handleMetadata = () => {
      console.log('Video metadata loaded, video dimensions:', video.videoWidth, video.videoHeight)
      const playPromise = video.play()
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Video playing successfully')
            setCameraReady(true)
          })
          .catch(err => {
            console.error('Video play failed, trying with muted:', err)
            video.muted = true
            video.play()
              .then(() => {
                console.log('Video playing with muted')
                setCameraReady(true)
              })
              .catch(err2 => {
                console.error('Video play failed even with muted:', err2)
                setCameraError('Could not start camera playback: ' + err2.message)
                stopStream()
                setMode('menu')
              })
          })
      }
    }
    
    video.addEventListener('loadedmetadata', handleMetadata, { once: true })
    
    const timeoutId = setTimeout(() => {
      if (!cameraReady) {
        console.warn('Timeout waiting for metadata, forcing play')
        const playPromise = video.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Timeout: video playing')
              setCameraReady(true)
            })
            .catch(() => {
              video.muted = true
              video.play()
                .then(() => {
                  console.log('Timeout: video playing with muted')
                  setCameraReady(true)
                })
                .catch(() => {
                  setCameraError('Camera stream timeout')
                  stopStream()
                  setMode('menu')
                })
            })
        }
      }
    }, 3000)
    
    return () => clearTimeout(timeoutId)
  }, [cameraReady])

  const videoCallbackRef = useCallback((node) => {
    console.log('Video callback ref set')
    videoRef.current = node
    if (node && streamRef.current) {
      attachStream(streamRef.current)
    }
  }, [attachStream])

  async function openCamera() {
    console.log('Opening camera...')
    setCameraError(null)
    setCameraReady(false)

    if (!navigator.mediaDevices?.getUserMedia) {
      const error = location.protocol === 'http:' && location.hostname !== 'localhost'
        ? 'Camera requires HTTPS. Use Vercel URL.'
        : 'Browser does not support camera. Try Chrome or Safari, or upload instead.'
      console.error('getUserMedia not supported:', error)
      setCameraError(error)
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
        console.log('Trying camera config:', JSON.stringify(c))
        stream = await navigator.mediaDevices.getUserMedia(c)
        console.log('Camera access granted')
        break
      } catch (err) {
        console.error('Camera config failed:', err.name, err.message)
        lastErr = err
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          break
        }
      }
    }

    if (!stream) {
      const n = lastErr?.name
      const errorMsg = n === 'NotAllowedError' || n === 'PermissionDeniedError'
        ? 'Camera permission denied. Tap the lock icon in your address bar, allow camera, then retry.'
        : n === 'NotFoundError' ? 'No camera found. Use Upload instead.'
        : n === 'NotReadableError' ? 'Camera in use by another app. Close it and retry.'
        : 'Camera error (' + (n || 'unknown') + '). Use Upload instead.'
      console.error('No camera stream available:', errorMsg)
      setCameraError(errorMsg)
      return
    }

    streamRef.current = stream
    setMode('camera')
  }

  function capturePhoto() {
    console.log('=== CAPTURE BUTTON CLICKED ===')
    
    const video = videoRef.current
    const canvas = canvasRef.current
    
    console.log('Video ref:', !!video)
    console.log('Canvas ref:', !!canvas)
    console.log('Canvas ready state:', canvasReady)
    
    if (!video) {
      console.error('Video ref missing')
      setCameraError('Video element not initialized')
      return
    }
    if (!canvas) {
      console.error('Canvas ref missing')
      setCameraError('Canvas element not initialized')
      return
    }
    
    const vw = video.videoWidth
    const vh = video.videoHeight
    console.log('Video dimensions:', vw, 'x', vh)
    console.log('Camera ready state:', cameraReady)
    
    if (vw === 0 || vh === 0) {
      console.error('Video not ready: dimensions are 0')
      setCameraError('Video stream not ready. Wait a moment and try again.')
      return
    }

    try {
      console.log('Setting canvas dimensions to:', vw, 'x', vh)
      canvas.width = vw
      canvas.height = vh
      
      const ctx = canvas.getContext('2d')
      console.log('Canvas context obtained:', !!ctx)
      
      if (!ctx) {
        setCameraError('Could not initialize canvas')
        return
      }
      
      console.log('Drawing image to canvas...')
      ctx.drawImage(video, 0, 0, vw, vh)
      
      console.log('Converting canvas to data URL...')
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
      console.log('Data URL created, length:', dataUrl.length)
      
      if (!dataUrl || dataUrl === 'data:,' || dataUrl.length < 100) {
        console.error('Invalid data URL:', dataUrl.substring(0, 50))
        setCameraError('Failed to capture image from camera')
        return
      }
      
      const base64 = dataUrl.split(',')[1]
      console.log('Base64 extracted, length:', base64.length)
      
      stopStream()
      console.log('Stream stopped, processing image...')
      processImage(dataUrl, base64, 'image/jpeg')
    } catch (err) {
      console.error('Capture error:', err)
      setCameraError('Failed to capture: ' + err.message)
    }
  }

  function handleFileSelect(e) {
    const file = e.target.files[0]
    if (!file) return
    
    console.log('File selected:', file.name, file.size)
    e.target.value = ''
    
    const reader = new FileReader()
    reader.onload = ev => {
      const dataUrl = ev.target.result
      const base64 = dataUrl.split(',')[1]
      console.log('File read, base64 length:', base64.length)
      processImage(dataUrl, base64, file.type || 'image/jpeg')
    }
    reader.onerror = err => {
      console.error('File read error:', err)
      setScanError('Failed to read file')
    }
    reader.readAsDataURL(file)
  }

  function processImage(dataUrl, base64, mime) {
    console.log('Processing image, mime type:', mime)
    setCapturedImage(dataUrl)
    setScanResult(null)
    setScanError(null)
    setMode('processing')
    runAI(base64, mime)
  }

  async function runAI(base64, mime) {
    try {
      console.log('Calling scanGradedDocument...')
      const result = await scanGradedDocument(base64, mime)
      console.log('AI result received:', result)
      
      setScanResult(result)
      
      setFormData({
        studentName: result.studentName || '',
        assignmentName: result.assignmentTitle || '',
        earnedPoints: result.earnedPoints != null ? String(result.earnedPoints) : '',
        totalPoints: result.totalPoints != null ? String(result.totalPoints) : '100',
      })
      
      if (result.documentType) {
        const map = { quiz: 'quiz', test: 'test', homework: 'homework', worksheet: 'homework', participation: 'participation' }
        setAssignType(map[result.documentType] || 'quiz')
      }
      
      setMode('review')
    } catch (err) {
      console.error('AI error:', err)
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
      console.log('Posting grade to gradebook...')
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

      console.log('Grade posted successfully')
      setFormData({ studentName: '', assignmentName: '', earnedPoints: '', totalPoints: '100' })
      setScanResult(null)
      setCapturedImage(null)
      setMode('menu')
    } catch (err) {
      console.error('Post error:', err)
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
  // REVIEW MODE
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

        {capturedImage && (
          <img src={capturedImage} alt="Captured"
            style={{ width: '100%', borderRadius: 12, marginBottom: 16, maxHeight: 300, objectFit: 'cover' }} />
        )}

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

        <div style={{ background: '#161923', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#eef0f8', marginBottom: 16, margin: '0 0 16px 0' }}>Review & Edit</h2>

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

        <div style={{ background: '#000', borderRadius: 12, marginBottom: 16, overflow: 'hidden', aspectRatio: '4/3' }}>
          <video 
            ref={videoCallbackRef}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            autoPlay 
            playsInline 
            muted 
          />
        </div>

        {cameraError && (
          <div style={{ background: '#1c1012', border: '1px solid #f04a4a30', borderRadius: 12, padding: 12, marginBottom: 16 }}>
            <p style={{ fontWeight: 700, color: '#f04a4a', fontSize: 12, margin: 0 }}>{cameraError}</p>
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 11, color: '#6b7494', margin: '0 0 8px 0' }}>
            Camera: {cameraReady ? '✓ Ready' : '○ Loading...'}
          </p>
        </div>

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
            opacity: cameraReady ? 1 : 0.5,
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
          <p style={{ color: '#6b7494', fontSize: 12, textAlign: 'center', margin: 0 }}>Point at the graded paper</p>
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