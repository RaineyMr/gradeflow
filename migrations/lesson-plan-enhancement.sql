-- GradeFlow Lesson Plan Enhancement Migration
-- Run this in your Supabase SQL editor to upgrade the lesson plan system

-- ========================================
-- 1. Upgrade existing lessons table
-- ========================================
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS grade_level TEXT,
ADD COLUMN IF NOT EXISTS lesson_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 45,
ADD COLUMN IF NOT EXISTS standards JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS objectives TEXT,
ADD COLUMN IF NOT EXISTS criteria_for_success TEXT,
ADD COLUMN IF NOT EXISTS warm_up TEXT,
ADD COLUMN IF NOT EXISTS direct_instruction TEXT,
ADD COLUMN IF NOT EXISTS guided_practice TEXT,
ADD COLUMN IF NOT EXISTS independent_practice TEXT,
ADD COLUMN IF NOT EXISTS differentiation TEXT,
ADD COLUMN IF NOT EXISTS checks_for_understanding TEXT,
ADD COLUMN IF NOT EXISTS exit_ticket TEXT,
ADD COLUMN IF NOT EXISTS homework TEXT,
ADD COLUMN IF NOT EXISTS attachment_ids JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ai_calls_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_tokens_used INTEGER DEFAULT 0;

-- Add constraint for status validation
ALTER TABLE lessons 
ADD CONSTRAINT IF NOT EXISTS valid_lesson_status 
CHECK (status IN ('draft', 'published', 'archived'));

-- ========================================
-- 2. Create lesson_standards junction table
-- ========================================
CREATE TABLE IF NOT EXISTS lesson_standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  standard_id VARCHAR NOT NULL,
  standard_source VARCHAR NOT NULL,
  standard_label TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(lesson_id, standard_id),
  CONSTRAINT valid_standard_source CHECK (standard_source IN ('TEKS', 'LSS', 'COMMON', 'State', 'District', 'Custom'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lesson_standards_lesson_id ON lesson_standards(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_standards_standard_id ON lesson_standards(standard_id);

-- ========================================
-- 3. Create student_accommodations table (persist from store)
-- ========================================
CREATE TABLE IF NOT EXISTS student_accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  
  accommodation_type VARCHAR NOT NULL,
  specific_needs TEXT,
  start_date DATE,
  end_date DATE,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT valid_accommodation_type CHECK (accommodation_type IN ('IEP', '504', 'ELL', 'Gifted', 'Other'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_student_accommodations_student_id ON student_accommodations(student_id);

-- ========================================
-- 4. Create lesson_accommodations (lesson-specific overrides)
-- ========================================
CREATE TABLE IF NOT EXISTS lesson_accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  
  accommodation_type VARCHAR NOT NULL,
  specific_needs TEXT,
  instructional_adjustments TEXT,
  is_override BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(lesson_id, student_id),
  CONSTRAINT valid_lesson_accommodation_type CHECK (accommodation_type IN ('IEP', '504', 'ELL', 'Gifted', 'Other'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lesson_accommodations_lesson_id ON lesson_accommodations(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_accommodations_student_id ON lesson_accommodations(student_id);

-- ========================================
-- 5. Create lesson_attachments table
-- ========================================
CREATE TABLE IF NOT EXISTS lesson_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  
  file_name VARCHAR NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR,
  file_size_bytes INTEGER,
  
  uploaded_by UUID REFERENCES teachers(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_imported BOOLEAN DEFAULT FALSE,
  
  CONSTRAINT valid_lesson_file_type CHECK (file_type IN ('pdf', 'image', 'document', 'link'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lesson_attachments_lesson_id ON lesson_attachments(lesson_id);

-- ========================================
-- 6. Create standards_catalog table (migrate from JS file)
-- ========================================
CREATE TABLE IF NOT EXISTS standards_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  standard_id VARCHAR UNIQUE NOT NULL,
  standard_source VARCHAR NOT NULL,
  standard_label TEXT NOT NULL,
  grade_levels TEXT[] DEFAULT '{}',
  subject VARCHAR,
  keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT valid_catalog_source CHECK (standard_source IN ('TEKS', 'LSS', 'COMMON', 'State', 'District', 'Custom'))
);

-- Indexes for search performance
CREATE INDEX IF NOT EXISTS idx_standards_catalog_source ON standards_catalog(standard_source);
CREATE INDEX IF NOT EXISTS idx_standards_catalog_subject ON standards_catalog(subject);
CREATE INDEX IF NOT EXISTS idx_standards_catalog_keywords ON standards_catalog USING GIN(keywords);

-- ========================================
-- 7. Create lesson_optional_sections table (school toggles)
-- ========================================
CREATE TABLE IF NOT EXISTS lesson_optional_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES teachers(id), -- Using teachers.id as proxy for now
  section_name VARCHAR NOT NULL,
  is_enabled BOOLEAN DEFAULT FALSE,
  
  UNIQUE(school_id, section_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lesson_optional_sections_school_id ON lesson_optional_sections(school_id);

-- ========================================
-- 8. Enable RLS on new tables
-- ========================================
ALTER TABLE lesson_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE standards_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_optional_sections ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 9. Add RLS Policies
-- ========================================

-- lesson_standards policies
CREATE POLICY "Teachers can manage lesson standards" ON lesson_standards
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM lessons 
    WHERE lessons.id = lesson_standards.lesson_id 
    AND lessons.teacher_id = auth.uid()
  )
);

-- student_accommodations policies
CREATE POLICY "Teachers can view student accommodations" ON student_accommodations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM students s
    JOIN classes c ON s.class_id = c.id
    WHERE s.id = student_accommodations.student_id 
    AND c.teacher_id = auth.uid()
  )
);

CREATE POLICY "Teachers can manage student accommodations" ON student_accommodations
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM students s
    JOIN classes c ON s.class_id = c.id
    WHERE s.id = student_accommodations.student_id 
    AND c.teacher_id = auth.uid()
  )
);

CREATE POLICY "Teachers can update student accommodations" ON student_accommodations
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM students s
    JOIN classes c ON s.class_id = c.id
    WHERE s.id = student_accommodations.student_id 
    AND c.teacher_id = auth.uid()
  )
);

-- lesson_accommodations policies
CREATE POLICY "Teachers can manage lesson accommodations" ON lesson_accommodations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM lessons 
    WHERE lessons.id = lesson_accommodations.lesson_id 
    AND lessons.teacher_id = auth.uid()
  )
);

-- lesson_attachments policies
CREATE POLICY "Teachers can manage lesson attachments" ON lesson_attachments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM lessons 
    WHERE lessons.id = lesson_attachments.lesson_id 
    AND lessons.teacher_id = auth.uid()
  )
);

-- standards_catalog policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can read standards" ON standards_catalog
FOR SELECT
USING (auth.role() = 'authenticated');

-- lesson_optional_sections policies
CREATE POLICY "Teachers can manage optional sections" ON lesson_optional_sections
FOR ALL
USING (school_id = auth.uid());

-- ========================================
-- 10. Update existing lessons table constraints
-- ========================================
-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lessons_teacher_id ON lessons(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lessons_class_id ON lessons(class_id);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON lessons(status);
CREATE INDEX IF NOT EXISTS idx_lessons_lesson_date ON lessons(lesson_date);

-- ========================================
-- 11. Migration Notes
-- ========================================
-- This migration:
-- 1. Preserves all existing lesson data in plan_data JSONB column
-- 2. Adds new structured columns for better querying
-- 3. Adds proper relationships for standards and accommodations
-- 4. Maintains backward compatibility
-- 
-- Next steps after running this migration:
-- 1. Run the standards seed script (separate file)
-- 2. Update React components to use new table structure
-- 3. Update API endpoints to handle new fields
-- 4. Test with existing lesson plans
