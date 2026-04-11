// Add PDF resources to lessons based on educational standards
const fs = require('fs');

const content = fs.readFileSync('src/lib/store.js', 'utf8');

// PDF resources for each lesson based on standards
const lessonPDFs = {
  'math-1': 'https://www.commoncoresheets.com/Math/Content/5/NBT/1/Download/5NBT-A1.pdf', // Place Value
  'math-2': 'https://www.commoncoresheets.com/Math/Content/5/NBT/2/Download/5NBT-A4.pdf', // Rounding
  'math-3': 'https://www.k5learning.com/Math/Grade-5/Number-and-Operations-in-Base-Ten/Worksheets/5NBTB7.pdf', // Addition/Subtraction
  'math-4': 'https://www.mathworksheets4kids.com/worksheet/place-value/addition-subtraction-assessment-5th-grade', // Assessment
  'math-5': 'https://www.math-aids.com/Multiplication/Patterns/Multiplication-Patterns-Worksheet.pdf', // Patterns
  'math-6': 'https://www.mathworksheetsland.com/multiplication/2-digit-by-2-digit/worksheets/', // 2-Digit Multiplication
  'math-7': 'https://www.mathworksheetsland.com/multiplication/3-digit-by-2-digit/worksheets/', // 3-Digit Multiplication
  'math-8': 'https://www.math-aids.com/Multiplication/Word-Problems/Multiplication-Word-Problems-Worksheet.pdf', // Word Problems
  'math-9': 'https://www.k5learning.com/Math/Grade-5/Number-and-Operations-in-Base-Ten/Worksheets/5NBTB5.pdf', // Review
  'math-10': 'https://www.math-aids.com/Multiplication/Test/Multiplication-Test-Worksheet.pdf', // Test
  'math-11': 'https://www.mathworksheetsland.com/division/introduction-to-division/worksheets/', // Division Concepts
  'math-12': 'https://www.mathworksheetsland.com/division/dividing-by-1-digit/worksheets/', // 2-Digit Division
  'math-13': 'https://www.mathworksheetsland.com/division/dividing-by-2-digit/worksheets/', // 3-Digit Division
  'math-14': 'https://www.math-aids.com/Division/Word-Problems/Division-Word-Problems-Worksheet.pdf', // Division Word Problems
  'math-15': 'https://www.math-aids.com/Division/Test/Division-Test-Worksheet.pdf', // Division Test
  'math-16': 'https://www.mathworksheets4kids.com/worksheet/fractions/fractions-introduction-5th-grade', // Fraction Concepts
  'math-17': 'https://www.mathworksheetsland.com/fractions/equivalent-fractions/worksheets/', // Equivalent Fractions
  'math-18': 'https://www.mathworksheetsland.com/fractions/comparing-fractions/worksheets/', // Comparing Fractions
  'math-19': 'https://www.mathworksheetsland.com/fractions/adding-fractions/worksheets/', // Adding & Subtracting Fractions
  'math-20': 'https://www.math-aids.com/Fractions/Test/Fractions-Test-Worksheet.pdf' // Fractions Quiz
};

// Function to add PDF field to lessons
const addPDFsToLessons = (content) => {
  const lines = content.split('\n');
  let modifiedContent = [];
  let inLessonsArray = false;
  let currentClassId = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Track when we're in the lessons array
    if (line.includes('const DEMO_LESSONS = {')) {
      inLessonsArray = true;
      continue;
    }
    
    if (inLessonsArray && line.includes('1: [')) {
      currentClassId = 1;
    }
    
    // Add PDF field to each lesson object
    if (currentClassId === 1 && line.includes('{ id: \'math-')) {
      const lessonId = line.match(/id: 'math-(\d+)'/)[1];
      if (lessonId && lessonPDFs[lessonId[1]]) {
        // Find the end of the lesson object
        let lessonEnd = i;
        let braceCount = 0;
        
        for (let j = i; j < lines.length; j++) {
          if (lines[j].includes('{')) braceCount++;
          if (lines[j].includes('}')) braceCount--;
          
          if (braceCount === 0 && lines[j].includes('}')) {
            lessonEnd = j;
            break;
          }
        }
        
        // Insert PDF field before the closing brace
        const pdfLine = `    pdf: '${lessonPDFs[lessonId[1]]}',`;
        lines.splice(lessonEnd, 0, pdfLine);
        modifiedContent = lines;
        break;
      }
    }
  }
  
  return modifiedContent.join('\n');
};

const updatedContent = addPDFsToLessons(content);
fs.writeFileSync('src/lib/store.js', updatedContent);
console.log('Added PDF resources to all lessons');
