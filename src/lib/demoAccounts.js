export const demoAccounts = {
  teacher: {
    role: 'teacher',
    email: 'teacher@kippneworleans.org',
    password: 'demo123',
    schoolName: 'KIPP New Orleans Schools',
    districtName: 'KIPP New Orleans',
    userName: 'Ms. Alexis Johnson',
    theme: {
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#fb923c',
      heroGradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      sidebar: '#121826',
      card: '#161923',
      border: '#1e2231',
      muted: '#6b7494',
      soft: 'rgba(249,115,22,0.14)',
    },
  },

  student: {
    role: 'student',
    email: 'student@houstonisd.org',
    password: 'demo123',
    schoolName: 'Houston ISD',
    districtName: 'Houston Independent School District',
    userName: 'Jordan Smith',
    theme: {
      primary: '#2563eb',
      secondary: '#1d4ed8',
      accent: '#60a5fa',
      heroGradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      sidebar: '#0d1424',
      card: '#161923',
      border: '#1d2940',
      muted: '#6f7fa7',
      soft: 'rgba(37,99,235,0.14)',
    },
  },

  parent: {
    role: 'parent',
    email: 'parent@bellaire.org',
    password: 'demo123',
    schoolName: 'Bellaire High School',
    districtName: 'Houston ISD',
    userName: 'Mrs. Taylor Smith',
    theme: {
      primary: '#0f766e',
      secondary: '#0d9488',
      accent: '#2dd4bf',
      heroGradient: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
      sidebar: '#0d1b1a',
      card: '#161923',
      border: '#1d3533',
      muted: '#6f8f8a',
      soft: 'rgba(15,118,110,0.14)',
    },
  },

  admin: {
    role: 'admin',
    email: 'admin@lamarhs.org',
    password: 'demo123',
    schoolName: 'Lamar High School',
    districtName: 'Houston ISD',
    userName: 'Principal Carter',
    theme: {
      primary: '#7c3aed',
      secondary: '#6d28d9',
      accent: '#a78bfa',
      heroGradient: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
      sidebar: '#171326',
      card: '#161923',
      border: '#2a2345',
      muted: '#8879a8',
      soft: 'rgba(124,58,237,0.14)',
    },
  },
}

export const demoLoginList = [
  {
    role: 'teacher',
    label: 'Teacher Demo',
    email: 'teacher@kippneworleans.org',
    password: 'demo123',
    school: 'KIPP New Orleans Schools',
  },
  {
    role: 'student',
    label: 'Student Demo',
    email: 'student@houstonisd.org',
    password: 'demo123',
    school: 'Houston ISD',
  },
  {
    role: 'parent',
    label: 'Parent Demo',
    email: 'parent@bellaire.org',
    password: 'demo123',
    school: 'Bellaire High School',
  },
  {
    role: 'admin',
    label: 'Admin Demo',
    email: 'admin@lamarhs.org',
    password: 'demo123',
    school: 'Lamar High School',
  },
]

export function getDemoAccountByRole(role) {
  return demoAccounts[role] || demoAccounts.teacher
}

export function getDemoAccountByCredentials(email, password, role) {
  const account = demoAccounts[role]
  if (!account) return null

  if (account.email === email && account.password === password) {
    return account
  }

  return null
}
