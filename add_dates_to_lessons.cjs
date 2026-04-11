// Add date fields to all April lessons
const fs = require('fs');

const content = fs.readFileSync('src/lib/store.js', 'utf8');

// Map of lesson IDs to their corresponding dates
const lessonDates = {
  'math-1': '2026-04-01', 'math-2': '2026-04-02', 'math-3': '2026-04-03', 'math-4': '2026-04-04', 'math-5': '2026-04-05',
  'math-6': '2026-04-08', 'math-7': '2026-04-09', 'math-8': '2026-04-10', 'math-9': '2026-04-11', 'math-10': '2026-04-12',
  'math-11': '2026-04-15', 'math-12': '2026-04-16', 'math-13': '2026-04-17', 'math-14': '2026-04-18', 'math-15': '2026-04-19',
  'math-16': '2026-04-22', 'math-17': '2026-04-23', 'math-18': '2026-04-24', 'math-19': '2026-04-25', 'math-20': '2026-04-25'
};

// Update each lesson to include date field
const updatedContent = content.replace(
  /{ id: 'math-(\d+)',/g,
  (match, p1) => {
    const lessonId = `math-${p1}`;
    if (lessonDates[lessonId]) {
      return `${match} date: '${lessonDates[lessonId]}',`;
    }
    return match;
  }
);

fs.writeFileSync('src/lib/store.js', updatedContent);
console.log('Added date fields to all April lessons');
