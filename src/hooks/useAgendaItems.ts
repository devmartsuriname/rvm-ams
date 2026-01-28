import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { agendaItemService } from '@/services/agendaItemService'

const QUERY_KEY = 'agenda-items'
const MEETINGS_KEY = 'meetings'

/**
 * Fetch agenda items for a meeting
 */
export function useAgendaItems(meetingId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, meetingId],
    queryFn: () => agendaItemService.fetchAgendaItemsByMeeting(meetingId!),
    enabled: !!meetingId,
  })
}

/**
 * Get next agenda number for a meeting
 */
export function useNextAgendaNumber(meetingId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, meetingId, 'next-number'],
    queryFn: () => agendaItemService.getNextAgendaNumber(meetingId!),
    enabled: !!meetingId,
  })
}

/**
 * Add dossier to meeting agenda
 */
export function useAddAgendaItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      meetingId,
      dossierId,
      agendaNumber,
      notes,
    }: {
      meetingId: string
      dossierId: string
      agendaNumber: number
      notes?: string
    }) => agendaItemService.addAgendaItem(meetingId, dossierId, agendaNumber, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.meetingId] })
      queryClient.invalidateQueries({ queryKey: [MEETINGS_KEY, variables.meetingId] })
    },
  })
}

/**
 * Update agenda item
 */
export function useUpdateAgendaItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof agendaItemService.updateAgendaItem>[1] }) =>
      agendaItemService.updateAgendaItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

/**
 * Reorder agenda items
 */
export function useReorderAgendaItems() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      meetingId,
      itemOrder,
    }: {
      meetingId: string
      itemOrder: { id: string; agenda_number: number }[]
    }) => agendaItemService.reorderAgendaItems(meetingId, itemOrder),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.meetingId] })
      queryClient.invalidateQueries({ queryKey: [MEETINGS_KEY, variables.meetingId] })
    },
  })
}

/**
 * Withdraw agenda item
 */
export function useWithdrawAgendaItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => agendaItemService.withdrawAgendaItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}
