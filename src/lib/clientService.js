import { supabase } from '@/lib/supabase'

/**
 * clientService
 *
 * All Supabase database operations for the `clients` table live here.
 * Keeps data fetching and business logic isolated from UI components.
 * Ownership is enforced by Supabase Row Level Security (RLS) on user_id.
 */

/**
 * Fetch all clients for the authenticated user, ordered alphabetically by name.
 */
export async function getClients() {
  return supabase
    .from('clients')
    .select('*')
    .order('name', { ascending: true })
}

/**
 * Fetch a single client by ID.
 */
export async function getClientById(id) {
  return supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()
}

/**
 * Create a new client record.
 * user_id is automatically attached or checked via auth.uid() in Supabase RLS.
 */
export async function createClient({ name, email, company, notes }) {
  // Get current user session to pass user_id explicitly if needed
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('User not authenticated') }
  }

  const payload = {
    user_id: user.id,
    name: name.trim(),
    email: email ? email.trim() : null,
    company: company ? company.trim() : null,
    notes: notes ? notes.trim() : null,
  }

  return supabase
    .from('clients')
    .insert(payload)
    .select()
    .single()
}

/**
 * Update an existing client.
 */
export async function updateClient(id, { name, email, company, notes }) {
  const payload = {
    name: name.trim(),
    email: email ? email.trim() : null,
    company: company ? company.trim() : null,
    notes: notes ? notes.trim() : null,
  }

  return supabase
    .from('clients')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
}

/**
 * Check whether a client has any linked projects before deletion.
 * (Rules.md: Client with linked projects -> deletion BLOCKED)
 */
export async function getClientProjectsCount(clientId) {
  const { count, error } = await supabase
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('client_id', clientId)

  return { count: count || 0, error }
}

/**
 * Delete a client by ID.
 * Note: If projects exist, Postgres foreign key ON DELETE RESTRICT will also reject the delete.
 */
export async function deleteClient(id) {
  return supabase
    .from('clients')
    .delete()
    .eq('id', id)
}
