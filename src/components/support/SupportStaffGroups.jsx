// src/components/support/SupportStaffGroups.jsx
import React, { useState, useEffect } from 'react'
import { useStore } from '../../lib/store'
import SupportGroupEditor from './SupportGroupEditor'
import AIAssistantPanel from './AIAssistantPanel'
import { useNavigate } from 'react-router-dom'

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

export default function SupportStaffGroups({ onBack }) {
  const [showAI, setShowAI] = useState(false)
  const navigate = useNavigate()
  const {
    getSupportStaffGroups,
    loadSupportStaffGroups,
    deleteSupportStaffGroup,
    getGroupStudents,
    currentUser
  } = useStore()

  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)

  useEffect(() => {
    async function loadGroups() {
      setLoading(true)
      try {
        const loadedGroups = await loadSupportStaffGroups()
        setGroups(loadedGroups || [])
      } catch (error) {
        console.error('Failed to load groups:', error)
      } finally {
        setLoading(false)
      }
    }

    loadGroups()
  }, [])

  async function handleDeleteGroup(groupId) {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return
    }

    try {
      await deleteSupportStaffGroup(groupId)
      setGroups(groups.filter(g => g.id !== groupId))
    } catch (error) {
      console.error('Failed to delete group:', error)
      alert('Failed to delete group. Please try again.')
    }
  }

  function handleEditGroup(group) {
    setEditingGroup(group)
    setShowEditor(true)
  }

  function handleCreateGroup() {
    setEditingGroup(null)
    setShowEditor(true)
  }

  function handleEditorClose() {
    setShowEditor(false)
    setEditingGroup(null)
    // Reload groups after editor closes
    loadSupportStaffGroups().then(setGroups)
  }

  function handleViewGroupStudents(group) {
    navigate(`/support/student/1`) // Navigate to first student for demo
  }

  if (loading) {
    return (
      <div style={{ padding:40, textAlign:'center', color:C.muted }}>
        Loading support groups...
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg }}>
      {/* Header */}
      <div style={{ 
        background:C.card, borderBottom:`1px solid ${C.border}`, 
        padding:'16px 20px', display:'flex', alignItems:'center', gap:16 
      }}>
        <button 
          onClick={onBack}
          style={{ 
            background:C.inner, border:'none', borderRadius:8, 
            width:36, height:36, color:C.soft, fontSize:18, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center'
          }}
        >
          ←
        </button>
        
        <div style={{ flex:1 }}>
          <div style={{ fontSize:18, fontWeight:700, color:C.text, marginBottom:2 }}>
            Support Groups
          </div>
          <div style={{ fontSize:12, color:C.muted }}>
            Manage custom student groups for targeted support
          </div>
        </div>

        <div style={{ display:'flex', gap:8 }}>
          <button
            onClick={() => setShowAI(true)}
            style={{
              background:C.blue, color:'#fff', border:'none', borderRadius:8,
              padding:'8px 16px', fontSize:12, fontWeight:600, cursor:'pointer',
              display:'flex', alignItems:'center', gap:6
            }}
          >
            🤖 AI
          </button>
          <button
            onClick={handleCreateGroup}
            style={{
              background:C.teal, color:'#fff', border:'none', borderRadius:8,
              padding:'8px 16px', fontSize:12, fontWeight:600, cursor:'pointer',
              display:'flex', alignItems:'center', gap:6
            }}
          >
            + Create Group
          </button>
        </div>
      </div>

      {/* Groups List */}
      <div style={{ padding:20 }}>
        {groups.length === 0 ? (
          <div style={{ 
            background:C.card, border:`1px solid ${C.border}`, borderRadius:16,
            padding:60, textAlign:'center'
          }}>
            <div style={{ fontSize:48, marginBottom:16, opacity:0.5 }}>👥</div>
            <div style={{ fontSize:16, fontWeight:600, color:C.text, marginBottom:8 }}>
              No Support Groups Yet
            </div>
            <div style={{ fontSize:12, color:C.muted, marginBottom:24 }}>
              Create your first group to organize students for targeted support interventions.
            </div>
            <button
              onClick={handleCreateGroup}
              style={{
                background:C.teal, color:'#fff', border:'none', borderRadius:8,
                padding:'12px 24px', fontSize:13, fontWeight:600, cursor:'pointer'
              }}
            >
              Create Your First Group
            </button>
          </div>
        ) : (
          <div style={{ display:'grid', gap:16 }}>
            {groups.map(group => {
              const students = getGroupStudents(group.id)
              return (
                <div key={group.id} style={{ 
                  background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20 
                }}>
                  <div style={{ 
                    display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 
                  }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:4 }}>
                        {group.name}
                      </div>
                      <div style={{ fontSize:12, color:C.muted, marginBottom:8 }}>
                        {group.description || 'No description provided'}
                      </div>
                      <div style={{ display:'flex', gap:16, fontSize:11, color:C.muted }}>
                        <span>👥 {students.length} students</span>
                        <span>📅 Created {group.created_at ? new Date(group.created_at).toLocaleDateString() : 'Recently'}</span>
                        <span>🔄 Updated {group.updated_at ? new Date(group.updated_at).toLocaleDateString() : 'Recently'}</span>
                      </div>
                    </div>
                    
                    <div style={{ display:'flex', gap:8 }}>
                      <button
                        onClick={() => handleViewGroupStudents(group)}
                        style={{
                          background:C.blue, color:'#fff', border:'none', borderRadius:6,
                          padding:'6px 12px', fontSize:11, fontWeight:600, cursor:'pointer'
                        }}
                      >
                        View Students
                      </button>
                      <button
                        onClick={() => handleEditGroup(group)}
                        style={{
                          background:C.inner, border:`1px solid ${C.border}`, borderRadius:6,
                          padding:'6px 12px', fontSize:11, fontWeight:600, color:C.text, cursor:'pointer'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        style={{
                          background:`${C.red}20`, border:`1px solid ${C.red}30`, borderRadius:6,
                          padding:'6px 12px', fontSize:11, fontWeight:600, color:C.red, cursor:'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Students Preview */}
                  {students.length > 0 && (
                    <div style={{ 
                      background:C.inner, borderRadius:12, padding:12 
                    }}>
                      <div style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:8 }}>
                        Students ({students.length})
                      </div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                        {students.slice(0, 8).map(student => (
                          <div key={student.id} style={{
                            background:C.bg, border:`1px solid ${C.border}`, borderRadius:6,
                            padding:'4px 8px', fontSize:10, color:C.text,
                            display:'flex', alignItems:'center', gap:4
                          }}>
                            <span>{student.grade < 70 ? '⚠️' : '✅'}</span>
                            {student.name}
                          </div>
                        ))}
                        {students.length > 8 && (
                          <div style={{
                            background:C.bg, border:`1px solid ${C.border}`, borderRadius:6,
                            padding:'4px 8px', fontSize:10, color:C.muted
                          }}>
                            +{students.length - 8} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Group Editor Modal */}
      {showEditor && (
        <SupportGroupEditor
          group={editingGroup}
          onClose={handleEditorClose}
        />
      )}

      {/* AI Assistant Panel */}
      <AIAssistantPanel
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        initialContext={{ 
          screen: 'groups',
          groups: groups
        }}
      />
    </div>
  )
}
