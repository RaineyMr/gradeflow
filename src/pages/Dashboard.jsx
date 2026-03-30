import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import BottomNav      from '../components/ui/BottomNav'
import Gradebook      from './Gradebook'
import LessonPlan     from './LessonPlan'
import Reports        from './Reports'
import TestingSuite   from './TestingSuite'
import ClassFeed      from './ClassFeed'
import StudentProfile from '@pages/StudentProfile'
import ParentMessages from '@pages/ParentMessages'
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

// ─── STICKY HEADER ────────────────────────────────────────────────────────────
function StickyHeader({ teacher }) {
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour<12?'Good morning':hour<17?'Good afternoon':'Good evening'
  const timeStr = now.toLocaleTimeString('en-US',{ hour:'numeric', minute:'2-digit' })
  return (
    <div style={{ position:'sticky', top:0, zIndex:100, background:'linear-gradient(135deg, var(--school-color) 0%, var(--school-surface,#0a000a) 100%)', padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.55)', fontWeight:700, letterSpacing:'0.06em', marginBottom:2 }}>{teacher.school?.toUpperCase()}</div>
          <div style={{ fontSize:17, fontWeight:800, color:'#fff', lineHeight:1.2 }}>{greeting}, {teacher.name.split(' ').pop()} 👋</div>
        </div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', fontWeight:600 }}>{timeStr}</div>
      </div>
      <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', marginTop:4 }}>
        {now.toLocaleDateString('en-US',{ weekday:'long', month:'long', day:'numeric' })}
      </div>
    </div>
  )
}

// ─── TODAY'S LESSONS WIDGET — UNTOUCHED ───────────────────────────────────────
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
          {lesson.status==='tbd' && <div style={{ background:'#2a1f0a', border:'1px solid rgba(245,166,35,0.3)', borderRadius:8, padding:'5px 10px', fontSize:10, color:C.amber, fontWeight:700, marginBottom:8, display:'inline-block' }}>⟳ TBD — Repeating this session</div>}
          <div style={{ fontSize:15, fontWeight:800, color:'#fff', marginBottom:4, lineHeight:1.3 }}>{lesson.title}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', marginBottom:12 }}>{[lesson.pages,lesson.duration].filter(Boolean).join(' · ')}</div>
          {lesson.objective && <div style={{ fontSize:11, color:'rgba(255,255,255,0.65)', marginBottom:12, lineHeight:1.5, fontStyle:'italic' }}>"{lesson.objective.substring(0,80)}{lesson.objective.length>80?'...':''}"</div>}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            <ActionBtn label="📋 Full Plan" color={C.teal} onClick={openLesson}/>
            {lesson.status!=='done' && <><ActionBtn label="✓ Done" color={C.green} onClick={markDone}/><ActionBtn label="⟳ TBD" color={C.amber} onClick={markTBD}/></>}
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

// ─── WIDGET CATALOG ───────────────────────────────────────────────────────────
const WIDGET_CATALOG = [
  { id:'overview',   label:'Daily Overview',      icon:'📅', desc:'Classes, messages, lesson plans & alerts' },
  { id:'lessons',    label:"Today's Lessons",     icon:'📖', desc:'Lesson status and quick actions' },
  { id:'classes',    label:'My Classes',          icon:'📚', desc:'Class GPA and at-risk students' },
  { id:'attention',  label:'Needs Attention',     icon:'⚑',  desc:'Students flagged for follow-up' },
  { id:'messages',   label:'Messages',            icon:'💬', desc:'Parent, student & teacher threads' },
  { id:'reports',    label:'Reports',             icon:'📊', desc:'Grade trends and class analytics' },
  { id:'grading',    label:'Grading',             icon:'✏️', desc:'Quick-grade recent submissions' },
  { id:'lessonPlan', label:'Lesson Plan Builder', icon:'📋', desc:'Build and edit lesson plans' },
  { id:'sketch',     label:'Sketch & Annotate',   icon:'🖊️', desc:'Draw on documents and photos' },
  { id:'testing',    label:'Testing Suite',       icon:'🧪', desc:'Create and proctor assessments' },
  { id:'scan',       label:'Scan Grade Sheet',    icon:'📷', desc:'Camera-grade paper assignments' },
  { id:'gradebook',  label:'Gradebook',           icon:'📓', desc:'Full gradebook and student profiles' },
]

// ─── ADD WIDGETS MODAL ────────────────────────────────────────────────────────
function AddWidgetsModal({ hidden, onToggle, onClose }) {
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxWidth:480, background:C.bg, border:`1px solid ${C.border}`, borderRadius:'24px 24px 0 0', padding:'20px 20px max(28px,env(safe-area-inset-bottom))', maxHeight:'85vh', overflowY:'auto' }}>
        <div style={{ width:36, height:4, background:C.border, borderRadius:2, margin:'0 auto 18px' }}/>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div>
            <div style={{ fontSize:17, fontWeight:800, color:C.text }}>+ Add Widgets</div>
            <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>Tap a widget to add or remove</div>
          </div>
          <button onClick={onClose} style={{ background:C.inner, border:'none', borderRadius:999, width:32, height:32, color:C.soft, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {WIDGET_CATALOG.map(w => {
            const isActive = !hidden.includes(w.id)
            return (
              <button key={w.id} onClick={() => onToggle(w.id)}
                style={{ textAlign:'left', background:isActive ? `${C.green}12` : C.inner, border:`1px solid ${isActive ? `${C.green}35` : C.border}`, borderRadius:14, padding:'12px', cursor:'pointer' }}>
                <div style={{ fontSize:22, marginBottom:6 }}>{w.icon}</div>
                <div style={{ fontSize:12, fontWeight:700, color:C.text }}>{w.label}</div>
                <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{w.desc}</div>
                <div style={{ marginTop:8, fontSize:10, fontWeight:700, color:isActive ? C.red : C.teal }}>{isActive ? '× Remove' : '+ Add'}</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── ADD WIDGETS BAR ─────────────────────────────────────────────────────────
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


// ─── MESSAGES WIDGET (admin-style thread list) ────────────────────────────────
const MSG_THREADS = [
  { id:1, name:'Ms. Thompson', role:'parent', avatar:'👩', subject:'Marcus — Math Assessment', unread:true,  aiDrafted:true,  status:'pending', preview:"Dear Ms. Thompson, Marcus received 58% on his Math assessment. I'd love to connect this week." },
  { id:2, name:'Ms. Brooks',   role:'parent', avatar:'👩', subject:'Aaliyah — Outstanding Progress!', unread:false, aiDrafted:true, status:'sent', preview:"Great news! Aaliyah improved her Reading score by 12 points this month." },
  { id:3, name:'Mr. Rivera',   role:'teacher',avatar:'🧑‍🔬',subject:'Cross-class collaboration', unread:true,  aiDrafted:false, status:'sent', preview:'Hey — thinking our classes could do a joint project on fractions + measurement.' },
  { id:4, name:'Marcus T.',    role:'student', avatar:'👦', subject:'Extra credit opportunity', unread:false, aiDrafted:false, status:'sent', preview:'Hi Marcus! I have an optional extra credit worksheet before the unit test.' },
]

function RoleBadge({ role }) {
  const m = { teacher:{c:C.blue,t:'Teacher'}, student:{c:C.green,t:'Student'}, parent:{c:C.amber,t:'Parent'}, admin:{c:C.purple,t:'Admin'} }
  const b = m[role]||m.teacher
  return <span style={{ background:`${b.c}18`, color:b.c, borderRadius:999, padding:'2px 7px', fontSize:9, fontWeight:700 }}>{b.t}</span>
}

function MessagesWidget({ navigate }) {
  const unread = MSG_THREADS.filter(t=>t.unread).length
  return (
    <Widget style={{ background:'linear-gradient(135deg,#0d0820 0%,#060810 100%)', border:`1px solid ${C.purple}25` }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:800, color:C.text }}>💬 Messages</div>
          <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>Teachers · Students · Parents · Admin</div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {unread>0 && <span style={{ background:`${C.red}28`, color:C.red, borderRadius:999, padding:'2px 8px', fontSize:10, fontWeight:700 }}>{unread} new</span>}
          <button onClick={e=>{ e.stopPropagation(); navigate('parentMessages') }}
            style={{ background:`${C.purple}18`, color:C.purple, border:`1px solid ${C.purple}30`, borderRadius:9, padding:'5px 10px', fontSize:10, fontWeight:700, cursor:'pointer' }}>
            See all →
          </button>
        </div>
      </div>

      {MSG_THREADS.slice(0,3).map(t=>(
        <div key={t.id} onClick={e=>{ e.stopPropagation(); navigate('parentMessages') }}
          style={{ background:t.unread?C.raised:C.inner, border:`1px solid ${t.unread?'var(--school-color)28':C.border}`, borderRadius:13, padding:'10px 12px', marginBottom:8, cursor:'pointer', display:'flex', gap:11, alignItems:'flex-start' }}
          onMouseEnter={e=>(e.currentTarget.style.background=C.raised)}
          onMouseLeave={e=>(e.currentTarget.style.background=t.unread?C.raised:C.inner)}>
          {/* Avatar */}
          <div style={{ position:'relative', flexShrink:0 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--school-color)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{t.avatar}</div>
            {t.unread && <div style={{ position:'absolute', top:-1, right:-1, width:9, height:9, borderRadius:'50%', background:C.red, border:`2px solid ${C.bg}` }}/>}
          </div>
          {/* Content */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:3 }}>
              <span style={{ fontSize:12, fontWeight:700, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.name}</span>
              <RoleBadge role={t.role}/>
              {t.aiDrafted && <span style={{ fontSize:9, color:C.teal }}>✨AI</span>}
              {t.status==='pending' && <span style={{ fontSize:9, color:C.amber, background:`${C.amber}18`, borderRadius:999, padding:'1px 5px', fontWeight:700 }}>Pending</span>}
            </div>
            <div style={{ fontSize:11, color:C.muted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.preview}</div>
          </div>
          {/* Reply arrow */}
          <span style={{ color:C.teal, fontSize:11, fontWeight:700, flexShrink:0, alignSelf:'center' }}>Reply →</span>
        </div>
      ))}

      <div style={{ fontSize:10, color:C.muted, textAlign:'center', padding:'6px 0 0', borderTop:`1px solid ${C.border}` }}>
        ✨ AI writes every message · Every negative has a positive version · Multilingual
      </div>
    </Widget>
  )
}

// ─── NEEDS ATTENTION WIDGET ───────────────────────────────────────────────────
function NeedsAttentionWidget({ atRisk, navigate }) {
  if (atRisk.length === 0) return null
  return (
    <Widget style={{ border:`1px solid ${C.red}25`, background:C.card }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <div style={{ fontSize:13, fontWeight:800, color:C.text }}>⚑ Needs Attention</div>
        <span style={{ background:`${C.red}18`, color:C.red, fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:999 }}>{atRisk.length} students</span>
      </div>
      {/* Inline student names like layout */}
      <div style={{ fontSize:12, color:C.soft, lineHeight:1.8, marginBottom:10 }}>
        {atRisk.slice(0,2).map((s,i)=>(
          <span key={s.id}>
            <span style={{ color:C.text, fontWeight:600 }}>{s.name.split(' ')[0]} {s.name.split(' ')[1]?.[0]}.</span>
            <span style={{ color:C.muted }}> · {s.subject||'Math'} {s.grade}% {s.grade<70?'Failed':s.trend==='down'?`dropped ${Math.abs(s.drop||5)}pts`:''}</span>
            {i<Math.min(atRisk.length,2)-1 && <span style={{ color:C.border }}> · </span>}
          </span>
        ))}
        {atRisk.length>2 && <span style={{ color:C.muted }}> + {atRisk.length-2} more</span>}
      </div>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        <button onClick={e=>{ e.stopPropagation(); navigate('attention') }}
          style={{ background:`${C.red}18`, color:C.red, border:`1px solid ${C.red}30`, borderRadius:9, padding:'6px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
          Tap to view all
        </button>
        <button onClick={e=>{ e.stopPropagation(); navigate('parentMessages') }}
          style={{ background:`${C.purple}18`, color:C.purple, border:`1px solid ${C.purple}30`, borderRadius:9, padding:'6px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
          📩 Message individually or as group
        </button>
      </div>
    </Widget>
  )
}

// ─── REPORTS WIDGET ───────────────────────────────────────────────────────────
function ReportsWidget({ navigate }) {
  const reportLinks = ['Class Mastery', 'Student Report', 'Grade Distribution', 'Needs Attention', 'Comm. Log', 'Progress']
  return (
    <Widget style={{ background:'linear-gradient(135deg,#0a1628 0%,#060810 100%)', border:'1px solid #1a2a40' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div style={{ fontSize:13, fontWeight:800, color:C.text }}>📊 Reports</div>
        <button onClick={e=>{ e.stopPropagation(); navigate('reports') }}
          style={{ background:`${C.blue}18`, color:C.blue, border:`1px solid ${C.blue}30`, borderRadius:9, padding:'5px 10px', fontSize:10, fontWeight:700, cursor:'pointer' }}>
          See all →
        </button>
      </div>
      {/* Text link list */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:'6px 12px', marginBottom:14 }}>
        {reportLinks.map(l=>(
          <button key={l} onClick={e=>{ e.stopPropagation(); navigate('reports') }}
            style={{ background:'none', border:'none', color:C.teal, fontSize:12, fontWeight:600, cursor:'pointer', padding:0, textDecoration:'underline', textDecorationColor:`${C.teal}40` }}>
            {l}
          </button>
        ))}
      </div>
      {/* Export buttons */}
      <div style={{ display:'flex', gap:8, borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
        {[['🖨 Print',C.muted],['↑ PDF',C.blue],['⬛ Spreadsheet',C.green]].map(([label,color])=>(
          <button key={label} onClick={e=>{ e.stopPropagation(); navigate('reports') }}
            style={{ flex:1, background:`${color}15`, color, border:`1px solid ${color}30`, borderRadius:10, padding:'8px 6px', fontSize:10, fontWeight:700, cursor:'pointer' }}>
            {label}
          </button>
        ))}
      </div>
    </Widget>
  )
}

// ─── GRADING WIDGET ───────────────────────────────────────────────────────────
function GradingWidget({ navigate }) {
  const weights = [
    { label:'Test',  pct:'40%', color:C.red   },
    { label:'Quiz',  pct:'30%', color:C.amber  },
    { label:'Part.', pct:'10%', color:C.teal   },
    { label:'Other', pct:'20%', color:C.blue   },
  ]
  return (
    <Widget onClick={()=>navigate('gradebook')} style={{ background:C.card }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
        <div style={{ fontSize:13, fontWeight:800, color:C.text }}>📷 Grading</div>
        <span style={{ fontSize:10, color:C.green, fontWeight:700 }}>Synced: PowerSchool ✓</span>
      </div>
      <div style={{ fontSize:11, color:C.muted, marginBottom:10 }}>
        Last: Today 8:42am · 24 grades · Tap 📷 to scan
      </div>
      {/* Weight chips */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
        <span style={{ fontSize:10, color:C.muted, alignSelf:'center' }}>Weights:</span>
        {weights.map(w=>(
          <span key={w.label} style={{ background:`${w.color}20`, color:w.color, border:`1px solid ${w.color}35`, borderRadius:999, padding:'3px 9px', fontSize:10, fontWeight:700 }}>
            {w.label} {w.pct}
          </span>
        ))}
      </div>
      <button onClick={e=>{ e.stopPropagation(); navigate('settings') }}
        style={{ background:'none', border:'none', color:C.teal, fontSize:11, fontWeight:600, cursor:'pointer', padding:0, textDecoration:'underline' }}>
        Edit in Settings
      </button>
    </Widget>
  )
}

// ─── LESSON PLAN BUILDER WIDGET ───────────────────────────────────────────────
const LESSON_LIST = [
  { id:1, title:'Algorithms',       status:'done',    chips:['Standards','TPAS'] },
  { id:2, title:'Standards / TPAS', status:'pending', chips:['Reminders'] },
  { id:3, title:'Replace 3 J',      status:'tbd',     chips:['Reports','Caleb'] },
]

function LessonPlanWidget({ navigate }) {
  return (
    <Widget style={{ background:'linear-gradient(135deg,#071a30 0%,#060810 100%)', border:`1px solid ${C.teal}25` }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:800, color:C.text }}>📋 Lesson Plan Builder</div>
          <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>AI · TEKS · Standards · Curriculum</div>
        </div>
        <button onClick={e=>{ e.stopPropagation(); navigate('lessonPlan') }}
          style={{ background:`${C.teal}18`, color:C.teal, border:`1px solid ${C.teal}30`, borderRadius:9, padding:'5px 10px', fontSize:10, fontWeight:700, cursor:'pointer' }}>
          Open →
        </button>
      </div>

      {/* Action buttons */}
      <div style={{ display:'flex', gap:7, marginBottom:14, flexWrap:'wrap' }}>
        {[
          { icon:'📤', label:'Upload lesson plan',  color:C.blue   },
          { icon:'✨', label:'AI Generate',          color:C.purple },
          { icon:'📝', label:'Build from scratch',   color:C.teal   },
        ].map(b=>(
          <button key={b.label} onClick={e=>{ e.stopPropagation(); navigate('lessonPlan') }}
            style={{ flex:1, minWidth:80, background:`${b.color}15`, color:b.color, border:`1px solid ${b.color}30`, borderRadius:10, padding:'8px 6px', fontSize:10, fontWeight:700, cursor:'pointer', textAlign:'center' }}>
            <div style={{ fontSize:16, marginBottom:2 }}>{b.icon}</div>
            {b.label}
          </button>
        ))}
      </div>

      {/* Connect textbook */}
      <div style={{ background:C.inner, borderRadius:10, padding:'8px 12px', marginBottom:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:11, color:C.muted }}>Connect textbook:</span>
        <div style={{ display:'flex', gap:6 }}>
          {[['+ PDF',C.red],['Google',C.blue]].map(([l,c])=>(
            <button key={l} onClick={e=>e.stopPropagation()}
              style={{ background:`${c}18`, color:c, border:`1px solid ${c}30`, borderRadius:8, padding:'4px 9px', fontSize:10, fontWeight:700, cursor:'pointer' }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Lesson list */}
      <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Recent Plans</div>
      {LESSON_LIST.map(l=>{
        const statusColor = l.status==='done'?C.green:l.status==='tbd'?C.amber:C.muted
        const statusLabel = l.status==='done'?'✓ Done':l.status==='tbd'?'⟳ TBD':'Not started'
        return (
          <div key={l.id} onClick={e=>{ e.stopPropagation(); navigate('lessonPlan') }}
            style={{ background:C.inner, borderRadius:10, padding:'9px 12px', marginBottom:6, display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer' }}
            onMouseEnter={e=>(e.currentTarget.style.background=C.raised)}
            onMouseLeave={e=>(e.currentTarget.style.background=C.inner)}>
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:3 }}>{l.title}</div>
              <div style={{ display:'flex', gap:4 }}>
                {l.chips.map(c=>(
                  <span key={c} style={{ fontSize:9, color:C.muted, background:C.raised, borderRadius:6, padding:'2px 6px' }}>{c}</span>
                ))}
              </div>
            </div>
            <span style={{ fontSize:10, fontWeight:700, color:statusColor, background:`${statusColor}18`, borderRadius:999, padding:'3px 8px', flexShrink:0, marginLeft:8 }}>{statusLabel}</span>
          </div>
        )
      })}
    </Widget>
  )
}

// ─── SKETCH & ANNOTATE WIDGET ─────────────────────────────────────────────────
function SketchAnnotateWidget({ navigate }) {
  const [uploaded, setUploaded] = useState(false)
  const tools = [
    { icon:'🖊', label:'Highlight' },
    { icon:'✏', label:'Free draw' },
    { icon:'◻', label:'Box'       },
    { icon:'➤', label:'Arrow'     },
    { icon:'T',  label:'Text'      },
  ]
  return (
    <Widget style={{ background:'linear-gradient(135deg,#0a0a1a 0%,#060810 100%)', border:`1px solid ${C.amber}20` }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:800, color:C.text }}>✏ Sketch & Annotate</div>
          <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>Annotate student work · Send back with push notification</div>
        </div>
      </div>

      {/* Upload / Camera area */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
        <button onClick={e=>{ e.stopPropagation(); navigate('camera') }}
          style={{ background:`${C.blue}15`, border:`1px dashed ${C.blue}40`, borderRadius:12, padding:'14px 8px', cursor:'pointer', textAlign:'center' }}>
          <div style={{ fontSize:24, marginBottom:4 }}>📷</div>
          <div style={{ fontSize:11, fontWeight:700, color:C.blue }}>Use Camera</div>
          <div style={{ fontSize:9, color:C.muted }}>Phone · tablet · laptop</div>
        </button>
        <button onClick={e=>e.stopPropagation()}
          style={{ background:`${C.teal}15`, border:`1px dashed ${C.teal}40`, borderRadius:12, padding:'14px 8px', cursor:'pointer', textAlign:'center' }}>
          <div style={{ fontSize:24, marginBottom:4 }}>📄</div>
          <div style={{ fontSize:11, fontWeight:700, color:C.teal }}>Upload File</div>
          <div style={{ fontSize:9, color:C.muted }}>Canvas · Upload image or doc</div>
        </button>
      </div>

      {/* Annotation tools */}
      <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Annotation Tools</div>
      <div style={{ display:'flex', gap:6, marginBottom:12 }}>
        {tools.map(t=>(
          <button key={t.label} onClick={e=>e.stopPropagation()}
            style={{ flex:1, background:C.inner, border:`1px solid ${C.border}`, borderRadius:9, padding:'7px 4px', cursor:'pointer', textAlign:'center' }}
            onMouseEnter={e=>(e.currentTarget.style.borderColor='var(--school-color)')}
            onMouseLeave={e=>(e.currentTarget.style.borderColor=C.border)}>
            <div style={{ fontSize:14, marginBottom:2 }}>{t.icon}</div>
            <div style={{ fontSize:8, color:C.muted }}>{t.label}</div>
          </button>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display:'flex', gap:8 }}>
        <button onClick={e=>e.stopPropagation()}
          style={{ flex:1, background:C.inner, color:C.muted, border:`1px solid ${C.border}`, borderRadius:10, padding:'9px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
          ← Annotate student work
        </button>
        <button onClick={e=>e.stopPropagation()}
          style={{ flex:1, background:'var(--school-color)', color:'#fff', border:'none', borderRadius:10, padding:'9px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
          Send Back ›
        </button>
      </div>
      <div style={{ fontSize:10, color:C.muted, marginTop:6, textAlign:'center' }}>
        🔔 Push notification sent to student on send back
      </div>
    </Widget>
  )
}

// ─── TESTING SUITE WIDGET ─────────────────────────────────────────────────────
function TestingSuiteWidget({ navigate }) {
  const modes = [
    { icon:'🔒', label:'Lockdown',      sub:'Browser · External test from any ed site · locked', color:C.blue   },
    { icon:'🏗',  label:'Native Builder', sub:'Build in GradeFlow · MC · Short ans · T/F · Essay · Fill blank', color:C.green  },
    { icon:'📄', label:'PDF Convert',   sub:'Upload any PDF · AI digitizes it · Questions editable', color:C.purple },
  ]
  const sources = ['Take photo of test', '↑ Upload any format', '🔵 Search database', '✨ AI-generate by grade level + subject + standard', '↗ Pull from ed site']
  const features = ['Timer + auto-submit', '👁 Real-time monitoring', '✕ Randomize order', '🚩 Flag exit attempts', '✨ AI auto-grade short answers', '📋 Flag essays']

  return (
    <Widget style={{ background:'linear-gradient(135deg,#0d0a1e 0%,#060810 100%)', border:`1px solid ${C.purple}25` }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:800, color:C.text }}>🧪 Testing Suite</div>
          <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>3 modes · All devices · Lockdown · Auto-grade · Real-time monitoring</div>
        </div>
        <button onClick={e=>{ e.stopPropagation(); navigate('testingSuite') }}
          style={{ background:`${C.purple}18`, color:C.purple, border:`1px solid ${C.purple}30`, borderRadius:9, padding:'5px 10px', fontSize:10, fontWeight:700, cursor:'pointer' }}>
          Create Test →
        </button>
      </div>

      {/* 3 mode cards */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, margin:'12px 0' }}>
        {modes.map(m=>(
          <button key={m.label} onClick={e=>{ e.stopPropagation(); navigate('testingSuite') }}
            style={{ background:`${m.color}12`, border:`1px solid ${m.color}25`, borderRadius:12, padding:'10px 6px', cursor:'pointer', textAlign:'center' }}
            onMouseEnter={e=>(e.currentTarget.style.background=`${m.color}22`)}
            onMouseLeave={e=>(e.currentTarget.style.background=`${m.color}12`)}>
            <div style={{ fontSize:22, marginBottom:4 }}>{m.icon}</div>
            <div style={{ fontSize:10, fontWeight:700, color:m.color, marginBottom:3 }}>{m.label}</div>
            <div style={{ fontSize:8, color:C.muted, lineHeight:1.4 }}>{m.sub}</div>
          </button>
        ))}
      </div>

      {/* Test sources */}
      <div style={{ background:C.inner, borderRadius:12, padding:'10px 12px', marginBottom:8 }}>
        <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Test Sources</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'4px 12px' }}>
          {sources.map(s=>(
            <span key={s} style={{ fontSize:10, color:C.soft }}>· {s}</span>
          ))}
        </div>
        <div style={{ fontSize:10, color:C.muted, marginTop:6 }}>All questions editable after upload/photo · AI suggests grade-appropriate answers if no key found</div>
      </div>

      {/* Features */}
      <div style={{ background:C.inner, borderRadius:12, padding:'10px 12px', marginBottom:8 }}>
        <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Features</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'4px 12px' }}>
          {features.map(f=>(
            <span key={f} style={{ fontSize:10, color:C.soft }}>· {f}</span>
          ))}
        </div>
        <div style={{ fontSize:10, color:C.muted, marginTop:6 }}>Answer key: upload · photo · AI finds online · AI generates if not found · Teacher edits</div>
      </div>

      {/* Grade posting */}
      <div style={{ fontSize:10, color:C.muted, borderTop:`1px solid ${C.border}`, paddingTop:8 }}>
        Grade posting: Auto · Review first · Teacher chooses per test → posts to gradebook at correct weight
      </div>
    </Widget>
  )
}

// ─── SCAN GRADE SHEET WIDGET ──────────────────────────────────────────────────
function ScanGradeSheetWidget({ navigate }) {
  const weights = [
    { label:'Test',  pct:'40%', color:C.red    },
    { label:'Quiz',  pct:'30%', color:C.amber  },
    { label:'Part.', pct:'10%', color:C.teal   },
    { label:'Other', pct:'20%', color:C.blue   },
  ]
  return (
    <Widget style={{ background:C.card }}>
      <div style={{ marginBottom:12 }}>
        <div style={{ fontSize:13, fontWeight:800, color:C.text }}>📷 Scan Grade Sheet</div>
        <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>Camera · Upload · AI reads all formats → auto-convert to %</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
        <button onClick={e=>{ e.stopPropagation(); navigate('camera') }}
          style={{ background:'var(--school-color)18', border:`2px solid var(--school-color)40`, borderRadius:14, padding:'16px 8px', cursor:'pointer', textAlign:'center' }}>
          <div style={{ fontSize:28, marginBottom:4 }}>📷</div>
          <div style={{ fontSize:12, fontWeight:700, color:'var(--school-color)' }}>Use Camera</div>
          <div style={{ fontSize:9, color:C.muted }}>Phone · tablet · laptop</div>
        </button>
        <button onClick={e=>e.stopPropagation()}
          style={{ background:C.inner, border:`1px solid ${C.border}`, borderRadius:14, padding:'16px 8px', cursor:'pointer', textAlign:'center' }}>
          <div style={{ fontSize:28, marginBottom:4 }}>📁</div>
          <div style={{ fontSize:12, fontWeight:700, color:C.soft }}>Upload File</div>
          <div style={{ fontSize:9, color:C.muted }}>Any format</div>
        </button>
      </div>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
        <span style={{ fontSize:10, color:C.muted }}>Assignment type:</span>
        {weights.map(w=>(
          <span key={w.label} style={{ background:`${w.color}20`, color:w.color, border:`1px solid ${w.color}35`, borderRadius:999, padding:'3px 9px', fontSize:10, fontWeight:700 }}>
            {w.label} {w.pct}
          </span>
        ))}
      </div>
      <div style={{ fontSize:10, color:C.muted, marginTop:8 }}>
        Weights auto-pulled from school system · teacher editable anytime in Settings
      </div>
    </Widget>
  )
}

// ─── GRADEBOOK WIDGET ─────────────────────────────────────────────────────────
function GradebookWidget({ navigate }) {
  const { classes, setActiveClass } = useStore()
  const [activeId, setActiveId] = useState(classes[0]?.id||1)
  const cls = classes.find(c=>c.id===activeId)||classes[0]
  const STUDENTS = [
    { id:1, name:'Aaliyah Brooks',  grade:95, letter:'A', bar:C.green },
    { id:2, name:'Marcus Thompson', grade:58, letter:'F', bar:C.red   },
    { id:3, name:'Sofia Rodriguez', grade:82, letter:'B', bar:C.blue  },
    { id:4, name:'Jordan Williams', grade:74, letter:'C', bar:C.amber },
  ]

  return (
    <Widget style={{ background:'linear-gradient(135deg,#0a0f1e 0%,#060810 100%)', border:`1px solid ${C.blue}20` }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:800, color:C.text }}>📚 Gradebook + Student Profile</div>
          <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{cls?.students||24} students · Synced: PowerSchool ✓ · Tap student → full editable profile</div>
        </div>
        <button onClick={e=>{ e.stopPropagation(); navigate('gradebook') }}
          style={{ background:`${C.blue}18`, color:C.blue, border:`1px solid ${C.blue}30`, borderRadius:9, padding:'5px 10px', fontSize:10, fontWeight:700, cursor:'pointer' }}>
          Open →
        </button>
      </div>

      {/* Class tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:12, overflowX:'auto' }}>
        {classes.map(c=>(
          <button key={c.id} onClick={e=>{ e.stopPropagation(); setActiveId(c.id) }}
            style={{ padding:'5px 12px', borderRadius:999, border:'none', cursor:'pointer', fontSize:11, fontWeight:700, whiteSpace:'nowrap', flexShrink:0,
              background:activeId===c.id?c.color:C.inner, color:activeId===c.id?'#fff':C.muted }}>
            {c.subject}
          </button>
        ))}
      </div>

      {/* Student list */}
      {STUDENTS.map(s=>(
        <div key={s.id} onClick={e=>{ e.stopPropagation(); navigate('gradebook') }}
          style={{ display:'flex', alignItems:'center', gap:10, background:C.inner, borderRadius:10, padding:'9px 12px', marginBottom:6, cursor:'pointer' }}
          onMouseEnter={e=>(e.currentTarget.style.background=C.raised)}
          onMouseLeave={e=>(e.currentTarget.style.background=C.inner)}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, fontWeight:600, color:C.text }}>{s.name}</div>
            <div style={{ height:4, background:C.raised, borderRadius:2, marginTop:5, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${s.grade}%`, background:s.bar, borderRadius:2 }}/>
            </div>
          </div>
          <div style={{ textAlign:'right', flexShrink:0 }}>
            <span style={{ fontSize:14, fontWeight:800, color:s.bar }}>{s.grade}%</span>
            <span style={{ fontSize:11, color:s.bar, marginLeft:4, fontWeight:700 }}>{s.letter}</span>
          </div>
        </div>
      ))}

      {/* Action buttons */}
      <div style={{ display:'flex', gap:8, marginTop:10, borderTop:`1px solid ${C.border}`, paddingTop:10 }}>
        {[['✨ AI Insights',C.purple],['📊 Student Report',C.green],['📩 Message Parent',C.amber]].map(([l,c])=>(
          <button key={l} onClick={e=>{ e.stopPropagation(); navigate(l.includes('Message')?'parentMessages':'gradebook') }}
            style={{ flex:1, background:`${c}18`, color:c, border:`1px solid ${c}30`, borderRadius:9, padding:'7px 4px', fontSize:9, fontWeight:700, cursor:'pointer', textAlign:'center' }}>
            {l}
          </button>
        ))}
      </div>
    </Widget>
  )
}

// ─── SUB-PAGES ────────────────────────────────────────────────────────────────
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
            style={{ background:C.card, border:`1px solid ${C.border}`, borderLeft:`4px solid ${cls.color}`, borderRadius:16, padding:16, textAlign:'left', cursor:'pointer' }}>
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

// ─── HOME FEED ────────────────────────────────────────────────────────────────

function HomeFeed({ navigate }) {
  const store = useStore()
  const { classes, messages, getNeedsAttention } = store
  const pending = messages.filter(m=>m.status==='pending')
  const atRisk  = getNeedsAttention()

  const [showModal, setShowModal] = useState(false)
  const [hidden,    setHidden]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('gf_hidden_widgets') || '[]') } catch { return [] }
  })

  function toggleWidget(id) {
    const next = hidden.includes(id) ? hidden.filter(x => x !== id) : [...hidden, id]
    setHidden(next)
    localStorage.setItem('gf_hidden_widgets', JSON.stringify(next))
  }

  const wrap = (id, content) => {
    if (hidden.includes(id)) return null
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
    { icon:'📚', val:classes.length,    label:'Classes',      page:'classes',        color:C.blue   },
    { icon:'💬', val:pending.length||'',label:'Messages',     page:'parentMessages', color:C.purple },
    { icon:'📋', val:'',                label:'Lesson Plans', page:'lessonPlan',     color:C.teal   },
    { icon:'🔔', val:atRisk.length||'', label:'Alerts',       page:'alerts',         color:C.red    },
  ]

  return (
    <div style={{ padding:'12px 12px 0' }}>

      {showModal && (
        <AddWidgetsModal
          hidden={hidden}
          onToggle={toggleWidget}
          onClose={() => setShowModal(false)}
        />
      )}

      {wrap('overview',
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
      )}

      {wrap('lessons', <TodaysLessonsWidget navigate={navigate}/>)}

      {wrap('classes',
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
      )}

      {wrap('attention', <NeedsAttentionWidget atRisk={atRisk} navigate={navigate}/>)}
      {wrap('messages',  <MessagesWidget navigate={navigate}/>)}
      {wrap('reports',   <ReportsWidget navigate={navigate}/>)}
      {wrap('grading',   <GradingWidget navigate={navigate}/>)}
      {wrap('lessonPlan',<LessonPlanWidget navigate={navigate}/>)}
      {wrap('sketch',    <SketchAnnotateWidget navigate={navigate}/>)}
      {wrap('testing',   <TestingSuiteWidget navigate={navigate}/>)}
      {wrap('scan',      <ScanGradeSheetWidget navigate={navigate}/>)}
      {wrap('gradebook', <GradebookWidget navigate={navigate}/>)}

      <AddWidgetsBar onOpen={() => setShowModal(true)}/>
    </div>
  )
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function Dashboard({ currentUser, onCameraClick }) {
  const store = useStore()
  const { teacher, activeScreen, activeLessonClassId } = store
  const routerNav = useNavigate()

  const [subPage, setSubPage] = useState(null)
  const history = useRef([])

  useEffect(()=>{ applyTheme('kipp'); scrollTop() },[])
  useEffect(()=>{ if(activeScreen==='studentProfile') setSubPage('studentProfile') },[activeScreen])

  // Shared BottomNav emits these IDs for the teacher role.
  // Map them to Dashboard's internal subPage keys.
  const NAV_TO_PAGE = {
    classes:   'gradebook',
    messages:  'parentMessages',
    reports:   'reports',
    alerts:    'alerts',
    dashboard: null,          // home
  }

  // Reverse map: which BottomNav item should be highlighted per subPage.
  const PAGE_TO_NAV = {
    gradebook:      'classes',
    parentMessages: 'messages',
    lessonPlan:     'classes',
    reports:        'reports',
    alerts:         'alerts',
    testingSuite:   'classes',
    feed:           'classes',
    studentProfile: 'classes',
    integrations:   'classes',
    reminders:      'dashboard',
    attention:      'alerts',
    classes:        'classes',
    settings:       'dashboard',
  }


const activeNav = subPage ? (PAGE_TO_NAV[subPage] || 'dashboard') : 'dashboard'

  function goHome() {
    history.current = []
    setSubPage(null)
    store.setScreen('dashboard')
    scrollTop()
  }

  function goBack() {
    history.current.pop()
    const prev = history.current[history.current.length - 1] || null
    if (!prev) { goHome(); return }
    setSubPage(prev)
    scrollTop()
  }

  function navigate(id) {
    if(!id) return
    if(id==='dashboard') { goHome(); return }
    if(id==='logout')    { goHome(); return }
    if(id==='camera')    { routerNav('/camera'); return }
    history.current.push(id)
    setSubPage(id)
    scrollTop()
  }

  function navSelect(id) {
    if(id==='__back__') { goBack(); return }
    const page = NAV_TO_PAGE[id]
    if(page === undefined) return
    if(page === null) { goHome(); return }
    navigate(page)
  }

  const isSubPage = subPage !== null
  const withNav = (node) => (
    <>
      {node}
      <BottomNav active={activeNav} onSelect={navSelect} isSubPage={isSubPage} role="teacher"/>
    </>
  )

  if(subPage==='gradebook')      return withNav(<SubPage><Gradebook      onBack={goBack}/></SubPage>)
  if(subPage==='lessonPlan')     return withNav(<SubPage><LessonPlan     initialMode="view" classId={activeLessonClassId} onBack={goBack}/></SubPage>)
  if(subPage==='parentMessages') return withNav(<SubPage><ParentMessages onBack={goBack} viewerRole="teacher"/></SubPage>)
  if(subPage==='reports')        return withNav(<SubPage><Reports        onBack={goBack}/></SubPage>)
  if(subPage==='testingSuite')   return withNav(<SubPage><TestingSuite   onBack={goBack}/></SubPage>)
  if(subPage==='feed')           return withNav(<SubPage><ClassFeed      onBack={goBack} viewerRole="teacher"/></SubPage>)
  if(subPage==='studentProfile') return withNav(<SubPage><StudentProfile onBack={goBack}/></SubPage>)
  if(subPage==='integrations')   return withNav(<SubPage><Integrations   onBack={goBack}/></SubPage>)
  if(subPage==='reminders')      return withNav(<RemindersPage      onBack={goBack}/>)
  if(subPage==='attention')      return withNav(<NeedsAttentionPage  onBack={goBack}/>)
  if(subPage==='alerts')         return withNav(<AlertsPage          onBack={goBack}/>)
  if(subPage==='classes')        return withNav(<ClassesPage   onBack={goBack} navigate={navigate}/>)
  if(subPage==='settings')       return withNav(<SettingsPage  onBack={goBack} navigate={navigate}/>)

  return withNav(
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", paddingBottom:90 }}>
      <StickyHeader teacher={teacher}/>
      <HomeFeed navigate={navigate}/>
    </div>
  )
}
