import React from 'react'
import { useStore } from '@lib/store'
import { useHashRouter } from '@hooks/useHashRouter'
import { hashToPage, getCurrentHash } from '@lib/hashRouter'

export default function HashRouterDemo() {
  const { currentUser, page, setPage, resetToHome, goBack } = useStore()
  const { navigateToPage, navigateToHome } = useHashRouter()

  return (
    <div style={{
      padding: '20px',
      background: '#1e2231',
      borderRadius: '8px',
      margin: '20px',
      color: '#eef0f8'
    }}>
      <h3>Hash Router Demo</h3>
      
      <div style={{ marginBottom: '16px' }}>
        <strong>Current Hash:</strong> {getCurrentHash()}
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <strong>Parsed Page:</strong> {hashToPage(getCurrentHash())}
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <strong>Store Page:</strong> {page}
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <strong>Current User Role:</strong> {currentUser?.role || 'None'}
      </div>
      
      {/* Navigation Methods */}
      <div style={{ marginBottom: '20px' }}>
        <h4>Navigation Methods:</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <button
            onClick={() => navigateToHome()}
            style={{
              padding: '8px 12px',
              background: '#f97316',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            navigateToHome()
          </button>
          
          <button
            onClick={() => navigateToPage('gradebook')}
            style={{
              padding: '8px 12px',
              background: '#3b7ef4',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            navigateToPage('gradebook')
          </button>
          
          <button
            onClick={() => navigateToPage('messages')}
            style={{
              padding: '8px 12px',
              background: '#22c97a',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            navigateToPage('messages')
          </button>
          
          <button
            onClick={() => navigateToPage('reports')}
            style={{
              padding: '8px 12px',
              background: '#f04a4a',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            navigateToPage('reports')
          </button>
        </div>
      </div>

      {/* Store Methods */}
      <div style={{ marginBottom: '20px' }}>
        <h4>Direct Store Methods:</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <button
            onClick={() => setPage('gradebook')}
            style={{
              padding: '8px 12px',
              background: '#9b6ef5',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            setPage('gradebook')
          </button>
          
          <button
            onClick={() => resetToHome()}
            style={{
              padding: '8px 12px',
              background: '#0fb8a0',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            resetToHome()
          </button>
          
          <button
            onClick={() => goBack()}
            style={{
              padding: '8px 12px',
              background: '#f5a623',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            goBack()
          </button>
        </div>
      </div>
      
      <div style={{ marginTop: '16px', fontSize: '12px', color: '#6b7494' }}>
        <strong>Test Instructions:</strong><br/>
        • Try all navigation methods<br/>
        • Test browser back/forward buttons<br/>
        • Check that URLs update correctly<br/>
        • Verify hash and store state sync
      </div>
    </div>
  )
}
