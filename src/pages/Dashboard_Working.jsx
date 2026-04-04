import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { useT } from '../lib/i18n'
import BottomNav from '../components/ui/BottomNav'

// Import advanced widget components from the main dashboard
import {
  TodaysLessonsWidget,
  NeedsAttentionWidget,
  MessagesWidget,
  ReportsWidget,
  GradingWidget,
  LessonPlanWidget,
  SketchAnnotateWidget,
  TestingSuiteWidget,
  ScanGradeSheetWidget,
  GradebookWidget
} from './Dashboard'

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

function scrollTop() {
  window.scrollTo(0, 0)
  document.querySelector('[data-app-scroll]')?.scrollTo(0, 0)
}

// Apply school theming
function applyTheme(key) {
  const themes = {
    'houston-isd': { primary: '#003057', secondary: '#B3A369', surface: '#000d1a', text: '#e8f0ff' },
    'kipp-la': { primary: '#BA0C2F', secondary: '#000000', surface: '#1a0008', text: '#ffe8ed' },
    'bellaire-parish': { primary: '#B3A369', secondary: '#003057', surface: '#1a1800', text: '#faf7ee' },
  }
  const t = themes[key] || themes['houston-isd']
  const r = document.documentElement
  r.style.setProperty('--school-color', t.primary)
  r.style.setProperty('--school-secondary', t.secondary)
  r.style.setProperty('--school-surface', t.surface)
  r.style.setProperty('--school-text', t.text)
}

// Widget component with remove button
function Widget({ onClick, children, style={}, title, titleRight, onRemove }) {
  return (
    <div onClick={onClick}
      style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:'16px', marginBottom:12, cursor:onClick?'pointer':'default', transition:'border-color 0.12s, transform 0.15s', position:'relative', ...style }}
      onMouseEnter={e => { if (!onClick) return; e.currentTarget.style.borderColor = 'var(--school-color, #003057)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { if (!onClick) return; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0px)' }}>
      {onRemove && (
        <button onClick={e=>{ e.stopPropagation(); onRemove(); }} title="Remove widget"
          style={{ position:'absolute', top:-10, right:8, zIndex:20, width:22, height:22, borderRadius:'50%', background:C.bg, border:'1px solid rgba(255,255,255,0.3)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1, boxShadow:'0 2px 6px rgba(0,0,0,0.4)' }}>
          ×
        </button>
      )}
      {title && (
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div style={{ fontSize:13, fontWeight:800, color:C.text }}>{title}</div>
          {titleRight}
        </div>
      )}
      {children}
    </div>
  )
}

// Action button component
function ActionBtn({ label, color, onClick }) {
  return (
    <button onClick={onClick}
      style={{ background:`${color}18`, color, border:`1px solid ${color}30`, borderRadius:9, padding:'5px 10px', fontSize:10, fontWeight:700, cursor:'pointer', transition:'all 0.15s' }}
      onMouseEnter={e=>{ e.currentTarget.style.background=`${color}30` }}
      onMouseLeave={e=>{ e.currentTarget.style.background=`${color}18` }}>
      {label}
    </button>
  )
}

// Trend badge component
function TrendBadge({ trend }) {
  const map = { up:['↑',C.green], down:['↓',C.red], stable:['→',C.muted] }
  const [icon, color] = map[trend] || map.stable
  return <span style={{ fontSize:11, color, fontWeight:700 }}>{icon}</span>
}

// ─── Empty State Widgets ────────────────────────────────────────────────────────

// Empty Messages Widget
function EmptyMessagesWidget({ navigate, onRemove }) {
  const t = useT()
  
  return (
    <Widget style={{ background:'linear-gradient(135deg,#0d0820 0%,#060810 100%)', border:`1px solid ${C.purple}25` }} onRemove={onRemove}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:800, color:C.text }}>💬 {t('nav_messages')}</div>
          <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>Parent communication</div>
        </div>
        <button onClick={e=>{ e.stopPropagation(); navigate('parentMessages') }}
          style={{ background:`${C.purple}18`, color:C.purple, border:`1px solid ${C.purple}30`, borderRadius:9, padding:'5px 10px', fontSize:10, fontWeight:700, cursor:'pointer' }}>
          Open →
        </button>
      </div>

      <div style={{ textAlign:'center', padding:'32px 16px' }}>
        <div style={{ fontSize:32, marginBottom:12, opacity:0.6 }}>💬</div>
        <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:8 }}>
          No messages yet
        </div>
        <div style={{ fontSize:12, color:C.muted, lineHeight:1.5, marginBottom:16 }}>
          Start communicating with parents once you have classes set up
        </div>
        <button onClick={e=>{ e.stopPropagation(); navigate('parentMessages') }}
          style={{ background:C.purple, color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
          Set Up Messaging
        </button>
      </div>
    </Widget>
  )
}

// Empty Classes Widget
function EmptyClassesWidget({ navigate, onRemove }) {
  const t = useT()
  
  return (
    <Widget onClick={()=>navigate('classes')} onRemove={onRemove}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div style={{ fontSize:13, fontWeight:800, color:C.text }}>
          📚 {t('my_classes')}
        </div>
        <button onClick={e=>{ e.stopPropagation(); navigate('classes') }}
          style={{ background:`${C.blue}18`, color:C.blue, border:`1px solid ${C.blue}30`, borderRadius:9, padding:'5px 10px', fontSize:10, fontWeight:700, cursor:'pointer' }}>
          + Add
        </button>
      </div>

      <div style={{ textAlign:'center', padding:'32px 16px' }}>
        <div style={{ fontSize:32, marginBottom:12, opacity:0.6 }}>📚</div>
        <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:8 }}>
          No classes yet
        </div>
        <div style={{ fontSize:12, color:C.muted, lineHeight:1.5, marginBottom:16 }}>
          Add your first class to get started with GradeFlow
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          <button onClick={e=>{ e.stopPropagation(); navigate('classes/create') }}
            style={{ background:C.blue, color:'#fff', border:'none', borderRadius:8, padding:'8px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
            ✏️ Create
          </button>
          <button onClick={e=>{ e.stopPropagation(); navigate('classes/upload') }}
            style={{ background:C.green, color:'#fff', border:'none', borderRadius:8, padding:'8px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
            📤 Upload
          </button>
        </div>
      </div>
    </Widget>
  )
}

// Empty Reports Widget
function EmptyReportsWidget({ navigate, onRemove }) {
  const t = useT()
  
  return (
    <Widget style={{ background:'linear-gradient(135deg,#0a1628 0%,#060810 100%)', border:'1px solid #1a2a40' }} onRemove={onRemove}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:800, color:C.text }}>📊 {t('nav_reports')}</div>
          <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>Analytics & insights</div>
        </div>
        <button onClick={e=>{ e.stopPropagation(); navigate('reports') }}
          style={{ background:`${C.blue}18`, color:C.blue, border:`1px solid ${C.blue}30`, borderRadius:9, padding:'5px 10px', fontSize:10, fontWeight:700, cursor:'pointer' }}>
          Open →
        </button>
      </div>

      <div style={{ textAlign:'center', padding:'32px 16px' }}>
        <div style={{ fontSize:32, marginBottom:12, opacity:0.6 }}>📊</div>
        <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:8 }}>
          No data available
        </div>
        <div style={{ fontSize:12, color:C.muted, lineHeight:1.5, marginBottom:16 }}>
          Start teaching to see student performance reports
        </div>
        <button onClick={e=>{ e.stopPropagation(); navigate('classes') }}
          style={{ background:C.blue, color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
          Add Classes First
        </button>
      </div>
    </Widget>
  )
}

// Empty Grading Widget
function EmptyGradingWidget({ navigate, onRemove }) {
  return (
    <Widget onClick={()=>navigate('camera')} onRemove={onRemove}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span 
            onClick={e=>{ e.stopPropagation(); navigate('camera'); }}
            style={{ cursor:'pointer', fontSize:13, fontWeight:800, color:C.text, padding:0, display:'inline-block' }}>
            📷
          </span>
          <span style={{ fontSize:13, fontWeight:800, color:C.text }}>Grading</span>
        </div>
        <span style={{ fontSize:10, color:C.muted, fontWeight:700 }}>Not connected</span>
      </div>
      
      <div style={{ fontSize:11, color:C.muted, marginBottom:10 }}>
        Set up grading to scan and grade papers instantly
      </div>
      
      <div style={{ textAlign:'center', padding:'20px 0' }}>
        <div style={{ fontSize:24, marginBottom:8, opacity:0.6 }}>📷</div>
        <div style={{ fontSize:12, color:C.muted, marginBottom:12 }}>
          Connect PowerSchool or use camera scanning
        </div>
        <button onClick={e=>{ e.stopPropagation(); navigate('settings') }}
          style={{ background:C.teal, color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
          Set Up Grading
        </button>
      </div>
    </Widget>
  )
}

// Empty Lesson Plan Widget
function EmptyLessonPlanWidget({ navigate, onRemove }) {
  return (
    <Widget style={{ background:'linear-gradient(135deg,#071a30 0%,#060810 100%)', border:`1px solid ${C.teal}25` }} onRemove={onRemove}>
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

      <div style={{ textAlign:'center', padding:'20px 0' }}>
        <div style={{ fontSize:24, marginBottom:8, opacity:0.6 }}>📋</div>
        <div style={{ fontSize:12, color:C.muted, marginBottom:12 }}>
          Create AI-powered lesson plans with TEKS standards
        </div>
        <button onClick={e=>{ e.stopPropagation(); navigate('lessonPlan') }}
          style={{ background:C.teal, color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
          Create First Lesson
        </button>
      </div>
    </Widget>
  )
}

// Empty Gradebook Widget
function EmptyGradebookWidget({ navigate, onRemove }) {
  const t = useT()
  
  return (
    <Widget style={{ background:'linear-gradient(135deg,#0a1628 0%,#060810 100%)', border:'1px solid #1a2a40' }} onRemove={onRemove}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:800, color:C.text }}>📓 Gradebook</div>
          <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>Grade management</div>
        </div>
        <button onClick={e=>{ e.stopPropagation(); navigate('gradebook') }}
          style={{ background:`${C.blue}18`, color:C.blue, border:`1px solid ${C.blue}30`, borderRadius:9, padding:'5px 10px', fontSize:10, fontWeight:700, cursor:'pointer' }}>
          Open →
        </button>
      </div>

      <div style={{ textAlign:'center', padding:'32px 16px' }}>
        <div style={{ fontSize:32, marginBottom:12, opacity:0.6 }}>📓</div>
        <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:8 }}>
          No grades yet
        </div>
        <div style={{ fontSize:12, color:C.muted, lineHeight:1.5, marginBottom:16 }}>
          Add classes and start grading to see student progress
        </div>
        <button onClick={e=>{ e.stopPropagation(); navigate('classes') }}
          style={{ background:C.blue, color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
          Add Classes First
        </button>
      </div>
    </Widget>
  )
}
function DailyOverviewWidget({ navigate, onRemove }) {
  const { classes, messages, getNeedsAttention } = useStore()
  const pending = messages.filter(m=>m.status==='pending')
  const atRisk = getNeedsAttention()
  const t = useT()

  const overviewTiles = [
    { icon:'📚', val:classes.length,    label:t('nav_classes'),      page:'classes',        color:C.blue   },
    { icon:'💬', val:pending.length||'',label:t('nav_messages'),     page:'parentMessages', color:C.purple },
    { icon:'📋', val:'',                label:t('lesson_plans'), page:'lessonPlan',     color:C.teal   },
    { icon:'🔔', val:atRisk.length||'', label:t('nav_alerts'),       page:'alerts',         color:C.red    },
  ]

  return (
    <Widget style={{ background:'var(--school-surface,#1a0008)', border:'1px solid rgba(255,255,255,0.06)' }} onRemove={onRemove}>
      <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:12 }}>{t('daily_overview')}</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
        {overviewTiles.map(tile=>(
          <button key={tile.label} onClick={e=>{ e.stopPropagation(); navigate(tile.page) }}
            style={{ background:`${tile.color}18`, border:`1px solid ${tile.color}30`, borderRadius:14, padding:'10px 4px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, transition:'background 0.15s' }}
            onMouseEnter={e=>(e.currentTarget.style.background=`${tile.color}30`)}
            onMouseLeave={e=>(e.currentTarget.style.background=`${tile.color}18`)}>
            <span style={{ fontSize:16, lineHeight:1 }}>{tile.icon}</span>
            {tile.val!=='' && <span style={{ fontSize:16, fontWeight:900, color:tile.color, lineHeight:1 }}>{tile.val}</span>}
            <span style={{ fontSize:8, color:'rgba(255,255,255,0.5)', textAlign:'center', fontWeight:600, marginTop:'auto' }}>{tile.label}</span>
          </button>
        ))}
      </div>
    </Widget>
  )
}

// ─── Widget Management System ─────────────────────────────────────────────────
function getWidgetCatalog(t) {
  return [
    { id:'overview',   label:t('daily_overview'),      icon:'📅', desc:t('nav_classes') + ', ' + t('nav_messages') + ', ' + t('lesson_plans') + ' & ' + t('nav_alerts') },
    { id:'lessons',    label:t('todays_lessons'),     icon:'📖', desc:t('lesson_status') + ' and ' + t('quick_actions') },
    { id:'classes',    label:t('my_classes'),         icon:'📚', desc:t('class_performance') + ' & ' + t('student_data') },
    { id:'attention',  label:t('needs_attention'),    icon:'⚑',  desc:t('at_risk_students') + ' & ' + t('intervention_alerts') },
    { id:'messages',   label:t('nav_messages'),       icon:'💬', desc:t('parent_communication') + ' & ' + t('ai_drafts') },
    { id:'reports',    label:t('nav_reports'),        icon:'📊', desc:t('analytics') + ' & ' + t('performance_data') },
    { id:'grading',    label:'Grading',               icon:'📷', desc:t('grade_scanning') + ' & ' + t('power_school_sync') },
    { id:'lessonPlan', label:t('lesson_plans'),       icon:'📋', desc:t('ai_lesson_generation') + ' & ' + t('standards_integration') },
    { id:'sketch',     label:'Sketch & Annotate',     icon:'✏️', desc:t('drawing_tools') + ' & ' + t('document_markup') },
    { id:'testing',    label:'Testing Suite',          icon:'📝', desc:t('test_creation') + ' & ' + t('assessment_tools') },
    { id:'scan',       label:'Scan Grade Sheet',       icon:'📷', desc:t('document_scanning') + ' & ' + t('instant_grading') },
    { id:'gradebook',  label:t('nav_gradebook'),      icon:'📓', desc:t('grade_management') + ' & ' + t('student_tracking') },
  ]
}

function AddWidgetsModal({ hidden, onToggle, onClose }) {
  const t = useT()
  const catalog = getWidgetCatalog(t)
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
          {catalog.map(w => {
            const isActive = !hidden.includes(w.id)
            return (
              <button key={w.id} onClick={() => onToggle(w.id)}
                style={{ 
                  background: isActive ? C.card : C.inner, 
                  border: `1px solid ${isActive ? C.border : C.muted}30`, 
                  borderRadius:12, padding:'12px', cursor:'pointer', textAlign:'left', transition:'all 0.15s',
                  opacity: isActive ? 1 : 0.6
                }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor = 'var(--school-color, #003057)' }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor = isActive ? C.border : C.muted + '30' }}>
                <div style={{ fontSize:16, marginBottom:6 }}>{w.icon}</div>
                <div style={{ fontSize:12, fontWeight:700, color:C.text, marginBottom:4 }}>{w.label}</div>
                <div style={{ fontSize:10, color:C.muted, lineHeight:1.3 }}>{w.desc}</div>
                {isActive && (
                  <div style={{ marginTop:8, fontSize:9, color:C.green, fontWeight:700 }}>✓ Active</div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function AddWidgetsBar({ onOpen }) {
  return (
    <div style={{ margin:'4px 0 24px', textAlign:'center' }}>
      <button onClick={onOpen} type="button"
        style={{ background:'var(--school-color, #003057)', border:'none', borderRadius:14, padding:'12px 28px', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', transition:'transform 0.15s' }}
        onMouseEnter={e=>{ e.currentTarget.style.transform = 'scale(1.02)' }}
        onMouseLeave={e=>{ e.currentTarget.style.transform = 'scale(1)' }}>
        + Add widgets
      </button>
    </div>
  )
}
function UserHeader({ currentUser }) {
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  
  return (
    <div style={{ 
      position: 'sticky', top: 0, zIndex: 100, 
      background: 'linear-gradient(135deg, var(--school-color) 0%, var(--school-surface,#0a000a) 100%)', 
      padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 2 }}>
            {currentUser?.school?.toUpperCase() || 'SCHOOL'} · {currentUser?.gradeLevel || 'TEACHER'}
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
            {greeting}, {currentUser?.name?.split(' ')?.pop() || 'Teacher'} 👋
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
          {timeStr}
        </div>
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
        {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>
    </div>
  )
}

// ─── Quick Actions Widget ─────────────────────────────────────────────────────
function QuickActions({ navigate }) {
  const t = useT()
  
  return (
    <div style={{ 
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, 
      padding: '20px', marginBottom: 16 
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 16 }}>
        ⚡ Quick Actions
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        <button onClick={() => navigate('gradebook')} 
          style={{ 
            background: 'var(--school-color, #BA0C2F)', color: '#fff', border: 'none', 
            borderRadius: 12, padding: '16px', fontSize: 13, fontWeight: 700, 
            cursor: 'pointer', textAlign: 'left', transition: 'transform 0.15s' 
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
          📚 Gradebook
        </button>
        <button onClick={() => navigate('lessons')} 
          style={{ 
            background: C.blue, color: '#fff', border: 'none', 
            borderRadius: 12, padding: '16px', fontSize: 13, fontWeight: 700, 
            cursor: 'pointer', textAlign: 'left', transition: 'transform 0.15s' 
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
          📋 Lesson Plans
        </button>
        <button onClick={() => navigate('testing')} 
          style={{ 
            background: C.green, color: '#fff', border: 'none', 
            borderRadius: 12, padding: '16px', fontSize: 13, fontWeight: 700, 
            cursor: 'pointer', textAlign: 'left', transition: 'transform 0.15s' 
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
          📝 Create Test
        </button>
        <button onClick={() => navigate('messages')} 
          style={{ 
            background: C.purple, color: '#fff', border: 'none', 
            borderRadius: 12, padding: '16px', fontSize: 13, fontWeight: 700, 
            cursor: 'pointer', textAlign: 'left', transition: 'transform 0.15s' 
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
          💬 Messages
        </button>
      </div>
    </div>
  )
}

// ─── Classes Overview Widget ───────────────────────────────────────────────────
function ClassesOverview({ currentUser, navigate }) {
  const { classes } = useStore()
  
  return (
    <div style={{ 
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, 
      padding: '20px', marginBottom: 16 
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 16 }}>
        📚 My Classes
      </div>
      
      {classes.length === 0 ? (
        // No classes yet - show setup options
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 24, marginBottom: 12 }}>🎯</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>
            Ready to set up your classes?
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>
            Choose how you'd like to add your classes and students
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            <button onClick={() => navigate('classes/create')} 
              style={{ 
                background: C.blue, color: '#fff', border: 'none', 
                borderRadius: 12, padding: '16px', fontSize: 13, fontWeight: 700, 
                cursor: 'pointer', textAlign: 'left', transition: 'transform 0.15s' 
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              ✏️ Create Classes
              <div style={{ fontSize: 10, opacity: 0.8, marginTop: 4 }}>
                Manually set up periods and subjects
              </div>
            </button>
            
            <button onClick={() => navigate('classes/upload')} 
              style={{ 
                background: C.green, color: '#fff', border: 'none', 
                borderRadius: 12, padding: '16px', fontSize: 13, fontWeight: 700, 
                cursor: 'pointer', textAlign: 'left', transition: 'transform 0.15s' 
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              📤 Upload Roster
              <div style={{ fontSize: 10, opacity: 0.8, marginTop: 4 }}>
                CSV, Excel, or PDF files
              </div>
            </button>
            
            <button onClick={() => navigate('camera')} 
              style={{ 
                background: C.purple, color: '#fff', border: 'none', 
                borderRadius: 12, padding: '16px', fontSize: 13, fontWeight: 700, 
                cursor: 'pointer', textAlign: 'left', transition: 'transform 0.15s' 
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              📸 Scan Document
              <div style={{ fontSize: 10, opacity: 0.8, marginTop: 4 }}>
                Camera scan for class lists
              </div>
            </button>
            
            <button onClick={() => navigate('classes/import')} 
              style={{ 
                background: C.amber, color: '#fff', border: 'none', 
                borderRadius: 12, padding: '16px', fontSize: 13, fontWeight: 700, 
                cursor: 'pointer', textAlign: 'left', transition: 'transform 0.15s' 
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              🔄 Import from SIS
              <div style={{ fontSize: 10, opacity: 0.8, marginTop: 4 }}>
                Connect your school system
              </div>
            </button>
          </div>
          
          <div style={{ 
            background: `${C.blue}10`, border: `1px solid ${C.blue}30`, 
            borderRadius: 12, padding: '12px', marginTop: 16, fontSize: 11, color: C.blue 
          }}>
            💡 <strong>Tip:</strong> You can always add more classes or update student lists later
          </div>
        </div>
      ) : (
        // Show existing classes
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {classes.map(cls => (
            <div key={cls.id} 
              onClick={() => navigate('gradebook')} 
              style={{ 
                background: C.inner, border: `1px solid ${C.border}`, borderRadius: 12, 
                padding: '16px', cursor: 'pointer', transition: 'all 0.15s' 
              }}
              onMouseEnter={e => { 
                e.currentTarget.style.borderColor = 'var(--school-color, #BA0C2F)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => { 
                e.currentTarget.style.borderColor = C.border
                e.currentTarget.style.transform = 'translateY(0px)'
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ 
                  width: 8, height: 8, borderRadius: '50%', 
                  background: cls.color || 'var(--school-color, #BA0C2F)' 
                }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                    {cls.period} · {cls.subject}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted }}>
                    {cls.students} students · GPA {cls.gpa}%
                  </div>
                </div>
              </div>
              {cls.needsAttention > 0 && (
                <div style={{ 
                  background: `${C.red}20`, border: `1px solid ${C.red}40`, 
                  borderRadius: 6, padding: '4px 8px', fontSize: 10, 
                  color: C.red, fontWeight: 700, display: 'inline-block' 
                }}>
                  ⚠️ {cls.needsAttention} need attention
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                <span style={{ fontSize: 11, color: C.muted }}>Trend:</span>
                <span style={{ 
                  fontSize: 11, fontWeight: 700, 
                  color: cls.trend === 'up' ? C.green : cls.trend === 'down' ? C.red : C.muted 
                }}>
                  {cls.trend === 'up' ? '↑' : cls.trend === 'down' ? '↓' : '→'} {cls.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {classes.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={() => navigate('classes/create')} 
            style={{ 
              background: C.inner, color: C.text, border: `1px solid ${C.border}`, 
              borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600, 
              cursor: 'pointer' 
            }}>
            + Add Another Class
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Profile Summary Widget ───────────────────────────────────────────────────
function ProfileSummary({ currentUser }) {
  const t = useT()
  
  return (
    <div style={{ 
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, 
      padding: '20px', marginBottom: 16 
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 16 }}>
        👤 My Profile
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>School</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
            {currentUser?.school || 'Not set'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Grade Level</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
            {currentUser?.gradeLevel || 'Not set'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Subjects</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
            {currentUser?.subjects?.join(', ') || 'Not set'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Email</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
            {currentUser?.email || 'Not set'}
          </div>
        </div>
      </div>
      
      {!currentUser?.gradeLevel && (
        <div style={{ 
          background: `${C.amber}20`, border: `1px solid ${C.amber}40`, 
          borderRadius: 8, padding: '12px', marginTop: 16 
        }}>
          <div style={{ fontSize: 12, color: C.amber, fontWeight: 700, marginBottom: 4 }}>
            ⚠️ Profile Incomplete
          </div>
          <div style={{ fontSize: 11, color: C.text }}>
            Please complete your teacher profile setup to access all features.
          </div>
        </div>
      )}
    </div>
  )
}

export default function WorkingDashboard({ currentUser, onCameraClick }) {
  const navigate = useNavigate()
  const [subPage, setSubPage] = useState(null)
  const history = useRef([])
  const { classes, messages, getNeedsAttention } = useStore()

  useEffect(() => { 
    scrollTop() 
    // Apply school theming based on user's district
    if (currentUser?.school?.district_id) {
      applyTheme(currentUser.school.district_id)
    }
  }, [currentUser])

  // Widget management state
  const [showModal, setShowModal] = useState(false)
  const [hidden, setHidden] = useState(() => {
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
        {content}
      </div>
    )
  }

  function goHome() {
    history.current = []
    setSubPage(null)
    scrollTop()
  }

  function goBack() {
    history.current.pop()
    const prev = history.current[history.current.length - 1] || null
    if (!prev) { 
      goHome()
      return 
    }
    setSubPage(prev)
    scrollTop()
  }

  function navigateToPage(page) {
    if (!page) return
    if (page === 'dashboard') { goHome(); return }
    history.current.push(page)
    setSubPage(page)
    scrollTop()
  }

  const activeNav = subPage ? subPage : 'dashboard'

  function withNav(node) {
    return (
      <>
        {node}
        <BottomNav active={activeNav} onSelect={navigateToPage} isSubPage={!!subPage} role="teacher"/>
      </>
    )
  }

  // Show minimal dashboard for teachers with no classes
  if (classes.length === 0) {
    return (
      <div style={{ 
        minHeight: '100vh', background: C.bg, color: C.text, 
        fontFamily: "'DM Sans','Helvetica Neue',sans-serif", paddingBottom: 90 
      }}>
        <UserHeader currentUser={currentUser} />
        
        <div style={{ padding: '20px' }}>
          {/* Daily Overview */}
          {wrap('overview', <DailyOverviewWidget navigate={navigateToPage} onRemove={() => toggleWidget('overview')} />)}

          {/* Welcome Message */}
          <div style={{ 
            background: `linear-gradient(135deg, var(--school-color, #003057) 0%, var(--school-surface, #0a000a) 100%)`, 
            border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 20, 
            padding: '32px', marginBottom: 32, textAlign: 'center' 
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👋</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>
              Welcome to GradeFlow, {currentUser?.name?.split(' ')?.pop() || 'Teacher'}!
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', margin: '0 0 24px', lineHeight: 1.5 }}>
              Your classroom is ready. When you're ready to add classes, you can do so from the dashboard or use the quick actions below.
            </p>
            <button onClick={() => navigateToPage('classes/create')} 
              style={{ 
                background: '#fff', color: 'var(--school-color, #003057)', 
                border: 'none', borderRadius: 12, 
                padding: '14px 28px', fontSize: 14, fontWeight: 700, 
                cursor: 'pointer' 
              }}>
              Add Your First Class →
            </button>
          </div>

          {/* Quick Actions */}
          <div style={{ 
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, 
            padding: '24px', marginBottom: 16 
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 20 }}>
              ⚡ Quick Start
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <button onClick={() => navigateToPage('classes/create')} 
                style={{ 
                  background: C.blue, color: '#fff', border: 'none', 
                  borderRadius: 12, padding: '20px', fontSize: 14, fontWeight: 700, 
                  cursor: 'pointer', textAlign: 'left', transition: 'transform 0.15s' 
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)' }
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)' }>
                📚 Add Classes
                <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>
                  Create your teaching periods
                </div>
              </button>
              
              <button onClick={() => navigateToPage('lessons')} 
                style={{ 
                  background: C.green, color: '#fff', border: 'none', 
                  borderRadius: 12, padding: '20px', fontSize: 14, fontWeight: 700, 
                  cursor: 'pointer', textAlign: 'left', transition: 'transform 0.15s' 
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)' }
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)' }>
                📋 Plan Lesson
                <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>
                  Create AI-powered lessons
                </div>
              </button>
              
              <button onClick={() => navigateToPage('camera')} 
                style={{ 
                  background: C.purple, color: '#fff', border: 'none', 
                  borderRadius: 12, padding: '20px', fontSize: 14, fontWeight: 700, 
                  cursor: 'pointer', textAlign: 'left', transition: 'transform 0.15s' 
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)' }
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)' }>
                📸 Scan Document
                <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>
                  Grade papers instantly
                </div>
              </button>
            </div>
          </div>

          {/* Available Widgets for teachers with no classes */}
          {wrap('classes', <EmptyClassesWidget navigate={navigateToPage} />)}
          {wrap('messages', <EmptyMessagesWidget navigate={navigateToPage} />)}
          {wrap('reports', <EmptyReportsWidget navigate={navigateToPage} />)}
          {wrap('grading', <EmptyGradingWidget navigate={navigateToPage} />)}
          {wrap('lessonPlan', <EmptyLessonPlanWidget navigate={navigateToPage} />)}
          {wrap('sketch', <SketchAnnotateWidget navigate={navigateToPage} />)}
          {wrap('testing', <TestingSuiteWidget navigate={navigateToPage} />)}
          {wrap('scan', <ScanGradeSheetWidget navigate={navigateToPage} />)}

          {/* Add Widgets Bar */}
          <AddWidgetsBar onOpen={() => setShowModal(true)} />

          {/* Widget Modal */}
          {showModal && (
            <AddWidgetsModal
              hidden={hidden}
              onToggle={toggleWidget}
              onClose={() => setShowModal(false)}
            />
          )}
        </div>
        
        <BottomNav active={activeNav} onSelect={navigateToPage} isSubPage={!!subPage} role="teacher"/>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', background: C.bg, color: C.text, 
      fontFamily: "'DM Sans','Helvetica Neue',sans-serif", paddingBottom: 90 
    }}>
      <UserHeader currentUser={currentUser} />
      
      {/* Full-width container like demo dashboard */}
      <div style={{ padding: '16px 20px 0' }}>
        
        {/* Widget Modal */}
        {showModal && (
          <AddWidgetsModal
            hidden={hidden}
            onToggle={toggleWidget}
            onClose={() => setShowModal(false)}
          />
        )}

        {/* Test Gradebook Widget at TOP */}
        <div style={{ background:'red', color:'white', padding:'20px', marginBottom:'16px', borderRadius:'12px', textAlign:'center' }}>
          <h3>TEST: Gradebook Widget Should Be Here</h3>
          <p>If you can see this, basic rendering works</p>
        </div>
        
        <Widget style={{ background:'linear-gradient(135deg,#0a1628 0%,#060810 100%)', border:'1px solid #1a2a40', marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:800, color:C.text }}>📓 Gradebook</div>
              <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>Grade management</div>
            </div>
            <button onClick={e=>{ e.stopPropagation(); navigate('gradebook') }}
              style={{ background:`${C.blue}18`, color:C.blue, border:`1px solid ${C.blue}30`, borderRadius:9, padding:'5px 10px', fontSize:10, fontWeight:700, cursor:'pointer' }}>
              Open →
            </button>
          </div>

          <div style={{ textAlign:'center', padding:'32px 16px' }}>
            <div style={{ fontSize:32, marginBottom:12, opacity:0.6 }}>📓</div>
            <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:8 }}>
              No grades yet
            </div>
            <div style={{ fontSize:12, color:C.muted, lineHeight:1.5, marginBottom:16 }}>
              Add classes and start grading to see student progress
            </div>
            <button onClick={e=>{ e.stopPropagation(); navigate('classes') }}
              style={{ background:C.blue, color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
              Add Classes First
            </button>
          </div>
        </Widget>

        {/* Daily Overview */}
        {wrap('overview', <DailyOverviewWidget navigate={navigateToPage} onRemove={() => toggleWidget('overview')} />)}
        
        {/* Today's Lessons */}
        {wrap('lessons', <TodaysLessonsWidget navigate={navigateToPage} />)}
        
        {/* Classes */}
        {classes.length === 0 ? (
          wrap('classes', <EmptyClassesWidget navigate={navigateToPage} />)
        ) : (
          wrap('classes', <ClassesOverview currentUser={currentUser} navigate={navigateToPage} />)
        )}
        
        {/* Needs Attention */}
        {wrap('attention', <NeedsAttentionWidget atRisk={getNeedsAttention()} navigate={navigateToPage} />)}
        
        {/* Messages */}
        {wrap('messages', <EmptyMessagesWidget navigate={navigateToPage} />)}
        
        {/* Test Gradebook Widget */}
        <Widget style={{ background:'linear-gradient(135deg,#0a1628 0%,#060810 100%)', border:'1px solid #1a2a40' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:800, color:C.text }}>📓 Gradebook</div>
              <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>Grade management</div>
            </div>
            <button onClick={e=>{ e.stopPropagation(); navigate('gradebook') }}
              style={{ background:`${C.blue}18`, color:C.blue, border:`1px solid ${C.blue}30`, borderRadius:9, padding:'5px 10px', fontSize:10, fontWeight:700, cursor:'pointer' }}>
              Open →
            </button>
          </div>

          <div style={{ textAlign:'center', padding:'32px 16px' }}>
            <div style={{ fontSize:32, marginBottom:12, opacity:0.6 }}>📓</div>
            <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:8 }}>
              No grades yet
            </div>
            <div style={{ fontSize:12, color:C.muted, lineHeight:1.5, marginBottom:16 }}>
              Add classes and start grading to see student progress
            </div>
            <button onClick={e=>{ e.stopPropagation(); navigate('classes') }}
              style={{ background:C.blue, color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
              Add Classes First
            </button>
          </div>
        </Widget>
        
        {/* Reports */}
        {wrap('reports', <EmptyReportsWidget navigate={navigateToPage} />)}
        
        {/* Grading */}
        {wrap('grading', <EmptyGradingWidget navigate={navigateToPage} />)}
        
        {/* Lesson Plan */}
        {wrap('lessonPlan', <EmptyLessonPlanWidget navigate={navigateToPage} />)}
        
        {/* Sketch & Annotate */}
        {wrap('sketch', <SketchAnnotateWidget navigate={navigateToPage} />)}
        
        {/* Testing Suite */}
        {wrap('testing', <TestingSuiteWidget navigate={navigateToPage} />)}
        
        {/* Scan Grade Sheet */}
        {wrap('scan', <ScanGradeSheetWidget navigate={navigateToPage} />)}
        
        {/* Add Widgets Bar at bottom */}
        <AddWidgetsBar onOpen={() => setShowModal(true)} />
      </div>
    </div>
  )
}
