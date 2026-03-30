// src/pages/SupportStaffInsights.jsx
import React, { useState, useEffect } from 'react'
import { useStore } from '../lib/store'
import AnalyticsSummaryCard from '../components/support/AnalyticsSummaryCard'
import AIAssistantPanel from '../components/support/AIAssistantPanel'

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

const INSIGHT_SECTIONS = [
  {
    id: 'studentRisk',
    title: 'Student Risk Insights',
    icon: '⚠️',
    description: 'Students requiring immediate attention',
    color: 'red'
  },
  {
    id: 'groupInsights',
    title: 'Group Insights',
    icon: '👥',
    description: 'Performance and trends across support groups',
    color: 'blue'
  },
  {
    id: 'interventionInsights',
    title: 'Intervention Insights',
    icon: '🎯',
    description: 'Effectiveness and status of interventions',
    color: 'green'
  },
  {
    id: 'parentCommunication',
    title: 'Parent Communication Insights',
    icon: '💬',
    description: 'Communication patterns and engagement',
    color: 'purple'
  },
  {
    id: 'caseloadInsights',
    title: 'Caseload Insights',
    icon: '📋',
    description: 'Overall caseload management and distribution',
    color: 'amber'
  },
  {
    id: 'weeklySummary',
    title: 'AI "What to Know This Week"',
    icon: '🤖',
    description: 'Weekly AI-generated summary and priorities',
    color: 'teal'
  }
]

export default function SupportStaffInsights() {
  const {
    getStudentRiskInsights,
    getGroupInsights,
    getInterventionInsights,
    getParentCommunicationInsights,
    getCaseloadInsights,
    getWeeklyAISummary,
    getStudentsForSupportStaff,
    getSupportStaffGroups,
    interventionPlans,
    students
  } = useStore()

  const [insights, setInsights] = useState({})
  const [loading, setLoading] = useState(true)
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [selectedSection, setSelectedSection] = useState(null)

  useEffect(() => {
    loadInsights()
  }, [])

  async function loadInsights() {
    setLoading(true)
    try {
      const [
        studentRisk,
        groupInsights,
        interventionInsights,
        parentCommunication,
        caseloadInsights,
        weeklySummary
      ] = await Promise.all([
        getStudentRiskInsights?.() || getStudentRiskData(),
        getGroupInsights?.() || getGroupData(),
        getInterventionInsights?.() || getInterventionData(),
        getParentCommunicationInsights?.() || getParentCommunicationData(),
        getCaseloadInsights?.() || getCaseloadData(),
        getWeeklyAISummary?.() || getWeeklySummaryData()
      ])

      setInsights({
        studentRisk,
        groupInsights,
        interventionInsights,
        parentCommunication,
        caseloadInsights,
        weeklySummary
      })
    } catch (error) {
      console.error('Failed to load insights:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fallback data functions if store helpers don't exist
  function getStudentRiskData() {
    const atRiskStudents = students.filter(s => s.grade < 70 || s.flagged)
    const criticalStudents = students.filter(s => s.grade < 60)
    
    return {
      totalAtRisk: atRiskStudents.length,
      criticalCases: criticalStudents.length,
      trend: atRiskStudents.length > 5 ? 'up' : 'stable',
      recentAdditions: 2,
      topRiskFactors: ['Failing Grades', 'Poor Attendance', 'Missing Work'],
      breakdown: {
        academic: atRiskStudents.filter(s => s.grade < 70).length,
        behavioral: students.filter(s => s.flagged).length,
        attendance: Math.floor(atRiskStudents.length * 0.3)
      }
    }
  }

  function getGroupData() {
    const groups = getSupportStaffGroups()
    
    return {
      totalGroups: groups.length,
      activeGroups: groups.filter(g => g.student_count > 0).length,
      averageGroupSize: groups.length > 0 ? Math.round(groups.reduce((sum, g) => sum + (g.student_count || 0), 0) / groups.length) : 0,
      highPerformingGroups: 2,
      groupsNeedingAttention: 1,
      trend: 'stable',
      topPerformingGroups: groups.slice(0, 3).map(g => g.name),
      groupsAtRisk: groups.filter(g => g.name.includes('Intervention')).map(g => g.name)
    }
  }

  function getInterventionData() {
    const activePlans = interventionPlans.filter(p => p.status === 'active')
    const completedPlans = interventionPlans.filter(p => p.status === 'completed')
    
    return {
      totalInterventions: interventionPlans.length,
      activeInterventions: activePlans.length,
      completedInterventions: completedPlans.length,
      successRate: activePlans.length > 0 ? Math.round((completedPlans.length / interventionPlans.length) * 100) : 0,
      averageDuration: '6 weeks',
      trend: completedPlans.length > 5 ? 'up' : 'stable',
      interventionTypes: {
        academic: activePlans.filter(p => p.type === 'academic').length,
        behavioral: activePlans.filter(p => p.type === 'behavioral').length,
        attendance: activePlans.filter(p => p.type === 'attendance').length
      }
    }
  }

  function getParentCommunicationData() {
    return {
      totalMessages: 45,
      responseRate: 78,
      averageResponseTime: '2.3 days',
      positiveResponses: 32,
      concernRaised: 8,
      trend: 'up',
      communicationMethods: {
        email: 25,
        phone: 12,
        inPerson: 8
      }
    }
  }

  function getCaseloadData() {
    const supportStudents = getStudentsForSupportStaff()
    
    return {
      totalStudents: supportStudents.length,
      highNeeds: supportStudents.filter(s => s.grade < 60 || s.flagged).length,
      moderateNeeds: supportStudents.filter(s => s.grade >= 60 && s.grade < 75).length,
      lowNeeds: supportStudents.filter(s => s.grade >= 75).length,
      averageTimePerStudent: '2.5 hours/week',
      trend: 'stable',
      workloadDistribution: {
        direct: 60,
        indirect: 25,
        administrative: 15
      }
    }
  }

  function getWeeklySummaryData() {
    return {
      weekOf: new Date().toLocaleDateString(),
      keyHighlights: [
        '3 students showed significant improvement',
        '2 new intervention plans initiated',
        '5 parent meetings completed',
        'Group tutoring sessions increased engagement'
      ],
      priorities: [
        'Follow up with critical risk students',
        'Review intervention effectiveness',
        'Schedule parent conferences',
        'Update group rosters'
      ],
      upcomingDeadlines: [
        'Progress reports due Friday',
        'Intervention reviews Wednesday',
        'Team meeting Tuesday'
      ]
    }
  }

  function openAIForSection(sectionId, sectionTitle) {
    setSelectedSection({ id: sectionId, title: sectionTitle })
    setAiPanelOpen(true)
  }

  function renderInsightCards(sectionId, data) {
    if (!data) return null

    switch (sectionId) {
      case 'studentRisk':
        return (
          <>
            <AnalyticsSummaryCard
              title="Total At Risk"
              value={data.totalAtRisk}
              trend={data.trend}
              color="red"
              subtitle={`${data.criticalCases} critical cases`}
            />
            <AnalyticsSummaryCard
              title="Critical Cases"
              value={data.criticalCases}
              trend="down"
              color="red"
              subtitle="Immediate attention required"
            />
            <AnalyticsSummaryCard
              title="New This Week"
              value={data.recentAdditions}
              trend="up"
              color="amber"
              subtitle="Recently identified"
            />
          </>
        )

      case 'groupInsights':
        return (
          <>
            <AnalyticsSummaryCard
              title="Total Groups"
              value={data.totalGroups}
              trend={data.trend}
              color="blue"
              subtitle={`${data.activeGroups} active`}
            />
            <AnalyticsSummaryCard
              title="Avg Group Size"
              value={data.averageGroupSize}
              trend="stable"
              color="blue"
              subtitle="Students per group"
            />
            <AnalyticsSummaryCard
              title="Need Attention"
              value={data.groupsNeedingAttention}
              trend="down"
              color="amber"
              subtitle="Review recommended"
            />
          </>
        )

      case 'interventionInsights':
        return (
          <>
            <AnalyticsSummaryCard
              title="Active Interventions"
              value={data.activeInterventions}
              trend={data.trend}
              color="green"
              subtitle={`${data.completedInterventions} completed`}
            />
            <AnalyticsSummaryCard
              title="Success Rate"
              value={`${data.successRate}%`}
              trend="up"
              color="green"
              subtitle="Above target"
            />
            <AnalyticsSummaryCard
              title="Avg Duration"
              value={data.averageDuration}
              trend="down"
              color="blue"
              subtitle="Per intervention"
            />
          </>
        )

      case 'parentCommunication':
        return (
          <>
            <AnalyticsSummaryCard
              title="Total Messages"
              value={data.totalMessages}
              trend={data.trend}
              color="purple"
              subtitle="This month"
            />
            <AnalyticsSummaryCard
              title="Response Rate"
              value={`${data.responseRate}%`}
              trend="up"
              color="green"
              subtitle="Parent engagement"
            />
            <AnalyticsSummaryCard
              title="Avg Response Time"
              value={data.averageResponseTime}
              trend="down"
              color="blue"
              subtitle="Faster than last month"
            />
          </>
        )

      case 'caseloadInsights':
        return (
          <>
            <AnalyticsSummaryCard
              title="Total Students"
              value={data.totalStudents}
              trend={data.trend}
              color="amber"
              subtitle={`${data.highNeeds} high needs`}
            />
            <AnalyticsSummaryCard
              title="High Needs"
              value={data.highNeeds}
              trend="down"
              color="red"
              subtitle="Intensive support"
            />
            <AnalyticsSummaryCard
              title="Time/Student"
              value={data.averageTimePerStudent}
              trend="stable"
              color="blue"
              subtitle="Weekly average"
            />
          </>
        )

      case 'weeklySummary':
        return (
          <div style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: '20px',
            gridColumn: '1 / -1'
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>
              🤖 AI Weekly Summary
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.green, marginBottom: 8 }}>Key Highlights</div>
                <ul style={{ margin: 0, paddingLeft: 16, color: C.soft, fontSize: 11 }}>
                  {data.keyHighlights.map((highlight, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>{highlight}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.amber, marginBottom: 8 }}>Priorities</div>
                <ul style={{ margin: 0, paddingLeft: 16, color: C.soft, fontSize: 11 }}>
                  {data.priorities.map((priority, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>{priority}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.blue, marginBottom: 8 }}>Upcoming Deadlines</div>
                <ul style={{ margin: 0, paddingLeft: 16, color: C.soft, fontSize: 11 }}>
                  {data.upcomingDeadlines.map((deadline, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>{deadline}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
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
          <div>Loading insights...</div>
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
            📊 AI-Powered Insights Dashboard
          </h1>
          <p style={{
            fontSize: 14,
            color: C.muted,
            margin: 0
          }}>
            High-level intelligence layer for support staff decision-making
          </p>
        </div>
        <button
          onClick={() => setAiPanelOpen(true)}
          style={{
            padding: '12px 20px',
            background: C.blue,
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          🤖 AI Assistant
        </button>
      </div>

      {/* Insight Sections */}
      <div style={{ display: 'grid', gap: '32px' }}>
        {INSIGHT_SECTIONS.map(section => (
          <div key={section.id}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24 }}>{section.icon}</span>
                <div>
                  <h2 style={{
                    fontSize: 18,
                    fontWeight: 700,
                    margin: 0,
                    marginBottom: 4
                  }}>
                    {section.title}
                  </h2>
                  <p style={{
                    fontSize: 12,
                    color: C.muted,
                    margin: 0
                  }}>
                    {section.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => openAIForSection(section.id, section.title)}
                style={{
                  padding: '8px 16px',
                  background: C.inner,
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  color: C.soft,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = C.raised
                  e.target.style.color = C.text
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = C.inner
                  e.target.style.color = C.soft
                }}
              >
                🤖 AI Explain
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16
            }}>
              {renderInsightCards(section.id, insights[section.id])}
            </div>
          </div>
        ))}
      </div>

      {/* AI Assistant Panel */}
      <AIAssistantPanel
        isOpen={aiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
        initialContext={{
          section: selectedSection?.title,
          sectionId: selectedSection?.id,
          insights: selectedSection ? insights[selectedSection.id] : null
        }}
      />
    </div>
  )
}
