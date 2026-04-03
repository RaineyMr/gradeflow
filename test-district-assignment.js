// Simple test to verify district_id is properly assigned when teachers select schools
// Run this in the browser console to test the onboarding flow

function testDistrictAssignment() {
  console.log('🧪 Testing District Assignment...');
  
  // Get the store state
  const store = window.useStore?.getState?.();
  if (!store) {
    console.error('❌ Store not found. Make sure you run this in the GradeFlow app.');
    return;
  }
  
  // Check if schools have district_id
  const schools = store.schools || [];
  console.log(`📚 Found ${schools.length} schools in the database`);
  
  // Verify each school has a district_id
  const schoolsWithoutDistrict = schools.filter(s => !s.district_id);
  if (schoolsWithoutDistrict.length > 0) {
    console.warn('⚠️ Schools without district_id:', schoolsWithoutDistrict.map(s => s.name));
  } else {
    console.log('✅ All schools have district_id assigned');
  }
  
  // Show some examples of school-district relationships
  console.log('\n📊 School-District Examples:');
  const examples = schools.slice(0, 5);
  examples.forEach(school => {
    console.log(`  ${school.name} → district: ${school.district_id}`);
  });
  
  // Check current user if logged in
  const currentUser = store.currentUser;
  if (currentUser) {
    console.log('\n👤 Current User Info:');
    console.log(`  Name: ${currentUser.name || currentUser.userName}`);
    console.log(`  Role: ${currentUser.role}`);
    console.log(`  School: ${currentUser.school || currentUser.schoolName}`);
    console.log(`  School ID: ${currentUser.school_id}`);
    console.log(`  District ID: ${currentUser.district_id || 'NOT SET'}`);
    
    if (currentUser.role === 'teacher' && currentUser.school_id && !currentUser.district_id) {
      console.warn('⚠️ Teacher is missing district_id! They should complete onboarding.');
    } else if (currentUser.district_id) {
      console.log('✅ User has district_id properly assigned');
      
      // Verify the district_id matches the school's district
      const userSchool = schools.find(s => s.id === currentUser.school_id);
      if (userSchool && userSchool.district_id === currentUser.district_id) {
        console.log('✅ User district_id matches their school district');
      } else if (userSchool) {
        console.warn('⚠️ District mismatch:', {
          userDistrict: currentUser.district_id,
          schoolDistrict: userSchool.district_id
        });
      }
    }
  } else {
    console.log('\n👤 No user logged in');
  }
  
  console.log('\n🎯 Test completed!');
}

// Export for use in browser console
window.testDistrictAssignment = testDistrictAssignment;
console.log('💡 Run testDistrictAssignment() in the console to test district assignment');
