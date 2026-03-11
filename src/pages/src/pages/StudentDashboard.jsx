import React from 'react'

const defaultStudent = {
  name: 'Jordan Smith',
  gradeLevel: '10th Grade',
  school: 'Lincoln High School',
  homeroom: 'Ms. Johnson',
  currentAverage: 87,
  attendance: 95,
  streak: 6,
  upcomingAssignments: [
    { id: 1, title: 'Stoichiometry Practice', course: 'Chemistry', due: 'Tomorrow', status: 'due-soon' },
    { id: 2, title: 'Lab Safety Reflection', course: 'Chemistry', due: 'Friday', status: 'pending' },
    { id: 3, title: 'Vocabulary Check', course: 'English', due: 'Next Monday', status: 'pending' },
  ],
  recentGrades: [
    { id: 1, title: 'Unit 4 Quiz', course: 'Chemistry', score: '92%', trend: 'up' },
    { id: 2, title: 'Lab Report #3', course: 'Chemistry', score: '88%', trend: 'steady' },
    { id: 3, title: 'Homework Set 12', course: 'Math', score: '100%', trend: 'up' },
  ],
  needsAttention: [
    { id: 1, label: 'Missed assignment', detail: 'Gas Laws Exit Ticket was not submitted' },
    { id: 2, label: 'Low quiz score', detail: 'Unit 4 Quiz dropped below class average' },
    { id: 3, label: 'Late work', detail: 'Lab Safety Reflection is still pending' },
  ],
  feedback: [
    {
      id: 1,
      teacher: 'Ms. Johnson',
      message: 'Great improvement on your problem setup. Keep showing your work on each conversion step.',
    },
    {
      id: 2,
      teacher: 'Mr. Patel',
      message: 'You are participating more in class. Stay consistent this week.',
    },
  ],
  classBreakdown: [
    { id: 1, name: 'Chemistry', average: 87, color: '#3b82f6' },
    { id: 2, name: 'Math', average: 92, color: '#22c55e' },
    { id: 3, name: 'English', average: 84, color: '#f59e0b' },
    { id: 4, name: 'History', average: 89, color: '#a855f7' },
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
  background: 'linear-gradient(135deg, #ea580c 0%, #db2777 100%)',
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

function tone(score) {
  if (score >= 90) return { color: '#22c55e', bg: 'rgba(34,197,94,0.14)' }
  if (score >= 80) return { color: '#f59e0b', bg: 'rgba(245,158,11,0.14)' }
  return { color: '#f04a4a', bg: 'rgba(240,74,74,0.14)' }
}

function StudentDashboard({ student = defaultStudent }) {
  const overallTone = tone(student.currentAverage)

  return (
    <div style={shell}>
      <div style={container}>
        <div style={hero}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ ...pillBase, background: 'rgba(255,255,255,0.14)', color: '#fff', marginBottom: '12px' }}>
                🎓 Student Dashboard
              </div>
              <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 800 }}>{student.name}</h1>
              <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.82)' }}>
                {student.gradeLevel} · {student.school} · Homeroom: {student.homeroom}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(120px, 1fr))', gap: '12px', minWidth: '320px', flex: 1 }}>
              <div style={{ background: 'rgba(255,255,255,0.11)', borderRadius: '18px', padding: '16px' }}>
                <div style={{ fontSize: '12px', opacity: 0.75 }}>Current Average</div>
                <div style={{ fontSize: '30px', fontWeight: 800 }}>{student.currentAverage}%</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.11)', borderRadius: '18px', padding: '16px' }}>
                <div style={{ fontSize: '12px', opacity: 0.75 }}>Attendance</div>
                <div style={{ fontSize: '30px', fontWeight: 800 }}>{student.attendance}%</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.11)', borderRadius: '18px', padding: '16px' }}>
                <div style={{ fontSize: '12px', opacity: 0.75 }}>Streak</div>
                <div style={{ fontSize: '30px', fontWeight: 800 }}>{student.streak} days</div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.3fr 0.9fr',
            gap: '20px',
            alignItems: 'start',
          }}
        >
          <div style={{ display: 'grid', gap: '20px' }}>
            <section style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
                <h2 style={sectionTitle}>Class Snapshot</h2>
                <span style={{ ...pillBase, background: overallTone.bg, color: overallTone.color }}>
                  {student.currentAverage >= 85 ? 'On Track' : 'Watch Progress'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                {student.classBreakdown.map((course) => (
                  <div
                    key={course.id}
                    style={{
                      background: '#1e2231',
                      borderRadius: '16px',
                      padding: '14px',
                      borderLeft: `4px solid ${course.color}`,
                    }}
                  >
                    <div style={{ fontSize: '13px', color: '#eef0f8', fontWeight: 700 }}>{course.name}</div>
                    <div style={{ fontSize: '30px', fontWeight: 800, marginTop: '8px' }}>{course.average}%</div>
                    <div
                      style={{
                        marginTop: '10px',
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
                ))}
              </div>
            </section>

            <section style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
                <h2 style={sectionTitle}>Upcoming Work</h2>
                <span style={{ ...muted, fontSize: '13px' }}>What needs to get done next</span>
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                {student.upcomingAssignments.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: '#1e2231',
                      borderRadius: '16px',
                      padding: '14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700 }}>{item.title}</div>
                      <div style={{ ...muted, fontSize: '12px', marginTop: '4px' }}>{item.course}</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          ...pillBase,
                          background: item.status === 'due-soon' ? 'rgba(240,74,74,0.14)' : 'rgba(59,126,244,0.14)',
                          color: item.status === 'due-soon' ? '#f04a4a' : '#3b7ef4',
                        }}
                      >
                        {item.due}
                      </span>
                      <button
                        style={{
                          background: '#3b7ef4',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '10px 14px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Open
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
                <h2 style={sectionTitle}>Recent Grades</h2>
                <span style={{ ...muted, fontSize: '13px' }}>Latest scored work</span>
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                {student.recentGrades.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: '#1e2231',
                      borderRadius: '16px',
                      padding: '14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700 }}>{item.title}</div>
                      <div style={{ ...muted, fontSize: '12px', marginTop: '4px' }}>{item.course}</div>
                    </div>

                    <div
                      style={{
                        ...pillBase,
                        background:
                          item.trend === 'up'
                            ? 'rgba(34,197,94,0.14)'
                            : item.trend === 'steady'
                            ? 'rgba(245,158,11,0.14)'
                            : 'rgba(240,74,74,0.14)',
                        color: item.trend === 'up' ? '#22c55e' : item.trend === 'steady' ? '#f59e0b' : '#f04a4a',
                      }}
                    >
                      {item.score}
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
                  {student.needsAttention.length} alerts
                </span>
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                {student.needsAttention.map((item) => (
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
                <h2 style={sectionTitle}>Teacher Feedback</h2>
                <span style={{ ...muted, fontSize: '13px' }}>Recent notes</span>
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                {student.feedback.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: '#1e2231',
                      borderRadius: '16px',
                      padding: '14px',
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 700 }}>{item.teacher}</div>
                    <div style={{ ...muted, fontSize: '13px', marginTop: '8px', lineHeight: 1.45 }}>
                      {item.message}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section style={card}>
              <h2 style={{ ...sectionTitle, marginBottom: '14px' }}>Quick Actions</h2>

              <div style={{ display: 'grid', gap: '10px' }}>
                {['View all assignments', 'Check missing work', 'Message teacher', 'Open class feed'].map((label) => (
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

export default StudentDashboard
