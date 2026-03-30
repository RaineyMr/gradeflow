// src/lib/automationEngine.js
// Rule-based automation layer for Support Staff workflow

/**
 * Generate follow-up reminders based on recent interactions and interventions
 * @param {Array} supportNotes - Recent support notes
 * @param {Array} interventions - Active interventions
 * @returns {Array} Array of reminder objects
 */
export function generateFollowUpReminders(supportNotes = [], interventions = []) {
  const reminders = []
  const today = new Date()
  
  // Generate reminders from recent support notes
  supportNotes.forEach(note => {
    if (note.requiresFollowUp && !note.followUpCompleted) {
      const noteDate = new Date(note.date)
      const daysSinceNote = Math.floor((today - noteDate) / (1000 * 60 * 60 * 24))
      
      if (daysSinceNote >= 3) {
        reminders.push({
          id: `followup-note-${note.id}`,
          type: 'follow-up',
          title: `Follow up with ${note.studentName}`,
          description: `Check in on ${note.category} intervention from ${daysSinceNote} days ago`,
          category: note.category || 'intervention',
          dueDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: daysSinceNote >= 7 ? 'high' : 'medium',
          source: 'support-note',
          sourceId: note.id,
          studentId: note.studentId,
          studentName: note.studentName,
          actions: ['complete', 'snooze', 'dismiss', 'convert-to-log']
        })
      }
    }
  })
  
  // Generate reminders from active interventions
  interventions.forEach(intervention => {
    if (intervention.status === 'active' && intervention.nextReview) {
      const reviewDate = new Date(intervention.nextReview)
      const daysUntilReview = Math.floor((reviewDate - today) / (1000 * 60 * 60 * 24))
      
      if (daysUntilReview <= 3 && daysUntilReview >= 0) {
        reminders.push({
          id: `followup-intervention-${intervention.id}`,
          type: 'follow-up',
          title: `Review ${intervention.type} intervention for ${intervention.studentName}`,
          description: `Scheduled review of ${intervention.type} intervention`,
          category: 'intervention',
          dueDate: intervention.nextReview,
          priority: daysUntilReview === 0 ? 'high' : 'medium',
          source: 'intervention',
          sourceId: intervention.id,
          studentId: intervention.studentId,
          studentName: intervention.studentName,
          actions: ['complete', 'snooze', 'dismiss', 'convert-to-log']
        })
      }
    }
  })
  
  return reminders.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
}

/**
 * Generate risk-triggered tasks based on student performance indicators
 * @param {Array} students - Student data with grades, attendance, etc.
 * @param {Array} supportNotes - Recent support notes
 * @returns {Array} Array of risk-triggered task objects
 */
export function generateRiskTriggeredTasks(students = [], supportNotes = []) {
  const tasks = []
  const today = new Date()
  
  students.forEach(student => {
    const riskFactors = []
    
    // Academic risk factors
    if (student.grade < 60) {
      riskFactors.push('failing-grade')
    } else if (student.grade < 70) {
      riskFactors.push('at-risk-grade')
    }
    
    // Attendance risk factors (if available)
    if (student.attendanceRate !== undefined) {
      if (student.attendanceRate < 80) {
        riskFactors.push('poor-attendance')
      } else if (student.attendanceRate < 90) {
        riskFactors.push('at-risk-attendance')
      }
    }
    
    // Recent intervention history
    const recentNotes = supportNotes.filter(note => 
      note.studentId === student.id && 
      new Date(note.date) > new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)
    )
    
    if (recentNotes.length === 0 && riskFactors.length > 0) {
      riskFactors.push('no-recent-support')
    }
    
    // Generate tasks based on risk factors
    if (riskFactors.length > 0) {
      const priority = riskFactors.includes('failing-grade') || riskFactors.includes('poor-attendance') ? 'high' : 'medium'
      
      let category = 'grades'
      let description = 'Student requires attention'
      
      if (riskFactors.includes('failing-grade')) {
        description = 'Student is failing - immediate intervention needed'
        category = 'grades'
      } else if (riskFactors.includes('poor-attendance')) {
        description = 'Student has poor attendance - outreach needed'
        category = 'attendance'
      } else if (riskFactors.includes('at-risk-grade')) {
        description = 'Student is at risk academically - check-in recommended'
        category = 'grades'
      } else if (riskFactors.includes('no-recent-support')) {
        description = 'Student has risk factors but no recent support documented'
        category = 'intervention'
      }
      
      tasks.push({
        id: `risk-${student.id}-${Date.now()}`,
        type: 'risk-triggered',
        title: `Risk Alert: ${student.name}`,
        description,
        category,
        dueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority,
        source: 'risk-analysis',
        sourceId: student.id,
        studentId: student.id,
        studentName: student.name,
        riskFactors,
        actions: ['complete', 'snooze', 'dismiss', 'convert-to-log', 'convert-to-parent-message']
      })
    }
  })
  
  return tasks.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
}

/**
 * Generate parent communication templates (non-AI)
 * @param {Array} students - Student data
 * @param {Array} supportNotes - Recent support notes
 * @returns {Array} Array of template objects
 */
export function generateParentTemplates(students = [], supportNotes = []) {
  const templates = []
  const today = new Date()
  
  students.forEach(student => {
    const recentNotes = supportNotes.filter(note => 
      note.studentId === student.id && 
      new Date(note.date) > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    )
    
    // Positive improvement template
    if (student.gradeTrend === 'up' && student.grade >= 80) {
      templates.push({
        id: `template-positive-${student.id}`,
        type: 'parent-template',
        title: `Positive Update - ${student.name}`,
        description: 'Share good news about student progress',
        category: 'parent comms',
        template: {
          subject: `Great Progress Update - ${student.name}`,
          body: `Dear Parent/Guardian,\n\nI'm excited to share that ${student.name} has shown wonderful progress recently! Their current grade of ${student.grade}% reflects their hard work and dedication.\n\nHighlights:\n• Positive improvement trend\n• Strong effort in class\n• Great attitude toward learning\n\nPlease continue to encourage ${student.name} at home. Let's keep this momentum going!\n\nBest regards,\nSupport Staff`,
          tone: 'positive'
        },
        studentId: student.id,
        studentName: student.name,
        actions: ['use-template', 'dismiss']
      })
    }
    
    // Concern template
    if (student.grade < 70) {
      templates.push({
        id: `template-concern-${student.id}`,
        type: 'parent-template',
        title: `Concern Alert - ${student.name}`,
        description: 'Address academic concerns with parents',
        category: 'parent comms',
        template: {
          subject: `Checking In - ${student.name}`,
          body: `Dear Parent/Guardian,\n\nI'm reaching out regarding ${student.name}'s current academic progress. Their current grade is ${student.grade}%, and I want to work together to support their success.\n\nI'd like to schedule a time to discuss:\n• Current challenges in class\n• Support strategies we can implement\n• Resources available for extra help\n\nPlease let me know what time works best for you to connect this week.\n\nBest regards,\nSupport Staff`,
          tone: 'concerned'
        },
        studentId: student.id,
        studentName: student.name,
        actions: ['use-template', 'dismiss']
      })
    }
    
    // Follow-up after intervention template
    const interventionNotes = recentNotes.filter(note => note.category === 'intervention')
    if (interventionNotes.length > 0) {
      templates.push({
        id: `template-intervention-${student.id}`,
        type: 'parent-template',
        title: `Intervention Update - ${student.name}`,
        description: 'Update parents on intervention progress',
        category: 'parent comms',
        template: {
          subject: `Intervention Progress Update - ${student.name}`,
          body: `Dear Parent/Guardian,\n\nI wanted to provide an update on ${student.name}'s progress with our recent support interventions.\n\nRecent interventions include:\n${interventionNotes.map(note => `• ${note.content.substring(0, 50)}...`).join('\n')}\n\nI'm monitoring ${student.name}'s progress closely and would be happy to discuss their current status and any additional support we can provide.\n\nBest regards,\nSupport Staff`,
          tone: 'informative'
        },
        studentId: student.id,
        studentName: student.name,
        actions: ['use-template', 'dismiss']
      })
    }
  })
  
  return templates
}

/**
 * Generate caseload monitoring alerts
 * @param {Array} students - All assigned students
 * @param {Array} supportNotes - Recent support notes
 * @returns {Array} Array of caseload alert objects
 */
export function generateCaseloadAlerts(students = [], supportNotes = []) {
  const alerts = []
  const today = new Date()
  
  // Overall caseload metrics
  const totalStudents = students.length
  const criticalStudents = students.filter(s => s.grade < 60).length
  const atRiskStudents = students.filter(s => s.grade >= 60 && s.grade < 70).length
  
  // High caseload alert
  if (totalStudents > 25) {
    alerts.push({
      id: 'caseload-high',
      type: 'caseload-alert',
      title: 'High Caseload Volume',
      description: `You have ${totalStudents} students assigned. Consider prioritizing critical cases.`,
      category: 'caseload',
      priority: 'medium',
      metrics: { totalStudents, criticalStudents, atRiskStudents },
      actions: ['acknowledge', 'dismiss']
    })
  }
  
  // High critical student ratio alert
  if (criticalStudents > totalStudents * 0.3) {
    alerts.push({
      id: 'caseload-critical-ratio',
      type: 'caseload-alert',
      title: 'High Critical Student Ratio',
      description: `${criticalStudents} of ${totalStudents} students (${Math.round(criticalStudents/totalStudents*100)}%) are critical. Immediate attention needed.`,
      category: 'caseload',
      priority: 'high',
      metrics: { totalStudents, criticalStudents, atRiskStudents },
      actions: ['acknowledge', 'dismiss']
    })
  }
  
  // Students without recent contact
  const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)
  const studentsWithoutRecentContact = students.filter(student => {
    const recentNotes = supportNotes.filter(note => 
      note.studentId === student.id && 
      new Date(note.date) > twoWeeksAgo
    )
    return recentNotes.length === 0
  })
  
  if (studentsWithoutRecentContact.length > 5) {
    alerts.push({
      id: 'caseload-no-contact',
      type: 'caseload-alert',
      title: 'Students Without Recent Contact',
      description: `${studentsWithoutRecentContact.length} students haven't had documented support in 2+ weeks.`,
      category: 'caseload',
      priority: 'medium',
      metrics: { studentsWithoutContact: studentsWithoutRecentContact.length },
      studentList: studentsWithoutRecentContact.map(s => ({ id: s.id, name: s.name })),
      actions: ['acknowledge', 'dismiss', 'view-students']
    })
  }
  
  return alerts
}

/**
 * Generate group maintenance suggestions
 * @param {Array} groups - Support groups
 * @param {Array} students - All students
 * @param {Array} supportNotes - Recent support notes
 * @returns {Array} Array of group suggestion objects
 */
export function generateGroupMaintenanceSuggestions(groups = [], students = [], supportNotes = []) {
  const suggestions = []
  const today = new Date()
  const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  groups.forEach(group => {
    const groupActivity = supportNotes.filter(note => 
      note.groupId === group.id && 
      new Date(note.date) > oneMonthAgo
    )
    
    // Inactive group alert
    if (groupActivity.length === 0) {
      suggestions.push({
        id: `group-inactive-${group.id}`,
        type: 'group-suggestion',
        title: `Inactive Group: ${group.name}`,
        description: `No activity in ${group.name} for over 30 days`,
        category: 'groups',
        priority: 'medium',
        groupId: group.id,
        groupName: group.name,
        suggestion: 'Consider scheduling a group check-in or dissolving inactive groups',
        actions: ['schedule-meeting', 'review-group', 'dismiss']
      })
    }
    
    // Small group suggestion
    if (group.students && group.students.length < 3) {
      suggestions.push({
        id: `group-small-${group.id}`,
        type: 'group-suggestion',
        title: `Small Group: ${group.name}`,
        description: `${group.name} has only ${group.students.length} members`,
        category: 'groups',
        priority: 'low',
        groupId: group.id,
        groupName: group.name,
        suggestion: 'Consider adding more members or merging with similar groups',
        actions: ['add-members', 'merge-group', 'dismiss']
      })
    }
    
    // Large group suggestion
    if (group.students && group.students.length > 8) {
      suggestions.push({
        id: `group-large-${group.id}`,
        type: 'group-suggestion',
        title: `Large Group: ${group.name}`,
        description: `${group.name} has ${group.students.length} members`,
        category: 'groups',
        priority: 'medium',
        groupId: group.id,
        groupName: group.name,
        suggestion: 'Consider splitting into smaller groups for more effective support',
        actions: ['split-group', 'dismiss']
      })
    }
  })
  
  // Suggested new groups based on common needs
  const studentsWithoutGroups = students.filter(student => 
    !groups.some(group => group.students && group.students.includes(student.id))
  )
  
  const studentsWithSimilarNeeds = {}
  studentsWithoutGroups.forEach(student => {
    const key = student.grade < 60 ? 'failing' : student.grade < 70 ? 'at-risk' : 'performing'
    if (!studentsWithSimilarNeeds[key]) {
      studentsWithSimilarNeeds[key] = []
    }
    studentsWithSimilarNeeds[key].push(student)
  })
  
  Object.entries(studentsWithSimilarNeeds).forEach(([need, studentList]) => {
    if (studentList.length >= 3) {
      suggestions.push({
        id: `group-suggested-${need}`,
        type: 'group-suggestion',
        title: `Suggested Group: ${need === 'failing' ? 'Academic Recovery' : need === 'at-risk' ? 'Study Skills' : 'Peer Tutoring'}`,
        description: `${studentList.length} students could benefit from a ${need} support group`,
        category: 'groups',
        priority: 'low',
        suggestion: 'Create a new support group for these students',
        studentList: studentList.map(s => ({ id: s.id, name: s.name })),
        actions: ['create-group', 'dismiss']
      })
    }
  })
  
  return suggestions
}

/**
 * Generate meeting prep packet for a specific student
 * @param {string} studentId - Student ID
 * @param {Array} students - Student data
 * @param {Array} supportNotes - Support notes for this student
 * @param {Array} interventions - Interventions for this student
 * @returns {Object} Meeting prep packet object
 */
export function generateMeetingPrepPacket(studentId, students = [], supportNotes = [], interventions = []) {
  const student = students.find(s => s.id === studentId)
  if (!student) return null
  
  const studentNotes = supportNotes.filter(note => note.studentId === studentId)
  const studentInterventions = interventions.filter(int => int.studentId === studentId)
  const recentNotes = studentNotes.filter(note => 
    new Date(note.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  )
  
  return {
    id: `meeting-prep-${studentId}`,
    type: 'meeting-prep',
    title: `Meeting Prep: ${student.name}`,
    description: 'Comprehensive packet for parent/teacher meeting',
    category: 'meeting',
    studentId,
    studentName: student.name,
    generatedAt: new Date().toISOString(),
    sections: {
      overview: {
        currentGrade: student.grade,
        gradeTrend: student.gradeTrend || 'stable',
        attendanceRate: student.attendanceRate || 'N/A',
        riskFactors: student.riskFactors || []
      },
      recentInterventions: studentInterventions.map(int => ({
        type: int.type,
        startDate: int.startDate,
        status: int.status,
        progress: int.progress || 'No progress noted'
      })),
      recentNotes: recentNotes.map(note => ({
        date: note.date,
        category: note.category,
        content: note.content.substring(0, 100) + (note.content.length > 100 ? '...' : ''),
        author: note.author
      })),
      talkingPoints: [
        `Current academic standing: ${student.grade}%`,
        student.gradeTrend === 'up' ? 'Positive progress to celebrate' : 'Areas needing improvement',
        studentInterventions.length > 0 ? 'Current intervention strategies' : 'Discuss intervention options',
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
}

/**
 * Generate weekly summary for support staff
 * @param {Array} students - All assigned students
 * @param {Array} supportNotes - Support notes from this week
 * @param {Array} interventions - All interventions
 * @returns {Object} Weekly summary object
 */
export function generateWeeklySummary(students = [], supportNotes = [], interventions = []) {
  const today = new Date()
  const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  const thisWeekNotes = supportNotes.filter(note => 
    new Date(note.date) >= weekStart
  )
  
  const totalStudents = students.length
  const criticalStudents = students.filter(s => s.grade < 60).length
  const atRiskStudents = students.filter(s => s.grade >= 60 && s.grade < 70).length
  
  const notesByCategory = {}
  thisWeekNotes.forEach(note => {
    if (!notesByCategory[note.category]) {
      notesByCategory[note.category] = 0
    }
    notesByCategory[note.category]++
  })
  
  const activeInterventions = interventions.filter(int => int.status === 'active').length
  const completedInterventions = interventions.filter(int => 
    int.status === 'completed' && new Date(int.completionDate) >= weekStart
  ).length
  
  return {
    id: `weekly-summary-${today.toISOString().split('T')[0]}`,
    type: 'weekly-summary',
    title: `Weekly Summary - ${today.toLocaleDateString()}`,
    description: 'Overview of support activities this week',
    category: 'summary',
    weekStart: weekStart.toISOString().split('T')[0],
    weekEnd: today.toISOString().split('T')[0],
    metrics: {
      totalStudents,
      criticalStudents,
      atRiskStudents,
      notesAdded: thisWeekNotes.length,
      activeInterventions,
      completedInterventions,
      notesByCategory
    },
    highlights: [
      `${thisWeekNotes.length} support notes documented`,
      `${completedInterventions} interventions completed`,
      `${criticalStudents} students require critical attention`,
      `Most common focus: ${Object.entries(notesByCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}`
    ],
    upcomingPriorities: [
      'Follow up with critical students',
      'Review intervention progress',
      'Schedule parent meetings as needed',
      'Update documentation for active cases'
    ],
    actions: ['download-summary', 'email-summary', 'dismiss']
  }
}
