import React, { useState } from 'react'
import { useStore } from '../lib/store'
import { useT } from '../lib/i18n'
import { useNavigate } from 'react-router-dom'

const C = {
  bg: '#060810', card: '#161923', inner: '#1e2231', text: '#eef0f8',
  muted: '#6b7494', border: '#2a2f42', green: '#22c97a', blue: '#3b7ef4',
  red: '#f04a4a', amber: '#f5a623', teal: '#0fb8a0', purple: '#9b6ef5',
}

const BRAND = {
  primary:  '#f97316',
  blue:     '#2563EB',
  bg:       '#060810',
  card:     '#0c0e14',
  inner:    '#1e2231',
  text:     '#eef0f8',
  muted:    '#6b7494',
  border:   '#2a2f42',
  gradient: 'linear-gradient(135deg, #f97316 0%, #2563EB 100%)',
}

// Language toggle component
function LangToggle({ onToggle, style = {} }) {
  const { lang } = useStore()
  return (
    <button
      onClick={onToggle}
      style={{
        background:    'rgba(255,255,255,0.12)',
        border:        '1.5px solid rgba(255,255,255,0.25)',
        borderRadius:  999,
        padding:       '5px 12px',
        color:         '#fff',
        fontSize:      12,
        fontWeight:    800,
        cursor:        'pointer',
        display:       'flex',
        alignItems:    'center',
        gap:           5,
        letterSpacing: '0.04em',
        transition:    'background 0.15s',
        ...style,
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
      title={lang === 'en' ? 'Switch to Spanish' : 'Switch to English'}
    >
      {lang === 'en' ? '🇲🇽 ES' : '🇺🇸 EN'}
    </button>
  )
}

// Subjects a teacher might pick on signup
const COMMON_SUBJECTS = ['Math', 'Reading', 'ELA', 'Science', 'Writing', 'Social Studies', 'History', 'Art', 'Music', 'PE', 'Other']

// Default category templates (teacher picks one on signup, can edit later)
const GRADING_TEMPLATES = [
  {
    id: 'standard',
    label: 'Standard Weighted',
    desc: 'Tests 40% · Quizzes 30% · Homework 20% · Participation 10%',
    categories: [
      { id: 1, name: 'Tests',         weight: 40, color: '#f04a4a', icon: '📝' },
      { id: 2, name: 'Quizzes',       weight: 30, color: '#f5a623', icon: '✏️' },
      { id: 3, name: 'Homework',      weight: 20, color: '#3b7ef4', icon: '📚' },
      { id: 4, name: 'Participation', weight: 10, color: '#22c97a', icon: '🙋' },
    ],
  },
  {
    id: 'balanced',
    label: 'Balanced',
    desc: 'Tests 35% · Quizzes 25% · Homework 25% · Participation 15%',
    categories: [
      { id: 1, name: 'Tests',         weight: 35, color: '#f04a4a', icon: '📝' },
      { id: 2, name: 'Quizzes',       weight: 25, color: '#f5a623', icon: '✏️' },
      { id: 3, name: 'Homework',      weight: 25, color: '#3b7ef4', icon: '📚' },
      { id: 4, name: 'Participation', weight: 15, color: '#22c97a', icon: '🙋' },
    ],
  },
  {
    id: 'projects',
    label: 'Project-Based',
    desc: 'Projects 50% · Quizzes 20% · Homework 15% · Participation 15%',
    categories: [
      { id: 1, name: 'Projects',      weight: 50, color: '#9b6ef5', icon: '🏗' },
      { id: 2, name: 'Quizzes',       weight: 20, color: '#f5a623', icon: '✏️' },
      { id: 3, name: 'Homework',      weight: 15, color: '#3b7ef4', icon: '📚' },
      { id: 4, name: 'Participation', weight: 15, color: '#22c97a', icon: '🙋' },
    ],
  },
  {
    id: 'total_points',
    label: 'Total Points',
    desc: 'All assignments are worth equal points — final grade = points earned ÷ total possible',
    categories: [],
    method: 'total_points',
  },
  {
    id: 'custom',
    label: 'Custom',
    desc: 'I\'ll set up my own categories and weights',
    categories: [],
    custom: true,
  },
]

// ─── Step: Curriculum ──────────────────────────────────────────────────────────
function StepCurriculum({ subjects, onNext, onSkip }) {
  const { curriculumSources, connectedCurricula, setConnectedCurriculum } = useStore()

  console.log('StepCurriculum - subjects:', subjects)
  console.log('StepCurriculum - curriculumSources:', curriculumSources)
  console.log('StepCurriculum - connectedCurricula:', connectedCurricula)

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px' }}>What curriculum do you use?</h2>
      <p style={{ color: C.muted, fontSize: 13, margin: '0 0 4px' }}>GradeFlow will pull lesson plans from the internet so they're ready before you even create them.</p>
      <p style={{ color: C.teal, fontSize: 11, fontWeight: 700, margin: '0 0 20px' }}>You can skip this and set it up later.</p>

      {subjects.map(subject => {
        const connected = connectedCurricula[subject]
        
        // Better subject matching - check if curriculum source subjects match this subject
        const options = curriculumSources.filter(s => {
          // Direct match
          if (s.subjects.includes(subject)) return true
          // Match subject categories (e.g., 'Algebra I' should match 'Math' curriculum)
          if (subject.includes('Algebra') || subject.includes('Geometry') || subject.includes('Trigonometry') || 
              subject.includes('Calculus') || subject.includes('Pre-Calculus') || subject === 'Math' || 
              subject === 'Pre-Algebra') {
            return s.subjects.includes('Math')
          }
          // English/Language Arts subjects
          if (subject.includes('English') || subject.includes('Reading') || subject.includes('Writing') || subject.includes('ELA')) {
            return s.subjects.includes('Reading') || s.subjects.includes('ELA') || s.subjects.includes('Writing')
          }
          // Science subjects
          if (subject.includes('Biology') || subject.includes('Chemistry') || subject.includes('Physics') || 
              subject.includes('Science') || subject.includes('Environmental')) {
            return s.subjects.includes('Science')
          }
          // Social Studies subjects
          if (subject.includes('History') || subject.includes('Government') || subject.includes('Economics') || 
              subject.includes('Social Studies')) {
            return s.subjects.includes('Social Studies')
          }
          // Curriculum sources with no subjects restriction (like 'Custom / No textbook')
          return s.subjects.length === 0
        })

        console.log(`Subject: ${subject}, Connected: ${connected}, Options:`, options)

        return (
          <div key={subject} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 8 }}>{subject}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {options.length > 0 ? options.map(opt => (
                <button key={opt.id} onClick={() => setConnectedCurriculum(subject, connected === opt.id ? null : opt.id)}
                  style={{ background: connected === opt.id ? `${C.teal}18` : C.inner, border: `1px solid ${connected === opt.id ? C.teal : C.border}`, borderRadius: 12, padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', transition: 'all 0.15s' }}>
                  <span style={{ fontSize: 18 }}>{opt.logo}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: connected === opt.id ? C.teal : C.text }}>{opt.name}</div>
                    {opt.publisher && <div style={{ fontSize: 10, color: C.muted }}>{opt.publisher}</div>}
                  </div>
                  {connected === opt.id
                    ? <span style={{ fontSize: 18, color: C.teal }}>✓</span>
                    : <span style={{ fontSize: 18, color: C.muted }}>○</span>
                  }
                </button>
              )) : (
                <div style={{ padding: '10px 14px', color: C.muted, fontSize: 12 }}>
                  No curriculum options available for {subject}
                </div>
              )}
            </div>
          </div>
        )
      })}

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button onClick={onSkip}
          style={{ flex: 1, background: C.inner, color: C.muted, border: 'none', borderRadius: 999, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          Skip for now
        </button>
        <button onClick={onNext}
          style={{ flex: 2, background: 'var(--school-color, #BA0C2F)', color: '#fff', border: 'none', borderRadius: 999, padding: '14px', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
          Next →
        </button>
      </div>
    </div>
  )
}

// ─── Step: Gradebook setup ─────────────────────────────────────────────────────
function StepGradebook({ onNext, onSkip }) {
  const { setCategories, setGradingMethod } = useStore()
  const [selectedTemplate, setSelectedTemplate] = useState('standard')
  const [customCats, setCustomCats] = useState([
    { id: 1, name: 'Tests',         weight: 40, color: '#f04a4a', icon: '📝' },
    { id: 2, name: 'Quizzes',       weight: 30, color: '#f5a623', icon: '✏️' },
    { id: 3, name: 'Homework',      weight: 20, color: '#3b7ef4', icon: '📚' },
    { id: 4, name: 'Participation', weight: 10, color: '#22c97a', icon: '🙋' },
  ])

  const tpl       = GRADING_TEMPLATES.find(t => t.id === selectedTemplate)
  const activeCats = selectedTemplate === 'custom' ? customCats : (tpl?.categories || [])
  const total      = activeCats.reduce((s, c) => s + Number(c.weight || 0), 0)
  const totalOk    = Math.abs(total - 100) < 0.01 || selectedTemplate === 'total_points'

  function updateCustom(id, val) {
    setCustomCats(d => d.map(c => c.id === id ? { ...c, weight: Number(val) } : c))
  }

  function handleSave() {
    const method = tpl?.method || 'weighted'
    setGradingMethod(method)
    if (method === 'weighted') {
      setCategories(activeCats)
    }
    onNext()
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px' }}>Set up your gradebook</h2>
      <p style={{ color: C.muted, fontSize: 13, margin: '0 0 4px' }}>Choose how assignments are weighted. Teachers and admins can change this anytime.</p>
      <p style={{ color: C.teal, fontSize: 11, fontWeight: 700, margin: '0 0 16px' }}>This becomes the default for your school.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {GRADING_TEMPLATES.map(t => (
          <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
            style={{ background: selectedTemplate === t.id ? `${C.teal}18` : C.inner, border: `1px solid ${selectedTemplate === t.id ? C.teal : C.border}`, borderRadius: 14, padding: '12px 16px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selectedTemplate === t.id ? C.teal : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {selectedTemplate === t.id && <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.teal }} />}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: selectedTemplate === t.id ? C.teal : C.text }}>{t.label}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{t.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Custom weight editor */}
      {selectedTemplate === 'custom' && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px', marginBottom: 16 }}>
          {customCats.map(cat => (
            <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 16 }}>{cat.icon}</span>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: C.text }}>{cat.name}</div>
              <input type="number" min="0" max="100" value={cat.weight} onChange={e => updateCustom(cat.id, e.target.value)}
                style={{ width: 60, background: C.inner, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 8px', color: C.text, fontSize: 13, fontWeight: 700, textAlign: 'center', outline: 'none' }} />
              <span style={{ fontSize: 12, color: C.muted }}>%</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0 0', borderTop: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.muted }}>Total</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: totalOk ? C.green : C.red }}>{total}%</span>
          </div>
        </div>
      )}

      {/* Visual weight bar */}
      {activeCats.length > 0 && (
        <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 16, gap: 1 }}>
          {activeCats.map(c => (
            <div key={c.id} style={{ flex: Number(c.weight) || 0, background: c.color, transition: 'flex 0.3s' }} title={`${c.name}: ${c.weight}%`} />
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onSkip}
          style={{ flex: 1, background: C.inner, color: C.muted, border: 'none', borderRadius: 999, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          Skip
        </button>
        <button onClick={handleSave} disabled={!totalOk}
          style={{ flex: 2, background: totalOk ? 'var(--school-color, #BA0C2F)' : '#2a2f42', color: totalOk ? '#fff' : C.muted, border: 'none', borderRadius: 999, padding: '14px', fontSize: 15, fontWeight: 800, cursor: totalOk ? 'pointer' : 'not-allowed' }}>
          {totalOk ? 'Save & Continue →' : `Weights must = 100% (${total}% now)`}
        </button>
      </div>
    </div>
  )
}

// ─── Done screen ───────────────────────────────────────────────────────────────
function StepDone({ onFinish }) {
  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 10px' }}>You're all set!</h2>
      <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, marginBottom: 24 }}>
        Your curriculum is linked and your gradebook is ready. GradeFlow will auto-pull lessons from your connected curriculum when you haven't created your own.
      </p>
      <div style={{ background: C.inner, borderRadius: 14, padding: '14px 16px', marginBottom: 20, textAlign: 'left' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: 'uppercase', marginBottom: 10 }}>What happens now</div>
        {[
          ['📅', 'Today\'s lessons will auto-load for each class'],
          ['📚', 'AI can pull full lesson plans from your curriculum'],
          ['⚖', 'Gradebook weights apply to every new assignment'],
          ['🔗', 'Connect more tools anytime in Settings → Integrations'],
        ].map(([icon, text]) => (
          <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
            <span style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>{text}</span>
          </div>
        ))}
      </div>
      <button onClick={onFinish}
        style={{ width: '100%', background: 'var(--school-color, #BA0C2F)', color: '#fff', border: 'none', borderRadius: 999, padding: '16px', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>
        Go to Dashboard →
      </button>
    </div>
  )
}

// ─── Getting Started Step ───────────────────────────────────────────────────────
function StepGettingStarted({ onNext, onSkip }) {
  const { currentUser } = useStore()
  const navigate = useNavigate()
  
  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>
          Getting Started with GradeFlow
        </h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', margin: '0 0 32px', lineHeight: 1.5 }}>
          Welcome! Let's get your classroom set up. Here's what we recommend:
        </p>
      </div>
      
      <div style={{ display: 'grid', gap: 16, marginBottom: 32 }}>
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px',
          display: 'flex', alignItems: 'center', gap: 16
        }}>
          <div style={{ 
            width: 48, height: 48, borderRadius: '50%', 
            background: 'rgba(255,255,255,0.2)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 700, color: '#fff', flexShrink: 0
          }}>
            1
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              Add Your Classes
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
              Create periods or import your class roster using CSV, Excel, PDF files, or camera scanning
            </div>
          </div>
        </div>
        
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px',
          display: 'flex', alignItems: 'center', gap: 16
        }}>
          <div style={{ 
            width: 48, height: 48, borderRadius: '50%', 
            background: 'rgba(255,255,255,0.2)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 700, color: '#fff', flexShrink: 0
          }}>
            2
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              Set Up Gradebook
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
              Create assignments and grading categories that align with your teaching style
            </div>
          </div>
        </div>
        
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px',
          display: 'flex', alignItems: 'center', gap: 16
        }}>
          <div style={{ 
            width: 48, height: 48, borderRadius: '50%', 
            background: 'rgba(255,255,255,0.2)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 700, color: '#fff', flexShrink: 0
          }}>
            3
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              Plan Your First Lesson
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
              Use AI to generate TEKS-aligned lesson plans tailored to your students' needs
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ 
        background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '16px', 
        marginBottom: 32, fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center' 
      }}>
        💡 <strong>Tip:</strong> You can always add more classes or update student lists later from your dashboard
      </div>
      
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button onClick={onSkip}
          style={{ 
            background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', 
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, 
            padding: '14px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer' 
          }}>
          Skip Tour
        </button>
        <button onClick={onNext}
          style={{ 
            background: '#fff', color: 'var(--school-color, #BA0C2F)', 
            border: 'none', borderRadius: 12, 
            padding: '14px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer' 
          }}>
          Get Started →
        </button>
      </div>
    </div>
  )
}

// ─── Main export ───────────────────────────────────────────────────────────────
// Rendered after school registration and before first dashboard view.
// Pass onComplete() to navigate to dashboard when done.
export default function CurriculumOnboarding() {
  const { completeOnboarding, lang, setLang, currentUser, setCurrentUser } = useStore()
  const navigate = useNavigate()
  const [step,     setStep]     = useState(0)  // 0=curriculum, 1=gradebook, 2=getting-started, 3=done
  const [subjects, setSubjects] = useState(currentUser?.subjects || []) // Get subjects from previous onboarding
  const t = useT()
  
  console.log('CurriculumOnboarding - currentUser:', currentUser)
  console.log('CurriculumOnboarding - subjects from user:', currentUser?.subjects)
  console.log('CurriculumOnboarding - subjects state:', subjects)
  
  function toggleLang() { setLang(lang === 'en' ? 'es' : 'en') }

  const STEPS = ['Curriculum', 'Gradebook', 'Getting Started', 'Done']

  function finish() {
    console.log('Finishing onboarding - current user:', currentUser)
    
    // Update user to clear onboarding flags
    const updatedUser = {
      ...currentUser,
      needsOnboarding: false,
      isNewAccount: false,
    }
    
    console.log('Updated user:', updatedUser)
    
    // Save to localStorage to persist authentication
    localStorage.setItem('gradeflow_user', JSON.stringify(updatedUser))
    console.log('Saved to localStorage')
    
    // Update store state
    setCurrentUser(updatedUser)
    completeOnboarding()
    
    console.log('Navigating to /teacher')
    
    // Navigate to teacher dashboard immediately
    navigate('/teacher', { replace: true })
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', fontFamily: 'Inter, Arial, sans-serif', color: C.text }}>
      
      {/* Top bar - same as login page */}
      <div style={{ background: BRAND.gradient, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 44px', height: 54 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>⚡ GradeFlow</span>
          <span style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.35)', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.88)', fontWeight: 500 }}>{t('tagline')}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <LangToggle onToggle={toggleLang} />
          {['Features', 'Schools', 'Pricing', 'About'].map(link => (
            <span key={link} style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 600, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}>
              {link}
            </span>
          ))}
        </div>
      </div>

      {/* Progress header */}
      <div style={{ background: 'linear-gradient(135deg, var(--school-color, #BA0C2F) 0%, rgba(0,0,0,0.85) 100%)', padding: '20px 16px 16px' }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 10, fontWeight: 600 }}>
          Step {step + 1} of {STEPS.length} — {STEPS[step]}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? '#fff' : 'rgba(255,255,255,0.25)', transition: 'background 0.3s' }} />
          ))}
        </div>
      </div>

      {/* Step content */}
      <div style={{ padding: '24px 16px' }}>
        {step === 0 && <StepCurriculum subjects={subjects} onNext={() => setStep(1)} onSkip={() => setStep(1)} />}
        {step === 1 && <StepGradebook  onNext={() => setStep(2)} onSkip={() => setStep(2)} />}
        {step === 2 && <StepGettingStarted onNext={() => setStep(3)} onSkip={() => setStep(3)} />}
        {step === 3 && <StepDone onFinish={finish} />}
      </div>
    </div>
  )
}
