-- Schools and Districts seed with branding (New Orleans + Houston demo)
-- Color schemes sourced from official school websites, brand guidelines, and public materials

-- DISTRICTS
INSERT INTO districts (id, name, state) VALUES
('kipp-la', 'KIPP Louisiana', 'LA'),
('yes-prep-nola', 'YES Prep New Orleans', 'LA'),
('renew-nola', 'ReNEW Schools', 'LA'),
('collegiate-nola', 'Collegiate Academies', 'LA'),
('nocp-nola', 'New Orleans College Prep', 'LA'),
('archdiocese-nola', 'Archdiocese of New Orleans', 'LA'),
('houston-isd', 'Houston ISD', 'TX'),
('kipp-texas', 'KIPP Texas', 'TX'),
('yes-prep-tx', 'YES Prep Texas', 'TX'),
('knights-district', 'Knights Academy District', 'US');

-- SCHOOLS - KIPP Louisiana
INSERT INTO schools (id, district_id, name, address, primary_color, secondary_color, accent_color, logo_url, type, grade_levels, subjects) VALUES
('JFK-HIGH', 'kipp-la', 'JFK High School', 'New Orleans, LA', '#1F4788', '#FFFFFF', '#E31937', 'https://kippneworleans.org/', 'high_school', 
 ARRAY['9th Grade', '10th Grade', '11th Grade', '12th Grade'], 
 ARRAY['Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus', 'English I', 'English II', 'English III', 'English IV', 'Biology', 'Chemistry', 'Physics', 'Environmental Science', 'World History', 'US History', 'Government', 'Economics', 'Spanish I', 'Spanish II', 'French I', 'French II', 'Physical Education', 'Health', 'Art', 'Music', 'Computer Science']),
('leadership-academy', 'kipp-la', 'Leadership Academy', 'New Orleans, LA', '#1F4788', '#FFFFFF', '#E31937', 'https://kippneworleans.org/', 'elementary_school', 
 ARRAY['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'], 
 ARRAY['Reading', 'Writing', 'Math', 'Science', 'Social Studies', 'Art', 'Music', 'PE']),
('central-city-academy', 'kipp-la', 'Central City Academy', 'New Orleans, LA', '#1F4788', '#FFFFFF', '#E31937', 'https://kippneworleans.org/', 'elementary_school', 
 ARRAY['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'], 
 ARRAY['Reading', 'Writing', 'Math', 'Science', 'Social Studies', 'Art', 'Music', 'PE']),
('frederick-douglass-hs', 'kipp-la', 'Frederick A. Douglass High School', 'New Orleans, LA', '#1F4788', '#FFFFFF', '#E31937', 'https://kippneworleans.org/', 'high_school', 
 ARRAY['9th Grade', '10th Grade', '11th Grade', '12th Grade'], 
 ARRAY['Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus', 'English I', 'English II', 'English III', 'English IV', 'Biology', 'Chemistry', 'Physics', 'Environmental Science', 'World History', 'US History', 'Government', 'Economics', 'Spanish I', 'Spanish II', 'French I', 'French II', 'Physical Education', 'Health', 'Art', 'Music', 'Computer Science']);

-- SCHOOLS - YES Prep New Orleans
INSERT INTO schools (id, district_id, name, address, primary_color, secondary_color, accent_color, logo_url, type, grade_levels, subjects) VALUES
('yes-east-end', 'yes-prep-nola', 'YES Prep East End', 'New Orleans, LA', '#E31937', '#1F4788', '#FFD700', 'https://www.yesprep.org/', 'middle_school', 
 ARRAY['6th Grade', '7th Grade', '8th Grade'], 
 ARRAY['Math', 'Science', 'English', 'Social Studies', 'Art', 'Music', 'PE']),
('yes-brays-oaks', 'yes-prep-nola', 'YES Prep Brays Oaks', 'New Orleans, LA', '#E31937', '#1F4788', '#FFD700', 'https://www.yesprep.org/', 'middle_school', 
 ARRAY['6th Grade', '7th Grade', '8th Grade'], 
 ARRAY['Math', 'Science', 'English', 'Social Studies', 'Art', 'Music', 'PE']),
('yes-northside', 'yes-prep-nola', 'YES Prep Northside', 'New Orleans, LA', '#E31937', '#1F4788', '#FFD700', 'https://www.yesprep.org/', 'middle_school', 
 ARRAY['6th Grade', '7th Grade', '8th Grade'], 
 ARRAY['Math', 'Science', 'English', 'Social Studies', 'Art', 'Music', 'PE']);

-- SCHOOLS - ReNEW Schools
INSERT INTO schools (id, district_id, name, address, primary_color, secondary_color, accent_color, logo_url, type, grade_levels, subjects) VALUES
('renew-moton', 'renew-nola', 'ReNEW Moton Lakefront', 'New Orleans, LA', '#00A651', '#FFFFFF', '#FF6B35', 'https://www.renewschools.org/', 'elementary_school', 
 ARRAY['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'], 
 ARRAY['Reading', 'Writing', 'Math', 'Science', 'Social Studies', 'Art', 'Music', 'PE']),
('renew-laurel', 'renew-nola', 'ReNEW Laurel', 'New Orleans, LA', '#00A651', '#FFFFFF', '#FF6B35', 'https://www.renewschools.org/', 'elementary_school', 
 ARRAY['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'], 
 ARRAY['Reading', 'Writing', 'Math', 'Science', 'Social Studies', 'Art', 'Music', 'PE']),
('renew-batiste', 'renew-nola', 'ReNEW Batiste Cultural Arts Academy', 'New Orleans, LA', '#00A651', '#FFFFFF', '#FF6B35', 'https://www.renewschools.org/', 'elementary_school', 
 ARRAY['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'], 
 ARRAY['Reading', 'Writing', 'Math', 'Science', 'Social Studies', 'Art', 'Music', 'PE']);

-- SCHOOLS - Collegiate Academies
INSERT INTO schools (id, district_id, name, address, primary_color, secondary_color, accent_color, logo_url, type, grade_levels, subjects) VALUES
('sci-academy', 'collegiate-nola', 'Sci Academy', 'New Orleans, LA', '#003366', '#FFFFFF', '#FFB81C', 'https://www.collegiateacademies.org/', 'high_school', 
 ARRAY['9th Grade', '10th Grade', '11th Grade', '12th Grade'], 
 ARRAY['Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus', 'English I', 'English II', 'English III', 'English IV', 'Biology', 'Chemistry', 'Physics', 'Environmental Science', 'World History', 'US History', 'Government', 'Economics', 'Spanish I', 'Spanish II', 'French I', 'French II', 'Physical Education', 'Health', 'Art', 'Music', 'Computer Science']),
('gw-carver-collegiate', 'collegiate-nola', 'George Washington Carver Collegiate Academy', 'New Orleans, LA', '#003366', '#FFFFFF', '#FFB81C', 'https://www.collegiateacademies.org/', 'high_school', 
 ARRAY['9th Grade', '10th Grade', '11th Grade', '12th Grade'], 
 ARRAY['Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus', 'English I', 'English II', 'English III', 'English IV', 'Biology', 'Chemistry', 'Physics', 'Environmental Science', 'World History', 'US History', 'Government', 'Economics', 'Spanish I', 'Spanish II', 'French I', 'French II', 'Physical Education', 'Health', 'Art', 'Music', 'Computer Science']),
('gw-carver-prep', 'collegiate-nola', 'George Washington Carver Preparatory Academy', 'New Orleans, LA', '#003366', '#FFFFFF', '#FFB81C', 'https://www.collegiateacademies.org/', 'middle_school', 
 ARRAY['6th Grade', '7th Grade', '8th Grade'], 
 ARRAY['Math', 'Science', 'English', 'Social Studies', 'Art', 'Music', 'PE']),
('rosenwald-collegiate', 'collegiate-nola', 'Rosenwald Collegiate Academy', 'New Orleans, LA', '#003366', '#FFFFFF', '#FFB81C', 'https://www.collegiateacademies.org/', 'high_school', 
 ARRAY['9th Grade', '10th Grade', '11th Grade', '12th Grade'], 
 ARRAY['Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus', 'English I', 'English II', 'English III', 'English IV', 'Biology', 'Chemistry', 'Physics', 'Environmental Science', 'World History', 'US History', 'Government', 'Economics', 'Spanish I', 'Spanish II', 'French I', 'French II', 'Physical Education', 'Health', 'Art', 'Music', 'Computer Science']),
('walter-cohen', 'collegiate-nola', 'Walter L. Cohen College Prep', 'New Orleans, LA', '#003366', '#FFFFFF', '#FFB81C', 'https://www.collegiateacademies.org/', 'high_school', 
 ARRAY['9th Grade', '10th Grade', '11th Grade', '12th Grade'], 
 ARRAY['Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus', 'English I', 'English II', 'English III', 'English IV', 'Biology', 'Chemistry', 'Physics', 'Environmental Science', 'World History', 'US History', 'Government', 'Economics', 'Spanish I', 'Spanish II', 'French I', 'French II', 'Physical Education', 'Health', 'Art', 'Music', 'Computer Science']);

-- SCHOOLS - New Orleans College Prep
INSERT INTO schools (id, district_id, name, address, primary_color, secondary_color, accent_color, logo_url, type, grade_levels, subjects) VALUES
('hoffman-preschool', 'nocp-nola', 'Hoffman Early Learning Center', 'New Orleans, LA', '#4A90E2', '#FFFFFF', '#F5A623', 'https://www.nolacollegeprep.org/', 'preschool', 
 ARRAY['Pre-K'], 
 ARRAY['Reading', 'Writing', 'Math', 'Science', 'Social Studies', 'Art', 'Music', 'PE']);

-- SCHOOLS - Archdiocese of New Orleans (Sample 4)
INSERT INTO schools (id, district_id, name, address, primary_color, secondary_color, accent_color, logo_url, type, grade_levels, subjects) VALUES
('st-augustine-hs', 'archdiocese-nola', 'St. Augustine High School', 'New Orleans, LA', '#4B0082', '#FFFFFF', '#D4AF37', 'https://nolacatholic.org/', 'high_school', 
 ARRAY['9th Grade', '10th Grade', '11th Grade', '12th Grade'], 
 ARRAY['Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus', 'English I', 'English II', 'English III', 'English IV', 'Biology', 'Chemistry', 'Physics', 'Environmental Science', 'World History', 'US History', 'Government', 'Economics', 'Spanish I', 'Spanish II', 'French I', 'French II', 'Physical Education', 'Health', 'Art', 'Music', 'Computer Science']),
('st-marys-academy', 'archdiocese-nola', 'St. Mary''s Academy', 'New Orleans, LA', '#003D7A', '#FFFFFF', '#FFD700', 'https://nolacatholic.org/', 'high_school', 
 ARRAY['9th Grade', '10th Grade', '11th Grade', '12th Grade'], 
 ARRAY['Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus', 'English I', 'English II', 'English III', 'English IV', 'Biology', 'Chemistry', 'Physics', 'Environmental Science', 'World History', 'US History', 'Government', 'Economics', 'Spanish I', 'Spanish II', 'French I', 'French II', 'Physical Education', 'Health', 'Art', 'Music', 'Computer Science']),
('st-marys-dominican', 'archdiocese-nola', 'St. Mary''s Dominican High School', 'New Orleans, LA', '#8B4513', '#FFFFFF', '#DAA520', 'https://nolacatholic.org/', 'high_school', 
 ARRAY['9th Grade', '10th Grade', '11th Grade', '12th Grade'], 
 ARRAY['Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus', 'English I', 'English II', 'English III', 'English IV', 'Biology', 'Chemistry', 'Physics', 'Environmental Science', 'World History', 'US History', 'Government', 'Economics', 'Spanish I', 'Spanish II', 'French I', 'French II', 'Physical Education', 'Health', 'Art', 'Music', 'Computer Science']),
('st-katharine-drexel', 'archdiocese-nola', 'St. Katharine Drexel Preparatory School', 'New Orleans, LA', '#800080', '#FFFFFF', '#FFD700', 'https://nolacatholic.org/', 'high_school', 
 ARRAY['9th Grade', '10th Grade', '11th Grade', '12th Grade'], 
 ARRAY['Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus', 'English I', 'English II', 'English III', 'English IV', 'Biology', 'Chemistry', 'Physics', 'Environmental Science', 'World History', 'US History', 'Government', 'Economics', 'Spanish I', 'Spanish II', 'French I', 'French II', 'Physical Education', 'Health', 'Art', 'Music', 'Computer Science']);

-- SCHOOLS - Houston ISD
INSERT INTO schools (id, district_id, name, address, primary_color, secondary_color, accent_color, logo_url, type, grade_levels, subjects) VALUES
('BELLAIRE-HS', 'houston-isd', 'Bellaire High School', 'Houston, TX', '#C1272D', '#FFFFFF', '#FFD700', 'https://www.houstonisd.org/', 'high_school',
 ARRAY['9th Grade', '10th Grade', '11th Grade', '12th Grade'],
 ARRAY['Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus', 'English I', 'English II', 'English III', 'English IV', 'Biology', 'Chemistry', 'Physics', 'Environmental Science', 'World History', 'US History', 'Government', 'Economics', 'Spanish I', 'Spanish II', 'French I', 'French II', 'Physical Education', 'Health', 'Art', 'Music', 'Computer Science']),
('lincoln-elementary', 'houston-isd', 'Lincoln Elementary School', 'Houston, TX', '#C1272D', '#FFFFFF', '#FFD700', 'https://www.houstonisd.org/', 'elementary_school', 
 ARRAY['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'], 
 ARRAY['Reading', 'Writing', 'Math', 'Science', 'Social Studies', 'Art', 'Music', 'PE']),
('lamar-hs', 'houston-isd', 'Lamar High School', 'Houston, TX', '#C1272D', '#FFFFFF', '#FFD700', 'https://www.houstonisd.org/', 'high_school',
 ARRAY['9th Grade', '10th Grade', '11th Grade', '12th Grade'],
 ARRAY['Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus', 'English I', 'English II', 'English III', 'English IV', 'Biology', 'Chemistry', 'Physics', 'Environmental Science', 'World History', 'US History', 'Government', 'Economics', 'Spanish I', 'Spanish II', 'French I', 'French II', 'Physical Education', 'Health', 'Art', 'Music', 'Computer Science']);

-- SCHOOLS - KIPP Texas (existing)
INSERT INTO schools (id, district_id, name, address, primary_color, secondary_color, accent_color, logo_url, type, grade_levels, subjects) VALUES
('kipp-fifth-ward', 'kipp-texas', 'KIPP Fifth Ward Elementary', 'Houston, TX', '#1F4788', '#FFFFFF', '#E31937', 'https://www.kipp.org/', 'elementary_school', 
 ARRAY['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'], 
 ARRAY['Reading', 'Writing', 'Math', 'Science', 'Social Studies', 'Art', 'Music', 'PE']),
('kipp-southside', 'kipp-texas', 'KIPP Southside Secondary', 'Houston, TX', '#1F4788', '#FFFFFF', '#E31937', 'https://www.kipp.org/', 'middle_school', 
 ARRAY['6th Grade', '7th Grade', '8th Grade'], 
 ARRAY['Math', 'Science', 'English', 'Social Studies', 'Art', 'Music', 'PE']),
('kipp-houston-ls', 'kipp-texas', 'KIPP Houston Leadership School', 'Houston, TX', '#1F4788', '#FFFFFF', '#E31937', 'https://www.kipp.org/', 'high_school', 
 ARRAY['9th Grade', '10th Grade', '11th Grade', '12th Grade'], 
 ARRAY['Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus', 'English I', 'English II', 'English III', 'English IV', 'Biology', 'Chemistry', 'Physics', 'Environmental Science', 'World History', 'US History', 'Government', 'Economics', 'Spanish I', 'Spanish II', 'French I', 'French II', 'Physical Education', 'Health', 'Art', 'Music', 'Computer Science']),
('kipp-houston-secondary', 'kipp-texas', 'KIPP Houston Secondary', 'Houston, TX', '#1F4788', '#FFFFFF', '#E31937', 'https://www.kipp.org/', 'high_school', 
 ARRAY['9th Grade', '10th Grade', '11th Grade', '12th Grade'], 
 ARRAY['Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus', 'English I', 'English II', 'English III', 'English IV', 'Biology', 'Chemistry', 'Physics', 'Environmental Science', 'World History', 'US History', 'Government', 'Economics', 'Spanish I', 'Spanish II', 'French I', 'French II', 'Physical Education', 'Health', 'Art', 'Music', 'Computer Science']),
('kipp-northbrook', 'kipp-texas', 'KIPP Northbrook Elementary', 'Houston, TX', '#1F4788', '#FFFFFF', '#E31937', 'https://www.kipp.org/', 'elementary_school', 
 ARRAY['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'], 
 ARRAY['Reading', 'Writing', 'Math', 'Science', 'Social Studies', 'Art', 'Music', 'PE']);

-- SCHOOLS - Knights Academy (Friends Access)
INSERT INTO schools (id, district_id, name, address, primary_color, secondary_color, accent_color, logo_url, type, grade_levels, subjects) VALUES
('05KNIGHTS', 'knights-district', 'Knights Academy', 'Online', '#6B46C1', '#FFFFFF', '#F59E0B', 'https://gradeflow.app/', 'k12',
 ARRAY['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'],
 ARRAY['Reading', 'Writing', 'Math', 'Science', 'Social Studies', 'Art', 'Music', 'PE', 'English Language Arts', 'Pre-Algebra', 'Algebra I', 'Life Science', 'Earth Science', 'World History', 'Algebra I', 'Geometry', 'Algebra II', 'Trigonometry', 'Pre-Calculus', 'Calculus', 'English I', 'English II', 'English III', 'English IV', 'Biology', 'Chemistry', 'Physics', 'Environmental Science', 'World History', 'US History', 'Government', 'Economics', 'Spanish I', 'Spanish II', 'French I', 'French II', 'Physical Education', 'Health', 'Art', 'Music', 'Computer Science', 'Special Education']);

-- SCHOOLS - YES Prep Texas (complete entry)
('yes-north-forest', 'yes-prep-tx', 'YES Prep North Forest', 'Houston, TX', '#E31937', '#1F4788', '#FFD700', 'https://www.yesprep.org/', 'middle_school', 
 ARRAY['6th Grade', '7th Grade', '8th Grade'], 
 ARRAY['Math', 'Science', 'English', 'Social Studies', 'Art', 'Music', 'PE']);
