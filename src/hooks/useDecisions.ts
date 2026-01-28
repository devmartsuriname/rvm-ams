import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { decisionService, type DecisionStatus } from '@/services/decisionService'

const QUERY_KEY = 'decisions'
const AGENDA_KEY = 'agenda-items'
const MEETINGS_KEY = 'meetings'

/**
 * Fetch decision for an agenda item
 */
export function useDecision(agendaItemId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, agendaItemId],
    queryFn: () => decisionService.fetchDecisionByAgendaItem(agendaItemId!),
    enabled: !!agendaItemId,
  })
}

/**
 * Fetch all decisions for a meeting
 */
export function useDecisionsByMeeting(meetingId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, 'meeting', meetingId],
    queryFn: () => decisionService.fetchDecisionsByMeeting(meetingId!),
    enabled: !!meetingId,
  })
}

/**
 * Create decision for an agenda item
 */
export function useCreateDecision() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      agendaItemId,
      decisionText,
      status,
    }: {
      agendaItemId: string
      decisionText: string
      status?: DecisionStatus
    }) => decisionService.createDecision(agendaItemId, decisionText, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [AGENDA_KEY] })
      queryClient.invalidateQueries({ queryKey: [MEETINGS_KEY] })
    },
  })
}

/**
 * Update decision
 */
export function useUpdateDecision() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof decisionService.updateDecision>[1] }) =>
      decisionService.updateDecision(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [AGENDA_KEY] })
    },
  })
}

/**
 * Update decision status
 */
export function useUpdateDecisionStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: DecisionStatus }) =>
      decisionService.updateDecisionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [AGENDA_KEY] })
    },
  })
}

/**
 * Record Chair RVM approval (manual recording only)
 * NOTE: This does NOT auto-finalize. Chair gate is Phase 5.
 */
export function useRecordChairApproval() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, chairUserId }: { id: string; chairUserId: string }) =>
      decisionService.recordChairApproval(id, chairUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [AGENDA_KEY] })
    },
  })
}
