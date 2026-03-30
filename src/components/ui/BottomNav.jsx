// src/components/ui/BottomNav.jsx
import React from 'react'
import { useT } from '../../lib/i18n'

export default function BottomNav({ active, onSelect, isSubPage, role: roleProp }) {
  const t    = useT()
  const role = roleProp || 'teacher'

  const NAV = {
    teacher: [
      { id:'classes',   icon:'📚', label: t('nav_classes')  },
      { id:'messages',  icon:'💬', label: t('nav_messages') },
      { id:'widgets',   icon:'🧩', label: 'Widgets'        },
      { id:'reports',   icon:'📊', label: t('nav_reports')  },
      { id:'alerts',    icon:'🔔', label: t('nav_alerts')   },
    ],
    admin: [
      { id:'teachers',  icon:'👨‍🏫', label: t('nav_teachers') },
      { id:'messages',  icon:'💬', label: t('nav_messages')  },
      { id:'widgets',   icon:'🧩', label: 'Widgets'          },
      { id:'reports',   icon:'📊', label: t('nav_reports')   },
      { id:'alerts',    icon:'🔔', label: t('nav_alerts')    },
    ],
    student: [
      { id:'classes',   icon:'📚', label: t('nav_classes')  },
      { id:'messages',  icon:'💬', label: t('nav_messages') },
      { id:'widgets',   icon:'🧩', label: 'Widgets'         },
      { id:'feed',      icon:'📢', label: t('nav_feed')     },
      { id:'alerts',    icon:'🔔', label: t('nav_alerts')   },
    ],
    parent: [
      { id:'classes',   icon:'📚', label: t('nav_classes')  },
      { id:'messages',  icon:'💬', label: t('nav_messages') },
      { id:'widgets',   icon:'🧩', label: 'Widgets'         },
      { id:'feed',      icon:'📢', label: t('nav_feed')     },
      { id:'alerts',    icon:'🔔', label: t('nav_alerts')   },
    ],
    supportStaff: [
      { id:'groups',    icon:'👥', label: 'Groups'         },
      { id:'messages',  icon:'💬', label: t('nav_messages')},
      { id:'notes',     icon:'📝', label: 'Notes'          },
      { id:'trends',    icon:'📊', label: 'Trends'         },
      { id:'alerts',    icon:'🔔', label: t('nav_alerts')  },
    ],
  }

  const SUB_NAV = {
    teacher: [
      { id:'__back__',  icon:'←',  label: t('nav_back')     },
      { id:'messages',  icon:'💬', label: t('nav_messages') },
      { id:'classes',   icon:'📚', label: t('nav_classes')  },
      { id:'reports',   icon:'📊', label: t('nav_reports')  },
      { id:'alerts',    icon:'🔔', label: t('nav_alerts')   },
    ],
    admin: [
      { id:'__back__',  icon:'←',  label: t('nav_back')     },
      { id:'messages',  icon:'💬', label: t('nav_messages') },
      { id:'teachers',  icon:'👨‍🏫', label: t('nav_teachers') },
      { id:'reports',   icon:'📊', label: t('nav_reports')  },
      { id:'alerts',    icon:'🔔', label: t('nav_alerts')   },
    ],
    student: [
      { id:'__back__',  icon:'←',  label: t('nav_back')     },
      { id:'grades',    icon:'📋', label: t('nav_grades')   },
      { id:'widgets',   icon:'🧩', label: 'Widgets'         },
      { id:'feed',      icon:'📢', label: t('nav_feed')     },
      { id:'alerts',    icon:'🔔', label: t('nav_alerts')   },
    ],
    parent: [
      { id:'__back__',  icon:'←',  label: t('nav_back')     },
      { id:'grades',    icon:'📋', label: t('nav_grades')   },
      { id:'widgets',   icon:'🧩', label: 'Widgets'         },
      { id:'feed',      icon:'📢', label: t('nav_feed')     },
      { id:'alerts',    icon:'🔔', label: t('nav_alerts')   },
    ],
    supportStaff: [
      { id:'__back__',  icon:'←',  label: t('nav_back')     },
      { id:'groups',    icon:'👥', label: 'Groups'          },
      { id:'messages',  icon:'💬', label: t('nav_messages') },
      { id:'notes',     icon:'📝', label: 'Notes'           },
      { id:'trends',    icon:'📊', label: 'Trends'          },
    ],
  }

  const items = isSubPage
    ? (SUB_NAV[role] || SUB_NAV.teacher)
    : (NAV[role]     || NAV.teacher)

  return (
    <nav style={{
      position:       'fixed',
      bottom:         0,
      left:           0,
      right:          0,
      zIndex:         200,
      background:     'rgba(6,8,16,0.97)',
      backdropFilter: 'blur(20px)',
      borderTop:      '1px solid rgba(255,255,255,0.07)',
      display:        'flex',
      paddingBottom:  'max(8px, env(safe-area-inset-bottom))',
    }}>
      {items.map(item => {
        const isActive = item.id === active
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            style={{
              flex:            1,
              background:      'none',
              border:          'none',
              cursor:          'pointer',
              display:         'flex',
              flexDirection:   'column',
              alignItems:      'center',
              justifyContent:  'center',
              gap:             2,
              padding:         '10px 4px 6px',
              color:           isActive ? 'var(--school-color)' : 'rgba(255,255,255,0.65)',
              fontSize:        item.icon === '←' ? 20 : 18,
              fontWeight:      700,
              transition:      'color 0.15s',
              position:        'relative',
            }}>
            <span style={{ fontSize: item.icon === '←' ? 20 : 18, lineHeight: 1 }}>{item.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.02em', color: isActive ? 'var(--school-color)' : 'rgba(255,255,255,0.65)' }}>
              {item.label}
            </span>
            {isActive && (
              <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:24, height:2, background:'var(--school-color)', borderRadius:1 }}/>
            )}
          </button>
        )
      })}
    </nav>
  )
}
