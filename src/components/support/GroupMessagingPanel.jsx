// src/components/support/GroupMessagingPanel.jsx
import React, { useState } from 'react'
import { useStore } from '../../lib/store'

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

const RECIPIENT_OPTIONS = [
  { id:'all_students', label:'All Students',      icon:'👥', desc:'Message every student in the group' },
  { id:'selected',     label:'Selected Students', icon:'✓',  desc:'Choose specific students'           },
  { id:'parents',      label:'Parents',           icon:'👪', desc:'Message parents of group students'  },
  { id:'teachers',     label:'Teachers',          icon:'👩‍🏫', desc:'Message teachers of group students' },
]

export default function GroupMessagingPanel({ groupId, groupName, students, onClose }) {
  const { sendGroupMessage } = useStore()

  const [recipientMode, setRecipientMode]   = useState('all_students')
  const [selectedIds,   setSelectedIds]     = useState([])
  const [subject,       setSubject]         = useState('')
  const [body,          setBody]            = useState('')
  const [sending,       setSending]         = useState(false)
  const [sent,          setSent]            = useState(false)
  const [error,         setError]           = useState('')

  function toggleStudent(id) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function selectAll()   { setSelectedIds(students.map(s => s.id)) }
  function selectNone()  { setSelectedIds([]) }

  async function handleSend() {
    if (!subject.trim()) { setError('Please enter a subject.'); return }
    if (!body.trim())    { setError('Please enter a message.'); return }
    if (recipientMode === 'selected' && selectedIds.length === 0) {
      setError('Please select at least one student.'); return
    }
    setError('')
    setSending(true)

    const recipients = recipientMode === 'selected'
      ? students.filter(s => selectedIds.includes(s.id))
      : students

    await sendGroupMessage({ groupId, groupName, recipientMode, recipients, subject, body })

    setSending(false)
    setSent(true)
  }

  // ── Sent confirmation ──────────────────────────────────────────────────────
  if (sent) return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign:'center', padding:'40px 20px' }}>
          <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
          <div style={{ fontSize:18, fontWeight:800, color:C.text, marginBottom:8 }}>Message Sent!</div>
          <div style={{ fontSize:13, color:C.muted, marginBottom:24 }}>
            Your message was delivered to {
              recipientMode === 'all_students' ? `all ${students.length} students` :
              recipientMode === 'selected'     ? `${selectedIds.length} student${selectedIds.length !== 1 ? 's' : ''}` :
              recipientMode === 'parents'      ? 'student parents' : 'teachers'
            } in {groupName}.
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
            <div style={{ fontSize:16, fontWeight:800, color:C.text }}>💬 Message Group</div>
            <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{groupName} · {students.length} students</div>
          </div>
          <button onClick={onClose} style={{ background:C.inner, border:'none', borderRadius:999, width:32, height:32, color:C.soft, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
        </div>

        {/* Recipient selector */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Send To</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
            {RECIPIENT_OPTIONS.map(opt => (
              <button key={opt.id} onClick={() => setRecipientMode(opt.id)}
                style={{
                  background: recipientMode === opt.id ? `${C.teal}18` : C.inner,
                  border: `1px solid ${recipientMode === opt.id ? C.teal : C.border}`,
                  borderRadius:12, padding:'10px 12px', cursor:'pointer', textAlign:'left',
                  transition:'all 0.15s',
                }}>
                <div style={{ fontSize:13, marginBottom:3 }}>{opt.icon}</div>
                <div style={{ fontSize:11, fontWeight:700, color: recipientMode === opt.id ? C.teal : C.text }}>{opt.label}</div>
                <div style={{ fontSize:9, color:C.muted, marginTop:2 }}>{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Student selector — shown when 'selected' mode */}
        {recipientMode === 'selected' && (
          <div style={{ marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                Select Students ({selectedIds.length}/{students.length})
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={selectAll}  style={linkBtn}>All</button>
                <button onClick={selectNone} style={linkBtn}>None</button>
              </div>
            </div>
            <div style={{ maxHeight:160, overflowY:'auto', background:C.inner, borderRadius:12, padding:8 }}>
              {students.map(s => (
                <div key={s.id} onClick={() => toggleStudent(s.id)}
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:8, cursor:'pointer', background: selectedIds.includes(s.id) ? `${C.teal}15` : 'transparent', marginBottom:2 }}>
                  <div style={{ width:18, height:18, borderRadius:4, border:`2px solid ${selectedIds.includes(s.id) ? C.teal : C.border}`, background: selectedIds.includes(s.id) ? C.teal : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#fff', flexShrink:0 }}>
                    {selectedIds.includes(s.id) ? '✓' : ''}
                  </div>
                  <span style={{ fontSize:12, fontWeight:600, color:C.text, flex:1 }}>{s.name}</span>
                  <span style={{ fontSize:11, color: s.grade < 70 ? C.red : C.muted }}>{s.grade}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subject */}
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Subject</div>
          <input
            value={subject}
            onChange={e => { setSubject(e.target.value); setError('') }}
            placeholder="e.g. Weekly Check-in"
            style={inputStyle}
          />
        </div>

        {/* Body */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Message</div>
          <textarea
            value={body}
            onChange={e => { setBody(e.target.value); setError('') }}
            placeholder="Write your message here..."
            rows={4}
            style={{ ...inputStyle, resize:'vertical', minHeight:100, fontFamily:'inherit' }}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{ background:`${C.red}15`, border:`1px solid ${C.red}30`, borderRadius:10, padding:'8px 12px', fontSize:11, color:C.red, marginBottom:12 }}>
            {error}
          </div>
        )}

        {/* Send button */}
        <button onClick={handleSend} disabled={sending}
          style={{ width:'100%', background: sending ? C.inner : 'var(--school-color)', color: sending ? C.muted : '#fff', border:'none', borderRadius:14, padding:'13px', fontSize:14, fontWeight:700, cursor: sending ? 'not-allowed' : 'pointer', transition:'all 0.15s' }}>
          {sending ? 'Sending…' : '📤 Send Message'}
        </button>

        {/* Permission notice */}
        <div style={{ fontSize:10, color:C.muted, textAlign:'center', marginTop:10, lineHeight:1.5 }}>
          As support staff you can send messages. You cannot edit grades, attendance, or case notes from this panel.
        </div>
      </div>
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

const linkBtn = {
  background:'none', border:'none', color:'#0fb8a0',
  fontSize:11, fontWeight:700, cursor:'pointer', padding:0,
}

function btnStyle(color) {
  return {
    background: color, color:'#fff', border:'none',
    borderRadius:12, padding:'12px 32px',
    fontSize:13, fontWeight:700, cursor:'pointer',
  }
}
