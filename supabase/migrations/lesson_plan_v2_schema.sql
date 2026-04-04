-- supabase/migrations/lesson_plan_v2_schema.sql
-- ─── GradeFlow Lesson Plan v2 Schema Migration ─────────────────────────────
-- Adds support for the 10-section lesson plan model with CFS, proper lesson
-- steps (6 substeps), optional add-ons, and per-section AI tracking.

-- 1. Ensure lessons table has all required columns
-- (Run this carefully - it will only add missing columns, not modify existing ones)

ALTER TABLE lessons ADD COLUMN IF NOT EXISTS cultural_notes TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS criteria_for_success TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS closure TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS extension TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS homework_assignment TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS homework_due_date DATE;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS homework_max_points INTEGER;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS accommodations_notes TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS enrichment_activities TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS supplemental_links TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS teacher_reflections TEXT;

-- 2. Create lesson_standards junction table if it doesn't exist
-- This stores the many-to-many relationship between lessons and standards

CREATE TABLE IF NOT EXISTS lesson_standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  standard_id VARCHAR(50) NOT NULL,
  standard_source VARCHAR(50) DEFAULT 'TEKS', -- TEKS, LSS, COMMON, etc.
  standard_label TEXT, -- Full text of the standard
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(lesson_id, standard_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_lesson_standards_lesson_id ON lesson_standards(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_standards_standard_id ON lesson_standards(standard_id);

-- 3. Create lesson_attachments table if it doesn't exist
-- Stores file references for worksheets, PDFs, images, etc.

CREATE TABLE IF NOT EXISTS lesson_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50), -- pdf, doc, image, etc.
  file_url TEXT, -- URL to the file in Supabase Storage or external CDN
  file_size_bytes INTEGER,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  uploaded_by UUID, -- User who uploaded
  
  UNIQUE(lesson_id, file_name)
);

CREATE INDEX IF NOT EXISTS idx_lesson_attachments_lesson_id ON lesson_attachments(lesson_id);

-- 4. Create lesson_accommodations table if it doesn't exist
-- Stores lesson-specific accommodation overrides for individual students

CREATE TABLE IF NOT EXISTS lesson_accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  accommodation_type VARCHAR(50), -- IEP, 504, ELL, Gifted, Other
  specific_needs TEXT, -- Comma-separated or detailed description
  instructional_adjustments TEXT, -- AI-generated or teacher-written suggestions
  is_override BOOLEAN DEFAULT FALSE, -- TRUE = override student profile; FALSE = inherit from profile
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(lesson_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_accommodations_lesson_id ON lesson_accommodations(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_accommodations_student_id ON lesson_accommodations(student_id);

-- 5. Row-Level Security (RLS) Policies

-- RLS for lesson_standards
ALTER TABLE lesson_standards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view/manage their lesson standards" ON lesson_standards
  FOR ALL USING (
    auth.uid() IN (
      SELECT teacher_id FROM lessons WHERE id = lesson_standards.lesson_id
    )
  );

-- RLS for lesson_attachments
ALTER TABLE lesson_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view/manage their lesson attachments" ON lesson_attachments
  FOR ALL USING (
    auth.uid() IN (
      SELECT teacher_id FROM lessons WHERE id = lesson_attachments.lesson_id
    )
  );

-- RLS for lesson_accommodations
ALTER TABLE lesson_accommodations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view/manage lesson accommodations" ON lesson_accommodations
  FOR ALL USING (
    auth.uid() IN (
      SELECT teacher_id FROM lessons WHERE id = lesson_accommodations.lesson_id
    )
  );

-- 6. Create lesson_full_view for efficient querying
CREATE OR REPLACE VIEW lesson_full_view AS
SELECT 
  l.*,
  -- Standards as JSON array
  COALESCE(
    JSON_AGG(
      JSON_BUILD_OBJECT(
        'id', ls.standard_id,
        'source', ls.standard_source,
        'label', ls.standard_label
      )
    ) FILTER (WHERE ls.id IS NOT NULL),
    '[]'::json
  ) as standards,
  -- Attachments count
  (SELECT COUNT(*) FROM lesson_attachments la WHERE la.lesson_id = l.id) as attachments_count,
  -- Accommodations count
  (SELECT COUNT(*) FROM lesson_accommodations lac WHERE lac.lesson_id = l.id) as accommodations_count
FROM lessons l
LEFT JOIN lesson_standards ls ON l.id = ls.lesson_id
GROUP BY l.id;

-- 7. Optional: Audit logging trigger (uncomment if needed)
/*
CREATE OR REPLACE FUNCTION audit_lesson_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (table_name, operation, record_id, old_data, new_data, user_id, timestamp)
    VALUES ('lessons', 'INSERT', NEW.id, NULL, row_to_json(NEW), auth.uid(), NOW());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (table_name, operation, record_id, old_data, new_data, user_id, timestamp)
    VALUES ('lessons', 'UPDATE', NEW.id, row_to_json(OLD), row_to_json(NEW), auth.uid(), NOW());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (table_name, operation, record_id, old_data, new_data, user_id, timestamp)
    VALUES ('lessons', 'DELETE', OLD.id, row_to_json(OLD), NULL, auth.uid(), NOW());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER lesson_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON lessons
  FOR EACH ROW EXECUTE FUNCTION audit_lesson_changes();
*/
