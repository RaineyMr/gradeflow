import { create } from 'zustand'
import { supabase } from './supabase'
import { demoSupportNotes } from './demoSupportNotes'

// ─── Fallback Demo Data (used if Supabase is unreachable) ─────────────────────
const DEMO_CLASSES = [
  { id: 1, period: '1st', subject: 'Math',    students: 24, gpa: 87.4, trend: 'up',     color: '#3b7ef4', needsAttention: 3 },
  { id: 2, period: '2nd', subject: 'Reading', students: 22, gpa: 91.2, trend: 'up',     color: '#22c97a', needsAttention: 1 },
  { id: 3, period: '3rd', subject: 'Science', students: 26, gpa: 63.8, trend: 'down',   color: '#f04a4a', needsAttention: 8 },
  { id: 4, period: '4th', subject: 'Writing', students: 20, gpa: 84.0, trend: 'stable', color: '#f54a7a', needsAttention: 0 },
]

const DEMO_STUDENTS = [
  { id: 1,  classId: 1, name: 'Aaliyah Brooks',  grade: 95, letter: 'A', submitted: false, submitUngraded: false, flagged: false },
  { id: 2,  classId: 1, name: 'Marcus Thompson', grade: 58, letter: 'F', submitted: true,  submitUngraded: true,  flagged: true  },
  { id: 3,  classId: 1, name: 'Sofia Rodriguez', grade: 82, letter: 'B', submitted: false, submitUngraded: false, flagged: false },
  { id: 4,  classId: 1, name: 'Jordan Williams', grade: 74, letter: 'C', submitted: true,  submitUngraded: false, flagged: false },
  { id: 5,  classId: 1, name: 'Priya Patel',     grade: 91, letter: 'A', submitted: false, submitUngraded: false, flagged: false },
  { id: 6,  classId: 2, name: 'Noah Johnson',    grade: 88, letter: 'B', submitted: false, submitUngraded: false, flagged: false },
  { id: 7,  classId: 2, name: 'Emma Davis',      grade: 96, letter: 'A', submitted: false, submitUngraded: false, flagged: false },
  { id: 8,  classId: 3, name: 'Liam Martinez',   grade: 61, letter: 'D', submitted: true,  submitUngraded: true,  flagged: true  },
  { id: 9,  classId: 3, name: 'Zoe Anderson',    grade: 55, letter: 'F', submitted: false, submitUngraded: false, flagged: true  },
  { id: 10, classId: 4, name: 'Ethan Brown',     grade: 79, letter: 'C', submitted: true,  submitUngraded: false, flagged: false },
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

const DEMO_LESSONS = {
  1: [
    { id: 'math-0', classId: 1, dayLabel: 'Today',    date: 'Tue · Mar 10', title: 'Ch. 4 · Fractions & Decimals', duration: '45 min', pages: 'Pages 84–91', objective: 'Students will compare fractions and decimals and convert between forms.', warmup: ['Decimal of the day', 'Quick compare: 0.4 vs 3/8'], activities: ['Mini-lesson on fraction/decimal conversion', 'Partner station sort', 'Guided practice problems 1–8', 'Exit ticket'], materials: ['Workbook', 'Whiteboard', 'Fraction strips'], homework: 'Workbook page 91, problems 9–14', status: 'pending' },
    { id: 'math-1', classId: 1, dayLabel: 'Previous', date: 'Mon · Mar 9',  title: 'Ch. 4 · Equivalent Fractions', duration: '45 min', pages: 'Pages 80–83', objective: 'Students will identify and generate equivalent fractions.', warmup: ['Visual fraction model review'], activities: ['Teacher modeling', 'Small group practice', 'Independent check'], materials: ['Workbook', 'Fraction tiles'], homework: 'Practice sheet A', status: 'done' },
    { id: 'math-2', classId: 1, dayLabel: 'Next',     date: 'Wed · Mar 11', title: 'Ch. 4 · Ordering Fractions',   duration: '45 min', pages: 'Pages 92–96', objective: 'Students will order fractions, decimals, and percents.', warmup: ['Number line challenge'], activities: ['Calendar problem', 'Guided examples', 'Station rotation'], materials: ['Workbook', 'Number lines'], homework: 'Workbook page 96', status: 'pending' },
  ],
  2: [
    { id: 'read-0', classId: 2, dayLabel: 'Today',    date: 'Tue · Mar 10', title: 'Unit 3 · Main Idea & Details', duration: '45 min', pages: 'Pages 56–63', objective: 'Students will identify main idea and supporting details in nonfiction.', warmup: ['Quick write: what is the main idea of a paragraph?'], activities: ['Model with mentor text', 'Guided practice', 'Partner work', 'Share out'], materials: ['Anthology', 'Highlighters'], homework: 'Read pages 64–67 and annotate', status: 'pending' },
    { id: 'read-1', classId: 2, dayLabel: 'Previous', date: 'Mon · Mar 9',  title: 'Unit 3 · Text Structure',      duration: '45 min', pages: 'Pages 50–55', objective: 'Students will identify cause/effect and compare/contrast structures.', warmup: ['Signal word sort'], activities: ['Text structure chart', 'Partner read', 'Exit ticket'], materials: ['Anthology'], homework: 'Finish graphic organizer', status: 'done' },
  ],
  3: [
    { id: 'sci-0', classId: 3, dayLabel: 'Today', date: 'Tue · Mar 10', title: 'Ch. 6 · States of Matter', duration: '50 min', pages: 'Pages 120–128', objective: 'Students will describe properties of solids, liquids, and gases.', warmup: ['Matter sort: everyday objects'], activities: ['Lab demo — ice melting', 'Diagram labeling', 'Discussion', 'Quick write'], materials: ['Ice', 'Beakers', 'Lab sheets'], homework: 'Read pages 129–131', status: 'pending' },
  ],
  4: [
    { id: 'writ-0', classId: 4, dayLabel: 'Today', date: 'Tue · Mar 10', title: 'Unit 2 · Argumentative Writing', duration: '45 min', pages: 'Pages 34–41', objective: 'Students will write a claim with at least two supporting reasons.', warmup: ['Take a stand: agree or disagree prompt'], activities: ['Model claim writing', 'Outline drafting', 'Peer feedback'], materials: ['Writing journals', 'Mentor texts'], homework: 'Complete outline draft', status: 'pending' },
  ],
}

const DEMO_FEED = [
  { id: 1, classId: 1, author: 'Ms. Johnson', content: '📅 Unit Test Friday! Review chapters 3-4. Study guide posted below.', time: '2 hours ago', reactions: { '👍': 12, '❤': 5, '😂': 2 }, confused: 3, questions: 1, approved: true },
  { id: 2, classId: 1, author: 'Ms. Johnson', content: "🎉 Great work on yesterday's homework! Class average was 87%.",       time: 'Yesterday',  reactions: { '👍': 18, '❤': 9, '😂': 4 }, confused: 0, questions: 0, approved: true },
]

const DEMO_REMINDERS = [
  { id: 1, text: 'Grade Ch.3 Unit Tests',   due: 'Today',    done: false, priority: 'high'   },
  { id: 2, text: 'Parent call — Marcus T.', due: 'Today',    done: false, priority: 'high'   },
  { id: 3, text: 'Update lesson plan Wed',  due: 'Tomorrow', done: false, priority: 'medium' },
  { id: 4, text: 'Submit attendance',       due: 'Fri',      done: true,  priority: 'low'    },
]

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Tests',         weight: 40, color: '#f04a4a', icon: '📝' },
  { id: 2, name: 'Quizzes',       weight: 30, color: '#f5a623', icon: '✏' },
  { id: 3, name: 'Homework',      weight: 20, color: '#3b7ef4', icon: '📚' },
  { id: 4, name: 'Participation', weight: 10, color: '#22c97a', icon: '🙋' },
]

const CURRICULUM_SOURCES = [
  { id: 'gomath',         name: 'Go Math',              publisher: 'Houghton Mifflin', subjects: ['Math'],           logo: '📐', searchable: true  },
  { id: 'readingwonders', name: 'Reading Wonders',      publisher: 'McGraw-Hill',      subjects: ['Reading', 'ELA'], logo: '📖', searchable: true  },
  { id: 'amplify',        name: 'Amplify Science',      publisher: 'Amplify',          subjects: ['Science'],        logo: '🔬', searchable: true  },
  { id: 'studysync',      name: 'StudySync',            publisher: 'McGraw-Hill',      subjects: ['Writing', 'ELA'], logo: '✍', searchable: true  },
  { id: 'eureka',         name: 'Eureka Math',          publisher: 'Great Minds',      subjects: ['Math'],           logo: '∑',  searchable: true  },
  { id: 'ckscience',      name: 'CK-12 Science',        publisher: 'CK-12',            subjects: ['Science'],        logo: '⚗', searchable: true  },
  { id: 'commonlit',      name: 'CommonLit',            publisher: 'CommonLit',        subjects: ['Reading', 'ELA'], logo: '📜', searchable: true  },
  { id: 'custom',         name: 'Custom / No textbook', publisher: '',                 subjects: [],                 logo: '🏗',  searchable: false },
]

const DEFAULT_CONNECTIONS = {
  powerSchool:    { connected: false, label: 'PowerSchool',        url: 'https://powerschool.com',        category: 'roster',  icon: '🏫', description: 'Pull rosters + sync grades'         },
  infiniteCampus: { connected: false, label: 'Infinite Campus',    url: 'https://infinitecampus.com',     category: 'roster',  icon: '🎓', description: 'Roster sync + grade passback'       },
  skyward:        { connected: false, label: 'Skyward',            url: 'https://skyward.com',            category: 'roster',  icon: '🌤', description: 'Student info + gradebook sync'      },
  canvas:         { connected: false, label: 'Canvas LMS',         url: 'https://canvas.instructure.com', category: 'lms',     icon: '🖼', description: 'Assignments, grades, submissions'   },
  googleClassroom:{ connected: false, label: 'Google Classroom',   url: 'https://classroom.google.com',   category: 'lms',     icon: '🟢', description: 'Assignments + roster import', lastSync: null },
  planbook:       { connected: false, label: 'Planbook',           url: 'https://planbook.com',           category: 'lessons', icon: '📅', description: 'Import your lesson plan calendar'  },
  chalk:          { connected: false, label: 'Chalk',              url: 'https://chalk.com',              category: 'lessons', icon: '🖊', description: 'Curriculum maps + lesson plans'    },
  tpt:            { connected: false, label: 'Teachers Pay Teachers', url: 'https://teacherspayteachers.com', category: 'lessons', icon: '💼', description: 'Import purchased lesson resources' },
  googleDrive:    { connected: true,  label: 'Google Drive',       url: 'https://drive.google.com',       category: 'lessons', icon: '📁', description: 'Upload docs & lesson materials', lastSync: 'Today 9:01am' },
  clever:         { connected: false, label: 'Clever',             url: 'https://clever.com',             category: 'roster',  icon: '🔗', description: 'Single sign-on + roster sync'       },
}

// ─── Supabase row mappers ─────────────────────────────────────────────────────
function mapClass(row) {
  return {
    id:             row.id,
    period:         row.period,
    subject:        row.subject,
    color:          row.color           || '#3b7ef4',
    students:       row.student_count   || 0,
    gpa:            row.gpa             || 0,
    trend:          row.trend           || 'stable',
    needsAttention: row.needs_attention || 0,
  }
}

function mapStudent(row) {
  const score  = row.avg_score ?? row.grade ?? 0
  const letter = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F'
  return {
    id:             row.id,
    classId:        row.class_id,
    name:           row.name,
    email:          row.email          || '',
    grade:          Math.round(score),
    letter,
    submitted:      row.submitted       ?? false,
    submitUngraded: row.submit_ungraded ?? false,
    flagged:        score < 70,
  }
}

function mapAssignment(row) {
  const categoryId =
    row.type === 'test'          ? 1 :
    row.type === 'quiz'          ? 2 :
    row.type === 'homework'      ? 3 :
    row.type === 'participation' ? 4 : 4
  return {
    id:         row.id,
    classId:    row.class_id,
    name:       row.name,
    type:       row.type,
    weight:     row.weight,
    categoryId,
    date:       row.assign_date,
    dueDate:    row.due_date,
    hasKey:     false,
    options:    row.options || {},
  }
}

function mapGrade(row) {
  return { studentId: row.student_id, assignmentId: row.assignment_id, score: row.score }
}

function mapMessage(row) {
  return {
    id:            row.id,
    studentName:   row.students?.name || 'Unknown',
    subject:       'General',
    trigger:       row.trigger_type   || '',
    status:        row.status,
    tone:          row.tone,
    draft:         row.draft_negative || '',
    positiveDraft: row.draft_positive || '',
    dayOld:        false,
  }
}

function mapLesson(row) {
  const plan = row.plan_data || {}
  return {
    id:         row.id,
    classId:    row.class_id,
    dayLabel:   'Today',
    date:       row.lesson_date,
    title:      row.title,
    duration:   row.duration ? `${row.duration} min` : '45 min',
    pages:      row.pages       || '',
    objective:  plan.objective  || '',
    warmup:     plan.warmup     || [],
    activities: plan.activities || [],
    materials:  plan.materials  || [],
    homework:   plan.homework   || '',
    status:     'pending',
  }
}

function mapFeedPost(row) {
  return {
    id:        row.id,
    classId:   row.class_id,
    author:    row.author_name,
    content:   row.content,
    time:      new Date(row.created_at).toLocaleDateString(),
    reactions: row.reactions || {},
    confused:  0,
    questions: 0,
    approved:  row.approved,
  }
}

// ─── Participation helpers ────────────────────────────────────────────────────
function getParticipationPointsForEventType(eventType) {
  if (eventType === 'comment' || eventType === 'question') return 2
  if (eventType === 'reaction') return 1
  return 0
}

// ─── Trend computation helper (used by support staff analytics) ───────────────
function computeTrendFromValues(values) {
  if (!values || values.length < 2) return 'flat'
  const recent = values.slice(-3)
  const first  = recent[0]
  const last   = recent[recent.length - 1]
  if (last > first + 2) return 'up'
  if (last < first - 2) return 'down'
  return 'flat'
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useStore = create((set, get) => ({

  // ── Loading state ───────────────────────────────────────────────────────────
  dbLoaded:    false,
  isHydrated:  false,
  dbError:     null,

  // ── Auth / User ─────────────────────────────────────────────────────────────
  currentUser: null,
  lang:        'en',

  setCurrentUser: (user) => set({ currentUser: user, lang: user?.lang || 'en' }),

  setLang: (lang) => set(state => ({
    lang,
    currentUser: state.currentUser ? { ...state.currentUser, lang } : state.currentUser,
  })),

  // ── Teacher profile ─────────────────────────────────────────────────────────
  teacher: {
    id: 1, name: 'Ms. Johnson', school: 'KIPP New Orleans',
    schoolColor: '#BA0C2F', avatar: '👩‍🏫',
  },

  // ── Data (fallback until Supabase loads) ────────────────────────────────────
  classes:     DEMO_CLASSES,
  students:    DEMO_STUDENTS,
  assignments: DEMO_ASSIGNMENTS,
  grades:      DEMO_GRADES,
  messages:    DEMO_MESSAGES,
  lessons:     DEMO_LESSONS,
  lessonPlans: [],
  feed:        DEMO_FEED,
  reminders:   DEMO_REMINDERS,

  // ── Support Staff state ─────────────────────────────────────────────────────
  supportStaffGroups:       [],
  supportStaffGroupMembers: [],
  studentTrends:            {},
  interventionPlans:        [],
  supportNotes:             [],

  // ── Support Staff — demo data loader ────────────────────────────────────────
  setDemoSupportStaffData: async () => {
    if (get().currentUser?.role !== 'supportStaff') return
    try {
      const {
        demoSupportStaffGroups,
        demoGroupMembers,
        demoStudentTrends,
        demoInterventionPlans,
      } = await import('./demoSupportStaffGroups.js')

      set({
        supportStaffGroups:       demoSupportStaffGroups,
        supportStaffGroupMembers: demoGroupMembers,
        studentTrends:            demoStudentTrends, // already an object keyed by student_id
        interventionPlans:        demoInterventionPlans,
      })
    } catch (e) {
      console.warn('Demo groups data failed to load:', e)
    }
  },

  setDemoSupportNotes: () => {
    if (get().currentUser?.role !== 'supportStaff') return
    set({ supportNotes: demoSupportNotes })
  },

  // ── Support Staff — group actions ───────────────────────────────────────────
  loadSupportStaffGroups: async () => {
    const { currentUser } = get()
    if (currentUser?.role !== 'supportStaff') return []
    try {
      const { data: groups } = await supabase
        .from('support_staff_groups').select('*')
        .eq('staff_id', currentUser.id).order('created_at', { ascending: false })
      set({ supportStaffGroups: groups || [] })
      return groups || []
    } catch { return [] }
  },

  createSupportStaffGroup: async (name, studentIds) => {
    const { currentUser } = get()
    if (currentUser?.role !== 'supportStaff') return null
    try {
      const { data: group } = await supabase
        .from('support_staff_groups').insert({ staff_id: currentUser.id, name })
        .select().single()
      if (group && studentIds?.length) {
        const members = studentIds.map(id => ({ group_id: group.id, student_id: id }))
        await supabase.from('support_staff_group_members').insert(members)
        const { data: groupMembersData } = await supabase
          .from('support_staff_group_members').select('*').eq('group_id', group.id)
        set(state => ({ supportStaffGroupMembers: [...state.supportStaffGroupMembers, ...groupMembersData] }))
      }
      await get().loadSupportStaffGroups()
      return group
    } catch (error) { console.error('Create group failed:', error); return null }
  },

  loadSupportStaffGroupMembers: async (groupId) => {
    try {
      const { data } = await supabase
        .from('support_staff_group_members')
        .select('*, student:students(name, class_id)').eq('group_id', groupId)
      return data || []
    } catch { return [] }
  },

  getSupportStaffGroups: () => get().supportStaffGroups || [],

  getGroupStudents: (groupId) => {
    const { students, supportStaffGroupMembers } = get()
    const memberIds = supportStaffGroupMembers
      .filter(m => m.group_id === groupId).map(m => m.student_id)
    return students.filter(s => memberIds.includes(s.id))
  },

  getStudentsForSupportStaff: () => {
    const { currentUser, students, supportStaffGroupMembers } = get()
    if (currentUser?.role !== 'supportStaff') return []
    const studentIds = new Set(supportStaffGroupMembers.map(m => m.student_id))
    return students.filter(s => studentIds.has(s.id))
  },

  getStudentsInGroup: (groupId) => {
    const { students, supportStaffGroupMembers } = get()
    const groupMembers = supportStaffGroupMembers.filter(m => m.group_id === groupId)
    return students.filter(s => groupMembers.map(m => m.student_id).includes(s.id))
  },

  sendGroupMessage: async ({ groupId, groupName, recipientMode, recipients, subject, body }) => {
    const newMessages = recipients.map(r => ({
      id:            Date.now() + Math.random(),
      studentName:   r.name,
      subject,
      trigger:       `Group: ${groupName} · ${recipientMode}`,
      status:        'sent',
      tone:          'Direct',
      draft:         body,
      positiveDraft: body,
      dayOld:        false,
    }))
    set(state => ({ messages: [...state.messages, ...newMessages] }))
  },

  getTeachersForSupportStaff: () => [
    { id: 't1', name: 'Mr. Rivera',  avatar: '🧑‍🔬', role: 'teacher', subject: 'Science' },
    { id: 't2', name: 'Ms. Davis',   avatar: '👩‍💼', role: 'teacher', subject: 'Reading' },
    { id: 't3', name: 'Ms. Johnson', avatar: '👩‍🏫', role: 'teacher', subject: 'Math'    },
  ],

  getAdminForSupportStaff: () => [
    { id: 'a1', name: 'Principal Davis', avatar: '🏫', role: 'admin', label: 'Principal'     },
    { id: 'a2', name: 'Dr. Green',       avatar: '🎓', role: 'admin', label: 'Vice Principal' },
  ],

  // ── Support Staff — Tier 3: Trend helpers ───────────────────────────────────

  /**
   * Returns trend summary for a single student.
   * Uses studentTrends (loaded from demoSupportStaffGroups) if available,
   * otherwise derives a simple trend from current grade alone.
   */
  getStudentTrendSummary: (studentId) => {
    const { studentTrends, students } = get()
    const student = students.find(s => s.id === studentId)
    if (!student) return null

    const trendData = studentTrends?.[studentId]
    // demoStudentTrends is keyed as { 1: [...periods], 2: [...periods] }
    const periods   = Array.isArray(trendData) ? trendData : []
    const gradeValues = periods.map(p => p.grade_avg || 0)

    return {
      studentId,
      name:          student.name,
      currentGrade:  student.grade,
      flagged:       student.flagged,
      gradeTrend:    computeTrendFromValues(gradeValues.length >= 2 ? gradeValues : [student.grade]),
      riskLevel:     periods[0]?.risk_level || (student.grade < 70 ? 'high' : 'low'),
      notesCount:    periods[0]?.notes_count || 0,
      periods,
    }
  },

  /**
   * Returns trend summaries for all students assigned to this support staff user.
   */
  getAllSupportStaffStudentTrends: () => {
    const { students, supportStaffGroupMembers, studentTrends } = get()
    const assignedIds = new Set(supportStaffGroupMembers.map(m => m.student_id))
    return students
      .filter(s => assignedIds.has(s.id))
      .map(student => {
        const trendData   = studentTrends?.[student.id]
        const periods     = Array.isArray(trendData) ? trendData : []
        const gradeValues = periods.map(p => p.grade_avg || 0)
        return {
          studentId:    student.id,
          name:         student.name,
          currentGrade: student.grade,
          flagged:      student.flagged,
          gradeTrend:   computeTrendFromValues(gradeValues.length >= 2 ? gradeValues : [student.grade]),
          riskLevel:    periods[0]?.risk_level || (student.grade < 70 ? 'high' : 'low'),
          notesCount:   periods[0]?.notes_count || 0,
        }
      })
  },

  // ── Support Staff — Tier 4: Intervention plan actions ───────────────────────

  /**
   * Returns intervention plans for a specific student.
   * Checks local interventionPlans state first, falls back to demoSupportInterventions.
   */
  getSupportStaffInterventionPlans: (studentId) => {
    const { interventionPlans } = get()
    if (interventionPlans.length > 0) {
      return studentId
        ? interventionPlans.filter(p => p.student_id === studentId || p.studentId === studentId)
        : interventionPlans
    }
    // Fallback — return empty; pages import demoSupportInterventions directly
    return []
  },

  /**
   * Creates a new intervention plan locally and optionally persists to Supabase.
   */
  createSupportStaffInterventionPlan: async (studentId, planData) => {
    const { currentUser } = get()
    const newPlan = {
      ...planData,
      id:        planData.id || `int-${Date.now()}`,
      studentId,
      student_id: studentId,
      staff_id:  currentUser?.id || 'support-staff-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    set(state => ({ interventionPlans: [newPlan, ...state.interventionPlans] }))

    try {
      await supabase.from('intervention_plans').insert({
        student_id:    studentId,
        staff_id:      currentUser?.id,
        goal:          planData.goal,
        type:          planData.type,
        steps:         planData.steps,
        progress_notes: planData.progressNotes,
        follow_up_date: planData.followUpDate,
        status:        planData.status || 'active',
      })
    } catch { /* demo mode — silent */ }

    return newPlan
  },

  /**
   * Updates an existing intervention plan locally and optionally persists to Supabase.
   */
  updateSupportStaffInterventionPlan: async (planId, updates) => {
    const updatedPlan = { ...updates, updatedAt: new Date().toISOString() }
    set(state => ({
      interventionPlans: state.interventionPlans.map(p =>
        (p.id === planId) ? { ...p, ...updatedPlan } : p
      ),
    }))

    try {
      await supabase.from('intervention_plans')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', planId)
    } catch { /* demo mode — silent */ }

    return updatedPlan
  },

  // ── Support Staff — Tier 5: Analytics helpers ────────────────────────────────

  /**
   * Grade distribution across assigned students: { A, B, C, D, F, counts, percentages }
   */
  getGradeDistribution: () => {
    const { students, supportStaffGroupMembers } = get()
    const assignedIds = new Set(supportStaffGroupMembers.map(m => m.student_id))
    const assigned    = supportStaffGroupMembers.size > 0
      ? students.filter(s => assignedIds.has(s.id))
      : students  // fallback to all if no groups loaded yet

    const dist = { A:0, B:0, C:0, D:0, F:0 }
    assigned.forEach(s => {
      if      (s.grade >= 90) dist.A++
      else if (s.grade >= 80) dist.B++
      else if (s.grade >= 70) dist.C++
      else if (s.grade >= 60) dist.D++
      else                    dist.F++
    })
    const total = assigned.length || 1
    return {
      ...dist,
      total,
      atRisk:     dist.D + dist.F,
      atRiskPct:  Math.round(((dist.D + dist.F) / total) * 100),
      avgGrade:   assigned.length
        ? Math.round(assigned.reduce((sum, s) => sum + s.grade, 0) / assigned.length)
        : 0,
    }
  },

  /**
   * Support notes analytics: counts by type and trend over time.
   */
  getSupportNotesAnalytics: () => {
    const { supportNotes } = get()
    const byType = supportNotes.reduce((acc, n) => {
      acc[n.note_type || n.type] = (acc[n.note_type || n.type] || 0) + 1
      return acc
    }, {})
    return {
      total:    supportNotes.length,
      byType,
      trend:    supportNotes.length > 4 ? 'up' : 'flat',
    }
  },

  /**
   * Intervention plan analytics: counts by status.
   */
  getInterventionAnalytics: () => {
    const { interventionPlans } = get()
    return {
      total:     interventionPlans.length,
      active:    interventionPlans.filter(p => p.status === 'active').length,
      completed: interventionPlans.filter(p => p.status === 'completed').length,
      overdue:   interventionPlans.filter(p => p.status === 'overdue').length,
    }
  },

  /**
   * Aggregate analytics object for the SupportStaffAnalytics page.
   */
  getSupportStaffAnalytics: () => {
    const store = get()
    return {
      grades:        store.getGradeDistribution(),
      notes:         store.getSupportNotesAnalytics(),
      interventions: store.getInterventionAnalytics(),
    }
  },

  // ── Support Staff — Supabase notes actions ──────────────────────────────────
  loadSupportNotes: async (studentId) => {
    if (get().currentUser?.role !== 'supportStaff') return
    try {
      const userId = get().currentUser.id
      const res = await fetch(`/api/support-notes?studentId=${studentId}`, {
        headers: { 'x-staff-id': userId },
      })
      if (!res.ok) throw new Error('Failed to load notes')
      const { notes } = await res.json()
      set({ supportNotes: notes })
    } catch (err) { console.error('Load support notes failed:', err) }
  },

  addSupportNote: async (note) => {
    const userId = get().currentUser.id
    try {
      const res = await fetch('/api/support-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-staff-id': userId },
        body: JSON.stringify(note),
      })
      if (!res.ok) throw new Error('Failed to add note')
      const newNote = await res.json()
      set(state => ({ supportNotes: [newNote, ...state.supportNotes] }))
    } catch (err) { console.error('Add support note failed:', err) }
  },

  updateSupportNote: async (id, changes) => {
    const userId = get().currentUser.id
    try {
      const res = await fetch(`/api/support-notes?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-staff-id': userId },
        body: JSON.stringify(changes),
      })
      if (!res.ok) throw new Error('Failed to update note')
      const updatedNote = await res.json()
      set(state => ({ supportNotes: state.supportNotes.map(n => n.id === id ? updatedNote : n) }))
    } catch (err) { console.error('Update support note failed:', err) }
  },

  // ── Support Staff — Supabase intervention plan (existing) ───────────────────
  loadStudentTrends: async (studentId) => {
    try {
      const { data } = await supabase
        .from('student_trends').select('*').eq('student_id', studentId)
        .order('period_start', { ascending: false })
      const trendsById = Object.fromEntries(data?.map(t => [t.student_id, t]) || [])
      set({ studentTrends: { ...get().studentTrends, [studentId]: trendsById[studentId] || null } })
      return trendsById
    } catch (error) { console.error('Load trends failed:', error); return {} }
  },

  loadInterventionPlan: async (studentId) => {
    try {
      const { data } = await supabase
        .from('intervention_plans').select('*').eq('student_id', studentId)
        .order('created_at', { ascending: false }).limit(1)
      const plan = data?.[0]
      set({ interventionPlans: plan
        ? [plan, ...get().interventionPlans.filter(p => p.student_id !== studentId)]
        : get().interventionPlans })
      return plan
    } catch (error) { console.error('Load intervention plan failed:', error); return null }
  },

  createInterventionPlan: async (studentId, data) => {
    const { currentUser } = get()
    try {
      const { data: plan } = await supabase
        .from('intervention_plans')
        .insert({ student_id: studentId, staff_id: currentUser.id, ...data })
        .select().single()
      set(state => ({ interventionPlans: [plan, ...state.interventionPlans] }))
      return plan
    } catch (error) { console.error('Create plan failed:', error); return null }
  },

  updateInterventionPlan: async (planId, data) => {
    try {
      const { data: plan, error } = await supabase
        .from('intervention_plans')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', planId).select().single()
      if (error) throw error
      set(state => ({ interventionPlans: state.interventionPlans.map(p => p.id === planId ? plan : p) }))
      return plan
    } catch (error) { console.error('Update plan failed:', error); return null }
  },

  getMessagingTargetsForSupportStaff: () => {
    const { students } = get()
    const assignedStudents = students.filter(s => s.id <= 3)
    const targets = []
    targets.push(...assignedStudents.map(s => ({ type:'student', ...s, messagingLabel:`Message ${s.name}` })))
    targets.push(
      { id:'t1', name:'Mr. Rivera', avatar:'🧑‍🔬', role:'teacher', messagingLabel:'Message Mr. Rivera' },
      { id:'t2', name:'Ms. Davis',  avatar:'👩‍💼', role:'teacher', messagingLabel:'Message Ms. Davis'  },
    )
    targets.push({ id:'a1', name:'Principal Davis', avatar:'🏫', role:'admin', messagingLabel:'Message Principal Davis' })
    return targets
  },

  // ── Participation events ─────────────────────────────────────────────────────
  participationEvents: [],

  addParticipationEvent: async (classId, studentId, eventType) => {
    const points = getParticipationPointsForEventType(eventType)
    if (!points) return
    const event = { id: Date.now(), classId, studentId, eventType, points, createdAt: new Date().toISOString() }
    set(state => ({ participationEvents: [...state.participationEvents, event] }))
    try {
      await supabase.from('participation_events').insert({ class_id: classId, student_id: studentId, event_type: eventType, points })
    } catch (err) { console.error('Participation event error:', err) }
    const { assignments, participationEvents } = get()
    const participationAssignment = assignments.find(a => a.classId === classId && a.type === 'participation')
    if (!participationAssignment) return
    const maxPoints = (participationAssignment.options && participationAssignment.options.max_points) ?? 10
    const totalPoints = participationEvents.filter(e => e.classId === classId && e.studentId === studentId).reduce((sum, e) => sum + e.points, 0)
    const score = Math.min(100, Math.round((totalPoints / maxPoints) * 100))
    await get().updateGrade(studentId, participationAssignment.id, score)
  },

  // ── Student Accommodations ───────────────────────────────────────────────────
  studentAccommodations: {},

  setAccommodations: (accommodations) => set(() => {
    const keyed = {}
    for (const s of accommodations) {
      keyed[s.name] = { name: s.name, accommodationType: s.accommodationType || 'Other', specificNeeds: s.specificNeeds || [], lessonAdjustments: [], notes: s.notes || '' }
    }
    return { studentAccommodations: keyed }
  }),

  updateAccommodation: (studentName, changes) => set(state => ({
    studentAccommodations: {
      ...state.studentAccommodations,
      [studentName]: { ...(state.studentAccommodations[studentName] || { name: studentName, accommodationType: 'Other', specificNeeds: [], lessonAdjustments: [], notes: '' }), ...changes },
    },
  })),

  addAccommodation: (studentName) => set(state => {
    if (state.studentAccommodations[studentName]) return {}
    return { studentAccommodations: { ...state.studentAccommodations, [studentName]: { name: studentName, accommodationType: 'Other', specificNeeds: [], lessonAdjustments: [], notes: '' } } }
  }),

  removeAccommodation: (studentName) => set(state => {
    const next = { ...state.studentAccommodations }
    delete next[studentName]
    return { studentAccommodations: next }
  }),

  setLessonAdjustments: (adjustments) => set(state => {
    const next = { ...state.studentAccommodations }
    for (const { studentName, adjustments: adj } of adjustments) {
      if (next[studentName]) next[studentName] = { ...next[studentName], lessonAdjustments: adj }
    }
    return { studentAccommodations: next }
  }),

  // ── Load from Supabase (demo mode) ──────────────────────────────────────────
  loadFromDB: async () => {
    set({ classes: DEMO_CLASSES, students: DEMO_STUDENTS, assignments: DEMO_ASSIGNMENTS, grades: DEMO_GRADES, messages: DEMO_MESSAGES, feed: DEMO_FEED, lessons: DEMO_LESSONS, dbLoaded: true, isHydrated: true, dbError: null })
  },

  // ── Grade categories ─────────────────────────────────────────────────────────
  categories:           DEFAULT_CATEGORIES,
  gradingMethod:        'weighted',
  allowTeacherOverride: true,

  setCategories:    (cats)   => set({ categories: cats }),
  setGradingMethod: (method) => set({ gradingMethod: method }),

  // ── Curriculum ───────────────────────────────────────────────────────────────
  curriculumSources:  CURRICULUM_SOURCES,
  connectedCurricula: {},

  setConnectedCurriculum: (subject, sourceId) => set(state => ({
    connectedCurricula: { ...state.connectedCurricula, [subject]: sourceId },
  })),

  // ── External integrations ────────────────────────────────────────────────────
  connections: DEFAULT_CONNECTIONS,

  setConnection: (key, connected) => set(state => ({
    connections: { ...state.connections, [key]: { ...state.connections[key], connected, lastSync: connected ? 'Just now' : null } },
  })),

  syncGradebookToDistrict: async () => {
    useStore.setState({ isSyncingGradebook: true })
    try {
      const res = await fetch('/api/sync-gradebook', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ triggeredBy: 'teacher' }) })
      useStore.setState({ isSyncingGradebook: false, lastDistrictGradebookSync: res.ok ? new Date().toISOString() : null })
      return res.ok
    } catch (err) { console.error('District sync error:', err); useStore.setState({ isSyncingGradebook: false }); return false }
  },

  // ── Onboarding ───────────────────────────────────────────────────────────────
  onboardingComplete:        false,
  onboardingStep:            0,
  isSyncingGradebook:        false,
  lastDistrictGradebookSync: null,

  setOnboardingStep:  (step) => set({ onboardingStep: step }),
  completeOnboarding: ()     => set({ onboardingComplete: true }),

  // ── Navigation ───────────────────────────────────────────────────────────────
  activeScreen:        'dashboard',
  previousScreen:      null,
  activeClass:         null,
  activeStudent:       null,
  activeLessonClassId: null,
  notifications:       3,
  lessonPlanMode:      null,
  keyAlertsDismissed:  [],
  cameraIntent:        null,

  setScreen:   (screen)  => set(state => ({ previousScreen: state.activeScreen, activeScreen: screen })),
  goBack:      ()        => set(state => ({ activeScreen: state.previousScreen || 'dashboard', previousScreen: null })),
  setActiveClass:   (cls)     => set(state => ({ activeClass: cls, previousScreen: state.activeScreen, activeScreen: cls ? 'gradebook' : state.activeScreen })),
  setActiveStudent: (student) => set(state => ({ activeStudent: student, previousScreen: state.activeScreen, activeScreen: student ? 'studentProfile' : state.activeScreen })),
  setActiveLessonClass: (classId) => set({ activeLessonClassId: classId }),
  setCameraIntent:      (intent)  => set({ cameraIntent: intent }),
  setLessonPlanMode:    (mode)    => set({ lessonPlanMode: mode }),

  // ── Lesson status ────────────────────────────────────────────────────────────
  setLessonStatus: (classId, status) => set(state => {
    const classLessons = [...(state.lessons[classId] || [])]
    if (!classLessons.length) return {}
    if (status === 'done') {
      classLessons[0] = { ...classLessons[0], status: 'done', dayLabel: 'Previous' }
      const [completed, ...rest] = classLessons
      const reordered = [...rest, completed]
      if (reordered[0]) reordered[0] = { ...reordered[0], dayLabel: 'Today', status: 'pending' }
      return { lessons: { ...state.lessons, [classId]: reordered } }
    }
    if (status === 'tbd') {
      classLessons[0] = { ...classLessons[0], status: 'tbd' }
      return { lessons: { ...state.lessons, [classId]: classLessons } }
    }
    return {}
  }),

  addLesson: (classId, lesson) => set(state => ({
    lessons: { ...state.lessons, [classId]: [...(state.lessons[classId] || []), { ...lesson, id: `custom-${Date.now()}`, status: 'pending' }] },
  })),

  // ── Computed ─────────────────────────────────────────────────────────────────
  getStudentsForClass:         (classId) => get().students.filter(s => s.classId === classId),
  getAssignmentsForClass:      (classId) => get().assignments.filter(a => a.classId === classId),
  getGradeForStudentAssignment: (studentId, aId) => get().grades.find(g => g.studentId === studentId && g.assignmentId === aId),
  getNeedsAttention:           () => get().students.filter(s => s.grade < 70 || s.flagged || s.submitUngraded),
  getTodayLesson:              (classId) => (get().lessons[classId] || [])[0] || null,

  calcWeightedGrade: (studentId, classId) => {
    const { assignments, grades, categories, gradingMethod } = get()
    const clsAssigns = assignments.filter(a => a.classId === classId)
    if (gradingMethod === 'total_points') {
      const scored = clsAssigns.map(a => grades.find(g => g.studentId === studentId && g.assignmentId === a.id)).filter(Boolean)
      return scored.length ? Math.round(scored.reduce((s, g) => s + g.score, 0) / scored.length) : null
    }
    let total = 0, totalWeight = 0
    categories.forEach(cat => {
      const catAssigns = clsAssigns.filter(a => a.categoryId === cat.id)
      const catGrades  = catAssigns.map(a => grades.find(g => g.studentId === studentId && g.assignmentId === a.id)).filter(Boolean)
      if (catGrades.length) { const avg = catGrades.reduce((s, g) => s + g.score, 0) / catGrades.length; total += avg * (cat.weight / 100); totalWeight += cat.weight }
    })
    return totalWeight > 0 ? Math.round((total * 100) / totalWeight) : null
  },

  // ── Mutations ────────────────────────────────────────────────────────────────
  updateGrade: async (studentId, assignmentId, score) => {
    set(state => ({
      grades: state.grades.some(g => g.studentId === studentId && g.assignmentId === assignmentId)
        ? state.grades.map(g => g.studentId === studentId && g.assignmentId === assignmentId ? { ...g, score } : g)
        : [...state.grades, { studentId, assignmentId, score }],
    }))
    try {
      await supabase.from('grades').upsert({ student_id: studentId, assignment_id: assignmentId, score, graded: true }, { onConflict: 'student_id,assignment_id' })
    } catch (err) { console.error('Grade sync error:', err) }
  },

  updateMessage:  (id, changes) => set(state => ({ messages: state.messages.map(m => m.id === id ? { ...m, ...changes } : m) })),
  dismissMessage: (id)          => set(state => ({ messages: state.messages.map(m => m.id === id ? { ...m, status: 'dismissed' } : m) })),
  sendMessage:    (id)          => set(state => ({ messages: state.messages.map(m => m.id === id ? { ...m, status: 'sent' } : m) })),

  addAssignment: (assignment) => set(state => ({
    assignments: [...state.assignments, { ...assignment, id: Date.now(), options: assignment.options || {} }],
  })),

  saveLessonPlan: (plan) => set(state => ({
    lessonPlans: [...state.lessonPlans, { ...plan, id: Date.now(), createdAt: new Date().toISOString() }],
  })),

  dismissKeyAlert: (assignmentId) => set(state => ({ keyAlertsDismissed: [...state.keyAlertsDismissed, assignmentId] })),

  addReminder:    (text) => set(state => ({ reminders: [...state.reminders, { id: Date.now(), text, due: 'Today', done: false, priority: 'medium' }] })),
  toggleReminder: (id)   => set(state => ({ reminders: state.reminders.map(r => r.id === id ? { ...r, done: !r.done } : r) })),
  deleteReminder: (id)   => set(state => ({ reminders: state.reminders.filter(r => r.id !== id) })),

  addFeedPost: async (classId, content) => {
    const authorName = useStore.getState().teacher.name
    set(state => ({ feed: [{ id: Date.now(), classId, author: authorName, content, time: 'Just now', reactions: {}, confused: 0, questions: 0, approved: false }, ...state.feed] }))
    try {
      await supabase.from('feed_posts').insert({ class_id: classId, author_name: authorName, content, approved: false, reactions: {} })
    } catch (err) { console.error('Feed post error:', err) }
  },

  quickCreateAssignment:      (a) => get().addAssignment(a),
  clearQuickCreateAssignment: ()  => {},

  weights:    { test: 40, quiz: 30, homework: 20, participation: 10 },
  setWeights: (w) => set({ weights: w }),

})) // closes store
