import React, { useMemo, useState } from 'react'
import { demoAccounts, getDemoAccountByCredentials } from '../lib/demoAccounts'

const roleOptions = [
  { id: 'teacher', label: 'Teacher', icon: '🧑‍🏫', description: 'Manage classes, assignments, grades, and parent communication.' },
  { id: 'student', label: 'Student', icon: '🎓', description: 'Track grades, upcoming work, and class feedback.' },
  { id: 'parent', label: 'Parent', icon: '👨‍👩‍👧', description: 'Monitor progress, attendance, and teacher updates.' },
  { id: 'admin', label: 'Admin', icon: '🏫', description: 'View school-wide performance, staffing, and alerts.' },
]

// Inject responsive CSS once
if (typeof document !== 'undefined' && !document.getElementById('login-responsive-styles')) {
  const style = document.createElement('style')
  style.id = 'login-responsive-styles'
  style.textContent = `
    .login-shell {
      min-height: 100dvh;
      background: #060810;
      color: #eef0f8;
      font-family: Inter, Arial, sans-serif;
      padding: 24px;
      box-sizing: border-box;
    }
    .login-container {
      max-width: 1360px;
      margin: 0 auto;
      min-height: calc(100dvh - 48px);
      display: grid;
      grid-template-columns: 1.05fr 0.95fr;
      gap: 22px;
      align-items: stretch;
    }
    .login-hero { display: flex; }
    @media (max-width: 768px) {
      .login-shell { padding: 16px; }
      .login-container { grid-template-columns: 1fr; min-height: unset; }
      .login-hero { display: none !important; }
    }
  `
  document.head.appendChild(style)
}

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
    if (!account?.role) { setError('Demo account is missing a valid role.'); return }
    setError('')
    if (rememberMe) localStorage.setItem('gradeflow_user', JSON.stringify(account))
    else localStorage.removeItem('gradeflow_user')
    if (onDemoLogin) { onDemoLogin(account); return }
    if (onLogin) onLogin(account)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const matchedDemo = getDemoAccountByCredentials(email.trim(), password.trim(), selectedRole)
    if (!matchedDemo) {
      setError(`No demo account matched for ${activeRole.label}. Use one of the demo logins below.`)
      return
    }
    completeLogin(matchedDemo)
  }

  const handleRoleSelect = (roleId) => { setSelectedRole(roleId); setError('') }

  return (
    <div className="login-shell">
      <div className="login-container">

        {/* ── HERO PANEL (hidden on mobile) ── */}
        <section className="login-hero" style={heroPanel}>
          <div>
            <div style={badge}>⚡ GradeFlow</div>
            <div style={{ marginTop: '28px' }}>
              <h1 style={{ margin: 0, fontSize: '38px', lineHeight: 1.08, fontWeight: 800 }}>
                Teach.<br />GradeFlow handles<br />the rest.
              </h1>
              <p style={{ ...subText, marginTop: '16px', maxWidth: '560px', fontSize: '15px' }}>
                GradeFlow brings grading, assignments, communication, testing, and analytics into one seamless system. Everything—from grading to lesson planning—lives in one platform designed to help teachers spend less time managing systems and more time teaching.
              </p>
            </div>

            <div style={{ marginTop: '28px', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(180px, 1fr))', gap: '14px' }}>
              {[
                { icon: '📷', title: 'Auto-grade with camera', body: 'Capture student work and GradeFlow grades it and updates your gradebook instantly.' },
                { icon: '📋', title: 'All assignments in one place', body: 'Upload spreadsheets, collect digital work, proctor tests, and generate reports.' },
                { icon: '🔔', title: 'Automatic alerts', body: 'When performance changes, GradeFlow notifies teachers, students, and parents automatically.' },
                { icon: '🎨', title: 'Built for your school', body: 'Customized for each school\'s branding and workflows so teachers can focus on teaching.' },
              ].map((item) => (
                <div key={item.title} style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '18px', padding: '16px' }}>
                  <div style={{ fontSize: '22px' }}>{item.icon}</div>
                  <div style={{ marginTop: '10px', fontWeight: 800, fontSize: '14px' }}>{item.title}</div>
                  <div style={{ marginTop: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>{item.body}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '24px', background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '22px', padding: '20px' }}>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.82)', fontWeight: 700 }}>Identify struggling students early · Communicate with families instantly · Keep everyone informed</div>
          </div>
        </section>

        {/* ── FORM PANEL ── */}
        <section style={formPanel}>
          <div style={{ maxWidth: '560px', width: '100%', margin: '0 auto' }}>
            <div>
              <div style={{ color: activeTheme.accent, fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em' }}>DEMO LOGIN</div>
              <h2 style={{ margin: '10px 0 0', fontSize: '32px', fontWeight: 800 }}>Sign in to GradeFlow</h2>
              <p style={{ color: activeTheme.muted, marginTop: '10px', lineHeight: 1.55 }}>
                Each role is mapped to a different real school so you can preview scheme changes and branding direction.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
              <div>
                <label style={labelStyle}>Select Role</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(140px, 1fr))', gap: '12px' }}>
                  {roleOptions.map((role) => {
                    const active = role.id === selectedRole
                    const account = demoAccounts[role.id]
                    return (
                      <button key={role.id} type="button" onClick={() => handleRoleSelect(role.id)}
                        style={{
                          background: active ? account.theme.soft : '#0d1220',
                          color: '#eef0f8',
                          border: active ? `1px solid ${account.theme.primary}` : `1px solid ${activeTheme.border}`,
                          borderRadius: '16px', padding: '14px', textAlign: 'left', cursor: 'pointer',
                        }}>
                        <div style={{ fontSize: '18px' }}>{role.icon}</div>
                        <div style={{ marginTop: '8px', fontWeight: 800 }}>{role.label}</div>
                        <div style={{ marginTop: '4px', color: '#7d87a8', fontSize: '12px' }}>{account.schoolName}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ marginTop: '18px' }}>
                <label style={labelStyle}>Email Address</label>
                <input style={inputStyle} type="email" placeholder="name@school.org" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={labelStyle}>Password</label>
                <input style={inputStyle} type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>

              <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#aab3cb', cursor: 'pointer' }}>
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  Remember me
                </label>
                <button type="button" style={{ background: 'transparent', border: 'none', color: '#9fb4ff', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>
                  Forgot password?
                </button>
              </div>

              {error && (
                <div style={{ marginTop: '14px', background: 'rgba(240,74,74,0.12)', color: '#fca5a5', border: '1px solid rgba(240,74,74,0.25)', borderRadius: '14px', padding: '12px 14px', fontSize: '13px' }}>
                  {error}
                </div>
              )}

              <button type="submit" style={{ width: '100%', marginTop: '18px', background: activeTheme.primary, color: '#fff', border: 'none', borderRadius: '16px', padding: '15px 18px', fontWeight: 800, fontSize: '15px', cursor: 'pointer', boxShadow: `0 10px 28px ${activeTheme.primary}33` }}>
                Sign in as {activeRole.label}
              </button>
            </form>

            <div style={{ marginTop: '22px', background: '#0d1220', border: `1px solid ${activeTheme.border}`, borderRadius: '18px', padding: '16px' }}>
              <div style={{ fontWeight: 800, marginBottom: '12px' }}>Try a demo account</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(140px, 1fr))', gap: '10px' }}>
                {[
                  { label: '🧑‍🏫 Continue as Teacher', fn: () => completeLogin(demoAccounts.teacher) },
                  { label: '🎓 Continue as Student',  fn: () => completeLogin(demoAccounts.student) },
                  { label: '👨‍👩‍👧 Continue as Parent',   fn: () => completeLogin(demoAccounts.parent) },
                  { label: '🏫 Continue as Admin',    fn: () => completeLogin(demoAccounts.admin) },
                ].map(({ label, fn }) => (
                  <button key={label} type="button" onClick={fn}
                    style={{ background: 'rgba(255,255,255,0.04)', color: '#eef0f8', border: '1px solid #2a3145', borderRadius: '14px', padding: '12px 14px', textAlign: 'left', cursor: 'pointer', fontWeight: 700 }}>
                    {label}
                  </button>
                ))}
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
