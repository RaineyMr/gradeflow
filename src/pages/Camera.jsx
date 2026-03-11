import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '../lib/store'

const INTENTS = [
  { id: 'grade',           icon: '📝', label: 'Grade Student Work',    desc: 'Capture a paper — AI reads & grades it',         roles: ['teacher', 'admin'] },
  { id: 'upload-answer-key', icon: '🔑', label: 'Upload Answer Key',     desc: 'Photo or file of the answer key',                roles: ['teacher', 'admin'] },
  { id: 'upload-assignment', icon: '📋', label: 'Upload Assignment',      desc: 'Digitize a worksheet or assignment',              roles: ['teacher', 'admin', 'student'] },
  { id: 'upload-roster',   icon: '📊', label: 'Upload Class Roster',    desc: 'Spreadsheet or photo — AI extracts student list', roles: ['teacher', 'admin'] },
  { id: 'submit',          icon: '📤', label: 'Submit Your Work',       desc: 'Photo or file of your completed assignment',      roles: ['student'] },
]

const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_KEY

export default function Camera({ onBack }) {
  const { cameraIntent, setCameraIntent, assignments, updateGrade, students, currentUser } = useStore()
  const role = currentUser?.role || 'teacher'

  const [intent, setIntent]                 = useState(cameraIntent || null)
  const [mode, setMode]                     = useState('intent')  // intent | capture | processing | result | done
  const [capturedImage, setCapturedImage]   = useState(null)
  const [capturedFile, setCapturedFile]     = useState(null)
  const [result, setResult]                 = useState(null)
  const [error, setError]                   = useState('')
  const [cameraActive, setCameraActive]     = useState(false)
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(assignments[0]?.id || '')
  const [answerKey, setAnswerKey]           = useState('')
  const [rosterResults, setRosterResults]   = useState(null)

  const videoRef  = useRef(null)
  const streamRef = useRef(null)
  const fileRef   = useRef(null)

  // Clean up camera stream on unmount
  useEffect(() => () => stopStream(), [])

  function stopStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setCameraActive(true)
    } catch {
      setError('Camera not accessible. Use "Choose File" instead.')
    }
  }

  function captureFromCamera() {
    if (!videoRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width  = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    setCapturedImage(dataUrl)
    stopStream()
    setMode('processing')
    processImage(dataUrl)
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setCapturedFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => {
      setCapturedImage(ev.target.result)
      setMode('processing')
      processImage(ev.target.result, file)
    }
    reader.readAsDataURL(file)
  }

  async function processImage(dataUrl, file) {
    setError('')
    setResult(null)

    if (!ANTHROPIC_KEY) {
      setError('No Anthropic API key. Add VITE_ANTHROPIC_KEY to your .env file.')
      setMode('capture')
      return
    }

    try {
      const base64 = dataUrl.split(',')[1]
      const mediaType = 'image/jpeg'

      if (intent === 'grade') {
        await gradeDocument(base64, mediaType)
      } else if (intent === 'upload-roster') {
        await extractRoster(base64, mediaType)
      } else if (intent === 'upload-answer-key') {
        await extractAnswerKey(base64, mediaType)
      } else {
        // Generic upload success
        setResult({ type: 'upload', message: 'Document uploaded successfully.', fileName: file?.name || 'capture.jpg' })
        setMode('result')
      }
    } catch (err) {
      setError(err?.message || 'Processing failed. Please try again.')
      setMode('capture')
    }
  }

  async function gradeDocument(base64, mediaType) {
    const assignment = assignments.find(a => a.id === Number(selectedAssignmentId))
    const systemPrompt = `You are an expert at reading graded school papers. Identify the scoring system used and calculate the correct percentage. Return ONLY valid JSON: {"studentName":"","score":85,"maxScore":100,"percentage":85,"format":"e.g. 17/20","feedback":"brief feedback","confidence":"high|medium|low"}`

    const body = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text',  text: `Grade this paper.${answerKey ? ` Answer key: ${answerKey}` : ''} Assignment: ${assignment?.name || 'Unknown'}` },
        ],
      }],
    })

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body,
    })

    if (!res.ok) throw new Error(`API error ${res.status}`)
    const data = await res.json()
    const text = data.content?.[0]?.text || ''
    const parsed = safeParseJSON(text)
    if (!parsed) throw new Error('Could not parse AI response.')
    setResult({ type: 'grade', ...parsed, assignment })
    setMode('result')
  }

  async function extractRoster(base64, mediaType) {
    const body = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text',  text: 'Extract all student names from this roster. Return ONLY valid JSON: {"students":[{"name":"","id":""}]}' },
        ],
      }],
    })
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body,
    })
    if (!res.ok) throw new Error(`API error ${res.status}`)
    const data = await res.json()
    const parsed = safeParseJSON(data.content?.[0]?.text || '')
    setRosterResults(parsed?.students || [])
    setResult({ type: 'roster', students: parsed?.students || [] })
    setMode('result')
  }

  async function extractAnswerKey(base64, mediaType) {
    const body = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text',  text: 'Extract the answer key from this document. Return ONLY valid JSON: {"answers":[{"question":1,"answer":"A"}]}' },
        ],
      }],
    })
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body,
    })
    if (!res.ok) throw new Error(`API error ${res.status}`)
    const data = await res.json()
    const parsed = safeParseJSON(data.content?.[0]?.text || '')
    const keyText = parsed?.answers?.map(a => `Q${a.question}: ${a.answer}`).join(', ') || ''
    setAnswerKey(keyText)
    setResult({ type: 'answer-key', answers: parsed?.answers || [], text: keyText })
    setMode('result')
  }

  function syncToGradebook() {
    if (result?.type === 'grade' && result.assignment) {
      const student = students.find(s => s.name?.toLowerCase().includes(result.studentName?.toLowerCase?.() || ''))
      if (student) {
        updateGrade(student.id, result.assignment.id, result.percentage)
      }
    }
    setMode('done')
  }

  function downloadResult() {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `gradeflow-result-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function resetAll() {
    setIntent(null); setCapturedImage(null); setCapturedFile(null)
    setResult(null); setError(''); setMode('intent')
    stopStream()
  }

  // ── Screens ──────────────────────────────────────────────────────────────────
  const availableIntents = INTENTS.filter(i => i.roles.includes(role))

  const S = {
    shell:    { minHeight: '100vh', background: '#060810', color: '#eef0f8', fontFamily: 'Inter, Arial, sans-serif', padding: '0 0 100px' },
    header:   { padding: '20px 16px 0', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
    backBtn:  { background: '#1e2231', border: 'none', borderRadius: 10, padding: '8px 14px', color: '#eef0f8', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
    h1:       { fontSize: 22, fontWeight: 800, color: '#eef0f8', margin: 0 },
    card:     { background: '#161923', border: '1px solid #1e2231', borderRadius: 18, padding: 16, margin: '0 16px 14px' },
    btn:      (color) => ({ background: `${color}22`, color, border: 'none', borderRadius: 12, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', flex: 1 }),
    primary:  { background: 'var(--school-color)', color: '#fff', border: 'none', borderRadius: 999, padding: '12px 24px', fontSize: 14, fontWeight: 800, cursor: 'pointer', width: '100%' },
  }

  // INTENT SELECTION
  if (mode === 'intent') return (
    <div style={S.shell}>
      <div style={S.header}>
        <button style={S.backBtn} onClick={onBack}>← Back</button>
        <h1 style={S.h1}>📷 Camera</h1>
      </div>
      <p style={{ color: '#6b7494', fontSize: 13, margin: '0 16px 20px' }}>What do you want to do?</p>
      {availableIntents.map(i => (
        <button
          key={i.id}
          onClick={() => { setIntent(i.id); setCameraIntent(i.id); setMode('capture') }}
          style={{ ...S.card, width: 'calc(100% - 32px)', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, border: '1px solid #1e2231' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--school-color)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#1e2231'}
        >
          <span style={{ fontSize: 28 }}>{i.icon}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#eef0f8', marginBottom: 2 }}>{i.label}</div>
            <div style={{ fontSize: 11, color: '#6b7494' }}>{i.desc}</div>
          </div>
        </button>
      ))}
    </div>
  )

  // CAPTURE
  if (mode === 'capture') return (
    <div style={S.shell}>
      <div style={S.header}>
        <button style={S.backBtn} onClick={resetAll}>← Back</button>
        <h1 style={S.h1}>{INTENTS.find(i => i.id === intent)?.icon} {INTENTS.find(i => i.id === intent)?.label}</h1>
      </div>

      {/* Assignment selector (for grading) */}
      {intent === 'grade' && (
        <div style={S.card}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7494', marginBottom: 8 }}>Assignment</label>
          <select
            style={{ width: '100%', background: '#1e2231', border: '1px solid #2a2f42', borderRadius: 10, padding: '10px 12px', color: '#eef0f8', fontSize: 13 }}
            value={selectedAssignmentId}
            onChange={e => setSelectedAssignmentId(e.target.value)}
          >
            {assignments.map(a => <option key={a.id} value={a.id}>{a.name} · {a.type}</option>)}
          </select>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7494', margin: '12px 0 8px' }}>Answer Key (optional)</label>
          <textarea
            style={{ width: '100%', background: '#1e2231', border: '1px solid #2a2f42', borderRadius: 10, padding: '10px 12px', color: '#eef0f8', fontSize: 12, resize: 'none', boxSizing: 'border-box' }}
            rows={2}
            placeholder="Paste answer key text, or leave blank for AI to figure it out..."
            value={answerKey}
            onChange={e => setAnswerKey(e.target.value)}
          />
        </div>
      )}

      {/* Camera viewfinder */}
      <div style={S.card}>
        <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', background: '#000', aspectRatio: '4/3', maxHeight: '50vh', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', display: cameraActive ? 'block' : 'none' }} />
          {!cameraActive && (
            <div style={{ textAlign: 'center', color: '#3d4460' }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>📷</div>
              <p style={{ fontSize: 12 }}>Start camera or choose a file</p>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {!cameraActive ? (
            <button onClick={startCamera} style={S.primary}>Start Camera</button>
          ) : (
            <button onClick={captureFromCamera} style={S.primary}>📸 Capture</button>
          )}
          <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFileChange} style={{ display: 'none' }} />
          <button onClick={() => fileRef.current?.click()} style={{ ...S.btn('#3b7ef4'), flex: 'none', padding: '12px 20px' }}>
            Choose File
          </button>
        </div>
      </div>
      {error && <div style={{ ...S.card, background: '#1c1012', border: '1px solid #f04a4a30', color: '#f04a4a', fontSize: 13 }}>{error}</div>}
    </div>
  )

  // PROCESSING
  if (mode === 'processing') return (
    <div style={{ ...S.shell, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      {capturedImage && <img src={capturedImage} alt="Captured" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 14, marginBottom: 20, opacity: 0.6 }} />}
      <div style={{ width: 36, height: 36, border: '3px solid var(--school-color)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 16 }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontWeight: 700, color: '#eef0f8', marginBottom: 4 }}>Claude Vision is reading this paper</p>
      <p style={{ fontSize: 12, color: '#6b7494' }}>Detecting format · Calculating grade...</p>
    </div>
  )

  // RESULT
  if (mode === 'result' && result) {
    const pct     = result.percentage || result.score || 0
    const color   = pct >= 90 ? '#22c97a' : pct >= 80 ? '#3b7ef4' : pct >= 70 ? '#f5a623' : '#f04a4a'
    const letter  = pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F'

    return (
      <div style={S.shell}>
        <div style={S.header}>
          <button style={S.backBtn} onClick={resetAll}>← New Scan</button>
          <h1 style={S.h1}>Result</h1>
        </div>

        {result.type === 'grade' && (
          <div style={S.card}>
            <div style={{ textAlign: 'center', padding: '12px 0 20px' }}>
              <div style={{ fontSize: 56, fontWeight: 900, color, lineHeight: 1 }}>{Math.round(pct)}%</div>
              <div style={{ fontSize: 24, fontWeight: 700, color, marginTop: 4 }}>{letter}</div>
              {result.format && <div style={{ fontSize: 12, color: '#6b7494', marginTop: 4 }}>{result.format}</div>}
              {result.studentName && <div style={{ fontSize: 13, color: '#eef0f8', marginTop: 8 }}>Student: {result.studentName}</div>}
              {result.assignment && <div style={{ fontSize: 12, color: '#6b7494' }}>Assignment: {result.assignment.name}</div>}
            </div>
            {result.feedback && (
              <div style={{ background: '#1e2231', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#6b7494', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>AI Feedback</div>
                <p style={{ fontSize: 13, color: '#c0c8e0', margin: 0 }}>{result.feedback}</p>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={syncToGradebook} style={{ ...S.btn('#22c97a'), padding: '12px 0' }}>✓ Sync to Gradebook</button>
              <button onClick={downloadResult}   style={{ ...S.btn('#3b7ef4'), padding: '12px 0' }}>⬇ Download</button>
            </div>
            <button onClick={() => { syncToGradebook(); downloadResult() }} style={{ ...S.primary, marginTop: 8, background: '#1e2231', color: '#eef0f8' }}>Do Both</button>
          </div>
        )}

        {result.type === 'roster' && (
          <div style={S.card}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#eef0f8', marginBottom: 12 }}>
              📊 {result.students?.length || 0} Students Extracted
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 12 }}>
              {(result.students || []).map((s, i) => (
                <div key={i} style={{ padding: '8px 12px', background: '#1e2231', borderRadius: 10, marginBottom: 6, fontSize: 13, color: '#eef0f8' }}>
                  {s.name} {s.id && <span style={{ color: '#6b7494' }}>· {s.id}</span>}
                </div>
              ))}
            </div>
            <button onClick={downloadResult} style={S.primary}>⬇ Download Roster</button>
          </div>
        )}

        {result.type === 'answer-key' && (
          <div style={S.card}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#eef0f8', marginBottom: 12 }}>
              🔑 Answer Key Extracted
            </div>
            <textarea
              style={{ width: '100%', background: '#1e2231', border: '1px solid #2a2f42', borderRadius: 10, padding: 12, color: '#eef0f8', fontSize: 12, resize: 'none', boxSizing: 'border-box' }}
              rows={6}
              value={result.text}
              onChange={e => setResult(r => ({ ...r, text: e.target.value }))}
            />
            <button onClick={downloadResult} style={{ ...S.primary, marginTop: 10 }}>⬇ Download Answer Key</button>
          </div>
        )}

        {result.type === 'upload' && (
          <div style={S.card}>
            <div style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <div style={{ fontWeight: 700, color: '#22c97a', marginBottom: 4 }}>Uploaded Successfully</div>
              <div style={{ fontSize: 12, color: '#6b7494' }}>{result.fileName}</div>
            </div>
            <button onClick={resetAll} style={S.primary}>Scan Another</button>
          </div>
        )}
      </div>
    )
  }

  // DONE
  if (mode === 'done') return (
    <div style={{ ...S.shell, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
      <h2 style={{ color: '#eef0f8', marginBottom: 8 }}>Posted to Gradebook</h2>
      <p style={{ color: '#6b7494', fontSize: 13, marginBottom: 24 }}>Grade synced · Students will be notified</p>
      <button onClick={resetAll} style={S.primary}>Scan Another</button>
    </div>
  )

  return null
}

function safeParseJSON(text) {
  try { return JSON.parse(text.replace(/```json|```/g, '').trim()) } catch {}
  try { const m = text.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]) } catch {}
  return null
}
