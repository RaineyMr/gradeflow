import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Home, Users, FileText, MessageSquare, Brain, Plus, X } from 'lucide-react'

export default function MobileLayout() {
  const [showQuickActions, setShowQuickActions] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { icon: Home, label: 'Home', path: '/supportStaff' },
    { icon: Users, label: 'Students', path: '/support/caseload' },
    { icon: FileText, label: 'Logs', path: '/support/logs' },
    { icon: MessageSquare, label: 'Messages', path: '/support/messages' },
    { icon: Brain, label: 'AI Assist', path: '/supportStaff/ai' }
  ]

  const quickActions = [
    { icon: FileText, label: 'Log Support Note', action: () => navigate('/support/logs') },
    { icon: MessageSquare, label: 'Message Parent', action: () => navigate('/support/messages') },
    { icon: Plus, label: 'Add Follow-Up', action: () => navigate('/supportStaff/collaboration') }
  ]

  const isActivePath = (path) => {
    if (path === '/supportStaff') {
      return location.pathname === '/supportStaff' || location.pathname.startsWith('/supportStaff/') && !location.pathname.includes('/support/')
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <main className="flex-1 pb-16 overflow-y-auto">
        <Outlet />
      </main>

      {/* Floating Quick Action Button */}
      <button
        onClick={() => setShowQuickActions(!showQuickActions)}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200"
      >
        {showQuickActions ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>

      {/* Quick Actions Menu */}
      {showQuickActions && (
        <div className="fixed bottom-36 right-4 z-30 space-y-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.action()
                setShowQuickActions(false)
              }}
              className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              <action.icon className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActivePath(item.path)
                  ? 'text-orange-500'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
