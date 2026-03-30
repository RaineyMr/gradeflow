-- Camera Scan-to-Grade Schema Migration
-- Run this in Supabase Console → SQL Editor

-- Create grades table if it doesn't exist
CREATE TABLE IF NOT EXISTS grades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Grade information
  score DECIMAL(5,2) NOT NULL,
  max_score DECIMAL(5,2) NOT NULL,
  percentage DECIMAL(5,2) GENERATED ALWAYS AS (ROUND((score / max_score) * 100, 2)) STORED,
  
  -- OCR metadata
  student_name_extracted TEXT,
  confidence_score DECIMAL(3,2) DEFAULT 0.00, -- OCR confidence 0-100
  
  -- Scan image storage
  scan_image_url TEXT,
  scan_image_path TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  manual_override BOOLEAN DEFAULT FALSE,
  notes TEXT,
  
  -- Constraints
  CONSTRAINT valid_score CHECK (score >= 0 AND score <= max_score),
  CONSTRAINT valid_max_score CHECK (max_score > 0 AND max_score <= 1000),
  CONSTRAINT valid_percentage CHECK (percentage >= 0 AND percentage <= 100),
  CONSTRAINT valid_confidence CHECK (confidence_score >= 0 AND confidence_score <= 100)
);

-- Create storage bucket for scan images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'grade-scans', 
  'grade-scans', 
  false, -- Private bucket
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png']
) ON CONFLICT (id) DO NOTHING;

-- Create scan tracking table for analytics
CREATE TABLE IF NOT EXISTS scan_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  
  -- Scan metrics
  scan_duration_ms INTEGER, -- Time from camera start to grade save
  ocr_processing_time_ms INTEGER,
  auto_snap_triggered BOOLEAN DEFAULT TRUE,
  manual_override BOOLEAN DEFAULT FALSE,
  
  -- OCR quality metrics
  ocr_confidence DECIMAL(3,2),
  student_name_matched BOOLEAN DEFAULT FALSE,
  required_manual_correction BOOLEAN DEFAULT FALSE,
  
  -- Technical metrics
  browser_info TEXT,
  camera_resolution TEXT,
  image_size_bytes INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for grades table
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Teachers can only see grades for their assignments
CREATE POLICY "Teachers can view grades for their assignments" ON grades
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assignments 
      WHERE assignments.id = grades.assignment_id 
      AND assignments.teacher_id = auth.uid()
    )
  );

-- Teachers can insert grades for their assignments
CREATE POLICY "Teachers can insert grades for their assignments" ON grades
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM assignments 
      WHERE assignments.id = grades.assignment_id 
      AND assignments.teacher_id = auth.uid()
    )
  );

-- Teachers can update grades for their assignments
CREATE POLICY "Teachers can update grades for their assignments" ON grades
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM assignments 
      WHERE assignments.id = grades.assignment_id 
      AND assignments.teacher_id = auth.uid()
    )
  );

-- Teachers can delete grades for their assignments
CREATE POLICY "Teachers can delete grades for their assignments" ON grades
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM assignments 
      WHERE assignments.id = grades.assignment_id 
      AND assignments.teacher_id = auth.uid()
    )
  );

-- Students can only see their own grades
CREATE POLICY "Students can view their own grades" ON grades
  FOR SELECT USING (student_id = auth.uid());

-- Parents can see grades for their linked students
CREATE POLICY "Parents can view student grades" ON grades
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM parent_student_links 
      WHERE parent_student_links.parent_id = auth.uid() 
      AND parent_student_links.student_id = grades.student_id
    )
  );

-- RLS Policies for scan_analytics table
ALTER TABLE scan_analytics ENABLE ROW LEVEL SECURITY;

-- Teachers can view their own analytics
CREATE POLICY "Teachers can view their scan analytics" ON scan_analytics
  FOR SELECT USING (teacher_id = auth.uid());

-- Teachers can insert their own analytics
CREATE POLICY "Teachers can insert scan analytics" ON scan_analytics
  FOR INSERT WITH CHECK (teacher_id = auth.uid());

-- Storage policies for grade-scans bucket
CREATE POLICY "Teachers can upload scans for their assignments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'grade-scans' AND
    auth.role() = 'authenticated' AND
    -- Extract teacher_id from the path: scans/{assignment_id}/{student_id}/{timestamp}.jpg
    (split_part(name, '/', 2))::uuid IN (
      SELECT id FROM assignments WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view scans for their assignments" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'grade-scans' AND
    auth.role() = 'authenticated' AND
    (split_part(name, '/', 2))::uuid IN (
      SELECT id FROM assignments WHERE teacher_id = auth.uid()
    )
  );

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_grades_assignment_id ON grades(assignment_id);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_teacher_id ON grades(teacher_id);
CREATE INDEX IF NOT EXISTS idx_grades_created_at ON grades(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_grades_assignment_student ON grades(assignment_id, student_id);

CREATE INDEX IF NOT EXISTS idx_scan_analytics_teacher_id ON scan_analytics(teacher_id);
CREATE INDEX IF NOT EXISTS idx_scan_analytics_assignment_id ON scan_analytics(assignment_id);
CREATE INDEX IF NOT EXISTS idx_scan_analytics_created_at ON scan_analytics(created_at DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_grades_updated_at 
  BEFORE UPDATE ON grades 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get grade statistics for an assignment
CREATE OR REPLACE FUNCTION get_assignment_grade_stats(assignment_uuid UUID)
RETURNS TABLE(
  total_grades BIGINT,
  average_score DECIMAL(5,2),
  highest_score DECIMAL(5,2),
  lowest_score DECIMAL(5,2),
  average_percentage DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_grades,
    ROUND(AVG(g.score), 2) as average_score,
    ROUND(MAX(g.score), 2) as highest_score,
    ROUND(MIN(g.score), 2) as lowest_score,
    ROUND(AVG(g.percentage), 2) as average_percentage
  FROM grades g
  WHERE g.assignment_id = assignment_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get student's grade summary
CREATE OR REPLACE FUNCTION get_student_grade_summary(student_uuid UUID)
RETURNS TABLE(
  assignment_name TEXT,
  assignment_id UUID,
  score DECIMAL(5,2),
  max_score DECIMAL(5,2),
  percentage DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.name as assignment_name,
    a.id as assignment_id,
    g.score,
    g.max_score,
    g.percentage,
    g.created_at
  FROM grades g
  JOIN assignments a ON g.assignment_id = a.id
  WHERE g.student_id = student_uuid
  ORDER BY g.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT ALL ON grades TO authenticated;
GRANT ALL ON scan_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_assignment_grade_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_student_grade_summary TO authenticated;

-- Optional: Create a view for recent grades with student info
CREATE OR REPLACE VIEW recent_grades_with_students AS
SELECT 
  g.*,
  u.email as student_email,
  u.first_name as student_first_name,
  u.last_name as student_last_name,
  a.name as assignment_name,
  a.due_date as assignment_due_date
FROM grades g
JOIN users u ON g.student_id = u.id
JOIN assignments a ON g.assignment_id = a.id
ORDER BY g.created_at DESC;

GRANT SELECT ON recent_grades_with_students TO authenticated;
