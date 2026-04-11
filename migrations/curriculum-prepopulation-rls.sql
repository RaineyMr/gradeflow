-- RLS Policies for Curriculum Prepopulation Feature
-- Run this after lesson-plan-enhancement.sql and comprehensive-standards-seed.sql

-- ========================================
-- 1. Update classes table to include grade_level if not present
-- ========================================
ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS grade_level TEXT;

-- ========================================
-- 2. Add RLS policies for curriculum prepopulation
-- ========================================

-- Policy: Teachers can only access their own classes for prepopulation
CREATE POLICY "Teachers can access own classes for curriculum" ON classes
FOR SELECT
USING (teacher_id = auth.uid());

-- Policy: Teachers can only create lessons for their own classes
CREATE POLICY "Teachers can create lessons for own classes" ON lessons
FOR INSERT
WITH CHECK (
  teacher_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM classes 
    WHERE classes.id = lessons.class_id 
    AND classes.teacher_id = auth.uid()
  )
);

-- Policy: Teachers can only view their own lessons
CREATE POLICY "Teachers can view own lessons" ON lessons
FOR SELECT
USING (teacher_id = auth.uid());

-- Policy: Teachers can only update their own lessons
CREATE POLICY "Teachers can update own lessons" ON lessons
FOR UPDATE
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

-- Policy: Teachers can only delete their own lessons
CREATE POLICY "Teachers can delete own lessons" ON lessons
FOR DELETE
USING (teacher_id = auth.uid());

-- Enhanced policy for lesson_standards junction table
CREATE POLICY "Teachers can manage lesson standards for own lessons" ON lesson_standards
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM lessons 
    WHERE lessons.id = lesson_standards.lesson_id 
    AND lessons.teacher_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lessons 
    WHERE lessons.id = lesson_standards.lesson_id 
    AND lessons.teacher_id = auth.uid()
  )
);

-- ========================================
-- 3. Create function to validate teacher access to class
-- ========================================
CREATE OR REPLACE FUNCTION validate_teacher_class_access(class_uuid UUID, teacher_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM classes 
    WHERE id = class_uuid 
    AND teacher_id = teacher_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 4. Create function to check for existing lessons on date
-- ========================================
CREATE OR REPLACE FUNCTION check_existing_lessons_on_date(
  teacher_uuid UUID,
  class_uuid UUID,
  lesson_date DATE
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM lessons 
    WHERE teacher_id = teacher_uuid
    AND class_id = class_uuid
    AND lesson_date = lesson_date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 5. Create function to get available school days
-- ========================================
CREATE OR REPLACE FUNCTION get_school_days(start_date DATE, end_date DATE)
RETURNS TABLE(school_day DATE) AS $$
BEGIN
  RETURN QUERY
  SELECT generate_series(
    start_date,
    end_date,
    '1 day'::interval
  )::DATE AS school_day
  WHERE EXTRACT(DOW FROM generate_series(start_date, end_date, '1 day'::interval)::DATE) NOT IN (0, 6); -- Exclude weekends
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 6. Add indexes for performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_classes_teacher_subject_grade ON classes(teacher_id, subject, grade_level);
CREATE INDEX IF NOT EXISTS idx_lessons_teacher_class_date ON lessons(teacher_id, class_id, lesson_date);
CREATE INDEX IF NOT EXISTS idx_standards_catalog_subject_grades ON standards_catalog(subject, grade_levels);

-- ========================================
-- 7. Grant necessary permissions
-- ========================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION validate_teacher_class_access TO authenticated;
GRANT EXECUTE ON FUNCTION check_existing_lessons_on_date TO authenticated;
GRANT EXECUTE ON FUNCTION get_school_days TO authenticated;

-- ========================================
-- 8. Verification queries
-- ========================================
-- To verify policies are correctly applied:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename IN ('classes', 'lessons', 'lesson_standards');

-- To verify functions exist:
-- SELECT proname, prosrc FROM pg_proc WHERE proname LIKE '%teacher%' OR proname LIKE '%school%';
