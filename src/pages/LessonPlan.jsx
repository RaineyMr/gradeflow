import React, { useState, useRef } from 'react'
import { useStore } from '../lib/store'
import { generateLessonPlan, suggestTextbooks, suggestTopics, suggestStandards } from '../lib/ai'
import { LoadingSpinner, Tag, AssignmentOptions } from '../components/ui'

// ─── Build From Scratch ───────────────────────────────────────────────────────
function BuildFromScratch({ onBack }) {
  const [sections, setSections] = useState({
    title: '', subject: '', grade: '', objectives: '', steps: '', supplies: '', notes: ''
  })
  const [saved, setSaved] = useState(false)

  function handleSave() { setSaved(true) }

  if (saved) return (
    <div className="text-center py-12">
      <div className="text-5xl mb-4">✅</div>
      <p className="font-bold text-text-primary text-lg mb-2">Lesson Plan Saved</p>
      <p className="text-text-muted text-sm mb-6">Your lesson plan is ready to share or export</p>
      <button onClick={onBack} className="px-6 py-2.5 rounded-pill font-bold text-white" style={{ background: 'var(--school-color)' }}>
        Back to Lesson Plans
      </button>
    </div>
  )

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-text-muted text-sm mb-6 hover:text-text-primary">← Back</button>
      <h1 className="font-display font-bold text-xl text-text-primary mb-6">🏗 Build From Scratch</h1>
      <div className="space-y-4">
        {[
          { key: 'title', label: 'Lesson Title', placeholder: 'e.g. Introduction to Fractions' },
          { key: 'subject', label: 'Subject', placeholder: 'e.g. Math' },
          { key: 'grade', label: 'Grade Level', placeholder: 'e.g. 3rd Grade' },
        ].map(f => (
          <div key={f.key}>
            <label className="tag-label block mb-1">{f.label}</label>
            <input className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm"
              placeholder={f.placeholder} value={sections[f.key]} onChange={e => setSections(s => ({ ...s, [f.key]: e.target.value }))} />
          </div>
        ))}
        {[
          { key: 'objectives', label: 'Objectives', placeholder: 'What will students learn?' },
          { key: 'steps', label: 'Step-by-Step Instructions', placeholder: 'Step 1: ...\nStep 2: ...' },
          { key: 'supplies', label: 'Supplies Needed', placeholder: 'Pencils, worksheets...' },
          { key: 'notes', label: 'Teacher Notes', placeholder: 'Additional notes...' },
        ].map(f => (
          <div key={f.key}>
            <label className="tag-label block mb-1">{f.label}</label>
            <textarea className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm resize-none"
              rows={3} placeholder={f.placeholder} value={sections[f.key]}
              onChange={e => setSections(s => ({ ...s, [f.key]: e.target.value }))} />
          </div>
        ))}
        <button onClick={handleSave} disabled={!sections.title}
          className="w-full py-3 rounded-pill font-bold text-white disabled:opacity-40"
          style={{ background: 'var(--school-color)' }}>
          Save Lesson Plan
        </button>
      </div>
    </div>
  )
}

// ─── Upload Doc ───────────────────────────────────────────────────────────────
function UploadDoc({ onBack }) {
  const fileRef = useRef()
  const [file, setFile] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [done, setDone] = useState(false)

  function handleFile(e) {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setProcessing(true)
    setTimeout(() => { setProcessing(false); setDone(true) }, 2000)
  }

  if (processing) return (
    <div className="py-16 text-center">
      <LoadingSpinner />
      <p className="text-text-muted text-sm mt-4 animate-pulse-soft">Reading your document...</p>
    </div>
  )

  if (done) return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-text-muted text-sm mb-6 hover:text-text-primary">← Back</button>
      <div className="p-4 rounded-card mb-4 flex items-center gap-3" style={{ background: '#0f2a1a', border: '1px solid #22c97a40' }}>
        <span className="text-2xl">📄</span>
        <div>
          <p className="font-semibold text-text-primary text-sm">{file?.name}</p>
          <p className="text-success text-xs">✓ Uploaded successfully</p>
        </div>
      </div>
      <p className="text-text-muted text-sm mb-6">Your document has been imported. You can now edit it or share it with your class.</p>
      <div className="flex gap-2">
        <button onClick={() => useStore.getState().setScreen('classFeed')} className="flex-1 py-2.5 rounded-pill text-sm font-bold" style={{ background: 'var(--school-color)', color: 'white' }}>
          📤 Share to Class
        </button>
        <button onClick={onBack} className="flex-1 py-2.5 rounded-pill text-sm font-semibold" style={{ background: '#1e2231', color: '#6b7494' }}>
          Done
        </button>
      </div>
    </div>
  )

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-text-muted text-sm mb-6 hover:text-text-primary">← Back</button>
      <h1 className="font-display font-bold text-xl text-text-primary mb-6">📄 Upload Lesson Plan</h1>
      <button onClick={() => fileRef.current?.click()}
        className="w-full p-10 rounded-widget flex flex-col items-center gap-4 transition-all hover:scale-[1.01] border-2 border-dashed"
        style={{ background: '#161923', borderColor: '#2a2f42' }}>
        <span className="text-5xl">📎</span>
        <div className="text-center">
          <p className="font-bold text-text-primary mb-1">Click to upload</p>
          <p className="text-text-muted text-sm">PDF · Word · Google Doc · Any format</p>
        </div>
      </button>
      <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleFile} />
    </div>
  )
}

// ─── Autocomplete Input ──────────────────────────────────────────────────────
function AutoField({ label, placeholder, value, onChange, suggestions, loading, onSelect, hint, locked }) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value)
  const ref = React.useRef()

  // Keep inputValue in sync with external value changes (e.g. cleared)
  React.useEffect(() => { setInputValue(value) }, [value])

  // Click outside closes dropdown
  React.useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const isSelected = suggestions.some(s => s.toLowerCase() === value.toLowerCase())

  // Show all suggestions that match what's typed, always show full list when empty
  const filtered = inputValue.trim() === '' || isSelected
    ? suggestions
    : suggestions.filter(s => s.toLowerCase().includes(inputValue.toLowerCase()))

  function handleChange(e) {
    const v = e.target.value
    setInputValue(v)
    onChange(v)
    setOpen(true)
  }

  function handleSelect(s) {
    setInputValue(s)
    onSelect(s)
    setOpen(false)
  }

  function handleClear() {
    setInputValue('')
    onChange('')
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <label className="tag-label block mb-1">{label}</label>
      <div className="relative">
        <input
          className="w-full bg-elevated border rounded-card px-3 py-2.5 text-text-primary text-sm pr-8 transition-all"
          style={{
            borderColor: isSelected ? 'var(--school-color)' : '#2a2f42',
            background: isSelected ? 'color-mix(in srgb, var(--school-color) 8%, #1e2231)' : undefined
          }}
          placeholder={locked ? 'Fill in previous fields first' : placeholder}
          value={inputValue}
          disabled={locked}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
        />
        {/* Right icon: spinner, checkmark, or clear */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {loading
            ? <div className="w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--school-color)', borderTopColor: 'transparent' }} />
            : isSelected
              ? <span className="text-xs font-bold" style={{ color: 'var(--school-color)' }}>✓</span>
              : null
          }
        </div>
        {inputValue && !loading && (
          <button onMouseDown={e => { e.preventDefault(); handleClear() }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-xs pointer-events-auto"
            style={{ display: isSelected ? 'none' : 'block' }}>✕</button>
        )}
      </div>

      {/* Hint text */}
      {hint && (
        <p className="mt-1 transition-all" style={{ fontSize: '10px', color: isSelected ? 'var(--school-color)' : '#6b7494' }}>
          {isSelected ? '✓ ' : ''}{hint}
        </p>
      )}

      {/* Dropdown */}
      {open && !locked && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 rounded-card border border-elevated overflow-hidden"
          style={{ background: '#161923', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', maxHeight: 220, overflowY: 'auto' }}>
          {loading && (
            <div className="px-3 py-2 text-xs text-text-muted flex items-center gap-2">
              <div className="w-3 h-3 border border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--school-color)', borderTopColor: 'transparent' }} />
              Searching...
            </div>
          )}
          {filtered.slice(0, 8).map((s, i) => {
            const match = s.toLowerCase().includes(inputValue.toLowerCase()) && inputValue.length > 1
            const isActive = s.toLowerCase() === value.toLowerCase()
            return (
              <button key={i}
                onMouseDown={e => { e.preventDefault(); handleSelect(s) }}
                className="w-full px-3 py-2.5 text-left text-sm transition-colors border-b border-elevated last:border-0"
                style={{
                  color: isActive ? 'var(--school-color)' : '#eef0f8',
                  background: isActive ? 'color-mix(in srgb, var(--school-color) 12%, #161923)' : 'transparent'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#1e2231'}
                onMouseLeave={e => e.currentTarget.style.background = isActive ? 'color-mix(in srgb, var(--school-color) 12%, #161923)' : 'transparent'}
              >
                <span>{isActive ? '✓ ' : ''}{s}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── AI Generator ─────────────────────────────────────────────────────────────
const US_STATES = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming']
const SUBJECTS = ['Math','Reading','English Language Arts','Science','Social Studies','History','Writing','Art','Music','Physical Education','Computer Science','Spanish','French','Biology','Chemistry','Physics','Algebra','Geometry','Calculus']
const GRADES = ['Kindergarten','1st Grade','2nd Grade','3rd Grade','4th Grade','5th Grade','6th Grade','7th Grade','8th Grade','9th Grade','10th Grade','11th Grade','12th Grade']

function AIGenerator({ onBack }) {
  const [loading, setLoading] = React.useState(false)
  const [plan, setPlan] = React.useState(null)
  const [error, setError] = React.useState(null)
  const [expandedMore, setExpandedMore] = React.useState(false)

  // Form fields
  const [state, setState] = React.useState('')
  const [subject, setSubject] = React.useState('')
  const [grade, setGrade] = React.useState('')
  const [textbook, setTextbook] = React.useState('')
  const [topic, setTopic] = React.useState('')
  const [standard, setStandard] = React.useState('')

  // Suggestion lists
  const [textbookSuggestions, setTextbookSuggestions] = React.useState([])
  const [topicSuggestions, setTopicSuggestions] = React.useState([])
  const [standardSuggestions, setStandardSuggestions] = React.useState([])

  // Loading states per field
  const [loadingTextbooks, setLoadingTextbooks] = React.useState(false)
  const [loadingTopics, setLoadingTopics] = React.useState(false)
  const [loadingStandards, setLoadingStandards] = React.useState(false)

  // Debounced fetch: textbooks — fires 600ms after state+subject+grade are all filled
  React.useEffect(() => {
    if (!state || !subject || !grade) return
    const t = setTimeout(() => {
      setLoadingTextbooks(true)
      setTextbookSuggestions([])
      suggestTextbooks({ state, subject, grade })
        .then(r => setTextbookSuggestions(r || []))
        .catch(() => {})
        .finally(() => setLoadingTextbooks(false))
    }, 600)
    return () => clearTimeout(t)
  }, [state, subject, grade])

  // Debounced fetch: topics — fires when textbook changes (or subject+grade if no textbook)
  React.useEffect(() => {
    if (!subject || !grade) return
    const t = setTimeout(() => {
      setLoadingTopics(true)
      setTopicSuggestions([])
      suggestTopics({ state, subject, grade, textbook })
        .then(r => setTopicSuggestions(r || []))
        .catch(() => {})
        .finally(() => setLoadingTopics(false))
    }, 600)
    return () => clearTimeout(t)
  }, [textbook, subject, grade, state])

  // Debounced fetch: standards — fires when topic is selected
  React.useEffect(() => {
    if (!topic || !state) return
    const t = setTimeout(() => {
      setLoadingStandards(true)
      setStandardSuggestions([])
      suggestStandards({ state, subject, grade, topic })
        .then(r => setStandardSuggestions(r || []))
        .catch(() => {})
        .finally(() => setLoadingStandards(false))
    }, 400)
    return () => clearTimeout(t)
  }, [topic, state, subject, grade])

  const canGenerate = subject && grade && topic
  const completedFields = [state, subject, grade, textbook, topic, standard].filter(Boolean).length

  async function handleGenerate() {
    if (!canGenerate) return
    setLoading(true)
    setError(null)
    setPlan(null)
    try {
      const result = await generateLessonPlan({ subject, grade, topic, standard, state, textbook })
      if (!result) throw new Error('No response. Check your Anthropic API key in Vercel environment variables.')
      setPlan(result)
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  if (plan) return (
    <div>
      <button onClick={() => { setPlan(null); setError(null) }} className="flex items-center gap-2 text-text-muted text-sm mb-6 hover:text-text-primary">
        ← Generate a different lesson
      </button>
      <div className="p-4 rounded-widget mb-4" style={{ background: 'linear-gradient(135deg, #0f2a1a, #0a1a10)', border: '1px solid #1a3a2a' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 rounded-pill text-xs font-bold" style={{ background: '#0fb8a020', color: '#0fb8a0' }}>AI-Generated</span>
          <span className="px-2 py-0.5 rounded-pill text-xs font-bold" style={{ background: '#22c97a20', color: '#22c97a' }}>✓ Ready</span>
        </div>
        <h2 className="font-display font-bold text-lg text-text-primary">{topic}</h2>
        <p className="text-text-muted text-sm">{subject} · {grade} · {state}</p>
        {textbook && <p className="text-text-muted text-xs mt-1">📖 {textbook}</p>}
      </div>

      {[
        { icon: '📝', title: 'Simple Summary', content: plan.summary },
        { icon: '🎯', title: 'Objectives', content: Array.isArray(plan.objectives) ? plan.objectives.join('\n') : plan.objectives },
        { icon: '📋', title: 'Standards / TEKS', content: plan.standards },
        { icon: '🌟', title: 'SWBAT', content: Array.isArray(plan.swbat) ? plan.swbat.join('\n') : plan.swbat },
        { icon: '✓', title: 'Success Criteria', content: Array.isArray(plan.successCriteria) ? plan.successCriteria.join('\n') : plan.successCriteria },
      ].map(s => (
        <div key={s.title} className="p-3 rounded-card mb-3" style={{ background: '#0f2a1a', border: '1px solid #0fb8a020' }}>
          <p className="font-bold text-sm mb-1" style={{ color: '#0fb8a0' }}>{s.icon} {s.title}</p>
          <p className="text-text-primary text-sm whitespace-pre-line">{s.content}</p>
        </div>
      ))}

      <button onClick={() => setExpandedMore(!expandedMore)}
        className="w-full py-2 rounded-pill text-sm font-semibold mb-3"
        style={{ background: '#0fb8a020', color: '#0fb8a0' }}>
        {expandedMore ? '↑ Show less' : '+ Supplies · Steps · Worksheet · Exit Ticket'}
      </button>

      {expandedMore && (
        <div className="space-y-3 mb-3">
          {[
            { icon: '📦', title: 'Supplies', content: Array.isArray(plan.supplies) ? plan.supplies.join('\n') : plan.supplies },
            { icon: '📖', title: 'Step-by-Step', content: Array.isArray(plan.steps) ? plan.steps.map((s, i) => `${i + 1}. ${s}`).join('\n') : plan.steps },
            { icon: '📄', title: 'Student Worksheet', content: plan.worksheet },
            { icon: '🚪', title: 'Exit Ticket', content: plan.exitTicket },
          ].map(s => (
            <div key={s.title} className="p-3 rounded-card" style={{ background: '#0f2a1a', border: '1px solid #0fb8a020' }}>
              <p className="font-bold text-sm mb-1" style={{ color: '#0fb8a0' }}>{s.icon} {s.title}</p>
              <p className="text-text-primary text-sm whitespace-pre-line">{s.content}</p>
            </div>
          ))}
        </div>
      )}

      <div className="p-3 rounded-card mb-3" style={{ background: '#0f1a0a', border: '1px solid #22c97a30' }}>
        <p className="tag-label mb-2">Share To</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Class Feed', action: () => useStore.getState().setScreen('classFeed') },
            { label: 'All Classes', action: () => useStore.getState().setScreen('classFeed') },
            { label: 'Specific Class', action: () => useStore.getState().setScreen('classFeed') },
            { label: 'Individual Students', action: () => useStore.getState().setScreen('gradebook') },
          ].map(s => (
            <button key={s.label} onClick={s.action} className="px-3 py-1.5 rounded-pill text-xs font-semibold" style={{ background: '#22c97a20', color: '#22c97a' }}>{s.label}</button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        {[
          { icon: '⬇', label: 'PDF', color: '#3b7ef4', action: () => window.print() },
          { icon: '📋', label: 'Copy', color: '#f5a623', action: () => navigator.clipboard?.writeText(JSON.stringify(plan)) },
          { icon: '🖨', label: 'Print', color: '#9b6ef5', action: () => window.print() },
        ].map(e => (
          <button key={e.label} onClick={e.action}
            className="flex-1 py-2 rounded-pill text-xs font-bold" style={{ background: `${e.color}20`, color: e.color }}>
            {e.icon} {e.label}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-text-muted text-sm mb-6 hover:text-text-primary">← Back</button>
      <h1 className="font-display font-bold text-xl text-text-primary mb-1">✨ AI Lesson Generator</h1>
      <p className="text-text-muted text-sm mb-6">Fill in the fields — suggestions appear as you type</p>

      {/* Progress indicator */}
      <div className="flex gap-1 mb-6">
        {[state, subject, grade, textbook, topic, standard].map((v, i) => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all" style={{ background: v ? 'var(--school-color)' : '#2a2f42' }} />
        ))}
      </div>

      <div className="space-y-4 mb-6">
        <AutoField
          label="State"
          placeholder="e.g. Texas"
          value={state}
          onChange={setState}
          suggestions={US_STATES}
          loading={false}
          onSelect={setState}
          hint="Required to pull state standards and approved textbooks"
        />
        <AutoField
          label="Subject"
          placeholder="e.g. Math"
          value={subject}
          onChange={setSubject}
          suggestions={SUBJECTS}
          loading={false}
          onSelect={setSubject}
        />
        <AutoField
          label="Grade Level"
          placeholder="e.g. 3rd Grade"
          value={grade}
          onChange={setGrade}
          suggestions={GRADES}
          loading={false}
          onSelect={setGrade}
        />
        <AutoField
          label="Textbook (optional — improves accuracy)"
          placeholder="Searching for approved textbooks..."
          value={textbook}
          onChange={setTextbook}
          suggestions={textbookSuggestions}
          loading={loadingTextbooks}
          onSelect={setTextbook}
          locked={!state || !subject || !grade}
          hint={
            !state || !subject || !grade ? 'Fill in State, Subject & Grade to see approved textbooks' :
            loadingTextbooks ? 'Searching state-approved textbooks...' :
            textbookSuggestions.length > 0 ? `${textbookSuggestions.length} textbooks found for ${state} — click to select` :
            'Type your textbook name or select from the list'
          }
        />
        <AutoField
          label="Topic / Chapter"
          placeholder="e.g. Chapter 4: Adding Fractions"
          value={topic}
          onChange={setTopic}
          suggestions={topicSuggestions}
          loading={loadingTopics}
          onSelect={setTopic}
          locked={!subject || !grade}
          hint={
            !subject || !grade ? 'Fill in Subject & Grade to see topics' :
            loadingTopics ? `Searching topics from ${textbook || 'curriculum'}...` :
            topicSuggestions.length > 0 ? `${topicSuggestions.length} topics found — click to select or type your own` :
            'Type your lesson topic'
          }
        />
        <AutoField
          label="Standard / TEKS (auto-populated from topic)"
          placeholder="Searching matching standards..."
          value={standard}
          onChange={setStandard}
          suggestions={standardSuggestions}
          loading={loadingStandards}
          onSelect={setStandard}
          locked={!topic || !state}
          hint={
            !topic || !state ? 'Select State and Topic to auto-populate standards' :
            loadingStandards ? `Searching ${state} standards for "${topic}"...` :
            standardSuggestions.length > 0 ? `${standardSuggestions.length} matching ${state === 'Texas' ? 'TEKS' : 'standards'} found` :
            'Type your standard code or select from suggestions'
          }
        />
      </div>

      {error && (
        <div className="p-3 rounded-card mb-4 text-sm" style={{ background: '#1c1012', color: '#f04a4a', border: '1px solid #f04a4a30' }}>
          ⚠ {error}
        </div>
      )}

      <button onClick={handleGenerate} disabled={!canGenerate || loading}
        className="w-full py-3 rounded-pill font-bold text-white disabled:opacity-40 transition-all hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #0fb8a0, #22c97a)' }}>
        {loading ? 'Building your lesson...' : `Generate Lesson Package ✨ ${!canGenerate ? '(fill Subject, Grade, Topic)' : ''}`}
      </button>

      {loading && (
        <div className="py-6 text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-text-muted text-sm animate-pulse-soft">AI is building your complete lesson package...</p>
        </div>
      )}
    </div>
  )
}

// ─── Main Menu ────────────────────────────────────────────────────────────────
export default function LessonPlan() {
  const [mode, setMode] = useState('menu')

  if (mode === 'build') return <BuildFromScratch onBack={() => setMode('menu')} />
  if (mode === 'upload') return <UploadDoc onBack={() => setMode('menu')} />
  if (mode === 'ai') return <AIGenerator onBack={() => setMode('menu')} />

  const methods = [
    { id: 'search', icon: '🔍', label: 'Search textbook / ed site', sub: '📷 scan cover or barcode', color: '#3b7ef4', comingSoon: true },
    { id: 'build', icon: '🏗', label: 'Build from scratch', sub: 'Create section by section', color: '#22c97a' },
    { id: 'upload', icon: '📄', label: 'Upload lesson plan doc', sub: 'PDF · Word · Google Doc', color: '#f5a623' },
    { id: 'connect', icon: '🔗', label: 'Connect external app', sub: 'Planbook · Chalk · TPT · Google', color: '#9b6ef5', comingSoon: true },
    { id: 'ai', icon: '✨', label: 'AI Generate from Standard/TEKS', sub: 'Fill in topic and grade — AI builds the whole package', color: '#0fb8a0' },
  ]

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-text-primary mb-2">Lesson Plan Builder</h1>
      <p className="text-text-muted text-sm mb-6">5 ways to create · AI generates full package</p>
      <div className="space-y-3">
        {methods.map(method => (
          <button key={method.id}
            onClick={() => !method.comingSoon && setMode(method.id)}
            className="w-full p-4 rounded-card text-left transition-all hover:scale-[1.01]"
            style={{ background: '#161923', border: `1px solid ${method.color}22`, opacity: method.comingSoon ? 0.6 : 1 }}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{method.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-text-primary text-sm">{method.label}</p>
                <p className="text-text-muted" style={{ fontSize: '11px' }}>{method.sub}</p>
              </div>
              {method.comingSoon
                ? <span className="text-xs px-2 py-0.5 rounded-pill" style={{ background: '#2a2f42', color: '#6b7494' }}>Soon</span>
                : <span className="text-text-muted">›</span>
              }
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
