import { supabase } from '@/integrations/supabase/client'

export interface SearchFilters {
  meetingDateFrom?: string
  meetingDateTo?: string
  meetingType?: string
  meetingStatus?: string
  decisionStatus?: string
  decisionDateFrom?: string
  decisionDateTo?: string
  dossierStatus?: string
  dossierMinistry?: string
  agendaStatus?: string
  agendaMeetingId?: string
}

export interface SearchResults {
  dossiers: any[]
  meetings: any[]
  agendaItems: any[]
  decisions: any[]
  documents: any[]
}

const MAX_QUERY_LENGTH = 80

export async function searchGovernanceEntities(
  query: string,
  filters?: SearchFilters
): Promise<SearchResults> {
  const trimmed = query.trim().substring(0, MAX_QUERY_LENGTH)
  if (trimmed.length < 2) {
    return { dossiers: [], meetings: [], agendaItems: [], decisions: [], documents: [] }
  }

  const pattern = `%${trimmed}%`

  const [dossiers, meetings, agendaItems, decisions, documents] = await Promise.all([
    searchDossiers(pattern, filters),
    searchMeetings(pattern, filters),
    searchAgendaItems(pattern, filters),
    searchDecisions(pattern, filters),
    searchDocuments(pattern),
  ])

  return { dossiers, meetings, agendaItems, decisions, documents }
}

async function searchDossiers(pattern: string, filters?: SearchFilters) {
  let q = supabase
    .from('rvm_dossier')
    .select('id, dossier_number, title, sender_ministry, status, urgency')
    .or(`title.ilike.${pattern},dossier_number.ilike.${pattern},sender_ministry.ilike.${pattern}`)
    .limit(10)

  if (filters?.dossierStatus) {
    q = q.eq('status', filters.dossierStatus as any)
  }
  if (filters?.dossierMinistry) {
    q = q.ilike('sender_ministry', `%${filters.dossierMinistry}%`)
  }

  const { data, error } = await q
  if (error) throw error
  return data ?? []
}

async function searchMeetings(pattern: string, filters?: SearchFilters) {
  let q = supabase
    .from('rvm_meeting')
    .select('id, meeting_date, meeting_type, status, location')
    .or(`location.ilike.${pattern},meeting_type.ilike.${pattern}`)
    .order('meeting_date', { ascending: false })
    .limit(10)

  if (filters?.meetingType) {
    q = q.eq('meeting_type', filters.meetingType as any)
  }
  if (filters?.meetingStatus) {
    q = q.eq('status', filters.meetingStatus as any)
  }
  if (filters?.meetingDateFrom) {
    q = q.gte('meeting_date', filters.meetingDateFrom)
  }
  if (filters?.meetingDateTo) {
    q = q.lte('meeting_date', filters.meetingDateTo)
  }

  const { data, error } = await q
  if (error) throw error
  return data ?? []
}

async function searchAgendaItems(pattern: string, filters?: SearchFilters) {
  let q = supabase
    .from('rvm_agenda_item')
    .select('id, agenda_number, status, title_override, meeting_id, dossier_id, rvm_dossier(title, dossier_number), rvm_meeting(meeting_date)')
    .or(`title_override.ilike.${pattern}`)
    .limit(10)

  if (filters?.agendaStatus) {
    q = q.eq('status', filters.agendaStatus)
  }
  if (filters?.agendaMeetingId) {
    q = q.eq('meeting_id', filters.agendaMeetingId)
  }

  const { data, error } = await q
  if (error) throw error
  return data ?? []
}

async function searchDecisions(pattern: string, filters?: SearchFilters) {
  let q = supabase
    .from('rvm_decision')
    .select('id, decision_text, decision_status, is_final, agenda_item_id, created_at, rvm_agenda_item(agenda_number, meeting_id, rvm_meeting(meeting_date))')
    .ilike('decision_text', pattern)
    .limit(10)

  if (filters?.decisionStatus) {
    q = q.eq('decision_status', filters.decisionStatus)
  }
  if (filters?.decisionDateFrom) {
    q = q.gte('created_at', filters.decisionDateFrom)
  }
  if (filters?.decisionDateTo) {
    q = q.lte('created_at', `${filters.decisionDateTo}T23:59:59`)
  }

  const { data, error } = await q
  if (error) throw error
  return data ?? []
}

async function searchDocuments(pattern: string) {
  const { data, error } = await supabase
    .from('rvm_document')
    .select('id, title, doc_type, dossier_id, confidentiality_level')
    .ilike('title', pattern)
    .limit(10)

  if (error) throw error
  return data ?? []
}
