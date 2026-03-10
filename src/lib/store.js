diff --git a/src/lib/store.js b/src/lib/store.js
index 18b42966cdc763d8109ca10f188c6625c9f74e91..9c860c6ac0c5d027d0aee3d1dd5b89a97c7602bc 100644
--- a/src/lib/store.js
+++ b/src/lib/store.js
@@ -57,95 +57,106 @@ const DEMO_FEED = [
   { id: 1, classId: 1, author: 'Ms. Johnson', content: '📅 Unit Test Friday! Review chapters 3-4. Study guide posted below.', time: '2 hours ago', reactions: { '👍': 12, '❤️': 5, '😂': 2 }, confused: 3, questions: 1, approved: true },
   { id: 2, classId: 1, author: 'Ms. Johnson', content: "🎉 Great work on yesterday's homework! Class average was 87%.", time: 'Yesterday', reactions: { '👍': 18, '❤️': 9, '😂': 4 }, confused: 0, questions: 0, approved: true },
 ]
 
 export const useStore = create((set, get) => ({
   teacher: { id: 1, name: 'Ms. Johnson', school: 'Lincoln Elementary', schoolColor: '#3b7ef4', avatar: '👩‍🏫' },
 
   classes: DEMO_CLASSES,
   students: DEMO_STUDENTS,
   assignments: DEMO_ASSIGNMENTS,
   grades: DEMO_GRADES,
   messages: DEMO_MESSAGES,
   lessons: DEMO_LESSONS,
   lessonPlans: [], // teacher-created lesson plans
   feed: DEMO_FEED,
 
   activeScreen: 'dashboard',
   activeClass: null,
   activeStudent: null,
   previousScreen: null,
   notifications: 3,
 
   weights: { test: 40, quiz: 30, homework: 20, participation: 10 },
   lessonPlanMode: null, // 'ai' | 'build' | 'upload' | null for menu
   keyAlertsDismissed: [], // assignment ids where teacher said 'no key needed'
+  quickCreateAssignment: null,
 
   // setScreen always tracks previous screen for back button
   setScreen: (screen) => set(state => ({
     previousScreen: state.activeScreen,
     activeScreen: screen
   })),
 
   // goBack returns to previous screen, or dashboard if none
   goBack: () => set(state => ({
     activeScreen: state.previousScreen || 'dashboard',
     previousScreen: null
   })),
 
   // setActiveClass — pass null to clear
   setActiveClass: (cls) => set(state => ({
     activeClass: cls,
     previousScreen: state.activeScreen,
     activeScreen: cls ? 'gradebook' : state.activeScreen
   })),
 
   // setActiveStudent — pass null to clear
   setActiveStudent: (student) => set(state => ({
     activeStudent: student,
     previousScreen: state.activeScreen,
     activeScreen: student ? 'studentProfile' : state.activeScreen
   })),
 
   getStudentsForClass: (classId) => get().students.filter(s => s.classId === classId),
   getAssignmentsForClass: (classId) => get().assignments.filter(a => a.classId === classId),
   getGradeForStudentAssignment: (studentId, assignmentId) =>
     get().grades.find(g => g.studentId === studentId && g.assignmentId === assignmentId),
 
   getNeedsAttention: () => get().students.filter(s => s.grade < 70 || s.flagged || s.submitUngraded),
 
   updateGrade: (studentId, assignmentId, score) => set(state => ({
     grades: state.grades.map(g =>
       g.studentId === studentId && g.assignmentId === assignmentId ? { ...g, score } : g
     )
   })),
 
   updateMessage: (id, changes) => set(state => ({
     messages: state.messages.map(m => m.id === id ? { ...m, ...changes } : m)
   })),
 
   addAssignment: (assignment) => set(state => ({
     assignments: [...state.assignments, { ...assignment, id: Date.now() }]
   })),
 
+  addClass: ({ period, subject, students = 0, color = '#3b7ef4' }) => set(state => {
+    const nextId = Math.max(0, ...state.classes.map(c => c.id)) + 1
+    return {
+      classes: [...state.classes, { id: nextId, period, subject, students, gpa: 0, trend: 'stable', color }]
+    }
+  }),
+
+  startQuickCreateAssignment: (type = null) => set({ quickCreateAssignment: type, activeScreen: 'gradebook' }),
+  clearQuickCreateAssignment: () => set({ quickCreateAssignment: null }),
+
   updateWeights: (weights) => set({ weights }),
 
   dismissKeyAlert: (assignmentId) => set(state => ({
     keyAlertsDismissed: [...state.keyAlertsDismissed, assignmentId]
   })),
 
   setLessonPlanMode: (mode) => set({ lessonPlanMode: mode }),
 
   saveLessonPlan: (plan) => set(state => ({
     lessonPlans: [...state.lessonPlans, { ...plan, id: Date.now(), savedAt: new Date().toISOString() }]
   })),
 
   dismissMessage: (id) => set(state => ({
     messages: state.messages.map(m => m.id === id ? { ...m, status: 'sent' } : m)
   })),
 
   getClassGPA: (classId) => {
     const students = get().students.filter(s => s.classId === classId)
     if (!students.length) return 0
     return Math.round(students.reduce((sum, s) => sum + s.grade, 0) / students.length * 10) / 10
   },
 }))
