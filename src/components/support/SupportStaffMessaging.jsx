// src/components/support/SupportStaffMessaging.jsx
import React, { useState } from 'react'
import { useStore } from '../../lib/store'
import RecipientSelector from './RecipientSelector'
import AIAssistantPanel from './AIAssistantPanel'
import ParentAIAssistantPanel from '../parents/ParentAIAssistantPanel'

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

export default function SupportStaffMessaging({ 
  onClose, 
  preselectedStudentIds = [], 
  preselectedMode = 'students' 
}) {
  const { sendSupportStaffMessage } = useStore()
  const [showAI, setShowAI] = useState(false)
  const [showParentAI, setShowParentAI] = useState(false)

  const [selectedRecipientIds, setSelectedRecipientIds] = useState(preselectedStudentIds)
  const [recipientMode, setRecipientMode] = useState(preselectedMode)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSend() {
    if (!subject.trim()) { setError('Please enter a subject.'); return }
    if (!body.trim()) { setError('Please enter a message.'); return }
    if (selectedRecipientIds.length === 0) {
      setError('Please select at least one recipient.'); return
    }
    setError('')
    setSending(true)

    try {
      await sendSupportStaffMessage({
        recipientMode,
        recipientIds: selectedRecipientIds,
        subject,
        body
      })

      setSending(false)
      setSent(true)
    } catch (err) {
      setSending(false)
      setError('Failed to send message. Please try again.')
    }
  }

  function handleRecipientsChange(ids, mode) {
    setSelectedRecipientIds(ids)
    setRecipientMode(mode)
  }

  // ── Sent confirmation ──────────────────────────────────────────────────────
  if (sent) return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign:'center', padding:'40px 20px' }}>
          <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
          <div style={{ fontSize:18, fontWeight:800, color:C.text, marginBottom:8 }}>Message Sent!</div>
          <div style={{ fontSize:13, color:C.muted, marginBottom:24 }}>
            Your message was delivered to {selectedRecipientIds.length} {recipientMode}.
          </div>
          <button onClick={onClose} style={btnStyle(C.teal)}>Done</button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:C.text }}>💬 New Message</div>
            <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>
              Support Staff Messaging
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {recipientMode === 'parents' && (
              <>
                <button
                  onClick={() => setShowParentAI(true)}
                  style={{
                    background: C.teal,
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 12px',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  👨‍👩‍👧‍👦 Parent AI
                </button>
                <button
                  onClick={() => setShowAI(true)}
                  style={{
                    background: C.blue,
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 12px',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  🤖 AI Draft
                </button>
                <button
                  onClick={() => setShowParentAI(true)}
                  style={{
                    background: C.purple,
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 12px',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  ✏️ Rewrite
                </button>
              </>
            )}
            {recipientMode !== 'parents' && (
              <button
                onClick={() => setShowAI(true)}
                style={{
                  background: C.blue,
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 12px',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                🤖 AI
              </button>
            )}
            <button 
              onClick={onClose} 
              style={{ 
                background:C.inner, border:'none', borderRadius:999, width:32, height:32, 
                color:C.soft, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' 
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Recipient Selector */}
        <div style={{ marginBottom:20 }}>
          <RecipientSelector
            mode={preselectedMode}
            preselectedStudentIds={preselectedStudentIds}
            onRecipientsChange={handleRecipientsChange}
          />
        </div>

        {/* Subject */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>
            Subject
          </div>
          <input
            value={subject}
            onChange={e => { setSubject(e.target.value); setError('') }}
            placeholder="e.g. Weekly Check-in, Academic Support, Parent Conference"
            style={inputStyle}
          />
        </div>

        {/* Message */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>
            Message
          </div>
          <textarea
            value={body}
            onChange={e => { setBody(e.target.value); setError('') }}
            placeholder="Write your message here..."
            rows={6}
            style={{ 
              ...inputStyle, 
              resize:'vertical', 
              minHeight:120, 
              fontFamily:'inherit',
              lineHeight:1.5
            }}
          />
        </div>

        {/* Quick templates */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>
            Quick Templates
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {[
              { label: 'Check-in', template: 'Just checking in to see how things are going and if you need any support this week.' },
              { label: 'Academic Support', template: 'I noticed you might benefit from some additional academic support. Let\'s discuss available resources.' },
              { label: 'Positive Update', template: 'Great progress this week! Keep up the excellent work.' },
              { label: 'Meeting Request', template: 'I\'d like to schedule a meeting to discuss your progress and goals.' }
            ].map(tpl => (
              <button
                key={tpl.label}
                onClick={() => setBody(tpl.template)}
                style={{
                  background:C.inner, border:`1px solid ${C.border}`, borderRadius:8,
                  padding:'6px 10px', fontSize:10, color:C.soft, cursor:'pointer',
                  transition:'all 0.15s'
                }}
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ 
            background:`${C.red}15`, border:`1px solid ${C.red}30`, borderRadius:10, 
            padding:'8px 12px', fontSize:11, color:C.red, marginBottom:16 
          }}>
            {error}
          </div>
        )}

        {/* Send button */}
        <button 
          onClick={handleSend} 
          disabled={sending || selectedRecipientIds.length === 0}
          style={{ 
            width:'100%', 
            background: sending || selectedRecipientIds.length === 0 ? C.inner : 'var(--school-color)', 
            color: sending || selectedRecipientIds.length === 0 ? C.muted : '#fff', 
            border:'none', borderRadius:14, padding:'13px', fontSize:14, fontWeight:700, 
            cursor: sending || selectedRecipientIds.length === 0 ? 'not-allowed' : 'pointer', 
            transition:'all 0.15s' 
          }}
        >
          {sending ? 'Sending…' : `📤 Send to ${selectedRecipientIds.length} ${recipientMode}`}
        </button>

        {/* Permission notice */}
        <div style={{ fontSize:10, color:C.muted, textAlign:'center', marginTop:10, lineHeight:1.5 }}>
          As support staff you can send messages to students, parents, teachers, and administrators.
          All communications are logged for compliance.
        </div>
      </div>

      {/* AI Assistant Panel */}
      <AIAssistantPanel
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        initialContext={{ 
          screen: 'messaging',
          recipientMode: recipientMode,
          selectedRecipientIds: selectedRecipientIds,
          subject: subject,
          body: body
        }}
      />

      {/* Parent AI Assistant Panel */}
      <ParentAIAssistantPanel
        isOpen={showParentAI}
        onClose={() => setShowParentAI(false)}
        initialContext={{ 
          screen: 'parentMessaging',
          recipientMode: recipientMode,
          selectedRecipientIds: selectedRecipientIds,
          subject: subject,
          body: body
        }}
      />
    </div>
  )
}

// ─── Style helpers ────────────────────────────────────────────────────────────
const overlayStyle = {
  position:'fixed', inset:0, zIndex:500,
  background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)',
  display:'flex', alignItems:'flex-end', justifyContent:'center',
}

const panelStyle = {
  width:'100%', maxWidth:480,
  background:'#060810',
  borderRadius:'24px 24px 0 0',
  border:'1px solid rgba(255,255,255,0.08)',
  padding:'24px 20px max(28px,env(safe-area-inset-bottom))',
  maxHeight:'90vh', overflowY:'auto',
}

const inputStyle = {
  width:'100%', background:'#1a1f2e', border:'1px solid #252b3d',
  borderRadius:12, padding:'10px 14px', color:'#eef0f8',
  fontSize:13, outline:'none', boxSizing:'border-box',
}

function btnStyle(color) {
  return {
    background: color, color:'#fff', border:'none',
    borderRadius:12, padding:'12px 32px',
    fontSize:13, fontWeight:700, cursor:'pointer',
  }
}
