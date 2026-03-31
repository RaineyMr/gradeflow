import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@lib/store';
import { initializeRouter } from '@lib/hashRouter';

/**
 * Custom hook that integrates hash-based routing with React Router
 * 
 * This hook:
 * 1. Initializes the hash router on component mount
 * 2. Syncs hash changes to Zustand store
 * 3. Provides navigation functions that update both hash and React Router
 * 4. Handles browser back/forward buttons
 */
export const useHashRouter = () => {
  const navigate = useNavigate();
  const { currentUser, page, setPage, resetToHome, goBack } = useStore();

  // Initialize router on mount
  useEffect(() => {
    const cleanup = initializeRouter({ getState: () => ({ page }), setState: setPage });
    return cleanup;
  }, [setPage]);

  /**
   * Navigate to a page using both hash routing and React Router
   * @param {string} page - The page name (e.g., 'gradebook', 'messages')
   * @param {string} [role] - Optional role (defaults to currentUser.role)
   */
  const navigateToPage = (page, role = currentUser?.role) => {
    // Use store's enhanced setPage method
    setPage(page);
    
    // Navigate with React Router for actual routing
    const path = role ? `/${role}/${page}` : `/${page}`;
    navigate(path);
  };

  /**
   * Navigate to home dashboard for the current user's role
   */
  const navigateToHome = () => {
    resetToHome();
    
    // Navigate with React Router
    const role = currentUser?.role || 'teacher';
    const homePath = role === 'admin' ? '/admin' : `/${role}`;
    navigate(homePath);
  };

  /**
   * Get current hash-based page
   */
  const getCurrentPage = () => page;

  return {
    navigateToPage,
    navigateToHome,
    getCurrentPage,
    currentPage: page,
    goBack, // Expose the store's goBack method
  };
};
