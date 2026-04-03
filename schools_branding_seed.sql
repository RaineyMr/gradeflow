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
INSERT INTO schools (id, district_id, name, address, primary_color, secondary_color, accent_color, logo_url) VALUES
('jfk-high', 'kipp-la', 'JFK High School', 'New Orleans, LA', '#1F4788', '#FFFFFF', '#E31937', 'https://kippneworleans.org/'),
('leadership-academy', 'kipp-la', 'Leadership Academy', 'New Orleans, LA', '#1F4788', '#FFFFFF', '#E31937', 'https://kippneworleans.org/'),
('central-city-academy', 'kipp-la', 'Central City Academy', 'New Orleans, LA', '#1F4788', '#FFFFFF', '#E31937', 'https://kippneworleans.org/'),
('frederick-douglass-hs', 'kipp-la', 'Frederick A. Douglass High School', 'New Orleans, LA', '#1F4788', '#FFFFFF', '#E31937', 'https://kippneworleans.org/');

-- SCHOOLS - YES Prep New Orleans
INSERT INTO schools (id, district_id, name, address, primary_color, secondary_color, accent_color, logo_url) VALUES
('yes-east-end', 'yes-prep-nola', 'YES Prep East End', 'New Orleans, LA', '#E31937', '#1F4788', '#FFD700', 'https://www.yesprep.org/'),
('yes-brays-oaks', 'yes-prep-nola', 'YES Prep Brays Oaks', 'New Orleans, LA', '#E31937', '#1F4788', '#FFD700', 'https://www.yesprep.org/'),
('yes-northside', 'yes-prep-nola', 'YES Prep Northside', 'New Orleans, LA', '#E31937', '#1F4788', '#FFD700', 'https://www.yesprep.org/');

-- SCHOOLS - ReNEW Schools
INSERT INTO schools (id, district_id, name, address, primary_color, secondary_color, accent_color, logo_url) VALUES
('renew-moton', 'renew-nola', 'ReNEW Moton Lakefront', 'New Orleans, LA', '#00A651', '#FFFFFF', '#FF6B35', 'https://www.renewschools.org/'),
('renew-laurel', 'renew-nola', 'ReNEW Laurel', 'New Orleans, LA', '#00A651', '#FFFFFF', '#FF6B35', 'https://www.renewschools.org/'),
('renew-batiste', 'renew-nola', 'ReNEW Batiste Cultural Arts Academy', 'New Orleans, LA', '#00A651', '#FFFFFF', '#FF6B35', 'https://www.renewschools.org/');

-- SCHOOLS - Collegiate Academies
INSERT INTO schools (id, district_id, name, address, primary_color, secondary_color, accent_color, logo_url) VALUES
('sci-academy', 'collegiate-nola', 'Sci Academy', 'New Orleans, LA', '#003366', '#FFFFFF', '#FFB81C', 'https://www.collegiateacademies.org/'),
('gw-carver-collegiate', 'collegiate-nola', 'George Washington Carver Collegiate Academy', 'New Orleans, LA', '#003366', '#FFFFFF', '#FFB81C', 'https://www.collegiateacademies.org/'),
('gw-carver-prep', 'collegiate-nola', 'George Washington Carver Preparatory Academy', 'New Orleans, LA', '#003366', '#FFFFFF', '#FFB81C', 'https://www.collegiateacademies.org/'),
('rosenwald-collegiate', 'collegiate-nola', 'Rosenwald Collegiate Academy', 'New Orleans, LA', '#003366', '#FFFFFF', '#FFB81C', 'https://www.collegiateacademies.org/'),
('walter-cohen', 'collegiate-nola', 'Walter L. Cohen College Prep', 'New Orleans, LA', '#003366', '#FFFFFF', '#FFB81C', 'https://www.collegiateacademies.org/');

-- SCHOOLS - New Orleans College Prep
INSERT INTO schools (id, district_id, name, address, primary_color, secondary_color, accent_color, logo_url) VALUES
('hoffman-preschool', 'nocp-nola', 'Hoffman Early Learning Center', 'New Orleans, LA', '#4A90E2', '#FFFFFF', '#F5A623', 'https://www.nolacollegeprep.org/');

-- SCHOOLS - Archdiocese of New Orleans (Sample 4)
INSERT INTO schools (id, district_id, name, address, primary_color, secondary_color, accent_color, logo_url) VALUES
('st-augustine-hs', 'archdiocese-nola', 'St. Augustine High School', 'New Orleans, LA', '#006B3F', '#FFFFFF', '#D4AF37', 'https://nolacatholic.org/'),
('st-marys-academy', 'archdiocese-nola', 'St. Mary''s Academy', 'New Orleans, LA', '#003D7A', '#FFFFFF', '#FFD700', 'https://nolacatholic.org/'),
('st-marys-dominican', 'archdiocese-nola', 'St. Mary''s Dominican High School', 'New Orleans, LA', '#8B4513', '#FFFFFF', '#DAA520', 'https://nolacatholic.org/'),
('st-katharine-drexel', 'archdiocese-nola', 'St. Katharine Drexel Preparatory School', 'New Orleans, LA', '#800080', '#FFFFFF', '#FFD700', 'https://nolacatholic.org/');

-- SCHOOLS - Houston ISD (existing)
INSERT INTO schools (id, district_id, name, address, primary_color, secondary_color, accent_color, logo_url) VALUES
('bellaire-hs', 'houston-isd', 'Bellaire High School', 'Houston, TX', '#C1272D', '#FFFFFF', '#FFD700', 'https://www.houstonisd.org/'),
('lincoln-elementary', 'houston-isd', 'Lincoln Elementary School', 'Houston, TX', '#C1272D', '#FFFFFF', '#FFD700', 'https://www.houstonisd.org/'),
('lamar-hs', 'houston-isd', 'Lamar High School', 'Houston, TX', '#C1272D', '#FFFFFF', '#FFD700', 'https://www.houstonisd.org/');

-- SCHOOLS - KIPP Texas (existing)
INSERT INTO schools (id, district_id, name, address, primary_color, secondary_color, accent_color, logo_url) VALUES
('kipp-fifth-ward', 'kipp-texas', 'KIPP Fifth Ward Elementary', 'Houston, TX', '#1F4788', '#FFFFFF', '#E31937', 'https://www.kipp.org/'),
('kipp-southside', 'kipp-texas', 'KIPP Southside Secondary', 'Houston, TX', '#1F4788', '#FFFFFF', '#E31937', 'https://www.kipp.org/'),
('kipp-houston-ls', 'kipp-texas', 'KIPP Houston Leadership School', 'Houston, TX', '#1F4788', '#FFFFFF', '#E31937', 'https://www.kipp.org/'),
('kipp-houston-secondary', 'kipp-texas', 'KIPP Houston Secondary', 'Houston, TX', '#1F4788', '#FFFFFF', '#E31937', 'https://www.kipp.org/'),
('kipp-northbrook', 'kipp-texas', 'KIPP Northbrook Elementary', 'Houston, TX', '#1F4788', '#FFFFFF', '#E31937', 'https://www.kipp.org/');

-- SCHOOLS - YES Prep Texas (existing)
INSERT INTO schools (id, district_id, name, address, primary_color, secondary_color, accent_color, logo_url) VALUES
('yes-eisenhower', 'yes-prep-tx', 'YES Prep Eisenhower', 'Houston, TX', '#E31937', '#1F4788', '#FFD700', 'https://www.yesprep.org/'),
('yes-south-secondary', 'yes-prep-tx', 'YES Prep Southside Secondary', 'Houston, TX', '#E31937', '#1F4788', '#FFD700', 'https://www.yesprep.org/'),
('yes-west-secondary', 'yes-prep-tx', 'YES Prep West Secondary', 'Houston, TX', '#E31937', '#1F4788', '#FFD700', 'https://www.yesprep.org/'),
('yes-north-forest', 'yes-prep-tx', 'YES Prep North Forest', 'Houston, TX', '#E31937', '#1F4788', '#FFD700', 'https://www.yesprep.org/');

-- SCHOOLS - Knights Academy (Friends Access)
INSERT INTO schools (id, district_id, name, address, primary_color, secondary_color, accent_color, logo_url) VALUES
('05KNIGHTS', 'knights-district', 'Knights Academy', 'Online', '#6B46C1', '#FFFFFF', '#F59E0B', 'https://gradeflow.app/');
