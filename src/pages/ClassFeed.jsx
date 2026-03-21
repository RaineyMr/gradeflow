import React, { useState } from 'react'

const C = {
  bg:'#060810', card:'#161923', inner:'#1e2231', border:'#2a2f42',
  text:'#eef0f8', muted:'#6b7494', green:'#22c97a', blue:'#3b7ef4',
  red:'#f04a4a', amber:'#f5a623', purple:'#9b6ef5', teal:'#0fb8a0',
}

const INITIAL_POSTS = [
  {
    id:1, author:'Ms. Johnson', role:'teacher', avatar:'👩‍🏫', subject:'Math',
    content:'📅 Test Friday on Chapter 4 — fractions and decimals! Study pages 84–91. I\'ll be available tomorrow before school for any questions.',
    time:'1h ago', pinned:true,
    reactions:{ '👍':8, '❤️':3, '😮':1 },
    comments:[
      { id:1, author:'Marcus T.', content:'Will there be word problems?', time:'45m ago' },
      { id:2, author:'Ms. Johnson', content:'Yes, 3 word problems. Focus on the examples from Tuesday!', time:'30m ago' },
    ],
  },
  {
    id:2, author:'Mr. Lee', role:'teacher', avatar:'👨‍🏫', subject:'Science',
    content:'🔬 Science fair projects are DUE this Friday! Setup starts at 8am in the gym. Make sure your display board is complete. Extra credit for working models!',
    time:'3h ago', pinned:false,
    reactions:{ '👍':12, '😂':2, '🔥':5 },
    comments:[],
  },
  {
    id:3, author:'Ms. Davis', role:'teacher', avatar:'👩‍🏫', subject:'Reading',
    content:'📚 Fantastic reading logs this week everyone — the class average is up to 91%! Keep it up, we\'re on track for the reading challenge prize. 🏆',
    time:'5h ago', pinned:false,
    reactions:{ '❤️':15, '👍':6, '🎉':9 },
    comments:[
      { id:1, author:'Sofia R.', content:'Yay!! I finished my book last night 📖', time:'4h ago' },
    ],
  },
  {
    id:4, author:'Ms. Clark', role:'teacher', avatar:'👩‍🏫', subject:'Writing',
    content:'✍️ Essay drafts are due Monday. Remember: introduction, 3 body paragraphs, conclusion. Use the graphic organizer from class!',
    time:'Yesterday', pinned:false,
    reactions:{ '👍':4, '😤':2 },
    comments:[],
  },
]

const EMOJI_OPTIONS = ['👍','❤️','🎉','😮','😂','🔥','✅','🙌']

function timeAgo(t) { return t }

export default function ClassFeed({ onBack, currentUser }) {
  const role    = currentUser?.role || 'teacher'
  const canPost = role === 'teacher' || role === 'admin'

  const [posts, setPosts]         = useState(INITIAL_POSTS)
  const [selectedPost, setSelectedPost] = useState(null)
  const [filter, setFilter]       = useState('all')
  const [composing, setComposing] = useState(false)
  const [draft, setDraft]         = useState('')
  const [myReactions, setMyReactions] = useState({})
  const [newComment, setNewComment] = useState('')
  const [emojiPicker, setEmojiPicker] = useState(null)

  function react(postId, emoji) {
    const key = `${postId}-${emoji}`
    const wasReacted = myReactions[key]
    setMyReactions(prev => ({ ...prev, [key]: !wasReacted }))
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      const reactions = { ...p.reactions }
      reactions[emoji] = (reactions[emoji] || 0) + (wasReacted ? -1 : 1)
      if (reactions[emoji] <= 0) delete reactions[emoji]
      return { ...p, reactions }
    }))
    setEmojiPicker(null)
  }

  function addComment(postId) {
    if (!newComment.trim()) return
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      return { ...p, comments: [...p.comments, { id:Date.now(), author:'You', content:newComment.trim(), time:'Just now' }] }
    }))
    setNewComment('')
  }

  function submitPost() {
    if (!draft.trim()) return
    const newPost = {
      id: Date.now(),
      author: currentUser?.userName || 'Teacher',
      role, avatar:'👩‍🏫', subject:'Class',
      content: draft.trim(),
      time:'Just now', pinned:false,
      reactions:{}, comments:[],
    }
    setPosts(prev => [newPost, ...prev])
    setDraft('')
    setComposing(false)
  }

  const filteredPosts = filter === 'pinned' ? posts.filter(p => p.pinned) : posts
  const displayPost = selectedPost ? posts.find(p => p.id === selectedPost) : null

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', paddingBottom:40 }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#0f1a2a,#060810)', padding:'20px 16px 20px', borderBottom:`1px solid ${C.border}` }}>
        <button onClick={selectedPost ? () => setSelectedPost(null) : onBack}
          style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:600, marginBottom:12 }}>
          ← {selectedPost ? 'Back to Feed' : 'Back'}
        </button>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>📢 Class Feed</h1>
          {canPost && !selectedPost && (
            <button onClick={() => setComposing(true)}
              style={{ background:'var(--school-color,#f97316)', color:'#fff', border:'none', borderRadius:10, padding:'8px 14px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
              + Post
            </button>
          )}
        </div>
      </div>

      {/* Compose modal */}
      {composing && (
        <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:'20px 20px 0 0', padding:20, width:'100%', maxWidth:480 }}>
            <h3 style={{ margin:'0 0 12px', color:C.text, fontSize:15 }}>New Post</h3>
            <textarea rows={5} value={draft} onChange={e => setDraft(e.target.value)} placeholder="Share an update, reminder, or announcement with your class..."
              style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 14px', color:C.text, fontSize:13, resize:'none', boxSizing:'border-box', lineHeight:1.6, outline:'none' }} />
            <div style={{ display:'flex', gap:8, marginTop:10 }}>
              <button onClick={submitPost}
                style={{ flex:1, background:'var(--school-color,#f97316)', color:'#fff', border:'none', borderRadius:999, padding:12, fontSize:14, fontWeight:700, cursor:'pointer' }}>Post</button>
              <button onClick={() => { setComposing(false); setDraft('') }}
                style={{ flex:1, background:C.inner, color:C.muted, border:'none', borderRadius:999, padding:12, fontSize:13, fontWeight:600, cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding:'12px 16px' }}>
        {/* Filters */}
        {!selectedPost && (
          <div style={{ display:'flex', gap:6, marginBottom:14, overflowX:'auto', paddingBottom:2 }}>
            {[['all','All Posts'],['pinned','📌 Pinned']].map(([id, label]) => (
              <button key={id} onClick={() => setFilter(id)}
                style={{ background:filter===id?'var(--school-color,#f97316)':C.inner, color:filter===id?'#fff':C.muted, border:'none', borderRadius:999, padding:'6px 14px', fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Single post view */}
        {displayPost && (
          <div>
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:20, marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:C.inner, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
                    {displayPost.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{displayPost.author}</div>
                    <div style={{ fontSize:10, color:C.muted }}>{displayPost.subject} · {displayPost.time}</div>
                  </div>
                </div>
                {displayPost.pinned && <span style={{ fontSize:10, background:`${C.amber}22`, color:C.amber, borderRadius:999, padding:'3px 8px', fontWeight:700 }}>📌 Pinned</span>}
              </div>
              <p style={{ fontSize:14, lineHeight:1.7, color:C.text, margin:'0 0 16px' }}>{displayPost.content}</p>

              {/* Reactions */}
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
                {Object.entries(displayPost.reactions).map(([emoji, count]) => (
                  <button key={emoji} onClick={() => react(displayPost.id, emoji)}
                    style={{ background:myReactions[`${displayPost.id}-${emoji}`]?'rgba(59,126,244,0.2)':C.inner, border:`1px solid ${myReactions[`${displayPost.id}-${emoji}`]?C.blue:C.border}`, borderRadius:999, padding:'4px 10px', fontSize:13, color:C.text, cursor:'pointer' }}>
                    {emoji} {count}
                  </button>
                ))}
                <div style={{ position:'relative' }}>
                  <button onClick={() => setEmojiPicker(emojiPicker===displayPost.id?null:displayPost.id)}
                    style={{ background:C.inner, border:`1px solid ${C.border}`, borderRadius:999, padding:'4px 10px', fontSize:13, color:C.muted, cursor:'pointer' }}>
                    + React
                  </button>
                  {emojiPicker===displayPost.id && (
                    <div style={{ position:'absolute', bottom:'110%', left:0, background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:8, display:'flex', gap:4, flexWrap:'wrap', width:180, zIndex:10, boxShadow:'0 8px 24px rgba(0,0,0,0.4)' }}>
                      {EMOJI_OPTIONS.map(e => (
                        <button key={e} onClick={() => react(displayPost.id, e)}
                          style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', padding:3, borderRadius:6 }}>
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Comments */}
              <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
                <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>
                  {displayPost.comments.length} Comments
                </div>
                {displayPost.comments.map(c => (
                  <div key={c.id} style={{ background:C.inner, borderRadius:10, padding:'8px 12px', marginBottom:6 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:11, fontWeight:700, color:C.text }}>{c.author}</span>
                      <span style={{ fontSize:10, color:C.muted }}>{c.time}</span>
                    </div>
                    <p style={{ fontSize:12, color:'#c0c8e0', margin:0, lineHeight:1.5 }}>{c.content}</p>
                  </div>
                ))}
                <div style={{ display:'flex', gap:8, marginTop:8 }}>
                  <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..."
                    onKeyDown={e => e.key==='Enter' && addComment(displayPost.id)}
                    style={{ flex:1, background:C.inner, border:`1px solid ${C.border}`, borderRadius:10, padding:'8px 12px', color:C.text, fontSize:12, outline:'none' }} />
                  <button onClick={() => addComment(displayPost.id)}
                    style={{ background:'var(--school-color,#f97316)', color:'#fff', border:'none', borderRadius:10, padding:'8px 14px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feed list */}
        {!selectedPost && filteredPosts.map(post => (
          <div key={post.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:'14px 16px', marginBottom:10, cursor:'pointer', transition:'border-color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor='var(--school-color,#f97316)'}
            onMouseLeave={e => e.currentTarget.style.borderColor=C.border}>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:C.inner, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                  {post.avatar}
                </div>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:C.text }}>{post.author}</div>
                  <div style={{ fontSize:10, color:C.muted }}>{post.subject} · {post.time}</div>
                </div>
              </div>
              {post.pinned && <span style={{ fontSize:9, background:`${C.amber}22`, color:C.amber, borderRadius:999, padding:'2px 6px', fontWeight:700, flexShrink:0 }}>📌</span>}
            </div>

            <p onClick={() => setSelectedPost(post.id)} style={{ fontSize:13, lineHeight:1.6, color:C.text, margin:'0 0 10px', cursor:'pointer' }}>
              {post.content.substring(0,120)}{post.content.length>120?'...':''}
            </p>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                {Object.entries(post.reactions).slice(0,3).map(([emoji, count]) => (
                  <button key={emoji} onClick={() => react(post.id, emoji)}
                    style={{ background:myReactions[`${post.id}-${emoji}`]?`${C.blue}22`:C.inner, border:`1px solid ${myReactions[`${post.id}-${emoji}`]?C.blue:C.border}`, borderRadius:999, padding:'3px 8px', fontSize:12, color:C.text, cursor:'pointer' }}>
                    {emoji} {count}
                  </button>
                ))}
                <button onClick={() => setSelectedPost(post.id)}
                  style={{ background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:11 }}>
                  + React
                </button>
              </div>
              <button onClick={() => setSelectedPost(post.id)}
                style={{ background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:11 }}>
                💬 {post.comments.length} · Read more →
              </button>
            </div>
          </div>
        ))}

        {filteredPosts.length === 0 && (
          <div style={{ textAlign:'center', padding:'40px 0', color:C.muted }}>
            <div style={{ fontSize:40, marginBottom:12 }}>📢</div>
            <p>No posts yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
