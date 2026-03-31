/**
 * Hash-based router - syncs browser history with Zustand page state
 * Supports role-based navigation: #/teacher/gradebook or #/gradebook
 */

/**
 * Parse browser hash to get current page
 * Examples:
 *   "#/" → "home"
 *   "#/gradebook" → "gradebook"
 *   "#/teacher/gradebook" → "gradebook"
 *   "#/teacher/assignment/123" → "assignment" (ignores query params in hash)
 */
export const hashToPage = (hash) => {
  // Remove leading # and /
  const path = hash.replace(/^#\/?/, '');

  if (!path) return 'home';

  // Split by / and filter empty segments
  const segments = path.split('/').filter(Boolean);

  if (segments.length === 0) return 'home';

  // List of valid roles to skip
  const roles = ['teacher', 'student', 'parent', 'admin', 'supportStaff'];

  // If first segment is a role, skip it
  const startIdx = roles.includes(segments[0]) ? 1 : 0;
  const page = segments[startIdx];

  return page || 'home';
};

/**
 * Convert page + role to hash URL
 * Examples:
 *   ('home', 'teacher') → "#/teacher/"
 *   ('gradebook', 'teacher') → "#/teacher/gradebook"
 *   ('assignment', null) → "#/assignment"
 */
export const pageToHash = (page, role = null) => {
  if (page === 'home' || !page) {
    return role ? `#/${role}/` : '#/';
  }

  return role ? `#/${role}/${page}` : `#/${page}`;
};

/**
 * Initialize router on app mount
 * - Syncs initial hash to page state (only if user is authenticated)
 * - Listens for browser back/forward events
 * Returns cleanup function
 */
export const initializeRouter = (store) => {
  // Only sync hash to page if user is authenticated
  const currentUser = store.getState().currentUser;
  if (currentUser) {
    const initialPage = hashToPage(window.location.hash);
    if (initialPage !== store.getState().page) {
      store.setState({ page: initialPage });
    }
  }

  // Listen for popstate (browser back/forward)
  const handlePopState = () => {
    const currentUser = store.getState().currentUser;
    if (currentUser) {
      const newPage = hashToPage(window.location.hash);
      store.setState({ page: newPage });
    }
  };

  window.addEventListener('popstate', handlePopState);

  return () => {
    window.removeEventListener('popstate', handlePopState);
  };
};

/**
 * Navigate to a page and update browser history
 * Call this instead of store.setState({ page })
 *
 * Example:
 *   navigateTo('gradebook', 'teacher')
 *   // URL becomes: #/teacher/gradebook
 *   // Browser back button works
 */
export const navigateTo = (page, role = null, store = null) => {
  const hash = pageToHash(page, role);

  // Only push if hash actually changed (prevents duplicate history entries)
  if (window.location.hash !== hash) {
    window.history.pushState({ page, role }, '', hash);
  }

  // Update Zustand state if store is provided
  if (store) {
    store.setState({ page });
  }
};

/**
 * Get the current hash from browser
 */
export const getCurrentHash = () => {
  return window.location.hash;
};

/**
 * Manually set hash without going through navigateTo
 * (Used internally by popstate handler)
 */
export const setHashSilent = (hash) => {
  if (window.location.hash !== hash) {
    window.history.replaceState({}, '', hash);
  }
};
