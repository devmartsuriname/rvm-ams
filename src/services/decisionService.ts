import { supabase } from '@/integrations/supabase/client'
import type { Tables, TablesInsert, TablesUpdate, Enums } from '@/integrations/supabase/types'
import { handleGuardedUpdate } from '@/utils/rls-error'

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
    const result = await supabase
      .from('rvm_decision')
      .update(data)
      .eq('id', id)
      .select()

    return handleGuardedUpdate(result, 'rvm_decision', id)
  },

  /**
   * Update decision status
   */
  async updateDecisionStatus(id: string, status: DecisionStatus) {
    const result = await supabase
      .from('rvm_decision')
      .update({ decision_status: status })
      .eq('id', id)
      .select()

    return handleGuardedUpdate(result, 'rvm_decision', id)
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
   * Fetch all decisions with agenda item and dossier info
   * Read-only list for the standalone Decisions page
   */
  async fetchAllDecisions() {
    const { data, error } = await supabase
      .from('rvm_decision')
      .select(`
        id,
        decision_text,
        decision_status,
        is_final,
        created_at,
        updated_at,
        chair_approved_at,
        chair_approved_by,
        rvm_agenda_item!inner(
          id,
          agenda_number,
          meeting_id,
          rvm_dossier:dossier_id(id, dossier_number, title, sender_ministry),
          rvm_meeting:meeting_id(id, meeting_date, meeting_type, status)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  /**
   * Record Chair RVM approval (manual recording, no automation)
   * chair_approved_at is set server-side by the set_chair_approval_timestamp trigger
   * (Phase 26C migration). Do NOT add it to this payload.
   */
  async recordChairApproval(id: string, chairUserId: string) {
    const result = await supabase
      .from('rvm_decision')
      .update({
        chair_approved_by: chairUserId,
      })
      .eq('id', id)
      .select()

    return handleGuardedUpdate(result, 'rvm_decision', id)
  },
}
