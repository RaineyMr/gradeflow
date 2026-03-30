import React, { useState } from 'react'
import { Calendar, User, CheckCircle, Clock, AlertCircle, Trash2, Edit2, Save, X } from 'lucide-react'

const C = {
  card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: C.amber, icon: Clock },
  { value: 'in_progress', label: 'In Progress', color: C.blue, icon: AlertCircle },
  { value: 'completed', label: 'Completed', color: C.green, icon: CheckCircle }
]

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: C.muted },
  { value: 'medium', label: 'Medium', color: C.amber },
  { value: 'high', label: 'High', color: C.red }
]

export default function CaseActionItem({ item, onUpdate, onDelete, isMobile }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    description: item.description || '',
    assignedTo: item.assignedTo || '',
    dueDate: item.dueDate || '',
    status: item.status || 'pending',
    priority: item.priority || 'medium',
    comments: item.comments || ''
  })

  const handleSave = () => {
    onUpdate(editData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData({
      description: item.description || '',
      assignedTo: item.assignedTo || '',
      dueDate: item.dueDate || '',
      status: item.status || 'pending',
      priority: item.priority || 'medium',
      comments: item.comments || ''
    })
    setIsEditing(false)
  }

  const getStatusInfo = (status) => {
    return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0]
  }

  const getPriorityInfo = (priority) => {
    return PRIORITY_OPTIONS.find(p => p.value === priority) || PRIORITY_OPTIONS[1]
  }

  const StatusIcon = getStatusInfo(item.status).icon

  if (isEditing) {
    return (
      <div style={{
        background: C.card,
        border: `2px solid ${C.blue}`,
        borderRadius: 12,
        padding: isMobile ? 16 : 20
      }}>
        {/* Edit Form */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <h4 style={{ color:C.text, margin:0 }}>Edit Action Item</h4>
          <div style={{ display:'flex', gap:8 }}>
            <button
              onClick={handleSave}
              style={{
                background:C.green, color:'#fff', border:'none', borderRadius:6,
                padding:'6px 12px', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:6
              }}
            >
              <Save size={14} />
              Save
            </button>
            <button
              onClick={handleCancel}
              style={{
                background:C.muted, color:'#fff', border:'none', borderRadius:6,
                padding:'6px 12px', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:6
              }}
            >
              <X size={14} />
              Cancel
            </button>
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div>
            <label style={{ color:C.soft, fontSize:12, marginBottom:4, display:'block' }}>Description</label>
            <textarea
              value={editData.description}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the action item..."
              style={{
                width:'100%', minHeight:60,
                background:C.inner, border:`1px solid ${C.border}`, borderRadius:6,
                padding:8, color:C.text, fontSize:14, resize:'vertical'
              }}
            />
          </div>

          <div style={{ 
            display:'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', 
            gap:12 
          }}>
            <div>
              <label style={{ color:C.soft, fontSize:12, marginBottom:4, display:'block' }}>Assigned To</label>
              <input
                type="text"
                value={editData.assignedTo}
                onChange={(e) => setEditData(prev => ({ ...prev, assignedTo: e.target.value }))}
                placeholder="Name or role"
                style={{
                  width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:6,
                  padding:8, color:C.text, fontSize:14
                }}
              />
            </div>

            <div>
              <label style={{ color:C.soft, fontSize:12, marginBottom:4, display:'block' }}>Due Date</label>
              <input
                type="date"
                value={editData.dueDate}
                onChange={(e) => setEditData(prev => ({ ...prev, dueDate: e.target.value }))}
                style={{
                  width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:6,
                  padding:8, color:C.text, fontSize:14
                }}
              />
            </div>
          </div>

          <div style={{ 
            display:'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', 
            gap:12 
          }}>
            <div>
              <label style={{ color:C.soft, fontSize:12, marginBottom:4, display:'block' }}>Status</label>
              <select
                value={editData.status}
                onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
                style={{
                  width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:6,
                  padding:8, color:C.text, fontSize:14
                }}
              >
                {STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ color:C.soft, fontSize:12, marginBottom:4, display:'block' }}>Priority</label>
              <select
                value={editData.priority}
                onChange={(e) => setEditData(prev => ({ ...prev, priority: e.target.value }))}
                style={{
                  width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:6,
                  padding:8, color:C.text, fontSize:14
                }}
              >
                {PRIORITY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ color:C.soft, fontSize:12, marginBottom:4, display:'block' }}>Comments</label>
            <textarea
              value={editData.comments}
              onChange={(e) => setEditData(prev => ({ ...prev, comments: e.target.value }))}
              placeholder="Additional notes or comments..."
              style={{
                width:'100%', minHeight:40,
                background:C.inner, border:`1px solid ${C.border}`, borderRadius:6,
                padding:8, color:C.text, fontSize:14, resize:'vertical'
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(item.status)
  const priorityInfo = getPriorityInfo(item.priority)

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: isMobile ? 16 : 20,
      transition: 'all 0.2s'
    }}>
      {/* Header */}
      <div style={{ 
        display:'flex', 
        justifyContent:'space-between', 
        alignItems:'flex-start',
        marginBottom:12 
      }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ 
            display:'flex', 
            alignItems:'center', 
            gap:8, 
            marginBottom:8 
          }}>
            <StatusIcon size={16} color={statusInfo.color} />
            <span style={{
              background: statusInfo.color + '20',
              color: statusInfo.color,
              fontSize: isMobile ? 10 : 11,
              padding: '2px 6px',
              borderRadius:4,
              fontWeight:600
            }}>
              {statusInfo.label}
            </span>
            <span style={{
              background: priorityInfo.color + '20',
              color: priorityInfo.color,
              fontSize: isMobile ? 10 : 11,
              padding: '2px 6px',
              borderRadius:4,
              fontWeight:600
            }}>
              {priorityInfo.label} Priority
            </span>
          </div>
          
          <h4 style={{
            color: C.text,
            fontSize: isMobile ? 14 : 16,
            fontWeight: 600,
            margin: 0,
            lineHeight: 1.4
          }}>
            {item.description || 'No description provided'}
          </h4>
        </div>

        <div style={{ display:'flex', gap:8 }}>
          <button
            onClick={() => setIsEditing(true)}
            style={{
              background: C.inner,
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              padding: 8,
              color: C.soft,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Edit Action Item"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={onDelete}
            style={{
              background: C.red + '20',
              border: `1px solid ${C.red}40`,
              borderRadius: 6,
              padding: 8,
              color: C.red,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Delete Action Item"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Details */}
      <div style={{ 
        display:'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', 
        gap:12, 
        marginBottom:12 
      }}>
        {item.assignedTo && (
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <User size={14} color={C.muted} />
            <div>
              <div style={{ color:C.muted, fontSize:10 }}>Assigned To</div>
              <div style={{ color:C.soft, fontSize:12 }}>{item.assignedTo}</div>
            </div>
          </div>
        )}

        {item.dueDate && (
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Calendar size={14} color={C.muted} />
            <div>
              <div style={{ color:C.muted, fontSize:10 }}>Due Date</div>
              <div style={{ color:C.soft, fontSize:12 }}>
                {new Date(item.dueDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comments */}
      {item.comments && (
        <div style={{
          background: C.inner,
          borderRadius: 6,
          padding: 12
        }}>
          <div style={{ color:C.muted, fontSize:10, marginBottom:4 }}>Comments</div>
          <p style={{
            color: C.soft,
            fontSize: 12,
            lineHeight: 1.4,
            margin: 0
          }}>
            {item.comments}
          </p>
        </div>
      )}

      {/* Overdue Indicator */}
      {item.status !== 'completed' && item.dueDate && new Date(item.dueDate) < new Date() && (
        <div style={{
          background: C.red + '20',
          border: `1px solid ${C.red}40`,
          borderRadius: 6,
          padding: 8,
          marginTop: 8,
          display: 'flex',
          alignItems: 'center',
          gap:8
        }}>
          <AlertCircle size={14} color={C.red} />
          <span style={{ color:C.red, fontSize:12, fontWeight:600 }}>
            Overdue by {Math.ceil((new Date() - new Date(item.dueDate)) / (1000 * 60 * 60 * 24))} days
          </span>
        </div>
      )}
    </div>
  )
}
