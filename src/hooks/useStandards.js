// React hook for educational standards
// Provides easy access to TEKS/Louisiana standards for components

import { useState, useEffect, useMemo } from 'react'
import { useStore } from '../lib/store'
import { standardsService } from '../services/standardsService'

export function useStandards(options = {}) {
  const { 
    grade: overrideGrade, 
    subject: overrideSubject, 
    curriculum: overrideCurriculum,
    searchQuery,
    autoLoad = true 
  } = options

  const { currentUser, connectedCurricula } = useStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Get teacher profile data from store or overrides
  const grade = overrideGrade || currentUser?.gradeLevel
  const subject = overrideSubject || currentUser?.subjects?.[0] // Use first subject if not specified
  const connectedCurriculum = overrideCurriculum || Object.keys(connectedCurricula || {})

  // Determine standards system based on school
  const standardsSystem = useMemo(() => {
    if (currentUser?.school) {
      return standardsService.getStandardsSystem(currentUser.school)
    }
    return 'COMMON'
  }, [currentUser?.school])

  // Load standards
  const [standards, setStandards] = useState([])

  useEffect(() => {
    if (!autoLoad || !grade || !subject) return

    const loadStandards = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const standardsData = standardsService.getStandardsByGradeSubject(
          grade, 
          subject, 
          standardsSystem, 
          connectedCurriculum
        )
        setStandards(standardsData)
      } catch (err) {
        setError(err.message || 'Failed to load standards')
        console.error('Standards loading error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadStandards()
  }, [grade, subject, standardsSystem, connectedCurriculum, autoLoad])

  // Filter standards by search query
  const filteredStandards = useMemo(() => {
    if (!searchQuery || searchQuery.trim() === '') return standards
    return standardsService.searchStandards(standards, searchQuery)
  }, [standards, searchQuery])

  // Group standards by cluster
  const standardsByCluster = useMemo(() => {
    return standardsService.getStandardsByCluster(filteredStandards)
  }, [filteredStandards])

  // Group standards by difficulty
  const standardsByDifficulty = useMemo(() => {
    return standardsService.getStandardsByDifficulty(filteredStandards)
  }, [filteredStandards])

  // Get recommended standards for a topic
  const getRecommendedStandards = (topic) => {
    return standardsService.getRecommendedStandards(grade, subject, topic, standardsSystem)
  }

  // Get curriculum coverage analysis
  const getCurriculumCoverage = (curriculumId) => {
    return standardsService.getCurriculumCoverage(curriculumId, grade, subject, standardsSystem)
  }

  // Get standards progression
  const getStandardsProgression = (cluster) => {
    return standardsService.getStandardsProgression(subject, cluster, standardsSystem)
  }

  // Refresh standards data
  const refresh = () => {
    standardsService.clearCache()
    if (grade && subject) {
      const standardsData = standardsService.getStandardsByGradeSubject(
        grade, 
        subject, 
        standardsSystem, 
        connectedCurriculum
      )
      setStandards(standardsData)
    }
  }

  return {
    // Data
    standards: filteredStandards,
    allStandards: standards,
    standardsByCluster,
    standardsByDifficulty,
    
    // Metadata
    standardsSystem,
    systemInfo: standardsService.getStandardsSystem(currentUser?.school),
    grade,
    subject,
    connectedCurriculum,
    
    // State
    loading,
    error,
    hasData: standards.length > 0,
    
    // Methods
    getRecommendedStandards,
    getCurriculumCoverage,
    getStandardsProgression,
    refresh,
    search: (query) => {
      // This will trigger the filteredStandards memo
      return standardsService.searchStandards(standards, query)
    }
  }
}

// Hook for getting all standards for a teacher (multiple subjects)
export function useTeacherStandards() {
  const { currentUser, connectedCurricula } = useStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [allStandards, setAllStandards] = useState([])

  useEffect(() => {
    if (!currentUser?.gradeLevel || !currentUser?.subjects) return

    const loadAllStandards = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const standards = standardsService.getStandardsForTeacher(currentUser)
        setAllStandards(standards)
      } catch (err) {
        setError(err.message || 'Failed to load teacher standards')
        console.error('Teacher standards loading error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAllStandards()
  }, [currentUser])

  return {
    standards: allStandards,
    loading,
    error,
    hasData: allStandards.length > 0,
    refresh: () => {
      standardsService.clearCache()
      if (currentUser) {
        const standards = standardsService.getStandardsForTeacher(currentUser)
        setAllStandards(standards)
      }
    }
  }
}

// Hook for standards recommendations
export function useStandardsRecommendations(topic, options = {}) {
  const { grade, subject, curriculum } = options
  const { currentUser } = useStore()
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)

  const finalGrade = grade || currentUser?.gradeLevel
  const finalSubject = subject || currentUser?.subjects?.[0]
  const standardsSystem = currentUser?.school ? 
    standardsService.getStandardsSystem(currentUser.school) : 'COMMON'

  useEffect(() => {
    if (!topic || !finalGrade || !finalSubject) return

    const loadRecommendations = async () => {
      setLoading(true)
      
      try {
        const recs = standardsService.getRecommendedStandards(
          finalGrade, 
          finalSubject, 
          topic, 
          standardsSystem
        )
        setRecommendations(recs)
      } catch (err) {
        console.error('Standards recommendations error:', err)
        setRecommendations([])
      } finally {
        setLoading(false)
      }
    }

    loadRecommendations()
  }, [topic, finalGrade, finalSubject, standardsSystem])

  return {
    recommendations,
    loading,
    hasRecommendations: recommendations.length > 0
  }
}
