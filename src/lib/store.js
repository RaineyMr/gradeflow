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
  powerSchool: {
    connected: false,
    label: 'PowerSchool',
    url: 'https://powerschool.com',
    category: 'roster',
    icon: '🏫',
    description: 'Pull rosters + sync grades',
  },
  infiniteCampus: {
    connected: false,
    label: 'Infinite Campus',
    url: 'https://infinitecampus.com',
    category: 'roster',
    icon: '🎓',
    description: 'Roster sync + grade passback',
  },
  skyward: {
    connected: false,
    label: 'Skyward',
    url: 'https://skyward.com',
    category: 'roster',
    icon: '🌤',
    description: 'Student info + gradebook sync',
  },
  canvas: {
    connected: false,
    label: 'Canvas LMS',
    url: 'https://canvas.instructure.com',
    category: 'lms',
    icon: '🖼',
    description: 'Assignments, grades, submissions',
  },
  googleClassroom: {
    connected: false,
    label: 'Google Classroom',
    url: 'https://classroom.google.com',
    category: 'lms',
    icon: '🟢',
    description: 'Assignments + roster import',
    lastSync: null,
  },
  planbook: {
    connected: false,
    label: 'Planbook',
    url: 'https://planbook.com',
    category: 'lessons',
    icon: '📅',
    description: 'Import your lesson plan calendar',
  },
  chalk: {
    connected: false,
    label: 'Chalk',
    url: 'https://chalk.com',
    category: 'lessons',
    icon: '🖊',
    description: 'Curriculum maps + lesson plans',
  },
  tpt: {
    connected: false,
    label: 'Teachers Pay Teachers',
    url: 'https://teacherspayteachers.com',
    category: 'lessons',
    icon: '💼',
    description: 'Import purchased lesson resources',
  },
  googleDrive: {
    connected: true,
    label: 'Google Drive',
    url: 'https://drive.google.com',
    category: 'lessons',
    icon: '📁',
    description: 'Upload docs & lesson materials',
    lastSync: 'Today 9:01am',
  },
  clever: {
    connected: false,
    label: 'Clever',
    url: 'https://clever.com',
    category: 'roster',
    icon: '🔗',
    description: 'Single sign-on + roster sync',
  },
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
  const letter = score >= 90 ? 'A'
               : score >= 80 ? 'B'
               : score >= 70 ? 'C'
               : score >= 60 ? 'D'
               : 'F'

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
    row.type === 'test'         ? 1 :
    row.type === 'quiz'         ? 2 :
    row.type === 'homework'     ? 3 :
    row.type === 'participation'? 4 : 4

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
  return {
    studentId:    row.student_id,
    assignmentId: row.assignment_id,
    score:        row.score,
  }
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

// ─── Store ────────────────────────────────────────────────────────────────────
export const useStore = create((set, get) => ({

  // ── Loading state ───────────────────────────────────────────────────────────
  dbLoaded: false,
  isHydrated: false,
  dbError:  null,

  // ── Auth / User ─────────────────────────────────────────────────────────────
  currentUser: null,
  lang: 'en',

  setCurrentUser: (user) => set({
    currentUser: user,
    lang: user?.lang || 'en',
  }),

  setLang: (lang) => set(state => ({
    lang,
    currentUser: state.currentUser
      ? { ...state.currentUser, lang }
      : state.currentUser,
  })),

  // ── Teacher profile ─────────────────────────────────────────────────────────
  teacher: {
    id: 1,
    name: 'Ms. Johnson',
    school: 'KIPP New Orleans',
    schoolColor: '#BA0C2F',
    avatar: '👩‍🏫',
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

  // ── Support Staff Groups (REPLACES Teams) ──────────────────────────────────
  supportStaffGroups: [],
  supportStaffGroupMembers: [],
  studentTrends: {},
  interventionPlans: [],

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
        supportStaffGroups:      demoSupportStaffGroups,
        supportStaffGroupMembers: demoGroupMembers,
        // demoStudentTrends is already an object keyed by student_id — use as-is.
        studentTrends:            demoStudentTrends,
        interventionPlans:        demoInterventionPlans,
      })
    } catch (e) {
      console.warn('Demo groups data failed to load:', e)
    }
  },

  loadSupportStaffGroups: async () => {
    const { currentUser } = get()
    if (currentUser?.role !== 'supportStaff') return []
    
    try {
      const { data: groups } = await supabase
        .from('support_staff_groups')
        .select('*')
        .eq('staff_id', currentUser.id)
        .order('created_at', { ascending: false })
      
      set({ supportStaffGroups: groups || [] })
      return groups || []
    } catch {
      // Fallback handled by setDemoSupportStaffData
      return []
    }
  },

  createSupportStaffGroup: async (name, studentIds) => {
    const { currentUser } = get()
    if (currentUser?.role !== 'supportStaff') return null
    
    try {
      const { data: group } = await supabase
        .from('support_staff_groups')
        .insert({ staff_id: currentUser.id, name })
        .select()
        .single()
      
      if (group && studentIds?.length) {
        const members = studentIds.map(id => ({
          group_id: group.id,
          student_id: id
        }))
        await supabase.from('support_staff_group_members').insert(members)
        
        // Reload members for this group
        const { data: groupMembersData } = await supabase
          .from('support_staff_group_members')
          .select('*')
          .eq('group_id', group.id)
        set(state => ({
          supportStaffGroupMembers: [...state.supportStaffGroupMembers, ...groupMembersData]
        }))
      }
      
      // Reload all groups
      await get().loadSupportStaffGroups()
      return group
    } catch (error) {
      console.error('Create group failed:', error)
      return null
    }
  },

  loadSupportStaffGroupMembers: async (groupId) => {
    try {
      const { data } = await supabase
        .from('support_staff_group_members')
        .select('*, student:students(name, class_id)')
        .eq('group_id', groupId)
      return data || []
    } catch {
      return []
    }
  },

  getStudentsForSupportStaff: () => {
    const { currentUser, students, supportStaffGroups, supportStaffGroupMembers } = get()
    if (currentUser?.role !== 'supportStaff') return []
    
    const studentIds = new Set()
    for (const member of supportStaffGroupMembers) {
      studentIds.add(member.student_id)
    }
    return students.filter(s => studentIds.has(s.id))
  },

  getStudentsInGroup: (groupId) => {
    const { students, supportStaffGroupMembers } = get()
    const groupMembers = supportStaffGroupMembers.filter(m => m.group_id === groupId)
    const studentIds = groupMembers.map(m => m.student_id)
    return students.filter(s => studentIds.includes(s.id))
  },

  loadStudentTrends: async (studentId) => {
    try {
      const { data } = await supabase
        .from('student_trends')
        .select('*')
        .eq('student_id', studentId)
        .order('period_start', { ascending: false })
      const trendsById = Object.fromEntries(data?.map(t => [t.student_id, t]) || [])
      set({ studentTrends: { ...get().studentTrends, [studentId]: trendsById[studentId] || null } })
      return trendsById
    } catch (error) {
      console.error('Load trends failed:', error)
      return {}
    }
  },

  loadInterventionPlan: async (studentId) => {
    try {
      const { data } = await supabase
        .from('intervention_plans')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(1)
      const plan = data?.[0]
      set({ interventionPlans: plan ? [plan, ...get().interventionPlans.filter(p => p.student_id !== studentId)] : get().interventionPlans })
      return plan
    } catch (error) {
      console.error('Load intervention plan failed:', error)
      return null
    }
  },

  createInterventionPlan: async (studentId, data) => {
    const { currentUser } = get()
    try {
      const { data: plan } = await supabase
        .from('intervention_plans')
        .insert({ student_id: studentId, staff_id: currentUser.id, ...data })
        .select()
        .single()
      set(state => ({ interventionPlans: [plan, ...state.interventionPlans] }))
      return plan
    } catch (error) {
      console.error('Create plan failed:', error)
      return null
    }
  },

  updateInterventionPlan: async (planId, data) => {
    try {
      const { data: plan, error } = await supabase
        .from('intervention_plans')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', planId)
        .select()
        .single()
      
      if (error) throw error
      set(state => ({
        interventionPlans: state.interventionPlans.map(p => p.id === planId ? plan : p)
      }))
      return plan
    } catch (error) {
      console.error('Update plan failed:', error)
      return null
    }
  },

  getTeachersForSupportStaff: () => [
    { id: 't1', name: 'Mr. Rivera',   avatar: '🧑‍🔬', role: 'teacher', subject: 'Science' },
    { id: 't2', name: 'Ms. Davis',    avatar: '👩‍💼', role: 'teacher', subject: 'Reading' },
    { id: 't3', name: 'Ms. Johnson',  avatar: '👩‍🏫', role: 'teacher', subject: 'Math'    },
  ],

  getAdminForSupportStaff: () => [
    { id: 'a1', name: 'Principal Davis', avatar: '🏫', role: 'admin', label: 'Principal'      },
    { id: 'a2', name: 'Dr. Green',       avatar: '🎓', role: 'admin', label: 'Vice Principal'  },
  ],

  // ── Tier 6: Support Staff Messaging Helpers ───────────────────────────────
  getParentsForStudents: (studentIds) => {
    const { students } = get()
    return studentIds.map(studentId => {
      const student = students.find(s => s.id === studentId)
      return {
        id: `p${studentId}`,
        name: `Parent of ${student?.name || 'Student'}`,
        studentName: student?.name || 'Student',
        email: `parent${studentId}@email.com`,
        type: 'parent'
      }
    })
  },

  getTeachersForStudents: (studentIds) => {
    const { students, classes } = get()
    const teachers = get().getTeachersForSupportStaff()
    const assignments = []
    
    studentIds.forEach(studentId => {
      const student = students.find(s => s.id === studentId)
      if (student) {
        const studentClass = classes.find(c => c.id === student.classId)
        if (studentClass) {
          // Assign teachers based on subject
          const teacherForSubject = teachers.find(t => 
            t.subject === studentClass.subject || 
            (studentClass.subject === 'Math' && t.subject === 'Math') ||
            (studentClass.subject === 'Reading' && t.subject === 'Reading') ||
            (studentClass.subject === 'Science' && t.subject === 'Science') ||
            (studentClass.subject === 'Writing' && t.subject === 'Reading') // Writing teachers often in Reading
          )
          
          if (teacherForSubject) {
            assignments.push({
              id: teacherForSubject.id,
              name: teacherForSubject.name,
              subject: teacherForSubject.subject,
              studentName: student.name,
              studentId: studentId
            })
          }
        }
      }
    })
    
    return assignments
  },

  getAdminContacts: () => {
    return get().getAdminForSupportStaff()
  },

  sendSupportStaffMessage: async ({ recipientMode, recipientIds, subject, body }) => {
    const { currentUser } = get()
    if (currentUser?.role !== 'supportStaff') throw new Error('Unauthorized')
    
    // Create message records for each recipient
    const messages = recipientIds.map(recipientId => {
      let recipientName = 'Unknown'
      
      // Get recipient name based on mode
      if (recipientMode === 'students') {
        const student = get().students.find(s => s.id === recipientId)
        recipientName = student?.name || 'Student'
      } else if (recipientMode === 'teachers') {
        const teacher = get().getAllTeachers().find(t => t.id === recipientId)
        recipientName = teacher?.name || 'Teacher'
      } else if (recipientMode === 'admins') {
        const admin = get().getAllAdmins().find(a => a.id === recipientId)
        recipientName = admin?.name || 'Administrator'
      } else if (recipientMode === 'counselors') {
        const counselor = get().getAllCounselors().find(c => c.id === recipientId)
        recipientName = counselor?.name || 'Counselor'
      } else if (recipientMode === 'parents') {
        recipientName = `Parent of Student ${recipientId.replace('p', '')}`
      } else if (recipientMode === 'groups') {
        const group = get().supportStaffGroups.find(g => g.id === recipientId)
        recipientName = group?.name || 'Group'
      } else if (recipientMode === 'studentTeachers') {
        const teacher = get().getAllTeachers().find(t => t.id === recipientId)
        recipientName = teacher?.name || 'Teacher'
      }
      
      return {
        id: Date.now() + Math.random(),
        recipientName,
        recipientMode,
        subject,
        body,
        senderId: currentUser.id,
        senderName: currentUser.name,
        status: 'sent',
        createdAt: new Date().toISOString(),
        type: 'support_staff_message'
      }
    })
    
    // Add to messages in store
    set(state => ({ messages: [...state.messages, ...messages] }))
    
    // In a real implementation, this would send via email/SMS/API
    console.log('Support staff messages sent:', messages)
    
    return messages
  },

  // ── Tier 7: Student Profile Data Helpers ─────────────────────────────────
  getStudentGrades: async (studentId) => {
    const { assignments, grades, getGradeForStudentAssignment } = get()
    const studentGrades = []
    
    assignments.forEach(assignment => {
      const grade = getGradeForStudentAssignment(studentId, assignment.id)
      if (grade) {
        studentGrades.push({
          assignment: assignment.name,
          type: assignment.type,
          date: assignment.date || 'Recent',
          score: grade.score
        })
      }
    })
    
    return studentGrades.sort((a, b) => new Date(b.date) - new Date(a.date))
  },

  getStudentAttendance: async (studentId) => {
    // Demo attendance data
    return [
      { date: '2024-10-15', period: '1st', status: 'Present' },
      { date: '2024-10-14', period: '1st', status: 'Present' },
      { date: '2024-10-13', period: '1st', status: 'Tardy' },
      { date: '2024-10-12', period: '1st', status: 'Present' },
      { date: '2024-10-11', period: '1st', status: 'Present' },
      { date: '2024-10-10', period: '1st', status: 'Absent' },
      { date: '2024-10-09', period: '1st', status: 'Present' },
    ]
  },

  getStudentNotes: async (studentId) => {
    const { students } = get()
    const student = students.find(s => s.id === parseInt(studentId))
    if (!student) return []
    
    // Demo notes data
    return [
      {
        author: 'Ms. Johnson',
        date: '2024-10-14',
        content: `${student.name} is showing improvement in math concepts. Still needs practice with fractions.`
      },
      {
        author: 'Mr. Rivera',
        date: '2024-10-12',
        content: `Participates well in science discussions. Good understanding of lab procedures.`
      },
      {
        author: 'Ms. Davis',
        date: '2024-10-10',
        content: `Reading comprehension has improved. Should continue daily reading practice.`
      }
    ]
  },

  getStudentTrends: async (studentId) => {
    const { students } = get()
    const student = students.find(s => s.id === parseInt(studentId))
    if (!student) return null
    
    // Use existing trends data if available
    const existingTrend = get().studentTrends[studentId]
    if (existingTrend) {
      return {
        summary: existingTrend.summary || `${student.name} is ${student.grade >= 70 ? 'maintaining' : 'showing need for improvement in'} academic performance.`,
        metrics: {
          current_grade: `${student.grade}%`,
          trend: existingTrend.trend || 'stable',
          attendance_rate: '92%',
          assignment_completion: '85%'
        }
      }
    }
    
    // Generate demo trends
    return {
      summary: `${student.name} is ${student.grade >= 70 ? 'maintaining' : 'showing need for improvement in'} academic performance.`,
      metrics: {
        current_grade: `${student.grade}%`,
        trend: student.grade >= 70 ? 'improving' : 'declining',
        attendance_rate: '92%',
        assignment_completion: '85%'
      }
    }
  },

  getStudentInterventions: async (studentId) => {
    const { students } = get()
    const student = students.find(s => s.id === parseInt(studentId))
    if (!student) return []
    
    // Check if student needs intervention
    if (student.grade >= 70 && !student.flagged) {
      return []
    }
    
    // Demo intervention data
    return [
      {
        title: 'Math Support Plan',
        description: 'Weekly tutoring sessions focusing on fraction operations and problem-solving skills.',
        status: 'Active',
        createdDate: '2024-10-01',
        nextReview: '2024-10-29'
      }
    ]
  },

  // ── Tier 8: HomeFeed Widget Helpers ─────────────────────────────────────
  getSupportStaffStudentsNeedingAttention: () => {
    const { students } = get()
    return students
      .filter(s => s.grade < 70 || s.flagged || s.submitUngraded)
      .map(s => ({
        id: s.id,
        name: s.name,
        grade: s.grade,
        reason: s.grade < 60 ? 'Critical - Failing' : 
                s.grade < 70 ? 'At Risk' : 
                s.flagged ? 'Flagged' : 'Missing Work'
      }))
      .sort((a, b) => a.grade - b.grade)
  },

  getRecentSupportNotes: () => {
    const { supportNotes, students } = get()
    return supportNotes
      .slice(0, 10)
      .map(note => {
        const student = students.find(s => s.id === note.studentId)
        return {
          id: note.id,
          studentName: student?.name || 'Unknown Student',
          content: note.content || note.note || 'Support note logged',
          author: note.author || note.staffName || 'Support Staff',
          date: note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Recent'
        }
      })
  },

  getUpcomingFollowUps: () => {
    const { students, interventionPlans } = get()
    const followUps = []
    
    // Generate demo follow-ups based on intervention plans and flagged students
    students
      .filter(s => s.flagged || s.grade < 70)
      .slice(0, 5)
      .forEach(student => {
        const intervention = interventionPlans.find(p => p.student_id === student.id)
        followUps.push({
          id: `followup-${student.id}`,
          studentName: student.name,
          type: intervention ? 'Intervention Review' : 'Academic Check-in',
          date: intervention?.next_review || 'This Week',
          priority: student.grade < 60 ? 'high' : 'medium'
        })
      })
    
    return followUps.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  },

  // ── Tier 9: Support Staff Custom Groups ───────────────────────────────────
  getSupportStaffGroups: () => {
    return get().supportStaffGroups || []
  },

  createSupportStaffGroup: async ({ name, description, studentIds }) => {
    const { currentUser } = get()
    if (currentUser?.role !== 'supportStaff') throw new Error('Unauthorized')
    
    try {
      const { data: group } = await supabase
        .from('support_staff_groups')
        .insert({ 
          staff_id: currentUser.id, 
          name, 
          description: description || '',
          student_count: studentIds?.length || 0 
        })
        .select()
        .single()
      
      if (group && studentIds?.length) {
        const members = studentIds.map(id => ({
          group_id: group.id,
          student_id: id
        }))
        await supabase.from('support_staff_group_members').insert(members)
        
        // Reload members for this group
        const { data: groupMembersData } = await supabase
          .from('support_staff_group_members')
          .select('*')
          .eq('group_id', group.id)
        set(state => ({
          supportStaffGroupMembers: [...state.supportStaffGroupMembers, ...groupMembersData]
        }))
      }
      
      // Reload all groups
      await get().loadSupportStaffGroups()
      return group
    } catch (error) {
      console.error('Create group failed:', error)
      // Fallback to demo mode
      const newGroup = {
        id: Date.now(),
        name,
        description: description || '',
        staff_id: currentUser.id,
        student_count: studentIds?.length || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Add group members
      const newMembers = studentIds?.map(studentId => ({
        id: Date.now() + Math.random(),
        group_id: newGroup.id,
        student_id: studentId
      })) || []
      
      set(state => ({
        supportStaffGroups: [...state.supportStaffGroups, newGroup],
        supportStaffGroupMembers: [...state.supportStaffGroupMembers, ...newMembers]
      }))
      
      return newGroup
    }
  },

  updateSupportStaffGroup: async (groupId, data) => {
    const { currentUser } = get()
    if (currentUser?.role !== 'supportStaff') throw new Error('Unauthorized')
    
    try {
      const { data: group, error } = await supabase
        .from('support_staff_groups')
        .update({ 
          ...data, 
          updated_at: new Date().toISOString(),
          student_count: data.studentIds?.length || 0
        })
        .eq('id', groupId)
        .select()
        .single()
      
      if (error) throw error
      
      // Update members if studentIds provided
      if (data.studentIds) {
        // Remove existing members
        await supabase.from('support_staff_group_members').delete().eq('group_id', groupId)
        
        // Add new members
        if (data.studentIds.length > 0) {
          const members = data.studentIds.map(id => ({
            group_id: groupId,
            student_id: id
          }))
          await supabase.from('support_staff_group_members').insert(members)
        }
      }
      
      set(state => ({
        supportStaffGroups: state.supportStaffGroups.map(g => g.id === groupId ? { ...g, ...data } : g)
      }))
      
      return group
    } catch (error) {
      console.error('Update group failed:', error)
      // Fallback to demo mode
      set(state => ({
        supportStaffGroups: state.supportStaffGroups.map(g => 
          g.id === groupId ? { ...g, ...data, updated_at: new Date().toISOString() } : g
        )
      }))
      return { id: groupId, ...data }
    }
  },

  deleteSupportStaffGroup: async (groupId) => {
    const { currentUser } = get()
    if (currentUser?.role !== 'supportStaff') throw new Error('Unauthorized')
    
    try {
      // Delete members first
      await supabase.from('support_staff_group_members').delete().eq('group_id', groupId)
      
      // Delete group
      await supabase.from('support_staff_groups').delete().eq('id', groupId)
      
      set(state => ({
        supportStaffGroups: state.supportStaffGroups.filter(g => g.id !== groupId),
        supportStaffGroupMembers: state.supportStaffGroupMembers.filter(m => m.group_id !== groupId)
      }))
      
      return true
    } catch (error) {
      console.error('Delete group failed:', error)
      // Fallback to demo mode
      set(state => ({
        supportStaffGroups: state.supportStaffGroups.filter(g => g.id !== groupId),
        supportStaffGroupMembers: state.supportStaffGroupMembers.filter(m => m.group_id !== groupId)
      }))
      return true
    }
  },

  // Helper methods for SupportStaffGroupScreen
  getGroupStudents: (groupId) => {
    const { students, supportStaffGroupMembers } = get()
    const groupMembers = supportStaffGroupMembers.filter(m => m.group_id === groupId)
    const studentIds = groupMembers.map(m => m.student_id)
    return students.filter(s => studentIds.includes(s.id))
  },

  getAllStudents: () => {
    return get().students || []
  },

  // ── Tier 15: AI Context Helpers ───────────────────────────────────────
  getAIContextForStudent: (studentId) => {
    const { students, classes, assignments, grades, interventionPlans, studentTrends } = get()
    const student = students.find(s => s.id === parseInt(studentId))
    if (!student) return {}

    const studentClass = classes.find(c => c.id === student.classId)
    const studentGrades = grades.filter(g => g.studentId === student.id)
    const studentAssignments = assignments.filter(a => 
      studentGrades.some(g => g.assignmentId === a.id)
    )
    const studentInterventions = interventionPlans.filter(ip => ip.student_id === parseInt(studentId))
    const studentTrendData = studentTrends[studentId]

    return {
      studentId: student.id,
      studentName: student.name,
      grade: student.grade,
      letter: student.letter,
      flagged: student.flagged,
      submitted: student.submitted,
      submitUngraded: student.submitUngraded,
      classInfo: studentClass ? {
        classId: studentClass.id,
        subject: studentClass.subject,
        period: studentClass.period,
        teacher: studentClass.teacher
      } : null,
      recentGrades: studentGrades.slice(-5),
      averageGrade: studentGrades.length > 0 
        ? Math.round(studentGrades.reduce((sum, g) => sum + g.score, 0) / studentGrades.length)
        : student.grade,
      assignmentCount: studentAssignments.length,
      interventions: studentInterventions,
      trends: studentTrendData,
      riskLevel: student.grade < 60 ? 'critical' : student.grade < 70 ? 'high' : student.grade < 80 ? 'moderate' : 'low'
    }
  },

  getAIContextForGroup: (groupId) => {
    const { supportStaffGroups, supportStaffGroupMembers, students, classes } = get()
    const group = supportStaffGroups.find(g => g.id === parseInt(groupId))
    if (!group) return {}

    const groupMembers = supportStaffGroupMembers.filter(m => m.group_id === parseInt(groupId))
    const studentIds = groupMembers.map(m => m.student_id)
    const groupStudents = students.filter(s => studentIds.includes(s.id))

    return {
      groupId: group.id,
      groupName: group.name,
      description: group.description,
      studentCount: groupStudents.length,
      students: groupStudents.map(student => {
        const studentClass = classes.find(c => c.id === student.classId)
        return {
          id: student.id,
          name: student.name,
          grade: student.grade,
          flagged: student.flagged,
          class: studentClass ? `${studentClass.subject} (${studentClass.period})` : 'No class'
        }
      }),
      averageGrade: groupStudents.length > 0
        ? Math.round(groupStudents.reduce((sum, s) => sum + s.grade, 0) / groupStudents.length)
        : 0,
      flaggedCount: groupStudents.filter(s => s.flagged).length,
      atRiskCount: groupStudents.filter(s => s.grade < 70).length,
      createdAt: group.created_at
    }
  },

  getAIContextForCaseload: () => {
    const { students, supportStaffGroupMembers, interventionPlans, currentUser } = get()
    
    // Get assigned students (those in groups or with interventions)
    const assignedStudentIds = new Set([
      ...supportStaffGroupMembers.map(m => m.student_id),
      ...interventionPlans.map(ip => ip.student_id)
    ])
    
    const assignedStudents = students.filter(s => assignedStudentIds.has(s.id))

    const riskStats = {
      total: assignedStudents.length,
      critical: assignedStudents.filter(s => s.grade < 60).length,
      high: assignedStudents.filter(s => s.grade >= 60 && s.grade < 70).length,
      moderate: assignedStudents.filter(s => s.grade >= 70 && s.grade < 80).length,
      low: assignedStudents.filter(s => s.grade >= 80).length,
      flagged: assignedStudents.filter(s => s.flagged).length
    }

    return {
      staffName: currentUser?.name || 'Support Staff',
      totalStudents: riskStats.total,
      interventionCount: interventionPlans.length,
      criticalCount: riskStats.critical,
      highRiskCount: riskStats.high,
      moderateRiskCount: riskStats.moderate,
      lowRiskCount: riskStats.low,
      atRiskCount: riskStats.critical + riskStats.high,
      onTrackCount: riskStats.moderate + riskStats.low,
      flaggedCount: riskStats.flagged,
      averageGrade: assignedStudents.length > 0
        ? Math.round(assignedStudents.reduce((sum, s) => sum + s.grade, 0) / assignedStudents.length)
        : 0,
      students: assignedStudents.map(s => ({
        id: s.id,
        name: s.name,
        grade: s.grade,
        flagged: s.flagged,
        riskLevel: s.grade < 60 ? 'critical' : s.grade < 70 ? 'high' : s.grade < 80 ? 'moderate' : 'low'
      }))
    }
  },

  getAIContextForIntervention: (studentId) => {
    const { getAIContextForStudent, interventionPlans } = get()
    const studentContext = getAIContextForStudent(studentId)
    const studentInterventions = interventionPlans.filter(ip => ip.student_id === parseInt(studentId))

    return {
      ...studentContext,
      interventions: studentInterventions,
      hasActiveIntervention: studentInterventions.some(ip => ip.status === 'active'),
      interventionHistory: studentInterventions.map(ip => ({
        id: ip.id,
        title: ip.title,
        description: ip.description,
        status: ip.status,
        created: ip.created_at,
        updated: ip.updated_at
      }))
    }
  },

  getAIContextForMessaging: (context = {}) => {
    const { currentUser, getTeachersForStudents, getParentsForStudents } = get()
    
    return {
      senderName: currentUser?.name || 'Support Staff',
      senderRole: currentUser?.role || 'supportStaff',
      recipientType: context.recipientType || 'parent',
      studentName: context.studentName,
      subject: context.subject || 'General',
      urgency: context.urgency || 'normal',
      tone: context.tone || 'professional',
      language: context.language || 'english',
      availableTeachers: context.studentIds ? getTeachersForStudents(context.studentIds) : [],
      availableParents: context.studentIds ? getParentsForStudents(context.studentIds) : []
    }
  },

  getAIContextForLogs: (studentId) => {
    const { getAIContextForStudent, supportNotes } = get()
    const studentContext = getAIContextForStudent(studentId)
    const studentNotes = supportNotes.filter(sn => sn.studentId === parseInt(studentId))

    return {
      ...studentContext,
      recentNotes: studentNotes.slice(-5),
      totalNotes: studentNotes.length,
      noteTypes: [...new Set(studentNotes.map(note => note.type))],
      lastContact: studentNotes.length > 0 ? studentNotes[studentNotes.length - 1].date : null
    }
  },

  // ── Tier 10: Support Logs / Notes System ─────────────────────────────────
  getSupportLogs: async () => {
    const { currentUser, supportNotes } = get()
    
    // Combine support notes with dedicated logs
    const allLogs = [
      ...supportNotes.map(note => ({
        id: note.id,
        type: 'note',
        studentId: note.studentId,
        title: note.title || 'Support Note',
        content: note.content || note.note || '',
        confidentiality: note.confidentiality || 'standard',
        followUpRequired: note.followUpRequired || false,
        followUpDate: note.followUpDate || null,
        tags: note.tags || [],
        authorId: note.staffId || note.authorId,
        authorName: note.staffName || note.author || 'Support Staff',
        createdAt: note.createdAt || note.created_at,
        updatedAt: note.updatedAt || note.updated_at
      }))
    ]
    
    return allLogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  getSupportLogsForStudent: async (studentId) => {
    const allLogs = await get().getSupportLogs()
    return allLogs.filter(log => log.studentId === parseInt(studentId))
  },

  createSupportLog: async (logData) => {
    const { currentUser } = get()
    if (currentUser?.role !== 'supportStaff') throw new Error('Unauthorized')
    
    try {
      const { data: log } = await supabase
        .from('support_logs')
        .insert({
          student_id: logData.studentId,
          staff_id: currentUser.id,
          type: logData.type,
          title: logData.title,
          content: logData.content,
          confidentiality: logData.confidentiality,
          follow_up_required: logData.followUpRequired,
          follow_up_date: logData.followUpDate,
          tags: logData.tags
        })
        .select()
        .single()
      
      // Add to local state
      const newLog = {
        id: log.id,
        type: log.type,
        studentId: log.student_id,
        title: log.title,
        content: log.content,
        confidentiality: log.confidentiality,
        followUpRequired: log.follow_up_required,
        followUpDate: log.follow_up_date,
        tags: log.tags || [],
        authorId: log.staff_id,
        authorName: currentUser.name,
        createdAt: log.created_at,
        updatedAt: log.updated_at
      }
      
      set(state => ({ supportNotes: [...state.supportNotes, newLog] }))
      return newLog
    } catch (error) {
      console.error('Create log failed:', error)
      // Fallback to demo mode
      const newLog = {
        id: Date.now(),
        ...logData,
        authorId: currentUser.id,
        authorName: currentUser.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      set(state => ({ supportNotes: [...state.supportNotes, newLog] }))
      return newLog
    }
  },

  updateSupportLog: async (logId, logData) => {
    const { currentUser } = get()
    if (currentUser?.role !== 'supportStaff') throw new Error('Unauthorized')
    
    try {
      const { data: log, error } = await supabase
        .from('support_logs')
        .update({
          type: logData.type,
          title: logData.title,
          content: logData.content,
          confidentiality: logData.confidentiality,
          follow_up_required: logData.followUpRequired,
          follow_up_date: logData.followUpDate,
          tags: logData.tags,
          updated_at: new Date().toISOString()
        })
        .eq('id', logId)
        .select()
        .single()
      
      if (error) throw error
      
      // Update local state
      set(state => ({
        supportNotes: state.supportNotes.map(note => 
          note.id === logId ? {
            ...note,
            type: log.type,
            title: log.title,
            content: log.content,
            confidentiality: log.confidentiality,
            followUpRequired: log.follow_up_required,
            followUpDate: log.follow_up_date,
            tags: log.tags || [],
            updatedAt: log.updated_at
          } : note
        )
      }))
      
      return log
    } catch (error) {
      console.error('Update log failed:', error)
      // Fallback to demo mode
      set(state => ({
        supportNotes: state.supportNotes.map(note => 
          note.id === logId ? {
            ...note,
            ...logData,
            updatedAt: new Date().toISOString()
          } : note
        )
      }))
      return { id: logId, ...logData }
    }
  },

  deleteSupportLog: async (logId) => {
    const { currentUser } = get()
    if (currentUser?.role !== 'supportStaff') throw new Error('Unauthorized')
    
    try {
      await supabase.from('support_logs').delete().eq('id', logId)
      
      set(state => ({
        supportNotes: state.supportNotes.filter(note => note.id !== logId)
      }))
      
      return true
    } catch (error) {
      console.error('Delete log failed:', error)
      // Fallback to demo mode
      set(state => ({
        supportNotes: state.supportNotes.filter(note => note.id !== logId)
      }))
      return true
    }
  },

  // ── Tier 11: Teacher/Admin Messaging Enhancements ───────────────────────
  getAllTeachers: () => {
    // Expanded teacher list including all school teachers
    return [
      { id: 't1', name: 'Mr. Rivera',   avatar: '🧑‍🔬', role: 'teacher', subject: 'Science' },
      { id: 't2', name: 'Ms. Davis',    avatar: '👩‍💼', role: 'teacher', subject: 'Reading' },
      { id: 't3', name: 'Ms. Johnson',  avatar: '👩‍🏫', role: 'teacher', subject: 'Math' },
      { id: 't4', name: 'Mr. Chen',     avatar: '👨‍🏫', role: 'teacher', subject: 'Writing' },
      { id: 't5', name: 'Mrs. Williams', avatar: '👩‍🏫', role: 'teacher', subject: 'Social Studies' },
      { id: 't6', name: 'Mr. Martinez', avatar: '👨‍🏫', role: 'teacher', subject: 'Art' },
      { id: 't7', name: 'Ms. Thompson', avatar: '👩‍🏫', role: 'teacher', subject: 'Music' },
      { id: 't8', name: 'Mr. Anderson', avatar: '👨‍🏫', role: 'teacher', subject: 'PE' },
    ]
  },

  getAllAdmins: () => {
    // Expanded admin list including all school administrators
    return [
      { id: 'a1', name: 'Principal Davis', avatar: '🏫', role: 'admin', label: 'Principal' },
      { id: 'a2', name: 'Dr. Green',       avatar: '🎓', role: 'admin', label: 'Vice Principal' },
      { id: 'a3', name: 'Ms. Rodriguez',  avatar: '📋', role: 'admin', label: 'Academic Dean' },
      { id: 'a4', name: 'Mr. Johnson',    avatar: '📊', role: 'admin', label: 'Student Services' },
      { id: 'a5', name: 'Mrs. Chen',      avatar: '💼', role: 'admin', label: 'Operations' },
    ]
  },

  getAllCounselors: () => {
    // School counselors (optional as specified)
    return [
      { id: 'c1', name: 'Dr. Sarah Miller', avatar: '🧑‍⚕️', role: 'counselor', specialty: 'Academic Counseling' },
      { id: 'c2', name: 'Mr. James Wilson', avatar: '👨‍⚕️', role: 'counselor', specialty: 'Personal Counseling' },
      { id: 'c3', name: 'Ms. Patricia Brown', avatar: '👩‍⚕️', role: 'counselor', specialty: 'College Counseling' },
      { id: 'c4', name: 'Dr. Robert Taylor', avatar: '👨‍⚕️', role: 'counselor', specialty: 'Career Counseling' },
    ]
  },

  // ── Tier 12: Support Staff Caseload Manager ─────────────────────────────
  getSupportStaffCaseload: async () => {
    const { currentUser, students } = get()
    if (currentUser?.role !== 'supportStaff') return []
    
    // Demo: Return first 5 students as assigned caseload
    return students.slice(0, 5).map(student => ({
      ...student,
      assignedDate: '2024-10-01',
      followUpDate: student.grade < 70 ? '2024-10-25' : null,
      riskLevel: student.grade < 60 ? 'critical' : student.grade < 70 ? 'high' : 'moderate'
    }))
  },

  assignStudentToSupportStaff: async (studentId, staffId) => {
    const { currentUser } = get()
    if (currentUser?.role !== 'supportStaff') throw new Error('Unauthorized')
    
    try {
      // In a real implementation, this would update the database
      const { data, error } = await supabase
        .from('student_assignments')
        .insert({
          student_id: studentId,
          staff_id: staffId,
          assigned_at: new Date().toISOString(),
          role: 'support_staff'
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Assign student failed:', error)
      // Fallback to demo mode - just return success
      return { student_id: studentId, staff_id, assigned_at: new Date().toISOString() }
    }
  },

  unassignStudentFromSupportStaff: async (studentId, staffId) => {
    const { currentUser } = get()
    if (currentUser?.role !== 'supportStaff') throw new Error('Unauthorized')
    
    try {
      // In a real implementation, this would update the database
      const { error } = await supabase
        .from('student_assignments')
        .delete()
        .eq('student_id', studentId)
        .eq('staff_id', staffId)
        .eq('role', 'support_staff')
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Unassign student failed:', error)
      // Fallback to demo mode - just return success
      return true
    }
  },

  sendGroupMessage: async ({ groupId, groupName, recipientMode, recipients, subject, body }) => {
    const newMessages = recipients.map(r => ({
      id:            Date.now() + Math.random(),
      studentName:   r.name,
      subject:       subject,
      trigger:       `Group: ${groupName} · ${recipientMode}`,
      status:        'sent',
      tone:          'Direct',
      draft:         body,
      positiveDraft: body,
      dayOld:        false,
    }))
    set(state => ({ messages: [...state.messages, ...newMessages] }))
  },

  // ── Support Notes ─────────────────────────────────────────────────────────
  supportNotes: [],

  // Demo notes for supportStaff
  setDemoSupportNotes: () => {
    if (get().currentUser?.role !== 'supportStaff') return
    set({ supportNotes: demoSupportNotes })
  },

  // ── Participation events (real-time, plus Supabase) ────────────────────────
  participationEvents: [],

  addParticipationEvent: async (classId, studentId, eventType) => {
    const points = getParticipationPointsForEventType(eventType)
    if (!points) return

    const event = {
      id:        Date.now(),
      classId,
      studentId,
      eventType,
      points,
      createdAt: new Date().toISOString(),
    }

    // Update local state immediately (real-time UI)
    set(state => ({
      participationEvents: [...state.participationEvents, event],
    }))

    // Persist to Supabase (history / analytics)
    try {
      const { error } = await supabase
        .from('participation_events')
        .insert({
          class_id:   classId,
          student_id: studentId,
          event_type: eventType,
          points,
        })
      if (error) console.error('Participation event sync failed:', error)
    } catch (err) {
      console.error('Participation event error:', err)
    }

    // Recalculate participation grade for this student in this class
    const { assignments, participationEvents } = get()

    const participationAssignment = assignments.find(
      a => a.classId === classId && a.type === 'participation'
    )
    if (!participationAssignment) return

    const maxPoints =
      (participationAssignment.options && participationAssignment.options.max_points) ?? 10

    const totalPoints = participationEvents
      .filter(e => e.classId === classId && e.studentId === studentId)
      .reduce((sum, e) => sum + e.points, 0)

    const score = Math.min(100, Math.round((totalPoints / maxPoints) * 100))

    // Update grade in local state + Supabase
    await get().updateGrade(studentId, participationAssignment.id, score)
  },

  // ── Student Accommodations ──────────────────────────────────────────────────
  studentAccommodations: {},

  setAccommodations: (accommodations) => set(() => {
    const keyed = {}
    for (const s of accommodations) {
      keyed[s.name] = {
        name:              s.name,
        accommodationType: s.accommodationType || 'Other',
        specificNeeds:     s.specificNeeds     || [],
        lessonAdjustments: [],
        notes:             s.notes             || '',
      }
    }
    return { studentAccommodations: keyed }
  }),

  updateAccommodation: (studentName, changes) => set(state => ({
    studentAccommodations: {
      ...state.studentAccommodations,
      [studentName]: {
        ...(state.studentAccommodations[studentName] || {
          name: studentName,
          accommodationType: 'Other',
          specificNeeds: [],
          lessonAdjustments: [],
          notes: '',
        }),
        ...changes,
      },
    },
  })),

  addAccommodation: (studentName) => set(state => {
    if (state.studentAccommodations[studentName]) return {}
    return {
      studentAccommodations: {
        ...state.studentAccommodations,
        [studentName]: {
          name: studentName,
          accommodationType: 'Other',
          specificNeeds: [],
          lessonAdjustments: [],
          notes: '',
        },
      },
    }
  }),

  removeAccommodation: (studentName) => set(state => {
    const next = { ...state.studentAccommodations }
    delete next[studentName]
    return { studentAccommodations: next }
  }),

  setLessonAdjustments: (adjustments) => set(state => {
    const next = { ...state.studentAccommodations }
    for (const { studentName, adjustments: adj } of adjustments) {
      if (next[studentName]) {
        next[studentName] = {
          ...next[studentName],
          lessonAdjustments: adj,
        }
      }
    }
    return { studentAccommodations: next }
  }),

  // ── Load all data from Supabase ─────────────────────────────────────────────
  loadFromDB: async () => {
    // Demo mode - load demo data immediately
    set({
      classes: DEMO_CLASSES,
      students: DEMO_STUDENTS,
      assignments: DEMO_ASSIGNMENTS,
      grades: DEMO_GRADES,
      messages: DEMO_MESSAGES,
      feed: DEMO_FEED,
      lessons: DEMO_LESSONS,
      dbLoaded: true,
      isHydrated: true,
      dbError: null
    })
  },

  // ── Grade categories ────────────────────────────────────────────────────────
  categories:           DEFAULT_CATEGORIES,
  gradingMethod:        'weighted',
  allowTeacherOverride: true,

  setCategories:    (cats)   => set({ categories: cats }),
  setGradingMethod: (method) => set({ gradingMethod: method }),

  // ── Curriculum syncing ──────────────────────────────────────────────────────
  curriculumSources:  CURRICULUM_SOURCES,
  connectedCurricula: {},

  setConnectedCurriculum: (subject, sourceId) => set(state => ({
    connectedCurricula: { ...state.connectedCurricula, [subject]: sourceId },
  })),

  // ── External integrations ───────────────────────────────────────────────────
  connections: DEFAULT_CONNECTIONS,

  setConnection: (key, connected) => set(state => ({
    connections: {
      ...state.connections,
      [key]: {
        ...state.connections[key],
        connected,
        lastSync: connected ? 'Just now' : null,
      },
    },
  })),

  syncGradebookToDistrict: async () => {
    const triggeredBy = 'teacher'
    useStore.setState({ isSyncingGradebook: true })

    try {
      const res = await fetch('/api/sync-gradebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggeredBy }),
      })

      if (!res.ok) {
        console.error('District Gradebook sync failed')
        useStore.setState({ isSyncingGradebook: false })
        return false
      }

      useStore.setState({
        isSyncingGradebook: false,
        lastDistrictGradebookSync: new Date().toISOString(),
      })
      return true
    } catch (err) {
      console.error('District Gradebook sync error:', err)
      useStore.setState({ isSyncingGradebook: false })
      return false
    }
  },

  // ── Onboarding ──────────────────────────────────────────────────────────────
  onboardingComplete: false,
  onboardingStep:     0,

  // ── District Gradebook Sync ──────────────────────────────────────────────
  isSyncingGradebook: false,
  lastDistrictGradebookSync: null,

  setOnboardingStep:  (step) => set({ onboardingStep: step }),
  completeOnboarding: ()     => set({ onboardingComplete: true }),

  // ── Navigation ──────────────────────────────────────────────────────────────
  activeScreen:        'dashboard',
  previousScreen:      null,
  activeClass:         null,
  activeStudent:       null,
  activeLessonClassId: null,
  notifications:       3,
  lessonPlanMode:      null,
  keyAlertsDismissed:  [],
  cameraIntent:        null,

  setScreen: (screen) => set(state => ({
    previousScreen: state.activeScreen,
    activeScreen:   screen,
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

  setActiveLessonClass: (classId) => set({ activeLessonClassId: classId }),
  setCameraIntent:      (intent)  => set({ cameraIntent: intent }),
  setLessonPlanMode:    (mode)    => set({ lessonPlanMode: mode }),

  // ── Lesson status mutations ─────────────────────────────────────────────────
  setLessonStatus: (classId, status) => set(state => {
    const classLessons = [...(state.lessons[classId] || [])]
    if (!classLessons.length) return {}

    if (status === 'done') {
      classLessons[0] = { ...classLessons[0], status: 'done', dayLabel: 'Previous' }
      const [completed, ...rest] = classLessons
      const reordered = [...rest, completed]

      if (reordered[0]) {
        reordered[0] = { ...reordered[0], dayLabel: 'Today', status: 'pending' }
      }

      return { lessons: { ...state.lessons, [classId]: reordered } }
    }

    if (status === 'tbd') {
      classLessons[0] = { ...classLessons[0], status: 'tbd' }
      return { lessons: { ...state.lessons, [classId]: classLessons } }
    }

    return {}
  }),

  addLesson: (classId, lesson) => set(state => {
    const existing = state.lessons[classId] || []
    return {
      lessons: {
        ...state.lessons,
        [classId]: [
          ...existing,
          { ...lesson, id: `custom-${Date.now()}`, status: 'pending' },
        ],
      },
    }
  }),

  // ── Computed ────────────────────────────────────────────────────────────────
  getStudentsForClass: (classId) =>
    get().students.filter(s => s.classId === classId),

  getAssignmentsForClass: (classId) =>
    get().assignments.filter(a => a.classId === classId),

  getGradeForStudentAssignment: (studentId, aId) =>
    get().grades.find(g => g.studentId === studentId && g.assignmentId === aId),

  getNeedsAttention: () =>
    get().students.filter(s =>
      s.grade < 70 || s.flagged || s.submitUngraded
    ),

  getTodayLesson: (classId) => {
    const lessons = get().lessons[classId] || []
    return lessons[0] || null
  },

  /**
   * SupportStaff messaging targets: assigned students → their teachers + admin
   */
  getMessagingTargetsForSupportStaff: () => {
    const { currentUser, students, classes } = get()
    if (currentUser?.role !== 'supportStaff') return []

    // Demo: first 3 students assigned
    const assignedStudents = students.filter(s => s.id <= 3)
    
    const targets = []

    // Assigned students
    targets.push(...assignedStudents.map(s => ({
      type: 'student',
      ...s,
      messagingLabel: `Message ${s.name}`,
    })))

    // Their teachers (demo classes 1-3 → teachers 1,2)
    const teachers = [
      { id: 't1', name: 'Mr. Rivera', avatar: '🧑‍🔬', role: 'teacher' },
      { id: 't2', name: 'Ms. Davis', avatar: '👩‍💼', role: 'teacher' },
    ]
    targets.push(...teachers.map(t => ({
      type: 'teacher',
      ...t,
      messagingLabel: `Message ${t.name}`,
    })))

    // Admin
    const admins = [
      { id: 'a1', name: 'Principal Davis', avatar: '🏫', role: 'admin' },
    ]
    targets.push(...admins.map(a => ({
      type: 'admin',
      ...a,
      messagingLabel: `Message ${a.name}`,
    })))

    return targets
  },

  calcWeightedGrade: (studentId, classId) => {
    const { assignments, grades, categories, gradingMethod } = get()
    const clsAssigns = assignments.filter(a => a.classId === classId)

    if (gradingMethod === 'total_points') {
      const scored = clsAssigns
        .map(a => grades.find(g => g.studentId === studentId && g.assignmentId === a.id))
        .filter(Boolean)

      if (!scored.length) return null

      return Math.round(
        scored.reduce((s, g) => s + g.score, 0) / scored.length
      )
    }

    let total = 0
    let totalWeight = 0

    categories.forEach(cat => {
      const catAssigns = clsAssigns.filter(a => a.categoryId === cat.id)
      const catGrades  = catAssigns
        .map(a => grades.find(g => g.studentId === studentId && g.assignmentId === a.id))
        .filter(Boolean)

      if (catGrades.length) {
        const avg = catGrades.reduce((s, g) => s + g.score, 0) / catGrades.length
        total       += avg * (cat.weight / 100)
        totalWeight += cat.weight
      }
    })

    return totalWeight > 0
      ? Math.round((total * 100) / totalWeight)
      : null
  },

  // ── Mutations (local + write-through to Supabase) ───────────────────────────
  updateGrade: async (studentId, assignmentId, score) => {
    set(state => ({
      grades: state.grades.some(
        g => g.studentId === studentId && g.assignmentId === assignmentId
      )
        ? state.grades.map(g =>
            g.studentId === studentId && g.assignmentId === assignmentId
              ? { ...g, score }
              : g
          )
        : [...state.grades, { studentId, assignmentId, score }],
    }))

    try {
      const { error } = await supabase
        .from('grades')
        .upsert(
          { student_id: studentId, assignment_id: assignmentId, score, graded: true },
          { onConflict: 'student_id,assignment_id' }
        )

      if (error) console.error('Grade sync failed:', error)
    } catch (err) {
      console.error('Grade sync error:', err)
    }
  },

  updateMessage: (id, changes) => set(state => ({
    messages: state.messages.map(m =>
      m.id === id ? { ...m, ...changes } : m
    ),
  })),

  dismissMessage: (id) => set(state => ({
    messages: state.messages.map(m =>
      m.id === id ? { ...m, status: 'dismissed' } : m
    ),
  })),

  sendMessage: (id) => set(state => ({
    messages: state.messages.map(m =>
      m.id === id ? { ...m, status: 'sent' } : m
    ),
  })),

  addAssignment: (assignment) => set(state => ({
    assignments: [
      ...state.assignments,
      { ...assignment, id: Date.now(), options: assignment.options || {} },
    ],
  })),

  saveLessonPlan: (plan) => set(state => ({
    lessonPlans: [
      ...state.lessonPlans,
      { ...plan, id: Date.now(), createdAt: new Date().toISOString() },
    ],
  })),

  dismissKeyAlert: (assignmentId) => set(state => ({
    keyAlertsDismissed: [
      ...state.keyAlertsDismissed,
      assignmentId,
    ],
  })),

  addReminder: (text) => set(state => ({
    reminders: [
      ...state.reminders,
      { id: Date.now(), text, due: 'Today', done: false, priority: 'medium' },
    ],
  })),

  toggleReminder: (id) => set(state => ({
    reminders: state.reminders.map(r =>
      r.id === id ? { ...r, done: !r.done } : r
    ),
  })),

  deleteReminder: (id) => set(state => ({
    reminders: state.reminders.filter(r => r.id !== id),
  })),

  // ── Support Notes ─────────────────────────────────────────────────────────
  loadSupportNotes: async (studentId) => {
    if (!get().currentUser?.role === 'supportStaff') return

    try {
      const userId = get().currentUser.id
      const res = await fetch(`/api/support-notes?studentId=${studentId}`, {
        headers: { 'x-staff-id': userId }
      })

      if (!res.ok) throw new Error('Failed to load notes')

      const { notes } = await res.json()
      set({ supportNotes: notes })
    } catch (err) {
      console.error('Load support notes failed:', err)
    }
  },

  addSupportNote: async (note) => {
    const userId = get().currentUser.id
    try {
      const res = await fetch('/api/support-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-staff-id': userId
        },
        body: JSON.stringify(note)
      })

      if (!res.ok) throw new Error('Failed to add note')

      const newNote = await res.json()
      set(state => ({ supportNotes: [newNote, ...state.supportNotes] }))
    } catch (err) {
      console.error('Add support note failed:', err)
    }
  },

  updateSupportNote: async (id, changes) => {
    const userId = get().currentUser.id
    try {
      const res = await fetch(`/api/support-notes?id=${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-staff-id': userId
        },
        body: JSON.stringify(changes)
      })

      if (!res.ok) throw new Error('Failed to update note')

      const updatedNote = await res.json()
      set(state => ({
        supportNotes: state.supportNotes.map(n => n.id === id ? updatedNote : n)
      }))
    } catch (err) {
      console.error('Update support note failed:', err)
    }
  },

  addFeedPost: async (classId, content) => {
    const authorName = useStore.getState().teacher.name

    set(state => ({
      feed: [
        {
          id: Date.now(),
          classId,
          author: authorName,
          content,
          time: 'Just now',
          reactions: {},
          confused: 0,
          questions: 0,
          approved: false,
        },
        ...state.feed,
      ],
    }))

    try {
      const { error } = await supabase.from('feed_posts').insert({
        class_id: classId,
        author_name: authorName,
        content,
        approved: false,
        reactions: {},
      })

      if (error) console.error('Feed post sync failed:', error)
    } catch (err) {
      console.error('Feed post error:', err)
    }
  },

  quickCreateAssignment:      (a) => get().addAssignment(a),
  clearQuickCreateAssignment: ()  => {},

  weights: { test: 40, quiz: 30, homework: 20, participation: 10 },
  setWeights: (w) => set({ weights: w }),

})) // closes store
