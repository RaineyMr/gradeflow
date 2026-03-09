import React, { useState } from 'react'
import { AssignmentOptions, Tag, LoadingSpinner } from '../components/ui'
import { generateTestQuestions } from '../lib/ai'

export default function TestingSuite() {
  const [mode, setMode] = useState('menu') // menu | build | import | generate
  const [options, setOptions] = useState({ lockdown: false, timer: false, shuffle: false, schedule: false, monitor: false })
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [genForm, setGenForm] = useState({ subject: '', grade: '', topic: '', count: 10 })

  async function handleGenerate() {
    setLoading(true)
    const qs = await generateTestQuestions(genForm)
    setQuestions(qs)
    setLoading(false)
    setMode('review')
  }

  const methods = [
    { id: 'build', icon: '🏗', label: 'Build It', sub: 'MC · T/F · Short answer · Essay · Fill blank', color: '#3b7ef4' },
    { id: 'import', icon: '📷', label: 'Import It', sub: 'Photo · Upload · PDF → AI digitizes', color: '#22c97a' },
    { id: 'generate', icon: '✨', label: 'Find / Generate', sub: 'Search db · Ed site · AI by TEKS', color: '#f5a623' },
  ]

  if (mode === 'generate' || mode === 'review') {
    return (
      <div>
        <button onClick={() => setMode('menu')} className="flex items-center gap-2 text-text-muted text-sm mb-6 hover:text-text-primary">← Testing Suite</button>
        <h1 className="font-display font-bold text-xl text-text-primary mb-6">✨ AI Test Generator</h1>

        {mode === 'generate' && (
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
                value={genForm.count} onChange={e => setGenForm(p => ({ ...p, count: e.target.value }))} />
            </div>
            <button onClick={handleGenerate} disabled={!genForm.subject || !genForm.topic} className="w-full py-3 rounded-pill font-bold text-white disabled:opacity-40" style={{ background: 'linear-gradient(135deg, #f5a623, #f04a4a)' }}>
              Generate Test ✨
            </button>
          </div>
        )}

        {loading && <LoadingSpinner />}

        {questions.length > 0 && (
          <div className="space-y-3 mb-6">
            <p className="tag-label">{questions.length} Questions — All editable</p>
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
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${opt.startsWith(q.answer) ? 'border-success bg-success' : 'border-border'}`} style={{ minWidth: 16 }}>
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
        )}

        {questions.length > 0 && (
          <div className="space-y-3">
            <div className="p-4 rounded-card" style={{ background: '#161923' }}>
              <AssignmentOptions options={options} onChange={setOptions} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="py-3 rounded-pill font-bold text-sm" style={{ background: '#22c97a20', color: '#22c97a' }}>✓ Auto-Post Grades</button>
              <button className="py-3 rounded-pill font-bold text-sm" style={{ background: '#3b7ef420', color: '#3b7ef4' }}>👁 Review First</button>
            </div>
            <button className="w-full py-3 rounded-pill font-bold text-white" style={{ background: 'var(--school-color)' }}>
              Assign to Class →
            </button>
          </div>
        )}
      </div>
    )
  }

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
        <p className="tag-label mb-3">Assignment Options — Applied to everything you assign</p>
        <AssignmentOptions options={options} onChange={setOptions} />
      </div>
    </div>
  )
}
