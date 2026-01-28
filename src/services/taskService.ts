import { supabase } from '@/integrations/supabase/client'
import type { Tables, TablesInsert, TablesUpdate, Enums } from '@/integrations/supabase/types'

export type Task = Tables<'rvm_task'>
export type TaskInsert = TablesInsert<'rvm_task'>
export type TaskUpdate = TablesUpdate<'rvm_task'>
export type TaskStatus = Enums<'task_status'>
export type TaskType = Enums<'task_type'>
export type TaskPriority = Enums<'task_priority'>

export type TaskWithDossier = Task & {
  rvm_dossier: {
    id: string
    dossier_number: string
    title: string
  } | null
}

export type TaskFilters = {
  status?: TaskStatus
  task_type?: TaskType
  priority?: TaskPriority
  dossier_id?: string
}

/**
 * Task Service - CRUD operations aligned with RLS permissions
 * INSERT: secretary_rvm, deputy_secretary
 * UPDATE: Own tasks + secretary_rvm + deputy_secretary
 * SELECT: Assigned role + secretary_rvm + deputy_secretary
 */
export const taskService = {
  /**
   * Fetch tasks with optional filters
   * RLS filters based on assigned_role_code matching user's roles
   */
  async fetchTasks(filters?: TaskFilters) {
    let query = supabase
      .from('rvm_task')
      .select(`
        *,
        rvm_dossier:dossier_id(id, dossier_number, title)
      `)
      .order('due_at', { ascending: true, nullsFirst: false })
      .order('priority', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.task_type) {
      query = query.eq('task_type', filters.task_type)
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority)
    }
    if (filters?.dossier_id) {
      query = query.eq('dossier_id', filters.dossier_id)
    }

    const { data, error } = await query
    if (error) throw error
    return data as TaskWithDossier[]
  },

  /**
   * Fetch tasks for a specific dossier
   */
  async fetchTasksByDossier(dossierId: string) {
    const { data, error } = await supabase
      .from('rvm_task')
      .select('*')
      .eq('dossier_id', dossierId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  /**
   * Create new task
   * Requires: secretary_rvm or deputy_secretary role
   */
  async createTask(data: Omit<TaskInsert, 'id' | 'created_at' | 'updated_at'>) {
    const { data: task, error } = await supabase
      .from('rvm_task')
      .insert({
        ...data,
        status: 'todo',
      })
      .select()
      .single()

    if (error) throw error
    return task
  },

  /**
   * Update task
   * RLS enforces: own tasks or secretary_rvm/deputy_secretary
   */
  async updateTask(id: string, data: TaskUpdate) {
    const { data: updated, error } = await supabase
      .from('rvm_task')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return updated
  },

  /**
   * Update task status with timestamp tracking
   */
  async updateTaskStatus(id: string, status: TaskStatus) {
    const statusData: TaskUpdate = { status }

    // Set timestamps based on status transition
    if (status === 'in_progress') {
      statusData.started_at = new Date().toISOString()
    } else if (status === 'done') {
      statusData.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('rvm_task')
      .update(statusData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Fetch pending tasks (todo or in_progress)
   */
  async fetchPendingTasks() {
    const { data, error } = await supabase
      .from('rvm_task')
      .select(`
        *,
        rvm_dossier:dossier_id(id, dossier_number, title)
      `)
      .in('status', ['todo', 'in_progress'])
      .order('priority', { ascending: false })
      .order('due_at', { ascending: true, nullsFirst: false })

    if (error) throw error
    return data as TaskWithDossier[]
  },

  /**
   * Fetch overdue tasks
   */
  async fetchOverdueTasks() {
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('rvm_task')
      .select(`
        *,
        rvm_dossier:dossier_id(id, dossier_number, title)
      `)
      .in('status', ['todo', 'in_progress'])
      .lt('due_at', now)
      .order('due_at', { ascending: true })

    if (error) throw error
    return data as TaskWithDossier[]
  },
}
