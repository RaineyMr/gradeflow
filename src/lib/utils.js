import React from 'react'

// Mobile detection utility
export const isMobile = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

// Responsive hook for mobile detection
export const useIsMobile = () => {
  const [mobile, setMobile] = React.useState(isMobile())
  
  React.useEffect(() => {
    const handleResize = () => {
      setMobile(isMobile())
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return mobile
}

// Format date for mobile display
export const formatDateMobile = (date) => {
  const d = new Date(date)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (d.toDateString() === today.toDateString()) {
    return 'Today'
  } else if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  } else {
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    })
  }
}

// Truncate text for mobile display
export const truncateText = (text, maxLength = 50) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}
