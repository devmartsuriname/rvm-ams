import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

const QUERY_KEY = 'audit-events'

export interface AuditEventFilters {
  entity_type?: string
  event_type?: string
}

/**
 * Fetch audit events — hard-capped at 50 rows, ordered by occurred_at DESC.
 * RLS enforces access: has_role('audit_readonly') OR is_super_admin()
 */
export function useAuditEvents(filters?: AuditEventFilters) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from('audit_event')
        .select('*')
        .order('occurred_at', { ascending: false })
        .limit(50)

      if (filters?.entity_type) {
        query = query.eq('entity_type', filters.entity_type)
      }
      if (filters?.event_type) {
        query = query.eq('event_type', filters.event_type)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}
