import React, { useState } from 'react'
import { generateLessonPlan } from '../lib/ai'
import { LoadingSpinner, Tag } from '../components/ui'

export default function LessonPlan() {
  const [mode, setMode] = useState('menu') // menu | ai | view
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState(null)
  const [form, setForm] = useState({ subject: '', grade: '', topic: '', standard: '' })
  const [expandedMore, setExpandedMore] = useState(false)

  async function handleGenerate() {
    if (!form.subject || !form.topic) return
    setLoading(true)
    setMode('view')
    const result = await generateLessonPlan(form)
    setPlan(result)
    setLoading(false)
  }

  const sourceMethods = [
    { icon: '🔍', label: 'Search textbook / ed site', sub: '📷 scan cover or barcode', color: '#3b7ef4' },
    { icon: '🏗', label: 'Build from scratch', sub: 'Create section by section', color: '#22c97a' },
    { icon: '📄', label: 'Upload lesson plan doc', sub: 'PDF, Word, Google Doc', color: '#f5a623' },
    { icon: '🔗', label: 'Connect external app', sub: 'Planbook · Chalk · TPT · Google', color: '#9b6ef5' },
    { icon: '✨', label: 'AI Generate from Standard/TEKS', sub: 'Fill in details below', color: '#0fb8a0', action: () => setMode('ai') },
  ]

  if (mode === 'ai' || mode === 'view') {
    return (
      <div>
        <button onClick={() => { setMode('menu'); setPlan(null) }} className="flex items-center gap-2 text-text-muted text-sm mb-6 hover:text-text-primary transition-colors">
          ← Lesson Plan Builder
        </button>

        {mode === 'ai' && (
          <div className="space-y-4 mb-6">
            <h1 className="font-display font-bold text-xl text-text-primary">✨ AI Lesson Generator</h1>
            {[
              { key: 'subject', label: 'Subject', placeholder: 'e.g. Math' },
              { key: 'grade', label: 'Grade Level', placeholder: 'e.g. 3rd Grade' },
              { key: 'topic', label: 'Topic / Lesson Title', placeholder: 'e.g. Fractions & Decimals' },
              { key: 'standard', label: 'Standard / TEKS (optional)', placeholder: 'e.g. TEKS 3.3A' },
            ].map(f => (
              <div key={f.key}>
                <label className="tag-label block mb-1">{f.label}</label>
                <input
                  className="w-full bg-elevated border border-border rounded-card px-3 py-2.5 text-text-primary text-sm"
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                />
              </div>
            ))}
            <button
              onClick={handleGenerate}
              disabled={!form.subject || !form.topic}
              className="w-full py-3 rounded-pill font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #0fb8a0, #22c97a)' }}
            >
              Generate Lesson Package ✨
            </button>
          </div>
        )}

        {loading && (
          <div>
            <LoadingSpinner />
            <p className="text-center text-text-muted text-sm mt-2 animate-pulse-soft">AI is generating your lesson package...</p>
          </div>
        )}

        {plan && (
          <div className="space-y-4 animate-slide-up">
            <div className="p-4 rounded-widget" style={{ background: 'linear-gradient(135deg, #0f2a1a, #0a1a10)', border: '1px solid #1a3a2a' }}>
              <div className="flex items-center justify-between mb-2">
                <Tag color="#0fb8a0">AI-Generated Lesson Package</Tag>
                <Tag color="#22c97a">✓ Ready</Tag>
              </div>
              <h2 className="font-display font-bold text-lg text-text-primary">{form.topic}</h2>
              <p className="text-text-muted text-sm">{form.subject} · {form.grade}</p>
            </div>

            {/* 5 main sections + more */}
            {[
              { icon: '📝', title: 'Simple Summary', content: plan.summary },
              { icon: '🎯', title: 'Objectives', content: Array.isArray(plan.objectives) ? plan.objectives.join(' · ') : plan.objectives },
              { icon: '📋', title: 'Standards / TEKS', content: plan.standards },
              { icon: '🌟', title: 'SWBAT', content: Array.isArray(plan.swbat) ? plan.swbat.join('\n') : plan.swbat },
              { icon: '✓', title: 'Success Criteria', content: Array.isArray(plan.successCriteria) ? plan.successCriteria.join('\n') : plan.successCriteria },
            ].map(section => (
              <div key={section.title} className="p-3 rounded-card" style={{ background: '#0f2a1a', border: '1px solid #0fb8a020' }}>
                <p className="font-bold text-sm mb-1" style={{ color: '#0fb8a0' }}>{section.icon} {section.title}</p>
                <p className="text-text-primary text-sm whitespace-pre-line">{section.content}</p>
              </div>
            ))}

            {/* Expandable "more" sections */}
            <button
              onClick={() => setExpandedMore(!expandedMore)}
              className="w-full py-2 rounded-pill text-sm font-semibold transition-all"
              style={{ background: '#0fb8a020', color: '#0fb8a0' }}
            >
              {expandedMore ? '↑ Show less' : '+ More (Supplies, Steps, Worksheet, Exit Ticket)'}
            </button>

            {expandedMore && (
              <div className="space-y-3 animate-slide-up">
                {[
                  { icon: '📦', title: 'Supplies List', content: Array.isArray(plan.supplies) ? plan.supplies.join(' · ') : plan.supplies },
                  { icon: '📖', title: 'Step-by-Step Instructions', content: Array.isArray(plan.steps) ? plan.steps.map((s, i) => `${i + 1}. ${s}`).join('\n') : plan.steps },
                  { icon: '📄', title: 'Student Worksheet', content: plan.worksheet },
                  { icon: '🚪', title: 'Exit Ticket', content: plan.exitTicket },
                ].map(section => (
                  <div key={section.title} className="p-3 rounded-card" style={{ background: '#0f2a1a', border: '1px solid #0fb8a020' }}>
                    <p className="font-bold text-sm mb-1" style={{ color: '#0fb8a0' }}>{section.icon} {section.title}</p>
                    <p className="text-text-primary text-sm whitespace-pre-line">{section.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Share row */}
            <div className="p-3 rounded-card" style={{ background: '#0f1a0a', border: '1px solid #22c97a30' }}>
              <p className="tag-label mb-2">Share To</p>
              <div className="flex flex-wrap gap-2">
                {['Class Feed', 'All Classes', 'Specific Class', 'Students'].map(s => (
                  <button key={s} className="px-3 py-1.5 rounded-pill text-xs font-semibold" style={{ background: '#22c97a20', color: '#22c97a' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Export row */}
            <div className="flex gap-2">
              {[{ icon: '⬇', label: 'PDF', color: '#3b7ef4' }, { icon: '📝', label: 'Word/GDoc', color: '#22c97a' }, { icon: '🖨', label: 'Print', color: '#9b6ef5' }, { icon: '📋', label: 'Copy', color: '#f5a623' }].map(e => (
                <button key={e.label} className="flex-1 py-2 rounded-pill text-xs font-bold" style={{ background: `${e.color}20`, color: e.color }}>
                  {e.icon} {e.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-text-primary mb-2">Lesson Plan Builder</h1>
      <p className="text-text-muted text-sm mb-6">6 ways to create · AI generates full package</p>

      <div className="space-y-3">
        {sourceMethods.map(method => (
          <button
            key={method.label}
            onClick={method.action || undefined}
            className="w-full p-4 rounded-card text-left transition-all hover:scale-[1.01]"
            style={{ background: '#161923', border: `1px solid ${method.color}22` }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{method.icon}</span>
              <div>
                <p className="font-semibold text-text-primary text-sm">{method.label}</p>
                <p className="text-text-muted" style={{ fontSize: '11px' }}>{method.sub}</p>
              </div>
              <span className="ml-auto text-text-muted">›</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
