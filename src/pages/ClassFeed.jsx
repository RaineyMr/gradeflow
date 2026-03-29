import React, { useState, useRef, useEffect } from 'react'
import { useStore } from '../lib/store'

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

const REACTIONS = ['👍','❤️','😂','🙌','😮','🔥','❓','😕']

const DEMO_STUDENTS = [
  { id:1,  name:'Aaliyah Brooks',  avatar:'👧' },
  { id:2,  name:'Marcus Thompson', avatar:'👦' },
  { id:3,  name:'Sofia Rodriguez', avatar:'👧' },
  { id:4,  name:'Jordan Williams', avatar:'👦' },
  { id:5,  name:'Priya Patel',     avatar:'👧' },
  { id:6,  name:'Noah Johnson',    avatar:'👦' },
  { id:7,  name:'Emma Davis',      avatar:'👧' },
  { id:8,  name:'Liam Martinez',   avatar:'👦' },
]

const INITIAL_POSTS = [
  {
    id: 1,
    type: 'announcement',
    author: 'Ms. Johnson', authorRole: 'teacher', authorAvatar: '👩‍🏫',
    classId: 1, subject: '3rd Period · Math',
    content: '📅 Unit Test Friday! Review chapters 3–4. Focus on fractions and decimals. Study guide is attached below. Let me know if you have questions!',
    time: '2 hours ago', timestamp: Date.now() - 7200000,
    reactions: { '👍':12, '❤️':5, '🔥':3 },
    pinned: true,
    permissions: 'open',
    comments: [
      { id:1, author:'Marcus Thompson', authorRole:'student', avatar:'👦', text:'Will the test cover the worksheet from Tuesday?', time:'1hr 45min ago', reactions:{'👍':3}, replies:[] },
      { id:2, author:'Ms. Johnson', authorRole:'teacher', avatar:'👩‍🏫', text:'Yes, Marcus! Everything from pages 84–102 is fair game.', time:'1hr 30min ago', reactions:{'👍':8,'❤️':2}, replies:[] },
      { id:3, author:'Aaliyah Brooks', authorRole:'student', avatar:'👧', text:'Can we work in groups to study?', time:'1hr ago', reactions:{'👍':5}, replies:[
        { id:31, author:'Ms. Johnson', authorRole:'teacher', avatar:'👩‍🏫', text:"Study groups are a great idea! I'll open the classroom Thursday after school.", time:'55min ago', reactions:{'❤️':6} },
        { id:32, author:'Sofia Rodriguez', authorRole:'student', avatar:'👧', text:"I'm in! @Aaliyah want to study together?", time:'50min ago', reactions:{'👍':2} },
      ]},
      { id:4, author:'Priya Patel', authorRole:'student', avatar:'👧', text:'Is there a review sheet we can print?', time:'45min ago', reactions:{}, replies:[] },
    ],
    readBy: [1,2,3,4,5,7],
    engagement: null,
  },
  {
    id: 2,
    type: 'assignment',
    author: 'Ms. Johnson', authorRole: 'teacher', authorAvatar: '👩‍🏫',
    classId: 1, subject: '3rd Period · Math',
    content: '🗣️ Discussion Assignment: In your own words, explain how you convert a fraction to a decimal. Reply with at least 2 sentences. Then reply to at least 2 classmates and add to their explanation or give an example.',
    time: 'Yesterday', timestamp: Date.now() - 86400000,
    reactions: { '👍':8, '😮':2 },
    pinned: false,
    permissions: 'open',
    dueDate: 'Friday, Mar 14',
    pointValue: 10,
    engagement: {
      minWords: 20,
      mustReplyToClassmates: 2,
      trackWordCount: true,
      trackReplies: true,
      gradeCategory: 4,
    },
    studentProgress: [
      { studentId:1, name:'Aaliyah Brooks',  avatar:'👧', viewed:true,  replied:true,  wordCount:34, classmateReplies:2, grade:10,  graded:true  },
      { studentId:2, name:'Marcus Thompson', avatar:'👦', viewed:true,  replied:true,  wordCount:18, classmateReplies:1, grade:null, graded:false },
      { studentId:3, name:'Sofia Rodriguez', avatar:'👧', viewed:true,  replied:true,  wordCount:41, classmateReplies:3, grade:10,  graded:true  },
      { studentId:4, name:'Jordan Williams', avatar:'👦', viewed:true,  replied:false, wordCount:0,  classmateReplies:0, grade:null, graded:false },
      { studentId:5, name:'Priya Patel',     avatar:'👧', viewed:true,  replied:true,  wordCount:27, classmateReplies:2, grade:10,  graded:true  },
      { studentId:6, name:'Noah Johnson',    avatar:'👦', viewed:false, replied:false, wordCount:0,  classmateReplies:0, grade:null, graded:false },
      { studentId:7, name:'Emma Davis',      avatar:'👧', viewed:true,  replied:true,  wordCount:31, classmateReplies:2, grade:10,  graded:true  },
      { studentId:8, name:'Liam Martinez',   avatar:'👦', viewed:true,  replied:false, wordCount:0,  classmateReplies:0, grade:null, graded:false },
    ],
    comments: [
      { id:10, author:'Aaliyah Brooks', authorRole:'student', avatar:'👧', text:'To convert a fraction to a decimal, you divide the top number by the bottom number. So 3/4 means 3 divided by 4, which equals 0.75. I think of it like money — 3 quarters is 75 cents!', time:'Yesterday 4pm', reactions:{'👍':5,'❤️':2}, replies:[
        { id:101, author:'Sofia Rodriguez', authorRole:'student', avatar:'👧', text:'I love the money example! That makes it so much easier to remember.', time:'Yesterday 4:15pm', reactions:{'👍':3} },
        { id:102, author:'Marcus Thompson', authorRole:'student', avatar:'👦', text:'So for 1/2 it would be 0.50 which is like 50 cents. Cool!', time:'Yesterday 4:30pm', reactions:{'👍':2} },
      ]},
      { id:11, author:'Sofia Rodriguez', authorRole:'student', avatar:'👧', text:'When you convert a fraction to a decimal you are doing long division. The numerator gets divided by the denominator. Like 1/4 = 0.25 because 1 divided by 4 is 0.25. I also think you can remember common ones like 1/2=0.5 and 1/4=0.25.', time:'Yesterday 4:10pm', reactions:{'👍':4}, replies:[
        { id:111, author:'Priya Patel', authorRole:'student', avatar:'👧', text:'I memorized those too! 1/5 = 0.2 is another easy one.', time:'Yesterday 5pm', reactions:{'👍':2} },
      ]},
      { id:12, author:'Priya Patel', authorRole:'student', avatar:'👧', text:'A fraction becomes a decimal when you divide the numerator by the denominator using long division. Example: 3/5. You do 3 divided by 5. 5 goes into 30 six times so 3/5 = 0.6. You can check by multiplying back.', time:'Yesterday 5pm', reactions:{'👍':3,'🔥':1}, replies:[] },
      { id:13, author:'Emma Davis', authorRole:'student', avatar:'👧', text:'To change a fraction to a decimal, you divide the numerator (top number) by the denominator (bottom number). So for 7/8, you do 7 divided by 8 which gives 0.875. A calculator can help check your work but it is good to know how to do it by hand.', time:'Yesterday 6pm', reactions:{'👍':2}, replies:[] },
    ],
    readBy: [1,2,3,4,5,7],
  },
  {
    id: 3,
    type: 'post',
    author: 'Ms. Johnson', authorRole: 'teacher', authorAvatar: '👩‍🏫',
    classId: 1, subject: '3rd Period · Math',
    content: "🎉 Great work on yesterday's homework! The class average was 87%. Special shoutout to everyone who turned it in early! Keep up the amazing effort.",
    time: '2 days ago', timestamp: Date.now() - 172800000,
    reactions: { '👍':18, '❤️':9, '🔥':6 },
    pinned: false,
    permissions: 'open',
    comments: [
      { id:20, author:'Marcus Thompson', authorRole:'student', avatar:'👦', text:'Thank you Ms. Johnson! 😊', time:'2 days ago', reactions:{'❤️':4}, replies:[] },
      { id:21, author:'Aaliyah Brooks',  authorRole:'student', avatar:'👧', text:'Yay!! We worked hard 💪', time:'2 days ago', reactions:{'👍':6}, replies:[] },
    ],
    readBy: [1,2,3,4,5,6,7,8],
    engagement: null,
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function countWords(str) { return str.trim().split(/\s+/).filter(Boolean).length }

function Chip({ label, color, size=10 }) {
  return <span style={{ background:`${color}18`, color, borderRadius:999, padding:'3px 8px', fontSize:size, fontWeight:700 }}>{label}</span>
}

function Avatar({ emoji, size=32 }) {
  return <div style={{ width:size, height:size, borderRadius:'50%', background:'var(--school-color,#BA0C2F)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.5, flexShrink:0 }}>{emoji}</div>
}

// ─── Auto-grade logic ─────────────────────────────────────────────────────────
function applyAutoGrade(progress, post, updateGrade) {
  if (!post.engagement) return { updated: progress, graded: 0, skipped: 0 }
  const { minWords = 0, mustReplyToClassmates = 0 } = post.engagement
  let graded = 0
  let skipped = 0

  const updated = progress.map(s => {
    if (s.graded)                            { skipped++; return s }
    if (!s.replied)                          { skipped++; return s }
    if (s.wordCount < minWords)              { skipped++; return s }
    if (s.classmateReplies < mustReplyToClassmates) { skipped++; return s }
    updateGrade(s.studentId, post.id, post.pointValue)
    graded++
    return { ...s, grade: post.pointValue, graded: true }
  })

  return { updated, graded, skipped }
}

// ─── ENGAGEMENT ANALYTICS PANEL ──────────────────────────────────────────────
function EngagementPanel({ post, onClose, onGrade }) {
  const { updateGrade } = useStore()
  const [filter,   setFilter]   = useState('all')
  const [toast,    setToast]    = useState(null)
  const [progress, setProgress] = useState(post.studentProgress || [])

  const replied    = progress.filter(s=>s.replied).length
  const notReplied = progress.filter(s=>!s.replied).length
  const notViewed  = progress.filter(s=>!s.viewed).length
  const avgWords   = replied ? Math.round(progress.filter(s=>s.replied).reduce((sum,s)=>sum+s.wordCount,0)/replied) : 0

  const meetsReqs = progress.filter(s=>
    s.replied &&
    s.wordCount        >= (post.engagement?.minWords              || 0) &&
    s.classmateReplies >= (post.engagement?.mustReplyToClassmates || 0)
  )

  const eligibleForAutoGrade = meetsReqs.filter(s => !s.graded)

  const filtered = filter==='all'     ? progress
    : filter==='done'    ? progress.filter(s => s.replied && s.wordCount>=(post.engagement?.minWords||0) && s.classmateReplies>=(post.engagement?.mustReplyToClassmates||0))
    : filter==='partial' ? progress.filter(s => s.replied && (s.wordCount<(post.engagement?.minWords||0) || s.classmateReplies<(post.engagement?.mustReplyToClassmates||0)))
    : progress.filter(s => !s.replied)

  function handleAutoGrade() {
    const { updated, graded, skipped } = applyAutoGrade(progress, post, updateGrade)
    setProgress(updated)
    const msg = graded > 0
      ? `✅ Graded ${graded} student${graded !== 1 ? 's' : ''} — full points for completion${skipped > 0 ? ` · ${skipped} skipped (already graded or incomplete)` : ''}`
      : "No eligible students — all either already graded or haven't met requirements yet"
    setToast(msg)
    setTimeout(() => setToast(null), 4500)
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', display:'flex', alignItems:'flex-end' }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:C.card, borderRadius:'24px 24px 0 0', width:'100%', maxHeight:'90vh', overflow:'auto', padding:'20px 16px 40px' }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:C.text, marginBottom:4 }}>📊 Engagement Analytics</div>
            <div style={{ fontSize:11, color:C.muted }}>Due: {post.dueDate} · {post.pointValue} pts</div>
          </div>
          <button onClick={onClose} style={{ background:C.inner, border:'none', borderRadius:10, padding:'7px 12px', color:C.muted, cursor:'pointer', fontSize:14 }}>✕</button>
        </div>

        {toast && (
          <div style={{ background:`${C.teal}15`, border:`1px solid ${C.teal}40`, borderRadius:12, padding:'10px 14px', marginBottom:14, fontSize:12, color:C.teal, fontWeight:600 }}>
            {toast}
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:16 }}>
          {[
            { label:'Replied',   val:replied,    total:progress.length, color:C.green  },
            { label:'Pending',   val:notReplied, total:progress.length, color:C.amber  },
            { label:'Not Seen',  val:notViewed,  total:progress.length, color:C.red    },
            { label:'Avg Words', val:avgWords,   total:null,            color:C.teal   },
          ].map(s=>(
            <div key={s.label} style={{ background:C.inner, borderRadius:14, padding:'10px 8px', textAlign:'center' }}>
              <div style={{ fontSize:20, fontWeight:900, color:s.color }}>{s.val}{s.total ? `/${s.total}` : ''}</div>
              <div style={{ fontSize:9, color:C.muted, marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background:C.inner, borderRadius:12, padding:'10px 12px', marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
            <span style={{ fontSize:11, color:C.muted }}>Class completion</span>
            <span style={{ fontSize:11, fontWeight:700, color:C.text }}>{meetsReqs.length}/{progress.length} meet requirements</span>
          </div>
          <div style={{ height:8, background:C.raised, borderRadius:4, overflow:'hidden', display:'flex' }}>
            <div style={{ flex:meetsReqs.length, background:C.green, transition:'flex 0.4s' }}/>
            <div style={{ flex:progress.filter(s=>s.replied&&!meetsReqs.includes(s)).length, background:C.amber }}/>
            <div style={{ flex:notReplied, background:C.raised }}/>
          </div>
          <div style={{ display:'flex', gap:12, marginTop:6 }}>
            {[['■',C.green,'Complete'],['■',C.amber,'Partial'],['■',C.raised,'Not started']].map(([s,c,l])=>(
              <span key={l} style={{ fontSize:9, color:C.muted }}><span style={{color:c}}>{s}</span> {l}</span>
            ))}
          </div>
        </div>

        {post.engagement && (
          <div style={{ background:`${C.blue}12`, border:`1px solid ${C.blue}30`, borderRadius:12, padding:'10px 12px', marginBottom:14, fontSize:11, color:C.soft }}>
            <strong>Requirements:</strong> Min {post.engagement.minWords} words · Reply to {post.engagement.mustReplyToClassmates}+ classmates
          </div>
        )}

        <div style={{ display:'flex', gap:6, marginBottom:12, overflowX:'auto' }}>
          {[['all','All'],['done','✓ Done'],['partial','⚠ Partial'],['missing','✕ Missing']].map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)}
              style={{ padding:'6px 12px', borderRadius:999, border:'none', cursor:'pointer', fontSize:11, fontWeight:700, whiteSpace:'nowrap',
                background:filter===v?'var(--school-color,#BA0C2F)':C.inner,
                color:filter===v?'#fff':C.muted }}>
              {l}
            </button>
          ))}
        </div>

        {filtered.map(s=>{
          const meetsMin     = s.wordCount        >= (post.engagement?.minWords              || 0)
          const meetsReplies = s.classmateReplies >= (post.engagement?.mustReplyToClassmates || 0)
          const complete     = s.replied && meetsMin && meetsReplies
          const partial      = s.replied && (!meetsMin || !meetsReplies)
          const statusColor  = complete ? C.green : partial ? C.amber : C.red
          const statusLabel  = complete ? '✓ Complete' : partial ? '⚠ Partial' : s.viewed ? '✕ Viewed, not done' : '✕ Not seen'

          return (
            <div key={s.studentId} style={{ background:C.inner, border:`1px solid ${statusColor}20`, borderRadius:14, padding:'12px 14px', marginBottom:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:s.replied?8:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <Avatar emoji={s.avatar} size={32}/>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13, color:C.text }}>{s.name}</div>
                    <Chip label={statusLabel} color={statusColor} size={9}/>
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  {s.graded
                    ? <div style={{ fontSize:14, fontWeight:800, color:C.green }}>{s.grade}/{post.pointValue}</div>
                    : s.replied && (
                      <button onClick={()=>onGrade(s)}
                        style={{ background:`${C.blue}22`, color:C.blue, border:'none', borderRadius:8, padding:'5px 10px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                        Grade
                      </button>
                    )
                  }
                </div>
              </div>

              {s.replied && (
                <div style={{ display:'flex', gap:12, marginTop:6 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <span style={{ fontSize:10, color:meetsMin?C.green:C.amber }}>{s.wordCount} words</span>
                    {post.engagement?.minWords && !meetsMin && <span style={{ fontSize:9, color:C.amber }}>({post.engagement.minWords} req)</span>}
                  </div>
                  <div>
                    <span style={{ fontSize:10, color:meetsReplies?C.green:C.amber }}>{s.classmateReplies} classmate replies</span>
                    {post.engagement?.mustReplyToClassmates && !meetsReplies && <span style={{ fontSize:9, color:C.amber }}>({post.engagement.mustReplyToClassmates} req)</span>}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {eligibleForAutoGrade.length > 0 ? (
          <button onClick={handleAutoGrade}
            style={{ width:'100%', background:`${C.teal}20`, color:C.teal, border:`1px solid ${C.teal}40`, borderRadius:14, padding:12, fontSize:13, fontWeight:700, cursor:'pointer', marginTop:4 }}>
            ⚡ Auto-grade {eligibleForAutoGrade.length} student{eligibleForAutoGrade.length !== 1 ? 's' : ''} who meet requirements — full points
          </button>
        ) : progress.some(s=>s.replied) ? (
          <div style={{ textAlign:'center', padding:'10px 0 0', fontSize:11, color:C.muted }}>
            ✓ All eligible students have been graded
          </div>
        ) : null}

      </div>
    </div>
  )
}

// ─── COMPOSE POST MODAL ───────────────────────────────────────────────────────
function ComposePost({ onPost, onClose }) {
  const { classes, categories } = useStore()
  const [postType,      setPostType]      = useState('post')
  const [content,       setContent]       = useState('')
  const [selectedClass, setSelectedClass] = useState(1)
  const [permissions,   setPermissions]   = useState('open')
  const [dueDate,       setDueDate]       = useState('')
  const [points,        setPoints]        = useState(10)
  const [minWords,      setMinWords]      = useState(20)
  const [minReplies,    setMinReplies]    = useState(2)
  const [gradeCategory, setGradeCategory] = useState(4)

  const typeMap = {
    post:         { icon:'📢', label:'Announcement',   color:C.blue  },
    assignment:   { icon:'🗣️', label:'Discussion Post', color:C.teal  },
    announcement: { icon:'📌', label:'Pinned Notice',   color:C.amber },
  }

  function handlePost() {
    if (!content.trim()) return
    const t   = typeMap[postType]
    const cls = classes.find(c=>c.id===selectedClass)
    onPost({
      id: Date.now(),
      type: postType,
      author: 'Ms. Johnson', authorRole:'teacher', authorAvatar:'👩‍🏫',
      classId: selectedClass,
      subject: cls ? `${cls.period} · ${cls.subject}` : 'Class',
      content: content.trim(),
      time: 'Just now', timestamp: Date.now(),
      reactions: {},
      pinned: postType==='announcement',
      permissions,
      comments: [],
      readBy: [],
      ...(postType==='assignment' ? {
        dueDate, pointValue: points,
        engagement: { minWords, mustReplyToClassmates: minReplies, trackWordCount: true, trackReplies: true, gradeCategory },
        studentProgress: DEMO_STUDENTS.map(s => ({ studentId:s.id, name:s.name, avatar:s.avatar, viewed:false, replied:false, wordCount:0, classmateReplies:0, grade:null, graded:false })),
      } : { engagement: null }),
    })
    onClose()
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:400, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', display:'flex', alignItems:'flex-end' }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:C.card, borderRadius:'24px 24px 0 0', width:'100%', maxHeight:'90vh', overflow:'auto', padding:'20px 16px 40px' }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div style={{ fontSize:16, fontWeight:800, color:C.text }}>✏️ New Post</div>
          <button onClick={onClose} style={{ background:C.inner, border:'none', borderRadius:10, padding:'7px 12px', color:C.muted, cursor:'pointer' }}>✕</button>
        </div>

        <div style={{ display:'flex', gap:6, marginBottom:14 }}>
          {Object.entries(typeMap).map(([k,v])=>(
            <button key={k} onClick={()=>setPostType(k)}
              style={{ flex:1, padding:'8px 6px', borderRadius:12, border:`1px solid ${postType===k?v.color:C.border}`, cursor:'pointer', background:postType===k?`${v.color}18`:C.inner, textAlign:'center' }}>
              <div style={{ fontSize:16, marginBottom:2 }}>{v.icon}</div>
              <div style={{ fontSize:10, fontWeight:700, color:postType===k?v.color:C.muted }}>{v.label}</div>
            </button>
          ))}
        </div>

        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:C.muted, display:'block', marginBottom:6 }}>Post to</label>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {(classes||[]).map(c=>(
              <button key={c.id} onClick={()=>setSelectedClass(c.id)}
                style={{ padding:'6px 12px', borderRadius:999, border:'none', cursor:'pointer', fontSize:11, fontWeight:700,
                  background:selectedClass===c.id?'var(--school-color,#BA0C2F)':C.inner,
                  color:selectedClass===c.id?'#fff':C.muted }}>
                {c.period} · {c.subject}
              </button>
            ))}
          </div>
        </div>

        <textarea
          autoFocus rows={4} value={content} onChange={e=>setContent(e.target.value)}
          placeholder={postType==='assignment' ? 'Write your discussion prompt...' : postType==='announcement' ? 'Write an important notice...' : 'Share an announcement with your class...'}
          style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:14, padding:'12px 14px', color:C.text, fontSize:13, resize:'none', boxSizing:'border-box', lineHeight:1.6, outline:'none', marginBottom:12 }}
        />

        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:C.muted, display:'block', marginBottom:6 }}>Who can reply</label>
          <div style={{ display:'flex', gap:6 }}>
            {[['open','Everyone'],['teacher_only','Teacher only'],['closed','No replies']].map(([v,l])=>(
              <button key={v} onClick={()=>setPermissions(v)}
                style={{ flex:1, padding:'8px', borderRadius:10, border:'none', cursor:'pointer', fontSize:11, fontWeight:700,
                  background:permissions===v?'var(--school-color,#BA0C2F)':C.inner,
                  color:permissions===v?'#fff':C.muted }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {postType==='assignment' && (
          <div style={{ background:C.inner, border:`1px solid ${C.teal}30`, borderRadius:16, padding:14, marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.teal, marginBottom:12 }}>📊 Engagement Parameters</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <div>
                <label style={{ fontSize:10, fontWeight:700, color:C.muted, display:'block', marginBottom:4 }}>Due Date</label>
                <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)}
                  style={{ width:'100%', background:C.raised, border:`1px solid ${C.border}`, borderRadius:8, padding:'7px 10px', color:C.text, fontSize:12, outline:'none', boxSizing:'border-box' }}/>
              </div>
              <div>
                <label style={{ fontSize:10, fontWeight:700, color:C.muted, display:'block', marginBottom:4 }}>Points</label>
                <input type="number" value={points} onChange={e=>setPoints(Number(e.target.value))} min="1" max="100"
                  style={{ width:'100%', background:C.raised, border:`1px solid ${C.border}`, borderRadius:8, padding:'7px 10px', color:C.text, fontSize:12, outline:'none', boxSizing:'border-box' }}/>
              </div>
              <div>
                <label style={{ fontSize:10, fontWeight:700, color:C.muted, display:'block', marginBottom:4 }}>Min words</label>
                <input type="number" value={minWords} onChange={e=>setMinWords(Number(e.target.value))} min="1"
                  style={{ width:'100%', background:C.raised, border:`1px solid ${C.border}`, borderRadius:8, padding:'7px 10px', color:C.text, fontSize:12, outline:'none', boxSizing:'border-box' }}/>
              </div>
              <div>
                <label style={{ fontSize:10, fontWeight:700, color:C.muted, display:'block', marginBottom:4 }}>Reply to classmates</label>
                <input type="number" value={minReplies} onChange={e=>setMinReplies(Number(e.target.value))} min="0"
                  style={{ width:'100%', background:C.raised, border:`1px solid ${C.border}`, borderRadius:8, padding:'7px 10px', color:C.text, fontSize:12, outline:'none', boxSizing:'border-box' }}/>
              </div>
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:C.muted, display:'block', marginBottom:6 }}>Grade category</label>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {(useStore.getState().categories||[]).map(cat=>(
                  <button key={cat.id} onClick={()=>setGradeCategory(cat.id)}
                    style={{ padding:'5px 10px', borderRadius:999, border:'none', cursor:'pointer', fontSize:10, fontWeight:700,
                      background:gradeCategory===cat.id?`${cat.color}22`:C.raised,
                      color:gradeCategory===cat.id?cat.color:C.muted,
                      outline: gradeCategory===cat.id?`1px solid ${cat.color}`:'none' }}>
                    {cat.icon} {cat.name} {cat.weight}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <button onClick={handlePost} disabled={!content.trim()}
          style={{ width:'100%', background:content.trim()?'var(--school-color,#BA0C2F)':'#2a2f42', color:content.trim()?'#fff':C.muted, border:'none', borderRadius:999, padding:'14px', fontSize:15, fontWeight:800, cursor:content.trim()?'pointer':'not-allowed' }}>
          {postType==='assignment' ? '📊 Post Discussion Assignment' : postType==='announcement' ? '📌 Post Announcement' : '📢 Post to Feed'}
        </button>
      </div>
    </div>
  )
}

// ─── COMMENT THREAD ───────────────────────────────────────────────────────────
function CommentThread({ comment, viewer, canReply, depth=0, classId, addParticipationEvent }) {
  const [showReplyBox,  setShowReplyBox]  = useState(false)
  const [replyText,     setReplyText]     = useState('')
  const [reactions,     setReactions]     = useState(comment.reactions||{})
  const [localReplies,  setLocalReplies]  = useState(comment.replies||[])
  const [showReactions, setShowReactions] = useState(false)

  const studentId = DEMO_STUDENTS.find(s => s.name === viewer.name)?.id

  function handleReaction(emoji) {
    if (viewer.role === 'student' && studentId && classId) {
      const eventType = emoji === '❓' ? 'question' : 'reaction'
      addParticipationEvent(classId, studentId, eventType)
    }
    setReactions(r => ({...r, [emoji]: (r[emoji] || 0) + 1}))
  }

  function sendReply() {
    if (!replyText.trim()) return
    const r = { id:Date.now(), author:viewer.name, authorRole:viewer.role, avatar:viewer.avatar, text:replyText.trim(), time:'Just now', reactions:{} }
    setLocalReplies(rs=>[...rs,r])
    if (viewer.role === 'student' && studentId && classId) {
      addParticipationEvent(classId, studentId, 'comment')
    }
    setReplyText('')
    setShowReplyBox(false)
  }

  const isTeacher   = comment.authorRole==='teacher'
  const borderColor = isTeacher ? 'var(--school-color,#BA0C2F)' : C.border

  return (
    <div style={{ marginBottom:10, paddingLeft: depth>0 ? 16 : 0, borderLeft: depth>0 ? `2px solid ${C.border}` : 'none' }}>
      <div style={{ display:'flex', gap:10 }}>
        <Avatar emoji={comment.avatar} size={30}/>
        <div style={{ flex:1 }}>
          <div style={{ background:isTeacher?C.card:C.inner, border:`1px solid ${borderColor}30`, borderRadius:14, padding:'10px 12px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <div>
                <span style={{ fontWeight:700, fontSize:12, color:C.text }}>{comment.author}</span>
                {isTeacher && <span style={{ fontSize:9, color:'var(--school-color,#BA0C2F)', fontWeight:700, marginLeft:6, background:'rgba(186,12,47,0.12)', borderRadius:4, padding:'1px 5px' }}>Teacher</span>}
              </div>
              <span style={{ fontSize:10, color:C.muted }}>{comment.time}</span>
            </div>
            <p style={{ fontSize:13, color:C.text, lineHeight:1.6, margin:0 }}>{comment.text}</p>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:6, flexWrap:'wrap' }}>
            {Object.entries(reactions).filter(([,c])=>c>0).map(([emoji,count])=>(
              <button key={emoji} onClick={()=>handleReaction(emoji)}
                style={{ background:`${C.blue}15`, border:'none', borderRadius:999, padding:'3px 8px', cursor:'pointer', fontSize:12, display:'flex', alignItems:'center', gap:3 }}>
                {emoji}<span style={{ fontSize:10, fontWeight:700, color:C.blue }}>{count}</span>
              </button>
            ))}
            <button onClick={()=>setShowReactions(s=>!s)}
              style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, color:C.muted }}>😊</button>
            {canReply && depth===0 && (
              <button onClick={()=>setShowReplyBox(s=>!s)}
                style={{ background:'none', border:'none', cursor:'pointer', fontSize:11, color:C.muted, fontWeight:600 }}>Reply</button>
            )}
          </div>

          {showReactions && (
            <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:4, background:C.raised, borderRadius:10, padding:'6px 8px' }}>
              {REACTIONS.map(e=>(
                <button key={e} onClick={()=> {handleReaction(e); setShowReactions(false)}}
                  style={{ background:'none', border:'none', cursor:'pointer', fontSize:18 }}>{e}</button>
              ))}
            </div>
          )}

          {showReplyBox && (
            <div style={{ display:'flex', gap:8, marginTop:8, alignItems:'flex-end' }}>
              <input value={replyText} onChange={e=>setReplyText(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&sendReply()}
                placeholder={`Reply to ${comment.author}...`}
                style={{ flex:1, background:C.inner, border:`1px solid ${C.border}`, borderRadius:10, padding:'8px 12px', color:C.text, fontSize:12, outline:'none' }}
              />
              <button onClick={sendReply} disabled={!replyText.trim()}
                style={{ background:replyText.trim()?'var(--school-color,#BA0C2F)':'#2a2f42', color:'#fff', border:'none', borderRadius:10, padding:'8px 12px', fontSize:12, fontWeight:700, cursor:replyText.trim()?'pointer':'not-allowed' }}>
                Send
              </button>
            </div>
          )}

          {localReplies.length>0 && (
            <div style={{ marginTop:8 }}>
              {localReplies.map(r=>(
                <CommentThread key={r.id} comment={r} viewer={viewer} canReply={false} depth={depth+1} classId={classId} addParticipationEvent={addParticipationEvent}/>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── POST CARD ────────────────────────────────────────────────────────────────
function PostCard({ post, viewer, onOpenAnalytics, addParticipationEvent }) {
  const [expanded,      setExpanded]      = useState(false)
  const [postReactions, setPostReactions] = useState(post.reactions||{})
  const [comments,      setComments]      = useState(post.comments||[])
  const [commentText,   setCommentText]   = useState('')
  const [showReactions, setShowReactions] = useState(false)
  const [localProgress, setLocalProgress] = useState(post.studentProgress || [])

  const isTeacher    = viewer.role==='teacher'||viewer.role==='admin'
  const canReply     = post.permissions==='open' || (post.permissions==='teacher_only' && isTeacher)
  const isAssignment = post.type==='assignment'

  const studentId = DEMO_STUDENTS.find(s => s.name === viewer.name)?.id

  const studentProgress = isAssignment && localProgress?.find(s=>s.name===viewer.name)
  const meetingReqs = studentProgress && post.engagement
    ? studentProgress.wordCount>=(post.engagement.minWords||0) && studentProgress.classmateReplies>=(post.engagement.mustReplyToClassmates||0)
    : false

  const eligibleCount = isAssignment
    ? localProgress.filter(s =>
        s.replied &&
        s.wordCount        >= (post.engagement?.minWords              || 0) &&
        s.classmateReplies >= (post.engagement?.mustReplyToClassmates || 0) &&
        !s.graded
      ).length
    : 0

  const repliedCount = localProgress.filter(s=>s.replied).length

  function handlePostReaction(emoji) {
    if (viewer.role === 'student' && studentId) {
      const eventType = emoji === '❓' ? 'question' : 'reaction'
      addParticipationEvent(post.classId, studentId, eventType)
    }
    setPostReactions(r => ({...r, [emoji]: (r[emoji] || 0) + 1}))
  }

  function addComment() {
    if (!commentText.trim()) return
    const c = { id:Date.now(), author:viewer.name, authorRole:viewer.role, avatar:viewer.avatar, text:commentText.trim(), time:'Just now', reactions:{}, replies:[] }
    setComments(cs=>[...cs,c])
    if (viewer.role === 'student' && studentId) {
      addParticipationEvent(post.classId, studentId, 'comment')
    }
    setCommentText('')
  }

  function openAnalytics(e) {
    e.stopPropagation()
    onOpenAnalytics({ ...post, studentProgress: localProgress })
  }

  const typeColors = { post:C.blue, assignment:C.teal, announcement:C.amber }
  const typeIcons  = { post:'📢', assignment:'🗣️', announcement:'📌' }
  const typeLabels = { post:'Post', assignment:'Discussion', announcement:'Pinned' }

  return (
    <div style={{ background:C.card, border:`1px solid ${post.pinned?C.amber+'40':C.border}`, borderRadius:20, padding:'16px', marginBottom:12 }}>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          <Chip label={`${typeIcons[post.type]} ${typeLabels[post.type]}`} color={typeColors[post.type]||C.blue}/>
          <span style={{ fontSize:10, color:C.muted }}>{post.subject}</span>
        </div>
        {isAssignment && (
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            <Chip label={`${post.pointValue} pts`} color={C.teal}/>
            {post.dueDate && <span style={{ fontSize:10, color:C.muted }}>Due {post.dueDate}</span>}
          </div>
        )}
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Avatar emoji={post.authorAvatar} size={36}/>
          <div>
            <div style={{ fontWeight:700, fontSize:13, color:C.text }}>{post.author}</div>
            <div style={{ fontSize:10, color:C.muted }}>{post.time}</div>
          </div>
        </div>
        {isTeacher && isAssignment && (
          <button onClick={openAnalytics}
            style={{ background:`${C.teal}18`, color:C.teal, border:'none', borderRadius:10, padding:'6px 12px', fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
            📊 {repliedCount}/{localProgress.length} done
            {eligibleCount > 0 && (
              <span style={{ background:`${C.amber}30`, color:C.amber, borderRadius:999, padding:'1px 7px', fontSize:9, fontWeight:800 }}>
                {eligibleCount} to grade
              </span>
            )}
          </button>
        )}
      </div>

      <p style={{ fontSize:13, color:C.text, lineHeight:1.7, margin:'0 0 12px' }}>{post.content}</p>

      {isAssignment && viewer.role==='student' && studentProgress && (
        <div style={{ background: meetingReqs?`${C.green}12`:`${C.amber}12`, border:`1px solid ${meetingReqs?C.green:C.amber}30`, borderRadius:10, padding:'8px 12px', marginBottom:12 }}>
          <div style={{ fontSize:11, fontWeight:700, color:meetingReqs?C.green:C.amber, marginBottom:3 }}>
            {meetingReqs ? '✓ Requirements met' : '⚠ Requirements not met yet'}
          </div>
          <div style={{ display:'flex', gap:12 }}>
            <span style={{ fontSize:10, color:C.muted }}>
              Words: <strong style={{ color:studentProgress.wordCount>=(post.engagement?.minWords||0)?C.green:C.amber }}>{studentProgress.wordCount}/{post.engagement?.minWords}</strong>
            </span>
            <span style={{ fontSize:10, color:C.muted }}>
              Classmate replies: <strong style={{ color:studentProgress.classmateReplies>=(post.engagement?.mustReplyToClassmates||0)?C.green:C.amber }}>{studentProgress.classmateReplies}/{post.engagement?.mustReplyToClassmates}</strong>
            </span>
          </div>
        </div>
      )}

      <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', borderTop:`1px solid ${C.border}`, paddingTop:10, marginBottom:10 }}>
        {Object.entries(postReactions).filter(([,c])=>c>0).map(([emoji,count])=>(
          <button key={emoji} onClick={()=>handlePostReaction(emoji)}
            style={{ background:`${C.blue}15`, border:'none', borderRadius:999, padding:'4px 10px', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', gap:4 }}>
            {emoji}<span style={{ fontSize:10, fontWeight:700, color:C.blue }}>{count}</span>
          </button>
        ))}
        <button onClick={()=>setShowReactions(s=>!s)}
          style={{ background:C.inner, border:`1px solid ${C.border}`, borderRadius:999, padding:'4px 10px', cursor:'pointer', fontSize:13 }}>
          + 😊 
        </button>
        {showReactions && (
          <div style={{ display:'flex', gap:4, flexWrap:'wrap', background:C.raised, borderRadius:10, padding:'6px 8px', width:'100%' }}>
            {REACTIONS.map(e=>(
              <button key={e} onClick={()=> {handlePostReaction(e); setShowReactions(false)}}
                style={{ background:'none', border:'none', cursor:'pointer', fontSize:18 }}>{e}</button>
            ))}
          </div>
        )}
        <button onClick={()=>setExpanded(s=>!s)}
          style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', fontSize:11, color:C.muted, fontWeight:600 }}>
          {expanded ? '▲ Hide' : `▼ ${comments.length} comment${comments.length!==1?'s':''}`}
        </button>
      </div>

      {expanded && (
        <div>
          {comments.length===0 && (
            <div style={{ fontSize:12, color:C.muted, textAlign:'center', padding:'12px 0' }}>
              {canReply ? 'Be the first to respond!' : 'No comments yet.'}
            </div>
          )}
          {comments.map(comment=>(
            <CommentThread key={comment.id} comment={comment} viewer={viewer} canReply={canReply} classId={post.classId} addParticipationEvent={addParticipationEvent}/>
          ))}

          {canReply && (
            <div style={{ display:'flex', gap:10, marginTop:10, alignItems:'flex-end' }}>
              <Avatar emoji={viewer.avatar} size={30}/>
              <div style={{ flex:1 }}>
                <textarea
                  value={commentText}
                  onChange={e=>setCommentText(e.target.value)}
                  onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); addComment() }}}
                  placeholder={isAssignment ? `Write your response (min ${post.engagement?.minWords||0} words)...` : 'Add a comment...'}
                  rows={2}
                  style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:12, padding:'9px 12px', color:C.text, fontSize:13, resize:'none', outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}
                />
                {isAssignment && commentText.trim().length>0 && (
                  <div style={{ fontSize:10, color:countWords(commentText)>=(post.engagement?.minWords||0)?C.green:C.amber, marginTop:3 }}>
                    {countWords(commentText)} words {post.engagement?.minWords ? `(${post.engagement.minWords} required)` : ''}
                  </div>
                )}
              </div>
              <button onClick={addComment} disabled={!commentText.trim()}
                style={{ background:commentText.trim()?'var(--school-color,#BA0C2F)':'#2a2f42', color:'#fff', border:'none', borderRadius:12, padding:'9px 14px', fontSize:12, fontWeight:700, cursor:commentText.trim()?'pointer':'not-allowed', flexShrink:0 }}>
                Post
              </button>
            </div>
          )}

          {!canReply && post.permissions==='closed' && (
            <div style={{ fontSize:11, color:C.muted, textAlign:'center', padding:'8px 0' }}>Comments are closed for this post.</div>
          )}
          {!canReply && post.permissions==='teacher_only' && viewer.role!=='teacher' && (
            <div style={{ fontSize:11, color:C.muted, textAlign:'center', padding:'8px 0' }}>Only the teacher can reply to this post.</div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── MAIN CLASS FEED ──────────────────────────────────────────────────────────
export default function ClassFeed({ onBack, viewerRole='teacher' }) {
  const { addParticipationEvent, classes, teacher, goBack } = useStore()
  const handleBack = onBack || goBack

  const viewer = viewerRole==='student'
    ? { role:'student', name:'Marcus Thompson', avatar:'👦' }
    : viewerRole==='parent'
    ? { role:'parent', name:'Ms. Thompson', avatar:'👩' }
    : viewerRole==='admin'
    ? { role:'admin', name:'Principal Davis', avatar:'🏫' }
    : { role:'teacher', name:teacher?.name||'Ms. Johnson', avatar:'👩‍🏫' }

  const [posts,         setPosts]         = useState(INITIAL_POSTS)
  const [filterClass,   setFilterClass]   = useState('all')
  const [filterType,    setFilterType]    = useState('all')
  const [composing,     setComposing]     = useState(false)
  const [analyticsPost, setAnalyticsPost] = useState(null)
  const [pendingList,   setPendingList]   = useState([
    { id:'p1', author:'Marcus T.',  authorRole:'student', content:'Can we get extra credit on the test?',       time:'10 min ago' },
    { id:'p2', author:'Sofia R.',   authorRole:'student', content:'Worksheet question 3 is confusing — help?', time:'5 min ago'  },
  ])
  const [modMode, setModMode] = useState(false)

  const isTeacher = viewer.role==='teacher'||viewer.role==='admin'

  const displayedPosts = posts.filter(p=>{
    if (filterClass!=='all' && p.classId!==filterClass) return false
    if (filterType!=='all'  && p.type!==filterType)     return false
    return true
  }).sort((a,b)=>{
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return b.timestamp - a.timestamp
  })

  function handleNewPost(post) { setPosts(ps=>[post,...ps]) }

  function handleGradeStudent(student) {
    alert(`Grade ${student.name} for this discussion post — opens grade entry modal`)
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", paddingBottom:80 }}>

      <div style={{ background:'linear-gradient(135deg, var(--school-color,#BA0C2F) 0%, rgba(0,0,0,0.85) 100%)', padding:'16px 16px 20px', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {handleBack && <button onClick={handleBack} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>}
            <div>
              <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>📢 Class Feed</h1>
              <p style={{ fontSize:10, color:'rgba(255,255,255,0.55)', margin:0 }}>Announcements · Discussions · Assignments</p>
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {isTeacher && (
              <button onClick={()=>setModMode(m=>!m)}
                style={{ background:modMode?`${C.amber}30`:'rgba(255,255,255,0.15)', color:modMode?C.amber:'#fff', border:'none', borderRadius:10, padding:'7px 10px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                {modMode?'✕ Mod':'🛡 Mod'}
              </button>
            )}
            {(isTeacher||viewer.role==='admin') && (
              <button onClick={()=>setComposing(true)}
                style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:700 }}>
                + Post
              </button>
            )}
          </div>
        </div>

        <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:2 }}>
          <button onClick={()=>setFilterClass('all')}
            style={{ padding:'5px 12px', borderRadius:999, border:'none', cursor:'pointer', fontSize:10, fontWeight:700, whiteSpace:'nowrap',
              background:filterClass==='all'?'rgba(255,255,255,0.25)':'rgba(255,255,255,0.1)', color:'#fff' }}>
            All Classes
          </button>
          {(classes||[]).map(c=>(
            <button key={c.id} onClick={()=>setFilterClass(c.id)}
              style={{ padding:'5px 12px', borderRadius:999, border:'none', cursor:'pointer', fontSize:10, fontWeight:700, whiteSpace:'nowrap',
                background:filterClass===c.id?'rgba(255,255,255,0.25)':'rgba(255,255,255,0.1)', color:'#fff' }}>
              {c.period}·{c.subject}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', gap:6, padding:'12px 16px 0', overflowX:'auto' }}>
        {[['all','All'],['post','📢 Posts'],['announcement','📌 Pinned'],['assignment','🗣️ Discussions']].map(([v,l])=>(
          <button key={v} onClick={()=>setFilterType(v)}
            style={{ padding:'6px 12px', borderRadius:999, border:'none', cursor:'pointer', fontSize:10, fontWeight:700, whiteSpace:'nowrap',
              background:filterType===v?'var(--school-color,#BA0C2F)':C.inner, color:filterType===v?'#fff':C.muted }}>
            {l}
          </button>
        ))}
      </div>

      {modMode && pendingList.length>0 && (
        <div style={{ margin:'12px 16px 0', background:'#1a1800', border:`1px solid ${C.amber}30`, borderRadius:18, padding:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.amber, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>
            ⚠ Pending Approval ({pendingList.length})
          </div>
          {pendingList.map(p=>(
            <div key={p.id} style={{ background:C.inner, borderRadius:12, padding:'10px 12px', marginBottom:8 }}>
              <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6 }}>
                <span style={{ fontSize:12, fontWeight:700, color:C.text }}>{p.author}</span>
                <span style={{ fontSize:9, color:C.muted }}>· {p.time}</span>
              </div>
              <div style={{ fontSize:12, color:C.soft, marginBottom:8 }}>{p.content}</div>
              <div style={{ display:'flex', gap:6 }}>
                <button onClick={()=>setPendingList(ps=>ps.filter(x=>x.id!==p.id))}
                  style={{ background:`${C.green}22`, color:C.green, border:'none', borderRadius:8, padding:'5px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>✓ Approve</button>
                <button onClick={()=>setPendingList(ps=>ps.filter(x=>x.id!==p.id))}
                  style={{ background:`${C.red}22`, color:C.red, border:'none', borderRadius:8, padding:'5px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>✕ Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ padding:'12px 16px 0' }}>
        {displayedPosts.length===0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px', color:C.muted }}>
            <div style={{ fontSize:56, marginBottom:12 }}>📭</div>
            <div style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>No posts yet</div>
            <div style={{ fontSize:13 }}>{isTeacher ? 'Create a post or discussion assignment to get started.' : 'Nothing posted for this class yet.'}</div>
          </div>
        ) : displayedPosts.map(post=>(
          <PostCard key={post.id} post={post} viewer={viewer} onOpenAnalytics={setAnalyticsPost} addParticipationEvent={addParticipationEvent}/>
        ))}
      </div>

      {composing && <ComposePost onPost={handleNewPost} onClose={()=>setComposing(false)}/>}

      {analyticsPost && (
        <EngagementPanel
          post={analyticsPost}
          onClose={()=>setAnalyticsPost(null)}
          onGrade={handleGradeStudent}
        />
      )}
    </div>
  )
}

