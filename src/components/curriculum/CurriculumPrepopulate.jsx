import React, { useState, useEffect } from 'react'
import { useStore } from '../../lib/store'
import { supabase } from '../../lib/supabase'

const C = {
  bg: '#060810', 
  card: '#161923', 
  inner: '#1e2231', 
  text: '#eef0f8',
  muted: '#6b7494', 
  border: '#2a2f42', 
  green: '#22c97a', 
  blue: '#3b7ef4',
  amber: '#f5a623', 
  purple: '#9b6ef5', 
  teal: '#0fb8a0', 
  red: '#f04a4a',
}

function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div style={{ textAlign: 'center', padding: '32px 0' }}>
      <div style={{ 
        width: 36, 
        height: 36, 
        border: `3px solid var(--school-color)`, 
        borderTopColor: 'transparent', 
        borderRadius: '50%', 
        animation: 'spin 0.8s linear infinite', 
        margin: '0 auto 12px' 
      }} />
      <p style={{ color: C.muted, fontSize: 13 }}>{label}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function CurriculumPrepopulate({ isOpen, onClose, onSuccess, classId }) {
  const { user, classes } = useStore()
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)
  
  // Form state
  const [selectedClass, setSelectedClass] = useState(classId || '')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [lessonsPerStandard, setLessonsPerStandard] = useState(1)
  const [skipExisting, setSkipExisting] = useState(true)
  const [dateDistribution, setDateDistribution] = useState('auto') // 'auto' or 'weekly'

  // Get selected class details
  const selectedClassData = classes.find(c => c.id === selectedClass)

  // Initialize form with classId if provided
  useEffect(() => {
    if (classId) {
      setSelectedClass(classId)
      // Set default date range to current semester
      const today = new Date()
      const semesterStart = new Date(today.getFullYear(), today.getMonth() < 6 ? 0 : 6, 1) // Jan or July
      const semesterEnd = new Date(today.getFullYear(), today.getMonth() < 6 ? 5 : 11, 30) // June or Dec
      
      setStartDate(semesterStart.toISOString().split('T')[0])
      setEndDate(semesterEnd.toISOString().split('T')[0])
    }
  }, [classId])

  // Calculate preview when form changes
  useEffect(() => {
    if (selectedClass && startDate && endDate) {
      calculatePreview()
    } else {
      setPreview(null)
    }
  }, [selectedClass, startDate, endDate, lessonsPerStandard, skipExisting])

  const calculatePreview = async () => {
    if (!selectedClass || !startDate || !endDate) return

    try {
      // Get matching standards count
      const { data: standards, error: standardsError } = await supabase
        .from('standards_catalog')
        .select('id')
        .eq('subject', selectedClassData?.subject)
        .contains('grade_levels', [selectedClassData?.grade_level])

      if (standardsError) {
        console.error('Error fetching standards:', standardsError)
        return
      }

      const standardsCount = standards?.length || 0
      const totalLessons = standardsCount * lessonsPerStandard

      // Calculate school days
      const start = new Date(startDate)
      const end = new Date(endDate)
      let schoolDays = 0
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay()
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude weekends
          schoolDays++
        }
      }

      setPreview({
        standardsCount,
        totalLessons,
        schoolDays,
        dateRange: `${startDate} to ${endDate}`,
        className: selectedClassData?.subject || 'Unknown',
        gradeLevel: selectedClassData?.grade_level || 'Unknown'
      })

    } catch (err) {
      console.error('Preview calculation error:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/curriculum/prepopulate-lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`
        },
        body: JSON.stringify({
          teacher_id: user?.id,
          class_id: selectedClass,
          start_date: startDate,
          end_date: endDate,
          lessons_per_standard: lessonsPerStandard,
          skip_existing: skipExisting
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to prepopulate lessons')
      }

      // Success
      onSuccess?.(data)
      onClose()
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = selectedClass && startDate && endDate && !loading

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: C.card,
        borderRadius: '12px',
        padding: '24px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: `1px solid ${C.border}`
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: C.text, fontSize: '20px', fontWeight: '600', margin: 0 }}>
            Populate from Curriculum
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: C.muted,
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        {loading ? (
          <LoadingSpinner label="Creating lesson shells..." />
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Class Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: C.text, fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Class *
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: C.inner,
                  border: `1px solid ${C.border}`,
                  borderRadius: '6px',
                  color: C.text,
                  fontSize: '14px'
                }}
                required
              >
                <option value="">Select a class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.subject} - {cls.grade_level} (Period {cls.period})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', color: C.text, fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Start Date *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: C.inner,
                    border: `1px solid ${C.border}`,
                    borderRadius: '6px',
                    color: C.text,
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', color: C.text, fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  End Date *
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: C.inner,
                    border: `1px solid ${C.border}`,
                    borderRadius: '6px',
                    color: C.text,
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
            </div>

            {/* Lessons per Standard */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: C.text, fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Lessons per Standard
              </label>
              <select
                value={lessonsPerStandard}
                onChange={(e) => setLessonsPerStandard(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: C.inner,
                  border: `1px solid ${C.border}`,
                  borderRadius: '6px',
                  color: C.text,
                  fontSize: '14px'
                }}
              >
                <option value={1}>1 lesson per standard</option>
                <option value={2}>2 lessons per standard</option>
                <option value={3}>3 lessons per standard</option>
                <option value={4}>4 lessons per standard</option>
                <option value={5}>5 lessons per standard</option>
              </select>
            </div>

            {/* Skip Existing */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', color: C.text, fontSize: '14px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={skipExisting}
                  onChange={(e) => setSkipExisting(e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                Skip existing lessons (don't overwrite)
              </label>
            </div>

            {/* Preview */}
            {preview && (
              <div style={{
                backgroundColor: C.inner,
                border: `1px solid ${C.border}`,
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: C.text, fontSize: '16px', fontWeight: '600', margin: '0 0 12px 0' }}>
                  Preview
                </h3>
                <div style={{ color: C.muted, fontSize: '13px', lineHeight: '1.5' }}>
                  <div><strong>Class:</strong> {preview.className} - {preview.gradeLevel}</div>
                  <div><strong>Date Range:</strong> {preview.dateRange}</div>
                  <div><strong>Standards Found:</strong> {preview.standardsCount}</div>
                  <div><strong>Total Lessons:</strong> {preview.totalLessons}</div>
                  <div><strong>School Days Available:</strong> {preview.schoolDays}</div>
                  {preview.totalLessons > preview.schoolDays && (
                    <div style={{ color: C.red, marginTop: '8px' }}>
                      ⚠️ Not enough school days for all lessons
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                backgroundColor: `${C.red}20`,
                border: `1px solid ${C.red}`,
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '20px',
                color: C.red,
                fontSize: '13px'
              }}>
                {error}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  border: `1px solid ${C.border}`,
                  borderRadius: '6px',
                  color: C.muted,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canSubmit || (preview && preview.totalLessons > preview.schoolDays)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: canSubmit && (!preview || preview.totalLessons <= preview.schoolDays) ? C.blue : C.muted,
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  cursor: canSubmit && (!preview || preview.totalLessons <= preview.schoolDays) ? 'pointer' : 'not-allowed',
                  fontWeight: '500'
                }}
              >
                Create Lesson Shells
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
