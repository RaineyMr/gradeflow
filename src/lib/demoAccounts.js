// ─── GradeFlow Demo Accounts ──────────────────────────────────────────────────
// Each role uses shades of their school colors throughout — no generic dark bg.
// Login page uses GradeFlow orange/blue only.

import { DEMO_SCHOOLS } from './store'

export const demoAccounts = {
  teacher: {
    id: '73f3eb26-d45d-477f-97e3-5831b5443e82',
    role: 'teacher',
    email: 'ms.rodriguez@hisd.edu',
    password: 'demo123',
    schoolName: 'Houston ISD',
    districtName: 'Houston Independent School District',
    school_id: 'lincoln-elementary', // Use existing Houston ISD school ID from store
    district_id: 'houston-isd', // Houston ISD district
    userName: 'Ms. Rodriguez',
    studentName: null,
    avatar: '🧑‍🏫',
    lang: 'en', // Default language
    gradeLevel: '5th Grade',
    subjects: ['Math', 'Science'],
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/Houston_ISD_logo.svg/200px-Houston_ISD_logo.svg.png',
    theme: {
      // Houston ISD: deep blue base, white accent, light text
      primary:        '#003057',
      secondary:      '#ffffff',
      accent:         '#ffffff',
      bg:             '#000d1f',
      card:           '#001830',
      inner:          '#002040',
      border:         '#003a6a',
      text:           '#e8edf5',
      muted:          '#6080a0',
      heroGradient:   'linear-gradient(135deg,#003057,#001830)',
      headerGradient: 'linear-gradient(135deg,#003057,#001020)',
      soft:           'rgba(0,48,87,0.18)',
      navActive:      '#003057',
      green:          '#22c97a',
      blue:           '#3b7ef4',
      amber:          '#f5a623',
      red:            '#f04a4a',
    },
  },

  student: {
    id: 'demo-student-houston',
    role: 'student',
    email: 'student@houstonisd.org',
    password: 'demo123',
    schoolName: 'Houston ISD',
    districtName: 'Houston Independent School District',
    school_id: 'lincoln-elementary', // Use existing Houston ISD school ID
    district_id: 'houston-isd', // Houston ISD district
    userName: 'Marcus Thompson',
    studentName: 'Marcus',
    avatar: '🎓',
    lang: 'en', // Default language
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/Houston_ISD_logo.svg/200px-Houston_ISD_logo.svg.png',
    theme: {
      // HISD: deep navy base, gold accent, light text
      primary:        '#003057',
      secondary:      '#B3A369',
      accent:         '#B3A369',
      bg:             '#000d1f',
      card:           '#001830',
      inner:          '#002040',
      border:         '#003a6a',
      text:           '#e8edf5',
      muted:          '#6080a0',
      heroGradient:   'linear-gradient(135deg,#003057,#001830)',
      headerGradient: 'linear-gradient(135deg,#003057,#001020)',
      soft:           'rgba(179,163,105,0.18)',
      navActive:      '#B3A369',
      green:          '#22c97a',
      blue:           '#B3A369',
      amber:          '#f5a623',
      red:            '#f04a4a',
    },
  },

  parent: {
    id: 'demo-parent-bellaire',
    role: 'parent',
    email: 'parent@bellaire.org',
    password: 'demo123',
    schoolName: 'Bellaire High School',
    districtName: 'Bellaire Parish School District',
    school_id: 'BELLAIRE-HS', // Use existing Bellaire school ID
    district_id: 'bellaire-parish', // Bellaire district
    userName: 'Sarah Johnson',
    studentName: 'Emma',
    avatar: '👪',
    lang: 'en', // Default language
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9b/KIPP_Foundation_logo.svg/200px-KIPP_Foundation_logo.svg.png',
    theme: {
      // Bellaire: deep crimson base, white accent, warm text
      primary:        '#C8102E',
      secondary:      '#ffffff',
      accent:         '#ffffff',
      bg:             '#0f0003',
      card:           '#1e0008',
      inner:          '#2c000e',
      border:         '#5a001a',
      text:           '#f8eaec',
      muted:          '#a06070',
      heroGradient:   'linear-gradient(135deg,#C8102E,#8b0a1f)',
      headerGradient: 'linear-gradient(135deg,#C8102E,#5a0010)',
      soft:           'rgba(200,16,46,0.18)',
      navActive:      '#C8102E',
      green:          '#22c97a',
      blue:           '#C8102E',
      amber:          '#f5a623',
      red:            '#f04a4a',
    },
  },

  admin: {
    id: 'demo-admin-lamar',
    role: 'admin',
    email: 'admin@lamarhs.org',
    password: 'demo123',
    schoolName: 'Lamar High School',
    districtName: 'Houston ISD',
    school_id: 'lamar-hs', // Corresponds to Lamar High School in store.js
    district_id: 'houston-isd', // Houston ISD district
    userName: 'Principal Carter',
    studentName: null,
    avatar: '🏫',
    lang: 'en', // Default language
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/Houston_ISD_logo.svg/200px-Houston_ISD_logo.svg.png',
    theme: {
      // Lamar: deep purple base, gold accent, light text
      primary:        '#461D7C',
      secondary:      '#FDD023',
      accent:         '#FDD023',
      bg:             '#080012',
      card:           '#120520',
      inner:          '#1c0830',
      border:         '#3a1560',
      text:           '#ede8f5',
      muted:          '#7060a0',
      heroGradient:   'linear-gradient(135deg,#461D7C,#2d1254)',
      headerGradient: 'linear-gradient(135deg,#461D7C,#1a0840)',
      soft:           'rgba(70,29,124,0.20)',
      navActive:      '#FDD023',
      green:          '#22c97a',
      blue:           '#FDD023',
      amber:          '#FDD023',
      red:            '#f04a4a',
    },
  },

  supportStaff: {
    id: 'demo-support-houston',
    role: 'supportStaff',
    email: 'support@houstonisd.org',
    password: 'demo123',
    schoolName: 'Houston ISD',
    districtName: 'Houston Independent School District',
    school_id: 'BELLAIRE-HS', // Corresponds to Bellaire High School in store.js
    district_id: 'houston-isd', // Houston ISD district
    userName: 'Ms. Carter',
    studentName: null,
    avatar: '📣',
    lang: 'en', // Default language
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/Houston_ISD_logo.svg/200px-Houston_ISD_logo.svg.png',
    theme: {
      primary:        '#003057',
      secondary:      '#B3A369',
      bg:             '#000d1f',
      card:           '#001830',
      inner:          '#002040',
      border:         '#003a6a',
      text:           '#e8edf5',
      muted:          '#6080a0',
      heroGradient:   'linear-gradient(135deg,#003057,#001830)',
      headerGradient: 'linear-gradient(135deg,#003057,#001020)',
      soft:           'rgba(179,163,105,0.18)',
      navActive:      '#B3A369',
      green:          '#22c97a',
      blue:           '#B3A369',
      amber:          '#f5a623',
      red:            '#f04a4a',
    },
  },
}

export const demoLoginList = [
  { role: 'teacher',      labelKey: 'teacher_demo',      email: 'ms.rodriguez@hisd.edu', password: 'demo123', school: 'Houston ISD' },
  { role: 'student',      labelKey: 'student_demo',     email: 'student@houstonisd.org',     password: 'demo123', school: 'Houston ISD' },
  { role: 'parent',       labelKey: 'parent_demo',       email: 'parent@bellaire.org',        password: 'demo123', school: 'Bellaire High School' },
  { role: 'admin',        labelKey: 'admin_demo',         email: 'admin@lamarhs.org',          password: 'demo123', school: 'Lamar High School' },
  { role: 'supportStaff', labelKey: 'support_staff_demo', email: 'support@houstonisd.org',     password: 'demo123', school: 'Houston ISD' },
]

export function getDemoAccountByRole(role) {
  return demoAccounts[role] || demoAccounts.teacher
}

export function getDemoAccountByCredentials(email, password, role) {
  const account = demoAccounts[role]
  if (!account) return null
  if (account.email === email && account.password === password) {
    // Attach full school object for standards system detection
    const school = DEMO_SCHOOLS.find(s => s.id === account.school_id)
    
    return {
      ...account,
      school: school || {
        id: account.school_id,
        district_id: account.district_id,
        name: account.schoolName
      }
    }
  }
  return null
}
