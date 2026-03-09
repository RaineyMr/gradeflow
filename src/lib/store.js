import { create } from 'zustand'

// Demo data for testing
const DEMO_CLASSES = [
  { id: 1, period: '1st', subject: 'Math', students: 24, gpa: 87.4, trend: 'up', color: '#3b7ef4' },
  { id: 2, period: '2nd', subject: 'Reading', students: 22, gpa: 91.2, trend: 'up', color: '#22c97a' },
  { id: 3, period: '3rd', subject: 'Science', students: 26, gpa: 63.8, trend: 'down', color: '#f04a4a' },
  { id: 4, period: '4th', subject: 'Writing', students: 20, gpa: 84.0, trend: 'stable', color: '#f5a623' },
]

const DEMO_STUDENTS = [
  { id: 1, classId: 1, name: 'Aaliyah Brooks', grade: 95, letter: 'A', submitted: false, flagged: false },
  { id: 2, classId: 1, name: 'Marcus Thompson', grade: 58, letter: 'F', submitted: true, submitUngraded: true, flagged: true },
  { id: 3, classId: 1, name: 'Sofia Rodriguez', grade: 82, letter: 'B', submitted: false, flagged: false },
  { id: 4, classId: 1, name: 'Jordan Williams', grade: 74, letter: 'C', submitted: true, submitUngraded: false, flagged: false },
  { id: 5, classId: 1, name: 'Priya Patel', grade: 91, letter: 'A', submitted: false, flagged: false },
  { id: 6, classId: 2, name: 'Noah Johnson', grade: 88, letter: 'B', submitted: false, flagged: false },
  { id: 7, classId: 2, name: 'Emma Davis', grade: 96, letter: 'A', submitted: false, flagged: false },
  { id: 8, classId: 3, name: 'Liam Martinez', grade: 61, letter: 'D', submitted: true, submitUngraded: true, flagged: true },
  { id: 9, classId: 3, name: 'Zoe Anderson', grade: 55, letter: 'F', submitted: false, flagged: true },
]

const DEMO_ASSIGNMENTS = [
  { id: 1, classId: 1, name: 'Ch.3 Quiz', type: 'quiz', weight: 30, date: '2024-10-14', dueDate: '2024-10-14' },
  { id: 2, classId: 1, name: 'Ch.3 Homework', type: 'homework', weight: 20, date: '2024-10-12', dueDate: '2024-10-12' },
  { id: 3, classId: 1, name: 'Unit Test 1', type: 'test', weight: 40, date: '2024-10-10', dueDate: '2024-10-10' },
  { id: 4, classId: 1, name: 'Participation', type: 'participation', weight: 10, date: '2024-10-01', dueDate: '2024-10-31' },
]

const DEMO_GRADES = [
  { studentId: 1, assignmentId: 1, score: 95, max: 100 },
  { studentId: 1, assignmentId: 2, score: 98, max: 100 },
  { studentId: 1, assignmentId: 3, score: 92, max: 100 },
  { studentId: 2, assignmentId: 1, score: 58, max: 100 },
  { studentId: 2, assignmentId: 2, score: 72, max: 100 },
  { studentId: 2, assignmentId: 3, score: 61, max: 100 },
  { studentId: 3, assignmentId: 1, score: 80, max: 100 },
  { studentId: 3, assignmentId: 2, score: 85, max: 100 },
  { studentId: 3, assignmentId: 3, score: 82, max: 100 },
  { studentId: 4, assignmentId: 1, score: 74, max: 100 },
  { studentId: 4, assignmentId: 2, score: 78, max: 100 },
  { studentId: 5, assignmentId: 1, score: 91, max: 100 },
  { studentId: 5, assignmentId: 2, score: 94, max: 100 },
  { studentId: 5, assignmentId: 3, score: 90, max: 100 },
]

const DEMO_MESSAGES = [
  { id: 1, studentId: 2, studentName: 'Marcus Thompson', subject: 'Math', trigger: 'Failed 58%', status: 'pending', tone: 'Warm & Friendly', draft: "Dear Parent, Marcus received 58% on his Math assessment. I'd love to connect this week to discuss support options.", positiveDraft: "Dear Parent, I wanted to share that Marcus has been showing real effort in Math class. Let's connect to build on that momentum!" },
  { id: 2, studentId: 9, studentName: 'Zoe Anderson', subject: 'Science', trigger: 'Grade dropped 12 pts', status: 'pending', tone: 'Professional', draft: "Dear Parent, I noticed Zoe's Science grade has dropped 12 points recently. I'd like to schedule a brief call to discuss how we can help.", positiveDraft: "Dear Parent, Zoe has shown great curiosity in Science. I'd love to share some ways to keep that momentum going at home." },
]

const DEMO_LESSONS = [
  { id: 1, classId: 1, period: '1st', subject: 'Math', title: 'Ch.4 · Fractions & Decimals', pages: '84-91', duration: 45, date: new Date().toDateString() },
  { id: 2, classId: 2, period: '2nd', subject: 'Reading', title: 'Ch.7 · Comprehension Strategies', pages: '102-115', duration: 50, date: new Date().toDateString() },
]

const DEMO_FEED = [
  { id: 1, classId: 1, author: 'Ms. Johnson', content: '📅 Unit Test Friday! Review chapters 3-4. Study guide posted below.', time: '2 hours ago', reactions: { '👍': 12, '❤️': 5, '😂': 2 }, confused: 3, questions: 1, approved: true },
  { id: 2, classId: 1, author: 'Ms. Johnson', content: '🎉 Great work on yesterday\'s homework! Class average was 87%.', time: 'Yesterday', reactions: { '👍': 18, '❤️': 9, '😂': 4 }, confused: 0, questions: 0, approved: true },
]

export const useStore = create((set, get) => ({
  // Auth
  teacher: { id: 1, name: 'Ms. Johnson', school: 'Lincoln Elementary', schoolColor: '#3b7ef4', avatar: '👩‍🏫' },

  // Data
  classes: DEMO_CLASSES,
  students: DEMO_STUDENTS,
  assignments: DEMO_ASSIGNMENTS,
  grades: DEMO_GRADES,
  messages: DEMO_MESSAGES,
  lessons: DEMO_LESSONS,
  feed: DEMO_FEED,

  // UI state
  activeScreen: 'dashboard',
  screenHistory: [],
  activeClass: null,
  activeStudent: null,
  sidebarOpen: false,
  notifications: 3,

  // Weights
  weights: { test: 40, quiz: 30, homework: 20, participation: 10 },

  // Actions
  setScreen: (screen) => set(state => ({
    activeScreen: screen,
    screenHistory: [...state.screenHistory, state.activeScreen],
  })),

  goBack: () => set(state => {
    const history = [...state.screenHistory]
    const previous = history.pop()
    return {
      activeScreen: previous || 'dashboard',
      screenHistory: history,
    }
  }),

  setActiveClass: (cls) => set(state => ({
    activeClass: cls,
    activeScreen: 'gradebook',
    screenHistory: [...state.screenHistory, state.activeScreen],
  })),

  setActiveStudent: (student) => set(state => ({
    activeStudent: student,
    activeScreen: 'studentProfile',
    screenHistory: [...state.screenHistory, state.activeScreen],
  })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  getStudentsForClass: (classId) => get().students.filter(s => s.classId === classId),
  getAssignmentsForClass: (classId) => get().assignments.filter(a => a.classId === classId),
  getGradeForStudentAssignment: (studentId, assignmentId) =>
    get().grades.find(g => g.studentId === studentId && g.assignmentId === assignmentId),

  getNeedsAttention: () => get().students.filter(s => s.grade < 70 || s.flagged),

  updateGrade: (studentId, assignmentId, score) => set(state => ({
    grades: state.grades.map(g =>
      g.studentId === studentId && g.assignmentId === assignmentId
        ? { ...g, score }
        : g
    )
  })),

  addAssignment: (assignment) => set(state => ({
    assignments: [...state.assignments, { ...assignment, id: Date.now() }]
  })),

  addClass: (cls) => set(state => ({
    classes: [...state.classes, { ...cls, id: Date.now(), gpa: 0, trend: 'stable', students: 0 }]
  })),

  dismissMessage: (id) => set(state => ({
    messages: state.messages.map(m => m.id === id ? { ...m, status: 'sent' } : m)
  })),

  updateMessageDraft: (id, draft) => set(state => ({
    messages: state.messages.map(m => m.id === id ? { ...m, draft } : m)
  })),

  getClassGPA: (classId) => {
    const students = get().students.filter(s => s.classId === classId)
    if (!students.length) return 0
    return Math.round(students.reduce((sum, s) => sum + s.grade, 0) / students.length * 10) / 10
  },
}))
