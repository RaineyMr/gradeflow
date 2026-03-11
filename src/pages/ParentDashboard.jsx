import React, { useState } from 'react'
import { GradeBar, GradeBadge } from '../components/ui'

const T = { primary:'#C8102E', secondary:'#ffffff', bg:'#060810', card:'#161923', inner:'#1e2231', text:'#eef0f8', muted:'#6b7494', border:'#2a2f42', green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623', header:'linear-gradient(135deg,#C8102E,#8b0a1f)' }

const CHILD = { name:'Marcus', school:'Bellaire High School', grade:'3rd Grade', gpa:87.4, classes:[
  { id:1, subject:'Math',    teacher:'Ms. Johnson', grade:87, letter:'B', period:'1st', trend:'stable' },
  { id:2, subject:'Reading', teacher:'Ms. Davis',   grade:95, letter:'A', period:'2nd', trend:'up'     },
  { id:3, subject:'Science', teacher:'Mr. Lee',     grade:79, letter:'C', period:'3rd', trend:'down'   },
  { id:4, subject:'Writing', teacher:'Ms. Clark',   grade:88, letter:'B', period:'4th', trend:'stable' },
], messages:[
  { id:1, from:'Ms. Johnson', content:'Marcus showed excellent work on the fractions test today.', time:'2 hours ago', unread:true  },
  { id:2, from:'Mr. Lee',     content:'Reminder: Science fair project is due this Friday.',        time:'Yesterday',  unread:false },
], alerts:[
  { id:1, type:'grade',      msg:'Math grade dropped from 91% to 87% this week.',   color:'#f5a623' },
  { id:2, type:'attendance', msg:'Marcus was 5 minutes late on Monday.',             color:'#f04a4a' },
]}

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
  const items = [{ id:'home',label:'Home',icon:'🏠'},{ id:'grades',label:'Grades',icon:'📊'},{ id:'feed',label:'Feed',icon:'📢'},{ id:'messages',label:'Messages',icon:'💬'},{ id:'calendar',label:'Calendar',icon:'📅'}]
  return (
    <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:100, background:'rgba(10,12,18,0.97)', borderTop:`1px solid ${T.border}`, padding:'6px 0 max(16px,env(safe-area-inset-bottom))', display:'grid', gridTemplateColumns:`repeat(${items.length},1fr)` }}>
      {items.map(item => (
        <button key={item.id} onClick={() => onSelect(item.id)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'6px 2px' }}>
          <span style={{ fontSize:18 }}>{item.icon}</span>
          <span style={{ fontSize:9, color:item.id===active ? T.primary : T.muted, fontWeight:item.id===active?700:400 }}>{item.label}</span>
          {item.id===active && <div style={{ width:4, height:4, borderRadius:'50%', background:T.primary }} />}
        </button>
      ))}
    </div>
  )
}

export default function ParentDashboard({ currentUser }) {
  const [page,      setPage]      = useState('home')
  const [activeNav, setActiveNav] = useState('home')
  const [composeMsg, setComposeMsg] = useState(null)
  const [msgText,   setMsgText]   = useState('')
  const [msgSent,   setMsgSent]   = useState(false)

  function S(screen) { setPage(screen); setActiveNav(screen); window.scrollTo(0,0) }

  // ── Grades page ─────────────────────────────────────────────────────────────
  if (page === 'grades') return (
    <>
      <div style={{ minHeight:'100vh', background:T.bg, color:T.text, fontFamily:'Inter, Arial, sans-serif', paddingBottom:80 }}>
        <div style={{ background:T.header, padding:'20px 16px 24px' }}>
          <button onClick={() => S('home')} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:600, marginBottom:12 }}>← Back</button>
          <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>📊 {CHILD.name}'s Grades</h1>
        </div>
        <div style={{ padding:'16px 10px' }}>
          {/* Overall */}
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:'16px', marginBottom:12, textAlign:'center' }}>
            <div style={{ fontSize:11, color:T.muted, marginBottom:4 }}>Overall GPA</div>
            <div style={{ fontSize:44, fontWeight:900, color:T.green }}>{CHILD.gpa}</div>
            <div style={{ fontSize:14, color:T.green, fontWeight:700 }}>B+ · Good Standing</div>
          </div>
          {CHILD.classes.map(c => (
            <div key={c.id} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:'14px 16px', marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:14, color:T.text }}>{c.subject}</div>
                  <div style={{ fontSize:11, color:T.muted }}>{c.teacher} · {c.period} Period</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:10, color:c.trend==='up'?T.green:c.trend==='down'?T.red:T.muted }}>{c.trend==='up'?'↑':c.trend==='down'?'↓':'→'}</span>
                  <GradeBadge score={c.grade} />
                </div>
              </div>
              <GradeBar score={c.grade} />
              <button onClick={() => setComposeMsg(c.teacher)} style={{ marginTop:10, background:`${T.blue}22`, color:T.blue, border:'none', borderRadius:10, padding:'7px 14px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                💬 Message {c.teacher}
              </button>
            </div>
          ))}
        </div>
      </div>
      <BottomNav active={activeNav} onSelect={S} />
      {composeMsg && (
        <div style={{ position:'fixed', inset:0, zIndex:2000, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:'22px 22px 0 0', padding:20, width:'100%', maxWidth:480 }}>
            <h3 style={{ margin:'0 0 14px', color:T.text, fontSize:15 }}>Message {composeMsg}</h3>
            <textarea rows={4} value={msgText} onChange={e => setMsgText(e.target.value)} placeholder="Write your message..."
              style={{ width:'100%', background:T.inner, border:`1px solid ${T.border}`, borderRadius:12, padding:'12px 14px', color:T.text, fontSize:13, resize:'none', boxSizing:'border-box', lineHeight:1.6 }} />
            {msgSent && <div style={{ background:'#0f2a1a', border:`1px solid ${T.green}40`, borderRadius:10, padding:'8px 12px', color:T.green, fontSize:13, margin:'10px 0' }}>✅ Message sent!</div>}
            <div style={{ display:'flex', gap:8, marginTop:10 }}>
              <button onClick={() => { setMsgSent(true); setTimeout(() => { setComposeMsg(null); setMsgSent(false); setMsgText('') }, 1500) }}
                style={{ flex:1, background:T.primary, color:'#fff', border:'none', borderRadius:999, padding:'12px', fontSize:14, fontWeight:700, cursor:'pointer' }}>Send</button>
              <button onClick={() => setComposeMsg(null)} style={{ flex:1, background:T.inner, color:T.muted, border:'none', borderRadius:999, padding:'12px', fontSize:13, fontWeight:600, cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )

  if (page === 'messages') return (
    <>
      <div style={{ minHeight:'100vh', background:T.bg, color:T.text, fontFamily:'Inter, Arial, sans-serif', paddingBottom:80 }}>
        <div style={{ background:T.header, padding:'20px 16px 24px' }}>
          <button onClick={() => S('home')} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:600, marginBottom:12 }}>← Back</button>
          <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>💬 Messages</h1>
        </div>
        <div style={{ padding:'16px 10px' }}>
          {CHILD.messages.map(m => (
            <div key={m.id} style={{ background:m.unread?'#1a1800':T.card, border:`1px solid ${m.unread?T.amber:T.border}30`, borderRadius:16, padding:'14px 16px', marginBottom:10, cursor:'pointer' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                <span style={{ fontWeight:700, fontSize:13, color:T.text }}>{m.from}</span>
                <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                  {m.unread && <span style={{ width:8, height:8, background:T.amber, borderRadius:'50%' }} />}
                  <span style={{ fontSize:10, color:T.muted }}>{m.time}</span>
                </div>
              </div>
              <p style={{ fontSize:12, color:'#c0c8e0', margin:'0 0 8px', lineHeight:1.5 }}>{m.content}</p>
              <button style={{ background:`${T.blue}22`, color:T.blue, border:'none', borderRadius:8, padding:'5px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>Reply</button>
            </div>
          ))}
        </div>
      </div>
      <BottomNav active={activeNav} onSelect={S} />
    </>
  )

  // ── Home ────────────────────────────────────────────────────────────────────
  return (
    <>
      <div style={{ minHeight:'100vh', background:T.bg, color:T.text, fontFamily:'Inter, Arial, sans-serif', paddingBottom:80 }}>
        <div style={{ background:T.header, padding:'20px 16px 28px', marginBottom:16 }}>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)', marginBottom:4 }}>Parent Dashboard 👋</div>
          <div style={{ fontSize:22, fontWeight:800, color:'#fff', marginBottom:4 }}>Tracking {CHILD.name}'s Progress</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)' }}>{CHILD.grade} · {CHILD.school}</div>
        </div>

        {/* PW1: Daily Overview */}
        <Widget onClick={() => S('grades')} style={{ background:'linear-gradient(135deg,#1d4ed8,#6d28d9)', border:'none' }}>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)', marginBottom:10 }}>DAILY OVERVIEW</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6 }}>
            {[{ icon:'📊', val:CHILD.gpa, label:'GPA', page:'grades' },{ icon:'📚', val:CHILD.classes.length, label:'Classes', page:'grades' },{ icon:'🔔', val:CHILD.alerts.length, label:'Alerts', page:'grades' },{ icon:'💬', val:CHILD.messages.filter(m=>m.unread).length, label:'Messages', page:'messages' }].map(t => (
              <button key={t.label} onClick={e => { e.stopPropagation(); S(t.page) }}
                style={{ background:'rgba(255,255,255,0.11)', borderRadius:13, padding:'10px 4px', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                <span style={{ fontSize:16 }}>{t.icon}</span>
                <span style={{ fontSize:16, fontWeight:800, color:'#fff', lineHeight:1 }}>{t.val}</span>
                <span style={{ fontSize:8, color:'rgba(255,255,255,0.6)', textAlign:'center' }}>{t.label}</span>
              </button>
            ))}
          </div>
        </Widget>

        {/* PW2: Marcus's Classes */}
        <Widget onClick={() => S('grades')} title={`📚 ${CHILD.name}'s Classes`}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {CHILD.classes.map(c => (
              <button key={c.id} onClick={e => { e.stopPropagation(); S('grades') }}
                style={{ background:T.inner, borderRadius:12, padding:'12px', border:`1px solid ${T.border}`, cursor:'pointer', textAlign:'left' }}>
                <div style={{ fontWeight:700, fontSize:12, color:T.text, marginBottom:2 }}>{c.subject}</div>
                <div style={{ fontSize:10, color:T.muted, marginBottom:6 }}>{c.teacher}</div>
                <div style={{ fontSize:20, fontWeight:800, color:c.grade>=90?T.green:c.grade>=80?T.blue:T.amber }}>{c.grade}%</div>
              </button>
            ))}
          </div>
        </Widget>

        {/* PW3: Alerts */}
        <Widget onClick={() => S('grades')} style={{ border:`1px solid rgba(245,166,35,0.2)` }}
          title="🔔 Alerts"
          titleRight={<span style={{ background:'rgba(245,166,35,0.15)', color:T.amber, fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:999 }}>{CHILD.alerts.length}</span>}>
          {CHILD.alerts.map(a => (
            <div key={a.id} style={{ background:T.inner, border:`1px solid ${a.color}20`, borderRadius:12, padding:'10px 12px', marginBottom:8, borderLeft:`3px solid ${a.color}` }}>
              <div style={{ fontSize:12, color:T.text }}>{a.msg}</div>
            </div>
          ))}
        </Widget>

        {/* PW4: Messages */}
        <Widget onClick={() => S('messages')} title="💬 Teacher Messages"
          titleRight={<span style={{ background:'rgba(245,166,35,0.2)', color:T.amber, borderRadius:999, padding:'3px 8px', fontSize:10, fontWeight:700 }}>
            {CHILD.messages.filter(m=>m.unread).length} new
          </span>}>
          {CHILD.messages.slice(0,2).map(m => (
            <div key={m.id} style={{ background:m.unread?'#1a1800':T.inner, borderRadius:12, padding:'10px 12px', marginBottom:8 }}>
              <div style={{ fontSize:12, fontWeight:700, color:T.text }}>{m.from}</div>
              <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>{m.content.substring(0,55)}...</div>
            </div>
          ))}
          <Btn label="Reply to teacher" color={T.blue} onClick={() => S('messages')} />
        </Widget>

        {/* PW5: AI Tips */}
        <Widget onClick={() => {}} style={{ background:'linear-gradient(135deg,rgba(200,16,46,0.15),rgba(15,184,160,0.1))', border:`1px solid rgba(200,16,46,0.2)` }}>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)', marginBottom:8 }}>✨ AI TIPS FOR PARENTS</div>
          <p style={{ fontSize:13, color:T.text, lineHeight:1.6, margin:'0 0 10px' }}>
            Marcus is doing well in Reading but could use extra support in Math. Try 10 minutes of fraction practice after dinner using everyday objects.
          </p>
          <Btn label="More tips" color="#9b6ef5" onClick={() => {}} />
        </Widget>
      </div>
      <BottomNav active={activeNav} onSelect={S} />
    </>
  )
}
