import { useState, useEffect, useCallback } from 'react'
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Building,
  FileText,
  AlertCircle,
  Search,
} from 'lucide-react'
import AppLayout from '@/components/AppLayout'
import ClientModal from '@/components/clients/ClientModal'
import DeleteClientDialog from '@/components/clients/DeleteClientDialog'
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
} from '@/lib/clientService'

/**
 * ClientsPage — /clients
 *
 * Phase 3: Clients CRUD Only
 *
 * Design.md & AppFlow.md requirements:
 * - Table-first layout (collapsing to clean stacked rows on mobile)
 * - Empty state with centered icon, text, and single primary button
 * - Loading and error states
 * - Add/Edit modal (name, email, company, notes)
 * - Confirm delete dialog enforcing deletion-blocked-by-projects
 * - Consistent editorial styling (#FAFAF8, #1F3D3A, Archivo headings, Inter body, JetBrains Mono numbers)
 */
export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState(null)

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState(null)

  const fetchClientsList = useCallback(async () => {
    setError(null)
    const { data, error: fetchError } = await getClients()

    if (fetchError) {
      setError(fetchError.message || 'Failed to load clients.')
    } else {
      setClients(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    let active = true

    async function load() {
      const { data, error: fetchError } = await getClients()
      if (!active) return

      if (fetchError) {
        setError(fetchError.message || 'Failed to load clients.')
      } else {
        setClients(data || [])
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
    setEditingClient(null)
    setModalOpen(true)
  }

  // Open modal for Edit
  function handleOpenEdit(client) {
    setEditingClient(client)
    setModalOpen(true)
  }

  // Open Delete Confirmation
  function handleOpenDelete(client) {
    setClientToDelete(client)
    setDeleteDialogOpen(true)
  }

  // Save (Create or Update) handler
  async function handleSaveClient(payload, id) {
    let result
    if (id) {
      result = await updateClient(id, payload)
    } else {
      result = await createClient(payload)
    }

    if (!result.error) {
      await fetchClientsList()
    }
    return result
  }

  // Delete handler
  async function handleDeleteClient(id) {
    const result = await deleteClient(id)
    if (!result.error) {
      await fetchClientsList()
    }
    return result
  }

  // Filter clients by search query
  const filteredClients = clients.filter((client) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      client.name?.toLowerCase().includes(q) ||
      client.company?.toLowerCase().includes(q) ||
      client.email?.toLowerCase().includes(q) ||
      client.notes?.toLowerCase().includes(q)
    )
  })

  return (
    <AppLayout>
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <span
            className="text-[11px] font-semibold uppercase tracking-widest block mb-1"
            style={{ color: '#1F3D3A', fontFamily: 'var(--font-heading)' }}
          >
            Directory
          </span>
          <h1
            className="text-2xl sm:text-3xl font-semibold leading-tight"
            style={{ fontFamily: 'var(--font-heading)', color: '#14161A', letterSpacing: '-0.02em' }}
          >
            Clients
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: '#6B7078' }}>
            Manage client records, contact details, and organization notes.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium rounded-md transition-colors self-start sm:self-auto"
          style={{ backgroundColor: '#1F3D3A', color: '#FAFAF8' }}
        >
          <Plus size={15} />
          <span>Add Client</span>
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
            <p className="font-semibold mb-0.5">Error fetching clients</p>
            <p>{error}</p>
          </div>
          <button
            onClick={fetchClientsList}
            className="underline hover:opacity-80 transition-opacity"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Search & Filter Controls (When clients exist) ─────────────────── */}
      {!loading && clients.length > 0 && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-md w-full sm:max-w-xs"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E3E1DC',
            }}
          >
            <Search size={14} style={{ color: '#6B7078' }} />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs outline-none bg-transparent"
              style={{ color: '#14161A' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[10px] text-[#6B7078] hover:text-[#14161A]"
              >
                Clear
              </button>
            )}
          </div>
          <span className="text-xs hidden sm:inline" style={{ color: '#6B7078' }}>
            {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'}
          </span>
        </div>
      )}

      {/* ── Main Content Area (Loading, Empty, or Table) ─────────────────── */}
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
            Loading client directory...
          </p>
        </div>
      ) : clients.length === 0 ? (
        /* Empty State (Design.md §7: centered icon + one-line message + single primary button) */
        <div
          className="rounded-md p-12 text-center flex flex-col items-center justify-center"
          style={{ border: '1px solid #E3E1DC', backgroundColor: '#FFFFFF' }}
        >
          <div
            className="w-12 h-12 rounded-md flex items-center justify-center mb-4"
            style={{ backgroundColor: '#F0EFEC', border: '1px solid #E3E1DC' }}
          >
            <Users size={22} style={{ color: '#1F3D3A' }} />
          </div>
          <h2
            className="text-base font-semibold mb-1"
            style={{ fontFamily: 'var(--font-heading)', color: '#14161A' }}
          >
            No clients yet
          </h2>
          <p className="text-xs sm:text-sm max-w-sm mb-6" style={{ color: '#6B7078' }}>
            Add your first client to start organizing projects, deadlines, and invoices.
          </p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md transition-colors"
            style={{ backgroundColor: '#1F3D3A', color: '#FAFAF8' }}
          >
            <Plus size={14} />
            <span>Add First Client</span>
          </button>
        </div>
      ) : filteredClients.length === 0 ? (
        /* No search results */
        <div
          className="rounded-md p-8 text-center"
          style={{ border: '1px solid #E3E1DC', backgroundColor: '#FFFFFF' }}
        >
          <p className="text-xs" style={{ color: '#6B7078' }}>
            No clients found matching &ldquo;{searchQuery}&rdquo;.
          </p>
        </div>
      ) : (
        /* ── Clients Table ──────────────────────────────────────────────── */
        <div
          className="rounded-md overflow-hidden"
          style={{ border: '1px solid #E3E1DC', backgroundColor: '#FFFFFF' }}
        >
          {/* Desktop Table View */}
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  className="text-[11px] uppercase tracking-wider font-semibold"
                  style={{
                    backgroundColor: '#FAFAF8',
                    borderBottom: '1px solid #E3E1DC',
                    color: '#6B7078',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  <th className="px-5 py-3">Client Name</th>
                  <th className="px-5 py-3">Company</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Notes</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E1DC] text-xs">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-[#FAFAF8] transition-colors"
                  >
                    {/* Name */}
                    <td className="px-5 py-3.5 font-medium" style={{ color: '#14161A' }}>
                      {client.name}
                    </td>

                    {/* Company */}
                    <td className="px-5 py-3.5" style={{ color: '#6B7078' }}>
                      {client.company ? (
                        <div className="flex items-center gap-1.5">
                          <Building size={13} className="opacity-60 flex-shrink-0" />
                          <span>{client.company}</span>
                        </div>
                      ) : (
                        <span className="opacity-40">—</span>
                      )}
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3.5" style={{ color: '#6B7078' }}>
                      {client.email ? (
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Mail size={13} className="opacity-60 flex-shrink-0" />
                          <a
                            href={`mailto:${client.email}`}
                            className="hover:underline hover:text-[#1F3D3A]"
                          >
                            {client.email}
                          </a>
                        </div>
                      ) : (
                        <span className="opacity-40">—</span>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="px-5 py-3.5 max-w-xs truncate" style={{ color: '#6B7078' }}>
                      {client.notes ? (
                        <div className="flex items-center gap-1.5 truncate" title={client.notes}>
                          <FileText size={13} className="opacity-60 flex-shrink-0" />
                          <span className="truncate">{client.notes}</span>
                        </div>
                      ) : (
                        <span className="opacity-40">—</span>
                      )}
                    </td>

                    {/* Row Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(client)}
                          className="p-1.5 rounded text-[#6B7078] hover:text-[#1F3D3A] hover:bg-[#F0EFEC] transition-colors"
                          title="Edit client"
                          aria-label={`Edit ${client.name}`}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(client)}
                          className="p-1.5 rounded text-[#6B7078] hover:text-[#C23B22] hover:bg-[#FEE2E2] transition-colors"
                          title="Delete client"
                          aria-label={`Delete ${client.name}`}
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

          {/* Mobile Stacked Card Rows (Design.md §8) */}
          <div className="divide-y divide-[#E3E1DC] md:hidden">
            {filteredClients.map((client) => (
              <div key={client.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <span className="text-sm font-semibold" style={{ color: '#14161A' }}>
                    {client.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(client)}
                      className="p-1.5 rounded text-[#6B7078] hover:text-[#1F3D3A]"
                      aria-label="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(client)}
                      className="p-1.5 rounded text-[#6B7078] hover:text-[#C23B22]"
                      aria-label="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {client.company && (
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: '#6B7078' }}>
                    <Building size={13} />
                    <span>{client.company}</span>
                  </div>
                )}

                {client.email && (
                  <div className="flex items-center gap-1.5 text-xs font-mono" style={{ color: '#6B7078' }}>
                    <Mail size={13} />
                    <a href={`mailto:${client.email}`} className="hover:underline">
                      {client.email}
                    </a>
                  </div>
                )}

                {client.notes && (
                  <p className="text-xs pt-1 border-t border-[#F0EFEC]" style={{ color: '#6B7078' }}>
                    {client.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Client Add/Edit Modal Dialog ─────────────────────────────────── */}
      <ClientModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveClient}
        client={editingClient}
      />

      {/* ── Client Delete Confirmation Dialog ────────────────────────────── */}
      <DeleteClientDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteClient}
        client={clientToDelete}
      />
    </AppLayout>
  )
}
