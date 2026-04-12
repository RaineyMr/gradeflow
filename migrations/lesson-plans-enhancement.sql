-- GradeFlow Lesson Plans Enhancement Migration
-- Extends existing lessons table to support 10-section lesson plan model
-- Run this in your Supabase SQL editor

-- Add missing columns to lessons table
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS grade_level text,
ADD COLUMN IF NOT EXISTS standards jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS objectives text,
ADD COLUMN IF NOT EXISTS criteria_for_success text,
ADD COLUMN IF NOT EXISTS cultural_notes text,
ADD COLUMN IF NOT EXISTS warm_up text,
ADD COLUMN IF NOT EXISTS direct_instruction text,
ADD COLUMN IF NOT EXISTS guided_practice text,
ADD COLUMN IF NOT EXISTS independent_practice text,
ADD COLUMN IF NOT EXISTS closure text,
ADD COLUMN IF NOT EXISTS extension text,
ADD COLUMN IF NOT EXISTS exit_ticket text,
ADD COLUMN IF NOT EXISTS homework_assignment text,
ADD COLUMN IF NOT EXISTS homework_due_date date,
ADD COLUMN IF NOT EXISTS homework_max_points integer,
ADD COLUMN IF NOT EXISTS accommodations_notes text,
ADD COLUMN IF NOT EXISTS enrichment_activities text,
ADD COLUMN IF NOT EXISTS supplemental_links text,
ADD COLUMN IF NOT EXISTS teacher_reflections text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS published_at timestamptz,
ADD COLUMN IF NOT EXISTS archived_at timestamptz,
ADD COLUMN IF NOT EXISTS ai_calls_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_tokens_used integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create lesson_standards table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS lesson_standards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  standard_id text NOT NULL,
  standard_source text DEFAULT 'TEKS',
  standard_label text,
  created_at timestamptz DEFAULT now()
);

-- Create lesson_attachments table
CREATE TABLE IF NOT EXISTS lesson_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text,
  file_url text,
  uploaded_at timestamptz DEFAULT now()
);

-- Create lesson_accommodations table
CREATE TABLE IF NOT EXISTS lesson_accommodations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  student_id uuid,
  accommodation_type text,
  specific_needs text,
  instructional_adjustments text,
  created_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_lessons_teacher_id ON lessons(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lessons_class_id ON lessons(class_id);
CREATE INDEX IF NOT EXISTS idx_lessons_lesson_date ON lessons(lesson_date);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON lessons(status);
CREATE INDEX IF NOT EXISTS idx_lesson_standards_lesson_id ON lesson_standards(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_attachments_lesson_id ON lesson_attachments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_accommodations_lesson_id ON lesson_accommodations(lesson_id);

-- Enable Row Level Security
ALTER TABLE lesson_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_accommodations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lesson_standards
CREATE POLICY "Teachers can view their own lesson standards" ON lesson_standards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lessons 
      WHERE lessons.id = lesson_standards.lesson_id 
      AND lessons.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can insert their own lesson standards" ON lesson_standards
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lessons 
      WHERE lessons.id = lesson_standards.lesson_id 
      AND lessons.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update their own lesson standards" ON lesson_standards
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM lessons 
      WHERE lessons.id = lesson_standards.lesson_id 
      AND lessons.teacher_id = auth.uid()
    )
  );

-- RLS Policies for lesson_attachments
CREATE POLICY "Teachers can view their own lesson attachments" ON lesson_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lessons 
      WHERE lessons.id = lesson_attachments.lesson_id 
      AND lessons.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can insert their own lesson attachments" ON lesson_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lessons 
      WHERE lessons.id = lesson_attachments.lesson_id 
      AND lessons.teacher_id = auth.uid()
    )
  );

-- RLS Policies for lesson_accommodations
CREATE POLICY "Teachers can view their own lesson accommodations" ON lesson_accommodations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lessons 
      WHERE lessons.id = lesson_accommodations.lesson_id 
      AND lessons.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can insert their own lesson accommodations" ON lesson_accommodations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lessons 
      WHERE lessons.id = lesson_accommodations.lesson_id 
      AND lessons.teacher_id = auth.uid()
    )
  );

-- Update existing lessons table RLS to include new columns
DROP POLICY IF EXISTS "Teachers can view own lessons" ON lessons;
DROP POLICY IF EXISTS "Teachers can insert own lessons" ON lessons;
DROP POLICY IF EXISTS "Teachers can update own lessons" ON lessons;

CREATE POLICY "Teachers can view own lessons" ON lessons
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can insert own lessons" ON lessons
  FOR INSERT WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update own lessons" ON lessons
  FOR UPDATE USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can archive own lessons" ON lessons
  FOR UPDATE USING (teacher_id = auth.uid() AND status = 'archived');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_lessons_updated_at 
  BEFORE UPDATE ON lessons 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

COMMIT;
