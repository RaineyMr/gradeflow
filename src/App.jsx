import { Routes, Route } from 'react-router-dom'
import AppRouter from './appRouter.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="*" element={<AppRouter />} />
    </Routes>
  )
}
