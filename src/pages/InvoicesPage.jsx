import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, AlertCircle, FileText, CheckCircle2, Circle } from 'lucide-react'
import AppLayout from '@/components/AppLayout'
import InvoiceModal from '@/components/invoices/InvoiceModal'
import DeleteInvoiceDialog from '@/components/invoices/DeleteInvoiceDialog'
import { getInvoices, createInvoice, updateInvoice, deleteInvoice } from '@/lib/invoiceService'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState(null)

  const fetchInvoicesList = useCallback(async () => {
    setError(null)
    const { data, error: fetchError } = await getInvoices()

    if (fetchError) {
      setError(fetchError.message || 'Failed to load invoices.')
    } else {
      setInvoices(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    let active = true
    async function load() {
      const { data, error: fetchError } = await getInvoices()
      if (!active) return

      if (fetchError) {
        setError(fetchError.message || 'Failed to load invoices.')
      } else {
        setInvoices(data || [])
      }
      setLoading(false)
    }
    load()
    return () => { active = false }
  }, [])

  function handleOpenCreate() {
    setEditingInvoice(null)
    setModalOpen(true)
  }

  function handleOpenEdit(invoice) {
    setEditingInvoice(invoice)
    setModalOpen(true)
  }

  function handleOpenDelete(invoice) {
    setInvoiceToDelete(invoice)
    setDeleteDialogOpen(true)
  }

  async function handleSaveInvoice(payload, id) {
    let result
    if (id) {
      result = await updateInvoice(id, payload)
    } else {
      result = await createInvoice(payload)
    }

    if (!result.error) {
      await fetchInvoicesList()
    }
    return result
  }

  async function handleDeleteInvoice(id) {
    const result = await deleteInvoice(id)
    if (!result.error) {
      await fetchInvoicesList()
    }
    return result
  }

  async function handleTogglePaid(invoice) {
    const newIsPaid = !invoice.is_paid
    setInvoices(prev => prev.map(i => i.id === invoice.id ? { ...i, is_paid: newIsPaid } : i))
    const { error: updateErr } = await updateInvoice(invoice.id, { is_paid: newIsPaid })
    if (updateErr) {
      setError('Failed to update invoice status.')
      await fetchInvoicesList()
    }
  }

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest block mb-1" style={{ color: '#1F3D3A', fontFamily: 'var(--font-heading)' }}>
            Billing
          </span>
          <h1 className="text-2xl sm:text-3xl font-semibold leading-tight" style={{ fontFamily: 'var(--font-heading)', color: '#14161A', letterSpacing: '-0.02em' }}>
            Invoices
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: '#6B7078' }}>
            Track and manage project invoices.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium rounded-md transition-colors self-start sm:self-auto"
          style={{ backgroundColor: '#1F3D3A', color: '#FAFAF8' }}
        >
          <Plus size={15} />
          <span>Add Invoice</span>
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-4 rounded-md mb-6 text-xs font-medium" style={{ backgroundColor: '#FEF2F2', color: '#C23B22', border: '1px solid #FECACA' }}>
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold mb-0.5">Error</p>
            <p>{error}</p>
          </div>
          <button onClick={fetchInvoicesList} className="underline hover:opacity-80 transition-opacity">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="rounded-md overflow-hidden p-8 text-center" style={{ border: '1px solid #E3E1DC', backgroundColor: '#FFFFFF' }}>
          <div className="animate-pulse space-y-4 max-w-md mx-auto">
            <div className="h-4 bg-[#F0EFEC] rounded w-1/3 mx-auto" />
            <div className="h-3 bg-[#F0EFEC] rounded w-2/3 mx-auto" />
            <div className="h-8 bg-[#F0EFEC] rounded w-1/2 mx-auto mt-4" />
          </div>
          <p className="text-xs mt-4" style={{ color: '#6B7078' }}>Loading invoices...</p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="rounded-md p-12 text-center flex flex-col items-center justify-center" style={{ border: '1px solid #E3E1DC', backgroundColor: '#FFFFFF' }}>
          <div className="w-12 h-12 rounded-md flex items-center justify-center mb-4" style={{ backgroundColor: '#F0EFEC', border: '1px solid #E3E1DC' }}>
            <FileText size={22} style={{ color: '#1F3D3A' }} />
          </div>
          <h2 className="text-base font-semibold mb-1" style={{ fontFamily: 'var(--font-heading)', color: '#14161A' }}>
            No invoices yet
          </h2>
          <p className="text-xs sm:text-sm max-w-sm mb-6" style={{ color: '#6B7078' }}>
            Create an invoice for one of your projects.
          </p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md transition-colors"
            style={{ backgroundColor: '#1F3D3A', color: '#FAFAF8' }}
          >
            <Plus size={14} />
            <span>Add First Invoice</span>
          </button>
        </div>
      ) : (
        <div className="bg-[#FFFFFF] rounded-md overflow-hidden border" style={{ borderColor: '#E3E1DC' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#FAFAF8] border-b" style={{ borderColor: '#E3E1DC', color: '#6B7078' }}>
                  <th className="px-6 py-3 font-medium text-xs tracking-wider">Status</th>
                  <th className="px-6 py-3 font-medium text-xs tracking-wider">Amount</th>
                  <th className="px-6 py-3 font-medium text-xs tracking-wider">Project</th>
                  <th className="px-6 py-3 font-medium text-xs tracking-wider">Date</th>
                  <th className="px-6 py-3 font-medium text-xs tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ divideColor: '#F0EFEC' }}>
                {invoices.map(invoice => (
                  <tr key={invoice.id} className="group hover:bg-[#FAFAF8] transition-colors" style={{ color: '#14161A' }}>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleTogglePaid(invoice)} 
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-xs font-medium border transition-colors hover:opacity-80"
                        style={{
                          backgroundColor: invoice.is_paid ? '#F0FDF4' : '#FAFAF8',
                          borderColor: invoice.is_paid ? '#BBF7D0' : '#E3E1DC',
                          color: invoice.is_paid ? '#2F6E4F' : '#6B7078',
                        }}
                      >
                        {invoice.is_paid ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                        {invoice.is_paid ? 'Paid' : 'Unpaid'}
                      </button>
                    </td>
                    <td className="px-6 py-4 font-semibold" style={{ color: '#14161A' }}>
                      ₹{invoice.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      {invoice.projects?.name || 'Unknown Project'}
                      {invoice.projects?.clients?.name && (
                        <div className="text-xs text-[#6B7078]">{invoice.projects.clients.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[#6B7078]">
                      {new Date(invoice.invoice_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(invoice)}
                          className="p-1.5 rounded text-[#6B7078] hover:text-[#1F3D3A] hover:bg-[#F0EFEC]"
                          title="Edit Invoice"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(invoice)}
                          className="p-1.5 rounded text-[#6B7078] hover:text-[#C23B22] hover:bg-[#FEE2E2]"
                          title="Delete Invoice"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <InvoiceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveInvoice}
        invoice={editingInvoice}
      />
      <DeleteInvoiceDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteInvoice}
        invoice={invoiceToDelete}
      />
    </AppLayout>
  )
}
