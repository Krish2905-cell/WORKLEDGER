import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { getProjects } from '@/lib/projectService'

/**
 * InvoiceModal — Add / Edit an invoice.
 *
 * Same inner-form / outer-shell pattern as TaskModal — see that file for
 * rationale. InvoiceForm mounts fresh on each open, so useState initialises
 * from the invoice prop exactly once per open with no effect-based setState.
 */
function InvoiceForm({ invoice, onClose, onSave }) {
  const [projectId, setProjectId] = useState(invoice?.project_id ?? '')
  const [amount, setAmount] = useState(invoice?.amount ?? '')
  const [invoiceDate, setInvoiceDate] = useState(invoice?.invoice_date ?? '')
  const [isPaid, setIsPaid] = useState(invoice?.is_paid ?? false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [projects, setProjects] = useState([])

  useEffect(() => {
    let active = true
    getProjects().then(({ data }) => {
      if (active && data) setProjects(data)
    })
    return () => { active = false }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!projectId || !amount || !invoiceDate) {
      setError('Project, Amount, and Invoice Date are required.')
      return
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be greater than 0.')
      return
    }

    setLoading(true)
    setError(null)

    const payload = {
      project_id: projectId,
      amount: numAmount,
      invoice_date: invoiceDate,
      is_paid: isPaid,
    }

    const { error: saveError } = await onSave(payload, invoice?.id)

    if (saveError) {
      setError(saveError.message || 'An error occurred while saving.')
      setLoading(false)
    } else {
      setLoading(false)
      onClose()
    }
  }

  return (
    <>
      {error && (
        <div className="mb-4 p-3 rounded text-xs font-medium bg-[#FEF2F2] text-[#C23B22] border border-[#FECACA]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#14161A' }}>
            Project <span className="text-[#C23B22]">*</span>
          </label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md border outline-none transition-colors focus:ring-1"
            style={{
              borderColor: '#E3E1DC',
              backgroundColor: '#FAFAF8',
              color: '#14161A',
              '--tw-ring-color': '#1F3D3A',
            }}
            disabled={loading}
          >
            <option value="">Select a project...</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#14161A' }}>
            Amount (INR) <span className="text-[#C23B22]">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 50000"
            className="w-full px-3 py-2 text-sm rounded-md border outline-none transition-colors focus:ring-1"
            style={{
              borderColor: '#E3E1DC',
              backgroundColor: '#FAFAF8',
              color: '#14161A',
              '--tw-ring-color': '#1F3D3A',
            }}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#14161A' }}>
            Invoice Date <span className="text-[#C23B22]">*</span>
          </label>
          <input
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md border outline-none transition-colors focus:ring-1"
            style={{
              borderColor: '#E3E1DC',
              backgroundColor: '#FAFAF8',
              color: '#14161A',
              '--tw-ring-color': '#1F3D3A',
            }}
            disabled={loading}
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="invoice_is_paid"
            checked={isPaid}
            onChange={(e) => setIsPaid(e.target.checked)}
            disabled={loading}
            className="rounded"
            style={{ accentColor: '#1F3D3A' }}
          />
          <label htmlFor="invoice_is_paid" className="text-sm cursor-pointer select-none" style={{ color: '#14161A' }}>
            Mark as paid
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t mt-6" style={{ borderColor: '#F0EFEC' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-medium rounded-md transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'transparent', color: '#6B7078' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-xs font-medium rounded-md transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#1F3D3A', color: '#FAFAF8' }}
          >
            {loading ? 'Saving...' : 'Save Invoice'}
          </button>
        </div>
      </form>
    </>
  )
}

export default function InvoiceModal({ isOpen, onClose, onSave, invoice }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#14161A]/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md p-6 rounded-lg shadow-xl"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #E3E1DC' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold" style={{ color: '#14161A', fontFamily: 'var(--font-heading)' }}>
            {invoice ? 'Edit Invoice' : 'Add Invoice'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#6B7078] hover:text-[#14161A] hover:bg-[#F0EFEC] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Key ensures InvoiceForm remounts on each open for clean state init. */}
        <InvoiceForm
          key={`${invoice?.id ?? 'new'}-${String(isOpen)}`}
          invoice={invoice}
          onClose={onClose}
          onSave={onSave}
        />
      </div>
    </div>
  )
}
