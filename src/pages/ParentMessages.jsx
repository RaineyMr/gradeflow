import React, { useState } from 'react'
import { useStore } from '../lib/store'
import { Tag, LoadingSpinner } from '../components/ui'
import { generateParentMessage } from '../lib/ai'

const DEFAULT_TEMPLATES = {
  'Failed': "Dear Parent of [Student Name], I wanted to reach out because [Student Name] scored [Score] on a recent [Subject] assessment. I'd love to connect this week to discuss how we can support them. — [Teacher Name]",
  'Grade Drop': "Dear Parent of [Student Name], I noticed [Student Name]'s [Subject] grade has dropped [Drop Amount] points recently. Let's schedule a brief call to talk through some strategies. — [Teacher Name]",
  'Missing Work': "Dear Parent of [Student Name], [Student Name] has some missing work in [Subject] that is affecting their grade. Please encourage them to complete and submit it. — [Teacher Name]",
  'Improved': "Dear Parent of [Student Name], I'm excited to share that [Student Name] has shown real improvement in [Subject]! Their hard work is paying off. — [Teacher Name]",
  'High Achievement': "Dear Parent of [Student Name], [Student Name] earned [Score] in [Subject] — outstanding work! Please share this great news with them. — [Teacher Name]",
}

export default function ParentMessages() {
  const { messages, dismissMessage, updateMessageDraft, teacher } = useStore()
  const [tab, setTab] = useState('pending')
  const [generating, setGenerating] = useState(null)
  const [regenerated, setRegenerated] = useState({})
  const [showPositive, setShowPositive] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [templateOpen, setTemplateOpen] = useState(false)
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES)
  const [activeTemplate, setActiveTemplate] = useState('Failed')

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

  function startEdit(msgId, currentDraft) {
    setEditingId(msgId)
    setEditValue(currentDraft)
  }

  function saveEdit(msgId) {
    updateMessageDraft(msgId, editValue)
    setEditingId(null)
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
            const currentDraft = regen
              ? (showPositive[msg.id] ? regen.positive : regen.negative)
              : (showPositive[msg.id] ? msg.positiveDraft : msg.draft)
            const isEditing = editingId === msg.id

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

                {/* Message draft — editable */}
                <div className="px-4 pb-3">
                  {generating === msg.id ? (
                    <LoadingSpinner />
                  ) : isEditing ? (
                    <div className="mb-3">
                      <textarea
                        className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-sm text-text-primary resize-none leading-relaxed"
                        rows={4}
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        autoFocus
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => saveEdit(msg.id)}
                          className="flex-1 py-1.5 rounded-pill text-xs font-bold"
                          style={{ background: '#22c97a20', color: '#22c97a' }}
                        >
                          ✓ Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-1.5 rounded-pill text-xs font-bold"
                          style={{ background: '#f04a4a20', color: '#f04a4a' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-card mb-3 relative group" style={{ background: '#1e2231' }}>
                      <p className="text-sm text-text-primary leading-relaxed">{currentDraft}</p>
                      <button
                        onClick={() => startEdit(msg.id, currentDraft)}
                        className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: '#3b7ef420', color: '#3b7ef4' }}
                      >
                        ✏ Edit
                      </button>
                    </div>
                  )}

                  {/* Action buttons */}
                  {msg.status === 'pending' && !isEditing && (
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

      {/* Template editor modal — per trigger type */}
      {templateOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center animate-fade" onClick={() => setTemplateOpen(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative bg-card border border-elevated rounded-t-widget p-6 w-full max-w-lg animate-slide-up"
            style={{ maxHeight: '85vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <p className="font-bold text-text-primary mb-4">Template Editor</p>

            {/* Trigger type tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.keys(DEFAULT_TEMPLATES).map(type => (
                <button
                  key={type}
                  onClick={() => setActiveTemplate(type)}
                  className="px-3 py-1.5 rounded-pill text-xs font-bold transition-all"
                  style={{
                    background: activeTemplate === type ? 'var(--school-color)' : '#1e2231',
                    color: activeTemplate === type ? 'white' : '#6b7494'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>

            <p className="tag-label mb-2">{activeTemplate} Template</p>
            <textarea
              className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-sm text-text-primary resize-none"
              rows={5}
              value={templates[activeTemplate]}
              onChange={e => setTemplates(t => ({ ...t, [activeTemplate]: e.target.value }))}
            />
            <p className="text-text-muted mt-2 mb-4" style={{ fontSize: '10px' }}>
              Tags: [Student Name] [Score] [Subject] [Class] [Teacher Name] [Drop Amount] [Letter Grade]
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setTemplateOpen(false)}
                className="flex-1 py-2.5 rounded-pill text-sm font-bold"
                style={{ background: 'var(--school-color)', color: 'white' }}
              >
                Save as Default
              </button>
              <button
                onClick={() => setTemplates(t => ({ ...t, [activeTemplate]: DEFAULT_TEMPLATES[activeTemplate] }))}
                className="px-4 py-2.5 rounded-pill text-sm"
                style={{ background: '#1e2231', color: '#6b7494' }}
              >
                Reset to AI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
