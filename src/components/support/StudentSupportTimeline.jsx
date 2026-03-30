// src/components/support/StudentSupportTimeline.jsx
import React, { useState, useEffect } from 'react'
import { useStore } from '../../lib/store'
import TimelineEventCard from './TimelineEventCard'
import AIAssistantPanel from './AIAssistantPanel'

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

const EVENT_CATEGORIES = [
  { id: 'all', label: 'All Events', icon: '📋' },
  { id: 'support_logs', label: 'Support Logs', icon: '📝' },
  { id: 'interventions', label: 'Interventions', icon: '🎯' },
  { id: 'parent_messages', label: 'Parent Messages', icon: '💬' },
  { id: 'attendance', label: 'Attendance', icon: '📅' },
  { id: 'grades', label: 'Grades', icon: '📊' },
  { id: 'group_activity', label: 'Group Activity', icon: '👥' },
  { id: 'ai_insights', label: 'AI Insights', icon: '🤖' },
  { id: 'automation_tasks', label: 'Automation Tasks', icon: '⚡' },
  { id: 'shared_notes', label: 'Shared Notes', icon: '🗒️' },
  { id: 'shared_tasks', label: 'Shared Tasks', icon: '✅' }
]

const TIME_FILTERS = [
  { id: 'all', label: 'All Time' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'quarter', label: 'This Quarter' },
  { id: 'semester', label: 'This Semester' }
]

export default function StudentSupportTimeline({ studentId }) {
  const {
    getStudentSupportTimeline,
    mergeTimelineEvents,
    getStudentGrades,
    getStudentAttendance,
    getStudentNotes,
    getStudentInterventions,
    getSharedNotesForStudent,
    getSharedTasksForStudent,
    students
  } = useStore()

  const [timeline, setTimeline] = useState([])
  const [filteredTimeline, setFilteredTimeline] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [expandedEvents, setExpandedEvents] = useState(new Set())

  const student = students.find(s => s.id === parseInt(studentId))

  useEffect(() => {
    loadTimeline()
  }, [studentId])

  useEffect(() => {
    filterTimeline()
  }, [timeline, selectedCategory, selectedTimeFilter])

  async function loadTimeline() {
    setLoading(true)
    try {
      const timelineData = await getStudentSupportTimeline?.(studentId) || await generateDemoTimeline()
      setTimeline(timelineData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)))
    } catch (error) {
      console.error('Failed to load timeline:', error)
      const demoData = await generateDemoTimeline()
      setTimeline(demoData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)))
    } finally {
      setLoading(false)
    }
  }

  async function generateDemoTimeline() {
    const now = new Date()
    const events = []

    // Support Logs
    events.push({
      id: `log_${Date.now()}_1`,
      type: 'support_logs',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      title: 'Math Support Session',
      description: 'One-on-one tutoring session focusing on fraction operations',
      author: 'Ms. Johnson',
      authorRole: 'teacher',
      studentId: parseInt(studentId),
      details: {
        duration: '45 minutes',
        topics: ['Fraction operations', 'Problem-solving strategies'],
        nextSteps: 'Continue practice with mixed operations'
      }
    })

    events.push({
      id: `log_${Date.now()}_2`,
      type: 'support_logs',
      timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Behavioral Check-in',
      description: 'Discussion about classroom participation and engagement',
      author: 'Mr. Rivera',
      authorRole: 'supportStaff',
      studentId: parseInt(studentId),
      details: {
        duration: '30 minutes',
        observations: 'Improved participation in group activities',
        recommendations: 'Continue positive reinforcement'
      }
    })

    // Interventions
    events.push({
      id: `intervention_${Date.now()}_1`,
      type: 'interventions',
      timestamp: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Math Intervention Plan Started',
      description: 'Individualized math support plan implemented',
      author: 'Mr. Rivera',
      authorRole: 'supportStaff',
      studentId: parseInt(studentId),
      details: {
        planType: 'Academic Support',
        duration: '6 weeks',
        goals: ['Improve fraction understanding', 'Increase confidence'],
        status: 'active'
      }
    })

    // Parent Messages
    events.push({
      id: `message_${Date.now()}_1`,
      type: 'parent_messages',
      timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Parent Phone Call',
      description: 'Discussed student progress and upcoming intervention plan',
      author: 'Mr. Rivera',
      authorRole: 'supportStaff',
      studentId: parseInt(studentId),
      details: {
        communicationType: 'Phone Call',
        duration: '15 minutes',
        outcome: 'Parent supportive of intervention plan',
        followUp: 'Schedule check-in in 2 weeks'
      }
    })

    // Attendance
    events.push({
      id: `attendance_${Date.now()}_1`,
      type: 'attendance',
      timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Attendance Record',
      description: 'Present - on time',
      author: 'System',
      authorRole: 'automation',
      studentId: parseInt(studentId),
      details: {
        date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        status: 'Present',
        notes: 'No concerns'
      }
    })

    events.push({
      id: `attendance_${Date.now()}_2`,
      type: 'attendance',
      timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Tardy Arrival',
      description: 'Arrived 10 minutes late',
      author: 'System',
      authorRole: 'automation',
      studentId: parseInt(studentId),
      details: {
        date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        status: 'Tardy',
        minutesLate: 10,
        notes: 'Transportation issues'
      }
    })

    // Grades
    events.push({
      id: `grade_${Date.now()}_1`,
      type: 'grades',
      timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Math Quiz Score',
      description: 'Score: 85% - Significant Improvement',
      author: 'Ms. Johnson',
      authorRole: 'teacher',
      studentId: parseInt(studentId),
      details: {
        assignment: 'Chapter 5 Quiz - Fractions',
        score: 85,
        previousScore: 72,
        improvement: '+13 points',
        notes: 'Excellent progress in fraction operations'
      }
    })

    // Group Activity
    events.push({
      id: `group_${Date.now()}_1`,
      type: 'group_activity',
      timestamp: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Math Support Group Session',
      description: 'Participated in peer tutoring session',
      author: 'Ms. Davis',
      authorRole: 'teacher',
      studentId: parseInt(studentId),
      details: {
        groupName: 'Math Intervention - Level 2',
        activity: 'Peer tutoring',
        role: 'Both helped and received help',
        duration: '45 minutes'
      }
    })

    // AI Insights
    events.push({
      id: `ai_${Date.now()}_1`,
      type: 'ai_insights',
      timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'AI Progress Analysis',
      description: 'Student shows 23% improvement in math confidence',
      author: 'AI Assistant',
      authorRole: 'ai',
      studentId: parseInt(studentId),
      details: {
        analysisType: 'Weekly Progress Report',
        confidenceScore: 87,
        keyInsights: [
          'Math confidence increased significantly',
          'Participation in class discussions improved',
          'Homework completion rate: 95%'
        ],
        recommendations: [
          'Continue current intervention strategies',
          'Consider advanced math topics next month'
        ]
      }
    })

    // Automation Tasks
    events.push({
      id: `automation_${Date.now()}_1`,
      type: 'automation_tasks',
      timestamp: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Automated Progress Report Generated',
      description: 'Weekly progress report sent to parents and teachers',
      author: 'System',
      authorRole: 'automation',
      studentId: parseInt(studentId),
      details: {
        reportType: 'Weekly Progress Summary',
        recipients: ['Parents', 'Teachers', 'Support Staff'],
        highlights: [
          'Math grade improvement',
          'Positive behavior reports',
          'Consistent attendance'
        ]
      }
    })

    // Shared Notes
    events.push({
      id: `note_${Date.now()}_1`,
      type: 'shared_notes',
      timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Team Note: Math Progress',
      description: 'Student demonstrating excellent progress in recent math work',
      author: 'Ms. Johnson',
      authorRole: 'teacher',
      studentId: parseInt(studentId),
      details: {
        visibility: 'team',
        priority: 'medium',
        tags: ['math', 'progress', 'positive'],
        attachments: []
      }
    })

    // Shared Tasks
    events.push({
      id: `task_${Date.now()}_1`,
      type: 'shared_tasks',
      timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Review Math Intervention Progress',
      description: 'Assess effectiveness of current math intervention strategies',
      author: 'Mr. Rivera',
      authorRole: 'supportStaff',
      studentId: parseInt(studentId),
      details: {
        assignedTo: 'Mr. Rivera',
        dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'medium',
        status: 'pending'
      }
    })

    return events
  }

  function filterTimeline() {
    let filtered = [...timeline]

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.type === selectedCategory)
    }

    // Filter by time
    const now = new Date()
    let cutoffDate

    switch (selectedTimeFilter) {
      case 'week':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'quarter':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'semester':
        cutoffDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
        break
      default:
        cutoffDate = null
    }

    if (cutoffDate) {
      filtered = filtered.filter(event => new Date(event.timestamp) >= cutoffDate)
    }

    setFilteredTimeline(filtered)
  }

  function toggleEventExpanded(eventId) {
    setExpandedEvents(prev => {
      const newSet = new Set(prev)
      if (newSet.has(eventId)) {
        newSet.delete(eventId)
      } else {
        newSet.add(eventId)
      }
      return newSet
    })
  }

  function openAIForEvent(event) {
    setAiPanelOpen(true)
    // AI panel would be pre-populated with event context
  }

  function getEventTypeIcon(type) {
    const category = EVENT_CATEGORIES.find(c => c.id === type)
    return category ? category.icon : '📋'
  }

  function getEventTypeColor(type) {
    switch (type) {
      case 'support_logs': return C.blue
      case 'interventions': return C.purple
      case 'parent_messages': return C.green
      case 'attendance': return C.amber
      case 'grades': return C.teal
      case 'group_activity': return C.blue
      case 'ai_insights': return C.red
      case 'automation_tasks': return C.purple
      case 'shared_notes': return C.green
      case 'shared_tasks': return C.amber
      default: return C.muted
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        color: C.text
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 32,
            height: 32,
            border: '3px solid rgba(59, 126, 244, 0.2)',
            borderTop: '3px solid #3b7ef4',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <div>Loading timeline...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ color: C.text }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h3 style={{
            fontSize: 18,
            fontWeight: 700,
            margin: 0,
            marginBottom: 4
          }}>
            📅 Support Timeline
          </h3>
          <p style={{
            fontSize: 12,
            color: C.muted,
            margin: 0
          }}>
            Complete history of support interactions and events
          </p>
        </div>
        <button
          onClick={() => setAiPanelOpen(true)}
          style={{
            padding: '8px 12px',
            background: C.blue,
            border: 'none',
            borderRadius: 6,
            color: '#fff',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          🤖 AI Analysis
        </button>
      </div>

      {/* Filters */}
      <div style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Category Filter */}
          <div>
            <label style={{
              fontSize: 11,
              fontWeight: 600,
              color: C.muted,
              marginBottom: 6,
              display: 'block'
            }}>
              Event Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: C.inner,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                color: C.text,
                fontSize: 11
              }}
            >
              {EVENT_CATEGORIES.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Time Filter */}
          <div>
            <label style={{
              fontSize: 11,
              fontWeight: 600,
              color: C.muted,
              marginBottom: 6,
              display: 'block'
            }}>
              Time Period
            </label>
            <select
              value={selectedTimeFilter}
              onChange={(e) => setSelectedTimeFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: C.inner,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                color: C.text,
                fontSize: 11
              }}
            >
              {TIME_FILTERS.map(filter => (
                <option key={filter.id} value={filter.id}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: C.text,
          marginBottom: 16
        }}>
          {filteredTimeline.length} {filteredTimeline.length === 1 ? 'event' : 'events'}
        </div>

        {filteredTimeline.length === 0 ? (
          <div style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: '40px',
            textAlign: 'center',
            color: C.muted
          }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>📭</div>
            <div>No events found matching your filters</div>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            {/* Timeline line */}
            <div style={{
              position: 'absolute',
              left: 20,
              top: 0,
              bottom: 0,
              width: 2,
              background: C.border
            }} />

            {/* Timeline events */}
            {filteredTimeline.map((event, index) => (
              <div
                key={event.id}
                style={{
                  position: 'relative',
                  paddingLeft: 50,
                  marginBottom: 24
                }}
              >
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute',
                  left: 14,
                  top: 8,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: getEventTypeColor(event.type),
                  border: `2px solid ${C.card}`,
                  zIndex: 1
                }} />

                {/* Event card */}
                <TimelineEventCard
                  event={event}
                  isExpanded={expandedEvents.has(event.id)}
                  onToggleExpand={() => toggleEventExpanded(event.id)}
                  onAIExplain={() => openAIForEvent(event)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Assistant Panel */}
      <AIAssistantPanel
        isOpen={aiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
        initialContext={{
          studentName: student?.name,
          studentId: studentId,
          timeline: filteredTimeline,
          contextType: 'timeline_analysis'
        }}
      />
    </div>
  )
}
