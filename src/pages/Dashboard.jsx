diff --git a/src/pages/Dashboard.jsx b/src/pages/Dashboard.jsx
index 423ba1542cee74af703b7a85c29524fc76d061df..c60a601f95cf3bf15b2b9bfaaa8c082298a5bb99 100644
--- a/src/pages/Dashboard.jsx
+++ b/src/pages/Dashboard.jsx
@@ -272,85 +272,103 @@ function DailyOverview() {
         <Popup onClose={() => setShowReminders(false)} title="🔔 Reminders">
           <div className="p-5 space-y-3">
             {reminders.map((r, i) => (
               <div key={i} className="flex items-center gap-3 p-3 rounded-card" style={{ background: '#1e2231' }}>
                 <span className="text-xl">{r.icon}</span>
                 <p className="text-sm text-text-primary">{r.text}</p>
               </div>
             ))}
             <button
               onClick={() => setShowReminders(false)}
               className="w-full py-2.5 rounded-pill text-sm font-bold text-white mt-2"
               style={{ background: 'var(--school-color)' }}>
               Got it
             </button>
           </div>
         </Popup>
       )}
 
       {showAttention && <NeedsAttentionModal onClose={() => setShowAttention(false)} />}
     </>
   )
 }
 
 // ── Today's Lessons ───────────────────────────────────────────────────────────
 function TodaysLessons() {
-  const { lessons } = useStore()
-  const [doneIndex, setDoneIndex] = useState(0)
-  const current = lessons[doneIndex]
+  const { lessons, setScreen, setLessonPlanMode } = useStore()
+  const [index, setIndex] = useState(0)
+  const [calendarMode, setCalendarMode] = useState('day')
+  const touchStart = React.useRef(null)
+  const current = lessons[index]
+
+  function openLessonPlan() {
+    setLessonPlanMode('ai')
+    setScreen('lessonPlan')
+  }
+
+  function goPrev() { setIndex(i => Math.max(0, i - 1)) }
+  function goNext() { setIndex(i => Math.min(lessons.length - 1, i + 1)) }
+
+  function onTouchStart(e) { touchStart.current = e.changedTouches[0].clientX }
+  function onTouchEnd(e) {
+    if (touchStart.current == null) return
+    const diff = e.changedTouches[0].clientX - touchStart.current
+    if (diff > 50) goPrev()
+    if (diff < -50) goNext()
+    touchStart.current = null
+  }
 
   if (!current) return (
     <div className="widget">
       <p className="tag-label mb-2">Today's Lessons</p>
       <p className="text-text-muted text-sm">All lessons complete for today 🎉</p>
     </div>
   )
 
   return (
-    <div className="rounded-widget p-4" style={{ background: 'linear-gradient(135deg, #0f2a1a 0%, #0a1a10 100%)', border: '1px solid #1a3a2a' }}>
-      <p className="tag-label mb-2">Today's Lessons</p>
-      <div className="inline-flex items-center px-2 py-0.5 rounded-pill mb-2"
-        style={{ background: '#0fb8a020', color: '#0fb8a0', fontSize: '10px', fontWeight: 700 }}>
-        {current.period} Period · {current.subject}
-      </div>
-      <p className="font-display font-bold text-base text-text-primary mb-1">{current.title}</p>
-      <p className="text-text-muted mb-3" style={{ fontSize: '11px' }}>Pages {current.pages} · {current.duration} min</p>
-      <div className="flex gap-2">
-        <button onClick={() => setDoneIndex(i => i + 1)}
-          className="flex-1 py-1.5 rounded-pill text-xs font-bold transition-all hover:opacity-90"
-          style={{ background: '#22c97a22', color: '#22c97a', border: '1px solid #22c97a40' }}>
-          ✓ Done
-        </button>
-        <button onClick={() => setDoneIndex(i => i + 1)}
-          className="px-4 py-1.5 rounded-pill text-xs font-bold transition-all hover:opacity-90"
-          style={{ background: '#f5a62322', color: '#f5a623', border: '1px solid #f5a62340' }}>
-          TBC →
-        </button>
+    <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
+      className="rounded-widget p-4" style={{ background: 'linear-gradient(135deg, #0f2a1a 0%, #0a1a10 100%)', border: '1px solid #1a3a2a' }}>
+      <div className="flex items-center justify-between mb-2">
+        <p className="tag-label">Today's Lessons</p>
+        <div className="flex items-center gap-2">
+          <button onClick={() => setCalendarMode(m => m === 'day' ? 'week' : m === 'week' ? 'month' : 'day')} className="px-2 py-1 rounded-pill text-xs font-bold" style={{ background: '#1e2231', color: '#eef0f8' }}>📅 {calendarMode}</button>
+          <button onClick={goPrev} disabled={index === 0} className="px-2 py-1 rounded-pill text-xs" style={{ background: '#1e2231', color: '#eef0f8', opacity: index === 0 ? 0.4 : 1 }}>←</button>
+          <button onClick={goNext} disabled={index === lessons.length - 1} className="px-2 py-1 rounded-pill text-xs" style={{ background: '#1e2231', color: '#eef0f8', opacity: index === lessons.length - 1 ? 0.4 : 1 }}>→</button>
+        </div>
       </div>
-      {doneIndex < lessons.length - 1 && (
+
+      <button onClick={openLessonPlan} className="w-full text-left">
+        <div className="inline-flex items-center px-2 py-0.5 rounded-pill mb-2" style={{ background: '#0fb8a020', color: '#0fb8a0', fontSize: '10px', fontWeight: 700 }}>
+          {current.period} Period · {current.subject}
+        </div>
+        <p className="font-display font-bold text-base text-text-primary mb-1">{current.title}</p>
+        <p className="text-text-muted mb-3" style={{ fontSize: '11px' }}>Pages {current.pages} · {current.duration} min · Tap anywhere to open lesson plan</p>
+      </button>
+
+      {index < lessons.length - 1 && (
         <p className="text-text-muted mt-2" style={{ fontSize: '9px' }}>
-          → {lessons.length - doneIndex - 1} more lesson{lessons.length - doneIndex - 1 !== 1 ? 's' : ''} today
+          Swipe on mobile/tablet or use arrows to move between days.
         </p>
       )}
     </div>
   )
 }
 
 // ── Needs Attention widget ────────────────────────────────────────────────────
 // • Clicking the widget background / title / "View all" → opens full modal
 // • Clicking an individual student bubble → navigates directly to that student
 //   (e.stopPropagation prevents the widget onClick from also firing)
 function NeedsAttentionWidget() {
   const { getNeedsAttention } = useStore()
   const students  = getNeedsAttention()
   const [showModal, setShowModal] = useState(false)
 
   function goToStudent(e, s) {
     e.stopPropagation()                          // don't bubble up to widget onClick
     useStore.getState().setActiveStudent(s)
   }
 
   return (
     <>
       {/* The whole widget is clickable — opens the modal */}
       <div
         className="widget"
