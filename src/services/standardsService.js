// Standards Service
// Handles loading, filtering, and managing educational standards based on school, grade, subject, and curriculum

import { 
  STANDARDS_SYSTEMS, 
  SCHOOL_STANDARDS_MAPPING, 
  TEKS_STANDARDS, 
  LOUISIANA_STANDARDS, 
  COMMON_STANDARDS 
} from '../data/standards.js'

export class StandardsService {
  constructor() {
    this.cachedStandards = new Map()
    this.curriculumMapping = new Map()
  }

  /**
   * Get the standards system for a given school
   * @param {Object} school - School object with district_id
   * @returns {string} Standards system key (TEKS, LSS, COMMON)
   */
  getStandardsSystem(school) {
    const districtId = school?.district_id || school?.id || 'default'
    return SCHOOL_STANDARDS_MAPPING[districtId] || SCHOOL_STANDARDS_MAPPING['default']
  }

  /**
   * Get standards for a specific teacher profile
   * @param {Object} teacherProfile - Teacher profile with school, gradeLevel, subjects
   * @returns {Array} Filtered standards
   */
  getStandardsForTeacher(teacherProfile) {
    const { school, gradeLevel, subjects } = teacherProfile
    const standardsSystem = this.getStandardsSystem(school)
    
    const allStandards = []
    
    for (const subject of subjects) {
      const subjectStandards = this.getStandardsByGradeSubject(gradeLevel, subject, standardsSystem)
      allStandards.push(...subjectStandards)
    }
    
    return allStandards
  }

  /**
   * Get standards filtered by grade, subject, and curriculum
   * @param {string} grade - Grade level (e.g., '3rd Grade')
   * @param {string} subject - Subject (e.g., 'Math', 'Reading')
   * @param {string} standardsSystem - Standards system (TEKS, LSS, COMMON)
   * @param {Array} connectedCurriculum - Connected curriculum IDs
   * @returns {Array} Filtered standards
   */
  getStandardsByGradeSubject(grade, subject, standardsSystem, connectedCurriculum = []) {
    const cacheKey = `${grade}-${subject}-${standardsSystem}-${connectedCurriculum.join(',')}`
    
    if (this.cachedStandards.has(cacheKey)) {
      return this.cachedStandards.get(cacheKey)
    }

    let standardsData
    switch (standardsSystem) {
      case 'TEKS':
        standardsData = TEKS_STANDARDS
        break
      case 'LSS':
        standardsData = LOUISIANA_STANDARDS
        break
      default:
        standardsData = COMMON_STANDARDS
    }

    const gradeSubjectKey = `${subject}-${grade}`
    let standards = standardsData[gradeSubjectKey]?.standards || []

    // Filter by connected curriculum if provided
    if (connectedCurriculum.length > 0) {
      standards = standards.filter(standard => 
        standard.curriculum.some(curriculum => connectedCurriculum.includes(curriculum))
      )
    }

    // Add metadata
    standards = standards.map(standard => ({
      ...standard,
      standardsSystem,
      grade,
      subject,
      systemInfo: STANDARDS_SYSTEMS[standardsSystem]
    }))

    this.cachedStandards.set(cacheKey, standards)
    return standards
  }

  /**
   * Get standards by cluster/grouping
   * @param {Array} standards - Array of standards
   * @returns {Object} Standards grouped by cluster
   */
  getStandardsByCluster(standards) {
    return standards.reduce((clusters, standard) => {
      const cluster = standard.cluster || 'General'
      if (!clusters[cluster]) {
        clusters[cluster] = []
      }
      clusters[cluster].push(standard)
      return clusters
    }, {})
  }

  /**
   * Get standards by difficulty level
   * @param {Array} standards - Array of standards
   * @returns {Object} Standards grouped by difficulty
   */
  getStandardsByDifficulty(standards) {
    return standards.reduce((difficulties, standard) => {
      const difficulty = standard.difficulty || 'General'
      if (!difficulties[difficulty]) {
        difficulties[difficulty] = []
      }
      difficulties[difficulty].push(standard)
      return difficulties
    }, {})
  }

  /**
   * Search standards by keyword
   * @param {Array} standards - Array of standards to search
   * @param {string} query - Search query
   * @returns {Array} Matching standards
   */
  searchStandards(standards, query) {
    if (!query || query.trim() === '') return standards
    
    const searchTerm = query.toLowerCase()
    return standards.filter(standard => 
      standard.code.toLowerCase().includes(searchTerm) ||
      standard.description.toLowerCase().includes(searchTerm) ||
      standard.cluster.toLowerCase().includes(searchTerm)
    )
  }

  /**
   * Get recommended standards for a lesson topic
   * @param {string} grade - Grade level
   * @param {string} subject - Subject
   * @param {string} topic - Lesson topic (e.g., 'Fractions', 'Photosynthesis')
   * @param {string} standardsSystem - Standards system
   * @returns {Array} Recommended standards
   */
  getRecommendedStandards(grade, subject, topic, standardsSystem) {
    const allStandards = this.getStandardsByGradeSubject(grade, subject, standardsSystem)
    
    // Simple keyword matching for recommendations
    const topicKeywords = topic.toLowerCase().split(' ')
    
    return allStandards
      .map(standard => {
        let relevanceScore = 0
        const description = standard.description.toLowerCase()
        
        // Calculate relevance based on keyword matches
        topicKeywords.forEach(keyword => {
          if (description.includes(keyword)) {
            relevanceScore += 1
          }
        })
        
        // Bonus for cluster matches
        if (standard.cluster.toLowerCase().includes(topic.toLowerCase())) {
          relevanceScore += 2
        }
        
        return { ...standard, relevanceScore }
      })
      .filter(standard => standard.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5) // Top 5 recommendations
  }

  /**
   * Get standards coverage for a curriculum
   * @param {string} curriculumId - Curriculum ID
   * @param {string} grade - Grade level
   * @param {string} subject - Subject
   * @param {string} standardsSystem - Standards system
   * @returns {Object} Coverage analysis
   */
  getCurriculumCoverage(curriculumId, grade, subject, standardsSystem) {
    const allStandards = this.getStandardsByGradeSubject(grade, subject, standardsSystem)
    const curriculumStandards = allStandards.filter(standard => 
      standard.curriculum.includes(curriculumId)
    )
    
    const totalStandards = allStandards.length
    const coveredStandards = curriculumStandards.length
    const coveragePercentage = totalStandards > 0 ? (coveredStandards / totalStandards) * 100 : 0
    
    return {
      curriculumId,
      grade,
      subject,
      totalStandards,
      coveredStandards,
      coveragePercentage,
      coveredClusters: [...new Set(curriculumStandards.map(s => s.cluster))],
      missingClusters: [...new Set(allStandards.map(s => s.cluster))]
        .filter(cluster => !curriculumStandards.some(s => s.cluster === cluster))
    }
  }

  /**
   * Get standards progression across grades
   * @param {string} subject - Subject
   * @param {string} cluster - Standards cluster
   * @param {string} standardsSystem - Standards system
   * @returns {Array} Standards progression by grade
   */
  getStandardsProgression(subject, cluster, standardsSystem) {
    let standardsData
    switch (standardsSystem) {
      case 'TEKS':
        standardsData = TEKS_STANDARDS
        break
      case 'LSS':
        standardsData = LOUISIANA_STANDARDS
        break
      default:
        standardsData = COMMON_STANDARDS
    }

    const progression = []
    const grades = ['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', 
                   '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade']

    grades.forEach(grade => {
      const gradeSubjectKey = `${subject}-${grade}`
      const gradeStandards = standardsData[gradeSubjectKey]?.standards || []
      const clusterStandards = gradeStandards.filter(standard => 
        standard.cluster === cluster
      )
      
      if (clusterStandards.length > 0) {
        progression.push({
          grade,
          standards: clusterStandards,
          count: clusterStandards.length
        })
      }
    })

    return progression
  }

  /**
   * Clear cached standards
   */
  clearCache() {
    this.cachedStandards.clear()
  }

  /**
   * Get all available grades for a subject in a standards system
   * @param {string} subject - Subject
   * @param {string} standardsSystem - Standards system
   * @returns {Array} Available grades
   */
  getAvailableGrades(subject, standardsSystem) {
    let standardsData
    switch (standardsSystem) {
      case 'TEKS':
        standardsData = TEKS_STANDARDS
        break
      case 'LSS':
        standardsData = LOUISIANA_STANDARDS
        break
      default:
        standardsData = COMMON_STANDARDS
    }

    const grades = new Set()
    Object.keys(standardsData).forEach(key => {
      if (key.startsWith(subject)) {
        const grade = standardsData[key].grade
        grades.add(grade)
      }
    })

    return Array.from(grades).sort((a, b) => {
      // Sort by grade level numerically
      const gradeOrder = ['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade',
                         '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade']
      return gradeOrder.indexOf(a) - gradeOrder.indexOf(b)
    })
  }

  /**
   * Get all available subjects in a standards system
   * @param {string} standardsSystem - Standards system
   * @returns {Array} Available subjects
   */
  getAvailableSubjects(standardsSystem) {
    let standardsData
    switch (standardsSystem) {
      case 'TEKS':
        standardsData = TEKS_STANDARDS
        break
      case 'LSS':
        standardsData = LOUISIANA_STANDARDS
        break
      default:
        standardsData = COMMON_STANDARDS
    }

    const subjects = new Set()
    Object.values(standardsData).forEach(gradeData => {
      subjects.add(gradeData.subject)
    })

    return Array.from(subjects).sort()
  }
}

// Create singleton instance
export const standardsService = new StandardsService()

// Export convenience functions
export const getStandardsForTeacher = (teacherProfile) => 
  standardsService.getStandardsForTeacher(teacherProfile)

export const getStandardsByGradeSubject = (grade, subject, standardsSystem, connectedCurriculum) =>
  standardsService.getStandardsByGradeSubject(grade, subject, standardsSystem, connectedCurriculum)

export const getRecommendedStandards = (grade, subject, topic, standardsSystem) =>
  standardsService.getRecommendedStandards(grade, subject, topic, standardsSystem)
