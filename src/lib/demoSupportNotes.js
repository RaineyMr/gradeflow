export const demoSupportNotes = [
  // support@houstonisd.org (Ms. Carter) assigned students (demo students 1-3)
  {
    id: 'note1-academic',
    student_id: 1, // Aaliyah Brooks
    staff_id: 'support-staff-1',
    note_type: 'academic',
    content: 'Aaliyah struggling with fraction equivalence. Needs visual aids and more practice with fraction strips.',
    visibility: 'staff-only',
    created_at: '2024-10-15T10:30:00Z',
    updated_at: '2024-10-15T10:30:00Z',
    staff: { name: 'Ms. Carter' }
  },
  {
    id: 'note2-behavior',
    student_id: 2, // Marcus Thompson
    staff_id: 'support-staff-1',
    note_type: 'behavior',
    content: 'Marcus disengaged during group work today. Spoke with him privately - mentioned home stress. Referred to counselor.',
    visibility: 'staff-only',
    created_at: '2024-10-14T14:20:00Z',
    updated_at: '2024-10-14T14:20:00Z',
    staff: { name: 'Ms. Carter' }
  },
  {
    id: 'note3-wellness',
    student_id: 3, // Sofia Rodriguez
    staff_id: 'support-staff-1',
    note_type: 'wellness',
    content: 'Sofia reports improved sleep after starting bedtime routine. Academic focus better this week. Continue monitoring.',
    visibility: 'teachers',
    created_at: '2024-10-13T09:15:00Z',
    updated_at: '2024-10-13T09:15:00Z',
    staff: { name: 'Ms. Carter' }
  },
  {
    id: 'note4-intervention',
    student_id: 1,
    staff_id: 'support-staff-1',
    note_type: 'intervention',
    content: 'Started RTI math group for Aaliyah. 20min 3x/week. Teacher notified. Progress check in 3 weeks.',
    visibility: 'admin',
    created_at: '2024-10-12T16:45:00Z',
    updated_at: '2024-10-12T16:45:00Z',
    staff: { name: 'Ms. Carter' }
  },
  {
    id: 'note5-academic-marcus',
    student_id: 2,
    staff_id: 'support-staff-1',
    note_type: 'academic',
    content: 'Marcus completed first tutoring session. Understanding decimals better. Schedule weekly check-ins.',
    visibility: 'staff-only',
    created_at: '2024-10-10T11:00:00Z',
    updated_at: '2024-10-10T11:00:00Z',
    staff: { name: 'Ms. Carter' }
  }
]
