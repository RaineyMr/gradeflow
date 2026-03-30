import React from 'react'
import { useStore } from '../../lib/store'
import Widget from '../../ui/Widget'
import { ActionBtn } from '../../ui/ActionBtn'

const C = {
  text: '#eef0f8', muted: '#6b7494', border: '#252b3d',
  blue: '#3b7ef4', purple: '#9b6ef5', teal: '#0fb8a0'
}

function GroupCard({ group, studentCount, onView }) {
  return (
    <div onClick={onView} style={{ 
      background: '#1a1f2e', 
      border: `1px solid ${C.border}`, 
      borderLeft: `3px solid ${group.color || C.blue}`,
      borderRadius: 14, 
      padding: 14, 
      cursor: 'pointer',
      marginBottom: 10
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
          {group.name}
        </div>
        <div style={{ 
          background: `${C.purple}20`, color: C.purple, 
          borderRadius: 999, padding: '2px 8px', 
          fontSize: 10, fontWeight: 700
        }}>
          {studentCount}
        </div>
      </div>
      <div style={{ fontSize: 11, color: C.muted }}>
        Created {new Date(group.created_at).toLocaleDateString()}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, color: C.muted }}>👥 Message Group</span>
        <span style={{ fontSize: 10, color: C.muted }}>📊 View Trends</span>
        <span style={{ fontSize: 10, color: C.muted }}>📝 Notes</span>
      </div>
    </div>
  )
}

export default function GroupsWidget({ navigate }) {
  const { supportStaffGroups, getStudentsInGroup } = useStore()
  
  function viewGroup(groupId) {
    // TODO: navigate to /supportStaff/groups/:id
    console.log('View group:', groupId)
  }

  function createGroup() {
    // TODO: Open create modal
    console.log('Create new group')
  }

  return (
    <Widget style={{ border: `1px solid ${C.teal}30` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>👥 My Groups</div>
          <div style={{ fontSize: 10, color: C.muted }}>Private groups of assigned students</div>
        </div>
        <ActionBtn label="+ Create Group" color={C.blue} onClick={createGroup} />
      </div>

      {supportStaffGroups.map(group => (
        <GroupCard 
          key={group.id}
          group={group}
          studentCount={getStudentsInGroup(group.id)?.length || 0}
          onView={() => viewGroup(group.id)}
        />
      ))}

      {supportStaffGroups.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: C.muted }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
          <div style={{ fontSize: 14, marginBottom: 8, fontWeight: 700 }}>No groups yet</div>
          <div style={{ fontSize: 11, marginBottom: 16 }}>Create groups to organize students and send group messages</div>
          <ActionBtn label="Create First Group" color={C.blue} onClick={createGroup} style={{ width: '100%' }} />
        </div>
      )}
    </Widget>
  )
}

