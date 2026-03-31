# Hash Router Integration for GradeFlow

This document explains the hash-based router implementation that syncs browser history with Zustand page state and supports role-based navigation.

## Overview

The hash router provides:
- **Bookmarkable URLs**: Users can bookmark specific pages like `#/teacher/gradebook`
- **Browser history support**: Back/forward buttons work correctly
- **Role-based navigation**: URLs include role context (`#/teacher/gradebook` vs `#/student/gradebook`)
- **State synchronization**: Hash changes sync with Zustand store
- **Seamless integration**: Works alongside existing React Router

## Files Added/Modified

### New Files
- `src/lib/hashRouter.js` - Core hash router utilities
- `src/hooks/useHashRouter.js` - React hook for hash router integration
- `src/components/HashRouterDemo.jsx` - Demo component for testing

### Modified Files
- `src/lib/store.js` - Added `page` state and `setPage` action
- `src/components/layout/AppShell.jsx` - Updated navigation to use hash router
- `src/App.jsx` - Updated login handler to use hash router
- `src/pages/Dashboard.jsx` - Added demo component

## API Reference

### Core Functions (`src/lib/hashRouter.js`)

#### `hashToPage(hash)`
Parses browser hash to extract page name.
```javascript
hashToPage('#/teacher/gradebook') // returns 'gradebook'
hashToPage('#/gradebook') // returns 'gradebook'
hashToPage('#/') // returns 'home'
```

#### `pageToHash(page, role)`
Converts page and role to hash URL.
```javascript
pageToHash('gradebook', 'teacher') // returns '#/teacher/gradebook'
pageToHash('home', 'teacher') // returns '#/teacher/'
pageToHash('gradebook', null) // returns '#/gradebook'
```

#### `initializeRouter(store)`
Sets up hash router on app mount. Returns cleanup function.
```javascript
const cleanup = initializeRouter(useStore)
// Call cleanup() on unmount
```

#### `navigateTo(page, role)`
Navigates to a page and updates browser history.
```javascript
navigateTo('gradebook', 'teacher')
// URL becomes: #/teacher/gradebook
// Browser back button works
```

### React Hook (`src/hooks/useHashRouter.js`)

#### `useHashRouter()`
Returns navigation functions that sync hash router with React Router.

```javascript
const {
  navigateToPage,    // Navigate to specific page
  navigateToHome,    // Navigate to role home
  getCurrentPage,    // Get current page from store
  currentPage        // Current page value
} = useHashRouter()
```

## Usage Examples

### Basic Navigation
```javascript
import { useHashRouter } from '@hooks/useHashRouter'

function MyComponent() {
  const { navigateToPage, navigateToHome } = useHashRouter()
  
  const handleGradebookClick = () => {
    navigateToPage('gradebook') // Uses current user's role
  }
  
  const handleHomeClick = () => {
    navigateToHome()
  }
  
  return (
    <div>
      <button onClick={handleGradebookClick}>Gradebook</button>
      <button onClick={handleHomeClick}>Home</button>
    </div>
  )
}
```

### Role-Specific Navigation
```javascript
const { navigateToPage } = useHashRouter()

// Navigate to teacher gradebook
navigateToPage('gradebook', 'teacher')

// Navigate to student messages
navigateToPage('messages', 'student')
```

### Direct Hash Manipulation
```javascript
import { hashToPage, pageToHash, navigateTo } from '@lib/hashRouter'

// Parse current hash
const currentPage = hashToPage(window.location.hash)

// Create hash for specific page/role
const hash = pageToHash('reports', 'admin')

// Navigate directly
navigateTo('reports', 'admin')
```

## URL Structure

The hash router supports these URL patterns:

```
#/                    → home (no role specified)
#/gradebook           → gradebook (no role specified)
#/teacher/            → teacher home
#/teacher/gradebook   → teacher gradebook
#/teacher/messages    → teacher messages
#/student/            → student home
#/student/messages    → student messages
#/admin/              → admin home
#/admin/reports       → admin reports
```

## Integration with React Router

The hash router works alongside React Router:

1. **Hash router** manages bookmarkable URLs and browser history
2. **React Router** handles actual component rendering and route matching
3. **Zustand store** keeps both systems in sync

When you call `navigateToPage('gradebook', 'teacher')`:
1. Hash updates to `#/teacher/gradebook`
2. Zustand store page updates to `'gradebook'`
3. React Router navigates to `/teacher/gradebook`

## Testing

A demo component is included in the teacher dashboard to test the hash router:

1. Login as a teacher
2. Look for the "Hash Router Demo" widget
3. Try the navigation buttons
4. Test browser back/forward buttons
5. Check that URLs update correctly

## Benefits

1. **Bookmarkable URLs**: Users can bookmark specific pages
2. **Shareable Links**: Links work when shared with other users
3. **Browser History**: Native back/forward button support
4. **Role Context**: URLs include role for better UX
5. **State Sync**: Hash and store state always match
6. **Minimal Changes**: Works with existing React Router setup

## Migration Notes

- Existing navigation continues to work
- New navigation should use `useHashRouter()` hook
- No changes needed for route definitions
- Backward compatible with current URL structure

## Troubleshooting

### Hash not updating
- Ensure `useHashRouter()` is called in component
- Check that `navigateToPage()` is used instead of direct navigation

### Store state not syncing
- Verify `initializeRouter()` is called on app mount
- Check that `setPage` action exists in store

### Browser history not working
- Ensure `popstate` listener is properly set up
- Check that `navigateTo()` is used instead of `window.location.hash =`

## Future Enhancements

- Route-specific parameters (e.g., `#/teacher/assignment/123`)
- Query parameter support
- Route guards and permissions
- Transition animations
- Route-based code splitting
