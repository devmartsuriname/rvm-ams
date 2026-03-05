/**
 * RLS error handler utility
 * Detects Supabase RLS denial errors and returns user-friendly messages.
 */

import { supabase } from '@/integrations/supabase/client'

const RLS_ERROR_CODES = ['42501']
const RLS_ERROR_PATTERNS = [
  'new row violates row-level security',
  'row-level security',
  'permission denied',
]

export function isRlsError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const err = error as Record<string, unknown>
  const code = String(err.code ?? '')
  const message = String(err.message ?? '').toLowerCase()

  if (RLS_ERROR_CODES.includes(code)) return true
  return RLS_ERROR_PATTERNS.some(p => message.includes(p))
}

/**
 * Fetch the latest violation reason from rvm_illegal_attempt_log.
 * Uses the get_latest_violation RPC (SECURITY DEFINER, accessible to all).
 */
export async function fetchViolationReason(entityType: string, entityId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('get_latest_violation', {
      p_entity_type: entityType,
      p_entity_id: entityId,
    })
    if (error || !data || data.length === 0) return null
    return data[0]?.reason ?? null
  } catch {
    return null
  }
}

/**
 * Handle update result where RETURN NULL pattern may have silently blocked.
 * If 0 rows returned, queries the violation log for the reason.
 */
export async function handleGuardedUpdate<T>(
  result: { data: T[] | null; error: unknown },
  entityType: string,
  entityId: string
): Promise<T> {
  if (result.error) throw result.error

  if (!result.data || result.data.length === 0) {
    // RETURN NULL pattern — mutation was silently blocked
    const reason = await fetchViolationReason(entityType, entityId)
    throw new Error(reason ?? 'Update blocked by governance enforcement. Check permissions and entity state.')
  }

  return result.data[0]
}

export function getErrorMessage(error: unknown): string {
  if (isRlsError(error)) {
    return 'You do not have permission to perform this action.'
  }

  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>
    const msg = String(err.message ?? '')

    // DB trigger violation messages (unified RETURN NULL pattern — Phase 16)
    if (msg.includes('Invalid dossier transition'))
      return 'Invalid status transition for this dossier.'
    if (msg.includes('Invalid meeting transition'))
      return 'Invalid status transition for this meeting.'
    if (msg.includes('Invalid task transition'))
      return 'Invalid status transition for this task.'
    if (msg.includes('Cannot modify entities in locked dossier'))
      return 'This dossier is locked and cannot be modified.'
    if (msg.includes('cannot be in_progress without assigned_user_id'))
      return 'A user must be assigned before setting task to In Progress.'
    if (msg.includes('Cannot modify agenda item in closed meeting'))
      return 'Cannot modify agenda items in a closed meeting.'
    if (msg.includes('Decision cannot be finalized without chair approval'))
      return 'Chair approval is required before finalizing a decision.'

    // RETURN NULL violation reasons (from log — all triggers unified Phase 16)
    if (msg.includes('Cannot modify finalized decision'))
      return 'This decision is finalized and cannot be modified.'
    if (msg.includes('Only chair_rvm may change'))
      return 'Only the Chair may change decision status.'
    if (msg.includes('Invalid decision transition'))
      return 'Invalid status transition for this decision.'
    if (msg.includes('Cannot add versions'))
      return 'Cannot add document versions to a finalized decision.'
    if (msg.includes('Update blocked by governance'))
      return 'Update blocked by governance enforcement.'

    if (msg) return msg
  }

  return 'An unexpected error occurred. Please try again.'
}
