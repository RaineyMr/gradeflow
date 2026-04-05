// Simplified Standards Service for Lesson Plan Generator
// Works with demo accounts and provides TEKS/Common Core standards

// District mapping to standards systems
const DISTRICT_STANDARDS_MAPPING = {
  // Texas Districts - Use TEKS
  'houston': 'TEKS',
  'houston isd': 'TEKS', 
  'lamar': 'TEKS',
  'yes-prep': 'TEKS',
  'harmony': 'TEKS',
  'idea': 'TEKS',
  'kipp-texas': 'TEKS',
  
  // Louisiana Districts - Use Louisiana Student Standards  
  'kipp': 'LSS',
  'kipp new orleans': 'LSS',
  'renew': 'LSS',
  'renew new orleans': 'LSS',
  'collegiate': 'LSS',
  'collegiate academies': 'LSS',
  'archdiocese': 'LSS',
  'firstline': 'LSS',
  
  // Default fallback
  'default': 'COMMON'
}

// Basic TEKS standards data for common grades and subjects
const TEKS_DATA = {
  // Elementary Math (K-5)
  'Math-Kindergarten': [
    { code: 'K.2.A', description: 'Count forward and backward to at least 20 with and without objects.', cluster: 'Number and Operations' },
    { code: 'K.2.B', description: 'Read, write, and represent whole numbers from 0 to at least 20.', cluster: 'Number and Operations' },
    { code: 'K.3.A', description: 'Compose and decompose numbers up to 10 with objects and pictures.', cluster: 'Number and Operations' },
  ],
  'Math-1st Grade': [
    { code: '1.2.A', description: 'Recognize instantly the quantity of structured arrangements.', cluster: 'Number and Operations' },
    { code: '1.2.B', description: 'Use concrete and pictorial models to compose and decompose numbers up to 120.', cluster: 'Number and Operations' },
    { code: '1.3.C', description: 'Use objects and pictorial models to solve word problems within 20.', cluster: 'Number and Operations' },
  ],
  'Math-2nd Grade': [
    { code: '2.2.A', description: 'Use concrete models to represent and compare whole numbers.', cluster: 'Number and Operations' },
    { code: '2.4.A', description: 'Recall basic facts to add and subtract within 20.', cluster: 'Number and Operations' },
    { code: '2.6.A', description: 'Model, create, and describe contextual multiplication situations.', cluster: 'Number and Operations' },
  ],
  'Math-3rd Grade': [
    { code: '3.2.A', description: 'Compose and decompose numbers up to 100,000 as a sum of so many ten thousands.', cluster: 'Number and Operations' },
    { code: '3.4.A', description: 'Solve one-step and two-step problems involving multiplication and division within 100.', cluster: 'Number and Operations' },
    { code: '3.5.A', description: 'Represent problems involving addition and subtraction of whole numbers to 1,000.', cluster: 'Number and Operations' },
    { code: '3.6.A', description: 'Classify and sort two- and three-dimensional figures.', cluster: 'Geometry' },
  ],
  'Math-4th Grade': [
    { code: '4.2.A', description: 'Interpret the value of each place-value position as 10 times the position to the right.', cluster: 'Number and Operations' },
    { code: '4.3.A', description: 'Represent a fraction a/b as a sum of fractions 1/b.', cluster: 'Number and Operations' },
    { code: '4.4.A', description: 'Add and subtract whole numbers and decimals to the hundredths place.', cluster: 'Number and Operations' },
  ],
  'Math-5th Grade': [
    { code: '5.2.A', description: 'Represent the value of the digit in decimals through the thousandths.', cluster: 'Number and Operations' },
    { code: '5.3.A', description: 'Estimate to determine solutions to mathematical and real-world problems.', cluster: 'Number and Operations' },
    { code: '5.3.B', description: 'Multiply with fluency a three-digit number by a two-digit number using strategies.', cluster: 'Number and Operations' },
    { code: '5.3.C', description: 'Solve with proficiency for quotients up to a four-digit dividend by a two-digit divisor.', cluster: 'Number and Operations' },
    { code: '5.3.E', description: 'Model and solve one-variable equations with variables on both sides.', cluster: 'Expressions and Equations' },
    { code: '5.4.A', description: 'Identify prime and composite numbers and determine prime factorization.', cluster: 'Number and Operations' },
    { code: '5.4.B', description: 'Represent and solve multi-step problems involving the four operations.', cluster: 'Number and Operations' },
    { code: '5.4.C', description: 'Generate numerical patterns when given rules in the form y = ax + c.', cluster: 'Expressions and Equations' },
    { code: '5.4.D', description: 'Recognize the difference between additive and multiplicative patterns.', cluster: 'Expressions and Equations' },
    { code: '5.4.E', description: 'Describe the meaning of parentheses and brackets in numerical expressions.', cluster: 'Expressions and Equations' },
    { code: '5.4.F', description: 'Simplify numerical expressions that do not involve exponents.', cluster: 'Expressions and Equations' },
    { code: '5.4.H', description: 'Represent and solve problems related to perimeter and area.', cluster: 'Measurement and Data' },
    { code: '5.5.A', description: 'Classify two-dimensional figures in a hierarchy based on properties.', cluster: 'Geometry' },
    { code: '5.6.A', description: 'Recognize a cube with side length of one unit as having a volume of one cubic unit.', cluster: 'Measurement and Data' },
    { code: '5.6.B', description: 'Determine the volume of a rectangular prism with whole number edge lengths.', cluster: 'Measurement and Data' },
    { code: '5.7.A', description: 'Solve problems by calculating conversions within a measurement system.', cluster: 'Measurement and Data' },
    { code: '5.8.A', description: 'Describe the key attributes of a coordinate plane.', cluster: 'Measurement and Data' },
    { code: '5.8.B', description: 'Describe the process for graphing ordered pairs in the first quadrant.', cluster: 'Measurement and Data' },
    { code: '5.8.C', description: 'Graph in the first quadrant of the coordinate plane ordered pairs of numbers.', cluster: 'Measurement and Data' },
    { code: '5.9.A', description: 'Represent categorical data with bar graphs or frequency tables.', cluster: 'Measurement and Data' },
    { code: '5.9.B', description: 'Represent discrete paired data on a scatterplot.', cluster: 'Measurement and Data' },
    { code: '5.9.C', description: 'Solve one- and two-step problems using data from a frequency table or dot plot.', cluster: 'Measurement and Data' },
  ],
  
  // Elementary ELA (K-5)
  'ELA-Kindergarten': [
    { code: 'K.2.A', description: 'Demonstrate phonological awareness by recognizing rhyming words.', cluster: 'Phonological Awareness' },
    { code: 'K.2.B', description: 'Demonstrate and apply phonetic knowledge by identifying letter-sound relationships.', cluster: 'Phonics' },
    { code: 'K.3.A', description: 'Identify the topic and details in expository text.', cluster: 'Comprehension' },
  ],
  'ELA-1st Grade': [
    { code: '1.2.A', description: 'Demonstrate phonological awareness by distinguishing features of sentences.', cluster: 'Phonological Awareness' },
    { code: '1.3.A', description: 'Decode words in context and in isolation by applying letter-sound knowledge.', cluster: 'Word Analysis' },
    { code: '1.6.B', description: 'Identify the main idea and supporting details in a text.', cluster: 'Comprehension' },
  ],
  'ELA-2nd Grade': [
    { code: '2.2.A', description: 'Demonstrate phonological awareness by segmenting multisyllabic words.', cluster: 'Phonological Awareness' },
    { code: '2.3.A', description: 'Decode words in context and in isolation by applying letter-sound knowledge.', cluster: 'Word Analysis' },
    { code: '2.6.B', description: 'Identify main idea and supporting details in a text.', cluster: 'Comprehension' },
  ],
  'ELA-3rd Grade': [
    { code: '3.2.A', description: 'Demonstrate phonological awareness and phonetic knowledge by decoding words.', cluster: 'Word Analysis' },
    { code: '3.6.B', description: 'Identify the main idea and supporting details in a text.', cluster: 'Comprehension' },
    { code: '3.9.A', description: 'Explain the difference in stated purpose between poems, drama, and prose.', cluster: 'Genre' },
  ],
  'ELA-4th Grade': [
    { code: '4.2.A', description: 'Demonstrate and apply phonetic knowledge by decoding multisyllabic words.', cluster: 'Word Analysis' },
    { code: '4.6.A', description: 'Sequence and summarize the plot\'s main events.', cluster: 'Comprehension' },
    { code: '4.8.A', description: 'Analyze how authors use language to influence readers.', cluster: 'Author\'s Purpose' },
  ],
  'ELA-5th Grade': [
    { code: '5.2.A', description: 'Demonstrate and apply phonetic knowledge by decoding words using advanced knowledge.', cluster: 'Word Analysis' },
    { code: '5.6.A', description: 'Analyze how poets use sound effects to reinforce meaning.', cluster: 'Poetry' },
    { code: '5.9.A', description: 'Explain how authors create meaning through stylistic elements.', cluster: 'Author\'s Craft' },
  ],

  // Science Standards
  'Science-Kindergarten': [
    { code: 'K.1.A', description: 'Demonstrate safe practices during classroom and field investigations.', cluster: 'Scientific Investigation' },
    { code: 'K.4.A', description: 'Collect information using tools and nonstandard measurement.', cluster: 'Scientific Investigation' },
    { code: 'K.9.A', description: 'Differentiate between living and nonliving things.', cluster: 'Organisms and Environments' },
  ],
  'Science-1st Grade': [
    { code: '1.1.A', description: 'Demonstrate safe practices during investigations.', cluster: 'Scientific Investigation' },
    { code: '1.4.A', description: 'Collect and record data using tools.', cluster: 'Scientific Investigation' },
    { code: '1.9.A', description: 'Classify objects by observable properties.', cluster: 'Matter and Energy' },
  ],
  'Science-2nd Grade': [
    { code: '2.1.A', description: 'Demonstrate safe practices during investigations.', cluster: 'Scientific Investigation' },
    { code: '2.4.A', description: 'Measure and compare physical properties of matter.', cluster: 'Matter and Energy' },
    { code: '2.9.A', description: 'Identify basic needs of living organisms.', cluster: 'Organisms and Environments' },
  ],
  'Science-3rd Grade': [
    { code: '3.1.A', description: 'Demonstrate safe practices during classroom and field investigations.', cluster: 'Scientific Investigation' },
    { code: '3.5.A', description: 'Measure and test physical properties of matter.', cluster: 'Matter and Energy' },
    { code: '3.9.A', description: 'Observe and describe the physical characteristics of environments.', cluster: 'Organisms and Environments' },
  ],
  'Science-4th Grade': [
    { code: '4.1.A', description: 'Demonstrate safe practices during investigations.', cluster: 'Scientific Investigation' },
    { code: '4.5.A', description: 'Measure changes in matter caused by heating or cooling.', cluster: 'Matter and Energy' },
    { code: '4.9.A', description: 'Investigate that most producers need sunlight, water, and carbon dioxide.', cluster: 'Organisms and Environments' },
  ],
  'Science-5th Grade': [
    { code: '5.1.A', description: 'Demonstrate safe practices and the use of safety equipment.', cluster: 'Scientific Investigation and Reasoning' },
    { code: '5.1.B', description: 'Demonstrate an understanding of the properties of materials.', cluster: 'Scientific Investigation and Reasoning' },
    { code: '5.2.A', description: 'Classify matter based on physical properties including mass, magnetism, and relative density.', cluster: 'Matter and Energy' },
    { code: '5.2.B', description: 'Identify the boiling and freezing/melting points of water.', cluster: 'Matter and Energy' },
    { code: '5.2.C', description: 'Demonstrate that some mixtures maintain physical properties of their ingredients.', cluster: 'Matter and Energy' },
    { code: '5.2.D', description: 'Identify the changes that can occur in the physical properties of matter.', cluster: 'Matter and Energy' },
    { code: '5.3.A', description: 'Explore the forms of energy including light, heat, sound, electrical, and mechanical.', cluster: 'Matter and Energy' },
    { code: '5.3.B', description: 'Demonstrate that light travels in a straight line until it strikes an object.', cluster: 'Matter and Energy' },
    { code: '5.3.C', description: 'Demonstrate that light can be reflected and refracted.', cluster: 'Matter and Energy' },
    { code: '5.4.A', description: 'Design an experiment to test the effect of force on an object.', cluster: 'Force, Motion, and Energy' },
    { code: '5.4.B', description: 'Describe and illustrate the continuous movement of water through the water cycle.', cluster: 'Earth and Space' },
    { code: '5.4.C', description: 'Identify alternative energy resources such as wind, solar, hydroelectric, and geothermal.', cluster: 'Earth and Space' },
    { code: '5.5.A', description: 'Classify organisms based on physical characteristics and structures.', cluster: 'Organisms and Environments' },
    { code: '5.5.B', description: 'Compare the structures and functions of different species.', cluster: 'Organisms and Environments' },
    { code: '5.5.C', description: 'Describe the differences between complete and incomplete metamorphosis.', cluster: 'Organisms and Environments' },
    { code: '5.5.D', description: 'Identify and describe the flow of energy through a food web.', cluster: 'Organisms and Environments' },
    { code: '5.5.E', description: 'Describe how the flow of energy derived from the Sun is used by producers.', cluster: 'Organisms and Environments' },
    { code: '5.5.F', description: 'Describe the flow of matter and energy through living systems and the physical environment.', cluster: 'Organisms and Environments' },
    { code: '5.6.A', description: 'Explore how processes have shaped and continue to shape Earth.', cluster: 'Earth and Space' },
    { code: '5.6.B', description: 'Identify fossils as evidence of past living organisms.', cluster: 'Earth and Space' },
    { code: '5.6.C', description: 'Identify and compare different landforms.', cluster: 'Earth and Space' },
    { code: '5.7.A', description: 'Explore the processes that led to the formation of sedimentary rocks and fossil fuels.', cluster: 'Earth and Space' },
    { code: '5.8.A', description: 'Differentiate between weather and climate.', cluster: 'Earth and Space' },
    { code: '5.8.B', description: 'Explain how the Sun and the ocean interact in the water cycle.', cluster: 'Earth and Space' },
    { code: '5.9.A', description: 'Observe the way organisms live and survive in their ecosystem.', cluster: 'Organisms and Environments' },
    { code: '5.9.B', description: 'Describe how the flow of energy derived from the Sun is used by producers.', cluster: 'Organisms and Environments' },
    { code: '5.9.C', description: 'Predict the effects of changes in ecosystems caused by living organisms.', cluster: 'Organisms and Environments' },
    { code: '5.10.A', description: 'Compare the structures and functions of different species.', cluster: 'Organisms and Environments' },
    { code: '5.10.B', description: 'Describe how adaptations help organisms survive in their environment.', cluster: 'Organisms and Environments' },
  ],
}

// Common Core standards as fallback
const COMMON_CORE_DATA = {
  'Math-3rd Grade': [
    { code: '3.OA.A.1', description: 'Interpret products of whole numbers as total number of objects.', cluster: 'Operations and Algebraic Thinking' },
    { code: '3.NBT.A.2', description: 'Fluently add and subtract within 1000 using place value strategies.', cluster: 'Number and Operations in Base Ten' },
    { code: '3.NF.A.1', description: 'Understand a fraction as quantity formed by parts of a whole.', cluster: 'Number and Operations—Fractions' },
  ],
  'ELA-3rd Grade': [
    { code: 'RL.3.1', description: 'Ask and answer questions to demonstrate understanding of text.', cluster: 'Reading Literature' },
    { code: 'RI.3.2', description: 'Determine the main idea and recount key details of a text.', cluster: 'Reading Informational Text' },
  ],
}

export function getStandardsSystem(schoolName) {
  if (!schoolName) return 'COMMON'
  
  const schoolNameLower = schoolName.toLowerCase()
  
  // Check each district mapping
  for (const [district, system] of Object.entries(DISTRICT_STANDARDS_MAPPING)) {
    if (schoolNameLower.includes(district)) {
      return system
    }
  }
  
  return 'COMMON'
}

export function getStandardsForGradeSubject(subject, grade, schoolName) {
  const standardsSystem = getStandardsSystem(schoolName)
  
  // Map subject names to standard format
  const subjectMapping = {
    'Mathematics': 'Math',
    'Math': 'Math',
    'English Language Arts': 'ELA',
    'ELA': 'ELA',
    'English': 'ELA',
    'Science': 'Science'
  }
  
  // Map grade levels to the expected format
  const gradeMapping = {
    'K': 'Kindergarten',
    '1': '1st Grade',
    '2': '2nd Grade', 
    '3': '3rd Grade',
    '4': '4th Grade',
    '5': '5th Grade',
    '6': '6th Grade',
    '7': '7th Grade',
    '8': '8th Grade',
    '9': '9th Grade',
    '10': '10th Grade',
    '11': '11th Grade',
    '12': '12th Grade'
  }
  
  const mappedSubject = subjectMapping[subject] || subject
  const mappedGrade = gradeMapping[grade] || grade
  const key = `${mappedSubject}-${mappedGrade}`
  
  switch (standardsSystem) {
    case 'TEKS':
      return TEKS_DATA[key] || []
    case 'LSS':
      return LOUISIANA_DATA[key] || []
    default:
      return COMMON_CORE_DATA[key] || []
  }
}

export function searchStandards(subject, grade, query, schoolName) {
  const standards = getStandardsForGradeSubject(subject, grade, schoolName)
  if (!query || query.trim() === '') return standards
  
  const searchTerm = query.toLowerCase()
  return standards.filter(standard => 
    standard.code.toLowerCase().includes(searchTerm) ||
    standard.description.toLowerCase().includes(searchTerm) ||
    standard.cluster.toLowerCase().includes(searchTerm)
  )
}

export function getRecommendedStandards(subject, grade, topic, schoolName) {
  const standards = getStandardsForGradeSubject(subject, grade, schoolName)
  const topicKeywords = topic.toLowerCase().split(' ').filter(word => word.length > 2)
  
  return standards
    .map(standard => {
      let relevanceScore = 0
      const description = standard.description.toLowerCase()
      
      topicKeywords.forEach(keyword => {
        if (description.includes(keyword)) {
          relevanceScore += 1
        }
      })
      
      if (standard.cluster.toLowerCase().includes(topic.toLowerCase())) {
        relevanceScore += 2
      }
      
      return { ...standard, relevanceScore }
    })
    .filter(standard => standard.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5)
}
