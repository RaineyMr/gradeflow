// Add date fields to remaining April lessons
const fs = require('fs');

const content = fs.readFileSync('src/lib/store.js', 'utf8');

// Add dates for the new lessons
const updatedContent = content
  .replace("{ id: 'math-21', classId: 1, dayLabel: 'Mon · Apr 28',", "{ id: 'math-21', classId: 1, dayLabel: 'Mon · Apr 28', date: '2026-04-28',")
  .replace("{ id: 'math-22', classId: 1, dayLabel: 'Tue · Apr 29',", "{ id: 'math-22', classId: 1, dayLabel: 'Tue · Apr 29', date: '2026-04-29',")
  .replace("{ id: 'math-23', classId: 1, dayLabel: 'Wed · Apr 30',", "{ id: 'math-23', classId: 1, dayLabel: 'Wed · Apr 30', date: '2026-04-30',");

fs.writeFileSync('src/lib/store.js', updatedContent);
console.log('Added date fields to remaining April lessons');
