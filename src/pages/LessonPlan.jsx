diff --git a/src/pages/LessonPlan.jsx b/src/pages/LessonPlan.jsx
index 76ff02bc6795f3873b55b3fd6288ec6aac542084..9e10b1f5a02a3a0054e913a7637f6ff612a8fe5e 100644
--- a/src/pages/LessonPlan.jsx
+++ b/src/pages/LessonPlan.jsx
@@ -533,54 +533,54 @@ function AIGenerator({ onBack }) {
         </div>
       )}
 
       <button onClick={handleGenerate} disabled={!canGenerate || loading}
         className="w-full py-3 rounded-pill font-bold text-white disabled:opacity-40 transition-all hover:opacity-90"
         style={{ background: 'linear-gradient(135deg, #0fb8a0, #22c97a)' }}>
         {loading ? 'Building your lesson...' : `Generate Lesson Package ✨ ${!canGenerate ? '(fill Subject, Grade, Topic)' : ''}`}
       </button>
 
       {loading && (
         <div className="py-6 text-center">
           <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
           <p className="text-text-muted text-sm animate-pulse-soft">AI is building your complete lesson package...</p>
         </div>
       )}
     </div>
   )
 }
 
 // ─── Main Menu ────────────────────────────────────────────────────────────────
 export default function LessonPlan({ initialMode }) {
   const [mode, setMode] = useState(initialMode || 'menu')
 
   if (mode === 'build') return <BuildFromScratch onBack={() => setMode('menu')} />
   if (mode === 'upload') return <UploadDoc onBack={() => setMode('menu')} />
-  if (mode === 'ai') return <AIGenerator onBack={() => setMode('menu')} />
+  if (mode === 'ai' || mode === 'search') return <AIGenerator onBack={() => setMode('menu')} />
 
   const methods = [
-    { id: 'search', icon: '🔍', label: 'Search textbook / ed site', sub: '📷 scan cover or barcode', color: '#3b7ef4', comingSoon: true },
+    { id: 'search', icon: '🔍', label: 'Search textbook / ed site', sub: '📷 scan cover or barcode', color: '#3b7ef4' },
     { id: 'build', icon: '🏗', label: 'Build from scratch', sub: 'Create section by section', color: '#22c97a' },
     { id: 'upload', icon: '📄', label: 'Upload lesson plan doc', sub: 'PDF · Word · Google Doc', color: '#f5a623' },
     { id: 'connect', icon: '🔗', label: 'Connect external app', sub: 'Planbook · Chalk · TPT · Google', color: '#9b6ef5', comingSoon: true },
     { id: 'ai', icon: '✨', label: 'AI Generate from Standard/TEKS', sub: 'Fill in topic and grade — AI builds the whole package', color: '#0fb8a0' },
   ]
 
   return (
     <div>
       <h1 className="font-display font-bold text-2xl text-text-primary mb-2">Lesson Plan Builder</h1>
       <p className="text-text-muted text-sm mb-6">5 ways to create · AI generates full package</p>
       <div className="space-y-3">
         {methods.map(method => (
           <button key={method.id}
             onClick={() => !method.comingSoon && setMode(method.id)}
             className="w-full p-4 rounded-card text-left transition-all hover:scale-[1.01]"
             style={{ background: '#161923', border: `1px solid ${method.color}22`, opacity: method.comingSoon ? 0.6 : 1 }}>
             <div className="flex items-center gap-3">
               <span className="text-2xl">{method.icon}</span>
               <div className="flex-1">
                 <p className="font-semibold text-text-primary text-sm">{method.label}</p>
                 <p className="text-text-muted" style={{ fontSize: '11px' }}>{method.sub}</p>
               </div>
               {method.comingSoon
                 ? <span className="text-xs px-2 py-0.5 rounded-pill" style={{ background: '#2a2f42', color: '#6b7494' }}>Soon</span>
                 : <span className="text-text-muted">›</span>
