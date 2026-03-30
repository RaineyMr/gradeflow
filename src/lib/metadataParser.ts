export interface ParsedGrade {
  studentName: string;
  score: number;
  maxScore: number;
  percentage?: number;
  confidence: number;
}

export interface Student {
  id: string;
  name: string;
  email?: string;
}

export interface Assignment {
  id: string;
  name: string;
  maxPoints: number;
}

export class MetadataParser {
  private students: Student[] = [];
  private assignments: Assignment[] = [];

  constructor(students: Student[] = [], assignments: Assignment[] = []) {
    this.students = students;
    this.assignments = assignments;
  }

  updateData(students: Student[], assignments: Assignment[]): void {
    this.students = students;
    this.assignments = assignments;
  }

  parseOCRResult(ocrText: string, assignmentId?: string): ParsedGrade | null {
    const text = ocrText.trim();
    if (!text) return null;

    // Extract student name
    const studentName = this.extractStudentName(text);
    if (!studentName) {
      console.warn('No student name found in OCR text');
      return null;
    }

    // Extract score
    const scoreResult = this.extractScore(text, assignmentId);
    if (!scoreResult) {
      console.warn('No valid score found in OCR text');
      return null;
    }

    // Calculate confidence based on extraction quality
    const confidence = this.calculateConfidence(studentName, scoreResult, text);

    return {
      studentName,
      score: scoreResult.score,
      maxScore: scoreResult.maxScore,
      percentage: scoreResult.percentage,
      confidence,
    };
  }

  private extractStudentName(text: string): string | null {
    // Try labeled patterns first (highest priority)
    const labeledPatterns = [
      /(?:Name|Student|Name:|Student:)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/i,
      /(?:Student Name|Student Name:)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/i,
    ];

    for (const pattern of labeledPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // Try to find capitalized names (2-3 words, starting with capital letters)
    const namePatterns = [
      /\b([A-Z][a-z]+ [A-Z][a-z]+(?: [A-Z][a-z]+)?)\b/g,
      /\b([A-Z]\. [A-Z][a-z]+(?: [A-Z]\.?)?)\b/g,
    ];

    const potentialNames: string[] = [];
    for (const pattern of namePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        potentialNames.push(...matches);
      }
    }

    // Filter out common false positives
    const filteredNames = potentialNames.filter(name => 
      !this.isCommonFalsePositive(name) && 
      name.length > 3 && 
      name.length < 50
    );

    if (filteredNames.length === 0) return null;

    // If we have a student roster, try fuzzy matching
    if (this.students.length > 0) {
      return this.fuzzyMatchStudent(filteredNames);
    }

    // Return the first reasonable looking name
    return filteredNames[0];
  }

  private extractScore(text: string, assignmentId?: string): {
    score: number;
    maxScore: number;
    percentage?: number;
  } | null {
    // Try labeled patterns first
    const labeledPatterns = [
      /(?:Score|Grade|Score:|Grade:)\s*(\d{1,3})\s*\/\s*(\d{1,3})/i,
      /(?:Score|Grade|Score:|Grade:)\s*(\d{1,3})\s*(?:out of|of)\s*(\d{1,3})/i,
      /(?:Points|Points:)\s*(\d{1,3})\s*\/\s*(\d{1,3})/i,
    ];

    for (const pattern of labeledPatterns) {
      const match = text.match(pattern);
      if (match) {
        const score = parseInt(match[1]);
        const maxScore = parseInt(match[2]);
        if (this.isValidScore(score, maxScore)) {
          return { score, maxScore };
        }
      }
    }

    // Try fraction patterns
    const fractionPatterns = [
      /(\d{1,3})\s*\/\s*(\d{1,3})/g,
      /(\d{1,3})\s*(?:out of|of)\s*(\d{1,3})/gi,
    ];

    for (const pattern of fractionPatterns) {
      const matches = [];
      let match;
      while ((match = pattern.exec(text)) !== null) {
        matches.push(match);
      }
      for (const match of matches) {
        const score = parseInt(match[1]);
        const maxScore = parseInt(match[2]);
        if (this.isValidScore(score, maxScore)) {
          return { score, maxScore };
        }
      }
    }

    // Try percentage patterns
    const percentagePatterns = [
      /(\d{1,3})%/g,
    ];

    for (const pattern of percentagePatterns) {
      const match = text.match(pattern);
      if (match) {
        const percentage = parseInt(match[1]);
        if (percentage >= 0 && percentage <= 100) {
          // If we have assignment info, calculate score from percentage
          if (assignmentId) {
            const assignment = this.assignments.find(a => a.id === assignmentId);
            if (assignment) {
              const score = Math.round((percentage / 100) * assignment.maxPoints);
              return { 
                score, 
                maxScore: assignment.maxPoints, 
                percentage 
              };
            }
          }
          // Default to 100 points max if no assignment info
          return { 
            score: Math.round((percentage / 100) * 100), 
            maxScore: 100, 
            percentage 
          };
        }
      }
    }

    return null;
  }

  private isValidScore(score: number, maxScore: number): boolean {
    return (
      !isNaN(score) && 
      !isNaN(maxScore) && 
      score >= 0 && 
      maxScore > 0 && 
      score <= maxScore &&
      maxScore <= 1000 // Reasonable upper limit
    );
  }

  private isCommonFalsePositive(name: string): boolean {
    const falsePositives = [
      'The', 'And', 'For', 'But', 'Not', 'You', 'All', 'Can', 'Had', 'Her', 'Was', 'One', 'Our', 'Out', 'Day',
      'Get', 'Has', 'Him', 'His', 'How', 'Man', 'New', 'Now', 'Old', 'See', 'Two', 'Way', 'Who', 'Boy', 'Did',
      'Its', 'Let', 'Put', 'Say', 'She', 'Too', 'Use', 'Jan', 'Feb', 'Mar', 'Apr', 'Jun', 'Jul', 'Aug', 'Sep',
      'Oct', 'Nov', 'Dec', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Page', 'Chapter', 'Section',
      'Assignment', 'Test', 'Quiz', 'Exam', 'Homework', 'Project', 'Paper', 'Essay', 'Report',
    ];
    
    return falsePositives.includes(name);
  }

  private fuzzyMatchStudent(potentialNames: string[]): string | null {
    let bestMatch: { name: string; score: number } | null = null;

    for (const potentialName of potentialNames) {
      for (const student of this.students) {
        const similarity = this.calculateSimilarity(potentialName, student.name);
        if (similarity > 0.8 && (!bestMatch || similarity > bestMatch.score)) {
          bestMatch = { name: student.name, score: similarity };
        }
      }
    }

    return bestMatch?.name || null;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    // Levenshtein distance implementation
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  private calculateConfidence(
    studentName: string, 
    scoreResult: { score: number; maxScore: number }, 
    originalText: string
  ): number {
    let confidence = 0.5; // Base confidence

    // Boost confidence if we found exact student match
    if (this.students.some(s => s.name === studentName)) {
      confidence += 0.3;
    }

    // Boost confidence if score has reasonable ratio
    const scoreRatio = scoreResult.score / scoreResult.maxScore;
    if (scoreRatio >= 0 && scoreRatio <= 1) {
      confidence += 0.1;
    }

    // Boost confidence if text is clean (few special characters)
    const specialCharCount = (originalText.match(/[^a-zA-Z0-9\s\/.-]/g) || []).length;
    const cleanliness = Math.max(0, 1 - (specialCharCount / originalText.length));
    confidence += cleanliness * 0.1;

    return Math.min(confidence, 1.0);
  }

  // Helper method to validate parsed grade against assignment
  validateGrade(grade: ParsedGrade, assignmentId: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const assignment = this.assignments.find(a => a.id === assignmentId);

    if (!assignment) {
      errors.push('Assignment not found');
      return { isValid: false, errors };
    }

    if (grade.maxScore !== assignment.maxPoints) {
      errors.push(`Max score mismatch: expected ${assignment.maxPoints}, got ${grade.maxScore}`);
    }

    if (grade.score < 0 || grade.score > assignment.maxPoints) {
      errors.push(`Score out of range: ${grade.score} (0-${assignment.maxPoints})`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
