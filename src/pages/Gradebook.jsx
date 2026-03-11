import React, { useState } from 'react'
import { useStore } from '../lib/store'
import { GradeBar, Modal } from '../components/ui'

const C = { bg:'#060810',card:'#161923',inner:'#1e2231',text:'#eef0f8',muted:'#6b7494',border:'#2a2f42',green:'#22c97a',blue:'#3b7ef4',red:'#f04a4a',amber:'#f5a623',purple:'#9b6ef5' }

export default function Gradebook() {
  const { classes, students, assignments, grades, getStudentsForClass, getAssignmentsForClass, getGradeForStudentAssignment, updateGrade, addAssignment, activeClass, setActiveClass, setActiveStudent, setScreen } = useStore()

  const [editModal,    setEditModal]    = useState(null)  // { student, assignment, grade }
  const [newAssignModal, setNewAssignModal] = useState(false)
  const [newAssign,    setNewAssign]    = useState({ name:'', type:'quiz', weight:30 })
  const [newScore,     setNewScore]     = useState('')
  const [search,       setSearch]       = useState('')
  const [sortBy,       setSortBy]       = useState('name')
  const [view,         setView]         = useState('table')  // table | grid

  const cls         = activeClass || classes[0]
  const clsStudents = getStudentsForClass(cls?.id || 0).filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
  const clsAssigns  = getAssignmentsForClass(cls?.id || 0)

  const sorted = [...clsStudents].sort((a,b) => {
    if (sortBy === 'grade') return b.grade - a.grade
    if (sortBy === 'name')  return a.name.localeCompare(b.name)
    return 0
  })

  function handleSaveGrade() {
    if (!editModal) return
    const score = parseFloat(newScore)
    if (isNaN(score)) return
    updateGrade(editModal.student.id, editModal.assignment.id, score)
    setEditModal(null)
  }

  function handleAddAssignment() {
    if (!newAssign.name.trim()) return
    addAssignment({ ...newAssign, classId: cls.id, date: new Date().toISOString().split('T')[0], dueDate: new Date().toISOString().split('T')[0], hasKey: false })
    setNewAssignModal(false)
    setNewAssign({ name:'', type:'quiz', weight:30 })
  }

  const gradeColor = (s) => s>=90?C.green:s>=80?C.blue:s>=70?C.amber:s>=60?'#f97316':C.red

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', paddingBottom:80 }}>
      <div style={{ padding:'20px 16px 0', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:800, margin:'0 0 2px' }}>Gradebook</h1>
          <p style={{ fontSize:12, color:C.muted, margin:0 }}>{cls?.period} · {cls?.subject} · {clsStudents.length} students</p>
        </div>
        <button onClick={() => setNewAssignModal(true)} style={{ background:'var(--school-color)', border:'none', borderRadius:12, padding:'8px 14px', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer' }}>+ Assignment</button>
      </div>

      {/* Class tabs */}
      <div style={{ display:'flex', gap:6, padding:'0 16px', marginBottom:12, overflowX:'auto', paddingBottom:4 }}>
        {classes.map(c => (
          <button key={c.id} onClick={() => setActiveClass(c)}
            style={{ padding:'6px 14px', borderRadius:999, border:'none', cursor:'pointer', fontSize:11, fontWeight:700, whiteSpace:'nowrap', flexShrink:0,
              background: (cls?.id===c.id) ? 'var(--school-color)' : C.inner,
              color:      (cls?.id===c.id) ? '#fff' : C.muted }}>
            {c.period} · {c.subject}
          </button>
        ))}
      </div>

      {/* Search + sort */}
      <div style={{ padding:'0 16px', display:'flex', gap:8, marginBottom:14 }}>
        <input
          style={{ flex:1, background:C.inner, border:`1px solid ${C.border}`, borderRadius:10, padding:'8px 12px', color:C.text, fontSize:12, outline:'none' }}
          placeholder="Search students..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select onChange={e => setSortBy(e.target.value)} value={sortBy}
          style={{ background:C.inner, border:`1px solid ${C.border}`, borderRadius:10, padding:'8px 10px', color:C.text, fontSize:12, cursor:'pointer' }}>
          <option value="name">Sort: Name</option>
          <option value="grade">Sort: Grade</option>
        </select>
        <button onClick={() => setView(v => v==='table'?'grid':'table')}
          style={{ background:C.inner, border:`1px solid ${C.border}`, borderRadius:10, padding:'8px 12px', color:C.muted, fontSize:13, cursor:'pointer' }}>
          {view==='table' ? '⊞' : '☰'}
        </button>
      </div>

      {/* Table view */}
      {view === 'table' && (
        <div style={{ margin:'0 16px', overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:500 }}>
            <thead>
              <tr style={{ background:C.inner }}>
                <th style={{ padding:'10px 12px', textAlign:'left', fontSize:11, fontWeight:700, color:C.muted, borderRadius:'10px 0 0 10px' }}>Student</th>
                <th style={{ padding:'10px 12px', textAlign:'center', fontSize:11, fontWeight:700, color:C.muted }}>Avg</th>
                {clsAssigns.map(a => (
                  <th key={a.id} style={{ padding:'10px 8px', textAlign:'center', fontSize:10, fontWeight:700, color:C.muted, whiteSpace:'nowrap' }}>
                    {a.name.length > 8 ? a.name.slice(0,8)+'…' : a.name}
                  </th>
                ))}
                <th style={{ padding:'10px 12px', textAlign:'right', fontSize:11, fontWeight:700, color:C.muted, borderRadius:'0 10px 10px 0' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s, idx) => {
                const rowBg = idx % 2 === 0 ? C.card : C.inner
                const letter = s.grade>=90?'A':s.grade>=80?'B':s.grade>=70?'C':s.grade>=60?'D':'F'
                return (
                  <tr key={s.id} style={{ background:rowBg, cursor:'pointer' }}
                    onClick={() => { setActiveStudent(s); setScreen('studentProfile') }}
                    onMouseEnter={e => e.currentTarget.style.background='#1a2540'}
                    onMouseLeave={e => e.currentTarget.style.background=rowBg}>
                    <td style={{ padding:'10px 12px', borderRadius:'10px 0 0 10px' }}>
                      <div style={{ fontWeight:600, fontSize:13, color:C.text }}>{s.name}</div>
                      {s.flagged && <span style={{ fontSize:9, color:C.red }}>⚑ flagged</span>}
                    </td>
                    <td style={{ padding:'10px 8px', textAlign:'center' }}>
                      <span style={{ fontSize:14, fontWeight:800, color:gradeColor(s.grade) }}>{s.grade}%</span>
                      <span style={{ fontSize:10, color:gradeColor(s.grade), marginLeft:4 }}>{letter}</span>
                    </td>
                    {clsAssigns.map(a => {
                      const g = getGradeForStudentAssignment(s.id, a.id)
                      return (
                        <td key={a.id} style={{ padding:'10px 8px', textAlign:'center' }}>
                          {g ? (
                            <button onClick={e => { e.stopPropagation(); setEditModal({ student:s, assignment:a, grade:g }); setNewScore(String(g.score)) }}
                              style={{ background:`${gradeColor(g.score)}18`, color:gradeColor(g.score), border:'none', borderRadius:8, padding:'4px 8px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                              {g.score}%
                            </button>
                          ) : (
                            <button onClick={e => { e.stopPropagation(); setEditModal({ student:s, assignment:a, grade:null }); setNewScore('') }}
                              style={{ background:C.inner, color:C.muted, border:'none', borderRadius:8, padding:'4px 8px', fontSize:11, cursor:'pointer' }}>
                              —
                            </button>
                          )}
                        </td>
                      )
                    })}
                    <td style={{ padding:'10px 12px', textAlign:'right', borderRadius:'0 10px 10px 0' }}>
                      <button onClick={e => { e.stopPropagation(); setActiveStudent(s); setScreen('studentProfile') }}
                        style={{ background:`${C.blue}22`, color:C.blue, border:'none', borderRadius:8, padding:'4px 10px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                        View ›
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid view */}
      {view === 'grid' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, padding:'0 16px' }}>
          {sorted.map(s => {
            const letter = s.grade>=90?'A':s.grade>=80?'B':s.grade>=70?'C':s.grade>=60?'D':'F'
            return (
              <button key={s.id} onClick={() => { setActiveStudent(s); setScreen('studentProfile') }}
                style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:'14px', textAlign:'left', cursor:'pointer' }}>
                <div style={{ fontWeight:700, fontSize:13, color:C.text, marginBottom:4 }}>{s.name}</div>
                <div style={{ marginBottom:8 }}>
                  <GradeBar score={s.grade} />
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:22, fontWeight:800, color:gradeColor(s.grade) }}>{s.grade}%</span>
                  <span style={{ fontSize:16, fontWeight:700, color:gradeColor(s.grade) }}>{letter}</span>
                </div>
                {s.flagged && <div style={{ fontSize:9, color:C.red, marginTop:4 }}>⚑ needs attention</div>}
              </button>
            )
          })}
        </div>
      )}

      {/* Edit Grade Modal */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title={`Edit Grade — ${editModal?.student?.name}`}>
        {editModal && (
          <div>
            <p style={{ fontSize:13, color:C.muted, marginBottom:14 }}>{editModal.assignment.name} · {editModal.assignment.type}</p>
            <label style={{ display:'block', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:C.muted, marginBottom:6 }}>Score (%)</label>
            <input type="number" min="0" max="100" value={newScore} onChange={e => setNewScore(e.target.value)}
              style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 14px', color:C.text, fontSize:16, fontWeight:700, outline:'none', boxSizing:'border-box', textAlign:'center' }} />
            <button onClick={handleSaveGrade} style={{ width:'100%', background:'var(--school-color)', color:'#fff', border:'none', borderRadius:999, padding:'14px', fontSize:15, fontWeight:800, cursor:'pointer', marginTop:14 }}>Save Grade</button>
          </div>
        )}
      </Modal>

      {/* New Assignment Modal */}
      <Modal open={newAssignModal} onClose={() => setNewAssignModal(false)} title="New Assignment">
        <div>
          {[['name','Assignment Name','text'],['weight','Weight (%)','number']].map(([key,label,type]) => (
            <div key={key} style={{ marginBottom:12 }}>
              <label style={{ display:'block', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:C.muted, marginBottom:6 }}>{label}</label>
              <input type={type} value={newAssign[key]} onChange={e => setNewAssign(n => ({ ...n, [key]: type==='number' ? Number(e.target.value) : e.target.value }))}
                style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 14px', color:C.text, fontSize:13, outline:'none', boxSizing:'border-box' }} />
            </div>
          ))}
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:C.muted, marginBottom:6 }}>Type</label>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {['test','quiz','homework','participation'].map(t => (
                <button key={t} onClick={() => setNewAssign(n => ({ ...n, type:t }))}
                  style={{ padding:'7px 14px', borderRadius:999, border:'none', cursor:'pointer', fontSize:12, fontWeight:700,
                    background: newAssign.type===t ? 'var(--school-color)' : C.inner,
                    color:      newAssign.type===t ? '#fff' : C.muted }}>
                  {t.charAt(0).toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleAddAssignment} style={{ width:'100%', background:'var(--school-color)', color:'#fff', border:'none', borderRadius:999, padding:'14px', fontSize:15, fontWeight:800, cursor:'pointer' }}>Add Assignment</button>
        </div>
      </Modal>
    </div>
  )
}
