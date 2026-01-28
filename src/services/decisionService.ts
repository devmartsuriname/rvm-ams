import { supabase } from '@/integrations/supabase/client'
import type { Tables, TablesInsert, TablesUpdate, Enums } from '@/integrations/supabase/types'

export type Decision = Tables<'rvm_decision'>
export type DecisionInsert = TablesInsert<'rvm_decision'>
export type DecisionUpdate = TablesUpdate<'rvm_decision'>
export type DecisionStatus = Enums<'decision_status'>

/**
 * Decision Service - CRUD operations aligned with RLS permissions
 * INSERT: secretary_rvm, admin_reporting
 * UPDATE: secretary_rvm (when not final), chair_rvm (for finalization)
 * SELECT: chair_rvm, secretary_rvm, deputy_secretary, admin_reporting, audit_readonly
 * 
 * NOTE: This service handles decision RECORDING only.
 * Decision automation and Chair RVM approval gate are deferred to Phase 5.
 */
export const decisionService = {
  /**
   * Fetch decision for an agenda item
   */
  async fetchDecisionByAgendaItem(agendaItemId: string) {
    const { data, error } = await supabase
      .from('rvm_decision')
      .select('*')
      .eq('agenda_item_id', agendaItemId)
      .maybeSingle()

    if (error) throw error
    return data
  },

  /**
   * Create draft decision for an agenda item
   * Requires: secretary_rvm or admin_reporting role
   */
  async createDecision(agendaItemId: string, decisionText: string, status: DecisionStatus = 'pending') {
    const { data, error } = await supabase
      .from('rvm_decision')
      .insert({
        agenda_item_id: agendaItemId,
        decision_text: decisionText,
        decision_status: status,
        is_final: false,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Update decision
   * RLS enforces: secretary_rvm can update when not final
   */
  async updateDecision(id: string, data: DecisionUpdate) {
    const { data: updated, error } = await supabase
      .from('rvm_decision')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return updated
  },

  /**
   * Update decision status
   */
  async updateDecisionStatus(id: string, status: DecisionStatus) {
    const { data, error } = await supabase
      .from('rvm_decision')
      .update({ decision_status: status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Get all decisions for a meeting
   * Joins through agenda_item to meeting
   */
  async fetchDecisionsByMeeting(meetingId: string) {
    const { data, error } = await supabase
      .from('rvm_decision')
      .select(`
        *,
        rvm_agenda_item!inner(
          id,
          agenda_number,
          meeting_id,
          rvm_dossier:dossier_id(id, dossier_number, title)
        )
      `)
      .eq('rvm_agenda_item.meeting_id', meetingId)
      .order('rvm_agenda_item(agenda_number)', { ascending: true })

    if (error) throw error
    return data
  },

  /**
   * Record Chair RVM approval (manual recording, no automation)
   * NOTE: This does NOT auto-finalize. Chair gate enforcement is Phase 5.
   * This method is for RECORDING that approval was given.
   */
  async recordChairApproval(id: string, chairUserId: string) {
    const { data, error } = await supabase
      .from('rvm_decision')
      .update({
        chair_approved_by: chairUserId,
        chair_approved_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },
}
