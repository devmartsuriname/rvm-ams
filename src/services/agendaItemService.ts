import { supabase } from '@/integrations/supabase/client'
import type { Tables, TablesInsert, TablesUpdate, Enums } from '@/integrations/supabase/types'

export type AgendaItem = Tables<'rvm_agenda_item'>
export type AgendaItemInsert = TablesInsert<'rvm_agenda_item'>
export type AgendaItemUpdate = TablesUpdate<'rvm_agenda_item'>
export type AgendaItemStatus = Enums<'agenda_item_status'>

export type AgendaItemWithDossier = AgendaItem & {
  rvm_dossier: {
    id: string
    dossier_number: string
    title: string
    service_type: Enums<'service_type'>
    urgency: Enums<'urgency_level'> | null
  } | null
  rvm_decision: {
    id: string
    decision_status: Enums<'decision_status'> | null
    is_final: boolean | null
  } | null
}

/**
 * Agenda Item Service - CRUD operations aligned with RLS permissions
 * INSERT: secretary_rvm, admin_agenda
 * UPDATE: secretary_rvm, admin_agenda
 * SELECT: All RVM roles
 */
export const agendaItemService = {
  /**
   * Fetch agenda items for a meeting
   */
  async fetchAgendaItemsByMeeting(meetingId: string) {
    const { data, error } = await supabase
      .from('rvm_agenda_item')
      .select(`
        *,
        rvm_dossier:dossier_id(id, dossier_number, title, service_type, urgency),
        rvm_decision(id, decision_status, is_final)
      `)
      .eq('meeting_id', meetingId)
      .order('agenda_number', { ascending: true })

    if (error) throw error
    return data as AgendaItemWithDossier[]
  },

  /**
   * Add dossier to meeting agenda
   * Requires: secretary_rvm or admin_agenda role
   */
  async addAgendaItem(meetingId: string, dossierId: string, agendaNumber: number, notes?: string) {
    const { data, error } = await supabase
      .from('rvm_agenda_item')
      .insert({
        meeting_id: meetingId,
        dossier_id: dossierId,
        agenda_number: agendaNumber,
        status: 'scheduled',
        notes,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Update agenda item
   */
  async updateAgendaItem(id: string, data: AgendaItemUpdate) {
    const { data: updated, error } = await supabase
      .from('rvm_agenda_item')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return updated
  },

  /**
   * Reorder agenda items for a meeting
   * Updates agenda_number for each item
   */
  async reorderAgendaItems(meetingId: string, itemOrder: { id: string; agenda_number: number }[]) {
    const updates = itemOrder.map(item =>
      supabase
        .from('rvm_agenda_item')
        .update({ agenda_number: item.agenda_number })
        .eq('id', item.id)
        .eq('meeting_id', meetingId)
    )

    const results = await Promise.all(updates)
    const errors = results.filter(r => r.error)
    if (errors.length > 0) {
      throw errors[0].error
    }

    return true
  },

  /**
   * Withdraw agenda item (set status to withdrawn)
   * Items are not deleted, only marked as withdrawn
   */
  async withdrawAgendaItem(id: string) {
    const { data, error } = await supabase
      .from('rvm_agenda_item')
      .update({ status: 'withdrawn' })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Get next agenda number for a meeting
   */
  async getNextAgendaNumber(meetingId: string) {
    const { data, error } = await supabase
      .from('rvm_agenda_item')
      .select('agenda_number')
      .eq('meeting_id', meetingId)
      .order('agenda_number', { ascending: false })
      .limit(1)

    if (error) throw error
    return (data?.[0]?.agenda_number ?? 0) + 1
  },
}
