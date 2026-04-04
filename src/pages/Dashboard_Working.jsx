import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { useT } from '../lib/i18n'
import BottomNav from '../components/ui/BottomNav'

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

function scrollTop() {
  window.scrollTo(0, 0)
  document.querySelector('[data-app-scroll]')?.scrollTo(0, 0)
}

// ─── Real User Header ──────────────────────────────────────────────────────────
function UserHeader({ currentUser }) {
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  
  return (
    <div style={{ 
      position: 'sticky', top: 0, zIndex: 100, 
      background: 'linear-gradient(135deg, var(--school-color) 0%, var(--school-surface,#0a000a) 100%)', 
      padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 2 }}>
            {currentUser?.school?.toUpperCase() || 'SCHOOL'} · {currentUser?.gradeLevel || 'TEACHER'}
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
            {greeting}, {currentUser?.name?.split(' ')?.pop() || 'Teacher'} 👋
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
          {timeStr}
        </div>
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
        {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>
    </div>
  )
}

// ─── Quick Actions Widget ─────────────────────────────────────────────────────
function QuickActions({ navigate }) {
  const t = useT()
  
  return (
    <div style={{ 
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, 
      padding: '20px', marginBottom: 16 
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 16 }}>
        ⚡ Quick Actions
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        <button onClick={() => navigate('gradebook')} 
          style={{ 
            background: 'var(--school-color, #BA0C2F)', color: '#fff', border: 'none', 
            borderRadius: 12, padding: '16px', fontSize: 13, fontWeight: 700, 
            cursor: 'pointer', textAlign: 'left', transition: 'transform 0.15s' 
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
          📚 Gradebook
        </button>
        <button onClick={() => navigate('lessons')} 
          style={{ 
            background: C.blue, color: '#fff', border: 'none', 
            borderRadius: 12, padding: '16px', fontSize: 13, fontWeight: 700, 
            cursor: 'pointer', textAlign: 'left', transition: 'transform 0.15s' 
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
          📋 Lesson Plans
        </button>
        <button onClick={() => navigate('testing')} 
          style={{ 
            background: C.green, color: '#fff', border: 'none', 
            borderRadius: 12, padding: '16px', fontSize: 13, fontWeight: 700, 
            cursor: 'pointer', textAlign: 'left', transition: 'transform 0.15s' 
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
          📝 Create Test
        </button>
        <button onClick={() => navigate('messages')} 
          style={{ 
            background: C.purple, color: '#fff', border: 'none', 
            borderRadius: 12, padding: '16px', fontSize: 13, fontWeight: 700, 
            cursor: 'pointer', textAlign: 'left', transition: 'transform 0.15s' 
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
          💬 Messages
        </button>
      </div>
    </div>
  )
}

// ─── Classes Overview Widget ───────────────────────────────────────────────────
function ClassesOverview({ currentUser, navigate }) {
  const { classes } = useStore()
  
  return (
    <div style={{ 
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, 
      padding: '20px', marginBottom: 16 
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 16 }}>
        📚 My Classes
      </div>
      
      {classes.length === 0 ? (
        // No classes yet - show setup options
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 24, marginBottom: 12 }}>🎯</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>
            Ready to set up your classes?
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>
            Choose how you'd like to add your classes and students
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            <button onClick={() => navigate('classes/create')} 
              style={{ 
                background: C.blue, color: '#fff', border: 'none', 
                borderRadius: 12, padding: '16px', fontSize: 13, fontWeight: 700, 
                cursor: 'pointer', textAlign: 'left', transition: 'transform 0.15s' 
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              ✏️ Create Classes
              <div style={{ fontSize: 10, opacity: 0.8, marginTop: 4 }}>
                Manually set up periods and subjects
              </div>
            </button>
            
            <button onClick={() => navigate('classes/upload')} 
              style={{ 
                background: C.green, color: '#fff', border: 'none', 
                borderRadius: 12, padding: '16px', fontSize: 13, fontWeight: 700, 
                cursor: 'pointer', textAlign: 'left', transition: 'transform 0.15s' 
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              📤 Upload Roster
              <div style={{ fontSize: 10, opacity: 0.8, marginTop: 4 }}>
                CSV, Excel, or PDF files
              </div>
            </button>
            
            <button onClick={() => navigate('camera')} 
              style={{ 
                background: C.purple, color: '#fff', border: 'none', 
                borderRadius: 12, padding: '16px', fontSize: 13, fontWeight: 700, 
                cursor: 'pointer', textAlign: 'left', transition: 'transform 0.15s' 
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              📸 Scan Document
              <div style={{ fontSize: 10, opacity: 0.8, marginTop: 4 }}>
                Camera scan for class lists
              </div>
            </button>
            
            <button onClick={() => navigate('classes/import')} 
              style={{ 
                background: C.amber, color: '#fff', border: 'none', 
                borderRadius: 12, padding: '16px', fontSize: 13, fontWeight: 700, 
                cursor: 'pointer', textAlign: 'left', transition: 'transform 0.15s' 
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              🔄 Import from SIS
              <div style={{ fontSize: 10, opacity: 0.8, marginTop: 4 }}>
                Connect your school system
              </div>
            </button>
          </div>
          
          <div style={{ 
            background: `${C.blue}10`, border: `1px solid ${C.blue}30`, 
            borderRadius: 12, padding: '12px', marginTop: 16, fontSize: 11, color: C.blue 
          }}>
            💡 <strong>Tip:</strong> You can always add more classes or update student lists later
          </div>
        </div>
      ) : (
        // Show existing classes
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {classes.map(cls => (
            <div key={cls.id} 
              onClick={() => navigate('gradebook')} 
              style={{ 
                background: C.inner, border: `1px solid ${C.border}`, borderRadius: 12, 
                padding: '16px', cursor: 'pointer', transition: 'all 0.15s' 
              }}
              onMouseEnter={e => { 
                e.currentTarget.style.borderColor = 'var(--school-color, #BA0C2F)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => { 
                e.currentTarget.style.borderColor = C.border
                e.currentTarget.style.transform = 'translateY(0px)'
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ 
                  width: 8, height: 8, borderRadius: '50%', 
                  background: cls.color || 'var(--school-color, #BA0C2F)' 
                }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                    {cls.period} · {cls.subject}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted }}>
                    {cls.students} students · GPA {cls.gpa}%
                  </div>
                </div>
              </div>
              {cls.needsAttention > 0 && (
                <div style={{ 
                  background: `${C.red}20`, border: `1px solid ${C.red}40`, 
                  borderRadius: 6, padding: '4px 8px', fontSize: 10, 
                  color: C.red, fontWeight: 700, display: 'inline-block' 
                }}>
                  ⚠️ {cls.needsAttention} need attention
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                <span style={{ fontSize: 11, color: C.muted }}>Trend:</span>
                <span style={{ 
                  fontSize: 11, fontWeight: 700, 
                  color: cls.trend === 'up' ? C.green : cls.trend === 'down' ? C.red : C.muted 
                }}>
                  {cls.trend === 'up' ? '↑' : cls.trend === 'down' ? '↓' : '→'} {cls.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {classes.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={() => navigate('classes/create')} 
            style={{ 
              background: C.inner, color: C.text, border: `1px solid ${C.border}`, 
              borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600, 
              cursor: 'pointer' 
            }}>
            + Add Another Class
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Profile Summary Widget ───────────────────────────────────────────────────
function ProfileSummary({ currentUser }) {
  const t = useT()
  
  return (
    <div style={{ 
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, 
      padding: '20px', marginBottom: 16 
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 16 }}>
        👤 My Profile
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>School</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
            {currentUser?.school || 'Not set'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Grade Level</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
            {currentUser?.gradeLevel || 'Not set'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Subjects</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
            {currentUser?.subjects?.join(', ') || 'Not set'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Email</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
            {currentUser?.email || 'Not set'}
          </div>
        </div>
      </div>
      
      {!currentUser?.gradeLevel && (
        <div style={{ 
          background: `${C.amber}20`, border: `1px solid ${C.amber}40`, 
          borderRadius: 8, padding: '12px', marginTop: 16 
        }}>
          <div style={{ fontSize: 12, color: C.amber, fontWeight: 700, marginBottom: 4 }}>
            ⚠️ Profile Incomplete
          </div>
          <div style={{ fontSize: 11, color: C.text }}>
            Please complete your teacher profile setup to access all features.
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Working Dashboard ─────────────────────────────────────────────────────
export default function WorkingDashboard({ currentUser, onCameraClick }) {
  const navigate = useNavigate()
  const [subPage, setSubPage] = useState(null)
  const history = useRef([])

  useEffect(() => { scrollTop() }, [])

  function goHome() {
    history.current = []
    setSubPage(null)
    scrollTop()
  }

  function goBack() {
    history.current.pop()
    const prev = history.current[history.current.length - 1] || null
    if (!prev) { 
      goHome()
      return 
    }
    setSubPage(prev)
    scrollTop()
  }

  function navigateToPage(page) {
    if (!page) return
    if (page === 'dashboard') { goHome(); return }
    history.current.push(page)
    setSubPage(page)
    scrollTop()
  }

  const activeNav = subPage ? subPage : 'dashboard'

  function withNav(node) {
    return (
      <>
        {node}
        <BottomNav active={activeNav} onSelect={navigateToPage} isSubPage={!!subPage} role="teacher"/>
      </>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', background: C.bg, color: C.text, 
      fontFamily: "'DM Sans','Helvetica Neue',sans-serif", paddingBottom: 90 
    }}>
      <UserHeader currentUser={currentUser} />
      
      <div style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
          {/* Main Content */}
          <div>
            <QuickActions navigate={navigateToPage} />
            <ClassesOverview currentUser={currentUser} navigate={navigateToPage} />
          </div>
          
          {/* Sidebar */}
          <div>
            <ProfileSummary currentUser={currentUser} />
          </div>
        </div>
      </div>
    </div>
  )
}
