import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.css'
import './styles/school-branding.css'

// Polyfill for Vercel Speed Insights to prevent ReferenceError in production
if (typeof window !== 'undefined') {
  window.SpeedInsights = window.SpeedInsights || function () {};
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
