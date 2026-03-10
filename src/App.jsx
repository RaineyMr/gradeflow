const navItems = [
  { id: 'dashboard', icon: '🏠', label: 'Home', action: goHome },
  { id: 'gradebook', icon: '📚', label: 'Classes', action: () => goTo('gradebook') },
  { id: 'reports', icon: '📊', label: 'Reports', action: () => goTo('reports') },
  {
    id: 'newAssign',
    icon: '➕',
    label: 'New',
    action: () => openQuickCreate('quiz'),
    special: true,
  },
  { id: 'parentMessages', icon: '💬', label: 'Messages', action: () => goTo('parentMessages') },
]
