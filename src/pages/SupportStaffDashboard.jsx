import React, { useState, useEffect } from 'react'
import { useDashboard } from '../hooks/useDashboard'
import DashboardShell from '../components/layout/DashboardShell'
import ParentMessages from './ParentMessages'
import StudentProfile from './StudentProfile'
import SupportStaffGroupScreen from './SupportStaffGroupScreen'

// ─── Colors ──────────────────────────────────────────────────────────────────
const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

// ─── Theme (Houston ISD — matches other HISD demo accounts) ──────────────────
const T = {
  primary:   '#003057',
  secondary: '#B3A369',
  header:    'linear-gradient(135deg, #003057 0%, #000d1a 100%)',
  surface:   '#000d1a',
}

function applyTheme() {
  const r = document.documentElement
  r.style.setProperty('--school-color',     T.primary)
  r.style.setProperty('--school-secondary', T.secondary)
  r.style.setProperty('--school-surface',   T.surface)
  r.style.setProperty('--school-text',      '#e8f0ff')
}

// ─── Demo data (self-contained — no store dependency) ────────────────────────
const STAFF = {
  name: 'Ms. Carter',
  title: 'School Counselor',
  school: 'Houston ISD · Lincoln Elementary',
}

const DEMO_STUDENTS = [
  { id:1, name:'Marcus Thompson',  grade:58, classId:1, flagged:true,  submitUngraded:true,  notes:2 },
  { id:2, name:'Zoe Anderson',     grade:55, classId:3, flagged:true,  submitUngraded:false, notes:3 },
  { id:3, name:'Liam Martinez',    grade:61, classId:3, flagged:true,  submitUngraded:true,  notes:1 },
  { id:4, name:'Sofia Rodriguez',  grade:82, classId:1, flagged:false, submitUngraded:false, notes:0 },
  { id:5, name:'Jordan Williams',  grade:74, classId:1, flagged:false, submitUngraded:false, notes:1 },
]

const DEMO_CLASSES = [
  { id:1, subject:'Math',    period:'1st', teacher:'Ms. Johnson', color:C.blue  },
  { id:2, subject:'Reading', period:'2nd', teacher:'Ms. Davis',   color:C.green },
  { id:3, subject:'Science', period:'3rd', teacher:'Mr. Rivera',  color:C.red   },
]

const DEMO_TEACHERS = [
  { id:'t1', name:'Ms. Johnson', subject:'Math',    avatar:'👩‍🏫' },
  { id:'t2', name:'Ms. Davis',   subject:'Reading', avatar:'👩‍💼' },
  { id:'t3', name:'Mr. Rivera',  subject:'Science', avatar:'🧑‍🔬' },
]

const DEMO_NOTES = [
  { id:1, studentId:1, type:'academic',     date:'Oct 14', content:'Marcus is struggling with fractions. Recommended tutoring 2x/week.' },
  { id:2, studentId:1, type:'behavior',     date:'Oct 12', content:'Positive behavior improvement noted this week.' },
  { id:3, studentId:2, type:'wellness',     date:'Oct 13', content:"Zoe mentioned feeling overwhelmed. Spoke with parent — extra check-ins scheduled." },
  { id:4, studentId:2, type:'intervention', date:'Oct 11', content:'Intervention plan activated. Weekly counselor sessions starting Monday.' },
  { id:5, studentId:2, type:'academic',     date:'Oct 10', content:'Science grade dropped to 55%. Coordinating with Mr. Rivera on modified assignments.' },
  { id:6, studentId:3, type:'academic',     date:'Oct 14', content:'Liam behind on 3 assignments. Parent contacted.' },
]

const NOTE_COLORS = {
  academic:     C.blue,
  behavior:     C.amber,
  wellness:     C.green,
  intervention: C.red,
}

const ALERTS = [
  { id:1, msg:'Marcus Thompson — 58% in Math, 2 ungraded submissions pending', color:C.red,   icon:'⚑' },
  { id:2, msg:'Zoe Anderson — Intervention plan review due this Friday',        color:C.amber, icon:'📋' },
  { id:3, msg:'Liam Martinez — Parent has not responded to last 2 messages',    color:C.amber, icon:'💬' },
]

// ─── Shared UI ────────────────────────────────────────────────────────────────
function scrollTop() { window.scrollTo(0,0) }

function SubPage({ children }) {
  useEffect(()=>{ scrollTop() },[])
  return <div style={{ minHeight:'100vh', background:C.bg, paddingBottom:80 }}>{children}</div>
}

function StickyHeader() {
  const now  = new Date()
  const hour = now.getHours()
  const greeting = hour<12?'Good morning':hour<17?'Good afternoon':'Good evening'
  const timeStr  = now.toLocaleTimeString('en-US',{ hour:'numeric', minute:'2-digit' })
  return (
    <div style={{ position:'sticky', top:0, zIndex:100, background:'linear-gradient(135deg, var(--school-color) 0%, var(--school-surface,#000d1a) 100%)', padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.55)', fontWeight:700, letterSpacing:'0.06em', marginBottom:2 }}>{STAFF.school.toUpperCase()}</div>
          <div style={{ fontSize:17, fontWeight:800, color:'#fff', lineHeight:1.2 }}>{greeting}, {STAFF.name.split(' ')[1]} 👋</div>
        </div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', fontWeight:600 }}>{timeStr}</div>
      </div>
      <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', marginTop:4 }}>
        {now.toLocaleDateString('en-US',{ weekday:'long', month:'long', day:'numeric' })} · {STAFF.title}
      </div>
    </div>
  )
}

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

function StatBar({ value, color }) {
  return (
    <div style={{ height:4, background:C.inner, borderRadius:2, overflow:'hidden', marginTop:6 }}>
      <div style={{ height:'100%', width:`${Math.min(value,100)}%`, background:color, borderRadius:2, transition:'width 0.4s' }}/>
    </div>
  )
}

// ─── SUB-PAGES ────────────────────────────────────────────────────────────────
function StudentDetailPage({ student, onBack, navigate }) {
  const cls      = DEMO_CLASSES.find(c=>c.id===student.classId)
  const notes    = DEMO_NOTES.filter(n=>n.studentId===student.id)
  const gradeColor = student.grade>=80?C.green:student.grade>=70?C.amber:C.red

  return (
    <SubPage>
      <div style={{ background:T.header, padding:'16px 16px 20px', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={onBack} style={{ background:C.inner, border:'none', borderRadius:10, padding:'7px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
          <div>
            <div style={{ fontWeight:800, fontSize:17, color:'#fff' }}>{student.name}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)' }}>{cls?`${cls.period} Period · ${cls.subject}`:'No class assigned'}</div>
          </div>
        </div>
      </div>

      <div style={{ padding:'16px' }}>
        {/* Grade card */}
        <div style={{ background:C.card, border:`1px solid ${gradeColor}35`, borderRadius:18, padding:16, marginBottom:12 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.text }}>Current Grade</div>
            <div style={{ display:'flex', gap:6 }}>
              {student.flagged && <span style={{ fontSize:9, fontWeight:700, background:`${C.red}20`, color:C.red, borderRadius:999, padding:'2px 7px' }}>⚑ Flagged</span>}
              {student.submitUngraded && <span style={{ fontSize:9, fontWeight:700, background:`${C.amber}20`, color:C.amber, borderRadius:999, padding:'2px 7px' }}>Ungraded work</span>}
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
            {[
              { label:'Grade',     val:`${student.grade}%`, color:gradeColor },
              { label:'Status',    val:student.flagged?'⚑ Flagged':'On Track', color:student.flagged?C.red:C.green },
              { label:'Notes',     val:notes.length,        color:C.purple },
            ].map(s=>(
              <div key={s.label} style={{ background:C.inner, borderRadius:12, padding:'10px 8px', textAlign:'center' }}>
                <div style={{ fontSize:18, fontWeight:800, color:s.color }}>{s.val}</div>
                <div style={{ fontSize:9, color:C.muted, marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <StatBar value={student.grade} color={gradeColor}/>
        </div>

        {/* Action buttons */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
          {[
            { label:'💬 Message Student', color:C.green  },
            { label:'👩‍🏫 Message Teacher', color:C.teal  },
            { label:'👪 Message Parent',   color:C.blue  },
            { label:'🏫 Message Admin',    color:C.purple },
          ].map(btn=>(
            <button key={btn.label} onClick={()=>navigate('messages')}
              style={{ background:`${btn.color}18`, color:btn.color, border:`1px solid ${btn.color}35`, borderRadius:12, padding:'10px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
              {btn.label}
            </button>
          ))}
        </div>

        {/* Notes */}
        <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:10 }}>📝 Case Notes ({notes.length})</div>
        {notes.length===0 ? (
          <div style={{ textAlign:'center', padding:'24px 0', color:C.muted }}>No notes yet</div>
        ) : notes.map(note=>(
          <div key={note.id} style={{ background:C.card, borderRadius:14, padding:14, marginBottom:8, borderLeft:`3px solid ${NOTE_COLORS[note.type]||C.muted}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
              <span style={{ fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:999, background:`${NOTE_COLORS[note.type]||C.muted}20`, color:NOTE_COLORS[note.type]||C.muted }}>
                {note.type}
              </span>
              <span style={{ fontSize:9, color:C.muted, marginLeft:'auto' }}>{note.date}</span>
            </div>
            <div style={{ fontSize:12, color:C.soft, lineHeight:1.6 }}>{note.content}</div>
          </div>
        ))}
      </div>
    </SubPage>
  )
}

function StudentsPage({ onBack, navigate, setDetailStudent }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = DEMO_STUDENTS.filter(s=>{
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter==='all' || (filter==='flagged'&&s.flagged) || (filter==='atrisk'&&s.grade<70)
    return matchSearch && matchFilter
  })

  function gradeColor(g) { return g>=80?C.green:g>=70?C.amber:C.red }

  return (
    <SubPage>
      <div style={{ background:T.header, padding:'16px 16px 20px', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
          <button onClick={onBack} style={{ background:C.inner, border:'none', borderRadius:10, padding:'7px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
          <div>
            <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>👥 My Students</h1>
            <p style={{ fontSize:10, color:'rgba(255,255,255,0.55)', margin:0 }}>{DEMO_STUDENTS.length} assigned students</p>
          </div>
        </div>
        {/* Filters */}
        <div style={{ display:'flex', gap:8, marginBottom:10 }}>
          {[['all','All'],['flagged','Flagged'],['atrisk','At Risk']].map(([val,label])=>(
            <button key={val} onClick={()=>setFilter(val)}
              style={{ padding:'6px 14px', borderRadius:999, border:'none', cursor:'pointer', fontSize:11, fontWeight:700, background:filter===val?T.secondary:'rgba(255,255,255,0.15)', color:filter===val?'#000':'#fff' }}>
              {label}
            </button>
          ))}
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search students..."
          style={{ width:'100%', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.18)', borderRadius:11, padding:'9px 14px', color:'#fff', fontSize:12, outline:'none', boxSizing:'border-box' }}/>
      </div>

      <div style={{ padding:'12px 16px 0' }}>
        {filtered.length===0 ? (
          <div style={{ textAlign:'center', padding:'40px 0', color:C.muted }}>
            <div style={{ fontSize:36, marginBottom:8 }}>🔍</div>
            <div>No students match "{search}"</div>
          </div>
        ) : filtered.map(student=>{
          const cls = DEMO_CLASSES.find(c=>c.id===student.classId)
          const notes = DEMO_NOTES.filter(n=>n.studentId===student.id)
          const gc = gradeColor(student.grade)
          return (
            <button key={student.id} onClick={()=>setDetailStudent(student)}
              style={{ width:'100%', background:C.card, border:`1px solid ${student.flagged?`${C.red}40`:C.border}`, borderRadius:16, padding:'14px 16px', marginBottom:10, display:'flex', gap:14, cursor:'pointer', textAlign:'left' }}>
              <div style={{ width:44, height:44, borderRadius:'50%', background:'var(--school-color)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>👤</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:C.text }}>{student.name}</span>
                  {student.flagged && <span style={{ fontSize:9, fontWeight:700, background:`${C.red}20`, color:C.red, borderRadius:999, padding:'2px 5px', flexShrink:0 }}>⚑ Flagged</span>}
                </div>
                <div style={{ fontSize:11, color:C.muted, marginBottom:6 }}>
                  {cls?`${cls.period} Period · ${cls.subject}`:'No class'} · {notes.length} note{notes.length!==1?'s':''}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:14, fontWeight:800, color:gc }}>{student.grade}%</span>
                  <div style={{ flex:1 }}><StatBar value={student.grade} color={gc}/></div>
                </div>
              </div>
              <span style={{ color:C.muted, fontSize:16, alignSelf:'center' }}>›</span>
            </button>
          )
        })}
      </div>
    </SubPage>
  )
}

function NotesPage({ onBack }) {
  const allNotes = [...DEMO_NOTES].sort((a,b)=>new Date(b.date)-new Date(a.date))
  return (
    <SubPage>
      <div style={{ background:T.header, padding:'16px 16px 20px', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={onBack} style={{ background:C.inner, border:'none', borderRadius:10, padding:'7px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
          <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>📝 All Notes</h1>
        </div>
      </div>
      <div style={{ padding:'12px 16px 0' }}>
        {allNotes.map(note=>{
          const student = DEMO_STUDENTS.find(s=>s.id===note.studentId)
          const color   = NOTE_COLORS[note.type]||C.muted
          return (
            <div key={note.id} style={{ background:C.card, borderRadius:14, padding:14, marginBottom:10, borderLeft:`3px solid ${color}` }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                <span style={{ fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:999, background:`${color}20`, color }}>{note.type}</span>
                {student && <span style={{ fontSize:11, fontWeight:700, color:C.soft }}>{student.name}</span>}
                <span style={{ fontSize:9, color:C.muted, marginLeft:'auto' }}>{note.date}</span>
              </div>
              <div style={{ fontSize:12, color:C.text, lineHeight:1.6 }}>{note.content}</div>
            </div>
          )
        })}
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
          <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>🔔 Alerts</h1>
        </div>
      </div>
      <div style={{ padding:'12px 16px 0' }}>
        {ALERTS.map(alert=>(
          <div key={alert.id} style={{ background:C.card, border:`1px solid ${alert.color}35`, borderLeft:`3px solid ${alert.color}`, borderRadius:14, padding:'14px 16px', marginBottom:10 }}>
            <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
              <span style={{ fontSize:18 }}>{alert.icon}</span>
              <div style={{ fontSize:13, color:C.text, lineHeight:1.5 }}>{alert.msg}</div>
            </div>
          </div>
        ))}
      </div>
    </SubPage>
  )
}

// ─── WIDGET CATALOG ───────────────────────────────────────────────────────────
const WIDGET_CATALOG = [
  { id:'overview',  label:'Daily Overview',  icon:'📅', desc:'Students, notes, flags & alerts'     },
  { id:'students',  label:'My Students',     icon:'👥', desc:'Assigned student list and grades'    },
  { id:'notes',     label:'Recent Notes',    icon:'📝', desc:'Latest case notes across all students' },
  { id:'messages',  label:'Messages',        icon:'💬', desc:'Staff, parent & teacher messaging'   },
  { id:'ai',        label:'AI Assistant',   icon:'🤖', desc:'AI-powered support helper'           },
  { id:'alerts',    label:'Alerts',          icon:'🔔', desc:'Urgent flags requiring action'       },
]

// ─── HOME FEED ────────────────────────────────────────────────────────────────
function HomeFeed({ navigate }) {
  const [hidden,         setHidden]         = useState([])
  const [showAddWidgets, setShowAddWidgets] = useState(false)

  const flaggedCount   = DEMO_STUDENTS.filter(s=>s.flagged).length
  const atRiskCount    = DEMO_STUDENTS.filter(s=>s.grade<70).length
  const totalNotes     = DEMO_NOTES.length
  const urgentAlerts   = ALERTS.length

  function toggleWidget(id) {
    setHidden(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id])
  }

  const show = id => !hidden.includes(id)

  const wrap = (id, content) => {
    if(!show(id)) return null
    return (
      <div key={id} style={{ position:'relative', marginTop:16 }}>
        <button onClick={e=>{ e.stopPropagation(); toggleWidget(id) }} title="Remove widget"
          style={{ position:'absolute', top:-10, right:8, zIndex:20, width:22, height:22, borderRadius:'50%', background:C.bg, border:'1px solid rgba(255,255,255,0.3)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1, boxShadow:'0 2px 6px rgba(0,0,0,0.4)' }}>
          ×
        </button>
        {content}
      </div>
    )
  }

  const overviewTiles = [
    { icon:'👥', val:DEMO_STUDENTS.length, label:'Students', page:'groups',   color:C.blue   },
    { icon:'⚑',  val:flaggedCount,          label:'Flagged',  page:'students', color:C.red    },
    { icon:'📝', val:totalNotes,            label:'Notes',    page:'notes',    color:C.purple },
    { icon:'🔔', val:urgentAlerts,          label:'Alerts',   page:'alerts',   color:C.amber  },
  ]

  return (
    <div style={{ padding:'12px 12px 0' }}>

      {/* Add Widgets Modal */}
      {showAddWidgets && (
        <div onClick={()=>setShowAddWidgets(false)} style={{ position:'fixed', inset:0, zIndex:250, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
          <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxWidth:600, maxHeight:'82vh', overflowY:'auto', background:C.card, border:`1px solid ${C.border}`, borderRadius:'20px 20px 0 0', padding:'20px 16px 36px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div>
                <div style={{ fontSize:17, fontWeight:800, color:C.text }}>+ Add Widgets</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>Tap a widget to add or remove from your dashboard</div>
              </div>
              <button onClick={()=>setShowAddWidgets(false)} style={{ background:C.inner, border:'none', borderRadius:999, width:32, height:32, color:C.soft, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {WIDGET_CATALOG.map(w=>{
                const isActive = !hidden.includes(w.id)
                return (
                  <button key={w.id} onClick={()=>toggleWidget(w.id)}
                    style={{ textAlign:'left', background:isActive?`${C.green}12`:C.inner, border:`1px solid ${isActive?`${C.green}35`:C.border}`, borderRadius:14, padding:'12px', cursor:'pointer' }}>
                    <div style={{ fontSize:22, marginBottom:6 }}>{w.icon}</div>
                    <div style={{ fontSize:12, fontWeight:700, color:C.text }}>{w.label}</div>
                    <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{w.desc}</div>
                    <div style={{ marginTop:8, fontSize:10, fontWeight:700, color:isActive?C.red:C.teal }}>{isActive?'× Remove':'+ Add'}</div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* W1: Daily Overview */}
      {wrap('overview',
        <div style={{ background:`linear-gradient(135deg, ${T.primary} 0%, #001020 100%)`, borderRadius:20, padding:16 }}>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:12 }}>DAILY OVERVIEW</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
            {overviewTiles.map(tile=>(
              <button key={tile.label} onClick={e=>{ e.stopPropagation(); navigate(tile.page) }}
                style={{ background:`${tile.color}20`, border:`1px solid ${tile.color}30`, borderRadius:14, padding:'10px 4px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, transition:'background 0.15s' }}
                onMouseEnter={e=>(e.currentTarget.style.background=`${tile.color}38`)}
                onMouseLeave={e=>(e.currentTarget.style.background=`${tile.color}20`)}>
                <span style={{ fontSize:20 }}>{tile.icon}</span>
                <span style={{ fontSize:18, fontWeight:900, color:tile.color }}>{tile.val}</span>
                <span style={{ fontSize:9, color:'rgba(255,255,255,0.5)', marginTop:2, textAlign:'center' }}>{tile.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* W2: My Students */}
      {wrap('students',
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:16, cursor:'pointer' }} onClick={()=>navigate('groups')}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div style={{ fontSize:13, fontWeight:800, color:C.text }}>👥 My Students</div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              {flaggedCount>0 && <span style={{ fontSize:10, fontWeight:700, color:C.red, background:`${C.red}18`, borderRadius:999, padding:'2px 7px' }}>{flaggedCount} flagged</span>}
              <span style={{ color:C.muted, fontSize:16 }}>›</span>
            </div>
          </div>
          {DEMO_STUDENTS.slice(0,3).map(student=>{
            const cls = DEMO_CLASSES.find(c=>c.id===student.classId)
            const gc  = student.grade>=80?C.green:student.grade>=70?C.amber:C.red
            return (
              <div key={student.id} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10, padding:'8px 0', borderBottom:`1px solid ${C.border}` }}>
                <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--school-color)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>👤</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:C.text }}>{student.name}</div>
                  <div style={{ fontSize:10, color:C.muted }}>{cls?`${cls.subject} · ${cls.period} Period`:'No class'}</div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:gc }}>{student.grade}%</div>
                  {student.flagged && <div style={{ fontSize:9, color:C.red, fontWeight:700 }}>⚑ Flagged</div>}
                </div>
              </div>
            )
          })}
          {DEMO_STUDENTS.length>3 && <div style={{ textAlign:'center', fontSize:11, color:T.secondary, fontWeight:700, marginTop:4 }}>+ {DEMO_STUDENTS.length-3} more students →</div>}
        </div>
      )}

      {/* W3: Recent Notes */}
      {wrap('notes',
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:16, cursor:'pointer' }} onClick={()=>navigate('notes')}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div style={{ fontSize:13, fontWeight:800, color:C.text }}>📝 Recent Notes</div>
            <span style={{ color:C.muted, fontSize:16 }}>›</span>
          </div>
          {DEMO_NOTES.slice(0,3).map(note=>{
            const student = DEMO_STUDENTS.find(s=>s.id===note.studentId)
            const color   = NOTE_COLORS[note.type]||C.muted
            return (
              <div key={note.id} style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:10, padding:'8px 0', borderBottom:`1px solid ${C.border}` }}>
                <span style={{ fontSize:9, fontWeight:700, padding:'3px 7px', borderRadius:999, background:`${color}20`, color, flexShrink:0, marginTop:2 }}>{note.type}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:C.text }}>{student?.name}</div>
                  <div style={{ fontSize:11, color:C.muted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{note.content}</div>
                </div>
                <span style={{ fontSize:10, color:C.muted, flexShrink:0 }}>{note.date}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* W4: Messages */}
      {wrap('messages',
        <div style={{ background:C.card, border:`1px solid ${C.purple}25`, borderRadius:20, padding:16, cursor:'pointer' }} onClick={()=>navigate('messages')}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:800, color:C.text }}>💬 Messages</div>
              <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>Teachers · Parents · Admin</div>
            </div>
            <button onClick={e=>{ e.stopPropagation(); navigate('messages') }}
              style={{ background:`${C.purple}18`, color:C.purple, border:`1px solid ${C.purple}30`, borderRadius:9, padding:'5px 10px', fontSize:10, fontWeight:700, cursor:'pointer' }}>
              See all →
            </button>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {DEMO_TEACHERS.map(t=>(
              <button key={t.id} onClick={e=>{ e.stopPropagation(); navigate('messages') }}
                style={{ background:C.inner, border:`1px solid ${C.border}`, borderRadius:10, padding:'7px 11px', color:C.text, fontSize:11, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:5, whiteSpace:'nowrap' }}>
                {t.avatar} {t.name.split(' ')[1]}
                <span style={{ fontSize:9, color:C.muted }}>· {t.subject}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* W5: Alerts */}
      {wrap('alerts',
        <div style={{ background:C.card, border:`1px solid ${C.amber}25`, borderRadius:20, padding:16, cursor:'pointer' }} onClick={()=>navigate('alerts')}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div style={{ fontSize:13, fontWeight:800, color:C.text }}>🔔 Alerts</div>
            <span style={{ background:`${C.amber}18`, color:C.amber, fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:999 }}>{ALERTS.length}</span>
          </div>
          {ALERTS.slice(0,2).map(alert=>(
            <div key={alert.id} style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:8 }}>
              <span style={{ fontSize:16, marginTop:1 }}>{alert.icon}</span>
              <div style={{ fontSize:12, color:C.soft, lineHeight:1.4 }}>{alert.msg}</div>
            </div>
          ))}
        </div>
      )}

      <AddWidgetsBar onOpen={()=>setShowAddWidgets(true)}/>
    </div>
  )
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function SupportStaffDashboard({ currentUser }) {
  const [detailStudent, setDetailStudent] = useState(null)

  // BottomNav supportStaff home nav IDs: groups | messages | notes | trends | alerts | ai
  // BottomNav supportStaff sub  nav IDs: __back__ | groups | messages | notes | trends | alerts | ai
  const NAV_TO_PAGE = {
    groups:    'groups',    // "Groups" tab → group screen
    messages:  'messages',
    notes:     'notes',
    trends:    'students',  // "Trends" tab → student list (trends feature = future)
    alerts:    'alerts',
    ai:        'ai',
    dashboard: null,
  }
  const PAGE_TO_NAV = {
    groups:    'groups',
    students:  'groups',
    messages:  'messages',
    notes:     'notes',
    alerts:    'alerts',
    ai:        'ai',
    studentDetail: 'groups',
  }

  const {
    subPage, activeNav, isSubPage,
    navigate, goBack, goHome, navSelect,
  } = useDashboard({
    navToPage: NAV_TO_PAGE,
    pageToNav: PAGE_TO_NAV,
    onGoHome:  applyTheme,
  })

  useEffect(()=>{ applyTheme() },[])

  // Student detail drill-down (within students sub-page)
  if(detailStudent) {
    return (
      <DashboardShell role="supportStaff" activeNav="groups" onNavSelect={navSelect} isSubPage={true} themeKey="hisd">
        <StudentDetailPage
          student={detailStudent}
          onBack={()=>setDetailStudent(null)}
          navigate={navigate}
        />
      </DashboardShell>
    )
  }

  const shell = (node) => (
    <DashboardShell role="supportStaff" activeNav={activeNav} onNavSelect={navSelect} isSubPage={isSubPage} themeKey="hisd">
      {node}
    </DashboardShell>
  )

  if(subPage==='groups') return shell(
    <SupportStaffGroupScreen
      onBack={goBack}
      onViewProfile={student => { setDetailStudent(student) }}
    />
  )
  if(subPage==='students') return shell(
    <StudentsPage onBack={goBack} navigate={navigate} setDetailStudent={setDetailStudent}/>
  )
  if(subPage==='notes')    return shell(<NotesPage    onBack={goBack}/>)
  if(subPage==='alerts')   return shell(<AlertsPage   onBack={goBack}/>)
  if(subPage==='messages') return shell(
    <SubPage><ParentMessages onBack={goBack} viewerRole="supportStaff"/></SubPage>
  )
  if(subPage==='ai') return shell(
    <SubPage><SupportStaffAI onBack={goBack}/></SubPage>
  )

  return shell(
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", paddingBottom:90 }}>
      <StickyHeader/>
      <HomeFeed navigate={navigate}/>
    </div>
  )
}


