import React from 'react'
import { Download, Calendar, TrendingUp, Users, AlertCircle } from 'lucide-react'

const C = {
  card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

export default function ReportCard({ report, onDownload, isMobile }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getReportIcon = (type) => {
    switch (type) {
      case 'student-support': return Users
      case 'intervention-effectiveness': return TrendingUp
      case 'caseload-health': return Users
      case 'attendance-behavior': return AlertCircle
      case 'group-impact': return Users
      case 'parent-communication': return Users
      case 'weekly-activity': return Calendar
      default: return Calendar
    }
  }

  const getReportColor = (type) => {
    switch (type) {
      case 'student-support': return C.blue
      case 'intervention-effectiveness': return C.green
      case 'caseload-health': return C.purple
      case 'attendance-behavior': return C.red
      case 'group-impact': return C.teal
      case 'parent-communication': return C.amber
      case 'weekly-activity': return C.blue
      default: return C.blue
    }
  }

  const ReportIcon = getReportIcon(report.type)
  const reportColor = getReportColor(report.type)

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: isMobile ? 16 : 20,
      transition: 'all 0.2s',
      cursor: 'pointer'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        justifyContent: 'space-between',
        marginBottom: 16
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12, 
            marginBottom: 8 
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: reportColor + '20',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ReportIcon size={20} color={reportColor} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{
                color: C.text,
                fontSize: isMobile ? 14 : 16,
                fontWeight: 600,
                margin: 0,
                lineHeight: 1.3
              }}>
                {report.title}
              </h4>
              <p style={{
                color: C.muted,
                fontSize: isMobile ? 11 : 12,
                margin: 0,
                marginTop: 2
              }}>
                Generated {formatDate(report.generatedAt)}
              </p>
            </div>
          </div>
        </div>
        
        <button
          onClick={onDownload}
          style={{
            background: C.inner,
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            padding: 8,
            color: C.soft,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          title="Download Report"
        >
          <Download size={16} />
        </button>
      </div>

      {/* Summary */}
      {report.data?.summary && (
        <div style={{ marginBottom: 16 }}>
          <h5 style={{
            color: C.text,
            fontSize: isMobile ? 12 : 13,
            fontWeight: 600,
            margin: '0 0 8px 0'
          }}>
            Summary
          </h5>
          <p style={{
            color: C.soft,
            fontSize: isMobile ? 11 : 12,
            lineHeight: 1.4,
            margin: 0
          }}>
            {report.data.summary}
          </p>
        </div>
      )}

      {/* Key Metrics */}
      {report.data?.metrics && Object.keys(report.data.metrics).length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h5 style={{
            color: C.text,
            fontSize: isMobile ? 12 : 13,
            fontWeight: 600,
            margin: '0 0 8px 0'
          }}>
            Key Metrics
          </h5>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: 8
          }}>
            {Object.entries(report.data.metrics).slice(0, 4).map(([key, value]) => (
              <div key={key} style={{
                background: C.inner,
                borderRadius: 6,
                padding: '8px 12px'
              }}>
                <div style={{
                  color: C.muted,
                  fontSize: isMobile ? 9 : 10,
                  marginBottom: 2
                }}>
                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div style={{
                  color: C.text,
                  fontSize: isMobile ? 12 : 13,
                  fontWeight: 600
                }}>
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights */}
      {report.data?.aiInsights && (
        <div style={{ marginBottom: 16 }}>
          <h5 style={{
            color: C.text,
            fontSize: isMobile ? 12 : 13,
            fontWeight: 600,
            margin: '0 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            🤖 AI Insights
          </h5>
          <div style={{
            background: C.inner,
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            padding: '10px 12px'
          }}>
            <p style={{
              color: C.soft,
              fontSize: isMobile ? 11 : 12,
              lineHeight: 1.4,
              margin: 0
            }}>
              {report.data.aiInsights}
            </p>
          </div>
        </div>
      )}

      {/* Filters Applied */}
      {report.filters && (report.filters.dateRange?.start || report.filters.student || report.filters.group) && (
        <div>
          <h5 style={{
            color: C.text,
            fontSize: isMobile ? 12 : 13,
            fontWeight: 600,
            margin: '0 0 8px 0'
          }}>
            Filters Applied
          </h5>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6
          }}>
            {report.filters.dateRange?.start && (
              <span style={{
                background: reportColor + '20',
                color: reportColor,
                fontSize: isMobile ? 9 : 10,
                padding: '4px 8px',
                borderRadius: 4,
                border: `1px solid ${reportColor}40`
              }}>
                📅 {report.filters.dateRange.start} - {report.filters.dateRange.end || 'Present'}
              </span>
            )}
            {report.filters.student && (
              <span style={{
                background: reportColor + '20',
                color: reportColor,
                fontSize: isMobile ? 9 : 10,
                padding: '4px 8px',
                borderRadius: 4,
                border: `1px solid ${reportColor}40`
              }}>
                👤 Student: {report.filters.student}
              </span>
            )}
            {report.filters.group && (
              <span style={{
                background: reportColor + '20',
                color: reportColor,
                fontSize: isMobile ? 9 : 10,
                padding: '4px 8px',
                borderRadius: 4,
                border: `1px solid ${reportColor}40`
              }}>
                👥 Group: {report.filters.group}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
