import { useState } from 'react'
import { Link } from 'react-router-dom'
import { sendPasswordResetEmail } from '@/lib/authService'
import { Users, FolderOpen, ListTodo, Receipt, ArrowLeft, CheckCircle2 } from 'lucide-react'

/**
 * ForgotPasswordPage — /forgot-password
 *
 * Uses Supabase's built-in password reset flow.
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return

    setError(null)
    setSubmitting(true)

    const { error } = await sendPasswordResetEmail(email)

    if (error) {
      setError(error.message)
      setSubmitting(false)
      return
    }

    setSent(true)
    setSubmitting(false)
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
              Account Recovery
            </span>
            <h1
              className="text-2xl sm:text-3xl font-semibold leading-tight mb-4"
              style={{ fontFamily: 'var(--font-heading)', color: '#14161A', letterSpacing: '-0.02em' }}
            >
              Freelance work,<br />kept organized.
            </h1>
            <p className="text-sm leading-relaxed mb-8 max-w-lg" style={{ color: '#6B7078' }}>
              Reset your credentials to securely get back to your clients, active project deadlines, and invoice records.
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

          {/* Right Column: Reset Card */}
          <div className="md:col-span-6 lg:col-span-5 flex justify-center md:justify-end">
            <div
              className="w-full max-w-md rounded-md p-6 sm:p-8"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E3E1DC',
              }}
            >
              {sent ? (
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
                    Reset link sent
                  </h2>
                  <p className="text-xs sm:text-sm mb-1" style={{ color: '#6B7078' }}>
                    If an account exists for
                  </p>
                  <p className="text-xs sm:text-sm font-semibold mb-4" style={{ color: '#14161A' }}>
                    {email}
                  </p>
                  <p className="text-xs leading-relaxed mb-6" style={{ color: '#6B7078' }}>
                    You will receive a password reset link shortly. Please check your spam folder if it doesn&apos;t arrive within a few minutes.
                  </p>
                  <Link
                    to="/login"
                    className="inline-block w-full rounded-md px-4 py-2 text-sm font-medium transition-colors text-center"
                    style={{ backgroundColor: '#1F3D3A', color: '#FAFAF8' }}
                  >
                    Return to sign in
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h2
                      className="text-xl font-semibold"
                      style={{ fontFamily: 'var(--font-heading)', color: '#14161A' }}
                    >
                      Reset password
                    </h2>
                    <p className="text-xs sm:text-sm mt-1" style={{ color: '#6B7078' }}>
                      Enter your email address and we will send you a reset link.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} noValidate>
                    <div className="space-y-4">

                      {/* Email field */}
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="forgot-email"
                          className="text-xs font-semibold"
                          style={{ color: '#14161A' }}
                        >
                          Email address
                        </label>
                        <input
                          id="forgot-email"
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
                        {submitting ? 'Sending…' : 'Send reset link'}
                      </button>
                    </div>
                  </form>

                  {/* Return to login link */}
                  <div
                    className="mt-6 pt-4 text-center text-xs"
                    style={{ borderTop: '1px solid #E3E1DC', color: '#6B7078' }}
                  >
                    Remembered your password?{' '}
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

