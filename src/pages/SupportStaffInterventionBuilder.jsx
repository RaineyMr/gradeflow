// src/pages/SupportStaffInterventionBuilder.jsx
import React, { useState } from 'react'
import { useStore } from '../lib/store'
import InterventionPlanCard from '../components/support/InterventionPlanCard'
import AIAssistantPanel from '../components/support/AIAssistantPanel'
import ParentAIAssistantPanel from '../components/parents/ParentAIAssistantPanel'
import { demoSupportInterventions, INTERVENTION_TYPES } from '../lib/demoSupportInterventions'

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

const T = {
  header: 'linear-gradient(135deg, #003057 0%, #000d1a 100%)',
}

function inputStyle(focused = false) {
  return {
    width:'100%', background:C.inner,
    border:`1px solid ${focused ? C.teal : C.border}`,
    borderRadius:12, padding:'10px 14px',
    color:C.text, fontSize:13, outline:'none',
    boxSizing:'border-box', fontFamily:'inherit',
    transition:'border-color 0.15s',
  }
}

// ─── Plan form ────────────────────────────────────────────────────────────────
function PlanForm({ student, existingPlan, onSave, onCancel }) {
  const [type,          setType]          = useState(existingPlan?.type          || 'academic')
  const [goal,          setGoal]          = useState(existingPlan?.goal          || '')
  const [steps,         setSteps]         = useState(existingPlan?.steps?.join('\n') || '')
  const [progressNotes, setProgressNotes] = useState(existingPlan?.progressNotes || '')
  const [followUpDate,  setFollowUpDate]  = useState(existingPlan?.followUpDate  || '')
  const [error,         setError]         = useState('')
  const [saving,        setSaving]        = useState(false)
  const [focused,       setFocused]       = useState('')

  const gradeColor = student.grade >= 80 ? C.green : student.grade >= 70 ? C.amber : C.red

  async function handleSave() {
    if (!goal.trim())         { setError('Goal statement is required.'); return }
    if (!steps.trim())        { setError('At least one action step is required.'); return }
    if (!followUpDate)        { setError('Follow-up date is required.'); return }
    setError('')
    setSaving(true)

    const plan = {
      id:            existingPlan?.id || `int-${Date.now()}`,
      studentId:     student.id,
      type,
      goal:          goal.trim(),
      steps:         steps.split('\n').map(s => s.trim()).filter(Boolean),
      progressNotes: progressNotes.trim(),
      followUpDate,
      status:        existingPlan?.status || 'active',
      createdAt:     existingPlan?.createdAt || new Date().toISOString(),
      updatedAt:     new Date().toISOString(),
    }

    await onSave(plan)
    setSaving(false)
  }

  return (
    <div style={{ padding:'16px' }}>

      {/* Student header card — read-only */}
      <div style={{ background:C.card, border:`1px solid ${gradeColor}30`, borderRadius:16, padding:'14px 16px', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:44, height:44, borderRadius:'50%', background:'var(--school-color)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>👤</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15, fontWeight:800, color:C.text }}>{student.name}</div>
            <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>
              Current grade: <span style={{ color:gradeColor, fontWeight:700 }}>{student.grade}%</span>
              {student.flagged && <span style={{ marginLeft:8, fontSize:9, fontWeight:700, background:`${C.red}18`, color:C.red, borderRadius:999, padding:'1px 6px' }}>⚑ Flagged</span>}
            </div>
          </div>
          <div style={{ fontSize:9, color:C.muted, background:C.inner, borderRadius:8, padding:'4px 8px', fontWeight:600 }}>READ-ONLY GRADE</div>
        </div>
      </div>

      {/* Intervention type */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Intervention Type</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
          {INTERVENTION_TYPES.map(t => (
            <button key={t.value} onClick={() => setType(t.value)}
              style={{ background: type===t.value ? `${C.teal}18` : C.inner, border:`1px solid ${type===t.value ? C.teal : C.border}`, borderRadius:12, padding:'10px 12px', cursor:'pointer', textAlign:'left', transition:'all 0.15s' }}>
              <div style={{ fontSize:14, marginBottom:3 }}>{t.icon}</div>
              <div style={{ fontSize:11, fontWeight:700, color: type===t.value ? C.teal : C.text }}>{t.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Goal */}
      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>
          Goal Statement <span style={{ color:C.red }}>*</span>
        </div>
        <textarea
          value={goal}
          onChange={e => { setGoal(e.target.value); setError('') }}
          onFocus={() => setFocused('goal')}
          onBlur={() => setFocused('')}
          placeholder="e.g. Marcus will improve Math grade from 58% to 75% by end of quarter..."
          rows={3}
          style={{ ...inputStyle(focused==='goal'), resize:'vertical', minHeight:72 }}
        />
      </div>

      {/* Action steps */}
      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>
          Action Steps <span style={{ color:C.red }}>*</span>
          <span style={{ color:C.muted, fontWeight:400, marginLeft:6, textTransform:'none' }}>(one per line)</span>
        </div>
        <textarea
          value={steps}
          onChange={e => { setSteps(e.target.value); setError('') }}
          onFocus={() => setFocused('steps')}
          onBlur={() => setFocused('')}
          placeholder="Daily tutoring 4x/week&#10;Visual aids for fractions&#10;Weekly parent communication"
          rows={4}
          style={{ ...inputStyle(focused==='steps'), resize:'vertical', minHeight:96 }}
        />
      </div>

      {/* Progress notes */}
      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Progress Monitoring Notes</div>
        <textarea
          value={progressNotes}
          onChange={e => setProgressNotes(e.target.value)}
          onFocus={() => setFocused('notes')}
          onBlur={() => setFocused('')}
          placeholder="Week 1: Good engagement. Showing improvement..."
          rows={3}
          style={{ ...inputStyle(focused==='notes'), resize:'vertical', minHeight:72 }}
        />
      </div>

      {/* Follow-up date */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>
          Follow-Up Date <span style={{ color:C.red }}>*</span>
        </div>
        <input
          type="date"
          value={followUpDate}
          onChange={e => { setFollowUpDate(e.target.value); setError('') }}
          style={{ ...inputStyle(focused==='date'), colorScheme:'dark' }}
          onFocus={() => setFocused('date')}
          onBlur={() => setFocused('')}
        />
      </div>

      {/* Error */}
      {error && (
        <div style={{ background:`${C.red}15`, border:`1px solid ${C.red}30`, borderRadius:10, padding:'8px 12px', fontSize:11, color:C.red, marginBottom:14 }}>
          {error}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display:'flex', gap:10 }}>
        <button onClick={onCancel}
          style={{ flex:1, background:C.inner, color:C.soft, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px', fontSize:13, fontWeight:700, cursor:'pointer' }}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving}
          style={{ flex:2, background: saving ? C.inner : 'var(--school-color)', color: saving ? C.muted : '#fff', border:'none', borderRadius:12, padding:'12px', fontSize:13, fontWeight:700, cursor: saving ? 'not-allowed' : 'pointer', transition:'all 0.15s' }}>
          {saving ? 'Saving…' : existingPlan ? '💾 Update Plan' : '✅ Save Plan'}
        </button>
      </div>

      {/* Permission notice */}
      <div style={{ fontSize:10, color:C.muted, textAlign:'center', marginTop:12, lineHeight:1.5 }}>
        As support staff you can create and edit intervention plans.<br/>
        Grades, attendance, and teacher notes are read-only.
      </div>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────
const DEMO_STUDENTS = [
  { id:1, name:'Marcus Thompson', grade:58, flagged:true  },
  { id:2, name:'Zoe Anderson',    grade:55, flagged:true  },
  { id:3, name:'Liam Martinez',   grade:61, flagged:true  },
  { id:4, name:'Sofia Rodriguez', grade:82, flagged:false },
  { id:5, name:'Jordan Williams', grade:74, flagged:false },
]

export default function SupportStaffInterventionBuilder({ onBack, initialStudentId }) {
  const { createSupportStaffInterventionPlan, updateSupportStaffInterventionPlan } = useStore()
  const [showAI, setShowAI] = useState(false)
  const [showParentAI, setShowParentAI] = useState(false)

  const [mode,       setMode]       = useState('list')     // 'list' | 'create' | 'edit' | 'success'
  const [plans,      setPlans]      = useState(demoSupportInterventions)
  const [selected,   setSelected]   = useState(
    initialStudentId ? DEMO_STUDENTS.find(s => s.id === initialStudentId) : null
  )
  const [editingPlan, setEditingPlan] = useState(null)

  function openCreate(student) {
    setSelected(student)
    setEditingPlan(null)
    setMode('create')
  }

  function openEdit(plan) {
    const student = DEMO_STUDENTS.find(s => s.id === plan.studentId)
    setSelected(student)
    setEditingPlan(plan)
    setMode('edit')
  }

  async function handleSave(plan) {
    if (editingPlan) {
      setPlans(prev => prev.map(p => p.id === plan.id ? plan : p))
      await updateSupportStaffInterventionPlan?.(plan.id, plan)
    } else {
      setPlans(prev => [plan, ...prev])
      await createSupportStaffInterventionPlan?.(plan.studentId, plan)
    }
    setMode('success')
    setTimeout(() => setMode('list'), 1800)
  }

  // ── Success flash ──────────────────────────────────────────────────────────
  if (mode === 'success') return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center', padding:'40px 20px' }}>
        <div style={{ fontSize:56, marginBottom:16 }}>✅</div>
        <div style={{ fontSize:18, fontWeight:800, color:C.text, marginBottom:8 }}>Plan Saved!</div>
        <div style={{ fontSize:12, color:C.muted }}>Returning to plan list…</div>
      </div>
    </div>
  )

  // ── Create / Edit form ─────────────────────────────────────────────────────
  if (mode === 'create' || mode === 'edit') return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", paddingBottom:100 }}>
      <div style={{ background:T.header, padding:'16px 16px 20px', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={() => setMode('list')} style={{ background:'rgba(255,255,255,0.12)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
          <h1 style={{ fontSize:18, fontWeight:800, color:'#fff', margin:0 }}>
            {mode === 'edit' ? '✏️ Edit Plan' : '+ New Intervention Plan'}
          </h1>
        </div>
      </div>
      <PlanForm
        student={selected}
        existingPlan={editingPlan}
        onSave={handleSave}
        onCancel={() => setMode('list')}
      />
    </div>
  )

  // ── List view ──────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", paddingBottom:100 }}>

      <div style={{ background:T.header, padding:'16px 16px 20px', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:4 }}>
          <button onClick={onBack} style={{ background:'rgba(255,255,255,0.12)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
          <div style={{ flex:1, minWidth:0 }}>
            <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>🎯 Intervention Plans</h1>
            <p style={{ fontSize:10, color:'rgba(255,255,255,0.55)', margin:0 }}>{plans.length} active plan{plans.length !== 1 ? 's' : ''}</p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button
              onClick={() => setShowParentAI(true)}
              style={{ background:'rgba(255,255,255,0.12)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}
            >
              👨‍👩‍👧‍👦 Parent AI
            </button>
            <button
              onClick={() => setShowAI(true)}
              style={{ background:'rgba(255,255,255,0.12)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}
            >
              🤖 AI Assist
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding:'16px' }}>

        {/* Quick-create buttons per student */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Create New Plan For</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {DEMO_STUDENTS.filter(s => s.grade < 80 || s.flagged).map(s => (
              <button key={s.id} onClick={() => openCreate(s)}
                style={{ background:`${s.grade < 70 ? C.red : C.amber}18`, color: s.grade < 70 ? C.red : C.amber, border:`1px solid ${s.grade < 70 ? C.red : C.amber}30`, borderRadius:10, padding:'7px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                + {s.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Existing plans */}
        <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Active Plans</div>

        {plans.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px 0', color:C.muted }}>
            <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
            <div style={{ fontSize:14, fontWeight:600, color:C.soft, marginBottom:8 }}>No plans yet</div>
            <div style={{ fontSize:12 }}>Create a plan for a student above to get started.</div>
          </div>
        ) : plans.map(plan => {
          const student = DEMO_STUDENTS.find(s => s.id === plan.studentId)
          return (
            <div key={plan.id}>
              {student && (
                <div style={{ fontSize:11, fontWeight:700, color:C.muted, marginBottom:4, marginTop:4 }}>{student.name}</div>
              )}
              <InterventionPlanCard
                plan={plan}
                onClick={() => openEdit(plan)}
              />
            </div>
          )
        })}
      </div>

      {/* AI Assistant Panel */}
      <AIAssistantPanel
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        initialContext={{ 
          screen: 'interventions',
          plans: plans,
          selectedStudent: selected
        }}
      />

      {/* Parent AI Assistant Panel */}
      <ParentAIAssistantPanel
        isOpen={showParentAI}
        onClose={() => setShowParentAI(false)}
        initialContext={{ 
          screen: 'parentIntervention',
          plans: plans,
          selectedStudent: selected
        }}
      />
    </div>
  )
}
