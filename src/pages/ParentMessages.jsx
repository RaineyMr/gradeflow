import React, { useState } from 'react'
import { useStore } from '../lib/store'
import { Tag, LoadingSpinner } from '../components/ui'
import { generateParentMessage } from '../lib/ai'

export default function ParentMessages() {
  const { messages, dismissMessage, teacher } = useStore()
  const [tab, setTab] = useState('pending')
  const [generating, setGenerating] = useState(null)
  const [regenerated, setRegenerated] = useState({})
  const [showPositive, setShowPositive] = useState({})
  const [templateOpen, setTemplateOpen] = useState(false)

  const filtered = tab === 'pending' ? messages.filter(m => m.status === 'pending')
    : tab === 'sent' ? messages.filter(m => m.status === 'sent')
    : messages

  async function handleRegenerate(msg) {
    setGenerating(msg.id)
    const result = await generateParentMessage({
      studentName: msg.studentName,
      subject: msg.subject,
      score: msg.trigger,
      trigger: msg.trigger,
      teacherName: teacher.name,
    })
    if (result) {
      setRegenerated(r => ({ ...r, [msg.id]: result }))
    }
    setGenerating(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-primary">Parent Messages</h1>
          <p className="text-text-muted text-sm">AI drafts · Every negative has a positive version · Multilingual</p>
        </div>
        <button
          onClick={() => setTemplateOpen(true)}
          className="px-3 py-2 rounded-pill text-xs font-semibold"
          style={{ background: '#1e2231', color: '#6b7494' }}
        >
          ✏ Templates
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['pending', 'sent', 'all'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-pill text-sm font-semibold capitalize transition-all"
            style={{
              background: tab === t ? 'var(--school-color)' : '#1e2231',
              color: tab === t ? 'white' : '#6b7494'
            }}
          >
            {t} {t === 'pending' && messages.filter(m => m.status === 'pending').length > 0 && (
              <span className="ml-1 px-1.5 rounded-full text-xs font-bold" style={{ background: '#f04a4a', color: 'white' }}>
                {messages.filter(m => m.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-text-muted">No {tab} messages</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(msg => {
            const regen = regenerated[msg.id]
            const currentDraft = regen ? (showPositive[msg.id] ? regen.positive : regen.negative) : (showPositive[msg.id] ? msg.positiveDraft : msg.draft)
            return (
              <div key={msg.id} className="rounded-card overflow-hidden" style={{ background: '#161923', border: '1px solid #2a2f42' }}>
                {/* Header */}
                <div className="p-4 border-b border-elevated">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="font-bold text-text-primary">{msg.studentName}</p>
                      <p className="text-text-muted text-xs">{msg.subject} · {msg.trigger}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag color={msg.status === 'pending' ? '#f5a623' : '#22c97a'}>
                        {msg.status}
                      </Tag>
                      <div className="flex gap-1">
                        {['👍', '❤️', '😂'].map(r => <span key={r} className="cursor-pointer hover:scale-125 transition-transform text-sm">{r}</span>)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted" style={{ fontSize: '10px' }}>AI tone: {regen?.toneLabel || msg.tone}</span>
                  </div>
                </div>

                {/* Positive/Negative toggle */}
                <div className="px-4 pt-3">
                  <div className="flex rounded-pill overflow-hidden mb-3" style={{ background: '#1e2231' }}>
                    <button
                      onClick={() => setShowPositive(p => ({ ...p, [msg.id]: false }))}
                      className="flex-1 py-1.5 text-xs font-bold transition-all"
                      style={{
                        background: !showPositive[msg.id] ? '#f04a4a' : 'transparent',
                        color: !showPositive[msg.id] ? 'white' : '#6b7494',
                        borderRadius: '999px 0 0 999px'
                      }}
                    >
                      ⚑ Concern
                    </button>
                    <button
                      onClick={() => setShowPositive(p => ({ ...p, [msg.id]: true }))}
                      className="flex-1 py-1.5 text-xs font-bold transition-all"
                      style={{
                        background: showPositive[msg.id] ? '#22c97a' : 'transparent',
                        color: showPositive[msg.id] ? 'white' : '#6b7494',
                        borderRadius: '0 999px 999px 0'
                      }}
                    >
                      🌟 Positive
                    </button>
                  </div>
                </div>

                {/* Message draft */}
                <div className="px-4 pb-3">
                  {generating === msg.id ? (
                    <LoadingSpinner />
                  ) : (
                    <div className="p-3 rounded-card mb-3" style={{ background: '#1e2231' }}>
                      <p className="text-sm text-text-primary leading-relaxed">{currentDraft}</p>
                    </div>
                  )}

                  {/* Action buttons */}
                  {msg.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => dismissMessage(msg.id)}
                        className="flex-1 py-2 rounded-pill text-xs font-bold transition-all hover:opacity-90"
                        style={{ background: '#22c97a20', color: '#22c97a' }}
                      >
                        Send ✓
                      </button>
                      <button
                        onClick={() => handleRegenerate(msg)}
                        className="flex-1 py-2 rounded-pill text-xs font-bold"
                        style={{ background: '#3b7ef420', color: '#3b7ef4' }}
                      >
                        ✨ Regenerate
                      </button>
                      <button
                        onClick={() => dismissMessage(msg.id)}
                        className="px-4 py-2 rounded-pill text-xs font-bold"
                        style={{ background: '#f04a4a20', color: '#f04a4a' }}
                      >
                        ✕ Skip
                      </button>
                    </div>
                  )}
                </div>

                {/* Auto-send toggle */}
                <div className="px-4 pb-4">
                  <div className="flex items-center justify-between p-2 rounded-card" style={{ background: '#1e2231' }}>
                    <span className="text-xs text-text-muted">Auto-send "{msg.trigger}" messages</span>
                    <div className="w-9 h-5 rounded-full bg-border flex items-center px-0.5 cursor-pointer">
                      <div className="w-4 h-4 rounded-full bg-text-muted transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Template editor modal */}
      {templateOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center animate-fade" onClick={() => setTemplateOpen(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-card border border-elevated rounded-t-widget p-6 w-full max-w-lg animate-slide-up" onClick={e => e.stopPropagation()}>
            <p className="font-bold text-text-primary mb-4">Template Editor</p>
            <p className="tag-label mb-2">Message Template</p>
            <textarea
              className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-sm text-text-primary resize-none"
              rows={4}
              defaultValue="Dear Parent of [Student Name], [Student Name] scored [Score] on [Subject] in [Class] — [Teacher Name]"
            />
            <p className="text-text-muted mt-2 mb-4" style={{ fontSize: '10px' }}>
              Tags: [Student Name] [Score] [Subject] [Class] [Teacher Name] [Drop Amount] [Letter Grade]
            </p>
            <div className="flex gap-2">
              <button onClick={() => setTemplateOpen(false)} className="flex-1 py-2.5 rounded-pill text-sm font-bold" style={{ background: 'var(--school-color)', color: 'white' }}>
                Save as Default
              </button>
              <button className="px-4 py-2.5 rounded-pill text-sm" style={{ background: '#1e2231', color: '#6b7494' }}>
                Reset to AI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
