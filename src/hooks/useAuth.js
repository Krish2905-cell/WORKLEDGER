import { useContext } from 'react'
import { AuthContext } from '@/contexts/AuthContext'

/**
 * useAuth — convenience hook for accessing auth state.
 *
 * Separated into its own file so AuthContext.jsx only exports a component
 * (required by the react-refresh/only-export-components lint rule).
 *
 * Usage:
 *   const { user, session, loading } = useAuth()
 *
 * Must be used inside a component that is a descendant of <AuthProvider>.
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
