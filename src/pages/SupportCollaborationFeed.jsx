// src/pages/SupportCollaborationFeed.jsx
import React, { useState, useEffect } from 'react'
import { useStore } from '../lib/store'
import SharedNoteEditor from '../components/support/SharedNoteEditor'
import SharedTaskCard from '../components/support/SharedTaskCard'

const C = {
  bg: '#060810',
  card: '#111520',
  inner: '#1a1f2e',
  raised: '#1e2436',
  text: '#eef0f8',
  soft: '#c8cce0',
  muted: '#6b7494',
  border: '#252b3d',
  green: '#22c97a',
  blue: '#3b7ef4',
  red: '#f04a4a',
  amber: '#f5a623',
  teal: '#0fb8a0',
  purple: '#9b6ef5',
}

const EVENT_TYPES = [
  { id: 'all', label: 'All Activity', icon: '📋' },
  { id: 'notes', label: 'Shared Notes', icon: '📝' },
  { id: 'tasks', label: 'Shared Tasks', icon: '✅' },
  { id: 'interventions', label: 'Intervention Updates', icon: '🎯' },
  { id: 'groups', label: 'Group Activity', icon: '👥' },
  { id: 'caseload', label: 'Caseload Changes', icon: '📋' },
  { id: 'automation', label: 'Automation Events', icon: '🤖' },
]

const DEMO_COLLABORATION_FEED = [
  {
    id: 1,
    type: 'note',
    author: 'Ms. Johnson',
    authorRole: 'teacher',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    title: 'Math Intervention Progress',
    content: 'Student shows improvement in fraction operations. Consider moving to advanced group.',
    studentName: 'Aaliyah Brooks',
    visibility: 'team',
    attachments: [],
    reactions: { '👍': 2, '❤️': 1 }
  },
  {
    id: 2,
    type: 'task',
    author: 'Mr. Rivera',
    authorRole: 'supportStaff',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    title: 'Review Science Group Progress',
    content: 'Check in with students about upcoming lab project understanding',
    assignedTo: 'Dr. Green',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    priority: 'medium',
    status: 'pending',
    studentName: 'Science Intervention Group'
  },
  {
    id: 3,
    type: 'intervention',
    author: 'System',
    authorRole: 'automation',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    title: 'Intervention Plan Updated',
    content: 'Math support plan for Marcus Thompson marked as effective - 85% improvement rate',
    studentName: 'Marcus Thompson',
    interventionType: 'academic',
    status: 'active'
  },
  {
    id: 4,
    type: 'group',
    author: 'Ms. Davis',
    authorRole: 'teacher',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    title: 'Reading Group Formation',
    content: 'Created new reading support group with 4 students showing similar needs',
    groupName: 'Reading Support - Level 2',
    groupSize: 4,
    groupFocus: 'Reading comprehension'
  },
  {
    id: 5,
    type: 'caseload',
    author: 'System',
    authorRole: 'automation',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    title: 'Caseload Alert',
    content: '3 new students added to your caseload this week',
    studentsAdded: ['Liam Martinez', 'Zoe Anderson', 'Ethan Brown'],
    totalCaseload: 28
  },
  {
    id: 6,
    type: 'automation',
    author: 'AI Assistant',
    authorRole: 'ai',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    title: 'Weekly Summary Generated',
    content: 'AI-generated weekly summary highlights 5 students needing immediate attention',
    summaryType: 'weekly',
    priorityStudents: ['Marcus Thompson', 'Liam Martinez', 'Zoe Anderson']
  }
]

export default function SupportCollaborationFeed() {
  const {
    getCollaborationFeed,
    createSharedNote,
    createSharedTask,
    updateSharedTask,
    getSharedTasksForStudent,
    getSharedNotesForStudent,
    getSharedGroupActivity,
    getStudentsForSupportStaff,
    getSupportStaffGroups,
    getTeachersForSupportStaff,
    getAdminForSupportStaff
  } = useStore()

  const [feed, setFeed] = useState([])
  const [filteredFeed, setFilteredFeed] = useState([])
  const [selectedType, setSelectedType] = useState('all')
  const [selectedTeam, setSelectedTeam] = useState('all')
  const [selectedStudent, setSelectedStudent] = useState('all')
  const [showNoteEditor, setShowNoteEditor] = useState(false)
  const [showTaskCreator, setShowTaskCreator] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCollaborationFeed()
  }, [])

  useEffect(() => {
    filterFeed()
  }, [feed, selectedType, selectedTeam, selectedStudent])

  async function loadCollaborationFeed() {
    setLoading(true)
    try {
      const collaborationData = await getCollaborationFeed?.() || DEMO_COLLABORATION_FEED
      setFeed(collaborationData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)))
    } catch (error) {
      console.error('Failed to load collaboration feed:', error)
      setFeed(DEMO_COLLABORATION_FEED.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)))
    } finally {
      setLoading(false)
    }
  }

  function filterFeed() {
    let filtered = [...feed]

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType)
    }

    // Filter by team/author
    if (selectedTeam !== 'all') {
      filtered = filtered.filter(item => item.authorRole === selectedTeam)
    }

    // Filter by student
    if (selectedStudent !== 'all') {
      filtered = filtered.filter(item => 
        item.studentName === selectedStudent || 
        (item.studentsAdded && item.studentsAdded.includes(selectedStudent))
      )
    }

    setFilteredFeed(filtered)
  }

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  function getEventTypeIcon(type) {
    const eventType = EVENT_TYPES.find(t => t.id === type)
    return eventType ? eventType.icon : '📋'
  }

  function getEventTypeColor(type) {
    switch (type) {
      case 'note': return C.blue
      case 'task': return C.green
      case 'intervention': return C.purple
      case 'group': return C.teal
      case 'caseload': return C.amber
      case 'automation': return C.red
      default: return C.muted
    }
  }

  function renderFeedItem(item) {
    const icon = getEventTypeIcon(item.type)
    const color = getEventTypeColor(item.type)

    return (
      <div
        key={item.id}
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: '16px',
          marginBottom: 12,
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.target.style.borderColor = color
          e.target.style.boxShadow = `0 0 0 1px ${color}22`
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = C.border
          e.target.style.boxShadow = 'none'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: `${color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14
            }}>
              {icon}
            </div>
            <div>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: C.text,
                marginBottom: 2
              }}>
                {item.title}
              </div>
              <div style={{
                fontSize: 11,
                color: C.muted
              }}>
                {item.author} • {formatTimestamp(item.timestamp)}
              </div>
            </div>
          </div>
          <div style={{
            padding: '4px 8px',
            background: C.inner,
            borderRadius: 4,
            fontSize: 10,
            color: C.soft,
            textTransform: 'uppercase',
            fontWeight: 600
          }}>
            {item.type}
          </div>
        </div>

        {/* Content */}
        <div style={{
          fontSize: 12,
          color: C.soft,
          lineHeight: 1.5,
          marginBottom: 12
        }}>
          {item.content}
        </div>

        {/* Type-specific details */}
        {item.type === 'task' && (
          <div style={{
            background: C.inner,
            padding: '8px 12px',
            borderRadius: 6,
            fontSize: 11,
            color: C.soft,
            marginBottom: 12
          }}>
            <div>Assigned to: <span style={{ color: C.text }}>{item.assignedTo}</span></div>
            <div>Due: <span style={{ color: C.text }}>{new Date(item.dueDate).toLocaleDateString()}</span></div>
            <div>Priority: <span style={{ color: item.priority === 'high' ? C.red : item.priority === 'medium' ? C.amber : C.green }}>{item.priority}</span></div>
          </div>
        )}

        {item.type === 'group' && (
          <div style={{
            background: C.inner,
            padding: '8px 12px',
            borderRadius: 6,
            fontSize: 11,
            color: C.soft,
            marginBottom: 12
          }}>
            <div>Group: <span style={{ color: C.text }}>{item.groupName}</span></div>
            <div>Size: <span style={{ color: C.text }}>{item.groupSize} students</span></div>
            <div>Focus: <span style={{ color: C.text }}>{item.groupFocus}</span></div>
          </div>
        )}

        {item.type === 'caseload' && (
          <div style={{
            background: C.inner,
            padding: '8px 12px',
            borderRadius: 6,
            fontSize: 11,
            color: C.soft,
            marginBottom: 12
          }}>
            <div>Students added: <span style={{ color: C.text }}>{item.studentsAdded.join(', ')}</span></div>
            <div>Total caseload: <span style={{ color: C.text }}>{item.totalCaseload} students</span></div>
          </div>
        )}

        {/* Student/Group context */}
        {item.studentName && (
          <div style={{
            fontSize: 11,
            color: C.blue,
            marginBottom: 8
          }}>
            👤 {item.studentName}
          </div>
        )}

        {/* Reactions */}
        {item.reactions && Object.keys(item.reactions).length > 0 && (
          <div style={{
            display: 'flex',
            gap: 8,
            fontSize: 11,
            color: C.muted
          }}>
            {Object.entries(item.reactions).map(([emoji, count]) => (
              <span key={emoji} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {emoji} {count}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginTop: 12
        }}>
          <button
            style={{
              padding: '4px 8px',
              background: C.inner,
              border: 'none',
              borderRadius: 4,
              fontSize: 10,
              color: C.soft,
              cursor: 'pointer'
            }}
          >
            💬 Comment
          </button>
          {item.type === 'task' && item.status === 'pending' && (
            <button
              style={{
                padding: '4px 8px',
                background: C.green,
                border: 'none',
                borderRadius: 4,
                fontSize: 10,
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              ✅ Complete
            </button>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: C.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: C.text
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid rgba(59, 126, 244, 0.2)',
            borderTop: '3px solid #3b7ef4',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <div>Loading collaboration feed...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      padding: '20px',
      color: C.text
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{
            fontSize: 28,
            fontWeight: 800,
            margin: 0,
            marginBottom: 8
          }}>
            🤝 Support Staff Collaboration
          </h1>
          <p style={{
            fontSize: 14,
            color: C.muted,
            margin: 0
          }}>
            Real-time feed of shared notes, tasks, and team activities
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => setShowNoteEditor(true)}
            style={{
              padding: '10px 16px',
              background: C.blue,
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            📝 Share Note
          </button>
          <button
            onClick={() => setShowTaskCreator(true)}
            style={{
              padding: '10px 16px',
              background: C.green,
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ✅ Create Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {/* Event Type Filter */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
              Event Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: C.inner,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                color: C.text,
                fontSize: 12
              }}
            >
              {EVENT_TYPES.map(type => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Team Filter */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
              Team
            </label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: C.inner,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                color: C.text,
                fontSize: 12
              }}
            >
              <option value="all">All Teams</option>
              <option value="teacher">Teachers</option>
              <option value="supportStaff">Support Staff</option>
              <option value="admin">Administrators</option>
              <option value="automation">Automation</option>
              <option value="ai">AI Assistant</option>
            </select>
          </div>

          {/* Student Filter */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
              Student
            </label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: C.inner,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                color: C.text,
                fontSize: 12
              }}
            >
              <option value="all">All Students</option>
              <option value="Aaliyah Brooks">Aaliyah Brooks</option>
              <option value="Marcus Thompson">Marcus Thompson</option>
              <option value="Liam Martinez">Liam Martinez</option>
              <option value="Zoe Anderson">Zoe Anderson</option>
              <option value="Ethan Brown">Ethan Brown</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div>
        <div style={{
          fontSize: 14,
          fontWeight: 600,
          color: C.text,
          marginBottom: 16
        }}>
          {filteredFeed.length} {filteredFeed.length === 1 ? 'activity' : 'activities'}
        </div>
        
        {filteredFeed.length === 0 ? (
          <div style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: '40px',
            textAlign: 'center',
            color: C.muted
          }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>📭</div>
            <div>No activities found matching your filters</div>
          </div>
        ) : (
          filteredFeed.map(renderFeedItem)
        )}
      </div>

      {/* Modals */}
      {showNoteEditor && (
        <SharedNoteEditor
          onClose={() => setShowNoteEditor(false)}
          onSave={(note) => {
            // Handle note save
            setShowNoteEditor(false)
            loadCollaborationFeed()
          }}
        />
      )}

      {showTaskCreator && (
        <SharedTaskCard
          mode="create"
          onClose={() => setShowTaskCreator(false)}
          onSave={(task) => {
            // Handle task save
            setShowTaskCreator(false)
            loadCollaborationFeed()
          }}
        />
      )}
    </div>
  )
}
