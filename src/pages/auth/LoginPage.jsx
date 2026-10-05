import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signIn } from '@/lib/authService'
import { Users, FolderOpen, ListTodo, Receipt, ArrowLeft } from 'lucide-react'

/**
 * LoginPage — /login
 *
 * Design.md rules applied:
 * - #FAFAF8 background, flat bordered surfaces (#E3E1DC), no shadow
 * - Archivo headings, Inter body, JetBrains Mono for numbers/codes
 * - #1F3D3A primary button (flat, no gradient)
 * - 4-6px radius on inputs and cards
 * - Top header with brand and explicit '← Back to home' navigation
 * - Desktop two-column composition for visual balance and product grounding
 */

const PRODUCT_POINTS = [
  { icon: Users, title: 'Clients', detail: 'Directory & linked projects' },
  { icon: FolderOpen, title: 'Projects', detail: 'Planning → Active → Done' },
  { icon: ListTodo, title: 'Tasks', detail: 'Prioritized deadlines' },
  { icon: Receipt, title: 'Invoices', detail: 'Table-first ledger' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return

    setError(null)
    setSubmitting(true)

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message)
      setSubmitting(false)
      return
    }

    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FAFAF8', color: '#14161A' }}>

      {/* ── Top Header Bar ──────────────────────────────────────────────── */}
      <header
        className="h-14 flex items-center justify-between sticky top-0 z-20"
        style={{ borderBottom: '1px solid #E3E1DC', backgroundColor: '#FAFAF8' }}
      >
        <div className="max-w-[1720px] w-full mx-auto px-6 sm:px-10 lg:px-12 2xl:px-14 flex items-center justify-between">
          <Link
            to="/"
            className="text-xs font-semibold uppercase tracking-wider"
            style={{
              fontFamily: 'var(--font-heading)',
              color: '#1F3D3A',
              letterSpacing: '0.12em',
            }}
          >
            WorkLedger
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:underline"
            style={{ color: '#6B7078' }}
          >
            <ArrowLeft size={13} />
            <span>Back to home</span>
          </Link>
        </div>
      </header>

      {/* ── Main Two-Column Container ───────────────────────────────────── */}
      <div className="flex-1 max-w-[1720px] w-full mx-auto px-6 sm:px-10 lg:px-12 2xl:px-14 py-10 md:py-16 flex items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 w-full items-center">

          {/* Left Column: Brand & Product Context (Hidden on small mobile) */}
          <div className="md:col-span-6 lg:col-span-7 flex flex-col justify-center">
            <span
              className="text-[11px] font-semibold uppercase tracking-widest block mb-3"
              style={{ color: '#1F3D3A', fontFamily: 'var(--font-heading)' }}
            >
              Workspace Sign In
            </span>
            <h1
              className="text-2xl sm:text-3xl font-semibold leading-tight mb-4"
              style={{ fontFamily: 'var(--font-heading)', color: '#14161A', letterSpacing: '-0.02em' }}
            >
              Freelance work,<br />kept organized.
            </h1>
            <p className="text-sm leading-relaxed mb-8 max-w-lg" style={{ color: '#6B7078' }}>
              Keep clients, projects, tasks, and invoices together in one workspace without spreadsheet sprawl or tool overload.
            </p>

            {/* Compact feature anchors */}
            <div
              className="grid grid-cols-2 gap-3 pt-6 rounded-md"
              style={{ borderTop: '1px solid #E3E1DC' }}
            >
              {PRODUCT_POINTS.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="flex items-start gap-2.5">
                    <div
                      className="w-6 h-6 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: '#F0EFEC', border: '1px solid #E3E1DC' }}
                    >
                      <Icon size={12} style={{ color: '#1F3D3A' }} />
                    </div>
                    <div>
                      <span className="text-xs font-semibold block" style={{ color: '#14161A' }}>
                        {item.title}
                      </span>
                      <span className="text-[11px] leading-tight block" style={{ color: '#6B7078' }}>
                        {item.detail}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Authentication Card */}
          <div className="md:col-span-6 lg:col-span-5 flex justify-center md:justify-end">
            <div
              className="w-full max-w-md rounded-md p-6 sm:p-8"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E3E1DC',
              }}
            >
              <div className="mb-6">
                <h2
                  className="text-xl font-semibold"
                  style={{ fontFamily: 'var(--font-heading)', color: '#14161A' }}
                >
                  Welcome back
                </h2>
                <p className="text-xs sm:text-sm mt-1" style={{ color: '#6B7078' }}>
                  Sign in to your WorkLedger account.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="space-y-4">

                  {/* Email field */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="login-email"
                      className="text-xs font-semibold"
                      style={{ color: '#14161A' }}
                    >
                      Email address
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-md px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-offset-1"
                      style={{
                        border: '1px solid #E3E1DC',
                        color: '#14161A',
                        backgroundColor: '#FAFAF8',
                        '--tw-ring-color': '#1F3D3A',
                      }}
                    />
                  </div>

                  {/* Password field */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="login-password"
                        className="text-xs font-semibold"
                        style={{ color: '#14161A' }}
                      >
                        Password
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-xs transition-colors hover:underline"
                        style={{ color: '#1F3D3A' }}
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <input
                      id="login-password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-md px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-offset-1"
                      style={{
                        border: '1px solid #E3E1DC',
                        color: '#14161A',
                        backgroundColor: '#FAFAF8',
                        '--tw-ring-color': '#1F3D3A',
                      }}
                    />
                  </div>

                  {/* Inline error */}
                  {error && (
                    <p
                      className="text-xs rounded-md px-3 py-2"
                      style={{
                        color: '#C23B22',
                        backgroundColor: '#FEF2F0',
                        border: '1px solid #F5C6BC',
                      }}
                      role="alert"
                    >
                      {error}
                    </p>
                  )}

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-md px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                    style={{
                      backgroundColor: '#1F3D3A',
                      color: '#FAFAF8',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {submitting ? 'Signing in…' : 'Sign in'}
                  </button>
                </div>
              </form>

              {/* Sign up prompt */}
              <div
                className="mt-6 pt-4 text-center text-xs"
                style={{ borderTop: '1px solid #E3E1DC', color: '#6B7078' }}
              >
                Don&apos;t have an account?{' '}
                <Link
                  to="/signup"
                  className="font-medium transition-colors hover:underline"
                  style={{ color: '#1F3D3A' }}
                >
                  Create account
                </Link>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  )
}

