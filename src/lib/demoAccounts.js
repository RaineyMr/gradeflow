// ─── GradeFlow Demo Accounts ──────────────────────────────────────────────────
// Each role maps to a real school with its actual brand colors.
// Login page uses GradeFlow orange/blue only.
// Authenticated views use ONLY their school palette.

export const demoAccounts = {
  teacher: {
    role: 'teacher',
    email: 'teacher@kippneworleans.org',
    password: 'demo123',
    schoolName: 'KIPP New Orleans Schools',
    districtName: 'KIPP New Orleans',
    userName: 'Ms. Johnson',
    studentName: null,
    avatar: '👩‍🏫',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9b/KIPP_Foundation_logo.svg/200px-KIPP_Foundation_logo.svg.png',
    theme: {
      primary: '#BA0C2F',
      secondary: '#000000',
      accent: '#BA0C2F',
      heroGradient: 'linear-gradient(135deg, #BA0C2F 0%, #7a0820 100%)',
      headerGradient: 'linear-gradient(135deg, #BA0C2F 0%, #000000 100%)',
      sidebar: '#1a0005',
      card: '#161923',
      border: '#3a0010',
      muted: '#907080',
      soft: 'rgba(186,12,47,0.15)',
      navActive: '#BA0C2F',
    },
  },

  student: {
    role: 'student',
    email: 'student@houstonisd.org',
    password: 'demo123',
    schoolName: 'Houston ISD',
    districtName: 'Houston Independent School District',
    userName: 'Marcus Thompson',
    studentName: 'Marcus',
    avatar: '🎓',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/Houston_ISD_logo.svg/200px-Houston_ISD_logo.svg.png',
    theme: {
      primary: '#003057',
      secondary: '#B3A369',
      accent: '#B3A369',
      heroGradient: 'linear-gradient(135deg, #003057 0%, #B3A369 100%)',
      headerGradient: 'linear-gradient(135deg, #003057 0%, #002040 100%)',
      sidebar: '#000d1a',
      card: '#161923',
      border: '#002040',
      muted: '#7090a0',
      soft: 'rgba(0,48,87,0.20)',
      navActive: '#B3A369',
    },
  },

  parent: {
    role: 'parent',
    email: 'parent@bellaire.org',
    password: 'demo123',
    schoolName: 'Bellaire High School',
    districtName: 'Houston ISD',
    userName: 'Ms. Thompson',
    studentName: 'Marcus',
    avatar: '👨‍👩‍👧',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/Houston_ISD_logo.svg/200px-Houston_ISD_logo.svg.png',
    theme: {
      primary: '#C8102E',
      secondary: '#ffffff',
      accent: '#C8102E',
      heroGradient: 'linear-gradient(135deg, #C8102E 0%, #8b0a1f 100%)',
      headerGradient: 'linear-gradient(135deg, #C8102E 0%, #8b0a1f 100%)',
      sidebar: '#1a0408',
      card: '#161923',
      border: '#2a0a10',
      muted: '#907080',
      soft: 'rgba(200,16,46,0.15)',
      navActive: '#C8102E',
    },
  },

  admin: {
    role: 'admin',
    email: 'admin@lamarhs.org',
    password: 'demo123',
    schoolName: 'Lamar High School',
    districtName: 'Houston ISD',
    userName: 'Principal Carter',
    studentName: null,
    avatar: '🏫',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/Houston_ISD_logo.svg/200px-Houston_ISD_logo.svg.png',
    theme: {
      primary: '#461D7C',
      secondary: '#FDD023',
      accent: '#FDD023',
      heroGradient: 'linear-gradient(135deg, #461D7C 0%, #2d1254 100%)',
      headerGradient: 'linear-gradient(135deg, #461D7C 0%, #2d1254 100%)',
      sidebar: '#0e0518',
      card: '#161923',
      border: '#1e0f35',
      muted: '#7060a0',
      soft: 'rgba(70,29,124,0.18)',
      navActive: '#FDD023',
    },
  },
}

export const demoLoginList = [
  { role: 'teacher', label: '🧑‍🏫 Teacher Demo', email: 'teacher@kippneworleans.org', password: 'demo123', school: 'KIPP New Orleans' },
  { role: 'student', label: '🎓 Student Demo',  email: 'student@houstonisd.org',     password: 'demo123', school: 'Houston ISD' },
  { role: 'parent',  label: '👨‍👩‍👧 Parent Demo',  email: 'parent@bellaire.org',       password: 'demo123', school: 'Bellaire High School' },
  { role: 'admin',   label: '🏫 Admin Demo',    email: 'admin@lamarhs.org',          password: 'demo123', school: 'Lamar High School' },
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
