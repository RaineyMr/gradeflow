// Educational Standards Data
// Links TEKS (Texas) and Louisiana Student Standards to schools, grades, subjects, and curriculum

export const STANDARDS_SYSTEMS = {
  TEKS: {
    name: 'Texas Essential Knowledge and Skills',
    state: 'Texas',
    description: 'State learning standards for Texas public schools'
  },
  LSS: {
    name: 'Louisiana Student Standards', 
    state: 'Louisiana',
    description: 'State learning standards for Louisiana public schools'
  },
  COMMON: {
    name: 'Common Core/National Standards',
    state: 'National',
    description: 'National learning standards as fallback'
  }
}

// School district mapping to standards systems
export const SCHOOL_STANDARDS_MAPPING = {
  // Texas Schools - Use TEKS
  'houston-isd': 'TEKS',
  'kipp-texas': 'TEKS', 
  'yes-prep-tx': 'TEKS',
  'harmony-tx': 'TEKS',
  'idea-texas': 'TEKS',
  
  // Louisiana Schools - Use Louisiana Student Standards
  'kipp-la': 'LSS',
  'renew-nola': 'LSS',
  'collegiate-nola': 'LSS',
  'archdiocese-nola': 'LSS',
  'firstline-nola': 'LSS',
  
  // Default fallback
  'default': 'COMMON'
}

// Texas TEKS Standards by grade and subject
export const TEKS_STANDARDS = {
  // Elementary Math (K-5)
  'Math-Kindergarten': {
    grade: 'Kindergarten',
    subject: 'Math',
    standards: [
      {
        code: 'K.2.A',
        description: 'Count forward and backward to at least 20 with and without objects.',
        curriculum: ['hisd-zearn', 'illustrative-math', 'gomath', 'eureka'],
        cluster: 'Number and Operations',
        difficulty: 'Foundational'
      },
      {
        code: 'K.2.B', 
        description: 'Read, write, and represent whole numbers from 0 to at least 20 with and without objects or pictures.',
        curriculum: ['hisd-zearn', 'illustrative-math', 'gomath', 'eureka'],
        cluster: 'Number and Operations',
        difficulty: 'Foundational'
      },
      {
        code: 'K.3.A',
        description: 'Compose and decompose numbers up to 10 with objects and pictures.',
        curriculum: ['hisd-zearn', 'illustrative-math', 'gomath'],
        cluster: 'Number and Operations',
        difficulty: 'Foundational'
      }
    ]
  },
  'Math-1st Grade': {
    grade: '1st Grade',
    subject: 'Math',
    standards: [
      {
        code: '1.2.A',
        description: 'Recognize instantly the quantity of structured arrangements.',
        curriculum: ['hisd-zearn', 'illustrative-math', 'gomath', 'eureka'],
        cluster: 'Number and Operations',
        difficulty: 'Foundational'
      },
      {
        code: '1.2.B',
        description: 'Use concrete and pictorial models to compose and decompose numbers up to 120 in more than one way as so many hundreds, so many tens, and so many ones.',
        curriculum: ['hisd-zearn', 'illustrative-math', 'gomath', 'eureka'],
        cluster: 'Number and Operations',
        difficulty: 'Developing'
      },
      {
        code: '1.3.C',
        description: 'Use objects and pictorial models to solve word problems involving joining, separating, and comparing sets within 20 and unknowns as any one of the terms in the problem.',
        curriculum: ['hisd-zearn', 'illustrative-math', 'gomath'],
        cluster: 'Number and Operations',
        difficulty: 'Developing'
      }
    ]
  },
  'Math-3rd Grade': {
    grade: '3rd Grade',
    subject: 'Math', 
    standards: [
      {
        code: '3.2.A',
        description: 'Compose and decompose numbers up to 100,000 as a sum of so many ten thousands, so many thousands, so many hundreds, so many tens, and so many ones using objects, pictorial models, and numbers, including expanded notation as appropriate.',
        curriculum: ['hisd-zearn', 'illustrative-math', 'gomath', 'eureka'],
        cluster: 'Number and Operations',
        difficulty: 'Developing'
      },
      {
        code: '3.4.A',
        description: 'Solve one-step and two-step problems involving multiplication and division within 100 using strategies based on objects; pictorial models, including arrays, area models, and equal groups; properties of operations; or recall of facts.',
        curriculum: ['hisd-zearn', 'illustrative-math', 'gomath', 'eureka'],
        cluster: 'Number and Operations',
        difficulty: 'Proficient'
      },
      {
        code: '3.5.A',
        description: 'Represent one- and two-step problems involving addition and subtraction of whole numbers to 1,000 using pictorial models, number lines, and equations.',
        curriculum: ['hisd-zearn', 'illustrative-math', 'gomath'],
        cluster: 'Number and Operations',
        difficulty: 'Proficient'
      }
    ]
  },
  
  // Elementary ELA (K-5)
  'ELA-Kindergarten': {
    grade: 'Kindergarten',
    subject: 'Reading',
    standards: [
      {
        code: 'K.2.A',
        description: 'Demonstrate phonological awareness by: (1) recognizing spoken rhyming words; (2) identifying initial sounds; (3) segmenting one-syllable words into phonemes.',
        curriculum: ['hisd-literacy', 'ckla', 'readingwonders', 'fishtank-ela'],
        cluster: 'Phonological Awareness',
        difficulty: 'Foundational'
      },
      {
        code: 'K.2.B',
        description: 'Demonstrate and apply phonetic knowledge by: (1) identifying and matching the common sounds that letters represent; (2) decoding words by applying letter-sound knowledge.',
        curriculum: ['hisd-literacy', 'ckla', 'readingwonders', 'fishtank-ela'],
        cluster: 'Phonics',
        difficulty: 'Foundational'
      },
      {
        code: 'K.3.A',
        description: 'Identify the topic and details in expository text.',
        curriculum: ['hisd-literacy', 'ckla', 'readingwonders'],
        cluster: 'Comprehension',
        difficulty: 'Developing'
      }
    ]
  },
  'ELA-3rd Grade': {
    grade: '3rd Grade',
    subject: 'Reading',
    standards: [
      {
        code: '3.2.A',
        description: 'Demonstrate phonological awareness and phonetic knowledge by decoding words in isolation and in context.',
        curriculum: ['hisd-literacy', 'ckla', 'readingwonders', 'fishtank-ela'],
        cluster: 'Word Analysis',
        difficulty: 'Developing'
      },
      {
        code: '3.6.B',
        description: 'Identify the main idea and supporting details in a text.',
        curriculum: ['hisd-literacy', 'readingwonders', 'fishtank-ela', 'commonlit'],
        cluster: 'Comprehension',
        difficulty: 'Proficient'
      },
      {
        code: '3.6.E',
        description: 'Make connections to personal experiences, ideas in other texts, and society.',
        curriculum: ['hisd-literacy', 'readingwonders', 'fishtank-ela', 'commonlit'],
        cluster: 'Comprehension',
        difficulty: 'Proficient'
      }
    ]
  },

  // Middle School Math (6-8)
  'Math-6th Grade': {
    grade: '6th Grade',
    subject: 'Math',
    standards: [
      {
        code: '6.2.B',
        description: 'Identify a number, its opposite, and its absolute value.',
        curriculum: ['hisd-zearn', 'illustrative-math', 'gomath', 'eureka'],
        cluster: 'Number and Operations',
        difficulty: 'Developing'
      },
      {
        code: '6.3.C',
        description: 'Represent ratios and percents with concrete models, fractions, and decimals.',
        curriculum: ['hisd-zearn', 'illustrative-math', 'gomath'],
        cluster: 'Proportionality',
        difficulty: 'Proficient'
      },
      {
        code: '6.4.A',
        description: 'Compare two rules verbally, numerically, graphically, and symbolically in order to differentiate between linear and non-linear relationships.',
        curriculum: ['hisd-zearn', 'illustrative-math'],
        cluster: 'Expressions, Equations, and Relationships',
        difficulty: 'Advanced'
      }
    ]
  },
  'Math-8th Grade': {
    grade: '8th Grade',
    subject: 'Math',
    standards: [
      {
        code: '8.2.A',
        description: 'Extend previous knowledge of sets and subsets using a visual representation to describe relationships between sets of real numbers.',
        curriculum: ['hisd-zearn', 'illustrative-math', 'eureka'],
        cluster: 'Number and Operations',
        difficulty: 'Advanced'
      },
      {
        code: '8.4.C',
        description: 'Use data from a table or graph to determine the rate of change or slope and y-intercept in mathematical and real-world problems.',
        curriculum: ['hisd-zearn', 'illustrative-math', 'eureka'],
        cluster: 'Expressions, Equations, and Relationships',
        difficulty: 'Advanced'
      },
      {
        code: '8.7.A',
        description: 'Solve problems involving volume of cylinders, cones, and spheres.',
        curriculum: ['hisd-zearn', 'illustrative-math', 'eureka'],
        cluster: 'Measurement and Data',
        difficulty: 'Proficient'
      }
    ]
  },

  // Science Standards
  'Science-5th Grade': {
    grade: '5th Grade',
    subject: 'Science',
    standards: [
      {
        code: '5.1.A',
        description: 'Demonstrate safe practices and the use of safety equipment.',
        curriculum: ['hisd-science', 'amplify-science', 'ckscience'],
        cluster: 'Scientific Investigation and Reasoning',
        difficulty: 'Foundational'
      },
      {
        code: '5.2.A',
        description: 'Describe and classify matter based on observable physical properties.',
        curriculum: ['hisd-science', 'amplify-science', 'ckscience'],
        cluster: 'Matter and Energy',
        difficulty: 'Developing'
      },
      {
        code: '5.9.A',
        description: 'Observe the way organisms live and survive in their ecosystem.',
        curriculum: ['hisd-science', 'amplify-science', 'ckscience'],
        cluster: 'Organisms and Environments',
        difficulty: 'Proficient'
      }
    ]
  },
  'Science-8th Grade': {
    grade: '8th Grade',
    subject: 'Science',
    standards: [
      {
        code: '8.1.A',
        description: 'Demonstrate safe practices during laboratory and field investigations.',
        curriculum: ['hisd-science', 'amplify-science', 'ckscience'],
        cluster: 'Scientific Investigation and Reasoning',
        difficulty: 'Foundational'
      },
      {
        code: '8.5.A',
        description: 'Describe the structure of atoms, including the masses, charges of protons, neutrons, and electrons.',
        curriculum: ['hisd-science', 'amplify-science', 'ckscience'],
        cluster: 'Matter and Energy',
        difficulty: 'Advanced'
      },
      {
        code: '8.8.C',
        description: 'Model the effects of human activity on groundwater and surface water in a watershed.',
        curriculum: ['hisd-science', 'amplify-science', 'ckscience'],
        cluster: 'Earth and Space',
        difficulty: 'Proficient'
      }
    ]
  }
}

// Louisiana Student Standards by grade and subject
export const LOUISIANA_STANDARDS = {
  // Elementary Math (K-5)
  'Math-Kindergarten': {
    grade: 'Kindergarten',
    subject: 'Math',
    standards: [
      {
        code: 'K.CC.A.1',
        description: 'Count to 100 by ones and by tens.',
        curriculum: ['illustrative-math', 'gomath', 'eureka'],
        cluster: 'Counting and Cardinality',
        difficulty: 'Foundational'
      },
      {
        code: 'K.CC.B.4',
        description: 'Understand the relationship between numbers and quantities; connect counting to cardinality.',
        curriculum: ['illustrative-math', 'gomath', 'eureka'],
        cluster: 'Counting and Cardinality',
        difficulty: 'Foundational'
      },
      {
        code: 'K.OA.A.1',
        description: 'Represent addition and subtraction with objects, fingers, mental images, drawings, sounds, acting out situations, verbal explanations, expressions, or equations.',
        curriculum: ['illustrative-math', 'gomath', 'eureka'],
        cluster: 'Operations and Algebraic Thinking',
        difficulty: 'Foundational'
      }
    ]
  },
  'Math-3rd Grade': {
    grade: '3rd Grade',
    subject: 'Math',
    standards: [
      {
        code: '3.OA.A.1',
        description: 'Interpret products of whole numbers, e.g., interpret 5 × 7 as the total number of objects in 5 groups of 7 objects each.',
        curriculum: ['illustrative-math', 'gomath', 'eureka'],
        cluster: 'Operations and Algebraic Thinking',
        difficulty: 'Developing'
      },
      {
        code: '3.NBT.A.2',
        description: 'Fluently add and subtract within 1000 using strategies and algorithms based on place value, properties of operations, and/or the relationship between addition and subtraction.',
        curriculum: ['illustrative-math', 'gomath', 'eureka'],
        cluster: 'Number and Operations in Base Ten',
        difficulty: 'Proficient'
      },
      {
        code: '3.NF.A.1',
        description: 'Understand a fraction 1/b as the quantity formed by 1 part when a whole is partitioned into b equal parts.',
        curriculum: ['illustrative-math', 'gomath', 'eureka'],
        cluster: 'Number and Operations—Fractions',
        difficulty: 'Developing'
      }
    ]
  },

  // Elementary ELA (K-5)
  'ELA-Kindergarten': {
    grade: 'Kindergarten',
    subject: 'Reading',
    standards: [
      {
        code: 'RF.K.1.A',
        description: 'Follow words from left to right, top to bottom, and page by page.',
        curriculum: ['ckla', 'readingwonders', 'fishtank-ela'],
        cluster: 'Print Concepts',
        difficulty: 'Foundational'
      },
      {
        code: 'RF.K.2.A',
        description: 'Recognize and produce rhyming words.',
        curriculum: ['ckla', 'readingwonders', 'fishtank-ela'],
        cluster: 'Phonological Awareness',
        difficulty: 'Foundational'
      },
      {
        code: 'RF.K.3.A',
        description: 'Demonstrate basic knowledge of one-to-one letter-sound correspondences by producing the primary sound or many of the most frequent sounds for each consonant.',
        curriculum: ['ckla', 'readingwonders', 'fishtank-ela'],
        cluster: 'Phonics and Word Recognition',
        difficulty: 'Foundational'
      }
    ]
  },
  'ELA-3rd Grade': {
    grade: '3rd Grade',
    subject: 'Reading',
    standards: [
      {
        code: 'RL.3.1',
        description: 'Ask and answer questions to demonstrate understanding of a text, referring explicitly to the text as the basis for the answers.',
        curriculum: ['fishtank-ela', 'readingwonders', 'commonlit'],
        cluster: 'Reading Literature',
        difficulty: 'Proficient'
      },
      {
        code: 'RI.3.2',
        description: 'Determine the main idea of a text; recount the key details and explain how they support the main idea.',
        curriculum: ['fishtank-ela', 'readingwonders', 'commonlit'],
        cluster: 'Reading Informational Text',
        difficulty: 'Proficient'
      },
      {
        code: 'RF.3.3.A',
        description: 'Identify and know the meaning of the most common prefixes and derivational suffixes.',
        curriculum: ['fishtank-ela', 'readingwonders'],
        cluster: 'Foundational Skills',
        difficulty: 'Developing'
      }
    ]
  },

  // Middle School Math (6-8)
  'Math-6th Grade': {
    grade: '6th Grade',
    subject: 'Math',
    standards: [
      {
        code: '6.RP.A.1',
        description: 'Understand the concept of a ratio and use ratio language to describe a ratio relationship between two quantities.',
        curriculum: ['illustrative-math', 'eureka'],
        cluster: 'Ratios and Proportional Relationships',
        difficulty: 'Developing'
      },
      {
        code: '6.NS.A.1',
        description: 'Interpret and compute quotients of fractions, and solve word problems involving division of fractions by fractions.',
        curriculum: ['illustrative-math', 'eureka'],
        cluster: 'The Number System',
        difficulty: 'Proficient'
      },
      {
        code: '6.EE.A.2',
        description: 'Write, read, and evaluate expressions in which letters stand for numbers.',
        curriculum: ['illustrative-math', 'eureka'],
        cluster: 'Expressions and Equations',
        difficulty: 'Developing'
      }
    ]
  },
  'Math-8th Grade': {
    grade: '8th Grade',
    subject: 'Math',
    standards: [
      {
        code: '8.EE.A.1',
        description: 'Know and apply the properties of integer exponents to generate equivalent numerical expressions.',
        curriculum: ['illustrative-math', 'eureka'],
        cluster: 'Expressions and Equations',
        difficulty: 'Advanced'
      },
      {
        code: '8.F.A.1',
        description: 'Understand that a function is a rule that assigns to each input exactly one output.',
        curriculum: ['illustrative-math', 'eureka'],
        cluster: 'Functions',
        difficulty: 'Advanced'
      },
      {
        code: '8.G.A.1',
        description: 'Verify experimentally the properties of rotations, reflections, and translations.',
        curriculum: ['illustrative-math', 'eureka'],
        cluster: 'Geometry',
        difficulty: 'Proficient'
      }
    ]
  },

  // Science Standards
  'Science-5th Grade': {
    grade: '5th Grade',
    subject: 'Science',
    standards: [
      {
        code: '5-PS1-1',
        description: 'Develop a model to describe that matter is made of particles too small to be seen.',
        curriculum: ['amplify-science', 'ckscience'],
        cluster: 'Matter and Its Interactions',
        difficulty: 'Developing'
      },
      {
        code: '5-LS1-1',
        description: 'Support an argument that plants get the materials they need for growth chiefly from air and water.',
        curriculum: ['amplify-science', 'ckscience'],
        cluster: 'From Molecules to Organisms: Structures and Processes',
        difficulty: 'Proficient'
      },
      {
        code: '5-ESS2-1',
        description: 'Develop a model using an example to describe ways the geosphere, biosphere, hydrosphere, and atmosphere interact.',
        curriculum: ['amplify-science', 'ckscience'],
        cluster: 'Earth\'s Systems',
        difficulty: 'Advanced'
      }
    ]
  }
}

// Common Core/National Standards as fallback
export const COMMON_STANDARDS = {
  'Math-3rd Grade': {
    grade: '3rd Grade',
    subject: 'Math',
    standards: [
      {
        code: '3.OA.A.1',
        description: 'Interpret products of whole numbers, e.g., interpret 5 × 7 as the total number of objects in 5 groups of 7 objects each.',
        curriculum: ['illustrative-math', 'gomath', 'eureka'],
        cluster: 'Operations and Algebraic Thinking',
        difficulty: 'Developing'
      },
      {
        code: '3.NBT.A.2',
        description: 'Fluently add and subtract within 1000 using strategies and algorithms based on place value.',
        curriculum: ['illustrative-math', 'gomath', 'eureka'],
        cluster: 'Number and Operations in Base Ten',
        difficulty: 'Proficient'
      }
    ]
  },
  'ELA-3rd Grade': {
    grade: '3rd Grade',
    subject: 'Reading',
    standards: [
      {
        code: 'RL.3.1',
        description: 'Ask and answer questions to demonstrate understanding of a text.',
        curriculum: ['fishtank-ela', 'readingwonders', 'commonlit'],
        cluster: 'Reading Literature',
        difficulty: 'Proficient'
      },
      {
        code: 'RI.3.2',
        description: 'Determine the main idea of a text; recount key details.',
        curriculum: ['fishtank-ela', 'readingwonders', 'commonlit'],
        cluster: 'Reading Informational Text',
        difficulty: 'Proficient'
      }
    ]
  }
}
