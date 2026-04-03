import React, { useState } from 'react'
import { useStore } from '../lib/store'
import { useT } from '../lib/i18n'

const C = {
  bg: '#060810', card: '#161923', inner: '#1e2231', text: '#eef0f8',
  muted: '#6b7494', border: '#2a2f42', green: '#22c97a', blue: '#3b7ef4',
  red: '#f04a4a', amber: '#f5a623', teal: '#0fb8a0', purple: '#9b6ef5',
}

// Grade levels a teacher might select
const GRADE_LEVELS = [
  'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade',
  '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade',
  'Multi-Grade', 'Special Education', 'Adult Education'
]

// Subjects a teacher might select
const SUBJECTS = [
  'Math', 'Reading', 'ELA', 'Science', 'Writing', 'Social Studies', 'History',
  'Art', 'Music', 'PE', 'Computer Science', 'Foreign Language', 'Special Education',
  'Other'
]

// ─── Step 1: Grade Level Selection ────────────────────────────────────────────────
function StepGradeLevel({ gradeLevel, setGradeLevel, onNext }) {
  const t = useT()
  
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px' }}>
        What grade level do you teach?
      </h2>
      <p style={{ color: C.muted, fontSize: 13, margin: '0 0 20px' }}>
        Select your primary grade level. You can update this later.
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginBottom: 24 }}>
        {GRADE_LEVELS.map(grade => (
          <button key={grade} onClick={() => setGradeLevel(grade)}
            style={{ 
              padding: '12px 16px', borderRadius: 12, border: `2px solid ${gradeLevel === grade ? C.teal : C.border}`, 
              cursor: 'pointer', fontSize: 13, fontWeight: 700, transition: 'all 0.15s',
              background: gradeLevel === grade ? `${C.teal}18` : C.inner,
              color: gradeLevel === grade ? C.teal : C.muted,
              textAlign: 'left'
            }}>
            {gradeLevel === grade ? '✓ ' : ''}{grade}
          </button>
        ))}
      </div>
      
      <button onClick={onNext} disabled={!gradeLevel}
        style={{ 
          width: '100%', background: gradeLevel ? 'var(--school-color, #BA0C2F)' : '#2a2f42', 
          color: gradeLevel ? '#fff' : C.muted, border: 'none', borderRadius: 999, 
          padding: '14px', fontSize: 15, fontWeight: 800, cursor: gradeLevel ? 'pointer' : 'not-allowed' 
        }}>
        Next →
      </button>
    </div>
  )
}

// ─── Step 2: Subject Selection ───────────────────────────────────────────────────
function StepSubjects({ subjects, setSubjects, onNext, onBack }) {
  const t = useT()
  
  function toggle(subject) {
    setSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(x => x !== subject) 
        : [...prev, subject]
    )
  }
  
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 18, padding: 0, lineHeight: 1 }}>
          ←
        </button>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px' }}>
            What subjects do you teach?
          </h2>
          <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>
            Select all subjects you teach. You can change this later.
          </p>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {SUBJECTS.map(subject => (
          <button key={subject} onClick={() => toggle(subject)}
            style={{ 
              padding: '9px 16px', borderRadius: 999, border: `2px solid ${subjects.includes(subject) ? C.teal : C.border}`, 
              cursor: 'pointer', fontSize: 13, fontWeight: 700, transition: 'all 0.15s',
              background: subjects.includes(subject) ? `${C.teal}18` : C.inner,
              color: subjects.includes(subject) ? C.teal : C.muted 
            }}>
            {subjects.includes(subject) ? '✓ ' : ''}{subject}
          </button>
        ))}
      </div>
      
      <button onClick={onNext} disabled={!subjects.length}
        style={{ 
          width: '100%', background: subjects.length ? 'var(--school-color, #BA0C2F)' : '#2a2f42', 
          color: subjects.length ? '#fff' : C.muted, border: 'none', borderRadius: 999, 
          padding: '14px', fontSize: 15, fontWeight: 800, cursor: subjects.length ? 'pointer' : 'not-allowed' 
        }}>
        Complete Setup →
      </button>
    </div>
  )
}

// ─── Teacher Onboarding Component ─────────────────────────────────────────────────────
export default function TeacherOnboarding({ onComplete }) {
  const { currentUser, setCurrentUser } = useStore()
  const [step, setStep] = useState(0)
  const [gradeLevel, setGradeLevel] = useState('')
  const [subjects, setSubjects] = useState([])
  
  const STEPS = ['Grade Level', 'Subjects']
  
  function handleComplete() {
    // Update teacher profile with selected grade level and subjects
    const updatedUser = {
      ...currentUser,
      gradeLevel,
      subjects,
      profileComplete: true
    }
    
    setCurrentUser(updatedUser)
    localStorage.setItem('gradeflow_user', JSON.stringify(updatedUser))
    
    // Save to store for future reference
    useStore.setState({
      teacherProfile: {
        gradeLevel,
        subjects,
        school: currentUser.school,
        school_id: currentUser.school_id,
        name: currentUser.name
      }
    })
    
    onComplete()
  }
  
  return (
    <div style={{
      minHeight: '100vh', background: C.bg,
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, Arial, sans-serif', color: C.text,
    }}>
      {/* Top bar */}
      <div style={{ 
        background: 'var(--school-color, #BA0C2F)', height: 54, 
        display: 'flex', alignItems: 'center', padding: '0 32px' 
      }}>
        <span style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>
          ⚡ GradeFlow
        </span>
        <div style={{ flex: 1, textAlign: 'center', color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600 }}>
          Teacher Setup - Step {step + 1} of {STEPS.length}
        </div>
      </div>

      {/* Content */}
      <div style={{ 
        flex: 1, display: 'flex', alignItems: 'flex-start', 
        justifyContent: 'center', padding: '40px 24px', overflowY: 'auto' 
      }}>
        <div style={{ 
          width: '100%', maxWidth: 600, background: C.card, 
          border: `1px solid ${C.border}`, borderRadius: 22, 
          padding: '36px 40px' 
        }}>
          {step === 0 && (
            <StepGradeLevel 
              gradeLevel={gradeLevel}
              setGradeLevel={setGradeLevel}
              onNext={() => setStep(1)}
            />
          )}
          
          {step === 1 && (
            <StepSubjects 
              subjects={subjects}
              setSubjects={setSubjects}
              onNext={handleComplete}
              onBack={() => setStep(0)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
