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
  const { cameraIntent, setCameraIntent, assignments, updateGrade, students, classes,
          getStudentsForClass, getAssignmentsForClass, addAssignment, currentUser } = useStore()
  const role = currentUser?.role || 'teacher'

  const [intent,               setIntent]               = useState(cameraIntent || null)
  const [mode,                 setMode]                 = useState('intent')
  const [capturedImage,        setCapturedImage]        = useState(null)
  const [capturedFile,         setCapturedFile]         = useState(null)
  const [result,               setResult]               = useState(null)
  const [error,                setError]                = useState('')
  const [cameraActive,         setCameraActive]         = useState(false)
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(assignments[0]?.id || '')
  const [selectedClassId,      setSelectedClassId]      = useState(classes[0]?.id || '')
  const [selectedStudentId,    setSelectedStudentId]    = useState('') // '' = scan all, detect from paper
  const [answerKey,            setAnswerKey]            = useState('')
  const [rosterResults,        setRosterResults]        = useState(null)

  // ── New assignment inline creation ────────────────────────────────────────────
  const [showNewAssign, setShowNewAssign]   = useState(false)
  const [newAssignName, setNewAssignName]   = useState('')
  const [newAssignType, setNewAssignType]   = useState('quiz')

  // ── Voice state ──────────────────────────────────────────────────────────────
  const [recording,    setRecording]    = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [voiceStatus,  setVoiceStatus]  = useState('')

  // ── Bulk grade sheet state ────────────────────────────────────────────────────
  const [bulkGrades,   setBulkGrades]   = useState([]) // [{studentName, matchedStudentId, assignmentName, score, maxScore, percentage, confidence, editing}]
  const [bulkSyncing,  setBulkSyncing]  = useState(false)
  const [bulkDone,     setBulkDone]     = useState(false)

  // ── Single grade sync state ───────────────────────────────────────────────────
  const [syncStudentId,    setSyncStudentId]    = useState('')
  const [syncAssignmentId, setSyncAssignmentId] = useState('')

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

      // Auto-match student name
      const nameLower = (parsed.studentName || '').toLowerCase()
      const matchedSt = students.find(s => {
        const sLower = s.name.toLowerCase()
        return sLower.includes(nameLower) || nameLower.includes(sLower.split(' ')[0])
      })
      setSyncStudentId(matchedSt?.id ? String(matchedSt.id) : '')
      setSyncAssignmentId(assignment?.id ? String(assignment.id) : '')

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
    const assignment   = assignments.find(a => a.id === Number(selectedAssignmentId))
    const preStudent   = selectedStudentId ? students.find(s => s.id === Number(selectedStudentId)) : null
    const studentNames = students.map(s => s.name).join(', ')

    const body = JSON.stringify({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 800,
      system:     `You are an expert at reading graded school papers. Identify the scoring system and calculate the correct percentage.
${preStudent ? `This paper belongs to student: ${preStudent.name}. Do not try to detect the student name — use "${preStudent.name}".` : `Known students: ${studentNames || 'unknown'}. Try to read the student name from the paper.`}
Return ONLY valid JSON: {"studentName":"","score":85,"maxScore":100,"percentage":85,"format":"e.g. 17/20","feedback":"brief feedback","confidence":"high|medium|low"}`,
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

    // If student was pre-selected, use them directly — no fuzzy match needed
    const matchedStudent = preStudent || (() => {
      const nameFromImage = (parsed.studentName || '').toLowerCase()
      return students.find(s => {
        const sLower = s.name.toLowerCase()
        return sLower.includes(nameFromImage) || nameFromImage.includes(sLower.split(' ')[0])
      })
    })()

    const assignmentFromDropdown = assignments.find(a => a.id === Number(selectedAssignmentId))
    const matchedAssignment = assignmentFromDropdown || assignments[0]

    setSyncStudentId(matchedStudent?.id ? String(matchedStudent.id) : '')
    setSyncAssignmentId(matchedAssignment?.id ? String(matchedAssignment.id) : '')

    setResult({ type:'grade', ...parsed,
      studentName: matchedStudent?.name || parsed.studentName,
      assignment:  matchedAssignment,
      source:      'image' })
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
