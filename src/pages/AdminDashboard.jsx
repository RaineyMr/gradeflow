import React from 'react'

const defaultAdminData = {
  schoolName: 'Lincoln High School',
  districtName: 'GradeFlow District',
  adminName: 'Principal Carter',
  totalStudents: 1248,
  totalTeachers: 78,
  attendanceRate: 94,
  graduationTrack: 91,
  needsAttention: [
    { id: 1, label: 'Missed assignments spike', detail: '124 students have 3 or more missed assignments this week.' },
    { id: 2, label: 'Attendance drop', detail: '10th grade attendance fell 4% compared to last week.' },
    { id: 3, label: 'Unfilled class coverage', detail: '2 classes need substitute coverage for tomorrow.' },
    { id: 4, label: 'At-risk students', detail: '36 students are flagged for grade and attendance intervention.' },
  ],
  schoolMetrics: [
    { id: 1, label: 'Students', value: '1,248', change: '+18 this month', tone: 'neutral' },
    { id: 2, label: 'Teachers', value: '78', change: '+2 hired', tone: 'positive' },
    { id: 3, label: 'Attendance', value: '94%', change: '-1.2% this week', tone: 'negative' },
    { id: 4, label: 'On-Track to Graduate', value: '91%', change: '+2.4% this quarter', tone: 'positive' },
  ],
  gradeLevelPerformance: [
    { id: 1, level: '9th Grade', average: 82, attendance: 93, behavior: 'Stable', color: '#3b82f6' },
    { id: 2, level: '10th Grade', average: 79, attendance: 90, behavior: 'Watchlist', color: '#f59e0b' },
    { id: 3, level: '11th Grade', average: 85, attendance: 95, behavior: 'Good', color: '#22c55e' },
    { id: 4, level: '12th Grade', average: 88, attendance: 96, behavior: 'Strong', color: '#a855f7' },
  ],
  teacherOverview: [
    { id: 1, name: 'Ms. Johnson', department: 'Science', classes: 5, avgGrade: 86, flaggedStudents: 8 },
    { id: 2, name: 'Mr. Patel', department: 'Math', classes: 4, avgGrade: 89, flaggedStudents: 4 },
    { id: 3, name: 'Ms. Green', department: 'English', classes: 5, avgGrade: 83, flaggedStudents: 11 },
    { id: 4, name: 'Coach Williams', department: 'History', classes: 4, avgGrade: 85, flaggedStudents: 6 },
  ],
  staffing: [
    { id: 1, area: 'Science', filled: 12, needed: 12 },
    { id: 2, area: 'Math', filled: 10, needed: 11 },
    { id: 3, area: 'English', filled: 11, needed: 11 },
    { id: 4, area: 'Support Staff', filled: 7, needed: 9 },
  ],
  recentActivity: [
    { id: 1, title: 'Attendance intervention created', detail: 'Counseling team assigned 8 new student outreach cases.', time: '2 hours ago' },
    { id: 2, title: 'Parent communication sent', detail: 'Progress alerts were delivered to 94 families.', time: '4 hours ago' },
    { id: 3, title: 'Teacher submitted grade updates', detail: 'Chemistry and Algebra departments posted new gradebook data.', time: 'Today' },
    { id: 4, title: 'Behavior review logged', detail: 'Assistant principal reviewed 6 classroom referrals.', time: 'Today' },
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
  maxWidth: '1450px',
  margin: '0 auto',
}

const hero = {
  background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
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

function getToneStyles(tone) {
  if (tone === 'positive') {
    return { color: '#22c55e', background: 'rgba(34,197,94,0.14)' }
  }
  if (tone === 'negative') {
    return { color: '#f04a4a', background: 'rgba(240,74,74,0.14)' }
  }
  return { color: '#3b82f6', background: 'rgba(59,130,246,0.14)' }
}

function AdminDashboard({ adminData = defaultAdminData }) {
  return (
    <div style={shell}>
      <div style={container}>
        <div style={hero}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ ...pillBase, background: 'rgba(255,255,255,0.14)', color: '#fff', marginBottom: '12px' }}>
                🏫 Admin Dashboard
              </div>
              <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 800 }}>{adminData.schoolName}</h1>
              <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.82)' }}>
                {adminData.districtName} · Viewed by {adminData.adminName}
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(140px, 1fr))',
                gap: '12px',
                minWidth: '420px',
                flex: 1,
              }}
            >
              <div style={{ background: 'rgba(255,255,255,0.11)', borderRadius: '18px', padding: '16px' }}>
                <div style={{ fontSize: '12px', opacity: 0.75 }}>Students</div>
                <div style={{ fontSize: '28px', fontWeight: 800 }}>{adminData.totalStudents}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.11)', borderRadius: '18px', padding: '16px' }}>
                <div style={{ fontSize: '12px', opacity: 0.75 }}>Teachers</div>
                <div style={{ fontSize: '28px', fontWeight: 800 }}>{adminData.totalTeachers}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.11)', borderRadius: '18px', padding: '16px' }}>
                <div style={{ fontSize: '12px', opacity: 0.75 }}>Attendance</div>
                <div style={{ fontSize: '28px', fontWeight: 800 }}>{adminData.attendanceRate}%</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.11)', borderRadius: '18px', padding: '16px' }}>
                <div style={{ fontSize: '12px', opacity: 0.75 }}>Grad Track</div>
                <div style={{ fontSize: '28px', fontWeight: 800 }}>{adminData.graduationTrack}%</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.9fr', gap: '20px', alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: '20px' }}>
            <section style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={sectionTitle}>School Snapshot</h2>
                <span style={{ ...muted, fontSize: '13px' }}>Live overview</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px' }}>
                {adminData.schoolMetrics.map((item) => {
                  const tone = getToneStyles(item.tone)
                  return (
                    <div key={item.id} style={{ background: '#1e2231', borderRadius: '16px', padding: '14px' }}>
                      <div style={{ fontSize: '13px', color: '#eef0f8', fontWeight: 700 }}>{item.label}</div>
                      <div style={{ fontSize: '30px', fontWeight: 800, marginTop: '8px' }}>{item.value}</div>
                      <div style={{ marginTop: '10px' }}>
                        <span style={{ ...pillBase, color: tone.color, background: tone.background }}>{item.change}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            <section style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={sectionTitle}>Grade Level Performance</h2>
                <span style={{ ...muted, fontSize: '13px' }}>Academic + attendance view</span>
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                {adminData.gradeLevelPerformance.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: '#1e2231',
                      borderRadius: '16px',
                      padding: '14px',
                      borderLeft: `4px solid ${item.color}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700 }}>{item.level}</div>
                        <div style={{ ...muted, fontSize: '12px', marginTop: '4px' }}>Behavior: {item.behavior}</div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ ...pillBase, background: 'rgba(59,130,246,0.14)', color: '#60a5fa' }}>
                          Avg {item.average}%
                        </span>
                        <span style={{ ...pillBase, background: 'rgba(34,197,94,0.14)', color: '#4ade80' }}>
                          Attendance {item.attendance}%
                        </span>
                      </div>
                    </div>

                    <div style={{ marginTop: '12px', height: '8px', background: '#11141d', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${item.average}%`,
                          height: '100%',
                          borderRadius: '999px',
                          background: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={sectionTitle}>Teacher Overview</h2>
                <span style={{ ...muted, fontSize: '13px' }}>Class performance by teacher</span>
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                {adminData.teacherOverview.map((teacher) => (
                  <div
                    key={teacher.id}
                    style={{
                      background: '#1e2231',
                      borderRadius: '16px',
                      padding: '14px',
                      display: 'grid',
                      gridTemplateColumns: '1.2fr 0.8fr 0.7fr 0.7fr',
                      gap: '12px',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700 }}>{teacher.name}</div>
                      <div style={{ ...muted, fontSize: '12px', marginTop: '4px' }}>{teacher.department}</div>
                    </div>
                    <div style={{ fontSize: '13px' }}>Classes: <strong>{teacher.classes}</strong></div>
                    <div style={{ fontSize: '13px' }}>Avg: <strong>{teacher.avgGrade}%</strong></div>
                    <div style={{ fontSize: '13px', color: teacher.flaggedStudents > 8 ? '#fca5a5' : '#eef0f8' }}>
                      Flagged: <strong>{teacher.flaggedStudents}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div style={{ display: 'grid', gap: '20px' }}>
            <section style={{ ...card, border: '1px solid rgba(240,74,74,0.18)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={sectionTitle}>Needs Attention</h2>
                <span style={{ ...pillBase, background: 'rgba(240,74,74,0.14)', color: '#f04a4a' }}>
                  {adminData.needsAttention.length} alerts
                </span>
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                {adminData.needsAttention.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: '#1c1012',
                      borderRadius: '16px',
                      padding: '14px',
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#fca5a5' }}>{item.label}</div>
                    <div style={{ ...muted, fontSize: '12px', marginTop: '6px', lineHeight: 1.45 }}>{item.detail}</div>
                  </div>
                ))}
              </div>
            </section>

            <section style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={sectionTitle}>Staffing & Coverage</h2>
                <span style={{ ...muted, fontSize: '13px' }}>Department fill rates</span>
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                {adminData.staffing.map((item) => {
                  const percent = Math.round((item.filled / item.needed) * 100)
                  const alert = item.filled < item.needed
                  return (
                    <div key={item.id} style={{ background: '#1e2231', borderRadius: '16px', padding: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700 }}>{item.area}</div>
                        <div style={{ fontSize: '13px', color: alert ? '#fca5a5' : '#eef0f8' }}>
                          {item.filled}/{item.needed} filled
                        </div>
                      </div>

                      <div style={{ marginTop: '10px', height: '8px', background: '#11141d', borderRadius: '999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${percent}%`,
                            height: '100%',
                            borderRadius: '999px',
                            background: alert ? '#f59e0b' : '#22c55e',
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            <section style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={sectionTitle}>Recent Activity</h2>
                <span style={{ ...muted, fontSize: '13px' }}>Admin-facing updates</span>
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                {adminData.recentActivity.map((item) => (
                  <div key={item.id} style={{ background: '#1e2231', borderRadius: '16px', padding: '14px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>{item.title}</div>
                    <div style={{ ...muted, fontSize: '13px', marginTop: '8px', lineHeight: 1.45 }}>{item.detail}</div>
                    <div style={{ ...muted, fontSize: '12px', marginTop: '10px' }}>{item.time}</div>
                  </div>
                ))}
              </div>
            </section>

            <section style={card}>
              <h2 style={{ ...sectionTitle, marginBottom: '14px' }}>Quick Actions</h2>

              <div style={{ display: 'grid', gap: '10px' }}>
                {[
                  'Review flagged students',
                  'Open staffing report',
                  'Message department heads',
                  'View district analytics',
                  'Check attendance interventions',
                ].map((label) => (
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

export default AdminDashboard
