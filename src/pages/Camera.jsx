import React, { useState, useRef, useEffect } from 'react'
import { useStore } from '../lib/store'
import { AssignmentOptions, LoadingSpinner } from '../components/ui'

export default function Camera() {
  const { classes, activeClass, addAssignment } = useStore()
  const [mode, setMode] = useState('menu')
  const [assignType, setAssignType] = useState('quiz')
  const [options, setOptions] = useState({ lockdown: false, timer: false, shuffle: false, schedule: false, monitor: false })
  const [capturedImage, setCapturedImage] = useState(null)
  const [assignName, setAssignName] = useState('')
  const [selectedClass, setSelectedClass] = useState(activeClass?.id || classes[0]?.id)
  const [cameraError, setCameraError] = useState(null)
  const [stream, setStream] = useState(null)
  const videoRef = useRef()
  const canvasRef = useRef()
  const fileRef = useRef()

  const typeConfig = [
    { id: 'test', label: 'Test', weight: '40%', color: '#f04a4a' },
    { id: 'quiz', label: 'Quiz', weight: '30%', color: '#f5a623' },
    { id: 'participation', label: 'Part.', weight: '10%', color: '#9b6ef5' },
    { id: 'homework', label: 'Other', weight: '20%', color: '#22c97a' },
  ]

  // Attach stream to video element whenever both exist
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(() => {})
    }
  }, [stream, mode])

  // Clean up stream on unmount
  useEffect(() => {
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()) }
  }, [stream])

  async function openCamera() {
    setCameraError(null)
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      setStream(s)
      setMode('camera')
    } catch (err) {
      setCameraError('Camera access was denied. Please allow camera access in your browser, or use Upload File instead.')
    }
  }

  function stopCamera() {
    if (stream) { stream.getTracks().forEach(t => t.stop()); setStream(null) }
  }

  function capturePhoto() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    setCapturedImage(canvas.toDataURL('image/jpeg', 0.9))
    stopCamera()
    setMode('processing')
    setTimeout(() => setMode('review'), 2000)
  }

  function handleFileSelect(e) {
    const file = e.target.files[0]
    if (!file) return
    setCapturedImage(URL.createObjectURL(file))
    setMode('processing')
    setTimeout(() => setMode('review'), 2000)
  }

  function handlePost() {
    addAssignment({
      name: assignName || 'Scanned Assignment',
      type: assignType,
      classId: selectedClass,
      date: new Date().toISOString().split('T')[0],
      weight: typeConfig.find(t => t.id === assignType)?.weight?.replace('%', '') || 30,
      options
    })
    setMode('done')
  }

  function resetAll() {
    stopCamera()
    setCapturedImage(null)
    setAssignName('')
    setCameraError(null)
    setMode('menu')
  }

  // ── DONE ──
  if (mode === 'done') return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-6xl mb-4">✅</div>
      <h2 className="font-display font-bold text-xl text-text-primary mb-2">Posted to Gradebook</h2>
      <p className="text-text-muted text-sm mb-6">Assignment added · Students will be notified</p>
      <button onClick={resetAll} className="px-6 py-2.5 rounded-pill font-bold text-white" style={{ background: 'var(--school-color)' }}>
        Scan Another
      </button>
    </div>
  )

  // ── PROCESSING ──
  if (mode === 'processing') return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <LoadingSpinner />
      <p className="text-text-muted text-sm mt-4 animate-pulse-soft">AI is reading your document...</p>
    </div>
  )

  // ── LIVE CAMERA ──
  if (mode === 'camera') return (
    <div>
      <button onClick={() => { stopCamera(); setMode('menu') }} className="flex items-center gap-2 text-text-muted text-sm mb-4 hover:text-text-primary">
        ✕ Cancel
      </button>
      <div className="relative rounded-widget overflow-hidden bg-black mb-4" style={{ aspectRatio: '4/3', maxHeight: '60vh' }}>
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        {/* Viewfinder corners */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-3/4 h-3/4">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white rounded-br" />
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <p className="text-center text-text-muted text-xs mb-4">Position document inside the frame and tap Capture</p>
      <button onClick={capturePhoto}
        className="w-full py-4 rounded-widget font-display font-bold text-lg text-white"
        style={{ background: 'linear-gradient(135deg, var(--school-color), #5c9ef8)' }}>
        📸 Capture
      </button>
    </div>
  )

  // ── REVIEW ──
  if (mode === 'review') return (
    <div>
      <button onClick={resetAll} className="flex items-center gap-2 text-text-muted text-sm mb-6 hover:text-text-primary">
        ← Scan Again
      </button>
      <h1 className="font-display font-bold text-xl text-text-primary mb-6">Review & Post</h1>
      {capturedImage && (
        <div className="mb-4 rounded-card overflow-hidden border border-elevated" style={{ maxHeight: 220 }}>
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
                className="px-3 py-1.5 rounded-pill text-xs font-semibold transition-all"
                style={{ background: selectedClass === c.id ? 'var(--school-color)' : '#1e2231', color: selectedClass === c.id ? 'white' : '#6b7494' }}>
                {c.period} · {c.subject}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="tag-label block mb-2">Assignment Type</label>
          <div className="grid grid-cols-4 gap-2">
            {typeConfig.map(t => (
              <button key={t.id} onClick={() => setAssignType(t.id)}
                className="py-2 rounded-card text-xs font-bold transition-all"
                style={{ background: assignType === t.id ? `${t.color}22` : '#1e2231', color: assignType === t.id ? t.color : '#6b7494', border: `1px solid ${assignType === t.id ? t.color + '40' : 'transparent'}` }}>
                <div>{t.label}</div>
                <div style={{ fontSize: '9px', opacity: 0.7 }}>{t.weight}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="p-3 rounded-card" style={{ background: '#161923' }}>
          <AssignmentOptions options={options} onChange={setOptions} />
        </div>
        <button onClick={handlePost} className="w-full py-3 rounded-pill font-bold text-white" style={{ background: 'var(--school-color)' }}>
          Post to Gradebook →
        </button>
      </div>
    </div>
  )

  // ── MENU ──
  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-text-primary mb-2">Scan & Grade</h1>
      <p className="text-text-muted text-sm mb-8">Camera · Upload · AI reads all formats</p>

      {cameraError && (
        <div className="p-3 rounded-card mb-4 text-sm" style={{ background: '#1c1012', color: '#f04a4a', border: '1px solid #f04a4a30' }}>
          ⚠ {cameraError}
        </div>
      )}

      <div className="grid gap-4 mb-6">
        <button onClick={openCamera}
          className="p-8 rounded-widget flex flex-col items-center gap-3 transition-all hover:scale-[1.01]"
          style={{ background: 'linear-gradient(135deg, #1a2a4a, #0f1a2e)', border: '1px solid #3b7ef440' }}>
          <span className="text-6xl">📷</span>
          <p className="font-display font-bold text-lg text-text-primary">Use Camera</p>
          <p className="text-text-muted text-sm text-center">Opens your device camera — browser will ask for permission</p>
        </button>

        <button onClick={() => fileRef.current?.click()}
          className="p-6 rounded-widget flex flex-col items-center gap-3 transition-all hover:scale-[1.01]"
          style={{ background: '#161923', border: '1px solid #2a2f42' }}>
          <span className="text-4xl">🖼</span>
          <p className="font-bold text-text-primary">Upload File</p>
          <p className="text-text-muted text-sm">PDF · Image · Word doc</p>
        </button>
      </div>

      <div className="p-3 rounded-card" style={{ background: '#161923' }}>
        <p className="text-text-muted text-xs text-center">Grade sheets · Tests · Worksheets · School ID · Barcode · Anything</p>
      </div>

      <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileSelect} />
    </div>
  )
}
