import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { meetingService, type MeetingFilters, type MeetingStatus, type MeetingType } from '@/services/meetingService'

const QUERY_KEY = 'meetings'

/**
 * Fetch meetings with optional filters
 */
export function useMeetings(filters?: MeetingFilters) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => meetingService.fetchMeetings(filters),
  })
}

/**
 * Fetch single meeting by ID with agenda items
 */
export function useMeeting(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => meetingService.fetchMeetingById(id!),
    enabled: !!id,
  })
}

/**
 * Fetch upcoming meetings
 */
export function useUpcomingMeetings() {
  return useQuery({
    queryKey: [QUERY_KEY, 'upcoming'],
    queryFn: () => meetingService.fetchUpcomingMeetings(),
  })
}

/**
 * Create new meeting mutation
 */
export function useCreateMeeting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      meeting_date: string
      meeting_type?: MeetingType | null
      location?: string | null
      created_by?: string | null
    }) => meetingService.createMeeting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

/**
 * Update meeting mutation
 */
export function useUpdateMeeting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof meetingService.updateMeeting>[1] }) =>
      meetingService.updateMeeting(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] })
    },
  })
}

/**
 * Update meeting status mutation
 */
export function useUpdateMeetingStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: MeetingStatus }) =>
      meetingService.updateMeetingStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] })
    },
  })
}
