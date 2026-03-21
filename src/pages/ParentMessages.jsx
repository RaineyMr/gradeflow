import React, { useState } from 'react'
import { callAI } from '../lib/ai'

const C = {
  bg:'#060810', card:'#161923', inner:'#1e2231', border:'#2a2f42',
  text:'#eef0f8', muted:'#6b7494', green:'#22c97a', blue:'#3b7ef4',
  red:'#f04a4a', amber:'#f5a623', purple:'#9b6ef5', teal:'#0fb8a0',
}

const INITIAL_THREADS = [
  {
    id:1,
    parent:{ name:'Ms. Thompson', student:'Aaliyah Brooks' },
    subject:'Concern about math homework load',
    status:'pending',
    trigger:'Parent outreach',
    tone:'Concerned',
    preview:'Hi Ms. Johnson, Aaliyah has been struggling with the nightly homework...',
    unread:true,
    messages:[
      { id:1, from:'parent', author:'Ms. Thompson', content:"Hi Ms. Johnson, Aaliyah has been struggling with the nightly math homework. She spends over 2 hours on it and gets very frustrated. Is there anything we can do to help her at home?", time:'2h ago' },
    ],
  },
  {
    id:2,
    parent:{ name:'Mr. Brooks', student:'Marcus Thompson' },
    subject:'Great improvement this month!',
    status:'sent',
    trigger:'Grade improvement',
    tone:'Positive',
    preview:'Dear Mr. Brooks, I wanted to share that Marcus has shown tremendous...',
    unread:false,
    messages:[
      { id:1, from:'teacher', author:'Ms. Johnson', content:"Dear Mr. Brooks, I wanted to share that Marcus has shown tremendous improvement this month! His quiz scores have gone from 72% to 88%. He's clearly been putting in the work.", time:'Yesterday' },
      { id:2, from:'parent', author:'Mr. Brooks', content:"Thank you so much Ms. Johnson! We've been working with him every evening. So glad to see it paying off!", time:'Yesterday' },
    ],
  },
  {
    id:3,
    parent:{ name:'Dr. Rodriguez', student:'Sofia Rodriguez' },
    subject:'Missing assignment — Chapter 3 worksheet',
    status:'pending',
    trigger:'Missing assignment',
    tone:'Informational',
    preview:'Hi Dr. Rodriguez, I wanted to let you know that Sofia has a missing...',
    unread:true,
    messages:[
      { id:1, from:'teacher', author:'Ms. Johnson', content:"Hi Dr. Rodriguez, I wanted to let you know that Sofia has a missing assignment from last week — the Chapter 3 fractions worksheet. Her overall grade is at 87% but this missing work could affect her standing.", time:'3h ago' },
    ],
  },
  {
    id:4,
    parent:{ name:'Ms. Kim', student:'James Kim' },
    subject:'Attendance concern — 3 tardies this week',
    status:'pending',
    trigger:'Attendance',
    tone:'Supportive',
    preview:'Dear Ms. Kim, I wanted to reach out about James\'s attendance...',
    unread:true,
    messages:[
      { id:1, from:'teacher', author:'Ms. Johnson', content:"Dear Ms. Kim, I wanted to reach out about James's attendance. He's had 3 tardies this week which is causing him to miss the beginning of our daily warm-up. Is everything okay? Happy to support in any way.", time:'1h ago' },
    ],
  },
]

export default function ParentMessages({ onBack, currentUser }) {
  const [threads, setThreads]       = useState(INITIAL_THREADS)
  const [activeThread, setActiveThread] = useState(null)
  const [filter, setFilter]         = useState('all')
  const [reply, setReply]           = useState('')
  const [aiDrafting, setAiDrafting] = useState(false)
  const [aiDraft, setAiDraft]       = useState('')
  const [sent, setSent]             = useState(false)
  const [composing, setComposing]   = useState(false)
  const [newMsg, setNewMsg]         = useState({ to:'', subject:'', body:'' })

  const thread = activeThread ? threads.find(t => t.id === activeThread) : null

  const filtered = filter === 'all'     ? threads
    : filter === 'pending'  ? threads.filter(t => t.status === 'pending')
    : filter === 'unread'   ? threads.filter(t => t.unread)
    : threads

  async function generateAIDraft() {
    if (!thread) return
    setAiDrafting(true)
    try {
      const prompt = `You are a caring elementary school teacher named Ms. Johnson. Write a warm, professional reply to this parent message about ${thread.parent.student}.

Parent: ${thread.parent.name}
Subject: ${thread.subject}
Their message: "${thread.messages[thread.messages.length-1].content}"
Tone needed: ${thread.tone}

Write a 2-3 sentence reply. Be warm, specific, and solution-focused. No greeting or sign-off needed — just the body.`
      const draft = await callAI(prompt)
      setAiDraft(draft.trim())
      setReply(draft.trim())
    } catch (e) {
      setAiDraft('')
    }
    setAiDrafting(false)
  }

  function sendReply() {
    if (!reply.trim() || !thread) return
    const newMessage = { id:Date.now(), from:'teacher', author:'Ms. Johnson', content:reply.trim(), time:'Just now' }
    setThreads(prev => prev.map(t => {
      if (t.id !== thread.id) return t
      return { ...t, status:'sent', unread:false, messages:[...t.messages, newMessage] }
    }))
    setReply('')
    setAiDraft('')
    setSent(true)
    setTimeout(() => setSent(false), 2000)
  }

  function sendNewMessage() {
    if (!newMsg.body.trim()) return
    const newThread = {
      id: Date.now(),
      parent: { name:newMsg.to || 'Parent', student:'' },
      subject: newMsg.subject || 'Message from teacher',
      status: 'sent', trigger:'Manual', tone:'Informational',
      preview: newMsg.body.substring(0,60)+'...',
      unread: false,
      messages:[{ id:1, from:'teacher', author:'Ms. Johnson', content:newMsg.body, time:'Just now' }],
    }
    setThreads(prev => [newThread, ...prev])
    setNewMsg({ to:'', subject:'', body:'' })
    setComposing(false)
  }

  const unreadCount = threads.filter(t => t.unread).length
  const pendingCount = threads.filter(t => t.status === 'pending').length

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', paddingBottom:40 }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#0f1a2a,#060810)', padding:'20px 16px 20px', borderBottom:`1px solid ${C.border}` }}>
        <button onClick={activeThread ? () => { setActiveThread(null); setReply(''); setAiDraft('') } : onBack}
          style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:600, marginBottom:12 }}>
          ← {activeThread ? 'Inbox' : 'Back'}
        </button>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>
            {activeThread ? thread?.subject : '💬 Parent Messages'}
          </h1>
          {!activeThread && (
            <button onClick={() => setComposing(true)}
              style={{ background:'var(--school-color,#f97316)', color:'#fff', border:'none', borderRadius:10, padding:'8px 14px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
              + New
            </button>
          )}
        </div>
        {!activeThread && (
          <div style={{ display:'flex', gap:10, marginTop:8 }}>
            <span style={{ fontSize:10, background:`${C.red}22`, color:C.red, borderRadius:999, padding:'2px 8px', fontWeight:700 }}>{pendingCount} pending</span>
            <span style={{ fontSize:10, background:`${C.amber}22`, color:C.amber, borderRadius:999, padding:'2px 8px', fontWeight:700 }}>{unreadCount} unread</span>
          </div>
        )}
      </div>

      {/* Compose new message modal */}
      {composing && (
        <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:'20px 20px 0 0', padding:20, width:'100%', maxWidth:480 }}>
            <h3 style={{ margin:'0 0 14px', color:C.text, fontSize:15 }}>New Message to Parent</h3>
            <input value={newMsg.to} onChange={e => setNewMsg(m => ({ ...m, to:e.target.value }))} placeholder="Parent name..."
              style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:10, padding:'9px 12px', color:C.text, fontSize:12, marginBottom:8, boxSizing:'border-box', outline:'none' }} />
            <input value={newMsg.subject} onChange={e => setNewMsg(m => ({ ...m, subject:e.target.value }))} placeholder="Subject..."
              style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:10, padding:'9px 12px', color:C.text, fontSize:12, marginBottom:8, boxSizing:'border-box', outline:'none' }} />
            <textarea rows={4} value={newMsg.body} onChange={e => setNewMsg(m => ({ ...m, body:e.target.value }))} placeholder="Message..."
              style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:10, padding:'9px 12px', color:C.text, fontSize:12, resize:'none', marginBottom:10, boxSizing:'border-box', lineHeight:1.6, outline:'none' }} />
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={sendNewMessage} style={{ flex:1, background:'var(--school-color,#f97316)', color:'#fff', border:'none', borderRadius:999, padding:12, fontSize:14, fontWeight:700, cursor:'pointer' }}>Send</button>
              <button onClick={() => setComposing(false)} style={{ flex:1, background:C.inner, color:C.muted, border:'none', borderRadius:999, padding:12, fontSize:13, cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding:'12px 16px' }}>
        {/* Thread view */}
        {activeThread && thread && (
          <div>
            {/* Thread meta */}
            <div style={{ background:C.inner, borderRadius:14, padding:'10px 14px', marginBottom:12 }}>
              <div style={{ fontSize:11, color:C.muted, marginBottom:2 }}>
                {thread.parent.name} {thread.parent.student ? `· Re: ${thread.parent.student}` : ''}
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:999, background:`${C.amber}22`, color:C.amber }}>{thread.trigger}</span>
                <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:999, background:`${C.blue}22`, color:C.blue }}>{thread.tone}</span>
                <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:999,
                  background:thread.status==='sent'?`${C.green}22`:`${C.amber}22`,
                  color:thread.status==='sent'?C.green:C.amber }}>
                  {thread.status==='sent'?'✓ Replied':'Pending Reply'}
                </span>
              </div>
            </div>

            {/* Messages */}
            {thread.messages.map(msg => (
              <div key={msg.id} style={{
                marginBottom:10,
                display:'flex',
                flexDirection:'column',
                alignItems:msg.from==='teacher'?'flex-end':'flex-start',
              }}>
                <div style={{ fontSize:10, color:C.muted, marginBottom:4, paddingLeft:msg.from==='teacher'?0:4, paddingRight:msg.from==='teacher'?4:0 }}>
                  {msg.author} · {msg.time}
                </div>
                <div style={{
                  maxWidth:'85%',
                  background:msg.from==='teacher'?'var(--school-color,#f97316)':C.inner,
                  borderRadius:msg.from==='teacher'?'16px 4px 16px 16px':'4px 16px 16px 16px',
                  padding:'12px 14px',
                  fontSize:13,
                  color:msg.from==='teacher'?'#fff':C.text,
                  lineHeight:1.6,
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Reply area */}
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:14, marginTop:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <span style={{ fontSize:11, fontWeight:700, color:C.muted }}>Reply to {thread.parent.name}</span>
                <button onClick={generateAIDraft} disabled={aiDrafting}
                  style={{ background:`${C.purple}22`, color:C.purple, border:'none', borderRadius:8, padding:'4px 10px', fontSize:10, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                  {aiDrafting ? '⏳ Drafting...' : '✨ AI Draft'}
                </button>
              </div>

              {aiDraft && (
                <div style={{ background:`${C.purple}12`, border:`1px solid ${C.purple}30`, borderRadius:10, padding:'8px 10px', marginBottom:8, fontSize:11, color:C.purple, lineHeight:1.5 }}>
                  ✨ AI suggested: "{aiDraft.substring(0,80)}..." · Editing above ↓
                </div>
              )}

              <textarea rows={4} value={reply} onChange={e => setReply(e.target.value)} placeholder="Write your reply..."
                style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 12px', color:C.text, fontSize:13, resize:'none', boxSizing:'border-box', lineHeight:1.6, outline:'none' }} />

              {sent && (
                <div style={{ background:'#0f2a1a', border:`1px solid ${C.green}40`, borderRadius:8, padding:'6px 10px', color:C.green, fontSize:11, margin:'6px 0' }}>
                  ✅ Message sent to {thread.parent.name}!
                </div>
              )}

              <div style={{ display:'flex', gap:8, marginTop:8 }}>
                <button onClick={sendReply} disabled={!reply.trim()}
                  style={{ flex:1, background:reply.trim()?'var(--school-color,#f97316)':'#1e2231', color:reply.trim()?'#fff':C.muted, border:'none', borderRadius:12, padding:11, fontSize:13, fontWeight:700, cursor:reply.trim()?'pointer':'not-allowed' }}>
                  Send Reply
                </button>
                {reply.trim() && (
                  <button onClick={() => { setReply(''); setAiDraft('') }}
                    style={{ background:C.inner, color:C.muted, border:'none', borderRadius:12, padding:'11px 14px', fontSize:12, cursor:'pointer' }}>
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Inbox list */}
        {!activeThread && (
          <>
            <div style={{ display:'flex', gap:6, marginBottom:14, overflowX:'auto', paddingBottom:2 }}>
              {[['all','All'],['pending','⏳ Pending'],['unread','🔵 Unread']].map(([id, label]) => (
                <button key={id} onClick={() => setFilter(id)}
                  style={{ background:filter===id?'var(--school-color,#f97316)':C.inner, color:filter===id?'#fff':C.muted, border:'none', borderRadius:999, padding:'6px 14px', fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
                  {label}
                </button>
              ))}
            </div>

            {filtered.map(t => (
              <div key={t.id} onClick={() => {
                setActiveThread(t.id)
                setThreads(prev => prev.map(th => th.id===t.id ? { ...th, unread:false } : th))
              }}
                style={{ background:t.unread?`${C.amber}08`:C.card, border:`1px solid ${t.unread?C.amber+'40':C.border}`, borderRadius:16, padding:'14px 16px', marginBottom:8, cursor:'pointer', transition:'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='var(--school-color,#f97316)'}
                onMouseLeave={e => e.currentTarget.style.borderColor=t.unread?C.amber+'40':C.border}>

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{t.parent.name}</div>
                    {t.parent.student && <div style={{ fontSize:10, color:C.muted }}>Re: {t.parent.student}</div>}
                  </div>
                  <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                    {t.unread && <div style={{ width:8, height:8, borderRadius:'50%', background:C.amber }} />}
                    <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:999,
                      background:t.status==='sent'?`${C.green}22`:`${C.amber}22`,
                      color:t.status==='sent'?C.green:C.amber }}>
                      {t.status==='sent'?'Replied':'Pending'}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:4 }}>{t.subject}</div>
                <p style={{ fontSize:11, color:C.muted, margin:0, lineHeight:1.5 }}>{t.preview}</p>

                <div style={{ display:'flex', gap:6, marginTop:8 }}>
                  <span style={{ fontSize:9, background:`${C.amber}18`, color:C.amber, borderRadius:999, padding:'2px 6px', fontWeight:700 }}>{t.trigger}</span>
                  <span style={{ fontSize:9, background:`${C.blue}18`, color:C.blue, borderRadius:999, padding:'2px 6px', fontWeight:700 }}>{t.tone}</span>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div style={{ textAlign:'center', padding:'40px 0', color:C.muted }}>
                <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
                <p>No messages in this filter.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
