import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { getProjects } from '@/lib/projectService'

/**
 * TaskModal — Add / Edit a task.
 *
 * The inner TaskForm component mounts fresh each time the modal opens,
 * so useState initialises from props exactly once per open. This avoids
 * setting state inside an effect (react-hooks/set-state-in-effect) and
 * mutating refs during render (react-hooks/refs).
 */
function TaskForm({ task, onClose, onSave }) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [projectId, setProjectId] = useState(task?.project_id ?? '')
  const [dueDate, setDueDate] = useState(task?.due_date ?? '')
  const [isDone, setIsDone] = useState(task?.is_done ?? false)
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
    if (!title.trim() || !projectId || !dueDate) {
      setError('Title, Project, and Due Date are required.')
      return
    }

    setLoading(true)
    setError(null)

    const payload = {
      title,
      project_id: projectId,
      due_date: dueDate,
      is_done: isDone,
    }

    const { error: saveError } = await onSave(payload, task?.id)

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
            Task Title <span className="text-[#C23B22]">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Draft homepage copy"
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
            Due Date <span className="text-[#C23B22]">*</span>
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
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
            id="task_is_done"
            checked={isDone}
            onChange={(e) => setIsDone(e.target.checked)}
            disabled={loading}
            className="rounded"
            style={{ accentColor: '#1F3D3A' }}
          />
          <label htmlFor="task_is_done" className="text-sm cursor-pointer select-none" style={{ color: '#14161A' }}>
            Mark as complete
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
            {loading ? 'Saving...' : 'Save Task'}
          </button>
        </div>
      </form>
    </>
  )
}

export default function TaskModal({ isOpen, onClose, onSave, task }) {
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
            {task ? 'Edit Task' : 'Add Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#6B7078] hover:text-[#14161A] hover:bg-[#F0EFEC] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Key on task?.id + isOpen ensures TaskForm remounts on each open,
            so useState initialises cleanly from the latest task prop. */}
        <TaskForm
          key={`${task?.id ?? 'new'}-${String(isOpen)}`}
          task={task}
          onClose={onClose}
          onSave={onSave}
        />
      </div>
    </div>
  )
}
