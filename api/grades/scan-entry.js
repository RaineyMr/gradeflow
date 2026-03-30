import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Configure formidable for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to validate required fields
function validateRequiredFields(body) {
  const required = ['assignmentId', 'studentName', 'score', 'maxScore'];
  const missing = required.filter(field => !body[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

// Helper function to find student by name (fuzzy matching)
async function findStudentByName(studentName, assignmentId) {
  try {
    // Get the assignment to find the teacher's class
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select('class_id')
      .eq('id', assignmentId)
      .single();

    if (assignmentError || !assignment) {
      throw new Error('Assignment not found');
    }

    // Get all students in this class
    const { data: students, error: studentsError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email')
      .eq('role', 'student')
      .eq('class_id', assignment.class_id);

    if (studentsError) {
      throw new Error('Failed to fetch students');
    }

    // Try exact match first
    const fullName = studentName.toLowerCase().trim();
    let exactMatch = students.find(student => {
      const studentFullName = `${student.first_name} ${student.last_name}`.toLowerCase();
      return studentFullName === fullName;
    });

    if (exactMatch) {
      return exactMatch;
    }

    // Try fuzzy matching with Levenshtein distance
    let bestMatch = null;
    let bestScore = 0;

    for (const student of students) {
      const studentFullName = `${student.first_name} ${student.last_name}`;
      const similarity = calculateSimilarity(studentName, studentFullName);
      
      if (similarity > 0.8 && similarity > bestScore) {
        bestScore = similarity;
        bestMatch = student;
      }
    }

    return bestMatch;
  } catch (error) {
    console.error('Error finding student:', error);
    return null;
  }
}

// Simple Levenshtein distance implementation
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1, str2) {
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

// Helper function to upload scan image to Supabase Storage
async function uploadScanImage(file, assignmentId, studentId) {
  try {
    const timestamp = Date.now();
    const fileName = `scans/${assignmentId}/${studentId}/${timestamp}.jpg`;
    
    // Read file buffer
    const fileBuffer = fs.readFileSync(file.filepath);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('grade-scans')
      .upload(fileName, fileBuffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      throw new Error(`Failed to upload scan image: ${error.message}`);
    }

    // Get public URL (though bucket is private, we'll use signed URLs)
    const { data: urlData } = supabase.storage
      .from('grade-scans')
      .getPublicUrl(fileName);

    return {
      path: fileName,
      url: urlData.publicUrl
    };
  } catch (error) {
    console.error('Error uploading scan image:', error);
    throw error;
  }
}

// Main API handler
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();

  try {
    // Parse form data
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    
    // Extract form fields
    const formData = {};
    for (const [key, values] of Object.entries(fields)) {
      formData[key] = Array.isArray(values) ? values[0] : values;
    }

    // Validate required fields
    validateRequiredFields(formData);

    const {
      assignmentId,
      studentName,
      score,
      maxScore,
      confidence,
      ocrProcessingTime,
      scanDuration,
      autoSnapTriggered = true,
      manualOverride = false
    } = formData;

    // Get the current user (teacher) from the request
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid authentication' });
    }

    // Verify the teacher owns this assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select('id, teacher_id, max_points')
      .eq('id', assignmentId)
      .eq('teacher_id', user.id)
      .single();

    if (assignmentError || !assignment) {
      return res.status(403).json({ error: 'Assignment not found or access denied' });
    }

    // Find the student
    const student = await findStudentByName(studentName, assignmentId);
    if (!student) {
      return res.status(404).json({ 
        error: 'Student not found',
        suggestion: 'Please check the student name or enter manually'
      });
    }

    // Validate score against assignment max points
    const numericScore = parseFloat(score);
    const numericMaxScore = parseFloat(maxScore);
    
    if (numericScore < 0 || numericScore > numericMaxScore) {
      return res.status(400).json({ 
        error: `Invalid score: ${score}. Must be between 0 and ${numericMaxScore}` 
      });
    }

    // Upload scan image if provided
    let scanImageData = null;
    if (files.scanImage && files.scanImage.length > 0) {
      const scanFile = Array.isArray(files.scanImage) ? files.scanImage[0] : files.scanImage;
      scanImageData = await uploadScanImage(scanFile, assignmentId, student.id);
    }

    // Create the grade record
    const { data: grade, error: gradeError } = await supabase
      .from('grades')
      .insert({
        assignment_id: assignmentId,
        student_id: student.id,
        teacher_id: user.id,
        score: numericScore,
        max_score: numericMaxScore,
        student_name_extracted: studentName,
        confidence_score: parseFloat(confidence) || 0,
        scan_image_url: scanImageData?.url || null,
        scan_image_path: scanImageData?.path || null,
        manual_override: manualOverride === 'true',
        notes: formData.notes || null,
      })
      .select()
      .single();

    if (gradeError) {
      throw new Error(`Failed to create grade: ${gradeError.message}`);
    }

    // Record analytics
    const { error: analyticsError } = await supabase
      .from('scan_analytics')
      .insert({
        teacher_id: user.id,
        assignment_id: assignmentId,
        scan_duration_ms: parseInt(scanDuration) || null,
        ocr_processing_time_ms: parseInt(ocrProcessingTime) || null,
        auto_snap_triggered: autoSnapTriggered === 'true',
        manual_override: manualOverride === 'true',
        ocr_confidence: parseFloat(confidence) || 0,
        student_name_matched: studentName.toLowerCase().trim() === `${student.first_name} ${student.last_name}`.toLowerCase(),
        required_manual_correction: manualOverride === 'true',
        browser_info: req.headers['user-agent'] || null,
        camera_resolution: formData.cameraResolution || null,
        image_size_bytes: scanImageData ? files.scanImage[0].size : null,
      });

    if (analyticsError) {
      console.error('Failed to record analytics:', analyticsError);
      // Don't fail the request if analytics fails
    }

    // Clean up temporary files
    if (files.scanImage) {
      const scanFile = Array.isArray(files.scanImage) ? files.scanImage[0] : files.scanImage;
      try {
        fs.unlinkSync(scanFile.filepath);
      } catch (error) {
        console.error('Failed to cleanup temp file:', error);
      }
    }

    const processingTime = Date.now() - startTime;

    res.status(200).json({
      success: true,
      grade: {
        id: grade.id,
        studentName: `${student.first_name} ${student.last_name}`,
        score: grade.score,
        maxScore: grade.max_score,
        percentage: grade.percentage,
        confidence: grade.confidence_score,
        createdAt: grade.created_at,
      },
      processingTime,
      message: `✓ Grade recorded for ${student.first_name} ${student.last_name}`,
    });

  } catch (error) {
    console.error('Scan entry error:', error);
    
    // Cleanup any temporary files
    if (req.files && req.files.scanImage) {
      const scanFile = Array.isArray(req.files.scanImage) ? req.files.scanImage[0] : req.files.scanImage;
      try {
        fs.unlinkSync(scanFile.filepath);
      } catch (cleanupError) {
        console.error('Failed to cleanup temp file:', cleanupError);
      }
    }

    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Failed to process scan',
    });
  }
}
