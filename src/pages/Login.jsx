import React, { useMemo, useState } from 'react'
import { demoAccounts, getDemoAccountByCredentials } from '../lib/demoAccounts'

const roleOptions = [
  {
    id: 'teacher',
    label: 'Teacher',
    icon: '🧑‍🏫',
    description: 'Manage classes, assignments, grades, and parent communication.',
  },
  {
    id: 'student',
    label: 'Student',
    icon: '🎓',
    description: 'Track grades, upcoming work, and class feedback.',
  },
  {
    id: 'parent',
    label: 'Parent',
    icon: '👨‍👩‍👧',
    description: 'Monitor progress, attendance, and teacher updates.',
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: '🏫',
    description: 'View school-wide performance, staffing, and alerts.',
  },
]

function Login({ onLogin, onDemoLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState('teacher')
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')

  const activeRole = useMemo(
    () => roleOptions.find((role) => role.id === selectedRole) || roleOptions[0],
    [selectedRole]
  )

  const activeTheme = demoAccounts[selectedRole]?.theme || demoAccounts.teacher.theme

  const shell = {
    minHeight: '100vh',
    background: '#060810',
    color: '#eef0f8',
    fontFamily: 'Inter, Arial, sans-serif',
    padding: '24px',
  }

  const container = {
    maxWidth: '1360px',
    margin: '0 auto',
    minHeight: 'calc(100vh - 48px)',
    display: 'grid',
    gridTemplateColumns: '1.05fr 0.95fr',
    gap: '22px',
    alignItems: 'stretch',
  }

  const panel = {
    background: '#161923',
    border: `1px solid ${activeTheme.border}`,
    borderRadius: '28px',
    boxShadow: '0 16px 40px rgba(0,0,0,0.28)',
    overflow: 'hidden',
  }

  const heroPanel = {
    ...panel,
    background: activeTheme.heroGradient,
    position: 'relative',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  }

  const formPanel = {
    ...panel,
    background: activeTheme.card,
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  }

  const badge = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '999px',
    padding: '8px 12px',
    background: 'rgba(255,255,255,0.14)',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 700,
  }

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 700,
    marginBottom: '8px',
    color: '#c9d0e3',
  }

  const inputStyle = {
    width: '100%',
    background: '#0d1220',
    color: '#eef0f8',
    border: `1px solid ${activeTheme.border}`,
    borderRadius: '14px',
    padding: '14px 16px',
    outline: 'none',
    fontSize: '14px',
    boxSizing: 'border-box',
  }

  const subText = {
    color: 'rgba(255,255,255,0.82)',
    fontSize: '13px',
    lineHeight: 1.5,
  }

  const completeLogin = (account) => {
    if (!account?.role) {
      setError('Demo account is missing a valid role.')
      return
    }

    setError('')

    if (rememberMe) {
      localStorage.setItem('gradeflow_user', JSON.stringify(account))
    } else {
      localStorage.removeItem('gradeflow_user')
    }

    if (onDemoLogin) {
      onDemoLogin(account)
      return
    }

    if (onLogin) {
      onLogin(account)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const matchedDemo = getDemoAccountByCredentials(
      email.trim(),
      password.trim(),
      selectedRole
    )

    if (!matchedDemo) {
      setError(`No demo account matched for ${activeRole.label}. Use one of the demo logins below.`)
      return
    }

    completeLogin(matchedDemo)
  }

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId)
    setError('')
  }

  const loginTeacherDemo = () => completeLogin(demoAccounts.teacher)
  const loginStudentDemo = () => completeLogin(demoAccounts.student)
  const loginParentDemo = () => completeLogin(demoAccounts.parent)
  const loginAdminDemo = () => completeLogin(demoAccounts.admin)

  return (
    <div style={shell}>
      <div style={container}>
        <section style={heroPanel}>
          <div>
            <div style={badge}>⚡ GradeFlow Demo Access</div>

            <div style={{ marginTop: '28px' }}>
              <h1 style={{ margin: 0, fontSize: '42px', lineHeight: 1.08, fontWeight: 800 }}>
                Different roles.
                <br />
                Different schools.
                <br />
                Different schemes.
              </h1>

              <p style={{ ...subText, marginTop: '16px', maxWidth: '560px', fontSize: '15px' }}>
                Switch between teacher, student, parent, and admin demos to preview how GradeFlow
                changes branding and visual tone by account type.
              </p>
            </div>

            <div
              style={{
                marginTop: '28px',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(180px, 1fr))',
                gap: '14px',
              }}
            >
              {roleOptions.map((role) => {
                const account = demoAccounts[role.id]
                return (
                  <div
                    key={role.id}
                    style={{
                      background: 'rgba(255,255,255,0.10)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '18px',
                      padding: '16px',
                    }}
                  >
                    <div style={{ fontSize: '22px' }}>{role.icon}</div>
                    <div style={{ marginTop: '10px', fontWeight: 800 }}>{role.label}</div>
                    <div style={{ marginTop: '6px', fontSize: '13px', color: 'rgba(255,255,255,0.82)' }}>
                      {account.schoolName}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div
            style={{
              marginTop: '24px',
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '22px',
              padding: '20px',
            }}
          >
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.82)', fontWeight: 700 }}>
              Platform highlights
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(100px, 1fr))',
                gap: '12px',
                marginTop: '14px',
              }}
            >
              <div style={{ background: 'rgba(0,0,0,0.16)', borderRadius: '16px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Assignments</div>
                <div style={{ marginTop: '6px', fontSize: '24px', fontWeight: 800 }}>1.2k</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.16)', borderRadius: '16px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Students</div>
                <div style={{ marginTop: '6px', fontSize: '24px', fontWeight: 800 }}>8.4k</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.16)', borderRadius: '16px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Alerts</div>
                <div style={{ marginTop: '6px', fontSize: '24px', fontWeight: 800 }}>94</div>
              </div>
            </div>
          </div>
        </section>

        <section style={formPanel}>
          <div style={{ maxWidth: '560px', width: '100%', margin: '0 auto' }}>
            <div>
              <div style={{ color: activeTheme.accent, fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em' }}>
                DEMO LOGIN
              </div>
              <h2 style={{ margin: '10px 0 0', fontSize: '32px', fontWeight: 800 }}>Sign in to GradeFlow</h2>
              <p style={{ color: activeTheme.muted, marginTop: '10px', lineHeight: 1.55 }}>
                Each role is mapped to a different real school so you can preview scheme changes and branding direction.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
              <div>
                <label style={labelStyle}>Select Role</label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(140px, 1fr))',
                    gap: '12px',
                  }}
                >
                  {roleOptions.map((role) => {
                    const active = role.id === selectedRole
                    const account = demoAccounts[role.id]

                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleRoleSelect(role.id)}
                        style={{
                          background: active ? account.theme.soft : '#0d1220',
                          color: '#eef0f8',
                          border: active ? `1px solid ${account.theme.primary}` : `1px solid ${activeTheme.border}`,
                          borderRadius: '16px',
                          padding: '14px',
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontSize: '18px' }}>{role.icon}</div>
                        <div style={{ marginTop: '8px', fontWeight: 800 }}>{role.label}</div>
                        <div style={{ marginTop: '4px', color: '#7d87a8', fontSize: '12px' }}>
                          {account.schoolName}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ marginTop: '18px' }}>
                <label style={labelStyle}>Email Address</label>
                <input
                  style={inputStyle}
                  type="email"
                  placeholder="name@school.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={labelStyle}>Password</label>
                <input
                  style={inputStyle}
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div
                style={{
                  marginTop: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: '#aab3cb',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember me
                </label>

                <button
                  type="button"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#9fb4ff',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                >
                  Forgot password?
                </button>
              </div>

              {error ? (
                <div
                  style={{
                    marginTop: '14px',
                    background: 'rgba(240,74,74,0.12)',
                    color: '#fca5a5',
                    border: '1px solid rgba(240,74,74,0.25)',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    fontSize: '13px',
                  }}
                >
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                style={{
                  width: '100%',
                  marginTop: '18px',
                  background: activeTheme.primary,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '15px 18px',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: `0 10px 28px ${activeTheme.primary}33`,
                }}
              >
                Sign in as {activeRole.label}
              </button>
            </form>

            <div
              style={{
                marginTop: '22px',
                background: '#0d1220',
                border: `1px solid ${activeTheme.border}`,
                borderRadius: '18px',
                padding: '16px',
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: '12px' }}>Try a demo account</div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(140px, 1fr))',
                  gap: '10px',
                }}
              >
                <button
                  type="button"
                  onClick={loginTeacherDemo}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    color: '#eef0f8',
                    border: '1px solid #2a3145',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  🧑‍🏫 Continue as Teacher
                </button>

                <button
                  type="button"
                  onClick={loginStudentDemo}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    color: '#eef0f8',
                    border: '1px solid #2a3145',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  🎓 Continue as Student
                </button>

                <button
                  type="button"
                  onClick={loginParentDemo}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    color: '#eef0f8',
                    border: '1px solid #2a3145',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  👨‍👩‍👧 Continue as Parent
                </button>

                <button
                  type="button"
                  onClick={loginAdminDemo}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    color: '#eef0f8',
                    border: '1px solid #2a3145',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  🏫 Continue as Admin
                </button>
              </div>
            </div>

            <div
              style={{
                marginTop: '18px',
                background: '#0d1220',
                border: `1px solid ${activeTheme.border}`,
                borderRadius: '18px',
                padding: '16px',
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: '10px' }}>Demo credentials</div>

              <div style={{ display: 'grid', gap: '8px', fontSize: '12px', color: '#cbd5e1' }}>
                <div>Teacher — teacher@kippneworleans.org / demo123</div>
                <div>Student — student@houstonisd.org / demo123</div>
                <div>Parent — parent@bellaire.org / demo123</div>
                <div>Admin — admin@lamarhs.org / demo123</div>
              </div>
            </div>

            <p style={{ color: activeTheme.muted, marginTop: '18px', textAlign: 'center', fontSize: '13px' }}>
              These are fake demo accounts for UI preview only.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Login
