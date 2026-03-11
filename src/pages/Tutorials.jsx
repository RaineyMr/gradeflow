import React, { useMemo, useState } from 'react'

const roleTabs = [
  { id: 'teacher', label: 'Teacher', icon: '🧑‍🏫', accent: '#f97316' },
  { id: 'student', label: 'Student', icon: '🎓', accent: '#3b82f6' },
  { id: 'parent', label: 'Parent', icon: '👨‍👩‍👧', accent: '#14b8a6' },
  { id: 'admin', label: 'Admin', icon: '🏫', accent: '#8b5cf6' },
]

const tutorialData = {
  teacher: {
    intro:
      'Learn how to create assignments, review student progress, communicate with families, and manage your classroom dashboard.',
    quickStart: [
      'Create your first class and import your roster.',
      'Build an assignment and set grading weights.',
      'Review the needs-attention panel for missed work.',
      'Open parent communication tools and send updates.',
    ],
    tutorials: [
      {
        id: 1,
        title: 'Set up your class dashboard',
        length: '4 min',
        level: 'Beginner',
        description: 'Add classes, customize cards, and organize your main teaching workspace.',
      },
      {
        id: 2,
        title: 'Create assignments and grade faster',
        length: '6 min',
        level: 'Beginner',
        description: 'Build quizzes, tests, and labs, then use streamlined grading tools.',
      },
      {
        id: 3,
        title: 'Spot risk early with alerts',
        length: '5 min',
        level: 'Intermediate',
        description: 'Track missed assignments, attendance dips, and low assessment trends.',
      },
    ],
    resources: [
      'Teacher dashboard overview',
      'Gradebook walkthrough',
      'Parent messaging guide',
      'Assignment templates',
    ],
  },
  student: {
    intro:
      'Learn how to track grades, stay ahead of deadlines, review feedback, and use your dashboard to stay organized.',
    quickStart: [
      'Open your dashboard and review current averages.',
      'Check the upcoming work card every day.',
      'Use the needs-attention panel to fix missed assignments.',
      'Read teacher feedback after each graded task.',
    ],
    tutorials: [
      {
        id: 1,
        title: 'Understand your dashboard',
        length: '3 min',
        level: 'Beginner',
        description: 'See where your grades, alerts, and upcoming work live.',
      },
      {
        id: 2,
        title: 'Fix missing work fast',
        length: '4 min',
        level: 'Beginner',
        description: 'Use the alerts panel to find missed assignments and late submissions.',
      },
      {
        id: 3,
        title: 'Use feedback to improve',
        length: '5 min',
        level: 'Intermediate',
        description: 'Review teacher notes and turn them into next steps.',
      },
    ],
    resources: [
      'Student dashboard overview',
      'Upcoming work guide',
      'Feedback center walkthrough',
      'Study planning checklist',
    ],
  },
  parent: {
    intro:
      'Learn how to monitor progress, watch for missed assignments, follow attendance, and message teachers when support is needed.',
    quickStart: [
      'Open the dashboard and review the current grade card.',
      'Check needs-attention alerts for missed assignments.',
      'Review upcoming deadlines with your student.',
      'Use teacher messages to stay informed and respond quickly.',
    ],
    tutorials: [
      {
        id: 1,
        title: 'Read the parent dashboard',
        length: '3 min',
        level: 'Beginner',
        description: 'Understand grades, attendance, and recent updates at a glance.',
      },
      {
        id: 2,
        title: 'Support your student with alerts',
        length: '5 min',
        level: 'Beginner',
        description: 'Use needs-attention cards to catch missing work and score drops.',
      },
      {
        id: 3,
        title: 'Communicate with teachers clearly',
        length: '4 min',
        level: 'Intermediate',
        description: 'Find the right place to read messages and follow up.',
      },
    ],
    resources: [
      'Parent dashboard overview',
      'Attendance guide',
      'Messaging tutorial',
      'Family support checklist',
    ],
  },
  admin: {
    intro:
      'Learn how to monitor school-wide performance, staffing, attendance trends, and intervention alerts across your organization.',
    quickStart: [
      'Open the school snapshot and review key metrics.',
      'Check the needs-attention panel for attendance and assignment spikes.',
      'Use staffing cards to identify coverage gaps.',
      'Review grade-level and teacher performance summaries.',
    ],
    tutorials: [
      {
        id: 1,
        title: 'Navigate the admin dashboard',
        length: '4 min',
        level: 'Beginner',
        description: 'Find your school metrics, alerts, staffing view, and activity feed.',
      },
      {
        id: 2,
        title: 'Monitor intervention signals',
        length: '6 min',
        level: 'Intermediate',
        description: 'Track attendance dips, missed assignment spikes, and at-risk groups.',
      },
      {
        id: 3,
        title: 'Use staffing and performance data',
        length: '5 min',
        level: 'Intermediate',
        description: 'Review departmental coverage, teacher performance, and action priorities.',
      },
    ],
    resources: [
      'Admin dashboard overview',
      'Intervention workflow',
      'Staffing report guide',
      'District analytics summary',
    ],
  },
}

const shell = {
  minHeight: '100vh',
  background: '#060810',
  color: '#eef0f8',
  padding: '24px',
  fontFamily: 'Inter, Arial, sans-serif',
}

const container = {
  maxWidth: '1440px',
  margin: '0 auto',
}

const hero = {
  background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
  borderRadius: '26px',
  padding: '28px',
  boxShadow: '0 16px 40px rgba(0,0,0,0.28)',
  marginBottom: '22px',
}

const card = {
  background: '#161923',
  border: '1px solid #1e2231',
  borderRadius: '22px',
  padding: '18px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
}

const muted = {
  color: '#6b7494',
}

const sectionTitle = {
  fontSize: '16px',
  fontWeight: 800,
  margin: 0,
}

function Tutorials() {
  const [activeRole, setActiveRole] = useState('teacher')

  const currentTab = useMemo(
    () => roleTabs.find((tab) => tab.id === activeRole) || roleTabs[0],
    [activeRole]
  )

  const current = tutorialData[activeRole]

  return (
    <div style={shell}>
      <div style={container}>
        <section style={hero}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '18px',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: '999px',
                  padding: '8px 12px',
                  background: 'rgba(255,255,255,0.12)',
                  fontSize: '12px',
                  fontWeight: 800,
                }}
              >
                🎥 GradeFlow Tutorials
              </div>

              <h1 style={{ margin: '16px 0 0', fontSize: '34px', fontWeight: 800 }}>
                Learn your dashboard by role
              </h1>

              <p style={{ margin: '12px 0 0', maxWidth: '760px', color: 'rgba(255,255,255,0.84)', lineHeight: 1.55 }}>
                Choose a role to see the most important walkthroughs, quick-start steps, and support
                resources for getting productive fast in GradeFlow.
              </p>
            </div>

            <div
              style={{
                minWidth: '260px',
                background: 'rgba(255,255,255,0.09)',
                borderRadius: '20px',
                padding: '18px',
              }}
            >
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Now viewing</div>
              <div style={{ marginTop: '8px', fontSize: '24px', fontWeight: 800 }}>
                {currentTab.icon} {currentTab.label}
              </div>
              <div style={{ marginTop: '10px', fontSize: '13px', color: 'rgba(255,255,255,0.78)' }}>
                Focused onboarding for the {currentTab.label.toLowerCase()} experience.
              </div>
            </div>
          </div>
        </section>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '280px 1fr',
            gap: '20px',
            alignItems: 'start',
          }}
        >
          <aside style={card}>
            <h2 style={{ ...sectionTitle, marginBottom: '14px' }}>Tutorial Tracks</h2>

            <div style={{ display: 'grid', gap: '10px' }}>
              {roleTabs.map((tab) => {
                const active = tab.id === activeRole
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveRole(tab.id)}
                    style={{
                      background: active ? 'rgba(255,255,255,0.08)' : '#0d1220',
                      color: '#eef0f8',
                      border: active ? `1px solid ${tab.accent}` : '1px solid #232a3b',
                      borderRadius: '16px',
                      padding: '14px',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '18px' }}>
                      {tab.icon} {tab.label}
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '12px', color: '#7d87a8' }}>
                      {tab.label} onboarding and walkthroughs
                    </div>
                  </button>
                )
              })}
            </div>

            <div
              style={{
                marginTop: '18px',
                background: '#0d1220',
                border: '1px solid #232a3b',
                borderRadius: '18px',
                padding: '16px',
              }}
            >
              <div style={{ fontWeight: 800 }}>Need a guided setup?</div>
              <p style={{ ...muted, margin: '8px 0 0', fontSize: '13px', lineHeight: 1.5 }}>
                Start with the quick-start checklist, then move into the featured tutorials for your role.
              </p>
            </div>
          </aside>

          <main style={{ display: 'grid', gap: '20px' }}>
            <section style={card}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}
              >
                <h2 style={sectionTitle}>{currentTab.icon} {currentTab.label} Overview</h2>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    borderRadius: '999px',
                    padding: '7px 12px',
                    background: `${currentTab.accent}22`,
                    color: currentTab.accent,
                    fontSize: '12px',
                    fontWeight: 800,
                  }}
                >
                  Role-based learning path
                </span>
              </div>

              <p style={{ ...muted, fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                {current.intro}
              </p>
            </section>

            <section style={card}>
              <h2 style={{ ...sectionTitle, marginBottom: '14px' }}>Quick Start Checklist</h2>

              <div style={{ display: 'grid', gap: '12px' }}>
                {current.quickStart.map((step, index) => (
                  <div
                    key={step}
                    style={{
                      display: 'flex',
                      gap: '14px',
                      alignItems: 'flex-start',
                      background: '#1e2231',
                      borderRadius: '16px',
                      padding: '14px',
                    }}
                  >
                    <div
                      style={{
                        minWidth: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: `${currentTab.accent}22`,
                        color: currentTab.accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                      }}
                    >
                      {index + 1}
                    </div>

                    <div style={{ fontSize: '14px', lineHeight: 1.5 }}>{step}</div>
                  </div>
                ))}
              </div>
            </section>

            <section style={card}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  marginBottom: '14px',
                }}
              >
                <h2 style={sectionTitle}>Featured Tutorials</h2>
                <span style={{ ...muted, fontSize: '13px' }}>Start here first</span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '14px',
                }}
              >
                {current.tutorials.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: '#1e2231',
                      borderRadius: '18px',
                      padding: '16px',
                    }}
                  >
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        borderRadius: '999px',
                        padding: '6px 10px',
                        background: `${currentTab.accent}22`,
                        color: currentTab.accent,
                        fontSize: '12px',
                        fontWeight: 800,
                      }}
                    >
                      {item.level}
                    </div>

                    <h3 style={{ margin: '14px 0 0', fontSize: '18px', fontWeight: 800 }}>
                      {item.title}
                    </h3>

                    <p style={{ ...muted, marginTop: '10px', fontSize: '13px', lineHeight: 1.55 }}>
                      {item.description}
                    </p>

                    <div
                      style={{
                        marginTop: '14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <span style={{ fontSize: '12px', color: '#9aa4c3', fontWeight: 700 }}>
                        ⏱ {item.length}
                      </span>

                      <button
                        type="button"
                        style={{
                          background: currentTab.accent,
                          color: '#fff',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '10px 14px',
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        Start tutorial
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                alignItems: 'start',
              }}
            >
              <div style={card}>
                <h2 style={{ ...sectionTitle, marginBottom: '14px' }}>Resources</h2>

                <div style={{ display: 'grid', gap: '10px' }}>
                  {current.resources.map((resource) => (
                    <button
                      key={resource}
                      type="button"
                      style={{
                        background: '#1e2231',
                        color: '#eef0f8',
                        border: '1px solid #2a3145',
                        borderRadius: '14px',
                        padding: '12px 14px',
                        textAlign: 'left',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {resource}
                    </button>
                  ))}
                </div>
              </div>

              <div style={card}>
                <h2 style={{ ...sectionTitle, marginBottom: '14px' }}>Support</h2>

                <div style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ background: '#1e2231', borderRadius: '16px', padding: '14px' }}>
                    <div style={{ fontWeight: 800 }}>Live walkthrough request</div>
                    <div style={{ ...muted, marginTop: '6px', fontSize: '13px', lineHeight: 1.5 }}>
                      Request a guided onboarding session for new teachers, families, or school leaders.
                    </div>
                  </div>

                  <div style={{ background: '#1e2231', borderRadius: '16px', padding: '14px' }}>
                    <div style={{ fontWeight: 800 }}>Help center articles</div>
                    <div style={{ ...muted, marginTop: '6px', fontSize: '13px', lineHeight: 1.5 }}>
                      Search role-specific documentation, FAQs, and setup instructions.
                    </div>
                  </div>

                  <div style={{ background: '#1e2231', borderRadius: '16px', padding: '14px' }}>
                    <div style={{ fontWeight: 800 }}>Release notes</div>
                    <div style={{ ...muted, marginTop: '6px', fontSize: '13px', lineHeight: 1.5 }}>
                      Review product changes, dashboard improvements, and new onboarding tools.
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Tutorials
