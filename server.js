// Simple API server for GradeFlow development
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

const { default: lessonPlanHandler } = await import('./api/lesson-plan.js')
const { default: gradebookHandler } = await import('./api/teacher/gradebook.js')

const app = express()
const PORT = process.env.API_PORT || 3002

// Middleware
app.use(cors())
app.use(express.json())

// Fix for Vite proxy HMR issue - strip :1 suffix from query params globally
app.use((req, res, next) => {
  if (req.query && Object.keys(req.query).length > 0) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string' && req.query[key].includes(':')) {
        console.log(`DEBUG: Global middleware - stripping : suffix from ${key}:`, req.query[key])
        req.query[key] = req.query[key].split(':')[0]
        console.log(`DEBUG: Global middleware - cleaned ${key}:`, req.query[key])
      }
    })
  }
  next()
})

// ─── API Routes ──────────────────────────────────────────────────────────────

// Lesson Plan API
app.use('/api/lesson-plan', async (req, res) => {
  try {
    console.log('Server Debug - Method:', req.method)
    console.log('Server Debug - URL:', req.url)
    console.log('Server Debug - Query:', req.query)
    console.log('Server Debug - Headers:', req.headers.authorization)
    await lessonPlanHandler(req, res)
  } catch (error) {
    console.error('Lesson Plan API Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Gradebook API
app.get('/api/teacher/gradebook', async (req, res) => {
  try {
    // Fix for Vite proxy HMR issue - strip :1 suffix from query params before handler
    if (req.query.classId && typeof req.query.classId === 'string' && req.query.classId.includes(':')) {
      console.log('DEBUG: Server-level URL fix - original classId:', req.query.classId)
      req.query.classId = req.query.classId.split(':')[0]
      console.log('DEBUG: Server-level URL fix - cleaned classId:', req.query.classId)
    }
    
    await gradebookHandler(req, res)
  } catch (error) {
    console.error('Gradebook API Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`GradeFlow API server running on port ${PORT}`)
  console.log(`API endpoints available at http://localhost:${PORT}/api`)
  console.log(`  - POST /api/lesson-plan`)
  console.log(`  - GET /api/teacher/gradebook?classId=<id>`)
  console.log(`  - GET /api/health`)
})

export default app
