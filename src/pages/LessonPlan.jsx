import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { generateLessonPlan, extractAccommodations, generateLessonAccommodations } from '../lib/ai'
import StandardsSelector from '../components/standards/StandardsSelector'
import LessonViewModal from '../components/LessonViewModal'
import { supabase } from '../lib/supabase'

const C = {
  bg:'#060810', card:'#161923', inner:'#1e2231', text:'#eef0f8',
  muted:'#6b7494', border:'#2a2f42', green:'#22c97a', blue:'#3b7ef4',
  amber:'#f5a623', purple:'#9b6ef5', teal:'#0fb8a0', red:'#f04a4a',
}

const ACCOM_TYPES = ['IEP', '504', 'ELL', 'Gifted', 'Other']

const ACCOM_TYPE_COLORS = {
  IEP:    C.purple,
  '504':  C.blue,
  ELL:    C.teal,
  Gifted: C.green,
  Other:  C.amber,
}

function safeParseJSON(text) {
  try { return JSON.parse(text.replace(/```json|```/g, '').trim()) } catch {}
  try { const m = text.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]) } catch {}
  return null
}

export const formatLabel = (str) => {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div style={{ textAlign:'center', padding:'32px 0' }}>
      <div style={{ width:36, height:36, border:`3px solid var(--school-color)`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }} />
      <p style={{ color:C.muted, fontSize:13 }}>{label}</p>
      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
    </div>
  )
}

function Section({ title, items }) {
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:11, fontWeight:700, color:C.teal, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>{title}</div>
      {items.map((item, i) => (
        <div key={i} style={{ background:C.inner, borderRadius:10, padding:'10px 12px', marginBottom:6, fontSize:13, color:C.text, lineHeight:1.5 }}>
          {item}
        </div>
      ))}
    </div>
  )
}

// ─── Accommodations Section ───────────────────────────────────────────────────
function AccommodationsSection({ lessonTopic = '', lessonSubject = '', lessonGrade = '' }) {
  const { studentAccommodations, updateAccommodation, addAccommodation, removeAccommodation, setLessonAdjustments } = useStore()
  const [open,         setOpen]         = useState(false)
  const [newName,      setNewName]      = useState('')
  const [generating,   setGenerating]   = useState(false)
  const [editingNeeds, setEditingNeeds] = useState({})

  const students = Object.values(studentAccommodations)

  async function handleGenerateAdjustments() {
    if (students.length === 0) return
    setGenerating(true)
    try {
      const result = await generateLessonAccommodations({
        topic:    lessonTopic,
        subject:  lessonSubject,
        grade:    lessonGrade,
        students: students.map(s => ({
          name:              s.name,
          accommodationType: s.accommodationType,
          specificNeeds:     s.specificNeeds,
        })),
      })
      if (result?.adjustments?.length > 0) {
        setLessonAdjustments(result.adjustments)
      }
    } catch (err) {
      console.error('Failed to generate adjustments:', err)
    }
    setGenerating(false)
  }

  function handleAddStudent() {
    const name = newName.trim()
    if (!name) return
    addAccommodation(name)
    setNewName('')
    setOpen(true)
  }

  function handleNeedsSave(studentName) {
    const draft = editingNeeds[studentName]
    if (draft === undefined) return
    const needs = draft.split(',').map(s => s.trim()).filter(Boolean)
    updateAccommodation(studentName, { specificNeeds: needs })
    setEditingNeeds(prev => { const n = {...prev}; delete n[studentName]; return n })
  }

  const count = students.length

  return (
    <div style={{ marginBottom:16 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:12, padding:'11px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', marginBottom: open ? 8 : 0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:16 }}>♿</span>
          <span style={{ fontSize:13, fontWeight:700, color:C.text }}>Accommodations</span>
          {count > 0 && (
            <span style={{ background:C.purple+'22', color:C.purple, borderRadius:999, padding:'2px 8px', fontSize:10, fontWeight:700 }}>
              {count} student{count !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <span style={{ color:C.muted, fontSize:13, fontWeight:700 }}>{open ? '▲ Hide' : '▼ Show'}</span>
      </button>

      {open && (
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'14px' }}>

          {count === 0 && (
            <div style={{ textAlign:'center', padding:'16px 0', color:C.muted, fontSize:12 }}>
              No accommodations recorded yet. Add students below or upload a roster to auto-extract.
            </div>
          )}

          {students.map(s => {
            const typeColor = ACCOM_TYPE_COLORS[s.accommodationType] || C.amber
            const needsDraft = editingNeeds[s.name]
            const isEditingNeeds = needsDraft !== undefined

            return (
              <div key={s.name} style={{ background:C.inner, border:'1px solid '+typeColor+'25', borderRadius:12, padding:'12px 14px', marginBottom:10 }}>

                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.text, flex:1 }}>{s.name}</div>

                  <div style={{ display:'flex', gap:4 }}>
                    {ACCOM_TYPES.map(type => (
                      <button key={type} onClick={() => updateAccommodation(s.name, { accommodationType: type })}
                        style={{ padding:'2px 8px', borderRadius:999, border:'none', cursor:'pointer', fontSize:9, fontWeight:700,
                          background: s.accommodationType === type ? ACCOM_TYPE_COLORS[type]+'30' : C.inner,
                          color:      s.accommodationType === type ? ACCOM_TYPE_COLORS[type] : C.muted,
                          outline:    s.accommodationType === type ? '1px solid '+ACCOM_TYPE_COLORS[type] : 'none' }}>
                        {type}
                      </button>
                    ))}
                  </div>

                  <button onClick={() => removeAccommodation(s.name)}
                    style={{ background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:16, padding:'0 2px', lineHeight:1 }}>×</button>
                </div>

                <div style={{ marginBottom: s.lessonAdjustments?.length > 0 ? 10 : 0 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Specific Needs</div>
                  {isEditingNeeds ? (
                    <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                      <input
                        value={needsDraft}
                        onChange={e => setEditingNeeds(prev => ({ ...prev, [s.name]: e.target.value }))}
                        onBlur={() => handleNeedsSave(s.name)}
                        onKeyDown={e => e.key === 'Enter' && handleNeedsSave(s.name)}
                        placeholder="Extended time, Preferential seating..."
                        autoFocus
                        style={{ flex:1, background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:'6px 10px', color:C.text, fontSize:12, outline:'none' }}
                      />
                      <button onClick={() => handleNeedsSave(s.name)}
                        style={{ background:C.green+'20', color:C.green, border:'none', borderRadius:8, padding:'6px 10px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                        Save
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => setEditingNeeds(prev => ({ ...prev, [s.name]: (s.specificNeeds || []).join(', ') }))}
                      style={{ cursor:'text', minHeight:28, display:'flex', flexWrap:'wrap', gap:5, alignItems:'center' }}>
                      {(s.specificNeeds || []).length > 0
                        ? s.specificNeeds.map((need, i) => (
                            <span key={i} style={{ background:typeColor+'18', color:typeColor, borderRadius:999, padding:'3px 9px', fontSize:10, fontWeight:600 }}>
                              {need}
                            </span>
                          ))
                        : <span style={{ fontSize:11, color:C.muted, fontStyle:'italic' }}>Tap to add needs...</span>
                      }
                      <span style={{ fontSize:10, color:C.muted, marginLeft:4 }}>✏</span>
                    </div>
                  )}
                </div>

                {s.lessonAdjustments?.length > 0 && (
                  <div>
                    <div style={{ fontSize:10, fontWeight:700, color:C.teal, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6, marginTop:10 }}>
                      ✨ Adjustments for This Lesson
                    </div>
                    {s.lessonAdjustments.map((adj, i) => (
                      <div key={i} style={{ background:C.teal+'10', border:'1px solid '+C.teal+'20', borderRadius:8, padding:'7px 10px', marginBottom:5, fontSize:12, color:C.text, lineHeight:1.5 }}>
                        {adj}
                      </div>
                    ))}
                  </div>
                )}

                {s.notes && (
                  <div style={{ marginTop:8, fontSize:11, color:C.muted, fontStyle:'italic' }}>{s.notes}</div>
                )}
              </div>
            )
          })}

          <div style={{ display:'flex', gap:8, marginBottom: count > 0 ? 12 : 4 }}>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddStudent()}
              placeholder="Add student by name..."
              style={{ flex:1, background:C.bg, border:`1px solid ${C.border}`, borderRadius:10, padding:'8px 12px', color:C.text, fontSize:12, outline:'none' }}
            />
            <button onClick={handleAddStudent} disabled={!newName.trim()}
              style={{ background:newName.trim()?C.blue+'22':'transparent', color:newName.trim()?C.blue:C.muted, border:'1px solid '+(newName.trim()?C.blue:C.border), borderRadius:10, padding:'8px 14px', fontSize:12, fontWeight:700, cursor:newName.trim()?'pointer':'not-allowed' }}>
              + Add
            </button>
          </div>

          {count > 0 && lessonTopic && (
            <button onClick={handleGenerateAdjustments} disabled={generating}
              style={{ width:'100%', background:generating?C.inner:C.purple+'20', color:generating?C.muted:C.purple, border:'1px solid '+(generating?C.border:C.purple+'40'), borderRadius:10, padding:'10px', fontSize:12, fontWeight:700, cursor:generating?'not-allowed':'pointer' }}>
              {generating ? '⟳ Generating adjustments...' : `✨ Generate lesson adjustments for ${count} student${count !== 1 ? 's' : ''}`}
            </button>
          )}

          {count > 0 && !lessonTopic && (
            <div style={{ fontSize:11, color:C.muted, textAlign:'center', padding:'4px 0' }}>
              Generate a lesson plan first to get AI adjustments for each student.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Lesson View ──────────────────────────────────────────────────────────────
function LessonView({ lesson, onBack, onEdit }) {
  const STATUS_COLOR = { done: C.green, tbd: C.amber, pending: C.teal }
  const STATUS_LABEL = { done: 'Done', tbd: 'TBD', pending: 'Pending' }
  const sc = STATUS_COLOR[lesson.status] || C.teal

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', padding:'20px 16px', paddingBottom:80 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <button onClick={onBack} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
        <button onClick={onEdit} style={{ background:'var(--school-color)', border:'none', borderRadius:10, padding:'8px 16px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:700 }}>Edit</button>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
        <span style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em' }}>{lesson.dayLabel}</span>
        <span style={{ fontSize:11, color:C.muted }}>·</span>
        <span style={{ fontSize:11, color:C.muted }}>{lesson.date}</span>
        <span style={{ marginLeft:'auto', background:`${sc}22`, color:sc, borderRadius:6, padding:'2px 8px', fontSize:11, fontWeight:700 }}>{STATUS_LABEL[lesson.status]}</span>
      </div>
      <h1 style={{ fontSize:18, fontWeight:800, margin:'0 0 4px' }}>{lesson.title}</h1>
      <p style={{ color:C.muted, fontSize:12, margin:'0 0 20px' }}>{lesson.duration}{lesson.pages ? ` · ${lesson.pages}` : ''}</p>

      <Section title="Objective" items={[lesson.objective]} />
      {lesson.warmup?.length > 0     && <Section title="Warm-Up"    items={lesson.warmup} />}
      {lesson.activities?.length > 0 && <Section title="Activities" items={lesson.activities} />}
      {lesson.materials?.length > 0  && <Section title="Materials"  items={lesson.materials} />}
      {lesson.homework               && <Section title="Homework"   items={[lesson.homework]} />}

      <AccommodationsSection
        lessonTopic={lesson.title}
        lessonSubject={lesson.subject || ''}
        lessonGrade={lesson.grade || ''}
      />
    </div>
  )
}

// ─── Section Wrapper with AI Assist ───────────────────────────────────────
function SectionWithAI({ title, children, onAIRefine, onAIGenerate, isGenerating }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}>
        <h2 style={{
          fontSize: 16,
          fontWeight: 700,
          color: C.text,
          margin: 0,
        }}>
          {title}
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {onAIGenerate && (
            <button
              onClick={() => onAIGenerate('generate')}
              disabled={isGenerating}
              style={{
                background: isGenerating ? C.muted : C.purple,
                color: 'white',
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: 11,
                fontWeight: 600,
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                opacity: isGenerating ? 0.6 : 1,
                transition: 'all 0.2s',
              }}
              title={`Generate ${title} from scratch`}
            >
              {isGenerating ? '⏳ Generating...' : '✨ Generate'}
            </button>
          )}
          {onAIRefine && (
            <button
              onClick={() => onAIRefine('refine')}
              disabled={isGenerating}
              style={{
                background: isGenerating ? C.muted : C.purple,
                color: 'white',
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: 11,
                fontWeight: 600,
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                opacity: isGenerating ? 0.6 : 1,
                transition: 'all 0.2s',
              }}
              title={`Refine ${title} using AI`}
            >
              {isGenerating ? '⏳ Refining...' : '✨ Refine'}
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

// ─── 1. LESSON HEADER ──────────────────────────────────────────────────────
function LessonHeaderSection({ data, onChange }) {
  return (
    <SectionWithAI title="Lesson Header">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
            Lesson Title *
          </label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => onChange('header', { ...data, title: e.target.value })}
            placeholder="e.g., Photosynthesis Basics"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 14,
              background: C.inner,
              color: C.text,
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
            Date *
          </label>
          <input
            type="date"
            value={data.date || ''}
            onChange={(e) => onChange('header', { ...data, date: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 14,
              background: C.inner,
              color: C.text,
              outline: 'none',
            }}
          />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
            Subject *
          </label>
          <input
            type="text"
            value={data.subject || ''}
            onChange={(e) => onChange('header', { ...data, subject: e.target.value })}
            placeholder="e.g., Biology, Mathematics, English"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 14,
              background: C.inner,
              color: C.text,
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
            Grade Level *
          </label>
          <select
            value={data.gradeLevel || ''}
            onChange={(e) => onChange('header', { ...data, gradeLevel: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 14,
              background: C.inner,
              color: C.text,
              outline: 'none',
            }}
          >
            <option value="">Select Grade Level</option>
            {['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>
    </SectionWithAI>
  )
}

// ─── 2. STANDARDS ──────────────────────────────────────────────────────────
function StandardsSection({ data, onChange, onAIGenerate, headerData }) {
  const { currentUser } = useStore()
  const [showPicker, setShowPicker] = React.useState(false)
  const [generating, setGenerating] = React.useState(false)

  const handleAIGenerate = async (mode) => {
    setGenerating(true)
    await onAIGenerate('standards', mode, data)
    setGenerating(false)
  }

  return (
    <SectionWithAI
      title="2. Standards"
      onAIGenerate={handleAIGenerate}
      isGenerating={generating}
    >
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
          Search TEKS / Common Core Standards
        </label>
        <button
          onClick={() => setShowPicker(!showPicker)}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: `1px solid ${C.blue}`,
            background: C.inner,
            color: C.blue,
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {showPicker ? '▲ Hide Picker' : '▼ Browse Standards'}
        </button>
      </div>

      {showPicker && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>
              Select Learning Standards
            </div>
            <button
              onClick={() => setShowPicker(false)}
              style={{
                background: 'none',
                border: `1px solid ${C.border}`,
                borderRadius: 4,
                padding: '4px 8px',
                fontSize: 10,
                color: C.muted,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = C.inner
                e.target.style.color = C.text
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'none'
                e.target.style.color = C.muted
              }}
            >
              Hide Picker
            </button>
          </div>
          <StandardsSelector
            subject={headerData?.subject}
            grade={headerData?.gradeLevel}
            selectedStandards={data || []}
            topic={headerData?.title}
            schoolName={currentUser?.schoolName}
            onChange={(standards) => {
              onChange('standards', standards)
            }}
          />
        </div>
      )}

      {data?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {data.map((std, i) => (
            <span
              key={i}
              style={{
                background: `${C.blue}20`,
                color: C.blue,
                border: `1px solid ${C.blue}40`,
                borderRadius: 6,
                padding: '4px 10px',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {typeof std === 'string' ? std : std.code}
            </span>
          ))}
        </div>
      )}
    </SectionWithAI>
  )
}

// ─── 3. OBJECTIVES ────────────────────────────────────────────────────────
function ObjectivesSection({ data, onChange, onAIGenerate }) {
  const [generating, setGenerating] = React.useState(false)

  const handleAIGenerate = async (mode) => {
    setGenerating(true)
    await onAIGenerate('objectives', mode, data)
    setGenerating(false)
  }

  return (
    <SectionWithAI
      title="3. Learning Objectives"
      onAIGenerate={handleAIGenerate}
      onAIRefine={handleAIGenerate}
      isGenerating={generating}
    >
      <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
        By the end of this lesson, students will be able to...
      </label>
      <textarea
        value={data.objectives || ''}
        onChange={(e) => onChange('objectives', e.target.value)}
        placeholder="e.g., - Identify the three main parts of a plant cell
- Explain how photosynthesis converts light to chemical energy
- Compare cellular respiration and photosynthesis"
        style={{
          width: '100%',
          padding: '12px 14px',
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          fontSize: 13,
          background: C.inner,
          color: C.text,
          outline: 'none',
          fontFamily: 'Inter, sans-serif',
          minHeight: 120,
          lineHeight: 1.5,
          pointerEvents: 'auto',
          userSelect: 'text',
        }}
      />
    </SectionWithAI>
  )
}

// ─── 4. CFS (Criteria for Success & Culturally Responsive Teaching) ──────────
function CFSSection({ data, onChange, onAIGenerate }) {
  const [generating, setGenerating] = React.useState(false)

  const handleAIGenerate = async (mode) => {
    setGenerating(true)
    await onAIGenerate('cfs', mode, data)
    setGenerating(false)
  }

  return (
    <SectionWithAI
      title="4. Success Criteria & Culturally Responsive Teaching"
      onAIGenerate={handleAIGenerate}
      onAIRefine={handleAIGenerate}
      isGenerating={generating}
    >
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
          Success Criteria: Students will demonstrate understanding by...
        </label>
        <textarea
          value={data.cfs?.successCriteria || ''}
          onChange={(e) => onChange('cfs', { ...data.cfs, successCriteria: e.target.value })}
          placeholder="e.g., - Correctly label plant cell structures on a diagram
- Write a 3-sentence explanation of photosynthesis
- Score 80% or higher on exit ticket"
          style={{
            width: '100%',
            padding: '12px 14px',
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            fontSize: 13,
            background: C.inner,
            color: C.text,
            outline: 'none',
            minHeight: 100,
            lineHeight: 1.5,
          }}
        />
      </div>

      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
          Culturally Responsive Notes (optional)
        </label>
        <textarea
          value={data.cfs?.culturalNotes || ''}
          onChange={(e) => onChange('cfs', { ...data.cfs, culturalNotes: e.target.value })}
          placeholder="e.g., Use examples from students' local ecosystems
- Incorporate diverse scientists' contributions
- Connect to real-world environmental justice issues"
          style={{
            width: '100%',
            padding: '12px 14px',
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            fontSize: 13,
            background: C.inner,
            color: C.text,
            outline: 'none',
            minHeight: 100,
            lineHeight: 1.5,
          }}
        />
      </div>
    </SectionWithAI>
  )
}

// ─── 5. LESSON STEPS (6 Substeps) ─────────────────────────────────────────
function LessonStepsSection({ data, onChange, onAIGenerate }) {
  const [generating, setGenerating] = React.useState(false)

  const handleAIGenerate = async (mode) => {
    setGenerating(true)
    await onAIGenerate('lessonSteps', mode, data)
    setGenerating(false)
  }

  const steps = [
    { key: 'warmUp', label: 'Warm-Up / Hook', hint: 'Activate prior knowledge & engage students' },
    { key: 'directInstruction', label: 'Direct Instruction', hint: 'Teacher-led instruction & modeling' },
    { key: 'guidedPractice', label: 'Guided Practice', hint: 'Students practice with teacher support' },
    { key: 'independentPractice', label: 'Independent Practice', hint: 'Students work independently' },
    { key: 'closure', label: 'Closure', hint: 'Summarize key concepts & connect to objectives' },
    { key: 'extension', label: 'Extension (if time)', hint: 'Enrichment or challenge activities' },
  ]

  return (
    <SectionWithAI
      title="5. Lesson Steps"
      onAIGenerate={handleAIGenerate}
      onAIRefine={handleAIGenerate}
      isGenerating={generating}
    >
      {steps.map((step, i) => (
        <div key={step.key} style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.teal, marginBottom: 4, display: 'block', textTransform: 'uppercase' }}>
            {i + 1}. {step.label}
          </label>
          <p style={{ fontSize: 11, color: C.muted, marginBottom: 8, margin: '4px 0 8px 0' }}>
            {step.hint}
          </p>
          <textarea
            value={data.lessonSteps?.[step.key] || ''}
            onChange={(e) => onChange('lessonSteps', { ...data.lessonSteps, [step.key]: e.target.value })}
            placeholder={`Describe ${step.label.toLowerCase()}...`}
            style={{
              width: '100%',
              padding: '12px 14px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 13,
              background: C.inner,
              color: C.text,
              outline: 'none',
              minHeight: 80,
              lineHeight: 1.5,
            }}
          />
          {i < steps.length - 1 && (
            <div style={{ height: 1, background: C.border, margin: '16px 0' }} />
          )}
        </div>
      ))}
    </SectionWithAI>
  )
}

// ─── 6. EXIT TICKET ───────────────────────────────────────────────────────
function ExitTicketSection({ data, onChange, onAIGenerate }) {
  const [generating, setGenerating] = React.useState(false)

  const handleAIGenerate = async (mode) => {
    setGenerating(true)
    await onAIGenerate('exitTicket', mode, data)
    setGenerating(false)
  }

  return (
    <SectionWithAI
      title="6. Exit Ticket"
      onAIGenerate={handleAIGenerate}
      onAIRefine={handleAIGenerate}
      isGenerating={generating}
    >
      <p style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>
        Quick formative assessment to check student understanding before leaving class.
      </p>
      <textarea
        value={data.exitTicket || ''}
        onChange={(e) => onChange('exitTicket', e.target.value)}
        placeholder="e.g., Question 1: In your own words, explain what photosynthesis is.
Question 2: Name one way photosynthesis differs from cellular respiration.
Question 3: Draw and label the parts of a plant cell involved in photosynthesis."
        style={{
          width: '100%',
          padding: '12px 14px',
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          fontSize: 13,
          background: C.inner,
          color: C.text,
          outline: 'none',
          minHeight: 120,
          lineHeight: 1.5,
        }}
      />
    </SectionWithAI>
  )
}

// ─── 7. HOMEWORK ──────────────────────────────────────────────────────────
function HomeworkSection({ data, onChange, onAIGenerate }) {
  const [generating, setGenerating] = React.useState(false)

  const handleAIGenerate = async (mode) => {
    setGenerating(true)
    await onAIGenerate('homework', mode, data)
    setGenerating(false)
  }

  return (
    <SectionWithAI
      title="7. Homework & Practice"
      onAIGenerate={handleAIGenerate}
      onAIRefine={handleAIGenerate}
      isGenerating={generating}
    >
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
          Assignment Description *
        </label>
        <textarea
          value={data.homework?.assignment || ''}
          onChange={(e) => onChange('homework', { ...data.homework, assignment: e.target.value })}
          placeholder="Describe the homework assignment..."
          style={{
            width: '100%',
            padding: '12px 14px',
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            fontSize: 13,
            background: C.inner,
            color: C.text,
            outline: 'none',
            minHeight: 100,
            lineHeight: 1.5,
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
            Due Date
          </label>
          <input
            type="date"
            value={data.homework?.dueDate || ''}
            onChange={(e) => onChange('homework', { ...data.homework, dueDate: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 14,
              background: C.inner,
              color: C.text,
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
            Max Points (optional)
          </label>
          <input
            type="number"
            value={data.homework?.maxPoints || ''}
            onChange={(e) => onChange('homework', { ...data.homework, maxPoints: e.target.value })}
            placeholder="e.g., 50"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 14,
              background: C.inner,
              color: C.text,
              outline: 'none',
            }}
          />
        </div>
      </div>
    </SectionWithAI>
  )
}

// ─── 8. ACCOMMODATIONS ────────────────────────────────────────────────────
function AccommodationsSection_Builtin({ data, onChange }) {
  const [open, setOpen] = React.useState(false)

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: C.inner,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: '12px 14px',
          cursor: 'pointer',
          color: C.text,
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        <span>♿ 8. Student Accommodations & Modifications</span>
        <span style={{ color: C.muted, fontSize: 13 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>
            Specify lesson-specific accommodations and modifications for students with IEPs, 504 plans, or ELL needs.
          </p>
          <textarea
            value={data.accommodations || ''}
            onChange={(e) => onChange('accommodations', e.target.value)}
            placeholder="e.g., - Provide visual aids for plant cell diagram
- Simplify vocabulary for ELL students
- Allow extended time for exit ticket
- Offer oral response option instead of written"
            style={{
              width: '100%',
              padding: '12px 14px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 13,
              background: C.inner,
              color: C.text,
              outline: 'none',
              minHeight: 120,
              lineHeight: 1.5,
            }}
          />
        </div>
      )}
    </div>
  )
}

// ─── 9. ATTACHMENTS ───────────────────────────────────────────────────────
function AttachmentsSection_Builtin({ data, onChange }) {
  const [open, setOpen] = React.useState(false)

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: C.inner,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: '12px 14px',
          cursor: 'pointer',
          color: C.text,
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        <span>📎 9. Attachments & Resources</span>
        <span style={{ color: C.muted, fontSize: 13 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>
            Worksheets, answer keys, rubrics, images, PDFs, or external links.
          </p>
          <div style={{
            border: `2px dashed ${C.border}`,
            borderRadius: 8,
            padding: 20,
            textAlign: 'center',
            background: C.inner,
            cursor: 'pointer',
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📤</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>
              Tap to upload files
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>
              PDF, Word, Image, or any file type
            </div>
          </div>

          {data.attachments && data.attachments.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 8, textTransform: 'uppercase' }}>
                Attached Files ({data.attachments.length})
              </div>
              {data.attachments.map((file, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: C.inner,
                    borderRadius: 6,
                    marginBottom: 6,
                    fontSize: 13,
                  }}
                >
                  <span>📄 {file.name || `File ${i + 1}`}</span>
                  <button
                    onClick={() => {
                      const updated = data.attachments.filter((_, idx) => idx !== i)
                      onChange('attachments', updated)
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: C.red,
                      cursor: 'pointer',
                      fontSize: 16,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── 10. OPTIONAL ADD-ONS ─────────────────────────────────────────────────
function OptionalAddOnsSection({ data, onChange }) {
  const [open, setOpen] = React.useState(false)

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: C.inner,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: '12px 14px',
          cursor: 'pointer',
          color: C.text,
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        <span>⭐ 10. Optional Add-Ons</span>
        <span style={{ color: C.muted, fontSize: 13 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
              Enrichment Activities (for early finishers)
            </label>
            <textarea
              value={data.optionalAddOns?.enrichment || ''}
              onChange={(e) => onChange('optionalAddOns', { ...data.optionalAddOns, enrichment: e.target.value })}
              placeholder="e.g., - Research photosynthesis in different plant types
- Create a photosynthesis comic strip
- Design an experiment to test light requirements"
              style={{
                width: '100%',
                padding: '12px 14px',
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                fontSize: 13,
                background: C.inner,
                color: C.text,
                outline: 'none',
                minHeight: 100,
                lineHeight: 1.5,
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
              Supplemental Resources & Links
            </label>
            <textarea
              value={data.optionalAddOns?.supplementalLinks || ''}
              onChange={(e) => onChange('optionalAddOns', { ...data.optionalAddOns, supplementalLinks: e.target.value })}
              placeholder="e.g., - Khan Academy: Plant Cells (https://...)
- National Geographic: Photosynthesis Explainer
- YouTube: Amoeba Sisters Photosynthesis Video"
              style={{
                width: '100%',
                padding: '12px 14px',
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                fontSize: 13,
                background: C.inner,
                color: C.text,
                outline: 'none',
                minHeight: 100,
                lineHeight: 1.5,
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
              Notes & Reflections
            </label>
            <textarea
              value={data.optionalAddOns?.reflections || ''}
              onChange={(e) => onChange('optionalAddOns', { ...data.optionalAddOns, reflections: e.target.value })}
              placeholder="e.g., - Pacing notes
- Student misconceptions to watch for
- What went well / what to improve next time"
              style={{
                width: '100%',
                padding: '12px 14px',
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                fontSize: 13,
                background: C.inner,
                color: C.text,
                outline: 'none',
                minHeight: 100,
                lineHeight: 1.5,
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── BuildFromScratch Component ────────────────────────────────────────────
function BuildFromScratch({ onBack, initialLesson }) {
  const { currentUser } = useStore()
  
  const [lessonData, setLessonData] = React.useState({
    header: { title: '', date: '', subject: '', gradeLevel: '' },
    standards: [],
    objectives: '',
    cfs: { successCriteria: '', culturalNotes: '' },
    lessonSteps: {
      warmUp: '',
      directInstruction: '',
      guidedPractice: '',
      independentPractice: '',
      closure: '',
      extension: '',
    },
    exitTicket: '',
    homework: { assignment: '', dueDate: '', maxPoints: '' },
    accommodations: '',
    attachments: [],
    optionalAddOns: { enrichment: '', supplementalLinks: '', reflections: '' },
  })

  const [saving, setSaving] = React.useState(false)

  useEffect(() => {
    if (currentUser && !lessonData.header.subject && !lessonData.header.gradeLevel) {
      const gradeMatch = currentUser.gradeLevel?.match(/(\d+)/);
      const gradeNum = gradeMatch ? gradeMatch[1] : '';
      const subject = Array.isArray(currentUser.subjects) 
        ? currentUser.subjects[0] 
        : currentUser.subjects || '';

      const params = new URLSearchParams(window.location.search)
      const selectedDate = params.get('date')

      setLessonData(prev => ({
        ...prev,
        header: {
          ...prev.header,
          subject: subject,
          gradeLevel: gradeNum || prev.header.gradeLevel,
          date: selectedDate || prev.header.date,
        }
      }))
    }
  }, [currentUser, lessonData.header.subject, lessonData.header.gradeLevel])

  useEffect(() => {
    if (initialLesson) {
      console.log('Pre-populating lesson data from:', initialLesson)
      setLessonData(prev =>({
        ...prev,
        header: {
          ...prev.header,
          title: initialLesson.title || prev.header.title,
          date: initialLesson.lesson_date || initialLesson.date || prev.header.date,
          subject: initialLesson.subject || prev.header.subject,
          gradeLevel: initialLesson.grade_level || prev.header.gradeLevel,
        },
        standards: initialLesson.standards || prev.standards,
        objectives: initialLesson.objectives || prev.objectives,
        cfs: {
          ...prev.cfs,
          successCriteria: initialLesson.criteria_for_success || prev.cfs.successCriteria,
          culturalNotes: initialLesson.cultural_notes || prev.cfs.culturalNotes,
        },
        lessonSteps: {
          ...prev.lessonSteps,
          warmUp: initialLesson.warm_up || prev.lessonSteps.warmUp,
          directInstruction: initialLesson.direct_instruction || prev.lessonSteps.directInstruction,
          guidedPractice: initialLesson.guided_practice || prev.lessonSteps.guidedPractice,
          independentPractice: initialLesson.independent_practice || prev.lessonSteps.independentPractice,
          closure: initialLesson.closure || prev.lessonSteps.closure,
          extension: initialLesson.enrichment_activities || prev.lessonSteps.extension,
        },
        exitTicket: initialLesson.exit_ticket || prev.exitTicket,
        homework: {
          ...prev.homework,
          assignment: initialLesson.homework_assignment || prev.homework.assignment,
          dueDate: initialLesson.homework_due_date || prev.homework.dueDate,
          maxPoints: initialLesson.homework_max_points || prev.homework.maxPoints,
        },
        accommodations: initialLesson.accommodations_notes || prev.accommodations,
        optionalAddOns: {
          ...prev.optionalAddOns,
          enrichment: initialLesson.enrichment_activities || prev.optionalAddOns.enrichment,
          supplementalLinks: initialLesson.supplemental_links || prev.optionalAddOns.supplementalLinks,
          reflections: initialLesson.teacher_reflections || prev.optionalAddOns.reflections,
        },
      }))
    }
  }, [initialLesson])

  function handleSectionChange(section, value) {
    setLessonData(prev => ({
      ...prev,
      [section]: value,
    }))
  }

  async function handleAIAssist(section, mode, sectionData) {
    console.log(`AI ${mode} for ${section}:`, sectionData)
    // TODO: Call /api/ai with intent "lesson-plan-section"
  }

  async function handleSave() {
    setSaving(true)
    try {
      const { currentUser } = useStore.getState()
      
      const headers = { 'Content-Type': 'application/json' }
      
      if (currentUser) {
        if (currentUser.id?.startsWith('demo-')) {
          headers.Authorization = 'Bearer demo-token'
        } else {
          headers.Authorization = `Bearer ${currentUser.id}`
        }
      }
      
      const response = await fetch('/api/lesson-plan', {
        method: 'POST',
        headers,
        body: JSON.stringify(lessonData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Save failed')
      }
      
      const result = await response.json()
      alert('Lesson plan saved!')
      onBack()
    } catch (err) {
      console.error('Save error:', err)
      alert(`Failed to save: ${err.message}`)
    }
    setSaving(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      color: C.text,
      fontFamily: 'Inter, Arial, sans-serif',
      paddingBottom: 100,
    }}>
      <div style={{
        background: C.card,
        borderBottom: `1px solid ${C.border}`,
        padding: '16px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1200, margin: '0 auto' }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: 0 }}>
              📝 Build Lesson Plan
            </h1>
            <p style={{ fontSize: 12, color: C.muted, margin: '4px 0 0 0' }}>
              Create comprehensive lesson plan
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onBack}
              style={{
                background: C.inner,
                color: C.text,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: C.blue,
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 12,
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? 'Saving...' : 'Save Lesson Plan'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px', maxWidth: 1000, margin: '0 auto' }}>
        <LessonHeaderSection data={lessonData.header} onChange={handleSectionChange} />
        <StandardsSection data={lessonData.standards} onChange={handleSectionChange} onAIGenerate={handleAIAssist} headerData={lessonData.header} />
        <ObjectivesSection data={lessonData} onChange={handleSectionChange} onAIGenerate={handleAIAssist} />
        <CFSSection data={lessonData} onChange={handleSectionChange} onAIGenerate={handleAIAssist} />
        <LessonStepsSection data={lessonData} onChange={handleSectionChange} onAIGenerate={handleAIAssist} />
        <ExitTicketSection data={lessonData} onChange={handleSectionChange} onAIGenerate={handleAIAssist} />
        <HomeworkSection data={lessonData} onChange={handleSectionChange} onAIGenerate={handleAIAssist} />
        <AccommodationsSection_Builtin data={lessonData} onChange={handleSectionChange} />
        <AttachmentsSection_Builtin data={lessonData} onChange={handleSectionChange} />
        <OptionalAddOnsSection data={lessonData} onChange={handleSectionChange} />
      </div>
    </div>
  )
}

function UploadDoc({ onBack }) {
  const { setAccommodations } = useStore()
  const fileRef = useRef()
  const [file,           setFile]           = useState(null)
  const [loading,        setLoading]        = useState(false)
  const [extracting,     setExtracting]     = useState(false)
  const [done,           setDone]           = useState(false)
  const [extractResult,  setExtractResult]  = useState(null)
  const [extractError,   setExtractError]   = useState('')

  async function handleFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setLoading(true)
    setExtractError('')
    setExtractResult(null)

    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    setDone(true)

    setExtracting(true)
    try {
      const reader = new FileReader()
      reader.onload = async (ev) => {
        try {
          const dataUrl   = ev.target.result
          const base64    = dataUrl.split(',')[1]
          const mediaType = f.type || 'image/jpeg'

          const isText = f.type.includes('text') || f.name.endsWith('.csv') || f.name.endsWith('.txt')

          let result
          if (isText) {
            const textContent = atob(base64)
            result = await extractAccommodations({ textContent })
          } else {
            result = await extractAccommodations({ imageBase64: base64, mediaType })
          }

          if (result?.noAccommodationsFound || !result?.students?.length) {
            setExtractResult({ count: 0, noAccommodationsFound: true })
          } else {
            setAccommodations(result.students)
            setExtractResult({ count: result.students.length })
          }
        } catch (err) {
          setExtractError('Could not extract accommodation data. You can add it manually in any lesson plan.')
        }
        setExtracting(false)
      }
      reader.readAsDataURL(f)
    } catch (err) {
      setExtractError('Could not read file for accommodation extraction.')
      setExtracting(false)
    }
  }

  if (loading) return <LoadingSpinner label="Reading your document..." />

  if (done) return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', padding:'20px 16px' }}>
      <button onClick={onBack} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:20 }}>← Back</button>

      <div style={{ background:'#0f2a1a', border:`1px solid ${C.green}40`, borderRadius:14, padding:'14px 16px', marginBottom:16, display:'flex', alignItems:'center', gap:12 }}>
        <span style={{ fontSize:24 }}>📄</span>
        <div>
          <div style={{ fontWeight:700, fontSize:13, color:C.text }}>{file?.name}</div>
          <div style={{ color:C.green, fontSize:11 }}>✓ Uploaded successfully</div>
        </div>
      </div>

      {extracting && (
        <div style={{ background:`${C.purple}12`, border:`1px solid ${C.purple}30`, borderRadius:12, padding:'12px 14px', marginBottom:14, fontSize:12, color:C.purple }}>
          ✨ Scanning for student accommodations...
        </div>
      )}

      {!extracting && extractResult && extractResult.count > 0 && (
        <div style={{ background:`${C.purple}12`, border:`1px solid ${C.purple}30`, borderRadius:12, padding:'12px 14px', marginBottom:14 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.purple, marginBottom:4 }}>
            ✨ Found {extractResult.count} student{extractResult.count !== 1 ? 's' : ''} with accommodations
          </div>
          <div style={{ fontSize:11, color:C.muted }}>
            Accommodation data has been loaded. Open any lesson plan to review, edit, and get AI-suggested adjustments.
          </div>
        </div>
      )}

      {!extracting && extractResult?.noAccommodationsFound && (
        <div style={{ background:`${C.amber}10`, border:`1px solid ${C.amber}25`, borderRadius:12, padding:'12px 14px', marginBottom:14 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.amber, marginBottom:4 }}>No accommodation data found</div>
          <div style={{ fontSize:11, color:C.muted }}>
            The document doesn't appear to contain accommodation indicators (IEP, 504, ELL). You can add students and their needs manually in any lesson plan.
          </div>
        </div>
      )}

      {!extracting && extractError && (
        <div style={{ background:`${C.red}10`, border:`1px solid ${C.red}25`, borderRadius:12, padding:'12px 14px', marginBottom:14, fontSize:12, color:C.red }}>
          {extractError}
        </div>
      )}

      <p style={{ color:C.muted, fontSize:13, marginBottom:20 }}>Your document has been imported and is ready to use.</p>

      <button onClick={onBack} style={{ background:'var(--school-color)', border:'none', borderRadius:999, padding:'12px 24px', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' }}>
        Go to Lesson Plans
      </button>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', padding:'20px 16px' }}>
      <button onClick={onBack} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:20 }}>← Back</button>
      <h1 style={{ fontSize:18, fontWeight:800, margin:'0 0 6px' }}>📄 Upload Lesson Plan / Roster</h1>
      <p style={{ color:C.muted, fontSize:13, marginBottom:8 }}>PDF · Word · CSV · Excel · Google Doc · Any format</p>
      <p style={{ color:C.purple, fontSize:12, fontWeight:600, marginBottom:20 }}>
        ✨ GradeFlow will automatically scan for student accommodations (IEP, 504, ELL) and load them into your lesson plans.
      </p>
      <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,image/*" onChange={handleFile} style={{ display:'none' }} />
      <button onClick={() => fileRef.current?.click()}
        style={{ width:'100%', background:C.card, border:`2px dashed ${C.border}`, borderRadius:18, padding:'40px 20px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
        <span style={{ fontSize:48 }}>📤</span>
        <span style={{ fontSize:15, fontWeight:700, color:C.text }}>Tap to choose file</span>
        <span style={{ fontSize:12, color:C.muted }}>PDF · Word · CSV · Excel · Google Doc · Image</span>
      </button>
    </div>
  )
}

// ─── Main Menu ────────────────────────────────────────────────────────────────
export default function LessonPlan({ initialMode, classId, onBack }) {
  const store = useStore()
  const { teacher, activeScreen, activeLessonClassId } = store
  const routerNav = useNavigate()
  
  const navigate = useNavigate()
  const { goBack, getTodayLesson } = useStore()
  const handleBack  = onBack || goBack
  const todayLesson = classId ? getTodayLesson(classId) : null
  
  const params = new URLSearchParams(window.location.search)
  const urlMode = params.get('mode')
  const urlLessonId = params.get('lessonId')
  
  const startMode   = urlMode || (initialMode === 'view' && todayLesson ? 'view' : (initialMode && initialMode !== 'view' ? initialMode : 'menu'))
  const [mode, setMode] = useState(startMode)
  const [allLessons, setAllLessons] = useState([])
  const [savedLessons, setSavedLessons] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [loadingLessons, setLoadingLessons] = useState(false)
  const [showLessonViewModal, setShowLessonViewModal] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState(null)
  
  const LESSONS_PER_PAGE = 5

  // Auto-flip to current week page when allLessons loads
  useEffect(() => {
    if (allLessons.length === 0) return

    console.log('Auto-flip effect: allLessons length:', allLessons.length)

    // Get today's date at midnight
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Calculate start of current week (Sunday at midnight)
    const currentDay = today.getDay()
    const daysToSunday = currentDay === 0 ? 0 : currentDay

    const currentWeekStart = new Date(today)
    currentWeekStart.setDate(today.getDate() - daysToSunday)

    // Calculate end of current week (Saturday at 23:59:59)
    const currentWeekEnd = new Date(currentWeekStart)
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6)
    currentWeekEnd.setHours(23, 59, 59, 999)

    console.log('Week range:', currentWeekStart.toDateString(), 'to', currentWeekEnd.toDateString())

    // Find the first current-week lesson index
    let currentWeekStartIndex = -1

    for (let i = 0; i < allLessons.length; i++) {
      const lesson = allLessons[i]
      if (!lesson || !lesson.lesson_date) continue

      let lessonDate
      try {
        lessonDate = new Date(lesson.lesson_date)
        lessonDate.setHours(0, 0, 0, 0)
      } catch (err) {
        console.warn('Could not parse lesson date:', lesson.lesson_date)
        continue
      }

      if (lessonDate >= currentWeekStart && lessonDate <= currentWeekEnd) {
        currentWeekStartIndex = i
        console.log('Found current week lesson at index', i, ':', lesson.title, lessonDate.toDateString())
        break
      }
    }

    // Calculate target page
    let targetPage = 0
    if (currentWeekStartIndex >= 0) {
      targetPage = Math.floor(currentWeekStartIndex / LESSONS_PER_PAGE)
      console.log('Auto-flipping to page', targetPage)
    } else {
      console.log('No lessons found in current week, starting at page 0')
      targetPage = 0
    }

    // Load and display the target page
    const paginatedLessons = allLessons.slice(
      targetPage * LESSONS_PER_PAGE,
      (targetPage + 1) * LESSONS_PER_PAGE
    )

    setSavedLessons(paginatedLessons)
    setCurrentPage(targetPage)

    console.log('Loaded page', targetPage, 'with', paginatedLessons.length, 'lessons')
  }, [allLessons])

  useEffect(() => {
    async function fetchSavedLessons() {
      setLoadingLessons(true)
      try {
        console.log('Frontend Debug - Using direct Supabase query (API bypassed)')
        await fetchDirectSupabaseLessons()
      } catch (err) {
        console.error('Error fetching saved lessons:', err)
      }
      setLoadingLessons(false)
    }
    fetchSavedLessons()
  }, [])

  async function fetchDirectSupabaseLessons() {
    try {
      const { currentUser } = useStore.getState()
      console.log('Frontend Debug - Starting direct Supabase query for user:', currentUser)

      if (!currentUser) {
        console.log('Frontend Debug - No current user found')
        setSavedLessons([])
        return
      }
      
      if (!supabase) {
        console.log('Frontend Debug - Supabase client not available')
        setSavedLessons([])
        return
      }

      console.log('Frontend Debug - Testing Supabase connection...')
      try {
        const { data: testData, error: testError } = await supabase
          .from('teachers')
          .select('count')
          .limit(1)
        
        if (testError) {
          console.log('Frontend Debug - Supabase connection test failed:', testError)
          setSavedLessons([])
          return
        } else {
          console.log('Frontend Debug - Supabase connection test passed')
        }
      } catch (testErr) {
        console.log('Frontend Debug - Supabase connection test exception:', testErr)
        setSavedLessons([])
        return
      }

      let teacherData = null
      let teacherError = null

      console.log('Frontend Debug - Looking up teacher for legacy_id:', currentUser.id)
      
      const { data: legacyData, error: legacyError } = await supabase
        .from('teachers')
        .select('id, legacy_id, email')
        .eq('legacy_id', currentUser.id)
        .single()

      console.log('Frontend Debug - Legacy lookup result:', { data: legacyData, error: legacyError })

      if (legacyData) {
        teacherData = legacyData
        console.log('Frontend Debug - Found teacher via legacy_id:', legacyData.id)
      } else {
        console.log('Frontend Debug - Legacy lookup failed, trying direct UUID match...')
        const { data: idData, error: idError } = await supabase
          .from('teachers')
          .select('id, legacy_id, email')
          .eq('id', currentUser.id)
          .single()

        console.log('Frontend Debug - Direct UUID lookup result:', { data: idData, error: idError })

        if (idData) {
          teacherData = idData
          console.log('Frontend Debug - Found teacher via direct UUID:', idData.id)
        } else {
          console.log('Frontend Debug - Both lookups failed, trying email match...')
          const { data: emailData, error: emailError } = await supabase
            .from('teachers')
            .select('id, legacy_id, email')
            .eq('email', currentUser.email)
            .single()

          console.log('Frontend Debug - Email lookup result:', { data: emailData, error: emailError })

          if (emailData) {
            teacherData = emailData
            console.log('Frontend Debug - Found teacher via email:', emailData.id)
          } else {
            teacherError = idError || legacyError || emailError
            console.log('Frontend Debug - All teacher lookups failed:', teacherError)
          }
        }
      }

      if (teacherError) {
        console.error('Frontend Debug - Teacher lookup failed:', teacherError)
        setSavedLessons([])
        return
      }

      const teacherId = teacherData.id
      console.log('Frontend Debug - Resolved teacher ID:', teacherId)

      let data, error
      
      const uuidResult = await supabase
        .from('lessons')
        .select(`
          id,
          class_id,
          lesson_date,
          title,
          duration,
          subject,
          warm_up,
          direct_instruction,
          guided_practice,
          independent_practice,
          closure,
          exit_ticket,
          criteria_for_success,
          objectives,
          cultural_notes,
          homework_assignment,
          accommodations_notes,
          enrichment_activities,
          supplemental_links,
          teacher_reflections,
          classes(id, subject, period, color)
        `)
        .eq('teacher_id', teacherId)
        .order('lesson_date', { ascending: true })
      
      if (uuidResult.data && uuidResult.data.length > 0) {
        console.log('Frontend Debug - Found lessons with UUID teacher_id')
        data = uuidResult.data
        error = uuidResult.error
      } else {
        console.log('Frontend Debug - No lessons with UUID, trying legacy ID:', currentUser.id)
        
        const legacyResult = await supabase
          .from('lessons')
          .select(`
            id,
            class_id,
            lesson_date,
            title,
            duration,
            subject,
            warm_up,
            direct_instruction,
            guided_practice,
            independent_practice,
            closure,
            exit_ticket,
            criteria_for_success,
            objectives,
            cultural_notes,
            homework_assignment,
            accommodations_notes,
            enrichment_activities,
            supplemental_links,
            teacher_reflections,
            classes(id, subject, period, color)
          `)
          .eq('teacher_id', currentUser.id)
          .order('lesson_date', { ascending: true })
        
        data = legacyResult.data
        error = legacyResult.error
        
        if (data && data.length > 0) {
          console.log('Frontend Debug - Found lessons with legacy teacher_id')
        }
      }

      if (error) {
        console.error('Frontend Debug - Direct query error:', error)
        setSavedLessons([])
        return
      }

      console.log('Frontend Debug - Direct Supabase query returned:', data?.length || 0, 'lessons')

      const filteredLessons = (data || []).filter(lesson => {
        const isTestLesson = 
          lesson.title?.includes('Sample') ||
          lesson.title?.includes('Test') ||
          lesson.id?.startsWith('demo-') ||
          lesson.title?.includes('Lesson Plan') ||
          !lesson.lesson_date ||
          lesson.lesson_date?.includes('2024')
          
        return !isTestLesson
      })
      
      console.log('Frontend Debug - Filtered lessons:', filteredLessons.length, 'real lessons')

      const sortedLessons = [...filteredLessons].sort((a, b) => {
        try {
          const dateA = new Date(a.lesson_date)
          const dateB = new Date(b.lesson_date)
          return dateA - dateB
        } catch (err) {
          console.warn('Frontend Debug - Error sorting lessons:', err)
          return 0
        }
      })

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const currentDay = today.getDay()
      const daysToSunday = currentDay === 0 ? 0 : currentDay
      
      const currentWeekStart = new Date(today)
      currentWeekStart.setDate(today.getDate() - daysToSunday)
      
      const currentWeekEnd = new Date(currentWeekStart)
      currentWeekEnd.setDate(currentWeekStart.getDate() + 6)
      currentWeekEnd.setHours(23, 59, 59, 999)
      
      console.log('Frontend Debug - Today:', today.toDateString())
      console.log('Frontend Debug - Current week start:', currentWeekStart.toDateString())
      console.log('Frontend Debug - Current week end:', currentWeekEnd.toDateString())
      
      let currentWeekStartIndex = -1
      
      try {
        sortedLessons.forEach((lesson, index) => {
          if (lesson && lesson.lesson_date) {
            let lessonDate
            try {
              lessonDate = new Date(lesson.lesson_date)
              
              if (isNaN(lessonDate.getTime())) {
                console.warn('Frontend Debug - Invalid lesson date:', lesson.lesson_date)
                return
              }
              
              if (index < 3) {
                console.log(`Frontend Debug - Lesson ${index}: ${lesson.title} on ${lessonDate.toDateString()}`)
              }
              
              if (lessonDate >= currentWeekStart && lessonDate <= currentWeekEnd) {
                if (currentWeekStartIndex === -1) {
                  currentWeekStartIndex = index
                  console.log('Frontend Debug - Found first current week lesson:', lesson.title)
                }
              }
            } catch (dateErr) {
              console.warn('Frontend Debug - Error parsing lesson date:', dateErr)
            }
          }
        })
      } catch (err) {
        console.error('Frontend Debug - Error finding current week lessons:', err)
        currentWeekStartIndex = -1
      }
      
      console.log('Frontend Debug - Current week start index:', currentWeekStartIndex)
      
      setAllLessons(sortedLessons)
      
      let targetPage = 0
      if (currentWeekStartIndex >= 0) {
        targetPage = Math.floor(currentWeekStartIndex / LESSONS_PER_PAGE)
      }
      
      const paginatedLessons = sortedLessons.slice(
        targetPage * LESSONS_PER_PAGE, 
        (targetPage + 1) * LESSONS_PER_PAGE
      )
      
      console.log('Frontend Debug - Showing page', targetPage, 'with', paginatedLessons.length, 'lessons')
      setSavedLessons(paginatedLessons)
      setCurrentPage(targetPage)

    } catch (error) {
      console.error('Frontend Debug - Direct query exception:', error)
      setSavedLessons([])
    }
  }

  useEffect(() => {
    if (urlMode && urlMode !== mode) {
      setMode(urlMode)
    }
  }, [urlMode, mode])

  if (mode === 'edit' && urlLessonId) {
    const [apiLesson, setApiLesson] = useState(null)
    const [loadingApi, setLoadingApi] = useState(true)
    
    useEffect(() => {
      const fetchLesson = async () => {
        try {
          const headers = {
            'Content-Type': 'application/json',
            'Authorization': store.currentUser?.email?.includes('@demo') 
              ? 'Bearer demo-token' 
              : `Bearer ${store.currentUser?.id}`
          }
          
          const response = await fetch(`/api/lesson-plan?lessonId=${urlLessonId}`, { 
            method: 'GET', 
            headers 
          })
          
          if (response.ok) {
            const result = await response.json()
            const lesson = result.lessons?.[0] || result.lesson
            if (lesson) {
              setApiLesson(lesson)
            }
          }
        } catch (error) {
          console.error('Error fetching lesson:', error)
        } finally {
          setLoadingApi(false)
        }
      }
      
      fetchLesson()
    }, [urlLessonId])
    
    if (loadingApi) {
      return <LoadingSpinner label="Loading lesson..." />
    }
    
    if (apiLesson) {
      return <BuildFromScratch onBack={handleBack} initialLesson={apiLesson} />
    }
    
    const { lessons } = store
    let targetLesson = null
    
    for (const classId in lessons) {
      const classLessons = lessons[classId] || []
      const found = classLessons.find(l => l.id === urlLessonId)
      if (found) {
        targetLesson = found
        break
      }
    }
    
    if (targetLesson) {
      return <BuildFromScratch onBack={handleBack} initialLesson={targetLesson} />
    }
  }
  
  if (mode === 'view' && todayLesson) return <LessonView lesson={todayLesson} onBack={handleBack} onEdit={() => setMode('build')} />
  if (mode === 'ai')     return <AIPlanGenerator   onBack={() => setMode('menu')} />
  if (mode === 'upload') return <UploadDoc        onBack={() => setMode('menu')} />
  if (mode === 'build')  return <BuildFromScratch onBack={() => setMode('menu')} />

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', padding:'20px 16px', paddingBottom:80 }}>
      <button onClick={handleBack} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:20 }}>← Back</button>
      <h1 style={{ fontSize:22, fontWeight:800, margin:'0 0 4px' }}>Lesson Plans</h1>
      <p style={{ color:C.muted, fontSize:13, margin:'0 0 24px' }}>Create · Upload · AI-generate</p>

      <h2 style={{ fontSize:16, fontWeight:700, color:C.text, margin:'0 0 12px' }}>Create New Lesson</h2>
      {[
        { id:'ai',       icon:'✨', label:'AI Generate',       desc:'Fill in subject, grade, topic → full lesson plan',  color:C.purple },
        { id:'build',    icon:'📝', label:'Build from Scratch', desc:'Write your own lesson plan with guided sections',   color:C.blue   },
        { id:'upload',   icon:'📤', label:'Upload Document',   desc:'PDF · Word · CSV · Image — AI scans for accommodations', color:C.teal },
        { id:'calendar', icon:'📅', label:'Lesson Calendar',   desc:'Plan lessons by date with curriculum integration',   color:C.green },
      ].map(item => (
        <button key={item.id} onClick={() => {
          if (item.id === 'calendar') {
            navigate('/teacher/lessons/calendar')
          } else {
            setMode(item.id)
          }
        }}
          style={{ width:'100%', background:C.card, border:`1px solid ${item.color}22`, borderRadius:16, padding:16, textAlign:'left', cursor:'pointer', display:'flex', alignItems:'center', gap:14, marginBottom:12 }}
          onMouseEnter={e => e.currentTarget.style.borderColor=item.color}
          onMouseLeave={e => e.currentTarget.style.borderColor=`${item.color}22`}>
          <div style={{ width:48, height:48, borderRadius:12, background:`${item.color}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>{item.icon}</div>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:C.text, marginBottom:2 }}>{item.label}</div>
            <div style={{ fontSize:11, color:C.muted }}>{item.desc}</div>
          </div>
          <span style={{ marginLeft:'auto', color:C.muted, fontSize:18 }}>{'>'}</span>
        </button>
      ))}

      <div style={{ marginTop:32, marginBottom:24 }}>
        <h2 style={{ fontSize:16, fontWeight:700, color:C.text, margin:'0 0 8px' }}>📚 My Saved Lessons</h2>
        
        {loadingLessons ? (
          <div style={{ textAlign:'center', padding:'20px 0', color:C.muted, fontSize:13 }}>
            Loading your saved lessons...
          </div>
        ) : savedLessons.length === 0 ? (
          <div style={{ background:C.inner, border:`1px solid ${C.border}`, borderRadius:12, padding:'16px', textAlign:'center', color:C.muted, fontSize:13 }}>
            <div style={{ fontSize:24, marginBottom:8 }}>📝</div>
            <div>No saved lesson plans yet</div>
            <div style={{ fontSize:11, marginTop:4 }}>Create your first lesson plan above</div>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {savedLessons.map(lesson => (
              <div 
                key={lesson.id}
                style={{ 
                  background:C.card, 
                  border:`1px solid ${C.border}`, 
                  borderRadius:12, 
                  padding:16, 
                  cursor:'pointer',
                  display:'flex',
                  alignItems:'center',
                  gap:12
                }}
                onClick={() => {
                  setSelectedLesson(lesson)
                  setShowLessonViewModal(true)
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.blue}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
              >
                <div style={{ 
                  width:48, 
                  height:48, 
                  borderRadius:12, 
                  background:`${C.blue}22`, 
                  display:'flex', 
                  alignItems:'center', 
                  justifyContent:'center', 
                  fontSize:20, 
                  flexShrink:0 
                }}>
                  📝
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:C.text, marginBottom:4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                    {lesson.title}
                  </div>
                  <div style={{ fontSize:11, color:C.muted, display:'flex', gap:8, alignItems:'center' }}>
                    <span>{lesson.subject || 'No subject'}</span>
                    {lesson.grade_level && <span>·</span>}
                    <span>{lesson.grade_level}</span>
                    {lesson.lesson_date && <span>·</span>}
                    <span>{new Date(lesson.lesson_date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ 
                  background:lesson.status === 'published' ? `${C.green}22` : `${C.amber}22`,
                  color:lesson.status === 'published' ? C.green : C.amber,
                  borderRadius:6,
                  padding:'4px 8px',
                  fontSize:10,
                  fontWeight:600,
                  textTransform:'uppercase'
                }}>
                  {lesson.status || 'draft'}
                </div>
              </div>
            ))}
          </div>
        )}

        {allLessons.length > LESSONS_PER_PAGE && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: 8, 
            marginTop: 16,
            padding: '12px 0',
            borderTop: `1px solid ${C.border}`
          }}>
            <button
              onClick={() => {
                const newPage = Math.max(0, currentPage - 1)
                setCurrentPage(newPage)
                const start = newPage * LESSONS_PER_PAGE
                const end = start + LESSONS_PER_PAGE
                setSavedLessons(allLessons.slice(start, end))
              }}
              disabled={currentPage === 0}
              style={{
                background: currentPage === 0 ? C.inner : C.blue,
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                color: currentPage === 0 ? C.muted : 'white',
                fontSize: 12,
                cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 600
              }}
            >
              ← Prev
            </button>
            
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {(() => {
                const totalPages = Math.ceil(allLessons.length / LESSONS_PER_PAGE)
                const pages = []
                
                let startPage = Math.max(0, currentPage - 2)
                let endPage = Math.min(totalPages - 1, currentPage + 2)
                
                if (endPage - startPage < 4) {
                  if (startPage === 0) {
                    endPage = Math.min(4, totalPages - 1)
                  } else {
                    startPage = Math.max(0, endPage - 4)
                  }
                }
                
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentPage(i)
                        const start = i * LESSONS_PER_PAGE
                        const end = start + LESSONS_PER_PAGE
                        setSavedLessons(allLessons.slice(start, end))
                      }}
                      style={{
                        background: i === currentPage ? C.blue : C.inner,
                        border: 'none',
                        borderRadius: 4,
                        padding: '4px 8px',
                        color: i === currentPage ? 'white' : C.text,
                        fontSize: 11,
                        cursor: 'pointer',
                        fontWeight: i === currentPage ? 700 : 600,
                        minWidth: '24px'
                      }}
                    >
                      {i + 1}
                    </button>
                  )
                }
                
                return pages
              })()}
            </div>
            
            <button
              onClick={() => {
                const totalPages = Math.ceil(allLessons.length / LESSONS_PER_PAGE)
                const newPage = Math.min(totalPages - 1, currentPage + 1)
                setCurrentPage(newPage)
                const start = newPage * LESSONS_PER_PAGE
                const end = start + LESSONS_PER_PAGE
                setSavedLessons(allLessons.slice(start, end))
              }}
              disabled={currentPage >= Math.ceil(allLessons.length / LESSONS_PER_PAGE) - 1}
              style={{
                background: currentPage >= Math.ceil(allLessons.length / LESSONS_PER_PAGE) - 1 ? C.inner : C.blue,
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                color: currentPage >= Math.ceil(allLessons.length / LESSONS_PER_PAGE) - 1 ? C.muted : 'white',
                fontSize: 12,
                cursor: currentPage >= Math.ceil(allLessons.length / LESSONS_PER_PAGE) - 1 ? 'not-allowed' : 'pointer',
                fontWeight: 600
              }}
            >
              Next →
            </button>
          </div>
        )}

        <LessonViewModal
          lesson={selectedLesson}
          isOpen={showLessonViewModal}
          onClose={() => {
            setShowLessonViewModal(false)
            setSelectedLesson(null)
          }}
        />
      </div>
    </div>
  )
}

// ─── AI Plan Generator (STUB) ─────────────────────────────────────────────
function AIPlanGenerator({ onBack }) {
  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', padding:'20px 16px' }}>
      <button onClick={onBack} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:20 }}>← Back</button>
      <h1 style={{ fontSize:18, fontWeight:800, margin:'0 0 20px' }}>AI Lesson Plan Generator</h1>
      <p style={{ color:C.muted, fontSize:13 }}>Coming soon...</p>
    </div>
  )
}
