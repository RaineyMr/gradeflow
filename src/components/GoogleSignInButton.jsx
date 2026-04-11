import React, { useState } from 'react'
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

export default function GoogleSignInButton({ onSuccess, onError, compact = false }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { lang } = useStore()

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        console.error('Google OAuth error:', error)
        const errorMessage = lang === 'es' 
          ? 'Error al iniciar sesión con Google. Inténtalo de nuevo.' 
          : 'Failed to sign in with Google. Please try again.'
        setError(errorMessage)
        onError?.(error)
      } else {
        // The redirect will happen automatically, no need to handle success here
        onSuccess?.(data)
      }
    } catch (err) {
      console.error('Unexpected Google OAuth error:', err)
      const errorMessage = lang === 'es' 
        ? 'Error inesperado. Inténtalo de nuevo más tarde.' 
        : 'Unexpected error. Please try again later.'
      setError(errorMessage)
      onError?.(err)
    } finally {
      setLoading(false)
    }
  }

  const buttonStyle = {
    width: '100%',
    background: BRAND.inner,
    border: `1.5px solid ${BRAND.border}`,
    borderRadius: compact ? 12 : 14,
    padding: compact ? '12px 16px' : '14px 18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
    transition: 'all 0.15s ease',
    fontSize: compact ? 14 : 15,
    fontWeight: 600,
    color: BRAND.text,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: error ? 10 : 0,
  }

  const hoverStyle = {
    borderColor: BRAND.primary,
    background: 'rgba(249,115,22,0.05)',
  }

  return (
    <div>
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        style={buttonStyle}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.borderColor = BRAND.primary
            e.currentTarget.style.background = 'rgba(249,115,22,0.05)'
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.currentTarget.style.borderColor = BRAND.border
            e.currentTarget.style.background = BRAND.inner
          }
        }}
        aria-label={lang === 'es' ? 'Iniciar sesión con Google' : 'Sign in with Google'}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleGoogleSignIn()
          }
        }}
      >
        {/* Google Icon */}
        <svg 
          width={compact ? 18 : 20} 
          height={compact ? 18 : 20} 
          viewBox="0 0 24 24" 
          style={{ flexShrink: 0 }}
          aria-hidden="true"
        >
          <path 
            fill="#4285F4" 
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path 
            fill="#34A853" 
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path 
            fill="#FBBC05" 
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path 
            fill="#EA4335" 
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>

        {/* Button Text */}
        <span style={{ fontSize: compact ? 13 : 14, fontWeight: 700 }}>
          {loading 
            ? (lang === 'es' ? 'Conectando...' : 'Connecting...')
            : (lang === 'es' ? 'Continuar con Google' : 'Continue with Google')
          }
        </span>

        {/* Loading Spinner */}
        {loading && (
          <div 
            style={{
              width: 16,
              height: 16,
              border: '2px solid rgba(255,255,255,0.3)',
              borderTop: `2px solid ${BRAND.primary}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              position: 'absolute',
              right: 16,
            }}
          />
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div 
          style={{
            background: 'rgba(240,74,74,0.1)',
            border: '1px solid rgba(240,74,74,0.3)',
            borderRadius: 8,
            padding: '8px 12px',
            color: '#f04a4a',
            fontSize: 12,
            marginTop: 8,
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}

      {/* CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
