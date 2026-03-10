import React, { useState, useRef } from 'react'
import { useStore } from '../lib/store'
import { AssignmentOptions, Tag, LoadingSpinner } from '../components/ui'
import { generateTestQuestions } from '../lib/ai'

// ── Build It screen ───────────────────────────────────────────────────────────
function BuildTest({ onBack }) {
  const [questions, setQuestions] = useState([{ id: 1, type: 'mc', text: '', options: ['', '', '', ''], answer: 'A', points: 10 }])
  const [saved, setSaved] = useState(false)

  function addQuestion() {
    setQuestions(qs => [...qs, { id: Date.now(), type: 'mc', text: '', options: ['', '', '', ''], answer: 'A', points: 10 }])
  }

  function updateQ(id, field, value) {
    setQuestions(qs => qs.map(q => q.id === id ? { ...q, [field]: value } : q))
  }

  if (saved) return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">✅</div>
      <p className="font-bold text-text-primary text-lg mb-2">Test Saved</p>
      <p className="text-text-muted text-sm mb-6">{questions.length} questions ready to assign</p>
      <button onClick={onBack} className="px-6 py-2.5 rounded-pill font-bold text-white" style={{ background: 'var(--school-color)' }}>Back to Testing Suite</button>
    </div>
  )

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-text-muted text-sm mb-6 hover:text-text-primary">← Back</button>
      <h1 className="font-display font-bold text-xl text-text-primary mb-6">🏗 Build Test</h1>
      <div className="space-y-4 mb-4">
        {questions.map((q, i) => (
          <div key={q.id} className="p-4 rounded-card" style={{ background: '#161923' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sm text-text-muted">Q{i + 1}</span>
              <div className="flex gap-2">
                {['mc', 'tf', 'short', 'essay'].map(t => (
                  <button key={t} onClick={() => updateQ(q.id, 'type', t)}
                    className="px-2 py-0.5 rounded-pill text-xs font-bold transition-all"
                    style={{ background: q.type === t ? 'var(--school-color)' : '#1e2231', color: q.type === t ? 'white' : '#6b7494' }}>
                    {t === 'mc' ? 'MC' : t === 'tf' ? 'T/F' : t === 'short' ? 'Short' : 'Essay'}
                  </button>
                ))}
              </div>
            </div>
            <textarea className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm resize-none mb-2"
              rows={2} placeholder="Question text..." value={q.text}
              onChange={e => updateQ(q.id, 'text', e.target.value)} />
            {q.type === 'mc' && (
              <div className="space-y-1.5">
                {['A', 'B', 'C', 'D'].map((letter, j) => (
                  <div key={letter} className="flex items-center gap-2">
                    <button onClick={() => updateQ(q.id, 'answer', letter)}
                      className="w-6 h-6 rounded-full text-xs font-bold flex-shrink-0 transition-all"
                      style={{ background: q.answer === letter ? '#22c97a' : '#1e2231', color: q.answer === letter ? 'white' : '#6b7494' }}>
                      {letter}
                    </button>
                    <input className="flex-1 bg-elevated border border-border rounded-card px-2 py-1 text-text-primary text-sm"
                      placeholder={`Option ${letter}`} value={q.options[j]}
                      onChange={e => { const opts = [...q.options]; opts[j] = e.target.value; updateQ(q.id, 'options', opts) }} />
                  </div>
                ))}
              </div>
            )}
            {q.type === 'tf' && (
              <div className="flex gap-2 mt-2">
                {['True', 'False'].map(v => (
                  <button key={v} onClick={() => updateQ(q.id, 'answer', v)}
                    className="flex-1 py-1.5 rounded-pill text-sm font-bold transition-all"
                    style={{ background: q.answer === v ? '#22c97a20' : '#1e2231', color: q.answer === v ? '#22c97a' : '#6b7494' }}>
                    {v}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <button onClick={addQuestion} className="w-full py-2.5 rounded-pill text-sm font-semibold mb-4" style={{ background: '#1e2231', color: '#6b7494' }}>
        + Add Question
      </button>
      <button onClick={() => setSaved(true)} disabled={questions.every(q => !q.text)}
        className="w-full py-3 rounded-pill font-bold text-white disabled:opacity-40"
        style={{ background: 'var(--school-color)' }}>
        Save Test ({questions.length} questions)
      </button>
    </div>
  )
}

// ── Import It screen ──────────────────────────────────────────────────────────
function ImportTest({ onBack }) {
  const fileRef = useRef()
  const [processing, setProcessing] = useState(false)
  const [done, setDone] = useState(false)
  const [fileName, setFileName] = useState('')

  function handleFile(e) {
    const f = e.target.files[0]
    if (!f) return
    setFileName(f.name)
    setProcessing(true)
    setTimeout(() => { setProcessing(false); setDone(true) }, 2000)
  }

  if (processing) return (
    <div className="py-16 text-center">
      <LoadingSpinner />
      <p className="text-text-muted text-sm mt-4 animate-pulse-soft">AI is digitizing your test...</p>
    </div>
  )

  if (done) return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-text-muted text-sm mb-6 hover:text-text-primary">← Back</button>
      <div className="p-4 rounded-card mb-4" style={{ background: '#0f2a1a', border: '1px solid #22c97a40' }}>
        <p className="font-semibold text-text-primary text-sm">✓ {fileName}</p>
        <p className="text-success text-xs">Digitized successfully — ready to assign</p>
      </div>
      <div className="flex gap-2">
        <button onClick={onBack} className="flex-1 py-2.5 rounded-pill text-sm font-bold text-white" style={{ background: 'var(--school-color)' }}>Assign to Class</button>
        <button onClick={onBack} className="flex-1 py-2.5 rounded-pill text-sm font-semibold" style={{ background: '#1e2231', color: '#6b7494' }}>Done</button>
      </div>
    </div>
  )

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-text-muted text-sm mb-6 hover:text-text-primary">← Back</button>
      <h1 className="font-display font-bold text-xl text-text-primary mb-6">📷 Import Test</h1>
      <button onClick={() => fileRef.current?.click()}
        className="w-full p-10 rounded-widget flex flex-col items-center gap-4 border-2 border-dashed transition-all hover:scale-[1.01]"
        style={{ background: '#161923', borderColor: '#2a2f42' }}>
        <span className="text-5xl">📎</span>
        <div className="text-center">
          <p className="font-bold text-text-primary mb-1">Photo · Upload · PDF</p>
          <p className="text-text-muted text-sm">AI reads and digitizes any format</p>
        </div>
      </button>
      <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={handleFile} />
    </div>
  )
}

// ── AI Generate screen ────────────────────────────────────────────────────────
function GenerateTest({ onBack }) {
  const { addAssignment, classes, activeClass } = useStore()
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState([])
  const [error, setError] = useState(null)
  const [genForm, setGenForm] = useState({ subject: '', grade: '', topic: '', count: 10 })
  const [options, setOptions] = useState({ lockdown: false, timer: false, shuffle: false, schedule: false, monitor: false })
  const [posted, setPosted] = useState(false)

  async function handleGenerate() {
    if (!genForm.subject || !genForm.topic) return
    setLoading(true)
    setError(null)
    try {
      const qs = await generateTestQuestions(genForm)
      if (!qs || qs.length === 0) throw new Error('No questions returned. Check your API key.')
      setQuestions(qs)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  function handlePost() {
    addAssignment({
      name: `${genForm.topic} Test`,
      type: 'test',
      classId: activeClass?.id || classes[0]?.id,
      date: new Date().toISOString().split('T')[0],
      weight: 40,
      options
    })
    setPosted(true)
  }

  if (posted) return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">✅</div>
      <p className="font-bold text-text-primary text-lg mb-2">Test Assigned!</p>
      <p className="text-text-muted text-sm mb-6">Students will be notified</p>
      <button onClick={onBack} className="px-6 py-2.5 rounded-pill font-bold text-white" style={{ background: 'var(--school-color)' }}>Back to Testing Suite</button>
    </div>
  )

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-text-muted text-sm mb-6 hover:text-text-primary">← Back</button>
      <h1 className="font-display font-bold text-xl text-text-primary mb-6">✨ AI Test Generator</h1>

      {questions.length === 0 && (
        <div className="space-y-4 mb-6">
          {[
            { key: 'subject', label: 'Subject', placeholder: 'e.g. Math' },
            { key: 'grade', label: 'Grade', placeholder: 'e.g. 3rd Grade' },
            { key: 'topic', label: 'Topic', placeholder: 'e.g. Fractions' },
          ].map(f => (
            <div key={f.key}>
              <label className="tag-label block mb-1">{f.label}</label>
              <input className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm"
                placeholder={f.placeholder} value={genForm[f.key]} onChange={e => setGenForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label className="tag-label block mb-1">Number of Questions</label>
            <input type="number" min="1" max="50" className="w-24 bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm"
              value={genForm.count} onChange={e => setGenForm(p => ({ ...p, count: Number(e.target.value) }))} />
          </div>
          {error && <div className="p-3 rounded-card text-sm" style={{ background: '#1c1012', color: '#f04a4a', border: '1px solid #f04a4a30' }}>⚠ {error}</div>}
          <button onClick={handleGenerate} disabled={!genForm.subject || !genForm.topic || loading}
            className="w-full py-3 rounded-pill font-bold text-white disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #f5a623, #f04a4a)' }}>
            {loading ? 'Generating...' : 'Generate Test ✨'}
          </button>
        </div>
      )}

      {loading && <LoadingSpinner />}

      {questions.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="tag-label">{questions.length} Questions</p>
            <button onClick={() => setQuestions([])} className="text-xs text-text-muted hover:text-text-primary underline">← Regenerate</button>
          </div>
          <div className="space-y-3 mb-6">
            {questions.map((q, i) => (
              <div key={i} className="p-4 rounded-card" style={{ background: '#161923' }}>
                <div className="flex items-start gap-3">
                  <span className="font-bold text-sm text-text-muted">{i + 1}.</span>
                  <div className="flex-1">
                    <p className="text-sm text-text-primary mb-2">{q.question}</p>
                    {q.options && (
                      <div className="space-y-1">
                        {q.options.map((opt, j) => (
                          <div key={j} className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0"
                              style={{ borderColor: opt.startsWith(q.answer) ? '#22c97a' : '#2a2f42', background: opt.startsWith(q.answer) ? '#22c97a' : 'transparent' }}>
                              {opt.startsWith(q.answer) && <span className="text-white text-xs">✓</span>}
                            </div>
                            <span className="text-sm text-text-muted">{opt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <Tag color="#22c97a">{q.points} pts</Tag>
                      <Tag color="#3b7ef4">{q.type?.replace('_', ' ')}</Tag>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-card mb-4" style={{ background: '#161923' }}>
            <AssignmentOptions options={options} onChange={setOptions} />
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button onClick={handlePost} className="py-3 rounded-pill font-bold text-sm" style={{ background: '#22c97a20', color: '#22c97a' }}>✓ Post & Auto-Grade</button>
            <button onClick={handlePost} className="py-3 rounded-pill font-bold text-sm" style={{ background: '#3b7ef420', color: '#3b7ef4' }}>👁 Post & Review First</button>
          </div>
          <button onClick={handlePost} className="w-full py-3 rounded-pill font-bold text-white" style={{ background: 'var(--school-color)' }}>
            Assign to Class →
          </button>
        </>
      )}
    </div>
  )
}

// ── Main menu ─────────────────────────────────────────────────────────────────
export default function TestingSuite() {
  const [mode, setMode] = useState('menu')
  const [options, setOptions] = useState({ lockdown: false, timer: false, shuffle: false, schedule: false, monitor: false })

  if (mode === 'build') return <BuildTest onBack={() => setMode('menu')} />
  if (mode === 'import') return <ImportTest onBack={() => setMode('menu')} />
  if (mode === 'generate') return <GenerateTest onBack={() => setMode('menu')} />

  const methods = [
    { id: 'build', icon: '🏗', label: 'Build It', sub: 'MC · T/F · Short answer · Essay · Fill blank', color: '#3b7ef4' },
    { id: 'import', icon: '📷', label: 'Import It', sub: 'Photo · Upload · PDF → AI digitizes', color: '#22c97a' },
    { id: 'generate', icon: '✨', label: 'Find / Generate', sub: 'Search db · Ed site · AI by TEKS', color: '#f5a623' },
  ]

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-text-primary mb-2">Testing Suite</h1>
      <p className="text-text-muted text-sm mb-6">3 ways to create · Same options on every assignment</p>
      <div className="grid gap-4 mb-6">
        {methods.map(m => (
          <button key={m.id} onClick={() => setMode(m.id)}
            className="p-5 rounded-card text-left transition-all hover:scale-[1.01]"
            style={{ background: '#161923', border: `1px solid ${m.color}22` }}>
            <div className="flex items-center gap-4">
              <span className="text-3xl">{m.icon}</span>
              <div>
                <p className="font-bold text-text-primary">{m.label}</p>
                <p className="text-text-muted text-xs mt-0.5">{m.sub}</p>
              </div>
              <span className="ml-auto" style={{ color: m.color }}>›</span>
            </div>
          </button>
        ))}
      </div>
      <div className="p-4 rounded-card" style={{ background: '#161923' }}>
        <p className="tag-label mb-3">Default Assignment Options</p>
        <AssignmentOptions options={options} onChange={setOptions} />
      </div>
    </div>
  )
}
