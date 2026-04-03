import React, { useState, useEffect } from 'react'
import { useStore } from '../lib/store'
import { useT } from '../lib/i18n'

const C = {
  bg: '#060810', card: '#161923', inner: '#1e2231', text: '#eef0f8',
  muted: '#6b7494', border: '#2a2f42', green: '#22c97a', blue: '#3b7ef4',
  red: '#f04a4a', amber: '#f5a623', teal: '#0fb8a0', purple: '#9b6ef5',
}

// ─── Step 1: School Selection (Searchable Autocomplete) ───────────────────────────────
function StepSchoolSelection({ selectedSchool, setSelectedSchool, schools, onNext }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredSchools, setFilteredSchools] = useState(schools)
  const [isOpen, setIsOpen] = useState(false)
  
  // Filter schools based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSchools(schools.slice(0, 10)) // Show first 10 when no search
    } else {
      const filtered = schools.filter(school => 
        school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.address?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredSchools(filtered)
    }
  }, [searchQuery, schools])
  
  function handleSchoolSelect(school) {
    setSelectedSchool(school)
    setSearchQuery(school.name)
    setIsOpen(false)
  }
  
  function handleInputChange(value) {
    setSearchQuery(value)
    setIsOpen(true)
    if (selectedSchool && !value.includes(selectedSchool.name)) {
      setSelectedSchool(null)
    }
  }
  
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px' }}>
        Select your school
      </h2>
      <p style={{ color: C.muted, fontSize: 13, margin: '0 0 20px' }}>
        Start typing your school name to search. This will determine your grade levels, subjects, and school colors.
      </p>
      
      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <input
          type="text"
          value={searchQuery}
          onChange={e => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="e.g. Kennedy High School, Bellaire High School..."
          style={{
            width: '100%',
            padding: '12px 16px',
            border: `2px solid ${selectedSchool ? C.teal : C.border}`,
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 500,
            color: C.text,
            background: C.inner,
            outline: 'none',
            transition: 'border-color 0.15s'
          }}
        />
        
        {/* Search Icon */}
        <div style={{
          position: 'absolute',
          right: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          color: C.muted,
          fontSize: 16
        }}>
          🔍
        </div>
        
        {/* Dropdown Results */}
        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            marginTop: 8,
            maxHeight: 300,
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            {filteredSchools.length > 0 ? (
              filteredSchools.map(school => (
                <button
                  key={school.id}
                  onClick={() => handleSchoolSelect(school)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    transition: 'background-color 0.15s',
                    borderBottom: `1px solid ${C.border}`
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = C.inner}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: school.primary_color || 'var(--school-color, #BA0C2F)',
                    flexShrink: 0
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: C.text,
                      marginBottom: 2
                    }}>
                      {school.name}
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: C.muted
                    }}>
                      {school.address}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                color: C.muted,
                fontSize: 13
              }}>
                No schools found matching "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Selected School Display */}
      {selectedSchool && (
        <div style={{
          background: `${C.teal}18`,
          border: `1px solid ${C.teal}40`,
          borderRadius: 12,
          padding: '16px',
          marginBottom: 24
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: selectedSchool.primary_color
            }} />
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 14,
                fontWeight: 700,
                color: C.text,
                marginBottom: 4
              }}>
                {selectedSchool.name}
              </div>
              <div style={{
                fontSize: 11,
                color: C.muted
              }}>
                {selectedSchool.grade_levels?.slice(0, 3).join(', ')}{selectedSchool.grade_levels?.length > 3 ? '...' : ''}
              </div>
            </div>
            <div style={{
              fontSize: 12,
              color: C.teal,
              fontWeight: 700
            }}>
              ✓ Selected
            </div>
          </div>
        </div>
      )}
      
      <button onClick={onNext} disabled={!selectedSchool}
        style={{ 
          width: '100%', background: selectedSchool ? 'var(--school-color, #BA0C2F)' : '#2a2f42', 
          color: selectedSchool ? '#fff' : C.muted, border: 'none', borderRadius: 999, 
          padding: '14px', fontSize: 15, fontWeight: 800, cursor: selectedSchool ? 'pointer' : 'not-allowed' 
        }}>
        Next →
      </button>
    </div>
  )
}

// ─── Step 2: Grade Level Selection (School-Specific) ───────────────────────────────
function StepGradeLevel({ gradeLevel, setGradeLevel, onNext, selectedSchool }) {
  const t = useT()
  
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <button onClick={() => window.history.back()} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 18, padding: 0, lineHeight: 1 }}>
          ←
        </button>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px' }}>
            What grade level do you teach?
          </h2>
          <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>
            Select your primary grade level at {selectedSchool?.name || 'your school'}. You can update this later.
          </p>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginBottom: 24 }}>
        {selectedSchool?.grade_levels?.map(grade => (
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

// ─── Step 3: Subject Selection (School-Specific) ───────────────────────────────────
function StepSubjects({ subjects, setSubjects, onNext, onBack, selectedSchool }) {
  const t = useT()
  
  function toggle(subject) {
    setSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(x => x !== subject) 
        : [...prev, subject]
    )
  }
  
  // Group subjects by category for better organization
  const subjectCategories = {
    'Math': selectedSchool?.subjects?.filter(s => s.includes('Algebra') || s.includes('Geometry') || s.includes('Trigonometry') || s.includes('Calculus') || s.includes('Pre-Calculus') || s === 'Math' || s === 'Pre-Algebra'),
    'English/Language Arts': selectedSchool?.subjects?.filter(s => s.includes('English') || s.includes('Reading') || s.includes('Writing') || s.includes('ELA')),
    'Science': selectedSchool?.subjects?.filter(s => s.includes('Biology') || s.includes('Chemistry') || s.includes('Physics') || s.includes('Science') || s.includes('Environmental')),
    'Social Studies': selectedSchool?.subjects?.filter(s => s.includes('History') || s.includes('Government') || s.includes('Economics') || s.includes('Social Studies')),
    'World Languages': selectedSchool?.subjects?.filter(s => s.includes('Spanish') || s.includes('French') || s.includes('Language')),
    'Electives': selectedSchool?.subjects?.filter(s => s.includes('Art') || s.includes('Music') || s.includes('PE') || s.includes('Health') || s.includes('Computer'))
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
            Select all subjects you teach at {selectedSchool?.name || 'your school'}. You can change this later.
          </p>
        </div>
      </div>
      
      {Object.entries(subjectCategories).map(([category, categorySubjects]) => (
        categorySubjects.length > 0 && (
          <div key={category} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 8 }}>
              {category}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {categorySubjects.map(subject => (
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
          </div>
        )
      ))}
      
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button onClick={onBack}
          style={{ 
            flex: 1, background: C.inner, color: C.muted, border: 'none', 
            borderRadius: 999, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer' 
          }}>
          Back
        </button>
        <button onClick={onNext} disabled={!subjects.length}
          style={{ 
            flex: 2, background: subjects.length ? 'var(--school-color, #BA0C2F)' : '#2a2f42', 
            color: subjects.length ? '#fff' : C.muted, border: 'none', borderRadius: 999, 
            padding: '14px', fontSize: 15, fontWeight: 800, cursor: subjects.length ? 'pointer' : 'not-allowed' 
          }}>
          Complete Setup →
        </button>
      </div>
    </div>
  )
}

// ─── Teacher Onboarding Component ─────────────────────────────────────────────────────
export default function TeacherOnboarding({ onComplete }) {
  const { currentUser, setCurrentUser, schools } = useStore()
  const [step, setStep] = useState(0)
  const [selectedSchool, setSelectedSchool] = useState(null)
  const [gradeLevel, setGradeLevel] = useState('')
  const [subjects, setSubjects] = useState([])
  
  const STEPS = ['School', 'Grade Level', 'Subjects']
  
  function handleComplete() {
    // Update teacher profile with selected school, grade level and subjects
    const updatedUser = {
      ...currentUser,
      school_id: selectedSchool.id, // Update school_id from user selection
      school: selectedSchool.name,   // Update school name from user selection
      gradeLevel,
      subjects,
      profileComplete: true,
      // Apply theme from selected school
      theme: {
        primary: selectedSchool.primary_color,
        secondary: selectedSchool.secondary_color,
        accent: selectedSchool.accent_color
      }
    }
    
    setCurrentUser(updatedUser)
    localStorage.setItem('gradeflow_user', JSON.stringify(updatedUser))
    
    // Apply CSS variables immediately for theme change
    document.documentElement.style.setProperty('--school-color', selectedSchool.primary_color)
    document.documentElement.style.setProperty('--school-secondary', selectedSchool.secondary_color)
    document.documentElement.style.setProperty('--school-accent', selectedSchool.accent_color)
    
    // Save to store for future reference
    useStore.setState({
      teacherProfile: {
        gradeLevel,
        subjects,
        school: selectedSchool.name,
        school_id: selectedSchool.id,
        name: currentUser.name
      }
    })
    
    onComplete()
  }
  
  if (!schools.length) {
    return (
      <div style={{
        minHeight: '100vh', background: C.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Inter, Arial, sans-serif', color: C.text,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>⚡</div>
          <div style={{ fontSize: 18, marginBottom: 32 }}>Loading school information...</div>
        </div>
      </div>
    )
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
            <StepSchoolSelection 
              selectedSchool={selectedSchool}
              setSelectedSchool={setSelectedSchool}
              schools={schools}
              onNext={() => setStep(1)}
            />
          )}
          
          {step === 1 && (
            <StepGradeLevel 
              gradeLevel={gradeLevel}
              setGradeLevel={setGradeLevel}
              onNext={() => setStep(2)}
              selectedSchool={selectedSchool}
            />
          )}
          
          {step === 2 && (
            <StepSubjects 
              subjects={subjects}
              setSubjects={setSubjects}
              onNext={handleComplete}
              onBack={() => setStep(1)}
              selectedSchool={selectedSchool}
            />
          )}
        </div>
      </div>
    </div>
  )
}
