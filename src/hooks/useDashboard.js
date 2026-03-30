import { useState, useRef, useCallback, useEffect } from 'react'

/**
 * useDashboard — shared navigation state machine for all role dashboards.
 *
 * Handles:
 *   - subPage / activeNav state
 *   - history stack for proper back navigation
 *   - navigate() / goBack() / goHome() / navSelect()
 *   - showAddWidgets toggle
 *   - gradeflow-home global event listener
 *   - scroll-to-top on every transition
 *
 * @param {Object} options
 * @param {Object}   options.navToPage     Maps BottomNav IDs → subPage keys  (role-specific)
 * @param {Object}   options.pageToNav     Maps subPage keys → BottomNav IDs  (role-specific)
 * @param {Function} [options.onGoHome]    Optional extra side-effect on home reset (e.g. store.setScreen)
 * @param {Function} [options.onNavigate]  Optional side-effect called with every page id on navigate
 *
 * @returns {{
 *   subPage, setSubPage,
 *   activeNav, setActiveNav,
 *   isSubPage,
 *   showAddWidgets, setShowAddWidgets,
 *   navigate, goBack, goHome, navSelect,
 * }}
 *
 * Usage (inside a dashboard component):
 *
 *   const {
 *     subPage, activeNav, isSubPage,
 *     showAddWidgets, setShowAddWidgets,
 *     navigate, goBack, goHome, navSelect,
 *   } = useDashboard({ navToPage: NAV_TO_PAGE, pageToNav: PAGE_TO_NAV })
 */
export function useDashboard({ navToPage = {}, pageToNav = {}, onGoHome, onNavigate } = {}) {
  const [subPage,         setSubPage]         = useState(null)
  const [activeNav,       setActiveNav]       = useState('dashboard')
  const [showAddWidgets,  setShowAddWidgets]  = useState(false)
  const history = useRef([])

  const scrollTop = () => {
    window.scrollTo(0, 0)
    document.querySelector('[data-app-scroll]')?.scrollTo(0, 0)
  }

  // ── goHome ────────────────────────────────────────────────────────────────
  const goHome = useCallback(() => {
    history.current = []
    setSubPage(null)
    setActiveNav('dashboard')
    scrollTop()
    onGoHome?.()
  }, [onGoHome])

  // ── navigate ──────────────────────────────────────────────────────────────
  const navigate = useCallback((id) => {
    if (!id) return
    if (id === 'dashboard') { goHome(); return }
    if (id === 'logout')    { goHome(); return }
    history.current.push(id)
    setSubPage(id)
    setActiveNav(pageToNav[id] ?? id ?? 'dashboard')
    scrollTop()
    onNavigate?.(id)
  }, [goHome, pageToNav, onNavigate])

  // ── goBack ────────────────────────────────────────────────────────────────
  const goBack = useCallback(() => {
    if (history.current.length === 0) { goHome(); return }
    history.current.pop()
    const prev = history.current[history.current.length - 1] ?? null
    if (!prev) { goHome(); return }
    setSubPage(prev)
    setActiveNav(pageToNav[prev] ?? prev ?? 'dashboard')
    scrollTop()
  }, [goHome, pageToNav])

  // ── navSelect (called by BottomNav onSelect) ──────────────────────────────
  const navSelect = useCallback((id) => {
    if (!id) return
    if (id === '__back__') { goBack(); return }
    const page = navToPage[id]
    if (page === null) { goHome(); return }
    if (page === undefined) return
    setActiveNav(id)
    navigate(page)
  }, [navToPage, goBack, goHome, navigate])

  // ── gradeflow-home global event (GradeFlow logo click in AppShell) ────────
  useEffect(() => {
    const handler = () => goHome()
    window.addEventListener('gradeflow-home', handler)
    return () => window.removeEventListener('gradeflow-home', handler)
  }, [goHome])

  return {
    subPage,
    setSubPage,
    activeNav,
    setActiveNav,
    isSubPage: subPage !== null,
    showAddWidgets,
    setShowAddWidgets,
    navigate,
    goBack,
    goHome,
    navSelect,
  }
}
