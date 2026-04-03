import { Routes, Route } from 'react-router-dom'
import AppRouter from './appRouter.jsx'
import { SpeedInsights } from '@vercel/speed-insights/react'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="*" element={<AppRouter />} />
      </Routes>
      <SpeedInsights />
    </>
  )
}
