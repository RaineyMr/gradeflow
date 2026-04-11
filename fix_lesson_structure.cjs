// Fix lesson structure - remove duplicate dates and ensure proper weekday scheduling
const fs = require('fs');

const content = fs.readFileSync('src/lib/store.js', 'utf8');

// Fix duplicate date field in math-1 and ensure proper weekday scheduling
const updatedContent = content
  // Fix duplicate date field in math-1
  .replace("{ id: 'math-1', date: '2026-04-01', classId: 1, dayLabel: 'Mon · Apr 1', date: '2026-04-01',", "{ id: 'math-1', classId: 1, dayLabel: 'Mon · Apr 1', date: '2026-04-01',")
  // Fix Week 4: proper weekday sequence
  .replace("{ id: 'math-18', date: '2026-04-23', classId: 1, dayLabel: 'Thu · Apr 23',", "{ id: 'math-18', date: '2026-04-24', classId: 1, dayLabel: 'Thu · Apr 24',")
  .replace("{ id: 'math-19', date: '2026-04-24', classId: 1, dayLabel: 'Fri · Apr 24',", "{ id: 'math-19', date: '2026-04-25', classId: 1, dayLabel: 'Fri · Apr 25',")
  .replace("{ id: 'math-20', date: '2026-04-27', classId: 1, dayLabel: 'Mon · Apr 27',", "{ id: 'math-20', date: '2026-04-28', classId: 1, dayLabel: 'Mon · Apr 28',")
  // Fix Week 5: proper weekday sequence
  .replace("{ id: 'math-21', classId: 1, dayLabel: 'Mon · Apr 28', date: '2026-04-28',", "{ id: 'math-21', classId: 1, dayLabel: 'Tue · Apr 29', date: '2026-04-29',")
  .replace("{ id: 'math-22', classId: 1, dayLabel: 'Tue · Apr 29', date: '2026-04-29',", "{ id: 'math-22', classId: 1, dayLabel: 'Wed · Apr 30', date: '2026-04-30',")
  .replace("{ id: 'math-23', classId: 1, dayLabel: 'Wed · Apr 30', date: '2026-04-30',", "{ id: 'math-23', classId: 1, dayLabel: 'Thu · Apr 31', date: '2026-05-01',");

fs.writeFileSync('src/lib/store.js', updatedContent);
console.log('Fixed lesson structure and weekday scheduling');
