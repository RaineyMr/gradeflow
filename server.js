// Simple API server for GradeFlow development
import express from 'express'
import cors from 'cors'

const { default: lessonPlanHandler } = await import('./api/lesson-plan.js')
const { default: gradebookHandler } = await import('./api/teacher/gradebook.js')

const app = express()
const PORT = process.env.API_PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// ─── API Routes ──────────────────────────────────────────────────────────────

// Lesson Plan API
app.use('/api/lesson-plan', async (req, res) => {
  try {
    await lessonPlanHandler(req, res)
  } catch (error) {
    console.error('Lesson Plan API Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Gradebook API
app.get('/api/teacher/gradebook', async (req, res) => {
  try {
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
