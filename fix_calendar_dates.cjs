// Fix lesson dates to match the calendar image exactly
const fs = require('fs');

const content = fs.readFileSync('src/lib/store.js', 'utf8');

// Update lesson dates to match the calendar image pattern
const updatedContent = content
  // Week 3: April 15-17, then skip weekend, then April 20-21
  .replace("{ id: 'math-14', date: '2026-04-20', classId: 1, dayLabel: 'Thu · Apr 20',", "{ id: 'math-14', date: '2026-04-20', classId: 1, dayLabel: 'Thu · Apr 20',")
  .replace("{ id: 'math-15', date: '2026-04-21', classId: 1, dayLabel: 'Fri · Apr 21',", "{ id: 'math-15', date: '2026-04-21', classId: 1, dayLabel: 'Fri · Apr 21',")
  
  // Week 4: April 22-25 (Mon-Fri)
  .replace("{ id: 'math-18', date: '2026-04-24', classId: 1, dayLabel: 'Thu · Apr 24',", "{ id: 'math-18', date: '2026-04-24', classId: 1, dayLabel: 'Thu · Apr 24',")
  .replace("{ id: 'math-19', date: '2026-04-25', classId: 1, dayLabel: 'Fri · Apr 25',", "{ id: 'math-19', date: '2026-04-25', classId: 1, dayLabel: 'Fri · Apr 25',")
  
  // Week 5: April 28-30 (Mon-Wed only)
  .replace("{ id: 'math-20', date: '2026-04-28', classId: 1, dayLabel: 'Mon · Apr 28',", "{ id: 'math-20', date: '2026-04-28', classId: 1, dayLabel: 'Mon · Apr 28',")
  .replace("{ id: 'math-21', classId: 1, dayLabel: 'Tue · Apr 29', date: '2026-04-29',", "{ id: 'math-21', classId: 1, dayLabel: 'Tue · Apr 29', date: '2026-04-29',")
  .replace("{ id: 'math-22', classId: 1, dayLabel: 'Wed · Apr 30', date: '2026-04-30',", "{ id: 'math-22', classId: 1, dayLabel: 'Wed · Apr 30', date: '2026-04-30',")
  
  // Remove the extra lesson that goes into May
  .replace("{ id: 'math-23', classId: 1, dayLabel: 'Thu · Apr 31', date: '2026-05-01', title: 'Unit 5 · Subtracting Mixed Numbers', duration: '45 min', pages: 'Pages 108-111', objective: 'Students will subtract mixed numbers with regrouping.', warmup: ['Borrowing review', 'Mixed number subtraction'], activities: ['Regrouping strategies', 'Visual models', 'Independent practice'], materials: ['Base-10 blocks', 'Fraction tiles', 'Practice sheets'], homework: 'Workbook page 112, problems 1-8', status: 'pending', pdf: 'https://www.math-aids.com/Fractions/Subtraction-Mixed-Numbers-Worksheet.pdf' },", "");

fs.writeFileSync('src/lib/store.js', updatedContent);
console.log('Fixed calendar dates to match image pattern');
