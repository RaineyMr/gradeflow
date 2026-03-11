import React, { useState } from 'react'
import { demoLoginList, getDemoAccountByCredentials } from '../lib/demoAccounts'

const ROLES = [
  { id: 'teacher', label: 'Teacher',  icon: '🧑‍🏫' },
  { id: 'student', label: 'Student',  icon: '🎓'   },
  { id: 'parent',  label: 'Parent',   icon: '👨‍👩‍👧' },
  { id: 'admin',   label: 'Admin',    icon: '🏫'   },
]

// GradeFlow brand colors — login screen ONLY uses these, never school colors
const BRAND = {
  primary:  '#f97316',
  blue:     '#2563EB',
  bg:       '#060810',
  card:     '#0c0e14',
  inner:    '#1e2231',
  text:     '#eef0f8',
  muted:    '#6b7494',
  border:   '#2a2f42',
  gradient: 'linear-gradient(135deg, #f97316 0%, #2563EB 100%)',
}

export default function Login({ onLogin, onDemoLogin }) {
  const [selectedRole, setSelectedRole] = useState('teacher')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      const account = getDemoAccountByCredentials(email.trim(), password.trim(), selectedRole)
      if (!account) {
        setError(`No demo account for this ${selectedRole}. Use the quick-login buttons below.`)
        setLoading(false)
        return
      }
      setLoading(false)
      window.scrollTo(0, 0)
      onLogin?.(account)
    }, 400)
  }

  function handleDemoClick(demo) {
    const account = getDemoAccountByCredentials(demo.email, demo.password, demo.role)
    if (account) { window.scrollTo(0, 0); onDemoLogin?.(account) }
  }

  return (
    <div style={{ minHeight: '100vh', background: BRAND.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: 'Inter, Arial, sans-serif', color: BRAND.text }}>

      {/* Logo */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: BRAND.gradient, borderRadius: 16, padding: '8px 20px', marginBottom: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>⚡ GradeFlow</span>
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 900, margin: '0 0 6px', background: BRAND.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Teach. GradeFlow handles the rest.
        </h1>
        <p style={{ color: BRAND.muted, fontSize: 13, margin: 0, maxWidth: 360 }}>
          Your school. Your way. All roles. One platform.
        </p>
      </div>

      {/* Main card */}
      <div style={{ width: '100%', maxWidth: 420, background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 22, padding: '28px 24px' }}>

        <div style={{ fontSize: 10, color: BRAND.primary, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>DEMO LOGIN</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 20px' }}>Sign in to GradeFlow</h2>

        {/* Role selector */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 20 }}>
          {ROLES.map(r => (
            <button key={r.id} onClick={() => { setSelectedRole(r.id); setError('') }}
              style={{
                padding: '8px 4px',
                borderRadius: 12,
                border: `1.5px solid ${selectedRole === r.id ? BRAND.primary : BRAND.border}`,
                background: selectedRole === r.id ? `rgba(249,115,22,0.12)` : BRAND.inner,
                color: selectedRole === r.id ? BRAND.primary : BRAND.muted,
                cursor: 'pointer', fontSize: 11, fontWeight: 700,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              }}>
              <span style={{ fontSize: 18 }}>{r.icon}</span>
              {r.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: BRAND.muted, marginBottom: 6 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{ width: '100%', background: BRAND.inner, border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: '12px 14px', color: BRAND.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: BRAND.muted, marginBottom: 6 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{ width: '100%', background: BRAND.inner, border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: '12px 14px', color: BRAND.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {error && (
            <div style={{ background: '#1c1012', border: '1px solid rgba(240,74,74,0.3)', borderRadius: 10, padding: '10px 12px', color: '#f04a4a', fontSize: 12, marginBottom: 14 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ width: '100%', background: BRAND.gradient, color: '#fff', border: 'none', borderRadius: 999, padding: '14px', fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginBottom: 10 }}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 12, color: BRAND.muted }}>or</span>
        </div>

        {/* Quick demo logins */}
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: BRAND.muted, marginBottom: 10 }}>Quick Demo Access</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {demoLoginList.map(demo => (
            <button key={demo.role} onClick={() => handleDemoClick(demo)}
              style={{
                background: BRAND.inner, border: `1px solid ${BRAND.border}`, borderRadius: 14,
                padding: '12px 10px', cursor: 'pointer', textAlign: 'left',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = BRAND.primary}
              onMouseLeave={e => e.currentTarget.style.borderColor = BRAND.border}
            >
              <div style={{ fontSize: 15, marginBottom: 4 }}>{demo.label.split(' ')[0]}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: BRAND.text }}>{demo.label.split(' ').slice(1).join(' ')}</div>
              <div style={{ fontSize: 10, color: BRAND.muted, marginTop: 2 }}>{demo.school}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Feature tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginTop: 24, width: '100%', maxWidth: 420 }}>
        {[
          { icon: '📷', title: 'Auto-grade with camera', body: 'Snap a photo — GradeFlow grades & updates your gradebook.' },
          { icon: '📋', title: 'All assignments in one place', body: 'Upload, collect, proctor, and generate reports.' },
          { icon: '🔔', title: 'Automatic alerts', body: 'GradeFlow notifies teachers, students & parents automatically.' },
          { icon: '🎨', title: 'Built for your school', body: 'Your school colors and branding throughout.' },
        ].map(f => (
          <div key={f.title} style={{ background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 16, padding: 14 }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{f.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>{f.title}</div>
            <div style={{ fontSize: 11, color: BRAND.muted, lineHeight: 1.5 }}>{f.body}</div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 24, fontSize: 11, color: BRAND.muted, textAlign: 'center' }}>
        Each demo uses a real school's branding & colors when signed in.
      </p>
    </div>
  )
}

