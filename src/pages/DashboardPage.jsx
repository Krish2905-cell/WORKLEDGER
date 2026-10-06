import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase,
  AlertCircle,
  Receipt,
  Calendar,
  Clock,
  ArrowRight,
  TriangleAlert,
  X,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import AppLayout from '@/components/AppLayout'
import { getProjects } from '@/lib/projectService'
import { getTasks } from '@/lib/taskService'
import { getInvoices } from '@/lib/invoiceService'

/**
 * DashboardPage — /dashboard
 *
 * Phase 6: Real dashboard — 3 summary cards + action items table.
 * Phase 7: Overload Warning banner (session-dismissible).
 *
 * Overload condition (Rules.md §6, all must be true):
 *   - ≥ 3 incomplete tasks
 *   - spanning ≥ 2 distinct Active projects
 *   - due_date within [today, today+2 days]  (overdue tasks do NOT count)
 *
 * Data is fetched once on mount and on explicit retry; the overload
 * computation re-uses the same fetch results — no extra Supabase query.
 */

const OVERLOAD_SESSION_KEY = 'workledger_overload_dismissed'

export default function DashboardPage() {
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Incrementing this triggers a fresh fetch (used by the Retry button).
  const [fetchTick, setFetchTick] = useState(0)

  const [activeProjectsCount, setActiveProjectsCount] = useState(0)
  const [upcomingDeadlinesCount, setUpcomingDeadlinesCount] = useState(0)
  const [totalUnpaid, setTotalUnpaid] = useState(0)
  const [dashboardTasks, setDashboardTasks] = useState([])

  // Overload warning
  const [overloadActive, setOverloadActive] = useState(false)
  const [overloadDismissed, setOverloadDismissed] = useState(
    () => sessionStorage.getItem(OVERLOAD_SESSION_KEY) === 'true'
  )

  useEffect(() => {
    let active = true

    async function loadData() {
      setLoading(true)
      setError(null)

      try {
        const [projectsRes, tasksRes, invoicesRes] = await Promise.all([
          getProjects(),
          getTasks(),
          getInvoices(),
        ])

        if (!active) return

        if (projectsRes.error) throw new Error(projectsRes.error.message || 'Failed to load projects')
        if (tasksRes.error) throw new Error(tasksRes.error.message || 'Failed to load tasks')
        if (invoicesRes.error) throw new Error(invoicesRes.error.message || 'Failed to load invoices')

        const projects = projectsRes.data || []
        const tasks = tasksRes.data || []
        const invoices = invoicesRes.data || []

        // ── Card 1: Active Projects ──────────────────────────────────────
        setActiveProjectsCount(projects.filter(p => p.status === 'Active').length)

        // ── Card 2: Upcoming Deadlines (today → today+7) ─────────────────
        const incompleteTasks = tasks.filter(t => !t.is_done)

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const sevenDaysFromNow = new Date(today)
        sevenDaysFromNow.setDate(today.getDate() + 7)
        sevenDaysFromNow.setHours(23, 59, 59, 999)

        const upcomingCount = incompleteTasks.filter(t => {
          const d = new Date(t.due_date)
          return d >= today && d <= sevenDaysFromNow
        }).length
        setUpcomingDeadlinesCount(upcomingCount)

        // ── Card 3: Total Unpaid ─────────────────────────────────────────
        const unpaidSum = invoices
          .filter(i => !i.is_paid)
          .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0)
        setTotalUnpaid(unpaidSum)

        // ── Action Items list (all incomplete, overdue pinned first) ──────
        const sorted = [...incompleteTasks].sort(
          (a, b) => new Date(a.due_date) - new Date(b.due_date)
        )
        setDashboardTasks(sorted)

        // ── Phase 7: Overload Warning ────────────────────────────────────
        // Window: today <= due_date <= today+2  (overdue tasks excluded)
        const twoDaysFromNow = new Date(today)
        twoDaysFromNow.setDate(today.getDate() + 2)
        twoDaysFromNow.setHours(23, 59, 59, 999)

        // Build a set of Active project IDs for fast lookup
        const activeProjectIds = new Set(
          projects.filter(p => p.status === 'Active').map(p => p.id)
        )

        // Qualifying tasks: incomplete, within 3-day window, in an Active project
        const overloadCandidates = incompleteTasks.filter(t => {
          const d = new Date(t.due_date)
          return d >= today && d <= twoDaysFromNow && activeProjectIds.has(t.project_id)
        })

        const distinctProjects = new Set(overloadCandidates.map(t => t.project_id))
        setOverloadActive(overloadCandidates.length >= 3 && distinctProjects.size >= 2)

      } catch (err) {
        if (!active) return
        setError(err.message || 'Failed to load dashboard data.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadData()

    return () => {
      active = false
    }
  }, [fetchTick])

  function handleRetry() {
    setFetchTick(t => t + 1)
  }

  function handleDismissOverload() {
    sessionStorage.setItem(OVERLOAD_SESSION_KEY, 'true')
    setOverloadDismissed(true)
  }

  function isOverdue(dateString) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(dateString) < today
  }

  const showOverloadWarning = overloadActive && !overloadDismissed

  return (
    <AppLayout>
      <div className="space-y-8">

        {/* ── Page Header ───────────────────────────────────────────────── */}
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
            Welcome back, {user?.email}
          </p>
        </div>

        {/* ── Overload Warning banner (Phase 7) ─────────────────────────── */}
        {showOverloadWarning && (
          <div
            className="flex items-start gap-3 p-4 rounded-md"
            style={{
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              color: '#92400E',
            }}
            role="alert"
            aria-live="polite"
          >
            <TriangleAlert size={18} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-snug">
                High workload detected
              </p>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#B45309' }}>
                You have 3 or more incomplete tasks across multiple active projects
                due in the next 3 days. Consider reprioritising or rescheduling.
              </p>
            </div>
            <button
              onClick={handleDismissOverload}
              className="flex-shrink-0 p-1 rounded transition-colors hover:bg-[#FEF3C7]"
              style={{ color: '#92400E' }}
              aria-label="Dismiss overload warning"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── Error Banner ──────────────────────────────────────────────── */}
        {error && (
          <div
            className="flex items-start gap-2.5 p-4 rounded-md text-xs font-medium"
            style={{
              backgroundColor: '#FEF2F2',
              color: '#C23B22',
              border: '1px solid #FECACA',
            }}
          >
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold mb-0.5">Error</p>
              <p>{error}</p>
            </div>
            <button
              onClick={handleRetry}
              className="underline hover:opacity-80 transition-opacity"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          /* ── Loading skeleton ─────────────────────────────────────────── */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="p-6 rounded-md animate-pulse"
                style={{ border: '1px solid #E3E1DC', backgroundColor: '#FFFFFF' }}
              >
                <div className="h-4 bg-[#F0EFEC] rounded w-1/3 mb-4" />
                <div className="h-8 bg-[#F0EFEC] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* ── Summary Cards ──────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Active Projects */}
              <div
                className="p-6 rounded-md flex flex-col justify-between"
                style={{ border: '1px solid #E3E1DC', backgroundColor: '#FFFFFF' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold" style={{ color: '#6B7078' }}>
                    Active Projects
                  </h3>
                  <div className="w-8 h-8 rounded-sm flex items-center justify-center bg-[#FAFAF8] border border-[#E3E1DC]">
                    <Briefcase size={14} style={{ color: '#1F3D3A' }} />
                  </div>
                </div>
                <span
                  className="text-3xl font-semibold"
                  style={{ color: '#14161A', fontFamily: 'var(--font-heading)' }}
                >
                  {activeProjectsCount}
                </span>
              </div>

              {/* Upcoming Deadlines */}
              <div
                className="p-6 rounded-md flex flex-col justify-between"
                style={{ border: '1px solid #E3E1DC', backgroundColor: '#FFFFFF' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold" style={{ color: '#6B7078' }}>
                    Upcoming Deadlines
                  </h3>
                  <div className="w-8 h-8 rounded-sm flex items-center justify-center bg-[#FAFAF8] border border-[#E3E1DC]">
                    <Calendar size={14} style={{ color: '#1F3D3A' }} />
                  </div>
                </div>
                <div>
                  <span
                    className="text-3xl font-semibold"
                    style={{ color: '#14161A', fontFamily: 'var(--font-heading)' }}
                  >
                    {upcomingDeadlinesCount}
                  </span>
                  <span className="text-xs text-[#6B7078] ml-2">Next 7 days</span>
                </div>
              </div>

              {/* Total Unpaid */}
              <div
                className="p-6 rounded-md flex flex-col justify-between"
                style={{ border: '1px solid #E3E1DC', backgroundColor: '#FFFFFF' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold" style={{ color: '#6B7078' }}>
                    Total Unpaid
                  </h3>
                  <div className="w-8 h-8 rounded-sm flex items-center justify-center bg-[#FAFAF8] border border-[#E3E1DC]">
                    <Receipt size={14} style={{ color: '#1F3D3A' }} />
                  </div>
                </div>
                <span
                  className="text-3xl font-semibold"
                  style={{ color: '#14161A', fontFamily: 'var(--font-heading)' }}
                >
                  ₹{totalUnpaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

            </div>

            {/* ── Action Items (all incomplete tasks, overdue first) ──────── */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-lg font-semibold"
                  style={{ fontFamily: 'var(--font-heading)', color: '#14161A' }}
                >
                  Action Items
                </h2>
                <Link
                  to="/tasks"
                  className="text-xs font-medium hover:underline flex items-center gap-1"
                  style={{ color: '#6B7078' }}
                >
                  View All Tasks <ArrowRight size={12} />
                </Link>
              </div>

              {dashboardTasks.length === 0 ? (
                <div
                  className="rounded-md p-10 text-center"
                  style={{ border: '1px solid #E3E1DC', backgroundColor: '#FFFFFF' }}
                >
                  <div className="w-10 h-10 mx-auto rounded-sm flex items-center justify-center mb-3 bg-[#FAFAF8] border border-[#E3E1DC]">
                    <Clock size={18} style={{ color: '#6B7078' }} />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: '#14161A' }}>
                    You're all caught up
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#6B7078' }}>
                    No incomplete tasks at the moment.
                  </p>
                </div>
              ) : (
                <div
                  className="bg-[#FFFFFF] rounded-md overflow-hidden border"
                  style={{ borderColor: '#E3E1DC' }}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr
                          className="bg-[#FAFAF8] border-b"
                          style={{ borderColor: '#E3E1DC', color: '#6B7078' }}
                        >
                          <th className="px-6 py-3 font-medium text-xs tracking-wider">Status</th>
                          <th className="px-6 py-3 font-medium text-xs tracking-wider">Task</th>
                          <th className="px-6 py-3 font-medium text-xs tracking-wider">Project</th>
                          <th className="px-6 py-3 font-medium text-xs tracking-wider text-right">Due Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardTasks.map(task => {
                          const overdue = isOverdue(task.due_date)
                          return (
                            <tr
                              key={task.id}
                              className="border-b last:border-b-0 hover:bg-[#FAFAF8] transition-colors"
                              style={{ borderColor: '#F0EFEC', color: '#14161A' }}
                            >
                              <td className="px-6 py-4 w-24">
                                {overdue ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#FEF2F2] text-[#C23B22] border border-[#FECACA]">
                                    Overdue
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#F0EFEC] text-[#6B7078]">
                                    Pending
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 font-medium">
                                {task.title}
                              </td>
                              <td className="px-6 py-4">
                                <Link
                                  to={`/projects/${task.project_id}`}
                                  className="hover:underline"
                                >
                                  {task.projects?.name || 'Unknown Project'}
                                </Link>
                                {task.projects?.clients?.name && (
                                  <div className="text-xs text-[#6B7078]">
                                    {task.projects.clients.name}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span
                                  className="font-medium"
                                  style={{ color: overdue ? '#C23B22' : '#14161A' }}
                                >
                                  {new Date(task.due_date).toLocaleDateString()}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
