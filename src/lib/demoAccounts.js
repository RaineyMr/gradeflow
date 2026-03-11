// ─── School logo URLs (with fallback to initials if image fails to load) ─────
// KIPP New Orleans: real logo from their site
// Houston ISD, Bellaire, Lamar: use official HISD/school URLs with fallback
export const SCHOOL_LOGOS = {
  teacher: {
    url: 'https://kippneworleans.org/wp-content/uploads/2024/11/Reverse-20-Year-Logo.png',
    initials: 'KIPP',
    alt: 'KIPP New Orleans Schools',
  },
  student: {
    url: 'https://www.houstonisd.org/cms/lib2/TX01001591/Centricity/Domain/7967/HISD-logo-white.png',
    initials: 'HISD',
    alt: 'Houston ISD',
  },
  parent: {
    url: 'https://bellaire.houstonisd.org/cms/lib2/TX01001591/Centricity/Domain/8/BHS_logo_white.png',
    initials: 'BHS',
    alt: 'Bellaire High School',
  },
  admin: {
    url: 'https://lamar.houstonisd.org/cms/lib2/TX01001591/Centricity/Domain/7/Lamar_Logo_white.png',
    initials: 'LHS',
    alt: 'Lamar High School',
  },
}

export const demoAccounts = {
  teacher: {
    role: 'teacher',
    email: 'teacher@kippneworleans.org',
    password: 'demo123',
    schoolName: 'KIPP New Orleans Schools',
    districtName: 'KIPP New Orleans',
    userName: 'Ms. Alexis Johnson',
    // KIPP New Orleans real colors: orange & black
    theme: {
      primary: '#f97316',
      secondary: '#000000',
      accent: '#fb923c',
      heroGradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
      sidebar: '#121208',
      card: '#161923',
      border: '#2a1f0f',
      muted: '#8a7060',
      soft: 'rgba(249,115,22,0.15)',
    },
  },

  student: {
    role: 'student',
    email: 'student@houstonisd.org',
    password: 'demo123',
    schoolName: 'Houston ISD',
    districtName: 'Houston Independent School District',
    userName: 'Jordan Smith',
    // Houston ISD real colors: navy #003087 & gold #FFB81C
    theme: {
      primary: '#003087',
      secondary: '#FFB81C',
      accent: '#FFB81C',
      heroGradient: 'linear-gradient(135deg, #003087 0%, #001a4d 100%)',
      sidebar: '#00091f',
      card: '#161923',
      border: '#001a3d',
      muted: '#6070a0',
      soft: 'rgba(0,48,135,0.18)',
    },
  },

  parent: {
    role: 'parent',
    email: 'parent@bellaire.org',
    password: 'demo123',
    schoolName: 'Bellaire High School',
    districtName: 'Houston ISD',
    userName: 'Mrs. Taylor Smith',
    // Bellaire High School real colors: Cardinal red #C8102E & white
    theme: {
      primary: '#C8102E',
      secondary: '#ffffff',
      accent: '#e63950',
      heroGradient: 'linear-gradient(135deg, #C8102E 0%, #8b0a1f 100%)',
      sidebar: '#1a0408',
      card: '#161923',
      border: '#2a0a10',
      muted: '#907080',
      soft: 'rgba(200,16,46,0.15)',
    },
  },

  admin: {
    role: 'admin',
    email: 'admin@lamarhs.org',
    password: 'demo123',
    schoolName: 'Lamar High School',
    districtName: 'Houston ISD',
    userName: 'Principal Carter',
    // Lamar High School real colors: LSU Purple #461D7C & gold #FDD023
    theme: {
      primary: '#461D7C',
      secondary: '#FDD023',
      accent: '#FDD023',
      heroGradient: 'linear-gradient(135deg, #461D7C 0%, #2d1254 100%)',
      sidebar: '#0e0518',
      card: '#161923',
      border: '#1e0f35',
      muted: '#7060a0',
      soft: 'rgba(70,29,124,0.18)',
    },
  },
}

export const demoLoginList = [
  { role: 'teacher', label: 'Teacher Demo', email: 'teacher@kippneworleans.org', password: 'demo123', school: 'KIPP New Orleans Schools' },
  { role: 'student', label: 'Student Demo', email: 'student@houstonisd.org', password: 'demo123', school: 'Houston ISD' },
  { role: 'parent', label: 'Parent Demo', email: 'parent@bellaire.org', password: 'demo123', school: 'Bellaire High School' },
  { role: 'admin', label: 'Admin Demo', email: 'admin@lamarhs.org', password: 'demo123', school: 'Lamar High School' },
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
