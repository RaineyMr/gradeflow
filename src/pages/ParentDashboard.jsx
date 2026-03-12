import React, { useState, useRef, useEffect } from 'react'
import { GradeBar, GradeBadge } from '../components/ui'

const T = {
  primary:'#C8102E', secondary:'#ffffff', bg:'#0f0003', card:'#1e0008',
  inner:'#2c000e', border:'#5a001a', text:'#f8eaec', muted:'#a06070',
  hint:'#6a2030', green:'#22c97a', blue:'#3b7ef4', amber:'#f5a623', red:'#f04a4a',
  header:'linear-gradient(135deg,#C8102E,#8b0a1f)',
}

const CHILD = {
  name:'Marcus', school:'Bellaire High School', grade:'10th Grade', gpa:87.4,
  classes:[
    { id:1, subject:'Math',    teacher:'Ms. Johnson', grade:87, letter:'B', period:'1st', trend:'stable' },
    { id:2, subject:'Reading', teacher:'Ms. Davis',   grade:95, letter:'A', period:'2nd', trend:'up'     },
    { id:3, subject:'Science', teacher:'Mr. Lee',     grade:79, letter:'C', period:'3rd', trend:'down'   },
    { id:4, subject:'Writing', teacher:'Ms. Clark',   grade:88, letter:'B', period:'4th', trend:'stable' },
  ],
  teacherMessages:[
    { id:1, from:'Ms. Johnson', subject:'Fractions Test',       content:'Marcus showed excellent work on the fractions test today. Keep it up!',            time:'2h ago',    unread:true  },
    { id:2, from:'Mr. Lee',     subject:'Science Fair Reminder', content:'Reminder: Science fair project is due this Friday. Please review the rubric.',    time:'Yesterday', unread:false },
    { id:3, from:'Ms. Davis',   subject:'Reading Progress',      content:'Marcus finished his reading log ahead of schedule — great discipline!',           time:'2 days ago', unread:false },
  ],
  privateMessages:[
    { id:1, from:'You',         subject:'Science concern',       content:'Hi Ms. Johnson, Marcus has been struggling with fractions at home. Any tips?',    time:'3 days ago', fromParent:true  },
    { id:2, from:'Ms. Johnson', subject:'Re: Science concern',   content:"Happy to help! Try using pizza slices as a visual — works great. Let's schedule a call.", time:'2 days ago', fromParent:false },
  ],
  alerts:[
    { id:1, type:'grade',      msg:'Math grade dropped from 91% to 87% this week.',  color:'#f5a623' },
    { id:2, type:'attendance', msg:'Marcus was 5 minutes late on Monday.',            color:'#f04a4a' },
  ],
  feed:[
    { id:1, author:'Ms. Johnson', content:'📅 Test Friday on Chapter 4 — fractions and decimals. Study pages 84–91.', time:'1h ago',    reactions:{ '👍':8,  '❤️':3 } },
    { id:2, author:'Mr. Lee',     content:'Science fair projects due this Friday! Set up starts at 8am in the gym.',   time:'3h ago',    reactions:{ '👍':12, '😂':2 } },
    { id:3, author:'Ms. Clark',   content:'Great writing essays this week — keep up the creative work everyone!',      time:'Yesterday', reactions:{ '❤️':15, '👍':6 } },
  ],
  assignments:[
    { id:1, subject:'Math',    title:'Ch.4 Practice Problems', due:'Tomorrow',  status:'pending' },
    { id:2, subject:'Science', title:'Lab Report #3',          due:'Friday',    status:'pending' },
    { id:3, subject:'Reading', title:'Reading Log Week 8',     due:'Completed', status:'done'    },
    { id:4, subject:'Writing', title:'Persuasive Essay Draft', due:'Next Mon',  status:'pending' },
  ],
}

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

function BottomNav({ active, onSelect }) {
  const items = [
    { id:'home',     label:'Home',     icon:'🏠' },
    { id:'grades',   label:'Grades',   icon:'📊' },
    { id:'feed',     label:'Feed',     icon:'📢' },
    { id:'messages', label:'Messages', icon:'💬' },
    { id:'calendar', label:'Calendar', icon:'📅' },
  ]
  return (
    <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:100, background:'rgba(15,0,3,0.97)', borderTop:`1px solid ${T.border}`, padding:'6px 0 max(16px,env(safe-area-inset-bottom))', display:'grid', gridTemplateColumns:`repeat(${items.length},1fr)` }}>
      {items.map(item => (
        <button key={item.id} onClick={() => onSelect(item.id)}
          style={{ background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'6px 2px' }}>
          <span style={{ fontSize:18 }}>{item.icon}</span>
          <span style={{ fontSize:9, color:item.id===active?T.primary:T.muted, fontWeight:item.id===active?700:400 }}>{item.label}</span>
          {item.id===active && <div style={{ width:4, height:4, borderRadius:'50%', background:T.primary }} />}
        </button>
      ))}
    </div>
  )
}

export default function ParentDashboard({ currentUser }) {
  const [page,        setPage]        = useState('home')
  const [activeNav,   setActiveNav]   = useState('home')
  const [msgTab,      setMsgTab]      = useState('student')
  const [selectedMsg, setSelectedMsg] = useState(null)
  const [composing,   setComposing]   = useState(false)
  const [composeTo,   setComposeTo]   = useState(null)
  const [draftText,   setDraftText]   = useState('')
  const [draftSubj,   setDraftSubj]   = useState('')
  const [sent,        setSent]        = useState(false)
  const [myReactions, setMyReactions] = useState({})

  function S(screen) { setPage(screen); setActiveNav(screen); window.scrollTo(0,0) }
  function goHome() { S('home') }

  function sendMessage() {
    if (!draftText.trim()) return
    setSent(true)
    setTimeout(() => { setSent(false); setComposing(false); setDraftText(''); setDraftSubj(''); setComposeTo(null) }, 1800)
  }

  function react(feedId, emoji) {
    setMyReactions(prev => ({ ...prev, [`${feedId}-${emoji}`]: !prev[`${feedId}-${emoji}`] }))
  }

  const gradeColor = (g) => g>=90?T.green:g>=80?T.blue:g>=70?T.amber:T.red
  const unreadCount = CHILD.teacherMessages.filter(m=>m.unread).length

  // ── Grades ───────────────────────────────────────────────────────────────────
  if (page === 'grades') return (
    <>
      <div style={{ minHeight:'100vh', background:T.bg, color:T.text, fontFamily:'Inter,Arial,sans-serif', paddingBottom:80 }}>
        <div style={{ background:T.header, padding:'20px 16px 24px' }}>
          <BackBtn onClick={goHome} />
          <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>📊 {CHILD.name}'s Grades</h1>
        </div>
        <div style={{ padding:'16px 10px' }}>
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:16, marginBottom:12, textAlign:'center' }}>
            <div style={{ fontSize:11, color:T.muted, marginBottom:4 }}>Overall GPA</div>
            <div style={{ fontSize:44, fontWeight:900, color:T.green }}>{CHILD.gpa}</div>
            <div style={{ fontSize:14, color:T.green, fontWeight:700 }}>B+ · Good Standing</div>
          </div>
          {CHILD.classes.map(c => (
            <div key={c.id} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:'14px 16px', marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:14 }}>{c.subject}</div>
                  <div style={{ fontSize:11, color:T.muted }}>{c.teacher} · {c.period} Period</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:11, color:c.trend==='up'?T.green:c.trend==='down'?T.red:T.muted }}>{c.trend==='up'?'↑':c.trend==='down'?'↓':'→'}</span>
                  <GradeBadge score={c.grade} />
                </div>
              </div>
              <GradeBar score={c.grade} />
              <button onClick={() => { setComposeTo(c.teacher); setComposing(true); setPage('messages'); setActiveNav('messages'); setMsgTab('private') }}
                style={{ marginTop:10, background:`${T.blue}22`, color:T.blue, border:'none', borderRadius:10, padding:'7px 14px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                💬 Message {c.teacher}
              </button>
            </div>
          ))}
        </div>
      </div>
      <BottomNav active={activeNav} onSelect={S} />
    </>
  )

  // ── Feed ─────────────────────────────────────────────────────────────────────
  if (page === 'feed') return (
    <>
      <div style={{ minHeight:'100vh', background:T.bg, color:T.text, fontFamily:'Inter,Arial,sans-serif', paddingBottom:80 }}>
        <div style={{ background:T.header, padding:'20px 16px 24px' }}>
          <BackBtn onClick={goHome} />
          <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>📢 Class Feed</h1>
        </div>
        <div style={{ padding:'16px 10px' }}>
          <p style={{ fontSize:12, color:T.muted, margin:'0 0 12px 6px' }}>Updates from {CHILD.name}'s teachers · React to show you've seen it</p>
          {CHILD.feed.map(post => (
            <div key={post.id} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:'14px 16px', marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontWeight:700, fontSize:13 }}>{post.author}</span>
                <span style={{ fontSize:10, color:T.muted }}>{post.time}</span>
              </div>
              <p style={{ fontSize:13, lineHeight:1.6, margin:'0 0 10px' }}>{post.content}</p>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {Object.entries(post.reactions).map(([emoji, count]) => (
                  <button key={emoji} onClick={() => react(post.id, emoji)}
                    style={{ background:myReactions[`${post.id}-${emoji}`]?`${T.primary}30`:T.inner, border:`1px solid ${myReactions[`${post.id}-${emoji}`]?T.primary:T.border}`, borderRadius:999, padding:'4px 10px', fontSize:12, color:T.text, cursor:'pointer' }}>
                    {emoji} {count + (myReactions[`${post.id}-${emoji}`]?1:0)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav active={activeNav} onSelect={S} />
    </>
  )

  // ── Calendar ─────────────────────────────────────────────────────────────────
  if (page === 'calendar') return (
    <>
      <div style={{ minHeight:'100vh', background:T.bg, color:T.text, fontFamily:'Inter,Arial,sans-serif', paddingBottom:80 }}>
        <div style={{ background:T.header, padding:'20px 16px 24px' }}>
          <BackBtn onClick={goHome} />
          <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>📅 {CHILD.name}'s Calendar</h1>
        </div>
        <div style={{ padding:'16px 10px' }}>
          <div style={{ fontSize:12, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10, paddingLeft:4 }}>Upcoming Assignments</div>
          {CHILD.assignments.map(a => (
            <div key={a.id} style={{ background:T.card, border:`1px solid ${a.status==='done'?T.green+'40':T.border}`, borderRadius:14, padding:'12px 16px', marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontWeight:700, fontSize:13 }}>{a.title}</div>
                <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>{a.subject}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:11, fontWeight:700, color:a.status==='done'?T.green:a.due==='Tomorrow'?T.red:T.amber }}>{a.due}</div>
                {a.status==='done' && <div style={{ fontSize:10, color:T.green }}>✓ Done</div>}
              </div>
            </div>
          ))}
          <div style={{ fontSize:12, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.06em', margin:'20px 0 10px', paddingLeft:4 }}>Alerts</div>
          {CHILD.alerts.map(a => (
            <div key={a.id} style={{ background:T.inner, border:`1px solid ${a.color}20`, borderRadius:12, padding:'10px 14px', marginBottom:8, borderLeft:`3px solid ${a.color}` }}>
              <div style={{ fontSize:12 }}>{a.msg}</div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav active={activeNav} onSelect={S} />
    </>
  )

  // ── Messages ─────────────────────────────────────────────────────────────────
  if (page === 'messages') {
    const currentMessages = msgTab === 'student' ? CHILD.teacherMessages : CHILD.privateMessages

    if (composing) return (
      <>
        <div style={{ minHeight:'100vh', background:T.bg, color:T.text, fontFamily:'Inter,Arial,sans-serif', paddingBottom:80 }}>
          <div style={{ background:T.header, padding:'20px 16px 24px' }}>
            <BackBtn onClick={() => setComposing(false)} />
            <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>✏️ New Private Message</h1>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.65)', marginTop:4 }}>🔒 Only you and the teacher will see this</div>
          </div>
          <div style={{ padding:'16px' }}>
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:16, marginBottom:12 }}>
              <div style={{ fontSize:11, color:T.muted, marginBottom:8, fontWeight:700 }}>SELECT TEACHER</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {CHILD.classes.map(c => (
                  <button key={c.id} onClick={() => setComposeTo(c.teacher)}
                    style={{ background:composeTo===c.teacher?T.primary:T.inner, color:composeTo===c.teacher?'#fff':T.text, border:`1px solid ${composeTo===c.teacher?T.primary:T.border}`, borderRadius:999, padding:'7px 16px', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                    {c.teacher}
                  </button>
                ))}
              </div>
            </div>
            <input value={draftSubj} onChange={e => setDraftSubj(e.target.value)} placeholder="Subject..."
              style={{ width:'100%', background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:'12px 14px', color:T.text, fontSize:13, marginBottom:10, boxSizing:'border-box', outline:'none' }} />
            <textarea rows={5} value={draftText} onChange={e => setDraftText(e.target.value)} placeholder="Write your message..."
              style={{ width:'100%', background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:'12px 14px', color:T.text, fontSize:13, resize:'none', boxSizing:'border-box', lineHeight:1.6, outline:'none' }} />
            {sent && <div style={{ background:'#0f2a1a', border:`1px solid ${T.green}40`, borderRadius:10, padding:'8px 12px', color:T.green, fontSize:13, margin:'10px 0' }}>✅ Message sent to {composeTo}!</div>}
            <div style={{ display:'flex', gap:8, marginTop:12 }}>
              <button onClick={sendMessage} style={{ flex:1, background:T.primary, color:'#fff', border:'none', borderRadius:999, padding:12, fontSize:14, fontWeight:700, cursor:'pointer' }}>Send</button>
              <button onClick={() => setComposing(false)} style={{ flex:1, background:T.inner, color:T.muted, border:'none', borderRadius:999, padding:12, fontSize:13, fontWeight:600, cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
        <BottomNav active={activeNav} onSelect={S} />
      </>
    )

    if (selectedMsg) return (
      <>
        <div style={{ minHeight:'100vh', background:T.bg, color:T.text, fontFamily:'Inter,Arial,sans-serif', paddingBottom:80 }}>
          <div style={{ background:T.header, padding:'20px 16px 24px' }}>
            <BackBtn onClick={() => setSelectedMsg(null)} />
            <h1 style={{ fontSize:18, fontWeight:800, color:'#fff', margin:0 }}>{selectedMsg.subject}</h1>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.65)', marginTop:4 }}>
              {msgTab==='private' ? '🔒 Private · Only you and the teacher see this' : `From ${selectedMsg.from}`}
            </div>
          </div>
          <div style={{ padding:'16px' }}>
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:16, marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ fontWeight:700, fontSize:13 }}>{selectedMsg.from}</span>
                <span style={{ fontSize:11, color:T.muted }}>{selectedMsg.time}</span>
              </div>
              <p style={{ fontSize:13, lineHeight:1.6, margin:0 }}>{selectedMsg.content}</p>
            </div>
            {msgTab==='private' && (
              <button onClick={() => { setComposeTo(selectedMsg.fromParent?null:selectedMsg.from); setComposing(true) }}
                style={{ width:'100%', background:T.primary, color:'#fff', border:'none', borderRadius:12, padding:12, fontSize:14, fontWeight:700, cursor:'pointer' }}>
                Reply
              </button>
            )}
          </div>
        </div>
        <BottomNav active={activeNav} onSelect={S} />
      </>
    )

    return (
      <>
        <div style={{ minHeight:'100vh', background:T.bg, color:T.text, fontFamily:'Inter,Arial,sans-serif', paddingBottom:80 }}>
          <div style={{ background:T.header, padding:'20px 16px 24px' }}>
            <BackBtn onClick={goHome} />
            <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>💬 Messages</h1>
          </div>
          <div style={{ padding:'12px 16px 0' }}>
            {/* Toggle */}
            <div style={{ background:T.inner, borderRadius:999, padding:3, display:'flex', marginBottom:12 }}>
              <button onClick={() => setMsgTab('student')}
                style={{ flex:1, background:msgTab==='student'?T.primary:'transparent', color:msgTab==='student'?'#fff':T.muted, border:'none', borderRadius:999, padding:'9px 0', fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}>
                👁 Student View
              </button>
              <button onClick={() => setMsgTab('private')}
                style={{ flex:1, background:msgTab==='private'?T.primary:'transparent', color:msgTab==='private'?'#fff':T.muted, border:'none', borderRadius:999, padding:'9px 0', fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}>
                🔒 Private w/ Teacher
              </button>
            </div>

            {msgTab==='private' && (
              <>
                <div style={{ background:`${T.red}12`, border:`1px solid ${T.red}30`, borderRadius:10, padding:'8px 12px', marginBottom:10, fontSize:11, color:T.red }}>
                  🔒 Private — Only you and the teacher see these messages
                </div>
                <button onClick={() => { setComposeTo(null); setComposing(true) }}
                  style={{ width:'100%', background:T.primary, color:'#fff', border:'none', borderRadius:12, padding:'11px 0', fontSize:13, fontWeight:700, cursor:'pointer', marginBottom:12 }}>
                  + New Private Message to Teacher
                </button>
              </>
            )}

            {msgTab==='student' && (
              <p style={{ fontSize:12, color:T.muted, marginBottom:12 }}>
                Messages between {CHILD.name}'s teachers and {CHILD.name}. You can read and react, but replies go through Private.
              </p>
            )}

            {currentMessages.map(m => (
              <div key={m.id} onClick={() => setSelectedMsg(m)}
                style={{ background:m.unread?`${T.primary}15`:T.card, border:`1px solid ${m.unread?T.primary+'50':T.border}`, borderRadius:14, padding:'12px 16px', marginBottom:8, cursor:'pointer' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                  <span style={{ fontWeight:700, fontSize:13 }}>{m.from}</span>
                  <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                    {m.unread && <span style={{ width:7, height:7, background:T.primary, borderRadius:'50%' }} />}
                    <span style={{ fontSize:10, color:T.muted }}>{m.time}</span>
                  </div>
                </div>
                <div style={{ fontSize:12, fontWeight:600, marginBottom:3 }}>{m.subject}</div>
                <p style={{ fontSize:11, color:T.muted, margin:0, lineHeight:1.4 }}>{m.content.substring(0,70)}...</p>
              </div>
            ))}
          </div>
        </div>
        <BottomNav active={activeNav} onSelect={S} />
      </>
    )
  }

  // ── Home ─────────────────────────────────────────────────────────────────────
  return (
    <>
      <div style={{ minHeight:'100vh', background:T.bg, color:T.text, fontFamily:'Inter,Arial,sans-serif', paddingBottom:80 }}>
        <div style={{ background:T.header, padding:'20px 16px 28px', marginBottom:12 }}>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.65)', marginBottom:2 }}>Parent Dashboard 👋</div>
          <div style={{ fontSize:22, fontWeight:800, color:'#fff', marginBottom:2 }}>Tracking {CHILD.name}'s Progress</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.65)' }}>{CHILD.grade} · {CHILD.school}</div>
        </div>

        {/* PW1: Daily Overview */}
        <Widget onClick={() => S('grades')} style={{ background:'linear-gradient(135deg,#C8102E,#8b0a1f)', border:'none' }}>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)', marginBottom:10 }}>MARCUS'S DAILY OVERVIEW</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6 }}>
            {[
              { icon:'📊', val:CHILD.gpa,              label:'GPA',      page:'grades'   },
              { icon:'📚', val:CHILD.classes.length,   label:'Classes',  page:'grades'   },
              { icon:'⚑',  val:CHILD.alerts.length,    label:'Alerts',   page:'calendar' },
              { icon:'💬', val:unreadCount,             label:'Messages', page:'messages' },
            ].map(t => (
              <button key={t.label} onClick={e => { e.stopPropagation(); S(t.page) }}
                style={{ background:'rgba(255,255,255,0.12)', borderRadius:13, padding:'10px 4px', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                <span style={{ fontSize:16 }}>{t.icon}</span>
                <span style={{ fontSize:16, fontWeight:800, color:'#fff', lineHeight:1 }}>{t.val}</span>
                <span style={{ fontSize:8, color:'rgba(255,255,255,0.6)', textAlign:'center' }}>{t.label}</span>
              </button>
            ))}
          </div>
        </Widget>

        {/* PW2: Today's Lessons */}
        <Widget onClick={() => S('calendar')} style={{ background:'linear-gradient(135deg,#2c000e,#1e0008)', border:`1px solid ${T.border}` }}>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:8 }}>TODAY'S LESSONS 📖</div>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>Ch.4 · Fractions &amp; Decimals · Math</div>
          <div style={{ fontSize:11, color:T.muted }}>Pages 84–91 · Ms. Johnson · Parent view of {CHILD.name}'s lessons</div>
        </Widget>

        {/* PW3: Marcus's Classes */}
        <Widget onClick={() => S('grades')} title={`📚 ${CHILD.name}'s Classes`}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {CHILD.classes.map(c => (
              <button key={c.id} onClick={e => { e.stopPropagation(); S('grades') }}
                style={{ background:T.inner, borderRadius:12, padding:'12px', border:`1px solid ${T.border}`, cursor:'pointer', textAlign:'left' }}>
                <div style={{ fontWeight:700, fontSize:12, marginBottom:2 }}>{c.subject}</div>
                <div style={{ fontSize:10, color:T.muted, marginBottom:6 }}>{c.teacher}</div>
                <div style={{ fontSize:20, fontWeight:800, color:gradeColor(c.grade) }}>{c.grade}%</div>
                <div style={{ fontSize:9, color:c.trend==='up'?T.green:c.trend==='down'?T.red:T.muted, marginTop:2 }}>
                  {c.trend==='up'?'↑ Improving':c.trend==='down'?'↓ Declining':'→ Stable'}
                </div>
              </button>
            ))}
          </div>
        </Widget>

        {/* PW4: Alerts */}
        <Widget onClick={() => S('calendar')} style={{ border:`1px solid rgba(245,166,35,0.2)` }}
          title="🔔 Alerts"
          titleRight={<span style={{ background:'rgba(245,166,35,0.15)', color:T.amber, fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:999 }}>{CHILD.alerts.length}</span>}>
          {CHILD.alerts.map(a => (
            <div key={a.id} style={{ background:T.inner, border:`1px solid ${a.color}20`, borderRadius:12, padding:'10px 12px', marginBottom:8, borderLeft:`3px solid ${a.color}` }}>
              <div style={{ fontSize:12 }}>{a.msg}</div>
            </div>
          ))}
        </Widget>

        {/* PW5: Messages */}
        <Widget onClick={() => S('messages')} title="💬 Messages"
          titleRight={unreadCount>0 && <span style={{ background:`rgba(200,16,46,0.2)`, color:T.primary, borderRadius:999, padding:'3px 8px', fontSize:10, fontWeight:700 }}>{unreadCount} new</span>}>
          <div style={{ background:T.inner, borderRadius:999, padding:3, display:'flex', marginBottom:10 }}>
            <div style={{ flex:1, background:T.primary, borderRadius:999, padding:'6px 0', fontSize:10, fontWeight:700, color:'#fff', textAlign:'center' }}>👁 Student View</div>
            <div style={{ flex:1, padding:'6px 0', fontSize:10, fontWeight:700, color:T.muted, textAlign:'center' }}>🔒 Private</div>
          </div>
          {CHILD.teacherMessages.slice(0,2).map(m => (
            <div key={m.id} style={{ background:m.unread?`${T.primary}12`:T.inner, borderRadius:12, padding:'10px 12px', marginBottom:6 }}>
              <div style={{ fontSize:12, fontWeight:700 }}>{m.from}</div>
              <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>{m.content.substring(0,55)}...</div>
            </div>
          ))}
          <Btn label="View all messages →" color={T.primary} onClick={() => S('messages')} />
        </Widget>

        {/* PW6: Class Feed */}
        <Widget onClick={() => S('feed')} title="📢 Class Feed"
          titleRight={<Btn label="View →" color={T.primary} onClick={() => S('feed')} />}>
          {CHILD.feed.slice(0,2).map(post => (
            <div key={post.id} style={{ background:T.inner, borderRadius:12, padding:'10px 12px', marginBottom:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:12, fontWeight:700 }}>{post.author}</span>
                <span style={{ fontSize:10, color:T.muted }}>{post.time}</span>
              </div>
              <div style={{ fontSize:11, color:T.muted, lineHeight:1.4 }}>{post.content.substring(0,60)}...</div>
            </div>
          ))}
        </Widget>

        {/* PW7: AI Tips — last */}
        <Widget style={{ background:`linear-gradient(135deg,rgba(200,16,46,0.12),rgba(44,0,14,0.8))`, border:`1px solid rgba(200,16,46,0.2)` }}>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:8 }}>✨ AI TIPS FOR PARENTS</div>
          <p style={{ fontSize:13, lineHeight:1.6, margin:'0 0 10px' }}>
            {CHILD.name} is doing well in Reading but could use extra support in Science. Try 10 minutes of review tonight using the class notes.
          </p>
          <Btn label="More tips" color={T.primary} onClick={() => {}} />
        </Widget>

      </div>
      <BottomNav active={activeNav} onSelect={S} />
    </>
  )
}
