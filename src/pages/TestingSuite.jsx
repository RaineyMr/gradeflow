import React, { useState } from 'react'
import { useStore } from '../lib/store'
import { AssignmentOptions, LoadingSpinner } from '../components/ui'

const C = { bg:'#060810',card:'#161923',inner:'#1e2231',text:'#eef0f8',muted:'#6b7494',border:'#2a2f42',green:'#22c97a',blue:'#3b7ef4',red:'#f04a4a',amber:'#f5a623',teal:'#0fb8a0',purple:'#9b6ef5' }

function QuestionCard({ q, index, onChange, onDelete }) {
  return (
    <div style={{ background:C.inner, borderRadius:14, padding:'14px 16px', marginBottom:10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <span style={{ fontSize:12, fontWeight:700, color:C.muted }}>Question {index+1}</span>
        <div style={{ display:'flex', gap:6 }}>
          <select value={q.type} onChange={e => onChange({ ...q, type:e.target.value })}
            style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:'4px 8px', color:C.text, fontSize:11, cursor:'pointer' }}>
            <option value="mc">Multiple Choice</option>
            <option value="tf">True / False</option>
            <option value="short">Short Answer</option>
            <option value="essay">Essay</option>
            <option value="fill">Fill in the Blank</option>
          </select>
          <button onClick={onDelete} style={{ background:`${C.red}22`, color:C.red, border:'none', borderRadius:8, padding:'4px 10px', fontSize:11, cursor:'pointer' }}>✕</button>
        </div>
      </div>
      <textarea rows={2} value={q.text} onChange={e => onChange({ ...q, text:e.target.value })}
        placeholder="Enter question..."
        style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 12px', color:C.text, fontSize:13, resize:'none', boxSizing:'border-box', lineHeight:1.5, marginBottom:8 }} />
      {q.type === 'mc' && (
        <div style={{ paddingLeft:8 }}>
          {['A','B','C','D'].map(opt => (
            <div key={opt} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
              <button onClick={() => onChange({ ...q, correct:opt })}
                style={{ width:22, height:22, borderRadius:'50%', border:`2px solid ${q.correct===opt ? C.green : C.border}`, background:q.correct===opt ? `${C.green}22` : 'transparent', cursor:'pointer', fontSize:11, fontWeight:700, color:q.correct===opt ? C.green : C.muted, flexShrink:0 }}>
                {opt}
              </button>
              <input value={q.options?.[opt] || ''} onChange={e => onChange({ ...q, options:{ ...(q.options||{}), [opt]:e.target.value } })}
                placeholder={`Option ${opt}`}
                style={{ flex:1, background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:'6px 10px', color:C.text, fontSize:12, outline:'none' }} />
            </div>
          ))}
          <p style={{ fontSize:10, color:C.muted, margin:'4px 0 0' }}>Click letter to mark correct answer</p>
        </div>
      )}
      {q.type === 'tf' && (
        <div style={{ display:'flex', gap:8 }}>
          {['True','False'].map(v => (
            <button key={v} onClick={() => onChange({ ...q, correct:v })}
              style={{ flex:1, padding:'8px', borderRadius:10, border:`1.5px solid ${q.correct===v ? C.green : C.border}`, background:q.correct===v ? `${C.green}22` : C.bg, color:q.correct===v ? C.green : C.muted, cursor:'pointer', fontSize:12, fontWeight:700 }}>
              {v}
            </button>
          ))}
        </div>
      )}
      {(q.type==='short'||q.type==='fill') && (
        <input value={q.answer || ''} onChange={e => onChange({ ...q, answer:e.target.value })}
          placeholder="Answer key (optional)..."
          style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:'8px 10px', color:C.text, fontSize:12, outline:'none', boxSizing:'border-box' }} />
      )}
    </div>
  )
}

export default function TestingSuite({ onBack }) {
  const { assignments, classes, activeClass, goBack } = useStore()
  const handleBack = onBack || goBack
  const [mode,       setMode]       = useState('menu')  // menu | builder | lockdown | pdf
  const [questions,  setQuestions]  = useState([])
  const [testName,   setTestName]   = useState('')
  const [opts,       setOpts]       = useState({ lockdown:false, timer:false, shuffle:false, schedule:false, monitor:false })
  const [timerMins,  setTimerMins]  = useState(45)
  const [monitoring, setMonitoring] = useState(false)
  const [published,  setPublished]  = useState(false)
  const [generating, setGenerating] = useState(false)
  const [pdfFile,    setPdfFile]    = useState(null)

  function addQuestion(type = 'mc') {
    setQuestions(q => [...q, { id:Date.now(), type, text:'', options:{A:'',B:'',C:'',D:''}, correct:'', answer:'' }])
  }

  async function aiGenerateQuestions() {
    const key = import.meta.env.VITE_ANTHROPIC_KEY
    if (!key) { alert('Add VITE_ANTHROPIC_KEY to use AI question generation.'); return }
    setGenerating(true)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'x-api-key':key, 'anthropic-version':'2023-06-01', 'anthropic-dangerous-direct-browser-access':'true' },
        body: JSON.stringify({
          model:'claude-sonnet-4-20250514', max_tokens:1500,
          messages:[{ role:'user', content:`Generate 5 multiple choice questions for a ${activeClass?.subject||'Math'} test, grade level appropriate. Return ONLY valid JSON: {"questions":[{"type":"mc","text":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correct":"A"}]}` }]
        })
      })
      const data = await res.json()
      const text = data.content?.[0]?.text || ''
      const parsed = safeJSON(text)
      if (parsed?.questions) setQuestions(q => [...q, ...parsed.questions.map((q,i) => ({ ...q, id:Date.now()+i }))])
    } catch { alert('Generation failed. Check your API key.') }
    setGenerating(false)
  }

  function handlePublish() { setPublished(true) }

  const MODES = [
    { id:'lockdown', icon:'🔒', label:'Lockdown Browser', sub:'External test from any ed site · locked', color:C.blue   },
    { id:'builder',  icon:'🏗', label:'Native Builder',   sub:'Build in GradeFlow · MC · Short ans · T/F · Essay', color:C.green  },
    { id:'pdf',      icon:'📄', label:'PDF Convert',      sub:'Upload any PDF · AI digitizes it · Questions editable', color:C.purple },
  ]

  // ── Menu ──────────────────────────────────────────────────────────────────
  if (mode === 'menu') return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', padding:'20px 16px', paddingBottom:80 }}>
      {handleBack && <button onClick={handleBack} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:16 }}>← Back</button>}
      <h1 style={{ fontSize:22, fontWeight:800, margin:'0 0 4px' }}>Testing Suite</h1>
      <p style={{ color:C.muted, fontSize:13, margin:'0 0 20px' }}>3 modes · All devices · Auto-grade · Real-time monitoring</p>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {MODES.map(m => (
          <button key={m.id} onClick={() => setMode(m.id)}
            style={{ background:C.card, border:`1px solid ${m.color}22`, borderRadius:16, padding:'16px', textAlign:'left', cursor:'pointer', display:'flex', alignItems:'center', gap:14 }}
            onMouseEnter={e => e.currentTarget.style.borderColor=m.color}
            onMouseLeave={e => e.currentTarget.style.borderColor=`${m.color}22`}>
            <div style={{ width:48, height:48, borderRadius:12, background:`${m.color}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>{m.icon}</div>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:C.text, marginBottom:2 }}>{m.label}</div>
              <div style={{ fontSize:11, color:C.muted }}>{m.sub}</div>
            </div>
            <span style={{ marginLeft:'auto', color:C.muted, fontSize:18 }}>›</span>
          </button>
        ))}
      </div>
      {/* Features */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:16, marginTop:20 }}>
        <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Features</div>
        {['⏱ Timer + auto-submit','👁 Real-time monitoring','🔀 Randomize question order','🚨 Flag exit attempts','✨ AI auto-grade short answers','📝 Flag essays for review'].map(f => (
          <div key={f} style={{ fontSize:12, color:C.text, padding:'6px 0', borderBottom:`1px solid ${C.inner}` }}>{f}</div>
        ))}
      </div>
    </div>
  )

  // ── Native Builder ────────────────────────────────────────────────────────
  if (mode === 'builder') return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', paddingBottom:100 }}>
      <div style={{ padding:'20px 16px 0', display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
        <button onClick={() => setMode('menu')} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
        <h1 style={{ fontSize:18, fontWeight:800, margin:0 }}>🏗 Test Builder</h1>
      </div>

      {published ? (
        <div style={{ textAlign:'center', padding:'40px 20px' }}>
          <div style={{ fontSize:56, marginBottom:16 }}>✅</div>
          <h2 style={{ color:C.text, marginBottom:8 }}>Test Published!</h2>
          <p style={{ color:C.muted, fontSize:13, marginBottom:20 }}>Students will see it at their next login · {opts.monitor && 'Monitoring active'}</p>
          {opts.monitor && (
            <div style={{ background:C.card, border:`1px solid ${C.blue}30`, borderRadius:14, padding:'14px 16px', textAlign:'left', marginBottom:16 }}>
              <div style={{ fontWeight:700, color:C.blue, marginBottom:8 }}>👁 Live Monitor</div>
              {[{ name:'Aaliyah Brooks', progress:60, status:'In progress' },{ name:'Marcus Thompson', progress:0, status:'Not started' },{ name:'Sofia Rodriguez', progress:100, status:'Submitted ✓' }].map(s => (
                <div key={s.name} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:`1px solid ${C.inner}`, fontSize:12 }}>
                  <span style={{ color:C.text }}>{s.name}</span>
                  <span style={{ color:s.status.includes('Submitted')?C.green:s.status.includes('progress')?C.amber:C.muted }}>{s.status}</span>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => { setPublished(false); setMode('menu') }} style={{ background:'var(--school-color)', border:'none', borderRadius:12, padding:'12px 24px', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' }}>Done</button>
        </div>
      ) : (
        <div style={{ padding:'0 16px' }}>
          <div style={{ marginBottom:12 }}>
            <label style={{ display:'block', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:C.muted, marginBottom:6 }}>Test Name</label>
            <input value={testName} onChange={e => setTestName(e.target.value)} placeholder="e.g. Unit 3 Test"
              style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:12, padding:'11px 14px', color:C.text, fontSize:13, outline:'none', boxSizing:'border-box' }} />
          </div>

          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Options</div>
            <AssignmentOptions options={opts} onChange={setOpts} />
            {opts.timer && (
              <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:10 }}>
                <label style={{ fontSize:12, color:C.text }}>Timer (min):</label>
                <input type="number" value={timerMins} onChange={e => setTimerMins(Number(e.target.value))} min={5} max={180}
                  style={{ width:80, background:C.inner, border:`1px solid ${C.border}`, borderRadius:8, padding:'6px 10px', color:C.text, fontSize:13, outline:'none', textAlign:'center' }} />
              </div>
            )}
          </div>

          <div style={{ display:'flex', gap:8, marginBottom:12 }}>
            <button onClick={() => addQuestion('mc')} style={{ flex:1, background:`${C.blue}22`, color:C.blue, border:'none', borderRadius:12, padding:'10px', fontSize:12, fontWeight:700, cursor:'pointer' }}>+ MC</button>
            <button onClick={() => addQuestion('short')} style={{ flex:1, background:`${C.green}22`, color:C.green, border:'none', borderRadius:12, padding:'10px', fontSize:12, fontWeight:700, cursor:'pointer' }}>+ Short</button>
            <button onClick={() => addQuestion('essay')} style={{ flex:1, background:`${C.purple}22`, color:C.purple, border:'none', borderRadius:12, padding:'10px', fontSize:12, fontWeight:700, cursor:'pointer' }}>+ Essay</button>
            <button onClick={aiGenerateQuestions} disabled={generating} style={{ flex:1, background:`${C.teal}22`, color:C.teal, border:'none', borderRadius:12, padding:'10px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
              {generating ? '...' : '✨ AI'}
            </button>
          </div>

          {generating && <div style={{ textAlign:'center', padding:16 }}><LoadingSpinner /><p style={{ color:C.muted, fontSize:12, marginTop:8 }}>Generating questions...</p></div>}

          {questions.map((q, i) => (
            <QuestionCard key={q.id} q={q} index={i}
              onChange={updated => setQuestions(qs => qs.map(x => x.id===q.id ? updated : x))}
              onDelete={() => setQuestions(qs => qs.filter(x => x.id !== q.id))}
            />
          ))}

          {questions.length > 0 && (
            <div style={{ marginTop:8 }}>
              <div style={{ background:C.inner, borderRadius:12, padding:'10px 14px', marginBottom:10, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontSize:12, color:C.text }}>Grade posting</span>
                <div style={{ display:'flex', gap:6 }}>
                  {['Auto','Review first','Manual'].map(opt => (
                    <button key={opt} style={{ background:opt==='Auto'?'var(--school-color)':'#2a2f42', color:opt==='Auto'?'#fff':C.muted, border:'none', borderRadius:8, padding:'4px 10px', fontSize:10, fontWeight:700, cursor:'pointer' }}>{opt}</button>
                  ))}
                </div>
              </div>
              <button onClick={handlePublish} style={{ width:'100%', background:'var(--school-color)', color:'#fff', border:'none', borderRadius:999, padding:'14px', fontSize:15, fontWeight:800, cursor:'pointer' }}>
                Publish Test ({questions.length} questions)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )

  // ── Lockdown ─────────────────────────────────────────────────────────────
  if (mode === 'lockdown') return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', padding:'20px 16px', paddingBottom:80 }}>
      <button onClick={() => setMode('menu')} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:20 }}>← Back</button>
      <h1 style={{ fontSize:18, fontWeight:800, margin:'0 0 6px' }}>🔒 Lockdown Browser</h1>
      <p style={{ color:C.muted, fontSize:13, margin:'0 0 20px' }}>Link to any external test and lock the browser during it.</p>
      <div style={{ marginBottom:12 }}>
        <label style={{ display:'block', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:C.muted, marginBottom:6 }}>Test URL</label>
        <input placeholder="https://www.khanacademy.org/... or any test URL"
          style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:12, padding:'11px 14px', color:C.text, fontSize:13, outline:'none', boxSizing:'border-box' }} />
      </div>
      <AssignmentOptions options={opts} onChange={setOpts} />
      <button style={{ width:'100%', background:'var(--school-color)', color:'#fff', border:'none', borderRadius:999, padding:'14px', fontSize:15, fontWeight:800, cursor:'pointer', marginTop:14 }}>
        Launch Lockdown Test
      </button>
    </div>
  )

  // ── PDF Convert ───────────────────────────────────────────────────────────
  if (mode === 'pdf') return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', padding:'20px 16px', paddingBottom:80 }}>
      <button onClick={() => setMode('menu')} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:20 }}>← Back</button>
      <h1 style={{ fontSize:18, fontWeight:800, margin:'0 0 6px' }}>📄 PDF Convert</h1>
      <p style={{ color:C.muted, fontSize:13, margin:'0 0 20px' }}>Upload any PDF test · AI digitizes it · All questions become editable.</p>
      <input type="file" accept=".pdf,image/*" onChange={e => { setPdfFile(e.target.files?.[0]); setTimeout(() => setMode('builder'), 2000) }}
        style={{ display:'none' }} id="pdf-upload" />
      <label htmlFor="pdf-upload" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14, background:C.card, border:`2px dashed ${C.border}`, borderRadius:18, padding:'40px 20px', cursor:'pointer' }}>
        <span style={{ fontSize:48 }}>📤</span>
        <span style={{ fontSize:15, fontWeight:700, color:C.text }}>Upload PDF or photo of test</span>
        <span style={{ fontSize:12, color:C.muted }}>PDF · JPG · PNG — AI digitizes everything</span>
      </label>
    </div>
  )

  return null
}

function safeJSON(text) {
  try { return JSON.parse(text.replace(/```json|```/g,'').trim()) } catch {}
  try { const m = text.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]) } catch {}
  return null
}
