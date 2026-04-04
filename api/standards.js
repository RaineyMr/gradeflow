// api/standards.js
// ─── GradeFlow Standards Search API ─────────────────────────────────────────────
// Handles searching TEKS/Common Core standards with multiple filters

import { supabase } from '../lib/supabase'

// ── Helper Functions ───────────────────────────────────────────────────────
function handleApiError(res, error, message, statusCode = 500) {
  console.error('Standards API Error:', error)
  return res.status(statusCode).json({ 
    error: message || 'Internal server error',
    details: error.message 
  })
}

// ── Main Handler ───────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      query = '',
      source = '',
      gradeLevel = '',
      subject = '',
      limit = 20,
      offset = 0
    } = req.query
    
    // Build search query
    let dbQuery = supabase
      .from('standards_catalog')
      .select('*')
    
    // Apply filters
    if (source) {
      dbQuery = dbQuery.eq('standard_source', source.toUpperCase())
    }
    
    if (gradeLevel) {
      // Handle array of grade levels
      const grades = Array.isArray(gradeLevel) ? gradeLevel : [gradeLevel]
      dbQuery = dbQuery.contains('grade_levels', grades)
    }
    
    if (subject) {
      dbQuery = dbQuery.eq('subject', subject)
    }
    
    // Text search across multiple fields
    if (query && query.trim() !== '') {
      const searchTerm = query.trim().toLowerCase()
      
      dbQuery = dbQuery.or([
        `standard_id.ilike.%${searchTerm}%`,  // Code search
        `standard_label.ilike.%${searchTerm}%`, // Description search
        `keywords.cs.{${searchTerm}}` // Keywords array search
      ])
    }
    
    // Execute query with pagination
    const { data: standards, error } = await dbQuery
      .order('standard_source, { ascending: true })
      .order('grade_levels', { ascending: true })
      .order('subject', { ascending: true })
      .order('standard_id', { ascending: true })
      .range(parseInt(offset), parseInt(limit))
    
    if (error) throw error
    
    // Group results by source for better frontend handling
    const groupedStandards = standards.reduce((acc, standard) => {
      const source = standard.standard_source
      if (!acc[source]) {
        acc[source] = {
          source,
          description: getSourceDescription(source),
          standards: []
        }
      }
      acc[source].standards.push(standard)
      return acc
    }, {})
    
    return res.status(200).json({
      standards: Object.values(groupedStandards),
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: standards.length === parseInt(limit),
        total: standards.length
      },
      filters: {
        query,
        source,
        gradeLevel,
        subject
      }
    })
    
  } catch (error) {
    return handleApiError(res, error, 'Failed to search standards')
  }
}

// ── Helper Functions ───────────────────────────────────────────────────────
function getSourceDescription(source) {
  const descriptions = {
    'TEKS': 'Texas Essential Knowledge and Skills',
    'LSS': 'Louisiana Student Standards',
    'COMMON': 'Common Core/National Standards',
    'State': 'State Standards',
    'District': 'District Standards',
    'Custom': 'Custom Standards'
  }
  return descriptions[source] || source
}
