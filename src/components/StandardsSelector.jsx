import React, { useState } from 'react'
import { useStandards } from '../hooks/useStandards'
import { useStore } from '../lib/store'

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

export function StandardsSelector({ 
  onStandardsChange, 
  selectedStandards: externalSelected = [],
  maxSelections = 5,
  showRecommendations = true,
  topic = ''
}) {
  const { currentUser } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAll, setShowAll] = useState(false)
  
  const {
    standards,
    standardsByCluster,
    loading,
    error,
    standardsSystem,
    systemInfo,
    grade,
    subject,
    getRecommendedStandards
  } = useStandards({
    autoLoad: true
  })

  const { selectedStandards, addSelectedStandard, removeSelectedStandard, clearSelectedStandards } = useStore()

  // Get recommendations if topic is provided
  const recommendations = showRecommendations && topic ? 
    getRecommendedStandards(topic) : []

  const handleStandardToggle = (standard) => {
    const isSelected = selectedStandards.some(s => s.code === standard.code)
    
    if (isSelected) {
      removeSelectedStandard(standard.code)
    } else if (selectedStandards.length < maxSelections) {
      addSelectedStandard(standard)
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Foundational': return C.green
      case 'Developing': return C.blue
      case 'Proficient': return C.amber
      case 'Advanced': return C.purple
      default: return C.muted
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ 
          width: 24, 
          height: 24, 
          border: `3px solid ${C.teal}30`, 
          borderTopColor: C.teal, 
          borderRadius: '50%', 
          animation: 'spin 0.8s linear infinite', 
          margin: '0 auto 12px' 
        }} />
        <p style={{ color: C.muted, fontSize: 13 }}>Loading standards...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        padding: '16px', 
        background: `${C.red}12`, 
        border: `1px solid ${C.red}30`, 
        borderRadius: 12,
        textAlign: 'center'
      }}>
        <p style={{ color: C.red, fontSize: 13 }}>{error}</p>
      </div>
    )
  }

  const displayStandards = searchQuery ? 
    standards.filter(s => 
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) : 
    showAll ? standards : standards.slice(0, 8)

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: C.text, margin: 0 }}>
            {systemInfo?.name || 'Standards'}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: C.muted }}>
              {grade} • {subject}
            </span>
            {selectedStandards.length > 0 && (
              <span style={{ 
                background: `${C.teal}18`, 
                color: C.teal, 
                fontSize: 11, 
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 12
              }}>
                {selectedStandards.length}/{maxSelections}
              </span>
            )}
          </div>
        </div>
        
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Search standards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: C.inner,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: '8px 12px 8px 36px',
              color: C.text,
              fontSize: 13,
              outline: 'none'
            }}
          />
          <span style={{ 
            position: 'absolute', 
            left: 12, 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: C.muted,
            fontSize: 14
          }}>
            🔍
          </span>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && !searchQuery && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ 
            fontSize: 11, 
            fontWeight: 700, 
            color: C.teal, 
            textTransform: 'uppercase', 
            letterSpacing: '0.06em', 
            marginBottom: 8 
          }}>
            Recommended for "{topic}"
          </div>
          {recommendations.slice(0, 3).map(standard => (
            <StandardCard
              key={standard.code}
              standard={standard}
              isSelected={selectedStandards.some(s => s.code === standard.code)}
              onToggle={handleStandardToggle}
              showRelevance={true}
            />
          ))}
        </div>
      )}

      {/* Standards List */}
      <div>
        {displayStandards.length > 0 ? (
          <>
            {displayStandards.map(standard => (
              <StandardCard
                key={standard.code}
                standard={standard}
                isSelected={selectedStandards.some(s => s.code === standard.code)}
                onToggle={handleStandardToggle}
              />
            ))}
            
            {!showAll && standards.length > 8 && (
              <button
                onClick={() => setShowAll(true)}
                style={{
                  width: '100%',
                  background: C.inner,
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  padding: '8px',
                  color: C.muted,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: 8
                }}
              >
                Show {standards.length - 8} more standards →
              </button>
            )}
          </>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '20px', 
            color: C.muted,
            fontSize: 13 
          }}>
            {searchQuery ? 'No standards found matching your search.' : 'No standards available for this grade/subject combination.'}
          </div>
        )}
      </div>

      {/* Selected Standards Summary */}
      {selectedStandards.length > 0 && (
        <div style={{ 
          marginTop: 16, 
          paddingTop: 16, 
          borderTop: `1px solid ${C.border}` 
        }}>
          <div style={{ 
            fontSize: 11, 
            fontWeight: 700, 
            color: C.teal, 
            textTransform: 'uppercase', 
            letterSpacing: '0.06em', 
            marginBottom: 8 
          }}>
            Selected Standards ({selectedStandards.length})
          </div>
          {selectedStandards.map(standard => (
            <div key={standard.code} style={{
              background: `${C.teal}12`,
              border: `1px solid ${C.teal}30`,
              borderRadius: 8,
              padding: '8px 10px',
              marginBottom: 6,
              fontSize: 12,
              color: C.text,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontWeight: 700, color: C.teal }}>{standard.code}</span>
                <span style={{ marginLeft: 8 }}>{standard.description}</span>
              </div>
              <button
                onClick={() => removeSelectedStandard(standard.code)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: C.muted,
                  cursor: 'pointer',
                  fontSize: 16,
                  padding: 0,
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StandardCard({ standard, isSelected, onToggle, showRelevance = false }) {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Foundational': return '#22c97a'
      case 'Developing': return '#3b7ef4'
      case 'Proficient': return '#f5a623'
      case 'Advanced': return '#9b6ef5'
      default: return '#6b7494'
    }
  }

  return (
    <div
      onClick={() => onToggle(standard)}
      style={{
        background: isSelected ? `${C.teal}18` : C.inner,
        border: `1px solid ${isSelected ? C.teal : C.border}`,
        borderRadius: 12,
        padding: '12px',
        marginBottom: 8,
        cursor: 'pointer',
        transition: 'all 0.15s'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            border: `2px solid ${isSelected ? C.teal : C.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {isSelected && (
              <div style={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                background: C.teal 
              }} />
            )}
          </div>
          <span style={{ 
            fontWeight: 700, 
            color: isSelected ? C.teal : C.text,
            fontSize: 13
          }}>
            {standard.code}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {showRelevance && standard.relevanceScore && (
            <span style={{
              background: C.green,
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: 6
            }}>
              {standard.relevanceScore}%
            </span>
          )}
          <span style={{
            background: `${getDifficultyColor(standard.difficulty)}20`,
            color: getDifficultyColor(standard.difficulty),
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: 6
          }}>
            {standard.difficulty}
          </span>
        </div>
      </div>
      
      <div style={{ 
        fontSize: 12, 
        color: C.text, 
        lineHeight: 1.4,
        marginBottom: 6 
      }}>
        {standard.description}
      </div>
      
      <div style={{ 
        fontSize: 10, 
        color: C.muted,
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <span>{standard.cluster}</span>
        {standard.curriculum && standard.curriculum.length > 0 && (
          <>
            <span>•</span>
            <span>{standard.curriculum.slice(0, 2).join(', ')}</span>
            {standard.curriculum.length > 2 && <span>+{standard.curriculum.length - 2}</span>}
          </>
        )}
      </div>
    </div>
  )
}

export default StandardsSelector
