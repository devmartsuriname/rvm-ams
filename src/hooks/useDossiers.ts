import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dossierService, type DossierFilters, type DossierStatus, type ServiceType, type UrgencyLevel } from '@/services/dossierService'
import type { Enums } from '@/integrations/supabase/types'

const QUERY_KEY = 'dossiers'

/**
 * Fetch dossiers with optional filters
 */
export function useDossiers(filters?: DossierFilters) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => dossierService.fetchDossiers(filters),
  })
}

/**
 * Fetch single dossier by ID
 */
export function useDossier(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => dossierService.fetchDossierById(id!),
    enabled: !!id,
  })
}

/**
 * Fetch dossiers eligible for agenda scheduling
 */
export function useAgendaEligibleDossiers() {
  return useQuery({
    queryKey: [QUERY_KEY, 'agenda-eligible'],
    queryFn: () => dossierService.fetchAgendaEligibleDossiers(),
  })
}

/**
 * Create new dossier mutation
 */
export function useCreateDossier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      dossier: {
        title: string
        service_type: ServiceType
        sender_ministry: string
        proposal_subtype?: Enums<'proposal_subtype'> | null
        missive_keyword_id?: string | null
        urgency?: UrgencyLevel | null
        confidentiality_level?: Enums<'confidentiality_level'> | null
        summary?: string | null
        created_by?: string | null
      }
      item?: {
        description?: string | null
        reference_code?: string | null
        received_date?: string | null
        attachments_expected?: boolean | null
      }
    }) => dossierService.createDossier(data.dossier, data.item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

/**
 * Update dossier mutation
 */
export function useUpdateDossier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof dossierService.updateDossier>[1] }) =>
      dossierService.updateDossier(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] })
    },
  })
}

/**
 * Update dossier status mutation
 */
export function useUpdateDossierStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: DossierStatus }) =>
      dossierService.updateDossierStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] })
    },
  })
}
