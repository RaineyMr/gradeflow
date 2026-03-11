import React, { useState } from 'react'
import { useStore } from '../lib/store'

const C = { bg:'#060810',card:'#161923',inner:'#1e2231',text:'#eef0f8',muted:'#6b7494',border:'#2a2f42',green:'#22c97a',blue:'#3b7ef4',red:'#f04a4a',amber:'#f5a623',purple:'#9b6ef5',teal:'#0fb8a0' }
const REACTIONS = ['👍','❤️','😂','🙌','😮','🔥']

export default function ClassFeed({ onBack }) {
  const { feed, classes, activeClass, addFeedPost, teacher, goBack } = useStore()
  const handleBack = onBack || goBack
  const cls         = activeClass || classes[0]
  const posts       = feed.filter(f => f.classId === cls?.id)
  const [composing, setComposing]   = useState(false)
  const [draft,     setDraft]       = useState('')
  const [postReactions, setPostReactions] = useState({})
  const [filterClass, setFilterClass] = useState(cls?.id || 'all')
  const [pending,   setPending]     = useState([
    { id:'p1', author:'Marcus T.', content:'Can we get extra credit?', time:'10 min ago' },
    { id:'p2', author:'Sofia R.',  content:'Worksheet question 3 is confusing, can you explain?', time:'5 min ago' },
  ])
  const [modMode,   setModMode]     = useState(false)

  function handlePost() {
    if (!draft.trim()) return
    addFeedPost(cls?.id || 1, draft.trim())
    setDraft('')
    setComposing(false)
  }

  function handleReaction(postId, emoji) {
    setPostReactions(prev => ({
      ...prev,
      [postId]: { ...(prev[postId] || {}), [emoji]: ((prev[postId]?.[emoji] || 0) + 1) },
    }))
  }

  function approvePending(id) { setPending(p => p.filter(x => x.id !== id)) }
  function removePending(id)  { setPending(p => p.filter(x => x.id !== id)) }

  const displayedPosts = filterClass === 'all' ? feed : feed.filter(f => f.classId === filterClass)

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', paddingBottom:80 }}>
      {/* Header */}
      <div style={{ padding:'20px 16px 0', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {handleBack && <button onClick={handleBack} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>}
          <div>
            <h1 style={{ fontSize:22, fontWeight:800, margin:'0 0 2px' }}>Class Feed 📢</h1>
            <p style={{ fontSize:12, color:C.muted, margin:0 }}>Announcements, updates & class activity</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => setModMode(m => !m)}
            style={{ background: modMode ? `${C.amber}22` : C.inner, color: modMode ? C.amber : C.muted, border:'none', borderRadius:10, padding:'8px 12px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
            {modMode ? '👁 Mod ON' : '⚙ Mod'}
          </button>
          <button onClick={() => setComposing(true)} style={{ background:'var(--school-color)', border:'none', borderRadius:10, padding:'8px 14px', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer' }}>+ Post</button>
        </div>
      </div>

      {/* Class filter */}
      <div style={{ display:'flex', gap:6, padding:'0 16px', marginBottom:16, overflowX:'auto' }}>
        <button onClick={() => setFilterClass('all')}
          style={{ padding:'6px 14px', borderRadius:999, border:'none', cursor:'pointer', fontSize:11, fontWeight:700, whiteSpace:'nowrap',
            background: filterClass==='all' ? 'var(--school-color)' : C.inner,
            color:      filterClass==='all' ? '#fff' : C.muted }}>All Classes</button>
        {classes.map(c => (
          <button key={c.id} onClick={() => setFilterClass(c.id)}
            style={{ padding:'6px 14px', borderRadius:999, border:'none', cursor:'pointer', fontSize:11, fontWeight:700, whiteSpace:'nowrap',
              background: filterClass===c.id ? 'var(--school-color)' : C.inner,
              color:      filterClass===c.id ? '#fff' : C.muted }}>
            {c.period} · {c.subject}
          </button>
        ))}
      </div>

      {/* Compose */}
      {composing && (
        <div style={{ margin:'0 16px 16px', background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:16 }}>
          <textarea
            autoFocus rows={4} value={draft} onChange={e => setDraft(e.target.value)}
            placeholder="Write a post for your class..."
            style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 14px', color:C.text, fontSize:13, resize:'none', boxSizing:'border-box', lineHeight:1.6 }}
          />
          <div style={{ display:'flex', gap:8, marginTop:10 }}>
            <button onClick={handlePost}                 style={{ flex:1, background:'var(--school-color)', color:'#fff', border:'none', borderRadius:999, padding:'10px', fontSize:13, fontWeight:800, cursor:'pointer' }}>Post</button>
            <button onClick={() => setComposing(false)}  style={{ flex:1, background:C.inner, color:C.muted, border:'none', borderRadius:999, padding:'10px', fontSize:13, fontWeight:700, cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Pending approvals */}
      {modMode && pending.length > 0 && (
        <div style={{ margin:'0 16px 16px', background:'#1a1800', border:`1px solid ${C.amber}30`, borderRadius:18, padding:16 }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.amber, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Pending Approval ({pending.length})</div>
          {pending.map(p => (
            <div key={p.id} style={{ background:C.inner, borderRadius:12, padding:'10px 12px', marginBottom:8 }}>
              <div style={{ fontWeight:700, fontSize:12, color:C.text, marginBottom:4 }}>{p.author}</div>
              <div style={{ fontSize:12, color:C.muted, marginBottom:8 }}>{p.content}</div>
              <div style={{ fontSize:10, color:C.muted, marginBottom:8 }}>{p.time}</div>
              <div style={{ display:'flex', gap:6 }}>
                <button onClick={() => approvePending(p.id)} style={{ background:`${C.green}22`, color:C.green, border:'none', borderRadius:8, padding:'5px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>✓ Approve</button>
                <button onClick={() => removePending(p.id)}  style={{ background:`${C.red}22`,   color:C.red,   border:'none', borderRadius:8, padding:'5px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>✕ Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Posts */}
      {displayedPosts.length === 0 ? (
        <div style={{ textAlign:'center', padding:40, color:C.muted }}>
          <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
          <p>No posts yet. Be the first to post!</p>
        </div>
      ) : displayedPosts.map(post => {
        const cls = classes.find(c => c.id === post.classId)
        const combinedReactions = { ...(post.reactions || {}), ...(postReactions[post.id] || {}) }
        return (
          <div key={post.id} style={{ margin:'0 16px 14px', background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:'16px 18px' }}>
            {/* Author */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--school-color)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                  {post.author === teacher?.name ? '👩‍🏫' : '🎓'}
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:13, color:C.text }}>{post.author}</div>
                  <div style={{ fontSize:10, color:C.muted }}>{cls?.subject || 'Class'} · {post.time}</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                {post.confused > 0 && <span style={{ background:`${C.amber}18`, color:C.amber, borderRadius:999, padding:'3px 8px', fontSize:10, fontWeight:700 }}>😕 {post.confused}</span>}
                {post.questions > 0 && <span style={{ background:`${C.blue}18`, color:C.blue, borderRadius:999, padding:'3px 8px', fontSize:10, fontWeight:700 }}>❓ {post.questions}</span>}
              </div>
            </div>

            {/* Content */}
            <p style={{ fontSize:13, color:C.text, lineHeight:1.7, margin:'0 0 14px' }}>{post.content}</p>

            {/* Reactions */}
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', borderTop:`1px solid ${C.border}`, paddingTop:10 }}>
              {REACTIONS.map(emoji => {
                const count = combinedReactions[emoji] || 0
                return (
                  <button key={emoji} onClick={() => handleReaction(post.id, emoji)}
                    style={{ background: count > 0 ? `${C.blue}22` : C.inner, border: count > 0 ? `1px solid ${C.blue}50` : `1px solid ${C.border}`, borderRadius:999, padding:'4px 10px', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', gap:4 }}>
                    {emoji}
                    {count > 0 && <span style={{ fontSize:10, fontWeight:700, color:C.blue }}>{count}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
