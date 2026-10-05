import { Link } from 'react-router-dom'
import { ArrowLeft, Mail } from 'lucide-react'

/**
 * ContactPage — /contact
 *
 * Simple, honest public placeholder page matching WorkLedger's Swiss/editorial design system.
 */
export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FAFAF8', color: '#14161A' }}>
      
      {/* Top Header */}
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

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-6 sm:px-10 lg:px-12 2xl:px-14 py-12 md:py-16">
        <div className="mb-8">
          <span
            className="text-[11px] font-semibold uppercase tracking-widest block mb-2"
            style={{ color: '#1F3D3A', fontFamily: 'var(--font-heading)' }}
          >
            Communication
          </span>
          <h1
            className="text-2xl sm:text-3xl font-semibold leading-tight"
            style={{ fontFamily: 'var(--font-heading)', color: '#14161A', letterSpacing: '-0.02em' }}
          >
            Contact
          </h1>
          <p className="text-sm mt-2" style={{ color: '#6B7078' }}>
            Get in touch regarding inquiries, workspace feedback, or platform questions.
          </p>
        </div>

        <div
          className="rounded-md p-6 sm:p-8 space-y-6"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E3E1DC' }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#F0EFEC', border: '1px solid #E3E1DC' }}
            >
              <Mail size={16} style={{ color: '#1F3D3A' }} />
            </div>
            <div>
              <h2
                className="text-base font-semibold mb-1"
                style={{ fontFamily: 'var(--font-heading)', color: '#14161A' }}
              >
                Inquiries & Feedback
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: '#6B7078' }}>
                For questions regarding WorkLedger or account assistance, direct communication channels will be opened here during active rollout.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #E3E1DC', backgroundColor: '#FAFAF8' }}>
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between text-xs" style={{ color: '#6B7078' }}>
          <span>© 2026 WorkLedger</span>
          <Link to="/" className="hover:underline" style={{ color: '#1F3D3A' }}>
            Return to home
          </Link>
        </div>
      </footer>

    </div>
  )
}
