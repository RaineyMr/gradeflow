import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useStore } from '../../lib/store'

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

// Role determination based on email domain and patterns
function determineUserRole(email, userMetadata) {
  const emailLower = email.toLowerCase()
  
  // Houston ISD domain patterns
  if (emailLower.includes('@houstonsd.org') || emailLower.includes('@houstonisd.org')) {
    return 'teacher'
  }
  
  // KIPP domain patterns
  if (emailLower.includes('@kipp') || emailLower.includes('kipp')) {
    return 'teacher'
  }
  
  // YES Prep domain patterns
  if (emailLower.includes('@yesprep') || emailLower.includes('yes-prep')) {
    return 'teacher'
  }
  
  // ReNEW Schools domain patterns
  if (emailLower.includes('@renew') || emailLower.includes('renew-schools')) {
    return 'teacher'
  }
  
  // Collegiate Academies domain patterns
  if (emailLower.includes('@collegiate') || emailLower.includes('collegiate-academies')) {
    return 'teacher'
  }
  
  // Archdiocese domain patterns
  if (emailLower.includes('@archdiocese') || emailLower.includes('@nolacatholic')) {
    return 'teacher'
  }
  
  // Student patterns (typically have numbers or graduation years)
  if (/\d{4}/.test(emailLower) || emailLower.includes('student') || emailLower.includes('stu.')) {
    return 'student'
  }
  
  // Parent patterns (often include parent-related keywords)
  if (emailLower.includes('parent') || emailLower.includes('mom') || emailLower.includes('dad')) {
    return 'parent'
  }
  
  // Admin patterns (admin, principal, superintendent keywords)
  if (emailLower.includes('admin') || emailLower.includes('principal') || emailLower.includes('superintendent') || emailLower.includes('director')) {
    return 'admin'
  }
  
  // Default to teacher for unknown domains (most common use case)
  return 'teacher'
}

// Find school based on email domain
function findSchoolByDomain(email, schools) {
  const emailLower = email.toLowerCase()
  
  // Houston ISD
  if (emailLower.includes('houstonisd.org') || emailLower.includes('houstonsd.org')) {
    return schools.find(s => s.district_id === 'houston-isd' && s.type === 'high_school') || 
           schools.find(s => s.district_id === 'houston-isd')
  }
  
  // KIPP Louisiana
  if (emailLower.includes('kipp') && (emailLower.includes('.org') || emailLower.includes('kippneworleans'))) {
    return schools.find(s => s.district_id === 'kipp-la') || 
           schools.find(s => s.district_id === 'kipp-texas')
  }
  
  // YES Prep
  if (emailLower.includes('yesprep')) {
    return schools.find(s => s.district_id === 'yes-prep-nola') || 
           schools.find(s => s.district_id === 'yes-prep-tx')
  }
  
  // ReNEW Schools
  if (emailLower.includes('renew')) {
    return schools.find(s => s.district_id === 'renew-nola')
  }
  
  // Collegiate Academies
  if (emailLower.includes('collegiate')) {
    return schools.find(s => s.district_id === 'collegiate-nola')
  }
  
  // Archdiocese
  if (emailLower.includes('archdiocese') || emailLower.includes('nolacatholic')) {
    return schools.find(s => s.district_id === 'archdiocese-nola')
  }
  
  // Fallback to a default school
  return schools.find(s => s.id === 'JFK-HIGH') || schools[0]
}

export default function OAuthCallback() {
  const [status, setStatus] = useState('loading') // loading, success, error
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)
  const { setAuth, lang, schools } = useStore()

  useEffect(() => {
    handleOAuthCallback()
  }, [])

  const handleOAuthCallback = async () => {
    try {
      // Get the current session after OAuth redirect
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Session error:', error)
        setStatus('error')
        setMessage(lang === 'es' 
          ? 'Error al obtener la sesión. Por favor intenta de nuevo.' 
          : 'Failed to get session. Please try again.')
        return
      }

      if (!session?.user) {
        setStatus('error')
        setMessage(lang === 'es' 
          ? 'No se encontró la sesión. Por favor inicia sesión de nuevo.' 
          : 'No session found. Please sign in again.')
        return
      }

      const currentUser = session.user
      setUser(currentUser)

      // Determine user role based on email
      const role = determineUserRole(currentUser.email, currentUser.user_metadata)
      
      // Find appropriate school
      const school = findSchoolByDomain(currentUser.email, schools)
      
      // Create user object for the app
      const userObj = {
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || currentUser.email.split('@')[0],
        role: role,
        school_id: school?.id || 'JFK-HIGH',
        school: school,
        avatar_url: currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture,
        lang: lang,
        isOAuthUser: true,
        provider: 'google',
        needsOnboarding: role === 'teacher', // Teachers need profile setup
      }

      // Set auth state
      setAuth(userObj)
      
      setStatus('success')
      setMessage(lang === 'es' 
        ? '¡Inicio de sesión exitoso! Redirigiendo...' 
        : 'Sign in successful! Redirecting...')

      // Redirect to appropriate dashboard after a short delay
      setTimeout(() => {
        const dashboardPath = role === 'teacher' ? '/teacher' : 
                            role === 'student' ? '/student' :
                            role === 'parent' ? '/parent' :
                            role === 'admin' ? '/admin' : '/teacher'
        
        window.location.href = dashboardPath
      }, 1500)

    } catch (err) {
      console.error('OAuth callback error:', err)
      setStatus('error')
      setMessage(lang === 'es' 
        ? 'Error inesperado durante el inicio de sesión. Por favor intenta de nuevo.' 
        : 'Unexpected error during sign in. Please try again.')
    }
  }

  const handleRetry = () => {
    window.location.href = '/'
  }

  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        background: BRAND.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, Arial, sans-serif',
        color: BRAND.text,
        padding: '20px'
      }}>
        <div style={{
          background: BRAND.card,
          border: `1px solid ${BRAND.border}`,
          borderRadius: 20,
          padding: '40px 30px',
          textAlign: 'center',
          maxWidth: 400,
          width: '100%'
        }}>
          {/* Loading Spinner */}
          <div style={{
            width: 48,
            height: 48,
            border: '3px solid rgba(255,255,255,0.1)',
            borderTop: `3px solid ${BRAND.primary}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />

          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            margin: '0 0 10px',
            color: BRAND.text
          }}>
            {lang === 'es' ? 'Procesando inicio de sesión...' : 'Processing sign in...'}
          </h2>
          
          <p style={{
            fontSize: 14,
            color: BRAND.muted,
            margin: 0,
            lineHeight: 1.5
          }}>
            {lang === 'es' 
              ? 'Estamos configurando tu cuenta. Esto solo tomará un momento.' 
              : 'We are setting up your account. This will only take a moment.'}
          </p>
        </div>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div style={{
        minHeight: '100vh',
        background: BRAND.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, Arial, sans-serif',
        color: BRAND.text,
        padding: '20px'
      }}>
        <div style={{
          background: BRAND.card,
          border: `1px solid ${BRAND.border}`,
          borderRadius: 20,
          padding: '40px 30px',
          textAlign: 'center',
          maxWidth: 400,
          width: '100%'
        }}>
          {/* Success Icon */}
          <div style={{
            width: 64,
            height: 64,
            background: 'rgba(34, 201, 122, 0.1)',
            border: '2px solid #22c97a',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: 28
          }}>
            ✓
          </div>

          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            margin: '0 0 10px',
            color: BRAND.text
          }}>
            {lang === 'es' ? '¡Bienvenido!' : 'Welcome!'}
          </h2>
          
          {user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              margin: '15px 0',
              padding: '12px',
              background: BRAND.inner,
              borderRadius: 12,
              border: `1px solid ${BRAND.border}`
            }}>
              {user.user_metadata?.avatar_url && (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Profile"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              )}
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: BRAND.text }}>
                  {user.user_metadata?.full_name || user.user_metadata?.name || user.email}
                </div>
                <div style={{ fontSize: 12, color: BRAND.muted }}>
                  {user.email}
                </div>
              </div>
            </div>
          )}
          
          <p style={{
            fontSize: 14,
            color: BRAND.muted,
            margin: 0,
            lineHeight: 1.5
          }}>
            {message}
          </p>

          <div style={{
            width: 32,
            height: 2,
            background: BRAND.primary,
            margin: '20px auto 0',
            borderRadius: 1,
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
        </div>

        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: scaleX(0.8); }
            50% { opacity: 1; transform: scaleX(1); }
          }
        `}</style>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div style={{
        minHeight: '100vh',
        background: BRAND.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, Arial, sans-serif',
        color: BRAND.text,
        padding: '20px'
      }}>
        <div style={{
          background: BRAND.card,
          border: `1px solid ${BRAND.border}`,
          borderRadius: 20,
          padding: '40px 30px',
          textAlign: 'center',
          maxWidth: 400,
          width: '100%'
        }}>
          {/* Error Icon */}
          <div style={{
            width: 64,
            height: 64,
            background: 'rgba(240, 74, 74, 0.1)',
            border: '2px solid #f04a4a',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: 28
          }}>
            ✕
          </div>

          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            margin: '0 0 10px',
            color: BRAND.text
          }}>
            {lang === 'es' ? 'Error en el inicio de sesión' : 'Sign In Error'}
          </h2>
          
          <p style={{
            fontSize: 14,
            color: BRAND.muted,
            margin: '0 0 20px',
            lineHeight: 1.5
          }}>
            {message}
          </p>

          <button
            onClick={handleRetry}
            style={{
              background: BRAND.gradient,
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(249,115,22,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {lang === 'es' ? 'Intentar de nuevo' : 'Try Again'}
          </button>
        </div>
      </div>
    )
  }

  return null
}
