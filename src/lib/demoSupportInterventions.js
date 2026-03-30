// src/lib/demoSupportInterventions.js
export const demoSupportInterventions = [
  {
    id: 'int-001',
    studentId: 1,
    type: 'academic',
    goal: 'Marcus will improve Math grade from 58% to 75% by end of quarter through targeted RTI support.',
    steps: [
      'Daily 15-min tutoring 4x per week with Ms. Carter',
      'Visual aids for fractions and decimals',
      'Weekly parent communication via phone or app',
      'Bi-weekly check-in with Math teacher Ms. Johnson',
    ],
    progressNotes: 'Week 1: Good engagement. Showing improvement on decimal problems. Week 2: 3/5 fraction problems correct — on track.',
    followUpDate: '2024-11-01',
    status: 'active',
    createdAt: '2024-10-07T15:00:00Z',
    updatedAt: '2024-10-17T11:00:00Z',
  },
  {
    id: 'int-002',
    studentId: 2,
    type: 'wellness',
    goal: 'Zoe will develop coping strategies for academic stress and improve attendance to 95%+ by end of month.',
    steps: [
      'Weekly check-in sessions with school counselor',
      'Breathing and mindfulness techniques introduced',
      'Parent conference scheduled for Oct 25',
      'Modified assignment deadlines approved by teachers',
    ],
    progressNotes: 'Initial session: Zoe opened up about home stress. Plan activated. Parent contacted.',
    followUpDate: '2024-10-25',
    status: 'active',
    createdAt: '2024-10-11T09:00:00Z',
    updatedAt: '2024-10-17T14:00:00Z',
  },
  {
    id: 'int-003',
    studentId: 3,
    type: 'academic',
    goal: 'Liam will submit all missing assignments and maintain 70%+ average by end of quarter.',
    steps: [
      'After-school homework help Tuesdays and Thursdays',
      'Assignment tracker shared with parent via GradeFlow',
      'Teacher check-in at end of each class period',
    ],
    progressNotes: 'Parent contacted Oct 14. No response yet. Will follow up via certified letter.',
    followUpDate: '2024-10-28',
    status: 'active',
    createdAt: '2024-10-14T10:00:00Z',
    updatedAt: '2024-10-14T10:00:00Z',
  },
]

export const INTERVENTION_TYPES = [
  { value: 'academic',      label: 'Academic Support',       icon: '📚' },
  { value: 'behavioral',    label: 'Behavioral Intervention', icon: '🎯' },
  { value: 'wellness',      label: 'Social-Emotional / Wellness', icon: '💚' },
  { value: 'attendance',    label: 'Attendance Intervention', icon: '📅' },
  { value: 'communication', label: 'Family Communication Plan', icon: '👪' },
]

