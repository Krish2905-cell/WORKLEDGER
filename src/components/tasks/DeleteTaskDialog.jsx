import { useState } from 'react'
import { AlertCircle, X } from 'lucide-react'

export default function DeleteTaskDialog({ isOpen, onClose, onConfirm, task }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen || !task) return null

  async function handleConfirm() {
    setLoading(true)
    setError(null)

    const { error: deleteError } = await onConfirm(task.id)
    if (deleteError) {
      setError(deleteError.message || 'Failed to delete task.')
      setLoading(false)
    } else {
      setLoading(false)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-[#14161A]/20 backdrop-blur-sm" 
        onClick={() => !loading && onClose()}
      />
      <div 
        className="relative w-full max-w-sm p-6 rounded-lg shadow-xl"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #E3E1DC' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[#C23B22]">
            <AlertCircle size={20} />
            <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
              Delete Task
            </h2>
          </div>
          <button 
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded text-[#6B7078] hover:text-[#14161A] hover:bg-[#F0EFEC] transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-sm mb-6" style={{ color: '#6B7078' }}>
          Are you sure you want to delete <span className="font-semibold text-[#14161A]">"{task.title}"</span>? This action cannot be undone.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded text-xs font-medium bg-[#FEF2F2] text-[#C23B22] border border-[#FECACA]">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-medium rounded-md transition-colors disabled:opacity-50 hover:bg-[#F0EFEC]"
            style={{ color: '#6B7078' }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 text-xs font-medium rounded-md transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#C23B22', color: '#FFFFFF' }}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
