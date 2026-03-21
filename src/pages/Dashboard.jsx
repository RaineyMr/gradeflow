import React, { useState, useEffect } from 'react'
import BottomNav from '../components/ui/BottomNav'
import { useStore } from '../lib/store'
import Gradebook from './Gradebook'
import LessonPlan from './LessonPlan'
import ParentMessages from './ParentMessages'
import Reports from './Reports'
import TestingSuite from './TestingSuite'
import ClassFeed from './ClassFeed'
import StudentProfile from './StudentProfile'

function GradeBadge({ score }) {
  const color = score >= 90 ? '#22c97a' : score >= 80 ? '#3b7ef4' : score >= 70 ? '#f5a623' : '#f04a4a'
  const letter = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'D'
  return (
    <div style={{ textAlign:'center' }}>
      <div style={{ fontSize:22, fontWeight:900, color, lineHeight:1 }}>{score}</div>
      <div style={{ fontSize:11, fontWeight:700, color }}>{letter}</div>
    </div>
  )
}

function TrendBadge({ trend }) {
  const map = { up:['↑','#22c97a'], down:['↓','#f04a4a'], stable:['→','#6b7494'] }
  const [icon, color] = map[trend] || map.stable
  return <span style={{ fontSize:13, color, fontWeight:700 }}>{icon}</span>
}

const C = {
  bg:'#0a0000', card:'#1a0005', inner:'#280008', border:'#4a0018',
  text:'#f5e8ea', muted:'#9a6070', green:'#22c97a', blue:'#3b7ef4',
  purple:'#9b6ef5', amber:'#f5a623', red:'#f04a4a', teal:'#0fb8a0',
  primary:'#BA0C2F', light:'#f5e8ea',
}

function scrollTop() { window.scrollTo(0, 0) }

function Widget({ onClick, style, children, title, titleRight, color }) {
  return (
    <div onClick={onClick}
      style={{ background:C.card, border:`1px solid ${C.inner}`, borderRadius:20, padding:'14px 16px', margin:'0 10px 12px', cursor:onClick?'pointer':'default', transition:'transform 0.15s', ...(color?{borderLeft:`3px solid ${color}`}:{}), ...style }}
      onMouseEnter={e => onClick && (e.currentTarget.style.transform='scale(1.005)')}
      onMouseLeave={e => (e.currentTarget.style.transform='scale(1)')}>
      {(title||titleRight) && (
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          {title && <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{title}</span>}
          {titleRight}
        </div>
      )}
      {children}
    </div>
  )
}

function ActionBtn({ label, color=C.blue, onClick, style }) {
  return (
    <button onClick={e => { e.stopPropagation(); onClick?.() }}
      style={{ background:`${color}22`, color, border:'none', borderRadius:999, padding:'6px 12px', fontSize:11, fontWeight:700, cursor:'pointer', ...style }}>
      {label}
    </button>
  )
}

function SubPage({ children }) {
  useEffect(() => { scrollTop() }, [])
  return <div style={{ minHeight:'100vh', background:C.bg, paddingBottom:80 }}>{children}</div>
}

function RemindersPage({ onBack, onNavigate }) {
  const { reminders, addReminder, toggleReminder, deleteReminder } = useStore()
  const [text, setText] = useState('')

  function getPageFromText(txt) {
    const t = txt.toLowerCase()
    if (t.includes('grade') || t.includes('gradebook') || t.includes('score')) return 'gradebook'
    if (t.includes('message') || t.includes('parent') || t.includes('contact')) return 'parentMessages'
    if (t.includes('lesson') || t.includes('plan'))   return 'lessonPlan'
    if (t.includes('report'))                          return 'reports'
    if (t.includes('test') || t.includes('quiz') || t.includes('exam')) return 'testingSuite'
    if (t.includes('feed') || t.includes('post'))     return 'classFeed'
    return null
  }

  function handleAdd() {
    if (!text.trim()) return
    addReminder(text.trim())
    setText('')
  }

  return (
    <SubPage>
      <div style={{ padding:'20px 16px 0', display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <button onClick={onBack} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
        <h1 style={{ fontSize:22, fontWeight:800, color:C.text, margin:0 }}>🔔 Reminders</h1>
      </div>
      <div style={{ margin:'0 10px 16px', display:'flex', gap:8 }}>
        <input style={{ flex:1, background:C.inner, border:'1px solid #2a2f42', borderRadius:12, padding:'10px 14px', color:C.text, fontSize:13, outline:'none' }}
          placeholder="Add a reminder..." value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key==='Enter' && handleAdd()} />
        <button onClick={handleAdd} style={{ background:'var(--school-color)', border:'none', borderRadius:12, padding:'10px 18px', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>Add</button>
      </div>
      {reminders.map(r => {
        const targetPage = getPageFromText(r.text)
        return (
          <div key={r.id} style={{ margin:'0 10px 8px', background:C.card, border:`1px solid ${C.inner}`, borderRadius:14, padding:'12px 14px', display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={() => toggleReminder(r.id)}
              style={{ background:r.done?'#22c97a22':C.inner, border:`1px solid ${r.done?'#22c97a':'#2a2f42'}`, borderRadius:'50%', width:24, height:24, cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', color:'#22c97a', fontSize:12 }}>
              {r.done?'✓':''}
            </button>
            <div style={{ flex:1, cursor:targetPage?'pointer':'default' }} onClick={() => targetPage && onNavigate(targetPage)}>
              <div style={{ fontSize:13, color:r.done?C.muted:targetPage?C.blue:C.text, textDecoration:r.done?'line-through':'none', fontWeight:targetPage?600:400 }}>{r.text}</div>
              <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>
                {r.due}
                {targetPage && !r.done && <span style={{ color:C.blue, marginLeft:6 }}>→ tap to go there</span>}
              </div>
            </div>
            <button onClick={() => deleteReminder(r.id)} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, fontSize:16 }}>×</button>
          </div>
        )
      })}
      {reminders.length===0 && <p style={{ textAlign:'center', color:C.muted, marginTop:40 }}>No reminders yet.</p>}
    </SubPage>
  )
}

function NeedsAttentionPage({ onBack }) {
  const { getNeedsAttention, setActiveStudent, setScreen } = useStore()
  const students = getNeedsAttention()
  return (
    <SubPage>
      <div style={{ padding:'20px 16px 0', display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <button onClick={onBack} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
        <h1 style={{ fontSize:22, fontWeight:800, color:C.text, margin:0 }}>⚑ Needs Attention</h1>
      </div>
      {students.length===0 ? (
        <div style={{ textAlign:'center', padding:40 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
          <p style={{ color:C.muted }}>All students on track!</p>
        </div>
      ) : students.map(s => (
        <div key={s.id} onClick={() => { setActiveStudent(s); setScreen('studentProfile') }}
          style={{ margin:'0 10px 10px', background:C.inner, border:'1px solid #f04a4a20', borderRadius:14, padding:'14px 16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:C.text, marginBottom:4 }}>{s.name}</div>
            <div style={{ fontSize:11, color:C.red }}>{s.grade<70?`${s.grade}% — below passing`:s.submitUngraded?'Submitted — ungraded':'Flagged for review'}</div>
            <div style={{ display:'flex', gap:6, marginTop:6 }}>
              <ActionBtn label="📩 Message Parent" color={C.purple} onClick={() => {}} />
              <ActionBtn label="✏ View Profile"   color={C.blue}   onClick={() => { setActiveStudent(s); setScreen('studentProfile') }} />
            </div>
          </div>
          <GradeBadge score={s.grade} />
        </div>
      ))}
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
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, padding:'0 10px' }}>
        {classes.map(cls => (
          <button key={cls.id} onClick={() => { setActiveClass(cls); navigate('gradebook') }}
            style={{ background:C.card, border:`1px solid ${C.inner}`, borderLeft:`3px solid ${cls.color}`, borderRadius:14, padding:14, textAlign:'left', cursor:'pointer' }}>
            <div style={{ fontWeight:700, fontSize:13, color:C.text, marginBottom:4 }}>{cls.period} · {cls.subject}</div>
            <div style={{ fontSize:10, color:C.muted, marginBottom:8 }}>{cls.students} students</div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:24, fontWeight:800, color:'#fff' }}>{cls.gpa}</span>
              <TrendBadge trend={cls.trend} />
            </div>
            {cls.needsAttention>0 && <div style={{ fontSize:9, color:C.red, marginTop:4 }}>⚑ {cls.needsAttention} need attention</div>}
          </button>
        ))}
      </div>
    </SubPage>
  )
}

// ── Lesson Plan Widget ─────────────────────────────────────────────────────────
const WEEK_DAYS = ['Mon','Tue','Wed','Thu','Fri']
const LESSON_STATUS_COLORS = { done: C.green, tbc: C.amber, upcoming: C.muted }

function LessonPlanWidget({ lesson, lessons, lessonIdx, setLessonIdx, onOpen }) {
  const [status, setStatus] = React.useState({}) // { [idx]: 'done' | 'tbc' }

  const currentStatus = status[lessonIdx] || 'upcoming'

  function cycleStatus(e) {
    e.stopPropagation()
    setStatus(s => {
      const cur = s[lessonIdx] || 'upcoming'
      const next = cur === 'upcoming' ? 'done' : cur === 'done' ? 'tbc' : 'upcoming'
      return { ...s, [lessonIdx]: next }
    })
  }

  const CREATE_METHODS = [
    { icon:'🔍', label:'Search',  sub:'Textbook / ed site' },
    { icon:'🏗',  label:'Scratch', sub:'Build from scratch'  },
    { icon:'📄', label:'Upload',  sub:'PDF · Word · Google'  },
    { icon:'📎', label:'Connect', sub:'Planbook · Chalk · TPT'},
    { icon:'✨', label:'AI TEKS', sub:'AI generates full plan'},
    { icon:'📷', label:'Scan',    sub:'Scan cover or barcode' },
  ]

  return (
    <div style={{ margin:'0 10px 12px', background:'linear-gradient(160deg,#0a1f1a 0%,#061410 100%)', border:`1px solid ${C.teal}30`, borderRadius:20, overflow:'hidden' }}>
      {/* Header row */}
      <div style={{ padding:'14px 16px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:`${C.teal}99`, marginBottom:2 }}>📋 LESSON PLAN</div>
          <div style={{ fontSize:13, fontWeight:800, color:C.text }}>{new Date().toLocaleDateString('en-US',{weekday:'long', month:'short', day:'numeric'})}</div>
        </div>
        <button onClick={onOpen}
          style={{ background:`${C.teal}22`, color:C.teal, border:'none', borderRadius:999, padding:'5px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
          Full Plan →
        </button>
      </div>

      {/* Week strip */}
      <div style={{ display:'flex', gap:4, padding:'10px 16px', overflowX:'auto' }}>
        {WEEK_DAYS.map((day, i) => {
          const isActive = i === lessonIdx % 5
          const dayStatus = status[i] || 'upcoming'
          return (
            <button key={day} onClick={() => setLessonIdx(i)}
              style={{ flex:1, minWidth:44, background:isActive?`${C.teal}22`:C.inner, border:`1px solid ${isActive?C.teal:C.border}`, borderRadius:10, padding:'6px 4px', cursor:'pointer', textAlign:'center' }}>
              <div style={{ fontSize:9, color:isActive?C.teal:C.muted, fontWeight:700, textTransform:'uppercase' }}>{day}</div>
              <div style={{ fontSize:14, marginTop:2 }}>
                {dayStatus==='done' ? '✅' : dayStatus==='tbc' ? '🔄' : '📖'}
              </div>
            </button>
          )
        })}
      </div>

      {/* Current lesson card */}
      <div onClick={onOpen} style={{ margin:'0 16px', background:'rgba(15,184,160,0.08)', border:`1px solid ${C.teal}20`, borderRadius:14, padding:'12px 14px', cursor:'pointer' }}>
        {lesson?.classLabel && (
          <div style={{ display:'inline-block', background:`${C.teal}20`, borderRadius:999, padding:'2px 10px', fontSize:10, color:C.teal, fontWeight:700, marginBottom:6 }}>
            {lesson.classLabel}
          </div>
        )}
        <div style={{ fontSize:15, fontWeight:800, color:C.text, marginBottom:4 }}>
          {lesson?.title || 'No lesson planned'}
        </div>
        <div style={{ fontSize:11, color:C.muted, marginBottom:10 }}>
          {[lesson?.pages && `Pages ${lesson.pages}`, lesson?.duration].filter(Boolean).join(' · ')}
        </div>

        {/* Status + nav row */}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <button onClick={cycleStatus}
            style={{ background: currentStatus==='done'?`${C.green}22`:currentStatus==='tbc'?`${C.amber}22`:`${C.muted}18`,
              color: currentStatus==='done'?C.green:currentStatus==='tbc'?C.amber:C.muted,
              border:'none', borderRadius:999, padding:'5px 12px', fontSize:11, fontWeight:800, cursor:'pointer', flexShrink:0 }}>
            {currentStatus==='done' ? '✓ Done' : currentStatus==='tbc' ? '🔄 TBC' : '○ Mark done'}
          </button>
          <div style={{ flex:1 }} />
          <button onClick={e => { e.stopPropagation(); setLessonIdx(i=>Math.max(0,i-1)) }}
            style={{ background:C.inner, border:'none', borderRadius:8, padding:'5px 10px', fontSize:12, color:C.muted, cursor:'pointer' }}>←</button>
          <span style={{ fontSize:10, color:C.muted }}>{lessonIdx+1}/{lessons?.length||1}</span>
          <button onClick={e => { e.stopPropagation(); setLessonIdx(i=>Math.min((lessons?.length||1)-1,i+1)) }}
            style={{ background:C.inner, border:'none', borderRadius:8, padding:'5px 10px', fontSize:12, color:C.muted, cursor:'pointer' }}>→</button>
        </div>
      </div>

      {/* AI Package summary */}
      <div style={{ margin:'10px 16px 0', background:'rgba(0,0,0,0.2)', borderRadius:12, padding:'10px 12px' }}>
        <div style={{ fontSize:10, fontWeight:700, color:`${C.teal}99`, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>AI-Generated Package Includes</div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {['📝 Objectives','📐 TEKS/Standards','⭐ SWBAT','✅ Success Criteria','🎒 Supplies','📋 Instructions','📄 Worksheet','🔑 Answer Key','🎫 Exit Ticket'].map(item => (
            <span key={item} style={{ background:`${C.teal}12`, borderRadius:999, padding:'3px 8px', fontSize:9, color:C.teal, fontWeight:600 }}>{item}</span>
          ))}
        </div>
      </div>

      {/* Create methods */}
      <div style={{ padding:'10px 16px 14px' }}>
        <div style={{ fontSize:10, fontWeight:700, color:`${C.teal}99`, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>6 Ways to Create</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
          {CREATE_METHODS.map(m => (
            <button key={m.label} onClick={onOpen}
              style={{ background:C.inner, border:`1px solid ${C.border}`, borderRadius:10, padding:'8px 6px', textAlign:'center', cursor:'pointer', transition:'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor=C.teal}
              onMouseLeave={e => e.currentTarget.style.borderColor=C.border}>
              <div style={{ fontSize:18, marginBottom:3 }}>{m.icon}</div>
              <div style={{ fontSize:10, fontWeight:700, color:C.text, marginBottom:1 }}>{m.label}</div>
              <div style={{ fontSize:8, color:C.muted, lineHeight:1.3 }}>{m.sub}</div>
            </button>
          ))}
        </div>
        {/* Export row */}
        <div style={{ display:'flex', gap:6, marginTop:10 }}>
          {[['⬇ PDF',C.blue],['📝 Word/GDoc',C.green],['🖨 Print',C.muted],['📋 Copy',C.purple]].map(([label,color]) => (
            <button key={label} onClick={onOpen}
              style={{ flex:1, background:`${color}18`, color, border:'none', borderRadius:8, padding:'6px 4px', fontSize:9, fontWeight:700, cursor:'pointer' }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ fontSize:9, color:C.muted, marginTop:6, textAlign:'center' }}>
          Push to Planbook · Chalk · Google Classroom · BetterLesson · Khan etc.
        </div>
      </div>
    </div>
  )
}

export default function Dashboard({ currentUser, onCameraClick, onNavigate }) {
  const store = useStore()
  const { classes, messages, reminders, lessons, teacher, getNeedsAttention, activeScreen } = store

  const [subPage, setSubPage]     = useState(null)
  const [lessonIdx, setLessonIdx] = useState(0)

  const lesson  = lessons[lessonIdx] || lessons[0]
  const pending = messages.filter(m => m.status==='pending')
  const atRisk  = getNeedsAttention()

  useEffect(() => {
    if (activeScreen==='studentProfile') setSubPage('studentProfile')
  }, [activeScreen])

  function goHome() { setSubPage(null); store.setScreen('dashboard') }

  function navSelect(id) {
    if (id==='__back__')  { goHome(); return }
    if (id==='camera')    { onCameraClick?.(); return }
    if (id==='dashboard') { goHome(); return }
    setSubPage(id)
  }

  if (subPage==='gradebook')      return <><SubPage><Gradebook onBack={goHome} /></SubPage><BottomNav role="teacher" activePage="gradebook" onNavigate={navSelect} isSubPage={true} onBack={goHome} /></>
  if (subPage==='parentMessages') return <><SubPage><ParentMessages onBack={goHome} /></SubPage><BottomNav role="teacher" activePage="messages" onNavigate={navSelect} isSubPage={true} onBack={goHome} /></>
  if (subPage==='lessonPlan')     return <><SubPage><LessonPlan onBack={goHome} /></SubPage><BottomNav role="teacher" activePage="lessonPlan" onNavigate={navSelect} isSubPage={true} onBack={goHome} /></>
  if (subPage==='reports')        return <><SubPage><Reports onBack={goHome} /></SubPage><BottomNav role="teacher" activePage="reports" onNavigate={navSelect} isSubPage={true} onBack={goHome} /></>
  if (subPage==='testingSuite')   return <><SubPage><TestingSuite onBack={goHome} /></SubPage><BottomNav role="teacher" activePage="testingSuite" onNavigate={navSelect} isSubPage={true} onBack={goHome} /></>
  if (subPage==='classFeed')      return <><SubPage><ClassFeed onBack={goHome} /></SubPage><BottomNav role="teacher" activePage="classFeed" onNavigate={navSelect} isSubPage={true} onBack={goHome} /></>
  if (subPage==='studentProfile') return <><SubPage><StudentProfile onBack={goHome} /></SubPage><BottomNav role="teacher" activePage="studentProfile" onNavigate={navSelect} isSubPage={true} onBack={goHome} /></>
  if (subPage==='reminders')      return <><RemindersPage onBack={goHome} onNavigate={navSelect} /><BottomNav role="teacher" activePage="reminders" onNavigate={navSelect} isSubPage={true} onBack={goHome} /></>
  if (subPage==='attention')      return <><NeedsAttentionPage onBack={goHome} /><BottomNav role="teacher" activePage="attention" onNavigate={navSelect} isSubPage={true} onBack={goHome} /></>
  if (subPage==='classes')        return <><ClassesPage onBack={goHome} navigate={setSubPage} /><BottomNav role="teacher" activePage="classes" onNavigate={navSelect} isSubPage={true} onBack={goHome} /></>

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', paddingBottom:80 }}>
      <div style={{ background:'linear-gradient(135deg,#BA0C2F 0%,#7a0820 100%)', padding:'22px 16px 20px', marginBottom:4 }}>
        <div style={{ fontSize:11, color:'rgba(245,232,234,0.65)', marginBottom:3, fontWeight:600, letterSpacing:'0.04em' }}>KIPP NEW ORLEANS SCHOOLS</div>
        <h1 style={{ fontSize:22, fontWeight:800, margin:'0 0 2px', color:C.light }}>Good morning, {teacher.name} 👋</h1>
        <p style={{ fontSize:11, color:'rgba(245,232,234,0.65)', margin:0 }}>{new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</p>
      </div>

      {/* W1: Daily Overview */}
      <Widget onClick={() => {}} style={{ background:C.light, border:'none' }}>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:C.primary, marginBottom:10 }}>DAILY OVERVIEW</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6 }}>
          {[
            { icon:'💬', val:pending.length,                        label:'Pending Msgs',  page:'parentMessages' },
            { icon:'⚑',  val:atRisk.length,                        label:'Need Attention',page:'attention'      },
            { icon:'📚', val:classes.length,                       label:'Classes',       page:'classes'        },
            { icon:'🔔', val:reminders.filter(r=>!r.done).length,  label:'Reminders',     page:'reminders'      },
            { icon:'📋', val:store.assignments?.length||0,         label:'Assignments',   page:'gradebook'      },
          ].map(tile => (
            <button key={tile.label} onClick={e => { e.stopPropagation(); setSubPage(tile.page) }}
              style={{ background:C.primary, borderRadius:13, padding:'10px 4px', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
              <span style={{ fontSize:16 }}>{tile.icon}</span>
              <span style={{ fontSize:18, fontWeight:800, color:C.light, lineHeight:1 }}>{tile.val}</span>
              <span style={{ fontSize:8, color:'rgba(245,232,234,0.75)', textAlign:'center' }}>{tile.label}</span>
            </button>
          ))}
        </div>
      </Widget>

      {/* W2+W3: Lesson Plan Widget */}
      <LessonPlanWidget lesson={lesson} lessons={lessons} lessonIdx={lessonIdx} setLessonIdx={setLessonIdx} onOpen={() => setSubPage('lessonPlan')} />

      {/* W4: My Classes */}
      <Widget onClick={() => setSubPage('classes')} title="My Classes"
        titleRight={<ActionBtn label="+ Add" color={C.blue} onClick={() => setSubPage('gradebook')} />}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {classes.map(cls => (
            <button key={cls.id} onClick={e => { e.stopPropagation(); store.setActiveClass(cls); setSubPage('gradebook') }}
              style={{ background:C.inner, borderRadius:14, padding:'12px 14px', border:'none', borderLeft:`3px solid ${cls.color}`, cursor:'pointer', textAlign:'left' }}>
              <div style={{ fontWeight:700, fontSize:12, color:C.text }}>{cls.period} · {cls.subject}</div>
              <div style={{ fontSize:10, color:C.muted, marginBottom:8 }}>{cls.students} students</div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:22, fontWeight:800, color:'#fff' }}>{cls.gpa}</span>
                <TrendBadge trend={cls.trend} />
              </div>
              {cls.needsAttention>0 && <div style={{ fontSize:9, color:C.red, marginTop:4 }}>⚑ {cls.needsAttention} need attention</div>}
            </button>
          ))}
        </div>
      </Widget>

      {/* W5: Needs Attention */}
      <Widget onClick={() => setSubPage('attention')} style={{ border:'1px solid rgba(240,74,74,0.2)' }}
        title="Needs Attention ⚑"
        titleRight={<span style={{ background:'#f04a4a18', color:C.red, fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:999 }}>{atRisk.length} students</span>}>
        <div style={{ background:C.inner, borderRadius:12, padding:'10px 12px', marginBottom:6 }}>
          <div style={{ fontSize:12, color:C.text, fontWeight:600 }}>
            {atRisk.slice(0,2).map(s=>s.name.split(' ')[0]).join(' · ')}{atRisk.length>2?` + ${atRisk.length-2} more`:''}
          </div>
          <div style={{ fontSize:10, color:C.red, marginTop:4 }}>Tap to view all · Message individually or as group</div>
        </div>
        <ActionBtn label="📩 Message All" color={C.purple} onClick={() => setSubPage('parentMessages')} />
      </Widget>

      {/* W6: Testing Suite */}
      <Widget onClick={() => setSubPage('testingSuite')} title="🧪 Testing Suite"
        titleRight={<ActionBtn label="New Test" color={C.blue} onClick={() => setSubPage('testingSuite')} />}>
        <div style={{ fontSize:11, color:C.muted, marginBottom:10 }}>3 modes · Lockdown · Native Builder · PDF Convert · AI auto-grade · Real-time monitoring</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:8 }}>
          {[['🔒 Lockdown',C.blue],['🏗 Builder',C.green],['📄 PDF',C.purple]].map(([label,color]) => (
            <button key={label} onClick={e => { e.stopPropagation(); setSubPage('testingSuite') }}
              style={{ background:`${color}22`, color, border:'none', borderRadius:10, padding:'8px', fontSize:10, fontWeight:700, cursor:'pointer' }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {['⏱ Timer','👁 Monitor','🔀 Shuffle','✨ AI Grade'].map(f => (
            <span key={f} style={{ background:C.inner, borderRadius:999, padding:'3px 8px', fontSize:9, color:C.muted }}>{f}</span>
          ))}
        </div>
      </Widget>

      {/* W7: Parent Messages */}
      <Widget onClick={() => setSubPage('parentMessages')} title="Parent Messages"
        titleRight={<ActionBtn label="See all →" color={C.blue} onClick={() => setSubPage('parentMessages')} />}>
        {pending.slice(0,2).map(m => (
          <div key={m.id} style={{ background:C.inner, borderRadius:12, padding:'10px 12px', marginBottom:8, border:'1px solid rgba(240,74,74,0.1)' }}>
            <div style={{ fontSize:12, color:C.text, fontWeight:600 }}>⚑ {m.studentName} · {m.subject} · {m.trigger}</div>
            <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>AI drafted · {m.tone}</div>
          </div>
        ))}
        {pending.length===0 && <p style={{ fontSize:12, color:C.muted }}>No pending messages.</p>}
      </Widget>

      {/* W8: Reports */}
      <Widget onClick={() => setSubPage('reports')} title="Reports 📊"
        titleRight={<ActionBtn label="See all →" color={C.blue} onClick={() => setSubPage('reports')} />}>
        <div style={{ fontSize:11, color:C.muted, marginBottom:10 }}>Class Mastery · Student Report · Grade Distribution · Needs Attention · Comm. Log · Progress</div>
        <div style={{ display:'flex', gap:8 }}>
          <ActionBtn label="🖨 Print"        color={C.green}  onClick={() => window.print()} />
          <ActionBtn label="⬇ PDF"          color={C.blue}   onClick={() => window.print()} />
          <ActionBtn label="📋 Spreadsheet" color={C.purple} onClick={() => setSubPage('reports')} />
        </div>
      </Widget>

      {/* W9: Class Feed */}
      <Widget onClick={() => setSubPage('classFeed')} title="Class Feed 📢"
        titleRight={<ActionBtn label="+ Post" color={C.teal} onClick={() => setSubPage('classFeed')} />}>
        {store.feed?.slice(0,1).map(f => (
          <div key={f.id} onClick={e => { e.stopPropagation(); setSubPage('classFeed') }}
            style={{ background:C.inner, borderRadius:12, padding:'10px 12px', cursor:'pointer' }}>
            <div style={{ fontSize:12, color:C.text, marginBottom:4 }}>{f.content.substring(0,60)}...</div>
            <div style={{ fontSize:10, color:C.muted }}>{f.time} · tap to open feed →</div>
          </div>
        ))}
      </Widget>

      {/* W10: Grading */}
      <Widget onClick={() => onCameraClick?.()} title="Grading 📷"
        style={{ display:'flex', alignItems:'center', gap:14 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>Tap 📷 to scan · Synced: PowerSchool ✓</div>
          <div style={{ fontSize:10, color:C.green, fontWeight:600 }}>Weights: Test 40% · Quiz 30% · HW 20% · Part. 10%</div>
        </div>
        <button onClick={e => { e.stopPropagation(); onCameraClick?.() }}
          style={{ width:52, height:52, borderRadius:'50%', background:'linear-gradient(135deg,#BA0C2F,#7a0820)', border:'none', cursor:'pointer', fontSize:24, flexShrink:0 }}>
          📷
        </button>
      </Widget>

      <BottomNav role="teacher" activePage={subPage||'dashboard'} onNavigate={navSelect} isSubPage={false} />
    </div>
  )
}
