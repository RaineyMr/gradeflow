import { create } from 'zustand'

// ─── Demo Data ────────────────────────────────────────────────────────────────
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
  { id: 1, classId: 1, name: 'Ch.3 Quiz',     type: 'quiz',          categoryId: 2, date: '2024-10-14', dueDate: '2024-10-14', hasKey: true  },
  { id: 2, classId: 1, name: 'Ch.3 Homework', type: 'homework',      categoryId: 3, date: '2024-10-12', dueDate: '2024-10-12', hasKey: true  },
  { id: 3, classId: 1, name: 'Unit Test 1',   type: 'test',          categoryId: 1, date: '2024-10-10', dueDate: '2024-10-10', hasKey: false },
  { id: 4, classId: 1, name: 'Participation', type: 'participation',  categoryId: 4, date: '2024-10-01', dueDate: '2024-10-31', hasKey: false },
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
  { id: 1, studentName: 'Marcus Thompson', subject: 'Math',    trigger: 'Failed 58%',       status: 'pending', tone: 'Warm & Friendly', draft: "Dear Parent, Marcus received 58% on his Math assessment. I'd love to connect this week to discuss support options.", positiveDraft: "Hi! Just wanted to share that Marcus is showing real effort in class. Let's keep building on that momentum!", dayOld: false },
  { id: 2, studentName: 'Aaliyah Brooks',  subject: 'Reading', trigger: 'Improved +12pts',  status: 'sent',    tone: 'Celebrating',     draft: "Great news! Aaliyah improved her Reading score by 12 points. She's working so hard!",                              positiveDraft: "Aaliyah is doing amazing work. Her dedication is really paying off!", dayOld: false },
  { id: 3, studentName: 'Liam Martinez',   subject: 'Science', trigger: 'Failed 61%',       status: 'pending', tone: 'Warm & Friendly', draft: "Dear Parent, I wanted to reach out regarding Liam's recent Science assessment.",                                    positiveDraft: "Liam is showing curiosity in Science class. Here are some ways to support at home!",               dayOld: true  },
]

// ─── Lessons: keyed by classId, ordered array (today is always index 0) ──────
// status: 'pending' | 'done' | 'tbd'
// when TBD: same lesson repeats as today for next session
const DEMO_LESSONS = {
  1: [ // Math (1st period)
    { id: 'math-0', classId: 1, dayLabel: 'Today',    date: 'Tue · Mar 10', title: 'Ch. 4 · Fractions & Decimals',   duration: '45 min', pages: 'Pages 84–91', objective: 'Students will compare fractions and decimals and convert between forms.', warmup: ['Decimal of the day', 'Quick compare: 0.4 vs 3/8'], activities: ['Mini-lesson on fraction/decimal conversion', 'Partner station sort', 'Guided practice problems 1–8', 'Exit ticket'], materials: ['Workbook', 'Whiteboard', 'Fraction strips'], homework: 'Workbook page 91, problems 9–14', status: 'pending' },
    { id: 'math-1', classId: 1, dayLabel: 'Previous', date: 'Mon · Mar 9',  title: 'Ch. 4 · Equivalent Fractions',   duration: '45 min', pages: 'Pages 80–83', objective: 'Students will identify and generate equivalent fractions.',                warmup: ['Visual fraction model review'],                     activities: ['Teacher modeling', 'Small group practice', 'Independent check'],                             materials: ['Workbook', 'Fraction tiles'],  homework: 'Practice sheet A', status: 'done'    },
    { id: 'math-2', classId: 1, dayLabel: 'Next',     date: 'Wed · Mar 11', title: 'Ch. 4 · Ordering Fractions',     duration: '45 min', pages: 'Pages 92–96', objective: 'Students will order fractions, decimals, and percents.',                    warmup: ['Number line challenge'],                            activities: ['Calendar problem', 'Guided examples', 'Station rotation'],                                   materials: ['Workbook', 'Number lines'], homework: 'Workbook page 96', status: 'pending'  },
    { id: 'math-3', classId: 1, dayLabel: 'Thu',      date: 'Thu · Mar 12', title: 'Ch. 4 · Percent Basics',         duration: '45 min', pages: 'Pages 97–102', objective: 'Students will convert between fractions, decimals, and percents.',        warmup: ['Warm-up: What is 50% of 80?'],                      activities: ['Direct instruction', 'Practice problems', 'Peer check'],                                     materials: ['Workbook', 'Calculators'],  homework: 'Workbook page 102', status: 'pending' },
    { id: 'math-4', classId: 1, dayLabel: 'Fri',      date: 'Fri · Mar 13', title: 'Ch. 4 · Review & Quiz Prep',     duration: '45 min', pages: 'Pages 84–102', objective: 'Students will review all Ch. 4 concepts before the quiz.',               warmup: ['Flash card review'],                                activities: ['Review game', 'Practice test', 'Q&A'],                                                       materials: ['Workbook', 'Flash cards'],  homework: 'Study for Monday quiz', status: 'pending' },
  ],
  2: [ // Reading (2nd period)
    { id: 'read-0', classId: 2, dayLabel: 'Today',    date: 'Tue · Mar 10', title: 'Unit 3 · Main Idea & Details',   duration: '45 min', pages: 'Pages 56–63', objective: 'Students will identify main idea and supporting details in nonfiction.', warmup: ['Quick write: what is the main idea of a paragraph?'], activities: ['Model with mentor text', 'Guided practice', 'Partner work', 'Share out'], materials: ['Anthology', 'Highlighters'], homework: 'Read pages 64–67 and annotate', status: 'pending' },
    { id: 'read-1', classId: 2, dayLabel: 'Previous', date: 'Mon · Mar 9',  title: 'Unit 3 · Text Structure',        duration: '45 min', pages: 'Pages 50–55', objective: 'Students will identify cause/effect and compare/contrast structures.',    warmup: ['Signal word sort'],                                  activities: ['Text structure chart', 'Partner read', 'Exit ticket'],                                       materials: ['Anthology'],                homework: 'Finish graphic organizer', status: 'done' },
    { id: 'read-2', classId: 2, dayLabel: 'Next',     date: 'Wed · Mar 11', title: 'Unit 3 · Author\'s Purpose',     duration: '45 min', pages: 'Pages 68–72', objective: 'Students will determine author\'s purpose using text evidence.',          warmup: ['PIE review (Persuade/Inform/Entertain)'],            activities: ['Close read', 'Discussion protocol', 'Written response'],                                     materials: ['Anthology', 'Journals'],    homework: 'Written reflection p. 72', status: 'pending' },
  ],
  3: [ // Science (3rd period)
    { id: 'sci-0',  classId: 3, dayLabel: 'Today',    date: 'Tue · Mar 10', title: 'Ch. 6 · States of Matter',       duration: '50 min', pages: 'Pages 120–128', objective: 'Students will describe properties of solids, liquids, and gases.',    warmup: ['Matter sort: everyday objects'],                     activities: ['Lab demo — ice melting', 'Diagram labeling', 'Discussion', 'Quick write'], materials: ['Ice', 'Beakers', 'Lab sheets'], homework: 'Read pages 129–131', status: 'pending' },
    { id: 'sci-1',  classId: 3, dayLabel: 'Previous', date: 'Mon · Mar 9',  title: 'Ch. 6 · Matter & Mass',          duration: '50 min', pages: 'Pages 114–119', objective: 'Students will measure and compare mass of different substances.',      warmup: ['Mass vs. weight discussion'],                        activities: ['Balance scale lab', 'Data recording', 'Class discussion'],                                   materials: ['Balance scales', 'Weights'], homework: 'Lab report section 1', status: 'done' },
    { id: 'sci-2',  classId: 3, dayLabel: 'Next',     date: 'Wed · Mar 11', title: 'Ch. 6 · Phase Changes',          duration: '50 min', pages: 'Pages 132–138', objective: 'Students will explain melting, freezing, evaporation, condensation.', warmup: ['Cloud in a jar video prompt'],                        activities: ['Phase change diagram', 'Station rotations', 'Exit ticket'],                                  materials: ['Lab sheets', 'Thermometers'], homework: 'Workbook p. 138', status: 'pending' },
  ],
  4: [ // Writing (4th period)
    { id: 'writ-0', classId: 4, dayLabel: 'Today',    date: 'Tue · Mar 10', title: 'Unit 2 · Argumentative Writing',  duration: '45 min', pages: 'Pages 34–41', objective: 'Students will write a claim with at least two supporting reasons.', warmup: ['Take a stand: agree or disagree prompt'],             activities: ['Model claim writing', 'Outline drafting', 'Peer feedback'], materials: ['Writing journals', 'Mentor texts'], homework: 'Complete outline draft', status: 'pending' },
    { id: 'writ-1', classId: 4, dayLabel: 'Previous', date: 'Mon · Mar 9',  title: 'Unit 2 · Evidence & Reasoning',   duration: '45 min', pages: 'Pages 28–33', objective: 'Students will select and cite relevant text evidence.',               warmup: ['Strong vs. weak evidence sort'],                     activities: ['Evidence gallery walk', 'Annotation practice', 'Whole class debrief'],                       materials: ['Nonfiction articles'],     homework: 'Find 2 pieces of evidence for your claim', status: 'done' },
    { id: 'writ-2', classId: 4, dayLabel: 'Next',     date: 'Wed · Mar 11', title: 'Unit 2 · Counterargument',        duration: '45 min', pages: 'Pages 42–47', objective: 'Students will identify and address counterarguments.',                 warmup: ['Devil\'s advocate: steelman the opposite view'],     activities: ['Model paragraph', 'Draft counterargument', 'Revise with partner'],                           materials: ['Writing journals'],        homework: 'Revise draft with counterargument', status: 'pending' },
  ],
}

const DEMO_FEED = [
  { id: 1, classId: 1, author: 'Ms. Johnson', content: '📅 Unit Test Friday! Review chapters 3-4. Study guide posted below.', time: '2 hours ago', reactions: { '👍': 12, '❤️': 5, '😂': 2 }, confused: 3, questions: 1, approved: true },
  { id: 2, classId: 1, author: 'Ms. Johnson', content: "🎉 Great work on yesterday's homework! Class average was 87%.",       time: 'Yesterday',  reactions: { '👍': 18, '❤️': 9, '😂': 4 }, confused: 0, questions: 0, approved: true },
]

const DEMO_REMINDERS = [
  { id: 1, text: 'Grade Ch.3 Unit Tests',   due: 'Today',    done: false, priority: 'high'   },
  { id: 2, text: 'Parent call — Marcus T.', due: 'Today',    done: false, priority: 'high'   },
  { id: 3, text: 'Update lesson plan Wed',  due: 'Tomorrow', done: false, priority: 'medium' },
  { id: 4, text: 'Submit attendance',       due: 'Fri',      done: true,  priority: 'low'    },
]

// ─── Default grade categories (admin sets school defaults, teachers override) ─
const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Tests',         weight: 40, color: '#f04a4a', icon: '📝' },
  { id: 2, name: 'Quizzes',       weight: 30, color: '#f5a623', icon: '✏️' },
  { id: 3, name: 'Homework',      weight: 20, color: '#3b7ef4', icon: '📚' },
  { id: 4, name: 'Participation', weight: 10, color: '#22c97a', icon: '🙋' },
]

// ─── Curriculum sources teachers can link (shown at onboarding + settings) ──
const CURRICULUM_SOURCES = [
  { id: 'gomath',       name: 'Go Math',             publisher: 'Houghton Mifflin', subjects: ['Math'],              logo: '📐', searchable: true  },
  { id: 'readingwonders', name: 'Reading Wonders',   publisher: 'McGraw-Hill',      subjects: ['Reading', 'ELA'],    logo: '📖', searchable: true  },
  { id: 'amplify',      name: 'Amplify Science',      publisher: 'Amplify',          subjects: ['Science'],           logo: '🔬', searchable: true  },
  { id: 'studysync',    name: 'StudySync',            publisher: 'McGraw-Hill',      subjects: ['Writing', 'ELA'],    logo: '✍️', searchable: true  },
  { id: 'eureka',       name: 'Eureka Math',          publisher: 'Great Minds',      subjects: ['Math'],              logo: '∑',  searchable: true  },
  { id: 'ckscience',    name: 'CK-12 Science',        publisher: 'CK-12',            subjects: ['Science'],           logo: '⚗️', searchable: true  },
  { id: 'commonlit',    name: 'CommonLit',            publisher: 'CommonLit',        subjects: ['Reading', 'ELA'],    logo: '📜', searchable: true  },
  { id: 'custom',       name: 'Custom / No textbook', publisher: '',                 subjects: [],                    logo: '🏗',  searchable: false },
]

// ─── Integration connections ─────────────────────────────────────────────────
const DEFAULT_CONNECTIONS = {
  powerSchool:     { connected: false, label: 'PowerSchool',      url: 'https://powerschool.com',        category: 'roster',   icon: '🏫', description: 'Pull rosters + sync grades'         },
  infiniteCampus:  { connected: false, label: 'Infinite Campus',  url: 'https://infinitecampus.com',     category: 'roster',   icon: '🎓', description: 'Roster sync + grade passback'        },
  skyward:         { connected: false, label: 'Skyward',          url: 'https://skyward.com',            category: 'roster',   icon: '🌤', description: 'Student info + gradebook sync'       },
  canvas:          { connected: false, label: 'Canvas LMS',       url: 'https://canvas.instructure.com', category: 'lms',      icon: '🖼', description: 'Assignments, grades, submissions'    },
  googleClassroom: { connected: true,  label: 'Google Classroom', url: 'https://classroom.google.com',   category: 'lms',      icon: '🟢', description: 'Assignments + roster import',        lastSync: 'Today 8:42am' },
  planbook:        { connected: false, label: 'Planbook',         url: 'https://planbook.com',           category: 'lessons',  icon: '📅', description: 'Import your lesson plan calendar'    },
  chalk:           { connected: false, label: 'Chalk',            url: 'https://chalk.com',              category: 'lessons',  icon: '🖊', description: 'Curriculum maps + lesson plans'     },
  tpt:             { connected: false, label: 'Teachers Pay Teachers', url: 'https://teacherspayteachers.com', category: 'lessons', icon: '💼', description: 'Import purchased lesson resources' },
  googleDrive:     { connected: true,  label: 'Google Drive',     url: 'https://drive.google.com',       category: 'lessons',  icon: '📁', description: 'Upload docs & lesson materials',     lastSync: 'Today 9:01am' },
  clever:          { connected: false, label: 'Clever',           url: 'https://clever.com',             category: 'roster',   icon: '🔗', description: 'Single sign-on + roster sync'        },
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useStore = create((set, get) => ({
  // ── Auth / User ──────────────────────────────────────────────────────────────
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),

  // ── Teacher profile ───────────────────────────────────────────────────────────
  teacher: { id: 1, name: 'Ms. Johnson', school: 'KIPP New Orleans', schoolColor: '#BA0C2F', avatar: '👩‍🏫' },

  // ── Data ──────────────────────────────────────────────────────────────────────
  classes:          DEMO_CLASSES,
  students:         DEMO_STUDENTS,
  assignments:      DEMO_ASSIGNMENTS,
  grades:           DEMO_GRADES,
  messages:         DEMO_MESSAGES,
  lessons:          DEMO_LESSONS,        // { [classId]: lesson[] }
  lessonPlans:      [],
  feed:             DEMO_FEED,
  reminders:        DEMO_REMINDERS,

  // ── Grade categories (replaces flat weights object) ───────────────────────────
  categories:       DEFAULT_CATEGORIES,
  gradingMethod:    'weighted',           // 'weighted' | 'total_points'
  allowTeacherOverride: true,

  setCategories: (cats) => set({ categories: cats }),
  setGradingMethod: (method) => set({ gradingMethod: method }),

  // ── Curriculum syncing ────────────────────────────────────────────────────────
  curriculumSources: CURRICULUM_SOURCES,
  // teacher's connected curricula per subject: { Math: 'gomath', Reading: 'readingwonders', ... }
  connectedCurricula: {},
  setConnectedCurriculum: (subject, sourceId) => set(state => ({
    connectedCurricula: { ...state.connectedCurricula, [subject]: sourceId }
  })),

  // ── External integrations ─────────────────────────────────────────────────────
  connections: DEFAULT_CONNECTIONS,
  setConnection: (key, connected) => set(state => ({
    connections: {
      ...state.connections,
      [key]: { ...state.connections[key], connected, lastSync: connected ? 'Just now' : undefined }
    }
  })),

  // ── Onboarding state ──────────────────────────────────────────────────────────
  onboardingComplete: false,
  onboardingStep:     0,   // 0=role, 1=school, 2=curriculum, 3=gradebook, 4=integrations
  setOnboardingStep:  (step) => set({ onboardingStep: step }),
  completeOnboarding: () => set({ onboardingComplete: true }),

  // ── Navigation ────────────────────────────────────────────────────────────────
  activeScreen:   'dashboard',
  previousScreen: null,
  activeClass:    null,
  activeStudent:  null,
  activeLessonClassId: null,   // which class's lessons to show in LessonPlan view
  notifications:  3,
  lessonPlanMode: null,
  keyAlertsDismissed: [],
  cameraIntent:   null,

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

  setCameraIntent:    (intent) => set({ cameraIntent: intent }),
  setLessonPlanMode:  (mode)   => set({ lessonPlanMode: mode }),

  // ── Lesson status mutations ────────────────────────────────────────────────────
  // Mark today's lesson (index 0) for a class as done or tbd
  setLessonStatus: (classId, status) => set(state => {
    const classLessons = [...(state.lessons[classId] || [])]
    if (!classLessons.length) return {}

    if (status === 'done') {
      // Mark today done, advance: move index 0 to end, next becomes today
      classLessons[0] = { ...classLessons[0], status: 'done', dayLabel: 'Previous' }
      // Rotate: next lesson becomes today
      const [completed, ...rest] = classLessons
      const reordered = [...rest, completed]
      if (reordered[0]) reordered[0] = { ...reordered[0], dayLabel: 'Today', status: 'pending' }
      return { lessons: { ...state.lessons, [classId]: reordered } }
    }

    if (status === 'tbd') {
      // Mark TBD — same lesson stays as today, will repeat next session
      classLessons[0] = { ...classLessons[0], status: 'tbd' }
      return { lessons: { ...state.lessons, [classId]: classLessons } }
    }

    return {}
  }),

  // Add a new lesson to a class's queue
  addLesson: (classId, lesson) => set(state => {
    const existing = state.lessons[classId] || []
    return {
      lessons: {
        ...state.lessons,
        [classId]: [...existing, { ...lesson, id: `custom-${Date.now()}`, status: 'pending' }]
      }
    }
  }),

  // ── Computed ──────────────────────────────────────────────────────────────────
  getStudentsForClass:          (classId) => get().students.filter(s => s.classId === classId),
  getAssignmentsForClass:       (classId) => get().assignments.filter(a => a.classId === classId),
  getGradeForStudentAssignment: (studentId, aId) => get().grades.find(g => g.studentId === studentId && g.assignmentId === aId),
  getNeedsAttention:            () => get().students.filter(s => s.grade < 70 || s.flagged || s.submitUngraded),

  // Get today's lesson for a class (index 0, or TBD repeat)
  getTodayLesson: (classId) => {
    const lessons = get().lessons[classId] || []
    return lessons[0] || null
  },

  // Weighted GPA calculator using categories
  calcWeightedGrade: (studentId, classId) => {
    const { assignments, grades, categories, gradingMethod } = get()
    const clsAssigns = assignments.filter(a => a.classId === classId)
    if (gradingMethod === 'total_points') {
      const scored = clsAssigns.map(a => grades.find(g => g.studentId === studentId && g.assignmentId === a.id)).filter(Boolean)
      if (!scored.length) return null
      return Math.round(scored.reduce((s, g) => s + g.score, 0) / scored.length)
    }
    // Weighted
    let total = 0, totalWeight = 0
    categories.forEach(cat => {
      const catAssigns = clsAssigns.filter(a => a.categoryId === cat.id)
      const catGrades  = catAssigns.map(a => grades.find(g => g.studentId === studentId && g.assignmentId === a.id)).filter(Boolean)
      if (catGrades.length) {
        const avg = catGrades.reduce((s, g) => s + g.score, 0) / catGrades.length
        total       += avg * (cat.weight / 100)
        totalWeight += cat.weight
      }
    })
    return totalWeight > 0 ? Math.round(total * 100 / totalWeight) : null
  },

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

  quickCreateAssignment:      (a) => get().addAssignment(a),
  clearQuickCreateAssignment: () => {},

  // Legacy compat
  weights: { test: 40, quiz: 30, homework: 20, participation: 10 },
  setWeights: (w) => set({ weights: w }),
}))
