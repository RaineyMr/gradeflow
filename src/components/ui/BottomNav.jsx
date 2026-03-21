// src/components/ui/BottomNav.jsx
// ─── Shared Bottom Navigation ─────────────────────────────────────────────────
// Single source of truth for bottom nav across ALL roles.
// To update icons, labels, or order — change it here, affects everywhere.
//
// Usage:
//   import BottomNav from '../components/ui/BottomNav'
//
//   // On dashboard:
//   <BottomNav role="teacher" activePage={activePage} onNavigate={setActivePage} isSubPage={false} />
//
//   // On sub-page:
//   <BottomNav role="teacher" activePage={activePage} onNavigate={setActivePage} isSubPage={true} onBack={goBack} />
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react'

// ── Nav config per role ───────────────────────────────────────────────────────
// Home is always index 2 (middle of 5).
// Order: [0] [1] [HOME] [3] [4]

const NAV_ITEMS = {
  teacher: [
    { id: 'classes',        icon: '📚', label: 'Classes'  },
    { id: 'messages',       icon: '💬', label: 'Messages' },
    { id: 'dashboard',      icon: '🏠', label: 'Home'     }, // middle
    { id: 'reports',        icon: '📊', label: 'Reports'  },
    { id: 'alerts',         icon: '🔔', label: 'Alerts'   },
  ],
  admin: [
    { id: 'teachers',       icon: '👨‍🏫', label: 'Teachers' },
    { id: 'messages',       icon: '💬', label: 'Messages'  },
    { id: 'dashboard',      icon: '🏠', label: 'Home'      }, // middle
    { id: 'reports',        icon: '📊', label: 'Reports'   },
    { id: 'alerts',         icon: '🔔', label: 'Alerts'    },
  ],
  student: [
    { id: 'classes',        icon: '📚', label: 'Classes'  },
    { id: 'messages',       icon: '💬', label: 'Messages' },
    { id: 'dashboard',      icon: '🏠', label: 'Home'     }, // middle
    { id: 'feed',           icon: '📢', label: 'Feed'     },
    { id: 'alerts',         icon: '🔔', label: 'Alerts'   },
  ],
  parent: [
    { id: 'classes',        icon: '📚', label: 'Classes'  },
    { id: 'messages',       icon: '💬', label: 'Messages' },
    { id: 'dashboard',      icon: '🏠', label: 'Home'     }, // middle
    { id: 'feed',           icon: '📢', label: 'Feed'     },
    { id: 'alerts',         icon: '🔔', label: 'Alerts'   },
  ],
}

// Sub-page nav — Back replaces Home, 4 items only
const SUB_NAV_ITEMS = {
  teacher: [
    { id: '__back__',       icon: '←',  label: 'Back'     },
    { id: 'messages',       icon: '💬', label: 'Messages' },
    { id: 'classes',        icon: '📚', label: 'Classes'  },
    { id: 'reports',        icon: '📊', label: 'Reports'  },
    { id: 'alerts',         icon: '🔔', label: 'Alerts'   },
  ],
  admin: [
    { id: '__back__',       icon: '←',  label: 'Back'     },
    { id: 'messages',       icon: '💬', label: 'Messages' },
    { id: 'teachers',       icon: '👨‍🏫', label: 'Teachers' },
    { id: 'reports',        icon: '📊', label: 'Reports'  },
    { id: 'alerts',         icon: '🔔', label: 'Alerts'   },
  ],
  student: [
    { id: '__back__',       icon: '←',  label: 'Back'     },
    { id: 'messages',       icon: '💬', label: 'Messages' },
    { id: 'classes',        icon: '📚', label: 'Classes'  },
    { id: 'feed',           icon: '📢', label: 'Feed'     },
    { id: 'alerts',         icon: '🔔', label: 'Alerts'   },
  ],
  parent: [
    { id: '__back__',       icon: '←',  label: 'Back'     },
    { id: 'messages',       icon: '💬', label: 'Messages' },
    { id: 'classes',        icon: '📚', label: 'Classes'  },
    { id: 'feed',           icon: '📢', label: 'Feed'     },
    { id: 'alerts',         icon: '🔔', label: 'Alerts'   },
  ],
}

// ── School color per role (fallback if no CSS var) ────────────────────────────
const ROLE_COLORS = {
  teacher: '#f97316',
  admin:   '#7c3aed',
  student: '#2563eb',
  parent:  '#0891b2',
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function BottomNav({ role = 'teacher', activePage, onNavigate, isSubPage = false, onBack }) {
  const color   = `var(--school-color, ${ROLE_COLORS[role] || '#f97316'})`
  const items   = isSubPage
    ? (SUB_NAV_ITEMS[role] || SUB_NAV_ITEMS.teacher)
    : (NAV_ITEMS[role]     || NAV_ITEMS.teacher)

  function handleTap(item) {
    if (item.id === '__back__') {
      onBack?.()
      return
    }
    // 'dashboard' always goes to the role dashboard
    onNavigate?.(item.id === 'dashboard' ? role : item.id)
  }

  // Determine active item
  function isActive(item) {
    if (item.id === '__back__') return false
    if (item.id === 'dashboard') return activePage === role || activePage === 'dashboard'
    return activePage === item.id
  }

  return (
    <nav
      style={{
        position:    'fixed',
        bottom:       0,
        left:         0,
        right:        0,
        zIndex:       100,
        background:  'rgba(6,8,16,0.97)',
        borderTop:   '1px solid #1e2231',
        backdropFilter: 'blur(12px)',
        padding:     'env(safe-area-inset-bottom, 0px)',
        paddingTop:  0,
        display:     'grid',
        gridTemplateColumns: `repeat(${items.length}, 1fr)`,
        fontFamily:  'Inter, Arial, sans-serif',
      }}
    >
      {items.map((item, i) => {
        const active  = isActive(item)
        const isBack  = item.id === '__back__'
        const isHome  = item.id === 'dashboard'

        return (
          <button
            key={item.id + i}
            onClick={() => handleTap(item)}
            style={{
              background:   'transparent',
              border:        'none',
              cursor:        'pointer',
              padding:      '10px 4px 12px',
              display:      'flex',
              flexDirection: 'column',
              alignItems:   'center',
              justifyContent: 'center',
              gap:            3,
              // Home gets a subtle pill highlight
              ...(isHome && !isSubPage ? {
                background:   `${color}18`,
                borderRadius:  12,
                margin:       '4px 6px',
              } : {}),
            }}
          >
            {/* Icon */}
            <span
              style={{
                fontSize:   isBack ? 20 : 22,
                lineHeight:  1,
                color:       active ? color : isBack ? '#eef0f8' : '#6b7494',
                fontWeight:  isBack ? 700 : 'normal',
                // Active indicator dot under home
                ...(isHome && !isSubPage && active ? {
                  filter: 'drop-shadow(0 0 6px currentColor)',
                } : {}),
              }}
            >
              {item.icon}
            </span>

            {/* Label */}
            <span
              style={{
                fontSize:   9,
                fontWeight:  active ? 700 : 500,
                color:       active ? color : '#6b7494',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}
            >
              {item.label}
            </span>

            {/* Active underline dot */}
            {active && !isBack && (
              <span
                style={{
                  width:        16,
                  height:        2,
                  borderRadius:  1,
                  background:    color,
                  position:     'absolute',
                  bottom:        6,
                }}
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}
