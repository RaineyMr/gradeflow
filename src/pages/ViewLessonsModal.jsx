import React, { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

const C = {
  bg: '#060810',
  card: '#111520',
  inner: '#1a1f2e',
  raised: '#1e2436',
  text: '#eef0f8',
  soft: '#c8cce0',
  muted: '#6b7494',
  border: '#252b3d',
  green: '#22c97a',
  blue: '#3b7ef4',
  red: '#f04a4a',
  amber: '#f5a623',
  purple: '#9b6ef5',
  teal: '#0fb8a0',
}

export default function ViewLessonsModal({ date, lessons, isOpen, onClose, onSelectLesson }) {
  const [currentPage, setCurrentPage] = useState(1)
  const lessonsPerPage = 5

  // Reset page when modal opens or lessons change
  React.useEffect(() => {
    if (isOpen) {
      setCurrentPage(1)
    }
  }, [isOpen, lessons])

  if (!isOpen) return null

  const dateObj = new Date(date)

  // Pagination logic
  const totalPages = Math.ceil(lessons.length / lessonsPerPage)
  const startIndex = (currentPage - 1) * lessonsPerPage
  const endIndex = startIndex + lessonsPerPage
  const currentLessons = lessons.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '90%',
            maxWidth: 500,
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: 0, marginBottom: 4 }}>
                {lessons.length > 0 ? 'Lessons' : 'No Lessons'}
              </h2>
              <div style={{ fontSize: 12, color: C.muted }}>
                {dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: C.muted,
                cursor: 'pointer',
                padding: 4,
                fontSize: 20,
              }}
            >
              <X size={18} />
            </button>
          </div>

          {lessons.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {currentLessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => {
                    onSelectLesson(lesson)
                  }}
                  style={{
                    width: '100%',
                    background: C.inner,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: 16,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = C.blue
                    e.currentTarget.style.background = C.raised
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = C.border
                    e.currentTarget.style.background = C.inner
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: C.text, fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                        {lesson.title || 'Untitled Lesson'}
                      </div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 11, color: C.muted }}>
                        <span>
                          {lesson.subject || 'Class'} {lesson.period || ''}
                        </span>
                        <span>{lesson.duration || 45} min</span>
                        <span style={{ textTransform: 'capitalize' }}>{lesson.status || 'pending'}</span>
                      </div>
                    </div>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background:
                          lesson.status === 'completed' ? C.green : lesson.status === 'in-progress' ? C.amber : C.blue,
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: C.muted, fontSize: 14 }}>
              No lessons scheduled for this day
            </div>
          )}
        </div>
      </div>

      {/* Pagination Controls - Fixed above bottom nav banner */}
      {totalPages > 1 && (
        <div style={{
          position: 'fixed',
          bottom: '60px', // Position above bottom nav banner
          left: 0,
          right: 0,
          background: C.card,
          borderTop: `1px solid ${C.border}`,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 1001
        }}>
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            style={{
              background: currentPage === 1 ? C.inner : C.blue,
              border: `1px solid ${currentPage === 1 ? C.border : C.blue}`,
              borderRadius: 8,
              padding: '8px 12px',
              color: currentPage === 1 ? C.muted : 'white',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            <ChevronLeft size={14} />
            Previous
          </button>

          {/* Page Numbers */}
          <div style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                style={{
                  background: currentPage === page ? C.blue : C.inner,
                  border: `1px solid ${currentPage === page ? C.blue : C.border}`,
                  borderRadius: 6,
                  padding: '6px 10px',
                  color: currentPage === page ? 'white' : C.text,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: currentPage === page ? 700 : 600,
                  minWidth: '32px',
                  transition: 'all 0.2s'
                }}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            style={{
              background: currentPage === totalPages ? C.inner : C.blue,
              border: `1px solid ${currentPage === totalPages ? C.border : C.blue}`,
              borderRadius: 8,
              padding: '8px 12px',
              color: currentPage === totalPages ? C.muted : 'white',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </>
  )
}
