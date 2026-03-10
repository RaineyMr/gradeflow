import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '../lib/store'
import { scanGradedDocument } from '../lib/ai'

export default function Camera() {
  const setScreen = useStore((state) => state.setScreen)
  const assignments = useStore((state) => state.assignments || [])
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [error, setError] = useState('')
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(
    assignments[0]?.id || ''
  )
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!selectedAssignmentId && assignments.length > 0) {
      setSelectedAssignmentId(assignments[0].id)
    }
  }, [assignments, selectedAssignmentId])

  const handleFileChange = useCallback(async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsScanning(true)
    setError('')
    setScanResult(null)

    try {
      const result = await scanGradedDocument(file)
      setScanResult(result || { success: true, message: 'Scan complete.' })
    } catch (err) {
      setError(err?.message || 'Unable to scan document right now.')
    } finally {
      setIsScanning(false)
    }
  }, [])

  function openFilePicker() {
    fileInputRef.current?.click()
  }

  function goBack() {
    setScreen('dashboard')
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-primary">
            Scan / Grade
          </h1>
          <p className="text-text-muted text-sm">
            Upload student work or an answer key to process it with AI.
          </p>
        </div>

        <button
          onClick={goBack}
          className="px-4 py-2 rounded-pill text-sm font-semibold"
          style={{ background: '#1e2231', color: '#eef0f8' }}
        >
          Back
        </button>
      </div>

      <div className="p-4 rounded-card" style={{ background: '#161923' }}>
        <label className="tag-label block mb-2">Assignment</label>
        <select
          className="w-full bg-elevated border border-border rounded-card px-3 py-2 text-text-primary text-sm"
          value={selectedAssignmentId}
          onChange={(e) => setSelectedAssignmentId(e.target.value)}
        >
          {assignments.length === 0 ? (
            <option value="">No assignments yet</option>
          ) : (
            assignments.map((assignment) => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.name} · {assignment.type}
              </option>
            ))
          )}
        </select>
      </div>

      <div
        className="p-6 rounded-widget border border-elevated text-center"
        style={{ background: '#161923' }}
      >
        <div className="text-5xl mb-3">📷</div>
        <h2 className="font-bold text-text-primary mb-2">Upload a document</h2>
        <p className="text-text-muted text-sm mb-4">
          Choose a photo, worksheet, quiz, or answer key to scan.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <button
          onClick={openFilePicker}
          disabled={isScanning}
          className="px-5 py-2.5 rounded-pill text-sm font-bold disabled:opacity-50"
          style={{ background: 'var(--school-color)', color: 'white' }}
        >
          {isScanning ? 'Scanning...' : 'Choose File'}
        </button>
      </div>

      {error && (
        <div
          className="p-4 rounded-card"
          style={{ background: '#1c1012', border: '1px solid #f04a4a30' }}
        >
          <p className="font-semibold" style={{ color: '#f04a4a' }}>
            Scan failed
          </p>
          <p className="text-sm text-text-muted mt-1">{error}</p>
        </div>
      )}

      {scanResult && (
        <div
          className="p-4 rounded-card"
          style={{ background: '#102117', border: '1px solid #22c97a30' }}
        >
          <p className="font-semibold" style={{ color: '#22c97a' }}>
            Scan complete
          </p>
          <pre
            className="mt-2 text-xs whitespace-pre-wrap break-words"
            style={{ color: '#cfd6ea' }}
          >
            {typeof scanResult === 'string'
              ? scanResult
              : JSON.stringify(scanResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
