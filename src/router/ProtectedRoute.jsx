import { Navigate, Outlet } from 'react-router-dom'
import { useStore } from '../lib/store'

/**
 * ProtectedRoute
 *
 * Usage A — auth-only guard (wraps a whole layout):
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/teacher" element={...} />
 *   </Route>
 *
 * Usage B — role-scoped guard (wraps a role subtree):
 *   <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
 *     <Route index element={<Dashboard />} />
 *   </Route>
 */
export default function ProtectedRoute({ allowedRoles }) {
  const { currentUser, isHydrated } = useStore(s => ({ currentUser: s.currentUser, isHydrated: s.isHydrated }))

  // Hydrating → wait
  if (!isHydrated) {
    return null
  }

  // Not logged in → go to login
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  // Logged in but wrong role → redirect to own dashboard
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to={`/${currentUser.role}`} replace />
  }

  return <Outlet />
}
