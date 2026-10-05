import { useState, useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { getClientProjectsCount } from '@/lib/clientService'

/**
 * DeleteClientContent
 *
 * Inner dialog checking project counts on mount.
 */
function DeleteClientContent({ onClose, onConfirm, client }) {
  const [checking, setChecking] = useState(true)
  const [projectCount, setProjectCount] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    async function checkProjects() {
      const { count, error: countError } = await getClientProjectsCount(client.id)
      if (!active) return

      if (countError) {
        setError('Could not verify linked projects.')
      } else {
        setProjectCount(count)
      }
      setChecking(false)
    }

    checkProjects()

    return () => {
      active = false
    }
  }, [client.id])

  const isBlocked = projectCount > 0

  async function handleDelete() {
    if (isBlocked || deleting) return
    setDeleting(true)
    setError(null)

    const { error: deleteError } = await onConfirm(client.id)
    if (deleteError) {
      setError(deleteError.message || 'Failed to delete client.')
      setDeleting(false)
      return
    }

    setDeleting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-md rounded-md z-10 p-6 shadow-lg"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E3E1DC',
          color: '#14161A',
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: isBlocked ? '#FEF3C7' : '#FEE2E2',
                color: isBlocked ? '#8A6508' : '#C23B22',
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <div>
              <h2
                className="text-base font-semibold"
                style={{ fontFamily: 'var(--font-heading)', color: '#14161A' }}
              >
                {isBlocked ? 'Deletion Blocked' : 'Delete Client'}
              </h2>
              <span className="text-xs" style={{ color: '#6B7078' }}>
                {client.name}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={deleting}
            className="p-1 text-[#6B7078] hover:text-[#14161A]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-2 text-xs leading-relaxed" style={{ color: '#6B7078' }}>
          {checking ? (
            <p>Checking linked records...</p>
          ) : isBlocked ? (
            <div
              className="p-3 rounded-md mb-2"
              style={{
                backgroundColor: '#FFFBEB',
                border: '1px solid #FDE68A',
                color: '#8A6508',
              }}
            >
              <p className="font-semibold mb-1">Cannot delete this client.</p>
              <p>
                This client has <strong>{projectCount}</strong> project{projectCount > 1 ? 's' : ''}. Delete or reassign them first before deleting the client record.
              </p>
            </div>
          ) : (
            <p>
              Are you sure you want to delete <strong>{client.name}</strong>? This action cannot be undone.
            </p>
          )}

          {error && (
            <p className="mt-2 text-[#C23B22] font-medium">{error}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-5 pt-3" style={{ borderTop: '1px solid #E3E1DC' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 text-xs font-medium rounded-md transition-colors"
            style={{
              border: '1px solid #E3E1DC',
              backgroundColor: '#FFFFFF',
              color: '#14161A',
            }}
          >
            {isBlocked ? 'Close' : 'Cancel'}
          </button>
          {!isBlocked && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || checking}
              className="px-4 py-2 text-xs font-medium rounded-md transition-colors flex items-center justify-center min-w-[80px]"
              style={{
                backgroundColor: '#C23B22',
                color: '#FFFFFF',
                opacity: deleting || checking ? 0.6 : 1,
              }}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * DeleteClientDialog wrapper
 */
export default function DeleteClientDialog({ isOpen, onClose, onConfirm, client }) {
  if (!isOpen || !client) return null

  return (
    <DeleteClientContent
      key={client.id}
      onClose={onClose}
      onConfirm={onConfirm}
      client={client}
    />
  )
}
