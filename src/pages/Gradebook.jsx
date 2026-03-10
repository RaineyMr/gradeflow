import React, { useMemo, useState } from 'react'
import { useStore } from '../lib/store'
import { GradeBar, GradeBadge, Modal, Tag, AssignmentOptions } from '../components/ui'

function NewAssignmentModal({ open, onClose, classId }) {
  const classes = useStore((state) => state.classes || [])
  const addAssignment = useStore((state) => state.addAssignment)
  const quickCreateAssignment = useStore((state) => state.quickCreateAssignment)
  const clearQuickCreateAssignment = useStore((state) => state.clearQuickCreateAssignment)

  const [form, setForm] = useState({
    name: '',
    type: 'quiz',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    weight: 30,
  })
  const [options, setOptions] = useState({
    lockdown: false,
    timer: false,
    shuffle: false,
    schedule: false,
    monitor: false,
  })
  const [applyAll, setApplyAll] = useState(false)

  const typeWeights = {
    test: 40,
    quiz: 30,
    homework: 20,
    participation: 10,
  }

  function resetForm() {
    setForm({
      name: '',
      type: 'quiz',
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      weight: 30,
    })
    setOptions({
      lockdown: false,
      timer: false,
      shuffle: false,
      schedule: false,
      monitor: false,
    })
    setApplyAll(false)
  }

  function handleTypeChange(type) {
    setForm((current) => ({
      ...current,
      type,
      weight: typeWeights[type] || 30,
    }))
  }

  function handleSave() {
    const payload = {
      ...form,
      classId: applyAll ? null : classId || classes[0]?.id || null,
      options,
      applyAll,
    }

    if (typeof addAssignment === 'function') {
      addAssignment(payload)
    } else if (typeof quickCreateAssignment === 'function') {
      quickCreateAssignment(payload)
    } else {
      console.error('No assignment creation action found in store.')
    }

    if (typeof clearQuickCreateAssignment === 'function') {
      clearQuickCreateAssignment()
    }

    onClose()
    resetForm()
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
            onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
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
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => handleTypeChange(type.id)}
                className="py-2 rounded-card text-xs font-bold transition-all"
                style={{
                  background: form.type === type.id ? `${type.color}22` : '#1e2231',
                  color: form.type === type.id ? type.color : '#6b7494',
                  border: `1px solid ${
                    form.type === type.id ? `${type.color}50` : 'transparent'
                  }`,
                }}
              >
                <div>{type.label}</div>
                <div style={{ fontSize: '9px', opacity: 0.7 }}>{type.weight}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="tag-label block mb-1">Assign Date</label>
            <input
              type="date"
              className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm"
              value={form.date}
              onChange={(e) => setForm((current) => ({ ...current, date: e.target.value }))}
            />
          </div>
          <div>
            <label className="tag-label block mb-1">Due Date</label>
            <input
              type="date"
              className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm"
              value={form.dueDate}
              onChange={(e) =>
                setForm((current) => ({ ...current, dueDate: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="p-3 rounded-card" style={{ background: '#161923' }}>
          <AssignmentOptions options={options} onChange={setOptions} />
        </div>

        <div
          className="flex items-center gap-2 p-3 rounded-card"
          style={{ background: '#1e2231' }}
        >
          <input
            type="checkbox"
            id="applyAll"
            checked={applyAll}
            onChange={(e) => setApplyAll(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="applyAll" className="text-sm text-text-muted cursor-pointer">
            Apply to all my classes
          </label>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => {
              onClose()
              resetForm()
            }}
            className="flex-1 py-2.5 rounded-pill text-sm font-semibold"
            style={{ background: '#1e2231', color: '#6b7494' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.name.trim()}
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

function NewClassModal({ open, onClose }) {
  const addClass = useStore((state) => state.addClass)
  const [mode, setMode] = useState('menu')
  const [form, setForm] = useState({
    period: '',
    subject: '',
    students: '',
  })

  function resetModal() {
    setMode('menu')
    setForm({
      period: '',
      subject: '',
      students: '',
    })
  }

  function handleCreateManual() {
    if (!form.period.trim() || !form.subject.trim()) return

    if (typeof addClass === 'function') {
      addClass({
        period: form.period,
        subject: form.subject,
        students: Number(form.students) || 0,
      })
    }

    onClose()
    resetModal()
  }

  return (
    <Modal open={open} onClose={onClose} title="Add New Class">
      {mode === 'menu' && (
        <div className="space-y-3">
          <button
            onClick={() => setMode('spreadsheet')}
            className="w-full text-left p-4 rounded-card transition-colors hover:bg-elevated"
            style={{ background: '#161923' }}
          >
            <div className="font-semibold text-text-primary">📄 Upload Spreadsheet</div>
            <div className="text-text-muted text-xs mt-1">
              Import a roster from a CSV or spreadsheet export
            </div>
          </button>

          <button
            onClick={() => setMode('manual')}
            className="w-full text-left p-4 rounded-card transition-colors hover:bg-elevated"
            style={{ background: '#161923' }}
          >
            <div className="font-semibold text-text-primary">✍️ Enter Students Manually</div>
            <div className="text-text-muted text-xs mt-1">
              Create a class and add students by hand
            </div>
          </button>

          <button
            onClick={() => setMode('photo')}
            className="w-full text-left p-4 rounded-card transition-colors hover:bg-elevated"
            style={{ background: '#161923' }}
          >
            <div className="font-semibold text-text-primary">📷 Take a Picture</div>
            <div className="text-text-muted text-xs mt-1">
              Use a roster photo or worksheet image
            </div>
          </button>
        </div>
      )}

      {mode === 'spreadsheet' && (
        <div className="space-y-4">
          <div className="p-4 rounded-card" style={{ background: '#161923' }}>
            <p className="font-semibold text-text-primary mb-1">Spreadsheet import</p>
            <p className="text-text-muted text-sm">
              Connect this to your spreadsheet upload flow next. The button below creates a
              placeholder class for testing.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={resetModal}
              className="flex-1 py-2.5 rounded-pill text-sm font-semibold"
              style={{ background: '#1e2231', color: '#6b7494' }}
            >
              Back
            </button>
            <button
              onClick={() => {
                if (typeof addClass === 'function') {
                  addClass({ period: 'New', subject: 'Imported Class', students: 0 })
                }
                onClose()
                resetModal()
              }}
              className="flex-1 py-2.5 rounded-pill text-sm font-bold"
              style={{ background: 'var(--school-color)', color: 'white' }}
            >
              Create Placeholder
            </button>
          </div>
        </div>
      )}

      {mode === 'photo' && (
        <div className="space-y-4">
          <div className="p-4 rounded-card" style={{ background: '#161923' }}>
            <p className="font-semibold text-text-primary mb-1">Photo roster import</p>
            <p className="text-text-muted text-sm">
              This can route to your camera / OCR flow later. For now, it creates a placeholder
              class so the UI is usable.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={resetModal}
              className="flex-1 py-2.5 rounded-pill text-sm font-semibold"
              style={{ background: '#1e2231', color: '#6b7494' }}
            >
              Back
            </button>
            <button
              onClick={() => {
                if (typeof addClass === 'function') {
                  addClass({ period: 'New', subject: 'Photo Import Class', students: 0 })
                }
                onClose()
                resetModal()
              }}
              className="flex-1 py-2.5 rounded-pill text-sm font-bold"
              style={{ background: 'var(--school-color)', color: 'white' }}
            >
              Create Placeholder
            </button>
          </div>
        </div>
      )}

      {mode === 'manual' && (
        <div className="space-y-4">
          <div>
            <label className="tag-label block mb-1">Period</label>
            <input
              className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm"
              placeholder="e.g. 1st"
              value={form.period}
              onChange={(e) => setForm((current) => ({ ...current, period: e.target.value }))}
            />
          </div>

          <div>
            <label className="tag-label block mb-1">Subject</label>
            <input
              className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm"
              placeholder="e.g. Chemistry"
              value={form.subject}
              onChange={(e) => setForm((current) => ({ ...current, subject: e.target.value }))}
            />
          </div>

          <div>
            <label className="tag-label block mb-1">Student Count</label>
            <input
              type="number"
              min="0"
              className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm"
              placeholder="e.g. 28"
              value={form.students}
              onChange={(e) => setForm((current) => ({ ...current, students: e.target.value }))}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={resetModal}
              className="flex-1 py-2.5 rounded-pill text-sm font-semibold"
              style={{ background: '#1e2231', color: '#6b7494' }}
            >
              Back
            </button>
            <button
              onClick={handleCreateManual}
              disabled={!form.period.trim() || !form.subject.trim()}
              className="flex-1 py-2.5 rounded-pill text-sm font-bold disabled:opacity-40"
              style={{ background: 'var(--school-color)', color: 'white' }}
            >
              Create Class
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

function EditGradeModal({ open, onClose, student, assignment }) {
  const updateGrade = useStore((state) => state.updateGrade)
  const getGradeForStudentAssignment = useStore(
    (state) => state.getGradeForStudentAssignment
  )
  const existing =
    student && assignment
      ? getGradeForStudentAssignment(student.id, assignment.id)
      : null

  const [score, setScore] = useState(existing?.score || '')

  React.useEffect(() => {
    setScore(existing?.score ?? '')
  }, [existing?.score, student?.id, assignment?.id])

  function handleSave() {
    if (!student || !assignment || typeof updateGrade !== 'function') return
    updateGrade(student.id, assignment.id, Number(score))
    onClose()
  }

  if (!student || !assignment) return null

  return (
    <Modal open={open} onClose={onClose} title={`Edit Grade — ${student.name}`}>
      <div className="space-y-4">
        <p className="text-text-muted text-sm">
          {assignment.name} · {assignment.type}
        </p>
        <div>
          <label className="tag-label block mb-1">Score (out of 100)</label>
          <input
            type="number"
            min="0"
            max="100"
            className="w-full bg-elevated border border-border rounded-card px-3 py-3 text-text-primary text-2xl font-bold text-center"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            autoFocus
          />
        </div>
        {score !== '' && <GradeBadge score={Number(score)} />}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-pill text-sm"
            style={{ background: '#1e2231', color: '#6b7494' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-pill text-sm font-bold"
            style={{ background: 'var(--school-color)', color: 'white' }}
          >
            Save Grade
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function Gradebook() {
  const classes = useStore((state) => state.classes || [])
  const activeClass = useStore((state) => state.activeClass)
  const setActiveClass = useStore((state) => state.setActiveClass)
  const getStudentsForClass = useStore((state) => state.getStudentsForClass)
  const getAssignmentsForClass = useStore((state) => state.getAssignmentsForClass)
  const getGradeForStudentAssignment = useStore(
    (state) => state.getGradeForStudentAssignment
  )
  const setActiveStudent = useStore((state) => state.setActiveStudent)
  const setScreen = useStore((state) => state.setScreen)

  const [showNewAssignment, setShowNewAssignment] = useState(false)
  const [showNewClass, setShowNewClass] = useState(false)
  const [editGrade, setEditGrade] = useState({
    open: false,
    student: null,
    assignment: null,
  })
  const [view, setView] = useState('list')
  const [sortBy, setSortBy] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  function toggleSort(assignmentId) {
    if (sortBy === assignmentId) {
      setSortDir((direction) => (direction === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(assignmentId)
      setSortDir('asc')
    }
  }

  const currentClass = activeClass || classes[0] || null
  const students = currentClass ? getStudentsForClass(currentClass.id) : []
  const assignments = currentClass ? getAssignmentsForClass(currentClass.id) : []

  const displayedStudents = useMemo(() => {
    if (!sortBy) return students

    return [...students].sort((studentA, studentB) => {
      const gradeA = getGradeForStudentAssignment(studentA.id, sortBy)?.score
      const gradeB = getGradeForStudentAssignment(studentB.id, sortBy)?.score
      const valueA = typeof gradeA === 'number' ? gradeA : -1
      const valueB = typeof gradeB === 'number' ? gradeB : -1

      return sortDir === 'asc' ? valueA - valueB : valueB - valueA
    })
  }, [students, sortBy, sortDir, getGradeForStudentAssignment])

  function openStudent(student) {
    setActiveStudent(student)
  }

  function openStudentForGrading(student) {
    setActiveStudent(student)
    setScreen('studentProfile')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-primary">Gradebook</h1>
          <p className="text-text-muted text-sm">Synced · PowerSchool ✓</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewClass(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-pill text-sm font-bold transition-all hover:opacity-90"
            style={{ background: '#1e2231', color: '#eef0f8' }}
          >
            + New Class
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

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {classes.map((classItem) => (
          <button
            key={classItem.id}
            onClick={() => setActiveClass(classItem)}
            className="flex-shrink-0 px-4 py-2 rounded-pill text-sm font-semibold transition-all"
            style={{
              background:
                currentClass?.id === classItem.id ? 'var(--school-color)' : '#1e2231',
              color: currentClass?.id === classItem.id ? 'white' : '#6b7494',
            }}
          >
            {classItem.period} · {classItem.subject}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { id: 'list', label: '👤 Student List' },
          { id: 'columns', label: '📊 Assignment Columns' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className="px-3 py-1.5 rounded-pill text-xs font-semibold transition-all"
            style={{
              background: view === item.id ? '#1e2231' : 'transparent',
              color: view === item.id ? '#eef0f8' : '#6b7494',
              border: `1px solid ${view === item.id ? '#2a2f42' : 'transparent'}`,
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {!currentClass ? (
        <div className="p-6 rounded-card text-center" style={{ background: '#161923' }}>
          <p className="text-text-primary font-semibold mb-2">No classes yet</p>
          <p className="text-text-muted text-sm mb-4">
            Create your first class to start grading.
          </p>
          <button
            onClick={() => setShowNewClass(true)}
            className="px-4 py-2 rounded-pill text-sm font-bold"
            style={{ background: 'var(--school-color)', color: 'white' }}
          >
            + New Class
          </button>
        </div>
      ) : view === 'list' ? (
        <div className="space-y-2">
          {displayedStudents.map((student) => (
            <div
              key={student.id}
              className="p-4 rounded-card flex items-center gap-4"
              style={{ background: '#161923' }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-semibold text-text-primary">{student.name}</p>
                  {student.submitUngraded && (
                    <button
                      onClick={() => openStudentForGrading(student)}
                      className="inline-flex"
                    >
                      <Tag color="#f5a623">Submitted — Ungraded</Tag>
                    </button>
                  )}
                  {student.flagged && <span className="text-danger text-xs">⚑</span>}
                </div>
                <GradeBar value={student.grade} />
              </div>
              <GradeBadge score={student.grade} />
              <button
                onClick={() => openStudent(student)}
                className="text-accent text-lg hover:scale-110 transition-transform"
              >
                ›
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th
                  className="text-left py-2 px-3 text-text-muted font-semibold"
                  style={{ fontSize: '11px', minWidth: '140px' }}
                >
                  Student
                </th>
                {assignments.map((assignment) => (
                  <th
                    key={assignment.id}
                    onClick={() => toggleSort(assignment.id)}
                    className="py-2 px-2 text-center font-semibold cursor-pointer transition-colors"
                    style={{
                      fontSize: '10px',
                      minWidth: '80px',
                      color:
                        sortBy === assignment.id ? 'var(--school-color)' : '#6b7494',
                    }}
                  >
                    {assignment.name}{' '}
                    {sortBy === assignment.id ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                    <div
                      style={{ fontSize: '8px', color: '#6b7494', fontWeight: 400 }}
                    >
                      {assignment.type}
                    </div>
                  </th>
                ))}
                <th
                  className="py-2 px-2 text-center"
                  style={{ fontSize: '11px', color: 'var(--school-color)', minWidth: '70px' }}
                >
                  <button onClick={() => setShowNewAssignment(true)} className="font-bold">
                    + Add
                  </button>
                </th>
                <th
                  className="py-2 px-2 text-center text-accent font-bold"
                  style={{ fontSize: '11px', minWidth: '60px' }}
                >
                  Avg
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedStudents.map((student, index) => (
                <tr
                  key={student.id}
                  style={{ background: index % 2 === 0 ? '#161923' : '#131720' }}
                >
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openStudent(student)}
                        className="text-text-primary font-medium text-sm hover:text-accent transition-colors"
                      >
                        {student.name}
                      </button>
                      {student.submitUngraded && (
                        <button
                          onClick={() => openStudentForGrading(student)}
                          className="w-2 h-2 rounded-full"
                          style={{ background: '#f5a623' }}
                          title="Submitted — ungraded"
                          aria-label="Open ungraded submission"
                        />
                      )}
                    </div>
                  </td>
                  {assignments.map((assignment) => {
                    const grade = getGradeForStudentAssignment(student.id, assignment.id)

                    return (
                      <td key={assignment.id} className="py-2 px-2 text-center">
                        <button
                          onClick={() =>
                            setEditGrade({
                              open: true,
                              student,
                              assignment,
                            })
                          }
                          className="px-2 py-0.5 rounded text-xs font-bold hover:bg-elevated transition-colors"
                          style={{
                            color: grade
                              ? grade.score >= 70
                                ? '#22c97a'
                                : '#f04a4a'
                              : '#6b7494',
                          }}
                        >
                          {grade ? `${grade.score}` : '—'}
                        </button>
                      </td>
                    )
                  })}
                  <td className="py-2 px-2 text-center">
                    <button
                      onClick={() => setShowNewAssignment(true)}
                      className="text-text-muted hover:text-accent text-sm transition-colors"
                    >
                      +
                    </button>
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

      <NewAssignmentModal
        open={showNewAssignment}
        onClose={() => setShowNewAssignment(false)}
        classId={currentClass?.id}
      />
      <NewClassModal open={showNewClass} onClose={() => setShowNewClass(false)} />
      <EditGradeModal
        open={editGrade.open}
        onClose={() =>
          setEditGrade({
            open: false,
            student: null,
            assignment: null,
          })
        }
        student={editGrade.student}
        assignment={editGrade.assignment}
      />
    </div>
  )
}
