import React, { useState } from 'react'
import { useStore } from '../lib/store'

const C = { bg:'#060810',card:'#161923',inner:'#1e2231',text:'#eef0f8',muted:'#6b7494',border:'#2a2f42',green:'#22c97a',blue:'#3b7ef4',red:'#f04a4a',amber:'#f5a623',purple:'#9b6ef5' }

export default function ParentMessages({ onBack }) {
  const { messages, updateMessage, sendMessage, dismissMessage, goBack } = useStore()
  const handleBack = onBack || goBack
  const [tab,      setTab]      = useState('pending')
  const [selected, setSelected] = useState(null)
  const [editing,  setEditing]  = useState(false)
  const [draftText, setDraftText] = useState('')
  const [showPositive, setShowPositive] = useState(false)
  const [composing, setComposing] = useState(false)
  const [newMsg, setNewMsg]     = useState({ to: '', subject: '', body: '' })
  const [sent, setSent]         = useState(false)

  const filtered = messages.filter(m => {
    if (tab === 'pending') return m.status === 'pending'
    if (tab === 'sent')    return m.status === 'sent'
    return m.status !== 'dismissed'
  })

  function openMessage(m) {
    setSelected(m)
    setDraftText(m.draft)
    setEditing(false)
    setShowPositive(false)
    setSent(false)
  }

  function handleSend() {
    sendMessage(selected.id)
    setSent(true)
    setSelected(null)
  }

  function handleEdit() {
    if (editing) updateMessage(selected.id, { draft: draftText })
    setEditing(e => !e)
  }

  const REACTIONS = ['👍','❤️','😂','🙌','😮']

  if (selected && !composing) return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', paddingBottom:80 }}>
      <div style={{ padding:'20px 16px 0', display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <button onClick={() => setSelected(null)} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
        <h1 style={{ fontSize:18, fontWeight:800, margin:0 }}>📩 {selected.studentName}</h1>
      </div>

      {/* Status banner */}
      <div style={{ margin:'0 16px 14px', padding:'10px 14px', borderRadius:14, background: selected.status==='sent' ? '#0f2a1a' : '#1c1012', border:`1px solid ${selected.status==='sent' ? C.green : C.red}30`, display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:16 }}>{selected.status==='sent' ? '✅' : '⚑'}</span>
        <div>
          <div style={{ fontWeight:700, fontSize:13, color:C.text }}>{selected.studentName} · {selected.subject}</div>
          <div style={{ fontSize:11, color:C.muted }}>{selected.trigger} · AI drafted · {selected.tone}</div>
        </div>
      </div>

      {/* Positive/Negative toggle */}
      <div style={{ margin:'0 16px 10px', display:'flex', gap:6 }}>
        <button onClick={() => setShowPositive(false)} style={{ flex:1, padding:'8px', borderRadius:12, border:`1.5px solid ${!showPositive ? C.red : C.border}`, background:!showPositive ? 'rgba(240,74,74,0.12)' : C.inner, color:!showPositive ? C.red : C.muted, fontSize:12, fontWeight:700, cursor:'pointer' }}>⚑ Concern</button>
        <button onClick={() => setShowPositive(true)}  style={{ flex:1, padding:'8px', borderRadius:12, border:`1.5px solid ${showPositive ? C.green : C.border}`, background:showPositive ? 'rgba(34,201,122,0.12)' : C.inner, color:showPositive ? C.green : C.muted, fontSize:12, fontWeight:700, cursor:'pointer' }}>🌟 Positive</button>
      </div>

      {/* Draft */}
      <div style={{ margin:'0 16px 14px', background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
          <span style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em' }}>Message Draft</span>
          <button onClick={handleEdit} style={{ background:`${C.blue}22`, color:C.blue, border:'none', borderRadius:8, padding:'4px 10px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
            {editing ? '💾 Save' : '✏ Edit'}
          </button>
        </div>
        {editing ? (
          <textarea
            style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 12px', color:C.text, fontSize:13, resize:'none', boxSizing:'border-box', lineHeight:1.6 }}
            rows={5} value={draftText} onChange={e => setDraftText(e.target.value)}
          />
        ) : (
          <p style={{ fontSize:13, color:'#c0c8e0', lineHeight:1.7, margin:0 }}>
            {showPositive ? selected.positiveDraft : (editing ? draftText : selected.draft)}
          </p>
        )}
        <div style={{ display:'flex', gap:6, marginTop:10, flexWrap:'wrap' }}>
          {REACTIONS.map(r => <button key={r} style={{ background:C.inner, border:`1px solid ${C.border}`, borderRadius:8, padding:'4px 8px', cursor:'pointer', fontSize:14 }}>{r}</button>)}
        </div>
      </div>

      {/* Actions */}
      {selected.status === 'pending' ? (
        <div style={{ padding:'0 16px', display:'flex', gap:8 }}>
          <button onClick={handleSend}                      style={{ flex:1, background:`${C.green}22`, color:C.green, border:'none', borderRadius:12, padding:'12px', fontSize:13, fontWeight:700, cursor:'pointer' }}>Send ✓</button>
          <button onClick={() => { dismissMessage(selected.id); setSelected(null) }} style={{ flex:1, background:`${C.red}22`,   color:C.red,   border:'none', borderRadius:12, padding:'12px', fontSize:13, fontWeight:700, cursor:'pointer' }}>✕ Skip</button>
        </div>
      ) : (
        <div style={{ margin:'0 16px', padding:'12px 14px', background:C.inner, borderRadius:12, textAlign:'center', color:C.muted, fontSize:13 }}>
          ✅ Message sent
        </div>
      )}
    </div>
  )

  if (composing) return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', paddingBottom:80 }}>
      <div style={{ padding:'20px 16px 0', display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <button onClick={() => setComposing(false)} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
        <h1 style={{ fontSize:18, fontWeight:800, margin:0 }}>✉ New Message</h1>
      </div>
      <div style={{ padding:'0 16px' }}>
        {[['to','To (Parent name or email)','text'],['subject','Subject','text'],['body','Message body','textarea']].map(([key, label, type]) => (
          <div key={key} style={{ marginBottom:12 }}>
            <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:C.muted, marginBottom:6 }}>{label}</label>
            {type === 'textarea' ? (
              <textarea rows={6} style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 14px', color:C.text, fontSize:13, resize:'none', boxSizing:'border-box' }}
                value={newMsg[key]} onChange={e => setNewMsg(m => ({ ...m, [key]: e.target.value }))} />
            ) : (
              <input type="text" style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 14px', color:C.text, fontSize:13, outline:'none', boxSizing:'border-box' }}
                value={newMsg[key]} onChange={e => setNewMsg(m => ({ ...m, [key]: e.target.value }))} />
            )}
          </div>
        ))}
        {sent && <div style={{ background:'#0f2a1a', border:`1px solid ${C.green}40`, borderRadius:10, padding:'10px 14px', color:C.green, fontSize:13, marginBottom:12 }}>✅ Message sent!</div>}
        <button onClick={() => { setSent(true); setTimeout(() => { setComposing(false); setSent(false) }, 1500) }}
          style={{ width:'100%', background:'var(--school-color)', color:'#fff', border:'none', borderRadius:999, padding:'14px', fontSize:15, fontWeight:800, cursor:'pointer' }}>
          Send Message
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', paddingBottom:80 }}>
      <div style={{ padding:'20px 16px 0', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {handleBack && <button onClick={handleBack} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>}
          <div>
            <h1 style={{ fontSize:22, fontWeight:800, margin:'0 0 4px' }}>Parent Messages</h1>
            <p style={{ fontSize:12, color:C.muted, margin:0 }}>Every negative has a positive version · AI writes both</p>
          </div>
        </div>
        <button onClick={() => setComposing(true)} style={{ background:'var(--school-color)', border:'none', borderRadius:12, padding:'10px 16px', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>+ New</button>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:6, padding:'0 16px', marginBottom:16 }}>
        {['pending','sent','all'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding:'7px 16px', borderRadius:999, border:'none', cursor:'pointer', fontSize:12, fontWeight:700,
              background: tab===t ? 'var(--school-color)' : C.inner,
              color:       tab===t ? '#fff' : C.muted }}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
            {t==='pending' && <span style={{ marginLeft:6, background:'rgba(240,74,74,0.3)', color:'#f04a4a', borderRadius:999, padding:'1px 6px', fontSize:10 }}>{messages.filter(m=>m.status==='pending').length}</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:40, color:C.muted }}>
          <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
          <p>No {tab} messages.</p>
        </div>
      ) : filtered.map(m => (
        <div key={m.id} onClick={() => openMessage(m)}
          style={{ margin:'0 16px 10px', background: m.status==='pending' ? '#1c1012' : C.card, border:`1px solid ${m.status==='pending' ? C.red : C.border}30`, borderRadius:16, padding:'14px 16px', cursor:'pointer' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--school-color)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = m.status==='pending' ? 'rgba(240,74,74,0.3)' : C.border}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
            <div>
              <span style={{ fontWeight:700, fontSize:14, color:C.text }}>{m.status==='pending' ? '⚑' : '🌟'} {m.studentName}</span>
              <span style={{ color:C.muted, fontSize:12, marginLeft:8 }}>{m.subject} · {m.trigger}</span>
            </div>
            <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:999,
              background: m.status==='pending' ? 'rgba(245,166,35,0.15)' : 'rgba(34,201,122,0.15)',
              color:      m.status==='pending' ? C.amber : C.green }}>
              {m.status==='pending' ? 'Pending' : 'Sent ✓'}
            </span>
          </div>
          <p style={{ fontSize:12, color:'#8090a8', margin:'0 0 8px', lineHeight:1.5, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
            {m.draft}
          </p>
          <div style={{ fontSize:10, color:C.muted }}>AI drafted · {m.tone}</div>
        </div>
      ))}
    </div>
  )
}
