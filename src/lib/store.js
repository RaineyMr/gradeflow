import { create } from 'zustand'

// ─── Demo Data ────────────────────────────────────────────────────────────────
const DEMO_CLASSES = [
  { id: 1, period: '1st', subject: 'Math',    students: 24, gpa: 87.4, trend: 'up',     color: '#3b7ef4', needsAttention: 3 },
  { id: 2, period: '2nd', subject: 'Reading', students: 22, gpa: 91.2, trend: 'up',     color: '#22c97a', needsAttention: 1 },
  { id: 3, period: '3rd', subject: 'Science', students: 26, gpa: 63.8, trend: 'down',   color: '#f04a4a', needsAttention: 8 },
  { id: 4, period: '4th', subject: 'Writing', students: 20, gpa: 84.0, trend: 'stable', color: '#f54a7a', needsAttention: 0 },
]

const DEMO_STUDENTS = [
  { id: 1, classId: 1, name: 'Aaliyah Brooks',    grade: 95, letter: 'A', submitted: false, submitUngraded: false, flagged: false },
  { id: 2, classId: 1, name: 'Marcus Thompson',   grade: 58, letter: 'F', submitted: true,  submitUngraded: true,  flagged: true  },
  { id: 3, classId: 1, name: 'Sofia Rodriguez',   grade: 82, letter: 'B', submitted: false, submitUngraded: false, flagged: false },
  { id: 4, classId: 1, name: 'Jordan Williams',   grade: 74, letter: 'C', submitted: true,  submitUngraded: false, flagged: false },
  { id: 5, classId: 1, name: 'Priya Patel',       grade: 91, letter: 'A', submitted: false, submitUngraded: false, flagged: false },
  { id: 6, classId: 2, name: 'Noah Johnson',      grade: 88, letter: 'B', submitted: false, submitUngraded: false, flagged: false },
  { id: 7, classId: 2, name: 'Emma Davis',        grade: 96, letter: 'A', submitted: false, submitUngraded: false, flagged: false },
  { id: 8, classId: 3, name: 'Liam Martinez',     grade: 61, letter: 'D', submitted: true,  submitUngraded: true,  flagged: true  },
  { id: 9, classId: 3, name: 'Zoe Anderson',      grade: 55, letter: 'F', submitted: false, submitUngraded: false, flagged: true  },
  { id:10, classId: 4, name: 'Ethan Brown',       grade: 79, letter: 'C', submitted: true,  submitUngraded: false, flagged: false },
]

const DEMO_ASSIGNMENTS = [
  { id: 1, classId: 1, name: 'Ch.3 Quiz',     type: 'quiz',          weight: 30, date: '2024-10-14', dueDate: '2024-10-14', hasKey: true  },
  { id: 2, classId: 1, name: 'Ch.3 Homework', type: 'homework',      weight: 20, date: '2024-10-12', dueDate: '2024-10-12', hasKey: true  },
  { id: 3, classId: 1, name: 'Unit Test 1',   type: 'test',          weight: 40, date: '2024-10-10', dueDate: '2024-10-10', hasKey: false },
  { id: 4, classId: 1, name: 'Participation', type: 'participation',  weight: 10, date: '2024-10-01', dueDate: '2024-10-31', hasKey: false },
]

const DEMO_GRADES = [
  { studentId: 1, assignmentId: 1, score: 95 },
  { studentId: 1, assignmentId: 2, score: 98 },
  { studentId: 1, assignmentId: 3, score: 92 },
  { studentId: 2, assignmentId: 1, score: 58 },
  { studentId: 2, assignmentId: 2, score: 72 },
  { studentId: 2, assignmentId: 3, score: 45 },
  { studentId: 3, assignmentId: 1, score: 84 },
  { studentId: 3, assignmentId: 2, score: 88 },
  { studentId: 4, assignmentId: 1, score: 76 },
  { studentId: 5, assignmentId: 1, score: 93 },
]

const DEMO_MESSAGES = [
  { id: 1, studentName: 'Marcus Thompson', subject: 'Math', trigger: 'Failed 58%',      status: 'pending', tone: 'Warm & Friendly', draft: "Dear Parent, Marcus received 58% on his Math assessment. I'd love to connect this week to discuss support options.", positiveDraft: "Hi! Just wanted to share that Marcus is showing real effort in class. Let's keep building on that momentum!", dayOld: false },
  { id: 2, studentName: 'Aaliyah Brooks',  subject: 'Reading', trigger: 'Improved +12pts', status: 'sent',    tone: 'Celebrating',    draft: "Great news! Aaliyah improved her Reading score by 12 points. She's working so hard!",                      positiveDraft: "Aaliyah is doing amazing work. Her dedication is really paying off!", dayOld: false },
  { id: 3, studentName: 'Liam Martinez',   subject: 'Science', trigger: 'Failed 61%',      status: 'pending', tone: 'Warm & Friendly', draft: "Dear Parent, I wanted to reach out regarding Liam's recent Science assessment.",                          positiveDraft: "Liam is showing curiosity in Science class. Here are some ways to support at home!",               dayOld: true  },
]

const DEMO_LESSONS = [
  { id: 0, dayLabel: 'Today',    date: 'Tue · Mar 10', classLabel: '3rd Period · Math', title: 'Ch. 4 · Fractions & Decimals',  duration: '45 min', pages: 'Pages 84–91', objective: 'Students will compare fractions and decimals and convert between forms.', warmup: ['Decimal of the day', 'Quick compare: 0.4 vs 3/8'], activities: ['Mini-lesson on fraction/decimal conversion', 'Partner station sort', 'Guided practice problems 1–8', 'Exit ticket'], materials: ['Workbook', 'Whiteboard', 'Fraction strips'], homework: 'Workbook page 91, problems 9–14' },
  { id: 1, dayLabel: 'Previous', date: 'Mon · Mar 9',  classLabel: '3rd Period · Math', title: 'Ch. 4 · Equivalent Fractions',  duration: '45 min', pages: 'Pages 80–83', objective: 'Students will identify and generate equivalent fractions.',                 warmup: ['Visual fraction model review'],                                           activities: ['Teacher modeling', 'Small group practice', 'Independent check'],        materials: ['Workbook', 'Fraction tiles'],                             homework: 'Practice sheet A' },
  { id: 2, dayLabel: 'Next',     date: 'Wed · Mar 11', classLabel: '3rd Period · Math', title: 'Ch. 4 · Ordering Fractions',    duration: '45 min', pages: 'Pages 92–96', objective: 'Students will order fractions, decimals, and percents.',                    warmup: ['Number line challenge'],                                                  activities: ['Calendar problem', 'Guided examples', 'Station rotation'],             materials: ['Workbook', 'Number lines'],                               homework: 'Workbook page 96' },
]

const DEMO_FEED = [
  { id: 1, classId: 1, author: 'Ms. Johnson', content: '📅 Unit Test Friday! Review chapters 3-4. Study guide posted below.', time: '2 hours ago', reactions: { '👍': 12, '❤️': 5, '😂': 2 }, confused: 3, questions: 1, approved: true },
  { id: 2, classId: 1, author: 'Ms. Johnson', content: "🎉 Great work on yesterday's homework! Class average was 87%.",       time: 'Yesterday',  reactions: { '👍': 18, '❤️': 9, '😂': 4 }, confused: 0, questions: 0, approved: true },
]

const DEMO_REMINDERS = [
  { id: 1, text: 'Grade Ch.3 Unit Tests',   due: 'Today',     done: false, priority: 'high'   },
  { id: 2, text: 'Parent call — Marcus T.', due: 'Today',     done: false, priority: 'high'   },
  { id: 3, text: 'Update lesson plan Wed',  due: 'Tomorrow',  done: false, priority: 'medium' },
  { id: 4, text: 'Submit attendance',       due: 'Fri',       done: true,  priority: 'low'    },
]

// ─── Store ────────────────────────────────────────────────────────────────────
export const useStore = create((set, get) => ({
  // ── Auth / User ──────────────────────────────────────────────────────────────
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),

  // ── Teacher profile (used by teacher dashboard) ───────────────────────────
  teacher: { id: 1, name: 'Ms. Johnson', school: 'KIPP New Orleans', schoolColor: '#BA0C2F', avatar: '👩‍🏫' },

  // ── Data ─────────────────────────────────────────────────────────────────────
  classes:     DEMO_CLASSES,
  students:    DEMO_STUDENTS,
  assignments: DEMO_ASSIGNMENTS,
  grades:      DEMO_GRADES,
  messages:    DEMO_MESSAGES,
  lessons:     DEMO_LESSONS,
  lessonPlans: [],
  feed:        DEMO_FEED,
  reminders:   DEMO_REMINDERS,

  // ── Navigation ───────────────────────────────────────────────────────────────
  activeScreen:   'dashboard',
  previousScreen: null,
  activeClass:    null,
  activeStudent:  null,
  notifications:  3,
  lessonPlanMode: null,
  keyAlertsDismissed: [],
  cameraIntent:   null,   // 'grade' | 'upload-assignment' | 'upload-answer-key' | 'upload-roster' | 'submit-assignment'

  setScreen: (screen) => set(state => ({
    previousScreen: state.activeScreen,
    activeScreen: screen,
  })),

  goBack: () => set(state => ({
    activeScreen:   state.previousScreen || 'dashboard',
    previousScreen: null,
  })),

  setActiveClass: (cls) => set(state => ({
    activeClass:    cls,
    previousScreen: state.activeScreen,
    activeScreen:   cls ? 'gradebook' : state.activeScreen,
  })),

  setActiveStudent: (student) => set(state => ({
    activeStudent:  student,
    previousScreen: state.activeScreen,
    activeScreen:   student ? 'studentProfile' : state.activeScreen,
  })),

  setCameraIntent: (intent) => set({ cameraIntent: intent }),
  setLessonPlanMode: (mode) => set({ lessonPlanMode: mode }),

  // ── Grade weights ─────────────────────────────────────────────────────────
  weights: { test: 40, quiz: 30, homework: 20, participation: 10 },
  setWeights: (w) => set({ weights: w }),

  // ── Computed ─────────────────────────────────────────────────────────────────
  getStudentsForClass:           (classId)        => get().students.filter(s => s.classId === classId),
  getAssignmentsForClass:        (classId)        => get().assignments.filter(a => a.classId === classId),
  getGradeForStudentAssignment:  (studentId, aId) => get().grades.find(g => g.studentId === studentId && g.assignmentId === aId),
  getNeedsAttention:             ()               => get().students.filter(s => s.grade < 70 || s.flagged || s.submitUngraded),

  // ── Mutations ─────────────────────────────────────────────────────────────────
  updateGrade: (studentId, assignmentId, score) => set(state => ({
    grades: state.grades.map(g =>
      g.studentId === studentId && g.assignmentId === assignmentId ? { ...g, score } : g
    ),
  })),

  updateMessage: (id, changes) => set(state => ({
    messages: state.messages.map(m => m.id === id ? { ...m, ...changes } : m),
  })),

  dismissMessage: (id) => set(state => ({
    messages: state.messages.map(m => m.id === id ? { ...m, status: 'dismissed' } : m),
  })),

  sendMessage: (id) => set(state => ({
    messages: state.messages.map(m => m.id === id ? { ...m, status: 'sent' } : m),
  })),

  addAssignment: (assignment) => set(state => ({
    assignments: [...state.assignments, { ...assignment, id: Date.now() }],
  })),

  saveLessonPlan: (plan) => set(state => ({
    lessonPlans: [...state.lessonPlans, { ...plan, id: Date.now(), createdAt: new Date().toISOString() }],
  })),

  dismissKeyAlert: (assignmentId) => set(state => ({
    keyAlertsDismissed: [...state.keyAlertsDismissed, assignmentId],
  })),

  addReminder: (text) => set(state => ({
    reminders: [...state.reminders, { id: Date.now(), text, due: 'Today', done: false, priority: 'medium' }],
  })),

  toggleReminder: (id) => set(state => ({
    reminders: state.reminders.map(r => r.id === id ? { ...r, done: !r.done } : r),
  })),

  deleteReminder: (id) => set(state => ({
    reminders: state.reminders.filter(r => r.id !== id),
  })),

  addFeedPost: (classId, content) => set(state => ({
    feed: [{ id: Date.now(), classId, author: state.teacher.name, content, time: 'Just now', reactions: {}, confused: 0, questions: 0, approved: false }, ...state.feed],
  })),

  quickCreateAssignment:  (a) => get().addAssignment(a),
  clearQuickCreateAssignment: () => {},
}))
