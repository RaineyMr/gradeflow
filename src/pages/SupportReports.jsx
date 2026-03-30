import React, { useState, useEffect } from 'react'
import { useStore } from '../lib/store'
import { useIsMobile, formatDateMobile } from '../lib/utils'
import ReportCard from '../components/support/ReportCard'
import AIAssistantPanel from '../components/support/AIAssistantPanel'
import { Calendar, Users, TrendingUp, AlertTriangle, Target, MessageSquare, Activity, Download, Filter, Brain } from 'lucide-react'

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

const REPORT_TYPES = [
  { id: 'student-support', label: 'Student Support Summary', icon: Users, color: C.blue },
  { id: 'intervention-effectiveness', label: 'Intervention Effectiveness', icon: TrendingUp, color: C.green },
  { id: 'caseload-health', label: 'Caseload Health', icon: Activity, color: C.purple },
  { id: 'attendance-behavior', label: 'Attendance/Behavior Correlation', icon: AlertTriangle, color: C.red },
  { id: 'group-impact', label: 'Group Impact', icon: Target, color: C.teal },
  { id: 'parent-communication', label: 'Parent Communication Summary', icon: MessageSquare, color: C.amber },
  { id: 'weekly-activity', label: 'Weekly Support Activity', icon: Calendar, color: C.blue },
]

export default function SupportReports() {
  const isMobile = useIsMobile()
  const [selectedReportType, setSelectedReportType] = useState('student-support')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showAI, setShowAI] = useState(false)
  const [generatedReports, setGeneratedReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const {
    getStudentsForSupportStaff,
    supportStaffGroups,
    getStudentSupportReport,
    getInterventionEffectivenessReport,
    getCaseloadHealthReport,
    getAttendanceBehaviorCorrelationReport,
    getGroupImpactReport,
    getParentCommunicationReport,
    getWeeklySupportActivityReport,
  } = useStore()

  const students = getStudentsForSupportStaff()

  const handleGenerateReport = async () => {
    setLoading(true)
    try {
      let reportData = null
      const filters = { dateRange, student: selectedStudent, group: selectedGroup, category: selectedCategory }

      switch (selectedReportType) {
        case 'student-support':
          reportData = await getStudentSupportReport(selectedStudent, filters)
          break
        case 'intervention-effectiveness':
          reportData = await getInterventionEffectivenessReport(filters)
          break
        case 'caseload-health':
          reportData = await getCaseloadHealthReport(filters)
          break
        case 'attendance-behavior':
          reportData = await getAttendanceBehaviorCorrelationReport(filters)
          break
        case 'group-impact':
          reportData = await getGroupImpactReport(selectedGroup, filters)
          break
        case 'parent-communication':
          reportData = await getParentCommunicationReport(selectedStudent, filters)
          break
        case 'weekly-activity':
          reportData = await getWeeklySupportActivityReport(filters)
          break
      }

      if (reportData) {
        const reportType = REPORT_TYPES.find(r => r.id === selectedReportType)
        const newReport = {
          id: Date.now(),
          type: selectedReportType,
          title: reportType.label,
          data: reportData,
          generatedAt: new Date().toISOString(),
          filters
        }
        setGeneratedReports(prev => [newReport, ...prev])
      }
    } catch (error) {
      console.error('Failed to generate report:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAIKeyFindings = () => {
    setShowAI(true)
  }

  const handleAINextSteps = () => {
    setShowAI(true)
  }

  const handleDownloadReport = (report) => {
    // In a real implementation, this would generate and download a PDF/CSV
    console.log('Downloading report:', report)
    alert('Report download functionality would be implemented here')
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg }}>
      {/* Header */}
      <div style={{ 
        background:C.card, borderBottom:`1px solid ${C.border}`, 
        padding: isMobile ? '16px' : '20px' 
      }}>
        <div style={{ fontSize: isMobile ? 20 : 24, fontWeight:800, color:C.text, marginBottom:8 }}>
          Support Staff Reports
        </div>
        <div style={{ fontSize: isMobile ? 12 : 14, color:C.muted }}>
          Generate and analyze comprehensive support reports
        </div>
      </div>

      <div style={{ padding: isMobile ? '16px' : '20px' }}>
        {/* Report Type Selection */}
        <div style={{ marginBottom:24 }}>
          <h3 style={{ color:C.text, marginBottom:16, fontSize: isMobile ? 16 : 18 }}>Report Type</h3>
          <div style={{ 
            display:'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap:12 
          }}>
            {REPORT_TYPES.map(reportType => (
              <button
                key={reportType.id}
                onClick={() => setSelectedReportType(reportType.id)}
                style={{
                  background: selectedReportType === reportType.id ? reportType.color + '20' : C.inner,
                  border: selectedReportType === reportType.id ? `2px solid ${reportType.color}` : `1px solid ${C.border}`,
                  borderRadius:12,
                  padding: isMobile ? '12px' : '16px',
                  cursor:'pointer',
                  textAlign:'left',
                  transition:'all 0.2s'
                }}
              >
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                  <reportType.icon size={20} color={reportType.color} />
                  <span style={{ 
                    color:C.text, 
                    fontWeight:600, 
                    fontSize: isMobile ? 14 : 16 
                  }}>
                    {reportType.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <h3 style={{ color:C.text, fontSize: isMobile ? 16 : 18 }}>Filters</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                background:C.inner, border:`1px solid ${C.border}`, borderRadius:8,
                padding:'8px 12px', color:C.text, cursor:'pointer', display:'flex', alignItems:'center', gap:8
              }}
            >
              <Filter size={16} />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>

          {showFilters && (
            <div style={{ 
              background:C.inner, border:`1px solid ${C.border}`, borderRadius:12, 
              padding: isMobile ? '16px' : '20px' 
            }}>
              <div style={{ 
                display:'grid', 
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap:16 
              }}>
                <div>
                  <label style={{ color:C.soft, fontSize:12, marginBottom:4, display:'block' }}>Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    style={{
                      width:'100%', background:C.card, border:`1px solid ${C.border}`,
                      borderRadius:6, padding:'8px 12px', color:C.text, fontSize:14
                    }}
                  />
                </div>
                <div>
                  <label style={{ color:C.soft, fontSize:12, marginBottom:4, display:'block' }}>End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    style={{
                      width:'100%', background:C.card, border:`1px solid ${C.border}`,
                      borderRadius:6, padding:'8px 12px', color:C.text, fontSize:14
                    }}
                  />
                </div>
                <div>
                  <label style={{ color:C.soft, fontSize:12, marginBottom:4, display:'block' }}>Student</label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    style={{
                      width:'100%', background:C.card, border:`1px solid ${C.border}`,
                      borderRadius:6, padding:'8px 12px', color:C.text, fontSize:14
                    }}
                  >
                    <option value="">All Students</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>{student.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ color:C.soft, fontSize:12, marginBottom:4, display:'block' }}>Group</label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    style={{
                      width:'100%', background:C.card, border:`1px solid ${C.border}`,
                      borderRadius:6, padding:'8px 12px', color:C.text, fontSize:14
                    }}
                  >
                    <option value="">All Groups</option>
                    {supportStaffGroups.map(group => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display:'flex', 
          gap:12, 
          marginBottom:24,
          flexWrap: isMobile ? 'wrap' : 'nowrap'
        }}>
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            style={{
              background:C.blue, color:'#fff', border:'none', borderRadius:8,
              padding: isMobile ? '12px 16px' : '12px 24px', fontSize:14, fontWeight:600,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
              display:'flex', alignItems:'center', gap:8
            }}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
          <button
            onClick={handleAIKeyFindings}
            style={{
              background:C.purple, color:'#fff', border:'none', borderRadius:8,
              padding: isMobile ? '12px 16px' : '12px 24px', fontSize:14, fontWeight:600,
              cursor:'pointer', display:'flex', alignItems:'center', gap:8
            }}
          >
            <Brain size={16} />
            AI Key Findings
          </button>
          <button
            onClick={handleAINextSteps}
            style={{
              background:C.teal, color:'#fff', border:'none', borderRadius:8,
              padding: isMobile ? '12px 16px' : '12px 24px', fontSize:14, fontWeight:600,
              cursor:'pointer', display:'flex', alignItems:'center', gap:8
            }}
          >
            <Brain size={16} />
            AI Recommended Next Steps
          </button>
        </div>

        {/* Generated Reports */}
        <div>
          <h3 style={{ color:C.text, marginBottom:16, fontSize: isMobile ? 16 : 18 }}>Generated Reports</h3>
          {generatedReports.length === 0 ? (
            <div style={{ 
              background:C.inner, border:`1px solid ${C.border}`, borderRadius:12, 
              padding:40, textAlign:'center', color:C.muted 
            }}>
              No reports generated yet. Select a report type and click "Generate Report" to get started.
            </div>
          ) : (
            <div style={{ 
              display:'grid', 
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))', 
              gap:20 
            }}>
              {generatedReports.map(report => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onDownload={() => handleDownloadReport(report)}
                  isMobile={isMobile}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant Modal */}
      {showAI && (
        <AIAssistantPanel
          onClose={() => setShowAI(false)}
          context={`reports-${selectedReportType}`}
          title="AI Report Assistant"
        />
      )}
    </div>
  )
}
