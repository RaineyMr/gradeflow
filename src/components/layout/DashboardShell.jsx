import React, { useEffect } from 'react'
import BottomNav from '../ui/BottomNav'

// School theme map — mirrors Dashboard.jsx SCHOOL_THEMES.
// Add new schools here; all dashboards pick it up automatically.
const SCHOOL_THEMES = {
  kipp:     { primary:'#BA0C2F', secondary:'#000000', surface:'#1a0008', text:'#ffe8ed' },
  hisd:     { primary:'#003057', secondary:'#B3A369', surface:'#000d1a', text:'#e8f0ff' },
  bellaire: { primary:'#B3A369', secondary:'#003057', surface:'#1a1800', text:'#faf7ee' },
  lamar:    { primary:'#461D7C', secondary:'#FDD023', surface:'#0e0718', text:'#f3e8ff' },
}

function applyTheme(key) {
  const t = SCHOOL_THEMES[key] || SCHOOL_THEMES.kipp
  const r = document.documentElement
  r.style.setProperty('--school-color',     t.primary)
  r.style.setProperty('--school-secondary', t.secondary)
  r.style.setProperty('--school-surface',   t.surface)
  r.style.setProperty('--school-text',      t.text)
}

/**
 * DashboardShell — wraps any role dashboard with BottomNav and theme setup.
 *
 * This is the ONE place to change:
 *   - How BottomNav is rendered across all dashboards
 *   - Theme application logic
 *   - Any global shell behavior (e.g. loading states, error boundaries)
 *
 * Props:
 *   role        — 'teacher' | 'student' | 'parent' | 'admin'
 *   activeNav   — current active nav item id (string)
 *   onNavSelect — handler passed to BottomNav onSelect
 *   isSubPage   — boolean; controls back-arrow visibility in BottomNav
 *   themeKey    — optional key from SCHOOL_THEMES (defaults to 'kipp')
 *   children    — the dashboard page content
 *
 * Usage:
 *
 *   // Instead of the withNav() inline pattern:
 *   const shell = (node) => (
 *     <DashboardShell
 *       role="teacher"
 *       activeNav={activeNav}
 *       onNavSelect={navSelect}
 *       isSubPage={isSubPage}
 *       themeKey="kipp"
 *     >
 *       {node}
 *     </DashboardShell>
 *   )
 *
 *   return shell(<MyPage onBack={goBack}/>)
 */
export default function DashboardShell({ role, activeNav, onNavSelect, isSubPage, themeKey, children }) {
  useEffect(() => {
    applyTheme(themeKey)
  }, [themeKey])

  return (
    <>
      {children}
      <BottomNav
        role={role}
        active={activeNav}
        onSelect={onNavSelect}
        isSubPage={isSubPage}
      />
    </>
  )
}
