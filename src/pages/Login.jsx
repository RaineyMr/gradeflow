import React, { useState, useEffect } from 'react'
import { useStore } from '../lib/store'
import { useT } from '../lib/i18n'
import { demoLoginList, getDemoAccountByCredentials } from '../lib/demoAccounts'

const ROLES = [
  { id: 'teacher',      labelKey: 'teacher_label',      icon: '🧑‍🏫' },
  { id: 'student',      labelKey: 'student_label_tab',  icon: '🎓'   },
  { id: 'parent',       labelKey: 'parent_label_tab',   icon: '👪'   },
  { id: 'admin',        labelKey: 'admin_label_tab',    icon: '🏫'   },
  { id: 'supportStaff', labelKey: 'support_label',     icon: '📣'   },
]

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

// ─── Language toggle button ───────────────────────────────────────────────────
function LangToggle({ onToggle, style = {} }) {
  const t = useT()
  const { lang } = useStore()
  return (
    <button
      onClick={onToggle}
      style={{
        background:   'rgba(255,255,255,0.12)',
        border:       '1.5px solid rgba(255,255,255,0.25)',
        borderRadius: 999,
        padding:      '5px 12px',
        color:        '#fff',
        fontSize:     12,
        fontWeight:   800,
        cursor:       'pointer',
        display:      'flex',
        alignItems:   'center',
        gap:          5,
        letterSpacing:'0.04em',
        transition:   'background 0.15s',
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

// ─── Shared form state ────────────────────────────────────────────────────────
function useLoginForm(onLogin, onDemoLogin) {
  const [selectedRole, setSelectedRole] = useState('teacher')
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [error,        setError]        = useState('')
  const [loading,      setLoading]      = useState(false)
  const { lang, setLang } = useStore()

  function toggleLang() { 
    const newLang = lang === 'en' ? 'es' : 'en'
    setLang(newLang)
  }

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
    if (account) { 
      window.scrollTo(0, 0); 
      onDemoLogin?.({ ...account, lang: lang }) // Use current language, not account.lang
    }
  }

  return { selectedRole, setSelectedRole, email, setEmail, password, setPassword, error, loading, handleSubmit, handleDemoClick, lang, toggleLang }
}

// ─── Mobile Login ─────────────────────────────────────────────────────────────
function MobileLogin({ form }) {
  const { selectedRole, setSelectedRole, email, setEmail, password, setPassword, error, loading, handleSubmit, handleDemoClick, lang, toggleLang } = form
  const t = useT()

  return (
    <div style={{ minHeight:'100vh', background:BRAND.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px 16px', fontFamily:'Inter,Arial,sans-serif', color:BRAND.text }}>

      {/* Logo + lang toggle row */}
      <div style={{ width:'100%', maxWidth:420, display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div style={{ display:'inline-block', background:BRAND.gradient, borderRadius:14, padding:'7px 18px' }}>
          <span style={{ fontSize:17, fontWeight:800, color:'#fff' }}>⚡ GradeFlow</span>
        </div>
        <LangToggle lang={lang} onToggle={toggleLang}/>
      </div>

      {/* Headline */}
      <div style={{ marginBottom:20, textAlign:'center', width:'100%', maxWidth:420 }}>
        <h1 style={{ fontSize:24, fontWeight:900, margin:'0 0 6px', background:BRAND.gradient, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', lineHeight:1.2 }}>
          {t('headline')} {t('subheadline')}
        </h1>
        <p style={{ color:BRAND.muted, fontSize:12, margin:0 }}>{t('body')}</p>
      </div>

      {/* Login card */}
      <div style={{ width:'100%', maxWidth:420, background:BRAND.card, border:`1px solid ${BRAND.border}`, borderRadius:22, padding:'26px 22px' }}>
        <div style={{ fontSize:10, color:BRAND.primary, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:6 }}>{t('demo_login')}</div>
        <h2 style={{ fontSize:21, fontWeight:800, margin:'0 0 18px' }}>{t('sign_in')}</h2>

        {/* Role tabs */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6, marginBottom:18 }}>
          {ROLES.map(r => (
            <button key={r.id} onClick={() => setSelectedRole(r.id)}
              style={{ padding:'8px 4px', borderRadius:12, border:`1.5px solid ${selectedRole===r.id?BRAND.primary:BRAND.border}`, background:selectedRole===r.id?'rgba(249,115,22,0.12)':BRAND.inner, color:selectedRole===r.id?BRAND.primary:BRAND.muted, cursor:'pointer', fontSize:10, fontWeight:700, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
              <span style={{ fontSize:18 }}>{r.icon}</span>
              {t(r.labelKey)}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:BRAND.muted, marginBottom:5 }}>{t('email')}</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('enter_email')}
            style={{ width:'100%', background:BRAND.inner, border:`1px solid ${BRAND.border}`, borderRadius:12, padding:'12px 14px', color:BRAND.text, fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:12 }}/>
          <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:BRAND.muted, marginBottom:5 }}>{t('password')}</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t('enter_password')}
            style={{ width:'100%', background:BRAND.inner, border:`1px solid ${BRAND.border}`, borderRadius:12, padding:'12px 14px', color:BRAND.text, fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:14 }}/>
          {error && <div style={{ background:'#1c1012', border:'1px solid rgba(240,74,74,0.3)', borderRadius:10, padding:'10px 12px', color:'#f04a4a', fontSize:12, marginBottom:14 }}>{error}</div>}
          <button type="submit" disabled={loading}
            style={{ width:'100%', background:BRAND.gradient, color:'#fff', border:'none', borderRadius:999, padding:14, fontSize:15, fontWeight:800, cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1, marginBottom:10 }}>
            {loading ? t('loading_data') : `${t('sign_in')} →`}
          </button>
        </form>

        <div style={{ textAlign:'center', marginBottom:16 }}>
          <span style={{ fontSize:12, color:BRAND.muted }}>{t('or_jump')}</span>
        </div>

        {/* Quick demo */}
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:BRAND.muted, marginBottom:10 }}>{t('quick_demo')}</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:8 }}>
          {demoLoginList.map(demo => (
            <button key={demo.role} onClick={() => handleDemoClick(demo)}
              style={{ background:BRAND.inner, border:`1px solid ${BRAND.border}`, borderRadius:14, padding:'12px 10px', cursor:'pointer', textAlign:'left', transition:'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor=BRAND.primary}
              onMouseLeave={e => e.currentTarget.style.borderColor=BRAND.border}>
              <div style={{ fontSize:15, marginBottom:4 }}>{t(demo.labelKey).split(' ')[0]}</div>
              <div style={{ fontSize:12, fontWeight:700, color:BRAND.text }}>{t(demo.labelKey)}</div>
              <div style={{ fontSize:10, color:BRAND.muted, marginTop:2 }}>{demo.school}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Feature tiles */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10, marginTop:20, width:'100%', maxWidth:420 }}>
        {[
          { icon:'📷', title:t('scan'), body:t('grade_student_work') },
          { icon:'📋', title:t('assignments'), body:t('view_all') },
          { icon:'🔔', title:t('alerts'), body:t('parent_messages') },
          { icon:'🎨', title:t('school'), body:t('settings') },
        ].slice(0,4).map(f => (
          <div key={f.title} style={{ background:BRAND.card, border:`1px solid ${BRAND.border}`, borderRadius:14, padding:14 }}>
            <div style={{ fontSize:20, marginBottom:5 }}>{f.icon}</div>
            <div style={{ fontSize:11, fontWeight:700, marginBottom:3 }}>{f.title}</div>
            <div style={{ fontSize:11, color:BRAND.muted, lineHeight:1.5 }}>{f.body}</div>
          </div>
        ))}
      </div>
      <p style={{ marginTop:20, fontSize:11, color:BRAND.muted, textAlign:'center' }}>{t('footer_note') || "Each demo uses a real school's branding & colors throughout."}</p>
    </div>
  )
}

// ─── Desktop Login ─────────────────────────────────────────────────────────────
function DesktopLogin({ form }) {
  const { selectedRole, setSelectedRole, email, setEmail, password, setPassword, error, loading, handleSubmit, handleDemoClick, lang, toggleLang } = form
  const t = useT()

  return (
    <div style={{ minHeight:'100vh', background:BRAND.bg, display:'flex', flexDirection:'column', fontFamily:'Inter,Arial,sans-serif', color:BRAND.text }}>

      {/* Top bar */}
      <div style={{ background:BRAND.gradient, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 44px', height:54 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <span style={{ fontSize:18, fontWeight:900, color:'#fff' }}>⚡ GradeFlow</span>
          <span style={{ width:1, height:20, background:'rgba(255,255,255,0.35)', flexShrink:0 }}/>
          <span style={{ fontSize:13, color:'rgba(255,255,255,0.88)', fontWeight:500 }}>{t('tagline')}</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          {/* Spanish toggle — prominent in top bar */}
          <LangToggle lang={lang} onToggle={toggleLang}/>
          {['Features','Schools','Pricing','About'].map(link => (
            <span key={link} style={{ fontSize:13, color:'rgba(255,255,255,0.75)', fontWeight:600, cursor:'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color='#fff'}
              onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.75)'}>
              {link}
            </span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:'flex' }}>

        {/* Left: hero */}
        <div style={{ flex:'0 0 52%', background:'linear-gradient(160deg,#0a0f1e 0%,#060810 60%)', borderRight:`1px solid ${BRAND.border}`, display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'44px 56px' }}>
          <div>
            <h1 style={{ fontSize:46, fontWeight:900, lineHeight:1.1, margin:'0 0 16px', maxWidth:480 }}>
              <span style={{ background:BRAND.gradient, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{t('headline')}</span>
              <br/>
              <span style={{ color:BRAND.text }}>{t('subheadline')}</span>
            </h1>
            <p style={{ color:BRAND.muted, fontSize:15, lineHeight:1.7, maxWidth:400, margin:'0 0 40px' }}>{t('body')}</p>

            {/* Feature grid */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[
              { icon:'📷', title:t('scan'), body:t('grade_student_work') },
              { icon:'📋', title:t('assignments'), body:t('view_all') },
              { icon:'🔔', title:t('alerts'), body:t('parent_messages') },
              { icon:'🎨', title:t('school'), body:t('settings') },
            ].map(f => (
                <div key={f.icon} style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${BRAND.border}`, borderRadius:16, padding:'16px 18px' }}>
                  <div style={{ fontSize:22, marginBottom:8 }}>{f.icon}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:BRAND.text, marginBottom:4 }}>{f.title}</div>
                  <div style={{ fontSize:12, color:BRAND.muted, lineHeight:1.55 }}>{f.body}</div>
                </div>
              ))}
            </div>
          </div>
          <p style={{ fontSize:12, color:BRAND.muted, marginTop:28 }}>{t('footer_note') || "Each demo uses a real school's branding & colors throughout."}</p>
        </div>

        {/* Right: form */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'48px 40px', overflowY:'auto' }}>
          <div style={{ width:'100%', maxWidth:440 }}>
            <div style={{ fontSize:10, color:BRAND.primary, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:6 }}>{t('demo_login')}</div>
            <h2 style={{ fontSize:28, fontWeight:800, margin:'0 0 6px' }}>{t('sign_in')}</h2>
            <p style={{ fontSize:13, color:BRAND.muted, margin:'0 0 24px' }}>{t('subtitle')}</p>

            {/* Role tabs */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8, marginBottom:22 }}>
              {ROLES.map(r => (
                <button key={r.id} onClick={() => setSelectedRole(r.id)}
                  style={{ padding:'12px 6px', borderRadius:14, border:`1.5px solid ${selectedRole===r.id?BRAND.primary:BRAND.border}`, background:selectedRole===r.id?'rgba(249,115,22,0.12)':BRAND.inner, color:selectedRole===r.id?BRAND.primary:BRAND.muted, cursor:'pointer', fontSize:12, fontWeight:700, display:'flex', flexDirection:'column', alignItems:'center', gap:4, transition:'all 0.15s' }}>
                  <span style={{ fontSize:22 }}>{r.icon}</span>
                  {t(r.labelKey)}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:BRAND.muted, marginBottom:6 }}>{t('email')}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('enter_email')}
                style={{ width:'100%', background:BRAND.inner, border:`1px solid ${BRAND.border}`, borderRadius:12, padding:'14px 16px', color:BRAND.text, fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:14 }}/>
              <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:BRAND.muted, marginBottom:6 }}>{t('password')}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t('enter_password')}
                style={{ width:'100%', background:BRAND.inner, border:`1px solid ${BRAND.border}`, borderRadius:12, padding:'14px 16px', color:BRAND.text, fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:18 }}/>
              {error && <div style={{ background:'#1c1012', border:'1px solid rgba(240,74,74,0.3)', borderRadius:10, padding:'10px 14px', color:'#f04a4a', fontSize:13, marginBottom:16 }}>{error}</div>}
              <button type="submit" disabled={loading}
                style={{ width:'100%', background:BRAND.gradient, color:'#fff', border:'none', borderRadius:999, padding:15, fontSize:16, fontWeight:800, cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1, marginBottom:12 }}>
                {loading ? t('loading_data') : `${t('sign_in')} →`}
              </button>
            </form>

            <div style={{ display:'flex', alignItems:'center', gap:10, margin:'4px 0 18px' }}>
              <div style={{ flex:1, height:1, background:BRAND.border }}/>
              <span style={{ fontSize:12, color:BRAND.muted }}>{t('or_jump')}</span>
              <div style={{ flex:1, height:1, background:BRAND.border }}/>
            </div>

            {/* Quick demo — with lang toggle nearby */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:BRAND.muted }}>{t('quick_demo')}</div>
              {/* Second lang toggle — right next to demo buttons */}
              <LangToggle lang={lang} onToggle={toggleLang}
                style={{ background:`${BRAND.primary}18`, border:`1px solid ${BRAND.primary}40`, color:BRAND.primary }}/>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {demoLoginList.map(demo => (
                <button key={demo.role} onClick={() => handleDemoClick(demo)} data-testid={`${demo.role}-demo`}
                  style={{ background:BRAND.inner, border:`1px solid ${BRAND.border}`, borderRadius:16, padding:'16px 14px', cursor:'pointer', textAlign:'left', transition:'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor=BRAND.primary; e.currentTarget.style.background='rgba(249,115,22,0.07)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor=BRAND.border; e.currentTarget.style.background=BRAND.inner }}>
                  <div style={{ fontSize:20, marginBottom:5 }}>{t(demo.labelKey).split(' ')[0]}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:BRAND.text }}>{t(demo.labelKey)}</div>
                  <div style={{ fontSize:11, color:BRAND.muted, marginTop:3 }}>{demo.school}</div>
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
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 900)
  const form = useLoginForm(onLogin, onDemoLogin)

  useEffect(() => {
    function handleResize() { setIsDesktop(window.innerWidth >= 900) }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return isDesktop
    ? <DesktopLogin  form={form}/>
    : <MobileLogin   form={form}/>
}
