import React, { useState, useRef, useEffect } from 'react'
import { useStore } from '../lib/store'

const C = {
  bg:'#060810', card:'#0d1117', inner:'#161b22', raised:'#1c2128',
  text:'#e6edf3', muted:'#7d8590', border:'#30363d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a',
  amber:'#f5a623', purple:'#9b6ef5', teal:'#0fb8a0',
}

const DEMO_TEACHER = {
  name:   'Ms. Johnson',
  email:  'ms.johnson@kipp.edu',
  school: 'KIPP Houston Elementary',
  phone:  '+17135550101',
}

const DEMO_STUDENTS = [
  {
    id: 1, name: 'Marcus Thompson',
    parentEmail: 'ms.thompson@gmail.com',
    parentPhone: '+17135550201',
    parentName:  'Ms. Thompson',
    language:    'en',
    classes: [
      { subject:'Math',    grade:87, letter:'B' },
      { subject:'Reading', grade:95, letter:'A' },
      { subject:'Science', grade:61, letter:'D' },
      { subject:'Writing', grade:88, letter:'B' },
    ],
  },
  {
    id: 2, name: 'Aaliyah Brooks',
    parentEmail: 'dbrooks@gmail.com',
    parentPhone: '+17135550202',
    parentName:  'Mr. Brooks',
    language:    'en',
    classes: [
      { subject:'Math',    grade:92, letter:'A' },
      { subject:'Reading', grade:78, letter:'C' },
    ],
  },
  {
    id: 3, name: 'Liam Martinez',
    parentEmail: 'cmartinez@gmail.com',
    parentPhone: '+17135550203',
    parentName:  'Sra. Martinez',
    language:    'es',
    classes: [
      { subject:'Science', grade:61, letter:'D' },
    ],
  },
]

const AUTO_DRAFTS = [
  {
    id: 1, studentId: 1, studentName: 'Marcus Thompson',
    subject: 'Science', grade: 61, letter: 'D',
    trigger: 'D/F Overall Grade', channel: 'email', language: 'en',
    status: 'pending',
    draft: "Dear Ms. Thompson,\n\nI'm reaching out regarding Marcus's current Science grade of 61%. I'd love to connect this week to discuss strategies to help him improve before the end of the semester.\n\nPlease feel free to reply to this email.\n\nWarm regards,\nMs. Johnson\nKIPP Houston Elementary",
    smsDraft: 'Hi Ms. Thompson, Marcus has a 61% in Science. Can we connect this week? -Ms. Johnson',
  },
  {
    id: 2, studentId: 3, studentName: 'Liam Martinez',
    subject: 'Science', grade: 61, letter: 'D',
    trigger: 'D/F Overall Grade', channel: 'email', language: 'es',
    status: 'pending',
    draft: "Estimada Sra. Martinez,\n\nMe pongo en contacto sobre la calificacion actual de Liam en Ciencias, que es 61%. Me gustaria comunicarme esta semana para hablar sobre estrategias de apoyo.\n\nAtentamente,\nMs. Johnson\nKIPP Houston Elementary",
    smsDraft: 'Hola Sra. Martinez, Liam tiene 61% en Ciencias. Podemos hablar? -Ms. Johnson',
  },
  {
    id: 3, studentId: 1, studentName: 'Marcus Thompson',
    subject: 'Math', grade: 72, letter: 'C',
    trigger: 'Assignment Score: Ch.4 Worksheet', channel: 'email', language: 'en',
    status: 'sent',
    draft: "Dear Ms. Thompson,\n\nJust a quick update — Marcus scored 72% on the Ch.4 Math Worksheet. He's making progress! I've included some practice problems to help prepare for the upcoming unit test.",
    smsDraft: 'Hi Ms. Thompson, Marcus scored 72% on Ch.4 Math Worksheet. Practice resources sent. -Ms. Johnson',
  },
]

const TEMPLATES = [
  {
    id: 'intro', icon: '👋', label: 'Introductory',
    subject: (s) => 'Welcome to Class!',
    body: (t, st) =>
`Dear ${st.parentName || 'Parent/Guardian'},

I hope this message finds you well! My name is ${t.name}, and I am so excited to be ${st.name}'s teacher this year.

In our class, we will build strong foundations across all subjects. My goal is to create a supportive environment where every student can thrive. I will send regular updates about ${st.name}'s progress.

If you ever have questions, please reach out at ${t.email}. I look forward to partnering with you this year!

Best regards,
${t.name}
${t.school}`,
  },
  {
    id: 'meeting', icon: '📅', label: 'Meeting Request',
    subject: (s) => `Meeting Request — ${s}'s Progress`,
    body: (t, st) =>
`Dear ${st.parentName || 'Parent/Guardian'},

I hope you are doing well! I am reaching out to schedule a brief meeting to discuss ${st.name}'s progress.

I would love to share some observations and work together to support ${st.name}'s success. I am available:
- Monday or Wednesday after 3:00 PM
- Friday mornings before 9:00 AM
- Any time by appointment

We can meet in person, by phone, or by video — whatever works best for you. Please reply to this email or reach me at ${t.email}.

Thank you for your partnership!

Best regards,
${t.name}
${t.school}`,
  },
  {
    id: 'praise', icon: '🌟', label: 'Praise',
    subject: (s) => `Celebrating ${s}'s Success!`,
    body: (t, st) => {
      const best = st.classes?.reduce((a, b) => a.grade > b.grade ? a : b) || { subject:'class', grade:95 }
      return `Dear ${st.parentName || 'Parent/Guardian'},

I am thrilled to share some wonderful news about ${st.name}! They have been demonstrating exceptional effort and dedication in ${best.subject}, currently earning a ${best.grade}%.

${st.name}'s positive attitude and hard work are truly commendable. They are a joy to have in class, and I am so proud of their progress!

Thank you for your continued support at home — it makes a real difference.

Best regards,
${t.name}
${t.school}`
    },
  },
  {
    id: 'progress', icon: '📊', label: 'Progress Update',
    subject: (s) => `Progress Update — ${s}`,
    body: (t, st) => {
      const strengths = (st.classes || []).filter(c => c.grade >= 80)
      const growth    = (st.classes || []).filter(c => c.grade < 80)
      const gpa       = st.classes?.length
        ? (st.classes.reduce((a, c) => a + c.grade, 0) / st.classes.length).toFixed(1)
        : 'N/A'
      return `Dear ${st.parentName || 'Parent/Guardian'},

I wanted to update you on ${st.name}'s progress this semester. Current GPA: ${gpa}%

Strengths:
${strengths.length ? strengths.map(c => `- ${c.subject}: ${c.grade}% (${c.letter})`).join('\n') : '- Working hard across all subjects'}

Areas for Growth:
${growth.length ? growth.map(c => `- ${c.subject}: ${c.grade}% — additional practice recommended`).join('\n') : '- No significant concerns'}

Next Steps:
- Targeted support will continue in class
- I recommend 20-30 min of reading each evening
- Please don't hesitate to reach out with questions

Best regards,
${t.name}
${t.school}`
    },
  },
]

const LANGUAGES = [
  { code:'en', flag:'🇺🇸', label:'English'    },
  { code:'es', flag:'🇲🇽', label:'Spanish'    },
  { code:'fr', flag:'🇫🇷', label:'French'     },
  { code:'pt', flag:'🇧🇷', label:'Portuguese' },
  { code:'zh', flag:'🇨🇳', label:'Chinese'    },
  { code:'ar', flag:'🇸🇦', label:'Arabic'     },
]

function gradeColor(g) {
  return g >= 90 ? C.green : g >= 80 ? C.blue : g >= 70 ? C.amber : C.red
}

async function translateText(text, lang) {
  if (lang === 'en' || !lang) return text
  const key = import.meta.env.VITE_ANTHROPIC_KEY
  if (!key) return text
  const names = { es:'Spanish', fr:'French', pt:'Portuguese', zh:'Chinese', ar:'Arabic' }
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'x-api-key':key, 'anthropic-version':'2023-06-01', 'anthropic-dangerous-direct-browser-access':'true' },
      body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:600,
        messages:[{ role:'user', content:`Translate this school communication to ${names[lang]||lang}. Return only the translated text:\n\n${text}` }] }),
    })
    const d = await r.json()
    return d.content?.[0]?.text || text
  } catch { return text }
}

async function makeSMSDraft(body, teacherName) {
  const key = import.meta.env.VITE_ANTHROPIC_KEY
  if (!key) return body.slice(0, 160)
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'x-api-key':key, 'anthropic-version':'2023-06-01', 'anthropic-dangerous-direct-browser-access':'true' },
      body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:80,
        system:'Condense a school email into an SMS under 160 characters. Return only the SMS text.',
        messages:[{ role:'user', content:`From ${teacherName}:\n${body}` }] }),
    })
    const d = await r.json()
    return (d.content?.[0]?.text || body).slice(0, 160)
  } catch { return body.slice(0, 160) }
}

// ─── Sheet shell ───────────────────────────────────────────────────────────────
function SheetShell({ onClose, children }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(0,0,0,0.72)', backdropFilter:'blur(6px)', display:'flex', alignItems:'flex-end' }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:C.card, borderRadius:'22px 22px 0 0', width:'100%', maxHeight:'90vh', overflowY:'auto', padding:'18px 16px max(28px,env(safe-area-inset-bottom))' }}>
        <div style={{ width:36, height:4, background:C.border, borderRadius:2, margin:'0 auto 16px' }}/>
        {children}
      </div>
    </div>
  )
}

// ─── Compose Sheet ─────────────────────────────────────────────────────────────
function ComposeSheet({ onClose, onSent, preStudent }) {
  const [step,        setStep]        = useState(preStudent ? 'template' : 'student')
  const [student,     setStudent]     = useState(preStudent || null)
  const [template,    setTemplate]    = useState(null)
  const [channel,     setChannel]     = useState('email')
  const [language,    setLanguage]    = useState(preStudent?.language || 'en')
  const [subject,     setSubject]     = useState('')
  const [body,        setBody]        = useState('')
  const [smsDraft,    setSmsDraft]    = useState('')
  const [translating, setTranslating] = useState(false)
  const [sending,     setSending]     = useState(false)
  const [sent,        setSent]        = useState(false)
  const [error,       setError]       = useState('')

  function applyTemplate(tmpl) {
    if (!student) return
    setTemplate(tmpl)
    setSubject(tmpl.subject(student.name))
    setBody(tmpl.body(DEMO_TEACHER, student))
    setStep('draft')
  }

  async function handleTranslate() {
    if (language === 'en') return
    setTranslating(true)
    const [b, s] = await Promise.all([
      translateText(body, language),
      translateText(subject, language),
    ])
    setBody(b); setSubject(s)
    setTranslating(false)
  }

  async function handleChannelChange(ch) {
    setChannel(ch)
    if ((ch === 'sms' || ch === 'both') && !smsDraft) {
      const sms = await makeSMSDraft(body || 'Update about ' + (student?.name || 'student'), DEMO_TEACHER.name)
      setSmsDraft(sms)
    }
  }

  async function handleSend() {
    setSending(true); setError('')
    try {
      let fb = body, fs = subject
      if (language !== 'en') {
        ;[fb, fs] = await Promise.all([translateText(body, language), translateText(subject, language)])
      }

      if (channel === 'email' || channel === 'both') {
        const r = await fetch('/api/send-parent-email', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ to:student.parentEmail, subject:fs, body:fb,
            teacherName:DEMO_TEACHER.name, teacherEmail:DEMO_TEACHER.email,
            studentName:student.name, schoolName:DEMO_TEACHER.school }),
        })
        const res = await r.json()
        if (!res.success) throw new Error(res.error || 'Email send failed')
      }

      if (channel === 'sms' || channel === 'both') {
        const smsText = language !== 'en' ? await translateText(smsDraft || fb.slice(0,160), language) : (smsDraft || fb.slice(0,160))
        const r = await fetch('/api/send-parent-sms', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ to:student.parentPhone, message:smsText }),
        })
        const res = await r.json()
        if (!res.success && !res.stub) throw new Error(res.error || 'SMS send failed')
      }

      setSent(true)
      onSent?.({ studentName:student.name, channel })
      setTimeout(onClose, 1500)
    } catch (err) {
      setError(err.message || 'Send failed. Please try again.')
    } finally { setSending(false) }
  }

  if (sent) return (
    <SheetShell onClose={onClose}>
      <div style={{ textAlign:'center', padding:'40px 0' }}>
        <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
        <div style={{ fontSize:16, fontWeight:800, color:C.text }}>
          {channel==='sms'?'Text sent!':channel==='both'?'Email & Text sent!':'Email sent!'}
        </div>
        <div style={{ fontSize:12, color:C.muted, marginTop:6 }}>to {student?.parentName} re: {student?.name}</div>
      </div>
    </SheetShell>
  )

  return (
    <SheetShell onClose={onClose}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div style={{ fontSize:15, fontWeight:800, color:C.text }}>
          {step==='student'?'✉️ New Message':step==='template'?'📄 Choose Template':`To: ${student?.parentName}`}
        </div>
        <button onClick={onClose} style={{ background:C.inner, border:'none', borderRadius:8, padding:'5px 10px', color:C.muted, cursor:'pointer', fontSize:12 }}>✕</button>
      </div>

      {/* Pick student */}
      {step === 'student' && DEMO_STUDENTS.map(st => (
        <button key={st.id} onClick={() => { setStudent(st); setLanguage(st.language||'en'); setStep('template') }}
          style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 14px', marginBottom:8, display:'flex', alignItems:'center', gap:12, cursor:'pointer', textAlign:'left' }}>
          <div style={{ width:36, height:36, borderRadius:'50%', background:`${C.blue}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🎓</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{st.name}</div>
            <div style={{ fontSize:10, color:C.muted }}>{st.parentName} · {st.parentEmail}</div>
          </div>
          <div style={{ display:'flex', gap:4 }}>
            {st.classes?.filter(c=>c.grade<80).map(c=>(
              <span key={c.subject} style={{ fontSize:9, fontWeight:700, color:gradeColor(c.grade), background:`${gradeColor(c.grade)}18`, padding:'2px 5px', borderRadius:999 }}>
                {c.subject[0]} {c.grade}%
              </span>
            ))}
          </div>
        </button>
      ))}

      {/* Pick template */}
      {step === 'template' && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
            {TEMPLATES.map(tmpl => (
              <button key={tmpl.id} onClick={() => applyTemplate(tmpl)}
                style={{ background:C.inner, border:`1px solid ${C.border}`, borderRadius:12, padding:'14px 10px', cursor:'pointer', textAlign:'center' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=C.blue}
                onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                <div style={{ fontSize:24, marginBottom:6 }}>{tmpl.icon}</div>
                <div style={{ fontSize:11, fontWeight:700, color:C.text }}>{tmpl.label}</div>
              </button>
            ))}
          </div>
          <button onClick={()=>setStep('student')} style={{ background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:12 }}>&larr; Change student</button>
        </>
      )}

      {/* Draft + send */}
      {step === 'draft' && (
        <>
          {/* Student info */}
          <div style={{ background:C.inner, borderRadius:10, padding:'10px 12px', marginBottom:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:C.text }}>{student?.name}</div>
              <div style={{ fontSize:10, color:C.muted }}>{student?.parentEmail}</div>
            </div>
            <div style={{ display:'flex', gap:4 }}>
              {student?.classes?.map(c=>(
                <span key={c.subject} style={{ fontSize:9, fontWeight:700, color:gradeColor(c.grade), background:`${gradeColor(c.grade)}15`, padding:'2px 5px', borderRadius:999 }}>
                  {c.subject[0]} {c.grade}%
                </span>
              ))}
            </div>
          </div>

          {/* Template tabs */}
          <div style={{ display:'flex', gap:4, marginBottom:10, flexWrap:'wrap' }}>
            {TEMPLATES.map(tmpl=>(
              <button key={tmpl.id} onClick={()=>applyTemplate(tmpl)}
                style={{ padding:'4px 8px', borderRadius:999, border:'none', cursor:'pointer', fontSize:10, fontWeight:700,
                  background:template?.id===tmpl.id?`${C.blue}22`:C.inner, color:template?.id===tmpl.id?C.blue:C.muted,
                  outline:template?.id===tmpl.id?`1px solid ${C.blue}`:'none' }}>
                {tmpl.icon} {tmpl.label}
              </button>
            ))}
          </div>

          {/* Channel */}
          <div style={{ display:'flex', gap:6, marginBottom:10 }}>
            {[['email','📧 Email'],['sms','💬 SMS'],['both','✉️ Both']].map(([id,lbl])=>(
              <button key={id} onClick={()=>handleChannelChange(id)}
                style={{ flex:1, padding:'7px 4px', borderRadius:9, border:`1px solid ${channel===id?C.teal:C.border}`, cursor:'pointer', fontSize:10, fontWeight:700,
                  background:channel===id?`${C.teal}18`:C.inner, color:channel===id?C.teal:C.muted }}>
                {lbl}
              </button>
            ))}
          </div>

          {/* Language */}
          <div style={{ display:'flex', gap:4, marginBottom:10, flexWrap:'wrap', alignItems:'center' }}>
            <span style={{ fontSize:10, color:C.muted, fontWeight:600, flexShrink:0 }}>Lang:</span>
            {LANGUAGES.map(l=>(
              <button key={l.code} onClick={()=>setLanguage(l.code)}
                style={{ padding:'3px 7px', borderRadius:999, border:'none', cursor:'pointer', fontSize:10, fontWeight:700,
                  background:language===l.code?`${C.purple}22`:C.inner, color:language===l.code?C.purple:C.muted,
                  outline:language===l.code?`1px solid ${C.purple}`:'none' }}>
                {l.flag} {l.label}
              </button>
            ))}
            {language !== 'en' && (
              <button onClick={handleTranslate} disabled={translating}
                style={{ padding:'3px 10px', borderRadius:999, border:`1px solid ${C.purple}40`, background:`${C.purple}15`, color:C.purple, fontSize:10, fontWeight:700, cursor:translating?'wait':'pointer' }}>
                {translating?'Translating...':'✨ Translate'}
              </button>
            )}
          </div>

          {/* Subject */}
          <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Subject..."
            style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:10, padding:'9px 13px', color:C.text, fontSize:13, outline:'none', boxSizing:'border-box', marginBottom:8 }}/>

          {/* Body */}
          <textarea value={body} onChange={e=>setBody(e.target.value)} rows={7}
            style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 13px', color:C.text, fontSize:12, lineHeight:1.65, resize:'vertical', outline:'none', boxSizing:'border-box', fontFamily:'inherit', marginBottom:8 }}
            placeholder="Message body..."/>

          {/* SMS preview */}
          {(channel==='sms'||channel==='both') && (
            <div style={{ background:`${C.teal}10`, border:`1px solid ${C.teal}30`, borderRadius:10, padding:'10px 12px', marginBottom:10 }}>
              <div style={{ fontSize:10, fontWeight:700, color:C.teal, marginBottom:4 }}>💬 SMS ({smsDraft.length}/160 chars)</div>
              <textarea value={smsDraft} onChange={e=>setSmsDraft(e.target.value.slice(0,160))} rows={2}
                style={{ width:'100%', background:'transparent', border:'none', color:C.text, fontSize:12, resize:'none', outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}
                placeholder="Auto-generated SMS..."/>
            </div>
          )}

          {error && (
            <div style={{ background:`${C.red}15`, border:`1px solid ${C.red}30`, borderRadius:9, padding:'8px 12px', marginBottom:10, fontSize:12, color:C.red }}>{error}</div>
          )}

          <button onClick={handleSend} disabled={sending||!body.trim()}
            style={{ width:'100%', background:sending||!body.trim()?C.inner:'var(--school-color,#BA0C2F)',
              color:sending||!body.trim()?C.muted:'#fff', border:'none', borderRadius:999, padding:'13px', fontSize:14, fontWeight:800, cursor:sending||!body.trim()?'not-allowed':'pointer', marginBottom:8 }}>
            {sending?'Sending...':channel==='email'?'📧 Send Email':channel==='sms'?'💬 Send Text':'✉️ Send Email + Text'}
          </button>

          <button onClick={()=>setStep('template')} style={{ width:'100%', background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:12, padding:'6px 0' }}>
            &larr; Change template
          </button>
        </>
      )}
    </SheetShell>
  )
}

// ─── Auto Settings Panel ───────────────────────────────────────────────────────
function AutoSettingsPanel({ onClose }) {
  const [s, setS] = useState({
    missingAssignment:false, anyGradePosted:false,
    dfOnAssignment:true, dfOverallGrade:true, letterGradeChange:true,
    channel:'email', language:'en',
  })

  const TRIGGERS = [
    { key:'dfOnAssignment',    icon:'📉', label:'D or F on assignment',    desc:'Auto-notify when a student scores below 60% on any assignment' },
    { key:'dfOverallGrade',    icon:'⚠️', label:'D or F overall grade',    desc:"Notify when a student's class grade drops to D or F" },
    { key:'letterGradeChange', icon:'🔄', label:'Letter grade changes',    desc:'Notify when grade changes A→B, B→C etc. (positive or negative)' },
    { key:'anyGradePosted',    icon:'📝', label:'Any grade posted',        desc:'Notify parent every time any grade is entered' },
    { key:'missingAssignment', icon:'📋', label:'Missing assignment',      desc:'Notify when an assignment is missing or overdue' },
  ]

  return (
    <SheetShell onClose={onClose}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div style={{ fontSize:15, fontWeight:800, color:C.text }}>⚙️ Auto-Send Settings</div>
        <button onClick={onClose} style={{ background:C.inner, border:'none', borderRadius:8, padding:'5px 10px', color:C.muted, cursor:'pointer', fontSize:12 }}>✕</button>
      </div>
      <div style={{ fontSize:12, color:C.muted, marginBottom:14, lineHeight:1.5 }}>
        GradeFlow will automatically draft and send parent notifications when these conditions are met — no teacher action needed.
      </div>

      {TRIGGERS.map(t=>(
        <div key={t.key} style={{ display:'flex', alignItems:'flex-start', gap:12, background:C.inner, borderRadius:12, padding:'12px 14px', marginBottom:8 }}>
          <span style={{ fontSize:20, flexShrink:0 }}>{t.icon}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:2 }}>{t.label}</div>
            <div style={{ fontSize:11, color:C.muted, lineHeight:1.4 }}>{t.desc}</div>
          </div>
          <div onClick={()=>setS(prev=>({...prev,[t.key]:!prev[t.key]}))}
            style={{ width:40, height:22, borderRadius:11, background:s[t.key]?C.green:C.border, cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0, marginTop:2 }}>
            <div style={{ width:16, height:16, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left:s[t.key]?21:3, transition:'left 0.2s' }}/>
          </div>
        </div>
      ))}

      <div style={{ marginTop:14, marginBottom:10 }}>
        <div style={{ fontSize:11, color:C.muted, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Default Channel</div>
        <div style={{ display:'flex', gap:6 }}>
          {[['email','📧 Email'],['sms','💬 SMS'],['both','✉️ Both']].map(([id,lbl])=>(
            <button key={id} onClick={()=>setS(prev=>({...prev,channel:id}))}
              style={{ flex:1, padding:'8px 4px', borderRadius:9, border:`1px solid ${s.channel===id?C.teal:C.border}`, cursor:'pointer', fontSize:11, fontWeight:700,
                background:s.channel===id?`${C.teal}18`:C.inner, color:s.channel===id?C.teal:C.muted }}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:11, color:C.muted, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Default Language</div>
        <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
          {LANGUAGES.map(l=>(
            <button key={l.code} onClick={()=>setS(prev=>({...prev,language:l.code}))}
              style={{ padding:'5px 9px', borderRadius:999, border:'none', cursor:'pointer', fontSize:10, fontWeight:700,
                background:s.language===l.code?`${C.purple}22`:C.inner, color:s.language===l.code?C.purple:C.muted,
                outline:s.language===l.code?`1px solid ${C.purple}`:'none' }}>
              {l.flag} {l.label}
            </button>
          ))}
        </div>
      </div>

      <button onClick={onClose}
        style={{ width:'100%', background:'var(--school-color,#BA0C2F)', color:'#fff', border:'none', borderRadius:999, padding:'13px', fontSize:14, fontWeight:800, cursor:'pointer' }}>
        Save Settings
      </button>
    </SheetShell>
  )
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────
export default function ParentMessages({ onBack, viewerRole='teacher' }) {
  const { goBack } = useStore()
  const handleBack = onBack || goBack

  const [drafts,     setDrafts]     = useState(AUTO_DRAFTS)
  const [tab,        setTab]        = useState('pending')
  const [composing,  setComposing]  = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preStudent, setPreStudent] = useState(null)
  const [toast,      setToast]      = useState(null)

  const pending = drafts.filter(d=>d.status==='pending')
  const sent    = drafts.filter(d=>d.status==='sent')

  function handleSent({ studentName, channel }) {
    setDrafts(prev=>prev.map(d=>d.studentName===studentName?{...d,status:'sent'}:d))
    setToast(`Sent to ${studentName}'s parent via ${channel}`)
    setTimeout(()=>setToast(null), 3000)
  }

  function quickSend(draft) {
    const st = DEMO_STUDENTS.find(s=>s.id===draft.studentId)
    setPreStudent(st)
    setComposing(true)
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", paddingBottom:80 }}>

      {/* Header */}
      <div style={{ background:'var(--school-color,#BA0C2F)', padding:'16px 16px 20px', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button onClick={handleBack} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}>
              &larr; Back
            </button>
            <h1 style={{ fontSize:18, fontWeight:800, color:'#fff', margin:0 }}>📩 Parent Messages</h1>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={()=>setShowSettings(true)} title="Auto-send settings"
              style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 11px', color:'#fff', cursor:'pointer', fontSize:14 }}>
              ⚙️
            </button>
            <button onClick={()=>{setPreStudent(null);setComposing(true)}}
              style={{ background:'rgba(255,255,255,0.9)', border:'none', borderRadius:10, padding:'7px 14px', color:'var(--school-color,#BA0C2F)', cursor:'pointer', fontSize:12, fontWeight:800 }}>
              + New
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ margin:'12px 16px 0', background:`${C.green}18`, border:`1px solid ${C.green}40`, borderRadius:12, padding:'10px 14px', fontSize:12, color:C.green, fontWeight:600 }}>
          ✅ {toast}
        </div>
      )}

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, padding:'12px 16px' }}>
        {[{label:'Pending',val:pending.length,color:C.amber},{label:'Sent',val:sent.length,color:C.green},{label:'Students',val:DEMO_STUDENTS.length,color:C.blue}].map(stat=>(
          <div key={stat.label} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'10px', textAlign:'center' }}>
            <div style={{ fontSize:20, fontWeight:900, color:stat.color }}>{stat.val}</div>
            <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', margin:'0 16px 12px', background:C.inner, borderRadius:12, padding:3 }}>
        {[['pending','Pending'],['sent','Sent']].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{ flex:1, padding:'8px', borderRadius:9, border:'none', cursor:'pointer', fontSize:12, fontWeight:700,
              background:tab===id?C.card:'transparent', color:tab===id?C.text:C.muted }}>
            {lbl} ({id==='pending'?pending.length:sent.length})
          </button>
        ))}
      </div>

      {/* Drafts */}
      <div style={{ padding:'0 16px' }}>
        {(tab==='pending'?pending:sent).map(draft=>{
          const st   = DEMO_STUDENTS.find(s=>s.id===draft.studentId)
          const lang = LANGUAGES.find(l=>l.code===draft.language)
          return (
            <div key={draft.id} style={{ background:C.card, border:`1px solid ${tab==='pending'?C.amber+'40':C.border}`, borderRadius:16, padding:'14px 16px', marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:800, color:C.text }}>{draft.studentName}</div>
                  <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{draft.trigger} &middot; {draft.subject} &middot; {lang?.flag} {lang?.label}</div>
                </div>
                <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                  <span style={{ fontSize:11, fontWeight:700, color:gradeColor(draft.grade), background:`${gradeColor(draft.grade)}18`, padding:'2px 8px', borderRadius:999 }}>
                    {draft.letter} {draft.grade}%
                  </span>
                  {draft.status==='sent' && <span style={{ fontSize:10, fontWeight:700, color:C.green, background:`${C.green}18`, padding:'2px 8px', borderRadius:999 }}>✓ Sent</span>}
                </div>
              </div>

              {/* Grade pills */}
              {st?.classes && (
                <div style={{ display:'flex', gap:4, marginBottom:8, flexWrap:'wrap' }}>
                  {st.classes.map(cls=>(
                    <span key={cls.subject} style={{ fontSize:9, fontWeight:700, color:gradeColor(cls.grade), background:`${gradeColor(cls.grade)}12`, padding:'2px 6px', borderRadius:999, border:`1px solid ${gradeColor(cls.grade)}25` }}>
                      {cls.subject} {cls.grade}%
                    </span>
                  ))}
                </div>
              )}

              {/* Draft preview */}
              <div style={{ background:C.inner, borderRadius:10, padding:'10px 12px', marginBottom: tab==='pending'?10:0 }}>
                <div style={{ fontSize:10, color:C.muted, marginBottom:4, fontWeight:600 }}>
                  {draft.channel==='sms'?'💬 SMS':'📧 Email'} &middot; AI Draft
                </div>
                <div style={{ fontSize:12, color:C.text, lineHeight:1.55 }}>
                  {draft.draft.slice(0,140)}{draft.draft.length>140?'...':''}
                </div>
              </div>

              {tab==='pending' && (
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={()=>quickSend(draft)}
                    style={{ flex:2, background:'var(--school-color,#BA0C2F)', color:'#fff', border:'none', borderRadius:10, padding:'9px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                    Review &amp; Send
                  </button>
                  <button onClick={()=>setDrafts(prev=>prev.map(d=>d.id===draft.id?{...d,status:'sent'}:d))}
                    style={{ flex:1, background:`${C.green}18`, color:C.green, border:`1px solid ${C.green}40`, borderRadius:10, padding:'9px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                    Quick &#9889;
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {(tab==='pending'?pending:sent).length===0 && (
          <div style={{ textAlign:'center', padding:'40px 0', color:C.muted }}>
            <div style={{ fontSize:32, marginBottom:8 }}>{tab==='pending'?'✅':'📭'}</div>
            <div style={{ fontSize:13 }}>{tab==='pending'?'No pending messages':'No sent messages yet'}</div>
          </div>
        )}
      </div>

      {composing && <ComposeSheet onClose={()=>{setComposing(false);setPreStudent(null)}} onSent={handleSent} preStudent={preStudent}/>}
      {showSettings && <AutoSettingsPanel onClose={()=>setShowSettings(false)}/>}
    </div>
  )
}
