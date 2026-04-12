// src/components/LessonGeneration.jsx
// Phase 2: On-demand lesson generation UI component
// Features: Standard selector, loading states, error handling, section regeneration

import { useState, useEffect } from 'react'
import { AlertCircle, Loader, CheckCircle, RotateCcw } from 'lucide-react'

export default function LessonGeneration({ classId, teacherId, onLessonGenerated }) {
  const [standards, setStandards] = useState([])
  const [selectedStandard, setSelectedStandard] = useState('')
  const [lessonDate, setLessonDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [generatedLesson, setGeneratedLesson] = useState(null)
  const [regeneratingSection, setRegeneratingSection] = useState(null)

  // Fetch available standards on mount
  useEffect(() => {
    fetchStandards()
  }, [])

  const fetchStandards = async () => {
    try {
      const response = await fetch(
        '/api/standards?subject=Mathematics&grade=5&limit=50'
      )
      const data = await response.json()
      setStandards(data.data || [])
    } catch (err) {
      console.error('Failed to fetch standards:', err)
      setError('Could not load standards')
    }
  }

  const generateLesson = async () => {
    if (!selectedStandard) {
      setError('Please select a standard')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/lessons/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          standardCode: selectedStandard,
          teacherId,
          classId,
          lessonDate,
          section: 'all',
          regenerateOnly: false
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed')
      }

      setSuccess(`Lesson generated: ${data.title}`)
      setGeneratedLesson({
        id: data.lessonId,
        title: data.title,
        tokensUsed: data.tokensUsed
      })

      // Callback to parent component
      if (onLessonGenerated) {
        onLessonGenerated(data.lessonId)
      }
    } catch (err) {
      setError(err.message)
      console.error('Generation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const regenerateSection = async (section) => {
    if (!generatedLesson?.id) {
      setError('No lesson to regenerate')
      return
    }

    setRegeneratingSection(section)
    setError('')

    try {
      const response = await fetch('/api/lessons/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          standardCode: selectedStandard,
          teacherId,
          classId,
          section,
          regenerateOnly: true,
          lessonId: generatedLesson.id
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Regeneration failed')
      }

      setSuccess(`${section} regenerated successfully`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setRegeneratingSection(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Generate Lesson Plan</h2>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-900 font-medium">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-green-900">{success}</p>
        </div>
      )}

      {/* Generation Form */}
      {!generatedLesson && (
        <div className="space-y-4 mb-6">
          {/* Standard Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select TEKS Standard
            </label>
            <select
              value={selectedStandard}
              onChange={(e) => setSelectedStandard(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="">Choose a standard...</option>
              {standards.map((std) => (
                <option key={std.standard_code} value={std.standard_code}>
                  {std.standard_code} - {std.standard_label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lesson Date
            </label>
            <input
              type="date"
              value={lessonDate}
              onChange={(e) => setLessonDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={generateLesson}
            disabled={loading || !selectedStandard}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Generating lesson...
              </>
            ) : (
              'Generate Lesson'
            )}
          </button>
        </div>
      )}

      {/* Generated Lesson Display */}
      {generatedLesson && (
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {generatedLesson.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Tokens used: {generatedLesson.tokensUsed}
              </p>
            </div>
            <button
              onClick={() => {
                setGeneratedLesson(null)
                setSelectedStandard('')
              }}
              className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Generate Another
            </button>
          </div>

          {/* Section Regeneration Buttons */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Regenerate individual sections:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                'objectives',
                'warm_up',
                'direct_instruction',
                'guided_practice',
                'independent_practice',
                'checks_for_understanding',
                'exit_ticket',
                'homework',
                'criteria_for_success'
              ].map((section) => (
                <button
                  key={section}
                  onClick={() => regenerateSection(section)}
                  disabled={regeneratingSection === section}
                  className="px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:bg-gray-200 flex items-center justify-center gap-1 transition"
                >
                  {regeneratingSection === section ? (
                    <Loader className="w-3 h-3 animate-spin" />
                  ) : (
                    <RotateCcw className="w-3 h-3" />
                  )}
                  {section.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Lesson Navigation */}
          <div className="mt-6 flex gap-3">
            <a
              href={`/teacher/lessons/${generatedLesson.id}/edit`}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 text-center transition"
            >
              Edit & Review Lesson
            </a>
            <a
              href={`/teacher/lessons/${generatedLesson.id}`}
              className="flex-1 px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 text-center transition"
            >
              View Lesson
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
