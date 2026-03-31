// ─── GradeFlow Demo Accounts ──────────────────────────────────────────────────
// Each role uses shades of their school colors throughout — no generic dark bg.
// Login page uses GradeFlow orange/blue only.

export const demoAccounts = {
  teacher: {
    role: 'teacher',
    email: 'teacher@kippneworleans.org',
    password: 'demo123',
    schoolName: 'KIPP New Orleans',
    districtName: 'KIPP New Orleans',
    userName: 'Ms. Johnson',
    studentName: null,
    avatar: '👩‍🏫',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9b/KIPP_Foundation_logo.svg/200px-KIPP_Foundation_logo.svg.png',
    theme: {
      // KIPP: black base, red accent, white text
      primary:        '#BA0C2F',
      secondary:      '#ffffff',
      accent:         '#BA0C2F',
      bg:             '#0a0000',
      card:           '#1a0005',
      inner:          '#280008',
      border:         '#4a0018',
      text:           '#f5e8ea',
      muted:          '#9a6070',
      heroGradient:   'linear-gradient(135deg,#BA0C2F,#7a0820)',
      headerGradient: 'linear-gradient(135deg,#BA0C2F,#000000)',
      soft:           'rgba(186,12,47,0.18)',
      navActive:      '#BA0C2F',
      green:          '#22c97a',
      blue:           '#3b7ef4',
      amber:          '#f5a623',
      red:            '#f04a4a',
    },
  },

  student: {
    role: 'student',
    email: 'student@houstonisd.org',
    password: 'demo123',
    schoolName: 'Distrito Escolar de Houston',
    districtName: 'Distrito Escolar Independiente de Houston',
    userName: 'Marcus Thompson',
    studentName: 'Marcus',
    avatar: '🎓',
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
    role: 'parent',
    email: 'parent@bellaire.org',
    password: 'demo123',
    schoolName: 'Escuela Secundaria Bellaire',
    districtName: 'Distrito Escolar Independiente de Houston',
    userName: 'Ms. Thompson',
    studentName: 'Marcus',
    avatar: '👨‍👩‍👧',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/Houston_ISD_logo.svg/200px-Houston_ISD_logo.svg.png',
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
      blue:           '#3b7ef4',
      amber:          '#f5a623',
      red:            '#f04a4a',
    },
  },

  admin: {
    role: 'admin',
    email: 'admin@lamarhs.org',
    password: 'demo123',
    schoolName: 'Escuela Secundaria Lamar',
    districtName: 'Distrito Escolar Independiente de Houston',
    userName: 'Principal Carter',
    studentName: null,
    avatar: '🏫',
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
    role: 'supportStaff',
    email: 'support@houstonisd.org',
    password: 'demo123',
    schoolName: 'Distrito Escolar de Houston',
    districtName: 'Distrito Escolar Independiente de Houston',
    userName: 'Ms. Carter',
    studentName: null,
    avatar: '📣',
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
  { role: 'teacher',      label: '🧑‍🏫 Teacher Demo',      email: 'teacher@kippneworleans.org', password: 'demo123', school: 'KIPP New Orleans' },
  { role: 'student',      label: '🎓 Student Demo',     email: 'student@houstonisd.org',     password: 'demo123', school: 'Houston ISD' },
  { role: 'parent',       label: '👨‍👩‍👧 Parent Demo',   email: 'parent@bellaire.org',        password: 'demo123', school: 'Bellaire High School' },
  { role: 'admin',        label: '🏫 Admin Demo',         email: 'admin@lamarhs.org',          password: 'demo123', school: 'Lamar High School' },
  { role: 'supportStaff', label: '📣 Support Staff Demo', email: 'support@houstonisd.org',     password: 'demo123', school: 'Houston ISD' },
]

export function getDemoAccountByRole(role) {
  return demoAccounts[role] || demoAccounts.teacher
}

export function getDemoAccountByCredentials(email, password, role) {
  const account = demoAccounts[role]
  if (!account) return null
  if (account.email === email && account.password === password) return account
  return null
}
