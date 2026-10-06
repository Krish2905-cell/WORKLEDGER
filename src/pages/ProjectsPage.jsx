import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  FolderOpen,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Clock,
  Briefcase,
  CheckCircle2
} from 'lucide-react'
import AppLayout from '@/components/AppLayout'
import ProjectModal from '@/components/projects/ProjectModal'
import DeleteProjectDialog from '@/components/projects/DeleteProjectDialog'
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from '@/lib/projectService'

/**
 * ProjectsPage — /projects
 *
 * Phase 4: Projects CRUD + Status Pipeline
 *
 * Design.md & AppFlow.md requirements:
 * - 3-column view (Planning, Active, Completed) using grid-cols-1 md:grid-cols-3
 * - Each column is a vertical stack of flat, bordered project Cards (no shadow)
 * - Status Select dropdown on each card
 * - Edit/Delete actions available
 * - Empty state with centered icon, text, and single primary button
 * - Loading and error states
 */
export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState(null)

  const fetchProjectsList = useCallback(async () => {
    setError(null)
    const { data, error: fetchError } = await getProjects()

    if (fetchError) {
      setError(fetchError.message || 'Failed to load projects.')
    } else {
      setProjects(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    let active = true

    async function load() {
      const { data, error: fetchError } = await getProjects()
      if (!active) return

      if (fetchError) {
        setError(fetchError.message || 'Failed to load projects.')
      } else {
        setProjects(data || [])
      }
      setLoading(false)
    }

    load()

    return () => {
      active = false
    }
  }, [])

  // Open modal for Create
  function handleOpenCreate() {
    setEditingProject(null)
    setModalOpen(true)
  }

  // Open modal for Edit
  function handleOpenEdit(project) {
    setEditingProject(project)
    setModalOpen(true)
  }

  // Open Delete Confirmation
  function handleOpenDelete(project) {
    setProjectToDelete(project)
    setDeleteDialogOpen(true)
  }

  // Save (Create or Update) handler
  async function handleSaveProject(payload, id) {
    let result
    if (id) {
      result = await updateProject(id, payload)
    } else {
      result = await createProject(payload)
    }

    if (!result.error) {
      await fetchProjectsList()
    }
    return result
  }

  // Delete handler
  async function handleDeleteProject(id) {
    const result = await deleteProject(id)
    if (!result.error) {
      await fetchProjectsList()
    }
    return result
  }

  // Handle direct status change from the dropdown
  async function handleStatusChange(project, newStatus) {
    // Optimistic UI update
    setProjects(prev =>
      prev.map(p => (p.id === project.id ? { ...p, status: newStatus } : p))
    )

    const { error: updateErr } = await updateProject(project.id, { status: newStatus })
    if (updateErr) {
      // Revert on error
      setError('Failed to update project status.')
      await fetchProjectsList()
    }
  }

  // Group projects by status
  const planningProjects = projects.filter(p => p.status === 'Planning')
  const activeProjects = projects.filter(p => p.status === 'Active')
  const completedProjects = projects.filter(p => p.status === 'Completed')

  // Helper for rendering a column
  function renderColumn(title, icon, iconColor, columnProjects) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <h3 className="text-sm font-semibold" style={{ color: '#14161A', fontFamily: 'var(--font-heading)' }}>
            {title}
          </h3>
          <span className="text-xs px-1.5 py-0.5 rounded-md bg-[#F0EFEC] text-[#6B7078] ml-auto">
            {columnProjects.length}
          </span>
        </div>
        
        {columnProjects.length === 0 ? (
          <div className="p-6 rounded-md text-center border border-dashed" style={{ borderColor: '#E3E1DC', backgroundColor: '#FAFAF8' }}>
            <p className="text-xs" style={{ color: '#6B7078' }}>No {title.toLowerCase()} projects.</p>
          </div>
        ) : (
          columnProjects.map(project => (
            <div
              key={project.id}
              className="p-4 rounded-md flex flex-col gap-3 group"
              style={{ border: '1px solid #E3E1DC', backgroundColor: '#FFFFFF' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    to={`/projects/${project.id}`}
                    className="text-sm font-semibold hover:underline"
                    style={{ color: '#14161A' }}
                  >
                    {project.name}
                  </Link>
                  <p className="text-xs mt-0.5" style={{ color: '#6B7078' }}>
                    {project.clients?.name || 'Unknown Client'}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEdit(project)}
                    className="p-1 rounded text-[#6B7078] hover:text-[#1F3D3A] hover:bg-[#F0EFEC]"
                    title="Edit project"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleOpenDelete(project)}
                    className="p-1 rounded text-[#6B7078] hover:text-[#C23B22] hover:bg-[#FEE2E2]"
                    title="Delete project"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t flex items-center justify-between" style={{ borderColor: '#F0EFEC' }}>
                <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#6B7078' }}>
                  Status
                </span>
                <select
                  value={project.status}
                  onChange={(e) => handleStatusChange(project, e.target.value)}
                  className="text-xs px-2 py-1 rounded-sm outline-none border transition-colors focus:ring-1"
                  style={{
                    borderColor: '#E3E1DC',
                    backgroundColor: '#FAFAF8',
                    color: '#14161A',
                    '--tw-ring-color': '#1F3D3A',
                  }}
                >
                  <option value="Planning">Planning</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    )
  }

  return (
    <AppLayout>
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <span
            className="text-[11px] font-semibold uppercase tracking-widest block mb-1"
            style={{ color: '#1F3D3A', fontFamily: 'var(--font-heading)' }}
          >
            Pipeline
          </span>
          <h1
            className="text-2xl sm:text-3xl font-semibold leading-tight"
            style={{ fontFamily: 'var(--font-heading)', color: '#14161A', letterSpacing: '-0.02em' }}
          >
            Projects
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: '#6B7078' }}>
            Track and manage your client projects through their lifecycle.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium rounded-md transition-colors self-start sm:self-auto"
          style={{ backgroundColor: '#1F3D3A', color: '#FAFAF8' }}
        >
          <Plus size={15} />
          <span>Add Project</span>
        </button>
      </div>

      {/* ── Error Banner ─────────────────────────────────────────────────── */}
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
            onClick={fetchProjectsList}
            className="underline hover:opacity-80 transition-opacity"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Main Content Area ────────────────────────────────────────────── */}
      {loading ? (
        /* Loading Skeleton */
        <div
          className="rounded-md overflow-hidden p-8 text-center"
          style={{ border: '1px solid #E3E1DC', backgroundColor: '#FFFFFF' }}
        >
          <div className="animate-pulse space-y-4 max-w-md mx-auto">
            <div className="h-4 bg-[#F0EFEC] rounded w-1/3 mx-auto" />
            <div className="h-3 bg-[#F0EFEC] rounded w-2/3 mx-auto" />
            <div className="h-8 bg-[#F0EFEC] rounded w-1/2 mx-auto mt-4" />
          </div>
          <p className="text-xs mt-4" style={{ color: '#6B7078' }}>
            Loading projects...
          </p>
        </div>
      ) : projects.length === 0 ? (
        /* Empty State */
        <div
          className="rounded-md p-12 text-center flex flex-col items-center justify-center"
          style={{ border: '1px solid #E3E1DC', backgroundColor: '#FFFFFF' }}
        >
          <div
            className="w-12 h-12 rounded-md flex items-center justify-center mb-4"
            style={{ backgroundColor: '#F0EFEC', border: '1px solid #E3E1DC' }}
          >
            <FolderOpen size={22} style={{ color: '#1F3D3A' }} />
          </div>
          <h2
            className="text-base font-semibold mb-1"
            style={{ fontFamily: 'var(--font-heading)', color: '#14161A' }}
          >
            No projects yet
          </h2>
          <p className="text-xs sm:text-sm max-w-sm mb-6" style={{ color: '#6B7078' }}>
            Create a project to start tracking tasks and invoices for your clients.
          </p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md transition-colors"
            style={{ backgroundColor: '#1F3D3A', color: '#FAFAF8' }}
          >
            <Plus size={14} />
            <span>Add First Project</span>
          </button>
        </div>
      ) : (
        /* 3-Column Pipeline */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderColumn(
            'Planning',
            <Clock size={16} style={{ color: '#6B7078' }} />,
            '#6B7078',
            planningProjects
          )}
          {renderColumn(
            'Active',
            <Briefcase size={16} style={{ color: '#1F3D3A' }} />,
            '#1F3D3A',
            activeProjects
          )}
          {renderColumn(
            'Completed',
            <CheckCircle2 size={16} style={{ color: '#2F6E4F' }} />,
            '#2F6E4F',
            completedProjects
          )}
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      <ProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveProject}
        project={editingProject}
      />

      <DeleteProjectDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteProject}
        project={projectToDelete}
      />
    </AppLayout>
  )
}
