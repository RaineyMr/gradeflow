import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { generateLessonPlan, extractAccommodations, generateLessonAccommodations } from '../lib/ai'
import StandardsSelector from '../components/standards/StandardsSelector'

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
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
// Collapsible. Shows all students with accommodations.
// Every field is editable. Teacher can add students manually.
// lessonAdjustments are AI-generated per lesson.
function AccommodationsSection({ lessonTopic = '', lessonSubject = '', lessonGrade = '' }) {
  const { studentAccommodations, updateAccommodation, addAccommodation, removeAccommodation, setLessonAdjustments } = useStore()
  const [open,         setOpen]         = useState(false)
  const [newName,      setNewName]      = useState('')
  const [generating,   setGenerating]   = useState(false)
  const [editingNeeds, setEditingNeeds] = useState({}) // { studentName: string (comma-sep draft) }

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
      {/* Collapsible header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:12, padding:'11px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', marginBottom: open ? 8 : 0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:16 }}>♿</span>
          <span style={{ fontSize:13, fontWeight:700, color:C.text }}>Accommodations</span>
          {count > 0 && (
            <span style={{ background:`${C.purple}22`, color:C.purple, borderRadius:999, padding:'2px 8px', fontSize:10, fontWeight:700 }}>
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

          {/* Student rows */}
          {students.map(s => {
            const typeColor = ACCOM_TYPE_COLORS[s.accommodationType] || C.amber
            const needsDraft = editingNeeds[s.name]
            const isEditingNeeds = needsDraft !== undefined

            return (
              <div key={s.name} style={{ background:C.inner, border:`1px solid ${typeColor}25`, borderRadius:12, padding:'12px 14px', marginBottom:10 }}>

                {/* Student name + type badge + remove */}
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.text, flex:1 }}>{s.name}</div>

                  {/* Type selector */}
                  <div style={{ display:'flex', gap:4 }}>
                    {ACCOM_TYPES.map(type => (
                      <button key={type} onClick={() => updateAccommodation(s.name, { accommodationType: type })}
                        style={{ padding:'2px 8px', borderRadius:999, border:'none', cursor:'pointer', fontSize:9, fontWeight:700,
                          background: s.accommodationType === type ? `${ACCOM_TYPE_COLORS[type]}30` : C.raised,
                          color:      s.accommodationType === type ? ACCOM_TYPE_COLORS[type] : C.muted,
                          outline:    s.accommodationType === type ? `1px solid ${ACCOM_TYPE_COLORS[type]}` : 'none' }}>
                        {type}
                      </button>
                    ))}
                  </div>

                  <button onClick={() => removeAccommodation(s.name)}
                    style={{ background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:16, padding:'0 2px', lineHeight:1 }}>×</button>
                </div>

                {/* Specific needs — tap chips to edit as comma-separated */}
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
                        style={{ background:`${C.green}20`, color:C.green, border:'none', borderRadius:8, padding:'6px 10px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                        Save
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => setEditingNeeds(prev => ({ ...prev, [s.name]: (s.specificNeeds || []).join(', ') }))}
                      style={{ cursor:'text', minHeight:28, display:'flex', flexWrap:'wrap', gap:5, alignItems:'center' }}>
                      {(s.specificNeeds || []).length > 0
                        ? s.specificNeeds.map((need, i) => (
                            <span key={i} style={{ background:`${typeColor}18`, color:typeColor, borderRadius:999, padding:'3px 9px', fontSize:10, fontWeight:600 }}>
                              {need}
                            </span>
                          ))
                        : <span style={{ fontSize:11, color:C.muted, fontStyle:'italic' }}>Tap to add needs...</span>
                      }
                      <span style={{ fontSize:10, color:C.muted, marginLeft:4 }}>✏</span>
                    </div>
                  )}
                </div>

                {/* Lesson-specific adjustments (AI-generated) */}
                {s.lessonAdjustments?.length > 0 && (
                  <div>
                    <div style={{ fontSize:10, fontWeight:700, color:C.teal, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6, marginTop:10 }}>
                      ✨ Adjustments for This Lesson
                    </div>
                    {s.lessonAdjustments.map((adj, i) => (
                      <div key={i} style={{ background:`${C.teal}10`, border:`1px solid ${C.teal}20`, borderRadius:8, padding:'7px 10px', marginBottom:5, fontSize:12, color:C.text, lineHeight:1.5 }}>
                        {adj}
                      </div>
                    ))}
                  </div>
                )}

                {/* Notes */}
                {s.notes && (
                  <div style={{ marginTop:8, fontSize:11, color:C.muted, fontStyle:'italic' }}>{s.notes}</div>
                )}
              </div>
            )
          })}

          {/* Add student manually */}
          <div style={{ display:'flex', gap:8, marginBottom: count > 0 ? 12 : 4 }}>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddStudent()}
              placeholder="Add student by name..."
              style={{ flex:1, background:C.bg, border:`1px solid ${C.border}`, borderRadius:10, padding:'8px 12px', color:C.text, fontSize:12, outline:'none' }}
            />
            <button onClick={handleAddStudent} disabled={!newName.trim()}
              style={{ background:newName.trim()?`${C.blue}22`:'transparent', color:newName.trim()?C.blue:C.muted, border:`1px solid ${newName.trim()?C.blue:C.border}`, borderRadius:10, padding:'8px 14px', fontSize:12, fontWeight:700, cursor:newName.trim()?'pointer':'not-allowed' }}>
              + Add
            </button>
          </div>

          {/* Generate lesson adjustments button */}
          {count > 0 && lessonTopic && (
            <button onClick={handleGenerateAdjustments} disabled={generating}
              style={{ width:'100%', background:generating?C.inner:`${C.purple}20`, color:generating?C.muted:C.purple, border:`1px solid ${generating?C.border:`${C.purple}40`}`, borderRadius:10, padding:'10px', fontSize:12, fontWeight:700, cursor:generating?'not-allowed':'pointer' }}>
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

      <SectionWithAI title="Objective" items={[lesson.objective]} />
      {lesson.warmup?.length > 0     && <SectionWithAI title="Warm-Up"    items={lesson.warmup} />}
      {lesson.activities?.length > 0 && <SectionWithAI title="Activities" items={lesson.activities} />}
      {lesson.materials?.length > 0  && <SectionWithAI title="Materials"  items={lesson.materials} />}
      {lesson.homework               && <SectionWithAI title="Homework"   items={[lesson.homework]} />}

      {/* Accommodations section — always shown in lesson view */}
      <AccommodationsSection
        lessonTopic={lesson.title}
        lessonSubject={lesson.subject || ''}
        lessonGrade={lesson.grade || ''}
      />
    </div>
  )
}

// ─── AI Generator ────────────────────────────────────────────────────────────
function AIPlanGenerator({ onBack }) {
  const { currentUser, selectedStandards, clearSelectedStandards } = useStore()
  const [form, setForm] = useState({ textbook:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showStandards, setShowStandards] = useState(false)
  const [plan, setPlan] = useState(null)
  const [generatingAdjust, setGeneratingAdjust] = useState(false)
  const students = useStore(s => s.students)
  const accommodationStudents = students.filter(s => s.accommodations && s.accommodations.length > 0)

  // Auto-populate subject and grade from teacher profile
  const subject = currentUser?.subjects?.[0] || 'Math'
  const grade = currentUser?.gradeLevel || '5'

  async function handleGenerate() {
    setLoading(true)
    setError('')
    setPlan(null)

    try {
      const standardsText = selectedStandards.length > 0 ? 
        selectedStandards.map(s => `${s.code}: ${s.description}`).join('\n') : 
        ''

      const result = await generateLessonPlan({
        subject: subject,
        grade: grade,
        topic: form.textbook || `${subject} lesson`,
        duration: 50,
        standards: standardsText
      })

      if (!result || !result.title || !Array.isArray(result.objectives)) {
        throw new Error('Invalid response format')
      }

      setPlan(result)

      if (accommodationStudents.length > 0) {
        setGeneratingAdjust(true)
        try {
          const accommodations = extractAccommodations(accommodationStudents)
          const adjPrompt = `Create specific lesson adjustments for this lesson plan: ${JSON.stringify(result)}. 
Student accommodations: ${JSON.stringify(accommodations)}
Subject: ${subject}, Grade: ${grade}
${standardsText ? `Standards: ${standardsText}` : ''}

Return JSON: {"adjustments": ["specific adjustments for each accommodation type"]}`
          
          const adjResult = safeParseJSON(await callAI(adjPrompt, 'You are an expert special education consultant. Generate practical, specific instructional adjustments for individual students based on their accommodation needs and the current lesson.', 1500))
          if (adjResult?.adjustments) {
            // setLessonAdjustments(adjResult.adjustments)
          }
        } catch (adjErr) {
          console.error('Adjustment generation failed:', adjErr)
        }
        setGeneratingAdjust(false)
      }

    } catch (err) {
      setError(err.message || 'Generation failed. Please try again.')
    }
    setLoading(false)
  }

  if (loading) return <LoadingSpinner label="Generating your lesson plan..." />

  if (plan) return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', padding:'20px 16px', paddingBottom:80 }}>
      <button onClick={() => setPlan(null)} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:20 }}>Back</button>
      <h1 style={{ fontSize:18, fontWeight:800, margin:'0 0 4px' }}>{plan.title}</h1>
      <p style={{ color:C.muted, fontSize:12, marginBottom:20 }}>{subject} · {grade}</p>

      {selectedStandards.length > 0 && (
        <div style={{ background: `${C.teal}12`, border: `1px solid ${C.teal}30`, borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Aligned Standards ({selectedStandards.length})
          </div>
          {selectedStandards.map(standard => (
            <div key={standard.code} style={{ fontSize: 12, color: C.text, marginBottom: 4 }}>
              <span style={{ fontWeight: 700, color: C.teal }}>{standard.code}:</span> {standard.description}
            </div>
          ))}
        </div>
      )}

      {plan.objectives?.length > 0  && <SectionWithAI title="Objectives" items={plan.objectives} />}
      {plan.materials?.length > 0   && <SectionWithAI title="Materials"   items={plan.materials} />}
      {plan.steps?.length > 0       && <SectionWithAI title="Steps"       items={plan.steps} />}
      {plan.assessment?.length > 0  && <SectionWithAI title="Assessment"  items={plan.assessment} />}
      {plan.homework?.length > 0    && <SectionWithAI title="Homework"    items={plan.homework} />}
      {plan.notes && (
        <div style={{ background:C.inner, borderRadius:12, padding:'12px 14px', fontSize:13, color:C.muted, marginBottom:16 }}>{plan.notes}</div>
      )}

      {generatingAdjust && (
        <div style={{ background:`${C.purple}12`, border:`1px solid ${C.purple}30`, borderRadius:12, padding:'10px 14px', marginBottom:12, fontSize:12, color:C.purple }}>
          Generating lesson adjustments...
        </div>
      )}
      <AccommodationsSection
        lessonTopic={form.textbook || `${subject} lesson`}
        lessonSubject={subject}
        lessonGrade={grade}
      />
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', padding:'20px 16px', paddingBottom:80 }}>
      <button onClick={onBack} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:20 }}>Back</button>
      <h1 style={{ fontSize:18, fontWeight:800, margin:'0 0 20px' }}>AI Lesson Plan Generator</h1>

      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:'16px', marginBottom:16 }}>
        {/* Auto-populated read-only fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ display:'block', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:C.muted, marginBottom:6 }}>Subject</label>
            <div style={{ 
              background: C.bg, 
              border:`1px solid ${C.border}`, 
              borderRadius:12, 
              padding:'11px 14px', 
              color:C.text, 
              fontSize:13 
            }}>
              {subject}
            </div>
          </div>
          <div>
            <label style={{ display:'block', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:C.muted, marginBottom:6 }}>Grade Level</label>
            <div style={{ 
              background: C.bg, 
              border:`1px solid ${C.border}`, 
              borderRadius:12, 
              padding:'11px 14px', 
              color:C.text, 
              fontSize:13 
            }}>
              {grade}
            </div>
          </div>
        </div>

        {/* Textbook (editable) */}
        <div style={{ marginBottom:12 }}>
          <label style={{ display:'block', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:C.muted, marginBottom:6 }}>Textbook (optional)</label>
          <input
            value={form.textbook}
            onChange={e => setForm(f => ({ ...f, textbook: e.target.value }))}
            placeholder="Publisher or title..."
            style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:12, padding:'11px 14px', color:C.text, fontSize:13, outline:'none', boxSizing:'border-box' }}
          />
        </div>

        {/* STANDARDS SECTION + GENERATE BUTTON */}
        <div style={{ marginBottom:12, background: C.inner, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ display:'block', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:C.muted }}>
              Standards / TEKS (optional)
            </label>
            <button
              onClick={() => setShowStandards(!showStandards)}
              style={{
                background: showStandards ? `${C.teal}18` : C.inner,
                border: `1px solid ${showStandards ? C.teal : C.border}`,
                borderRadius: 8,
                padding: '4px 8px',
                color: showStandards ? C.teal : C.muted,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {showStandards ? 'Hide' : 'Select'} Standards
            </button>
          </div>
          
          {selectedStandards.length > 0 && (
            <div style={{ 
              background: `${C.teal}12`, 
              border: `1px solid ${C.teal}30`, 
              borderRadius: 8, 
              padding: '8px 10px', 
              marginBottom: 8,
              fontSize: 12
            }}>
              {selectedStandards.length} standard{selectedStandards.length !== 1 ? 's' : ''} selected
            </div>
          )}

          {showStandards && (
            <StandardsSelector 
              topic={form.textbook || `${subject} lesson`}
              maxSelections={3}
              showRecommendations={true}
              schoolName={currentUser?.schoolName}
            />
          )}

          {/* GENERATE BUTTON (inside Standards section) */}
          <button 
            onClick={handleGenerate}
            disabled={loading}
            style={{ 
              width:'100%', 
              background: loading ? C.muted : 'var(--school-color)', 
              color:'#fff', 
              border:'none', 
              borderRadius:999, 
              padding:'12px', 
              fontSize:14, 
              fontWeight:800, 
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              marginTop: 12
            }}>
            {loading ? ' Generating...' : ' Generate Lesson Plan'}
          </button>
        </div>

        {accommodationStudents.length > 0 && (
          <div style={{ background:`${C.purple}12`, border:`1px solid ${C.purple}30`, borderRadius:12, padding:'10px 14px', marginBottom:14, fontSize:12, color:C.purple }}>
            {accommodationStudents.length} student{accommodationStudents.length !== 1 ? 's' : ''} with accommodations adjustments will be auto-generated after the lesson plan.
          </div>
        )}

        {error && <p style={{ color:C.red, fontSize:12 }}>{error}</p>}
      </div>
    </div>
  )
}

// ─── Build from Scratch ───────────────────────────────────────────────────────

// ─── AI Assist Button Component ────────────────────────────────────────────
function AIAssistButton({ mode, sectionName, onGenerate, loading }) {
  const label = mode === 'refine' ? '✨ Refine' : '✨ Generate'
  const title = mode === 'refine' 
    ? `Refine ${sectionName} using AI` 
    : `Generate ${sectionName} from scratch`
  
  return (
    <button
      onClick={() => onGenerate(mode)}
      disabled={loading}
      title={title}
      style={{
        background: loading ? C.muted : C.purple,
        color: 'white',
        border: 'none',
        borderRadius: 6,
        padding: '6px 12px',
        fontSize: 11,
        fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
        transition: 'all 0.2s',
      }}
    >
      {loading ? '⏳ Generating...' : label}
    </button>
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
            <AIAssistButton
              mode="generate"
              sectionName={title}
              onGenerate={() => onAIGenerate('generate')}
              loading={isGenerating}
            />
          )}
          {onAIRefine && (
            <AIAssistButton
              mode="refine"
              sectionName={title}
              onGenerate={() => onAIRefine('refine')}
              loading={isGenerating}
            />
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
        <StandardsSelector
          subject={headerData?.subject}
          grade={headerData?.gradeLevel}
          selectedStandards={data.standards || []}
          topic={headerData?.title}
          schoolName="GradeFlow"
          onChange={(standards) => {
            onChange('standards', standards)
            setShowPicker(false)
          }}
        />
      )}

      {data.standards && data.standards.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 8, textTransform: 'uppercase' }}>
            Selected ({data.standards.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {data.standards.map((std, i) => (
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
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {typeof std === 'string' ? std : std.code}
                <button
                  onClick={() => onChange('standards', data.standards.filter((_, idx) => idx !== i))}
                  style={{ background: 'none', border: 'none', color: C.blue, cursor: 'pointer', fontSize: 14, padding: 0 }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
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
          fontFamily: 'Inter, monospace',
          minHeight: 120,
          lineHeight: 1.5,
        }}
      />
    </SectionWithAI>
  )
}

// ─── 4. CFS (Culturally Responsive Teaching & Success Criteria) ──────────
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
          value={data.successCriteria || ''}
          onChange={(e) => onChange('cfs', { ...data, successCriteria: e.target.value })}
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
          value={data.culturalNotes || ''}
          onChange={(e) => onChange('cfs', { ...data, culturalNotes: e.target.value })}
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
              value={data.enrichment || ''}
              onChange={(e) => onChange('optionalAddOns', { ...data, enrichment: e.target.value })}
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
              value={data.supplementalLinks || ''}
              onChange={(e) => onChange('optionalAddOns', { ...data, supplementalLinks: e.target.value })}
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
              value={data.reflections || ''}
              onChange={(e) => onChange('optionalAddOns', { ...data, reflections: e.target.value })}
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
function BuildFromScratch({ onBack }) {
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

  // Auto-populate lesson header with teacher's subject and grade level
  useEffect(() => {
    if (currentUser && !lessonData.header.subject && !lessonData.header.gradeLevel) {
      const gradeMatch = currentUser.gradeLevel?.match(/(\d+)/);
      const gradeNum = gradeMatch ? gradeMatch[1] : '';
      const subject = Array.isArray(currentUser.subjects) 
        ? currentUser.subjects[0] 
        : currentUser.subjects || '';

      // Get selectedDate from URL query params (set by Lesson Calendar)
      const params = new URLSearchParams(window.location.search)
      const selectedDate = params.get('date') // e.g., "2025-04-15"

      setLessonData(prev => ({
        ...prev,
        header: {
          ...prev.header,
          subject: subject,
          gradeLevel: gradeNum || prev.header.gradeLevel,
          date: selectedDate || prev.header.date, // ← Pre-fill with calendar date
        }
      }))
    }
  }, [currentUser, lessonData.header.subject, lessonData.header.gradeLevel])

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
      const response = await fetch('/api/lesson-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lessonData),
      })

      if (!response.ok) throw new Error('Save failed')
      alert('Lesson plan saved!')
      onBack()
    } catch (err) {
      console.error('Save error:', err)
      alert('Failed to save. Please try again.')
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
      {/* Header */}
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
              disabled={saving || !lessonData.header.title.trim()}
              style={{
                background: lessonData.header.title.trim() ? C.blue : C.muted,
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 12,
                fontWeight: 600,
                cursor: lessonData.header.title.trim() && !saving ? 'pointer' : 'not-allowed',
                opacity: (lessonData.header.title.trim() && !saving) ? 1 : 0.6,
              }}
            >
              {saving ? '💾 Saving...' : '💾 Save Lesson Plan'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px', maxWidth: 1000, margin: '0 auto' }}>
        <LessonHeaderSection data={lessonData.header} onChange={handleSectionChange} />
        <StandardsSection data={lessonData.standards} onChange={handleSectionChange} onAIGenerate={handleAIAssist} headerData={lessonData.header} />
        <ObjectivesSection data={lessonData.objectives} onChange={handleSectionChange} onAIGenerate={handleAIAssist} />
        <CFSSection data={lessonData.cfs} onChange={handleSectionChange} onAIGenerate={handleAIAssist} />
        <LessonStepsSection data={lessonData.lessonSteps} onChange={handleSectionChange} onAIGenerate={handleAIAssist} />
        <ExitTicketSection data={lessonData.exitTicket} onChange={handleSectionChange} onAIGenerate={handleAIAssist} />
        <HomeworkSection data={lessonData.homework} onChange={handleSectionChange} onAIGenerate={handleAIAssist} />
        <AccommodationsSection_Builtin data={lessonData.accommodations} onChange={handleSectionChange} />
        <AttachmentsSection_Builtin data={lessonData.attachments} onChange={handleSectionChange} />
        <OptionalAddOnsSection data={lessonData.optionalAddOns} onChange={handleSectionChange} />
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
  const [extractResult,  setExtractResult]  = useState(null) // { count, noAccommodationsFound }
  const [extractError,   setExtractError]   = useState('')

  async function handleFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setLoading(true)
    setExtractError('')
    setExtractResult(null)

    // Simulate document processing
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    setDone(true)

    // Attempt AI accommodation extraction
    setExtracting(true)
    try {
      const reader = new FileReader()
      reader.onload = async (ev) => {
        try {
          const dataUrl   = ev.target.result
          const base64    = dataUrl.split(',')[1]
          const mediaType = f.type || 'image/jpeg'

          // For text files (CSV, plain text), pass as textContent instead
          const isText = f.type.includes('text') || f.name.endsWith('.csv') || f.name.endsWith('.txt')

          let result
          if (isText) {
            // Decode base64 back to text for CSV/txt files
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

      {/* Accommodation extraction result */}
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
  const navigate = useNavigate()
  const { goBack, getTodayLesson } = useStore()
  const handleBack  = onBack || goBack
  const todayLesson = classId ? getTodayLesson(classId) : null
  
  // Read mode from URL query params (set by Lesson Calendar)
  const params = new URLSearchParams(window.location.search)
  const urlMode = params.get('mode') // e.g., "ai", "build", "upload"
  
  const startMode   = urlMode || (initialMode === 'view' && todayLesson ? 'view' : (initialMode && initialMode !== 'view' ? initialMode : 'menu'))
  const [mode, setMode] = useState(startMode)

  // Watch for URL mode changes and update state
  useEffect(() => {
    if (urlMode && urlMode !== mode) {
      setMode(urlMode)
    }
  }, [urlMode, mode])

  if (mode === 'view' && todayLesson) return <LessonView lesson={todayLesson} onBack={handleBack} onEdit={() => setMode('build')} />
  if (mode === 'ai')     return <AIPlanGenerator   onBack={() => setMode('menu')} />
  if (mode === 'build')  return <BuildFromScratch onBack={() => setMode('menu')} />
  if (mode === 'upload') return <UploadDoc        onBack={() => setMode('menu')} />

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', padding:'20px 16px', paddingBottom:80 }}>
      <button onClick={handleBack} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:20 }}>← Back</button>
      <h1 style={{ fontSize:22, fontWeight:800, margin:'0 0 4px' }}>Lesson Plans</h1>
      <p style={{ color:C.muted, fontSize:13, margin:'0 0 24px' }}>Create · Upload · AI-generate</p>

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
          <span style={{ marginLeft:'auto', color:C.muted, fontSize:18 }}>›</span>
        </button>
      ))}
    </div>
  )
