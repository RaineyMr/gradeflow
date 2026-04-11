// Fix weekend dates in April lessons
const fs = require('fs');

const content = fs.readFileSync('src/lib/store.js', 'utf8');

// Fix the date and dayLabel conflicts and weekend issues
const updatedContent = content
  // Fix math-13: should be Wed Apr 15, not Apr 17
  .replace("{ id: 'math-13', date: '2026-04-17', classId: 1, dayLabel: 'Wed · Apr 17',", "{ id: 'math-13', date: '2026-04-15', classId: 1, dayLabel: 'Wed · Apr 15',")
  // Fix math-14: should be Thu Apr 16, not Apr 17  
  .replace("{ id: 'math-14', date: '2026-04-17', classId: 1, dayLabel: 'Thu · Apr 17',", "{ id: 'math-14', date: '2026-04-16', classId: 1, dayLabel: 'Thu · Apr 16',")
  // Fix math-15: should be Fri Apr 17, not Apr 20
  .replace("{ id: 'math-15', date: '2026-04-20', classId: 1, dayLabel: 'Mon · Apr 20',", "{ id: 'math-15', date: '2026-04-17', classId: 1, dayLabel: 'Fri · Apr 17',")
  // Fix math-18: should be Thu Apr 23, not Apr 24
  .replace("{ id: 'math-18', date: '2026-04-24', classId: 1, dayLabel: 'Wed · Apr 23',", "{ id: 'math-18', date: '2026-04-23', classId: 1, dayLabel: 'Thu · Apr 23',")
  // Fix math-19: should be Fri Apr 24, not Apr 25
  .replace("{ id: 'math-19', date: '2026-04-25', classId: 1, dayLabel: 'Thu · Apr 24',", "{ id: 'math-19', date: '2026-04-24', classId: 1, dayLabel: 'Fri · Apr 24',")
  // Fix math-20: should be Mon Apr 27 (after weekend), not Apr 25
  .replace("{ id: 'math-20', date: '2026-04-25', classId: 1, dayLabel: 'Fri · Apr 25',", "{ id: 'math-20', date: '2026-04-27', classId: 1, dayLabel: 'Mon · Apr 27',");

fs.writeFileSync('src/lib/store.js', updatedContent);
console.log('Fixed weekend dates in April lessons');
