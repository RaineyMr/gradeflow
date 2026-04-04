-- Standards Catalog Seed Script
-- Run this after the lesson-plan-enhancement.sql migration
-- This populates the standards_catalog table with existing TEKS data

-- ========================================
-- Insert TEKS Standards from existing data
-- ========================================

-- Math Standards
INSERT INTO standards_catalog (standard_id, standard_source, standard_label, grade_levels, subject, keywords) VALUES
-- Kindergarten Math
('K.2.A', 'TEKS', 'Count forward and backward to at least 20 with and without objects.', ARRAY['Kindergarten'], 'Math', ARRAY['count', 'backward', 'forward', 'objects', '20']),
('K.2.B', 'TEKS', 'Read, write, and represent whole numbers from 0 to at least 20 with and without objects or pictures.', ARRAY['Kindergarten'], 'Math', ARRAY['read', 'write', 'represent', 'whole numbers', 'pictures']),
('K.3.A', 'TEKS', 'Compose and decompose numbers up to 10 with objects and pictures.', ARRAY['Kindergarten'], 'Math', ARRAY['compose', 'decompose', 'numbers', 'objects', 'pictures']),

-- 1st Grade Math  
('1.2.A', 'TEKS', 'Recognize instantly the quantity of structured arrangements.', ARRAY['1st Grade'], 'Math', ARRAY['recognize', 'quantity', 'structured', 'arrangements']),

-- Add more standards as needed from your existing data
-- This is a starter - you'll want to import all your TEKS standards

-- ========================================
-- Louisiana Student Standards (LSS)
-- ========================================
INSERT INTO standards_catalog (standard_id, standard_source, standard_label, grade_levels, subject, keywords) VALUES
-- Add LSS standards here if you have them

-- ========================================
-- Common Core Standards (placeholder)
-- ========================================
INSERT INTO standards_catalog (standard_id, standard_source, standard_label, grade_levels, subject, keywords) VALUES
-- Add Common Core standards here if needed
('CCSS.MATH.CONTENT.K.CC.A', 'COMMON', 'Know number names and the count sequence.', ARRAY['Kindergarten'], 'Math', ARRAY['number names', 'count sequence', 'counting']),

-- ========================================
-- Enable Optional Sections for Demo School
-- ========================================
-- Enable some optional sections by default (you can adjust per school)
INSERT INTO lesson_optional_sections (school_id, section_name, is_enabled) VALUES
-- Using a sample teacher ID - replace with actual school/teacher mapping
('00000000-0000-0000-0000-000000000000', 'materials_list', TRUE),
('00000000-0000-0000-0000-000000000000', 'vocabulary', TRUE),
('00000000-0000-0000-0000-000000000000', 'elps_supports', FALSE),
('00000000-0000-0000-0000-000000000000', 'technology', FALSE),
('00000000-0000-0000-0000-000000000000', 'assessment_plan', FALSE),
('00000000-0000-0000-0000-000000000000', 'anticipatory_set', FALSE),
('00000000-0000-0000-0000-000000000000', 'reflection', FALSE);

-- ========================================
-- Notes for Implementation
-- ========================================
-- 1. Update the school_id in lesson_optional_sections to match your actual schools table
-- 2. Add all TEKS standards from your src/data/standards.js file
-- 3. Consider writing a script to automatically convert the JS standards to SQL inserts
-- 4. Test the search functionality with different grade levels and subjects
-- 5. Update the StandardsSelector component to query from this new table

-- To verify the seed worked:
-- SELECT COUNT(*) FROM standards_catalog;
-- SELECT * FROM standards_catalog WHERE standard_source = 'TEKS' LIMIT 5;
