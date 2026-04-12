import { create } from 'zustand'
import { supabase } from './supabase'
import { demoSupportNotes } from './demoSupportNotes'
import { pageToHash } from './hashRouter'import { create } from 'zustand'
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

const DEMO_LESSONS = {
  1: [
    // Week 1: Place Value & Number Sense
    { id: 'math-1', classId: 1, dayLabel: 'Wed · Apr 1', date: '2026-04-01', title: 'Unit 1 · Place Value to Millions', duration: '45 min', pages: 'Pages 12-15', objective: 'Students will read, write, and compare numbers to millions place.', warmup: ['Number of the day: 2,457,891', 'Place value review'], activities: ['Place value chart modeling', 'Expanded form practice', 'Partner comparison game'], materials: ['Place value charts', 'Base-10 blocks', 'Whiteboards'], homework: 'Workbook page 16, problems 1-12', status: 'done', pdf: 'https://www.commoncoresheets.com/Math/Content/5/NBT/1/Download/5NBT-A1.pdf' },
    { id: 'math-2', date: '2026-04-02', classId: 1, dayLabel: 'Thu · Apr 2', title: 'Unit 1 · Ordering & Rounding', duration: '45 min', pages: 'Pages 17-20', objective: 'Students will order and round numbers to millions place.', warmup: ['Quick round: 47,823 to nearest thousand', 'Number line placement'], activities: ['Rounding rules anchor chart', 'Station rotation: rounding practice', 'Real-world rounding problems'], materials: ['Number lines', 'Rounding cards', 'Calculators for checking'], homework: 'Workbook page 21, problems 1-15', status: 'done', pdf: 'https://www.commoncoresheets.com/Math/Content/5/NBT/2/Download/5NBT-A4.pdf' },
    { id: 'math-3', date: '2026-04-03', classId: 1, dayLabel: 'Fri · Apr 3', title: 'Unit 1 · Addition & Subtraction Review', duration: '45 min', pages: 'Pages 22-25', objective: 'Students will add and subtract multi-digit numbers with regrouping.', warmup: ['Mental math: 456+789', 'Regrouping review'], activities: ['Standard algorithm practice', 'Word problem strategies', 'Error analysis'], materials: ['Graph paper', 'Colored pencils'], homework: 'Workbook page 26, problems 1-10', status: 'done', pdf: 'https://www.k5learning.com/Math/Grade-5/Number-and-Operations-in-Base-Ten/Worksheets/5NBTB7.pdf' },
    
    
    
    // Week 2: Multi-Digit Multiplication
    { id: 'math-6', date: '2026-04-06', classId: 1, dayLabel: 'Mon · Apr 6', title: 'Unit 2 · 2-Digit × 2-Digit Multiplication', duration: '45 min', pages: 'Pages 34-37', objective: 'Students will multiply 2-digit by 2-digit numbers.', warmup: ['Mental math: 23×45', 'Estimation practice'], activities: ['Area model demonstration', 'Standard algorithm practice', 'Partner check'], materials: ['Graph paper', 'Base-10 blocks'], homework: 'Workbook page 38, problems 1-12', status: 'pending', pdf: 'https://www.mathworksheetsland.com/multiplication/2-digit-by-2-digit/worksheets/' },
    { id: 'math-7', date: '2026-04-07', classId: 1, dayLabel: 'Tue · Apr 7', title: 'Unit 2 · 3-Digit × 2-Digit Multiplication', duration: '45 min', pages: 'Pages 39-42', objective: 'Students will multiply 3-digit by 2-digit numbers.', warmup: ['Quick multiply: 156×34', 'Place value review'], activities: ['Expanded form method', 'Lattice multiplication', 'Word problem application'], materials: ['Lattice grids', 'Expanded form cards'], homework: 'Workbook page 43, problems 1-10', status: 'pending', pdf: 'https://www.mathworksheetsland.com/multiplication/3-digit-by-2-digit/worksheets/' },
    { id: 'math-8', date: '2026-04-08', classId: 1, dayLabel: 'Wed · Apr 8', title: 'Unit 2 · Multiplication Word Problems', duration: '45 min', pages: 'Pages 44-47', objective: 'Students will solve multi-step multiplication word problems.', warmup: ['Key words identification', 'Operation selection'], activities: ['CUBES strategy practice', 'Real-world scenarios', 'Partner problem creation'], materials: ['CUBES posters', 'Word problem cards'], homework: 'Workbook page 48, problems 1-8', status: 'pending', pdf: 'https://www.math-aids.com/Multiplication/Word-Problems/Multiplication-Word-Problems-Worksheet.pdf' },
    { id: 'math-9', date: '2026-04-09', classId: 1, dayLabel: 'Thu · Apr 9', title: 'Unit 2 · Multiplication Review', duration: '45 min', pages: 'Pages 49-51', objective: 'Students will review multiplication concepts and strategies.', warmup: ['Mixed practice problems', 'Strategy selection'], activities: ['Error analysis', 'Strategy sharing', 'Practice stations'], materials: ['Strategy cards', 'Whiteboards'], homework: 'Study for unit test', status: 'pending', pdf: 'https://www.k5learning.com/Math/Grade-5/Number-and-Operations-in-Base-Ten/Worksheets/5NBTB5.pdf' },
    
    
    // Week 3: Division Concepts
    { id: 'math-11', date: '2026-04-13', classId: 1, dayLabel: 'Mon · Apr 13', title: 'Unit 3 · Division Concepts', duration: '45 min', pages: 'Pages 55-58', objective: 'Students will understand division as equal sharing and repeated subtraction.', warmup: ['Division fact warm-up', 'Sharing scenarios'], activities: ['Manipulatives exploration', 'Repeated subtraction modeling', 'Array connections'], materials: ['Counters', 'Array grids', 'Sharing mats'], homework: 'Workbook page 59, problems 1-10', status: 'pending', pdf: 'https://www.mathworksheetsland.com/division/introduction-to-division/worksheets/' },
    { id: 'math-12', date: '2026-04-14', classId: 1, dayLabel: 'Tue · Apr 14', title: 'Unit 3 · 2-Digit Division', duration: '45 min', pages: 'Pages 60-63', objective: 'Students will divide 2-digit numbers with and without remainders.', warmup: ['Division fact practice', 'Estimation review'], activities: ['Long division algorithm', 'Remainder interpretation', 'Real-world division'], materials: ['Division charts', 'Base-10 blocks'], homework: 'Workbook page 64, problems 1-12', status: 'pending', pdf: 'https://www.mathworksheetsland.com/division/dividing-by-1-digit/worksheets/' },
    { id: 'math-13', date: '2026-04-15', classId: 1, dayLabel: 'Wed · Apr 15', title: 'Unit 3 · 3-Digit Division', duration: '45 min', pages: 'Pages 65-68', objective: 'Students will divide 3-digit numbers by 2-digit numbers.', warmup: ['Estimation challenges', 'Place value division'], activities: ['Area model division', 'Standard algorithm practice', 'Word problem application'], materials: ['Area model grids', 'Division templates'], homework: 'Workbook page 69, problems 1-8', status: 'pending', pdf: 'https://www.mathworksheetsland.com/division/dividing-by-2-digit/worksheets/' },
    { id: 'math-14', date: '2026-04-16', classId: 1, dayLabel: 'Thu · Apr 16', title: 'Unit 3 · Division Word Problems', duration: '45 min', pages: 'Pages 70-73', objective: 'Students will solve division word problems with remainders.', warmup: ['Key words review', 'Remainder interpretation'], activities: ['CUBES for division', 'Real-world scenarios', 'Partner problem solving'], materials: ['Word problem cards', 'Remainder charts'], homework: 'Workbook page 74, problems 1-6', status: 'pending', pdf: 'https://www.math-aids.com/Division/Word-Problems/Division-Word-Problems-Worksheet.pdf' },
    { id: 'math-15', date: '2026-04-17', classId: 1, dayLabel: 'Fri · Apr 17', title: 'Unit 3 · Division Unit Test', duration: '45 min', pages: 'Pages 75-77', objective: 'Students will demonstrate division mastery.', warmup: ['Comprehensive review', 'Calculator strategies'], activities: ['Unit assessment', 'Error analysis'], materials: ['Test sheets', 'Calculators'], homework: 'No homework - test day', status: 'pending', pdf: 'https://www.math-aids.com/Division/Test/Division-Test-Worksheet.pdf' },
    
    // Week 4: Fractions Introduction
    { id: 'math-16', date: '2026-04-22', classId: 1, dayLabel: 'Wed · Apr 22', title: 'Unit 4 · Fraction Concepts', duration: '45 min', pages: 'Pages 78-81', objective: 'Students will understand fractions as parts of a whole.', warmup: ['Fraction of the day', 'Visual fraction review'], activities: ['Fraction strips exploration', 'Number line fractions', 'Real-world fractions'], materials: ['Fraction strips', 'Fraction circles', 'Number lines'], homework: 'Workbook page 82, problems 1-10', status: 'pending', pdf: 'https://www.mathworksheets4kids.com/worksheet/fractions/fractions-introduction-5th-grade' },
    { id: 'math-17', date: '2026-04-23', classId: 1, dayLabel: 'Thu · Apr 23', title: 'Unit 4 · Equivalent Fractions', duration: '45 min', pages: 'Pages 82-85', objective: 'Students will find and generate equivalent fractions.', warmup: ['Equivalent fraction matching', 'Simplification review'], activities: ['Fraction strip modeling', 'Cross-multiplication practice', 'Real-world examples'], materials: ['Fraction tiles', 'Equivalence cards'], homework: 'Workbook page 86, problems 1-12', status: 'pending', pdf: 'https://www.mathworksheetsland.com/fractions/equivalent-fractions/worksheets/' },
    { id: 'math-18', date: '2026-04-24', classId: 1, dayLabel: 'Fri · Apr 24', title: 'Unit 4 · Comparing Fractions', duration: '45 min', pages: 'Pages 86-89', objective: 'Students will compare fractions with unlike denominators.', warmup: ['Fraction comparison', 'Benchmark fractions'], activities: ['Common denominator strategy', 'Visual comparison', 'Number line ordering'], materials: ['Fraction circles', 'Number lines'], homework: 'Workbook page 90, problems 1-8', status: 'pending', pdf: 'https://www.mathworksheetsland.com/fractions/comparing-fractions/worksheets/' },
    
    { id: 'math-20', date: '2026-04-27', classId: 1, dayLabel: 'Mon · Apr 27', title: 'Unit 4 · Fractions Quiz', duration: '45 min', pages: 'Pages 95-97', objective: 'Students will demonstrate fraction concept mastery.', warmup: ['Comprehensive review', 'Strategy selection'], activities: ['Fractions quiz', 'Extension activities'], materials: ['Quiz sheets', 'Fraction manipulatives'], homework: 'No homework - quiz day', status: 'pending', pdf: 'https://www.math-aids.com/Fractions/Test/Fractions-Test-Worksheet.pdf' },
    
    // Week 5: Advanced Fractions & Review
    { id: 'math-21', classId: 1, dayLabel: 'Tue · Apr 28', date: '2026-04-28', title: 'Unit 5 · Mixed Numbers & Improper Fractions', duration: '45 min', pages: 'Pages 98-101', objective: 'Students will convert between mixed numbers and improper fractions.', warmup: ['Fraction review', 'Visual conversion models'], activities: ['Conversion algorithms', 'Real-world examples', 'Partner practice'], materials: ['Fraction circles', 'Number lines', 'Conversion charts'], homework: 'Workbook page 102, problems 1-12', status: 'pending', pdf: 'https://www.math-aids.com/Fractions/Mixed-Number-Improper-Fraction-Worksheet.pdf' },
    { id: 'math-22', classId: 1, dayLabel: 'Wed · Apr 29', date: '2026-04-29', title: 'Unit 5 · Adding Mixed Numbers', duration: '45 min', pages: 'Pages 103-106', objective: 'Students will add mixed numbers with like and unlike denominators.', warmup: ['Mixed number review', 'Denominator practice'], activities: ['Algorithm demonstration', 'Step-by-step practice', 'Word problems'], materials: ['Fraction strips', 'Algorithm charts', 'Whiteboards'], homework: 'Workbook page 107, problems 1-10', status: 'pending', pdf: 'https://www.math-aids.com/Fractions/Addition-Mixed-Numbers-Worksheet.pdf' },
    
  ],
  2: [
    { id: 'read-0', classId: 2, dayLabel: 'Today',    date: 'Tue · Mar 10', title: 'Unit 3 · Main Idea & Details', duration: '45 min', pages: 'Pages 56–63', objective: 'Students will identify main idea and supporting details in nonfiction.', warmup: ['Quick write: what is main idea of a paragraph?'], activities: ['Model with mentor text', 'Guided practice', 'Partner work', 'Share out'], materials: ['Anthology', 'Highlighters'], homework: 'Read pages 64–67 and annotate', status: 'pending' },
    { id: 'read-1', classId: 2, dayLabel: 'Previous', date: 'Mon · Mar 9',  title: 'Unit 3 · Text Structure',      duration: '45 min', pages: 'Pages 50–55', objective: 'Students will identify cause/effect and compare/contrast structures.', warmup: ['Signal word sort'], activities: ['Text structure chart', 'Partner read', 'Exit ticket'], materials: ['Anthology'], homework: 'Finish graphic organizer', status: 'done' },
  ],
  3: [
    { id: 'sci-0', classId: 3, dayLabel: 'Today', date: 'Tue · Mar 10', title: 'Ch. 6 · States of Matter', duration: '50 min', pages: 'Pages 120–128', objective: 'Students will describe properties of solids, liquids, and gases.', warmup: ['Matter sort: everyday objects'], activities: ['Lab demo — ice melting', 'Diagram labeling', 'Discussion', 'Quick write'], materials: ['Ice', 'Beakers', 'Lab sheets'], homework: 'Read pages 129–131', status: 'pending' },
  ],
  4: [
    { id: 'writ-0', classId: 4, dayLabel: 'Today',    date: 'Tue · Mar 10', title: 'Unit 2 · Argumentative Writing', duration: '45 min', pages: 'Pages 34–41', objective: 'Students will write a claim with at least two supporting reasons.', warmup: ['Take a stand: agree or disagree prompt'], activities: ['Model claim writing', 'Outline drafting', 'Peer feedback'], materials: ['Writing journals', 'Mentor texts'], homework: 'Complete outline draft', status: 'pending' },
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

// Demo schools data for registration validation - using actual schools from SQL seed
const DEMO_SCHOOLS = [
  // KIPP Louisiana Schools
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
    subjects: [
      'Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus',
      'English I', 'English II', 'English III', 'English IV',
      'Biology', 'Chemistry', 'Physics', 'Environmental Science',
      'World History', 'US History', 'Government', 'Economics',
      'Spanish I', 'Spanish II', 'French I', 'French II',
      'Physical Education', 'Health', 'Art', 'Music', 'Computer Science'
    ]
  },
  {
    id: 'leadership-academy',
    district_id: 'kipp-la',
    name: 'Leadership Academy',
    address: 'New Orleans, LA',
    primary_color: '#1F4788',
    secondary_color: '#FFFFFF',
    accent_color: '#E31937',
    logo_url: 'https://kippneworleans.org/',
    type: 'elementary_school',
    grade_levels: ['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'],
    subjects: ['Reading', 'Writing', 'Math', 'Science', 'Social Studies', 'Art', 'Music', 'PE']
  },
  {
    id: 'central-city-academy',
    district_id: 'kipp-la',
    name: 'Central City Academy',
    address: 'New Orleans, LA',
    primary_color: '#1F4788',
    secondary_color: '#FFFFFF',
    accent_color: '#E31937',
    logo_url: 'https://kippneworleans.org/',
    type: 'elementary_school',
    grade_levels: ['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'],
    subjects: ['Reading', 'Writing', 'Math', 'Science', 'Social Studies', 'Art', 'Music', 'PE']
  },
  {
    id: 'frederick-douglass-hs',
    district_id: 'kipp-la',
    name: 'Frederick A. Douglass High School',
    address: 'New Orleans, LA',
    primary_color: '#1F4788',
    secondary_color: '#FFFFFF',
    accent_color: '#E31937',
    logo_url: 'https://kippneworleans.org/',
    type: 'high_school',
    grade_levels: ['9th Grade', '10th Grade', '11th Grade', '12th Grade'],
    subjects: [
      'Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus',
      'English I', 'English II', 'English III', 'English IV',
      'Biology', 'Chemistry', 'Physics', 'Environmental Science',
      'World History', 'US History', 'Government', 'Economics',
      'Spanish I', 'Spanish II', 'French I', 'French II',
      'Physical Education', 'Health', 'Art', 'Music', 'Computer Science'
    ]
  },
  // YES Prep New Orleans Schools
  {
    id: 'yes-east-end',
    district_id: 'yes-prep-nola',
    name: 'YES Prep East End',
    address: 'New Orleans, LA',
    primary_color: '#E31937',
    secondary_color: '#1F4788',
    accent_color: '#FFD700',
    logo_url: 'https://www.yesprep.org/',
    type: 'middle_school',
    grade_levels: ['6th Grade', '7th Grade', '8th Grade'],
    subjects: ['Math', 'Science', 'English', 'Social Studies', 'Art', 'Music', 'PE']
  },
  {
    id: 'yes-brays-oaks',
    district_id: 'yes-prep-nola',
    name: 'YES Prep Brays Oaks',
    address: 'New Orleans, LA',
    primary_color: '#E31937',
    secondary_color: '#1F4788',
    accent_color: '#FFD700',
    logo_url: 'https://www.yesprep.org/',
    type: 'middle_school',
    grade_levels: ['6th Grade', '7th Grade', '8th Grade'],
    subjects: ['Math', 'Science', 'English', 'Social Studies', 'Art', 'Music', 'PE']
  },
  {
    id: 'yes-northside',
    district_id: 'yes-prep-nola',
    name: 'YES Prep Northside',
    address: 'New Orleans, LA',
    primary_color: '#E31937',
    secondary_color: '#1F4788',
    accent_color: '#FFD700',
    logo_url: 'https://www.yesprep.org/',
    type: 'middle_school',
    grade_levels: ['6th Grade', '7th Grade', '8th Grade'],
    subjects: ['Math', 'Science', 'English', 'Social Studies', 'Art', 'Music', 'PE']
  },
  // ReNEW Schools
  {
    id: 'renew-moton',
    district_id: 'renew-nola',
    name: 'ReNEW Moton Lakefront',
    address: 'New Orleans, LA',
    primary_color: '#00A651',
    secondary_color: '#FFFFFF',
    accent_color: '#FF6B35',
    logo_url: 'https://www.renewschools.org/',
    type: 'elementary_school',
    grade_levels: ['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'],
    subjects: ['Reading', 'Writing', 'Math', 'Science', 'Social Studies', 'Art', 'Music', 'PE']
  },
  {
    id: 'renew-laurel',
    district_id: 'renew-nola',
    name: 'ReNEW Laurel',
    address: 'New Orleans, LA',
    primary_color: '#00A651',
    secondary_color: '#FFFFFF',
    accent_color: '#FF6B35',
    logo_url: 'https://www.renewschools.org/',
    type: 'elementary_school',
    grade_levels: ['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'],
    subjects: ['Reading', 'Writing', 'Math', 'Science', 'Social Studies', 'Art', 'Music', 'PE']
  },
  {
    id: 'renew-batiste',
    district_id: 'renew-nola',
    name: 'ReNEW Batiste Cultural Arts Academy',
    address: 'New Orleans, LA',
    primary_color: '#00A651',
    secondary_color: '#FFFFFF',
    accent_color: '#FF6B35',
    logo_url: 'https://www.renewschools.org/',
    type: 'elementary_school',
    grade_levels: ['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'],
    subjects: ['Reading', 'Writing', 'Math', 'Science', 'Social Studies', 'Art', 'Music', 'PE']
  },
  // Collegiate Academies Schools
  {
    id: 'sci-academy',
    district_id: 'collegiate-nola',
    name: 'Sci Academy',
    address: 'New Orleans, LA',
    primary_color: '#003366',
    secondary_color: '#FFFFFF',
    accent_color: '#FFB81C',
    logo_url: 'https://www.collegiateacademies.org/',
    type: 'high_school',
    grade_levels: ['9th Grade', '10th Grade', '11th Grade', '12th Grade'],
    subjects: [
      'Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus',
      'English I', 'English II', 'English III', 'English IV',
      'Biology', 'Chemistry', 'Physics', 'Environmental Science',
      'World History', 'US History', 'Government', 'Economics',
      'Spanish I', 'Spanish II', 'French I', 'French II',
      'Physical Education', 'Health', 'Art', 'Music', 'Computer Science'
    ]
  },
  {
    id: 'gw-carver-collegiate',
    district_id: 'collegiate-nola',
    name: 'George Washington Carver Collegiate Academy',
    address: 'New Orleans, LA',
    primary_color: '#003366',
    secondary_color: '#FFFFFF',
    accent_color: '#FFB81C',
    logo_url: 'https://www.collegiateacademies.org/',
    type: 'high_school',
    grade_levels: ['9th Grade', '10th Grade', '11th Grade', '12th Grade'],
    subjects: [
      'Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus',
      'English I', 'English II', 'English III', 'English IV',
      'Biology', 'Chemistry', 'Physics', 'Environmental Science',
      'World History', 'US History', 'Government', 'Economics',
      'Spanish I', 'Spanish II', 'French I', 'French II',
      'Physical Education', 'Health', 'Art', 'Music', 'Computer Science'
    ]
  },
  {
    id: 'gw-carver-prep',
    district_id: 'collegiate-nola',
    name: 'George Washington Carver Preparatory Academy',
    address: 'New Orleans, LA',
    primary_color: '#003366',
    secondary_color: '#FFFFFF',
    accent_color: '#FFB81C',
    logo_url: 'https://www.collegiateacademies.org/',
    type: 'middle_school',
    grade_levels: ['6th Grade', '7th Grade', '8th Grade'],
    subjects: ['Math', 'Science', 'English', 'Social Studies', 'Art', 'Music', 'PE']
  },
  {
    id: 'rosenwald-collegiate',
    district_id: 'collegiate-nola',
    name: 'Rosenwald Collegiate Academy',
    address: 'New Orleans, LA',
    primary_color: '#003366',
    secondary_color: '#FFFFFF',
    accent_color: '#FFB81C',
    logo_url: 'https://www.collegiateacademies.org/',
    type: 'high_school',
    grade_levels: ['9th Grade', '10th Grade', '11th Grade', '12th Grade'],
    subjects: [
      'Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus',
      'English I', 'English II', 'English III', 'English IV',
      'Biology', 'Chemistry', 'Physics', 'Environmental Science',
      'World History', 'US History', 'Government', 'Economics',
      'Spanish I', 'Spanish II', 'French I', 'French II',
      'Physical Education', 'Health', 'Art', 'Music', 'Computer Science'
    ]
  },
  {
    id: 'walter-cohen',
    district_id: 'collegiate-nola',
    name: 'Walter L. Cohen College Prep',
    address: 'New Orleans, LA',
    primary_color: '#003366',
    secondary_color: '#FFFFFF',
    accent_color: '#FFB81C',
    logo_url: 'https://www.collegiateacademies.org/',
    type: 'high_school',
    grade_levels: ['9th Grade', '10th Grade', '11th Grade', '12th Grade'],
    subjects: [
      'Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus',
      'English I', 'English II', 'English III', 'English IV',
      'Biology', 'Chemistry', 'Physics', 'Environmental Science',
      'World History', 'US History', 'Government', 'Economics',
      'Spanish I', 'Spanish II', 'French I', 'French II',
      'Physical Education', 'Health', 'Art', 'Music', 'Computer Science'
    ]
  },
  // New Orleans College Prep
  {
    id: 'hoffman-preschool',
    district_id: 'nocp-nola',
    name: 'Hoffman Early Learning Center',
    address: 'New Orleans, LA',
    primary_color: '#4A90E2',
    secondary_color: '#FFFFFF',
    accent_color: '#F5A623',
    logo_url: 'https://www.nolacollegeprep.org/',
    type: 'preschool',
    grade_levels: ['Pre-K'],
    subjects: ['Reading', 'Writing', 'Math', 'Science', 'Social Studies', 'Art', 'Music', 'PE']
  },
  // Archdiocese of New Orleans Schools
  {
    id: 'st-augustine-hs',
    district_id: 'archdiocese-nola',
    name: 'St. Augustine High School',
    address: 'New Orleans, LA',
    primary_color: '#4B0082',
    secondary_color: '#FFFFFF',
    accent_color: '#D4AF37',
    logo_url: 'https://nolacatholic.org/',
    type: 'high_school',
    grade_levels: ['9th Grade', '10th Grade', '11th Grade', '12th Grade'],
    subjects: [
      'Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus',
      'English I', 'English II', 'English III', 'English IV',
      'Biology', 'Chemistry', 'Physics', 'Environmental Science',
      'World History', 'US History', 'Government', 'Economics',
      'Spanish I', 'Spanish II', 'French I', 'French II',
      'Physical Education', 'Health', 'Art', 'Music', 'Computer Science'
    ]
  },
  {
    id: 'st-marys-academy',
    district_id: 'archdiocese-nola',
    name: 'St. Mary\'s Academy',
    address: 'New Orleans, LA',
    primary_color: '#003D7A',
    secondary_color: '#FFFFFF',
    accent_color: '#FFD700',
    logo_url: 'https://nolacatholic.org/',
    type: 'high_school',
    grade_levels: ['9th Grade', '10th Grade', '11th Grade', '12th Grade'],
    subjects: [
      'Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus',
      'English I', 'English II', 'English III', 'English IV',
      'Biology', 'Chemistry', 'Physics', 'Environmental Science',
      'World History', 'US History', 'Government', 'Economics',
      'Spanish I', 'Spanish II', 'French I', 'French II',
      'Physical Education', 'Health', 'Art', 'Music', 'Computer Science'
    ]
  },
  {
    id: 'st-marys-dominican',
    district_id: 'archdiocese-nola',
    name: 'St. Mary\'s Dominican High School',
    address: 'New Orleans, LA',
    primary_color: '#8B4513',
    secondary_color: '#FFFFFF',
    accent_color: '#DAA520',
    logo_url: 'https://nolacatholic.org/',
    type: 'high_school',
    grade_levels: ['9th Grade', '10th Grade', '11th Grade', '12th Grade'],
    subjects: [
      'Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus',
      'English I', 'English II', 'English III', 'English IV',
      'Biology', 'Chemistry', 'Physics', 'Environmental Science',
      'World History', 'US History', 'Government', 'Economics',
      'Spanish I', 'Spanish II', 'French I', 'French II',
      'Physical Education', 'Health', 'Art', 'Music', 'Computer Science'
    ]
  },
  {
    id: 'st-katharine-drexel',
    district_id: 'archdiocese-nola',
    name: 'St. Katharine Drexel Preparatory School',
    address: 'New Orleans, LA',
    primary_color: '#800080',
    secondary_color: '#FFFFFF',
    accent_color: '#FFD700',
    logo_url: 'https://nolacatholic.org/',
    type: 'high_school',
    grade_levels: ['9th Grade', '10th Grade', '11th Grade', '12th Grade'],
    subjects: [
      'Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus',
      'English I', 'English II', 'English III', 'English IV',
      'Biology', 'Chemistry', 'Physics', 'Environmental Science',
      'World History', 'US History', 'Government', 'Economics',
      'Spanish I', 'Spanish II', 'French I', 'French II',
      'Physical Education', 'Health', 'Art', 'Music', 'Computer Science'
    ]
  },
  // Houston ISD Schools
  {
    id: 'BELLAIRE-HS',
    district_id: 'houston-isd',
    name: 'Bellaire High School',
    address: 'Houston, TX',
    primary_color: '#C1272D',
    secondary_color: '#FFFFFF',
    accent_color: '#FFD700',
    logo_url: 'https://www.houstonisd.org/',
    type: 'high_school',
    grade_levels: ['9th Grade', '10th Grade', '11th Grade', '12th Grade'],
    subjects: [
      'Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus',
      'English I', 'English II', 'English III', 'English IV',
      'Biology', 'Chemistry', 'Physics', 'Environmental Science',
      'World History', 'US History', 'Government', 'Economics',
      'Spanish I', 'Spanish II', 'French I', 'French II',
      'Physical Education', 'Health', 'Art', 'Music', 'Computer Science'
    ]
  },
  {
    id: 'lincoln-elementary',
    district_id: 'houston-isd',
    name: 'Lincoln Elementary School',
    address: 'Houston, TX',
    primary_color: '#C1272D',
    secondary_color: '#FFFFFF',
    accent_color: '#FFD700',
    logo_url: 'https://www.houstonisd.org/',
    type: 'elementary_school',
    grade_levels: ['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'],
    subjects: ['Reading', 'Writing', 'Math', 'Science', 'Social Studies', 'Art', 'Music', 'PE']
  },
  {
    id: 'lamar-hs',
    district_id: 'houston-isd',
    name: 'Lamar High School',
    address: 'Houston, TX',
    primary_color: '#C1272D',
    secondary_color: '#FFFFFF',
    accent_color: '#FFD700',
    logo_url: 'https://www.houstonisd.org/',
    type: 'high_school',
    grade_levels: ['9th Grade', '10th Grade', '11th Grade', '12th Grade'],
    subjects: [
      'Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus',
      'English I', 'English II', 'English III', 'English IV',
      'Biology', 'Chemistry', 'Physics', 'Environmental Science',
      'World History', 'US History', 'Government', 'Economics',
      'Spanish I', 'Spanish II', 'French I', 'French II',
      'Physical Education', 'Health', 'Art', 'Music', 'Computer Science'
    ]
  },
  // KIPP Texas Schools
  {
    id: 'kipp-fifth-ward',
    district_id: 'kipp-texas',
    name: 'KIPP Fifth Ward Elementary',
    address: 'Houston, TX',
    primary_color: '#1F4788',
    secondary_color: '#FFFFFF',
    accent_color: '#E31937',
    logo_url: 'https://www.kipp.org/',
    type: 'elementary_school',
    grade_levels: ['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'],
    subjects: ['Reading', 'Writing', 'Math', 'Science', 'Social Studies', 'Art', 'Music', 'PE']
  },
  {
    id: 'kipp-southside',
    district_id: 'kipp-texas',
    name: 'KIPP Southside Secondary',
    address: 'Houston, TX',
    primary_color: '#1F4788',
    secondary_color: '#FFFFFF',
    accent_color: '#E31937',
    logo_url: 'https://www.kipp.org/',
    type: 'middle_school',
    grade_levels: ['6th Grade', '7th Grade', '8th Grade'],
    subjects: ['Math', 'Science', 'English', 'Social Studies', 'Art', 'Music', 'PE']
  },
  {
    id: 'kipp-houston-ls',
    district_id: 'kipp-texas',
    name: 'KIPP Houston Leadership School',
    address: 'Houston, TX',
    primary_color: '#1F4788',
    secondary_color: '#FFFFFF',
    accent_color: '#E31937',
    logo_url: 'https://www.kipp.org/',
    type: 'high_school',
    grade_levels: ['9th Grade', '10th Grade', '11th Grade', '12th Grade'],
    subjects: [
      'Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus',
      'English I', 'English II', 'English III', 'English IV',
      'Biology', 'Chemistry', 'Physics', 'Environmental Science',
      'World History', 'US History', 'Government', 'Economics',
      'Spanish I', 'Spanish II', 'French I', 'French II',
      'Physical Education', 'Health', 'Art', 'Music', 'Computer Science'
    ]
  },
  {
    id: 'kipp-houston-secondary',
    district_id: 'kipp-texas',
    name: 'KIPP Houston Secondary',
    address: 'Houston, TX',
    primary_color: '#1F4788',
    secondary_color: '#FFFFFF',
    accent_color: '#E31937',
    logo_url: 'https://www.kipp.org/',
    type: 'high_school',
    grade_levels: ['9th Grade', '10th Grade', '11th Grade', '12th Grade'],
    subjects: [
      'Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus',
      'English I', 'English II', 'English III', 'English IV',
      'Biology', 'Chemistry', 'Physics', 'Environmental Science',
      'World History', 'US History', 'Government', 'Economics',
      'Spanish I', 'Spanish II', 'French I', 'French II',
      'Physical Education', 'Health', 'Art', 'Music', 'Computer Science'
    ]
  },
  {
    id: 'kipp-northbrook',
    district_id: 'kipp-texas',
    name: 'KIPP Northbrook Elementary',
    address: 'Houston, TX',
    primary_color: '#1F4788',
    secondary_color: '#FFFFFF',
    accent_color: '#E31937',
    logo_url: 'https://www.kipp.org/',
    type: 'elementary_school',
    grade_levels: ['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'],
    subjects: ['Reading', 'Writing', 'Math', 'Science', 'Social Studies', 'Art', 'Music', 'PE']
  },
  // YES Prep Texas Schools
  {
    id: 'yes-north-forest',
    district_id: 'yes-prep-tx',
    name: 'YES Prep North Forest',
    address: 'Houston, TX',
    primary_color: '#E31937',
    secondary_color: '#1F4788',
    accent_color: '#FFD700',
    logo_url: 'https://www.yesprep.org/',
    type: 'middle_school',
    grade_levels: ['6th Grade', '7th Grade', '8th Grade'],
    subjects: ['Math', 'Science', 'English', 'Social Studies', 'Art', 'Music', 'PE']
  },
  // Knights Academy (Friends Access)
  {
    id: '05KNIGHTS',
    district_id: 'knights-district',
    name: 'Knights Academy',
    address: 'Online',
    primary_color: '#6B46C1',
    secondary_color: '#FFFFFF',
    accent_color: '#F59E0B',
    logo_url: 'https://gradeflow.app/',
    type: 'k12',
    grade_levels: [
      'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade',
      '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'
    ],
    subjects: [
      'Reading', 'Writing', 'Math', 'Science', 'Social Studies', 'Art', 'Music', 'PE',
      'English Language Arts', 'Pre-Algebra', 'Algebra I', 'Life Science', 'Earth Science', 'World History',
      'Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus',
      'English I', 'English II', 'English III', 'English IV',
      'Biology', 'Chemistry', 'Physics', 'Environmental Science',
      'World History', 'US History', 'Government', 'Economics',
      'Spanish I', 'Spanish II', 'French I', 'French II',
      'Physical Education', 'Health', 'Art', 'Music', 'Computer Science',
      'Special Education'
    ]
  }
]

// ─── Spanish Demo Data (used when language is set to 'es') ─────────────────────
const DEMO_CLASSES_ES = [
  { id: 1, period: '1ero', subject: 'Matemáticas', students: 24, gpa: 87.4, trend: 'up',     color: '#3b7ef4', needsAttention: 3 },
  { id: 2, period: '2do',  subject: 'Lectura',    students: 22, gpa: 91.2, trend: 'up',     color: '#22c97a', needsAttention: 1 },
  { id: 3, period: '3ero', subject: 'Ciencias',   students: 26, gpa: 63.8, trend: 'down',   color: '#f04a4a', needsAttention: 8 },
  { id: 4, period: '4to',  subject: 'Escritura',  students: 20, gpa: 84.0, trend: 'stable', color: '#f54a7a', needsAttention: 0 },
]

const DEMO_STUDENTS_ES = [
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

const DEMO_ASSIGNMENTS_ES = [
  { id: 1, classId: 1, name: 'Cap.3 Examen',     type: 'quiz',         categoryId: 2, date: '2024-10-14', dueDate: '2024-10-14', hasKey: true,  options: {} },
  { id: 2, classId: 1, name: 'Cap.3 Tarea',     type: 'homework',     categoryId: 3, date: '2024-10-12', dueDate: '2024-10-12', hasKey: true,  options: {} },
  { id: 3, classId: 1, name: 'Examen Unidad 1', type: 'test',         categoryId: 1, date: '2024-10-10', dueDate: '2024-10-10', hasKey: false, options: {} },
  { id: 4, classId: 1, name: 'Participación',    type: 'participation', categoryId: 4, date: '2024-10-01', dueDate: '2024-10-31', hasKey: false, options: { max_points: 10 } },
]

const DEMO_MESSAGES_ES = [
  { id: 1, studentName: 'Marcus Thompson', subject: 'Matemáticas', trigger: 'Falló 58%',      status: 'pending', tone: 'Warm & Friendly', draft: 'Estimado Padre, Marcus recibió 58% en su evaluación de Matemáticas. Me encantaría conectar esta semana para discutir opciones de apoyo.', positiveDraft: '¡Hola! Solo quería compartir que Marcus está mostrando un esfuerzo real en clase. Sigamos construyendo ese momento.', dayOld: false },
  { id: 2, studentName: 'Aaliyah Brooks',  subject: 'Lectura',    trigger: 'Mejoró +12pts', status: 'sent',    tone: 'Celebrating',     draft: '¡Buenas noticias! Aaliyah mejoró su puntaje de Lectura en 12 puntos. Está trabajando muy duro.', positiveDraft: 'Aaliyah está haciendo un trabajo increíble. Su dedicación realmente está dando resultados.', dayOld: false },
  { id: 3, studentName: 'Liam Martinez',   subject: 'Ciencias',   trigger: 'Falló 61%',      status: 'pending', tone: 'Warm & Friendly', draft: 'Estimado Padre, quería contactarlo regarding la evaluación reciente de Ciencias de Liam.', positiveDraft: 'Liam está mostrando curiosidad en la clase de Ciencias. Aquí hay algunas formas de apoyar en casa.', dayOld: true  },
]

const DEMO_LESSONS_ES = {
  1: [
    { id: 'math-0', classId: 1, dayLabel: 'Hoy',    date: 'Mar · 10', title: 'Cap. 4 · Fracciones y Decimales', duration: '45 min', pages: 'Páginas 84–91', objective: 'Los estudiantes compararán fracciones y decimales y convertirán entre formas.', warmup: ['Decimal del día', 'Comparación rápida: 0.4 vs 3/8'], activities: ['Mini-lección sobre conversión fracción/decimal', 'Ordenamiento por estaciones de parejas', 'Problemas de práctica guiada 1–8', 'Boleto de salida'], materials: ['Libro de trabajo', 'Pizarra', 'Tiras de fracciones'], homework: 'Libro de trabajo página 91, problemas 9–14', status: 'pending' },
    { id: 'math-1', date: '2026-04-01', classId: 1, dayLabel: 'Anterior', date: 'Mar · 9',  title: 'Cap. 4 · Fracciones Equivalentes', duration: '45 min', pages: 'Páginas 80–83', objective: 'Los estudiantes identificarán y generarán fracciones equivalentes.', warmup: ['Revisión de modelos visuales de fracciones'], activities: ['Modelado del maestro', 'Práctica en grupos pequeños', 'Verificación independiente'], materials: ['Libro de trabajo', 'Fichas de fracciones'], homework: 'Hoja de práctica A', status: 'done' },
    { id: 'math-2', date: '2026-04-02', classId: 1, dayLabel: 'Siguiente', date: 'Mar · 11', title: 'Cap. 4 · Ordenar Fracciones',   duration: '45 min', pages: 'Páginas 92–96', objective: 'Los estudiantes ordenarán fracciones, decimales y porcentajes.', warmup: ['Desafío de línea numérica'], activities: ['Problema de calendario', 'Ejemplos guiados', 'Rotación de estaciones'], materials: ['Libro de trabajo', 'Líneas numéricas'], homework: 'Libro de trabajo página 96', status: 'pending' },
  ],
  2: [
    { id: 'read-0', classId: 2, dayLabel: 'Hoy',    date: 'Mar · 10', title: 'Unidad 3 · Idea Principal y Detalles', duration: '45 min', pages: 'Páginas 56–63', objective: 'Los estudiantes identificarán la idea principal y los detalles de apoyo en no ficción.', warmup: ['Escritura rápida: ¿cuál es la idea principal de un párrafo?'], activities: ['Modelar con texto mentor', 'Práctica guiada', 'Trabajo de parejas', 'Compartir'], materials: ['Antología', 'Resaltadores'], homework: 'Leer páginas 64–67 y anotar', status: 'pending' },
    { id: 'read-1', classId: 2, dayLabel: 'Anterior', date: 'Mar · 9',  title: 'Unidad 3 · Estructura del Texto',      duration: '45 min', pages: 'Páginas 50–55', objective: 'Los estudiantes identificarán estructuras causa/efecto y comparar/contrastar.', warmup: ['Ordenamiento de palabras de señal'], activities: ['Cuadro de estructura de texto', 'Lectura de parejas', 'Boleto de salida'], materials: ['Antología'], homework: 'Terminar organizador gráfico', status: 'done' },
  ],
  3: [
    { id: 'sci-0', classId: 3, dayLabel: 'Hoy', date: 'Mar · 10', title: 'Cap. 6 · Estados de la Materia', duration: '50 min', pages: 'Páginas 120–128', objective: 'Los estudiantes describirán las propiedades de sólidos, líquidos y gases.', warmup: ['Clasificación de materia: objetos cotidianos'], activities: ['Demostración de laboratorio — hielo deritiéndose', 'Etiquetado de diagrama', 'Discusión', 'Escritura rápida'], materials: ['Hielo', 'Vasos de precipitados', 'Hojas de laboratorio'], homework: 'Leer páginas 129–131', status: 'pending' },
  ],
  4: [
    { id: 'writ-0', classId: 4, dayLabel: 'Hoy', date: 'Mar · 10', title: 'Unidad 2 · Escritura Argumentativa', duration: '45 min', pages: 'Páginas 34–41', objective: 'Los estudiantes escribirán una afirmación con al menos dos razones de apoyo.', warmup: ['Tomar posición: prompt de acuerdo o desacuerdo'], activities: ['Modelar escritura de afirmación', 'Borrador de esquema', 'Retroalimentación de pares'], materials: ['Diarios de escritura', 'Textos mentores'], homework: 'Completar borrador de esquema', status: 'pending' },
  ],
}

const DEMO_FEED_ES = [
  { id: 1, classId: 1, author: 'Sra. Johnson', content: '📅 Examen de Unidad el viernes! Repasar capítulos 3-4. Guía de estudio publicada abajo.', time: 'hace 2 horas', reactions: { '👍': 12, '❤': 5, '😂': 2 }, confused: 3, questions: 1, approved: true },
  { id: 2, classId: 1, author: 'Sra. Johnson', content: '🎉 ¡Gran trabajo en la tarea de ayer! El promedio de la clase fue 87%.',       time: 'Ayer',  reactions: { '👍': 18, '❤': 9, '😂': 4 }, confused: 0, questions: 0, approved: true },
]

const DEMO_REMINDERS_ES = [
  { id: 1, text: 'Calificar Exámenes Cap.3',   due: 'Hoy',    done: false, priority: 'high'   },
  { id: 2, text: 'Llamada a padre — Marcus T.', due: 'Hoy',    done: false, priority: 'high'   },
  { id: 3, text: 'Actualizar plan de lección Mie',  due: 'Mañana', done: false, priority: 'medium' },
  { id: 4, text: 'Enviar asistencia',       due: 'Vie',      done: true,  priority: 'low'    },
]

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Tests',         weight: 40, color: '#f04a4a', icon: '📝' },
  { id: 2, name: 'Quizzes',       weight: 30, color: '#f5a623', icon: '✏' },
  { id: 3, name: 'Homework',      weight: 20, color: '#3b7ef4', icon: '📚' },
  { id: 4, name: 'Participation', weight: 10, color: '#22c97a', icon: '🙋' },
]

const CURRICULUM_SOURCES = [
  // HISD Curriculum
  { id: 'hisd-zearn',           name: 'HISD Zearn Math',            publisher: 'HISD/Zearn',           subjects: ['Math'], logo: '🔢', searchable: true  },
  { id: 'hisd-literacy',        name: 'HISD Literacy Project',      publisher: 'HISD',                  subjects: ['Reading', 'ELA'], logo: '📚', searchable: true  },
  { id: 'hisd-science',         name: 'HISD Science',               publisher: 'HISD',                  subjects: ['Science'], logo: '🔬', searchable: true  },
  
  // KIPP Curriculum  
  { id: 'illustrative-math',    name: 'Illustrative Math',           publisher: 'Illustrative Math',      subjects: ['Math'], logo: '📐', searchable: true  },
  { id: 'ckla',                name: 'CKLA Reading',               publisher: 'Amplify',              subjects: ['Reading', 'ELA'], logo: '📖', searchable: true  },
  { id: 'fishtank-ela',        name: 'Fishtank ELA',              publisher: 'Fishtank Learning',    subjects: ['Reading', 'ELA'], logo: '🐟', searchable: true  },
  { id: 'novel-ela',           name: 'Novel ELA',                 publisher: 'Novel Partners',        subjects: ['Reading', 'ELA'], logo: '📕', searchable: true  },
  { id: 'amplify-science',     name: 'Amplify Science',            publisher: 'Amplify',              subjects: ['Science'], logo: '🧪', searchable: true  },
  { id: 'democratic-knowledge',  name: 'Democratic Knowledge Project', publisher: 'DKP',                  subjects: ['Social Studies'], logo: '🏛️', searchable: true  },
  { id: 'investigating-history', name: 'Investigating History',      publisher: 'MA DOE',               subjects: ['Social Studies'], logo: '🔍', searchable: true  },
  
  // Common National Curriculum (existing)
  { id: 'gomath',              name: 'Go Math',                    publisher: 'Houghton Mifflin',     subjects: ['Math'], logo: '📐', searchable: true  },
  { id: 'readingwonders',      name: 'Reading Wonders',            publisher: 'McGraw-Hill',          subjects: ['Reading', 'ELA'], logo: '📖', searchable: true  },
  { id: 'studysync',           name: 'StudySync',                  publisher: 'McGraw-Hill',          subjects: ['Writing', 'ELA'], logo: '✍', searchable: true  },
  { id: 'eureka',              name: 'Eureka Math',                publisher: 'Great Minds',          subjects: ['Math'], logo: '∑',  searchable: true  },
  { id: 'ckscience',           name: 'CK-12 Science',              publisher: 'CK-12',                subjects: ['Science'], logo: '⚗', searchable: true  },
  { id: 'commonlit',           name: 'CommonLit',                  publisher: 'CommonLit',            subjects: ['Reading', 'ELA'], logo: '📜', searchable: true  },
  { id: 'custom',              name: 'Custom / No textbook',       publisher: '',                      subjects: [], logo: '🏗', searchable: false },
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
  page: 'home', // Current page from hash router
  schools: [], // Array of schools with branding data

  setCurrentUser: (user) => set({
    currentUser: user,
    lang: user?.lang || 'en',
  }),

  // OAuth authentication handler
  setAuth: (user) => {
    set({
      currentUser: user,
      lang: user?.lang || 'en',
    });
    
    // Store session persistence in localStorage for OAuth users
    if (user?.isOAuthUser) {
      localStorage.setItem('gradeflow_oauth_user', JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        provider: user.provider,
        avatar_url: user.avatar_url,
        school_id: user.school_id,
        isOAuthUser: true
      }));
    }
  },

  setLang: (lang) => {
    localStorage.setItem('gradeflow_lang', lang)
    set(state => ({
      lang,
      currentUser: state.currentUser
        ? { ...state.currentUser, lang }
        : state.currentUser,
    }))
    // Reload demo data in new language
    get().loadFromDB()
  },

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

  /**
   * Set the current page and update browser hash
   * Call this from components instead of manually setState
   */
  setPage: (page) => {
    const { currentUser } = get();
    
    // Update state
    set({ page });
    
    // Only update hash if user is authenticated
    if (currentUser) {
      const role = currentUser?.role || null;
      const hash = pageToHash(page, role);
      if (window.location.hash !== hash) {
        window.history.pushState({ page, role }, '', hash);
      }
    }
  },

  /**
   * Reset to home page (used on logout, demo reset, etc.)
   */
  resetToHome: () => {
    set({ page: 'home' });
    window.history.replaceState({}, '#/');
  },

  /**
   * Go back in history (alternative to browser back button)
   */
  goBack: () => {
    window.history.back();
  },

  // ── Teacher profile ─────────────────────────────────────────────────────────
  teacher: {
    id: 1,
    name: 'Ms. Rodriguez',
    school: 'Houston ISD',
    schoolColor: '#003057',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MsRodriguez',
  },
  subjects: ['Math', 'Science'],
  teacherProfile: null, // Will be set during onboarding

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

  fetchStudentsFromSupabase: async () => {
    try {
      const { currentUser } = get()
      if (!currentUser || currentUser?.email?.includes('@demo') || currentUser?.id?.startsWith('demo-')) {
        return // Skip for demo accounts
      }

      // Load students assigned to Ms. Rod (teacher_id = 1)
      const { data: studentsData, error } = await supabase
        .from('students')
        .select('*')
        .eq('teacher_id', 1) // Ms. Rod's teacher ID

      if (error) {
        console.error('Error fetching students:', error)
        return
      }

      if (studentsData && studentsData.length > 0) {
        // Transform students data to match the expected format
        const transformedStudents = studentsData.map(student => ({
          id: student.id,
          classId: student.class_id,
          name: student.name,
          email: student.email,
          grade: student.grade || 0,
          letter: student.grade >= 90 ? 'A' : student.grade >= 80 ? 'B' : student.grade >= 70 ? 'C' : student.grade >= 60 ? 'D' : 'F',
          submitted: student.submitted || false,
          submitUngraded: student.submit_ungraded || false,
          flagged: student.flagged || false,
          accommodations: student.accommodations || null
        }))
        
        set({ students: transformedStudents })
        console.log(`Loaded ${studentsData.length} students for Ms. Rodriguez from Supabase`)
      }
    } catch (error) {
      console.error('Error in fetchStudentsFromSupabase:', error)
    }
  },

  fetchGradesFromSupabase: async () => {
    try {
      const { currentUser } = get()
      if (!currentUser || currentUser?.email?.includes('@demo') || currentUser?.id?.startsWith('demo-')) {
        return // Skip for demo accounts
      }

      // Load ALL grades from Supabase (not just per teacher)
      const { data: gradesData, error } = await supabase
        .from('grades')
        .select('*')

      if (error) {
        console.error('Error fetching grades:', error)
        return
      }

      if (gradesData && gradesData.length > 0) {
        // Transform grades data to match the expected format
        const transformedGrades = gradesData.map(grade => ({
          studentId: grade.student_id,
          assignmentId: grade.assignment_id,
          score: grade.score
        }))
        
        set({ grades: transformedGrades })
        console.log(`Loaded ${gradesData.length} grades from Supabase`)
      }
    } catch (error) {
      console.error('Error in fetchGradesFromSupabase:', error)
    }
  },
  
  fetchClassesFromSupabase: async () => {
    try {
      const { currentUser } = get()
      if (!currentUser || currentUser?.email?.includes('@demo') || currentUser?.id?.startsWith('demo-')) {
        return // Skip for demo accounts
      }

      // Load ALL classes from Supabase
      const { data: classesData, error } = await supabase
        .from('classes')
        .select('*')

      if (error) {
        console.error('Error fetching classes:', error)
        return
      }

      if (classesData && classesData.length > 0) {
        // Transform classes data to match the expected format
        const transformedClasses = classesData.map(cls => ({
          id: cls.id,
          period: cls.period || '1st',
          subject: cls.subject || 'Math',
          students: cls.students || 20,
          gpa: cls.gpa || 85.0,
          trend: cls.trend || 'stable',
          color: cls.color || '#3b7ef4',
          needsAttention: cls.needs_attention || 0
        }))
        
        set({ classes: transformedClasses })
        console.log(`Loaded ${classesData.length} classes from Supabase`)
      }
    } catch (error) {
      console.error('Error in fetchClassesFromSupabase:', error)
    }
  },

  fetchAssignmentsFromSupabase: async () => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
      
      if (error) throw error
      
      set(state => ({
        ...state,
        assignments: data || [],
      }))
    } catch (error) {
      console.error('Error in fetchAssignmentsFromSupabase:', error)
    }
  },

  fetchLessonsFromSupabase: async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
      
      if (error) throw error
      
      set(state => ({
        ...state,
        lessons: data || [],
      }))
    } catch (error) {
      console.error('Error in fetchLessonsFromSupabase:', error)
    }
  },

  countStudents: async () => {
    try {
      console.log('Counting students in Supabase...')
      
      // Get total count of students
      const { count, error } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.error('Error counting students:', error)
        return null
      }

      console.log(`Total students in database: ${count || 0}`)
      return count || 0

    } catch (error) {
      console.error('Error counting students:', error)
      return null
    }
  },

  checkStudentGrades: async () => {
    try {
      console.log('Checking students with grades in Supabase...\n')

      // 1. Get total students count
      const { data: allStudents, error: studentsError } = await supabase
        .from('students')
        .select('id, name, email, class_id, grade')
      
      if (studentsError) {
        console.error('Error fetching students:', studentsError)
        return null
      }

      console.log(`Total students in database: ${allStudents?.length || 0}`)

      // 2. Get all grades
      const { data: allGrades, error: gradesError } = await supabase
        .from('grades')
        .select('student_id, assignment_id, score')
      
      if (gradesError) {
        console.error('Error fetching grades:', gradesError)
        return null
      }

      console.log(`Total grade records in database: ${allGrades?.length || 0}`)

      // 3. Find unique students who have grades
      const studentsWithGrades = new Set()
      const gradesByStudent = {}
      
      allGrades?.forEach(grade => {
        studentsWithGrades.add(grade.student_id)
        if (!gradesByStudent[grade.student_id]) {
          gradesByStudent[grade.student_id] = []
        }
        gradesByStudent[grade.student_id].push(grade.score)
      })

      console.log(`Students with at least one grade: ${studentsWithGrades.size}`)

      // 4. Find students without grades
      const studentsWithoutGrades = allStudents?.filter(
        student => !studentsWithGrades.has(student.id)
      ) || []

      console.log(`Students without any grades: ${studentsWithoutGrades.length}`)

      // 5. Calculate average grades for students with grades
      let overallAverage = 0
      if (Object.keys(gradesByStudent).length > 0) {
        const averages = Object.values(gradesByStudent).map(grades => {
          const sum = grades.reduce((a, b) => a + b, 0)
          return sum / grades.length
        })
        
        overallAverage = averages.reduce((a, b) => a + b, 0) / averages.length
        console.log(`Average grade for students with grades: ${overallAverage.toFixed(1)}%`)
      }

      // 6. Show breakdown by class
      const classBreakdown = {}
      if (allStudents && allStudents.length > 0) {
        console.log('\n--- Breakdown by Class ---')
        
        const classGroups = {}
        allStudents.forEach(student => {
          const classId = student.class_id || 'unassigned'
          if (!classGroups[classId]) {
            classGroups[classId] = { total: 0, withGrades: 0, students: [] }
          }
          classGroups[classId].total++
          classGroups[classId].students.push(student)
          
          if (studentsWithGrades.has(student.id)) {
            classGroups[classId].withGrades++
          }
        })

        Object.entries(classGroups).forEach(([classId, data]) => {
          const percentage = data.total > 0 ? Math.round((data.withGrades / data.total) * 100) : 0
          console.log(`Class ${classId}: ${data.withGrades}/${data.total} students have grades (${percentage}%)`)
          classBreakdown[classId] = {
            total: data.total,
            withGrades: data.withGrades,
            percentage
          }
        })
      }

      // 7. Summary
      console.log('\n--- Summary ---')
      const totalStudents = allStudents?.length || 0
      const withGrades = studentsWithGrades.size
      const withoutGrades = studentsWithoutGrades.length
      const coveragePercentage = totalStudents > 0 ? Math.round((withGrades / totalStudents) * 100) : 0

      console.log(`Grade Coverage: ${withGrades}/${totalStudents} students (${coveragePercentage}%)`)
      console.log(`Missing Grades: ${withoutGrades} students`)
      
      // Return the report data
      return {
        timestamp: new Date().toISOString(),
        totalStudents,
        studentsWithGrades: withGrades,
        studentsWithoutGrades: withoutGrades,
        coveragePercentage,
        overallAverage,
        classBreakdown,
        studentsWithoutGradesList: studentsWithoutGrades.slice(0, 10),
        totalGradeRecords: allGrades?.length || 0
      }

    } catch (error) {
      console.error('Error checking student grades:', error)
      return null
    }
  },

  loadFromDB: async () => {
    try {

    // Add timeout to prevent hanging on mobile
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database connection timeout')), 3000)
    })

    // Load schools data from Supabase with error handling
    let schoolsData = null
    let schoolsError = null
    
    try {
      const schoolsPromise = supabase
        .from('schools')
        .select('*')

      const result = await Promise.race([schoolsPromise, timeoutPromise])
      schoolsData = result.data
      schoolsError = result.error
      
      if (schoolsError) {
        console.error('Error loading schools:', schoolsError);
      }
    } catch (err) {
      // Handle case where schools table doesn't exist yet
      console.warn('Schools table not available, using fallback:', err.message);
      schoolsError = err
    }

    const currentUser = get().currentUser
    const isDemoAccount = currentUser?.email?.includes('@demo') || 
                           currentUser?.id?.startsWith('demo-')

    // Only load demo data for actual demo accounts
    if (isDemoAccount) {
      // Demo mode - load demo data based on current language
      const lang = get().lang
      const data = lang === 'es' 
        ? {
            classes:     DEMO_CLASSES_ES,
            students:    DEMO_STUDENTS_ES,
            assignments: DEMO_ASSIGNMENTS_ES,
            grades:      DEMO_GRADES, // Same for both
            messages:    DEMO_MESSAGES_ES,
            feed:        DEMO_FEED_ES,
            lessons:     DEMO_LESSONS_ES,
            reminders:   DEMO_REMINDERS_ES,
            schools:     schoolsData || DEMO_SCHOOLS, // Add schools data
          }
        : {
            classes:     DEMO_CLASSES,
            students:    DEMO_STUDENTS,
            assignments: DEMO_ASSIGNMENTS,
            grades:      DEMO_GRADES,
            messages:    DEMO_MESSAGES,
            feed:        DEMO_FEED,
            lessons:     DEMO_LESSONS,
            reminders:   DEMO_REMINDERS,
            schools:     schoolsData || DEMO_SCHOOLS, // Add schools data
          }
        
        set(state => ({
          ...state,
          ...data,
          dbLoaded: true,
          isHydrated: true,
          dbError: schoolsError ? schoolsError.message : null
        }))
      } else {
        // Real teacher - load data from Supabase
        set(state => ({
          ...state,
          classes: [], // Will be populated from Supabase
          students: [],
          assignments: [],
          grades: [],
          messages: [],
          feed: [],
          lessons: [], // Will be populated from Supabase
          reminders: [],
          schools: schoolsData || DEMO_SCHOOLS, // Still load schools for validation
          dbLoaded: true,
          isHydrated: true,
          dbError: schoolsError ? schoolsError.message : null
        }))
        
        // Fetch real data from Supabase
        get().fetchClassesFromSupabase()
        get().fetchStudentsFromSupabase()
        get().fetchAssignmentsFromSupabase()
        get().fetchGradesFromSupabase()
        get().fetchLessonsFromSupabase()
      }
    } catch (error) {
      console.error('Error in loadFromDB:', error);
      set(state => ({
        ...state,
        dbLoaded: true,
        isHydrated: true,
        dbError: error.message,
        schools: DEMO_SCHOOLS, // Fallback to demo schools array
      }));
    }
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

  // ── Educational Standards ───────────────────────────────────────────────────
  currentStandards: [],
  selectedStandards: [],
  standardsLoading: false,
  standardsError: null,


  setCurrentStandards: (standards) => set({ currentStandards: standards }),
  setSelectedStandards: (standards) => set({ selectedStandards: standards }),
  setStandardsLoading: (loading) => set({ standardsLoading: loading }),
  setStandardsError: (error) => set({ standardsError: error }),

  // Add/remove standards from selection
  addSelectedStandard: (standard) => set(state => ({
    selectedStandards: [...state.selectedStandards, standard]
  })),
  removeSelectedStandard: (standardCode) => set(state => ({
    selectedStandards: state.selectedStandards.filter(s => s.code !== standardCode)
  })),
  clearSelectedStandards: () => set({ selectedStandards: [] }),

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

  addClass: (newClass) => set(state => ({
    classes: [...state.classes, newClass]
  })),

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

// Export demo schools for use in other modules
export { DEMO_SCHOOLS }
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

const DEMO_LESSONS = {
  1: [
    // Week 1: Place Value & Number Sense
    { id: 'math-1', classId: 1, dayLabel: 'Wed · Apr 1', date: '2026-04-01', title: 'Unit 1 · Place Value to Millions', duration: '45 min', pages: 'Pages 12-15', objective: 'Students will read, write, and compare numbers to millions place.', warmup: ['Number of the day: 2,457,891', 'Place value review'], activities: ['Place value chart modeling', 'Expanded form practice', 'Partner comparison game'], materials: ['Place value charts', 'Base-10 blocks', 'Whiteboards'], homework: 'Workbook page 16, problems 1-12', status: 'done', pdf: 'https://www.commoncoresheets.com/Math/Content/5/NBT/1/Download/5NBT-A1.pdf' },
    { id: 'math-2', date: '2026-04-02', classId: 1, dayLabel: 'Thu · Apr 2', title: 'Unit 1 · Ordering & Rounding', duration: '45 min', pages: 'Pages 17-20', objective: 'Students will order and round numbers to millions place.', warmup: ['Quick round: 47,823 to nearest thousand', 'Number line placement'], activities: ['Rounding rules anchor chart', 'Station rotation: rounding practice', 'Real-world rounding problems'], materials: ['Number lines', 'Rounding cards', 'Calculators for checking'], homework: 'Workbook page 21, problems 1-15', status: 'done', pdf: 'https://www.commoncoresheets.com/Math/Content/5/NBT/2/Download/5NBT-A4.pdf' },
    { id: 'math-3', date: '2026-04-03', classId: 1, dayLabel: 'Fri · Apr 3', title: 'Unit 1 · Addition & Subtraction Review', duration: '45 min', pages: 'Pages 22-25', objective: 'Students will add and subtract multi-digit numbers with regrouping.', warmup: ['Mental math: 456+789', 'Regrouping review'], activities: ['Standard algorithm practice', 'Word problem strategies', 'Error analysis'], materials: ['Graph paper', 'Colored pencils'], homework: 'Workbook page 26, problems 1-10', status: 'done', pdf: 'https://www.k5learning.com/Math/Grade-5/Number-and-Operations-in-Base-Ten/Worksheets/5NBTB7.pdf' },
    
    
    
    // Week 2: Multi-Digit Multiplication
    { id: 'math-6', date: '2026-04-06', classId: 1, dayLabel: 'Mon · Apr 6', title: 'Unit 2 · 2-Digit × 2-Digit Multiplication', duration: '45 min', pages: 'Pages 34-37', objective: 'Students will multiply 2-digit by 2-digit numbers.', warmup: ['Mental math: 23×45', 'Estimation practice'], activities: ['Area model demonstration', 'Standard algorithm practice', 'Partner check'], materials: ['Graph paper', 'Base-10 blocks'], homework: 'Workbook page 38, problems 1-12', status: 'pending', pdf: 'https://www.mathworksheetsland.com/multiplication/2-digit-by-2-digit/worksheets/' },
    { id: 'math-7', date: '2026-04-07', classId: 1, dayLabel: 'Tue · Apr 7', title: 'Unit 2 · 3-Digit × 2-Digit Multiplication', duration: '45 min', pages: 'Pages 39-42', objective: 'Students will multiply 3-digit by 2-digit numbers.', warmup: ['Quick multiply: 156×34', 'Place value review'], activities: ['Expanded form method', 'Lattice multiplication', 'Word problem application'], materials: ['Lattice grids', 'Expanded form cards'], homework: 'Workbook page 43, problems 1-10', status: 'pending', pdf: 'https://www.mathworksheetsland.com/multiplication/3-digit-by-2-digit/worksheets/' },
    { id: 'math-8', date: '2026-04-08', classId: 1, dayLabel: 'Wed · Apr 8', title: 'Unit 2 · Multiplication Word Problems', duration: '45 min', pages: 'Pages 44-47', objective: 'Students will solve multi-step multiplication word problems.', warmup: ['Key words identification', 'Operation selection'], activities: ['CUBES strategy practice', 'Real-world scenarios', 'Partner problem creation'], materials: ['CUBES posters', 'Word problem cards'], homework: 'Workbook page 48, problems 1-8', status: 'pending', pdf: 'https://www.math-aids.com/Multiplication/Word-Problems/Multiplication-Word-Problems-Worksheet.pdf' },
    { id: 'math-9', date: '2026-04-09', classId: 1, dayLabel: 'Thu · Apr 9', title: 'Unit 2 · Multiplication Review', duration: '45 min', pages: 'Pages 49-51', objective: 'Students will review multiplication concepts and strategies.', warmup: ['Mixed practice problems', 'Strategy selection'], activities: ['Error analysis', 'Strategy sharing', 'Practice stations'], materials: ['Strategy cards', 'Whiteboards'], homework: 'Study for unit test', status: 'pending', pdf: 'https://www.k5learning.com/Math/Grade-5/Number-and-Operations-in-Base-Ten/Worksheets/5NBTB5.pdf' },
    
    
    // Week 3: Division Concepts
    { id: 'math-11', date: '2026-04-13', classId: 1, dayLabel: 'Mon · Apr 13', title: 'Unit 3 · Division Concepts', duration: '45 min', pages: 'Pages 55-58', objective: 'Students will understand division as equal sharing and repeated subtraction.', warmup: ['Division fact warm-up', 'Sharing scenarios'], activities: ['Manipulatives exploration', 'Repeated subtraction modeling', 'Array connections'], materials: ['Counters', 'Array grids', 'Sharing mats'], homework: 'Workbook page 59, problems 1-10', status: 'pending', pdf: 'https://www.mathworksheetsland.com/division/introduction-to-division/worksheets/' },
    { id: 'math-12', date: '2026-04-14', classId: 1, dayLabel: 'Tue · Apr 14', title: 'Unit 3 · 2-Digit Division', duration: '45 min', pages: 'Pages 60-63', objective: 'Students will divide 2-digit numbers with and without remainders.', warmup: ['Division fact practice', 'Estimation review'], activities: ['Long division algorithm', 'Remainder interpretation', 'Real-world division'], materials: ['Division charts', 'Base-10 blocks'], homework: 'Workbook page 64, problems 1-12', status: 'pending', pdf: 'https://www.mathworksheetsland.com/division/dividing-by-1-digit/worksheets/' },
    { id: 'math-13', date: '2026-04-15', classId: 1, dayLabel: 'Wed · Apr 15', title: 'Unit 3 · 3-Digit Division', duration: '45 min', pages: 'Pages 65-68', objective: 'Students will divide 3-digit numbers by 2-digit numbers.', warmup: ['Estimation challenges', 'Place value division'], activities: ['Area model division', 'Standard algorithm practice', 'Word problem application'], materials: ['Area model grids', 'Division templates'], homework: 'Workbook page 69, problems 1-8', status: 'pending', pdf: 'https://www.mathworksheetsland.com/division/dividing-by-2-digit/worksheets/' },
    { id: 'math-14', date: '2026-04-16', classId: 1, dayLabel: 'Thu · Apr 16', title: 'Unit 3 · Division Word Problems', duration: '45 min', pages: 'Pages 70-73', objective: 'Students will solve division word problems with remainders.', warmup: ['Key words review', 'Remainder interpretation'], activities: ['CUBES for division', 'Real-world scenarios', 'Partner problem solving'], materials: ['Word problem cards', 'Remainder charts'], homework: 'Workbook page 74, problems 1-6', status: 'pending', pdf: 'https://www.math-aids.com/Division/Word-Problems/Division-Word-Problems-Worksheet.pdf' },
    { id: 'math-15', date: '2026-04-17', classId: 1, dayLabel: 'Fri · Apr 17', title: 'Unit 3 · Division Unit Test', duration: '45 min', pages: 'Pages 75-77', objective: 'Students will demonstrate division mastery.', warmup: ['Comprehensive review', 'Calculator strategies'], activities: ['Unit assessment', 'Error analysis'], materials: ['Test sheets', 'Calculators'], homework: 'No homework - test day', status: 'pending', pdf: 'https://www.math-aids.com/Division/Test/Division-Test-Worksheet.pdf' },
    
    // Week 4: Fractions Introduction
    { id: 'math-16', date: '2026-04-22', classId: 1, dayLabel: 'Wed · Apr 22', title: 'Unit 4 · Fraction Concepts', duration: '45 min', pages: 'Pages 78-81', objective: 'Students will understand fractions as parts of a whole.', warmup: ['Fraction of the day', 'Visual fraction review'], activities: ['Fraction strips exploration', 'Number line fractions', 'Real-world fractions'], materials: ['Fraction strips', 'Fraction circles', 'Number lines'], homework: 'Workbook page 82, problems 1-10', status: 'pending', pdf: 'https://www.mathworksheets4kids.com/worksheet/fractions/fractions-introduction-5th-grade' },
    { id: 'math-17', date: '2026-04-23', classId: 1, dayLabel: 'Thu · Apr 23', title: 'Unit 4 · Equivalent Fractions', duration: '45 min', pages: 'Pages 82-85', objective: 'Students will find and generate equivalent fractions.', warmup: ['Equivalent fraction matching', 'Simplification review'], activities: ['Fraction strip modeling', 'Cross-multiplication practice', 'Real-world examples'], materials: ['Fraction tiles', 'Equivalence cards'], homework: 'Workbook page 86, problems 1-12', status: 'pending', pdf: 'https://www.mathworksheetsland.com/fractions/equivalent-fractions/worksheets/' },
    { id: 'math-18', date: '2026-04-24', classId: 1, dayLabel: 'Fri · Apr 24', title: 'Unit 4 · Comparing Fractions', duration: '45 min', pages: 'Pages 86-89', objective: 'Students will compare fractions with unlike denominators.', warmup: ['Fraction comparison', 'Benchmark fractions'], activities: ['Common denominator strategy', 'Visual comparison', 'Number line ordering'], materials: ['Fraction circles', 'Number lines'], homework: 'Workbook page 90, problems 1-8', status: 'pending', pdf: 'https://www.mathworksheetsland.com/fractions/comparing-fractions/worksheets/' },
    
    { id: 'math-20', date: '2026-04-27', classId: 1, dayLabel: 'Mon · Apr 27', title: 'Unit 4 · Fractions Quiz', duration: '45 min', pages: 'Pages 95-97', objective: 'Students will demonstrate fraction concept mastery.', warmup: ['Comprehensive review', 'Strategy selection'], activities: ['Fractions quiz', 'Extension activities'], materials: ['Quiz sheets', 'Fraction manipulatives'], homework: 'No homework - quiz day', status: 'pending', pdf: 'https://www.math-aids.com/Fractions/Test/Fractions-Test-Worksheet.pdf' },
    
    // Week 5: Advanced Fractions & Review
    { id: 'math-21', classId: 1, dayLabel: 'Tue · Apr 28', date: '2026-04-28', title: 'Unit 5 · Mixed Numbers & Improper Fractions', duration: '45 min', pages: 'Pages 98-101', objective: 'Students will convert between mixed numbers and improper fractions.', warmup: ['Fraction review', 'Visual conversion models'], activities: ['Conversion algorithms', 'Real-world examples', 'Partner practice'], materials: ['Fraction circles', 'Number lines', 'Conversion charts'], homework: 'Workbook page 102, problems 1-12', status: 'pending', pdf: 'https://www.math-aids.com/Fractions/Mixed-Number-Improper-Fraction-Worksheet.pdf' },
    { id: 'math-22', classId: 1, dayLabel: 'Wed · Apr 29', date: '2026-04-29', title: 'Unit 5 · Adding Mixed Numbers', duration: '45 min', pages: 'Pages 103-106', objective: 'Students will add mixed numbers with like and unlike denominators.', warmup: ['Mixed number review', 'Denominator practice'], activities: ['Algorithm demonstration', 'Step-by-step practice', 'Word problems'], materials: ['Fraction strips', 'Algorithm charts', 'Whiteboards'], homework: 'Workbook page 107, problems 1-10', status: 'pending', pdf: 'https://www.math-aids.com/Fractions/Addition-Mixed-Numbers-Worksheet.pdf' },
    
  ],
  2: [
    { id: 'read-0', classId: 2, dayLabel: 'Today',    date: 'Tue · Mar 10', title: 'Unit 3 · Main Idea & Details', duration: '45 min', pages: 'Pages 56–63', objective: 'Students will identify main idea and supporting details in nonfiction.', warmup: ['Quick write: what is main idea of a paragraph?'], activities: ['Model with mentor text', 'Guided practice', 'Partner work', 'Share out'], materials: ['Anthology', 'Highlighters'], homework: 'Read pages 64–67 and annotate', status: 'pending' },
    { id: 'read-1', classId: 2, dayLabel: 'Previous', date: 'Mon · Mar 9',  title: 'Unit 3 · Text Structure',      duration: '45 min', pages: 'Pages 50–55', objective: 'Students will identify cause/effect and compare/contrast structures.', warmup: ['Signal word sort'], activities: ['Text structure chart', 'Partner read', 'Exit ticket'], materials: ['Anthology'], homework: 'Finish graphic organizer', status: 'done' },
  ],
  3: [
    { id: 'sci-0', classId: 3, dayLabel: 'Today', date: 'Tue · Mar 10', title: 'Ch. 6 · States of Matter', duration: '50 min', pages: 'Pages 120–128', objective: 'Students will describe properties of solids, liquids, and gases.', warmup: ['Matter sort: everyday objects'], activities: ['Lab demo — ice melting', 'Diagram labeling', 'Discussion', 'Quick write'], materials: ['Ice', 'Beakers', 'Lab sheets'], homework: 'Read pages 129–131', status: 'pending' },
  ],
  4: [
    { id: 'writ-0', classId: 4, dayLabel: 'Today',    date: 'Tue · Mar 10', title: 'Unit 2 · Argumentative Writing', duration: '45 min', pages: 'Pages 34–41', objective: 'Students will write a claim with at least two supporting reasons.', warmup: ['Take a stand: agree or disagree prompt'], activities: ['Model claim writing', 'Outline drafting', 'Peer feedback'], materials: ['Writing journals', 'Mentor texts'], homework: 'Complete outline draft', status: 'pending' },
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

// Demo schools data for registration validation - using actual schools from SQL seed
const DEMO_SCHOOLS = [
  // KIPP Louisiana Schools
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
    subjects: [
      'Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus',
      'English I', 'English II', 'English III', 'English IV',
      'Biology', 'Chemistry', 'Physics', 'Environmental Science',
      'World History', 'US History', 'Government', 'Economics',
      'Spanish I', 'Spanish II', 'French I', 'French II',
      'Physical Education', 'Health', 'Art', 'Music', 'Computer Science'
    ]
  },
  {
    id: 'leadership-academy',
    district_id: 'kipp-la',
    name: 'Leadership Academy',
    address: 'New Orleans, LA',
    primary_color: '#1F4788',
    secondary_color: '#FFFFFF',
    accent_color: '#E31937',
    logo_url: 'https://kippneworleans.org/',
    type: 'elementary_school',
    grade_levels: ['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'],
    subjects: ['Reading', 'Writing', 'Math', 'Science', 'Social Studies', 'Art', 'Music', 'PE']
  },
  {
    id: 'central-city-academy',
    district_id: 'kipp-la',
    name: 'Central City Academy',
    address: 'New Orleans, LA',
    primary_color: '#1F4788',
    secondary_color: '#FFFFFF',
    accent_color: '#E31937',
    logo_url: 'https://kippneworleans.org/',
    type: 'elementary_school',
    grade_levels: ['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'],
    subjects: ['Reading', 'Writing', 'Math', 'Science', 'Social Studies', 'Art', 'Music', 'PE']
  },
  {
    id: 'frederick-douglass-hs',
    district_id: 'kipp-la',
    name: 'Frederick A. Douglass High School',
    address: 'New Orleans, LA',
    primary_color: '#1F4788',
    secondary_color: '#FFFFFF',
    accent_color: '#E31937',
    logo_url: 'https://kippneworleans.org/',
    type: 'high_school',
    grade_levels: ['9th Grade', '10th Grade', '11th Grade', '12th Grade'],
    subjects: [
      'Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus',
      'English I', 'English II', 'English III', 'English IV',
      'Biology', 'Chemistry', 'Physics', 'Environmental Science',
      'World History', 'US History', 'Government', 'Economics',
      'Spanish I', 'Spanish II', 'French I', 'French II',
      'Physical Education', 'Health', 'Art', 'Music', 'Computer Science'
    ]
  },
  // YES Prep New Orleans Schools
  {
    id: 'yes-east-end',
    district_id: 'yes-prep-nola',
    name: 'YES Prep East End',
    address: 'New Orleans, LA',
    primary_color: '#E31937',
    secondary_color: '#1F4788',
    accent_color: '#FFD700',
    logo_url: 'https://www.yesprep.org/',
    type: 'middle_school',
    grade_levels: ['6th Grade', '7th Grade', '8th Grade'],
    subjects: ['Math', 'Science', 'English', 'Social Studies', 'Art', 'Music', 'PE']
  },
  {
    id: 'yes-brays-oaks',
    district_id: 'yes-prep-nola',
    name: 'YES Prep Brays Oaks',
    address: 'New Orleans, LA',
    primary_color: '#E31937',
    secondary_color: '#1F4788',
    accent_color: '#FFD700',
    logo_url: 'https://www.yesprep.org/',
    type: 'middle_school',
    grade_levels: ['6th Grade', '7th Grade', '8th Grade'],
    subjects: ['Math', 'Science', 'English', 'Social Studies', 'Art', 'Music', 'PE']
  },
  {
    id: 'yes-northside',
    district_id: 'yes-prep-nola',
    name: 'YES Prep Northside',
    address: 'New Orleans, LA',
    primary_color: '#E31937',
    secondary_color: '#1F4788',
    accent_color: '#FFD700',
    logo_url: 'https://www.yesprep.org/',
    type: 'middle_school',
    grade_levels: ['6th Grade', '7th Grade', '8th Grade'],
    subjects: ['Math', 'Science', 'English', 'Social Studies', 'Art', 'Music', 'PE']
  },
  // ReNEW Schools
  {
    id: 'renew-moton',
    district_id: 'renew-nola',
    name: 'ReNEW Moton Lakefront',
    address: 'New Orleans, LA',
    primary_color: '#00A651',
    secondary_color: '#FFFFFF',
    accent_color: '#FF6B35',
    logo_url: 'https://www.renewschools.org/',
    type: 'elementary_school',
    grade_levels: ['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'],
    subjects: ['Reading', 'Writing', 'Math', 'Science', 'Social Studies', 'Art', 'Music', 'PE']
  },
  {
    id: 'renew-laurel',
    district_id: 'renew-nola',
    name: 'ReNEW Laurel',
    address: 'New Orleans, LA',
    primary_color: '#00A651',
    secondary_color: '#FFFFFF',
    accent_color: '#FF6B35',
    logo_url: 'https://www.renewschools.org/',
    type: 'elementary_school',
    grade_levels: ['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'],
    subjects: ['Reading', 'Writing', 'Math', 'Science', 'Social Studies', 'Art', 'Music', 'PE']
  },
  {
    id: 'renew-batiste',
    district_id: 'renew-nola',
    name: 'ReNEW Batiste Cultural Arts Academy',
    address: 'New Orleans, LA',
    primary_color: '#00A651',
    secondary_color: '#FFFFFF',
    accent_color: '#FF6B35',
    logo_url: 'https://www.renewschools.org/',
    type: 'elementary_school',
    grade_levels: ['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'],
    subjects: ['Reading', 'Writing', 'Math', 'Science', 'Social Studies', 'Art', 'Music', 'PE']
  },
  // Collegiate Academies Schools
  {
    id: 'sci-academy',
    district_id: 'collegiate-nola',
    name: 'Sci Academy',
    address: 'New Orleans, LA',
    primary_color: '#003366',
    secondary_color: '#FFFFFF',
    accent_color: '#FFB81C',
    logo_url: 'https://www.collegiateacademies.org/',
    type: 'high_school',
    grade_levels: ['9th Grade', '10th Grade', '11th Grade', '12th Grade'],
    subjects: [
      'Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus',
      'English I', 'English II', 'English III', 'English IV',
      'Biology', 'Chemistry', 'Physics', 'Environmental Science',
      'World History', 'US History', 'Government', 'Economics',
      'Spanish I', 'Spanish II', 'French I', 'French II',
      'Physical Education', 'Health', 'Art', 'Music', 'Computer Science'
    ]
  },
  {
    id: 'gw-carver-collegiate',
    district_id: 'collegiate-nola',
    name: 'George Washington Carver Collegiate Academy',
    address: 'New Orleans, LA',
    primary_color: '#003366',
    secondary_color: '#FFFFFF',
    accent_color: '#FFB81C',
    logo_url: 'https://www.collegiateacademies.org/',
    type: 'high_school',
    grade_levels: ['9th Grade', '10th Grade', '11th Grade', '12th Grade'],
    subjects: [
      'Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus',
      'English I', 'English II', 'English III', 'English IV',
      'Biology', 'Chemistry', 'Physics', 'Environmental Science',
      'World History', 'US History', 'Government', 'Economics',
      'Spanish I', 'Spanish II', 'French I', 'French II',
      'Physical Education', 'Health', 'Art', 'Music', 'Computer Science'
    ]
  },
  {
    id: 'gw-carver-prep',
    district_id: 'collegiate-nola',
    name: 'George Washington Carver Preparatory Academy',
    address: 'New Orleans, LA',
    primary_color: '#003366',
    secondary_color: '#FFFFFF',
    accent_color: '#FFB81C',
    logo_url: 'https://www.collegiateacademies.org/',
    type: 'middle_school',
    grade_levels: ['6th Grade', '7th Grade', '8th Grade'],
    subjects: ['Math', 'Science', 'English', 'Social Studies', 'Art', 'Music', 'PE']
  },
  {
    id: 'rosenwald-collegiate',
    district_id: 'collegiate-nola',
    name: 'Rosenwald Collegiate Academy',
    address: 'New Orleans, LA',
    primary_color: '#003366',
    secondary_color: '#FFFFFF',
    accent_color: '#FFB81C',
    logo_url: 'https://www.collegiateacademies.org/',
    type: 'high_school',
    grade_levels: ['9th Grade', '10th Grade', '11th Grade', '12th Grade'],
    subjects: [
      'Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus',
      'English I', 'English II', 'English III', 'English IV',
      'Biology', 'Chemistry', 'Physics', 'Environmental Science',
      'World History', 'US History', 'Government', 'Economics',
      'Spanish I', 'Spanish II', 'French I', 'French II',
      'Physical Education', 'Health', 'Art', 'Music', 'Computer Science'
    ]
  },
  {
    id: 'walter-cohen',
    district_id: 'collegiate-nola',
    name: 'Walter L. Cohen College Prep',
    address: 'New Orleans, LA',
    primary_color: '#003366',
    secondary_color: '#FFFFFF',
    accent_color: '#FFB81C',
    logo_url: 'https://www.collegiateacademies.org/',
    type: 'high_school',
    grade_levels: ['9th Grade', '10th Grade', '11th Grade', '12th Grade'],
    subjects: [
      'Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus',
      'English I', 'English II', 'English III', 'English IV',
      'Biology', 'Chemistry', 'Physics', 'Environmental Science',
      'World History', 'US History', 'Government', 'Economics',
      'Spanish I', 'Spanish II', 'French I', 'French II',
      'Physical Education', 'Health', 'Art', 'Music', 'Computer Science'
    ]
  },
  // New Orleans College Prep
  {
    id: 'hoffman-preschool',
    district_id: 'nocp-nola',
    name: 'Hoffman Early Learning Center',
    address: 'New Orleans, LA',
    primary_color: '#4A90E2',
    secondary_color: '#FFFFFF',
    accent_color: '#F5A623',
    logo_url: 'https://www.nolacollegeprep.org/',
    type: 'preschool',
    grade_levels: ['Pre-K'],
    subjects: ['Reading', 'Writing', 'Math', 'Science', 'Social Studies', 'Art', 'Music', 'PE']
  },
  // Archdiocese of New Orleans Schools
  {
    id: 'st-augustine-hs',
    district_id: 'archdiocese-nola',
    name: 'St. Augustine High School',
    address: 'New Orleans, LA',
    primary_color: '#4B0082',
    secondary_color: '#FFFFFF',
    accent_color: '#D4AF37',
    logo_url: 'https://nolacatholic.org/',
    type: 'high_school',
    grade_levels: ['9th Grade', '10th Grade', '11th Grade', '12th Grade'],
    subjects: [
      'Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus',
      'English I', 'English II', 'English III', 'English IV',
      'Biology', 'Chemistry', 'Physics', 'Environmental Science',
      'World History', 'US History', 'Government', 'Economics',
      'Spanish I', 'Spanish II', 'French I', 'French II',
      'Physical Education', 'Health', 'Art', 'Music', 'Computer Science'
    ]
  },
  {
    id: 'st-marys-academy',
    district_id: 'archdiocese-nola',
    name: 'St. Mary\'s Academy',
    address: 'New Orleans, LA',
    primary_color: '#003D7A',
    secondary_color: '#FFFFFF',
    accent_color: '#FFD700',
    logo_url: 'https://nolacatholic.org/',
    type: 'high_school',
    grade_levels: ['9th Grade', '10th Grade', '11th Grade', '12th Grade'],
    subjects: [
      'Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus',
      'English I', 'English II', 'English III', 'English IV',
      'Biology', 'Chemistry', 'Physics', 'Environmental Science',
      'World History', 'US History', 'Government', 'Economics',
      'Spanish I', 'Spanish II', 'French I', 'French II',
      'Physical Education', 'Health', 'Art', 'Music', 'Computer Science'
    ]
  },
  {
    id: 'st-marys-dominican',
    district_id: 'archdiocese-nola',
    name: 'St. Mary\'s Dominican High School',
    address: 'New Orleans, LA',
    primary_color: '#8B4513',
    secondary_color: '#FFFFFF',
    accent_color: '#DAA520',
    logo_url: 'https://nolacatholic.org/',
    type: 'high_school',
    grade_levels: ['9th Grade', '10th Grade', '11th Grade', '12th Grade'],
    subjects: [
      'Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus',
      'English I', 'English II', 'English III', 'English IV',
      'Biology', 'Chemistry', 'Physics', 'Environmental Science',
      'World History', 'US History', 'Government', 'Economics',
      'Spanish I', 'Spanish II', 'French I', 'French II',
      'Physical Education', 'Health', 'Art', 'Music', 'Computer Science'
    ]
  },
  {
    id: 'st-katharine-drexel',
    district_id: 'archdiocese-nola',
    name: 'St. Katharine Drexel Preparatory School',
    address: 'New Orleans, LA',
    primary_color: '#800080',
    secondary_color: '#FFFFFF',
    accent_color: '#FFD700',
    logo_url: 'https://nolacatholic.org/',
    type: 'high_school',
    grade_levels: ['9th Grade', '10th Grade', '11th Grade', '12th Grade'],
    subjects: [
      'Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus',
      'English I', 'English II', 'English III', 'English IV',
      'Biology', 'Chemistry', 'Physics', 'Environmental Science',
      'World History', 'US History', 'Government', 'Economics',
      'Spanish I', 'Spanish II', 'French I', 'French II',
      'Physical Education', 'Health', 'Art', 'Music', 'Computer Science'
    ]
  },
  // Houston ISD Schools
  {
    id: 'BELLAIRE-HS',
    district_id: 'houston-isd',
    name: 'Bellaire High School',
    address: 'Houston, TX',
    primary_color: '#C1272D',
    secondary_color: '#FFFFFF',
    accent_color: '#FFD700',
    logo_url: 'https://www.houstonisd.org/',
    type: 'high_school',
    grade_levels: ['9th Grade', '10th Grade', '11th Grade', '12th Grade'],
    subjects: [
      'Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus',
      'English I', 'English II', 'English III', 'English IV',
      'Biology', 'Chemistry', 'Physics', 'Environmental Science',
      'World History', 'US History', 'Government', 'Economics',
      'Spanish I', 'Spanish II', 'French I', 'French II',
      'Physical Education', 'Health', 'Art', 'Music', 'Computer Science'
    ]
  },
  {
    id: 'lincoln-elementary',
    district_id: 'houston-isd',
    name: 'Lincoln Elementary School',
    address: 'Houston, TX',
    primary_color: '#C1272D',
    secondary_color: '#FFFFFF',
    accent_color: '#FFD700',
    logo_url: 'https://www.houstonisd.org/',
    type: 'elementary_school',
    grade_levels: ['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'],
    subjects: ['Reading', 'Writing', 'Math', 'Science', 'Social Studies', 'Art', 'Music', 'PE']
  },
  {
    id: 'lamar-hs',
    district_id: 'houston-isd',
    name: 'Lamar High School',
    address: 'Houston, TX',
    primary_color: '#C1272D',
    secondary_color: '#FFFFFF',
    accent_color: '#FFD700',
    logo_url: 'https://www.houstonisd.org/',
    type: 'high_school',
    grade_levels: ['9th Grade', '10th Grade', '11th Grade', '12th Grade'],
    subjects: [
      'Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus',
      'English I', 'English II', 'English III', 'English IV',
      'Biology', 'Chemistry', 'Physics', 'Environmental Science',
      'World History', 'US History', 'Government', 'Economics',
      'Spanish I', 'Spanish II', 'French I', 'French II',
      'Physical Education', 'Health', 'Art', 'Music', 'Computer Science'
    ]
  },
  // KIPP Texas Schools
  {
    id: 'kipp-fifth-ward',
    district_id: 'kipp-texas',
    name: 'KIPP Fifth Ward Elementary',
    address: 'Houston, TX',
    primary_color: '#1F4788',
    secondary_color: '#FFFFFF',
    accent_color: '#E31937',
    logo_url: 'https://www.kipp.org/',
    type: 'elementary_school',
    grade_levels: ['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'],
    subjects: ['Reading', 'Writing', 'Math', 'Science', 'Social Studies', 'Art', 'Music', 'PE']
  },
  {
    id: 'kipp-southside',
    district_id: 'kipp-texas',
    name: 'KIPP Southside Secondary',
    address: 'Houston, TX',
    primary_color: '#1F4788',
    secondary_color: '#FFFFFF',
    accent_color: '#E31937',
    logo_url: 'https://www.kipp.org/',
    type: 'middle_school',
    grade_levels: ['6th Grade', '7th Grade', '8th Grade'],
    subjects: ['Math', 'Science', 'English', 'Social Studies', 'Art', 'Music', 'PE']
  },
  {
    id: 'kipp-houston-ls',
    district_id: 'kipp-texas',
    name: 'KIPP Houston Leadership School',
    address: 'Houston, TX',
    primary_color: '#1F4788',
    secondary_color: '#FFFFFF',
    accent_color: '#E31937',
    logo_url: 'https://www.kipp.org/',
    type: 'high_school',
    grade_levels: ['9th Grade', '10th Grade', '11th Grade', '12th Grade'],
    subjects: [
      'Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus',
      'English I', 'English II', 'English III', 'English IV',
      'Biology', 'Chemistry', 'Physics', 'Environmental Science',
      'World History', 'US History', 'Government', 'Economics',
      'Spanish I', 'Spanish II', 'French I', 'French II',
      'Physical Education', 'Health', 'Art', 'Music', 'Computer Science'
    ]
  },
  {
    id: 'kipp-houston-secondary',
    district_id: 'kipp-texas',
    name: 'KIPP Houston Secondary',
    address: 'Houston, TX',
    primary_color: '#1F4788',
    secondary_color: '#FFFFFF',
    accent_color: '#E31937',
    logo_url: 'https://www.kipp.org/',
    type: 'high_school',
    grade_levels: ['9th Grade', '10th Grade', '11th Grade', '12th Grade'],
    subjects: [
      'Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus',
      'English I', 'English II', 'English III', 'English IV',
      'Biology', 'Chemistry', 'Physics', 'Environmental Science',
      'World History', 'US History', 'Government', 'Economics',
      'Spanish I', 'Spanish II', 'French I', 'French II',
      'Physical Education', 'Health', 'Art', 'Music', 'Computer Science'
    ]
  },
  {
    id: 'kipp-northbrook',
    district_id: 'kipp-texas',
    name: 'KIPP Northbrook Elementary',
    address: 'Houston, TX',
    primary_color: '#1F4788',
    secondary_color: '#FFFFFF',
    accent_color: '#E31937',
    logo_url: 'https://www.kipp.org/',
    type: 'elementary_school',
    grade_levels: ['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'],
    subjects: ['Reading', 'Writing', 'Math', 'Science', 'Social Studies', 'Art', 'Music', 'PE']
  },
  // YES Prep Texas Schools
  {
    id: 'yes-north-forest',
    district_id: 'yes-prep-tx',
    name: 'YES Prep North Forest',
    address: 'Houston, TX',
    primary_color: '#E31937',
    secondary_color: '#1F4788',
    accent_color: '#FFD700',
    logo_url: 'https://www.yesprep.org/',
    type: 'middle_school',
    grade_levels: ['6th Grade', '7th Grade', '8th Grade'],
    subjects: ['Math', 'Science', 'English', 'Social Studies', 'Art', 'Music', 'PE']
  },
  // Knights Academy (Friends Access)
  {
    id: '05KNIGHTS',
    district_id: 'knights-district',
    name: 'Knights Academy',
    address: 'Online',
    primary_color: '#6B46C1',
    secondary_color: '#FFFFFF',
    accent_color: '#F59E0B',
    logo_url: 'https://gradeflow.app/',
    type: 'k12',
    grade_levels: [
      'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade',
      '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'
    ],
    subjects: [
      'Reading', 'Writing', 'Math', 'Science', 'Social Studies', 'Art', 'Music', 'PE',
      'English Language Arts', 'Pre-Algebra', 'Algebra I', 'Life Science', 'Earth Science', 'World History',
      'Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus',
      'English I', 'English II', 'English III', 'English IV',
      'Biology', 'Chemistry', 'Physics', 'Environmental Science',
      'World History', 'US History', 'Government', 'Economics',
      'Spanish I', 'Spanish II', 'French I', 'French II',
      'Physical Education', 'Health', 'Art', 'Music', 'Computer Science',
      'Special Education'
    ]
  }
]

// ─── Spanish Demo Data (used when language is set to 'es') ─────────────────────
const DEMO_CLASSES_ES = [
  { id: 1, period: '1ero', subject: 'Matemáticas', students: 24, gpa: 87.4, trend: 'up',     color: '#3b7ef4', needsAttention: 3 },
  { id: 2, period: '2do',  subject: 'Lectura',    students: 22, gpa: 91.2, trend: 'up',     color: '#22c97a', needsAttention: 1 },
  { id: 3, period: '3ero', subject: 'Ciencias',   students: 26, gpa: 63.8, trend: 'down',   color: '#f04a4a', needsAttention: 8 },
  { id: 4, period: '4to',  subject: 'Escritura',  students: 20, gpa: 84.0, trend: 'stable', color: '#f54a7a', needsAttention: 0 },
]

const DEMO_STUDENTS_ES = [
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

const DEMO_ASSIGNMENTS_ES = [
  { id: 1, classId: 1, name: 'Cap.3 Examen',     type: 'quiz',         categoryId: 2, date: '2024-10-14', dueDate: '2024-10-14', hasKey: true,  options: {} },
  { id: 2, classId: 1, name: 'Cap.3 Tarea',     type: 'homework',     categoryId: 3, date: '2024-10-12', dueDate: '2024-10-12', hasKey: true,  options: {} },
  { id: 3, classId: 1, name: 'Examen Unidad 1', type: 'test',         categoryId: 1, date: '2024-10-10', dueDate: '2024-10-10', hasKey: false, options: {} },
  { id: 4, classId: 1, name: 'Participación',    type: 'participation', categoryId: 4, date: '2024-10-01', dueDate: '2024-10-31', hasKey: false, options: { max_points: 10 } },
]

const DEMO_MESSAGES_ES = [
  { id: 1, studentName: 'Marcus Thompson', subject: 'Matemáticas', trigger: 'Falló 58%',      status: 'pending', tone: 'Warm & Friendly', draft: 'Estimado Padre, Marcus recibió 58% en su evaluación de Matemáticas. Me encantaría conectar esta semana para discutir opciones de apoyo.', positiveDraft: '¡Hola! Solo quería compartir que Marcus está mostrando un esfuerzo real en clase. Sigamos construyendo ese momento.', dayOld: false },
  { id: 2, studentName: 'Aaliyah Brooks',  subject: 'Lectura',    trigger: 'Mejoró +12pts', status: 'sent',    tone: 'Celebrating',     draft: '¡Buenas noticias! Aaliyah mejoró su puntaje de Lectura en 12 puntos. Está trabajando muy duro.', positiveDraft: 'Aaliyah está haciendo un trabajo increíble. Su dedicación realmente está dando resultados.', dayOld: false },
  { id: 3, studentName: 'Liam Martinez',   subject: 'Ciencias',   trigger: 'Falló 61%',      status: 'pending', tone: 'Warm & Friendly', draft: 'Estimado Padre, quería contactarlo regarding la evaluación reciente de Ciencias de Liam.', positiveDraft: 'Liam está mostrando curiosidad en la clase de Ciencias. Aquí hay algunas formas de apoyar en casa.', dayOld: true  },
]

const DEMO_LESSONS_ES = {
  1: [
    { id: 'math-0', classId: 1, dayLabel: 'Hoy',    date: 'Mar · 10', title: 'Cap. 4 · Fracciones y Decimales', duration: '45 min', pages: 'Páginas 84–91', objective: 'Los estudiantes compararán fracciones y decimales y convertirán entre formas.', warmup: ['Decimal del día', 'Comparación rápida: 0.4 vs 3/8'], activities: ['Mini-lección sobre conversión fracción/decimal', 'Ordenamiento por estaciones de parejas', 'Problemas de práctica guiada 1–8', 'Boleto de salida'], materials: ['Libro de trabajo', 'Pizarra', 'Tiras de fracciones'], homework: 'Libro de trabajo página 91, problemas 9–14', status: 'pending' },
    { id: 'math-1', date: '2026-04-01', classId: 1, dayLabel: 'Anterior', date: 'Mar · 9',  title: 'Cap. 4 · Fracciones Equivalentes', duration: '45 min', pages: 'Páginas 80–83', objective: 'Los estudiantes identificarán y generarán fracciones equivalentes.', warmup: ['Revisión de modelos visuales de fracciones'], activities: ['Modelado del maestro', 'Práctica en grupos pequeños', 'Verificación independiente'], materials: ['Libro de trabajo', 'Fichas de fracciones'], homework: 'Hoja de práctica A', status: 'done' },
    { id: 'math-2', date: '2026-04-02', classId: 1, dayLabel: 'Siguiente', date: 'Mar · 11', title: 'Cap. 4 · Ordenar Fracciones',   duration: '45 min', pages: 'Páginas 92–96', objective: 'Los estudiantes ordenarán fracciones, decimales y porcentajes.', warmup: ['Desafío de línea numérica'], activities: ['Problema de calendario', 'Ejemplos guiados', 'Rotación de estaciones'], materials: ['Libro de trabajo', 'Líneas numéricas'], homework: 'Libro de trabajo página 96', status: 'pending' },
  ],
  2: [
    { id: 'read-0', classId: 2, dayLabel: 'Hoy',    date: 'Mar · 10', title: 'Unidad 3 · Idea Principal y Detalles', duration: '45 min', pages: 'Páginas 56–63', objective: 'Los estudiantes identificarán la idea principal y los detalles de apoyo en no ficción.', warmup: ['Escritura rápida: ¿cuál es la idea principal de un párrafo?'], activities: ['Modelar con texto mentor', 'Práctica guiada', 'Trabajo de parejas', 'Compartir'], materials: ['Antología', 'Resaltadores'], homework: 'Leer páginas 64–67 y anotar', status: 'pending' },
    { id: 'read-1', classId: 2, dayLabel: 'Anterior', date: 'Mar · 9',  title: 'Unidad 3 · Estructura del Texto',      duration: '45 min', pages: 'Páginas 50–55', objective: 'Los estudiantes identificarán estructuras causa/efecto y comparar/contrastar.', warmup: ['Ordenamiento de palabras de señal'], activities: ['Cuadro de estructura de texto', 'Lectura de parejas', 'Boleto de salida'], materials: ['Antología'], homework: 'Terminar organizador gráfico', status: 'done' },
  ],
  3: [
    { id: 'sci-0', classId: 3, dayLabel: 'Hoy', date: 'Mar · 10', title: 'Cap. 6 · Estados de la Materia', duration: '50 min', pages: 'Páginas 120–128', objective: 'Los estudiantes describirán las propiedades de sólidos, líquidos y gases.', warmup: ['Clasificación de materia: objetos cotidianos'], activities: ['Demostración de laboratorio — hielo deritiéndose', 'Etiquetado de diagrama', 'Discusión', 'Escritura rápida'], materials: ['Hielo', 'Vasos de precipitados', 'Hojas de laboratorio'], homework: 'Leer páginas 129–131', status: 'pending' },
  ],
  4: [
    { id: 'writ-0', classId: 4, dayLabel: 'Hoy', date: 'Mar · 10', title: 'Unidad 2 · Escritura Argumentativa', duration: '45 min', pages: 'Páginas 34–41', objective: 'Los estudiantes escribirán una afirmación con al menos dos razones de apoyo.', warmup: ['Tomar posición: prompt de acuerdo o desacuerdo'], activities: ['Modelar escritura de afirmación', 'Borrador de esquema', 'Retroalimentación de pares'], materials: ['Diarios de escritura', 'Textos mentores'], homework: 'Completar borrador de esquema', status: 'pending' },
  ],
}

const DEMO_FEED_ES = [
  { id: 1, classId: 1, author: 'Sra. Johnson', content: '📅 Examen de Unidad el viernes! Repasar capítulos 3-4. Guía de estudio publicada abajo.', time: 'hace 2 horas', reactions: { '👍': 12, '❤': 5, '😂': 2 }, confused: 3, questions: 1, approved: true },
  { id: 2, classId: 1, author: 'Sra. Johnson', content: '🎉 ¡Gran trabajo en la tarea de ayer! El promedio de la clase fue 87%.',       time: 'Ayer',  reactions: { '👍': 18, '❤': 9, '😂': 4 }, confused: 0, questions: 0, approved: true },
]

const DEMO_REMINDERS_ES = [
  { id: 1, text: 'Calificar Exámenes Cap.3',   due: 'Hoy',    done: false, priority: 'high'   },
  { id: 2, text: 'Llamada a padre — Marcus T.', due: 'Hoy',    done: false, priority: 'high'   },
  { id: 3, text: 'Actualizar plan de lección Mie',  due: 'Mañana', done: false, priority: 'medium' },
  { id: 4, text: 'Enviar asistencia',       due: 'Vie',      done: true,  priority: 'low'    },
]

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Tests',         weight: 40, color: '#f04a4a', icon: '📝' },
  { id: 2, name: 'Quizzes',       weight: 30, color: '#f5a623', icon: '✏' },
  { id: 3, name: 'Homework',      weight: 20, color: '#3b7ef4', icon: '📚' },
  { id: 4, name: 'Participation', weight: 10, color: '#22c97a', icon: '🙋' },
]

const CURRICULUM_SOURCES = [
  // HISD Curriculum
  { id: 'hisd-zearn',           name: 'HISD Zearn Math',            publisher: 'HISD/Zearn',           subjects: ['Math'], logo: '🔢', searchable: true  },
  { id: 'hisd-literacy',        name: 'HISD Literacy Project',      publisher: 'HISD',                  subjects: ['Reading', 'ELA'], logo: '📚', searchable: true  },
  { id: 'hisd-science',         name: 'HISD Science',               publisher: 'HISD',                  subjects: ['Science'], logo: '🔬', searchable: true  },
  
  // KIPP Curriculum  
  { id: 'illustrative-math',    name: 'Illustrative Math',           publisher: 'Illustrative Math',      subjects: ['Math'], logo: '📐', searchable: true  },
  { id: 'ckla',                name: 'CKLA Reading',               publisher: 'Amplify',              subjects: ['Reading', 'ELA'], logo: '📖', searchable: true  },
  { id: 'fishtank-ela',        name: 'Fishtank ELA',              publisher: 'Fishtank Learning',    subjects: ['Reading', 'ELA'], logo: '🐟', searchable: true  },
  { id: 'novel-ela',           name: 'Novel ELA',                 publisher: 'Novel Partners',        subjects: ['Reading', 'ELA'], logo: '📕', searchable: true  },
  { id: 'amplify-science',     name: 'Amplify Science',            publisher: 'Amplify',              subjects: ['Science'], logo: '🧪', searchable: true  },
  { id: 'democratic-knowledge',  name: 'Democratic Knowledge Project', publisher: 'DKP',                  subjects: ['Social Studies'], logo: '🏛️', searchable: true  },
  { id: 'investigating-history', name: 'Investigating History',      publisher: 'MA DOE',               subjects: ['Social Studies'], logo: '🔍', searchable: true  },
  
  // Common National Curriculum (existing)
  { id: 'gomath',              name: 'Go Math',                    publisher: 'Houghton Mifflin',     subjects: ['Math'], logo: '📐', searchable: true  },
  { id: 'readingwonders',      name: 'Reading Wonders',            publisher: 'McGraw-Hill',          subjects: ['Reading', 'ELA'], logo: '📖', searchable: true  },
  { id: 'studysync',           name: 'StudySync',                  publisher: 'McGraw-Hill',          subjects: ['Writing', 'ELA'], logo: '✍', searchable: true  },
  { id: 'eureka',              name: 'Eureka Math',                publisher: 'Great Minds',          subjects: ['Math'], logo: '∑',  searchable: true  },
  { id: 'ckscience',           name: 'CK-12 Science',              publisher: 'CK-12',                subjects: ['Science'], logo: '⚗', searchable: true  },
  { id: 'commonlit',           name: 'CommonLit',                  publisher: 'CommonLit',            subjects: ['Reading', 'ELA'], logo: '📜', searchable: true  },
  { id: 'custom',              name: 'Custom / No textbook',       publisher: '',                      subjects: [], logo: '🏗', searchable: false },
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
  page: 'home', // Current page from hash router
  schools: [], // Array of schools with branding data

  setCurrentUser: (user) => set({
    currentUser: user,
    lang: user?.lang || 'en',
  }),

  // OAuth authentication handler
  setAuth: (user) => {
    set({
      currentUser: user,
      lang: user?.lang || 'en',
    });
    
    // Store session persistence in localStorage for OAuth users
    if (user?.isOAuthUser) {
      localStorage.setItem('gradeflow_oauth_user', JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        provider: user.provider,
        avatar_url: user.avatar_url,
        school_id: user.school_id,
        isOAuthUser: true
      }));
    }
  },

  setLang: (lang) => {
    localStorage.setItem('gradeflow_lang', lang)
    set(state => ({
      lang,
      currentUser: state.currentUser
        ? { ...state.currentUser, lang }
        : state.currentUser,
    }))
    // Reload demo data in new language
    get().loadFromDB()
  },

  /**
   * Set the current page and update browser hash
   * Call this from components instead of manually setState
   */
  setPage: (page) => {
    const { currentUser } = get();
    
    // Update state
    set({ page });
    
    // Only update hash if user is authenticated
    if (currentUser) {
      const role = currentUser?.role || null;
      const hash = pageToHash(page, role);
      if (window.location.hash !== hash) {
        window.history.pushState({ page, role }, '', hash);
      }
    }
  },

  /**
   * Reset to home page (used on logout, demo reset, etc.)
   */
  resetToHome: () => {
    set({ page: 'home' });
    window.history.replaceState({}, '#/');
  },

  /**
   * Go back in history (alternative to browser back button)
   */
  goBack: () => {
    window.history.back();
  },

  // ── Teacher profile ─────────────────────────────────────────────────────────
  teacher: {
    id: 1,
    name: 'Ms. Rodriguez',
    school: 'Houston ISD',
    schoolColor: '#003057',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MsRodriguez',
  },
  subjects: ['Math', 'Science'],
  teacherProfile: null, // Will be set during onboarding

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

  fetchStudentsFromSupabase: async () => {
    try {
      const { currentUser } = get()
      if (!currentUser || currentUser?.email?.includes('@demo') || currentUser?.id?.startsWith('demo-')) {
        return // Skip for demo accounts
      }

      // Load students assigned to Ms. Rod (teacher_id = 1)
      const { data: studentsData, error } = await supabase
        .from('students')
        .select('*')
        .eq('teacher_id', 1) // Ms. Rod's teacher ID

      if (error) {
        console.error('Error fetching students:', error)
        return
      }

      if (studentsData && studentsData.length > 0) {
        // Transform students data to match the expected format
        const transformedStudents = studentsData.map(student => ({
          id: student.id,
          classId: student.class_id,
          name: student.name,
          email: student.email,
          grade: student.grade || 0,
          letter: student.grade >= 90 ? 'A' : student.grade >= 80 ? 'B' : student.grade >= 70 ? 'C' : student.grade >= 60 ? 'D' : 'F',
          submitted: student.submitted || false,
          submitUngraded: student.submit_ungraded || false,
          flagged: student.flagged || false,
          accommodations: student.accommodations || null
        }))
        
        set({ students: transformedStudents })
        console.log(`Loaded ${studentsData.length} students for Ms. Rodriguez from Supabase`)
      }
    } catch (error) {
      console.error('Error in fetchStudentsFromSupabase:', error)
    }
  },

  fetchGradesFromSupabase: async () => {
    try {
      const { currentUser } = get()
      if (!currentUser || currentUser?.email?.includes('@demo') || currentUser?.id?.startsWith('demo-')) {
        return // Skip for demo accounts
      }

      // Load ALL grades from Supabase (not just per teacher)
      const { data: gradesData, error } = await supabase
        .from('grades')
        .select('*')

      if (error) {
        console.error('Error fetching grades:', error)
        return
      }

      if (gradesData && gradesData.length > 0) {
        // Transform grades data to match the expected format
        const transformedGrades = gradesData.map(grade => ({
          studentId: grade.student_id,
          assignmentId: grade.assignment_id,
          score: grade.score
        }))
        
        set({ grades: transformedGrades })
        console.log(`Loaded ${gradesData.length} grades from Supabase`)
      }
    } catch (error) {
      console.error('Error in fetchGradesFromSupabase:', error)
    }
  },
  
  fetchClassesFromSupabase: async () => {
    try {
      const { currentUser } = get()
      if (!currentUser || currentUser?.email?.includes('@demo') || currentUser?.id?.startsWith('demo-')) {
        return // Skip for demo accounts
      }

      // Load ALL classes from Supabase
      const { data: classesData, error } = await supabase
        .from('classes')
        .select('*')

      if (error) {
        console.error('Error fetching classes:', error)
        return
      }

      if (classesData && classesData.length > 0) {
        // Transform classes data to match the expected format
        const transformedClasses = classesData.map(cls => ({
          id: cls.id,
          period: cls.period || '1st',
          subject: cls.subject || 'Math',
          students: cls.students || 20,
          gpa: cls.gpa || 85.0,
          trend: cls.trend || 'stable',
          color: cls.color || '#3b7ef4',
          needsAttention: cls.needs_attention || 0
        }))
        
        set({ classes: transformedClasses })
        console.log(`Loaded ${classesData.length} classes from Supabase`)
      }
    } catch (error) {
      console.error('Error in fetchClassesFromSupabase:', error)
    }
  },

  fetchAssignmentsFromSupabase: async () => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
      
      if (error) throw error
      
      set(state => ({
        ...state,
        assignments: data || [],
      }))
    } catch (error) {
      console.error('Error in fetchAssignmentsFromSupabase:', error)
    }
  },

  fetchLessonsFromSupabase: async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
      
      if (error) throw error
      
      set(state => ({
        ...state,
        lessons: data || [],
      }))
    } catch (error) {
      console.error('Error in fetchLessonsFromSupabase:', error)
    }
  },

  countStudents: async () => {
    try {
      console.log('Counting students in Supabase...')
      
      // Get total count of students
      const { count, error } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.error('Error counting students:', error)
        return null
      }

      console.log(`Total students in database: ${count || 0}`)
      return count || 0

    } catch (error) {
      console.error('Error counting students:', error)
      return null
    }
  },

  checkStudentGrades: async () => {
    try {
      console.log('Checking students with grades in Supabase...\n')

      // 1. Get total students count
      const { data: allStudents, error: studentsError } = await supabase
        .from('students')
        .select('id, name, email, class_id, grade')
      
      if (studentsError) {
        console.error('Error fetching students:', studentsError)
        return null
      }

      console.log(`Total students in database: ${allStudents?.length || 0}`)

      // 2. Get all grades
      const { data: allGrades, error: gradesError } = await supabase
        .from('grades')
        .select('student_id, assignment_id, score')
      
      if (gradesError) {
        console.error('Error fetching grades:', gradesError)
        return null
      }

      console.log(`Total grade records in database: ${allGrades?.length || 0}`)

      // 3. Find unique students who have grades
      const studentsWithGrades = new Set()
      const gradesByStudent = {}
      
      allGrades?.forEach(grade => {
        studentsWithGrades.add(grade.student_id)
        if (!gradesByStudent[grade.student_id]) {
          gradesByStudent[grade.student_id] = []
        }
        gradesByStudent[grade.student_id].push(grade.score)
      })

      console.log(`Students with at least one grade: ${studentsWithGrades.size}`)

      // 4. Find students without grades
      const studentsWithoutGrades = allStudents?.filter(
        student => !studentsWithGrades.has(student.id)
      ) || []

      console.log(`Students without any grades: ${studentsWithoutGrades.length}`)

      // 5. Calculate average grades for students with grades
      let overallAverage = 0
      if (Object.keys(gradesByStudent).length > 0) {
        const averages = Object.values(gradesByStudent).map(grades => {
          const sum = grades.reduce((a, b) => a + b, 0)
          return sum / grades.length
        })
        
        overallAverage = averages.reduce((a, b) => a + b, 0) / averages.length
        console.log(`Average grade for students with grades: ${overallAverage.toFixed(1)}%`)
      }

      // 6. Show breakdown by class
      const classBreakdown = {}
      if (allStudents && allStudents.length > 0) {
        console.log('\n--- Breakdown by Class ---')
        
        const classGroups = {}
        allStudents.forEach(student => {
          const classId = student.class_id || 'unassigned'
          if (!classGroups[classId]) {
            classGroups[classId] = { total: 0, withGrades: 0, students: [] }
          }
          classGroups[classId].total++
          classGroups[classId].students.push(student)
          
          if (studentsWithGrades.has(student.id)) {
            classGroups[classId].withGrades++
          }
        })

        Object.entries(classGroups).forEach(([classId, data]) => {
          const percentage = data.total > 0 ? Math.round((data.withGrades / data.total) * 100) : 0
          console.log(`Class ${classId}: ${data.withGrades}/${data.total} students have grades (${percentage}%)`)
          classBreakdown[classId] = {
            total: data.total,
            withGrades: data.withGrades,
            percentage
          }
        })
      }

      // 7. Summary
      console.log('\n--- Summary ---')
      const totalStudents = allStudents?.length || 0
      const withGrades = studentsWithGrades.size
      const withoutGrades = studentsWithoutGrades.length
      const coveragePercentage = totalStudents > 0 ? Math.round((withGrades / totalStudents) * 100) : 0

      console.log(`Grade Coverage: ${withGrades}/${totalStudents} students (${coveragePercentage}%)`)
      console.log(`Missing Grades: ${withoutGrades} students`)
      
      // Return the report data
      return {
        timestamp: new Date().toISOString(),
        totalStudents,
        studentsWithGrades: withGrades,
        studentsWithoutGrades: withoutGrades,
        coveragePercentage,
        overallAverage,
        classBreakdown,
        studentsWithoutGradesList: studentsWithoutGrades.slice(0, 10),
        totalGradeRecords: allGrades?.length || 0
      }

    } catch (error) {
      console.error('Error checking student grades:', error)
      return null
    }
  },

  loadFromDB: async () => {
    try {

    // Add timeout to prevent hanging on mobile
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database connection timeout')), 3000)
    })

    // Load schools data from Supabase with error handling
    let schoolsData = null
    let schoolsError = null
    
    try {
      const schoolsPromise = supabase
        .from('schools')
        .select('*')

      const result = await Promise.race([schoolsPromise, timeoutPromise])
      schoolsData = result.data
      schoolsError = result.error
      
      if (schoolsError) {
        console.error('Error loading schools:', schoolsError);
      }
    } catch (err) {
      // Handle case where schools table doesn't exist yet
      console.warn('Schools table not available, using fallback:', err.message);
      schoolsError = err
    }

    const currentUser = get().currentUser
    const isDemoAccount = currentUser?.email?.includes('@demo') || 
                           currentUser?.id?.startsWith('demo-')

    // Only load demo data for actual demo accounts
    if (isDemoAccount) {
      // Demo mode - load demo data based on current language
      const lang = get().lang
      const data = lang === 'es' 
        ? {
            classes:     DEMO_CLASSES_ES,
            students:    DEMO_STUDENTS_ES,
            assignments: DEMO_ASSIGNMENTS_ES,
            grades:      DEMO_GRADES, // Same for both
            messages:    DEMO_MESSAGES_ES,
            feed:        DEMO_FEED_ES,
            lessons:     DEMO_LESSONS_ES,
            reminders:   DEMO_REMINDERS_ES,
            schools:     schoolsData || DEMO_SCHOOLS, // Add schools data
          }
        : {
            classes:     DEMO_CLASSES,
            students:    DEMO_STUDENTS,
            assignments: DEMO_ASSIGNMENTS,
            grades:      DEMO_GRADES,
            messages:    DEMO_MESSAGES,
            feed:        DEMO_FEED,
            lessons:     DEMO_LESSONS,
            reminders:   DEMO_REMINDERS,
            schools:     schoolsData || DEMO_SCHOOLS, // Add schools data
          }
        
        set(state => ({
          ...state,
          ...data,
          dbLoaded: true,
          isHydrated: true,
          dbError: schoolsError ? schoolsError.message : null
        }))
      } else {
        // Real teacher - load data from Supabase
        set(state => ({
          ...state,
          classes: [], // Will be populated from Supabase
          students: [],
          assignments: [],
          grades: [],
          messages: [],
          feed: [],
          lessons: [], // Will be populated from Supabase
          reminders: [],
          schools: schoolsData || DEMO_SCHOOLS, // Still load schools for validation
          dbLoaded: true,
          isHydrated: true,
          dbError: schoolsError ? schoolsError.message : null
        }))
        
        // Fetch real data from Supabase
        get().fetchClassesFromSupabase()
        get().fetchStudentsFromSupabase()
        get().fetchAssignmentsFromSupabase()
        get().fetchGradesFromSupabase()
        get().fetchLessonsFromSupabase()
      }
    } catch (error) {
      console.error('Error in loadFromDB:', error);
      set(state => ({
        ...state,
        dbLoaded: true,
        isHydrated: true,
        dbError: error.message,
        schools: DEMO_SCHOOLS, // Fallback to demo schools array
      }));
    }
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

  // ── Educational Standards ───────────────────────────────────────────────────
  currentStandards: [],
  selectedStandards: [],
  standardsLoading: false,
  standardsError: null,


  setCurrentStandards: (standards) => set({ currentStandards: standards }),
  setSelectedStandards: (standards) => set({ selectedStandards: standards }),
  setStandardsLoading: (loading) => set({ standardsLoading: loading }),
  setStandardsError: (error) => set({ standardsError: error }),

  // Add/remove standards from selection
  addSelectedStandard: (standard) => set(state => ({
    selectedStandards: [...state.selectedStandards, standard]
  })),
  removeSelectedStandard: (standardCode) => set(state => ({
    selectedStandards: state.selectedStandards.filter(s => s.code !== standardCode)
  })),
  clearSelectedStandards: () => set({ selectedStandards: [] }),

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

  addClass: (newClass) => set(state => ({
    classes: [...state.classes, newClass]
  })),

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

// Export demo schools for use in other modules
export { DEMO_SCHOOLS }
