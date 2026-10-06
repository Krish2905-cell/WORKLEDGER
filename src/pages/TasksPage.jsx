import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, AlertCircle, CheckSquare, Square, Calendar } from 'lucide-react'
import AppLayout from '@/components/AppLayout'
import TaskModal from '@/components/tasks/TaskModal'
import DeleteTaskDialog from '@/components/tasks/DeleteTaskDialog'
import { getTasks, createTask, updateTask, deleteTask } from '@/lib/taskService'

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)

  const fetchTasksList = useCallback(async () => {
    setError(null)
    const { data, error: fetchError } = await getTasks()

    if (fetchError) {
      setError(fetchError.message || 'Failed to load tasks.')
    } else {
      setTasks(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    let active = true
    async function load() {
      const { data, error: fetchError } = await getTasks()
      if (!active) return

      if (fetchError) {
        setError(fetchError.message || 'Failed to load tasks.')
      } else {
        setTasks(data || [])
      }
      setLoading(false)
    }
    load()
    return () => { active = false }
  }, [])

  function handleOpenCreate() {
    setEditingTask(null)
    setModalOpen(true)
  }

  function handleOpenEdit(task) {
    setEditingTask(task)
    setModalOpen(true)
  }

  function handleOpenDelete(task) {
    setTaskToDelete(task)
    setDeleteDialogOpen(true)
  }

  async function handleSaveTask(payload, id) {
    let result
    if (id) {
      result = await updateTask(id, payload)
    } else {
      result = await createTask(payload)
    }

    if (!result.error) {
      await fetchTasksList()
    }
    return result
  }

  async function handleDeleteTask(id) {
    const result = await deleteTask(id)
    if (!result.error) {
      await fetchTasksList()
    }
    return result
  }

  async function handleToggleDone(task) {
    const newIsDone = !task.is_done
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_done: newIsDone } : t))
    const { error: updateErr } = await updateTask(task.id, { is_done: newIsDone })
    if (updateErr) {
      setError('Failed to update task status.')
      await fetchTasksList()
    }
  }

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest block mb-1" style={{ color: '#1F3D3A', fontFamily: 'var(--font-heading)' }}>
            To-Do
          </span>
          <h1 className="text-2xl sm:text-3xl font-semibold leading-tight" style={{ fontFamily: 'var(--font-heading)', color: '#14161A', letterSpacing: '-0.02em' }}>
            Tasks
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: '#6B7078' }}>
            Manage tasks across all your projects.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium rounded-md transition-colors self-start sm:self-auto"
          style={{ backgroundColor: '#1F3D3A', color: '#FAFAF8' }}
        >
          <Plus size={15} />
          <span>Add Task</span>
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-4 rounded-md mb-6 text-xs font-medium" style={{ backgroundColor: '#FEF2F2', color: '#C23B22', border: '1px solid #FECACA' }}>
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold mb-0.5">Error</p>
            <p>{error}</p>
          </div>
          <button onClick={fetchTasksList} className="underline hover:opacity-80 transition-opacity">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="rounded-md overflow-hidden p-8 text-center" style={{ border: '1px solid #E3E1DC', backgroundColor: '#FFFFFF' }}>
          <div className="animate-pulse space-y-4 max-w-md mx-auto">
            <div className="h-4 bg-[#F0EFEC] rounded w-1/3 mx-auto" />
            <div className="h-3 bg-[#F0EFEC] rounded w-2/3 mx-auto" />
            <div className="h-8 bg-[#F0EFEC] rounded w-1/2 mx-auto mt-4" />
          </div>
          <p className="text-xs mt-4" style={{ color: '#6B7078' }}>Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-md p-12 text-center flex flex-col items-center justify-center" style={{ border: '1px solid #E3E1DC', backgroundColor: '#FFFFFF' }}>
          <div className="w-12 h-12 rounded-md flex items-center justify-center mb-4" style={{ backgroundColor: '#F0EFEC', border: '1px solid #E3E1DC' }}>
            <CheckSquare size={22} style={{ color: '#1F3D3A' }} />
          </div>
          <h2 className="text-base font-semibold mb-1" style={{ fontFamily: 'var(--font-heading)', color: '#14161A' }}>
            No tasks yet
          </h2>
          <p className="text-xs sm:text-sm max-w-sm mb-6" style={{ color: '#6B7078' }}>
            Create a task for one of your projects.
          </p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md transition-colors"
            style={{ backgroundColor: '#1F3D3A', color: '#FAFAF8' }}
          >
            <Plus size={14} />
            <span>Add First Task</span>
          </button>
        </div>
      ) : (
        <div className="bg-[#FFFFFF] rounded-md overflow-hidden border" style={{ borderColor: '#E3E1DC' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#FAFAF8] border-b" style={{ borderColor: '#E3E1DC', color: '#6B7078' }}>
                  <th className="px-6 py-3 font-medium text-xs tracking-wider">Done</th>
                  <th className="px-6 py-3 font-medium text-xs tracking-wider">Title</th>
                  <th className="px-6 py-3 font-medium text-xs tracking-wider">Project</th>
                  <th className="px-6 py-3 font-medium text-xs tracking-wider">Due Date</th>
                  <th className="px-6 py-3 font-medium text-xs tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ divideColor: '#F0EFEC' }}>
                {tasks.map(task => (
                  <tr key={task.id} className="group hover:bg-[#FAFAF8] transition-colors" style={{ color: '#14161A' }}>
                    <td className="px-6 py-4 w-12">
                      <button onClick={() => handleToggleDone(task)} className="text-[#6B7078] hover:text-[#1F3D3A] transition-colors">
                        {task.is_done ? <CheckSquare size={18} style={{ color: '#2F6E4F' }} /> : <Square size={18} />}
                      </button>
                    </td>
                    <td className="px-6 py-4 font-medium" style={{ textDecoration: task.is_done ? 'line-through' : 'none', color: task.is_done ? '#6B7078' : '#14161A' }}>
                      {task.title}
                    </td>
                    <td className="px-6 py-4">
                      {task.projects?.name || 'Unknown Project'}
                      {task.projects?.clients?.name && (
                        <div className="text-xs text-[#6B7078]">{task.projects.clients.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5" style={{ color: task.is_done ? '#6B7078' : (new Date(task.due_date) < new Date() ? '#C23B22' : '#14161A') }}>
                        <Calendar size={14} />
                        {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(task)}
                          className="p-1.5 rounded text-[#6B7078] hover:text-[#1F3D3A] hover:bg-[#F0EFEC]"
                          title="Edit Task"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(task)}
                          className="p-1.5 rounded text-[#6B7078] hover:text-[#C23B22] hover:bg-[#FEE2E2]"
                          title="Delete Task"
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

      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
      />
      <DeleteTaskDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteTask}
        task={taskToDelete}
      />
    </AppLayout>
  )
}
