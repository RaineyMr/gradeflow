// Demo data for support staff groups
export const demoSupportStaffGroups = [
  {
    id: 'group-reading-intervention',
    staff_id: 'support-staff-1',
    name: 'Reading Intervention Group',
    created_at: '2024-10-15T09:00:00Z'
  },
  {
    id: 'group-band-leaders',
    staff_id: 'support-staff-1', 
    name: 'Band Section Leaders',
    created_at: '2024-10-10T14:30:00Z'
  },
  {
    id: 'group-math-support',
    staff_id: 'support-staff-1',
    name: 'Math Intervention (58-74%)',
    created_at: '2024-10-08T11:15:00Z'
  }
]

export const demoGroupMembers = [
  // Reading Intervention: Marcus(2), Sofia(3)
  { id: 'mem1', group_id: 'group-reading-intervention', student_id: 2, created_at: '2024-10-15T09:05:00Z' },
  { id: 'mem2', group_id: 'group-reading-intervention', student_id: 3, created_at: '2024-10-15T09:05:00Z' },
  
  // Band Leaders: Aaliyah(1), Jordan(4)
  { id: 'mem3', group_id: 'group-band-leaders', student_id: 1, created_at: '2024-10-10T14:35:00Z' },
  { id: 'mem4', group_id: 'group-band-leaders', student_id: 4, created_at: '2024-10-10T14:35:00Z' },
  
  // Math Support: Marcus(2), Jordan(4)
  { id: 'mem5', group_id: 'group-math-support', student_id: 2, created_at: '2024-10-08T11:20:00Z' },
  { id: 'mem6', group_id: 'group-math-support', student_id: 4, created_at: '2024-10-08T11:20:00Z' }
]

export const demoStudentTrends = {
  1: [  // Aaliyah: stable/improving
    { student_id: 1, period_start: '2024-10-01', period_end: '2024-10-15', grade_avg: 93.5, participation_avg: 92, flags_count: 0, notes_count: 4, risk_level: 'low' },
    { student_id: 1, period_start: '2024-09-15', period_end: '2024-09-30', grade_avg: 91.2, participation_avg: 88, flags_count: 0, notes_count: 2, risk_level: 'low' }
  ],
  2: [  // Marcus: high risk, declining
    { student_id: 2, period_start: '2024-10-01', period_end: '2024-10-15', grade_avg: 58.3, participation_avg: 45, flags_count: 3, notes_count: 4, risk_level: 'critical' },
    { student_id: 2, period_start: '2024-09-15', period_end: '2024-09-30', grade_avg: 68.7, participation_avg: 72, flags_count: 1, notes_count: 2, risk_level: 'high' }
  ]
}

export const demoInterventionPlans = [
  {
    id: 'plan1-marcus-math',
    student_id: 2,
    staff_id: 'support-staff-1',
    goal: 'Marcus will improve math grade from 58% to 75% by end of quarter through targeted RTI',
    strategies: ['Daily 15min tutoring 4x/week', 'Visual aids for decimals/fractions', 'Parent communication weekly'],
    status: 'active',
    visibility: 'teachers',
    checkins: [
      { date: '2024-10-10', notes: 'First tutoring session: good engagement. Understanding decimals better.' },
      { date: '2024-10-17', notes: 'Week 2: 3/5 fraction equivalence correct. Progress toward goal.' }
    ],
    created_at: '2024-10-07T15:00:00Z',
    updated_at: '2024-10-17T11:00:00Z'
  },
  {
    id: 'plan2-sofia-reading',
    student_id: 3,
    staff_id: 'support-staff-1',
    goal: 'Sofia will improve reading comprehension from 72% to 85% using graphic organizers',
    strategies: ['After-school reading club 2x/week', 'Graphic organizer training', 'Teacher advance notice for responses'],
    status: 'active',
    visibility: 'staff-only',
    checkins: [{ date: '2024-10-17', notes: 'First club session attended. Practiced main idea/details.' }],
    created_at: '2024-10-17T14:00:00Z',
    updated_at: '2024-10-17T14:00:00Z'
  }
]

