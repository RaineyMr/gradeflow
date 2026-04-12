import { create } from 'zustand'
import { supabase } from './supabase'
import { demoSupportNotes } from './demoSupportNotes'
import { pageToHash } from './hashRouter'
import {
  generateFollowUpReminders,
  generateRiskTriggeredTasks,
  generateParentTemplates,
  generateCaseloadAlerts,
  generateGroupMaintenanceSuggestions,
  generateMeetingPrepPacket,
  generateWeeklySummary,
} from './automationEngine'

// ─── Fallback Demo Data (used if Supabase is unreachable) ─────────────────────
const DEMO_CLASSES = [
  { id: 1, period: '1st', subject: 'Math',    students: 24, gpa: 87.4, trend: 'up',     color: '#3b7ef4', needsAttention: 3 },
  { id: 2, period: '2nd', subject: 'Reading', students: 22, gpa: 91.2, trend: 'up',     color: '#22c97a', needsAttention: 1 },
  { id: 3, period: '3rd', subject: 'Science', students: 26, gpa: 63.8, trend: 'down',   color: '#f04a4a', needsAttention: 8 },
  { id: 4, period: '4th', subject: 'Writing', students: 20, gpa: 84.0, trend: 'stable', color: '#f54a7a', needsAttention: 0 },
]

const DEMO_STUDENTS = [
  { id: 1,  classId: 1, name: 'Aaliyah Brooks',  grade: 95, letter: 'A', submitted: false, submitUngraded: false, flagged: false, accommodations: null },
  { id: 2,  classId: 1, name: 'Marcus Thompson', grade: 58, letter: 'F', submitted: true,  submitUngraded: true,  flagged: true,  accommodations: ['504 plan - Extended time'] },
  { id: 3,  classId: 1, name: 'Sofia Rodriguez', grade: 82, letter: 'B', submitted: false, submitUngraded: false, flagged: false, accommodations: null },
  { id: 4,  classId: 1, name: 'Jordan Williams', grade: 74, letter: 'C', submitted: true,  submitUngraded: false, flagged: false, accommodations: null },
  { id: 5,  classId: 1, name: 'Priya Patel',     grade: 91, letter: 'A', submitted: false, submitUngraded: false, flagged: false, accommodations: null },
  { id: 6,  classId: 2, name: 'Noah Johnson',    grade: 88, letter: 'B', submitted: false, submitUngraded: false, flagged: false, accommodations: ['504 plan - Extended time'] },
  { id: 7,  classId: 2, name: 'Emma Davis',      grade: 96, letter: 'A', submitted: false, submitUngraded: false, flagged: false, accommodations: null },
  { id: 8,  classId: 3, name: 'Liam Martinez',   grade: 61, letter: 'D', submitted: true,  submitUngraded: true,  flagged: true,  accommodations: ['504 plan - Extended time', 'Calculator access'] },
  { id: 9,  classId: 3, name: 'Zoe Anderson',    grade: 55, letter: 'F', submitted: false, submitUngraded: false, flagged: true,  accommodations: ['504 plan - Extended time'] },
  { id: 10, classId: 4, name: 'Ethan Brown',     grade: 79, letter: 'C', submitted: true,  submitUngraded: false, flagged: false, accommodations: null },
]

const DEMO_ASSIGNMENTS = [
  { id: 1, classId: 1, name: 'Ch.3 Quiz',     type: 'quiz',         categoryId: 2, date: '2024-10-14', dueDate: '2024-10-14', hasKey: true,  options: {} },
  { id: 2, classId: 1, name: 'Ch.3 Homework', type: 'homework',     categoryId: 3, date: '2024-10-12', dueDate: '2024-10-12', hasKey: true,  options: {} },
  { id: 3, classId: 1, name: 'Unit Test 1',   type: 'test',         categoryId: 1, date: '2024-10-10', dueDate: '2024-10-10', hasKey: false, options: {} },
  { id: 4, classId: 1, name: 'Participation', type: 'participation', categoryId: 4, date: '2024-10-01', dueDate: '2024-10-31', hasKey: false, options: { max_points: 10 } },
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
  { id: 1, studentName: 'Marcus Thompson', subject: 'Math',    trigger: 'Failed 58%',      status: 'pending', tone: 'Warm & Friendly', draft: "Dear Parent, Marcus received 58% on his Math assessment. I'd love to connect this week to discuss support options.", positiveDraft: "Hi! Just wanted to share that Marcus is showing real effort in class. Let's keep building on that momentum!", dayOld: false },
  { id: 2, studentName: 'Aaliyah Brooks',  subject: 'Reading', trigger: 'Improved +12pts', status: 'sent',    tone: 'Celebrating',     draft: "Great news! Aaliyah improved her Reading score by 12 points. She's working so hard!", positiveDraft: "Aaliyah is doing amazing work. Her dedication is really paying off!", dayOld: false },
  { id: 3, studentName: 'Liam Martinez',   subject: 'Science', trigger: 'Failed 61%',      status: 'pending', tone: 'Warm & Friendly', draft: "Dear Parent, I wanted to reach out regarding Liam's recent Science assessment.", positiveDraft: "Liam is showing curiosity in Science class. Here are some ways to support at home!", dayOld: true  },
]

// NOTE: DEMO_LESSONS and other demo data truncated for brevity in this example
// Keep your existing DEMO_LESSONS, DEMO_FEED, DEMO_REMINDERS, DEMO_SCHOOLS from the original file

const DEMO_SCHOOLS = [
  {
    id: 'JFK-HIGH',
    district_id: 'kipp-la',
    name: 'JFK High School',
    address: 'New Orleans, LA',
    primary_color: '#1F4788',
    secondary_color: '#FFFFFF',
    accent_color: '#E31937',
    logo_url: 'https://kippneworleans.org/',
    type: 'high_school',
    grade_levels: ['9th Grade', '10th Grade', '11th Grade', '12th Grade'],
  },
]

export const useStore = create((set, get) => ({
  // ─── User & Auth ──────────────────────────────────────────────────────────
  currentUser: null,
  teacher: {
    id: 'demo-teacher-1',
    name: 'Ms. Rodriguez',
    email: 'ms.rodriguez@houstonisd.org',
    avatar: '👩‍🏫',
    school: 'Houston ISD',
    schoolColor: '#BA0C2F',
    role: 'teacher',
  },
  setCurrentUser: (user) => set({ currentUser: user }),

  // ─── Gradebook State ──────────────────────────────────────────────────────
  activeClass: null,
  activeStudent: null,
  currentGradebookData: {
    students: [],
    assignments: [],
    grades: [],
  },
  
  setActiveClass: (classData) => set({ activeClass: classData }),
  setActiveStudent: (student) => set({ activeStudent: student }),

  // ✨ FETCH GRADEBOOK DATA ──────────────────────────────────────────────────
  fetchGradebookData: async (classId) => {
    try {
      const response = await fetch(`/api/teacher/gradebook?classId=${classId}`)
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }

      const data = await response.json()
      
      set(state => ({
        currentGradebookData: {
          students: data.students || [],
          assignments: data.assignments || [],
          grades: data.grades || [],
        }
      }))

      return data
    } catch (error) {
      console.warn('Gradebook API fetch failed, falling back to demo data:', error)
      
      // Fall back to demo data filtered by classId
      const demoStudents = DEMO_STUDENTS.filter(s => s.classId === classId)
      const demoAssignments = DEMO_ASSIGNMENTS.filter(a => a.classId === classId)
      const demoGrades = DEMO_GRADES

      set(state => ({
        currentGradebookData: {
          students: demoStudents,
          assignments: demoAssignments,
          grades: demoGrades,
        }
      }))

      return {
        students: demoStudents,
        assignments: demoAssignments,
        grades: demoGrades,
      }
    }
  },

  // ─── Categories & Grading ────────────────────────────────────────────────
  categories: [
    { id: 1, name: 'Tests',         weight: 40, color: '#f04a4a', icon: '📝' },
    { id: 2, name: 'Quizzes',       weight: 30, color: '#f5a623', icon: '✓' },
    { id: 3, name: 'Homework',      weight: 20, color: '#22c97a', icon: '📚' },
    { id: 4, name: 'Participation', weight: 10, color: '#3b7ef4', icon: '🙋' },
  ],
  gradingMethod: 'weighted',
  setCategories: (categories) => set({ categories }),
  setGradingMethod: (method) => set({ gradingMethod: method }),

  // ─── Screen Navigation ────────────────────────────────────────────────────
  activeScreen: 'dashboard',
  lessonPlanMode: 'menu',
  setScreen: (screen) => set({ activeScreen: screen }),
  setLessonPlanMode: (mode) => set({ lessonPlanMode: mode }),

  // ─── UI State ─────────────────────────────────────────────────────────────
  notifications: 2,
  menuOpen: false,
  setNotifications: (count) => set({ notifications: count }),
  setMenuOpen: (open) => set({ menuOpen: open }),

  // ─── Existing Methods (Keep all your existing store methods below) ────────
  // Add all your existing Zustand methods here
  // (support staff, lessons, messages, etc.)
  // This keeps the store in sync with what you already have

})) // closes store

export { DEMO_SCHOOLS }
