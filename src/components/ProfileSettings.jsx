import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { useT } from '../lib/i18n'

export default function ProfileSettings() {
  const navigate    = useNavigate()
  const t           = useT()
  const currentUser = useStore(s => s.currentUser)

  const theme = currentUser?.theme ?? {
    primary: '#f97316',
    border:  '#1e2231',
    muted:   '#6b7494',
    soft:    'rgba(249,115,22,0.08)',
  }

  const roleLabel = currentUser?.role
    ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)
    : 'User'

  const fields = [
    { label: 'Name',   value: currentUser?.userName },
    { label: 'School', value: currentUser?.schoolName },
    { label: 'Role',   value: roleLabel },
    { label: 'Email',  value: currentUser?.email ?? 'Not set' },
  ]

  return (
    <div style={{
      padding:   '32px 20px',
      maxWidth:  520,
      margin:    '0 auto',
      fontFamily:'Inter, Arial, sans-serif',
    }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          display:    'flex',
          alignItems: 'center',
          gap:        8,
          background: 'none',
          border:     'none',
          cursor:     'pointer',
          color:      theme.muted ?? '#6b7494',
          fontSize:   13,
          marginBottom: 24,
          padding:    0,
        }}
      >
        ← {t('back_to_dashboard')}
      </button>

      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#eef0f8', marginBottom: 6 }}>
        {t('profile_settings')}
      </h1>
      <p style={{ fontSize: 13, color: theme.muted ?? '#6b7494', marginBottom: 32 }}>
        {t('account_section')}
      </p>

      <div style={{
        background:   '#161923',
        border:       `1px solid ${theme.border ?? '#1e2231'}`,
        borderRadius: 16,
        padding:      24,
        marginBottom: 20,
      }}>
        {/* Avatar row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{
            width:        56,
            height:       56,
            borderRadius: '50%',
            background:   theme.soft ?? 'rgba(249,115,22,0.14)',
            display:      'flex',
            alignItems:   'center',
            justifyContent:'center',
            fontSize:     24,
          }}>
            👤
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#eef0f8' }}>
              {currentUser?.userName}
            </div>
            <div style={{ fontSize: 12, color: theme.muted ?? '#6b7494' }}>
              {currentUser?.schoolName} · {roleLabel}
            </div>
          </div>
        </div>

        {/* Fields */}
        {fields.map(({ label, value }) => (
          <div
            key={label}
            style={{
              display:       'flex',
              justifyContent:'space-between',
              alignItems:    'center',
              padding:       '12px 0',
              borderBottom:  `1px solid ${theme.border ?? '#1e2231'}`,
            }}
          >
            <span style={{ fontSize: 13, color: theme.muted ?? '#6b7494' }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#eef0f8' }}>{value}</span>
          </div>
        ))}
      </div>

      <div style={{
        background:   theme.soft ?? 'rgba(249,115,22,0.08)',
        border:       `1px solid ${(theme.primary ?? '#f97316') + '33'}`,
        borderRadius: 12,
        padding:      '14px 18px',
        fontSize:     13,
        color:        theme.muted ?? '#6b7494',
        textAlign:    'center',
      }}>
        ✏️ Full profile editing coming soon
      </div>
    </div>
  )
}
