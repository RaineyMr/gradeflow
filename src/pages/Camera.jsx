import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '../lib/store'

const INTENTS = [
  { id: 'grade',             icon: '📝', label: 'Grade Student Work',       desc: 'Capture a paper — AI reads & grades it',                roles: ['teacher', 'admin'] },
  { id: 'grade-sheet',       icon: '📋', label: 'Scan Grade Sheet (Bulk)',  desc: 'Photo of a full class grade sheet — bulk sync all scores', roles: ['teacher', 'admin'] },
  { id: 'upload-answer-key', icon: '🔑', label: 'Upload Answer Key',        desc: 'Photo, file, or spreadsheet of the answer key',          roles: ['teacher', 'admin'] },
  { id: 'upload-assignment', icon: '📋', label: 'Upload Assignment',        desc: 'Digitize a worksheet, PDF, or CSV assignment',           roles: ['teacher', 'admin', 'student'] },
  { id: 'upload-roster',     icon: '📊', label: 'Upload Class Roster',      desc: 'Spreadsheet, CSV, or photo — AI extracts student list',  roles: ['teacher', 'admin'] },
  { id: 'submit',            icon: '📤', label: 'Submit Your Work',         desc: 'Photo, file, or document of your completed assignment',  roles: ['student'] },
]

const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_KEY
const ACCEPT_ALL    = 'image/*,.pdf,.csv,.xlsx,.xls,.doc,.docx,.txt'

function safeParseJSON(text) {
  try { return JSON.parse(text.replace(/```json|```/g, '').trim()) } catch {}
  try { const m = text.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]) } catch {}
  return null
}

export default function Camera({ onBack }) {
  const { cameraIntent, setCameraIntent, assignments, updateGrade, students, currentUser } = useStore()
  const role = currentUser?.role || 'teacher'

  const [intent,               setIntent]               = useState(cameraIntent || null)
  const [mode,                 setMode]                 = useState('intent')
  const [capturedImage,        setCapturedImage]        = useState(null)
  const [capturedFile,         setCapturedFile]         = useState(null)
  const [result,               setResult]               = useState(null)
  const [error,                setError]                = useState('')
  const [cameraActive,         setCameraActive]         = useState(false)
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(assignments[0]?.id || '')
  const [answerKey,            setAnswerKey]            = useState('')
  const [rosterResults,        setRosterResults]        = useState(null)

  // ── Voice state ──────────────────────────────────────────────────────────────
  const [recording,    setRecording]    = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [voiceStatus,  setVoiceStatus]  = useState('')

  // ── Bulk grade sheet state ────────────────────────────────────────────────────
  const [bulkGrades,   setBulkGrades]   = useState([]) // [{studentName, matchedStudentId, assignmentName, score, maxScore, percentage, confidence, editing}]
  const [bulkSyncing,  setBulkSyncing]  = useState(false)
  const [bulkDone,     setBulkDone]     = useState(false)

  const videoRef    = useRef(null)
  const streamRef   = useRef(null)
  const fileRef     = useRef(null)
  const mediaRecRef = useRef(null)
  const audioChunks = useRef([])

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
    if (!videoRef.current || !cameraActive) return
    const canvas  = document.createElement('canvas')
    canvas.width  = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    setCapturedImage(dataUrl)
    stopStream()
    setMode('processing')
    processImage(dataUrl, null)
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setCapturedFile(file)
    setMode('processing')
    const isSpreadsheet = file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = ev => processImage(ev.target.result, file)
      reader.readAsDataURL(file)
    } else if (isSpreadsheet && intent === 'grade-sheet') {
      await processGradebookCSV(file)
    } else if (isSpreadsheet) {
      await processCSV(file)
    } else {
      setResult({ type: 'upload', message: 'File uploaded successfully.', fileName: file.name })
      setMode('result')
    }
  }

  // ── Voice recording ──────────────────────────────────────────────────────────
  async function startRecording() {
    setError('')
    setVoiceStatus('Listening...')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioChunks.current = []
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecRef.current = mr

      mr.ondataavailable = e => { if (e.data.size > 0) audioChunks.current.push(e.data) }
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' })
        await transcribeAndParse(blob)
      }

      mr.start()
      setRecording(true)
    } catch {
      setError('Microphone not accessible.')
      setVoiceStatus('')
    }
  }

  function stopRecording() {
    if (mediaRecRef.current && recording) {
      mediaRecRef.current.stop()
      setRecording(false)
      setVoiceStatus('Transcribing...')
      setTranscribing(true)
    }
  }

  async function transcribeAndParse(audioBlob) {
    try {
      // Send audio to /api/transcribe (AssemblyAI server-side)
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const transcribeRes = await fetch('/api/transcribe', {
        method: 'POST',
        body:   formData,
      })

      const transcribeData = await transcribeRes.json()

      if (!transcribeData.success) {
        throw new Error(transcribeData.error || 'Transcription failed')
      }

      const transcript = transcribeData.transcript
      setVoiceStatus(`Heard: "${transcript.slice(0, 60)}${transcript.length > 60 ? '...' : ''}"`)

      // Use Claude to extract grade info from the transcript
      await parseTranscriptToGrade(transcript)

    } catch (err) {
      setError(err.message || 'Voice processing failed. Please try again.')
      setVoiceStatus('')
    } finally {
      setTranscribing(false)
    }
  }

  async function parseTranscriptToGrade(transcript) {
    if (!ANTHROPIC_KEY) {
      setError('No Anthropic API key configured.')
      return
    }

    setMode('processing')

    const assignment = assignments.find(a => a.id === Number(selectedAssignmentId))
    const studentNames = students.map(s => s.name).join(', ')

    try {
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
          max_tokens: 300,
          system: `You extract grade information from a teacher's spoken dictation.
Known students: ${studentNames || 'unknown'}.
Current assignment: ${assignment?.name || 'unknown'}.
Return ONLY valid JSON: {"studentName":"","score":0,"maxScore":100,"percentage":0,"format":"e.g. 17/20","feedback":"","confidence":"high|medium|low"}
If score and maxScore are given, calculate percentage. If only percentage, set score=percentage and maxScore=100.`,
          messages: [{ role: 'user', content: `Extract grade from: "${transcript}"` }],
        }),
      })

      if (!res.ok) throw new Error(`API error ${res.status}`)
      const data   = await res.json()
      const parsed = safeParseJSON(data.content?.[0]?.text || '')

      if (!parsed || parsed.percentage === undefined) {
        throw new Error('Could not extract a grade from what you said. Try: "Marcus got 17 out of 20"')
      }

      setResult({
        type:        'grade',
        studentName: parsed.studentName,
        score:       parsed.score,
        maxScore:    parsed.maxScore,
        percentage:  parsed.percentage,
        format:      parsed.format,
        feedback:    parsed.feedback || `Graded via voice: "${transcript}"`,
        assignment,
        source:      'voice',
      })
      setMode('result')
      setVoiceStatus('')

    } catch (err) {
      setError(err.message || 'Could not parse grade from voice input.')
      setMode('capture')
      setVoiceStatus('')
    }
  }

  // ── Bulk grade sheet ─────────────────────────────────────────────────────────
  async function gradeSheet(base64, mediaType) {
    const studentNames   = students.map(s => s.name).join(', ')
    const assignmentList = assignments.map(a => a.name).join(', ')

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: { 'Content-Type':'application/json', 'x-api-key':ANTHROPIC_KEY, 'anthropic-version':'2023-06-01', 'anthropic-dangerous-direct-browser-access':'true' },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: `You read teacher grade sheets — grids with student names and scores.
Known students: ${studentNames || 'see image'}.
Known assignments: ${assignmentList || 'see image'}.
Extract EVERY student-score pair visible. For each row/student, extract all scores.
Return ONLY valid JSON:
{"grades":[{"studentName":"","assignmentName":"","score":0,"maxScore":100,"percentage":0,"confidence":"high|medium|low"}]}
Calculate percentage = (score/maxScore)*100. If only percentage visible, set score=percentage, maxScore=100.
Match student names to the known list as closely as possible.`,
        messages: [{
          role:    'user',
          content: [
            { type:'image', source:{ type:'base64', media_type:mediaType, data:base64 } },
            { type:'text',  text:'Extract all grades from this grade sheet.' },
          ],
        }],
      }),
    })

    if (!res.ok) throw new Error(`API error ${res.status}`)
    const data   = await res.json()
    const parsed = safeParseJSON(data.content?.[0]?.text || '')

    if (!parsed?.grades?.length) throw new Error('No grades found in image. Make sure the grade sheet is clearly visible.')

    // Fuzzy match student names to store students
    const matched = parsed.grades.map(g => {
      const lower    = g.studentName.toLowerCase()
      const matched  = students.find(s =>
        s.name.toLowerCase().includes(lower) ||
        lower.includes(s.name.toLowerCase().split(' ')[0].toLowerCase())
      )
      const matchedAssignment = assignments.find(a =>
        a.name.toLowerCase().includes((g.assignmentName || '').toLowerCase()) ||
        (g.assignmentName || '').toLowerCase().includes(a.name.toLowerCase())
      )
      return {
        ...g,
        matchedStudentId:     matched?.id || null,
        matchedStudentName:   matched?.name || g.studentName,
        matchedAssignmentId:  matchedAssignment?.id || assignments[0]?.id || null,
        matchedAssignmentName: matchedAssignment?.name || g.assignmentName,
        editing: false,
      }
    })

    setBulkGrades(matched)
    setMode('bulk-review')
  }

  async function syncAllToGradebook() {
    setBulkSyncing(true)
    let synced = 0
    for (const g of bulkGrades) {
      if (g.matchedStudentId && g.matchedAssignmentId && g.percentage !== undefined) {
        try {
          await updateGrade(g.matchedStudentId, g.matchedAssignmentId, g.percentage)
          synced++
        } catch { /* skip failed rows */ }
      }
    }
    setBulkSyncing(false)
    setBulkDone(true)
    setTimeout(() => setMode('done'), 1200)
  }

  // ── Image / CSV processing ───────────────────────────────────────────────────
  async function processImage(dataUrl, file) {
    setError('')
    setResult(null)

    if (!ANTHROPIC_KEY) {
      setError('No Anthropic API key. Add VITE_ANTHROPIC_KEY to your .env file.')
      setMode('capture')
      return
    }

    try {
      const base64    = dataUrl.split(',')[1]
      const mediaType = 'image/jpeg'

      if (intent === 'grade') {
        await gradeDocument(base64, mediaType)
      } else if (intent === 'grade-sheet') {
        await gradeSheet(base64, mediaType)
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
      model:      'claude-sonnet-4-20250514',
      max_tokens: 800,
      system:     'You are an expert at reading graded school papers. Identify the scoring system used and calculate the correct percentage. Return ONLY valid JSON: {"studentName":"","score":85,"maxScore":100,"percentage":85,"format":"e.g. 17/20","feedback":"brief feedback","confidence":"high|medium|low"}',
      messages: [{
        role:    'user',
        content: [
          { type:'image', source:{ type:'base64', media_type:mediaType, data:base64 } },
          { type:'text',  text:`Grade this paper.${answerKey ? ` Answer key: ${answerKey}` : ''} Assignment: ${assignment?.name || 'Unknown'}` },
        ],
      }],
    })
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: { 'Content-Type':'application/json', 'x-api-key':ANTHROPIC_KEY, 'anthropic-version':'2023-06-01', 'anthropic-dangerous-direct-browser-access':'true' },
      body,
    })
    if (!res.ok) throw new Error(`API error ${res.status}`)
    const data   = await res.json()
    const parsed = safeParseJSON(data.content?.[0]?.text || '')
    if (!parsed) throw new Error('Could not parse AI response.')
    setResult({ type:'grade', ...parsed, assignment, source:'image' })
    setMode('result')
  }

  async function extractAnswerKey(base64, mediaType) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: { 'Content-Type':'application/json', 'x-api-key':ANTHROPIC_KEY, 'anthropic-version':'2023-06-01', 'anthropic-dangerous-direct-browser-access':'true' },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 600,
        system:     'Extract answer key from this document. Return ONLY valid JSON: {"answers":[{"question":1,"answer":"A"}]}',
        messages: [{ role:'user', content:[{ type:'image', source:{ type:'base64', media_type:mediaType, data:base64 } },{ type:'text', text:'Extract the answer key.' }] }],
      }),
    })
    if (!res.ok) throw new Error(`API error ${res.status}`)
    const data   = await res.json()
    const parsed = safeParseJSON(data.content?.[0]?.text || '')
    const keyText = parsed?.answers?.map(a => `Q${a.question}: ${a.answer}`).join(', ') || ''
    setAnswerKey(keyText)
    setResult({ type:'answer-key', answers:parsed?.answers || [], text:keyText })
    setMode('result')
  }

  async function extractRoster(base64, mediaType) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: { 'Content-Type':'application/json', 'x-api-key':ANTHROPIC_KEY, 'anthropic-version':'2023-06-01', 'anthropic-dangerous-direct-browser-access':'true' },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 800,
        system:     'Extract student roster from image. Return ONLY valid JSON: {"students":[{"name":"","id":""}]}',
        messages: [{ role:'user', content:[{ type:'image', source:{ type:'base64', media_type:mediaType, data:base64 } },{ type:'text', text:'Extract all student names and IDs.' }] }],
      }),
    })
    if (!res.ok) throw new Error(`API error ${res.status}`)
    const data   = await res.json()
    const parsed = safeParseJSON(data.content?.[0]?.text || '')
    setResult({ type:'roster', students:parsed?.students || [] })
    setMode('result')
  }

  async function processGradebookCSV(file) {
    setError('')
    const fileName    = file.name
    const text        = await file.text()
    const csvText     = text.slice(0, 8000) // enough for a full class gradebook
    const studentNames   = students.map(s => s.name).join(', ')
    const assignmentList = assignments.map(a => a.name).join(', ')

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:  'POST',
        headers: { 'Content-Type':'application/json', 'x-api-key':ANTHROPIC_KEY, 'anthropic-version':'2023-06-01', 'anthropic-dangerous-direct-browser-access':'true' },
        body: JSON.stringify({
          model:      'claude-sonnet-4-20250514',
          max_tokens: 3000,
          system: `You parse teacher gradebook spreadsheets exported as CSV.
The first column is usually student names. Remaining columns are assignment names with scores.
Known students in system: ${studentNames || 'extract from CSV'}.
Known assignments in system: ${assignmentList || 'extract from CSV'}.

Extract EVERY student + assignment score pair.
Return ONLY valid JSON:
{"grades":[{"studentName":"","assignmentName":"","score":0,"maxScore":100,"percentage":0}]}

Rules:
- If a cell has "87/100" parse as score=87, maxScore=100, percentage=87
- If a cell has just "87" and maxScore is unknown, assume maxScore=100
- If a cell is empty or "N/A" or "--", skip that pair entirely
- Calculate percentage = (score/maxScore)*100, round to 1 decimal
- Match student names to known students as closely as possible`,
          messages: [{ role:'user', content:`Parse this gradebook CSV from file "${fileName}":\n\n${csvText}` }],
        }),
      })

      if (!res.ok) throw new Error(`API error ${res.status}`)
      const data   = await res.json()
      const parsed = safeParseJSON(data.content?.[0]?.text || '')

      if (!parsed?.grades?.length) {
        throw new Error('No grade data found. Make sure the file has student names in the first column and scores in the remaining columns.')
      }

      // Fuzzy match to store students and assignments
      const matched = parsed.grades.map(g => {
        const lower   = (g.studentName || '').toLowerCase()
        const matchSt = students.find(s =>
          s.name.toLowerCase().includes(lower) ||
          lower.includes(s.name.toLowerCase().split(' ')[0].toLowerCase())
        )
        const aLower  = (g.assignmentName || '').toLowerCase()
        const matchAn = assignments.find(a =>
          a.name.toLowerCase().includes(aLower) ||
          aLower.includes(a.name.toLowerCase())
        )
        return {
          ...g,
          matchedStudentId:      matchSt?.id || null,
          matchedStudentName:    matchSt?.name || g.studentName,
          matchedAssignmentId:   matchAn?.id || assignments[0]?.id || null,
          matchedAssignmentName: matchAn?.name || g.assignmentName,
          editing: false,
        }
      })

      setBulkGrades(matched)
      setMode('bulk-review')
    } catch (err) {
      setError(err.message || 'Could not parse gradebook file.')
      setMode('capture')
    }
  }

  async function processCSV(file) {
    const fileName = file.name
    const text     = await file.text()
    const csvText  = text.slice(0, 5000)

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: { 'Content-Type':'application/json', 'x-api-key':ANTHROPIC_KEY, 'anthropic-version':'2023-06-01', 'anthropic-dangerous-direct-browser-access':'true' },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 800,
        system:     'Extract student roster from CSV data. Return ONLY valid JSON: {"students":[{"name":"","id":""}]}',
        messages:   [{ role:'user', content:`Extract students from this CSV. Return ONLY valid JSON: {"students":[{"name":"","id":""}]}\n\nCSV:\n${csvText}` }],
      }),
    })
    if (!res.ok) throw new Error(`API error ${res.status}`)
    const data   = await res.json()
    const parsed = safeParseJSON(data.content?.[0]?.text || '')
    setRosterResults(parsed?.students || [])
    setResult({ type:'roster', students:parsed?.students || [], fileName })
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
    const blob = new Blob([JSON.stringify(result, null, 2)], { type:'application/json' })
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
    setRecording(false); setTranscribing(false); setVoiceStatus('')
    setBulkGrades([]); setBulkSyncing(false); setBulkDone(false)
    stopStream()
  }

  const availableIntents = INTENTS.filter(i => i.roles.includes(role))

  const S = {
    shell:   { minHeight:'100vh', background:'#060810', color:'#eef0f8', fontFamily:'Inter, Arial, sans-serif', padding:'0 0 100px' },
    header:  { padding:'20px 16px 0', display:'flex', alignItems:'center', gap:12, marginBottom:20 },
    backBtn: { background:'#1e2231', border:'none', borderRadius:10, padding:'8px 14px', color:'#eef0f8', cursor:'pointer', fontSize:13, fontWeight:600 },
    h1:      { fontSize:22, fontWeight:800, color:'#eef0f8', margin:0 },
    card:    { background:'#161923', border:'1px solid #1e2231', borderRadius:18, padding:16, margin:'0 16px 14px' },
    btn:     (color) => ({ background:`${color}22`, color, border:'none', borderRadius:12, padding:'10px 18px', fontSize:13, fontWeight:700, cursor:'pointer', flex:1 }),
    primary: { background:'var(--school-color)', color:'#fff', border:'none', borderRadius:12, padding:'12px 20px', fontSize:14, fontWeight:700, cursor:'pointer', flex:1 },
  }

  // ── INTENT PICKER ────────────────────────────────────────────────────────────
  if (mode === 'intent') return (
    <div style={S.shell}>
      <div style={S.header}>
        <button style={S.backBtn} onClick={onBack}>← Back</button>
        <h1 style={S.h1}>📷 Scan</h1>
      </div>
      <div style={{ padding:'0 16px' }}>
        {availableIntents.map(i => (
          <button key={i.id} onClick={() => { setIntent(i.id); setCameraIntent(i.id); setMode('capture') }}
            style={{ width:'100%', background:'#161923', border:'1px solid #1e2231', borderRadius:16, padding:'16px', marginBottom:10, display:'flex', alignItems:'center', gap:14, cursor:'pointer', textAlign:'left' }}
            onMouseEnter={e => e.currentTarget.style.borderColor='var(--school-color)'}
            onMouseLeave={e => e.currentTarget.style.borderColor='#1e2231'}>
            <span style={{ fontSize:28 }}>{i.icon}</span>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:'#eef0f8', marginBottom:3 }}>{i.label}</div>
              <div style={{ fontSize:12, color:'#6b7494' }}>{i.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  // ── CAPTURE ──────────────────────────────────────────────────────────────────
  if (mode === 'capture') return (
    <div style={S.shell}>
      <div style={S.header}>
        <button style={S.backBtn} onClick={resetAll}>← Back</button>
        <h1 style={S.h1}>{INTENTS.find(i => i.id === intent)?.label}</h1>
      </div>

      {intent === 'grade' && (
        <div style={S.card}>
          <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#6b7494', marginBottom:8 }}>Assignment</label>
          <select
            style={{ width:'100%', background:'#1e2231', border:'1px solid #2a2f42', borderRadius:10, padding:'10px 12px', color:'#eef0f8', fontSize:13 }}
            value={selectedAssignmentId}
            onChange={e => setSelectedAssignmentId(e.target.value)}>
            {assignments.map(a => <option key={a.id} value={a.id}>{a.name} · {a.type}</option>)}
          </select>
          <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#6b7494', margin:'12px 0 8px' }}>Answer Key (optional)</label>
          <textarea
            style={{ width:'100%', background:'#1e2231', border:'1px solid #2a2f42', borderRadius:10, padding:'10px 12px', color:'#eef0f8', fontSize:12, resize:'none', boxSizing:'border-box' }}
            rows={2}
            placeholder="Paste answer key, or leave blank for AI to figure it out..."
            value={answerKey}
            onChange={e => setAnswerKey(e.target.value)}/>
        </div>
      )}

      <div style={S.card}>
        {/* Camera viewfinder */}
        <div style={{ position:'relative', borderRadius:14, overflow:'hidden', background:'#000', aspectRatio:'4/3', maxHeight:'50vh', marginBottom:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <video ref={videoRef} autoPlay playsInline muted
            style={{ width:'100%', height:'100%', objectFit:'cover', display:cameraActive?'block':'none' }}/>
          {!cameraActive && (
            <div style={{ textAlign:'center', color:'#3d4460' }}>
              <div style={{ fontSize:48, marginBottom:8 }}>📷</div>
              <p style={{ fontSize:12 }}>Start camera or choose a file</p>
            </div>
          )}
        </div>

        {/* Action buttons — Camera, File, Mic */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {!cameraActive ? (
            <button onClick={startCamera} style={S.primary}>Start Camera</button>
          ) : (
            <button onClick={captureFromCamera} style={S.primary}>📸 Capture</button>
          )}

          <input ref={fileRef} type="file" accept={ACCEPT_ALL} onChange={handleFileChange} style={{ display:'none' }}/>
          <button onClick={() => fileRef.current?.click()}
            style={{ ...S.btn('#3b7ef4'), flex:'none', padding:'12px 20px' }}>
            Choose File
          </button>

          {/* Mic button — only show for Grade intent */}
          {intent === 'grade' && (
            <button
              onClick={recording ? stopRecording : startRecording}
              disabled={transcribing}
              style={{
                background: recording ? '#f04a4a22' : transcribing ? '#1e2231' : '#9b6ef522',
                color:      recording ? '#f04a4a'   : transcribing ? '#6b7494' : '#9b6ef5',
                border:     `1px solid ${recording ? '#f04a4a50' : transcribing ? '#2a2f42' : '#9b6ef550'}`,
                borderRadius:12, padding:'12px 16px', fontSize:20,
                cursor:     transcribing ? 'not-allowed' : 'pointer',
                flexShrink: 0,
                position:   'relative',
              }}
              title={recording ? 'Tap to stop recording' : 'Dictate a grade verbally'}>
              {recording ? '⏹' : transcribing ? '⏳' : '🎤'}
              {recording && (
                <span style={{ position:'absolute', top:4, right:4, width:8, height:8, borderRadius:'50%', background:'#f04a4a', animation:'pulse 1s infinite' }}/>
              )}
            </button>
          )}
        </div>

        {/* Voice status message */}
        {voiceStatus && (
          <div style={{ marginTop:10, background:'#9b6ef515', border:'1px solid #9b6ef530', borderRadius:10, padding:'8px 12px', fontSize:12, color:'#9b6ef5', fontStyle:'italic' }}>
            {voiceStatus}
          </div>
        )}

        <p style={{ fontSize:10, color:'#6b7494', margin:'8px 0 0', textAlign:'center' }}>
          Photos &middot; PDF &middot; CSV &middot; Excel &middot; Word &middot; {intent === 'grade' ? '🎤 Voice' : 'Text'}
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>

      {error && (
        <div style={{ ...S.card, background:'#1c1012', border:'1px solid #f04a4a30', color:'#f04a4a', fontSize:13 }}>
          {error}
        </div>
      )}
    </div>
  )

  // ── PROCESSING ───────────────────────────────────────────────────────────────
  if (mode === 'processing') return (
    <div style={{ ...S.shell, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
      {capturedImage && (
        <img src={capturedImage} alt="Captured"
          style={{ width:120, height:120, objectFit:'cover', borderRadius:14, marginBottom:20, opacity:0.6 }}/>
      )}
      <div style={{ width:36, height:36, border:'3px solid var(--school-color)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', marginBottom:16 }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontWeight:700, color:'#eef0f8', marginBottom:4 }}>
        {transcribing ? 'Transcribing audio...' : 'Claude is reading this file'}
      </p>
      <p style={{ fontSize:12, color:'#6b7494' }}>
        {transcribing ? 'AssemblyAI speech-to-text' : 'Detecting format · Processing...'}
      </p>
    </div>
  )

  // ── RESULT ───────────────────────────────────────────────────────────────────
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
            {result.source === 'voice' && (
              <div style={{ background:'#9b6ef515', border:'1px solid #9b6ef530', borderRadius:10, padding:'6px 10px', marginBottom:12, fontSize:11, color:'#9b6ef5', fontWeight:700 }}>
                🎤 Graded via voice dictation
              </div>
            )}
            <div style={{ textAlign:'center', padding:'12px 0 20px' }}>
              <div style={{ fontSize:56, fontWeight:900, color, lineHeight:1 }}>{Math.round(pct)}%</div>
              <div style={{ fontSize:24, fontWeight:700, color, marginTop:4 }}>{letter}</div>
              {result.format      && <div style={{ fontSize:12, color:'#6b7494', marginTop:4 }}>{result.format}</div>}
              {result.studentName && <div style={{ fontSize:13, color:'#eef0f8', marginTop:8 }}>Student: {result.studentName}</div>}
              {result.assignment  && <div style={{ fontSize:12, color:'#6b7494' }}>Assignment: {result.assignment.name}</div>}
            </div>
            {result.feedback && (
              <div style={{ background:'#1e2231', borderRadius:12, padding:12, marginBottom:12 }}>
                <div style={{ fontSize:10, fontWeight:700, color:'#6b7494', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>
                  {result.source === 'voice' ? 'Dictation' : 'AI Feedback'}
                </div>
                <p style={{ fontSize:13, color:'#c0c8e0', margin:0 }}>{result.feedback}</p>
              </div>
            )}
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={syncToGradebook} style={{ ...S.btn('#22c97a'), padding:'12px 0' }}>✓ Sync to Gradebook</button>
              <button onClick={downloadResult}   style={{ ...S.btn('#3b7ef4'), padding:'12px 0' }}>⬇ Download</button>
            </div>
          </div>
        )}

        {result.type === 'roster' && (
          <div style={S.card}>
            <div style={{ fontSize:13, fontWeight:700, color:'#eef0f8', marginBottom:12 }}>
              ✅ {result.students?.length || 0} students found{result.fileName ? ` from ${result.fileName}` : ''}
            </div>
            {result.students?.slice(0, 10).map((s, i) => (
              <div key={i} style={{ background:'#1e2231', borderRadius:8, padding:'8px 12px', marginBottom:6, fontSize:13, color:'#eef0f8' }}>
                {s.name}{s.id ? ` · ID: ${s.id}` : ''}
              </div>
            ))}
            {result.students?.length > 10 && <div style={{ fontSize:11, color:'#6b7494', marginTop:4 }}>+{result.students.length - 10} more</div>}
            <button onClick={downloadResult} style={{ ...S.btn('#3b7ef4'), padding:'12px 0', marginTop:8, display:'block', width:'100%' }}>⬇ Download Roster JSON</button>
          </div>
        )}

        {result.type === 'answer-key' && (
          <div style={S.card}>
            <div style={{ fontSize:13, fontWeight:700, color:'#eef0f8', marginBottom:8 }}>✅ Answer Key Extracted</div>
            <div style={{ background:'#1e2231', borderRadius:10, padding:12, fontSize:12, color:'#c0c8e0' }}>{result.text}</div>
          </div>
        )}

        {result.type === 'upload' && (
          <div style={S.card}>
            <div style={{ fontSize:13, fontWeight:700, color:'#22c97a', marginBottom:4 }}>✅ {result.message}</div>
            {result.fileName && <div style={{ fontSize:12, color:'#6b7494' }}>{result.fileName}</div>}
          </div>
        )}

        <div style={{ padding:'0 16px' }}>
          <button onClick={resetAll} style={{ ...S.btn('#6b7494'), width:'100%', padding:'12px 0' }}>Scan Another</button>
        </div>
      </div>
    )
  }

  // ── BULK REVIEW ──────────────────────────────────────────────────────────────
  if (mode === 'bulk-review') {
    const readyCount = bulkGrades.filter(g => g.matchedStudentId && g.matchedAssignmentId).length
    return (
      <div style={S.shell}>
        <div style={S.header}>
          <button style={S.backBtn} onClick={resetAll}>← Back</button>
          <h1 style={S.h1}>Review Grades</h1>
        </div>

        {/* Summary bar */}
        <div style={{ margin:'0 16px 14px', background:'#161923', border:'1px solid #1e2231', borderRadius:14, padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:20, fontWeight:900, color:'#22c97a' }}>{readyCount}</div>
            <div style={{ fontSize:10, color:'#6b7494' }}>ready to sync</div>
          </div>
          <div>
            <div style={{ fontSize:20, fontWeight:900, color:'#f5a623' }}>{bulkGrades.length - readyCount}</div>
            <div style={{ fontSize:10, color:'#6b7494' }}>need review</div>
          </div>
          <div>
            <div style={{ fontSize:20, fontWeight:900, color:'#3b7ef4' }}>{bulkGrades.length}</div>
            <div style={{ fontSize:10, color:'#6b7494' }}>total rows</div>
          </div>
        </div>

        {/* Grade rows */}
        <div style={{ padding:'0 16px', marginBottom:80 }}>
          {bulkGrades.map((g, i) => {
            const pct    = g.percentage || 0
            const color  = pct >= 90 ? '#22c97a' : pct >= 80 ? '#3b7ef4' : pct >= 70 ? '#f5a623' : '#f04a4a'
            const letter = pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F'
            const hasIssue = !g.matchedStudentId || !g.matchedAssignmentId

            return (
              <div key={i} style={{ background:'#161923', border:`1px solid ${hasIssue ? '#f5a62340' : '#1e2231'}`, borderRadius:14, padding:'12px 14px', marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:hasIssue ? 8 : 0 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color: hasIssue ? '#f5a623' : '#eef0f8', marginBottom:2 }}>
                      {hasIssue ? '⚠ ' : ''}{g.matchedStudentName || g.studentName}
                    </div>
                    <div style={{ fontSize:10, color:'#6b7494' }}>
                      {g.matchedAssignmentName || g.assignmentName || 'Unknown assignment'} &middot; {g.format || `${g.score}/${g.maxScore}`}
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0, marginLeft:12 }}>
                    <div style={{ fontSize:22, fontWeight:900, color }}>{Math.round(pct)}%</div>
                    <div style={{ fontSize:11, fontWeight:700, color }}>{letter}</div>
                  </div>
                </div>

                {/* Inline fix for unmatched students */}
                {hasIssue && (
                  <div style={{ marginTop:6 }}>
                    <select
                      value={g.matchedStudentId || ''}
                      onChange={e => {
                        const st = students.find(s => s.id === Number(e.target.value))
                        setBulkGrades(prev => prev.map((row, idx) =>
                          idx === i ? { ...row, matchedStudentId: st?.id || null, matchedStudentName: st?.name || row.studentName } : row
                        ))
                      }}
                      style={{ width:'100%', background:'#1e2231', border:'1px solid #2a2f42', borderRadius:8, padding:'7px 10px', color:'#eef0f8', fontSize:12, marginBottom:4 }}>
                      <option value="">-- Match to student --</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <select
                      value={g.matchedAssignmentId || ''}
                      onChange={e => {
                        const a = assignments.find(a => a.id === Number(e.target.value))
                        setBulkGrades(prev => prev.map((row, idx) =>
                          idx === i ? { ...row, matchedAssignmentId: a?.id || null, matchedAssignmentName: a?.name || row.assignmentName } : row
                        ))
                      }}
                      style={{ width:'100%', background:'#1e2231', border:'1px solid #2a2f42', borderRadius:8, padding:'7px 10px', color:'#eef0f8', fontSize:12 }}>
                      <option value="">-- Match to assignment --</option>
                      {assignments.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Sticky bottom bar */}
        <div style={{ position:'fixed', bottom:0, left:0, right:0, padding:'12px 16px max(16px,env(safe-area-inset-bottom))', background:'rgba(6,8,16,0.97)', backdropFilter:'blur(16px)', borderTop:'1px solid #1e2231', display:'flex', gap:8 }}>
          <button onClick={resetAll}
            style={{ ...S.btn('#6b7494'), flex:'none', padding:'12px 16px' }}>
            Retake
          </button>
          <button
            onClick={syncAllToGradebook}
            disabled={bulkSyncing || readyCount === 0}
            style={{ flex:1, background: readyCount > 0 ? '#22c97a' : '#1e2231', color: readyCount > 0 ? '#000' : '#6b7494', border:'none', borderRadius:12, padding:'12px', fontSize:14, fontWeight:800, cursor: readyCount > 0 ? 'pointer' : 'not-allowed' }}>
            {bulkSyncing ? 'Syncing...' : bulkDone ? '✅ Done!' : `Sync ${readyCount} Grade${readyCount !== 1 ? 's' : ''} to Gradebook`}
          </button>
        </div>
      </div>
    )
  }

  // ── DONE ─────────────────────────────────────────────────────────────────────
  if (mode === 'done') return (
    <div style={{ ...S.shell, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:16 }}>
      <div style={{ fontSize:64 }}>✅</div>
      <p style={{ fontWeight:700, color:'#eef0f8', fontSize:18 }}>Synced to Gradebook!</p>
      <button onClick={resetAll} style={{ ...S.btn('#3b7ef4'), padding:'12px 24px' }}>Scan Another</button>
      <button onClick={onBack}   style={{ ...S.btn('#6b7494'), padding:'12px 24px' }}>← Back to Dashboard</button>
    </div>
  )

  return null
}
