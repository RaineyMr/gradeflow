import React, { useState, useEffect } from 'react'
import { useStore } from '../lib/store'
import { supabase } from '../lib/supabase'
import { generateStudyTips } from '../lib/ai'
import { GradeBadge, Tag, LoadingSpinner, Modal, EmptyState } from '../components/ui'

// ─── Submission Viewer Modal ──────────────────────────────────────────────────
function SubmissionViewer({ open, onClose, student, assignment }) {
  if (!open) return null
  return (
    <Modal open={open} onClose={onClose} title={`${student?.name} — Submission`}>
      <div className="space-y-4">
        <div className="p-3 rounded-card" style={{ background: '#1e2231' }}>
          <p className="tag-label mb-1">Assignment</p>
          <p className="text-text-primary font-semibold">{assignment?.name || 'Assignment'}</p>
        </div>
        <div
          className="p-6 rounded-card flex flex-col items-center justify-center gap-3"
          style={{ background: '#161923', border: '1px dashed #2a2f42' }}
        >
          <span className="text-4xl">📎</span>
          <p className="font-semibold text-text-primary">Student Submission</p>
          <p className="text-text-muted text-sm text-center">
            Submitted via the student app · File preview available in the full version
          </p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => alert('File download available in full version — submission stored in Supabase')}
              className="px-4 py-2 rounded-pill text-sm font-bold"
              style={{ background: '#3b7ef420', color: '#3b7ef4' }}
            >
              ⬇ Download
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-pill text-sm font-bold"
              style={{ background: '#22c97a20', color: '#22c97a' }}
            >
              ✏ Grade It
            </button>
          </div>
        </div>
        <p className="text-text-muted text-xs text-center">
          Submitted {new Date().toLocaleDateString()}
        </p>
      </div>
    </Modal>
  )
}

// ─── Student Profile ──────────────────────────────────────────────────────────
export default function StudentProfile() {
  const {
    activeStudent,
    activeClass,
    classes,
    getAssignmentsForClass,
    getGradeForStudentAssignment,
    goBack,
    updateGrade,
  } = useStore()

  const [aiTips, setAiTips]           = useState(null)
  const [loadingTips, setLoadingTips] = useState(false)
  const [tipsError, setTipsError]     = useState(null)
  const [editingGrade, setEditingGrade] = useState(null)
  const [newScore, setNewScore]         = useState('')
  const [viewSubmission, setViewSubmission] = useState({ open: false, assignment: null })

  // Support Notes
  const [notes, setNotes] = useState([])
  const [loadingNotes, setLoadingNotes] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newNote, setNewNote] = useState({
    note_type: 'academic',
    content: '',
    visibility: 'staff-only'
  })

  const student     = activeStudent
  const cls         = activeClass || classes.find(c => c.id === student?.classId) || classes[0]
  const assignments = getAssignmentsForClass(cls?.id)

  const isSupportStaff = useStore(state => state.currentUser?.role === 'supportStaff')

  // ── No student selected guard ─────────────────────────────────────────────
  if (!student) {
    return (
      <div className="text-center py-16">
        <p className="text-text-muted mb-4">No student selected</p>
        <button
          onClick={goBack}
          className="btn-primary px-6 py-2 rounded-pill"
          style={{ background: 'var(--school-color)', color: 'white' }}
        >
          ← Back
        </button>
      </div>
    )
  }

  // Fetch support notes
  useEffect(() => {
    if (!isSupportStaff || !student?.id) return

    async function fetchNotes() {
      setLoadingNotes(true)
      try {
        const { data, error } = await supabase
          .from('support_staff_notes')
          .select(`
            *,
            staff:teachers(name)
          `)
          .eq('student_id', student.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setNotes(data || [])
      } catch (err) {
        console.error('Failed to fetch notes:', err)
      } finally {
        setLoadingNotes(false)
      }
    }

    fetchNotes()
  }, [student?.id, isSupportStaff])

  // Add note
  async function addNote() {
    if (!newNote.content.trim()) return

    try {
      const { data, error } = await supabase
        .from('support_staff_notes')
        .insert({
          student_id: student.id,
          staff_id: useStore.getState().currentUser.id,
          ...newNote,
        })
        .select(`
          *,
          staff:teachers(name)
        `)
        .single()

      if (error) throw error
      setNotes([data, ...notes])
      setNewNote({ note_type: 'academic', content: '', visibility: 'staff-only' })
      setShowAddModal(false)
    } catch (err) {
      console.error('Failed to add note:', err)
    }
  }

  // ── AI study tips handler ─────────────────────────────────────────────────
  async function handleAITips() {
    setLoadingTips(true)
    setTipsError(null)
    setAiTips(null)
    try {
      const tips = await generateStudyTips({
        studentName:  student.name,
        subject:      cls?.subject || 'General',
        score:        student.grade,
        recentGrades: assignments.map(a => {
          const g = getGradeForStudentAssignment(student.id, a.id)
          return { assignment: a.name, score: g?.score }
        }),
      })
      setAiTips(tips)
    } catch (err) {
      setTipsError('Could not load AI tips. Please try again.')
    } finally {
      setLoadingTips(false)
    }
  }

  // ── Grade editing ─────────────────────────────────────────────────────────
  function saveGrade() {
    if (editingGrade && newScore !== '') {
      updateGrade(student.id, editingGrade.id, Number(newScore))
      setEditingGrade(null)
      setNewScore('')
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Back button */}
      <button
        onClick={goBack}
        className="flex items-center gap-2 text-text-muted text-sm mb-6 hover:text-text-primary transition-colors"
      >
        ← Back to Gradebook
      </button>

      {/* Student header */}
      <div
        className="p-5 rounded-widget mb-6"
        style={{ background: 'linear-gradient(135deg, #1a2a4a, #0f1a2e)' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-text-primary mb-1">
              {student.name}
            </h1>
            <p className="text-text-muted text-sm">
              {cls?.period} Period · {cls?.subject}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {student.submitUngraded && (
                <Tag color="#f5a623">📬 Submitted — Awaiting Grade</Tag>
              )}
              {student.flagged && (
                <Tag color="#f04a4a">⚑ Flagged for Attention</Tag>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="font-display font-bold text-4xl text-white">
              {student.grade}%
            </div>
            <div className="text-text-muted text-sm">{student.letter} grade</div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <button
          onClick={handleAITips}
          disabled={loadingTips}
          className="py-3 rounded-card text-sm font-bold transition-all hover:opacity-90"
          style={{ background: '#9b6ef520', color: '#9b6ef5', border: '1px solid #9b6ef530' }}
        >
          {loadingTips ? '...' : '✨ AI Insights'}
        </button>
        <button
          onClick={() => useStore.getState().setScreen('reports')}
          className="py-3 rounded-card text-sm font-bold"
          style={{ background: '#22c97a20', color: '#22c97a', border: '1px solid #22c97a30' }}
        >
          📊 Report
        </button>
        <button
          onClick={() => useStore.getState().setScreen('parentMessages')}
          className="py-3 rounded-card text-sm font-bold"
          style={{ background: '#f04a4a20', color: '#f04a4a', border: '1px solid #f04a4a30' }}
        >
          📩 Message Parent
        </button>
      </div>

      {/* AI Tips loading */}
      {loadingTips && <LoadingSpinner />}

      {/* AI Tips error */}
      {tipsError && (
        <div
          className="p-4 rounded-card mb-6 text-sm text-center"
          style={{ background: '#f04a4a15', color: '#f04a4a', border: '1px solid #f04a4a30' }}
        >
          {tipsError}
        </div>
      )}

      {/* AI Tips result */}
      {aiTips && (
        <div
          className="p-4 rounded-card mb-6 animate-slide-up"
          style={{ background: '#1a1230', border: '1px solid #9b6ef530' }}
        >
          <p className="font-bold text-sm mb-2" style={{ color: '#9b6ef5' }}>
            ✨ AI Study Tips for {student.name}
          </p>
          <p className="text-text-primary text-sm mb-3">{aiTips.tip}</p>
          <div className="space-y-1.5 mb-3">
            {aiTips.actions?.map((action, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-text-muted">
                <span style={{ color: '#9b6ef5' }}>•</span>
                <span>{action}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-muted">⏱ Recommended: {aiTips.timeEstimate}</p>
        </div>
      )}

      {/* Assignments list */}
      <div>
        <p className="tag-label mb-3">Assignments — {cls?.subject}</p>
        {assignments.length === 0 ? (
          <div className="p-6 rounded-card text-center" style={{ background: '#161923' }}>
            <p className="text-text-muted text-sm">No assignments yet for this class</p>
          </div>
        ) : (
          <div className="space-y-2">
            {assignments.map(a => {
              const g        = getGradeForStudentAssignment(student.id, a.id)
              const isEditing = editingGrade?.id === a.id
              return (
                <div key={a.id} className="p-3 rounded-card" style={{ background: '#161923' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-text-primary">{a.name}</p>
                      <p className="text-text-muted" style={{ fontSize: '10px' }}>
                        {a.type} · {a.date} · {a.weight}% weight
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="w-16 bg-elevated border border-border rounded-card px-2 py-1 text-text-primary text-sm text-center"
                            value={newScore}
                            onChange={e => setNewScore(e.target.value)}
                            autoFocus
                            onKeyDown={e => e.key === 'Enter' && saveGrade()}
                          />
                          <button
                            onClick={saveGrade}
                            className="px-2 py-1 rounded text-xs font-bold"
                            style={{ background: '#22c97a20', color: '#22c97a' }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingGrade(null)}
                            className="text-text-muted text-xs px-1"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <>
                          {g ? (
                            <GradeBadge score={g.score} />
                          ) : student.submitUngraded ? (
                            <button
                              onClick={() => setViewSubmission({ open: true, assignment: a })}
                              className="px-2 py-1 rounded-pill text-xs font-bold hover:opacity-80 transition-opacity"
                              style={{
                                background: '#f5a62320',
                                color: '#f5a623',
                                border: '1px solid #f5a62340',
                              }}
                            >
                              📬 View Submission
                            </button>
                          ) : (
                            <span className="text-text-muted text-sm">—</span>
                          )}
                          <button
                            onClick={() => {
                              setEditingGrade(a)
                              setNewScore(g?.score ?? '')
                            }}
                            className="px-2 py-1 rounded text-xs font-semibold"
                            style={{ background: '#3b7ef420', color: '#3b7ef4' }}
                          >
                            ✏ Edit
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Support Notes Section */}
      {isSupportStaff && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <p className="tag-label">Support Notes</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-1.5 rounded-pill text-sm font-bold"
              style={{ background: '#3b7ef420', color: '#3b7ef4', border: '1px solid #3b7ef430' }}
            >
              + Add Note
            </button>
          </div>
          
          {loadingNotes ? (
            <LoadingSpinner />
          ) : notes.length === 0 ? (
            <EmptyState icon="📝" message="No support notes yet. Add the first one!" />
          ) : (
            <div className="space-y-3">
              {notes.map(note => (
                <div key={note.id} className="p-4 rounded-card" style={{ background: '#161923' }}>
                  <div className="flex items-start justify-between mb-2">
                    <Tag color="#9b6ef5">{note.note_type}</Tag>
                    <p className="text-xs text-text-muted">
                      {new Date(note.created_at).toLocaleDateString()} · {note.staff?.name || 'Unknown'}
                    </p>
                  </div>
                  <p className="text-text-primary text-sm mb-2 whitespace-pre-wrap">{note.content}</p>
                  <p className="text-xs text-text-muted capitalize">{note.visibility.replace('-', ' ')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Note Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Support Note">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">Note Type</label>
            <select
              value={newNote.note_type}
              onChange={e => setNewNote({ ...newNote, note_type: e.target.value })}
              className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-sm text-text-primary"
            >
              <option value="academic">Academic</option>
              <option value="behavior">Behavior</option>
              <option value="wellness">Wellness</option>
              <option value="intervention">Intervention</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">Content</label>
            <textarea
              value={newNote.content}
              onChange={e => setNewNote({ ...newNote, content: e.target.value })}
              placeholder="Enter note details..."
              rows={4}
              className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-sm text-text-primary resize-vertical"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">Visibility</label>
            <select
              value={newNote.visibility}
              onChange={e => setNewNote({ ...newNote, visibility: e.target.value })}
              className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-sm text-text-primary"
            >
              <option value="staff-only">Staff Only</option>
              <option value="teachers">Teachers</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={addNote}
              disabled={!newNote.content.trim()}
              className="flex-1 py-2 rounded-pill font-bold text-sm"
              style={{ background: newNote.content.trim() ? '#22c97a' : '#6b749430', color: 'white' }}
            >
              Save Note
            </button>
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-pill text-sm font-bold text-text-muted hover:text-text-primary"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Submission viewer modal */}
      <SubmissionViewer
        open={viewSubmission.open}
        onClose={() => setViewSubmission({ open: false, assignment: null })}
        student={student}
        assignment={viewSubmission.assignment}
      />
    </div>
  )
}
