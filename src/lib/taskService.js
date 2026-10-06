import { supabase } from '@/lib/supabase'

/**
 * taskService
 *
 * Database operations for the `tasks` table.
 * Ownership is enforced by Supabase RLS (joining through projects).
 */

export async function getTasks() {
  return supabase
    .from('tasks')
    .select('*, projects(name, client_id, clients(name))')
    .order('due_date', { ascending: true })
}

export async function getTasksByProjectId(projectId) {
  return supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('due_date', { ascending: true })
}

export async function createTask({ project_id, title, due_date, is_done = false }) {
  const payload = {
    project_id,
    title: title.trim(),
    due_date,
    is_done,
  }

  return supabase
    .from('tasks')
    .insert(payload)
    .select()
    .single()
}

export async function updateTask(id, { project_id, title, due_date, is_done }) {
  const payload = {}
  if (project_id !== undefined) payload.project_id = project_id
  if (title !== undefined) payload.title = title.trim()
  if (due_date !== undefined) payload.due_date = due_date
  if (is_done !== undefined) payload.is_done = is_done

  return supabase
    .from('tasks')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
}

export async function deleteTask(id) {
  return supabase
    .from('tasks')
    .delete()
    .eq('id', id)
}
