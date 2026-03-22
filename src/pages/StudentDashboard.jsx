import React, { useState, useRef, useEffect } from 'react'

// ─── HISD Theme ─────────────────────────────────────────────────────────────
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

function GradeBar({ score }) {
  const pct   = Math.min(100, Math.max(0, score))
  const color = pct>=90?T.green:pct>=80?T.teal:pct>=70?T.amber:T.red
  return (
    <div style={{ height:4, background:T.raised, borderRadius:2, overflow:'hidden', marginTop:6 }}>
      <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:2, transition:'width 0.4s' }}/>
    </div>
  )
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const STUDENT = {
  name: 'Marcus', fullName: 'Marcus Thompson',
  grade: '3rd Grade', school: 'Houston ISD \u00b7 Lincoln Elementary',
  gpa: 87.4,
  classes: [
    { id:1, subject:'Math',    teacher:'Ms. Johnson', grade:87, letter:'B', period:'1st', color:'#3b7ef4' },
    { id:2, subject:'Reading', teacher:'Ms. Davis',   grade:95, letter:'A', period:'2nd', color:'#22c97a' },
    { id:3, subject:'Science', teacher:'Mr. Lee',     grade:61, letter:'D', period:'3rd', color:'#f04a4a' },
    { id:4, subject:'Writing', teacher:'Ms. Clark',   grade:88, letter:'B', period:'4th', color:'#f54a7a' },
  ],
  assignments: [
    { id:1, name:'Ch.4 Worksheet', subject:'Math',   due:'Today',    status:'pending'   },
    { id:2, name:'Book Report',    subject:'Reading', due:'Tomorrow', status:'pending'   },
    { id:3, name:'Lab Report',     subject:'Science', due:'Friday',   status:'submitted' },
  ],
  alerts: [
    { id:1, msg:'Science grade is 61% \u2014 below passing', color:'#f04a4a', icon:'\u26a0' },
    { id:2, msg:'2 assignments due this week',                color:'#f5a623', icon:'\ud83d\udccb' },
  ],
  threads: [
    {
      id:1, from:'Ms. Johnson', subject:'Math', avatar:'\ud83d\udc69\u200d\ud83c\udfeb', unread:true,
      messages:[
        { id:1, sender:'Ms. Johnson', text:"Great work on yesterday's quiz, Marcus! You scored 87%.", time:'1 hr ago',   isMe:false },
        { id:2, sender:'Me',          text:"Thank you, Ms. Johnson! I studied really hard.",          time:'45 min ago', isMe:true  },
        { id:3, sender:'Ms. Johnson', text:"Don't forget the worksheet due Friday!",                  time:'30 min ago', isMe:false },
      ],
    },
    {
      id:2, from:'Mr. Lee', subject:'Science', avatar:'\ud83e\uddd1\u200d\ud83d\udd2c', unread:false,
      messages:[{ id:1, sender:'Mr. Lee', text:'Science fair project due Friday!', time:'Yesterday', isMe:false }],
    },
    {
      id:3, from:'Ms. Clark', subject:'Writing', avatar:'\u270d', unread:false,
      messages:[{ id:1, sender:'Ms. Clark', text:'Your essay draft was excellent!', time:'2 days ago', isMe:false }],
    },
  ],
  feed: [
    { id:1, author:'Ms. Johnson', content:'\ud83d\udcc5 Unit Test Friday! Review chapters 3\u20134.', time:'2 hours ago', reactions:{'\ud83d\udc4d':12,'\u2764':5} },
    { id:2, author:'Ms. Johnson', content:"Great work on yesterday's homework! Class average was 87%.", time:'Yesterday', reactions:{'\ud83d\udc4d':18,'\u2764':9} },
  ],
}

// ─── localStorage transcript helpers ─────────────────────────────────────────
const STORAGE_KEY = 'gradeflow_tutor_transcripts_marcus'

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

function Widget({ onClick, children, style={} }) {
  return (
    <div onClick={onClick}
      style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:16, marginBottom:12, cursor:onClick?'pointer':'default', transition:'border-color 0.15s', ...style }}
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
  { id:'home',     icon:'\ud83c\udfe0', label:'Home'     },
  { id:'grades',   icon:'\ud83d\udcca', label:'Grades'   },
  { id:'scan',     icon:'\ud83d\udcf7', label:'Scan'     },
  { id:'messages', icon:'\ud83d\udcac', label:'Messages' },
  { id:'settings', icon:'\u2699',       label:'Settings' },
]

function BottomNav({ active, onSelect }) {
  return (
    <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:200, background:'rgba(0,13,31,0.97)', backdropFilter:'blur(20px)', borderTop:`1px solid ${T.border}`, padding:'8px 0 max(14px,env(safe-area-inset-bottom))', display:'grid', gridTemplateColumns:`repeat(${NAV_ITEMS.length},1fr)` }}>
      {NAV_ITEMS.map(item => {
        const isActive = item.id === active
        return (
          <button key={item.id} onClick={()=>onSelect(item.id)}
            style={{ background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'5px 2px', position:'relative' }}>
            <span style={{ fontSize:18, transition:'transform 0.15s', transform:isActive?'scale(1.15)':'scale(1)' }}>{item.icon}</span>
            <span style={{ fontSize:9, fontWeight:isActive?700:400, color:isActive?T.secondary:T.muted, transition:'color 0.15s' }}>{item.label}</span>
            {isActive && <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:24, height:2, background:T.secondary, borderRadius:1 }}/>}
          </button>
        )
      })}
    </div>
  )
}

// ─── Modal shell ──────────────────────────────────────────────────────────────
function ModalShell({ onClose, children }) {
  return (
    <div
      style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', display:'flex', alignItems:'flex-end', justifyContent:'center' }}
      onClick={onClose}>
      <div
        onClick={e=>e.stopPropagation()}
        style={{ width:'100%', maxWidth:480, background:T.bg, borderRadius:'24px 24px 0 0', border:`1px solid ${T.border}`, padding:'20px 20px max(28px,env(safe-area-inset-bottom))', maxHeight:'85vh', overflowY:'auto' }}>
        <div style={{ width:36, height:4, background:T.border, borderRadius:2, margin:'0 auto 18px' }}/>
        {children}
      </div>
    </div>
  )
}

// ─── Voice Tutor Modal ────────────────────────────────────────────────────────
function VoiceTutorModal({ onClose }) {
  const [status, setStatus]           = useState('idle') // idle | connecting | active | ended | error
  const [transcript, setTranscript]   = useState([])
  const [errorMsg, setErrorMsg]       = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory]         = useState([])
  const wsRef        = useRef(null)
  const audioCtxRef  = useRef(null)
  const scrollRef    = useRef(null)
  const statusRef    = useRef('idle') // track status in callbacks without stale closure

  useEffect(() => {
    setHistory(loadTranscripts())
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [transcript])

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
      // 1. Get signed URL from our secure serverless proxy
      const tokenRes = await fetch('/api/elevenlabs-token', { method:'POST' })
      if (!tokenRes.ok) throw new Error('Could not connect to tutor service')
      const { signed_url } = await tokenRes.json()

      // 2. Open WebSocket
      const ws = new WebSocket(signed_url)
      wsRef.current = ws

      // 3. Set up mic
      const stream   = await navigator.mediaDevices.getUserMedia({ audio:true })
      const ctx      = new AudioContext({ sampleRate:16000 })
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

      ws.onopen = () => {
        setStatus('active')
        statusRef.current = 'active'
      }

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
                role: speaker_type === 'user' ? 'Marcus' : 'Spark',
                text: text.trim(),
                time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
              }])
            }
          }
        } catch { /* ignore malformed frames */ }
      }

      ws.onerror = () => {
        setStatus('error')
        statusRef.current = 'error'
        setErrorMsg('Connection lost. Please try again.')
      }

      ws.onclose = () => {
        processor.disconnect()
        source.disconnect()
        stream.getTracks().forEach(t => t.stop())
        if (statusRef.current === 'active') {
          setStatus('ended')
          statusRef.current = 'ended'
        }
      }

    } catch (err) {
      console.error('VoiceTutor error:', err)
      setStatus('error')
      statusRef.current = 'error'
      setErrorMsg(err.message || 'Could not start session.')
    }
  }

  function endSession() {
    statusRef.current = 'ended'
    wsRef.current?.close()
    if (audioCtxRef.current?.state !== 'closed') audioCtxRef.current?.close()
    setStatus('ended')

    // Save to localStorage
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

  // ── History view ─────────────────────────────────────────────────────────
  if (showHistory) {
    return (
      <ModalShell onClose={onClose}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <button onClick={()=>setShowHistory(false)}
            style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:8, padding:'6px 12px', color:T.text, cursor:'pointer', fontSize:12 }}>
            \u2190 Back
          </button>
          <div style={{ fontSize:15, fontWeight:800, color:T.text }}>Past Sessions</div>
        </div>

        {history.length === 0 ? (
          <div style={{ textAlign:'center', padding:'32px 0', color:T.muted }}>
            <div style={{ fontSize:28, marginBottom:8 }}>💬</div>
            <div style={{ fontSize:13 }}>No sessions yet — tap the mic on the AI widget to start one!</div>
          </div>
        ) : history.map(session => (
          <div key={session.id} style={{ background:T.inner, borderRadius:14, padding:14, marginBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <div style={{ fontSize:12, fontWeight:700, color:T.secondary }}>{session.date}</div>
              <div style={{ fontSize:10, color:T.muted }}>{session.time} \u00b7 {session.turns.length} turns</div>
            </div>
            {session.turns.map((turn, i) => (
              <div key={i} style={{ marginBottom:6 }}>
                <span style={{ fontSize:10, fontWeight:700, color:turn.role==='Marcus'?T.teal:T.purple, marginRight:6 }}>
                  {turn.role}:
                </span>
                <span style={{ fontSize:12, color:T.text, lineHeight:1.5 }}>{turn.text}</span>
              </div>
            ))}
          </div>
        ))}
      </ModalShell>
    )
  }

  // ── Main session view ─────────────────────────────────────────────────────
  return (
    <ModalShell onClose={onClose}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div>
          <div style={{ fontSize:15, fontWeight:800, color:T.text }}>🎤 Study Tutor</div>
          <div style={{ fontSize:10, color:T.muted }}>Spark \u00b7 AI Voice Tutor</div>
        </div>
        <button onClick={()=>setShowHistory(true)}
          style={{ background:`${T.purple}20`, border:`1px solid ${T.purple}40`, borderRadius:10, padding:'6px 12px', color:T.purple, fontSize:11, fontWeight:700, cursor:'pointer' }}>
          Past Sessions
        </button>
      </div>

      {/* State */}
      <div style={{ textAlign:'center', padding:'16px 0 20px' }}>
        {status === 'idle' && (
          <>
            <div style={{ fontSize:48, marginBottom:12 }}>🎤</div>
            <div style={{ fontSize:13, color:T.muted, marginBottom:20 }}>
              Talk to Spark about Math, Reading, Science, or Writing
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
            <div style={{ fontSize:13, color:T.muted }}>Connecting to Spark...</div>
          </>
        )}

        {status === 'active' && (
          <>
            <div style={{ width:72, height:72, borderRadius:'50%', background:`${T.purple}30`, border:`2px solid ${T.purple}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, margin:'0 auto 12px', boxShadow:`0 0 24px ${T.purple}50` }}>
              🎤
            </div>
            <div style={{ fontSize:12, color:T.green, fontWeight:700, marginBottom:16 }}>
              \u25cf Live \u2014 Spark is listening
            </div>
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
            <div style={{ fontSize:36, marginBottom:8 }}>⚠️</div>
            <div style={{ fontSize:12, color:T.red, marginBottom:16 }}>{errorMsg}</div>
            <button onClick={startSession}
              style={{ background:`${T.purple}22`, border:`1px solid ${T.purple}40`, borderRadius:12, padding:'10px 24px', color:T.purple, fontSize:13, fontWeight:700, cursor:'pointer' }}>
              Try Again
            </button>
          </>
        )}
      </div>

      {/* Live transcript */}
      {transcript.length > 0 && (
        <div style={{ maxHeight:200, overflowY:'auto', background:T.inner, borderRadius:14, padding:12 }}>
          <div style={{ fontSize:10, fontWeight:700, color:T.muted, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:8 }}>
            Live Transcript
          </div>
          {transcript.map((turn, i) => (
            <div key={i} style={{ marginBottom:8 }}>
              <span style={{ fontSize:10, fontWeight:700, color:turn.role==='Marcus'?T.teal:T.purple, marginRight:6 }}>
                {turn.role}:
              </span>
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

// ─── FULL MESSAGES PAGE ───────────────────────────────────────────────────────
function MessagesPage({ onBack }) {
  const [selectedThread, setSelectedThread] = useState(null)
  const [reply, setReply]     = useState('')
  const [threads, setThreads] = useState(STUDENT.threads)
  const [showNewRecipient, setShowNewRecipient] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName]   = useState('')
  const bottomRef = useRef(null)

  const CONTACTS = [
    { name:'Ms. Johnson', role:'Math Teacher',    avatar:'\ud83d\udc69\u200d\ud83c\udfeb' },
    { name:'Mr. Lee',     role:'Science Teacher', avatar:'\ud83e\uddd1\u200d\ud83d\udd2c' },
    { name:'Ms. Davis',   role:'Reading Teacher', avatar:'\ud83d\udc69\u200d\ud83d\udcbc' },
    { name:'Ms. Clark',   role:'Writing Teacher', avatar:'\u270d'  },
    { name:'Principal',   role:'Administration',  avatar:'\ud83c\udfeb'  },
  ]

  useEffect(()=>{ bottomRef.current?.scrollIntoView({ behavior:'smooth' }) },[selectedThread])

  function sendReply() {
    if (!reply.trim() || !selectedThread) return
    const msg = { id:Date.now(), sender:'Me', text:reply.trim(), time:'Just now', isMe:true }
    setThreads(ts=>ts.map(t=>t.id===selectedThread.id ? { ...t, messages:[...t.messages,msg] } : t))
    setSelectedThread(t=>({ ...t, messages:[...t.messages,msg] }))
    setReply('')
  }

  function startThread(contact) {
    const exists = threads.find(t=>t.from===contact.name)
    if (exists) { setSelectedThread(exists); setShowNewRecipient(false); return }
    const newThread = { id:Date.now(), from:contact.name, subject:'New Conversation', avatar:contact.avatar, unread:false, messages:[] }
    setThreads(ts=>[...ts,newThread])
    setSelectedThread(newThread)
    setShowNewRecipient(false)
  }

  function addByEmail() {
    if (!newEmail.trim()) return
    const t = { id:Date.now(), from:newName||newEmail, subject:'New Conversation', avatar:'\ud83d\udce7', unread:false, messages:[] }
    setThreads(ts=>[...ts,t])
    setSelectedThread(t)
    setNewEmail(''); setNewName(''); setShowNewRecipient(false)
  }

  if (selectedThread) {
    const thread = threads.find(t=>t.id===selectedThread.id)||selectedThread
    return (
      <div style={{ minHeight:'100vh', background:T.bg, color:T.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", display:'flex', flexDirection:'column' }}>
        <div style={{ background:T.header, padding:'16px', position:'sticky', top:0, zIndex:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={()=>setSelectedThread(null)} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}>\u2190 Back</button>
            <span style={{ fontSize:24 }}>{thread.avatar}</span>
