import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useStore } from '../lib/store'

const BRAND = {
  primary: '#f97316',
  blue: '#2563EB',
  bg: '#060810',
  card: '#0c0e14',
  inner: '#1e2231',
  text: '#eef0f8',
  muted: '#6b7494',
  border: '#2a2f42',
  gradient: 'linear-gradient(135deg, #f97316 0%, #2563EB 100%)',
}

const ROLES = [
  { id: 'teacher', labelKey: 'teacher_label', icon: '🧑‍🏫' },
  { id: 'student', labelKey: 'student_label_tab', icon: '🎓' },
  { id: 'parent', labelKey: 'parent_label_tab', icon: '👪' },
  { id: 'admin', labelKey: 'admin_label_tab', icon: '🏫' },
]

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedSchool, setSelectedSchool] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [oauthData, setOAuthData] = useState(null)
  const { schools, setAuth, lang } = useStore()

  useEffect(() => {
    // Retrieve OAuth data from sessionStorage
    const tempData = sessionStorage.getItem('gradeflow_oauth_temp')
    if (!tempData) {
      // No OAuth data found, redirect to login
      window.location.href = '/'
      return
    }

    try {
      const parsed = JSON.parse(tempData)
      setOAuthData(parsed)
    } catch (err) {
      console.error('Failed to parse OAuth data:', err)
      sessionStorage.removeItem('gradeflow_oauth_temp')
      window.location.href = '/'
    }
  }, [])

  const handleRoleNext = () => {
    if (!selectedRole) {
      setError(lang === 'es' ? 'Por favor selecciona un rol' : 'Please select a role')
      return
    }
    setError('')
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedRole || !selectedSchool) {
      setError(lang === 'es' 
        ? 'Por favor completa todos los campos' 
        : 'Please complete all fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Insert new teacher record
      const { data: newTeacher, error: insertError } = await supabase
        .from('teachers')
        .insert({
          auth_id: oauthData.auth_id,
          email: oauthData.email,
          name: oauthData.name,
          role: selectedRole,
          school_id: selectedSchool,
          avatar_url: oauthData.avatar_url,
          provider: oauthData.provider,
          onboarded_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (insertError) {
        console.error('Teacher creation error:', insertError)
        setError(lang === 'es' 
          ? 'Error al crear tu perfil. Por favor intenta de nuevo.' 
          : 'Error creating your profile. Please try again.')
        setLoading(false)
        return
      }

      // Clear temporary OAuth data
      sessionStorage.removeItem('gradeflow_oauth_temp')

      // Create user object for auth
      const userObj = {
        id: newTeacher.id,
        auth_id: oauthData.auth_id,
        email: oauthData.email,
        name: oauthData.name,
        role: selectedRole,
        school_id: selectedSchool,
        school: schools.find(s => s.id === selectedSchool),
        avatar_url: oauthData.avatar_url,
        provider: oauthData.provider,
        lang: lang,
        isOAuthUser: true,
      }

      // Set auth state
      setAuth(userObj)

      // Redirect to appropriate dashboard
      const dashboardPath = selectedRole === 'teacher' ? '/teacher' : 
                          selectedRole === 'student' ? '/student' :
                          selectedRole === 'parent' ? '/parent' :
                          selectedRole === 'admin' ? '/admin' : '/teacher'
      
      window.location.href = dashboardPath

    } catch (err) {
      console.error('Onboarding error:', err)
      setError(lang === 'es' 
        ? 'Error inesperado. Por favor intenta de nuevo.' 
        : 'Unexpected error. Please try again.')
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
      setError('')
    } else {
      // Cancel onboarding - clear temp data and redirect to login
      sessionStorage.removeItem('gradeflow_oauth_temp')
      window.location.href = '/'
    }
  }

  if (!oauthData) {
    // Loading state while checking for OAuth data
    return (
      <div style={{
        minHeight: '100vh',
        background: BRAND.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, Arial, sans-serif',
        color: BRAND.text
      }}>
        <div style={{ fontSize: 16 }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: BRAND.bg,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, Arial, sans-serif',
      color: BRAND.text
    }}>
      {/* Header */}
      <div style={{
        background: BRAND.gradient,
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>⚡ GradeFlow</span>
          <span style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.35)' }} />
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.88)', fontWeight: 500 }}>
            {lang === 'es' ? 'Configuración de Cuenta' : 'Account Setup'}
          </span>
        </div>
        <button
          onClick={handleBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.75)',
            fontSize: 13,
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: 4
          }}
        >
          {step === 1 ? (lang === 'es' ? 'Cancelar' : 'Cancel') : (lang === 'es' ? 'Atrás' : 'Back')}
        </button>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px'
      }}>
        <div style={{
          background: BRAND.card,
          border: `1px solid ${BRAND.border}`,
          borderRadius: 20,
          padding: '40px',
          maxWidth: 500,
          width: '100%'
        }}>
          {/* User Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 32,
            padding: '20px',
            background: BRAND.inner,
            borderRadius: 12
          }}>
            {oauthData.avatar_url && (
              <img 
                src={oauthData.avatar_url} 
                alt="Profile"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            )}
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.text }}>
                {oauthData.name}
              </div>
              <div style={{ fontSize: 13, color: BRAND.muted }}>
                {oauthData.email}
              </div>
              <div style={{ fontSize: 11, color: BRAND.primary, marginTop: 4 }}>
                {lang === 'es' ? 'Cuenta de Google' : 'Google Account'}
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div style={{
            display: 'flex',
            gap: 8,
            marginBottom: 32,
            alignItems: 'center'
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: step >= 1 ? BRAND.primary : BRAND.inner,
              border: `2px solid ${step >= 1 ? BRAND.primary : BRAND.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              color: step >= 1 ? '#fff' : BRAND.muted
            }}>
              1
            </div>
            <div style={{
              flex: 1,
              height: 2,
              background: step >= 2 ? BRAND.primary : BRAND.border
            }} />
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: step >= 2 ? BRAND.primary : BRAND.inner,
              border: `2px solid ${step >= 2 ? BRAND.primary : BRAND.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              color: step >= 2 ? '#fff' : BRAND.muted
            }}>
              2
            </div>
          </div>

          {step === 1 && (
            <>
              <h2 style={{
                fontSize: 20,
                fontWeight: 700,
                margin: '0 0 12px',
                color: BRAND.text
              }}>
                {lang === 'es' ? '¿Cuál es tu rol?' : 'What is your role?'}
              </h2>
              <p style={{
                fontSize: 14,
                color: BRAND.muted,
                margin: '0 0 24px',
                lineHeight: 1.5
              }}>
                {lang === 'es' 
                  ? 'Selecciona tu rol en la escuela para configurar tu experiencia.'
                  : 'Select your role at school to set up your experience.'}
              </p>

              {/* Role Selection */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12,
                marginBottom: 24
              }}>
                {ROLES.map(role => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    style={{
                      padding: '20px 16px',
                      borderRadius: 12,
                      border: `2px solid ${selectedRole === role.id ? BRAND.primary : BRAND.border}`,
                      background: selectedRole === role.id ? 'rgba(249,115,22,0.1)' : BRAND.inner,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'center'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedRole !== role.id) {
                        e.currentTarget.style.borderColor = BRAND.primary
                        e.currentTarget.style.background = 'rgba(249,115,22,0.05)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedRole !== role.id) {
                        e.currentTarget.style.borderColor = BRAND.border
                        e.currentTarget.style.background = BRAND.inner
                      }
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{role.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: BRAND.text }}>
                      {role.id === 'teacher' ? (lang === 'es' ? 'Maestro' : 'Teacher') :
                       role.id === 'student' ? (lang === 'es' ? 'Estudiante' : 'Student') :
                       role.id === 'parent' ? (lang === 'es' ? 'Padre/Madre' : 'Parent') :
                       role.id === 'admin' ? (lang === 'es' ? 'Administrador' : 'Admin') : role.id}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleRoleNext}
                disabled={!selectedRole}
                style={{
                  width: '100%',
                  background: selectedRole ? BRAND.gradient : 'rgba(255,255,255,0.1)',
                  color: selectedRole ? '#fff' : BRAND.muted,
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: selectedRole ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s ease'
                }}
              >
                {lang === 'es' ? 'Continuar' : 'Continue'}
              </button>
            </>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <h2 style={{
                fontSize: 20,
                fontWeight: 700,
                margin: '0 0 12px',
                color: BRAND.text
              }}>
                {lang === 'es' ? 'Selecciona tu escuela' : 'Select your school'}
              </h2>
              <p style={{
                fontSize: 14,
                color: BRAND.muted,
                margin: '0 0 24px',
                lineHeight: 1.5
              }}>
                {lang === 'es' 
                  ? 'Elige tu escuela para aplicar la configuración correcta.'
                  : 'Choose your school to apply the correct settings.'}
              </p>

              {/* School Selection */}
              <div style={{ marginBottom: 24 }}>
                <label style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: BRAND.muted,
                  marginBottom: 8
                }}>
                  {lang === 'es' ? 'Escuela' : 'School'}
                </label>
                <select
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: BRAND.inner,
                    border: `1px solid ${BRAND.border}`,
                    borderRadius: 12,
                    padding: '14px 16px',
                    color: BRAND.text,
                    fontSize: 14,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">
                    {lang === 'es' ? 'Selecciona tu escuela...' : 'Select your school...'}
                  </option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>
                      {school.name} ({school.address})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Role Display */}
              <div style={{
                background: BRAND.inner,
                border: `1px solid ${BRAND.border}`,
                borderRadius: 8,
                padding: '12px',
                marginBottom: 24
              }}>
                <div style={{ fontSize: 12, color: BRAND.muted, marginBottom: 4 }}>
                  {lang === 'es' ? 'Rol seleccionado:' : 'Selected role:'}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: BRAND.text }}>
                  {selectedRole === 'teacher' ? (lang === 'es' ? 'Maestro' : 'Teacher') :
                   selectedRole === 'student' ? (lang === 'es' ? 'Estudiante' : 'Student') :
                   selectedRole === 'parent' ? (lang === 'es' ? 'Padre/Madre' : 'Parent') :
                   selectedRole === 'admin' ? (lang === 'es' ? 'Administrador' : 'Admin') : selectedRole}
                </div>
              </div>

              {error && (
                <div style={{
                  background: 'rgba(240,74,74,0.1)',
                  border: '1px solid rgba(240,74,74,0.3)',
                  borderRadius: 8,
                  padding: '12px',
                  color: '#f04a4a',
                  fontSize: 13,
                  marginBottom: 20
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !selectedSchool}
                style={{
                  width: '100%',
                  background: (loading || !selectedSchool) ? 'rgba(255,255,255,0.1)' : BRAND.gradient,
                  color: (loading || !selectedSchool) ? BRAND.muted : '#fff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: (loading || !selectedSchool) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {loading 
                  ? (lang === 'es' ? 'Creando perfil...' : 'Creating profile...')
                  : (lang === 'es' ? 'Completar configuración' : 'Complete Setup')
                }
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
