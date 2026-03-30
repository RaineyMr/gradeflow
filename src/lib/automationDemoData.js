// src/lib/automationDemoData.js
// Demo data for automation engine testing and development

export const demoAutomationFollowUps = [
  {
    id: 'followup-note-1',
    type: 'follow-up',
    title: 'Follow up with Marcus Thompson',
    description: 'Check in on academic intervention from 5 days ago',
    category: 'intervention',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'medium',
    source: 'support-note',
    sourceId: 'note-1',
    studentId: 1,
    studentName: 'Marcus Thompson',
    actions: ['complete', 'snooze', 'dismiss', 'convert-to-log']
  },
  {
    id: 'followup-note-2',
    type: 'follow-up',
    title: 'Follow up with Zoe Anderson',
    description: 'Review attendance intervention from 3 days ago',
    category: 'attendance',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'high',
    source: 'support-note',
    sourceId: 'note-2',
    studentId: 2,
    studentName: 'Zoe Anderson',
    actions: ['complete', 'snooze', 'dismiss', 'convert-to-log']
  }
]

export const demoAutomationRiskTasks = [
  {
    id: 'risk-1',
    type: 'risk-triggered',
    title: 'Risk Alert: Marcus Thompson',
    description: 'Student is failing - immediate intervention needed',
    category: 'grades',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'high',
    source: 'risk-analysis',
    sourceId: 1,
    studentId: 1,
    studentName: 'Marcus Thompson',
    riskFactors: ['failing-grade', 'no-recent-support'],
    actions: ['complete', 'snooze', 'dismiss', 'convert-to-log', 'convert-to-parent-message']
  },
  {
    id: 'risk-2',
    type: 'risk-triggered',
    title: 'Risk Alert: Zoe Anderson',
    description: 'Student has poor attendance - outreach needed',
    category: 'attendance',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'high',
    source: 'risk-analysis',
    sourceId: 2,
    studentId: 2,
    studentName: 'Zoe Anderson',
    riskFactors: ['poor-attendance', 'at-risk-grade'],
    actions: ['complete', 'snooze', 'dismiss', 'convert-to-log', 'convert-to-parent-message']
  },
  {
    id: 'risk-3',
    type: 'risk-triggered',
    title: 'Risk Alert: Liam Martinez',
    description: 'Student is at risk academically - check-in recommended',
    category: 'grades',
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'medium',
    source: 'risk-analysis',
    sourceId: 3,
    studentId: 3,
    studentName: 'Liam Martinez',
    riskFactors: ['at-risk-grade'],
    actions: ['complete', 'snooze', 'dismiss', 'convert-to-log', 'convert-to-parent-message']
  }
]

export const demoAutomationParentTemplates = [
  {
    id: 'template-positive-1',
    type: 'parent-template',
    title: 'Positive Update - Sofia Rodriguez',
    description: 'Share good news about student progress',
    category: 'parent comms',
    template: {
      subject: 'Great Progress Update - Sofia Rodriguez',
      body: 'Dear Parent/Guardian,\n\nI\'m excited to share that Sofia has shown wonderful progress recently! Her current grade of 82% reflects her hard work and dedication.\n\nHighlights:\n• Positive improvement trend\n• Strong effort in class\n• Great attitude toward learning\n\nPlease continue to encourage Sofia at home. Let\'s keep this momentum going!\n\nBest regards,\nSupport Staff',
      tone: 'positive'
    },
    studentId: 4,
    studentName: 'Sofia Rodriguez',
    actions: ['use-template', 'dismiss']
  },
  {
    id: 'template-concern-1',
    type: 'parent-template',
    title: 'Concern Alert - Marcus Thompson',
    description: 'Address academic concerns with parents',
    category: 'parent comms',
    template: {
      subject: 'Checking In - Marcus Thompson',
      body: 'Dear Parent/Guardian,\n\nI\'m reaching out regarding Marcus\'s current academic progress. His current grade is 58%, and I want to work together to support his success.\n\nI\'d like to schedule a time to discuss:\n• Current challenges in class\n• Support strategies we can implement\n• Resources available for extra help\n\nPlease let me know what time works best for you to connect this week.\n\nBest regards,\nSupport Staff',
      tone: 'concerned'
    },
    studentId: 1,
    studentName: 'Marcus Thompson',
    actions: ['use-template', 'dismiss']
  }
]

export const demoAutomationCaseloadAlerts = [
  {
    id: 'caseload-high',
    type: 'caseload-alert',
    title: 'High Caseload Volume',
    description: 'You have 28 students assigned. Consider prioritizing critical cases.',
    category: 'caseload',
    priority: 'medium',
    metrics: { totalStudents: 28, criticalStudents: 8, atRiskStudents: 12 },
    actions: ['acknowledge', 'dismiss']
  },
  {
    id: 'caseload-critical-ratio',
    type: 'caseload-alert',
    title: 'High Critical Student Ratio',
    description: '8 of 28 students (29%) are critical. Immediate attention needed.',
    category: 'caseload',
    priority: 'high',
    metrics: { totalStudents: 28, criticalStudents: 8, atRiskStudents: 12 },
    actions: ['acknowledge', 'dismiss']
  },
  {
    id: 'caseload-no-contact',
    type: 'caseload-alert',
    title: 'Students Without Recent Contact',
    description: '6 students haven\'t had documented support in 2+ weeks.',
    category: 'caseload',
    priority: 'medium',
    metrics: { studentsWithoutContact: 6 },
    studentList: [
      { id: 5, name: 'Jordan Williams' },
      { id: 6, name: 'Emma Davis' },
      { id: 7, name: 'Noah Johnson' }
    ],
    actions: ['acknowledge', 'dismiss', 'view-students']
  }
]

export const demoAutomationGroupSuggestions = [
  {
    id: 'group-inactive-1',
    type: 'group-suggestion',
    title: 'Inactive Group: Math Support',
    description: 'No activity in Math Support for over 30 days',
    category: 'groups',
    priority: 'medium',
    groupId: 'group-1',
    groupName: 'Math Support',
    suggestion: 'Consider scheduling a group check-in or dissolving inactive groups',
    actions: ['schedule-meeting', 'review-group', 'dismiss']
  },
  {
    id: 'group-small-1',
    type: 'group-suggestion',
    title: 'Small Group: Reading Intervention',
    description: 'Reading Intervention has only 2 members',
    category: 'groups',
    priority: 'low',
    groupId: 'group-2',
    groupName: 'Reading Intervention',
    suggestion: 'Consider adding more members or merging with similar groups',
    actions: ['add-members', 'merge-group', 'dismiss']
  },
  {
    id: 'group-suggested-failing',
    type: 'group-suggestion',
    title: 'Suggested Group: Academic Recovery',
    description: '4 students could benefit from a failing support group',
    category: 'groups',
    priority: 'low',
    suggestion: 'Create a new support group for these students',
    studentList: [
      { id: 1, name: 'Marcus Thompson' },
      { id: 2, name: 'Zoe Anderson' },
      { id: 3, name: 'Liam Martinez' },
      { id: 8, name: 'Olivia Wilson' }
    ],
    actions: ['create-group', 'dismiss']
  }
]

export const demoAutomationMeetingPrep = {
  id: 'meeting-prep-1',
  type: 'meeting-prep',
  title: 'Meeting Prep: Marcus Thompson',
  description: 'Comprehensive packet for parent/teacher meeting',
  category: 'meeting',
  studentId: 1,
  studentName: 'Marcus Thompson',
  generatedAt: new Date().toISOString(),
  sections: {
    overview: {
      currentGrade: 58,
      gradeTrend: 'down',
      attendanceRate: 85,
      riskFactors: ['failing-grade', 'poor-attendance']
    },
    recentInterventions: [
      {
        type: 'academic',
        startDate: '2024-03-01',
        status: 'active',
        progress: 'Some improvement noted, but more support needed'
      }
    ],
    recentNotes: [
      {
        date: '2024-03-25',
        category: 'academic',
        content: 'Student participated well in tutoring session',
        author: 'Support Staff'
      }
    ],
    talkingPoints: [
      'Current academic standing: 58%',
      'Areas needing improvement',
      'Current intervention strategies',
      'Home support strategies',
      'Next steps and goals'
    ],
    recommendedActions: [
      'Review current progress data',
      'Discuss intervention effectiveness',
      'Set realistic goals',
      'Establish communication plan',
      'Schedule follow-up meeting'
    ]
  },
  actions: ['download-packet', 'email-packet', 'dismiss']
}

export const demoAutomationWeeklySummary = {
  id: 'weekly-summary-2024-03-30',
  type: 'weekly-summary',
  title: 'Weekly Summary - 3/30/2024',
  description: 'Overview of support activities this week',
  category: 'summary',
  weekStart: '2024-03-24',
  weekEnd: '2024-03-30',
  metrics: {
    totalStudents: 28,
    criticalStudents: 8,
    atRiskStudents: 12,
    notesAdded: 15,
    activeInterventions: 6,
    completedInterventions: 2,
    notesByCategory: {
      academic: 8,
      behavioral: 3,
      attendance: 4
    }
  },
  highlights: [
    '15 support notes documented',
    '2 interventions completed',
    '8 students require critical attention',
    'Most common focus: academic'
  ],
  upcomingPriorities: [
    'Follow up with critical students',
    'Review intervention progress',
    'Schedule parent meetings as needed',
    'Update documentation for active cases'
  ],
  actions: ['download-summary', 'email-summary', 'dismiss']
}

// Helper function to get demo data by type
export function getDemoAutomationData(type) {
  switch (type) {
    case 'followUps':
      return demoAutomationFollowUps
    case 'riskTasks':
      return demoAutomationRiskTasks
    case 'parentTemplates':
      return demoAutomationParentTemplates
    case 'caseloadAlerts':
      return demoAutomationCaseloadAlerts
    case 'groupSuggestions':
      return demoAutomationGroupSuggestions
    case 'meetingPrep':
      return demoAutomationMeetingPrep
    case 'weeklySummary':
      return demoAutomationWeeklySummary
    default:
      return null
  }
}
