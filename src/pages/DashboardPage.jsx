import { useAuth } from '@/hooks/useAuth'
import AppLayout from '@/components/AppLayout'

/**
 * DashboardPage — /dashboard
 *
 * Phase 1 placeholder only.
 * Renders inside AppLayout shell so navigation to /clients works seamlessly.
 */
export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <span
            className="text-[11px] font-semibold uppercase tracking-widest block mb-1"
            style={{ color: '#1F3D3A', fontFamily: 'var(--font-heading)' }}
          >
            Overview
          </span>
          <h1
            className="text-2xl sm:text-3xl font-semibold leading-tight"
            style={{ fontFamily: 'var(--font-heading)', color: '#14161A', letterSpacing: '-0.02em' }}
          >
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: '#6B7078' }}>
            Signed in as {user?.email}
          </p>
        </div>

        <div
          className="rounded-md p-8 text-center"
          style={{ border: '1px solid #E3E1DC', backgroundColor: '#FFFFFF' }}
        >
          <p className="text-sm font-medium" style={{ color: '#14161A' }}>
            Dashboard summary cards & overload intelligence will be implemented in Phase 6.
          </p>
          <p className="text-xs mt-2" style={{ color: '#6B7078' }}>
            To manage your client directory, navigate to <strong>Clients</strong> in the sidebar.
          </p>
        </div>
      </div>
    </AppLayout>
  )
}

