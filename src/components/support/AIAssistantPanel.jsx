// src/components/support/AIAssistantPanel.jsx
import React, { useState } from 'react'
import { useStore } from '../../lib/store'
import {
  explainTrend,
  draftInterventionPlan,
  summarizeStudentHistory,
  draftMessage,
  rewriteMessage,
  translateMessage,
  draftSupportLog,
  summarizeCaseload,
  suggestFollowUps,
  suggestGroupMembers
} from '../../lib/AIService'

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

const TABS = [
  { id: 'trends', label: 'Trends', icon: '📊' },
  { id: 'interventions', label: 'Interventions', icon: '🎯' },
  { id: 'messaging', label: 'Messaging', icon: '💬' },
  { id: 'logs', label: 'Logs', icon: '📝' },
  { id: 'caseload', label: 'Caseload', icon: '👥' },
  { id: 'groups', label: 'Groups', icon: '🔗' },
]

export default function AIAssistantPanel({ isOpen, onClose, initialContext = {} }) {
  const { 
    getAIContextForStudent,
    getAIContextForGroup,
    getAIContextForCaseload,
    getAIContextForIntervention,
    getAIContextForMessaging,
    getAIContextForLogs
  } = useStore()

  const [activeTab, setActiveTab] = useState('trends')
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [context, setContext] = useState(initialContext)

  async function handleAskAI() {
    if (!input.trim() || loading) return
    
    setLoading(true)
    setResponse('Thinking...')
    
    try {
      let aiResponse = ''
      
      switch (activeTab) {
        case 'trends':
          aiResponse = await explainTrend({ ...context, query: input })
          break
        case 'interventions':
          aiResponse = await draftInterventionPlan({ ...context, query: input })
          break
        case 'messaging':
          if (input.toLowerCase().includes('rewrite') || input.toLowerCase().includes('tone')) {
            aiResponse = await rewriteMessage({ ...context, originalMessage: input })
          } else if (input.toLowerCase().includes('translate') || input.toLowerCase().includes('spanish')) {
            aiResponse = await translateMessage({ ...context, originalMessage: input })
          } else {
            aiResponse = await draftMessage({ ...context, messageContent: input })
          }
          break
        case 'logs':
          aiResponse = await draftSupportLog({ ...context, topic: input })
          break
        case 'caseload':
          aiResponse = await summarizeCaseload({ ...context, query: input })
          break
        case 'groups':
          aiResponse = await suggestGroupMembers({ ...context, criteria: input })
          break
        default:
          aiResponse = await suggestFollowUps({ ...context, query: input })
      }
      
      setResponse(aiResponse)
    } catch (error) {
      setResponse('Sorry, I encountered an error. Please try again.')
      console.error('AI Service Error:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAskAI()
    }
  }

  function getContextForTab(tab) {
    switch (tab) {
      case 'trends':
        return context.studentId ? getAIContextForStudent?.(context.studentId) : {}
      case 'interventions':
        return context.studentId ? getAIContextForIntervention?.(context.studentId) : {}
      case 'messaging':
        return getAIContextForMessaging?.(context) || {}
      case 'logs':
        return context.studentId ? getAIContextForLogs?.(context.studentId) : {}
      case 'caseload':
        return getAIContextForCaseload?.() || {}
      case 'groups':
        return context.groupId ? getAIContextForGroup?.(context.groupId) : {}
      default:
        return {}
    }
  }

  function getPlaceholderForTab(tab) {
    switch (tab) {
      case 'trends':
        return "Ask me to analyze student performance trends..."
      case 'interventions':
        return "Describe the student's needs for an intervention plan..."
      case 'messaging':
        return "Draft a message, or ask me to rewrite/translate one..."
      case 'logs':
        return "Describe the interaction for a support log entry..."
      case 'caseload':
        return "Ask me to summarize your caseload or identify priorities..."
      case 'groups':
        return "Describe the type of group you want to create..."
      default:
        return "How can I help you?"
    }
  }

  function getExamplePrompts(tab) {
    switch (tab) {
      case 'trends':
        return [
          "Analyze this student's grade trend over the past month",
          "What factors might be causing this decline in performance?",
          "Suggest interventions based on these trends"
        ]
      case 'interventions':
        return [
          "Create an intervention plan for a student failing math",
          "Develop strategies for improving attendance",
          "Suggest accommodations for a struggling student"
        ]
      case 'messaging':
        return [
          "Draft a message to parents about declining grades",
          "Rewrite this message to be more supportive: [your message]",
          "Translate this message to Spanish: [your message]"
        ]
      case 'logs':
        return [
          "Log a counseling session about academic concerns",
          "Document a parent phone conference",
          "Record behavioral incident and follow-up"
        ]
      case 'caseload':
        return [
          "Summarize my current caseload priorities",
          "Identify students who need immediate attention",
          "Suggest how to organize my caseload management"
        ]
      case 'groups':
        return [
          "Suggest students for a math intervention group",
          "Create a reading support group roster",
          "Recommend peer tutoring pairs"
        ]
      default:
        return []
    }
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '500px',
      maxWidth: '90vw',
      background: C.card,
      borderLeft: `1px solid ${C.border}`,
      zIndex: 300,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-4px 0 20px rgba(0,0,0,0.3)'
    }}>
      {/* Header */}
      <div style={{
        background: C.inner,
        padding: '16px 20px',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, display: 'flex', alignItems: 'center', gap: 8 }}>
            🤖 AI Assistant
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
            Support Staff Helper
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: C.soft,
            fontSize: 20,
            cursor: 'pointer',
            padding: 4,
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${C.border}`,
        overflowX: 'auto'
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              minWidth: '80px',
              padding: '12px 8px',
              background: activeTab === tab.id ? C.blue : 'none',
              border: 'none',
              color: activeTab === tab.id ? '#fff' : C.soft,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: 16 }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Context Info */}
        {Object.keys(context).length > 0 && (
          <div style={{
            padding: '12px 20px',
            background: `${C.blue}10`,
            borderBottom: `1px solid ${C.border}`,
            fontSize: 11,
            color: C.blue
          }}>
            <strong>Context:</strong> {
              context.studentName ? `Student: ${context.studentName}` :
              context.groupName ? `Group: ${context.groupName}` :
              'General inquiry'
            }
          </div>
        )}

        {/* Example Prompts */}
        <div style={{
          padding: '12px 20px',
          borderBottom: `1px solid ${C.border}`,
          background: C.inner
        }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, fontWeight: 600 }}>
            Example prompts:
          </div>
          {getExamplePrompts(activeTab).map((prompt, index) => (
            <button
              key={index}
              onClick={() => setInput(prompt)}
              style={{
                display: 'block',
                width: '100%',
                padding: '6px 12px',
                marginBottom: 4,
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                color: C.soft,
                fontSize: 10,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = C.raised
                e.target.style.color = C.text
              }}
              onMouseLeave={(e) => {
                e.target.style.background = C.bg
                e.target.style.color = C.soft
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${C.border}`
        }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={getPlaceholderForTab(activeTab)}
            disabled={loading}
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '12px',
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              color: C.text,
              fontSize: 13,
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <button
            onClick={handleAskAI}
            disabled={loading || !input.trim()}
            style={{
              marginTop: 12,
              padding: '10px 20px',
              background: loading || !input.trim() ? C.inner : C.blue,
              border: 'none',
              borderRadius: 8,
              color: loading || !input.trim() ? C.muted : '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: 16,
                  height: 16,
                  border: '2px solid transparent',
                  borderTop: `2px solid #fff`,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Thinking...
              </>
            ) : (
              <>
                🤖 Ask AI
              </>
            )}
          </button>
        </div>

        {/* Response Area */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          background: C.bg
        }}>
          {response ? (
            <div style={{
              fontSize: 13,
              lineHeight: 1.6,
              color: C.text,
              whiteSpace: 'pre-wrap'
            }}>
              {response}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              color: C.muted,
              fontSize: 13,
              marginTop: 40
            }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>🤖</div>
              <div>Ask me anything about your support work!</div>
              <div style={{ fontSize: 11, marginTop: 8 }}>
                I can help with trends, interventions, messaging, logs, caseload management, and grouping.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add spinning animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
