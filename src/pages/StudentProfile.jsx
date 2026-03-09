import React, { useState } from 'react'
import { useStore } from '../lib/store'
import { GradeBadge, Tag, Modal, LoadingSpinner } from '../components/ui'
import { generateStudyTips } from '../lib/ai'

export default function StudentProfile() {
  const { activeStudent, getAssignmentsForClass, getGradeForStudentAssignment, activeClass, classes, setScreen, updateGrade } = useStore()
  const [aiTips, setAiTips] = useState(null)
  const [loadingTips, setLoadingTips] = useState(false)
  const [editingGrade, setEditingGrade] = useState(null)
  const [newScore, setNewScore] = useState('')

  const student = activeStudent
  const cls = activeClass || classes[0]
  const assignments = getAssignmentsForClass(cls?.id)

  if (!student) return (
    <div className="text-center py-16">
      <p className="text-text-muted">No student selected</p>
      <button onClick={() => setScreen('gradebook')} className="mt-4 btn-primary">Back to Gradebook</button>
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
      <button onClick={() => setScreen('gradebook')} className="flex items-center gap-2 text-text-muted text-sm mb-6 hover:text-text-primary transition-colors">
        ← Back to Gradebook
      </button>

      {/* Student header */}
      <div className="p-5 rounded-widget mb-6" style={{ background: 'linear-gradient(135deg, #1a2a4a, #0f1a2e)' }}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-text-primary mb-1">{student.name}</h1>
            <p className="text-text-muted text-sm">{cls?.period} Period · {cls?.subject}</p>
            {student.submitUngraded && <Tag color="#f5a623" className="mt-2">📬 Submitted — Awaiting Grade</Tag>}
            {student.flagged && <div className="mt-2"><Tag color="#f04a4a">⚑ Flagged for Attention</Tag></div>}
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
        <button className="py-3 rounded-card text-sm font-bold" style={{ background: '#22c97a20', color: '#22c97a', border: '1px solid #22c97a30' }}>
          📊 Report
        </button>
        <button onClick={() => setScreen('parentMessages')} className="py-3 rounded-card text-sm font-bold" style={{ background: '#f04a4a20', color: '#f04a4a', border: '1px solid #f04a4a30' }}>
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
                <span className="text-purple-400 mt-0.5">•</span>
                <span>{a}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-muted">⏱ Recommended: {aiTips.timeEstimate}</p>
        </div>
      )}

      {/* Assignment list */}
      <div>
        <p className="tag-label mb-3">Assignments</p>
        <div className="space-y-2">
          {assignments.map(a => {
            const g = getGradeForStudentAssignment(student.id, a.id)
            const isEditing = editingGrade?.id === a.id
            return (
              <div key={a.id} className="p-3 rounded-card" style={{ background: '#161923' }}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-text-primary">{a.name}</p>
                    <p className="text-text-muted" style={{ fontSize: '10px' }}>{a.type} · {a.date} · {a.weight}%</p>
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
                        />
                        <button onClick={saveGrade} className="px-2 py-1 rounded text-xs font-bold" style={{ background: '#22c97a20', color: '#22c97a' }}>Save</button>
                        <button onClick={() => setEditingGrade(null)} className="text-text-muted text-xs">✕</button>
                      </div>
                    ) : (
                      <>
                        {g ? <GradeBadge score={g.score} /> : <span className="text-text-muted text-sm">—</span>}
                        <button
                          onClick={() => { setEditingGrade(a); setNewScore(g?.score || '') }}
                          className="px-2 py-1 rounded text-xs font-semibold"
                          style={{ background: '#3b7ef420', color: '#3b7ef4' }}
                        >
                          ✏ Edit
                        </button>
                        {student.submitUngraded && !g && (
                          <Tag color="#f5a623">📬 Submitted</Tag>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
