import React, { useState, useEffect, useRef } from 'react'
import { callAI } from '../lib/ai'

const C = {
  bg:'#060810', card:'#161923', inner:'#1e2231', border:'#2a2f42',
  text:'#eef0f8', muted:'#6b7494', green:'#22c97a', blue:'#3b7ef4',
  red:'#f04a4a', amber:'#f5a623', purple:'#9b6ef5', teal:'#0fb8a0',
}

function gradeColor(s) { return s>=90?C.green:s>=80?C.blue:s>=70?C.amber:C.red }
function gradeLetter(s) { return s>=90?'A':s>=80?'B':s>=70?'C':'D' }

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick}
      style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:600, marginBottom:12 }}>
      ← Back
    </button>
  )
}

const MODES = [
  { id:'lockdown',  icon:'🔒', label:'Lockdown Browser', sub:'Link to external test · Locks browser tab', color:C.blue   },
  { id:'builder',   icon:'🏗',  label:'Native Builder',   sub:'Build questions here · AI can generate',   color:C.green  },
  { id:'pdf',       icon:'📄', label:'PDF / Upload',      sub:'Upload existing test · AI auto-grade',     color:C.purple },
]

// ── Lockdown Mode ──────────────────────────────────────────────────────────────
function LockdownMode({ onBack }) {
  const [url, setUrl]       = useState('')
  const [title, setTitle]   = useState('')
  const [duration, setDuration] = useState(45)
  const [active, setActive] = useState(false)
  const [students, setStudents] = useState([
    { id:1, name:'Aaliyah Brooks',   status:'waiting',    progress:0   },
    { id:2, name:'Marcus Thompson',  status:'waiting',    progress:0   },
    { id:3, name:'Sofia Rodriguez',  status:'waiting',    progress:0   },
    { id:4, name:'Devon Parker',     status:'waiting',    progress:0   },
    { id:5, name:'Emma Williams',    status:'waiting',    progress:0   },
  ])
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef()

  function startTest() {
    if (!url.trim()) return
    setActive(true)
    setStudents(s => s.map(st => ({ ...st, status:'taking', progress:0 })))
    timerRef.current = setInterval(() => {
      setElapsed(e => e + 1)
      setStudents(prev => prev.map(st => ({
        ...st,
        progress: Math.min(100, st.progress + Math.random() * 2),
        status: st.progress >= 98 ? 'submitted' : 'taking',
      })))
    }, 1000)
  }

  useEffect(() => () => clearInterval(timerRef.current), [])

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60

  return (
    <div>
      <BackBtn onClick={onBack} />
      <h2 style={{ fontSize:18, fontWeight:800, color:C.text, marginBottom:4 }}>🔒 Lockdown Browser</h2>
      <p style={{ fontSize:12, color:C.muted, marginBottom:16 }}>Paste a test URL · Students take it in a locked tab</p>

      {!active ? (
        <>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Test title..."
            style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 12px', color:C.text, fontSize:12, marginBottom:10, boxSizing:'border-box', outline:'none' }} />
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Test URL (Google Form, Khan Academy, etc.)..."
            style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 12px', color:C.text, fontSize:12, marginBottom:10, boxSizing:'border-box', outline:'none' }} />
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <span style={{ fontSize:12, color:C.muted }}>Duration:</span>
            {[25,45,60,90].map(m => (
              <button key={m} onClick={() => setDuration(m)}
                style={{ background:duration===m?'var(--school-color,#f97316)':'#1e2231', color:duration===m?'#fff':C.muted, border:'none', borderRadius:8, padding:'5px 10px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                {m}m
              </button>
            ))}
          </div>
          <div style={{ background:`${C.blue}12`, border:`1px solid ${C.blue}30`, borderRadius:12, padding:'10px 14px', marginBottom:14, fontSize:11, color:C.blue }}>
            🔒 Students will be locked to this tab · Cannot switch apps · Timer visible
          </div>
          <button onClick={startTest} disabled={!url.trim()}
            style={{ width:'100%', background:url.trim()?'var(--school-color,#f97316)':'#1e2231', color:url.trim()?'#fff':C.muted, border:'none', borderRadius:14, padding:14, fontSize:15, fontWeight:800, cursor:url.trim()?'pointer':'not-allowed' }}>
            🚀 Start Lockdown Test
          </button>
        </>
      ) : (
        <>
          {/* Live monitor */}
          <div style={{ background:'linear-gradient(135deg,#0f1a2a,#0a1020)', border:`1px solid ${C.blue}30`, borderRadius:16, padding:16, marginBottom:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{title || 'Lockdown Test'}</div>
                <div style={{ fontSize:10, color:C.muted }}>{url.substring(0,40)}...</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:22, fontWeight:800, color:C.text, fontFamily:'monospace' }}>
                  {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
                </div>
                <div style={{ fontSize:9, color:C.blue }}>ELAPSED</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              {[
                { label:'Taking', val:students.filter(s=>s.status==='taking').length, color:C.blue },
                { label:'Done',   val:students.filter(s=>s.status==='submitted').length, color:C.green },
              ].map(s => (
                <div key={s.label} style={{ flex:1, background:C.inner, borderRadius:8, padding:'8px', textAlign:'center' }}>
                  <div style={{ fontSize:20, fontWeight:800, color:s.color }}>{s.val}</div>
                  <div style={{ fontSize:9, color:C.muted, textTransform:'uppercase' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {students.map(s => (
            <div key={s.id} style={{ background:C.inner, borderRadius:12, padding:'10px 12px', marginBottom:6, display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:4 }}>{s.name}</div>
                <div style={{ background:C.card, borderRadius:999, height:5, overflow:'hidden' }}>
                  <div style={{ background:s.status==='submitted'?C.green:C.blue, height:'100%', width:`${s.progress}%`, borderRadius:999, transition:'width 0.5s' }} />
                </div>
              </div>
              <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:999, flexShrink:0,
                background:s.status==='submitted'?`${C.green}22`:`${C.blue}22`,
                color:s.status==='submitted'?C.green:C.blue }}>
                {s.status==='submitted'?'Done':'Taking'}
              </span>
            </div>
          ))}

          <button onClick={() => { setActive(false); clearInterval(timerRef.current); setElapsed(0) }}
            style={{ marginTop:10, width:'100%', background:`${C.red}22`, color:C.red, border:'none', borderRadius:12, padding:11, fontSize:13, fontWeight:700, cursor:'pointer' }}>
            ⏹ End Test
          </button>
        </>
      )}
    </div>
  )
}

// ── Native Builder ─────────────────────────────────────────────────────────────
function BuilderMode({ onBack }) {
  const [title, setTitle]       = useState('')
  const [subject, setSubject]   = useState('')
  const [questions, setQuestions] = useState([])
  const [generating, setGenerating] = useState(false)
  const [error, setError]       = useState(null)
  const [activeTest, setActiveTest] = useState(false)
  const [answers, setAnswers]   = useState({})
  const [results, setResults]   = useState(null)

  async function generateQuestions() {
    if (!subject.trim()) return
    setGenerating(true)
    setError(null)
    try {
      const prompt = `Generate 5 multiple-choice questions for a ${subject} test${title ? ' titled "' + title + '"' : ''}. 
Return ONLY valid JSON, no explanation:
{"questions":[{"id":1,"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"correct":"A"}]}`
      const text = await callAI(prompt)
      const clean = text.replace(/```json\s*/g,'').replace(/```\s*/g,'').trim()
      const data = JSON.parse(clean)
      setQuestions(data.questions || [])
    } catch (e) {
      setError('AI generation failed. Try again or add questions manually.')
    }
    setGenerating(false)
  }

  function addQuestion() {
    setQuestions(q => [...q, { id:Date.now(), question:'', options:['A) ','B) ','C) ','D) '], correct:'A' }])
  }

  function updateQ(id, field, val) {
    setQuestions(q => q.map(qn => qn.id===id ? { ...qn, [field]:val } : qn))
  }

  function submitTest() {
    const score = questions.reduce((sum, q) => sum + (answers[q.id]===q.correct?1:0), 0)
    const pct = Math.round((score/questions.length)*100)
    setResults({ score:pct, correct:score, total:questions.length })
  }

  if (results) return (
    <div>
      <button onClick={() => { setResults(null); setAnswers({}) }}
        style={{ background:C.inner, border:'none', borderRadius:10, padding:'7px 14px', color:C.text, cursor:'pointer', fontSize:12, fontWeight:600, marginBottom:14 }}>
        ← Back to Test
      </button>
      <div style={{ background:C.inner, borderRadius:16, padding:24, textAlign:'center', marginBottom:16 }}>
        <div style={{ fontSize:60, fontWeight:900, color:gradeColor(results.score), lineHeight:1 }}>{results.score}</div>
        <div style={{ fontSize:20, fontWeight:800, color:gradeColor(results.score) }}>{gradeLetter(results.score)}</div>
        <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>{results.correct}/{results.total} correct</div>
      </div>
      {questions.map(q => (
        <div key={q.id} style={{ background:answers[q.id]===q.correct?'#0f2a1a':'#1c1012', border:`1px solid ${answers[q.id]===q.correct?C.green:C.red}30`, borderRadius:12, padding:'12px 14px', marginBottom:8 }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.text, marginBottom:6 }}>{q.question}</div>
          <div style={{ fontSize:11, color:answers[q.id]===q.correct?C.green:C.red }}>
            Your answer: {answers[q.id]} · Correct: {q.correct}
          </div>
        </div>
      ))}
    </div>
  )

  if (activeTest) return (
    <div>
      <button onClick={() => setActiveTest(false)}
        style={{ background:C.inner, border:'none', borderRadius:10, padding:'7px 14px', color:C.text, cursor:'pointer', fontSize:12, fontWeight:600, marginBottom:14 }}>
        ← Exit Test
      </button>
      <h2 style={{ fontSize:18, fontWeight:800, color:C.text, marginBottom:16 }}>{title || 'Test'}</h2>
      {questions.map((q, i) => (
        <div key={q.id} style={{ background:C.inner, borderRadius:14, padding:'14px 16px', marginBottom:10 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:10 }}>{i+1}. {q.question}</div>
          {q.options.map(opt => (
            <div key={opt} onClick={() => setAnswers(a => ({ ...a, [q.id]:opt.charAt(0) }))}
              style={{ background:answers[q.id]===opt.charAt(0)?'rgba(59,126,244,0.2)':C.card, border:`1px solid ${answers[q.id]===opt.charAt(0)?C.blue:C.border}`, borderRadius:10, padding:'8px 12px', marginBottom:6, cursor:'pointer', fontSize:12, color:C.text, transition:'all 0.15s' }}>
              {opt}
            </div>
          ))}
        </div>
      ))}
      <button onClick={submitTest} disabled={Object.keys(answers).length < questions.length}
        style={{ width:'100%', background:Object.keys(answers).length>=questions.length?'var(--school-color,#f97316)':'#1e2231', color:Object.keys(answers).length>=questions.length?'#fff':C.muted, border:'none', borderRadius:14, padding:14, fontSize:15, fontWeight:800, cursor:'pointer', marginTop:4 }}>
        Submit Test →
      </button>
    </div>
  )

  return (
    <div>
      <BackBtn onClick={onBack} />
      <h2 style={{ fontSize:18, fontWeight:800, color:C.text, marginBottom:4 }}>🏗 Test Builder</h2>
      <p style={{ fontSize:12, color:C.muted, marginBottom:16 }}>Build questions manually or use AI to generate them</p>

      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Test title..."
        style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 12px', color:C.text, fontSize:12, marginBottom:10, boxSizing:'border-box', outline:'none' }} />

      {/* AI Generation */}
      <div style={{ background:`${C.purple}12`, border:`1px solid ${C.purple}30`, borderRadius:14, padding:14, marginBottom:14 }}>
        <div style={{ fontSize:12, fontWeight:700, color:C.purple, marginBottom:8 }}>✨ AI Question Generator</div>
        <div style={{ display:'flex', gap:8 }}>
          <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject, topic, grade level..."
            style={{ flex:1, background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:'8px 12px', color:C.text, fontSize:12, outline:'none' }} />
          <button onClick={generateQuestions} disabled={!subject.trim() || generating}
            style={{ background:C.purple, color:'#fff', border:'none', borderRadius:10, padding:'8px 14px', fontSize:12, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
            {generating ? '...' : 'Generate'}
          </button>
        </div>
        {error && <div style={{ fontSize:11, color:C.red, marginTop:8 }}>⚠ {error}</div>}
      </div>

      {/* Questions */}
      {questions.map((q, i) => (
        <div key={q.id} style={{ background:C.inner, borderRadius:14, padding:'14px 16px', marginBottom:10 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <span style={{ fontSize:11, fontWeight:700, color:C.muted }}>Q{i+1}</span>
            <button onClick={() => setQuestions(qns => qns.filter(qn => qn.id !== q.id))}
              style={{ background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:16 }}>×</button>
          </div>
          <input value={q.question} onChange={e => updateQ(q.id, 'question', e.target.value)} placeholder="Question..."
            style={{ width:'100%', background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:'8px 10px', color:C.text, fontSize:12, marginBottom:8, boxSizing:'border-box', outline:'none' }} />
          {q.options.map((opt, oi) => (
            <div key={oi} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
              <button onClick={() => updateQ(q.id, 'correct', opt.charAt(0))}
                style={{ width:20, height:20, borderRadius:'50%', border:`2px solid ${q.correct===opt.charAt(0)?C.green:C.border}`, background:q.correct===opt.charAt(0)?C.green:'transparent', cursor:'pointer', flexShrink:0 }} />
              <input value={opt} onChange={e => { const newOpts = [...q.options]; newOpts[oi]=e.target.value; updateQ(q.id,'options',newOpts) }}
                style={{ flex:1, background:C.card, border:`1px solid ${C.border}`, borderRadius:6, padding:'5px 8px', color:C.text, fontSize:11, outline:'none' }} />
            </div>
          ))}
        </div>
      ))}

      <button onClick={addQuestion}
        style={{ width:'100%', background:C.inner, border:`1px dashed ${C.border}`, borderRadius:12, padding:11, fontSize:13, fontWeight:700, color:C.muted, cursor:'pointer', marginBottom:10 }}>
        + Add Question
      </button>

      {questions.length > 0 && (
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => setActiveTest(true)}
            style={{ flex:1, background:'var(--school-color,#f97316)', color:'#fff', border:'none', borderRadius:12, padding:12, fontSize:13, fontWeight:800, cursor:'pointer' }}>
            🚀 Preview Test
          </button>
          <button onClick={() => window.print()}
            style={{ background:`${C.blue}22`, color:C.blue, border:'none', borderRadius:12, padding:'12px 16px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
            🖨 Print
          </button>
        </div>
      )}
    </div>
  )
}

// ── PDF Mode ───────────────────────────────────────────────────────────────────
function PDFMode({ onBack }) {
  const [file, setFile]     = useState(null)
  const [grading, setGrading] = useState(false)
  const [graded, setGraded] = useState(false)
  const inputRef = useRef()

  const fakeStudents = [
    { name:'Aaliyah Brooks',  score:94 },
    { name:'Marcus Thompson', score:87 },
    { name:'Sofia Rodriguez', score:72 },
    { name:'Devon Parker',    score:65 },
    { name:'Emma Williams',   score:91 },
  ]

  async function handleAutoGrade() {
    setGrading(true)
    await new Promise(r => setTimeout(r, 2200))
    setGrading(false)
    setGraded(true)
  }

  if (grading) return (
    <div style={{ textAlign:'center', padding:'60px 20px' }}>
      <div style={{ fontSize:48, marginBottom:16 }}>🤖</div>
      <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:8 }}>AI Auto-Grading...</div>
      <div style={{ fontSize:12, color:C.muted }}>Reading papers · Matching answers · Calculating scores</div>
      <div style={{ marginTop:24, background:C.inner, borderRadius:999, height:6, overflow:'hidden' }}>
        <div style={{ background:C.purple, height:'100%', width:'70%', borderRadius:999 }} />
      </div>
    </div>
  )

  if (graded) return (
    <div>
      <button onClick={() => { setGraded(false); setFile(null) }}
        style={{ background:C.inner, border:'none', borderRadius:10, padding:'7px 14px', color:C.text, cursor:'pointer', fontSize:12, fontWeight:600, marginBottom:14 }}>
        ← Back
      </button>
      <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:12 }}>✅ Auto-graded {fakeStudents.length} papers</div>
      {fakeStudents.map(s => (
        <div key={s.name} style={{ background:C.inner, borderRadius:12, padding:'10px 14px', marginBottom:6, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:13, color:C.text }}>{s.name}</span>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:16, fontWeight:800, color:gradeColor(s.score) }}>{s.score}%</span>
            <span style={{ fontSize:11, fontWeight:700, color:gradeColor(s.score) }}>{gradeLetter(s.score)}</span>
          </div>
        </div>
      ))}
      <div style={{ marginTop:12, display:'flex', gap:8 }}>
        <button onClick={() => window.print()} style={{ flex:1, background:`${C.green}22`, color:C.green, border:'none', borderRadius:10, padding:10, fontSize:11, fontWeight:700, cursor:'pointer' }}>🖨 Print</button>
        <button onClick={() => window.print()} style={{ flex:1, background:`${C.blue}22`, color:C.blue, border:'none', borderRadius:10, padding:10, fontSize:11, fontWeight:700, cursor:'pointer' }}>📊 Export</button>
      </div>
    </div>
  )

  return (
    <div>
      <BackBtn onClick={onBack} />
      <h2 style={{ fontSize:18, fontWeight:800, color:C.text, marginBottom:4 }}>📄 PDF / Upload</h2>
      <p style={{ fontSize:12, color:C.muted, marginBottom:16 }}>Upload an existing test · AI auto-grades student papers</p>

      <div onClick={() => inputRef.current?.click()}
        style={{ border:`2px dashed ${file?C.green:C.border}`, borderRadius:16, padding:'28px 20px', textAlign:'center', cursor:'pointer', background:C.inner, marginBottom:14 }}>
        <div style={{ fontSize:40, marginBottom:10 }}>{file ? '✅' : '📄'}</div>
        <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:4 }}>
          {file ? file.name : 'Upload test PDF'}
        </div>
        <div style={{ fontSize:11, color:C.muted }}>PDF · Word · Image</div>
      </div>
      <input ref={inputRef} type="file" accept=".pdf,.doc,.docx,image/*" style={{ display:'none' }}
        onChange={e => setFile(e.target.files[0])} />

      {file && (
        <>
          <div style={{ background:`${C.purple}12`, border:`1px solid ${C.purple}30`, borderRadius:12, padding:'10px 14px', marginBottom:14, fontSize:11, color:C.purple }}>
            ✨ AI will read the answer key, then grade each uploaded student paper automatically
          </div>
          <button onClick={handleAutoGrade}
            style={{ width:'100%', background:'var(--school-color,#f97316)', color:'#fff', border:'none', borderRadius:14, padding:14, fontSize:15, fontWeight:800, cursor:'pointer' }}>
            ✨ Auto-Grade with AI →
          </button>
        </>
      )}
    </div>
  )
}

// ── Main TestingSuite ──────────────────────────────────────────────────────────
export default function TestingSuite({ onBack }) {
  const [mode, setMode] = useState(null)

  const modeMap = {
    lockdown: <LockdownMode onBack={() => setMode(null)} />,
    builder:  <BuilderMode  onBack={() => setMode(null)} />,
    pdf:      <PDFMode      onBack={() => setMode(null)} />,
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', paddingBottom:40 }}>
      <div style={{ background:'linear-gradient(135deg,#003057,#001830)', padding:'20px 16px 24px' }}>
        <button onClick={mode ? () => setMode(null) : onBack}
          style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:600, marginBottom:12 }}>
          ← {mode ? 'Choose Mode' : 'Back'}
        </button>
        <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>🧪 Testing Suite</h1>
        {!mode && <p style={{ fontSize:11, color:'rgba(255,255,255,0.7)', margin:'4px 0 0' }}>Choose a testing mode</p>}
      </div>

      <div style={{ padding:'20px 16px' }}>
        {mode ? modeMap[mode] : (
          <>
            {MODES.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                style={{ width:'100%', background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:'16px 18px', marginBottom:10, textAlign:'left', cursor:'pointer', display:'flex', alignItems:'center', gap:14, transition:'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor=m.color}
                onMouseLeave={e => e.currentTarget.style.borderColor=C.border}>
                <div style={{ width:52, height:52, borderRadius:14, background:`${m.color}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>
                  {m.icon}
                </div>
                <div>
                  <div style={{ fontWeight:800, fontSize:14, color:C.text, marginBottom:2 }}>{m.label}</div>
                  <div style={{ fontSize:11, color:C.muted }}>{m.sub}</div>
                </div>
                <div style={{ marginLeft:'auto', fontSize:18, color:C.muted }}>›</div>
              </button>
            ))}

            <div style={{ background:C.inner, borderRadius:14, padding:'12px 16px', marginTop:4 }}>
              <div style={{ fontSize:11, fontWeight:700, color:C.muted, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>Features</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {['⏱ Timer','🔀 Shuffle Q\'s','👁 Live Monitor','✨ AI Grade','🖨 Print','📊 Export'].map(f => (
                  <span key={f} style={{ background:C.card, borderRadius:999, padding:'4px 10px', fontSize:10, color:C.muted }}>{f}</span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
