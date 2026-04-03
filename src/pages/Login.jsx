// FILE: src/pages/Login.jsx (full replacement)

import React, { useState, useEffect } from 'react'
import { useStore } from '../lib/store'
import { useT } from '../lib/i18n'
import { demoLoginList, getDemoAccountByCredentials } from '../lib/demoAccounts'

const ROLES = [
  { id: 'teacher',      labelKey: 'teacher_label',      icon: '🧑‍🏫' },
  { id: 'student',      labelKey: 'student_label_tab',  icon: '🎓'   },
  { id: 'parent',       labelKey: 'parent_label_tab',   icon: '👪'   },
  { id: 'admin',        labelKey: 'admin_label_tab',    icon: '🏫'   },
  { id: 'supportStaff', labelKey: 'support_label',      icon: '📣'   },
]

// Roles that can self-register (students, parents, teachers)
// Admins/support staff are provisioned by district — they cannot self-register
const REGISTERABLE_ROLES = ['teacher', 'student', 'parent']

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

// ─── Language toggle ──────────────────────────────────────────────────────────
function LangToggle({ onToggle, style = {} }) {
  const { lang } = useStore()
  return (
    <button
      onClick={onToggle}
      style={{
        background:    'rgba(255,255,255,0.12)',
        border:        '1.5px solid rgba(255,255,255,0.25)',
        borderRadius:  999,
        padding:       '5px 12px',
        color:         '#fff',
        fontSize:      12,
        fontWeight:    800,
        cursor:        'pointer',
        display:       'flex',
        alignItems:    'center',
        gap:           5,
        letterSpacing: '0.04em',
        transition:    'background 0.15s',
        ...style,
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
      title={lang === 'en' ? 'Switch to Spanish' : 'Switch to English'}
    >
      {lang === 'en' ? '🇲🇽 ES' : '🇺🇸 EN'}
    </button>
  )
}

// ─── Shared sign-in form state ────────────────────────────────────────────────
function useLoginForm(onLogin, onDemoLogin) {
  const [selectedRole, setSelectedRole] = useState('teacher')
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [error,        setError]        = useState('')
  const [loading,      setLoading]      = useState(false)
  const { lang, setLang } = useStore()

  function toggleLang() { setLang(lang === 'en' ? 'es' : 'en') }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      const account = getDemoAccountByCredentials(email.trim(), password.trim(), selectedRole)
      if (!account) {
        setError(lang === 'es'
          ? 'Cuenta demo no encontrada. Usa los botones de acceso rapido.'
          : 'No demo account found. Use the quick-login buttons below.')
        setLoading(false)
        return
      }
      setLoading(false)
      window.scrollTo(0, 0)
      onLogin?.({ ...account, lang: account.lang || lang })
    }, 400)
  }

  function handleDemoClick(demo) {
    const account = getDemoAccountByCredentials(demo.email, demo.password, demo.role)
    if (account) { window.scrollTo(0, 0); onDemoLogin?.({ ...account, lang }) }
  }

  return { selectedRole, setSelectedRole, email, setEmail, password, setPassword, error, loading, handleSubmit, handleDemoClick, lang, toggleLang }
}

// ─── Shared create-account form state ────────────────────────────────────────
function useCreateForm(onLogin) {
  const [step,         setStep]         = useState(1)   // 1 = role, 2 = details
  const [selectedRole, setSelectedRole] = useState('teacher')
  const [firstName,    setFirstName]    = useState('')
  const [lastName,     setLastName]     = useState('')
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [confirmPw,    setConfirmPw]    = useState('')
  const [schoolCode,   setSchoolCode]   = useState('')
  const [showPassword,  setShowPassword]  = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [error,        setError]        = useState('')
  const [loading,      setLoading]      = useState(false)
  const { lang, schools } = useStore()

  function handleRoleNext() {
    setError('')
    setStep(2)
  }

  function validate() {
    if (!firstName.trim() || !lastName.trim()) return lang === 'es' ? 'Ingresa tu nombre completo.' : 'Please enter your full name.'
    if (!email.trim() || !email.includes('@'))  return lang === 'es' ? 'Ingresa un correo válido.' : 'Please enter a valid email.'
    if (password.length < 6)                    return lang === 'es' ? 'La contraseña debe tener al menos 6 caracteres.' : 'Password must be at least 6 characters.'
    if (password !== confirmPw)                 return lang === 'es' ? 'Las contraseñas no coinciden.' : 'Passwords do not match.'
    if (!schoolCode.trim())                     return lang === 'es' ? 'Ingresa el código de tu escuela.' : 'Please enter your school code.'
    
    // Validate school code exists in database
    const school = schools?.find(s => s.id === schoolCode.trim().toUpperCase())
    if (!school) {
      return lang === 'es' 
        ? 'Código de escuela no encontrado. Contacta a tu escuela.' 
        : 'School code not found. Contact your school for the correct code.'
    }
    
    return null
  }

  function handleSubmit(e) {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)

    // Find the validated school
    const school = schools?.find(s => s.id === schoolCode.trim().toUpperCase())

    // Demo-mode: simulate account creation then log in with a synthetic account object.
    // In production this would call POST /api/auth/register → Supabase auth.signUp()
    setTimeout(() => {
      setLoading(false)
      window.scrollTo(0, 0)
      onLogin?.({
        id:        `new-${Date.now()}`,
        name:      `${firstName.trim()} ${lastName.trim()}`,
        email:     email.trim(),
        role:      selectedRole,
        school_id:  school?.id, // Use school_id for proper theming
        school:    school?.name, // Store school name for display
        // Theme will be applied during onboarding when user selects their school
        lang,
        isNewAccount: true,
        needsOnboarding: selectedRole === 'teacher', // Teachers need profile setup
      })
    }, 700)
  }

  return {
    step, setStep,
    selectedRole, setSelectedRole,
    firstName, setFirstName,
    lastName, setLastName,
    email,     setEmail,
    password,  setPassword,
    confirmPw, setConfirmPw,
    schoolCode, setSchoolCode,
    showPassword, setShowPassword,
    showConfirmPw, setShowConfirmPw,
    error, loading,
    handleRoleNext, handleSubmit,
    lang,
  }
}

// ─── Create Account Panel ────────────────────────────────────────────────────────
function CreateAccountPanel({ onBack, onLogin, compact }) {
  const form = useCreateForm(onLogin)
  const { 
    selectedRole, setSelectedRole, firstName, setFirstName, lastName, setLastName,
    email, setEmail, password, setPassword, schoolCode, setSchoolCode,
    showPassword, setShowPassword,
    error, loading,
    handleSubmit,
    lang,
  } = form

  const inp = {
    width: '100%', background: BRAND.inner,
    border: `1px solid ${BRAND.border}`, borderRadius: 12,
    padding: compact ? '11px 13px' : '14px 16px',
    color: BRAND.text, fontSize: 14, outline: 'none',
    boxSizing: 'border-box', marginBottom: compact ? 10 : 14,
  }
  const lbl = {
    display: 'block', fontSize: 10, fontWeight: 700,
    letterSpacing: '0.06em', textTransform: 'uppercase',
    color: BRAND.muted, marginBottom: compact ? 4 : 6,
  }

  return (
    <div style={{ width: '100%' }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: BRAND.muted, cursor: 'pointer', fontSize: 18, padding: 0, lineHeight: 1 }}>←</button>
        <div>
          <div style={{ fontSize: 10, color: BRAND.primary, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {lang === 'es' ? 'NUEVO USUARIO' : 'NEW ACCOUNT'}
          </div>
          <h2 style={{ fontSize: compact ? 20 : 26, fontWeight: 800, margin: 0 }}>
            {lang === 'es' ? 'Crear cuenta' : 'Create Account'}
          </h2>
        </div>
      </div>

      {/* Create Account Form */}
      <form onSubmit={handleSubmit}>

        {/* Role Selection */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: BRAND.muted, marginBottom: 8 }}>
            {lang === 'es' ? '¿Cuál es tu rol en la escuela?' : "What's your role at school?"}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {ROLES.filter(r => REGISTERABLE_ROLES.includes(r.id)).map(r => (
              <button key={r.id} type="button" onClick={() => setSelectedRole(r.id)}
                style={{
                  padding: '12px 8px', borderRadius: 12,
                  border: `1.5px solid ${selectedRole === r.id ? BRAND.primary : BRAND.border}`,
                  background: selectedRole === r.id ? 'rgba(249,115,22,0.12)' : BRAND.inner,
                  color: selectedRole === r.id ? BRAND.primary : BRAND.muted,
                  cursor: 'pointer', fontSize: 11, fontWeight: 700,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  transition: 'all 0.15s',
                }}>
                <span style={{ fontSize: 20 }}>{r.icon}</span>
                {useT()(r.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Admin/support note */}
        <div style={{ background: 'rgba(37,99,235,0.08)', border: `1px solid rgba(37,99,235,0.2)`, borderRadius: 10, padding: '8px 10px', marginBottom: 20 }}>
          <span style={{ fontSize: 10, color: '#60a5fa' }}>
            {lang === 'es'
              ? '¿Eres administrador o personal de apoyo? Tu cuenta es creada por tu distrito. Contacta a tu administrador.'
              : 'Admin or support staff? Your account is created by your district. Contact your administrator.'}
          </span>
        </div>

        {/* Name row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          <div>
            <label style={lbl}>{lang === 'es' ? 'Nombre' : 'First Name'}</label>
            <input style={inp} placeholder={lang === 'es' ? 'Juan' : 'Jane'} value={firstName} onChange={e => setFirstName(e.target.value)} />
          </div>
          <div>
            <label style={lbl}>{lang === 'es' ? 'Apellido' : 'Last Name'}</label>
            <input style={inp} placeholder={lang === 'es' ? 'García' : 'Smith'} value={lastName} onChange={e => setLastName(e.target.value)} />
          </div>
        </div>

        <label style={lbl}>{useT()('email')}</label>
        <input type="email" style={inp} placeholder={useT()('enter_email')} value={email} onChange={e => setEmail(e.target.value)} />

        <div style={{ position: 'relative' }}>
          <label style={lbl}>{lang === 'es' ? 'Contraseña' : 'Password'}</label>
          <input 
            type={showPassword ? 'text' : 'password'} 
            style={inp} 
            placeholder={lang === 'es' ? 'Mínimo 6 caracteres' : 'Min. 6 characters'} 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: 12,
              top: 32,
              background: 'none',
              border: 'none',
              color: BRAND.muted,
              cursor: 'pointer',
              fontSize: 12
            }}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>

        <label style={lbl}>{lang === 'es' ? 'Código de escuela' : 'School Code'}</label>
        <input style={{ ...inp, textTransform: 'uppercase', letterSpacing: '0.1em' }}
          placeholder={lang === 'es' ? 'Ej: RIVERVIEW-2024' : 'e.g. RIVERVIEW-2024'}
          value={schoolCode} onChange={e => setSchoolCode(e.target.value)} />
        <div style={{ fontSize: 11, color: BRAND.muted, marginTop: -8, marginBottom: 14 }}>
          {lang === 'es' ? 'Opcional. Usa el código de tu escuela para obtener acceso rápido.' : 'Optional. Use your school code for quick access.'}
        </div>

        {error && <div style={{ background: '#1c1012', border: '1px solid rgba(240,74,74,0.3)', borderRadius: 10, padding: '8px 10px', color: '#f04a4a', fontSize: 12, marginBottom: 14 }}>{error}</div>}

        <button type="submit" disabled={loading || !selectedRole || !firstName || !lastName || !email || !password}
          style={{ 
            width: '100%', background: BRAND.gradient, color: '#fff', border: 'none', 
            borderRadius: 999, padding: compact ? 13 : 15, fontSize: 15, fontWeight: 800, 
            cursor: (loading || !selectedRole || !firstName || !lastName || !email || !password) ? 'not-allowed' : 'pointer', 
            opacity: (loading || !selectedRole || !firstName || !lastName || !email || !password) ? 0.7 : 1 
          }}>
          {loading ? (lang === 'es' ? 'Creando cuenta...' : 'Creating account...') : (lang === 'es' ? 'Crear cuenta' : 'Create Account')}
        </button>
      </form>
    </div>
  )
}

// ─── Mobile Login ─────────────────────────────────────────────────────────────
function MobileLogin({ form, onCreateAccount }) {
  const { selectedRole, setSelectedRole, email, setEmail, password, setPassword, error, loading, handleSubmit, handleDemoClick, lang, toggleLang } = form
  const t = useT()

  return (
    <div style={{ minHeight: '100vh', background: BRAND.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: 'Inter,Arial,sans-serif', color: BRAND.text }}>

      {/* Logo + lang toggle */}
      <div style={{ width: '100%', maxWidth: 420, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'inline-block', background: BRAND.gradient, borderRadius: 14, padding: '7px 18px' }}>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>⚡ GradeFlow</span>
        </div>
        <LangToggle onToggle={toggleLang} />
      </div>

      {/* Headline */}
      <div style={{ marginBottom: 20, textAlign: 'center', width: '100%', maxWidth: 420 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 6px', background: BRAND.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2 }}>
          {t('headline')} {t('subheadline')}
        </h1>
        <p style={{ color: BRAND.muted, fontSize: 12, margin: 0 }}>{t('body')}</p>
      </div>

      {/* Login card */}
      <div style={{ width: '100%', maxWidth: 420, background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 22, padding: '26px 22px' }}>
        <div style={{ fontSize: 10, color: BRAND.primary, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{t('demo_login')}</div>
        <h2 style={{ fontSize: 21, fontWeight: 800, margin: '0 0 18px' }}>{t('sign_in')}</h2>

        {/* Role tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6, marginBottom: 18 }}>
          {ROLES.map(r => (
            <button key={r.id} onClick={() => setSelectedRole(r.id)}
              style={{ padding: '8px 4px', borderRadius: 12, border: `1.5px solid ${selectedRole === r.id ? BRAND.primary : BRAND.border}`, background: selectedRole === r.id ? 'rgba(249,115,22,0.12)' : BRAND.inner, color: selectedRole === r.id ? BRAND.primary : BRAND.muted, cursor: 'pointer', fontSize: 10, fontWeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <span style={{ fontSize: 18 }}>{r.icon}</span>
              {t(r.labelKey)}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: BRAND.muted, marginBottom: 5 }}>{t('email')}</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('enter_email')}
            style={{ width: '100%', background: BRAND.inner, border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: '12px 14px', color: BRAND.text, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 12 }} />
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: BRAND.muted, marginBottom: 5 }}>{t('password')}</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t('enter_password')}
            style={{ width: '100%', background: BRAND.inner, border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: '12px 14px', color: BRAND.text, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 14 }} />
          {error && <div style={{ background: '#1c1012', border: '1px solid rgba(240,74,74,0.3)', borderRadius: 10, padding: '10px 12px', color: '#f04a4a', fontSize: 12, marginBottom: 14 }}>{error}</div>}
          <button type="submit" disabled={loading}
            style={{ width: '100%', background: BRAND.gradient, color: '#fff', border: 'none', borderRadius: 999, padding: 14, fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginBottom: 10 }}>
            {loading ? t('loading_data') : `${t('sign_in')} →`}
          </button>
        </form>

        {/* ── Create Account CTA ── */}
        <div style={{ borderTop: `1px solid ${BRAND.border}`, marginTop: 16, paddingTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: BRAND.muted }}>
            {lang === 'es' ? '¿No tienes cuenta?' : "Don't have an account?"}
          </span>
          <button onClick={onCreateAccount}
            style={{ background: 'none', border: 'none', color: BRAND.primary, fontSize: 12, fontWeight: 800, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
            {lang === 'es' ? 'Crear cuenta' : 'Create Account'}
          </button>
        </div>

        <div style={{ textAlign: 'center', margin: '14px 0 10px' }}>
          <span style={{ fontSize: 12, color: BRAND.muted }}>{t('or_jump')}</span>
        </div>

        {/* Quick demo */}
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: BRAND.muted, marginBottom: 10 }}>{t('quick_demo')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 8 }}>
          {demoLoginList.map(demo => (
            <button key={demo.role} onClick={() => handleDemoClick(demo)}
              style={{ background: BRAND.inner, border: `1px solid ${BRAND.border}`, borderRadius: 14, padding: '12px 10px', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = BRAND.primary}
              onMouseLeave={e => e.currentTarget.style.borderColor = BRAND.border}>
              <div style={{ fontSize: 12, fontWeight: 700, color: BRAND.text }}>{t(demo.labelKey)}</div>
              <div style={{ fontSize: 10, color: BRAND.muted, marginTop: 2 }}>{demo.school}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Feature tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginTop: 20, width: '100%', maxWidth: 420 }}>
        {[
          { icon: '📷', title: t('scan'),        body: t('grade_student_work') },
          { icon: '📋', title: t('assignments'), body: t('view_all') },
          { icon: '🔔', title: t('alerts'),      body: t('parent_messages') },
          { icon: '🎨', title: t('school'),      body: t('settings') },
        ].map(f => (
          <div key={f.title} style={{ background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 14, padding: 14 }}>
            <div style={{ fontSize: 20, marginBottom: 5 }}>{f.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 3 }}>{f.title}</div>
            <div style={{ fontSize: 11, color: BRAND.muted, lineHeight: 1.5 }}>{f.body}</div>
          </div>
        ))}
      </div>
      <p style={{ marginTop: 20, fontSize: 11, color: BRAND.muted, textAlign: 'center' }}>{t('footer_note') || "Each demo uses a real school's branding & colors throughout."}</p>
    </div>
  )
}

// ─── Desktop Login ────────────────────────────────────────────────────────────
function DesktopLogin({ form, onCreateAccount }) {
  const { selectedRole, setSelectedRole, email, setEmail, password, setPassword, error, loading, handleSubmit, handleDemoClick, lang, toggleLang } = form
  const t = useT()

  return (
    <div style={{ minHeight: '100vh', background: BRAND.bg, display: 'flex', flexDirection: 'column', fontFamily: 'Inter,Arial,sans-serif', color: BRAND.text }}>

      {/* Top bar */}
      <div style={{ background: BRAND.gradient, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 44px', height: 54 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>⚡ GradeFlow</span>
          <span style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.35)', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.88)', fontWeight: 500 }}>{t('tagline')}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <LangToggle onToggle={toggleLang} />
          {['Features', 'Schools', 'Pricing', 'About'].map(link => (
            <span key={link} style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 600, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}>
              {link}
            </span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex' }}>

        {/* Left: hero */}
        <div style={{ flex: '0 0 52%', background: 'linear-gradient(160deg,#0a0f1e 0%,#060810 60%)', borderRight: `1px solid ${BRAND.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '44px 56px' }}>
          <div>
            <h1 style={{ fontSize: 46, fontWeight: 900, lineHeight: 1.1, margin: '0 0 16px', maxWidth: 480 }}>
              <span style={{ background: BRAND.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('headline')}</span>
              <br />
              <span style={{ color: BRAND.text }}>{t('subheadline')}</span>
            </h1>
            <p style={{ color: BRAND.muted, fontSize: 15, lineHeight: 1.7, maxWidth: 400, margin: '0 0 40px' }}>{t('body')}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { icon: '📷', title: t('scan'),        body: t('grade_student_work') },
                { icon: '📋', title: t('assignments'), body: t('view_all') },
                { icon: '🔔', title: t('alerts'),      body: t('parent_messages') },
                { icon: '🎨', title: t('school'),      body: t('settings') },
              ].map(f => (
                <div key={f.icon} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BRAND.border}`, borderRadius: 16, padding: '16px 18px' }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{f.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: BRAND.text, marginBottom: 4 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: BRAND.muted, lineHeight: 1.55 }}>{f.body}</div>
                </div>
              ))}
            </div>
          </div>
          <p style={{ fontSize: 12, color: BRAND.muted, marginTop: 28 }}>{t('footer_note') || "Each demo uses a real school's branding & colors throughout."}</p>
        </div>

        {/* Right: form */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 40px', overflowY: 'auto' }}>
          <div style={{ width: '100%', maxWidth: 440 }}>
            <div style={{ fontSize: 10, color: BRAND.primary, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{t('demo_login')}</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 6px' }}>{t('sign_in')}</h2>
            <p style={{ fontSize: 13, color: BRAND.muted, margin: '0 0 24px' }}>{t('subtitle')}</p>

            {/* Role tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginBottom: 22 }}>
              {ROLES.map(r => (
                <button key={r.id} onClick={() => setSelectedRole(r.id)}
                  style={{ padding: '12px 6px', borderRadius: 14, border: `1.5px solid ${selectedRole === r.id ? BRAND.primary : BRAND.border}`, background: selectedRole === r.id ? 'rgba(249,115,22,0.12)' : BRAND.inner, color: selectedRole === r.id ? BRAND.primary : BRAND.muted, cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, transition: 'all 0.15s' }}>
                  <span style={{ fontSize: 22 }}>{r.icon}</span>
                  {t(r.labelKey)}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: BRAND.muted, marginBottom: 6 }}>{t('email')}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('enter_email')}
                style={{ width: '100%', background: BRAND.inner, border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: '14px 16px', color: BRAND.text, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 14 }} />
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: BRAND.muted, marginBottom: 6 }}>{t('password')}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t('enter_password')}
                style={{ width: '100%', background: BRAND.inner, border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: '14px 16px', color: BRAND.text, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 18 }} />
              {error && <div style={{ background: '#1c1012', border: '1px solid rgba(240,74,74,0.3)', borderRadius: 10, padding: '10px 14px', color: '#f04a4a', fontSize: 13, marginBottom: 16 }}>{error}</div>}
              <button type="submit" disabled={loading}
                style={{ width: '100%', background: BRAND.gradient, color: '#fff', border: 'none', borderRadius: 999, padding: 15, fontSize: 16, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginBottom: 12 }}>
                {loading ? t('loading_data') : `${t('sign_in')} →`}
              </button>
            </form>

            {/* ── Create Account CTA ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 0', borderBottom: `1px solid ${BRAND.border}`, marginBottom: 18 }}>
              <span style={{ fontSize: 13, color: BRAND.muted }}>
                {lang === 'es' ? '¿No tienes cuenta?' : "Don't have an account?"}
              </span>
              <button onClick={onCreateAccount}
                style={{
                  background:    `rgba(249,115,22,0.1)`,
                  border:        `1.5px solid rgba(249,115,22,0.35)`,
                  borderRadius:  999,
                  padding:       '5px 14px',
                  color:         BRAND.primary,
                  fontSize:      13,
                  fontWeight:    800,
                  cursor:        'pointer',
                  transition:    'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `rgba(249,115,22,0.2)`; e.currentTarget.style.borderColor = BRAND.primary }}
                onMouseLeave={e => { e.currentTarget.style.background = `rgba(249,115,22,0.1)`; e.currentTarget.style.borderColor = `rgba(249,115,22,0.35)` }}>
                {lang === 'es' ? '✦ Crear cuenta' : '✦ Create Account'}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{ flex: 1, height: 1, background: BRAND.border }} />
              <span style={{ fontSize: 12, color: BRAND.muted }}>{t('or_jump')}</span>
              <div style={{ flex: 1, height: 1, background: BRAND.border }} />
            </div>

            {/* Quick demo */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: BRAND.muted }}>{t('quick_demo')}</div>
              <LangToggle onToggle={toggleLang}
                style={{ background: `${BRAND.primary}18`, border: `1px solid ${BRAND.primary}40`, color: BRAND.primary }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {demoLoginList.map(demo => (
                <button key={demo.role} onClick={() => handleDemoClick(demo)}
                  style={{ background: BRAND.inner, border: `1px solid ${BRAND.border}`, borderRadius: 16, padding: '16px 14px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = BRAND.primary; e.currentTarget.style.background = 'rgba(249,115,22,0.07)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = BRAND.border; e.currentTarget.style.background = BRAND.inner }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: BRAND.text }}>{t(demo.labelKey)}</div>
                  <div style={{ fontSize: 11, color: BRAND.muted, marginTop: 3 }}>{demo.school}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function Login({ onLogin, onDemoLogin }) {
  const [isDesktop,      setIsDesktop]      = useState(() => window.innerWidth >= 900)
  const [showCreate,     setShowCreate]     = useState(false)
  const form = useLoginForm(onLogin, onDemoLogin)

  useEffect(() => {
    function handleResize() { setIsDesktop(window.innerWidth >= 900) }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // ── Create Account overlay (shared between mobile + desktop) ──────────────
  if (showCreate) {
    return (
      <div style={{
        minHeight: '100vh', background: BRAND.bg,
        display: 'flex', flexDirection: 'column',
        fontFamily: 'Inter,Arial,sans-serif', color: BRAND.text,
      }}>
        {/* Minimal top bar */}
        <div style={{ background: BRAND.gradient, height: 54, display: 'flex', alignItems: 'center', padding: '0 32px' }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>⚡ GradeFlow</span>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 24px', overflowY: 'auto' }}>
          <div style={{ width: '100%', maxWidth: 460, background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 22, padding: isDesktop ? '36px 40px' : '28px 22px' }}>
            <CreateAccountPanel
              onBack={() => setShowCreate(false)}
              onLogin={onLogin}
              compact={!isDesktop}
            />
          </div>
        </div>
      </div>
    )
  }

  return isDesktop
    ? <DesktopLogin form={form} onCreateAccount={() => setShowCreate(true)} />
    : <MobileLogin  form={form} onCreateAccount={() => setShowCreate(true)} />
}
