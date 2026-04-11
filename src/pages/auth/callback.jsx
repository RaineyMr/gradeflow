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


export default function OAuthCallback() {
  const [status, setStatus] = useState('loading') // loading, success, error
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)
  const { setAuth, lang } = useStore()

  useEffect(() => {
    handleOAuthCallback()
  }, [])

  const handleOAuthCallback = async () => {
    try {
      // Get current session after OAuth redirect
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

      // Check if user exists in teachers table
      const { data: existingTeacher, error: teacherError } = await supabase
        .from('teachers')
        .select('*')
        .eq('auth_id', currentUser.id)
        .single()

      if (teacherError && teacherError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Teacher lookup error:', teacherError)
        setStatus('error')
        setMessage(lang === 'es' 
          ? 'Error al verificar el perfil. Por favor intenta de nuevo.' 
          : 'Error checking profile. Please try again.')
        return
      }

      if (existingTeacher) {
        // User exists - create user object and redirect to dashboard
        const userObj = {
          id: existingTeacher.id,
          auth_id: currentUser.id,
          email: existingTeacher.email,
          name: existingTeacher.name,
          role: existingTeacher.role,
          school_id: existingTeacher.school_id,
          avatar_url: existingTeacher.avatar_url,
          provider: existingTeacher.provider,
          lang: lang,
          isOAuthUser: true,
        }

        setAuth(userObj)
        
        setStatus('success')
        setMessage(lang === 'es' 
          ? '¡Inicio de sesión exitoso! Redirigiendo...' 
          : 'Sign in successful! Redirecting...')

        // Redirect to appropriate dashboard
        setTimeout(() => {
          const dashboardPath = existingTeacher.role === 'teacher' ? '/teacher' : 
                              existingTeacher.role === 'student' ? '/student' :
                              existingTeacher.role === 'parent' ? '/parent' :
                              existingTeacher.role === 'admin' ? '/admin' : '/teacher'
          
          window.location.href = dashboardPath
        }, 1500)
      } else {
        // New user - store OAuth data and redirect to onboarding
        const oauthData = {
          auth_id: currentUser.id,
          email: currentUser.email,
          name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || currentUser.email.split('@')[0],
          avatar_url: currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture,
          provider: 'google',
        }

        // Store temporarily in sessionStorage for onboarding
        sessionStorage.setItem('gradeflow_oauth_temp', JSON.stringify(oauthData))
        
        setStatus('success')
        setMessage(lang === 'es' 
          ? '¡Bienvenido! Configurando tu perfil...' 
          : 'Welcome! Setting up your profile...')

        // Redirect to onboarding
        setTimeout(() => {
          window.location.href = '/onboarding'
        }, 1000)
      }

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
