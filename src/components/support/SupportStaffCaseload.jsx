// src/components/support/SupportStaffCaseload.jsx
import React, { useState, useEffect } from 'react'
import { useStore } from '../../lib/store'
import { useNavigate } from 'react-router-dom'
import AIAssistantPanel from './AIAssistantPanel'
import SupportTaskCard from './SupportTaskCard'

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

const RISK_LEVELS = {
  critical: { label: 'Critical', color: C.red, icon: '🚨' },
  high: { label: 'High Risk', color: C.amber, icon: '⚠️' },
  moderate: { label: 'Moderate', color: C.blue, icon: '📊' },
  low: { label: 'Low Risk', color: C.green, icon: '✅' },
}

export default function SupportStaffCaseload({ onBack }) {
  const [showAI, setShowAI] = useState(false)
  const navigate = useNavigate()
  const {
    getSupportStaffCaseload,
    assignStudentToSupportStaff,
    unassignStudentFromSupportStaff,
    getStudentsForSupportStaff,
    getAutomationCaseloadAlerts,
    getAutomationRiskTasks,
    currentUser
  } = useStore()

  const [caseload, setCaseload] = useState([])
  const [unassignedStudents, setUnassignedStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all') // 'all', 'critical', 'high', 'moderate', 'low'
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [caseloadAlerts, setCaseloadAlerts] = useState([])
  const [studentsNeedingReview, setStudentsNeedingReview] = useState([])

  useEffect(() => {
    async function loadCaseload() {
      setLoading(true)
      try {
        const [caseloadData, allStudents, alertsData, reviewData] = await Promise.all([
          getSupportStaffCaseload(),
          getStudentsForSupportStaff(),
          getAutomationCaseloadAlerts(),
          getAutomationRiskTasks()
        ])

        setCaseload(caseloadData || [])
        setCaseloadAlerts(alertsData || [])
        setStudentsNeedingReview(reviewData || [])
        
        // Find unassigned students
        const assignedStudentIds = caseloadData.map(c => c.studentId)
        const unassigned = allStudents.filter(s => !assignedStudentIds.includes(s.id))
        setUnassignedStudents(unassigned)
      } catch (error) {
        console.error('Failed to load caseload:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCaseload()
  }, [])

  function getRiskLevel(student) {
    if (student.grade < 60) return 'critical'
    if (student.grade < 70) return 'high'
    if (student.flagged) return 'moderate'
    return 'low'
  }

  function getFilteredCaseload() {
    if (filterStatus === 'all') return caseload
    return caseload.filter(student => getRiskLevel(student) === filterStatus)
  }

  async function handleAssignStudent(studentId) {
    try {
      await assignStudentToSupportStaff(studentId, currentUser.id)
      
      // Update local state
      const student = unassignedStudents.find(s => s.id === studentId)
      if (student) {
        setCaseload([...caseload, student])
        setUnassignedStudents(unassignedStudents.filter(s => s.id !== studentId))
      }
    } catch (error) {
      console.error('Failed to assign student:', error)
      alert('Failed to assign student. Please try again.')
    }
  }

  async function handleUnassignStudent(studentId) {
    if (!confirm('Are you sure you want to unassign this student from your caseload?')) {
      return
    }

    try {
      await unassignStudentFromSupportStaff(studentId, currentUser.id)
      
      // Update local state
      const student = caseload.find(s => s.id === studentId)
      if (student) {
        setUnassignedStudents([...unassignedStudents, student])
        setCaseload(caseload.filter(s => s.id !== studentId))
      }
    } catch (error) {
      console.error('Failed to unassign student:', error)
      alert('Failed to unassign student. Please try again.')
    }
  }

  function handleMessageStudent(student) {
    console.log('Message Student - functionality coming soon')
  }

  function handleViewStudent(student) {
    console.log('View Student - functionality coming soon')
  }

  function handleTaskAction(taskId, action) {
    console.log(`Task ${taskId} action: ${action}`)
    if (action === 'complete' || action === 'dismiss') {
      setCaseloadAlerts(prev => prev.filter(task => task.id !== taskId))
      setStudentsNeedingReview(prev => prev.filter(task => task.id !== taskId))
    } else if (action === 'snooze') {
      // Move task to end of list
      setCaseloadAlerts(prev => {
        const task = prev.find(t => t.id === taskId)
        const others = prev.filter(t => t.id !== taskId)
        return task ? [...others, task] : prev
      })
      setStudentsNeedingReview(prev => {
        const task = prev.find(t => t.id === taskId)
        const others = prev.filter(t => t.id !== taskId)
        return task ? [...others, task] : prev
      })
    } else if (action === 'view-students') {
      setFilterStatus('all')
    }
  }

  const filteredCaseload = getFilteredCaseload()
  const riskStats = {
    all: caseload.length,
    critical: caseload.filter(s => getRiskLevel(s) === 'critical').length,
    high: caseload.filter(s => getRiskLevel(s) === 'high').length,
    moderate: caseload.filter(s => getRiskLevel(s) === 'moderate').length,
    low: caseload.filter(s => getRiskLevel(s) === 'low').length,
  }

  if (loading) {
    return <div style={{ padding:40, textAlign:'center', color:C.muted }}>Loading caseload...</div>
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
            My Caseload
          </div>
          <div style={{ fontSize:12, color:C.muted }}>
            Manage assigned students and track their progress
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
            onClick={() => setShowAssignModal(true)}
            style={{
              background:C.teal, color:'#fff', border:'none', borderRadius:8,
              padding:'8px 16px', fontSize:12, fontWeight:600, cursor:'pointer',
              display:'flex', alignItems:'center', gap:6
            }}
          >
            + Assign Student
          </button>
        </div>
      </div>

      {/* AI Assistant Panel */}
      <AIAssistantPanel
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        initialContext={{ 
          screen: 'caseload',
          caseload: caseload
        }}
      />

      {/* Stats Overview */}
      <div style={{ padding:20, paddingBottom:0 }}>
        <div style={{ 
          background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:16 
        }}>
          <div style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:12 }}>Caseload Overview</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(120px, 1fr))', gap:12 }}>
            {Object.entries(riskStats).map(([level, count]) => {
              if (level === 'all') return null
              const config = RISK_LEVELS[level]
              const isActive = filterStatus === level
              return (
                <button
                  key={level}
                  onClick={() => setFilterStatus(isActive ? 'all' : level)}
                  style={{
                    background: isActive ? `${config.color}15` : C.inner,
                    border: `1px solid ${isActive ? config.color : C.border}`,
                    borderRadius:8, padding:'12px', cursor:'pointer', textAlign:'center'
                  }}
                >
                  <div style={{ fontSize:16, marginBottom:4 }}>{config.icon}</div>
                  <div style={{ fontSize:14, fontWeight:700, color: config.color }}>{count}</div>
                  <div style={{ fontSize:10, color:C.muted }}>{config.label}</div>
                </button>
              )
            })}
            <button
              onClick={() => setFilterStatus('all')}
              style={{
                background: filterStatus === 'all' ? `${C.teal}15` : C.inner,
                border: `1px solid ${filterStatus === 'all' ? C.teal : C.border}`,
                borderRadius:8, padding:'12px', cursor:'pointer', textAlign:'center'
              }}
            >
              <div style={{ fontSize:16, marginBottom:4 }}>📋</div>
              <div style={{ fontSize:14, fontWeight:700, color: filterStatus === 'all' ? C.teal : C.text }}>{riskStats.all}</div>
              <div style={{ fontSize:10, color:C.muted }}>All Students</div>
            </button>
          </div>
        </div>
      </div>

      {/* Caseload Alerts */}
      {caseloadAlerts.length > 0 && (
        <div style={{ padding:20, paddingBottom:0 }}>
          <div style={{ 
            background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:16 
          }}>
            <div style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:12 }}>
              🚨 Caseload Alerts
            </div>
            <div style={{ display:'grid', gap:8 }}>
              {caseloadAlerts.slice(0, 3).map(alert => (
                <SupportTaskCard
                  key={alert.id}
                  task={alert}
                  onAction={handleTaskAction}
                  compact={true}
                />
              ))}
            </div>
            {caseloadAlerts.length > 3 && (
              <div style={{ fontSize:11, color:C.muted, textAlign:'center', marginTop:8 }}>
                +{caseloadAlerts.length - 3} more alerts
              </div>
            )}
          </div>
        </div>
      )}

      {/* Students Needing Review */}
      {studentsNeedingReview.length > 0 && (
        <div style={{ padding:20, paddingBottom:0 }}>
          <div style={{ 
            background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:16 
          }}>
            <div style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:12 }}>
              ⚠️ Students Needing Review
            </div>
            <div style={{ display:'grid', gap:8 }}>
              {studentsNeedingReview.slice(0, 3).map(task => (
                <SupportTaskCard
                  key={task.id}
                  task={task}
                  onAction={handleTaskAction}
                  compact={true}
                />
              ))}
            </div>
            {studentsNeedingReview.length > 3 && (
              <div style={{ fontSize:11, color:C.muted, textAlign:'center', marginTop:8 }}>
                +{studentsNeedingReview.length - 3} more students
              </div>
            )}
          </div>
        </div>
      )}

      {/* Caseload List */}
      <div style={{ padding:20 }}>
        {filteredCaseload.length === 0 ? (
          <div style={{ 
            background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:60, textAlign:'center' 
          }}>
            <div style={{ fontSize:48, marginBottom:16, opacity:0.5 }}>👥</div>
            <div style={{ fontSize:16, fontWeight:600, color:C.text, marginBottom:8 }}>
              No Students in Caseload
            </div>
            <div style={{ fontSize:12, color:C.muted, marginBottom:24 }}>
              Start assigning students to your caseload to track their progress.
            </div>
            <button
              onClick={() => setShowAssignModal(true)}
              style={{
                background:C.teal, color:'#fff', border:'none', borderRadius:8,
                padding:'12px 24px', fontSize:13, fontWeight:600, cursor:'pointer'
              }}
            >
              Assign First Student
            </button>
          </div>
        ) : (
          <div style={{ display:'grid', gap:12 }}>
            {filteredCaseload.map(student => {
              const riskLevel = getRiskLevel(student)
              const riskConfig = RISK_LEVELS[riskLevel]
              
              return (
                <div key={student.id} style={{ 
                  background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20 
                }}>
                  <div style={{ 
                    display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 
                  }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                        <div style={{ fontSize:16, fontWeight:700, color:C.text }}>{student.name}</div>
                        <div style={{ 
                          fontSize:10, padding:'2px 6px', borderRadius:4,
                          background: `${riskConfig.color}20`, color: riskConfig.color,
                          display:'flex', alignItems:'center', gap:4
                        }}>
                          {riskConfig.icon} {riskConfig.label}
                        </div>
                      </div>
                      
                      <div style={{ display:'flex', gap:16, fontSize:11, color:C.muted, marginBottom:8 }}>
                        <span>Grade: {student.grade}%</span>
                        <span>Status: {student.flagged ? 'Flagged' : 'On Track'}</span>
                        <span>Assigned: {student.assignedDate || 'Recently'}</span>
                      </div>

                      {/* Follow-up reminders */}
                      {student.followUpDate && (
                        <div style={{ 
                          background:C.inner, borderRadius:6, padding:'6px 10px', 
                          fontSize:10, color:C.amber, display:'inline-block', marginBottom:8
                        }}>
                          🔄 Follow-up: {student.followUpDate}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display:'flex', gap:8 }}>
                      <button
                        onClick={() => handleMessageStudent(student)}
                        style={{
                          background:C.blue, color:'#fff', border:'none', borderRadius:6,
                          padding:'6px 12px', fontSize:11, fontWeight:600, cursor:'pointer'
                        }}
                      >
                        💬 Message
                      </button>
                      <button
                        onClick={() => handleViewStudent(student)}
                        style={{
                          background:C.inner, border:`1px solid ${C.border}`, borderRadius:6,
                          padding:'6px 12px', fontSize:11, fontWeight:600, color:C.text, cursor:'pointer'
                        }}
                      >
                        👤 Profile
                      </button>
                      <button
                        onClick={() => handleUnassignStudent(student.id)}
                        style={{
                          background:`${C.red}20`, border:`1px solid ${C.red}30`, borderRadius:6,
                          padding:'6px 12px', fontSize:11, fontWeight:600, color:C.red, cursor:'pointer'
                        }}
                      >
                        Unassign
                      </button>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div style={{ 
                    background:C.inner, borderRadius:12, padding:12, 
                    display:'flex', gap:8, flexWrap:'wrap' 
                  }}>
                    <button
                      onClick={() => console.log('View Logs - functionality coming soon')}
                      style={{
                        background:C.bg, border:`1px solid ${C.border}`, borderRadius:6,
                        padding:'4px 8px', fontSize:10, color:C.text, cursor:'pointer'
                      }}
                    >
                      📝 View Logs
                    </button>
                    <button
                      onClick={() => console.log('Add to Group - functionality coming soon')}
                      style={{
                        background:C.bg, border:`1px solid ${C.border}`, borderRadius:6,
                        padding:'4px 8px', fontSize:10, color:C.text, cursor:'pointer'
                      }}
                    >
                      👥 Add to Group
                    </button>
                    <button
                      onClick={() => console.log('View Student - functionality coming soon')}
                      style={{
                        background:C.bg, border:`1px solid ${C.border}`, borderRadius:6,
                        padding:'4px 8px', fontSize:10, color:C.text, cursor:'pointer'
                      }}
                    >
                      📈 View Trends
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Assign Student Modal */}
      {showAssignModal && (
        <div style={overlayStyle} onClick={() => setShowAssignModal(false)}>
          <div style={panelStyle} onClick={e => e.stopPropagation()}>
            <div style={{ 
              display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 
            }}>
              <div>
                <div style={{ fontSize:16, fontWeight:700, color:C.text }}>Assign Student</div>
                <div style={{ fontSize:11, color:C.muted }}>Add student to your caseload</div>
              </div>
              <button 
                onClick={() => setShowAssignModal(false)}
                style={{ 
                  background:C.inner, border:'none', borderRadius:999, width:32, height:32, 
                  color:C.soft, fontSize:18, cursor:'pointer', 
                  display:'flex', alignItems:'center', justifyContent:'center' 
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ maxHeight:300, overflowY:'auto' }}>
              {unassignedStudents.length === 0 ? (
                <div style={{ textAlign:'center', color:C.muted, padding:40 }}>
                  No unassigned students available
                </div>
              ) : (
                <div style={{ display:'grid', gap:8 }}>
                  {unassignedStudents.map(student => (
                    <div key={student.id} style={{
                      background:C.inner, borderRadius:8, padding:12,
                      display:'flex', justifyContent:'space-between', alignItems:'center'
                    }}>
                      <div>
                        <div style={{ fontSize:12, fontWeight:600, color:C.text }}>{student.name}</div>
                        <div style={{ fontSize:10, color:C.muted }}>Grade {student.grade}%</div>
                      </div>
                      <button
                        onClick={() => {
                          handleAssignStudent(student.id)
                          setShowAssignModal(false)
                        }}
                        style={{
                          background:C.teal, color:'#fff', border:'none', borderRadius:6,
                          padding:'6px 12px', fontSize:11, fontWeight:600, cursor:'pointer'
                        }}
                      >
                        Assign
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Style helpers ────────────────────────────────────────────────────────────
const overlayStyle = {
  position:'fixed', inset:0, zIndex:500,
  background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)',
  display:'flex', alignItems:'center', justifyContent:'center',
}

const panelStyle = {
  width:'100%', maxWidth:480,
  background:'#060810',
  borderRadius:20,
  border:'1px solid rgba(255,255,255,0.08)',
  padding:'24px',
  maxHeight:'90vh', overflowY:'auto',
}
