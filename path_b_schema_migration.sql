-- Path B: Full Schema Migration with Schools/Districts and Branding
-- Adds districts, schools tables with color branding for dashboard theming

-- Create districts table
CREATE TABLE districts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create schools table with branding fields
CREATE TABLE schools (
  id TEXT PRIMARY KEY,
  district_id TEXT NOT NULL REFERENCES districts(id),
  name TEXT NOT NULL,
  address TEXT,
  primary_color VARCHAR(7),      -- Hex color for primary branding
  secondary_color VARCHAR(7),    -- Hex color for secondary branding
  accent_color VARCHAR(7),       -- Hex color for accents
  logo_url TEXT,                 -- URL to school logo
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(district_id, name)
);

-- Add school_id FK and branding to teachers table
ALTER TABLE teachers ADD COLUMN school_id TEXT REFERENCES schools(id);
ALTER TABLE teachers ADD COLUMN grade_level INT CHECK (grade_level BETWEEN 0 AND 12);
ALTER TABLE teachers ADD COLUMN subject VARCHAR(100);

-- Create RLS policies for schools (teachers can see their own school)
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "schools_readable_by_users"
  ON schools FOR SELECT
  USING (TRUE);  -- All authenticated users can view all schools

-- Create indexes for performance
CREATE INDEX idx_schools_district ON schools(district_id);
CREATE INDEX idx_teachers_school ON teachers(school_id);

-- Data migration: Backfill existing teachers with new school records
-- This will be done in separate migration script after schema is created
