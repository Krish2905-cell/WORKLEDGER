import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

/**
 * ProtectedRoute
 *
 * Wraps routes that require authentication. Works in three states:
 *
 * 1. Loading  → Renders a minimal loading indicator while Supabase checks
 *               the stored session. We cannot make a redirect decision yet.
 *
 * 2. No user  → Redirects to /login. The `replace` prop means the /dashboard
 *               URL won't be added to the browser history, so the Back button
 *               won't return the user to a page they can't access.
 *
 * 3. User present → Renders the child route normally.
 *
 * Usage in App.jsx:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<DashboardPage />} />
 *   </Route>
 */
import { Outlet } from 'react-router-dom'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    // Minimal loading state — just enough to prevent a flash redirect.
    // Styled to match the app background so there's no visual flicker.
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#FAFAF8' }}
      >
        <span className="text-sm" style={{ color: '#6B7078' }}>
          Loading…
        </span>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // User is authenticated — render the nested route.
  return <Outlet />
}
