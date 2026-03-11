import React, { useState } from 'react'
import { GradeBar } from '../components/ui'

const T = { primary:'#461D7C', secondary:'#FDD023', bg:'#060810', card:'#161923', inner:'#1e2231', text:'#eef0f8', muted:'#6b7494', border:'#2a2f42', green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623', purple:'#9b6ef5', header:'linear-gradient(135deg,#461D7C,#2d1254)' }

const SCHOOL = {
  name:'Lamar High School',
  district:'Houston ISD',
  totalStudents: 1247,
  totalTeachers: 62,
  schoolGPA: 84.6,
  gradeTrend: 'up',
  teachers:[
    { id:1, name:'Ms. Johnson', subject:'Math',    classes:4, avgGPA:83.2, atRisk:11, trend:'down' },
    { id:2, name:'Mr. Williams',subject:'Science',  classes:3, avgGPA:88.1, atRisk:5,  trend:'up'   },
    { id:3, name:'Ms. Davis',   subject:'Reading',  classes:4, avgGPA:91.4, atRisk:2,  trend:'up'   },
    { id:4, name:'Mr. Garcia',  subject:'Writing',  classes:3, avgGPA:79.3, atRisk:14, trend:'down' },
    { id:5, name:'Ms. Chen',    subject:'History',  classes:4, avgGPA:86.7, atRisk:7,  trend:'stable'},
  ],
  alerts:[
    { id:1, type:'grade',    msg:'3rd Period Math class GPA dropped below 70%',      color:T.red,   teacher:'Ms. Johnson' },
    { id:2, type:'grade',    msg:'4th Period Writing needs intervention — 14 at-risk', color:T.amber, teacher:'Mr. Garcia'  },
    { id:3, type:'positive', msg:'Ms. Davis: Reading class achieved 91% average!',   color:T.green, teacher:'Ms. Davis'   },
  ],
  announcements:[
    { id:1, content:'Professional Development Day — March 15th. No classes.', time:'1 hour ago' },
    { id:2, content:'Spring semester grade reports due by March 20th.',        time:'Yesterday'  },
  ],
}

function Widget({ onClick, children, style, title, titleRight }) {
  return (
    <div onClick={onClick} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:'14px 16px', margin:'0 10px 12px', cursor:onClick?'pointer':'default', transition:'transform 0.15s', ...style }}
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

function BottomNav({ active, onSelect }) {
  const items = [{ id:'home',label:'Home',icon:'🏠'},{ id:'teachers',label:'Teachers',icon:'👨‍🏫'},{ id:'reports',label:'Reports',icon:'📊'},{ id:'messages',label:'Messages',icon:'💬'},{ id:'settings',label:'Settings',icon:'⚙'}]
  return (
    <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:100, background:'rgba(10,12,18,0.97)', borderTop:`1px solid ${T.border}`, padding:'6px 0 max(16px,env(safe-area-inset-bottom))', display:'grid', gridTemplateColumns:`repeat(${items.length},1fr)` }}>
      {items.map(item => (
        <button key={item.id} onClick={() => onSelect(item.id)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'6px 2px' }}>
          <span style={{ fontSize:18 }}>{item.icon}</span>
          <span style={{ fontSize:9, color:item.id===active ? T.secondary : T.muted, fontWeight:item.id===active?700:400 }}>{item.label}</span>
          {item.id===active && <div style={{ width:4, height:4, borderRadius:'50%', background:T.secondary }} />}
        </button>
      ))}
    </div>
  )
}

export default function AdminDashboard({ currentUser }) {
  const [page, setPage]       = useState('home')
  const [activeNav, setActiveNav] = useState('home')
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [compose, setCompose] = useState(false)
  const [msgText, setMsgText] = useState('')
  const [msgSent, setMsgSent] = useState(false)
  const [announceCompose, setAnnounceCompose] = useState(false)
  const [announceText, setAnnounceText] = useState('')
  const [announceSent, setAnnounceSent] = useState(false)

  function S(screen) { setPage(screen); setActiveNav(screen); window.scrollTo(0,0) }

  // ── Teachers page ──────────────────────────────────────────────────────────
  if (page === 'teachers' || selectedTeacher) return (
    <>
      <div style={{ minHeight:'100vh', background:T.bg, color:T.text, fontFamily:'Inter, Arial, sans-serif', paddingBottom:80 }}>
        <div style={{ background:T.header, padding:'20px 16px 24px' }}>
          <button onClick={() => { S('home'); setSelectedTeacher(null) }} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:600, marginBottom:12 }}>← Back</button>
          <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>
            {selectedTeacher ? `👩‍🏫 ${selectedTeacher.name}` : '👨‍🏫 All Teachers'}
          </h1>
        </div>
        <div style={{ padding:'16px 10px' }}>
          {selectedTeacher ? (
            <>
              <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:20, marginBottom:12 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
                  {[['Subject',selectedTeacher.subject],['Classes',selectedTeacher.classes],['Avg GPA',`${selectedTeacher.avgGPA}%`],['At Risk',`${selectedTeacher.atRisk} students`]].map(([k,v]) => (
                    <div key={k} style={{ background:T.inner, borderRadius:10, padding:'10px 12px' }}>
                      <div style={{ fontSize:10, color:T.muted, marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>{k}</div>
                      <div style={{ fontSize:14, fontWeight:700, color:T.text }}>{v}</div>
                    </div>
                  ))}
                </div>
                <GradeBar score={selectedTeacher.avgGPA} />
                {selectedTeacher.atRisk > 8 && (
                  <div style={{ marginTop:12, background:'#1c1012', border:`1px solid ${T.red}30`, borderRadius:10, padding:'10px 12px', color:T.red, fontSize:12 }}>
                    ⚑ High at-risk count — consider intervention meeting
                  </div>
                )}
              </div>
              <button onClick={() => setCompose(true)} style={{ width:'calc(100% - 20px)', margin:'0 10px', background:T.primary, color:'#fff', border:'none', borderRadius:14, padding:'12px', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                💬 Send Message to {selectedTeacher.name}
              </button>
            </>
          ) : (
            SCHOOL.teachers.map(t => (
              <div key={t.id} onClick={() => setSelectedTeacher(t)}
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
                <GradeBar score={t.avgGPA} />
              </div>
            ))
          )}
        </div>
      </div>
      <BottomNav active={activeNav} onSelect={S} />
      {compose && (
        <div style={{ position:'fixed', inset:0, zIndex:2000, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:'22px 22px 0 0', padding:20, width:'100%', maxWidth:480 }}>
            <h3 style={{ margin:'0 0 14px', color:T.text, fontSize:15 }}>Message {selectedTeacher?.name}</h3>
            <textarea rows={4} value={msgText} onChange={e => setMsgText(e.target.value)} placeholder="Write your message..."
              style={{ width:'100%', background:T.inner, border:`1px solid ${T.border}`, borderRadius:12, padding:'12px 14px', color:T.text, fontSize:13, resize:'none', boxSizing:'border-box', lineHeight:1.6 }} />
            {msgSent && <div style={{ background:'#0f2a1a', border:`1px solid ${T.green}40`, borderRadius:10, padding:'8px 12px', color:T.green, fontSize:13, margin:'10px 0' }}>✅ Sent!</div>}
            <div style={{ display:'flex', gap:8, marginTop:10 }}>
              <button onClick={() => { setMsgSent(true); setTimeout(() => { setCompose(false); setMsgSent(false); setMsgText('') }, 1500) }}
                style={{ flex:1, background:T.primary, color:'#fff', border:'none', borderRadius:999, padding:'12px', fontSize:14, fontWeight:700, cursor:'pointer' }}>Send</button>
              <button onClick={() => setCompose(false)} style={{ flex:1, background:T.inner, color:T.muted, border:'none', borderRadius:999, padding:'12px', fontSize:13, fontWeight:600, cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )

  // ── Reports page ───────────────────────────────────────────────────────────
  if (page === 'reports') return (
    <>
      <div style={{ minHeight:'100vh', background:T.bg, color:T.text, fontFamily:'Inter, Arial, sans-serif', paddingBottom:80 }}>
        <div style={{ background:T.header, padding:'20px 16px 24px' }}>
          <button onClick={() => S('home')} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:600, marginBottom:12 }}>← Back</button>
          <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>📊 School Reports</h1>
        </div>
        <div style={{ padding:'16px 10px' }}>
          {['School GPA Overview','Teacher Performance','At-Risk Students','Grade Distribution','Communication Log','Progress Over Time'].map((r, i) => (
            <button key={r} onClick={() => alert(`${r} report — coming soon`)}
              style={{ width:'100%', background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:'14px 16px', marginBottom:10, textAlign:'left', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:14, fontWeight:700, color:T.text }}>{r}</span>
              <span style={{ color:T.muted, fontSize:16 }}>›</span>
            </button>
          ))}
          <div style={{ display:'flex', gap:8, marginTop:4 }}>
            <button onClick={() => window.print()} style={{ flex:1, background:`${T.green}22`, color:T.green, border:'none', borderRadius:12, padding:'12px', fontSize:12, fontWeight:700, cursor:'pointer' }}>🖨 Print</button>
            <button onClick={() => window.print()} style={{ flex:1, background:`${T.blue}22`,  color:T.blue,  border:'none', borderRadius:12, padding:'12px', fontSize:12, fontWeight:700, cursor:'pointer' }}>⬇ PDF</button>
          </div>
        </div>
      </div>
      <BottomNav active={activeNav} onSelect={S} />
    </>
  )

  // ── Messages page ──────────────────────────────────────────────────────────
  if (page === 'messages') return (
    <>
      <div style={{ minHeight:'100vh', background:T.bg, color:T.text, fontFamily:'Inter, Arial, sans-serif', paddingBottom:80 }}>
        <div style={{ background:T.header, padding:'20px 16px 24px' }}>
          <button onClick={() => S('home')} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:600, marginBottom:12 }}>← Back</button>
          <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>💬 Comm Hub</h1>
        </div>
        <div style={{ padding:'16px 10px' }}>
          {SCHOOL.announcements.map(a => (
            <div key={a.id} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:'14px 16px', marginBottom:10 }}>
              <div style={{ fontSize:13, color:T.text, marginBottom:4, lineHeight:1.5 }}>{a.content}</div>
              <div style={{ fontSize:10, color:T.muted }}>{a.time}</div>
            </div>
          ))}
          <button onClick={() => setAnnounceCompose(true)} style={{ width:'100%', background:T.primary, color:'#fff', border:'none', borderRadius:14, padding:'12px', fontSize:14, fontWeight:700, cursor:'pointer', marginTop:8 }}>
            📢 Send School Announcement
          </button>
        </div>
      </div>
      <BottomNav active={activeNav} onSelect={S} />
      {announceCompose && (
        <div style={{ position:'fixed', inset:0, zIndex:2000, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:'22px 22px 0 0', padding:20, width:'100%', maxWidth:480 }}>
            <h3 style={{ margin:'0 0 14px', color:T.text, fontSize:15 }}>School Announcement</h3>
            <textarea rows={4} value={announceText} onChange={e => setAnnounceText(e.target.value)} placeholder="Write your announcement..."
              style={{ width:'100%', background:T.inner, border:`1px solid ${T.border}`, borderRadius:12, padding:'12px 14px', color:T.text, fontSize:13, resize:'none', boxSizing:'border-box', lineHeight:1.6 }} />
            {announceSent && <div style={{ background:'#0f2a1a', border:`1px solid ${T.green}40`, borderRadius:10, padding:'8px 12px', color:T.green, fontSize:13, margin:'10px 0' }}>✅ Announcement sent!</div>}
            <div style={{ display:'flex', gap:8, marginTop:10 }}>
              <button onClick={() => { setAnnounceSent(true); setTimeout(() => { setAnnounceCompose(false); setAnnounceSent(false); setAnnounceText('') }, 1500) }}
                style={{ flex:1, background:T.primary, color:'#fff', border:'none', borderRadius:999, padding:'12px', fontSize:14, fontWeight:700, cursor:'pointer' }}>Send</button>
              <button onClick={() => setAnnounceCompose(false)} style={{ flex:1, background:T.inner, color:T.muted, border:'none', borderRadius:999, padding:'12px', fontSize:13, fontWeight:600, cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )

  // ── Home ───────────────────────────────────────────────────────────────────
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
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6 }}>
            {[{ icon:'👨‍🎓', val:SCHOOL.totalStudents, label:'Students' },{ icon:'👩‍🏫', val:SCHOOL.totalTeachers, label:'Teachers' },{ icon:'📊', val:`${SCHOOL.schoolGPA}%`, label:'School GPA' },{ icon:'⚑', val:SCHOOL.teachers.reduce((a,t)=>a+t.atRisk,0), label:'At Risk' }].map(t => (
              <div key={t.label} style={{ background:'rgba(255,255,255,0.11)', borderRadius:13, padding:'10px 4px', display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                <span style={{ fontSize:16 }}>{t.icon}</span>
                <span style={{ fontSize:14, fontWeight:800, color:'#fff', lineHeight:1 }}>{t.val}</span>
                <span style={{ fontSize:8, color:'rgba(255,255,255,0.6)', textAlign:'center' }}>{t.label}</span>
              </div>
            ))}
          </div>
        </Widget>

        {/* AW2: Analytics */}
        <Widget onClick={() => S('reports')} title="📈 Analytics">
          <div style={{ marginBottom:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ fontSize:12, color:T.muted }}>School GPA</span>
              <span style={{ fontSize:13, fontWeight:800, color:T.green }}>{SCHOOL.schoolGPA}% ↑</span>
            </div>
            <GradeBar score={SCHOOL.schoolGPA} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
            {[['A (90+)',18,'#22c97a'],['B-C (70+)',61,'#3b7ef4'],['F (<70)',21,'#f04a4a']].map(([label,pct,color]) => (
              <div key={label} style={{ background:`${color}18`, borderRadius:10, padding:'8px', textAlign:'center' }}>
                <div style={{ fontSize:18, fontWeight:800, color }}>{pct}%</div>
                <div style={{ fontSize:9, color }}>{label}</div>
              </div>
            ))}
          </div>
        </Widget>

        {/* AW3: Teachers with low GPA */}
        <Widget onClick={() => S('teachers')} title="👩‍🏫 Teachers Needing Support"
          titleRight={<Btn label="View All" color={T.blue} onClick={() => S('teachers')} />}>
          {SCHOOL.teachers.filter(t => t.atRisk > 8 || t.avgGPA < 82).map(t => (
            <div key={t.id} onClick={e => { e.stopPropagation(); setSelectedTeacher(t) }}
              style={{ background:'#1c1012', border:`1px solid ${T.red}20`, borderRadius:12, padding:'10px 12px', marginBottom:8, cursor:'pointer' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:13, color:T.text }}>{t.name}</div>
                  <div style={{ fontSize:10, color:T.red }}>⚑ {t.atRisk} at-risk · Avg {t.avgGPA}%</div>
                </div>
                <Btn label="Message" color={T.purple} onClick={() => { setSelectedTeacher(t); setCompose(true) }} />
              </div>
            </div>
          ))}
        </Widget>

        {/* AW4: Alerts */}
        <Widget onClick={() => S('teachers')} title="🔔 School Alerts"
          titleRight={<span style={{ background:'rgba(245,166,35,0.15)', color:T.amber, fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:999 }}>{SCHOOL.alerts.length}</span>}>
          {SCHOOL.alerts.map(a => (
            <div key={a.id} style={{ background:T.inner, border:`1px solid ${a.color}20`, borderRadius:12, padding:'10px 12px', marginBottom:8, borderLeft:`3px solid ${a.color}` }}>
              <div style={{ fontSize:12, color:T.text }}>{a.msg}</div>
              {a.teacher && <div style={{ fontSize:10, color:T.muted, marginTop:2 }}>{a.teacher}</div>}
            </div>
          ))}
        </Widget>

        {/* AW5: Comm Hub */}
        <Widget onClick={() => S('messages')} title="📢 Comm Hub"
          titleRight={<Btn label="+ Announce" color={T.secondary} onClick={() => S('messages')} />}>
          {SCHOOL.announcements.slice(0,2).map(a => (
            <div key={a.id} style={{ background:T.inner, borderRadius:12, padding:'10px 12px', marginBottom:8 }}>
              <div style={{ fontSize:12, color:T.text, lineHeight:1.5 }}>{a.content.substring(0,60)}...</div>
              <div style={{ fontSize:10, color:T.muted, marginTop:2 }}>{a.time}</div>
            </div>
          ))}
        </Widget>
      </div>
      <BottomNav active={activeNav} onSelect={S} />
    </>
  )
}
