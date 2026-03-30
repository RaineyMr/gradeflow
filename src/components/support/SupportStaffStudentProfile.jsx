// src/components/support/SupportStaffStudentProfile.jsx
import React, { useState, useEffect } from 'react'
import { useStore } from '../../lib/store'
import SupportStaffMessaging from './SupportStaffMessaging'
import AIAssistantPanel from './AIAssistantPanel'
import ParentAIAssistantPanel from '../parents/ParentAIAssistantPanel'
import SupportTaskCard from './SupportTaskCard'
import StudentSupportTimeline from './StudentSupportTimeline'
import { useIsMobile } from '../../lib/utils'

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: '👤' },
  { id: 'grades', label: 'Grades', icon: '📊' },
  { id: 'attendance', label: 'Attendance', icon: '📅' },
  { id: 'notes', label: 'Notes', icon: '📝' },
  { id: 'trends', label: 'Trends', icon: '📈' },
  { id: 'interventions', label: 'Interventions', icon: '🎯' },
  { id: 'supportLogs', label: 'Support Logs', icon: '🗂️' },
  { id: 'timeline', label: 'Support Timeline', icon: '📅' },
  { id: 'parent', label: 'Parent', icon: '👨‍👩‍👧‍👦' },
]

// Parent Tab Component
function ParentTab({ student, onOpenParentAI }) {
  return (
    <div style={{ 
      background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20 
    }}>
      <div style={{ marginBottom:20 }}>
        <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:C.text, marginBottom:8 }}>
          👨‍👩‍👧‍👦 Parent Communication
        </h3>
        <p style={{ margin:0, fontSize:12, color:C.muted, lineHeight:1.5 }}>
          Generate parent-friendly updates, meeting summaries, and communications for {student.name}.
        </p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:12, marginBottom:20 }}>
        <button
          onClick={() => onOpenParentAI()}
          style={{
            background:C.blue, color:'#fff', border:'none', borderRadius:8,
            padding:'12px 16px', fontSize:12, fontWeight:600, cursor:'pointer',
            display:'flex', alignItems:'center', gap:8
          }}
        >
          📝 Generate Parent Update
        </button>
        <button
          onClick={() => onOpenParentAI()}
          style={{
            background:C.teal, color:'#fff', border:'none', borderRadius:8,
            padding:'12px 16px', fontSize:12, fontWeight:600, cursor:'pointer',
            display:'flex', alignItems:'center', gap:8
          }}
        >
          📰 Weekly Digest
        </button>
        <button
          onClick={() => onOpenParentAI()}
          style={{
            background:C.green, color:'#fff', border:'none', borderRadius:8,
            padding:'12px 16px', fontSize:12, fontWeight:600, cursor:'pointer',
            display:'flex', alignItems:'center', gap:8
          }}
        >
          ⭐ Positive Note
        </button>
        <button
          onClick={() => onOpenParentAI()}
          style={{
            background:C.purple, color:'#fff', border:'none', borderRadius:8,
            padding:'12px 16px', fontSize:12, fontWeight:600, cursor:'pointer',
            display:'flex', alignItems:'center', gap:8
          }}
        >
          📞 Follow-Up Message
        </button>
      </div>

      <div style={{ 
        background:C.inner, border:`1px solid ${C.border}`, borderRadius:8, padding:16,
        textAlign:'center'
      }}>
        <div style={{ fontSize:24, marginBottom:8, opacity:0.7 }}>🤖</div>
        <div style={{ fontSize:12, color:C.text, marginBottom:8 }}>
          AI-Powered Parent Communication Assistant
        </div>
        <div style={{ fontSize:11, color:C.muted, lineHeight:1.4 }}>
          Generate culturally sensitive, parent-friendly messages with appropriate tone and language.
        </div>
      </div>
    </div>
  )
}

export default function SupportStaffStudentProfile({ studentId, onBack }) {
  const isMobile = useIsMobile()
  const [showAI, setShowAI] = useState(false)
  const [showParentAI, setShowParentAI] = useState(false)
  const {
    students,
    classes,
    getStudentGrades,
    getStudentAttendance,
    getStudentNotes,
    getStudentTrends,
    getStudentInterventions,
    getTeachersForStudents,
    sendSupportStaffMessage,
    getAutomationMeetingPrep,
    getAutomationRiskTasks
  } = useStore()

  const [activeTab, setActiveTab] = useState('overview')
  const [showMessaging, setShowMessaging] = useState(false)
  const [messagingMode, setMessagingMode] = useState('students')
  const [preselectedIds, setPreselectedIds] = useState([])

  const student = students.find(s => s.id === parseInt(studentId))
  const studentClass = student ? classes.find(c => c.id === student.classId) : null

  // Load student data
  const [grades, setGrades] = useState([])
  const [attendance, setAttendance] = useState([])
  const [notes, setNotes] = useState([])
  const [trends, setTrends] = useState(null)
  const [interventions, setInterventions] = useState([])
  const [loading, setLoading] = useState(true)
  const [meetingPrep, setMeetingPrep] = useState(null)
  const [studentTasks, setStudentTasks] = useState([])

  useEffect(() => {
    if (!student) return

    async function loadStudentData() {
      setLoading(true)
      try {
        const [gradesData, attendanceData, notesData, trendsData, interventionsData, meetingPrepData, riskTasksData] = await Promise.all([
          getStudentGrades(studentId),
          getStudentAttendance(studentId),
          getStudentNotes(studentId),
          getStudentTrends(studentId),
          getStudentInterventions(studentId),
          getAutomationMeetingPrep(studentId),
          getAutomationRiskTasks()
        ])

        setGrades(gradesData || [])
        setAttendance(attendanceData || [])
        setNotes(notesData || [])
        setTrends(trendsData)
        setInterventions(interventionsData || [])
        setMeetingPrep(meetingPrepData)
        
        // Filter tasks for this specific student
        const studentSpecificTasks = (riskTasksData || []).filter(task => task.studentId === parseInt(studentId))
        setStudentTasks(studentSpecificTasks)
      } catch (error) {
        console.error('Failed to load student data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStudentData()
  }, [studentId])

  function handleMessageStudent() {
    setMessagingMode('students')
    setPreselectedIds([parseInt(studentId)])
    setShowMessaging(true)
  }

  function handleMessageTeacherTeam() {
    setMessagingMode('studentTeachers')
    setPreselectedIds([])
    setShowMessaging(true)
  }

  function handleTaskAction(taskId, action) {
    console.log(`Task ${taskId} action: ${action}`)
    if (action === 'complete' || action === 'dismiss') {
      setStudentTasks(prev => prev.filter(task => task.id !== taskId))
    } else if (action === 'snooze') {
      // Move task to end of list
      setStudentTasks(prev => {
        const task = prev.find(t => t.id === taskId)
        const others = prev.filter(t => t.id !== taskId)
        return task ? [...others, task] : prev
      })
    } else if (action === 'convert-to-log') {
      setActiveTab('supportLogs')
    } else if (action === 'convert-to-parent-message') {
      setShowParentAI(true)
    } else if (action === 'download-packet' || action === 'email-packet') {
      console.log('Meeting prep packet action:', action)
    }
  }

  if (!student) {
    return (
      <div style={{ padding:20, textAlign:'center', color:C.muted }}>
        Student not found
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ padding:40, textAlign:'center', color:C.muted }}>
        Loading student data...
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg }}>
      {/* Header */}
      <div style={{ 
        background:C.card, borderBottom:`1px solid ${C.border}`, 
        padding: isMobile ? '12px 16px' : '16px 20px', 
        display:'flex', alignItems:'center', gap: isMobile ? 12 : 16,
        flexWrap: isMobile ? 'wrap' : 'nowrap'
      }}>
        <button 
          onClick={onBack}
          style={{ 
            background:C.inner, border:'none', borderRadius:8, 
            width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, 
            color:C.soft, fontSize: isMobile ? 16 : 18, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center'
          }}
        >
          ←
        </button>
        
        <div style={{ flex:1, minWidth: 0 }}>
          <div style={{ fontSize: isMobile ? 16 : 18, fontWeight:700, color:C.text, marginBottom:2 }}>
            {student.name}
          </div>
          <div style={{ fontSize: isMobile ? 10 : 12, color:C.muted }}>
            {studentClass?.subject} · Grade {student.grade}% · {studentClass?.period}
          </div>
        </div>

        <div style={{ 
          display:'flex', gap: isMobile ? 4 : 8,
          flexWrap: isMobile ? 'wrap' : 'nowrap'
        }}>
          <button
            onClick={() => setShowAI(true)}
            style={{
              background:C.purple, color:'#fff', border:'none', borderRadius:8,
              padding: isMobile ? '6px 8px' : '8px 12px', 
              fontSize: isMobile ? 9 : 11, fontWeight:600, cursor:'pointer'
            }}
          >
            🤖 AI
          </button>
          <button
            onClick={handleMessageStudent}
            style={{
              background:C.teal, color:'#fff', border:'none', borderRadius:8,
              padding: isMobile ? '6px 8px' : '8px 12px', 
              fontSize: isMobile ? 9 : 11, fontWeight:600, cursor:'pointer'
            }}
          >
            💬 {isMobile ? '' : 'Message'}
          </button>
          <button
            onClick={handleMessageTeacherTeam}
            style={{
              background:C.blue, color:'#fff', border:'none', borderRadius:8,
              padding: isMobile ? '6px 8px' : '8px 12px', 
              fontSize: isMobile ? 9 : 11, fontWeight:600, cursor:'pointer'
            }}
          >
            👥 {isMobile ? '' : 'Team'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ 
        background:C.card, borderBottom:`1px solid ${C.border}`, 
        padding: isMobile ? '0 16px' : '0 20px', overflowX:'auto' 
      }}>
        <div style={{ display:'flex', gap: isMobile ? 2 : 4, minWidth:'max-content' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? C.inner : 'transparent',
                border:'none', borderRadius:8, 
                padding: isMobile ? '8px 12px' : '12px 16px',
                cursor:'pointer', display:'flex', alignItems:'center', gap: isMobile ? 4 : 6,
                borderBottom: activeTab === tab.id ? `2px solid ${C.teal}` : '2px solid transparent',
                marginBottom:-1,
                fontSize: isMobile ? 11 : 12
              }}
            >
              <span style={{ fontSize:14 }}>{tab.icon}</span>
              <span style={{ 
                fontSize:12, fontWeight:600, 
                color: activeTab === tab.id ? C.text : C.muted 
              }}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding:20 }}>
        {activeTab === 'overview' && (
          <OverviewTab 
            student={student} 
            studentClass={studentClass} 
            trends={trends} 
            meetingPrep={meetingPrep}
            studentTasks={studentTasks}
            onTaskAction={handleTaskAction}
          />
        )}
        {activeTab === 'grades' && (
          <GradesTab grades={grades} student={student} />
        )}
        {activeTab === 'attendance' && (
          <AttendanceTab attendance={attendance} student={student} />
        )}
        {activeTab === 'notes' && (
          <NotesTab notes={notes} student={student} />
        )}
        {activeTab === 'trends' && (
          <TrendsTab trends={trends} student={student} />
        )}
        {activeTab === 'interventions' && (
          <InterventionsTab interventions={interventions} student={student} />
        )}
        {activeTab === 'supportLogs' && (
          <SupportLogsTab student={student} />
        )}
        {activeTab === 'timeline' && (
          <StudentSupportTimeline studentId={studentId} />
        )}
        {activeTab === 'parent' && (
          <ParentTab student={student} onOpenParentAI={() => setShowParentAI(true)} />
        )}
      </div>

      {/* Messaging Modal */}
      {showMessaging && (
        <SupportStaffMessaging
          onClose={() => setShowMessaging(false)}
          preselectedStudentIds={preselectedIds}
          preselectedMode={messagingMode}
        />
      )}
    </div>
  )
}

// ─── Tab Components ────────────────────────────────────────────────────────────
function OverviewTab({ student, studentClass, trends, meetingPrep, studentTasks, onTaskAction }) {
  return (
    <div style={{ display:'grid', gap:16 }}>
      <div style={{ 
        background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:16 
      }}>
        <h3 style={{ margin:'0 0 12px 0', fontSize:14, fontWeight:700, color:C.text }}>
          Student Information
        </h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:12 }}>
          <div>
            <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em' }}>
              Current Grade
            </div>
            <div style={{ fontSize:18, fontWeight:700, color: student.grade >= 70 ? C.green : C.red }}>
              {student.grade}%
            </div>
          </div>
          <div>
            <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em' }}>
              Class
            </div>
            <div style={{ fontSize:14, color:C.text }}>
              {studentClass?.subject} ({studentClass?.period})
            </div>
          </div>
          <div>
            <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em' }}>
              Status
            </div>
            <div style={{ fontSize:14, color: student.flagged ? C.red : C.green }}>
              {student.flagged ? 'Needs Attention' : 'On Track'}
            </div>
          </div>
        </div>
      </div>

      {trends && (
        <div style={{ 
          background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:16 
        }}>
          <h3 style={{ margin:'0 0 12px 0', fontSize:14, fontWeight:700, color:C.text }}>
            Recent Trends
          </h3>
          <div style={{ fontSize:12, color:C.muted, lineHeight:1.5 }}>
            {trends.summary || 'No trend data available.'}
          </div>
        </div>
      )}

      {/* Meeting Prep Packet */}
      {meetingPrep && (
        <div style={{ 
          background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:16 
        }}>
          <h3 style={{ margin:'0 0 12px 0', fontSize:14, fontWeight:700, color:C.text }}>
            📋 Meeting Prep Packet
          </h3>
          <SupportTaskCard
            task={meetingPrep}
            onAction={onTaskAction}
            compact={true}
          />
        </div>
      )}

      {/* Automated Tasks for This Student */}
      {studentTasks && studentTasks.length > 0 && (
        <div style={{ 
          background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:16 
        }}>
          <h3 style={{ margin:'0 0 12px 0', fontSize:14, fontWeight:700, color:C.text }}>
            ⚠️ Automated Tasks for {student.name}
          </h3>
          <div style={{ display:'grid', gap:8 }}>
            {studentTasks.slice(0, 3).map(task => (
              <SupportTaskCard
                key={task.id}
                task={task}
                onAction={onTaskAction}
                compact={true}
              />
            ))}
          </div>
          {studentTasks.length > 3 && (
            <div style={{ fontSize:11, color:C.muted, textAlign:'center', marginTop:8 }}>
              +{studentTasks.length - 3} more tasks
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function GradesTab({ grades, student }) {
  return (
    <div style={{ 
      background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:16 
    }}>
      <h3 style={{ margin:'0 0 16px 0', fontSize:14, fontWeight:700, color:C.text }}>
        Academic Performance (Read-Only)
      </h3>
      {grades.length === 0 ? (
        <div style={{ textAlign:'center', color:C.muted, padding:40 }}>
          No grade data available for {student.name}
        </div>
      ) : (
        <div style={{ display:'grid', gap:8 }}>
          {grades.map((grade, idx) => (
            <div key={idx} style={{ 
              background:C.inner, borderRadius:8, padding:12,
              display:'flex', justifyContent:'space-between', alignItems:'center'
            }}>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:C.text }}>{grade.assignment}</div>
                <div style={{ fontSize:10, color:C.muted }}>{grade.type} · {grade.date}</div>
              </div>
              <div style={{ 
                fontSize:14, fontWeight:700,
                color: grade.score >= 70 ? C.green : grade.score >= 60 ? C.amber : C.red
              }}>
                {grade.score}%
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ 
        fontSize:10, color:C.muted, textAlign:'center', marginTop:16, fontStyle:'italic'
      }}>
        Grade data is view-only for support staff
      </div>
    </div>
  )
}

function AttendanceTab({ attendance, student }) {
  return (
    <div style={{ 
      background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:16 
    }}>
      <h3 style={{ margin:'0 0 16px 0', fontSize:14, fontWeight:700, color:C.text }}>
        Attendance Record (Read-Only)
      </h3>
      {attendance.length === 0 ? (
        <div style={{ textAlign:'center', color:C.muted, padding:40 }}>
          No attendance data available for {student.name}
        </div>
      ) : (
        <div style={{ display:'grid', gap:8 }}>
          {attendance.map((record, idx) => (
            <div key={idx} style={{ 
              background:C.inner, borderRadius:8, padding:12,
              display:'flex', justifyContent:'space-between', alignItems:'center'
            }}>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:C.text }}>{record.date}</div>
                <div style={{ fontSize:10, color:C.muted }}>{record.period}</div>
              </div>
              <div style={{ 
                fontSize:12, fontWeight:600,
                color: record.status === 'Present' ? C.green : 
                       record.status === 'Absent' ? C.red : C.amber
              }}>
                {record.status}
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ 
        fontSize:10, color:C.muted, textAlign:'center', marginTop:16, fontStyle:'italic'
      }}>
        Attendance data is view-only for support staff
      </div>
    </div>
  )
}

function NotesTab({ notes, student }) {
  return (
    <div style={{ 
      background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:16 
    }}>
      <h3 style={{ margin:'0 0 16px 0', fontSize:14, fontWeight:700, color:C.text }}>
        Teacher Notes (Read-Only)
      </h3>
      {notes.length === 0 ? (
        <div style={{ textAlign:'center', color:C.muted, padding:40 }}>
          No notes available for {student.name}
        </div>
      ) : (
        <div style={{ display:'grid', gap:12 }}>
          {notes.map((note, idx) => (
            <div key={idx} style={{ 
              background:C.inner, borderRadius:8, padding:12
            }}>
              <div style={{ 
                display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8
              }}>
                <div style={{ fontSize:12, fontWeight:600, color:C.text }}>{note.author}</div>
                <div style={{ fontSize:10, color:C.muted }}>{note.date}</div>
              </div>
              <div style={{ fontSize:12, color:C.text, lineHeight:1.5 }}>
                {note.content}
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ 
        fontSize:10, color:C.muted, textAlign:'center', marginTop:16, fontStyle:'italic'
      }}>
        Notes are view-only for support staff
      </div>
    </div>
  )
}

function TrendsTab({ trends, student }) {
  return (
    <div style={{ 
      background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:16 
    }}>
      <h3 style={{ margin:'0 0 16px 0', fontSize:14, fontWeight:700, color:C.text }}>
        Performance Trends (Read-Only)
      </h3>
      {!trends ? (
        <div style={{ textAlign:'center', color:C.muted, padding:40 }}>
          No trend data available for {student.name}
        </div>
      ) : (
        <div>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:8 }}>Summary</div>
            <div style={{ fontSize:12, color:C.text, lineHeight:1.5 }}>
              {trends.summary}
            </div>
          </div>
          
          {trends.metrics && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:12 }}>
              {Object.entries(trends.metrics).map(([key, value]) => (
                <div key={key} style={{ background:C.inner, borderRadius:8, padding:12 }}>
                  <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                    {key.replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontSize:16, fontWeight:700, color:C.text }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div style={{ 
        fontSize:10, color:C.muted, textAlign:'center', marginTop:16, fontStyle:'italic'
      }}>
        Trend data is view-only for support staff
      </div>
    </div>
  )
}

function InterventionsTab({ interventions, student }) {
  return (
    <div style={{ 
      background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:16 
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:C.text }}>
          Intervention Plans
        </h3>
        <button
          style={{
            background:C.teal, color:'#fff', border:'none', borderRadius:8,
            padding:'6px 12px', fontSize:11, fontWeight:600, cursor:'pointer'
          }}
        >
          + Create Plan
        </button>
      </div>
      
      {interventions.length === 0 ? (
        <div style={{ textAlign:'center', color:C.muted, padding:40 }}>
          No intervention plans for {student.name}
        </div>
      ) : (
        <div style={{ display:'grid', gap:12 }}>
          {interventions.map((plan, idx) => (
            <div key={idx} style={{ 
              background:C.inner, borderRadius:8, padding:12
            }}>
              <div style={{ 
                display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8
              }}>
                <div style={{ fontSize:12, fontWeight:600, color:C.text }}>{plan.title}</div>
                <div style={{ 
                  fontSize:10, padding:'2px 6px', borderRadius:4,
                  background: plan.status === 'Active' ? `${C.green}20` : `${C.muted}20`,
                  color: plan.status === 'Active' ? C.green : C.muted
                }}>
                  {plan.status}
                </div>
              </div>
              <div style={{ fontSize:11, color:C.text, lineHeight:1.5, marginBottom:8 }}>
                {plan.description}
              </div>
              <div style={{ fontSize:10, color:C.muted }}>
                Created: {plan.createdDate} · Next Review: {plan.nextReview}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SupportLogsTab({ student }) {
  const [showLogsView, setShowLogsView] = useState(false)

  const overlayStyle = {
    position:'fixed', inset:0, zIndex:500,
    background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)',
    display:'flex', alignItems:'center', justifyContent:'center',
  }

  const panelStyle = {
    width:'100%', maxWidth:600,
    background:'#060810',
    borderRadius:20,
    border:'1px solid rgba(255,255,255,0.08)',
    padding:'24px',
    maxHeight:'90vh', overflowY:'auto',
  }

  return (
    <div style={{ 
      background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:16 
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:C.text }}>
          Support Logs
        </h3>
        <button
          onClick={() => setShowLogsView(true)}
          style={{
            background:C.teal, color:'#fff', border:'none', borderRadius:8,
            padding:'6px 12px', fontSize:11, fontWeight:600, cursor:'pointer'
          }}
        >
          View All Logs
        </button>
      </div>
      
      <div style={{ textAlign:'center', color:C.muted, padding:40 }}>
        <div style={{ fontSize:32, marginBottom:8, opacity:0.5 }}>🗂️</div>
        <div style={{ fontSize:12, color:C.muted, marginBottom:12 }}>
          Support logs for {student.name}
        </div>
        <button
          onClick={() => setShowLogsView(true)}
          style={{
            background:C.inner, border:`1px solid ${C.border}`, borderRadius:8,
            padding:'8px 16px', fontSize:11, color:C.text, cursor:'pointer'
          }}
        >
          View Support Logs
        </button>
      </div>

      {/* Full logs view modal */}
      {showLogsView && (
        <div style={overlayStyle} onClick={() => setShowLogsView(false)}>
          <div style={panelStyle} onClick={e => e.stopPropagation()}>
            <div style={{ 
              display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 
            }}>
              <div>
                <div style={{ fontSize:16, fontWeight:700, color:C.text }}>
                  Support Logs - {student.name}
                </div>
                <div style={{ fontSize:11, color:C.muted }}>
                  All support interactions for this student
                </div>
              </div>
              <button 
                onClick={() => setShowLogsView(false)}
                style={{ 
                  background:C.inner, border:'none', borderRadius:999, width:32, height:32, 
                  color:C.soft, fontSize:18, cursor:'pointer', 
                  display:'flex', alignItems:'center', justifyContent:'center' 
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ 
              background:C.inner, borderRadius:12, padding:16, textAlign:'center', color:C.muted 
            }}>
              <div style={{ fontSize:24, marginBottom:8 }}>📝</div>
              <div style={{ fontSize:12 }}>
                Support logs feature will be available here
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Panel */}
      <AIAssistantPanel
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        initialContext={{ 
          screen: 'studentProfile',
          studentId: studentId,
          student: student
        }}
      />

      {/* Parent AI Assistant Panel */}
      <ParentAIAssistantPanel
        isOpen={showParentAI}
        onClose={() => setShowParentAI(false)}
        initialContext={{ 
          screen: 'studentProfile',
          studentId: studentId,
          student: student
        }}
      />
    </div>
  )
}
