diff --git a/src/pages/Gradebook.jsx b/src/pages/Gradebook.jsx
index d5a0bc8dc2d5c0559cd14caeeb799100375f838c..9615ee3ce1ce8903cbc8d3c0e3283ec1e151860f 100644
--- a/src/pages/Gradebook.jsx
+++ b/src/pages/Gradebook.jsx
@@ -1,297 +1,288 @@
-import React, { useState } from 'react'
+import React, { useEffect, useState } from 'react'
 import { useStore } from '../lib/store'
 import { GradeBar, GradeBadge, Modal, Tag, AssignmentOptions } from '../components/ui'
 
-function NewAssignmentModal({ open, onClose, classId }) {
+function NewAssignmentModal({ open, onClose, classId, defaultType }) {
   const { addAssignment } = useStore()
   const [form, setForm] = useState({
-    name: '', type: 'quiz', date: new Date().toISOString().split('T')[0], dueDate: '', weight: 30
+    name: '', type: defaultType || 'quiz', date: new Date().toISOString().split('T')[0], dueDate: '', weight: 30
   })
   const [options, setOptions] = useState({ lockdown: false, timer: false, shuffle: false, schedule: false, monitor: false })
   const [applyAll, setApplyAll] = useState(false)
 
   const typeWeights = { test: 40, quiz: 30, homework: 20, participation: 10 }
 
+  useEffect(() => {
+    if (!open) return
+    const type = defaultType || 'quiz'
+    setForm(f => ({ ...f, type, weight: typeWeights[type] }))
+  }, [open, defaultType])
+
   function handleTypeChange(type) {
     setForm(f => ({ ...f, type, weight: typeWeights[type] }))
   }
 
   function handleSave() {
     addAssignment({ ...form, classId, options, applyAll })
     onClose()
-    setForm({ name: '', type: 'quiz', date: new Date().toISOString().split('T')[0], dueDate: '', weight: 30 })
+    setForm({ name: '', type: defaultType || 'quiz', date: new Date().toISOString().split('T')[0], dueDate: '', weight: 30 })
   }
 
   return (
     <Modal open={open} onClose={onClose} title="New Assignment">
       <div className="space-y-4">
         <div>
           <label className="tag-label block mb-1">Assignment Name</label>
-          <input
-            className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm"
-            placeholder="e.g. Chapter 4 Quiz"
-            value={form.name}
-            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
-          />
+          <input className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm" placeholder="e.g. Chapter 4 Quiz" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
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
-              <button
-                key={t.id}
-                onClick={() => handleTypeChange(t.id)}
-                className="py-2 rounded-card text-xs font-bold transition-all"
-                style={{
-                  background: form.type === t.id ? `${t.color}22` : '#1e2231',
-                  color: form.type === t.id ? t.color : '#6b7494',
-                  border: `1px solid ${form.type === t.id ? t.color + '50' : 'transparent'}`
-                }}
-              >
+              <button key={t.id} onClick={() => handleTypeChange(t.id)} className="py-2 rounded-card text-xs font-bold transition-all"
+                style={{ background: form.type === t.id ? `${t.color}22` : '#1e2231', color: form.type === t.id ? t.color : '#6b7494', border: `1px solid ${form.type === t.id ? t.color + '50' : 'transparent'}` }}>
                 <div>{t.label}</div>
                 <div style={{ fontSize: '9px', opacity: 0.7 }}>{t.weight}</div>
               </button>
             ))}
           </div>
         </div>
 
         <div className="grid grid-cols-2 gap-3">
           <div>
             <label className="tag-label block mb-1">Assign Date</label>
-            <input type="date" className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm"
-              value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
+            <input type="date" className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
           </div>
           <div>
             <label className="tag-label block mb-1">Due Date</label>
-            <input type="date" className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm"
-              value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
+            <input type="date" className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
           </div>
         </div>
 
         <div className="p-3 rounded-card" style={{ background: '#161923' }}>
           <AssignmentOptions options={options} onChange={setOptions} />
         </div>
 
         <div className="flex items-center gap-2 p-3 rounded-card" style={{ background: '#1e2231' }}>
-          <input type="checkbox" id="applyAll" checked={applyAll} onChange={e => setApplyAll(e.target.checked)}
-            className="rounded" />
-          <label htmlFor="applyAll" className="text-sm text-text-muted cursor-pointer">
-            Apply to all my classes
-          </label>
+          <input type="checkbox" id="applyAll" checked={applyAll} onChange={e => setApplyAll(e.target.checked)} className="rounded" />
+          <label htmlFor="applyAll" className="text-sm text-text-muted cursor-pointer">Apply to all my classes</label>
         </div>
 
         <div className="flex gap-2 pt-2">
-          <button onClick={onClose} className="flex-1 py-2.5 rounded-pill text-sm font-semibold" style={{ background: '#1e2231', color: '#6b7494' }}>
-            Cancel
-          </button>
-          <button
-            onClick={handleSave}
-            disabled={!form.name}
-            className="flex-1 py-2.5 rounded-pill text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40"
-            style={{ background: 'var(--school-color)', color: 'white' }}
-          >
+          <button onClick={onClose} className="flex-1 py-2.5 rounded-pill text-sm font-semibold" style={{ background: '#1e2231', color: '#6b7494' }}>Cancel</button>
+          <button onClick={handleSave} disabled={!form.name} className="flex-1 py-2.5 rounded-pill text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40" style={{ background: 'var(--school-color)', color: 'white' }}>
             Create Assignment
           </button>
         </div>
       </div>
     </Modal>
   )
 }
 
+function NewClassModal({ open, onClose }) {
+  const { addClass } = useStore()
+  const [subject, setSubject] = useState('')
+  const [period, setPeriod] = useState('')
+  const [students, setStudents] = useState('')
+
+  function createClass(method) {
+    const safeSubject = subject || `New Class (${method})`
+    const safePeriod = period || 'New'
+    addClass({ subject: safeSubject, period: safePeriod, students: Number(students) || 0, color: '#3b7ef4' })
+    onClose()
+    setSubject('')
+    setPeriod('')
+    setStudents('')
+  }
+
+  return (
+    <Modal open={open} onClose={onClose} title="Add New Class">
+      <div className="space-y-4">
+        <p className="text-text-muted text-sm">Create a class and choose how to add students.</p>
+        <div className="grid grid-cols-3 gap-2">
+          <button onClick={() => createClass('spreadsheet')} className="py-2 rounded-card text-xs font-bold" style={{ background: '#3b7ef420', color: '#3b7ef4' }}>📄 Upload Spreadsheet</button>
+          <button onClick={() => createClass('manual')} className="py-2 rounded-card text-xs font-bold" style={{ background: '#22c97a20', color: '#22c97a' }}>⌨️ Manual Entry</button>
+          <button onClick={() => createClass('camera')} className="py-2 rounded-card text-xs font-bold" style={{ background: '#f5a62320', color: '#f5a623' }}>📷 Take Picture</button>
+        </div>
+        <div className="grid grid-cols-2 gap-3">
+          <input className="bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm" placeholder="Subject (e.g. Science)" value={subject} onChange={e => setSubject(e.target.value)} />
+          <input className="bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm" placeholder="Period (e.g. 5th)" value={period} onChange={e => setPeriod(e.target.value)} />
+        </div>
+        <input type="number" min="0" className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm" placeholder="Student count (optional)" value={students} onChange={e => setStudents(e.target.value)} />
+      </div>
+    </Modal>
+  )
+}
+
 function EditGradeModal({ open, onClose, student, assignment }) {
   const { updateGrade, getGradeForStudentAssignment } = useStore()
   const existing = student && assignment ? getGradeForStudentAssignment(student.id, assignment.id) : null
   const [score, setScore] = useState(existing?.score || '')
 
+  useEffect(() => {
+    if (open) setScore(existing?.score || '')
+  }, [open, existing?.score])
+
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
-          <input
-            type="number" min="0" max="100"
-            className="w-full bg-elevated border border-border rounded-card px-3 py-3 text-text-primary text-2xl font-bold text-center"
-            value={score}
-            onChange={e => setScore(e.target.value)}
-            autoFocus
-          />
+          <input type="number" min="0" max="100" className="w-full bg-elevated border border-border rounded-card px-3 py-3 text-text-primary text-2xl font-bold text-center" value={score} onChange={e => setScore(e.target.value)} autoFocus />
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
-  const { classes, activeClass, setActiveClass, getStudentsForClass, getAssignmentsForClass, getGradeForStudentAssignment, setActiveStudent } = useStore()
+  const { classes, activeClass, setActiveClass, getStudentsForClass, getAssignmentsForClass, getGradeForStudentAssignment, setActiveStudent, quickCreateAssignment, clearQuickCreateAssignment } = useStore()
   const [showNewAssignment, setShowNewAssignment] = useState(false)
+  const [showNewClass, setShowNewClass] = useState(false)
+  const [pendingAssignmentType, setPendingAssignmentType] = useState(null)
   const [editGrade, setEditGrade] = useState({ open: false, student: null, assignment: null })
-  const [view, setView] = useState('list') // 'list' | 'columns'
-  const [sortBy, setSortBy] = useState(null) // assignment id to sort by
+  const [view, setView] = useState('list')
+  const [sortBy, setSortBy] = useState(null)
   const [sortDir, setSortDir] = useState('asc')
-  function toggleSort(assignmentId) {
-    if (sortBy === assignmentId) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
-    else { setSortBy(assignmentId); setSortDir('asc') }
-  }
 
   const currentClass = activeClass || classes[0]
   const students = getStudentsForClass(currentClass?.id)
   const assignments = getAssignmentsForClass(currentClass?.id)
 
+  useEffect(() => {
+    if (quickCreateAssignment !== null) {
+      setPendingAssignmentType(quickCreateAssignment)
+      setShowNewAssignment(true)
+      clearQuickCreateAssignment()
+    }
+  }, [quickCreateAssignment, clearQuickCreateAssignment])
+
+  function toggleSort(assignmentId) {
+    if (sortBy === assignmentId) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
+    else { setSortBy(assignmentId); setSortDir('asc') }
+  }
+
   return (
     <div>
-      <div className="flex items-center justify-between mb-6">
+      <div className="flex items-center justify-between mb-6 gap-2">
         <div>
           <h1 className="font-display font-bold text-2xl text-text-primary">Gradebook</h1>
           <p className="text-text-muted text-sm">Synced · PowerSchool ✓</p>
         </div>
-        <button
-          onClick={() => setShowNewAssignment(true)}
-          className="flex items-center gap-2 px-4 py-2 rounded-pill text-sm font-bold transition-all hover:opacity-90"
-          style={{ background: 'var(--school-color)', color: 'white' }}
-        >
-          + New Assignment
-        </button>
+        <div className="flex items-center gap-2">
+          <button onClick={() => setShowNewClass(true)} className="px-3 py-2 rounded-pill text-xs font-bold" style={{ background: '#1e2231', color: '#eef0f8' }}>+ New Class</button>
+          <button onClick={() => { setPendingAssignmentType(null); setShowNewAssignment(true) }} className="flex items-center gap-2 px-4 py-2 rounded-pill text-sm font-bold transition-all hover:opacity-90" style={{ background: 'var(--school-color)', color: 'white' }}>+ New Assignment</button>
+        </div>
       </div>
 
-      {/* Period tabs */}
       <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
         {classes.map(cls => (
-          <button
-            key={cls.id}
-            onClick={() => setActiveClass(cls)}
-            className="flex-shrink-0 px-4 py-2 rounded-pill text-sm font-semibold transition-all"
-            style={{
-              background: currentClass?.id === cls.id ? 'var(--school-color)' : '#1e2231',
-              color: currentClass?.id === cls.id ? 'white' : '#6b7494'
-            }}
-          >
+          <button key={cls.id} onClick={() => setActiveClass(cls)} className="flex-shrink-0 px-4 py-2 rounded-pill text-sm font-semibold transition-all"
+            style={{ background: currentClass?.id === cls.id ? 'var(--school-color)' : '#1e2231', color: currentClass?.id === cls.id ? 'white' : '#6b7494' }}>
             {cls.period} · {cls.subject}
           </button>
         ))}
       </div>
 
-      {/* View toggle */}
       <div className="flex gap-2 mb-4">
         {[{ id: 'list', label: '👤 Student List' }, { id: 'columns', label: '📊 Assignment Columns' }].map(v => (
-          <button
-            key={v.id}
-            onClick={() => setView(v.id)}
-            className="px-3 py-1.5 rounded-pill text-xs font-semibold transition-all"
-            style={{
-              background: view === v.id ? '#1e2231' : 'transparent',
-              color: view === v.id ? '#eef0f8' : '#6b7494',
-              border: `1px solid ${view === v.id ? '#2a2f42' : 'transparent'}`
-            }}
-          >
+          <button key={v.id} onClick={() => setView(v.id)} className="px-3 py-1.5 rounded-pill text-xs font-semibold transition-all"
+            style={{ background: view === v.id ? '#1e2231' : 'transparent', color: view === v.id ? '#eef0f8' : '#6b7494', border: `1px solid ${view === v.id ? '#2a2f42' : 'transparent'}` }}>
             {v.label}
           </button>
         ))}
       </div>
 
       {view === 'list' ? (
-        /* Student list view */
         <div className="space-y-2">
           {students.map(student => (
             <div key={student.id} className="p-4 rounded-card flex items-center gap-4" style={{ background: '#161923' }}>
               <div className="flex-1">
                 <div className="flex items-center gap-2 mb-1">
                   <p className="font-semibold text-text-primary">{student.name}</p>
                   {student.submitUngraded && (
-                    <Tag color="#f5a623">Submitted — Ungraded</Tag>
+                    <button onClick={() => setActiveStudent(student)} className="px-2 py-0.5 rounded-pill text-xs font-bold" style={{ background: '#f5a62320', color: '#f5a623' }}>
+                      📬 Submitted — Ungraded
+                    </button>
                   )}
                   {student.flagged && <span className="text-danger text-xs">⚑</span>}
                 </div>
                 <GradeBar value={student.grade} />
               </div>
               <GradeBadge score={student.grade} />
-              <button
-                onClick={() => setActiveStudent(student)}
-                className="text-accent text-lg hover:scale-110 transition-transform"
-              >
-                ›
-              </button>
+              <button onClick={() => setActiveStudent(student)} className="text-accent text-lg hover:scale-110 transition-transform">›</button>
             </div>
           ))}
         </div>
       ) : (
-        /* Assignment columns view */
         <div className="overflow-x-auto">
           <table className="w-full">
             <thead>
               <tr>
                 <th className="text-left py-2 px-3 text-text-muted font-semibold" style={{ fontSize: '11px', minWidth: '140px' }}>Student</th>
                 {assignments.map(a => (
-                  <th key={a.id} onClick={() => toggleSort(a.id)}
-                    className="py-2 px-2 text-center font-semibold cursor-pointer transition-colors"
-                    style={{ fontSize: '10px', minWidth: '80px', color: sortBy === a.id ? 'var(--school-color)' : '#6b7494' }}>
+                  <th key={a.id} onClick={() => toggleSort(a.id)} className="py-2 px-2 text-center font-semibold cursor-pointer transition-colors" style={{ fontSize: '10px', minWidth: '80px', color: sortBy === a.id ? 'var(--school-color)' : '#6b7494' }}>
                     {a.name} {sortBy === a.id ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                     <div style={{ fontSize: '8px', color: '#6b7494', fontWeight: 400 }}>{a.type}</div>
                   </th>
                 ))}
                 <th className="py-2 px-2 text-center" style={{ fontSize: '11px', color: 'var(--school-color)', minWidth: '70px' }}>
-                  <button onClick={() => setShowNewAssignment(true)} className="font-bold">+ Add</button>
+                  <button onClick={() => { setPendingAssignmentType(null); setShowNewAssignment(true) }} className="font-bold">+ Add</button>
                 </th>
                 <th className="py-2 px-2 text-center text-accent font-bold" style={{ fontSize: '11px', minWidth: '60px' }}>Avg</th>
               </tr>
             </thead>
             <tbody>
               {students.map((student, i) => (
                 <tr key={student.id} style={{ background: i % 2 === 0 ? '#161923' : '#131720' }}>
                   <td className="py-2 px-3">
                     <div className="flex items-center gap-2">
-                      <button onClick={() => setActiveStudent(student)} className="text-text-primary font-medium text-sm hover:text-accent transition-colors">
-                        {student.name}
-                      </button>
-                      {student.submitUngraded && <div className="w-2 h-2 rounded-full bg-warning" title="Submitted — ungraded" />}
+                      <button onClick={() => setActiveStudent(student)} className="text-text-primary font-medium text-sm hover:text-accent transition-colors">{student.name}</button>
+                      {student.submitUngraded && (
+                        <button onClick={() => setActiveStudent(student)} className="w-2.5 h-2.5 rounded-full bg-warning hover:scale-125 transition-transform" title="Submitted — ungraded (click to grade)" />
+                      )}
                     </div>
                   </td>
                   {assignments.map(a => {
                     const g = getGradeForStudentAssignment(student.id, a.id)
                     return (
                       <td key={a.id} className="py-2 px-2 text-center">
-                        <button
-                          onClick={() => setEditGrade({ open: true, student, assignment: a })}
-                          className="px-2 py-0.5 rounded text-xs font-bold hover:bg-elevated transition-colors"
-                          style={{ color: g ? (g.score >= 70 ? '#22c97a' : '#f04a4a') : '#6b7494' }}
-                        >
-                          {g ? `${g.score}` : '—'}
+                        <button onClick={() => setEditGrade({ open: true, student, assignment: a })} className="px-2 py-0.5 rounded text-xs font-bold hover:bg-elevated transition-colors" style={{ color: g ? (g.score >= 70 ? '#22c97a' : '#f04a4a') : '#6b7494' }}>
+                          {g ? `${g.score}` : student.submitUngraded ? '📬' : '—'}
                         </button>
                       </td>
                     )
                   })}
-                  <td className="py-2 px-2 text-center">
-                    <button onClick={() => setShowNewAssignment(true)} className="text-text-muted hover:text-accent text-sm transition-colors">+</button>
-                  </td>
-                  <td className="py-2 px-2 text-center">
-                    <GradeBadge score={student.grade} />
-                  </td>
+                  <td className="py-2 px-2 text-center"><button onClick={() => { setPendingAssignmentType(null); setShowNewAssignment(true) }} className="text-text-muted hover:text-accent text-sm transition-colors">+</button></td>
+                  <td className="py-2 px-2 text-center"><GradeBadge score={student.grade} /></td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       )}
 
-      <NewAssignmentModal open={showNewAssignment} onClose={() => setShowNewAssignment(false)} classId={currentClass?.id} />
+      <NewClassModal open={showNewClass} onClose={() => setShowNewClass(false)} />
+      <NewAssignmentModal open={showNewAssignment} onClose={() => { setShowNewAssignment(false); setPendingAssignmentType(null) }} classId={currentClass?.id} defaultType={pendingAssignmentType} />
       <EditGradeModal open={editGrade.open} onClose={() => setEditGrade({ open: false, student: null, assignment: null })} student={editGrade.student} assignment={editGrade.assignment} />
     </div>
   )
 }
