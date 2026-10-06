import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, AlertCircle } from 'lucide-react'
import AppLayout from '@/components/AppLayout'
import { getProjectById } from '@/lib/projectService'

/**
 * ProjectDetailPage — /projects/:id
 *
 * Phase 4: Shell only. Full tasks/invoices implemented in Phase 5.
 */
export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    async function load() {
      const { data, error: fetchError } = await getProjectById(id)
      if (!active) return

      if (fetchError || !data) {
        setError(fetchError?.message || 'Project not found.')
      } else {
        setProject(data)
      }
      setLoading(false)
    }
    load()
    return () => { active = false }
  }, [id])

  if (loading) {
    return (
      <AppLayout>
        <div className="animate-pulse space-y-4 max-w-md">
          <div className="h-4 bg-[#F0EFEC] rounded w-1/4" />
          <div className="h-8 bg-[#F0EFEC] rounded w-1/2" />
        </div>
      </AppLayout>
    )
  }

  if (error || !project) {
    return (
      <AppLayout>
        <div className="flex items-start gap-2.5 p-4 rounded-md mb-6 text-xs font-medium bg-[#FEF2F2] text-[#C23B22] border border-[#FECACA]">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold mb-0.5">Error</p>
            <p>{error}</p>
            <button onClick={() => navigate('/projects')} className="underline mt-2">
              Return to Projects
            </button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      {/* ── Breadcrumb & Header ────────────────────────────────────────────── */}
      <div className="mb-8">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-medium mb-4 hover:underline"
          style={{ color: '#6B7078' }}
        >
          <ChevronLeft size={14} />
          Back to Projects
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold leading-tight" style={{ color: '#14161A', fontFamily: 'var(--font-heading)' }}>
              {project.name}
            </h1>
            <p className="text-xs sm:text-sm mt-1" style={{ color: '#6B7078' }}>
              Client: {project.clients?.name || 'Unknown Client'}
            </p>
          </div>
          <div>
            <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-sm border" style={{
              backgroundColor: '#FAFAF8',
              borderColor: '#E3E1DC',
              color: '#14161A',
              borderLeftWidth: '3px',
              borderLeftColor: project.status === 'Active' ? '#1F3D3A' : project.status === 'Completed' ? '#2F6E4F' : '#6B7078'
            }}>
              {project.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks Shell */}
        <div className="rounded-md p-6" style={{ border: '1px solid #E3E1DC', backgroundColor: '#FFFFFF' }}>
          <h2 className="text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-heading)', color: '#14161A' }}>
            Tasks
          </h2>
          <p className="text-xs text-[#6B7078]">
            Tasks functionality will be implemented in Phase 5.
          </p>
        </div>

        {/* Invoices Shell */}
        <div className="rounded-md p-6" style={{ border: '1px solid #E3E1DC', backgroundColor: '#FFFFFF' }}>
          <h2 className="text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-heading)', color: '#14161A' }}>
            Invoices
          </h2>
          <p className="text-xs text-[#6B7078]">
            Invoices functionality will be implemented in Phase 5.
          </p>
        </div>
      </div>
    </AppLayout>
  )
}
