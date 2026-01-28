import { supabase } from '@/integrations/supabase/client'
import type { Tables, TablesInsert, TablesUpdate, Enums } from '@/integrations/supabase/types'

export type Meeting = Tables<'rvm_meeting'>
export type MeetingInsert = TablesInsert<'rvm_meeting'>
export type MeetingUpdate = TablesUpdate<'rvm_meeting'>
export type MeetingStatus = Enums<'meeting_status'>
export type MeetingType = Enums<'meeting_type'>

export type MeetingWithAgenda = Meeting & {
  rvm_agenda_item: Tables<'rvm_agenda_item'>[]
}

export type MeetingFilters = {
  status?: MeetingStatus
  meeting_type?: MeetingType
  from_date?: string
  to_date?: string
}

/**
 * Meeting Service - CRUD operations aligned with RLS permissions
 * INSERT: secretary_rvm, admin_agenda
 * UPDATE: secretary_rvm, admin_agenda (when not closed)
 * SELECT: All RVM roles
 */
export const meetingService = {
  /**
   * Fetch meetings with optional filters
   */
  async fetchMeetings(filters?: MeetingFilters) {
    let query = supabase
      .from('rvm_meeting')
      .select('*')
      .order('meeting_date', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.meeting_type) {
      query = query.eq('meeting_type', filters.meeting_type)
    }
    if (filters?.from_date) {
      query = query.gte('meeting_date', filters.from_date)
    }
    if (filters?.to_date) {
      query = query.lte('meeting_date', filters.to_date)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  /**
   * Fetch single meeting with agenda items
   */
  async fetchMeetingById(id: string) {
    const { data, error } = await supabase
      .from('rvm_meeting')
      .select(`
        *,
        rvm_agenda_item(
          *,
          rvm_dossier:dossier_id(id, dossier_number, title, service_type, urgency),
          rvm_decision(id, decision_status, is_final)
        )
      `)
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    return data
  },

  /**
   * Create new meeting
   * Requires: secretary_rvm or admin_agenda role
   */
  async createMeeting(data: Omit<MeetingInsert, 'id' | 'created_at'>) {
    const { data: meeting, error } = await supabase
      .from('rvm_meeting')
      .insert({
        ...data,
        status: 'draft',
      })
      .select()
      .single()

    if (error) throw error
    return meeting
  },

  /**
   * Update meeting
   * RLS prevents update if status is closed
   */
  async updateMeeting(id: string, data: MeetingUpdate) {
    const { data: updated, error } = await supabase
      .from('rvm_meeting')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return updated
  },

  /**
   * Update meeting status
   * Valid transitions: draft → published → closed
   */
  async updateMeetingStatus(id: string, status: MeetingStatus) {
    const { data: updated, error } = await supabase
      .from('rvm_meeting')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return updated
  },

  /**
   * Fetch upcoming meetings (draft or published, future dates)
   */
  async fetchUpcomingMeetings() {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('rvm_meeting')
      .select('*')
      .in('status', ['draft', 'published'])
      .gte('meeting_date', today)
      .order('meeting_date', { ascending: true })

    if (error) throw error
    return data
  },
}
