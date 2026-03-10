import React, { useState } from 'react'
import { useStore } from '../lib/store'
import { GradeBar, GradeBadge, Modal, Tag, AssignmentOptions } from '../components/ui'

// ── New Class Modal ───────────────────────────────────────────────────────────
function NewClassModal({ open, onClose }) {
  const [step, setStep] = useState('choose') // 'choose' | 'manual' | 'spreadsheet' | 'camera'
  const [form, setForm] = useState({ subject: '', period: '', room: '', color: '#3b7ef4' })
  const [students, setStudents] = useState([{ name: '', id: '' }])
  const [fileUploaded, setFileUploaded] = useState(false)
  const fileRef = React.useRef()

  const colorOptions = ['#3b7ef4', '#22c97a', '#f04a4a', '#f5a623', '#9b6ef5', '#0fb8a0']

  function addStudentRow() {
    setStudents(s => [...s, { name: '', id: '' }])
  }

  function handleSave() {
    // In a real app, save to store
    onClose()
    setStep('choose')
    setForm({ subject: '', period: '', room: '', color: '#3b7ef4' })
    setStudents([{ name: '', id: '' }])
  }

  if (!open) return null

  return (
    <Modal open={open} onClose={() => { onClose(); setStep('choose') }} title="➕ Add New Class">
      {step === 'choose' && (
        <div className="space-y-3 p-1">
          <p className="text-text-muted text-sm">How would you like to add students?</p>
          {[
            { id: 'spreadsheet', icon: '📊', label: 'Upload Spreadsheet', sub: 'CSV or Excel with student roster', color: '#22c97a' },
            { id: 'manual', icon: '✏️', label: 'Enter Students Manually', sub: 'Type student names one by one', color: '#3b7ef4' },
            { id: 'camera', icon: '📷', label: 'Take a Photo / Scan', sub: 'Photograph a printed class roster', color: '#9b6ef5' },
          ].map(opt => (
            <button key={opt.id} onClick={() => setStep(opt.id)}
              className="w-full p-4 rounded-card text-left transition-all hover:scale-[1.01] flex items-center gap-3"
              style={{ background: '#161923', border: `1px solid ${opt.color}22` }}>
              <span className="text-2xl">{opt.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-text-primary text-sm">{opt.label}</p>
                <p className="text-text-muted" style={{ fontSize: '11px' }}>{opt.sub}</p>
              </div>
              <span className="text-text-muted">›</span>
            </button>
          ))}
        </div>
      )}

      {(step === 'manual' || step === 'spreadsheet' || step === 'camera') && (
        <div className="space-y-4">
          <button onClick={() => setStep('choose')} className="text-text-muted text-sm hover:text-text-primary flex items-center gap-1">← Back</button>

          {/* Class info always shown */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="tag-label block mb-1">Subject</label>
              <input className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm"
                placeholder="e.g. Math" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
            </div>
            <div>
              <label className="tag-label block mb-1">Period</label>
              <input className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm"
                placeholder="e.g. 5th" value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))} />
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="tag-label block mb-2">Class Color</label>
            <div className="flex gap-2">
              {colorOptions.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                  className="w-8 h-8 rounded-full transition-all hover:scale-110"
                  style={{ background: c, border: form.color === c ? `3px solid white` : '2px solid transparent' }} />
              ))}
            </div>
          </div>

          {step === 'spreadsheet' && (
            <div>
              <label className="tag-label block mb-2">Upload Roster File</label>
              {!fileUploaded ? (
                <button onClick={() => fileRef.current?.click()}
                  className="w-full p-6 rounded-card flex flex-col items-center gap-2 border-2 border-dashed transition-all hover:border-accent"
                  style={{ borderColor: '#2a2f42', background: '#161923' }}>
                  <span className="text-3xl">📊</span>
                  <p className="text-text-primary text-sm font-semibold">Click to upload</p>
                  <p className="text-text-muted" style={{ fontSize: '10px' }}>CSV · Excel (.xlsx)</p>
                </button>
              ) : (
                <div className="p-3 rounded-card flex items-center gap-3" style={{ background: '#0f2a1a', border: '1px solid #22c97a40' }}>
                  <span>📊</span>
                  <p className="text-success text-sm font-semibold">roster.csv uploaded — 24 students found</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden"
                onChange={() => setFileUploaded(true)} />
            </div>
          )}

          {step === 'camera' && (
            <div className="p-6 rounded-card flex flex-col items-center gap-3" style={{ background: '#161923', border: '1px solid #9b6ef520' }}>
              <span className="text-4xl">📷</span>
              <p className="font-semibold text-text-primary">Open Camera</p>
              <p className="text-text-muted text-sm text-center">Point at a printed class roster and we'll read the student names automatically</p>
              <button onClick={() => { useStore.getState().setScreen('camera'); onClose() }}
                className="px-6 py-2.5 rounded-pill text-sm font-bold text-white"
                style={{ background: '#9b6ef5' }}>
                📷 Open Scanner
              </button>
            </div>
          )}

          {step === 'manual' && (
            <div>
              <label className="tag-label block mb-2">Students</label>
              <div className="space-y-2 max-h-48 overflow-y-auto mb-2">
                {students.map((s, i) => (
                  <div key={i} className="flex gap-2">
                    <input className="flex-1 bg-elevated border border-border rounded-card px-3 py-1.5 text-text-primary text-sm"
                      placeholder={`Student ${i + 1} name`}
                      value={s.name}
                      onChange={e => setStudents(list => list.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                    <input className="w-20 bg-elevated border border-border rounded-card px-3 py-1.5 text-text-primary text-sm"
                      placeholder="ID"
                      value={s.id}
                      onChange={e => setStudents(list => list.map((x, j) => j === i ? { ...x, id: e.target.value } : x))} />
                  </div>
                ))}
              </div>
              <button onClick={addStudentRow} className="text-accent text-xs font-semibold">+ Add student</button>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button onClick={() => { onClose(); setStep('choose') }} className="flex-1 py-2.5 rounded-pill text-sm font-semibold" style={{ background: '#1e2231', color: '#6b7494' }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={!form.subject || !form.period}
              className="flex-1 py-2.5 rounded-pill text-sm font-bold text-white disabled:opacity-40"
              style={{ background: 'var(--school-color)' }}>
              Create Class
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

function NewAssignmentModal({ open, onClose, classId }) {
  const { addAssignment } = useStore()
  const [form, setForm] = useState({
    name: '', type: 'quiz', date: new Date().toISOString().split('T')[0], dueDate: '', weight: 30
  })
  const [options, setOptions] = useState({ lockdown: false, timer: false, shuffle: false, schedule: false, monitor: false })
  const [applyAll, setApplyAll] = useState(false)

  const typeWeights = { test: 40, quiz: 30, homework: 20, participation: 10 }

  function handleTypeChange(type) {
    setForm(f => ({ ...f, type, weight: typeWeights[type] }))
  }

  function handleSave() {
    addAssignment({ ...form, classId, options, applyAll })
    onClose()
    setForm({ name: '', type: 'quiz', date: new Date().toISOString().split('T')[0], dueDate: '', weight: 30 })
  }

  return (
    <Modal open={open} onClose={onClose} title="New Assignment">
      <div className="space-y-4">
        <div>
          <label className="tag-label block mb-1">Assignment Name</label>
          <input
            className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm"
            placeholder="e.g. Chapter 4 Quiz"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
        </div>

        <div>
          <label className="tag-label block mb-2">Type</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'test', label: 'Test', weight: '40%', color: '#f04a4a' },
              { id: 'quiz', label: 'Quiz', weight: '30%', color: '#f5a623' },
              { id: 'homework', label: 'Homework', weight: '20%', color: '#22c97a' },
              { id: 'participation', label: 'Part.', weight: '10%', color: '#9b6ef5' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => handleTypeChange(t.id)}
                className="py-2 rounded-card text-xs font-bold transition-all"
                style={{
                  background: form.type === t.id ? `${t.color}22` : '#1e2231',
                  color: form.type === t.id ? t.color : '#6b7494',
                  border: `1px solid ${form.type === t.id ? t.color + '50' : 'transparent'}`
                }}
              >
                <div>{t.label}</div>
                <div style={{ fontSize: '9px', opacity: 0.7 }}>{t.weight}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="tag-label block mb-1">Assign Date</label>
            <input type="date" className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm"
              value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div>
            <label className="tag-label block mb-1">Due Date</label>
            <input type="date" className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm"
              value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
          </div>
        </div>

        <div className="p-3 rounded-card" style={{ background: '#161923' }}>
          <AssignmentOptions options={options} onChange={setOptions} />
        </div>

        <div className="flex items-center gap-2 p-3 rounded-card" style={{ background: '#1e2231' }}>
          <input type="checkbox" id="applyAll" checked={applyAll} onChange={e => setApplyAll(e.target.checked)}
            className="rounded" />
          <label htmlFor="applyAll" className="text-sm text-text-muted cursor-pointer">
            Apply to all my classes
          </label>
        </div>

        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-pill text-sm font-semibold" style={{ background: '#1e2231', color: '#6b7494' }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.name}
            className="flex-1 py-2.5 rounded-pill text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: 'var(--school-color)', color: 'white' }}
          >
            Create Assignment
          </button>
        </div>
      </div>
    </Modal>
  )
}

function EditGradeModal({ open, onClose, student, assignment }) {
  const { updateGrade, getGradeForStudentAssignment } = useStore()
  const existing = student && assignment ? getGradeForStudentAssignment(student.id, assignment.id) : null
  const [score, setScore] = useState(existing?.score || '')

  function handleSave() {
    updateGrade(student.id, assignment.id, Number(score))
    onClose()
  }

  if (!student || !assignment) return null
  return (
    <Modal open={open} onClose={onClose} title={`Edit Grade — ${student.name}`}>
      <div className="space-y-4">
        <p className="text-text-muted text-sm">{assignment.name} · {assignment.type}</p>
        <div>
          <label className="tag-label block mb-1">Score (out of 100)</label>
          <input
            type="number" min="0" max="100"
            className="w-full bg-elevated border border-border rounded-card px-3 py-3 text-text-primary text-2xl font-bold text-center"
            value={score}
            onChange={e => setScore(e.target.value)}
            autoFocus
          />
        </div>
        {score && <GradeBadge score={Number(score)} />}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-pill text-sm" style={{ background: '#1e2231', color: '#6b7494' }}>Cancel</button>
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-pill text-sm font-bold" style={{ background: 'var(--school-color)', color: 'white' }}>Save Grade</button>
        </div>
      </div>
    </Modal>
  )
}

export default function Gradebook() {
  const { classes, activeClass, setActiveClass, getStudentsForClass, getAssignmentsForClass, getGradeForStudentAssignment, setActiveStudent } = useStore()
  const [showNewAssignment, setShowNewAssignment] = useState(false)
  const [showNewClass, setShowNewClass] = useState(false)
  const [editGrade, setEditGrade] = useState({ open: false, student: null, assignment: null })
  const [view, setView] = useState('list') // 'list' | 'columns'
  const [sortBy, setSortBy] = useState(null) // assignment id to sort by
  const [sortDir, setSortDir] = useState('asc')
  function toggleSort(assignmentId) {
    if (sortBy === assignmentId) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(assignmentId); setSortDir('asc') }
  }

  const currentClass = activeClass || classes[0]
  const students = getStudentsForClass(currentClass?.id)
  const assignments = getAssignmentsForClass(currentClass?.id)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-primary">Gradebook</h1>
          <p className="text-text-muted text-sm">Synced · PowerSchool ✓</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewClass(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-pill text-sm font-bold transition-all hover:opacity-90"
            style={{ background: '#1e2231', color: '#eef0f8', border: '1px solid #2a2f42' }}
          >
            🏫 New Class
          </button>
          <button
            onClick={() => setShowNewAssignment(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-pill text-sm font-bold transition-all hover:opacity-90"
            style={{ background: 'var(--school-color)', color: 'white' }}
          >
            + New Assignment
          </button>
        </div>
      </div>

      {/* Period tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {classes.map(cls => (
          <button
            key={cls.id}
            onClick={() => setActiveClass(cls)}
            className="flex-shrink-0 px-4 py-2 rounded-pill text-sm font-semibold transition-all"
            style={{
              background: currentClass?.id === cls.id ? 'var(--school-color)' : '#1e2231',
              color: currentClass?.id === cls.id ? 'white' : '#6b7494'
            }}
          >
            {cls.period} · {cls.subject}
          </button>
        ))}
      </div>

      {/* View toggle */}
      <div className="flex gap-2 mb-4">
        {[{ id: 'list', label: '👤 Student List' }, { id: 'columns', label: '📊 Assignment Columns' }].map(v => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className="px-3 py-1.5 rounded-pill text-xs font-semibold transition-all"
            style={{
              background: view === v.id ? '#1e2231' : 'transparent',
              color: view === v.id ? '#eef0f8' : '#6b7494',
              border: `1px solid ${view === v.id ? '#2a2f42' : 'transparent'}`
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === 'list' ? (
        /* Student list view */
        <div className="space-y-2">
          {students.map(student => (
            <div key={student.id} className="p-4 rounded-card flex items-center gap-4" style={{ background: '#161923' }}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-text-primary">{student.name}</p>
                  {student.submitUngraded && (
                    <button
                      onClick={() => {
                        const firstAssignment = assignments[0]
                        if (firstAssignment) setEditGrade({ open: true, student, assignment: firstAssignment })
                      }}
                      className="transition-all hover:scale-105"
                      title="Click to grade submitted assignment"
                    >
                      <Tag color="#f5a623">📬 Submitted — Grade Now</Tag>
                    </button>
                  )}
                  {student.flagged && <span className="text-danger text-xs">⚑</span>}
                </div>
                <GradeBar value={student.grade} />
              </div>
              <GradeBadge score={student.grade} />
              <button
                onClick={() => setActiveStudent(student)}
                className="text-accent text-lg hover:scale-110 transition-transform"
              >
                ›
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Assignment columns view */
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left py-2 px-3 text-text-muted font-semibold" style={{ fontSize: '11px', minWidth: '140px' }}>Student</th>
                {assignments.map(a => (
                  <th key={a.id} onClick={() => toggleSort(a.id)}
                    className="py-2 px-2 text-center font-semibold cursor-pointer transition-colors"
                    style={{ fontSize: '10px', minWidth: '80px', color: sortBy === a.id ? 'var(--school-color)' : '#6b7494' }}>
                    {a.name} {sortBy === a.id ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                    <div style={{ fontSize: '8px', color: '#6b7494', fontWeight: 400 }}>{a.type}</div>
                  </th>
                ))}
                <th className="py-2 px-2 text-center" style={{ fontSize: '11px', color: 'var(--school-color)', minWidth: '70px' }}>
                  <button onClick={() => setShowNewAssignment(true)} className="font-bold">+ Add</button>
                </th>
                <th className="py-2 px-2 text-center text-accent font-bold" style={{ fontSize: '11px', minWidth: '60px' }}>Avg</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, i) => (
                <tr key={student.id} style={{ background: i % 2 === 0 ? '#161923' : '#131720' }}>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setActiveStudent(student)} className="text-text-primary font-medium text-sm hover:text-accent transition-colors">
                        {student.name}
                      </button>
                      {student.submitUngraded && (
                        <button
                          onClick={() => {
                            const firstAssignment = assignments[0]
                            if (firstAssignment) setEditGrade({ open: true, student, assignment: firstAssignment })
                          }}
                          className="w-2.5 h-2.5 rounded-full bg-warning hover:scale-125 transition-transform"
                          title="Submitted — click to grade"
                        />
                      )}
                    </div>
                  </td>
                  {assignments.map(a => {
                    const g = getGradeForStudentAssignment(student.id, a.id)
                    return (
                      <td key={a.id} className="py-2 px-2 text-center">
                        <button
                          onClick={() => setEditGrade({ open: true, student, assignment: a })}
                          className="px-2 py-0.5 rounded text-xs font-bold hover:bg-elevated transition-colors"
                          style={{ color: g ? (g.score >= 70 ? '#22c97a' : '#f04a4a') : '#6b7494' }}
                        >
                          {g ? `${g.score}` : '—'}
                        </button>
                      </td>
                    )
                  })}
                  <td className="py-2 px-2 text-center">
                    <button onClick={() => setShowNewAssignment(true)} className="text-text-muted hover:text-accent text-sm transition-colors">+</button>
                  </td>
                  <td className="py-2 px-2 text-center">
                    <GradeBadge score={student.grade} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <NewAssignmentModal open={showNewAssignment} onClose={() => setShowNewAssignment(false)} classId={currentClass?.id} />
      <NewClassModal open={showNewClass} onClose={() => setShowNewClass(false)} />
      <EditGradeModal open={editGrade.open} onClose={() => setEditGrade({ open: false, student: null, assignment: null })} student={editGrade.student} assignment={editGrade.assignment} />
    </div>
  )
}
