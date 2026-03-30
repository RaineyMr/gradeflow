import React, { useState } from 'react'
import { useStore } from '../../lib/store'
import Widget from '../ui/Widget'

import StudentTrendsWidget from './Widgets/StudentTrendsWidget'
import InterventionPlansWidget from './Widgets/InterventionPlansWidget'
import NeedsAttentionWidget from './Widgets/NeedsAttentionWidget'
import MessagesWidget from './Widgets/MessagesWidget'
import ReportsWidget from './Widgets/ReportsWidget'

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', 
  text:'#eef0f8', muted:'#6b7494', border:'#252b3d'
}

function OverviewTiles({ navigate }) {
  const store = useStore()
  const { supportStaffGroups, interventionPlans, messages, getNeedsAttention } = store
  const groups = supportStaffGroups.length
  const plans = interventionPlans.filter(p => p.status === 'active').length
  const pending = messages.filter(m => m.status === 'pending').length
  const atRisk = getNeedsAttention()?.length || 0

  return (
    <Widget>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9b6ef5', marginBottom: 12 }}>
        SUPPORT STAFF OVERVIEW
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { icon: '👥', val: groups, label: 'Groups', page: 'groups', color: '#3b7ef4' },
          { icon: '🏥', val: plans, label: 'Active Plans', page: 'interventions', color: '#ef4444' },
          { icon: '💬', val: pending, label: 'Pending Messages', page: 'messages', color: '#9b6ef5' },
          { icon: '⚑', val: atRisk, label: 'At-Risk Students', page: 'trends', color: '#f04a4a' }
        ].map(tile => (
          <button key={tile.label} onClick={() => navigate(tile.page)}
            style={{
              background: `${tile.color}20`,
              border: `1px solid ${tile.color}40`,
              borderRadius: 16,
              padding: '16px 8px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = `${tile.color}30`}
            onMouseLeave={e => e.currentTarget.style.background = `${tile.color}20`}>
            <span style={{ fontSize: 20 }}>{tile.icon}</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: tile.color }}>{tile.val || '—'}</span>
            <span style={{ fontSize: 10, color: '#eef0f8', textAlign: 'center' }}>{tile.label}</span>
          </button>
        ))}
      </div>
    </Widget>
  )
}

export default function SupportStaffHomeFeed({ navigate }) {
  const store = useStore()
  const { getStudentsForSupportStaff, getNeedsAttention, messages } = store
  const atRisk = getNeedsAttention()
  
  const [showAddWidgets, setShowAddWidgets] = useState(false)
  const [hiddenWidgets, setHiddenWidgets] = useState([])

  // Hardcoded support staff widgets (no add/remove for MVP)
  const widgets = [
    <OverviewTiles key="overview" navigate={navigate} />,
    <StudentTrendsWidget key="trends" navigate={navigate} />,
    <InterventionPlansWidget key="plans" navigate={navigate} />,
    <NeedsAttentionWidget key="attention" atRisk={atRisk} navigate={navigate} />,
    <MessagesWidget key="messages" navigate={navigate} />,
    <ReportsWidget key="reports" navigate={navigate} />
  ]

  return (
    <div style={{ padding: '12px 12px 0', background: C.bg, color: C.text }}>
      {widgets}
      
      {/* Add more widgets (future) */}
      <div style={{ margin: '24px 0', textAlign: 'center' }}>
        <button style={{ 
          background: 'var(--school-color)', 
          color: 'white', 
          border: 'none', 
          borderRadius: 14, 
          padding: '12px 28px', 
          fontSize: 13, 
          fontWeight: 700 
        }}>
          + Add More Widgets
        </button>
      </div>
    </div>
  )
}

