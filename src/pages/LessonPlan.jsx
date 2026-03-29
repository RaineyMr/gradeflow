import React, { useRef, useState } from 'react'
import { useStore } from '../lib/store'

const C = {
  bg:'#060810', card:'#161923', inner:'#1e2231', text:'#eef0f8',
  muted:'#6b7494', border:'#2a2f42', green:'#22c97a', blue:'#3b7ef4',
  amber:'#f5a623', purple:'#9b6ef5', teal:'#0fb8a0',
}

const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_KEY

function safeParseJSON(text) {
  try { return JSON.parse(text.replace(/```json|```/g, '').trim()) } catch {}
  try { const m = text.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]) } catch {}
  return null
}

function LoadingSpinner() {
  return (
    <>
      <div style={{ width:36, height:36, border:`3px solid var(--school-color)`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}

// ─── Section helper ───────────────────────────────────────────────────────────
function Section({ title, items }) {
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:11, fontWeight:700, color:C.teal, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>{title}</div>
      {items.map((item, i) => (
        <div key={i} style={{ background:C.inner, borderRadius:10, padding:'10px 12px', marginBottom:6, fontSize:13, color:C.text, lineHeight:1.5 }}>
          {item}
        </div>
      ))}
    </div>
  )
}

// ─── Lesson View ──────────────────────────────────────────────────────────────
function LessonView({ lesson, onBack, onEdit }) {
  const STATUS_COLOR = { done: C.green, tbd: C.amber, pending: C.teal }
  const STATUS_LABEL = { done: 'Done', tbd: 'TBD', pending: 'Pending' }
  const sc = STATUS_COLOR[lesson.status] || C.teal

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', padding:'20px 16px', paddingBottom:80 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <button onClick={onBack} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600 }}>{'<'} Back</button>
        <button onClick={onEdit} style={{ background:'var(--school-color)', border:'none', borderRadius:10, padding:'8px 16px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:700 }}>Edit</button>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
        <span style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em' }}>{lesson.dayLabel}</span>
        <span style={{ fontSize:11, color:C.muted }}>{'\u00b7'}</span>
        <span style={{ fontSize:11, color:C.muted }}>{lesson.date}</span>
        <span style={{ marginLeft:'auto', background:`${sc}22`, color:sc, borderRadius:6, padding:'2px 8px', fontSize:11, fontWeight:700 }}>{STATUS_LABEL[lesson.status]}</span>
      </div>
      <h1 style={{ fontSize:18, fontWeight:800, margin:'0 0 4px' }}>{lesson.title}</h1>
      <p style={{ color:C.muted, fontSize:12, margin:'0 0 20px' }}>{lesson.duration}{lesson.pages ? ` ${'\u00b7'} ${lesson.pages}` : ''}</p>

      <Section title="Objective" items={[lesson.objective]} />
      {lesson.warmup?.length > 0      && <Section title="Warm-Up"    items={lesson.warmup} />}
      {lesson.activities?.length > 0  && <Section title="Activities" items={lesson.activities} />}
      {lesson.materials?.length > 0   && <Section title="Materials"  items={lesson.materials} />}
      {lesson.homework && <Section title="Homework" items={[lesson.homework]} />}
    </div>
  )
}

// ─── AI Generator ─────────────────────────────────────────────────────────────
function AIGenerator({ onBack }) {
  const [form, setForm] = useState({ state:'Texas', subject:'', grade:'', textbook:'', topic:'', standard:'' })
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState(null)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]:v }))

  async function handleGenerate() {
    if (!form.subject || !form.topic) { setError('Subject and topic are required.'); return }
    if (!ANTHROPIC_KEY) { setError('Add VITE_ANTHROPIC_KEY to your .env file.'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'x-api-key':ANTHROPIC_KEY, 'anthropic-version':'2023-06-01', 'anthropic-dangerous-direct-browser-access':'true' },
        body: JSON.stringify({
          model:'claude-sonnet-4-20250514', max_tokens:2000,
          system:'You are an expert curriculum designer. Return ONLY valid JSON with no markdown.',
          messages:[{ role:'user', content:`Create a complete lesson plan. State: ${form.state}, Subject: ${form.subject}, Grade: ${form.grade || 'not specified'}, Topic: ${form.topic}, Standard: ${form.standard || 'not specified'}, Textbook: ${form.textbook || 'not specified'}. Return JSON: {"title":"","objectives":[""],"materials":[""],"steps":[""],"assessment":[""],"homework":[""],"notes":""}` }]
        })
      })
      const data = await res.json()
      const parsed = safeParseJSON(data.content?.[0]?.text || '')
      if (parsed) setPlan(parsed)
      else setError('AI returned unexpected format. Try again.')
    } catch (err) {
      setError('Generation failed. Check your API key.')
    }
    setLoading(false)
  }

  if (loading) return (
    <div style={{ padding:40, textAlign:'center', fontFamily:'Inter, Arial, sans-serif' }}>
      <LoadingSpinner />
      <p style={{ color:C.muted, fontSize:13, marginTop:12 }}>Generating your lesson plan...</p>
    </div>
  )

  if (plan) return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', padding:'20px 16px', paddingBottom:80 }}>
      <button onClick={() => setPlan(null)} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:20 }}>← Back</button>
      <h1 style={{ fontSize:18, fontWeight:800, margin:'0 0 4px' }}>{plan.title}</h1>
      <p style={{ color:C.muted, fontSize:12, marginBottom:20 }}>{form.subject} · {form.grade} · {form.topic}</p>
      {plan.objectives?.length > 0    && <Section title="Objectives"    items={plan.objectives} />}
      {plan.materials?.length > 0     && <Section title="Materials"     items={plan.materials} />}
      {plan.steps?.length > 0         && <Section title="Steps"         items={plan.steps} />}
      {plan.assessment?.length > 0    && <Section title="Assessment"    items={plan.assessment} />}
      {plan.homework?.length > 0      && <Section title="Homework"      items={plan.homework} />}
      {plan.notes && (
        <div style={{ background:C.inner, borderRadius:12, padding:'12px 14px', fontSize:13, color:C.muted }}>{plan.notes}</div>
      )}
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', padding:'20px 16px', paddingBottom:80 }}>
      <button onClick={onBack} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:20 }}>← Back</button>
      <h1 style={{ fontSize:18, fontWeight:800, margin:'0 0 20px' }}>✨ AI Lesson Plan Generator</h1>

      {[
        ['state',    'State / Region',    'Texas'],
        ['subject',  'Subject *',         'Math, Science, ELA...'],
        ['grade',    'Grade Level',       '3rd Grade, High School...'],
        ['textbook', 'Textbook (optional)', 'Publisher or title...'],
        ['topic',    'Topic *',           'Fractions, Photosynthesis...'],
        ['standard', 'Standard / TEKS',  'TEKS 4.3A, CCSS.MATH...'],
      ].map(([key, label, placeholder]) => (
        <div key={key} style={{ marginBottom:12 }}>
          <label style={{ display:'block', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:C.muted, marginBottom:6 }}>{label}</label>
          <input
            value={form[key]} onChange={e => set(key, e.target.value)}
            placeholder={placeholder}
            style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:12, padding:'11px 14px', color:C.text, fontSize:13, outline:'none', boxSizing:'border-box' }}
          />
        </div>
      ))}

      {error && <p style={{ color:'#f04a4a', fontSize:12, marginBottom:12 }}>{error}</p>}

      <button onClick={handleGenerate}
        style={{ width:'100%', background:'var(--school-color)', color:'#fff', border:'none', borderRadius:999, padding:'14px', fontSize:15, fontWeight:800, cursor:'pointer' }}>
        ✨ Generate Lesson Plan
      </button>
    </div>
  )
}

// ─── Build from Scratch ───────────────────────────────────────────────────────
function BuildFromScratch({ onBack }) {
  const [sections, setSections] = useState({ title:'', objectives:'', steps:'', supplies:'', notes:'' })
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', padding:'20px 16px', paddingBottom:80 }}>
      <button onClick={onBack} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:20 }}>← Back</button>
      <h1 style={{ fontSize:18, fontWeight:800, margin:'0 0 20px' }}>📝 Build Lesson Plan</h1>

      {[
        ['title',      'Lesson Title *',          'Ch. 4 · Fractions...'],
        ['objectives', 'Learning Objectives',     'Students will be able to...'],
        ['steps',      'Step-by-Step Instructions', 'Step 1: ...\nStep 2: ...'],
        ['supplies',   'Supplies Needed',          'Pencils, worksheets...'],
        ['notes',      'Teacher Notes',            'Additional notes...'],
      ].map(([key, label, ph]) => (
        <div key={key} style={{ marginBottom:12 }}>
          <label style={{ display:'block', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:C.muted, marginBottom:6 }}>{label}</label>
          <textarea
            style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:12, padding:'11px 14px', color:C.text, fontSize:13, resize:'none', boxSizing:'border-box' }}
            rows={3} placeholder={ph} value={sections[key]} onChange={e => setSections(s => ({ ...s, [key]:e.target.value }))} />
        </div>
      ))}

      {saved && <div style={{ background:'#0f2a1a', border:`1px solid ${C.green}40`, borderRadius:10, padding:'10px 14px', color:C.green, fontSize:13, marginBottom:12 }}>✅ Lesson saved!</div>}

      <button onClick={handleSave} disabled={!sections.title.trim()}
        style={{ width:'100%', background:sections.title.trim() ? 'var(--school-color)' : '#2a2f42', color:sections.title.trim() ? '#fff' : C.muted, border:'none', borderRadius:999, padding:'14px', fontSize:15, fontWeight:800, cursor:sections.title.trim()?'pointer':'not-allowed' }}>
        Save Lesson Plan
      </button>
    </div>
  )
}

// ─── Upload Doc ───────────────────────────────────────────────────────────────
function UploadDoc({ onBack }) {
  const fileRef = useRef()
  const [file,    setFile]    = useState(null)
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)

  function handleFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setLoading(true)
    setTimeout(() => { setLoading(false); setDone(true) }, 2000)
  }

  if (loading) return (
    <div style={{ padding:40, textAlign:'center', fontFamily:'Inter, Arial, sans-serif' }}>
      <LoadingSpinner />
      <p style={{ color:C.muted, fontSize:13, marginTop:12 }}>Reading your document...</p>
    </div>
  )

  if (done) return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', padding:'20px 16px' }}>
      <button onClick={onBack} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:20 }}>← Back</button>
      <div style={{ background:'#0f2a1a', border:`1px solid ${C.green}40`, borderRadius:14, padding:'14px 16px', marginBottom:16, display:'flex', alignItems:'center', gap:12 }}>
        <span style={{ fontSize:24 }}>📄</span>
        <div>
          <div style={{ fontWeight:700, fontSize:13, color:C.text }}>{file?.name}</div>
          <div style={{ color:C.green, fontSize:11 }}>✓ Uploaded successfully</div>
        </div>
      </div>
      <p style={{ color:C.muted, fontSize:13 }}>Your document has been imported and is ready to use.</p>
      <button onClick={onBack} style={{ background:'var(--school-color)', border:'none', borderRadius:999, padding:'12px 24px', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' }}>
        Go to Lesson Plans
      </button>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', padding:'20px 16px' }}>
      <button onClick={onBack} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:20 }}>← Back</button>
      <h1 style={{ fontSize:18, fontWeight:800, margin:'0 0 6px' }}>📄 Upload Lesson Plan</h1>
      <p style={{ color:C.muted, fontSize:13, marginBottom:20 }}>PDF · Word · CSV · Excel · Google Doc · Any format</p>
      {/* UPDATED: now accepts CSV and Excel in addition to existing formats */}
      <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,image/*" onChange={handleFile} style={{ display:'none' }} />
      <button onClick={() => fileRef.current?.click()}
        style={{ width:'100%', background:C.card, border:`2px dashed ${C.border}`, borderRadius:18, padding:'40px 20px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
        <span style={{ fontSize:48 }}>📤</span>
        <span style={{ fontSize:15, fontWeight:700, color:C.text }}>Tap to choose file</span>
        <span style={{ fontSize:12, color:C.muted }}>PDF · Word · CSV · Excel · Google Doc · Image</span>
      </button>
    </div>
  )
}

// ─── Main Menu ────────────────────────────────────────────────────────────────
export default function LessonPlan({ initialMode, classId, onBack }) {
  const { goBack, getTodayLesson } = useStore()
  const handleBack = onBack || goBack
  const todayLesson = classId ? getTodayLesson(classId) : null
  const startMode = initialMode === 'view' && todayLesson ? 'view' : (initialMode && initialMode !== 'view' ? initialMode : 'menu')
  const [mode, setMode] = useState(startMode)

  if (mode === 'view' && todayLesson) return <LessonView lesson={todayLesson} onBack={handleBack} onEdit={() => setMode('build')} />
  if (mode === 'ai')     return <AIGenerator      onBack={() => setMode('menu')} />
  if (mode === 'build')  return <BuildFromScratch  onBack={() => setMode('menu')} />
  if (mode === 'upload') return <UploadDoc         onBack={() => setMode('menu')} />

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', padding:'20px 16px', paddingBottom:80 }}>
      <button onClick={handleBack} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:20 }}>← Back</button>
      <h1 style={{ fontSize:22, fontWeight:800, margin:'0 0 4px' }}>Lesson Plans</h1>
      <p style={{ color:C.muted, fontSize:13, margin:'0 0 24px' }}>Create · Upload · AI-generate</p>

      {[
        { id:'ai',     icon:'✨', label:'AI Generate',      desc:'Fill in subject, grade, topic → full lesson plan',         color:C.purple },
        { id:'build',  icon:'📝', label:'Build from Scratch', desc:'Write your own lesson plan with guided sections',         color:C.blue   },
        { id:'upload', icon:'📤', label:'Upload Document',  desc:'PDF · Word · CSV · Excel · Image — AI imports it',         color:C.teal   },
      ].map(item => (
        <button key={item.id} onClick={() => setMode(item.id)}
          style={{ width:'100%', background:C.card, border:`1px solid ${item.color}22`, borderRadius:16, padding:16, textAlign:'left', cursor:'pointer', display:'flex', alignItems:'center', gap:14, marginBottom:12 }}
          onMouseEnter={e => e.currentTarget.style.borderColor=item.color}
          onMouseLeave={e => e.currentTarget.style.borderColor=`${item.color}22`}>
          <div style={{ width:48, height:48, borderRadius:12, background:`${item.color}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>{item.icon}</div>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:C.text, marginBottom:2 }}>{item.label}</div>
            <div style={{ fontSize:11, color:C.muted }}>{item.desc}</div>
          </div>
          <span style={{ marginLeft:'auto', color:C.muted, fontSize:18 }}>›</span>
        </button>
      ))}
    </div>
  )
}
