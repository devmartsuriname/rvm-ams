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

// --- Chair dashboard types ---

export type ChairDecisionRow = {
  id: string
  decision_text: string
  decision_status: string | null
  is_final: boolean | null
  updated_at: string | null
  chair_approved_at: string | null
  rvm_agenda_item: {
    agenda_number: number
    rvm_meeting: { id: string; meeting_date: string; meeting_type: string | null } | null
  } | null
}

export type ChairMeetingRow = {
  id: string
  meeting_date: string
  meeting_type: string | null
  location: string | null
  status: string | null
}

export type ChairStats = {
  pendingDecisions: ChairDecisionRow[]
  upcomingMeetings: ChairMeetingRow[]
  recentlyFinalized: ChairDecisionRow[]
  meetingsPendingClosure: number
  decisionsPendingApproval: number
}

// --- Secretary dashboard types ---

export type SecretaryMeetingRow = {
  id: string
  meeting_date: string
  meeting_type: string | null
  location: string | null
  status: string | null
}

export type SecretaryAgendaRow = {
  id: string
  agenda_number: number
  status: string | null
  rvm_meeting: { id: string; meeting_date: string } | null
  rvm_dossier: { id: string; title: string; dossier_number: string } | null
}

export type SecretaryDecisionRow = {
  id: string
  decision_text: string
  decision_status: string | null
  is_final: boolean | null
  rvm_agenda_item: {
    agenda_number: number
    rvm_meeting: { id: string; meeting_date: string } | null
  } | null
}

export type SecretaryStats = {
  upcomingMeetings: SecretaryMeetingRow[]
  agendaItemsNeedingPrep: SecretaryAgendaRow[]
  decisionsAwaitingDoc: SecretaryDecisionRow[]
  upcomingMeetingsCount: number
  pendingAgendaCount: number
  pendingDecisionsCount: number
}

// --- Analyst dashboard types ---

export type AnalystDossierRow = {
  id: string
  dossier_number: string
  title: string
  status: string | null
  sender_ministry: string
}

export type AnalystTaskRow = {
  id: string
  title: string
  priority: string | null
  status: string | null
  due_at: string | null
}

export type AnalystAgendaRow = {
  id: string
  agenda_number: number
  rvm_meeting: { id: string; meeting_date: string } | null
  rvm_dossier: { id: string; title: string } | null
}

export type AnalystStats = {
  dossiersInAnalysis: AnalystDossierRow[]
  assignedTasks: AnalystTaskRow[]
  agendaDrafts: AnalystAgendaRow[]
  activeDossiersCount: number
  pendingTasksCount: number
  scheduledAgendaCount: number
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
      supabase.from('rvm_dossier').select('id', { count: 'exact', head: true }),
      supabase.from('rvm_dossier').select('id', { count: 'exact', head: true })
        .not('status', 'in', '(decided,archived,cancelled)'),
      supabase.from('rvm_meeting').select('id', { count: 'exact', head: true }),
      supabase.from('rvm_meeting').select('id', { count: 'exact', head: true })
        .gte('meeting_date', today)
        .in('status', ['draft', 'published']),
      supabase.from('rvm_task').select('id', { count: 'exact', head: true }),
      supabase.from('rvm_task').select('id', { count: 'exact', head: true })
        .in('status', ['todo', 'in_progress']),
      supabase.from('rvm_dossier').select('status'),
      supabase.from('rvm_task').select('status')
    ])

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
  },

  async fetchChairStats(): Promise<ChairStats> {
    const today = new Date().toISOString().split('T')[0]

    const [
      pendingDecisionsResult,
      upcomingMeetingsResult,
      recentlyFinalizedResult,
      meetingsPendingClosureResult,
    ] = await Promise.all([
      // Decisions awaiting chair approval
      supabase.from('rvm_decision')
        .select('id, decision_text, decision_status, is_final, updated_at, chair_approved_at, rvm_agenda_item(agenda_number, rvm_meeting(id, meeting_date, meeting_type))')
        .eq('decision_status', 'pending')
        .eq('is_final', false)
        .limit(10),
      // Upcoming meetings
      supabase.from('rvm_meeting')
        .select('id, meeting_date, meeting_type, location, status')
        .in('status', ['draft', 'published'])
        .gte('meeting_date', today)
        .order('meeting_date', { ascending: true })
        .limit(10),
      // Recently finalized decisions
      supabase.from('rvm_decision')
        .select('id, decision_text, decision_status, is_final, updated_at, chair_approved_at, rvm_agenda_item(agenda_number, rvm_meeting(id, meeting_date, meeting_type))')
        .eq('is_final', true)
        .order('updated_at', { ascending: false })
        .limit(5),
      // Meetings pending closure count
      supabase.from('rvm_meeting')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published'),
    ])

    const pendingDecisions = (pendingDecisionsResult.data ?? []) as unknown as ChairDecisionRow[]
    const upcomingMeetings = (upcomingMeetingsResult.data ?? []) as unknown as ChairMeetingRow[]
    const recentlyFinalized = (recentlyFinalizedResult.data ?? []) as unknown as ChairDecisionRow[]

    return {
      pendingDecisions,
      upcomingMeetings,
      recentlyFinalized,
      meetingsPendingClosure: meetingsPendingClosureResult.count ?? 0,
      decisionsPendingApproval: pendingDecisions.length,
    }
  },

  async fetchSecretaryStats(): Promise<SecretaryStats> {
    const today = new Date().toISOString().split('T')[0]

    const [
      upcomingMeetingsResult,
      agendaItemsResult,
      decisionsAwaitingDocResult,
    ] = await Promise.all([
      // Upcoming meetings
      supabase.from('rvm_meeting')
        .select('id, meeting_date, meeting_type, location, status')
        .gte('meeting_date', today)
        .order('meeting_date', { ascending: true })
        .limit(10),
      // Agenda items needing preparation
      supabase.from('rvm_agenda_item')
        .select('id, agenda_number, status, rvm_meeting(id, meeting_date), rvm_dossier(id, title, dossier_number)')
        .eq('status', 'scheduled')
        .limit(10),
      // Decisions approved but not finalized
      supabase.from('rvm_decision')
        .select('id, decision_text, decision_status, is_final, rvm_agenda_item(agenda_number, rvm_meeting(id, meeting_date))')
        .eq('decision_status', 'approved')
        .eq('is_final', false)
        .limit(10),
    ])

    const upcomingMeetings = (upcomingMeetingsResult.data ?? []) as unknown as SecretaryMeetingRow[]
    const agendaItemsNeedingPrep = (agendaItemsResult.data ?? []) as unknown as SecretaryAgendaRow[]
    const decisionsAwaitingDoc = (decisionsAwaitingDocResult.data ?? []) as unknown as SecretaryDecisionRow[]

    return {
      upcomingMeetings,
      agendaItemsNeedingPrep,
      decisionsAwaitingDoc,
      upcomingMeetingsCount: upcomingMeetings.length,
      pendingAgendaCount: agendaItemsNeedingPrep.length,
      pendingDecisionsCount: decisionsAwaitingDoc.length,
    }
  },

  async fetchAnalystStats(): Promise<AnalystStats> {
    const [
      dossiersResult,
      tasksResult,
      agendaDraftsResult,
    ] = await Promise.all([
      // Dossiers in analysis
      supabase.from('rvm_dossier')
        .select('id, dossier_number, title, status, sender_ministry')
        .in('status', ['registered', 'in_preparation'])
        .limit(10),
      // Active tasks
      supabase.from('rvm_task')
        .select('id, title, priority, status, due_at')
        .in('status', ['todo', 'in_progress'])
        .order('due_at', { ascending: true, nullsFirst: false })
        .limit(10),
      // Scheduled agenda items
      supabase.from('rvm_agenda_item')
        .select('id, agenda_number, rvm_meeting(id, meeting_date), rvm_dossier(id, title)')
        .eq('status', 'scheduled')
        .limit(10),
    ])

    const dossiersInAnalysis = (dossiersResult.data ?? []) as unknown as AnalystDossierRow[]
    const assignedTasks = (tasksResult.data ?? []) as unknown as AnalystTaskRow[]
    const agendaDrafts = (agendaDraftsResult.data ?? []) as unknown as AnalystAgendaRow[]

    return {
      dossiersInAnalysis,
      assignedTasks,
      agendaDrafts,
      activeDossiersCount: dossiersInAnalysis.length,
      pendingTasksCount: assignedTasks.length,
      scheduledAgendaCount: agendaDrafts.length,
    }
  },
}
