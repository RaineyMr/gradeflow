import React, { useState, useRef, useCallback } from 'react'
import { gradeWork, extractRoster, extractAnswers } from '../lib/ai'

const C = {
  bg:'#060810', card:'#161923', inner:'#1e2231', border:'#2a2f42',
  text:'#eef0f8', muted:'#6b7494', green:'#22c97a', blue:'#3b7ef4',
  red:'#f04a4a', amber:'#f5a623', purple:'#9b6ef5', teal:'#0fb8a0',
}

const INTENTS = {
  teacher: [
    { id:'grade',          icon:'📝', label:'Grade Work',       sub:'Scan student paper · AI scores & gives feedback' },
    { id:'answerKey',      icon:'🔑', label:'Upload Answer Key', sub:'Scan key · AI uses it for grading' },
    { id:'roster',         icon:'📋', label:'Upload Roster',     sub:'Scan class list · Extract student names' },
    { id:'uploadAssign',   icon:'📤', label:'Upload Assignment',  sub:'Scan assignment sheet for students' },
  ],
  admin: [
    { id:'grade',          icon:'📝', label:'Grade Work',       sub:'Scan student paper · AI scores & gives feedback' },
    { id:'roster',         icon:'📋', label:'Upload Roster',     sub:'Scan class list · Extract student names' },
    { id:'uploadAssign',   icon:'📤', label:'Upload Assignment',  sub:'Scan assignment sheet' },
  ],
  student: [
    { id:'submitAssign',   icon:'📤', label:'Submit Assignment', sub:'Photo or file · Send to teacher' },
  ],
  parent: [
    { id:'submitAssign',   icon:'📤', label:'Submit Assignment', sub:'Photo your child\'s work · Send to teacher' },
  ],
}

function gradeColor(s) { return s>=90?C.green:s>=80?C.blue:s>=70?C.amber:C.red }
function gradeLetter(s) { return s>=90?'A':s>=80?'B':s>=70?'C':'D' }

// ── Shared helpers ─────────────────────────────────────────────────────────────
function BackBtn({ onClick, light }) {
  return (
    <button onClick={onClick}
      style={{ background:light?'rgba(255,255,255,0.15)':C.inner, border:'none', borderRadius:10, padding:'8px 16px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:14 }}>
      ← Back
    </button>
  )
}

function ImageDropZone({ onImage, label }) {
  const inputRef = useRef()
  const [preview, setPreview] = useState(null)

  function handleFile(file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => {
      setPreview(e.target.result)
      onImage(e.target.result.split(',')[1], file.type)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
        style={{ border:`2px dashed ${C.border}`, borderRadius:16, padding:'32px 20px', textAlign:'center', cursor:'pointer', background:C.inner, transition:'border-color 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.borderColor='var(--school-color,#f97316)'}
        onMouseLeave={e => e.currentTarget.style.borderColor=C.border}>
        {preview ? (
          <img src={preview} alt="preview" style={{ maxWidth:'100%', maxHeight:200, borderRadius:10, objectFit:'contain' }} />
        ) : (
          <>
            <div style={{ fontSize:40, marginBottom:10 }}>📷</div>
            <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:4 }}>{label || 'Tap to take photo or upload'}</div>
            <div style={{ fontSize:11, color:C.muted }}>JPG · PNG · PDF · Drag & drop</div>
          </>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*,application/pdf" style={{ display:'none' }}
        onChange={e => handleFile(e.target.files[0])} capture="environment" />
      {preview && (
        <button onClick={() => { setPreview(null); onImage(null, null) }}
          style={{ marginTop:8, background:`${C.red}18`, color:C.red, border:'none', borderRadius:8, padding:'5px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
          Clear
        </button>
      )}
    </div>
  )
}

// ── Grade flow ─────────────────────────────────────────────────────────────────
function GradeFlow({ onBack, role }) {
  const [step, setStep]       = useState('upload') // upload | keyUpload | processing | result
  const [imageData, setImageData] = useState(null)
  const [imageType, setImageType] = useState(null)
  const [keyData, setKeyData] = useState(null)
  const [keyType, setKeyType] = useState(null)
  const [assignName, setAssignName] = useState('')
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState(null)
  const [useKey, setUseKey]   = useState(false)

  async function handleGrade() {
    if (!imageData) return
    setStep('processing')
    setError(null)
    try {
      const answerKey = keyData ? `Answer key image provided.` : ''
      const res = await gradeWork(imageData, imageType || 'image/jpeg', assignName || 'Assignment', answerKey)
      setResult(res)
      setStep('result')
    } catch (e) {
      setError(e.message)
      setStep('upload')
    }
  }

  if (step === 'processing') return (
    <div style={{ textAlign:'center', padding:'60px 20px' }}>
      <div style={{ fontSize:48, marginBottom:16 }}>🤖</div>
      <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:8 }}>Grading with AI...</div>
      <div style={{ fontSize:12, color:C.muted }}>Analyzing handwriting · Checking answers · Writing feedback</div>
      <div style={{ marginTop:24, background:C.inner, borderRadius:999, height:6, overflow:'hidden' }}>
        <div style={{ background:'var(--school-color,#f97316)', height:'100%', width:'60%', borderRadius:999, animation:'pulse 1.2s ease-in-out infinite' }} />
      </div>
    </div>
  )

  if (step === 'result' && result) return (
    <div>
      <BackBtn onClick={() => { setStep('upload'); setResult(null) }} />
      <div style={{ background:'linear-gradient(135deg,#0f2a1a,#0a1a10)', border:`1px solid ${C.green}30`, borderRadius:20, padding:24, marginBottom:16, textAlign:'center' }}>
        <div style={{ fontSize:60, fontWeight:900, color:gradeColor(result.score), lineHeight:1 }}>{result.score}</div>
        <div style={{ fontSize:28, fontWeight:800, color:gradeColor(result.score) }}>{gradeLetter(result.score)}</div>
        <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>{assignName || 'Assignment'}</div>
      </div>

      <div style={{ background:C.inner, borderRadius:16, padding:16, marginBottom:12 }}>
        <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>AI Feedback</div>
        <p style={{ fontSize:13, color:C.text, lineHeight:1.7, margin:0 }}>{result.feedback}</p>
      </div>

      {result.corrections?.length > 0 && (
        <div style={{ background:C.inner, borderRadius:16, padding:16, marginBottom:12 }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Corrections</div>
          {result.corrections.map((c, i) => (
            <div key={i} style={{ background:'#1c1012', borderRadius:10, padding:'8px 12px', marginBottom:6, border:`1px solid ${C.red}20` }}>
              <div style={{ fontSize:12, fontWeight:700, color:C.red }}>{c.question}</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>
                Student: <span style={{ color:'#f04a4a' }}>{c.studentAnswer}</span> · Correct: <span style={{ color:C.green }}>{c.correctAnswer}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display:'flex', gap:8 }}>
        <button onClick={() => window.print()}
          style={{ flex:1, background:`${C.blue}22`, color:C.blue, border:'none', borderRadius:12, padding:12, fontSize:12, fontWeight:700, cursor:'pointer' }}>
          🖨 Print
        </button>
        <button onClick={() => { setStep('upload'); setResult(null); setImageData(null) }}
          style={{ flex:1, background:`${C.green}22`, color:C.green, border:'none', borderRadius:12, padding:12, fontSize:12, fontWeight:700, cursor:'pointer' }}>
          📷 Scan Another
        </button>
      </div>
    </div>
  )

  return (
    <div>
      <BackBtn onClick={onBack} />
      <h2 style={{ fontSize:18, fontWeight:800, color:C.text, marginBottom:4 }}>📝 Grade Work</h2>
      <p style={{ fontSize:12, color:C.muted, marginBottom:16 }}>Scan student paper · AI reads, scores, and gives feedback</p>

      <input value={assignName} onChange={e => setAssignName(e.target.value)} placeholder="Assignment name (optional)..."
        style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 12px', color:C.text, fontSize:12, marginBottom:12, boxSizing:'border-box', outline:'none' }} />

      <ImageDropZone label="Scan student paper" onImage={(d, t) => { setImageData(d); setImageType(t) }} />

      <div style={{ display:'flex', alignItems:'center', gap:8, margin:'12px 0' }}>
        <div onClick={() => setUseKey(!useKey)}
          style={{ width:40, height:22, borderRadius:11, background:useKey?'var(--school-color,#f97316)':C.inner, position:'relative', cursor:'pointer', transition:'background 0.2s', flexShrink:0 }}>
          <div style={{ position:'absolute', top:2, left:useKey?18:2, width:18, height:18, borderRadius:'50%', background:'#fff', transition:'left 0.2s' }} />
        </div>
        <span style={{ fontSize:12, color:C.text }}>Include answer key</span>
      </div>

      {useKey && (
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:11, color:C.muted, marginBottom:8 }}>Upload answer key</div>
          <ImageDropZone label="Scan answer key" onImage={(d, t) => { setKeyData(d); setKeyType(t) }} />
        </div>
      )}

      {error && <div style={{ background:'#1c1012', border:`1px solid ${C.red}30`, borderRadius:10, padding:'8px 12px', color:C.red, fontSize:12, marginBottom:10 }}>⚠ {error}</div>}

      <button onClick={handleGrade} disabled={!imageData}
        style={{ width:'100%', background:imageData?'var(--school-color,#f97316)':'#1e2231', color:imageData?'#fff':C.muted, border:'none', borderRadius:14, padding:14, fontSize:15, fontWeight:800, cursor:imageData?'pointer':'not-allowed', marginTop:4 }}>
        ✨ Grade with AI →
      </button>
    </div>
  )
}

// ── Roster flow ────────────────────────────────────────────────────────────────
function RosterFlow({ onBack }) {
  const [imageData, setImageData] = useState(null)
  const [imageType, setImageType] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState(null)

  async function handleExtract() {
    if (!imageData) return
    setProcessing(true)
    setError(null)
    try {
      const res = await extractRoster(imageData, imageType || 'image/jpeg')
      setResult(res)
    } catch (e) {
      setError(e.message)
    }
    setProcessing(false)
  }

  if (processing) return (
    <div style={{ textAlign:'center', padding:'60px 20px' }}>
      <div style={{ fontSize:48, marginBottom:16 }}>📋</div>
      <div style={{ fontSize:16, fontWeight:700, color:C.text }}>Extracting roster...</div>
    </div>
  )

  if (result) return (
    <div>
      <BackBtn onClick={() => setResult(null)} />
      <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:12 }}>📋 Found {result.students?.length || 0} students</div>
      {result.students?.map((s, i) => (
        <div key={i} style={{ background:C.inner, borderRadius:10, padding:'8px 12px', marginBottom:6, display:'flex', justifyContent:'space-between' }}>
          <span style={{ fontSize:13, color:C.text }}>{s.name}</span>
          {s.id && <span style={{ fontSize:11, color:C.muted }}>ID: {s.id}</span>}
        </div>
      ))}
      <button onClick={() => { setResult(null); setImageData(null) }}
        style={{ marginTop:12, width:'100%', background:`${C.green}22`, color:C.green, border:'none', borderRadius:12, padding:12, fontSize:13, fontWeight:700, cursor:'pointer' }}>
        📷 Scan Another
      </button>
    </div>
  )

  return (
    <div>
      <BackBtn onClick={onBack} />
      <h2 style={{ fontSize:18, fontWeight:800, color:C.text, marginBottom:4 }}>📋 Upload Roster</h2>
      <p style={{ fontSize:12, color:C.muted, marginBottom:16 }}>Scan class list · AI extracts student names & IDs</p>
      <ImageDropZone label="Scan class roster" onImage={(d, t) => { setImageData(d); setImageType(t) }} />
      {error && <div style={{ marginTop:10, color:C.red, fontSize:12 }}>⚠ {error}</div>}
      <button onClick={handleExtract} disabled={!imageData}
        style={{ width:'100%', background:imageData?'var(--school-color,#f97316)':'#1e2231', color:imageData?'#fff':C.muted, border:'none', borderRadius:14, padding:14, fontSize:15, fontWeight:800, cursor:imageData?'pointer':'not-allowed', marginTop:12 }}>
        ✨ Extract Names →
      </button>
    </div>
  )
}

// ── Answer Key flow ────────────────────────────────────────────────────────────
function AnswerKeyFlow({ onBack }) {
  const [imageData, setImageData] = useState(null)
  const [imageType, setImageType] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState(null)

  async function handleExtract() {
    if (!imageData) return
    setProcessing(true)
    setError(null)
    try {
      const res = await extractAnswers(imageData, imageType || 'image/jpeg')
      setResult(res)
    } catch (e) {
      setError(e.message)
    }
    setProcessing(false)
  }

  if (processing) return (
    <div style={{ textAlign:'center', padding:'60px 20px' }}>
      <div style={{ fontSize:48, marginBottom:16 }}>🔑</div>
      <div style={{ fontSize:16, fontWeight:700, color:C.text }}>Reading answer key...</div>
    </div>
  )

  if (result) return (
    <div>
      <BackBtn onClick={() => setResult(null)} />
      <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:12 }}>🔑 {result.answers?.length || 0} answers extracted</div>
      {result.answers?.map((a, i) => (
        <div key={i} style={{ background:C.inner, borderRadius:10, padding:'8px 12px', marginBottom:6, display:'flex', gap:12 }}>
          <span style={{ fontSize:12, color:C.muted, minWidth:24 }}>{a.question}.</span>
          <span style={{ fontSize:13, color:C.green, fontWeight:700 }}>{a.answer}</span>
        </div>
      ))}
      <button onClick={() => { setResult(null); setImageData(null) }}
        style={{ marginTop:12, width:'100%', background:`${C.green}22`, color:C.green, border:'none', borderRadius:12, padding:12, fontSize:13, fontWeight:700, cursor:'pointer' }}>
        📷 Scan Another
      </button>
    </div>
  )

  return (
    <div>
      <BackBtn onClick={onBack} />
      <h2 style={{ fontSize:18, fontWeight:800, color:C.text, marginBottom:4 }}>🔑 Upload Answer Key</h2>
      <p style={{ fontSize:12, color:C.muted, marginBottom:16 }}>Scan answer key · AI reads questions and correct answers</p>
      <ImageDropZone label="Scan answer key" onImage={(d, t) => { setImageData(d); setImageType(t) }} />
      {error && <div style={{ marginTop:10, color:C.red, fontSize:12 }}>⚠ {error}</div>}
      <button onClick={handleExtract} disabled={!imageData}
        style={{ width:'100%', background:imageData?'var(--school-color,#f97316)':'#1e2231', color:imageData?'#fff':C.muted, border:'none', borderRadius:14, padding:14, fontSize:15, fontWeight:800, cursor:imageData?'pointer':'not-allowed', marginTop:12 }}>
        ✨ Extract Answers →
      </button>
    </div>
  )
}

// ── Submit Assignment flow ─────────────────────────────────────────────────────
function SubmitFlow({ onBack }) {
  const [imageData, setImageData] = useState(null)
  const [note, setNote]           = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (submitted) return (
    <div style={{ textAlign:'center', padding:'60px 20px' }}>
      <div style={{ fontSize:64, marginBottom:16 }}>✅</div>
      <div style={{ fontSize:18, fontWeight:800, color:C.green, marginBottom:8 }}>Submitted!</div>
      <div style={{ fontSize:12, color:C.muted, marginBottom:24 }}>Your teacher will be notified</div>
      <button onClick={() => { setSubmitted(false); setImageData(null); setNote('') }}
        style={{ background:`${C.green}22`, color:C.green, border:'none', borderRadius:12, padding:'10px 24px', fontSize:13, fontWeight:700, cursor:'pointer' }}>
        Submit Another
      </button>
    </div>
  )

  return (
    <div>
      <BackBtn onClick={onBack} />
      <h2 style={{ fontSize:18, fontWeight:800, color:C.text, marginBottom:4 }}>📤 Submit Assignment</h2>
      <p style={{ fontSize:12, color:C.muted, marginBottom:16 }}>Photo · File · Note to teacher</p>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:16 }}>
        {[['📷','Photo'],['📄','File'],['🔗','Link']].map(([icon, label]) => (
          <button key={label}
            style={{ background:C.inner, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 8px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
            <span style={{ fontSize:22 }}>{icon}</span>
            <span style={{ fontSize:10, color:C.muted, fontWeight:600 }}>{label}</span>
          </button>
        ))}
      </div>

      <ImageDropZone label="Take photo of your work" onImage={(d, t) => setImageData(d ? d : null)} />

      <textarea rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Note to teacher (optional)..."
        style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 12px', color:C.text, fontSize:12, resize:'none', marginTop:12, marginBottom:12, boxSizing:'border-box', lineHeight:1.6, outline:'none' }} />

      <button onClick={() => setSubmitted(true)} disabled={!imageData && !note.trim()}
        style={{ width:'100%', background:(imageData||note.trim())?'var(--school-color,#f97316)':'#1e2231', color:(imageData||note.trim())?'#fff':C.muted, border:'none', borderRadius:14, padding:14, fontSize:15, fontWeight:800, cursor:(imageData||note.trim())?'pointer':'not-allowed' }}>
        📤 Submit →
      </button>
    </div>
  )
}

// ── Main Camera Component ──────────────────────────────────────────────────────
export default function Camera({ currentUser, onBack }) {
  const role = currentUser?.role || 'teacher'
  const intents = INTENTS[role] || INTENTS.teacher
  const [activeIntent, setActiveIntent] = useState(null)

  const flowMap = {
    grade:        <GradeFlow onBack={() => setActiveIntent(null)} role={role} />,
    answerKey:    <AnswerKeyFlow onBack={() => setActiveIntent(null)} />,
    roster:       <RosterFlow onBack={() => setActiveIntent(null)} />,
    uploadAssign: <SubmitFlow onBack={() => setActiveIntent(null)} />,
    submitAssign: <SubmitFlow onBack={() => setActiveIntent(null)} />,
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', paddingBottom:40 }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,var(--school-color,#f97316),rgba(0,0,0,0.5))', padding:'20px 16px 24px' }}>
        <button onClick={activeIntent ? () => setActiveIntent(null) : onBack}
          style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:600, marginBottom:12 }}>
          ← {activeIntent ? 'Choose Mode' : 'Back'}
        </button>
        <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>
          {activeIntent ? intents.find(i => i.id === activeIntent)?.label : '📷 Camera'}
        </h1>
        {!activeIntent && <p style={{ fontSize:11, color:'rgba(255,255,255,0.7)', margin:'4px 0 0' }}>What do you need to do?</p>}
      </div>

      <div style={{ padding:'20px 16px' }}>
        {activeIntent ? (
          flowMap[activeIntent] || <div style={{ color:C.muted }}>Coming soon</div>
        ) : (
          <>
            {intents.map(intent => (
              <button key={intent.id} onClick={() => setActiveIntent(intent.id)}
                style={{ width:'100%', background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:'16px 18px', marginBottom:10, textAlign:'left', cursor:'pointer', display:'flex', alignItems:'center', gap:14, transition:'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='var(--school-color,#f97316)'}
                onMouseLeave={e => e.currentTarget.style.borderColor=C.border}>
                <div style={{ width:52, height:52, borderRadius:14, background:C.inner, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>
                  {intent.icon}
                </div>
                <div>
                  <div style={{ fontWeight:800, fontSize:14, color:C.text, marginBottom:2 }}>{intent.label}</div>
                  <div style={{ fontSize:11, color:C.muted, lineHeight:1.4 }}>{intent.sub}</div>
                </div>
                <div style={{ marginLeft:'auto', fontSize:18, color:C.muted }}>›</div>
              </button>
            ))}

            {role === 'teacher' || role === 'admin' ? (
              <div style={{ background:C.inner, borderRadius:14, padding:'12px 16px', marginTop:8, fontSize:11, color:C.muted, lineHeight:1.6 }}>
                💡 <strong style={{ color:C.text }}>AI Grading</strong> reads handwriting, checks answers, and writes personalized feedback in seconds.
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
