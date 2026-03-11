import React, { useState } from 'react'
import { GradeBar, GradeBadge } from '../components/ui'

const THEME = { primary:'#003057', secondary:'#B3A369', bg:'#060810', card:'#161923', inner:'#1e2231', text:'#eef0f8', muted:'#6b7494', border:'#2a2f42', green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623', header:'linear-gradient(135deg,#003057 0%,#B3A369 100%)' }

const STUDENT = { name:'Marcus', fullName:'Marcus Thompson', grade:'3rd Grade', school:'Lincoln Elementary', gpa:87.4, classes:[
  { id:1, subject:'Math',    teacher:'Ms. Johnson', grade:87, letter:'B', period:'1st' },
  { id:2, subject:'Reading', teacher:'Ms. Davis',   grade:95, letter:'A', period:'2nd' },
  { id:3, subject:'Science', teacher:'Mr. Lee',     grade:79, letter:'C', period:'3rd' },
  { id:4, subject:'Writing', teacher:'Ms. Clark',   grade:88, letter:'B', period:'4th' },
], assignments:[
  { id:1, name:'Ch.4 Worksheet', subject:'Math',    due:'Today',     status:'pending' },
  { id:2, name:'Book Report',    subject:'Reading',  due:'Tomorrow',  status:'pending' },
  { id:3, name:'Lab Report',     subject:'Science',  due:'Friday',    status:'submitted' },
], messages:[
  { id:1, from:'Ms. Johnson', content:'Great work on yesterday\'s quiz, Marcus!', time:'1 hr ago', unread:true },
  { id:2, from:'Mr. Lee',     content:'Reminder: Science fair project due Friday.', time:'Yesterday', unread:false },
]}

function Btn({ label, color, onClick }) {
  return (
    <button onClick={e => { e.stopPropagation(); onClick?.() }}
      style={{ background:`${color}22`, color, border:'none', borderRadius:999, padding:'6px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
      {label}
    </button>
  )
}

export default function StudentDashboard({ currentUser }) {
  const [page, setPage]   = useState('home')
  const [activeNav, setActiveNav] = useState('home')

  function S(screen) { setPage(screen); setActiveNav(screen); window.scrollTo(0,0) }

  const navItems = [
    { id:'home',    icon:'🏠', label:'Home'     },
    { id:'grades',  icon:'📊', label:'Grades'   },
    { id:'feed',    icon:'📢', label:'Feed'     },
    { id:'messages',icon:'💬', label:'Messages' },
    { id:'calendar',icon:'📅', label:'Calendar' },
  ]

  // ── Sub pages ──────────────────────────────────────────────────────────────
  if (page === 'grades') return (
    <>
      <div style={{ minHeight:'100vh', background:THEME.bg, color:THEME.text, fontFamily:'Inter, Arial, sans-serif', paddingBottom:80 }}>
        <div style={{ background:THEME.header, padding:'20px 16px 24px' }}>
          <button onClick={() => S('home')} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:600, marginBottom:12 }}>← Back</button>
          <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>📊 My Grades</h1>
        </div>
        <div style={{ padding:'16px 10px' }}>
          {STUDENT.classes.map(c => (
            <div key={c.id} style={{ background:THEME.card, border:`1px solid ${THEME.border}`, borderRadius:16, padding:'14px 16px', marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:14, color:THEME.text }}>{c.subject}</div>
                  <div style={{ fontSize:11, color:THEME.muted }}>{c.teacher} · {c.period} Period</div>
                </div>
                <GradeBadge score={c.grade} />
              </div>
              <GradeBar score={c.grade} />
            </div>
          ))}
        </div>
      </div>
      <BottomNav items={navItems} active={activeNav} onSelect={S} theme={THEME} />
    </>
  )

  if (page === 'messages') return (
    <>
      <div style={{ minHeight:'100vh', background:THEME.bg, color:THEME.text, fontFamily:'Inter, Arial, sans-serif', paddingBottom:80 }}>
        <div style={{ background:THEME.header, padding:'20px 16px 24px' }}>
          <button onClick={() => S('home')} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:600, marginBottom:12 }}>← Back</button>
          <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>💬 Messages</h1>
        </div>
        <div style={{ padding:'16px 10px' }}>
          {STUDENT.messages.map(m => (
            <div key={m.id} style={{ background: m.unread ? '#1a1800' : THEME.card, border:`1px solid ${m.unread ? THEME.amber : THEME.border}30`, borderRadius:16, padding:'14px 16px', marginBottom:10, cursor:'pointer' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                <span style={{ fontWeight:700, fontSize:13, color:THEME.text }}>{m.from}</span>
                <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                  {m.unread && <span style={{ width:8, height:8, background:THEME.amber, borderRadius:'50%', display:'inline-block' }} />}
                  <span style={{ fontSize:10, color:THEME.muted }}>{m.time}</span>
                </div>
              </div>
              <p style={{ fontSize:12, color:'#c0c8e0', margin:0, lineHeight:1.5 }}>{m.content}</p>
            </div>
          ))}
        </div>
      </div>
      <BottomNav items={navItems} active={activeNav} onSelect={S} theme={THEME} />
    </>
  )

  if (page === 'assignments') return (
    <>
      <div style={{ minHeight:'100vh', background:THEME.bg, color:THEME.text, fontFamily:'Inter, Arial, sans-serif', paddingBottom:80 }}>
        <div style={{ background:THEME.header, padding:'20px 16px 24px' }}>
          <button onClick={() => S('home')} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:600, marginBottom:12 }}>← Back</button>
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
                  background: a.status==='submitted' ? 'rgba(34,201,122,0.15)' : 'rgba(245,166,35,0.15)',
                  color:      a.status==='submitted' ? THEME.green : THEME.amber }}>
                  {a.status==='submitted' ? '✓ Submitted' : 'Pending'}
                </span>
              </div>
              {a.status === 'pending' && (
                <button style={{ marginTop:10, background:'var(--school-color,#003057)', color:'#fff', border:'none', borderRadius:10, padding:'8px 16px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                  📤 Submit Work
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <BottomNav items={navItems} active={activeNav} onSelect={S} theme={THEME} />
    </>
  )

  if (page === 'feed') return (
    <>
      <div style={{ minHeight:'100vh', background:THEME.bg, color:THEME.text, fontFamily:'Inter, Arial, sans-serif', paddingBottom:80 }}>
        <div style={{ background:THEME.header, padding:'20px 16px 24px' }}>
          <button onClick={() => S('home')} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:600, marginBottom:12 }}>← Back</button>
          <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>📢 Class Feed</h1>
        </div>
        <div style={{ padding:'16px 10px' }}>
          {[
            { id:1, author:'Ms. Johnson', content:'📅 Unit Test Friday! Review chapters 3-4. Study guide posted below.', time:'2 hours ago' },
            { id:2, author:'Ms. Johnson', content:'🎉 Great work on yesterday\'s homework! Class average was 87%.', time:'Yesterday' },
          ].map(post => (
            <div key={post.id} style={{ background:THEME.card, border:`1px solid ${THEME.border}`, borderRadius:16, padding:'14px 16px', marginBottom:10 }}>
              <div style={{ fontWeight:700, fontSize:13, color:THEME.text, marginBottom:4 }}>{post.author}</div>
              <p style={{ fontSize:13, color:'#c0c8e0', lineHeight:1.6, margin:'0 0 6px' }}>{post.content}</p>
              <div style={{ fontSize:10, color:THEME.muted }}>{post.time}</div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav items={navItems} active={activeNav} onSelect={S} theme={THEME} />
    </>
  )

  if (page === 'calendar') return (
    <>
      <div style={{ minHeight:'100vh', background:THEME.bg, color:THEME.text, fontFamily:'Inter, Arial, sans-serif', paddingBottom:80 }}>
        <div style={{ background:THEME.header, padding:'20px 16px 24px' }}>
          <button onClick={() => S('home')} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:600, marginBottom:12 }}>← Back</button>
          <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>📅 Calendar</h1>
        </div>
        <div style={{ padding:'16px 10px' }}>
          {[
            { id:1, title:'Ch.4 Worksheet Due',  subject:'Math',    due:'Today',     color:THEME.amber },
            { id:2, title:'Book Report Due',       subject:'Reading', due:'Tomorrow',  color:THEME.amber },
            { id:3, title:'Unit Test',             subject:'Math',    due:'Friday',    color:THEME.red   },
            { id:4, title:'Science Fair Project',  subject:'Science', due:'Next Week', color:THEME.blue  },
          ].map(event => (
            <div key={event.id} style={{ background:THEME.card, border:`1px solid ${THEME.border}`, borderLeft:`3px solid ${event.color}`, borderRadius:16, padding:'14px 16px', marginBottom:10 }}>
              <div style={{ fontWeight:700, fontSize:13, color:THEME.text, marginBottom:2 }}>{event.title}</div>
              <div style={{ fontSize:11, color:THEME.muted }}>{event.subject} · Due: {event.due}</div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav items={navItems} active={activeNav} onSelect={S} theme={THEME} />
    </>
  )
  return (
    <>
      <div style={{ minHeight:'100vh', background:THEME.bg, color:THEME.text, fontFamily:'Inter, Arial, sans-serif', paddingBottom:80 }}>
        {/* Header */}
        <div style={{ background:THEME.header, padding:'20px 16px 28px', marginBottom:16 }}>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)', marginBottom:4 }}>Good Morning! 🌟</div>
          <div style={{ fontSize:24, fontWeight:800, color:'#fff', marginBottom:4 }}>Hi, {STUDENT.name}! 👋</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)' }}>{STUDENT.grade} · {STUDENT.school}</div>
        </div>

        {/* SW1: Daily Overview */}
        <Widget onClick={() => S('grades')} style={{ background:'linear-gradient(135deg,#1d4ed8,#6d28d9)', border:'none' }}>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)', marginBottom:10 }}>DAILY OVERVIEW</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6 }}>
            {[{ icon:'📊', val:STUDENT.gpa, label:'GPA', page:'grades' },{ icon:'📚', val:STUDENT.classes.length, label:'Classes', page:'grades' },{ icon:'📋', val:STUDENT.assignments.filter(a=>a.status==='pending').length, label:'Assignments', page:'assignments' },{ icon:'🔔', val:2, label:'Updates', page:'messages' }].map(t => (
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
        <Widget onClick={() => S('grades')} style={{ background:'linear-gradient(135deg,#064e3b,#1e3a5f)', border:'1px solid #1a3a2a' }}>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)', marginBottom:8 }}>TODAY'S LESSONS 📖</div>
          <div style={{ fontSize:15, fontWeight:700, color:THEME.text, marginBottom:4 }}>Ch.4 · Fractions & Decimals</div>
          <div style={{ fontSize:11, color:THEME.muted, marginBottom:10 }}>Math · Pages 84–91 · Ms. Johnson · Based on teacher plan</div>
          <Btn label="View Worksheet 📄" color={THEME.blue} onClick={() => S('grades')} />
        </Widget>

        {/* SW3: My Classes */}
        <Widget onClick={() => S('grades')} title="My Classes">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {STUDENT.classes.map(c => (
              <button key={c.id} onClick={e => { e.stopPropagation(); S('grades') }}
                style={{ background:THEME.inner, borderRadius:12, padding:'12px', border:`1px solid ${THEME.border}`, cursor:'pointer', textAlign:'left' }}>
                <div style={{ fontWeight:700, fontSize:12, color:THEME.text, marginBottom:2 }}>{c.subject}</div>
                <div style={{ fontSize:10, color:THEME.muted, marginBottom:6 }}>{c.teacher}</div>
                <div style={{ fontSize:20, fontWeight:800, color:c.grade>=90?THEME.green:c.grade>=80?THEME.blue:THEME.amber }}>{c.grade}%</div>
              </button>
            ))}
          </div>
        </Widget>

        {/* SW4: Assignments */}
        <Widget onClick={() => S('assignments')} title="📋 Assignments"
          titleRight={<span style={{ fontSize:11, color:THEME.amber, fontWeight:700 }}>{STUDENT.assignments.filter(a=>a.status==='pending').length} due</span>}>
          {STUDENT.assignments.slice(0,3).map(a => (
            <div key={a.id} style={{ background:THEME.inner, borderRadius:12, padding:'10px 12px', marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:THEME.text }}>{a.name}</div>
                <div style={{ fontSize:10, color:THEME.muted }}>{a.subject} · Due: {a.due}</div>
              </div>
              <span style={{ fontSize:9, fontWeight:700, padding:'3px 8px', borderRadius:999,
                background: a.status==='submitted' ? 'rgba(34,201,122,0.15)' : 'rgba(245,166,35,0.15)',
                color:      a.status==='submitted' ? THEME.green : THEME.amber }}>
                {a.status==='submitted' ? '✓' : 'Pending'}
              </span>
            </div>
          ))}
          <Btn label="📤 Submit Work" color={THEME.blue} onClick={() => S('assignments')} />
        </Widget>

        {/* SW5: Messages */}
        <Widget onClick={() => S('messages')} title="💬 Messages"
          titleRight={<span style={{ background:'rgba(245,166,35,0.2)', color:THEME.amber, borderRadius:999, padding:'3px 8px', fontSize:10, fontWeight:700 }}>2 new</span>}>
          {STUDENT.messages.slice(0,2).map(m => (
            <div key={m.id} style={{ background: m.unread ? '#1a1800' : THEME.inner, borderRadius:12, padding:'10px 12px', marginBottom:8 }}>
              <div style={{ fontSize:12, fontWeight:700, color:THEME.text }}>{m.from}</div>
              <div style={{ fontSize:11, color:THEME.muted, marginTop:2 }}>{m.content.substring(0,50)}...</div>
            </div>
          ))}
        </Widget>

        {/* SW6: AI Study Tips */}
        <Widget onClick={() => {}} style={{ background:'linear-gradient(135deg,rgba(70,29,124,0.3),rgba(15,184,160,0.2))', border:`1px solid rgba(155,110,245,0.2)` }}>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)', marginBottom:8 }}>✨ AI STUDY TIPS</div>
          <p style={{ fontSize:13, color:THEME.text, lineHeight:1.6, margin:'0 0 10px' }}>
            You're doing great in Reading! For Math, try reviewing fractions flashcards for 15 minutes daily.
          </p>
          <Btn label="Get personalized tips" color="#9b6ef5" onClick={() => {}} />
        </Widget>
      </div>
      <BottomNav items={navItems} active={activeNav} onSelect={S} theme={THEME} />
    </>
  )
}

function Widget({ onClick, children, style, title, titleRight }) {
  return (
    <div onClick={onClick} style={{ background:THEME.card, border:`1px solid ${THEME.border}`, borderRadius:20, padding:'14px 16px', margin:'0 10px 12px', cursor:onClick?'pointer':'default', transition:'transform 0.15s', ...style }}
      onMouseEnter={e => onClick && (e.currentTarget.style.transform='scale(1.005)')}
      onMouseLeave={e => (e.currentTarget.style.transform='scale(1)')}>
      {(title || titleRight) && (
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          {title && <span style={{ fontSize:13, fontWeight:700, color:THEME.text }}>{title}</span>}
          {titleRight}
        </div>
      )}
      {children}
    </div>
  )
}

function BottomNav({ items, active, onSelect, theme }) {
  return (
    <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:100, background:'rgba(10,12,18,0.97)', borderTop:`1px solid ${theme.border}`, padding:'6px 0 max(16px, env(safe-area-inset-bottom))', display:'grid', gridTemplateColumns:`repeat(${items.length},1fr)` }}>
      {items.map(item => (
        <button key={item.id} onClick={() => onSelect(item.id)}
          style={{ background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'6px 2px' }}>
          <span style={{ fontSize:18 }}>{item.icon}</span>
          <span style={{ fontSize:9, color: item.id===active ? theme.secondary : theme.muted, fontWeight: item.id===active ? 700 : 400 }}>{item.label}</span>
          {item.id===active && <div style={{ width:4, height:4, borderRadius:'50%', background:theme.secondary }} />}
        </button>
      ))}
    </div>
  )
}
