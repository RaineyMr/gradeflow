import React, { useMemo, useState } from 'react'

const roleOptions = [
  {
    id: 'teacher',
    label: 'Teacher',
    icon: '🧑‍🏫',
    color: '#f97316',
    description: 'Manage classes, assignments, grades, and parent communication.',
  },
  {
    id: 'student',
    label: 'Student',
    icon: '🎓',
    color: '#3b82f6',
    description: 'Track grades, upcoming work, and class feedback.',
  },
  {
    id: 'parent',
    label: 'Parent',
    icon: '👨‍👩‍👧',
    color: '#14b8a6',
    description: 'Monitor progress, attendance, and teacher updates.',
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: '🏫',
    color: '#8b5cf6',
    description: 'View school-wide performance, staffing, and alerts.',
  },
]

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
  border: '1px solid #1e2231',
  borderRadius: '28px',
  boxShadow: '0 16px 40px rgba(0,0,0,0.28)',
  overflow: 'hidden',
}

const heroPanel = {
  ...panel,
  background: 'linear-gradient(145deg, #111827 0%, #0b1020 45%, #171334 100%)',
  position: 'relative',
  padding: '32px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}

const formPanel = {
  ...panel,
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
  background: 'rgba(255,255,255,0.08)',
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
  border: '1px solid #232a3b',
  borderRadius: '14px',
  padding: '14px 16px',
  outline: 'none',
  fontSize: '14px',
  boxSizing: 'border-box',
}

const subText = {
  color: '#6b7494',
  fontSize: '13px',
  lineHeight: 1.5,
}

function Login({ onLogin, onDemoLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState('teacher')
  const [rememberMe, setRememberMe] = useState(true)

  const activeRole = useMemo(
    () => roleOptions.find((role) => role.id === selectedRole) || roleOptions[0],
    [selectedRole]
  )

  const handleSubmit = (e) => {
    e.preventDefault()

    const payload = {
      email,
      password,
      role: selectedRole,
      rememberMe,
    }

    if (onLogin) {
      onLogin(payload)
      return
    }

    console.log('Login payload:', payload)
  }

  const handleDemo = (roleId) => {
    if (onDemoLogin) {
      onDemoLogin(roleId)
      return
    }

    console.log('Demo login as:', roleId)
  }

  return (
    <div style={shell}>
      <div style={container}>
        <section style={heroPanel}>
          <div>
            <div style={badge}>⚡ GradeFlow Access Portal</div>

            <div style={{ marginTop: '28px' }}>
              <h1 style={{ margin: 0, fontSize: '42px', lineHeight: 1.08, fontWeight: 800 }}>
                One login.
                <br />
                Every role connected.
              </h1>

              <p style={{ ...subText, marginTop: '16px', maxWidth: '540px', color: '#b8c0d8', fontSize: '15px' }}>
                Sign in to access your GradeFlow workspace for teaching, learning, family updates,
                and school administration.
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
              {roleOptions.map((role) => (
                <div
                  key={role.id}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '18px',
                    padding: '16px',
                  }}
                >
                  <div style={{ fontSize: '22px' }}>{role.icon}</div>
                  <div style={{ marginTop: '10px', fontWeight: 800 }}>{role.label}</div>
                  <div style={{ marginTop: '6px', color: '#9aa4c3', fontSize: '13px', lineHeight: 1.45 }}>
                    {role.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              marginTop: '24px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '22px',
              padding: '20px',
            }}
          >
            <div style={{ fontSize: '13px', color: '#a8b2d1', fontWeight: 700 }}>Platform highlights</div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(100px, 1fr))',
                gap: '12px',
                marginTop: '14px',
              }}
            >
              <div style={{ background: '#12192a', borderRadius: '16px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: '#7d87a8' }}>Assignments</div>
                <div style={{ marginTop: '6px', fontSize: '24px', fontWeight: 800 }}>1.2k</div>
              </div>
              <div style={{ background: '#12192a', borderRadius: '16px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: '#7d87a8' }}>Students</div>
                <div style={{ marginTop: '6px', fontSize: '24px', fontWeight: 800 }}>8.4k</div>
              </div>
              <div style={{ background: '#12192a', borderRadius: '16px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: '#7d87a8' }}>Alerts</div>
                <div style={{ marginTop: '6px', fontSize: '24px', fontWeight: 800 }}>94</div>
              </div>
            </div>
          </div>
        </section>

        <section style={formPanel}>
          <div style={{ maxWidth: '520px', width: '100%', margin: '0 auto' }}>
            <div>
              <div style={{ color: '#8ea0d1', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em' }}>
                WELCOME BACK
              </div>
              <h2 style={{ margin: '10px 0 0', fontSize: '32px', fontWeight: 800 }}>Sign in to GradeFlow</h2>
              <p style={{ ...subText, marginTop: '10px' }}>
                Choose your role, enter your account details, and continue to your dashboard.
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
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setSelectedRole(role.id)}
                        style={{
                          background: active ? 'rgba(255,255,255,0.08)' : '#0d1220',
                          color: '#eef0f8',
                          border: active ? `1px solid ${role.color}` : '1px solid #232a3b',
                          borderRadius: '16px',
                          padding: '14px',
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontSize: '18px' }}>{role.icon}</div>
                        <div style={{ marginTop: '8px', fontWeight: 800 }}>{role.label}</div>
                        <div style={{ marginTop: '4px', color: '#7d87a8', fontSize: '12px' }}>
                          {role.id.charAt(0).toUpperCase() + role.id.slice(1)} portal
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

              <button
                type="submit"
                style={{
                  width: '100%',
                  marginTop: '18px',
                  background: activeRole.color,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '15px 18px',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: `0 10px 28px ${activeRole.color}33`,
                }}
              >
                Sign in as {activeRole.label}
              </button>
            </form>

            <div
              style={{
                marginTop: '22px',
                background: '#0d1220',
                border: '1px solid #232a3b',
                borderRadius: '18px',
                padding: '16px',
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: '10px' }}>Try a demo account</div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(140px, 1fr))',
                  gap: '10px',
                }}
              >
                {roleOptions.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleDemo(role.id)}
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
                    {role.icon} Continue as {role.label}
                  </button>
                ))}
              </div>
            </div>

            <p style={{ ...subText, marginTop: '18px', textAlign: 'center' }}>
              Need help getting started? Open the tutorials page after login for role-based walkthroughs.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Login
