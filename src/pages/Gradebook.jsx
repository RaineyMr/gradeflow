import React, { useState, useEffect, useMemo } from 'react'
import { useStore } from '../lib/store'
import { useT } from '../lib/i18n'
import { GradeBar, Modal } from '../components/ui'
import { GradebookSyncButton } from '../components/GradebookSyncButton.jsx'
import { GradebookSyncStatus } from '../components/GradebookSyncStatus.jsx'

const C = {
  bg: '#060810', card: '#161923', inner: '#1e2231', text: '#eef0f8',
  muted: '#6b7494', border: '#2a2f42', green: '#22c97a', blue: '#3b7ef4',
  red: '#f04a4a', amber: '#f5a623', purple: '#9b6ef5', teal: '#0fb8a0',
}

// Weight Editor Component
function WeightEditor({ onClose }) {
  const { categories, setCategories, gradingMethod, setGradingMethod } = useStore()
  const t = useT()
  const [draft, setDraft] = useState(categories.map(c => ({ ...c })))
  const [newCatName, setNewCatName] = useState('')

  const total = draft.reduce((s, c) => s + Number(c.weight || 0), 0)
  const totalOk = Math.abs(total - 100) < 0.01
  const totalColor = totalOk ? C.green : Math.abs(total - 100) <= 5 ? C.amber : C.red

  function updateWeight(id, val) {
    setDraft(d => d.map(c => c.id === id ? { ...c, weight: val === '' ? '' : Number(val) } : c))
  }

  function addCategory() {
    if (!newCatName.trim()) return
    const remaining = Math.max(0, 100 - total)
    setDraft(d => [...d, { id: Date.now(), name: newCatName.trim(), weight: remaining, color: C.purple, icon: '???' }])
    setNewCatName('')
  }

  function removeCategory(id) {
    setDraft(d => d.filter(c => c.id !== id))
  }

  function autoBalance() {
    const n = draft.length
    if (!n) return
    const each = Math.floor(100 / n)
    const rem = 100 - each * n
    setDraft(d => d.map((c, i) => ({ ...c, weight: each + (i === 0 ? rem : 0) })))
  }

  function handleSave() {
    if (!totalOk) return
    setCategories(draft.map(c => ({ ...c, weight: Number(c.weight) })))
    onClose()
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 8 }}>Grading Method</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['weighted', '?? Category Weights'], ['total_points', '?? Total Points']].map(([val, label]) => (
            <button key={val} onClick={() => setGradingMethod(val)}
              style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                background: gradingMethod === val ? 'var(--school-color, #BA0C2F)' : C.inner,
                color: gradingMethod === val ? '#fff' : C.muted }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {gradingMethod === 'weighted' && (
        <>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 10 }}>Category Weights</div>

          {draft.map(cat => (
            <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{cat.icon}</span>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: C.text }}>{cat.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="number" min="0" max="100" value={cat.weight}
                  onChange={e => updateWeight(cat.id, e.target.value)}
                  style={{ width: 60, background: C.inner, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 8px', color: C.text, fontSize: 13, fontWeight: 700, textAlign: 'center', outline: 'none' }}
                />
                <span style={{ fontSize: 13, color: C.muted }}>%</span>
              </div>
              <button onClick={() => removeCategory(cat.id)}
                style={{ background: 'transparent', border: 'none', color: C.red, cursor: 'pointer', fontSize: 16, padding: '4px', lineHeight: 1 }}>×</button>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <input
              placeholder="New category name"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCategory()}
              style={{ flex: 1, background: C.inner, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 12px', color: C.text, fontSize: 12, outline: 'none' }}
            />
            <button onClick={addCategory}
              style={{ background: `${C.teal}22`, color: C.teal, border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              Add
            </button>
          </div>

          <div style={{ background: C.inner, borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Total</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: totalColor }}>{total}%</span>
            </div>
            <div style={{ height: 6, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(total, 100)}%`, background: totalColor, borderRadius: 3, transition: 'width 0.3s, background 0.3s' }} />
            </div>
            {!totalOk && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <span style={{ fontSize: 11, color: totalColor }}>{total < 100 ? `${100 - total}% Unallocated` : `${total - 100}% Over 100%`}</span>
                <button onClick={autoBalance}
                  style={{ background: `${C.blue}22`, color: C.blue, border: 'none', borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                  Auto Balance
                </button>
              </div>
            )}
            {totalOk && <div style={{ fontSize: 11, color: C.green, marginTop: 6 }}>?? Weights sum to 100%</div>}
          </div>
        </>
      )}

      <button onClick={handleSave} style={{ width: '100%', background: 'var(--school-color, #BA0C2F)', color: '#fff', border: 'none', borderRadius: 999, padding: '14px', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
        Save Settings
      </button>
    </div>
  )
}

// Main Gradebook Component
export default function Gradebook() {
  const { activeClass, fetchGradebookData, currentGradebookData, categories } = useStore()
  const t = useT()

  // Data loading state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // UI state
  const [view, setView] = useState('table')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('name')
  
  // Modal state
  const [weightModal, setWeightModal] = useState(false)
  const [newAssignModal, setNewAssignModal] = useState(false)
  const [newStudentModal, setNewStudentModal] = useState(false)
  const [editModal, setEditModal] = useState(null)
  const [newScore, setNewScore] = useState('')
  
  // Form state
  const [newAssign, setNewAssign] = useState({ name: '', categoryId: 1, type: '', includeInGrade: true })
  const [newStudent, setNewStudent] = useState({ name: '', email: '' })

  // Fetch data when class changes
  useEffect(() => {
    if (!activeClass?.id) {
      setError('No class selected')
      setLoading(false)
      return
    }
    
    const load = async () => {
      setLoading(true)
      setError(null)
      
      try {
        console.log('DEBUG: Gradebook useEffect calling fetchGradebookData with activeClass.id:', activeClass.id, 'typeof:', typeof activeClass.id)
        console.log('DEBUG: activeClass object:', activeClass)
        await fetchGradebookData(activeClass.id)
        setLoading(false)
      } catch (err) {
        console.error('Failed to load gradebook:', err)
        setError('Failed to load gradebook. Using demo data.')
        setLoading(false)
      }
    }
    
    load()
  }, [activeClass?.id, fetchGradebookData])

  // Extract data from store
  const { students = [], assignments = [], grades = [] } = currentGradebookData || {}

  // Compute student grade summaries
  const studentGrades = useMemo(() => {
    console.log('DEBUG: Computing student grades with', students.length, 'students and', grades.length, 'grades')
    
    return students.map(student => {
      const studentGrades = grades.filter(g => g.studentId === student.id)
      console.log(`DEBUG: Student ${student.name} (${student.id}) has ${studentGrades.length} grades`)
      
      const gradeValues = studentGrades.map(g => g.score).filter(s => s !== undefined)
      const avg = gradeValues.length ? Math.round(gradeValues.reduce((a, b) => a + b) / gradeValues.length) : 0
      
      console.log(`DEBUG: Student ${student.name} grades:`, studentGrades.slice(0, 3), 'average:', avg)
      
      return {
        ...student,
        grade: avg,
        detailedGrades: studentGrades,
      }
    })
  }, [students, grades])

  // Sort and filter
  const sorted = useMemo(() => {
    let filtered = studentGrades.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase())
    )
    
    if (sortBy === 'grade') {
      filtered.sort((a, b) => b.grade - a.grade)
    } else {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    }
    
    return filtered
  }, [studentGrades, search, sortBy])

  // Helper: Grade color
  const gradeColor = (score) => {
    if (score >= 90) return C.green
    if (score >= 80) return C.amber
    if (score >= 70) return C.blue
    if (score >= 60) return '#f5a623'
    return C.red
  }

  // Handlers
  const handleSaveGrade = () => {
    if (!editModal) return
    console.log(`Saving grade for ${editModal.student.name}: ${newScore}`)
    setEditModal(null)
    setNewScore('')
  }

  const handleAddAssignment = () => {
    if (!newAssign.name.trim()) return
    console.log('Adding assignment:', newAssign)
    setNewAssignModal(false)
    setNewAssign({ name: '', categoryId: 1, type: '', includeInGrade: true })
  }

  const handleAddStudent = () => {
    if (!newStudent.name.trim()) return
    console.log('Adding student:', newStudent)
    setNewStudentModal(false)
    setNewStudent({ name: '', email: '' })
  }

  // Render
  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: C.muted }}>
        <div style={{ fontSize: 16, marginBottom: 12 }}>?? Loading gradebook...</div>
      </div>
    )
  }

  if (error && students.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: C.red }}>
        <div style={{ fontSize: 16, marginBottom: 12 }}>?? {error}</div>
        <button onClick={() => activeClass?.id && fetchGradebookData(activeClass.id)}
          style={{ background: C.blue, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: 0 }}>{activeClass?.subject || 'Class'} Gradebook</h1>
            <p style={{ fontSize: 12, color: C.muted, margin: '4px 0 0 0' }}>{activeClass?.period || ''}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <GradebookSyncButton />
            <button onClick={() => setWeightModal(true)}
              style={{ background: C.inner, color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              ?? Edit Weights
            </button>
          </div>
        </div>

        {/* Category weights bar */}
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>Category Weights:</div>
        <div style={{ display: 'flex', gap: 2, height: 12, borderRadius: 6, overflow: 'hidden', background: C.border }}>
          {categories.map(cat => (
            <div key={cat.id} style={{ flex: cat.weight / 100, background: cat.color, opacity: 0.8 }} title={`${cat.name}: ${cat.weight}%`} />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ padding: '12px 16px', display: 'flex', gap: 8, alignItems: 'center', borderBottom: `1px solid ${C.border}` }}>
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, background: C.inner, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.text, fontSize: 12, outline: 'none' }}
        />
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ background: C.inner, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', color: C.text, fontSize: 12, outline: 'none', cursor: 'pointer' }}>
          <option value="name">Sort: Name</option>
          <option value="grade">Sort: Grade</option>
        </select>
        <select value={view} onChange={e => setView(e.target.value)}
          style={{ background: C.inner, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', color: C.text, fontSize: 12, outline: 'none', cursor: 'pointer' }}>
          <option value="table">?? Table</option>
          <option value="grid">??? Grid</option>
        </select>
        <button onClick={() => setNewAssignModal(true)}
          style={{ background: C.teal, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          + Assignment
        </button>
      </div>

      {/* Spreadsheet-style Table view */}
      {view === 'table' && (
        <div style={{ overflowX: 'auto', backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 8, margin: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            {/* Fixed Header */}
            <thead style={{ position: 'sticky', top: 0, zIndex: 20 }}>
              <tr>
                <th style={{ 
                  position: 'sticky', 
                  left: 0, 
                  background: C.inner, 
                  padding: '12px', 
                  border: `1px solid ${C.border}`, 
                  fontSize: 11, 
                  fontWeight: 700, 
                  color: C.muted, 
                  textAlign: 'left',
                  minWidth: '180px',
                  zIndex: 15
                }}>
                  Student Name
                </th>
                {assignments.map(a => (
                  <th key={a.id} style={{ 
                    position: 'sticky',
                    top: 0,
                    background: C.inner,
                    padding: '12px 8px', 
                    border: `1px solid ${C.border}`, 
                    fontSize: 10, 
                    fontWeight: 700, 
                    color: C.muted, 
                    textAlign: 'center',
                    minWidth: '100px',
                    maxWidth: '120px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    zIndex: 10
                  }} title={a.name}>
                    <div style={{ transform: 'rotate(-45deg)', transformOrigin: 'center', marginBottom: '8px' }}>
                      {a.name.length > 15 ? a.name.substring(0, 15) + '...' : a.name}
                    </div>
                  </th>
                ))}
                <th style={{ 
                  position: 'sticky', 
                  right: 0, 
                  top: 0,
                  background: C.inner, 
                  padding: '12px', 
                  border: `1px solid ${C.border}`, 
                  fontSize: 11, 
                  fontWeight: 700, 
                  color: C.muted, 
                  textAlign: 'center',
                  minWidth: '80px',
                  zIndex: 15
                }}>
                  Avg
                </th>
              </tr>
            </thead>
            
            {/* Scrollable Body */}
            <tbody>
              {sorted.map(student => (
                <tr key={student.id}>
                  {/* Fixed Student Name Column */}
                  <td style={{ 
                    position: 'sticky', 
                    left: 0, 
                    background: C.card, 
                    padding: '10px 12px', 
                    border: `1px solid ${C.border}`, 
                    fontSize: 13, 
                    fontWeight: 600, 
                    color: C.text,
                    minWidth: '180px',
                    zIndex: 5
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div>{student.name}</div>
                      {student.flagged && <div style={{ fontSize: 9, color: C.red, marginTop: 2 }}>Flagged</div>}
                    </div>
                  </td>
                  
                  {/* Grade Cells */}
                  {assignments.map(a => {
                    const grade = grades.find(g => g.studentId === student.id && g.assignmentId === a.id)
                    return (
                      <td key={a.id} style={{ 
                        padding: '8px', 
                        border: `1px solid ${C.border}`, 
                        textAlign: 'center', 
                        cursor: 'pointer',
                        minWidth: '100px',
                        maxWidth: '120px',
                        background: grade ? 'transparent' : `${C.border}33`,
                        transition: 'background 0.2s'
                      }} 
                      onMouseEnter={(e) => e.currentTarget.style.background = grade ? `${C.border}22` : `${C.border}55`}
                      onMouseLeave={(e) => e.currentTarget.style.background = grade ? 'transparent' : `${C.border}33`}
                      onClick={() => setEditModal({ student, assignment: a })}>
                        <span style={{ 
                          fontSize: 11, 
                          fontWeight: 700, 
                          color: grade ? gradeColor(grade.score) : C.muted,
                          display: 'block'
                        }}>
                          {grade ? `${grade.score}%` : '---'}
                        </span>
                        {grade && grade.submitted === false && (
                          <div style={{ fontSize: 8, color: C.amber, marginTop: 2 }}>Missing</div>
                        )}
                      </td>
                    )
                  })}
                  
                  {/* Fixed Average Column */}
                  <td style={{ 
                    position: 'sticky', 
                    right: 0, 
                    background: C.card, 
                    padding: '10px', 
                    border: `1px solid ${C.border}`, 
                    textAlign: 'center', 
                    fontWeight: 700, 
                    fontSize: 12, 
                    color: gradeColor(student.grade),
                    minWidth: '80px',
                    zIndex: 5
                  }}>
                    {student.grade}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid view */}
      {view === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 16px' }}>
          {sorted.map(s => {
            const letter = s.grade >= 90 ? 'A' : s.grade >= 80 ? 'B' : s.grade >= 70 ? 'C' : s.grade >= 60 ? 'D' : 'F'
            return (
              <button key={s.id} onClick={() => {}}
                style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '14px', textAlign: 'left', cursor: 'pointer' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 4 }}>{s.name}</div>
                <div style={{ marginBottom: 8 }}><GradeBar score={s.grade} /></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: gradeColor(s.grade) }}>{s.grade}%</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: gradeColor(s.grade) }}>{letter}</span>
                </div>
                {s.flagged && <div style={{ fontSize: 9, color: C.red, marginTop: 4 }}>?? Needs attention</div>}
              </button>
            )
          })}
        </div>
      )}

      {/* Modals */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title={`Edit Grade - ${editModal?.student?.name}`}>
        {editModal && (
          <div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              <span style={{ background: C.inner, borderRadius: 999, padding: '4px 10px', fontSize: 11, color: C.muted }}>{editModal.assignment.name}</span>
            </div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 6 }}>Score (%)</label>
            <input type="number" min="0" max="100" value={newScore} onChange={e => setNewScore(e.target.value)}
              style={{ width: '100%', background: C.inner, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px', color: C.text, fontSize: 16, fontWeight: 700, outline: 'none', boxSizing: 'border-box', textAlign: 'center' }} />
            <button onClick={handleSaveGrade} style={{ width: '100%', background: 'var(--school-color, #BA0C2F)', color: '#fff', border: 'none', borderRadius: 999, padding: '14px', fontSize: 15, fontWeight: 800, cursor: 'pointer', marginTop: 14 }}>
              Save Grade
            </button>
          </div>
        )}
      </Modal>

      <Modal open={newAssignModal} onClose={() => setNewAssignModal(false)} title="New Assignment">
        <div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 6 }}>Assignment Name</label>
            <input value={newAssign.name} onChange={e => setNewAssign(n => ({ ...n, name: e.target.value }))}
              placeholder="e.g. Ch.5 Quiz"
              style={{ width: '100%', background: C.inner, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 6 }}>Category</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setNewAssign(n => ({ ...n, categoryId: cat.id, type: cat.name.toLowerCase() }))}
                  style={{ padding: '8px 14px', borderRadius: 999, border: `2px solid ${newAssign.categoryId === cat.id ? cat.color : 'transparent'}`, cursor: 'pointer', fontSize: 12, fontWeight: 700, transition: 'all 0.15s',
                    background: newAssign.categoryId === cat.id ? `${cat.color}22` : C.inner,
                    color: newAssign.categoryId === cat.id ? cat.color : C.muted }}>
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleAddAssignment}
            style={{ width: '100%', background: 'var(--school-color, #BA0C2F)', color: '#fff', border: 'none', borderRadius: 999, padding: '14px', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
            Add Assignment
          </button>
        </div>
      </Modal>

      <Modal open={newStudentModal} onClose={() => setNewStudentModal(false)} title="Add New Student">
        <div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 6 }}>Student Name</label>
            <input 
              value={newStudent.name} 
              onChange={e => setNewStudent(n => ({ ...n, name: e.target.value }))}
              placeholder="e.g. John Smith"
              style={{ width: '100%', background: C.inner, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} 
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 6 }}>Email (Optional)</label>
            <input 
              type="email"
              value={newStudent.email} 
              onChange={e => setNewStudent(n => ({ ...n, email: e.target.value }))}
              placeholder="e.g. john.smith@school.edu"
              style={{ width: '100%', background: C.inner, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} 
            />
          </div>

          <button 
            onClick={handleAddStudent}
            style={{ width: '100%', background: C.teal, color: '#fff', border: 'none', borderRadius: 999, padding: '14px', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}
          >
            Add Student
          </button>
        </div>
      </Modal>

      <Modal open={weightModal} onClose={() => setWeightModal(false)} title="Grading Setup">
        <WeightEditor onClose={() => setWeightModal(false)} />
      </Modal>
    </div>
  )
}
