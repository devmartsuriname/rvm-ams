/**
 * RLS error handler utility
 * Detects Supabase RLS denial errors and returns user-friendly messages.
 */

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

export function getErrorMessage(error: unknown): string {
  if (isRlsError(error)) {
    return 'You do not have permission to perform this action.'
  }

  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>
    const msg = String(err.message ?? '')

    // DB trigger validation errors
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

    if (msg) return msg
  }

  return 'An unexpected error occurred. Please try again.'
}
