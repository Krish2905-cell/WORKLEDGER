import { supabase } from '@/lib/supabase'

/**
 * projectService
 *
 * All Supabase database operations for the `projects` table.
 * Keeps data fetching and business logic isolated from UI components.
 * Ownership is enforced by Supabase Row Level Security (RLS) on user_id.
 */

export async function getProjects() {
  return supabase
    .from('projects')
    .select('*, clients(name)')
    .order('created_at', { ascending: false })
}

export async function getProjectById(id) {
  return supabase
    .from('projects')
    .select('*, clients(name)')
    .eq('id', id)
    .single()
}

export async function createProject({ name, client_id, status = 'Planning' }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('User not authenticated') }
  }

  const payload = {
    user_id: user.id,
    client_id,
    name: name.trim(),
    status,
  }

  return supabase
    .from('projects')
    .insert(payload)
    .select()
    .single()
}

export async function updateProject(id, { name, client_id, status }) {
  const payload = {}
  if (name !== undefined) payload.name = name.trim()
  if (client_id !== undefined) payload.client_id = client_id
  if (status !== undefined) payload.status = status

  return supabase
    .from('projects')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
}

export async function getProjectChildrenCount(projectId) {
  const [{ count: tasksCount, error: tasksError }, { count: invoicesCount, error: invoicesError }] = await Promise.all([
    supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('project_id', projectId),
    supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('project_id', projectId)
  ])

  if (tasksError) return { count: 0, error: tasksError }
  if (invoicesError) return { count: 0, error: invoicesError }

  return { count: (tasksCount || 0) + (invoicesCount || 0), error: null }
}

export async function deleteProject(id) {
  return supabase
    .from('projects')
    .delete()
    .eq('id', id)
}
