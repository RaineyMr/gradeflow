import React, { useState } from 'react'
import { useStore } from '../lib/store'
import { Tag } from '../components/ui'

export default function ClassFeed() {
  const { feed, classes, activeClass } = useStore()
  const [selectedClass, setSelectedClass] = useState(activeClass?.id || classes[0]?.id)
  const [newPost, setNewPost] = useState('')
  const [posts, setPosts] = useState(feed)
  const [pendingPosts, setPendingPosts] = useState([
    { id: 99, author: 'Aaliyah Brooks', content: 'Will the test be open book?', time: '5 min ago', pending: true, classId: 1 },
  ])
  const [moderationOn, setModerationOn] = useState(true)

  const classPosts = posts.filter(p => p.classId === selectedClass)
  const classPending = pendingPosts.filter(p => p.classId === selectedClass)

  function approvePost(id) {
    const post = pendingPosts.find(p => p.id === id)
    if (post) {
      setPosts(prev => [...prev, { ...post, pending: false, reactions: {}, confused: 0, questions: 0, approved: true }])
      setPendingPosts(prev => prev.filter(p => p.id !== id))
    }
  }

  function rejectPost(id) {
    setPendingPosts(prev => prev.filter(p => p.id !== id))
  }

  function handlePublish() {
    if (!newPost.trim()) return
    const post = {
      id: Date.now(), classId: selectedClass, author: 'Ms. Johnson',
      content: newPost, time: 'Just now', reactions: {}, confused: 0, questions: 0, approved: true
    }
    setPosts(prev => [...prev, post])
    setNewPost('')
  }

  function addReaction(postId, emoji) {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      const reactions = { ...p.reactions }
      reactions[emoji] = (reactions[emoji] || 0) + 1
      return { ...p, reactions }
    }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-primary">Class Feed</h1>
          <p className="text-text-muted text-sm">Posts · Reactions · Student questions</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-xs">Moderation</span>
          <button
            onClick={() => setModerationOn(m => !m)}
            className="w-10 h-5 rounded-full transition-all flex items-center px-0.5"
            style={{ background: moderationOn ? 'var(--school-color)' : '#2a2f42' }}
          >
            <div className="w-4 h-4 rounded-full bg-white transition-all" style={{ marginLeft: moderationOn ? 'auto' : 0 }} />
          </button>
        </div>
      </div>

      {/* Class tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {classes.map(c => (
          <button key={c.id} onClick={() => setSelectedClass(c.id)}
            className="flex-shrink-0 px-3 py-1.5 rounded-pill text-xs font-semibold transition-all"
            style={{ background: selectedClass === c.id ? 'var(--school-color)' : '#1e2231', color: selectedClass === c.id ? 'white' : '#6b7494' }}>
            {c.period} · {c.subject}
          </button>
        ))}
      </div>

      {/* Pending approvals */}
      {moderationOn && classPending.length > 0 && (
        <div className="mb-6">
          <p className="tag-label mb-3">Pending Approval ({classPending.length})</p>
          <div className="space-y-2">
            {classPending.map(p => (
              <div key={p.id} className="p-3 rounded-card flex items-center gap-3" style={{ background: '#1a1a0a', border: '1px solid #f5a62330' }}>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-warning mb-1">{p.author} · {p.time}</p>
                  <p className="text-sm text-text-primary">{p.content}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => approvePost(p.id)} className="px-3 py-1 rounded-pill text-xs font-bold" style={{ background: '#22c97a20', color: '#22c97a' }}>✓ Approve</button>
                  <button onClick={() => rejectPost(p.id)} className="px-2 py-1 rounded-pill text-xs font-bold" style={{ background: '#f04a4a20', color: '#f04a4a' }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New post composer */}
      <div className="p-4 rounded-card mb-6" style={{ background: '#161923' }}>
        <textarea
          className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm resize-none mb-3"
          rows={3}
          placeholder="Post to class feed..."
          value={newPost}
          onChange={e => setNewPost(e.target.value)}
        />
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {[
              { icon: '📎', label: 'Attach file', action: () => document.getElementById('feed-file-input')?.click() },
              { icon: '🔗', label: 'Add link', action: () => { const url = prompt('Paste a link:'); if (url) setNewPost(p => p + ' ' + url) } },
              { icon: '📷', label: 'Add photo', action: () => document.getElementById('feed-file-input')?.click() },
            ].map(btn => (
              <button key={btn.icon} onClick={btn.action} title={btn.label} className="p-1.5 rounded-card hover:bg-elevated transition-colors text-sm">{btn.icon}</button>
            ))}
            <input id="feed-file-input" type="file" accept="image/*,.pdf" className="hidden" onChange={e => { if (e.target.files[0]) setNewPost(p => p + ' [Attachment: ' + e.target.files[0].name + ']') }} />
          </div>
          <button
            onClick={handlePublish}
            disabled={!newPost.trim()}
            className="px-4 py-1.5 rounded-pill text-sm font-bold disabled:opacity-40 transition-all hover:opacity-90"
            style={{ background: 'var(--school-color)', color: 'white' }}
          >
            Post
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {classPosts.map(post => (
          <div key={post.id} className="p-4 rounded-card" style={{ background: '#161923' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-sm text-text-primary">{post.author}</span>
              <span className="text-text-muted text-xs">{post.time}</span>
            </div>
            <p className="text-text-primary text-sm mb-3 leading-relaxed">{post.content}</p>

            {/* Stats row */}
            <div className="flex items-center gap-3 mb-3">
              {post.confused > 0 && <Tag color="#f5a623">😕 {post.confused} confused</Tag>}
              {post.questions > 0 && <Tag color="#3b7ef4">❓ {post.questions} questions</Tag>}
            </div>

            {/* Reactions */}
            <div className="flex items-center gap-2">
              {['👍', '❤️', '😂', '😕', '❓'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => addReaction(post.id, emoji)}
                  className="flex items-center gap-1 px-2 py-1 rounded-pill text-xs transition-all hover:scale-110"
                  style={{ background: '#1e2231', color: '#eef0f8' }}
                >
                  {emoji}
                  {post.reactions[emoji] > 0 && <span className="text-text-muted">{post.reactions[emoji]}</span>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
