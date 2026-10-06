import { supabase } from '@/lib/supabase'

/**
 * invoiceService
 *
 * Database operations for the `invoices` table.
 * Ownership is enforced by Supabase RLS (joining through projects).
 */

export async function getInvoices() {
  return supabase
    .from('invoices')
    .select('*, projects(name, client_id, clients(name))')
    .order('invoice_date', { ascending: false })
}

export async function getInvoicesByProjectId(projectId) {
  return supabase
    .from('invoices')
    .select('*')
    .eq('project_id', projectId)
    .order('invoice_date', { ascending: false })
}

export async function createInvoice({ project_id, amount, invoice_date, is_paid = false }) {
  const payload = {
    project_id,
    amount,
    invoice_date,
    is_paid,
  }

  return supabase
    .from('invoices')
    .insert(payload)
    .select()
    .single()
}

export async function updateInvoice(id, { project_id, amount, invoice_date, is_paid }) {
  const payload = {}
  if (project_id !== undefined) payload.project_id = project_id
  if (amount !== undefined) payload.amount = amount
  if (invoice_date !== undefined) payload.invoice_date = invoice_date
  if (is_paid !== undefined) payload.is_paid = is_paid

  return supabase
    .from('invoices')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
}

export async function deleteInvoice(id) {
  return supabase
    .from('invoices')
    .delete()
    .eq('id', id)
}
