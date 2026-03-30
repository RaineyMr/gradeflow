// src/components/support/SharedTaskCard.jsx
import React, { useState, useEffect } from 'react'
import { useStore } from '../../lib/store'

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

const TASK_TEMPLATES = [
  {
    id: 'followup',
    title: 'Student Follow-up',
    description: 'Follow up with student about recent progress/concerns',
    priority: 'medium',
    dueInDays: 3
  },
  {
    id: 'meeting',
    title: 'Parent Meeting',
    description: 'Schedule and conduct parent meeting regarding student progress',
    priority: 'high',
    dueInDays: 7
  },
  {
    id: 'review',
    title: 'Intervention Review',
    description: 'Review and update intervention plan effectiveness',
    priority: 'medium',
    dueInDays: 14
  },
  {
    id: 'documentation',
    title: 'Documentation',
    description: 'Complete required documentation for student records',
    priority: 'low',
    dueInDays: 5
  },
  {
    id: 'assessment',
    title: 'Student Assessment',
    description: 'Conduct assessment and analyze results',
    priority: 'high',
    dueInDays: 10
  }
]

export default function SharedTaskCard({ 
  mode = 'view', 
  task = null, 
  onClose, 
  onSave,
  onUpdate 
}) {
  const {
    createSharedTask,
    updateSharedTask,
    getStudentsForSupportStaff,
    getSupportStaffGroups,
    getTeachersForSupportStaff,
    getAdminForSupportStaff,
    currentUser
  } = useStore()

  const [taskData, setTaskData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assignedTo: task?.assignedTo || '',
    createdBy: task?.createdBy || currentUser?.name || '',
    dueDate: task?.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: task?.priority || 'medium',
    status: task?.status || 'pending',
    studentId: task?.studentId || null,
    groupId: task?.groupId || null,
    tags: task?.tags || [],
    comments: task?.comments || [],
    attachments: task?.attachments || []
  })
  const [loading, setLoading] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [newComment, setNewComment] = useState('')

  const students = getStudentsForSupportStaff()
  const groups = getSupportStaffGroups()
  const staffMembers = [...getTeachersForSupportStaff(), ...getAdminForSupportStaff()]

  useEffect(() => {
    if (task) {
      setTaskData(task)
    }
  }, [task])

  function handleSave() {
    if (!taskData.title.trim() || !taskData.description.trim()) {
      alert('Please fill in both title and description')
      return
    }

    if (!taskData.assignedTo) {
      alert('Please assign this task to someone')
      return
    }

    setLoading(true)
    
    const taskPayload = {
      ...taskData,
      id: task?.id || Date.now(),
      timestamp: task?.timestamp || new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }

    if (mode === 'create' && createSharedTask) {
      createSharedTask(taskPayload)
        .then(() => {
          onSave?.(taskPayload)
        })
        .catch(error => {
          console.error('Failed to create task:', error)
          alert('Failed to create task. Please try again.')
        })
        .finally(() => {
          setLoading(false)
        })
    } else if (mode === 'edit' && updateSharedTask) {
      updateSharedTask(task?.id, taskPayload)
        .then(() => {
          onUpdate?.(taskPayload)
        })
        .catch(error => {
          console.error('Failed to update task:', error)
          alert('Failed to update task. Please try again.')
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      // Fallback for demo
      setTimeout(() => {
        if (mode === 'create') {
          onSave?.(taskPayload)
        } else {
          onUpdate?.(taskPayload)
        }
        setLoading(false)
      }, 1000)
    }
  }

  function applyTemplate(template) {
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + template.dueInDays)
    
    setTaskData(prev => ({
      ...prev,
      title: template.title,
      description: template.description,
      priority: template.priority,
      dueDate: dueDate.toISOString().split('T')[0]
    }))
    setShowTemplateSelector(false)
  }

  function addComment() {
    if (!newComment.trim()) return

    const comment = {
      id: Date.now(),
      author: currentUser?.name || 'Current User',
      timestamp: new Date().toISOString(),
      content: newComment.trim()
    }

    setTaskData(prev => ({
      ...prev,
      comments: [...prev.comments, comment]
    }))
    setNewComment('')
  }

  function updateStatus(newStatus) {
    setTaskData(prev => ({ ...prev, status: newStatus }))
  }

  function addAttachment() {
    const attachment = {
      id: Date.now(),
      name: `Document_${taskData.attachments.length + 1}.pdf`,
      type: 'pdf',
      size: '2.3 MB'
    }
    setTaskData(prev => ({
      ...prev,
      attachments: [...prev.attachments, attachment]
    }))
  }

  function removeAttachment(attachmentId) {
    setTaskData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(a => a.id !== attachmentId)
    }))
  }

  function getPriorityColor(priority) {
    switch (priority) {
      case 'high': return C.red
      case 'medium': return C.amber
      case 'low': return C.green
      default: return C.muted
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'completed': return C.green
      case 'in_progress': return C.blue
      case 'pending': return C.amber
      case 'overdue': return C.red
      default: return C.muted
    }
  }

  // View mode
  if (mode === 'view' && task) {
    return (
      <div style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: '16px',
        marginBottom: 12
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12
        }}>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: 14,
              fontWeight: 600,
              color: C.text,
              margin: 0,
              marginBottom: 4
            }}>
              {task.title}
            </h3>
            <div style={{
              fontSize: 11,
              color: C.muted,
              marginBottom: 8
            }}>
              Created by {task.createdBy} • {new Date(task.timestamp).toLocaleDateString()}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{
              padding: '4px 8px',
              background: `${getPriorityColor(task.priority)}20`,
              borderRadius: 4,
              fontSize: 10,
              color: getPriorityColor(task.priority),
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              {task.priority}
            </div>
            <div style={{
              padding: '4px 8px',
              background: `${getStatusColor(task.status)}20`,
              borderRadius: 4,
              fontSize: 10,
              color: getStatusColor(task.status),
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              {task.status.replace('_', ' ')}
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
          {task.description}
        </div>

        {/* Task Details */}
        <div style={{
          background: C.inner,
          padding: '12px',
          borderRadius: 8,
          fontSize: 11,
          color: C.soft,
          marginBottom: 12
        }}>
          <div style={{ marginBottom: 4 }}>
            Assigned to: <span style={{ color: C.text }}>{task.assignedTo}</span>
          </div>
          <div style={{ marginBottom: 4 }}>
            Due date: <span style={{ color: C.text }}>{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
          {task.studentId && (
            <div style={{ marginBottom: 4 }}>
              Student: <span style={{ color: C.text }}>
                {students.find(s => s.id === task.studentId)?.name || 'Unknown Student'}
              </span>
            </div>
          )}
          {task.groupId && (
            <div style={{ marginBottom: 4 }}>
              Group: <span style={{ color: C.text }}>
                {groups.find(g => g.id === task.groupId)?.name || 'Unknown Group'}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {task.status === 'pending' && (
            <button
              onClick={() => updateStatus('in_progress')}
              style={{
                padding: '6px 12px',
                background: C.blue,
                border: 'none',
                borderRadius: 6,
                fontSize: 10,
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              🚀 Start Task
            </button>
          )}
          {task.status === 'in_progress' && (
            <button
              onClick={() => updateStatus('completed')}
              style={{
                padding: '6px 12px',
                background: C.green,
                border: 'none',
                borderRadius: 6,
                fontSize: 10,
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              ✅ Complete
            </button>
          )}
          <button
            onClick={() => {}} // Would open edit mode
            style={{
              padding: '6px 12px',
              background: C.inner,
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              fontSize: 10,
              color: C.soft,
              cursor: 'pointer'
            }}
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => {}} // Would open comment modal
            style={{
              padding: '6px 12px',
              background: C.inner,
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              fontSize: 10,
              color: C.soft,
              cursor: 'pointer'
            }}
          >
            💬 Comment ({task.comments?.length || 0})
          </button>
        </div>
      </div>
    )
  }

  // Create/Edit mode
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 20
    }}>
      <div style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        width: '100%',
        maxWidth: 600,
        maxHeight: '90vh',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${C.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{
              fontSize: 18,
              fontWeight: 700,
              color: C.text,
              margin: 0,
              marginBottom: 4
            }}>
              {mode === 'create' ? 'Create Shared Task' : 'Edit Task'}
            </h2>
            <p style={{
              fontSize: 12,
              color: C.muted,
              margin: 0
            }}>
              Assign tasks to team members
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: C.soft,
              fontSize: 20,
              cursor: 'pointer',
              padding: 4,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', flex: 1, overflow: 'auto' }}>
          {/* Title */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              fontSize: 12,
              fontWeight: 600,
              color: C.text,
              marginBottom: 6,
              display: 'block'
            }}>
              Title *
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={taskData.title}
                onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: C.inner,
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  color: C.text,
                  fontSize: 12,
                  outline: 'none'
                }}
              />
              <button
                onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                style={{
                  padding: '8px 12px',
                  background: C.inner,
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  fontSize: 10,
                  color: C.soft,
                  cursor: 'pointer'
                }}
              >
                📋
              </button>
            </div>
          </div>

          {/* Template Selector */}
          {showTemplateSelector && (
            <div style={{
              background: C.inner,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: 12,
              marginBottom: 16
            }}>
              <div style={{
                fontSize: 11,
                fontWeight: 600,
                color: C.text,
                marginBottom: 8
              }}>
                Task Templates:
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                {TASK_TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    style={{
                      padding: '6px 10px',
                      background: C.card,
                      border: `1px solid ${C.border}`,
                      borderRadius: 4,
                      color: C.soft,
                      fontSize: 10,
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{template.title}</div>
                    <div style={{ fontSize: 9, opacity: 0.8 }}>{template.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              fontSize: 12,
              fontWeight: 600,
              color: C.text,
              marginBottom: 6,
              display: 'block'
            }}>
              Description *
            </label>
            <textarea
              value={taskData.description}
              onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter task description..."
              rows={4}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: C.inner,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                color: C.text,
                fontSize: 12,
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Assignment and Priority */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{
                fontSize: 12,
                fontWeight: 600,
                color: C.text,
                marginBottom: 6,
                display: 'block'
              }}>
                Assigned To *
              </label>
              <select
                value={taskData.assignedTo}
                onChange={(e) => setTaskData(prev => ({ ...prev, assignedTo: e.target.value }))}
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
                <option value="">Select staff member</option>
                {staffMembers.map(staff => (
                  <option key={staff.id} value={staff.name}>
                    {staff.name} - {staff.subject || staff.label || staff.role}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{
                fontSize: 12,
                fontWeight: 600,
                color: C.text,
                marginBottom: 6,
                display: 'block'
              }}>
                Priority
              </label>
              <select
                value={taskData.priority}
                onChange={(e) => setTaskData(prev => ({ ...prev, priority: e.target.value }))}
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
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Due Date and Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{
                fontSize: 12,
                fontWeight: 600,
                color: C.text,
                marginBottom: 6,
                display: 'block'
              }}>
                Due Date *
              </label>
              <input
                type="date"
                value={taskData.dueDate}
                onChange={(e) => setTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: C.inner,
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  color: C.text,
                  fontSize: 11
                }}
              />
            </div>
            <div>
              <label style={{
                fontSize: 12,
                fontWeight: 600,
                color: C.text,
                marginBottom: 6,
                display: 'block'
              }}>
                Status
              </label>
              <select
                value={taskData.status}
                onChange={(e) => setTaskData(prev => ({ ...prev, status: e.target.value }))}
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
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          {/* Student/Group Assignment */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              fontSize: 12,
              fontWeight: 600,
              color: C.text,
              marginBottom: 6,
              display: 'block'
            }}>
              Related To (Optional)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <select
                value={taskData.studentId || ''}
                onChange={(e) => setTaskData(prev => ({ 
                  ...prev, 
                  studentId: e.target.value ? parseInt(e.target.value) : null,
                  groupId: null
                }))}
                style={{
                  padding: '8px 12px',
                  background: C.inner,
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  color: C.text,
                  fontSize: 11
                }}
              >
                <option value="">Select Student</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
              <select
                value={taskData.groupId || ''}
                onChange={(e) => setTaskData(prev => ({ 
                  ...prev, 
                  groupId: e.target.value ? parseInt(e.target.value) : null,
                  studentId: null
                }))}
                style={{
                  padding: '8px 12px',
                  background: C.inner,
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  color: C.text,
                  fontSize: 11
                }}
              >
                <option value="">Select Group</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Comments */}
          {mode === 'edit' && taskData.comments.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <label style={{
                fontSize: 12,
                fontWeight: 600,
                color: C.text,
                marginBottom: 8,
                display: 'block'
              }}>
                Comments
              </label>
              <div style={{ maxHeight: 120, overflow: 'auto' }}>
                {taskData.comments.map(comment => (
                  <div
                    key={comment.id}
                    style={{
                      background: C.inner,
                      padding: '8px 12px',
                      borderRadius: 6,
                      marginBottom: 6
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 4
                    }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: C.text }}>
                        {comment.author}
                      </span>
                      <span style={{ fontSize: 9, color: C.muted }}>
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: C.soft }}>
                      {comment.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: `1px solid ${C.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: C.inner,
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              color: C.soft,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !taskData.title.trim() || !taskData.description.trim() || !taskData.assignedTo}
            style={{
              padding: '10px 20px',
              background: loading || !taskData.title.trim() || !taskData.description.trim() || !taskData.assignedTo ? C.inner : C.blue,
              border: 'none',
              borderRadius: 6,
              color: loading || !taskData.title.trim() || !taskData.description.trim() || !taskData.assignedTo ? C.muted : '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: loading || !taskData.title.trim() || !taskData.description.trim() || !taskData.assignedTo ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: 12,
                  height: 12,
                  border: '2px solid transparent',
                  borderTop: '2px solid #fff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Saving...
              </>
            ) : (
              <>
                {mode === 'create' ? '✅ Create Task' : '💾 Update Task'}
              </>
            )}
          </button>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}
