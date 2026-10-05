import { createContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

/**
 * AuthContext — exported so useAuth (in hooks/useAuth.js) can import it.
 * Do not use this directly in components — use the useAuth() hook instead.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null)

/**
 * AuthProvider — wrap the whole app with this.
 *
 * Holds the authenticated user and session. Any component inside can call
 * useAuth() to read the current auth state without prop-drilling.
 *
 * `loading` is true while Supabase checks for an existing session on page
 * load (reads from localStorage). ProtectedRoute waits for this to resolve
 * before deciding whether to redirect — prevents a flash redirect for users
 * who are already logged in.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Check for an existing session on first load.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 2. Subscribe to auth state changes (login, logout, token refresh).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    // 3. Clean up on unmount.
    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,     // Authenticated user object (null when signed out)
    session,  // Full session (includes access_token, expires_at, etc.)
    loading,  // True only during the initial page-load session check
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
