import React, { useState } from 'react'
import { GradeBar } from '../components/ui'
import BottomNav from '../components/ui/BottomNav'

const T = {
  primary: '#461D7C', secondary: '#FDD023', bg: '#060810', card: '#161923',
  inner: '#1e2231', text: '#eef0f8', muted: '#6b7494', border: '#2a2f42',
  green: '#22c97a', blue: '#3b7ef4', red: '#f04a4a', amber: '#f5a623',
  purple: '#9b6ef5', header: 'linear-gradient(135deg,#461D7C,#2d1254)',
}

const SCHOOL = {
  name: 'Lamar High School', district: 'Houston ISD',
  totalStudents: 1247, totalTeachers: 62, schoolGPA: 84.6,
  teachers: [
    { id:1, name:'Ms. Johnson',  subject:'Math',    classes:4, avgGPA:83.2, atRisk:11, trend:'down',   status:'active'  },
    { id:2, name:'Mr. Williams', subject:'Science',  classes:3, avgGPA:88.1, atRisk:5,  trend:'up',     status:'active'  },
    { id:3, name:'Ms. Davis',    subject:'Reading',  classes:4, avgGPA:91.4, atRisk:2,  trend:'up',     status:'active'  },
    { id:4, name:'Mr. Garcia',   subject:'Writing',  classes:3, avgGPA:79.3, atRisk:14, trend:'down',   status:'pending' },
    { id:5, name:'Ms. Chen',     subject:'History',  classes:4, avgGPA:86.7, atRisk:7,  trend:'stable', status:'active'  },
  ],
  alerts: [
    { id:1, type:'grade',    msg:'3rd Period Math GPA dropped below 70%',        color:T.red,   teacher:'Ms. Johnson',  teacherId:1 },
    { id:2, type:'grade',    msg:'4th Period Writing needs intervention — 14 at-risk', color:T.amber, teacher:'Mr. Garcia', teacherId:4 },
    { id:3, type:'positive', msg:'Ms. Davis: Reading class achieved 91% average!', color:T.green, teacher:'Ms. Davis',  teacherId:3 },
  ],
  announcements: [
    { id:1, content:'Professional Development Day — March 15th. No classes.', time:'1 hour ago' },
    { id:2, content:'Spring semester grade reports due by March 20th.',        time:'Yesterday'  },
  ],
  subjectGPA: [
    { subject:'Math',    gpa:83.2, trend:'down',   color:T.blue   },
    { subject:'Science', gpa:88.1, trend:'up',     color:T.green  },
    { subject:'Reading', gpa:91.4, trend:'up',     color:T.purple },
    { subject:'Writing', gpa:79.3, trend:'down',   color:T.red    },
    { subject:'History', gpa:86.7, trend:'stable', color:T.amber  },
  ],
  gpaBuckets: [
    { label:'A (90–100)', min:90, max:100, pct:18, color:T.green,  students:['Aaliyah Brooks','Jordan Lee','Sofia R.'] },
    { label:'B–C (70–89)', min:70, max:89,  pct:61, color:T.blue,   students:['Marcus T.','Emma W.','James K.'] },
    { label:'At Risk (<70)', min:0,  max:69,  pct:21, color:T.red,    students:['Devon P.','Lila M.','Chris B.'] },
  ],
  contacts: {
    teachers: ['Ms. Johnson','Mr. Williams','Ms. Davis','Mr. Garcia','Ms. Chen'],
    parents:  ['Ms. Thompson','Mr. Brooks','Dr. Rodriguez','Ms. Kim'],
    students: ['Aaliyah Brooks','Marcus Thompson','Sofia Rodriguez','Devon P.'],
  },
  settings: {
    branding:    { logo:'🏫', colors:'Purple & Gold', font:'Inter' },
    gradingScale: { A:90, B:80, C:70, D:60 },
    weights:     { test:40, quiz:30, homework:20, participation:10 },
    verification: true,
  },
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function Widget({ onClick, children, style, title, titleRight }) {
  return (
    <div onClick={onClick}
      style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:'14px 16px', margin:'0 10px 12px', cursor:onClick?'pointer':'default', transition:'transform 0.15s', ...style }}
      onMouseEnter={e => onClick && (e.currentTarget.style.transform='scale(1.005)')}
      onMouseLeave={e => (e.currentTarget.style.transform='scale(1)')}>
      {(title||titleRight) && (
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          {title && <span style={{ fontSize:13, fontWeight:700, color:T.text }}>{title}</span>}
          {titleRight}
        </div>
      )}
      {children}
    </div>
  )
}

function Btn({ label, color, onClick }) {
  return (
    <button onClick={e => { e.stopPropagation(); onClick?.() }}
      style={{ background:`${color}22`, color, border:'none', borderRadius:999, padding:'6px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
      {label}
    </button>
  )
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick}
      style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:600, marginBottom:12 }}>
      ← Back
    </button>
  )
}

function PageShell({ children, title, onBack }) {
  return (
    <div style={{ minHeight:'100vh', background:T.bg, color:T.text, fontFamily:'Inter, Arial, sans-serif', paddingBottom:80 }}>
      <div style={{ background:T.header, padding:'20px 16px 24px' }}>
        <BackBtn onClick={onBack} />
        <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>{title}</h1>
      </div>
      <div style={{ padding:'16px 10px' }}>{children}</div>
    </div>
  )
}

// ── Compose Modal ──────────────────────────────────────────────────────────────
function ComposeModal({ title, to, onClose }) {
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)
  if (sent) return (
    <div style={{ position:'fixed', inset:0, zIndex:2000, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div style={{ background:T.card, borderRadius:'22px 22px 0 0', padding:32, width:'100%', maxWidth:480, textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
        <div style={{ color:T.green, fontWeight:700, marginBottom:16 }}>Sent to {to}!</div>
        <button onClick={onClose} style={{ background:`${T.green}22`, color:T.green, border:'none', borderRadius:999, padding:'10px 24px', fontSize:13, fontWeight:700, cursor:'pointer' }}>Done</button>
      </div>
    </div>
  )
  return (
    <div style={{ position:'fixed', inset:0, zIndex:2000, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:'22px 22px 0 0', padding:20, width:'100%', maxWidth:480 }}>
        <h3 style={{ margin:'0 0 14px', color:T.text, fontSize:15 }}>{title}</h3>
        {to && <div style={{ fontSize:12, color:T.muted, marginBottom:10 }}>To: {to}</div>}
        <textarea rows={4} value={text} onChange={e => setText(e.target.value)} placeholder="Write your message..."
          style={{ width:'100%', background:T.inner, border:`1px solid ${T.border}`, borderRadius:12, padding:'12px 14px', color:T.text, fontSize:13, resize:'none', boxSizing:'border-box', lineHeight:1.6 }} />
        <div style={{ display:'flex', gap:8, marginTop:10 }}>
          <button onClick={() => { if (text.trim()) setSent(true) }}
            style={{ flex:1, background:T.primary, color:'#fff', border:'none', borderRadius:999, padding:'12px', fontSize:14, fontWeight:700, cursor:'pointer' }}>Send</button>
          <button onClick={onClose}
            style={{ flex:1, background:T.inner, color:T.muted, border:'none', borderRadius:999, padding:'12px', fontSize:13, fontWeight:600, cursor:'pointer' }}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ── PAGES ──────────────────────────────────────────────────────────────────────

function TeachersPage({ onBack, initialTeacher }) {
  const [selected, setSelected] = useState(initialTeacher || null)
  const [compose, setCompose]   = useState(false)
  const [verifyId, setVerifyId] = useState(null)
  const [verified, setVerified] = useState({})

  return (
    <>
      <PageShell title={selected ? `👩‍🏫 ${selected.name}` : '👨‍🏫 All Teachers'} onBack={() => selected ? setSelected(null) : onBack()}>
        {selected ? (
          <>
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:20, marginBottom:12 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
                {[['Subject',selected.subject],['Classes',selected.classes],['Avg GPA',`${selected.avgGPA}%`],['At Risk',`${selected.atRisk} students`]].map(([k,v]) => (
                  <div key={k} style={{ background:T.inner, borderRadius:10, padding:'10px 12px' }}>
                    <div style={{ fontSize:10, color:T.muted, marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>{k}</div>
                    <div style={{ fontSize:14, fontWeight:700, color:T.text }}>{v}</div>
                  </div>
                ))}
              </div>
              <GradeBar score={selected.avgGPA} />
              <div style={{ marginTop:12, display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:11, padding:'3px 10px', borderRadius:999, fontWeight:700,
                  background: selected.status==='active' ? `${T.green}22` : `${T.amber}22`,
                  color:      selected.status==='active' ? T.green : T.amber }}>
                  {selected.status==='active' ? '✓ Active' : '⏳ Pending Verification'}
                </span>
                {selected.status==='pending' && !verified[selected.id] && (
                  <button onClick={() => setVerified(v => ({ ...v, [selected.id]:true }))}
                    style={{ background:`${T.green}22`, color:T.green, border:'none', borderRadius:999, padding:'3px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                    ✓ Verify
                  </button>
                )}
                {verified[selected.id] && <span style={{ fontSize:11, color:T.green }}>✓ Verified!</span>}
              </div>
              {selected.atRisk > 8 && (
                <div style={{ marginTop:12, background:'#1c1012', border:`1px solid ${T.red}30`, borderRadius:10, padding:'10px 12px', color:T.red, fontSize:12 }}>
                  ⚑ High at-risk count — consider intervention meeting
                </div>
              )}
            </div>
            <button onClick={() => setCompose(true)}
              style={{ width:'calc(100% - 20px)', margin:'0 10px', background:T.primary, color:'#fff', border:'none', borderRadius:14, padding:'12px', fontSize:14, fontWeight:700, cursor:'pointer' }}>
              💬 Send Message to {selected.name}
            </button>
          </>
        ) : (
          SCHOOL.teachers.map(t => (
            <div key={t.id} onClick={() => setSelected(t)}
              style={{ background:T.card, border:`1px solid ${t.atRisk>10?T.red:T.border}30`, borderRadius:16, padding:'14px 16px', marginBottom:10, cursor:'pointer', borderLeft:`3px solid ${t.trend==='up'?T.green:t.trend==='down'?T.red:T.muted}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:14, color:T.text }}>{t.name}</div>
                  <div style={{ fontSize:11, color:T.muted }}>{t.subject} · {t.classes} classes</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:20, fontWeight:800, color:t.avgGPA>=85?T.green:t.avgGPA>=75?T.amber:T.red }}>{t.avgGPA}%</div>
                  {t.atRisk > 0 && <div style={{ fontSize:9, color:T.red }}>⚑ {t.atRisk} at-risk</div>}
                </div>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <GradeBar score={t.avgGPA} />
                <span style={{ fontSize:10, marginLeft:10, padding:'2px 8px', borderRadius:999, fontWeight:700,
                  background: t.status==='active' ? `${T.green}22` : `${T.amber}22`,
                  color:      t.status==='active' ? T.green : T.amber }}>
                  {t.status==='active' ? 'Active ✓' : 'Pending'}
                </span>
              </div>
            </div>
          ))
        )}
      </PageShell>
      {compose && <ComposeModal title={`Message ${selected?.name}`} to={selected?.name} onClose={() => setCompose(false)} />}
    </>
  )
}

function ReportsPage({ onBack }) {
  const [activeReport, setActiveReport] = useState('gpaBySubject')

  const REPORT_TYPES = [
    { id:'gpaBySubject',   icon:'📊', label:'GPA by Subject',    color:T.blue   },
    { id:'progressTrends', icon:'📈', label:'Progress Trends',   color:T.green  },
    { id:'needsAttention', icon:'⚑',  label:'Needs Attention',   color:T.red    },
    { id:'commSummary',    icon:'💬', label:'Comm. Summary',     color:T.purple },
  ]

  return (
    <PageShell title="📊 School Reports" onBack={onBack}>
      {/* Report type grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
        {REPORT_TYPES.map(r => (
          <button key={r.id} onClick={() => setActiveReport(r.id)}
            style={{ background:activeReport===r.id?`${r.color}22`:T.card, border:`1.5px solid ${activeReport===r.id?r.color:T.border}`, borderRadius:16, padding:'14px 10px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:22 }}>{r.icon}</span>
            <span style={{ fontSize:11, fontWeight:700, color:activeReport===r.id?r.color:T.text, textAlign:'center' }}>{r.label}</span>
          </button>
        ))}
      </div>

      {/* Report content */}
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:20, marginBottom:16 }}>

        {activeReport === 'gpaBySubject' && (
          <>
            <div style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:16 }}>📊 GPA by Subject — {new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'})}</div>
            {SCHOOL.subjectGPA.map(s => (
              <div key={s.subject} style={{ marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:T.text }}>{s.subject}</span>
                  <span style={{ fontSize:13, fontWeight:800, color:s.gpa>=85?T.green:s.gpa>=75?T.amber:T.red }}>
                    {s.gpa}% {s.trend==='up'?'↑':s.trend==='down'?'↓':'→'}
                  </span>
                </div>
                <div style={{ background:T.inner, borderRadius:999, height:8, overflow:'hidden' }}>
                  <div style={{ background:s.color, height:'100%', width:`${s.gpa}%`, borderRadius:999 }} />
                </div>
              </div>
            ))}
          </>
        )}

        {activeReport === 'progressTrends' && (
          <>
            <div style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:16 }}>📈 Progress Trends — Last 30 Days</div>
            {SCHOOL.teachers.map(t => (
              <div key={t.id} style={{ background:T.inner, borderRadius:12, padding:'12px 14px', marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:13, color:T.text }}>{t.name}</div>
                  <div style={{ fontSize:11, color:T.muted }}>{t.subject}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:16, fontWeight:800, color:t.avgGPA>=85?T.green:t.avgGPA>=75?T.amber:T.red }}>{t.avgGPA}%</div>
                  <div style={{ fontSize:10, color:t.trend==='up'?T.green:t.trend==='down'?T.red:T.muted }}>
                    {t.trend==='up'?'↑ Improving':t.trend==='down'?'↓ Declining':'→ Stable'}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {activeReport === 'needsAttention' && (
          <>
            <div style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:16 }}>⚑ Needs Attention — {SCHOOL.teachers.reduce((a,t)=>a+t.atRisk,0)} students at risk</div>
            {SCHOOL.teachers.filter(t=>t.atRisk>0).map(t => (
              <div key={t.id} style={{ background:'#1c1012', border:`1px solid ${T.red}20`, borderRadius:12, padding:'12px 14px', marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13, color:T.text }}>{t.name} — {t.subject}</div>
                    <div style={{ fontSize:11, color:T.red, marginTop:2 }}>⚑ {t.atRisk} at-risk students · Avg {t.avgGPA}%</div>
                  </div>
                  <Btn label="View" color={T.blue} onClick={() => {}} />
                </div>
              </div>
            ))}
          </>
        )}

        {activeReport === 'commSummary' && (
          <>
            <div style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:16 }}>💬 Communication Summary</div>
            {[
              { label:'Messages sent this week',   value:47, color:T.blue   },
              { label:'Parent responses',           value:31, color:T.green  },
              { label:'Pending parent replies',     value:16, color:T.amber  },
              { label:'School announcements sent',  value:3,  color:T.purple },
            ].map(s => (
              <div key={s.label} style={{ background:T.inner, borderRadius:12, padding:'12px 14px', marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:13, color:T.text }}>{s.label}</span>
                <span style={{ fontSize:18, fontWeight:800, color:s.color }}>{s.value}</span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Export */}
      <div style={{ display:'flex', gap:8 }}>
        <button onClick={() => window.print()} style={{ flex:1, background:`${T.green}22`, color:T.green, border:'none', borderRadius:12, padding:'12px', fontSize:12, fontWeight:700, cursor:'pointer' }}>🖨 Print</button>
        <button onClick={() => window.print()} style={{ flex:1, background:`${T.blue}22`,  color:T.blue,  border:'none', borderRadius:12, padding:'12px', fontSize:12, fontWeight:700, cursor:'pointer' }}>⬇ PDF</button>
      </div>
    </PageShell>
  )
}

function MessagesPage({ onBack }) {
  const [mode, setMode]         = useState('schoolwide') // schoolwide | custom
  const [groupName, setGroupName] = useState('')
  const [selectedContacts, setSelectedContacts] = useState([])
  const [contactType, setContactType] = useState('teachers')
  const [compose, setCompose]   = useState(false)
  const [composeTo, setComposeTo] = useState('')
  const [sent, setSent]         = useState(null)

  const allContacts = SCHOOL.contacts[contactType] || []

  function toggleContact(name) {
    setSelectedContacts(prev => prev.includes(name) ? prev.filter(n=>n!==name) : [...prev, name])
  }

  function sendBroadcast(to) {
    setSent(to)
    setTimeout(() => setSent(null), 2500)
  }

  return (
    <>
      <PageShell title="💬 Comm Hub" onBack={onBack}>
        {/* Toggle */}
        <div style={{ background:T.inner, borderRadius:999, padding:3, display:'flex', marginBottom:16 }}>
          {[['schoolwide','🏫 School-Wide'],['custom','⚙ Custom']].map(([id,label]) => (
            <button key={id} onClick={() => setMode(id)}
              style={{ flex:1, background:mode===id?T.primary:'transparent', color:mode===id?'#fff':T.muted, border:'none', borderRadius:999, padding:'9px 0', fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}>
              {label}
            </button>
          ))}
        </div>

        {mode === 'schoolwide' && (
          <>
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:16, marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Broadcast to Everyone</div>
              {[
                { label:'📩 Message All Teachers', color:T.blue,   count:62 },
                { label:'👨‍👩‍👧 Message All Parents',   color:T.green, count:1247 },
                { label:'📢 School Announcement',  color:T.secondary, count:'all' },
              ].map(b => (
                <button key={b.label} onClick={() => { setComposeTo(b.label); setCompose(true) }}
                  style={{ width:'100%', background:`${b.color}22`, color:b.color, border:`1px solid ${b.color}30`, borderRadius:12, padding:'12px 16px', fontSize:13, fontWeight:700, cursor:'pointer', textAlign:'left', marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span>{b.label}</span>
                  <span style={{ fontSize:10, opacity:0.7 }}>{b.count} recipients</span>
                </button>
              ))}
            </div>

            {sent && (
              <div style={{ background:'#0f2a1a', border:`1px solid ${T.green}40`, borderRadius:12, padding:'10px 14px', color:T.green, fontSize:13, marginBottom:12, textAlign:'center' }}>
                ✅ Sent to {sent}!
              </div>
            )}

            {/* Recent announcements */}
            <div style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Recent Announcements</div>
            {SCHOOL.announcements.map(a => (
              <div key={a.id} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:'14px 16px', marginBottom:10 }}>
                <div style={{ fontSize:13, color:T.text, marginBottom:4, lineHeight:1.5 }}>{a.content}</div>
                <div style={{ fontSize:10, color:T.muted }}>{a.time}</div>
              </div>
            ))}
          </>
        )}

        {mode === 'custom' && (
          <>
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:16, marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Create Custom Group or Message Individual</div>

              {/* Contact type tabs */}
              <div style={{ display:'flex', gap:6, marginBottom:12 }}>
                {['teachers','parents','students'].map(type => (
                  <button key={type} onClick={() => { setContactType(type); setSelectedContacts([]) }}
                    style={{ padding:'6px 14px', borderRadius:999, border:'none', cursor:'pointer', fontSize:11, fontWeight:700,
                      background:contactType===type?T.primary:T.inner,
                      color:contactType===type?'#fff':T.muted }}>
                    {type.charAt(0).toUpperCase()+type.slice(1)}
                  </button>
                ))}
              </div>

              {/* Contact list */}
              <div style={{ maxHeight:200, overflowY:'auto' }}>
                {allContacts.map(name => (
                  <div key={name} onClick={() => toggleContact(name)}
                    style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:10, cursor:'pointer', background:selectedContacts.includes(name)?`${T.primary}18`:T.inner, marginBottom:4 }}>
                    <div style={{ width:20, height:20, borderRadius:4, border:`2px solid ${selectedContacts.includes(name)?T.primary:T.border}`, background:selectedContacts.includes(name)?T.primary:'transparent', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#fff', flexShrink:0 }}>
                      {selectedContacts.includes(name) && '✓'}
                    </div>
                    <span style={{ fontSize:13, color:T.text }}>{name}</span>
                    {/* Message individual directly */}
                    <button onClick={e => { e.stopPropagation(); setComposeTo(name); setCompose(true) }}
                      style={{ marginLeft:'auto', background:`${T.blue}22`, color:T.blue, border:'none', borderRadius:8, padding:'3px 10px', fontSize:10, fontWeight:700, cursor:'pointer' }}>
                      Message
                    </button>
                  </div>
                ))}
              </div>

              {selectedContacts.length > 0 && (
                <div style={{ marginTop:12 }}>
                  <input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Group name (optional)..."
                    style={{ width:'100%', background:T.inner, border:`1px solid ${T.border}`, borderRadius:10, padding:'10px 12px', color:T.text, fontSize:12, marginBottom:8, boxSizing:'border-box', outline:'none' }} />
                  <button onClick={() => { setComposeTo(`${selectedContacts.length} contacts`); setCompose(true) }}
                    style={{ width:'100%', background:T.primary, color:'#fff', border:'none', borderRadius:12, padding:'11px', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                    Message {selectedContacts.length} selected →
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </PageShell>
      {compose && <ComposeModal title="Compose Message" to={composeTo} onClose={() => { setCompose(false); setSent(composeTo) }} />}
    </>
  )
}

function SettingsPage({ onBack }) {
  const [settings, setSettings] = useState(SCHOOL.settings)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <PageShell title="⚙ School Settings" onBack={onBack}>
      {/* School Branding */}
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:16, marginBottom:12 }}>
        <div style={{ fontSize:12, fontWeight:700, color:T.secondary, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>🎨 School Branding</div>
        <div style={{ fontSize:12, color:T.muted, marginBottom:8 }}>Logo · Colors auto-detected · Admin can override</div>
        {[['School Name', SCHOOL.name],['District', SCHOOL.district],['Theme Colors', settings.branding.colors]].map(([label, val]) => (
          <div key={label} style={{ background:T.inner, borderRadius:10, padding:'10px 12px', marginBottom:8, display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontSize:12, color:T.muted }}>{label}</span>
            <span style={{ fontSize:12, fontWeight:700, color:T.text }}>{val}</span>
          </div>
        ))}
      </div>

      {/* Grading Scale */}
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:16, marginBottom:12 }}>
        <div style={{ fontSize:12, fontWeight:700, color:T.secondary, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>📋 Grading Scale</div>
        <div style={{ fontSize:12, color:T.muted, marginBottom:10 }}>Pulled from gradebook system · Admin sets school-wide</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
          {Object.entries(settings.gradingScale).map(([letter, min]) => (
            <div key={letter} style={{ background:T.inner, borderRadius:10, padding:'10px 8px', textAlign:'center' }}>
              <div style={{ fontSize:16, fontWeight:800, color:letter==='A'?T.green:letter==='B'?T.blue:letter==='C'?T.amber:T.red }}>{letter}</div>
              <div style={{ fontSize:11, color:T.muted }}>{min}%+</div>
            </div>
          ))}
        </div>
      </div>

      {/* Assignment Weights */}
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:16, marginBottom:12 }}>
        <div style={{ fontSize:12, fontWeight:700, color:T.secondary, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>📊 Assignment Weights</div>
        <div style={{ fontSize:12, color:T.muted, marginBottom:10 }}>Admin sets school default · Teachers can override</div>
        {Object.entries(settings.weights).map(([type, pct]) => (
          <div key={type} style={{ background:T.inner, borderRadius:10, padding:'10px 12px', marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:12, color:T.text, textTransform:'capitalize' }}>{type}</span>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <input type="number" defaultValue={pct} min={0} max={100}
                style={{ width:52, background:T.bg, border:`1px solid ${T.border}`, borderRadius:8, padding:'4px 8px', color:T.text, fontSize:12, textAlign:'center', outline:'none' }} />
              <span style={{ fontSize:11, color:T.muted }}>%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Teacher Verification */}
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:16, marginBottom:16 }}>
        <div style={{ fontSize:12, fontWeight:700, color:T.secondary, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>✓ Teacher Verification</div>
        <div style={{ fontSize:12, color:T.muted, marginBottom:12 }}>Self-registered teachers require admin verification before full access</div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:13, color:T.text }}>Require verification</span>
          <div onClick={() => setSettings(s => ({ ...s, verification: !s.verification }))}
            style={{ width:44, height:24, borderRadius:12, background:settings.verification?T.primary:T.inner, position:'relative', cursor:'pointer', transition:'background 0.2s' }}>
            <div style={{ position:'absolute', top:2, left:settings.verification?20:2, width:20, height:20, borderRadius:'50%', background:'#fff', transition:'left 0.2s' }} />
          </div>
        </div>
        {/* Pending teachers */}
        {SCHOOL.teachers.filter(t=>t.status==='pending').map(t => (
          <div key={t.id} style={{ background:T.inner, borderRadius:10, padding:'10px 12px', marginTop:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:T.text }}>{t.name}</div>
              <div style={{ fontSize:10, color:T.amber }}>⏳ Pending verification</div>
            </div>
            <button style={{ background:`${T.green}22`, color:T.green, border:'none', borderRadius:8, padding:'5px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>✓ Verify</button>
          </div>
        ))}
      </div>

      {saved && <div style={{ background:'#0f2a1a', border:`1px solid ${T.green}40`, borderRadius:12, padding:'10px 14px', color:T.green, fontSize:13, marginBottom:12, textAlign:'center' }}>✅ Settings saved!</div>}
      <button onClick={handleSave} style={{ width:'100%', background:T.primary, color:'#fff', border:'none', borderRadius:14, padding:'14px', fontSize:15, fontWeight:800, cursor:'pointer' }}>
        Save Settings
      </button>
    </PageShell>
  )
}

function AlertsPage({ onBack, onViewTeacher }) {
  return (
    <PageShell title="🔔 School Alerts" onBack={onBack}>
      {SCHOOL.alerts.map(a => (
        <div key={a.id} style={{ background:T.card, border:`1px solid ${a.color}20`, borderRadius:16, padding:'14px 16px', marginBottom:10, borderLeft:`3px solid ${a.color}` }}>
          <div style={{ fontSize:13, color:T.text, marginBottom:6, lineHeight:1.5 }}>{a.msg}</div>
          {a.teacher && (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:11, color:T.muted }}>{a.teacher}</span>
              <button onClick={() => onViewTeacher(a.teacherId)}
                style={{ background:`${a.color}22`, color:a.color, border:'none', borderRadius:8, padding:'4px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                View Class →
              </button>
            </div>
          )}
        </div>
      ))}
    </PageShell>
  )
}

function StudentFilterPage({ bucket, onBack }) {
  return (
    <PageShell title={`${bucket.label} Students`} onBack={onBack}>
      <div style={{ background:`${bucket.color}18`, border:`1px solid ${bucket.color}30`, borderRadius:12, padding:'10px 14px', marginBottom:16 }}>
        <div style={{ fontSize:13, fontWeight:700, color:bucket.color }}>{bucket.pct}% of students — {bucket.label}</div>
      </div>
      {bucket.students.map((name, i) => (
        <div key={i} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:'12px 16px', marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:13, fontWeight:600, color:T.text }}>{name}</span>
          <Btn label="View Profile" color={T.blue} onClick={() => {}} />
        </div>
      ))}
    </PageShell>
  )
}

// ── MAIN DASHBOARD ─────────────────────────────────────────────────────────────
export default function AdminDashboard({ currentUser }) {
  const [page, setPage]                   = useState('home')
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [bucketFilter, setBucketFilter]   = useState(null)

  const isSubPage = page !== 'home'

  function S(screen) { setPage(screen); window.scrollTo(0,0) }
  function goHome()  { S('home'); setSelectedTeacher(null); setBucketFilter(null) }

  function handleNavSelect(id) {
    if (id === '__back__') { goHome(); return }
    if (id === 'admin')    { goHome(); return }
    S(id)
  }

  // Sub-pages
  if (page === 'teachers') return (
    <>
      <TeachersPage onBack={goHome} initialTeacher={selectedTeacher} />
      <BottomNav role="admin" activePage="teachers" onNavigate={S} isSubPage={true} onBack={goHome} />
    </>
  )
  if (page === 'reports') return (
    <>
      <ReportsPage onBack={goHome} />
      <BottomNav role="admin" activePage="reports" onNavigate={S} isSubPage={true} onBack={goHome} />
    </>
  )
  if (page === 'messages') return (
    <>
      <MessagesPage onBack={goHome} />
      <BottomNav role="admin" activePage="messages" onNavigate={S} isSubPage={true} onBack={goHome} />
    </>
  )
  if (page === 'settings') return (
    <>
      <SettingsPage onBack={goHome} />
      <BottomNav role="admin" activePage="settings" onNavigate={S} isSubPage={true} onBack={goHome} />
    </>
  )
  if (page === 'alerts') return (
    <>
      <AlertsPage onBack={goHome} onViewTeacher={id => { setSelectedTeacher(SCHOOL.teachers.find(t=>t.id===id)); S('teachers') }} />
      <BottomNav role="admin" activePage="alerts" onNavigate={S} isSubPage={true} onBack={goHome} />
    </>
  )
  if (bucketFilter) return (
    <>
      <StudentFilterPage bucket={bucketFilter} onBack={() => { setBucketFilter(null) }} />
      <BottomNav role="admin" activePage="home" onNavigate={S} isSubPage={true} onBack={() => setBucketFilter(null)} />
    </>
  )

  // ── HOME ──────────────────────────────────────────────────────────────────────
  return (
    <>
      <div style={{ minHeight:'100vh', background:T.bg, color:T.text, fontFamily:'Inter, Arial, sans-serif', paddingBottom:80 }}>
        {/* Header */}
        <div style={{ background:T.header, padding:'20px 16px 28px', marginBottom:16 }}>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)', marginBottom:4 }}>Admin Dashboard 🏫</div>
          <div style={{ fontSize:22, fontWeight:800, color:'#fff', marginBottom:4 }}>Good morning, {currentUser?.userName || 'Principal'} 👋</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)' }}>{SCHOOL.name} · {SCHOOL.district}</div>
        </div>

        {/* AW1: School Overview */}
        <Widget onClick={() => S('reports')} style={{ background:'linear-gradient(135deg,#1d4ed8,#6d28d9)', border:'none' }}>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)', marginBottom:10 }}>SCHOOL OVERVIEW</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6 }}>
            {[
              { icon:'👨‍🎓', val:SCHOOL.totalStudents, label:'Students',    page:'reports'  },
              { icon:'👩‍🏫', val:SCHOOL.totalTeachers, label:'Teachers',    page:'teachers' },
              { icon:'📊', val:`${SCHOOL.schoolGPA}%`, label:'School GPA', page:'reports'  },
              { icon:'⚑',  val:SCHOOL.teachers.reduce((a,t)=>a+t.atRisk,0), label:'At Risk', page:'alerts' },
              { icon:'💬', val:18, label:'Pending Msgs', page:'messages' },
            ].map(t => (
              <button key={t.label} onClick={e => { e.stopPropagation(); S(t.page) }}
                style={{ background:'rgba(255,255,255,0.11)', borderRadius:13, padding:'10px 4px', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                <span style={{ fontSize:16 }}>{t.icon}</span>
                <span style={{ fontSize:13, fontWeight:800, color:'#fff', lineHeight:1 }}>{t.val}</span>
                <span style={{ fontSize:8, color:'rgba(255,255,255,0.6)', textAlign:'center' }}>{t.label}</span>
              </button>
            ))}
          </div>
        </Widget>

        {/* AW2: School-wide Analytics */}
        <Widget onClick={() => S('reports')} title="📈 School-wide Analytics"
          titleRight={<Btn label="Full Reports" color={T.blue} onClick={() => S('reports')} />}>
          <div style={{ fontSize:11, color:T.muted, marginBottom:12 }}>No individual grades · Class-level and school-level only</div>
          {SCHOOL.subjectGPA.map(s => (
            <div key={s.subject} style={{ marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:12, color:T.text }}>{s.subject}</span>
                <span style={{ fontSize:13, fontWeight:800, color:s.gpa>=85?T.green:s.gpa>=75?T.amber:T.red }}>{s.gpa}</span>
              </div>
              <div style={{ background:T.inner, borderRadius:999, height:6, overflow:'hidden' }}>
                <div style={{ background:s.color, height:'100%', width:`${s.gpa}%`, borderRadius:999 }} />
              </div>
              {s.gpa < 75 && <div style={{ fontSize:9, color:T.red, marginTop:2 }}>⚑ {s.subject} needs school-wide attention</div>}
            </div>
          ))}
          {/* GPA Buckets — clickable to filter students */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginTop:14 }}>
            {SCHOOL.gpaBuckets.map(b => (
              <button key={b.label} onClick={e => { e.stopPropagation(); setBucketFilter(b) }}
                style={{ background:`${b.color}18`, border:`1px solid ${b.color}30`, borderRadius:10, padding:'8px', textAlign:'center', cursor:'pointer' }}>
                <div style={{ fontSize:18, fontWeight:800, color:b.color }}>{b.pct}%</div>
                <div style={{ fontSize:8, color:b.color, lineHeight:1.3 }}>{b.label}</div>
              </button>
            ))}
          </div>
        </Widget>

        {/* AW3: Teachers */}
        <Widget onClick={() => S('teachers')} title="👩‍🏫 Teachers"
          titleRight={<Btn label="View All →" color={T.blue} onClick={() => S('teachers')} />}>
          {SCHOOL.teachers.slice(0,3).map(t => (
            <div key={t.id} onClick={e => { e.stopPropagation(); setSelectedTeacher(t); S('teachers') }}
              style={{ background:T.inner, borderRadius:12, padding:'10px 12px', marginBottom:8, cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontWeight:700, fontSize:13, color:T.text }}>{t.name}</div>
                <div style={{ fontSize:10, color:T.muted }}>{t.subject} · {t.classes} classes · {t.atRisk} at-risk</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:14, fontWeight:800, color:t.avgGPA>=85?T.green:t.avgGPA>=75?T.amber:T.red }}>{t.avgGPA}%</span>
                <span style={{ fontSize:9, padding:'2px 7px', borderRadius:999, fontWeight:700,
                  background:t.status==='active'?`${T.green}22`:`${T.amber}22`,
                  color:t.status==='active'?T.green:T.amber }}>
                  {t.status==='active'?'Active':'Pending'}
                </span>
              </div>
            </div>
          ))}
          <div style={{ fontSize:11, color:T.muted, textAlign:'center', marginTop:4 }}>+ {SCHOOL.teachers.length-3} more teachers · Tap to verify, message, view class-level data</div>
        </Widget>

        {/* AW4: School Alerts */}
        <Widget onClick={() => S('alerts')} title="🔔 School Alerts"
          titleRight={<span style={{ background:`rgba(245,166,35,0.15)`, color:T.amber, fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:999 }}>{SCHOOL.alerts.length}</span>}>
          {SCHOOL.alerts.map(a => (
            <div key={a.id} onClick={e => { e.stopPropagation(); setSelectedTeacher(SCHOOL.teachers.find(t=>t.id===a.teacherId)); S('teachers') }}
              style={{ background:T.inner, border:`1px solid ${a.color}20`, borderRadius:12, padding:'10px 12px', marginBottom:8, borderLeft:`3px solid ${a.color}`, cursor:'pointer' }}>
              <div style={{ fontSize:12, color:T.text }}>{a.msg}</div>
              {a.teacher && <div style={{ fontSize:10, color:a.color, marginTop:2 }}>{a.teacher} — tap to view →</div>}
            </div>
          ))}
        </Widget>

        {/* AW5: School Reports */}
        <Widget onClick={() => S('reports')} title="📋 School Reports"
          titleRight={<Btn label="See all →" color={T.blue} onClick={() => S('reports')} />}>
          <div style={{ fontSize:11, color:T.muted, marginBottom:10 }}>School-level only · No individual student data · Filter by grade level / subject</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
            {[['📊 GPA by Subject',T.blue],['📈 Progress Trends',T.green],['⚑ Needs Attention',T.red],['💬 Comm. Summary',T.purple]].map(([label,color]) => (
              <button key={label} onClick={e => { e.stopPropagation(); S('reports') }}
                style={{ background:`${color}22`, color, border:'none', borderRadius:10, padding:'8px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                {label}
              </button>
            ))}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={e => { e.stopPropagation(); window.print() }} style={{ flex:1, background:`${T.green}22`, color:T.green, border:'none', borderRadius:10, padding:'8px', fontSize:11, fontWeight:700, cursor:'pointer' }}>🖨 Print</button>
            <button onClick={e => { e.stopPropagation(); window.print() }} style={{ flex:1, background:`${T.blue}22`,  color:T.blue,  border:'none', borderRadius:10, padding:'8px', fontSize:11, fontWeight:700, cursor:'pointer' }}>⬇ PDF</button>
          </div>
        </Widget>

        {/* AW6: Comm Hub */}
        <Widget onClick={() => S('messages')} title="📢 Comm Hub"
          titleRight={<Btn label="+ Announce" color={T.secondary} onClick={() => S('messages')} />}>
          <div style={{ fontSize:11, color:T.muted, marginBottom:10 }}>Message all teachers · Message all parents · School-wide announcements</div>
          {[['📩 Message All Teachers',T.blue],['👨‍👩‍👧 Message All Parents',T.green],['📢 School Announcement',T.secondary]].map(([label,color]) => (
            <div key={label} onClick={e => { e.stopPropagation(); S('messages') }}
              style={{ background:`${color}18`, borderRadius:10, padding:'8px 12px', marginBottom:6, fontSize:12, color, fontWeight:600, cursor:'pointer' }}>
              {label}
            </div>
          ))}
        </Widget>

        {/* AW7: School Settings */}
        <Widget onClick={() => S('settings')} title="⚙ School Settings"
          titleRight={<Btn label="Edit" color={T.muted} onClick={() => S('settings')} />}>
          <div style={{ fontSize:11, color:T.muted, marginBottom:10 }}>Branding · Gradebook system · Grading scale · Weights · Verification</div>
          {[['🎨 School Branding','Logo auto-pulled · Colors auto-detected · Admin can override'],['📋 Grading Scale','Pulled from gradebook system · Admin sets school-wide'],['📊 Assignment Weights','Test 40% · Quiz 30% · Other 20% · Part. 10%'],['✓ Teacher Verification','Self-registered teachers require verification before full access']].map(([title,sub]) => (
            <div key={title} onClick={e => { e.stopPropagation(); S('settings') }}
              style={{ background:T.inner, borderRadius:10, padding:'10px 12px', marginBottom:8, cursor:'pointer' }}>
              <div style={{ fontSize:12, fontWeight:700, color:T.text, marginBottom:2 }}>{title}</div>
              <div style={{ fontSize:10, color:T.muted }}>{sub}</div>
            </div>
          ))}
        </Widget>
      </div>
      <BottomNav role="admin" activePage={page} onNavigate={handleNavSelect} isSubPage={false} />
    </>
  )
}
