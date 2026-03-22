import React, { useState, useEffect } from 'react'
import ClassFeed from './ClassFeed'
import ParentMessages from './ParentMessages'

const T = {
  primary:   '#003057',
  secondary: '#B3A369',
  bg:        '#000d1f',
  card:      '#001830',
  inner:     '#002040',
  raised:    '#002a52',
  text:      '#e8f0ff',
  soft:      '#b0c4e8',
  muted:     '#5a7aa0',
  border:    '#003a6a',
  green:     '#22c97a',
  blue:      '#B3A369',
  red:       '#f04a4a',
  amber:     '#f5a623',
  teal:      '#0fb8a0',
  purple:    '#9b6ef5',
  header:    'linear-gradient(135deg, #003057 0%, #001830 100%)',
}

const CHILD = {
  name:'Marcus', fullName:'Marcus Thompson',
  grade:'3rd Grade', school:'Houston ISD · Lincoln Elementary',
  gpa:87.4,
  classes:[
    { id:1, subject:'Math',    teacher:'Ms. Johnson', grade:87, letter:'B', period:'1st', color:'#3b7ef4' },
    { id:2, subject:'Reading', teacher:'Ms. Davis',   grade:95, letter:'A', period:'2nd', color:'#22c97a' },
    { id:3, subject:'Science', teacher:'Mr. Lee',     grade:61, letter:'D', period:'3rd', color:'#f04a4a' },
    { id:4, subject:'Writing', teacher:'Ms. Clark',   grade:88, letter:'B', period:'4th', color:'#f54a7a' },
  ],
  alerts:[
    { id:1, msg:"Marcus's Science grade is 61% — below passing", color:'#f04a4a', icon:'⚑' },
    { id:2, msg:"2 assignments due this week for Marcus",         color:'#f5a623', icon:'📋' },
  ],
  assignments:[
    { id:1, name:'Ch.4 Worksheet', subject:'Math',   due:'Today',    status:'pending'   },
    { id:2, name:'Book Report',    subject:'Reading', due:'Tomorrow', status:'pending'   },
    { id:3, name:'Lab Report',     subject:'Science', due:'Friday',   status:'submitted' },
  ],
}

// Minimal data for the home widget preview only — full data lives in ParentMessages.jsx
const PREVIEW_THREADS = [
  { id:1, from:'Ms. Johnson', avatar:'👩‍🏫', unread:true, private:true,
    messages:[{ text:"He has a test on Friday — please remind him to review chapters 3 & 4.", time:'30 min ago' }] },
]

function gradeColor(g) { return g>=90?T.green:g>=80?T.blue:g>=70?T.amber:T.red }

function Widget({ onClick, children, style={} }) {
  return (
    <div onClick={onClick} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:16, marginBottom:12, cursor:onClick?'pointer':'default', transition:'border-color 0.15s', ...style }}
      onMouseEnter={e=>{ if(onClick) e.currentTarget.style.borderColor=T.secondary }}
      onMouseLeave={e=>{ e.currentTarget.style.borderColor = style.borderColor||T.border }}>
      {children}
    </div>
  )
}

function Btn({ label, color, onClick, style={} }) {
  return (
    <button onClick={e=>{ e.stopPropagation(); onClick?.() }}
      style={{ background:`${color}22`, color, border:`1px solid ${color}40`, borderRadius:10, padding:'7px 13px', fontSize:11, fontWeight:700, cursor:'pointer', ...style }}>
      {label}
    </button>
  )
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
// Home: Grades · Messages · 🏠 Home (center) · Feed · 🔔 Alerts
// Sub:  ← Back · Grades · Messages · Feed · 🔔 Alerts
function BottomNav({ active, onSelect, isSubPage }) {
  const homeItems = [
    { id:'grades',   icon:'📊', label:'Grades'   },
    { id:'messages', icon:'💬', label:'Messages' },
    { id:'home',     icon:'🏠', label:'Home'     },
    { id:'feed',     icon:'📢', label:'Feed'     },
    { id:'alerts',   icon:'🔔', label:'Alerts'   },
  ]
  const subItems = [
    { id:'__back__', icon:'←',  label:'Back'     },
    { id:'grades',   icon:'📊', label:'Grades'   },
    { id:'messages', icon:'💬', label:'Messages' },
    { id:'feed',     icon:'📢', label:'Feed'     },
    { id:'alerts',   icon:'🔔', label:'Alerts'   },
  ]
  const items = isSubPage ? subItems : homeItems
  return (
    <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:200, background:'rgba(0,13,31,0.97)', backdropFilter:'blur(20px)', borderTop:`1px solid ${T.border}`, padding:'8px 0 max(14px,env(safe-area-inset-bottom))', display:'grid', gridTemplateColumns:`repeat(${items.length},1fr)` }}>
      {items.map(item=>{
        const isActive = item.id===active && item.id!=='__back__'
        return (
          <button key={item.id} onClick={()=>onSelect(item.id)}
            style={{ background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'5px 2px', position:'relative' }}>
            <span style={{ fontSize:item.id==='__back__'?20:18, transition:'transform 0.15s', transform:isActive?'scale(1.15)':'scale(1)', color:item.id==='__back__'?T.soft:'inherit' }}>{item.icon}</span>
            <span style={{ fontSize:9, fontWeight:isActive?700:400, color:isActive?T.secondary:T.muted }}>{item.label}</span>
            {isActive && <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:24, height:2, background:T.secondary, borderRadius:1 }}/>}
          </button>
        )
      })}
    </div>
  )
}

// ─── ADD WIDGETS BAR ──────────────────────────────────────────────────────────
function AddWidgetsBar() {
  const [open, setOpen] = useState(false)
  const WIDGETS = [
    { icon:'📊', name:'Daily Overview'   }, { icon:'📖', name:"Today's Lessons" },
    { icon:'📚', name:"Marcus's Classes" }, { icon:'⚑',  name:'Needs Attention' },
    { icon:'💬', name:'Messages'         }, { icon:'📢', name:'Class Feed'       },
    { icon:'✨', name:'AI Tips'          }, { icon:'📅', name:'Calendar'         },
  ]
  return (
    <div style={{ margin:'8px 12px 0', marginBottom:open?12:24 }}>
      {open ? (
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:700, color:T.text }}>＋ Widget Library</div>
            <button onClick={()=>setOpen(false)} style={{ background:T.inner, border:'none', borderRadius:8, padding:'5px 10px', color:T.muted, cursor:'pointer', fontSize:13 }}>✕</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
            {WIDGETS.map(w=>(
              <button key={w.name} style={{ background:T.inner, border:`1px solid ${T.border}`, borderRadius:12, padding:'10px 6px', cursor:'pointer', textAlign:'center' }}
                onMouseEnter={e=>(e.currentTarget.style.borderColor=T.secondary)}
                onMouseLeave={e=>(e.currentTarget.style.borderColor=T.border)}>
                <div style={{ fontSize:20, marginBottom:4 }}>{w.icon}</div>
                <div style={{ fontSize:9, color:T.muted, fontWeight:600 }}>{w.name}</div>
              </button>
            ))}
          </div>
          <div style={{ fontSize:10, color:T.muted, textAlign:'center', marginTop:12 }}>Drag · Resize · Save to account</div>
        </div>
      ) : (
        <button onClick={()=>setOpen(true)}
          style={{ width:'100%', background:T.inner, border:`1px dashed ${T.border}`, borderRadius:14, padding:'10px', color:T.muted, cursor:'pointer', fontSize:12, fontWeight:600 }}>
          ＋ Add Widgets
        </button>
      )}
    </div>
  )
}

function GradesPage({ onBack }) {
  return (
    <div style={{ minHeight:'100vh', background:T.bg, color:T.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", paddingBottom:80 }}>
      <div style={{ background:T.header, padding:'16px 16px 20px' }}>
        <button onClick={onBack} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:12 }}>← Back</button>
        <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>📊 Marcus's Grades</h1>
      </div>
      <div style={{ padding:'16px' }}>
        {CHILD.classes.map(c=>(
          <div key={c.id} style={{ background:T.card, border:`1px solid ${T.border}`, borderLeft:`4px solid ${c.color}`, borderRadius:16, padding:'14px 16px', marginBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:T.text }}>{c.subject}</div>
                <div style={{ fontSize:11, color:T.muted }}>{c.teacher} · {c.period} Period</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:20, fontWeight:900, color:gradeColor(c.grade) }}>{c.grade}%</div>
                <div style={{ fontSize:11, fontWeight:700, color:gradeColor(c.grade) }}>{c.letter}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── ALERTS PAGE ──────────────────────────────────────────────────────────────
function AlertsPage({ onBack }) {
  return (
    <div style={{ minHeight:'100vh', background:T.bg, color:T.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", paddingBottom:80 }}>
      <div style={{ background:T.header, padding:'16px 16px 20px' }}>
        <button onClick={onBack} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:12 }}>← Back</button>
        <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>🔔 Alerts</h1>
      </div>
      <div style={{ padding:'16px' }}>
        {CHILD.alerts.map(a=>(
          <div key={a.id} style={{ background:T.card, border:`1px solid ${a.color}30`, borderLeft:`4px solid ${a.color}`, borderRadius:14, padding:'14px 16px', marginBottom:10 }}>
            <div style={{ fontSize:20, marginBottom:6 }}>{a.icon}</div>
            <div style={{ fontSize:13, color:T.text }}>{a.msg}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ navigate, childName }) {
  const unreadCount  = PREVIEW_THREADS.filter(t=>t.unread&&t.private).length
  const pendingCount = CHILD.assignments.filter(a=>a.status==='pending').length

  const overviewTiles = [
    { icon:'📊', val:CHILD.gpa,               label:'GPA',         page:'grades',   color:T.secondary },
    { icon:'💬', val:unreadCount||'',          label:'Messages',    page:'messages', color:T.purple    },
    { icon:'📋', val:pendingCount||'',         label:'Assignments', page:'grades',   color:T.teal      },
    { icon:'🔔', val:CHILD.alerts.length||'',  label:'Alerts',      page:'alerts',   color:T.red       },
  ]

  return (
    <div style={{ padding:'12px 12px 0' }}>

      {/* W1: Daily Overview */}
      <Widget style={{ background:`linear-gradient(135deg,${T.primary} 0%,#001020 100%)`, border:'none' }}>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:12 }}>
          {childName.toUpperCase()}'S DAILY OVERVIEW
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
          {overviewTiles.map(tile=>(
            <button key={tile.label} onClick={e=>{ e.stopPropagation(); navigate(tile.page) }}
              style={{ background:`${tile.color}18`, border:`1px solid ${tile.color}30`, borderRadius:14, padding:'12px 4px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
              <span style={{ fontSize:18 }}>{tile.icon}</span>
              {tile.val!=='' && <span style={{ fontSize:16, fontWeight:900, color:tile.color, lineHeight:1 }}>{tile.val}</span>}
              <span style={{ fontSize:8, color:'rgba(255,255,255,0.5)', textAlign:'center', fontWeight:600 }}>{tile.label}</span>
            </button>
          ))}
        </div>
      </Widget>

      {/* W2: Alerts */}
      {CHILD.alerts.length>0 && (
        <Widget onClick={()=>navigate('alerts')} style={{ border:`1px solid ${T.red}25` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <div style={{ fontSize:13, fontWeight:700 }}>🔔 Alerts</div>
            <span style={{ background:`${T.red}18`, color:T.red, fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:999 }}>{CHILD.alerts.length}</span>
          </div>
          {CHILD.alerts.map(a=>(
            <div key={a.id} style={{ background:T.inner, borderLeft:`3px solid ${a.color}`, borderRadius:10, padding:'9px 12px', marginBottom:6, display:'flex', gap:8, alignItems:'flex-start' }}>
              <span>{a.icon}</span><span style={{ fontSize:12, color:T.text }}>{a.msg}</span>
            </div>
          ))}
        </Widget>
      )}

      {/* W3: Today's Lesson */}
      <Widget onClick={()=>navigate('lessons')} style={{ background:'linear-gradient(135deg,#001830,#000d1f)', border:`1px solid #003a6a` }}>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:8 }}>TODAY'S LESSONS 📖</div>
        <div style={{ fontSize:15, fontWeight:800, color:'#fff', marginBottom:4 }}>Ch.4 · Fractions & Decimals · Math</div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)' }}>Pages 84–91 · Ms. Johnson · Parent view of {childName}'s lessons</div>
      </Widget>

      {/* W4: Classes */}
      <Widget onClick={()=>navigate('grades')}>
        <div style={{ fontSize:13, fontWeight:700, marginBottom:12 }}>📚 {childName}'s Classes</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {CHILD.classes.map(c=>(
            <button key={c.id} onClick={e=>{ e.stopPropagation(); navigate('grades') }}
              style={{ background:T.inner, borderLeft:`3px solid ${c.color}`, borderRadius:12, padding:'10px 12px', border:'none', cursor:'pointer', textAlign:'left' }}>
              <div style={{ fontWeight:700, fontSize:12, color:T.text, marginBottom:2 }}>{c.subject}</div>
              <div style={{ fontSize:10, color:T.muted, marginBottom:6 }}>{c.teacher}</div>
              <div style={{ fontSize:20, fontWeight:800, color:gradeColor(c.grade) }}>{c.grade}%</div>
            </button>
          ))}
        </div>
      </Widget>

      {/* W5: Messages preview */}
      <Widget onClick={()=>navigate('messages')}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <div style={{ fontSize:13, fontWeight:700 }}>💬 Messages</div>
          <Btn label="+ New" color={T.secondary} onClick={()=>navigate('messages')}/>
        </div>
        {PREVIEW_THREADS.filter(t=>t.unread&&t.private).slice(0,2).map(t=>(
          <div key={t.id} style={{ background:T.inner, borderRadius:12, padding:'10px 12px', marginBottom:8, display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:20 }}>{t.avatar}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:12, color:T.text }}>{t.from}</div>
              <div style={{ fontSize:10, color:T.muted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.messages[t.messages.length-1]?.text}</div>
            </div>
            <div style={{ width:8, height:8, borderRadius:'50%', background:T.red, flexShrink:0 }}/>
          </div>
        ))}
        {!PREVIEW_THREADS.some(t=>t.unread&&t.private) && <div style={{ fontSize:11, color:T.muted, textAlign:'center', padding:'8px 0' }}>No new messages</div>}
      </Widget>

      {/* W6: AI Tips */}
      <Widget style={{ background:'linear-gradient(135deg,#0d1a3a 0%,#000d1f 100%)', border:`1px solid ${T.purple}30` }}>
        <div style={{ fontSize:11, fontWeight:700, color:T.purple, marginBottom:6 }}>✨ AI Tips for {childName}</div>
        <div style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:4 }}>Science needs focus!</div>
        <div style={{ fontSize:11, color:T.muted }}>10 min flashcards tonight · same strategy that boosted Reading +8pts</div>
      </Widget>

      <AddWidgetsBar/>
    </div>
  )
}

// ─── MAIN PARENT DASHBOARD ────────────────────────────────────────────────────
export default function ParentDashboard({ currentUser }) {
  const [page, setPage]           = useState('home')
  const [activeNav, setActiveNav] = useState('home')
  const parentName = currentUser?.userName || 'Ms. Thompson'
  const childName  = CHILD.name

  useEffect(()=>{ window.scrollTo(0,0) },[page])

  function navigate(id) {
    setPage(id)
    if(['home','grades','messages','feed','alerts'].includes(id)) setActiveNav(id)
    window.scrollTo(0,0)
  }

  function goHome() { navigate('home'); setActiveNav('home') }

  const isSubPage = page !== 'home'

  function navSelect(id) {
    if(id==='__back__') { goHome(); return }
    navigate(id)
    setActiveNav(id)
  }

  if(page==='grades')   return <><GradesPage   onBack={goHome}/><BottomNav active={activeNav}  onSelect={navSelect} isSubPage={isSubPage}/></>
  if(page==='messages') return <><ParentMessages onBack={goHome} viewerRole="parent"/><BottomNav active='messages' onSelect={navSelect} isSubPage={isSubPage}/></>
  if(page==='alerts')   return <><AlertsPage   onBack={goHome}/><BottomNav active={activeNav}  onSelect={navSelect} isSubPage={isSubPage}/></>
  if(page==='feed')     return <><ClassFeed    onBack={goHome} viewerRole="parent"/><BottomNav active='feed' onSelect={navSelect} isSubPage={isSubPage}/></>

  const now  = new Date()
  const hour = now.getHours()
  const greeting = hour<12?'Good morning':'Good afternoon'

  return (
    <div style={{ minHeight:'100vh', background:T.bg, color:T.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", paddingBottom:90 }}>
      {/* Sticky header — greeting only, no camera/hamburger (App.jsx owns those) */}
      <div style={{ position:'sticky', top:0, zIndex:100, background:T.header, padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize:10, color:'rgba(255,255,255,0.55)', fontWeight:700, letterSpacing:'0.06em', marginBottom:2 }}>HOUSTON ISD · LINCOLN ELEMENTARY</div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:17, fontWeight:800, color:'#fff' }}>{greeting}, {parentName} 👋</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)' }}>Viewing: {childName} · {CHILD.grade}</div>
          </div>
          {PREVIEW_THREADS.some(t=>t.unread&&t.private) && (
            <button onClick={()=>navigate('messages')}
              style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:16, position:'relative' }}>
              💬
              <div style={{ position:'absolute', top:-2, right:-2, width:8, height:8, borderRadius:'50%', background:T.red }}/>
            </button>
          )}
        </div>
      </div>
      <HomePage navigate={navigate} childName={childName}/>
      <BottomNav active={activeNav} onSelect={navSelect} isSubPage={false}/>
    </div>
  )
}
