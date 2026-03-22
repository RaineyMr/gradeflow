import React, { useState, useRef, useEffect } from 'react'
import ClassFeed      from './ClassFeed'
import ParentMessages from './ParentMessages'

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

const STUDENT = {
  name:'Marcus', fullName:'Marcus Thompson',
  grade:'3rd Grade', school:'Houston ISD · Lincoln Elementary',
  gpa:87.4,
  classes:[
    { id:1, subject:'Math',    teacher:'Ms. Johnson', grade:87, letter:'B', period:'1st', color:'#3b7ef4' },
    { id:2, subject:'Reading', teacher:'Ms. Davis',   grade:95, letter:'A', period:'2nd', color:'#22c97a' },
    { id:3, subject:'Science', teacher:'Mr. Lee',     grade:61, letter:'D', period:'3rd', color:'#f04a4a' },
    { id:4, subject:'Writing', teacher:'Ms. Clark',   grade:88, letter:'B', period:'4th', color:'#f54a7a' },
  ],
  assignments:[
    { id:1, name:'Ch.4 Worksheet', subject:'Math',   due:'Today',    status:'pending'   },
    { id:2, name:'Book Report',    subject:'Reading', due:'Tomorrow', status:'pending'   },
    { id:3, name:'Lab Report',     subject:'Science', due:'Friday',   status:'submitted' },
  ],
  alerts:[
    { id:1, msg:'Science grade is 61% — below passing', color:'#f04a4a', icon:'⚑' },
    { id:2, msg:'2 assignments due this week',           color:'#f5a623', icon:'📋' },
  ],
  threads:[
    { id:1, name:'Ms. Johnson', subject:'Math', avatar:'👩‍🏫', role:'teacher', unread:true,
      msgs:[
        { id:1, from:'Ms. Johnson', me:false, text:"Great work on yesterday's quiz, Marcus! You scored 87%. Keep it up!", time:'1 hr ago' },
        { id:2, from:'Marcus',      me:true,  text:"Thank you, Ms. Johnson! I studied really hard.", time:'45 min ago' },
        { id:3, from:'Ms. Johnson', me:false, text:"Don't forget the worksheet due Friday. Let me know if you need help!", time:'30 min ago' },
      ] },
    { id:2, name:'Mr. Lee', subject:'Science', avatar:'🧑‍🔬', role:'teacher', unread:false,
      msgs:[{ id:1, from:'Mr. Lee', me:false, text:"Reminder: Science fair project due Friday.", time:'Yesterday' }] },
    { id:3, name:'Ms. Clark', subject:'Writing', avatar:'✍️', role:'teacher', unread:false,
      msgs:[{ id:1, from:'Ms. Clark', me:false, text:'Your essay draft was excellent!', time:'2 days ago' }] },
  ],
  feed:[
    { id:1, author:'Ms. Johnson', content:'📅 Unit Test Friday! Review chapters 3–4.', time:'2 hours ago', readCount:18, totalCount:24, reactions:{'👍':12,'❤️':5,'😊':3} },
    { id:2, author:'Ms. Johnson', content:"🎉 Great work on yesterday's homework! Class avg 87%.", time:'Yesterday', readCount:22, totalCount:24, reactions:{'👍':18,'❤️':9,'😂':2} },
  ],
}

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

// ─── BOTTOM NAV — untouched ───────────────────────────────────────────────────
function BottomNav({ active, onSelect, isSubPage }) {
  const homeItems = [
    { id:'grades',   icon:'📊', label:'Grades'   },
    { id:'messages', icon:'💬', label:'Messages' },
    { id:'home',     icon:'🏠', label:'Home'     },
    { id:'feed',     icon:'📢', label:'Feed'     },
    { id:'alerts',   icon:'🔔', label:'Alerts'   },
  ]
  const subItems = [
    { id:'__back__', icon:'←',  label:'Back'     },
    { id:'grades',   icon:'📊', label:'Grades'   },
    { id:'messages', icon:'💬', label:'Messages' },
    { id:'feed',     icon:'📢', label:'Feed'     },
    { id:'alerts',   icon:'🔔', label:'Alerts'   },
  ]
  const items = isSubPage ? subItems : homeItems
  return (
    <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:200, background:'rgba(0,13,31,0.97)', backdropFilter:'blur(20px)', borderTop:`1px solid ${T.border}`, padding:'8px 0 max(14px,env(safe-area-inset-bottom))', display:'grid', gridTemplateColumns:`repeat(${items.length},1fr)` }}>
      {items.map(item=>{
        const isActive = item.id===active && item.id!=='__back__'
        return (
          <button key={item.id} onClick={()=>onSelect(item.id)}
            style={{ background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'5px 2px', position:'relative' }}>
            <span style={{ fontSize:item.id==='__back__'?20:18, transition:'transform 0.15s', transform:isActive?'scale(1.15)':'scale(1)', color:item.id==='__back__'?T.soft:'inherit' }}>{item.icon}</span>
            <span style={{ fontSize:9, fontWeight:isActive?700:400, color:isActive?T.secondary:T.muted }}>{item.label}</span>
            {isActive && <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:24, height:2, background:T.secondary, borderRadius:1 }}/>}
          </button>
        )
      })}
    </div>
  )
}

// ─── EDIT MODE BAR ────────────────────────────────────────────────────────────
function EditModeBar() {
  return (
    <div style={{ margin:'4px 12px 24px', background:T.inner, border:`1px solid ${T.border}`, borderRadius:14, padding:'11px 14px', textAlign:'center' }}>
      <div style={{ fontSize:11, fontWeight:700, color:T.soft, marginBottom:3 }}>— Hold any widget → Edit Mode</div>
      <div style={{ fontSize:10, color:T.muted, lineHeight:1.6 }}>
        Drag to rearrange · Pinch to resize · + to add · All widgets available<br/>
        Saved to your account · Same layout on all devices
      </div>
    </div>
  )
}

// ─── THREAD VIEW (reply bar above nav) ───────────────────────────────────────
function ThreadView({ thread, onBack }) {
  const [reply, setReply] = useState('')
  const [msgs,  setMsgs]  = useState(thread.msgs)
  const bottom = useRef(null)

  useEffect(()=>{ bottom.current?.scrollIntoView({ behavior:'smooth' }) }, [msgs])

  function send() {
    if (!reply.trim()) return
    setMsgs(m=>[...m, { id:Date.now(), from:'Marcus', me:true, text:reply.trim(), time:'Just now' }])
    setReply('')
  }

  return (
    <div style={{ minHeight:'100vh', background:T.bg, color:T.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ background:T.header, padding:'14px 16px', position:'sticky', top:0, zIndex:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:11 }}>
          <button onClick={onBack} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:9, padding:'7px 13px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
          <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{thread.avatar}</div>
          <div>
            <div style={{ fontWeight:700, fontSize:15, color:'#fff' }}>{thread.name}</div>
            <div style={{ display:'flex', gap:5, alignItems:'center', marginTop:2 }}>
              <span style={{ fontSize:9, background:`${T.blue}18`, color:T.blue, borderRadius:999, padding:'2px 6px', fontWeight:700 }}>Teacher</span>
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.45)' }}>{thread.subject}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, padding:'16px 16px 120px', overflowY:'auto' }}>
        {msgs.map(m=>(
          <div key={m.id} style={{ display:'flex', justifyContent:m.me?'flex-end':'flex-start', marginBottom:13 }}>
            {!m.me && (
              <div style={{ width:28, height:28, borderRadius:'50%', background:T.inner, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, marginRight:9, flexShrink:0 }}>{thread.avatar}</div>
            )}
            <div style={{ maxWidth:'78%' }}>
              {!m.me && <div style={{ fontSize:10, color:T.muted, marginBottom:3 }}>{m.from}</div>}
              <div style={{ background:m.me?T.primary:T.inner, color:'#fff', borderRadius:m.me?'15px 15px 4px 15px':'15px 15px 15px 4px', padding:'10px 13px', fontSize:13, lineHeight:1.6 }}>
                {m.text}
              </div>
              <div style={{ fontSize:9, color:T.muted, marginTop:3, textAlign:m.me?'right':'left' }}>{m.time}</div>
            </div>
          </div>
        ))}
        <div ref={bottom}/>
      </div>

      {/* Reply bar — fixed above bottom nav at bottom: 72px */}
      <div style={{ position:'fixed', bottom:72, left:0, right:0, padding:'10px 14px', background:`${T.bg}f5`, backdropFilter:'blur(14px)', borderTop:`1px solid ${T.border}`, display:'flex', gap:8, alignItems:'flex-end', zIndex:150 }}>
        <textarea value={reply} onChange={e=>setReply(e.target.value)}
          onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); send() }}}
          placeholder="Reply to teacher..." rows={1}
          style={{ flex:1, background:T.inner, border:`1px solid ${T.border}`, borderRadius:13, padding:'9px 13px', color:T.text, fontSize:13, resize:'none', outline:'none', maxHeight:90, fontFamily:'inherit' }}/>
        <button onClick={send} disabled={!reply.trim()}
          style={{ background:reply.trim()?T.primary:'#0a1428', color:reply.trim()?'#fff':T.muted, border:'none', borderRadius:11, padding:'9px 16px', fontSize:13, fontWeight:700, cursor:reply.trim()?'pointer':'not-allowed', flexShrink:0 }}>
          Send
        </button>
      </div>
    </div>
  )
}

// ─── SUB-PAGES ────────────────────────────────────────────────────────────────
function GradesPage({ onBack }) {
  return (
    <div style={{ minHeight:'100vh', background:T.bg, color:T.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", paddingBottom:80 }}>
      <div style={{ background:T.header, padding:'16px 16px 20px' }}>
        <button onClick={onBack} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:12 }}>← Back</button>
        <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>📊 My Grades</h1>
      </div>
      <div style={{ padding:'16px' }}>
        {STUDENT.classes.map(c=>(
          <div key={c.id} style={{ background:T.card, border:`1px solid ${T.border}`, borderLeft:`4px solid ${c.color}`, borderRadius:16, padding:'14px 16px', marginBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:T.text }}>{c.subject}</div>
                <div style={{ fontSize:11, color:T.muted }}>{c.teacher} · {c.period} Period</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:20, fontWeight:900, color:gradeColor(c.grade) }}>{c.grade}%</div>
                <div style={{ fontSize:11, fontWeight:700, color:gradeColor(c.grade) }}>{c.letter}</div>
              </div>
            </div>
            <GradeBar score={c.grade}/>
          </div>
        ))}
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:'14px 16px' }}>
          <div style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:12 }}>📋 Assignments</div>
          {STUDENT.assignments.map(a=>(
            <div key={a.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:`1px solid ${T.border}` }}>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:T.text }}>{a.name}</div>
                <div style={{ fontSize:10, color:T.muted }}>{a.subject} · Due: {a.due}</div>
              </div>
              <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:999, background:a.status==='submitted'?`${T.green}18`:`${T.amber}18`, color:a.status==='submitted'?T.green:T.amber }}>
                {a.status==='submitted'?'✓ Submitted':'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AlertsPage({ onBack }) {
  return (
    <div style={{ minHeight:'100vh', background:T.bg, color:T.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", paddingBottom:80 }}>
      <div style={{ background:T.header, padding:'16px 16px 20px' }}>
        <button onClick={onBack} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:12 }}>← Back</button>
        <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>🔔 Alerts</h1>
      </div>
      <div style={{ padding:'16px' }}>
        {STUDENT.alerts.map(a=>(
          <div key={a.id} style={{ background:T.card, border:`1px solid ${a.color}30`, borderLeft:`4px solid ${a.color}`, borderRadius:14, padding:'14px 16px', marginBottom:10 }}>
            <div style={{ fontSize:20, marginBottom:6 }}>{a.icon}</div>
            <div style={{ fontSize:13, color:T.text }}>{a.msg}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ navigate, openThread }) {
  const unreadCount  = STUDENT.threads.filter(t=>t.unread).length
  const pendingCount = STUDENT.assignments.filter(a=>a.status==='pending').length

  // Daily overview — untouched
  const overviewTiles = [
    { icon:'📊', val:STUDENT.gpa,         label:'GPA',         page:'grades',   color:T.secondary },
    { icon:'💬', val:unreadCount||'',      label:'Messages',    page:'messages', color:T.purple    },
    { icon:'📋', val:pendingCount||'',     label:'Assignments', page:'grades',   color:T.teal      },
    { icon:'🔔', val:STUDENT.alerts.length||'', label:'Alerts', page:'alerts',  color:T.red       },
  ]

  return (
    <div style={{ padding:'12px 12px 0' }}>

      {/* W1: Daily Overview — untouched */}
      <Widget style={{ background:`linear-gradient(135deg,${T.primary} 0%,#001020 100%)`, border:'none' }}>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:12 }}>DAILY OVERVIEW</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
          {overviewTiles.map(tile=>(
            <button key={tile.label} onClick={e=>{ e.stopPropagation(); navigate(tile.page) }}
              style={{ background:`${tile.color}18`, border:`1px solid ${tile.color}30`, borderRadius:14, padding:'12px 4px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
              <span style={{ fontSize:18 }}>{tile.icon}</span>
              {tile.val!=='' && <span style={{ fontSize:16, fontWeight:900, color:tile.color, lineHeight:1 }}>{tile.val}</span>}
              <span style={{ fontSize:8, color:'rgba(255,255,255,0.5)', textAlign:'center', fontWeight:600 }}>{tile.label}</span>
            </button>
          ))}
        </div>
      </Widget>

      {/* W2: Today's Lessons */}
      <Widget style={{ background:'linear-gradient(135deg,#001830,#000d1f)', border:`1px solid #003a6a` }}>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:8 }}>TODAY'S LESSONS 📖</div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:'#fff', marginBottom:3 }}>Ch.4 · Fractions & Decimals</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)' }}>Math · Pages 84–91 · Ms. Johnson</div>
          </div>
          <span style={{ fontSize:10, color:T.amber, background:`${T.amber}18`, borderRadius:999, padding:'3px 8px', fontWeight:700, flexShrink:0, marginLeft:8 }}>+3 more today</span>
        </div>
        <button onClick={e=>e.stopPropagation()}
          style={{ marginTop:10, background:`${T.teal}22`, color:T.teal, border:`1px solid ${T.teal}40`, borderRadius:10, padding:'7px 13px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
          View Worksheet 📄
        </button>
      </Widget>

      {/* W3: My Classes */}
      <Widget onClick={()=>navigate('grades')}>
        <div style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:12 }}>📚 My Classes</div>
        <div style={{ fontSize:10, color:T.muted, marginBottom:10 }}>Tap class → see assignments · GPA as number</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {STUDENT.classes.map(c=>(
            <button key={c.id} onClick={e=>{ e.stopPropagation(); navigate('grades') }}
              style={{ background:T.inner, borderLeft:`3px solid ${c.color}`, borderRadius:12, padding:'10px 12px', border:'none', cursor:'pointer', textAlign:'left' }}>
              <div style={{ fontWeight:700, fontSize:12, color:T.text, marginBottom:2 }}>{c.subject}</div>
              <div style={{ fontSize:10, color:T.muted, marginBottom:6 }}>{c.teacher}</div>
              <div style={{ fontSize:20, fontWeight:800, color:gradeColor(c.grade) }}>{c.grade}%</div>
            </button>
          ))}
        </div>
      </Widget>

      {/* W4: Needs Attention */}
      <Widget onClick={()=>navigate('alerts')} style={{ border:`1px solid ${T.red}20` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:T.text }}>⚑ Needs Attention</div>
            <div style={{ fontSize:12, color:T.red, marginTop:4 }}>Science below 70% · Study tips available</div>
          </div>
          <button onClick={e=>{ e.stopPropagation(); navigate('alerts') }}
            style={{ background:`${T.amber}18`, color:T.amber, border:`1px solid ${T.amber}30`, borderRadius:9, padding:'6px 12px', fontSize:11, fontWeight:700, cursor:'pointer', flexShrink:0 }}>
            View →
          </button>
        </div>
      </Widget>

      {/* W5: Messages — thread list with Reply→ inline, AI polishes note */}
      <Widget>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:T.text }}>💬 Messages</div>
            {unreadCount>0 && <div style={{ fontSize:10, color:T.red, marginTop:1 }}>{unreadCount} new</div>}
          </div>
          <button onClick={e=>{ e.stopPropagation(); navigate('messages') }}
            style={{ background:`${T.secondary}22`, color:T.secondary, border:`1px solid ${T.secondary}40`, borderRadius:10, padding:'6px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
            + New
          </button>
        </div>

        {STUDENT.threads.map(t=>{
          const lastMsg = t.msgs[t.msgs.length-1]
          return (
            <div key={t.id}
              style={{ background:t.unread?T.raised:T.inner, border:`1px solid ${t.unread?T.secondary+'40':T.border}`, borderRadius:13, padding:'10px 12px', marginBottom:8, display:'flex', gap:10, alignItems:'flex-start' }}
              onMouseEnter={e=>(e.currentTarget.style.background=T.raised)}
              onMouseLeave={e=>(e.currentTarget.style.background=t.unread?T.raised:T.inner)}>
              {/* Avatar */}
              <div style={{ position:'relative', flexShrink:0 }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:T.primary, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{t.avatar}</div>
                {t.unread && <div style={{ position:'absolute', top:-1, right:-1, width:9, height:9, borderRadius:'50%', background:T.red, border:`2px solid ${T.bg}` }}/>}
              </div>
              {/* Content */}
              <div style={{ flex:1, minWidth:0 }} onClick={()=>openThread(t)}>
                <div style={{ fontSize:12, fontWeight:700, color:T.text, marginBottom:2 }}>{t.name}</div>
                <div style={{ fontSize:11, color:T.soft, fontWeight:600, marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.subject}</div>
                <div style={{ fontSize:10, color:T.muted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{lastMsg?.text||''}</div>
              </div>
              {/* Reply button */}
              <button onClick={e=>{ e.stopPropagation(); openThread(t) }}
                style={{ background:`${T.secondary}22`, color:T.secondary, border:`1px solid ${T.secondary}40`, borderRadius:9, padding:'6px 10px', fontSize:10, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0, alignSelf:'center' }}>
                Reply →
              </button>
            </div>
          )
        })}

        {/* AI polishes note */}
        <div style={{ fontSize:10, color:T.muted, padding:'6px 0 0', borderTop:`1px solid ${T.border}`, display:'flex', gap:6, alignItems:'center' }}>
          <span>👍😊</span>
          <span>reactions on all messages · </span>
          <span style={{ color:T.teal, fontWeight:600 }}>✨ AI polishes reply</span>
          <span> · you approve</span>
        </div>
      </Widget>

      {/* W6: Class Feed — with read count + reactions */}
      <Widget onClick={()=>navigate('feed')}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <div style={{ fontSize:13, fontWeight:700, color:T.text }}>📢 Class Feed</div>
          <button onClick={e=>{ e.stopPropagation(); navigate('feed') }}
            style={{ background:`${T.secondary}22`, color:T.secondary, border:`1px solid ${T.secondary}40`, borderRadius:10, padding:'5px 10px', fontSize:10, fontWeight:700, cursor:'pointer' }}>
            + Post
          </button>
        </div>
        {STUDENT.feed.slice(0,1).map(p=>(
          <div key={p.id} style={{ background:T.inner, borderRadius:12, padding:'10px 12px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
              <div style={{ fontSize:11, fontWeight:700, color:T.secondary }}>{p.author}</div>
              <span style={{ fontSize:10, color:T.muted }}>{p.time}</span>
            </div>
            <div style={{ fontSize:12, color:T.text, lineHeight:1.5, marginBottom:8 }}>{p.content}</div>
            {/* Read count + reactions */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ display:'flex', gap:10 }}>
                {Object.entries(p.reactions).map(([emoji,count])=>(
                  <span key={emoji} style={{ fontSize:11, color:T.muted }}>{emoji} {count}</span>
                ))}
              </div>
              <span style={{ fontSize:10, color:T.muted }}>Read: {p.readCount}/{p.totalCount}</span>
            </div>
          </div>
        ))}
      </Widget>

      {/* W7: AI Study Tips */}
      <Widget style={{ background:'linear-gradient(135deg,#0d1a3a 0%,#000d1f 100%)', border:`1px solid ${T.purple}30` }}>
        <div style={{ fontSize:11, fontWeight:700, color:T.purple, marginBottom:6 }}>✨ AI Study Tips</div>
        <div style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:4 }}>Science needs your focus! 📚</div>
        <div style={{ fontSize:11, color:T.muted, marginBottom:8 }}>10 min flashcards tonight · same strategy that boosted Reading +8pts</div>
        <button style={{ background:'none', border:'none', color:T.teal, fontSize:11, fontWeight:600, cursor:'pointer', padding:0 }}>
          Tap for full personalized study plan →
        </button>
      </Widget>

      {/* W8: Upload Assignment — Photo / File / Link buttons */}
      <Widget style={{ background:'linear-gradient(135deg,#0a1a0a,#000d1f)', border:`1px solid ${T.green}20` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:T.green }}>📤 Upload Assignment</div>
            <div style={{ fontSize:10, color:T.muted, marginTop:2 }}>Photo · File · Link · Note to teacher</div>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          {[
            { icon:'📷', label:'Photo', color:T.teal   },
            { icon:'📁', label:'File',  color:T.blue   },
            { icon:'🔗', label:'Link',  color:T.purple },
          ].map(b=>(
            <button key={b.label} onClick={e=>e.stopPropagation()}
              style={{ background:`${b.color}18`, color:b.color, border:`1px solid ${b.color}35`, borderRadius:12, padding:'12px 6px', cursor:'pointer', textAlign:'center', fontSize:11, fontWeight:700 }}>
              <div style={{ fontSize:22, marginBottom:4 }}>{b.icon}</div>
              {b.label}
            </button>
          ))}
        </div>
        <button onClick={e=>e.stopPropagation()}
          style={{ width:'100%', marginTop:10, background:T.inner, border:`1px solid ${T.border}`, borderRadius:10, padding:'8px', fontSize:11, color:T.muted, cursor:'pointer', fontWeight:600 }}>
          ✏ Note to teacher
        </button>
      </Widget>

      <EditModeBar/>
    </div>
  )
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function StudentDashboard({ currentUser }) {
  const [page,         setPage]        = useState('home')
  const [activeNav,    setActiveNav]   = useState('home')
  const [activeThread, setActiveThread]= useState(null)

  useEffect(()=>{ window.scrollTo(0,0) }, [page])
  useEffect(()=>{ if(activeThread) window.scrollTo(0,0) }, [activeThread])

  function navigate(id) {
    setActiveThread(null)
    setPage(id)
    if(['home','grades','messages','feed','alerts'].includes(id)) setActiveNav(id)
    window.scrollTo(0,0)
  }

  function goHome() { setActiveThread(null); navigate('home'); setActiveNav('home') }

  const isSubPage = page !== 'home' || activeThread !== null

  function navSelect(id) {
    if(id==='__back__') { goHome(); return }
    navigate(id)
    setActiveNav(id)
  }

  // Thread opened from home widget
  if (activeThread) {
    return (
      <>
        <ThreadView thread={activeThread} onBack={()=>setActiveThread(null)}/>
        <BottomNav active={activeNav} onSelect={navSelect} isSubPage={true}/>
      </>
    )
  }

  if(page==='grades')   return <><GradesPage   onBack={goHome}/><BottomNav active={activeNav}  onSelect={navSelect} isSubPage={isSubPage}/></>
  if(page==='messages') return <><ParentMessages onBack={goHome} viewerRole="student"/><BottomNav active='messages' onSelect={navSelect} isSubPage={isSubPage}/></>
  if(page==='alerts')   return <><AlertsPage   onBack={goHome}/><BottomNav active={activeNav}  onSelect={navSelect} isSubPage={isSubPage}/></>
  if(page==='feed')     return <><ClassFeed    onBack={goHome} viewerRole="student"/><BottomNav active='feed'     onSelect={navSelect} isSubPage={isSubPage}/></>

  const now  = new Date()
  const hour = now.getHours()
  const greeting = hour<12?'Good morning':'Good afternoon'

  return (
    <div style={{ minHeight:'100vh', background:T.bg, color:T.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", paddingBottom:90 }}>
      {/* Sticky header */}
      <div style={{ position:'sticky', top:0, zIndex:100, background:T.header, padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize:10, color:'rgba(255,255,255,0.55)', fontWeight:700, letterSpacing:'0.06em', marginBottom:2 }}>HOUSTON ISD · LINCOLN ELEMENTARY</div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:17, fontWeight:800, color:'#fff' }}>{greeting}, {STUDENT.name} 👋</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)' }}>{STUDENT.grade}</div>
          </div>
          {STUDENT.threads.some(t=>t.unread) && (
            <div style={{ background:T.red, borderRadius:999, padding:'3px 8px', fontSize:10, fontWeight:700, color:'#fff' }}>
              {STUDENT.threads.filter(t=>t.unread).length} new
            </div>
          )}
        </div>
      </div>
      <HomePage navigate={navigate} openThread={setActiveThread}/>
      <BottomNav active={activeNav} onSelect={navSelect} isSubPage={false}/>
    </div>
  )
}
