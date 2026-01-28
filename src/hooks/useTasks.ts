import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskService, type TaskFilters, type TaskStatus, type TaskType, type TaskPriority } from '@/services/taskService'

const QUERY_KEY = 'tasks'

/**
 * Fetch tasks with optional filters
 */
export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => taskService.fetchTasks(filters),
  })
}

/**
 * Fetch tasks for a specific dossier
 */
export function useTasksByDossier(dossierId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, 'dossier', dossierId],
    queryFn: () => taskService.fetchTasksByDossier(dossierId!),
    enabled: !!dossierId,
  })
}

/**
 * Fetch pending tasks
 */
export function usePendingTasks() {
  return useQuery({
    queryKey: [QUERY_KEY, 'pending'],
    queryFn: () => taskService.fetchPendingTasks(),
  })
}

/**
 * Fetch overdue tasks
 */
export function useOverdueTasks() {
  return useQuery({
    queryKey: [QUERY_KEY, 'overdue'],
    queryFn: () => taskService.fetchOverdueTasks(),
  })
}

/**
 * Create new task
 */
export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      title: string
      dossier_id: string
      task_type: TaskType
      assigned_role_code: string
      description?: string | null
      priority?: TaskPriority | null
      due_at?: string | null
      assigned_user_id?: string | null
      created_by?: string | null
    }) => taskService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

/**
 * Update task
 */
export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof taskService.updateTask>[1] }) =>
      taskService.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

/**
 * Update task status
 */
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      taskService.updateTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}
