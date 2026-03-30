// src/components/support/SupportStaffNotes.jsx
import React, { useState, useEffect } from 'react'
import { useStore } from '../../lib/store'
import SupportLogEditor from './SupportLogEditor'
import SupportLogCard from './SupportLogCard'

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

export default function SupportStaffNotes({ onBack, studentId = null }) {
  const {
    getSupportLogs,
    getSupportLogsForStudent,
    getStudentsForSupportStaff,
    currentUser
  } = useStore()

  const [logs, setLogs] = useState([])
  const [students, setStudents] = useState([])
  const [selectedStudentId, setSelectedStudentId] = useState(studentId)
  const [showEditor, setShowEditor] = useState(false)
  const [editingLog, setEditingLog] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const availableStudents = getStudentsForSupportStaff()
        setStudents(availableStudents)
        
        if (selectedStudentId) {
          const studentLogs = await getSupportLogsForStudent(selectedStudentId)
          setLogs(studentLogs || [])
        } else {
          const allLogs = await getSupportLogs()
          setLogs(allLogs || [])
        }
      } catch (error) {
        console.error('Failed to load logs:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selectedStudentId])

  async function handleCreateLog() {
    setEditingLog(null)
    setShowEditor(true)
  }

  async function handleEditLog(log) {
    setEditingLog(log)
    setShowEditor(true)
  }

  async function handleEditorClose() {
    setShowEditor(false)
    setEditingLog(null)
    // Reload logs
    if (selectedStudentId) {
      const studentLogs = await getSupportLogsForStudent(selectedStudentId)
      setLogs(studentLogs || [])
    } else {
      const allLogs = await getSupportLogs()
      setLogs(allLogs || [])
    }
  }

  if (loading) {
    return <div style={{ padding:40, textAlign:'center', color:C.muted }}>Loading support logs...</div>
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg }}>
      {/* Header */}
      <div style={{ background:C.card, borderBottom:`1px solid ${C.border}`, padding:'16px 20px', display:'flex', alignItems:'center', gap:16 }}>
        <button onClick={onBack} style={{ background:C.inner, border:'none', borderRadius:8, width:36, height:36, color:C.soft, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:18, fontWeight:700, color:C.text, marginBottom:2 }}>Support Logs</div>
          <div style={{ fontSize:12, color:C.muted }}>{selectedStudentId ? 'Student-specific logs' : 'All support logs'}</div>
        </div>
        <button onClick={handleCreateLog} style={{ background:C.teal, color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:12, fontWeight:600, cursor:'pointer' }}>+ Add Log</button>
      </div>

      {/* Student Filter */}
      {!studentId && (
        <div style={{ padding:20, paddingBottom:0 }}>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:16 }}>
            <div style={{ fontSize:12, fontWeight:600, color:C.muted, marginBottom:8 }}>Filter by Student</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <button
                onClick={() => setSelectedStudentId(null)}
                style={{
                  background: !selectedStudentId ? C.teal : C.inner,
                  border: `1px solid ${!selectedStudentId ? C.teal : C.border}`,
                  borderRadius:6, padding:'6px 12px', fontSize:11, fontWeight:600,
                  color: !selectedStudentId ? '#fff' : C.text, cursor:'pointer'
                }}
              >
                All Students
              </button>
              {students.slice(0, 5).map(student => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  style={{
                    background: selectedStudentId === student.id ? C.teal : C.inner,
                    border: `1px solid ${selectedStudentId === student.id ? C.teal : C.border}`,
                    borderRadius:6, padding:'6px 12px', fontSize:11, fontWeight:600,
                    color: selectedStudentId === student.id ? '#fff' : C.text, cursor:'pointer'
                  }}
                >
                  {student.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Logs List */}
      <div style={{ padding:20 }}>
        {logs.length === 0 ? (
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:60, textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:16, opacity:0.5 }}>📝</div>
            <div style={{ fontSize:16, fontWeight:600, color:C.text, marginBottom:8 }}>No Support Logs Yet</div>
            <div style={{ fontSize:12, color:C.muted, marginBottom:24 }}>Start documenting your support interactions.</div>
            <button onClick={handleCreateLog} style={{ background:C.teal, color:'#fff', border:'none', borderRadius:8, padding:'12px 24px', fontSize:13, fontWeight:600, cursor:'pointer' }}>Create Your First Log</button>
          </div>
        ) : (
          <div style={{ display:'grid', gap:12 }}>
            {logs.map(log => (
              <SupportLogCard
                key={log.id}
                log={log}
                onEdit={() => handleEditLog(log)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <SupportLogEditor
          log={editingLog}
          studentId={selectedStudentId}
          onClose={handleEditorClose}
        />
      )}
    </div>
  )
}
