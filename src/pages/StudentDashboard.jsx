import React, { useState } from 'react'
import BottomNav from '../components/ui/BottomNav'

const THEME = {
  bg:'#000d1f', card:'#001830', inner:'#002040', text:'#e8edf5',
  muted:'#6080a0', border:'#003a6a', green:'#22c97a', blue:'#B3A369',
  red:'#f04a4a', amber:'#f5a623', header:'linear-gradient(135deg,#003057 0%,#001830 100%)',
  primary:'#003057', secondary:'#B3A369',
}

const STUDENT = {
  name:'Marcus', fullName:'Marcus Thompson', grade:'3rd Grade',
  school:'Lincoln Elementary', gpa:87.4,
  classes:[
    { id:1, subject:'Math',    teacher:'Ms. Johnson', grade:87, letter:'B', period:'1st', color:'#3b7ef4' },
    { id:2, subject:'Reading', teacher:'Ms. Davis',   grade:95, letter:'A', period:'2nd', color:'#9b6ef5' },
    { id:3, subject:'Science', teacher:'Mr. Lee',     grade:79, letter:'C', period:'3rd', color:'#0fb8a0' },
    { id:4, subject:'Writing', teacher:'Ms. Clark',   grade:88, letter:'B', period:'4th', color:'#f54a7a' },
  ],
  assignments:[
    { id:1, name:'Ch.4 Worksheet', subject:'Math',    due:'Today',     status:'pending'   },
    { id:2, name:'Book Report',    subject:'Reading',  due:'Tomorrow',  status:'pending'   },
    { id:3, name:'Lab Report',     subject:'Science',  due:'Friday',    status:'submitted' },
  ],
  messages:[
    { id:1, from:'Ms. Johnson', subject:'Great work!',          content:"Great work on yesterday's quiz, Marcus! Keep it up!", time:'1 hr ago',  unread:true  },
    { id:2, from:'Mr. Lee',     subject:'Science Fair Reminder', content:'Reminder: Science fair project due Friday.',          time:'Yesterday', unread:false },
  ],
  feed:[
    { id:1, title:'📅 Test Friday — Ch. 4 & 5!', author:'Ms. Johnson', meta:'1hr ago · Read: 18/24', content:'Test Friday on Chapter 4 — fractions and decimals. Study pages 84–91.' },
    { id:2, title:'🏆 Great job this week!',       author:'Ms. Davis',   meta:'3hr ago',              content:'Fantastic reading logs this week everyone — keep it up!' },
  ],
  aiTip:{ headline:'Science needs your focus! 📚', body:'10 min flashcards tonight · same strategy that boosted Reading +8pts' },
  needsAttention:'Science below 70% · Study tips available',
}

function gradeColor(g) { return g>=90?'#22c97a':g>=80?'#B3A369':g>=70?'#f5a623':'#f04a4a' }

function Widget({ onClick, children, style, title, titleRight }) {
  return (
    <div onClick={onClick}
      style={{ background:THEME.card, border:`1px solid ${THEME.border}`, borderRadius:20, padding:'14px 16px', margin:'0 10px 12px', cursor:onClick?'pointer':'default', transition:'transform 0.15s', ...style }}
      onMouseEnter={e => onClick && (e.currentTarget.style.transform='scale(1.005)')}
      onMouseLeave={e => (e.currentTarget.style.transform='scale(1)')}>
      {(title||titleRight) && (
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          {title && <span style={{ fontSize:13, fontWeight:700, color:THEME.text }}>{title}</span>}
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

// ── GPA Bar ────────────────────────────────────────────────────────────────────
function GPABar({ gpa }) {
  const color = gpa>=90?'#22c97a':gpa>=80?'#B3A369':gpa>=70?'#f5a623':'#f04a4a'
  return (
    <div style={{ background:'linear-gradient(135deg,#003057,#001830)', borderRadius:16, padding:'14px 16px', marginBottom:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:2 }}>Overall GPA</div>
          <div style={{ fontSize:36, fontWeight:900, color:'#fff', lineHeight:1 }}>{gpa}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:22, fontWeight:800, color }}>{gpa>=90?'A':gpa>=80?'B':gpa>=70?'C':'D'}</div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)' }}>
            {gpa>=90?'Excellent':gpa>=80?'Good Standing':gpa>=70?'On Track':'Needs Support'}
          </div>
        </div>
      </div>
      <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:999, height:8, overflow:'hidden' }}>
        <div style={{ background:color, height:'100%', width:`${gpa}%`, borderRadius:999, transition:'width 0.6s' }} />
      </div>
    </div>
  )
}

export default function StudentDashboard({ currentUser, onNavigate }) {
  const [page, setPage]           = useState('home')
  const [selectedClass, setSelectedClass] = useState(null)
  const [selectedMsg, setSelectedMsg]     = useState(null)
  const [selectedFeed, setSelectedFeed]   = useState(null)

  const studentName = currentUser?.studentName || STUDENT.name

  function S(screen) { setPage(screen); window.scrollTo(0,0) }
  function goHome()  { S('home'); setSelectedClass(null); setSelectedMsg(null); setSelectedFeed(null) }

  function handleNavSelect(id) {
    if (id==='__back__') { goHome(); return }
    if (id==='home')     { goHome(); return }
    S(id)
  }

  const isSubPage = page !== 'home'

  // ── Grades page ──────────────────────────────────────────────────────────────
  if (page==='grades') return (
    <>
      <div style={{ minHeight:'100vh', background:THEME.bg, color:THEME.text, fontFamily:'Inter,Arial,sans-serif', paddingBottom:80 }}>
        <div style={{ background:THEME.header, padding:'20px 16px 24px' }}>
          <BackBtn onClick={goHome} />
          <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>📊 My Grades</h1>
        </div>
        <div style={{ padding:'16px 10px' }}>
          {/* GPA Summary Bar */}
          <GPABar gpa={STUDENT.gpa} />

          {selectedClass ? (
            <>
              <button onClick={() => setSelectedClass(null)}
                style={{ background:THEME.inner, border:'none', borderRadius:10, padding:'7px 14px', color:THEME.text, cursor:'pointer', fontSize:12, fontWeight:600, marginBottom:14 }}>
                ← All Classes
              </button>
              <div style={{ background:THEME.card, border:`1px solid ${THEME.border}`, borderRadius:16, padding:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                  <div>
                    <div style={{ fontSize:18, fontWeight:800, color:THEME.text }}>{selectedClass.subject}</div>
                    <div style={{ fontSize:12, color:THEME.muted }}>{selectedClass.teacher} · {selectedClass.period} Period</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:36, fontWeight:900, color:gradeColor(selectedClass.grade) }}>{selectedClass.grade}%</div>
                    <div style={{ fontSize:16, fontWeight:700, color:gradeColor(selectedClass.grade) }}>{selectedClass.letter}</div>
                  </div>
                </div>
                <div style={{ background:THEME.inner, borderRadius:999, height:10, overflow:'hidden', marginBottom:16 }}>
                  <div style={{ background:selectedClass.color, height:'100%', width:`${selectedClass.grade}%`, borderRadius:999 }} />
                </div>
                <div style={{ fontSize:11, color:THEME.muted, marginBottom:12 }}>Recent assignments in this class</div>
                {STUDENT.assignments.filter(a=>a.subject===selectedClass.subject).map(a => (
                  <div key={a.id} style={{ background:THEME.inner, borderRadius:12, padding:'10px 12px', marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color:THEME.text }}>{a.name}</div>
                      <div style={{ fontSize:10, color:THEME.muted }}>Due: {a.due}</div>
                    </div>
                    <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:999,
                      background:a.status==='submitted'?'rgba(34,201,122,0.15)':'rgba(245,166,35,0.15)',
                      color:a.status==='submitted'?THEME.green:THEME.amber }}>
                      {a.status==='submitted'?'✓ Submitted':'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            STUDENT.classes.map(c => (
              <div key={c.id} onClick={() => setSelectedClass(c)}
                style={{ background:THEME.card, border:`1px solid ${THEME.border}`, borderLeft:`3px solid ${c.color}`, borderRadius:16, padding:'14px 16px', marginBottom:10, cursor:'pointer' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14, color:THEME.text }}>{c.subject}</div>
                    <div style={{ fontSize:11, color:THEME.muted }}>{c.teacher} · {c.period} Period</div>
                  </div>
                  <div style={{ fontSize:20, fontWeight:800, color:gradeColor(c.grade) }}>{c.grade}% {c.letter}</div>
                </div>
                <div style={{ background:THEME.inner, borderRadius:999, height:6, overflow:'hidden' }}>
                  <div style={{ background:c.color, height:'100%', width:`${c.grade}%`, borderRadius:999 }} />
                </div>
                <div style={{ fontSize:9, color:THEME.muted, marginTop:6 }}>Tap to see assignments →</div>
              </div>
            ))
          )}
        </div>
      </div>
      <BottomNav role="student" activePage="grades" onNavigate={handleNavSelect} isSubPage={true} onBack={goHome} />
    </>
  )

  // ── Messages page ────────────────────────────────────────────────────────────
  if (page==='messages') return (
    <>
      <div style={{ minHeight:'100vh', background:THEME.bg, color:THEME.text, fontFamily:'Inter,Arial,sans-serif', paddingBottom:80 }}>
        <div style={{ background:THEME.header, padding:'20px 16px 24px' }}>
          <BackBtn onClick={goHome} />
          <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>💬 Messages</h1>
        </div>
        <div style={{ padding:'16px 10px' }}>
          {selectedMsg ? (
            <>
              <button onClick={() => setSelectedMsg(null)}
                style={{ background:THEME.inner, border:'none', borderRadius:10, padding:'7px 14px', color:THEME.text, cursor:'pointer', fontSize:12, fontWeight:600, marginBottom:14 }}>
                ← Back to Messages
              </button>
              <div style={{ background:THEME.card, border:`1px solid ${THEME.border}`, borderRadius:16, padding:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                  <div style={{ fontWeight:700, fontSize:15, color:THEME.text }}>{selectedMsg.from}</div>
                  <span style={{ fontSize:10, color:THEME.muted }}>{selectedMsg.time}</span>
                </div>
                <div style={{ fontSize:13, fontWeight:600, color:THEME.text, marginBottom:10 }}>{selectedMsg.subject}</div>
                <p style={{ fontSize:13, color:'#c0c8e0', lineHeight:1.7, margin:0 }}>{selectedMsg.content}</p>
              </div>
            </>
          ) : (
            STUDENT.messages.map(m => (
              <div key={m.id} onClick={() => setSelectedMsg(m)}
                style={{ background:m.unread?'#1a1800':THEME.card, border:`1px solid ${m.unread?THEME.amber:THEME.border}30`, borderRadius:16, padding:'14px 16px', marginBottom:10, cursor:'pointer' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <span style={{ fontWeight:700, fontSize:13, color:THEME.text }}>{m.from}</span>
                  <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                    {m.unread && <span style={{ width:8, height:8, background:THEME.amber, borderRadius:'50%', display:'inline-block' }} />}
                    <span style={{ fontSize:10, color:THEME.muted }}>{m.time}</span>
                  </div>
                </div>
                <div style={{ fontSize:12, fontWeight:600, color:THEME.text, marginBottom:4 }}>{m.subject}</div>
                <p style={{ fontSize:11, color:THEME.muted, margin:0, lineHeight:1.5 }}>{m.content.substring(0,60)}...</p>
                <div style={{ fontSize:10, color:THEME.blue, marginTop:6 }}>Tap to read →</div>
              </div>
            ))
          )}
        </div>
      </div>
      <BottomNav role="student" activePage="messages" onNavigate={handleNavSelect} isSubPage={true} onBack={goHome} />
    </>
  )

  // ── Feed page ────────────────────────────────────────────────────────────────
  if (page==='feed') return (
    <>
      <div style={{ minHeight:'100vh', background:THEME.bg, color:THEME.text, fontFamily:'Inter,Arial,sans-serif', paddingBottom:80 }}>
        <div style={{ background:THEME.header, padding:'20px 16px 24px' }}>
          <BackBtn onClick={goHome} />
          <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>📢 Class Feed</h1>
        </div>
        <div style={{ padding:'16px 10px' }}>
          {selectedFeed ? (
            <>
              <button onClick={() => setSelectedFeed(null)}
                style={{ background:THEME.inner, border:'none', borderRadius:10, padding:'7px 14px', color:THEME.text, cursor:'pointer', fontSize:12, fontWeight:600, marginBottom:14 }}>
                ← Back to Feed
              </button>
              <div style={{ background:THEME.card, border:`1px solid ${THEME.border}`, borderRadius:16, padding:20 }}>
                <div style={{ fontSize:15, fontWeight:700, color:THEME.text, marginBottom:6 }}>{selectedFeed.title}</div>
                <div style={{ fontSize:11, color:THEME.muted, marginBottom:12 }}>{selectedFeed.author} · {selectedFeed.meta}</div>
                <p style={{ fontSize:13, color:'#c0c8e0', lineHeight:1.7, margin:0 }}>{selectedFeed.content}</p>
              </div>
            </>
          ) : (
            STUDENT.feed.map(f => (
              <div key={f.id} onClick={() => setSelectedFeed(f)}
                style={{ background:THEME.card, border:`1px solid ${THEME.border}`, borderRadius:16, padding:'14px 16px', marginBottom:10, cursor:'pointer' }}>
                <div style={{ fontSize:14, fontWeight:700, color:THEME.text, marginBottom:4 }}>{f.title}</div>
                <div style={{ fontSize:11, color:THEME.muted, marginBottom:6 }}>{f.author} · {f.meta}</div>
                <p style={{ fontSize:12, color:'#c0c8e0', margin:0, lineHeight:1.5 }}>{f.content.substring(0,80)}...</p>
                <div style={{ fontSize:10, color:THEME.blue, marginTop:8 }}>Tap to read →</div>
              </div>
            ))
          )}
        </div>
      </div>
      <BottomNav role="student" activePage="feed" onNavigate={handleNavSelect} isSubPage={true} onBack={goHome} />
    </>
  )

  // ── Assignments page ─────────────────────────────────────────────────────────
  if (page==='assignments') return (
    <>
      <div style={{ minHeight:'100vh', background:THEME.bg, color:THEME.text, fontFamily:'Inter,Arial,sans-serif', paddingBottom:80 }}>
        <div style={{ background:THEME.header, padding:'20px 16px 24px' }}>
          <BackBtn onClick={goHome} />
          <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>📋 Assignments</h1>
        </div>
        <div style={{ padding:'16px 10px' }}>
          {STUDENT.assignments.map(a => (
            <div key={a.id} style={{ background:THEME.card, border:`1px solid ${THEME.border}`, borderRadius:16, padding:'14px 16px', marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:13, color:THEME.text }}>{a.name}</div>
                  <div style={{ fontSize:11, color:THEME.muted }}>{a.subject} · Due: {a.due}</div>
                </div>
                <span style={{ fontSize:10, fontWeight:700, padding:'4px 10px', borderRadius:999,
                  background:a.status==='submitted'?'rgba(34,201,122,0.15)':'rgba(245,166,35,0.15)',
                  color:a.status==='submitted'?THEME.green:THEME.amber }}>
                  {a.status==='submitted'?'✓ Submitted':'Pending'}
                </span>
              </div>
              {a.status==='pending' && (
                <button style={{ marginTop:10, background:'var(--school-color,#003057)', color:'#fff', border:'none', borderRadius:10, padding:'8px 16px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                  📤 Submit Work
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <BottomNav role="student" activePage="assignments" onNavigate={handleNavSelect} isSubPage={true} onBack={goHome} />
    </>
  )

  // ── Upload Assignment page ────────────────────────────────────────────────────
  if (page==='upload') return (
    <>
      <div style={{ minHeight:'100vh', background:THEME.bg, color:THEME.text, fontFamily:'Inter,Arial,sans-serif', paddingBottom:80 }}>
        <div style={{ background:THEME.header, padding:'20px 16px 24px' }}>
          <BackBtn onClick={goHome} />
          <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>📤 Upload Assignment</h1>
        </div>
        <div style={{ padding:'16px 16px' }}>
          <div style={{ fontSize:12, color:THEME.muted, marginBottom:16 }}>Photo · File · Link · Note to teacher</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              { icon:'📷', label:'Take Photo',    sub:'Use your camera',        color:'#22c97a' },
              { icon:'📄', label:'Upload File',   sub:'PDF · Doc · Image',      color:'#3b7ef4' },
              { icon:'🔗', label:'Share Link',    sub:'Google Drive · Dropbox', color:'#9b6ef5' },
              { icon:'📝', label:'Note to Teacher', sub:'Type a message',       color:'#f5a623' },
            ].map(opt => (
              <button key={opt.label}
                style={{ background:THEME.card, border:`1px solid ${opt.color}22`, borderRadius:14, padding:'14px 16px', textAlign:'left', cursor:'pointer', display:'flex', alignItems:'center', gap:14 }}
                onMouseEnter={e => e.currentTarget.style.borderColor=opt.color}
                onMouseLeave={e => e.currentTarget.style.borderColor=`${opt.color}22`}>
                <div style={{ width:44, height:44, borderRadius:12, background:`${opt.color}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{opt.icon}</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:13, color:THEME.text }}>{opt.label}</div>
                  <div style={{ fontSize:11, color:THEME.muted }}>{opt.sub}</div>
                </div>
              </button>
            ))}
          </div>
          <div style={{ marginTop:16 }}>
            <div style={{ fontSize:11, fontWeight:700, color:THEME.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Select Assignment</div>
            {STUDENT.assignments.filter(a=>a.status==='pending').map(a => (
              <div key={a.id} style={{ background:THEME.card, border:`1px solid ${THEME.border}`, borderRadius:12, padding:'10px 14px', marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:THEME.text }}>{a.name}</div>
                  <div style={{ fontSize:10, color:THEME.muted }}>{a.subject} · Due {a.due}</div>
                </div>
                <span style={{ fontSize:10, color:THEME.amber }}>Pending</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomNav role="student" activePage="upload" onNavigate={handleNavSelect} isSubPage={true} onBack={goHome} />
    </>
  )

  // ── Alerts page ──────────────────────────────────────────────────────────────
  if (page==='alerts') return (
    <>
      <div style={{ minHeight:'100vh', background:THEME.bg, color:THEME.text, fontFamily:'Inter,Arial,sans-serif', paddingBottom:80 }}>
        <div style={{ background:THEME.header, padding:'20px 16px 24px' }}>
          <BackBtn onClick={goHome} />
          <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>🔔 Alerts</h1>
        </div>
        <div style={{ padding:'16px 10px' }}>
          <div style={{ background:'#1c1012', border:'1px solid rgba(240,74,74,0.2)', borderRadius:14, padding:'14px 16px', marginBottom:10, borderLeft:'3px solid #f04a4a' }}>
            <div style={{ fontSize:13, color:THEME.text }}>⚑ Science below 70% — study tips available</div>
            <button onClick={() => S('grades')} style={{ marginTop:8, background:'rgba(240,74,74,0.15)', color:'#f04a4a', border:'none', borderRadius:8, padding:'5px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>View Grades →</button>
          </div>
          <div style={{ background:THEME.card, border:`1px solid ${THEME.border}`, borderRadius:14, padding:'14px 16px', marginBottom:10 }}>
            <div style={{ fontSize:13, color:THEME.text }}>📋 2 assignments due this week</div>
            <button onClick={() => S('assignments')} style={{ marginTop:8, background:`${THEME.amber}22`, color:THEME.amber, border:'none', borderRadius:8, padding:'5px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>View Assignments →</button>
          </div>
        </div>
      </div>
      <BottomNav role="student" activePage="alerts" onNavigate={handleNavSelect} isSubPage={true} onBack={goHome} />
    </>
  )

  // ── HOME ─────────────────────────────────────────────────────────────────────
  return (
    <>
      <div style={{ minHeight:'100vh', background:THEME.bg, color:THEME.text, fontFamily:'Inter,Arial,sans-serif', paddingBottom:80 }}>
        {/* Header */}
        <div style={{ background:THEME.header, padding:'20px 16px 28px', marginBottom:16 }}>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)', marginBottom:4 }}>Good Morning! 🌟</div>
          <div style={{ fontSize:24, fontWeight:800, color:'#fff', marginBottom:4 }}>Hi, {studentName}! 👋</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)' }}>{STUDENT.grade} · {STUDENT.school}</div>
        </div>

        {/* SW1: Daily Overview */}
        <Widget onClick={() => S('grades')} style={{ background:'linear-gradient(135deg,#003057,#001830)', border:'none' }}>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)', marginBottom:10 }}>DAILY OVERVIEW</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6 }}>
            {[
              { icon:'📊', val:STUDENT.gpa,                                    label:'GPA',         page:'grades'      },
              { icon:'📚', val:STUDENT.classes.length,                         label:'Classes',     page:'grades'      },
              { icon:'📋', val:STUDENT.assignments.filter(a=>a.status==='pending').length, label:'Assignments', page:'assignments' },
              { icon:'🔔', val:2,                                              label:'Updates',     page:'alerts'      },
            ].map(t => (
              <button key={t.label} onClick={e => { e.stopPropagation(); S(t.page) }}
                style={{ background:'rgba(255,255,255,0.11)', borderRadius:13, padding:'10px 4px', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                <span style={{ fontSize:16 }}>{t.icon}</span>
                <span style={{ fontSize:16, fontWeight:800, color:'#fff', lineHeight:1 }}>{t.val}</span>
                <span style={{ fontSize:8, color:'rgba(255,255,255,0.6)', textAlign:'center' }}>{t.label}</span>
              </button>
            ))}
          </div>
        </Widget>

        {/* SW2: Today's Lessons */}
        <Widget onClick={() => S('grades')} style={{ background:'linear-gradient(135deg,#002040,#001020)', border:`1px solid ${THEME.border}` }}>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)', marginBottom:8 }}>TODAY'S LESSONS 📖</div>
          <div style={{ fontSize:15, fontWeight:700, color:THEME.text, marginBottom:4 }}>Ch.4 · Fractions &amp; Decimals</div>
          <div style={{ fontSize:11, color:THEME.muted, marginBottom:10 }}>Math · Pages 84–91 · Ms. Johnson · Based on teacher plan</div>
          <Btn label="View Worksheet 📄" color={THEME.secondary} onClick={() => S('grades')} />
        </Widget>

        {/* SW3: My Classes — individual cards open that class's grades */}
        <Widget onClick={() => S('grades')} title="My Classes">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {STUDENT.classes.map(c => (
              <button key={c.id} onClick={e => { e.stopPropagation(); setSelectedClass(c); S('grades') }}
                style={{ background:THEME.inner, borderRadius:12, padding:'12px', border:`1px solid ${THEME.border}`, borderLeft:`3px solid ${c.color}`, cursor:'pointer', textAlign:'left' }}>
                <div style={{ fontWeight:700, fontSize:12, color:THEME.text, marginBottom:2 }}>{c.subject}</div>
                <div style={{ fontSize:10, color:THEME.muted, marginBottom:6 }}>{c.teacher}</div>
                <div style={{ fontSize:20, fontWeight:800, color:gradeColor(c.grade) }}>{c.grade}%</div>
                <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:999, height:4, overflow:'hidden', marginTop:4 }}>
                  <div style={{ background:c.color, height:'100%', width:`${c.grade}%`, borderRadius:999 }} />
                </div>
              </button>
            ))}
          </div>
          <div style={{ fontSize:9, color:THEME.muted, marginTop:8, textAlign:'center' }}>Tap any class → see grades & assignments</div>
        </Widget>

        {/* SW4: Needs Attention */}
        <Widget onClick={() => S('grades')} style={{ border:'1px solid rgba(240,74,74,0.12)' }} title="Needs Attention ⚑">
          <div style={{ background:'#1c1012', borderRadius:10, padding:'8px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:12, color:'#f04a4a' }}>{STUDENT.needsAttention}</span>
            <Btn label="Study Tips →" color="#9b6ef5" onClick={() => S('aiTips')} />
          </div>
        </Widget>

        {/* SW5: Messages — widget navigates to messenger, clicking individual opens thread */}
        <Widget onClick={() => S('messages')} title="💬 Messages"
          titleRight={<span style={{ background:`rgba(179,163,105,0.2)`, color:THEME.secondary, borderRadius:999, padding:'3px 8px', fontSize:10, fontWeight:700 }}>{STUDENT.messages.filter(m=>m.unread).length} new</span>}>
          {STUDENT.messages.slice(0,2).map(m => (
            <div key={m.id} onClick={e => { e.stopPropagation(); setSelectedMsg(m); S('messages') }}
              style={{ background:m.unread?'#1a1800':THEME.inner, borderRadius:12, padding:'10px 12px', marginBottom:8, cursor:'pointer', border:m.unread?`1px solid ${THEME.amber}30`:'none' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                <span style={{ fontSize:12, fontWeight:700, color:THEME.text }}>{m.from}</span>
                {m.unread && <span style={{ width:7, height:7, background:THEME.amber, borderRadius:'50%' }} />}
              </div>
              <div style={{ fontSize:11, color:THEME.muted }}>{m.content.substring(0,50)}...</div>
              <div style={{ fontSize:9, color:THEME.blue, marginTop:4 }}>Tap to open →</div>
            </div>
          ))}
        </Widget>

        {/* SW6: Class Feed — topics clickable */}
        <Widget onClick={() => S('feed')} title="📢 Class Feed">
          {STUDENT.feed.map(f => (
            <div key={f.id} onClick={e => { e.stopPropagation(); setSelectedFeed(f); S('feed') }}
              style={{ background:THEME.inner, borderRadius:12, padding:'10px 12px', marginBottom:8, cursor:'pointer' }}>
              <div style={{ fontSize:13, fontWeight:700, color:THEME.text, marginBottom:2 }}>{f.title}</div>
              <div style={{ fontSize:10, color:THEME.muted, marginBottom:4 }}>{f.author} · {f.meta}</div>
              <div style={{ fontSize:10, color:THEME.blue }}>Tap to read →</div>
            </div>
          ))}
        </Widget>

        {/* SW7: AI Study Tips */}
        <Widget onClick={() => {}} style={{ background:'linear-gradient(135deg,rgba(70,29,124,0.3),rgba(15,184,160,0.2))', border:'1px solid rgba(155,110,245,0.2)' }}>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)', marginBottom:8 }}>✨ AI STUDY TIPS</div>
          <div style={{ fontSize:14, fontWeight:700, color:THEME.text, marginBottom:6 }}>{STUDENT.aiTip.headline}</div>
          <div style={{ fontSize:11, color:'#b090d0', marginBottom:8 }}>{STUDENT.aiTip.body}</div>
          <div style={{ fontSize:10, color:'#9b6ef5', fontWeight:600, cursor:'pointer' }}>Tap for full personalized study plan →</div>
        </Widget>

        {/* SW8: Upload Assignment */}
        <Widget onClick={() => S('upload')} style={{ border:'1px solid rgba(34,201,122,0.18)' }} title="📤 Upload Assignment"
          titleRight={<Btn label="Submit" color="#22c97a" onClick={() => S('upload')} />}>
          <div style={{ fontSize:11, color:THEME.muted, marginBottom:10 }}>Photo · File · Link · Note to teacher</div>
          <div style={{ display:'flex', gap:8 }}>
            {[['📷 Photo','#22c97a'],['📄 File','#3b7ef4'],['🔗 Link','#9b6ef5']].map(([label,color]) => (
              <button key={label} onClick={e => { e.stopPropagation(); S('upload') }}
                style={{ background:`${color}20`, color, border:'none', borderRadius:10, padding:'7px 12px', fontSize:10, fontWeight:700, cursor:'pointer' }}>
                {label}
              </button>
            ))}
          </div>
        </Widget>
      </div>
      <BottomNav role="student" activePage="home" onNavigate={handleNavSelect} isSubPage={false} />
    </>
  )
}
