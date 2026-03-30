import React from 'react'
import { useStore } from '@lib/store'
import Widget from '@components/ui/Widget'
import { ActionBtn } from '@components/ui/ActionBtn'

const C = {
  text: '#eef0f8', muted: '#6b7494', border: '#252b3d',
  green: '#22c97a', amber: '#f5a623', red: '#f04a4a', purple: '#9b6ef5'
}

function PlanCard({ plan, studentName, onView }) {
  const statusColor = plan.status === 'active' ? C.green : 
                     plan.status === 'completed' ? C.amber : C.red
  
  const checkinsCount = plan.checkins ? plan.checkins.length : 0

  return (
    <div onClick={onView} style={{ 
      background: '#1a1f2e', 
      border: `1px solid ${C.border}`, 
      borderLeft: `3px solid ${statusColor}`,
      borderRadius: 14, 
      padding: 14, 
      cursor: 'pointer',
      marginBottom: 10
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
            {studentName}
          </div>
          <div style={{ fontSize: 11, color: C.text, marginTop: 2 }}>
            "{plan.goal.length > 40 ? plan.goal.substring(0, 40) + '...' : plan.goal}"
          </div>
        </div>
        <div style={{ 
          background: `${statusColor}20`, color: statusColor, 
          borderRadius: 999, padding: '3px 8px', 
          fontSize: 10, fontWeight: 700
        }}>
          {plan.status.toUpperCase()}
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: 12, fontSize: 10, color: C.muted, marginBottom: 8 }}>
        <span>📝 {checkinsCount} check-ins</span>
        <span>🎯 {plan.strategies?.length || 0} strategies</span>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <span style={{ fontSize: 10, color: C.muted }}>📊 View Progress</span>
        <span style={{ fontSize: 10, color: C.muted }}>💬 Message Team</span>
      </div>
    </div>
  )
}

export default function InterventionPlansWidget({ navigate }) {
  const { interventionPlans, getStudentsForSupportStaff } = useStore()
  const students = getStudentsForSupportStaff()
  
  // Mock student lookup
  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId)
    return student ? student.name : 'Student'
  }

  function viewPlan(planId) {
    // TODO: Navigate to student profile → intervention tab
    console.log('View plan:', planId)
  }

  function createPlan() {
    // TODO: Open create modal or navigate to first student
    console.log('Create intervention plan')
  }

  const activePlans = interventionPlans.filter(p => p.status === 'active')
  const totalPlans = interventionPlans.length

  return (
    <Widget style={{ border: `1px solid ${C.red}30` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>🏥 Intervention Plans</div>
          <div style={{ fontSize: 10, color: C.muted }}>
            {activePlans.length} active · {totalPlans} total
          </div>
        </div>
        <ActionBtn label="+ New Plan" color={C.green} onClick={createPlan} />
      </div>

      {interventionPlans.slice(0, 3).map(plan => (
        <PlanCard 
          key={plan.id}
          plan={plan}
          studentName={getStudentName(plan.student_id)}
          onView={() => viewPlan(plan.id)}
        />
      ))}

      {interventionPlans.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: C.muted }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🏥</div>
          <div style={{ fontSize: 14, marginBottom: 8, fontWeight: 700 }}>No intervention plans</div>
          <div style={{ fontSize: 11, marginBottom: 16 }}>
            Create plans with goals, strategies, and progress tracking
          </div>
          <ActionBtn label="Create First Plan" color={C.green} onClick={createPlan} style={{ width: '100%' }} />
        </div>
      )}

      {interventionPlans.length > 3 && (
        <div style={{ textAlign: 'center', padding: 12, borderTop: `1px solid ${C.border}`, marginTop: 8 }}>
          <button style={{ 
            color: C.blue, fontSize: 11, fontWeight: 700, 
            background: 'none', border: 'none', cursor: 'pointer'
          }}>
            +{interventionPlans.length - 3} more · View all
          </button>
        </div>
      )}
    </Widget>
  )
}

