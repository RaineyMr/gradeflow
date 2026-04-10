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
                          color: s.accommodationType === type ? ACCOM_TYPE_COLORS[type] : C.muted
                        }}>
                        {type}
                      </button>
                    ))}
                  </div>

                  {/* Remove button */}
                  <button onClick={() => removeAccommodation(s.name)}
                    style={{ padding:'2px 6px', borderRadius:6, border:'none', cursor:'pointer', background:C.inner, color:C.red, fontSize:11, fontWeight:700 }}>
                    ✕
                  </button>
                </div>

                {/* Specific needs */}
                <div style={{ marginBottom: 8 }}>
                  {isEditingNeeds ? (
                    <textarea
                      value={needsDraft}
                      onChange={(e) => setEditingNeeds(prev => ({ ...prev, [s.name]: e.target.value }))}
                      placeholder="Comma-separated needs (e.g., extra time, clarify instructions)"
                      style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:8, padding:'8px 10px', background:C.bg, color:C.text, fontSize:12, outline:'none', marginBottom:6 }}
                    />
                  ) : (
                    <div style={{ fontSize:12, color:C.muted, marginBottom:6 }}>
                      {s.specificNeeds?.length ? s.specificNeeds.join(' · ') : 'No specific needs recorded'}
                    </div>
                  )}

                  {isEditingNeeds && (
                    <button onClick={() => handleNeedsSave(s.name)}
                      style={{ fontSize:11, fontWeight:700, color:C.green, background:'transparent', border:'none', cursor:'pointer', padding:0 }}>
                      ✓ Save
                    </button>
                  )}
                  {!isEditingNeeds && (
                    <button onClick={() => setEditingNeeds(prev => ({ ...prev, [s.name]: s.specificNeeds?.join(', ') || '' }))}
                      style={{ fontSize:11, fontWeight:700, color:C.blue, background:'transparent', border:'none', cursor:'pointer', padding:0 }}>
                      Edit needs
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          {/* Add new student */}
          <div style={{ display:'flex', gap:6, marginBottom: count > 0 ? 12 : 0 }}>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
              placeholder="Add student..."
              style={{ flex:1, background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:'8px 10px', color:C.text, fontSize:12, outline:'none' }}
            />
            <button onClick={handleAddStudent}
              style={{ padding:'8px 14px', borderRadius:8, border:'none', background:C.blue, color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer' }}>
              +
            </button>
          </div>

          {count > 0 && (
            <button onClick={handleGenerateAdjustments} disabled={generating}
              style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'none', background: generating ? C.muted : `${C.purple}25`, color: generating ? C.inner : C.purple, cursor: generating ? 'not-allowed' : 'pointer', fontSize:12, fontWeight:700 }}>
              {generating ? '✨ Generating adjustments...' : '✨ Generate Lesson Adjustments'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── AI Lesson Plan Generator ──────────────────────────────────────────────────
function AIPlanGenerator({ onBack }) {
  const { currentUser, selectedStandards } = useStore()
  const [form, setForm] = useState({ textbook: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [plan, setPlan] = useState(null)
  const [generatingAdjust, setGeneratingAdjust] = useState(false)
  const students = useStore(s => s.students)
  const accommodationStudents = students.filter(s => s.accommodations && s.accommodations.length > 0)

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
            // Handle adjustments if needed
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
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Inter, Arial, sans-serif', padding: '20px 16px', paddingBottom: 80 }}>
      <button onClick={() => setPlan(null)} style={{ background: C.inner, border: 'none', borderRadius: 10, padding: '8px 14px', color: C.text, cursor: 'pointer', fontSize: 13, fontWeight: 600, marginBottom: 20 }}>← Back</button>
      <h1 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px' }}>{plan.title}</h1>
      <p style={{ color: C.muted, fontSize: 12, marginBottom: 20 }}>{subject} · {grade}</p>

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

      {plan.objectives?.length > 0 && <Section title="Objectives" items={plan.objectives} />}
      {plan.materials?.length > 0 && <Section title="Materials" items={plan.materials} />}
      {plan.steps?.length > 0 && <Section title="Steps" items={plan.steps} />}
      {plan.assessment?.length > 0 && <Section title="Assessment" items={plan.assessment} />}
      {plan.homework?.length > 0 && <Section title="Homework" items={plan.homework} />}
      {plan.notes && (
        <div style={{ background: C.inner, borderRadius: 12, padding: '12px 14px', fontSize: 13, color: C.muted, marginBottom: 16 }}>{plan.notes}</div>
      )}

      {generatingAdjust && (
        <div style={{ background: `${C.purple}12`, border: `1px solid ${C.purple}30`, borderRadius: 12, padding: '10px 14px', marginBottom: 12, fontSize: 12, color: C.purple }}>
          ✨ Generating lesson adjustments...
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
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Inter, Arial, sans-serif', padding: '20px 16px', paddingBottom: 100 }}>
      <button onClick={onBack} style={{ background: C.inner, border: 'none', borderRadius: 10, padding: '8px 14px', color: C.text, cursor: 'pointer', fontSize: 13, fontWeight: 600, marginBottom: 20 }}>← Back</button>
      <h1 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 20px' }}>✨ AI Lesson Plan Generator</h1>

      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* 1. LESSON HEADER */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: '0 0 16px' }}>Lesson Header</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>Subject *</label>
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px', fontSize: 14, color: C.text }}>
                {subject}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>Grade Level *</label>
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px', fontSize: 14, color: C.text }}>
                {grade}
              </div>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>Textbook (optional)</label>
            <input
              type="text"
              value={form.textbook}
              onChange={(e) => setForm(f => ({ ...f, textbook: e.target.value }))}
              placeholder="Publisher or title..."
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                fontSize: 14,
                background: C.inner,
                color: C.text,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* 2. STANDARDS */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>2. Standards</h2>
            <button
              onClick={handleGenerate}
              disabled={loading}
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
              {loading ? '⏳ Generating...' : '✨ Generate'}
            </button>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
              Search TEKS / Common Core Standards
            </label>
          </div>

          {/* StandardsSelector component - always visible */}
          <StandardsSelector
            subject={subject}
            grade={grade}
            selectedStandards={selectedStandards}
            topic={form.textbook || `${subject} lesson`}
            schoolName={currentUser?.schoolName}
            onChange={(standards) => {
              useStore.setState({ selectedStandards: standards })
            }}
          />

          {/* Show selected standards below */}
          {selectedStandards.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {selectedStandards.map((std, i) => (
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
        </div>

        {error && <p style={{ color: C.red, fontSize: 12, marginBottom: 12 }}>{error}</p>}

        {accommodationStudents.length > 0 && (
          <div style={{ background: `${C.purple}12`, border: `1px solid ${C.purple}30`, borderRadius: 12, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: C.purple }}>
            ✨ {accommodationStudents.length} student{accommodationStudents.length !== 1 ? 's' : ''} with accommodations — adjustments will be auto-generated after the lesson plan.
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Build Lesson Plan from Scratch ────────────────────────────────────────────
function BuildFromScratch({ onBack }) {
  const { currentUser } = useStore()
  const [data, setData] = useState({
    title: '',
    subject: currentUser?.subjects?.[0] || 'Math',
    gradeLevel: currentUser?.gradeLevel || '5',
    date: new Date().toISOString().split('T')[0],
    duration: '50',
    standards: [],
    objectives: [],
    materials: [],
    warmUp: '',
    directInstruction: '',
    guidedPractice: '',
    independentPractice: '',
    closure: '',
    exitTicket: '',
    homework: '',
  })

  const [activeSection, setActiveSection] = useState('header')
  const [showPicker, setShowPicker] = useState(false)

  const sections = [
    { id: 'header', label: 'Header' },
    { id: 'standards', label: 'Standards' },
    { id: 'objectives', label: 'Objectives' },
    { id: 'materials', label: 'Materials' },
    { id: 'lesson', label: 'Lesson Steps' },
    { id: 'exit', label: 'Exit Ticket' },
    { id: 'homework', label: 'Homework' },
  ]

  const handleSave = () => {
    useStore.setState({ currentLesson: data })
    onBack()
  }

  const onChange = (field, value) => {
    setData(d => ({ ...d, [field]: value }))
  }

  const handleAddObjective = () => {
    onChange('objectives', [...data.objectives, ''])
  }

  const handleObjectiveChange = (i, val) => {
    const updated = [...data.objectives]
    updated[i] = val
    onChange('objectives', updated)
  }

  const handleAddMaterial = () => {
    onChange('materials', [...data.materials, ''])
  }

  const handleMaterialChange = (i, val) => {
    const updated = [...data.materials]
    updated[i] = val
    onChange('materials', updated)
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Inter, Arial, sans-serif', padding: '20px 16px', paddingBottom: 100 }}>
      <button onClick={onBack} style={{ background: C.inner, border: 'none', borderRadius: 10, padding: '8px 14px', color: C.text, cursor: 'pointer', fontSize: 13, fontWeight: 600, marginBottom: 20 }}>← Back</button>
      <h1 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 20px' }}>Build Lesson Plan</h1>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, overflowX: 'auto', paddingBottom: 8 }}>
        {sections.map(sec => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: 'none',
              background: activeSection === sec.id ? C.purple : C.inner,
              color: activeSection === sec.id ? '#fff' : C.muted,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {sec.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 900 }}>
        {/* HEADER */}
        {activeSection === 'header' && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: '0 0 16px' }}>Lesson Header</h2>
            
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, display: 'block', marginBottom: 6 }}>Lesson Title *</label>
              <input type="text" value={data.title} onChange={(e) => onChange('title', e.target.value)} placeholder="e.g., Photosynthesis Basics" style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.inner, color: C.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, display: 'block', marginBottom: 6 }}>Subject *</label>
                <input type="text" value={data.subject} onChange={(e) => onChange('subject', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.inner, color: C.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, display: 'block', marginBottom: 6 }}>Grade Level *</label>
                <input type="text" value={data.gradeLevel} onChange={(e) => onChange('gradeLevel', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.inner, color: C.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, display: 'block', marginBottom: 6 }}>Date *</label>
                <input type="date" value={data.date} onChange={(e) => onChange('date', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.inner, color: C.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, display: 'block', marginBottom: 6 }}>Duration (minutes) *</label>
                <input type="number" value={data.duration} onChange={(e) => onChange('duration', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.inner, color: C.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>
        )}

        {/* STANDARDS */}
        {activeSection === 'standards' && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>Standards</h2>
              <button onClick={() => setShowPicker(!showPicker)} style={{ background: C.blue, border: 'none', borderRadius: 6, padding: '6px 12px', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                {showPicker ? 'Hide' : 'Select'} Standards
              </button>
            </div>

            {showPicker && (
              <StandardsSelector
                subject={data.subject}
                grade={data.gradeLevel}
                selectedStandards={data.standards || []}
                topic={data.title}
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
                    <span key={i} style={{ background: `${C.blue}20`, color: C.blue, border: `1px solid ${C.blue}40`, borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>
                      {typeof std === 'string' ? std : std.code}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* OBJECTIVES */}
        {activeSection === 'objectives' && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: '0 0 16px' }}>Objectives</h2>
            {data.objectives.map((obj, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <textarea value={obj} onChange={(e) => handleObjectiveChange(i, e.target.value)} placeholder="Learning objective..." style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.inner, color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box', minHeight: 60 }} />
              </div>
            ))}
            <button onClick={handleAddObjective} style={{ background: C.inner, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.blue, fontSize: 12, fontWeight: 600, cursor: 'pointer', width: '100%' }}>
              + Add Objective
            </button>
          </div>
        )}

        {/* MATERIALS */}
        {activeSection === 'materials' && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: '0 0 16px' }}>Materials</h2>
            {data.materials.map((mat, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <input type="text" value={mat} onChange={(e) => handleMaterialChange(i, e.target.value)} placeholder="Material needed..." style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.inner, color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
            <button onClick={handleAddMaterial} style={{ background: C.inner, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.blue, fontSize: 12, fontWeight: 600, cursor: 'pointer', width: '100%' }}>
              + Add Material
            </button>
          </div>
        )}

        {/* LESSON STEPS */}
        {activeSection === 'lesson' && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: '0 0 16px' }}>Lesson Steps</h2>
            {[
              { key: 'warmUp', label: 'Warm-up' },
              { key: 'directInstruction', label: 'Direct Instruction' },
              { key: 'guidedPractice', label: 'Guided Practice' },
              { key: 'independentPractice', label: 'Independent Practice' },
              { key: 'closure', label: 'Closure' },
            ].map(step => (
              <div key={step.key} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, display: 'block', marginBottom: 6 }}>{step.label}</label>
                <textarea value={data[step.key]} onChange={(e) => onChange(step.key, e.target.value)} placeholder={`Describe ${step.label.toLowerCase()}...`} style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.inner, color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box', minHeight: 80 }} />
              </div>
            ))}
          </div>
        )}

        {/* EXIT TICKET */}
        {activeSection === 'exit' && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: '0 0 16px' }}>Exit Ticket</h2>
            <textarea value={data.exitTicket} onChange={(e) => onChange('exitTicket', e.target.value)} placeholder="Exit ticket question or task..." style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.inner, color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box', minHeight: 120 }} />
          </div>
        )}

        {/* HOMEWORK */}
        {activeSection === 'homework' && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: '0 0 16px' }}>Homework</h2>
            <textarea value={data.homework} onChange={(e) => onChange('homework', e.target.value)} placeholder="Homework assignment..." style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.inner, color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box', minHeight: 120 }} />
          </div>
        )}

        <button onClick={handleSave} style={{ width: '100%', background: 'var(--school-color)', border: 'none', borderRadius: 10, padding: '12px 20px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 20 }}>
          Save Lesson Plan
        </button>
      </div>
    </div>
  )
}

// ─── Lesson View ──────────────────────────────────────────────────────────────
function LessonView({ lesson, onBack, onEdit }) {
  if (!lesson) return <LoadingSpinner label="Loading lesson..." />

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Inter, Arial, sans-serif', padding: '20px 16px', paddingBottom: 80 }}>
      <button onClick={onBack} style={{ background: C.inner, border: 'none', borderRadius: 10, padding: '8px 14px', color: C.text, cursor: 'pointer', fontSize: 13, fontWeight: 600, marginBottom: 20 }}>← Back</button>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px' }}>{lesson.title}</h1>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>{lesson.subject} · {lesson.gradeLevel} · {lesson.date}</p>

      <button onClick={onEdit} style={{ background: C.blue, border: 'none', borderRadius: 8, padding: '8px 14px', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginBottom: 20 }}>
        Edit Lesson
      </button>

      {lesson.objectives?.length > 0 && <Section title="Objectives" items={lesson.objectives} />}
      {lesson.materials?.length > 0 && <Section title="Materials" items={lesson.materials} />}
      {lesson.warmUp && <Section title="Warm-up" items={[lesson.warmUp]} />}
      {lesson.directInstruction && <Section title="Direct Instruction" items={[lesson.directInstruction]} />}
      {lesson.guidedPractice && <Section title="Guided Practice" items={[lesson.guidedPractice]} />}
      {lesson.independentPractice && <Section title="Independent Practice" items={[lesson.independentPractice]} />}
      {lesson.closure && <Section title="Closure" items={[lesson.closure]} />}
      {lesson.exitTicket && <Section title="Exit Ticket" items={[lesson.exitTicket]} />}
      {lesson.homework && <Section title="Homework" items={[lesson.homework]} />}
    </div>
  )
}

// ─── Upload Document ──────────────────────────────────────────────────────────
function UploadDoc({ onBack }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [extractResult, setExtractResult] = useState(null)
  const [extractError, setExtractError] = useState('')
  const fileRef = useRef(null)

  async function handleFile(e) {
    const f = e.target.files?.[0]
    if (!f) return

    setFile(f)
    setLoading(true)
    setExtractError('')

    try {
      setExtracting(true)
      const reader = new FileReader()
      
      reader.onload = async (event) => {
        const base64 = event.target?.result?.split(',')[1]
        const mediaType = f.type

        try {
          let result
          if (mediaType === 'text/plain' || mediaType === 'text/csv') {
            // Decode base64 back to text for CSV/txt files
            const textContent = atob(base64)
            result = await extractAccommodations({ textContent })
          } else {
            result = await extractAccommodations({ imageBase64: base64, mediaType })
          }

          if (result?.noAccommodationsFound || !result?.students?.length) {
            setExtractResult({ count: 0, noAccommodationsFound: true })
          } else {
            setExtractResult({ count: result.students.length })
          }
        } catch (err) {
          setExtractError('Could not extract accommodation data. You can add it manually in any lesson plan.')
        }
        setExtracting(false)
      }
      reader.readAsDataURL(f)
      setDone(true)
    } catch (err) {
      setExtractError('Could not read file for accommodation extraction.')
      setExtracting(false)
    }
    setLoading(false)
  }

  if (loading) return <LoadingSpinner label="Reading your document..." />

  if (done) return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Inter, Arial, sans-serif', padding: '20px 16px' }}>
      <button onClick={onBack} style={{ background: C.inner, border: 'none', borderRadius: 10, padding: '8px 14px', color: C.text, cursor: 'pointer', fontSize: 13, fontWeight: 600, marginBottom: 20 }}>← Back</button>

      <div style={{ background: '#0f2a1a', border: `1px solid ${C.green}40`, borderRadius: 14, padding: '14px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 24 }}>📄</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{file?.name}</div>
          <div style={{ color: C.green, fontSize: 11 }}>✓ Uploaded successfully</div>
        </div>
      </div>

      {extracting && (
        <div style={{ background: `${C.purple}12`, border: `1px solid ${C.purple}30`, borderRadius: 12, padding: '12px 14px', marginBottom: 14, fontSize: 12, color: C.purple }}>
          ✨ Scanning for student accommodations...
        </div>
      )}

      {!extracting && extractResult && extractResult.count > 0 && (
        <div style={{ background: `${C.purple}12`, border: `1px solid ${C.purple}30`, borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.purple, marginBottom: 4 }}>
            ✨ Found {extractResult.count} student{extractResult.count !== 1 ? 's' : ''} with accommodations
          </div>
          <div style={{ fontSize: 11, color: C.muted }}>
            Accommodation data has been loaded. Open any lesson plan to review, edit, and get AI-suggested adjustments.
          </div>
        </div>
      )}

      {!extracting && extractResult?.noAccommodationsFound && (
        <div style={{ background: `${C.amber}10`, border: `1px solid ${C.amber}25`, borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.amber, marginBottom: 4 }}>No accommodation data found</div>
          <div style={{ fontSize: 11, color: C.muted }}>
            The document doesn't appear to contain accommodation indicators (IEP, 504, ELL). You can add students and their needs manually in any lesson plan.
          </div>
        </div>
      )}

      {!extracting && extractError && (
        <div style={{ background: `${C.red}10`, border: `1px solid ${C.red}25`, borderRadius: 12, padding: '12px 14px', marginBottom: 14, fontSize: 12, color: C.red }}>
          {extractError}
        </div>
      )}

      <p style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>Your document has been imported and is ready to use.</p>

      <button onClick={onBack} style={{ background: 'var(--school-color)', border: 'none', borderRadius: 999, padding: '12px 24px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
        Go to Lesson Plans
      </button>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Inter, Arial, sans-serif', padding: '20px 16px' }}>
      <button onClick={onBack} style={{ background: C.inner, border: 'none', borderRadius: 10, padding: '8px 14px', color: C.text, cursor: 'pointer', fontSize: 13, fontWeight: 600, marginBottom: 20 }}>← Back</button>
      <h1 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px' }}>📄 Upload Lesson Plan / Roster</h1>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 8 }}>PDF · Word · CSV · Excel · Google Doc · Any format</p>
      <p style={{ color: C.purple, fontSize: 12, fontWeight: 600, marginBottom: 20 }}>
        ✨ GradeFlow will automatically scan for student accommodations (IEP, 504, ELL) and load them into your lesson plans.
      </p>
      <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,image/*" onChange={handleFile} style={{ display: 'none' }} />
      <button onClick={() => fileRef.current?.click()}
        style={{ width: '100%', background: C.card, border: `2px dashed ${C.border}`, borderRadius: 18, padding: '40px 20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 48 }}>📤</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Tap to choose file</span>
        <span style={{ fontSize: 12, color: C.muted }}>PDF · Word · CSV · Excel · Google Doc · Image</span>
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
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Inter, Arial, sans-serif', padding: '20px 16px', paddingBottom: 80 }}>
      <button onClick={handleBack} style={{ background: C.inner, border: 'none', borderRadius: 10, padding: '8px 14px', color: C.text, cursor: 'pointer', fontSize: 13, fontWeight: 600, marginBottom: 20 }}>← Back</button>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px' }}>Lesson Plans</h1>
      <p style={{ color: C.muted, fontSize: 13, margin: '0 0 24px' }}>Create · Upload · AI-generate</p>

      {[
        { id: 'ai',       icon: '✨', label: 'AI Generate',       desc: 'Fill in subject, grade, topic → full lesson plan',  color: C.purple },
        { id: 'build',    icon: '📝', label: 'Build from Scratch', desc: 'Write your own lesson plan with guided sections',   color: C.blue   },
        { id: 'upload',   icon: '📤', label: 'Upload Document',   desc: 'PDF · Word · CSV · Image — AI scans for accommodations', color: C.teal },
        { id: 'calendar', icon: '📅', label: 'Lesson Calendar',   desc: 'Plan lessons by date with curriculum integration',   color: C.green },
      ].map(item => (
        <button key={item.id} onClick={() => {
          if (item.id === 'calendar') {
            navigate('/teacher/lessons/calendar')
          } else {
            setMode(item.id)
          }
        }}
          style={{ width: '100%', background: C.card, border: `1px solid ${item.color}22`, borderRadius: 16, padding: 16, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}
          onMouseEnter={e => e.currentTarget.style.borderColor=item.color}
          onMouseLeave={e => e.currentTarget.style.borderColor=`${item.color}22`}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: `${item.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{item.icon}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontSize: 11, color: C.muted }}>{item.desc}</div>
          </div>
          <span style={{ marginLeft: 'auto', color: C.muted, fontSize: 18 }}>{'>'}</span>
        </button>
      ))}
    </div>
  )
}