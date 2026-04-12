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

// ─── Weight Editor ─────────────────────────────────────────────────────────────
// Shown inline when teacher clicks "Edit Weights" — mirrors how PowerSchool/Canvas work:
// weights belong to categories, not individual assignments.
function WeightEditor({ onClose }) {
  const { categories, setCategories, gradingMethod, setGradingMethod } = useStore()
  const t = useT()
  const [draft, setDraft] = useState(categories.map(c => ({ ...c })))
  const [newCatName, setNewCatName] = useState('')

  const total = draft.reduce((s, c) => s + Number(c.weight || 0), 0)
  const totalOk = Math.abs(total - 100) < 0.01

  // Color-code the total indicator
  const totalColor = totalOk ? C.green : Math.abs(total - 100) <= 5 ? C.amber : C.red

  function updateWeight(id, val) {
    setDraft(d => d.map(c => c.id === id ? { ...c, weight: val === '' ? '' : Number(val) } : c))
  }

  function addCategory() {
    if (!newCatName.trim()) return
    const remaining = Math.max(0, 100 - total)
    setDraft(d => [...d, { id: Date.now(), name: newCatName.trim(), weight: remaining, color: C.purple, icon: '📌' }])
    setNewCatName('')
  }

  function removeCategory(id) {
    setDraft(d => d.filter(c => c.id !== id))
  }

  function autoBalance() {
    // Distribute remaining % evenly across unlocked categories
    const n = draft.length
    if (!n) return
    const each = Math.floor(100 / n)
    const rem  = 100 - each * n
    setDraft(d => d.map((c, i) => ({ ...c, weight: each + (i === 0 ? rem : 0) })))
  }

  function handleSave() {
    if (!totalOk) return
    setCategories(draft.map(c => ({ ...c, weight: Number(c.weight) })))
    onClose()
  }

  return (
    <div>
      {/* Grading method toggle */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 8 }}>{t('grading_method')}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['weighted', '⚖ ' + t('category_weights')], ['total_points', '∑ ' + t('total_points')]].map(([val, label]) => (
            <button key={val} onClick={() => setGradingMethod(val)}
              style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                background: gradingMethod === val ? 'var(--school-color, #BA0C2F)' : C.inner,
                color:      gradingMethod === val ? '#fff' : C.muted }}>
              {label}
            </button>
          ))}
        </div>
        {gradingMethod === 'total_points' && (
          <p style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>{t('total_points_description')}</p>
        )}
      </div>

      {gradingMethod === 'weighted' && (<>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 10 }}>{t('category_weights')}</div>

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

        {/* Add category */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <input
            placeholder={t('new_category_name')}
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCategory()}
            style={{ flex: 1, background: C.inner, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 12px', color: C.text, fontSize: 12, outline: 'none' }}
          />
          <button onClick={addCategory}
            style={{ background: `${C.teal}22`, color: C.teal, border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            {t('add')}
          </button>
        </div>

        {/* Live total bar */}
        <div style={{ background: C.inner, borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{t('total')}</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: totalColor }}>{total}%</span>
          </div>
          <div style={{ height: 6, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(total, 100)}%`, background: totalColor, borderRadius: 3, transition: 'width 0.3s, background 0.3s' }} />
          </div>
          {!totalOk && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <span style={{ fontSize: 11, color: totalColor }}>{total < 100 ? `${100 - total}% ${t('unallocated')}` : `${total - 100}% ${t('over_100')}`}</span>
              <button onClick={autoBalance}
                style={{ background: `${C.blue}22`, color: C.blue, border: 'none', borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                {t('auto_balance')}
              </button>
            </div>
          )}
          {totalOk && <div style={{ fontSize: 11, color: C.green, marginTop: 6 }}>✓ {t('weights_sum_100')}</div>}
        </div>

        {/* Category breakdown visual */}
        <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 14, gap: 1 }}>
          {draft.map(c => (
            <div key={c.id} style={{ flex: Number(c.weight) || 0, background: c.color, transition: 'flex 0.3s' }} title={`${c.name}: ${c.weight}%`} />
          ))}
        </div>
      </>)}

      <button onClick={handleSave} disabled={gradingMethod === 'weighted' && !totalOk}
        style={{ width: '100%', background: (gradingMethod === 'total_points' || totalOk) ? 'var(--school-color, #BA0C2F)' : '#2a2f42', color: (gradingMethod === 'total_points' || totalOk) ? '#fff' : C.muted, border: 'none', borderRadius: 999, padding: '14px', fontSize: 15, fontWeight: 800, cursor: (gradingMethod === 'total_points' || totalOk) ? 'pointer' : 'not-allowed' }}>
        {gradingMethod === 'weighted' && !totalOk ? `${t('weights_must_equal_100')} (${total}%)` : t('save_grading_setup')}
      </button>
    </div>
  )
}

// ─── Main Gradebook ────────────────────────────────────────────────────────────
export default function Gradebook({ onBack }) {
  const {
    classes, students, assignments, grades,
    getStudentsForClass, getAssignmentsForClass, getGradeForStudentAssignment,
    updateGrade, addAssignment, activeClass, setActiveClass, setActiveStudent, setScreen, goBack,
    categories, gradingMethod,
  } = useStore()

  const handleBack = onBack || goBack

  const [editModal,        setEditModal]        = useState(null)
  const [newAssignModal,   setNewAssignModal]    = useState(false)
  const [weightModal,      setWeightModal]       = useState(false)
  const [newAssign,        setNewAssign]         = useState({ name: '', type: 'quiz', categoryId: 2, includeInGrade: true })
  const [newScore,         setNewScore]          = useState('')
  const [search,           setSearch]            = useState('')
  const [sortBy,           setSortBy]            = useState('name')
  const [view,             setView]              = useState('table') // table | grid

  const cls         = activeClass || classes[0]
  const clsStudents = getStudentsForClass(cls?.id || 0).filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
  const clsAssigns  = getAssignmentsForClass(cls?.id || 0)

  const sorted = useMemo(() => [...clsStudents].sort((a, b) => {
    if (sortBy === 'grade') return b.grade - a.grade
    if (sortBy === 'name')  return a.name.localeCompare(b.name)
    return 0
  }), [clsStudents, sortBy])

  // Category weight summary for the header
  const catSummary = categories.map(c => `${c.name} ${c.weight}%`).join(' · ')

  function handleSaveGrade() {
    if (!editModal) return
    const score = parseFloat(newScore)
    if (isNaN(score)) return
    updateGrade(editModal.student.id, editModal.assignment.id, score)
    setEditModal(null)
  }

  function handleAddAssignment() {
    if (!newAssign.name.trim()) return
    const cat = categories.find(c => c.id === newAssign.categoryId) || categories[0]
    addAssignment({
      ...newAssign,
      classId:  cls.id,
      weight:   cat?.weight || 0,
      type:     cat?.name?.toLowerCase() || newAssign.type,
      date:     new Date().toISOString().split('T')[0],
      dueDate:  new Date().toISOString().split('T')[0],
      hasKey:   false,
    })
    setNewAssignModal(false)
    setNewAssign({ name: '', type: 'quiz', categoryId: 2, includeInGrade: true })
  }

  const gradeColor = (s) => s >= 90 ? C.green : s >= 80 ? C.blue : s >= 70 ? C.amber : s >= 60 ? '#f97316' : C.red

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Inter, Arial, sans-serif', paddingBottom: 80 }}>

      {/* ── Header ── */}
      <div style={{ padding: '20px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {handleBack && (
              <button onClick={handleBack} style={{ background: C.inner, border: 'none', borderRadius: 10, padding: '8px 14px', color: C.text, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← Back</button>
            )}
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Gradebook</h1>
              <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{cls?.period} · {cls?.subject} · {clsStudents.length} students</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <GradebookSyncStatus />
            <GradebookSyncButton />
          </div>
        </div>
        <button onClick={() => setNewAssignModal(true)} style={{ background: 'var(--school-color, #BA0C2F)', border: 'none', borderRadius: 12, padding: '8px 14px', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          + Assignment
        </button>
      </div>

      {/* ── Grading method + weight summary ── */}
      <div style={{ margin: '0 16px 12px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
              {gradingMethod === 'weighted' ? 'Category Weights' : 'Grading Method'}
            </div>
            <div style={{ fontSize: 11, color: C.text }}>
              {gradingMethod === 'weighted' ? catSummary : '∑ Total Points — all assignments equal'}
            </div>
          </div>
          <button onClick={() => setWeightModal(true)}
            style={{ background: `${C.teal}18`, color: C.teal, border: 'none', borderRadius: 10, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
            ⚙ Edit
          </button>
        </div>
        {gradingMethod === 'weighted' && (
          <div style={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', marginTop: 8, gap: 1 }}>
            {categories.map(c => (
              <div key={c.id} style={{ flex: c.weight, background: c.color }} title={`${c.name}: ${c.weight}%`} />
            ))}
          </div>
        )}
      </div>

      {/* ── Class tabs ── */}
      <div style={{ display: 'flex', gap: 6, padding: '0 16px', marginBottom: 12, overflowX: 'auto', paddingBottom: 4 }}>
        {classes.map(c => (
          <button key={c.id} onClick={() => setActiveClass(c)}
            style={{ padding: '6px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0,
              background: (cls?.id === c.id) ? 'var(--school-color, #BA0C2F)' : C.inner,
              color:      (cls?.id === c.id) ? '#fff' : C.muted }}>
            {c.period} · {c.subject}
          </button>
        ))}
      </div>

      {/* ── Search + sort ── */}
      <div style={{ padding: '0 16px', display: 'flex', gap: 8, marginBottom: 14 }}>
        <input
          style={{ flex: 1, background: C.inner, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 12px', color: C.text, fontSize: 12, outline: 'none' }}
          placeholder="Search students..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select onChange={e => setSortBy(e.target.value)} value={sortBy}
          style={{ background: C.inner, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 10px', color: C.text, fontSize: 12, cursor: 'pointer' }}>
          <option value="name">Name</option>
          <option value="grade">Grade</option>
        </select>
        <button onClick={() => setView(v => v === 'table' ? 'grid' : 'table')}
          style={{ background: C.inner, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 12px', color: C.muted, fontSize: 13, cursor: 'pointer' }}>
          {view === 'table' ? '⊞' : '☰'}
        </button>
      </div>

      {/* ── Table view ── */}
      {view === 'table' && (
        <div style={{ margin: '0 16px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
            <thead>
              <tr style={{ background: C.inner }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.muted, borderRadius: '10px 0 0 10px' }}>Student</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: C.muted }}>Avg</th>
                {clsAssigns.map(a => {
                  const cat = categories.find(c => c.id === a.categoryId)
                  return (
                    <th key={a.id} style={{ padding: '10px 8px', textAlign: 'center', fontSize: 10, fontWeight: 700, color: cat?.color || C.muted, whiteSpace: 'nowrap' }}>
                      {a.name.length > 8 ? a.name.slice(0, 8) + '…' : a.name}
                      <div style={{ fontSize: 8, color: C.muted, fontWeight: 400 }}>{cat?.name}</div>
                    </th>
                  )
                })}
                <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: C.muted, borderRadius: '0 10px 10px 0' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s, idx) => {
                const rowBg = idx % 2 === 0 ? C.card : C.inner
                const letter = s.grade >= 90 ? 'A' : s.grade >= 80 ? 'B' : s.grade >= 70 ? 'C' : s.grade >= 60 ? 'D' : 'F'
                return (
                  <tr key={s.id} style={{ background: rowBg, cursor: 'pointer' }}
                    onClick={() => { setActiveStudent(s); setScreen('studentProfile') }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#1a2540')}
                    onMouseLeave={e => (e.currentTarget.style.background = rowBg)}>
                    <td style={{ padding: '10px 12px', borderRadius: '10px 0 0 10px' }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: C.text }}>{s.name}</div>
                      {s.flagged && <span style={{ fontSize: 9, color: C.red }}>⚑ flagged</span>}
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: gradeColor(s.grade) }}>{s.grade}%</span>
                      <span style={{ fontSize: 10, color: gradeColor(s.grade), marginLeft: 4 }}>{letter}</span>
                    </td>
                    {clsAssigns.map(a => {
                      const g = getGradeForStudentAssignment(s.id, a.id)
                      return (
                        <td key={a.id} style={{ padding: '10px 8px', textAlign: 'center' }}>
                          {g ? (
                            <button onClick={e => { e.stopPropagation(); setEditModal({ student: s, assignment: a, grade: g }); setNewScore(String(g.score)) }}
                              style={{ background: `${gradeColor(g.score)}18`, color: gradeColor(g.score), border: 'none', borderRadius: 8, padding: '4px 8px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                              {g.score}%
                            </button>
                          ) : (
                            <button onClick={e => { e.stopPropagation(); setEditModal({ student: s, assignment: a, grade: null }); setNewScore('') }}
                              style={{ background: C.inner, color: C.muted, border: 'none', borderRadius: 8, padding: '4px 8px', fontSize: 11, cursor: 'pointer' }}>
                              —
                            </button>
                          )}
                        </td>
                      )
                    })}
                    <td style={{ padding: '10px 12px', textAlign: 'right', borderRadius: '0 10px 10px 0' }}>
                      <button onClick={e => { e.stopPropagation(); setActiveStudent(s); setScreen('studentProfile') }}
                        style={{ background: `${C.blue}22`, color: C.blue, border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
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

      {/* ── Grid view ── */}
      {view === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 16px' }}>
          {sorted.map(s => {
            const letter = s.grade >= 90 ? 'A' : s.grade >= 80 ? 'B' : s.grade >= 70 ? 'C' : s.grade >= 60 ? 'D' : 'F'
            return (
              <button key={s.id} onClick={() => { setActiveStudent(s); setScreen('studentProfile') }}
                style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '14px', textAlign: 'left', cursor: 'pointer' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 4 }}>{s.name}</div>
                <div style={{ marginBottom: 8 }}><GradeBar score={s.grade} /></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: gradeColor(s.grade) }}>{s.grade}%</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: gradeColor(s.grade) }}>{letter}</span>
                </div>
                {s.flagged && <div style={{ fontSize: 9, color: C.red, marginTop: 4 }}>⚑ needs attention</div>}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Edit Grade Modal ── */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title={`Edit Grade — ${editModal?.student?.name}`}>
        {editModal && (
          <div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              <span style={{ background: C.inner, borderRadius: 999, padding: '4px 10px', fontSize: 11, color: C.muted }}>{editModal.assignment.name}</span>
              <span style={{ background: C.inner, borderRadius: 999, padding: '4px 10px', fontSize: 11, color: C.muted }}>
                {categories.find(c => c.id === editModal.assignment.categoryId)?.name || editModal.assignment.type}
              </span>
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

      {/* ── New Assignment Modal ── */}
      <Modal open={newAssignModal} onClose={() => setNewAssignModal(false)} title="New Assignment">
        <div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 6 }}>Assignment Name</label>
            <input value={newAssign.name} onChange={e => setNewAssign(n => ({ ...n, name: e.target.value }))}
              placeholder="e.g. Ch.5 Quiz"
              style={{ width: '100%', background: C.inner, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Category picker — this is how PowerSchool/Canvas do it */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 6 }}>Category</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setNewAssign(n => ({ ...n, categoryId: cat.id, type: cat.name.toLowerCase() }))}
                  style={{ padding: '8px 14px', borderRadius: 999, border: `2px solid ${newAssign.categoryId === cat.id ? cat.color : 'transparent'}`, cursor: 'pointer', fontSize: 12, fontWeight: 700, transition: 'all 0.15s',
                    background: newAssign.categoryId === cat.id ? `${cat.color}22` : C.inner,
                    color:      newAssign.categoryId === cat.id ? cat.color : C.muted }}>
                  {cat.icon} {cat.name}
                  <span style={{ fontSize: 10, marginLeft: 4, opacity: 0.7 }}>{cat.weight}%</span>
                </button>
              ))}
            </div>
            <p style={{ fontSize: 10, color: C.muted, marginTop: 6 }}>
              Weight is inherited from the category. <button onClick={() => { setNewAssignModal(false); setWeightModal(true) }}
                style={{ background: 'none', border: 'none', color: C.teal, fontSize: 10, fontWeight: 700, cursor: 'pointer', padding: 0 }}>Edit category weights →</button>
            </p>
          </div>

          {/* Include in grade toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.inner, borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Include in final grade</div>
              <div style={{ fontSize: 11, color: C.muted }}>Uncheck for practice/ungraded work</div>
            </div>
            <button onClick={() => setNewAssign(n => ({ ...n, includeInGrade: !n.includeInGrade }))}
              style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', transition: 'background 0.2s', position: 'relative',
                background: newAssign.includeInGrade ? C.green : C.border }}>
              <div style={{ position: 'absolute', top: 2, left: newAssign.includeInGrade ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
            </button>
          </div>

          <button onClick={handleAddAssignment}
            style={{ width: '100%', background: 'var(--school-color, #BA0C2F)', color: '#fff', border: 'none', borderRadius: 999, padding: '14px', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
            Add Assignment
          </button>
        </div>
      </Modal>

      {/* ── Weight Editor Modal ── */}
      <Modal open={weightModal} onClose={() => setWeightModal(false)} title="⚖ Grading Setup">
        <WeightEditor onClose={() => setWeightModal(false)} />
      </Modal>
    </div>
  )
}
