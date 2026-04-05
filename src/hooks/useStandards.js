// React hook for educational standards
import { useState, useEffect, useMemo } from 'react'
import { getStandardsForGradeSubject, searchStandards, getRecommendedStandards } from '../lib/standards'

export function useStandards({ subject, grade, searchQuery, topic, schoolName } = {}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Load standards based on subject, grade, and school district
  const [standards, setStandards] = useState([])
  
  useEffect(() => {
    if (!subject || !grade) {
      console.log('useStandards: Missing subject or grade', { subject, grade })
      setStandards([])
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      console.log('useStandards: Calling getStandardsForGradeSubject', { subject, grade, schoolName })
      const standardsData = getStandardsForGradeSubject(subject, grade, schoolName)
      console.log('useStandards: Received standards data', standardsData)
      setStandards(standardsData)
    } catch (err) {
      setError(err.message || 'Failed to load standards')
      console.error('Standards loading error:', err)
    } finally {
      setLoading(false)
    }
  }, [subject, grade, schoolName])
  
  // Filter standards by search query
  const filteredStandards = useMemo(() => {
    if (!searchQuery || searchQuery.trim() === '') return standards
    return searchStandards(subject, grade, searchQuery, schoolName)
  }, [standards, searchQuery, subject, grade, schoolName])
  
  // Get recommended standards for topic
  const recommendedStandards = useMemo(() => {
    if (!topic || !subject || !grade) return []
    return getRecommendedStandards(subject, grade, topic, schoolName)
  }, [topic, subject, grade, schoolName])
  
  // Group standards by cluster
  const standardsByCluster = useMemo(() => {
    return filteredStandards.reduce((clusters, standard) => {
      const cluster = standard.cluster || 'General'
      if (!clusters[cluster]) {
        clusters[cluster] = []
      }
      clusters[cluster].push(standard)
      return clusters
    }, {})
  }, [filteredStandards])
  
  return {
    standards: filteredStandards,
    allStandards: standards,
    standardsByCluster,
    recommendedStandards,
    loading,
    error,
    hasData: standards.length > 0,
    hasRecommendations: recommendedStandards.length > 0
  }
}
