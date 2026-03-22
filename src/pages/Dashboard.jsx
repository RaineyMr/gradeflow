import React, { useState, useEffect, useRef } from 'react'
import { useStore } from '../lib/store'
import Gradebook      from './Gradebook'
import LessonPlan     from './LessonPlan'
import Reports        from './Reports'
import TestingSuite   from './TestingSuite'
import ClassFeed      from './ClassFeed'
import StudentProfile from './StudentProfile'
import ParentMessages from './ParentMessages'
import Camera         from './Camera'
import Integrations   from './Integrations'

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

const SCHOOL_THEMES = {
  kipp:     { primary:'#BA0C2F', secondary:'#000000', surface:'#1a0008', text:'#ffe8ed' },
  hisd:     { primary:'#003057', secondary:'#B3A369', surface:'#000d1a', text:'#e8f0ff' },
  bellaire: { primary:'#B3A369', secondary:'#003057', surface:'#1a1800', text:'#faf7ee' },
  lamar:    { primary:'#461D7C', secondary:'#FDD023', surface:'#0e0718', text:'#f3e8ff' },
}

function applyTheme(key) {
  const t = SCHOOL_THEMES[key] || SCHOOL_THEMES.kipp
  const r = document.documentElement
  r.style.setProperty('--school-color',     t.primary)
  r.style.setProperty('--school-secondary', t.secondary)
  r.style.setProperty('--school-surface',   t.surface)
  r.style.setProperty('--school-text',      t.text)
}

const scrollTop = () => {
  window.scrollTo(0, 0)
  document.querySelector('[data-app-scroll]')?.scrollTo(0, 0)
}

function TrendBadge({ trend }) {
  const map = { up:['↑',C.green], down:['↓',C.red], stable:['→',C.muted] }
  const [icon, color] = map[trend] || map.stable
  return <span style={{ fontSize:11, color, fontWeight:700 }}>{icon}</span>
}

function GradeBadge({ score }) {
  const color  = score>=90?C.green:score>=80?C.blue:score>=70?C.amber:C.red
  const letter = score>=90?'A':score>=80?'B':score>=70?'C':score>=60?'D':'F'
  return (
    <div style={{ textAlign:'right' }}>
      <div style={{ fontSize:20, fontWeight:900, color }}>{score}%</div>
      <div style={{ fontSize:11, fontWeight:700, color }}>{letter}</div>
    </div>
  )
}

function Widget({ onClick, children, style={}, title, titleRight }) {
  return (
    <div onClick={onClick}
      style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:'16px', marginBottom:12, cursor:onClick?'pointer':'default', transition:'border-color 0.12s', ...style }}
      onMouseEnter={e=>{ if(onClick) e.currentTarget.style.borderColor='var(--school-color)' }}
      onMouseLeave={e=>{ e.currentTarget.style.borderColor = style.border?.split(' ').pop()||C.border }}>
      {(title||titleRight) && (
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          {title && <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{title}</div>}
          {titleRight}
        </div>
      )}
      {children}
    </div>
  )
}

function ActionBtn({ label, color, onClick, style={} }) {
  return (
    <button onClick={e=>{ e.stopPropagation(); onClick?.() }}
      style={{ background:`${color}20`, color, border:`1px solid ${color}40`, borderRadius:10, padding:'7px 13px', fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', ...style }}>
      {label}
    </button>
  )
}

function SubPage({ children }) {
  useEffect(()=>{ scrollTop() },[])
  return <div style={{ minHeight:'100vh', background:C.bg, paddingBottom:80 }}>{children}</div>
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
// On home: Grades · Messages · 🏠 Home · Lessons · 🔔 Alerts  (5 items)
// On sub:  ← Back · Grades · Messages · Lessons · 🔔 Alerts   (5 items, Home removed)
function BottomNav({ active, onSelect, isSubPage }) {
  const homeItems = [
    { id:'gradebook',      icon:'📊', label:'Grades'   },
    { id:'parentMessages', icon:'💬', label:'Messages' },
    { id:'dashboard',      icon:'🏠', label:'Home'     },
    { id:'lessonPlan',     icon:'📋', label:'Lessons'  },
    { id:'alerts',         icon:'🔔', label:'Alerts'   },
  ]
  const subItems = [
    { id:'__back__',       icon:'←',  label:'Back'     },
    { id:'gradebook',      icon:'📊', label:'Grades'   },
    { id:'parentMessages', icon:'💬', label:'Messages' },
    { id:'lessonPlan',     icon:'📋', label:'Lessons'  },
    { id:'alerts',         icon:'🔔', label:'Alerts'   },
  ]
  const items = isSubPage ? subItems : homeItems

  return (
    <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:200, background:'rgba(6,8,16,0.97)', backdropFilter:'blur(20px)', borderTop:`1px solid ${C.border}`, padding:`8px 0 max(14px,env(safe-area-inset-bottom))`, display:'grid', gridTemplateColumns:`repeat(${items.length},1fr)` }}>
      {items.map(item=>{
        const isActive = item.id===active && item.id!=='__back__'
        return (
          <button key={item.id} onClick={()=>onSelect(item.id)}
            style={{ background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'5px 2px', position:'relative' }}>
            <span style={{ fontSize:item.id==='__back__'?20:18, transition:'transform 0.15s', transform:isActive?'scale(1.15)':'scale(1)', color:item.id==='__back__'?C.soft:'inherit' }}>{item.icon}</span>
            <span style={{ fontSize:9, fontWeight:isActive?700:400, color:isActive?'var(--school-color)':C.muted }}>{item.label}</span>
            {isActive && <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:24, height:2, background:'var(--school-color)', borderRadius:1 }}/>}
          </button>
        )
      })}
    </div>
  )
}

// ─── STICKY HEADER (no camera/hamburger — those live in App.jsx) ──────────────
function StickyHeader({ teacher }) {
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour<12?'Good morning':hour<17?'Good afternoon':'Good evening'
  const timeStr = now.toLocaleTimeString('en-US',{ hour:'numeric', minute:'2-digit' })

  return (
    <div style={{ position:'sticky', top:0, zIndex:100, background:'linear-gradient(135deg, var(--school-color) 0%, var(--school-surface,#0a000a) 100%)', padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.55)', fontWeight:700, letterSpacing:'0.06em', marginBottom:2 }}>
            {teacher.school?.toUpperCase()}
          </div>
          <div style={{ fontSize:17, fontWeight:800, color:'#fff', lineHeight:1.2 }}>
            {greeting}, {teacher.name.split(' ').pop()} 👋
          </div>
        </div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', fontWeight:600 }}>{timeStr}</div>
      </div>
      <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', marginTop:4 }}>
        {now.toLocaleDateString('en-US',{ weekday:'long', month:'long', day:'numeric' })}
      </div>
    </div>
  )
}

// ─── TODAY'S LESSONS WIDGET ───────────────────────────────────────────────────
function TodaysLessonsWidget({ navigate }) {
  const { classes, setActiveLessonClass, setLessonStatus, getTodayLesson } = useStore()
  const [activeClassId, setActiveClassId] = useState(classes[0]?.id||1)
  const lesson = getTodayLesson(activeClassId)

  function openLesson() { setActiveLessonClass(activeClassId); navigate('lessonPlan') }
  function markDone(e) { e.stopPropagation(); setLessonStatus(activeClassId,'done') }
  function markTBD(e)  { e.stopPropagation(); setLessonStatus(activeClassId,'tbd')  }

  return (
    <Widget onClick={openLesson} style={{ background:'linear-gradient(135deg,#071a30 0%,#0a0a1a 100%)', border:'1px solid #1a3050' }}>
      <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:10 }}>TODAY'S LESSONS</div>
      <div style={{ display:'flex', gap:6, marginBottom:12, overflowX:'auto', paddingBottom:2 }}>
        {classes.map(c=>(
          <button key={c.id} onClick={e=>{ e.stopPropagation(); setActiveClassId(c.id) }}
            style={{ padding:'4px 10px', borderRadius:999, border:'none', cursor:'pointer', fontSize:10, fontWeight:700, whiteSpace:'nowrap', flexShrink:0, background:activeClassId===c.id?c.color:'rgba(255,255,255,0.08)', color:activeClassId===c.id?'#fff':'rgba(255,255,255,0.5)' }}>
            {c.period} · {c.subject}
          </button>
        ))}
      </div>
      {lesson ? (
        <>
          {lesson.status==='tbd' && (
            <div style={{ background:'#2a1f0a', border:'1px solid rgba(245,166,35,0.3)', borderRadius:8, padding:'5px 10px', fontSize:10, color:C.amber, fontWeight:700, marginBottom:8, display:'inline-block' }}>⟳ TBD — Repeating this session</div>
          )}
          <div style={{ fontSize:15, fontWeight:800, color:'#fff', marginBottom:4, lineHeight:1.3 }}>{lesson.title}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', marginBottom:12 }}>{[lesson.pages,lesson.duration].filter(Boolean).join(' · ')}</div>
          {lesson.objective && (
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.65)', marginBottom:12, lineHeight:1.5, fontStyle:'italic' }}>"{lesson.objective.substring(0,80)}{lesson.objective.length>80?'...':''}"</div>
          )}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            <ActionBtn label="📋 Full Plan" color={C.teal} onClick={openLesson}/>
            {lesson.status!=='done' && <>
              <ActionBtn label="✓ Done" color={C.green} onClick={markDone}/>
              <ActionBtn label="⟳ TBD"  color={C.amber} onClick={markTBD}/>
            </>}
            {lesson.status==='done' && <span style={{ fontSize:11, color:C.green, fontWeight:700, alignSelf:'center' }}>✓ Lesson completed</span>}
          </div>
        </>
      ) : (
        <div style={{ textAlign:'center', padding:'20px 0' }}>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:10 }}>No lesson scheduled for this class</div>
          <ActionBtn label="+ Create Lesson" color={C.teal} onClick={openLesson}/>
        </div>
      )}
    </Widget>
  )
}

// ─── ADD WIDGETS BAR ──────────────────────────────────────────────────────────
function AddWidgetsBar() {
  const [open, setOpen] = useState(false)
  const WIDGETS = [
    { icon:'📊', name:'Daily Overview' }, { icon:'📖', name:"Today's Lessons" },
    { icon:'📚', name:'My Classes'     }, { icon:'⚑',  name:'Needs Attention' },
    { icon:'💬', name:'Messages'       }, { icon:'📢', name:'Class Feed'       },
    { icon:'📈', name:'Reports'        }, { icon:'📋', name:'Lesson Plans'     },
    { icon:'🧪', name:'Testing Suite'  }, { icon:'📷', name:'Grading Scan'     },
    { icon:'🔔', name:'Reminders'      }, { icon:'✏',  name:'Sketchpad'        },
    { icon:'🔗', name:'Integrations'   }, { icon:'📉', name:'Progress Graph'   },
  ]
  return (
    <div style={{ margin:'8px 12px 0', marginBottom:open?12:24 }}>
      {open ? (
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.text }}>＋ Widget Library</div>
            <button onClick={()=>setOpen(false)} style={{ background:C.inner, border:'none', borderRadius:8, padding:'5px 10px', color:C.muted, cursor:'pointer', fontSize:13 }}>✕</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
            {WIDGETS.map(w=>(
              <button key={w.name} style={{ background:C.inner, border:`1px solid ${C.border}`, borderRadius:12, padding:'10px 6px', cursor:'pointer', textAlign:'center' }}
                onMouseEnter={e=>(e.currentTarget.style.borderColor='var(--school-color)')}
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

// ─── PARENT MESSAGES WIDGET — matches layout4 D6 exactly ─────────────────────
const WIDGET_MSGS = [
  { id:1, studentName:'Marcus T.', subject:'Math', trigger:'Failed 58%', tone:'Warm & Friendly', lang:'English', status:'pending',
    preview:"Dear Parent, Marcus received 58% on his Math assessment. I'd love to connect this week to discuss support options." },
  { id:2, studentName:'Aaliyah B.', subject:'Reading', trigger:'Improved +12pts', tone:'Celebrating', lang:'English', status:'sent',
    preview:"Great news! Aaliyah improved her Reading score by 12 points this month. She should be so proud!" },
]

function ParentMessagesWidget({ navigate }) {
  const [tab,      setTab]      = useState('pending')
  const [autoSend, setAutoSend] = useState(false)

  const filtered = tab==='all' ? WIDGET_MSGS : tab==='sent' ? WIDGET_MSGS.filter(m=>m.status==='sent') : WIDGET_MSGS.filter(m=>m.status==='pending')
  const pendingCount = WIDGET_MSGS.filter(m=>m.status==='pending').length

  return (
    <div style={{ background:'linear-gradient(135deg,#0d0820 0%,#060810 100%)', border:`1px solid ${C.purple}25`, borderRadius:20, padding:'16px', marginBottom:12 }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
        <div>
          <div style={{ fontSize:14, fontWeight:800, color:C.text }}>Parent Messages</div>
          <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>Every negative has a positive version · AI writes both · Multilingual</div>
        </div>
        <button onClick={e=>{ e.stopPropagation(); navigate('parentMessages') }}
          style={{ background:`${C.purple}18`, color:C.purple, border:`1px solid ${C.purple}30`, borderRadius:9, padding:'5px 10px', fontSize:10, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
          See all →
        </button>
      </div>

      {/* Pending / Sent / All tabs */}
      <div style={{ display:'flex', gap:6, margin:'10px 0 12px' }}>
        {[['pending',`Pending`],['sent','Sent'],['all','All']].map(([k,l])=>(
          <button key={k} onClick={e=>{ e.stopPropagation(); setTab(k) }}
            style={{ padding:'5px 12px', borderRadius:999, border:'none', cursor:'pointer', fontSize:10, fontWeight:700,
              background:tab===k?C.amber:C.inner, color:tab===k?'#000':C.muted }}>
            {k==='pending' && pendingCount>0 ? `Pending (${pendingCount})` : l}
          </button>
        ))}
      </div>

      {/* Message rows */}
      {filtered.map(m=>(
        <div key={m.id} style={{ background:C.inner, borderRadius:13, padding:'11px 13px', marginBottom:9, border:`1px solid ${m.status==='pending'?C.amber+'30':C.border}` }}>
          {/* Row 1: student + trigger + status badge */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ fontSize:12, color:C.amber }}>⚑</span>
              <span style={{ fontSize:12, fontWeight:700, color:C.text }}>{m.studentName} — {m.subject} · {m.trigger}</span>
            </div>
            <span style={{ fontSize:9, fontWeight:700, borderRadius:999, padding:'2px 7px', flexShrink:0,
              background:m.status==='pending'?`${C.amber}18`:`${C.green}18`, color:m.status==='pending'?C.amber:C.green }}>
              {m.status==='pending'?'Pending':'Sent ✓'}
            </span>
          </div>
          {/* Row 2: AI metadata */}
          <div style={{ fontSize:10, color:C.muted, marginBottom:8 }}>
            AI drafted · {m.tone} · {m.lang} · 👍😊
          </div>
          {/* Row 3: message preview */}
          <div style={{ fontSize:11, color:C.soft, lineHeight:1.5, marginBottom:10,
            overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
            {m.preview}
          </div>
          {/* Row 4: action buttons */}
          {m.status==='pending' && (
            <div style={{ display:'flex', gap:6 }}>
              <button onClick={e=>{ e.stopPropagation(); navigate('parentMessages') }}
                style={{ background:`${C.green}18`, color:C.green, border:`1px solid ${C.green}35`, borderRadius:9, padding:'6px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                Send ✓
              </button>
              <button onClick={e=>{ e.stopPropagation(); navigate('parentMessages') }}
                style={{ background:`${C.blue}18`, color:C.blue, border:`1px solid ${C.blue}35`, borderRadius:9, padding:'6px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                ← Edit
              </button>
              <button onClick={e=>{ e.stopPropagation(); navigate('parentMessages') }}
                style={{ background:`${C.red}15`, color:C.red, border:`1px solid ${C.red}30`, borderRadius:9, padding:'6px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                ✕ Skip
              </button>
            </div>
          )}
        </div>
      ))}

      {filtered.length===0 && (
        <div style={{ fontSize:12, color:C.muted, textAlign:'center', padding:'10px 0' }}>No messages in this category</div>
      )}

      {/* Auto-send toggle row */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0 6px', borderTop:`1px solid ${C.border}` }}>
        <span style={{ fontSize:11, color:C.muted }}>Auto-send "Failed" messages</span>
        <div onClick={e=>{ e.stopPropagation(); setAutoSend(v=>!v) }}
          style={{ width:38, height:22, borderRadius:11, background:autoSend?C.green:C.inner, cursor:'pointer', position:'relative', transition:'background 0.2s', border:`1px solid ${C.border}` }}>
          <div style={{ width:16, height:16, borderRadius:'50%', background:'#fff', position:'absolute', top:2, left:autoSend?19:2, transition:'left 0.2s' }}/>
        </div>
      </div>

      {/* Positive version notice */}
      <div style={{ background:`${C.green}10`, border:`1px solid ${C.green}20`, borderRadius:9, padding:'7px 10px', marginTop:4, fontSize:10, color:C.green, fontWeight:600 }}>
        ★ Positive version "Improved / Great Work" also drafted and ready
      </div>
    </div>
  )
}

// ─── REMINDERS PAGE ───────────────────────────────────────────────────────────
function RemindersPage({ onBack }) {
  const { reminders, addReminder, toggleReminder, deleteReminder } = useStore()
  const [text, setText] = useState('')
  const priorities = { high:C.red, medium:C.amber, low:C.muted }
  return (
    <SubPage>
      <div style={{ padding:'20px 16px 0', display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <button onClick={onBack} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
        <h1 style={{ fontSize:22, fontWeight:800, color:C.text, margin:0 }}>🔔 Reminders</h1>
      </div>
      <div style={{ margin:'0 16px 16px', display:'flex', gap:8 }}>
        <input style={{ flex:1, background:C.inner, border:`1px solid ${C.border}`, borderRadius:12, padding:'10px 14px', color:C.text, fontSize:13, outline:'none' }}
          placeholder="Add a reminder..." value={text} onChange={e=>setText(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&text.trim()&&(addReminder(text.trim()),setText(''))}/>
        <button onClick={()=>{ if(text.trim()){ addReminder(text.trim()); setText('') }}}
          style={{ background:'var(--school-color)', border:'none', borderRadius:12, padding:'10px 18px', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>Add</button>
      </div>
      <div style={{ padding:'0 16px' }}>
        {reminders.map(r=>(
          <div key={r.id} style={{ background:C.card, border:`1px solid ${priorities[r.priority]}30`, borderLeft:`3px solid ${priorities[r.priority]}`, borderRadius:14, padding:'12px 14px', marginBottom:8, display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={()=>toggleReminder(r.id)}
              style={{ width:24, height:24, borderRadius:'50%', border:`2px solid ${r.done?C.green:C.border}`, background:r.done?`${C.green}20`:'transparent', cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', color:C.green, fontSize:12 }}>
              {r.done?'✓':''}
            </button>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, color:r.done?C.muted:C.text, textDecoration:r.done?'line-through':'none' }}>{r.text}</div>
              <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>Due: {r.due}</div>
            </div>
            <button onClick={()=>deleteReminder(r.id)} style={{ background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:16 }}>×</button>
          </div>
        ))}
      </div>
    </SubPage>
  )
}

// ─── NEEDS ATTENTION PAGE ─────────────────────────────────────────────────────
function NeedsAttentionPage({ onBack }) {
  const { getNeedsAttention, setActiveStudent, setScreen } = useStore()
  const atRisk = getNeedsAttention()
  return (
    <SubPage>
      <div style={{ padding:'20px 16px 0', display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <button onClick={onBack} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
        <h1 style={{ fontSize:22, fontWeight:800, color:C.text, margin:0 }}>⚑ Needs Attention</h1>
      </div>
      <div style={{ padding:'0 16px' }}>
        {atRisk.map(s=>(
          <div key={s.id} style={{ background:C.card, border:`1px solid ${C.red}30`, borderLeft:`3px solid ${C.red}`, borderRadius:14, padding:'14px 16px', marginBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:C.text }}>{s.name}</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{s.grade<70?`${s.grade}% — below passing`:s.submitUngraded?'Submitted — ungraded':'Flagged for review'}</div>
              </div>
              <GradeBadge score={s.grade}/>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <ActionBtn label="📩 Message Parent" color={C.purple} onClick={()=>{}}/>
              <ActionBtn label="✏ View Profile" color={C.blue} onClick={()=>{ setActiveStudent(s); setScreen('studentProfile') }}/>
            </div>
          </div>
        ))}
        {atRisk.length===0 && (
          <div style={{ textAlign:'center', padding:40, color:C.muted }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🎉</div>
            <div style={{ fontSize:15, fontWeight:700 }}>All students on track!</div>
          </div>
        )}
      </div>
    </SubPage>
  )
}

// ─── CLASSES PAGE ─────────────────────────────────────────────────────────────
function ClassesPage({ onBack, navigate }) {
  const { classes, setActiveClass } = useStore()
  return (
    <SubPage>
      <div style={{ padding:'20px 16px 0', display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <button onClick={onBack} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
        <h1 style={{ fontSize:22, fontWeight:800, color:C.text, margin:0 }}>📚 My Classes</h1>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, padding:'0 16px' }}>
        {classes.map(cls=>(
          <button key={cls.id} onClick={()=>{ setActiveClass(cls); navigate('gradebook') }}
            style={{ background:C.card, border:`1px solid ${C.border}`, borderLeft:`4px solid ${cls.color}`, borderRadius:16, padding:16, textAlign:'left', cursor:'pointer' }}
            onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.02)')}
            onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}>
            <div style={{ fontWeight:700, fontSize:13, color:C.text, marginBottom:4 }}>{cls.period} · {cls.subject}</div>
            <div style={{ fontSize:10, color:C.muted, marginBottom:10 }}>{cls.students} students</div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:26, fontWeight:900, color:'#fff' }}>{cls.gpa}</span>
              <TrendBadge trend={cls.trend}/>
            </div>
            {cls.needsAttention>0 && <div style={{ fontSize:9, color:C.red, marginTop:6, fontWeight:700 }}>⚑ {cls.needsAttention} need attention</div>}
          </button>
        ))}
      </div>
    </SubPage>
  )
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────
function SettingsPage({ onBack, navigate }) {
  const items = [
    { icon:'🔗', label:'Integrations',    sub:'Sync gradebooks, LMS, curriculum',  page:'integrations' },
    { icon:'⚖',  label:'Grading Setup',   sub:'Category weights & grading method', page:'gradebook'    },
    { icon:'📚', label:'Curriculum Links', sub:'Connect textbooks for auto-lessons',page:'integrations' },
    { icon:'🎨', label:'School Branding',  sub:'Colors, logo, school name',         page:null           },
    { icon:'🔔', label:'Notifications',   sub:'Alerts, emails, push settings',     page:null           },
    { icon:'👤', label:'Account & Profile',sub:'Name, email, password',            page:null           },
  ]
  return (
    <SubPage>
      <div style={{ padding:'20px 16px 0', display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <button onClick={onBack} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
        <h1 style={{ fontSize:22, fontWeight:800, color:C.text, margin:0 }}>⚙ Settings</h1>
      </div>
      <div style={{ padding:'0 16px', display:'flex', flexDirection:'column', gap:8 }}>
        {items.map(item=>(
          <button key={item.label} onClick={()=>item.page&&navigate(item.page)}
            style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:'14px 16px', textAlign:'left', cursor:item.page?'pointer':'default', opacity:item.page?1:0.5, display:'flex', alignItems:'center', gap:14 }}>
            <span style={{ fontSize:24 }}>{item.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{item.label}</div>
              <div style={{ fontSize:11, color:C.muted }}>{item.sub}</div>
            </div>
            {item.page ? <span style={{ color:C.muted, fontSize:18 }}>›</span> : <span style={{ background:C.inner, color:C.muted, fontSize:9, fontWeight:700, padding:'2px 8px', borderRadius:999 }}>Soon</span>}
          </button>
        ))}
      </div>
    </SubPage>
  )
}

// ─── ALERTS PAGE ─────────────────────────────────────────────────────────────
function AlertsPage({ onBack }) {
  const { messages, getNeedsAttention } = useStore()
  const pending = messages.filter(m=>m.status==='pending')
  const atRisk  = getNeedsAttention()
  const alerts  = [
    ...pending.map(m=>({ id:`msg-${m.id}`, icon:'💬', color:C.purple, msg:`New message pending for ${m.studentName} — ${m.trigger}`, time:'Recent' })),
    ...atRisk.map(s=>({ id:`risk-${s.id}`, icon:'⚑',  color:C.red,    msg:`${s.name} — ${s.grade}% ${s.grade<70?'(failing)':'needs attention'}`, time:'Today' })),
  ]
  return (
    <SubPage>
      <div style={{ padding:'20px 16px 0', display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <button onClick={onBack} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
        <h1 style={{ fontSize:22, fontWeight:800, color:C.text, margin:0 }}>🔔 Alerts</h1>
      </div>
      <div style={{ padding:'0 16px' }}>
        {alerts.length===0 && <div style={{ textAlign:'center', padding:40, color:C.muted }}><div style={{ fontSize:40 }}>🎉</div><div style={{ marginTop:12, fontWeight:700 }}>All clear!</div></div>}
        {alerts.map(a=>(
          <div key={a.id} style={{ background:C.card, border:`1px solid ${a.color}30`, borderLeft:`3px solid ${a.color}`, borderRadius:14, padding:'14px 16px', marginBottom:10 }}>
            <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
              <span style={{ fontSize:18 }}>{a.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, color:C.text }}>{a.msg}</div>
                <div style={{ fontSize:10, color:C.muted, marginTop:4 }}>{a.time}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SubPage>
  )
}

// ─── HOME FEED ────────────────────────────────────────────────────────────────
function HomeFeed({ navigate }) {
  const store = useStore()
  const { classes, messages, reminders, getNeedsAttention } = store
  const pending = messages.filter(m=>m.status==='pending')
  const atRisk  = getNeedsAttention()

  // Daily overview: Classes · Messages · Lesson Plans · Alerts
  const overviewTiles = [
    { icon:'📚', val:classes.length,      label:'Classes',      page:'classes',        color:C.blue   },
    { icon:'💬', val:pending.length||'',  label:'Messages',     page:'parentMessages', color:C.purple },
    { icon:'📋', val:'',                  label:'Lesson Plans', page:'lessonPlan',     color:C.teal   },
    { icon:'🔔', val:atRisk.length||'',   label:'Alerts',       page:'alerts',         color:C.red    },
  ]

  return (
    <div style={{ padding:'12px 12px 0' }}>

      {/* W1: Daily Overview */}
      <Widget style={{ background:'var(--school-surface,#1a0008)', border:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:12 }}>DAILY OVERVIEW</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
          {overviewTiles.map(tile=>(
            <button key={tile.label} onClick={e=>{ e.stopPropagation(); navigate(tile.page) }}
              style={{ background:`${tile.color}18`, border:`1px solid ${tile.color}30`, borderRadius:14, padding:'10px 4px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, transition:'background 0.15s' }}
              onMouseEnter={e=>(e.currentTarget.style.background=`${tile.color}30`)}
              onMouseLeave={e=>(e.currentTarget.style.background=`${tile.color}18`)}>
              <span style={{ fontSize:16 }}>{tile.icon}</span>
              {tile.val!=='' && <span style={{ fontSize:16, fontWeight:900, color:tile.color, lineHeight:1 }}>{tile.val}</span>}
              <span style={{ fontSize:8, color:'rgba(255,255,255,0.5)', textAlign:'center', fontWeight:600 }}>{tile.label}</span>
            </button>
          ))}
        </div>
      </Widget>

      {/* W2: Today's Lessons */}
      <TodaysLessonsWidget navigate={navigate}/>

      {/* W3: My Classes */}
      <Widget onClick={()=>navigate('classes')} title="📚 My Classes" titleRight={<ActionBtn label="+ Add" color={C.blue} onClick={()=>navigate('gradebook')}/>}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {classes.map(cls=>(
            <button key={cls.id} onClick={e=>{ e.stopPropagation(); store.setActiveClass(cls); navigate('gradebook') }}
              style={{ background:C.inner, borderRadius:14, padding:'12px 14px', border:'none', borderLeft:`3px solid ${cls.color}`, cursor:'pointer', textAlign:'left', transition:'background 0.15s' }}
              onMouseEnter={e=>(e.currentTarget.style.background=C.raised)}
              onMouseLeave={e=>(e.currentTarget.style.background=C.inner)}>
              <div style={{ fontWeight:700, fontSize:12, color:C.text, marginBottom:2 }}>{cls.period} · {cls.subject}</div>
              <div style={{ fontSize:10, color:C.muted, marginBottom:8 }}>{cls.students} students</div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:22, fontWeight:900, color:'#fff' }}>{cls.gpa}</span>
                <TrendBadge trend={cls.trend}/>
              </div>
              {cls.needsAttention>0 && <div style={{ fontSize:9, color:C.red, marginTop:4, fontWeight:700 }}>⚑ {cls.needsAttention} need attention</div>}
            </button>
          ))}
        </div>
      </Widget>

      {/* W4: Needs Attention */}
      {atRisk.length>0 && (
        <Widget onClick={()=>navigate('attention')} style={{ border:`1px solid ${C.red}25` }} title="⚑ Needs Attention"
          titleRight={<span style={{ background:`${C.red}18`, color:C.red, fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:999 }}>{atRisk.length}</span>}>
          {atRisk.slice(0,3).map(s=>(
            <div key={s.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:C.inner, borderRadius:10, padding:'10px 12px', marginBottom:6 }}>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:C.text }}>{s.name}</div>
                <div style={{ fontSize:10, color:C.muted }}>{s.grade<70?`${s.grade}% — failing`:s.submitUngraded?'Ungraded work':'Flagged'}</div>
              </div>
              <span style={{ fontSize:13, fontWeight:800, color:C.red }}>{s.grade}%</span>
            </div>
          ))}
          {atRisk.length>3 && <div style={{ fontSize:11, color:C.muted, textAlign:'center', marginTop:4 }}>+{atRisk.length-3} more students</div>}
        </Widget>
      )}

      {/* W5: Parent Messages */}
      <ParentMessagesWidget navigate={navigate}/>

      {/* W6: Reports */}
      <Widget onClick={()=>navigate('reports')} style={{ background:'linear-gradient(135deg,#0a1628 0%,#060810 100%)', border:'1px solid #1a2a40' }}
        title="📈 Reports" titleRight={<ActionBtn label="View All →" color={C.blue} onClick={()=>navigate('reports')}/>}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          {[
            { label:'Class Mastery', val:'87%',  icon:'🏆', color:C.green },
            { label:'At Risk',       val:atRisk.length, icon:'⚑', color:C.red },
            { label:'Avg GPA',       val:(classes.reduce((s,c)=>s+c.gpa,0)/classes.length).toFixed(1), icon:'📊', color:C.blue },
          ].map(stat=>(
            <div key={stat.label} style={{ background:C.inner, borderRadius:12, padding:'12px 10px', textAlign:'center' }}>
              <div style={{ fontSize:18, marginBottom:4 }}>{stat.icon}</div>
              <div style={{ fontSize:18, fontWeight:900, color:stat.color }}>{stat.val}</div>
              <div style={{ fontSize:9, color:C.muted, marginTop:2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </Widget>

      {/* W7: Testing Suite */}
      <Widget onClick={()=>navigate('testingSuite')} style={{ background:'linear-gradient(135deg,#0d0a1e 0%,#060810 100%)', border:`1px solid ${C.purple}25` }}
        title="🧪 Testing Suite" titleRight={<ActionBtn label="Create Test →" color={C.purple} onClick={()=>navigate('testingSuite')}/>}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          {[
            { icon:'🔒', label:'Lockdown',   sub:'External URL',     color:C.blue   },
            { icon:'🏗',  label:'Builder',    sub:'MC · T/F · Essay', color:C.green  },
            { icon:'📄', label:'File Import', sub:'AI digitizes',     color:C.purple },
          ].map(mode=>(
            <button key={mode.label} onClick={e=>{ e.stopPropagation(); navigate('testingSuite') }}
              style={{ background:`${mode.color}12`, border:`1px solid ${mode.color}25`, borderRadius:12, padding:'10px 6px', cursor:'pointer', textAlign:'center' }}>
              <div style={{ fontSize:20, marginBottom:4 }}>{mode.icon}</div>
              <div style={{ fontSize:10, fontWeight:700, color:mode.color }}>{mode.label}</div>
              <div style={{ fontSize:9, color:C.muted, marginTop:2 }}>{mode.sub}</div>
            </button>
          ))}
        </div>
      </Widget>

      {/* W8: Lesson Plans */}
      <Widget onClick={()=>navigate('lessonPlan')} style={{ background:'linear-gradient(135deg,#071a30 0%,#060810 100%)', border:`1px solid ${C.teal}25` }}
        title="📋 Lesson Plans" titleRight={<ActionBtn label="View All →" color={C.teal} onClick={()=>navigate('lessonPlan')}/>}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          {[
            { icon:'✨', label:'AI Generate', sub:'From TEKS/standard', color:C.purple },
            { icon:'📝', label:'Build',       sub:'From scratch',       color:C.teal   },
            { icon:'📤', label:'Upload',      sub:'PDF · CSV · Word',   color:C.blue   },
          ].map(mode=>(
            <button key={mode.label} onClick={e=>{ e.stopPropagation(); navigate('lessonPlan') }}
              style={{ background:`${mode.color}12`, border:`1px solid ${mode.color}25`, borderRadius:12, padding:'10px 6px', cursor:'pointer', textAlign:'center' }}>
              <div style={{ fontSize:20, marginBottom:4 }}>{mode.icon}</div>
              <div style={{ fontSize:10, fontWeight:700, color:mode.color }}>{mode.label}</div>
              <div style={{ fontSize:9, color:C.muted, marginTop:2 }}>{mode.sub}</div>
            </button>
          ))}
        </div>
      </Widget>

      {/* W9: Reminders */}
      <Widget onClick={()=>navigate('reminders')} title="🔔 Reminders" titleRight={<ActionBtn label="+ Add" color={C.amber} onClick={()=>navigate('reminders')}/>}>
        {reminders.filter(r=>!r.done).slice(0,3).map(r=>(
          <div key={r.id} style={{ display:'flex', alignItems:'center', gap:10, background:C.inner, borderRadius:10, padding:'9px 12px', marginBottom:6 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:r.priority==='high'?C.red:r.priority==='medium'?C.amber:C.muted, flexShrink:0 }}/>
            <div style={{ flex:1, fontSize:12, color:C.text }}>{r.text}</div>
            <div style={{ fontSize:10, color:C.muted }}>{r.due}</div>
          </div>
        ))}
        {reminders.filter(r=>!r.done).length===0 && <div style={{ fontSize:12, color:C.muted, textAlign:'center', padding:'8px 0' }}>All caught up! 🎉</div>}
      </Widget>

      {/* W10: Integrations */}
      <Widget onClick={()=>navigate('integrations')} style={{ background:'linear-gradient(135deg,#0a0f1e 0%,#060810 100%)', border:`1px solid ${C.teal}20` }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <span style={{ fontSize:28 }}>🔗</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.teal, marginBottom:2 }}>Sync your tools</div>
            <div style={{ fontSize:11, color:C.muted }}>Connect PowerSchool, Google Classroom, Canvas & more</div>
          </div>
          <span style={{ color:C.teal, fontSize:18 }}>›</span>
        </div>
      </Widget>

      {/* Add Widgets */}
      <AddWidgetsBar/>
    </div>
  )
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function Dashboard({ currentUser, onCameraClick }) {
  const store = useStore()
  const { teacher, activeScreen, activeLessonClassId } = store

  const [subPage,   setSubPage]   = useState(null)
  const [activeNav, setActiveNav] = useState('dashboard')

  useEffect(()=>{ applyTheme('kipp'); scrollTop() },[])

  useEffect(()=>{ if(activeScreen==='studentProfile') setSubPage('studentProfile') },[activeScreen])

  function goHome() { setSubPage(null); setActiveNav('dashboard'); store.setScreen('dashboard'); scrollTop() }

  function navigate(id) {
    if(!id) return
    if(id==='dashboard') { goHome(); return }
    if(id==='logout')    { goHome(); return }
    setSubPage(id)
    setActiveNav(id==='gradebook'?'gradebook':id==='parentMessages'?'parentMessages':id==='lessonPlan'?'lessonPlan':id==='alerts'?'alerts':activeNav)
    scrollTop()
  }

  function navSelect(id) {
    if(id==='__back__') { goHome(); return }
    navigate(id)
    setActiveNav(id)
  }

  const isSubPage = subPage !== null
  const withNav = (node) => (
    <>
      {node}
      <BottomNav active={activeNav} onSelect={navSelect} isSubPage={isSubPage}/>
    </>
  )

  if(subPage==='gradebook')      return withNav(<SubPage><Gradebook      onBack={goHome}/></SubPage>)
  if(subPage==='lessonPlan')     return withNav(<SubPage><LessonPlan     initialMode="view" classId={activeLessonClassId} onBack={goHome}/></SubPage>)
  if(subPage==='parentMessages') return withNav(<SubPage><ParentMessages onBack={goHome}/></SubPage>)
  if(subPage==='reports')        return withNav(<SubPage><Reports        onBack={goHome}/></SubPage>)
  if(subPage==='testingSuite')   return withNav(<SubPage><TestingSuite   onBack={goHome}/></SubPage>)
  if(subPage==='classFeed')      return withNav(<SubPage><ClassFeed      onBack={goHome} viewerRole="teacher"/></SubPage>)
  if(subPage==='studentProfile') return withNav(<SubPage><StudentProfile onBack={goHome}/></SubPage>)
  if(subPage==='camera')         return withNav(<SubPage><Camera         onBack={goHome}/></SubPage>)
  if(subPage==='integrations')   return withNav(<SubPage><Integrations   onBack={goHome}/></SubPage>)
  if(subPage==='reminders')      return withNav(<RemindersPage     onBack={goHome}/>)
  if(subPage==='attention')      return withNav(<NeedsAttentionPage onBack={goHome}/>)
  if(subPage==='alerts')         return withNav(<AlertsPage        onBack={goHome}/>)
  if(subPage==='classes')        return withNav(<ClassesPage  onBack={goHome} navigate={navigate}/>)
  if(subPage==='settings')       return withNav(<SettingsPage onBack={goHome} navigate={navigate}/>)

  return withNav(
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", paddingBottom:90 }}>
      <StickyHeader teacher={teacher}/>
      <HomeFeed navigate={navigate}/>
    </div>
  )
}
