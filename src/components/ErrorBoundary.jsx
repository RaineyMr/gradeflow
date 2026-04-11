import React from 'react'

const BRAND = {
  primary: '#f97316',
  bg: '#060810',
  card: '#0c0e14',
  text: '#eef0f8',
  muted: '#6b7494',
  border: '#2a2f42',
}

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Store error details in state
    this.setState({
      error: error,
      errorInfo: errorInfo
    })

    // In production, you might want to send this to an error reporting service
    if (import.meta.env.PROD) {
      // Example: sendErrorToService(error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      const { lang = 'en' } = this.props
      const isDevelopment = import.meta.env.DEV

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
            maxWidth: 500,
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
              ⚠️
            </div>

            <h2 style={{
              fontSize: 20,
              fontWeight: 700,
              margin: '0 0 10px',
              color: BRAND.text
            }}>
              {lang === 'es' ? 'Algo salió mal' : 'Something went wrong'}
            </h2>
            
            <p style={{
              fontSize: 14,
              color: BRAND.muted,
              margin: '0 0 20px',
              lineHeight: 1.5
            }}>
              {lang === 'es' 
                ? 'Ha ocurrido un error inesperado. Por favor intenta de nuevo.'
                : 'An unexpected error has occurred. Please try again.'}
            </p>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              marginBottom: 20
            }}>
              <button
                onClick={this.handleRetry}
                style={{
                  background: BRAND.primary,
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

              <button
                onClick={this.handleReload}
                style={{
                  background: 'transparent',
                  color: BRAND.text,
                  border: `1px solid ${BRAND.border}`,
                  borderRadius: 12,
                  padding: '12px 24px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = BRAND.primary
                  e.currentTarget.style.color = BRAND.primary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = BRAND.border
                  e.currentTarget.style.color = BRAND.text
                }}
              >
                {lang === 'es' ? 'Recargar página' : 'Reload Page'}
              </button>
            </div>

            {/* Error Details (Development Only) */}
            {isDevelopment && this.state.error && (
              <details style={{
                textAlign: 'left',
                marginTop: 20,
                padding: '16px',
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${BRAND.border}`,
                borderRadius: 8,
                fontSize: 12
              }}>
                <summary style={{
                  cursor: 'pointer',
                  fontWeight: 600,
                  marginBottom: 8,
                  color: BRAND.primary
                }}>
                  {lang === 'es' ? 'Detalles del error (desarrollo)' : 'Error Details (Development)'}
                </summary>
                
                <div style={{ marginBottom: 12 }}>
                  <strong style={{ color: BRAND.text }}>
                    {lang === 'es' ? 'Error:' : 'Error:'}
                  </strong>
                  <pre style={{
                    margin: '4px 0',
                    padding: '8px',
                    background: 'rgba(240,74,74,0.1)',
                    border: '1px solid rgba(240,74,74,0.3)',
                    borderRadius: 4,
                    color: '#f04a4a',
                    fontSize: 11,
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {this.state.error.toString()}
                  </pre>
                </div>

                {this.state.errorInfo && (
                  <div>
                    <strong style={{ color: BRAND.text }}>
                      {lang === 'es' ? 'Component Stack:' : 'Component Stack:'}
                    </strong>
                    <pre style={{
                      margin: '4px 0',
                      padding: '8px',
                      background: 'rgba(255,255,255,0.02)',
                      border: `1px solid ${BRAND.border}`,
                      borderRadius: 4,
                      fontSize: 10,
                      overflow: 'auto',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </details>
            )}

            {/* Support Info */}
            <div style={{
              fontSize: 12,
              color: BRAND.muted,
              marginTop: 20
            }}>
              {lang === 'es' 
                ? 'Si el problema persiste, contacta al soporte técnico.'
                : 'If the problem persists, please contact technical support.'}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
