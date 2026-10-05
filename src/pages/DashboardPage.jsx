import { signOut } from '@/lib/authService'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

/**
 * DashboardPage — /dashboard
 *
 * Phase 1 placeholder only.
 * This exists solely so the authenticated route has something to render.
 *
 * DO NOT add any dashboard UI, data fetching, cards, or business logic here.
 * The real dashboard will be implemented in Phase 2.
 */
export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  async function handleLogout() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ backgroundColor: '#FAFAF8' }}
    >
      <h1
        className="text-2xl font-semibold"
        style={{ fontFamily: 'var(--font-heading)', color: '#14161A' }}
      >
        WorkLedger
      </h1>
      <p className="text-sm" style={{ color: '#6B7078' }}>
        Signed in as {user?.email}
      </p>
      <p className="text-sm" style={{ color: '#6B7078' }}>
        Dashboard — coming in Phase 2
      </p>
      <button
        onClick={handleLogout}
        className="mt-4 rounded-md px-4 py-2 text-sm font-medium transition-colors"
        style={{
          border: '1px solid #E3E1DC',
          color: '#14161A',
          backgroundColor: '#FFFFFF',
        }}
      >
        Sign out
      </button>
    </div>
  )
}
