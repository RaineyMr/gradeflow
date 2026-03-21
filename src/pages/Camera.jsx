import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '../lib/store'

const INTENTS = [
  { id: 'grade',             icon: '📝', label: 'Grade Student Work',    desc: 'Capture a paper — AI reads & grades it',         roles: ['teacher', 'admin'] },
  { id: 'upload-answer-key', icon: '🔑', label: 'Upload Answer Key',     desc: 'Photo, file, or spreadsheet of the answer key',  roles: ['teacher', 'admin'] },
  { id: 'upload-assignment', icon: '📋', label: 'Upload Assignment',     desc: 'Digitize a worksheet, PDF, or CSV assignment',   roles: ['teacher', 'admin', 'student'] },
  { id: 'upload-roster',    icon: '📊', label: 'Upload Class Roster',    desc: 'Spreadsheet, CSV, or photo — AI extracts student list', roles: ['teacher', 'admin'] },
  { id: 'submit',           icon: '📤', label: 'Submit Your Work',       desc: 'Photo, file, or document of your completed assignment', roles: ['student'] },
]

const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_KEY

// Accepted file types for every upload in this page
const ACCEPT_ALL = 'image/*,.pdf,.csv,.xlsx,.xls,.doc,.docx,.txt'
const ACCEPT_MEDIA = 'image/*,.pdf,.csv,.xlsx,.xls,.doc,.docx,.txt'

function safeParseJSON(text) {
  try { return JSON.parse(text.replace(/```json|```/g, '').trim()) } catch {}
  try { const m = text.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]) } catch {}
  return null
}

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

    // Handle CSV/Excel files differently — no image preview, send as text
    const isSpreadsheet = /\.(csv|xlsx|xls)$/i.test(file.name)
    if (isSpreadsheet) {
      handleSpreadsheetFile(file)
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      setCapturedImage(ev.target.result)
      setMode('processing')
      processImage(ev.target.result, file)
    }
    reader.readAsDataURL(file)
  }

  async function handleSpreadsheetFile(file) {
    setMode('processing')
    setError('')
    try {
      const text = await file.text()
      if (intent === 'upload-roster') {
        await extractRosterFromCSV(text, file.name)
      } else if (intent === 'upload-answer-key') {
        setAnswerKey(text.slice(0, 500))
        setResult({ type: 'answer-key', text: text.slice(0, 500), answers: [] })
        setMode('result')
      } else {
        setResult({ type: 'upload', message: 'Spreadsheet uploaded successfully.', fileName: file.name })
        setMode('result')
      }
    } catch (err) {
      setError('Could not read spreadsheet. Try saving as CSV first.')
      setMode('capture')
    }
  }

  async function extractRosterFromCSV(csvText, fileName) {
    if (!ANTHROPIC_KEY) {
      setError('No Anthropic API key. Add VITE_ANTHROPIC_KEY to your .env file.')
      setMode('capture')
      return
    }
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        messages: [{
          role: 'user',
          content: `Extract all student names from this CSV roster data. Return ONLY valid JSON: {"students":[{"name":"","id":""}]}\n\nCSV:\n${csvText.slice(0, 3000)}`,
        }],
      }),
    })
    if (!res.ok) throw new Error(`API error ${res.status}`)
    const data = await res.json()
    const parsed = safeParseJSON(data.content?.[0]?.text || '')
    setRosterResults(parsed?.students || [])
    setResult({ type: 'roster', students: parsed?.students || [], fileName })
    setMode('result')
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
    const body = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      system: 'You are an expert at reading graded school papers. Identify the scoring system used and calculate the correct percentage. Return ONLY valid JSON: {"studentName":"","score":85,"maxScore":100,"percentage":85,"format":"e.g. 17/20","feedback":"brief feedback","confidence":"high|medium|low"}',
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text: `Grade this paper.${answerKey ? ` Answer key: ${answerKey}` : ''} Assignment: ${assignment?.name || 'Unknown'}` },
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
    if (!parsed) throw new Error('Could not parse AI response.')
    setResult({ type: 'grade', ...parsed, assignment })
    setMode('result')
  }

  async function extractRoster(base64, mediaType) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            { type: 'text', text: 'Extract all student names from this roster. Return ONLY valid JSON: {"students":[{"name":"","id":""}]}' },
          ],
        }],
      }),
    })
    if (!res.ok) throw new Error(`API error ${res.status}`)
    const data = await res.json()
    const parsed = safeParseJSON(data.content?.[0]?.text || '')
    setRosterResults(parsed?.students || [])
    setResult({ type: 'roster', students: parsed?.students || [] })
    setMode('result')
  }

  async function extractAnswerKey(base64, mediaType) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            { type: 'text', text: 'Extract the answer key from this document. Return ONLY valid JSON: {"answers":[{"question":1,"answer":"A"}]}' },
          ],
        }],
      }),
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
      if (student) updateGrade(student.id, result.assignment.id, result.percentage)
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

  const availableIntents = INTENTS.filter(i => i.roles.includes(role))

  const S = {
    shell:   { minHeight: '100vh', background: '#060810', color: '#eef0f8', fontFamily: 'Inter, Arial, sans-serif', padding: '0 0 100px' },
    header:  { padding: '20px 16px 0', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
    backBtn: { background: '#1e2231', border: 'none', borderRadius: 10, padding: '8px 14px', color: '#eef0f8', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
    h1:      { fontSize: 22, fontWeight: 800, color: '#eef0f8', margin: 0 },
    card:    { background: '#161923', border: '1px solid #1e2231', borderRadius: 18, padding: 16, margin: '0 16px 14px' },
    btn:     (color) => ({ background: `${color}22`, color, border: 'none', borderRadius: 12, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', flex: 1 }),
    primary: { background: 'var(--school-color)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', flex: 1 },
  }

  // ── INTENT SELECTION ──────────────────────────────────────────────────────
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

  // ── CAPTURE ───────────────────────────────────────────────────────────────
  if (mode === 'capture') return (
    <div style={S.shell}>
      <div style={S.header}>
        <button style={S.backBtn} onClick={resetAll}>← Back</button>
        <h1 style={S.h1}>{INTENTS.find(i => i.id === intent)?.icon} {INTENTS.find(i => i.id === intent)?.label}</h1>
      </div>

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
            placeholder="Paste answer key, or leave blank for AI to figure it out..."
            value={answerKey}
            onChange={e => setAnswerKey(e.target.value)}
          />
        </div>
      )}

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
          {/* UPDATED: accept now includes CSV, Excel, Word, PDF, images */}
          <input ref={fileRef} type="file" accept={ACCEPT_ALL} onChange={handleFileChange} style={{ display: 'none' }} />
          <button onClick={() => fileRef.current?.click()} style={{ ...S.btn('#3b7ef4'), flex: 'none', padding: '12px 20px' }}>
            Choose File
          </button>
        </div>
        <p style={{ fontSize: 10, color: '#6b7494', margin: '8px 0 0', textAlign: 'center' }}>
          Supports: Photos · PDF · CSV · Excel (.xlsx) · Word · Text
        </p>
      </div>
      {error && <div style={{ ...S.card, background: '#1c1012', border: '1px solid #f04a4a30', color: '#f04a4a', fontSize: 13 }}>{error}</div>}
    </div>
  )

  // ── PROCESSING ────────────────────────────────────────────────────────────
  if (mode === 'processing') return (
    <div style={{ ...S.shell, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      {capturedImage && <img src={capturedImage} alt="Captured" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 14, marginBottom: 20, opacity: 0.6 }} />}
      <div style={{ width: 36, height: 36, border: '3px solid var(--school-color)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 16 }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontWeight: 700, color: '#eef0f8', marginBottom: 4 }}>Claude is reading this file</p>
      <p style={{ fontSize: 12, color: '#6b7494' }}>Detecting format · Processing...</p>
    </div>
  )

  // ── RESULT ────────────────────────────────────────────────────────────────
  if (mode === 'result' && result) {
    const pct    = result.percentage || result.score || 0
    const color  = pct >= 90 ? '#22c97a' : pct >= 80 ? '#3b7ef4' : pct >= 70 ? '#f5a623' : '#f04a4a'
    const letter = pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F'

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
              <button onClick={downloadResult} style={{ ...S.btn('#3b7ef4'), padding: '12px 0' }}>⬇ Download</button>
            </div>
          </div>
        )}

        {result.type === 'roster' && (
          <div style={S.card}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#eef0f8', marginBottom: 12 }}>
              ✅ {result.students?.length || 0} students found{result.fileName ? ` from ${result.fileName}` : ''}
            </div>
            {result.students?.slice(0, 10).map((s, i) => (
              <div key={i} style={{ background: '#1e2231', borderRadius: 8, padding: '8px 12px', marginBottom: 6, fontSize: 13, color: '#eef0f8' }}>
                {s.name}{s.id ? ` · ID: ${s.id}` : ''}
              </div>
            ))}
            {result.students?.length > 10 && <div style={{ fontSize: 11, color: '#6b7494', marginTop: 4 }}>+{result.students.length - 10} more</div>}
            <button onClick={downloadResult} style={{ ...S.btn('#3b7ef4'), padding: '12px 0', marginTop: 8, display: 'block', width: '100%' }}>⬇ Download Roster JSON</button>
          </div>
        )}

        {result.type === 'answer-key' && (
          <div style={S.card}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#eef0f8', marginBottom: 8 }}>✅ Answer Key Extracted</div>
            <div style={{ background: '#1e2231', borderRadius: 10, padding: 12, fontSize: 12, color: '#c0c8e0' }}>{result.text}</div>
          </div>
        )}

        {result.type === 'upload' && (
          <div style={S.card}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#22c97a', marginBottom: 4 }}>✅ {result.message}</div>
            {result.fileName && <div style={{ fontSize: 12, color: '#6b7494' }}>{result.fileName}</div>}
          </div>
        )}

        <div style={{ padding: '0 16px' }}>
          <button onClick={resetAll} style={{ ...S.btn('#6b7494'), width: '100%', padding: '12px 0' }}>Scan Another</button>
        </div>
      </div>
    )
  }

  // ── DONE ──────────────────────────────────────────────────────────────────
  if (mode === 'done') return (
    <div style={{ ...S.shell, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
      <div style={{ fontSize: 64 }}>✅</div>
      <p style={{ fontWeight: 700, color: '#eef0f8', fontSize: 18 }}>Synced to Gradebook!</p>
      <button onClick={resetAll} style={{ ...S.btn('#3b7ef4'), padding: '12px 24px' }}>Scan Another</button>
      <button onClick={onBack} style={{ ...S.btn('#6b7494'), padding: '12px 24px' }}>← Back to Dashboard</button>
    </div>
  )

  return null
}
