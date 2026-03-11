import React, { useState } from 'react'

// ─── SHARED DATA ──────────────────────────────────────────────────────────────
const STUDENT_DATA = {
  name: 'Marcus',
  subtitle: '3rd Grade · Lincoln Elementary',
  gpa: 87.4,
  classes: 4,
  assignments: 3,
  updates: 2,
  todaysLesson: {
    title: 'Ch.4 · Fractions & Decimals',
    sub: 'Math · Pages 84–91 · Ms. Johnson · Based on teacher plan',
    more: '+3 more today',
  },
  myClasses: [
    { name: 'Math',    teacher: 'Ms. Johnson', gpa: 95.0, color: '#3b7ef4', badge: '⭐', badgeColor: '#22c97a' },
    { name: 'Reading', teacher: 'Ms. Johnson', gpa: 82.0, color: '#9b6ef5', badge: '',   badgeColor: '#f5a623' },
    { name: 'Science', teacher: 'Ms. Johnson', gpa: 61.0, color: '#0fb8a0', badge: '⚑', badgeColor: '#f04a4a' },
    { name: 'Writing', teacher: 'Ms. Johnson', gpa: 88.0, color: '#f54a7a', badge: '',   badgeColor: '#22c97a' },
  ],
  needsAttention: 'Science below 70% · Study tips available',
  messages: [
    { id: 1, from: 'Ms. Johnson', preview: 'Don\'t forget worksheet due Friday!', time: '1h ago' },
  ],
  feed: [
    { id: 1, title: '📅 Test Friday — Ch. 4 & 5!', meta: 'Ms. Johnson · 1hr ago · Read: 18/24', reactions: '👍 12  ❤️ 5  😂 2  ·  😕 3 confused  ·  ❓ 5 questions' },
  ],
  aiTip: { headline: 'Science needs your focus! 📚', body: '10 min flashcards tonight · same strategy that boosted Reading +8pts' },
}

const PARENT_DATA = {
  ...STUDENT_DATA,
  childName: 'Marcus',
  // parent header differs
  parentName: 'Ms. Thompson',
  subtitle: 'Viewing: Marcus · 3rd Grade · Lincoln Elementary',
  // Daily overview: ⚑ instead of 📋Assignments
  attention: 1,
  todaysLesson: {
    title: 'Ch.4 · Fractions & Decimals · Math',
    sub: 'Pages 84–91 · Ms. Johnson · Parent view of Marcus\'s lessons',
    more: null,
  },
  needsAttention: 'Science 61% · Study tips available for Marcus',
  feedSub: 'Parent can react + respond',
  aiTipLabel: '✨ AI Tips for Marcus',
  // private teacher messages toggle
  privateMessages: [
    { id: 1, from: 'Ms. Thompson', preview: 'Hi Ms. Thompson, Marcus is struggling with fractions...', reactions: '👍 ❤️ 😂' },
  ],
}

// ─── THEME PRESETS ────────────────────────────────────────────────────────────
const STUDENT_THEME = {
  headerGradient: 'linear-gradient(135deg, #ea580c 0%, #db2777 100%)',
  headerGreeting: 'Good Morning! 🌟',
  heroIcon: '🎒',
  navActive: '#f97316',
  navItems: [
    { id: 'home', icon: '⊞', label: 'Home' },
    { id: 'grades', icon: '📚', label: 'Grades' },
    { id: 'feed', icon: '📢', label: 'Feed' },
    { id: 'messages', icon: '💬', label: 'Messages' },
    { id: 'calendar', icon: '📅', label: 'Calendar' },
  ],
}
const PARENT_THEME = {
  headerGradient: 'linear-gradient(135deg, #0f766e 0%, #1d4ed8 100%)',
  headerGreeting: null,
  heroIcon: null,
  navActive: '#0fb8a0',
  navItems: [
    { id: 'home', icon: '⊞', label: 'Home' },
    { id: 'grades', icon: '📚', label: 'Grades' },
    { id: 'feed', icon: '📢', label: 'Feed' },
    { id: 'messages', icon: '💬', label: 'Messages' },
    { id: 'calendar', icon: '📅', label: 'Calendar' },
  ],
}

// ─── WIDGET: DAILY OVERVIEW ───────────────────────────────────────────────────
function DailyOverview({ data, isParent }) {
  const tiles = isParent
    ? [
        { icon: '📊', value: data.gpa, label: 'GPA' },
        { icon: '📚', value: data.classes, label: 'Classes' },
        { icon: '⚑',  value: data.attention, label: 'Attention' },
        { icon: '🔔', value: data.updates,  label: 'Updates' },
      ]
    : [
        { icon: '📊', value: data.gpa, label: 'GPA' },
        { icon: '📚', value: data.classes, label: 'Classes' },
        { icon: '📋', value: data.assignments, label: 'Assignments' },
        { icon: '🔔', value: data.updates, label: 'Updates' },
      ]
  return (
    <div style={{
      borderRadius: 18, padding: '14px 16px 18px',
      background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
      marginBottom: 12,
    }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>
        {isParent ? "MARCUS'S DAILY OVERVIEW" : 'DAILY OVERVIEW'}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
        {tiles.map(t => (
          <div key={t.label} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 13, padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{t.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{t.value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>{t.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── WIDGET: TODAY'S LESSONS ──────────────────────────────────────────────────
function TodaysLessons({ data, isParent }) {
  return (
    <div style={{
      borderRadius: 18, padding: '14px 16px',
      background: 'linear-gradient(135deg, #064e3b 0%, #1e3a5f 100%)',
      border: '1px solid #1a3a2a', marginBottom: 12,
    }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>TODAY'S LESSONS 📖</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#eef0f8', marginBottom: 4 }}>{data.todaysLesson.title}</div>
      <div style={{ fontSize: 10, color: '#6b7494', marginBottom: 10 }}>{data.todaysLesson.sub}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {!isParent && (
          <div style={{ background: 'rgba(59,126,244,0.2)', borderRadius: 9, padding: '4px 12px', fontSize: 10, color: '#3b7ef4', fontWeight: 700 }}>
            View Worksheet 📄
          </div>
        )}
        {data.todaysLesson.more && (
          <div style={{ fontSize: 9, color: '#0fb8a0', marginLeft: 'auto' }}>{data.todaysLesson.more}</div>
        )}
      </div>
    </div>
  )
}

// ─── WIDGET: MY CLASSES ───────────────────────────────────────────────────────
function MyClasses({ data, isParent }) {
  return (
    <div style={{ background: '#161923', border: '1px solid #1e2231', borderRadius: 18, padding: '14px 16px', marginBottom: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#eef0f8', marginBottom: 12 }}>
        {isParent ? "Marcus's Classes" : 'My Classes'}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {data.myClasses.map(c => (
          <div key={c.name} style={{ background: '#1e2231', borderRadius: 14, padding: '10px 12px', position: 'relative', borderLeft: `4px solid ${c.color}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#eef0f8' }}>{c.name}</div>
            <div style={{ fontSize: 9, color: '#6b7494', marginBottom: 6 }}>{c.teacher}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: c.gpa < 70 ? '#f04a4a' : '#eef0f8' }}>{c.gpa.toFixed(1)}</span>
              <span style={{ fontSize: 9, color: c.badgeColor }}>{c.badge && `GPA ${c.badge}`}{!c.badge && 'GPA'}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 9, color: '#3b7494', marginTop: 8 }}>Tap class → see assignments · GPA as number</div>
    </div>
  )
}

// ─── WIDGET: NEEDS ATTENTION ──────────────────────────────────────────────────
function NeedsAttention({ data }) {
  return (
    <div style={{ background: '#161923', border: '1px solid rgba(240,74,74,0.12)', borderRadius: 18, padding: '14px 16px', marginBottom: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#eef0f8', marginBottom: 8 }}>Needs Attention ⚑</div>
      <div style={{ background: '#1c1012', borderRadius: 10, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: '#f04a4a' }}>{data.needsAttention}</span>
        <span style={{ fontSize: 9, color: '#3b7ef4', cursor: 'pointer' }}>View →</span>
      </div>
    </div>
  )
}

// ─── WIDGET: MESSAGES — STUDENT VERSION ──────────────────────────────────────
function StudentMessages({ data }) {
  return (
    <div style={{ background: '#161923', border: '1px solid #1e2231', borderRadius: 18, padding: '14px 16px', marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#eef0f8' }}>Messages 💬</div>
        <div style={{ fontSize: 10, color: '#3b7ef4', cursor: 'pointer' }}>+ New</div>
      </div>
      {data.messages.map(m => (
        <div key={m.id} style={{ background: '#1e2231', borderRadius: 12, padding: '10px 12px', marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#eef0f8' }}>{m.from}</span>
            <span style={{ fontSize: 9, color: '#3b7ef4', cursor: 'pointer' }}>Reply →</span>
          </div>
          <div style={{ fontSize: 10, color: '#6b7494', marginBottom: 6 }}>{m.preview}</div>
          <div style={{ fontSize: 10 }}>👍 ❤️ 😂  · reactions on all messages</div>
        </div>
      ))}
      <div style={{ fontSize: 9, color: '#9b6ef5', marginTop: 4 }}>✨ AI polishes reply · you approve</div>
    </div>
  )
}

// ─── WIDGET: MESSAGES — PARENT VERSION (with Student/Private toggle) ──────────
function ParentMessages({ data }) {
  const [mode, setMode] = useState('student') // 'student' | 'private'

  return (
    <div style={{ background: '#161923', border: '1px solid #1e2231', borderRadius: 18, padding: '14px 16px', marginBottom: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#eef0f8', marginBottom: 10 }}>Messages 💬</div>

      {/* Toggle — only in parent messages */}
      <div style={{ background: '#1a1d2e', borderRadius: 15, padding: 3, display: 'flex', marginBottom: 10 }}>
        <button onClick={() => setMode('student')} style={{
          flex: 1, padding: '7px 0', borderRadius: 13, border: 'none', cursor: 'pointer',
          fontWeight: 700, fontSize: 10, transition: 'all 0.2s',
          background: mode === 'student' ? 'linear-gradient(135deg, #0f766e, #1d4ed8)' : 'transparent',
          color: mode === 'student' ? '#fff' : '#6b7494',
        }}>👁 Student View</button>
        <button onClick={() => setMode('private')} style={{
          flex: 1, padding: '7px 0', borderRadius: 13, border: 'none', cursor: 'pointer',
          fontWeight: 700, fontSize: 10, transition: 'all 0.2s',
          background: mode === 'private' ? 'linear-gradient(135deg, #7c1d1d, #1d2040)' : 'transparent',
          color: mode === 'private' ? '#f04a4a' : '#6b7494',
        }}>🔒 Private w/ Teacher</button>
      </div>

      {mode === 'student' && (
        <>
          {data.messages.map(m => (
            <div key={m.id} style={{ background: '#1e2231', borderRadius: 12, padding: '10px 12px', marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#eef0f8', marginBottom: 4 }}>{m.from}</div>
              <div style={{ fontSize: 10, color: '#6b7494', marginBottom: 6 }}>{m.preview}</div>
              <div style={{ fontSize: 10 }}>👍 ❤️ 😂</div>
            </div>
          ))}
          <div style={{ fontSize: 9, color: '#9b6ef5', marginTop: 4 }}>✨ AI polishes reply · you approve</div>
        </>
      )}

      {mode === 'private' && (
        <>
          <div style={{ background: '#1a0a0a', border: '1px solid rgba(240,74,74,0.3)', borderRadius: 9, padding: '6px 12px', marginBottom: 8, textAlign: 'center' }}>
            <span style={{ fontSize: 9, color: '#f04a4a', fontWeight: 700 }}>🔒 PRIVATE — Only you and Ms. Johnson see these</span>
          </div>
          {data.privateMessages.map(m => (
            <div key={m.id} style={{ background: '#120808', border: '1px solid rgba(240,74,74,0.18)', borderRadius: 10, padding: '10px 12px', marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: '#c0c8e0', marginBottom: 6 }}>{m.preview}</div>
              <div style={{ fontSize: 10 }}>{m.reactions}</div>
            </div>
          ))}
          <input
            style={{ width: '100%', background: '#1e2231', border: '1px solid #2a2f42', borderRadius: 10, padding: '8px 12px', color: '#eef0f8', fontSize: 12, boxSizing: 'border-box', outline: 'none', marginTop: 4 }}
            placeholder="Message Ms. Johnson privately..."
          />
        </>
      )}
    </div>
  )
}

// ─── WIDGET: CLASS FEED ───────────────────────────────────────────────────────
function ClassFeed({ data, isParent }) {
  return (
    <div style={{ background: '#161923', border: '1px solid #1e2231', borderRadius: 18, padding: '14px 16px', marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#eef0f8' }}>Class Feed 📢</div>
        {!isParent && <div style={{ fontSize: 10, color: '#3b7ef4', cursor: 'pointer' }}>+ Post</div>}
      </div>
      {data.feed.map(f => (
        <div key={f.id} style={{ background: '#1e2231', borderRadius: 12, padding: '10px 12px', marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#eef0f8', marginBottom: 4 }}>{f.title}</div>
          <div style={{ fontSize: 10, color: '#6b7494', marginBottom: 6 }}>{f.meta}</div>
          <div style={{ fontSize: 11 }}>{f.reactions}</div>
        </div>
      ))}
      {isParent
        ? <div style={{ fontSize: 9, color: '#6b7494', marginTop: 4 }}>Parent can react + respond</div>
        : <div style={{ fontSize: 9, color: '#6b7494', marginTop: 4 }}>Public links need approval · direct msgs unrestricted · 👍 ❤️ 😂 everywhere</div>
      }
    </div>
  )
}

// ─── WIDGET: AI STUDY TIPS ────────────────────────────────────────────────────
function AIStudyTips({ data, isParent }) {
  return (
    <div style={{ background: '#1a1230', border: '1px solid #3b2a5a', borderRadius: 18, padding: '14px 16px', marginBottom: 12 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: '#9b6ef5', marginBottom: 8 }}>
        {isParent ? '✨ AI TIPS FOR MARCUS' : '✨ AI STUDY TIPS'}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#eef0f8', marginBottom: 6 }}>{data.aiTip.headline}</div>
      <div style={{ fontSize: 10, color: '#b090d0', marginBottom: isParent ? 0 : 8 }}>{data.aiTip.body}</div>
      {!isParent && <div style={{ fontSize: 9, color: '#9b6ef5', fontWeight: 600, cursor: 'pointer' }}>Tap for full personalized study plan →</div>}
    </div>
  )
}

// ─── WIDGET: UPLOAD ASSIGNMENT (student only) ─────────────────────────────────
function UploadAssignment() {
  return (
    <div style={{ background: '#161923', border: '1px solid rgba(34,201,122,0.18)', borderRadius: 18, padding: '14px 16px', marginBottom: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#eef0f8', marginBottom: 4 }}>Upload Assignment 📤</div>
      <div style={{ fontSize: 10, color: '#6b7494', marginBottom: 10 }}>Photo · File · Link · Note to teacher</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[['📷 Photo', '#22c97a'], ['📄 File', '#3b7ef4'], ['🔗 Link', '#9b6ef5']].map(([label, color]) => (
          <button key={label} style={{ background: `${color}20`, color, border: 'none', borderRadius: 10, padding: '6px 12px', fontSize: 9, fontWeight: 700, cursor: 'pointer' }}>{label}</button>
        ))}
      </div>
    </div>
  )
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
function BottomNav({ items, activeId, onSelect, activeColor }) {
  return (
    <div style={{
      position: 'fixed', left: '50%', bottom: 18, transform: 'translateX(-50%)',
      width: 'min(520px, calc(100% - 32px))',
      background: 'rgba(10,12,20,0.96)', backdropFilter: 'blur(16px)',
      border: '1px solid #1e2231', borderRadius: 22, padding: 8,
      boxShadow: '0 16px 40px rgba(0,0,0,0.5)', zIndex: 40,
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 4 }}>
        {items.map(item => (
          <button key={item.id} onClick={() => onSelect(item.id)} style={{
            background: activeId === item.id ? `${activeColor}18` : 'transparent',
            color: activeId === item.id ? activeColor : '#6b7494',
            border: 'none', borderRadius: 14, padding: '9px 4px', cursor: 'pointer', fontWeight: 700,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, transition: 'all 0.15s',
          }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span style={{ fontSize: 9 }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── MAIN WIDGET STACK (shared layout, same order) ───────────────────────────
function HomeWidgets({ data, isParent }) {
  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 16px 100px' }}>
      <DailyOverview data={data} isParent={isParent} />
      <TodaysLessons data={data} isParent={isParent} />
      <MyClasses data={data} isParent={isParent} />
      <NeedsAttention data={data} />
      {/* THE ONLY DIFFERENCE: Messages widget */}
      {isParent ? <ParentMessages data={data} /> : <StudentMessages data={data} />}
      <ClassFeed data={data} isParent={isParent} />
      <AIStudyTips data={data} isParent={isParent} />
      {!isParent && <UploadAssignment />}
    </div>
  )
}

// ─── STUDENT DASHBOARD ────────────────────────────────────────────────────────
export function StudentDashboard({ currentUser }) {
  const [activeNav, setActiveNav] = useState('home')
  const data = { ...STUDENT_DATA, name: currentUser?.studentName || STUDENT_DATA.name }
  const theme = STUDENT_THEME

  return (
    <div style={{ minHeight: '100vh', background: '#060810', color: '#eef0f8', fontFamily: 'Inter, Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ background: theme.headerGradient, padding: '18px 16px 20px', marginBottom: 0 }}>
        <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>Good Morning! 🌟</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Hi, {data.name}! 👋</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>{data.subtitle}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔔</div>
              <div style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#f04a4a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff' }}>4</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎒</div>
          </div>
        </div>
        <div style={{ maxWidth: 520, margin: '8px auto 0', fontSize: 9, color: '#3d4460' }}>Hold widget or tap ✏ to customize · Saved to account</div>
      </div>

      <HomeWidgets data={data} isParent={false} />

      <BottomNav items={theme.navItems} activeId={activeNav} onSelect={setActiveNav} activeColor={theme.navActive} />
    </div>
  )
}

// ─── PARENT DASHBOARD ─────────────────────────────────────────────────────────
export function ParentDashboard({ currentUser }) {
  const [activeNav, setActiveNav] = useState('home')
  const data = {
    ...PARENT_DATA,
    parentName: currentUser?.userName || PARENT_DATA.parentName,
  }
  const theme = PARENT_THEME

  return (
    <div style={{ minHeight: '100vh', background: '#060810', color: '#eef0f8', fontFamily: 'Inter, Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ background: theme.headerGradient, padding: '18px 16px 20px' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{data.parentName} 👋</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>{data.subtitle}</div>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔔</div>
            <div style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#f04a4a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff' }}>2</div>
          </div>
        </div>
        <div style={{ maxWidth: 520, margin: '8px auto 0', fontSize: 9, color: '#3d4460' }}>Same order as student · Hold to customize · Saved to account</div>
      </div>

      <HomeWidgets data={data} isParent={true} />

      <BottomNav items={theme.navItems} activeId={activeNav} onSelect={setActiveNav} activeColor={theme.navActive} />
    </div>
  )
}

export default StudentDashboard
