import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'

const WIDGETS_BY_ROLE = {
  teacher: [
    { id: 'gradebook', label: 'Gradebook',       icon: '📚', path: '/teacher/gradebook' },
    { id: 'lessonPlan', label: 'Lesson Plans',   icon: '📋', path: '/teacher/lessons' },
    { id: 'messages',   label: 'Messages',       icon: '💬', path: '/teacher/messages' },
    { id: 'reports',    label: 'Reports',        icon: '📊', path: '/teacher/reports' },
    { id: 'testing',    label: 'Testing Suite',  icon: '🧪', path: '/teacher/testing' },
    { id: 'feed',       label: 'Class Feed',     icon: '📢', path: '/teacher/feed' },
    { id: 'integrations', label: 'Integrations',icon: '🔗', path: '/teacher/integrations' },
  ],
  student: [
    { id: 'grades',   label: 'Grades',   icon: '📊' },
    { id: 'scan',     label: 'Scan',     icon: '📷' },
    { id: 'messages', label: 'Messages', icon: '💬' },
    { id: 'feeds',    label: 'Class Feed', icon: '📢' },
  ],
  parent: [
    { id: 'grades',   label: 'Grades',    icon: '📊' },
    { id: 'feed',     label: 'Class Feed',icon: '📢' },
    { id: 'messages', label: 'Messages',  icon: '💬' },
  ],
  admin: [
    { id: 'reports',  label: 'Reports',   icon: '📊', path: '/admin/reports' },
    { id: 'messages', label: 'Messages',  icon: '💬', path: '/admin/messages' },
    { id: 'feed',     label: 'Class Feed',icon: '📢', path: '/admin/feed' },
  ],
}

export default function Widgets() {
  const navigate = useNavigate()
  const role = useStore(s => s.currentUser?.role) || 'teacher'
  const widgets = WIDGETS_BY_ROLE[role] || WIDGETS_BY_ROLE.teacher

  function onOpen(widget) {
    if (widget.path) {
      navigate(widget.path)
      return
    }
    if (role === 'student') {
      navigate('/student', { state: { open: widget.id } })
      return
    }
    if (role === 'parent') {
      navigate('/parent', { state: { open: widget.id } })
      return
    }
    navigate(`/${role}`)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#060810', color:'#eef0f8', padding:'90px 16px 100px' }}>
      <h1 style={{ marginBottom:18, fontSize:22, fontWeight:800 }}>All Widgets</h1>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:12 }}>
        {widgets.map(widget => (
          <button key={widget.id} onClick={() => onOpen(widget)}
            style={{ border:'1px solid rgba(255,255,255,0.12)', borderRadius:16, padding:'18px 10px', background:'#111520', color:'#eef0f8', cursor:'pointer', textAlign:'left', minHeight:110 }}>
            <div style={{ fontSize:24, marginBottom:10 }}>{widget.icon}</div>
            <div style={{ fontSize:15, fontWeight:700 }}>{widget.label}</div>
          </button>
        ))}
      </div>
      <div style={{ marginTop:16, fontSize:11, color:'#6b7494' }}>
        Tap a widget to open directly without needing to return to the dashboard.
      </div>
    </div>
  )
}
