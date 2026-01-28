import { supabase } from '@/integrations/supabase/client'

export type StatusCount = {
  status: string
  count: number
}

export type DashboardStats = {
  totalDossiers: number
  activeDossiers: number
  totalMeetings: number
  upcomingMeetings: number
  totalTasks: number
  pendingTasks: number
  dossiersByStatus: StatusCount[]
  tasksByStatus: StatusCount[]
}

function aggregateByStatus(data: { status: string | null }[]): StatusCount[] {
  const counts: Record<string, number> = {}
  for (const item of data) {
    const status = item.status ?? 'unknown'
    counts[status] = (counts[status] ?? 0) + 1
  }
  return Object.entries(counts).map(([status, count]) => ({ status, count }))
}

export const dashboardService = {
  async fetchStats(): Promise<DashboardStats> {
    const today = new Date().toISOString().split('T')[0]

    // Execute all queries in parallel for performance
    const [
      dossiersResult,
      activeDossiersResult,
      meetingsResult,
      upcomingMeetingsResult,
      tasksResult,
      pendingTasksResult,
      dossierStatusResult,
      taskStatusResult
    ] = await Promise.all([
      // Total dossiers count
      supabase.from('rvm_dossier').select('id', { count: 'exact', head: true }),
      // Active dossiers (not decided/archived/cancelled)
      supabase.from('rvm_dossier').select('id', { count: 'exact', head: true })
        .not('status', 'in', '(decided,archived,cancelled)'),
      // Total meetings count
      supabase.from('rvm_meeting').select('id', { count: 'exact', head: true }),
      // Upcoming meetings (future date, not closed)
      supabase.from('rvm_meeting').select('id', { count: 'exact', head: true })
        .gte('meeting_date', today)
        .in('status', ['draft', 'published']),
      // Total tasks count
      supabase.from('rvm_task').select('id', { count: 'exact', head: true }),
      // Pending tasks (todo or in_progress)
      supabase.from('rvm_task').select('id', { count: 'exact', head: true })
        .in('status', ['todo', 'in_progress']),
      // All dossier statuses for chart
      supabase.from('rvm_dossier').select('status'),
      // All task statuses for chart
      supabase.from('rvm_task').select('status')
    ])

    // Aggregate status counts client-side
    const dossiersByStatus = aggregateByStatus(dossierStatusResult.data ?? [])
    const tasksByStatus = aggregateByStatus(taskStatusResult.data ?? [])

    return {
      totalDossiers: dossiersResult.count ?? 0,
      activeDossiers: activeDossiersResult.count ?? 0,
      totalMeetings: meetingsResult.count ?? 0,
      upcomingMeetings: upcomingMeetingsResult.count ?? 0,
      totalTasks: tasksResult.count ?? 0,
      pendingTasks: pendingTasksResult.count ?? 0,
      dossiersByStatus,
      tasksByStatus
    }
  }
}
