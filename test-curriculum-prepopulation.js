// Test script for Curriculum Prepopulation Feature
// Run this to validate the complete implementation

const { createClient } = require('@supabase/supabase-js')

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://localhost:54321'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Test data
const testTeacher = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'test.teacher@example.com',
  name: 'Test Teacher'
}

const testClass = {
  id: '00000000-0000-0000-0000-000000000001',
  teacher_id: testTeacher.id,
  subject: 'Math',
  grade_level: '6th Grade',
  period: '1st'
}

// Test cases
async function runTests() {
  console.log('🧪 Starting Curriculum Prepopulation Tests...\n')

  try {
    // Test 1: Database Schema Validation
    console.log('📋 Test 1: Database Schema Validation')
    await testDatabaseSchema()

    // Test 2: Standards Data Validation
    console.log('\n📚 Test 2: Standards Data Validation')
    await testStandardsData()

    // Test 3: API Endpoint Validation
    console.log('\n🔌 Test 3: API Endpoint Validation')
    await testAPIEndpoint()

    // Test 4: RLS Policies Validation
    console.log('\n🔒 Test 4: RLS Policies Validation')
    await testRLSPolicies()

    // Test 5: Edge Cases
    console.log('\n⚠️ Test 5: Edge Cases')
    await testEdgeCases()

    console.log('\n✅ All tests completed!')

  } catch (error) {
    console.error('\n❌ Test suite failed:', error)
  }
}

async function testDatabaseSchema() {
  console.log('  Checking database schema...')

  // Check required tables exist
  const tables = ['standards_catalog', 'lessons', 'lesson_standards', 'classes']
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1)
      if (error) {
        console.log(`  ❌ Table ${table} error:`, error.message)
      } else {
        console.log(`  ✅ Table ${table} exists`)
      }
    } catch (err) {
      console.log(`  ❌ Table ${table} not accessible:`, err.message)
    }
  }

  // Check lesson_standards junction table structure
  try {
    const { data, error } = await supabase
      .from('lesson_standards')
      .select('*')
      .limit(1)
    
    if (!error) {
      console.log('  ✅ lesson_standards junction table accessible')
    }
  } catch (err) {
    console.log('  ❌ lesson_standards junction table error:', err.message)
  }
}

async function testStandardsData() {
  console.log('  Checking standards data...')

  // Test TEKS standards
  const { data: teksStandards, error: teksError } = await supabase
    .from('standards_catalog')
    .select('*')
    .eq('standard_source', 'TEKS')
    .limit(5)

  if (teksError) {
    console.log('  ❌ TEKS standards error:', teksError.message)
  } else {
    console.log(`  ✅ Found ${teksStandards.length} TEKS standards`)
  }

  // Test Louisiana standards
  const { data: lssStandards, error: lssError } = await supabase
    .from('standards_catalog')
    .select('*')
    .eq('standard_source', 'LSS')
    .limit(5)

  if (lssError) {
    console.log('  ❌ Louisiana standards error:', lssError.message)
  } else {
    console.log(`  ✅ Found ${lssStandards.length} Louisiana standards`)
  }

  // Test standards filtering by grade and subject
  const { data: filteredStandards, error: filterError } = await supabase
    .from('standards_catalog')
    .select('*')
    .eq('subject', 'Math')
    .contains('grade_levels', ['6th Grade'])
    .limit(5)

  if (filterError) {
    console.log('  ❌ Standards filtering error:', filterError.message)
  } else {
    console.log(`  ✅ Found ${filteredStandards.length} Math standards for 6th Grade`)
  }
}

async function testAPIEndpoint() {
  console.log('  Testing API endpoint...')

  const testData = {
    teacher_id: testTeacher.id,
    class_id: testClass.id,
    start_date: '2024-01-08',
    end_date: '2024-01-12',
    lessons_per_standard: 1,
    skip_existing: true
  }

  try {
    const response = await fetch('/api/curriculum/prepopulate-lessons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testTeacher.id}`
      },
      body: JSON.stringify(testData)
    })

    if (response.ok) {
      const result = await response.json()
      console.log('  ✅ API endpoint responds correctly')
      console.log(`  📊 Created ${result.created_count} lessons`)
    } else {
      const error = await response.json()
      console.log('  ❌ API endpoint error:', error.error || 'Unknown error')
    }
  } catch (err) {
    console.log('  ❌ API endpoint not accessible:', err.message)
  }
}

async function testRLSPolicies() {
  console.log('  Testing RLS policies...')

  // Test 1: Teacher can access own classes
  try {
    const { data: ownClass, error: ownError } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', testTeacher.id)
      .limit(1)

    if (ownError) {
      console.log('  ❌ Teacher cannot access own classes:', ownError.message)
    } else {
      console.log('  ✅ Teacher can access own classes')
    }
  } catch (err) {
    console.log('  ❌ RLS test error:', err.message)
  }

  // Test 2: Teacher cannot access other teacher's classes
  try {
    const { data: otherClass, error: otherError } = await supabase
      .from('classes')
      .select('*')
      .neq('teacher_id', testTeacher.id)
      .limit(1)

    if (otherError) {
      console.log('  ✅ Teacher cannot access other teacher classes (RLS working)')
    } else {
      console.log('  ⚠️ Teacher can access other teacher classes (RLS may need adjustment)')
    }
  } catch (err) {
    console.log('  ❌ RLS test error:', err.message)
  }
}

async function testEdgeCases() {
  console.log('  Testing edge cases...')

  // Test 1: Invalid date range
  console.log('  Testing invalid date range...')
  try {
    const response = await fetch('/api/curriculum/prepopulate-lessons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testTeacher.id}`
      },
      body: JSON.stringify({
        teacher_id: testTeacher.id,
        class_id: testClass.id,
        start_date: '2024-01-15',
        end_date: '2024-01-10', // End before start
        lessons_per_standard: 1
      })
    })

    if (!response.ok) {
      console.log('  ✅ Invalid date range properly rejected')
    } else {
      console.log('  ❌ Invalid date range should be rejected')
    }
  } catch (err) {
    console.log('  ❌ Date range test error:', err.message)
  }

  // Test 2: Missing required fields
  console.log('  Testing missing required fields...')
  try {
    const response = await fetch('/api/curriculum/prepopulate-lessons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testTeacher.id}`
      },
      body: JSON.stringify({
        teacher_id: testTeacher.id
        // Missing class_id, start_date, end_date
      })
    })

    if (!response.ok) {
      console.log('  ✅ Missing fields properly rejected')
    } else {
      console.log('  ❌ Missing fields should be rejected')
    }
  } catch (err) {
    console.log('  ❌ Missing fields test error:', err.message)
  }

  // Test 3: Unauthorized access
  console.log('  Testing unauthorized access...')
  try {
    const response = await fetch('/api/curriculum/prepopulate-lessons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // No Authorization header
      },
      body: JSON.stringify({
        teacher_id: testTeacher.id,
        class_id: testClass.id,
        start_date: '2024-01-08',
        end_date: '2024-01-12',
        lessons_per_standard: 1
      })
    })

    if (!response.ok) {
      console.log('  ✅ Unauthorized access properly rejected')
    } else {
      console.log('  ❌ Unauthorized access should be rejected')
    }
  } catch (err) {
    console.log('  ❌ Unauthorized test error:', err.message)
  }

  // Test 4: Large date range
  console.log('  Testing large date range...')
  try {
    const response = await fetch('/api/curriculum/prepopulate-lessons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testTeacher.id}`
      },
      body: JSON.stringify({
        teacher_id: testTeacher.id,
        class_id: testClass.id,
        start_date: '2024-01-01',
        end_date: '2024-12-31', // Full year
        lessons_per_standard: 2
      })
    })

    if (!response.ok) {
      const error = await response.json()
      if (error.error?.includes('Not enough school days')) {
        console.log('  ✅ Large date range properly handled')
      } else {
        console.log('  ❌ Large date range error unexpected:', error.error)
      }
    } else {
      console.log('  ⚠️ Large date range accepted (may be valid if enough standards)')
    }
  } catch (err) {
    console.log('  ❌ Large date range test error:', err.message)
  }
}

// Performance test
async function testPerformance() {
  console.log('\n⚡ Performance Test')
  
  const startTime = Date.now()
  
  try {
    const response = await fetch('/api/curriculum/prepopulate-lessons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testTeacher.id}`
      },
      body: JSON.stringify({
        teacher_id: testTeacher.id,
        class_id: testClass.id,
        start_date: '2024-01-08',
        end_date: '2024-01-19',
        lessons_per_standard: 1
      })
    })

    const endTime = Date.now()
    const duration = endTime - startTime

    if (response.ok) {
      console.log(`  ✅ Request completed in ${duration}ms`)
      
      if (duration < 5000) {
        console.log('  ⚡ Performance: Excellent')
      } else if (duration < 10000) {
        console.log('  🚀 Performance: Good')
      } else {
        console.log('  🐌 Performance: Needs optimization')
      }
    } else {
      console.log(`  ❌ Request failed in ${duration}ms`)
    }
  } catch (err) {
    console.log('  ❌ Performance test error:', err.message)
  }
}

// Run all tests
if (require.main === module) {
  runTests()
    .then(() => {
      console.log('\n🎉 Test suite completed!')
      process.exit(0)
    })
    .catch(error => {
      console.error('\n💥 Test suite failed:', error)
      process.exit(1)
    })
}

module.exports = {
  runTests,
  testDatabaseSchema,
  testStandardsData,
  testAPIEndpoint,
  testRLSPolicies,
  testEdgeCases,
  testPerformance
}
