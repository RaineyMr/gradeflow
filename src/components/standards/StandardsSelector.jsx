import React, { useState, useEffect } from 'react'
import { useStandards } from '../../hooks/useStandards'
import { getStandardsSystem } from '../../lib/standards'

const C = {
  bg:'#060810', card:'#161923', inner:'#1e2231', text:'#eef0f8',
  muted:'#6b7494', border:'#2a2f42', green:'#22c97a', blue:'#3b7ef4',
  amber:'#f5a623', purple:'#9b6ef5', teal:'#0fb8a0', red:'#f04a4a',
}

function StandardsSelector({ subject, grade, selectedStandards, onChange, topic, schoolName }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showRecommended, setShowRecommended] = useState(!!topic)
  const { standards, recommendedStandards, standardsByCluster, loading, hasData, hasRecommendations } = useStandards({ 
    subject, 
    grade, 
    searchQuery, 
    topic,
    schoolName 
  })

  // Auto-select recommended standards when topic changes
  useEffect(() => {
    if (hasRecommendations && recommendedStandards.length > 0 && topic) {
      // Auto-select the top recommended standard if none are selected
      if (selectedStandards.length === 0) {
        onChange([recommendedStandards[0]])
      }
    }
  }, [recommendedStandards, topic, selectedStandards.length, onChange])

  const standardsSystem = getStandardsSystem(schoolName)
  const systemInfo = {
    'TEKS': { name: 'Texas Essential Knowledge and Skills', color: C.blue, state: 'Texas' },
    'LSS': { name: 'Louisiana Student Standards', color: C.purple, state: 'Louisiana' },
    'COMMON': { name: 'Common Core Standards', color: C.green, state: 'National' }
  }[standardsSystem] || { name: 'Standards', color: C.blue, state: '' }

  const handleStandardToggle = (standard) => {
    const isSelected = selectedStandards.some(s => s.code === standard.code)
    if (isSelected) {
      onChange(selectedStandards.filter(s => s.code !== standard.code))
    } else {
      onChange([...selectedStandards, standard])
    }
  }

  const renderStandard = (standard, isRecommended = false) => {
    const isSelected = selectedStandards.some(s => s.code === standard.code)
    
    return (
      <div
        key={standard.code}
        onClick={() => handleStandardToggle(standard)}
        style={{
          background: isSelected ? `${C.green}15` : C.inner,
          border: `1px solid ${isSelected ? C.green : C.border}`,
          borderRadius: 8,
          padding: '10px 12px',
          marginBottom: 6,
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <div style={{
            width: 18,
            height: 18,
            border: `2px solid ${isSelected ? C.green : C.muted}`,
            borderRadius: 4,
            background: isSelected ? C.green : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 2,
            flexShrink: 0
          }}>
            {isSelected && (
              <span style={{ color: C.bg, fontSize: 12, fontWeight: 'bold' }}>✓</span>
            )}
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ 
                fontSize: 12, 
                fontWeight: 700, 
                color: isSelected ? C.green : C.blue,
                fontFamily: 'monospace'
              }}>
                {standard.code}
              </span>
              {isRecommended && (
                <span style={{
                  background: `${C.amber}20`,
                  color: C.amber,
                  borderRadius: 999,
                  padding: '2px 6px',
                  fontSize: 9,
                  fontWeight: 700
                }}>
                  Recommended
                </span>
              )}
              {standard.relevanceScore && (
                <span style={{
                  background: `${C.purple}20`,
                  color: C.purple,
                  borderRadius: 999,
                  padding: '2px 6px',
                  fontSize: 9,
                  fontWeight: 700
                }}>
                  {standard.relevanceScore} match{standard.relevanceScore !== 1 ? 'es' : ''}
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: C.text, lineHeight: 1.4, marginBottom: 4 }}>
              {standard.description}
            </div>
            <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {standard.cluster}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!subject || !grade) {
    return (
      <div style={{ 
        background: C.inner, 
        border: `1px solid ${C.border}`, 
        borderRadius: 12, 
        padding: '16px', 
        textAlign: 'center',
        color: C.muted,
        fontSize: 13
      }}>
        Select subject and grade to see standards
      </div>
    )
  }

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
          📚 {systemInfo.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {systemInfo.state && (
            <span style={{
              background: `${systemInfo.color}20`,
              color: systemInfo.color,
              borderRadius: 999,
              padding: '2px 8px',
              fontSize: 10,
              fontWeight: 700
            }}>
              {systemInfo.state}
            </span>
          )}
          {selectedStandards.length > 0 && (
            <span style={{
              background: `${C.green}20`,
              color: C.green,
              borderRadius: 999,
              padding: '2px 8px',
              fontSize: 10,
              fontWeight: 700
            }}>
              {selectedStandards.length} selected
            </span>
          )}
          {hasRecommendations && topic && (
            <span style={{
              background: `${C.amber}20`,
              color: C.amber,
              borderRadius: 999,
              padding: '2px 8px',
              fontSize: 10,
              fontWeight: 700
            }}>
              🎯 {recommendedStandards.length} recommended
            </span>
          )}
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search standards..."
        style={{
          width: '100%',
          background: C.inner,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: '8px 12px',
          color: C.text,
          fontSize: 12,
          outline: 'none',
          marginBottom: 12
        }}
      />

      {/* Toggle between recommended and all standards */}
      {hasRecommendations && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button
            onClick={() => setShowRecommended(true)}
            style={{
              flex: 1,
              background: showRecommended ? `${C.amber}20` : C.inner,
              color: showRecommended ? C.amber : C.muted,
              border: `1px solid ${showRecommended ? C.amber : C.border}`,
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ⭐ Recommended ({recommendedStandards.length})
          </button>
          <button
            onClick={() => setShowRecommended(false)}
            style={{
              flex: 1,
              background: !showRecommended ? `${C.blue}20` : C.inner,
              color: !showRecommended ? C.blue : C.muted,
              border: `1px solid ${!showRecommended ? C.blue : C.border}`,
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            📋 All Standards ({standards.length})
          </button>
        </div>
      )}

      {/* Standards list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px', color: C.muted, fontSize: 12 }}>
          Loading standards...
        </div>
      ) : !hasData ? (
        <div style={{ textAlign: 'center', padding: '20px', color: C.muted, fontSize: 12 }}>
          No standards found for {subject} {grade}
        </div>
      ) : (
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {showRecommended && hasRecommendations ? (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.amber, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                ⭐ Recommended for "{topic}"
              </div>
              {recommendedStandards.map(standard => renderStandard(standard, true))}
            </div>
          ) : (
            <div>
              {Object.entries(standardsByCluster).map(([cluster, clusterStandards]) => (
                <div key={cluster} style={{ marginBottom: 16 }}>
                  <div style={{ 
                    fontSize: 11, 
                    fontWeight: 700, 
                    color: C.blue, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.06em', 
                    marginBottom: 8 
                  }}>
                    {cluster}
                  </div>
                  {clusterStandards.map(standard => renderStandard(standard))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected standards summary */}
      {selectedStandards.length > 0 && (
        <div style={{ 
          marginTop: 12, 
          padding: '10px', 
          background: `${C.green}10`, 
          border: `1px solid ${C.green}30`, 
          borderRadius: 8,
          fontSize: 11,
          color: C.green
        }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>
            ✅ Selected Standards ({selectedStandards.length})
          </div>
          <div style={{ fontSize: 10, lineHeight: 1.4 }}>
            {selectedStandards.map(s => s.code).join(', ')}
          </div>
        </div>
      )}
    </div>
  )
}

export default StandardsSelector
