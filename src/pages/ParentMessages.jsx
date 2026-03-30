import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useStore } from '../lib/store'

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

const ALL_CONTACTS_BASE = Object.freeze({
  teachers:[
    { id:'t1', name:'Mr. Rivera',   role:'teacher', label:'Science Teacher', avatar:'🧑‍🔬' },
    { id:'t2', name:'Ms. Davis',    role:'teacher', label:'Reading Teacher', avatar:'👩‍💼' },
    { id:'t3', name:'Ms. Clark',    role:'teacher', label:'Writing Teacher', avatar:'✍️'  },
    { id:'t4', name:'Mr. Thompson', role:'teacher', label:'PE Teacher',      avatar:'🏃'  },
    { id:'t5', name:'Ms. Johnson',  role:'teacher', label:'Math Teacher',    avatar:'👩‍🏫' },
  ],
  students:[
    { id:'s1', name:'Aaliyah Brooks',  role:'student', label:'Student · Math', avatar:'👧' },
    { id:'s2', name:'Marcus Thompson', role:'student', label:'Student · Math', avatar:'👦' },
    { id:'s3', name:'Sofia Rodriguez', role:'student', label:'Student · Math', avatar:'👧' },
    { id:'s4', name:'Jordan Williams', role:'student', label:'Student · Math', avatar:'👦' },
    { id:'s5', name:'Priya Patel',     role:'student', label:'Student · Math', avatar:'👧' },
    { id:'s6', name:'Liam Martinez',   role:'student', label:'Student · Math', avatar:'👦' },
  ],
  parents:[
    { id:'p1', name:'Ms. Brooks',    role:'parent', label:'Parent · Aaliyah', avatar:'👩'    },
    { id:'p2', name:'Ms. Thompson',  role:'parent', label:'Parent · Marcus',  avatar:'👩'    },
    { id:'p3', name:'Mr. Rodriguez', role:'parent', label:'Parent · Sofia',   avatar:'👨'    },
    { id:'p4', name:'Ms. Williams',  role:'parent', label:'Parent · Jordan',  avatar:'👩'    },
    { id:'p5', name:'Dr. Patel',     role:'parent', label:'Parent · Priya',   avatar:'👩‍⚕️' },
  ],
  admin:[
    { id:'a1', name:'Principal Davis', role:'admin', label:'Principal',      avatar:'🏫' },
    { id:'a2', name:'Dr. Green',       role:'admin', label:'Vice Principal', avatar:'🎓' },
    { id:'a3', name:'Ms. Ortiz',       role:'admin', label:'Counselor',      avatar:'💬' },
  ],
});

const AI_TONES = [
  { id:'warm',        label:'Warm & Friendly', emoji:'🤗' },
  { id:'formal',      label:'Professional',    emoji:'💼' },
  { id:'urgent',      label:'Urgent',          emoji:'⚠️' },
  { id:'celebratory', label:'Celebrating',     emoji:'🎉' },
]

// ─── Thread seeds ─────────────────────────────────────────────────────────────
const TEACHER_THREADS = [
  { id:1, name:'Ms. Thompson', role:'parent', avatar:'👩', subject:'Marcus — Math Assessment',
    unread:true, aiDrafted:true, status:'pending', trigger:'Failed 58%', student:'Marcus Thompson', tone:'warm',
    msgs:[{ id:1, from:'Ms. Johnson', me:true,  text:"Dear Ms. Thompson, Marcus received 58% on his Math assessment. I'd love to connect this week to discuss support options.", time:'2 hr ago' }] },
  { id:2, name:'Ms. Brooks', role:'parent', avatar:'👩', subject:'Aaliyah — Outstanding Progress!',
    unread:false, aiDrafted:true, status:'sent', trigger:'Improved +12pts', student:'Aaliyah Brooks', tone:'celebratory',
    msgs:[
      { id:1, from:'Ms. Johnson', me:true,  text:"Great news! Aaliyah improved her Reading score by 12 points this month. She should be so proud!", time:'Yesterday' },
      { id:2, from:'Ms. Brooks',  me:false, text:"Oh my goodness, this made my day! Thank you so much.", time:'Yesterday 4pm' },
      { id:3, from:'Ms. Johnson', me:true,  text:"That at-home reading routine is clearly making a difference! Keep it up 🌟", time:'Yesterday 4:30pm' },
    ] },
  { id:3, name:'Mr. Rivera', role:'teacher', avatar:'🧑‍🔬', subject:'Cross-class collaboration',
    unread:true, status:'sent',
    msgs:[{ id:1, from:'Ms. Johnson', me:true, text:'Hey Mr. Rivera — I was thinking our classes could do a joint project connecting fractions/decimals with measurement in Science.', time:'1 hr ago' }] },
  { id:4, name:'Principal Davis', role:'admin', avatar:'🏫', subject:'Supply request',
    unread:false, status:'sent',
    msgs:[
      { id:1, from:'Ms. Johnson',     me:true,  text:"Hi Principal Davis, requesting fraction strips for my 3rd period Math class.", time:'3 days ago' },
      { id:2, from:'Principal Davis', me:false, text:"Fill out the supply request form on the shared drive and I'll approve it.", time:'3 days ago' },
    ] },
  { id:5, name:'Marcus Thompson', role:'student', avatar:'👦', subject:'Extra credit opportunity',
    unread:false, status:'sent',
    msgs:[
      { id:1, from:'Ms. Johnson',     me:true,  text:"Hi Marcus! I have an optional extra credit worksheet to help bring up your grade.", time:'2 days ago' },
      { id:2, from:'Marcus Thompson', me:false, text:'Thank you Ms. Johnson! I will come Thursday after school.', time:'2 days ago' },
    ] },
]

const STUDENT_THREADS = [
  { id:1, name:'Ms. Johnson', role:'teacher', avatar:'👩‍🏫', subject:'Math',
    unread:true, status:'sent',
    msgs:[
      { id:1, from:'Ms. Johnson', me:false, text:"Great work on yesterday's quiz, Marcus! You scored 87%. Keep it up!", time:'1 hr ago' },
      { id:2, from:'Marcus',      me:true,  text:"Thank you, Ms. Johnson! I studied really hard.", time:'45 min ago' },
      { id:3, from:'Ms. Johnson', me:false, text:"Don't forget the worksheet due Friday. Let me know if you need help!", time:'30 min ago' },
    ] },
  { id:2, name:'Mr. Lee', role:'teacher', avatar:'🧑‍🔬', subject:'Science',
    unread:false, status:'sent',
    msgs:[{ id:1, from:'Mr. Lee', me:false, text:"Reminder: Science fair project due Friday. Make sure to include your hypothesis!", time:'Yesterday' }] },
  { id:3, name:'Principal Davis', role:'admin', avatar:'🏫', subject:'Lunch schedule question',
    unread:false, status:'sent',
    msgs:[
      { id:1, from:'Marcus',          me:true,  text:"Hi Principal Davis, is the cafeteria open during 4th period?", time:'2 days ago' },
      { id:2, from:'Principal Davis', me:false, text:"Yes, students with 4th period late lunch can access the cafeteria at 12:15pm.", time:'2 days ago' },
    ] },
]

const PARENT_PRIVATE = [
  { id:1, name:'Ms. Johnson', role:'teacher', avatar:'👩‍🏫', subject:'Math · Private',
    unread:true, status:'sent', private:true,
    msgs:[
      { id:1, from:'Ms. Johnson', me:false, text:"Hi Ms. Thompson, I wanted to reach out about Marcus's recent progress. Science is a concern.", time:'1 hr ago' },
      { id:2, from:'Me',          me:true,  text:"Thank you for reaching out. I'll work with him on Science at home.", time:'45 min ago' },
      { id:3, from:'Ms. Johnson', me:false, text:"He has a test on Friday — please remind him to review chapters 3 & 4.", time:'30 min ago' },
    ] },
  { id:2, name:'Mr. Lee', role:'teacher', avatar:'🧑‍🔬', subject:'Science · Private',
    unread:false, status:'sent', private:true,
    msgs:[{ id:1, from:'Mr. Lee', me:false, text:"Hi Ms. Thompson, Marcus's Science grade has dropped. I recommend additional practice this week.", time:'Yesterday' }] },
  { id:3, name:'Principal Davis', role:'admin', avatar:'🏫', subject:'Bus schedule inquiry',
    unread:false, status:'sent', private:true,
    msgs:[
      { id:1, from:'Me',              me:true,  text:"Hi, I wanted to ask about the after-school bus schedule for Route 12.", time:'3 days ago' },
      { id:2, from:'Principal Davis', me:false, text:"Route 12 runs at 3:30pm and 4:15pm.", time:'3 days ago' },
    ] },
]

const PARENT_STUDENT_VIEW = [
  { id:10, name:'Ms. Johnson', role:'teacher', avatar:'👩‍🏫', subject:'Marcus · Math',
    unread:false, readOnly:true,
    msgs:[
      { id:1, from:'Ms. Johnson', me:false, text:"Great work on yesterday's quiz, Marcus! You scored 87%.", time:'1 hr ago' },
      { id:2, from:'Marcus',      me:false, text:"Thank you, Ms. Johnson! I studied really hard.", time:'45 min ago' },
      { id:3, from:'Ms. Johnson', me:false, text:"Don't forget the worksheet due Friday.", time:'30 min ago' },
    ] },
  { id:11, name:'Mr. Lee', role:'teacher', avatar:'🧑‍🔬', subject:'Marcus · Science',
    unread:false, readOnly:true,
    msgs:[{ id:1, from:'Mr. Lee', me:false, text:"Science fair project due Friday. Make sure to include your hypothesis!", time:'Yesterday' }] },
]

// ─── AI draft ─────────────────────────────────────────────────────────────────
async function aiDraft(trigger, recipientRole, studentName, tone) {
  // All AI calls now route through /api/ai for security
  try {
    const r = await fetch('/api/ai', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body:JSON.stringify({ 
        intent:'draft_parent_message',
        trigger,
        recipientRole,
        studentName: studentName || '',
        tone: tone || 'warm'
      })
    })
    if (!r.ok) return null
    const d = await r.json()
    return d?.message || d?.text || null
  } catch (e) {
    console.error('AI draft error:', e)
    return null
  }
}

// ─── helpers ──────────────────────────────────────────────────────────────────
function Av({ emoji, size=38, bg='var(--school-color,#BA0C2F)' }) {
  return <div style={{ width:size, height:size, borderRadius:'50%', background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.44, flexShrink:0 }}>{emoji}</div>
}

function Badge({ role }) {
  const m = { teacher:{c:C.blue,t:'Teacher'}, student:{c:C.green,t:'Student'}, parent:{c:C.amber,t:'Parent'}, admin:{c:C.purple,t:'Admin'} }
  const b = m[role]||m.teacher
  return <span style={{ background:`${b.c}18`, color:b.c, borderRadius:999, padding:'2px 7px', fontSize:9, fontWeight:700 }}>{b.t}</span>
}

// ─── COMPOSE SHEET ────────────────────────────────────────────────────────────
function Compose({ onSend, onClose, viewerRole }) {
  const { currentUser } = useStore();
  const isSupportStaff = currentUser?.role === 'supportStaff';
  const canMsg = { teacher:['parents','students','teachers','admin'], student:['teachers','admin'], parent:['teachers','admin'], admin:['teachers','students','parents','admin'], supportStaff:['students','teachers','admin'] }[viewerRole]||['teachers']
  const groupLabel = { parents:'👪 Parents', students:'🎓 Students', teachers:'👩‍🏫 Teachers', admin:'🏫 Admin' }

  const [step,      setStep]    = useState('pick')
  const [tab,       setTab]     = useState(canMsg[0])
  const [contact,   setContact] = useState(null)
  const [subject,   setSubject] = useState('')
  const [body,      setBody]    = useState('')
  const [tone,      setTone]    = useState('warm')
  const [loading,   setLoading] = useState(false)
  const [email,     setEmail]   = useState('')
  const [done,      setDone]    = useState(false)

  // Derive filtered contacts based on isSupportStaff
  const getFilteredContacts = (group) => {
    const contacts = ALL_CONTACTS_BASE[group] || [];
    if (isSupportStaff && (group === 'students' || group === 'teachers')) {
      return contacts.slice(0, group === 'students' ? 3 : 2);
    }
    return contacts;
  };

  async function doAI() {
    setLoading(true)
    const d = await aiDraft(subject, contact?.role||tab, contact?.name||'', tone)
    if (d) setBody(d)
    setLoading(false)
  }

  function send() {
    if (!contact||!body.trim()) return
    onSend({ name:contact.name, role:contact.role||tab, avatar:contact.avatar, subject:subject||`Message to ${contact.name}`, body })
    setDone(true); setTimeout(onClose, 1100)
  }

  if (done) return (
    <div style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:C.card, borderRadius:20, padding:'36px 28px', textAlign:'center' }}>
        <div style={{ fontSize:44, marginBottom:10 }}>✅</div>
        <div style={{ fontSize:15, fontWeight:700, color:C.text }}>Message sent!</div>
      </div>
    </div>
  )

  return (
    <div style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(0,0,0,0.72)', backdropFilter:'blur(4px)', display:'flex', alignItems:'flex-end' }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:C.card, borderRadius:'22px 22px 0 0', width:'100%', maxHeight:'88vh', overflow:'auto', padding:'18px 16px 36px' }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <span style={{ fontSize:16, fontWeight:800, color:C.text }}>{step==='pick'?'✏️ New Message':`To: ${contact?.name}`}</span>
          <button onClick={onClose} style={{ background:C.inner, border:'none', borderRadius:9, padding:'6px 11px', color:C.muted, cursor:'pointer' }}>✕</button>
        </div>

        {step==='pick' && <>
          <div style={{ display:'flex', gap:5, marginBottom:12, flexWrap:'wrap' }}>
            {canMsg.map(k=>(
              <button key={k} onClick={()=>setTab(k)}
                style={{ flex:1, minWidth:60, padding:'7px 4px', borderRadius:9, border:'none', cursor:'pointer', fontSize:10, fontWeight:700,
                  background:tab===k?'var(--school-color,#BA0C2F)':C.inner, color:tab===k?'#fff':C.muted }}>
                {groupLabel[k]||k}
              </button>
            ))}
          </div>
          <div style={{ maxHeight:270, overflow:'auto', marginBottom:12 }}>
            {getFilteredContacts(tab).map(c=>(
              <button key={c.id} onClick={()=>{ setContact(c); setStep('write') }}
                style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:11, padding:'10px 13px', display:'flex', alignItems:'center', gap:11, cursor:'pointer', textAlign:'left', marginBottom:5 }}
                onMouseEnter={e=>(e.currentTarget.style.background=C.raised)} onMouseLeave={e=>(e.currentTarget.style.background=C.inner)}>
                <Av emoji={c.avatar} size={34} bg={C.raised}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{c.name}</div>
                  <div style={{ fontSize:10, color:C.muted }}>{c.label}</div>
                </div>
                <Badge role={c.role}/>
              </button>
            ))}
          </div>
          <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:11 }}>
            <div style={{ fontSize:10, color:C.muted, marginBottom:7 }}>Or add by email</div>
            <div style={{ display:'flex', gap:7 }}>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@school.edu"
                style={{ flex:1, background:C.inner, border:`1px solid ${C.border}`, borderRadius:9, padding:'8px 11px', color:C.text, fontSize:12, outline:'none' }}/>
              <button onClick={()=>{ if(email.trim()){ setContact({id:'ext',name:email,role:'external',avatar:'📧'}); setEmail(''); setStep('write') }}}
                style={{ background:'var(--school-color,#BA0C2F)', color:'#fff', border:'none', borderRadius:9, padding:'8px 13px', fontSize:12, fontWeight:700, cursor:'pointer' }}>Add</button>
            </div>
          </div>
        </>}

        {step==='write' && <>
          <div style={{ display:'flex', alignItems:'center', gap:8, background:C.inner, borderRadius:11, padding:'8px 11px', marginBottom:11 }}>
            <span style={{ fontSize:18 }}>{contact?.avatar}</span>
            <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{contact?.name}</span>
            <Badge role={contact?.role}/>
            <button onClick={()=>setStep('pick')} style={{ marginLeft:'auto', background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:11 }}>Change</button>
          </div>
          <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Subject..."
            style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:11, padding:'9px 13px', color:C.text, fontSize:13, outline:'none', boxSizing:'border-box', marginBottom:9 }}/>

          {viewerRole==='teacher' && (
            <div style={{ display:'flex', gap:5, marginBottom:9, flexWrap:'wrap' }}>
              {AI_TONES.map(t=>(
                <button key={t.id} onClick={()=>setTone(t.id)}
                  style={{ padding:'5px 9px', borderRadius:999, border:'none', cursor:'pointer', fontSize:10, fontWeight:700,
                    background:tone===t.id?`${C.teal}22`:C.inner, color:tone===t.id?C.teal:C.muted, outline:tone===t.id?`1px solid ${C.teal}`:'none' }}>
                  {t.emoji} {t.label}
                </button>
              ))}
              <button onClick={doAI} disabled={loading||!subject.trim()}
                style={{ padding:'5px 11px', borderRadius:999, border:`1px solid ${C.purple}40`, background:`${C.purple}15`, color:C.purple, fontSize:10, fontWeight:700, cursor:loading?'wait':'pointer' }}>
                {loading?'Writing...':'✨ AI Draft'}
              </button>
            </div>
          )}

          <textarea rows={5} value={body} onChange={e=>setBody(e.target.value)} placeholder="Write your message..."
            style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:13, padding:'11px 13px', color:C.text, fontSize:13, resize:'none', boxSizing:'border-box', lineHeight:1.65, outline:'none', fontFamily:'inherit', marginBottom:12 }}/>

          {viewerRole==='teacher' && (
            <div style={{ background:`${C.green}0e`, border:`1px solid ${C.green}1a`, borderRadius:9, padding:'7px 11px', marginBottom:12, fontSize:11, color:C.muted }}>
              <span style={{ color:C.green, fontWeight:700 }}>★ Positive version</span> also drafted — tap Celebrating above for an encouraging framing.
            </div>
          )}

          <button onClick={send} disabled={!body.trim()}
            style={{ width:'100%', background:body.trim()?'var(--school-color,#BA0C2F)':'#22273a', color:body.trim()?'#fff':C.muted, border:'none', borderRadius:999, padding:'13px', fontSize:14, fontWeight:800, cursor:body.trim()?'pointer':'not-allowed' }}>
            Send Message
          </button>
        </>}
      </div>
    </div>
  )
}

// ─── THREAD VIEW ──────────────────────────────────────────────────────────────
function ThreadView({ thread, onBack, senderName }) {
  const [reply, setReply] = useState('')
  const [msgs,  setMsgs]  = useState(thread.msgs)
  const bottom = useRef(null)
  const isRO   = !!thread.readOnly

  useEffect(()=>{ bottom.current?.scrollIntoView({ behavior:'smooth' }) }, [msgs])

  function send() {
    if (!reply.trim()) return
    setMsgs(m=>[...m,{ id:Date.now(), from:senderName, me:true, text:reply.trim(), time:'Just now' }])
    setReply('')
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", display:'flex', flexDirection:'column' }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,var(--school-color,#BA0C2F) 0%,#060810 120%)', padding:'14px 16px', position:'sticky', top:0, zIndex:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:11 }}>
          <button onClick={onBack} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:9, padding:'7px 13px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
          <Av emoji={thread.avatar} size={36} bg='rgba(255,255,255,0.15)'/>
          <div>
            <div style={{ fontWeight:700, fontSize:15, color:'#fff' }}>{thread.name}</div>
            <div style={{ display:'flex', gap:5, alignItems:'center', marginTop:2 }}>
              <Badge role={thread.role}/>
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.45)' }}>{thread.subject}</span>
              {thread.private && <span style={{ fontSize:9, background:'rgba(240,74,74,0.22)', color:C.red, borderRadius:999, padding:'2px 6px', fontWeight:700 }}>🔒 Private</span>}
              {isRO       && <span style={{ fontSize:9, background:'rgba(255,255,255,0.1)',   color:'rgba(255,255,255,0.45)', borderRadius:999, padding:'2px 6px', fontWeight:700 }}>👁 View only</span>}
            </div>
          </div>
        </div>
      </div>

      {isRO && (
        <div style={{ margin:'10px 16px 0', background:'#0e0e1e', border:'1px solid rgba(255,255,255,0.08)', borderRadius:9, padding:'7px 12px', fontSize:11, color:C.muted, textAlign:'center' }}>
          👁 You're viewing Marcus's messages with his teacher — read only
        </div>
      )}

      {/* Messages */}
      <div style={{ flex:1, padding:'16px 16px 140px', overflowY:'auto' }}>
        {msgs.length===0 && (
          <div style={{ textAlign:'center', padding:'50px 0', color:C.muted }}>
            <div style={{ fontSize:36, marginBottom:10 }}>💬</div>
            <div style={{ fontSize:13 }}>Start the conversation</div>
          </div>
        )}
        {msgs.map(m=>(
          <div key={m.id} style={{ display:'flex', justifyContent:m.me?'flex-end':'flex-start', marginBottom:13 }}>
            {!m.me && <Av emoji={thread.avatar} size={28} bg={C.inner}/>}
            <div style={{ maxWidth:'78%', marginLeft:m.me?0:9 }}>
              {!m.me && <div style={{ fontSize:10, color:C.muted, marginBottom:3 }}>{m.from}</div>}
              <div style={{ background:m.me?'var(--school-color,#BA0C2F)':C.inner, color:'#fff', borderRadius:m.me?'15px 15px 4px 15px':'15px 15px 15px 4px', padding:'10px 13px', fontSize:13, lineHeight:1.6 }}>
                {m.text}
              </div>
              <div style={{ fontSize:9, color:C.muted, marginTop:3, textAlign:m.me?'right':'left' }}>{m.time}</div>
            </div>
          </div>
        ))}
        <div ref={bottom}/>
      </div>

      {/* Reply bar — sits above bottom nav at bottom:72px, never hidden */}
      {!isRO && (
        <div style={{ position:'fixed', bottom:72, left:0, right:0, padding:'11px 15px', background:`${C.bg}f5`, backdropFilter:'blur(16px)', borderTop:`1px solid ${C.border}`, display:'flex', gap:8, alignItems:'flex-end', zIndex:150 }}>
          <textarea value={reply} onChange={e=>setReply(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); send() }}}
            placeholder="Reply..." rows={1}
            style={{ flex:1, background:C.inner, border:`1px solid ${C.border}`, borderRadius:13, padding:'9px 13px', color:C.text, fontSize:13, resize:'none', outline:'none', maxHeight:90, fontFamily:'inherit' }}/>
          <button onClick={send} disabled={!reply.trim()}
            style={{ background:reply.trim()?'var(--school-color,#BA0C2F)':'#22273a', color:'#fff', border:'none', borderRadius:11, padding:'9px 15px', fontSize:13, fontWeight:700, cursor:reply.trim()?'pointer':'not-allowed', flexShrink:0 }}>
            Send
          </button>
        </div>
      )}
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function ParentMessages({ onBack, viewerRole='teacher' }) {
const { currentUser } = useStore()

  const { goBack } = useStore()
  const handleBack = onBack || goBack

const SUPPORT_THREADS = [
  { id:6, name:'Marcus Thompson', role:'student', avatar:'👦', subject:'Progress check-in',
    unread:true, status:'sent',
    msgs:[
      { id:1, from:'Ms. Carter', me:true, text:"Hi Marcus, just checking in on your Math grades. How's the practice going?", time:'2 hr ago' },
      { id:2, from:'Marcus Thompson', me:false, text:"Hi Ms. Carter, I did the practice worksheet. It's better now!", time:'1 hr ago' },
    ] },
  { id:7, name:'Mr. Rivera', role:'teacher', avatar:'🧑‍🔬', subject:'Student support plan',
    unread:false, status:'sent',
    msgs:[
      { id:1, from:'Ms. Carter', me:true, text:"Mr. Rivera, Marcus (3rd period) needs extra Science practice sheets.", time:'Yesterday' },
      { id:2, from:'Mr. Rivera', me:false, text:"Got it, I'll send 5 worksheets to the office by tomorrow.", time:'Yesterday' },
    ] },
  { id:8, name:'Principal Davis', role:'admin', avatar:'🏫', subject:'Counseling referral',
    unread:true, status:'sent',
    msgs:[
      { id:1, from:'Ms. Carter', me:true, text:"Principal Davis, recommending Sofia Rodriguez for counseling services.", time:'3 days ago' },
      { id:2, from:'Principal Davis', me:false, text:"Thank you Ms. Carter. I've scheduled her initial meeting for Thursday.", time:'2 days ago' },
    ] },
]

const seed = viewerRole==='supportStaff' ? SUPPORT_THREADS
             : viewerRole==='student' ? STUDENT_THREADS
             : viewerRole==='parent'  ? PARENT_PRIVATE
             : TEACHER_THREADS

  const [threads,   setThreads]   = useState(seed)
  const [active,    setActive]    = useState(null)
  const [composing, setComposing] = useState(false)
  const [tab,       setTab]       = useState('all')
  const [search,    setSearch]    = useState('')

  // Parent-only toggle
  const [pView, setPView] = useState('private')
  const isParent = viewerRole==='parent'

  // For parents: show student view (read-only) or private (interactive) threads
  const displayList = useMemo(() => {
    if (!isParent) return threads
    return pView === 'student' ? PARENT_STUDENT_VIEW : threads
  }, [pView, threads, isParent])

  const pending     = threads.filter(t=>t.status==='pending')
  const unread      = threads.filter(t=>t.unread).length

  // Filter tabs per role
  const TABS = {
    teacher:[
      { k:'all',      l:`All (${threads.length})` },
      { k:'parents',  l:`👪 Parents (${threads.filter(t=>t.role==='parent').length})` },
      { k:'students', l:`🎓 Students (${threads.filter(t=>t.role==='student').length})` },
      { k:'teachers', l:`👩‍🏫 Teachers (${threads.filter(t=>t.role==='teacher').length})` },
      { k:'admin',    l:`🏫 Admin (${threads.filter(t=>t.role==='admin').length})` },
      { k:'pending',  l:`⚠ Pending (${pending.length})` },
    ],
    student:[
      { k:'all',      l:`All (${threads.length})` },
      { k:'teachers', l:`👩‍🏫 Teachers (${threads.filter(t=>t.role==='teacher').length})` },
      { k:'admin',    l:`🏫 Admin (${threads.filter(t=>t.role==='admin').length})` },
    ],
    admin:[
      { k:'all',      l:`All (${threads.length})` },
      { k:'parents',  l:`👪 Parents (${threads.filter(t=>t.role==='parent').length})` },
      { k:'students', l:`🎓 Students (${threads.filter(t=>t.role==='student').length})` },
      { k:'teachers', l:`👩‍🏫 Teachers (${threads.filter(t=>t.role==='teacher').length})` },
      { k:'admin',    l:`🏫 Admin (${threads.filter(t=>t.role==='admin').length})` },
      { k:'pending',  l:`⚠ Pending (${pending.length})` },
    ],
    parent:[], // parent uses toggle instead of tabs
    supportStaff:[
      { k:'all',      l:`All (${threads.length})` },
      { k:'students', l:`🎓 Students (${threads.filter(t=>t.role==='student').length})` },
      { k:'teachers', l:`👩‍🏫 Teachers (${threads.filter(t=>t.role==='teacher').length})` },
      { k:'admin',    l:`🏫 Admin (${threads.filter(t=>t.role==='admin').length})` },
    ],
  }[viewerRole]||[]

  const visible = displayList.filter(t=>{
    const q = search.toLowerCase()
    if (q && !t.name.toLowerCase().includes(q) && !t.subject.toLowerCase().includes(q)) return false
    if (tab==='pending')  return t.status==='pending'
    if (tab==='teachers') return t.role==='teacher'
    if (tab==='students') return t.role==='student'
    if (tab==='parents')  return t.role==='parent'
    if (tab==='admin')    return t.role==='admin'
    return true
  }).sort((a,b)=>{
    if (a.status==='pending'&&b.status!=='pending') return -1
    if (b.status==='pending'&&a.status!=='pending') return 1
    if (a.unread&&!b.unread) return -1
    if (!a.unread&&b.unread) return 1
    return 0
  })

  function handleNewMsg({ name, role, avatar, subject, body }) {
    const t = { id:Date.now(), name, role, avatar, subject, unread:false, status:'sent',
      msgs:[{ id:1, from:'Me', me:true, text:body, time:'Just now' }] }
    setThreads(ts=>[t,...ts])
    setComposing(false)
  }

  const senderName = viewerRole==='supportStaff'
    ? (currentUser?.userName || currentUser?.name || 'Ms. Carter')
    : ({ teacher:'Ms. Johnson', student:'Marcus', parent:'Ms. Thompson', admin:'Principal Carter' }[viewerRole] || 'Me')

  // Thread view
  if (active) {
    return <ThreadView thread={active} onBack={()=>setActive(null)} senderName={senderName}/>
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", paddingBottom:80 }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ background:'linear-gradient(135deg,var(--school-color,#BA0C2F) 0%,#060810 120%)', padding:'14px 16px 18px', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            {handleBack && (
              <button onClick={handleBack} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:9, padding:'7px 13px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
            )}
            <div>
              <div style={{ fontSize:20, fontWeight:800, color:'#fff' }}>💬 Messages</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)', marginTop:1 }}>
                { viewerRole==='teacher'      ? 'Teachers · Students · Parents · Admin'
                : viewerRole==='student'      ? 'Teachers · Admin'
                : viewerRole==='parent'       ? 'Teachers · Admin'
                : viewerRole==='supportStaff' ? 'Students · Teachers · Admin'
                :                               'Teachers · Students · Parents · Admin' }
              </div>
            </div>
          </div>
          <div style={{ display:'flex', gap:7, alignItems:'center' }}>
            {unread>0 && (
              <span style={{ background:'rgba(240,74,74,0.28)', color:'#fff', borderRadius:999, padding:'2px 8px', fontSize:10, fontWeight:700 }}>{unread} new</span>
            )}
            {!(isParent && pView==='student') && (
              <button onClick={()=>setComposing(true)}
                style={{ background:'rgba(255,255,255,0.18)', border:'none', borderRadius:9, padding:'7px 13px', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:700 }}>
                + New
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search messages..."
          style={{ width:'100%', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.18)', borderRadius:11, padding:'8px 13px', color:'#fff', fontSize:12, outline:'none', boxSizing:'border-box' }}/>
      </div>

      {/* ── Parent-only toggle ──────────────────────────────────────────────── */}
      {isParent && (
        <>
          <div style={{ margin:'12px 16px 0', background:C.inner, borderRadius:13, padding:4, display:'flex' }}>
            <button onClick={()=>setPView('student')}
              style={{ flex:1, padding:'8px', borderRadius:9, border:'none', cursor:'pointer', fontSize:12, fontWeight:700, transition:'all 0.18s',
                background:pView==='student'?'linear-gradient(135deg,#0f766e,#1d4ed8)':'transparent', color:pView==='student'?'#fff':C.muted }}>
              👁 Student View
            </button>
            <button onClick={()=>setPView('private')}
              style={{ flex:1, padding:'8px', borderRadius:9, border:'none', cursor:'pointer', fontSize:12, fontWeight:700, transition:'all 0.18s',
                background:pView==='private'?'linear-gradient(135deg,#7c1d1d,#1d2040)':'transparent', color:pView==='private'?C.red:C.muted }}>
              🔒 Private w/ Teacher
            </button>
          </div>
          {pView==='private' && (
            <div style={{ margin:'8px 16px 0', background:'#180808', border:`1px solid ${C.red}28`, borderRadius:9, padding:'6px 12px', textAlign:'center' }}>
              <span style={{ fontSize:10, color:C.red, fontWeight:700 }}>🔒 PRIVATE — Only you and the teacher see these</span>
            </div>
          )}
          {pView==='student' && (
            <div style={{ margin:'8px 16px 0', background:'#080814', border:'1px solid rgba(255,255,255,0.07)', borderRadius:9, padding:'6px 12px', textAlign:'center' }}>
              <span style={{ fontSize:10, color:C.muted }}>👁 Viewing Marcus's messages with teachers — read only</span>
            </div>
          )}
        </>
      )}

      {/* ── Filter tabs (teacher / student / admin only) ─────────────────── */}
      {TABS.length>0 && (
        <div style={{ display:'flex', gap:6, padding:'12px 16px 0', overflowX:'auto' }}>
          {TABS.map(({ k,l })=>(
            <button key={k} onClick={()=>setTab(k)}
              style={{ padding:'6px 12px', borderRadius:999, border:'none', cursor:'pointer', fontSize:10, fontWeight:700, whiteSpace:'nowrap',
                background:tab===k?'var(--school-color,#BA0C2F)':C.inner, color:tab===k?'#fff':C.muted }}>
              {l}
            </button>
          ))}
        </div>
      )}

      {/* AI notice — teacher only */}
      {viewerRole==='teacher' && (tab==='all'||tab==='pending') && (
        <div style={{ margin:'11px 16px 0', background:`${C.teal}0d`, border:`1px solid ${C.teal}1f`, borderRadius:11, padding:'8px 12px', display:'flex', gap:8, alignItems:'center' }}>
          <span style={{ fontSize:15 }}>✨</span>
          <div style={{ fontSize:11, color:C.muted, lineHeight:1.4 }}>
            <strong style={{ color:C.teal }}>AI writes every message</strong> — negative triggers get warm drafts, improvements get celebrations. You review before sending.
          </div>
        </div>
      )}

      {/* ── Thread list ─────────────────────────────────────────────────────── */}
      <div style={{ padding:'12px 16px 0' }}>
        {visible.length===0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px', color:C.muted }}>
            <div style={{ fontSize:44, marginBottom:12 }}>💬</div>
            <div style={{ fontSize:14, fontWeight:700, marginBottom:5 }}>No messages here</div>
            {!(isParent && pView==='student') && (
              <button onClick={()=>setComposing(true)} style={{ background:'var(--school-color,#BA0C2F)', color:'#fff', border:'none', borderRadius:999, padding:'10px 22px', fontSize:13, fontWeight:700, cursor:'pointer', marginTop:8 }}>
                + Start a Conversation
              </button>
            )}
          </div>
        ) : visible.map(t=>{
          const lastMsg = t.msgs[t.msgs.length-1]
          const isPending = t.status==='pending'
          return (
            <div key={t.id}
              style={{ background:t.unread||isPending?C.inner:C.card, border:`1px solid ${isPending?C.amber+'48':t.unread?'var(--school-color,#BA0C2F)28':C.border}`, borderRadius:17, padding:'13px 15px', marginBottom:9, display:'flex', gap:13, transition:'background 0.13s' }}
              onMouseEnter={e=>(e.currentTarget.style.background=C.raised)} onMouseLeave={e=>(e.currentTarget.style.background=t.unread||isPending?C.inner:C.card)}>

              {/* Avatar */}
              <div style={{ cursor:'pointer', position:'relative', flexShrink:0 }} onClick={()=>setActive(t)}>
                <Av emoji={t.avatar} size={42}/>
                {t.unread && <div style={{ position:'absolute', top:-1, right:-1, width:10, height:10, borderRadius:'50%', background:C.red, border:`2px solid ${C.bg}` }}/>}
              </div>

              {/* Content */}
              <div style={{ flex:1, minWidth:0, cursor:'pointer' }} onClick={()=>setActive(t)}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:3 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:5, flex:1, minWidth:0 }}>
                    <span style={{ fontWeight:700, fontSize:14, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.name}</span>
                    <Badge role={t.role}/>
                    {t.private   && <span style={{ fontSize:9, color:C.red   }}>🔒</span>}
                    {t.readOnly  && <span style={{ fontSize:9, color:C.muted }}>👁</span>}
                    {t.aiDrafted && <span style={{ fontSize:9, color:C.teal  }}>✨AI</span>}
                  </div>
                  {isPending && <span style={{ fontSize:9, fontWeight:700, color:C.amber, background:`${C.amber}18`, borderRadius:999, padding:'2px 6px', flexShrink:0 }}>Pending</span>}
                </div>
                <div style={{ fontSize:12, fontWeight:600, color:C.soft, marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.subject}</div>
                <div style={{ fontSize:11, color:C.muted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{lastMsg?.text||''}</div>
              </div>

              {/* Reply button — every thread, every role */}
              <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', flexShrink:0 }}>
                <button onClick={()=>setActive(t)}
                  style={{ background:t.readOnly?C.inner:`var(--school-color,#BA0C2F)18`, color:t.readOnly?C.muted:'var(--school-color,#BA0C2F)', border:`1px solid ${t.readOnly?C.border:'var(--school-color,#BA0C2F)30'}`, borderRadius:9, padding:'6px 11px', fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
                  {t.readOnly ? '👁 View' : 'Reply →'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {composing && <Compose onSend={handleNewMsg} onClose={()=>setComposing(false)} viewerRole={viewerRole}/>}
    </div>
  )
}
