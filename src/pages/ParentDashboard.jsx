import React, { useState, useRef, useEffect } from 'react'

// ─── HISD Theme — IDENTICAL to StudentDashboard ──────────────────────────────
const T = {
  primary:   '#003057',
  secondary: '#B3A369',
  bg:        '#000d1f',
  card:      '#001830',
  inner:     '#002040',
  raised:    '#002a52',
  text:      '#e8f0ff',
  soft:      '#b0c4e8',
  muted:     '#5a7aa0',
  border:    '#003a6a',
  green:     '#22c97a',
  blue:      '#B3A369',
  red:       '#f04a4a',
  amber:     '#f5a623',
  teal:      '#0fb8a0',
  purple:    '#9b6ef5',
  header:    'linear-gradient(135deg, #003057 0%, #001830 100%)',
  navActive: '#B3A369',
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const CHILD = {
  name: 'Marcus', fullName: 'Marcus Thompson',
  grade: '3rd Grade', school: 'Houston ISD · Lincoln Elementary',
  gpa: 87.4,
  classes: [
    { id:1, subject:'Math',    teacher:'Ms. Johnson', grade:87, letter:'B', period:'1st', color:'#3b7ef4' },
    { id:2, subject:'Reading', teacher:'Ms. Davis',   grade:95, letter:'A', period:'2nd', color:'#22c97a' },
    { id:3, subject:'Science', teacher:'Mr. Lee',     grade:61, letter:'D', period:'3rd', color:'#f04a4a' },
    { id:4, subject:'Writing', teacher:'Ms. Clark',   grade:88, letter:'B', period:'4th', color:'#f54a7a' },
  ],
  alerts: [
    { id:1, msg:"Marcus's Science grade is 61% — below passing", color:'#f04a4a', icon:'⚑' },
    { id:2, msg:"2 assignments due this week for Marcus",         color:'#f5a623', icon:'📋' },
  ],
  assignments: [
    { id:1, name:'Ch.4 Worksheet', subject:'Math',   due:'Today',    status:'pending'   },
    { id:2, name:'Book Report',    subject:'Reading', due:'Tomorrow', status:'pending'   },
    { id:3, name:'Lab Report',     subject:'Science', due:'Friday',   status:'submitted' },
  ],
}

const INITIAL_THREADS = [
  {
    id:1, from:'Ms. Johnson', subject:'Math · Private', avatar:'👩‍🏫', unread:true, private:true,
    messages:[
      { id:1, sender:'Ms. Johnson', text:"Hi Ms. Thompson, I wanted to reach out about Marcus's recent progress.", time:'1 hr ago', isMe:false },
      { id:2, sender:'Me',          text:"Thank you for reaching out. I'll work with him on Science at home.", time:'45 min ago', isMe:true },
      { id:3, sender:'Ms. Johnson', text:"That would be great! He has a test on Friday — chapters 3 & 4.", time:'30 min ago', isMe:false },
    ],
  },
  {
    id:2, from:'Mr. Lee', subject:'Science · Private', avatar:'🧑‍🔬', unread:false, private:true,
    messages:[{ id:1, sender:'Mr. Lee', text:"Hi Ms. Thompson, Marcus's Science grade has dropped. I recommend additional practice this week.", time:'Yesterday', isMe:false }],
  },
  {
    id:3, from:'Marcus', subject:"Student View — Marcus's Messages", avatar:'🎒', unread:false, private:false, readOnly:true,
    messages:[
      { id:1, sender:'Ms. Johnson', text:"Great work on yesterday's quiz, Marcus!", time:'1 hr ago', isMe:false },
      { id:2, sender:'Marcus',      text:"Thank you, Ms. Johnson! I studied really hard.", time:'45 min ago', isMe:false },
      { id:3, sender:'Ms. Johnson', text:"Don't forget the worksheet due Friday!", time:'30 min ago', isMe:false },
    ],
  },
]

const CONTACTS = [
  { name:'Ms. Johnson', role:'Math Teacher',    avatar:'👩‍🏫' },
  { name:'Mr. Lee',     role:'Science Teacher', avatar:'🧑‍🔬' },
  { name:'Ms. Davis',   role:'Reading Teacher', avatar:'👩‍💼' },
  { name:'Ms. Clark',   role:'Writing Teacher', avatar:'✍️'  },
  { name:'Principal',   role:'Administration',  avatar:'🏫'  },
]

// ─── localStorage transcript helpers ─────────────────────────────────────────
const STORAGE_KEY = 'gradeflow_parent_ai_sessions_marcus'

function loadTranscripts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveTranscript(session) {
  try {
    const existing = loadTranscripts()
    const updated  = [session, ...existing].slice(0, 20)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch { /* storage full */ }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function gradeColor(g) { return g>=90?T.green:g>=80?T.blue:g>=70?T.amber:T.red }

// ─── Modal shell ──────────────────────────────────────────────────────────────
function ModalShell({ onClose, children }) {
  return (
    <div
      style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', display:'flex', alignItems:'flex-end', justifyContent:'center' }}
      onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{ width:'100%', maxWidth:480, background:T.bg, borderRadius:'24px 24px 0 0', border:`1px solid ${T.border}`, padding:'20px 20px max(28px,env(safe-area-inset-bottom))', maxHeight:'85vh', overflowY:'auto' }}>
        <div style={{ width:36, height:4, background:T.border, borderRadius:2, margin:'0 auto 18px' }}/>
        {children}
      </div>
    </div>
  )
}

// ─── Parent AI Voice Modal ────────────────────────────────────────────────────
function ParentAIModal({ onClose, childName }) {
  const [status, setStatus]           = useState('idle')
  const [transcript, setTranscript]   = useState([])
  const [errorMsg, setErrorMsg]       = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory]         = useState([])
  const wsRef       = useRef(null)
  const audioCtxRef = useRef(null)
  const scrollRef   = useRef(null)
  const statusRef   = useRef('idle')

  useEffect(() => { setHistory(loadTranscripts()) }, [])
  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior:'smooth' }) }, [transcript])
  useEffect(() => {
    return () => {
      wsRef.current?.close()
      if (audioCtxRef.current?.state !== 'closed') audioCtxRef.current?.close()
    }
  }, [])

  async function startSession() {
    setStatus('connecting')
    statusRef.current = 'connecting'
    setTranscript([])
    setErrorMsg('')
    try {
      const tokenRes = await fetch('/api/elevenlabs-token', { method:'POST' })
      if (!tokenRes.ok) throw new Error('Could not connect to AI assistant')
      const { signed_url } = await tokenRes.json()

      const ws = new WebSocket(signed_url)
      wsRef.current = ws

      const stream    = await navigator.mediaDevices.getUserMedia({ audio:true })
      const ctx       = new AudioContext({ sampleRate:16000 })
      audioCtxRef.current = ctx
      const source    = ctx.createMediaStreamSource(stream)
      const processor = ctx.createScriptProcessor(4096, 1, 1)
      source.connect(processor)
      processor.connect(ctx.destination)

      processor.onaudioprocess = (e) => {
        if (ws.readyState !== WebSocket.OPEN) return
        const float32 = e.inputBuffer.getChannelData(0)
        const int16   = new Int16Array(float32.length)
        for (let i = 0; i < float32.length; i++) {
          int16[i] = Math.max(-32768, Math.min(32767, Math.round(float32[i] * 32767)))
        }
        const base64 = btoa(String.fromCharCode(...new Uint8Array(int16.buffer)))
        ws.send(JSON.stringify({ user_audio_chunk: base64 }))
      }

      ws.onopen = () => { setStatus('active'); statusRef.current = 'active' }

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === 'audio' && msg.audio_event?.audio_base64) {
            playAudioChunk(msg.audio_event.audio_base64, ctx)
          }
          if (msg.type === 'transcript' && msg.transcript_event) {
            const { speaker_type, text } = msg.transcript_event
            if (text?.trim()) {
              setTranscript(prev => [...prev, {
                role: speaker_type === 'user' ? 'You' : 'Spark',
                text: text.trim(),
                time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
              }])
            }
          }
        } catch { /* ignore malformed frames */ }
      }

      ws.onerror = () => {
        setStatus('error'); statusRef.current = 'error'
        setErrorMsg('Connection lost. Please try again.')
      }

      ws.onclose = () => {
        processor.disconnect(); source.disconnect()
        stream.getTracks().forEach(t => t.stop())
        if (statusRef.current === 'active') { setStatus('ended'); statusRef.current = 'ended' }
      }
    } catch (err) {
      setStatus('error'); statusRef.current = 'error'
      setErrorMsg(err.message || 'Could not start session.')
    }
  }

  function endSession() {
    statusRef.current = 'ended'
    wsRef.current?.close()
    if (audioCtxRef.current?.state !== 'closed') audioCtxRef.current?.close()
    setStatus('ended')
    setTranscript(current => {
      if (current.length > 0) {
        const session = {
          id:    Date.now(),
          date:  new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }),
          time:  new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
          turns: current,
        }
        saveTranscript(session)
        setHistory(loadTranscripts())
      }
      return current
    })
  }

  async function playAudioChunk(base64, ctx) {
    try {
      if (!ctx || ctx.state === 'closed') return
      const binary = atob(base64)
      const bytes  = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
      const buffer = await ctx.decodeAudioData(bytes.buffer)
      const src    = ctx.createBufferSource()
      src.buffer   = buffer
      src.connect(ctx.destination)
      src.start()
    } catch { /* skip bad chunks */ }
  }

  // History view
  if (showHistory) {
    return (
      <ModalShell onClose={onClose}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <button onClick={()=>setShowHistory(false)}
            style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:8, padding:'6px 12px', color:T.text, cursor:'pointer', fontSize:12 }}>
            &larr; Back
          </button>
          <div style={{ fontSize:15, fontWeight:800, color:T.text }}>Past Sessions</div>
        </div>
        {history.length === 0 ? (
          <div style={{ textAlign:'center', padding:'32px 0', color:T.muted }}>
            <div style={{ fontSize:28, marginBottom:8 }}>💬</div>
            <div style={{ fontSize:13 }}>No sessions yet</div>
          </div>
        ) : history.map(session => (
          <div key={session.id} style={{ background:T.inner, borderRadius:14, padding:14, marginBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <div style={{ fontSize:12, fontWeight:700, color:T.secondary }}>{session.date}</div>
              <div style={{ fontSize:10, color:T.muted }}>{session.time} &middot; {session.turns.length} turns</div>
            </div>
            {session.turns.map((turn, i) => (
              <div key={i} style={{ marginBottom:6 }}>
                <span style={{ fontSize:10, fontWeight:700, color:turn.role==='You'?T.teal:T.purple, marginRight:6 }}>{turn.role}:</span>
                <span style={{ fontSize:12, color:T.text, lineHeight:1.5 }}>{turn.text}</span>
              </div>
            ))}
          </div>
        ))}
      </ModalShell>
    )
  }

  // Main session view
  return (
    <ModalShell onClose={onClose}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div>
          <div style={{ fontSize:15, fontWeight:800, color:T.text }}>🎤 AI Parenting Tips</div>
          <div style={{ fontSize:10, color:T.muted }}>Ask Spark how to support {childName} at home</div>
        </div>
        <button onClick={()=>setShowHistory(true)}
          style={{ background:`${T.purple}20`, border:`1px solid ${T.purple}40`, borderRadius:10, padding:'6px 12px', color:T.purple, fontSize:11, fontWeight:700, cursor:'pointer' }}>
          Past Sessions
        </button>
      </div>

      <div style={{ textAlign:'center', padding:'16px 0 20px' }}>
        {status === 'idle' && (
          <>
            <div style={{ fontSize:48, marginBottom:12 }}>🎤</div>
            <div style={{ fontSize:13, color:T.muted, marginBottom:20 }}>
              Ask how to support {childName}'s learning at home
            </div>
            <button onClick={startSession}
              style={{ background:`linear-gradient(135deg,${T.purple},#6b3fd4)`, border:'none', borderRadius:16, padding:'14px 32px', color:'#fff', fontSize:14, fontWeight:800, cursor:'pointer', boxShadow:`0 4px 20px ${T.purple}40` }}>
              Start Session
            </button>
          </>
        )}
        {status === 'connecting' && (
          <>
            <div style={{ fontSize:36, marginBottom:12 }}>⏳</div>
            <div style={{ fontSize:13, color:T.muted }}>Connecting...</div>
          </>
        )}
        {status === 'active' && (
          <>
            <div style={{ width:72, height:72, borderRadius:'50%', background:`${T.purple}30`, border:`2px solid ${T.purple}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, margin:'0 auto 12px', boxShadow:`0 0 24px ${T.purple}50` }}>🎤</div>
            <div style={{ fontSize:12, color:T.green, fontWeight:700, marginBottom:16 }}>&#x25cf; Live &mdash; Spark is listening</div>
            <button onClick={endSession}
              style={{ background:`${T.red}22`, border:`1px solid ${T.red}50`, borderRadius:12, padding:'10px 24px', color:T.red, fontSize:13, fontWeight:700, cursor:'pointer' }}>
              End Session
            </button>
          </>
        )}
        {status === 'ended' && (
          <>
            <div style={{ fontSize:36, marginBottom:8 }}>✅</div>
            <div style={{ fontSize:13, color:T.green, fontWeight:700, marginBottom:4 }}>Session saved!</div>
            <div style={{ fontSize:11, color:T.muted, marginBottom:20 }}>Find it in Past Sessions anytime</div>
            <button onClick={startSession}
              style={{ background:`${T.purple}22`, border:`1px solid ${T.purple}40`, borderRadius:12, padding:'10px 24px', color:T.purple, fontSize:13, fontWeight:700, cursor:'pointer' }}>
              New Session
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize:36, marginBottom:8 }}>&#x26a0;&#xfe0f;</div>
            <div style={{ fontSize:12, color:T.red, marginBottom:16 }}>{errorMsg}</div>
            <button onClick={startSession}
              style={{ background:`${T.purple}22`, border:`1px solid ${T.purple}40`, borderRadius:12, padding:'10px 24px', color:T.purple, fontSize:13, fontWeight:700, cursor:'pointer' }}>
              Try Again
            </button>
          </>
        )}
      </div>

      {transcript.length > 0 && (
        <div style={{ maxHeight:200, overflowY:'auto', background:T.inner, borderRadius:14, padding:12 }}>
          <div style={{ fontSize:10, fontWeight:700, color:T.muted, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:8 }}>Live Transcript</div>
          {transcript.map((turn, i) => (
            <div key={i} style={{ marginBottom:8 }}>
              <span style={{ fontSize:10, fontWeight:700, color:turn.role==='You'?T.teal:T.purple, marginRight:6 }}>{turn.role}:</span>
              <span style={{ fontSize:12, color:T.text, lineHeight:1.5 }}>{turn.text}</span>
              <span style={{ fontSize:9, color:T.muted, marginLeft:6 }}>{turn.time}</span>
            </div>
          ))}
          <div ref={scrollRef}/>
        </div>
      )}
    </ModalShell>
  )
}

function Widget({ onClick, children, style={} }) {
  return (
    <div onClick={onClick} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:16, marginBottom:12, cursor:onClick?'pointer':'default', transition:'border-color 0.15s', ...style }}
      onMouseEnter={e=>{ if(onClick) e.currentTarget.style.borderColor=T.secondary }}
      onMouseLeave={e=>{ e.currentTarget.style.borderColor = style.borderColor||T.border }}>
      {children}
    </div>
  )
}

function Btn({ label, color, onClick, style={} }) {
  return (
    <button onClick={e=>{e.stopPropagation();onClick?.()}}
      style={{ background:`${color}22`, color, border:`1px solid ${color}40`, borderRadius:10, padding:'7px 13px', fontSize:11, fontWeight:700, cursor:'pointer', ...style }}>
      {label}
    </button>
  )
}

// ─── Bottom nav ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id:'home',    icon:'🏠',  label:'Home'     },
  { id:'grades',  icon:'📊', label:'Grades'   },
  { id:'feed',    icon:'📢', label:'Feed'     },
  { id:'messages',icon:'💬', label:'Messages' },
  { id:'settings',icon:'⚙',  label:'Settings' },
]

function BottomNav({ active, onSelect }) {
  return (
    <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:200, background:'rgba(0,13,31,0.97)', backdropFilter:'blur(20px)', borderTop:`1px solid ${T.border}`, padding:'8px 0 max(14px,env(safe-area-inset-bottom))', display:'grid', gridTemplateColumns:`repeat(${NAV_ITEMS.length},1fr)` }}>
      {NAV_ITEMS.map(item=>{
        const isActive = item.id===active
        return (
          <button key={item.id} onClick={()=>onSelect(item.id)}
            style={{ background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'5px 2px', position:'relative' }}>
            <span style={{ fontSize:18, transition:'transform 0.15s', transform:isActive?'scale(1.15)':'scale(1)' }}>{item.icon}</span>
            <span style={{ fontSize:9, fontWeight:isActive?700:400, color:isActive?T.secondary:T.muted }}>{item.label}</span>
            {isActive && <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:24, height:2, background:T.secondary, borderRadius:1 }}/>}
          </button>
        )
      })}
    </div>
  )
}

// ─── FULL MESSAGES PAGE (Parent version) ─────────────────────────────────────
function MessagesPage({ onBack }) {
  const [threads, setThreads]               = useState(INITIAL_THREADS)
  const [selectedThread, setSelectedThread] = useState(null)
  const [reply, setReply]                   = useState('')
  const [showNewRecipient, setShowNewRecipient] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName]   = useState('')
  const bottomRef = useRef(null)

  useEffect(()=>{ bottomRef.current?.scrollIntoView({ behavior:'smooth' }) },[selectedThread])

  function sendReply() {
    if (!reply.trim() || !selectedThread) return
    const msg = { id:Date.now(), sender:'Me', text:reply.trim(), time:'Just now', isMe:true }
    setThreads(ts=>ts.map(t=>t.id===selectedThread.id ? { ...t, messages:[...t.messages,msg] } : t))
    setSelectedThread(t=>({ ...t, messages:[...t.messages,msg] }))
    setReply('')
  }

  function startThread(contact) {
    const exists = threads.find(t=>t.from===contact.name && t.private)
    if (exists) { setSelectedThread(exists); setShowNewRecipient(false); return }
    const t = { id:Date.now(), from:contact.name, subject:`${contact.role} · Private`, avatar:contact.avatar, unread:false, private:true, messages:[] }
    setThreads(ts=>[...ts,t])
    setSelectedThread(t)
    setShowNewRecipient(false)
  }

  function addByEmail() {
    if (!newEmail.trim()) return
    const t = { id:Date.now(), from:newName||newEmail, subject:'New Conversation', avatar:'📧', unread:false, private:true, messages:[] }
    setThreads(ts=>[...ts,t])
    setSelectedThread(t)
    setNewEmail(''); setNewName(''); setShowNewRecipient(false)
  }

  if (selectedThread) {
    const thread = threads.find(t=>t.id===selectedThread.id)||selectedThread
    const isReadOnly = thread.readOnly
    return (
      <div style={{ minHeight:'100vh', background:T.bg, color:T.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", display:'flex', flexDirection:'column' }}>
        <div style={{ background:T.header, padding:'16px', position:'sticky', top:0, zIndex:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={()=>setSelectedThread(null)} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
            <span style={{ fontSize:24 }}>{thread.avatar}</span>
            <div>
              <div style={{ fontWeight:700, fontSize:15, color:'#fff' }}>{thread.from}</div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.6)' }}>{thread.subject}</div>
                {thread.private && <span style={{ fontSize:9, background:'rgba(240,74,74,0.25)', color:T.red, borderRadius:999, padding:'2px 6px', fontWeight:700 }}>🔒 Private</span>}
                {isReadOnly && <span style={{ fontSize:9, background:'rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.5)', borderRadius:999, padding:'2px 6px', fontWeight:700 }}>👁 View only</span>}
              </div>
            </div>
          </div>
        </div>
        {isReadOnly && (
          <div style={{ margin:'10px 16px 0', background:'#1a1a2e', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'8px 12px', fontSize:11, color:'rgba(255,255,255,0.5)' }}>
            👁 You're viewing Marcus's messages with his teacher. This is read-only.
          </div>
        )}
        <div style={{ flex:1, padding:'16px 16px 120px', overflowY:'auto' }}>
          {thread.messages.length===0 && (
            <div style={{ textAlign:'center', padding:'40px 0', color:T.muted }}>
              <div style={{ fontSize:32, marginBottom:8 }}>💬</div>
              <div style={{ fontSize:13 }}>Start the conversation</div>
            </div>
          )}
          {thread.messages.map(msg=>(
            <div key={msg.id} style={{ display:'flex', justifyContent:msg.isMe?'flex-end':'flex-start', marginBottom:12 }}>
              {!msg.isMe && <div style={{ width:30, height:30, borderRadius:'50%', background:T.inner, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, marginRight:8, flexShrink:0 }}>{thread.avatar}</div>}
              <div style={{ maxWidth:'75%' }}>
                {!msg.isMe && <div style={{ fontSize:10, color:T.muted, marginBottom:3, marginLeft:2 }}>{msg.sender}</div>}
                <div style={{ background:msg.isMe?T.secondary:T.inner, color:msg.isMe?T.primary:T.text, borderRadius:msg.isMe?'16px 16px 4px 16px':'16px 16px 16px 4px', padding:'10px 13px', fontSize:13, lineHeight:1.5 }}>{msg.text}</div>
                <div style={{ fontSize:9, color:T.muted, marginTop:3, textAlign:msg.isMe?'right':'left' }}>{msg.time}</div>
              </div>
            </div>
          ))}
          <div ref={bottomRef}/>
        </div>
        {!isReadOnly && (
          <div style={{ position:'fixed', bottom:0, left:0, right:0, padding:'12px 16px max(16px,env(safe-area-inset-bottom))', background:`${T.bg}f0`, backdropFilter:'blur(16px)', borderTop:`1px solid ${T.border}`, display:'flex', gap:8, alignItems:'flex-end', zIndex:100 }}>
            <textarea value={reply} onChange={e=>setReply(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); sendReply() }}}
              placeholder="Reply to teacher..." rows={1}
              style={{ flex:1, background:T.inner, border:`1px solid ${T.border}`, borderRadius:14, padding:'10px 14px', color:T.text, fontSize:13, resize:'none', outline:'none', maxHeight:100, fontFamily:'inherit' }}/>
            <button onClick={sendReply} disabled={!reply.trim()}
              style={{ background:reply.trim()?T.secondary:'#2a2f42', color:reply.trim()?T.primary:'#6b7494', border:'none', borderRadius:12, padding:'10px 16px', fontSize:13, fontWeight:700, cursor:reply.trim()?'pointer':'not-allowed', flexShrink:0 }}>Send</button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100vh', background:T.bg, color:T.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", paddingBottom:80 }}>
      <div style={{ background:T.header, padding:'16px', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button onClick={onBack} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
            <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>💬 Messages</h1>
          </div>
          <button onClick={()=>setShowNewRecipient(true)}
            style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:700 }}>+ New</button>
        </div>
      </div>
      {showNewRecipient && (
        <div style={{ margin:'12px 16px', background:T.card, border:`1px solid ${T.secondary}40`, borderRadius:18, padding:16 }}>
          <div style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:12 }}>Message a teacher</div>
          <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:14 }}>
            {CONTACTS.map(c=>(
              <button key={c.name} onClick={()=>startThread(c)}
                style={{ background:T.inner, border:`1px solid ${T.border}`, borderRadius:12, padding:'10px 14px', display:'flex', alignItems:'center', gap:12, cursor:'pointer', textAlign:'left' }}>
                <span style={{ fontSize:22 }}>{c.avatar}</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{c.name}</div>
                  <div style={{ fontSize:10, color:T.muted }}>{c.role}</div>
                </div>
              </button>
            ))}
          </div>
          <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:14 }}>
            <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:T.muted, marginBottom:8 }}>Or add by email</div>
            <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Name (optional)"
              style={{ width:'100%', background:T.inner, border:`1px solid ${T.border}`, borderRadius:10, padding:'8px 12px', color:T.text, fontSize:13, outline:'none', boxSizing:'border-box', marginBottom:8 }}/>
            <div style={{ display:'flex', gap:8 }}>
              <input value={newEmail} onChange={e=>setNewEmail(e.target.value)} placeholder="Email address or URL"
                style={{ flex:1, background:T.inner, border:`1px solid ${T.border}`, borderRadius:10, padding:'8px 12px', color:T.text, fontSize:13, outline:'none' }}/>
              <button onClick={addByEmail} style={{ background:T.secondary, color:T.primary, border:'none', borderRadius:10, padding:'8px 14px', fontSize:12, fontWeight:700, cursor:'pointer' }}>Add</button>
            </div>
          </div>
          <button onClick={()=>setShowNewRecipient(false)} style={{ width:'100%', background:'transparent', border:'none', color:T.muted, padding:'10px', fontSize:12, cursor:'pointer', marginTop:8 }}>Cancel</button>
        </div>
      )}
      <div style={{ padding:'12px 16px 4px' }}>
        <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:T.muted, marginBottom:8 }}>🔒 Private · Teacher Channel</div>
        {threads.filter(t=>t.private).map(thread=>(
          <button key={thread.id} onClick={()=>setSelectedThread(thread)}
            style={{ width:'100%', background:thread.unread?T.inner:T.card, border:`1px solid ${thread.unread?T.secondary+'50':T.border}`, borderRadius:16, padding:'14px 16px', marginBottom:10, display:'flex', alignItems:'center', gap:14, cursor:'pointer', textAlign:'left' }}
            onMouseEnter={e=>(e.currentTarget.style.background=T.raised)}
            onMouseLeave={e=>(e.currentTarget.style.background=thread.unread?T.inner:T.card)}>
            <div style={{ width:42, height:42, borderRadius:'50%', background:T.raised, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0, position:'relative' }}>
              {thread.avatar}
              {thread.unread && <div style={{ position:'absolute', top:0, right:0, width:10, height:10, borderRadius:'50%', background:T.red, border:`2px solid ${T.bg}` }}/>}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                <div style={{ fontWeight:700, fontSize:14, color:T.text }}>{thread.from}</div>
                <div style={{ fontSize:10, color:T.muted }}>{thread.messages[thread.messages.length-1]?.time||''}</div>
              </div>
              <div style={{ fontSize:11, color:T.muted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {thread.messages[thread.messages.length-1]?.text||'No messages yet'}
              </div>
            </div>
            <span style={{ color:T.muted, fontSize:16 }}>›</span>
          </button>
        ))}
        <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:T.muted, margin:'12px 0 8px' }}>👁 Marcus's View</div>
        {threads.filter(t=>!t.private).map(thread=>(
          <button key={thread.id} onClick={()=>setSelectedThread(thread)}
            style={{ width:'100%', background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:'14px 16px', marginBottom:10, display:'flex', alignItems:'center', gap:14, cursor:'pointer', textAlign:'left' }}
            onMouseEnter={e=>(e.currentTarget.style.background=T.raised)}
            onMouseLeave={e=>(e.currentTarget.style.background=T.card)}>
            <div style={{ width:42, height:42, borderRadius:'50%', background:T.raised, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{thread.avatar}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:14, color:T.text, marginBottom:3 }}>{thread.from}</div>
              <div style={{ fontSize:11, color:T.muted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {thread.messages[thread.messages.length-1]?.text||'No messages'}
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
              <span style={{ fontSize:9, color:T.muted, background:T.inner, borderRadius:999, padding:'2px 6px', fontWeight:700 }}>👁 Read only</span>
              <span style={{ color:T.muted, fontSize:16 }}>›</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Grades page ──────────────────────────────────────────────────────────────
function GradesPage({ onBack }) {
  return (
    <div style={{ minHeight:'100vh', background:T.bg, color:T.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", paddingBottom:80 }}>
      <div style={{ background:T.header, padding:'16px 16px 20px' }}>
        <button onClick={onBack} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:12 }}>← Back</button>
        <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>📊 Marcus's Grades</h1>
      </div>
      <div style={{ padding:'16px' }}>
        {CHILD.classes.map(c=>(
          <div key={c.id} style={{ background:T.card, border:`1px solid ${T.border}`, borderLeft:`4px solid ${c.color}`, borderRadius:16, padding:'14px 16px', marginBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:T.text }}>{c.subject}</div>
                <div style={{ fontSize:11, color:T.muted }}>{c.teacher} · {c.period} Period</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:20, fontWeight:900, color:gradeColor(c.grade) }}>{c.grade}%</div>
                <div style={{ fontSize:11, fontWeight:700, color:gradeColor(c.grade) }}>{c.letter}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Alerts page ──────────────────────────────────────────────────────────────
function AlertsPage({ onBack }) {
  return (
    <div style={{ minHeight:'100vh', background:T.bg, color:T.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", paddingBottom:80 }}>
      <div style={{ background:T.header, padding:'16px 16px 20px' }}>
        <button onClick={onBack} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:12 }}>← Back</button>
        <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>🔔 Alerts</h1>
      </div>
      <div style={{ padding:'16px' }}>
        {CHILD.alerts.map(a=>(
          <div key={a.id} style={{ background:T.card, border:`1px solid ${a.color}30`, borderLeft:`4px solid ${a.color}`, borderRadius:14, padding:'14px 16px', marginBottom:10 }}>
            <div style={{ fontSize:20, marginBottom:6 }}>{a.icon}</div>
            <div style={{ fontSize:13, color:T.text }}>{a.msg}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Home page ────────────────────────────────────────────────────────────────
function HomePage({ navigate, childName }) {
  const [voiceOpen, setVoiceOpen] = useState(false)
  const unreadCount      = INITIAL_THREADS.filter(t=>t.unread&&t.private).length
  const pendingCount     = CHILD.assignments.filter(a=>a.status==='pending').length

  // ── Parent Daily Overview: GPA · Messages · Assignments · Alerts ─────────
  // No Scan tile — scan is not relevant for parents
  const overviewTiles = [
    { icon:'📊', val:CHILD.gpa,          label:'GPA',         page:'grades',   color:T.secondary },
    { icon:'💬', val:unreadCount||'',    label:'Messages',    page:'messages', color:T.purple    },
    { icon:'📋', val:pendingCount||'',   label:'Assignments', page:'grades',   color:T.teal      },
    { icon:'🔔', val:CHILD.alerts.length||'', label:'Alerts', page:'alerts',  color:T.red       },
  ]

  return (
    <div style={{ padding:'12px 12px 0' }}>

      {/* W1: Daily Overview — GPA · Messages · Assignments · Alerts */}
      <Widget style={{ background:`linear-gradient(135deg,${T.primary} 0%,#001020 100%)`, border:'none' }}>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:12 }}>
          {childName.toUpperCase()}'S DAILY OVERVIEW
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
          {overviewTiles.map(tile=>(
            <button key={tile.label} onClick={e=>{e.stopPropagation();navigate(tile.page)}}
              style={{ background:`${tile.color}18`, border:`1px solid ${tile.color}30`, borderRadius:14, padding:'12px 4px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
              <span style={{ fontSize:18 }}>{tile.icon}</span>
              {tile.val!=='' && <span style={{ fontSize:16, fontWeight:900, color:tile.color, lineHeight:1 }}>{tile.val}</span>}
              <span style={{ fontSize:8, color:'rgba(255,255,255,0.5)', textAlign:'center', fontWeight:600 }}>{tile.label}</span>
            </button>
          ))}
        </div>
      </Widget>

      {/* W2: Alerts */}
      {CHILD.alerts.length>0 && (
        <Widget onClick={()=>navigate('alerts')} style={{ border:`1px solid ${T.red}25` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <div style={{ fontSize:13, fontWeight:700 }}>🔔 Alerts</div>
            <span style={{ background:`${T.red}18`, color:T.red, fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:999 }}>{CHILD.alerts.length}</span>
          </div>
          {CHILD.alerts.map(a=>(
            <div key={a.id} style={{ background:T.inner, borderLeft:`3px solid ${a.color}`, borderRadius:10, padding:'9px 12px', marginBottom:6, display:'flex', gap:8, alignItems:'flex-start' }}>
              <span>{a.icon}</span><span style={{ fontSize:12, color:T.text }}>{a.msg}</span>
            </div>
          ))}
        </Widget>
      )}

      {/* W3: Today's Lesson */}
      <Widget onClick={()=>navigate('lessons')} style={{ background:'linear-gradient(135deg,#001830,#000d1f)', border:`1px solid #003a6a` }}>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:8 }}>TODAY'S LESSONS 📖</div>
        <div style={{ fontSize:15, fontWeight:800, color:'#fff', marginBottom:4 }}>Ch.4 · Fractions & Decimals · Math</div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)' }}>Pages 84–91 · Ms. Johnson · Parent view of {childName}'s lessons</div>
      </Widget>

      {/* W4: Classes */}
      <Widget onClick={()=>navigate('grades')}>
        <div style={{ fontSize:13, fontWeight:700, marginBottom:12 }}>📚 {childName}'s Classes</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {CHILD.classes.map(c=>(
            <button key={c.id} onClick={e=>{e.stopPropagation();navigate('grades')}}
              style={{ background:T.inner, borderLeft:`3px solid ${c.color}`, borderRadius:12, padding:'10px 12px', border:'none', cursor:'pointer', textAlign:'left' }}>
              <div style={{ fontWeight:700, fontSize:12, color:T.text, marginBottom:2 }}>{c.subject}</div>
              <div style={{ fontSize:10, color:T.muted, marginBottom:6 }}>{c.teacher}</div>
              <div style={{ fontSize:20, fontWeight:800, color:gradeColor(c.grade) }}>{c.grade}%</div>
            </button>
          ))}
        </div>
      </Widget>

      {/* W5: Messages preview */}
      <Widget onClick={()=>navigate('messages')}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <div style={{ fontSize:13, fontWeight:700 }}>💬 Messages</div>
          <Btn label="+ New" color={T.secondary} onClick={()=>navigate('messages')}/>
        </div>
        {INITIAL_THREADS.filter(t=>t.unread&&t.private).slice(0,2).map(t=>(
          <div key={t.id} style={{ background:T.inner, borderRadius:12, padding:'10px 12px', marginBottom:8, display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:20 }}>{t.avatar}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:12, color:T.text }}>{t.from}</div>
              <div style={{ fontSize:10, color:T.muted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.messages[t.messages.length-1]?.text}</div>
            </div>
            <div style={{ width:8, height:8, borderRadius:'50%', background:T.red, flexShrink:0 }}/>
          </div>
        ))}
        {!INITIAL_THREADS.some(t=>t.unread&&t.private) && <div style={{ fontSize:11, color:T.muted, textAlign:'center', padding:'8px 0' }}>No new messages</div>}
      </Widget>

      {/* W6: AI Tips — mic pinned far right */}
      <Widget style={{ background:'linear-gradient(135deg,#0d1a3a 0%,#000d1f 100%)', border:`1px solid ${T.purple}30` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
          <div style={{ fontSize:11, fontWeight:700, color:T.purple }}>✨ AI Tips for {childName}</div>
          <button
            onClick={e=>{ e.stopPropagation(); setVoiceOpen(true) }}
            title="Ask Spark for parenting tips"
            style={{ background:`${T.purple}25`, border:`1px solid ${T.purple}50`, borderRadius:8, width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:15, padding:0, flexShrink:0 }}>
            🎤
          </button>
        </div>
        <div style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:4 }}>Science needs focus!</div>
        <div style={{ fontSize:11, color:T.muted }}>10 min flashcards tonight · same strategy that boosted Reading +8pts</div>
      </Widget>

      {/* Parent AI Modal */}
      {voiceOpen && <ParentAIModal onClose={()=>setVoiceOpen(false)} childName={childName}/>}
    </div>
  )
}

// ─── MAIN PARENT DASHBOARD ────────────────────────────────────────────────────
export default function ParentDashboard({ currentUser }) {
  const [page, setPage]           = useState('home')
  const [activeNav, setActiveNav] = useState('home')
  const parentName = currentUser?.userName || 'Ms. Thompson'
  const childName  = CHILD.name

  useEffect(()=>{ window.scrollTo(0,0) },[page])

  function navigate(id) {
    setPage(id)
    if(NAV_ITEMS.find(n=>n.id===id)) setActiveNav(id)
    window.scrollTo(0,0)
  }

  function goHome() { navigate('home'); setActiveNav('home') }

  if (page==='grades')   return <><GradesPage   onBack={goHome}/><BottomNav active={activeNav}  onSelect={navigate}/></>
  if (page==='messages') return <><MessagesPage onBack={goHome}/><BottomNav active='messages'   onSelect={navigate}/></>
  if (page==='alerts')   return <><AlertsPage   onBack={goHome}/><BottomNav active={activeNav}  onSelect={navigate}/></>

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour<12?'Good morning':'Good afternoon'

  return (
    <div style={{ minHeight:'100vh', background:T.bg, color:T.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", paddingBottom:90 }}>

      {/* Sticky header — greeting only, no duplicate buttons */}
      <div style={{ position:'sticky', top:0, zIndex:100, background:T.header, padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize:10, color:'rgba(255,255,255,0.55)', fontWeight:700, letterSpacing:'0.06em', marginBottom:2 }}>HOUSTON ISD · LINCOLN ELEMENTARY</div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:17, fontWeight:800, color:'#fff' }}>{greeting}, {parentName} 👋</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)' }}>Viewing: {childName} · {CHILD.grade}</div>
          </div>
          {/* Unread badge only — no duplicate messages button */}
          {INITIAL_THREADS.some(t=>t.unread&&t.private) && (
            <button onClick={()=>navigate('messages')}
              style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:16, position:'relative' }}>
              💬
              <div style={{ position:'absolute', top:-2, right:-2, width:8, height:8, borderRadius:'50%', background:T.red }}/>
            </button>
          )}
        </div>
      </div>

      <HomePage navigate={navigate} childName={childName}/>
      <BottomNav active={activeNav} onSelect={navigate}/>
    </div>
  )
}
