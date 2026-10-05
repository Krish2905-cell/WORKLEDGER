import { Link } from 'react-router-dom'
import { ArrowLeft, HelpCircle } from 'lucide-react'

/**
 * HelpPage — /help
 *
 * Simple, honest public placeholder page matching WorkLedger's Swiss/editorial design system.
 */
export default function HelpPage() {
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
            Documentation & Support
          </span>
          <h1
            className="text-2xl sm:text-3xl font-semibold leading-tight"
            style={{ fontFamily: 'var(--font-heading)', color: '#14161A', letterSpacing: '-0.02em' }}
          >
            Help & Documentation
          </h1>
          <p className="text-sm mt-2" style={{ color: '#6B7078' }}>
            Guidance on managing clients, projects, tasks, and invoices in WorkLedger.
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
              <HelpCircle size={16} style={{ color: '#1F3D3A' }} />
            </div>
            <div>
              <h2
                className="text-base font-semibold mb-1"
                style={{ fontFamily: 'var(--font-heading)', color: '#14161A' }}
              >
                Help Center
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: '#6B7078' }}>
                Documentation and user guides will be made available here as new features are released.
              </p>
            </div>
          </div>

          <div
            className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs"
            style={{ borderTop: '1px solid #E3E1DC' }}
          >
            <div className="p-4 rounded-sm" style={{ backgroundColor: '#FAFAF8', border: '1px solid #E3E1DC' }}>
              <span className="font-semibold block mb-1" style={{ color: '#14161A' }}>
                Workspace Structure
              </span>
              <span style={{ color: '#6B7078' }}>
                Learn how projects connect with clients, tasks, and billing ledgers.
              </span>
            </div>
            <div className="p-4 rounded-sm" style={{ backgroundColor: '#FAFAF8', border: '1px solid #E3E1DC' }}>
              <span className="font-semibold block mb-1" style={{ color: '#14161A' }}>
                Workload Intelligence
              </span>
              <span style={{ color: '#6B7078' }}>
                Understand automatic overload triggers across multiple active client deadlines.
              </span>
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
