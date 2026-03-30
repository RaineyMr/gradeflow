import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { useIsMobile } from '../lib/utils'
import CaseActionItem from '../components/support/CaseActionItem'
import AIAssistantPanel from '../components/support/AIAssistantPanel'
import ParentAIAssistantPanel from '../components/parents/ParentAIAssistantPanel'
import StudentSupportTimeline from '../components/support/StudentSupportTimeline'
import { 
  Calendar, Users, FileText, MessageSquare, CheckSquare, Plus, 
  Download, Send, Clock, User, Target, Brain, Eye, EyeOff 
} from 'lucide-react'

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

const AGENDA_TEMPLATES = [
  {
    id: 'academic-review',
    name: 'Academic Review',
    items: [
      'Current academic performance overview',
      'Recent test/assignment results',
      'Strengths and areas of concern',
      'Academic goals and interventions'
    ]
  },
  {
    id: 'behavior-support',
    name: 'Behavior Support',
    items: [
      'Behavioral observations',
      'Current behavior plan effectiveness',
      'Triggers and patterns',
      'Behavioral intervention strategies'
    ]
  },
  {
    id: 'comprehensive',
    name: 'Comprehensive Review',
    items: [
      'Academic performance',
      'Behavioral observations',
      'Attendance patterns',
      'Social-emotional development',
      'Family communication',
      'Action items and follow-ups'
    ]
  }
]

export default function CaseConference({ onBack }) {
  const isMobile = useIsMobile()
  const { studentId } = useParams()
  const navigate = useNavigate()
  
  const [showAI, setShowAI] = useState(false)
  const [showParentAI, setShowParentAI] = useState(false)
  const [activeTab, setActiveTab] = useState('agenda')
  const [meetingNotes, setMeetingNotes] = useState('')
  const [actionItems, setActionItems] = useState([])
  const [attendance, setAttendance] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [agendaItems, setAgendaItems] = useState([])
  const [showParentSummary, setShowParentSummary] = useState(false)
  const [showInternalSummary, setShowInternalSummary] = useState(false)
  const [meetingPrep, setMeetingPrep] = useState(null)

  const {
    students,
    classes,
    getStudentGrades,
    getStudentAttendance,
    getStudentNotes,
    getStudentTrends,
    getStudentInterventions,
    getTeachersForStudents,
    getParentsForStudents,
    getAdminContacts,
    getCaseConferenceData,
    saveCaseConferenceNotes,
    saveCaseConferenceActionItems,
    getCaseConferenceHistory,
    getAutomationMeetingPrep,
    sendSupportStaffMessage,
    currentUser
  } = useStore()

  const student = students.find(s => s.id === parseInt(studentId))
  const studentClass = student ? classes.find(c => c.id === student.classId) : null

  // Load existing conference data
  useEffect(() => {
    if (!student) return

    async function loadConferenceData() {
      try {
        const [conferenceData, meetingPrepData] = await Promise.all([
          getCaseConferenceData(studentId),
          getAutomationMeetingPrep(studentId)
        ])

        if (conferenceData) {
          setMeetingNotes(conferenceData.notes || '')
          setActionItems(conferenceData.actionItems || [])
          setAttendance(conferenceData.attendance || [])
        }

        if (meetingPrepData) {
          setMeetingPrep(meetingPrepData)
        }
      } catch (error) {
        console.error('Error loading conference data:', error)
      }
    }

    loadConferenceData()
  }, [studentId, getCaseConferenceData, getAutomationMeetingPrep])

  const handleAddActionItem = () => {
    const newItem = {
      id: Date.now(),
      description: '',
      assignedTo: '',
      dueDate: '',
      status: 'pending',
      comments: ''
    }
    setActionItems(prev => [...prev, newItem])
  }

  const handleUpdateActionItem = (id, updates) => {
    setActionItems(prev => 
      prev.map(item => item.id === id ? { ...item, ...updates } : item)
    )
  }

  const handleDeleteActionItem = (id) => {
    setActionItems(prev => prev.filter(item => item.id !== id))
  }

  const handleAddAgendaItem = () => {
    const newItem = prompt('Add agenda item:')
    if (newItem) {
      setAgendaItems(prev => [...prev, { id: Date.now(), text: newItem, completed: false }])
    }
  }

  const handleTemplateSelect = (templateId) => {
    const template = AGENDA_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(templateId)
      setAgendaItems(template.items.map((item, index) => ({
        id: Date.now() + index,
        text: item,
        completed: false
      })))
    }
  }

  const handleSaveConference = async () => {
    try {
      await saveCaseConferenceNotes(studentId, meetingNotes)
      await saveCaseConferenceActionItems(studentId, actionItems)
      
      // Save attendance data
      const conferenceData = {
        studentId,
        notes: meetingNotes,
        actionItems,
        attendance,
        agendaItems,
        meetingDate: new Date().toISOString(),
        conductedBy: currentUser?.name
      }
      
      console.log('Conference saved:', conferenceData)
      alert('Case conference saved successfully!')
    } catch (error) {
      console.error('Error saving conference:', error)
      alert('Error saving conference. Please try again.')
    }
  }

  const handleGenerateParentSummary = () => {
    setShowParentAI(true)
  }

  const handleGenerateInternalSummary = () => {
    setShowAI(true)
  }

  const handleSendSummary = async (type) => {
    try {
      const recipients = type === 'parent' 
        ? getParentsForStudents([parseInt(studentId)])
        : getTeachersForStudents([parseInt(studentId)])

      const subject = type === 'parent' 
        ? `Case Conference Summary - ${student.name}`
        : `Internal Case Conference Notes - ${student.name}`

      const body = type === 'parent'
        ? `Dear Parent,\n\nHere is a summary of our recent case conference regarding ${student.name}:\n\n${meetingNotes}\n\nPlease let us know if you have any questions.`
        : `Team,\n\nHere are the internal notes from our case conference for ${student.name}:\n\n${meetingNotes}`

      await sendSupportStaffMessage({
        recipientMode: type === 'parent' ? 'parents' : 'studentTeachers',
        recipientIds: recipients.map(r => r.id),
        subject,
        body
      })

      alert(`${type === 'parent' ? 'Parent' : 'Internal'} summary sent successfully!`)
    } catch (error) {
      console.error('Error sending summary:', error)
      alert('Error sending summary. Please try again.')
    }
  }

  if (!student) {
    return (
      <div style={{ padding:20, textAlign:'center', color:C.muted }}>
        Student not found
      </div>
    )
  }

  const TABS = [
    { id: 'agenda', label: 'Agenda', icon: Target },
    { id: 'prep', label: 'Meeting Prep', icon: FileText },
    { id: 'notes', label: 'Live Notes', icon: MessageSquare },
    { id: 'actions', label: 'Action Items', icon: CheckSquare },
    { id: 'attendance', label: 'Attendance', icon: Users },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'summary', label: 'Summary', icon: Send }
  ]

  return (
    <div style={{ minHeight:'100vh', background:C.bg }}>
      {/* Header */}
      <div style={{ 
        background:C.card, borderBottom:`1px solid ${C.border}`, 
        padding: isMobile ? '12px 16px' : '16px 20px',
        display:'flex', alignItems:'center', gap: isMobile ? 12 : 16
      }}>
        <button 
          onClick={onBack || (() => navigate(-1))}
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
            Case Conference - {student.name}
          </div>
          <div style={{ fontSize: isMobile ? 10 : 12, color:C.muted }}>
            {studentClass?.subject} · Grade {student.grade}%
          </div>
        </div>

        <div style={{ display:'flex', gap:8 }}>
          <button
            onClick={handleSaveConference}
            style={{
              background:C.green, color:'#fff', border:'none', borderRadius:8,
              padding: isMobile ? '6px 12px' : '8px 16px', 
              fontSize: isMobile ? 10 : 12, fontWeight:600, cursor:'pointer'
            }}
          >
            Save
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
              <tab.icon size={isMobile ? 14 : 16} color={activeTab === tab.id ? C.teal : C.muted} />
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
      <div style={{ padding: isMobile ? '16px' : '20px' }}>
        {activeTab === 'agenda' && (
          <div>
            <h3 style={{ color:C.text, marginBottom:16 }}>Meeting Agenda</h3>
            
            {/* Template Selection */}
            <div style={{ marginBottom:24 }}>
              <label style={{ color:C.soft, fontSize:12, marginBottom:8, display:'block' }}>
                Quick Start Templates
              </label>
              <div style={{ 
                display:'grid', 
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap:12 
              }}>
                {AGENDA_TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    style={{
                      background: selectedTemplate === template.id ? C.teal + '20' : C.inner,
                      border: selectedTemplate === template.id ? `2px solid ${C.teal}` : `1px solid ${C.border}`,
                      borderRadius:8,
                      padding:12,
                      cursor:'pointer',
                      textAlign:'left'
                    }}
                  >
                    <div style={{ color:C.text, fontWeight:600, marginBottom:4 }}>
                      {template.name}
                    </div>
                    <div style={{ color:C.muted, fontSize:11 }}>
                      {template.items.length} items
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Agenda Items */}
            <div style={{ marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <h4 style={{ color:C.text, margin:0 }}>Agenda Items</h4>
                <button
                  onClick={handleAddAgendaItem}
                  style={{
                    background:C.blue, color:'#fff', border:'none', borderRadius:6,
                    padding:'6px 12px', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:6
                  }}
                >
                  <Plus size={14} />
                  Add Item
                </button>
              </div>

              {agendaItems.length === 0 ? (
                <div style={{ 
                  background:C.inner, border:`1px solid ${C.border}`, borderRadius:8, 
                  padding:20, textAlign:'center', color:C.muted 
                }}>
                  No agenda items yet. Add items manually or use a template.
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {agendaItems.map(item => (
                    <div key={item.id} style={{
                      background:C.inner, border:`1px solid ${C.border}`, borderRadius:8,
                      padding:12, display:'flex', alignItems:'center', gap:12
                    }}>
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={(e) => {
                          setAgendaItems(prev => 
                            prev.map(i => i.id === item.id ? { ...i, completed: e.target.checked } : i)
                          )
                        }}
                        style={{ cursor:'pointer' }}
                      />
                      <span style={{ 
                        flex:1, 
                        color: item.completed ? C.muted : C.text,
                        textDecoration: item.completed ? 'line-through' : 'none'
                      }}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'prep' && meetingPrep && (
          <div>
            <h3 style={{ color:C.text, marginBottom:16 }}>Meeting Preparation Packet</h3>
            <div style={{ 
              background:C.inner, border:`1px solid ${C.border}`, borderRadius:12, 
              padding:20 
            }}>
              <div style={{ marginBottom:16 }}>
                <h4 style={{ color:C.text, marginBottom:8 }}>Student Overview</h4>
                <p style={{ color:C.soft, lineHeight:1.5 }}>
                  {meetingPrep.studentOverview || 'Comprehensive student data prepared for review.'}
                </p>
              </div>

              <div style={{ marginBottom:16 }}>
                <h4 style={{ color:C.text, marginBottom:8 }}>Key Discussion Points</h4>
                <ul style={{ color:C.soft, lineHeight:1.5, paddingLeft:20 }}>
                  {(meetingPrep.keyPoints || [
                    'Academic performance trends',
                    'Behavioral observations',
                    'Intervention effectiveness',
                    'Parent communication history'
                  ]).map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 style={{ color:C.text, marginBottom:8 }}>Recommended Actions</h4>
                <ul style={{ color:C.soft, lineHeight:1.5, paddingLeft:20 }}>
                  {(meetingPrep.recommendations || [
                    'Review current intervention strategies',
                    'Consider additional support services',
                    'Schedule follow-up meeting',
                    'Update parent communication plan'
                  ]).map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div>
            <h3 style={{ color:C.text, marginBottom:16 }}>Live Meeting Notes</h3>
            <textarea
              value={meetingNotes}
              onChange={(e) => setMeetingNotes(e.target.value)}
              placeholder="Take notes during the meeting..."
              style={{
                width:'100%', minHeight: isMobile ? 200 : 300,
                background:C.inner, border:`1px solid ${C.border}`, borderRadius:8,
                padding:16, color:C.text, fontSize:14, lineHeight:1.5,
                resize:'vertical'
              }}
            />
            
            <div style={{ marginTop:16, display:'flex', gap:12 }}>
              <button
                onClick={() => setShowAI(true)}
                style={{
                  background:C.purple, color:'#fff', border:'none', borderRadius:8,
                  padding:'10px 16px', fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', gap:8
                }}
              >
                <Brain size={16} />
                AI Assistant
              </button>
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <h3 style={{ color:C.text, margin:0 }}>Action Items</h3>
              <button
                onClick={handleAddActionItem}
                style={{
                  background:C.blue, color:'#fff', border:'none', borderRadius:6,
                  padding:'6px 12px', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:6
                }}
              >
                <Plus size={14} />
                Add Action
              </button>
            </div>

            {actionItems.length === 0 ? (
              <div style={{ 
                background:C.inner, border:`1px solid ${C.border}`, borderRadius:8, 
                padding:20, textAlign:'center', color:C.muted 
              }}>
                No action items yet. Add items to track follow-up tasks.
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {actionItems.map(item => (
                  <CaseActionItem
                    key={item.id}
                    item={item}
                    onUpdate={(updates) => handleUpdateActionItem(item.id, updates)}
                    onDelete={() => handleDeleteActionItem(item.id)}
                    isMobile={isMobile}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'attendance' && (
          <div>
            <h3 style={{ color:C.text, marginBottom:16 }}>Meeting Attendance</h3>
            
            <div style={{ marginBottom:24 }}>
              <h4 style={{ color:C.text, marginBottom:12 }}>Add Attendees</h4>
              <div style={{ 
                display:'grid', 
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap:12 
              }}>
                {/* Student */}
                <button
                  onClick={() => {
                    const isAttending = attendance.some(a => a.id === student.id && a.type === 'student')
                    if (isAttending) {
                      setAttendance(prev => prev.filter(a => !(a.id === student.id && a.type === 'student')))
                    } else {
                      setAttendance(prev => [...prev, {
                        id: student.id,
                        name: student.name,
                        type: 'student',
                        attended: true
                      }])
                    }
                  }}
                  style={{
                    background: attendance.some(a => a.id === student.id && a.type === 'student') ? C.green + '20' : C.inner,
                    border: attendance.some(a => a.id === student.id && a.type === 'student') ? `2px solid ${C.green}` : `1px solid ${C.border}`,
                    borderRadius:8, padding:12, cursor:'pointer', textAlign:'left'
                  }}
                >
                  <div style={{ color:C.text, fontWeight:600, marginBottom:4 }}>👤 Student</div>
                  <div style={{ color:C.soft, fontSize:12 }}>{student.name}</div>
                </button>

                {/* Parents */}
                {getParentsForStudents([parseInt(studentId)]).map(parent => (
                  <button
                    key={parent.id}
                    onClick={() => {
                      const isAttending = attendance.some(a => a.id === parent.id && a.type === 'parent')
                      if (isAttending) {
                        setAttendance(prev => prev.filter(a => !(a.id === parent.id && a.type === 'parent')))
                      } else {
                        setAttendance(prev => [...prev, {
                          id: parent.id,
                          name: parent.name,
                          type: 'parent',
                          attended: true
                        }])
                      }
                    }}
                    style={{
                      background: attendance.some(a => a.id === parent.id && a.type === 'parent') ? C.blue + '20' : C.inner,
                      border: attendance.some(a => a.id === parent.id && a.type === 'parent') ? `2px solid ${C.blue}` : `1px solid ${C.border}`,
                      borderRadius:8, padding:12, cursor:'pointer', textAlign:'left'
                    }}
                  >
                    <div style={{ color:C.text, fontWeight:600, marginBottom:4 }}>👨‍👩‍👧‍👦 Parent</div>
                    <div style={{ color:C.soft, fontSize:12 }}>{parent.name}</div>
                  </button>
                ))}

                {/* Teachers */}
                {getTeachersForStudents([parseInt(studentId)]).map(teacher => (
                  <button
                    key={teacher.id}
                    onClick={() => {
                      const isAttending = attendance.some(a => a.id === teacher.id && a.type === 'teacher')
                      if (isAttending) {
                        setAttendance(prev => prev.filter(a => !(a.id === teacher.id && a.type === 'teacher')))
                      } else {
                        setAttendance(prev => [...prev, {
                          id: teacher.id,
                          name: teacher.name,
                          type: 'teacher',
                          attended: true
                        }])
                      }
                    }}
                    style={{
                      background: attendance.some(a => a.id === teacher.id && a.type === 'teacher') ? C.teal + '20' : C.inner,
                      border: attendance.some(a => a.id === teacher.id && a.type === 'teacher') ? `2px solid ${C.teal}` : `1px solid ${C.border}`,
                      borderRadius:8, padding:12, cursor:'pointer', textAlign:'left'
                    }}
                  >
                    <div style={{ color:C.text, fontWeight:600, marginBottom:4 }}>🧑‍🏫 Teacher</div>
                    <div style={{ color:C.soft, fontSize:12 }}>{teacher.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Attendance List */}
            {attendance.length > 0 && (
              <div>
                <h4 style={{ color:C.text, marginBottom:12 }}>Current Attendees ({attendance.length})</h4>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {attendance.map(attendee => (
                    <div key={`${attendee.type}-${attendee.id}`} style={{
                      background:C.inner, border:`1px solid ${C.border}`, borderRadius:8,
                      padding:12, display:'flex', alignItems:'center', justifyContent:'space-between'
                    }}>
                      <div>
                        <div style={{ color:C.text, fontWeight:600 }}>{attendee.name}</div>
                        <div style={{ color:C.muted, fontSize:12, textTransform:'capitalize' }}>
                          {attendee.type}
                        </div>
                      </div>
                      <button
                        onClick={() => setAttendance(prev => prev.filter(a => !(a.id === attendee.id && a.type === attendee.type)))}
                        style={{
                          background:C.red + '20', color:C.red, border:'none', borderRadius:4,
                          padding:'4px 8px', fontSize:11, cursor:'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div>
            <h3 style={{ color:C.text, marginBottom:16 }}>Student Support Timeline</h3>
            <StudentSupportTimeline studentId={studentId} />
          </div>
        )}

        {activeTab === 'summary' && (
          <div>
            <h3 style={{ color:C.text, marginBottom:16 }}>Meeting Summary</h3>
            
            <div style={{ 
              display:'grid', 
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', 
              gap:16, marginBottom:24 
            }}>
              <button
                onClick={handleGenerateParentSummary}
                style={{
                  background:C.blue, color:'#fff', border:'none', borderRadius:8,
                  padding:16, cursor:'pointer', textAlign:'left'
                }}
              >
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                  <Users size={20} />
                  <span style={{ fontWeight:600 }}>Parent-Friendly Summary</span>
                </div>
                <p style={{ fontSize:12, opacity:0.9, margin:0 }}>
                  Generate a clear, positive summary for parents
                </p>
              </button>

              <button
                onClick={handleGenerateInternalSummary}
                style={{
                  background:C.purple, color:'#fff', border:'none', borderRadius:8,
                  padding:16, cursor:'pointer', textAlign:'left'
                }}
              >
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                  <FileText size={20} />
                  <span style={{ fontWeight:600 }}>Internal Summary</span>
                </div>
                <p style={{ fontSize:12, opacity:0.9, margin:0 }}>
                  Generate detailed internal notes for staff
                </p>
              </button>
            </div>

            {/* Send Options */}
            <div style={{ 
              background:C.inner, border:`1px solid ${C.border}`, borderRadius:12, 
              padding:20 
            }}>
              <h4 style={{ color:C.text, marginBottom:16 }}>Send Meeting Summary</h4>
              <div style={{ 
                display:'grid', 
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', 
                gap:12 
              }}>
                <button
                  onClick={() => handleSendSummary('parent')}
                  style={{
                    background:C.teal, color:'#fff', border:'none', borderRadius:8,
                    padding:12, cursor:'pointer', display:'flex', alignItems:'center', gap:8
                  }}
                >
                  <Send size={16} />
                  Send to Parents
                </button>
                <button
                  onClick={() => handleSendSummary('internal')}
                  style={{
                    background:C.amber, color:'#fff', border:'none', borderRadius:8,
                    padding:12, cursor:'pointer', display:'flex', alignItems:'center', gap:8
                  }}
                >
                  <Send size={16} />
                  Send to Team
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Assistant Modal */}
      {showAI && (
        <AIAssistantPanel
          onClose={() => setShowAI(false)}
          context={`case-conference-${studentId}`}
          title="AI Case Conference Assistant"
        />
      )}

      {/* Parent AI Assistant Modal */}
      {showParentAI && (
        <ParentAIAssistantPanel
          onClose={() => setShowParentAI(false)}
          student={student}
        />
      )}
    </div>
  )
}
