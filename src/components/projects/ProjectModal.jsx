import { useState, useEffect } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { getClients } from '@/lib/clientService'

/**
 * ProjectModalContent
 *
 * Inner form rendered only when modal is open.
 */
function ProjectModalContent({ onClose, onSave, project }) {
  const [name, setName] = useState(project?.name || '')
  const [clientId, setClientId] = useState(project?.client_id || '')
  const [status, setStatus] = useState(project?.status || 'Planning')
  const [clients, setClients] = useState([])
  
  const [loadingClients, setLoadingClients] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const isEditing = Boolean(project?.id)

  useEffect(() => {
    let active = true
    async function loadClients() {
      const { data, error } = await getClients()
      if (!active) return
      if (error) {
        setError('Failed to load clients. Please try again.')
      } else {
        setClients(data || [])
      }
      setLoadingClients(false)
    }
    loadClients()
    return () => { active = false }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return

    if (!name.trim()) {
      setError('Project name is required.')
      return
    }
    if (!clientId) {
      setError('Client selection is required.')
      return
    }

    setError(null)
    setSubmitting(true)

    const payload = {
      name: name.trim(),
      client_id: clientId,
      status,
    }

    const { error: saveError } = await onSave(payload, project?.id)

    if (saveError) {
      setError(saveError.message || 'Failed to save project.')
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-lg rounded-md z-10 p-6 sm:p-7 shadow-lg"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E3E1DC',
          color: '#14161A',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5" style={{ borderBottom: '1px solid #E3E1DC' }}>
          <div>
            <span
              className="text-[10px] font-semibold uppercase tracking-wider block mb-0.5"
              style={{ color: '#1F3D3A', fontFamily: 'var(--font-heading)' }}
            >
              Projects
            </span>
            <h2
              className="text-lg font-semibold"
              style={{ fontFamily: 'var(--font-heading)', color: '#14161A' }}
            >
              {isEditing ? 'Edit Project' : 'Add New Project'}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1 rounded-sm text-[#6B7078] hover:text-[#14161A] transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            className="flex items-start gap-2 p-3 rounded-md mb-4 text-xs font-medium"
            style={{
              backgroundColor: '#FEF2F2',
              color: '#C23B22',
              border: '1px solid #FECACA',
            }}
          >
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            {/* Name (Required) */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="project-name" className="text-xs font-semibold" style={{ color: '#14161A' }}>
                Project name <span style={{ color: '#C23B22' }}>*</span>
              </label>
              <input
                id="project-name"
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Website Redesign"
                className="w-full rounded-md px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-offset-1"
                style={{
                  border: '1px solid #E3E1DC',
                  color: '#14161A',
                  backgroundColor: '#FAFAF8',
                  '--tw-ring-color': '#1F3D3A',
                }}
              />
            </div>

            {/* Client (Required) */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="project-client" className="text-xs font-semibold" style={{ color: '#14161A' }}>
                Client <span style={{ color: '#C23B22' }}>*</span>
              </label>
              <select
                id="project-client"
                required
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                disabled={loadingClients}
                className="w-full rounded-md px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-offset-1 disabled:opacity-50"
                style={{
                  border: '1px solid #E3E1DC',
                  color: '#14161A',
                  backgroundColor: '#FAFAF8',
                  '--tw-ring-color': '#1F3D3A',
                }}
              >
                <option value="" disabled>Select a client...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="project-status" className="text-xs font-semibold" style={{ color: '#14161A' }}>
                Status
              </label>
              <select
                id="project-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-md px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-offset-1"
                style={{
                  border: '1px solid #E3E1DC',
                  color: '#14161A',
                  backgroundColor: '#FAFAF8',
                  '--tw-ring-color': '#1F3D3A',
                }}
              >
                <option value="Planning">Planning</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4" style={{ borderTop: '1px solid #E3E1DC' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium rounded-md transition-colors"
              style={{
                border: '1px solid #E3E1DC',
                backgroundColor: '#FFFFFF',
                color: '#14161A',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loadingClients}
              className="px-4 py-2 text-xs font-medium rounded-md transition-colors flex items-center justify-center min-w-[90px]"
              style={{
                backgroundColor: '#1F3D3A',
                color: '#FAFAF8',
                opacity: submitting || loadingClients ? 0.7 : 1,
              }}
            >
              {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/**
 * ProjectModal wrapper
 */
export default function ProjectModal({ isOpen, onClose, onSave, project = null }) {
  if (!isOpen) return null

  return (
    <ProjectModalContent
      key={project?.id || 'new-project'}
      onClose={onClose}
      onSave={onSave}
      project={project}
    />
  )
}
