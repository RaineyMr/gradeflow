// src/components/support/SupportStaffHomeFeed.jsx
import React, { useState, useEffect } from 'react'
import { useStore } from '../../lib/store'
import SupportWidget from './SupportWidget'
import SupportTaskCard from './SupportTaskCard'
import SupportStaffMessaging from './SupportStaffMessaging'
import { useNavigate } from 'react-router-dom'

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

export default function SupportStaffHomeFeed() {
  const navigate = useNavigate()
  const {
    getSupportStaffStudentsNeedingAttention,
    getRecentSupportNotes,
    getUpcomingFollowUps,
    getSupportGroupSummary,
    getStudentsForSupportStaff,
    getAutomationFollowUps,
    getAutomationRiskTasks,
    getAutomationWeeklySummary,
    currentUser
  } = useStore()

  const [showMessaging, setShowMessaging] = useState(false)
  const [studentsNeedingAttention, setStudentsNeedingAttention] = useState([])
  const [recentNotes, setRecentNotes] = useState([])
  const [upcomingFollowUps, setUpcomingFollowUps] = useState([])
  const [groupSummary, setGroupSummary] = useState([])
  const [automationTasks, setAutomationTasks] = useState([])
  const [weeklySummary, setWeeklySummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadHomeData() {
      setLoading(true)
      try {
        const [attentionData, notesData, followUpsData, groupsData, followUpTasks, riskTasks, summaryData] = await Promise.all([
          getSupportStaffStudentsNeedingAttention(),
          getRecentSupportNotes(),
          getUpcomingFollowUps(),
          getSupportGroupSummary(),
          getAutomationFollowUps(),
          getAutomationRiskTasks(),
          getAutomationWeeklySummary()
        ])

        setStudentsNeedingAttention(attentionData || [])
        setRecentNotes(notesData || [])
        setUpcomingFollowUps(followUpsData || [])
        setGroupSummary(groupsData || [])
        setAutomationTasks([...(followUpTasks || []), ...(riskTasks || [])])
        setWeeklySummary(summaryData)
      } catch (error) {
        console.error('Failed to load home data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadHomeData()
  }, [])

  function handleQuickMessage() {
    setShowMessaging(true)
  }

  function handleViewStudents() {
    console.log('Navigate to Students - functionality coming soon')
  }

  function handleViewGroups() {
    console.log('Navigate to Groups - functionality coming soon')
  }

  function handleViewLogs() {
    console.log('Navigate to Logs - functionality coming soon')
  }

  function handleViewCaseload() {
    console.log('Navigate to Caseload - functionality coming soon')
  }

  function handleTaskAction(taskId, action) {
    console.log(`Task ${taskId} action: ${action}`)
    // Handle task actions here
    if (action === 'complete' || action === 'dismiss') {
      setAutomationTasks(prev => prev.filter(task => task.id !== taskId))
    } else if (action === 'snooze') {
      // Move task to end of list
      setAutomationTasks(prev => {
        const task = prev.find(t => t.id === taskId)
        const others = prev.filter(t => t.id !== taskId)
        return task ? [...others, task] : prev
      })
    } else if (action === 'convert-to-log') {
      navigate('/support/logs')
    } else if (action === 'convert-to-parent-message') {
      setShowMessaging(true)
    }
  }

  if (loading) {
    return (
      <div style={{ padding:40, textAlign:'center', color:C.muted }}>
        Loading dashboard...
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg }}>
      {/* Header */}
      <div style={{ 
        background:C.card, borderBottom:`1px solid ${C.border}`, 
        padding:'20px', marginBottom:20 
      }}>
        <div style={{ fontSize:24, fontWeight:800, color:C.text, marginBottom:4 }}>
          Welcome back, {currentUser?.name || 'Support Staff'}
        </div>
        <div style={{ fontSize:14, color:C.muted }}>
          Here's what needs your attention today
        </div>
      </div>

      {/* Widgets Grid */}
      <div style={{ padding:'0 20px', maxWidth:1200, margin:'0 auto' }}>
        <div style={{ 
          display:'grid', 
          gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', 
          gap:20 
        }}>
          
          {/* Students Needing Attention */}
          <SupportWidget
            title="Students Needing Attention"
            icon="⚠️"
            color={C.red}
            onClick={handleViewStudents}
          >
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:24, fontWeight:700, color:C.red, marginBottom:4 }}>
                {studentsNeedingAttention.length}
              </div>
              <div style={{ fontSize:12, color:C.muted }}>
                students require immediate support
              </div>
            </div>
            
            {studentsNeedingAttention.slice(0, 3).map((student, idx) => (
              <div key={idx} style={{ 
                background:C.inner, borderRadius:8, padding:8, 
                marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center'
              }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:C.text }}>{student.name}</div>
                  <div style={{ fontSize:10, color:C.muted }}>{student.reason}</div>
                </div>
                <div style={{ 
                  fontSize:11, padding:'2px 6px', borderRadius:4,
                  background: student.grade < 60 ? `${C.red}20` : `${C.amber}20`,
                  color: student.grade < 60 ? C.red : C.amber
                }}>
                  {student.grade}%
                </div>
              </div>
            ))}
            
            {studentsNeedingAttention.length > 3 && (
              <div style={{ fontSize:11, color:C.muted, textAlign:'center', marginTop:8 }}>
                +{studentsNeedingAttention.length - 3} more students
              </div>
            )}
          </SupportWidget>

          {/* Recent Notes */}
          <SupportWidget
            title="Recent Support Notes"
            icon="📝"
            color={C.blue}
            onClick={() => navigate('/support/logs')}
          >
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:24, fontWeight:700, color:C.blue, marginBottom:4 }}>
                {recentNotes.length}
              </div>
              <div style={{ fontSize:12, color:C.muted }}>
                notes added this week
              </div>
            </div>
            
            {recentNotes.slice(0, 3).map((note, idx) => (
              <div key={idx} style={{ 
                background:C.inner, borderRadius:8, padding:8, marginBottom:8
              }}>
                <div style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:4 }}>
                  {note.studentName}
                </div>
                <div style={{ fontSize:11, color:C.muted, lineHeight:1.4 }}>
                  {note.content.substring(0, 60)}...
                </div>
                <div style={{ fontSize:10, color:C.muted, marginTop:4 }}>
                  {note.date} by {note.author}
                </div>
              </div>
            ))}
            
            {recentNotes.length === 0 && (
              <div style={{ fontSize:12, color:C.muted, textAlign:'center', padding:20 }}>
                No recent notes
              </div>
            )}
          </SupportWidget>

          {/* Upcoming Follow-ups */}
          <SupportWidget
            title="Upcoming Follow-ups"
            icon="📅"
            color={C.amber}
            onClick={handleViewCaseload}
          >
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:24, fontWeight:700, color:C.amber, marginBottom:4 }}>
                {upcomingFollowUps.length}
              </div>
              <div style={{ fontSize:12, color:C.muted }}>
                follow-ups scheduled
              </div>
            </div>
            
            {upcomingFollowUps.slice(0, 3).map((followUp, idx) => (
              <div key={idx} style={{ 
                background:C.inner, borderRadius:8, padding:8, marginBottom:8
              }}>
                <div style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:4 }}>
                  {followUp.studentName}
                </div>
                <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>
                  {followUp.type}
                </div>
                <div style={{ 
                  fontSize:10, padding:'2px 6px', borderRadius:4,
                  background: `${C.amber}20`, color:C.amber, display:'inline-block'
                }}>
                  {followUp.date}
                </div>
              </div>
            ))}
            
            {upcomingFollowUps.length === 0 && (
              <div style={{ fontSize:12, color:C.muted, textAlign:'center', padding:20 }}>
                No upcoming follow-ups
              </div>
            )}
          </SupportWidget>

          {/* Group Activity */}
          <SupportWidget
            title="Group Activity"
            icon="👥"
            color={C.purple}
            onClick={handleViewGroups}
          >
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:24, fontWeight:700, color:C.purple, marginBottom:4 }}>
                {groupSummary.length}
              </div>
              <div style={{ fontSize:12, color:C.muted }}>
                active support groups
              </div>
            </div>
            
            {groupSummary.slice(0, 3).map((group, idx) => (
              <div key={idx} style={{ 
                background:C.inner, borderRadius:8, padding:8, marginBottom:8,
                display:'flex', justifyContent:'space-between', alignItems:'center'
              }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:C.text }}>{group.name}</div>
                  <div style={{ fontSize:10, color:C.muted }}>{group.studentCount} students</div>
                </div>
                <div style={{ 
                  fontSize:10, padding:'2px 6px', borderRadius:4,
                  background: `${C.green}20`, color:C.green
                }}>
                  Active
                </div>
              </div>
            ))}
            
            {groupSummary.length === 0 && (
              <div style={{ fontSize:12, color:C.muted, textAlign:'center', padding:20 }}>
                No active groups
              </div>
            )}
          </SupportWidget>

          {/* Automated Tasks */}
          <SupportWidget
            title="Automated Tasks"
            icon="🤖"
            color={C.purple}
          >
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:24, fontWeight:700, color:C.purple, marginBottom:4 }}>
                {automationTasks.length}
              </div>
              <div style={{ fontSize:12, color:C.muted }}>
                AI-generated tasks
              </div>
            </div>
            
            {automationTasks.slice(0, 3).map((task, idx) => (
              <SupportTaskCard
                key={task.id}
                task={task}
                onAction={handleTaskAction}
                compact={true}
              />
            ))}
            
            {automationTasks.length === 0 && (
              <div style={{ fontSize:12, color:C.muted, textAlign:'center', padding:20 }}>
                No automated tasks
              </div>
            )}
            
            {automationTasks.length > 3 && (
              <div style={{ fontSize:11, color:C.muted, textAlign:'center', marginTop:8 }}>
                +{automationTasks.length - 3} more tasks
              </div>
            )}
          </SupportWidget>

          {/* Weekly Summary */}
          <SupportWidget
            title="Weekly Summary"
            icon="📈"
            color={C.teal}
          >
            {weeklySummary ? (
              <div>
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:12, color:C.muted, marginBottom:8 }}>
                    {weeklySummary.weekStart} - {weeklySummary.weekEnd}
                  </div>
                </div>
                
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:8, marginBottom:12 }}>
                  <div style={{ background:C.inner, borderRadius:8, padding:8, textAlign:'center' }}>
                    <div style={{ fontSize:14, fontWeight:700, color:C.blue }}>{weeklySummary.metrics.notesAdded}</div>
                    <div style={{ fontSize:9, color:C.muted }}>Notes Added</div>
                  </div>
                  <div style={{ background:C.inner, borderRadius:8, padding:8, textAlign:'center' }}>
                    <div style={{ fontSize:14, fontWeight:700, color:C.green }}>{weeklySummary.metrics.completedInterventions}</div>
                    <div style={{ fontSize:9, color:C.muted }}>Completed</div>
                  </div>
                </div>
                
                <div style={{ fontSize:11, color:C.text, marginBottom:8 }}>
                  <strong>Highlights:</strong>
                </div>
                {weeklySummary.highlights.slice(0, 2).map((highlight, idx) => (
                  <div key={idx} style={{ 
                    fontSize:10, 
                    color:C.muted, 
                    marginBottom:4,
                    paddingLeft:12,
                    position:'relative'
                  }}>
                    • {highlight}
                  </div>
                ))}
                
                <div style={{ display:'flex', gap:6, marginTop:12 }}>
                  <button
                    style={{
                      background:C.inner, border:`1px solid ${C.border}`, borderRadius:6,
                      padding:'4px 8px', fontSize:10, color:C.text, cursor:'pointer'
                    }}
                  >
                    📊 View Full
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ fontSize:12, color:C.muted, textAlign:'center', padding:20 }}>
                No summary available
              </div>
            )}
          </SupportWidget>

          {/* Caseload */}
          <SupportWidget
            title="My Caseload"
            icon="👥"
            color={C.purple}
            onClick={handleViewCaseload}
          >
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:24, fontWeight:700, color:C.purple, marginBottom:4 }}>
                {studentsNeedingAttention.length}
              </div>
              <div style={{ fontSize:12, color:C.muted }}>
                students assigned to you
              </div>
            </div>
            
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:8, marginBottom:12 }}>
              <div style={{ background:C.inner, borderRadius:8, padding:8, textAlign:'center' }}>
                <div style={{ fontSize:14, fontWeight:700, color:C.red }}>2</div>
                <div style={{ fontSize:9, color:C.muted }}>Critical</div>
              </div>
              <div style={{ background:C.inner, borderRadius:8, padding:8, textAlign:'center' }}>
                <div style={{ fontSize:14, fontWeight:700, color:C.amber }}>3</div>
                <div style={{ fontSize:9, color:C.muted }}>At Risk</div>
              </div>
            </div>
            
            <button
              onClick={handleViewCaseload}
              style={{
                background:C.inner, border:`1px solid ${C.border}`, borderRadius:6,
                padding:'6px 12px', fontSize:10, color:C.text, cursor:'pointer', width:'100%'
              }}
            >
              Manage Caseload
            </button>
          </SupportWidget>

          {/* Quick Actions */}
          <SupportWidget
            title="Quick Actions"
            icon="⚡"
            color={C.teal}
            size="small"
          >
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              <button
                onClick={handleQuickMessage}
                style={{
                  background:C.inner, border:`1px solid ${C.border}`, borderRadius:8,
                  padding:'12px 8px', fontSize:11, color:C.text, cursor:'pointer',
                  textAlign:'center', transition:'all 0.15s'
                }}
              >
                💬 Send Message
              </button>
              <button
                onClick={handleViewStudents}
                style={{
                  background:C.inner, border:`1px solid ${C.border}`, borderRadius:8,
                  padding:'12px 8px', fontSize:11, color:C.text, cursor:'pointer',
                  textAlign:'center', transition:'all 0.15s'
                }}
              >
                👤 View Students
              </button>
              <button
                onClick={handleViewGroups}
                style={{
                  background:C.inner, border:`1px solid ${C.border}`, borderRadius:8,
                  padding:'12px 8px', fontSize:11, color:C.text, cursor:'pointer',
                  textAlign:'center', transition:'all 0.15s'
                }}
              >
                👥 Manage Groups
              </button>
              <button
                onClick={handleViewLogs}
                style={{
                  background:C.inner, border:`1px solid ${C.border}`, borderRadius:8,
                  padding:'12px 8px', fontSize:11, color:C.text, cursor:'pointer',
                  textAlign:'center', transition:'all 0.15s'
                }}
              >
                📝 Support Logs
              </button>
            </div>
          </SupportWidget>

        </div>
      </div>

      {/* Messaging Modal */}
      {showMessaging && (
        <SupportStaffMessaging
          onClose={() => setShowMessaging(false)}
        />
      )}
    </div>
  )
}
