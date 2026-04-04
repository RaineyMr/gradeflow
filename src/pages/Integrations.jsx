import React, { useState, useEffect } from 'react'
import { useStore } from '../lib/store'

const C = {
  bg:     '#060810',
  card:   '#0d1117',
  inner:  '#161b22',
  raised: '#1c2128',
  text:   '#e6edf3',
  muted:  '#7d8590',
  border: '#30363d',
  green:  '#22c97a',
  blue:   '#3b7ef4',
  red:    '#f04a4a',
  amber:  '#f5a623',
  purple: '#9b6ef5',
  teal:   '#0fb8a0',
}

// ─── Sync status badge ────────────────────────────────────────────────────────
function SyncBadge({ connected, lastSync }) {
  if (!connected) return (
    <span style={{ background:C.inner, color:C.muted, borderRadius:999, padding:'3px 8px', fontSize:10, fontWeight:700 }}>
      Not connected
    </span>
  )
  return (
    <span style={{ background:'#0f2a1a', color:C.green, borderRadius:999, padding:'3px 8px', fontSize:10, fontWeight:700 }}>
      Connected{lastSync ? ` · ${lastSync}` : ''}
    </span>
  )
}

// ─── Sync result modal ────────────────────────────────────────────────────────
function SyncResultModal({ summary, onClose }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={onClose}>
      <div onClick={e=>e.stopPropagation()}
        style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:24, width:'100%', maxWidth:400 }}>
        <div style={{ fontSize:36, textAlign:'center', marginBottom:12 }}>✅</div>
        <div style={{ fontSize:16, fontWeight:800, color:C.text, textAlign:'center', marginBottom:16 }}>
          Google Classroom Synced!
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:16 }}>
          {[
            { label:'Classes',     val:summary.courses?.length || 0, color:C.blue   },
            { label:'Students',    val:summary.students     || 0,   color:C.green  },
            { label:'Assignments', val:summary.assignments  || 0,   color:C.amber  },
            { label:'Grades',      val:summary.grades       || 0,   color:C.purple },
          ].map(s=>(
            <div key={s.label} style={{ background:C.inner, borderRadius:10, padding:'10px', textAlign:'center' }}>
              <div style={{ fontSize:20, fontWeight:900, color:s.color }}>{s.val}</div>
              <div style={{ fontSize:9, color:C.muted }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Course breakdown */}
        {summary.courses?.length > 0 && (
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, color:C.muted, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Courses synced</div>
            {summary.courses.map((c,i)=>(
              <div key={i} style={{ background:C.inner, borderRadius:10, padding:'8px 12px', marginBottom:6, display:'flex', justifyContent:'space-between' }}>
                <div style={{ fontSize:12, color:C.text, fontWeight:600 }}>{c.name}</div>
                <div style={{ fontSize:10, color:C.muted }}>{c.students} students · {c.assignments} assignments</div>
              </div>
            ))}
          </div>
        )}

        {/* Errors if any */}
        {summary.errors?.length > 0 && (
          <div style={{ background:`${C.amber}10`, border:`1px solid ${C.amber}30`, borderRadius:10, padding:'10px 12px', marginBottom:16 }}>
            <div style={{ fontSize:10, fontWeight:700, color:C.amber, marginBottom:4 }}>Partial sync — some items skipped:</div>
            {summary.errors.slice(0,3).map((e,i)=>(
              <div key={i} style={{ fontSize:11, color:C.muted }}>{e}</div>
            ))}
          </div>
        )}

        <button onClick={onClose}
          style={{ width:'100%', background:'var(--school-color,#BA0C2F)', color:'#fff', border:'none', borderRadius:999, padding:'12px', fontSize:14, fontWeight:800, cursor:'pointer' }}>
          Done
        </button>
      </div>
    </div>
  )
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────
export default function Integrations({ onBack }) {
  const { connections, setConnection, goBack, currentUser } = useStore()
  const handleBack = onBack || goBack

  const [syncing,       setSyncing]       = useState({})
  const [syncResult,    setSyncResult]    = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [toast,         setToast]         = useState(null)
  const [classroomConnected, setClassroomConnected] = useState(
    connections?.googleClassroom?.connected || false
  )

  const teacherId = currentUser?.teacherId || '00000000-0000-0000-0000-000000000001'

  // ── Check for OAuth callback params on mount ──────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    if (params.get('classroom_connected') === 'true') {
      setClassroomConnected(true)
      setConnection('googleClassroom', true)
      setToast('Google Classroom connected successfully!')
      setTimeout(() => setToast(null), 4000)
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
    }

    if (params.get('classroom_error')) {
      const err = params.get('classroom_error')
      setToast(`Connection failed: ${err.replace(/_/g, ' ')}`)
      setTimeout(() => setToast(null), 5000)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const categories = ['all', 'roster', 'lms', 'lessons']

  const filtered = Object.entries(connections || {}).filter(([, conn]) =>
    activeCategory === 'all' || conn.category === activeCategory
  )

  // ── Connect handler — Google Classroom uses real OAuth ────────────────────
  function handleConnect(key) {
    if (key === 'googleClassroom') {
      // Real OAuth flow — redirect to our auth route
      window.location.href = `/api/google-auth?teacherId=${teacherId}`
    } else {
      // All others — open in new tab (manual connect)
      const conn = connections[key]
      if (conn?.url) window.open(conn.url, '_blank')
    }
  }

  function handleMarkConnected(key) {
    if (key === 'googleClassroom') {
      // Google Classroom uses real OAuth — don't allow manual toggle
      if (!classroomConnected) {
        handleConnect(key)
      }
      return
    }
    setConnection(key, !connections[key]?.connected)
  }

  // ── Sync handler — Google Classroom hits the real API ─────────────────────
  async function handleSync(key) {
    if (key === 'googleClassroom') {
      setSyncing(s => ({ ...s, [key]: true }))
      try {
        const res = await fetch('/api/integrations?action=sync-classroom', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ teacherId }),
        })
        const data = await res.json()

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Sync failed')
        }

        setSyncResult(data.summary)
        setConnection('googleClassroom', true)
        setToast(`Synced ${data.summary.students} students, ${data.summary.assignments} assignments`)
        setTimeout(() => setToast(null), 4000)
      } catch (err) {
        setToast(`Sync error: ${err.message}`)
        setTimeout(() => setToast(null), 5000)
      } finally {
        setSyncing(s => ({ ...s, [key]: false }))
      }
    } else {
      // Demo sync for other integrations
      setSyncing(s => ({ ...s, [key]: true }))
      await new Promise(r => setTimeout(r, 1500))
      setSyncing(s => ({ ...s, [key]: false }))
      setToast(`${connections[key]?.label} sync complete`)
      setTimeout(() => setToast(null), 3000)
    }
  }

  const isGCConnected = (key) =>
    key === 'googleClassroom' ? classroomConnected : connections[key]?.connected

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", paddingBottom:80 }}>

      {/* Header */}
      <div style={{ background:'var(--school-color,#BA0C2F)', padding:'16px 16px 20px', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={handleBack}
            style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}>
            &larr; Back
          </button>
          <h1 style={{ fontSize:18, fontWeight:800, color:'#fff', margin:0 }}>🔗 Integrations</h1>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ margin:'12px 16px 0', background:`${C.green}18`, border:`1px solid ${C.green}40`, borderRadius:12, padding:'10px 14px', fontSize:12, color:C.green, fontWeight:600 }}>
          {toast}
        </div>
      )}

      {/* Category filter */}
      <div style={{ display:'flex', gap:6, padding:'12px 16px', overflowX:'auto' }}>
        {categories.map(cat=>(
          <button key={cat} onClick={()=>setActiveCategory(cat)}
            style={{ padding:'6px 14px', borderRadius:999, border:'none', cursor:'pointer', fontSize:11, fontWeight:700, whiteSpace:'nowrap', flexShrink:0,
              background: activeCategory===cat ? 'var(--school-color,#BA0C2F)' : C.inner,
              color:      activeCategory===cat ? '#fff' : C.muted }}>
            {cat === 'all' ? 'All' : cat === 'lms' ? 'LMS' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Google Classroom — featured card */}
      {(activeCategory === 'all' || activeCategory === 'lms') && (
        <div style={{ margin:'0 16px 12px', background: classroomConnected ? 'linear-gradient(135deg,#0a2a18,#060810)' : 'linear-gradient(135deg,#0a1628,#060810)', border:`2px solid ${classroomConnected ? C.green : C.blue}40`, borderRadius:18, padding:18 }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:14 }}>
            <span style={{ fontSize:32, flexShrink:0 }}>🟢</span>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                <div style={{ fontSize:15, fontWeight:800, color:C.text }}>Google Classroom</div>
                <SyncBadge connected={classroomConnected} lastSync={connections?.googleClassroom?.lastSync}/>
              </div>
              <div style={{ fontSize:12, color:C.muted, marginBottom:8 }}>
                Import your entire gradebook — courses, rosters, assignments, and grades sync directly into GradeFlow.
              </div>

              {/* What syncs */}
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {['📚 Courses','👥 Rosters','📝 Assignments','✅ Grades'].map(item=>(
                  <span key={item} style={{ fontSize:10, fontWeight:700, color:C.teal, background:`${C.teal}15`, padding:'3px 8px', borderRadius:999 }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display:'flex', gap:8 }}>
            {!classroomConnected ? (
              <button onClick={()=>handleConnect('googleClassroom')}
                style={{ flex:1, background:C.blue, color:'#fff', border:'none', borderRadius:12, padding:'12px', fontSize:13, fontWeight:800, cursor:'pointer' }}>
                🔗 Connect Google Classroom
              </button>
            ) : (
              <>
                <button
                  onClick={()=>handleSync('googleClassroom')}
                  disabled={!!syncing['googleClassroom']}
                  style={{ flex:2, background: syncing['googleClassroom'] ? C.inner : C.green, color: syncing['googleClassroom'] ? C.muted : '#000', border:'none', borderRadius:12, padding:'12px', fontSize:13, fontWeight:800, cursor: syncing['googleClassroom'] ? 'wait' : 'pointer' }}>
                  {syncing['googleClassroom'] ? '⟳ Syncing...' : '⟳ Sync Now'}
                </button>
                <button
                  onClick={()=>handleConnect('googleClassroom')}
                  style={{ flex:1, background:`${C.blue}18`, color:C.blue, border:`1px solid ${C.blue}40`, borderRadius:12, padding:'12px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                  Reconnect
                </button>
              </>
            )}
          </div>

          {/* Last sync info */}
          {classroomConnected && (
            <div style={{ marginTop:10, fontSize:11, color:C.muted, textAlign:'center' }}>
              Syncs courses, rosters, assignments &amp; grades &middot; Token auto-refreshes
            </div>
          )}
        </div>
      )}

      {/* Other integrations */}
      <div style={{ padding:'0 16px' }}>
        {filtered
          .filter(([key]) => key !== 'googleClassroom')
          .map(([key, conn]) => (
          <div key={key} style={{ background:C.card, border:`1px solid ${isGCConnected(key) ? C.green+'30' : C.border}`, borderRadius:16, padding:'14px 16px', marginBottom:10, transition:'border-color 0.2s' }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:10 }}>
              <span style={{ fontSize:26, flexShrink:0 }}>{conn.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:800, color:C.text, marginBottom:2 }}>{conn.label}</div>
                <div style={{ fontSize:11, color:C.muted, marginBottom:6 }}>{conn.description}</div>
                <SyncBadge connected={conn.connected} lastSync={conn.lastSync}/>
              </div>
            </div>

            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>handleConnect(key)}
                style={{ flex:1, background:`${C.blue}18`, color:C.blue, border:'none', borderRadius:10, padding:'9px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                🔗 Open {conn.label}
              </button>

              <button onClick={()=>handleMarkConnected(key)}
                style={{ flex:1, background:conn.connected?`${C.green}18`:`${C.amber}18`, color:conn.connected?C.green:C.amber, border:'none', borderRadius:10, padding:'9px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                {conn.connected ? 'Connected' : '+ Mark Connected'}
              </button>

              {conn.connected && (
                <button onClick={()=>handleSync(key)} disabled={!!syncing[key]}
                  style={{ flex:1, background:`${C.teal}18`, color:C.teal, border:'none', borderRadius:10, padding:'9px', fontSize:12, fontWeight:700, cursor:syncing[key]?'wait':'pointer' }}>
                  {syncing[key] ? '⟳ Syncing...' : '⟳ Sync'}
                </button>
              )}
            </div>

            {conn.connected && (
              <div style={{ marginTop:10, padding:'8px 12px', background:C.inner, borderRadius:10 }}>
                <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', marginBottom:4 }}>What syncs</div>
                <div style={{ fontSize:11, color:C.text }}>
                  {conn.category === 'roster'  && '👥 Student names · Class lists · Grade passback'}
                  {conn.category === 'lms'     && '📝 Assignments · Submissions · Grade passback · Roster import'}
                  {conn.category === 'lessons' && '📅 Lesson plans · Curriculum maps · Resources'}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info footer */}
      <div style={{ margin:'8px 16px 0', padding:'14px', background:C.inner, borderRadius:14, display:'flex', alignItems:'flex-start', gap:12 }}>
        <span style={{ fontSize:20 }}>&#x2139;&#xfe0f;</span>
        <div style={{ fontSize:11, color:C.muted, lineHeight:1.6 }}>
          <strong style={{ color:C.text }}>How sync works:</strong> GradeFlow connects to your existing tools — it never replaces them. Rosters import once per term. Grades sync on demand. Changes in your SIS must also be updated here.
        </div>
      </div>

      {/* Sync result modal */}
      {syncResult && <SyncResultModal summary={syncResult} onClose={()=>setSyncResult(null)}/>}
    </div>
  )
}
