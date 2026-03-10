import React, { useState } from 'react'
import { useStore } from '../lib/store'
import { GradeBadge, Tag, LoadingSpinner, Modal } from '../components/ui'

function SubmissionViewer({ open, onClose, student, assignment }) {
  if (!open) return null
  return (
    <Modal open={open} onClose={onClose} title={`${student?.name} — Submission`}>
      <div className="space-y-4">
        <div className="p-3 rounded-card" style={{ background: '#1e2231' }}>
          <p className="tag-label mb-1">Assignment</p>
          <p className="text-text-primary font-semibold">{assignment?.name || 'Assignment'}</p>
        </div>
        <div className="p-6 rounded-card flex flex-col items-center justify-center gap-3" style={{ background: '#161923', border: '1px dashed #2a2f42' }}>
          <span className="text-4xl">📎</span>
          <p className="font-semibold text-text-primary">Student Submission</p>
          <p className="text-text-muted text-sm text-center">Submitted via the student app · File preview available in the full version</p>
          <div className="flex gap-2 mt-2">
            <button onClick={() => alert('File download available in full version — submission stored in Supabase')} className="px-4 py-2 rounded-pill text-sm font-bold" style={{ background: '#3b7ef420', color: '#3b7ef4' }}>
              ⬇ Download
            </button>
            <button onClick={onClose} className="px-4 py-2 rounded-pill text-sm font-bold" style={{ background: '#22c97a20', color: '#22c97a' }}>
              ✏ Grade It
            </button>
          </div>
        </div>
        <p className="text-text-muted text-xs text-center">Submitted {new Date().toLocaleDateString()}</p>
      </div>
    </Modal>
  )
}
import { generateStudyTips } from '../lib/ai'

export default function StudentProfile() {
  const {
    activeStudent, activeClass, classes,
    getAssignmentsForClass, getGradeForStudentAssignment,
    goBack, updateGrade
  } = useStore()

  const [aiTips, setAiTips] = useState(null)
  const [loadingTips, setLoadingTips] = useState(false)
  const [editingGrade, setEditingGrade] = useState(null)
  const [viewSubmission, setViewSubmission] = useState({ open: false, assignment: null })
  const [newScore, setNewScore] = useState('')

  const student = activeStudent
  // Use activeClass if set, otherwise fall back to the class matching the student
  const cls = activeClass || classes.find(c => c.id === student?.classId) || classes[0]
  const assignments = getAssignmentsForClass(cls?.id)

  if (!student) return (
    <div className="text-center py-16">
      <p className="text-text-muted mb-4">No student selected</p>
      <button onClick={goBack} className="btn-primary px-6 py-2 rounded-pill" style={{ background: 'var(--school-color)', color: 'white' }}>
        ← Back
      </button>
    </div>
  )

  async function handleAITips() {
    setLoadingTips(true)
    const tips = await generateStudyTips({
      studentName: student.name,
      subject: cls?.subject || 'General',
      score: student.grade,
      recentGrades: assignments.map(a => {
        const g = getGradeForStudentAssignment(student.id, a.id)
        return { assignment: a.name, score: g?.score }
      })
    })
    setAiTips(tips)
    setLoadingTips(false)
  }

  function saveGrade() {
    if (editingGrade && newScore !== '') {
      updateGrade(student.id, editingGrade.id, Number(newScore))
      setEditingGrade(null)
      setNewScore('')
    }
  }

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
      <div className="p-5 rounded-widget mb-6" style={{ background: 'linear-gradient(135deg, #1a2a4a, #0f1a2e)' }}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-text-primary mb-1">{student.name}</h1>
            <p className="text-text-muted text-sm">{cls?.period} Period · {cls?.subject}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {student.submitUngraded && <Tag color="#f5a623">📬 Submitted — Awaiting Grade</Tag>}
              {student.flagged && <Tag color="#f04a4a">⚑ Flagged for Attention</Tag>}
            </div>
          </div>
          <div className="text-right">
            <div className="font-display font-bold text-4xl text-white">{student.grade}%</div>
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
        <button onClick={() => useStore.getState().setScreen('reports')} className="py-3 rounded-card text-sm font-bold" style={{ background: '#22c97a20', color: '#22c97a', border: '1px solid #22c97a30' }}>
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

      {/* AI Tips */}
      {loadingTips && <LoadingSpinner />}
      {aiTips && (
        <div className="p-4 rounded-card mb-6 animate-slide-up" style={{ background: '#1a1230', border: '1px solid #9b6ef530' }}>
          <p className="font-bold text-sm mb-2" style={{ color: '#9b6ef5' }}>✨ AI Study Tips for {student.name}</p>
          <p className="text-text-primary text-sm mb-3">{aiTips.tip}</p>
          <div className="space-y-1.5 mb-3">
            {aiTips.actions?.map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-text-muted">
                <span style={{ color: '#9b6ef5' }}>•</span>
                <span>{a}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-muted">⏱ Recommended: {aiTips.timeEstimate}</p>
        </div>
      )}

      {/* Assignments */}
      <div>
        <p className="tag-label mb-3">Assignments — {cls?.subject}</p>
        {assignments.length === 0 ? (
          <div className="p-6 rounded-card text-center" style={{ background: '#161923' }}>
            <p className="text-text-muted text-sm">No assignments yet for this class</p>
          </div>
        ) : (
          <div className="space-y-2">
            {assignments.map(a => {
              const g = getGradeForStudentAssignment(student.id, a.id)
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
                            type="number" min="0" max="100"
                            className="w-16 bg-elevated border border-border rounded-card px-2 py-1 text-text-primary text-sm text-center"
                            value={newScore}
                            onChange={e => setNewScore(e.target.value)}
                            autoFocus
                            onKeyDown={e => e.key === 'Enter' && saveGrade()}
                          />
                          <button onClick={saveGrade} className="px-2 py-1 rounded text-xs font-bold" style={{ background: '#22c97a20', color: '#22c97a' }}>Save</button>
                          <button onClick={() => setEditingGrade(null)} className="text-text-muted text-xs px-1">✕</button>
                        </div>
                      ) : (
                        <>
                          {g ? <GradeBadge score={g.score} /> : (
                            student.submitUngraded
                              ? <button onClick={() => setViewSubmission({ open: true, assignment: a })}
                                  className="px-2 py-1 rounded-pill text-xs font-bold hover:opacity-80 transition-opacity"
                                  style={{ background: '#f5a62320', color: '#f5a623', border: '1px solid #f5a62340' }}>
                                  📬 View Submission
                                </button>
                              : <span className="text-text-muted text-sm">—</span>
                          )}
                          <button
                            onClick={() => { setEditingGrade(a); setNewScore(g?.score ?? '') }}
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
      <SubmissionViewer
        open={viewSubmission.open}
        onClose={() => setViewSubmission({ open: false, assignment: null })}
        student={student}
        assignment={viewSubmission.assignment}
      />
    </div>
  )
}
