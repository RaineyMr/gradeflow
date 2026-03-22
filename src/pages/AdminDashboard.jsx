import React, { useState, useEffect } from 'react'
import ParentMessages from './ParentMessages'
import ClassFeed from './ClassFeed'

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

const T = {
  primary:   '#461D7C',
  secondary: '#FDD023',
  header:    'linear-gradient(135deg, #461D7C 0%, #2a0e4e 100%)',
  surface:   '#0e0718',
}

function applyTheme() {
  const r = document.documentElement
  r.style.setProperty('--school-color',     T.primary)
  r.style.setProperty('--school-secondary', T.secondary)
  r.style.setProperty('--school-surface',   T.surface)
  r.style.setProperty('--school-text',      '#f3e8ff')
}

const SCHOOL = {
  name:'Lamar High School', district:'Houston ISD',
  gpa:78.4, teachers:24, students:612, needAttn:42, pendingMsgs:18,
}

const TEACHERS = [
  { id:'t1', name:'Ms. Johnson',  subject:'Math / Reading',   classes:4, students:89,  gpa:84.2, status:'active',  avatar:'👩‍🏫' },
  { id:'t2', name:'Mr. Rivera',   subject:'Science',          classes:3, students:78,  gpa:79.1, status:'pending', avatar:'🧑‍🔬' },
  { id:'t3', name:'Ms. Davis',    subject:'English',          classes:4, students:95,  gpa:82.6, status:'active',  avatar:'👩‍🏫' },
  { id:'t4', name:'Mr. Thompson', subject:'PE / Health',      classes:5, students:110, gpa:91.0, status:'active',  avatar:'🏃' },
  { id:'t5', name:'Ms. Clark',    subject:'History',          classes:3, students:72,  gpa:76.3, status:'pending', avatar:'👩‍🏫' },
  { id:'t6', name:'Mr. Patel',    subject:'Computer Science', classes:2, students:45,  gpa:88.5, status:'active',  avatar:'👨‍💻' },
]

const ANALYTICS = [
  { subject:'Math',    avg:77.8, color:C.blue,   alert:null },
  { subject:'Reading', avg:86.4, color:C.green,  alert:null },
  { subject:'Science', avg:60.0, color:C.red,    alert:'Needs school-wide attention' },
  { subject:'English', avg:81.2, color:C.teal,   alert:null },
  { subject:'History', avg:73.5, color:C.amber,  alert:null },
]

const ALERTS = [
  { id:1, type:'at-risk', msg:'42 students below 70% GPA — district review next week', time:'Today 8am',   urgent:true  },
  { id:2, type:'pending', msg:'2 teacher verifications pending: Mr. Rivera, Ms. Clark', time:'Yesterday',   urgent:true  },
  { id:3, type:'comm',    msg:'18 unread parent messages across 5 teachers',            time:'2 days ago',  urgent:false },
  { id:4, type:'info',    msg:'Science scores dropped 4.2 pts this quarter',            time:'3 days ago',  urgent:false },
]

const MESSAGES_DEMO = [
  { id:1, from:'Principal Davis', role:'admin',   subject:'Budget approval needed', unread:true,  time:'1h ago',    avatar:'🏫' },
  { id:2, from:'Ms. Thompson',    role:'parent',  subject:'Bullying concern',       unread:true,  time:'3h ago',    avatar:'👩' },
  { id:3, from:'Mr. Rivera',      role:'teacher', subject:'Supply request',         unread:false, time:'Yesterday', avatar:'🧑‍🔬' },
]

function StatBar({ value, color }) {
  return (
    <div style={{ height:6, background:C.inner, borderRadius:3, overflow:'hidden', marginTop:6 }}>
      <div style={{ height:'100%', width:`${Math.min(value,100)}%`, background:color, borderRadius:3, transition:'width 0.4s' }}/>
    </div>
  )
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
// Home: Teachers · Messages · 🏠 Home (center) · Reports · 🔔 Alerts
// Sub:  ← Back · Teachers · Messages · Reports · 🔔 Alerts
function BottomNav({ active, onSelect, isSubPage }) {
  const homeItems = [
    { id:'teachers',  icon:'👩‍🏫', label:'Teachers' },
    { id:'messages',  icon:'💬',  label:'Messages' },
    { id:'home',      icon:'🏠',  label:'Home'     },
    { id:'feed',      icon:'📢',  label:'Feed'     },
    { id:'alerts',    icon:'🔔',  label:'Alerts'   },
  ]
  const subItems = [
    { id:'__back__',  icon:'←',   label:'Back'     },
    { id:'teachers',  icon:'👩‍🏫', label:'Teachers' },
    { id:'messages',  icon:'💬',  label:'Messages' },
    { id:'feed',      icon:'📢',  label:'Feed'     },
    { id:'alerts',    icon:'🔔',  label:'Alerts'   },
  ]
  const items = isSubPage ? subItems : homeItems
  return (
    <nav style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:200, background:`${C.bg}f5`, backdropFilter:'blur(14px)', borderTop:`1px solid ${C.border}`, display:'grid', gridTemplateColumns:`repeat(${items.length},1fr)`, padding:'8px 0 max(8px,env(safe-area-inset-bottom))' }}>
      {items.map(item=>{
        const isActive = item.id===active && item.id!=='__back__'
        return (
          <button key={item.id} onClick={()=>onSelect(item.id)}
            style={{ flex:1, background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, color:isActive?T.secondary:C.muted, fontSize:10, fontWeight:isActive?700:500, padding:'5px 2px', position:'relative' }}>
            <span style={{ fontSize:item.id==='__back__'?20:18, filter:isActive?`drop-shadow(0 0 4px ${T.secondary}80)`:'none', color:item.id==='__back__'?C.soft:'inherit' }}>{item.icon}</span>
            {item.label}
            {isActive && <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:24, height:2, background:T.secondary, borderRadius:1 }}/>}
          </button>
        )
      })}
    </nav>
  )
}

// ─── ADD WIDGETS BAR ──────────────────────────────────────────────────────────
function AddWidgetsBar() {
  const [open, setOpen] = useState(false)
  const WIDGETS = [
    { icon:'📊', name:'Daily Overview'     }, { icon:'👩‍🏫', name:'Teachers'         },
    { icon:'📈', name:'School Analytics'   }, { icon:'💬', name:'Messages'           },
    { icon:'📋', name:'Reports'            }, { icon:'📢', name:'Communication Hub'  },
    { icon:'⚙',  name:'School Settings'   }, { icon:'🎨', name:'Branding'           },
    { icon:'📉', name:'Progress Graph'     }, { icon:'🔔', name:'Alerts'             },
  ]
  return (
    <div style={{ margin:'8px 16px 0', marginBottom:open?16:24 }}>
      {open ? (
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.text }}>＋ Widget Library</div>
            <button onClick={()=>setOpen(false)} style={{ background:C.inner, border:'none', borderRadius:8, padding:'5px 10px', color:C.muted, cursor:'pointer', fontSize:13 }}>✕</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
            {WIDGETS.map(w=>(
              <button key={w.name} style={{ background:C.inner, border:`1px solid ${C.border}`, borderRadius:12, padding:'10px 6px', cursor:'pointer', textAlign:'center' }}
                onMouseEnter={e=>(e.currentTarget.style.borderColor=T.secondary)}
                onMouseLeave={e=>(e.currentTarget.style.borderColor=C.border)}>
                <div style={{ fontSize:20, marginBottom:4 }}>{w.icon}</div>
                <div style={{ fontSize:9, color:C.muted, fontWeight:600 }}>{w.name}</div>
              </button>
            ))}
          </div>
          <div style={{ fontSize:10, color:C.muted, textAlign:'center', marginTop:12 }}>Drag · Resize · Save to account</div>
        </div>
      ) : (
        <button onClick={()=>setOpen(true)}
          style={{ width:'100%', background:C.inner, border:`1px dashed ${C.border}`, borderRadius:14, padding:'10px', color:C.muted, cursor:'pointer', fontSize:12, fontWeight:600 }}>
          ＋ Add Widgets
        </button>
      )}
    </div>
  )
}

// ─── SUB-PAGES ────────────────────────────────────────────────────────────────
function TeachersPage({ onBack }) {
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const filtered = TEACHERS.filter(t=>filter==='all'||t.status===filter)

  if(selected) {
    return (
      <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif" }}>
        <div style={{ background:T.header, padding:'16px', position:'sticky', top:0, zIndex:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={()=>setSelected(null)} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
            <div>
              <div style={{ fontWeight:700, fontSize:16, color:'#fff' }}>{selected.name}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)' }}>{selected.subject}</div>
            </div>
          </div>
        </div>
        <div style={{ padding:'16px' }}>
          <div style={{ background:C.card, border:`1px solid ${selected.status==='pending'?C.amber+'50':C.border}`, borderRadius:16, padding:'16px', marginBottom:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:C.text }}>Account Status</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{selected.status==='pending'?'Verification required':'Fully verified and active'}</div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <span style={{ background:selected.status==='active'?`${C.green}20`:`${C.amber}20`, color:selected.status==='active'?C.green:C.amber, borderRadius:999, padding:'4px 10px', fontSize:11, fontWeight:700 }}>
                  {selected.status==='active'?'✓ Active':'⚠ Pending'}
                </span>
                {selected.status==='pending' && (
                  <button onClick={()=>setSelected({...selected,status:'active'})}
                    style={{ background:T.primary, color:'#fff', border:'none', borderRadius:999, padding:'4px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>✓ Verify</button>
                )}
              </div>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:12 }}>
            {[{ label:'Classes',val:selected.classes },{ label:'Students',val:selected.students },{ label:'Class GPA',val:selected.gpa+'%' }].map(s=>(
              <div key={s.label} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'12px 8px', textAlign:'center' }}>
                <div style={{ fontSize:20, fontWeight:900, color:T.secondary }}>{s.val}</div>
                <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <button style={{ width:'100%', background:T.primary, color:'#fff', border:'none', borderRadius:14, padding:'14px', fontSize:14, fontWeight:700, cursor:'pointer' }}>💬 Send Message</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", paddingBottom:90 }}>
      <div style={{ background:T.header, padding:'16px 16px 20px', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
          <button onClick={onBack} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
          <div>
            <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>👩‍🏫 Teachers</h1>
            <p style={{ fontSize:10, color:'rgba(255,255,255,0.55)', margin:0 }}>{SCHOOL.name} · {TEACHERS.length} teachers</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {[['all','All'],['active','Active'],['pending','Pending']].map(([val,label])=>(
            <button key={val} onClick={()=>setFilter(val)}
              style={{ padding:'6px 14px', borderRadius:999, border:'none', cursor:'pointer', fontSize:11, fontWeight:700, background:filter===val?T.secondary:'rgba(255,255,255,0.15)', color:filter===val?'#000':'#fff' }}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding:'12px 16px 0' }}>
        {filtered.map(teacher=>(
          <button key={teacher.id} onClick={()=>setSelected(teacher)}
            style={{ width:'100%', background:C.card, border:`1px solid ${teacher.status==='pending'?C.amber+'40':C.border}`, borderRadius:16, padding:'14px 16px', marginBottom:10, display:'flex', gap:14, cursor:'pointer', textAlign:'left' }}>
            <div style={{ width:44, height:44, borderRadius:'50%', background:T.primary, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{teacher.avatar}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:2 }}>
                <span style={{ fontWeight:700, fontSize:14, color:C.text }}>{teacher.name}</span>
                <span style={{ fontSize:9, fontWeight:700, borderRadius:999, padding:'2px 7px', background:teacher.status==='active'?`${C.green}20`:`${C.amber}20`, color:teacher.status==='active'?C.green:C.amber }}>
                  {teacher.status==='active'?'✓ Active':'⚠ Pending'}
                </span>
              </div>
              <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>{teacher.subject} · {teacher.classes} classes · {teacher.students} students</div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:12, fontWeight:700, color:teacher.gpa>=80?C.green:teacher.gpa>=70?C.amber:C.red }}>{teacher.gpa}%</span>
                <div style={{ flex:1 }}><StatBar value={teacher.gpa} color={teacher.gpa>=80?C.green:teacher.gpa>=70?C.amber:C.red}/></div>
              </div>
            </div>
            <span style={{ color:C.muted, fontSize:16, alignSelf:'center' }}>›</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function AlertsPage({ onBack }) {
  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", paddingBottom:90 }}>
      <div style={{ background:T.header, padding:'16px 16px 20px', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={onBack} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
          <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>🔔 Alerts</h1>
        </div>
      </div>
      <div style={{ padding:'12px 16px 0' }}>
        {ALERTS.map(alert=>(
          <div key={alert.id} style={{ background:C.card, border:`1px solid ${alert.urgent?C.red+'40':C.border}`, borderRadius:16, padding:'14px 16px', marginBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
              <span style={{ fontSize:10, fontWeight:700, borderRadius:999, padding:'2px 8px', background:alert.urgent?`${C.red}20`:`${C.blue}20`, color:alert.urgent?C.red:C.blue }}>
                {alert.urgent?'🚨 Urgent':'ℹ Info'}
              </span>
              <span style={{ fontSize:10, color:C.muted }}>{alert.time}</span>
            </div>
            <div style={{ fontSize:13, color:C.text, lineHeight:1.5 }}>{alert.msg}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SettingsPage({ onBack }) {
  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", paddingBottom:90 }}>
      <div style={{ background:T.header, padding:'16px 16px 20px', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={onBack} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
          <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>⚙ Settings</h1>
        </div>
      </div>
      <div style={{ padding:'16px' }}>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:'16px', marginBottom:12 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:12 }}>🎨 School Branding</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[{ label:'School Name',val:'Lamar High School' },{ label:'District',val:'Houston ISD' },{ label:'Primary Color',val:'#461D7C',isColor:true },{ label:'Secondary',val:'#FDD023',isColor:true }].map(item=>(
              <div key={item.label}>
                <div style={{ fontSize:10, color:C.muted, marginBottom:4 }}>{item.label}</div>
                {item.isColor ? (
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:24, height:24, borderRadius:6, background:item.val, border:`1px solid ${C.border}` }}/>
                    <span style={{ fontSize:12, color:C.soft }}>{item.val}</span>
                  </div>
                ) : <div style={{ fontSize:12, color:C.soft, fontWeight:600 }}>{item.val}</div>}
              </div>
            ))}
          </div>
          <button style={{ marginTop:14, width:'100%', background:T.primary, color:'#fff', border:'none', borderRadius:12, padding:'10px', fontSize:13, fontWeight:700, cursor:'pointer' }}>Edit Branding</button>
        </div>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:'16px', marginBottom:12 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:12 }}>🔔 Notification Settings</div>
          {[{ label:'At-risk student alerts',on:true },{ label:'Teacher verification requests',on:true },{ label:'Weekly school summary',on:true },{ label:'District policy updates',on:false }].map(item=>(
            <div key={item.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <span style={{ fontSize:12, color:C.soft }}>{item.label}</span>
              <div style={{ width:42, height:24, borderRadius:999, background:item.on?T.primary:C.inner, cursor:'pointer', position:'relative', transition:'background 0.2s' }}>
                <div style={{ width:18, height:18, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left:item.on?21:3, transition:'left 0.2s' }}/>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:'16px' }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:12 }}>🔗 Integrations</div>
          {[{ name:'PowerSchool SIS',connected:true,icon:'📊' },{ name:'Google Workspace',connected:true,icon:'🔵' },{ name:'Canvas LMS',connected:false,icon:'🎨' },{ name:'Clever SSO',connected:false,icon:'🔑' }].map(item=>(
            <div key={item.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:18 }}>{item.icon}</span>
                <span style={{ fontSize:12, color:C.soft }}>{item.name}</span>
              </div>
              <span style={{ fontSize:10, fontWeight:700, borderRadius:999, padding:'3px 9px', background:item.connected?`${C.green}20`:C.inner, color:item.connected?C.green:C.muted }}>
                {item.connected?'✓ Connected':'Connect'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard({ currentUser }) {
  const [activeNav, setActiveNav] = useState('home')
  const [subPage,   setSubPage]   = useState(null)

  useEffect(()=>{ applyTheme() },[])

  function navigate(page) {
    setSubPage(page)
    if(['teachers','messages','alerts','settings','feed'].includes(page)) setActiveNav(page)
    window.scrollTo(0,0)
  }

  function goBack() {
    setSubPage(null)
    setActiveNav('home')
    window.scrollTo(0,0)
  }

  const isSubPage = subPage !== null

  function navSelect(id) {
    if(id==='__back__') { goBack(); return }
    if(id==='home') { goBack(); return }
    navigate(id)
    setActiveNav(id)
  }

  if(subPage==='teachers') return <><TeachersPage   onBack={goBack}/><BottomNav active='teachers' onSelect={navSelect} isSubPage={isSubPage}/></>
  if(subPage==='alerts')   return <><AlertsPage     onBack={goBack}/><BottomNav active='alerts'   onSelect={navSelect} isSubPage={isSubPage}/></>
  if(subPage==='settings') return <><SettingsPage   onBack={goBack}/><BottomNav active='settings' onSelect={navSelect} isSubPage={isSubPage}/></>
  if(subPage==='messages') return <><ParentMessages onBack={goBack}/><BottomNav active='messages' onSelect={navSelect} isSubPage={isSubPage}/></>
  if(subPage==='feed')     return <><ClassFeed      onBack={goBack} viewerRole="admin"/><BottomNav active='feed' onSelect={navSelect} isSubPage={isSubPage}/></>

  const unreadCount = MESSAGES_DEMO.filter(m=>m.unread).length

  const overviewTiles = [
    { icon:'📊', val:SCHOOL.gpa+'%',                           label:'School GPA', page:'analytics', color:T.secondary },
    { icon:'💬', val:unreadCount||'',                          label:'Messages',   page:'messages',  color:C.purple    },
    { icon:'🏫', val:SCHOOL.teachers,                          label:'Teachers',   page:'teachers',  color:C.teal      },
    { icon:'🔔', val:ALERTS.filter(a=>a.urgent).length||'',    label:'Alerts',     page:'alerts',    color:C.red       },
  ]

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", paddingBottom:90 }}>

      {/* Sticky header — no camera/hamburger (those are in App.jsx) */}
      <div style={{ position:'sticky', top:0, zIndex:100, background:T.header, padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize:10, color:'rgba(255,255,255,0.55)', fontWeight:700, letterSpacing:'0.06em', marginBottom:2 }}>
          {SCHOOL.name.toUpperCase()} · {SCHOOL.district.toUpperCase()}
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:17, fontWeight:800, color:'#fff' }}>
              {(()=>{ const h=new Date().getHours(); return h<12?'Good morning':'Good afternoon' })()}, {currentUser?.name?.split(' ')[0]||'Principal'} 👋
            </div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)' }}>Administrator · School-level analytics</div>
          </div>
          {unreadCount>0 && (
            <div style={{ background:`${C.red}30`, borderRadius:999, padding:'3px 8px', fontSize:10, fontWeight:700, color:'#fff' }}>{unreadCount} new</div>
          )}
        </div>
      </div>

      {/* Daily Overview */}
      <div style={{ margin:'16px 16px 0' }}>
        <div style={{ background:'linear-gradient(135deg, #461D7C 0%, #2a0e4e 100%)', borderRadius:20, padding:'16px' }}>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', color:'rgba(255,255,255,0.4)', marginBottom:12 }}>DAILY OVERVIEW</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
            {overviewTiles.map(tile=>(
              <button key={tile.label} onClick={e=>{ e.stopPropagation(); navigate(tile.page) }}
                style={{ background:`${tile.color}20`, border:`1px solid ${tile.color}30`, borderRadius:14, padding:'10px 4px', cursor:'pointer', textAlign:'center' }}>
                <div style={{ fontSize:20, marginBottom:4 }}>{tile.icon}</div>
                <div style={{ fontSize:18, fontWeight:900, color:tile.color }}>{tile.val}</div>
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.5)', marginTop:2, lineHeight:1.2 }}>{tile.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* School-wide Analytics */}
      <div style={{ margin:'12px 16px 0', background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:'16px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div style={{ fontSize:13, fontWeight:800, color:C.text }}>📈 School-wide Analytics</div>
          <span style={{ fontSize:10, color:C.muted }}>No individual grades</span>
        </div>
        {ANALYTICS.map(row=>(
          <div key={row.subject} style={{ marginBottom:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
              <span style={{ fontSize:12, color:C.soft }}>{row.subject}</span>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                {row.alert && <span style={{ fontSize:9, color:C.red }}>⚠ {row.alert}</span>}
                <span style={{ fontSize:12, fontWeight:700, color:row.color }}>{row.avg}</span>
              </div>
            </div>
            <StatBar value={row.avg} color={row.color}/>
          </div>
        ))}
      </div>

      {/* Teachers widget */}
      <div style={{ margin:'12px 16px 0', background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:'16px', cursor:'pointer' }} onClick={()=>navigate('teachers')}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div style={{ fontSize:13, fontWeight:800, color:C.text }}>👩‍🏫 Teachers</div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <span style={{ fontSize:10, fontWeight:700, color:C.amber, background:`${C.amber}18`, borderRadius:999, padding:'2px 7px' }}>{TEACHERS.filter(t=>t.status==='pending').length} pending</span>
            <span style={{ color:C.muted, fontSize:16 }}>›</span>
          </div>
        </div>
        {TEACHERS.slice(0,3).map(teacher=>(
          <div key={teacher.id} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10, padding:'8px 0', borderBottom:`1px solid ${C.border}` }}>
            <div style={{ width:34, height:34, borderRadius:'50%', background:T.primary, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{teacher.avatar}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:700, color:C.text }}>{teacher.name}</div>
              <div style={{ fontSize:10, color:C.muted }}>{teacher.subject} · {teacher.classes} classes</div>
            </div>
            <div style={{ textAlign:'right', flexShrink:0 }}>
              <div style={{ fontSize:12, fontWeight:700, color:teacher.status==='active'?C.green:C.amber }}>{teacher.status==='active'?'✓ Active':'⚠ Verify'}</div>
              <div style={{ fontSize:10, color:C.muted }}>{teacher.gpa}% GPA</div>
            </div>
          </div>
        ))}
        <div style={{ textAlign:'center', fontSize:11, color:T.secondary, fontWeight:700, marginTop:4 }}>+ {TEACHERS.length-3} more teachers →</div>
      </div>

      {/* Messages widget */}
      <div style={{ margin:'12px 16px 0', background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:'16px', cursor:'pointer' }} onClick={()=>navigate('messages')}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div style={{ fontSize:13, fontWeight:800, color:C.text }}>💬 Messages</div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {unreadCount>0 && <span style={{ fontSize:10, fontWeight:700, color:C.red, background:`${C.red}18`, borderRadius:999, padding:'2px 7px' }}>{unreadCount} unread</span>}
            <span style={{ color:C.muted, fontSize:16 }}>›</span>
          </div>
        </div>
        {MESSAGES_DEMO.slice(0,3).map(msg=>(
          <div key={msg.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10, padding:'8px 0', borderBottom:`1px solid ${C.border}` }}>
            <div style={{ width:34, height:34, borderRadius:'50%', background:msg.unread?T.primary:C.inner, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, position:'relative' }}>
              {msg.avatar}
              {msg.unread && <div style={{ position:'absolute', top:-1, right:-1, width:8, height:8, borderRadius:'50%', background:C.red, border:`1px solid ${C.bg}` }}/>}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:msg.unread?700:500, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{msg.from}</div>
              <div style={{ fontSize:10, color:C.muted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{msg.subject}</div>
            </div>
            <span style={{ fontSize:10, color:C.muted, flexShrink:0 }}>{msg.time}</span>
          </div>
        ))}
      </div>

      {/* Alerts widget */}
      <div style={{ margin:'12px 16px 0', background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:'16px', cursor:'pointer' }} onClick={()=>navigate('alerts')}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div style={{ fontSize:13, fontWeight:800, color:C.text }}>🔔 Alerts</div>
          <span style={{ color:C.muted, fontSize:16 }}>›</span>
        </div>
        {ALERTS.slice(0,2).map(alert=>(
          <div key={alert.id} style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:10 }}>
            <span style={{ fontSize:16, marginTop:1 }}>{alert.urgent?'🚨':'ℹ️'}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, color:C.soft, lineHeight:1.4 }}>{alert.msg}</div>
              <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{alert.time}</div>
            </div>
          </div>
        ))}
      </div>

      <AddWidgetsBar/>

      <BottomNav active={activeNav} onSelect={navSelect} isSubPage={false}/>
    </div>
  )
}
