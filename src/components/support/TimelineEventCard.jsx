// src/components/support/TimelineEventCard.jsx
import React, { useState } from 'react'

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
  purple: '#9b6ef4',
}

export default function TimelineEventCard({ event, isExpanded, onToggleExpand, onAIExplain }) {
  const [showDetails, setShowDetails] = useState(false)

  function getEventTypeIcon(type) {
    switch (type) {
      case 'support_logs': return '📝'
      case 'interventions': return '🎯'
      case 'parent_messages': return '💬'
      case 'attendance': return '📅'
      case 'grades': return '📊'
      case 'group_activity': return '👥'
      case 'ai_insights': return '🤖'
      case 'automation_tasks': return '⚡'
      case 'shared_notes': return '🗒️'
      case 'shared_tasks': return '✅'
      default: return '📋'
    }
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

  function renderEventDetails() {
    if (!event.details) return null

    const details = event.details

    switch (event.type) {
      case 'support_logs':
        return (
          <div style={{ fontSize: 11, color: C.soft, lineHeight: 1.5 }}>
            {details.duration && (
              <div style={{ marginBottom: 4 }}>
                <strong>Duration:</strong> {details.duration}
              </div>
            )}
            {details.topics && (
              <div style={{ marginBottom: 4 }}>
                <strong>Topics:</strong> {details.topics.join(', ')}
              </div>
            )}
            {details.nextSteps && (
              <div style={{ marginBottom: 4 }}>
                <strong>Next Steps:</strong> {details.nextSteps}
              </div>
            )}
            {details.observations && (
              <div style={{ marginBottom: 4 }}>
                <strong>Observations:</strong> {details.observations}
              </div>
            )}
          </div>
        )

      case 'interventions':
        return (
          <div style={{ fontSize: 11, color: C.soft, lineHeight: 1.5 }}>
            {details.planType && (
              <div style={{ marginBottom: 4 }}>
                <strong>Plan Type:</strong> {details.planType}
              </div>
            )}
            {details.duration && (
              <div style={{ marginBottom: 4 }}>
                <strong>Duration:</strong> {details.duration}
              </div>
            )}
            {details.goals && (
              <div style={{ marginBottom: 4 }}>
                <strong>Goals:</strong> {details.goals.join(', ')}
              </div>
            )}
            {details.status && (
              <div style={{ marginBottom: 4 }}>
                <strong>Status:</strong> <span style={{ color: details.status === 'active' ? C.green : C.muted }}>{details.status}</span>
              </div>
            )}
          </div>
        )

      case 'parent_messages':
        return (
          <div style={{ fontSize: 11, color: C.soft, lineHeight: 1.5 }}>
            {details.communicationType && (
              <div style={{ marginBottom: 4 }}>
                <strong>Type:</strong> {details.communicationType}
              </div>
            )}
            {details.duration && (
              <div style={{ marginBottom: 4 }}>
                <strong>Duration:</strong> {details.duration}
              </div>
            )}
            {details.outcome && (
              <div style={{ marginBottom: 4 }}>
                <strong>Outcome:</strong> {details.outcome}
              </div>
            )}
            {details.followUp && (
              <div style={{ marginBottom: 4 }}>
                <strong>Follow-up:</strong> {details.followUp}
              </div>
            )}
          </div>
        )

      case 'attendance':
        return (
          <div style={{ fontSize: 11, color: C.soft, lineHeight: 1.5 }}>
            {details.date && (
              <div style={{ marginBottom: 4 }}>
                <strong>Date:</strong> {details.date}
              </div>
            )}
            {details.status && (
              <div style={{ marginBottom: 4 }}>
                <strong>Status:</strong> <span style={{ 
                  color: details.status === 'Present' ? C.green : 
                         details.status === 'Tardy' ? C.amber : C.red 
                }}>{details.status}</span>
              </div>
            )}
            {details.minutesLate && (
              <div style={{ marginBottom: 4 }}>
                <strong>Minutes Late:</strong> {details.minutesLate}
              </div>
            )}
            {details.notes && (
              <div style={{ marginBottom: 4 }}>
                <strong>Notes:</strong> {details.notes}
              </div>
            )}
          </div>
        )

      case 'grades':
        return (
          <div style={{ fontSize: 11, color: C.soft, lineHeight: 1.5 }}>
            {details.assignment && (
              <div style={{ marginBottom: 4 }}>
                <strong>Assignment:</strong> {details.assignment}
              </div>
            )}
            {details.score !== undefined && (
              <div style={{ marginBottom: 4 }}>
                <strong>Score:</strong> <span style={{ 
                  color: details.score >= 90 ? C.green : 
                         details.score >= 80 ? C.blue : 
                         details.score >= 70 ? C.amber : C.red 
                }}>{details.score}%</span>
              </div>
            )}
            {details.previousScore && (
              <div style={{ marginBottom: 4 }}>
                <strong>Previous Score:</strong> {details.previousScore}%
              </div>
            )}
            {details.improvement && (
              <div style={{ marginBottom: 4 }}>
                <strong>Improvement:</strong> <span style={{ color: C.green }}>{details.improvement}</span>
              </div>
            )}
            {details.notes && (
              <div style={{ marginBottom: 4 }}>
                <strong>Notes:</strong> {details.notes}
              </div>
            )}
          </div>
        )

      case 'group_activity':
        return (
          <div style={{ fontSize: 11, color: C.soft, lineHeight: 1.5 }}>
            {details.groupName && (
              <div style={{ marginBottom: 4 }}>
                <strong>Group:</strong> {details.groupName}
              </div>
            )}
            {details.activity && (
              <div style={{ marginBottom: 4 }}>
                <strong>Activity:</strong> {details.activity}
              </div>
            )}
            {details.role && (
              <div style={{ marginBottom: 4 }}>
                <strong>Role:</strong> {details.role}
              </div>
            )}
            {details.duration && (
              <div style={{ marginBottom: 4 }}>
                <strong>Duration:</strong> {details.duration}
              </div>
            )}
          </div>
        )

      case 'ai_insights':
        return (
          <div style={{ fontSize: 11, color: C.soft, lineHeight: 1.5 }}>
            {details.analysisType && (
              <div style={{ marginBottom: 4 }}>
                <strong>Analysis Type:</strong> {details.analysisType}
              </div>
            )}
            {details.confidenceScore && (
              <div style={{ marginBottom: 4 }}>
                <strong>Confidence:</strong> {details.confidenceScore}%
              </div>
            )}
            {details.keyInsights && (
              <div style={{ marginBottom: 4 }}>
                <strong>Key Insights:</strong>
                <ul style={{ margin: '4px 0 4px 16px', padding: 0 }}>
                  {details.keyInsights.map((insight, i) => (
                    <li key={i}>{insight}</li>
                  ))}
                </ul>
              </div>
            )}
            {details.recommendations && (
              <div style={{ marginBottom: 4 }}>
                <strong>Recommendations:</strong>
                <ul style={{ margin: '4px 0 4px 16px', padding: 0 }}>
                  {details.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )

      case 'automation_tasks':
        return (
          <div style={{ fontSize: 11, color: C.soft, lineHeight: 1.5 }}>
            {details.reportType && (
              <div style={{ marginBottom: 4 }}>
                <strong>Report Type:</strong> {details.reportType}
              </div>
            )}
            {details.recipients && (
              <div style={{ marginBottom: 4 }}>
                <strong>Recipients:</strong> {details.recipients.join(', ')}
              </div>
            )}
            {details.highlights && (
              <div style={{ marginBottom: 4 }}>
                <strong>Highlights:</strong>
                <ul style={{ margin: '4px 0 4px 16px', padding: 0 }}>
                  {details.highlights.map((highlight, i) => (
                    <li key={i}>{highlight}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )

      case 'shared_notes':
        return (
          <div style={{ fontSize: 11, color: C.soft, lineHeight: 1.5 }}>
            {details.visibility && (
              <div style={{ marginBottom: 4 }}>
                <strong>Visibility:</strong> {details.visibility}
              </div>
            )}
            {details.priority && (
              <div style={{ marginBottom: 4 }}>
                <strong>Priority:</strong> <span style={{
                  color: details.priority === 'high' ? C.red : 
                         details.priority === 'medium' ? C.amber : C.green
                }}>{details.priority}</span>
              </div>
            )}
            {details.tags && (
              <div style={{ marginBottom: 4 }}>
                <strong>Tags:</strong> {details.tags.join(', ')}
              </div>
            )}
            {details.attachments && details.attachments.length > 0 && (
              <div style={{ marginBottom: 4 }}>
                <strong>Attachments:</strong> {details.attachments.length} file(s)
              </div>
            )}
          </div>
        )

      case 'shared_tasks':
        return (
          <div style={{ fontSize: 11, color: C.soft, lineHeight: 1.5 }}>
            {details.assignedTo && (
              <div style={{ marginBottom: 4 }}>
                <strong>Assigned To:</strong> {details.assignedTo}
              </div>
            )}
            {details.dueDate && (
              <div style={{ marginBottom: 4 }}>
                <strong>Due Date:</strong> {new Date(details.dueDate).toLocaleDateString()}
              </div>
            )}
            {details.priority && (
              <div style={{ marginBottom: 4 }}>
                <strong>Priority:</strong> <span style={{
                  color: details.priority === 'high' ? C.red : 
                         details.priority === 'medium' ? C.amber : C.green
                }}>{details.priority}</span>
              </div>
            )}
            {details.status && (
              <div style={{ marginBottom: 4 }}>
                <strong>Status:</strong> <span style={{
                  color: details.status === 'completed' ? C.green : 
                         details.status === 'in_progress' ? C.blue : C.amber
                }}>{details.status.replace('_', ' ')}</span>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div style={{ fontSize: 11, color: C.soft, lineHeight: 1.5 }}>
            {Object.entries(details).map(([key, value]) => (
              <div key={key} style={{ marginBottom: 4 }}>
                <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {Array.isArray(value) ? value.join(', ') : value}
              </div>
            ))}
          </div>
        )
    }
  }

  const eventTypeColor = getEventTypeColor(event.type)
  const eventIcon = getEventTypeIcon(event.type)

  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: '16px',
        transition: 'all 0.2s',
        cursor: 'pointer'
      }}
      onClick={() => onToggleExpand?.(event.id)}
      onMouseEnter={(e) => {
        e.target.style.borderColor = eventTypeColor
        e.target.style.boxShadow = `0 0 0 1px ${eventTypeColor}22`
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: `${eventTypeColor}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14
          }}>
            {eventIcon}
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{
              fontSize: 13,
              fontWeight: 600,
              color: C.text,
              margin: 0,
              marginBottom: 4
            }}>
              {event.title}
            </h4>
            <div style={{
              fontSize: 11,
              color: C.muted,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span>{event.author}</span>
              <span>•</span>
              <span>{formatTimestamp(event.timestamp)}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAIExplain?.(event)
            }}
            style={{
              padding: '4px 6px',
              background: C.inner,
              border: `1px solid ${C.border}`,
              borderRadius: 4,
              color: C.soft,
              fontSize: 10,
              cursor: 'pointer'
            }}
            title="AI Explain"
          >
            🤖
          </button>
          <div style={{
            padding: '4px 8px',
            background: `${eventTypeColor}20`,
            borderRadius: 4,
            fontSize: 9,
            color: eventTypeColor,
            fontWeight: 600,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap'
          }}>
            {event.type.replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* Description */}
      <div style={{
        fontSize: 12,
        color: C.soft,
        lineHeight: 1.5,
        marginBottom: 12
      }}>
        {event.description}
      </div>

      {/* Expandable Details */}
      {isExpanded && event.details && (
        <div style={{
          background: C.inner,
          padding: '12px',
          borderRadius: 8,
          marginTop: 12
        }}>
          {renderEventDetails()}
        </div>
      )}

      {/* Expand/Collapse Indicator */}
      <div style={{
        textAlign: 'center',
        marginTop: 8,
        fontSize: 10,
        color: C.muted
      }}>
        {isExpanded ? '▲ Click to collapse' : '▼ Click to expand'}
      </div>
    </div>
  )
}
