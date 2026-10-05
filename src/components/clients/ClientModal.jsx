import { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'

/**
 * ClientModalContent
 *
 * Inner form rendered only when modal is open with the active client key.
 * Form state is initialized directly from props without cascading setState in effects.
 */
function ClientModalContent({ onClose, onSave, client }) {
  const [name, setName] = useState(client?.name || '')
  const [email, setEmail] = useState(client?.email || '')
  const [company, setCompany] = useState(client?.company || '')
  const [notes, setNotes] = useState(client?.notes || '')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const isEditing = Boolean(client?.id)

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return

    if (!name.trim()) {
      setError('Client name is required.')
      return
    }

    setError(null)
    setSubmitting(true)

    const payload = {
      name: name.trim(),
      email: email.trim() || null,
      company: company.trim() || null,
      notes: notes.trim() || null,
    }

    const { error: saveError } = await onSave(payload, client?.id)

    if (saveError) {
      setError(saveError.message || 'Failed to save client.')
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
              Directory
            </span>
            <h2
              className="text-lg font-semibold"
              style={{ fontFamily: 'var(--font-heading)', color: '#14161A' }}
            >
              {isEditing ? 'Edit Client' : 'Add New Client'}
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
              <label htmlFor="client-name" className="text-xs font-semibold" style={{ color: '#14161A' }}>
                Client name <span style={{ color: '#C23B22' }}>*</span>
              </label>
              <input
                id="client-name"
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Studio or Sarah Jenkins"
                className="w-full rounded-md px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-offset-1"
                style={{
                  border: '1px solid #E3E1DC',
                  color: '#14161A',
                  backgroundColor: '#FAFAF8',
                  '--tw-ring-color': '#1F3D3A',
                }}
              />
            </div>

            {/* Email (Optional) */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="client-email" className="text-xs font-semibold" style={{ color: '#14161A' }}>
                Email address <span className="text-[11px] font-normal" style={{ color: '#6B7078' }}>(optional)</span>
              </label>
              <input
                id="client-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="billing@acmestudio.com"
                className="w-full rounded-md px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-offset-1"
                style={{
                  border: '1px solid #E3E1DC',
                  color: '#14161A',
                  backgroundColor: '#FAFAF8',
                  '--tw-ring-color': '#1F3D3A',
                }}
              />
            </div>

            {/* Company (Optional) */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="client-company" className="text-xs font-semibold" style={{ color: '#14161A' }}>
                Company / Organization <span className="text-[11px] font-normal" style={{ color: '#6B7078' }}>(optional)</span>
              </label>
              <input
                id="client-company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Inc."
                className="w-full rounded-md px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-offset-1"
                style={{
                  border: '1px solid #E3E1DC',
                  color: '#14161A',
                  backgroundColor: '#FAFAF8',
                  '--tw-ring-color': '#1F3D3A',
                }}
              />
            </div>

            {/* Notes (Optional) */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="client-notes" className="text-xs font-semibold" style={{ color: '#14161A' }}>
                Notes <span className="text-[11px] font-normal" style={{ color: '#6B7078' }}>(optional)</span>
              </label>
              <textarea
                id="client-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Billing preferences, key contacts, or contract terms..."
                className="w-full rounded-md px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-offset-1 resize-y"
                style={{
                  border: '1px solid #E3E1DC',
                  color: '#14161A',
                  backgroundColor: '#FAFAF8',
                  '--tw-ring-color': '#1F3D3A',
                }}
              />
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
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium rounded-md transition-colors flex items-center justify-center min-w-[90px]"
              style={{
                backgroundColor: '#1F3D3A',
                color: '#FAFAF8',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/**
 * ClientModal wrapper with key resetting
 */
export default function ClientModal({ isOpen, onClose, onSave, client = null }) {
  if (!isOpen) return null

  return (
    <ClientModalContent
      key={client?.id || 'new-client'}
      onClose={onClose}
      onSave={onSave}
      client={client}
    />
  )
}
