import React, { useState, useEffect } from 'react'
import ParentMessages from './ParentMessages'
import ClassFeed from './ClassFeed'
import Reports from './Reports'
import Widgets from './Widgets'
import SharedBottomNav from '../components/ui/BottomNav'

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
  { id:'t1', name:'Ms. Johnson',  subject:'Math / Reading',   classes:4, students:89,  gpa:84.2, status:'active',  avatar:'\ud83d\udc69\u200d\ud83c\udfeb' },
  { id:'t2', name:'Mr. Rivera',   subject:'Science',          classes:3, students:78,  gpa:79.1, status:'pending', avatar:'\ud83e\uddd1\u200d\ud83d\udd2c' },
  { id:'t3', name:'Ms. Davis',    subject:'English',          classes:4, students:95,  gpa:82.6, status:'active',  avatar:'\ud83d\udc69\u200d\ud83c\udfeb' },
  { id:'t4', name:'Mr. Thompson', subject:'PE / Health',      classes:5, students:110, gpa:91.0, status:'active',  avatar:'\ud83c\udfc3' },
  { id:'t5', name:'Ms. Clark',    subject:'History',          classes:3, students:72,  gpa:76.3, status:'pending', avatar:'\ud83d\udc69\u200d\ud83c\udfeb' },
  { id:'t6', name:'Mr. Patel',    subject:'Computer Science', classes:2, students:45,  gpa:88.5, status:'active',  avatar:'\ud83d\udc68\u200d\ud83d\udcbb' },
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

const ADMIN_WIDGET_CATALOG = [
  { id:'analytics', label:'School Analytics', icon:'\ud83d\udcc8', desc:'Subject GPA and performance trends' },
  { id:'teachers',  label:'Teachers',         icon:'\ud83d\udc69\u200d\ud83c\udfeb', desc:'Roster, status, and verification' },
  { id:'messages',  label:'Messages',         icon:'\ud83d\udcac', desc:'Parent and staff communications' },
  { id:'alerts',    label:'Alerts',           icon:'\ud83d\udd14', desc:'Urgent school-wide notifications' },
]

const MESSAGES_DEMO = [
  { id:1, from:'Principal Davis', role:'admin',   subject:'Budget approval needed', unread:true,  time:'1h ago',    avatar:'\ud83c\udfe2' },
  { id:2, from:'Ms. Thompson',    role:'parent',  subject:'Bullying concern',       unread:true,  time:'3h ago',    avatar:'\ud83d\udc69' },
  { id:3, from:'Mr. Rivera',      role:'teacher', subject:'Supply request',         unread:false, time:'Yesterday', avatar:'\ud83e\uddd1\u200d\ud83d\udd2c' },
]

function StatBar({ value, color }) {
  return (
    <div style={{ height:6, background:C.inner, borderRadius:3, overflow:'hidden', marginTop:6 }}>
      <div style={{ height:'100%', width:`${Math.min(value,100)}%`, background:color, borderRadius:3, transition:'width 0.4s' }}/>
    </div>
  )
}

// ─── Shared UI (matches Dashboard.jsx) ───────────────────────────────────────
// Matches Dashboard.jsx SubPage
function SubPage({ children }) {
  useEffect(()=>{ window.scrollTo(0,0) },[])
  return <div style={{ minHeight:'100vh', background:C.bg, paddingBottom:80 }}>{children}</div>
}

// Matches Dashboard.jsx StickyHeader
function StickyHeader({ principalName }) {
  const now  = new Date()
  const hour = now.getHours()
  const greeting = hour<12?'Good morning':hour<17?'Good afternoon':'Good evening'
  const timeStr  = now.toLocaleTimeString('en-US',{ hour:'numeric', minute:'2-digit' })
  return (
    <div style={{ position:'sticky', top:0, zIndex:100, background:'linear-gradient(135deg, var(--school-color) 0%, var(--school-surface,#0e0718) 100%)', padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.55)', fontWeight:700, letterSpacing:'0.06em', marginBottom:2 }}>{SCHOOL.name.toUpperCase()} · {SCHOOL.district.toUpperCase()}</div>
          <div style={{ fontSize:17, fontWeight:800, color:'#fff', lineHeight:1.2 }}>{greeting}, {principalName} {'\ud83d\udc4b'}</div>
        </div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', fontWeight:600 }}>{timeStr}</div>
      </div>
      <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', marginTop:4 }}>
        {now.toLocaleDateString('en-US',{ weekday:'long', month:'long', day:'numeric' })} · Administrator
      </div>
    </div>
  )
}

// Matches Dashboard.jsx AddWidgetsBar
function AddWidgetsBar({ onOpen }) {
  return (
    <div style={{ margin:'4px 0 24px', textAlign:'center' }}>
      <button onClick={onOpen} type="button"
        style={{ background:'var(--school-color)', border:'none', borderRadius:14, padding:'12px 28px', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>
        + Add widgets
      </button>
    </div>
  )
}

// ─── SUB-PAGES ────────────────────────────────────────────────────────────────
function TeachersPage({ onBack }) {
  const [filter,   setFilter]   = useState('all')
  const [selected, setSelected] = useState(null)
  const filtered = TEACHERS.filter(t=>filter==='all'||t.status===filter)

  if(selected) return (
    <SubPage>
      <div style={{ background:T.header, padding:'16px', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={()=>setSelected(null)} style={{ background:C.inner, border:'none', borderRadius:10, padding:'7px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
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
                {selected.status==='active'?'✓ Active':'\u26a0 Pending'}
              </span>
              {selected.status==='pending'&&(
                <button onClick={()=>setSelected({...selected,status:'active'})} style={{ background:T.primary, color:'#fff', border:'none', borderRadius:999, padding:'4px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>✓ Verify</button>
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
        <button style={{ width:'100%', background:T.primary, color:'#fff', border:'none', borderRadius:14, padding:'14px', fontSize:14, fontWeight:700, cursor:'pointer' }}>{'\ud83d\udcac'} Send Message</button>
      </div>
    </SubPage>
  )

  return (
    <SubPage>
      <div style={{ background:T.header, padding:'16px 16px 20px', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
          <button onClick={onBack} style={{ background:C.inner, border:'none', borderRadius:10, padding:'7px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
          <div>
            <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>{'\ud83d\udc69\u200d\ud83c\udfeb'} Teachers</h1>
            <p style={{ fontSize:10, color:'rgba(255,255,255,0.55)', margin:0 }}>{SCHOOL.name} · {TEACHERS.length} teachers</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {[['all','All'],['active','Active'],['pending','Pending']].map(([val,label])=>(
            <button key={val} onClick={()=>setFilter(val)} style={{ padding:'6px 14px', borderRadius:999, border:'none', cursor:'pointer', fontSize:11, fontWeight:700, background:filter===val?T.secondary:'rgba(255,255,255,0.15)', color:filter===val?'#000':'#fff' }}>{label}</button>
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
                  {teacher.status==='active'?'✓ Active':'\u26a0 Pending'}
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
    </SubPage>
  )
}

function AlertsPage({ onBack }) {
  return (
    <SubPage>
      <div style={{ background:T.header, padding:'16px 16px 20px', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={onBack} style={{ background:C.inner, border:'none', borderRadius:10, padding:'7px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
          <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>{'\ud83d\udd14'} Alerts</h1>
        </div>
      </div>
      <div style={{ padding:'12px 16px 0' }}>
        {ALERTS.map(alert=>(
          <div key={alert.id} style={{ background:C.card, border:`1px solid ${alert.urgent?C.red+'40':C.border}`, borderRadius:16, padding:'14px 16px', marginBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
              <span style={{ fontSize:10, fontWeight:700, borderRadius:999, padding:'2px 8px', background:alert.urgent?`${C.red}20`:`${C.blue}20`, color:alert.urgent?C.red:C.blue }}>{alert.urgent?'\ud83d\udea8 Urgent':'\u2139 Info'}</span>
              <span style={{ fontSize:10, color:C.muted }}>{alert.time}</span>
            </div>
            <div style={{ fontSize:13, color:C.text, lineHeight:1.5 }}>{alert.msg}</div>
          </div>
        ))}
      </div>
    </SubPage>
  )
}

function SettingsPage({ onBack }) {
  return (
    <SubPage>
      <div style={{ background:T.header, padding:'16px 16px 20px', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={onBack} style={{ background:C.inner, border:'none', borderRadius:10, padding:'7px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
          <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>{'\u2699'} Settings</h1>
        </div>
      </div>
      <div style={{ padding:'16px' }}>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:'16px', marginBottom:12 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:12 }}>{'\ud83c\udfa8'} School Branding</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[{ label:'School Name',val:'Lamar High School' },{ label:'District',val:'Houston ISD' },{ label:'Primary Color',val:'#461D7C',isColor:true },{ label:'Secondary',val:'#FDD023',isColor:true }].map(item=>(
              <div key={item.label}>
                <div style={{ fontSize:10, color:C.muted, marginBottom:4 }}>{item.label}</div>
                {item.isColor
                  ? <div style={{ display:'flex', alignItems:'center', gap:8 }}><div style={{ width:24, height:24, borderRadius:6, background:item.val, border:`1px solid ${C.border}` }}/><span style={{ fontSize:12, color:C.soft }}>{item.val}</span></div>
                  : <div style={{ fontSize:12, color:C.soft, fontWeight:600 }}>{item.val}</div>}
              </div>
            ))}
          </div>
          <button style={{ marginTop:14, width:'100%', background:T.primary, color:'#fff', border:'none', borderRadius:12, padding:'10px', fontSize:13, fontWeight:700, cursor:'pointer' }}>Edit Branding</button>
        </div>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:'16px', marginBottom:12 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:12 }}>{'\ud83d\udd14'} Notification Settings</div>
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
          <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:12 }}>{'\ud83d\udd17'} Integrations</div>
          {[{ name:'PowerSchool SIS',connected:true,icon:'\ud83d\udcca' },{ name:'Google Workspace',connected:true,icon:'\ud83d\udd35' },{ name:'Canvas LMS',connected:false,icon:'\ud83c\udfa8' },{ name:'Clever SSO',connected:false,icon:'\ud83d\udd11' }].map(item=>(
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
    </SubPage>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
import { useDashboard } from '../hooks/useDashboard'
import DashboardShell from '../components/layout/DashboardShell'

export default function AdminDashboard({ currentUser }) {
  const [activeWidgets, setActiveWidgets] = useState(ADMIN_WIDGET_CATALOG.map(w=>w.id))
  const removeWidget = id => setActiveWidgets(ws=>ws.filter(w=>w!==id))
  const addWidget    = id => setActiveWidgets(ws=>ws.includes(id)?ws:[...ws,id])
  const show         = id => activeWidgets.includes(id)

  const wrap = (id, content) => (
    <div key={id} style={{ position:'relative', marginTop:16, margin:'16px 16px 0' }}>
      <button onClick={e=>{ e.stopPropagation(); removeWidget(id) }} title="Remove widget"
        style={{ position:'absolute', top:-10, right:8, zIndex:20, width:22, height:22, borderRadius:'50%', background:C.bg, border:'1px solid rgba(255,255,255,0.3)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1, boxShadow:'0 2px 6px rgba(0,0,0,0.4)' }}>
        x
      </button>
      {content}
    </div>
  )

  const NAV_TO_PAGE = {
    teachers:  'teachers',
    messages:  'messages',
    alerts:    'alerts',
    reports:   'reports',
    widgets:   'widgets',
    dashboard: null,
  }
  const PAGE_TO_NAV = {
    teachers:'teachers', messages:'messages', alerts:'alerts',
    reports:'reports', widgets:'widgets', settings:'dashboard',
  }

  const {
    subPage, activeNav, isSubPage,
    showAddWidgets, setShowAddWidgets,
    navigate, goBack, goHome, navSelect,
  } = useDashboard({
    navToPage: NAV_TO_PAGE,
    pageToNav: PAGE_TO_NAV,
    onGoHome:  applyTheme,
  })

  // Apply theme on mount (onGoHome also re-applies on home reset)
  useEffect(()=>{ applyTheme() },[])

  const shell = (node) => (
    <DashboardShell role="admin" activeNav={activeNav} onNavSelect={navSelect} isSubPage={isSubPage} themeKey="lamar">
      {node}
    </DashboardShell>
  )

  if(subPage==='teachers') return shell(<TeachersPage   onBack={goBack}/>)
  if(subPage==='alerts')   return shell(<AlertsPage     onBack={goBack}/>)
  if(subPage==='settings') return shell(<SettingsPage   onBack={goBack}/>)
  if(subPage==='messages') return shell(<SubPage><ParentMessages onBack={goBack}/></SubPage>)
  if(subPage==='reports')  return shell(<SubPage><Reports        onBack={goBack}/></SubPage>)
  if(subPage==='widgets')  return shell(<SubPage><Widgets        onBack={goBack}/></SubPage>)

  const unreadCount = MESSAGES_DEMO.filter(m=>m.unread).length

  const overviewTiles = [
    { icon:'\ud83d\udcca', val:SCHOOL.gpa+'%',                         label:'School GPA', page:'analytics', color:T.secondary },
    { icon:'\ud83d\udcac', val:unreadCount||'',                         label:'Messages',   page:'messages',  color:C.purple    },
    { icon:'\ud83c\udfe2', val:SCHOOL.teachers,                         label:'Teachers',   page:'teachers',  color:C.teal      },
    { icon:'\ud83d\udd14', val:ALERTS.filter(a=>a.urgent).length||'',  label:'Alerts',     page:'alerts',    color:C.red       },
  ]

  return shell(
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", paddingBottom:90 }}>

      {/* Matches Dashboard.jsx StickyHeader */}
      <StickyHeader principalName={currentUser?.name?.split(' ')[0]||'Principal'}/>

      {/* Daily Overview */}
      <div style={{ margin:'16px 16px 0' }}>
        <div style={{ background:'linear-gradient(135deg, #461D7C 0%, #2a0e4e 100%)', borderRadius:20, padding:'16px' }}>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', color:'rgba(255,255,255,0.4)', marginBottom:12 }}>DAILY OVERVIEW</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
            {overviewTiles.map(tile=>(
              <button key={tile.label} onClick={e=>{ e.stopPropagation(); navigate(tile.page) }}
                style={{ background:`${tile.color}20`, border:`1px solid ${tile.color}30`, borderRadius:14, padding:'10px 4px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, transition:'background 0.15s' }}
                onMouseEnter={e=>(e.currentTarget.style.background=`${tile.color}38`)}
                onMouseLeave={e=>(e.currentTarget.style.background=`${tile.color}20`)}>
                <span style={{ fontSize:20 }}>{tile.icon}</span>
                {tile.val!==''&&<span style={{ fontSize:18, fontWeight:900, color:tile.color }}>{tile.val}</span>}
                <span style={{ fontSize:9, color:'rgba(255,255,255,0.5)', marginTop:2, lineHeight:1.2, textAlign:'center' }}>{tile.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add Widgets Modal */}
      {showAddWidgets&&(
        <div onClick={()=>setShowAddWidgets(false)} style={{ position:'fixed', inset:0, zIndex:250, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
          <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxWidth:600, maxHeight:'82vh', overflowY:'auto', background:C.card, border:`1px solid ${C.border}`, borderRadius:'20px 20px 0 0', padding:'20px 16px 36px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div>
                <div style={{ fontSize:17, fontWeight:800, color:C.text }}>+ Add Widgets</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>Tap a widget to add or remove from your dashboard</div>
              </div>
              <button onClick={()=>setShowAddWidgets(false)} style={{ background:C.inner, border:'none', borderRadius:999, width:32, height:32, color:C.soft, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>{'x'}</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {ADMIN_WIDGET_CATALOG.map(w=>{
                const isActive=activeWidgets.includes(w.id)
                return (
                  <button key={w.id} onClick={()=>{ isActive?removeWidget(w.id):addWidget(w.id) }}
                    style={{ textAlign:'left', background:isActive?`${C.green}12`:C.inner, border:`1px solid ${isActive?`${C.green}35`:C.border}`, borderRadius:14, padding:'12px', cursor:'pointer' }}>
                    <div style={{ fontSize:22, marginBottom:6 }}>{w.icon}</div>
                    <div style={{ fontSize:12, fontWeight:700, color:C.text }}>{w.label}</div>
                    <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{w.desc}</div>
                    <div style={{ marginTop:8, fontSize:10, fontWeight:700, color:isActive?C.red:C.teal }}>{'\u2715 Remove'}</div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {show('analytics')&&wrap('analytics',
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:'16px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:800, color:C.text }}>{'\ud83d\udcc8'} School-wide Analytics</div>
            <span style={{ fontSize:10, color:C.muted }}>No individual grades</span>
          </div>
          {ANALYTICS.map(row=>(
            <div key={row.subject} style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
                <span style={{ fontSize:12, color:C.soft }}>{row.subject}</span>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  {row.alert&&<span style={{ fontSize:9, color:C.red }}>{'\u26a0'} {row.alert}</span>}
                  <span style={{ fontSize:12, fontWeight:700, color:row.color }}>{row.avg}</span>
                </div>
              </div>
              <StatBar value={row.avg} color={row.color}/>
            </div>
          ))}
        </div>
      )}

      {show('teachers')&&wrap('teachers',
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:'16px', cursor:'pointer' }} onClick={()=>navigate('teachers')}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div style={{ fontSize:13, fontWeight:800, color:C.text }}>{'\ud83d\udc69\u200d\ud83c\udfeb'} Teachers</div>
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
                <div style={{ fontSize:12, fontWeight:700, color:teacher.status==='active'?C.green:C.amber }}>{teacher.status==='active'?'✓ Active':'\u26a0 Verify'}</div>
                <div style={{ fontSize:10, color:C.muted }}>{teacher.gpa}% GPA</div>
              </div>
            </div>
          ))}
          <div style={{ textAlign:'center', fontSize:11, color:T.secondary, fontWeight:700, marginTop:4 }}>+ {TEACHERS.length-3} more teachers →</div>
        </div>
      )}

      {show('messages')&&wrap('messages',
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:'16px', cursor:'pointer' }} onClick={()=>navigate('messages')}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div style={{ fontSize:13, fontWeight:800, color:C.text }}>{'\ud83d\udcac'} Messages</div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              {unreadCount>0&&<span style={{ fontSize:10, fontWeight:700, color:C.red, background:`${C.red}18`, borderRadius:999, padding:'2px 7px' }}>{unreadCount} unread</span>}
              <span style={{ color:C.muted, fontSize:16 }}>›</span>
            </div>
          </div>
          {MESSAGES_DEMO.slice(0,3).map(msg=>(
            <div key={msg.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10, padding:'8px 0', borderBottom:`1px solid ${C.border}` }}>
              <div style={{ width:34, height:34, borderRadius:'50%', background:msg.unread?T.primary:C.inner, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, position:'relative' }}>
                {msg.avatar}
                {msg.unread&&<div style={{ position:'absolute', top:-1, right:-1, width:8, height:8, borderRadius:'50%', background:C.red, border:`1px solid ${C.bg}` }}/>}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:msg.unread?700:500, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{msg.from}</div>
                <div style={{ fontSize:10, color:C.muted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{msg.subject}</div>
              </div>
              <span style={{ fontSize:10, color:C.muted, flexShrink:0 }}>{msg.time}</span>
            </div>
          ))}
        </div>
      )}

      {show('alerts')&&wrap('alerts',
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:'16px', cursor:'pointer' }} onClick={()=>navigate('alerts')}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div style={{ fontSize:13, fontWeight:800, color:C.text }}>{'\ud83d\udd14'} Alerts</div>
            <span style={{ color:C.muted, fontSize:16 }}>›</span>
          </div>
          {ALERTS.slice(0,2).map(alert=>(
            <div key={alert.id} style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:10 }}>
              <span style={{ fontSize:16, marginTop:1 }}>{alert.urgent?'\ud83d\udea8':'\u2139\ufe0f'}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, color:C.soft, lineHeight:1.4 }}>{alert.msg}</div>
                <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{alert.time}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddWidgetsBar onOpen={()=>setShowAddWidgets(true)}/>
    </div>
  )
}
