import React, { useState } from 'react'
import { useStore } from '../lib/store'
import { GradeBar } from '../components/ui'

const C = { bg:'#060810',card:'#161923',inner:'#1e2231',text:'#eef0f8',muted:'#6b7494',border:'#2a2f42',green:'#22c97a',blue:'#3b7ef4',red:'#f04a4a',amber:'#f5a623',purple:'#9b6ef5',teal:'#0fb8a0' }

const REPORT_TYPES = [
  { id:'mastery',      icon:'📊', label:'Class Mastery',    color:C.blue   },
  { id:'student',      icon:'👤', label:'Student Report',   color:C.purple },
  { id:'distribution', icon:'📉', label:'Grade Dist.',      color:C.teal   },
  { id:'attention',    icon:'⚑',  label:'Needs Attention',  color:C.red    },
  { id:'commlog',      icon:'💬', label:'Comm. Log',        color:C.amber  },
  { id:'progress',     icon:'📈', label:'Progress',         color:C.green  },
]

export default function Reports() {
  const { classes, students, assignments, grades, messages, getNeedsAttention } = useStore()
  const [reportType,   setReportType]   = useState('mastery')
  const [classFilter,  setClassFilter]  = useState('all')
  const [dateFilter,   setDateFilter]   = useState('month')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [printed, setPrinted] = useState(false)

  const filteredClasses = classFilter === 'all' ? classes : classes.filter(c => String(c.id) === classFilter)

  function handlePrint() {
    setPrinted(true)
    setTimeout(() => { window.print(); setPrinted(false) }, 200)
  }

  function handleExportCSV() {
    const rows = [['Student','Grade','Letter','Class']]
    students.forEach(s => {
      const cls = classes.find(c => c.id === s.classId)
      const letter = s.grade>=90?'A':s.grade>=80?'B':s.grade>=70?'C':s.grade>=60?'D':'F'
      rows.push([s.name, s.grade, letter, cls?.subject || ''])
    })
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type:'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'gradeflow-report.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const report = REPORT_TYPES.find(r => r.id === reportType)
  const atRisk = getNeedsAttention()

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', paddingBottom:80 }}>
      <div style={{ padding:'20px 16px 0', marginBottom:16 }}>
        <h1 style={{ fontSize:22, fontWeight:800, margin:'0 0 4px' }}>Reports 📊</h1>
        <p style={{ fontSize:12, color:C.muted, margin:0 }}>Filter by class · subject · date range</p>
      </div>

      {/* Filters */}
      <div style={{ padding:'0 16px', display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        <select onChange={e => setClassFilter(e.target.value)} value={classFilter}
          style={{ background:C.inner, border:`1px solid ${C.border}`, borderRadius:10, padding:'8px 12px', color:C.text, fontSize:12, cursor:'pointer' }}>
          <option value="all">All Classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.period} · {c.subject}</option>)}
        </select>
        <select onChange={e => setDateFilter(e.target.value)} value={dateFilter}
          style={{ background:C.inner, border:`1px solid ${C.border}`, borderRadius:10, padding:'8px 12px', color:C.text, fontSize:12, cursor:'pointer' }}>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Report type grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, padding:'0 16px', marginBottom:20 }}>
        {REPORT_TYPES.map(r => (
          <button key={r.id} onClick={() => setReportType(r.id)}
            style={{ background: reportType===r.id ? `${r.color}22` : C.card, border:`1.5px solid ${reportType===r.id ? r.color : C.border}`, borderRadius:16, padding:'14px 10px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:22 }}>{r.icon}</span>
            <span style={{ fontSize:11, fontWeight:700, color: reportType===r.id ? r.color : C.text, textAlign:'center' }}>{r.label}</span>
          </button>
        ))}
      </div>

      {/* Report content */}
      <div style={{ margin:'0 16px', background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:20, marginBottom:16 }}>
        <h2 style={{ fontSize:16, fontWeight:700, color:C.text, margin:'0 0 16px', display:'flex', alignItems:'center', gap:8 }}>
          <span>{report.icon}</span>{report.label}
          {dateFilter && <span style={{ fontSize:11, color:C.muted, fontWeight:400 }}>· {dateFilter}</span>}
        </h2>

        {reportType === 'mastery' && (
          <div>
            {filteredClasses.map(cls => (
              <div key={cls.id} style={{ marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={{ fontWeight:700, fontSize:13, color:C.text }}>{cls.period} · {cls.subject}</span>
                  <span style={{ fontSize:13, fontWeight:800, color: cls.gpa>=80?C.green:cls.gpa>=70?C.amber:C.red }}>{cls.gpa}%</span>
                </div>
                <GradeBar score={cls.gpa} />
                <div style={{ display:'flex', gap:12, marginTop:8 }}>
                  {[['A 90+',students.filter(s=>s.classId===cls.id&&s.grade>=90).length,C.green],['B 80+',students.filter(s=>s.classId===cls.id&&s.grade>=80&&s.grade<90).length,C.blue],['C 70+',students.filter(s=>s.classId===cls.id&&s.grade>=70&&s.grade<80).length,C.amber],['F <70',students.filter(s=>s.classId===cls.id&&s.grade<70).length,C.red]].map(([label,count,color]) => (
                    <div key={label} style={{ background:`${color}18`, borderRadius:8, padding:'6px 10px', textAlign:'center' }}>
                      <div style={{ fontSize:16, fontWeight:800, color }}>{count}</div>
                      <div style={{ fontSize:9, color }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {reportType === 'student' && (
          <div>
            {students.slice(0, classFilter==='all' ? 10 : undefined).filter(s => classFilter==='all' || String(s.classId)===classFilter).map(s => {
              const cls = classes.find(c => c.id === s.classId)
              const letter = s.grade>=90?'A':s.grade>=80?'B':s.grade>=70?'C':s.grade>=60?'D':'F'
              const color  = s.grade>=90?C.green:s.grade>=80?C.blue:s.grade>=70?C.amber:C.red
              return (
                <div key={s.id} style={{ background:C.inner, borderRadius:12, padding:'12px 14px', marginBottom:8, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13, color:C.text }}>{s.name}</div>
                    <div style={{ fontSize:11, color:C.muted }}>{cls?.subject || ''} · {cls?.period || ''}</div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', background:`${color}18`, borderRadius:10, padding:'6px 12px' }}>
                    <span style={{ fontSize:16, fontWeight:800, color }}>{s.grade}%</span>
                    <span style={{ fontSize:11, fontWeight:700, color }}>{letter}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {reportType === 'distribution' && (
          <div>
            {filteredClasses.map(cls => {
              const clsStudents = students.filter(s => s.classId === cls.id)
              const buckets = [
                { label:'A (90-100)', min:90, max:100, color:C.green },
                { label:'B (80-89)',  min:80, max:89,  color:C.blue  },
                { label:'C (70-79)',  min:70, max:79,  color:C.amber },
                { label:'D (60-69)',  min:60, max:69,  color:C.amber },
                { label:'F (<60)',    min:0,  max:59,  color:C.red   },
              ]
              return (
                <div key={cls.id} style={{ marginBottom:20 }}>
                  <div style={{ fontWeight:700, fontSize:13, color:C.text, marginBottom:12 }}>{cls.period} · {cls.subject}</div>
                  {buckets.map(b => {
                    const count = clsStudents.filter(s => s.grade >= b.min && s.grade <= b.max).length
                    const pct   = clsStudents.length ? (count / clsStudents.length) * 100 : 0
                    return (
                      <div key={b.label} style={{ marginBottom:8 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                          <span style={{ fontSize:11, color:C.muted }}>{b.label}</span>
                          <span style={{ fontSize:11, fontWeight:700, color:b.color }}>{count} students</span>
                        </div>
                        <div style={{ background:'#2a2f42', borderRadius:999, height:8, overflow:'hidden' }}>
                          <div style={{ background:b.color, height:'100%', width:`${pct}%`, borderRadius:999, transition:'width 0.4s' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )}

        {reportType === 'attention' && (
          <div>
            {atRisk.length === 0 ? (
              <div style={{ textAlign:'center', padding:24 }}>
                <div style={{ fontSize:40, marginBottom:8 }}>✅</div>
                <p style={{ color:C.muted }}>All students on track!</p>
              </div>
            ) : atRisk.map(s => {
              const cls = classes.find(c => c.id === s.classId)
              return (
                <div key={s.id} style={{ background:'#1c1012', border:'1px solid rgba(240,74,74,0.2)', borderRadius:12, padding:'12px 14px', marginBottom:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:13, color:C.text }}>{s.name}</div>
                      <div style={{ fontSize:11, color:C.red, marginTop:2 }}>
                        {s.grade < 70 ? `${s.grade}% — failing` : s.flagged ? 'Flagged' : 'Needs review'}
                      </div>
                    </div>
                    <div style={{ fontSize:11, color:C.muted }}>{cls?.subject}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {reportType === 'commlog' && (
          <div>
            {messages.filter(m => m.status !== 'dismissed').map(m => (
              <div key={m.id} style={{ background:C.inner, borderRadius:12, padding:'12px 14px', marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                  <span style={{ fontWeight:700, fontSize:13, color:C.text }}>{m.studentName}</span>
                  <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:999,
                    background: m.status==='sent' ? 'rgba(34,201,122,0.15)' : 'rgba(245,166,35,0.15)',
                    color:      m.status==='sent' ? C.green : C.amber }}>
                    {m.status==='sent' ? 'Sent ✓' : 'Pending'}
                  </span>
                </div>
                <div style={{ fontSize:12, color:C.muted }}>{m.subject} · {m.trigger}</div>
                <div style={{ fontSize:11, color:'#8090a8', marginTop:4, lineHeight:1.5, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{m.draft}</div>
              </div>
            ))}
          </div>
        )}

        {reportType === 'progress' && (
          <div>
            {filteredClasses.map(cls => {
              const trend = cls.trend === 'up' ? '+2.4pts' : cls.trend === 'down' ? '-3.8pts' : 'stable'
              const clsStudents = students.filter(s => s.classId === cls.id)
              const avg = clsStudents.length ? Math.round(clsStudents.reduce((a,s) => a+s.grade, 0) / clsStudents.length) : 0
              return (
                <div key={cls.id} style={{ background:C.inner, borderRadius:14, padding:'14px 16px', marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                    <span style={{ fontWeight:700, fontSize:13, color:C.text }}>{cls.period} · {cls.subject}</span>
                    <span style={{ fontSize:12, color:cls.trend==='up'?C.green:cls.trend==='down'?C.red:C.muted, fontWeight:700 }}>{trend} this month</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <span style={{ fontSize:11, color:C.muted }}>Class average</span>
                    <span style={{ fontSize:13, fontWeight:800, color:avg>=80?C.green:avg>=70?C.amber:C.red }}>{avg}%</span>
                  </div>
                  <GradeBar score={avg} />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Export row */}
      <div style={{ margin:'0 16px', display:'flex', gap:8 }}>
        <button onClick={handlePrint}     style={{ flex:1, background:`${C.green}22`,  color:C.green,  border:'none', borderRadius:12, padding:'12px', fontSize:13, fontWeight:700, cursor:'pointer' }}>🖨 Print</button>
        <button onClick={handlePrint}     style={{ flex:1, background:`${C.blue}22`,   color:C.blue,   border:'none', borderRadius:12, padding:'12px', fontSize:13, fontWeight:700, cursor:'pointer' }}>⬇ PDF</button>
        <button onClick={handleExportCSV} style={{ flex:1, background:`${C.purple}22`, color:C.purple, border:'none', borderRadius:12, padding:'12px', fontSize:13, fontWeight:700, cursor:'pointer' }}>📋 CSV</button>
      </div>
    </div>
  )
}
