import React from 'react'

const defaultParentView = {
  parentName: 'Mrs. Smith',
  studentName: 'Jordan Smith',
  gradeLevel: '10th Grade',
  school: 'Lincoln High School',
  currentAverage: 87,
  attendance: 95,
  behavior: 'Good',
  needsAttention: [
    { id: 1, label: 'Missed assignment', detail: 'Gas Laws Exit Ticket was not submitted' },
    { id: 2, label: 'Score dip', detail: 'Unit 4 Quiz came in 8 points below the previous average' },
    { id: 3, label: 'Late submission', detail: 'Lab Safety Reflection is still outstanding' },
  ],
  classSummary: [
    { id: 1, name: 'Chemistry', average: 87, teacher: 'Ms. Johnson', color: '#3b82f6' },
    { id: 2, name: 'Math', average: 92, teacher: 'Mr. Patel', color: '#22c55e' },
    { id: 3, name: 'English', average: 84, teacher: 'Ms. Green', color: '#f59e0b' },
    { id: 4, name: 'History', average: 89, teacher: 'Coach Williams', color: '#a855f7' },
  ],
  gradeWeights: [
    { id: 1, label: 'Tests', weight: '40%', avg: '85%' },
    { id: 2, label: 'Quizzes', weight: '30%', avg: '90%' },
    { id: 3, label: 'Homework', weight: '20%', avg: '88%' },
    { id: 4, label: 'Participation', weight: '10%', avg: '100%' },
  ],
  upcomingDeadlines: [
    { id: 1, title: 'Stoichiometry Practice', due: 'Tomorrow', course: 'Chemistry' },
    { id: 2, title: 'Lab Safety Reflection', due: 'Friday', course: 'Chemistry' },
    { id: 3, title: 'Vocabulary Check', due: 'Next Monday', course: 'English' },
  ],
  messages: [
    {
      id: 1,
      from: 'Ms. Johnson',
      subject: 'Chemistry update',
      body: 'Jordan is improving in class discussion. Please remind him to submit the missed exit ticket tonight.',
    },
    {
      id: 2,
      from: 'Mr. Patel',
      subject: 'Math progress',
      body: 'Strong performance this week. Homework completion has been excellent.',
    },
  ],
}

const shell = {
  minHeight: '100vh',
  background: '#060810',
  color: '#eef0f8',
  padding: '24px',
  fontFamily: 'Inter, Arial, sans-serif',
}

const container = {
  maxWidth: '1400px',
  margin: '0 auto',
}

const hero = {
  background: 'linear-gradient(135deg, #0f766e 0%, #1d4ed8 100%)',
  borderRadius: '24px',
  padding: '24px',
  boxShadow: '0 18px 50px rgba(0,0,0,0.28)',
  marginBottom: '20px',
}

const card = {
  background: '#161923',
  border: '1px solid #1e2231',
  borderRadius: '20px',
  padding: '18px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
}

const sectionTitle = {
  fontSize: '16px',
  fontWeight: 700,
  margin: 0,
}

const muted = {
  color: '#6b7494',
}

const pillBase = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  borderRadius: '999px',
  padding: '6px 10px',
  fontSize: '12px',
  fontWeight: 700,
}

function ParentDashboard({ parentView = defaultParentView }) {
  return (
    <div style={shell}>
      <div style={container}>
        <div style={hero}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ ...pillBase, background: 'rgba(255,255,255,0.14)', color: '#fff', marginBottom: '12px' }}>
                👨‍👩‍👧 Parent Dashboard
              </div>
              <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 800 }}>{parentView.studentName}</h1>
              <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.82)' }}>
                Viewed by {parentView.parentName} · {parentView.gradeLevel} · {parentView.school}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(120px, 1fr))', gap: '12px', minWidth: '320px', flex: 1 }}>
              <div style={{ background: 'rgba(255,255,255,0.11)', borderRadius: '18px', padding: '16px' }}>
                <div style={{ fontSize: '12px', opacity: 0.75 }}>Current Grade</div>
                <div style={{ fontSize: '30px', fontWeight: 800 }}>{parentView.currentAverage}%</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.11)', borderRadius: '18px', padding: '16px' }}>
                <div style={{ fontSize: '12px', opacity: 0.75 }}>Attendance</div>
                <div style={{ fontSize: '30px', fontWeight: 800 }}>{parentView.attendance}%</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.11)', borderRadius: '18px', padding: '16px' }}>
                <div style={{ fontSize: '12px', opacity: 0.75 }}>Behavior</div>
                <div style={{ fontSize: '30px', fontWeight: 800 }}>{parentView.behavior}</div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.15fr 0.95fr',
            gap: '20px',
            alignItems: 'start',
          }}
        >
          <div style={{ display: 'grid', gap: '20px' }}>
            <section style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
                <h2 style={sectionTitle}>Class Performance</h2>
                <span style={{ ...muted, fontSize: '13px' }}>By course</span>
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                {parentView.classSummary.map((course) => (
                  <div
                    key={course.id}
                    style={{
                      background: '#1e2231',
                      borderRadius: '16px',
                      padding: '14px',
                      borderLeft: `4px solid ${course.color}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700 }}>{course.name}</div>
                      <div style={{ ...muted, fontSize: '12px', marginTop: '4px' }}>{course.teacher}</div>
                    </div>

                    <div style={{ minWidth: '140px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 800, textAlign: 'right' }}>{course.average}%</div>
                      <div
                        style={{
                          marginTop: '8px',
                          height: '8px',
                          background: '#11141d',
                          borderRadius: '999px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${course.average}%`,
                            height: '100%',
                            borderRadius: '999px',
                            background: course.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
                <h2 style={sectionTitle}>Grade Breakdown</h2>
                <span style={{ ...muted, fontSize: '13px' }}>Category weights</span>
              </div>

              <div style={{ display: 'grid', gap: '10px' }}>
                {parentView.gradeWeights.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: '#1e2231',
                      borderRadius: '14px',
                      padding: '14px',
                      display: 'grid',
                      gridTemplateColumns: '1.2fr 0.8fr 0.6fr',
                      gap: '10px',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{item.label}</div>
                    <div style={{ ...muted, fontSize: '13px' }}>Weight: {item.weight}</div>
                    <div style={{ textAlign: 'right', fontWeight: 800 }}>{item.avg}</div>
                  </div>
                ))}
              </div>
            </section>

            <section style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
                <h2 style={sectionTitle}>Teacher Messages</h2>
                <span style={{ ...muted, fontSize: '13px' }}>Latest communication</span>
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                {parentView.messages.map((message) => (
                  <div
                    key={message.id}
                    style={{
                      background: '#1e2231',
                      borderRadius: '16px',
                      padding: '14px',
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>{message.subject}</div>
                    <div style={{ ...muted, fontSize: '12px', marginTop: '4px' }}>From {message.from}</div>
                    <div style={{ ...muted, fontSize: '13px', marginTop: '10px', lineHeight: 1.45 }}>
                      {message.body}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div style={{ display: 'grid', gap: '20px' }}>
            <section style={{ ...card, border: '1px solid rgba(240,74,74,0.18)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '12px', flexWrap: 'wrap' }}>
                <h2 style={sectionTitle}>Needs Attention</h2>
                <span style={{ ...pillBase, background: 'rgba(240,74,74,0.14)', color: '#f04a4a' }}>
                  {parentView.needsAttention.length} alerts
                </span>
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                {parentView.needsAttention.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: '#1c1012',
                      borderRadius: '16px',
                      padding: '14px',
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#fca5a5' }}>{item.label}</div>
                    <div style={{ ...muted, fontSize: '12px', marginTop: '6px' }}>{item.detail}</div>
                  </div>
                ))}
              </div>
            </section>

            <section style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '12px', flexWrap: 'wrap' }}>
                <h2 style={sectionTitle}>Upcoming Deadlines</h2>
                <span style={{ ...muted, fontSize: '13px' }}>Important due dates</span>
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                {parentView.upcomingDeadlines.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: '#1e2231',
                      borderRadius: '16px',
                      padding: '14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '10px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700 }}>{item.title}</div>
                      <div style={{ ...muted, fontSize: '12px', marginTop: '4px' }}>{item.course}</div>
                    </div>

                    <span style={{ ...pillBase, background: 'rgba(59,126,244,0.14)', color: '#3b7ef4' }}>
                      {item.due}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section style={card}>
              <h2 style={{ ...sectionTitle, marginBottom: '14px' }}>Quick Actions</h2>

              <div style={{ display: 'grid', gap: '10px' }}>
                {['Message teacher', 'View missing work', 'Open full gradebook', 'See attendance details'].map((label) => (
                  <button
                    key={label}
                    style={{
                      background: '#1e2231',
                      color: '#eef0f8',
                      border: '1px solid #2b3145',
                      borderRadius: '14px',
                      padding: '12px 14px',
                      textAlign: 'left',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ParentDashboard
