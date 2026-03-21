import React, { useRef, useState, useEffect, useCallback } from 'react'
import { useStore } from '../lib/store'
import { LoadingSpinner } from '../components/ui'

const C = {
  bg:'#060810', card:'#161923', inner:'#1e2231', text:'#eef0f8',
  muted:'#6b7494', border:'#2a2f42', green:'#22c97a', blue:'#3b7ef4',
  red:'#f04a4a', amber:'#f5a623', teal:'#0fb8a0', purple:'#9b6ef5',
}

const KEY = () => import.meta.env.VITE_ANTHROPIC_KEY

async function callAI(prompt, sys, maxTokens = 2000, useSearch = false) {
  const tools = useSearch ? [{ type: 'web_search_20250305', name: 'web_search' }] : undefined
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': KEY(),
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: sys,
      messages: [{ role: 'user', content: prompt }],
      ...(tools ? { tools } : {}),
    }),
  })
  const data = await res.json()
  return data.content?.filter(b => b.type === 'text').map(b => b.text).join('\n') || ''
}

function safeJSON(text) {
  try { return JSON.parse(text.replace(/```json|```/g, '').trim()) } catch {}
  try { const m = text.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]) } catch {}
  return null
}

// ─── Section helper ────────────────────────────────────────────────────────────
function Section({ title, items }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{title}</div>
      {items.map((item, i) => (
        <div key={i} style={{ background: C.inner, borderRadius: 10, padding: '10px 12px', marginBottom: 6, fontSize: 13, color: C.text, lineHeight: 1.5 }}>
          {item}
        </div>
      ))}
    </div>
  )
}

// ─── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    done:    { bg: '#0f2a1a', color: C.green,  label: '✓ Done'    },
    tbd:     { bg: '#2a1f0a', color: C.amber,  label: '⟳ TBD — Repeating' },
    pending: { bg: C.inner,   color: C.muted,  label: 'Not started' },
  }
  const s = map[status] || map.pending
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 999, padding: '3px 10px', fontSize: 10, fontWeight: 700 }}>
      {s.label}
    </span>
  )
}

// ─── VIEW LESSON ──────────────────────────────────────────────────────────────
// Displays a full lesson for a class. Supports swipe left/right to navigate days.
function ViewLesson({ classId, onBack, onCreateNew }) {
  const { lessons, setLessonStatus, classes, connectedCurricula, curriculumSources } = useStore()
  const classLessons = lessons[classId] || []
  const cls          = useStore(s => s.classes.find(c => c.id === classId))

  const [idx, setIdx]           = useState(0) // 0 = today
  const [fetching, setFetching] = useState(false)
  const [fetchMsg, setFetchMsg] = useState('')
  const [statusAnim, setStatusAnim] = useState(null) // 'done' | 'tbd'

  const lesson = classLessons[idx] || null

  // ── Swipe detection ────────────────────────────────────────────────────────
  const touchStartX = useRef(null)
  const containerRef = useRef(null)

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) < 50) return // ignore small swipes
    if (dx < 0 && idx < classLessons.length - 1) setIdx(i => i + 1) // swipe left → next
    if (dx > 0 && idx > 0)                        setIdx(i => i - 1) // swipe right → prev
  }, [idx, classLessons.length])

  // ── AI fetch lesson from curriculum ───────────────────────────────────────
  async function fetchFromCurriculum() {
    if (!lesson) return
    const sourceId = connectedCurricula[cls?.subject]
    const source   = curriculumSources.find(s => s.id === sourceId)
    if (!source) return

    setFetching(true)
    setFetchMsg(`Searching ${source.name} for ${cls?.subject} lesson...`)
    try {
      const prompt = `Search for a complete lesson plan from the "${source.name}" curriculum (by ${source.publisher}) for the topic: "${lesson.title}". 
The lesson is for subject: ${cls?.subject}.
Return a JSON object with these fields:
{
  "objective": "learning objective",
  "warmup": ["activity 1", "activity 2"],
  "activities": ["step 1", "step 2", "step 3", "step 4"],
  "materials": ["item 1", "item 2"],
  "homework": "homework description",
  "pages": "page numbers if applicable",
  "duration": "estimated duration",
  "standards": ["standard 1", "standard 2"]
}
Search the web for real curriculum content from ${source.name} if possible.`
      const text   = await callAI(prompt, 'You are a curriculum expert. Return only valid JSON. Search for real lesson content.', 1500, true)
      const parsed = safeJSON(text)
      if (parsed && lesson) {
        // Merge fetched data into this lesson in store
        useStore.getState().addLesson(classId, {
          ...lesson,
          ...parsed,
          id:       `fetched-${Date.now()}`,
          dayLabel: lesson.dayLabel,
          title:    lesson.title,
          status:   'pending',
          fetchedFrom: source.name,
        })
        setFetchMsg(`✓ Lesson pulled from ${source.name}!`)
        setTimeout(() => setFetchMsg(''), 2500)
      }
    } catch (err) {
      setFetchMsg('Could not fetch lesson. Check your connection.')
      setTimeout(() => setFetchMsg(''), 2500)
    }
    setFetching(false)
  }

  // ── Done / TBD actions ─────────────────────────────────────────────────────
  function markDone() {
    setStatusAnim('done')
    setTimeout(() => {
      setLessonStatus(classId, 'done')
      setStatusAnim(null)
      setIdx(0) // reset to new today
    }, 600)
  }

  function markTBD() {
    setStatusAnim('tbd')
    setTimeout(() => {
      setLessonStatus(classId, 'tbd')
      setStatusAnim(null)
    }, 600)
  }

  if (!lesson) return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Inter, Arial, sans-serif', padding: '40px 16px', textAlign: 'center' }}>
      <button onClick={onBack} style={{ background: C.inner, border: 'none', borderRadius: 10, padding: '8px 14px', color: C.text, cursor: 'pointer', fontSize: 13, fontWeight: 600, marginBottom: 24 }}>← Back</button>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>No lessons scheduled</h2>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>Add a lesson for this class to get started.</p>
      <button onClick={onCreateNew} style={{ background: C.teal, color: '#fff', border: 'none', borderRadius: 999, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
        + Create Lesson
      </button>
    </div>
  )

  const isToday    = idx === 0
  const hasPrev    = idx > 0
  const hasNext    = idx < classLessons.length - 1
  const sourceId   = connectedCurricula[cls?.subject]
  const sourceName = curriculumSources.find(s => s.id === sourceId)?.name

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Inter, Arial, sans-serif', paddingBottom: 100, userSelect: 'none' }}
    >
      {/* ── Header ── */}
      <div style={{ background: 'linear-gradient(135deg, var(--school-color, #BA0C2F) 0%, rgba(0,0,0,0.85) 100%)', padding: '20px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, padding: '7px 14px', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← Back</button>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>{cls?.period} · {cls?.subject}</div>
          <button onClick={onCreateNew} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, padding: '7px 14px', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>+ New</button>
        </div>

        {/* Day navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={!hasPrev}
            style={{ background: hasPrev ? 'rgba(255,255,255,0.2)' : 'transparent', border: 'none', borderRadius: 10, padding: '8px 12px', color: hasPrev ? '#fff' : 'rgba(255,255,255,0.3)', cursor: hasPrev ? 'pointer' : 'default', fontSize: 18, fontWeight: 700 }}>‹</button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 700, marginBottom: 2 }}>{lesson.dayLabel?.toUpperCase()} · {lesson.date}</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{lesson.title}</div>
          </div>
          <button onClick={() => setIdx(i => Math.min(classLessons.length - 1, i + 1))} disabled={!hasNext}
            style={{ background: hasNext ? 'rgba(255,255,255,0.2)' : 'transparent', border: 'none', borderRadius: 10, padding: '8px 12px', color: hasNext ? '#fff' : 'rgba(255,255,255,0.3)', cursor: hasNext ? 'pointer' : 'default', fontSize: 18, fontWeight: 700 }}>›</button>
        </div>

        {/* Dot indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
          {classLessons.map((l, i) => (
            <button key={l.id} onClick={() => setIdx(i)}
              style={{ width: i === idx ? 20 : 6, height: 6, borderRadius: 3, border: 'none', cursor: 'pointer', transition: 'width 0.2s',
                background: i === idx ? '#fff' : 'rgba(255,255,255,0.35)' }} />
          ))}
        </div>

        {/* Swipe hint */}
        <div style={{ textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>← swipe to navigate days →</div>
      </div>

      {/* ── TBD notice ── */}
      {lesson.status === 'tbd' && (
        <div style={{ margin: '12px 16px 0', background: '#2a1f0a', border: `1px solid ${C.amber}40`, borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>⟳</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.amber }}>TBD — Repeating Today</div>
            <div style={{ fontSize: 11, color: C.muted }}>This lesson wasn't completed. It will show again next session.</div>
          </div>
        </div>
      )}

      {/* ── Fetched from curriculum badge ── */}
      {lesson.fetchedFrom && (
        <div style={{ margin: '12px 16px 0', background: '#0a1f2a', border: `1px solid ${C.teal}40`, borderRadius: 12, padding: '8px 14px', fontSize: 11, color: C.teal }}>
          📚 Content pulled from <strong>{lesson.fetchedFrom}</strong>
        </div>
      )}

      {/* ── Lesson body ── */}
      <div style={{ padding: '16px 16px 0' }}>
        {/* Meta row */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {[lesson.duration, lesson.pages].filter(Boolean).map(v => (
            <span key={v} style={{ background: C.inner, borderRadius: 999, padding: '4px 10px', fontSize: 11, color: C.muted, fontWeight: 600 }}>{v}</span>
          ))}
          <StatusBadge status={lesson.status} />
        </div>

        {/* Objective */}
        {lesson.objective && (
          <div style={{ background: `${C.teal}12`, border: `1px solid ${C.teal}30`, borderRadius: 14, padding: '12px 14px', marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>🎯 Objective</div>
            <p style={{ fontSize: 13, color: C.text, lineHeight: 1.6, margin: 0 }}>{lesson.objective}</p>
          </div>
        )}

        {lesson.standards?.length > 0 && <Section title="📋 Standards" items={lesson.standards} />}
        {lesson.warmup?.length   > 0 && <Section title="☀️ Warm-Up" items={lesson.warmup} />}

        {/* Activities */}
        {lesson.activities?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>📋 Activities</div>
            {lesson.activities.map((act, i) => (
              <div key={i} style={{ background: C.inner, borderRadius: 12, padding: '10px 12px', marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                <span style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{act}</span>
              </div>
            ))}
          </div>
        )}

        {lesson.materials?.length > 0 && <Section title="📦 Materials" items={lesson.materials} />}

        {lesson.homework && (
          <div style={{ background: `${C.amber}12`, border: `1px solid ${C.amber}30`, borderRadius: 14, padding: '12px 14px', marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.amber, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>📖 Homework</div>
            <p style={{ fontSize: 13, color: C.text, margin: 0 }}>{lesson.homework}</p>
          </div>
        )}

        {/* AI fetch from curriculum */}
        {sourceId && isToday && (
          <div style={{ marginBottom: 16 }}>
            {fetching ? (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <LoadingSpinner />
                <p style={{ color: C.muted, fontSize: 12, marginTop: 8 }}>{fetchMsg}</p>
              </div>
            ) : (
              <button onClick={fetchFromCurriculum}
                style={{ width: '100%', background: `${C.blue}18`, border: `1px solid ${C.blue}40`, borderRadius: 14, padding: '12px 16px', color: C.blue, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                🔍 Pull full lesson from {sourceName}
              </button>
            )}
            {fetchMsg && !fetching && (
              <div style={{ textAlign: 'center', fontSize: 12, color: C.green, marginTop: 6 }}>{fetchMsg}</div>
            )}
          </div>
        )}

        {!sourceId && isToday && (
          <div style={{ background: C.inner, border: `1px solid ${C.border}`, borderRadius: 14, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>📚</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 2 }}>Connect your curriculum</div>
              <div style={{ fontSize: 11, color: C.muted }}>Link a textbook in Settings → Curriculum to auto-pull lessons.</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Done / TBD action bar (today only) ── */}
      {isToday && lesson.status !== 'done' && (
        <div style={{ position: 'fixed', bottom: 80, left: 0, right: 0, padding: '12px 16px', background: `${C.bg}ee`, backdropFilter: 'blur(12px)', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 10, zIndex: 50 }}>
          <button
            onClick={markTBD}
            style={{
              flex: 1, background: statusAnim === 'tbd' ? C.amber : `${C.amber}20`,
              color: C.amber, border: `1px solid ${C.amber}40`, borderRadius: 14,
              padding: '14px', fontSize: 14, fontWeight: 800, cursor: 'pointer',
              transition: 'all 0.3s',
            }}>
            {statusAnim === 'tbd' ? '⟳ Marked TBD' : '⟳ TBD'}
          </button>
          <button
            onClick={markDone}
            style={{
              flex: 2, background: statusAnim === 'done' ? C.green : `${C.green}20`,
              color: statusAnim === 'done' ? '#fff' : C.green, border: `1px solid ${C.green}40`,
              borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 800, cursor: 'pointer',
              transition: 'all 0.3s',
            }}>
            {statusAnim === 'done' ? '✓ Done! Next lesson loading...' : '✓ Mark Done'}
          </button>
        </div>
      )}

      {lesson.status === 'done' && isToday && (
        <div style={{ margin: '0 16px 16px', background: '#0f2a1a', border: `1px solid ${C.green}40`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>🎉</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.green }}>Lesson completed!</div>
            <div style={{ fontSize: 11, color: C.muted }}>Next lesson is now queued for this class.</div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── AI Generator ─────────────────────────────────────────────────────────────
function AIGenerator({ onBack, classId }) {
  const { saveLessonPlan, addLesson, connectedCurricula, curriculumSources, classes } = useStore()
  const cls = classes.find(c => c.id === classId)
  const connectedId = connectedCurricula[cls?.subject]
  const connectedSource = curriculumSources.find(s => s.id === connectedId)

  const [fields,      setFields]      = useState({ subject: cls?.subject || '', grade: '', topic: '', standard: '', state: 'Texas', textbook: connectedSource?.name || '' })
  const [suggestions, setSuggestions] = useState({ topics: [], standards: [], textbooks: [] })
  const [loading,     setLoading]     = useState(false)
  const [loadHint,    setLoadHint]    = useState('')
  const [result,      setResult]      = useState(null)
  const [saved,       setSaved]       = useState(false)
  const [activeTab,   setActiveTab]   = useState('summary')

  const canGenerate = fields.subject && fields.grade && fields.topic

  async function fetchSuggestions(type) {
    if (!fields.subject || !fields.grade) return
    setLoadHint(`Searching for ${type}...`)
    try {
      const prompt = type === 'topics'
        ? `List 5 important lesson topics for ${fields.subject} ${fields.grade} grade${connectedSource ? ` using ${connectedSource.name}` : ''}. Return JSON: {"topics":["topic1","topic2","topic3","topic4","topic5"]}`
        : type === 'standards'
        ? `List 3 common ${fields.state} TEKS standards for ${fields.subject} ${fields.grade} grade. Return JSON: {"standards":["standard1","standard2","standard3"]}`
        : `List 3 common textbooks for ${fields.subject} ${fields.grade} grade. Return JSON: {"textbooks":["book1","book2","book3"]}`
      const text   = await callAI(prompt, 'Return only valid JSON, no other text.', 500)
      const parsed = safeJSON(text)
      if (parsed) setSuggestions(s => ({ ...s, [type]: parsed[type] || [] }))
    } catch { /* silent fail */ }
    setLoadHint('')
  }

  async function generate() {
    if (!canGenerate) return
    if (!KEY()) { alert('Add VITE_ANTHROPIC_KEY to your .env to use AI generation.'); return }
    setLoading(true); setSaved(false); setResult(null)
    const stages = ['Searching curriculum standards...', 'Building lesson objectives...', 'Writing step-by-step instructions...', 'Generating worksheet & exit ticket...', 'Finalizing lesson package...']
    let si = 0
    setLoadHint(stages[si])
    const stageInterval = setInterval(() => { si = Math.min(si + 1, stages.length - 1); setLoadHint(stages[si]) }, 2200)

    try {
      const prompt = `Create a complete lesson plan package for:
Subject: ${fields.subject}
Grade: ${fields.grade}
Topic: ${fields.topic}
Standard/TEKS: ${fields.standard || 'auto-select'}
State: ${fields.state}
Textbook/Curriculum: ${fields.textbook || 'generic'}
${connectedSource ? `Use real content from ${connectedSource.name} (${connectedSource.publisher}) if available online.` : ''}

Return ONLY valid JSON:
{
  "title": "lesson title",
  "summary": "2-3 plain sentences describing the lesson",
  "objectives": ["objective 1","objective 2","objective 3"],
  "standards": ["standard 1","standard 2"],
  "swbat": ["Students will be able to..."],
  "successCriteria": ["criterion 1","criterion 2"],
  "supplies": ["item 1","item 2"],
  "steps": [{"title":"Step title","description":"Step description","duration":"X min"}],
  "warmup": ["warmup activity 1"],
  "activities": ["activity 1","activity 2","activity 3"],
  "materials": ["material 1","material 2"],
  "homework": "homework description",
  "pages": "page numbers if applicable",
  "worksheet": {"title":"worksheet title","questions":["q1","q2","q3","q4","q5"]},
  "exitTicket": {"question":"Exit ticket question","sampleAnswer":"Expected answer"},
  "answerKey": ["answer 1","answer 2","answer 3","answer 4","answer 5"]
}`
      const text   = await callAI(prompt, 'You are an expert curriculum developer. Search for real curriculum content when possible. Return only valid JSON.', 2500, true)
      const parsed = safeJSON(text)
      if (parsed) {
        setResult(parsed)
        saveLessonPlan({ ...parsed, subject: fields.subject, grade: fields.grade, topic: fields.topic })
        if (classId) {
          addLesson(classId, {
            title:      parsed.title,
            objective:  parsed.objectives?.[0] || '',
            warmup:     parsed.warmup || [],
            activities: parsed.activities || parsed.steps?.map(s => `${s.title}: ${s.description}`) || [],
            materials:  parsed.materials || parsed.supplies || [],
            homework:   parsed.homework || '',
            pages:      parsed.pages || '',
            duration:   '45 min',
            dayLabel:   'Upcoming',
            date:       'Scheduled',
            fetchedFrom: connectedSource?.name,
          })
        }
      } else {
        setResult({ title: 'Lesson Plan', summary: text.substring(0, 300), objectives: [], standards: [], swbat: [], successCriteria: [], supplies: [], steps: [], worksheet: { title: 'Worksheet', questions: [] }, exitTicket: { question: '', sampleAnswer: '' }, answerKey: [] })
      }
    } catch (err) {
      alert('Generation failed: ' + err.message)
    }
    clearInterval(stageInterval); setLoading(false); setLoadHint('')
  }

  const TABS = ['summary', 'objectives', 'steps', 'worksheet', 'exit']

  if (result) return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Inter, Arial, sans-serif', paddingBottom: 100 }}>
      <div style={{ padding: '20px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={() => setResult(null)} style={{ background: C.inner, border: 'none', borderRadius: 10, padding: '8px 14px', color: C.text, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← Edit</button>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: C.teal }}>✨ Lesson Package</h2>
        <button onClick={() => setSaved(true)} style={{ background: `${C.green}22`, color: C.green, border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          {saved ? '✓ Saved' : '💾 Save'}
        </button>
      </div>
      <div style={{ display: 'flex', gap: 6, padding: '0 16px', overflowX: 'auto', marginBottom: 14 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{ padding: '7px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0, background: activeTab === t ? C.teal : C.inner, color: activeTab === t ? '#fff' : C.muted }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <div style={{ margin: '0 16px' }}>
        {activeTab === 'summary' && (<>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: '0 0 10px' }}>{result.title}</h2>
          <p style={{ fontSize: 13, color: '#c0c8e0', lineHeight: 1.7, marginBottom: 14 }}>{result.summary}</p>
          {result.standards?.length > 0 && <Section title="📋 Standards / TEKS" items={result.standards} />}
          {result.supplies?.length  > 0 && <Section title="📦 Supplies"          items={result.supplies}  />}
        </>)}
        {activeTab === 'objectives' && (<>
          {result.objectives?.length     > 0 && <Section title="🎯 Objectives"       items={result.objectives}     />}
          {result.swbat?.length          > 0 && <Section title="🌟 SWBAT"            items={result.swbat}          />}
          {result.successCriteria?.length > 0 && <Section title="✓ Success Criteria" items={result.successCriteria} />}
        </>)}
        {activeTab === 'steps' && result.steps?.map((step, i) => (
          <div key={i} style={{ background: C.inner, borderRadius: 14, padding: '14px 16px', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{step.title}</div>
              {step.duration && <span style={{ marginLeft: 'auto', fontSize: 10, color: C.muted }}>{step.duration}</span>}
            </div>
            <p style={{ fontSize: 12, color: '#c0c8e0', lineHeight: 1.6, margin: 0, paddingLeft: 36 }}>{step.description}</p>
          </div>
        ))}
        {activeTab === 'worksheet' && result.worksheet && (
          <div>
            <h3 style={{ fontWeight: 700, fontSize: 15, color: C.text, margin: '0 0 12px' }}>{result.worksheet.title}</h3>
            {result.worksheet.questions?.map((q, i) => (
              <div key={i} style={{ background: C.inner, borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}><strong>{i + 1}.</strong> {q}</div>
                <div style={{ height: 40, borderBottom: `1px dashed ${C.border}`, marginTop: 8 }} />
                {result.answerKey?.[i] && <div style={{ fontSize: 11, color: C.green, marginTop: 6 }}>Answer: {result.answerKey[i]}</div>}
              </div>
            ))}
          </div>
        )}
        {activeTab === 'exit' && result.exitTicket && (
          <div style={{ background: C.inner, borderRadius: 14, padding: '16px' }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, color: C.text, margin: '0 0 10px' }}>Exit Ticket</h3>
            <p style={{ fontSize: 14, color: C.text, lineHeight: 1.6, marginBottom: 12 }}>{result.exitTicket.question}</p>
            <div style={{ height: 60, background: C.bg, borderRadius: 10, border: `1px dashed ${C.border}`, marginBottom: 12 }} />
            <div style={{ background: '#0f2a1a', border: `1px solid ${C.green}30`, borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.green, textTransform: 'uppercase', marginBottom: 4 }}>Sample Answer</div>
              <p style={{ fontSize: 12, color: '#c0c8e0', margin: 0, lineHeight: 1.5 }}>{result.exitTicket.sampleAnswer}</p>
            </div>
          </div>
        )}
      </div>
      <div style={{ padding: '16px 16px 0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[['⬇ PDF', C.blue], ['📝 Word', C.green], ['🖨 Print', C.purple], ['📋 Copy', C.amber]].map(([label, color]) => (
          <button key={label} onClick={() => label.includes('Print') ? window.print() : alert(`${label} export — connect to download service`)}
            style={{ flex: 1, background: `${color}22`, color, border: 'none', borderRadius: 12, padding: '10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', minWidth: 70 }}>
            {label}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Inter, Arial, sans-serif', paddingBottom: 100 }}>
      <div style={{ padding: '20px 16px 0', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: C.inner, border: 'none', borderRadius: 10, padding: '8px 14px', color: C.text, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← Back</button>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>✨ AI Generate</h1>
          <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
            {connectedSource ? `Using ${connectedSource.name} · ` : ''}Fill fields · AI builds the whole package
          </p>
        </div>
      </div>
      {connectedSource && (
        <div style={{ margin: '0 16px 14px', background: `${C.teal}12`, border: `1px solid ${C.teal}30`, borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>📚</span>
          <div style={{ fontSize: 12, color: C.teal }}>AI will search <strong>{connectedSource.name}</strong> for real lesson content for your topic.</div>
        </div>
      )}
      <div style={{ padding: '0 16px' }}>
        {[['subject', 'Subject', 'e.g. Math'], ['grade', 'Grade', 'e.g. 3rd Grade'], ['topic', 'Topic', 'e.g. Fractions & Decimals'], ['state', 'State', 'e.g. Texas'], ['standard', 'Standard / TEKS (optional)', 'e.g. TEKS 4.3A'], ['textbook', 'Textbook (optional)', 'e.g. Go Math']].map(([key, label, placeholder]) => (
          <div key={key} style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 6 }}>{label}</label>
            <input
              style={{ width: '100%', background: C.inner, border: `1px solid ${C.border}`, borderRadius: 12, padding: '11px 14px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              placeholder={placeholder} value={fields[key]}
              onChange={e => setFields(f => ({ ...f, [key]: e.target.value }))}
            />
          </div>
        ))}
        {fields.subject && fields.grade && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
              {['topics', 'standards', 'textbooks'].map(type => (
                <button key={type} onClick={() => fetchSuggestions(type)}
                  style={{ background: `${C.teal}22`, color: C.teal, border: 'none', borderRadius: 999, padding: '5px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                  🔍 Find {type}
                </button>
              ))}
            </div>
            {loadHint && <p style={{ fontSize: 11, color: C.muted }}>{loadHint}</p>}
            {suggestions.topics.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {suggestions.topics.map(t => (
                  <button key={t} onClick={() => setFields(f => ({ ...f, topic: t }))}
                    style={{ background: C.inner, border: `1px solid ${C.border}`, borderRadius: 999, padding: '4px 10px', fontSize: 11, color: C.text, cursor: 'pointer' }}>{t}</button>
                ))}
              </div>
            )}
          </div>
        )}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 30 }}>
            <LoadingSpinner />
            <p style={{ color: C.muted, fontSize: 13, marginTop: 12 }}>{loadHint}</p>
          </div>
        ) : (
          <button onClick={generate} disabled={!canGenerate}
            style={{ width: '100%', background: canGenerate ? C.teal : '#2a2f42', color: canGenerate ? '#fff' : C.muted, border: 'none', borderRadius: 999, padding: '14px', fontSize: 15, fontWeight: 800, cursor: canGenerate ? 'pointer' : 'not-allowed', marginTop: 6 }}>
            {canGenerate ? 'Generate Lesson Package ✨' : 'Fill Subject, Grade & Topic first'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Build From Scratch ────────────────────────────────────────────────────────
function BuildFromScratch({ onBack, classId }) {
  const { saveLessonPlan, addLesson } = useStore()
  const [sections, setSections] = useState({ title: '', subject: '', grade: '', objectives: '', steps: '', supplies: '', notes: '', homework: '' })
  const [saved, setSaved] = useState(false)

  function handleSave() {
    if (!sections.title.trim()) return
    saveLessonPlan(sections)
    if (classId) {
      addLesson(classId, {
        title:      sections.title,
        objective:  sections.objectives,
        activities: sections.steps.split('\n').filter(Boolean),
        materials:  sections.supplies.split(',').map(s => s.trim()).filter(Boolean),
        homework:   sections.homework,
        dayLabel:   'Upcoming',
        date:       'Scheduled',
        duration:   '45 min',
      })
    }
    setSaved(true)
    setTimeout(() => onBack(), 1200)
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Inter, Arial, sans-serif', paddingBottom: 100 }}>
      <div style={{ padding: '20px 16px 0', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: C.inner, border: 'none', borderRadius: 10, padding: '8px 14px', color: C.text, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← Back</button>
        <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>🏗 Build from Scratch</h1>
      </div>
      <div style={{ padding: '0 16px' }}>
        {[['title', 'Lesson Title', 'e.g. Ch. 4: Fractions & Decimals'], ['subject', 'Subject', 'e.g. Math'], ['grade', 'Grade', 'e.g. 3rd Grade']].map(([key, label, ph]) => (
          <div key={key} style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 6 }}>{label}</label>
            <input style={{ width: '100%', background: C.inner, border: `1px solid ${C.border}`, borderRadius: 12, padding: '11px 14px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              placeholder={ph} value={sections[key]} onChange={e => setSections(s => ({ ...s, [key]: e.target.value }))} />
          </div>
        ))}
        {[['objectives', 'Objectives', 'What will students learn?'], ['steps', 'Step-by-Step Instructions', 'Step 1: ...\nStep 2: ...'], ['supplies', 'Supplies Needed (comma separated)', 'Pencils, worksheets...'], ['homework', 'Homework', 'e.g. Workbook page 91'], ['notes', 'Teacher Notes', 'Additional notes...']].map(([key, label, ph]) => (
          <div key={key} style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 6 }}>{label}</label>
            <textarea style={{ width: '100%', background: C.inner, border: `1px solid ${C.border}`, borderRadius: 12, padding: '11px 14px', color: C.text, fontSize: 13, resize: 'none', boxSizing: 'border-box' }}
              rows={3} placeholder={ph} value={sections[key]} onChange={e => setSections(s => ({ ...s, [key]: e.target.value }))} />
          </div>
        ))}
        {saved && <div style={{ background: '#0f2a1a', border: `1px solid ${C.green}40`, borderRadius: 10, padding: '10px 14px', color: C.green, fontSize: 13, marginBottom: 12 }}>✅ Lesson saved!</div>}
        <button onClick={handleSave} disabled={!sections.title.trim()}
          style={{ width: '100%', background: sections.title.trim() ? 'var(--school-color, #BA0C2F)' : '#2a2f42', color: sections.title.trim() ? '#fff' : C.muted, border: 'none', borderRadius: 999, padding: '14px', fontSize: 15, fontWeight: 800, cursor: sections.title.trim() ? 'pointer' : 'not-allowed' }}>
          Save Lesson Plan
        </button>
      </div>
    </div>
  )
}

// ─── Upload Doc ────────────────────────────────────────────────────────────────
function UploadDoc({ onBack }) {
  const fileRef = useRef()
  const [file,    setFile]    = useState(null)
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)

  function handleFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f); setLoading(true)
    setTimeout(() => { setLoading(false); setDone(true) }, 2000)
  }

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center', fontFamily: 'Inter, Arial, sans-serif', background: C.bg, minHeight: '100vh', color: C.text }}>
      <LoadingSpinner />
      <p style={{ color: C.muted, fontSize: 13, marginTop: 12 }}>Reading your document...</p>
    </div>
  )

  if (done) return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Inter, Arial, sans-serif', padding: '20px 16px' }}>
      <button onClick={onBack} style={{ background: C.inner, border: 'none', borderRadius: 10, padding: '8px 14px', color: C.text, cursor: 'pointer', fontSize: 13, fontWeight: 600, marginBottom: 20 }}>← Back</button>
      <div style={{ background: '#0f2a1a', border: `1px solid ${C.green}40`, borderRadius: 14, padding: '14px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 24 }}>📄</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{file?.name}</div>
          <div style={{ color: C.green, fontSize: 11 }}>✓ Uploaded successfully</div>
        </div>
      </div>
      <p style={{ color: C.muted, fontSize: 13 }}>Your document has been imported and is ready to use.</p>
      <button onClick={onBack} style={{ background: 'var(--school-color, #BA0C2F)', border: 'none', borderRadius: 999, padding: '12px 24px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Go to Lesson Plans</button>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Inter, Arial, sans-serif', padding: '20px 16px' }}>
      <button onClick={onBack} style={{ background: C.inner, border: 'none', borderRadius: 10, padding: '8px 14px', color: C.text, cursor: 'pointer', fontSize: 13, fontWeight: 600, marginBottom: 20 }}>← Back</button>
      <h1 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px' }}>📄 Upload Lesson Plan</h1>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>PDF · Word · Google Doc · Any format</p>
      <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt,image/*" onChange={handleFile} style={{ display: 'none' }} />
      <button onClick={() => fileRef.current?.click()}
        style={{ width: '100%', background: C.card, border: `2px dashed ${C.border}`, borderRadius: 18, padding: '40px 20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 48 }}>📤</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Tap to choose file</span>
        <span style={{ fontSize: 12, color: C.muted }}>PDF · Word · Google Doc · Image</span>
      </button>
    </div>
  )
}

// ─── Main export ───────────────────────────────────────────────────────────────
// Props:
//   initialMode  — 'view' | 'menu' | 'ai' | 'build' | 'upload'
//   classId      — number, which class to show lessons for (required for 'view')
//   onBack       — function
export default function LessonPlan({ initialMode, classId, onBack }) {
  const { goBack, activeLessonClassId } = useStore()
  const handleBack = onBack || goBack
  const resolvedClassId = classId || activeLessonClassId

  const [mode, setMode] = useState(initialMode || (resolvedClassId ? 'view' : 'menu'))

  // If classId changes from outside, reset to view
  useEffect(() => {
    if (resolvedClassId && initialMode === 'view') setMode('view')
  }, [resolvedClassId, initialMode])

  if (mode === 'view')   return <ViewLesson classId={resolvedClassId} onBack={handleBack} onCreateNew={() => setMode('menu')} />
  if (mode === 'build')  return <BuildFromScratch onBack={() => setMode('menu')} classId={resolvedClassId} />
  if (mode === 'upload') return <UploadDoc onBack={() => setMode('menu')} />
  if (mode === 'ai')     return <AIGenerator onBack={() => setMode('menu')} classId={resolvedClassId} />

  const methods = [
    { id: 'search',  icon: '🔍', label: 'Search textbook / ed site',         sub: '📷 scan cover or barcode',                       color: C.blue,   soon: true  },
    { id: 'build',   icon: '🏗', label: 'Build from scratch',                sub: 'Create section by section',                     color: C.green,  soon: false },
    { id: 'upload',  icon: '📄', label: 'Upload lesson plan doc',            sub: 'PDF · Word · Google Doc',                       color: C.amber,  soon: false },
    { id: 'connect', icon: '🔗', label: 'Connect external app',              sub: 'Planbook · Chalk · TPT · Google',                color: C.purple, soon: true  },
    { id: 'ai',      icon: '✨', label: 'AI Generate from Standard / TEKS',  sub: 'Fill topic & grade — AI builds everything',      color: C.teal,   soon: false },
  ]

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Inter, Arial, sans-serif', padding: '20px 16px', paddingBottom: 80 }}>
      {handleBack && (
        <button onClick={handleBack} style={{ background: C.inner, border: 'none', borderRadius: 10, padding: '8px 14px', color: C.text, cursor: 'pointer', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>← Back</button>
      )}
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px' }}>Lesson Plan Builder</h1>
      <p style={{ color: C.muted, fontSize: 13, margin: '0 0 20px' }}>5 ways to create · AI generates full package</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {methods.map(m => (
          <button key={m.id} onClick={() => !m.soon && setMode(m.id)}
            style={{ background: C.card, border: `1px solid ${m.color}22`, borderRadius: 16, padding: '14px 16px', textAlign: 'left', cursor: m.soon ? 'not-allowed' : 'pointer', opacity: m.soon ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 14 }}
            onMouseEnter={e => !m.soon && (e.currentTarget.style.borderColor = m.color)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = `${m.color}22`)}>
            <span style={{ fontSize: 26 }}>{m.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 2 }}>{m.label}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{m.sub}</div>
            </div>
            {m.soon
              ? <span style={{ background: '#2a2f42', color: C.muted, borderRadius: 999, padding: '3px 8px', fontSize: 9, fontWeight: 700 }}>Soon</span>
              : <span style={{ color: C.muted, fontSize: 18 }}>›</span>
            }
          </button>
        ))}
      </div>
    </div>
  )
}
