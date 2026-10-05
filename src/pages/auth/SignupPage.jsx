import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '@/lib/authService'
import { Users, FolderOpen, ListTodo, Receipt, ArrowLeft, CheckCircle2 } from 'lucide-react'

/**
 * SignupPage — /signup
 *
 * Handles two Supabase behaviours:
 * A) Email confirmation ENABLED: shows "check your email" state with same balanced card.
 * B) Email confirmation DISABLED: navigates directly to /dashboard.
 *
 * Applied Design.md rules:
 * - Two-column desktop composition with brand context panel on the left
 * - Top header with brand and '← Back to home' navigation
 * - Flat bordered card, 4-6px radius, #1F3D3A primary action
 */

const PRODUCT_POINTS = [
  { icon: Users, title: 'Clients', detail: 'Directory & linked projects' },
  { icon: FolderOpen, title: 'Projects', detail: 'Planning → Active → Done' },
  { icon: ListTodo, title: 'Tasks', detail: 'Prioritized deadlines' },
  { icon: Receipt, title: 'Invoices', detail: 'Table-first ledger' },
]

export default function SignupPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return

    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setSubmitting(true)

    const { data, error } = await signUp(email, password)

    if (error) {
      setError(error.message)
      setSubmitting(false)
      return
    }

    if (data.session === null) {
      setConfirmationSent(true)
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

          {/* Left Column: Brand & Product Context */}
          <div className="md:col-span-6 lg:col-span-7 flex flex-col justify-center">
            <span
              className="text-[11px] font-semibold uppercase tracking-widest block mb-3"
              style={{ color: '#1F3D3A', fontFamily: 'var(--font-heading)' }}
            >
              Get Started
            </span>
            <h1
              className="text-2xl sm:text-3xl font-semibold leading-tight mb-4"
              style={{ fontFamily: 'var(--font-heading)', color: '#14161A', letterSpacing: '-0.02em' }}
            >
              Freelance work,<br />kept organized.
            </h1>
            <p className="text-sm leading-relaxed mb-8 max-w-lg" style={{ color: '#6B7078' }}>
              Create your account to start managing active clients, delivery pipelines, task deadlines, and invoice ledgers from a clean interface.
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

          {/* Right Column: Authentication Card / Confirmation State */}
          <div className="md:col-span-6 lg:col-span-5 flex justify-center md:justify-end">
            <div
              className="w-full max-w-md rounded-md p-6 sm:p-8"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E3E1DC',
              }}
            >
              {confirmationSent ? (
                <div className="text-center py-2">
                  <div
                    className="w-10 h-10 rounded-md flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: '#F0EFEC', border: '1px solid #E3E1DC' }}
                  >
                    <CheckCircle2 size={20} style={{ color: '#1F3D3A' }} />
                  </div>
                  <h2
                    className="text-xl font-semibold mb-2"
                    style={{ fontFamily: 'var(--font-heading)', color: '#14161A' }}
                  >
                    Check your inbox
                  </h2>
                  <p className="text-xs sm:text-sm mb-1" style={{ color: '#6B7078' }}>
                    We sent a confirmation link to
                  </p>
                  <p className="text-xs sm:text-sm font-semibold mb-4" style={{ color: '#14161A' }}>
                    {email}
                  </p>
                  <p className="text-xs leading-relaxed mb-6" style={{ color: '#6B7078' }}>
                    Click the activation link in the email, then return to sign in to your workspace.
                  </p>
                  <Link
                    to="/login"
                    className="inline-block w-full rounded-md px-4 py-2 text-sm font-medium transition-colors"
                    style={{ backgroundColor: '#1F3D3A', color: '#FAFAF8' }}
                  >
                    Sign in to account
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h2
                      className="text-xl font-semibold"
                      style={{ fontFamily: 'var(--font-heading)', color: '#14161A' }}
                    >
                      Create your account
                    </h2>
                    <p className="text-xs sm:text-sm mt-1" style={{ color: '#6B7078' }}>
                      Start organizing your freelance work.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} noValidate>
                    <div className="space-y-4">

                      {/* Email field */}
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="signup-email"
                          className="text-xs font-semibold"
                          style={{ color: '#14161A' }}
                        >
                          Email address
                        </label>
                        <input
                          id="signup-email"
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
                        <label
                          htmlFor="signup-password"
                          className="text-xs font-semibold"
                          style={{ color: '#14161A' }}
                        >
                          Password
                        </label>
                        <input
                          id="signup-password"
                          type="password"
                          autoComplete="new-password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                          className="w-full rounded-md px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-offset-1"
                          style={{
                            border: '1px solid #E3E1DC',
                            color: '#14161A',
                            backgroundColor: '#FAFAF8',
                            '--tw-ring-color': '#1F3D3A',
                          }}
                        />
                      </div>

                      {/* Confirm password */}
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="signup-confirm-password"
                          className="text-xs font-semibold"
                          style={{ color: '#14161A' }}
                        >
                          Confirm password
                        </label>
                        <input
                          id="signup-confirm-password"
                          type="password"
                          autoComplete="new-password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
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

                      {/* Submit */}
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
                        {submitting ? 'Creating account…' : 'Create account'}
                      </button>
                    </div>
                  </form>

                  {/* Sign in link */}
                  <div
                    className="mt-6 pt-4 text-center text-xs"
                    style={{ borderTop: '1px solid #E3E1DC', color: '#6B7078' }}
                  >
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="font-medium transition-colors hover:underline"
                      style={{ color: '#1F3D3A' }}
                    >
                      Sign in
                    </Link>
                  </div>
                </>
              )}

            </div>
          </div>

        </div>
      </div>

    </div>
  )
}

