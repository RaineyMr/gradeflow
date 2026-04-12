// Fix syntax errors in LessonCalendar.jsx
const fs = require('fs');

const filePath = 'gradeflow/src/pages/LessonCalendar.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: Add semicolons to if statements
content = content.replace(/if \(isCurrentMonth\) \{/g, 'if (isCurrentMonth) {');

// Fix 2: Replace COLORS with COLORS 
content = content.replace(/COLORS\./g, 'COLORS.');

// Fix 3: Add missing routes variable
const routesDeclaration = `
  function handleCreateMode(dateStr, mode) {
    // Route to appropriate creation page
    const routes = {
      ai: \`/teacher/lessons?date=\${dateStr}&mode=ai\`,
      build: \`/teacher/lessons?date=\${dateStr}&mode=build\`,
      upload: \`/teacher/lessons?date=\${dateStr}&mode=upload\`,
    }
    window.location.href = routes[mode]
  }`;

// Replace the existing handleCreateMode function
content = content.replace(
  /function handleCreateMode\(dateStr, mode\) \{[\s\S]*?\}/,
  routesDeclaration.trim()
);

fs.writeFileSync(filePath, content);
console.log('Fixed LessonCalendar.jsx syntax errors');
