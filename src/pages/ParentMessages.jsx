import React, { useState, useRef, useEffect } from 'react'
import { useStore } from '../lib/store'

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

const KEY = () => import.meta.env.VITE_ANTHROPIC_KEY

// ─── Contact directory ─────────────────────────────────────────────────────────
const CONTACTS = {
  teachers: [
    { id:'t1', name:'Mr. Rivera',    role:'Science Teacher',  avatar:'🧑‍🔬', school:'KIPP NO' },
    { id:'t2', name:'Ms. Davis',     role:'Reading Teacher',  avatar:'👩‍💼', school:'KIPP NO' },
    { id:'t3', name:'Ms. Clark',     role:'Writing Teacher',  avatar:'✍️',  school:'KIPP NO' },
    { id:'t4', name:'Mr. Thompson',  role:'PE Teacher',       avatar:'🏃',  school:'KIPP NO' },
  ],
  students: [
    { id:'s1', name:'Aaliyah Brooks',  role:'Student · 3rd Period Math', avatar:'👧', parent:'Ms. Brooks'  },
    { id:'s2', name:'Marcus Thompson', role:'Student · 3rd Period Math', avatar:'👦', parent:'Ms. Thompson' },
    { id:'s3', name:'Sofia Rodriguez', role:'Student · 3rd Period Math', avatar:'👧', parent:'Mr. Rodriguez'},
    { id:'s4', name:'Jordan Williams', role:'Student · 3rd Period Math', avatar:'👦', parent:'Ms. Williams' },
    { id:'s5', name:'Priya Patel',     role:'Student · 3rd Period Math', avatar:'👧', parent:'Dr. Patel'    },
    { id:'s6', name:'Liam Martinez',   role:'Student · 3rd Period Math', avatar:'👦', parent:'Ms. Martinez' },
  ],
  parents: [
    { id:'p1', name:'Ms. Brooks',    role:'Parent · Aaliyah Brooks',  avatar:'👩' },
    { id:'p2', name:'Ms. Thompson',  role:'Parent · Marcus Thompson', avatar:'👩' },
    { id:'p3', name:'Mr. Rodriguez', role:'Parent · Sofia Rodriguez', avatar:'👨' },
    { id:'p4', name:'Ms. Williams',  role:'Parent · Jordan Williams', avatar:'👩' },
    { id:'p5', name:'Dr. Patel',     role:'Parent · Priya Patel',    avatar:'👩‍⚕️' },
    { id:'p6', name:'Ms. Martinez',  role:'Parent · Liam Martinez',  avatar:'👩' },
  ],
  admin: [
    { id:'a1', name:'Principal Davis', role:'Principal', avatar:'🏫' },
    { id:'a2', name:'Dr. Green',       role:'Vice Principal', avatar:'🎓' },
    { id:'a3', name:'Ms. Ortiz',       role:'Counselor', avatar:'💬' },
  ],
}

const AI_TONES = [
  { id:'warm',    label:'Warm & Friendly',  emoji:'🤗' },
  { id:'formal',  label:'Professional',     emoji:'💼' },
  { id:'urgent',  label:'Urgent',           emoji:'⚠️' },
  { id:'celebratory', label:'Celebrating',  emoji:'🎉' },
]

// ─── Demo threads ─────────────────────────────────────────────────────────────
const INITIAL_THREADS = [
  {
    id:1, recipientId:'p2', recipientName:'Ms. Thompson', recipientRole:'parent',
    recipientAvatar:'👩', subject:'Marcus — Math Assessment',
    unread:true, aiDrafted:true, status:'pending',
    messages:[
      { id:1, sender:'Ms. Johnson', senderRole:'teacher', text:"Dear Ms. Thompson, Marcus received 58% on his Math assessment. I'd love to connect this week to discuss support options. He shows great effort in class and I believe with some targeted help he can improve quickly.", time:'2 hours ago', isMe:true },
    ],
    trigger:'Failed 58%', studentName:'Marcus Thompson',
  },
  {
    id:2, recipientId:'p1', recipientName:'Ms. Brooks', recipientRole:'parent',
    recipientAvatar:'👩', subject:'Aaliyah — Outstanding Progress!',
    unread:false, aiDrafted:true, status:'sent',
    messages:[
      { id:1, sender:'Ms. Johnson', senderRole:'teacher', text:"Great news! Aaliyah improved her Reading score by 12 points this month. She is working incredibly hard and her dedication is really showing. Please share this with her — she should be so proud!", time:'Yesterday', isMe:true },
      { id:2, sender:'Ms. Brooks', senderRole:'parent', text:"Oh my goodness, this made my day! Thank you so much for letting me know. We've been working on reading at home every evening. She'll be thrilled to hear this!", time:'Yesterday 4pm', isMe:false },
      { id:3, sender:'Ms. Johnson', senderRole:'teacher', text:"That at-home reading routine is clearly making a difference! Keep it up 🌟", time:'Yesterday 4:30pm', isMe:true },
    ],
    trigger:'Improved +12pts',
  },
  {
    id:3, recipientId:'t1', recipientName:'Mr. Rivera', recipientRole:'teacher',
    recipientAvatar:'🧑‍🔬', subject:'Cross-class collaboration idea',
    unread:true, aiDrafted:false, status:'sent',
    messages:[
      { id:1, sender:'Ms. Johnson', senderRole:'teacher', text:'Hey Mr. Rivera — I was thinking our classes could do a joint project connecting fractions/decimals in Math with measurement in Science. Interested in collaborating on a lesson?', time:'1 hour ago', isMe:true },
    ],
  },
  {
    id:4, recipientId:'a1', recipientName:'Principal Davis', recipientRole:'admin',
    recipientAvatar:'🏫', subject:'Supply request — fraction manipulatives',
    unread:false, aiDrafted:false, status:'sent',
    messages:[
      { id:1, sender:'Ms. Johnson', senderRole:'teacher', text:'Hi Principal Davis, I wanted to request a set of fraction strips and number tiles for my 3rd period Math class. The students would benefit greatly from hands-on materials. Let me know if there\'s a budget process I should follow.', time:'3 days ago', isMe:true },
      { id:2, sender:'Principal Davis', senderRole:'admin', text:'Hi Ms. Johnson! Great idea. Please fill out the supply request form on the shared drive and I\'ll approve it by end of week. Budget should cover it.', time:'3 days ago', isMe:false },
    ],
  },
  {
    id:5, recipientId:'s2', recipientName:'Marcus Thompson', recipientRole:'student',
    recipientAvatar:'👦', subject:'Extra credit opportunity',
    unread:false, aiDrafted:false, status:'sent',
    messages:[
      { id:1, sender:'Ms. Johnson', senderRole:'teacher', text:'Hi Marcus! I have an optional extra credit worksheet if you want to bring up your grade before the unit test. Come see me before school or after school this week. You\'ve got this!', time:'2 days ago', isMe:true },
      { id:2, sender:'Marcus Thompson', senderRole:'student', text:'Thank you Ms. Johnson! I will come Thursday after school.', time:'2 days ago', isMe:false },
    ],
  },
]

// ─── AI draft helper ──────────────────────────────────────────────────────────
async function generateAIDraft(context, tone) {
  if (!KEY()) return null
  try {
    const toneDesc = { warm:'warm and friendly', formal:'professional and formal', urgent:'urgent and direct', celebratory:'celebratory and encouraging' }[tone]||'warm and friendly'
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{ 'Content-Type':'application/json','x-api-key':KEY(),'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true' },
      body:JSON.stringify({
        model:'claude-sonnet-4-20250514', max_tokens:300,
        system:`You are a helpful assistant writing a school communication on behalf of a teacher. Write in a ${toneDesc} tone. Keep it under 3 sentences. Return only the message text, no subject line.`,
        messages:[{ role:'user', content:`Write a message to a ${context.recipientRole} about: ${context.trigger}. Student: ${context.studentName||''}` }]
      })
    })
    const data = await res.json()
    return data.content?.[0]?.text||null
  } catch { return null }
}

// ─── Components ───────────────────────────────────────────────────────────────
function Avatar({ emoji, size=36, color='var(--school-color,#BA0C2F)' }) {
  return <div style={{ width:size, height:size, borderRadius:'50%', background:color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.45, flexShrink:0 }}>{emoji}</div>
}

function RoleBadge({ role }) {
  const map = { teacher:{color:C.blue,label:'Teacher'}, student:{color:C.green,label:'Student'}, parent:{color:C.amber,label:'Parent'}, admin:{color:C.purple,label:'Admin'} }
  const r = map[role]||map.teacher
  return <span style={{ background:`${r.color}18`, color:r.color, borderRadius:999, padding:'2px 7px', fontSize:9, fontWeight:700 }}>{r.label}</span>
}

// ─── COMPOSE MODAL ─────────────────────────────────────────────────────────────
function ComposeModal({ onSend, onClose, prefill }) {
  const [step, setStep]         = useState(prefill ? 'write' : 'pick')
  const [selected, setSelected] = useState(prefill || null)
  const [tab, setTab]           = useState('parents')
  const [subject, setSubject]   = useState(prefill?.defaultSubject||'')
  const [body, setBody]         = useState('')
  const [tone, setTone]         = useState('warm')
  const [aiLoading, setAiLoading] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [sent, setSent]         = useState(false)

  const allContacts = Object.entries(CONTACTS).map(([group,list])=>list.map(c=>({...c,group}))).flat()
  const filtered = CONTACTS[tab]||[]

  async function handleAI() {
    setAiLoading(true)
    const draft = await generateAIDraft({ recipientRole:selected?.role||tab, trigger:subject, studentName:selected?.name||'' }, tone)
    if (draft) setBody(draft)
    setAiLoading(false)
  }

  function addByEmail() {
    if (!emailInput.trim()) return
    const c = { id:'custom-'+Date.now(), name:emailInput, role:'external', avatar:'📧', group:'custom' }
    setSelected(c)
    setEmailInput('')
    setStep('write')
  }

  function handleSend() {
    if (!selected||!body.trim()) return
    onSend({ recipientId:selected.id, recipientName:selected.name, recipientRole:selected.role||tab, recipientAvatar:selected.avatar, subject:subject||`Message to ${selected.name}`, body })
    setSent(true)
    setTimeout(onClose, 1200)
  }

  if (sent) return (
    <div style={{ position:'fixed', inset:0, zIndex:400, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:C.card, borderRadius:20, padding:'40px 32px', textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
        <div style={{ fontSize:16, fontWeight:700, color:C.text }}>Message sent!</div>
      </div>
    </div>
  )

  return (
    <div style={{ position:'fixed', inset:0, zIndex:400, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', display:'flex', alignItems:'flex-end' }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:C.card, borderRadius:'24px 24px 0 0', width:'100%', maxHeight:'90vh', overflow:'auto', padding:'20px 16px 40px' }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div style={{ fontSize:16, fontWeight:800, color:C.text }}>
            {step==='pick' ? '✏️ New Message' : `✏️ To: ${selected?.name}`}
          </div>
          <button onClick={onClose} style={{ background:C.inner, border:'none', borderRadius:10, padding:'7px 12px', color:C.muted, cursor:'pointer' }}>✕</button>
        </div>

        {step==='pick' && (<>
          {/* Group tabs */}
          <div style={{ display:'flex', gap:6, marginBottom:14 }}>
            {[['parents','👪 Parents'],['students','🎓 Students'],['teachers','👩‍🏫 Teachers'],['admin','🏫 Admin']].map(([k,l])=>(
              <button key={k} onClick={()=>setTab(k)}
                style={{ flex:1, padding:'8px 4px', borderRadius:10, border:'none', cursor:'pointer', fontSize:10, fontWeight:700,
                  background:tab===k?'var(--school-color,#BA0C2F)':C.inner, color:tab===k?'#fff':C.muted }}>
                {l}
              </button>
            ))}
          </div>

          {/* Contact list */}
          <div style={{ maxHeight:300, overflow:'auto', marginBottom:14 }}>
            {filtered.map(c=>(
              <button key={c.id} onClick={()=>{ setSelected(c); setStep('write') }}
                style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:12, padding:'10px 14px', display:'flex', alignItems:'center', gap:12, cursor:'pointer', textAlign:'left', marginBottom:6 }}
                onMouseEnter={e=>(e.currentTarget.style.background=C.raised)}
                onMouseLeave={e=>(e.currentTarget.style.background=C.inner)}>
                <Avatar emoji={c.avatar} size={36}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{c.name}</div>
                  <div style={{ fontSize:10, color:C.muted }}>{c.role}</div>
                </div>
                <RoleBadge role={tab.slice(0,-1)}/>
              </button>
            ))}
          </div>

          {/* Add by email */}
          <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
            <div style={{ fontSize:10, fontWeight:700, color:C.muted, marginBottom:8 }}>Or enter email / URL</div>
            <div style={{ display:'flex', gap:8 }}>
              <input value={emailInput} onChange={e=>setEmailInput(e.target.value)} placeholder="email@school.edu"
                style={{ flex:1, background:C.inner, border:`1px solid ${C.border}`, borderRadius:10, padding:'8px 12px', color:C.text, fontSize:13, outline:'none' }}/>
              <button onClick={addByEmail}
                style={{ background:'var(--school-color,#BA0C2F)', color:'#fff', border:'none', borderRadius:10, padding:'8px 14px', fontSize:12, fontWeight:700, cursor:'pointer' }}>Add</button>
            </div>
          </div>
        </>)}

        {step==='write' && (<>
          {/* Recipient chip */}
          <div style={{ display:'flex', alignItems:'center', gap:8, background:C.inner, borderRadius:12, padding:'8px 12px', marginBottom:12 }}>
            <span style={{ fontSize:20 }}>{selected?.avatar}</span>
            <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{selected?.name}</span>
            <RoleBadge role={selected?.role||tab.slice(0,-1)}/>
            <button onClick={()=>setStep('pick')} style={{ marginLeft:'auto', background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:12 }}>Change</button>
          </div>

          {/* Subject */}
          <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Subject line..."
            style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:12, padding:'10px 14px', color:C.text, fontSize:13, outline:'none', boxSizing:'border-box', marginBottom:10 }}/>

          {/* AI tone + generate */}
          <div style={{ display:'flex', gap:6, marginBottom:10, flexWrap:'wrap' }}>
            {AI_TONES.map(t=>(
              <button key={t.id} onClick={()=>setTone(t.id)}
                style={{ padding:'5px 10px', borderRadius:999, border:'none', cursor:'pointer', fontSize:10, fontWeight:700,
                  background:tone===t.id?`${C.teal}25`:C.inner, color:tone===t.id?C.teal:C.muted,
                  outline:tone===t.id?`1px solid ${C.teal}`:'none' }}>
                {t.emoji} {t.label}
              </button>
            ))}
            <button onClick={handleAI} disabled={aiLoading||!subject.trim()}
              style={{ padding:'5px 12px', borderRadius:999, border:`1px solid ${C.purple}40`, background:`${C.purple}18`, color:C.purple, fontSize:10, fontWeight:700, cursor:aiLoading?'wait':'pointer' }}>
              {aiLoading?'Generating...':'✨ AI Draft'}
            </button>
          </div>

          {/* Body */}
          <textarea rows={5} value={body} onChange={e=>setBody(e.target.value)} placeholder="Write your message..."
            style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:14, padding:'12px 14px', color:C.text, fontSize:13, resize:'none', boxSizing:'border-box', lineHeight:1.6, outline:'none', fontFamily:'inherit', marginBottom:14 }}/>

          {/* AI positive version note */}
          <div style={{ background:`${C.green}10`, border:`1px solid ${C.green}20`, borderRadius:10, padding:'8px 12px', marginBottom:14, fontSize:11, color:C.muted }}>
            <span style={{ color:C.green, fontWeight:700 }}>✨ AI tip:</span> Every message also has a positive framing ready. Tap AI Draft → Celebrating to send an encouraging version alongside this one.
          </div>

          <button onClick={handleSend} disabled={!body.trim()}
            style={{ width:'100%', background:body.trim()?'var(--school-color,#BA0C2F)':'#2a2f42', color:body.trim()?'#fff':C.muted, border:'none', borderRadius:999, padding:'14px', fontSize:15, fontWeight:800, cursor:body.trim()?'pointer':'not-allowed' }}>
            Send Message
          </button>
        </>)}
      </div>
    </div>
  )
}

// ─── THREAD VIEW ──────────────────────────────────────────────────────────────
function ThreadView({ thread, onBack }) {
  const [reply, setReply]   = useState('')
  const [messages, setMessages] = useState(thread.messages)
  const bottomRef = useRef(null)

  useEffect(()=>{ bottomRef.current?.scrollIntoView({ behavior:'smooth' }) },[messages])

  function send() {
    if (!reply.trim()) return
    const m = { id:Date.now(), sender:'Ms. Johnson', senderRole:'teacher', text:reply.trim(), time:'Just now', isMe:true }
    setMessages(ms=>[...ms,m])
    setReply('')
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg, var(--school-color,#BA0C2F) 0%, rgba(0,0,0,0.85) 100%)', padding:'16px', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={onBack} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
          <Avatar emoji={thread.recipientAvatar} size={36}/>
          <div>
            <div style={{ fontWeight:700, fontSize:15, color:'#fff' }}>{thread.recipientName}</div>
            <div style={{ display:'flex', gap:6, alignItems:'center', marginTop:2 }}>
              <RoleBadge role={thread.recipientRole}/>
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.5)' }}>{thread.subject}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, padding:'16px 16px 120px', overflowY:'auto' }}>
        {messages.map(msg=>(
          <div key={msg.id} style={{ display:'flex', justifyContent:msg.isMe?'flex-end':'flex-start', marginBottom:14 }}>
            {!msg.isMe && <Avatar emoji={thread.recipientAvatar} size={30} color={C.inner}/>}
            <div style={{ maxWidth:'78%', marginLeft:msg.isMe?0:10 }}>
              {!msg.isMe && <div style={{ fontSize:10, color:C.muted, marginBottom:3 }}>{msg.sender}</div>}
              <div style={{ background:msg.isMe?'var(--school-color,#BA0C2F)':C.inner, color:'#fff', borderRadius:msg.isMe?'16px 16px 4px 16px':'16px 16px 16px 4px', padding:'10px 14px', fontSize:13, lineHeight:1.6 }}>
                {msg.text}
              </div>
              <div style={{ fontSize:9, color:C.muted, marginTop:3, textAlign:msg.isMe?'right':'left' }}>{msg.time}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>

      {/* Reply bar */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, padding:'12px 16px max(16px,env(safe-area-inset-bottom))', background:`${C.bg}f0`, backdropFilter:'blur(16px)', borderTop:`1px solid ${C.border}`, display:'flex', gap:8, alignItems:'flex-end', zIndex:100 }}>
        <textarea value={reply} onChange={e=>setReply(e.target.value)} placeholder="Reply..."
          onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); send() }}}
          rows={1} style={{ flex:1, background:C.inner, border:`1px solid ${C.border}`, borderRadius:14, padding:'10px 14px', color:C.text, fontSize:13, resize:'none', outline:'none', maxHeight:100, fontFamily:'inherit' }}/>
        <button onClick={send} disabled={!reply.trim()}
          style={{ background:reply.trim()?'var(--school-color,#BA0C2F)':'#2a2f42', color:'#fff', border:'none', borderRadius:12, padding:'10px 16px', fontSize:13, fontWeight:700, cursor:reply.trim()?'pointer':'not-allowed', flexShrink:0 }}>
          Send
        </button>
      </div>
    </div>
  )
}

// ─── MAIN MESSAGES PAGE ────────────────────────────────────────────────────────
export default function ParentMessages({ onBack }) {
  const { goBack, messages: storeMessages } = useStore()
  const handleBack = onBack || goBack

  const [threads,         setThreads]         = useState(INITIAL_THREADS)
  const [selectedThread,  setSelectedThread]  = useState(null)
  const [composing,       setComposing]        = useState(false)
  const [tab,             setTab]             = useState('all')   // all | pending | sent | teachers | students | parents | admin
  const [search,          setSearch]          = useState('')

  const pending = threads.filter(t=>t.status==='pending'||t.unread)
  const unreadCount = threads.filter(t=>t.unread).length

  // Filter by tab
  const filtered = threads.filter(t=>{
    if (search && !t.recipientName.toLowerCase().includes(search.toLowerCase()) && !t.subject.toLowerCase().includes(search.toLowerCase())) return false
    if (tab==='pending') return t.status==='pending'
    if (tab==='unread')  return t.unread
    if (tab==='teachers') return t.recipientRole==='teacher'
    if (tab==='students') return t.recipientRole==='student'
    if (tab==='parents')  return t.recipientRole==='parent'
    if (tab==='admin')    return t.recipientRole==='admin'
    return true
  }).sort((a,b)=>{
    // Pending first, then by unread, then most recent
    if (a.status==='pending'&&b.status!=='pending') return -1
    if (b.status==='pending'&&a.status!=='pending') return 1
    if (a.unread&&!b.unread) return -1
    if (!a.unread&&b.unread) return 1
    return 0
  })

  function handleSend({ recipientId, recipientName, recipientRole, recipientAvatar, subject, body }) {
    const newThread = {
      id: Date.now(),
      recipientId, recipientName, recipientRole, recipientAvatar, subject,
      unread:false, aiDrafted:false, status:'sent',
      messages:[{ id:Date.now(), sender:'Ms. Johnson', senderRole:'teacher', text:body, time:'Just now', isMe:true }],
    }
    setThreads(ts=>[newThread,...ts])
    setComposing(false)
  }

  // Thread view
  if (selectedThread) {
    return <ThreadView thread={selectedThread} onBack={()=>setSelectedThread(null)}/>
  }

  const roleCounts = {
    teachers: threads.filter(t=>t.recipientRole==='teacher').length,
    students: threads.filter(t=>t.recipientRole==='student').length,
    parents:  threads.filter(t=>t.recipientRole==='parent').length,
    admin:    threads.filter(t=>t.recipientRole==='admin').length,
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", paddingBottom:80 }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg, var(--school-color,#BA0C2F) 0%, rgba(0,0,0,0.85) 100%)', padding:'16px 16px 20px', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {handleBack && <button onClick={handleBack} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>}
            <div>
              <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>💬 Messages</h1>
              <p style={{ fontSize:10, color:'rgba(255,255,255,0.55)', margin:0 }}>Teachers · Students · Parents · Admin</p>
            </div>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {unreadCount>0 && <span style={{ background:'rgba(240,74,74,0.3)', color:'#fff', borderRadius:999, padding:'3px 8px', fontSize:10, fontWeight:700 }}>{unreadCount} new</span>}
            <button onClick={()=>setComposing(true)}
              style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:700 }}>
              + New
            </button>
          </div>
        </div>

        {/* Search */}
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search messages..."
          style={{ width:'100%', background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:12, padding:'8px 14px', color:'#fff', fontSize:12, outline:'none', boxSizing:'border-box' }}/>
      </div>

      {/* Role filter tabs */}
      <div style={{ display:'flex', gap:6, padding:'12px 16px 0', overflowX:'auto' }}>
        {[
          ['all',     `All (${threads.length})`],
          ['parents', `👪 Parents (${roleCounts.parents})`],
          ['students',`🎓 Students (${roleCounts.students})`],
          ['teachers',`👩‍🏫 Teachers (${roleCounts.teachers})`],
          ['admin',   `🏫 Admin (${roleCounts.admin})`],
          ['pending', `⚠ Pending (${pending.length})`],
        ].map(([v,l])=>(
          <button key={v} onClick={()=>setTab(v)}
            style={{ padding:'6px 12px', borderRadius:999, border:'none', cursor:'pointer', fontSize:10, fontWeight:700, whiteSpace:'nowrap',
              background:tab===v?'var(--school-color,#BA0C2F)':C.inner, color:tab===v?'#fff':C.muted }}>
            {l}
          </button>
        ))}
      </div>

      {/* AI auto-draft notice */}
      {tab==='all'||tab==='pending' ? (
        <div style={{ margin:'12px 16px 0', background:`${C.teal}10`, border:`1px solid ${C.teal}20`, borderRadius:12, padding:'8px 12px', display:'flex', gap:8, alignItems:'center' }}>
          <span style={{ fontSize:16 }}>✨</span>
          <div style={{ fontSize:11, color:C.muted }}>
            <strong style={{ color:C.teal }}>AI writes every message</strong> — negative triggers get warm drafts, improvements get celebrations. You review before sending.
          </div>
        </div>
      ) : null}

      {/* Thread list */}
      <div style={{ padding:'12px 16px 0' }}>
        {filtered.length===0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px', color:C.muted }}>
            <div style={{ fontSize:48, marginBottom:12 }}>💬</div>
            <div style={{ fontSize:14, fontWeight:700, marginBottom:6 }}>No messages here</div>
            <button onClick={()=>setComposing(true)} style={{ background:'var(--school-color,#BA0C2F)', color:'#fff', border:'none', borderRadius:999, padding:'10px 24px', fontSize:13, fontWeight:700, cursor:'pointer', marginTop:8 }}>
              + Start a Conversation
            </button>
          </div>
        ) : (
          filtered.map(thread=>(
            <button key={thread.id} onClick={()=>setSelectedThread(thread)}
              style={{ width:'100%', background:thread.unread||thread.status==='pending'?C.inner:C.card, border:`1px solid ${thread.status==='pending'?C.amber+'50':thread.unread?'var(--school-color,#BA0C2F)30':C.border}`, borderRadius:18, padding:'14px 16px', marginBottom:10, display:'flex', gap:14, cursor:'pointer', textAlign:'left', transition:'background 0.15s' }}
              onMouseEnter={e=>(e.currentTarget.style.background=C.raised)}
              onMouseLeave={e=>(e.currentTarget.style.background=thread.unread||thread.status==='pending'?C.inner:C.card)}>

              {/* Avatar + status dot */}
              <div style={{ position:'relative', flexShrink:0 }}>
                <Avatar emoji={thread.recipientAvatar} size={42}/>
                {thread.unread && <div style={{ position:'absolute', top:-2, right:-2, width:10, height:10, borderRadius:'50%', background:C.red, border:`2px solid ${C.bg}` }}/>}
              </div>

              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:3 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, flex:1, minWidth:0 }}>
                    <span style={{ fontWeight:700, fontSize:14, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{thread.recipientName}</span>
                    <RoleBadge role={thread.recipientRole}/>
                  </div>
                  <div style={{ flexShrink:0, display:'flex', gap:4, alignItems:'center' }}>
                    {thread.status==='pending' && <span style={{ fontSize:9, fontWeight:700, color:C.amber, background:`${C.amber}18`, borderRadius:999, padding:'2px 6px' }}>Pending</span>}
                    {thread.aiDrafted && <span style={{ fontSize:9, color:C.teal }}>✨AI</span>}
                  </div>
                </div>
                <div style={{ fontSize:12, fontWeight:600, color:C.soft, marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{thread.subject}</div>
                <div style={{ fontSize:11, color:C.muted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {thread.messages[thread.messages.length-1]?.text||''}
                </div>
              </div>

              <span style={{ color:C.muted, fontSize:16, flexShrink:0, alignSelf:'center' }}>›</span>
            </button>
          ))
        )}
      </div>

      {/* Compose modal */}
      {composing && <ComposeModal onSend={handleSend} onClose={()=>setComposing(false)}/>}
    </div>
  )
}
