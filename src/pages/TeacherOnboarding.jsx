import React, { useState, useEffect } from 'react'
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

// ─── Unified Teacher Onboarding Form ───────────────────────────────────────────────
export default function TeacherOnboarding() {
  const { currentUser, setCurrentUser, schools, lang, setLang } = useStore()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredSchools, setFilteredSchools] = useState(schools)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState(null)
  const [gradeLevel, setGradeLevel] = useState('')
  const [subjects, setSubjects] = useState([])
  const [error, setError] = useState('')
  const t = useT()
  
  function toggleLang() { setLang(lang === 'en' ? 'es' : 'en') }

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
    setError('')
  }
  
  function handleInputChange(value) {
    setSearchQuery(value)
    setIsOpen(true)
    if (selectedSchool && !value.includes(selectedSchool.name)) {
      setSelectedSchool(null)
    }
    setError('')
  }
  
  function toggleSubject(subject) {
    setSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(x => x !== subject) 
        : [...prev, subject]
    )
    setError('')
  }
  
  function validateForm() {
    if (!selectedSchool) return 'Please select your school'
    if (!gradeLevel) return 'Please select your grade level'
    if (subjects.length === 0) return 'Please select at least one subject'
    return null
  }
  
  function handleSubmit(e) {
    e.preventDefault()
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }
    
    // Update user with school info and clear onboarding flags
    setCurrentUser(currentUser => ({
      ...currentUser,
      school_id: selectedSchool.id,
      school: selectedSchool.name,
      gradeLevel,
      subjects,
      theme: {
        primary: selectedSchool.primary_color,
        secondary: selectedSchool.secondary_color,
        accent: selectedSchool.accent_color,
      },
      needsOnboarding: false,
      isNewAccount: false,
    }))
    
    // Navigate to curriculum onboarding
    navigate('/teacher/curriculum-onboarding')
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
  
  // Group subjects by category for better organization
  const subjectCategories = selectedSchool ? {
    'Math': selectedSchool.subjects?.filter(s => s.includes('Algebra') || s.includes('Geometry') || s.includes('Trigonometry') || s.includes('Calculus') || s.includes('Pre-Calculus') || s === 'Math' || s === 'Pre-Algebra'),
    'English/Language Arts': selectedSchool.subjects?.filter(s => s.includes('English') || s.includes('Reading') || s.includes('Writing') || s.includes('ELA')),
    'Science': selectedSchool.subjects?.filter(s => s.includes('Biology') || s.includes('Chemistry') || s.includes('Physics') || s.includes('Science') || s.includes('Environmental')),
    'Social Studies': selectedSchool.subjects?.filter(s => s.includes('History') || s.includes('Government') || s.includes('Economics') || s.includes('Social Studies')),
    'World Languages': selectedSchool.subjects?.filter(s => s.includes('Spanish') || s.includes('French') || s.includes('Language')),
    'Electives': selectedSchool.subjects?.filter(s => s.includes('Art') || s.includes('Music') || s.includes('PE') || s.includes('Health') || s.includes('Computer'))
  } : {}
  
  return (
    <div style={{
      minHeight: '100vh', background: C.bg,
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, Arial, sans-serif', color: C.text,
    }}>
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
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>
              Complete Your Teacher Profile
            </h2>
            <p style={{ color: C.muted, fontSize: 14, margin: '0 0 32px' }}>
              Select your school, grade level, and subjects to personalize your GradeFlow experience.
            </p>

            {/* School Selection */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ 
                display: 'block', fontSize: 12, fontWeight: 700, 
                color: C.text, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' 
              }}>
                1. Your School
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => handleInputChange(e.target.value)}
                  onFocus={() => setIsOpen(true)}
                  placeholder="e.g. Kennedy High School, Bellaire High School..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `2px solid ${selectedSchool ? C.teal : error && !selectedSchool ? C.red : C.border}`,
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
                    maxHeight: 200,
                    overflowY: 'auto',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}>
                    {filteredSchools.length > 0 ? (
                      filteredSchools.map(school => (
                        <button
                          key={school.id}
                          type="button"
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
            </div>

            {/* Grade Level Selection */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ 
                display: 'block', fontSize: 12, fontWeight: 700, 
                color: C.text, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' 
              }}>
                2. Grade Level
              </label>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                gap: 8 
              }}>
                {selectedSchool?.grade_levels?.map(grade => (
                  <button key={grade} type="button" onClick={() => setGradeLevel(grade)}
                    style={{ 
                      padding: '10px 14px', borderRadius: 8, 
                      border: `2px solid ${gradeLevel === grade ? C.teal : error && !gradeLevel ? C.red : C.border}`, 
                      cursor: 'pointer', fontSize: 13, fontWeight: 700, transition: 'all 0.15s',
                      background: gradeLevel === grade ? `${C.teal}18` : C.inner,
                      color: gradeLevel === grade ? C.teal : C.muted,
                      textAlign: 'left'
                    }}>
                    {gradeLevel === grade ? '✓ ' : ''}{grade}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Selection */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ 
                display: 'block', fontSize: 12, fontWeight: 700, 
                color: C.text, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' 
              }}>
                3. Subjects You Teach
              </label>
              
              {Object.entries(subjectCategories).map(([category, categorySubjects]) => (
                categorySubjects.length > 0 && (
                  <div key={category} style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 8 }}>
                      {category}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {categorySubjects.map(subject => (
                        <button key={subject} type="button" onClick={() => toggleSubject(subject)}
                          style={{ 
                            padding: '8px 14px', borderRadius: 999, border: `2px solid ${subjects.includes(subject) ? C.teal : error && subjects.length === 0 ? C.red : C.border}`, 
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
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                background: `${C.red}18`,
                border: `1px solid ${C.red}40`,
                borderRadius: 8,
                padding: '12px',
                marginBottom: 24,
                fontSize: 13,
                color: C.red,
                fontWeight: 700
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Submit Button */}
            <button type="submit"
              style={{ 
                width: '100%', background: 'var(--school-color, #BA0C2F)', 
                color: '#fff', border: 'none', borderRadius: 999, 
                padding: '16px', fontSize: 16, fontWeight: 800, cursor: 'pointer',
                transition: 'transform 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              Complete Setup →
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
