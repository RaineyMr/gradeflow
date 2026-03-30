// src/components/parents/ParentAIAssistantPanel.jsx
import React, { useState } from 'react'
import {
  generateParentUpdate,
  generateParentMeetingSummary,
  rewriteForParentTone,
  simplifyForESLParents,
  translateWithTone,
  generatePositiveParentNote,
  generateParentFollowUp,
  generateWeeklyParentDigest
} from '../../lib/AIService'

const C = {
  bg: 'rgba(0,0,0,0.75)',
  panel: '#060810',
  border: '#252b3d',
  text: '#eef0f8',
  muted: '#6b7494',
  blue: '#3b7ef4',
  teal: '#0fb8a0',
  purple: '#9b6ef5',
  amber: '#f5a623',
  green: '#22c97a',
}

const TABS = [
  { id: 'update', label: 'Parent Update', icon: '📝' },
  { id: 'meeting', label: 'Meeting Summary', icon: '🤝' },
  { id: 'rewrite', label: 'Rewrite', icon: '✏️' },
  { id: 'translate', label: 'Translate', icon: '🌐' },
  { id: 'positive', label: 'Positive Note', icon: '⭐' },
  { id: 'followup', label: 'Follow-Up', icon: '📞' },
  { id: 'digest', label: 'Weekly Digest', icon: '📰' },
]

const EXAMPLE_PROMPTS = {
  update: [
    'Generate a positive update about recent academic progress',
    'Create a parent update about improved behavior',
    'Write an update about student achievements this week'
  ],
  meeting: [
    'Summarize parent meeting about student progress',
    'Document intervention planning meeting',
    'Create meeting summary for parent concerns'
  ],
  rewrite: [
    'Rewrite this message to be more parent-friendly',
    'Make this message more encouraging and positive',
    'Adjust tone to be warm and approachable'
  ],
  translate: [
    'Translate to Spanish with formal tone',
    'Translate to Vietnamese with cultural sensitivity',
    'Translate to Arabic with respectful tone'
  ],
  positive: [
    'Share a positive moment from today',
    'Highlight student kindness and leadership',
    'Celebrate academic improvement milestone'
  ],
  followup: [
    'Follow up after parent conference',
    'Check in after recent intervention',
    'Update parent on progress since last contact'
  ],
  digest: [
    'Create weekly progress summary',
    'Generate Friday parent digest',
    'Compile weekly highlights and upcoming items'
  ]
}

export default function ParentAIAssistantPanel({ isOpen, onClose, initialContext = {} }) {
  const [activeTab, setActiveTab] = useState('update')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [targetLanguage, setTargetLanguage] = useState('Spanish')
  const [tone, setTone] = useState('warm and encouraging')

  const languages = ['Spanish', 'Vietnamese', 'Arabic', 'Chinese', 'Haitian Creole', 'Portuguese']
  const tones = ['warm and encouraging', 'professional', 'formal', 'friendly', 'respectful']

  async function handleAskAI() {
    if (!input.trim()) return

    setLoading(true)
    setOutput('')

    try {
      let result = ''
      const context = {
        ...initialContext,
        input,
        targetLanguage,
        tone,
        senderName: 'Support Staff'
      }

      switch (activeTab) {
        case 'update':
          result = await generateParentUpdate(context)
          break
        case 'meeting':
          result = await generateParentMeetingSummary(context)
          break
        case 'rewrite':
          result = await rewriteForParentTone({ ...context, originalMessage: input })
          break
        case 'translate':
          result = await translateWithTone({ ...context, originalMessage: input, targetLanguage, tone })
          break
        case 'positive':
          result = await generatePositiveParentNote(context)
          break
        case 'followup':
          result = await generateParentFollowUp(context)
          break
        case 'digest':
          result = await generateWeeklyParentDigest(context)
          break
        default:
          result = 'Please select a task type.'
      }

      setOutput(result)
    } catch (error) {
      setOutput('Error generating response. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleExamplePrompt(prompt) {
    setInput(prompt)
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(output)
  }

  if (!isOpen) return null

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: C.bg,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: 600,
          maxHeight: '90vh',
          background: C.panel,
          border: `1px solid ${C.border}`,
          borderRadius: '20px 20px 0 0',
          padding: '20px',
          overflowY: 'auto'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: 0 }}>
              🤖 Parent Communication AI
            </h2>
            <p style={{ fontSize: 12, color: C.muted, margin: 0, marginTop: 2 }}>
              Generate parent-friendly messages and updates
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: C.muted,
              fontSize: 24,
              cursor: 'pointer',
              padding: 0,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? C.blue : '#1a1f2e',
                border: 'none',
                borderRadius: 8,
                padding: '8px 12px',
                color: C.text,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                whiteSpace: 'nowrap',
                transition: 'background 0.15s'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Options for specific tabs */}
        {(activeTab === 'translate' || activeTab === 'rewrite') && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            {activeTab === 'translate' && (
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: C.muted, marginBottom: 4, display: 'block' }}>
                  Target Language
                </label>
                <select
                  value={targetLanguage}
                  onChange={e => setTargetLanguage(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#1a1f2e',
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    padding: '6px 8px',
                    color: C.text,
                    fontSize: 12
                  }}
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            )}
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: C.muted, marginBottom: 4, display: 'block' }}>
                Tone
              </label>
              <select
                value={tone}
                onChange={e => setTone(e.target.value)}
                style={{
                  width: '100%',
                  background: '#1a1f2e',
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  padding: '6px 8px',
                  color: C.text,
                  fontSize: 12
                }}
              >
                {tones.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Example Prompts */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>Example prompts:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {EXAMPLE_PROMPTS[activeTab]?.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleExamplePrompt(prompt)}
                style={{
                  background: '#1a1f2e',
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: '4px 8px',
                  color: C.muted,
                  fontSize: 10,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => {
                  e.target.style.background = C.blue
                  e.target.style.color = C.text
                }}
                onMouseLeave={e => {
                  e.target.style.background = '#1a1f2e'
                  e.target.style.color = C.muted
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div style={{ marginBottom: 16 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={activeTab === 'rewrite' || activeTab === 'translate' 
              ? "Enter your message to rewrite/translate..."
              : "Describe what you want to communicate to parents..."}
            style={{
              width: '100%',
              minHeight: 100,
              background: '#1a1f2e',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: '12px',
              color: C.text,
              fontSize: 13,
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Ask AI Button */}
        <button
          onClick={handleAskAI}
          disabled={loading || !input.trim()}
          style={{
            width: '100%',
            background: loading ? '#1a1f2e' : C.blue,
            border: 'none',
            borderRadius: 8,
            padding: '12px',
            color: C.text,
            fontSize: 14,
            fontWeight: 600,
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            marginBottom: 16
          }}
        >
          {loading ? '🤔 Thinking...' : '🤖 Ask AI'}
        </button>

        {/* Output */}
        {output && (
          <div style={{ background: '#1a1f2e', border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>AI Response</div>
              <button
                onClick={copyToClipboard}
                style={{
                  background: 'transparent',
                  border: `1px solid ${C.border}`,
                  borderRadius: 4,
                  padding: '4px 8px',
                  color: C.muted,
                  fontSize: 10,
                  cursor: 'pointer'
                }}
              >
                📋 Copy
              </button>
            </div>
            <div style={{ 
              color: C.text, 
              fontSize: 13, 
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap'
            }}>
              {output}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
