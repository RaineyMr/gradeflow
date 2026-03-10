import React, { useState } from 'react'
import { useStore } from '../lib/store'
import { Tag, LoadingSpinner } from '../components/ui'
import { generateParentMessage } from '../lib/ai'

export default function ParentMessages() {
  const { messages, dismissMessage, updateMessage, teacher } = useStore()
  const [tab, setTab] = useState('pending')
  const [generating, setGenerating] = useState(null)
  const [showPositive, setShowPositive] = useState({})
  const [editing, setEditing] = useState({}) // { [msgId]: true/false }
  const [editText, setEditText] = useState({}) // { [msgId]: string }
  const [templateOpen, setTemplateOpen] = useState(false)
  const [autoSend, setAutoSend] = useState({})
  const [headerReactions, setHeaderReactions] = useState({})
  const [composeOpen, setComposeOpen] = useState(false)
  const [composeForm, setComposeForm] = useState({ to: '', subject: '', body: '' })

  function sendComposed() {
    if (!composeForm.to || !composeForm.body) return
    const newMsg = {
      id: Date.now(),
      studentName: composeForm.to,
      subject: composeForm.subject || 'General',
      trigger: 'Teacher initiated',
      status: 'pending',
      tone: 'Custom',
      dayOld: false,
      draft: composeForm.body,
      positiveDraft: composeForm.body,
    }
    const { messages } = useStore.getState()
    useStore.setState({ messages: [...messages, newMsg] })
    setComposeForm({ to: '', subject: '', body: '' })
    setComposeOpen(false)
  }
  function reactHeader(msgId, emoji) {
    setHeaderReactions(r => ({ ...r, [`${msgId}-${emoji}`]: (r[`${msgId}-${emoji}`] || 0) + 1 }))
  }

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
      updateMessage(msg.id, {
        draft: result.negative,
        positiveDraft: result.positive,
        tone: result.toneLabel
      })
    }
    setGenerating(null)
  }

  function startEditing(msg) {
    const isPositive = showPositive[msg.id]
    const currentText = isPositive ? msg.positiveDraft : msg.draft
    setEditText(t => ({ ...t, [msg.id]: currentText }))
    setEditing(e => ({ ...e, [msg.id]: true }))
  }

  function saveEdit(msg) {
    const isPositive = showPositive[msg.id]
    if (isPositive) {
      updateMessage(msg.id, { positiveDraft: editText[msg.id] })
    } else {
      updateMessage(msg.id, { draft: editText[msg.id] })
    }
    setEditing(e => ({ ...e, [msg.id]: false }))
  }

  function handleSend(msg) {
    dismissMessage(msg.id)
    setEditing(e => ({ ...e, [msg.id]: false }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-primary">Parent Messages</h1>
          <p className="text-text-muted text-sm">AI drafts · Edit before sending · Multilingual</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setComposeOpen(true)} className="px-3 py-2 rounded-pill text-xs font-semibold" style={{ background: 'var(--school-color)', color: 'white' }}>
            ✏ New Message
          </button>
          <button onClick={() => setTemplateOpen(true)} className="px-3 py-2 rounded-pill text-xs font-semibold" style={{ background: '#1e2231', color: '#6b7494' }}>
            Templates
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['pending', 'sent', 'all'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-pill text-sm font-semibold capitalize transition-all"
            style={{ background: tab === t ? 'var(--school-color)' : '#1e2231', color: tab === t ? 'white' : '#6b7494' }}>
            {t}
            {t === 'pending' && messages.filter(m => m.status === 'pending').length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold" style={{ background: '#f04a4a', color: 'white' }}>
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
            const isPositive = showPositive[msg.id]
            const currentDraft = isPositive ? msg.positiveDraft : msg.draft
            const isEditing = editing[msg.id]

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
                      <Tag color={msg.status === 'pending' ? '#f5a623' : '#22c97a'}>{msg.status}</Tag>
                      <div className="flex gap-1">
                        {['👍', '❤️', '😂'].map(r => (
                          <button key={r} onClick={() => reactHeader(msg.id, r)}
                            className="flex items-center gap-0.5 hover:scale-125 transition-transform text-sm" title="React">
                            {r}{headerReactions[`${msg.id}-${r}`] > 0 && <span style={{fontSize:'9px',color:'#6b7494'}}>{headerReactions[`${msg.id}-${r}`]}</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-text-muted" style={{ fontSize: '10px' }}>AI tone: {msg.tone}</p>
                </div>

                {/* Positive/Negative toggle */}
                <div className="px-4 pt-3">
                  <div className="flex rounded-pill overflow-hidden mb-3" style={{ background: '#1e2231' }}>
                    <button
                      onClick={() => { setShowPositive(p => ({ ...p, [msg.id]: false })); setEditing(e => ({ ...e, [msg.id]: false })) }}
                      className="flex-1 py-1.5 text-xs font-bold transition-all"
                      style={{ background: !isPositive ? '#f04a4a' : 'transparent', color: !isPositive ? 'white' : '#6b7494', borderRadius: '999px 0 0 999px' }}
                    >
                      ⚑ Concern
                    </button>
                    <button
                      onClick={() => { setShowPositive(p => ({ ...p, [msg.id]: true })); setEditing(e => ({ ...e, [msg.id]: false })) }}
                      className="flex-1 py-1.5 text-xs font-bold transition-all"
                      style={{ background: isPositive ? '#22c97a' : 'transparent', color: isPositive ? 'white' : '#6b7494', borderRadius: '0 999px 999px 0' }}
                    >
                      🌟 Positive
                    </button>
                  </div>
                </div>

                {/* Message body */}
                <div className="px-4 pb-3">
                  {generating === msg.id ? (
                    <LoadingSpinner />
                  ) : isEditing ? (
                    <div className="mb-3">
                      <textarea
                        className="w-full p-3 rounded-card text-sm text-text-primary resize-none border border-accent"
                        style={{ background: '#1e2231', minHeight: 80 }}
                        value={editText[msg.id] ?? currentDraft}
                        onChange={e => setEditText(t => ({ ...t, [msg.id]: e.target.value }))}
                        autoFocus
                      />
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => saveEdit(msg)} className="flex-1 py-1.5 rounded-pill text-xs font-bold" style={{ background: '#3b7ef4', color: 'white' }}>
                          💾 Save Changes
                        </button>
                        <button onClick={() => setEditing(e => ({ ...e, [msg.id]: false }))} className="px-4 py-1.5 rounded-pill text-xs" style={{ background: '#1e2231', color: '#6b7494' }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-card mb-3" style={{ background: '#1e2231' }}>
                      <p className="text-sm text-text-primary leading-relaxed">{currentDraft}</p>
                    </div>
                  )}

                  {/* Action buttons */}
                  {msg.status === 'pending' && !isEditing && (
                    <div className="flex gap-2">
                      <button onClick={() => handleSend(msg)} className="flex-1 py-2 rounded-pill text-xs font-bold" style={{ background: '#22c97a20', color: '#22c97a' }}>
                        Send ✓
                      </button>
                      <button onClick={() => startEditing(msg)} className="flex-1 py-2 rounded-pill text-xs font-bold" style={{ background: '#3b7ef420', color: '#3b7ef4' }}>
                        ✏ Edit
                      </button>
                      <button onClick={() => handleRegenerate(msg)} className="flex-1 py-2 rounded-pill text-xs font-bold" style={{ background: '#9b6ef520', color: '#9b6ef5' }}>
                        ✨ AI
                      </button>
                      <button onClick={() => dismissMessage(msg.id)} className="px-3 py-2 rounded-pill text-xs font-bold" style={{ background: '#f04a4a20', color: '#f04a4a' }}>
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* Auto-send toggle */}
                <div className="px-4 pb-4">
                  <button onClick={() => setAutoSend(a => ({ ...a, [msg.id]: !a[msg.id] }))} className="w-full flex items-center justify-between p-2 rounded-card transition-all" style={{ background: '#1e2231' }}>
                    <span className="text-xs text-text-muted">Auto-send "{msg.trigger}" messages</span>
                    <div className="w-9 h-5 rounded-full flex items-center px-0.5 transition-all" style={{ background: autoSend[msg.id] ? 'var(--school-color)' : '#2a2f42' }}>
                      <div className="w-4 h-4 rounded-full bg-white transition-all" style={{ marginLeft: autoSend[msg.id] ? 'auto' : 0 }} />
                    </div>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Compose new message modal */}
      {composeOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setComposeOpen(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-card border border-elevated rounded-t-widget p-6 w-full max-w-lg animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-text-primary">✏ New Message to Parent</p>
              <button onClick={() => setComposeOpen(false)} className="text-text-muted hover:text-text-primary text-xl">✕</button>
            </div>
            <div className="space-y-3 mb-4">
              <div>
                <label className="tag-label block mb-1">Student Name</label>
                <input
                  className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-sm text-text-primary"
                  placeholder="e.g. Marcus Thompson"
                  value={composeForm.to}
                  onChange={e => setComposeForm(f => ({ ...f, to: e.target.value }))}
                />
              </div>
              <div>
                <label className="tag-label block mb-1">Subject (optional)</label>
                <input
                  className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-sm text-text-primary"
                  placeholder="e.g. Homework, Behavior, Great work"
                  value={composeForm.subject}
                  onChange={e => setComposeForm(f => ({ ...f, subject: e.target.value }))}
                />
              </div>
              <div>
                <label className="tag-label block mb-1">Message</label>
                <textarea
                  className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-sm text-text-primary resize-none"
                  rows={5}
                  placeholder="Write your message to the parent..."
                  value={composeForm.body}
                  onChange={e => setComposeForm(f => ({ ...f, body: e.target.value }))}
                  autoFocus
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={sendComposed}
                disabled={!composeForm.to || !composeForm.body}
                className="flex-1 py-2.5 rounded-pill text-sm font-bold disabled:opacity-40"
                style={{ background: 'var(--school-color)', color: 'white' }}
              >
                Add to Queue →
              </button>
              <button onClick={() => setComposeOpen(false)} className="px-4 py-2.5 rounded-pill text-sm" style={{ background: '#1e2231', color: '#6b7494' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template editor */}
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
              <button onClick={() => setTemplateOpen(false)} className="px-4 py-2.5 rounded-pill text-sm" style={{ background: '#1e2231', color: '#6b7494' }}>
                Reset to AI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
