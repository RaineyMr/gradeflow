import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client - this should be called from a component where env vars are available
export function createSupabaseClient() {
  const supabaseUrl = (globalThis as any).VITE_SUPABASE_URL || 
                     (typeof window !== 'undefined' && (window as any).VITE_SUPABASE_URL);
  const supabaseKey = (globalThis as any).VITE_SUPABASE_ANON_KEY || 
                     (typeof window !== 'undefined' && (window as any).VITE_SUPABASE_ANON_KEY);

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env file.');
  }

  return createClient(supabaseUrl, supabaseKey);
}

interface DemoStudent {
  id: string;
  name: string;
  email: string;
}

interface DemoAssignment {
  id: string;
  name: string;
  maxPoints: number;
}

interface DemoGrade {
  assignmentId: string;
  studentName: string;
  score: number;
  maxScore: number;
  confidence: number;
}

export async function seedDemoGrades(): Promise<void> {
  try {
    console.log('Starting demo grade seeding...');
    const supabase = createSupabaseClient();

    // Demo data - 5 assignments, 5 students each
    const demoAssignments: DemoAssignment[] = [
      { id: 'demo-assignment-1', name: 'Math Quiz 1', maxPoints: 100 },
      { id: 'demo-assignment-2', name: 'Science Lab Report', maxPoints: 50 },
      { id: 'demo-assignment-3', name: 'History Essay', maxPoints: 75 },
      { id: 'demo-assignment-4', name: 'English Vocabulary Test', maxPoints: 25 },
      { id: 'demo-assignment-5', name: 'Geography Map Project', maxPoints: 60 },
    ];

    const demoStudents: DemoStudent[] = [
      { id: 'demo-student-1', name: 'Emma Johnson', email: 'emma.johnson@demo.edu' },
      { id: 'demo-student-2', name: 'Liam Smith', email: 'liam.smith@demo.edu' },
      { id: 'demo-student-3', name: 'Olivia Brown', email: 'olivia.brown@demo.edu' },
      { id: 'demo-student-4', name: 'Noah Davis', email: 'noah.davis@demo.edu' },
      { id: 'demo-student-5', name: 'Ava Wilson', email: 'ava.wilson@demo.edu' },
    ];

    // Generate realistic grade distributions
    const generateGradesForAssignment = (assignment: DemoAssignment): DemoGrade[] => {
      const baseScores = [85, 92, 78, 88, 95]; // Different base for each assignment
      const variance = 15; // Score variance
      
      return demoStudents.map((student, index) => {
        const baseScore = baseScores[index] || 80;
        const score = Math.max(0, Math.min(assignment.maxPoints, 
          baseScore + (Math.random() - 0.5) * variance * 2));
        
        return {
          assignmentId: assignment.id,
          studentName: student.name,
          score: Math.round(score),
          maxScore: assignment.maxPoints,
          confidence: 75 + Math.random() * 20, // 75-95% confidence
        };
      });
    };

    // Get current user (assuming they're authenticated)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.warn('No authenticated user found, skipping grade seeding');
      return;
    }

    // Check if demo grades already exist
    const { data: existingGrades, error: checkError } = await supabase
      .from('grades')
      .select('id')
      .eq('teacher_id', user.id)
      .like('assignment_id', 'demo-assignment-%');

    if (checkError) {
      console.error('Error checking existing grades:', checkError);
      return;
    }

    if (existingGrades && existingGrades.length > 0) {
      console.log(`Found ${existingGrades.length} existing demo grades, skipping seeding`);
      return;
    }

    // Generate all demo grades
    const allDemoGrades: DemoGrade[] = [];
    for (const assignment of demoAssignments) {
      allDemoGrades.push(...generateGradesForAssignment(assignment));
    }

    console.log(`Generated ${allDemoGrades.length} demo grades to insert`);

    // Insert grades in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < allDemoGrades.length; i += batchSize) {
      const batch = allDemoGrades.slice(i, i + batchSize);
      
      const { data: insertedGrades, error: insertError } = await supabase
        .from('grades')
        .insert(
          batch.map(grade => ({
            assignment_id: grade.assignmentId,
            student_id: demoStudents.find(s => s.name === grade.studentName)?.id,
            teacher_id: user.id,
            score: grade.score,
            max_score: grade.maxScore,
            student_name_extracted: grade.studentName,
            confidence_score: grade.confidence,
            manual_override: false,
            notes: 'Demo grade - auto-generated for testing',
          }))
        )
        .select();

      if (insertError) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError);
        continue;
      }

      console.log(`Inserted batch ${i / batchSize + 1}: ${insertedGrades?.length || 0} grades`);
    }

    // Verify the seeding worked
    const { data: finalGrades, error: verifyError } = await supabase
      .from('grades')
      .select('id, assignment_id, score, max_score')
      .eq('teacher_id', user.id)
      .like('assignment_id', 'demo-assignment-%');

    if (verifyError) {
      console.error('Error verifying seeded grades:', verifyError);
      return;
    }

    console.log(`✅ Demo grade seeding complete! Created ${finalGrades?.length || 0} demo grades`);

    // Log summary by assignment
    const summary = demoAssignments.map(assignment => {
      const assignmentGrades = finalGrades?.filter(g => g.assignment_id === assignment.id) || [];
      const avgScore = assignmentGrades.length > 0 
        ? assignmentGrades.reduce((sum, g) => sum + g.score, 0) / assignmentGrades.length 
        : 0;
      
      return {
        assignment: assignment.name,
        gradesCount: assignmentGrades.length,
        averageScore: Math.round(avgScore),
        maxPoints: assignment.maxPoints,
      };
    });

    console.log('Demo grade summary:');
    summary.forEach(item => {
      console.log(`  ${item.assignment}: ${item.gradesCount} grades, avg ${item.averageScore}/${item.maxPoints}`);
    });

  } catch (error) {
    console.error('Failed to seed demo grades:', error);
  }
}

// Function to clear demo grades (useful for testing)
export async function clearDemoGrades(): Promise<void> {
  try {
    const supabase = createSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.warn('No authenticated user found');
      return;
    }

    const { error: deleteError } = await supabase
      .from('grades')
      .delete()
      .eq('teacher_id', user.id)
      .like('assignment_id', 'demo-assignment-%');

    if (deleteError) {
      console.error('Error clearing demo grades:', deleteError);
      return;
    }

    console.log('✅ Demo grades cleared successfully');

  } catch (error) {
    console.error('Failed to clear demo grades:', error);
  }
}

// Function to get demo grade statistics
export async function getDemoGradeStats(): Promise<any> {
  try {
    const supabase = createSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return null;
    }

    const { data: grades, error: gradesError } = await supabase
      .from('grades')
      .select('score, max_score, assignment_id')
      .eq('teacher_id', user.id)
      .like('assignment_id', 'demo-assignment-%');

    if (gradesError || !grades) {
      return null;
    }

    const totalGrades = grades.length;
    const averageScore = grades.reduce((sum, g) => sum + (g.score / g.max_score) * 100, 0) / totalGrades;
    const highestScore = Math.max(...grades.map(g => (g.score / g.max_score) * 100));
    const lowestScore = Math.min(...grades.map(g => (g.score / g.max_score) * 100));

    return {
      totalGrades,
      averagePercentage: Math.round(averageScore),
      highestPercentage: Math.round(highestScore),
      lowestPercentage: Math.round(lowestScore),
    };

  } catch (error) {
    console.error('Error getting demo grade stats:', error);
    return null;
  }
}

// Auto-seed function that can be called during app initialization
export async function ensureDemoGrades(): Promise<void> {
  try {
    const supabase = createSupabaseClient();
    const stats = await getDemoGradeStats();
    
    if (!stats || stats.totalGrades === 0) {
      console.log('No demo grades found, seeding...');
      await seedDemoGrades();
    } else {
      console.log(`Demo grades already exist: ${stats.totalGrades} grades, avg ${stats.averagePercentage}%`);
    }
  } catch (error) {
    console.error('Error ensuring demo grades:', error);
  }
}
