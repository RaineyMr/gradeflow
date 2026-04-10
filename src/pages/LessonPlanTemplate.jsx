import React, { useState, useEffect } from 'react'
import { useStore } from '../lib/store'
import BottomNav from '../components/ui/BottomNav'
import StandardsSelector from '../components/standards/StandardsSelector'

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

// ─── AI Assist Button Component ────────────────────────────────────────────
function AIAssistButton({ mode, sectionName, onGenerate, loading }) {
  const label = mode === 'refine' ? '✨ Refine' : '✨ Generate'
  const title = mode === 'refine' 
    ? `Refine ${sectionName} using AI` 
    : `Generate ${sectionName} from scratch`
  
  return (
    <button
      onClick={() => onGenerate(mode)}
      disabled={loading}
      title={title}
      style={{
        background: loading ? C.muted : C.purple,
        color: 'white',
        border: 'none',
        borderRadius: 6,
        padding: '6px 12px',
        fontSize: 11,
        fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
        transition: 'all 0.2s',
      }}
    >
      {loading ? '⏳ Generating...' : label}
    </button>
  )
}

// ─── Section Wrapper with AI Assist ───────────────────────────────────────
function Section({ title, children, onAIRefine, onAIGenerate, isGenerating }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}>
        <h2 style={{
          fontSize: 16,
          fontWeight: 700,
          color: C.text,
          margin: 0,
        }}>
          {title}
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {onAIGenerate && (
            <AIAssistButton
              mode="generate"
              sectionName={title}
              onGenerate={() => onAIGenerate('generate')}
              loading={isGenerating}
            />
          )}
          {onAIRefine && (
            <AIAssistButton
              mode="refine"
              sectionName={title}
              onGenerate={() => onAIRefine('refine')}
              loading={isGenerating}
            />
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

// ─── 1. LESSON HEADER ──────────────────────────────────────────────────────
function LessonHeaderSection({ data, onChange }) {
  return (
    <Section title="Lesson Header">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
            Lesson Title *
          </label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => onChange('header', { ...data, title: e.target.value })}
            placeholder="e.g., Photosynthesis Basics"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 14,
              background: C.inner,
              color: C.text,
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
            Date *
          </label>
          <input
            type="date"
            value={data.date || ''}
            onChange={(e) => onChange('header', { ...data, date: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 14,
              background: C.inner,
              color: C.text,
              outline: 'none',
            }}
          />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
            Subject *
          </label>
          <input
            type="text"
            value={data.subject || ''}
            onChange={(e) => onChange('header', { ...data, subject: e.target.value })}
            placeholder="e.g., Biology, Mathematics, English"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 14,
              background: C.inner,
              color: C.text,
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
            Grade Level *
          </label>
          <select
            value={data.gradeLevel || ''}
            onChange={(e) => onChange('header', { ...data, gradeLevel: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 14,
              background: C.inner,
              color: C.text,
              outline: 'none',
            }}
          >
            <option value="">Select Grade Level</option>
            {['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>
    </Section>
  )
}

// ─── 2. STANDARDS ──────────────────────────────────────────────────────────
function StandardsSection({ data, onChange, onAIGenerate }) {
  const [showPicker, setShowPicker] = useState(false)
  const [generating, setGenerating] = useState(false)

  const handleAIGenerate = async (mode) => {
    setGenerating(true)
    await onAIGenerate('standards', mode, data)
    setGenerating(false)
  }

  return (
    <Section
      title="2. Standards"
      onAIGenerate={handleAIGenerate}
      isGenerating={generating}
    >
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
          Search TEKS / Common Core Standards
        </label>
        <button
          onClick={() => setShowPicker(!showPicker)}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: `1px solid ${C.blue}`,
            background: C.inner,
            color: C.blue,
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {showPicker ? '▲ Hide Picker' : '▼ Browse Standards'}
        </button>
      </div>

      {showPicker && (
        <StandardsSelector
          topic={data.title}
          maxSelections={5}
          showRecommendations
          onStandardsChange={(standards) => {
            onChange('standards', standards)
            setShowPicker(false)
          }}
        />
      )}

      {data.standards && data.standards.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 8, textTransform: 'uppercase' }}>
            Selected ({data.standards.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {data.standards.map((std, i) => (
              <span
                key={i}
                style={{
                  background: `${C.blue}20`,
                  color: C.blue,
                  border: `1px solid ${C.blue}40`,
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {std}
                <button
                  onClick={() => onChange('standards', data.standards.filter((_, idx) => idx !== i))}
                  style={{ background: 'none', border: 'none', color: C.blue, cursor: 'pointer', fontSize: 14, padding: 0 }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </Section>
  )
}

// ─── 3. OBJECTIVES ────────────────────────────────────────────────────────
function ObjectivesSection({ data, onChange, onAIGenerate }) {
  const [generating, setGenerating] = useState(false)

  const handleAIGenerate = async (mode) => {
    setGenerating(true)
    await onAIGenerate('objectives', mode, data)
    setGenerating(false)
  }

  return (
    <Section
      title="3. Learning Objectives"
      onAIGenerate={handleAIGenerate}
      onAIRefine={handleAIGenerate}
      isGenerating={generating}
    >
      <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
        By the end of this lesson, students will be able to...
      </label>
      <textarea
        value={data.objectives || ''}
        onChange={(e) => onChange('objectives', e.target.value)}
        placeholder="e.g., - Identify the three main parts of a plant cell
- Explain how photosynthesis converts light to chemical energy
- Compare cellular respiration and photosynthesis"
        style={{
          width: '100%',
          padding: '12px 14px',
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          fontSize: 13,
          background: C.inner,
          color: C.text,
          outline: 'none',
          fontFamily: 'Inter, monospace',
          minHeight: 120,
          lineHeight: 1.5,
        }}
      />
    </Section>
  )
}

// ─── 4. CFS (Culturally Responsive Teaching & Success Criteria) ──────────
function CFSSection({ data, onChange, onAIGenerate }) {
  const [generating, setGenerating] = useState(false)

  const handleAIGenerate = async (mode) => {
    setGenerating(true)
    await onAIGenerate('cfs', mode, data)
    setGenerating(false)
  }

  return (
    <Section
      title="4. Success Criteria & Culturally Responsive Teaching"
      onAIGenerate={handleAIGenerate}
      onAIRefine={handleAIGenerate}
      isGenerating={generating}
    >
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
          Success Criteria: Students will demonstrate understanding by...
        </label>
        <textarea
          value={data.successCriteria || ''}
          onChange={(e) => onChange('cfs', { ...data, successCriteria: e.target.value })}
          placeholder="e.g., - Correctly label plant cell structures on a diagram
- Write a 3-sentence explanation of photosynthesis
- Score 80% or higher on exit ticket"
          style={{
            width: '100%',
            padding: '12px 14px',
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            fontSize: 13,
            background: C.inner,
            color: C.text,
            outline: 'none',
            minHeight: 100,
            lineHeight: 1.5,
          }}
        />
      </div>

      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
          Culturally Responsive Notes (optional)
        </label>
        <textarea
          value={data.culturalNotes || ''}
          onChange={(e) => onChange('cfs', { ...data, culturalNotes: e.target.value })}
          placeholder="e.g., Use examples from students' local ecosystems
- Incorporate diverse scientists' contributions
- Connect to real-world environmental justice issues"
          style={{
            width: '100%',
            padding: '12px 14px',
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            fontSize: 13,
            background: C.inner,
            color: C.text,
            outline: 'none',
            minHeight: 100,
            lineHeight: 1.5,
          }}
        />
      </div>
    </Section>
  )
}

// ─── 5. LESSON STEPS (6 Substeps) ─────────────────────────────────────────
function LessonStepsSection({ data, onChange, onAIGenerate }) {
  const [generating, setGenerating] = useState(false)

  const handleAIGenerate = async (mode) => {
    setGenerating(true)
    await onAIGenerate('lessonSteps', mode, data)
    setGenerating(false)
  }

  const steps = [
    { key: 'warmUp', label: 'Warm-Up / Hook', hint: 'Activate prior knowledge & engage students' },
    { key: 'directInstruction', label: 'Direct Instruction', hint: 'Teacher-led instruction & modeling' },
    { key: 'guidedPractice', label: 'Guided Practice', hint: 'Students practice with teacher support' },
    { key: 'independentPractice', label: 'Independent Practice', hint: 'Students work independently' },
    { key: 'closure', label: 'Closure', hint: 'Summarize key concepts & connect to objectives' },
    { key: 'extension', label: 'Extension (if time)', hint: 'Enrichment or challenge activities' },
  ]

  return (
    <Section
      title="5. Lesson Steps"
      onAIGenerate={handleAIGenerate}
      onAIRefine={handleAIGenerate}
      isGenerating={generating}
    >
      {steps.map((step, i) => (
        <div key={step.key} style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.teal, marginBottom: 4, display: 'block', textTransform: 'uppercase' }}>
            {i + 1}. {step.label}
          </label>
          <p style={{ fontSize: 11, color: C.muted, marginBottom: 8, margin: '4px 0 8px 0' }}>
            {step.hint}
          </p>
          <textarea
            value={data.lessonSteps?.[step.key] || ''}
            onChange={(e) => onChange('lessonSteps', { ...data.lessonSteps, [step.key]: e.target.value })}
            placeholder={`Describe ${step.label.toLowerCase()}...`}
            style={{
              width: '100%',
              padding: '12px 14px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 13,
              background: C.inner,
              color: C.text,
              outline: 'none',
              minHeight: 80,
              lineHeight: 1.5,
            }}
          />
          {i < steps.length - 1 && (
            <div style={{ height: 1, background: C.border, margin: '16px 0' }} />
          )}
        </div>
      ))}
    </Section>
  )
}

// ─── 6. EXIT TICKET ───────────────────────────────────────────────────────
function ExitTicketSection({ data, onChange, onAIGenerate }) {
  const [generating, setGenerating] = useState(false)

  const handleAIGenerate = async (mode) => {
    setGenerating(true)
    await onAIGenerate('exitTicket', mode, data)
    setGenerating(false)
  }

  return (
    <Section
      title="6. Exit Ticket"
      onAIGenerate={handleAIGenerate}
      onAIRefine={handleAIGenerate}
      isGenerating={generating}
    >
      <p style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>
        Quick formative assessment to check student understanding before leaving class.
      </p>
      <textarea
        value={data.exitTicket || ''}
        onChange={(e) => onChange('exitTicket', e.target.value)}
        placeholder="e.g., Question 1: In your own words, explain what photosynthesis is.
Question 2: Name one way photosynthesis differs from cellular respiration.
Question 3: Draw and label the parts of a plant cell involved in photosynthesis."
        style={{
          width: '100%',
          padding: '12px 14px',
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          fontSize: 13,
          background: C.inner,
          color: C.text,
          outline: 'none',
          minHeight: 120,
          lineHeight: 1.5,
        }}
      />
    </Section>
  )
}

// ─── 7. HOMEWORK ──────────────────────────────────────────────────────────
function HomeworkSection({ data, onChange, onAIGenerate }) {
  const [generating, setGenerating] = useState(false)

  const handleAIGenerate = async (mode) => {
    setGenerating(true)
    await onAIGenerate('homework', mode, data)
    setGenerating(false)
  }

  return (
    <Section
      title="7. Homework & Practice"
      onAIGenerate={handleAIGenerate}
      onAIRefine={handleAIGenerate}
      isGenerating={generating}
    >
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
          Assignment Description *
        </label>
        <textarea
          value={data.homework?.assignment || ''}
          onChange={(e) => onChange('homework', { ...data.homework, assignment: e.target.value })}
          placeholder="Describe the homework assignment..."
          style={{
            width: '100%',
            padding: '12px 14px',
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            fontSize: 13,
            background: C.inner,
            color: C.text,
            outline: 'none',
            minHeight: 100,
            lineHeight: 1.5,
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
            Due Date
          </label>
          <input
            type="date"
            value={data.homework?.dueDate || ''}
            onChange={(e) => onChange('homework', { ...data.homework, dueDate: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 14,
              background: C.inner,
              color: C.text,
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
            Max Points (optional)
          </label>
          <input
            type="number"
            value={data.homework?.maxPoints || ''}
            onChange={(e) => onChange('homework', { ...data.homework, maxPoints: e.target.value })}
            placeholder="e.g., 50"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 14,
              background: C.inner,
              color: C.text,
              outline: 'none',
            }}
          />
        </div>
      </div>
    </Section>
  )
}

// ─── 8. ACCOMMODATIONS ────────────────────────────────────────────────────
function AccommodationsSection({ data, onChange }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: C.inner,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: '12px 14px',
          cursor: 'pointer',
          color: C.text,
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        <span>♿ 8. Student Accommodations & Modifications</span>
        <span style={{ color: C.muted, fontSize: 13 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>
            Specify lesson-specific accommodations and modifications for students with IEPs, 504 plans, or ELL needs.
          </p>
          <textarea
            value={data.accommodations || ''}
            onChange={(e) => onChange('accommodations', e.target.value)}
            placeholder="e.g., - Provide visual aids for plant cell diagram
- Simplify vocabulary for ELL students
- Allow extended time for exit ticket
- Offer oral response option instead of written"
            style={{
              width: '100%',
              padding: '12px 14px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 13,
              background: C.inner,
              color: C.text,
              outline: 'none',
              minHeight: 120,
              lineHeight: 1.5,
            }}
          />
        </div>
      )}
    </div>
  )
}

// ─── 9. ATTACHMENTS ───────────────────────────────────────────────────────
function AttachmentsSection({ data, onChange }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: C.inner,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: '12px 14px',
          cursor: 'pointer',
          color: C.text,
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        <span>📎 9. Attachments & Resources</span>
        <span style={{ color: C.muted, fontSize: 13 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>
            Worksheets, answer keys, rubrics, images, PDFs, or external links.
          </p>
          <div style={{
            border: `2px dashed ${C.border}`,
            borderRadius: 8,
            padding: 20,
            textAlign: 'center',
            background: C.inner,
            cursor: 'pointer',
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📤</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>
              Tap to upload files
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>
              PDF, Word, Image, or any file type
            </div>
          </div>

          {data.attachments && data.attachments.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 8, textTransform: 'uppercase' }}>
                Attached Files ({data.attachments.length})
              </div>
              {data.attachments.map((file, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: C.inner,
                    borderRadius: 6,
                    marginBottom: 6,
                    fontSize: 13,
                  }}
                >
                  <span>📄 {file.name || `File ${i + 1}`}</span>
                  <button
                    onClick={() => {
                      const updated = data.attachments.filter((_, idx) => idx !== i)
                      onChange('attachments', updated)
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: C.red,
                      cursor: 'pointer',
                      fontSize: 16,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── 10. OPTIONAL ADD-ONS ─────────────────────────────────────────────────
function OptionalAddOnsSection({ data, onChange }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: C.inner,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: '12px 14px',
          cursor: 'pointer',
          color: C.text,
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        <span>⭐ 10. Optional Add-Ons</span>
        <span style={{ color: C.muted, fontSize: 13 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
              Enrichment Activities (for early finishers)
            </label>
            <textarea
              value={data.enrichment || ''}
              onChange={(e) => onChange('optionalAddOns', { ...data, enrichment: e.target.value })}
              placeholder="e.g., - Research photosynthesis in different plant types
- Create a photosynthesis comic strip
- Design an experiment to test light requirements"
              style={{
                width: '100%',
                padding: '12px 14px',
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                fontSize: 13,
                background: C.inner,
                color: C.text,
                outline: 'none',
                minHeight: 100,
                lineHeight: 1.5,
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
              Supplemental Resources & Links
            </label>
            <textarea
              value={data.supplementalLinks || ''}
              onChange={(e) => onChange('optionalAddOns', { ...data, supplementalLinks: e.target.value })}
              placeholder="e.g., - Khan Academy: Plant Cells (https://...)
- National Geographic: Photosynthesis Explainer
- YouTube: Amoeba Sisters Photosynthesis Video"
              style={{
                width: '100%',
                padding: '12px 14px',
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                fontSize: 13,
                background: C.inner,
                color: C.text,
                outline: 'none',
                minHeight: 100,
                lineHeight: 1.5,
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
              Notes & Reflections
            </label>
            <textarea
              value={data.reflections || ''}
              onChange={(e) => onChange('optionalAddOns', { ...data, reflections: e.target.value })}
              placeholder="e.g., - Pacing notes
- Student misconceptions to watch for
- What went well / what to improve next time"
              style={{
                width: '100%',
                padding: '12px 14px',
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                fontSize: 13,
                background: C.inner,
                color: C.text,
                outline: 'none',
                minHeight: 100,
                lineHeight: 1.5,
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────
export default function LessonPlanTemplate({ currentUser, lessonId, onBack }) {
  const [lessonData, setLessonData] = useState({
    header: { title: '', date: '', subject: '', gradeLevel: '' },
    standards: [],
    objectives: '',
    cfs: { successCriteria: '', culturalNotes: '' },
    lessonSteps: {
      warmUp: '',
      directInstruction: '',
      guidedPractice: '',
      independentPractice: '',
      closure: '',
      extension: '',
    },
    exitTicket: '',
    homework: { assignment: '', dueDate: '', maxPoints: '' },
    accommodations: '',
    attachments: [],
    optionalAddOns: { enrichment: '', supplementalLinks: '', reflections: '' },
  })

  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)

  // Handle section updates
  function handleSectionChange(section, value) {
    setLessonData(prev => ({
      ...prev,
      [section]: value,
    }))
  }

  // AI Assist handler (placeholder for now)
  async function handleAIAssist(section, mode, sectionData) {
    setGenerating(true)
    try {
      // Placeholder: actual AI integration will happen with /api/ai
      console.log(`AI ${mode} for ${section}:`, sectionData)
      // TODO: Call /api/ai with intent "lesson-plan-section"
    } catch (err) {
      console.error('AI assist failed:', err)
    }
    setGenerating(false)
  }

  // Save lesson plan
  async function handleSave() {
    setSaving(true)
    try {
      const payload = {
        lessonId,
        ...lessonData,
      }
      const response = await fetch('/api/lesson-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Save failed')
      alert('Lesson plan saved!')
      if (onBack) onBack()
    } catch (err) {
      console.error('Save error:', err)
      alert('Failed to save. Please try again.')
    }
    setSaving(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      color: C.text,
      fontFamily: 'Inter, Arial, sans-serif',
      paddingBottom: 100,
    }}>
      {/* Header */}
      <div style={{
        background: C.card,
        borderBottom: `1px solid ${C.border}`,
        padding: '16px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1200, margin: '0 auto' }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: 0 }}>
              Lesson Plan
            </h1>
            <p style={{ fontSize: 12, color: C.muted, margin: '4px 0 0 0' }}>
              {lessonId ? 'Edit' : 'Create'} comprehensive lesson plan
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  background: C.inner,
                  color: C.text,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ← Back
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: C.blue,
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 12,
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? '💾 Saving...' : '💾 Save Lesson Plan'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px', maxWidth: 1000, margin: '0 auto' }}>
        <LessonHeaderSection data={lessonData.header} onChange={handleSectionChange} />
        <StandardsSection data={lessonData.standards} onChange={handleSectionChange} onAIGenerate={handleAIAssist} />
        <ObjectivesSection data={lessonData.objectives} onChange={handleSectionChange} onAIGenerate={handleAIAssist} />
        <CFSSection data={lessonData.cfs} onChange={handleSectionChange} onAIGenerate={handleAIAssist} />
        <LessonStepsSection data={lessonData.lessonSteps} onChange={handleSectionChange} onAIGenerate={handleAIAssist} />
        <ExitTicketSection data={lessonData.exitTicket} onChange={handleSectionChange} onAIGenerate={handleAIAssist} />
        <HomeworkSection data={lessonData.homework} onChange={handleSectionChange} onAIGenerate={handleAIAssist} />
        <AccommodationsSection data={lessonData.accommodations} onChange={handleSectionChange} />
        <AttachmentsSection data={lessonData.attachments} onChange={handleSectionChange} />
        <OptionalAddOnsSection data={lessonData.optionalAddOns} onChange={handleSectionChange} />
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
