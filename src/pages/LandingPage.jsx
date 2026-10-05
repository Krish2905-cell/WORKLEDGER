import { Link, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  Briefcase,
  Clock,
  DollarSign,
  TriangleAlert,
  Menu,
  X,
  Users,
  FolderOpen,
  ListTodo,
  Receipt,
  ArrowRight,
  LayoutDashboard,
} from 'lucide-react'

/**
 * LandingPage — /
 *
 * Public marketing page. No Supabase data is fetched here.
 * All dashboard preview values are static and for illustration only.
 *
 * Authenticated users are redirected to /dashboard.
 *
 * Design.md rules applied:
 * - #FAFAF8 background, #1F3D3A primary, flat bordered surfaces
 * - Archivo headings, Inter body, JetBrains Mono for numeric values
 * - No gradients, no glassmorphism, no decorative shadows
 * - 4–6px radius throughout
 * - Status colors used only for their defined semantic meaning
 */

// ─── Static demo data ─────────────────────────────────────────────────────────

const PREVIEW_NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Clients', icon: Users, active: false },
  { label: 'Projects', icon: FolderOpen, active: false },
  { label: 'Tasks', icon: ListTodo, active: false },
  { label: 'Invoices', icon: Receipt, active: false },
]

const PREVIEW_TASKS = [
  {
    id: 1,
    title: 'Brand identity guidelines v2',
    project: 'Acme Studio',
    due: 'Today',
    overdue: true,
    completed: false,
  },
  {
    id: 2,
    title: 'Design review & client handoff',
    project: 'Buildify Co',
    due: 'Oct 7',
    overdue: false,
    completed: false,
  },
  {
    id: 3,
    title: 'Invoice milestone 2 signoff',
    project: 'Zenith Labs',
    due: 'Oct 9',
    overdue: false,
    completed: false,
  },
  {
    id: 4,
    title: 'Mobile checkout wireframes',
    project: 'Buildify Co',
    due: 'Oct 12',
    overdue: false,
    completed: true,
  },
]

const PREVIEW_PROJECTS = [
  {
    id: 1,
    name: 'Brand Guidelines',
    client: 'Acme Studio',
    status: 'Active',
    statusColor: '#1F3D3A',
    unpaid: '₹14,500',
  },
  {
    id: 2,
    name: 'Marketing Web App',
    client: 'Buildify Co',
    status: 'Active',
    statusColor: '#1F3D3A',
    unpaid: '₹10,000',
  },
  {
    id: 3,
    name: 'Product Audit',
    client: 'Zenith Labs',
    status: 'Completed',
    statusColor: '#2F6E4F',
    unpaid: '₹0',
  },
]

const PREVIEW_RECENT_INVOICES = [
  {
    id: 'INV-1042',
    client: 'Acme Studio',
    amount: '₹14,500',
    date: 'Oct 02',
    status: 'Unpaid',
    statusColor: '#C23B22',
  },
  {
    id: 'INV-1041',
    client: 'Buildify Co',
    amount: '₹10,000',
    date: 'Sep 28',
    status: 'Unpaid',
    statusColor: '#C23B22',
  },
  {
    id: 'INV-1040',
    client: 'Zenith Labs',
    amount: '₹18,000',
    date: 'Sep 15',
    status: 'Paid',
    statusColor: '#2F6E4F',
  },
]

const CORE_MODULES = [
  {
    icon: Users,
    title: 'Clients',
    code: '01 / CLIENTS',
    description: 'Keep contact records, ongoing work, and billing histories linked in one unified directory.',
  },
  {
    icon: FolderOpen,
    title: 'Projects',
    code: '02 / PIPELINES',
    description: 'Track progress across Planning, Active, and Completed states with zero board clutter.',
  },
  {
    icon: ListTodo,
    title: 'Tasks',
    code: '03 / SCHEDULE',
    description: 'Unified cross-project task list prioritized by approaching deadline urgency.',
  },
  {
    icon: Receipt,
    title: 'Invoices',
    code: '04 / FINANCIALS',
    description: 'Table-first ledger tracking outstanding balances, payment terms, and unpaid totals.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { user, loading } = useAuth()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Redirect authenticated users to the dashboard.
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF8', color: '#14161A' }}>

      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30"
        style={{ borderBottom: '1px solid #E3E1DC', backgroundColor: '#FAFAF8' }}
      >
        <div className="max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12 2xl:px-14 h-14 flex items-center justify-between">

          {/* Wordmark */}
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

          {/* Desktop nav: Help, Contact, Sign In, Get Started */}
          <nav className="hidden md:flex items-center gap-5">
            <Link
              to="/help"
              className="text-xs font-medium transition-colors hover:underline"
              style={{ color: '#6B7078' }}
            >
              Help
            </Link>
            <Link
              to="/contact"
              className="text-xs font-medium transition-colors hover:underline"
              style={{ color: '#6B7078' }}
            >
              Contact
            </Link>
            <Link
              to="/login"
              className="px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors"
              style={{ color: '#14161A' }}
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-1.5 text-xs font-medium rounded-md transition-colors"
              style={{ backgroundColor: '#1F3D3A', color: '#FAFAF8' }}
            >
              Get Started
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2"
            style={{ color: '#14161A' }}
            onClick={() => setMobileNavOpen(v => !v)}
            aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile nav panel */}
        {mobileNavOpen && (
          <div
            className="md:hidden px-6 py-4 flex flex-col gap-3"
            style={{ borderTop: '1px solid #E3E1DC', backgroundColor: '#FAFAF8' }}
          >
            <Link
              to="/help"
              className="text-sm py-1.5"
              style={{ color: '#6B7078' }}
              onClick={() => setMobileNavOpen(false)}
            >
              Help
            </Link>
            <Link
              to="/contact"
              className="text-sm py-1.5"
              style={{ color: '#6B7078' }}
              onClick={() => setMobileNavOpen(false)}
            >
              Contact
            </Link>
            <Link
              to="/login"
              className="text-sm py-1.5"
              style={{ color: '#14161A' }}
              onClick={() => setMobileNavOpen(false)}
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 text-sm font-medium rounded-md text-center mt-1"
              style={{ backgroundColor: '#1F3D3A', color: '#FAFAF8' }}
              onClick={() => setMobileNavOpen(false)}
            >
              Get Started
            </Link>
          </div>
        )}
      </header>

      {/* ── Hero Section (Two-Column Desktop, Stacked Mobile) ──────────── */}
      <section className="max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12 2xl:px-14 pt-10 sm:pt-14 pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 xl:gap-16 items-start">

          {/* Left Column: Value Proposition & Action (42-45% width) */}
          <div className="lg:col-span-5 pt-1 lg:pt-3">
            <div
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm text-xs font-medium mb-4"
              style={{
                backgroundColor: '#F0EFEC',
                color: '#1F3D3A',
                border: '1px solid #E3E1DC',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#1F3D3A' }} />
              Calm freelance workspace
            </div>
            
            <h1
              className="font-semibold leading-tight mb-4"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2.15rem, 3.8vw, 2.85rem)',
                color: '#14161A',
                letterSpacing: '-0.02em',
              }}
            >
              Freelance work,<br className="hidden sm:inline" /> kept organized.
            </h1>
            
            <p
              className="text-sm sm:text-base leading-relaxed mb-6 max-w-xl"
              style={{ color: '#6B7078' }}
            >
              Manage clients, projects, tasks, deadlines, and invoices from one workspace.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
              <Link
                to="/signup"
                className="px-5 py-2.5 text-sm font-medium rounded-md text-center inline-flex items-center justify-center gap-2 transition-colors"
                style={{ backgroundColor: '#1F3D3A', color: '#FAFAF8' }}
              >
                <span>Get Started</span>
                <ArrowRight size={15} />
              </Link>
              <Link
                to="/login"
                className="px-5 py-2.5 text-sm rounded-md text-center transition-colors"
                style={{
                  border: '1px solid #E3E1DC',
                  backgroundColor: '#FFFFFF',
                  color: '#14161A',
                }}
              >
                Sign In
              </Link>
            </div>

            {/* Structured Swiss architectural notes */}
            <div
              className="pt-6 grid grid-cols-2 gap-4 text-xs"
              style={{ borderTop: '1px solid #E3E1DC' }}
            >
              <div>
                <span className="font-semibold block mb-0.5" style={{ color: '#14161A' }}>
                  Table-first design
                </span>
                <span style={{ color: '#6B7078' }}>
                  Clear ledgers instead of noisy widgets.
                </span>
              </div>
              <div>
                <span className="font-semibold block mb-0.5" style={{ color: '#14161A' }}>
                  Workload boundary
                </span>
                <span style={{ color: '#6B7078' }}>
                  Automatic warning before deadlines collide.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Authentic WorkLedger Desktop Application Preview (55-58% width) */}
          <div className="lg:col-span-7">
            <div
              className="rounded-md overflow-hidden bg-white shadow-none"
              style={{ border: '1px solid #E3E1DC' }}
            >
              {/* App Shell Header */}
              <div
                className="flex items-center justify-between px-3.5 py-2"
                style={{ backgroundColor: '#FAFAF8', borderBottom: '1px solid #E3E1DC' }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="text-xs font-semibold uppercase"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      color: '#1F3D3A',
                      letterSpacing: '0.1em',
                    }}
                  >
                    WorkLedger
                  </span>
                  <div className="hidden sm:flex items-center gap-1">
                    {PREVIEW_NAV_ITEMS.map((item) => (
                      <span
                        key={item.label}
                        className="px-2 py-0.5 text-xs rounded-md"
                        style={{
                          color: item.active ? '#1F3D3A' : '#6B7078',
                          fontWeight: item.active ? 500 : 400,
                          backgroundColor: item.active ? '#F0EFEC' : 'transparent',
                        }}
                      >
                        {item.label}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-sm"
                    style={{
                      backgroundColor: '#F0EFEC',
                      color: '#6B7078',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    Workspace
                  </span>
                </div>
              </div>

              {/* Main Preview Body */}
              <div className="p-4 sm:p-5" style={{ backgroundColor: '#FAFAF8' }}>

                {/* Overload Alert Bar (Design.md §6 specification) */}
                <div
                  className="flex items-start gap-2.5 px-3 py-2 rounded-md mb-4"
                  style={{
                    border: '1px solid #E3E1DC',
                    borderLeftWidth: '4px',
                    borderLeftColor: '#8A6508',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <TriangleAlert
                    size={14}
                    className="flex-shrink-0 mt-0.5"
                    style={{ color: '#8A6508' }}
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-1">
                    <span className="text-xs font-medium" style={{ color: '#14161A' }}>
                      3 tasks due within 3 days across 2 active projects.
                    </span>
                    <span
                      className="text-[10px] uppercase font-semibold"
                      style={{ color: '#8A6508', fontFamily: 'var(--font-mono)' }}
                    >
                      Warning
                    </span>
                  </div>
                </div>

                {/* 3 Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <PreviewSummaryCard
                    icon={Briefcase}
                    label="Active Projects"
                    value="2"
                    detail="3 clients linked"
                  />
                  <PreviewSummaryCard
                    icon={Clock}
                    label="Upcoming Deadlines"
                    value="3"
                    detail="1 due today"
                  />
                  <PreviewSummaryCard
                    icon={DollarSign}
                    label="Total Unpaid"
                    value="₹24,500"
                    detail="2 invoices pending"
                  />
                </div>

                {/* 2-Column App Grid: Tasks on Left, Invoices & Projects on Right */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                  
                  {/* Left sub-column: Upcoming Tasks */}
                  <div className="sm:col-span-7">
                    <div className="flex items-center justify-between mb-2">
                      <h3
                        className="text-[11px] font-semibold uppercase tracking-wider"
                        style={{ fontFamily: 'var(--font-heading)', color: '#14161A' }}
                      >
                        Upcoming Deadlines
                      </h3>
                      <span className="text-[11px]" style={{ color: '#6B7078' }}>
                        4 tasks
                      </span>
                    </div>
                    <div
                      className="rounded-md overflow-hidden"
                      style={{ border: '1px solid #E3E1DC', backgroundColor: '#FFFFFF' }}
                    >
                      {PREVIEW_TASKS.map((task, i) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between px-3 py-2 text-xs"
                          style={{ borderTop: i > 0 ? '1px solid #E3E1DC' : 'none' }}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="w-3.5 h-3.5 rounded-sm flex-shrink-0 flex items-center justify-center"
                              style={{
                                border: `1px solid ${task.overdue ? '#C23B22' : task.completed ? '#2F6E4F' : '#E3E1DC'}`,
                                backgroundColor: task.completed ? '#F0EFEC' : '#FFFFFF',
                              }}
                            >
                              {task.completed && (
                                <span className="text-[10px] font-bold leading-none" style={{ color: '#2F6E4F' }}>✓</span>
                              )}
                            </div>
                            <span
                              className={`truncate ${task.completed ? 'line-through' : ''}`}
                              style={{
                                color: task.overdue ? '#C23B22' : task.completed ? '#6B7078' : '#14161A',
                              }}
                            >
                              {task.title}
                            </span>
                          </div>
                          <span
                            className="text-[11px] flex-shrink-0 ml-2"
                            style={{
                              fontFamily: 'var(--font-mono)',
                              color: task.overdue ? '#C23B22' : '#6B7078',
                              fontWeight: task.overdue ? 500 : 400,
                            }}
                          >
                            {task.due}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right sub-column: Invoices & Project Status */}
                  <div className="sm:col-span-5 flex flex-col gap-3">
                    
                    {/* Invoice Ledger snapshot */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3
                          className="text-[11px] font-semibold uppercase tracking-wider"
                          style={{ fontFamily: 'var(--font-heading)', color: '#14161A' }}
                        >
                          Recent Invoices
                        </h3>
                        <span className="text-[11px]" style={{ color: '#6B7078' }}>
                          Ledger
                        </span>
                      </div>
                      <div
                        className="rounded-md overflow-hidden text-[11px]"
                        style={{ border: '1px solid #E3E1DC', backgroundColor: '#FFFFFF' }}
                      >
                        {PREVIEW_RECENT_INVOICES.map((inv, i) => (
                          <div
                            key={inv.id}
                            className="flex items-center justify-between px-2.5 py-1.5"
                            style={{ borderTop: i > 0 ? '1px solid #E3E1DC' : 'none' }}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <span
                                className="font-medium"
                                style={{ fontFamily: 'var(--font-mono)', color: '#14161A' }}
                              >
                                {inv.id}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span
                                className="font-medium tabular-nums"
                                style={{ fontFamily: 'var(--font-mono)', color: '#14161A' }}
                              >
                                {inv.amount}
                              </span>
                              <span
                                className="px-1 py-0.2 rounded-sm text-[9px] font-medium"
                                style={{
                                  borderLeft: `2px solid ${inv.statusColor}`,
                                  color: inv.statusColor,
                                  backgroundColor: '#FAFAF8',
                                }}
                              >
                                {inv.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Project Status Snapshot */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3
                          className="text-[11px] font-semibold uppercase tracking-wider"
                          style={{ fontFamily: 'var(--font-heading)', color: '#14161A' }}
                        >
                          Project Status
                        </h3>
                      </div>
                      <div
                        className="rounded-md overflow-hidden text-[11px]"
                        style={{ border: '1px solid #E3E1DC', backgroundColor: '#FFFFFF' }}
                      >
                        {PREVIEW_PROJECTS.map((proj, i) => (
                          <div
                            key={proj.id}
                            className="flex items-center justify-between px-2.5 py-1.5"
                            style={{ borderTop: i > 0 ? '1px solid #E3E1DC' : 'none' }}
                          >
                            <span className="truncate font-medium pr-1" style={{ color: '#14161A' }}>
                              {proj.name}
                            </span>
                            <span
                              className="px-1 py-0.2 rounded-sm text-[9px] font-medium flex-shrink-0"
                              style={{
                                borderLeft: `2px solid ${proj.statusColor}`,
                                color: proj.statusColor,
                                backgroundColor: '#FAFAF8',
                              }}
                            >
                              {proj.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            </div>

            <p className="mt-2.5 text-xs text-center lg:text-right" style={{ color: '#6B7078' }}>
              Illustrative preview — static WorkLedger workspace structure
            </p>
          </div>

        </div>
      </section>

      {/* ── Product Overview: Everything Behind the Freelance Work ────────── */}
      <section style={{ borderTop: '1px solid #E3E1DC', backgroundColor: '#FAFAF8' }}>
        <div className="max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12 2xl:px-14 py-14">
          <div className="max-w-2xl mb-8">
            <span
              className="text-xs font-semibold uppercase tracking-wider block mb-2"
              style={{ color: '#1F3D3A', fontFamily: 'var(--font-heading)' }}
            >
              Core Architecture
            </span>
            <h2
              className="font-semibold leading-snug"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.4rem, 2.5vw, 1.75rem)',
                color: '#14161A',
                letterSpacing: '-0.01em',
              }}
            >
              Everything behind the freelance work.
            </h2>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 rounded-md overflow-hidden"
            style={{ border: '1px solid #E3E1DC', backgroundColor: '#FFFFFF' }}
          >
            {CORE_MODULES.map(({ icon: Icon, title, code, description }, idx) => (
              <div
                key={title}
                className="p-6 flex flex-col justify-between"
                style={{
                  borderTop: idx > 0 ? '1px solid #E3E1DC' : 'none',
                  ...(idx > 0 ? { borderTop: '1px solid #E3E1DC' } : {}),
                }}
              >
                <div>
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center mb-4"
                    style={{ backgroundColor: '#F0EFEC', border: '1px solid #E3E1DC' }}
                  >
                    <Icon size={15} style={{ color: '#1F3D3A' }} />
                  </div>
                  <span
                    className="text-[10px] font-medium uppercase tracking-wider block mb-1"
                    style={{ color: '#6B7078', fontFamily: 'var(--font-mono)' }}
                  >
                    {code}
                  </span>
                  <h3
                    className="text-sm font-semibold mb-2"
                    style={{ fontFamily: 'var(--font-heading)', color: '#14161A' }}
                  >
                    {title}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: '#6B7078' }}>
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Workload Warning Section ──────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid #E3E1DC', backgroundColor: '#FFFFFF' }}>
        <div className="max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12 2xl:px-14 py-14">
          <div className="max-w-xl">
            <span
              className="text-xs font-semibold uppercase tracking-wider block mb-2"
              style={{ color: '#8A6508', fontFamily: 'var(--font-heading)' }}
            >
              Intelligent Boundary
            </span>
            <h2
              className="font-semibold mb-3 leading-snug"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.35rem, 2.5vw, 1.65rem)',
                color: '#14161A',
              }}
            >
              Know when your workload is getting heavy.
            </h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: '#6B7078' }}>
              WorkLedger automatically inspects impending deadlines across all active client projects so you spot an overloaded schedule before deadlines pile up.
            </p>

            {/* Static Workload Warning Component */}
            <div
              className="flex items-start gap-3.5 px-4 py-3.5 rounded-md mb-3"
              style={{
                border: '1px solid #E3E1DC',
                borderLeftWidth: '4px',
                borderLeftColor: '#8A6508',
                backgroundColor: '#FAFAF8',
              }}
            >
              <TriangleAlert
                size={18}
                className="flex-shrink-0 mt-0.5"
                style={{ color: '#8A6508' }}
              />
              <div>
                <div className="text-xs font-semibold mb-0.5" style={{ color: '#14161A' }}>
                  △ Workload is getting heavy
                </div>
                <div className="text-xs leading-relaxed" style={{ color: '#6B7078' }}>
                  3 tasks due within 3 days across 2 active projects
                </div>
              </div>
            </div>

            <p className="text-xs" style={{ color: '#6B7078' }}>
              Computed in real time — zero configuration required.
            </p>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid #E3E1DC', backgroundColor: '#FAFAF8' }}>
        <div className="max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12 2xl:px-14 py-14 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h2
              className="font-semibold mb-1.5"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.35rem',
                color: '#14161A',
                letterSpacing: '-0.01em',
              }}
            >
              Ready to organize your freelance work?
            </h2>
            <p className="text-sm" style={{ color: '#6B7078' }}>
              Sign up in seconds and begin managing clients, projects, and invoices.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              to="/signup"
              className="px-5 py-2.5 text-sm font-medium rounded-md text-center transition-colors"
              style={{ backgroundColor: '#1F3D3A', color: '#FAFAF8' }}
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-5 py-2.5 text-sm rounded-md text-center transition-colors"
              style={{
                border: '1px solid #E3E1DC',
                backgroundColor: '#FFFFFF',
                color: '#14161A',
              }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid #E3E1DC', backgroundColor: '#FAFAF8' }}>
        <div className="max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12 2xl:px-14 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{
                fontFamily: 'var(--font-heading)',
                color: '#1F3D3A',
                letterSpacing: '0.1em',
              }}
            >
              WorkLedger
            </span>
            <span className="text-xs" style={{ color: '#E3E1DC' }}>|</span>
            <span className="text-xs" style={{ color: '#6B7078' }}>
              Calm freelance workspace
            </span>
          </div>
          <div className="flex items-center gap-5 text-xs" style={{ color: '#6B7078' }}>
            <Link to="/help" className="hover:underline">
              Help
            </Link>
            <Link to="/contact" className="hover:underline">
              Contact
            </Link>
            <span>© 2026 WorkLedger</span>
          </div>
        </div>
      </footer>

    </div>
  )
}

// ─── PreviewSummaryCard ────────────────────────────────────────────────────────

function PreviewSummaryCard({ icon: Icon, label, value, detail }) {
  return (
    <div
      className="rounded-md p-3.5"
      style={{ border: '1px solid #E3E1DC', backgroundColor: '#FFFFFF' }}
    >
      <div className="flex items-start justify-between mb-1.5">
        <span className="text-xs" style={{ color: '#6B7078' }}>
          {label}
        </span>
        <Icon size={14} style={{ color: '#6B7078' }} />
      </div>
      <div
        className="text-lg font-medium tabular-nums mb-0.5"
        style={{ fontFamily: 'var(--font-mono)', color: '#14161A' }}
      >
        {value}
      </div>
      {detail && (
        <span className="text-[10px] block" style={{ color: '#6B7078' }}>
          {detail}
        </span>
      )}
    </div>
  )
}



