import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { signOut } from '@/lib/authService'
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  ListTodo,
  Receipt,
  Sparkles,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

/**
 * AppLayout
 *
 * Persistent application shell for authenticated screens.
 *
 * Design.md & Rules.md specifications:
 * - Persistent left sidebar (desktop), flat with 1px solid var(--border) right edge
 * - Nav order: Dashboard, Clients, Projects, Tasks, Invoices, AI Assistant, Logout
 * - Active state: left-border accent in --primary (#1F3D3A) + bold text, not a filled pill
 * - Max content width: max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12 2xl:px-14
 * - Mobile: collapsible top bar / mobile drawer
 * - 4–6px radius, flat surfaces, zero gradients/shadows
 */

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Clients', to: '/clients', icon: Users },
  { label: 'Projects', to: '/projects', icon: FolderOpen, disabled: true },
  { label: 'Tasks', to: '/tasks', icon: ListTodo, disabled: true },
  { label: 'Invoices', to: '/invoices', icon: Receipt, disabled: true },
  { label: 'AI Assistant', to: '#ai', icon: Sparkles, disabled: true },
]

export default function AppLayout({ children }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  async function handleLogout() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row"
      style={{ backgroundColor: '#FAFAF8', color: '#14161A' }}
    >
      {/* ── Desktop Sidebar ──────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col w-60 flex-shrink-0 min-h-screen sticky top-0"
        style={{
          backgroundColor: '#FAFAF8',
          borderRight: '1px solid #E3E1DC',
        }}
      >
        {/* Wordmark Header */}
        <div
          className="h-14 px-6 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: '1px solid #E3E1DC' }}
        >
          <Link
            to="/dashboard"
            className="text-xs font-semibold uppercase tracking-wider"
            style={{
              fontFamily: 'var(--font-heading)',
              color: '#1F3D3A',
              letterSpacing: '0.12em',
            }}
          >
            WorkLedger
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 flex flex-col justify-between">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon

              if (item.disabled) {
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 px-6 py-2.5 text-xs font-medium cursor-not-allowed opacity-40 select-none"
                    style={{ color: '#6B7078' }}
                    title="Available in upcoming phase"
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                )
              }

              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-6 py-2.5 text-xs font-medium transition-colors ${
                      isActive
                        ? 'border-l-4 font-semibold'
                        : 'border-l-4 border-transparent hover:bg-[#F0EFEC]'
                    }`
                  }
                  style={({ isActive }) => ({
                    borderColor: isActive ? '#1F3D3A' : 'transparent',
                    color: isActive ? '#1F3D3A' : '#6B7078',
                    backgroundColor: isActive ? '#F0EFEC' : 'transparent',
                  })}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </div>

          {/* User & Logout section */}
          <div
            className="pt-4 px-6 space-y-3"
            style={{ borderTop: '1px solid #E3E1DC' }}
          >
            <div className="truncate">
              <span className="text-[10px] font-semibold uppercase tracking-wider block" style={{ color: '#6B7078' }}>
                Account
              </span>
              <span className="text-xs font-medium truncate block" style={{ color: '#14161A' }} title={user?.email}>
                {user?.email}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full text-xs font-medium py-2 transition-colors hover:text-[#C23B22]"
              style={{ color: '#6B7078' }}
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* ── Mobile Top Header Bar ────────────────────────────────────────── */}
      <header
        className="md:hidden h-14 px-6 flex items-center justify-between sticky top-0 z-30"
        style={{ backgroundColor: '#FAFAF8', borderBottom: '1px solid #E3E1DC' }}
      >
        <Link
          to="/dashboard"
          className="text-xs font-semibold uppercase tracking-wider"
          style={{
            fontFamily: 'var(--font-heading)',
            color: '#1F3D3A',
            letterSpacing: '0.12em',
          }}
        >
          WorkLedger
        </Link>
        <button
          onClick={() => setMobileNavOpen((v) => !v)}
          className="p-2 -mr-2"
          aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Nav Drawer */}
      {mobileNavOpen && (
        <div
          className="md:hidden px-6 py-4 flex flex-col gap-2 z-20"
          style={{ backgroundColor: '#FAFAF8', borderBottom: '1px solid #E3E1DC' }}
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            if (item.disabled) {
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 py-2 text-xs font-medium opacity-40 select-none"
                  style={{ color: '#6B7078' }}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </div>
              )
            }
            return (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={() => setMobileNavOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-2 text-xs ${
                    isActive ? 'font-semibold text-[#1F3D3A]' : 'text-[#6B7078]'
                  }`
                }
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
          <div className="pt-3 mt-2" style={{ borderTop: '1px solid #E3E1DC' }}>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full text-xs font-medium py-2 text-[#C23B22]"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Main Screen Viewport ─────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12 2xl:px-14 py-8 md:py-10 flex-1">
          {children}
        </div>
      </main>
    </div>
  )
}
