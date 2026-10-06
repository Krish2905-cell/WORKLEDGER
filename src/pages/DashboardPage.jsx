import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase,
  AlertCircle,
  Receipt,
  Calendar,
  Clock,
  ArrowRight
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import AppLayout from '@/components/AppLayout'
import { getProjects } from '@/lib/projectService'
import { getTasks } from '@/lib/taskService'
import { getInvoices } from '@/lib/invoiceService'

/**
 * DashboardPage — /dashboard
 *
 * Phase 6: Real Dashboard
 * Contains 3 summary cards and a list of upcoming tasks/deadlines.
 */
export default function DashboardPage() {
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [activeProjectsCount, setActiveProjectsCount] = useState(0)
  const [upcomingDeadlinesCount, setUpcomingDeadlinesCount] = useState(0)
  const [totalUnpaid, setTotalUnpaid] = useState(0)
  
  const [dashboardTasks, setDashboardTasks] = useState([])

  const loadDashboardData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [projectsRes, tasksRes, invoicesRes] = await Promise.all([
        getProjects(),
        getTasks(),
        getInvoices()
      ])

      if (projectsRes.error) throw new Error(projectsRes.error.message || 'Failed to load projects')
      if (tasksRes.error) throw new Error(tasksRes.error.message || 'Failed to load tasks')
      if (invoicesRes.error) throw new Error(invoicesRes.error.message || 'Failed to load invoices')

      const projects = projectsRes.data || []
      const tasks = tasksRes.data || []
      const invoices = invoicesRes.data || []

      // 1. Active Projects = current user's projects with status = Active
      const activeProjects = projects.filter(p => p.status === 'Active').length
      setActiveProjectsCount(activeProjects)

      // 2. Upcoming Deadlines = incomplete tasks due today through 7 days from today.
      const incompleteTasks = tasks.filter(t => !t.is_done)
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const sevenDaysFromNow = new Date(today)
      sevenDaysFromNow.setDate(today.getDate() + 7)
      sevenDaysFromNow.setHours(23, 59, 59, 999)

      let upcomingCount = 0
      incompleteTasks.forEach(t => {
        const dueDate = new Date(t.due_date)
        if (dueDate >= today && dueDate <= sevenDaysFromNow) {
          upcomingCount++
        }
      })
      setUpcomingDeadlinesCount(upcomingCount)

      // 3. Total Unpaid = sum of unpaid invoices
      const unpaidInvoices = invoices.filter(i => !i.is_paid)
      const unpaidSum = unpaidInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0)
      setTotalUnpaid(unpaidSum)

      // Tasks list: incomplete tasks only, overdue at the top, then upcoming
      // Sort tasks by due date
      const sortedTasks = [...incompleteTasks].sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      setDashboardTasks(sortedTasks)

    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  function isOverdue(dateString) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(dateString)
    return dueDate < today
  }

  return (
    <AppLayout>
      <div className="space-y-8">
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

        {error && (
          <div
            className="flex items-start gap-2.5 p-4 rounded-md mb-6 text-xs font-medium"
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
              onClick={loadDashboardData}
              className="underline hover:opacity-80 transition-opacity"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-6 rounded-md animate-pulse" style={{ border: '1px solid #E3E1DC', backgroundColor: '#FFFFFF' }}>
                <div className="h-4 bg-[#F0EFEC] rounded w-1/3 mb-4" />
                <div className="h-8 bg-[#F0EFEC] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* ── Summary Cards ──────────────────────────────────────────────── */}
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
                <div>
                  <span className="text-3xl font-semibold" style={{ color: '#14161A', fontFamily: 'var(--font-heading)' }}>
                    {activeProjectsCount}
                  </span>
                </div>
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
                  <span className="text-3xl font-semibold" style={{ color: '#14161A', fontFamily: 'var(--font-heading)' }}>
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
                <div>
                  <span className="text-3xl font-semibold" style={{ color: '#14161A', fontFamily: 'var(--font-heading)' }}>
                    ₹{totalUnpaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Upcoming Tasks/Deadlines ───────────────────────────────────── */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)', color: '#14161A' }}>
                  Action Items
                </h2>
                <Link to="/tasks" className="text-xs font-medium hover:underline flex items-center gap-1" style={{ color: '#6B7078' }}>
                  View All Tasks <ArrowRight size={12} />
                </Link>
              </div>

              {dashboardTasks.length === 0 ? (
                <div className="rounded-md p-10 text-center" style={{ border: '1px solid #E3E1DC', backgroundColor: '#FFFFFF' }}>
                  <div className="w-10 h-10 mx-auto rounded-sm flex items-center justify-center mb-3 bg-[#FAFAF8] border border-[#E3E1DC]">
                    <Clock size={18} style={{ color: '#6B7078' }} />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: '#14161A' }}>You're all caught up</p>
                  <p className="text-xs mt-1" style={{ color: '#6B7078' }}>No active tasks or upcoming deadlines.</p>
                </div>
              ) : (
                <div className="bg-[#FFFFFF] rounded-md overflow-hidden border" style={{ borderColor: '#E3E1DC' }}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-[#FAFAF8] border-b" style={{ borderColor: '#E3E1DC', color: '#6B7078' }}>
                          <th className="px-6 py-3 font-medium text-xs tracking-wider">Status</th>
                          <th className="px-6 py-3 font-medium text-xs tracking-wider">Task</th>
                          <th className="px-6 py-3 font-medium text-xs tracking-wider">Project</th>
                          <th className="px-6 py-3 font-medium text-xs tracking-wider text-right">Due Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ divideColor: '#F0EFEC' }}>
                        {dashboardTasks.map(task => {
                          const overdue = isOverdue(task.due_date)
                          return (
                            <tr key={task.id} className="hover:bg-[#FAFAF8] transition-colors" style={{ color: '#14161A' }}>
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
                              <td className="px-6 py-4 font-medium text-[#14161A]">
                                {task.title}
                              </td>
                              <td className="px-6 py-4">
                                <Link to={`/projects/${task.project_id}`} className="hover:underline">
                                  {task.projects?.name || 'Unknown Project'}
                                </Link>
                                {task.projects?.clients?.name && (
                                  <div className="text-xs text-[#6B7078]">{task.projects.clients.name}</div>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="inline-flex items-center gap-1.5 font-medium" style={{ color: overdue ? '#C23B22' : '#14161A' }}>
                                  {new Date(task.due_date).toLocaleDateString()}
                                </div>
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
