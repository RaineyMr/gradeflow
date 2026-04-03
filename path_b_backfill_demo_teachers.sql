-- Path B: Backfill Demo Teachers with School Data
-- Maps existing teachers to their school records with branding

-- Update Ms. Johnson (KIPP New Orleans teacher) → JFK High
UPDATE teachers 
SET school_id = 'jfk-high',
    grade_level = 11,
    subject = 'English Language Arts'
WHERE email = 'teacher@kippneworleans.org';

-- Update Ms. Thompson (Bellaire, Houston ISD) → Bellaire High School
UPDATE teachers 
SET school_id = 'bellaire-hs',
    grade_level = 10,
    subject = 'Mathematics'
WHERE email = 'parent@bellaire.org';

-- Update Principal Carter (Lamar High School, Houston ISD) → Lamar High
UPDATE teachers 
SET school_id = 'lamar-hs',
    grade_level = 12,
    subject = 'Social Studies'
WHERE email = 'admin@lamarhs.org';

-- DO NOT UPDATE Marcus Thompson (student record — skip entirely)
-- His email is student@houstonisd.org and is_student=true

-- Verify backfill
SELECT id, name, email, school_id, grade_level, subject FROM teachers WHERE school_id IS NOT NULL;
